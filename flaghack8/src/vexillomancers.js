import * as THREE from 'three';
import {
    VEXILLOMANCER_TYPES, MAX_VEXILLOMANCERS,
    PLAYER_PICKUP_RANGE, WORLD_SIZE,
} from './constants.js';
import { fixFoop, alignFlag } from './flags.js';

export function createVexillomancer(scene, type, x, z) {
    const config = VEXILLOMANCER_TYPES[type];
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.2, 6);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: config.color, roughness: 0.7,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.15, 6, 6);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.35;
    group.add(head);

    // Skill indicator (small colored orb above head)
    const orbGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const orbMat = new THREE.MeshBasicMaterial({
        color: config.color, blending: THREE.AdditiveBlending,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 1.6;
    group.add(orb);

    group.position.set(x, 0, z);
    scene.add(group);

    return {
        mesh: group,
        orb,
        type,
        config,
        speed: config.speed,
        state: 'idle', // idle, seeking, working, returning
        target: null,
        workTimer: 0,
        carryingFlag: null,
    };
}

export function updateVexillomancers(vexillomancers, flags, leyFacets, scene, dt, time) {
    for (const v of vexillomancers) {
        // Orb bob
        v.orb.position.y = 1.6 + Math.sin(time * 3 + v.mesh.position.x) * 0.1;

        switch (v.config.skill) {
            case 'find':
                updateSeeker(v, flags, dt);
                break;
            case 'move':
                updateMover(v, flags, dt);
                break;
            case 'align':
                updateAligner(v, flags, leyFacets, dt);
                break;
            case 'survey':
                updateSurveyor(v, leyFacets, dt, time, scene);
                break;
        }
    }
}

function moveToward(v, targetX, targetZ, dt) {
    const dx = targetX - v.mesh.position.x;
    const dz = targetZ - v.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 1) return true; // arrived

    const nx = dx / dist;
    const nz = dz / dist;
    v.mesh.position.x += nx * v.speed * dt;
    v.mesh.position.z += nz * v.speed * dt;
    v.mesh.rotation.y = Math.atan2(nx, nz);
    return false;
}

function findNearestFoop(v, flags) {
    let nearest = null;
    let nearDist = Infinity;
    for (const f of flags) {
        if (!f.isFoop || f.foopFixed || f.assignedWorker) continue;
        const dx = f.x - v.mesh.position.x;
        const dz = f.z - v.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < nearDist) {
            nearDist = dist;
            nearest = f;
        }
    }
    return nearest;
}

function findNearestUnaligned(v, flags) {
    let nearest = null;
    let nearDist = Infinity;
    for (const f of flags) {
        if (f.isFoop || f.isAligned || f.assignedWorker) continue;
        const dx = f.x - v.mesh.position.x;
        const dz = f.z - v.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < nearDist) {
            nearDist = dist;
            nearest = f;
        }
    }
    return nearest;
}

// ── Seeker: finds FOOPs and marks them ──
function updateSeeker(v, flags, dt) {
    if (v.state === 'idle') {
        const foop = findNearestFoop(v, flags);
        if (foop) {
            v.target = foop;
            foop.assignedWorker = v;
            v.state = 'seeking';
        } else {
            // Wander
            if (!v._wanderTarget || Math.random() < 0.01) {
                v._wanderTarget = {
                    x: (Math.random() - 0.5) * WORLD_SIZE * 0.6,
                    z: (Math.random() - 0.5) * WORLD_SIZE * 0.6,
                };
            }
            moveToward(v, v._wanderTarget.x, v._wanderTarget.z, dt);
        }
    } else if (v.state === 'seeking') {
        if (!v.target || v.target.foopFixed) {
            v.state = 'idle';
            v.target = null;
            return;
        }
        const arrived = moveToward(v, v.target.x, v.target.z, dt);
        if (arrived) {
            v.state = 'working';
            v.workTimer = 1.5;
        }
    } else if (v.state === 'working') {
        v.workTimer -= dt;
        if (v.workTimer <= 0) {
            if (v.target) {
                fixFoop(v.target);
                v.target.assignedWorker = null;
            }
            v.target = null;
            v.state = 'idle';
        }
    }
}

// ── Mover: picks up and relocates flags ──
function updateMover(v, flags, dt) {
    if (v.state === 'idle') {
        // Find a fixed but unaligned flag that could be better positioned
        const foop = findNearestFoop(v, flags);
        if (foop) {
            v.target = foop;
            foop.assignedWorker = v;
            v.state = 'seeking';
        }
    } else if (v.state === 'seeking') {
        if (!v.target || v.target.foopFixed) {
            if (v.target) v.target.assignedWorker = null;
            v.state = 'idle';
            v.target = null;
            return;
        }
        const arrived = moveToward(v, v.target.x, v.target.z, dt);
        if (arrived) {
            // Fix the FOOP in place
            fixFoop(v.target);
            if (v.target) v.target.assignedWorker = null;
            v.target = null;
            v.state = 'idle';
        }
    }
}

// ── Aligner: aligns flags to ley facets ──
function updateAligner(v, flags, leyFacets, dt) {
    if (v.state === 'idle') {
        const unaligned = findNearestUnaligned(v, flags);
        if (unaligned) {
            v.target = unaligned;
            unaligned.assignedWorker = v;
            v.state = 'seeking';
        }
    } else if (v.state === 'seeking') {
        if (!v.target || v.target.isAligned) {
            if (v.target) v.target.assignedWorker = null;
            v.state = 'idle';
            v.target = null;
            return;
        }
        const arrived = moveToward(v, v.target.x, v.target.z, dt);
        if (arrived) {
            v.state = 'working';
            v.workTimer = 2;
        }
    } else if (v.state === 'working') {
        v.workTimer -= dt;
        if (v.workTimer <= 0) {
            if (v.target) {
                alignFlag(v.target, leyFacets);
                v.target.assignedWorker = null;
            }
            v.target = null;
            v.state = 'idle';
        }
    }
}

// ── Surveyor: reveals ley facet lines in area ──
function updateSurveyor(v, leyFacets, dt, time, scene) {
    if (v.state === 'idle') {
        // Patrol along ley facet lines
        if (!v._patrolFacet || Math.random() < 0.005) {
            v._patrolFacet = Math.floor(Math.random() * leyFacets.length);
            v._patrolDist = (Math.random() - 0.5) * WORLD_SIZE * 0.4;
        }
        const facet = leyFacets[v._patrolFacet];
        if (facet) {
            const tx = facet.origin.x + facet.dir.x * v._patrolDist;
            const tz = facet.origin.z + facet.dir.z * v._patrolDist;
            moveToward(v, tx, tz, dt);
        }
    }

    // Surveyors passively make nearby ley lines more visible
    // (handled in main.js via proximity checks)
}

export function removeVexillomancer(v, scene) {
    if (v.target) v.target.assignedWorker = null;
    scene.remove(v.mesh);
}

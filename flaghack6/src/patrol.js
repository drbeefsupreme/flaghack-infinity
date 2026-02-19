import * as THREE from 'three';
import {
    PATROL_BASE_SIZE, PATROL_SIZE_PER_HEAT, PATROL_SPEED,
    PATROL_DAMAGE, PATROL_ATTACK_RANGE, PATROL_DESTROY_RANGE,
    PATROL_SEARCH_DURATION, WORLD_SIZE
} from './constants.js';
import { destroyBuilding } from './buildings.js';

export function createPatrolSystem() {
    return {
        patrols: [],
        raidTimer: 0,
        raidActive: false,
    };
}

function createPatrolMesh(count) {
    const group = new THREE.Group();

    for (let i = 0; i < count; i++) {
        const soldier = new THREE.Group();
        // Red uniform body
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 1.4, 6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x882222, roughness: 0.8 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.7;
        body.castShadow = true;
        soldier.add(body);

        // Helmet
        const helmetGeo = new THREE.SphereGeometry(0.2, 6, 6);
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.y = 1.5;
        soldier.add(helmet);

        // Red visor glow
        const visorGeo = new THREE.PlaneGeometry(0.15, 0.05);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.48, 0.2);
        soldier.add(visor);

        // Offset in formation
        const angle = (i / count) * Math.PI * 2;
        const radius = count > 1 ? 1.5 : 0;
        soldier.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        group.add(soldier);
    }

    // Red patrol light
    const light = new THREE.PointLight(0xff2222, 1.5, 15);
    light.position.y = 2;
    group.add(light);

    return group;
}

export function spawnPatrol(patrolSystem, scene, heat, targetPos) {
    const count = Math.max(PATROL_BASE_SIZE, Math.floor(PATROL_BASE_SIZE + heat * PATROL_SIZE_PER_HEAT));

    // Spawn from edge of world
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = WORLD_SIZE * 0.9;
    const spawnPos = new THREE.Vector3(
        Math.cos(angle) * spawnDist,
        0,
        Math.sin(angle) * spawnDist
    );

    const mesh = createPatrolMesh(Math.min(count, 8));
    mesh.position.copy(spawnPos);
    scene.add(mesh);

    const patrol = {
        mesh,
        position: spawnPos.clone(),
        target: targetPos.clone(),
        count,
        speed: PATROL_SPEED,
        state: 'approach', // approach, search, destroy, retreat
        searchTimer: PATROL_SEARCH_DURATION,
        attackTimer: 0,
    };
    patrolSystem.patrols.push(patrol);
    return patrol;
}

export function updatePatrols(patrolSystem, scene, buildSystem, player, dt, time) {
    const playerPos = player.mesh.position;

    for (let i = patrolSystem.patrols.length - 1; i >= 0; i--) {
        const p = patrolSystem.patrols[i];
        const pos = p.mesh.position;

        switch (p.state) {
            case 'approach': {
                // Check if decoys redirect patrol
                const decoys = buildSystem.buildings.filter(b => b.type === 'decoy' && b.hp > 0);
                let target = p.target;
                let minDecoyDist = Infinity;
                for (const d of decoys) {
                    const dd = pos.distanceTo(d.position);
                    if (dd < 30 && dd < minDecoyDist) {
                        target = d.position;
                        minDecoyDist = dd;
                    }
                }

                const dx = target.x - pos.x;
                const dz = target.z - pos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist < 5) {
                    p.state = 'search';
                } else {
                    pos.x += (dx / dist) * p.speed * dt;
                    pos.z += (dz / dist) * p.speed * dt;
                    p.mesh.rotation.y = Math.atan2(dx, dz);
                }
                break;
            }

            case 'search': {
                p.searchTimer -= dt;

                // Destroy nearby buildings
                for (const b of [...buildSystem.buildings]) {
                    const dist = pos.distanceTo(b.position);
                    if (dist < PATROL_DESTROY_RANGE + (b.type === 'decoy' ? 5 : 0)) {
                        b.hp -= PATROL_DAMAGE * dt;
                        if (b.hp <= 0) {
                            destroyBuilding(buildSystem, scene, b);
                        }
                    }
                }

                // Wander in search pattern
                const wanderAngle = time * 0.5 + i * 2;
                pos.x += Math.cos(wanderAngle) * 3 * dt;
                pos.z += Math.sin(wanderAngle) * 3 * dt;

                if (p.searchTimer <= 0) {
                    p.state = 'retreat';
                }
                break;
            }

            case 'retreat': {
                // Leave the map
                const angle = Math.atan2(pos.z, pos.x);
                pos.x += Math.cos(angle) * p.speed * 1.5 * dt;
                pos.z += Math.sin(angle) * p.speed * 1.5 * dt;

                if (Math.abs(pos.x) > WORLD_SIZE || Math.abs(pos.z) > WORLD_SIZE) {
                    scene.remove(p.mesh);
                    patrolSystem.patrols.splice(i, 1);
                }
                break;
            }
        }

        // Walking animation
        if (p.state !== 'retreat') {
            const bob = Math.sin(time * 6 + i) * 0.05;
            pos.y = bob;
        }
    }
}

export function isPatrolNear(patrolSystem, position, range) {
    return patrolSystem.patrols.some(p =>
        p.mesh.position.distanceTo(position) < range
    );
}

export function getActivePatrolCount(patrolSystem) {
    return patrolSystem.patrols.length;
}

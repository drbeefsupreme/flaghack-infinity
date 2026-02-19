import * as THREE from 'three';
import {
    SIGNIFIER_SPEED, SIGNIFIER_GATHER_RATE, SIGNIFIER_MAX,
    SIGNIFIER_SPAWN_INTERVAL, SIGNIFIER_RECRUIT_RANGE, WORLD_SIZE
} from './constants.js';

export function createSignifierSystem() {
    return {
        recruited: [],       // working for you
        wandering: [],       // NPCs in the world available to recruit
        spawnTimer: 15,      // first wanderer spawns quickly
        totalRecruited: 0,
    };
}

function createSignifierMesh(isRecruited) {
    const group = new THREE.Group();

    // Simple robed figure
    const robeGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.4, 6);
    const robeColor = isRecruited ? 0x4a3a1a : 0x555544;
    const robeMat = new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.85 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.7;
    robe.castShadow = true;
    group.add(robe);

    // Head
    const headGeo = new THREE.SphereGeometry(0.15, 6, 6);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.5;
    group.add(head);

    if (isRecruited) {
        // Yellow armband
        const bandGeo = new THREE.TorusGeometry(0.15, 0.025, 4, 6);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.position.set(0.3, 1.0, 0);
        band.rotation.z = Math.PI / 2;
        group.add(band);
    } else {
        // Question mark above head (exclamation for quest-givers)
        const markGeo = new THREE.SphereGeometry(0.1, 4, 4);
        const markMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const mark = new THREE.Mesh(markGeo, markMat);
        mark.position.y = 2;
        group.add(mark);
    }

    return group;
}

export function updateSignifiers(sigSystem, scene, buildSystem, player, inventory, dt, time) {
    // Spawn wandering NPCs
    sigSystem.spawnTimer -= dt;
    if (sigSystem.spawnTimer <= 0 && sigSystem.wandering.length < 3) {
        sigSystem.spawnTimer = SIGNIFIER_SPAWN_INTERVAL;

        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * (WORLD_SIZE * 0.5);
        const pos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

        const mesh = createSignifierMesh(false);
        mesh.position.copy(pos);
        scene.add(mesh);

        sigSystem.wandering.push({
            mesh,
            position: pos.clone(),
            wanderTarget: pos.clone(),
            wanderTimer: 0,
        });
    }

    // Update wandering NPCs
    for (const w of sigSystem.wandering) {
        w.wanderTimer -= dt;
        if (w.wanderTimer <= 0) {
            w.wanderTimer = 3 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            const dist = 5 + Math.random() * 10;
            w.wanderTarget = w.position.clone().add(
                new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist)
            );
        }

        const dx = w.wanderTarget.x - w.mesh.position.x;
        const dz = w.wanderTarget.z - w.mesh.position.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d > 1) {
            w.mesh.position.x += (dx / d) * 4 * dt;
            w.mesh.position.z += (dz / d) * 4 * dt;
            w.mesh.rotation.y = Math.atan2(dx, dz);
        }
        w.position.copy(w.mesh.position);
    }

    // Update recruited signifiers (auto-gather resources near sanctuary)
    for (const r of sigSystem.recruited) {
        // Assign to nearest building needing help or gathering
        if (!r.task) {
            // Wander near sanctuary
            r.wanderTimer -= dt;
            if (r.wanderTimer <= 0) {
                r.wanderTimer = 2 + Math.random() * 4;
                if (buildSystem.buildings.length > 0) {
                    const target = buildSystem.buildings[Math.floor(Math.random() * buildSystem.buildings.length)];
                    r.wanderTarget = target.position.clone().add(
                        new THREE.Vector3((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 6)
                    );
                }
            }

            if (r.wanderTarget) {
                const dx = r.wanderTarget.x - r.mesh.position.x;
                const dz = r.wanderTarget.z - r.mesh.position.z;
                const d = Math.sqrt(dx * dx + dz * dz);
                if (d > 1) {
                    r.mesh.position.x += (dx / d) * SIGNIFIER_SPEED * dt;
                    r.mesh.position.z += (dz / d) * SIGNIFIER_SPEED * dt;
                    r.mesh.rotation.y = Math.atan2(dx, dz);
                }
            }
        }

        // Passive resource generation
        r.gatherTimer -= dt;
        if (r.gatherTimer <= 0) {
            r.gatherTimer = 1 / SIGNIFIER_GATHER_RATE;
            // Small chance to find resources
            const roll = Math.random();
            if (roll < 0.3) inventory.wood = (inventory.wood || 0) + 1;
            else if (roll < 0.5) inventory.cloth = (inventory.cloth || 0) + 1;
        }

        r.position.copy(r.mesh.position);
        r.mesh.position.y = 0;
    }
}

export function recruitSignifier(sigSystem, scene, playerPos) {
    if (sigSystem.recruited.length >= SIGNIFIER_MAX) return null;

    for (let i = sigSystem.wandering.length - 1; i >= 0; i--) {
        const w = sigSystem.wandering[i];
        const dist = playerPos.distanceTo(w.position);
        if (dist < SIGNIFIER_RECRUIT_RANGE) {
            // Convert to recruited
            scene.remove(w.mesh);
            sigSystem.wandering.splice(i, 1);

            const mesh = createSignifierMesh(true);
            mesh.position.copy(w.position);
            scene.add(mesh);

            const recruited = {
                mesh,
                position: w.position.clone(),
                task: null,
                wanderTarget: null,
                wanderTimer: 0,
                gatherTimer: 0,
            };
            sigSystem.recruited.push(recruited);
            sigSystem.totalRecruited++;
            return recruited;
        }
    }
    return null;
}

export function getNearWandering(sigSystem, position, range) {
    return sigSystem.wandering.find(w => w.position.distanceTo(position) < range);
}

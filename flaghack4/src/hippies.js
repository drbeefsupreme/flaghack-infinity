import * as THREE from 'three';
import {
    HIPPIE_BASE_SPEED, HIPPIE_HP, HIPPIE_DAMAGE, HIPPIE_ATTACK_RANGE,
    HIPPIE_ATTACK_COOLDOWN, HIPPIE_EFFIGY_DAMAGE, HIPPIE_STEAL_CHANCE,
    HIPPIE_STINK_RADIUS, SPAWN_RING_RADIUS, SPAWN_RING_VARIANCE,
    SCORE_HIPPIE_KILL, EFFIGY_RADIUS
} from './constants.js';

const stinkMat = new THREE.MeshBasicMaterial({
    color: 0x44aa44,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
});

function createHippieMesh() {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.2, 6);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x664422,
        roughness: 0.9,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 6, 6);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xcc9966 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.35;
    head.castShadow = true;
    group.add(head);

    // Dreadlocks (small cylinders)
    for (let i = 0; i < 5; i++) {
        const dreadGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.3, 4);
        const dreadMat = new THREE.MeshStandardMaterial({ color: 0x442211 });
        const dread = new THREE.Mesh(dreadGeo, dreadMat);
        const angle = (i / 5) * Math.PI * 2;
        dread.position.set(Math.cos(angle) * 0.15, 1.25, Math.sin(angle) * 0.15);
        dread.rotation.x = Math.cos(angle) * 0.5;
        dread.rotation.z = Math.sin(angle) * 0.5;
        group.add(dread);
    }

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 4);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xcc9966 });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.35, 0.9, 0);
    leftArm.rotation.z = 0.3;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.35, 0.9, 0);
    rightArm.rotation.z = -0.3;
    group.add(rightArm);

    // Stink cloud (visible ring)
    const stinkGeo = new THREE.RingGeometry(0.5, HIPPIE_STINK_RADIUS * 0.3, 16);
    const stink = new THREE.Mesh(stinkGeo, stinkMat);
    stink.rotation.x = -Math.PI / 2;
    stink.position.y = 0.1;
    group.add(stink);

    group.userData.body = body;
    group.userData.leftArm = leftArm;
    group.userData.rightArm = rightArm;
    return group;
}

export function createHippieSystem() {
    return {
        hippies: [],
        spawnQueue: 0,
        spawnTimer: 0,
        spawnInterval: 0.5,
    };
}

export function spawnHippie(hippieSystem, scene, count) {
    hippieSystem.spawnQueue += count;
}

export function updateHippies(hippieSystem, scene, effigy, player, flagSystem, leySystem, gameState, dt, time) {
    // Process spawn queue
    if (hippieSystem.spawnQueue > 0) {
        hippieSystem.spawnTimer -= dt;
        if (hippieSystem.spawnTimer <= 0) {
            hippieSystem.spawnTimer = hippieSystem.spawnInterval;
            hippieSystem.spawnQueue--;

            const angle = Math.random() * Math.PI * 2;
            const radius = SPAWN_RING_RADIUS + (Math.random() - 0.5) * SPAWN_RING_VARIANCE * 2;
            const mesh = createHippieMesh();
            mesh.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );

            const waveMultiplier = 1 + (gameState.wave - 1) * 0.15;
            const hippie = {
                mesh,
                hp: HIPPIE_HP * waveMultiplier,
                maxHp: HIPPIE_HP * waveMultiplier,
                speed: HIPPIE_BASE_SPEED * (1 + (gameState.wave - 1) * 0.05),
                state: 'approach_effigy', // approach_effigy, attack_effigy, chase_player, steal_flag, flee
                attackTimer: 0,
                target: null,
                stolenFlags: 0,
                psychosis: 0,
                dirtiness: Math.random(),
                flashTimer: 0,
            };
            scene.add(mesh);
            hippieSystem.hippies.push(hippie);
        }
    }

    const effigyPos = effigy.position;
    const playerPos = player.mesh.position;
    const deadIndices = [];

    for (let i = 0; i < hippieSystem.hippies.length; i++) {
        const h = hippieSystem.hippies[i];
        const pos = h.mesh.position;

        // State machine
        switch (h.state) {
            case 'approach_effigy': {
                // Walk toward effigy
                const dx = effigyPos.x - pos.x;
                const dz = effigyPos.z - pos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist < EFFIGY_RADIUS + HIPPIE_ATTACK_RANGE) {
                    h.state = 'attack_effigy';
                } else {
                    // Check if near a flag to steal
                    if (h.stolenFlags < 2 && Math.random() < HIPPIE_STEAL_CHANCE * dt) {
                        const nearFlag = findNearestGroundFlag(flagSystem, pos, 10);
                        if (nearFlag) {
                            h.target = nearFlag;
                            h.state = 'steal_flag';
                            break;
                        }
                    }

                    const speed = h.speed * dt;
                    pos.x += (dx / dist) * speed;
                    pos.z += (dz / dist) * speed;
                    h.mesh.rotation.y = Math.atan2(dx, dz);
                }
                break;
            }

            case 'attack_effigy': {
                h.attackTimer -= dt;
                if (h.attackTimer <= 0) {
                    h.attackTimer = HIPPIE_ATTACK_COOLDOWN;
                    const destroyed = damageEffigyFn(effigy, HIPPIE_EFFIGY_DAMAGE);
                    if (destroyed) {
                        gameState.effigyDestroyed = true;
                    }
                }
                // Face effigy
                h.mesh.rotation.y = Math.atan2(
                    effigyPos.x - pos.x,
                    effigyPos.z - pos.z
                );
                break;
            }

            case 'steal_flag': {
                if (!h.target || !flagSystem.groundFlags.includes(h.target)) {
                    h.state = 'approach_effigy';
                    break;
                }
                const flagPos = h.target.position;
                const dx = flagPos.x - pos.x;
                const dz = flagPos.z - pos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist < 2) {
                    // Steal the flag
                    removeGroundFlag(flagSystem, scene, h.target);
                    h.stolenFlags++;
                    h.target = null;
                    h.state = 'approach_effigy';
                } else {
                    const speed = h.speed * 1.2 * dt;
                    pos.x += (dx / dist) * speed;
                    pos.z += (dz / dist) * speed;
                    h.mesh.rotation.y = Math.atan2(dx, dz);
                }
                break;
            }

            case 'flee': {
                const dx = pos.x - effigyPos.x;
                const dz = pos.z - effigyPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > SPAWN_RING_RADIUS) {
                    deadIndices.push(i);
                } else {
                    const speed = h.speed * 1.5 * dt;
                    pos.x += (dx / dist) * speed;
                    pos.z += (dz / dist) * speed;
                }
                break;
            }
        }

        // Walking animation
        const walkSpeed = h.state === 'attack_effigy' ? 0 : 1;
        if (walkSpeed > 0) {
            const swing = Math.sin(time * 6 + i) * 0.4;
            h.mesh.userData.leftArm.rotation.x = swing;
            h.mesh.userData.rightArm.rotation.x = -swing;
        }

        // Damage flash
        if (h.flashTimer > 0) {
            h.flashTimer -= dt;
            h.mesh.userData.body.material.emissive.setHex(0xff0000);
            h.mesh.userData.body.material.emissiveIntensity = h.flashTimer * 2;
        } else {
            h.mesh.userData.body.material.emissiveIntensity = 0;
        }

        // Keep on ground
        pos.y = 0;
    }

    // Remove dead/fled hippies (reverse order)
    for (let i = deadIndices.length - 1; i >= 0; i--) {
        const idx = deadIndices[i];
        scene.remove(hippieSystem.hippies[idx].mesh);
        hippieSystem.hippies.splice(idx, 1);
    }
}

function findNearestGroundFlag(flagSystem, pos, maxDist) {
    let closest = null;
    let closestDist = maxDist;
    for (const f of flagSystem.groundFlags) {
        const dx = f.position.x - pos.x;
        const dz = f.position.z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < closestDist) {
            closestDist = dist;
            closest = f;
        }
    }
    return closest;
}

function removeGroundFlag(flagSystem, scene, flag) {
    const idx = flagSystem.groundFlags.indexOf(flag);
    if (idx !== -1) {
        scene.remove(flag.mesh);
        flagSystem.groundFlags.splice(idx, 1);
    }
}

let damageEffigyFn = null;
export function setDamageEffigyFn(fn) {
    damageEffigyFn = fn;
}

export function damageHippie(hippie, amount, gameState) {
    hippie.hp -= amount;
    hippie.flashTimer = 0.3;
    if (hippie.hp <= 0) {
        gameState.score += SCORE_HIPPIE_KILL;
        gameState.hippiesKilled++;
        return true; // dead
    }
    return false;
}

export function removeDeadHippies(hippieSystem, scene) {
    for (let i = hippieSystem.hippies.length - 1; i >= 0; i--) {
        if (hippieSystem.hippies[i].hp <= 0) {
            scene.remove(hippieSystem.hippies[i].mesh);
            hippieSystem.hippies.splice(i, 1);
        }
    }
}

export function getAliveCount(hippieSystem) {
    return hippieSystem.hippies.filter(h => h.hp > 0).length;
}

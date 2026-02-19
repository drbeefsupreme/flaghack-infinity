import * as THREE from 'three';

const enemyGeoCache = {};
const enemyMatCache = {};

function getEnemyGeo(type) {
    const key = type.name;
    if (!enemyGeoCache[key]) {
        const s = type.size || 1;
        const group = new THREE.Group();

        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 1.2 * s, 6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: type.color, roughness: 0.85 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6 * s;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.18 * s, 6, 6);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xcc9966 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.3 * s;
        group.add(head);

        // Type-specific features
        if (type.name === 'Stink Shaman') {
            // Staff
            const staffGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 4);
            const staffMat = new THREE.MeshStandardMaterial({ color: 0x886644 });
            const staff = new THREE.Mesh(staffGeo, staffMat);
            staff.position.set(0.3, 0.75, 0);
            group.add(staff);
            // Green glow orb on top
            const orbGeo = new THREE.SphereGeometry(0.12, 6, 6);
            const orbMat = new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.6 });
            const orb = new THREE.Mesh(orbGeo, orbMat);
            orb.position.set(0.3, 1.6, 0);
            group.add(orb);
        } else if (type.name === 'Drum Brute') {
            // Big drum
            const drumGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 8);
            const drumMat = new THREE.MeshStandardMaterial({ color: 0xaa7744 });
            const drum = new THREE.Mesh(drumGeo, drumMat);
            drum.position.set(0, 0.5, 0.4);
            drum.rotation.x = Math.PI / 4;
            group.add(drum);
        } else if (type.name === 'Psychosis Wraith') {
            // Translucent swirl
            body.material = new THREE.MeshStandardMaterial({
                color: type.color,
                transparent: true,
                opacity: 0.6,
                emissive: 0x4422aa,
                emissiveIntensity: 0.5,
            });
        } else if (type.name === 'Flag Thief') {
            // Sneaky hood
            const hoodGeo = new THREE.ConeGeometry(0.2, 0.3, 6);
            const hoodMat = new THREE.MeshStandardMaterial({ color: 0x332222 });
            const hood = new THREE.Mesh(hoodGeo, hoodMat);
            hood.position.y = 1.45;
            group.add(hood);
        }

        // HP bar
        const hpBgGeo = new THREE.PlaneGeometry(1, 0.12);
        const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x440000, transparent: true, opacity: 0.7 });
        const hpBg = new THREE.Mesh(hpBgGeo, hpBgMat);
        hpBg.position.y = 1.7 * s;
        hpBg.lookAt(new THREE.Vector3(0, 1.7 * s, 1));
        group.add(hpBg);

        const hpFillGeo = new THREE.PlaneGeometry(0.95, 0.08);
        const hpFillMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        const hpFill = new THREE.Mesh(hpFillGeo, hpFillMat);
        hpFill.position.y = 1.7 * s;
        hpFill.position.z = 0.01;
        hpFill.lookAt(new THREE.Vector3(0, 1.7 * s, 1));
        group.add(hpFill);

        group.userData = { body, hpFill };
        return group;
    }
    return enemyGeoCache[key];
}

export function createEnemyMesh(enemy) {
    const group = new THREE.Group();
    const s = enemy.scale || 1;

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 1.2 * s, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: enemy.type.color, roughness: 0.85 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6 * s;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.18 * s, 6, 6);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xcc9966 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3 * s;
    group.add(head);

    if (enemy.type.name === 'Psychosis Wraith') {
        body.material = new THREE.MeshStandardMaterial({
            color: enemy.type.color, transparent: true, opacity: 0.6,
            emissive: 0x4422aa, emissiveIntensity: 0.5,
        });
    }

    // HP bar
    const hpFillGeo = new THREE.PlaneGeometry(0.95, 0.08);
    const hpFillMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const hpFill = new THREE.Mesh(hpFillGeo, hpFillMat);
    hpFill.position.set(0, 1.7 * s, 0.01);
    group.add(hpFill);

    group.userData = { body, hpFill };
    group.position.copy(enemy.position);
    return group;
}

export function updateEnemies(enemies, player, scene, dt, time) {
    const playerPos = player.mesh.position;
    const deadIndices = [];

    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.alive || !e.mesh) continue;

        const pos = e.mesh.position;
        const dx = playerPos.x - pos.x;
        const dz = playerPos.z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Stun check
        if (e.stunTimer > 0) {
            e.stunTimer -= dt;
            continue;
        }

        // Burn damage
        if (e.burnTimer > 0) {
            e.burnTimer -= dt;
            e.hp -= e.burnDamage * dt;
            e.mesh.userData.body.material.emissive.setHex(0xff4400);
            e.mesh.userData.body.material.emissiveIntensity = 0.4;
        } else {
            e.mesh.userData.body.material.emissiveIntensity = 0;
        }

        // AI
        const aggroRange = 15;
        const attackRange = e.type.range || 2;

        if (dist < aggroRange) {
            e.state = 'chase';

            if (dist < attackRange) {
                e.state = 'attack';
                e.attackTimer -= dt;
                if (e.attackTimer <= 0) {
                    e.attackTimer = 1.0;

                    if (e.type.ranged) {
                        // Ranged attack - handled in main loop (projectile creation)
                        e.wantsToShoot = true;
                    } else if (e.type.steals && player.flags > 0) {
                        // Steal a flag!
                        player.flags--;
                        e.state = 'flee';
                        e.fleeTimer = 3;
                    } else {
                        // Melee damage
                        if (player.invulnTimer <= 0 && !player.isDashing) {
                            player.hp -= e.damage;
                        }
                    }
                }
            } else {
                // Move toward player
                const speed = (e.type.fast ? e.speed * 1.5 : e.speed) * dt;
                pos.x += (dx / dist) * speed;
                pos.z += (dz / dist) * speed;
            }

            // Face player
            e.mesh.rotation.y = Math.atan2(dx, dz);
        } else {
            e.state = 'idle';
            // Idle wander
            if (Math.random() < 0.01) {
                const angle = Math.random() * Math.PI * 2;
                pos.x += Math.cos(angle) * 0.5;
                pos.z += Math.sin(angle) * 0.5;
            }
        }

        // Flee state (flag thieves)
        if (e.state === 'flee') {
            e.fleeTimer -= dt;
            if (e.fleeTimer <= 0) e.state = 'idle';
            const fd = Math.sqrt(dx * dx + dz * dz);
            if (fd > 0) {
                pos.x -= (dx / fd) * e.speed * 1.5 * dt;
                pos.z -= (dz / fd) * e.speed * 1.5 * dt;
            }
        }

        // Walking animation
        if (e.state === 'chase') {
            const bob = Math.sin(time * 8 + i * 2) * 0.05;
            pos.y = bob;
        } else {
            pos.y = 0;
        }

        // HP bar
        if (e.mesh.userData.hpFill) {
            const ratio = Math.max(0, e.hp / e.maxHp);
            e.mesh.userData.hpFill.scale.x = ratio;
        }

        // Flash
        if (e.flashTimer > 0) {
            e.flashTimer -= dt;
            e.mesh.userData.body.material.emissive.setHex(0xff0000);
            e.mesh.userData.body.material.emissiveIntensity = e.flashTimer * 3;
        }

        // Death check
        if (e.hp <= 0) {
            e.alive = false;
            scene.remove(e.mesh);
            e.mesh = null;
            deadIndices.push(i);
        }
    }

    return deadIndices;
}

export function spawnEnemyMeshes(enemies, currentRoom, scene) {
    for (const e of enemies) {
        if (e.roomIdx === currentRoom && e.alive && !e.mesh) {
            e.mesh = createEnemyMesh(e);
            scene.add(e.mesh);
        }
    }
}

export function despawnEnemyMeshes(enemies, currentRoom, scene) {
    for (const e of enemies) {
        if (e.roomIdx !== currentRoom && e.mesh) {
            scene.remove(e.mesh);
            e.mesh = null;
        }
    }
}

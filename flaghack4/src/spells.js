import * as THREE from 'three';
import { SPELLS } from './constants.js';
import { damageHippie } from './hippies.js';

export function createSpellSystem() {
    return {
        activeSpell: 0,
        cooldowns: SPELLS.map(() => 0),
        projectiles: [],   // { mesh, velocity, damage, lifetime }
        aoeEffects: [],     // { mesh, damage, radius, lifetime, position }
        shieldMesh: null,
    };
}

export function castSpell(spellSystem, player, scene, mouseWorldPos) {
    const spell = SPELLS[spellSystem.activeSpell];
    if (spellSystem.cooldowns[spellSystem.activeSpell] > 0) return false;
    if (player.flagic < spell.cost) return false;

    player.flagic -= spell.cost;
    spellSystem.cooldowns[spellSystem.activeSpell] = spell.cooldown;

    const playerPos = player.mesh.position;

    switch (spell.type) {
        case 'projectile': {
            const dir = new THREE.Vector3(
                mouseWorldPos.x - playerPos.x,
                0,
                mouseWorldPos.z - playerPos.z
            ).normalize();

            const geo = new THREE.SphereGeometry(0.3, 8, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                emissive: 0xffd700,
                blending: THREE.AdditiveBlending,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(playerPos);
            mesh.position.y = 1.5;
            scene.add(mesh);

            // Trail glow
            const trailGeo = new THREE.SphereGeometry(0.15, 6, 6);
            const trailMat = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending,
            });
            const trail = new THREE.Mesh(trailGeo, trailMat);
            mesh.add(trail);

            spellSystem.projectiles.push({
                mesh,
                velocity: dir.multiplyScalar(50),
                damage: spell.damage,
                lifetime: spell.range / 50,
            });
            break;
        }

        case 'aoe': {
            const geo = new THREE.RingGeometry(0.5, spell.range, 32);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xff44ff,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(playerPos);
            mesh.position.y = 0.3;
            mesh.rotation.x = -Math.PI / 2;
            scene.add(mesh);

            spellSystem.aoeEffects.push({
                mesh,
                damage: spell.damage,
                radius: spell.range,
                lifetime: 0.5,
                position: playerPos.clone(),
                applied: false,
            });
            break;
        }

        case 'shield': {
            player.shieldActive = true;
            player.shieldTimer = spell.duration;

            if (spellSystem.shieldMesh) {
                scene.remove(spellSystem.shieldMesh);
            }
            const geo = new THREE.SphereGeometry(2, 16, 16);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x4444ff,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
            });
            spellSystem.shieldMesh = new THREE.Mesh(geo, mat);
            player.mesh.add(spellSystem.shieldMesh);
            spellSystem.shieldMesh.position.y = 1;
            break;
        }

        case 'storm': {
            // Spinning flag storm around player
            const stormGroup = new THREE.Group();
            for (let i = 0; i < 8; i++) {
                const flagGeo = new THREE.PlaneGeometry(0.5, 0.5);
                const flagMat = new THREE.MeshBasicMaterial({
                    color: 0xffd700,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending,
                });
                const flag = new THREE.Mesh(flagGeo, flagMat);
                const angle = (i / 8) * Math.PI * 2;
                flag.position.set(Math.cos(angle) * 3, 1 + Math.sin(i) * 0.5, Math.sin(angle) * 3);
                flag.rotation.y = angle;
                stormGroup.add(flag);
            }
            stormGroup.position.copy(playerPos);
            scene.add(stormGroup);

            spellSystem.aoeEffects.push({
                mesh: stormGroup,
                damage: spell.damage,
                radius: spell.range,
                lifetime: spell.duration,
                position: playerPos.clone(),
                applied: false,
                isStorm: true,
                damageTimer: 0,
                damageInterval: 0.5,
            });
            break;
        }
    }

    return true;
}

export function updateSpells(spellSystem, scene, hippieSystem, player, gameState, dt, time) {
    // Cooldowns
    for (let i = 0; i < spellSystem.cooldowns.length; i++) {
        if (spellSystem.cooldowns[i] > 0) {
            spellSystem.cooldowns[i] = Math.max(0, spellSystem.cooldowns[i] - dt);
        }
    }

    // Projectiles
    for (let i = spellSystem.projectiles.length - 1; i >= 0; i--) {
        const p = spellSystem.projectiles[i];
        p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
        p.lifetime -= dt;

        // Check hippie collision
        let hit = false;
        for (const h of hippieSystem.hippies) {
            if (h.hp <= 0) continue;
            const dist = p.mesh.position.distanceTo(h.mesh.position);
            if (dist < 1.5) {
                damageHippie(h, p.damage, gameState);
                hit = true;
                break;
            }
        }

        if (hit || p.lifetime <= 0) {
            scene.remove(p.mesh);
            spellSystem.projectiles.splice(i, 1);
        }
    }

    // AoE effects
    for (let i = spellSystem.aoeEffects.length - 1; i >= 0; i--) {
        const a = spellSystem.aoeEffects[i];
        a.lifetime -= dt;

        if (a.isStorm) {
            // Rotate storm and follow player
            a.mesh.position.copy(player.mesh.position);
            a.mesh.rotation.y += dt * 3;
            a.position.copy(player.mesh.position);

            a.damageTimer -= dt;
            if (a.damageTimer <= 0) {
                a.damageTimer = a.damageInterval;
                for (const h of hippieSystem.hippies) {
                    if (h.hp <= 0) continue;
                    const dist = a.position.distanceTo(h.mesh.position);
                    if (dist < a.radius) {
                        damageHippie(h, a.damage * 0.3, gameState);
                    }
                }
            }
        } else if (!a.applied) {
            a.applied = true;
            for (const h of hippieSystem.hippies) {
                if (h.hp <= 0) continue;
                const dist = a.position.distanceTo(h.mesh.position);
                if (dist < a.radius) {
                    damageHippie(h, a.damage, gameState);
                }
            }
        }

        // Fade out
        if (a.mesh.material) {
            a.mesh.material.opacity = Math.max(0, a.lifetime * 2);
        }

        if (a.lifetime <= 0) {
            scene.remove(a.mesh);
            spellSystem.aoeEffects.splice(i, 1);
        }
    }

    // Shield visual
    if (spellSystem.shieldMesh) {
        if (!player.shieldActive) {
            player.mesh.remove(spellSystem.shieldMesh);
            spellSystem.shieldMesh = null;
        } else {
            spellSystem.shieldMesh.material.opacity = 0.15 + Math.sin(time * 4) * 0.1;
            spellSystem.shieldMesh.rotation.y = time * 2;
        }
    }
}

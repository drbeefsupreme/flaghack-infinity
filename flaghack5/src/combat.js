import * as THREE from 'three';
import { PLAYER_ATTACK_RANGE, CHAKRAS, MAX_FLAGIC } from './constants.js';
import { getAttackDamage } from './player.js';

export function createCombatSystem() {
    return {
        projectiles: [],
        hitEffects: [],
    };
}

export function processMeleeAttack(player, enemies, scene, combatSystem, gameState) {
    const playerPos = player.mesh.position;
    const forward = new THREE.Vector3(
        Math.sin(player.mesh.rotation.y),
        0,
        Math.cos(player.mesh.rotation.y)
    );

    const damage = getAttackDamage(player);
    let hitAny = false;

    for (const e of enemies) {
        if (!e.alive || !e.mesh) continue;
        const toEnemy = new THREE.Vector3().subVectors(e.mesh.position, playerPos);
        toEnemy.y = 0;
        const dist = toEnemy.length();

        if (dist < PLAYER_ATTACK_RANGE) {
            // Check angle (120 degree cone)
            toEnemy.normalize();
            const dot = forward.dot(toEnemy);
            if (dot > 0.3) { // ~120 degree cone
                e.hp -= damage;
                e.flashTimer = 0.2;
                e.stunTimer = 0.15;
                hitAny = true;

                // Knockback
                const kb = toEnemy.clone().multiplyScalar(2);
                e.mesh.position.add(kb);

                // Solar Plexus burn effect
                if (player.chakras[2]) {
                    e.burnTimer = 2;
                    e.burnDamage = CHAKRAS[2].bonus;
                }

                // Hit VFX
                spawnHitEffect(scene, combatSystem, e.mesh.position.clone());

                if (e.hp <= 0) {
                    gameState.kills++;
                    gameState.xp += e.type.xp || 10;

                    // Flagic gain on kill
                    let flagicGain = 5;
                    if (player.chakras[6]) flagicGain *= CHAKRAS[6].bonus; // Crown doubles
                    player.flagic = Math.min(
                        player.chakras[6] ? MAX_FLAGIC * 2 : MAX_FLAGIC,
                        player.flagic + flagicGain
                    );
                }
            }
        }
    }

    return hitAny;
}

export function fireProjectile(combatSystem, scene, origin, direction, damage, color) {
    const geo = new THREE.SphereGeometry(0.2, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
        color: color || 0xffd700,
        blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    mesh.position.y = 1;
    scene.add(mesh);

    combatSystem.projectiles.push({
        mesh,
        velocity: direction.clone().normalize().multiplyScalar(30),
        damage,
        lifetime: 2,
        isEnemy: color === 0x44ff44,
    });
}

export function updateCombat(combatSystem, scene, enemies, player, dt) {
    // Update projectiles
    for (let i = combatSystem.projectiles.length - 1; i >= 0; i--) {
        const p = combatSystem.projectiles[i];
        p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
        p.lifetime -= dt;

        let hit = false;

        if (p.isEnemy) {
            // Enemy projectile - check player hit
            const dist = p.mesh.position.distanceTo(player.mesh.position);
            if (dist < 1.5 && player.invulnTimer <= 0) {
                player.hp -= p.damage;
                hit = true;
            }
        } else {
            // Player projectile - check enemy hits
            for (const e of enemies) {
                if (!e.alive || !e.mesh) continue;
                const dist = p.mesh.position.distanceTo(e.mesh.position);
                if (dist < 1.2) {
                    e.hp -= p.damage;
                    e.flashTimer = 0.2;
                    hit = true;
                    break;
                }
            }
        }

        if (hit || p.lifetime <= 0) {
            scene.remove(p.mesh);
            combatSystem.projectiles.splice(i, 1);
        }
    }

    // Update hit effects
    for (let i = combatSystem.hitEffects.length - 1; i >= 0; i--) {
        const fx = combatSystem.hitEffects[i];
        fx.lifetime -= dt;
        fx.mesh.scale.multiplyScalar(1 + dt * 3);
        fx.mesh.material.opacity = fx.lifetime * 2;
        if (fx.lifetime <= 0) {
            scene.remove(fx.mesh);
            combatSystem.hitEffects.splice(i, 1);
        }
    }
}

function spawnHitEffect(scene, combatSystem, position) {
    const geo = new THREE.RingGeometry(0.3, 0.8, 8);
    const mat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.position.y = 1;
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    combatSystem.hitEffects.push({ mesh, lifetime: 0.3 });
}

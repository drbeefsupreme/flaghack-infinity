import * as THREE from 'three';
import { BOSSES, ARENA_RADIUS, BULLET_COLORS } from './constants.js';

export function createBoss(bossIndex, scene) {
    const config = BOSSES[bossIndex];
    const group = new THREE.Group();

    // Boss body (large, menacing)
    const bodyGeo = new THREE.SphereGeometry(2, 12, 12);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.3,
        roughness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 3;
    body.castShadow = true;
    group.add(body);

    // Boss-specific features
    if (bossIndex === 0) { // THE STENCH - green miasma
        const miasmaGeo = new THREE.SphereGeometry(3, 8, 8);
        const miasmaMat = new THREE.MeshBasicMaterial({
            color: 0x44aa44, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending,
        });
        const miasma = new THREE.Mesh(miasmaGeo, miasmaMat);
        miasma.position.y = 3;
        group.add(miasma);
        group.userData.miasma = miasma;
    } else if (bossIndex === 1) { // THE CENSOR - red angular
        const shieldGeo = new THREE.BoxGeometry(4, 4, 0.5);
        const shieldMat = new THREE.MeshStandardMaterial({
            color: 0xcc2222, emissive: 0x440000, emissiveIntensity: 0.5,
        });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        shield.position.y = 3;
        group.add(shield);
    } else if (bossIndex === 2) { // ENTROPY - grey dissolving
        body.material.transparent = true;
        body.material.opacity = 0.7;
    } else if (bossIndex === 3) { // NULL-TIME - blue temporal
        const ringGeo = new THREE.TorusGeometry(3, 0.2, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x4444ff, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending,
        });
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(ringGeo, ringMat.clone());
            ring.position.y = 3;
            ring.rotation.x = (i / 3) * Math.PI;
            ring.rotation.y = (i / 3) * Math.PI * 0.5;
            group.add(ring);
        }
    } else if (bossIndex === 4) { // ANTI-FLAG - purple void
        body.material.color.setHex(0x000000);
        body.material.emissive.setHex(0x880088);
        body.material.emissiveIntensity = 0.8;
        // Inverted flag
        const flagGeo = new THREE.PlaneGeometry(2, 2);
        flagGeo.rotateZ(Math.PI / 4);
        const flagMat = new THREE.MeshBasicMaterial({
            color: 0x000022, side: THREE.DoubleSide,
            transparent: true, opacity: 0.8,
        });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.y = 5;
        group.add(flag);
    }

    // Boss glow
    const light = new THREE.PointLight(config.color, 3, 25);
    light.position.y = 3;
    group.add(light);

    // HP indicator ring
    const hpRingGeo = new THREE.TorusGeometry(2.5, 0.08, 8, 64);
    const hpRingMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const hpRing = new THREE.Mesh(hpRingGeo, hpRingMat);
    hpRing.position.y = 0.1;
    hpRing.rotation.x = -Math.PI / 2;
    group.add(hpRing);

    group.position.set(0, 0, -15);
    scene.add(group);

    return {
        mesh: group,
        body,
        light,
        config,
        bossIndex,
        hp: config.hp,
        maxHp: config.hp,
        phase: 1,
        maxPhases: config.phases,
        speed: config.speed,
        shootTimer: 0,
        patternTimer: 0,
        currentPattern: 0,
        moveAngle: 0,
        phaseTransition: false,
        phaseTransitionTimer: 0,
    };
}

export function updateBoss(boss, player, scene, bullets, dt, time) {
    if (!boss || boss.hp <= 0) return;

    const pos = boss.mesh.position;
    const playerPos = player.mesh.position;

    // Phase transitions
    const phaseThresholds = [];
    for (let i = 1; i <= boss.maxPhases; i++) {
        phaseThresholds.push(boss.maxHp * (1 - i / boss.maxPhases));
    }
    const newPhase = phaseThresholds.filter(t => boss.hp <= t).length + 1;
    if (newPhase > boss.phase && newPhase <= boss.maxPhases) {
        boss.phase = newPhase;
        boss.phaseTransition = true;
        boss.phaseTransitionTimer = 2;
    }

    if (boss.phaseTransition) {
        boss.phaseTransitionTimer -= dt;
        boss.mesh.scale.setScalar(1 + Math.sin(time * 15) * 0.1);
        boss.light.intensity = 5 + Math.sin(time * 20) * 3;
        if (boss.phaseTransitionTimer <= 0) {
            boss.phaseTransition = false;
            boss.mesh.scale.setScalar(1);
        }
        return;
    }

    // Movement (orbit around arena center)
    boss.moveAngle += boss.speed * 0.02 * dt * boss.phase;
    const orbitRadius = ARENA_RADIUS * 0.4;
    const targetX = Math.cos(boss.moveAngle) * orbitRadius;
    const targetZ = Math.sin(boss.moveAngle) * orbitRadius;
    pos.x += (targetX - pos.x) * 2 * dt;
    pos.z += (targetZ - pos.z) * 2 * dt;

    // Face player
    const dx = playerPos.x - pos.x;
    const dz = playerPos.z - pos.z;
    boss.mesh.rotation.y = Math.atan2(dx, dz);

    // Body pulse
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    boss.body.scale.setScalar(pulse);

    // Shoot patterns based on boss and phase
    boss.shootTimer -= dt;
    boss.patternTimer += dt;

    if (boss.shootTimer <= 0) {
        const rate = 0.8 / boss.phase; // Faster in later phases
        boss.shootTimer = rate;

        fireBossPattern(boss, playerPos, pos, scene, bullets, time);
    }
}

function fireBossPattern(boss, playerPos, bossPos, scene, bullets, time) {
    const idx = boss.bossIndex;
    const phase = boss.phase;

    // All bosses get aimed shots
    fireEnemyBullet(scene, bullets, bossPos, playerPos, 20, 10, BULLET_COLORS.enemy_aimed);

    // Boss-specific patterns
    switch (idx) {
        case 0: // STENCH - spreading cloud
            if (phase >= 2) {
                for (let i = 0; i < 5 + phase * 2; i++) {
                    const angle = (i / (5 + phase * 2)) * Math.PI * 2 + time;
                    const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                    const target = bossPos.clone().add(dir.multiplyScalar(50));
                    fireEnemyBullet(scene, bullets, bossPos, target, 12, 8, BULLET_COLORS.enemy_normal);
                }
            }
            break;

        case 1: // CENSOR - barrier walls
            if (phase >= 2) {
                for (let i = 0; i < 8; i++) {
                    const offset = (i - 4) * 2;
                    const perpAngle = Math.atan2(playerPos.z - bossPos.z, playerPos.x - bossPos.x) + Math.PI / 2;
                    const start = bossPos.clone();
                    start.x += Math.cos(perpAngle) * offset;
                    start.z += Math.sin(perpAngle) * offset;
                    fireEnemyBullet(scene, bullets, start, playerPos, 18, 6, BULLET_COLORS.enemy_normal);
                }
            }
            break;

        case 2: // ENTROPY - spirals
            for (let i = 0; i < 3 * phase; i++) {
                const angle = time * 2 + (i / (3 * phase)) * Math.PI * 2;
                const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                const target = bossPos.clone().add(dir.multiplyScalar(50));
                fireEnemyBullet(scene, bullets, bossPos, target, 10 + phase * 2, 5, BULLET_COLORS.enemy_spiral);
            }
            break;

        case 3: // NULL-TIME - time-freeze rings
            if (boss.patternTimer > 2) {
                boss.patternTimer = 0;
                for (let i = 0; i < 16 + phase * 4; i++) {
                    const angle = (i / (16 + phase * 4)) * Math.PI * 2;
                    const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                    const target = bossPos.clone().add(dir.multiplyScalar(50));
                    fireEnemyBullet(scene, bullets, bossPos, target, 8, 12, BULLET_COLORS.enemy_ring);
                }
            }
            break;

        case 4: // ANTI-FLAG - chaos + void zones
            for (let i = 0; i < 2 * phase; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 8 + Math.random() * 15;
                const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                const target = bossPos.clone().add(dir.multiplyScalar(50));
                fireEnemyBullet(scene, bullets, bossPos, target, speed, 10, BULLET_COLORS.enemy_chaos);
            }
            // Aimed burst
            if (phase >= 3) {
                for (let i = 0; i < 5; i++) {
                    const spread = (i - 2) * 0.15;
                    const angle = Math.atan2(playerPos.z - bossPos.z, playerPos.x - bossPos.x) + spread;
                    const target = bossPos.clone().add(new THREE.Vector3(Math.cos(angle) * 50, 0, Math.sin(angle) * 50));
                    fireEnemyBullet(scene, bullets, bossPos, target, 25, 8, BULLET_COLORS.enemy_aimed);
                }
            }
            break;
    }
}

function fireEnemyBullet(scene, bullets, from, toward, speed, damage, color) {
    const dir = new THREE.Vector3().subVectors(toward, from);
    dir.y = 0;
    dir.normalize();

    const geo = new THREE.SphereGeometry(0.2, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
        color, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(from);
    mesh.position.y = 1.5;
    scene.add(mesh);

    bullets.push({
        mesh,
        isPlayer: false,
        velocity: dir.multiplyScalar(speed),
        damage,
        lifetime: 5,
    });
}

export function removeBoss(boss, scene) {
    if (boss && boss.mesh) {
        scene.remove(boss.mesh);
    }
}

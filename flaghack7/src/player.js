import * as THREE from 'three';
import {
    PLAYER_SPEED, PLAYER_MAX_HP, PLAYER_SHOOT_COOLDOWN, PLAYER_BULLET_SPEED,
    PLAYER_BULLET_DAMAGE, PLAYER_DODGE_SPEED, PLAYER_DODGE_DURATION,
    PLAYER_DODGE_COOLDOWN, PLAYER_FLAGIC_MAX, PLAYER_FLAGIC_REGEN,
    ARENA_RADIUS, BULLET_COLORS
} from './constants.js';

export function createPlayer(scene) {
    const group = new THREE.Group();

    // Angelic body (white/gold robes)
    const robeGeo = new THREE.CylinderGeometry(0.3, 0.6, 1.8, 8);
    const robeMat = new THREE.MeshStandardMaterial({
        color: 0xeeeecc, emissive: 0x221100, emissiveIntensity: 0.2, roughness: 0.6,
    });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.9;
    robe.castShadow = true;
    group.add(robe);

    // Golden sash
    const sashGeo = new THREE.TorusGeometry(0.45, 0.06, 4, 8);
    const sashMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa8800, emissiveIntensity: 0.4 });
    const sash = new THREE.Mesh(sashGeo, sashMat);
    sash.position.y = 1.1;
    sash.rotation.x = Math.PI / 2;
    group.add(sash);

    // Head with halo
    const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2;
    group.add(head);

    // Halo
    const haloGeo = new THREE.TorusGeometry(0.35, 0.04, 8, 24);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 2.4;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    // Wings (two planes)
    const wingGeo = new THREE.PlaneGeometry(2, 1.5, 4, 3);
    const wingMat = new THREE.MeshStandardMaterial({
        color: 0xddddcc, side: THREE.DoubleSide,
        emissive: 0x222211, emissiveIntensity: 0.2,
        transparent: true, opacity: 0.9,
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-1.2, 1.5, -0.2);
    leftWing.rotation.y = -0.3;
    group.add(leftWing);
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(1.2, 1.5, -0.2);
    rightWing.rotation.y = 0.3;
    group.add(rightWing);

    // Flag weapon (held aloft)
    const flagGroup = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.04, 3, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.5;
    flagGroup.add(pole);
    const clothGeo = new THREE.PlaneGeometry(0.8, 0.8, 5, 5);
    clothGeo.rotateZ(Math.PI / 4);
    const clothMat = new THREE.MeshStandardMaterial({
        color: 0xffd700, side: THREE.DoubleSide,
        emissive: 0x664400, emissiveIntensity: 0.5,
    });
    const cloth = new THREE.Mesh(clothGeo, clothMat);
    cloth.position.set(0.4, 2.5, 0);
    flagGroup.add(cloth);
    flagGroup.position.set(0.5, 0.5, 0);
    group.add(flagGroup);

    // Angel glow
    const glow = new THREE.PointLight(0xffd700, 2, 15);
    glow.position.y = 1.5;
    group.add(glow);

    scene.add(group);

    return {
        mesh: group,
        leftWing, rightWing, cloth, halo, glow,
        hp: PLAYER_MAX_HP,
        maxHp: PLAYER_MAX_HP,
        flagic: PLAYER_FLAGIC_MAX,
        maxFlagic: PLAYER_FLAGIC_MAX,
        shootTimer: 0,
        dodgeTimer: 0,
        dodgeCooldown: 0,
        dodgeDir: new THREE.Vector3(),
        isDodging: false,
        invulnTimer: 0,
        score: 0,
        hitThisBoss: false,
    };
}

export function updatePlayer(player, input, dt, time, mouseWorldPos) {
    // Dodge
    if (player.isDodging) {
        player.dodgeTimer -= dt;
        player.mesh.position.add(player.dodgeDir.clone().multiplyScalar(PLAYER_DODGE_SPEED * dt));
        if (player.dodgeTimer <= 0) player.isDodging = false;
    } else {
        // Movement
        const dir = new THREE.Vector3();
        if (input.w) dir.z -= 1;
        if (input.s) dir.z += 1;
        if (input.a) dir.x -= 1;
        if (input.d) dir.x += 1;

        if (dir.lengthSq() > 0) {
            dir.normalize();
            player.mesh.position.add(dir.multiplyScalar(PLAYER_SPEED * dt));
        }
    }

    // Face mouse
    if (mouseWorldPos) {
        const dx = mouseWorldPos.x - player.mesh.position.x;
        const dz = mouseWorldPos.z - player.mesh.position.z;
        if (dx * dx + dz * dz > 1) {
            player.mesh.rotation.y = Math.atan2(dx, dz);
        }
    }

    // Clamp to arena
    const p = player.mesh.position;
    const dist = Math.sqrt(p.x * p.x + p.z * p.z);
    if (dist > ARENA_RADIUS - 2) {
        const scale = (ARENA_RADIUS - 2) / dist;
        p.x *= scale;
        p.z *= scale;
    }
    p.y = 0;

    // Cooldowns
    if (player.shootTimer > 0) player.shootTimer -= dt;
    if (player.dodgeCooldown > 0) player.dodgeCooldown -= dt;
    if (player.invulnTimer > 0) player.invulnTimer -= dt;

    // Flagic regen
    player.flagic = Math.min(player.maxFlagic, player.flagic + PLAYER_FLAGIC_REGEN * dt);

    // Wing flap animation
    const flapSpeed = player.isDodging ? 15 : 4;
    const flap = Math.sin(time * flapSpeed) * 0.3;
    player.leftWing.rotation.z = -0.2 + flap;
    player.rightWing.rotation.z = 0.2 - flap;

    // Cloth wave
    if (player.cloth) {
        const pos = player.cloth.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const d = Math.sqrt(x * x + y * y);
            pos.setZ(i, Math.sin(time * 4 + d * 2) * 0.05 * d);
        }
        pos.needsUpdate = true;
    }

    // Halo spin
    player.halo.rotation.z = time * 0.5;

    // Glow pulse
    player.glow.intensity = 1.5 + Math.sin(time * 3) * 0.5;
}

export function playerShoot(player, scene, bullets, mouseWorldPos) {
    if (player.shootTimer > 0) return;
    player.shootTimer = PLAYER_SHOOT_COOLDOWN;

    const pos = player.mesh.position.clone();
    pos.y = 1.5;
    const dir = new THREE.Vector3(
        mouseWorldPos.x - pos.x, 0, mouseWorldPos.z - pos.z
    ).normalize();

    const geo = new THREE.SphereGeometry(0.15, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
        color: BULLET_COLORS.player,
        blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);

    bullets.push({
        mesh, isPlayer: true,
        velocity: dir.multiplyScalar(PLAYER_BULLET_SPEED),
        damage: PLAYER_BULLET_DAMAGE,
        lifetime: 2,
    });
}

export function startDodge(player, input) {
    if (player.dodgeCooldown > 0 || player.isDodging) return false;
    const dir = new THREE.Vector3();
    if (input.w) dir.z -= 1;
    if (input.s) dir.z += 1;
    if (input.a) dir.x -= 1;
    if (input.d) dir.x += 1;
    if (dir.lengthSq() === 0) dir.z = -1;
    dir.normalize();
    player.dodgeDir.copy(dir);
    player.isDodging = true;
    player.dodgeTimer = PLAYER_DODGE_DURATION;
    player.dodgeCooldown = PLAYER_DODGE_COOLDOWN;
    player.invulnTimer = PLAYER_DODGE_DURATION;
    return true;
}

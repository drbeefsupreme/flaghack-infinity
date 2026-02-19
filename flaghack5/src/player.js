import * as THREE from 'three';
import {
    PLAYER_SPEED, PLAYER_DASH_SPEED, PLAYER_DASH_DURATION, PLAYER_DASH_COOLDOWN,
    PLAYER_MAX_HP, PLAYER_START_FLAGS, PLAYER_ATTACK_RANGE, PLAYER_ATTACK_DAMAGE,
    PLAYER_ATTACK_COOLDOWN, FLAG_COLOR, FLAG_SWING_SPEED, MAX_FLAGIC, CHAKRAS
} from './constants.js';

export function createPlayer(scene) {
    const group = new THREE.Group();

    // Robe (dark indigo with golden trim)
    const robeGeo = new THREE.CylinderGeometry(0.3, 0.55, 1.7, 8);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e, roughness: 0.8 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.85;
    robe.castShadow = true;
    group.add(robe);

    // Sash
    const sashGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.25, 8);
    const sashMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x332200, emissiveIntensity: 0.3 });
    const sash = new THREE.Mesh(sashGeo, sashMat);
    sash.position.y = 1.2;
    group.add(sash);

    // Head
    const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.95;
    head.castShadow = true;
    group.add(head);

    // Wizard hat
    const hatGeo = new THREE.ConeGeometry(0.28, 0.55, 8);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 2.35;
    group.add(hat);

    // Hat band
    const bandGeo = new THREE.TorusGeometry(0.26, 0.035, 4, 8);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x443300, emissiveIntensity: 0.5 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 2.12;
    band.rotation.x = Math.PI / 2;
    group.add(band);

    // Flag weapon (held in right hand)
    const flagGroup = new THREE.Group();

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.025, 0.035, 2.2, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.1;
    flagGroup.add(pole);

    // Cloth (diamond)
    const clothGeo = new THREE.PlaneGeometry(0.7, 0.7, 6, 6);
    clothGeo.rotateZ(Math.PI / 4);
    const clothMat = new THREE.MeshStandardMaterial({
        color: FLAG_COLOR,
        side: THREE.DoubleSide,
        emissive: 0x332200,
        emissiveIntensity: 0.2,
    });
    const cloth = new THREE.Mesh(clothGeo, clothMat);
    cloth.position.set(0.3, 1.9, 0);
    flagGroup.add(cloth);

    flagGroup.position.set(0.5, 0, 0.2);
    group.add(flagGroup);

    // Chakra glow points on the flag (7 points along the pole)
    const chakraGlows = [];
    for (let i = 0; i < 7; i++) {
        const glowGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const glowMat = new THREE.MeshBasicMaterial({
            color: CHAKRAS[i].color,
            transparent: true,
            opacity: 0,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = 0.2 + (i / 6) * 1.8;
        flagGroup.add(glow);
        chakraGlows.push(glow);
    }

    // Player point light
    const playerLight = new THREE.PointLight(0xffd700, 0.5, 8);
    playerLight.position.y = 2;
    group.add(playerLight);

    scene.add(group);

    return {
        mesh: group,
        flagGroup,
        cloth,
        chakraGlows,
        playerLight,
        robe, head,
        hp: PLAYER_MAX_HP,
        maxHp: PLAYER_MAX_HP,
        flags: PLAYER_START_FLAGS,
        flagic: 0,
        speed: PLAYER_SPEED,
        attackDamage: PLAYER_ATTACK_DAMAGE,
        attackCooldown: 0,
        attackTimer: 0,
        isAttacking: false,
        attackAngle: 0,
        dashTimer: 0,
        dashCooldown: 0,
        dashDir: new THREE.Vector3(),
        isDashing: false,
        moveDir: new THREE.Vector3(),
        chakras: CHAKRAS.map(() => false), // unlocked state
        level: 1,
        xp: 0,
        kills: 0,
        crystals: 0,
        invulnTimer: 0,
    };
}

export function updatePlayer(player, input, dt, cameraYaw, mouseWorldPos) {
    // Movement
    const dir = new THREE.Vector3();
    if (input.w) dir.z -= 1;
    if (input.s) dir.z += 1;
    if (input.a) dir.x -= 1;
    if (input.d) dir.x += 1;

    if (player.isDashing) {
        player.dashTimer -= dt;
        const move = player.dashDir.clone().multiplyScalar(PLAYER_DASH_SPEED * dt);
        player.mesh.position.add(move);
        if (player.dashTimer <= 0) {
            player.isDashing = false;
        }
    } else if (dir.lengthSq() > 0) {
        dir.normalize();
        const cos = Math.cos(cameraYaw);
        const sin = Math.sin(cameraYaw);
        const rx = dir.x * cos - dir.z * sin;
        const rz = dir.x * sin + dir.z * cos;
        player.moveDir.set(rx, 0, rz);

        let speed = player.speed;
        if (player.chakras[1]) speed *= (1 + CHAKRAS[1].bonus); // Sacral speed boost

        const move = player.moveDir.clone().multiplyScalar(speed * dt);
        player.mesh.position.add(move);
    }

    // Face toward mouse
    if (mouseWorldPos) {
        const dx = mouseWorldPos.x - player.mesh.position.x;
        const dz = mouseWorldPos.z - player.mesh.position.z;
        if (dx * dx + dz * dz > 1) {
            player.mesh.rotation.y = Math.atan2(dx, dz);
        }
    }

    // Arm swing while moving
    if (dir.lengthSq() > 0 && !player.isAttacking) {
        const swing = Math.sin(performance.now() * 0.007) * 0.15;
        player.flagGroup.rotation.x = swing;
    }

    // Attack animation
    if (player.isAttacking) {
        player.attackAngle += FLAG_SWING_SPEED * dt;
        player.flagGroup.rotation.z = Math.sin(player.attackAngle * 4) * 0.8;
        player.flagGroup.rotation.x = -0.3 + Math.sin(player.attackAngle * 6) * 0.4;
        if (player.attackAngle > 0.8) {
            player.isAttacking = false;
            player.flagGroup.rotation.z = 0;
            player.flagGroup.rotation.x = 0;
        }
    }

    // Cooldowns
    if (player.attackTimer > 0) player.attackTimer -= dt;
    if (player.dashCooldown > 0) player.dashCooldown -= dt;
    if (player.invulnTimer > 0) player.invulnTimer -= dt;

    // Chakra effects
    // Heart: HP regen
    if (player.chakras[3] && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + CHAKRAS[3].bonus * dt);
    }

    // Crown: double flagic cap handled elsewhere

    // Animate cloth
    const cloth = player.cloth;
    if (cloth) {
        const pos = cloth.geometry.attributes.position;
        const time = performance.now() * 0.001;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            pos.setZ(i, Math.sin(time * 3 + dist * 2) * 0.04 * dist);
        }
        pos.needsUpdate = true;
    }

    // Update chakra glows
    for (let i = 0; i < 7; i++) {
        const glow = player.chakraGlows[i];
        if (player.chakras[i]) {
            glow.material.opacity = 0.6 + Math.sin(performance.now() * 0.003 + i) * 0.3;
            glow.scale.setScalar(1 + Math.sin(performance.now() * 0.004 + i) * 0.2);
        }
    }

    // Player light intensity based on chakra count
    const chakraCount = player.chakras.filter(c => c).length;
    player.playerLight.intensity = 0.5 + chakraCount * 0.3;

    player.mesh.position.y = 0;
}

export function startAttack(player) {
    if (player.attackTimer > 0) return false;
    let cd = PLAYER_ATTACK_COOLDOWN;
    if (player.chakras[1]) cd *= (1 - CHAKRAS[1].bonus); // Sacral: faster attacks
    player.attackTimer = cd;
    player.isAttacking = true;
    player.attackAngle = 0;
    return true;
}

export function startDash(player, input, cameraYaw) {
    if (player.dashCooldown > 0 || player.isDashing) return false;

    const dir = new THREE.Vector3();
    if (input.w) dir.z -= 1;
    if (input.s) dir.z += 1;
    if (input.a) dir.x -= 1;
    if (input.d) dir.x += 1;
    if (dir.lengthSq() === 0) dir.z = -1;
    dir.normalize();

    const cos = Math.cos(cameraYaw);
    const sin = Math.sin(cameraYaw);
    player.dashDir.set(dir.x * cos - dir.z * sin, 0, dir.x * sin + dir.z * cos);
    player.isDashing = true;
    player.dashTimer = PLAYER_DASH_DURATION;
    player.dashCooldown = PLAYER_DASH_COOLDOWN;
    player.invulnTimer = PLAYER_DASH_DURATION; // i-frames during dash
    return true;
}

export function getAttackDamage(player) {
    let dmg = player.attackDamage;
    if (player.chakras[0]) dmg *= (1 + CHAKRAS[0].bonus); // Root: +damage
    return dmg;
}

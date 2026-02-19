import * as THREE from 'three';
import { PLAYER_SPEED, PLAYER_MAX_HP, PLAYER_START_FLAGS, WORLD_SIZE } from './constants.js';

export function createPlayer(scene) {
    const group = new THREE.Group();

    // Robe body (cylinder, narrower at top)
    const robeGeo = new THREE.CylinderGeometry(0.3, 0.6, 1.8, 8);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e, roughness: 0.8 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.9;
    robe.castShadow = true;
    group.add(robe);

    // Yellow accent sash
    const sashGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.3, 8);
    const sashMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.6, emissive: 0x332200, emissiveIntensity: 0.3 });
    const sash = new THREE.Mesh(sashGeo, sashMat);
    sash.position.y = 1.3;
    group.add(sash);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.05;
    head.castShadow = true;
    group.add(head);

    // Wizard hat
    const hatGeo = new THREE.ConeGeometry(0.3, 0.6, 8);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 2.5;
    hat.castShadow = true;
    group.add(hat);

    // Hat band
    const bandGeo = new THREE.TorusGeometry(0.28, 0.04, 4, 8);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x443300, emissiveIntensity: 0.5 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 2.25;
    band.rotation.x = Math.PI / 2;
    group.add(band);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.5, 1.4, 0);
    leftArm.rotation.z = 0.3;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.5, 1.4, 0);
    rightArm.rotation.z = -0.3;
    group.add(rightArm);

    // Hands (small spheres)
    const handGeo = new THREE.SphereGeometry(0.1, 6, 6);
    const handMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const leftHand = new THREE.Mesh(handGeo, handMat);
    leftHand.position.set(-0.7, 1.1, 0);
    group.add(leftHand);
    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(0.7, 1.1, 0);
    group.add(rightHand);

    scene.add(group);

    return {
        mesh: group,
        robe, leftArm, rightArm, leftHand, rightHand,
        hp: PLAYER_MAX_HP,
        maxHp: PLAYER_MAX_HP,
        flags: PLAYER_START_FLAGS,
        flagic: 0,
        speed: PLAYER_SPEED,
        moveDir: new THREE.Vector3(),
        shieldActive: false,
        shieldTimer: 0,
        invulnTimer: 0,
    };
}

export function updatePlayer(player, input, dt, cameraYaw) {
    // Movement relative to camera
    const dir = new THREE.Vector3();
    if (input.w) dir.z -= 1;
    if (input.s) dir.z += 1;
    if (input.a) dir.x -= 1;
    if (input.d) dir.x += 1;

    if (dir.lengthSq() > 0) {
        dir.normalize();
        // Rotate movement direction by camera yaw
        const cos = Math.cos(cameraYaw);
        const sin = Math.sin(cameraYaw);
        const rx = dir.x * cos - dir.z * sin;
        const rz = dir.x * sin + dir.z * cos;
        player.moveDir.set(rx, 0, rz);

        const move = player.moveDir.clone().multiplyScalar(player.speed * dt);
        player.mesh.position.add(move);

        // Face movement direction
        player.mesh.rotation.y = Math.atan2(player.moveDir.x, player.moveDir.z);

        // Arm swing animation
        const swing = Math.sin(performance.now() * 0.008) * 0.4;
        player.leftArm.rotation.x = swing;
        player.rightArm.rotation.x = -swing;
        player.leftHand.position.y = 1.1 + Math.sin(performance.now() * 0.008) * 0.1;
        player.rightHand.position.y = 1.1 - Math.sin(performance.now() * 0.008) * 0.1;
    } else {
        // Idle arm position
        player.leftArm.rotation.x *= 0.9;
        player.rightArm.rotation.x *= 0.9;
    }

    // Clamp to world
    const p = player.mesh.position;
    const limit = WORLD_SIZE - 5;
    p.x = Math.max(-limit, Math.min(limit, p.x));
    p.z = Math.max(-limit, Math.min(limit, p.z));
    p.y = 0;

    // Shield timer
    if (player.shieldActive) {
        player.shieldTimer -= dt;
        if (player.shieldTimer <= 0) player.shieldActive = false;
    }
    if (player.invulnTimer > 0) player.invulnTimer -= dt;
}

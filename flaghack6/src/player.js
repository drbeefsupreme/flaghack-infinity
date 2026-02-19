import * as THREE from 'three';
import { PLAYER_SPEED, PLAYER_DASH_SPEED, PLAYER_DASH_DURATION, PLAYER_DASH_COOLDOWN, WORLD_SIZE } from './constants.js';

export function createPlayer(scene) {
    const group = new THREE.Group();

    // Resistance cloak (darker, more ragged than previous games)
    const robeGeo = new THREE.CylinderGeometry(0.3, 0.55, 1.6, 8);
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.8;
    robe.castShadow = true;
    group.add(robe);

    // Hood
    const hoodGeo = new THREE.SphereGeometry(0.28, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.y = 1.75;
    group.add(hood);

    // Face (barely visible under hood)
    const faceGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.y = 1.72;
    face.position.z = 0.08;
    group.add(face);

    // Yellow armband (subtle resistance symbol)
    const bandGeo = new THREE.TorusGeometry(0.2, 0.03, 4, 8);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x332200, emissiveIntensity: 0.3 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.set(0.45, 1.2, 0);
    band.rotation.z = Math.PI / 2;
    group.add(band);

    // Faint player light
    const light = new THREE.PointLight(0xffd700, 0.3, 6);
    light.position.y = 1.5;
    group.add(light);

    scene.add(group);

    return {
        mesh: group,
        speed: PLAYER_SPEED,
        dashTimer: 0,
        dashCooldown: 0,
        dashDir: new THREE.Vector3(),
        isDashing: false,
        moveDir: new THREE.Vector3(),
        gatherTimer: 0,
        isGathering: false,
    };
}

export function updatePlayer(player, input, dt, cameraYaw) {
    if (player.isDashing) {
        player.dashTimer -= dt;
        player.mesh.position.add(player.dashDir.clone().multiplyScalar(PLAYER_DASH_SPEED * dt));
        if (player.dashTimer <= 0) player.isDashing = false;
    } else {
        const dir = new THREE.Vector3();
        if (input.w) dir.z -= 1;
        if (input.s) dir.z += 1;
        if (input.a) dir.x -= 1;
        if (input.d) dir.x += 1;

        if (dir.lengthSq() > 0) {
            dir.normalize();
            const cos = Math.cos(cameraYaw);
            const sin = Math.sin(cameraYaw);
            player.moveDir.set(dir.x * cos - dir.z * sin, 0, dir.x * sin + dir.z * cos);
            player.mesh.position.add(player.moveDir.clone().multiplyScalar(player.speed * dt));
            player.mesh.rotation.y = Math.atan2(player.moveDir.x, player.moveDir.z);
        }
    }

    // Clamp
    const p = player.mesh.position;
    const limit = WORLD_SIZE - 5;
    p.x = Math.max(-limit, Math.min(limit, p.x));
    p.z = Math.max(-limit, Math.min(limit, p.z));
    p.y = 0;

    if (player.dashCooldown > 0) player.dashCooldown -= dt;
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
    return true;
}

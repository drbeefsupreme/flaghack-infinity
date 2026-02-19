import * as THREE from 'three';
import { PLAYER_SPEED, PLAYER_PICKUP_RANGE, PLAYER_PLACE_RANGE, FLAG_COLOR } from './constants.js';

export function createPlayer(scene) {
    const group = new THREE.Group();

    // Body - Lead Vexillomancer robes
    const robeGeo = new THREE.CylinderGeometry(0.3, 0.5, 1.6, 8);
    const robeMat = new THREE.MeshStandardMaterial({
        color: 0x332211, roughness: 0.7,
        emissive: 0x110800, emissiveIntensity: 0.2,
    });
    const robe = new THREE.Mesh(robeGeo, robeMat);
    robe.position.y = 0.8;
    robe.castShadow = true;
    group.add(robe);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    group.add(head);

    // Survey hat (wide brim)
    const brimGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 12);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x665533 });
    const brim = new THREE.Mesh(brimGeo, hatMat);
    brim.position.y = 1.95;
    group.add(brim);
    const crownGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 8);
    const crown = new THREE.Mesh(crownGeo, hatMat);
    crown.position.y = 2.1;
    group.add(crown);

    // Carried flag (when carrying)
    const flagGroup = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.04, 2.5, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.25;
    flagGroup.add(pole);
    const clothGeo = new THREE.PlaneGeometry(0.6, 0.7, 4, 4);
    clothGeo.rotateZ(Math.PI / 4);
    const clothMat = new THREE.MeshStandardMaterial({
        color: FLAG_COLOR, side: THREE.DoubleSide,
        emissive: 0x332200, emissiveIntensity: 0.3,
    });
    const cloth = new THREE.Mesh(clothGeo, clothMat);
    cloth.position.set(0.3, 2.2, 0);
    flagGroup.add(cloth);
    flagGroup.position.set(0.4, 0.3, 0);
    flagGroup.visible = false;
    group.add(flagGroup);

    // Survey tool (rod in other hand)
    const toolGeo = new THREE.CylinderGeometry(0.02, 0.02, 2, 6);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const tool = new THREE.Mesh(toolGeo, toolMat);
    tool.position.set(-0.5, 1.3, 0);
    tool.rotation.z = 0.2;
    group.add(tool);

    // Player light
    const glow = new THREE.PointLight(0xffd700, 1, 12);
    glow.position.y = 1.5;
    group.add(glow);

    group.position.set(0, 0, 5);
    scene.add(group);

    return {
        mesh: group,
        flagGroup,
        cloth,
        glow,
        carryingFlag: null, // reference to picked-up flag
        speed: PLAYER_SPEED,
    };
}

export function updatePlayer(player, input, dt, time) {
    const dir = new THREE.Vector3();
    if (input.w) dir.z -= 1;
    if (input.s) dir.z += 1;
    if (input.a) dir.x -= 1;
    if (input.d) dir.x += 1;

    if (dir.lengthSq() > 0) {
        dir.normalize();
        player.mesh.position.add(dir.multiplyScalar(player.speed * dt));
        player.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    }

    // Carried flag wave
    if (player.flagGroup.visible && player.cloth) {
        const pos = player.cloth.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const d = Math.sqrt(x * x + y * y);
            pos.setZ(i, Math.sin(time * 5 + d * 3) * 0.03 * d);
        }
        pos.needsUpdate = true;
    }

    // Glow pulse
    player.glow.intensity = 0.8 + Math.sin(time * 2) * 0.3;
}

export function tryPickupFlag(player, flags) {
    if (player.carryingFlag) return null;
    const pp = player.mesh.position;

    let nearest = null;
    let nearDist = PLAYER_PICKUP_RANGE;

    for (const f of flags) {
        if (f.isAligned) continue; // Don't pick up aligned flags
        const dx = f.x - pp.x;
        const dz = f.z - pp.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < nearDist) {
            nearDist = dist;
            nearest = f;
        }
    }

    if (nearest) {
        player.carryingFlag = nearest;
        nearest.mesh.visible = false;
        player.flagGroup.visible = true;
        return nearest;
    }
    return null;
}

export function tryPlaceFlag(player, scene, flags) {
    if (!player.carryingFlag) return null;
    const pp = player.mesh.position;
    const flag = player.carryingFlag;

    // Place at player position
    flag.x = pp.x;
    flag.z = pp.z;
    flag.mesh.position.set(pp.x, 0, pp.z);
    flag.mesh.rotation.set(0, 0, 0); // Straighten
    flag.mesh.visible = true;
    flag.isFoop = false;
    flag.foopFixed = true;
    flag.foopType = null;

    player.carryingFlag = null;
    player.flagGroup.visible = false;

    return flag;
}

export function tryFixNearbyFoop(player, flags) {
    if (player.carryingFlag) return null;
    const pp = player.mesh.position;

    for (const f of flags) {
        if (!f.isFoop || f.foopFixed) continue;
        const dx = f.x - pp.x;
        const dz = f.z - pp.z;
        if (Math.sqrt(dx * dx + dz * dz) < PLAYER_PICKUP_RANGE) {
            return f;
        }
    }
    return null;
}

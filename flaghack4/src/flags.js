import * as THREE from 'three';
import { FLAG_POLE_HEIGHT, FLAG_CLOTH_SIZE, FLAG_COLOR, FLAG_POLE_COLOR, FLAG_PLACE_OFFSET, FLAG_PICKUP_RADIUS } from './constants.js';

const flagMeshPool = [];

function createFlagMesh() {
    const group = new THREE.Group();

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.04, FLAG_POLE_HEIGHT, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: FLAG_POLE_COLOR, roughness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = FLAG_POLE_HEIGHT / 2;
    pole.castShadow = true;
    group.add(pole);

    // Cloth (diamond shape - rotated square, as per Flag Instructions)
    const clothSize = FLAG_CLOTH_SIZE;
    const clothGeo = new THREE.BufferGeometry();
    // Diamond shape: 4 vertices forming a rotated square
    const vertices = new Float32Array([
        0, 0, 0,                          // top (attached to pole)
        clothSize, -clothSize * 0.5, 0,   // right
        0, -clothSize, 0,                 // bottom
        0, 0, 0,                          // top again
        0, -clothSize, 0,                 // bottom again
        -clothSize * 0.1, -clothSize * 0.5, 0, // slight left for depth
    ]);
    // Use subdivided plane for animation
    const clothSubGeo = new THREE.PlaneGeometry(clothSize, clothSize, 8, 8);
    // Rotate 45 degrees to make diamond
    clothSubGeo.rotateZ(Math.PI / 4);
    const clothMat = new THREE.MeshStandardMaterial({
        color: FLAG_COLOR,
        side: THREE.DoubleSide,
        roughness: 0.7,
        emissive: 0x332200,
        emissiveIntensity: 0.15,
    });
    const cloth = new THREE.Mesh(clothSubGeo, clothMat);
    cloth.position.set(clothSize * 0.4, FLAG_POLE_HEIGHT - clothSize * 0.3, 0);
    cloth.castShadow = true;
    group.add(cloth);

    group.userData.cloth = cloth;
    group.userData.phase = Math.random() * Math.PI * 2;
    return group;
}

export function createFlagSystem() {
    return {
        groundFlags: [],  // { mesh, position, enchantment, geomanticaIndex }
        totalPlaced: 0,
    };
}

export function placeFlag(flagSystem, scene, playerPos, playerRotY) {
    const mesh = createFlagMesh();
    const offset = new THREE.Vector3(
        Math.sin(playerRotY) * FLAG_PLACE_OFFSET,
        0,
        Math.cos(playerRotY) * FLAG_PLACE_OFFSET
    );
    const pos = playerPos.clone().add(offset);
    pos.y = 0;
    mesh.position.copy(pos);
    scene.add(mesh);

    const flag = {
        mesh,
        position: pos.clone(),
        enchantment: null,
        geomanticaIndex: -1,
        pentagramId: -1,
    };
    flagSystem.groundFlags.push(flag);
    flagSystem.totalPlaced++;
    return flag;
}

export function pickupFlag(flagSystem, scene, playerPos) {
    let closest = null;
    let closestDist = FLAG_PICKUP_RADIUS;

    for (let i = flagSystem.groundFlags.length - 1; i >= 0; i--) {
        const f = flagSystem.groundFlags[i];
        const dist = playerPos.distanceTo(f.position);
        if (dist < closestDist) {
            closestDist = dist;
            closest = i;
        }
    }

    if (closest !== null) {
        const f = flagSystem.groundFlags[closest];
        scene.remove(f.mesh);
        flagSystem.groundFlags.splice(closest, 1);
        return true;
    }
    return false;
}

export function updateFlags(flagSystem, dt, time) {
    for (const flag of flagSystem.groundFlags) {
        const cloth = flag.mesh.userData.cloth;
        if (!cloth) continue;
        const phase = flag.mesh.userData.phase;
        const pos = cloth.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            // Wave displacement based on distance from pole
            const dist = Math.sqrt(x * x + y * y);
            const wave = Math.sin(time * 3 + phase + dist * 2) * 0.05 * dist;
            pos.setZ(i, wave);
        }
        pos.needsUpdate = true;

        // Enchantment glow
        if (flag.enchantment) {
            const mat = cloth.material;
            const pulse = 0.15 + Math.sin(time * 4) * 0.1;
            mat.emissiveIntensity = pulse;
        }
    }
}

export function getNearestFlag(flagSystem, position, maxDist) {
    let closest = null;
    let closestDist = maxDist;
    for (const f of flagSystem.groundFlags) {
        const dist = position.distanceTo(f.position);
        if (dist < closestDist) {
            closestDist = dist;
            closest = f;
        }
    }
    return closest;
}

export function removeFlag(flagSystem, scene, flag) {
    const idx = flagSystem.groundFlags.indexOf(flag);
    if (idx !== -1) {
        scene.remove(flag.mesh);
        flagSystem.groundFlags.splice(idx, 1);
    }
}

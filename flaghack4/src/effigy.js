import * as THREE from 'three';
import { EFFIGY_HP, EFFIGY_POSITION, EFFIGY_RADIUS } from './constants.js';

export function createEffigy(scene) {
    const group = new THREE.Group();
    const woodColor = 0x8b6914;
    const woodMat = new THREE.MeshStandardMaterial({ color: woodColor, roughness: 0.85 });

    // Platform
    const platGeo = new THREE.BoxGeometry(8, 0.5, 8);
    const plat = new THREE.Mesh(platGeo, woodMat);
    plat.position.y = 0.25;
    plat.castShadow = true;
    plat.receiveShadow = true;
    group.add(plat);

    // Body (torso)
    const bodyGeo = new THREE.BoxGeometry(2.5, 6, 1.5);
    const body = new THREE.Mesh(bodyGeo, woodMat);
    body.position.y = 3.5;
    body.castShadow = true;
    group.add(body);

    // X-bracing on body
    const braceGeo = new THREE.CylinderGeometry(0.05, 0.05, 7, 4);
    const brace1 = new THREE.Mesh(braceGeo, woodMat);
    brace1.position.set(0, 3.5, 0.8);
    brace1.rotation.z = 0.7;
    group.add(brace1);
    const brace2 = new THREE.Mesh(braceGeo, woodMat);
    brace2.position.set(0, 3.5, 0.8);
    brace2.rotation.z = -0.7;
    group.add(brace2);

    // Head
    const headGeo = new THREE.SphereGeometry(1, 8, 8);
    const head = new THREE.Mesh(headGeo, woodMat);
    head.position.y = 7.5;
    head.castShadow = true;
    group.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(6, 0.5, 0.5);
    const arms = new THREE.Mesh(armGeo, woodMat);
    arms.position.y = 5.5;
    arms.castShadow = true;
    group.add(arms);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 6);
    const leftLeg = new THREE.Mesh(legGeo, woodMat);
    leftLeg.position.set(-0.8, 0.5, 0);
    leftLeg.rotation.z = 0.15;
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, woodMat);
    rightLeg.position.set(0.8, 0.5, 0);
    rightLeg.rotation.z = -0.15;
    group.add(rightLeg);

    // HP bar backing
    const hpBg = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x440000, transparent: true, opacity: 0.7 })
    );
    hpBg.position.y = 9.5;
    hpBg.lookAt(new THREE.Vector3(0, 9.5, 1));
    group.add(hpBg);

    // HP bar fill
    const hpFill = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 0.4),
        new THREE.MeshBasicMaterial({ color: 0x44ff44 })
    );
    hpFill.position.y = 9.5;
    hpFill.position.z = 0.01;
    hpFill.lookAt(new THREE.Vector3(0, 9.5, 1));
    group.add(hpFill);

    group.position.set(EFFIGY_POSITION.x, 0, EFFIGY_POSITION.z);
    scene.add(group);

    // Fire particles (hidden initially, shown when damaged)
    const fireGroup = new THREE.Group();
    group.add(fireGroup);

    return {
        mesh: group,
        hpFill,
        fireGroup,
        hp: EFFIGY_HP,
        maxHp: EFFIGY_HP,
        position: new THREE.Vector3(EFFIGY_POSITION.x, 0, EFFIGY_POSITION.z),
        radius: EFFIGY_RADIUS,
    };
}

export function updateEffigy(effigy, dt, time) {
    // Update HP bar
    const ratio = Math.max(0, effigy.hp / effigy.maxHp);
    effigy.hpFill.scale.x = ratio;
    effigy.hpFill.position.x = -3 * (1 - ratio);

    // Color based on HP
    if (ratio > 0.5) {
        effigy.hpFill.material.color.setHex(0x44ff44);
    } else if (ratio > 0.25) {
        effigy.hpFill.material.color.setHex(0xffaa00);
    } else {
        effigy.hpFill.material.color.setHex(0xff2222);
    }

    // Billboard HP bar toward camera (simple rotation)
    // The HP bar always faces forward since it's at the top

    // Damage wobble
    if (effigy.hp < effigy.maxHp * 0.5) {
        const wobble = Math.sin(time * 8) * 0.01 * (1 - ratio);
        effigy.mesh.rotation.z = wobble;
    }
}

export function damageEffigy(effigy, amount) {
    effigy.hp = Math.max(0, effigy.hp - amount);
    return effigy.hp <= 0;
}

export function healEffigy(effigy, amount) {
    effigy.hp = Math.min(effigy.maxHp, effigy.hp + amount);
}

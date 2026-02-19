import * as THREE from 'three';
import {
    WORLD_SIZE, CAMP_COUNT, STRUCTURE_TYPES, FLAG_COLOR,
    DAY_DURATION,
} from './constants.js';

export function createWorld(scene) {
    // Sky
    scene.background = new THREE.Color(0x1a0a2a);

    // Ground - playa desert
    const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE * 1.5, WORLD_SIZE * 1.5, 32, 32);
    // Slight undulation
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, (Math.sin(x * 0.05) * Math.cos(y * 0.07) + Math.sin(x * 0.02 + y * 0.03)) * 0.3);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0xc4a86a, roughness: 0.95, metalness: 0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Playa dust texture via vertex colors
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
        const r = 0.7 + Math.random() * 0.1;
        const g = 0.6 + Math.random() * 0.08;
        const b = 0.35 + Math.random() * 0.1;
        colors.push(r, g, b);
    }
    groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    groundMat.vertexColors = true;

    // Camps with structures
    const camps = [];
    const structures = [];
    for (let i = 0; i < CAMP_COUNT; i++) {
        const angle = (i / CAMP_COUNT) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 20 + Math.random() * 50;
        const cx = Math.cos(angle) * dist;
        const cz = Math.sin(angle) * dist;

        const campGroup = new THREE.Group();
        campGroup.position.set(cx, 0, cz);

        // 2-4 structures per camp
        const structCount = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < structCount; j++) {
            const type = STRUCTURE_TYPES[Math.floor(Math.random() * STRUCTURE_TYPES.length)];
            const sGeo = new THREE.BoxGeometry(type.width, type.height, type.depth);
            const sMat = new THREE.MeshStandardMaterial({
                color: type.color, roughness: 0.7,
            });
            const sMesh = new THREE.Mesh(sGeo, sMat);
            sMesh.position.set(
                (Math.random() - 0.5) * 12,
                type.height / 2,
                (Math.random() - 0.5) * 12,
            );
            sMesh.rotation.y = Math.random() * Math.PI * 2;
            sMesh.castShadow = true;
            sMesh.receiveShadow = true;
            campGroup.add(sMesh);
            structures.push({
                mesh: sMesh,
                worldPos: new THREE.Vector3(cx + sMesh.position.x, 0, cz + sMesh.position.z),
                type,
            });
        }

        scene.add(campGroup);
        camps.push({ position: new THREE.Vector3(cx, 0, cz), group: campGroup });
    }

    // The Effigy at center
    const effigyGroup = new THREE.Group();
    const effigyBody = new THREE.CylinderGeometry(0.8, 1.2, 12, 8);
    const effigyMat = new THREE.MeshStandardMaterial({
        color: 0x8b6914, roughness: 0.8,
    });
    const effigyMesh = new THREE.Mesh(effigyBody, effigyMat);
    effigyMesh.position.y = 6;
    effigyMesh.castShadow = true;
    effigyGroup.add(effigyMesh);

    // Effigy arms
    for (let side = -1; side <= 1; side += 2) {
        const armGeo = new THREE.CylinderGeometry(0.3, 0.4, 5, 6);
        armGeo.rotateZ(side * 0.6);
        const arm = new THREE.Mesh(armGeo, effigyMat);
        arm.position.set(side * 2, 8, 0);
        arm.castShadow = true;
        effigyGroup.add(arm);
    }

    // Effigy head
    const headGeo = new THREE.SphereGeometry(1, 8, 8);
    const headMesh = new THREE.Mesh(headGeo, effigyMat);
    headMesh.position.y = 13;
    headMesh.castShadow = true;
    effigyGroup.add(headMesh);

    scene.add(effigyGroup);

    // Ambient dust particles (static)
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 500;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * WORLD_SIZE;
        dustPositions[i * 3 + 1] = Math.random() * 8;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * WORLD_SIZE;
    }
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
        color: 0xccaa77, size: 0.3, transparent: true, opacity: 0.4,
        blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    return { ground, camps, structures, effigy: effigyGroup, dust: dustPoints };
}

export function updateDayNight(scene, dirLight, ambientLight, time) {
    const cycle = (time % DAY_DURATION) / DAY_DURATION;
    const sunAngle = cycle * Math.PI * 2;
    const dayFactor = Math.max(0, Math.sin(sunAngle));

    // Sky color
    const skyR = 0.1 + dayFactor * 0.3;
    const skyG = 0.04 + dayFactor * 0.2;
    const skyB = 0.16 + dayFactor * 0.15;
    scene.background.setRGB(skyR, skyG, skyB);

    // Directional light
    dirLight.intensity = 0.2 + dayFactor * 1.2;
    dirLight.position.set(
        Math.cos(sunAngle) * 40,
        20 + dayFactor * 30,
        Math.sin(sunAngle) * 40,
    );
    dirLight.color.setRGB(
        0.9 + dayFactor * 0.1,
        0.6 + dayFactor * 0.35,
        0.3 + dayFactor * 0.3,
    );

    // Ambient
    ambientLight.intensity = 0.15 + dayFactor * 0.5;

    return { dayFactor, isNight: dayFactor < 0.3 };
}

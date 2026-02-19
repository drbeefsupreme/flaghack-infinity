// ── World Setup ──
import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, WORLD_EXTENT } from './constants.js';

export function createWorld(scene) {
    // Ground - playa desert
    const groundGeo = new THREE.PlaneGeometry(WORLD_EXTENT + 40, WORLD_EXTENT + 40);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x3a2a1a,
        roughness: 0.95,
        metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid highlight plane (subtle)
    const gridPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(WORLD_EXTENT, WORLD_EXTENT),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a2a,
            roughness: 0.9,
            transparent: true,
            opacity: 0.3,
        }),
    );
    gridPlane.rotation.x = -Math.PI / 2;
    gridPlane.position.y = 0;
    gridPlane.receiveShadow = true;
    scene.add(gridPlane);

    // Effigy at center back
    createEffigy(scene);

    // Ambient playa features outside grid
    createPlayaDecor(scene);

    // Dust particles
    createDustParticles(scene);
}

function createEffigy(scene) {
    const group = new THREE.Group();
    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 4, 6),
        new THREE.MeshStandardMaterial({ color: 0x8b6914, emissive: 0x331100, emissiveIntensity: 0.2 }),
    );
    body.position.y = 2;
    group.add(body);
    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x8b6914, emissive: 0x331100, emissiveIntensity: 0.2 }),
    );
    head.position.y = 4.5;
    group.add(head);
    // Arms
    for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 2, 4),
            new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
        );
        arm.rotation.z = side * 0.8;
        arm.position.set(side * 1.2, 3.2, 0);
        group.add(arm);
    }
    // Crown flag
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
    );
    pole.position.y = 5.7;
    group.add(pole);
    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.5, side: THREE.DoubleSide }),
    );
    cloth.rotation.y = Math.PI / 4;
    cloth.position.set(0.3, 6.2, 0);
    group.add(cloth);

    group.position.set(0, 0, -(WORLD_EXTENT / 2 + 8));
    scene.add(group);
}

function createPlayaDecor(scene) {
    const halfExt = WORLD_EXTENT / 2;
    // Scattered tents/camps outside grid
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist = halfExt + 10 + Math.random() * 15;
        const tent = new THREE.Mesh(
            new THREE.ConeGeometry(1.5 + Math.random(), 2 + Math.random() * 2, 4 + Math.floor(Math.random() * 3)),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.3, 0.25 + Math.random() * 0.15),
            }),
        );
        tent.position.set(Math.cos(angle) * dist, 1, Math.sin(angle) * dist);
        tent.rotation.y = Math.random() * Math.PI;
        scene.add(tent);
    }

    // Distant flags in the playa
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = halfExt + 5 + Math.random() * 25;
        const flagGroup = new THREE.Group();
        const fp = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 2, 4),
            new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
        );
        fp.position.y = 1;
        flagGroup.add(fp);
        const fc = new THREE.Mesh(
            new THREE.PlaneGeometry(0.4, 0.4),
            new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3, side: THREE.DoubleSide }),
        );
        fc.rotation.y = Math.PI / 4;
        fc.position.set(0.2, 1.8, 0);
        flagGroup.add(fc);
        flagGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        scene.add(flagGroup);
    }
}

function createDustParticles(scene) {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const extent = WORLD_EXTENT + 30;
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * extent;
        positions[i * 3 + 1] = Math.random() * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * extent;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xccaa88,
        size: 0.15,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
    });
    const dust = new THREE.Points(geo, mat);
    dust.userData.isDust = true;
    scene.add(dust);
}

export function updateDust(scene, dt) {
    scene.traverse(obj => {
        if (obj.userData.isDust && obj.geometry) {
            const pos = obj.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                pos.array[i * 3] += (Math.sin(Date.now() * 0.0003 + i) * 0.02);
                pos.array[i * 3 + 1] += dt * 0.1;
                if (pos.array[i * 3 + 1] > 8) pos.array[i * 3 + 1] = 0;
            }
            pos.needsUpdate = true;
        }
    });
}

import * as THREE from 'three';
import { WORLD_SIZE, PLAYA_COLOR_LIGHT, PLAYA_COLOR_DARK } from './constants.js';

export function createTerrain(scene) {
    const size = WORLD_SIZE * 2;
    const segments = 64;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const colors = [];
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        const noise = Math.sin(x * 0.05) * Math.cos(z * 0.07) * 0.3 +
                      Math.sin(x * 0.13 + z * 0.11) * 0.2;
        const t = Math.min(dist / WORLD_SIZE, 1.0);
        const colorLight = new THREE.Color(PLAYA_COLOR_LIGHT);
        const colorDark = new THREE.Color(PLAYA_COLOR_DARK);
        const c = colorLight.lerp(colorDark, t * 0.5 + noise * 0.3);
        colors.push(c.r, c.g, c.b);

        // subtle height variation
        const y = noise * 0.3 - 0.1;
        pos.setY(i, y);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.95,
        metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    scene.add(mesh);

    // scatter rocks
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x887766, roughness: 0.9 });
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * (WORLD_SIZE - 40);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(
            Math.cos(angle) * radius,
            Math.random() * 0.4,
            Math.sin(angle) * radius
        );
        const s = 0.3 + Math.random() * 0.8;
        rock.scale.set(s, s * 0.6, s);
        rock.rotation.y = Math.random() * Math.PI * 2;
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }

    return mesh;
}

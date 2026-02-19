import * as THREE from 'three';
import { WORLD_SIZE, RESOURCE_TYPES } from './constants.js';

function seededRandom(seed) {
    let s = seed | 0;
    return function() { s = (s * 1664525 + 1013904223) & 0xFFFFFFFF; return (s >>> 0) / 0xFFFFFFFF; };
}

export function createWorld(scene) {
    const rng = seededRandom(2042);

    // Ground - wasteland playa
    const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE * 2, WORLD_SIZE * 2, 48, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const colors = [];
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const noise = Math.sin(x * 0.04) * Math.cos(z * 0.06) * 0.3 + Math.sin(x * 0.11 + z * 0.09) * 0.2;
        const base = new THREE.Color(0x3a3528);
        const dry = new THREE.Color(0x4a4535);
        const c = base.clone().lerp(dry, noise * 0.5 + 0.5);
        colors.push(c.r, c.g, c.b);
        pos.setY(i, noise * 0.3);
    }
    groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    scene.add(ground);

    // Sky
    const skyGeo = new THREE.SphereGeometry(400, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x2a2a3a) },
            bottomColor: { value: new THREE.Color(0x3a3528) },
            offset: { value: 10 }, exponent: { value: 0.6 },
        },
        vertexShader: `varying vec3 vWP; void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `uniform vec3 topColor;uniform vec3 bottomColor;uniform float offset;uniform float exponent;varying vec3 vWP;void main(){float h=normalize(vWP+offset).y;gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0);}`,
        side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Lighting
    const sun = new THREE.DirectionalLight(0xccaa88, 1.0);
    sun.position.set(40, 60, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
    scene.add(sun);

    const ambient = new THREE.AmbientLight(0x222233, 0.4);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x556677, 0x3a3528, 0.3);
    scene.add(hemi);

    // Scatter resources
    const resources = [];
    const resourceNodes = [];

    // Wood (dead trees/lumber)
    for (let i = 0; i < 60; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = 20 + rng() * (WORLD_SIZE - 30);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        const group = new THREE.Group();
        // Dead tree trunk
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 2 + rng(), 5);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a2a, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1;
        trunk.rotation.z = (rng() - 0.5) * 0.3;
        trunk.castShadow = true;
        group.add(trunk);
        // A few bare branches
        for (let b = 0; b < 2; b++) {
            const brGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.8 + rng() * 0.5, 4);
            const br = new THREE.Mesh(brGeo, trunkMat);
            br.position.set((rng() - 0.5) * 0.3, 1.5 + rng() * 0.5, (rng() - 0.5) * 0.3);
            br.rotation.set(rng(), rng(), rng() - 0.5);
            group.add(br);
        }
        group.position.set(x, 0, z);
        scene.add(group);

        resources.push({
            type: 'WOOD', mesh: group, position: new THREE.Vector3(x, 0, z),
            amount: 2 + Math.floor(rng() * 3), depleted: false,
        });
    }

    // Cloth (abandoned fabric scraps on poles)
    for (let i = 0; i < 40; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = 15 + rng() * (WORLD_SIZE - 25);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        const group = new THREE.Group();
        const poleGeo = new THREE.CylinderGeometry(0.03, 0.04, 1.5, 4);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x887766 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 0.75;
        group.add(pole);
        const clothGeo = new THREE.PlaneGeometry(0.6, 0.4, 3, 3);
        const clothMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.12 + rng() * 0.08, 0.3, 0.4 + rng() * 0.2),
            side: THREE.DoubleSide, roughness: 0.8,
        });
        const cloth = new THREE.Mesh(clothGeo, clothMat);
        cloth.position.set(0.2, 1.2, 0);
        cloth.rotation.y = rng() * Math.PI;
        group.add(cloth);
        group.position.set(x, 0, z);
        scene.add(group);

        resources.push({
            type: 'CLOTH', mesh: group, position: new THREE.Vector3(x, 0, z),
            amount: 1 + Math.floor(rng() * 2), depleted: false,
        });
    }

    // Crystal nodes (rare, glowing)
    for (let i = 0; i < 15; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = 40 + rng() * (WORLD_SIZE - 50);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        const group = new THREE.Group();
        const crystalGeo = new THREE.OctahedronGeometry(0.5 + rng() * 0.3, 0);
        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0x88ccff, emissive: 0x4488cc, emissiveIntensity: 0.5,
            transparent: true, opacity: 0.85,
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.y = 0.5 + rng() * 0.3;
        crystal.rotation.set(rng(), rng(), rng());
        group.add(crystal);
        const light = new THREE.PointLight(0x4488cc, 1, 8);
        light.position.y = 0.8;
        group.add(light);
        group.position.set(x, 0, z);
        scene.add(group);

        resources.push({
            type: 'CRYSTAL', mesh: group, position: new THREE.Vector3(x, 0, z),
            amount: 1, depleted: false,
        });
    }

    // Rocks (decoration)
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x555544, roughness: 0.9 });
    for (let i = 0; i < 50; i++) {
        const rock = new THREE.Mesh(rockGeo, rockMat);
        const a = rng() * Math.PI * 2;
        const d = 10 + rng() * WORLD_SIZE;
        rock.position.set(Math.cos(a) * d, rng() * 0.3, Math.sin(a) * d);
        const s = 0.3 + rng() * 1;
        rock.scale.set(s, s * 0.5, s);
        rock.rotation.y = rng() * Math.PI * 2;
        rock.castShadow = true;
        scene.add(rock);
    }

    return { resources, sun, ambient, skyMat };
}

export function updateResources(resources, time) {
    for (const r of resources) {
        if (r.depleted && r.mesh) {
            r.mesh.visible = false;
        }
    }
}

export function gatherResource(resources, playerPos, range) {
    for (const r of resources) {
        if (r.depleted) continue;
        const dist = playerPos.distanceTo(r.position);
        if (dist < range) {
            r.depleted = true;
            return { type: r.type, amount: r.amount };
        }
    }
    return null;
}

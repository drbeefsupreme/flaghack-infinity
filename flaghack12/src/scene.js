// ── Three.js Background Scenes ──
import * as THREE from 'three';

let renderer, scene, camera;
let currentLocation = 'quad';
const locationObjects = {};

export function createScene() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight * 0.45);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const container = document.getElementById('scene-bg');
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0612);
    scene.fog = new THREE.FogExp2(0x0a0612, 0.02);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / (window.innerHeight * 0.45), 0.5, 100);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1.5, 0);

    scene.add(new THREE.AmbientLight(0x332244, 0.5));
    const dir = new THREE.DirectionalLight(0xffcc88, 0.6);
    dir.position.set(5, 10, 5);
    scene.add(dir);
    scene.add(new THREE.PointLight(0xffd700, 0.5, 20));

    buildLocationScenes();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerHeight * 0.45);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight * 0.45);
    });
}

function buildLocationScenes() {
    // QUAD - pentagram garden
    const quad = new THREE.Group();
    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(8, 5),
        new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 }),
    );
    ground.rotation.x = -Math.PI / 2;
    quad.add(ground);
    // Pentagram lines
    const pentMat = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 5; i++) {
        const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 2) % 5 / 5) * Math.PI * 2 - Math.PI / 2;
        const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(Math.cos(a1) * 5, 0.02, Math.sin(a1) * 5),
            new THREE.Vector3(Math.cos(a2) * 5, 0.02, Math.sin(a2) * 5),
        ]);
        quad.add(new THREE.Line(geo, pentMat));
    }
    // Flags at pentagram points
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        quad.add(createFlag(Math.cos(a) * 5, Math.sin(a) * 5));
    }
    locationObjects.quad = quad;

    // LIBRARY - dissolving books
    const library = new THREE.Group();
    const libFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 12),
        new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.9 }),
    );
    libFloor.rotation.x = -Math.PI / 2;
    library.add(libFloor);
    // Bookshelves
    for (let i = -2; i <= 2; i++) {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 3, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x4a3020 }),
        );
        shelf.position.set(i * 2.5, 1.5, -3);
        library.add(shelf);
        // Floating dissolving particles
        for (let j = 0; j < 5; j++) {
            const letter = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.08, 0.02),
                new THREE.MeshBasicMaterial({ color: 0xccaa88, transparent: true, opacity: 0.5 }),
            );
            letter.position.set(i * 2.5 + (Math.random() - 0.5), 1 + Math.random() * 2, -2.5 + Math.random());
            letter.userData.floatPhase = Math.random() * Math.PI * 2;
            library.add(letter);
        }
    }
    locationObjects.library = library;

    // LAB - antimeme void
    const lab = new THREE.Group();
    const labFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0x0a0020, roughness: 0.9 }),
    );
    labFloor.rotation.x = -Math.PI / 2;
    lab.add(labFloor);
    // Antimeme orbs
    for (let i = 0; i < 8; i++) {
        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 8, 6),
            new THREE.MeshStandardMaterial({
                color: 0x9944cc, emissive: 0x6622aa, emissiveIntensity: 0.5,
                transparent: true, opacity: 0.6,
            }),
        );
        orb.position.set((Math.random() - 0.5) * 6, 1 + Math.random() * 2, (Math.random() - 0.5) * 4);
        orb.userData.floatPhase = Math.random() * Math.PI * 2;
        lab.add(orb);
    }
    locationObjects.lab = lab;

    // GROVE - flag garden
    const grove = new THREE.Group();
    const groveFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 12),
        new THREE.MeshStandardMaterial({ color: 0x1a2a0a, roughness: 0.9 }),
    );
    groveFloor.rotation.x = -Math.PI / 2;
    grove.add(groveFloor);
    for (let i = 0; i < 12; i++) {
        grove.add(createFlag((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6));
    }
    // Trees
    for (let i = 0; i < 4; i++) {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 2, 5),
            new THREE.MeshStandardMaterial({ color: 0x4a3020 }),
        );
        trunk.position.set((Math.random() - 0.5) * 8, 1, (Math.random() - 0.5) * 4 - 2);
        grove.add(trunk);
        const canopy = new THREE.Mesh(
            new THREE.SphereGeometry(1, 6, 5),
            new THREE.MeshStandardMaterial({ color: 0x336622 }),
        );
        canopy.position.copy(trunk.position);
        canopy.position.y = 2.5;
        grove.add(canopy);
    }
    locationObjects.grove = grove;

    // OFFICE - flag schematics
    const office = new THREE.Group();
    const offFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 8),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
    );
    offFloor.rotation.x = -Math.PI / 2;
    office.add(offFloor);
    // Desk
    const desk = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.8, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x5a3a1a }),
    );
    desk.position.set(0, 0.4, -1);
    office.add(desk);
    // Chair
    const chair = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x3a2a1a }),
    );
    chair.position.set(0, 0.6, 0.5);
    office.add(chair);
    // Wall with schematics (floating planes)
    for (let i = 0; i < 6; i++) {
        const schema = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.6),
            new THREE.MeshBasicMaterial({ color: 0xccaa88, transparent: true, opacity: 0.3 }),
        );
        schema.position.set(-2 + i * 0.9, 2 + Math.random() * 0.5, -3.5);
        office.add(schema);
    }
    locationObjects.office = office;

    // EFFIGY
    const effigy = new THREE.Group();
    const efFloor = new THREE.Mesh(
        new THREE.CircleGeometry(6, 6),
        new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 }),
    );
    efFloor.rotation.x = -Math.PI / 2;
    effigy.add(efFloor);
    // Effigy figure
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 4, 6),
        new THREE.MeshStandardMaterial({ color: 0x8b6914, emissive: 0x331100, emissiveIntensity: 0.2 }),
    );
    body.position.y = 2;
    effigy.add(body);
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x8b6914, emissive: 0x331100, emissiveIntensity: 0.2 }),
    );
    head.position.y = 4.5;
    effigy.add(head);
    // Crown flag
    effigy.add(createFlag(0, 0, 5.5));
    // Ring of light
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3, 0.05, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    effigy.add(ring);
    locationObjects.effigy = effigy;
}

function createFlag(x, z, baseY = 0) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
    );
    pole.position.y = 1 + baseY;
    group.add(pole);
    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.4),
        new THREE.MeshStandardMaterial({
            color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3, side: THREE.DoubleSide,
        }),
    );
    cloth.rotation.y = Math.PI / 4;
    cloth.position.set(0.2, 1.8 + baseY, 0);
    group.add(cloth);
    group.position.set(x, 0, z);
    return group;
}

export function setLocation(locationId) {
    // Remove current
    if (locationObjects[currentLocation]) {
        scene.remove(locationObjects[currentLocation]);
    }
    currentLocation = locationId;
    if (locationObjects[locationId]) {
        scene.add(locationObjects[locationId]);
    }
}

export function setAKStageVisual(stage) {
    // Progressively alter the scene based on AK stage
    if (stage >= 1) {
        scene.fog = new THREE.FogExp2(0x0a0612, 0.015);
        scene.background = new THREE.Color(0x080410);
    }
    if (stage >= 2) {
        scene.fog = new THREE.FogExp2(0x100820, 0.01);
        scene.background = new THREE.Color(0x100820);
    }
    if (stage >= 3) {
        scene.fog = new THREE.FogExp2(0x1a0a2a, 0.008);
        scene.background = new THREE.Color(0x1a0a2a);
    }
}

export function renderScene(dt) {
    if (!renderer) return;
    const t = Date.now() * 0.001;

    // Animate floating objects in current location
    const loc = locationObjects[currentLocation];
    if (loc) {
        loc.traverse(obj => {
            if (obj.userData.floatPhase !== undefined) {
                obj.position.y += Math.sin(t * 1.5 + obj.userData.floatPhase) * 0.002;
                obj.rotation.y = Math.sin(t * 0.5 + obj.userData.floatPhase) * 0.3;
            }
        });
    }

    // Camera gentle sway
    camera.position.x = Math.sin(t * 0.3) * 0.3;
    camera.position.y = 3 + Math.sin(t * 0.2) * 0.1;
    camera.lookAt(0, 1.5, 0);

    renderer.render(scene, camera);
}

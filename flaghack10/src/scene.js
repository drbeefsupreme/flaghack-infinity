// ── Three.js Battle Scene ──
import * as THREE from 'three';

let scene, camera, renderer;
let playerMesh, enemyMesh, arena, particles;
let animState = { playerHit: 0, enemyHit: 0, playerHeal: 0 };

export function createBattleScene() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight * 0.4);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const container = document.getElementById('scene-container');
    container.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0612);
    scene.fog = new THREE.FogExp2(0x0a0612, 0.015);

    // Camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / (window.innerHeight * 0.4), 0.5, 200);
    camera.position.set(0, 8, 18);
    camera.lookAt(0, 2, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0x332244, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffcc88, 0.7);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);
    const goldLight = new THREE.PointLight(0xffd700, 0.8, 30);
    goldLight.position.set(0, 5, 0);
    scene.add(goldLight);

    // Arena floor - pentagram
    const floorGeo = new THREE.CircleGeometry(12, 5);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x1a0a2a, roughness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Pentagram lines on floor
    createPentagram(scene);

    // Player (Vexillomancer) - golden robed figure with flag
    playerMesh = createVexillomancer(0xffd700);
    playerMesh.position.set(-5, 0, 4);
    scene.add(playerMesh);

    // Enemy placeholder (updated per battle)
    enemyMesh = createEnemyMesh(0x66aa44);
    enemyMesh.position.set(5, 0, -2);
    scene.add(enemyMesh);

    // Floating flags around arena
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const flag = createFlagPillar();
        flag.position.set(Math.cos(angle) * 10, 0, Math.sin(angle) * 10);
        flag.userData.phase = i * 1.2;
        scene.add(flag);
    }

    // Particles
    const pCount = 100;
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 24;
        pPositions[i * 3 + 1] = Math.random() * 10;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color: 0xffd700, size: 0.12, transparent: true, opacity: 0.5, depthWrite: false,
    }));
    scene.add(particles);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerHeight * 0.4);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight * 0.4);
    });
}

function createPentagram(scene) {
    const mat = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 });
    const points = [];
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        points.push(new THREE.Vector3(Math.cos(a) * 8, 0.02, Math.sin(a) * 8));
    }
    // Draw star
    for (let i = 0; i < 5; i++) {
        const geo = new THREE.BufferGeometry().setFromPoints([
            points[i], points[(i + 2) % 5],
        ]);
        scene.add(new THREE.Line(geo, mat));
    }
}

function createVexillomancer(color) {
    const group = new THREE.Group();
    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 2, 6),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 }),
    );
    body.position.y = 1;
    group.add(body);
    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xddbb88 }),
    );
    head.position.y = 2.3;
    group.add(head);
    // Flag weapon
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
    );
    pole.position.set(0.6, 1.8, 0);
    pole.rotation.z = -0.3;
    group.add(pole);
    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.4, side: THREE.DoubleSide }),
    );
    cloth.position.set(0.9, 2.8, 0);
    cloth.rotation.y = Math.PI / 4;
    group.add(cloth);
    return group;
}

function createEnemyMesh(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.6, 2.2, 6),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 }),
    );
    body.position.y = 1.1;
    group.add(body);
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 6),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 }),
    );
    head.position.y = 2.5;
    group.add(head);
    // Eyes
    for (const side of [-0.15, 0.15]) {
        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xff3333 }),
        );
        eye.position.set(side, 2.6, 0.35);
        group.add(eye);
    }
    return group;
}

function createFlagPillar() {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
    );
    pole.position.y = 1.5;
    group.add(pole);
    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.5),
        new THREE.MeshStandardMaterial({
            color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3, side: THREE.DoubleSide,
        }),
    );
    cloth.rotation.y = Math.PI / 4;
    cloth.position.set(0.25, 2.7, 0);
    group.add(cloth);
    return group;
}

export function updateEnemyAppearance(factionColor) {
    if (!enemyMesh) return;
    const c = new THREE.Color(factionColor);
    enemyMesh.traverse(child => {
        if (child.isMesh && child.material && child !== enemyMesh.children[enemyMesh.children.length - 1] && child !== enemyMesh.children[enemyMesh.children.length - 2]) {
            child.material.color.copy(c);
            if (child.material.emissive) child.material.emissive.copy(c);
        }
    });
}

export function triggerAnimation(type) {
    if (type === 'player_hit') animState.playerHit = 1;
    if (type === 'enemy_hit') animState.enemyHit = 1;
    if (type === 'player_heal') animState.playerHeal = 1;
}

export function renderScene(dt) {
    if (!renderer) return;
    const t = Date.now() * 0.001;

    // Animate player
    if (playerMesh) {
        playerMesh.position.y = Math.sin(t * 1.5) * 0.1;
        if (animState.playerHit > 0) {
            playerMesh.position.x = -5 + Math.sin(animState.playerHit * 20) * 0.3;
            animState.playerHit = Math.max(0, animState.playerHit - dt * 3);
        }
    }

    // Animate enemy
    if (enemyMesh) {
        enemyMesh.position.y = Math.sin(t * 1.2 + 1) * 0.1;
        if (animState.enemyHit > 0) {
            enemyMesh.position.x = 5 + Math.sin(animState.enemyHit * 20) * 0.3;
            animState.enemyHit = Math.max(0, animState.enemyHit - dt * 3);
        }
    }

    // Animate arena flags
    scene.traverse(obj => {
        if (obj.userData.phase !== undefined) {
            const flag = obj.children[1]; // cloth
            if (flag) {
                flag.position.y = 2.7 + Math.sin(t * 2 + obj.userData.phase) * 0.15;
            }
        }
    });

    // Particles float
    if (particles) {
        const pos = particles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.array[i * 3 + 1] += dt * 0.3;
            if (pos.array[i * 3 + 1] > 10) pos.array[i * 3 + 1] = 0;
            pos.array[i * 3] += Math.sin(t + i) * 0.005;
        }
        pos.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

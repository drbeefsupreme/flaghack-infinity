// ── FLAGHACK 9: THE VEXILLORAMANOMICON ── Main ──
import * as THREE from 'three';
import {
    GRID_SIZE, CELL_SIZE, WORLD_EXTENT,
    CAMERA_HEIGHT, CAMERA_MIN_HEIGHT, CAMERA_MAX_HEIGHT,
    CAMERA_PAN_SPEED, CAMERA_ZOOM_SPEED,
    STARTING_FLAGIC,
} from './constants.js';
import { createWorld, updateDust } from './world.js';
import {
    createGridVisual, placeMachine, removeMachine, updateMachines,
    smoothItemPositions, worldToGrid, gridToWorld, getCell,
} from './grid.js';
import {
    createHUD, updateHUD, toggleGrimoire, rotateDirection, cancelBuild,
    getSelectedBuild, getCurrentDirection, refreshBuildBar,
    showTooltip, hideTooltip,
} from './hud.js';
import { isUnlockAvailable } from './grimoire.js';

// ── Game State ──
const gameState = {
    flagic: STARTING_FLAGIC,
    totalFlagicEarned: 0,
    totalProduced: {},
    pagesUnlocked: 4,
    omegaUnlocked: false,
    omegaShown: false,
    particles: [],
    time: 0,
};

// ── Renderer ──
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// ── Scene ──
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0612);
scene.fog = new THREE.FogExp2(0x0a0612, 0.004);

// ── Camera ──
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 500);
camera.position.set(0, CAMERA_HEIGHT, 35);
camera.lookAt(0, 0, 0);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Lighting ──
const ambientLight = new THREE.AmbientLight(0x332244, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffcc88, 0.8);
dirLight.position.set(30, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 120;
dirLight.shadow.camera.left = -60;
dirLight.shadow.camera.right = 60;
dirLight.shadow.camera.top = 60;
dirLight.shadow.camera.bottom = -60;
scene.add(dirLight);

// Golden point light at center for warmth
const goldLight = new THREE.PointLight(0xffd700, 0.6, 60);
goldLight.position.set(0, 10, 0);
scene.add(goldLight);

// ── Build World ──
createWorld(scene);
createGridVisual(scene);
createHUD();

// ── Hover highlight ──
const hoverMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.25 });
const hoverMesh = new THREE.Mesh(new THREE.BoxGeometry(CELL_SIZE * 0.95, 0.1, CELL_SIZE * 0.95), hoverMat);
hoverMesh.visible = false;
scene.add(hoverMesh);

// ── Input State ──
const keys = {};
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let deleteMode = false;

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === 'g') {
        toggleGrimoire(gameState);
    } else if (e.key.toLowerCase() === 'r') {
        rotateDirection();
    } else if (e.key === 'Escape') {
        cancelBuild();
        deleteMode = false;
    } else if (e.key.toLowerCase() === 'x') {
        deleteMode = !deleteMode;
        cancelBuild();
    }
    // Number hotkeys for build bar
    if (e.key >= '1' && e.key <= '9') {
        selectBuildByIndex(parseInt(e.key) - 1);
    }
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function selectBuildByIndex(idx) {
    const btns = document.querySelectorAll('.build-btn');
    if (btns[idx]) {
        btns[idx].click();
        deleteMode = false;
    }
}

// ── Ground plane for raycasting ──
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

window.addEventListener('click', e => {
    if (e.target.closest('#build-bar') || e.target.closest('#grimoire-panel') || e.target.closest('#omega-overlay')) return;

    raycaster.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersect);
    if (!intersect) return;

    const gc = worldToGrid(intersect.x, intersect.z);

    if (deleteMode) {
        removeMachine(gc.x, gc.z, scene, gameState);
        return;
    }

    const build = getSelectedBuild();
    if (!build) return;

    // Check unlock availability
    if (!isUnlockAvailable(build)) return;

    const dir = getCurrentDirection();
    if (placeMachine(build, gc.x, gc.z, dir, scene, gameState)) {
        // Success feedback could go here
    }
});

// ── Camera Controls ──
function updateCamera(dt) {
    const speed = CAMERA_PAN_SPEED * camera.position.y * dt * 60;
    if (keys['w'] || keys['arrowup'])    camera.position.z -= speed;
    if (keys['s'] || keys['arrowdown'])  camera.position.z += speed;
    if (keys['a'] || keys['arrowleft'])  camera.position.x -= speed;
    if (keys['d'] || keys['arrowright']) camera.position.x += speed;

    // Clamp
    const maxPan = WORLD_EXTENT * 0.6;
    camera.position.x = Math.max(-maxPan, Math.min(maxPan, camera.position.x));
    camera.position.z = Math.max(-maxPan, Math.min(maxPan, camera.position.z));
}

window.addEventListener('wheel', e => {
    camera.position.y += e.deltaY * 0.05;
    camera.position.y = Math.max(CAMERA_MIN_HEIGHT, Math.min(CAMERA_MAX_HEIGHT, camera.position.y));
});

// ── Floating text particles ──
const floatTexts = [];

function updateFloatTexts(dt) {
    // Process new particles from gameState
    while (gameState.particles.length > 0) {
        const p = gameState.particles.shift();
        const div = document.createElement('div');
        div.className = 'float-text';
        div.textContent = p.text;
        div.style.left = '50%';
        div.style.top = '50%';
        document.body.appendChild(div);
        floatTexts.push({ ...p, div, elapsed: 0 });
    }
    // Update existing
    for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.elapsed += dt;
        if (ft.elapsed >= ft.maxLife) {
            ft.div.remove();
            floatTexts.splice(i, 1);
            continue;
        }
        // Project to screen
        const v = new THREE.Vector3(ft.x, ft.y + ft.elapsed * 1.5, ft.z);
        v.project(camera);
        const sx = (v.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-v.y * 0.5 + 0.5) * window.innerHeight;
        ft.div.style.left = sx + 'px';
        ft.div.style.top = sy + 'px';
        ft.div.style.opacity = 1 - ft.elapsed / ft.maxLife;
    }
}

// ── Hover update ──
function updateHover() {
    raycaster.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersect);
    if (!intersect) { hoverMesh.visible = false; return; }

    const gc = worldToGrid(intersect.x, intersect.z);
    if (gc.x < 0 || gc.x >= GRID_SIZE || gc.z < 0 || gc.z >= GRID_SIZE) {
        hoverMesh.visible = false;
        return;
    }

    const wp = gridToWorld(gc.x, gc.z);
    hoverMesh.position.set(wp.x, 0.05, wp.z);
    hoverMesh.visible = true;

    const cell = getCell(gc.x, gc.z);
    if (deleteMode) {
        hoverMat.color.setHex(cell ? 0xff3333 : 0x333333);
    } else {
        hoverMat.color.setHex(cell ? 0xff6633 : 0xffd700);
    }
}

// ── Game Loop ──
const clock = new THREE.Clock();
let started = false;

function startGame() {
    started = true;
    document.getElementById('title-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('title-screen').style.display = 'none';
    }, 1500);
}

document.getElementById('start-btn').addEventListener('click', startGame);

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);

    if (!started) {
        // Idle title camera
        camera.position.x = Math.sin(Date.now() * 0.0002) * 5;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        return;
    }

    gameState.time += dt;

    updateCamera(dt);
    camera.lookAt(camera.position.x, 0, camera.position.z - camera.position.y * 0.5);

    updateMachines(dt, scene, gameState);
    smoothItemPositions(dt);
    updateHover();
    updateDust(scene, dt);
    updateFloatTexts(dt);
    updateHUD(gameState);

    // Pulse gold light with factory activity
    goldLight.intensity = 0.4 + Math.sin(gameState.time * 2) * 0.2;

    renderer.render(scene, camera);
}

animate();

import * as THREE from 'three';
import {
    WORLD_SIZE, CAMERA_HEIGHT, CAMERA_MIN_HEIGHT, CAMERA_MAX_HEIGHT,
    CAMERA_PAN_SPEED, CAMERA_ZOOM_SPEED,
    WAVE_INTERVAL, WAVE_BASE_FOOPS, WAVE_GROWTH,
    NIGHT_FOOP_MULTIPLIER, RECRUIT_COST, MAX_VEXILLOMANCERS,
    QD_PER_ALIGNMENT, QD_PER_PENTAGRAM, QD_PER_RECRUIT, QD_MAX, QD_LEVELS,
    SCORE_FOOP_FIXED, SCORE_FLAG_ALIGNED, SCORE_PENTAGRAM, SCORE_RECRUIT,
    PROPAGANDA_SLOGANS, FOOP_TYPES, VEXILLOMANCER_TYPES,
} from './constants.js';
import { createWorld, updateDayNight } from './world.js';
import {
    createFlag, spawnFoops, fixFoop, alignFlag,
    createLeyFacets, updateLeyLines, detectPentagrams, animateFlags,
} from './flags.js';
import { createPlayer, updatePlayer, tryPickupFlag, tryPlaceFlag, tryFixNearbyFoop } from './player.js';
import { createVexillomancer, updateVexillomancers } from './vexillomancers.js';

// ── Renderer / Scene / Camera ──
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a0a2a, 0.005);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 500);
camera.position.set(0, CAMERA_HEIGHT, 30);
camera.lookAt(0, 0, 0);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Lighting ──
const ambientLight = new THREE.AmbientLight(0x221133, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffaa66, 1);
dirLight.position.set(30, 40, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 120;
dirLight.shadow.camera.left = -80;
dirLight.shadow.camera.right = 80;
dirLight.shadow.camera.top = 80;
dirLight.shadow.camera.bottom = -80;
scene.add(dirLight);

// ── Game State ──
const gameState = {
    phase: 'title', // title, playing, paused
    time: 0,
    score: 0,
    quantumDestiny: 0,
    qdLevel: 0,
    waveNumber: 0,
    waveTimer: WAVE_INTERVAL,
    flags: [],
    vexillomancers: [],
    pentagrams: [],
    alignedCount: 0,
    foopsFixed: 0,
    totalFoopsSpawned: 0,
};

const input = { w: false, a: false, s: false, d: false };

// ── Build World ──
const world = createWorld(scene);
const { facets: leyFacets, visuals: leyFacetVisuals } = createLeyFacets(scene);
const leyLineGroup = new THREE.Group();
scene.add(leyLineGroup);

let player = null;

// ── HUD Elements ──
const hudEl = document.getElementById('hud');
const hudScore = document.getElementById('hud-score');
const hudFoops = document.getElementById('hud-foops');
const hudAligned = document.getElementById('hud-aligned');
const hudWorkers = document.getElementById('hud-workers');
const hudQd = document.getElementById('hud-qd');
const hudQdLevel = document.getElementById('hud-qd-level');
const hudWave = document.getElementById('hud-wave');
const hudTime = document.getElementById('hud-time');
const notifEl = document.getElementById('notification');
const titleScreen = document.getElementById('title-screen');
const toolPanel = document.getElementById('tool-panel');
const recruitPanel = document.getElementById('recruit-panel');

let notificationTimer = 0;

function showNotification(text, duration) {
    notifEl.textContent = text;
    notifEl.style.display = 'block';
    notifEl.style.opacity = '1';
    notificationTimer = duration || 2;
}

function updateHUD() {
    const foopCount = gameState.flags.filter(f => f.isFoop && !f.foopFixed).length;
    hudScore.textContent = gameState.score;
    hudFoops.textContent = foopCount;
    hudAligned.textContent = gameState.alignedCount;
    hudWorkers.textContent = `${gameState.vexillomancers.length}/${MAX_VEXILLOMANCERS}`;

    hudQd.textContent = Math.floor(gameState.quantumDestiny);
    const qdPct = (gameState.quantumDestiny / QD_MAX) * 100;
    hudQd.style.color = QD_LEVELS[gameState.qdLevel].color;

    hudQdLevel.textContent = QD_LEVELS[gameState.qdLevel].name;
    hudQdLevel.style.color = QD_LEVELS[gameState.qdLevel].color;

    hudWave.textContent = gameState.waveNumber;
    hudTime.textContent = gameState.phase === 'playing' ? formatTime(gameState.time) : '--:--';

    // Recruit button state
    const canRecruit = gameState.alignedCount >= RECRUIT_COST
        && gameState.vexillomancers.length < MAX_VEXILLOMANCERS;
    recruitPanel.style.opacity = canRecruit ? '1' : '0.4';
}

function formatTime(t) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Input ──
document.addEventListener('keydown', e => {
    if (e.key === 'w' || e.key === 'W') input.w = true;
    if (e.key === 'a' || e.key === 'A') input.a = true;
    if (e.key === 's' || e.key === 'S') input.s = true;
    if (e.key === 'd' || e.key === 'D') input.d = true;

    if (gameState.phase !== 'playing') return;

    // E - Pick up / fix nearby FOOP
    if (e.key === 'e' || e.key === 'E') {
        if (player.carryingFlag) {
            const placed = tryPlaceFlag(player, scene, gameState.flags);
            if (placed) {
                showNotification('Flag placed!', 1);
                // Try auto-align
                if (alignFlag(placed, leyFacets)) {
                    gameState.alignedCount++;
                    gameState.score += SCORE_FLAG_ALIGNED;
                    addQuantumDestiny(QD_PER_ALIGNMENT);
                    showNotification('Flag ALIGNED to Ley facet!', 1.5);
                }
                gameState.foopsFixed++;
                gameState.score += SCORE_FOOP_FIXED;
                updateLeyLines(scene, gameState.flags, leyLineGroup);
                checkPentagrams();
            }
        } else {
            const foop = tryFixNearbyFoop(player, gameState.flags);
            if (foop) {
                // Fix types that don't need picking up
                const type = FOOP_TYPES[foop.foopType];
                if (type.fix === 'pickup_and_place' || type.fix === 'dig_and_place') {
                    tryPickupFlag(player, gameState.flags);
                    showNotification(`Picked up ${type.name} flag`, 1);
                } else {
                    fixFoop(foop);
                    gameState.foopsFixed++;
                    gameState.score += SCORE_FOOP_FIXED;
                    showNotification(`Fixed ${type.name} flag!`, 1);
                    // Try auto-align
                    if (alignFlag(foop, leyFacets)) {
                        gameState.alignedCount++;
                        gameState.score += SCORE_FLAG_ALIGNED;
                        addQuantumDestiny(QD_PER_ALIGNMENT);
                        showNotification('Flag ALIGNED!', 1.5);
                    }
                    updateLeyLines(scene, gameState.flags, leyLineGroup);
                    checkPentagrams();
                }
            }
        }
    }

    // Q - Align nearby fixed flag
    if (e.key === 'q' || e.key === 'Q') {
        const pp = player.mesh.position;
        for (const f of gameState.flags) {
            if (f.isFoop || f.isAligned) continue;
            const dx = f.x - pp.x;
            const dz = f.z - pp.z;
            if (Math.sqrt(dx * dx + dz * dz) < 4) {
                if (alignFlag(f, leyFacets)) {
                    gameState.alignedCount++;
                    gameState.score += SCORE_FLAG_ALIGNED;
                    addQuantumDestiny(QD_PER_ALIGNMENT);
                    showNotification('Flag ALIGNED to Ley facet!', 1.5);
                    updateLeyLines(scene, gameState.flags, leyLineGroup);
                    checkPentagrams();
                }
                break;
            }
        }
    }

    // R - Recruit vexillomancer
    if (e.key === 'r' || e.key === 'R') {
        recruitVexillomancer();
    }

    // 1-4 - Select recruit type
    if (e.key >= '1' && e.key <= '4') {
        const typeIdx = parseInt(e.key) - 1;
        recruitVexillomancer(typeIdx);
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'w' || e.key === 'W') input.w = false;
    if (e.key === 'a' || e.key === 'A') input.a = false;
    if (e.key === 's' || e.key === 'S') input.s = false;
    if (e.key === 'd' || e.key === 'D') input.d = false;
});

// Mouse scroll for camera zoom
document.addEventListener('wheel', e => {
    camera.position.y += e.deltaY * CAMERA_ZOOM_SPEED * 0.01;
    camera.position.y = Math.max(CAMERA_MIN_HEIGHT, Math.min(CAMERA_MAX_HEIGHT, camera.position.y));
});

document.addEventListener('click', () => {
    if (gameState.phase === 'title') {
        startGame();
    }
});

// ── Recruitment ──
function recruitVexillomancer(typeIdx) {
    if (typeIdx === undefined) typeIdx = Math.floor(Math.random() * VEXILLOMANCER_TYPES.length);
    if (gameState.alignedCount < RECRUIT_COST) {
        showNotification(`Need ${RECRUIT_COST} aligned flags to recruit!`, 1.5);
        return;
    }
    if (gameState.vexillomancers.length >= MAX_VEXILLOMANCERS) {
        showNotification('Maximum Vexillomancers reached!', 1.5);
        return;
    }

    // Spend aligned flags (deduct from count, don't destroy them)
    gameState.alignedCount -= RECRUIT_COST;
    // Un-align some flags
    let toUnalign = RECRUIT_COST;
    for (const f of gameState.flags) {
        if (f.isAligned && toUnalign > 0) {
            f.isAligned = false;
            f.leyFacet = -1;
            f.cloth.material.color.setHex(0xffd700);
            f.cloth.material.emissiveIntensity = 0.2;
            f.glowLight.intensity = 0;
            toUnalign--;
        }
    }

    const pp = player.mesh.position;
    const config = VEXILLOMANCER_TYPES[typeIdx];
    const v = createVexillomancer(scene, typeIdx, pp.x + (Math.random() - 0.5) * 4, pp.z + (Math.random() - 0.5) * 4);
    gameState.vexillomancers.push(v);
    gameState.score += SCORE_RECRUIT;
    addQuantumDestiny(QD_PER_RECRUIT);
    showNotification(`Recruited ${config.name}! "${PROPAGANDA_SLOGANS[Math.floor(Math.random() * PROPAGANDA_SLOGANS.length)]}"`, 2);

    updateLeyLines(scene, gameState.flags, leyLineGroup);
}

// ── Quantum Destiny ──
function addQuantumDestiny(amount) {
    gameState.quantumDestiny = Math.min(QD_MAX, gameState.quantumDestiny + amount);

    // Check level up
    for (let i = QD_LEVELS.length - 1; i >= 0; i--) {
        if (gameState.quantumDestiny >= QD_LEVELS[i].threshold) {
            if (i > gameState.qdLevel) {
                gameState.qdLevel = i;
                showNotification(`QUANTUM DESTINY: ${QD_LEVELS[i].name}!`, 3);
                if (i === QD_LEVELS.length - 1) {
                    showNotification('YOU ARE THE LEAD VEXILLOMANCER! GLORIOUS!', 5);
                }
            }
            break;
        }
    }
}

// ── Pentagrams ──
function checkPentagrams() {
    const newPentagrams = detectPentagrams(gameState.flags);
    if (newPentagrams.length > gameState.pentagrams.length) {
        const diff = newPentagrams.length - gameState.pentagrams.length;
        gameState.score += SCORE_PENTAGRAM * diff;
        addQuantumDestiny(QD_PER_PENTAGRAM * diff);
        showNotification(`PENTAGRAM FORMED! Flagic energy surges!`, 2.5);
    }
    gameState.pentagrams = newPentagrams;
}

// ── Waves ──
function spawnWave() {
    gameState.waveNumber++;
    const count = WAVE_BASE_FOOPS + gameState.waveNumber * WAVE_GROWTH;
    const finalCount = Math.floor(count * (gameState._isNight ? NIGHT_FOOP_MULTIPLIER : 1));
    const newFoops = spawnFoops(scene, gameState.flags, finalCount, world.structures);
    gameState.totalFoopsSpawned += finalCount;
    showNotification(`Wave ${gameState.waveNumber}: ${finalCount} FOOPs detected!`, 2);
}

// ── Game Lifecycle ──
function startGame() {
    titleScreen.style.opacity = '0';
    setTimeout(() => { titleScreen.style.display = 'none'; }, 1500);
    hudEl.style.display = 'block';
    toolPanel.style.display = 'block';
    recruitPanel.style.display = 'block';

    player = createPlayer(scene);
    gameState.phase = 'playing';

    // Initial FOOPs
    spawnFoops(scene, gameState.flags, 15, world.structures);
    gameState.totalFoopsSpawned = 15;

    // Also place a few already-fixed flags near center for tutorial feel
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const f = createFlag(scene, Math.cos(angle) * 8, Math.sin(angle) * 8, false, null);
        f.isFoop = false;
        f.foopFixed = true;
        gameState.flags.push(f);
    }

    showNotification('"FLAGS! FIND THEM! - MOVE THEM!"', 3);
}

// ── Camera ──
function updateCamera() {
    if (!player) return;
    const pp = player.mesh.position;
    const targetX = pp.x;
    const targetZ = pp.z + camera.position.y * 0.4;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(pp.x, 0, pp.z);
}

// ── Pentagram Visuals ──
const pentagramVisualGroup = new THREE.Group();
scene.add(pentagramVisualGroup);

function updatePentagramVisuals(time) {
    while (pentagramVisualGroup.children.length) {
        pentagramVisualGroup.remove(pentagramVisualGroup.children[0]);
    }

    const mat = new THREE.LineBasicMaterial({
        color: 0xffd700, transparent: true,
        opacity: 0.4 + Math.sin(time * 2) * 0.2,
        blending: THREE.AdditiveBlending,
    });

    for (const penta of gameState.pentagrams) {
        for (let i = 0; i < 5; i++) {
            const a = penta[i];
            const b = penta[(i + 2) % 5];
            const geo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(a.x, 0.5, a.z),
                new THREE.Vector3(b.x, 0.5, b.z),
            ]);
            pentagramVisualGroup.add(new THREE.Line(geo, mat));
        }
    }
}

// ── Main Loop ──
let lastTime = 0;

function loop(timestamp) {
    requestAnimationFrame(loop);

    const rawDt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05);
    gameState.time += dt;
    const time = gameState.time;

    // Notification fade
    if (notificationTimer > 0) {
        notificationTimer -= dt;
        if (notificationTimer <= 0) {
            notifEl.style.opacity = '0';
            setTimeout(() => { notifEl.style.display = 'none'; }, 500);
        }
    }

    if (gameState.phase === 'title') {
        // Slow camera orbit for title screen
        camera.position.x = Math.cos(time * 0.1) * 30;
        camera.position.z = Math.sin(time * 0.1) * 30;
        camera.position.y = CAMERA_HEIGHT;
        camera.lookAt(0, 5, 0);

        updateDayNight(scene, dirLight, ambientLight, time);
        renderer.render(scene, camera);
        return;
    }

    if (gameState.phase !== 'playing') {
        renderer.render(scene, camera);
        return;
    }

    // Day/night
    const { dayFactor, isNight } = updateDayNight(scene, dirLight, ambientLight, time);
    gameState._isNight = isNight;

    // Player
    updatePlayer(player, input, dt, time);

    // Vexillomancers
    updateVexillomancers(gameState.vexillomancers, gameState.flags, leyFacets, scene, dt, time);

    // Re-count aligned
    gameState.alignedCount = gameState.flags.filter(f => f.isAligned).length;

    // Waves
    gameState.waveTimer -= dt;
    if (gameState.waveTimer <= 0) {
        gameState.waveTimer = WAVE_INTERVAL;
        spawnWave();
    }

    // Animate flags
    animateFlags(gameState.flags, time);

    // Pentagram visuals
    updatePentagramVisuals(time);

    // Dust particle drift
    if (world.dust) {
        const dPos = world.dust.geometry.attributes.position;
        for (let i = 0; i < dPos.count; i++) {
            let x = dPos.getX(i);
            x += Math.sin(time * 0.3 + i) * 0.02;
            if (x > WORLD_SIZE * 0.5) x -= WORLD_SIZE;
            if (x < -WORLD_SIZE * 0.5) x += WORLD_SIZE;
            dPos.setX(i, x);
        }
        dPos.needsUpdate = true;
    }

    updateCamera();
    updateHUD();
    renderer.render(scene, camera);
}

requestAnimationFrame(loop);

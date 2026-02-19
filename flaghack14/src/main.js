// ── FLAGHACK 14: THE FLAG COMMANDMENTS ── Main ──
import * as THREE from 'three';
import {
    GRID_W, GRID_H, CELL_SIZE, UNIT_TYPES, MISSIONS, TACTIC_QUOTES,
} from './constants.js';
import {
    createBattle, getMoveTiles, getAttackTiles, getAbilityTargets,
    moveUnit, attackUnit, useAbility, endPlayerTurn, executeEnemyTurn,
} from './battle.js';

// ── Renderer ──
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0612);
scene.fog = new THREE.FogExp2(0x0a0612, 0.015);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 200);
camera.position.set(GRID_W * CELL_SIZE / 2, 18, GRID_H * CELL_SIZE + 6);
camera.lookAt(GRID_W * CELL_SIZE / 2, 0, GRID_H * CELL_SIZE / 2);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Lighting ──
scene.add(new THREE.AmbientLight(0x332244, 0.5));
const dirLight = new THREE.DirectionalLight(0xffcc88, 0.7);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// ── Grid ──
const gridGroup = new THREE.Group();
const cellMeshes = [];
const cellMats = [];

for (let y = 0; y < GRID_H; y++) {
    cellMeshes[y] = [];
    cellMats[y] = [];
    for (let x = 0; x < GRID_W; x++) {
        const isLight = (x + y) % 2 === 0;
        const mat = new THREE.MeshStandardMaterial({
            color: isLight ? 0x2a1a0a : 0x1a0a00,
            roughness: 0.9,
        });
        const cell = new THREE.Mesh(new THREE.BoxGeometry(CELL_SIZE * 0.95, 0.15, CELL_SIZE * 0.95), mat);
        cell.position.set(x * CELL_SIZE + CELL_SIZE / 2, 0, y * CELL_SIZE + CELL_SIZE / 2);
        cell.receiveShadow = true;
        gridGroup.add(cell);
        cellMeshes[y][x] = cell;
        cellMats[y][x] = mat;
    }
}
scene.add(gridGroup);

// ── Unit Meshes ──
const unitMeshMap = new Map(); // unit -> mesh
const flagMeshes = []; // {x, y, mesh}

function createUnitMesh(unit) {
    const info = UNIT_TYPES[unit.type];
    const group = new THREE.Group();

    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 1, 6),
        new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.2 }),
    );
    body.position.y = 0.6;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 6),
        new THREE.MeshStandardMaterial({ color: unit.team === 'player' ? 0xddbb88 : 0x886666 }),
    );
    head.position.y = 1.3;
    group.add(head);

    // Team indicator ring
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.35, 0.45, 8),
        new THREE.MeshBasicMaterial({
            color: unit.team === 'player' ? 0xffd700 : 0xcc3333,
            side: THREE.DoubleSide,
        }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;
    group.add(ring);

    // HP bar
    const hpBg = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x333333 }),
    );
    hpBg.position.y = 1.7;
    hpBg.rotation.x = -0.3;
    group.add(hpBg);
    const hpBar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.1),
        new THREE.MeshBasicMaterial({ color: unit.team === 'player' ? 0x44cc44 : 0xcc4444 }),
    );
    hpBar.position.y = 1.7;
    hpBar.position.z = 0.001;
    hpBar.rotation.x = -0.3;
    group.add(hpBar);
    group.userData.hpBar = hpBar;

    group.position.set(unit.x * CELL_SIZE + CELL_SIZE / 2, 0.08, unit.y * CELL_SIZE + CELL_SIZE / 2);
    scene.add(group);
    unitMeshMap.set(unit, group);
    return group;
}

function createFlagMesh(x, y) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
    );
    pole.position.y = 0.75;
    group.add(pole);
    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.4, side: THREE.DoubleSide }),
    );
    cloth.rotation.y = Math.PI / 4;
    cloth.position.set(0.2, 1.3, 0);
    group.add(cloth);
    group.position.set(x * CELL_SIZE + CELL_SIZE / 2, 0.08, y * CELL_SIZE + CELL_SIZE / 2);
    scene.add(group);
    return group;
}

// ── Game State ──
let battle = null;
let missionIndex = 0;
let mode = 'select'; // select, move, attack, ability

// ── Raycaster ──
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', e => {
    if (!battle || battle.turn !== 'player') return;
    if (e.target.closest('.ui-panel')) return;

    raycaster.setFromCamera(mouse, camera);
    const pt = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, pt);
    if (!pt) return;

    const gx = Math.floor(pt.x / CELL_SIZE);
    const gy = Math.floor(pt.z / CELL_SIZE);
    if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return;

    handleClick(gx, gy);
});

function handleClick(gx, gy) {
    if (battle.phase === 'win' || battle.phase === 'lose') return;

    if (mode === 'select') {
        const unit = battle.grid[gy][gx].unit;
        if (unit && unit.team === 'player' && !unit.acted) {
            battle.selectedUnit = unit;
            mode = 'move';
            battle.moveTargets = getMoveTiles(battle, unit);
            highlightTiles(battle.moveTargets, 0x4444ff);
        }
    } else if (mode === 'move') {
        const tile = battle.moveTargets.find(t => t.x === gx && t.y === gy);
        if (tile) {
            moveUnit(battle, battle.selectedUnit, gx, gy);
            updateUnitPosition(battle.selectedUnit);
            clearHighlights();
            mode = 'action';
            showActionMenu(battle.selectedUnit);
        } else {
            // Cancel
            clearHighlights();
            mode = 'select';
            battle.selectedUnit = null;
        }
    } else if (mode === 'attack') {
        const target = battle.attackTargets.find(t => t.x === gx && t.y === gy);
        if (target) {
            attackUnit(battle, battle.selectedUnit, target.target);
            syncAllUnits();
            clearHighlights();
            mode = 'select';
            battle.selectedUnit = null;
            hideActionMenu();
            checkWinLose();
        } else {
            clearHighlights();
            mode = 'select';
            hideActionMenu();
        }
    } else if (mode === 'ability') {
        const target = battle.abilityTargets.find(t => t.x === gx && t.y === gy);
        if (target) {
            useAbility(battle, battle.selectedUnit, gx, gy);
            syncAllUnits();
            syncFlags();
            clearHighlights();
            mode = 'select';
            battle.selectedUnit = null;
            hideActionMenu();
            checkWinLose();
        } else {
            clearHighlights();
            mode = 'select';
            hideActionMenu();
        }
    }
    updateUI();
}

// ── Highlight Tiles ──
function highlightTiles(tiles, color) {
    clearHighlights();
    for (const t of tiles) {
        if (t.x >= 0 && t.x < GRID_W && t.y >= 0 && t.y < GRID_H) {
            cellMats[t.y][t.x].emissive = new THREE.Color(color);
            cellMats[t.y][t.x].emissiveIntensity = 0.3;
        }
    }
}

function clearHighlights() {
    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            cellMats[y][x].emissive = new THREE.Color(0x000000);
            cellMats[y][x].emissiveIntensity = 0;
        }
    }
}

// ── Sync meshes to state ──
function updateUnitPosition(unit) {
    const mesh = unitMeshMap.get(unit);
    if (mesh) {
        mesh.position.set(unit.x * CELL_SIZE + CELL_SIZE / 2, 0.08, unit.y * CELL_SIZE + CELL_SIZE / 2);
    }
}

function syncAllUnits() {
    // Remove dead units' meshes
    for (const [unit, mesh] of unitMeshMap) {
        if (!battle.units.includes(unit)) {
            scene.remove(mesh);
            unitMeshMap.delete(unit);
        } else {
            updateUnitPosition(unit);
            // Update HP bar
            const hpBar = mesh.userData.hpBar;
            if (hpBar) {
                const pct = unit.hp / unit.maxHp;
                hpBar.scale.x = Math.max(0.01, pct);
                hpBar.position.x = -(1 - pct) * 0.4;
            }
        }
    }
}

function syncFlags() {
    // Remove old flag meshes
    for (const fm of flagMeshes) scene.remove(fm.mesh);
    flagMeshes.length = 0;
    // Add current flags
    for (const f of battle.flags) {
        const mesh = createFlagMesh(f.x, f.y);
        flagMeshes.push({ x: f.x, y: f.y, mesh });
    }
}

// ── Action Menu ──
function showActionMenu(unit) {
    const info = UNIT_TYPES[unit.type];
    const menu = document.getElementById('action-menu');
    menu.innerHTML = `
        <button id="btn-attack" class="action-btn">Attack</button>
        <button id="btn-ability" class="action-btn">${info.ability.replace('_', ' ').toUpperCase()}</button>
        <button id="btn-wait" class="action-btn">Wait</button>
    `;
    menu.style.display = 'flex';

    document.getElementById('btn-attack').addEventListener('click', () => {
        battle.attackTargets = getAttackTiles(battle, unit);
        highlightTiles(battle.attackTargets, 0xff4444);
        mode = 'attack';
    });
    document.getElementById('btn-ability').addEventListener('click', () => {
        battle.abilityTargets = getAbilityTargets(battle, unit);
        highlightTiles(battle.abilityTargets, 0x44ff44);
        mode = 'ability';
    });
    document.getElementById('btn-wait').addEventListener('click', () => {
        unit.acted = true;
        clearHighlights();
        mode = 'select';
        battle.selectedUnit = null;
        hideActionMenu();
        updateUI();
    });
}

function hideActionMenu() {
    document.getElementById('action-menu').style.display = 'none';
}

// ── End Turn ──
document.getElementById('end-turn-btn').addEventListener('click', () => {
    if (!battle || battle.turn !== 'player') return;
    endPlayerTurn(battle);
    clearHighlights();
    hideActionMenu();
    mode = 'select';
    battle.selectedUnit = null;

    // Enemy turn with delay
    setTimeout(() => {
        executeEnemyTurn(battle);
        syncAllUnits();
        syncFlags();
        checkWinLose();
        updateUI();
    }, 800);
});

function checkWinLose() {
    const playerAlive = battle.units.some(u => u.team === 'player');
    const enemyAlive = battle.units.some(u => u.team === 'enemy');
    if (!enemyAlive) {
        battle.phase = 'win';
        showResult('VICTORY', 'The Flag Commandments prevail.');
    } else if (!playerAlive) {
        battle.phase = 'lose';
        showResult('DEFEAT', 'Your flags have fallen.');
    }
}

function showResult(title, subtitle) {
    const panel = document.getElementById('result-panel');
    const quote = TACTIC_QUOTES[Math.floor(Math.random() * TACTIC_QUOTES.length)];
    panel.innerHTML = `
        <h2>${title}</h2>
        <p>${subtitle}</p>
        <p>Turns: ${battle.turnNumber}</p>
        <p class="quote">${quote}</p>
        <p class="salute">Glorious.</p>
        ${battle.phase === 'win' && missionIndex < MISSIONS.length - 1 ?
            '<button id="next-btn" class="action-btn">NEXT MISSION</button>' :
            battle.phase === 'win' ? '<button id="next-btn" class="action-btn">FINAL VICTORY</button>' :
            '<button id="retry-btn" class="action-btn">RETRY</button>'}
    `;
    panel.style.display = 'flex';

    const nextBtn = document.getElementById('next-btn');
    const retryBtn = document.getElementById('retry-btn');
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (missionIndex < MISSIONS.length - 1) {
            missionIndex++;
            startMission(missionIndex);
        } else {
            showFinalVictory();
        }
    });
    if (retryBtn) retryBtn.addEventListener('click', () => startMission(missionIndex));
}

function showFinalVictory() {
    const panel = document.getElementById('result-panel');
    panel.innerHTML = `
        <div class="victory-symbol">⛤</div>
        <h2>THE FLAG COMMANDMENTS FULFILLED</h2>
        <p>"No entering tents for flags."</p>
        <p>"When two dispute, a third may mediate."</p>
        <p>All missions complete. The Congress is satisfied.</p>
        <p class="salute">Glorious.</p>
    `;
}

// ── UI ──
function updateUI() {
    const log = document.getElementById('battle-log');
    log.innerHTML = battle.log.slice(-6).map(l => `<div>${l}</div>`).join('');
    log.scrollTop = log.scrollHeight;

    const info = document.getElementById('turn-info');
    info.textContent = `Turn ${battle.turnNumber} — ${battle.turn === 'player' ? 'Your Turn' : 'Enemy Turn'}`;

    const mission = document.getElementById('mission-info');
    mission.textContent = `Mission ${missionIndex + 1}: ${MISSIONS[missionIndex].name}`;

    // Unit list
    const unitList = document.getElementById('unit-list');
    unitList.innerHTML = battle.units
        .filter(u => u.team === 'player')
        .map(u => {
            const info = UNIT_TYPES[u.type];
            const status = u.acted ? '(done)' : '';
            return `<div class="unit-entry" style="border-color:${u.acted ? '#333' : '#ffd700'}">
                ${info.name} HP:${u.hp}/${u.maxHp} ${status}
            </div>`;
        }).join('');
}

// ── Start Mission ──
function startMission(idx) {
    // Clear old
    for (const [, mesh] of unitMeshMap) scene.remove(mesh);
    unitMeshMap.clear();
    for (const fm of flagMeshes) scene.remove(fm.mesh);
    flagMeshes.length = 0;
    clearHighlights();

    missionIndex = idx;
    battle = createBattle(MISSIONS[idx]);
    mode = 'select';

    // Create unit meshes
    for (const unit of battle.units) {
        createUnitMesh(unit);
    }

    document.getElementById('result-panel').style.display = 'none';
    hideActionMenu();
    updateUI();
}

// ── Init ──
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('title-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';
        startMission(0);
    }, 1000);
});

// ── Render Loop ──
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const t = Date.now() * 0.001;

    // Animate flag cloths
    for (const fm of flagMeshes) {
        const cloth = fm.mesh.children[1];
        if (cloth) cloth.position.x = 0.2 + Math.sin(t * 3 + fm.x) * 0.05;
    }

    // Subtle unit bob
    for (const [unit, mesh] of unitMeshMap) {
        mesh.position.y = 0.08 + Math.sin(t * 2 + unit.x + unit.y) * 0.03;
    }

    renderer.render(scene, camera);
}
animate();

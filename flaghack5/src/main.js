import * as THREE from 'three';
import {
    CAMERA_HEIGHT, CAMERA_DISTANCE, CAMERA_LERP,
    TOTAL_FLOORS, FLOOR_THEMES, MAX_FLAGIC, CHAKRAS,
    PENTAGRAM_FLAGIC_GAIN, XP_PER_LEVEL
} from './constants.js';
import { generateFloor, populateFloor, removeFloor, getRoomAt } from './dungeon.js';
import { createPlayer, updatePlayer, startAttack, startDash } from './player.js';
import { updateEnemies, spawnEnemyMeshes, despawnEnemyMeshes } from './enemies.js';
import { createCombatSystem, processMeleeAttack, fireProjectile, updateCombat } from './combat.js';
import { createFlagSystem, placeFlag, updateFlags, removeAllFlags } from './flags.js';
import { updatePickups, despawnPickupMeshes } from './pickups.js';
import { getChakraForFloor, unlockChakra, buildChakraUI, updateChakraUI } from './chakra.js';

// ===== STATE =====
let scene, camera, renderer;
let player, floor, floorData, flagSystem, combatSystem;
let currentRoomIdx = 0;

const gameState = {
    started: false,
    gameOver: false,
    victory: false,
    currentFloor: 0,
    kills: 0,
    crystals: 0,
    xp: 0,
    totalTime: 0,
};

const input = { w: false, a: false, s: false, d: false };
let mouseWorldPos = new THREE.Vector3();
let cameraYaw = 0;
let cameraTarget = new THREE.Vector3();

// ===== INIT =====
function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0608, 0.015);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);

    // Create player
    player = createPlayer(scene);

    // Systems
    flagSystem = createFlagSystem();
    combatSystem = createCombatSystem();

    // Generate first floor
    loadFloor(0);

    setupInput();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function loadFloor(floorNum) {
    // Clean up old floor
    if (floor) {
        removeFloor(floor, scene);
        removeAllFlags(flagSystem, scene);
        // Despawn all enemy meshes
        if (floorData) {
            for (const e of floorData.enemies) {
                if (e.mesh) { scene.remove(e.mesh); e.mesh = null; }
            }
            for (const p of floorData.pickups) {
                if (p.mesh) { scene.remove(p.mesh); p.mesh = null; }
            }
        }
    }

    gameState.currentFloor = floorNum;
    floor = generateFloor(floorNum, scene);
    floorData = populateFloor(floor, floorNum, scene);

    // Position player at spawn
    player.mesh.position.set(floor.spawnRoom.worldX, 0, floor.spawnRoom.worldZ);
    cameraTarget.set(floor.spawnRoom.worldX, 0, floor.spawnRoom.worldZ);
    currentRoomIdx = 0;

    // Spawn enemies in spawn room's neighbors
    spawnEnemyMeshes(floorData.enemies, currentRoomIdx, scene);

    // Show floor banner
    showFloorBanner(floorNum);
}

// ===== INPUT =====
function setupInput() {
    document.addEventListener('keydown', (e) => {
        if (!gameState.started) return;
        if (gameState.gameOver || gameState.victory) return;
        switch (e.key.toLowerCase()) {
            case 'w': input.w = true; break;
            case 'a': input.a = true; break;
            case 's': input.s = true; break;
            case 'd': input.d = true; break;
            case ' ':
                e.preventDefault();
                startDash(player, input, cameraYaw);
                break;
            case 'e':
                handleInteract();
                break;
            case '5':
                // Throat chakra: flag bolt
                if (player.chakras[4] && player.flagic >= 10) {
                    player.flagic -= 10;
                    const dir = new THREE.Vector3(
                        mouseWorldPos.x - player.mesh.position.x, 0,
                        mouseWorldPos.z - player.mesh.position.z
                    );
                    fireProjectile(combatSystem, scene, player.mesh.position, dir, CHAKRAS[4].bonus, 0xffd700);
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.key.toLowerCase()) {
            case 'w': input.w = false; break;
            case 'a': input.a = false; break;
            case 's': input.s = false; break;
            case 'd': input.d = false; break;
        }
    });

    // Mouse tracking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(groundPlane, mouseWorldPos);
    });

    // Left click: attack
    document.addEventListener('mousedown', (e) => {
        if (!gameState.started) return;
        if (gameState.gameOver || gameState.victory) return;
        if (e.button === 0) {
            if (startAttack(player)) {
                processMeleeAttack(player, floorData.enemies, scene, combatSystem, gameState);
            }
        }
    });

    // Right click: place flag
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!gameState.started || gameState.gameOver || gameState.victory) return;
        if (player.flags > 0) {
            const pos = player.mesh.position.clone();
            const forward = new THREE.Vector3(
                Math.sin(player.mesh.rotation.y) * 2, 0,
                Math.cos(player.mesh.rotation.y) * 2
            );
            pos.add(forward);
            placeFlag(flagSystem, scene, pos);
            player.flags--;

            // Check pentagrams for flagic
            if (flagSystem.pentagrams.length > 0) {
                let gain = PENTAGRAM_FLAGIC_GAIN;
                if (player.chakras[6]) gain *= CHAKRAS[6].bonus;
                const max = player.chakras[6] ? MAX_FLAGIC * 2 : MAX_FLAGIC;
                player.flagic = Math.min(max, player.flagic + gain);
                showNotification('Pentagram formed! +' + gain + ' Flagic', 2000);
            }
        }
    });

    // Title / death / victory click
    document.addEventListener('click', (e) => {
        if (!gameState.started) {
            startGame();
        } else if (gameState.gameOver || gameState.victory) {
            window.location.reload();
        }
    });
}

function handleInteract() {
    // Check if on exit tile
    const room = floor.rooms[currentRoomIdx];
    if (!room) return;

    if (room.type === 'exit') {
        const dist = player.mesh.position.distanceTo(
            new THREE.Vector3(room.worldX, 0, room.worldZ)
        );
        if (dist < 3) {
            // Check if all enemies in this room are dead
            const roomEnemies = floorData.enemies.filter(e => e.roomIdx === currentRoomIdx && e.alive);
            if (roomEnemies.length > 0) {
                showNotification('Clear all enemies to descend!', 2000);
                return;
            }

            if (gameState.currentFloor >= TOTAL_FLOORS - 1) {
                // Victory!
                gameState.victory = true;
                showVictory();
            } else {
                loadFloor(gameState.currentFloor + 1);
            }
        }
    }
}

function startGame() {
    gameState.started = true;
    document.getElementById('title-screen').style.opacity = '0';
    setTimeout(() => { document.getElementById('title-screen').style.display = 'none'; }, 1000);
    document.getElementById('hud').style.display = 'block';
    document.getElementById('controls-hint').style.display = 'block';
    buildChakraUI(player);
    showNotification('Descend through 7 floors of Flagistan. Find Crystals to awaken your Chakras.', 5000);
}

// ===== GAME LOOP =====
let lastTime = 0;

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    if (!gameState.started || gameState.gameOver || gameState.victory) {
        renderer.render(scene, camera);
        return;
    }

    gameState.totalTime += dt;
    const time = gameState.totalTime;

    // Update player
    updatePlayer(player, input, dt, cameraYaw, mouseWorldPos);

    // Camera follow
    const targetPos = player.mesh.position;
    cameraTarget.lerp(targetPos, CAMERA_LERP);
    camera.position.set(
        cameraTarget.x + 3,
        cameraTarget.y + CAMERA_HEIGHT,
        cameraTarget.z + CAMERA_DISTANCE
    );
    camera.lookAt(cameraTarget.x, cameraTarget.y + 2, cameraTarget.z);
    cameraYaw = Math.atan2(
        camera.position.x - cameraTarget.x,
        camera.position.z - cameraTarget.z
    );

    // Determine current room
    const newRoom = getRoomAt(floor, player.mesh.position.x, player.mesh.position.z);
    if (newRoom) {
        const newIdx = floor.rooms.indexOf(newRoom);
        if (newIdx !== currentRoomIdx) {
            currentRoomIdx = newIdx;
            newRoom.discovered = true;

            // Spawn/despawn enemy meshes for room transitions
            spawnEnemyMeshes(floorData.enemies, currentRoomIdx, scene);
            despawnEnemyMeshes(floorData.enemies, currentRoomIdx, scene);
            despawnPickupMeshes(floorData.pickups, currentRoomIdx, scene);

            // Room type notification
            if (newRoom.type === 'treasure') showNotification('Treasure Room!', 2000);
            else if (newRoom.type === 'crystal') showNotification('Crystal Chamber!', 2000);
            else if (newRoom.type === 'exit') showNotification('Exit found! Clear enemies and press E to descend.', 3000);
        }
    }

    // Update enemies
    const deadIndices = updateEnemies(floorData.enemies, player, scene, dt, time);

    // Handle enemy deaths (XP, drops)
    for (const idx of deadIndices) {
        const dead = floorData.enemies[idx];
        if (dead) {
            player.kills++;
            gameState.kills++;
            // Random flag drop
            if (Math.random() < 0.15) {
                player.flags++;
            }
        }
    }

    // Enemy ranged attacks
    for (const e of floorData.enemies) {
        if (!e.alive || !e.mesh || !e.wantsToShoot) continue;
        e.wantsToShoot = false;
        const dir = new THREE.Vector3().subVectors(player.mesh.position, e.mesh.position);
        dir.y = 0;
        fireProjectile(combatSystem, scene, e.mesh.position, dir, e.damage, 0x44ff44);
    }

    // Update combat
    updateCombat(combatSystem, scene, floorData.enemies, player, dt);

    // Update flags
    updateFlags(flagSystem, dt, time);

    // Update pickups
    const collected = updatePickups(floorData.pickups, player, scene, gameState, currentRoomIdx);
    for (const c of collected) {
        showNotification(c.text, 2000);
        // Crystal = chakra unlock
        if (c.type === 'CRYSTAL') {
            const chakra = getChakraForFloor(gameState.currentFloor);
            if (chakra && unlockChakra(player, chakra.index)) {
                showNotification(`${chakra.name} Chakra Awakened! ${chakra.desc}`, 4000);
                updateChakraUI(player);
            }
        }
    }

    // Leveling
    const xpNeeded = player.level * XP_PER_LEVEL;
    if (gameState.xp >= xpNeeded) {
        gameState.xp -= xpNeeded;
        player.level++;
        player.maxHp += 10;
        player.hp = player.maxHp;
        player.attackDamage += 2;
        showNotification('Level ' + player.level + '! HP and damage increased.', 3000);
    }

    // Player death
    if (player.hp <= 0) {
        gameState.gameOver = true;
        showDeath();
    }

    // Pentagram Flagic generation (standing in pentagram)
    for (const pent of flagSystem.pentagrams) {
        const dist = player.mesh.position.distanceTo(pent.center);
        if (dist < pent.radius + 2) {
            let rate = 5;
            if (player.chakras[6]) rate *= CHAKRAS[6].bonus;
            const max = player.chakras[6] ? MAX_FLAGIC * 2 : MAX_FLAGIC;
            player.flagic = Math.min(max, player.flagic + rate * dt);
        }
    }

    // Update HUD
    updateHUD();

    renderer.render(scene, camera);
}

// ===== HUD =====
function updateHUD() {
    document.getElementById('hud-hp').textContent = Math.floor(player.hp) + '/' + player.maxHp;
    document.getElementById('hud-flagic').textContent = Math.floor(player.flagic);
    document.getElementById('hud-flags').textContent = player.flags;
    document.getElementById('hud-floor').textContent = (gameState.currentFloor + 1) + '/' + TOTAL_FLOORS;
    document.getElementById('hud-kills').textContent = gameState.kills;
    document.getElementById('hud-crystals').textContent = gameState.crystals;

    // HP color
    const hpEl = document.getElementById('hud-hp');
    const ratio = player.hp / player.maxHp;
    if (ratio > 0.5) hpEl.style.color = '#44ff44';
    else if (ratio > 0.25) hpEl.style.color = '#ffaa00';
    else hpEl.style.color = '#ff2222';
}

// ===== NOTIFICATIONS =====
let notifTimer = null;
function showNotification(text, duration) {
    const el = document.getElementById('notification');
    el.textContent = text;
    el.style.display = 'block';
    el.style.opacity = '1';
    if (notifTimer) clearTimeout(notifTimer);
    notifTimer = setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => { el.style.display = 'none'; }, 500);
    }, duration);
}

function showFloorBanner(floorNum) {
    const theme = FLOOR_THEMES[Math.min(floorNum, FLOOR_THEMES.length - 1)];
    const banner = document.getElementById('floor-banner');
    banner.querySelector('h2').textContent = 'Floor ' + (floorNum + 1) + ': ' + theme.name;
    banner.querySelector('p').textContent = theme.desc;
    banner.style.display = 'block';
    setTimeout(() => { banner.style.display = 'none'; }, 3000);
}

function showDeath() {
    const el = document.getElementById('death-screen');
    el.style.display = 'flex';
    document.getElementById('death-stats').innerHTML =
        'Floor Reached: ' + (gameState.currentFloor + 1) + '/' + TOTAL_FLOORS + '<br>' +
        'Enemies Vanquished: ' + gameState.kills + '<br>' +
        'Crystals Found: ' + gameState.crystals + '<br>' +
        'Chakras Awakened: ' + player.chakras.filter(c => c).length + '/7<br>' +
        'Time: ' + Math.floor(gameState.totalTime) + 's<br>' +
        '<br>The Flags demand you try again.';
}

function showVictory() {
    const el = document.getElementById('victory-screen');
    el.style.display = 'flex';
    document.getElementById('victory-stats').innerHTML =
        'All 7 Floors of Flagistan Conquered!<br>' +
        'Enemies Vanquished: ' + gameState.kills + '<br>' +
        'Crystals Found: ' + gameState.crystals + '<br>' +
        'Chakras Awakened: ' + player.chakras.filter(c => c).length + '/7<br>' +
        'Time: ' + Math.floor(gameState.totalTime) + 's<br>' +
        '<br>The Omega Configuration is achieved.<br>Glorious.';
}

// ===== START =====
init();
requestAnimationFrame(gameLoop);

import * as THREE from 'three';
import {
    CAMERA_HEIGHT, CAMERA_DISTANCE, CAMERA_LERP,
    PLAYER_GATHER_RANGE, PLAYER_GATHER_TIME, PLAYER_START_FLAGS,
    HEAT_DECAY_RATE, HEAT_RAID_THRESHOLD, HEAT_MAX,
    DAY_DURATION, MAX_FLAGIC, PENTAGRAM_FLAGIC_RATE,
    VICTORY_FLAGS, VICTORY_SIGNIFIERS, REP_LEVELS,
    BUILDINGS
} from './constants.js';
import { createWorld, gatherResource, updateResources } from './world.js';
import { createPlayer, updatePlayer, startDash } from './player.js';
import { createBuildingSystem, placeBuilding, updateBuildings, getHeatFromBuildings, getSanctuaryPower, getDecoyPositions } from './buildings.js';
import { createPatrolSystem, spawnPatrol, updatePatrols, getActivePatrolCount } from './patrol.js';
import { createSignifierSystem, updateSignifiers, recruitSignifier, getNearWandering } from './signifiers.js';

// ===== STATE =====
let scene, camera, renderer;
let player, world, buildSystem, patrolSystem, sigSystem;

const inventory = { wood: 2, cloth: 2, crystal: 0 };

const gameState = {
    started: false,
    gameOver: false,
    victory: false,
    day: 1,
    dayTimer: 0,
    heat: 0,
    raidCooldown: 30, // seconds until first potential raid
    totalTime: 0,
    reputation: 0,
    selectedBuild: null,
    buildMenuOpen: false,
    flagsPlaced: 0,
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
    renderer.toneMappingExposure = 0.7;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a1a15, 0.008);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);

    player = createPlayer(scene);
    player.mesh.position.set(0, 0, 0);

    world = createWorld(scene);
    buildSystem = createBuildingSystem();
    patrolSystem = createPatrolSystem();
    sigSystem = createSignifierSystem();

    setupInput();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
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
            case 'b':
                toggleBuildMenu();
                break;
            case 'e':
                handleRecruit();
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

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(groundPlane, mouseWorldPos);
    });

    // Left click: gather or place building
    document.addEventListener('mousedown', (e) => {
        if (!gameState.started || gameState.gameOver || gameState.victory) return;
        if (e.button === 0) {
            if (gameState.selectedBuild) {
                // Place building at mouse position
                const pos = mouseWorldPos.clone();
                pos.y = 0;
                const placed = placeBuilding(buildSystem, scene, gameState.selectedBuild, pos, inventory);
                if (placed) {
                    if (gameState.selectedBuild === 'flag') {
                        gameState.flagsPlaced++;
                        gameState.reputation += 2;
                    } else {
                        gameState.reputation += 1;
                    }
                    showNotification(BUILDINGS[gameState.selectedBuild].name + ' placed!', 1500);
                    updateResourceUI();
                } else {
                    showNotification('Not enough resources!', 1500);
                }
            } else {
                // Gather resource
                const result = gatherResource(world.resources, player.mesh.position, PLAYER_GATHER_RANGE);
                if (result) {
                    const key = result.type.toLowerCase();
                    inventory[key] = (inventory[key] || 0) + result.amount;
                    showNotification('+' + result.amount + ' ' + result.type, 1500);
                    updateResourceUI();
                }
            }
        }
    });

    // Right click: quick place flag
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!gameState.started || gameState.gameOver || gameState.victory) return;
        const pos = mouseWorldPos.clone();
        pos.y = 0;
        if (placeBuilding(buildSystem, scene, 'flag', pos, inventory)) {
            gameState.flagsPlaced++;
            gameState.reputation += 2;
            showNotification('Flag planted!', 1500);
            updateResourceUI();
        }
    });

    // Build menu buttons
    document.querySelectorAll('.build-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.dataset.build;
            if (gameState.selectedBuild === type) {
                gameState.selectedBuild = null;
                btn.classList.remove('selected');
            } else {
                document.querySelectorAll('.build-btn').forEach(b => b.classList.remove('selected'));
                gameState.selectedBuild = type;
                btn.classList.add('selected');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!gameState.started) {
            startGame();
        } else if (gameState.gameOver || gameState.victory) {
            window.location.reload();
        }
    });
}

function toggleBuildMenu() {
    gameState.buildMenuOpen = !gameState.buildMenuOpen;
    document.getElementById('build-menu').style.display = gameState.buildMenuOpen ? 'flex' : 'none';
    if (!gameState.buildMenuOpen) {
        gameState.selectedBuild = null;
        document.querySelectorAll('.build-btn').forEach(b => b.classList.remove('selected'));
    }
}

function handleRecruit() {
    const near = getNearWandering(sigSystem, player.mesh.position, 5);
    if (near) {
        const recruited = recruitSignifier(sigSystem, scene, player.mesh.position);
        if (recruited) {
            gameState.reputation += 5;
            showNotification('Signifier recruited! They channel the will of the Crystal.', 3000);
        }
    }
}

function startGame() {
    gameState.started = true;
    document.getElementById('title-screen').style.opacity = '0';
    setTimeout(() => { document.getElementById('title-screen').style.display = 'none'; }, 1000);
    document.getElementById('hud').style.display = 'block';
    document.getElementById('resource-bar').style.display = 'flex';
    document.getElementById('controls-hint').style.display = 'block';
    updateResourceUI();
    showNotification('Gather resources. Build flags. Recruit Signifiers. Resist The Ban. [B] Build Menu', 5000);
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

    // Day cycle
    gameState.dayTimer += dt;
    if (gameState.dayTimer >= DAY_DURATION) {
        gameState.dayTimer -= DAY_DURATION;
        gameState.day++;
    }

    // Day/night lighting
    const dayProgress = gameState.dayTimer / DAY_DURATION;
    const sunHeight = Math.sin(dayProgress * Math.PI);
    world.sun.intensity = 0.3 + sunHeight * 1.0;
    world.ambient.intensity = 0.15 + sunHeight * 0.3;
    const isNight = sunHeight < 0.2;

    // Update sky
    const dayTop = new THREE.Color(0x4488aa);
    const nightTop = new THREE.Color(0x0a0a1a);
    const dayBottom = new THREE.Color(0x3a3528);
    const nightBottom = new THREE.Color(0x111111);
    world.skyMat.uniforms.topColor.value.copy(dayTop).lerp(nightTop, 1 - sunHeight);
    world.skyMat.uniforms.bottomColor.value.copy(dayBottom).lerp(nightBottom, 1 - sunHeight);

    // Update player
    updatePlayer(player, input, dt, cameraYaw);

    // Camera
    cameraTarget.lerp(player.mesh.position, CAMERA_LERP);
    camera.position.set(cameraTarget.x + 3, cameraTarget.y + CAMERA_HEIGHT, cameraTarget.z + CAMERA_DISTANCE);
    camera.lookAt(cameraTarget.x, cameraTarget.y + 2, cameraTarget.z);
    cameraYaw = Math.atan2(camera.position.x - cameraTarget.x, camera.position.z - cameraTarget.z);

    // Update buildings
    updateBuildings(buildSystem, time);

    // Update resources
    updateResources(world.resources, time);

    // Update signifiers
    updateSignifiers(sigSystem, scene, buildSystem, player, inventory, dt, time);

    // Update patrols
    updatePatrols(patrolSystem, scene, buildSystem, player, dt, time);

    // Heat system
    const buildingHeat = getHeatFromBuildings(buildSystem);
    gameState.heat = Math.min(HEAT_MAX, buildingHeat);
    // Heat decays naturally
    gameState.heat = Math.max(0, gameState.heat - HEAT_DECAY_RATE * dt * 0.1);

    // Raid system
    gameState.raidCooldown -= dt;
    if (gameState.raidCooldown <= 0 && gameState.heat > HEAT_RAID_THRESHOLD * 0.5) {
        gameState.raidCooldown = 60 + Math.random() * 30; // 60-90 second cooldown

        if (gameState.heat >= HEAT_RAID_THRESHOLD || Math.random() < gameState.heat / HEAT_MAX * 0.3) {
            // Raid incoming!
            let target = player.mesh.position.clone();
            // Target the densest building cluster
            if (buildSystem.buildings.length > 0) {
                const randomBuilding = buildSystem.buildings[Math.floor(Math.random() * buildSystem.buildings.length)];
                target = randomBuilding.position.clone();
            }

            // Check for decoys first
            const decoys = getDecoyPositions(buildSystem);
            if (decoys.length > 0 && Math.random() < 0.6) {
                target = decoys[Math.floor(Math.random() * decoys.length)];
            }

            spawnPatrol(patrolSystem, scene, gameState.heat, target);
            showAlertBar(true);
            setTimeout(() => showAlertBar(false), 5000);
            showNotification('BAN PATROL INCOMING! Protect your sanctuary!', 4000);
        }
    }

    // Pentagram Flagic generation
    for (const pent of buildSystem.pentagrams) {
        const dist = player.mesh.position.distanceTo(pent.center);
        if (dist < 10) {
            player.flagic = Math.min(MAX_FLAGIC, (player.flagic || 0) + PENTAGRAM_FLAGIC_RATE * dt);
        }
    }

    // Check victory
    if (gameState.flagsPlaced >= VICTORY_FLAGS && sigSystem.totalRecruited >= VICTORY_SIGNIFIERS) {
        gameState.victory = true;
        showVictory();
    }

    // Check game over (all buildings destroyed + no resources)
    if (buildSystem.totalFlags > 0 && buildSystem.buildings.length === 0 &&
        inventory.wood < 1 && inventory.cloth < 1) {
        // Give a grace period
        if (!gameState.graceTimer) gameState.graceTimer = 10;
        gameState.graceTimer -= dt;
        if (gameState.graceTimer <= 0) {
            gameState.gameOver = true;
            showGameOver();
        }
    } else {
        gameState.graceTimer = null;
    }

    // Update HUD
    updateHUD();

    renderer.render(scene, camera);
}

// ===== HUD =====
function updateHUD() {
    document.getElementById('hud-day').textContent = gameState.day;
    document.getElementById('hud-flags').textContent = gameState.flagsPlaced + '/' + VICTORY_FLAGS;
    document.getElementById('hud-flagic').textContent = Math.floor(player.flagic || 0);
    document.getElementById('hud-signifiers').textContent = sigSystem.recruited.length + '/' + VICTORY_SIGNIFIERS;
    document.getElementById('hud-heat').textContent = Math.floor(gameState.heat) + '%';
    document.getElementById('hud-sanctuary').textContent = getSanctuaryPower(buildSystem);

    // Heat color
    const heatEl = document.getElementById('hud-heat');
    if (gameState.heat > 70) heatEl.style.color = '#ff2222';
    else if (gameState.heat > 40) heatEl.style.color = '#ffaa00';
    else heatEl.style.color = '#44ff44';

    // Reputation
    let repLevel = REP_LEVELS[0];
    for (const r of REP_LEVELS) {
        if (gameState.reputation >= r.threshold) repLevel = r;
    }
    const repEl = document.getElementById('hud-rep');
    repEl.textContent = repLevel.name;
    repEl.style.color = repLevel.color;
}

function updateResourceUI() {
    document.getElementById('res-wood').textContent = inventory.wood || 0;
    document.getElementById('res-cloth').textContent = inventory.cloth || 0;
    document.getElementById('res-crystal').textContent = inventory.crystal || 0;
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

function showAlertBar(show) {
    document.getElementById('alert-bar').style.display = show ? 'block' : 'none';
}

function showGameOver() {
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('game-over-stats').innerHTML =
        'Days Survived: ' + gameState.day + '<br>' +
        'Flags Planted: ' + gameState.flagsPlaced + '<br>' +
        'Signifiers Recruited: ' + sigSystem.totalRecruited + '<br>' +
        'Sanctuary Power: ' + getSanctuaryPower(buildSystem) + '<br>' +
        'Reputation: ' + gameState.reputation;
}

function showVictory() {
    // Reuse game-over div with victory styling
    const el = document.getElementById('game-over');
    el.style.display = 'flex';
    el.querySelector('h1').textContent = 'THE FLAGS PREVAIL';
    el.querySelector('h1').style.color = '#ffd700';
    el.querySelector('h2').textContent = '"Flags were specifically exempt." And now you know why. Glorious.';
    document.getElementById('game-over-stats').innerHTML =
        'Days Survived: ' + gameState.day + '<br>' +
        'Flags Planted: ' + gameState.flagsPlaced + '<br>' +
        'Signifiers Recruited: ' + sigSystem.totalRecruited + '<br>' +
        'Sanctuary Power: ' + getSanctuaryPower(buildSystem) + '<br>' +
        'Reputation: ' + gameState.reputation + '<br>' +
        '<br>The Noospheric Munitions Act cannot suppress<br>that which predates all creation.';
}

// ===== START =====
init();
requestAnimationFrame(gameLoop);

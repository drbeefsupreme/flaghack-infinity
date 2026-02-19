import * as THREE from 'three';
import {
    CAMERA_DISTANCE, CAMERA_HEIGHT, CAMERA_LERP,
    PLAYER_MAX_HP, MAX_FLAGIC, SPELLS, GEOMANTICA,
    HIPPIE_BASE_SPEED
} from './constants.js';
import { createTerrain } from './terrain.js';
import { createPlayer, updatePlayer } from './player.js';
import { createFlagSystem, placeFlag, pickupFlag, updateFlags } from './flags.js';
import { createLeyLineSystem, updateLeyLines, getPentagramsInRange } from './leylines.js';
import { createEffigy, updateEffigy, damageEffigy } from './effigy.js';
import { createHippieSystem, updateHippies, removeDeadHippies, setDamageEffigyFn } from './hippies.js';
import { createSpellSystem, castSpell, updateSpells } from './spells.js';
import { createWaveSystem, updateWaves } from './waves.js';
import { createGeomanticaSystem, updateGeomantica, getGeomanticaInfo } from './geomantica.js';
import { createParticleSystem, emitParticles, updateParticles } from './particles.js';
import { createDayNight, updateDayNight } from './daynight.js';
import { createCamps, updateCamps } from './camps.js';

// ===== STATE =====
let scene, camera, renderer;
let player, flagSystem, leySystem, effigy, hippieSystem, spellSystem;
let waveSystem, geoSystem, particleSystem, dayNight, camps;

const gameState = {
    started: false,
    gameOver: false,
    effigyDestroyed: false,
    wave: 1,
    score: 0,
    hippiesKilled: 0,
    flagsPlaced: 0,
    pentagramsFormed: 0,
    time: 0,
    flagGenTimer: 0,
};

const input = { w: false, a: false, s: false, d: false };
let mouseWorldPos = new THREE.Vector3();
let cameraYaw = 0;
let cameraTarget = new THREE.Vector3();

// ===== INIT =====
function init() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 600);
    camera.position.set(0, CAMERA_HEIGHT, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);

    // World
    createTerrain(scene);
    dayNight = createDayNight(scene);

    // Effigy
    effigy = createEffigy(scene);
    setDamageEffigyFn(function(eff, amt) { return damageEffigy(eff, amt); });

    // Player
    player = createPlayer(scene);
    player.mesh.position.set(0, 0, 20);

    // Systems
    flagSystem = createFlagSystem();
    leySystem = createLeyLineSystem();
    hippieSystem = createHippieSystem();
    spellSystem = createSpellSystem();
    waveSystem = createWaveSystem();
    geoSystem = createGeomanticaSystem();
    particleSystem = createParticleSystem(scene, { count: 200 });
    camps = createCamps(scene);

    // Event listeners
    setupInput();

    // Resize
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
        switch (e.key.toLowerCase()) {
            case 'w': input.w = true; break;
            case 'a': input.a = true; break;
            case 's': input.s = true; break;
            case 'd': input.d = true; break;
            case '1': spellSystem.activeSpell = 0; updateSpellBar(); break;
            case '2': spellSystem.activeSpell = 1; updateSpellBar(); break;
            case '3': spellSystem.activeSpell = 2; updateSpellBar(); break;
            case '4': spellSystem.activeSpell = 3; updateSpellBar(); break;
            case ' ':
                e.preventDefault();
                castSpell(spellSystem, player, scene, mouseWorldPos);
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

    // Mouse tracking for spell targeting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(groundPlane, mouseWorldPos);
    });

    // Left click: place flag
    document.addEventListener('mousedown', (e) => {
        if (!gameState.started) return;
        if (e.button === 0) {
            // Left click
            if (player.flags > 0) {
                placeFlag(flagSystem, scene, player.mesh.position, player.mesh.rotation.y);
                player.flags--;
                gameState.flagsPlaced++;
            }
        }
    });

    // Right click: pickup flag
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!gameState.started) return;
        if (pickupFlag(flagSystem, scene, player.mesh.position)) {
            player.flags++;
        }
    });

    // Title screen / Game over click
    document.addEventListener('click', (e) => {
        if (!gameState.started) {
            startGame();
        } else if (gameState.gameOver) {
            restartGame();
        }
    });
}

function startGame() {
    gameState.started = true;
    const titleScreen = document.getElementById('title-screen');
    titleScreen.style.opacity = '0';
    setTimeout(() => { titleScreen.style.display = 'none'; }, 1000);

    document.getElementById('hud').style.display = 'block';
    document.getElementById('spell-bar').style.display = 'flex';
    document.getElementById('controls-hint').style.display = 'block';
    updateSpellBar();

    showNotification('Place flags in pentagrams to defend the Effigy!', 5000);
}

function restartGame() {
    // Reload the page for clean restart
    window.location.reload();
}

// ===== GAME LOOP =====
let lastTime = 0;

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    if (!gameState.started || gameState.gameOver) {
        renderer.render(scene, camera);
        return;
    }

    gameState.time += dt;

    // Update player
    updatePlayer(player, input, dt, cameraYaw);

    // Update camera (third-person isometric-ish)
    const targetPos = player.mesh.position;
    cameraTarget.lerp(targetPos, CAMERA_LERP);
    camera.position.set(
        cameraTarget.x,
        cameraTarget.y + CAMERA_HEIGHT,
        cameraTarget.z + CAMERA_DISTANCE
    );
    camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    cameraYaw = Math.atan2(
        camera.position.x - cameraTarget.x,
        camera.position.z - cameraTarget.z
    );

    // Update flags
    updateFlags(flagSystem, dt, gameState.time);

    // Update ley lines & pentagrams
    const pentResult = updateLeyLines(leySystem, flagSystem, scene, player, dt, gameState.time, gameState);

    // Update Geomantica tower effects
    updateGeomantica(geoSystem, leySystem, hippieSystem, effigy, flagSystem, scene, gameState, dt, gameState.time);

    // Pentagram flag generation effect (bonus flags from Da You pentagrams)
    gameState.flagGenTimer -= dt;
    if (gameState.flagGenTimer <= 0) {
        gameState.flagGenTimer = 5; // every 5 seconds
        for (const p of leySystem.pentagrams) {
            if (p.geomantica.effect === 'flag_gen') {
                player.flags += 1;
                showNotification('+1 Flag from ' + p.geomantica.title, 2000);
            }
        }
    }

    // Reset hippie speeds each frame before applying slow effects
    for (const h of hippieSystem.hippies) {
        const waveMultiplier = 1 + (gameState.wave - 1) * 0.05;
        h.speed = HIPPIE_BASE_SPEED * waveMultiplier;
    }

    // Update hippies
    updateHippies(hippieSystem, scene, effigy, player, flagSystem, leySystem, gameState, dt, gameState.time);
    removeDeadHippies(hippieSystem, scene);

    // Update spells
    updateSpells(spellSystem, scene, hippieSystem, player, gameState, dt, gameState.time);

    // Update waves
    const waveEvent = updateWaves(waveSystem, hippieSystem, scene, gameState, dt);
    if (waveEvent) {
        handleWaveEvent(waveEvent);
    }

    // Update effigy
    updateEffigy(effigy, dt, gameState.time);

    // Update day/night
    updateDayNight(dayNight, dt, gameState.time);

    // Update camps
    const nearCamp = updateCamps(camps, player, gameState.time);

    // Update particles
    updateParticles(particleSystem, dt);

    // Emit fire particles at effigy
    if (effigy.hp < effigy.maxHp * 0.7) {
        const intensity = 1 - effigy.hp / effigy.maxHp;
        if (Math.random() < intensity * 0.5) {
            emitParticles(particleSystem, effigy.position, 2, {
                color: new THREE.Color(1, 0.4, 0),
                speed: 2,
                lifetime: 1,
                rise: 3,
                spread: 2,
            });
        }
    }

    // Pentagram sparkles
    for (const p of leySystem.pentagrams) {
        if (Math.random() < 0.1) {
            emitParticles(particleSystem, p.center, 1, {
                color: new THREE.Color(1, 0.85, 0),
                speed: 1,
                lifetime: 1.5,
                rise: 2,
                spread: p.radius * 0.5,
            });
        }
    }

    // Check game over
    if (gameState.effigyDestroyed) {
        endGame();
    }

    // Player damage from nearby hippies
    for (const h of hippieSystem.hippies) {
        if (h.hp <= 0) continue;
        const dist = player.mesh.position.distanceTo(h.mesh.position);
        if (dist < 2 && !player.shieldActive && player.invulnTimer <= 0) {
            player.hp -= 5 * dt;
            if (player.hp <= 0) {
                player.hp = PLAYER_MAX_HP * 0.5;
                player.mesh.position.set(0, 0, 20);
                player.invulnTimer = 2;
                showNotification('Respawned! The Flags preserve you.', 3000);
            }
        }
    }

    // Update HUD
    updateHUD(pentResult);

    // Geomantica panel
    if (pentResult.activePentagram) {
        const info = pentResult.activePentagram.geomantica;
        document.getElementById('geomantica-panel').style.display = 'block';
        document.getElementById('geomantica-name').textContent = info.name + ' - ' + info.title;
        document.getElementById('geomantica-desc').textContent = info.desc;
    } else {
        document.getElementById('geomantica-panel').style.display = 'none';
    }

    renderer.render(scene, camera);
}

// ===== HUD =====
function updateHUD(pentResult) {
    document.getElementById('hud-flags').textContent = player.flags;
    document.getElementById('hud-flagic').textContent = Math.floor(player.flagic);
    document.getElementById('hud-hp').textContent = Math.floor(player.hp);
    document.getElementById('hud-wave').textContent = gameState.wave;
    document.getElementById('hud-score').textContent = gameState.score;
    document.getElementById('hud-pentagrams').textContent = leySystem.pentagrams.length;

    // Update spell cooldown visuals
    const slots = document.querySelectorAll('.spell-slot');
    for (let i = 0; i < slots.length; i++) {
        const cd = slots[i].querySelector('.spell-cooldown');
        if (spellSystem.cooldowns[i] > 0) {
            const ratio = spellSystem.cooldowns[i] / SPELLS[i].cooldown;
            cd.style.display = 'block';
            cd.style.height = (ratio * 100) + '%';
        } else {
            cd.style.display = 'none';
        }
    }
}

function updateSpellBar() {
    const slots = document.querySelectorAll('.spell-slot');
    slots.forEach((s, i) => {
        s.classList.toggle('active', i === spellSystem.activeSpell);
    });
}

// ===== WAVE EVENTS =====
function handleWaveEvent(event) {
    const banner = document.getElementById('wave-banner');
    const title = document.getElementById('wave-title');
    const sub = document.getElementById('wave-subtitle');

    if (event.type === 'wave_start') {
        title.textContent = 'WAVE ' + event.wave;
        sub.textContent = event.message;
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 3000);
    } else if (event.type === 'wave_clear') {
        title.textContent = 'WAVE ' + event.wave + ' CLEARED';
        sub.textContent = 'Glorious.';
        banner.style.display = 'block';
        banner.querySelector('#wave-title').style.color = '#ffd700';
        setTimeout(() => {
            banner.style.display = 'none';
            banner.querySelector('#wave-title').style.color = '#ff4444';
        }, 3000);

        if (event.bonusFlags) {
            player.flags += event.bonusFlags;
            showNotification('+' + event.bonusFlags + ' Bonus Flags!', 3000);
        }
    }
}

// ===== GAME OVER =====
function endGame() {
    gameState.gameOver = true;
    const overlay = document.getElementById('game-over');
    overlay.style.display = 'flex';
    document.getElementById('game-over-stats').innerHTML =
        'Waves Survived: ' + (gameState.wave - 1) + '<br>' +
        'Hippies Vanquished: ' + gameState.hippiesKilled + '<br>' +
        'Flags Placed: ' + gameState.flagsPlaced + '<br>' +
        'Pentagrams Formed: ' + leySystem.pentagrams.length + '<br>' +
        'Score: ' + gameState.score + '<br>' +
        'Time: ' + Math.floor(gameState.time) + 's';
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

// ===== START =====
init();
requestAnimationFrame(gameLoop);

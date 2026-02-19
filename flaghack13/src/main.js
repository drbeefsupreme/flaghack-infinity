// ── FLAGHACK 13: THE FLAGIC RALLY ── Main ──
import * as THREE from 'three';
import {
    LANE_COUNT, LANE_WIDTH, LANE_POSITIONS,
    BASE_SPEED, MAX_SPEED, SPEED_INCREASE_RATE, LANE_SWITCH_SPEED,
    JUMP_FORCE, GRAVITY, SLIDE_DURATION,
    SEGMENT_LENGTH, VIEW_DISTANCE, SPAWN_DISTANCE,
    OBSTACLE_TYPES, COLLECTIBLE_TYPES, POWERUP_TYPES,
    DISTANCE_POINTS_PER_UNIT, COMBO_THRESHOLD, COMBO_MULTIPLIER_CAP,
    MILESTONES, ZONES, RUN_QUOTES,
} from './constants.js';

// ── Renderer ──
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a2a);
scene.fog = new THREE.FogExp2(0x1a0a2a, 0.006);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.5, 300);
camera.position.set(0, 4, 8);
camera.lookAt(0, 1, -10);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Lighting ──
scene.add(new THREE.AmbientLight(0x332244, 0.5));
const dirLight = new THREE.DirectionalLight(0xffcc88, 0.8);
dirLight.position.set(5, 15, 10);
dirLight.castShadow = true;
scene.add(dirLight);
const goldLight = new THREE.PointLight(0xffd700, 0.5, 30);
scene.add(goldLight);

// ── Ground (infinite scroll illusion) ──
const groundGeo = new THREE.PlaneGeometry(30, VIEW_DISTANCE * 2);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.95 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.z = -VIEW_DISTANCE;
ground.receiveShadow = true;
scene.add(ground);

// ── Ley Lines (lane markers) ──
const leyMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.2 });
for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * LANE_WIDTH;
    const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, VIEW_DISTANCE * 2),
        leyMat,
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.01, -VIEW_DISTANCE);
    scene.add(line);
}

// ── Player ──
const player = new THREE.Group();
// Board
const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.1, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3 }),
);
board.position.y = 0.05;
player.add(board);
// Figure
const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 1.2, 6),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.15 }),
);
body.position.y = 0.7;
player.add(body);
// Head
const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xddbb88 }),
);
head.position.y = 1.5;
player.add(head);
// Flag
const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.5, 4),
    new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
);
pole.position.set(0.4, 1.2, 0);
pole.rotation.z = -0.3;
player.add(pole);
const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.4, side: THREE.DoubleSide }),
);
cloth.position.set(0.65, 1.7, 0);
cloth.rotation.y = Math.PI / 4;
player.add(cloth);

player.position.set(0, 0, 0);
scene.add(player);

// ── Particles (speed trail) ──
const trailCount = 100;
const trailPos = new Float32Array(trailCount * 3);
const trailGeo = new THREE.BufferGeometry();
trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({
    color: 0xffd700, size: 0.1, transparent: true, opacity: 0.5, depthWrite: false,
}));
scene.add(trail);

// ── Game State ──
const state = {
    phase: 'title', // title, playing, dead, paused
    distance: 0,
    speed: BASE_SPEED,
    lane: 1, // 0, 1, 2
    targetLane: 1,
    playerY: 0,
    velocityY: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    score: 0,
    flagsCollected: 0,
    combo: 0,
    maxCombo: 0,
    comboMultiplier: 1,
    flagic: 0,
    activePowerup: null,
    powerupTimer: 0,
    milestoneIndex: 0,
    zoneIndex: 0,
    objects: [], // { mesh, type, lane, z, collected }
    lastSpawnZ: -20,
    deathCause: '',
};

// ── Spawning ──
function spawnObjects() {
    while (state.lastSpawnZ > -state.distance - SPAWN_DISTANCE) {
        state.lastSpawnZ -= 8 + Math.random() * 15;
        const worldZ = state.lastSpawnZ;

        // Spawn obstacle or collectible
        const r = Math.random();
        if (r < 0.35) {
            // Obstacle
            const lane = Math.floor(Math.random() * LANE_COUNT);
            const types = Object.keys(OBSTACLE_TYPES);
            const type = types[Math.floor(Math.random() * types.length)];
            const info = OBSTACLE_TYPES[type];
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(info.width, info.height, info.depth),
                new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.2 }),
            );
            mesh.position.set(LANE_POSITIONS[lane], info.height / 2, worldZ);
            scene.add(mesh);
            state.objects.push({ mesh, type: 'obstacle', obstacleType: type, lane, z: worldZ, collected: false });
        } else if (r < 0.75) {
            // Collectible (flag line)
            const lane = Math.floor(Math.random() * LANE_COUNT);
            const count = 3 + Math.floor(Math.random() * 4);
            for (let i = 0; i < count; i++) {
                const types = Object.keys(COLLECTIBLE_TYPES);
                const weights = [0.7, 0.2, 0.1];
                let pick = 0;
                const w = Math.random();
                if (w > weights[0] + weights[1]) pick = 2;
                else if (w > weights[0]) pick = 1;
                const type = types[pick];
                const info = COLLECTIBLE_TYPES[type];
                const mesh = createCollectibleMesh(type, info);
                mesh.position.set(LANE_POSITIONS[lane], 1, worldZ - i * 3);
                scene.add(mesh);
                state.objects.push({ mesh, type: 'collectible', collectType: type, lane, z: worldZ - i * 3, collected: false });
            }
        } else if (r < 0.85 && state.distance > 1000) {
            // Power-up
            const lane = Math.floor(Math.random() * LANE_COUNT);
            const types = Object.keys(POWERUP_TYPES);
            const type = types[Math.floor(Math.random() * types.length)];
            const info = POWERUP_TYPES[type];
            const mesh = new THREE.Mesh(
                new THREE.TorusGeometry(0.5, 0.15, 6, 5),
                new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.6, transparent: true, opacity: 0.8 }),
            );
            mesh.position.set(LANE_POSITIONS[lane], 1.5, worldZ);
            scene.add(mesh);
            state.objects.push({ mesh, type: 'powerup', powerupType: type, lane, z: worldZ, collected: false });
        }

        // Scenery (outside lanes)
        if (Math.random() < 0.4) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const scenery = createSceneryMesh();
            scenery.position.set(side * (LANE_WIDTH * 2 + 2 + Math.random() * 5), 0, worldZ);
            scene.add(scenery);
            state.objects.push({ mesh: scenery, type: 'scenery', z: worldZ, collected: false });
        }
    }
}

function createCollectibleMesh(type, info) {
    if (type === 'flag') {
        const g = new THREE.Group();
        const p = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4),
            new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
        );
        p.position.y = 0.6;
        g.add(p);
        const c = new THREE.Mesh(
            new THREE.PlaneGeometry(0.35, 0.35),
            new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.4, side: THREE.DoubleSide }),
        );
        c.rotation.y = Math.PI / 4;
        c.position.set(0.18, 1, 0);
        g.add(c);
        return g;
    } else if (type === 'crystal') {
        return new THREE.Mesh(
            new THREE.OctahedronGeometry(0.3),
            new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 }),
        );
    } else {
        return new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.25, 0.6, 5),
            new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.4 }),
        );
    }
}

function createSceneryMesh() {
    const types = ['flag', 'tent', 'rock'];
    const t = types[Math.floor(Math.random() * types.length)];
    if (t === 'flag') {
        const g = new THREE.Group();
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 4), new THREE.MeshStandardMaterial({ color: 0x8b6914 }));
        p.position.y = 1.25; g.add(p);
        const c = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3, side: THREE.DoubleSide }));
        c.rotation.y = Math.PI / 4; c.position.set(0.25, 2.2, 0); g.add(c);
        return g;
    } else if (t === 'tent') {
        return new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 2.5, 4),
            new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.3, 0.25) }),
        );
    } else {
        return new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5),
            new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.9 }),
        );
    }
}

// ── Input ──
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (state.phase === 'playing') {
        if ((e.key === 'a' || e.key === 'ArrowLeft') && state.targetLane > 0) {
            state.targetLane--;
        }
        if ((e.key === 'd' || e.key === 'ArrowRight') && state.targetLane < LANE_COUNT - 1) {
            state.targetLane++;
        }
        if ((e.key === 'w' || e.key === 'ArrowUp' || e.key === ' ') && !state.isJumping) {
            state.isJumping = true;
            state.velocityY = JUMP_FORCE;
        }
        if ((e.key === 's' || e.key === 'ArrowDown') && !state.isSliding && !state.isJumping) {
            state.isSliding = true;
            state.slideTimer = SLIDE_DURATION;
        }
    }
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

// ── Collision ──
function checkCollisions() {
    const px = player.position.x;
    const pz = player.position.z;
    const py = state.playerY;

    for (const obj of state.objects) {
        if (obj.collected) continue;
        const dx = Math.abs(px - obj.mesh.position.x);
        const dz = Math.abs(pz - obj.mesh.position.z);

        if (obj.type === 'obstacle') {
            const info = OBSTACLE_TYPES[obj.obstacleType];
            if (dx < (info.width / 2 + 0.5) && dz < (info.depth / 2 + 0.3)) {
                // Check if jumping over
                if (py > info.height * 0.7) continue;
                // Check if sliding under tall obstacles
                if (state.isSliding && info.height > 2) continue;
                // Shield check
                if (state.activePowerup === 'pentagram_shield') {
                    obj.collected = true;
                    scene.remove(obj.mesh);
                    continue;
                }
                // Death
                state.phase = 'dead';
                state.deathCause = info.name;
                showDeathScreen();
            }
        } else if (obj.type === 'collectible') {
            let collectRadius = 1.2;
            if (state.activePowerup === 'flag_magnet') collectRadius = 4;
            if (dx < collectRadius && dz < collectRadius) {
                obj.collected = true;
                scene.remove(obj.mesh);
                const info = COLLECTIBLE_TYPES[obj.collectType];
                state.score += info.points * state.comboMultiplier;
                state.flagic += info.flagic;
                state.flagsCollected++;
                state.combo++;
                state.maxCombo = Math.max(state.maxCombo, state.combo);
                state.comboMultiplier = Math.min(COMBO_MULTIPLIER_CAP, 1 + Math.floor(state.combo / COMBO_THRESHOLD));
            }
        } else if (obj.type === 'powerup') {
            if (dx < 1.5 && dz < 1.5) {
                obj.collected = true;
                scene.remove(obj.mesh);
                const info = POWERUP_TYPES[obj.powerupType];
                state.activePowerup = obj.powerupType;
                state.powerupTimer = info.duration;
                showPowerup(info.name);
            }
        }
    }
}

// ── Cleanup ──
function cleanupObjects() {
    for (let i = state.objects.length - 1; i >= 0; i--) {
        const obj = state.objects[i];
        if (obj.z > -state.distance + 20) {
            scene.remove(obj.mesh);
            state.objects.splice(i, 1);
            if (obj.type === 'collectible' && !obj.collected) {
                state.combo = 0;
                state.comboMultiplier = 1;
            }
        }
    }
}

// ── Zone Updates ──
function updateZone() {
    for (let i = ZONES.length - 1; i >= 0; i--) {
        if (state.distance >= ZONES[i].start) {
            if (i !== state.zoneIndex) {
                state.zoneIndex = i;
                const zone = ZONES[i];
                scene.background.setHex(zone.sky);
                scene.fog = new THREE.FogExp2(zone.sky, zone.fog);
                groundMat.color.setHex(zone.ground);
                showZone(zone.name);
            }
            break;
        }
    }
}

// ── HUD ──
function updateHUD() {
    document.getElementById('hud-score').textContent = `Score: ${Math.floor(state.score)}`;
    document.getElementById('hud-distance').textContent = `${Math.floor(state.distance)}m`;
    document.getElementById('hud-flags').textContent = `Flags: ${state.flagsCollected}`;
    document.getElementById('hud-combo').textContent = state.combo > 1 ? `${state.combo}x (${state.comboMultiplier}x mult)` : '';
    document.getElementById('hud-speed').textContent = `${Math.floor(state.speed)} km/h`;
    if (state.activePowerup) {
        document.getElementById('hud-powerup').textContent = `${POWERUP_TYPES[state.activePowerup].name}: ${state.powerupTimer.toFixed(1)}s`;
    } else {
        document.getElementById('hud-powerup').textContent = '';
    }
}

function showZone(name) {
    const el = document.getElementById('zone-announce');
    el.textContent = name;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

function showPowerup(name) {
    const el = document.getElementById('powerup-announce');
    el.textContent = name + '!';
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

function showDeathScreen() {
    const el = document.getElementById('death-screen');
    const milestone = MILESTONES.filter(m => state.distance >= m.distance).pop();
    el.innerHTML = `
        <h2>CRASHED</h2>
        <p>Hit by: ${state.deathCause}</p>
        <p>Distance: ${Math.floor(state.distance)}m</p>
        <p>Score: ${Math.floor(state.score)}</p>
        <p>Flags: ${state.flagsCollected} | Max Combo: ${state.maxCombo}x</p>
        <p>Rank: ${milestone ? milestone.name : 'None'}</p>
        <p class="quote">${RUN_QUOTES[Math.floor(Math.random() * RUN_QUOTES.length)]}</p>
        <p class="salute">Glorious.</p>
        <button id="retry-btn" class="action-btn">RUN AGAIN</button>
    `;
    el.style.display = 'flex';
    document.getElementById('retry-btn').addEventListener('click', restart);
}

function restart() {
    // Remove all objects
    for (const obj of state.objects) scene.remove(obj.mesh);
    state.objects = [];
    state.distance = 0;
    state.speed = BASE_SPEED;
    state.lane = 1;
    state.targetLane = 1;
    state.playerY = 0;
    state.velocityY = 0;
    state.isJumping = false;
    state.isSliding = false;
    state.score = 0;
    state.flagsCollected = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.comboMultiplier = 1;
    state.flagic = 0;
    state.activePowerup = null;
    state.powerupTimer = 0;
    state.milestoneIndex = 0;
    state.zoneIndex = 0;
    state.lastSpawnZ = -20;
    state.phase = 'playing';
    document.getElementById('death-screen').style.display = 'none';
    player.position.set(0, 0, 0);
    player.scale.y = 1;
}

// ── Game Loop ──
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = Date.now() * 0.001;

    if (state.phase === 'playing') {
        // Speed up over time
        state.speed = Math.min(MAX_SPEED, state.speed + SPEED_INCREASE_RATE * dt);
        const effectiveSpeed = state.activePowerup === 'time_piracy' ? state.speed * 0.5 : state.speed;

        // Move forward
        state.distance += effectiveSpeed * dt;
        state.score += effectiveSpeed * dt * DISTANCE_POINTS_PER_UNIT;

        // Lane switching
        const targetX = LANE_POSITIONS[state.targetLane];
        player.position.x += (targetX - player.position.x) * Math.min(1, LANE_SWITCH_SPEED * dt);
        state.lane = state.targetLane;

        // Jump / gravity
        if (state.isJumping) {
            state.velocityY -= GRAVITY * dt;
            state.playerY += state.velocityY * dt;
            if (state.playerY <= 0) {
                state.playerY = 0;
                state.velocityY = 0;
                state.isJumping = false;
            }
        }
        player.position.y = state.playerY;

        // Slide
        if (state.isSliding) {
            state.slideTimer -= dt;
            player.scale.y = 0.4;
            if (state.slideTimer <= 0) {
                state.isSliding = false;
                player.scale.y = 1;
            }
        }

        // Powerup timer
        if (state.activePowerup) {
            state.powerupTimer -= dt;
            if (state.powerupTimer <= 0) {
                state.activePowerup = null;
            }
        }

        // Move objects toward player (world scrolls)
        for (const obj of state.objects) {
            obj.mesh.position.z = obj.z + state.distance;
            // Rotate collectibles
            if (obj.type === 'collectible' || obj.type === 'powerup') {
                obj.mesh.rotation.y += dt * 2;
            }
        }

        // Ground scroll
        ground.position.z = (state.distance % SEGMENT_LENGTH) - VIEW_DISTANCE;

        spawnObjects();
        checkCollisions();
        cleanupObjects();
        updateZone();

        // Milestones
        while (state.milestoneIndex < MILESTONES.length &&
               state.distance >= MILESTONES[state.milestoneIndex].distance) {
            showZone(MILESTONES[state.milestoneIndex].name);
            state.milestoneIndex++;
        }

        // Camera
        camera.position.x = player.position.x * 0.3;
        camera.position.y = 4 + state.playerY * 0.5;
        camera.lookAt(player.position.x * 0.5, 1 + state.playerY * 0.3, player.position.z - 15);

        // Trail particles
        for (let i = 0; i < trailCount; i++) {
            trailPos[i * 3] = player.position.x + (Math.random() - 0.5) * 1.5;
            trailPos[i * 3 + 1] = 0.1 + Math.random() * 0.5;
            trailPos[i * 3 + 2] = player.position.z + Math.random() * 5;
        }
        trailGeo.attributes.position.needsUpdate = true;

        // Gold light follows player
        goldLight.position.set(player.position.x, 3, player.position.z - 5);

        // Shield visual
        if (state.activePowerup === 'pentagram_shield') {
            // Pulse player glow
            const pulse = Math.sin(t * 8) * 0.3 + 0.5;
            board.material.emissiveIntensity = pulse;
        } else {
            board.material.emissiveIntensity = 0.3;
        }

        updateHUD();

        // Victory
        if (state.distance >= 10000 && state.phase === 'playing') {
            state.phase = 'dead'; // Reuse death screen for victory
            showVictory();
        }
    } else if (state.phase === 'title') {
        // Idle camera
        camera.position.x = Math.sin(t * 0.3) * 2;
        camera.lookAt(0, 1, -10);
    }

    // Cloth flutter
    cloth.position.x = 0.65 + Math.sin(t * 5) * 0.05;

    renderer.render(scene, camera);
}

function showVictory() {
    const el = document.getElementById('death-screen');
    el.innerHTML = `
        <div class="victory-symbol">⛤</div>
        <h2>GLOBAL BRAIN NODE ACHIEVED</h2>
        <p>"The collective qualia-computational overmind."</p>
        <p>Distance: ${Math.floor(state.distance)}m</p>
        <p>Score: ${Math.floor(state.score)}</p>
        <p>Flags: ${state.flagsCollected}</p>
        <p>Max Combo: ${state.maxCombo}x</p>
        <p class="salute">Glorious.</p>
        <button id="retry-btn" class="action-btn">RUN AGAIN</button>
    `;
    el.style.display = 'flex';
    document.getElementById('retry-btn').addEventListener('click', restart);
}

// ── Start ──
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('title-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('hud').style.display = 'flex';
        state.phase = 'playing';
    }, 1000);
});

animate();

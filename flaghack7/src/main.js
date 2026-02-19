import * as THREE from 'three';
import {
    ARENA_RADIUS, ARENA_FLOOR_COLOR, CAMERA_HEIGHT, CAMERA_ANGLE,
    BOSSES, BULLET_COLORS,
    SCORE_BULLET_HIT, SCORE_BOSS_PHASE, SCORE_BOSS_KILL, SCORE_NO_HIT_BONUS,
    SPECIAL_FLAG_STORM, SPECIAL_PENTAGRAM_BLAST, SPECIAL_LEY_BEAM,
    PLAYER_FLAGIC_REGEN,
} from './constants.js';
import { createPlayer, updatePlayer, playerShoot, startDodge } from './player.js';
import { createBoss, updateBoss, removeBoss } from './bosses.js';

// ── Renderer / Scene / Camera ──
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020208, 0.012);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 200);
camera.position.set(0, CAMERA_HEIGHT, 25);
camera.rotation.x = CAMERA_ANGLE;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Lighting ──
const ambientLight = new THREE.AmbientLight(0x111122, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x443355, 0.8);
dirLight.position.set(20, 30, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 80;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
scene.add(dirLight);

// ── Arena ──
function buildArena() {
    // Floor
    const floorGeo = new THREE.CircleGeometry(ARENA_RADIUS, 64);
    const floorMat = new THREE.MeshStandardMaterial({
        color: ARENA_FLOOR_COLOR, roughness: 0.9, metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Pentagram inscription on floor
    const pentaGroup = new THREE.Group();
    const pentaRadius = ARENA_RADIUS * 0.7;
    const pentaMat = new THREE.LineBasicMaterial({ color: 0x332200, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 5; i++) {
        const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 2) % 5 / 5) * Math.PI * 2 - Math.PI / 2;
        const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(Math.cos(a1) * pentaRadius, 0.02, Math.sin(a1) * pentaRadius),
            new THREE.Vector3(Math.cos(a2) * pentaRadius, 0.02, Math.sin(a2) * pentaRadius),
        ]);
        pentaGroup.add(new THREE.Line(geo, pentaMat));
    }
    scene.add(pentaGroup);

    // Edge ring glow
    const edgeGeo = new THREE.TorusGeometry(ARENA_RADIUS, 0.3, 8, 128);
    const edgeMat = new THREE.MeshBasicMaterial({
        color: 0xffd700, transparent: true, opacity: 0.15,
        blending: THREE.AdditiveBlending,
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = 0.1;
    scene.add(edge);

    // Pillar flags at pentagram points
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * pentaRadius;
        const pz = Math.sin(a) * pentaRadius;

        const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 6, 6);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(px, 3, pz);
        pole.castShadow = true;
        scene.add(pole);

        const clothGeo = new THREE.PlaneGeometry(1.2, 1.2, 4, 4);
        clothGeo.rotateZ(Math.PI / 4);
        const clothMat = new THREE.MeshStandardMaterial({
            color: 0xffd700, side: THREE.DoubleSide,
            emissive: 0x664400, emissiveIntensity: 0.3,
        });
        const cloth = new THREE.Mesh(clothGeo, clothMat);
        cloth.position.set(px + 0.6, 5.2, pz);
        scene.add(cloth);

        const light = new THREE.PointLight(0xffd700, 0.5, 10);
        light.position.set(px, 5, pz);
        scene.add(light);
    }
}

// ── Particles ──
const particles = [];

function spawnParticles(pos, color, count, speed) {
    for (let i = 0; i < count; i++) {
        const geo = new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color, blending: THREE.AdditiveBlending, transparent: true, opacity: 1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        scene.add(mesh);
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * speed,
            Math.random() * speed * 0.5,
            (Math.random() - 0.5) * speed,
        );
        particles.push({ mesh, velocity: vel, lifetime: 0.5 + Math.random() * 0.5 });
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.lifetime -= dt;
        p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
        p.velocity.y -= 10 * dt;
        p.mesh.material.opacity = Math.max(0, p.lifetime * 2);
        if (p.lifetime <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
        }
    }
}

// ── Special Attacks ──
const activeSpecials = [];

function castFlagStorm(player) {
    if (player.flagic < SPECIAL_FLAG_STORM.cost) return;
    player.flagic -= SPECIAL_FLAG_STORM.cost;
    activeSpecials.push({
        type: 'flag_storm',
        timer: SPECIAL_FLAG_STORM.duration,
        tickTimer: 0,
        pos: player.mesh.position,
    });
    showNotification('FLAG STORM!', 0.8);
}

function castPentagramBlast(player, boss) {
    if (player.flagic < SPECIAL_PENTAGRAM_BLAST.cost) return;
    if (!boss) return;
    player.flagic -= SPECIAL_PENTAGRAM_BLAST.cost;

    // Pentagram visual
    const lines = new THREE.Group();
    const r = SPECIAL_PENTAGRAM_BLAST.radius;
    const mat = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 1 });
    for (let i = 0; i < 5; i++) {
        const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 2) % 5 / 5) * Math.PI * 2 - Math.PI / 2;
        const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(Math.cos(a1) * r, 0.5, Math.sin(a1) * r),
            new THREE.Vector3(Math.cos(a2) * r, 0.5, Math.sin(a2) * r),
        ]);
        lines.add(new THREE.Line(geo, mat));
    }
    lines.position.copy(boss.mesh.position);
    lines.position.y = 0;
    scene.add(lines);

    boss.hp -= SPECIAL_PENTAGRAM_BLAST.damage;
    spawnParticles(boss.mesh.position.clone().setY(2), 0xffd700, 30, 8);
    showNotification('PENTAGRAM BLAST!', 0.8);

    activeSpecials.push({ type: 'pentagram_visual', mesh: lines, timer: 1.5 });
}

function castLeyBeam(player, mouseWorldPos, boss, bullets) {
    if (player.flagic < SPECIAL_LEY_BEAM.cost) return;
    player.flagic -= SPECIAL_LEY_BEAM.cost;

    const start = player.mesh.position.clone();
    start.y = 1.5;
    const dir = new THREE.Vector3(
        mouseWorldPos.x - start.x, 0, mouseWorldPos.z - start.z
    ).normalize();

    // Visual beam
    const beamGeo = new THREE.CylinderGeometry(
        SPECIAL_LEY_BEAM.width * 0.5, SPECIAL_LEY_BEAM.width * 0.5,
        SPECIAL_LEY_BEAM.range, 8
    );
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
        color: 0xffd700, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    const mid = start.clone().add(dir.clone().multiplyScalar(SPECIAL_LEY_BEAM.range * 0.5));
    beam.position.copy(mid);
    beam.lookAt(start.clone().add(dir.clone().multiplyScalar(SPECIAL_LEY_BEAM.range)));
    scene.add(beam);

    // Damage boss if in path
    if (boss) {
        const toBoss = boss.mesh.position.clone().sub(start);
        toBoss.y = 0;
        const proj = toBoss.dot(dir);
        if (proj > 0 && proj < SPECIAL_LEY_BEAM.range) {
            const perp = toBoss.clone().sub(dir.clone().multiplyScalar(proj));
            if (perp.length() < SPECIAL_LEY_BEAM.width + 2) {
                boss.hp -= SPECIAL_LEY_BEAM.damage;
                spawnParticles(boss.mesh.position.clone().setY(2), 0xffd700, 15, 5);
            }
        }
    }

    // Clear enemy bullets in path
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.isPlayer) continue;
        const toBullet = b.mesh.position.clone().sub(start);
        toBullet.y = 0;
        const proj = toBullet.dot(dir);
        if (proj > 0 && proj < SPECIAL_LEY_BEAM.range) {
            const perp = toBullet.clone().sub(dir.clone().multiplyScalar(proj));
            if (perp.length() < SPECIAL_LEY_BEAM.width + 0.5) {
                scene.remove(b.mesh);
                bullets.splice(i, 1);
            }
        }
    }

    activeSpecials.push({ type: 'ley_beam', mesh: beam, timer: 0.3 });
    showNotification('LEY BEAM!', 0.5);
}

function updateSpecials(dt, boss, bullets) {
    for (let i = activeSpecials.length - 1; i >= 0; i--) {
        const s = activeSpecials[i];
        s.timer -= dt;

        if (s.type === 'flag_storm') {
            s.tickTimer -= dt;
            if (s.tickTimer <= 0) {
                s.tickTimer = 0.2;
                // Damage everything in radius
                if (boss && boss.hp > 0) {
                    const dist = s.pos.distanceTo(boss.mesh.position);
                    if (dist < SPECIAL_FLAG_STORM.radius) {
                        boss.hp -= SPECIAL_FLAG_STORM.damage;
                        spawnParticles(boss.mesh.position.clone().setY(2), 0xffd700, 3, 3);
                    }
                }
                // Clear enemy bullets in radius
                for (let j = bullets.length - 1; j >= 0; j--) {
                    const b = bullets[j];
                    if (b.isPlayer) continue;
                    if (s.pos.distanceTo(b.mesh.position) < SPECIAL_FLAG_STORM.radius) {
                        scene.remove(b.mesh);
                        bullets.splice(j, 1);
                    }
                }
                // Visual
                spawnParticles(
                    s.pos.clone().add(new THREE.Vector3(
                        (Math.random() - 0.5) * SPECIAL_FLAG_STORM.radius,
                        1 + Math.random() * 3,
                        (Math.random() - 0.5) * SPECIAL_FLAG_STORM.radius
                    )),
                    0xffd700, 2, 2
                );
            }
        }

        if (s.type === 'pentagram_visual' || s.type === 'ley_beam') {
            if (s.mesh) {
                if (s.mesh.material) {
                    s.mesh.material.opacity = Math.max(0, s.timer);
                } else {
                    // Group of lines
                    s.mesh.children.forEach(c => {
                        if (c.material) c.material.opacity = Math.max(0, s.timer);
                    });
                }
            }
        }

        if (s.timer <= 0) {
            if (s.mesh) scene.remove(s.mesh);
            activeSpecials.splice(i, 1);
        }
    }
}

// ── Game State ──
const gameState = {
    phase: 'title', // title, intro, playing, boss_transition, victory, dead
    currentBossIndex: 0,
    boss: null,
    player: null,
    bullets: [],
    score: 0,
    time: 0,
    introTimer: 0,
    transitionTimer: 0,
    notificationTimer: 0,
};

const input = { w: false, a: false, s: false, d: false, shift: false, mouse: false };
const mouse = new THREE.Vector2();
let mouseWorldPos = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// ── HUD ──
const hudEl = document.getElementById('hud');
const hudHp = document.getElementById('hud-hp');
const hudFlagic = document.getElementById('hud-flagic');
const hudBoss = document.getElementById('hud-boss');
const hudScore = document.getElementById('hud-score');
const bossHpBar = document.getElementById('boss-hp-bar');
const bossNameEl = document.getElementById('boss-name');
const bossHpFill = document.getElementById('boss-hp-fill');
const bossPhaseEl = document.getElementById('boss-phase');
const notifEl = document.getElementById('notification');
const titleScreen = document.getElementById('title-screen');
const gameOverScreen = document.getElementById('game-over');
const endTitle = document.getElementById('end-title');
const endStats = document.getElementById('end-stats');

function updateHUD() {
    if (!gameState.player) return;
    const p = gameState.player;
    hudHp.textContent = Math.ceil(p.hp);
    hudHp.style.color = p.hp > 50 ? '#44ff44' : p.hp > 25 ? '#ffaa00' : '#ff4444';
    hudFlagic.textContent = Math.ceil(p.flagic);
    hudBoss.textContent = `${gameState.currentBossIndex + 1}/5`;
    hudScore.textContent = gameState.score;

    if (gameState.boss && gameState.boss.hp > 0) {
        bossHpBar.style.display = 'block';
        bossNameEl.textContent = `${gameState.boss.config.name} - ${gameState.boss.config.subtitle}`;
        bossHpFill.style.width = `${(gameState.boss.hp / gameState.boss.maxHp) * 100}%`;
        bossPhaseEl.textContent = `Phase ${gameState.boss.phase} / ${gameState.boss.maxPhases}`;
    } else {
        bossHpBar.style.display = 'none';
    }
}

function showNotification(text, duration) {
    notifEl.textContent = text;
    notifEl.style.display = 'block';
    notifEl.style.opacity = '1';
    gameState.notificationTimer = duration || 1.5;
}

// ── Input ──
document.addEventListener('keydown', e => {
    if (e.key === 'w' || e.key === 'W') input.w = true;
    if (e.key === 'a' || e.key === 'A') input.a = true;
    if (e.key === 's' || e.key === 'S') input.s = true;
    if (e.key === 'd' || e.key === 'D') input.d = true;
    if (e.key === 'Shift') input.shift = true;

    // Special attacks
    if (gameState.phase === 'playing' && gameState.player) {
        if (e.key === '1') castFlagStorm(gameState.player);
        if (e.key === '2') castPentagramBlast(gameState.player, gameState.boss);
        if (e.key === '3') castLeyBeam(gameState.player, mouseWorldPos, gameState.boss, gameState.bullets);
    }

    // Dodge
    if (e.code === 'Space' && gameState.phase === 'playing' && gameState.player) {
        startDodge(gameState.player, input);
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'w' || e.key === 'W') input.w = false;
    if (e.key === 'a' || e.key === 'A') input.a = false;
    if (e.key === 's' || e.key === 'S') input.s = false;
    if (e.key === 'd' || e.key === 'D') input.d = false;
    if (e.key === 'Shift') input.shift = false;
});

document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

document.addEventListener('mousedown', () => { input.mouse = true; });
document.addEventListener('mouseup', () => { input.mouse = false; });

document.addEventListener('click', () => {
    if (gameState.phase === 'title') {
        startGame();
    } else if (gameState.phase === 'dead' || gameState.phase === 'victory') {
        resetGame();
    }
});

// Prevent context menu
document.addEventListener('contextmenu', e => e.preventDefault());

function updateMouseWorldPos() {
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(groundPlane, mouseWorldPos);
}

// ── Bullet Management ──
function updateBullets(dt) {
    const bullets = gameState.bullets;
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.lifetime -= dt;
        b.mesh.position.add(b.velocity.clone().multiplyScalar(dt));

        // Out of arena or expired
        const bDist = Math.sqrt(b.mesh.position.x ** 2 + b.mesh.position.z ** 2);
        if (b.lifetime <= 0 || bDist > ARENA_RADIUS + 5) {
            scene.remove(b.mesh);
            bullets.splice(i, 1);
            continue;
        }

        // Player bullet hits boss
        if (b.isPlayer && gameState.boss && gameState.boss.hp > 0) {
            const bossPos = gameState.boss.mesh.position;
            const dx = b.mesh.position.x - bossPos.x;
            const dz = b.mesh.position.z - bossPos.z;
            if (dx * dx + dz * dz < 4) { // hit radius ~2
                gameState.boss.hp -= b.damage;
                gameState.score += SCORE_BULLET_HIT;
                spawnParticles(b.mesh.position.clone(), gameState.boss.config.color, 5, 4);
                scene.remove(b.mesh);
                bullets.splice(i, 1);

                // Check boss phase change score
                const prevPhase = gameState.boss.phase;
                // Phase check happens in updateBoss, but we track for score
                continue;
            }
        }

        // Enemy bullet hits player
        if (!b.isPlayer && gameState.player && gameState.player.hp > 0) {
            if (gameState.player.invulnTimer > 0) continue; // i-frames
            const pp = gameState.player.mesh.position;
            const dx = b.mesh.position.x - pp.x;
            const dz = b.mesh.position.z - pp.z;
            if (dx * dx + dz * dz < 0.8) { // player hit radius
                gameState.player.hp -= b.damage;
                gameState.player.invulnTimer = 0.5;
                gameState.player.hitThisBoss = true;
                spawnParticles(b.mesh.position.clone(), 0xff4444, 8, 5);
                scene.remove(b.mesh);
                bullets.splice(i, 1);

                if (gameState.player.hp <= 0) {
                    playerDeath();
                }
                continue;
            }
        }
    }
}

function clearBullets() {
    for (const b of gameState.bullets) {
        scene.remove(b.mesh);
    }
    gameState.bullets.length = 0;
}

// ── Boss Sequencing ──
function spawnNextBoss() {
    if (gameState.currentBossIndex >= BOSSES.length) {
        victory();
        return;
    }
    const config = BOSSES[gameState.currentBossIndex];
    showNotification(`${config.name}\n${config.subtitle}`, 3);
    gameState.phase = 'intro';
    gameState.introTimer = 3;
    gameState.boss = createBoss(gameState.currentBossIndex, scene);
    gameState.player.hitThisBoss = false;
}

function bossDefeated() {
    gameState.score += SCORE_BOSS_KILL;
    if (!gameState.player.hitThisBoss) {
        gameState.score += SCORE_NO_HIT_BONUS;
        showNotification('PERFECT - NO HIT BONUS!', 2);
    } else {
        showNotification('BOSS DEFEATED!', 2);
    }

    // Heal player partially
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 30);
    gameState.player.flagic = gameState.player.maxFlagic;

    removeBoss(gameState.boss, scene);
    gameState.boss = null;
    clearBullets();

    gameState.currentBossIndex++;
    gameState.phase = 'boss_transition';
    gameState.transitionTimer = 3;
}

function playerDeath() {
    gameState.phase = 'dead';
    clearBullets();

    // Death explosion
    spawnParticles(gameState.player.mesh.position.clone().setY(2), 0xff4444, 40, 10);
    spawnParticles(gameState.player.mesh.position.clone().setY(2), 0xffd700, 20, 6);

    gameOverScreen.style.display = 'flex';
    endTitle.textContent = 'FALLEN';
    endTitle.style.color = '#ff4444';
    const bossName = gameState.boss ? gameState.boss.config.name : 'UNKNOWN';
    endStats.innerHTML = `
        Defeated by: ${bossName}<br>
        Bosses vanquished: ${gameState.currentBossIndex} / 5<br>
        Score: ${gameState.score}<br><br>
        "The Flag endures. Rise again."
    `;
}

function victory() {
    gameState.phase = 'victory';
    clearBullets();

    spawnParticles(gameState.player.mesh.position.clone().setY(2), 0xffd700, 60, 12);

    gameOverScreen.style.display = 'flex';
    endTitle.textContent = 'TRIUMPH OF FLAGS';
    endTitle.style.color = '#ffd700';
    endStats.innerHTML = `
        All five cosmic threats vanquished!<br>
        Score: ${gameState.score}<br><br>
        "And the Sign and Signifier became One.<br>
        Each Flag was every Flag.<br>
        Glorious."
    `;
}

// ── Game Lifecycle ──
function startGame() {
    titleScreen.style.opacity = '0';
    setTimeout(() => { titleScreen.style.display = 'none'; }, 1500);
    hudEl.style.display = 'block';

    gameState.player = createPlayer(scene);
    gameState.player.mesh.position.set(0, 0, 15);
    gameState.currentBossIndex = 0;
    gameState.score = 0;
    gameState.phase = 'boss_transition';
    gameState.transitionTimer = 2;
}

function resetGame() {
    // Clean up
    gameOverScreen.style.display = 'none';
    if (gameState.player) {
        scene.remove(gameState.player.mesh);
        gameState.player = null;
    }
    if (gameState.boss) {
        removeBoss(gameState.boss, scene);
        gameState.boss = null;
    }
    clearBullets();
    activeSpecials.forEach(s => { if (s.mesh) scene.remove(s.mesh); });
    activeSpecials.length = 0;

    gameState.player = createPlayer(scene);
    gameState.player.mesh.position.set(0, 0, 15);
    gameState.currentBossIndex = 0;
    gameState.score = 0;
    gameState.phase = 'boss_transition';
    gameState.transitionTimer = 2;
}

// ── Camera follow ──
function updateCamera() {
    if (!gameState.player) return;
    const pp = gameState.player.mesh.position;
    const targetX = pp.x * 0.3;
    const targetZ = pp.z * 0.3 + 25;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
}

// ── Main Loop ──
let lastTime = 0;

buildArena();

function loop(timestamp) {
    requestAnimationFrame(loop);

    const rawDt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05);
    gameState.time += dt;
    const time = gameState.time;

    updateMouseWorldPos();

    // Notification fade
    if (gameState.notificationTimer > 0) {
        gameState.notificationTimer -= dt;
        if (gameState.notificationTimer <= 0) {
            notifEl.style.opacity = '0';
            setTimeout(() => { notifEl.style.display = 'none'; }, 500);
        }
    }

    updateParticles(dt);

    if (gameState.phase === 'title') {
        renderer.render(scene, camera);
        return;
    }

    if (gameState.phase === 'boss_transition') {
        gameState.transitionTimer -= dt;
        if (gameState.player) {
            updatePlayer(gameState.player, input, dt, time, mouseWorldPos);
        }
        if (gameState.transitionTimer <= 0) {
            spawnNextBoss();
        }
        updateCamera();
        updateHUD();
        renderer.render(scene, camera);
        return;
    }

    if (gameState.phase === 'intro') {
        gameState.introTimer -= dt;
        if (gameState.player) {
            updatePlayer(gameState.player, input, dt, time, mouseWorldPos);
        }
        if (gameState.introTimer <= 0) {
            gameState.phase = 'playing';
        }
        updateCamera();
        updateHUD();
        renderer.render(scene, camera);
        return;
    }

    if (gameState.phase === 'playing') {
        // Player update
        updatePlayer(gameState.player, input, dt, time, mouseWorldPos);

        // Auto-fire when holding mouse
        if (input.mouse) {
            playerShoot(gameState.player, scene, gameState.bullets, mouseWorldPos);
        }

        // Boss update
        const prevPhase = gameState.boss ? gameState.boss.phase : 0;
        updateBoss(gameState.boss, gameState.player, scene, gameState.bullets, dt, time);
        if (gameState.boss && gameState.boss.phase > prevPhase) {
            gameState.score += SCORE_BOSS_PHASE;
        }

        // Bullet update
        updateBullets(dt);

        // Special attacks update
        updateSpecials(dt, gameState.boss, gameState.bullets);

        // Boss defeated check
        if (gameState.boss && gameState.boss.hp <= 0) {
            bossDefeated();
        }

        // Boss miasma pulse (THE STENCH)
        if (gameState.boss && gameState.boss.bossIndex === 0 && gameState.boss.mesh.userData.miasma) {
            const miasma = gameState.boss.mesh.userData.miasma;
            miasma.scale.setScalar(1 + Math.sin(time * 3) * 0.15);
            miasma.material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
        }
    }

    // Invuln flash
    if (gameState.player && gameState.player.invulnTimer > 0) {
        gameState.player.mesh.visible = Math.sin(time * 30) > 0;
    } else if (gameState.player) {
        gameState.player.mesh.visible = true;
    }

    updateCamera();
    updateHUD();
    renderer.render(scene, camera);
}

requestAnimationFrame(loop);

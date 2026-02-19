// ── FLAGHACK 11: TIME PIRACY ── Main ──
import * as THREE from 'three';
import {
    LANE_COUNT, LANE_KEYS, LANE_LABELS, LANE_COLORS,
    NOTE_TYPES, NOTE_SPEED, LANE_LENGTH, HIT_LINE_Z, SPAWN_Z,
    TIMING, TIMING_SCORES,
    THICK_TIME_PER_PERFECT, THICK_TIME_PER_GREAT, THICK_TIME_PER_GOOD,
    THICK_TIME_DECAY, CRYSTALLIZE_THRESHOLD, TIME_CRYSTAL_BONUS,
    COMBO_PENTAGRAM_THRESHOLD, PENTAGRAM_BONUS,
    SONGS, PIRATE_RANKS, QUOTES,
} from './constants.js';
import { initAudio, playBeatSound, startBeat, stopBeat } from './audio.js';
import { generateNoteChart, getNoteLeadTime } from './song.js';

// ── Renderer ──
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050310);
scene.fog = new THREE.FogExp2(0x050310, 0.012);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 200);
camera.position.set(0, 12, 8);
camera.lookAt(0, 0, HIT_LINE_Z + 5);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Lighting ──
scene.add(new THREE.AmbientLight(0x221133, 0.4));
const dirLight = new THREE.DirectionalLight(0xffcc88, 0.5);
dirLight.position.set(5, 15, -5);
scene.add(dirLight);

// ── Lane Setup ──
const laneSpacing = 2.5;
const laneStartX = -(LANE_COUNT - 1) * laneSpacing / 2;
const laneMeshes = [];

for (let i = 0; i < LANE_COUNT; i++) {
    const x = laneStartX + i * laneSpacing;
    // Lane track
    const track = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, LANE_LENGTH),
        new THREE.MeshStandardMaterial({
            color: 0x111122, transparent: true, opacity: 0.6,
        }),
    );
    track.rotation.x = -Math.PI / 2;
    track.position.set(x, 0.01, HIT_LINE_Z + LANE_LENGTH / 2);
    scene.add(track);

    // Hit zone glow
    const hitZone = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 1),
        new THREE.MeshBasicMaterial({
            color: LANE_COLORS[i], transparent: true, opacity: 0.15,
        }),
    );
    hitZone.rotation.x = -Math.PI / 2;
    hitZone.position.set(x, 0.02, HIT_LINE_Z);
    scene.add(hitZone);

    // Hit line marker
    const marker = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.15, 0.15),
        new THREE.MeshStandardMaterial({
            color: LANE_COLORS[i], emissive: LANE_COLORS[i], emissiveIntensity: 0.5,
        }),
    );
    marker.position.set(x, 0.1, HIT_LINE_Z);
    scene.add(marker);

    laneMeshes.push({ track, hitZone, marker, x });
}

// ── Pentagram connection lines between hit markers ──
const pentMat = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.15 });
for (let i = 0; i < LANE_COUNT; i++) {
    const j = (i + 2) % LANE_COUNT;
    const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(laneMeshes[i].x, 0.05, HIT_LINE_Z),
        new THREE.Vector3(laneMeshes[j].x, 0.05, HIT_LINE_Z),
    ]);
    scene.add(new THREE.Line(geo, pentMat));
}

// ── Decorative flags along sides ──
for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 8; i++) {
        const group = new THREE.Group();
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 3, 4),
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
        group.position.set(
            side * (laneStartX + LANE_COUNT * laneSpacing / 2 + 3),
            0,
            HIT_LINE_Z + i * 3.5,
        );
        scene.add(group);
    }
}

// ── Particles ──
const pCount = 150;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 30;
    pPos[i * 3 + 1] = Math.random() * 15;
    pPos[i * 3 + 2] = Math.random() * LANE_LENGTH + HIT_LINE_Z;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xffd700, size: 0.1, transparent: true, opacity: 0.4, depthWrite: false,
}));
scene.add(particles);

// ── Game State ──
const gameState = {
    phase: 'menu', // menu, playing, results
    songIndex: 0,
    songTime: 0,
    notes: [],
    noteMeshes: [],
    score: 0,
    totalScore: 0, // Across all songs
    combo: 0,
    maxCombo: 0,
    thickTime: 0,
    crystals: 0,
    laneHits: new Array(LANE_COUNT).fill(false), // For pentagram detection
    perfects: 0,
    greats: 0,
    goods: 0,
    misses: 0,
    beatId: null,
    leadTime: getNoteLeadTime(),
};

// ── Note Mesh Creation ──
function createNoteMesh(noteType, lane) {
    const info = NOTE_TYPES[noteType];
    const x = laneMeshes[lane].x;
    let mesh;

    if (noteType === 'hippie') {
        // Green menacing shape
        mesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(info.size),
            new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.4 }),
        );
    } else if (noteType === 'crystal') {
        mesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(info.size),
            new THREE.MeshStandardMaterial({
                color: info.color, emissive: info.color, emissiveIntensity: 0.5,
                transparent: true, opacity: 0.8,
            }),
        );
    } else if (noteType === 'effigy') {
        mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.3, info.size * 2, 5),
            new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.5 }),
        );
    } else {
        // Flag note - diamond shape
        mesh = new THREE.Mesh(
            new THREE.BoxGeometry(info.size, info.size, info.size),
            new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.4 }),
        );
        mesh.rotation.set(Math.PI / 4, 0, Math.PI / 4);
    }

    mesh.position.set(x, 0.5, SPAWN_Z);
    scene.add(mesh);
    return mesh;
}

function removeNoteMesh(mesh) {
    scene.remove(mesh);
}

// ── Input ──
const keysDown = {};
const keyJustPressed = {};

window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (!keysDown[key]) {
        keyJustPressed[key] = true;
    }
    keysDown[key] = true;
});
window.addEventListener('keyup', e => {
    keysDown[e.key.toLowerCase()] = false;
});

function consumeKeyPress(key) {
    if (keyJustPressed[key]) {
        keyJustPressed[key] = false;
        return true;
    }
    return false;
}

// ── HUD ──
function updateHUD() {
    const scoreEl = document.getElementById('hud-score');
    const comboEl = document.getElementById('hud-combo');
    const thickEl = document.getElementById('hud-thick');
    const crystalEl = document.getElementById('hud-crystals');
    const songEl = document.getElementById('hud-song');

    if (scoreEl) scoreEl.textContent = `Score: ${gameState.score}`;
    if (comboEl) {
        comboEl.textContent = gameState.combo > 1 ? `${gameState.combo}x Combo` : '';
        comboEl.style.color = gameState.combo >= 20 ? '#ffd700' : gameState.combo >= 10 ? '#ffaa33' : '#888';
    }
    if (thickEl) {
        const pct = Math.min(100, Math.floor(gameState.thickTime / CRYSTALLIZE_THRESHOLD * 100));
        thickEl.textContent = `Thick Time: ${pct}%`;
        thickEl.style.color = pct >= 80 ? '#ffd700' : pct >= 50 ? '#ffaa33' : '#666';
    }
    if (crystalEl) crystalEl.textContent = gameState.crystals > 0 ? `Time Crystals: ${gameState.crystals}` : '';
    if (songEl && gameState.phase === 'playing') {
        const song = SONGS[gameState.songIndex];
        const remaining = Math.max(0, song.duration - gameState.songTime);
        songEl.textContent = `${song.name} — ${Math.floor(remaining)}s`;
    }
}

// ── Timing feedback ──
const feedbackEl = document.getElementById('feedback');
function showFeedback(text, color) {
    if (!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.style.color = color;
    feedbackEl.style.opacity = '1';
    feedbackEl.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        feedbackEl.style.opacity = '0';
        feedbackEl.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 300);
}

// ── Core Gameplay ──
function startSong(songIndex) {
    gameState.phase = 'playing';
    gameState.songIndex = songIndex;
    gameState.songTime = 0;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.thickTime = 0;
    gameState.crystals = 0;
    gameState.laneHits.fill(false);
    gameState.perfects = 0;
    gameState.greats = 0;
    gameState.goods = 0;
    gameState.misses = 0;

    // Clear old notes
    for (const n of gameState.noteMeshes) {
        if (n) removeNoteMesh(n);
    }
    gameState.noteMeshes = [];
    gameState.notes = generateNoteChart(songIndex);

    // Start audio
    initAudio();
    gameState.beatId = startBeat(SONGS[songIndex].bpm);

    document.getElementById('song-select').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
}

function endSong() {
    gameState.phase = 'results';
    stopBeat(gameState.beatId);
    gameState.totalScore += gameState.score;

    // Clean up remaining notes
    for (const note of gameState.notes) {
        if (note.mesh) removeNoteMesh(note.mesh);
    }

    showResults();
}

function processInput() {
    for (let lane = 0; lane < LANE_COUNT; lane++) {
        const key = LANE_KEYS[lane];
        if (!consumeKeyPress(key)) continue;

        // Flash hit zone
        laneMeshes[lane].marker.material.emissiveIntensity = 1.5;
        setTimeout(() => { laneMeshes[lane].marker.material.emissiveIntensity = 0.5; }, 100);

        // Find closest note in this lane
        let closest = null;
        let closestDist = Infinity;

        for (const note of gameState.notes) {
            if (note.hit || note.missed || note.lane !== lane) continue;
            const dist = Math.abs(note.time - gameState.songTime);
            if (dist < closestDist) {
                closestDist = dist;
                closest = note;
            }
        }

        if (closest && closestDist <= TIMING.miss) {
            // It's a hippie - DON'T hit
            if (closest.type === 'hippie') {
                closest.hit = true;
                gameState.score += NOTE_TYPES.hippie.points;
                gameState.combo = 0;
                showFeedback('HIPPIE!', '#66aa44');
                playBeatSound('miss');
                if (closest.mesh) { removeNoteMesh(closest.mesh); closest.mesh = null; }
                continue;
            }

            // Grade the hit
            let grade, thickGain;
            if (closestDist <= TIMING.perfect) {
                grade = 'PERFECT'; thickGain = THICK_TIME_PER_PERFECT;
                gameState.perfects++;
            } else if (closestDist <= TIMING.great) {
                grade = 'GREAT'; thickGain = THICK_TIME_PER_GREAT;
                gameState.greats++;
            } else if (closestDist <= TIMING.good) {
                grade = 'GOOD'; thickGain = THICK_TIME_PER_GOOD;
                gameState.goods++;
            } else {
                grade = 'MISS'; thickGain = 0;
                gameState.misses++;
            }

            closest.hit = true;
            if (closest.mesh) { removeNoteMesh(closest.mesh); closest.mesh = null; }

            if (grade !== 'MISS') {
                const points = NOTE_TYPES[closest.type].points * TIMING_SCORES[grade.toLowerCase()];
                gameState.combo++;
                gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
                const comboMultiplier = 1 + Math.floor(gameState.combo / 10) * 0.5;
                gameState.score += Math.floor(points * comboMultiplier);
                gameState.thickTime += thickGain;

                // Pentagram detection
                gameState.laneHits[lane] = true;
                if (gameState.laneHits.every(h => h)) {
                    gameState.score += PENTAGRAM_BONUS;
                    gameState.laneHits.fill(false);
                    showFeedback('⛤ PENTAGRAM!', '#ffd700');
                    playBeatSound('pentagram');
                }

                // Crystallization check
                if (gameState.thickTime >= CRYSTALLIZE_THRESHOLD) {
                    gameState.thickTime = 0;
                    gameState.crystals++;
                    gameState.score += TIME_CRYSTAL_BONUS;
                    showFeedback('TIME CRYSTAL!', '#88ccff');
                    playBeatSound('crystallize');
                }

                playBeatSound(closest.type);
                const colors = { PERFECT: '#ffd700', GREAT: '#ffaa33', GOOD: '#888' };
                showFeedback(grade, colors[grade]);
            } else {
                gameState.combo = 0;
                playBeatSound('miss');
                showFeedback('MISS', '#553333');
            }
        }
    }
}

// ── Update Loop ──
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = Date.now() * 0.001;

    if (gameState.phase === 'playing') {
        gameState.songTime += dt;

        // Spawn notes that are within lead time
        for (const note of gameState.notes) {
            if (note.mesh || note.hit || note.missed) continue;
            if (note.time - gameState.songTime <= gameState.leadTime && note.time > gameState.songTime - 1) {
                note.mesh = createNoteMesh(note.type, note.lane);
                gameState.noteMeshes.push(note.mesh);
            }
        }

        // Move notes
        for (const note of gameState.notes) {
            if (!note.mesh || note.hit) continue;
            const elapsed = gameState.songTime - (note.time - gameState.leadTime);
            const z = SPAWN_Z - elapsed * NOTE_SPEED;
            note.mesh.position.z = z;
            note.mesh.position.y = 0.5 + Math.sin(t * 3 + note.lane) * 0.1;
            note.mesh.rotation.y += dt * 2;

            // Check if missed (past hit line)
            if (gameState.songTime - note.time > TIMING.miss && !note.hit) {
                note.missed = true;
                if (note.type !== 'hippie') {
                    gameState.misses++;
                    gameState.combo = 0;
                }
                removeNoteMesh(note.mesh);
                note.mesh = null;
            }
        }

        // Thick time decay
        gameState.thickTime = Math.max(0, gameState.thickTime - THICK_TIME_DECAY * dt);

        // Process input
        processInput();

        // Check song end
        if (gameState.songTime >= SONGS[gameState.songIndex].duration) {
            endSong();
        }

        updateHUD();
    }

    // Animate particles
    if (particles) {
        const pos = particles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.array[i * 3 + 1] += dt * 0.5;
            if (pos.array[i * 3 + 1] > 15) pos.array[i * 3 + 1] = 0;
            pos.array[i * 3] += Math.sin(t + i * 0.5) * 0.003;
        }
        pos.needsUpdate = true;
    }

    // Thick time visual effect - pulse scene fog
    if (gameState.phase === 'playing') {
        const intensity = gameState.thickTime / CRYSTALLIZE_THRESHOLD;
        scene.fog.density = 0.012 - intensity * 0.008;
        scene.background.setHSL(0.72 + intensity * 0.05, 0.6, 0.02 + intensity * 0.02);
    }

    renderer.render(scene, camera);

    // Clear just-pressed
    for (const k in keyJustPressed) keyJustPressed[k] = false;
}

// ── Song Select / Results ──
function showSongSelect() {
    const el = document.getElementById('song-select');
    let html = '<h2>SELECT SONG</h2><div class="song-list">';
    for (let i = 0; i < SONGS.length; i++) {
        const song = SONGS[i];
        const locked = i > 0 && i > gameState.crystals; // Unlock with crystals
        html += `
            <div class="song-item ${locked ? 'locked' : ''}" data-song="${i}">
                <div class="song-name">${song.name}</div>
                <div class="song-desc">${song.desc}</div>
                <div class="song-info">BPM: ${song.bpm} | Difficulty: ${'★'.repeat(song.difficulty)}</div>
                ${locked ? '<div class="song-lock">Need ' + i + ' Time Crystal(s)</div>' : ''}
            </div>
        `;
    }
    html += '</div>';

    // Show rank
    let rank = PIRATE_RANKS[0].name;
    for (const r of PIRATE_RANKS) {
        if (gameState.totalScore >= r.threshold) rank = r.name;
    }
    html += `<div class="rank-display">Rank: ${rank} | Total Score: ${gameState.totalScore}</div>`;

    el.innerHTML = html;
    el.style.display = 'flex';

    for (const item of el.querySelectorAll('.song-item:not(.locked)')) {
        item.addEventListener('click', () => {
            startSong(parseInt(item.dataset.song));
        });
    }
}

function showResults() {
    document.getElementById('hud').style.display = 'none';
    const el = document.getElementById('song-select');
    const song = SONGS[gameState.songIndex];
    const total = gameState.perfects + gameState.greats + gameState.goods + gameState.misses;

    el.innerHTML = `
        <div class="results">
            <h2>SONG COMPLETE</h2>
            <div class="results-song">${song.name}</div>
            <div class="results-score">Score: ${gameState.score}</div>
            <div class="results-combo">Max Combo: ${gameState.maxCombo}x</div>
            <div class="results-grades">
                <span class="grade-perfect">Perfect: ${gameState.perfects}</span>
                <span class="grade-great">Great: ${gameState.greats}</span>
                <span class="grade-good">Good: ${gameState.goods}</span>
                <span class="grade-miss">Miss: ${gameState.misses}</span>
            </div>
            <div class="results-crystals">Time Crystals Earned: ${gameState.crystals}</div>
            <div class="results-quote">${QUOTES[Math.floor(Math.random() * QUOTES.length)]}</div>
            <button id="back-btn" class="action-btn">CONTINUE</button>
        </div>
    `;
    el.style.display = 'flex';

    document.getElementById('back-btn').addEventListener('click', () => {
        gameState.phase = 'menu';
        showSongSelect();
    });
}

// ── Init ──
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('title-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('title-screen').style.display = 'none';
        showSongSelect();
    }, 1000);
});

animate();

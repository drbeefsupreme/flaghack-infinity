import {
    WAVE_PREP_TIME, WAVE_BASE_ENEMIES, WAVE_ENEMY_SCALE,
    MAX_ENEMIES_ALIVE, SCORE_WAVE_CLEAR
} from './constants.js';
import { spawnHippie, getAliveCount } from './hippies.js';

export function createWaveSystem() {
    return {
        wave: 1,
        phase: 'prep',  // 'prep' or 'active'
        timer: WAVE_PREP_TIME,
        enemiesRemaining: 0,
        enemiesSpawned: 0,
        enemiesTotal: 0,
        waveMessages: [
            'The Hippies Approach...',
            'The Stench Grows Stronger...',
            'A Drum Circle Forms in the Distance...',
            'The Unwashed Masses Descend...',
            'The Firmament Trembles...',
            'Null-time Ripples Through the Playa...',
            'The Great Chronoschism Echoes...',
            'Flag Psychosis Reaches Critical Mass...',
            'The Spirit of the Flags is Tested...',
            'EVERY FLAG IS EVERY FLAG...',
        ],
    };
}

export function updateWaves(waveSystem, hippieSystem, scene, gameState, dt) {
    if (gameState.effigyDestroyed || gameState.gameOver) return null;

    let event = null;

    switch (waveSystem.phase) {
        case 'prep': {
            waveSystem.timer -= dt;
            if (waveSystem.timer <= 0) {
                // Start wave
                waveSystem.phase = 'active';
                const count = Math.floor(WAVE_BASE_ENEMIES * Math.pow(WAVE_ENEMY_SCALE, waveSystem.wave - 1));
                waveSystem.enemiesTotal = count;
                waveSystem.enemiesSpawned = 0;
                waveSystem.enemiesRemaining = count;

                const msgIdx = Math.min(waveSystem.wave - 1, waveSystem.waveMessages.length - 1);
                event = {
                    type: 'wave_start',
                    wave: waveSystem.wave,
                    message: waveSystem.waveMessages[msgIdx],
                    enemyCount: count,
                };

                // Spawn enemies (respecting max alive limit)
                const toSpawn = Math.min(count, MAX_ENEMIES_ALIVE);
                spawnHippie(hippieSystem, scene, toSpawn);
                waveSystem.enemiesSpawned = toSpawn;
            }
            break;
        }

        case 'active': {
            // Check if we need to spawn more (drip-feed)
            const alive = getAliveCount(hippieSystem);
            if (waveSystem.enemiesSpawned < waveSystem.enemiesTotal && alive < MAX_ENEMIES_ALIVE * 0.5) {
                const batch = Math.min(
                    5,
                    waveSystem.enemiesTotal - waveSystem.enemiesSpawned,
                    MAX_ENEMIES_ALIVE - alive
                );
                if (batch > 0) {
                    spawnHippie(hippieSystem, scene, batch);
                    waveSystem.enemiesSpawned += batch;
                }
            }

            // Check wave clear
            const totalAlive = alive + hippieSystem.spawnQueue;
            const allSpawned = waveSystem.enemiesSpawned >= waveSystem.enemiesTotal;
            if (allSpawned && totalAlive === 0) {
                // Wave cleared!
                gameState.score += SCORE_WAVE_CLEAR * waveSystem.wave;
                event = {
                    type: 'wave_clear',
                    wave: waveSystem.wave,
                };

                waveSystem.wave++;
                gameState.wave = waveSystem.wave;
                waveSystem.phase = 'prep';
                waveSystem.timer = WAVE_PREP_TIME;

                // Bonus flags every 3 waves
                if (waveSystem.wave % 3 === 1) {
                    event.bonusFlags = 5;
                }
            }
            break;
        }
    }

    return event;
}

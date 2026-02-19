// ── Song / Note Generation ──
import { LANE_COUNT, NOTE_TYPES, SONGS, NOTE_SPEED, SPAWN_Z, HIT_LINE_Z } from './constants.js';

// Generate a procedural note chart for a song
export function generateNoteChart(songIndex) {
    const song = SONGS[songIndex];
    const beatInterval = 60 / song.bpm;
    const notes = [];
    const totalBeats = Math.floor(song.duration / beatInterval);

    for (let beat = 4; beat < totalBeats; beat++) { // Start after 4 beat lead-in
        // Base pattern: flag notes on the beat
        const time = beat * beatInterval;

        // Determine how many notes this beat (more at higher difficulty)
        let noteCount = 1;
        if (song.difficulty >= 3 && beat % 2 === 0) noteCount = 2;
        if (song.difficulty >= 5 && beat % 4 === 0) noteCount = 3;

        // Sometimes skip beats for rhythmic variety
        if (Math.random() < 0.25 / song.difficulty) continue;

        const usedLanes = new Set();

        for (let n = 0; n < noteCount; n++) {
            let lane;
            do {
                lane = Math.floor(Math.random() * LANE_COUNT);
            } while (usedLanes.has(lane));
            usedLanes.add(lane);

            // Determine note type
            let type = 'flag';
            const r = Math.random();
            if (r < song.hippieChance) type = 'hippie';
            else if (r < song.hippieChance + song.crystalChance) type = 'crystal';
            else if (r < song.hippieChance + song.crystalChance + song.effigyChance) type = 'effigy';

            notes.push({
                time,
                lane,
                type,
                hit: false,
                missed: false,
                mesh: null,
            });
        }

        // Add syncopated notes at higher difficulties
        if (song.difficulty >= 2 && beat % 2 === 0 && Math.random() < 0.3) {
            const offbeatTime = time + beatInterval * 0.5;
            let lane;
            do {
                lane = Math.floor(Math.random() * LANE_COUNT);
            } while (usedLanes.has(lane));

            notes.push({
                time: offbeatTime,
                lane,
                type: 'flag',
                hit: false,
                missed: false,
                mesh: null,
            });
        }
    }

    // Sort by time
    notes.sort((a, b) => a.time - b.time);
    return notes;
}

// Calculate travel time: how long it takes a note to go from spawn to hit line
export function getNoteLeadTime() {
    return (SPAWN_Z - HIT_LINE_Z) / NOTE_SPEED;
}

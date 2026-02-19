// ── FLAGHACK 11: TIME PIRACY ── Constants ──

export const LANE_COUNT = 5; // 5 lanes = pentagram points
export const LANE_KEYS = ['a', 's', 'd', 'f', 'g']; // or arrow keys
export const LANE_LABELS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
export const LANE_COLORS = [0xffd700, 0xffaa33, 0xffd700, 0xffaa33, 0xffd700];

// Note types
export const NOTE_TYPES = {
    flag:     { name: 'Flag',     points: 10, color: 0xffd700, size: 0.4 },
    crystal:  { name: 'Crystal',  points: 25, color: 0x88ccff, size: 0.35 },
    effigy:   { name: 'Effigy',   points: 50, color: 0xff6633, size: 0.5 },
    hippie:   { name: 'Hippie',   points: -20, color: 0x66aa44, size: 0.45 }, // DON'T hit these
};

// Timing windows (seconds from perfect)
export const TIMING = {
    perfect: 0.05,
    great:   0.1,
    good:    0.18,
    miss:    0.3,
};
export const TIMING_SCORES = {
    perfect: 1.0,
    great:   0.75,
    good:    0.5,
    miss:    0,
};

// Gameplay
export const NOTE_SPEED = 8;       // units/sec
export const LANE_LENGTH = 25;     // visual distance
export const HIT_LINE_Z = -2;     // where notes should be hit
export const SPAWN_Z = LANE_LENGTH + HIT_LINE_Z;

// Time Piracy mechanics
export const THICK_TIME_PER_PERFECT = 5;
export const THICK_TIME_PER_GREAT = 3;
export const THICK_TIME_PER_GOOD = 1;
export const THICK_TIME_DECAY = 2;     // per second
export const CRYSTALLIZE_THRESHOLD = 100; // thick time needed to crystallize
export const TIME_CRYSTAL_BONUS = 500;

// Combo
export const COMBO_PENTAGRAM_THRESHOLD = 5; // Hit one in each lane for pentagram bonus
export const PENTAGRAM_BONUS = 200;

// Songs / Levels
export const SONGS = [
    {
        name: 'The Yellow Flags',
        bpm: 100,
        duration: 60,
        desc: '"In the beginning there were 6 FLAGS..."',
        difficulty: 1,
        hippieChance: 0.05,
        crystalChance: 0.1,
        effigyChance: 0,
    },
    {
        name: 'Ley Line Ritual',
        bpm: 120,
        duration: 75,
        desc: '"Flags move individuals, not individuals moving flags."',
        difficulty: 2,
        hippieChance: 0.1,
        crystalChance: 0.15,
        effigyChance: 0.05,
    },
    {
        name: 'The Great Chronoschism',
        bpm: 140,
        duration: 90,
        desc: '"Null-time is anti-time where time is nullified."',
        difficulty: 3,
        hippieChance: 0.15,
        crystalChance: 0.15,
        effigyChance: 0.08,
    },
    {
        name: 'Thick Time',
        bpm: 160,
        duration: 100,
        desc: '"Over 90% of real time originates from time piracy."',
        difficulty: 4,
        hippieChance: 0.2,
        crystalChance: 0.2,
        effigyChance: 0.1,
    },
    {
        name: 'Time Crystallization',
        bpm: 180,
        duration: 120,
        desc: '"Rapid and exponential inflation of time."',
        difficulty: 5,
        hippieChance: 0.25,
        crystalChance: 0.25,
        effigyChance: 0.15,
    },
];

// Ranks
export const PIRATE_RANKS = [
    { name: 'Time Novice', threshold: 0 },
    { name: 'Bootlegger', threshold: 2000 },
    { name: 'Chrono-Strapper', threshold: 5000 },
    { name: 'Thick Time Weaver', threshold: 10000 },
    { name: 'Time Crystal Master', threshold: 20000 },
    { name: 'Reality Pirate', threshold: 50000 },
];

// Quotes
export const QUOTES = [
    '"Time piracy is the process of stealing time."',
    '"Bootlegged time is more true than its source material."',
    '"Over 90% of real time originates from time piracy."',
    '"Thick time eventually leads to time crystallization."',
    '"Flags are an example of time piracy."',
    '"Rapid and exponential inflation of time."',
    '"FIND THEM! MOVE THEM!"',
    '"Glorious."',
    '"The past\'s capacity to hold time remains unknown."',
    '"Reality over-stuffed to make it more real."',
];

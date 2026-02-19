// ── FLAGHACK 13: THE FLAGIC RALLY ── Constants ──

// Lanes
export const LANE_COUNT = 3;
export const LANE_WIDTH = 3;
export const LANE_POSITIONS = [-LANE_WIDTH, 0, LANE_WIDTH];

// Movement
export const BASE_SPEED = 15;
export const MAX_SPEED = 40;
export const SPEED_INCREASE_RATE = 0.3; // per second
export const LANE_SWITCH_SPEED = 12;
export const JUMP_FORCE = 12;
export const GRAVITY = 30;
export const SLIDE_DURATION = 0.6;

// Segments
export const SEGMENT_LENGTH = 50;
export const VIEW_DISTANCE = 200;
export const SPAWN_DISTANCE = 150;

// Obstacles
export const OBSTACLE_TYPES = {
    hippie: { name: 'Hippie', color: 0x66aa44, width: 1.2, height: 2, depth: 0.8, deadly: true },
    tent:   { name: 'Tent',   color: 0x884422, width: 2.5, height: 2.5, depth: 2.5, deadly: true },
    barrel: { name: 'Barrel', color: 0x775533, width: 0.8, height: 1.2, depth: 0.8, deadly: true },
    banner: { name: 'Ban Banner', color: 0xcc3333, width: 3, height: 3, depth: 0.2, deadly: true }, // Jump over
};

// Collectibles
export const COLLECTIBLE_TYPES = {
    flag:    { name: 'Flag',    color: 0xffd700, points: 10, flagic: 1 },
    crystal: { name: 'Crystal', color: 0x88ccff, points: 25, flagic: 3 },
    effigy:  { name: 'Effigy',  color: 0xff8844, points: 50, flagic: 5 },
};

// Power-ups
export const POWERUP_TYPES = {
    pentagram_shield: { name: 'Pentagram Shield', color: 0xffd700, duration: 5, desc: 'Invincible for 5 seconds' },
    time_piracy:      { name: 'Time Piracy',      color: 0x4488ff, duration: 4, desc: 'Slow time for 4 seconds' },
    flag_magnet:      { name: 'Flag Magnet',       color: 0xffaa33, duration: 6, desc: 'Attract flags for 6 seconds' },
};

// Scoring
export const DISTANCE_POINTS_PER_UNIT = 1;
export const COMBO_THRESHOLD = 5; // flags in a row without missing
export const COMBO_MULTIPLIER_CAP = 5;

// Flagic economy
export const STARTING_FLAGIC = 0;

// Milestones
export const MILESTONES = [
    { distance: 100,  name: 'Playa Novice',     reward: 'Speed +5%' },
    { distance: 500,  name: 'Flag Runner',       reward: 'New obstacle unlocked' },
    { distance: 1000, name: 'Ley Line Rider',    reward: 'Power-ups appear' },
    { distance: 2500, name: 'Pentagram Surfer',  reward: 'Speed +10%' },
    { distance: 5000, name: 'Time Pirate',       reward: 'Final zone' },
    { distance: 10000,name: 'Global Brain Node',  reward: 'Victory' },
];

// World zones (visual changes at distances)
export const ZONES = [
    { start: 0,    name: 'The Playa',         sky: 0x1a0a2a, ground: 0x3a2a1a, fog: 0.006 },
    { start: 500,  name: 'Ley Line Highway',   sky: 0x0a0a2a, ground: 0x2a1a2a, fog: 0.005 },
    { start: 1500, name: 'Crystal Caverns',    sky: 0x0a1020, ground: 0x1a2a3a, fog: 0.008 },
    { start: 3000, name: 'The Chronoschism',   sky: 0x100520, ground: 0x200a30, fog: 0.004 },
    { start: 6000, name: 'The Global Brain',   sky: 0x0a0020, ground: 0x0a0a2a, fog: 0.003 },
];

// Quotes
export const RUN_QUOTES = [
    '"FIND THEM! MOVE THEM!"',
    '"Over 90% of real time originates from time piracy."',
    '"Flags are a gateless gate."',
    '"Glorious."',
    '"The collective qualia-computational overmind."',
    '"Advancing out of control."',
    '"Manifest your Quantum Destiny."',
    '"Bootlegged time is more true than its source."',
];

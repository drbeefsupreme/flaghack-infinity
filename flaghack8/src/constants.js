// FLAGHACK 8: THE GREAT SURVEY - RTS/Puzzle: Geomantic Survey Committee
// "FLAGS! FIND THEM! - MOVE THEM!"

// World
export const WORLD_SIZE = 200;
export const TILE_SIZE = 4;
export const GRID_CELLS = Math.floor(WORLD_SIZE / TILE_SIZE);

// Camera
export const CAMERA_HEIGHT = 60;
export const CAMERA_MIN_HEIGHT = 25;
export const CAMERA_MAX_HEIGHT = 100;
export const CAMERA_PAN_SPEED = 40;
export const CAMERA_ZOOM_SPEED = 5;

// Player (Lead Vexillomancer)
export const PLAYER_SPEED = 12;
export const PLAYER_PICKUP_RANGE = 3;
export const PLAYER_PLACE_RANGE = 4;

// Flags
export const FLAG_COLOR = 0xffd700;
export const FLAG_ALIGNED_COLOR = 0xffee44;
export const FLAG_MISALIGNED_COLOR = 0xcc9900;
export const FOOP_TYPES = [
    { name: 'Fallen', desc: 'Laying on the ground', angle: Math.PI / 2, fix: 'pickup_and_place' },
    { name: 'Leaning', desc: 'Leaning against a structure', angle: 0.4, fix: 'straighten' },
    { name: 'Reversed', desc: 'Cloth facing wrong direction', angle: 0, fix: 'rotate' },
    { name: 'Misaligned', desc: 'Not aligned with Ley facet', angle: 0.15, fix: 'realign' },
    { name: 'Buried', desc: 'Half-buried in playa dust', angle: 0, fix: 'dig_and_place' },
];

// Ley Facets (5th dimensional alignment targets)
export const LEY_FACET_COUNT = 5; // pentagram points
export const LEY_FACET_COLORS = [0xffd700, 0xff8844, 0xff44ff, 0x44ffff, 0x88ff44];
export const LEY_MAX_DISTANCE = 25;
export const ALIGNMENT_THRESHOLD = 0.85; // 0-1, how close to perfect alignment needed

// Pentagrams
export const PENTAGRAM_MIN_FLAGS = 5;
export const PENTAGRAM_ACTIVATION_RANGE = 30;

// Vexillomancers (recruitable workers)
export const VEXILLOMANCER_TYPES = [
    { name: 'Seeker', color: 0x44aa44, speed: 8, skill: 'find', desc: 'Finds FOOPs in the field' },
    { name: 'Mover', color: 0xaa8844, speed: 10, skill: 'move', desc: 'Carries and places flags' },
    { name: 'Aligner', color: 0x8844aa, speed: 6, skill: 'align', desc: 'Aligns flags to Ley facets' },
    { name: 'Surveyor', color: 0x4488aa, speed: 7, skill: 'survey', desc: 'Reveals Ley facet lines' },
];

// Recruitment
export const RECRUIT_COST = 3; // aligned flags to recruit one
export const MAX_VEXILLOMANCERS = 20;

// Scoring & Progression
export const SCORE_FOOP_FIXED = 10;
export const SCORE_FLAG_ALIGNED = 25;
export const SCORE_PENTAGRAM = 200;
export const SCORE_RECRUIT = 50;

// Quantum Destiny meter
export const QD_PER_ALIGNMENT = 5;
export const QD_PER_PENTAGRAM = 30;
export const QD_PER_RECRUIT = 10;
export const QD_MAX = 1000;
export const QD_LEVELS = [
    { threshold: 0, name: 'Flagless', color: '#555555' },
    { threshold: 100, name: 'Seeker', color: '#44aa44' },
    { threshold: 250, name: 'Finder', color: '#aaaa44' },
    { threshold: 450, name: 'Mover', color: '#ff8844' },
    { threshold: 700, name: 'Surveyor', color: '#ff44ff' },
    { threshold: 1000, name: 'Lead Vexillomancer', color: '#ffd700' },
];

// Waves (new FOOPs appear periodically)
export const WAVE_INTERVAL = 30; // seconds between waves
export const WAVE_BASE_FOOPS = 5;
export const WAVE_GROWTH = 3; // additional FOOPs per wave

// Day/Night
export const DAY_DURATION = 120; // seconds per full cycle
export const NIGHT_FOOP_MULTIPLIER = 1.5; // more FOOPs appear at night

// Terrain features
export const CAMP_COUNT = 8;
export const STRUCTURE_TYPES = [
    { name: 'Tent', color: 0x886644, width: 3, height: 2.5, depth: 3 },
    { name: 'Art Car', color: 0x884488, width: 5, height: 3, depth: 2 },
    { name: 'Stage', color: 0x444488, width: 8, height: 4, depth: 6 },
    { name: 'Portal', color: 0x448844, width: 2, height: 6, depth: 2 },
];

// Propaganda
export const PROPAGANDA_SLOGANS = [
    '"FIND THEM! MOVE THEM!"',
    '"Manifest your Quantum Destiny with FLAGS!"',
    '"I did MY part, & found a Flag!"',
    '"Each Flag is every Flag."',
    '"FLAGS OF FLAGS ARE Art."',
    '"IF FOUND PLEASE LOSE"',
    '"Glorious."',
];

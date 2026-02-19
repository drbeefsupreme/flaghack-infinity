// FLAGHACK 5: CHAKRA VEXILLOMANTIA - Constants

// Player
export const PLAYER_SPEED = 18;
export const PLAYER_DASH_SPEED = 50;
export const PLAYER_DASH_DURATION = 0.2;
export const PLAYER_DASH_COOLDOWN = 1.5;
export const PLAYER_MAX_HP = 100;
export const PLAYER_START_FLAGS = 5;
export const PLAYER_ATTACK_RANGE = 3;
export const PLAYER_ATTACK_DAMAGE = 15;
export const PLAYER_ATTACK_COOLDOWN = 0.4;

// Flag (weapon)
export const FLAG_COLOR = 0xffd700;
export const FLAG_POLE_COLOR = 0x8b7355;
export const FLAG_SWING_SPEED = 12;

// Chakras (upgrades for the flag weapon)
// Each chakra corresponds to a position on the flag from Root (base) to Crown (tip)
export const CHAKRAS = [
    { name: 'Root', color: 0xdaa520, desc: 'Goldenrod grounding. +20% attack damage.', stat: 'damage', bonus: 0.2 },
    { name: 'Sacral', color: 0xf0c040, desc: 'Bright flow. +15% attack speed.', stat: 'speed', bonus: 0.15 },
    { name: 'Solar Plexus', color: 0xe8b830, desc: 'Saffron fire. Attacks burn enemies.', stat: 'burn', bonus: 3 },
    { name: 'Heart', color: 0xffc830, desc: 'Deep gold compassion. HP regeneration.', stat: 'regen', bonus: 2 },
    { name: 'Throat', color: 0xffe040, desc: 'Canary clarity. Flag Bolt projectile.', stat: 'projectile', bonus: 20 },
    { name: 'Third Eye', color: 0xfff060, desc: 'Lemon sight. Reveal hidden rooms.', stat: 'vision', bonus: 1 },
    { name: 'Crown', color: 0xffd700, desc: 'Pure gold transcendence. Flagic doubles.', stat: 'flagic', bonus: 2 },
];

// Dungeon Generation
export const ROOM_SIZE = 30;
export const ROOM_HEIGHT = 8;
export const CORRIDOR_WIDTH = 4;
export const CORRIDOR_LENGTH = 12;
export const MIN_ROOMS_PER_FLOOR = 6;
export const MAX_ROOMS_PER_FLOOR = 10;
export const TOTAL_FLOORS = 7; // One per chakra

// Floor themes
export const FLOOR_THEMES = [
    { name: 'Playa Depths', wallColor: 0x554433, floorColor: 0x443322, ambientColor: 0x332211, desc: 'The crust of the earth opens to swallow you.' },
    { name: 'Crystal Caverns', wallColor: 0x334455, floorColor: 0x223344, ambientColor: 0x112233, desc: 'Crystals hum with implied Flag energy.' },
    { name: 'Burning Tunnels', wallColor: 0x553322, floorColor: 0x442211, ambientColor: 0x331100, desc: 'The Effigy\'s fire echoes through stone.' },
    { name: 'The Stench Warrens', wallColor: 0x445533, floorColor: 0x334422, ambientColor: 0x223311, desc: 'Hippie miasma coats every surface.' },
    { name: 'Ley Line Nexus', wallColor: 0x443355, floorColor: 0x332244, ambientColor: 0x221133, desc: 'Ley lines pulse through the walls.' },
    { name: 'The Chronoschism', wallColor: 0x222244, floorColor: 0x111133, ambientColor: 0x000022, desc: 'Time fractures. Null-time seeps through cracks.' },
    { name: 'Heart of Flagistan', wallColor: 0x443300, floorColor: 0x332200, ambientColor: 0x221100, desc: 'The Omega Configuration awaits.' },
];

// Enemies
export const ENEMY_TYPES = [
    { name: 'Hippie', hp: 30, speed: 6, damage: 8, range: 2, color: 0x664422, xp: 10 },
    { name: 'Stink Shaman', hp: 20, speed: 4, damage: 12, range: 8, color: 0x448844, xp: 20, ranged: true },
    { name: 'Drum Brute', hp: 60, speed: 4, damage: 15, range: 2.5, color: 0x885522, xp: 25, size: 1.3 },
    { name: 'Psychosis Wraith', hp: 15, speed: 10, damage: 10, range: 2, color: 0x8844aa, xp: 30, fast: true },
    { name: 'Flag Thief', hp: 25, speed: 8, damage: 5, range: 2, color: 0xaa4444, xp: 15, steals: true },
];

// Pickups
export const PICKUP_TYPES = {
    FLAG: { color: 0xffd700, glow: 0xaa8800 },
    CRYSTAL: { color: 0x88ccff, glow: 0x4488cc },
    HEALTH: { color: 0x44ff44, glow: 0x228822 },
    FLAGIC: { color: 0xcc88ff, glow: 0x8844cc },
};

// Flagic
export const MAX_FLAGIC = 100;
export const PENTAGRAM_FLAGIC_GAIN = 30;

// Camera
export const CAMERA_HEIGHT = 22;
export const CAMERA_DISTANCE = 18;
export const CAMERA_LERP = 0.1;

// Ley Lines (in dungeon)
export const LEY_MAX_DISTANCE = 20;

// Scoring
export const XP_PER_LEVEL = 100; // scales with level

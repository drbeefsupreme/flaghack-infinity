// FLAGHACK 6: THE BAN - Constants

// World
export const WORLD_SIZE = 250;
export const TILE_SIZE = 1;

// Player
export const PLAYER_SPEED = 20;
export const PLAYER_DASH_SPEED = 45;
export const PLAYER_DASH_DURATION = 0.2;
export const PLAYER_DASH_COOLDOWN = 1.5;
export const PLAYER_GATHER_RANGE = 3;
export const PLAYER_GATHER_TIME = 1.0;
export const PLAYER_START_FLAGS = 3;

// Resources
export const RESOURCE_TYPES = {
    WOOD: { name: 'Wood', color: 0x8b6914, icon: '⚙' },
    CLOTH: { name: 'Cloth', color: 0xdaa520, icon: '◆' },
    CRYSTAL: { name: 'Crystal', color: 0x88ccff, icon: '★' },
};

// Buildings
export const BUILDINGS = {
    flag: { name: 'Flag', cost: { wood: 1, cloth: 1 }, radius: 1, hp: 20, flagPower: 1 },
    tent: { name: 'Tent', cost: { wood: 3, cloth: 2 }, radius: 2, hp: 50, signifierCapacity: 1 },
    workshop: { name: 'Workshop', cost: { wood: 5, cloth: 3, crystal: 1 }, radius: 2.5, hp: 80, craftBonus: 1 },
    beacon: { name: 'Beacon', cost: { wood: 2, crystal: 1 }, radius: 1.5, hp: 30, recruitRange: 40 },
    wall: { name: 'Wall', cost: { wood: 2 }, radius: 0.5, hp: 100, blocks: true },
    decoy: { name: 'Decoy Flag', cost: { cloth: 1 }, radius: 1, hp: 10, isDecoy: true },
};

// Flags
export const FLAG_COLOR = 0xffd700;
export const FLAG_POLE_COLOR = 0x8b7355;
export const LEY_MAX_DISTANCE = 25;

// Heat system (how much the Ban knows about you)
export const HEAT_PER_FLAG = 2;
export const HEAT_PER_BUILDING = 1;
export const HEAT_DECAY_RATE = 0.5; // per game-minute
export const HEAT_RAID_THRESHOLD = 60;
export const HEAT_MAX = 100;

// Ban Patrol
export const PATROL_BASE_SIZE = 3;
export const PATROL_SIZE_PER_HEAT = 0.05;
export const PATROL_SPEED = 10;
export const PATROL_DAMAGE = 15;
export const PATROL_ATTACK_RANGE = 2.5;
export const PATROL_DESTROY_RANGE = 3;
export const PATROL_SEARCH_DURATION = 30; // seconds they search before leaving

// Signifiers
export const SIGNIFIER_SPEED = 8;
export const SIGNIFIER_GATHER_RATE = 0.5;
export const SIGNIFIER_MAX = 10;
export const SIGNIFIER_SPAWN_INTERVAL = 60; // seconds between wandering NPCs
export const SIGNIFIER_RECRUIT_RANGE = 5;

// Day/Night
export const DAY_DURATION = 90; // seconds per day
export const NIGHT_DANGER_MULT = 1.5;

// Camera
export const CAMERA_HEIGHT = 30;
export const CAMERA_DISTANCE = 20;
export const CAMERA_LERP = 0.1;

// Flagic
export const MAX_FLAGIC = 100;
export const PENTAGRAM_FLAGIC_RATE = 8;

// Victory
export const VICTORY_FLAGS = 50; // Place 50 flags to win
export const VICTORY_SIGNIFIERS = 7;

// Reputation levels
export const REP_LEVELS = [
    { threshold: 0, name: 'Flagless', color: '#666' },
    { threshold: 10, name: 'Initiate', color: '#aaa' },
    { threshold: 25, name: 'Signifier', color: '#ffd700' },
    { threshold: 50, name: 'Vexillomancer', color: '#ffaa00' },
    { threshold: 100, name: 'Grand Vexillomancer', color: '#ff6600' },
    { threshold: 200, name: 'Pratyekavexillian', color: '#ff4444' },
];

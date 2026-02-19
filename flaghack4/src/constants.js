// FLAGHACK 4: GEOMANTICA - Constants

// World
export const WORLD_SIZE = 300;
export const PLAYA_COLOR_LIGHT = 0xd4c4a0;
export const PLAYA_COLOR_DARK = 0xc0ad85;

// Player
export const PLAYER_SPEED = 25;
export const PLAYER_MAX_HP = 100;
export const PLAYER_START_FLAGS = 10;
export const PLAYER_INTERACT_RADIUS = 5;

// Flags
export const FLAG_PLACE_OFFSET = 3;
export const FLAG_PICKUP_RADIUS = 5;
export const FLAG_POLE_HEIGHT = 2.5;
export const FLAG_CLOTH_SIZE = 0.8;
export const FLAG_COLOR = 0xffd700;
export const FLAG_POLE_COLOR = 0x8b7355;

// Ley Lines
export const LEY_MAX_DISTANCE = 35;
export const LEY_LINE_COLOR_A = 0xaa44ff;
export const LEY_LINE_COLOR_B = 0xff44aa;
export const PENTAGRAM_LINE_COLOR_A = 0xff6600;
export const PENTAGRAM_LINE_COLOR_B = 0xff2200;

// Pentagrams
export const PENTAGRAM_RADIUS_TOLERANCE = 0.5;
export const PENTAGRAM_ANGLE_TOLERANCE = 0.6;
export const PENTAGRAM_CENTER_RADIUS = 8;
export const FLAGIC_GAIN_RATE = 5;
export const MAX_FLAGIC = 100;

// Geomantica configurations (which pentagram points are "active")
// Points: 0=top(epsilon), 1=top-right(gamma), 2=bottom-right(zeta), 3=bottom(beta-low), 4=bottom-left(beta), 5=top-left(epsilon-left)
// Each config is a bitmask of which of the 5 flags in the pentagram have special "charge"
export const GEOMANTICA = [
    { name: 'Qian', title: 'The Creative', desc: 'Strong, active, initiating. Flags burn with divine creative force.', effect: 'damage_aura', power: 3, mask: 0b11111 },
    { name: 'Guai', title: 'Breakthrough', desc: 'Resolution and decisive action. Flags repel enemies with force.', effect: 'knockback', power: 4, mask: 0b11110 },
    { name: 'Da You', title: 'Great Possession', desc: 'Abundance and wealth. Generates bonus flags over time.', effect: 'flag_gen', power: 2, mask: 0b10111 },
    { name: 'Da Zhuang', title: 'Great Power', desc: 'Strength and authority. Massively amplifies ley line damage.', effect: 'ley_boost', power: 5, mask: 0b11011 },
    { name: 'Xu', title: 'Waiting', desc: 'Patient nourishment. Slowly heals the Effigy.', effect: 'heal_effigy', power: 2, mask: 0b01111 },
    { name: 'Lu', title: 'Treading', desc: 'Careful progress. Slows all enemies in range.', effect: 'slow', power: 3, mask: 0b11101 },
    { name: 'Tai', title: 'Peace', desc: 'Harmony between heaven and earth. Doubles Flagic generation.', effect: 'flagic_boost', power: 2, mask: 0b10101 },
    { name: 'Tong Ren', title: 'Fellowship', desc: 'Unity of purpose. Nearby pentagrams share power.', effect: 'chain', power: 3, mask: 0b01010 },
];

// Effigy
export const EFFIGY_HP = 500;
export const EFFIGY_POSITION = { x: 0, z: 0 };
export const EFFIGY_RADIUS = 6;

// Waves
export const WAVE_PREP_TIME = 20; // seconds between waves
export const WAVE_BASE_ENEMIES = 5;
export const WAVE_ENEMY_SCALE = 1.4; // multiplier per wave
export const WAVE_SPEED_SCALE = 1.05;
export const MAX_ENEMIES_ALIVE = 60;

// Hippies
export const HIPPIE_BASE_SPEED = 8;
export const HIPPIE_HP = 20;
export const HIPPIE_DAMAGE = 5;
export const HIPPIE_ATTACK_RANGE = 2.5;
export const HIPPIE_ATTACK_COOLDOWN = 1.5;
export const HIPPIE_EFFIGY_DAMAGE = 10;
export const HIPPIE_STEAL_CHANCE = 0.15;
export const HIPPIE_STINK_RADIUS = 4;

// Spells
export const SPELLS = [
    { name: 'Flag Bolt', cost: 10, cooldown: 0.5, damage: 20, range: 40, type: 'projectile' },
    { name: 'Ley Blast', cost: 25, cooldown: 2.0, damage: 35, range: 15, type: 'aoe' },
    { name: 'Pentagram Shield', cost: 20, cooldown: 8.0, duration: 5, type: 'shield' },
    { name: 'Vexillo Storm', cost: 40, cooldown: 10.0, damage: 50, range: 12, duration: 3, type: 'storm' },
];

// Camera
export const CAMERA_DISTANCE = 35;
export const CAMERA_HEIGHT = 28;
export const CAMERA_ANGLE = -0.7;
export const CAMERA_LERP = 0.08;

// Camps (ring of camps around effigy)
export const CAMP_COUNT = 5;
export const CAMP_RING_RADIUS = 80;
export const CAMP_SIZE = 20;

// Scoring
export const SCORE_HIPPIE_KILL = 10;
export const SCORE_WAVE_CLEAR = 50;
export const SCORE_PENTAGRAM_FORM = 25;
export const SCORE_FLAG_BONUS = 5;

// Spawn
export const SPAWN_RING_RADIUS = 140;
export const SPAWN_RING_VARIANCE = 20;

// Day/Night
export const DAY_CYCLE_DURATION = 180; // 3 minutes per full cycle

// FLAGHACK 7: TRIUMPH OF FLAGS - Boss Rush Bullet Hell

// Arena
export const ARENA_RADIUS = 40;
export const ARENA_FLOOR_COLOR = 0x1a1a2a;

// Player (Flag Angel)
export const PLAYER_SPEED = 22;
export const PLAYER_MAX_HP = 100;
export const PLAYER_SHOOT_COOLDOWN = 0.12;
export const PLAYER_BULLET_SPEED = 45;
export const PLAYER_BULLET_DAMAGE = 8;
export const PLAYER_DODGE_SPEED = 55;
export const PLAYER_DODGE_DURATION = 0.15;
export const PLAYER_DODGE_COOLDOWN = 0.8;
export const PLAYER_FLAGIC_MAX = 100;
export const PLAYER_FLAGIC_REGEN = 5;

// Special attacks (cost Flagic)
export const SPECIAL_FLAG_STORM = { cost: 30, damage: 5, duration: 3, radius: 12 };
export const SPECIAL_PENTAGRAM_BLAST = { cost: 50, damage: 40, radius: 15 };
export const SPECIAL_LEY_BEAM = { cost: 20, damage: 25, width: 2, range: 50 };

// Bosses
export const BOSSES = [
    {
        name: 'THE STENCH',
        subtitle: 'Hippie King of Filth',
        color: 0x448844,
        hp: 800,
        phases: 3,
        speed: 5,
        desc: 'The concentrated essence of every unwashed hippie who ever stole a flag.',
    },
    {
        name: 'THE CENSOR',
        subtitle: 'Enforcer of the Ban',
        color: 0xcc2222,
        hp: 1200,
        phases: 3,
        speed: 7,
        desc: 'President Jaguar\'s supreme weapon against unsanctioned memes.',
    },
    {
        name: 'THE ENTROPY',
        subtitle: 'Heat Death of Meaning',
        color: 0x555588,
        hp: 1500,
        phases: 4,
        speed: 4,
        desc: 'The force that erodes all symbols until nothing signifies anything.',
    },
    {
        name: 'NULL-TIME',
        subtitle: 'The Great Chronoschism',
        color: 0x2222aa,
        hp: 2000,
        phases: 4,
        speed: 8,
        desc: 'Anti-time itself. The singular catastrophe the Time Crystal could not prevent.',
    },
    {
        name: 'THE ANTI-FLAG',
        subtitle: 'Negation of the Signifier',
        color: 0x880088,
        hp: 3000,
        phases: 5,
        speed: 6,
        desc: 'The conceptual inverse of Flag. If each Flag is every Flag, this is no Flag.',
    },
];

// Bullet types
export const BULLET_COLORS = {
    player: 0xffd700,
    enemy_normal: 0xff4444,
    enemy_aimed: 0xff8844,
    enemy_spiral: 0xff44ff,
    enemy_ring: 0x44ffff,
    enemy_chaos: 0xaa44ff,
};

// Camera
export const CAMERA_HEIGHT = 35;
export const CAMERA_ANGLE = -Math.PI / 2.5;

// Scoring
export const SCORE_BULLET_HIT = 1;
export const SCORE_BOSS_PHASE = 500;
export const SCORE_BOSS_KILL = 2000;
export const SCORE_NO_HIT_BONUS = 1000;

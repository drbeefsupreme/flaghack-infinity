// ── FLAGHACK 14: THE FLAG COMMANDMENTS ── Constants ──

export const GRID_W = 8;
export const GRID_H = 8;
export const CELL_SIZE = 2;

// Unit types
export const UNIT_TYPES = {
    vexillomancer: {
        name: 'Vexillomancer', hp: 12, atk: 3, def: 1, move: 3, range: 1,
        color: 0xffd700, ability: 'place_flag',
        abilityDesc: 'Place a Flag on an adjacent tile (buffs allies, pentagram formations)',
    },
    signifier: {
        name: 'Signifier', hp: 8, atk: 2, def: 0, move: 4, range: 3,
        color: 0xffaa33, ability: 'ley_blast',
        abilityDesc: 'Ranged ley line attack (3 damage, range 3)',
    },
    guardian: {
        name: 'Guardian', hp: 18, atk: 2, def: 3, move: 2, range: 1,
        color: 0x8888cc, ability: 'shield',
        abilityDesc: 'Shield adjacent allies (+3 DEF for 1 turn)',
    },
    schismmancer: {
        name: 'Schismmancer', hp: 10, atk: 4, def: 1, move: 3, range: 2,
        color: 0x9944cc, ability: 'antimeme',
        abilityDesc: 'Deploy antimeme: reduce target ATK by 2 for 2 turns',
    },
    hippie: {
        name: 'Hippie', hp: 6, atk: 2, def: 0, move: 4, range: 1,
        color: 0x66aa44, ability: 'steal_flag',
        abilityDesc: 'Steal a nearby flag (removes it)',
    },
    enforcer: {
        name: 'Ban Enforcer', hp: 14, atk: 3, def: 2, move: 2, range: 1,
        color: 0xcc3333, ability: 'ban_strike',
        abilityDesc: 'Double damage vs. flagged tiles',
    },
};

// Missions
export const MISSIONS = [
    {
        name: 'The Playa Skirmish',
        desc: '"Two laws were established: no entering tents for flags, and mediation for disputes." — Congress of the Flags',
        playerUnits: [
            { type: 'vexillomancer', x: 0, y: 6 },
            { type: 'vexillomancer', x: 1, y: 7 },
            { type: 'signifier', x: 2, y: 6 },
        ],
        enemyUnits: [
            { type: 'hippie', x: 6, y: 0 },
            { type: 'hippie', x: 7, y: 1 },
            { type: 'hippie', x: 5, y: 0 },
        ],
        objective: 'Defeat all enemies',
    },
    {
        name: 'The Ban Patrol',
        desc: '"The Noospheric Munitions Act of 2042 banned all memes but exempted Flags." — President Jaguar',
        playerUnits: [
            { type: 'vexillomancer', x: 0, y: 7 },
            { type: 'signifier', x: 1, y: 6 },
            { type: 'guardian', x: 0, y: 6 },
            { type: 'signifier', x: 2, y: 7 },
        ],
        enemyUnits: [
            { type: 'enforcer', x: 7, y: 0 },
            { type: 'enforcer', x: 6, y: 1 },
            { type: 'hippie', x: 5, y: 0 },
            { type: 'hippie', x: 7, y: 2 },
        ],
        objective: 'Defeat all enemies',
    },
    {
        name: 'The Schism',
        desc: '"Schismmancers weaponize chaos and contradiction." — Alch3my Wiki',
        playerUnits: [
            { type: 'vexillomancer', x: 0, y: 7 },
            { type: 'vexillomancer', x: 1, y: 7 },
            { type: 'signifier', x: 2, y: 6 },
            { type: 'guardian', x: 0, y: 6 },
        ],
        enemyUnits: [
            { type: 'schismmancer', x: 7, y: 0 },
            { type: 'schismmancer', x: 6, y: 0 },
            { type: 'enforcer', x: 7, y: 1 },
            { type: 'hippie', x: 5, y: 1 },
            { type: 'hippie', x: 6, y: 2 },
        ],
        objective: 'Defeat all enemies',
    },
    {
        name: 'The Omega Formation',
        desc: '"The arrangement all Flags move toward." — The Omega Configuration',
        playerUnits: [
            { type: 'vexillomancer', x: 0, y: 7 },
            { type: 'vexillomancer', x: 1, y: 7 },
            { type: 'signifier', x: 2, y: 7 },
            { type: 'signifier', x: 3, y: 6 },
            { type: 'guardian', x: 0, y: 6 },
        ],
        enemyUnits: [
            { type: 'schismmancer', x: 7, y: 0 },
            { type: 'schismmancer', x: 6, y: 0 },
            { type: 'enforcer', x: 7, y: 1 },
            { type: 'enforcer', x: 5, y: 0 },
            { type: 'hippie', x: 7, y: 2 },
            { type: 'hippie', x: 4, y: 0 },
        ],
        objective: 'Defeat all enemies',
    },
];

// Flag effects
export const FLAG_BUFF_ATK = 1;
export const FLAG_BUFF_DEF = 1;
export const PENTAGRAM_DAMAGE = 5; // AOE when 5 flags form pentagram pattern

// Quotes
export const TACTIC_QUOTES = [
    '"No entering tents for flags."',
    '"When two dispute a flag, a third may mediate."',
    '"Glorious."',
    '"FIND THEM! MOVE THEM!"',
    '"Schismmancers weaponize chaos."',
    '"Nuclear grade memetic weaponry."',
    '"Advancing out of control."',
    '"The Flag Commandments guide all conflict."',
];

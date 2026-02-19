// ── FLAGHACK 9: THE VEXILLORAMANOMICON ── Constants ──

export const GRID_SIZE = 20;          // 20x20 grid
export const CELL_SIZE = 3;           // world units per cell
export const WORLD_EXTENT = GRID_SIZE * CELL_SIZE;

// Camera
export const CAMERA_HEIGHT = 45;
export const CAMERA_MIN_HEIGHT = 20;
export const CAMERA_MAX_HEIGHT = 80;
export const CAMERA_PAN_SPEED = 0.4;
export const CAMERA_ZOOM_SPEED = 3;

// Resources
export const RESOURCE_TYPES = ['cloth', 'lumber', 'dye', 'crystal'];
export const RESOURCE_COLORS = {
    cloth: 0xeeeecc,
    lumber: 0x8b6914,
    dye: 0xffd700,
    crystal: 0x88ccff,
};
export const RESOURCE_SPAWN_INTERVAL = 3;   // seconds between spawns at source
export const RESOURCE_SPEED = 2.5;          // units/sec on conveyor

// Machines
export const MACHINE_TYPES = {
    source:    { name: 'Source',           cost: { flagic: 0 },   color: 0x336633, desc: 'Generates raw materials' },
    conveyor:  { name: 'Conveyor',         cost: { flagic: 5 },   color: 0x555555, desc: 'Moves items along a path' },
    crafter:   { name: 'Flag Crafter',     cost: { flagic: 20 },  color: 0xcc8833, desc: 'Combines cloth+lumber+dye into Flags' },
    enchanter: { name: 'Enchantment Altar',cost: { flagic: 50 },  color: 0x6633aa, desc: 'Enchants Flags with crystal power' },
    assembler: { name: 'Pentagram Forge',  cost: { flagic: 100 }, color: 0xffd700, desc: 'Assembles 5 Flags into a Pentagram' },
    seller:    { name: 'Flagic Harvester', cost: { flagic: 30 },  color: 0x22aa44, desc: 'Converts finished items into Flagic' },
};

// Items produced
export const ITEM_TYPES = {
    cloth:          { color: 0xeeeecc, size: 0.3 },
    lumber:         { color: 0x8b6914, size: 0.3 },
    dye:            { color: 0xffd700, size: 0.3 },
    crystal:        { color: 0x88ccff, size: 0.3 },
    flag:           { color: 0xffd700, size: 0.5 },
    enchanted_flag: { color: 0xffee44, size: 0.55 },
    pentagram:      { color: 0xffd700, size: 0.7 },
};

// Flagic economy
export const FLAGIC_PER_FLAG = 3;
export const FLAGIC_PER_ENCHANTED = 8;
export const FLAGIC_PER_PENTAGRAM = 25;
export const STARTING_FLAGIC = 50;

// Recipes (input items -> output item)
export const RECIPES = {
    crafter:   { inputs: ['cloth', 'lumber', 'dye'], output: 'flag' },
    enchanter: { inputs: ['flag', 'crystal'], output: 'enchanted_flag' },
    assembler: { inputs: ['flag', 'flag', 'flag', 'flag', 'flag'], output: 'pentagram' },
};

// Vexilloramanomicon pages (tech tree / progression)
export const GRIMOIRE_PAGES = [
    { id: 0, name: 'I. The Cloth',       desc: '"In the beginning there were FLAGS..."',                  unlock: 'source_cloth',   cost: 0 },
    { id: 1, name: 'II. The Lumber',      desc: '"Untreated furring lumber, rough and true."',             unlock: 'source_lumber',  cost: 0 },
    { id: 2, name: 'III. The Golden Dye', desc: '"Deep golden yellow, the only color."',                   unlock: 'source_dye',     cost: 0 },
    { id: 3, name: 'IV. The Conveyor',    desc: '"Flags move individuals, not individuals moving Flags."', unlock: 'conveyor',       cost: 0 },
    { id: 4, name: 'V. The Crafter',      desc: '"Diamond-shaped cloth on lumber, tacked with devotion."', unlock: 'crafter',        cost: 10 },
    { id: 5, name: 'VI. The Harvest',     desc: '"True and Eternal is the Flag within."',                  unlock: 'seller',         cost: 20 },
    { id: 6, name: 'VII. The Crystal',    desc: '"Crystals of implied Flag, infinite-order."',             unlock: 'source_crystal', cost: 40 },
    { id: 7, name: 'VIII. Enchantment',   desc: '"Every Flag is an idol reborn in living experience."',    unlock: 'enchanter',      cost: 80 },
    { id: 8, name: 'IX. The Pentagram',   desc: '"Five Flags, one truth. The end of Flags and the beginning of 10,000 Flags."', unlock: 'assembler', cost: 150 },
    { id: 9, name: 'X. Omega Config',     desc: '"The Omega Configuration - the arrangement all Flags move toward."', unlock: 'omega', cost: 500 },
];

// Conveyor directions
export const DIRECTIONS = {
    north: { dx: 0, dz: -1, angle: 0 },
    east:  { dx: 1, dz: 0,  angle: Math.PI / 2 },
    south: { dx: 0, dz: 1,  angle: Math.PI },
    west:  { dx: -1, dz: 0, angle: -Math.PI / 2 },
};
export const DIR_ORDER = ['north', 'east', 'south', 'west'];

// Grimoire quotes for ambient display
export const GRIMOIRE_QUOTES = [
    '"Flags are the end of Flags and the beginning of 10,000 Flags."',
    '"Flags are a gateless gate, the invitation to all Madness."',
    '"True and Eternal is the Flag within."',
    '"Flags not Flags but Flags. Each Flags all Flags."',
    '"The idea is a living form."',
    '"Manifest your Quantum Destiny with FLAGS."',
    '"FIND THEM! MOVE THEM!"',
    '"IF FOUND PLEASE LOSE / IF LOST RETURN TO TEMPLE."',
    '"A voluntary virus, spreading values through devotion."',
    '"Glorious."',
];

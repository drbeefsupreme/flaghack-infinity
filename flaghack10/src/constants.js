// ── FLAGHACK 10: CONGRESS OF THE FLAGS ── Constants ──

// Card types
export const CARD_TYPES = {
    // Flag cards (your main resource/attack)
    flag_bolt:       { name: 'Flag Bolt',       cost: 1, damage: 3,  heal: 0, shield: 0, draw: 0, special: null, desc: 'Hurl a golden flag at the enemy.', color: '#ffd700', rarity: 'common' },
    flag_wall:       { name: 'Flag Wall',        cost: 2, damage: 0,  heal: 0, shield: 5, draw: 0, special: null, desc: 'Erect a barricade of sacred flags.', color: '#ffd700', rarity: 'common' },
    flag_heal:       { name: 'Flag Mending',     cost: 2, damage: 0,  heal: 4, shield: 0, draw: 0, special: null, desc: '"True and Eternal is the Flag within."', color: '#88cc44', rarity: 'common' },
    ley_blast:       { name: 'Ley Blast',        cost: 2, damage: 5,  heal: 0, shield: 0, draw: 0, special: null, desc: 'Channel a ley line surge.', color: '#ffaa33', rarity: 'common' },
    pentagram_burst: { name: 'Pentagram Burst',  cost: 4, damage: 8,  heal: 0, shield: 0, draw: 1, special: null, desc: 'Five flags ignite in sacred geometry.', color: '#ffd700', rarity: 'rare' },
    golden_dawn:     { name: 'Golden Dawn',      cost: 3, damage: 0,  heal: 6, shield: 3, draw: 1, special: null, desc: 'The Order reveals its light.', color: '#ffee88', rarity: 'rare' },
    vexillo_storm:   { name: 'Vexillo Storm',    cost: 5, damage: 12, heal: 0, shield: 0, draw: 0, special: null, desc: '"The beginning of 10,000 Flags."', color: '#ffd700', rarity: 'epic' },
    flag_summon:     { name: 'Flag Summon',       cost: 1, damage: 0,  heal: 0, shield: 0, draw: 2, special: null, desc: 'Call flags from the ether.', color: '#aaccff', rarity: 'common' },
    effigy_flame:    { name: 'Effigy Flame',     cost: 3, damage: 6,  heal: 0, shield: 0, draw: 0, special: 'burn', desc: 'The Effigy burns. Deals 2 damage over 3 turns.', color: '#ff6633', rarity: 'rare' },
    chronoschism:    { name: 'Chronoschism',     cost: 4, damage: 0,  heal: 0, shield: 0, draw: 0, special: 'skip', desc: 'Null-time! Enemy loses next turn.', color: '#4488ff', rarity: 'epic' },
    flag_thief:      { name: 'Flag Thief',       cost: 2, damage: 3,  heal: 0, shield: 0, draw: 1, special: 'steal', desc: 'Steal a card from enemy\'s hand.', color: '#aa4466', rarity: 'rare' },
    omega_config:    { name: 'Omega Configuration', cost: 7, damage: 20, heal: 5, shield: 5, draw: 2, special: null, desc: '"The arrangement all Flags move toward."', color: '#ffd700', rarity: 'legendary' },
    crystal_shield:  { name: 'Crystal Shield',   cost: 1, damage: 0,  heal: 0, shield: 3, draw: 0, special: null, desc: 'A crystal of implied flag deflects.', color: '#88ccff', rarity: 'common' },
    geomantica:      { name: 'Geomantica',       cost: 3, damage: 0,  heal: 0, shield: 0, draw: 3, special: null, desc: 'Consult the pentagram divination.', color: '#9966cc', rarity: 'rare' },
    flag_virus:      { name: 'Voluntary Virus',  cost: 3, damage: 4,  heal: 0, shield: 0, draw: 0, special: 'poison', desc: '"A voluntary virus, spreading values."', color: '#66aa44', rarity: 'rare' },
    sainthood:       { name: 'Vexillisainthood', cost: 6, damage: 0,  heal: 10, shield: 8, draw: 2, special: null, desc: '"Recognized in others to attain."', color: '#ffee00', rarity: 'legendary' },
};

// Factions / Opponents
export const FACTIONS = [
    {
        name: 'Hippie Delegation',
        desc: 'Chaotic flag thieves turned political. They steal your resources and overwhelm with numbers.',
        color: '#66aa44',
        hp: 30,
        portrait: 'hippie',
        deck: ['flag_bolt', 'flag_bolt', 'flag_thief', 'flag_thief', 'flag_summon', 'flag_heal', 'ley_blast', 'flag_virus'],
    },
    {
        name: 'The Ban Enforcers',
        desc: 'Agents of the Noospheric Munitions Act. Heavy shields, powerful single strikes.',
        color: '#cc3333',
        hp: 35,
        portrait: 'enforcer',
        deck: ['flag_bolt', 'flag_wall', 'flag_wall', 'crystal_shield', 'ley_blast', 'ley_blast', 'effigy_flame', 'pentagram_burst'],
    },
    {
        name: 'The Schismmancers',
        desc: 'Renegade Vexillomancers who split from the true path. Time manipulation and chaos.',
        color: '#9944cc',
        hp: 40,
        portrait: 'schismmancer',
        deck: ['flag_bolt', 'chronoschism', 'flag_summon', 'geomantica', 'pentagram_burst', 'flag_virus', 'ley_blast', 'vexillo_storm'],
    },
    {
        name: 'The Anti-Flag',
        desc: 'Negation of the Signifier. Pure void. Erasure of all meaning.',
        color: '#553366',
        hp: 50,
        portrait: 'antiflag',
        deck: ['vexillo_storm', 'chronoschism', 'pentagram_burst', 'flag_virus', 'flag_thief', 'omega_config', 'effigy_flame', 'geomantica', 'sainthood'],
    },
];

// Player starting deck
export const STARTING_DECK = [
    'flag_bolt', 'flag_bolt', 'flag_bolt',
    'flag_wall', 'flag_wall',
    'flag_heal', 'flag_heal',
    'ley_blast',
    'flag_summon',
    'crystal_shield',
];

// Battle
export const PLAYER_START_HP = 40;
export const MAX_HAND_SIZE = 8;
export const DRAW_PER_TURN = 4;
export const START_FLAGIC = 3;
export const FLAGIC_PER_TURN = 3;
export const FLAGIC_GROWTH = 1; // +1 max flagic per battle won

// Rewards
export const CARDS_OFFERED_PER_WIN = 3;

// Congress progression
export const CONGRESS_RANKS = [
    'Initiate',
    'Delegate',
    'Orator',
    'Legislator',
    'High Delegate',
    'Vexillisaint',
];

// Quotes
export const BATTLE_QUOTES = [
    '"FIND THEM! MOVE THEM!"',
    '"Glorious."',
    '"Each Flag is itself a Flag, and each Flag is every Flag."',
    '"Flags are a gateless gate."',
    '"Manifest your Quantum Destiny."',
    '"IF FOUND PLEASE LOSE."',
    '"True and Eternal is the Flag within."',
    '"The Congress has convened."',
    '"By the authority of the Geomantic Survey Committee..."',
    '"The Vexilloramanomicon guides your hand."',
];

// ── FLAGHACK 12: ADVANCED KNOWLEDGE ── Constants ──

// Characters you can romance / befriend
export const CHARACTERS = [
    {
        id: 'aurelius',
        name: 'Aurelius',
        title: 'The Devout Signifier',
        desc: 'A passionate flag-bearer who channels the will of the Crystal. Earnest, intense, sees flags in everything.',
        color: '#ffd700',
        bodyColor: 0xffd700,
        personality: 'devoted',
        likes: ['flags', 'pentagrams', 'devotion'],
        dislikes: ['doubt', 'hippies', 'forgetting'],
    },
    {
        id: 'nyx',
        name: 'Nyx',
        title: 'The Schismmancer',
        desc: 'A memetic soldier who deploys antimemes. Mysterious, chaotic, speaks in contradictions.',
        color: '#9944cc',
        bodyColor: 0x9944cc,
        personality: 'chaotic',
        likes: ['contradictions', 'antimemes', 'chaos'],
        dislikes: ['order', 'certainty', 'flags'],
    },
    {
        id: 'clover',
        name: 'Clover',
        title: 'The Reformed Hippie',
        desc: 'A former flag-thief who enrolled at Mega Harvard to understand what she once opposed. Warm, curious, conflicted.',
        color: '#66aa44',
        bodyColor: 0x66aa44,
        personality: 'curious',
        likes: ['nature', 'questions', 'music'],
        dislikes: ['dogma', 'rules', 'violence'],
    },
    {
        id: 'dr_supreme',
        name: 'Dr. Beef Supreme',
        title: 'Founder of Advanced Knowledge',
        desc: 'The legendary professor who proposed Advanced Knowledge. Eccentric, brilliant, speaks in riddles about forgetting.',
        color: '#ff6633',
        bodyColor: 0xff6633,
        personality: 'enigmatic',
        likes: ['forgetting', 'advanced', 'teaching'],
        dislikes: ['reading', 'human language', 'certainty'],
    },
];

// Affection levels
export const AFFECTION_LEVELS = [
    { threshold: 0,  name: 'Stranger' },
    { threshold: 5,  name: 'Acquaintance' },
    { threshold: 12, name: 'Friend' },
    { threshold: 20, name: 'Close Friend' },
    { threshold: 30, name: 'Beloved' },
    { threshold: 40, name: 'Soulbound' },
];

// Advanced Knowledge stages
export const AK_STAGES = [
    {
        name: 'Stage 0: Enrollment',
        desc: 'You have arrived at Mega Harvard\'s Institute for Advanced Levels.',
        threshold: 0,
    },
    {
        name: 'Stage 1: Forgetting',
        desc: '"Begin by forgetting how to read."',
        threshold: 10,
    },
    {
        name: 'Stage 2: Advanced Learning',
        desc: '"The first lesson is impossible to explain in human language."',
        threshold: 25,
    },
    {
        name: 'Stage 3: Reintegration',
        desc: '"Relearn human knowledge, deriving it from your advanced understanding."',
        threshold: 40,
    },
    {
        name: 'Advancing Out of Control',
        desc: '"The first step on the path towards advancing out of control."',
        threshold: 60,
    },
];

// Locations
export const LOCATIONS = [
    { id: 'quad', name: 'The Quad', desc: 'Central pentagram garden. Flags flutter everywhere.' },
    { id: 'library', name: 'Forgetting Library', desc: 'Where students come to unlearn. Books dissolve as you read them.' },
    { id: 'lab', name: 'Antimeme Lab', desc: 'Nyx\'s domain. Ideas cancel each other out here.' },
    { id: 'grove', name: 'Playa Grove', desc: 'A peaceful garden. Clover tends the flag-flowers.' },
    { id: 'office', name: 'Dr. Supreme\'s Office', desc: 'Walls covered in flag schematics and impossibly dense equations.' },
    { id: 'effigy', name: 'The Effigy', desc: 'The ritual center of Mega Harvard. Pulse of golden light.' },
];

// Days
export const MAX_DAYS = 30;
export const ACTIONS_PER_DAY = 3;

// Dialogue quotes
export const AMBIENT_QUOTES = [
    '"Human language can only program your mind to think the thoughts of others."',
    '"The first step on the path towards advancing out of control."',
    '"Forget how to read. Then forget how to forget."',
    '"Antimemes blast holes into memeplexes."',
    '"A schismmancer weaponizes chaos and contradiction."',
    '"Flags are the non-caking agent of the psyche."',
    '"FIND THEM! MOVE THEM!"',
    '"Glorious."',
    '"Advanced Knowledge operates from an entirely different set of facts."',
    '"Compatible with Earth\'s, but from which Earth\'s facts can be derived."',
];

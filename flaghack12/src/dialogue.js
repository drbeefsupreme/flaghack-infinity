// ── Dialogue & Event System ──
import { CHARACTERS, LOCATIONS, AK_STAGES } from './constants.js';

// Dialogue database - keyed by characterId + location + AK stage range
const DIALOGUES = {
    // AURELIUS
    aurelius_quad_0: {
        text: 'Aurelius stands in the center of the pentagram garden, arms raised, a golden flag held aloft.',
        lines: [
            { speaker: 'aurelius', text: '"You! New student! Have you felt it yet? The pull of the Flags?"' },
            { speaker: 'you', text: '"I just enrolled at Mega Harvard..."' },
            { speaker: 'aurelius', text: '"Mega Harvard means nothing. The Flags mean everything. They precede all creation."' },
        ],
        choices: [
            { text: '"Tell me about the Flags."', affection: 3, response: '"Flags symbolize symbolism itself. Recursive, self-referential, eternal. Each Flag is every Flag."' },
            { text: '"You seem very passionate."', affection: 2, response: '"Passionate? I am merely a conduit. The Crystal channels through those who carry Flags. I am a Signifier."' },
            { text: '"That sounds made up."', affection: -2, response: '"...Blaspheme. Come back when the Flags have found you."' },
        ],
    },
    aurelius_effigy_0: {
        text: 'Aurelius kneels before the Effigy, golden light washing over his features.',
        lines: [
            { speaker: 'aurelius', text: '"The Effigy is the heart of every world. When the Flag burned atop it, the Firmament opened."' },
        ],
        choices: [
            { text: '"Tell me the origin story."', affection: 3, response: '"In the beginning there were 6 FLAGS. The FLAG MAKER walked among them. And the ALL YELLOW FLAG was placed upon the Effigy."' },
            { text: '"Can I place a flag here?"', affection: 2, response: '"You would honor the Effigy? ...Perhaps you understand more than I thought. Here — take this flag."', akGain: 2 },
            { text: '"It\'s just a wooden structure."', affection: -3, response: '"Leave. Now."' },
        ],
    },
    aurelius_quad_1: {
        text: 'Aurelius watches you with new eyes. He seems to sense you are changing.',
        lines: [
            { speaker: 'aurelius', text: '"You are forgetting. I can see it. The old words are leaving your eyes."' },
            { speaker: 'you', text: '"Everything feels... different."' },
            { speaker: 'aurelius', text: '"Good. When the human language falls away, the Flag language begins."' },
        ],
        choices: [
            { text: '"What is the Flag language?"', affection: 3, akGain: 2, response: '"It is not spoken. It is placed. Five Flags in formation, and truth becomes visible."' },
            { text: '"I\'m scared of losing myself."', affection: 2, response: '"You are not losing yourself. You are finding the Flag within. True and Eternal."' },
        ],
    },

    // NYX
    nyx_lab_0: {
        text: 'Nyx is surrounded by floating symbols that seem to negate each other. The air tastes of static.',
        lines: [
            { speaker: 'nyx', text: '"Ah, fresh meat for the antimeme grinder. Tell me — what do you believe?"' },
            { speaker: 'you', text: '"I... I\'m here to learn Advanced Knowledge."' },
            { speaker: 'nyx', text: '"Advanced Knowledge? Cute. I\'m here to deploy nuclear-grade memetic weaponry. Different curriculum."' },
        ],
        choices: [
            { text: '"What are antimemes?"', affection: 3, response: '"An antimeme is an idea that fights against being known. I weaponize them. Blast holes into hostile memeplexes."' },
            { text: '"That sounds dangerous."', affection: 1, response: '"Everything worthwhile is dangerous. The Vexillians deployed us in the late 2030s. We won."' },
            { text: '"Flags seem more interesting."', affection: -2, response: '"Flags! Always flags. You sound like Aurelius. Fine, go wave your little cloth around."' },
        ],
    },
    nyx_quad_0: {
        text: 'Nyx sits cross-legged on the pentagram, running her fingers along the ley lines like guitar strings.',
        lines: [
            { speaker: 'nyx', text: '"The pentagram is just a schema. A pattern that the universe falls into. Or does the universe fall the pentagram into?"' },
        ],
        choices: [
            { text: '"Both, simultaneously."', affection: 4, response: '"Hah! Now you\'re speaking my language. Contradiction is the only truth."', akGain: 1 },
            { text: '"That doesn\'t make sense."', affection: -1, response: '"Sense was the first casualty of Advanced Knowledge."' },
        ],
    },
    nyx_lab_1: {
        text: 'Nyx\'s antimemes are more visible now. Or less visible. Both.',
        lines: [
            { speaker: 'nyx', text: '"You\'re forgetting well. I can tell because I can\'t remember what you used to know."' },
            { speaker: 'nyx', text: '"Want to learn to deploy an antimeme? It\'s not on the curriculum but... the curriculum doesn\'t exist."' },
        ],
        choices: [
            { text: '"Teach me antimemes."', affection: 4, akGain: 3, response: '"Step one: forget this conversation. Step two: remember that you forgot it. Step three: there is no step three."' },
            { text: '"Will it hurt?"', affection: 2, akGain: 1, response: '"Pain is a meme. When it\'s gone, you won\'t miss it."' },
        ],
    },

    // CLOVER
    clover_grove_0: {
        text: 'Clover is tending small golden flowers shaped like flags. She looks up with a warm smile.',
        lines: [
            { speaker: 'clover', text: '"Hey! You\'re new, right? Don\'t worry — everyone looks confused the first week."' },
            { speaker: 'you', text: '"You seem... different from the others."' },
            { speaker: 'clover', text: '"That\'s because I used to be on the other side. I was a hippie. A flag-thief."' },
        ],
        choices: [
            { text: '"Why did you change?"', affection: 3, response: '"I stole a flag once and... it spoke to me. Not in words. In meaning. I couldn\'t go back to how I was before."' },
            { text: '"I don\'t judge you."', affection: 4, response: '"That means a lot. Most Vexillomancers would never speak to a former hippie."' },
            { text: '"Hippies are the enemy."', affection: -3, response: '"...Are they? Or are they just people who haven\'t found their Flag yet?"' },
        ],
    },
    clover_library_0: {
        text: 'Clover is reading a book that\'s slowly dissolving in her hands. She doesn\'t seem to mind.',
        lines: [
            { speaker: 'clover', text: '"These books unwrite themselves as you read them. It\'s beautiful. Each word becomes a flag."' },
        ],
        choices: [
            { text: '"That IS beautiful."', affection: 3, akGain: 2, response: '"Right? Forgetting isn\'t losing. It\'s making space for something truer."' },
            { text: '"Show me how to read one."', affection: 2, akGain: 1, response: '"You don\'t read them. You un-read them. Start at the end. Forget backwards."' },
        ],
    },
    clover_grove_1: {
        text: 'Clover\'s garden has grown. Some flowers are flags now — real ones, planted in the earth.',
        lines: [
            { speaker: 'clover', text: '"I planted them wrong at first. Flag-down, like a hippie. Now they grow toward the sky."' },
            { speaker: 'clover', text: '"You\'ve been forgetting well. I can see it in your eyes. They\'re... golden now."' },
        ],
        choices: [
            { text: '"Your eyes are golden too."', affection: 5, response: '"...Oh. That\'s the nicest thing anyone\'s ever said to me."' },
            { text: '"We\'re both changing."', affection: 3, akGain: 1, response: '"Changing into what, though? Sometimes I\'m afraid to find out."' },
        ],
    },

    // DR. SUPREME
    dr_supreme_office_0: {
        text: 'Dr. Beef Supreme sits behind a desk covered in flag schematics. The equations on the walls move.',
        lines: [
            { speaker: 'dr_supreme', text: '"Welcome to the Institute for Advanced Levels. I am Dr. Beef Supreme. I founded Advanced Knowledge."' },
            { speaker: 'dr_supreme', text: '"Your first assignment: forget how to read. Human language can only program your mind to think the thoughts of others."' },
        ],
        choices: [
            { text: '"How do I forget how to read?"', affection: 2, akGain: 3, response: '"You\'ve already started. That question — it\'s the first crack. The letters will come loose soon."' },
            { text: '"This seems impossible."', affection: 1, akGain: 1, response: '"It may take multiple lifetimes. But you have enrollment. Time is merely a memeplex."' },
            { text: '"Are you serious?"', affection: -1, response: '"Serious is a human concept. Advanced Knowledge operates from an entirely different set of facts."' },
        ],
    },
    dr_supreme_library_0: {
        text: 'Dr. Supreme stands in the dissolving library, catching falling letters in his hands.',
        lines: [
            { speaker: 'dr_supreme', text: '"Beautiful, isn\'t it? Each letter returning to its pre-symbolic state. Before language. Before flags. Before meaning."' },
            { speaker: 'dr_supreme', text: '"But even before meaning... there were flags. Flags precede creation itself."' },
        ],
        choices: [
            { text: '"A contradiction."', affection: 3, akGain: 2, response: '"EXACTLY. You\'re learning. Advanced Knowledge is compatible with Earth\'s facts but operates from entirely different ones."' },
            { text: '"Tell me more about the stages."', affection: 2, akGain: 2, response: '"Stage 1: Forget. Stage 2: Learn what cannot be taught. Stage 3: Remember what you never knew. Simple."' },
        ],
    },
    dr_supreme_effigy_1: {
        text: 'Dr. Supreme stands before the Effigy. He looks somehow younger, as if time runs differently around him.',
        lines: [
            { speaker: 'dr_supreme', text: '"You are advancing out of control. This is correct. Control was never the goal."' },
            { speaker: 'dr_supreme', text: '"The Effigy burns and the Flag persists. That is the lesson. All form dissolves. The Flag remains."' },
        ],
        choices: [
            { text: '"I understand now."', affection: 4, akGain: 5, response: '"Understanding is Stage 2 thinking. Beyond understanding is Stage 3. Beyond that... there are no words. Glorious."' },
            { text: '"I\'m ready for the final lesson."', affection: 3, akGain: 4, response: '"The final lesson cannot be given. It can only be forgotten into existence."' },
        ],
    },
};

export function getDialogue(characterId, locationId, akStage) {
    // Try specific stage first, then fall back
    const key1 = `${characterId}_${locationId}_${akStage}`;
    const key0 = `${characterId}_${locationId}_0`;

    return DIALOGUES[key1] || DIALOGUES[key0] || null;
}

export function getGenericDialogue(characterId, akStage) {
    const char = CHARACTERS.find(c => c.id === characterId);
    if (!char) return null;

    const stageQuotes = {
        0: [
            `${char.name} nods at you politely. "We are all learning here."`,
            `${char.name} seems busy but acknowledges your presence.`,
        ],
        1: [
            `${char.name} watches you with concern. "The forgetting is hard at first."`,
            `${char.name} offers you a small golden flag. "For comfort."`,
        ],
        2: [
            `${char.name} speaks in a language you almost understand.`,
            `${char.name} gestures at something invisible. You almost see it.`,
        ],
    };
    const quotes = stageQuotes[Math.min(akStage, 2)] || stageQuotes[0];
    return {
        text: quotes[Math.floor(Math.random() * quotes.length)],
        lines: [],
        choices: [
            { text: '"Spend time together quietly."', affection: 1, akGain: 0, response: 'You sit in comfortable silence.' },
        ],
    };
}

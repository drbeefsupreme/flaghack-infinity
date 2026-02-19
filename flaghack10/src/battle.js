// ── Battle Engine ──
import {
    CARD_TYPES, PLAYER_START_HP, MAX_HAND_SIZE, DRAW_PER_TURN,
    START_FLAGIC, FLAGIC_PER_TURN, FLAGIC_GROWTH,
    STARTING_DECK, FACTIONS, CARDS_OFFERED_PER_WIN,
} from './constants.js';

export function createBattleState(factionIndex, playerDeck, bonusFlagic) {
    const faction = FACTIONS[factionIndex];
    const pDeck = shuffle([...playerDeck]);
    const eDeck = shuffle([...faction.deck, ...faction.deck]); // Double enemy deck for sustainability

    const state = {
        phase: 'player_turn', // player_turn, enemy_turn, player_win, player_lose, reward
        turn: 1,
        faction,
        factionIndex,

        player: {
            hp: PLAYER_START_HP,
            maxHp: PLAYER_START_HP,
            shield: 0,
            flagic: START_FLAGIC + bonusFlagic,
            maxFlagic: START_FLAGIC + bonusFlagic,
            hand: [],
            deck: pDeck,
            discard: [],
            burn: 0,   // damage-over-time
            poison: 0,
            skipTurn: false,
        },
        enemy: {
            hp: faction.hp,
            maxHp: faction.hp,
            shield: 0,
            hand: [],
            deck: eDeck,
            discard: [],
            burn: 0,
            poison: 0,
            skipTurn: false,
            intent: null, // Preview of next action
        },

        log: [],
        animations: [], // For visual effects
    };

    // Draw initial hands
    drawCards(state, 'player', DRAW_PER_TURN);
    drawCards(state, 'enemy', 3);
    generateEnemyIntent(state);

    return state;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function drawCards(state, who, count) {
    const actor = state[who];
    for (let i = 0; i < count; i++) {
        if (actor.hand.length >= MAX_HAND_SIZE) break;
        if (actor.deck.length === 0) {
            // Reshuffle discard into deck
            if (actor.discard.length === 0) break;
            actor.deck = shuffle([...actor.discard]);
            actor.discard = [];
        }
        actor.hand.push(actor.deck.pop());
    }
}

export function playCard(state, handIndex) {
    if (state.phase !== 'player_turn') return false;
    if (state.player.skipTurn) return false;

    const cardId = state.player.hand[handIndex];
    if (!cardId) return false;

    const card = CARD_TYPES[cardId];
    if (!card) return false;
    if (state.player.flagic < card.cost) return false;

    // Spend flagic
    state.player.flagic -= card.cost;

    // Remove from hand
    state.player.hand.splice(handIndex, 1);
    state.player.discard.push(cardId);

    // Apply effects
    applyCardEffects(state, card, 'player', 'enemy');

    state.log.push(`You played ${card.name}`);

    // Animation
    state.animations.push({ type: 'player_card', card, time: 0, duration: 0.8 });

    // Check win
    if (state.enemy.hp <= 0) {
        state.phase = 'player_win';
        state.log.push('Victory!');
    }

    return true;
}

function applyCardEffects(state, card, attacker, defender) {
    const atk = state[attacker];
    const def = state[defender];

    // Damage (reduced by shield)
    if (card.damage > 0) {
        let dmg = card.damage;
        if (def.shield > 0) {
            const blocked = Math.min(def.shield, dmg);
            def.shield -= blocked;
            dmg -= blocked;
        }
        def.hp -= dmg;
        if (dmg > 0) {
            state.animations.push({ type: 'damage', target: defender, amount: dmg, time: 0, duration: 0.5 });
        }
    }

    // Heal
    if (card.heal > 0) {
        atk.hp = Math.min(atk.maxHp, atk.hp + card.heal);
        state.animations.push({ type: 'heal', target: attacker, amount: card.heal, time: 0, duration: 0.5 });
    }

    // Shield
    if (card.shield > 0) {
        atk.shield += card.shield;
    }

    // Draw
    if (card.draw > 0) {
        drawCards(state, attacker, card.draw);
    }

    // Specials
    if (card.special === 'burn') {
        def.burn += 3; // 3 turns of 2 damage
    }
    if (card.special === 'poison') {
        def.poison += 3;
    }
    if (card.special === 'skip') {
        def.skipTurn = true;
    }
    if (card.special === 'steal' && def.hand.length > 0) {
        const stolen = def.hand.splice(Math.floor(Math.random() * def.hand.length), 1)[0];
        if (atk.hand.length < MAX_HAND_SIZE) {
            atk.hand.push(stolen);
            state.log.push(`Stole ${CARD_TYPES[stolen]?.name || stolen}!`);
        }
    }
}

export function endPlayerTurn(state) {
    if (state.phase !== 'player_turn') return;

    // Apply DOT to enemy
    applyDots(state, 'enemy');

    // Check kill
    if (state.enemy.hp <= 0) {
        state.phase = 'player_win';
        return;
    }

    state.phase = 'enemy_turn';

    // Enemy turn with small delay for drama
    setTimeout(() => executeEnemyTurn(state), 600);
}

function executeEnemyTurn(state) {
    if (state.phase !== 'enemy_turn') return;

    if (state.enemy.skipTurn) {
        state.enemy.skipTurn = false;
        state.log.push(`${state.faction.name} is frozen in null-time!`);
    } else {
        // Enemy AI: play cards from hand
        let flagic = 3 + Math.floor(state.turn / 3); // Enemy flagic scales with turns
        const playable = state.enemy.hand
            .map((id, i) => ({ id, card: CARD_TYPES[id], index: i }))
            .filter(c => c.card && c.card.cost <= flagic)
            .sort((a, b) => b.card.cost - a.card.cost); // Prefer expensive cards

        let played = 0;
        for (const p of playable) {
            if (flagic < p.card.cost) continue;
            if (played >= 2) break; // Max 2 cards per turn

            flagic -= p.card.cost;
            const idx = state.enemy.hand.indexOf(p.id);
            if (idx >= 0) {
                state.enemy.hand.splice(idx, 1);
                state.enemy.discard.push(p.id);
                applyCardEffects(state, p.card, 'enemy', 'player');
                state.log.push(`${state.faction.name} played ${p.card.name}`);
                state.animations.push({ type: 'enemy_card', card: p.card, time: 0, duration: 0.8 });
                played++;
            }
        }

        if (played === 0) {
            // Basic attack if no cards playable
            const dmg = 2 + Math.floor(state.turn / 4);
            let actualDmg = dmg;
            if (state.player.shield > 0) {
                const blocked = Math.min(state.player.shield, actualDmg);
                state.player.shield -= blocked;
                actualDmg -= blocked;
            }
            state.player.hp -= actualDmg;
            state.log.push(`${state.faction.name} attacks for ${dmg}${actualDmg < dmg ? ` (${dmg - actualDmg} blocked)` : ''}`);
            state.animations.push({ type: 'damage', target: 'player', amount: actualDmg, time: 0, duration: 0.5 });
        }
    }

    // Apply DOT to player
    applyDots(state, 'player');

    // Check lose
    if (state.player.hp <= 0) {
        state.phase = 'player_lose';
        state.log.push('Defeated...');
        return;
    }

    // Next turn
    state.turn++;
    state.player.flagic = state.player.maxFlagic;
    state.player.shield = 0; // Shield resets each turn
    drawCards(state, 'player', DRAW_PER_TURN);
    drawCards(state, 'enemy', 2);
    generateEnemyIntent(state);
    state.phase = 'player_turn';

    if (state.player.skipTurn) {
        state.player.skipTurn = false;
        state.log.push('You are frozen in null-time! Skipping turn.');
        endPlayerTurn(state);
    }
}

function applyDots(state, who) {
    const actor = state[who];
    if (actor.burn > 0) {
        actor.hp -= 2;
        actor.burn--;
        state.log.push(`${who === 'player' ? 'You take' : state.faction.name + ' takes'} 2 burn damage`);
    }
    if (actor.poison > 0) {
        actor.hp -= 2;
        actor.poison--;
        state.log.push(`${who === 'player' ? 'You take' : state.faction.name + ' takes'} 2 poison damage`);
    }
}

function generateEnemyIntent(state) {
    // Preview what enemy might do (for strategic play)
    const hand = state.enemy.hand;
    if (hand.length > 0) {
        const card = CARD_TYPES[hand[0]];
        if (card) {
            if (card.damage > 0) state.enemy.intent = { type: 'attack', value: card.damage };
            else if (card.shield > 0) state.enemy.intent = { type: 'defend', value: card.shield };
            else if (card.heal > 0) state.enemy.intent = { type: 'heal', value: card.heal };
            else state.enemy.intent = { type: 'scheme', value: 0 };
        }
    } else {
        state.enemy.intent = { type: 'attack', value: 2 + Math.floor(state.turn / 4) };
    }
}

// Generate reward cards after winning
export function generateRewards(state) {
    const allCards = Object.keys(CARD_TYPES);
    const offered = [];
    const rarityPool = state.factionIndex >= 2
        ? allCards.filter(id => CARD_TYPES[id].rarity !== 'common')
        : allCards;

    while (offered.length < CARDS_OFFERED_PER_WIN) {
        const pick = rarityPool[Math.floor(Math.random() * rarityPool.length)];
        if (!offered.includes(pick)) offered.push(pick);
    }
    return offered;
}

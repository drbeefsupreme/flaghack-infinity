// ── FLAGHACK 10: CONGRESS OF THE FLAGS ── Main ──
import {
    CARD_TYPES, FACTIONS, STARTING_DECK, CONGRESS_RANKS,
    FLAGIC_GROWTH, BATTLE_QUOTES, CARDS_OFFERED_PER_WIN,
} from './constants.js';
import { createBattleState, playCard, endPlayerTurn, generateRewards } from './battle.js';
import { createBattleScene, renderScene, updateEnemyAppearance, triggerAnimation } from './scene.js';

// ── Campaign State ──
const campaign = {
    deck: [...STARTING_DECK],
    battlesWon: 0,
    bonusFlagic: 0,
    rank: 0,
    currentBattle: null,
};

let battle = null;
let rewardCards = null;
let lastRenderTime = 0;

// ── DOM References ──
const titleScreen = document.getElementById('title-screen');
const startBtn = document.getElementById('start-btn');
const gameUI = document.getElementById('game-ui');
const handEl = document.getElementById('hand');
const playerHpEl = document.getElementById('player-hp');
const playerShieldEl = document.getElementById('player-shield');
const playerFlagicEl = document.getElementById('player-flagic');
const enemyHpEl = document.getElementById('enemy-hp');
const enemyShieldEl = document.getElementById('enemy-shield');
const enemyNameEl = document.getElementById('enemy-name');
const enemyIntentEl = document.getElementById('enemy-intent');
const logEl = document.getElementById('battle-log');
const endTurnBtn = document.getElementById('end-turn-btn');
const phaseEl = document.getElementById('phase-display');
const rankEl = document.getElementById('rank-display');
const deckCountEl = document.getElementById('deck-count');
const discardCountEl = document.getElementById('discard-count');
const rewardPanel = document.getElementById('reward-panel');
const rewardCards3 = document.getElementById('reward-cards');
const defeatPanel = document.getElementById('defeat-panel');
const quoteEl = document.getElementById('battle-quote');

// ── Start ──
startBtn.addEventListener('click', () => {
    titleScreen.style.opacity = '0';
    setTimeout(() => {
        titleScreen.style.display = 'none';
        gameUI.style.display = 'block';
        createBattleScene();
        startBattle(0);
        requestAnimationFrame(gameLoop);
    }, 1000);
});

function startBattle(factionIndex) {
    const idx = Math.min(factionIndex, FACTIONS.length - 1);
    battle = createBattleState(idx, campaign.deck, campaign.bonusFlagic);
    rewardCards = null;
    rewardPanel.style.display = 'none';
    defeatPanel.style.display = 'none';

    updateEnemyAppearance(battle.faction.color);
    showQuote();
    updateUI();
}

function showQuote() {
    const q = BATTLE_QUOTES[Math.floor(Math.random() * BATTLE_QUOTES.length)];
    quoteEl.textContent = q;
    quoteEl.style.opacity = '0.7';
    setTimeout(() => { quoteEl.style.opacity = '0'; }, 4000);
}

// ── UI Updates ──
function updateUI() {
    if (!battle) return;

    // Player stats
    playerHpEl.textContent = `HP: ${Math.max(0, battle.player.hp)}/${battle.player.maxHp}`;
    playerHpEl.style.color = battle.player.hp < 10 ? '#ff4444' : '#ffd700';
    playerShieldEl.textContent = battle.player.shield > 0 ? `Shield: ${battle.player.shield}` : '';
    playerFlagicEl.textContent = `Flagic: ${battle.player.flagic}/${battle.player.maxFlagic}`;

    // Enemy stats
    enemyHpEl.textContent = `HP: ${Math.max(0, battle.enemy.hp)}/${battle.enemy.maxHp}`;
    enemyShieldEl.textContent = battle.enemy.shield > 0 ? `Shield: ${battle.enemy.shield}` : '';
    enemyNameEl.textContent = battle.faction.name;

    // Enemy intent
    if (battle.enemy.intent) {
        const i = battle.enemy.intent;
        if (i.type === 'attack') enemyIntentEl.textContent = `Intent: Attack (${i.value})`;
        else if (i.type === 'defend') enemyIntentEl.textContent = `Intent: Defend`;
        else if (i.type === 'heal') enemyIntentEl.textContent = `Intent: Heal`;
        else enemyIntentEl.textContent = `Intent: ???`;
    }

    // Status effects
    let statusText = '';
    if (battle.player.burn > 0) statusText += ` 🔥${battle.player.burn}`;
    if (battle.player.poison > 0) statusText += ` ☠${battle.player.poison}`;
    playerHpEl.textContent += statusText;

    // Deck/discard counts
    deckCountEl.textContent = `Deck: ${battle.player.deck.length}`;
    discardCountEl.textContent = `Discard: ${battle.player.discard.length}`;

    // Phase
    phaseEl.textContent = battle.phase === 'player_turn' ? `Turn ${battle.turn} — Your Turn` : `Turn ${battle.turn}`;
    rankEl.textContent = `Rank: ${CONGRESS_RANKS[campaign.rank]} | Battles Won: ${campaign.battlesWon}`;

    // Hand
    renderHand();

    // End turn button
    endTurnBtn.disabled = battle.phase !== 'player_turn';
    endTurnBtn.style.opacity = battle.phase === 'player_turn' ? '1' : '0.4';

    // Log
    renderLog();

    // Check battle end
    if (battle.phase === 'player_win') {
        showRewards();
    } else if (battle.phase === 'player_lose') {
        showDefeat();
    }
}

function renderHand() {
    handEl.innerHTML = '';
    for (let i = 0; i < battle.player.hand.length; i++) {
        const cardId = battle.player.hand[i];
        const card = CARD_TYPES[cardId];
        if (!card) continue;

        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        const canPlay = battle.phase === 'player_turn' && battle.player.flagic >= card.cost;
        if (!canPlay) cardEl.classList.add('unplayable');
        cardEl.style.borderColor = card.color;

        let statsHtml = '';
        if (card.damage > 0) statsHtml += `<span class="card-dmg">⚔ ${card.damage}</span> `;
        if (card.heal > 0) statsHtml += `<span class="card-heal">♥ ${card.heal}</span> `;
        if (card.shield > 0) statsHtml += `<span class="card-shield">🛡 ${card.shield}</span> `;
        if (card.draw > 0) statsHtml += `<span class="card-draw">✦ ${card.draw}</span> `;

        cardEl.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name" style="color:${card.color}">${card.name}</div>
            <div class="card-stats">${statsHtml}</div>
            <div class="card-desc">${card.desc}</div>
            <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
        `;

        cardEl.addEventListener('click', () => {
            if (canPlay) {
                playCard(battle, i);
                triggerAnimation('enemy_hit');
                updateUI();
            }
        });

        handEl.appendChild(cardEl);
    }
}

function renderLog() {
    // Show last 5 log entries
    const recent = battle.log.slice(-5);
    logEl.innerHTML = recent.map(l => `<div class="log-entry">${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
}

// ── End Turn ──
endTurnBtn.addEventListener('click', () => {
    if (battle.phase !== 'player_turn') return;
    endPlayerTurn(battle);

    // Check for enemy animations
    if (battle.phase === 'player_turn' || battle.phase === 'player_lose') {
        triggerAnimation('player_hit');
    }

    // Delayed UI update for enemy turn
    setTimeout(() => updateUI(), 800);
});

// ── Rewards ──
function showRewards() {
    campaign.battlesWon++;
    campaign.bonusFlagic += FLAGIC_GROWTH;
    campaign.rank = Math.min(CONGRESS_RANKS.length - 1, Math.floor(campaign.battlesWon / 1));

    rewardCards = generateRewards(battle);
    rewardPanel.style.display = 'flex';

    let html = '<h3>VICTORY — Choose a Card</h3><div class="reward-options">';
    for (const cardId of rewardCards) {
        const card = CARD_TYPES[cardId];
        html += `
            <div class="reward-card" data-card="${cardId}" style="border-color:${card.color}">
                <div class="card-cost">${card.cost}</div>
                <div class="card-name" style="color:${card.color}">${card.name}</div>
                <div class="card-desc">${card.desc}</div>
                <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
            </div>
        `;
    }
    html += '</div><button id="skip-reward" class="action-btn">Skip Reward</button>';
    rewardCards3.innerHTML = html;

    for (const el of rewardCards3.querySelectorAll('.reward-card')) {
        el.addEventListener('click', () => {
            campaign.deck.push(el.dataset.card);
            nextBattle();
        });
    }
    document.getElementById('skip-reward').addEventListener('click', () => nextBattle());
}

function nextBattle() {
    const nextFaction = campaign.battlesWon % FACTIONS.length;
    startBattle(nextFaction);
}

function showDefeat() {
    defeatPanel.style.display = 'flex';
    defeatPanel.innerHTML = `
        <div class="defeat-content">
            <h2>DEFEATED</h2>
            <p>The Congress has spoken against you.</p>
            <p>Battles Won: ${campaign.battlesWon}</p>
            <p>Rank Achieved: ${CONGRESS_RANKS[campaign.rank]}</p>
            <p class="salute">"Glorious."</p>
            <button id="restart-btn" class="action-btn">Try Again</button>
        </div>
    `;
    document.getElementById('restart-btn').addEventListener('click', () => {
        campaign.deck = [...STARTING_DECK];
        campaign.battlesWon = 0;
        campaign.bonusFlagic = 0;
        campaign.rank = 0;
        startBattle(0);
    });
}

// ── Vexillisainthood Victory Check ──
function checkVictory() {
    if (campaign.rank >= CONGRESS_RANKS.length - 1 && !campaign.victoryShown) {
        campaign.victoryShown = true;
        const overlay = document.createElement('div');
        overlay.id = 'victory-overlay';
        overlay.innerHTML = `
            <div class="victory-content">
                <div class="victory-symbol">☽ ⛤ ☾</div>
                <h1>VEXILLISAINTHOOD</h1>
                <h2>"Recognized in others to attain."</h2>
                <p>You have ascended through the Congress of the Flags.</p>
                <p>Your deck holds ${campaign.deck.length} cards.</p>
                <p>Battles won: ${campaign.battlesWon}</p>
                <div class="salute">Glorious.</div>
                <button class="action-btn" onclick="this.parentElement.parentElement.style.display='none'">Continue Playing</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }
}

// ── Game Loop (for 3D scene) ──
function gameLoop(time) {
    const dt = Math.min((time - lastRenderTime) / 1000, 0.1);
    lastRenderTime = time;

    renderScene(dt);
    checkVictory();

    requestAnimationFrame(gameLoop);
}

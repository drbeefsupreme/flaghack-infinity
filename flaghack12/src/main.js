// ── FLAGHACK 12: ADVANCED KNOWLEDGE ── Main ──
import {
    CHARACTERS, LOCATIONS, AK_STAGES, AFFECTION_LEVELS,
    MAX_DAYS, ACTIONS_PER_DAY, AMBIENT_QUOTES,
} from './constants.js';
import { getDialogue, getGenericDialogue } from './dialogue.js';
import { createScene, renderScene, setLocation, setAKStageVisual } from './scene.js';

// ── Game State ──
const gameState = {
    day: 1,
    actionsLeft: ACTIONS_PER_DAY,
    akProgress: 0,     // Advanced Knowledge progress
    akStage: 0,
    affection: {},      // characterId -> number
    currentLocation: null,
    currentCharacter: null,
    phase: 'title',     // title, location_select, character_select, dialogue, day_end, ending
    endingReached: false,
};

// Init affection
for (const c of CHARACTERS) {
    gameState.affection[c.id] = 0;
}

// ── DOM ──
const titleScreen = document.getElementById('title-screen');
const startBtn = document.getElementById('start-btn');
const gameUI = document.getElementById('game-ui');
const locationPanel = document.getElementById('location-panel');
const dialoguePanel = document.getElementById('dialogue-panel');
const statusBar = document.getElementById('status-bar');
const quoteEl = document.getElementById('ambient-quote');

// ── Start ──
startBtn.addEventListener('click', () => {
    titleScreen.style.opacity = '0';
    setTimeout(() => {
        titleScreen.style.display = 'none';
        gameUI.style.display = 'block';
        createScene();
        gameState.phase = 'location_select';
        showLocationSelect();
        requestAnimationFrame(gameLoop);
    }, 1000);
});

// ── Location Select ──
function showLocationSelect() {
    updateStatus();
    dialoguePanel.style.display = 'none';
    locationPanel.style.display = 'flex';

    let html = `<div class="panel-title">Day ${gameState.day} — ${AK_STAGES[gameState.akStage].name}</div>`;
    html += `<div class="panel-subtitle">${AK_STAGES[gameState.akStage].desc}</div>`;
    html += '<div class="location-grid">';

    for (const loc of LOCATIONS) {
        // Who's there today? (Rotate characters through locations)
        const present = getCharactersAtLocation(loc.id);
        const presentNames = present.map(c => c.name).join(', ');

        html += `
            <div class="location-card" data-loc="${loc.id}">
                <div class="loc-name">${loc.name}</div>
                <div class="loc-desc">${loc.desc}</div>
                ${present.length > 0 ? `<div class="loc-chars">${presentNames}</div>` : '<div class="loc-empty">Empty</div>'}
            </div>
        `;
    }
    html += '</div>';
    html += `<div class="actions-left">Actions remaining: ${gameState.actionsLeft}</div>`;
    if (gameState.actionsLeft <= 0) {
        html += '<button id="end-day-btn" class="action-btn">END DAY</button>';
    }

    locationPanel.innerHTML = html;

    for (const card of locationPanel.querySelectorAll('.location-card')) {
        card.addEventListener('click', () => {
            if (gameState.actionsLeft <= 0) return;
            const locId = card.dataset.loc;
            visitLocation(locId);
        });
    }

    const endDayBtn = document.getElementById('end-day-btn');
    if (endDayBtn) {
        endDayBtn.addEventListener('click', endDay);
    }

    // Show quote
    quoteEl.textContent = AMBIENT_QUOTES[Math.floor(Math.random() * AMBIENT_QUOTES.length)];
}

function getCharactersAtLocation(locId) {
    // Characters rotate through locations based on day
    const result = [];
    for (let i = 0; i < CHARACTERS.length; i++) {
        const locIndex = (i + gameState.day) % LOCATIONS.length;
        if (LOCATIONS[locIndex].id === locId) {
            result.push(CHARACTERS[i]);
        }
    }
    return result;
}

function visitLocation(locId) {
    gameState.currentLocation = locId;
    setLocation(locId);

    const present = getCharactersAtLocation(locId);

    if (present.length === 0) {
        // Explore alone - gain small AK
        gameState.akProgress += 1;
        gameState.actionsLeft--;
        updateAKStage();
        showLocationSelect();
        return;
    }

    if (present.length === 1) {
        startDialogue(present[0]);
    } else {
        showCharacterSelect(present);
    }
}

function showCharacterSelect(chars) {
    locationPanel.style.display = 'none';
    dialoguePanel.style.display = 'flex';

    let html = '<div class="panel-title">Who do you approach?</div><div class="char-select">';
    for (const c of chars) {
        const affLevel = getAffectionLevel(c.id);
        html += `
            <div class="char-card" data-char="${c.id}" style="border-color:${c.color}">
                <div class="char-name" style="color:${c.color}">${c.name}</div>
                <div class="char-title">${c.title}</div>
                <div class="char-aff">${affLevel.name} (${gameState.affection[c.id]})</div>
            </div>
        `;
    }
    html += '</div><button class="action-btn back-btn">Go Back</button>';
    dialoguePanel.innerHTML = html;

    for (const card of dialoguePanel.querySelectorAll('.char-card')) {
        card.addEventListener('click', () => {
            const charId = card.dataset.char;
            startDialogue(CHARACTERS.find(c => c.id === charId));
        });
    }
    dialoguePanel.querySelector('.back-btn').addEventListener('click', () => {
        gameState.phase = 'location_select';
        showLocationSelect();
    });
}

// ── Dialogue ──
function startDialogue(character) {
    gameState.currentCharacter = character;
    gameState.actionsLeft--;

    const dialogue = getDialogue(character.id, gameState.currentLocation, gameState.akStage)
        || getGenericDialogue(character.id, gameState.akStage);

    if (!dialogue) {
        showLocationSelect();
        return;
    }

    showDialogueScene(dialogue, character);
}

function showDialogueScene(dialogue, character) {
    locationPanel.style.display = 'none';
    dialoguePanel.style.display = 'flex';

    let html = `<div class="dialogue-header" style="border-color:${character.color}">`;
    html += `<div class="char-portrait" style="background:${character.color}33;border-color:${character.color}">${character.name[0]}</div>`;
    html += `<div class="char-info"><div class="char-name" style="color:${character.color}">${character.name}</div>`;
    html += `<div class="char-title">${character.title}</div></div></div>`;

    // Scene description
    html += `<div class="dialogue-scene">${dialogue.text}</div>`;

    // Lines
    if (dialogue.lines) {
        for (const line of dialogue.lines) {
            const isYou = line.speaker === 'you';
            const speaker = isYou ? 'You' : character.name;
            html += `<div class="dialogue-line ${isYou ? 'line-you' : 'line-npc'}">`
                + `<span class="speaker">${speaker}:</span> ${line.text}</div>`;
        }
    }

    // Choices
    if (dialogue.choices && dialogue.choices.length > 0) {
        html += '<div class="dialogue-choices">';
        for (let i = 0; i < dialogue.choices.length; i++) {
            html += `<button class="choice-btn" data-choice="${i}">${dialogue.choices[i].text}</button>`;
        }
        html += '</div>';
    }

    dialoguePanel.innerHTML = html;

    // Bind choices
    for (const btn of dialoguePanel.querySelectorAll('.choice-btn')) {
        btn.addEventListener('click', () => {
            const choice = dialogue.choices[parseInt(btn.dataset.choice)];
            applyChoice(choice, character);
        });
    }
}

function applyChoice(choice, character) {
    // Apply affection
    gameState.affection[character.id] = Math.max(0, gameState.affection[character.id] + (choice.affection || 0));

    // Apply AK gain
    if (choice.akGain) {
        gameState.akProgress += choice.akGain;
        updateAKStage();
    }

    // Show response
    let html = `<div class="dialogue-header" style="border-color:${character.color}">`;
    html += `<div class="char-portrait" style="background:${character.color}33;border-color:${character.color}">${character.name[0]}</div>`;
    html += `<div class="char-info"><div class="char-name" style="color:${character.color}">${character.name}</div></div></div>`;

    html += `<div class="dialogue-response">${choice.response || '...'}</div>`;

    // Feedback
    if (choice.affection > 0) {
        html += `<div class="feedback positive">♥ +${choice.affection} Affection</div>`;
    } else if (choice.affection < 0) {
        html += `<div class="feedback negative">♡ ${choice.affection} Affection</div>`;
    }
    if (choice.akGain) {
        html += `<div class="feedback ak">✦ +${choice.akGain} Advanced Knowledge</div>`;
    }

    html += '<button class="action-btn continue-btn">Continue</button>';
    dialoguePanel.innerHTML = html;

    dialoguePanel.querySelector('.continue-btn').addEventListener('click', () => {
        gameState.phase = 'location_select';
        showLocationSelect();
    });
}

// ── AK Stage Tracking ──
function updateAKStage() {
    for (let i = AK_STAGES.length - 1; i >= 0; i--) {
        if (gameState.akProgress >= AK_STAGES[i].threshold) {
            if (i !== gameState.akStage) {
                gameState.akStage = i;
                setAKStageVisual(i);
                // Check for ending
                if (i >= AK_STAGES.length - 1) {
                    checkEnding();
                }
            }
            break;
        }
    }
}

function getAffectionLevel(charId) {
    const aff = gameState.affection[charId];
    let level = AFFECTION_LEVELS[0];
    for (const l of AFFECTION_LEVELS) {
        if (aff >= l.threshold) level = l;
    }
    return level;
}

// ── Day Management ──
function endDay() {
    gameState.day++;
    gameState.actionsLeft = ACTIONS_PER_DAY;

    if (gameState.day > MAX_DAYS) {
        showEnding('time');
        return;
    }

    showDaySummary();
}

function showDaySummary() {
    dialoguePanel.style.display = 'flex';
    locationPanel.style.display = 'none';

    let html = `<div class="panel-title">Night Falls on Mega Harvard</div>`;
    html += `<div class="day-summary">`;
    html += `<div class="summary-day">Day ${gameState.day - 1} Complete</div>`;

    // Show relationship status
    html += '<div class="summary-relationships">';
    for (const c of CHARACTERS) {
        const level = getAffectionLevel(c.id);
        html += `<div class="summary-char" style="border-color:${c.color}">`;
        html += `<span style="color:${c.color}">${c.name}</span>: ${level.name} (${gameState.affection[c.id]})`;
        html += '</div>';
    }
    html += '</div>';

    html += `<div class="summary-ak">Advanced Knowledge: ${gameState.akProgress} — ${AK_STAGES[gameState.akStage].name}</div>`;
    html += `<div class="summary-quote">${AMBIENT_QUOTES[Math.floor(Math.random() * AMBIENT_QUOTES.length)]}</div>`;
    html += '</div>';
    html += '<button class="action-btn continue-btn">Begin Next Day</button>';

    dialoguePanel.innerHTML = html;
    dialoguePanel.querySelector('.continue-btn').addEventListener('click', () => {
        gameState.phase = 'location_select';
        showLocationSelect();
    });
}

// ── Endings ──
function checkEnding() {
    if (gameState.endingReached) return;

    // Find highest affection character
    let maxChar = CHARACTERS[0];
    let maxAff = 0;
    for (const c of CHARACTERS) {
        if (gameState.affection[c.id] > maxAff) {
            maxAff = gameState.affection[c.id];
            maxChar = c;
        }
    }

    if (maxAff >= 30) {
        showEnding('romance', maxChar);
    }
}

function showEnding(type, character = null) {
    gameState.endingReached = true;
    gameState.phase = 'ending';

    locationPanel.style.display = 'none';
    dialoguePanel.style.display = 'flex';

    let html = '';

    if (type === 'romance' && character) {
        html = `
            <div class="ending">
                <div class="ending-symbol">⛤</div>
                <h2>ADVANCING OUT OF CONTROL</h2>
                <div class="ending-subtitle">with ${character.name}</div>
                <div class="ending-text">
                    You have mastered Advanced Knowledge. The human words have fallen away.
                    In their place: a language of Flags, of pentagrams, of ley lines vibrating
                    with meaning beyond meaning.<br><br>
                    ${character.name} stands beside you before the Effigy. Together, you have forgotten
                    everything that was false and remembered everything that was never taught.<br><br>
                    The first step on the path towards advancing out of control
                    turns out not to be a step at all. It is a placement. Of a Flag.
                </div>
                <div class="ending-stats">
                    <p>Days at Mega Harvard: ${gameState.day}</p>
                    <p>Advanced Knowledge: ${gameState.akProgress}</p>
                    <p>${character.name} Affection: ${gameState.affection[character.id]}</p>
                </div>
                <div class="ending-salute">Glorious.</div>
            </div>
        `;
    } else {
        html = `
            <div class="ending">
                <div class="ending-symbol">⚑</div>
                <h2>THE SEMESTER ENDS</h2>
                <div class="ending-text">
                    Your time at Mega Harvard has concluded. You have forgotten much,
                    but perhaps not enough. The path to Advanced Knowledge continues
                    beyond this lifetime.<br><br>
                    "It may take multiple lifetimes." — Dr. Beef Supreme
                </div>
                <div class="ending-stats">
                    <p>Days completed: ${MAX_DAYS}</p>
                    <p>Advanced Knowledge: ${gameState.akProgress}</p>
                    <p>Stage reached: ${AK_STAGES[gameState.akStage].name}</p>
                </div>
                <div class="ending-salute">Glorious.</div>
            </div>
        `;
    }

    html += '<button class="action-btn" onclick="location.reload()">Play Again</button>';
    dialoguePanel.innerHTML = html;
}

// ── Status Bar ──
function updateStatus() {
    let html = `<span>Day ${gameState.day}/${MAX_DAYS}</span>`;
    html += `<span>AK: ${gameState.akProgress} (${AK_STAGES[gameState.akStage].name})</span>`;
    html += `<span>Actions: ${gameState.actionsLeft}</span>`;
    statusBar.innerHTML = html;
}

// ── Game Loop ──
const clock = { last: 0 };
function gameLoop(time) {
    requestAnimationFrame(gameLoop);
    const dt = Math.min((time - clock.last) / 1000, 0.1);
    clock.last = time;
    renderScene(dt);
}

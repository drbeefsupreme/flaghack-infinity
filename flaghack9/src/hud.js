// ── HUD & UI ──
import {
    MACHINE_TYPES, GRIMOIRE_PAGES, ITEM_TYPES,
    FLAGIC_PER_FLAG, FLAGIC_PER_ENCHANTED, FLAGIC_PER_PENTAGRAM,
} from './constants.js';
import { getGrimoireState, unlockPage, isUnlockAvailable, getRandomQuote } from './grimoire.js';

let hudEl, grimoireEl, tooltipEl, buildBarEl, quoteEl;
let grimoireOpen = false;
let selectedBuild = null;
let currentDirection = 'north';

export function getSelectedBuild() { return selectedBuild; }
export function getCurrentDirection() { return currentDirection; }

export function createHUD() {
    // Main HUD bar
    hudEl = document.createElement('div');
    hudEl.id = 'hud';
    hudEl.innerHTML = `
        <div class="hud-row">
            <span id="hud-flagic">⚑ Flagic: 50</span>
            <span id="hud-produced">Flags: 0 | Enchanted: 0 | Pentagrams: 0</span>
            <span id="hud-pages">Grimoire: 4/10</span>
        </div>
    `;
    document.body.appendChild(hudEl);

    // Build bar
    buildBarEl = document.createElement('div');
    buildBarEl.id = 'build-bar';
    document.body.appendChild(buildBarEl);

    // Grimoire panel
    grimoireEl = document.createElement('div');
    grimoireEl.id = 'grimoire-panel';
    grimoireEl.style.display = 'none';
    document.body.appendChild(grimoireEl);

    // Tooltip
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'tooltip';
    tooltipEl.style.display = 'none';
    document.body.appendChild(tooltipEl);

    // Quote
    quoteEl = document.createElement('div');
    quoteEl.id = 'quote-display';
    quoteEl.textContent = getRandomQuote();
    document.body.appendChild(quoteEl);

    // Quote rotation
    setInterval(() => {
        quoteEl.style.opacity = '0';
        setTimeout(() => {
            quoteEl.textContent = getRandomQuote();
            quoteEl.style.opacity = '0.6';
        }, 1000);
    }, 8000);

    updateBuildBar();
}

export function updateHUD(gameState) {
    const flagicEl = document.getElementById('hud-flagic');
    const prodEl = document.getElementById('hud-produced');
    const pagesEl = document.getElementById('hud-pages');

    if (flagicEl) flagicEl.textContent = `⚑ Flagic: ${Math.floor(gameState.flagic)}`;
    if (prodEl) {
        prodEl.textContent = `Flags: ${gameState.totalProduced.flag || 0} | Enchanted: ${gameState.totalProduced.enchanted_flag || 0} | Pentagrams: ${gameState.totalProduced.pentagram || 0}`;
    }
    if (pagesEl) pagesEl.textContent = `Grimoire: ${gameState.pagesUnlocked}/10`;

    // Omega win check
    if (gameState.omegaUnlocked && !gameState.omegaShown) {
        gameState.omegaShown = true;
        showOmegaVictory(gameState);
    }
}

function updateBuildBar() {
    const state = getGrimoireState();
    let html = '<div class="build-title">BUILD [R to rotate]</div><div class="build-items">';

    // Always show available machines
    const available = [];
    for (const page of state.pages) {
        if (!page.unlocked) continue;
        const u = page.unlock;
        if (u === 'omega') continue;
        if (u.startsWith('source_')) {
            available.push({ key: u, name: u.replace('source_', '') + ' Source', color: '#6a6' });
        } else if (MACHINE_TYPES[u]) {
            available.push({ key: u, name: MACHINE_TYPES[u].name, color: '#' + MACHINE_TYPES[u].color.toString(16).padStart(6, '0') });
        }
    }

    for (const m of available) {
        const sel = selectedBuild === m.key ? ' selected' : '';
        html += `<button class="build-btn${sel}" data-build="${m.key}" style="border-color:${m.color}">${m.name}</button>`;
    }

    html += '</div>';
    html += `<div class="build-hint">Direction: ${currentDirection.toUpperCase()} | [G] Grimoire | [X] Delete | [ESC] Cancel</div>`;
    buildBarEl.innerHTML = html;

    // Bind buttons
    for (const btn of buildBarEl.querySelectorAll('.build-btn')) {
        btn.addEventListener('click', () => {
            selectedBuild = btn.dataset.build;
            updateBuildBar();
        });
    }
}

export function toggleGrimoire(gameState) {
    grimoireOpen = !grimoireOpen;
    if (grimoireOpen) {
        const state = getGrimoireState();
        let html = '<h2>☽ THE VEXILLORAMANOMICON ☾</h2><div class="grimoire-subtitle">The Book of FLAGs</div>';
        html += '<div class="pages">';
        for (const page of state.pages) {
            const cls = page.unlocked ? 'page unlocked' : 'page locked';
            html += `<div class="${cls}" data-page="${page.id}">`;
            html += `<div class="page-name">${page.name}</div>`;
            html += `<div class="page-desc">${page.desc}</div>`;
            if (!page.unlocked) {
                html += `<div class="page-cost">Cost: ${page.cost} Flagic</div>`;
                if (gameState.flagic >= page.cost) {
                    html += `<button class="unlock-btn" data-page="${page.id}">UNLOCK</button>`;
                }
            } else {
                html += `<div class="page-status">✦ Unlocked</div>`;
            }
            html += '</div>';
        }
        html += '</div>';
        html += '<div class="grimoire-close">[G] to close</div>';
        grimoireEl.innerHTML = html;
        grimoireEl.style.display = 'flex';

        for (const btn of grimoireEl.querySelectorAll('.unlock-btn')) {
            btn.addEventListener('click', () => {
                const pid = parseInt(btn.dataset.page);
                if (unlockPage(pid, gameState)) {
                    toggleGrimoire(gameState); // Refresh
                    toggleGrimoire(gameState);
                    updateBuildBar();
                }
            });
        }
    } else {
        grimoireEl.style.display = 'none';
    }
}

export function setDirection(dir) {
    currentDirection = dir;
    updateBuildBar();
}

export function rotateDirection() {
    const dirs = ['north', 'east', 'south', 'west'];
    const idx = dirs.indexOf(currentDirection);
    currentDirection = dirs[(idx + 1) % 4];
    updateBuildBar();
}

export function cancelBuild() {
    selectedBuild = null;
    updateBuildBar();
}

export function showTooltip(text, x, y) {
    tooltipEl.textContent = text;
    tooltipEl.style.display = 'block';
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
}

export function hideTooltip() {
    tooltipEl.style.display = 'none';
}

export function refreshBuildBar() {
    updateBuildBar();
}

function showOmegaVictory(gameState) {
    const overlay = document.createElement('div');
    overlay.id = 'omega-overlay';
    overlay.innerHTML = `
        <div class="omega-content">
            <div class="omega-symbol">⛤</div>
            <h1>THE OMEGA CONFIGURATION</h1>
            <h2>"The arrangement all Flags move toward."</h2>
            <p>Your factory has achieved perfection.</p>
            <p>Total Flagic harvested: ${gameState.totalFlagicEarned}</p>
            <p>Flags crafted: ${gameState.totalProduced.flag || 0}</p>
            <p>Enchanted Flags: ${gameState.totalProduced.enchanted_flag || 0}</p>
            <p>Pentagrams forged: ${gameState.totalProduced.pentagram || 0}</p>
            <div class="omega-salute">Glorious.</div>
            <button onclick="this.parentElement.parentElement.style.display='none'">Continue Building</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// ── The Vexilloramanomicon (Grimoire / Tech Tree) ──
import { GRIMOIRE_PAGES, GRIMOIRE_QUOTES } from './constants.js';

const unlockedPages = new Set([0, 1, 2, 3]); // Start with basics unlocked

export function isPageUnlocked(pageId) {
    return unlockedPages.has(pageId);
}

export function unlockPage(pageId, gameState) {
    const page = GRIMOIRE_PAGES[pageId];
    if (!page || unlockedPages.has(pageId)) return false;
    if (gameState.flagic < page.cost) return false;
    gameState.flagic -= page.cost;
    unlockedPages.add(pageId);
    gameState.pagesUnlocked = unlockedPages.size;

    // Track for Omega check
    if (page.unlock === 'omega') {
        gameState.omegaUnlocked = true;
    }
    return true;
}

export function getUnlockForPage(pageId) {
    const page = GRIMOIRE_PAGES[pageId];
    return page ? page.unlock : null;
}

export function isUnlockAvailable(unlockName) {
    for (const page of GRIMOIRE_PAGES) {
        if (page.unlock === unlockName && unlockedPages.has(page.id)) return true;
    }
    return false;
}

export function getNextLockablePage() {
    for (const page of GRIMOIRE_PAGES) {
        if (!unlockedPages.has(page.id)) return page;
    }
    return null;
}

export function getRandomQuote() {
    return GRIMOIRE_QUOTES[Math.floor(Math.random() * GRIMOIRE_QUOTES.length)];
}

export function getGrimoireState() {
    return {
        unlocked: [...unlockedPages],
        total: GRIMOIRE_PAGES.length,
        pages: GRIMOIRE_PAGES.map(p => ({ ...p, unlocked: unlockedPages.has(p.id) })),
    };
}

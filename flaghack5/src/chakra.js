import { CHAKRAS, TOTAL_FLOORS } from './constants.js';

// Chakra unlocking system - one chakra per floor
// Unlocked by collecting a Crystal of Implied Flag on that floor

export function getChakraForFloor(floorNum) {
    if (floorNum < 0 || floorNum >= TOTAL_FLOORS) return null;
    return { index: floorNum, ...CHAKRAS[floorNum] };
}

export function unlockChakra(player, chakraIndex) {
    if (chakraIndex < 0 || chakraIndex >= CHAKRAS.length) return false;
    if (player.chakras[chakraIndex]) return false;

    player.chakras[chakraIndex] = true;

    // Apply permanent stat changes
    const chakra = CHAKRAS[chakraIndex];
    switch (chakra.stat) {
        case 'damage':
            // Handled dynamically in getAttackDamage
            break;
        case 'speed':
            // Handled dynamically in updatePlayer
            break;
        case 'burn':
            // Handled in combat (processMeleeAttack)
            break;
        case 'regen':
            // Handled in updatePlayer
            break;
        case 'projectile':
            // Enables Throat chakra projectile ability (key 5)
            break;
        case 'vision':
            // Reveals hidden rooms on minimap
            break;
        case 'flagic':
            // Doubles flagic cap and gain
            break;
    }

    return true;
}

export function getChakraCount(player) {
    return player.chakras.filter(c => c).length;
}

export function buildChakraUI(player) {
    const bar = document.getElementById('chakra-bar');
    bar.innerHTML = '';
    bar.style.display = 'flex';

    for (let i = 0; i < CHAKRAS.length; i++) {
        const chakra = CHAKRAS[i];
        const slot = document.createElement('div');
        slot.className = 'chakra-slot' + (player.chakras[i] ? ' unlocked' : '');
        slot.style.color = '#' + chakra.color.toString(16).padStart(6, '0');
        slot.style.borderColor = player.chakras[i] ?
            '#' + chakra.color.toString(16).padStart(6, '0') : '#333';

        // Unicode symbol for each chakra
        const symbols = ['\u25C9', '\u25CE', '\u2609', '\u2665', '\u25C8', '\u25C7', '\u2727'];
        slot.innerHTML = `<span>${symbols[i]}</span><span class="chakra-label">${chakra.name}: ${chakra.desc}</span>`;

        if (player.chakras[i]) {
            slot.style.boxShadow = `0 0 8px #${chakra.color.toString(16).padStart(6, '0')}`;
        }

        bar.appendChild(slot);
    }
}

export function updateChakraUI(player) {
    const slots = document.querySelectorAll('.chakra-slot');
    slots.forEach((slot, i) => {
        const chakra = CHAKRAS[i];
        if (player.chakras[i]) {
            slot.classList.add('unlocked');
            slot.style.borderColor = '#' + chakra.color.toString(16).padStart(6, '0');
            slot.style.boxShadow = `0 0 8px #${chakra.color.toString(16).padStart(6, '0')}`;
        }
    });
}

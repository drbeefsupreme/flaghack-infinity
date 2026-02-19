// ── Tactical Battle Engine ──
import {
    GRID_W, GRID_H, UNIT_TYPES,
    FLAG_BUFF_ATK, FLAG_BUFF_DEF, PENTAGRAM_DAMAGE,
} from './constants.js';

export function createBattle(mission) {
    const grid = [];
    for (let y = 0; y < GRID_H; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_W; x++) {
            grid[y][x] = { terrain: 'open', flag: false, unit: null };
        }
    }

    const units = [];

    // Place player units
    for (const u of mission.playerUnits) {
        const unit = createUnit(u.type, 'player', u.x, u.y);
        units.push(unit);
        grid[u.y][u.x].unit = unit;
    }

    // Place enemy units
    for (const u of mission.enemyUnits) {
        const unit = createUnit(u.type, 'enemy', u.x, u.y);
        units.push(unit);
        grid[u.y][u.x].unit = unit;
    }

    return {
        grid,
        units,
        turn: 'player',
        turnNumber: 1,
        selectedUnit: null,
        phase: 'select', // select, move, action, enemy_turn, win, lose
        moveTargets: [],
        attackTargets: [],
        abilityTargets: [],
        log: [],
        flags: [], // {x, y}
    };
}

function createUnit(type, team, x, y) {
    const info = UNIT_TYPES[type];
    return {
        type, team, x, y,
        hp: info.hp, maxHp: info.hp,
        atk: info.atk, def: info.def,
        move: info.move, range: info.range,
        moved: false, acted: false,
        buffs: [], // {type, duration, value}
    };
}

// ── Movement ──
export function getMoveTiles(battle, unit) {
    const tiles = [];
    const visited = new Set();
    const queue = [{ x: unit.x, y: unit.y, steps: 0 }];
    visited.add(`${unit.x},${unit.y}`);

    while (queue.length > 0) {
        const { x, y, steps } = queue.shift();
        if (steps > 0) tiles.push({ x, y });

        if (steps >= unit.move) continue;

        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const nx = x + dx, ny = y + dy;
            const key = `${nx},${ny}`;
            if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
            if (visited.has(key)) continue;
            if (battle.grid[ny][nx].unit) continue;
            visited.add(key);
            queue.push({ x: nx, y: ny, steps: steps + 1 });
        }
    }
    return tiles;
}

export function moveUnit(battle, unit, tx, ty) {
    battle.grid[unit.y][unit.x].unit = null;
    unit.x = tx;
    unit.y = ty;
    battle.grid[ty][tx].unit = unit;
    unit.moved = true;
}

// ── Attack ──
export function getAttackTiles(battle, unit) {
    const tiles = [];
    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            const dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
            if (dist > 0 && dist <= unit.range) {
                const target = battle.grid[y][x].unit;
                if (target && target.team !== unit.team) {
                    tiles.push({ x, y, target });
                }
            }
        }
    }
    return tiles;
}

export function attackUnit(battle, attacker, target) {
    let atkPower = getEffectiveAtk(battle, attacker);
    let defPower = getEffectiveDef(battle, target);
    const damage = Math.max(1, atkPower - defPower);
    target.hp -= damage;
    battle.log.push(`${UNIT_TYPES[attacker.type].name} attacks ${UNIT_TYPES[target.type].name} for ${damage} damage!`);
    attacker.acted = true;

    if (target.hp <= 0) {
        battle.log.push(`${UNIT_TYPES[target.type].name} defeated!`);
        battle.grid[target.y][target.x].unit = null;
        battle.units = battle.units.filter(u => u !== target);
    }
}

function getEffectiveAtk(battle, unit) {
    let atk = unit.atk;
    // Flag buff
    if (battle.grid[unit.y][unit.x].flag) atk += FLAG_BUFF_ATK;
    // Buffs
    for (const b of unit.buffs) {
        if (b.type === 'atk') atk += b.value;
    }
    return Math.max(0, atk);
}

function getEffectiveDef(battle, unit) {
    let def = unit.def;
    if (battle.grid[unit.y][unit.x].flag) def += FLAG_BUFF_DEF;
    for (const b of unit.buffs) {
        if (b.type === 'def') def += b.value;
    }
    return Math.max(0, def);
}

// ── Abilities ──
export function getAbilityTargets(battle, unit) {
    const info = UNIT_TYPES[unit.type];
    const targets = [];

    if (info.ability === 'place_flag') {
        // Adjacent empty tiles
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const nx = unit.x + dx, ny = unit.y + dy;
            if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                if (!battle.grid[ny][nx].flag) {
                    targets.push({ x: nx, y: ny });
                }
            }
        }
    } else if (info.ability === 'ley_blast') {
        // Range 3 enemies
        return getAttackTiles(battle, { ...unit, range: 3 });
    } else if (info.ability === 'shield') {
        // Adjacent allies
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const nx = unit.x + dx, ny = unit.y + dy;
            if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                const target = battle.grid[ny][nx].unit;
                if (target && target.team === unit.team) {
                    targets.push({ x: nx, y: ny, target });
                }
            }
        }
    } else if (info.ability === 'antimeme') {
        // Range 2 enemies
        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                const dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
                if (dist > 0 && dist <= 2) {
                    const target = battle.grid[y][x].unit;
                    if (target && target.team !== unit.team) {
                        targets.push({ x, y, target });
                    }
                }
            }
        }
    } else if (info.ability === 'steal_flag') {
        // Adjacent flags
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const nx = unit.x + dx, ny = unit.y + dy;
            if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                if (battle.grid[ny][nx].flag) {
                    targets.push({ x: nx, y: ny });
                }
            }
        }
    } else if (info.ability === 'ban_strike') {
        return getAttackTiles(battle, unit);
    }
    return targets;
}

export function useAbility(battle, unit, tx, ty) {
    const info = UNIT_TYPES[unit.type];

    if (info.ability === 'place_flag') {
        battle.grid[ty][tx].flag = true;
        battle.flags.push({ x: tx, y: ty });
        battle.log.push(`${info.name} places a Flag at (${tx},${ty})!`);
        checkPentagram(battle, tx, ty);
    } else if (info.ability === 'ley_blast') {
        const target = battle.grid[ty][tx].unit;
        if (target) {
            const damage = 3;
            target.hp -= damage;
            battle.log.push(`${info.name} fires Ley Blast for ${damage}!`);
            if (target.hp <= 0) {
                battle.log.push(`${UNIT_TYPES[target.type].name} defeated!`);
                battle.grid[target.y][target.x].unit = null;
                battle.units = battle.units.filter(u => u !== target);
            }
        }
    } else if (info.ability === 'shield') {
        const target = battle.grid[ty][tx].unit;
        if (target) {
            target.buffs.push({ type: 'def', value: 3, duration: 2 });
            battle.log.push(`${info.name} shields ${UNIT_TYPES[target.type].name}! (+3 DEF)`);
        }
    } else if (info.ability === 'antimeme') {
        const target = battle.grid[ty][tx].unit;
        if (target) {
            target.buffs.push({ type: 'atk', value: -2, duration: 2 });
            battle.log.push(`${info.name} deploys antimeme on ${UNIT_TYPES[target.type].name}! (-2 ATK)`);
        }
    } else if (info.ability === 'steal_flag') {
        battle.grid[ty][tx].flag = false;
        battle.flags = battle.flags.filter(f => !(f.x === tx && f.y === ty));
        battle.log.push(`${info.name} steals a Flag from (${tx},${ty})!`);
    } else if (info.ability === 'ban_strike') {
        const target = battle.grid[ty][tx].unit;
        if (target) {
            let damage = unit.atk;
            if (battle.grid[target.y][target.x].flag) damage *= 2;
            const actualDmg = Math.max(1, damage - getEffectiveDef(battle, target));
            target.hp -= actualDmg;
            battle.log.push(`${info.name} Ban Strike for ${actualDmg}!`);
            if (target.hp <= 0) {
                battle.grid[target.y][target.x].unit = null;
                battle.units = battle.units.filter(u => u !== target);
                battle.log.push(`${UNIT_TYPES[target.type].name} defeated!`);
            }
        }
    }

    unit.acted = true;
}

function checkPentagram(battle, fx, fy) {
    // Check if 5 flags form a cross/plus pattern around any center
    // Simplified: check for 5+ flags within 2 tiles of each other
    if (battle.flags.length >= 5) {
        battle.log.push('⛤ PENTAGRAM FORMATION! Flagic explosion deals ' + PENTAGRAM_DAMAGE + ' to all enemies!');
        // Damage all enemies
        for (const unit of battle.units) {
            if (unit.team === 'enemy') {
                unit.hp -= PENTAGRAM_DAMAGE;
                if (unit.hp <= 0) {
                    battle.grid[unit.y][unit.x].unit = null;
                    battle.log.push(`${UNIT_TYPES[unit.type].name} destroyed by pentagram!`);
                }
            }
        }
        battle.units = battle.units.filter(u => u.hp > 0);
        // Remove used flags
        for (const f of battle.flags) battle.grid[f.y][f.x].flag = false;
        battle.flags = [];
    }
}

// ── Turn Management ──
export function endPlayerTurn(battle) {
    // Tick buffs
    for (const unit of battle.units) {
        unit.buffs = unit.buffs.filter(b => { b.duration--; return b.duration > 0; });
    }

    battle.turn = 'enemy';
    battle.phase = 'enemy_turn';
    battle.turnNumber++;

    // Reset player units
    for (const unit of battle.units) {
        if (unit.team === 'player') {
            unit.moved = false;
            unit.acted = false;
        }
    }
}

export function executeEnemyTurn(battle) {
    const enemies = battle.units.filter(u => u.team === 'enemy');

    for (const enemy of enemies) {
        // Simple AI: move toward nearest player unit, then attack if in range
        const players = battle.units.filter(u => u.team === 'player');
        if (players.length === 0) break;

        // Find closest player
        let closest = players[0];
        let closestDist = Infinity;
        for (const p of players) {
            const dist = Math.abs(p.x - enemy.x) + Math.abs(p.y - enemy.y);
            if (dist < closestDist) { closestDist = dist; closest = p; }
        }

        // Move toward them
        const moveTiles = getMoveTiles(battle, enemy);
        let bestTile = null;
        let bestDist = closestDist;
        for (const tile of moveTiles) {
            const dist = Math.abs(tile.x - closest.x) + Math.abs(tile.y - closest.y);
            if (dist < bestDist) { bestDist = dist; bestTile = tile; }
        }
        if (bestTile) {
            moveUnit(battle, enemy, bestTile.x, bestTile.y);
        }

        // Try to attack
        const attackable = getAttackTiles(battle, enemy);
        if (attackable.length > 0) {
            // Prioritize low HP targets
            attackable.sort((a, b) => a.target.hp - b.target.hp);
            attackUnit(battle, enemy, attackable[0].target);
        } else {
            // Try ability
            const abilityTargets = getAbilityTargets(battle, enemy);
            if (abilityTargets.length > 0) {
                const t = abilityTargets[0];
                useAbility(battle, enemy, t.x, t.y);
            }
        }
    }

    // Reset enemy units, start player turn
    for (const unit of battle.units) {
        if (unit.team === 'enemy') {
            unit.moved = false;
            unit.acted = false;
        }
    }

    battle.turn = 'player';
    battle.phase = 'select';

    // Check win/lose
    const playerAlive = battle.units.some(u => u.team === 'player');
    const enemyAlive = battle.units.some(u => u.team === 'enemy');
    if (!enemyAlive) battle.phase = 'win';
    if (!playerAlive) battle.phase = 'lose';
}

// ── Grid & Machine Management ──
import * as THREE from 'three';
import {
    GRID_SIZE, CELL_SIZE, WORLD_EXTENT,
    MACHINE_TYPES, DIRECTIONS, DIR_ORDER,
    RECIPES, RESOURCE_SPAWN_INTERVAL, RESOURCE_COLORS,
    ITEM_TYPES, FLAGIC_PER_FLAG, FLAGIC_PER_ENCHANTED, FLAGIC_PER_PENTAGRAM,
    RESOURCE_SPEED,
} from './constants.js';

// ── Grid State ──
// grid[z][x] = { type, direction, mesh, inputBuffer[], outputBuffer, timer, ... } | null
const grid = [];
for (let z = 0; z < GRID_SIZE; z++) {
    grid[z] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
        grid[z][x] = null;
    }
}

export function getGrid() { return grid; }
export function getCell(x, z) {
    if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) return null;
    return grid[z][x];
}

export function gridToWorld(gx, gz) {
    return new THREE.Vector3(
        (gx - GRID_SIZE / 2 + 0.5) * CELL_SIZE,
        0,
        (gz - GRID_SIZE / 2 + 0.5) * CELL_SIZE,
    );
}

export function worldToGrid(wx, wz) {
    return {
        x: Math.floor(wx / CELL_SIZE + GRID_SIZE / 2),
        z: Math.floor(wz / CELL_SIZE + GRID_SIZE / 2),
    };
}

// ── Visual grid lines ──
export function createGridVisual(scene) {
    const group = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: 0x222233, transparent: true, opacity: 0.3 });
    const halfExt = WORLD_EXTENT / 2;

    for (let i = 0; i <= GRID_SIZE; i++) {
        const offset = (i - GRID_SIZE / 2) * CELL_SIZE;
        // X lines
        const geoX = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(offset, 0.01, -halfExt),
            new THREE.Vector3(offset, 0.01, halfExt),
        ]);
        group.add(new THREE.Line(geoX, mat));
        // Z lines
        const geoZ = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-halfExt, 0.01, offset),
            new THREE.Vector3(halfExt, 0.01, offset),
        ]);
        group.add(new THREE.Line(geoZ, mat));
    }
    scene.add(group);
    return group;
}

// ── Machine Placement ──
export function placeMachine(type, gx, gz, direction, scene, gameState) {
    if (gx < 0 || gx >= GRID_SIZE || gz < 0 || gz >= GRID_SIZE) return false;
    if (grid[gz][gx] !== null) return false;

    const info = MACHINE_TYPES[type === 'source_cloth' || type === 'source_lumber' ||
        type === 'source_dye' || type === 'source_crystal' ? 'source' : type];
    if (!info) return false;

    // Cost check
    const baseCost = info.cost.flagic || 0;
    if (gameState.flagic < baseCost) return false;
    gameState.flagic -= baseCost;

    const pos = gridToWorld(gx, gz);
    const mesh = createMachineMesh(type, info);
    mesh.position.copy(pos);

    const dir = DIRECTIONS[direction] || DIRECTIONS.north;
    mesh.rotation.y = dir.angle;

    scene.add(mesh);

    const cell = {
        type,
        direction,
        mesh,
        inputBuffer: [],
        outputItem: null,
        timer: 0,
        gx, gz,
        // source-specific
        resourceType: type.startsWith('source_') ? type.replace('source_', '') : null,
    };
    grid[gz][gx] = cell;
    return true;
}

export function removeMachine(gx, gz, scene, gameState) {
    const cell = getCell(gx, gz);
    if (!cell) return false;
    scene.remove(cell.mesh);
    // Remove any item meshes in buffers
    for (const item of cell.inputBuffer) {
        if (item.mesh) scene.remove(item.mesh);
    }
    if (cell.outputItem && cell.outputItem.mesh) scene.remove(cell.outputItem.mesh);
    grid[gz][gx] = null;
    // Refund half
    const info = MACHINE_TYPES[cell.type.startsWith('source') ? 'source' : cell.type];
    if (info) gameState.flagic += Math.floor((info.cost.flagic || 0) / 2);
    return true;
}

function createMachineMesh(type, info) {
    const group = new THREE.Group();
    const baseType = type.startsWith('source_') ? 'source' : type;

    if (baseType === 'source') {
        // Glowing resource pile
        const resType = type.replace('source_', '');
        const color = RESOURCE_COLORS[resType] || 0x336633;
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1, 0.5, 6),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 }),
        );
        base.position.y = 0.25;
        group.add(base);
        // Glow ring
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.9, 1.1, 6),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        group.add(ring);
    } else if (baseType === 'conveyor') {
        // Belt with arrow
        const belt = new THREE.Mesh(
            new THREE.BoxGeometry(CELL_SIZE * 0.8, 0.15, CELL_SIZE * 0.4),
            new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.8 }),
        );
        belt.position.y = 0.075;
        group.add(belt);
        // Direction arrow
        const arrow = new THREE.Mesh(
            new THREE.ConeGeometry(0.25, 0.5, 4),
            new THREE.MeshStandardMaterial({ color: 0xaaaacc, emissive: 0x333355, emissiveIntensity: 0.3 }),
        );
        arrow.rotation.x = -Math.PI / 2;
        arrow.position.set(0, 0.2, -0.6);
        group.add(arrow);
    } else if (baseType === 'crafter') {
        // Workbench
        const bench = new THREE.Mesh(
            new THREE.BoxGeometry(CELL_SIZE * 0.7, 0.6, CELL_SIZE * 0.7),
            new THREE.MeshStandardMaterial({ color: 0xcc8833, roughness: 0.6 }),
        );
        bench.position.y = 0.3;
        group.add(bench);
        // Flag being crafted (small)
        const miniFlag = new THREE.Mesh(
            new THREE.PlaneGeometry(0.4, 0.4),
            new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.2, side: THREE.DoubleSide }),
        );
        miniFlag.rotation.x = -Math.PI / 4;
        miniFlag.position.y = 0.7;
        group.add(miniFlag);
    } else if (baseType === 'enchanter') {
        // Purple altar
        const altar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.8, 0.8, 5),
            new THREE.MeshStandardMaterial({ color: 0x6633aa, emissive: 0x4422aa, emissiveIntensity: 0.4 }),
        );
        altar.position.y = 0.4;
        group.add(altar);
        // Floating crystal
        const crys = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.25),
            new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x4488ff, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 }),
        );
        crys.position.y = 1.2;
        crys.userData.floatPhase = Math.random() * Math.PI * 2;
        group.add(crys);
    } else if (baseType === 'assembler') {
        // Pentagram forge - golden ring with 5 pillars
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.1, 8, 5),
            new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.5 }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.3;
        group.add(ring);
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.8, 4),
                new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa8800, emissiveIntensity: 0.3 }),
            );
            pillar.position.set(Math.cos(a) * 0.9, 0.4, Math.sin(a) * 0.9);
            group.add(pillar);
        }
    } else if (baseType === 'seller') {
        // Flagic harvester - green with spinning gear
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(CELL_SIZE * 0.6, 0.8, CELL_SIZE * 0.6),
            new THREE.MeshStandardMaterial({ color: 0x22aa44, emissive: 0x118833, emissiveIntensity: 0.3 }),
        );
        box.position.y = 0.4;
        group.add(box);
        const gear = new THREE.Mesh(
            new THREE.TorusGeometry(0.4, 0.08, 4, 8),
            new THREE.MeshStandardMaterial({ color: 0x44dd66, emissive: 0x22aa44, emissiveIntensity: 0.4 }),
        );
        gear.position.y = 0.9;
        gear.rotation.x = Math.PI / 4;
        gear.userData.isGear = true;
        group.add(gear);
    }

    group.castShadow = true;
    return group;
}

// ── Items (resources flowing on conveyors) ──
const activeItems = [];
export function getActiveItems() { return activeItems; }

function createItemMesh(itemType) {
    const info = ITEM_TYPES[itemType];
    let mesh;
    if (itemType === 'pentagram') {
        mesh = new THREE.Mesh(
            new THREE.TorusGeometry(info.size, 0.06, 4, 5),
            new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.6 }),
        );
    } else if (itemType === 'flag' || itemType === 'enchanted_flag') {
        const group = new THREE.Group();
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4),
            new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
        );
        pole.position.y = 0.3;
        group.add(pole);
        const cloth = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.3),
            new THREE.MeshStandardMaterial({
                color: info.color, emissive: info.color,
                emissiveIntensity: itemType === 'enchanted_flag' ? 0.6 : 0.2,
                side: THREE.DoubleSide,
            }),
        );
        cloth.rotation.y = Math.PI / 4;
        cloth.position.set(0.15, 0.45, 0);
        group.add(cloth);
        mesh = group;
    } else {
        mesh = new THREE.Mesh(
            new THREE.SphereGeometry(info.size, 6, 6),
            new THREE.MeshStandardMaterial({ color: info.color, emissive: info.color, emissiveIntensity: 0.3 }),
        );
    }
    return mesh;
}

function spawnItem(itemType, gx, gz, scene) {
    const pos = gridToWorld(gx, gz);
    const mesh = createItemMesh(itemType);
    mesh.position.copy(pos);
    mesh.position.y = 0.5;
    scene.add(mesh);
    const item = { type: itemType, mesh, gx, gz, progress: 0, moving: false };
    activeItems.push(item);
    return item;
}

// ── Machine Update Logic ──
export function updateMachines(dt, scene, gameState) {
    // Update sources
    for (let z = 0; z < GRID_SIZE; z++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = grid[z][x];
            if (!cell) continue;

            const baseType = cell.type.startsWith('source_') ? 'source' : cell.type;

            if (baseType === 'source') {
                cell.timer += dt;
                if (cell.timer >= RESOURCE_SPAWN_INTERVAL && !cell.outputItem) {
                    cell.timer = 0;
                    cell.outputItem = spawnItem(cell.resourceType, x, z, scene);
                }
            } else if (baseType === 'crafter') {
                updateProcessor(cell, RECIPES.crafter, 2.5, dt, scene, gameState);
            } else if (baseType === 'enchanter') {
                updateProcessor(cell, RECIPES.enchanter, 4, dt, scene, gameState);
            } else if (baseType === 'assembler') {
                updateProcessor(cell, RECIPES.assembler, 6, dt, scene, gameState);
            } else if (baseType === 'seller') {
                updateSeller(cell, dt, scene, gameState);
            }

            // Animate enchanter crystal float
            if (baseType === 'enchanter' && cell.mesh.children.length > 1) {
                const crys = cell.mesh.children[1];
                if (crys.userData.floatPhase !== undefined) {
                    crys.userData.floatPhase += dt * 2;
                    crys.position.y = 1.2 + Math.sin(crys.userData.floatPhase) * 0.15;
                }
            }
            // Animate seller gear
            if (baseType === 'seller') {
                for (const child of cell.mesh.children) {
                    if (child.userData.isGear) {
                        child.rotation.z += dt * 2;
                    }
                }
            }
        }
    }

    // Move items along conveyors
    updateItemMovement(dt, scene, gameState);
}

function updateProcessor(cell, recipe, craftTime, dt, scene, gameState) {
    // Check if we have all inputs
    const needed = {};
    for (const inp of recipe.inputs) {
        needed[inp] = (needed[inp] || 0) + 1;
    }
    const have = {};
    for (const item of cell.inputBuffer) {
        have[item.type] = (have[item.type] || 0) + 1;
    }
    let ready = true;
    for (const [k, v] of Object.entries(needed)) {
        if ((have[k] || 0) < v) { ready = false; break; }
    }

    if (ready && !cell.outputItem) {
        cell.timer += dt;
        // Visual: pulse the machine
        const scale = 1 + Math.sin(cell.timer * 5) * 0.05;
        cell.mesh.scale.setScalar(scale);

        if (cell.timer >= craftTime) {
            cell.timer = 0;
            cell.mesh.scale.setScalar(1);

            // Consume inputs
            for (const inp of recipe.inputs) {
                const idx = cell.inputBuffer.findIndex(i => i.type === inp);
                if (idx >= 0) {
                    const removed = cell.inputBuffer.splice(idx, 1)[0];
                    if (removed.mesh) scene.remove(removed.mesh);
                    // Remove from activeItems
                    const ai = activeItems.indexOf(removed);
                    if (ai >= 0) activeItems.splice(ai, 1);
                }
            }

            // Produce output
            cell.outputItem = spawnItem(recipe.output, cell.gx, cell.gz, scene);
            gameState.totalProduced[recipe.output] = (gameState.totalProduced[recipe.output] || 0) + 1;
        }
    }
}

function updateSeller(cell, dt, scene, gameState) {
    if (cell.inputBuffer.length > 0 && !cell.outputItem) {
        cell.timer += dt;
        if (cell.timer >= 1.5) {
            cell.timer = 0;
            const item = cell.inputBuffer.shift();
            let gain = 1;
            if (item.type === 'flag') gain = FLAGIC_PER_FLAG;
            else if (item.type === 'enchanted_flag') gain = FLAGIC_PER_ENCHANTED;
            else if (item.type === 'pentagram') gain = FLAGIC_PER_PENTAGRAM;

            gameState.flagic += gain;
            gameState.totalFlagicEarned += gain;

            if (item.mesh) scene.remove(item.mesh);
            const ai = activeItems.indexOf(item);
            if (ai >= 0) activeItems.splice(ai, 1);

            // Particle burst
            gameState.particles.push({
                x: cell.mesh.position.x, y: 1.5, z: cell.mesh.position.z,
                text: `+${gain}`, life: 1.5, maxLife: 1.5,
            });
        }
    }
}

function updateItemMovement(dt, scene, gameState) {
    for (let z = 0; z < GRID_SIZE; z++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = grid[z][x];
            if (!cell) continue;

            // Try to push output to next cell
            if (cell.outputItem) {
                const dir = DIRECTIONS[cell.direction];
                if (!dir) continue;
                const nx = x + dir.dx;
                const nz = z + dir.dz;
                const next = getCell(nx, nz);

                if (next) {
                    const nextBase = next.type.startsWith('source_') ? 'source' : next.type;
                    if (nextBase === 'conveyor' && !next.outputItem && next.inputBuffer.length === 0) {
                        // Move to conveyor
                        next.outputItem = cell.outputItem;
                        cell.outputItem = null;
                        animateItemToCell(next.outputItem, nx, nz, dt);
                    } else if (nextBase !== 'conveyor' && nextBase !== 'source') {
                        // Push into machine input buffer (max 10)
                        if (next.inputBuffer.length < 10) {
                            next.inputBuffer.push(cell.outputItem);
                            cell.outputItem = null;
                            animateItemToCell(next.inputBuffer[next.inputBuffer.length - 1], nx, nz, dt);
                        }
                    }
                }
            }
        }
    }
}

function animateItemToCell(item, gx, gz, dt) {
    const target = gridToWorld(gx, gz);
    target.y = 0.5;
    if (item.mesh) {
        item.mesh.position.lerp(target, Math.min(1, RESOURCE_SPEED * 0.3));
    }
    item.gx = gx;
    item.gz = gz;
}

// Smooth item positions each frame
export function smoothItemPositions(dt) {
    for (const item of activeItems) {
        const target = gridToWorld(item.gx, item.gz);
        target.y = 0.5;
        if (item.mesh) {
            item.mesh.position.lerp(target, Math.min(1, dt * RESOURCE_SPEED * 2));
        }
    }
}

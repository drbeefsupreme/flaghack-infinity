import * as THREE from 'three';
import { BUILDINGS, FLAG_COLOR, FLAG_POLE_COLOR, HEAT_PER_FLAG, HEAT_PER_BUILDING, LEY_MAX_DISTANCE } from './constants.js';

export function createBuildingSystem() {
    return {
        buildings: [],
        leyLineMeshes: [],
        pentagrams: [],
        totalFlags: 0,
        totalBuildings: 0,
    };
}

function createBuildingMesh(type, position) {
    const group = new THREE.Group();
    const config = BUILDINGS[type];

    switch (type) {
        case 'flag': {
            const poleGeo = new THREE.CylinderGeometry(0.03, 0.04, 2.5, 6);
            const poleMat = new THREE.MeshStandardMaterial({ color: FLAG_POLE_COLOR });
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.y = 1.25;
            pole.castShadow = true;
            group.add(pole);
            const clothGeo = new THREE.PlaneGeometry(0.7, 0.7, 5, 5);
            clothGeo.rotateZ(Math.PI / 4);
            const clothMat = new THREE.MeshStandardMaterial({
                color: FLAG_COLOR, side: THREE.DoubleSide,
                emissive: 0x332200, emissiveIntensity: 0.2,
            });
            const cloth = new THREE.Mesh(clothGeo, clothMat);
            cloth.position.set(0.35, 2.1, 0);
            group.add(cloth);
            group.userData.cloth = cloth;
            const light = new THREE.PointLight(0xffd700, 0.6, 8);
            light.position.y = 2;
            group.add(light);
            break;
        }
        case 'tent': {
            const tentGeo = new THREE.ConeGeometry(2, 2.5, 6);
            const tentMat = new THREE.MeshStandardMaterial({
                color: 0x665533, roughness: 0.9,
            });
            const tent = new THREE.Mesh(tentGeo, tentMat);
            tent.position.y = 1.25;
            tent.castShadow = true;
            group.add(tent);
            // Warm light inside
            const warmLight = new THREE.PointLight(0xff8844, 0.5, 6);
            warmLight.position.y = 0.5;
            group.add(warmLight);
            break;
        }
        case 'workshop': {
            const baseGeo = new THREE.BoxGeometry(3, 2, 3);
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x554422, roughness: 0.85 });
            const base = new THREE.Mesh(baseGeo, baseMat);
            base.position.y = 1;
            base.castShadow = true;
            group.add(base);
            // Roof
            const roofGeo = new THREE.ConeGeometry(2.5, 1.5, 4);
            const roofMat = new THREE.MeshStandardMaterial({ color: 0x443322 });
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.y = 2.75;
            roof.rotation.y = Math.PI / 4;
            group.add(roof);
            const light = new THREE.PointLight(0xffaa44, 1, 10);
            light.position.y = 1.5;
            group.add(light);
            break;
        }
        case 'beacon': {
            const pillarGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 6);
            const pillarMat = new THREE.MeshStandardMaterial({ color: 0x887766 });
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.y = 1.5;
            group.add(pillar);
            // Glowing top
            const orbGeo = new THREE.SphereGeometry(0.3, 8, 8);
            const orbMat = new THREE.MeshStandardMaterial({
                color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 1,
            });
            const orb = new THREE.Mesh(orbGeo, orbMat);
            orb.position.y = 3.2;
            group.add(orb);
            const light = new THREE.PointLight(0xffd700, 2, 40);
            light.position.y = 3.5;
            group.add(light);
            break;
        }
        case 'wall': {
            const wallGeo = new THREE.BoxGeometry(2, 2, 0.5);
            const wallMat = new THREE.MeshStandardMaterial({ color: 0x666655, roughness: 0.9 });
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.y = 1;
            wall.castShadow = true;
            group.add(wall);
            break;
        }
        case 'decoy': {
            // Fake flag that attracts patrols
            const poleGeo = new THREE.CylinderGeometry(0.03, 0.04, 2, 6);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x887766 });
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.y = 1;
            group.add(pole);
            const clothGeo = new THREE.PlaneGeometry(0.5, 0.5);
            clothGeo.rotateZ(Math.PI / 4);
            const clothMat = new THREE.MeshStandardMaterial({
                color: 0xccaa44, side: THREE.DoubleSide,
                transparent: true, opacity: 0.7,
            });
            const cloth = new THREE.Mesh(clothGeo, clothMat);
            cloth.position.set(0.25, 1.6, 0);
            group.add(cloth);
            break;
        }
    }

    group.position.copy(position);
    group.position.y = 0;
    return group;
}

export function placeBuilding(buildSystem, scene, type, position, inventory) {
    const config = BUILDINGS[type];
    if (!config) return false;

    // Check costs
    if (config.cost.wood && (inventory.wood || 0) < config.cost.wood) return false;
    if (config.cost.cloth && (inventory.cloth || 0) < config.cost.cloth) return false;
    if (config.cost.crystal && (inventory.crystal || 0) < config.cost.crystal) return false;

    // Deduct costs
    if (config.cost.wood) inventory.wood -= config.cost.wood;
    if (config.cost.cloth) inventory.cloth -= config.cost.cloth;
    if (config.cost.crystal) inventory.crystal -= config.cost.crystal;

    const mesh = createBuildingMesh(type, position);
    scene.add(mesh);

    const building = {
        type,
        mesh,
        position: position.clone(),
        hp: config.hp,
        maxHp: config.hp,
        config,
    };
    buildSystem.buildings.push(building);

    if (type === 'flag') buildSystem.totalFlags++;
    buildSystem.totalBuildings++;

    // Rebuild ley lines for flags
    rebuildLeyLines(buildSystem, scene);

    return true;
}

export function destroyBuilding(buildSystem, scene, building) {
    scene.remove(building.mesh);
    const idx = buildSystem.buildings.indexOf(building);
    if (idx !== -1) buildSystem.buildings.splice(idx, 1);
    if (building.type === 'flag') buildSystem.totalFlags--;
    rebuildLeyLines(buildSystem, scene);
}

export function updateBuildings(buildSystem, time) {
    for (const b of buildSystem.buildings) {
        // Animate flag cloth
        if (b.type === 'flag' && b.mesh.userData.cloth) {
            const cloth = b.mesh.userData.cloth;
            const pos = cloth.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const d = Math.sqrt(x * x + y * y);
                pos.setZ(i, Math.sin(time * 3 + b.position.x + d * 2) * 0.04 * d);
            }
            pos.needsUpdate = true;
        }
    }

    // Animate ley lines
    for (const m of buildSystem.leyLineMeshes) {
        if (m.material && m.material.opacity !== undefined) {
            m.material.opacity = 0.3 + Math.sin(time * 2) * 0.15;
        }
    }
}

function rebuildLeyLines(buildSystem, scene) {
    for (const m of buildSystem.leyLineMeshes) scene.remove(m);
    buildSystem.leyLineMeshes = [];
    buildSystem.pentagrams = [];

    const flags = buildSystem.buildings.filter(b => b.type === 'flag');
    if (flags.length < 2) return;

    const edges = [];
    for (let i = 0; i < flags.length; i++) {
        for (let j = i + 1; j < flags.length; j++) {
            const dist = flags[i].position.distanceTo(flags[j].position);
            if (dist < LEY_MAX_DISTANCE) {
                edges.push({ a: i, b: j, dist });
                const points = [
                    new THREE.Vector3(flags[i].position.x, 0.3, flags[i].position.z),
                    new THREE.Vector3(flags[j].position.x, 0.3, flags[j].position.z),
                ];
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                const mat = new THREE.LineBasicMaterial({
                    color: 0xaa44ff, transparent: true, opacity: 0.4,
                    blending: THREE.AdditiveBlending,
                });
                const line = new THREE.Line(geo, mat);
                scene.add(line);
                buildSystem.leyLineMeshes.push(line);
            }
        }
    }

    // Pentagram detection (simplified)
    if (flags.length >= 5) {
        const adj = new Map();
        for (let i = 0; i < flags.length; i++) adj.set(i, new Set());
        for (const e of edges) { adj.get(e.a).add(e.b); adj.get(e.b).add(e.a); }

        const maxCheck = Math.min(flags.length, 20);
        for (let a = 0; a < maxCheck; a++) {
            for (let b = a + 1; b < maxCheck; b++) {
                if (!adj.get(a).has(b)) continue;
                for (let c = b + 1; c < maxCheck; c++) {
                    if (!adj.get(a).has(c) || !adj.get(b).has(c)) continue;
                    for (let d = c + 1; d < maxCheck; d++) {
                        if (!adj.get(a).has(d) || !adj.get(b).has(d) || !adj.get(c).has(d)) continue;
                        for (let e = d + 1; e < maxCheck; e++) {
                            if (!adj.get(a).has(e) || !adj.get(b).has(e) || !adj.get(c).has(e) || !adj.get(d).has(e)) continue;
                            const indices = [a, b, c, d, e];
                            const center = new THREE.Vector3();
                            for (const i of indices) center.add(flags[i].position);
                            center.divideScalar(5); center.y = 0;
                            buildSystem.pentagrams.push({ center, indices });

                            const ring = new THREE.Mesh(
                                new THREE.TorusGeometry(3, 0.1, 8, 32),
                                new THREE.MeshStandardMaterial({
                                    color: 0xffd700, emissive: 0xff8800, emissiveIntensity: 0.6,
                                    transparent: true, opacity: 0.5,
                                })
                            );
                            ring.position.copy(center); ring.position.y = 0.2;
                            ring.rotation.x = -Math.PI / 2;
                            scene.add(ring);
                            buildSystem.leyLineMeshes.push(ring);
                        }
                    }
                }
            }
        }
    }
}

export function getHeatFromBuildings(buildSystem) {
    return buildSystem.totalFlags * HEAT_PER_FLAG + (buildSystem.totalBuildings - buildSystem.totalFlags) * HEAT_PER_BUILDING;
}

export function getSanctuaryPower(buildSystem) {
    return buildSystem.totalFlags + buildSystem.pentagrams.length * 5;
}

export function getDecoyPositions(buildSystem) {
    return buildSystem.buildings
        .filter(b => b.type === 'decoy')
        .map(b => b.position.clone());
}

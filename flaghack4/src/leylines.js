import * as THREE from 'three';
import {
    LEY_MAX_DISTANCE, LEY_LINE_COLOR_A, LEY_LINE_COLOR_B,
    PENTAGRAM_LINE_COLOR_A, PENTAGRAM_LINE_COLOR_B,
    PENTAGRAM_RADIUS_TOLERANCE, PENTAGRAM_ANGLE_TOLERANCE,
    PENTAGRAM_CENTER_RADIUS, FLAGIC_GAIN_RATE, MAX_FLAGIC,
    GEOMANTICA, SCORE_PENTAGRAM_FORM
} from './constants.js';

export function createLeyLineSystem() {
    return {
        lines: [],       // THREE.Line objects
        pentagrams: [],  // { flags: [5], center, radius, geomantica, mesh }
        lineMeshes: [],
        lastFlagCount: 0,
    };
}

function computeLeyLines(flags) {
    const lines = [];
    for (let i = 0; i < flags.length; i++) {
        for (let j = i + 1; j < flags.length; j++) {
            const dist = flags[i].position.distanceTo(flags[j].position);
            if (dist < LEY_MAX_DISTANCE) {
                lines.push({ a: i, b: j, dist });
            }
        }
    }
    return lines;
}

function detectPentagrams(flags, edges) {
    if (flags.length < 5) return [];

    // Build adjacency
    const adj = new Map();
    for (let i = 0; i < flags.length; i++) adj.set(i, new Set());
    for (const e of edges) {
        adj.get(e.a).add(e.b);
        adj.get(e.b).add(e.a);
    }

    const pentagrams = [];
    const maxCheck = Math.min(flags.length, 25); // performance cap

    // Find 5-cliques
    for (let a = 0; a < maxCheck; a++) {
        const na = adj.get(a);
        for (let b = a + 1; b < maxCheck; b++) {
            if (!na.has(b)) continue;
            const nb = adj.get(b);
            for (let c = b + 1; c < maxCheck; c++) {
                if (!na.has(c) || !nb.has(c)) continue;
                const nc = adj.get(c);
                for (let d = c + 1; d < maxCheck; d++) {
                    if (!na.has(d) || !nb.has(d) || !nc.has(d)) continue;
                    const nd = adj.get(d);
                    for (let e = d + 1; e < maxCheck; e++) {
                        if (!na.has(e) || !nb.has(e) || !nc.has(e) || !nd.has(e)) continue;

                        const indices = [a, b, c, d, e];
                        const positions = indices.map(i => flags[i].position);
                        const center = new THREE.Vector3();
                        for (const p of positions) center.add(p);
                        center.divideScalar(5);
                        center.y = 0;

                        // Check roughly equal distance from center
                        const radii = positions.map(p => {
                            const dx = p.x - center.x;
                            const dz = p.z - center.z;
                            return Math.sqrt(dx * dx + dz * dz);
                        });
                        const avgR = radii.reduce((s, r) => s + r, 0) / 5;
                        if (avgR < 2) continue;
                        const radiusOk = radii.every(r => Math.abs(r - avgR) / avgR < PENTAGRAM_RADIUS_TOLERANCE);
                        if (!radiusOk) continue;

                        // Check roughly equal angular spacing
                        const angles = positions.map(p => Math.atan2(p.z - center.z, p.x - center.x));
                        angles.sort((a, b) => a - b);
                        const gaps = [];
                        for (let i = 0; i < 5; i++) {
                            let gap = angles[(i + 1) % 5] - angles[i];
                            if (gap < 0) gap += Math.PI * 2;
                            gaps.push(gap);
                        }
                        const targetGap = Math.PI * 2 / 5;
                        const anglesOk = gaps.every(g => Math.abs(g - targetGap) < PENTAGRAM_ANGLE_TOLERANCE);
                        if (!anglesOk) continue;

                        // Determine Geomantica type based on flag order hash
                        const hash = indices.reduce((h, i) => h ^ (i * 2654435761), 0);
                        const geoIdx = Math.abs(hash) % GEOMANTICA.length;

                        pentagrams.push({
                            flagIndices: indices,
                            flags: indices.map(i => flags[i]),
                            center,
                            radius: avgR,
                            geomantica: GEOMANTICA[geoIdx],
                            geoIndex: geoIdx,
                        });
                    }
                }
            }
        }
    }
    return pentagrams;
}

export function updateLeyLines(leySystem, flagSystem, scene, player, dt, time, gameState) {
    const flags = flagSystem.groundFlags;

    // Rebuild if flag count changed
    const needsRebuild = flags.length !== leySystem.lastFlagCount;
    leySystem.lastFlagCount = flags.length;

    if (needsRebuild) {
        // Clear old meshes
        for (const m of leySystem.lineMeshes) scene.remove(m);
        leySystem.lineMeshes = [];

        const edges = computeLeyLines(flags);
        const oldPentCount = leySystem.pentagrams.length;
        leySystem.pentagrams = detectPentagrams(flags, edges);

        // Score new pentagrams
        if (leySystem.pentagrams.length > oldPentCount) {
            const newCount = leySystem.pentagrams.length - oldPentCount;
            gameState.score += SCORE_PENTAGRAM_FORM * newCount;
        }

        // Collect pentagram edges
        const pentEdges = new Set();
        for (const p of leySystem.pentagrams) {
            for (let i = 0; i < 5; i++) {
                for (let j = i + 1; j < 5; j++) {
                    const key = Math.min(p.flagIndices[i], p.flagIndices[j]) + ',' + Math.max(p.flagIndices[i], p.flagIndices[j]);
                    pentEdges.add(key);
                }
            }
        }

        // Draw ley lines
        for (const e of edges) {
            const key = Math.min(e.a, e.b) + ',' + Math.max(e.a, e.b);
            const isPent = pentEdges.has(key);
            const intensity = 1 - e.dist / LEY_MAX_DISTANCE;

            const points = [
                new THREE.Vector3(flags[e.a].position.x, 0.3, flags[e.a].position.z),
                new THREE.Vector3(flags[e.b].position.x, 0.3, flags[e.b].position.z),
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const color = isPent ? PENTAGRAM_LINE_COLOR_A : LEY_LINE_COLOR_A;
            const mat = new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity: 0.4 + intensity * 0.5,
                blending: THREE.AdditiveBlending,
            });
            const line = new THREE.Line(geo, mat);
            scene.add(line);
            leySystem.lineMeshes.push(line);
        }

        // Draw pentagram center markers
        for (const p of leySystem.pentagrams) {
            const ringGeo = new THREE.TorusGeometry(p.radius * 0.3, 0.1, 8, 32);
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                emissive: 0xff8800,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.5,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(p.center);
            ring.position.y = 0.2;
            ring.rotation.x = -Math.PI / 2;
            scene.add(ring);
            leySystem.lineMeshes.push(ring);
        }
    }

    // Animate ley line colors
    for (const m of leySystem.lineMeshes) {
        if (m.material && m.material.isLineBasicMaterial) {
            const t = (Math.sin(time * 2) + 1) / 2;
            const colorA = new THREE.Color(LEY_LINE_COLOR_A);
            const colorB = new THREE.Color(LEY_LINE_COLOR_B);
            m.material.color.copy(colorA).lerp(colorB, t);
        }
    }

    // Flagic generation from pentagrams
    const playerPos = player.mesh.position;
    let inPentagram = false;
    let activePentagram = null;

    for (const p of leySystem.pentagrams) {
        const dist = new THREE.Vector2(playerPos.x - p.center.x, playerPos.z - p.center.z).length();
        if (dist < PENTAGRAM_CENTER_RADIUS) {
            inPentagram = true;
            activePentagram = p;
            let rate = FLAGIC_GAIN_RATE;
            if (p.geomantica.effect === 'flagic_boost') rate *= 2;
            player.flagic = Math.min(MAX_FLAGIC, player.flagic + rate * dt);
            break;
        }
    }

    return { inPentagram, activePentagram };
}

export function getPentagramsInRange(leySystem, position, range) {
    return leySystem.pentagrams.filter(p => {
        const dx = position.x - p.center.x;
        const dz = position.z - p.center.z;
        return Math.sqrt(dx * dx + dz * dz) < range;
    });
}

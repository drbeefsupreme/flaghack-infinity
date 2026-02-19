import * as THREE from 'three';
import {
    FLAG_COLOR, FLAG_ALIGNED_COLOR, FLAG_MISALIGNED_COLOR,
    FOOP_TYPES, LEY_FACET_COUNT, LEY_FACET_COLORS,
    LEY_MAX_DISTANCE, ALIGNMENT_THRESHOLD, WORLD_SIZE,
    PENTAGRAM_MIN_FLAGS, PENTAGRAM_ACTIVATION_RANGE,
} from './constants.js';

// ── Flag Creation ──
export function createFlag(scene, x, z, isAligned = false, foopType = null) {
    const group = new THREE.Group();

    // Pole - furring lumber
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.06, 3.5, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.75;
    pole.castShadow = true;
    group.add(pole);

    // Cloth - diamond-shaped (rotated square), 30x36 duck canvas
    const clothGeo = new THREE.PlaneGeometry(0.9, 1.1, 5, 5);
    clothGeo.rotateZ(Math.PI / 4);
    const clothMat = new THREE.MeshStandardMaterial({
        color: isAligned ? FLAG_ALIGNED_COLOR : FLAG_COLOR,
        side: THREE.DoubleSide,
        emissive: isAligned ? 0x664400 : 0x332200,
        emissiveIntensity: isAligned ? 0.5 : 0.2,
    });
    const cloth = new THREE.Mesh(clothGeo, clothMat);
    cloth.position.set(0.45, 3.0, 0);
    group.add(cloth);

    // Alignment glow (visible when aligned)
    const glowLight = new THREE.PointLight(FLAG_ALIGNED_COLOR, isAligned ? 1.5 : 0, 8);
    glowLight.position.y = 3;
    group.add(glowLight);

    group.position.set(x, 0, z);

    // Apply FOOP tilt if misaligned
    if (foopType !== null) {
        const foop = FOOP_TYPES[foopType];
        if (foop.angle > 0) {
            group.rotation.z = foop.angle;
            group.rotation.y = Math.random() * Math.PI * 2;
        }
        if (foopType === 4) { // Buried
            group.position.y = -1;
        }
    }

    scene.add(group);

    return {
        mesh: group,
        cloth,
        glowLight,
        x, z,
        isAligned,
        isFoop: foopType !== null,
        foopType,
        foopFixed: false,
        assignedWorker: null,
        leyFacet: -1, // which facet this flag aligns to (-1 = none)
        alignmentScore: 0,
    };
}

// ── FOOP Spawning ──
export function spawnFoops(scene, flags, count, structures) {
    const newFlags = [];
    for (let i = 0; i < count; i++) {
        let x, z;
        // FOOPs tend to appear near structures
        if (structures.length > 0 && Math.random() < 0.6) {
            const s = structures[Math.floor(Math.random() * structures.length)];
            x = s.worldPos.x + (Math.random() - 0.5) * 10;
            z = s.worldPos.z + (Math.random() - 0.5) * 10;
        } else {
            x = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
            z = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
        }
        const foopType = Math.floor(Math.random() * FOOP_TYPES.length);
        const flag = createFlag(scene, x, z, false, foopType);
        flags.push(flag);
        newFlags.push(flag);
    }
    return newFlags;
}

// ── Flag Fixing / Alignment ──
export function fixFoop(flag) {
    if (!flag.isFoop || flag.foopFixed) return false;
    flag.foopFixed = true;
    flag.isFoop = false;
    flag.foopType = null;

    // Straighten
    flag.mesh.rotation.z = 0;
    flag.mesh.rotation.y = 0;
    flag.mesh.position.y = 0;

    return true;
}

export function alignFlag(flag, leyFacets) {
    if (flag.isFoop || flag.isAligned) return false;

    // Find nearest ley facet line
    let bestFacet = -1;
    let bestScore = 0;

    for (let i = 0; i < leyFacets.length; i++) {
        const facet = leyFacets[i];
        const score = computeAlignmentScore(flag, facet);
        if (score > bestScore) {
            bestScore = score;
            bestFacet = i;
        }
    }

    flag.alignmentScore = bestScore;

    if (bestScore >= ALIGNMENT_THRESHOLD && bestFacet >= 0) {
        flag.isAligned = true;
        flag.leyFacet = bestFacet;
        flag.cloth.material.color.setHex(FLAG_ALIGNED_COLOR);
        flag.cloth.material.emissive.setHex(0x664400);
        flag.cloth.material.emissiveIntensity = 0.5;
        flag.glowLight.intensity = 1.5;
        flag.glowLight.color.setHex(LEY_FACET_COLORS[bestFacet % LEY_FACET_COLORS.length]);
        return true;
    }
    return false;
}

function computeAlignmentScore(flag, facet) {
    // Score based on proximity to ley facet line
    const dx = flag.x - facet.origin.x;
    const dz = flag.z - facet.origin.z;
    const projLen = dx * facet.dir.x + dz * facet.dir.z;
    const perpDist = Math.abs(dx * facet.dir.z - dz * facet.dir.x);

    // Score decays with perpendicular distance
    if (perpDist > LEY_MAX_DISTANCE * 0.3) return 0;
    return Math.max(0, 1 - perpDist / (LEY_MAX_DISTANCE * 0.3));
}

// ── Ley Facets (5th dimensional alignment lines) ──
export function createLeyFacets(scene) {
    const facets = [];
    const facetVisuals = new THREE.Group();

    for (let i = 0; i < LEY_FACET_COUNT; i++) {
        const angle = (i / LEY_FACET_COUNT) * Math.PI * 2 - Math.PI / 2;
        const origin = new THREE.Vector3(0, 0, 0);
        const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));

        facets.push({ origin, dir, angle, index: i });

        // Visual line extending from center
        const lineMat = new THREE.LineBasicMaterial({
            color: LEY_FACET_COLORS[i],
            transparent: true, opacity: 0.15,
        });
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
                Math.cos(angle) * -WORLD_SIZE * 0.5, 0.2,
                Math.sin(angle) * -WORLD_SIZE * 0.5
            ),
            new THREE.Vector3(
                Math.cos(angle) * WORLD_SIZE * 0.5, 0.2,
                Math.sin(angle) * WORLD_SIZE * 0.5
            ),
        ]);
        facetVisuals.add(new THREE.Line(lineGeo, lineMat));
    }

    scene.add(facetVisuals);
    return { facets, visuals: facetVisuals };
}

// ── Ley Lines between aligned flags ──
export function updateLeyLines(scene, flags, leyLineGroup) {
    // Clear old
    while (leyLineGroup.children.length) {
        leyLineGroup.remove(leyLineGroup.children[0]);
    }

    const aligned = flags.filter(f => f.isAligned);
    const mat = new THREE.LineBasicMaterial({
        color: 0xffd700, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending,
    });

    const connections = [];
    for (let i = 0; i < aligned.length; i++) {
        for (let j = i + 1; j < aligned.length; j++) {
            const dx = aligned[i].x - aligned[j].x;
            const dz = aligned[i].z - aligned[j].z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < LEY_MAX_DISTANCE) {
                const geo = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(aligned[i].x, 0.5, aligned[i].z),
                    new THREE.Vector3(aligned[j].x, 0.5, aligned[j].z),
                ]);
                leyLineGroup.add(new THREE.Line(geo, mat));
                connections.push([i, j]);
            }
        }
    }

    return connections;
}

// ── Pentagram Detection ──
export function detectPentagrams(flags) {
    const aligned = flags.filter(f => f.isAligned);
    if (aligned.length < PENTAGRAM_MIN_FLAGS) return [];

    // Build adjacency
    const adj = aligned.map(() => []);
    for (let i = 0; i < aligned.length; i++) {
        for (let j = i + 1; j < aligned.length; j++) {
            const dx = aligned[i].x - aligned[j].x;
            const dz = aligned[i].z - aligned[j].z;
            if (Math.sqrt(dx * dx + dz * dz) < PENTAGRAM_ACTIVATION_RANGE) {
                adj[i].push(j);
                adj[j].push(i);
            }
        }
    }

    // Find 5-cliques (brute force, capped)
    const pentagrams = [];
    const limit = Math.min(aligned.length, 20);
    for (let a = 0; a < limit; a++) {
        for (const b of adj[a]) {
            if (b <= a || b >= limit) continue;
            for (const c of adj[b]) {
                if (c <= b || c >= limit || !adj[a].includes(c)) continue;
                for (const d of adj[c]) {
                    if (d <= c || d >= limit || !adj[a].includes(d) || !adj[b].includes(d)) continue;
                    for (const e of adj[d]) {
                        if (e <= d || e >= limit || !adj[a].includes(e) || !adj[b].includes(e) || !adj[c].includes(e)) continue;
                        pentagrams.push([a, b, c, d, e].map(i => aligned[i]));
                    }
                }
            }
        }
    }
    return pentagrams;
}

// ── Flag cloth wave animation ──
export function animateFlags(flags, time) {
    for (const flag of flags) {
        if (!flag.cloth) continue;
        const pos = flag.cloth.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const d = Math.sqrt(x * x + y * y);
            pos.setZ(i, Math.sin(time * 3 + d * 2 + flag.x * 0.5) * 0.04 * d);
        }
        pos.needsUpdate = true;

        // Aligned glow pulse
        if (flag.isAligned) {
            flag.glowLight.intensity = 1 + Math.sin(time * 2 + flag.x) * 0.5;
        }
    }
}

import * as THREE from 'three';
import { FLAG_COLOR, FLAG_POLE_COLOR, LEY_MAX_DISTANCE } from './constants.js';

export function createFlagSystem() {
    return {
        placedFlags: [],
        leyLineMeshes: [],
        pentagrams: [],
    };
}

export function placeFlag(flagSystem, scene, position) {
    const group = new THREE.Group();

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.04, 2.2, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: FLAG_POLE_COLOR });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.1;
    pole.castShadow = true;
    group.add(pole);

    // Diamond cloth
    const clothGeo = new THREE.PlaneGeometry(0.65, 0.65, 5, 5);
    clothGeo.rotateZ(Math.PI / 4);
    const clothMat = new THREE.MeshStandardMaterial({
        color: FLAG_COLOR, side: THREE.DoubleSide,
        emissive: 0x332200, emissiveIntensity: 0.2,
    });
    const cloth = new THREE.Mesh(clothGeo, clothMat);
    cloth.position.set(0.3, 1.8, 0);
    group.add(cloth);

    // Glow
    const light = new THREE.PointLight(0xffd700, 0.8, 6);
    light.position.y = 1.5;
    group.add(light);

    group.position.copy(position);
    group.position.y = 0;
    scene.add(group);

    const flag = {
        mesh: group,
        cloth,
        position: position.clone(),
        phase: Math.random() * Math.PI * 2,
    };
    flagSystem.placedFlags.push(flag);

    // Rebuild ley lines
    rebuildLeyLines(flagSystem, scene);

    return flag;
}

export function updateFlags(flagSystem, dt, time) {
    for (const flag of flagSystem.placedFlags) {
        // Animate cloth
        const pos = flag.cloth.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            pos.setZ(i, Math.sin(time * 3 + flag.phase + dist * 2) * 0.04 * dist);
        }
        pos.needsUpdate = true;
    }

    // Animate ley lines
    for (const lm of flagSystem.leyLineMeshes) {
        if (lm.material) {
            const t = (Math.sin(time * 2) + 1) / 2;
            lm.material.opacity = 0.3 + t * 0.3;
        }
    }
}

function rebuildLeyLines(flagSystem, scene) {
    // Clear old
    for (const m of flagSystem.leyLineMeshes) scene.remove(m);
    flagSystem.leyLineMeshes = [];
    flagSystem.pentagrams = [];

    const flags = flagSystem.placedFlags;
    if (flags.length < 2) return;

    // Build ley lines
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
                    color: 0xaa44ff,
                    transparent: true,
                    opacity: 0.4,
                    blending: THREE.AdditiveBlending,
                });
                const line = new THREE.Line(geo, mat);
                scene.add(line);
                flagSystem.leyLineMeshes.push(line);
            }
        }
    }

    // Detect pentagrams (5-cliques)
    if (flags.length >= 5) {
        detectPentagrams(flags, edges, flagSystem, scene);
    }
}

function detectPentagrams(flags, edges, flagSystem, scene) {
    const adj = new Map();
    for (let i = 0; i < flags.length; i++) adj.set(i, new Set());
    for (const e of edges) {
        adj.get(e.a).add(e.b);
        adj.get(e.b).add(e.a);
    }

    const maxCheck = Math.min(flags.length, 20);
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

                        const radii = positions.map(p => {
                            const dx = p.x - center.x;
                            const dz = p.z - center.z;
                            return Math.sqrt(dx * dx + dz * dz);
                        });
                        const avgR = radii.reduce((s, r) => s + r, 0) / 5;
                        if (avgR < 1.5) continue;
                        if (!radii.every(r => Math.abs(r - avgR) / avgR < 0.5)) continue;

                        // Valid pentagram!
                        const ringGeo = new THREE.TorusGeometry(avgR * 0.4, 0.08, 8, 32);
                        const ringMat = new THREE.MeshStandardMaterial({
                            color: 0xffd700, emissive: 0xff8800, emissiveIntensity: 0.8,
                            transparent: true, opacity: 0.5,
                        });
                        const ring = new THREE.Mesh(ringGeo, ringMat);
                        ring.position.copy(center);
                        ring.position.y = 0.15;
                        ring.rotation.x = -Math.PI / 2;
                        scene.add(ring);
                        flagSystem.leyLineMeshes.push(ring);

                        flagSystem.pentagrams.push({ center, radius: avgR, indices });
                    }
                }
            }
        }
    }
}

export function removeAllFlags(flagSystem, scene) {
    for (const f of flagSystem.placedFlags) {
        scene.remove(f.mesh);
    }
    for (const m of flagSystem.leyLineMeshes) {
        scene.remove(m);
    }
    flagSystem.placedFlags = [];
    flagSystem.leyLineMeshes = [];
    flagSystem.pentagrams = [];
}

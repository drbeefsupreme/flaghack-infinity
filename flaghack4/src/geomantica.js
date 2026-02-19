import * as THREE from 'three';
import { GEOMANTICA } from './constants.js';
import { damageHippie } from './hippies.js';
import { healEffigy } from './effigy.js';

// Geomantica effects applied by pentagrams as tower-like defenses
export function createGeomanticaSystem() {
    return {
        activeEffects: [], // { pentagram, timer, visuals[] }
        effectMeshes: [],
    };
}

export function updateGeomantica(geoSystem, leySystem, hippieSystem, effigy, flagSystem, scene, gameState, dt, time) {
    // Clear old effect meshes
    for (const m of geoSystem.effectMeshes) scene.remove(m);
    geoSystem.effectMeshes = [];

    for (const pent of leySystem.pentagrams) {
        const geo = pent.geomantica;
        const center = pent.center;
        const range = pent.radius * 3;

        switch (geo.effect) {
            case 'damage_aura': {
                // Burns nearby hippies
                for (const h of hippieSystem.hippies) {
                    if (h.hp <= 0) continue;
                    const dist = center.distanceTo(h.mesh.position);
                    if (dist < range) {
                        damageHippie(h, geo.power * dt * 3, gameState);
                    }
                }
                // Visual: pulsing ring
                const ringGeo = new THREE.RingGeometry(range * 0.8, range, 32);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xff4400,
                    transparent: true,
                    opacity: 0.1 + Math.sin(time * 3) * 0.05,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.copy(center);
                ring.position.y = 0.2;
                ring.rotation.x = -Math.PI / 2;
                scene.add(ring);
                geoSystem.effectMeshes.push(ring);
                break;
            }

            case 'knockback': {
                // Push enemies away
                for (const h of hippieSystem.hippies) {
                    if (h.hp <= 0) continue;
                    const dx = h.mesh.position.x - center.x;
                    const dz = h.mesh.position.z - center.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < range && dist > 0) {
                        const force = geo.power * 2 * dt / Math.max(dist, 1);
                        h.mesh.position.x += (dx / dist) * force;
                        h.mesh.position.z += (dz / dist) * force;
                        damageHippie(h, geo.power * dt, gameState);
                    }
                }
                break;
            }

            case 'flag_gen': {
                // Handled in main loop - grants bonus flags periodically
                break;
            }

            case 'ley_boost': {
                // Amplified ley line damage - damage enemies crossing ley lines near this pentagram
                for (const h of hippieSystem.hippies) {
                    if (h.hp <= 0) continue;
                    const dist = center.distanceTo(h.mesh.position);
                    if (dist < range) {
                        damageHippie(h, geo.power * dt * 2, gameState);
                    }
                }
                // Visual: brighter ley lines (handled in ley line rendering)
                break;
            }

            case 'heal_effigy': {
                const dist = center.distanceTo(effigy.position);
                if (dist < range * 2) {
                    healEffigy(effigy, geo.power * dt * 0.5);
                }
                // Visual: green particles toward effigy
                const healGeo = new THREE.SphereGeometry(0.2, 4, 4);
                const healMat = new THREE.MeshBasicMaterial({
                    color: 0x44ff44,
                    transparent: true,
                    opacity: 0.3 + Math.sin(time * 5) * 0.2,
                    blending: THREE.AdditiveBlending,
                });
                const healOrb = new THREE.Mesh(healGeo, healMat);
                const t = (time % 2) / 2;
                healOrb.position.lerpVectors(center, effigy.position, t);
                healOrb.position.y = 1 + Math.sin(t * Math.PI) * 2;
                scene.add(healOrb);
                geoSystem.effectMeshes.push(healOrb);
                break;
            }

            case 'slow': {
                // Slow enemies in range
                for (const h of hippieSystem.hippies) {
                    if (h.hp <= 0) continue;
                    const dist = center.distanceTo(h.mesh.position);
                    if (dist < range) {
                        h.speed = h.speed * 0.95; // cumulative per-frame slow
                    }
                }
                // Visual: blue ground ring
                const slowGeo = new THREE.RingGeometry(range * 0.9, range, 32);
                const slowMat = new THREE.MeshBasicMaterial({
                    color: 0x4444ff,
                    transparent: true,
                    opacity: 0.08,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                });
                const slowRing = new THREE.Mesh(slowGeo, slowMat);
                slowRing.position.copy(center);
                slowRing.position.y = 0.15;
                slowRing.rotation.x = -Math.PI / 2;
                scene.add(slowRing);
                geoSystem.effectMeshes.push(slowRing);
                break;
            }

            case 'flagic_boost': {
                // Handled in leylines.js (doubles flagic gain rate)
                break;
            }

            case 'chain': {
                // Nearby pentagrams share power - find nearby pentagrams and boost their effects
                // Visual: connecting lines between nearby pentagrams
                for (const other of leySystem.pentagrams) {
                    if (other === pent) continue;
                    const dist = center.distanceTo(other.center);
                    if (dist < range * 2) {
                        const points = [
                            new THREE.Vector3(center.x, 0.5, center.z),
                            new THREE.Vector3(other.center.x, 0.5, other.center.z),
                        ];
                        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                        const lineMat = new THREE.LineBasicMaterial({
                            color: 0xffd700,
                            transparent: true,
                            opacity: 0.3,
                            blending: THREE.AdditiveBlending,
                        });
                        const line = new THREE.Line(lineGeo, lineMat);
                        scene.add(line);
                        geoSystem.effectMeshes.push(line);
                    }
                }
                break;
            }
        }
    }
}

export function getGeomanticaInfo(pentagram) {
    if (!pentagram || !pentagram.geomantica) return null;
    return pentagram.geomantica;
}

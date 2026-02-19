import * as THREE from 'three';
import { PICKUP_TYPES, MAX_FLAGIC, PENTAGRAM_FLAGIC_GAIN, CHAKRAS } from './constants.js';

export function createPickupMesh(pickup) {
    const config = PICKUP_TYPES[pickup.type];
    const group = new THREE.Group();

    if (pickup.type === 'FLAG') {
        // Miniature flag
        const poleGeo = new THREE.CylinderGeometry(0.02, 0.03, 1.2, 4);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 0.6;
        group.add(pole);
        const clothGeo = new THREE.PlaneGeometry(0.4, 0.4);
        clothGeo.rotateZ(Math.PI / 4);
        const clothMat = new THREE.MeshStandardMaterial({
            color: 0xffd700, side: THREE.DoubleSide,
            emissive: 0x443300, emissiveIntensity: 0.4,
        });
        const cloth = new THREE.Mesh(clothGeo, clothMat);
        cloth.position.set(0.2, 1.05, 0);
        group.add(cloth);
    } else if (pickup.type === 'CRYSTAL') {
        const geo = new THREE.OctahedronGeometry(0.4, 0);
        const mat = new THREE.MeshStandardMaterial({
            color: config.color, emissive: config.glow,
            emissiveIntensity: 0.8, transparent: true, opacity: 0.8,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.8;
        group.add(mesh);
    } else {
        // Orb pickup
        const geo = new THREE.SphereGeometry(0.3, 8, 8);
        const mat = new THREE.MeshStandardMaterial({
            color: config.color, emissive: config.glow,
            emissiveIntensity: 0.6, transparent: true, opacity: 0.8,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.6;
        group.add(mesh);
    }

    // Glow light
    const light = new THREE.PointLight(config.glow, 1, 5);
    light.position.y = 0.8;
    group.add(light);

    group.position.copy(pickup.position);
    return group;
}

export function updatePickups(pickups, player, scene, gameState, currentRoomIdx) {
    const collected = [];

    for (const p of pickups) {
        if (p.collected || p.roomIdx !== currentRoomIdx) continue;

        // Spawn mesh if needed
        if (!p.mesh) {
            p.mesh = createPickupMesh(p);
            scene.add(p.mesh);
        }

        // Bobbing animation
        if (p.mesh) {
            p.mesh.position.y = p.position.y + Math.sin(performance.now() * 0.003 + p.position.x) * 0.2;
            p.mesh.rotation.y += 0.02;
        }

        // Collection check
        const dist = player.mesh.position.distanceTo(p.position);
        if (dist < 2) {
            p.collected = true;
            if (p.mesh) {
                scene.remove(p.mesh);
                p.mesh = null;
            }

            switch (p.type) {
                case 'FLAG':
                    player.flags += 2;
                    collected.push({ type: 'FLAG', text: '+2 Flags' });
                    break;
                case 'CRYSTAL':
                    player.crystals++;
                    gameState.crystals++;
                    collected.push({ type: 'CRYSTAL', text: 'Crystal of Implied Flag!' });
                    break;
                case 'HEALTH':
                    player.hp = Math.min(player.maxHp, player.hp + 30);
                    collected.push({ type: 'HEALTH', text: '+30 HP' });
                    break;
                case 'FLAGIC':
                    const max = player.chakras[6] ? MAX_FLAGIC * 2 : MAX_FLAGIC;
                    let gain = PENTAGRAM_FLAGIC_GAIN;
                    if (player.chakras[6]) gain *= CHAKRAS[6].bonus;
                    player.flagic = Math.min(max, player.flagic + gain);
                    collected.push({ type: 'FLAGIC', text: '+' + gain + ' Flagic' });
                    break;
            }
        }
    }

    return collected;
}

export function despawnPickupMeshes(pickups, currentRoomIdx, scene) {
    for (const p of pickups) {
        if (p.roomIdx !== currentRoomIdx && p.mesh) {
            scene.remove(p.mesh);
            p.mesh = null;
        }
    }
}

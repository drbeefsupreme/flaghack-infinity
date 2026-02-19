import * as THREE from 'three';
import { CAMP_COUNT, CAMP_RING_RADIUS, CAMP_SIZE } from './constants.js';

const CAMP_NAMES_ADJ = ['Cosmic', 'Blazing', 'Mystic', 'Sacred', 'Astral', 'Burning', 'Golden', 'Electric'];
const CAMP_NAMES_NOUN = ['Phoenix', 'Serpent', 'Lotus', 'Crystal', 'Nebula', 'Peyote', 'Thunder', 'Flame'];
const CAMP_NAMES_TYPE = ['Camp', 'Lodge', 'Temple', 'Circle', 'Haven'];

function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
        return (s >>> 0) / 0xFFFFFFFF;
    };
}

export function createCamps(scene) {
    const rng = seededRandom(42);
    const camps = [];

    for (let i = 0; i < CAMP_COUNT; i++) {
        const angle = (i / CAMP_COUNT) * Math.PI * 2 + 0.3;
        const cx = Math.cos(angle) * CAMP_RING_RADIUS;
        const cz = Math.sin(angle) * CAMP_RING_RADIUS;

        const name = CAMP_NAMES_ADJ[Math.floor(rng() * CAMP_NAMES_ADJ.length)] + ' ' +
                     CAMP_NAMES_NOUN[Math.floor(rng() * CAMP_NAMES_NOUN.length)] + ' ' +
                     CAMP_NAMES_TYPE[Math.floor(rng() * CAMP_NAMES_TYPE.length)];

        const campGroup = new THREE.Group();
        campGroup.position.set(cx, 0, cz);

        // Tents
        const tentCount = 2 + Math.floor(rng() * 3);
        for (let t = 0; t < tentCount; t++) {
            const tentAngle = rng() * Math.PI * 2;
            const tentDist = 3 + rng() * (CAMP_SIZE * 0.4);
            const tentGeo = new THREE.ConeGeometry(1.5 + rng(), 2 + rng(), 4 + Math.floor(rng() * 3));
            const tentMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(rng() * 0.1 + 0.05, 0.3, 0.3 + rng() * 0.3),
                roughness: 0.9,
            });
            const tent = new THREE.Mesh(tentGeo, tentMat);
            tent.position.set(
                Math.cos(tentAngle) * tentDist,
                1,
                Math.sin(tentAngle) * tentDist
            );
            tent.rotation.y = rng() * Math.PI * 2;
            tent.castShadow = true;
            tent.receiveShadow = true;
            campGroup.add(tent);
        }

        // Campfire (center)
        const fireGeo = new THREE.CylinderGeometry(0.4, 0.6, 0.3, 8);
        const fireMat = new THREE.MeshStandardMaterial({ color: 0x553311 });
        const fireBase = new THREE.Mesh(fireGeo, fireMat);
        fireBase.position.y = 0.15;
        campGroup.add(fireBase);

        // Fire light
        const fireLight = new THREE.PointLight(0xff6633, 2, 15);
        fireLight.position.set(0, 1.5, 0);
        campGroup.add(fireLight);

        // Chairs
        const chairCount = 2 + Math.floor(rng() * 3);
        for (let c = 0; c < chairCount; c++) {
            const chairAngle = (c / chairCount) * Math.PI * 2 + rng() * 0.3;
            const chairGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
            const chairMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(rng(), 0.4, 0.25),
                roughness: 0.8,
            });
            const chair = new THREE.Mesh(chairGeo, chairMat);
            chair.position.set(
                Math.cos(chairAngle) * 3,
                0.4,
                Math.sin(chairAngle) * 3
            );
            chair.rotation.y = chairAngle + Math.PI;
            chair.castShadow = true;
            campGroup.add(chair);
        }

        // Geodesic dome (30% chance)
        if (rng() < 0.3) {
            const domeGeo = new THREE.IcosahedronGeometry(3, 1);
            const domeMat = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                wireframe: true,
                transparent: true,
                opacity: 0.4,
            });
            const dome = new THREE.Mesh(domeGeo, domeMat);
            const domeAngle = rng() * Math.PI * 2;
            dome.position.set(
                Math.cos(domeAngle) * 8,
                1.5,
                Math.sin(domeAngle) * 8
            );
            campGroup.add(dome);
        }

        scene.add(campGroup);

        camps.push({
            name,
            position: new THREE.Vector3(cx, 0, cz),
            radius: CAMP_SIZE,
            mesh: campGroup,
            fireLight,
            discovered: false,
        });
    }

    return camps;
}

export function updateCamps(camps, player, time) {
    const playerPos = player.mesh.position;
    let nearCamp = null;

    for (const camp of camps) {
        // Flicker campfire
        const flicker = 1.5 + Math.sin(time * 8 + camp.position.x) * 0.5 +
                        Math.sin(time * 13 + camp.position.z) * 0.3;
        camp.fireLight.intensity = flicker;

        // Check if player is near
        const dx = playerPos.x - camp.position.x;
        const dz = playerPos.z - camp.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < camp.radius) {
            nearCamp = camp;
            if (!camp.discovered) {
                camp.discovered = true;
            }
        }
    }

    return nearCamp;
}

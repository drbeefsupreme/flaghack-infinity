import * as THREE from 'three';
import {
    ROOM_SIZE, ROOM_HEIGHT, CORRIDOR_WIDTH, CORRIDOR_LENGTH,
    MIN_ROOMS_PER_FLOOR, MAX_ROOMS_PER_FLOOR, FLOOR_THEMES, ENEMY_TYPES
} from './constants.js';

function seededRandom(seed) {
    let s = seed | 0;
    return function() {
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
        return (s >>> 0) / 0xFFFFFFFF;
    };
}

export function generateFloor(floorNum, scene) {
    const rng = seededRandom(floorNum * 7919 + 42);
    const theme = FLOOR_THEMES[Math.min(floorNum, FLOOR_THEMES.length - 1)];
    const roomCount = MIN_ROOMS_PER_FLOOR + Math.floor(rng() * (MAX_ROOMS_PER_FLOOR - MIN_ROOMS_PER_FLOOR + 1));

    const rooms = [];
    const corridors = [];
    const meshGroup = new THREE.Group();

    // Room materials
    const wallMat = new THREE.MeshStandardMaterial({ color: theme.wallColor, roughness: 0.85 });
    const floorMat = new THREE.MeshStandardMaterial({ color: theme.floorColor, roughness: 0.9 });
    const ceilMat = new THREE.MeshStandardMaterial({ color: theme.wallColor, roughness: 0.9, side: THREE.BackSide });

    // Generate rooms in a spanning tree layout
    const placed = [];

    // First room at origin (spawn room)
    placed.push({ x: 0, z: 0, type: 'spawn' });

    // Place remaining rooms by branching from existing ones
    const directions = [
        { dx: 1, dz: 0 },
        { dx: -1, dz: 0 },
        { dx: 0, dz: 1 },
        { dx: 0, dz: -1 },
    ];

    for (let i = 1; i < roomCount; i++) {
        let attempts = 0;
        let placed_room = false;
        while (attempts < 20 && !placed_room) {
            const parent = placed[Math.floor(rng() * placed.length)];
            const dir = directions[Math.floor(rng() * 4)];
            const nx = parent.x + dir.dx;
            const nz = parent.z + dir.dz;

            // Check no overlap
            const overlap = placed.some(p => p.x === nx && p.z === nz);
            if (!overlap) {
                let type = 'normal';
                if (i === roomCount - 1) type = 'exit'; // last room has stairs
                else if (rng() < 0.2) type = 'treasure';
                else if (rng() < 0.15) type = 'crystal';

                placed.push({ x: nx, z: nz, type, parentIdx: placed.indexOf(parent) });
                placed_room = true;
            }
            attempts++;
        }
        if (!placed_room) {
            // Force place adjacent to last placed
            const parent = placed[placed.length - 1];
            for (const dir of directions) {
                const nx = parent.x + dir.dx;
                const nz = parent.z + dir.dz;
                if (!placed.some(p => p.x === nx && p.z === nz)) {
                    let type = i === roomCount - 1 ? 'exit' : 'normal';
                    placed.push({ x: nx, z: nz, type, parentIdx: placed.length - 1 });
                    break;
                }
            }
        }
    }

    // Build room meshes
    const spacing = ROOM_SIZE + CORRIDOR_LENGTH;

    for (const roomData of placed) {
        const worldX = roomData.x * spacing;
        const worldZ = roomData.z * spacing;

        // Floor
        const floorGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
        floorGeo.rotateX(-Math.PI / 2);
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.set(worldX, 0, worldZ);
        floor.receiveShadow = true;
        meshGroup.add(floor);

        // Ceiling
        const ceil = new THREE.Mesh(floorGeo.clone(), ceilMat);
        ceil.position.set(worldX, ROOM_HEIGHT, worldZ);
        ceil.rotation.x = Math.PI;
        meshGroup.add(ceil);

        // Walls (4 sides with door openings)
        const wallThickness = 0.5;
        const halfRoom = ROOM_SIZE / 2;
        const doorHalfWidth = CORRIDOR_WIDTH / 2 + 0.5;

        const wallConfigs = [
            { axis: 'x', pos: halfRoom, rot: 0, nx: 1, nz: 0 },
            { axis: 'x', pos: -halfRoom, rot: 0, nx: -1, nz: 0 },
            { axis: 'z', pos: halfRoom, rot: Math.PI / 2, nx: 0, nz: 1 },
            { axis: 'z', pos: -halfRoom, rot: Math.PI / 2, nx: 0, nz: -1 },
        ];

        for (const wc of wallConfigs) {
            // Check if there's an adjacent room in this direction
            const adjX = roomData.x + wc.nx;
            const adjZ = roomData.z + wc.nz;
            const hasNeighbor = placed.some(p => p.x === adjX && p.z === adjZ);

            if (hasNeighbor) {
                // Wall with doorway - two wall segments on either side
                const segWidth = (ROOM_SIZE - CORRIDOR_WIDTH) / 2 - 0.5;
                for (const side of [-1, 1]) {
                    const wallGeo = new THREE.BoxGeometry(segWidth, ROOM_HEIGHT, wallThickness);
                    const wall = new THREE.Mesh(wallGeo, wallMat);
                    if (wc.axis === 'x') {
                        wall.position.set(worldX + wc.pos, ROOM_HEIGHT / 2, worldZ + side * (doorHalfWidth + segWidth / 2));
                    } else {
                        wall.position.set(worldX + side * (doorHalfWidth + segWidth / 2), ROOM_HEIGHT / 2, worldZ + wc.pos);
                        wall.rotation.y = wc.rot;
                    }
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    meshGroup.add(wall);
                }
            } else {
                // Solid wall
                const wallGeo = new THREE.BoxGeometry(ROOM_SIZE, ROOM_HEIGHT, wallThickness);
                const wall = new THREE.Mesh(wallGeo, wallMat);
                if (wc.axis === 'x') {
                    wall.position.set(worldX + wc.pos, ROOM_HEIGHT / 2, worldZ);
                } else {
                    wall.position.set(worldX, ROOM_HEIGHT / 2, worldZ + wc.pos);
                    wall.rotation.y = wc.rot;
                }
                wall.castShadow = true;
                wall.receiveShadow = true;
                meshGroup.add(wall);
            }
        }

        // Room light
        const lightIntensity = roomData.type === 'treasure' ? 3 : roomData.type === 'crystal' ? 4 : 1.5;
        const lightColor = roomData.type === 'crystal' ? 0x88ccff : roomData.type === 'treasure' ? 0xffd700 : 0xffaa66;
        const roomLight = new THREE.PointLight(lightColor, lightIntensity, ROOM_SIZE * 0.8);
        roomLight.position.set(worldX, ROOM_HEIGHT - 1, worldZ);
        roomLight.castShadow = floorNum < 3; // shadows only on early floors for perf
        if (roomLight.castShadow) {
            roomLight.shadow.mapSize.width = 512;
            roomLight.shadow.mapSize.height = 512;
        }
        meshGroup.add(roomLight);

        // Room-specific decorations
        if (roomData.type === 'exit') {
            // Staircase down indicator
            const stairGeo = new THREE.CylinderGeometry(1.5, 2, 0.3, 6);
            const stairMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa8800, emissiveIntensity: 0.8 });
            const stair = new THREE.Mesh(stairGeo, stairMat);
            stair.position.set(worldX, 0.15, worldZ);
            meshGroup.add(stair);
        }

        if (roomData.type === 'crystal') {
            // Crystal formation
            for (let c = 0; c < 3; c++) {
                const crystalGeo = new THREE.OctahedronGeometry(0.5 + rng() * 0.5, 0);
                const crystalMat = new THREE.MeshStandardMaterial({
                    color: 0x88ccff,
                    emissive: 0x4488cc,
                    emissiveIntensity: 0.6,
                    transparent: true,
                    opacity: 0.8,
                });
                const crystal = new THREE.Mesh(crystalGeo, crystalMat);
                crystal.position.set(
                    worldX + (rng() - 0.5) * 6,
                    1 + rng() * 2,
                    worldZ + (rng() - 0.5) * 6
                );
                crystal.rotation.set(rng(), rng(), rng());
                meshGroup.add(crystal);
            }
        }

        // Push room data
        rooms.push({
            gridX: roomData.x,
            gridZ: roomData.z,
            worldX,
            worldZ,
            type: roomData.type,
            size: ROOM_SIZE,
            enemies: [],
            cleared: roomData.type === 'spawn',
            discovered: roomData.type === 'spawn',
            pickups: [],
        });
    }

    // Build corridors between adjacent rooms
    for (let i = 1; i < placed.length; i++) {
        const room = placed[i];
        if (room.parentIdx === undefined) continue;
        const parent = placed[room.parentIdx];
        const r1 = rooms[i];
        const r2 = rooms[room.parentIdx];

        const dx = room.x - parent.x;
        const dz = room.z - parent.z;
        const midX = (r1.worldX + r2.worldX) / 2;
        const midZ = (r1.worldZ + r2.worldZ) / 2;

        const length = CORRIDOR_LENGTH + ROOM_SIZE * 0.1;
        const width = CORRIDOR_WIDTH;

        // Floor
        const corrFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(dx !== 0 ? length : width, dz !== 0 ? length : width),
            floorMat
        );
        corrFloor.rotation.x = -Math.PI / 2;
        corrFloor.position.set(midX, 0.01, midZ);
        corrFloor.receiveShadow = true;
        meshGroup.add(corrFloor);

        // Ceiling
        const corrCeil = new THREE.Mesh(
            new THREE.PlaneGeometry(dx !== 0 ? length : width, dz !== 0 ? length : width),
            ceilMat
        );
        corrCeil.position.set(midX, ROOM_HEIGHT, midZ);
        corrCeil.rotation.x = Math.PI / 2;
        meshGroup.add(corrCeil);

        // Walls along corridor
        const halfWidth = width / 2;
        if (dx !== 0) {
            // horizontal corridor - walls on z sides
            for (const side of [-1, 1]) {
                const cWall = new THREE.Mesh(
                    new THREE.BoxGeometry(length, ROOM_HEIGHT, 0.5),
                    wallMat
                );
                cWall.position.set(midX, ROOM_HEIGHT / 2, midZ + side * halfWidth);
                meshGroup.add(cWall);
            }
        } else {
            // vertical corridor - walls on x sides
            for (const side of [-1, 1]) {
                const cWall = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, ROOM_HEIGHT, length),
                    wallMat
                );
                cWall.position.set(midX + side * halfWidth, ROOM_HEIGHT / 2, midZ);
                meshGroup.add(cWall);
            }
        }

        corridors.push({ x1: r2.worldX, z1: r2.worldZ, x2: r1.worldX, z2: r1.worldZ });
    }

    // Ambient light for the floor
    const ambient = new THREE.AmbientLight(theme.ambientColor, 0.3);
    meshGroup.add(ambient);

    scene.add(meshGroup);

    return {
        rooms,
        corridors,
        meshGroup,
        theme,
        floorNum,
        spawnRoom: rooms[0],
    };
}

export function populateFloor(floor, floorNum, scene, rng) {
    const enemies = [];
    const pickups = [];

    for (const room of floor.rooms) {
        if (room.type === 'spawn') continue;

        // Enemies
        const enemyCount = room.type === 'exit' ? 3 + floorNum : 2 + Math.floor(Math.random() * (2 + floorNum));
        const availableTypes = ENEMY_TYPES.slice(0, Math.min(ENEMY_TYPES.length, 1 + Math.floor(floorNum / 1.5)));

        for (let i = 0; i < enemyCount; i++) {
            const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            const scale = type.size || 1;
            enemies.push({
                type: { ...type },
                hp: type.hp * (1 + floorNum * 0.2),
                maxHp: type.hp * (1 + floorNum * 0.2),
                damage: type.damage * (1 + floorNum * 0.15),
                speed: type.speed,
                position: new THREE.Vector3(
                    room.worldX + (Math.random() - 0.5) * (room.size - 4),
                    0,
                    room.worldZ + (Math.random() - 0.5) * (room.size - 4)
                ),
                roomIdx: floor.rooms.indexOf(room),
                mesh: null, // created when room is entered
                alive: true,
                attackTimer: 0,
                state: 'idle', // idle, chase, attack, flee
                scale,
                flashTimer: 0,
                stunTimer: 0,
                burnTimer: 0,
                burnDamage: 0,
            });
        }

        // Pickups
        if (room.type === 'treasure') {
            pickups.push({
                type: 'FLAG',
                position: new THREE.Vector3(room.worldX, 0.5, room.worldZ),
                roomIdx: floor.rooms.indexOf(room),
                collected: false,
                mesh: null,
            });
            pickups.push({
                type: 'FLAGIC',
                position: new THREE.Vector3(room.worldX + 3, 0.5, room.worldZ),
                roomIdx: floor.rooms.indexOf(room),
                collected: false,
                mesh: null,
            });
        } else if (room.type === 'crystal') {
            pickups.push({
                type: 'CRYSTAL',
                position: new THREE.Vector3(room.worldX, 0.5, room.worldZ),
                roomIdx: floor.rooms.indexOf(room),
                collected: false,
                mesh: null,
            });
        }

        // Random health drops
        if (Math.random() < 0.3) {
            pickups.push({
                type: 'HEALTH',
                position: new THREE.Vector3(
                    room.worldX + (Math.random() - 0.5) * 10,
                    0.5,
                    room.worldZ + (Math.random() - 0.5) * 10
                ),
                roomIdx: floor.rooms.indexOf(room),
                collected: false,
                mesh: null,
            });
        }
    }

    return { enemies, pickups };
}

export function removeFloor(floor, scene) {
    scene.remove(floor.meshGroup);
}

export function getRoomAt(floor, worldX, worldZ) {
    for (const room of floor.rooms) {
        const halfSize = room.size / 2 + 2;
        if (Math.abs(worldX - room.worldX) < halfSize && Math.abs(worldZ - room.worldZ) < halfSize) {
            return room;
        }
    }
    return null;
}

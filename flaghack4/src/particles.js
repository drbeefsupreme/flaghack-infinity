import * as THREE from 'three';

export function createParticleSystem(scene, options = {}) {
    const count = options.count || 50;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = [];
    const lifetimes = [];

    for (let i = 0; i < count; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -100; // hidden
        positions[i * 3 + 2] = 0;
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0;
        sizes[i] = options.size || 0.3;
        velocities.push(new THREE.Vector3());
        lifetimes.push({ age: 0, max: 0, alive: false });
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
        vertexColors: true,
        size: options.size || 0.3,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    return {
        mesh: points,
        geo,
        positions,
        colors,
        velocities,
        lifetimes,
        count,
        nextIdx: 0,
    };
}

export function emitParticles(system, origin, count, options = {}) {
    const color = options.color || new THREE.Color(1, 0.8, 0);
    const speed = options.speed || 3;
    const lifetime = options.lifetime || 1;
    const spread = options.spread || 1;
    const rise = options.rise || 2;

    for (let i = 0; i < count; i++) {
        const idx = system.nextIdx;
        system.nextIdx = (system.nextIdx + 1) % system.count;

        system.positions[idx * 3] = origin.x + (Math.random() - 0.5) * spread;
        system.positions[idx * 3 + 1] = origin.y + Math.random() * 0.5;
        system.positions[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * spread;

        system.colors[idx * 3] = color.r;
        system.colors[idx * 3 + 1] = color.g;
        system.colors[idx * 3 + 2] = color.b;

        system.velocities[idx].set(
            (Math.random() - 0.5) * speed,
            rise + Math.random() * speed,
            (Math.random() - 0.5) * speed
        );

        system.lifetimes[idx] = { age: 0, max: lifetime + Math.random() * lifetime * 0.5, alive: true };
    }
}

export function updateParticles(system, dt) {
    let changed = false;
    for (let i = 0; i < system.count; i++) {
        const life = system.lifetimes[i];
        if (!life.alive) continue;

        life.age += dt;
        if (life.age >= life.max) {
            life.alive = false;
            system.positions[i * 3 + 1] = -100;
            changed = true;
            continue;
        }

        const v = system.velocities[i];
        system.positions[i * 3] += v.x * dt;
        system.positions[i * 3 + 1] += v.y * dt;
        system.positions[i * 3 + 2] += v.z * dt;

        // Gravity
        v.y -= 2 * dt;

        // Fade color
        const t = life.age / life.max;
        system.colors[i * 3] *= (1 - t * 0.01);

        changed = true;
    }

    if (changed) {
        system.geo.attributes.position.needsUpdate = true;
        system.geo.attributes.color.needsUpdate = true;
    }
}

export function removeParticleSystem(system, scene) {
    scene.remove(system.mesh);
}

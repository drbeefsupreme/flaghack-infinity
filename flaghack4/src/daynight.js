import * as THREE from 'three';
import { DAY_CYCLE_DURATION } from './constants.js';

export function createDayNight(scene) {
    // Sun light
    const sunLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    sunLight.position.set(50, 80, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -80;
    sunLight.shadow.camera.right = 80;
    sunLight.shadow.camera.top = 80;
    sunLight.shadow.camera.bottom = -80;
    scene.add(sunLight);

    // Ambient
    const ambient = new THREE.AmbientLight(0x334455, 0.4);
    scene.add(ambient);

    // Hemisphere
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0xd4c4a0, 0.3);
    scene.add(hemi);

    // Sky sphere
    const skyGeo = new THREE.SphereGeometry(500, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x4488cc) },
            bottomColor: { value: new THREE.Color(0xd4c4a0) },
            offset: { value: 10 },
            exponent: { value: 0.6 },
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    return {
        sunLight,
        ambient,
        hemi,
        sky,
        skyMat,
        timeOfDay: 0.3, // start at morning
    };
}

export function updateDayNight(dayNight, dt, totalTime) {
    dayNight.timeOfDay = (totalTime / DAY_CYCLE_DURATION) % 1;
    const t = dayNight.timeOfDay;

    // Sun position (arc across sky)
    const sunAngle = t * Math.PI * 2 - Math.PI / 2;
    const sunHeight = Math.sin(sunAngle);
    const sunHoriz = Math.cos(sunAngle);
    dayNight.sunLight.position.set(sunHoriz * 80, Math.max(sunHeight * 80, 5), 30);

    // Day/night light intensity
    const dayAmount = Math.max(0, sunHeight);
    const nightAmount = Math.max(0, -sunHeight);

    dayNight.sunLight.intensity = 0.3 + dayAmount * 1.5;
    dayNight.ambient.intensity = 0.15 + dayAmount * 0.3;

    // Sun color (warm at dawn/dusk)
    const lowSun = 1 - Math.min(1, Math.abs(sunHeight) * 3);
    const sunColor = new THREE.Color(0xffeedd);
    const duskColor = new THREE.Color(0xff6633);
    sunColor.lerp(duskColor, lowSun * 0.7);
    dayNight.sunLight.color.copy(sunColor);

    // Sky colors
    const dayTopColor = new THREE.Color(0x4488cc);
    const nightTopColor = new THREE.Color(0x0a0a1a);
    const duskTopColor = new THREE.Color(0xcc5533);

    const dayBottomColor = new THREE.Color(0xd4c4a0);
    const nightBottomColor = new THREE.Color(0x111122);
    const duskBottomColor = new THREE.Color(0x663322);

    let topColor, bottomColor;

    if (dayAmount > 0.3) {
        topColor = dayTopColor.clone().lerp(duskTopColor, lowSun * 0.5);
        bottomColor = dayBottomColor.clone().lerp(duskBottomColor, lowSun * 0.3);
    } else if (nightAmount > 0.3) {
        topColor = nightTopColor.clone();
        bottomColor = nightBottomColor.clone();
    } else {
        const blend = (dayAmount + 0.3) / 0.6;
        topColor = nightTopColor.clone().lerp(duskTopColor, blend);
        bottomColor = nightBottomColor.clone().lerp(duskBottomColor, blend);
    }

    dayNight.skyMat.uniforms.topColor.value.copy(topColor);
    dayNight.skyMat.uniforms.bottomColor.value.copy(bottomColor);
}

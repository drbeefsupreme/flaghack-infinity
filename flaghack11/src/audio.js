// ── Procedural Audio Engine ──
// Generates beats and sounds using Web Audio API

let audioCtx = null;

export function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

export function getAudioCtx() { return audioCtx; }

// Play a percussive hit on beat
export function playBeatSound(type = 'flag', time = 0) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    if (type === 'kick') {
        // Low thump for the beat
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
    } else if (type === 'hihat') {
        // Noise burst
        const bufferSize = audioCtx.sampleRate * 0.05;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        source.connect(filter).connect(gain).connect(audioCtx.destination);
        source.start(t);
    } else if (type === 'flag') {
        // Bright golden chime for flag hits
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.3);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
    } else if (type === 'crystal') {
        // Sparkly high tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1320, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    } else if (type === 'effigy') {
        // Deep dramatic hit
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.5);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
    } else if (type === 'miss') {
        // Buzzy low error
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    } else if (type === 'pentagram') {
        // Ascending chord
        for (let i = 0; i < 5; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            const freq = 440 * Math.pow(2, i / 5);
            const delay = i * 0.05;
            osc.frequency.setValueAtTime(freq, t + delay);
            gain.gain.setValueAtTime(0.15, t + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.6);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t + delay);
            osc.stop(t + delay + 0.6);
        }
    } else if (type === 'crystallize') {
        // Huge ascending shimmer
        for (let i = 0; i < 8; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440 + i * 220, t + i * 0.06);
            gain.gain.setValueAtTime(0.1, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.06 + 0.8);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t + i * 0.06);
            osc.stop(t + i * 0.06 + 0.8);
        }
    }
}

// Play the background beat pattern for a given BPM
export function startBeat(bpm) {
    if (!audioCtx) return null;
    const interval = 60 / bpm;
    let beat = 0;
    const id = setInterval(() => {
        const t = audioCtx.currentTime;
        if (beat % 4 === 0) playBeatSound('kick', t);
        if (beat % 2 === 1) playBeatSound('hihat', t);
        beat++;
    }, interval * 1000 / 2); // Eighth notes
    return id;
}

export function stopBeat(id) {
    if (id) clearInterval(id);
}

// Generates placeholder audio into public/audio/ with no dependencies.
// Replace any of these files with your own (same name) and re-render.
//   beat.wav    — 60 s background beat (120 BPM)
//   click.wav   — щелчок
//   plop.wav    — плюх
//   ding.wav    — дзынь
//   whoosh.wav  — вжух (scene transition)
//   crack.wav   — egg crack
//   buzz.wav    — fly buzz
//   sparkle.wav — glitter shimmer
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');
fs.mkdirSync(outDir, {recursive: true});

// deterministic noise
let seed = 1234567;
const rnd = () => {
	seed = (seed * 1664525 + 1013904223) >>> 0;
	return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

function writeWav(name, samples) {
	let peak = 0;
	for (const s of samples) peak = Math.max(peak, Math.abs(s));
	const norm = peak > 0.98 ? 0.98 / peak : 1;
	const buf = Buffer.alloc(44 + samples.length * 2);
	buf.write('RIFF', 0);
	buf.writeUInt32LE(36 + samples.length * 2, 4);
	buf.write('WAVEfmt ', 8);
	buf.writeUInt32LE(16, 16);
	buf.writeUInt16LE(1, 20);
	buf.writeUInt16LE(1, 22);
	buf.writeUInt32LE(SR, 24);
	buf.writeUInt32LE(SR * 2, 28);
	buf.writeUInt16LE(2, 32);
	buf.writeUInt16LE(16, 34);
	buf.write('data', 36);
	buf.writeUInt32LE(samples.length * 2, 40);
	samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s * norm)) * 32767), 44 + i * 2));
	fs.writeFileSync(path.join(outDir, name), buf);
	console.log('wrote', name, (samples.length / SR).toFixed(2) + 's');
}

const make = (sec, fn) => {
	const n = Math.floor(sec * SR);
	const a = new Float32Array(n);
	for (let i = 0; i < n; i++) a[i] = fn(i / SR, i);
	return a;
};

// one-pole low-pass helper
const lowpass = (arr, k) => {
	let y = 0;
	for (let i = 0; i < arr.length; i++) {
		y += k * (arr[i] - y);
		arr[i] = y;
	}
	return arr;
};

// ---------- SFX ----------
writeWav('click.wav', make(0.06, (t) => noise() * Math.exp(-t * 180) * 0.9 + Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 120) * 0.5));

writeWav('plop.wav', make(0.28, (t) => {
	const f = 180 + 520 * Math.exp(-t * 28); // falling pitch "bloop"
	const ph = 2 * Math.PI * (180 * t + (520 / 28) * (1 - Math.exp(-t * 28)));
	return Math.sin(ph) * Math.exp(-t * 14) * 0.9 + noise() * Math.exp(-t * 90) * 0.15 + 0 * f;
}));

writeWav('ding.wav', make(1.6, (t) => {
	const env = Math.exp(-t * 3.2);
	return (
		Math.sin(2 * Math.PI * 1318.5 * t) * 0.55 +
		Math.sin(2 * Math.PI * 2637 * t) * 0.18 * Math.exp(-t * 6) +
		Math.sin(2 * Math.PI * 3951 * t) * 0.08 * Math.exp(-t * 9)
	) * env * Math.min(1, t * 400);
}));

{
	const len = 0.45;
	const raw = make(len, () => noise());
	// sweeping band: mix of two low-pass stages with time-varying coefficient
	let y1 = 0, y2 = 0;
	for (let i = 0; i < raw.length; i++) {
		const t = i / SR;
		const p = t / len;
		const k = 0.02 + 0.25 * Math.sin(Math.PI * p);
		y1 += k * (raw[i] - y1);
		y2 += k * 0.5 * (raw[i] - y2);
		raw[i] = (y1 - y2) * 3.2 * Math.sin(Math.PI * p) ** 1.5;
	}
	writeWav('whoosh.wav', raw);
}

writeWav('crack.wav', make(0.18, (t) => {
	const burst = (t0) => (t >= t0 ? noise() * Math.exp(-(t - t0) * 140) : 0);
	return burst(0) * 0.9 + burst(0.035) * 0.6 + burst(0.07) * 0.4;
}));

writeWav('buzz.wav', make(1.2, (t) => {
	const f = 210 + 12 * Math.sin(2 * Math.PI * 7 * t);
	const saw = ((t * f) % 1) * 2 - 1;
	const env = Math.min(1, t * 20) * Math.min(1, (1.2 - t) * 6) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 3 * t));
	return saw * 0.35 * env;
}));

writeWav('sparkle.wav', make(0.9, (t) => {
	let s = 0;
	const notes = [2093, 2637, 3136, 4186];
	notes.forEach((f, k) => {
		const t0 = k * 0.07;
		if (t >= t0) s += Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-(t - t0) * 7) * 0.25;
	});
	return s;
}));

// ---------- BEAT (60 s, 120 BPM) ----------
{
	const dur = 60.5;
	const bpm = 120;
	const beat = 60 / bpm;
	const n = Math.floor(dur * SR);
	const out = new Float32Array(n);
	const add = (startSec, arr, gain) => {
		const s0 = Math.floor(startSec * SR);
		for (let i = 0; i < arr.length && s0 + i < n; i++) out[s0 + i] += arr[i] * gain;
	};
	const kick = make(0.35, (t) => Math.sin(2 * Math.PI * (45 * t + (110 / 30) * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 9));
	const snare = lowpass(make(0.2, (t) => noise() * Math.exp(-t * 22)), 0.5).map((v, i) => v + Math.sin(2 * Math.PI * 190 * (i / SR)) * Math.exp(-(i / SR) * 30) * 0.4);
	const hat = make(0.05, (t, i) => (noise() - (i > 0 ? 0 : 0)) * Math.exp(-t * 90));
	// high-pass the hat crudely
	for (let i = hat.length - 1; i > 0; i--) hat[i] = hat[i] - hat[i - 1] * 0.9;
	const bassNotes = [55, 55, 65.4, 49]; // A1, A1, C2, G1 — one per bar
	const chordNotes = [[220, 261.6, 329.6], [220, 261.6, 329.6], [261.6, 329.6, 392], [196, 246.9, 293.7]];
	const totalBeats = Math.floor(dur / beat);
	for (let b = 0; b < totalBeats; b++) {
		const t = b * beat;
		const bar = Math.floor(b / 4) % 4;
		add(t, kick, 0.9);
		if (b % 4 === 2) add(t + beat * 0.5, kick, 0.6);
		if (b % 2 === 1) add(t, snare, 0.45);
		add(t, hat, 0.18);
		add(t + beat / 2, hat, 0.28);
		// bass: off-beat pluck
		const f = bassNotes[bar];
		add(t + beat / 2, make(beat * 0.45, (tt) => Math.sin(2 * Math.PI * f * tt) * 0.8 + Math.sin(2 * Math.PI * f * 2 * tt) * 0.2 * Math.exp(-tt * 8)).map((v, i) => v * Math.exp(-(i / SR) * 5)), 0.35);
		// soft chord stab on beat 1 and the "and" of 3
		if (b % 4 === 0 || b % 4 === 2) {
			const ch = chordNotes[bar];
			const stab = make(0.28, (tt) => ch.reduce((acc, cf) => acc + Math.sin(2 * Math.PI * cf * tt) + 0.3 * Math.sin(2 * Math.PI * cf * 2 * tt), 0) * Math.exp(-tt * 9) * 0.12);
			add(t + (b % 4 === 2 ? beat * 0.5 : 0), stab, 0.6);
		}
	}
	// fade out last 1.2 s
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		if (t > 58.8) out[i] *= Math.max(0, (60 - t) / 1.2);
	}
	writeWav('beat.wav', out);
}

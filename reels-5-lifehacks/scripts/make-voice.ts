// Собирает озвучку из реплик `voice` в src/config.ts.
// Пишет public/audio/voice/*.wav и src/voice-manifest.json (тайминги для монтажа и приглушения бита).
// Запуск: npm run voice   (один раз перед этим: npm run setup-voice)
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {scenes, voiceover} from '../src/config';

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'audio', 'voice');
const manifestPath = path.join(root, 'src', 'voice-manifest.json');
const model = path.join(root, '.cache', 'voices', `vits-piper-${voiceover.model}`, `${voiceover.model}.onnx`);
const py = path.join(root, '.venv', 'bin', 'python');

if (!fs.existsSync(model) || !fs.existsSync(py)) {
	console.error(`Нет модели или .venv. Сначала: npm run setup-voice`);
	process.exit(1);
}
fs.mkdirSync(outDir, {recursive: true});

type Entry = {scene: number; line: number; at: number; text: string; file: string; duration: number; hash: string; check?: string};
const old: Entry[] = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')).lines ?? [] : [];

const lines: Entry[] = [];
const todo: {text: string; out: string}[] = [];
scenes.forEach((s, si) =>
	(s.voice ?? []).forEach((v, li) => {
		const hash = createHash('sha1').update(`${voiceover.model}|${voiceover.lengthScale}|${voiceover.noiseScale}|${voiceover.noiseW}|${v.text}`).digest('hex').slice(0, 10);
		const file = `audio/voice/${String(si).padStart(2, '0')}_${s.component}_${li}_${hash}.wav`;
		const prev = old.find((o) => o.file === file && fs.existsSync(path.join(root, 'public', file)));
		lines.push({scene: si, line: li, at: v.at, text: v.text, file, duration: prev?.duration ?? 0, hash, check: prev?.check});
		if (!prev) todo.push({text: v.text, out: path.join(root, 'public', file)});
	}),
);

if (todo.length) {
	console.log(`Синтез ${todo.length} реплик голосом ${voiceover.model}…`);
	const res: {out: string; duration: number; heard: string | null; cer: number | null}[] = JSON.parse(
		execFileSync(py, [path.join(__dirname, 'tts.py')], {input: JSON.stringify({model, lengthScale: voiceover.lengthScale, noiseScale: voiceover.noiseScale, noiseW: voiceover.noiseW, takes: voiceover.takes, asrDir: path.join(root, '.cache', 'asr'), items: todo}), maxBuffer: 1 << 24}).toString(),
	);
	for (const r of res) {
		const e = lines.find((l) => path.join(root, 'public', l.file) === r.out)!;
		e.duration = Math.round(r.duration * 1000) / 1000;
		if (r.heard !== null) e.check = `распознано: «${r.heard}» (ошибок ${Math.round((r.cer ?? 0) * 100)}%)`;
	}
}

// удалить устаревшие файлы
const keep = new Set(lines.map((l) => path.basename(l.file)));
for (const f of fs.readdirSync(outDir)) if (!keep.has(f)) fs.unlinkSync(path.join(outDir, f));

fs.writeFileSync(manifestPath, JSON.stringify({model: voiceover.model, lengthScale: voiceover.lengthScale, lines}, null, '\t') + '\n');

// проверка: реплики не наезжают друг на друга и не вылезают за сцену
let warn = 0;
for (const l of lines) {
	const s = scenes[l.scene];
	const next = lines.find((n) => n.scene === l.scene && n.line === l.line + 1);
	const end = l.at + l.duration;
	const limit = next ? next.at : s.duration;
	const flag = end > limit + 0.05 ? `  ⚠ наезжает на ${next ? 'следующую реплику' : 'конец сцены'} на ${(end - limit).toFixed(2)} с` : '';
	if (flag) warn++;
	console.log(`${s.component.padEnd(8)} ${l.at.toFixed(2).padStart(5)}–${end.toFixed(2).padEnd(5)} «${l.text}»${flag}${l.check ? `\n${' '.repeat(23)}${l.check}` : ''}`);
}
console.log(warn ? `\n${warn} предупреждений: сдвиньте \`at\`, сократите текст или уменьшите voiceover.lengthScale.` : '\nВсе реплики помещаются.');

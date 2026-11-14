// Рендерит ключевые кадры каждой сцены в out/stills/ и рисует поверх контрольную разметку безопасных зон
// (out/stills/*_guides.png). Использование: npm run stills [-- кадр1 кадр2 ...]
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'out', 'stills');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER || null;

const serveUrl = await bundle({entryPoint: path.join(root, 'src', 'index.ts')});
const composition = await selectComposition({serveUrl, id: 'Reels5Lifehacks', browserExecutable});

const args = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const frames = args.length
	? args.map((f) => ({f, name: `frame_${String(f).padStart(4, '0')}`}))
	: [
			{f: 40, name: '00_hook'},
			{f: 60 + 330 - 30, name: '01_omelet'},
			{f: 390 + 300 - 30, name: '02_bread'},
			{f: 690 + 330 - 30, name: '03_closet'},
			{f: 1020 + 330 - 30, name: '04_shirt'},
			{f: 1350 + 300 - 30, name: '05_sneaker'},
			{f: 1650 + 120, name: '06_cta'},
		];

for (const {f, name} of frames) {
	const output = path.join(outDir, `${name}.png`);
	await renderStill({composition, serveUrl, output, frame: f, browserExecutable, imageFormat: 'png'});
	console.log('still', f, output);
}

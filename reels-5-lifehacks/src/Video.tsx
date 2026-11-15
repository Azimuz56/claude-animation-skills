import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {audio, palette, scenes, video, voiceover} from './config';
import voiceManifest from './voice-manifest.json';
import {loadFonts} from './fonts';
import {sec, timeline, totalFrames} from './lib';
import {sceneRegistry} from './scenes';
import {ProgressBar} from './components/ProgressBar';
import {WhooshTransitions} from './components/Whoosh';

loadFonts();

const sfxFile = (name: string) => staticFile(`audio/${name}.wav`);

/** Реплики диктора: время берём из config.ts, файл и длительность — из voice-manifest.json (npm run voice) */
const voiceClips = voiceover.enabled
	? timeline.flatMap(({from}, si) =>
			(scenes[si].voice ?? []).flatMap((v, li) => {
				const m = voiceManifest.lines.find((l) => l.scene === si && l.line === li && l.text === v.text);
				if (!m) {
					console.warn(`Нет озвучки для «${v.text}» — запустите npm run voice`);
					return [];
				}
				const start = from + sec(v.at);
				return [{start, frames: Math.ceil(m.duration * video.fps) + 2, file: m.file, text: v.text}];
			}),
		)
	: [];

/** громкость бита: приглушаем, пока говорит диктор (плавно, по 6 кадров на вход/выход) */
const beatVolumeAt = (f: number) => {
	const ramp = 6;
	let duck = 0;
	for (const c of voiceClips) {
		const a = c.start - ramp, b = c.start + c.frames + ramp;
		if (f < a || f > b) continue;
		const k = f < c.start ? (f - a) / ramp : f > c.start + c.frames ? (b - f) / ramp : 1;
		duck = Math.max(duck, k);
	}
	return audio.beatVolume + (audio.beatVolumeUnderVoice - audio.beatVolume) * duck;
};

export const Video: React.FC = () => (
	<AbsoluteFill style={{background: palette.bg}}>
		{/* сцены */}
		{timeline.map(({scene, from, durationInFrames}, i) => {
			const Scene = sceneRegistry[scene.component];
			if (!Scene) throw new Error(`Сцена "${scene.component}" не найдена в src/scenes/index.ts`);
			return (
				<Sequence key={i} from={from} durationInFrames={durationInFrames} name={`${i}. ${scene.component}`}>
					<Scene scene={scene} />
				</Sequence>
			);
		})}

		{/* интерфейс поверх сцен */}
		<ProgressBar />
		<WhooshTransitions />

		{/* звук: фоновый бит */}
		<Audio src={sfxFile(audio.beat)} volume={beatVolumeAt} endAt={totalFrames} />
		{/* звук: озвучка */}
		{voiceClips.map((c, i) => (
			<Sequence key={`v${i}`} from={c.start} durationInFrames={c.frames} name={`voice: ${c.text}`}>
				<Audio src={staticFile(c.file)} volume={voiceover.volume} />
			</Sequence>
		))}
		{/* звук: «вжух» на каждой смене сцены */}
		{timeline.slice(1).map(({from}, i) => (
			<Sequence key={`w${i}`} from={Math.max(0, from - 7)} durationInFrames={sec(1)} name={`sfx whoosh`}>
				<Audio src={sfxFile(audio.transitionSound)} volume={audio.sfxVolume} />
			</Sequence>
		))}
		{/* звук: эффекты сцен из конфига */}
		{timeline.flatMap(({scene, from}, i) =>
			scene.sfx.map((s, k) => {
				const start = from + sec(s.at);
				const underVoice = voiceClips.some((c) => start >= c.start - 3 && start <= c.start + c.frames);
				return (
					<Sequence key={`s${i}-${k}`} from={start} durationInFrames={sec(2)} name={`sfx ${s.sound}`}>
						<Audio src={sfxFile(s.sound)} volume={(s.volume ?? 1) * audio.sfxVolume * (underVoice ? audio.sfxUnderVoice : 1)} />
					</Sequence>
				);
			}),
		)}
	</AbsoluteFill>
);

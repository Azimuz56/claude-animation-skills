import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {audio, palette} from './config';
import {loadFonts} from './fonts';
import {sec, timeline, totalFrames} from './lib';
import {sceneRegistry} from './scenes';
import {ProgressBar} from './components/ProgressBar';
import {WhooshTransitions} from './components/Whoosh';

loadFonts();

const sfxFile = (name: string) => staticFile(`audio/${name}.wav`);

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
		<Audio src={sfxFile(audio.beat)} volume={audio.beatVolume} endAt={totalFrames} />
		{/* звук: «вжух» на каждой смене сцены */}
		{timeline.slice(1).map(({from}, i) => (
			<Sequence key={`w${i}`} from={Math.max(0, from - 7)} durationInFrames={sec(1)} name={`sfx whoosh`}>
				<Audio src={sfxFile(audio.transitionSound)} volume={audio.sfxVolume} />
			</Sequence>
		))}
		{/* звук: эффекты сцен из конфига */}
		{timeline.flatMap(({scene, from}, i) =>
			scene.sfx.map((s, k) => (
				<Sequence key={`s${i}-${k}`} from={from + sec(s.at)} durationInFrames={sec(2)} name={`sfx ${s.sound}`}>
					<Audio src={sfxFile(s.sound)} volume={(s.volume ?? 1) * audio.sfxVolume} />
				</Sequence>
			)),
		)}
	</AbsoluteFill>
);

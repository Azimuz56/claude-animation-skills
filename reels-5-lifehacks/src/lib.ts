import {interpolate, spring, Easing} from 'remotion';
import {scenes, video, SceneConfig} from './config';

/** Абсолютные кадры начала/конца каждой сцены — считаются из длительностей в конфиге. */
export const timeline = (() => {
	let cursor = 0;
	return scenes.map((s) => {
		const from = Math.round(cursor * video.fps);
		cursor += s.duration;
		const to = Math.round(cursor * video.fps);
		return {scene: s, from, durationInFrames: to - from};
	});
})();

export const totalFrames = timeline[timeline.length - 1].from + timeline[timeline.length - 1].durationInFrames;

/** секунды → кадры */
export const sec = (s: number) => Math.round(s * video.fps);

/** beat из конфига сцены в кадрах (если не задан — fallback) */
export const beat = (scene: SceneConfig, name: string, fallback = 0) => sec(scene.beats[name] ?? fallback);

/** упругое появление 0→1, начиная с кадра `start` */
export const pop = (frame: number, start: number, opts: {damping?: number; stiffness?: number; mass?: number} = {}) =>
	spring({frame: frame - start, fps: video.fps, config: {damping: opts.damping ?? 11, stiffness: opts.stiffness ?? 170, mass: opts.mass ?? 0.8}});

/** линейный прогресс 0→1 между кадрами a и b с easing */
export const prog = (frame: number, a: number, b: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) =>
	interpolate(frame, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** детерминированный псевдослучай */
export const rand = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

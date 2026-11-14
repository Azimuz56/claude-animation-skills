import React from 'react';
import {palette} from '../config';
import {pop, rand} from '../lib';

/** 4-лучевая звёздочка */
export const Star: React.FC<{x: number; y: number; r: number; color?: string; rot?: number}> = ({x, y, r, color = palette.accent2, rot = 0}) => (
	<path
		transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 10})`}
		d="M0 -10 Q2 -2 10 0 Q2 2 0 10 Q-2 2 -10 0 Q-2 -2 0 -10 Z"
		fill={color}
	/>
);

/** Блёстки вокруг точки (cx,cy) в радиусе rx/ry, начиная с кадра start */
export const Sparkles: React.FC<{frame: number; start: number; cx: number; cy: number; rx: number; ry: number; count?: number; seed?: number}> = ({frame, start, cx, cy, rx, ry, count = 10, seed = 1}) => {
	if (frame < start) return null;
	return (
		<g>
			{Array.from({length: count}).map((_, i) => {
				const a = rand(seed * 31 + i) * Math.PI * 2;
				const d = 0.7 + rand(seed * 17 + i) * 0.4;
				const delay = i * 3;
				const s = pop(frame, start + delay, {damping: 8});
				const tw = 0.6 + 0.4 * Math.sin((frame - start) * 0.25 + i * 1.7);
				const color = i % 3 === 0 ? palette.white : i % 3 === 1 ? palette.accent2 : palette.accent;
				return <Star key={i} x={cx + Math.cos(a) * rx * d} y={cy + Math.sin(a) * ry * d} r={(14 + rand(i + seed) * 16) * s * tw} color={color} rot={(frame - start) * 2 + i * 20} />;
			})}
		</g>
	);
};

/** Мягкий пар: облачка поднимаются вверх и тают */
export const Steam: React.FC<{frame: number; start: number; x: number; y: number; width?: number; height?: number; count?: number; color?: string; opacity?: number}> = ({frame, start, x, y, width = 160, height = 260, count = 6, color = '#FFFFFF', opacity = 0.85}) => {
	if (frame < start) return null;
	const t = frame - start;
	return (
		<g>
			{Array.from({length: count}).map((_, i) => {
				const period = 50 + (i % 3) * 8;
				const ph = ((t + i * (period / count)) % period) / period;
				const fadeIn = Math.min(1, t / 12);
				const px = x + (rand(i) - 0.5) * width + Math.sin(ph * Math.PI * 2 + i) * 18;
				const py = y - ph * height;
				const r = 22 + ph * 40;
				return <circle key={i} cx={px} cy={py} r={r} fill={color} opacity={opacity * fadeIn * Math.sin(ph * Math.PI)} />;
			})}
		</g>
	);
};

/** Мягкая тень-эллипс под предметом */
export const Shadow: React.FC<{cx: number; cy: number; rx: number; ry?: number}> = ({cx, cy, rx, ry}) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx * 0.14} fill="rgba(26,26,26,0.12)" />;

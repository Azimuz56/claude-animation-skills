import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {palette} from '../config';
import {beat, pop, prog, rand} from '../lib';
import {Headline} from '../components/Headline';
import {Caption} from '../components/Caption';
import {Sparkles, Steam} from '../components/Fx';
import {SceneProps} from './types';

const OUTLINE: [number, number][] = [
	[-60, 0], [-170, 30], [-250, 230], [-185, 262], [-150, 160], [-160, 540], [160, 540], [150, 160], [185, 262], [250, 230], [170, 30], [60, 0], [0, 46],
];

/** Контур с «волнами»: каждое ребро дробится и смещается по нормали на wrinkle·sin */
const wavyPath = (a: number, phase: number) => {
	const pts: string[] = [];
	OUTLINE.forEach(([x1, y1], i) => {
		const [x2, y2] = OUTLINE[(i + 1) % OUTLINE.length];
		const len = Math.hypot(x2 - x1, y2 - y1);
		const n = Math.max(2, Math.round(len / 26));
		const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
		for (let k = 0; k < n; k++) {
			const t = k / n;
			const w = k === 0 ? 0 : Math.sin(t * Math.PI * n * 0.5 + phase + i) * 13 * a;
			pts.push(`${(x1 + (x2 - x1) * t + nx * w).toFixed(1)} ${(y1 + (y2 - y1) * t + ny * w).toFixed(1)}`);
		}
	});
	return `M${pts.join(' L')} Z`;
};

/** Рубашка. (0,0) — центр воротника. wrinkle 1 — мятая, 0 — гладкая */
export const ShirtShape: React.FC<{wrinkle: number; frame: number}> = ({wrinkle, frame}) => {
	const phase = frame * 0.12 * wrinkle;
	const color = interpolateColors(wrinkle, [0, 1], ['#4FB6EC', '#8FB4CF']);
	const dark = interpolateColors(wrinkle, [0, 1], ['#2E95CF', '#6C93B0']);
	const wr = (x: number, y: number, w: number, k: number) => {
		const amp = 22 * wrinkle;
		return <path key={`${x}${y}`} d={`M${x} ${y} q${w / 6} ${-amp} ${w / 3} 0 t${w / 3} 0 t${w / 3} 0`} stroke={dark} strokeWidth={8} fill="none" strokeLinecap="round" opacity={wrinkle} transform={`rotate(${(rand(k) - 0.5) * 30} ${x} ${y})`} />;
	};
	return (
		<g>
			<path d={wavyPath(wrinkle, phase)} fill={color} strokeLinejoin="round" />
			<path d="M-60 0 L0 46 L-20 96 L-80 30 Z" fill="#FFFFFF" />
			<path d="M60 0 L0 46 L20 96 L80 30 Z" fill="#FFFFFF" />
			<path d="M0 50 L0 540" stroke={dark} strokeWidth={6} />
			{[120, 220, 320, 420].map((y) => (
				<circle key={y} cx={14} cy={y} r={9} fill="#FFFFFF" />
			))}
			<rect x={-130} y={190} width={80} height={70} rx={10} fill={dark} opacity={0.5} />
			{wrinkle > 0.02 && [wr(-140, 300, 110, 1), wr(30, 260, 110, 2), wr(-120, 430, 100, 3), wr(40, 470, 100, 4), wr(-230, 180, 70, 5), wr(170, 160, 70, 6)]}
		</g>
	);
};

export const HangerTop: React.FC = () => (
	<g>
		<path d="M-14 -62 Q-14 -80 0 -80 Q14 -80 14 -62 Q14 -50 0 -46 L0 -30" fill="none" stroke="#8E96A3" strokeWidth={10} strokeLinecap="round" />
		<path d="M0 -30 L-170 30 L170 30 Z" fill="none" stroke="#8E96A3" strokeWidth={10} strokeLinejoin="round" />
	</g>
);

const Bathroom: React.FC<{frame: number; steamStart: number; showerOn: boolean}> = ({frame, steamStart, showerOn}) => (
	<g>
		<rect width={1080} height={1920} fill="#DDF3FB" />
		{Array.from({length: 9}).map((_, c) =>
			Array.from({length: 16}).map((__, r) => <rect key={`${c}-${r}`} x={c * 124 + 4} y={r * 124 + 4} width={116} height={116} rx={10} fill="#CBEAF6" />),
		)}
		{/* rod */}
		<rect x={140} y={560} width={800} height={18} rx={9} fill="#A9ADB8" />
		{/* shower */}
		<rect x={900} y={560} width={20} height={200} fill="#A9ADB8" />
		<path d="M800 760 Q860 700 960 760 Z" fill="#A9ADB8" />
		{showerOn &&
			Array.from({length: 7}).map((_, i) => {
				const off = (frame * 22 + i * 37) % 120;
				return <rect key={i} x={826 + i * 18} y={770 + off} width={7} height={60} rx={3} fill={palette.blue} opacity={0.8} />;
			})}
		{/* tub */}
		<rect x={600} y={1220} width={460} height={130} rx={50} fill="#FFFFFF" />
		<rect x={620} y={1350} width={30} height={40} rx={8} fill="#A9ADB8" />
		<rect x={1010} y={1350} width={30} height={40} rx={8} fill="#A9ADB8" />
		<Steam frame={frame} start={steamStart} x={880} y={1200} width={300} height={600} count={9} opacity={0.75} />
		<Steam frame={frame} start={steamStart + 20} x={430} y={1260} width={520} height={700} count={10} opacity={0.6} />
	</g>
);

export const Shirt: React.FC<SceneProps> = ({scene}) => {
	const f = useCurrentFrame();
	const B = (n: string) => beat(scene, n);
	const inBath = f >= B('bathroom');
	const wrinkle = 1 - prog(f, B('smoothStart'), B('smoothEnd'));
	const enter = pop(f, 2, {damping: 11});
	const bathIn = pop(f, B('bathroom'), {damping: 13});
	const sway = Math.sin(f * 0.08) * 2;
	return (
		<AbsoluteFill style={{background: palette.bg}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
				{!inBath && (
					<g>
						<circle cx={540} cy={960} r={420} fill="#FFE2B3" />
						<g transform={`translate(540 ${700 + (1 - enter) * 500}) rotate(${Math.sin(f * 0.5) * 3}) scale(1.05)`}>
							<ShirtShape wrinkle={1} frame={f} />
						</g>
						</g>
				)}
				{inBath && (
					<g opacity={Math.min(1, bathIn * 1.4)}>
						<Bathroom frame={f} steamStart={B('steam')} showerOn />
						<g transform={`translate(430 ${640 + (1 - bathIn) * -200}) rotate(${sway} 0 -80) scale(0.95)`}>
							<HangerTop />
							<g transform="translate(0 10)">
								<ShirtShape wrinkle={wrinkle} frame={f} />
							</g>
						</g>
						<Sparkles frame={f} start={B('smoothEnd')} cx={430} cy={930} rx={330} ry={330} count={12} seed={11} />
					</g>
				)}
			</svg>
			<Headline text={scene.title} />
			{scene.caption && <Caption text={scene.caption} start={beat(scene, 'caption')} size={54} />}
		</AbsoluteFill>
	);
};


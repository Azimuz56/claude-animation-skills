import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {palette} from '../config';
import {beat, lerp, pop, prog, rand} from '../lib';
import {Headline} from '../components/Headline';
import {Caption} from '../components/Caption';
import {Microwave, fmtTimer} from '../components/Microwave';
import {Sparkles, Steam, Shadow} from '../components/Fx';
import {SceneProps} from './types';

/** Батон. (0,0) — центр. fresh 0..1: засохший → свежий; wet 0..1 — капли на корке */
export const Baguette: React.FC<{fresh: number; wet?: number; frame: number}> = ({fresh, wet = 0, frame}) => {
	const crust = interpolateColors(fresh, [0, 1], ['#C9B48E', '#F2A541']);
	const top = interpolateColors(fresh, [0, 1], ['#B49E78', '#E08A2C']);
	const mouth = lerp(-1, 1, fresh); // -1 грустный, 1 улыбка
	const blink = Math.floor(frame / 50) % 4 === 0 && frame % 50 < 4;
	return (
		<g>
			<Shadow cx={0} cy={96} rx={300} />
			<path d="M-300 10 Q-310 -70 -220 -80 L220 -80 Q310 -70 300 10 Q310 80 220 84 L-220 84 Q-310 80 -300 10 Z" fill={crust} />
			{[-180, -80, 20, 120, 210].map((x) => (
				<path key={x} d={`M${x - 30} -50 Q${x + 10} -76 ${x + 40} -40`} stroke={top} strokeWidth={14} fill="none" strokeLinecap="round" />
			))}
			{/* cracks */}
			<g stroke="#8E7A58" strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - fresh}>
				<path d="M-240 20 l30 -18 l14 22 l26 -14" />
				<path d="M150 40 l24 -20 l18 18 l30 -16" />
				<path d="M-40 56 l18 -14 l20 16" />
			</g>
			{/* face */}
			<g transform="translate(0 16)">
				{blink ? (
					<>
						<path d="M-70 -6 h36" stroke={palette.text} strokeWidth={9} strokeLinecap="round" />
						<path d="M34 -6 h36" stroke={palette.text} strokeWidth={9} strokeLinecap="round" />
					</>
				) : (
					<>
						<ellipse cx={-52} cy={-6} rx={14} ry={18} fill={palette.text} />
						<ellipse cx={52} cy={-6} rx={14} ry={18} fill={palette.text} />
						<circle cx={-47} cy={-12} r={5} fill="#FFF" />
						<circle cx={57} cy={-12} r={5} fill="#FFF" />
					</>
				)}
				{fresh < 0.5 && (
					<>
						<path d="M-80 -40 l40 12" stroke={palette.text} strokeWidth={8} strokeLinecap="round" />
						<path d="M80 -40 l-40 12" stroke={palette.text} strokeWidth={8} strokeLinecap="round" />
					</>
				)}
				<path d={`M-40 36 Q0 ${36 + mouth * 34} 40 36`} stroke={palette.text} strokeWidth={9} fill={mouth > 0.3 ? '#C0392B' : 'none'} strokeLinecap="round" />
				{fresh > 0.5 && (
					<>
						<ellipse cx={-96} cy={24} rx={22} ry={12} fill={palette.accent} opacity={0.5} />
						<ellipse cx={96} cy={24} rx={22} ry={12} fill={palette.accent} opacity={0.5} />
					</>
				)}
			</g>
			{wet > 0 &&
				Array.from({length: 8}).map((_, i) => (
					<ellipse key={i} cx={-240 + i * 66} cy={-40 + rand(i) * 70} rx={10} ry={14} fill={palette.blue} opacity={wet * (1 - fresh)} />
				))}
		</g>
	);
};

const SprayBottle: React.FC<{squeeze: number}> = ({squeeze}) => (
	<g>
		<rect x={-60} y={-20} width={120} height={220} rx={30} fill={palette.blue} />
		<rect x={-40} y={20} width={80} height={90} rx={16} fill="#FFFFFF" opacity={0.6} />
		<rect x={-30} y={-70} width={60} height={56} rx={10} fill={palette.text} />
		<path d="M-30 -66 L-110 -66 L-110 -38 L-30 -38 Z" fill={palette.text} />
		<path d={`M20 -50 L${40 - squeeze * 20} 10 L20 10 Z`} fill={palette.accent} />
	</g>
);

export const Bread: React.FC<SceneProps> = ({scene}) => {
	const f = useCurrentFrame();
	const B = (n: string) => beat(scene, n);
	const bx = 540, by = 1000;
	const sad = f < B('sadEnd');
	const shiver = sad ? Math.sin(f * 1.3) * 3 : 0;
	const enter = pop(f, 2, {damping: 12});

	const wIn = pop(f, B('water'), {damping: 12});
	const wet = prog(f, B('water') + 10, B('waterEnd'));
	const squeeze = f >= B('water') + 8 && f < B('waterEnd') ? (Math.floor((f - B('water')) / 6) % 2) : 0;

	const toMw = B('toMicrowave');
	const slide = prog(f, toMw, toMw + 14, Easing.in(Easing.cubic));
	const mwIn = pop(f, toMw + 6, {damping: 13, stiffness: 160});
	const door = f < toMw + 16 ? 1 : f < B('timerStart') - 3 ? 1 - prog(f, toMw + 16, B('timerStart') - 4) : f < B('ding') + 4 ? 0 : prog(f, B('ding') + 4, B('ding') + 16);
	const on = f >= B('timerStart') && f < B('ding') ? 1 : 0;
	const tLeft = interpolate(f, [B('timerStart'), B('timerEnd')], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const freshIn = prog(f, B('timerStart') + 6, B('timerEnd'));
	const outStart = B('ding') + 18;
	const out = pop(f, outStart, {damping: 9, stiffness: 150});
	const mwOut = prog(f, outStart - 4, outStart + 10);

	return (
		<AbsoluteFill style={{background: palette.bg}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
				<rect x={0} y={1140} width={1080} height={780} fill="#FFE2B3" />
				<rect x={0} y={1130} width={1080} height={20} fill="#F7CD8C" />
				{f < toMw + 14 && (
					<g transform={`translate(${-slide * 1100} 0)`}>
						<g transform={`translate(${bx + shiver} ${by + (1 - enter) * 400}) rotate(-4)`}>
							<Baguette fresh={0} wet={wet} frame={f} />
						</g>
						{/* crumbs */}
						{sad &&
							Array.from({length: 6}).map((_, i) => {
								const t = ((f + i * 11) % 40) / 40;
								return <rect key={i} x={bx - 200 + i * 80} y={by + 60 + t * 80} width={12} height={12} rx={3} fill="#B49E78" opacity={1 - t} />;
							})}
						{/* spray */}
						{f >= B('water') && (
							<g transform={`translate(${lerp(1300, 860, wIn)} 720) rotate(-20)`}>
								<SprayBottle squeeze={squeeze} />
							</g>
						)}
						{f >= B('water') + 8 &&
							f < B('waterEnd') + 10 &&
							Array.from({length: 14}).map((_, i) => {
								const s0 = B('water') + 8 + i * 3;
								const t = interpolate(f, [s0, s0 + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
								if (f < s0 || t >= 1) return null;
								const tx = bx - 220 + rand(i) * 440;
								const x = lerp(760, tx, t);
								const y = lerp(640, by - 60 + rand(i + 3) * 40, t) - Math.sin(t * Math.PI) * 120;
								return <path key={i} transform={`translate(${x} ${y}) scale(1.4)`} d="M0 -14 Q10 0 0 10 Q-10 0 0 -14 Z" fill={palette.blue} />;
							})}
					</g>
				)}
				{f >= toMw + 6 && (
					<g transform={`translate(${(1 - mwIn) * 1100} ${mwOut * 120})`} opacity={1 - mwOut}>
						<Microwave cx={540} cy={960} scale={1.3} door={door} on={on} timer={fmtTimer(tLeft)} frame={f} dingFlash={f >= B('ding') ? 1 : 0}>
							<g transform={`translate(210 170) scale(0.62)`}>
								<Baguette fresh={freshIn} wet={1} frame={f} />
							</g>
						</Microwave>
					</g>
				)}
				{f >= outStart && (
					<g>
						<Steam frame={f} start={outStart} x={bx} y={by - 90} width={420} height={220} count={8} />
						<g transform={`translate(${bx} ${by + (1 - out) * 300}) scale(${0.6 + 0.45 * out}) rotate(${-4 + Math.sin((f - outStart) * 0.15) * 3})`}>
							<Baguette fresh={1} frame={f} />
						</g>
						<Sparkles frame={f} start={outStart + 4} cx={bx} cy={by - 20} rx={420} ry={230} count={12} seed={7} />
					</g>
				)}
			</svg>
			<Headline text={scene.title} />
			{scene.caption && <Caption text={scene.caption} start={beat(scene, 'caption')} />}
		</AbsoluteFill>
	);
};

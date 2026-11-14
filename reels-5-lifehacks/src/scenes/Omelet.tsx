import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {palette} from '../config';
import {beat, lerp, pop, prog, rand} from '../lib';
import {Headline} from '../components/Headline';
import {Caption} from '../components/Caption';
import {Microwave, fmtTimer} from '../components/Microwave';
import {Sparkles, Steam, Shadow} from '../components/Fx';
import {SceneProps} from './types';

/** Стеклянная кружка. (0,0) — центр корпуса. level 0..1 — уровень смеси, mix 0..1 — размешано, puff 0..1 — омлет поднялся */
const Mug: React.FC<{level: number; mix: number; puff: number; frame: number}> = ({level, mix, puff, frame}) => {
	const H = 280, W = 260;
	const top = -H / 2, bottom = H / 2;
	const surf = bottom - 20 - level * (H - 50);
	const liquid = `rgba(255, ${Math.round(lerp(236, 205, mix))}, ${Math.round(lerp(190, 80, mix))}, 1)`;
	const wob = Math.sin(frame * 0.5) * 6 * (1 - mix) * (level > 0 ? 1 : 0);
	return (
		<g>
			<Shadow cx={0} cy={bottom + 18} rx={170} />
			{/* handle */}
			<path d={`M${W / 2 - 6} ${top + 60} Q${W / 2 + 90} ${top + 60} ${W / 2 + 80} ${top + 150} Q${W / 2 + 70} ${top + 220} ${W / 2 - 6} ${top + 210}`} fill="none" stroke="#BFE8FF" strokeWidth={30} strokeLinecap="round" />
			{/* back of glass */}
			<path d={`M${-W / 2} ${top} L${-W / 2 + 14} ${bottom - 20} Q0 ${bottom + 20} ${W / 2 - 14} ${bottom - 20} L${W / 2} ${top} Z`} fill="rgba(200,236,255,0.55)" />
			{/* contents */}
			{level > 0 && (
				<g>
					<path d={`M${-W / 2 + 10} ${surf} L${-W / 2 + 18} ${bottom - 24} Q0 ${bottom + 14} ${W / 2 - 18} ${bottom - 24} L${W / 2 - 10} ${surf} Z`} fill={liquid} />
					<ellipse cx={0} cy={surf} rx={W / 2 - 10} ry={22 + wob * 0.3} fill={liquid} />
					{mix < 0.8 && level > 0.3 && <ellipse cx={-30 + wob} cy={surf} rx={60} ry={12} fill="#FFFFFF" opacity={0.7 * (1 - mix)} />}
					{mix < 0.8 && level < 0.5 && <circle cx={20} cy={surf} r={26} fill="#FFB020" opacity={1 - mix} />}
				</g>
			)}
			{/* omelet dome */}
			{puff > 0 && (
				<g transform={`translate(0 ${top}) scale(1 ${puff})`}>
					<path d="M-128 20 Q-140 -70 -70 -90 Q-40 -150 10 -120 Q60 -160 100 -100 Q150 -80 128 20 Z" fill="#FFD045" />
					<path d="M-90 -40 Q-60 -90 -20 -80" stroke="#FFF1B0" strokeWidth={14} fill="none" strokeLinecap="round" />
					<circle cx={50} cy={-60} r={10} fill="#F2A93B" />
					<circle cx={-40} cy={-20} r={8} fill="#F2A93B" />
					<circle cx={80} cy={-20} r={7} fill="#F2A93B" />
				</g>
			)}
			{/* front glass + rim */}
			<path d={`M${-W / 2} ${top} L${-W / 2 + 14} ${bottom - 20} Q0 ${bottom + 20} ${W / 2 - 14} ${bottom - 20} L${W / 2} ${top}`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinejoin="round" />
			<ellipse cx={0} cy={top} rx={W / 2} ry={26} fill="none" stroke="#FFFFFF" strokeWidth={10} />
			<path d={`M${-W / 2 + 34} ${top + 40} L${-W / 2 + 44} ${bottom - 50}`} stroke="rgba(255,255,255,0.85)" strokeWidth={16} strokeLinecap="round" />
		</g>
	);
};

const Egg: React.FC<{crack: number}> = ({crack}) => {
	const d = crack * 90;
	return (
		<g>
			<g transform={`translate(${-d} ${-d * 0.4}) rotate(${-crack * 50})`} opacity={1 - crack}>
				<path d="M-46 0 Q-46 -66 0 -66 Q46 -66 46 0 L30 -8 L14 6 L0 -8 L-16 6 L-30 -8 Z" fill="#FFF8EC" stroke="#E9D2B0" strokeWidth={5} />
			</g>
			<g transform={`translate(${d} ${d * 0.2}) rotate(${crack * 60})`} opacity={1 - crack}>
				<path d="M-46 0 L-30 -8 L-16 6 L0 -8 L14 6 L30 -8 L46 0 Q46 54 0 54 Q-46 54 -46 0 Z" fill="#FFF8EC" stroke="#E9D2B0" strokeWidth={5} />
			</g>
		</g>
	);
};

const MilkCarton: React.FC = () => (
	<g>
		<rect x={-60} y={-80} width={120} height={180} rx={14} fill="#FFFFFF" />
		<path d="M-60 -80 L0 -140 L60 -80 Z" fill={palette.blue} />
		<rect x={-14} y={-160} width={28} height={30} rx={6} fill={palette.accent} />
		<rect x={-60} y={0} width={120} height={50} fill={palette.blue} />
		<circle cx={0} cy={-30} r={18} fill={palette.accent2} />
	</g>
);

const Fork: React.FC = () => (
	<g>
		<rect x={-9} y={-260} width={18} height={220} rx={9} fill="#C7CED8" />
		<path d="M-30 -40 L30 -40 L24 30 L-24 30 Z" fill="#C7CED8" />
		{[-22, -7, 8, 23].map((x) => (
			<rect key={x} x={x - 4} y={20} width={8} height={70} rx={4} fill="#C7CED8" />
		))}
	</g>
);

export const Omelet: React.FC<SceneProps> = ({scene}) => {
	const f = useCurrentFrame();
	const B = (n: string) => beat(scene, n);
	const mugX = 540, mugY = 1040;
	const rimY = mugY - 140;

	// egg
	const eggFall = prog(f, B('egg'), B('eggHit'), Easing.in(Easing.quad));
	const crack = prog(f, B('eggHit'), B('eggHit') + 12, Easing.out(Easing.quad));
	const yolkY = interpolate(f, [B('eggHit'), B('eggHit') + 6], [rimY - 10, rimY + 160], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	// milk
	const milkIn = pop(f, B('milk'));
	const tilt = prog(f, B('milk') + 6, B('milk') + 16);
	const pour = f > B('milk') + 14 && f < B('cheese') - 6 ? 1 : 0;
	// cheese
	const cheeseStart = B('cheese');
	// levels
	const level = 0.22 * prog(f, B('eggHit') + 2, B('eggHit') + 10) + 0.3 * prog(f, B('milk') + 14, B('cheese') - 6) + 0.12 * prog(f, cheeseStart + 6, cheeseStart + 24);
	const mix = prog(f, B('stir'), B('stirEnd'));
	const stirring = f >= B('stir') && f < B('stirEnd');

	const toMw = B('toMicrowave');
	const phaseA = f < toMw + 12;
	const slide = prog(f, toMw, toMw + 14, Easing.in(Easing.cubic));
	const mwIn = pop(f, toMw + 6, {damping: 13, stiffness: 160});
	const door = f < toMw + 16 ? 1 : f < B('timerStart') - 3 ? 1 - prog(f, toMw + 16, B('timerStart') - 4) : f < B('ding') + 4 ? 0 : prog(f, B('ding') + 4, B('ding') + 16);
	const on = f >= B('timerStart') && f < B('ding') ? 1 : 0;
	const tLeft = interpolate(f, [B('timerStart'), B('timerEnd')], [90, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const puffInside = 0.7 * prog(f, B('timerStart') + 10, B('timerEnd'));
	const outStart = B('ding') + 18;
	const out = pop(f, outStart, {damping: 10, stiffness: 150});
	const mwOut = prog(f, outStart - 4, outStart + 10);

	return (
		<AbsoluteFill style={{background: palette.bg}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
				{/* table */}
				<rect x={0} y={1200} width={1080} height={720} fill="#FFE2B3" />
				<rect x={0} y={1190} width={1080} height={20} fill="#F7CD8C" />
				{phaseA && (
					<g transform={`translate(${-slide * 1100} 0)`}>
						{/* milk */}
						{f >= B('milk') && f < B('cheese') + 10 && (
							<g transform={`translate(${lerp(-200, 330, milkIn)} ${700}) rotate(${-115 * tilt})`}>
								<MilkCarton />
							</g>
						)}
						{pour > 0 && <path d={`M${330 + 150} ${700 - 20} Q${520} ${720} ${mugX} ${rimY + 60}`} stroke="#FFFFFF" strokeWidth={26} fill="none" strokeLinecap="round" />}
						<g transform={`translate(${mugX} ${mugY}) rotate(${stirring ? Math.sin(f * 0.9) * 2 : 0})`}>
							<Mug level={level} mix={mix} puff={0} frame={f} />
						</g>
						{/* yolk */}
						{f >= B('eggHit') && f < B('eggHit') + 7 && <circle cx={mugX + 10} cy={yolkY} r={28} fill="#FFB020" />}
						{/* egg */}
						{f >= B('egg') && crack < 1 && (
							<g transform={`translate(${mugX + 10} ${lerp(420, rimY - 50, eggFall)}) rotate(${(1 - eggFall) * 30})`}>
								<Egg crack={crack} />
							</g>
						)}
						{f >= B('eggHit') && f < B('eggHit') + 10 && (
							<g stroke={palette.accent} strokeWidth={10} strokeLinecap="round" opacity={1 - (f - B('eggHit')) / 10}>
								<path d={`M${mugX - 110} ${rimY - 40} l-40 -30`} />
								<path d={`M${mugX + 130} ${rimY - 40} l40 -30`} />
								<path d={`M${mugX + 10} ${rimY - 110} l0 -40`} />
							</g>
						)}
						{/* cheese shreds */}
						{f >= cheeseStart &&
							Array.from({length: 9}).map((_, i) => {
								const s0 = cheeseStart + i * 2;
								const y = interpolate(f, [s0, s0 + 14], [480, rimY + 10], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
								if (f < s0 || f > s0 + 15) return null;
								return <rect key={i} x={mugX - 80 + rand(i) * 160} y={y} width={16} height={56} rx={8} fill={palette.accent2} transform={`rotate(${rand(i + 9) * 80 - 40} ${mugX - 80 + rand(i) * 160} ${y})`} />;
							})}
						{/* fork */}
						{f >= B('stir') - 4 && f < B('stirEnd') + 6 && (
							<g transform={`translate(${mugX + Math.sin((f - B('stir')) * 0.7) * 60} ${rimY + 40 - 20 * pop(f, B('stir') - 4)}) rotate(${12 + Math.cos((f - B('stir')) * 0.7) * 10})`}>
								<Fork />
							</g>
						)}
					</g>
				)}
				{/* microwave */}
				{f >= toMw + 6 && (
					<g transform={`translate(${(1 - mwIn) * 1100} ${mwOut * 120})`} opacity={1 - mwOut}>
						<Microwave cx={540} cy={1000} scale={1.3} door={door} on={on} timer={fmtTimer(tLeft)} frame={f} dingFlash={f >= B('ding') ? 1 : 0}>
							<ellipse cx={210} cy={250} rx={140} ry={18} fill="rgba(255,255,255,0.35)" transform={`rotate(0)`} />
							<g transform={`translate(${210 + (on ? Math.sin(f * 0.3) * 20 : 0)} ${168}) scale(0.5)`}>
								<Mug level={0.64} mix={1} puff={puffInside} frame={f} />
							</g>
						</Microwave>
					</g>
				)}
				{/* omelet out */}
				{f >= outStart && (
					<g>
						<Steam frame={f} start={outStart} x={mugX} y={mugY - 260} width={200} height={260} count={7} />
						<g transform={`translate(${mugX} ${mugY + (1 - out) * 300}) scale(${0.6 + 0.4 * out})`}>
							<Mug level={0.64} mix={1} puff={0.7 + 0.3 * out} frame={f} />
						</g>
						<Sparkles frame={f} start={outStart + 4} cx={mugX} cy={mugY - 120} rx={330} ry={250} count={12} seed={3} />
					</g>
				)}
			</svg>
			<Headline text={scene.title} />
			{scene.caption && <Caption text={scene.caption} start={beat(scene, 'caption')} />}
		</AbsoluteFill>
	);
};


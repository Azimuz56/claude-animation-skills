import React from 'react';
import {AbsoluteFill, Easing, interpolateColors, useCurrentFrame} from 'remotion';
import {palette} from '../config';
import {beat, lerp, pop, prog, rand} from '../lib';
import {Headline} from '../components/Headline';
import {Caption} from '../components/Caption';
import {Sparkles, Star, Shadow} from '../components/Fx';
import {SceneProps} from './types';

/** Кроссовок, носок вправо. (0,0) — центр. Отверстие (куда кладём пакетик) ≈ (-90,-110) */
const Shoe: React.FC = () => (
	<g>
		<Shadow cx={0} cy={140} rx={300} />
		<path d="M-270 120 L-280 20 Q-280 -60 -220 -110 L-150 -130 Q-120 -80 -60 -90 L-20 -120 Q60 -40 160 -10 Q280 20 290 90 L290 120 Z" fill={palette.white} />
		<path d="M-270 90 L290 90 L290 130 Q290 150 270 150 L-250 150 Q-270 150 -270 130 Z" fill={palette.accent} />
		<path d="M-150 -130 Q-120 -80 -60 -90 L-20 -120 L-30 -140 Q-90 -100 -140 -150 Z" fill={palette.text} />
		<path d="M-200 -40 Q-80 10 60 -20" stroke={palette.accent} strokeWidth={26} fill="none" strokeLinecap="round" />
		{[0, 1, 2, 3].map((i) => (
			<path key={i} d={`M${-10 + i * 34} ${-90 + i * 22} l40 -14`} stroke={palette.accent2} strokeWidth={10} strokeLinecap="round" />
		))}
		<path d="M150 30 Q230 30 270 80" stroke="#E6E6E6" strokeWidth={10} fill="none" strokeLinecap="round" />
	</g>
);

const TeaBag: React.FC<{tagOnly?: boolean}> = ({tagOnly}) => (
	<g>
		{!tagOnly && <rect x={-46} y={-56} width={92} height={112} rx={12} fill="#F3E1C0" stroke="#D9BF92" strokeWidth={5} />}
		{!tagOnly && <rect x={-30} y={-30} width={60} height={60} rx={10} fill="#B98A52" opacity={0.4} />}
		<path d="M0 -56 Q10 -100 50 -120" stroke="#8E96A3" strokeWidth={4} fill="none" />
		<rect x={40} y={-150} width={52} height={40} rx={6} fill={palette.green} transform="rotate(14 66 -130)" />
	</g>
);

const Fly: React.FC<{frame: number}> = ({frame}) => {
	const flap = Math.sin(frame * 2.4) * 25;
	return (
		<g>
			<ellipse cx={-6} cy={-16} rx={18} ry={10} fill="#FFFFFF" opacity={0.8} transform={`rotate(${-30 + flap} 0 0)`} />
			<ellipse cx={6} cy={-16} rx={18} ry={10} fill="#FFFFFF" opacity={0.8} transform={`rotate(${30 - flap} 0 0)`} />
			<ellipse cx={0} cy={0} rx={20} ry={14} fill={palette.text} />
			<circle cx={16} cy={-4} r={9} fill={palette.text} />
			<circle cx={19} cy={-7} r={4} fill="#E24B4B" />
		</g>
	);
};

export const Sneaker: React.FC<SceneProps> = ({scene}) => {
	const f = useCurrentFrame();
	const B = (n: string) => beat(scene, n);
	const sx = 560, sy = 1060;
	const enter = pop(f, 2, {damping: 11});
	const night = prog(f, B('night'), B('night') + 10) * (1 - prog(f, B('morning') - 8, B('morning') + 4));
	const sky = interpolateColors(night, [0, 1], [palette.bg, palette.night]);
	const stink = 1 - prog(f, B('night') + 20, B('morning') - 10);
	// fly orbits, then flees
	const flee = prog(f, B('night'), B('night') + 30, Easing.in(Easing.quad));
	const ft = f * 0.11;
	const flyX = sx + Math.cos(ft) * 300 + flee * 700;
	const flyY = 780 + Math.sin(ft * 2) * 90 - flee * 500;
	// teabag arc
	const tb = prog(f, B('teabag'), B('teabagIn'), Easing.inOut(Easing.quad));
	const tbX = lerp(80, sx - 90, tb);
	const tbY = lerp(700, sy - 110, tb) - Math.sin(tb * Math.PI) * 260;
	const inShoe = f >= B('teabagIn');
	// fast day cycle during night
	const cycle = prog(f, B('night') + 6, B('morning'), (t) => t);
	const ang = cycle * Math.PI * 4; // два оборота
	const shoeSquash = inShoe && f < B('teabagIn') + 10 ? 1 - 0.06 * Math.sin(((f - B('teabagIn')) / 10) * Math.PI) : 1;

	return (
		<AbsoluteFill style={{background: sky}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
				{/* stars */}
				{night > 0 &&
					Array.from({length: 22}).map((_, i) => (
						<Star key={i} x={rand(i) * 1080} y={560 + rand(i + 40) * 640} r={(8 + rand(i + 9) * 10) * (0.6 + 0.4 * Math.sin(f * 0.4 + i))} color={palette.white} rot={0} />
					))}
				{/* moon / sun on a fast arc */}
				{night > 0 && (
					<g opacity={night}>
						<g transform={`translate(${540 + Math.cos(ang - Math.PI / 2) * 340} ${980 + Math.sin(ang - Math.PI / 2) * 320})`}>
							<circle r={70} fill="#FFF3C4" />
							<circle cx={30} cy={-20} r={62} fill={sky} />
						</g>
						<g transform={`translate(${540 + Math.cos(ang + Math.PI / 2) * 340} ${980 + Math.sin(ang + Math.PI / 2) * 320})`} opacity={0.9}>
							<circle r={54} fill={palette.accent2} />
						</g>
					</g>
				)}
				{/* morning sun */}
				{f >= B('morning') && (
					<g transform={`translate(860 ${lerp(1200, 690, pop(f, B('morning'), {damping: 14}))})`}>
						{Array.from({length: 10}).map((_, i) => (
							<rect key={i} x={-8} y={-130} width={16} height={40} rx={8} fill={palette.accent2} transform={`rotate(${i * 36 + f * 2})`} />
						))}
						<circle r={78} fill={palette.accent2} />
					</g>
				)}
				<rect x={0} y={1200} width={1080} height={720} fill={interpolateColors(night, [0, 1], ['#FFE2B3', '#2B3163'])} />
				{/* stink waves */}
				{stink > 0 &&
					[0, 1, 2].map((i) => {
						const t = ((f * 1.2 + i * 18) % 54) / 54;
						const x0 = sx - 140 + i * 60;
						const y0 = sy - 150 - t * 260;
						const o = (f * 0.25) % (Math.PI * 2);
						return (
							<path
								key={i}
								d={`M${x0} ${y0 + 90} q30 -15 0 -30 t0 -30 t0 -30`}
								transform={`translate(${Math.sin(o + i) * 12} 0)`}
								stroke={palette.green}
								strokeWidth={16}
								fill="none"
								strokeLinecap="round"
								opacity={stink * Math.sin(t * Math.PI)}
							/>
						);
					})}
				<g transform={`translate(${sx} ${sy + (1 - enter) * 500}) scale(${shoeSquash} ${2 - shoeSquash})`}>
					<Shoe />
					{inShoe && (
						<g transform="translate(-90 -110)">
							<TeaBag tagOnly />
						</g>
					)}
				</g>
				{f >= B('teabag') && !inShoe && (
					<g transform={`translate(${tbX} ${tbY}) rotate(${tb * 360}) scale(${1 - tb * 0.3})`}>
						<TeaBag />
					</g>
				)}
				{flee < 1 && (
					<g transform={`translate(${flyX} ${flyY}) scale(${Math.sin(ft) < 0 ? -1.4 : 1.4} 1.4)`}>
						<Fly frame={f} />
					</g>
				)}
				{f >= B('morning') && <Sparkles frame={f} start={B('morning') + 2} cx={sx} cy={sy - 30} rx={360} ry={250} count={14} seed={9} />}
			</svg>
			<Headline text={scene.title} />
			{scene.caption && <Caption text={scene.caption} start={beat(scene, 'caption')} />}
		</AbsoluteFill>
	);
};

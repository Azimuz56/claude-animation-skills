import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {palette} from '../config';
import {fontStack} from '../fonts';
import {beat, pop} from '../lib';
import {RichText} from '../components/Emoji';
import {SceneProps} from './types';

/** Комната общаги (фон хука) */
export const DormRoom: React.FC<{frame: number}> = ({frame}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
		<rect width={1080} height={1920} fill="#FFE7C2" />
		<rect y={1380} width={1080} height={540} fill="#F2C58F" />
		<rect y={1370} width={1080} height={22} fill="#E3AE72" />
		{/* window */}
		<rect x={90} y={560} width={360} height={420} rx={24} fill="#FFFFFF" />
		<rect x={112} y={582} width={316} height={376} rx={14} fill={palette.blue} />
		<circle cx={350} cy={660} r={44} fill={palette.accent2} />
		<path d="M140 900 Q200 840 260 900 Q320 850 400 900 L400 958 L140 958 Z" fill="#9FE0FF" />
		<rect x={262} y={582} width={16} height={376} fill="#FFFFFF" />
		<rect x={112} y={760} width={316} height={16} fill="#FFFFFF" />
		{/* poster */}
		<g transform="rotate(4 560 520)">
			<rect x={490} y={420} width={150} height={200} rx={10} fill={palette.accent} />
			<circle cx={565} cy={500} r={40} fill={palette.accent2} />
			<rect x={515} y={565} width={100} height={14} rx={7} fill="#FFFFFF" />
		</g>
		{/* bunk bed */}
		<g>
			<rect x={680} y={560} width={24} height={860} rx={8} fill="#8C6A4E" />
			<rect x={1000} y={560} width={24} height={860} rx={8} fill="#8C6A4E" />
			<rect x={690} y={820} width={330} height={60} rx={20} fill="#5EC4F2" />
			<rect x={700} y={790} width={110} height={44} rx={18} fill="#FFFFFF" />
			<rect x={690} y={1240} width={330} height={60} rx={20} fill={palette.accent2} />
			<rect x={700} y={1210} width={110} height={44} rx={18} fill="#FFFFFF" />
			<rect x={680} y={880} width={344} height={20} fill="#8C6A4E" />
			<rect x={680} y={1300} width={344} height={20} fill="#8C6A4E" />
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={966} y={930 + i * 70} width={58} height={12} rx={6} fill="#A9835F" />
			))}
		</g>
		{/* desk + lamp */}
		<rect x={60} y={1200} width={420} height={26} rx={10} fill="#A9835F" />
		<rect x={80} y={1226} width={22} height={180} fill="#8C6A4E" />
		<rect x={438} y={1226} width={22} height={180} fill="#8C6A4E" />
		<path d="M380 1200 L380 1090 L320 1050" stroke={palette.text} strokeWidth={10} fill="none" strokeLinecap="round" />
		<path d="M280 1020 L360 1040 L330 1090 Z" fill={palette.accent} />
		<path d="M300 1090 L250 1200 L420 1200 Z" fill={palette.accent2} opacity={0.25 + 0.1 * Math.sin(frame * 0.5)} />
		<rect x={120} y={1130} width={120} height={70} rx={10} fill="#5EC4F2" />
		<rect x={140} y={1110} width={80} height={22} rx={6} fill={palette.accent} />
		{/* rug */}
		<ellipse cx={600} cy={1640} rx={360} ry={90} fill={palette.accent} opacity={0.35} />
	</svg>
);

export const Hook: React.FC<SceneProps> = ({scene}) => {
	const f = useCurrentFrame();
	// резкий зум: камера «влетает» в комнату
	const z = pop(f, 0, {damping: 16, stiffness: 260, mass: 0.6});
	const scale = 2.6 - 1.6 * z;
	const blinkOn = Math.floor(f / 7) % 2 === 0;
	const t1 = pop(f, 3, {damping: 8, stiffness: 240});
	const t2 = pop(f, beat(scene, 'subtitle', 0.6), {damping: 9, stiffness: 220});
	return (
		<AbsoluteFill style={{background: palette.bg}}>
			<AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '50% 45%'}}>
				<DormRoom frame={f} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'rgba(26,26,26,0.18)'}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40, padding: '0 70px'}}>
				<div
					style={{
						fontFamily: fontStack,
						fontWeight: 900,
						fontSize: 118,
						lineHeight: 1.02,
						textAlign: 'center',
						color: blinkOn ? palette.text : palette.white,
						background: blinkOn ? palette.white : palette.accent,
						borderRadius: 40,
						padding: '34px 44px 40px',
						boxShadow: `0 16px 0 rgba(26,26,26,0.25)`,
						transform: `scale(${t1}) rotate(${-3 * t1}deg)`,
					}}
				>
					<RichText text={scene.title} size={118} t={f} />
				</div>
				<div
					style={{
						fontFamily: fontStack,
						fontWeight: 900,
						fontSize: 72,
						color: palette.text,
						background: palette.accent2,
						borderRadius: 28,
						padding: '18px 34px 22px',
						boxShadow: `0 12px 0 rgba(26,26,26,0.25)`,
						transform: `scale(${t2}) rotate(${2 * t2}deg)`,
						opacity: f < beat(scene, 'subtitle', 0.6) ? 0 : 1,
					}}
				>
					<RichText text={scene.subtitle ?? ''} size={72} t={f} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

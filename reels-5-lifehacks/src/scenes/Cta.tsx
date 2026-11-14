import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {palette} from '../config';
import {fontStack} from '../fonts';
import {beat, pop, rand} from '../lib';
import {RichText} from '../components/Emoji';
import {Star} from '../components/Fx';
import {SceneProps} from './types';

const Bookmark: React.FC<{frame: number}> = ({frame}) => (
	<svg width={260} height={320} viewBox="-130 -20 260 320" style={{overflow: 'visible'}}>
		<g transform={`rotate(${Math.sin(frame * 0.18) * 9} 0 0)`}>
			<path d="M-90 0 L90 0 Q110 0 110 20 L110 280 L0 210 L-110 280 L-110 20 Q-110 0 -90 0 Z" fill={palette.accent2} />
			<path d="M-60 40 L-60 170" stroke="#FFFFFF" strokeWidth={18} strokeLinecap="round" opacity={0.6} />
		</g>
	</svg>
);

export const Cta: React.FC<SceneProps> = ({scene}) => {
	const f = useCurrentFrame();
	const t1 = pop(f, 4, {damping: 9, stiffness: 200});
	const t2 = pop(f, beat(scene, 'subtitle', 0.8), {damping: 11});
	const bm = pop(f, 0, {damping: 8, stiffness: 180});
	return (
		<AbsoluteFill style={{background: palette.accent}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
				{Array.from({length: 16}).map((_, i) => (
					<Star key={i} x={rand(i + 3) * 1080} y={360 + rand(i + 70) * 1200} r={(10 + rand(i) * 16) * (0.5 + 0.5 * Math.sin(f * 0.3 + i))} color={i % 2 ? palette.accent2 : palette.white} rot={f * 2} />
				))}
			</svg>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50, padding: '0 80px', paddingBottom: 260}}>
				<div style={{transform: `scale(${bm})`}}>
					<Bookmark frame={f} />
				</div>
				<div
					style={{
						fontFamily: fontStack,
						fontWeight: 900,
						fontSize: 104,
						lineHeight: 1.05,
						color: palette.white,
						textAlign: 'center',
						transform: `scale(${t1})`,
						textShadow: '0 8px 0 rgba(26,26,26,0.25)',
					}}
				>
					<RichText text={scene.title} size={104} t={f} />
				</div>
				<div
					style={{
						fontFamily: fontStack,
						fontWeight: 800,
						fontSize: 56,
						lineHeight: 1.15,
						maxWidth: 760,
						color: palette.text,
						background: palette.white,
						padding: '24px 40px 28px',
						borderRadius: 30,
						textAlign: 'center',
						boxShadow: '0 12px 0 rgba(26,26,26,0.2)',
						transform: `translateY(${(1 - t2) * 200}px)`,
						opacity: Math.min(1, t2 * 2),
					}}
				>
					<RichText text={scene.subtitle ?? ''} size={56} t={f} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

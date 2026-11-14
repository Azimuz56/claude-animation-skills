import React from 'react';
import {useCurrentFrame} from 'remotion';
import {palette, safeZone} from '../config';
import {fontStack} from '../fonts';
import {pop} from '../lib';
import {RichText} from './Emoji';

/** Заголовок-стикер сверху сцены. Верх стикера — ниже safeZone.top + прогресс-бар. */
export const Headline: React.FC<{text: string; start?: number; size?: number; tilt?: number; dark?: boolean}> = ({text, start = 4, size = 92, tilt = -2, dark}) => {
	const f = useCurrentFrame();
	const s = pop(f, start, {damping: 9, stiffness: 200});
	return (
		<div style={{position: 'absolute', top: safeZone.top + 90, left: safeZone.side, right: safeZone.side, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: fontStack,
					fontWeight: 900,
					fontSize: size,
					lineHeight: 1.08,
					color: dark ? palette.white : palette.text,
					background: dark ? palette.accent : palette.white,
					padding: '22px 40px 26px',
					borderRadius: 34,
					textAlign: 'center',
					boxShadow: `0 14px 0 ${dark ? 'rgba(0,0,0,0.25)' : palette.shadow}`,
					transform: `scale(${s}) rotate(${tilt * s}deg)`,
					opacity: Math.min(1, s * 2),
					maxWidth: 900,
				}}
			>
				<RichText text={text} size={size} t={f} />
			</div>
		</div>
	);
};

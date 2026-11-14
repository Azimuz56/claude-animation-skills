import React from 'react';
import {useCurrentFrame} from 'remotion';
import {palette, safeZone, video} from '../config';
import {fontStack} from '../fonts';
import {pop} from '../lib';
import {RichText} from './Emoji';

/** Подпись-итог внизу. Низ карточки на 20px выше safeZone.bottom, справа отступ под кнопки Reels. */
export const Caption: React.FC<{text: string; start: number; size?: number}> = ({text, start, size = 60}) => {
	const f = useCurrentFrame();
	if (f < start) return null;
	const s = pop(f, start, {damping: 12, stiffness: 160});
	return (
		<div
			style={{
				position: 'absolute',
				bottom: safeZone.bottom + 20,
				left: safeZone.side,
				right: safeZone.rightRail,
				display: 'flex',
				justifyContent: 'center',
				transform: `translateY(${(1 - s) * 260}px)`,
			}}
		>
			<div
				style={{
					fontFamily: fontStack,
					fontWeight: 800,
					fontSize: size,
					lineHeight: 1.15,
					color: palette.text,
					background: palette.accent2,
					padding: '26px 36px 30px',
					borderRadius: 30,
					textAlign: 'center',
					boxShadow: `0 12px 0 ${palette.shadow}`,
					maxWidth: video.width - safeZone.side - safeZone.rightRail,
				}}
			>
				<RichText text={text} size={size} t={f} />
			</div>
		</div>
	);
};

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {palette, progressCount, safeZone} from '../config';
import {fontStack} from '../fonts';
import {pop, timeline} from '../lib';

/** Счётчик «1/5 … 5/5» сверху: 5 полосок, текущая — акцентом, пройденные — жёлтым. */
export const ProgressBar: React.FC = () => {
	const f = useCurrentFrame();
	const idx = timeline.findIndex((t) => f >= t.from && f < t.from + t.durationInFrames);
	const cur = timeline[Math.max(0, idx)];
	const p = cur.scene.progress;
	const local = f - cur.from;
	const isAll = p === 'all';
	const n = isAll ? progressCount : (p as number);
	const barW = 128;
	const gap = 16;
	return (
		<div style={{position: 'absolute', top: safeZone.top, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
			<div style={{display: 'flex', gap}}>
				{Array.from({length: progressCount}).map((_, i) => {
					const k = i + 1;
					let fill = 0;
					let color = palette.accent;
					if (isAll) {
						fill = pop(local, 4 + i * 4, {damping: 14});
						color = palette.accent2;
					} else if (k < n) {
						fill = 1;
						color = palette.accent2;
					} else if (k === n) {
						fill = pop(local, 2, {damping: 14});
					}
					const glow = k === n && !isAll ? 1 : isAll ? fill : 0;
					return (
						<div
							key={i}
							style={{
								width: barW,
								height: 22,
								borderRadius: 11,
								background: isAll ? 'rgba(255,255,255,0.35)' : palette.muted,
								overflow: 'hidden',
								boxShadow: glow ? `0 0 ${18 * glow}px ${color}` : 'none',
								transform: k === n && !isAll ? `scaleY(${1 + 0.25 * fill})` : undefined,
							}}
						>
							<div style={{width: `${fill * 100}%`, height: '100%', background: color, borderRadius: 11}} />
						</div>
					);
				})}
			</div>
			<div
				style={{
					fontFamily: fontStack,
					fontWeight: 900,
					fontSize: 44,
					color: isAll ? palette.white : palette.text,
					minWidth: 90,
					opacity: n === 0 ? 0.35 : 1,
				}}
			>
				{n}/{progressCount}
			</div>
		</div>
	);
};

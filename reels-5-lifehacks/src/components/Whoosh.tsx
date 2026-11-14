import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {audio, palette} from '../config';
import {timeline} from '../lib';

/** «Вжух»-шторка: на каждой смене сцены диагональные полосы проносятся через кадр и прячут склейку. */
export const WhooshTransitions: React.FC = () => {
	const f = useCurrentFrame();
	const half = audio.transitionFrames / 2;
	const cut = timeline.slice(1).find((t) => Math.abs(f - t.from) <= half + 1);
	if (!cut) return null;
	const p = interpolate(f, [cut.from - half, cut.from + half], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
	const bands = [palette.accent2, palette.accent, palette.text];
	return (
		<AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
			{bands.map((c, i) => {
				const lag = (i - 1) * 0.07;
				const w = [2600, 2200, 1200][i];
				const center = 540 + (0.5 + lag - p) * 5200;
				return (
					<div
						key={i}
						style={{position: 'absolute', top: -700, left: center - w / 2, width: w, height: 3320, background: c, transform: 'rotate(18deg)'}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

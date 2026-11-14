import React from 'react';
import {palette} from '../config';
import {fontStack} from '../fonts';

/**
 * Мультяшная микроволновка. Координаты: центр (cx, cy), ширина 700.
 * door: 0 — закрыта, 1 — открыта. on: 0..1 свечение внутри. children рисуются в «окне» (локальные координаты окна 0..420 × 0..250).
 */
export const Microwave: React.FC<{cx: number; cy: number; scale?: number; door: number; on: number; timer: string; frame: number; children?: React.ReactNode; dingFlash?: number}> = ({cx, cy, scale = 1, door, on, timer, frame, children, dingFlash = 0}) => {
	const W = 700, H = 420;
	const wx = 50, wy = 70, ww = 420, wh = 280;
	const doorScaleX = Math.cos((door * Math.PI) / 2 * 0.92);
	const shake = on > 0.5 ? Math.sin(frame * 2.2) * 1.5 : 0;
	return (
		<g transform={`translate(${cx - (W / 2) * scale + shake} ${cy - (H / 2) * scale}) scale(${scale})`}>
			<rect x={10} y={H - 6} width={W - 20} height={24} rx={12} fill="rgba(26,26,26,0.12)" />
			<rect x={0} y={0} width={W} height={H} rx={46} fill="#F4F4F6" />
			<rect x={0} y={H - 40} width={W} height={40} rx={20} fill="#DADCE3" />
			<rect x={70} y={H - 8} width={60} height={22} rx={8} fill="#A9ADB8" />
			<rect x={W - 130} y={H - 8} width={60} height={22} rx={8} fill="#A9ADB8" />
			{/* cavity */}
			<rect x={wx} y={wy} width={ww} height={wh} rx={26} fill="#3B3F57" />
			<rect x={wx} y={wy} width={ww} height={wh} rx={26} fill={palette.accent2} opacity={0.75 * on} />
			<ellipse cx={wx + ww / 2} cy={wy + wh - 26} rx={150} ry={20} fill={on > 0 ? '#FFE9A8' : '#585D78'} />
			<svg x={wx} y={wy} width={ww} height={wh} overflow="hidden">
				{children}
			</svg>
			{/* door (hinged left) */}
			<g transform={`translate(${wx - 20} 0) scale(${doorScaleX} 1) translate(${-(wx - 20)} 0)`}>
				<rect x={wx - 20} y={wy - 20} width={ww + 40} height={wh + 40} rx={36} fill="none" stroke="#C9CCD6" strokeWidth={20} />
				<rect x={wx} y={wy} width={ww} height={wh} rx={26} fill="rgba(150,210,255,0.18)" />
				<path d={`M${wx + 40} ${wy + 30} L${wx + 110} ${wy + 30} L${wx + 40} ${wy + 110} Z`} fill="rgba(255,255,255,0.28)" />
				<rect x={wx + ww + 4} y={wy + 60} width={14} height={160} rx={7} fill="#A9ADB8" />
			</g>
			{/* panel */}
			<rect x={505} y={70} width={150} height={86} rx={18} fill={palette.text} />
			<text x={580} y={128} textAnchor="middle" fontFamily={fontStack} fontWeight={800} fontSize={46} fill={dingFlash > 0 && Math.floor(frame / 4) % 2 === 0 ? palette.accent2 : '#7CF29C'}>
				{timer}
			</text>
			{[0, 1, 2].map((r) =>
				[0, 1, 2].map((c) => <rect key={`${r}${c}`} x={515 + c * 46} y={180 + r * 46} width={34} height={30} rx={8} fill="#DADCE3" />),
			)}
			<circle cx={580} cy={348} r={26} fill={palette.accent} />
		</g>
	);
};

/** форматирует секунды как m:ss */
export const fmtTimer = (s: number) => {
	const v = Math.max(0, Math.ceil(s));
	return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
};

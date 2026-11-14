import React from 'react';
import {palette} from '../config';

/** Плоские векторные версии эмодзи — одинаково выглядят на любом компьютере. */
export const MindBlown: React.FC<{size: number; t?: number}> = ({size, t = 0}) => {
	const puff = 1 + 0.08 * Math.sin(t * 0.4);
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'inline-block', verticalAlign: '-0.18em', overflow: 'visible'}}>
			<g transform={`translate(50 26) scale(${puff}) translate(-50 -26)`}>
				<circle cx="30" cy="22" r="13" fill="#B9B4C9" />
				<circle cx="50" cy="14" r="16" fill="#D6D1E3" />
				<circle cx="70" cy="22" r="13" fill="#B9B4C9" />
				<path d="M38 30 L44 12 L50 28 L58 8 L62 30 Z" fill={palette.accent} />
				<path d="M44 30 L50 18 L56 30 Z" fill={palette.accent2} />
			</g>
			<path d="M14 52 Q14 34 30 34 L70 34 Q86 34 86 52 L86 62 Q86 92 50 92 Q14 92 14 62 Z" fill={palette.accent2} />
			<path d="M14 46 Q14 34 30 34 L70 34 Q86 34 86 46 L86 48 L14 48 Z" fill="#F29E2E" />
			<ellipse cx="36" cy="60" rx="6" ry="8" fill={palette.text} />
			<ellipse cx="64" cy="60" rx="6" ry="8" fill={palette.text} />
			<ellipse cx="50" cy="78" rx="8" ry="7" fill={palette.text} />
		</svg>
	);
};

export const Pin: React.FC<{size: number; t?: number}> = ({size, t = 0}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'inline-block', verticalAlign: '-0.18em', overflow: 'visible'}}>
		<g transform={`rotate(${-20 + 8 * Math.sin(t * 0.25)} 50 90)`}>
			<path d="M50 60 L50 96" stroke="#9AA3AE" strokeWidth="6" strokeLinecap="round" />
			<path d="M28 58 Q50 44 72 58 L66 40 L62 18 L38 18 L34 40 Z" fill={palette.accent} />
			<rect x="30" y="6" width="40" height="16" rx="7" fill="#E2401E" />
			<path d="M40 24 L38 44" stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeLinecap="round" />
		</g>
	</svg>
);

const map: Record<string, React.FC<{size: number; t?: number}>> = {'🤯': MindBlown, '📌': Pin};

/** Текст, в котором известные эмодзи заменены на SVG */
export const RichText: React.FC<{text: string; size: number; t?: number}> = ({text, size, t}) => {
	const keys = Object.keys(map);
	const parts = text.split(new RegExp(`(${keys.join('|')})`, 'u'));
	return (
		<>
			{parts.map((p, i) => {
				const C = map[p];
				return C ? <C key={i} size={size * 1.1} t={t} /> : <React.Fragment key={i}>{p}</React.Fragment>;
			})}
		</>
	);
};

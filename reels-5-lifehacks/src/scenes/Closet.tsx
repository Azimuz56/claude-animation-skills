import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {palette} from '../config';
import {fontStack} from '../fonts';
import {beat, lerp, pop, prog} from '../lib';
import {Headline} from '../components/Headline';
import {Caption} from '../components/Caption';
import {Sparkles} from '../components/Fx';
import {SceneProps} from './types';

const COLORS = [palette.accent, palette.blue, palette.accent2, palette.green, '#B58CF2', '#FF8FB1'];

/** Вешалка. (0,0) — верх крючка. ring — показать кольцо-открывашку на шейке */
export const Hanger: React.FC<{ring?: boolean; garment?: string; stroke?: number}> = ({ring, garment, stroke = 9}) => (
	<g>
		{garment && <Garment color={garment} />}
		<path d="M-14 18 Q-14 0 0 0 Q14 0 14 18 Q14 30 0 34 L0 48" fill="none" stroke="#8E96A3" strokeWidth={stroke} strokeLinecap="round" />
		<path d="M0 48 L-110 108 Q-118 114 -108 116 L108 116 Q118 114 110 108 Z" fill="none" stroke="#8E96A3" strokeWidth={stroke} strokeLinejoin="round" />
		{ring && <PullRing x={0} y={40} s={0.55} />}
	</g>
);

/** Футболка, висящая на плечиках вешалки (плечи на y≈110) */
const Garment: React.FC<{color: string}> = ({color}) => (
	<path d="M-40 96 Q0 120 40 96 L112 122 L136 180 L96 196 L90 168 L90 300 L-90 300 L-90 168 L-96 196 L-136 180 L-112 122 Z" fill={color} />
);

/** Кольцо-открывашка от банки. (x,y) — центр верхнего (малого) отверстия */
export const PullRing: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
		<path d="M-40 -30 Q-40 -50 0 -50 Q40 -50 40 -30 L48 70 Q50 130 0 132 Q-50 130 -48 70 Z" fill="#D7DCE3" stroke="#A7AFBA" strokeWidth={6} />
		<ellipse cx={0} cy={-18} rx={22} ry={18} fill={palette.bg} stroke="#A7AFBA" strokeWidth={5} />
		<ellipse cx={0} cy={76} rx={30} ry={38} fill={palette.bg} stroke="#A7AFBA" strokeWidth={5} />
		<path d="M-30 30 Q0 40 30 30" stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.8} />
	</g>
);

const Wardrobe: React.FC<{children: React.ReactNode; shake?: number}> = ({children, shake = 0}) => (
	<g transform={`rotate(${shake} 540 1300)`}>
		<rect x={170} y={560} width={740} height={760} rx={30} fill="#B88A63" />
		<rect x={200} y={590} width={680} height={700} rx={16} fill="#7A5A41" />
		<rect x={200} y={640} width={680} height={14} rx={7} fill="#D7DCE3" />
		<path d="M170 580 L90 610 L90 1300 L170 1320 Z" fill="#C99A70" />
		<path d="M910 580 L990 610 L990 1300 L910 1320 Z" fill="#C99A70" />
		<circle cx={150} cy={950} r={10} fill={palette.accent2} />
		<circle cx={930} cy={950} r={10} fill={palette.accent2} />
		{children}
		<rect x={190} y={1320} width={40} height={30} rx={6} fill="#8C6A4E" />
		<rect x={850} y={1320} width={40} height={30} rx={6} fill="#8C6A4E" />
	</g>
);

export const Closet: React.FC<SceneProps> = ({scene}) => {
	const f = useCurrentFrame();
	const B = (n: string) => beat(scene, n);
	const messPhase = f < B('ring');
	const zoomPhase = f >= B('ring') && f < B('neat');
	const neatPhase = f >= B('neat');

	// --- mess
	const shake = messPhase ? Math.sin(f * 0.9) * 1.6 : 0;
	const falls = [0.6, 1.3, 1.9].map((t) => Math.round(t * 30));

	// --- close-up
	const zIn = pop(f, B('ring'), {damping: 14});
	const ringT = prog(f, B('ring') + 8, B('ringOn'), Easing.inOut(Easing.cubic));
	const ringOnPop = pop(f, B('ringOn'), {damping: 7, stiffness: 260});
	const zoomOut = prog(f, B('cascade') - 14, B('cascade') + 2);
	const hScale = lerp(3, 1.55, zoomOut);
	const hTop = lerp(700, 680, zoomOut);

	// --- neat
	const nIn = pop(f, B('neat'), {damping: 14});
	const glow = 0.55 + 0.45 * Math.sin((f - B('neat')) * 0.25);

	return (
		<AbsoluteFill style={{background: palette.bg}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
				<rect x={0} y={1330} width={1080} height={590} fill="#FFE2B3" />
				{messPhase && (
					<g>
						<Wardrobe shake={shake}>
							{Array.from({length: 12}).map((_, i) => (
								<g key={i} transform={`translate(${250 + i * 52 + Math.sin(f * 0.8 + i) * 4} 628) rotate(${Math.sin(f * 0.6 + i * 2) * 4}) scale(0.95 1.15)`}>
									<Hanger garment={COLORS[i % COLORS.length]} />
								</g>
							))}
							{/* bulging pile at bottom */}
							{Array.from({length: 7}).map((_, i) => (
								<ellipse key={i} cx={260 + i * 92} cy={1250 - (i % 2) * 20} rx={70} ry={42} fill={COLORS[(i + 2) % COLORS.length]} />
							))}
						</Wardrobe>
						{falls.map((t0, i) => {
							if (f < t0) return null;
							const t = prog(f, t0, t0 + 14, Easing.in(Easing.quad));
							const x = 300 + i * 230 + t * (i - 1) * 60;
							const y = lerp(1200, 1450, t);
							return <rect key={i} x={x - 60} y={y - 30} width={120} height={60} rx={26} fill={COLORS[(i + 3) % COLORS.length]} transform={`rotate(${t * (i % 2 ? 40 : -40)} ${x} ${y})`} />;
						})}
					</g>
				)}
				{zoomPhase && (
					<g opacity={Math.min(1, zIn * 1.5)}>
						<circle cx={540} cy={1030} r={lerp(80, 420, zIn)} fill="#FFFFFF" />
						<circle cx={540} cy={1030} r={lerp(80, 420, zIn)} fill="none" stroke={palette.accent2} strokeWidth={18} />
						<svg x={70} y={490} width={940} height={940} viewBox="70 490 940 940">
							<clipPath id="lens">
								<circle cx={540} cy={1030} r={lerp(80, 412, zIn)} />
							</clipPath>
							<g clipPath="url(#lens)">
								<rect x={70} y={600} width={940} height={20} fill="#D7DCE3" />
								{/* cascade chain */}
								{[0, 1, 2, 3].map((i) => {
									const appear = i === 0 ? 1 : pop(f, B('cascade') + i * 9, {damping: 10});
									if (i > 0 && f < B('cascade') + i * 9) return null;
									const y = hTop - 30 + i * 86 * hScale;
									const swing = i > 0 ? Math.sin((f - B('cascade') - i * 9) * 0.3) * 10 * (1 - appear) : 0;
									return (
										<g key={i} transform={`translate(540 ${y - (1 - appear) * 60}) scale(${hScale}) rotate(${swing})`} opacity={i === 0 ? 1 : appear}>
											<Hanger ring={i === 0 ? f >= B('ringOn') : f >= B('cascade') + i * 9} stroke={9 / Math.max(1, hScale / 1.8)} />
										</g>
									);
								})}
								{/* ring flying to hook */}
								{f < B('ringOn') && <PullRing x={lerp(760, 540, ringT)} y={lerp(1260, hTop - 30 + 40 * hScale, ringT)} s={0.55 * hScale} rot={lerp(70, 0, ringT)} />}
								{f >= B('ringOn') && f < B('ringOn') + 12 && <circle cx={540} cy={hTop - 30 + 40 * hScale} r={60 + 80 * ringOnPop} fill="none" stroke={palette.accent} strokeWidth={10} opacity={1 - (f - B('ringOn')) / 12} />}
							</g>
						</svg>
					</g>
				)}
				{neatPhase && (
					<g transform={`translate(540 960) scale(${0.85 + 0.15 * nIn}) translate(-540 -960)`}>
						<Wardrobe>
							{[0, 1, 2].map((c) => (
								<g key={c}>
									{[0, 1, 2].map((r) => (
										<g key={r} transform={`translate(${285 + c * 95} ${628 + r * 70}) scale(0.55 0.8)`}>
											<Hanger ring garment={COLORS[(c * 3 + r) % COLORS.length]} />
										</g>
									))}
								</g>
							))}
							<rect x={565} y={680} width={295} height={580} rx={24} fill={palette.accent2} opacity={0.2 * glow} />
							<rect x={565} y={680} width={295} height={580} rx={24} fill="none" stroke={palette.accent2} strokeWidth={10} strokeDasharray="34 22" strokeDashoffset={-(f - B('neat')) * 3} opacity={glow} />
							<text x={712} y={990} textAnchor="middle" fontFamily={fontStack} fontWeight={900} fontSize={62} fill={palette.accent2}>
								+место
							</text>
						</Wardrobe>
						<Sparkles frame={f} start={B('neat') + 6} cx={712} cy={970} rx={220} ry={330} count={10} seed={5} />
					</g>
				)}
			</svg>
			<Headline text={scene.title} />
			{scene.caption && <Caption text={scene.caption} start={beat(scene, 'caption')} size={54} />}
		</AbsoluteFill>
	);
};


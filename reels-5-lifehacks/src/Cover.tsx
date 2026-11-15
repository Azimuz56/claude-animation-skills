import React from 'react';
import {AbsoluteFill} from 'remotion';
import {cover, palette} from './config';
import {fontStack, loadFonts} from './fonts';
import {RichText} from './components/Emoji';
import {Sparkles, Star} from './components/Fx';
import {Mug} from './scenes/Omelet';
import {Baguette} from './scenes/Bread';
import {Hanger} from './scenes/Closet';
import {ShirtShape, HangerTop} from './scenes/Shirt';
import {Shoe, TeaBag} from './scenes/Sneaker';
import {rand} from './lib';

loadFonts();

/** Обложка Reels: те же персонажи, что в ролике, крупный заголовок по центру. */
export const Cover: React.FC = () => {
	const f = 40; // «кадр» для мелкой анимации (моргание, блёстки) — на обложке статичен
	return (
		<AbsoluteFill style={{background: palette.accent}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
				{/* лучи */}
				<g transform="translate(540 1030)">
					{Array.from({length: 18}).map((_, i) => (
						<path key={i} d="M0 0 L-120 -1400 L120 -1400 Z" fill="#FF7351" transform={`rotate(${i * 20})`} />
					))}
				</g>
				<circle cx={540} cy={1150} r={400} fill={palette.bg} />
				<circle cx={540} cy={1150} r={400} fill="none" stroke={palette.accent2} strokeWidth={22} />
				{/* звёздочки на фоне */}
				{Array.from({length: 14}).map((_, i) => (
					<Star key={i} x={60 + rand(i + 5) * 960} y={300 + rand(i + 50) * 1300} r={10 + rand(i) * 14} color={i % 2 ? palette.accent2 : palette.white} rot={i * 25} />
				))}
				{/* персонажи пяти лайфхаков */}
				<g transform="translate(250 980) rotate(-10) scale(0.42)">
					<HangerTop />
					<g transform="translate(0 10)">
						<ShirtShape wrinkle={0} frame={f} />
					</g>
				</g>
				<g transform="translate(850 870) rotate(12) scale(1.05)">
					<Hanger ring garment={palette.blue} />
				</g>
				<g transform="translate(300 1400) rotate(-8) scale(0.62)">
					<Baguette fresh={1} frame={f} />
				</g>
				<g transform="translate(790 1410) rotate(6) scale(0.62)">
					<Shoe />
					<g transform="translate(-90 -110)">
						<TeaBag tagOnly />
					</g>
				</g>
				<g transform="translate(540 1185) scale(0.95)">
					<Mug level={0.64} mix={1} puff={1} frame={f} />
				</g>
				<Sparkles frame={f + 30} start={f} cx={540} cy={1150} rx={430} ry={380} count={14} seed={21} />
			</svg>

			{/* заголовок */}
			<div style={{position: 'absolute', top: 300, left: 60, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				{cover.kicker && (
					<div style={{fontFamily: fontStack, fontWeight: 900, fontSize: 44, letterSpacing: 4, color: palette.text, background: palette.accent2, padding: '8px 26px 10px', borderRadius: 18, transform: 'rotate(-3deg)', marginBottom: -14, zIndex: 2, boxShadow: '0 8px 0 rgba(26,26,26,0.25)'}}>
						{cover.kicker}
					</div>
				)}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 26,
						background: palette.white,
						borderRadius: 44,
						padding: '18px 44px 26px 30px',
						transform: 'rotate(-3deg)',
						boxShadow: '0 18px 0 rgba(26,26,26,0.28)',
					}}
				>
					<div style={{fontFamily: fontStack, fontWeight: 900, fontSize: 250, lineHeight: 0.9, color: palette.accent, WebkitTextStroke: `10px ${palette.text}`, paintOrder: 'stroke fill'}}>{cover.number}</div>
					<div style={{fontFamily: fontStack, fontWeight: 900, lineHeight: 0.98, color: palette.text}}>
						<div style={{fontSize: 104}}>{cover.title}</div>
						<div style={{fontSize: 92, color: palette.accent}}>{cover.subtitle}</div>
					</div>
				</div>
			</div>

			{/* плашка снизу */}
			<div style={{position: 'absolute', top: 1478, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{fontFamily: fontStack, fontWeight: 900, fontSize: 68, color: palette.text, background: palette.accent2, padding: '14px 40px 20px', borderRadius: 30, transform: 'rotate(2deg)', boxShadow: '0 12px 0 rgba(26,26,26,0.28)'}}>
					<RichText text={cover.badge} size={68} t={f} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

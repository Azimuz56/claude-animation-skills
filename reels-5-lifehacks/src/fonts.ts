import {continueRender, delayRender, staticFile} from 'remotion';
import {font} from './config';

// Montserrat (OFL), локальные файлы: латиница + кириллица, 800 и 900.
const faces = [800, 900].flatMap((w) => [
	{w, file: `fonts/montserrat-latin-${w}-normal.woff2`, range: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+FEFF,U+FFFD,U+00D7'},
	{w, file: `fonts/montserrat-cyrillic-${w}-normal.woff2`, range: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'},
]);

let loaded = false;
export const loadFonts = () => {
	if (loaded || typeof document === 'undefined') return;
	loaded = true;
	const handle = delayRender('Loading Montserrat');
	Promise.all(
		faces.map((f) => {
			const ff = new FontFace(font.family, `url(${staticFile(f.file)}) format('woff2')`, {weight: String(f.w), unicodeRange: f.range});
			return ff.load().then((l) => (document.fonts as unknown as Set<FontFace>).add(l));
		}),
	)
		.then(() => continueRender(handle))
		.catch((e) => {
			console.error(e);
			continueRender(handle);
		});
};

export const fontStack = `'${font.family}', 'Inter', 'Noto Color Emoji', sans-serif`;

/**
 * ЕДИНЫЙ КОНФИГ ВЫПУСКА.
 * Здесь все тексты, цвета, тайминги и звуки. Сцены (src/scenes/*) только рисуют.
 *
 * Все времена — в СЕКУНДАХ.
 *  - `duration` — длина сцены; сцены идут подряд, старт считается автоматически.
 *  - `beats`    — моменты внутри сцены (от её начала): когда что падает, звенит и т.д.
 *  - `sfx`      — звуковые эффекты внутри сцены: { at: секунда, sound: имя файла из public/audio без .wav }
 *
 * Эмодзи 🤯 и 📌 рисуются векторными иконками (src/components/Emoji.tsx), остальные — системным шрифтом.
 */

export const video = {
	id: 'Reels5Lifehacks',
	width: 1080,
	height: 1920,
	fps: 30,
	outputFile: 'out/reels_5_lifehacks.mp4',
};

export const palette = {
	bg: '#FFF4E0',
	accent: '#FF5A36',
	text: '#1A1A1A',
	accent2: '#FFC93C',
	white: '#FFFFFF',
	shadow: 'rgba(26,26,26,0.16)',
	muted: '#E9D9BD', // неактивные точки прогресса, мелкие детали
	night: '#1E2347',
	green: '#7BC86C',
	blue: '#5EC4F2',
};

export const font = {
	family: 'Montserrat',
	weight: 800, // 800 = ExtraBold, 900 = Black
};

/** Зоны интерфейса Reels: текст не заходит сюда. */
export const safeZone = {
	top: 250,
	bottom: 400,
	side: 70,
	/** колонка кнопок справа (лайк/коммент/поделиться) — нижнюю подпись держим левее */
	rightRail: 150,
};

export const audio = {
	beat: 'beat', // public/audio/beat.wav
	beatVolume: 0.32,
	sfxVolume: 0.7,
	transitionSound: 'whoosh', // играет на каждой смене сцены
	transitionFrames: 14, // длина «вжух»-шторки (кадров)
};

export type Sfx = {at: number; sound: string; volume?: number};

export type SceneConfig = {
	/** имя компонента-сцены из src/scenes/index.ts */
	component: string;
	duration: number;
	/** номер лайфхака для прогресс-бара (1..5); 0 — хук, 'all' — финал */
	progress: number | 'all';
	title: string;
	subtitle?: string;
	caption?: string;
	beats: Record<string, number>;
	sfx: Sfx[];
};

export const scenes: SceneConfig[] = [
	{
		component: 'Hook',
		duration: 2,
		progress: 0,
		title: '5 лайфхаков для общаги',
		subtitle: '№5 — гениальный 🤯',
		beats: {subtitle: 0.6},
		sfx: [{at: 0, sound: 'click'}, {at: 0.6, sound: 'click', volume: 0.6}],
	},
	{
		component: 'Omelet',
		duration: 11,
		progress: 1,
		title: 'Омлет без плиты',
		caption: '2 яйца + молоко + сыр → 90 сек',
		beats: {
			egg: 0.7, // яйцо начинает падать
			eggHit: 1.4, // трескается о кружку
			milk: 2.4,
			cheese: 3.7,
			stir: 4.7,
			stirEnd: 6.0,
			toMicrowave: 6.2,
			timerStart: 7.0,
			timerEnd: 8.9,
			ding: 9.0,
			caption: 9.3,
		},
		sfx: [
			{at: 1.4, sound: 'crack'},
			{at: 1.55, sound: 'plop'},
			{at: 2.9, sound: 'plop'},
			{at: 4.2, sound: 'plop'},
			{at: 4.8, sound: 'click', volume: 0.5},
			{at: 5.3, sound: 'click', volume: 0.5},
			{at: 6.85, sound: 'click'},
			{at: 9.0, sound: 'ding'},
			{at: 9.2, sound: 'sparkle', volume: 0.6},
		],
	},
	{
		component: 'Bread',
		duration: 10,
		progress: 2,
		title: 'Не выбрасывай!',
		caption: 'Вода + 20 сек = как свежий',
		beats: {
			sadEnd: 2.2,
			water: 2.3,
			waterEnd: 4.0,
			toMicrowave: 4.2,
			timerStart: 4.9,
			timerEnd: 6.7,
			ding: 6.8,
			caption: 7.4,
		},
		sfx: [
			{at: 0.4, sound: 'crack', volume: 0.5},
			{at: 2.7, sound: 'plop', volume: 0.6},
			{at: 3.1, sound: 'plop', volume: 0.6},
			{at: 3.5, sound: 'plop', volume: 0.6},
			{at: 4.85, sound: 'click'},
			{at: 6.8, sound: 'ding'},
			{at: 7.0, sound: 'sparkle', volume: 0.6},
		],
	},
	{
		component: 'Closet',
		duration: 11,
		progress: 3,
		title: 'Места в шкафу ×2',
		caption: 'Кольца от банок = бесплатный органайзер',
		beats: {
			messEnd: 2.6,
			ring: 2.8, // крупный план кольца
			ringOn: 4.2, // кольцо надето на крючок
			cascade: 5.2, // вешалки выстраиваются каскадом
			neat: 7.4, // аккуратный шкаф
			caption: 8.0,
		},
		sfx: [
			{at: 0.6, sound: 'plop', volume: 0.7},
			{at: 1.3, sound: 'plop', volume: 0.7},
			{at: 1.9, sound: 'plop', volume: 0.7},
			{at: 4.2, sound: 'click'},
			{at: 5.5, sound: 'click', volume: 0.7},
			{at: 5.8, sound: 'click', volume: 0.7},
			{at: 6.1, sound: 'click', volume: 0.7},
			{at: 7.6, sound: 'sparkle', volume: 0.7},
		],
	},
	{
		component: 'Shirt',
		duration: 11,
		progress: 4,
		title: 'Нет утюга?',
		caption: 'Повесь в ванной во время горячего душа',
		beats: {
			wrinkledEnd: 2.6,
			bathroom: 2.8,
			steam: 3.4,
			smoothStart: 4.6,
			smoothEnd: 8.0,
			caption: 8.0,
		},
		sfx: [
			{at: 2.8, sound: 'click'},
			{at: 8.0, sound: 'sparkle'},
		],
	},
	{
		component: 'Sneaker',
		duration: 10,
		progress: 5,
		title: 'Гениальный 🤯',
		caption: 'Сухие чайные пакетики на ночь',
		beats: {
			teabag: 2.4, // пакетик летит
			teabagIn: 3.3,
			night: 3.8,
			morning: 6.6,
			caption: 7.2,
		},
		sfx: [
			{at: 0.3, sound: 'buzz', volume: 0.5},
			{at: 1.5, sound: 'buzz', volume: 0.5},
			{at: 3.3, sound: 'plop'},
			{at: 6.6, sound: 'ding'},
			{at: 6.8, sound: 'sparkle'},
		],
	},
	{
		component: 'Cta',
		duration: 5,
		progress: 'all',
		title: 'Сохрани, пригодится 📌',
		subtitle: 'Какой лайфхак добавить в часть 2?',
		beats: {subtitle: 0.8},
		sfx: [
			{at: 0.25, sound: 'ding', volume: 0.7},
			{at: 0.9, sound: 'click'},
		],
	},
];

/** Сколько всего лайфхаков в прогресс-баре */
export const progressCount = 5;

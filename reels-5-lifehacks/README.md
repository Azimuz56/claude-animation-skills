# 5 лайфхаков для общаги — Reels на Remotion

Вертикальное видео 1080×1920, 30 fps, 60 с, H.264 + AAC, громкость −14 LUFS (норма Instagram).
Русская озвучка (нейроголос Piper, работает локально, без API-ключей), бит на сэмплах TR-808, эффекты из CC0/Apache-библиотек.
Готовый файл: `out/reels_5_lifehacks.mp4`, ключевые кадры: `out/stills/`.

## Быстрый старт

```bash
npm install
npm run studio      # предпросмотр в браузере с таймлайном
npm run render      # → out/reels_5_lifehacks.mp4 (рендер + нормализация громкости)
```

Готовые звуки и озвучка уже лежат в `public/audio/`, поэтому для простого перерендера Python не нужен.
Python 3 (и numpy для `npm run sfx`) нужен только чтобы **пересобрать** озвучку (`npm run voice`) или звуки (`npm run sfx`).

Если Remotion не может скачать свой Chrome (нет доступа к сети), укажите любой локальный Chromium:
`REMOTION_BROWSER=/путь/к/chrome npm run render`.

## Структура

```
src/config.ts          ← ВСЁ, что меняется от выпуска к выпуску: тексты, озвучка, цвета, шрифт, тайминги, звуки
src/voice-manifest.json← генерируется `npm run voice`: файлы и длительности реплик (руками не править)
src/scenes/            ← одна сцена = один файл (Hook, Omelet, Bread, Closet, Shirt, Sneaker, Cta)
src/scenes/index.ts    ← реестр: имя сцены из конфига → компонент
src/components/        ← общие детали: Headline, Caption, ProgressBar, Whoosh, Microwave, Fx (пар, блёстки), Emoji
src/Video.tsx          ← сборка: сцены подряд + прогресс-бар + «вжух»-переходы + звук
public/audio/*.wav     ← бит и эффекты (источники и лицензии: public/audio/CREDITS.md)
public/audio/voice/    ← озвучка, по файлу на реплику
public/fonts/          ← Montserrat ExtraBold/Black с кириллицей (OFL)
scripts/build-sfx.py   ← сборка бита и эффектов из семплов (сам скачивает исходники)
scripts/setup-voice.sh ← установка Piper TTS и русского голоса
scripts/make-voice.ts  ← синтез озвучки из config.ts + проверка, что реплики помещаются
scripts/tts.py         ← обёртка над Piper (выбор самого разборчивого дубля)
scripts/stills.mjs     ← скриншоты ключевых кадров
scripts/guides.py      ← контактный лист кадров с красными зонами интерфейса Reels
```

## Как поменять текст

Откройте `src/config.ts`, массив `scenes`. У каждой сцены:
- `title` — заголовок-стикер сверху,
- `caption` — жёлтая подпись-итог внизу,
- `subtitle` — вторая строка (хук и финал).

Эмодзи 🤯 и 📌 рисуются векторными иконками; другие эмодзи — системным шрифтом.
Новую векторную иконку можно добавить в `src/components/Emoji.tsx` (словарь `map`).

## Как поменять тайминг

- `duration` — длина сцены в секундах. Старт каждой сцены считается автоматически,
  общая длина ролика = сумма длительностей.
- `beats` — моменты внутри сцены (в секундах от её начала): когда падает яйцо, звенит микроволновка, появляется подпись.
- `sfx` — звуки внутри сцены: `{at: 1.4, sound: 'crack', volume: 0.6}`.
- `audio.transitionFrames` — длина «вжух»-шторки, `audio.beatVolume` / `sfxVolume` — громкость.

## Как поменять цвета и шрифт

`palette` и `font` в `src/config.ts`. Безопасные зоны — `safeZone` (верх 250 px, низ 400 px,
справа 150 px под кнопки Reels). Заголовок и подпись позиционируются от этих чисел.

## Озвучка

Реплики лежат в `src/config.ts` у каждой сцены:

```ts
voice: [
  {at: 0.15, text: 'Первый: омлет без плиты.'},   // at — секунда от начала сцены
  {at: 2.05, text: 'Два яйца, молоко и сыр — прямо в кружку.'},
],
```

Поменяли текст — пересоберите голос и видео:

```bash
npm run setup-voice -- --check   # один раз: Piper + голос (~60 МБ) + модель проверки речи (~240 МБ)
npm run voice                    # синтез только изменённых реплик
npm run render
```

`npm run voice` печатает тайминг каждой реплики, а с `--check` ещё и то, что распознаётся на слух. Если реплика наезжает
на следующую или на конец сцены, скрипт предупредит: сдвиньте `at`, сократите фразу или ускорьте темп.

Советы: числа пишите словами («девяносто»), ставьте «ё». Если слово звучит криво, перефразируйте.

Настройки в `voiceover` (config.ts):
- `model` — голос: `ru_RU-ruslan-medium` (по умолчанию), `ru_RU-denis-medium`, `ru_RU-dmitri-medium`, `ru_RU-irina-medium` (женский).
  После смены голоса: `npm run setup-voice -- --check irina`, затем `npm run voice`.
- `lengthScale` — темп (0.94 = чуть быстрее обычного).
- `takes` — сколько дублей синтезировать на реплику. Лучший выбирается распознаванием речи, если установлен `--check`.
- `enabled: false` — ролик без голоса.

Свой голос (запись диктора): положите WAV-файлы вместо `public/audio/voice/*.wav` с теми же именами
(имена есть в `src/voice-manifest.json`) и поправьте там `duration`, если длина изменилась.

## Звуки и музыка

Бит и эффекты собираются скриптом `npm run sfx` из реальных семплов (Kenney CC0, Android AOSP Apache-2.0, Roland TR-808).
Источники и лицензии — в `public/audio/CREDITS.md`.

Заменить любой звук своим: положите файл с тем же именем в `public/audio/`:
`beat.wav` (фон), `click.wav` (щелчок), `plop.wav` (плюх), `ding.wav` (дзынь), `whoosh.wav` (вжух),
`crack.wav` (трещит яйцо), `buzz.wav` (муха), `sparkle.wav` (блёстки).
Можно и `.mp3` — тогда поменяйте расширение в `src/Video.tsx` (функция `sfxFile`).

Громкость задаётся в `audio` (config.ts):
- `beatVolume` — громкость бита, `beatVolumeUnderVoice` — бит под голосом (автоматически приглушается);
- `sfxVolume` — эффекты, `sfxUnderVoice` — множитель для эффектов, звучащих поверх реплики.

Итоговая громкость приводится к −14 LUFS шагом `npm run master`, он входит в `npm run render`.

## Как сделать новый выпуск / новую сцену

1. Скопируйте, например, `src/scenes/Bread.tsx` → `src/scenes/Noodles.tsx`, переименуйте компонент и перерисуйте SVG.
   Сцена получает `scene` из конфига и читает свои моменты через `beat(scene, 'имя')`.
2. Добавьте её в `src/scenes/index.ts`.
3. В `src/config.ts` замените нужный элемент `scenes` на `{component: 'Noodles', duration: 10, progress: 2, title: …, caption: …, beats: {…}, sfx: […]}`.
4. `npm run studio` → проверить, `npm run render` → готово.

Готовые «кирпичики» для сцен: `Microwave` (дверца, таймер, свечение), `Steam`, `Sparkles`, `Star`, `Shadow`.

## Обложка

```bash
npm run cover    # → out/cover.png и out/cover.jpg (1080×1920)
```

Тексты обложки — в `cover` в `src/config.ts` (цифра, заголовок, подзаголовок, нижняя плашка, плашка «ЧАСТЬ 1»).
Рисунок — `src/Cover.tsx`: там те же персонажи, что в сценах. Для нового выпуска замените их своими.
Всё важное стоит в центре кадра, поэтому обложка не обрезается ни в сетке профиля (3:4), ни в ленте (4:5).
При публикации в Instagram: «Обложка» → «Добавить из фотопленки» → `cover.jpg`.

## Проверка кадров

```bash
npm run stills                 # ключевые кадры каждой сцены в out/stills/
npm run stills -- 120 450 900  # любые кадры (номера кадров, 30 в секунде)
python3 scripts/guides.py      # out/stills/_contact_sheet.png с зонами интерфейса Reels
```

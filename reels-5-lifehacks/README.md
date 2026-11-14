# 5 лайфхаков для общаги — Reels на Remotion

Вертикальное видео 1080×1920, 30 fps, 60 с, H.264 + AAC.
Готовый файл: `out/reels_5_lifehacks.mp4`, ключевые кадры: `out/stills/`.

## Быстрый старт

```bash
npm install
npm run studio      # предпросмотр в браузере с таймлайном
npm run render      # → out/reels_5_lifehacks.mp4
```

Если Remotion не может скачать свой Chrome (нет доступа к сети), укажите любой локальный Chromium:
`REMOTION_BROWSER=/путь/к/chrome npm run render`.

## Структура

```
src/config.ts          ← ВСЁ, что меняется от выпуска к выпуску: тексты, цвета, шрифт, тайминги, звуки
src/scenes/            ← одна сцена = один файл (Hook, Omelet, Bread, Closet, Shirt, Sneaker, Cta)
src/scenes/index.ts    ← реестр: имя сцены из конфига → компонент
src/components/        ← общие детали: Headline, Caption, ProgressBar, Whoosh, Microwave, Fx (пар, блёстки), Emoji
src/Video.tsx          ← сборка: сцены подряд + прогресс-бар + «вжух»-переходы + звук
public/audio/*.wav     ← звуки (сгенерированы программно, можно заменить)
public/fonts/          ← Montserrat ExtraBold/Black с кириллицей (OFL)
scripts/make-sounds.mjs← генератор звуков
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

## Как заменить звук

Положите свой файл с тем же именем в `public/audio/`:
`beat.wav` (фон), `click.wav` (щелчок), `plop.wav` (плюх), `ding.wav` (дзынь), `whoosh.wav` (вжух),
`crack.wav` (трещит яйцо), `buzz.wav` (муха), `sparkle.wav` (блёстки).
Можно и `.mp3` — тогда поменяйте расширение в `src/Video.tsx` (функция `sfxFile`).
Пересоздать стандартные звуки: `npm run sounds`.

## Как сделать новый выпуск / новую сцену

1. Скопируйте, например, `src/scenes/Bread.tsx` → `src/scenes/Noodles.tsx`, переименуйте компонент и перерисуйте SVG.
   Сцена получает `scene` из конфига и читает свои моменты через `beat(scene, 'имя')`.
2. Добавьте её в `src/scenes/index.ts`.
3. В `src/config.ts` замените нужный элемент `scenes` на `{component: 'Noodles', duration: 10, progress: 2, title: …, caption: …, beats: {…}, sfx: […]}`.
4. `npm run studio` → проверить, `npm run render` → готово.

Готовые «кирпичики» для сцен: `Microwave` (дверца, таймер, свечение), `Steam`, `Sparkles`, `Star`, `Shadow`.

## Проверка кадров

```bash
npm run stills                 # ключевые кадры каждой сцены в out/stills/
npm run stills -- 120 450 900  # любые кадры (номера кадров, 30 в секунде)
python3 scripts/guides.py      # out/stills/_contact_sheet.png с зонами интерфейса Reels
```

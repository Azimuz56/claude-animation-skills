#!/usr/bin/env bash
# Один раз: ставит Piper TTS в .venv и скачивает русский голос (~60 МБ).
# Использование: npm run setup-voice [-- --check] [-- denis|dmitri|irina|ruslan]
#   --check  ещё скачать модель распознавания (~240 МБ) для отбора самых разборчивых дублей
set -euo pipefail
cd "$(dirname "$0")/.."
CHECK=0
if [ "${1:-}" = "--check" ]; then CHECK=1; shift; fi
if [ "${2:-}" = "--check" ]; then CHECK=1; fi
VOICE="${1:-$(node -e "const s=require('fs').readFileSync('src/config.ts','utf8');console.log((s.match(/model: 'ru_RU-(\w+)-medium'/)||[])[1]||'denis')")}"
[ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/python -m pip install -q --upgrade pip
.venv/bin/python -m pip install -q piper-tts numpy
mkdir -p .cache/voices
D=".cache/voices/vits-piper-ru_RU-$VOICE-medium"
if [ ! -s "$D/ru_RU-$VOICE-medium.onnx" ]; then
  echo "Скачиваю голос ru_RU-$VOICE-medium…"
  curl -fsSL "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-$VOICE-medium.tar.bz2" | tar xj -C .cache/voices
fi
if [ "$CHECK" = 1 ]; then
  .venv/bin/python -m pip install -q sherpa-onnx
  A=".cache/asr"
  if [ ! -s "$A/model.int8.onnx" ]; then
    echo "Скачиваю модель распознавания GigaAM (для отбора самых разборчивых дублей)…"
    mkdir -p "$A"
    curl -fsSL "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-ctc-giga-am-v2-russian-2025-04-19.tar.bz2" | tar xj -C "$A" --strip-components=1
  fi
fi
echo "Готово: $D"

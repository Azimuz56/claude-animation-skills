"""Piper TTS: читает задания JSON из stdin, пишет WAV, печатает JSON с длительностями.
Вызывается из scripts/make-voice.ts — руками запускать не нужно.

Если скачана модель распознавания речи GigaAM (npm run setup-voice -- --check),
для каждой реплики синтезируется несколько дублей и выбирается самый разборчивый
(тот, который распознаётся ближе всего к тексту)."""
import json, sys, wave, io, os, re
import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

job = json.load(sys.stdin)
voice = PiperVoice.load(job['model'])
cfg = SynthesisConfig(length_scale=job['lengthScale'], noise_scale=job.get('noiseScale', 0.667), noise_w_scale=job.get('noiseW', 0.8))
takes = max(1, int(job.get('takes', 1)))

asr = None
asr_dir = job.get('asrDir')
if takes > 1 and asr_dir and os.path.exists(os.path.join(asr_dir, 'model.int8.onnx')):
    try:
        import sherpa_onnx
        asr = sherpa_onnx.OfflineRecognizer.from_nemo_ctc(model=os.path.join(asr_dir, 'model.int8.onnx'), tokens=os.path.join(asr_dir, 'tokens.txt'), num_threads=4)
    except Exception as e:  # без распознавания — просто первый дубль
        print(f'ASR недоступен: {e}', file=sys.stderr)
if asr is None:
    takes = 1


def words(s):
    return re.sub(r'[^а-яa-z ]', ' ', s.lower().replace('ё', 'е')).split()


def lev(a, b):
    d = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        p = d[:]; d[0] = i
        for j, y in enumerate(b, 1):
            d[j] = min(p[j] + 1, d[j - 1] + 1, p[j - 1] + (x != y))
    return d[-1]


def synth(text):
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        voice.synthesize_wav(text, w, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    # обрезать тишину по краям (с запасом, чтобы не съесть тихие согласные), пик -1 дБ
    thr = np.abs(x).max() * 0.004
    nz = np.where(np.abs(x) > thr)[0]
    x = x[max(0, nz[0] - int(0.03 * sr)): nz[-1] + int(0.15 * sr)]
    return x / np.abs(x).max() * 10 ** (-1 / 20), sr


def score(x, sr, text):
    a = np.interp(np.arange(0, len(x), sr / 16000), np.arange(len(x)), x).astype(np.float32)
    s = asr.create_stream(); s.accept_waveform(16000, a); asr.decode_stream(s)
    ref, hyp = ''.join(words(text)), ''.join(words(s.result.text))
    return lev(ref, hyp) / max(1, len(ref)), s.result.text  # ошибка по буквам


res = []
for item in job['items']:
    best = None
    for k in range(takes):
        x, sr = synth(item['text'])
        if asr is None:
            best = (0, x, sr, ''); break
        err, heard = score(x, sr, item['text'])
        if best is None or err < best[0]:
            best = (err, x, sr, heard)
        if err == 0:
            break
    err, x, sr, heard = best
    with wave.open(item['out'], 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((x * 32767).astype('<i2').tobytes())
    res.append({'out': item['out'], 'duration': len(x) / sr, 'heard': heard if asr else None, 'cer': round(err, 3) if asr else None})
print(json.dumps(res, ensure_ascii=False))

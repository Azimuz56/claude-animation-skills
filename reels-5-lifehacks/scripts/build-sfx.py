"""Собирает звуки ролика в public/audio/ из реальных семплов со свободной лицензией.

Источники (скачиваются в .cache/sources/ при первом запуске):
  * Kenney «Interface Sounds» — CC0 1.0           github.com/Calinou/kenney-interface-sounds
  * Android (AOSP) system sounds — Apache-2.0     github.com/aosp-mirror/platform_frameworks_base (data/sounds)
  * Roland TR-808 samples (Michael Fischer)       npm @fluid-music/tr-808 (без ограничений, см. TR808.TXT)

Нужно: python3 + numpy, ffmpeg, git, npm.   Запуск: npm run sfx
Готовые файлы (можно заменить своими с тем же именем):
  beat.wav click.wav plop.wav ding.wav whoosh.wav crack.wav buzz.wav sparkle.wav
"""
import os, subprocess, sys, tarfile, glob, wave, urllib.request
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, '.cache', 'sources')
OUT = os.path.join(ROOT, 'public', 'audio')
SR = 44100
rng = np.random.default_rng(7)
os.makedirs(SRC, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

AOSP = 'https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/main/data/sounds/'
AOSP_FILES = {'Iridium.ogg': 'notifications/ogg/Iridium.ogg', 'pixiedust.ogg': 'notifications/pixiedust.ogg', 'Drip.ogg': 'notifications/Drip.ogg'}


def fetch_sources():
    kenney = os.path.join(SRC, 'kenney-interface-sounds')
    if not os.path.isdir(kenney):
        subprocess.run(['git', 'clone', '-q', '--depth', '1', 'https://github.com/Calinou/kenney-interface-sounds', kenney], check=True)
    for name, path in AOSP_FILES.items():
        dst = os.path.join(SRC, name)
        if not os.path.exists(dst):
            urllib.request.urlretrieve(AOSP + path, dst)
    tr = os.path.join(SRC, 'tr808')
    if not os.path.isdir(tr):
        os.makedirs(tr)
        tgz = subprocess.run(['npm', 'pack', '@fluid-music/tr-808', '--silent', '--pack-destination', tr], check=True, capture_output=True, text=True).stdout.strip().splitlines()[-1]
        with tarfile.open(os.path.join(tr, tgz)) as t:
            t.extractall(tr, filter='data')


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float64) / 32768


def kenney(name):
    return load(glob.glob(os.path.join(SRC, 'kenney-interface-sounds', '**', name), recursive=True)[0])


def tr808(name):
    return load(glob.glob(os.path.join(SRC, 'tr808', 'package', 'TR808WAV', '**', name), recursive=True)[0])


def save(name, x, peak_db=-1.0):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    m = np.abs(x).max()
    if m > 0:
        x = x / m * 10 ** (peak_db / 20)
    data = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print(f'  {name:12s} {len(x) / SR:5.2f}s')


def trim(x, start=0.0, length=None, fade=0.03):
    """отрезать тишину в начале + длина + плавный хвост"""
    thr = np.abs(x).max() * 0.02
    i0 = max(0, int(np.argmax(np.abs(x) > thr)) - int(0.003 * SR)) + int(start * SR)
    x = x[i0:] if length is None else x[i0:i0 + int(length * SR)]
    x = x.copy()
    n = min(len(x), int(fade * SR))
    if n:
        x[-n:] *= np.linspace(1, 0, n) ** 2
    return x


def mix(*parts, length=None):
    """parts: (signal, offset_sec, gain)"""
    n = length or max(int(o * SR) + len(s) for s, o, g in parts)
    out = np.zeros(n)
    for s, o, g in parts:
        i = int(o * SR)
        seg = s[: max(0, n - i)]
        out[i:i + len(seg)] += seg * g
    return out


def onepole(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc; y[i] = acc
    return y


def pitch(x, ratio):
    idx = np.arange(0, len(x) - 1, ratio)
    return np.interp(idx, np.arange(len(x)), x)


def build_sfx():
    print('SFX:')
    save('click.wav', trim(kenney('switch_002.wav'), length=0.25), -3)
    save('plop.wav', trim(load(os.path.join(SRC, 'Drip.ogg')), length=0.6, fade=0.1), -2)
    save('ding.wav', trim(load(os.path.join(SRC, 'Iridium.ogg')), fade=0.3), -2)
    save('sparkle.wav', trim(load(os.path.join(SRC, 'pixiedust.ogg')), fade=0.3), -4)

    # вжух: воздушный свип Kenney + полосовой шум-«накат» для объёма
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sweep = onepole(noise, 900) - onepole(noise, 250)
    env = np.sin(np.pi * np.clip(t / 0.5, 0, 1)) ** 2.5
    body = sweep * env
    body /= np.abs(body).max()
    air = trim(kenney('maximize_005.wav'), length=0.45)
    save('whoosh.wav', mix((body, 0, 0.9), (air / np.abs(air).max(), 0.08, 0.6)), -2)

    # треск яйца: римшот 808 + скретч Kenney + клава, с микро-задержками
    rs = trim(tr808('RS.WAV'), length=0.15)
    sc = trim(kenney('scratch_001.wav'), length=0.15)
    cl = trim(tr808('CL.WAV'), length=0.1)
    save('crack.wav', mix((sc / np.abs(sc).max(), 0, 0.8), (rs / np.abs(rs).max(), 0.012, 0.7), (cl / np.abs(cl).max(), 0.045, 0.25)), -2)

    # муха: пила с вибрато, полосовой фильтр, «пролёт» по громкости и панораме
    n = int(1.3 * SR); t = np.arange(n) / SR
    f = 205 + 18 * np.sin(2 * np.pi * 6.5 * t) + 25 * np.sin(2 * np.pi * 0.8 * t)
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    bz = onepole(saw, 2200) - onepole(saw, 350)
    env = np.minimum(1, t / 0.15) * np.minimum(1, (1.3 - t) / 0.3) * (0.6 + 0.4 * np.sin(np.pi * t / 1.3))
    pan = 0.5 + 0.4 * np.sin(2 * np.pi * 0.7 * t)
    bz = bz * env
    save('buzz.wav', np.stack([bz * (1 - pan), bz * pan], 1), -6)


def karplus(freq, dur, bright=0.5):
    n = int(dur * SR); p = int(SR / freq)
    buf = rng.uniform(-1, 1, p); buf = onepole(np.tile(buf, 2), 2000 + 6000 * bright)[p:]
    out = np.zeros(n)
    for i in range(n):
        v = buf[i % p]; out[i] = v
        buf[i % p] = 0.5 * (v + buf[(i + 1) % p]) * 0.996
    return out * np.exp(-np.arange(n) / SR * 2.2)


def build_beat(total=60.5):
    print('BEAT:')
    bpm = 120; step = 60 / bpm / 4; bar = step * 16
    n = int(total * SR)
    L = np.zeros(n); R = np.zeros(n)

    def put(sig, at, gain, pan=0.0):
        i = int(at * SR)
        if i >= n: return
        s = sig[: n - i] * gain
        L[i:i + len(s)] += s * (1 - max(0, pan)); R[i:i + len(s)] += s * (1 + min(0, pan))

    kick = trim(tr808('BD2550.WAV'), length=0.5)
    snare = trim(tr808('SD0050.WAV'), length=0.4)
    clap = trim(tr808('CP.WAV'), length=0.4)
    ch = trim(tr808('CH.WAV'), length=0.12)
    oh = trim(tr808('OH25.WAV'), length=0.4)
    toms = [trim(tr808(x), length=0.4) for x in ('HT25.WAV', 'MT25.WAV', 'LT25.WAV')]
    boom = trim(tr808('BD0075.WAV'), fade=0.2)
    # основной тон «бума» 808, чтобы строить бас по нотам
    seg = boom[int(0.05 * SR): int(0.4 * SR)]
    sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), 1 << 16)); fr = np.fft.rfftfreq(1 << 16, 1 / SR)
    base_f = fr[np.argmax(sp * (fr > 30) * (fr < 120))]
    print(f'  808 boom fundamental ≈ {base_f:.1f} Hz')

    roots = [55.0, 43.65, 65.41, 49.0]  # Am F C G
    chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 261.63, 329.63], [196.0, 246.94, 293.66]]
    pluck_cache = {}

    def pluck(fq):
        if fq not in pluck_cache: pluck_cache[fq] = karplus(fq, 0.9, 0.35)
        return pluck_cache[fq]

    bars = int(total / bar) + 1
    for b in range(bars):
        t0 = b * bar
        k = b % 4
        fill = b % 8 == 7
        for s in [0, 6, 8] + ([14] if b % 2 else [11]):
            put(kick, t0 + s * step, 0.95 if s in (0, 8) else 0.7)
        for s in (4, 12):
            put(clap, t0 + s * step, 0.55, 0.1); put(snare, t0 + s * step, 0.35)
        for s in range(0, 16, 2):
            if fill and s >= 12: continue
            put(oh if s in (2, 10) else ch, t0 + s * step, (0.22 if s % 4 else 0.3) if s not in (2, 10) else 0.16, -0.3)
        if b % 2:
            for s in (13, 15): put(ch, t0 + s * step, 0.12, -0.3)
        if fill:
            for j, s in enumerate((12, 13, 14, 15)):
                put(toms[min(j, 2)], t0 + s * step, 0.45, [0.3, 0.1, -0.1, -0.3][j])
        # 808-бас: тот же «бум», перестроенный на ноту аккорда
        for s, g in ((0, 0.75), (7, 0.5), (10, 0.6)):
            put(pitch(boom, roots[k] / base_f)[: int(0.6 * SR)], t0 + s * step, g)
        # гитарный «щипок» Карплуса-Стронга — мягкие аккорды
        for s in (0, 3, 6, 10, 12):
            for j, fq in enumerate(chords[k]):
                put(pluck(fq), t0 + s * step + j * 0.012, 0.11 if s else 0.15, [-0.4, 0, 0.4][j])

    st = np.stack([L, R], 1)
    st = np.tanh(st * 1.4) / np.tanh(1.4)  # мягкий лимитер
    t = np.arange(n) / SR
    st *= np.clip((total - 0.5 - t) / 1.2, 0, 1)[:, None]  # затухание в конце
    st[:int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))[:, None]
    save('beat.wav', st, -1.5)


if __name__ == '__main__':
    fetch_sources()
    only = sys.argv[1:]
    if not only or 'sfx' in only: build_sfx()
    if not only or 'beat' in only: build_beat()

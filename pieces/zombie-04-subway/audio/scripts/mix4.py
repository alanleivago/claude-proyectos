# mix4.py -> audio/mix.wav (+ stems), ep4 "The Last Train — Part 1": voz (voz/track.wav) + musica real CC0 continua
# medida por LUFS (~11 LU bajo la voz) + ambiente de anden (hum fluorescente hasta el apagon) + SFX reales en su fotograma.
# Fuentes: Freesound CC0 (audio/cand/*, elegidos con earshot rank; creditos en CREDITS abajo), Dino Crisis (UI RE),
# kit del ep3 (interruptor). Master -14 LUFS estereo, true peak <= -1 dBTP. python mix4.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
DUR = json.load(open(r'F:/Claude Proyectos/pieces/zombie-04-subway/engine/cues.json'))['END']; N = int(DUR * SR)   # v4: de la voz
P = r"F:/Claude Proyectos/pieces/zombie-04-subway"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
E3 = r"F:/Claude Proyectos/pieces/zombie-03-station/audio/cand"
CREDITS = {  # Freesound CC0
    "705378 Subway train departing": "chungus43A", "817387 cretestepping.wav": "Mihacappy", "482827 R15-47-Heavy Breathing": "craigsmith",
    "345070 CHAIN & LOCK ON FENCE": "metrostock99", "530482 Notification sound 2": "Rickplayer", "353125 Paper Rustle": "BenjaminNelan",
    "489967 TearingPaper10": "falcospizaetus", "187310 NYC_Subway train, doors": "carroll27", "720572 Old Toronto Subway Chime": "chungus43A",
    "271945 Stingers and Stabs 001": "OverlookHotelRecords", "637543 fluorescent light hum buzz": "kyles", "479536 R05-23-Nearly Empty Station": "craigsmith",
    "610534 Dark Sad Mood Orchestra Synth": "szegvari", "870288 light switch (ep3)": "Freesound CC0",
}

def load(path, a=None, b=None, trim=True, norm=True):
    cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
    if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]   # sin silencio inicial
    f = int(0.004 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x / (np.abs(x).max() + 1e-9) if norm else x

def hits(path, n=8, ln=0.28):
    """golpes sueltos (un paso cada uno) cortados en los ataques de la grabacion"""
    x = load(path, trim=False); H = int(0.01 * SR); e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    on, out, last = np.where((e[1:] > 3 * e[:-1] + 1e-4) & (e[1:] > 0.15 * e.max()))[0], [], -99
    for k in on:
        if k - last < 25: continue
        last = k; s = x[k * H - int(0.005 * SR):k * H + int(ln * SR)].copy(); g = int(0.08 * SR); s[-g:] *= np.linspace(1, 0, g); out.append(s / np.abs(s).max())
        if len(out) >= n: break
    return out

sfx = np.zeros(N); amb = np.zeros(N)
def put(buf, x, t, db, maxlen=None, fade=0.05):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]; f = min(len(x), int(fade * SR)); x[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)

DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6)
ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1); KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)
STEP = hits(f"{C}/steps_run/817387.mp3")
TRAIN = load(f"{C}/train_depart/705378.mp3", trim=False); CHAIN = load(f"{C}/chain_rattle/345070.mp3")
BEEP = load(f"{C}/phone_beep/530482.mp3"); RUSTLE = load(f"{C}/paper_rustle/353125.mp3"); TEAR = load(f"{C}/paper_tear/489967.mp3")
DOORS = load(f"{C}/subway_doors/187310.mp3"); CHIME = load(f"{C}/door_chime/720572.mp3"); STING = load(f"{C}/stinger/271945.mp3")
BREATH = load(f"{C}/breath/482827.mp3"); CLUNK = load(f"{E3}/light_switch/870288.mp3")
HUM = load(f"{C}/fluor_hum/637543.mp3", trim=False); ROOM = load(f"{C}/room_tone/479536.mp3", trim=False)

# ---- eventos: v4, todos derivados de la voz (engine/cues.json, voz/build_cues.py) ----
CU = json.load(open(f"{P}/engine/cues.json", encoding="utf8")); W, T = CU["W"], CU["T"]
put(sfx, TRAIN, 0.0, -10, maxlen=4.2, fade=1.6)                                  # 01 el ultimo tren se va
for i, t in enumerate([0.05, 0.38, 0.72, 1.05, 1.38, 1.72, 2.0]):                 # 01 corre (clip run: un paso cada 1/3 s) y frena
    put(sfx, STEP[i % len(STEP)], t, -13 if t < 1.7 else -17)
put(sfx, DEFAULT, T["gate"], -14, maxlen=0.5)                                     # HUD entra de golpe
tc = W["locks"] + 0.25; dc = max(0.8, tc - T["gate"] - 0.15)                       # 01b la reja corre (cadena/metal) y choca al cerrarse
put(sfx, CHAIN, tc - dc, -16, maxlen=dc, fade=0.1); put(sfx, CHAIN, tc, -7, maxlen=1.0, fade=0.4)
for i, t in enumerate([T["gate"] + 0.05, T["gate"] + 0.38, T["gate"] + 0.71]):     # llega corriendo a la reja
    if t < tc - 0.1: put(sfx, STEP[(i + 3) % len(STEP)], t, -15)
put(sfx, BEEP, W["signal"], -16)                                                  # 02 sin senal
for t in (W["next"], W["five"]): put(sfx, DEFAULT, t, -21, maxlen=0.3)            # 02b panel NEXT TRAIN / 5:30
put(sfx, RUSTLE, W["sheet"], -14)                                                 # 03 la hoja
put(sfx, INV, T["file"], -10)                                                     # FILE
for t in (W["rule1"], W["rule2"]): put(sfx, DEFAULT, t, -17, maxlen=0.4)          # regla 1 / regla 2
put(sfx, TEAR, W["dont"], -3, maxlen=1.0, fade=0.2)                               # el papel se corta en "don't—"
put(sfx, DEFAULT, W["midnight"], -15, maxlen=0.4)                                 # 05 reloj 12:00
for i in range(6):                                                                # 05b los tubos se apagan fila a fila hasta "out"
    t = W["every"] + 0.1 + (W["out"] - W["every"] - 0.1) * (i + 1) / 6; put(sfx, CLUNK, t, -12 + 1.5 * i, maxlen=0.35)
for t in (W["out"], W["something"]): put(sfx, ALARM, t, -14)                       # HUD CAUTION / DANGER
put(sfx, DOORS, W["open"] - 0.07, -9, maxlen=1.6, fade=0.4)                       # 06b las puertas se abren
gap = max(0.35, (W["something"] - T["steps"]) / 4)
for i in range(4): put(sfx, STEP[(i + 2) % len(STEP)], T["steps"] + 0.1 + i * gap, -24 + 3 * i)   # pasos lentos detras, cada vez mas cerca
put(sfx, STING, W["something"], -7, maxlen=3.5, fade=1.2)                         # 07b la silueta
put(sfx, BREATH, T["neck"] + 0.15, -11, maxlen=min(3.6, T["fudge"] - T["neck"]), fade=0.6)   # 07c aliento en la nuca
put(sfx, CHIME, T["close"] + 0.02, -12, maxlen=2.4, fade=0.4)                     # 08b las puertas van a cerrar
put(sfx, DOORS, W["closing"] - 0.25, -18, maxlen=1.8, fade=0.5)
put(sfx, INV, T["choice"], -10)                                                   # 09 menu
for t in (W["geton"], W["stay"]): put(sfx, DEFAULT, t, -12, maxlen=0.35)          # cursor GET ON / STAY
put(sfx, DEFAULT, W["comment"], -16, maxlen=0.4)                                  # COMMENT 1 OR 2
TYPE = "MOST COMMENTS DECIDE PART 2."
for i, ch in enumerate(TYPE):                                                     # maquina de escribir: una tecla por letra (20/s, como la imagen)
    t = W["most"] + (i + 1) / 20
    if ch != " " and t < T["end"]: put(sfx, KEY, t, -12)
for i, ch in enumerate("NEXT:"): put(sfx, KEY, T["end"] + (i + 1) / 14, -12)      # tarjeta final
for i, ch in enumerate("PART 2."):
    if ch != " ": put(sfx, KEY, T["follow"] + (i + 1) / 12, -11)
put(sfx, DEFAULT, T["follow"] + 0.9, -14, maxlen=0.5)                              # FOLLOW AVA RESTFIELD!
# ---- ambiente: anden (room tone + hum fluorescente) hasta el apagon; despues casi nada ----
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
lvl = np.where(np.arange(N) < int(W['out'] * SR), 1.0, 0.0); lvl[int(T['file'] * SR):int(T['laugh'] * SR)] *= 0.35   # bajo en la pantalla FILE
lvl = uniform_filter1d(lvl, int(0.04 * SR))
amb = loop(HUM) * 10 ** (-30 / 20) * lvl + loop(ROOM) * 10 ** (-27 / 20) * (0.35 + 0.65 * lvl)
amb[int(T['end'] * SR):] *= np.linspace(1, 0, N - int(T['end'] * SR))
# ---- voz y musica (musica igualada por LUFS: 11 LU bajo la voz, continua, fundido final) ----
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C}/mus_horror/610534.mp3", trim=False); mus = np.pad(mus, (0, max(0, N - len(mus))))[:N]
fo = int(1.5 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 11 - mL) / 20)
mix = voice + music + sfx * 0.9 + amb
lufs = meter.integrated_loudness(st(mix)); g = 10 ** ((-14 - lufs) / 20); mix *= g
pk = np.abs(mix).max(); lim = 10 ** (-1.5 / 20)
if pk > lim:
    k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
print('voz LUFS', round(vL, 1), 'musica LUFS', round(meter.integrated_loudness(st(music)), 1), '-> LU bajo la voz', round(vL - meter.integrated_loudness(st(music)), 1))
print('mix LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2))
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", music * g), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
json.dump(CREDITS, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

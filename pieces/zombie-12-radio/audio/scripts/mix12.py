# mix12.py -> audio/mix.wav (+ stems), ep12 "The Radio": voz (voz/track.wav, la radio ya filtrada) + BGM CC0 continua por LUFS
# (~10.5 LU bajo la voz, igualada por bloques de 4 s) + capa de terror del gancho 0-10 s (drone + caja de musica) + ambiente de noche
# (grillos + room tone) + SFX reales en su fotograma (Freesound CC0 elegidos con earshot rank, Dino Crisis para la UI).
# Tiempos: engine/cues.json. Master -14 LUFS estereo, TP <= -1 dBTP. python mix12.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
from scipy.signal import butter, sosfilt
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-12-radio"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
C4 = r"F:/Claude Proyectos/pieces/zombie-04-subway/audio/cand"; C7 = r"F:/Claude Proyectos/pieces/zombie-07-saferoom/audio/cand"
CU = json.load(open(f"{P}/engine/cues.json", encoding="utf8")); W, T = CU["W"], CU["T"]; DUR = CU["END"]; N = int(DUR * SR); VEND = CU["VOICE_END"]
def load(path, a=None, b=None, trim=True, norm=True):
    cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
    if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]
    f = int(0.004 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x / (np.abs(x).max() + 1e-9) if norm else x
def hits(x, n=12, ln=0.3, thr=0.15, gapf=18):
    H = int(0.01 * SR); e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    on, out, last = np.where((e[1:] > 3 * e[:-1] + 1e-4) & (e[1:] > thr * e.max()))[0], [], -99
    for k in on:
        if k - last < gapf: continue
        last = k; s = x[max(0, k * H - int(0.005 * SR)):k * H + int(ln * SR)].copy(); g = int(0.06 * SR); s[-g:] *= np.linspace(1, 0, g); out.append(s / np.abs(s).max())
        if len(out) >= n: break
    return out
sfx = np.zeros(N)
def put(buf, x, t, db, maxlen=None, fade=0.05, fin=0.0):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]; f = min(len(x), int(fade * SR)); x[-f:] *= np.linspace(1, 0, f)
    if fin: f = min(len(x), int(fin * SR)); x[:f] *= np.linspace(0, 1, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)
lp = lambda x, fc: sosfilt(butter(4, fc, 'lowpass', fs=SR, output='sos'), x)
bp = lambda x, a, b: sosfilt(butter(4, [a, b], 'bandpass', fs=SR, output='sos'), x)
# ---------------- fuentes ----------------
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40); SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2)
STING = load(f"{C4}/stinger/271945.mp3"); BREATH = load(f"{C4}/breath/482827.mp3"); ROOM = load(f"{C7}/room_tone/144046.mp3", trim=False); WIND = load(f"{C7}/wind/438862.mp3", trim=False)
WHOOSH = load(f"{C7}/whoosh/855844.mp3")
ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"; ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
STATIC = load(f"{C}/static/724702.mp3", trim=False); TUNE = load(f"{C}/tuning2/58932.mp3"); TUNE2 = load(f"{C}/tuning/261873.mp3")
CRANK = load(f"{C}/crank/734567.mp3", trim=False); PLUG = load(f"{C}/plug/477628.mp3"); PENCIL = load(f"{C}/pencil/335509.mp3"); PAPER = load(f"{C}/paper/353125.mp3")
DOOR = load(f"{C}/door_creak/553250.mp3"); CHIME = load(f"{C}/chime/616696.mp3"); NIGHT = load(f"{C}/night_amb/436528.mp3", trim=False)
STEPS = hits(load(f"{C}/heavy_steps/451964.mp3", trim=False), 8, 0.45, 0.2, gapf=30)
STEPS = [lp(s, 900) for s in STEPS]; STEPS = [s / np.abs(s).max() for s in STEPS]   # afuera: pasos pesados, sin agudos
def bed(x, t0, t1, db, fin=0.15, fout=0.2):   # cama continua (estatica, manivela) recortada al tramo
    n = int((t1 - t0) * SR); y = np.tile(x, n // len(x) + 2)[:n].copy(); f1, f2 = int(fin * SR), int(fout * SR); y[:f1] *= np.linspace(0, 1, f1); y[-f2:] *= np.linspace(1, 0, f2); put(sfx, y, t0, db)
# ---------------- eventos ----------------
put(sfx, STING, 0.05, -13, maxlen=2.2, fade=1.0)                                                                 # 01 gancho
put(sfx, DEFAULT, W["lights"], -15, maxlen=0.3); put(sfx, DEFAULT, W["bars"], -14, maxlen=0.3)
put(sfx, ALARM, T["01b_crank"], -14)                                                                             # HUD entra (radio Dino Crisis)
bed(CRANK, T["01b_crank"] + 0.1, W["friend"] - 0.15, -11)                                                       # 01b manivela + estatica que se aclara
bed(STATIC, T["01b_crank"] + 0.2, W["friend"] + 0.1, -20); put(sfx, TUNE, W["friend"] - 0.45, -15, maxlen=0.6, fade=0.2)
put(sfx, INV, T["02_item"], -10)                                                                                  # 02 ITEM
for k in ("grid", "tower"): put(sfx, DEFAULT, W[k] - 0.03, -13, maxlen=0.35)
bed(CRANK, W["crank2"] - 0.05, W["talking"] - 0.1, -13); put(sfx, CHIME, W["talking"] - 0.08, -16, maxlen=1.2, fade=0.5)
put(sfx, PLUG, W["earbud"] - 0.06, -9, maxlen=0.4)                                                                # 03 auricular
put(sfx, DEFAULT, W["speaker"], -14, maxlen=0.3); bed(bp(STATIC, 1500, 5000), T["03_earbud"], T["04_iono"] - 0.1, -34)
put(sfx, ZGROAN, W["noise"] + 0.1, -25, maxlen=1.4, fade=0.6); put(sfx, DEFAULT, W["noise"], -15, maxlen=0.3)
put(sfx, DOOR, W["house"] - 0.2, -27, maxlen=1.6, fade=0.6)                                                      # 03b la casa cruje
put(sfx, WHOOSH, T["04_iono"] - 0.35, -14, maxlen=0.6); put(sfx, INV, T["04_iono"], -12)                        # 04 diagrama
for k in ("sky", "hundreds", "far"): put(sfx, DEFAULT, W[k], -15, maxlen=0.3)
put(sfx, TUNE2, W["scan"] - 0.05, -14, maxlen=1.5, fade=0.4); put(sfx, DEFAULT, W["dark"], -13, maxlen=0.35)
put(sfx, DEFAULT, W["batteries"], -14, maxlen=0.3)                                                                # 05 en punto
put(sfx, DEFAULT, W["top"], -13, maxlen=0.35); put(sfx, CHIME, W["top"] + 0.05, -22, maxlen=1.0, fade=0.5)
put(sfx, TUNE, W["news"] - 0.1, -18, maxlen=0.5); bed(STATIC, W["news"], T["05b_log"], -27)
put(sfx, PENCIL, W["time5"] - 0.05, -14, maxlen=1.6, fade=0.3)                                                   # 05b libreta
put(sfx, PAPER, T["06_fridge"] + 0.1, -20, maxlen=0.6)                                                            # 06 notas
for k in ("shelters", "routes", "curfew"): put(sfx, PAPER, W[k] - 0.08, -17, maxlen=0.4); put(sfx, DEFAULT, W[k] - 0.05, -16, maxlen=0.3)
put(sfx, SUCCESS, W["official"] - 0.05, -15, maxlen=1.0, fade=0.4)
bed(STATIC, T["07_voice"], T["07b_door"], -28); put(sfx, DEFAULT, W["rescue"], -13, maxlen=0.35); put(sfx, DEFAULT, W["army"] - 0.1, -15, maxlen=0.3)   # 07
D = T["07c_ping"] - T["07b_door"]; put(sfx, DOOR, T["07b_door"] + 0.15 * D, -9, maxlen=2.2, fade=0.6)            # 07b puerta de carga
put(sfx, WHOOSH, T["07c_ping"] - 0.3, -16, maxlen=0.5)
for i in range(3): put(sfx, ALARM, T["07c_ping"] + 0.1 + i * 0.55, -22 - 2 * i)                                  # 07c ping
put(sfx, ZGROWL, T["07c_ping"] + 0.4, -15, maxlen=1.3, fade=0.5); put(sfx, ZGROAN, T["07c_ping"] + 0.9, -18, maxlen=1.0, fade=0.4)
put(sfx, TUNE, T["08_radio"] - 0.05, -14, maxlen=0.5, fade=0.2); bed(STATIC, T["08_radio"] + 0.1, T["08b_window"] + 0.2, -22)   # 08 la radio habla
put(sfx, DEFAULT, W["police"], -18, maxlen=0.3)
T8 = T["08b_window"]; STEPT = [T8 - 1.0, T8 - 0.35, T8 + 0.30, T8 + 0.91, T8 + 1.08, T8 + 2.11, T8 + 2.72, T8 + 3.32]   # 08b pasos (HAT.walk: pie en sin = +-1)
for i, t in enumerate(STEPT): put(sfx, STEPS[i % len(STEPS)], t, -6 + (-6 if i < 2 else 0) + (-4 if t > W["fudge"] + 0.2 else 0), maxlen=0.45)
put(sfx, STING, T8 + 1.05, -9, maxlen=2.0, fade=0.9); put(sfx, ALARM, T8, -17)                                   # se detiene frente a la ventana; HUD DANGER
put(sfx, BREATH, W["fudge"] + 0.9, -15, maxlen=1.4, fade=0.5)
T9 = T["09_save"]                                                                                                  # 09 maquina: una tecla por letra
for k in range(1, 6): put(sfx, KEY, T9 + 0.15 + k / 9, -12)
put(sfx, KEY, T9 + 0.15 + 6 / 9, -13); put(sfx, CHIME, T9 + 0.75, -13, maxlen=1.6, fade=0.6)
put(sfx, INV, T["10_choice"], -10)                                                                                 # 10 menu
for k in ("answer", "silent", "comment"): put(sfx, DEFAULT, W[k], -13, maxlen=0.35)
put(sfx, DEFAULT, VEND + 0.3, -14, maxlen=0.5); bed(STATIC, T["10_choice"] + 0.3, DUR - 0.2, -30, fin=0.6, fout=0.8)
put(sfx, BREATH, T["10_choice"] + 1.2, -17, maxlen=3.0, fade=1.0); put(sfx, BREATH, VEND + 0.6, -17, maxlen=2.4, fade=1.0)
# ---------------- ambiente: noche (grillos lejanos, por las ventanas) + room tone ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
amb = loop(ROOM) * 10 ** (-31 / 20) + lp(loop(NIGHT), 3500) * 10 ** (-27 / 20) + loop(WIND) * 10 ** (-38 / 20)
scr = np.ones(N)   # pantallas (ITEM, diagrama, puerta): sin ambiente de la casa
for a, b in (("02_item", "03_earbud"), ("04_iono", "05_clock"), ("07b_door", "07c_ping")): scr[int(T[a] * SR):int(T[b] * SR)] = 0.25
amb *= uniform_filter1d(scr, int(0.2 * SR))
# ---------------- voz y musica ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
rg = np.ones(N); rg[int((T["08_radio"] - 0.1) * SR):int(T["08b_window"] * SR)] = 10 ** (-3.5 / 20); voice *= uniform_filter1d(rg, int(0.05 * SR))   # la radio no mas fuerte que Ava
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C4}/mus_horror/610534.mp3", trim=False); mus = np.tile(mus, int(np.ceil(N / len(mus))) + 1)[:N] if len(mus) < N else mus[:N]
fo = int(1.0 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
duck = np.ones(N); duck[int((T8 - 0.2) * SR):int((W["fudge"] + 1.0) * SR)] = 0.3; duck[int(T["07b_door"] * SR):int(T["07c_ping"] * SR)] = 0.5   # musica baja: pasos / puerta
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 10.5 - mL) / 20)
mI = meter.integrated_loudness(st(music)); B = int(4 * SR); gains = []
for i0 in range(0, N, B):
    seg = music[i0:i0 + B]
    try: l = meter.integrated_loudness(st(seg)) if len(seg) > SR and np.abs(seg).max() > 1e-4 else mI
    except Exception: l = mI
    gains.append(np.clip(mI - l, -8, 6) if np.isfinite(l) and l > -70 else 0.0)
cent = np.arange(len(gains)) * B + B // 2; genv = 10 ** (np.interp(np.arange(N), cent, gains) / 20)
music *= genv * uniform_filter1d(duck, int(0.25 * SR))   # el ducking va despues de igualar los bloques
HK = int(10.8 * SR); hook = np.zeros(N)
drone = load(f"{C7}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{C7}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
env = np.clip(np.arange(N) / (0.3 * SR), 0, 1) * np.clip((10.6 * SR - np.arange(N)) / (2.2 * SR), 0, 1); hook *= env
win = slice(int(0.3 * SR), int(8.0 * SR)); vW = meter.integrated_loudness(st(voice[win])); hW = meter.integrated_loudness(st(hook[win]))
hook *= 10 ** ((vW - 12 - hW) / 20)
mix = voice + music + hook + sfx * 0.9 + amb
for _ in range(3):   # normaliza -> limita, dos o tres pasadas hasta -14.0
    lufs = meter.integrated_loudness(st(mix)); gi = 10 ** ((-14 - lufs) / 20); mix *= gi; g = gi if _ == 0 else g * gi
    pk = np.abs(mix).max(); lim = 10 ** (-1.5 / 20)
    if pk > lim:
        k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
print('gancho: voz sobre musica 0-8 s', round(vW - meter.integrated_loudness(st((music + hook)[win])), 1), 'LU; musica', round(vL - meter.integrated_loudness(st(music)), 1), 'LU bajo la voz')
for a, b in ((0, 10), (10, 20), (20, 30), (30, 40), (40, 50), (50, DUR)):
    s_ = slice(int(a * SR), int(b * SR)); print(f'  {a}-{b:.0f} s: musica', round(meter.integrated_loudness(st(((music + hook) * g)[s_])), 1), 'LUFS, voz', round(meter.integrated_loudness(st((voice * g)[s_])), 1))
print('mix LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2), 'dur', DUR)
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", (music + hook) * g), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
CRED = {"Freesound CC0 (ep12)": "724702 radio static (9voltplasma), 58932 radio noises (electrosnail), 261873 AM tuning (NobodyYouKnowOf), 734567 wind-ups (horraceradishh), 477628 plug (Joao_Janz), 335509 pencil writing (newagesoup), 353125 paper rustle (BenjaminNelan), 553250 door squeak (NachtmahrTV), 616696 saved chime (melokacool), 436528 night crickets (KikeVilaplana), 451964 heavy boots (kyles)",
        "Freesound CC0 (reusados ep4-ep7)": "271945 stinger, 482827 breath, 610534 music (szegvari), 855844 whoosh, 144046 room tone, 438862 wind, 799307 drone (CVLTIV8R), 712798 music box (Antenalosmusic)",
        "Resident Evil zombie voices": "Capcom (no monetizado)", "Dino Crisis SFX": "Capcom (no monetizado)"}
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

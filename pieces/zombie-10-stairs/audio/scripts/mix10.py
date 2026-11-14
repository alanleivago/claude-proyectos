# mix9.py -> audio/mix.wav (+ stems), ep10 "The Stairs": voz (voz/track.wav) + BGM CC0 continua por LUFS (~11 LU bajo la voz)
# + capa de terror del gancho 0-10 s (drone + caja de musica, como ep5/ep7) + ambiente + SFX reales (Freesound CC0 elegidos con earshot
# rank en ep4/ep7/ep10, Dino Crisis) en su fotograma. Tiempos: engine/cues.json. Master -14 LUFS estereo, TP <= -1 dBTP. python mix9.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-10-stairs"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
C4 = r"F:/Claude Proyectos/pieces/zombie-04-subway/audio/cand"; C7 = r"F:/Claude Proyectos/pieces/zombie-07-saferoom/audio/cand"; E3 = r"F:/Claude Proyectos/pieces/zombie-03-station/audio/cand"
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
C10 = f"{P}/audio/cand"; C5 = r"F:/Claude Proyectos/pieces/zombie-05-pt/audio/cand"; C6 = r"F:/Claude Proyectos/pieces/zombie-06-floor30/audio/cand"
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40); SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2)
STEP = hits(load(f"{C4}/steps_run/817387.mp3", trim=False), 8, 0.28, gapf=25); WSTEP = hits(load(f"{C5}/steps_wood/546362.mp3", trim=False), 8, 0.35, gapf=25)
STING = load(f"{C4}/stinger/271945.mp3"); BREATH = load(f"{C4}/breath/482827.mp3"); ROOM = load(f"{C7}/room_tone/144046.mp3", trim=False); WIND = load(f"{C7}/wind/438862.mp3", trim=False)
WHOOSH = load(f"{C7}/whoosh/855844.mp3"); TH = hits(load(f"{C7}/wood_thunk/803551.mp3", trim=False), 4, 0.4, 0.05); DRILL = load(f"{C7}/drill_screw/871631.mp3")
KN = hits(load(f"{C7}/knock/193835.mp3", trim=False), 4, 0.25, 0.05, gapf=8) or [load(f"{C7}/knock/193835.mp3")[:int(0.25 * SR)]]
ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"; ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
WIN = load(f"{C10}/window_slide2/51047.mp3"); ROPE = load(f"{C10}/rope_ladder/527410.mp3"); RATTLE = load(f"{C4}/chain_rattle/831768.mp3")
SOFA = load(f"{C10}/furniture_fall/809862.mp3"); BODY = load(f"{C10}/body_fall/346692.mp3"); BURST = load(f"{C10}/door_burst/485436.mp3")
DRAG = load(f"{C6}/furniture_drag/832998.mp3"); CREAK = load(f"{C10}/stair_creak/214871.mp3"); SHUF = load(f"{C10}/zombie_shuffle/804982.mp3", trim=False)
# ---------------- eventos (cues.json) ----------------
put(sfx, STING, 0.05, -13, maxlen=2.2, fade=1.0)                                                # 01 gancho
for i, h in enumerate(W["crane_hits"]): put(sfx, TH[i % len(TH)], h, -12 + (i % 2) * 2)          # golpes de zombi en la puerta (solo la puerta se mueve)
put(sfx, ZGROAN, 0.5, -20, maxlen=1.6, fade=0.6); put(sfx, ZGROWL, 2.6, -22, maxlen=1.2, fade=0.5)
put(sfx, WSTEP[0], W["up1"] - 0.05, -18); put(sfx, WSTEP[1 % len(WSTEP)], W["up1"] + 0.45, -19)  # Ava camina a la escalera
put(sfx, ALARM, T["02_down"], -14)                                                              # 02 HUD (radio de Dino Crisis)
FL = [W["two"], W["two"] + 0.16] + [W["five"] + 0.11 * k for k in range(5)]
for t in FL: put(sfx, DEFAULT, t, -17, maxlen=0.3)                                               # cada puerta/ventana destella
for i, h in enumerate([T["03_door"] + 0.05, T["03_door"] + 0.45, W["gives"] - 0.25]): put(sfx, TH[i % len(TH)], h, -10)
put(sfx, BURST, W["gives"] - 0.03, -5, maxlen=1.6, fade=0.5); put(sfx, ZGROWL, W["gives"] + 0.2, -12, maxlen=1.4, fade=0.5)   # 03 la puerta cede
put(sfx, SHUF, W["gives"] + 0.3, -13, maxlen=T["03_died"] - W["gives"] - 0.3, fade=0.3); put(sfx, ZGROAN, W["pour"] + 0.2, -15, maxlen=1.6, fade=0.6)
t = T["03b_late"] + 0.05; i = 0
while t < T["03b_late"] + 1.1: put(sfx, STEP[i % len(STEP)], t, -12); t += 0.3; i += 1            # 03b Ava corre y frena
put(sfx, STING, T["03_died"], -7, maxlen=1.8, fade=0.8); put(sfx, ZGROAN, T["03_died"] + 0.3, -15, maxlen=1.4, fade=0.6)   # YOU DIED
for k in range(3): put(sfx, WSTEP[(k + 2) % len(WSTEP)], T["04_rule"] + 0.4 + k * 0.55, -16)
put(sfx, CREAK, T["04_rule"] + 1.3, -18, maxlen=0.8, fade=0.3)                                   # 04 sube, cruje
trip = W["stairs4"] - 0.5; put(sfx, TH[1 % len(TH)], trip, -12); put(sfx, BODY, trip + 0.45, -6, maxlen=1.2, fade=0.4); put(sfx, ZGROAN, trip + 0.05, -16, maxlen=1.0, fade=0.4)
put(sfx, DEFAULT, W["terrible"], -14, maxlen=0.4)                                               # cartel THIS WORLD'S RULE
put(sfx, INV, T["04b_map"], -10)                                                                # 04b MAPA
for k in ("staircase", "wall", "one4"): put(sfx, DEFAULT, W[k], -15, maxlen=0.35)
put(sfx, DRAG, W["tip"] - 0.35, -14, maxlen=0.5, fade=0.2); put(sfx, SOFA, W["tip"] + 0.35, -6, maxlen=1.3, fade=0.4)   # 05 vuelca el sofa
put(sfx, TH[2 % len(TH)], W["dresser"] + 0.25, -7); put(sfx, TH[0], W["dresser"] + 0.32, -12)      # la comoda cae encima
put(sfx, DRILL, T["05_drill"] + 0.05, -10, maxlen=T["05_screw"] - T["05_drill"] - 0.05, fade=0.08)  # 05b taladro
put(sfx, DRILL, T["05_screw"] + 0.15, -9, maxlen=W["screws"] + 0.35 - T["05_screw"] - 0.15, fade=0.1); put(sfx, DEFAULT, W["three"], -15, maxlen=0.35)
put(sfx, DEFAULT, W["know"] + 0.3, -18, maxlen=0.3)                                             # guino
put(sfx, DRILL, W["screw6"] - 0.05, -10, maxlen=W["edge"] + 0.4 - W["screw6"], fade=0.1); put(sfx, DEFAULT, W["edge"] - 0.1, -15, maxlen=0.35)   # 06 puerta de canto
put(sfx, DRAG, W["push6"] - 0.05, -7, maxlen=W["shelf"] + 0.7 - W["push6"], fade=0.3); put(sfx, TH[3 % len(TH)], W["shelf"] + 0.6, -10); put(sfx, DEFAULT, W["shelf"], -15, maxlen=0.35)
put(sfx, WIN, T["07_ladder"] + 0.2, -9, maxlen=1.4, fade=0.4); put(sfx, DEFAULT, W["exit"], -15, maxlen=0.35)   # 07 abre la ventana
tw = W["window7"] - 0.3 + 0.4; put(sfx, WHOOSH, tw - 0.1, -14, maxlen=0.7); put(sfx, ROPE, tw, -10, maxlen=1.0, fade=0.3)
put(sfx, ROPE, T["07b_out"] + 0.05, -8, maxlen=1.1, fade=0.4); put(sfx, RATTLE, T["07b_out"] + 0.3, -15, maxlen=0.9, fade=0.4)   # 07b se desenrolla
put(sfx, INV, T["07_item"], -10); put(sfx, DEFAULT, W["ways"], -12, maxlen=0.4)                # ITEM / 2 WAYS OUT
for k in ("water", "backpack", "radio", "spray"): put(sfx, DEFAULT, W[k] - 0.05, -14, maxlen=0.35)   # 08 cada objeto en su palabra
TOT = len("DAY 4") + len("SECOND FLOOR") + len("SECURED.")
for k in range(1, TOT + 1): put(sfx, KEY, W["day"] - 0.05 + k / 14, -16)                       # 08b una tecla por letra
put(sfx, SUCCESS, W["save"], -12, maxlen=1.6, fade=0.5)
for i, h in enumerate(W["knock_hits"] + W["knock_end"]): put(sfx, KN[i % len(KN)], h, -9 if h < T["10_choice"] else -14)   # nudillos (persona)
put(sfx, STING, W["zombies9"] + 0.3, -16, maxlen=1.4, fade=0.7)
put(sfx, BREATH, T["09b_ava"] + 0.2, -15, maxlen=1.6, fade=0.5)
put(sfx, INV, T["10_choice"], -10)                                                               # 10 menu
for k in ("let11", "quiet11", "comment"): put(sfx, DEFAULT, W[k], -13, maxlen=0.35)
put(sfx, DEFAULT, VEND + 0.3, -14, maxlen=0.5)                                                   # FOLLOW FOR MORE!
put(sfx, BREATH, T["10_choice"] + 1.5, -16, maxlen=3.0, fade=1.0); put(sfx, BREATH, VEND + 0.6, -16, maxlen=2.5, fade=1.0)
# ---------------- ambiente: room tone del anden / tunel ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
amb = loop(ROOM) * 10 ** (-30 / 20) + loop(WIND) * 10 ** (-36 / 20)
# ---------------- voz y musica ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
TLW = json.load(open(f"{P}/engine/timeline.json", encoding="utf8"))["words"]; m0 = min(w[1] for w in TLW if w[3] == 10) - 0.15; m1 = max(w[2] for w in TLW if w[3] == 10) + 0.4
from scipy.signal import butter, sosfilt
a0, a1 = int(m0 * SR), int(m1 * SR); seg = voice[a0:a1].copy(); pk0 = np.abs(seg).max(); voice[a0:a1] = 0
seg = sosfilt(butter(4, [180, 2600], 'bandpass', fs=SR, output='sos'), seg)                    # el hombre habla detras de la puerta de entrada (abajo)
ir = np.random.default_rng(3).standard_normal(int(0.35 * SR)) * np.exp(-np.arange(int(0.35 * SR)) / (0.07 * SR)) * 0.08; ir[0] = 1
seg = np.convolve(seg, ir); seg *= 0.85 * pk0 / (np.abs(seg).max() + 1e-9)
voice[a0:min(N, a0 + len(seg))] += seg[:N - a0]
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C4}/mus_horror/610534.mp3", trim=False); mus = np.tile(mus, int(np.ceil(N / len(mus))) + 1)[:N] if len(mus) < N else mus[:N]
fo = int(1.0 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
duck = np.ones(N); duck[int(T['03_died'] * SR):int((T['04_rule'] - 0.1) * SR)] = 0.06; mus *= uniform_filter1d(duck, int(0.15 * SR))   # musica cortada en YOU DIED / rebobinado
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 10.5 - mL) / 20)
# ep8 (usuario): ningun tramo de musica mas fuerte que el resto -> nivel por bloques de 4 s igualado al integrado (sin tocar los cortes)
mI = meter.integrated_loudness(st(music)); B = int(4 * SR); gains = []
for i0 in range(0, N, B):
    seg = music[i0:i0 + B]
    try: l = meter.integrated_loudness(st(seg)) if len(seg) > SR and np.abs(seg).max() > 1e-4 else mI
    except Exception: l = mI
    gains.append(np.clip(mI - l, -8, 6) if np.isfinite(l) and l > -70 else 0.0)
cent = np.arange(len(gains)) * B + B // 2; genv = 10 ** (np.interp(np.arange(N), cent, gains) / 20); music *= genv
HK = int(10.8 * SR); hook = np.zeros(N)
drone = load(f"{C7}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{C7}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
env = np.clip(np.arange(N) / (0.3 * SR), 0, 1) * np.clip((10.6 * SR - np.arange(N)) / (2.2 * SR), 0, 1); hook *= env
win = slice(int(0.3 * SR), int(8.0 * SR)); vW = meter.integrated_loudness(st(voice[win])); hW = meter.integrated_loudness(st(hook[win]))
hook *= 10 ** ((vW - 12 - hW) / 20)
mix = voice + music + hook + sfx * 0.9 + amb
lufs = meter.integrated_loudness(st(mix)); g = 10 ** ((-14 - lufs) / 20); mix *= g
pk = np.abs(mix).max(); lim = 10 ** (-1.5 / 20)
if pk > lim:
    k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
print('gancho: voz sobre musica 0-8 s', round(vW - meter.integrated_loudness(st((music + hook)[win])), 1), 'LU; musica', round(vL - meter.integrated_loudness(st(music)), 1), 'LU bajo la voz')
for a, b in ((0, 10), (10, 20), (20, 30), (30, 40), (40, 50), (50, DUR)): print(f'  musica {a}-{b:.0f} s:', round(meter.integrated_loudness(st(((music + hook) * g)[int(a * SR):int(b * SR)])), 1), 'LUFS')
print('mix LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2), 'dur', DUR)
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", (music + hook) * g), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
CRED = {"Freesound CC0 (ep10)": "51047 window (RutgerMuller), 527410 rope (MPierluissi), 809862 sofa fall (Fedor_Ogon), 346692 body fall, 485436 door slam (nobarknoonan), 214871 creak (Fantozzi), 804982 shuffle (Alpaca_Audio)",
        "Freesound CC0 (reusados ep4-ep7)": "271945 stinger, 482827 breath, 817387 steps run, 831768 chain, 610534 music (szegvari), 855844 whoosh, 803551 thunk, 871631 drill, 193835 knock, 144046 room tone, 438862 wind, 799307 drone (CVLTIV8R), 712798 music box (Antenalosmusic), 546362 wood steps, 832998 furniture drag",
        "Resident Evil zombie voices": "Capcom (no monetizado)", "Dino Crisis SFX": "Capcom (no monetizado)"}
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

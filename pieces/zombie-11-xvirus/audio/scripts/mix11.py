# mix9.py -> audio/mix.wav (+ stems), ep11 "How Not to Turn": voz (voz/track.wav) + BGM CC0 continua por LUFS (~11 LU bajo la voz)
# + capa de terror del gancho 0-10 s (drone + caja de musica, como ep5/ep7) + ambiente + SFX reales (Freesound CC0 elegidos con earshot
# rank en ep4/ep7/ep10, Dino Crisis) en su fotograma. Tiempos: engine/cues.json. Master -14 LUFS estereo, TP <= -1 dBTP. python mix9.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-11-xvirus"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
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
FSWING = T['03b_splash'] - 0.6; FHIT = T['03b_splash'] - 0.1
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
C11 = f"{P}/audio/cand"
TAP = load(f"{C11}/tap_water/473707.mp3", trim=False); HIT = load(f"{C11}/pipe_hit/348242.mp3"); SPLAT = load(f"{C11}/splat/646399.mp3"); SQ = load(f"{C11}/squelch/360942.mp3")
SPRAY = load(f"{C11}/spray/674984.mp3"); CLOTH = load(f"{C11}/cloth/494792.mp3"); ZOOM = load(f"{C11}/zoom/154795.mp3"); TICK = hits(load(f"{C11}/tick/462929.mp3", trim=False), 6, 0.2, 0.1, gapf=20) or [load(f"{C11}/tick/462929.mp3")[:int(0.2 * SR)]]
# ---------------- eventos (cues.json) ----------------
put(sfx, STING, 0.05, -13, maxlen=2.2, fade=1.0)                                                 # 01 gancho
put(sfx, ZGROAN, 0.3, -24, maxlen=1.4, fade=0.6); put(sfx, BREATH, 0.4, -18, maxlen=1.6, fade=0.6)
put(sfx, ALARM, T["01b_push"], -14)                                                              # HUD entra (radio de Dino Crisis)
put(sfx, CLOTH, T["01b_push"] + 0.1, -16, maxlen=0.6, fade=0.2)                                  # levanta el brazo
put(sfx, WHOOSH, T["02_micro"] - 0.45, -12, maxlen=0.7); put(sfx, ZOOM, T["02_micro"] - 0.02, -12, maxlen=0.6)   # al microscopio
put(sfx, DEFAULT, T["02_micro"] + 0.35, -14, maxlen=0.35)                                        # X-VIRUS
for k in ("rabies", "blood", "spit"): put(sfx, DEFAULT, W[k], -16, maxlen=0.3)
for k in ("bite2", "scratch2", "splash2"): put(sfx, DEFAULT, W[k] + 0.08, -13, maxlen=0.35); put(sfx, SQ, W[k] + 0.1, -22, maxlen=0.4)
put(sfx, ZGROWL, T["03_fight"] + 0.1, -13, maxlen=1.2, fade=0.5); put(sfx, DEFAULT, W["bare"], -15, maxlen=0.3)   # 03 pelea
put(sfx, WHOOSH, FSWING + 0.15, -12, maxlen=0.5); put(sfx, HIT, FHIT, -6, maxlen=0.6, fade=0.2); put(sfx, ZGROAN, FHIT + 0.05, -14, maxlen=1.0, fade=0.4)
put(sfx, SPLAT, W["eye3"] - 0.04, -6, maxlen=0.8, fade=0.3); put(sfx, SQ, W["eye3"], -12, maxlen=0.5)
put(sfx, ALARM, W["eye3"] + 0.05, -16); put(sfx, DEFAULT, W["splash3"], -13, maxlen=0.35)
put(sfx, STING, T["03_died"], -7, maxlen=1.8, fade=0.8); put(sfx, ZGROAN, T["03_died"] + 0.3, -15, maxlen=1.4, fade=0.6)   # YOU DIED
put(sfx, INV, T["04_gear"], -10)                                                                 # 04 ITEM
put(sfx, CLOTH, W["sleeves"] - 0.05, -10, maxlen=0.6, fade=0.2); put(sfx, CLOTH, W["gloves"] - 0.05, -12, maxlen=0.4, fade=0.15); put(sfx, DEFAULT, W["goggles"] - 0.05, -13, maxlen=0.3); put(sfx, CLOTH, W["mask"] - 0.05, -11, maxlen=0.5, fade=0.2)
for k in ("sleeves", "gloves", "goggles", "mask"): put(sfx, DEFAULT, W[k] - 0.05, -17, maxlen=0.25)
put(sfx, SPLAT, W["laundry"] - 0.1, -12, maxlen=0.5, fade=0.2); put(sfx, SUCCESS, W["laundry"] + 0.25, -15, maxlen=1.0, fade=0.4)
wa = T["05_wash"]; put(sfx, TAP, wa, -13, maxlen=T["05c_spray"] - wa, fade=0.3, fin=0.15)           # 05 agua corriente
put(sfx, DEFAULT, W["soap"], -15, maxlen=0.3); put(sfx, DEFAULT, W["running"], -15, maxlen=0.3)
for i, t in enumerate(np.arange(W["fifteen5"], T["05c_spray"] - 0.1, 0.25)): put(sfx, TICK[i % len(TICK)], t, -16)   # el reloj corre
put(sfx, INV, T["05c_spray"], -10); put(sfx, SPRAY, W["disinfect"] - 0.02, -9, maxlen=1.2, fade=0.4); put(sfx, DEFAULT, W["medical"], -13, maxlen=0.35)
put(sfx, CLOTH, W["touch"] - 0.4, -16, maxlen=0.5, fade=0.2); put(sfx, DEFAULT, W["touch"], -11, maxlen=0.4)   # 06 no te toques la cara
put(sfx, ZGROAN, T["06_face"] + 0.2, -26, maxlen=1.2, fade=0.5)
put(sfx, TAP, T["06b_hands"], -14, maxlen=T["07_diary"] - T["06b_hands"], fade=0.3, fin=0.1); put(sfx, DEFAULT, W["hands"] - 0.2, -15, maxlen=0.3)
put(sfx, INV, T["07_diary"], -11)                                                                # 07 FILE: una tecla por letra
LINES = [("DAY 1", "day1"), ("Fever. Headache.", "fever"), ("DAY 2", "day2"), ("Red eyes.", "red"), ("Keeps staring at", "stare"), ("the wall.", "stare"), ("DAY 3", "day3"), ("? ? ?", "know")]
prev, carry = None, 0
for s_, w_ in LINES:
    t0 = carry if w_ == prev else W[w_] - 0.05; carry = t0 + len(s_) / 22; prev = w_
    for k, ch_ in enumerate(s_):
        if ch_ != " ": put(sfx, KEY, t0 + (k + 1) / 22, -17)
put(sfx, DEFAULT, W["world7"], -15, maxlen=0.3); put(sfx, STING, W["know"] + 0.1, -15, maxlen=1.2, fade=0.6)
put(sfx, CLOTH, T["08_quar"] + 0.1, -15, maxlen=0.6, fade=0.2)                                   # 08 cuarentena
for i, h in enumerate([T["08b_front"] + 0.1, T["08b_front"] + 0.32]): put(sfx, KN[i % len(KN)], h, -10)
put(sfx, DEFAULT, W["guy"], -15, maxlen=0.3)
for i, t in enumerate(np.arange(T["08c_sign"] + 0.1, T["09_twist"] - 0.1, 0.5)): put(sfx, TICK[i % len(TICK)], t, -15)
put(sfx, DEFAULT, W["seventy"], -12, maxlen=0.4)
put(sfx, STING, W["scratch9"] + 0.05, -12, maxlen=1.6, fade=0.7); put(sfx, DEFAULT, W["scratch9"], -15, maxlen=0.3)   # 09 el rasguno
put(sfx, BREATH, W["when"] + 0.9, -15, maxlen=1.4, fade=0.5)
put(sfx, INV, T["10_choice"], -10)                                                               # 10 menu
for k in ("wash10", "quarantine", "comment"): put(sfx, DEFAULT, W[k], -13, maxlen=0.35)
put(sfx, DEFAULT, VEND + 0.3, -14, maxlen=0.5)                                                   # FOLLOW FOR MORE!
put(sfx, BREATH, T["10_choice"] + 1.2, -16, maxlen=3.0, fade=1.0); put(sfx, BREATH, VEND + 0.6, -16, maxlen=2.5, fade=1.0)
# ---------------- ambiente: room tone del anden / tunel ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
amb = loop(ROOM) * 10 ** (-30 / 20) + loop(WIND) * 10 ** (-36 / 20)
# ---------------- voz y musica ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C4}/mus_horror/610534.mp3", trim=False); mus = np.tile(mus, int(np.ceil(N / len(mus))) + 1)[:N] if len(mus) < N else mus[:N]
fo = int(1.0 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
duck = np.ones(N); duck[int(T['03_died'] * SR):int((T['04_gear'] - 0.1) * SR)] = 0.06; mus *= uniform_filter1d(duck, int(0.15 * SR))   # musica cortada en YOU DIED / rebobinado
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
CRED = {"Freesound CC0 (ep11)": "473707 tap water, 348242 punch impact, 646399 blood splat, 360942 squelch, 674984 spray can hiss, 494792 cloth rustle, 154795 lens zoom, 462929 clock tick (ver audio/cand/*/meta.json para autores)",
        "Freesound CC0 (reusados ep4-ep7)": "271945 stinger, 482827 breath, 610534 music (szegvari), 855844 whoosh, 193835 knock, 144046 room tone, 438862 wind, 799307 drone (CVLTIV8R), 712798 music box (Antenalosmusic)",
        "Resident Evil zombie voices": "Capcom (no monetizado)", "Dino Crisis SFX": "Capcom (no monetizado)"}
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

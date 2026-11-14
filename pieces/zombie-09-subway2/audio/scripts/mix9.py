# mix9.py -> audio/mix.wav (+ stems), ep9 "The Last Train, Part 2": voz (voz/track.wav) + BGM CC0 continua por LUFS (~11 LU bajo la voz)
# + capa de terror del gancho 0-10 s (drone + caja de musica, como ep5/ep7) + ambiente + SFX reales (Freesound CC0 elegidos con earshot
# rank en ep4/ep7/ep9, Dino Crisis) en su fotograma. Tiempos: engine/cues.json. Master -14 LUFS estereo, TP <= -1 dBTP. python mix9.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-09-subway2"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
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
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
STEP = hits(load(f"{C4}/steps_run/817387.mp3", trim=False), 8, 0.28, gapf=25)
TRAIN = load(f"{C4}/train_depart/705378.mp3", trim=False); CHAIN = load(f"{C4}/chain_rattle/345070.mp3"); GATE = load(f"{C4}/chain_rattle/831768.mp3")
BEEP = load(f"{C4}/phone_beep/530482.mp3"); RUSTLE = load(f"{C4}/paper_rustle/353125.mp3"); DOORS = load(f"{C4}/subway_doors/187310.mp3"); CHIME = load(f"{C4}/door_chime/720572.mp3")
STING = load(f"{C4}/stinger/271945.mp3"); BREATH = load(f"{C4}/breath/482827.mp3"); CLUNK = load(f"{E3}/light_switch/870288.mp3"); ROOM = load(f"{C4}/room_tone/479536.mp3", trim=False)
WHOOSH = load(f"{C7}/whoosh/855844.mp3"); GL = hits(load(f"{C7}/glass_bang/104339.mp3", trim=False), 6, 0.35, 0.08); TH = hits(load(f"{C7}/wood_thunk/803551.mp3", trim=False), 4, 0.4, 0.05)
ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"; ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
GLITCH = load(f"{C}/glitch/834161.mp3"); VHS = load(f"{C}/vhs_rewind/613353.mp3"); RIDE = load(f"{C}/subway_ride/650720.mp3", trim=False); BRAKE = load(f"{C}/brake/838597.mp3", trim=False)
TK = hits(load(f"{C}/tick/485407.mp3", trim=False), 1, 0.25, 0.1); TICK = TK[0] if TK else load(f"{C}/tick/485407.mp3")[:int(0.25 * SR)]
# ---------------- eventos (cues.json) ----------------
put(sfx, STING, 0.05, -13, maxlen=2.2, fade=1.0)                                              # 01 gancho
put(sfx, CHIME, 0.4, -24, maxlen=1.5, fade=0.5)                                                # el tren abierto (timbre lejano)
for t in (W["geton"], W["stay"]): put(sfx, DEFAULT, t, -13, maxlen=0.4)                         # 1 GET ON / 2 STAY
put(sfx, DEFAULT, T["02_stay"], -14, maxlen=0.5)                                                # HUD + 2 STAY fijo
put(sfx, CHIME, W["close2"] - 0.75, -15, maxlen=1.0, fade=0.3); put(sfx, DOORS, W["close2"] - 0.1, -9, maxlen=1.6, fade=0.4)   # 02 se cierran
put(sfx, TRAIN, W["leaves"] - 0.2, -9, maxlen=T["02b_floor"] + 1.2 - W["leaves"], fade=1.2)      # el tren se va
put(sfx, RUSTLE, T["02b_floor"] + 0.7, -14, maxlen=1.0)                                         # 02b levanta el papel
put(sfx, INV, T["02c_file"], -10); put(sfx, RUSTLE, T["02c_file"] + 0.08, -16, maxlen=0.6)      # 02c FILE, la mitad encaja
put(sfx, DEFAULT, W["ifw"], -17, maxlen=0.4); put(sfx, STING, W["dont"], -16, maxlen=1.5, fade=0.8)
for i in range(4): put(sfx, STEP[(i + 2) % len(STEP)], W["steps3"] - 0.35 + i * 0.42, -24 + 3 * i)   # 03 pasos lentos detras
put(sfx, ALARM, W["steps3"], -14); put(sfx, WHOOSH, W["turn3"] - 0.05, -18, maxlen=0.8)          # DANGER / se da vuelta
put(sfx, STING, T["03b_eyes"] + 0.3, -8, maxlen=3.0, fade=1.2); put(sfx, ZGROAN, T["03b_eyes"] + 0.8, -19, maxlen=1.6, fade=0.6)   # los ojos
put(sfx, BREATH, T["03c_smile"] + 0.1, -12, maxlen=T["04_run"] - T["03c_smile"], fade=0.4); put(sfx, ZGROWL, W["wide"], -15, maxlen=1.2, fade=0.5)
arr = W["locked"] - 0.25                                                                        # 04 corre (un paso cada 1/3 s) y choca con la reja
t = T["04_run"] + 0.05; i = 0
while t < arr: put(sfx, STEP[i % len(STEP)], t, -13); t += 1 / 3; i += 1
put(sfx, CHAIN, W["locked"] - 0.02, -6, maxlen=1.0, fade=0.4); put(sfx, GATE, W["locked"] + 0.05, -12, maxlen=0.8, fade=0.3)
put(sfx, ZGROWL, T["04b_fudge"] + 0.2, -20, maxlen=1.2, fade=0.5)                                # la criatura detras
put(sfx, STING, T["04c_died"], -7, maxlen=1.8, fade=0.8); put(sfx, ZGROAN, T["04c_died"] + 0.3, -15, maxlen=1.4, fade=0.6)   # YOU DIED
put(sfx, GLITCH, T["05_rewind"], -10, maxlen=0.55, fade=0.08)                                   # 05 glitch
put(sfx, VHS, T["05_rewind"] + 0.45, -13, maxlen=T["06_geton"] - T["05_rewind"] - 0.45, fade=0.15, fin=0.05)   # rebobinado VHS
put(sfx, DEFAULT, T["06_geton"], -14, maxlen=0.4)                                               # 06 1 GET ON
for i in range(3): put(sfx, STEP[(i + 4) % len(STEP)], T["06_geton"] + 0.3 + i * 0.45, -18)
put(sfx, DOORS, W["shut"] - 0.15, -8, maxlen=1.4, fade=0.3)                                      # las puertas en su cara
for i, h in enumerate(W["bang_hits"]): put(sfx, GL[i % len(GL)], h, -6); put(sfx, TH[i % len(TH)], h, -12)   # golpes en el vidrio (solo las hojas)
put(sfx, ZGROWL, W["bangs"] - 0.1, -12, maxlen=1.6, fade=0.5)
put(sfx, RIDE, T["06c_breathe"] + 1.2, -18, maxlen=T["07_speed"] - T["06c_breathe"] - 1.2, fade=0.3, fin=0.6)   # el tren arranca
put(sfx, RIDE, T["07_speed"], -8, maxlen=W["stops"] + 0.4 - T["07_speed"], fade=0.6)            # 07 acelera por el tunel
put(sfx, TRAIN, W["switches"] - 0.1, -13, maxlen=1.2, fade=0.5); put(sfx, DEFAULT, W["switches"], -19, maxlen=0.3)   # cambio de via + senal verde
put(sfx, BRAKE, W["stops"] - 0.2, -9, maxlen=3.0, fade=1.0)                                     # frena en el tunel desconocido
for k in range(6):                                                                              # 07c tiras de luz que se apagan hasta 'out'
    t = W["lights"] + (W["out8"] + 0.25 - W["lights"]) * (k + 1) / 6; put(sfx, CLUNK, t, -14 + 1.2 * k, maxlen=0.35)
put(sfx, STING, W["out8"] + 0.1, -12, maxlen=1.8, fade=0.8)
put(sfx, BEEP, W["screen"] - 0.05, -12); put(sfx, ALARM, W["screen"] + 0.1, -16)                 # 08 la pantalla se enciende
for k in ("laststop", "minute"): put(sfx, DEFAULT, W[k], -16, maxlen=0.35)
for k in ("red", "white"): put(sfx, DEFAULT, W[k], -13, maxlen=0.35)                             # 08b botones
t = W["minute"]
while t < DUR - 0.3: put(sfx, TICK, t, -24 if t < W["five"] else -18, maxlen=0.25); t += 1.0     # tic del contador
put(sfx, DOORS, W["open10"] - 0.1, -9, maxlen=1.6, fade=0.4)                                     # 09 las puertas se abren a lo negro
put(sfx, ALARM, W["five"], -14)
put(sfx, BREATH, W["breathing"] - 0.6, -7, maxlen=min(3.2, T["10_choice"] - W["breathing"] + 0.9), fade=0.8)   # algo respira afuera
put(sfx, BREATH, T["10_choice"] + 1.2, -15, maxlen=3.0, fade=1.0)
put(sfx, INV, T["10_choice"], -10)                                                              # 10 menu
for k in ("leave11", "stay11", "comment"): put(sfx, DEFAULT, W[k], -13, maxlen=0.35)
put(sfx, DEFAULT, VEND + 0.3, -14, maxlen=0.5)                                                   # FOLLOW FOR MORE!
# ---------------- ambiente: room tone del anden / tunel ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
amb = loop(ROOM) * 10 ** (-28 / 20)
# ---------------- voz y musica ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C4}/mus_horror/610534.mp3", trim=False); mus = np.tile(mus, int(np.ceil(N / len(mus))) + 1)[:N] if len(mus) < N else mus[:N]
fo = int(1.0 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
duck = np.ones(N); duck[int(T['04c_died'] * SR):int((T['06_geton'] - 0.1) * SR)] = 0.08; mus *= uniform_filter1d(duck, int(0.15 * SR))   # musica cortada en YOU DIED / rebobinado
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 11 - mL) / 20)
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
for a, b in ((0, 10), (10, 24), (28, 40), (40, DUR)): print(f'  musica {a}-{b:.0f} s:', round(meter.integrated_loudness(st(((music + hook) * g)[int(a * SR):int(b * SR)])), 1), 'LUFS')
print('mix LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2), 'dur', DUR)
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", (music + hook) * g), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
CRED = {"Freesound CC0 (ep4)": "705378 train, 345070/831768 chain, 530482 beep, 353125 paper, 187310 doors, 720572 chime, 271945 stinger, 482827 breath, 817387 steps, 479536 room tone, 610534 music (szegvari)",
        "Freesound CC0 (ep7)": "855844 whoosh, 104339 glass, 803551 thunk, 799307 drone (CVLTIV8R), 712798 music box (Antenalosmusic)", "Freesound CC0 (ep3)": "870288 light switch",
        "Freesound CC0 (ep9)": "834161 glitch, 613353 VHS rewind, 650720 subway interior, 838597 tram/brake, 485407 clock tick",
        "Resident Evil zombie voices": "Capcom (no monetizado)", "Dino Crisis SFX": "Capcom (no monetizado)"}
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

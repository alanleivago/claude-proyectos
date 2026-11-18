# mix15.py -> audio/mix.wav (+ stems), ep15 "The Last Train, Part 3". Base: mix14 (ep14) + SFX del metro del ep4/ep9 + kit del gigante del largo 3.
# Voz (voz/track.wav) + gancho de terror 0-10 s (~7 LU bajo la voz) -> BGM CC0 oscura (610534, 10-11 LU bajo la voz por bloques de 4 s).
# Cada vez que el gigante esta en pantalla suena su tema (pedido del usuario: audio/bgm_giant/, cruce ~0,6-0,8 s) y entra un gruñido/rugido en su
# cuadro de aparicion. Musica fuera en YOU DIED. SFX reales en su cuadro (tiempos de engine/cues.json y de la misma logica de lasttrain3.js).
# Master estereo -14 LUFS, TP <= -1 dBTP. python mix15.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
from scipy.signal import butter, sosfilt
SR = 48000
R = "/Users/alanleiva/claude-proyectos"; P = f"{R}/pieces/zombie-15-lasttrain3"; DC = f"{R}/assets/dino-crisis-sfx"
L1 = f"{R}/pieces/zombie-03-station/largo/audio/cand"; L2 = f"{R}/pieces/zombie-03-station/largo2/audio/cand"; L3 = f"{R}/pieces/zombie-03-station/largo3/audio/cand"
C4 = f"{R}/pieces/zombie-04-subway/audio/cand"; C7 = f"{R}/pieces/zombie-07-saferoom/audio/cand"; C9 = f"{R}/pieces/zombie-09-subway2/audio/cand"; C15 = f"{P}/audio/cand"
CU = json.load(open(f"{P}/engine/cues.json", encoding="utf8")); W, T = CU["W"], CU["T"]; DUR = CU["END"]; N = int(DUR * SR); VEND = CU["VOICE_END"]
LN = {l[0]: l[1] for l in json.load(open(f"{P}/voz/lines.json", encoding="utf8"))}
TLW = json.load(open(f"{P}/engine/timeline.json", encoding="utf8"))["words"]; LE = lambda i: max(w[2] for w in TLW if w[3] == i)
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
lp = lambda x, fc: sosfilt(butter(4, fc, 'lowpass', fs=SR, output='sos'), x)
hp = lambda x, fc: sosfilt(butter(2, fc, 'highpass', fs=SR, output='sos'), x)
slow = lambda x, k=0.5: np.interp(np.linspace(0, len(x) - 1, int(len(x) / k)), np.arange(len(x)), x)
sfx = np.zeros(N)
def put(buf, x, t, db, maxlen=None, fade=0.05, fin=0.0):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]; f = min(len(x), int(fade * SR)); x[-f:] *= np.linspace(1, 0, f)
    if fin: f = min(len(x), int(fin * SR)); x[:f] *= np.linspace(0, 1, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)
EV = lambda t, x, db, ml=None, fade=0.05, fin=0.0: put(sfx, x, t, db, maxlen=ml, fade=fade, fin=fin)
# ---------------- fuentes reales ----------------
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
STEPS = hits(load(f"{DC}/ch/walk_run_indoors.wav", trim=False), 8, 0.3, 0.12, gapf=20)          # pasos de Ava (Dino Crisis)
STING = load(f"{C4}/stinger/271945.mp3"); STING2 = load(f"{C4}/stinger/587265.mp3"); WHOOSH = load(f"{C7}/whoosh/855844.mp3")
ROOM = load(f"{C4}/room_tone/479536.mp3", trim=False); RUMBLE = lp(load(f"{L3}/house_rumble/337829.mp3", trim=False), 220)
HUM = load(f"{C4}/fluor_hum/452626.mp3", trim=False); BUZZ = load(f"{C4}/fluor_hum/637414.mp3", trim=False)
DOORS = load(f"{C4}/subway_doors/187310.mp3"); CHIME = load(f"{C4}/door_chime/720572.mp3"); RUSTLE = load(f"{C4}/paper_rustle/353125.mp3")
TRAIN = load(f"{C4}/train_depart/705378.mp3", trim=False); RIDE = load(f"{C9}/subway_ride/650720.mp3", trim=False); BRAKE = load(f"{C9}/brake/838597.mp3", trim=False)
CLACK = load(f"{C9}/switch/675299.mp3"); SHUNT = load(f"{C15}/switch_points/723528.mp3"); LEVER = load(f"{L3}/lever/752755.mp3"); LEVER2 = load(f"{L3}/lever/623712.mp3")
GLITCH = load(f"{C9}/glitch/834161.mp3"); VHS = load(f"{C9}/vhs_rewind/613353.mp3"); PDOWN = load(f"{C9}/power_down/348249.mp3")
TK = hits(load(f"{C9}/tick/485407.mp3", trim=False), 1, 0.25, 0.1); TICK = TK[0] if TK else load(f"{C9}/tick/485407.mp3")[:int(0.25 * SR)]
GLB = hits(load(f"{C9}/glass_bang/104339.mp3", trim=False), 4, 0.5, 0.08) or [load(f"{C9}/glass_bang/104339.mp3")]
TAPE = load(f"{C15}/tape_rip/267712.mp3"); MDOOR = load(f"{C15}/metal_door/700705.mp3"); CLOTH = load(f"{L1}/cloth/320142.mp3")
LAND = load(f"{L3}/heavy_land/673424.mp3"); HB = lp(load(f"{L1}/heartbeat/130939.mp3"), 1200)[:int(0.9 * SR)]
GSTEP = lp(load(f"{L3}/impact/735421.mp3"), 900)                                                # paso descalzo pesado del gigante (STALKER.md)
ROAR = lp(slow(load(f"{L3}/monster_growl/366837.mp3"), 0.9), 3500); GROWL = lp(slow(load(f"{L3}/monster_roar/222523.mp3"), 0.9), 2200); CBR = lp(load(f"{L3}/monster_growl/634201.mp3"), 1500)
# ---------------- tiempos (misma logica que lasttrain3.js) ----------------
sm = lambda x: np.clip(x, 0, 1) ** 2 * (3 - 2 * np.clip(x, 0, 1)); ease = lambda a, b, x: sm((x - a) / (b - a))
TW0, WALK = T["02b_step"], 1.05
avaZ = lambda t: -137.6 - WALK * max(0, min(t, W["turn"] - 0.05) - TW0)
gz = lambda t: avaZ(t) + 3.0 + 5.2 * (1 - ease(W["turn"] - 0.9, W["turn"] + 2.1, t)); gStep = lambda t: (avaZ(t) + 8.2 - gz(t)) / 1.64
TA, TBK, TSTOP = W["close"] + 0.55, W["pull"] + 0.1, W["stops"] + 0.35
# ---------------- eventos ----------------
EV(0.05, STING, -13, 2.2, 1.0)                                                                       # 01 gancho
EV(T["01b_cab"], ALARM, -15); EV(T["01b_cab"] + 0.25, lp(MDOOR, 3000), -20, 1.2, 0.4)               # HUD de golpe; la puerta de la cabina cruje sola
EV(W["driving"] - 0.05, DEFAULT, -16, 0.3)
EV(W["red"] - 0.05, DEFAULT, -12, 0.35); EV(W["red"] + 0.02, INV, -15)                               # 02 boton LEAVE
EV(T["02b_step"] + 0.05, CLOTH, -15, 0.5, 0.2)
t = T["02b_step"] + 0.15; k = 0
while t < W["turn"] - 0.1: EV(t, STEPS[k % len(STEPS)], -15 - (k % 2), 0.3); t += 0.52; k += 1          # pasos de Ava en el balasto (walk 1,05 m/s)
EV(W["third"] - 0.05, DEFAULT, -16, 0.3); EV(W["six"] - 0.05, DEFAULT, -14, 0.3)
put(sfx, lp(np.tile(BUZZ, 4), 400)[:int((T["03_steps"] - T["02c_rail"]) * SR)], T["02c_rail"], -20, fin=0.3)   # zumbido del tercer riel
for dt in (0.25, 1.05): EV(W["footsteps3"] + dt, lp(GSTEP, 600), -12, 1.0)                           # 03 pasos pesados y descalzos detras (todavia lejos)
EV(W["turn"] - 0.05, lp(WHOOSH, 2500), -17, 0.6); EV(W["turn"], CLOTH, -15, 0.5, 0.2)
# --- gigante 1: rama LEAVE ---
EV(T["03b_turn"] + 0.02, CBR, -14, 1.8, 0.6, 0.15)                                                   # aparece (luz verde en lo negro): respiracion grave
EV(W["turn"] + 0.55, ROAR, -3, 3.0, 1.0)                                                             # ella lo ve: rugido
tt = np.arange(T["03b_turn"], T["03c_back"], 0.01); ph = np.array([gStep(x) for x in tt])
for i in range(1, len(tt)):
    if np.floor(ph[i] * 2) > np.floor(ph[i - 1] * 2): EV(tt[i], GSTEP, -6 + 3 * ease(T["03b_turn"], W["turn"] + 1.5, tt[i]), 1.0)   # un paso cada media zancada
EV(T["03c_back"] + 0.05, GROWL, -6, 1.6, 0.6); EV(T["03c_back"] + 0.95, GSTEP, -1, 1.2); EV(T["03c_back"] + 0.97, RUMBLE, -12, 1.0, 0.5)   # plano de espalda: un paso
EV(T["04_fudge"] + 0.25, CBR, -8, 1.6, 0.5); EV(T["04_fudge"] + 1.0, GSTEP, -3, 1.0)
EV(T["04c_died"], STING2, -8, 2.0, 0.8); EV(T["04c_died"], lp(LAND, 300), -10, 1.5, 0.6)              # YOU DIED
EV(T["05_rewind"], GLITCH, -9, 0.35, 0.05); EV(T["05_rewind"] + 0.33, VHS, -12, 0.95, 0.2)             # 05 glitch + rebobinado VHS
# --- rama STAY ---
EV(W["white"] - 0.05, DEFAULT, -12, 0.35); EV(W["white"] + 0.02, INV, -15)
EV(W["doors"] - 0.35, CHIME, -15, 1.0, 0.3); EV(W["close"] - 0.1, DOORS, -9, 1.6, 0.4)                # 06b puertas
EV(T["06b_close"] + 0.03, lp(GROWL, 1500), -9, 1.6, 0.5)                                              # gigante 2: aparece en el vidrio
EV(W["close"] + 0.35, lp(GSTEP, 700), -6, 1.0)
EV(W["smile6"], GLB[0], -2, 0.6); EV(W["smile6"] + 0.01, lp(LAND, 600), -10, 0.6, 0.3); EV(W["smile6"] + 0.15, lp(ROAR, 2000), -7, 2.0, 0.8)   # manopla contra el vidrio
EV(TA, TRAIN, -8, 4.0, 1.0)                                                                           # el tren arranca solo
ride = np.tile(RIDE, int(np.ceil((TSTOP - TA + 1) * SR / len(RIDE))) + 1)[:int((TSTOP - TA + 0.6) * SR)]
sp = np.clip((np.arange(len(ride)) / SR) / 2.5, 0, 1) * np.clip((TSTOP + 0.4 - TA - np.arange(len(ride)) / SR) / 1.6, 0, 1); put(sfx, ride * (0.25 + 0.75 * sp), TA, -9, fin=0.6)
EV(T["06c_speed"] + 0.1, LEVER2, -9, 0.6); EV(T["06c_speed"] + 0.12, CLACK, -10, 0.8)                 # 06c las agujas se mueven
EV(T["06c_speed"] + 1.1, SHUNT, -5, 2.0, 0.6); EV(T["06c_speed"] + 1.3, CLACK, -6, 1.5)                # el vagon toma el cambio y se sacude
EV(W["nobody"] - 0.05, DEFAULT, -15, 0.3)
EV(W["switch7"] - 0.05, DEFAULT, -14, 0.3); EV(W["lets"] + 0.1, LEVER2, -10, 0.5); EV(W["brakes"] - 0.05, DEFAULT, -14, 0.3)
EV(T["07c_tape"] + 0.25, DEFAULT, -13, 0.3)
EV(T["08_rule"] + 0.05, RUSTLE, -12, 1.0, 0.3); EV(T["08_rule"] + 0.05, INV, -15); EV(W["three8"] - 0.05, DEFAULT, -12, 0.35)
EV(T["08b_enter"] + 0.25, MDOOR, -10, 1.4, 0.4); EV(T["08b_enter"] + 0.8, STEPS[1], -14, 0.3); EV(T["08b_enter"] + 1.3, STEPS[2], -15, 0.3)
EV(W["rip"] - 0.05, TAPE, -6, 1.2, 0.3)                                                               # 08c la cinta
EV(W["pull"] + 0.12, LEVER, -5, 0.8); EV(W["brake8"] - 0.05, DEFAULT, -14, 0.3)
put(sfx, BRAKE[:int((TSTOP - W["pull"] + 0.2) * SR)], W["pull"] + 0.15, -6, fade=0.4)                  # chirrido de frenos + chispas hasta parar
EV(TSTOP - 0.05, lp(LAND, 300), -8, 1.2, 0.5)
EV(W["dark"] - 0.15, PDOWN, -9, 1.5, 0.5)                                                             # las lamparas se apagan
# --- gigante 3: el vagon siguiente ---
put(sfx, lp(np.tile(BUZZ, 6), 4000)[:int((T["10_count"] - T["09b_next"]) * SR)] * (0.5 + 0.5 * np.repeat(np.random.default_rng(7).random(40) > 0.4, int(0.4 * SR))[:int((T["10_count"] - T["09b_next"]) * SR)]), T["09b_next"], -19, fin=0.2)   # zumbido de tubos que parpadean
for i, dt in enumerate((0.15, 0.95, 1.75)): EV(W["footsteps9"] + dt - 0.3, lp(GSTEP, 500), -6 - i, 1.0)   # pasos en el vagon de al lado
EV(W["car9"] - 0.6, lp(CBR, 1200), -9, 1.8, 0.5)                                                      # se asoma a la ventana
EV(W["smile9"] - 0.05, lp(ROAR, 2500), -3, 2.6, 0.9)                                                  # "the smile": rugido detras de la puerta
EV(T["10_count"] + 0.05, ALARM, -12); EV(T["10_count"] + 0.05, DEFAULT, -11, 0.4); EV(W["ten"] + 0.05, DOORS, -10, 1.6, 0.4)
# cuenta: un tic por cada numero que baja (cdown de lasttrain3.js)
cd = lambda t: max(1, int(np.ceil(10 - 9.2 * max(0, t - W["ten"]) / (DUR - 0.5 - W["ten"]))))
prev = cd(W["ten"])
for x in np.arange(W["ten"], DUR - 0.05, 0.01):
    if cd(x) < prev: EV(x, TICK, -13 if cd(x) > 3 else -10); prev = cd(x)
# --- v3: decision RE3 (lasttrain3.js 10_choice): destellos con golpe grave, el cazador golpea la puerta del fondo (solo la hoja cede), gruñidos estirados x0,5 ---
TD = T["10_choice"]; HITS = [0.0, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6, 6.4]
hitReal = lambda h: 0.0 if h < 1.0 else 3.25 if h < 1.9 else 6.4 + (h - 1.9) / 0.5
for dt in (0.0, 3.25, 6.15): EV(TD + dt, lp(LAND, 300), -8, 2.0, 0.8)                                       # golpes graves en los destellos
for h in HITS:
    x = TD + hitReal(h)
    if x < DUR - 0.2: EV(x, lp(LAND, 700), -3, 1.4, 0.5); EV(x + 0.005, GLB[1 % len(GLB)], -9, 0.6, 0.2); EV(x + 0.01, lp(RUMBLE, 200), -11, 1.0, 0.5)   # la manopla contra la puerta
put(sfx, lp(slow(GROWL, 0.5), 900)[:int(6.0 * SR)], TD + 0.3, -10, fade=0.8, fin=0.4)                     # en el negativo: gruñido estirado y grave
for h in HITS[2:]:
    x = TD + hitReal(h) + 0.15
    if x < DUR - 1.0: EV(x, lp(slow(CBR, 0.5), 1000), -12, 2.0, 0.6)                                          # camara lenta: respiracion grave tras cada golpe
EV(W["one10"] - 0.05, DEFAULT, -13, 0.35); EV(W["two10"] - 0.05, DEFAULT, -13, 0.35); EV(TD + 6.4, INV, -14)   # caja azul en "one"/"two"
EV(DUR - 0.95, lp(LAND, 400), -3, 0.95, 0.3); EV(DUR - 0.95, STING2, -9, 0.95, 0.4)   # golpe en el ultimo tic                                             # gigante 4: sigue en la ventana
t = TD + 0.5
while t < DUR - 0.4: EV(t, HB, -13 if t < TD + 6.4 else -12); t += 1.5 if t < TD + 6.4 else 1.0      # latido 40 bpm en el negativo, 60 despues
# ---------------- ambiente: room tone del vagon adentro, tunel afuera; mas presente en las pausas ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
EXT = [("02b_step", "04c_died"), ("06c_speed", "06d_empty"), ("08e_sparks", "09b_next")]
outK = np.zeros(N)
for a, b in EXT: outK[int(T[a] * SR):int(T[b] * SR)] = 1
outK = uniform_filter1d(outK, int(0.15 * SR)); inK = 1 - outK
amb = loop(RUMBLE) * 10 ** (-24 / 20) * outK + loop(ROOM) * 10 ** (-30 / 20) * inK + lp(loop(HUM), 3000) * 10 ** (-36 / 20) * inK
pz = np.zeros(N)
for a, b in ((LE(1) + 0.1, LN["02_leave"][0][0] if isinstance(LN["02_leave"][0], list) else LN["02_leave"][0]), (LE(8) + 0.1, LN["09_stop"][0])): pz[int(a * SR):int(b * SR)] = 1
amb *= 1 + 1.0 * uniform_filter1d(pz, int(0.12 * SR))
# ---------------- voz y musica ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
meter = pyln.Meter(SR); st = lambda m: m if m.ndim == 2 else np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
def fit(x): return np.tile(x, int(np.ceil(N / len(x))) + 1)[:N] if len(x) < N else x[:N]
mus = fit(load(f"{C4}/mus_horror/610534.mp3", trim=False))
GB = f"{P}/audio/bgm_giant/nHx2FLQQDSM.wav"; GSEG = [(T["03b_turn"], T["04c_died"], 0.5), (T["06b_close"], T["06c_speed"], 0.5), (T["09b_next"], DUR, 0.5)]   # v4 (usuario): cada aparicion reinicia el tema en 0,5 s   # v3: el tema del cazador sigue sin cortes desde el vagon siguiente hasta el final (decision incluida)
giant = np.zeros(N); gk = np.zeros(N); tt = np.arange(N) / SR
for a, b, off in GSEG:   # tema del gigante: entra con el gigante (0,6 s) y sale al cambiar de escena (0,8 s); cada aparicion desde un punto distinto del tema
    seg = load(GB, off, off + (b - a) + 1.0, trim=False); i0 = int(a * SR); n = min(len(seg), N - i0); giant[i0:i0 + n] += seg[:n]
    gk += np.clip((tt - a) / 0.2, 0, 1) * np.clip((b + 0.4 - tt) / 0.8, 0, 1) * (tt >= a)   # entrada 0,2 s: el ataque cae con el cazador
gk = np.clip(gk, 0, 1); giant *= gk
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 10.5 - mL) / 20)
gL = meter.integrated_loudness(st(giant[gk > 0.9])); giant *= 10 ** ((vL - 10.5 - gL) / 20)
gate = np.ones(N)
gate[(tt > T["04c_died"] - 0.03) & (tt < T["06_stay"])] = 0                                            # musica fuera en YOU DIED y el rebobinado
gate[tt < 9.0] = 0; m = (tt >= 9.0) & (tt < 11.0); gate[m] = (tt[m] - 9.0) / 2.0                       # 0-10 s gancho de terror, cruce al BGM
gate = uniform_filter1d(gate, int(0.06 * SR))
music *= gate * (1 - gk); giant *= np.minimum(1, uniform_filter1d(((tt < T["04c_died"] - 0.03) | (tt >= T["06_stay"])).astype(float), int(0.06 * SR)))
DRONE = lp(load(f"{L3}/drone_low/871189.mp3", trim=False), 600); dr = np.zeros(N); i0 = int(T["10_choice"] * SR); nd = N - i0
d = np.tile(DRONE, nd // len(DRONE) + 2)[:nd]; f_ = int(0.5 * SR); d[:f_] *= np.linspace(0, 1, f_); dr[i0:] = d
sD = slice(i0, N); dr *= 10 ** ((meter.integrated_loudness(st(giant[sD])) - 4 - meter.integrated_loudness(st(dr[sD]))) / 20)   # drone grave filtrado ~4 dB bajo el tema
bus = music + giant + dr
mI = meter.integrated_loudness(st(bus[int(11 * SR):])); Bk = int(4 * SR); gains = []
for i0 in range(0, N, Bk):   # 10-11 LU bajo la voz por tramo (bloques de 4 s), en el bus de musica completo
    seg = bus[i0:i0 + Bk]
    try: l = meter.integrated_loudness(st(seg)) if len(seg) > SR and np.abs(seg).max() > 1e-4 else None
    except Exception: l = None
    gains.append(np.clip(mI - l, -8, 6) if l is not None and np.isfinite(l) and l > -60 else 0.0)
cent = np.arange(len(gains)) * Bk + Bk // 2; bus *= 10 ** (np.interp(np.arange(N), cent, gains) / 20)
# v2: ajuste fino por tramo contra la voz (10,5 LU debajo), incluidos los tramos del gigante; sin voz -> mismo nivel que el tramo anterior
SEGB = [11.0, T["03b_turn"], T["04c_died"], T["06_stay"], T["06b_close"], T["06c_speed"], T["08_rule"], T["09b_next"], T["10_choice"], T["10_choice"] + 6.4, DUR]
sg = np.zeros(N); lastm = None
for a_, b_ in zip(SEGB[:-1], SEGB[1:]):
    s_ = slice(int(a_ * SR), int(b_ * SR))
    try: lm = meter.integrated_loudness(st(bus[s_])); lv = meter.integrated_loudness(st(voice[s_]))
    except Exception: continue
    if not np.isfinite(lm) or lm < -60: continue
    tgt = lv - 10.5 if np.isfinite(lv) and lv > -50 else (lastm if lastm is not None else lm); d = np.clip(tgt - lm, -10, 10); sg[s_] = d; lastm = tgt
bus *= 10 ** (uniform_filter1d(sg, int(0.3 * SR)) / 20)
HK = int(11.0 * SR); hook = np.zeros(N)
drone = load(f"{C7}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{C7}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
hook *= np.clip(tt / 0.3, 0, 1) * np.clip((11.0 - tt) / 2.0, 0, 1)
win = slice(int(0.3 * SR), int(8.0 * SR)); vW = meter.integrated_loudness(st(voice[win])); hW = meter.integrated_loudness(st(hook[win])); hook *= 10 ** ((vW - 7 - hW) / 20)
sh_ = lambda x, sec: np.concatenate([np.zeros(int(sec * SR)), x[:N - int(sec * SR)]])
musS = bus + hook; ambR = np.roll(amb, int(1.37 * SR))
mixL = voice + musS + sfx * 0.9 + amb; mixR = voice + sh_(musS, 0.013) * 0.97 + sfx * 0.9 + ambR
mix = np.stack([mixL, mixR], 1)
for _ in range(3):
    lufs = meter.integrated_loudness(mix); gi = 10 ** ((-14 - lufs) / 20); mix *= gi; g = gi if _ == 0 else g * gi
    pk = np.abs(mix).max(); lim = 10 ** (-1.5 / 20)
    if pk > lim:
        k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix).max(1) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)[:, None]
mus_all = musS * g
print('gancho 0-8 s: musica', round(vW - meter.integrated_loudness(st(hook[win])), 1), 'LU bajo la voz')
for a, b in ((0, 10), (10, 14), (14, 19), (24, 26.5), (26.5, 36), (36, 45.5), (45.5, 49.8), (49.8, 59.8), (59.8, DUR)):
    s_ = slice(int(a * SR), int(b * SR)); lm, lv = meter.integrated_loudness(st(mus_all[s_])), meter.integrated_loudness(st((voice * g)[s_])); print(f'  {a}-{b:.1f} s: musica {lm:.1f} LUFS, voz {lv:.1f}, diferencia {lv - lm:.1f} LU')
print('mix LUFS', round(meter.integrated_loudness(mix), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2), 'dur', DUR)
print('tema del gigante:', [(round(a, 2), round(b, 2)) for a, b, _ in GSEG])
sf.write(f"{P}/audio/mix.wav", mix.astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", mus_all), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
meta = open(f"{P}/audio/bgm_giant/meta.txt").read().strip().split("|")
CRED = {"Tema del gigante (pedido del usuario)": {"title": meta[0], "author": meta[1], "url": meta[3], "note": "cover de 'Menacing Nemesis' (Resident Evil 3, Capcom); no CC0: revisar derechos antes de monetizar"},
        "Freesound CC0 (gigante, largo 3)": "366837 Growl and Roar (Jofae), 222523 Deep Monster Growl (uagadugu), 634201 CreatureBreath (dragonboi50120), 673424 Falling body hits the floor (courtneyeck), 735421 BF_slide the wall (maatre), 337829 house rumble",
        "Freesound CC0 (ep15)": "267712 Ripping Off Tape (WeeJee_vdH), 700705 Metal Door Squeaking 8 (MathewHenry), 723528 A freight train violently shunting cars (serøutōnin--deprivəd)",
        "Freesound CC0 (metro ep4/ep9)": "705378 train depart, 650720 subway ride, 838597 brake, 675299 train wheels clicking (craigsmith), 187310 subway doors, 720572 door chime, 104339 glass bang, 834161 glitch, 613353 vhs rewind, 348249 power down, 485407 tick, 452626/637414 fluorescent hum, 479536 room tone, 353125 paper rustle, 271945/587265 stingers, 610534 music (szegvari), 799307 drone (CVLTIV8R), 712798 music box (Antenalosmusic), 320142 cloth, 130939 heartbeat, 855844 whoosh, 752755/623712 lever",
        "Dino Crisis SFX": "Capcom (no monetizado)"}
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

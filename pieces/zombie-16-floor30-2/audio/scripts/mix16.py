# mix16.py -> audio/mix.wav (+ stems), ep16 "Stuck On Floor 30, Part 2". Copia de mix15 (ep15) con los SFX del ep6/ep1 y el tema NUEVO del cazador
# (audio/bgm_giant/nemesis_theme.mp3, regla GUIA §4: reinicia en 0,5 s con entrada 0,2 s en cada aparicion; sin cortes desde la ultima hasta el final).
# Voz (voz/track.wav) + gancho de terror 0-10 s (~7 LU bajo la voz) -> BGM CC0 oscura (610534, 10-11 LU bajo la voz por bloques de 4 s).
# Cada vez que el gigante esta en pantalla suena su tema (pedido del usuario: audio/bgm_giant/, cruce ~0,6-0,8 s) y entra un gruñido/rugido en su
# cuadro de aparicion. Musica fuera en YOU DIED. SFX reales en su cuadro (tiempos de engine/cues.json y de la misma logica de lasttrain3.js).
# Master estereo -14 LUFS, TP <= -1 dBTP. python mix15.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
from scipy.signal import butter, sosfilt
SR = 48000
R = "/Users/alanleiva/claude-proyectos"; P = f"{R}/pieces/zombie-16-floor30-2"; DC = f"{R}/assets/dino-crisis-sfx"
L1 = f"{R}/pieces/zombie-03-station/largo/audio/cand"; L2 = f"{R}/pieces/zombie-03-station/largo2/audio/cand"; L3 = f"{R}/pieces/zombie-03-station/largo3/audio/cand"
C4 = f"{R}/pieces/zombie-04-subway/audio/cand"; C7 = f"{R}/pieces/zombie-07-saferoom/audio/cand"; C9 = f"{R}/pieces/zombie-09-subway2/audio/cand"; C15 = f"{R}/pieces/zombie-15-lasttrain3/audio/cand"; PZ = f"{R}/pieces"
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
# ---------------- fuentes del ep16 ----------------
KNOCK = load(f"{PZ}/zombie-06-floor30/audio/cand/knock/193863.mp3"); DPOUND = load(f"{PZ}/zombie-01-door/audio/cand/door_pound/712809.mp3")
DOPEN = load(f"{PZ}/zombie-03-station/largo/audio/cand/door_open/183532.mp3"); DCREAK = load(f"{PZ}/zombie-03-station/audio/cand/door_creak/553250.mp3")
DRAG = load(f"{PZ}/zombie-06-floor30/audio/cand/furniture_drag/832998.mp3"); LOCK = load(f"{PZ}/zombie-01-door/audio/cand/lock_click/398751.mp3")
CHAIN = load(f"{PZ}/zombie-04-subway/audio/cand/chain_rattle/831768.mp3"); PAPER = load(f"{PZ}/zombie-12-radio/audio/cand/paper/693592.mp3")
PHB = load(f"{PZ}/zombie-04-subway/audio/cand/phone_beep/530482.mp3"); ZATK = load(f"{PZ}/zombie-01-door/audio/cand/zombie_growl_attack/560589.mp3")
TYPEK = hits(load(f"{PZ}/zombie-03-station/largo2/audio/cand/typewriter/380133.mp3", trim=False), 10, 0.12, 0.12, gapf=6) or [DEFAULT[:int(0.1 * SR)]]
CITY = load(f"{PZ}/zombie-06-floor30/audio/cand/city_night/332783.mp3", trim=False); WINDR = load(f"{PZ}/zombie-03-station/largo2/audio/cand/wind_roof/667173.mp3", trim=False)
echo = lambda x, d=0.19, g=0.45, n=4: sum(np.pad(x, (int(k * d * SR), 0))[:len(x) + int(n * d * SR)] * g ** k if False else np.concatenate([np.zeros(int(k * d * SR)), x, np.zeros(int((n - k) * d * SR))]) * g ** k for k in range(n + 1))   # hueco de escalera
sm = lambda x: np.clip(x, 0, 1) ** 2 * (3 - 2 * np.clip(x, 0, 1)); ease = lambda a, b, x: sm((x - a) / (b - a))
def steps_from(ph_fn, a, b, db, x=None):   # un paso cada media zancada (misma fase que floor30b.js): los pies no patinan
    tt = np.arange(a, b, 0.01); ph = np.array([ph_fn(v) for v in tt])
    for i in range(1, len(tt)):
        if np.floor(ph[i] * 2) > np.floor(ph[i - 1] * 2): EV(tt[i], x if x is not None else GSTEP, db, 1.2)
# ---------------- eventos ----------------
EV(0.05, STING, -14, 2.2, 1.0); EV(0.05, lp(WHOOSH, 1800), -16, 1.6, 0.6)                              # 01 grua
EV(T["01b_window"], ALARM, -15)                                                                         # HUD de golpe
# --- cazador 1: el lobby (01c) ---
L0, L1v = np.array([-2.35, 2.55]), np.array([-3.0, 1.05]); LD = np.linalg.norm(L1v - L0)
gL = lambda t: np.clip((t - T["01c_inlobby"] + 0.1) / (T["02_knock"] - 0.5 - T["01c_inlobby"] + 0.1), 0, 1)
EV(T["01c_inlobby"] + 0.03, CBR, -12, 1.8, 0.6, 0.15); EV(W["big"] - 0.05, lp(GROWL, 2000), -8, 1.8, 0.7)
steps_from(lambda t: gL(t) * LD / 1.6, T["01c_inlobby"], T["02_knock"] - 0.5, -5)
EV(T["02_knock"] - 0.75, lp(MDOOR, 2500), -10, 1.0, 0.4)                                              # empuja la puerta STAIRS
EV(W["building"] - 0.05, DEFAULT, -16, 0.3)
# --- rama 1 OPEN ---
EV(T["02_knock"] + 0.05, DEFAULT, -12, 0.35); EV(T["02_knock"] + 0.08, INV, -15)                          # placa 1 OPEN
EV(W["knocked"] - 0.06, KNOCK, -6, 1.2, 0.3)                                                             # tres golpes (solo la hoja)
EV(W["n3012"] - 0.05, DEFAULT, -15, 0.3)
put(sfx, DRAG[:int((T["02c_open"] - T["02b_dresser"] - 0.2) * SR)], T["02b_dresser"] + 0.3, -9, fade=0.3)   # la comoda se arrastra
EV(T["02c_open"] + 0.25, LOCK, -9, 0.6); EV(T["02c_open"] + 0.4, DOPEN, -8, 1.4, 0.4); EV(T["02c_open"] + 0.45, lp(CHAIN, 4000), -16, 0.6, 0.2)
for k in range(10): EV(T["02c_open"] + 1.02 + k * 0.088, TICK, -24, 0.06)                                  # caja de dialogo RE, letra a letra
EV(W["bitten"] - 0.05, STING2, -10, 1.2, 0.5); EV(W["arm"] - 0.05, DEFAULT, -14, 0.3)
EV(T["02e_lunge"] + 0.02, ZATK, -4, 1.6, 0.5); EV(T["02e_lunge"] + 0.05, lp(WHOOSH, 2000), -13, 0.6)         # se abalanza
EV(T["03c_died"], STING2, -8, 2.0, 0.8); EV(T["03c_died"], lp(LAND, 300), -10, 1.5, 0.6)                   # YOU DIED
EV(T["04_rewind"], GLITCH, -9, 0.35, 0.05); EV(T["04_rewind"] + 0.33, VHS, -12, 1.0, 0.2)
# --- rama 2 STAY QUIET ---
EV(T["05_quiet"] + 0.05, DEFAULT, -12, 0.35); EV(T["05_quiet"] + 0.08, INV, -15)
EV(T["05b_note"] + 0.1, lp(STEPS[0], 2500), -18, 0.3); EV(T["05b_note"] + 0.45, lp(STEPS[1], 2500), -19, 0.3)   # pasos del otro lado
EV(T["05b_note"] + 0.15, PAPER, -10, 1.2, 0.4)                                                            # la nota se desliza
EV(T["05c_file"] + 0.02, RUSTLE, -12, 1.0, 0.3); EV(T["05c_file"] + 0.02, INV, -15); EV(W["coming"] - 0.05, DEFAULT, -13, 0.35)
EV(T["06_phone"] + 0.08, lp(CLOTH, 4000), -16, 0.4); EV(W["percent"] - 0.05, PHB, -16, 0.5)
EV(W["airplane"] - 0.02, DEFAULT, -13, 0.3); EV(W["hours"] - 0.05, DEFAULT, -15, 0.3)
for k in range(20): EV(T["06b_save"] + 0.05 + k / 17, TYPEK[k % len(TYPEK)], -11 - (k % 3), 0.12)           # (···) maquina: una tecla por letra
EV(T["06b_save"] + 20 / 17 + 0.1, INV, -14)
# --- cazador 2: el hueco de escalera ---
P_T0, P_RATE = T["07_shaft"], 0.22
for k in range(int((T["08_peep"] - P_T0) * 1.1) + 1):
    t = P_T0 + 0.25 + k / 1.1
    if t < T["07b_feet"] or t > T["07c_carry"]: put(sfx, echo(lp(GSTEP, 800)), t, -9)                        # pasos lejos, con eco del hueco
f0 = T["07b_feet"]; xk = lambda t: 1.45 + (0.25 - 1.45) * ease(f0, T["07c_carry"], t)
steps_from(lambda t: (1.45 - xk(t)) / 1.6, f0, T["07c_carry"], -3)                                           # pies descalzos de cerca
EV(T["07_shaft"] + 0.1, echo(lp(CBR, 1500)), -12, 2.5, 0.8); EV(W["heavy"] - 0.05, lp(GROWL, 1800), -9, 1.4, 0.5)
EV(W["sound"] - 0.05, DEFAULT, -16, 0.3)
# --- cazador 3: la mirilla, el golpe y la decision ---
gH = lambda t: ease(T["08b_fish"] - 0.1, W["reaches"] + 0.35, t)
steps_from(lambda t: (-4.0 + 2.25 * gH(t) + 4.0) / 2.0, T["08b_fish"], W["floor8"] + 0.5, -4)
EV(T["08b_fish"] + 0.05, CBR, -11, 1.8, 0.6, 0.15); EV(W["hunter"] - 0.05, lp(ROAR, 3000), -4, 2.4, 0.9)
P1 = T["08c_pound"] + 0.35
EV(P1, DPOUND, -3, 1.2, 0.4); EV(P1 + 0.01, lp(CHAIN, 5000), -10, 0.6, 0.2); EV(P1 + 0.02, lp(DRAG, 1500), -14, 0.4, 0.2)
TD = T["09_choice"]; CB = 4.3; HITS = [0.0, 1.5, 2.3, 3.1, 3.9, 4.7, 5.5, 6.3]
hitReal = lambda h: 0.0 if h < 0.3 else 1.95 if h < 1.7 else CB + (h - 1.75) / 0.5
for dt in (0.0, 1.95, 4.05): EV(TD + dt, lp(LAND, 300), -8, 2.0, 0.8)                                      # golpes graves en los destellos
for h in HITS:
    x = TD + hitReal(h)
    if x < DUR - 0.3: EV(x, DPOUND, -4, 1.0, 0.4); EV(x + 0.01, lp(CHAIN, 5000), -11, 0.5, 0.2); EV(x + 0.02, lp(DRAG, 1500), -15, 0.35, 0.2); EV(x + 0.01, lp(RUMBLE, 200), -12, 0.8, 0.4)
put(sfx, lp(slow(GROWL, 0.5), 900)[:int(3.8 * SR)], TD + 0.3, -10, fade=0.6, fin=0.4)                       # negativo: gruñido estirado y grave
for h in HITS[2:]:
    x = TD + hitReal(h) + 0.15
    if x < DUR - 1.0: EV(x, lp(slow(CBR, 0.5), 1000), -13, 1.6, 0.6)
EV(W["one9"] - 0.05, DEFAULT, -13, 0.35); EV(W["two9"] - 0.05, DEFAULT, -13, 0.35); EV(TD + CB, INV, -14)
t = TD + 0.5
while t < DUR - 0.4: EV(t, HB, -13 if t < TD + CB else -12); t += 1.5 if t < TD + CB else 1.0              # latido 40 bpm en el negativo, 60 despues
EV(DUR - 0.9, lp(LAND, 400), -5, 0.9, 0.3)
# ---------------- ambiente: calle afuera (viento + ciudad), cuarto adentro, hueco de escalera ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
def zone(pairs):
    k = np.zeros(N)
    for a, b in pairs: k[int(T[a] * SR):int(T[b] * SR)] = 1
    return uniform_filter1d(k, int(0.15 * SR))
extK = zone([("01_crane", "01b_window")]); stK = zone([("07_shaft", "08_peep")]); lobK = zone([("01c_inlobby", "02_knock")]); inK = np.clip(1 - extK - stK - lobK, 0, 1)
amb = (loop(WINDR) * 10 ** (-24 / 20) + loop(CITY) * 10 ** (-26 / 20)) * (extK + 0.35 * lobK) + lp(loop(RUMBLE), 300) * 10 ** (-22 / 20) * stK + loop(ROOM) * 10 ** (-31 / 20) * (inK + lobK) + loop(CITY) * 10 ** (-38 / 20) * inK
pz = np.zeros(N); pz[int(T["06b_save"] * SR):int(T["07_shaft"] * SR)] = 1; amb *= 1 + 1.0 * uniform_filter1d(pz, int(0.12 * SR))
# ---------------- voz y musica ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
meter = pyln.Meter(SR); st = lambda m: m if m.ndim == 2 else np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
def fit(x): return np.tile(x, int(np.ceil(N / len(x))) + 1)[:N] if len(x) < N else x[:N]
mus = fit(load(f"{C4}/mus_horror/610534.mp3", trim=False))
GB = f"{P}/audio/bgm_giant/nemesis_theme.mp3"; GSEG = [(T["01c_inlobby"], T["02_knock"], 0.5), (T["07_shaft"], DUR, 0.5)]   # ep16 v2 (usuario): cuando el cazador sale al final (escalera) el tema ya no se corta: escalera -> mirilla -> golpe -> decision -> ultimo cuadro
giant = np.zeros(N); gk = np.zeros(N); tt = np.arange(N) / SR
for a, b, off in GSEG:   # tema del gigante: entra con el gigante (0,6 s) y sale al cambiar de escena (0,8 s); cada aparicion desde un punto distinto del tema
    seg = load(GB, off, off + (b - a) + 1.0, trim=False); i0 = int(a * SR); n = min(len(seg), N - i0); giant[i0:i0 + n] += seg[:n]
    gk += np.clip((tt - a) / 0.2, 0, 1) * (np.clip((b + 0.4 - tt) / 0.8, 0, 1) if b < DUR - 0.01 else np.clip((DUR - tt) / 0.25, 0, 1)) * (tt >= a)   # el ultimo tramo suena hasta el final (solo 0,25 s de cola)   # entrada 0,2 s: el ataque cae con el cazador
gk = np.clip(gk, 0, 1); giant *= gk
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 10.5 - mL) / 20)
gL = meter.integrated_loudness(st(giant[gk > 0.9])); giant *= 10 ** ((vL - 10.5 - gL) / 20)
gate = np.ones(N)
gate[(tt > T["03c_died"] - 0.03) & (tt < T["05_quiet"])] = 0                                            # musica fuera en YOU DIED y el rebobinado
gate[tt < 9.0] = 0; m = (tt >= 9.0) & (tt < 11.0); gate[m] = (tt[m] - 9.0) / 2.0                       # 0-10 s gancho de terror, cruce al BGM
gate = uniform_filter1d(gate, int(0.06 * SR))
music *= gate * (1 - gk); 
DRONE = lp(load(f"{L3}/drone_low/871189.mp3", trim=False), 600); dr = np.zeros(N); i0 = int(T["09_choice"] * SR); nd = N - i0
d = np.tile(DRONE, nd // len(DRONE) + 2)[:nd]; f_ = int(0.5 * SR); d[:f_] *= np.linspace(0, 1, f_); dr[i0:] = d
sD = slice(i0, N); dr *= 10 ** ((meter.integrated_loudness(st(giant[sD])) - 4 - meter.integrated_loudness(st(dr[sD]))) / 20)   # drone grave filtrado ~4 dB bajo el tema
bus = music + giant + dr; giant_out = giant
mI = meter.integrated_loudness(st(bus[int(11 * SR):])); Bk = int(4 * SR); gains = []
for i0 in range(0, N, Bk):   # 10-11 LU bajo la voz por tramo (bloques de 4 s), en el bus de musica completo
    seg = bus[i0:i0 + Bk]
    try: l = meter.integrated_loudness(st(seg)) if len(seg) > SR and np.abs(seg).max() > 1e-4 else None
    except Exception: l = None
    gains.append(np.clip(mI - l, -8, 6) if l is not None and np.isfinite(l) and l > -60 else 0.0)
cent = np.arange(len(gains)) * Bk + Bk // 2; _g1 = 10 ** (np.interp(np.arange(N), cent, gains) / 20); bus *= _g1; giant_out = giant_out * _g1
# v2: ajuste fino por tramo contra la voz (10,5 LU debajo), incluidos los tramos del gigante; sin voz -> mismo nivel que el tramo anterior
SEGB = [11.0, T["02b_dresser"], T["03c_died"], T["05_quiet"], T["06_phone"], T["06b_save"], T["07_shaft"], T["08_peep"], T["08b_fish"], T["09_choice"], T["09_choice"] + 4.3, DUR]
sg = np.zeros(N); lastm = None
for a_, b_ in zip(SEGB[:-1], SEGB[1:]):
    s_ = slice(int(a_ * SR), int(b_ * SR))
    try: lm = meter.integrated_loudness(st(bus[s_])); lv = meter.integrated_loudness(st(voice[s_]))
    except Exception: continue
    if not np.isfinite(lm) or lm < -60: continue
    tgt = lv - 10.5 if np.isfinite(lv) and lv > -50 else (lastm if lastm is not None else lm); d = np.clip(tgt - lm, -10, 10); sg[s_] = d; lastm = tgt
_g2 = 10 ** (uniform_filter1d(sg, int(0.3 * SR)) / 20); bus *= _g2; giant_out = giant_out * _g2
HK = int(11.0 * SR); hook = np.zeros(N)
drone = load(f"{C7}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{C7}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
hook *= np.clip(tt / 0.3, 0, 1) * np.clip((11.0 - tt) / 2.0, 0, 1) * (1 - gk)
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
for a, b in ((0, 5.1), (5.1, 7.2), (7.2, 18.2), (21.5, 29.5), (29.5, 35.8), (35.8, 42.0), (44.4, 47.9), (47.9, 52.2), (52.2, DUR)):
    s_ = slice(int(a * SR), int(b * SR)); lm, lv = meter.integrated_loudness(st(mus_all[s_])), meter.integrated_loudness(st((voice * g)[s_])); print(f'  {a}-{b:.1f} s: musica {lm:.1f} LUFS, voz {lv:.1f}, diferencia {lv - lm:.1f} LU')
print('mix LUFS', round(meter.integrated_loudness(mix), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2), 'dur', DUR)
print('tema del gigante:', [(round(a, 2), round(b, 2)) for a, b, _ in GSEG])
sf.write(f"{P}/audio/mix.wav", mix.astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", mus_all), ("giant", giant_out * g), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
CRED = json.load(open(f"{P}/audio/CREDITS.json", encoding="utf8"))
CRED["bgm_giant"]["status"] = "file provided by the user: audio/bgm_giant/nemesis_theme.mp3 (used in mix16)"; CRED["bgm_giant"]["note"] = "Capcom soundtrack, not CC0: check rights before monetizing"
CRED["Freesound CC0 (gigante, largo 3)"] = "366837 Growl and Roar (Jofae), 222523 Deep Monster Growl (uagadugu), 634201 CreatureBreath (dragonboi50120), 673424 Falling body hits the floor (courtneyeck), 735421 BF_slide the wall (maatre), 337829 house rumble, 871189 Textured Low Drone (kkenny101)"
CRED["Freesound CC0 (ep16, kits de ep1/ep3/ep4/ep6/ep12)"] = "193863 knock, 712809 door pound, 183532 door open, 832998 furniture drag, 398751 lock click, 831768 chain rattle, 693592 paper, 530482 phone beep, 560589 zombie growl attack, 380133 typewriter, 332783 city night, 667173 wind roof, 610534 music (szegvari), 799307 drone (CVLTIV8R), 712798 music box (Antenalosmusic), 271945/587265 stingers, 855844 whoosh, 130939 heartbeat, 834161 glitch, 613353 vhs rewind, 485407 tick, 479536 room tone, 353125 paper rustle, 320142 cloth, 700705 metal door"
CRED["Dino Crisis SFX"] = "Capcom (no monetizado)"
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

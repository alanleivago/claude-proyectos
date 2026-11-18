# mix_largo.py (LARGO 3: "AVA: DAY 3 — The Way Out") -> audio/mix.wav + stems. Base: ../../largo2/audio/mix_largo.py.
# voz (voz/track.wav) + musica CC0 por capitulo medida POR TRAMO (~10.5 LU bajo la voz tras el ducking) + camas de ambiente por
# capitulo/plano + SFX anclados a palabras y a inicios de plano + teclas de las tarjetas (film.js) + plan de sonido de la mansion
# (../plan_sonido.md: silencio tras el temblor, stinger en "explodes", silencio ~1 s al aterrizar, drone, latido en "hunting",
# persecucion de "two seconds" a "Decide!", decision: drone grave filtrado + golpes en los destellos + teclas + cursor).
# Fuentes: picks de la Parte 1/2 + Freesound CC0 nuevos (audio/cand/*, elegidos con earshot rank; audio/picks_largo3.json).
# Master estereo -14 LUFS, TP <= -1 dBTP.   python mix_largo.py
import json, sys, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
from scipy.signal import butter, sosfilt
SR = 48000
L3 = r"/Users/alanleiva/claude-proyectos/pieces/zombie-03-station/largo3"; L2 = r"/Users/alanleiva/claude-proyectos/pieces/zombie-03-station/largo2"; L1 = r"/Users/alanleiva/claude-proyectos/pieces/zombie-03-station/largo"; P = r"/Users/alanleiva/claude-proyectos/pieces/zombie-03-station"
DC = r"/Users/alanleiva/claude-proyectos/assets/dino-crisis-sfx"; ZS = r"/Users/alanleiva/claude-proyectos/assets/zombie-sfx-yt/seg"; KIT = r"/Users/alanleiva/claude-proyectos/sound-layer/kit"; NC = f"{L3}/audio/cand"
sys.path.insert(0, f"{L3}/voz"); import takes as TK
CUT = json.load(open(f"{L3}/review/cuts.json")); T0 = dict(CUT["cuts"]); DUR = CUT["dur"]; N = int(DUR * SR)
CUTS = CUT["cuts"]; END = {k: (CUTS[i + 1][1] if i + 1 < len(CUTS) else DUR) for i, (k, _) in enumerate(CUTS)}
TL = json.load(open(f"{L3}/engine/timeline.json", encoding="utf-8"))
_c = {}
def load(path, a=None, b=None, trim=True):
    k = (path, a, b, trim)
    if k not in _c:
        cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
        x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
        if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]
        f = min(len(x) // 2, int(0.004 * SR)); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        _c[k] = x / (np.abs(x).max() + 1e-9)
    return _c[k]
def lp(x, hz): return sosfilt(butter(2, hz, 'low', fs=SR, output='sos'), x)
def hp(x, hz): return sosfilt(butter(2, hz, 'high', fs=SR, output='sos'), x)
def slow(x, k=0.5):   # camara lenta: estira x1/k y baja el tono (remuestreo)
    n = int(len(x) / k); return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
def put(buf, x, t, db, maxlen=None, fade_out=0.05):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]
    f = min(len(x), int(fade_out * SR)); x[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)

TIX = {tid: i + 1 for i, tid in enumerate(TL["takes"])}
def take(tid):
    ws = [w for w in TL["words"] if w[3] == TIX[tid]]; return ws[0][1], ws[-1][2]
def word(tid, pre=None, k=0):
    ws = [w for w in TL["words"] if w[3] == TIX[tid]]
    if pre is None: return ws[k][1]
    return next(w[1] for w in ws if w[0].startswith(pre))

# ---------- fuentes ----------
PK = {k: f"{P}/audio/{v}" for k, v in json.load(open(f"{P}/audio/picks.json")).items()}
S = {k: load(v) for k, v in PK.items() if k != "rain"}
LP = json.load(open(f"{L1}/audio/picks_largo.json", encoding="utf-8")); F = {k: load(v["file"] if ":" in v["file"] else f"{L1}/audio/{v['file']}") for k, v in LP.items()}
NEWP = json.load(open(f"{L2}/audio/picks_largo2.json", encoding="utf-8")); NW = {k: load(f"{L2}/audio/cand/{v['file']}", *(v.get('ab') or (None, None)), trim=v.get('trim', True)) for k, v in NEWP.items()}
P3 = json.load(open(f"{L3}/audio/picks_largo3.json", encoding="utf-8")); N3 = {k: load(f"{NC}/{v}") for k, v in P3.items()}
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)
WALK = [load(f"{DC}/ch/walk_run_indoors.wav", a, a + 0.32) for a in (2.305, 2.805, 3.305, 3.81, 5.21, 5.715)]
STONE = [lp(w, 2500) for w in WALK]
ZGROAN = load(f"{ZS}/z05_103.1.wav"); ZCROWD = [load(f"{ZS}/{z}") for z in ("z02_89.0.wav", "z05_103.1.wav", "z09_115.7.wav", "z13_127.6.wav", "z17_145.8.wav")]
WHOOSH = load(f"{KIT}/whoosh/fs-109747-hit-with-swooshed-material-a-2.wav"); TICK = load(f"{KIT}/tick/fs-185611-metal-tick-1-1.wav"); BOOM = load(f"{KIT}/boom/fs-539968-deep-boom-3.wav"); CHIME = load(f"{KIT}/chime/fs-127149-ding-wav-1.wav")
LEAF = [N3['leaves_steps'][int(a * SR):int((a + 0.4) * SR)] for a in (0.2, 0.75, 1.3, 1.85, 2.4, 2.95)]
GSTEP = lp(N3['impact_soft'], 900)
RUMBLE = lp(S['thunder'], 200); PIPE = lp(N3['pipe'], 3500)

EV = []
def ev(t, x, db, ml=None): EV.append((t, x, db, ml))
def steps(t0, t1, dt, pool, db):
    k = 0; t = t0
    while t < t1: ev(t, pool[k % len(pool)], db + (k % 3 - 1) * 1.5); k += 1; t += dt
for t, name, _ in json.load(open(f"{L3}/audio/sfx_events.json")):   # teclas de las tarjetas de hora
    ev(t, KEY, {'type_key': -12, 'type_key_soft': -19, 'type_return': -9}[name])
SCREENS = [s[0] for s in json.load(open(f"{L3}/engine/shots.json", encoding="utf-8")) if s[1] == 'p3screens']
for sid in SCREENS: ev(T0[sid] + 0.1, INV, -11)
# ---- gancho / 6:10 PM
ev(T0['03_lock'] + 0.4, S['padlock'], -12, 0.8)
ev(T0['07_lights_on'] + 0.3, S['switch'], -12, 0.3); ev(T0['07_lights_on'] + 0.5, F['bulb_buzz'], -22, 2.0)
for i in range(6): ev(T0['09_timer'] + 0.2 + i * 0.5, S['clock'], -24, 0.2)
ev(word('l5'), DEFAULT, -15, 0.5)
tsh = word('l7', 'shut'); ev(tsh + 0.1, S['switch'], -6, 0.3); ev(tsh + 0.2, F['power_down'], -10, 1.6)
ev(word('l7', 'leave') + 0.3, F['door_open'], -16, 1.4)
ev(T0['15_dark'] + 0.1, F['power_down'], -14, 1.6)
# ---- 7:00 PM / 8:30 PM
steps(T0['17_stairs'] + 0.3, END['17_stairs'] - 0.2, 0.6, STONE, -16)
ev(T0['25b_desk_map'] + 0.4, F['paper_rustle'], -16, 0.8)
ev(word('p6', 'water'), F['wrapper'], -18, 0.6); ev(word('p6', 'beans'), F['mug'], -18, 0.6); ev(word('p6', 'flashlight'), S['flashlight'], -14, 0.3); ev(word('p6', 'fifteen'), F['keys_jingle'], -20, 0.5)
steps(T0['31_cells_pass'] + 0.3, END['31_cells_pass'] - 0.2, 0.62, WALK, -16)
# ---- 9:15 PM tunel
steps(T0['33_tunnel_walk'] + 0.2, T0['card_c2200'] - 3.0, 0.6, STONE, -18)
ev(word('u9', 'grate') + 0.2, N3['creak'], -12, 1.6); ev(word('u9', 'grate') + 1.5, F['metal_clang'], -16, 0.6)
# ---- 10:00 PM alcantarilla
ev(T0['39_sewer'] + 0.2, F['metal_clang'], -18, 0.5)
for i in range(4): ev(T0['45_six'] + 0.5 + i * 1.3, N3['splash'], -16, 0.8)
ev(T0['47_ribbon_stop'] + 0.6, F['dog_whine'], -18, 1.0)
for k in range(5): ev(T0['48_splash'] + 0.2 + k * 0.7, N3['splash'], -14 - k, 1.2)
for k in range(6): ev(T0['50_horde_ladder'] + 0.3 + k * 0.5, N3['splash'], -12, 1.0)
ev(T0['50_horde_ladder'] + 0.4, ZCROWD[0], -14, 2.0); ev(T0['51_horde_wade'] + 0.2, ZCROWD[3], -13, 2.0); ev(T0['51_horde_wade'] + 1.6, ZCROWD[2], -14, 2.0)
# ---- 10:45 PM la compuerta
tpl = word('g7', 'pulls'); ev(tpl + 0.05, N3['lever'], -8, 1.2); ev(word('g7', 'drops') - 0.05, N3['gate'], -9, 2.5); ev(word('g7', 'drops'), BOOM, -12, 1.5)
steps(T0['59_climb'] + 0.2, T0['59_climb'] + 2.6, 0.45, [hp(w, 400) for w in WALK], -18)
tb0, tb1 = word('g9', 'banging'), word('o1', 'stops')
k = 0; t = tb0
while t < tb1:
    fade = 0 if t < T0['card_c2330'] else -14 * (t - T0['card_c2330']) / max(0.1, tb1 - T0['card_c2330'])
    ev(t, PIPE, -8 + fade + (k % 2) * -2 + (3 if t > word('g9', 'louder') else 0) * (t < T0['card_c2330']), 0.5); k += 1; t += 0.55 if t < word('g9', 'louder') else 0.4
for z, dt in ((ZCROWD[1], 0.5), (ZCROWD[4], 2.2)): ev(T0['60_bang'] + dt, z, -14, 2.0)
ev(T0['61_away'] + 0.3, ZCROWD[2], -14, 2.0)
steps(T0['66_run'] + 0.1, END['66_run'], 0.32, [hp(w, 300) for w in WALK], -12)
for i in range(6): ev(T0['66_run'] + 0.2 + i * 0.28, N3['splash'], -20, 0.4)
# ---- 11:30 PM / 12:30 AM
steps(T0['69b_follow'] + 0.2, END['72_think_walk'], 0.62, STONE, -18)
ev(T0['73_saveroom'] + 0.1, F['door_open'], -12, 1.4)
for tk, w, s in (('v5', 'day', 'DAY 3'), ('v6', 0, '12:30 AM'), ('v6', 'sewers', 'SEWERS')):   # hoja de guardado: una tecla por letra
    t0 = word(tk, w) if w else word(tk)
    for i, ch in enumerate(s):
        if ch != ' ': ev(t0 - 0.15 + (i + 1) / 24, KEY, -12)
# ---- 1:40 AM / 2:30 AM bosque
steps(T0['78_outfall'] + 0.3, END['82_think_move'], 0.6, LEAF, -16)
steps(T0['85_quiet'] + 0.1, END['86_crows'], 0.6, LEAF, -14)
ev(word('w4', 'growls'), F['dog_growl'], -12, 1.6); ev(T0['89_shuffle'] + 0.3, lp(ZGROAN, 1400), -16, 1.6); ev(T0['91_pass'] + 0.8, lp(ZGROAN, 1600), -14, 1.6)
steps(T0['89_shuffle'] + 0.2, END['91_pass'], 0.9, [lp(x, 1500) for x in LEAF], -16)
# ---- 3:00 AM mansion
ev(T0['97_gates'] + 0.3, S['door_creak'], -16, 2.0); steps(T0['99_steps'] + 0.2, END['99_steps'], 0.6, STONE, -15)
ev(word('x7', 'go'), S['door_creak'], -10, 2.0)
tcl = word('y1', 'closes'); ev(tcl + 0.2, F['door_close'], -4, 1.2); ev(tcl + 0.25, BOOM, -10, 2.2)
ev(word('y4', 'light'), F['wrapper'], -20, 0.5); ev(word('y4', 'light') + 0.5, WHOOSH, -24, 0.6)
# ---- 4:00 AM
ev(word('z1', 'drops'), BOOM, -12, 1.4); ev(word('z1', 'step'), GSTEP, -6, 1.0); ev(word('z2', 'another'), GSTEP, -5, 1.0)
steps(T0['110_gun_stairs'] + 0.2, END['110_gun_stairs'], 0.55, [lp(w, 2800) for w in WALK], -15)
steps(T0['111_hallway'] + 0.2, END['111_hallway'], 0.62, WALK, -17)
ev(T0['114_head_turn'] + 0.5, lp(N3['creak'], 1800), -14, 2.5)
ev(word('z9', 'lock'), F['key_lock'], -10, 0.6)
# ---- 4:40 AM radio
ev(T0['118_attic'] + 0.3, N3['creak'], -18, 1.4)
for i in range(5): ev(T0['119b_dial'] + 0.3 + i * 0.35, F['dial_click'], -16, 0.2)
ev(word('r5', 'mic'), N3['mic'], -10, 0.4); ev(T0['126_crackle'] + 0.1, N3['mic'], -12, 0.4)
# ---- 5:40 AM: plan de sonido de la mansion
tk1 = take('k1')[0]; ev(tk1, RUMBLE, -2, 3.0); ev(tk1 + 0.2, F['glass_debris'], -18, 1.5)
tex = word('k3', 'explodes'); ev(tex - 0.02, N3['glass'], -4, 3.0); ev(tex, N3['wood'], -7, 2.0); ev(tex, BOOM, -9, 2.5)
from importlib import import_module
JUMP = word('k4', 'hits') - 1.25; LAND = JUMP + 1.15
ev(JUMP, WHOOSH, -12, 0.8); ev(LAND, N3['land'], -3, 2.0); ev(LAND, BOOM, -8, 2.5); ev(LAND + 0.1, F['glass_debris'], -14, 1.2)
# v3: el gigante RUGE (el usuario lo pidio): rugido gutural grave al caer y levantarse, gruñido tras "It roars", respiracion/gruñido
# grave al mirar arriba y en cada subida (Freesound CC0: 366837 Jofae "Growl and Roar", 222523 uagadugu "Deep Monster Growl",
# 634201 dragonboi50120 "CreatureBreath"; elegidos con earshot rank/describe)
ROAR = lp(slow(N3['roar'], 0.9), 3500); GROWL = lp(slow(N3['growl'], 0.9), 2200); CBR = lp(N3['cbreath'], 1500)
ev(LAND + 0.3, ROAR, -1, 3.6); ev(word('k4', 'stands'), CBR, -11, 2.6)
ev(word('k8', 'roars') + 0.5, GROWL, -9, 1.3)
ev(T0['139_looks_up'] + 0.25, CBR, -9, 2.5)
for i, dt in enumerate((5.2, 6.4, 7.6, 8.8)): ev(LAND + dt, GSTEP, -8 - i, 1.0)
steps(T0['134_feet'] + 0.2, END['134_feet'], 1.2, [GSTEP], -6)
ev(T0['135_hands'] + 0.4, F['cloth'], -16, 0.5); ev(T0['138b_tilt'] + 0.6, lp(N3['creak'], 900), -16, 0.8)
tq7 = word('q7', 'first'); ev(tq7, GSTEP, -3, 1.2); ev(word('q7', 'groans'), N3['creak'], -6, 2.5)
ev(tq7 - 0.35, GROWL, -12, 1.6); ev(T0['149_giant'] + 0.4, CBR, -12, 2.5)
steps(T0['149_giant'] + 0.3, END['149_giant'], 1.4, [GSTEP], -8)
for k_ in range(4): ev(T0['141_bark'] + 0.2 + k_ * 0.9, F['dog_growl'], -10, 0.9)
# decision: golpes en los destellos, teclas cuando salen las opciones, cursor en "option" / "two", pasos estirados
t150 = T0['150_choice']
for dt in (0.1, 3.3, 6.2): ev(t150 + dt, BOOM, -16, 2.0)
for i in range(18): ev(t150 + 3.5 + i * 0.07, KEY, -16)
ev(word('e4', 'option'), DEFAULT, -14, 0.5); ev(word('e4', 'two'), DEFAULT, -14, 0.5)
for i, dt in enumerate((7.0, 10.0, 13.0, 16.0)): ev(t150 + dt, slow(GSTEP, 0.5), -10, 2.0)
ev(t150 + 6.6, slow(CBR, 0.5), -13, 4.5)   # v3: respiracion del gigante en camara lenta

sfx = np.zeros(N)
for t, x, db, ml in EV: put(sfx, x, t, db, maxlen=ml)
g0 = t150 - 0.3; GR = lp(F['dog_growl'], 2500); gt = g0   # Ribbon grune bajo el menu hasta el final
while gt < DUR - 0.3:
    seg = GR[:int(min(len(GR) / SR, DUR - gt) * SR)].copy(); f = int(0.25 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    put(sfx, seg, gt, -19, fade_out=0.25); gt += len(GR) / SR - 0.35
# latido desde "hunting" hasta el final (60 bpm; 40 bpm durante el negativo)
HB = lp(F['heartbeat'], 1200)[:int(0.9 * SR)]; t = word('k11', 'hunting')
while t < DUR - 0.5:
    put(sfx, HB, t, -14 if t < t150 else -12); t += 1.5 if (t150 <= t < t150 + 6.4) else 1.0

# ---------- camas de ambiente ----------
def bed(x, n=N):
    x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.1; xf = int(1.5 * SR); out = x.copy()
    while len(out) < n: a = out[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf); out = np.concatenate([out[:-xf], a, x[xf:]])
    return out[:n]
BEDS = {"hum": bed(NW['room_hum']), "gen": bed(F['generator']), "drip": bed(NW['tunnel_water']), "sewer": bed(N3['sewer']), "forest": bed(N3['forest']),
        "fire": bed(N3['fire']), "room": bed(F['room_tone']), "static": bed(N3['static']), "heli": bed(NW['heli']), "horde": bed(np.concatenate([lp(z, 1800) for z in ZCROWD * 3])),
        "fluor": bed(S['fluor'])}
CH_OF = {}
for ch, hour, t in TL["chapters"]: CH_OF[t] = ch
chs = sorted(CH_OF.items())
def chap(t): c = chs[0][1]
def chap_at(t):
    c = chs[0][1]
    for tt, ch in chs:
        if t >= tt - 2.0: c = ch
    return c
PROF = {"hook": {"hum": -36, "fluor": -42}, "c1810": {"hum": -36}, "c1900": {"drip": -32, "hum": -42}, "c2030": {"hum": -36, "drip": -44}, "c2115": {"drip": -30},
        "c2200": {"sewer": -26, "drip": -38}, "c2240": {"sewer": -26, "horde": -34}, "c2245": {"sewer": -26, "horde": -30}, "c2330": {"sewer": -30, "drip": -36}, "c0030": {"hum": -34},
        "c0140": {"forest": -26}, "c0230": {"forest": -28}, "c0300": {"forest": -28}, "c0315": {"room": -36}, "c0400": {"room": -34}, "c0440": {"room": -36}, "c0530": {"room": -36},
        "c0540": {"room": -38}, "c0542": {"room": -38}, "final": {"room": -40}}
GAIN = {k: np.full(N, -90.0) for k in BEDS}
for sid, t in CUTS:
    p = PROF.get(chap_at(t + 0.5), {})
    if sid in SCREENS: p = {k: v - 5 for k, v in p.items()}
    for k, v in p.items(): GAIN[k][int(t * SR):int(END[sid] * SR)] = v
GAIN['gen'][:int((tsh + 0.3) * SR)] = -90; GAIN['gen'][int(T0['08_motorpool'] * SR):int((tsh + 0.3) * SR)] = -24
GAIN['fire'][int(word('y4', 'light') * SR):int(T0['card_c0440'] * SR)] = -28
GAIN['static'][int(word('r8') * SR):int(T0['card_c0530'] * SR)] = -26; GAIN['static'][int(T0['126_crackle'] * SR):int(END['126_crackle'] * SR)] = -30
hel = np.full(N, -90.0); h0, h1 = word('d1', 'hear'), T0['card_c0540']; tt = np.arange(int(h0 * SR), int(h1 * SR)) / SR
hel[int(h0 * SR):int(h1 * SR)] = -40 + 12 * np.clip((tt - h0) / 8.0, 0, 1); GAIN['heli'] = hel
# pausas (···): ambiente +4 dB
PAUSES = [take(x[0])[1] for x in TK.T if x[5] == TK.PAUSE and x[2] != 'breath']
for tp in PAUSES:
    a, b = int(tp * SR), int((tp + TK.PAUSE) * SR)
    for k_ in GAIN: GAIN[k_][a:b] = np.where(GAIN[k_][a:b] > -80, GAIN[k_][a:b] + 4, GAIN[k_][a:b])
    c = chap_at(tp)
    if c in ("c1900", "c2115", "c2330"): put(sfx, F['drip'], tp + 0.4, -16, 0.6); put(sfx, F['drip'], tp + 1.1, -20, 0.6)
amb = np.zeros(N)
for k_, x in BEDS.items():
    g = uniform_filter1d(GAIN[k_], int(0.5 * SR)); amb += x * 10 ** (g / 20)

# ---------- voz ----------
voice = load(f"{L3}/voz/track.wav", trim=False)
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N] * 0.9

# ---------- musica por capitulo (CC0 de las Partes 1-2) + persecucion + drone de la decision ----------
MD, MT, MR, M0 = f"{L1}/audio/cand/mus_dark", f"{L1}/audio/cand/mus_tension", f"{L1}/audio/cand/mus_drone", f"{P}/audio/cand/mus_thriller"
TRK = {"345069": f"{M0}/345069.mp3", "164272": f"{MD}/164272.mp3", "350953": f"{MT}/350953.mp3", "492956": f"{MD}/492956.mp3", "559388": f"{MD}/559388.mp3",
       "640612": f"{MR}/640612.mp3", "631933": f"{MR}/631933.mp3", "865550": f"{MR}/865550.mp3", "686659": f"{MT}/686659.mp3", "drone": f"{NC}/{P3['drone']}"}
C = lambda ch: T0['card_' + ch]
CUES = [(0, "345069", 0), (C("c1810"), "350953", 0), (C("c1900"), "640612", 0), (C("c2030"), "164272", 0), (C("c2115"), "631933", 0), (C("c2200"), "865550", 0),
        (C("c2240"), "686659", 0), (C("c2245"), "492956", 0), (C("c2330"), "631933", 40), (C("c0030"), "559388", 0), (C("c0140"), "640612", 40), (C("c0230"), "865550", 40),
        (C("c0300"), "164272", 60), (C("c0315"), "559388", 50), (C("c0400"), "492956", 40), (C("c0440"), "640612", 80), (C("c0530"), "350953", 30),
        (C("c0540"), "drone", 0), (C("c0542"), "686659", 30), (t150, "drone", 20)]
def loop_to(x, n, xf=int(2.0 * SR)):
    out = x.copy()
    while len(out) < n: a = out[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf); out = np.concatenate([out[:-xf], a, x[xf:]])
    return out[:n]
mtr = pyln.Meter(SR); XF = int(1.0 * SR)
env = np.zeros(N); H = int(0.02 * SR)
for i in range(0, N - H, H): env[i:i + H] = np.sqrt(np.mean(voice[i:i + H] ** 2))
spk = uniform_filter1d((env > 0.02).astype(float), int(0.25 * SR))
think = np.zeros(N)
for x in TK.T:
    if x[2] in ("think", "shake"): a, b = take(x[0]); think[int(a * SR):int(b * SR)] = 1
think = uniform_filter1d(think, int(0.4 * SR))
music = np.zeros(N); report = []
for i, (t, tid, off) in enumerate(CUES):
    t1 = CUES[i + 1][0] if i + 1 < len(CUES) else DUR
    a, b = int(t * SR), min(N, int(t1 * SR) + XF)
    x = load(TRK[tid], trim=False)[int(off * SR):]; seg = loop_to(x, b - a)
    if tid == "drone": seg = lp(seg, 600 if t == t150 else 1200)
    if i > 0: seg[:XF] *= np.linspace(0, 1, XF)
    if b < N: seg[-XF:] *= np.linspace(1, 0, XF)
    sel = spk[a:min(b, N)] > 0.5
    target = 9.0
    if sel.sum() > SR:
        dv = mtr.integrated_loudness(voice[a:b][sel]); dm = mtr.integrated_loudness(seg[:len(sel)][sel]); seg *= 10 ** ((dv - dm - target) / 20)
    music[a:b] += seg
duck = 10 ** ((-1.5 * np.clip(spk * 1.5, 0, 1) - 4.0 * think) / 20)
hook = np.ones(N); hook[:int(10 * SR)] = 10 ** (3.5 / 20); hook = uniform_filter1d(hook, int(1.0 * SR))
g = np.ones(N); fo = int(2.0 * SR); g[-fo:] *= np.linspace(1, 0, fo)
# silencios del plan: tras el temblor (···), 1 s tras el aterrizaje, y corte seco de la persecucion en "Decide!"
cut = np.ones(N)
pk1 = take('k1')[1]; cut[int(pk1 * SR):int((pk1 + TK.PAUSE) * SR)] = 0
cut[int((tex - 0.05) * SR):int(LAND * SR)] = 0.0; cut[int(LAND * SR):int((LAND + 1.1) * SR)] = 0
td = word('q9', 'decide'); cut[int((td + 0.6) * SR):int(t150 * SR)] = 0
cut = uniform_filter1d(cut, int(0.12 * SR))
music = music * duck * hook * g * cut
for i, (t, tid, off) in enumerate(CUES):
    t1 = CUES[i + 1][0] if i + 1 < len(CUES) else DUR; a, b = int(t * SR), int(t1 * SR); sel = spk[a:b] > 0.5
    if sel.sum() > SR: report.append((round(t, 1), tid, round(mtr.integrated_loudness(voice[a:b][sel]) - mtr.integrated_loudness(music[a:b][sel]), 1)))
print("musica bajo la voz por tramo (LU):", report)

# ---------- master ----------
mix = voice + music + sfx * 0.9 + amb
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
for _ in range(3):
    lufs = meter.integrated_loudness(st(mix)); mix *= 10 ** ((-14 - lufs) / 20)
    lim = 10 ** (-2.5 / 20)
    if np.abs(mix).max() > lim:
        k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
print("LUFS", round(meter.integrated_loudness(st(mix)), 2), "peak dBFS", round(20 * np.log10(np.abs(mix).max()), 2), "dur", round(DUR, 2))
sf.write(f"{L3}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice), ("music", music), ("sfx", sfx * 0.9), ("amb", amb)): sf.write(f"{L3}/audio/stem_{name}.wav", x.astype(np.float32), SR)

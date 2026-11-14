# mix_largo.py (LARGO 2: "AVA: DAY 2 — The Police Station Part 2") -> audio/mix.wav + stems. Base: ../largo/audio/mix_largo.py.
# voz (voz/track.wav) + musica CC0 por capitulo (las mismas pistas de la Parte 1, medida POR TRAMO a ~10.5 LU bajo la voz,
# gancho 0-10 s mas presente, ducking extra en [PIENSA]) + camas de ambiente por plano (lluvia de noche, ciudad/horda lejana de
# dia, generador, cinta, zumbido, goteo, agua del tunel, viento + pajaros en la azotea) con acento en cada pausa (···)
# (golpes lejanos en el vidrio, gotas, rafaga) + SFX por plano anclados a palabras (tabla EVENTS) + teclas de las tarjetas
# (audio/sfx_events.json <- engine/sfx_dump.mjs). Fuentes: picks de la Parte 1 + Freesound CC0 nuevos (audio/cand/*, elegidos
# con earshot rank; audio/picks_largo2.json). Master estereo -14 LUFS, TP <= -1 dBTP.   python mix_largo.py
import json, sys, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
from scipy.signal import butter, sosfilt
SR = 48000
L2 = r"F:/Claude Proyectos/pieces/zombie-03-station/largo2"; L1 = r"F:/Claude Proyectos/pieces/zombie-03-station/largo"; P = r"F:/Claude Proyectos/pieces/zombie-03-station"
DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"; ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"
C2 = r"F:/Claude Proyectos/pieces/zombie-02-window/audio/cand"; KIT = r"F:/Claude Proyectos/sound-layer/kit"; NC = f"{L2}/audio/cand"
sys.path.insert(0, f"{L2}/voz"); import takes as TK
CUT = json.load(open(f"{L2}/review/cuts.json")); T0 = dict(CUT["cuts"]); DUR = CUT["dur"]; N = int(DUR * SR)
CUTS = CUT["cuts"]; END = {k: (CUTS[i + 1][1] if i + 1 < len(CUTS) else DUR) for i, (k, _) in enumerate(CUTS)}
TL = json.load(open(f"{L2}/engine/timeline.json", encoding="utf-8"))
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
def put(buf, x, t, db, maxlen=None, fade_out=0.05):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]
    f = min(len(x), int(fade_out * SR)); x[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)

# ---------- tiempos de tomas y palabras ----------
TIX = {tid: i + 1 for i, tid in enumerate(TL["takes"])}
def take(tid):
    ws = [w for w in TL["words"] if w[3] == TIX[tid]]; return ws[0][1], ws[-1][2]
def word(tid, pre=None, k=0):
    ws = [w for w in TL["words"] if w[3] == TIX[tid]]
    if pre is None: return ws[k][1]
    return next(w[1] for w in ws if w[0].startswith(pre))
VOICE_OF = {x[0]: x[2] for x in TK.T}

# ---------- fuentes ----------
PK = {k: f"{P}/audio/{v}" for k, v in json.load(open(f"{P}/audio/picks.json")).items()}
S = {k: load(v) for k, v in PK.items() if k != "rain"}
LP = json.load(open(f"{L1}/audio/picks_largo.json", encoding="utf-8")); F = {k: load(v["file"] if ":" in v["file"] else f"{L1}/audio/{v['file']}") for k, v in LP.items()}
NEWP = json.load(open(f"{L2}/audio/picks_largo2.json", encoding="utf-8")); NW = {k: load(f"{NC}/{v['file']}", *(v.get('ab') or (None, None)), trim=v.get('trim', True)) for k, v in NEWP.items()}
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); UNLOCK = load(f"{DC}/ch/door_and_gate_unlock.wav", 2.18, 3.0)
SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2); KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)
WALK = [load(f"{DC}/ch/walk_run_indoors.wav", a, a + 0.32) for a in (2.305, 2.805, 3.305, 3.81, 5.21, 5.715)]
ZMOAN = load(f"{ZS}/z08_110.4.wav"); ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
ZCROWD = [load(f"{ZS}/{z}") for z in ("z02_89.0.wav", "z05_103.1.wav", "z09_115.7.wav", "z13_127.6.wav", "z17_145.8.wav")]
BARS = load(f"{C2}/metal_bar_clank/835169.mp3"); THUNK = load(f"{C2}/wood_thunk/171306.mp3"); DRAG = load(f"{C2}/couch_drag/406699.mp3")
WHOOSH = load(f"{KIT}/whoosh/fs-109747-hit-with-swooshed-material-a-2.wav"); CHIME = load(f"{KIT}/chime/fs-127149-ding-wav-1.wav")
TICK = load(f"{KIT}/tick/fs-185611-metal-tick-1-1.wav"); THUMP = load(f"{KIT}/thump/fs-133282-thump-on-carpet-2.wav"); BOOM = load(f"{KIT}/boom/fs-539968-deep-boom-3.wav")
KNOCK_FAR = lp(S['glass_knock'], 1400)
STONE = [lp(w, 2500) for w in WALK]   # pasos sobre piedra (mas apagados)
GRAV = [NW['steps_gravel'][int(a * SR):int((a + 0.35) * SR)] for a in (0.0, 0.5, 1.0, 1.5, 2.0, 2.5)] if 'steps_gravel' in NW else WALK

# ---------- eventos: (tiempo, sonido, dB, maxlen) ----------
EV = []
def ev(t, x, db, ml=None): EV.append((t, x, db, ml))
def steps(t0, t1, dt, pool, db):
    k = 0; t = t0
    while t < t1: ev(t, pool[k % len(pool)], db + (k % 3 - 1) * 1.5); k += 1; t += dt
# teclas de las tarjetas (film.js FILM_SFX)
for t, name, _ in json.load(open(f"{L2}/audio/sfx_events.json")):
    ev(t, KEY, {'type_key': -12, 'type_key_soft': -19, 'type_return': -9}[name])
# gancho: golpes en el vidrio de Vickers (codigo 7-3-7) + el del amanecer
def knocks(t, n, gap=0.32, db=-8, x=None):
    for i in range(n): ev(t + i * gap, x if x is not None else S['glass_knock'], db + (i % 2) * -1.5, 0.3)
for t in (0.9, 2.3, 3.7): knocks(T0['01_knock'] + t - 0.56, 3, 0.28, -10)
for t in (0.6, 2.4): knocks(T0['01b_choice'] + t, 3, 0.3, -12)   # v3: nueva intro (la eleccion de anoche)
knocks(T0['01c_saidno'] + 0.4, 3, 0.32, -16, KNOCK_FAR)
knocks(T0['02_floor'] + 1.0, 3, 0.3, -18, KNOCK_FAR); knocks(T0['02_floor'] + 4.6, 3, 0.3, -19, KNOCK_FAR)
knocks(word('h6', 'seven') + 0.6, 7, 0.26, -8); knocks(word('h7') + 0.5, 3, 0.3, -8); knocks(word('h8') + 0.5, 7, 0.26, -8)
ev(T0['05_code'] + 0.1, INV, -10)
for i in range(3): ev(T0['05_code'] + 0.6 + i * 1.1, TICK, -20, 0.2)   # v3: sin la rafaga de pitidos (sonaba a fallo)
ev(T0['06_whatsleft'] + 0.6, ZGROAN, -18, 1.2)
# 6:00 luces
ev(T0['08_lighthouse'] + 0.2, ZCROWD[0], -18, 1.6); ev(T0['08_lighthouse'] + 4.5, ZCROWD[2], -20, 1.6); ev(word('l2', 'lighthouse'), DEFAULT, -15, 0.5)
ev(T0['09_count80'] + 0.5, ZCROWD[3], -17, 1.6)
te = word('l4', 'eighty')
for i in range(10): ev(te - 0.6 + i * 0.08, TICK, -24, 0.12)
steps(T0['11_cross'] + 0.2, END['11_cross'] - 0.2, 0.55, WALK, -14)
for i in range(5): ev(T0['11_cross'] + 0.4 + i * 0.6, F['dog_paws'], -22, 0.5)
# 6:40 generador
ev(T0['12_motorpool'] + 0.3, DEFAULT, -16, 0.5)
ev(T0['14_fuel'] + 0.1, INV, -10); ev(word('g4', 'dead'), CHIME, -16, 0.6); ev(word('g4', 'week'), DEFAULT, -15, 0.5)
ev(word('g5', 'hand'), F['cloth'], -18, 0.4); tpull = word('g6', 'pull'); ev(tpull + 0.15, S['switch'], -6, 0.3); ev(tpull + 0.2, F['power_down'], -10, 1.6)
ev(T0['16_dark'] + 0.1, S['switch'], -12, 0.3); ev(T0['17_turnaway'] + 0.2, ZCROWD[1], -20, 1.6); ev(T0['17_turnaway'] + 0.8, ZCROWD[4], -22, 1.6)
# 7:15 la cinta
tclick = take('t3')[1] + 0.25; ev(word('t3', 'stop'), F['tape_click'], -8, 0.4); ev(tclick, S['switch'], -10, 0.3)   # v3: Ava ya no dice 'click', solo el sonido
# 8:00 cubo
ev(T0['23_bucket'] + 0.5, F['kneel_cloth'] if 'kneel_cloth' in F else F['cloth'], -16, 0.4); ev(T0['23_bucket'] + 1.4, F['wrapper'], -14, 0.8); ev(T0['23_bucket'] + 4.5, F['paper_rustle'], -16, 0.6)
ev(T0['24_bucket_diag'] + 0.1, INV, -10)
for i in range(4): ev(T0['24_bucket_diag'] + 1.5 + i * 2.4, DEFAULT, -16, 0.4)
ev(T0['25_item_bags'] + 0.1, INV, -10); ev(T0['25_item_bags'] + 0.5, DEFAULT, -15, 0.4)
# 9:10 la respiracion / celdas
ev(word('b1', 'ears'), F['dog_whine'], -18, 1.0); ev(T0['28_hallway'] + 1.0, F['breath_heavy'], -24, 2.0); ev(T0['28_hallway'] + 4.0, F['heartbeat'], -20, 1.5)
ev(T0['30_cells_hall'] + 0.1, S['flashlight'], -12, 0.3); steps(T0['30_cells_hall'] + 0.4, END['30_cells_hall'] - 0.3, 0.68, WALK, -16)
ev(T0['30_cells_hall'] + 2.0, WHOOSH, -28, 0.4); ev(T0['31_eyes'] + 0.2, BOOM, -16, 2.0); ev(T0['31_eyes'] + 0.6, BARS, -20, 0.6)
ev(T0['33_dutch'] + 1.2, F['mug'], -16, None)
# 9:40 Dutch
ev(T0['36_dutch_talk'] + 0.3, BARS, -16, 0.6)
tpour = word('d5', 'pour'); ev(tpour + 0.3, NW['water_pour'], -12, 3.0); ev(word('d5', 'drinks') + 0.2, F['gulp'], -14, None)
ev(T0['39_water_math'] + 0.1, INV, -10)
for i in range(3): ev(T0['39_water_math'] + 0.6 + i * 0.3, TICK, -22, 0.15)
ev(T0['40_clover_hint'] + 0.2, BOOM, -22, 1.5)
# 10:20 comida
ev(T0['42_evidence'] + 0.4, F['keys_jingle'], -18, 0.6); ev(T0['42_evidence'] + 2.0, F['metal_clang'], -20, 0.5); ev(T0['42_evidence'] + 4.6, F['chips_bag'], -18, 0.8)
ev(T0['43_trunk'] + 0.3, F['door_open'], -12, 1.0); ev(T0['43_trunk'] + 2.0, F['wrapper'], -18, 0.6)
ev(T0['44_cans'] + 0.1, INV, -10)
for i in range(3): ev(T0['44_cans'] + 0.5 + i * 0.4, S['stamp'], -10, 0.35)
ev(T0['45_item_beans'] + 0.1, INV, -10); ev(T0['45_item_beans'] + 0.6, DEFAULT, -15, 0.4)
# 11:00 la llave del trebol
for i in range(3): ev(T0['47_lockers'] + 0.5 + i * 1.2, F['handle_rattle'], -14, 0.5)
ev(T0['47_lockers'] + 3.6, F['metal_locker'], -12, 1.0)
ev(word('k3', 'filing'), DRAG, -12, 1.4); ev(T0['49_clover'] + 0.2, F['metal_clang'], -22, 1.5)
tk5 = word('k5', 'key'); ev(tk5, F['key_lock'], -12, 0.5); ev(tk5 + 0.45, UNLOCK, -10); ev(tk5 + 1.0, S['door_creak'], -10, 2.0)
ev(T0['52_layers'] + 0.1, INV, -10)
# 11:30 estacion vieja
steps(T0['53_old_station'] + 0.4, T0['53_old_station'] + 4.0, 0.62, STONE, -16)
ev(T0['54_old_map'] + 0.1, F['paper_rustle'], -14, 0.6); ev(T0['54_old_map'] + 0.2, INV, -12)
ev(T0['55_desk'] + 0.6, F['paper_rustle'], -16, 0.6); ev(T0['56_notebook'] + 0.1, INV, -10); ev(T0['56_notebook'] + 0.5, F['paper_rustle'], -18, 0.6)
steps(T0['58_she_started'] + 0.3, T0['58_she_started'] + 2.2, 0.62, STONE, -17)
# 12:30 maquina vieja + guardado
for i in range(9): ev(T0['59_typewriter2'] + 0.6 + i * 0.16 + (i % 3) * 0.03, NW['typewriter'][int((1.0 + i * 0.37) * SR):int((1.0 + i * 0.37 + 0.18) * SR)], -14, 0.18)
ev(word('s1', 'drawer'), F['handle_rattle'], -14, 0.5)
ev(T0['60_map_check'] + 0.1, INV, -10)
for i in range(3): ev(T0['60_map_check'] + 1.2 + i * 1.6, DEFAULT, -16, 0.4)
for i in range(24): ev(T0['61_save'] + 0.35 + i * 0.09, KEY, -14)
ev(END['61_save'] - 0.9, SUCCESS, -13, 0.9)
# 12:45 tunel
ev(T0['63_tunnel'] + 0.1, S['flashlight'], -12, 0.3); steps(T0['63_tunnel'] + 0.3, END['63_tunnel'] - 0.2, 0.6, STONE, -15)
for i in range(6): ev(T0['63_tunnel'] + 0.5 + i * 0.95, F['dog_paws'], -24, 0.5)
ev(T0['64_sound_diag'] + 0.1, INV, -10)
for i in range(5): ev(T0['64_sound_diag'] + 1.0 + i * 0.9, WHOOSH, -24, 0.5)
steps(T0['65_dry_edge'] + 0.2, END['65_dry_edge'] - 0.2, 0.62, STONE, -15)
ev(word('u9', 'shuffling'), lp(DRAG, 900), -20, 2.0); ev(word('u9', 'shuffling') + 1.6, ZMOAN, -30, 1.4)
for i in range(4): ev(T0['69_wag'] + 0.4 + i * 0.32, THUMP, -18, 0.2)
ev(T0['69_wag'] + 0.3, F['dog_breath'], -20, 1.5)
# 1:00 Marla
ev(word('m1', 'scarf'), DEFAULT, -15, 0.5); ev(T0['73_wash_diag'] + 0.1, INV, -10)
for i in range(10): ev(T0['73_wash_diag'] + 3.0 + i * 0.5, S['clock'], -16, 0.15)
ev(T0['74_wash'] + 0.3, NW['water_pour'], -14, 3.0); ev(T0['74_wash'] + 2.2, F['cloth'], -18, 0.5)
# 2:30 azotea
ev(T0['76_roof'] + 0.1, F['door_close'], -16, 0.8); steps(T0['76_roof'] + 0.5, T0['76_roof'] + 6.0, 0.58, GRAV, -16)
ev(T0['78_signal_diag'] + 0.1, INV, -10)
for i in range(9): ev(T0['78_signal_diag'] + 1.2 + i * 0.35, DEFAULT, -21, 0.25)
for t in (word('r6', 'flash'), word('r7'), word('r8'), word('r10', 'again')): ev(t, CHIME, -15, 0.8); ev(t, hp(WHOOSH, 2000), -24, 0.3)
ev(T0['81_item_mirror'] + 0.1, INV, -10); ev(T0['81_item_mirror'] + 0.4, DEFAULT, -15, 0.4)
# 4:00 helicoptero
tdrop = word('c3', 'drops'); ev(tdrop + 0.9, F['metal_clang'], -8, 0.8); ev(tdrop + 1.25, F['metal_clang'], -16, 0.5)
for i in range(3): ev(word('c4', 'three') + i * 0.55, TICK, -14, 0.2)
ev(word('c4', 'note') if any(w[0].startswith('note') for w in TL['words'] if w[3] == TIX['c4']) else take('c4')[1], F['paper_rustle'], -14, 0.6)
ev(T0['86_note'] + 0.1, INV, -10)
# 5:30 lo que tienes
ev(T0['88_whatyougot'] + 0.1, INV, -10)
for i in range(3): ev(T0['88_whatyougot'] + 1.0 + i * 2.6, DEFAULT, -15, 0.4)
ev(T0['89_tunnel_map'] + 0.1, INV, -10); ev(T0['89_tunnel_map'] + 3.5, S['stamp'], -10, 0.35)
# 6:00 luces solas
ev(word('n2', 'every'), S['switch'], -7, 0.3); ev(word('n2', 'every') + 0.1, S['fluor'], -14, 2.0); ev(word('n2', 'every') + 0.2, F['generator_pull'], -18, 1.5)
ev(word('n4'), BOOM, -10, 2.0)
ev(T0['94_keys_cells'] + 0.4, F['keys_jingle'], -14, 0.8); ev(T0['96_item_final'] + 0.1, INV, -10)
for i in range(6): ev(T0['96_item_final'] + 0.8 + i * 1.3, DEFAULT, -16, 0.4)
ev(T0['97_dutch_calls'] + 0.3, BARS, -14, 0.6); ev(T0['97_dutch_calls'] + 2.6, BARS, -18, 0.6)
ev(T0['99_choice'] + 0.1, INV, -10); ev(word('x5', 'comment'), DEFAULT, -12, 0.5); ev(word('x6', 'decide'), DEFAULT, -12, 0.5)

sfx = np.zeros(N)
for t, x, db, ml in EV: put(sfx, x, t, db, maxlen=ml)
# v3: Ribbon gruñe bajito y sin parar desde el menu final hasta el ultimo cuadro (bajo la voz y el menu)
g0 = T0['99_choice'] - 0.3; GR = lp(F['dog_growl'], 2500); gt = g0
while gt < DUR - 0.3:
    seg = GR[:int(min(len(GR) / SR, DUR - gt) * SR)].copy(); f = int(0.25 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    put(sfx, seg, gt, -17, fade_out=0.25); gt += len(GR) / SR - 0.35

# ---------- camas de ambiente por plano + acento en las pausas (···) ----------
def bed(x, n=N):
    x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.1; xf = int(1.5 * SR); out = x.copy()
    while len(out) < n: a = out[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf); out = np.concatenate([out[:-xf], a, x[xf:]])
    return out[:n]
BEDS = {"rain": bed(load(PK["rain"], trim=False)), "city": bed(NW['city_far']), "horde": bed(np.concatenate([lp(z, 1800) for z in ZCROWD * 3])),
        "gen": bed(F['generator']), "tape": bed(F['reel_tape']), "hum": bed(NW['room_hum']), "drip": bed(NW['tunnel_water']),
        "wind": bed(NW['wind_roof']), "birds": bed(NW['birds_city']), "vend": bed(F['vending_hum']), "fluor": bed(S['fluor']), "heli": bed(NW['heli'])}
SETOF = {s[0]: s[1] for s in json.load(open(f"{L2}/engine/shots.json", encoding="utf-8"))}
def prof(sid):
    n = int(sid[:2]) if sid[:2].isdigit() else -1
    if sid.startswith('card_'): return {}
    if n <= 3: return {"rain": -24, "horde": -34}
    if n <= 11 or n in (16, 17, 21, 27, 28, 47, 50): return {"city": -32, "horde": -30 if n in (7, 8, 9, 17) else -36, "hum": -40}
    if n <= 15: return {"gen": -24, "hum": -40}
    if n == 18: return {"hum": -34}
    if n <= 20: return {"tape": -28, "hum": -38}
    if n <= 26: return {"hum": -36, "drip": -40}
    if n <= 40 or n in (94, 97, 98, 99): return {"hum": -33, "drip": -42}
    if n <= 46: return {"vend": -34, "hum": -38} if n == 41 else {"hum": -36}
    if n <= 49 or n == 51 or n == 52: return {"hum": -36}
    if n <= 62: return {"drip": -34, "hum": -40}
    if n <= 75: return {"drip": -27, "hum": -42}
    if n <= 87: return {"wind": -27, "birds": -36, "city": -38}
    if n <= 90: return {"wind": -34, "city": -40}
    return {"city": -36, "fluor": -36 if n >= 92 else -60, "hum": -38}   # 91-95 vestibulo al atardecer / luces
GAIN = {k: np.full(N, -90.0) for k in BEDS}
for sid, t in CUTS:
    p = prof(sid)
    if SETOF.get(sid) == 'p2screens': p = {k: v - 4 for k, v in prof(prev).items()}   # pantallas: el ambiente del plano anterior, mas bajo
    else: prev = sid
    for k, v in p.items(): GAIN[k][int(t * SR):int(END[sid] * SR)] = v
GAIN['gen'][int((tpull + 0.3) * SR):int(T0['card_c0715'] * SR)] = -90          # el generador se apaga en "pull"
GAIN['gen'][int(word('n2', 'every') * SR):] = np.maximum(GAIN['gen'][int(word('n2', 'every') * SR):], -38)   # ... y vuelve solo (lejos)
GAIN['tape'][int(word('t3', 'stop') * SR):int(T0['card_c0800'] * SR)] = -90    # la cinta se para en "stop"
GAIN['horde'][int(T0['95_stopped'] * SR):] = -90                               # "the knocking has stopped"
h0, h1 = word('c1') - 0.2, T0['card_c1730']                                    # helicoptero: se acerca, pasa, se va
hel = np.full(N, -90.0); tt = np.arange(int(h0 * SR), int(h1 * SR)) / SR; peak = T0['83_heli'] + 1.5
hel[int(h0 * SR):int(h1 * SR)] = np.where(tt < peak, -38 + 38 * np.clip((tt - h0) / (peak - h0), 0, 1) ** 1.5, -2 - 36 * np.clip((tt - peak) / (h1 - peak), 0, 1))
GAIN['heli'] = hel
# pausas (···): ambiente +4 dB y un acento segun el lugar
PAUSES = [take(x[0])[1] for x in TK.T if x[5] == TK.PAUSE]
for tp in PAUSES:
    sid = max((s for s, t in CUTS if t <= tp + 0.3), key=lambda s: T0[s]); n = int(sid[:2]) if sid[:2].isdigit() else 0
    a, b = int(tp * SR), int((tp + TK.PAUSE) * SR)
    for k in GAIN: GAIN[k][a:b] = np.where(GAIN[k][a:b] > -80, GAIN[k][a:b] + 4, GAIN[k][a:b])
    if n <= 11 or 91 <= n <= 93: knocks(tp + 0.5, 3, 0.34, -22, KNOCK_FAR) if n < 95 else None
    elif 63 <= n <= 75 or 53 <= n <= 62: put(sfx, F['drip'], tp + 0.4, -16, 0.6); put(sfx, F['drip'], tp + 1.1, -20, 0.6)
    elif 76 <= n <= 87: put(sfx, NW['wind_gust'], tp + 0.1, -18, 1.8, 0.6)
    elif 12 <= n <= 15: put(sfx, F['generator_pull'], tp + 0.5, -26, 1.0)
    else: put(sfx, TICK, tp + 0.6, -26, 0.2); put(sfx, F['drip'], tp + 1.2, -24, 0.5)
amb = np.zeros(N)
for k, x in BEDS.items():
    g = uniform_filter1d(GAIN[k], int(0.5 * SR)); amb += x * 10 ** (g / 20)

# ---------- voz ----------
voice = load(f"{L2}/voz/track.wav", trim=False)
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N] * 0.9

# ---------- musica por capitulo ----------
MD, MT, MR, M0 = f"{L1}/audio/cand/mus_dark", f"{L1}/audio/cand/mus_tension", f"{L1}/audio/cand/mus_drone", f"{P}/audio/cand/mus_thriller"
TRK = {"345069": f"{M0}/345069.mp3", "164272": f"{MD}/164272.mp3", "350953": f"{MT}/350953.mp3", "492956": f"{MD}/492956.mp3", "559388": f"{MD}/559388.mp3",
       "640612": f"{MR}/640612.mp3", "631933": f"{MR}/631933.mp3", "865550": f"{MR}/865550.mp3", "686659": f"{MT}/686659.mp3"}
CUES = [(0, "345069", 0), (T0["card_c0600"], "350953", 0), (T0["card_c0640"], "640612", 0), (T0["card_c0715"], "164272", 0), (T0["card_c0800"], "559388", 0),
        (T0["card_c0910"], "631933", 0), (T0["card_c0940"], "492956", 0), (T0["card_c1020"], "559388", 40), (T0["card_c1100"], "865550", 0),
        (T0["card_c1130"], "164272", 50), (T0["card_c1230"], "559388", 80), (T0["card_c1245"], "640612", 30), (T0["card_c1300"], "492956", 60),
        (T0["card_c1430"], "350953", 30), (T0["card_c1600"], "686659", 0), (T0["card_c1730"], "164272", 100), (T0["card_c1800"], "865550", 20), (T0["99_choice"], "345069", 20)]
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
    if i > 0: seg[:XF] *= np.linspace(0, 1, XF)
    if b < N: seg[-XF:] *= np.linspace(1, 0, XF)
    # nivel POR TRAMO: musica 10.5 LU bajo la voz en las partes habladas del tramo (gancho: 7 LU en los primeros 10 s)
    sel = spk[a:min(b, N)] > 0.5
    target = 9.0   # tras el ducking (-1.5 dB habla, -4 dB [PIENSA]) queda ~10.5 LU bajo la voz
    if sel.sum() > SR:
        dv = mtr.integrated_loudness(voice[a:b][sel]); dm = mtr.integrated_loudness(seg[:len(sel)][sel]); seg *= 10 ** ((dv - dm - target) / 20)
    music[a:b] += seg
duck = 10 ** ((-1.5 * np.clip(spk * 1.5, 0, 1) - 4.0 * think) / 20)   # ducking suave bajo la voz y 4 dB extra en [PIENSA]
hook = np.ones(N); hook[:int(10 * SR)] = 10 ** (3.5 / 20); hook = uniform_filter1d(hook, int(1.0 * SR))   # gancho 0-10 s mas presente
g = np.ones(N); fo = int(2.0 * SR); g[-fo:] *= np.linspace(1, 0, fo)
music = music * duck * hook * g
# informe: diferencia voz-musica por tramo (partes habladas)
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
sf.write(f"{L2}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice), ("music", music), ("sfx", sfx * 0.9), ("amb", amb)): sf.write(f"{L2}/audio/stem_{name}.wav", x.astype(np.float32), SR)

# mix8.py -> audio/mix.wav (+ stems) del ep8 LARGO "The Last Farm". Base: zombie-03-station/largo/audio/mix_largo.py (aprobado v3)
# + capa de terror del gancho de mix6/mix7 (dron + caja de musica, 0-10.8 s). Voz (voz/track.wav) + musica real CC0 por capitulo
# (pistas del largo del ep3, ya elegidas con earshot) por LUFS a ~10.5 LU bajo la voz mientras habla, cortada en el YOU DIED y
# sonando hasta el final (tarjeta PART 2 / SUBSCRIBE!) + ambiente por plano (campo de dia, grillos de noche, viento, cuarto) +
# SFX en cada evento de los sets (audio/sfx_events.json <- engine/sfx_dump.mjs). La lista "sin mapa" tiene que salir vacia.
# Master estereo -14 LUFS, true peak <= -1 dBTP (limite -3 dBFS antes del AAC). python mix8.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln, os
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-08-farm"; E3 = r"F:/Claude Proyectos/pieces/zombie-03-station"; L3 = E3 + "/largo"; P7 = r"F:/Claude Proyectos/pieces/zombie-07-saferoom/audio/cand"
DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"; ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"; C2 = r"F:/Claude Proyectos/pieces/zombie-02-window/audio/cand"; KIT = r"F:/Claude Proyectos/sound-layer/kit"
CUT = json.load(open(f"{P}/review/cuts.json")); T0 = dict(CUT["cuts"]); DUR = CUT["dur"]; N = int(DUR * SR)
TL = json.load(open(f"{P}/engine/timeline.json", encoding="utf-8"))
_c = {}
def load(path, a=None, b=None, trim=True):
    k = (path, a, b, trim)
    if k not in _c:
        cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
        x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
        if len(x) == 0: raise SystemExit("no se pudo leer " + path)
        if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]   # sin silencio inicial (el SFX cae en su frame)
        f = min(len(x) // 2, int(0.004 * SR)); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        _c[k] = x / (np.abs(x).max() + 1e-9)
    return _c[k]
def put(buf, x, t, db, maxlen=None, fade_out=0.05):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]
    f = min(len(x), int(fade_out * SR)); x[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)

# ---------- fuentes ----------
S3 = {k: load(f"{E3}/audio/{v}") for k, v in json.load(open(f"{E3}/audio/picks.json")).items() if k != "rain"}
F3 = {k: load(f"{L3}/audio/{v['file']}") for k, v in json.load(open(f"{L3}/audio/picks_largo.json", encoding="utf-8")).items()}
PK8 = json.load(open(f"{P}/audio/picks8.json", encoding="utf-8")); F8 = {k: load(f"{P}/audio/{v['file']}") for k, v in PK8.items()}
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2)
ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1); KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40); UNLOCK = load(f"{DC}/ch/door_and_gate_unlock.wav", 2.18, 3.0)
WALK = [load(f"{DC}/ch/walk_run_indoors.wav", a, a + 0.32) for a in (2.305, 2.805, 3.305, 3.81, 5.21, 5.715)]
ZMOAN = load(f"{ZS}/z08_110.4.wav"); ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
GLASS = load(f"{C2}/glass_bang/104339.mp3"); THUNK = load(f"{C2}/wood_thunk/171306.mp3")
WHOOSH = load(f"{KIT}/whoosh/fs-109747-hit-with-swooshed-material-a-2.wav"); POP = load(f"{KIT}/pop/fs-174695-sci-fi-bubble-pop-1.wav"); TICK = load(f"{KIT}/tick/fs-185611-metal-tick-1-1.wav")
CLICK = load(f"{KIT}/click/kenney-interface-click-001.wav"); BOOM = load(f"{KIT}/boom/fs-539968-deep-boom-3.wav"); THUMP = load(f"{KIT}/thump/fs-133282-thump-on-carpet-2.wav")
DRILL = load(f"{P7}/drill_screw/871631.mp3"); STING = load(f"{P7}/stinger/271945.mp3")
def gravel(): x = load(f"{P}/audio/{PK8['gravel_steps']['file']}", trim=False); return [x[int(a * SR):int((a + 0.3) * SR)] / (np.abs(x[int(a * SR):int((a + 0.3) * SR)]).max() + 1e-9) for a in np.arange(0.3, 4.0, 0.55)]
GRAVEL = gravel()
f8 = lambda k, alt: F8[k] if k in F8 else alt

MAP = {
 'label': (DEFAULT, -15, 0.5), 'label_pop_danger': (DEFAULT, -13, 0.5), 'cute_wink': (POP, -20, 0.3), 'sting_low': (BOOM, -16, 2.0), 'tension_sting': (STING, -12, 2.0),
 'you_died_sting': (BOOM, -6, 2.5), 'cloth_shrug': (F3['cloth'], -22, 0.4), 'cloth_point': (F3['cloth'], -22, 0.4),
 'cow_moo': (F8['cow_moo'], -12, 2.5), 'cow_moo_far': (f8('moo_far', F8['cow_moo']), -24, 2.5), 'hooves': (f8('hooves', WALK[0]), -16, 3.0),
 'chicken_cluck': (F8['chicken_cluck'], -16, 3.0), 'chicken_cluck_short': (F8['chicken_cluck'], -18, 1.0), 'chicken_alarm': (F8['chicken_cluck'], -9, 2.0), 'rooster': (F8['rooster'], -12, 3.0),
 'dog_bark': (F8['dog_bark'], -12, 0.8), 'dog_growl_big': (F8['dog_growl_big'], -7, 1.7), 'cursor_move': (DEFAULT, -12, 0.3), 'dog_growl': (F3['dog_growl'], -10, 1.8), 'dog_growl_low': (F3['dog_growl'], -16, 1.8), 'dog_paws': (F3['dog_paws'], -18, 1.2),
 'dog_sleep_breath': (F3['dog_breath'], -28, 1.5), 'collar_jingle': (F3['dog_collar'], -16, 0.5),
 'step_walk': (WALK, -13, None), 'step_wood': (WALK, -14, None), 'step_wood_soft': (WALK, -22, None), 'step_gravel': (GRAVEL, -15, None),
 'porch_creak': (F8['porch_creak'], -16, 1.0), 'coffee_sip': (f8('coffee_sip', F3['gulp']), -18, 0.8), 'water_slosh': (F3['water_slosh'], -18, 0.8),
 'door_creak': (S3['door_creak'], -12, 1.5), 'generator_pull': (F3['generator_pull'], -10, 1.5), 'generator_start': (F3['generator'], -10, 2.5),
 'generator_loop': (F3['generator'], -13, 2.6), 'generator_loop_far': (F3['generator'], -24, 2.6), 'generator_stop': (F3['power_down'], -14, 1.2),
 'corn_rustle': (f8('corn_rustle', F3['cloth']), -14, 2.0), 'zombie_moan_far': (ZMOAN, -20, 1.6), 'zombie_groan_far': (ZGROAN, -22, 1.4),
 'zombie_groan': (ZGROAN, -12, 1.2), 'zombie_growl': (ZGROWL, -12, 0.9), 'sound_ring': (WHOOSH, -22, 0.6), 'ring_expand': (WHOOSH, -20, 0.6),
 'gate_creak': (f8('gate_metal', S3['door_creak']), -14, 1.5), 'truck_idle': (F8['truck_idle'], -14, 2.6), 'truck_brake': (THUNK, -18, 0.4),
 'chain_rattle': (F8['chain'], -10, 1.0), 'padlock_handle': (F3['keys_jingle'], -18, 0.4), 'padlock_click': (S3['padlock'], -8, 0.5),
 'light_switch_on': (S3['switch'], -14, 0.3), 'barn_door': (f8('barn_door', S3['door_creak']), -12, 2.0), 'owl': (F8['owl'], -22, 2.0),
 'hay_rustle': (f8('corn_rustle', F3['cloth']), -18, 1.5), 'creature_breath_far': (F3['breath_heavy'], -16, 2.0),
 'traffic_jam': (F8['traffic_jam'], -12, 6.0), 'car_horn': (F8['traffic_jam'], -16, 1.0), 'car_horns_far': (F8['traffic_jam'], -24, 2.5),
 'phone_vibrate': (F8['phone_vibrate'], -12, 0.9), 'phone_alert': (F8['phone_alert'], -10, 1.5), 'keys_jingle': (f8('keys_hook', F3['keys_jingle']), -14, 0.8),
 'tap_run': (F8['tap_run'], -16, 4.0), 'tub_fill': (F8['tub_fill'], -15, 6.0), 'jug_fill': (f8('jug_fill', S3['water_glug']), -16, 2.0), 'bucket_set': (THUNK, -20, 0.3),
 'counter_tick': (DEFAULT, -21, 0.25), 'item_pop': (DEFAULT, -17, 0.4), 'pipe_tick': (TICK, -20, 0.2), 'power_flicker': (f8('power_flicker', S3['fluor']), -14, 1.2),
 'power_down_hum': (F3['power_down'], -12, 1.5), 'drill': (DRILL, -12, 0.9), 'pen_scribble': (F3['pen_write'], -16, 0.8), 'key_insert': (F3['key_lock'], -12, 0.5), 'key_turn': (UNLOCK, -12, None),
 'map_open': (INV, -10, None), 'map_blink': (DEFAULT, -20, 0.3), 'file_open': (INV, -10, None), 'file_line': (DEFAULT, -21, 0.3), 'stamp': (S3['stamp'], -10, 0.35), 'stamp_x': (S3['stamp'], -8, 0.35),
 'clock_tick_fast': (S3['clock'], -17, 0.1), 'menu_open': (INV, -10, None), 'alarm_beep': (ALARM, -14, None), 'save_chime': (SUCCESS, -13, 0.9),
 'type_key': (KEY, -12, None), 'type_key_soft': (KEY, -19, None), 'type_return': (KEY, -9, None),
}
EV = json.load(open(f"{P}/audio/sfx_events.json"))
miss = sorted({e[1] for e in EV if e[1] not in MAP}); print("sin mapa:", miss)
sfx = np.zeros(N); cnt = {}
for t, name, _ in EV:
    if name not in MAP: continue
    x, db, ml = MAP[name]
    if isinstance(x, list): i = cnt.get(name, 0); cnt[name] = i + 1; x = x[i % len(x)]
    put(sfx, x, t, db, maxlen=ml)
HUD_T = CUT["cuts"][1][1]; put(sfx, DEFAULT, HUD_T, -14, maxlen=0.5)   # el HUD entra de golpe con el corte al 2o plano

# ---------- ambiente por plano: campo de dia / grillos de noche / viento, cuarto dentro, casi nada en pantallas ----------
SHOTS = json.load(open(f"{P}/engine/shots.json", encoding="utf-8")); SETOF = {s[0]: s[1] for s in SHOTS}
NIGHT = {"46_night", "69_window", "71_ajar", "72_moving", "68_wake", "69b_go", "73_fudge"}; DUSK = {"50_alarm", "61_curtains", "62_locked", "70_sunset", "54b_evening"}
def bed(x): return np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
DAY = bed(load(f"{P}/audio/{PK8['farm_day']['file']}", trim=False)); CRK = bed(load(f"{P}/audio/{PK8['crickets']['file']}", trim=False)); WIND = bed(load(f"{P7}/wind/438862.mp3", trim=False))
ROOM = bed(F3['room_tone']); TRAF = bed(F8['traffic_jam'])
ld, lc, lw, lr, lt = (np.full(N, -80.0) for _ in range(5)); cuts = CUT["cuts"]
for i, (sid, t) in enumerate(cuts):
    t1 = cuts[i + 1][1] if i + 1 < len(cuts) else DUR; a, b = int(t * SR), int(t1 * SR); st_ = SETOF.get(sid, "card")
    if sid in ("18_jam", "19_died"): lt[a:b] = -22; continue
    if st_ == "farm": (lc if sid in NIGHT else ld)[a:b] = -24 if sid not in DUSK else -27; lw[a:b] = -38; (lc[a:b].__setitem__(slice(None), -27) if sid in DUSK else None)
    elif st_ == "house": lr[a:b] = -34; (lc if sid in NIGHT else ld)[a:b] = -38
    elif st_ == "screens8": ld[a:b] = -46
sm = lambda v: 10 ** (uniform_filter1d(v, int(0.4 * SR)) / 20)
amb = DAY * sm(ld) + CRK * sm(lc) + WIND * sm(lw) + ROOM * sm(lr) + TRAF * sm(lt)

# ---------- voz ----------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]

# ---------- musica por capitulo (CC0, del largo del ep3 + tema), fundidos de 1 s en las tarjetas ----------
MU = f"{L3}/audio/cand"; MU0 = f"{E3}/audio/cand/mus_thriller"
TRK = {"345069": f"{MU0}/345069.mp3", "164272": f"{MU}/mus_dark/164272.mp3", "350953": f"{MU}/mus_tension/350953.mp3", "492956": f"{MU}/mus_dark/492956.mp3",
       "559388": f"{MU}/mus_dark/559388.mp3", "640612": f"{MU}/mus_drone/640612.mp3", "865550": f"{MU}/mus_drone/865550.mp3", "686659": f"{MU}/mus_tension/686659.mp3"}
CUES = [(0, "164272", 0, 0), (T0["card_c2"], "350953", 0, 0), (T0["card_c3"], "492956", 0, 0), (T0["card_c4"], "640612", 0, 0), (T0["card_c5"], "559388", 0, 0),
        (T0["card_c6"], "164272", 50, -1), (T0["card_c7"], "559388", 40, -3), (T0["card_c8"], "865550", 0, 0), (T0["74_end"], "345069", 20, 0)]
def loop_to(x, n, xf=int(2.0 * SR)):
    out = x.copy()
    while len(out) < n:
        a = out[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf); out = np.concatenate([out[:-xf], a, x[xf:]])
    return out[:n]
mus = np.zeros(N); XF = int(1.0 * SR)
for i, (t, tid, off, gdb) in enumerate(CUES):
    t1 = CUES[i + 1][0] if i + 1 < len(CUES) else DUR
    a, b = int(t * SR), min(N, int(t1 * SR) + XF)
    x = load(TRK[tid], trim=False)[int(off * SR):]; x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.1
    seg = loop_to(x, b - a) * 10 ** (gdb / 20)
    if i > 0: seg[:XF] *= np.linspace(0, 1, XF)
    if b < N: seg[-XF:] *= np.linspace(1, 0, XF)
    mus[a:b] += seg
def word(take, w):
    ix = TL["takes"].index(take) + 1
    return next(x[1] for x in TL["words"] if x[3] == ix and x[0].startswith(w))
ids = [c[0] for c in cuts]; yd0 = TL["words"][[x[3] for x in TL["words"]].index(TL["takes"].index("b7") + 1)][1] + 0.9; yd1 = T0[ids[ids.index("19_died") + 1]]
g = np.ones(N); g[int(yd0 * SR):int(yd1 * SR)] = 0   # la musica se corta en el YOU DIED
fo = int(1.5 * SR); g[-fo:] *= np.linspace(1, 0, fo)   # y suena hasta el ultimo frame de la tarjeta final
g = uniform_filter1d(g, int(0.12 * SR)); mus *= g
# capa de terror del gancho (mix5/mix6): dron + caja de musica 0-10.8 s, fundida hacia la BGM
HK = int(10.8 * SR); hook = np.zeros(N)
drone = load(f"{P7}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{P7}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
hook *= np.clip(np.arange(N) / (0.4 * SR), 0, 1) * np.clip((10.6 * SR - np.arange(N)) / (2.2 * SR), 0, 1)
put(sfx, STING, word("h2", "zombie"), -14, maxlen=2.0); put(sfx, STING, word("h6", "save"), -16, maxlen=2.0)   # golpes en las palabras clave del gancho
env = np.zeros(N); H = int(0.02 * SR)
for i in range(0, N - H, H): env[i:i + H] = np.sqrt(np.mean(voice[i:i + H] ** 2))
spk = uniform_filter1d((env > 0.02).astype(float), int(0.25 * SR))
mtr = pyln.Meter(SR); act = spk > 0.5; sel = act & (g > 0.5)
v_lu = mtr.integrated_loudness(voice[sel]); m_lu = mtr.integrated_loudness(mus[sel])
MUS_DB = v_lu - m_lu - 8.0
music = mus * 10 ** ((MUS_DB - 2.5 * np.clip(spk * 1.5, 0, 1)) / 20)
print("musica bajo la voz (LUFS, tramos con voz):", round(v_lu - mtr.integrated_loudness(music[sel]), 1), "LU")
TARGET = 10.5   # v4 (usuario): cada tramo de musica (capitulo) medido por separado a ~10.5 LU bajo la voz
bounds = [c[0] for c in CUES] + [DUR]
for i in range(len(CUES)):
    a0, b0 = int(bounds[i] * SR), int(bounds[i + 1] * SR); m_ = np.zeros(N, bool); m_[a0:b0] = True; seg = sel & m_
    if seg.sum() < SR * 2: continue
    d = mtr.integrated_loudness(voice[seg]) - mtr.integrated_loudness(music[seg]); gdb = d - TARGET
    w_ = np.zeros(N); w_[a0:b0] = 1; w_ = uniform_filter1d(w_, int(1.0 * SR)); music *= 10 ** (gdb * w_ / 20)
    print(f"  cue {i} {CUES[i][1]} {bounds[i]:.1f}-{bounds[i+1]:.1f}: {d:.1f} LU -> {TARGET}")
win = slice(int(0.3 * SR), int(8.0 * SR)); hook *= 10 ** ((mtr.integrated_loudness(voice[win]) - 12 - mtr.integrated_loudness(hook[win] + 1e-9)) / 20)
voice = voice * 10 ** (1.5 / 20)

# ---------- master estereo ----------
music_all = music + hook
mix = voice + music_all + sfx * 0.9 + amb
st = lambda m: np.stack([m, m], 1)
for _ in range(3):
    lufs = mtr.integrated_loudness(st(mix)); mix *= 10 ** ((-14 - lufs) / 20)
    lim = 10 ** (-3.0 / 20)
    if np.abs(mix).max() > lim:
        k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
gain = np.abs(mix).max() and 1
print("LUFS", round(mtr.integrated_loudness(st(mix)), 2), "peak dBFS", round(20 * np.log10(np.abs(mix).max()), 2), "dur", round(DUR, 2))
print("voz vs musica (todo):", round(mtr.integrated_loudness(voice[sel]) - mtr.integrated_loudness(music_all[sel]), 1), "LU")
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice), ("music", music_all), ("sfx", sfx * 0.9), ("amb", amb)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
json.dump({k: {kk: PK8[k].get(kk) for kk in ("name", "user", "url")} for k in PK8}, open(f"{P}/audio/credits_sfx.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

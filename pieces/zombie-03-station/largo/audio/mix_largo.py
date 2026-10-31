# mix_largo.py -> audio/mix.wav (+ stems) del LARGO 16:9. Base: ../../audio/scripts/mix3.py (corto aprobado).
# voz (voz/track.wav: Ava + policia + radio + Marla) + musica real CC0 por capitulo (AUDIO.md; continua, solo -2.5 dB bajo la
# voz, cortada en el YOU DIED y antes del FOLLOW) + lluvia CC0 sin voces + SFX en cada evento de los sets
# (audio/sfx_events.json <- engine/sfx_dump.mjs). Fuentes: Dino Crisis (assets/dino-crisis-sfx, pasos = walk_run_indoors.wav),
# voces de zombi de RE (assets/zombie-sfx-yt/seg), Freesound CC0 elegidos con earshot rank (audio/picks_largo.json,
# scripts/rank_picks.py), picks del corto (../audio/picks.json), kit CC0 (sound-layer/kit). Master estereo -14 LUFS, TP <= -1 dBTP.
# python mix_largo.py  (imprime "sin mapa": tiene que salir vacio)
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
L = r"F:/Claude Proyectos/pieces/zombie-03-station/largo"; P = r"F:/Claude Proyectos/pieces/zombie-03-station"
DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"; ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"
C2 = r"F:/Claude Proyectos/pieces/zombie-02-window/audio/cand"; KIT = r"F:/Claude Proyectos/sound-layer/kit"
CUT = json.load(open(f"{L}/review/cuts.json")); T0 = dict(CUT["cuts"]); DUR = CUT["dur"]; N = int(DUR * SR)
TL = json.load(open(f"{L}/engine/timeline.json", encoding="utf-8"))
_c = {}
def load(path, a=None, b=None, trim=True):
    k = (path, a, b, trim)
    if k not in _c:
        cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
        x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
        if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]   # sin silencio inicial
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
PK = {k: f"{P}/audio/{v}" for k, v in json.load(open(f"{P}/audio/picks.json")).items()}
S = {k: load(v) for k, v in PK.items() if k != "rain"}
LP = json.load(open(f"{L}/audio/picks_largo.json", encoding="utf-8")); F = {k: load(v["file"]) for k, v in LP.items()}
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); RADIO = load(f"{DC}/kFNdZRE_0II.wav")
UNLOCK = load(f"{DC}/ch/door_and_gate_unlock.wav", 2.18, 3.0); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6)
SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2); ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)
WALK = [load(f"{DC}/ch/walk_run_indoors.wav", a, a + 0.32) for a in (2.305, 2.805, 3.305, 3.81, 5.21, 5.715)]   # pasos de Dino Crisis (andar)
RUN = [load(f"{DC}/ch/walk_run_indoors.wav", a, a + 0.26) for a in (7.35, 7.685, 8.02, 8.355, 10.225, 10.56, 10.895, 12.1)]   # (correr)
ZMOAN = load(f"{ZS}/z08_110.4.wav"); ZSHOUT = load(f"{ZS}/z11_123.9.wav"); ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
ZCROWD = [load(f"{ZS}/{z}") for z in ("z02_89.0.wav", "z05_103.1.wav", "z09_115.7.wav", "z13_127.6.wav", "z17_145.8.wav")]
GLASS = load(f"{C2}/glass_bang/104339.mp3"); SLAM = load(f"{C2}/door_slam/406626.mp3")
BARS = load(f"{C2}/metal_bar_clank/835169.mp3"); THUNK = load(f"{C2}/wood_thunk/171306.mp3"); DRAG = load(f"{C2}/couch_drag/406699.mp3")
MAGO = load(f"{C2}/mag_out/711555.mp3"); MAGI = load(f"{C2}/mag_in/815879.mp3", 0.0, 0.45); RACK = load(f"{C2}/slide_rack/866514.mp3", 0.0, 0.7)
WHOOSH = load(f"{KIT}/whoosh/fs-109747-hit-with-swooshed-material-a-2.wav")
UI3 = load(f"{KIT}/ui/kenney-digital-three-tone1.wav"); UI1 = load(f"{KIT}/ui/kenney-digital-tone1.wav")
CHIME = load(f"{KIT}/chime/fs-127149-ding-wav-1.wav"); POP = load(f"{KIT}/pop/fs-174695-sci-fi-bubble-pop-1.wav")
TICK = load(f"{KIT}/tick/fs-185611-metal-tick-1-1.wav"); CLICK = load(f"{KIT}/click/kenney-interface-click-001.wav")
THUMP = load(f"{KIT}/thump/fs-133282-thump-on-carpet-2.wav"); BOOMFAR = load(f"{KIT}/boom/fs-264031-low-mid-afar-explosion-1-wav-1.wav")
BOOM = load(f"{KIT}/boom/fs-539968-deep-boom-3.wav")

# nombre del evento -> (sonido | lista para alternar, dB, maxlen)
MAP = {
 'alarm_beep': (ALARM, -14, None), 'ball_squeak': (F['toy_squeak'], -16, 0.5), 'bar_rise': (WHOOSH, -24, 0.6),
 'bars_rattle': (BARS, -12, 0.6), 'bars_rattle_far': (BARS, -22, 0.6), 'body_hit_bars': (BARS, -7, 0.7), 'basement_drip': (F['drip'], -20, 0.6),
 'bench_scrape': (DRAG, -12, 1.2), 'bench_thud': (THUNK, -10, 0.5), 'bulb_buzz': (F['bulb_buzz'], -24, 1.5), 'bulb_on': (S['switch'], -10, 0.3),
 'candy_slide': (F['paper_rustle'], -20, 0.6), 'car_tick': (TICK, -22, 0.2),
 'cells_room_tone': (F['room_tone'], -30, 4.0), 'corridor_room_tone': (F['room_tone'], -30, 4.0), 'empty_room_tone': (F['room_tone'], -30, 4.0),
 'chain_rattle': (F['keys_jingle'], -16, 0.6), 'chair_hit': (F['chair_hit'], -8, 0.6), 'chair_set_down': (F['chair_hit'], -20, 0.4), 'chair_swoosh': (WHOOSH, -22, 0.4),
 'check': (DEFAULT, -14, 0.5), 'chips_bag': (F['chips_bag'], -16, 1.0), 'clock_tick': (S['clock'], -14, 0.15), 'clock_tick_fast': (S['clock'], -17, 0.1),
 'closet_door_creak': (S['door_creak'], -10, 1.2), 'cloth_point': (F['cloth'], -22, 0.4), 'cloth_present': (F['cloth'], -22, 0.4),
 'cloth_rustle': (F['cloth'], -22, 0.4), 'cloth_shrug': (F['cloth'], -22, 0.4), 'grab_cloth': (F['cloth'], -12, 0.4), 'kneel_cloth': (F['cloth'], -18, 0.4),
 'collar_jingle': (F['dog_collar'], -16, 0.5), 'dog_collar_jingle': (F['dog_collar'], -16, 0.5), 'dog_tag_jingle': (F['dog_collar'], -16, 0.5), 'dog_tags_jingle': (F['dog_collar'], -16, 0.5),
 'counter_blip': (DEFAULT, -18, 0.3), 'counter_tick': (DEFAULT, -20, 0.25), 'creature_breath_far': (F['breath_heavy'], -22, 2.0),
 'cursor_move': (DEFAULT, -12, 0.3), 'cut_whoosh_soft': (WHOOSH, -26, 0.4), 'cute_wink': (POP, -20, 0.3), 'dial_tick': (F['dial_click'], -12, 0.15),
 'dial_tone_dead': (CLICK, -18, 0.2), 'dinner_bell_ding': (F['bell_ding'], -12, 1.2), 'dog_breath': (F['dog_breath'], -22, 1.5), 'dog_sleep_breath': (F['dog_breath'], -28, 1.5),
 'dog_claws_concrete': (F['dog_paws'], -18, 0.8), 'dog_paws': (F['dog_paws'], -18, 0.8), 'dog_growl': (F['dog_growl'], -10, 1.6), 'dog_growl_low': (F['dog_growl'], -16, 1.6),
 'dog_sniff': (F['dog_sniff'], -14, 0.8), 'dog_tail_rustle': (F['cloth'], -24, 0.4), 'tail_thump': (THUMP, -22, 0.2), 'dog_whine': (F['dog_whine'], -14, 1.2),
 'door_close': (F['door_close'], -12, 0.8), 'door_open': (F['door_open'], -12, 1.0), 'door_creak': (S['door_creak'], -9, 1.7), 'door_creak_slow': (S['door_creak'], -10, 2.0),
 'door_creak_metal': (S['door_creak'], -9, 1.7), 'door_glass_push': (S['glass_knock'], -14, 0.3), 'door_handle': (F['handle_rattle'], -16, 0.3), 'door_handle_grab': (F['handle_rattle'], -16, 0.3),
 'door_handle_rattle': (F['handle_rattle'], -10, 0.8), 'door_handle_pull': (F['handle_rattle'], -16, 0.3), 'door_handle_push': (F['handle_rattle'], -16, 0.3), 'door_locked_rattle': (F['handle_rattle'], -10, 0.8), 'door_scratch': (F['dog_scratch'], -12, 0.6),
 'door_slam': (SLAM, -10, 0.8), 'door_thud': (THUNK, -10, 0.5), 'door_unlock': (UNLOCK, -10, None), 'examine_text': (DEFAULT, -16, 0.5),
 'file_line': (DEFAULT, -21, 0.3), 'file_open': (INV, -10, None), 'flashlight_click': (S['flashlight'], -12, 0.3), 'flashlight_rattle': (F['keys_jingle'], -24, 0.3),
 'flashlight_sweep_whoosh': (WHOOSH, -26, 0.4), 'fluorescent_buzz': (S['fluor'], -20, 2.0), 'fluorescent_buzz_loop': (S['fluor'], -24, 2.0),
 'fluorescent_hum_start': (S['fluor'], -13, 2.0), 'fluorescent_hum_stop': (S['switch'], -14, 0.3), 'fridge_hum_loop': (F['vending_hum'], -30, 3.0),
 'vending_hum_loop': (F['vending_hum'], -26, 3.0), 'frosted_glass_tap': (S['glass_knock'], -16, 0.3), 'fuel_warning_ding': (CHIME, -16, 0.6),
 'gas_hiss': (F['hiss'], -16, 1.0), 'steam_hiss': (F['hiss'], -16, 1.0), 'gauge_needle': (TICK, -20, 0.2),
 'generator_loop': (F['generator'], -14, 3.0), 'generator_rattle': (F['generator_pull'], -12, 1.5),
 'glass_bang': (GLASS, -9, 0.5), 'glass_hit': (GLASS, -11, 0.5), 'glass_knock': (S['glass_knock'], -7, 0.3), 'glass_knock_fast': (S['glass_knock'], -9, 0.2),
 'glass_tap': (S['glass_knock'], -16, 0.25), 'glass_debris_fall': (F['glass_debris'], -12, 1.5), 'glass_shards_fall': (F['glass_debris'], -12, 1.5),
 'glass_shatter': (F['glass_shatter'], -6, 2.0), 'vending_glass_break': (F['glass_shatter'], -8, 1.5), 'vending_glass_crack': (F['vending_glass'], -10, 0.6),
 'gulp': (F['gulp'], -14, None), 'gun_handle': (MAGI, -14, None), 'gunshot_distant': (BOOMFAR, -14, 1.5), 'heartbeat_soft': (F['heartbeat'], -20, 1.5),
 'horde_moan': (ZCROWD, -14, 1.6), 'horde_moan_far': (ZCROWD, -22, 1.6), 'zombie_groan_crowd': (ZCROWD, -16, 1.6),
 'item_pop': (DEFAULT, -17, 0.4), 'item_select': (DEFAULT, -14, 0.3), 'item_lift': (WHOOSH, -18, 0.5), 'jug_glug': (S['water_glug'], -12, 0.8),
 'key_insert': (F['key_lock'], -12, 0.5), 'key_turn': (UNLOCK, -12, None), 'key_jingle': (F['keys_jingle'], -14, 0.8),
 'label': (DEFAULT, -15, 0.5), 'label_pop': (DEFAULT, -15, 0.5), 'label_pop_danger': (DEFAULT, -13, 0.5),
 'lamp_click_off': (S['switch'], -12, 0.3), 'light_buzz_flicker': (S['fluor'], -16, 1.0), 'light_clack': (S['switch'], -6, 0.3), 'light_clack_off': (S['switch'], -8, 0.3),
 'light_switch_on': (S['switch'], -8, 0.3), 'lock_click': (S['padlock'], -12, 0.4), 'lock_clunk': (UNLOCK, -10, None),
 'locker_bounce': (F['metal_clang'], -12, 0.5), 'locker_creak': (F['metal_locker'], -12, 1.0), 'locker_handle': (F['handle_rattle'], -18, 0.3), 'locker_open': (F['metal_locker'], -10, 1.0),
 'low_drone_fade': (BOOM, -20, 2.0), 'mag_in': (MAGI, -10, None), 'mag_out': (MAGO, -12, None), 'slide_rack': (RACK, -9, None),
 'map_blink': (DEFAULT, -20, 0.3), 'map_open': (INV, -10, None), 'marker_squeak': (F['pen_write'], -18, 0.5),
 'menu_open': (INV, -10, None), 'menu_select': (DEFAULT, -12, 0.5), 'metal_clang': (F['metal_clang'], -10, 0.8), 'metal_ring': (F['metal_clang'], -14, 1.5),
 'mug_handle': (F['mug'], -14, None), 'padlock_click': (S['padlock'], -8, 0.5), 'paper': (F['paper_rustle'], -20, 0.4), 'paper_slide': (F['paper_rustle'], -18, 0.6),
 'paper_tick': (DEFAULT, -21, 0.3), 'paper_unfold': (F['paper_rustle'], -16, 0.6), 'pen_scribble': (F['pen_write'], -16, 0.8), 'pencil_scribble': (F['pen_write'], -16, 0.8),
 'phone_busy': (F['busy_signal'], -16, 1.5), 'phone_dial': (F['phone_keys'], -16, 0.3), 'phone_hangup': (F['phone_pickup'], -12, None), 'phone_pickup': (F['phone_pickup'], -12, None),
 'phone_ring': (F['phone_ring'], -16, None), 'phone_signal_blip': (UI1, -20, 0.2), 'phone_type': (F['phone_keys'], -18, 0.15),
 'ping': (CHIME, -18, 0.6), 'soft_chime': (CHIME, -18, 0.8), 'pipe_tick': (TICK, -20, 0.2), 'pistol_set_down': (F['metal_clang'], -16, 0.4),
 'power_down_hum': (F['power_down'], -12, 1.5), 'prisoner_growl': (ZGROWL, -12, 1.0), 'prisoner_growl_far': (ZGROWL, -22, 1.0), 'prisoner_scream': (ZSHOUT, -8, 1.0),
 'radio_pulse': (S['radio_beep'], -32, 0.15), 'radio_static_on': (RADIO, -6, 0.65),
 'reel_spin': (F['reel_tape'], -18, 2.0), 'tape_click': (F['tape_click'], -10, 0.4), 'tape_hiss': (S['radio_static'], -30, 1.5), 'transmitter_hum': (F['elec_hum'], -24, 3.0),
 'ring_expand': (WHOOSH, -22, 0.6), 'sound_ring': (WHOOSH, -22, 0.6), 'sad_sting': (BOOM, -24, 1.5), 'sting_low': (BOOM, -16, 2.0), 'tension_sting': (BOOM, -18, 2.0),
 'you_died_sting': (BOOM, -6, 2.5), 'save_chime': (SUCCESS, -13, 0.9),
 'sms_delivered': (UI3, -18, 0.5), 'sms_receive': (UI3, -18, 0.5), 'sms_send': (UI1, -18, 0.4), 'sms_sent': (UI1, -18, 0.4),
 'stamp': (S['stamp'], -8, 0.35), 'stamp_x': (S['stamp'], -8, 0.35), 'x_stamp': (S['stamp'], -8, 0.35),
 'step_walk': (WALK, -13, None), 'step_run': (RUN, -12, None),
 'thunder': (S['thunder'], -5, 3.0), 'thunder_crack': (S['thunder'], -5, 3.0), 'towel_drop': (F['cloth'], -16, 0.5), 'towel_rustle': (F['cloth'], -16, 0.5),
 'type_key': (KEY, -12, None), 'type_key_soft': (KEY, -19, None), 'type_return': (KEY, -9, None), 'ui_tick': (DEFAULT, -20, 0.3),
 'water_drop': (F['drip'], -18, None), 'water_slosh': (F['water_slosh'], -16, 0.8), 'whisper_breath': (F['whisper'], -24, 1.0),
 'wrapper_crinkle': (F['wrapper'], -14, 0.8), 'yawn': (F['yawn'], -10, 2.0),
 'zombie_groan': (ZGROAN, -15, 1.2), 'zombie_growl': (ZGROWL, -15, 0.9), 'zombie_moan': (ZMOAN, -20, 1.4),
}
EV = json.load(open(f"{L}/audio/sfx_events.json"))
miss = sorted({e[1] for e in EV if e[1] not in MAP}); print("sin mapa:", miss)
sfx = np.zeros(N); cnt = {}
beeps = sorted(t for t, n, _ in EV if n == "radio_static_on")
for t, name, _ in EV:
    if name not in MAP: continue
    if name in ("file_open", "menu_open"):   # usuario: primero el pitido de radio de Dino Crisis, luego el sonido del FILE
        for b in beeps:
            if b - 0.05 <= t < b + 0.65: t = b + 0.65
    x, db, ml = MAP[name]
    if isinstance(x, list): i = cnt.get(name, 0); cnt[name] = i + 1; x = x[i % len(x)]
    put(sfx, x, t, db, maxlen=ml)
if "radio_static_on" in {e[1] for e in EV}:
    for b in beeps: put(sfx, S['radio_static'], b + 0.1, -26, maxlen=0.7, fade_out=0.3)
# HUD: entra con el sonido por defecto en el corte al 2o plano; alarma en CAUTION (3:14) y DANGER (Vickers)
def word(take, w):
    ix = TL["takes"].index(take) + 1
    return next(x[1] for x in TL["words"] if x[3] == ix and x[0].startswith(w))
put(sfx, DEFAULT, T0["02_gate"], -14, maxlen=0.5)
for t in (word("n1", "at"), word("n10", "vickers")): put(sfx, ALARM, t, -14)

# ---------- lluvia (CC0 467172, sin voces; earshot: "heavy rain" z+3.5): fuerte fuera / junto al cristal, baja dentro ----------
RAIN = load(PK["rain"], trim=False)
rain = np.tile(RAIN, int(np.ceil(N / len(RAIN))) + 1)[:N]
SHOTS = json.load(open(f"{L}/engine/shots.json", encoding="utf-8")); SETOF = {s[0]: s[1] for s in SHOTS}
LV = {"ext": -15, "hall": -24, "screens": -40, "card": -38, "rooms": -33, "kennel": -33, "basement": -38, "radio": -34, "breakroom": -33, "cells": -36, "records": -34}
lvl = np.full(N, -26.0); cuts = CUT["cuts"]
for i, (sid, t) in enumerate(cuts):
    t1 = cuts[i + 1][1] if i + 1 < len(cuts) else DUR
    lvl[int(t * SR):int(t1 * SR)] = LV["card" if sid.startswith("card_") else SETOF.get(sid, "hall")]
amb = rain * 10 ** (uniform_filter1d(lvl, int(0.3 * SR)) / 20)

# ---------- voz ----------
voice = load(f"{L}/voz/track.wav", trim=False) * 1.15
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]

# ---------- musica por capitulo (AUDIO.md), fundidos de 1 s en las tarjetas ----------
MU = f"{L}/audio/cand"; MU0 = f"{P}/audio/cand/mus_thriller"
TRK = {"345069": f"{MU0}/345069.mp3", "164272": f"{MU}/mus_dark/164272.mp3", "350953": f"{MU}/mus_tension/350953.mp3", "492956": f"{MU}/mus_dark/492956.mp3",
       "559388": f"{MU}/mus_dark/559388.mp3", "640612": f"{MU}/mus_drone/640612.mp3", "631933": f"{MU}/mus_drone/631933.mp3",
       "865550": f"{MU}/mus_drone/865550.mp3", "686659": f"{MU}/mus_tension/686659.mp3"}
CUES = [(0, "345069", 0, 0), (T0["card_c0902"], "164272", 0, 0), (T0["card_c0940"], "350953", 0, 0), (T0["card_c1015"], "492956", 0, 0),
        (T0["card_c1130"], "559388", 0, 0), (T0["card_c1240"], "640612", 0, 0), (T0["card_c0110"], "631933", 0, 0), (T0["card_c0135"], "164272", 50, -2),
        (T0["card_c0210"], "559388", 40, -6), (T0["card_c0314"], "865550", 0, 0), (T0["card_c0340"], "686659", 0, 1), (T0["66_item_final"], "345069", 20, 0)]
def loop_to(x, n, xf=int(2.0 * SR)):
    out = x.copy()
    while len(out) < n:
        a = out[-xf:] * np.linspace(1, 0, xf) + x[:xf] * np.linspace(0, 1, xf); out = np.concatenate([out[:-xf], a, x[xf:]])
    return out[:n]
mus = np.zeros(N); XF = int(1.0 * SR)
for i, (t, tid, off, gdb) in enumerate(CUES):
    t1 = CUES[i + 1][0] if i + 1 < len(CUES) else DUR
    a, b = int(t * SR), min(N, int(t1 * SR) + XF)
    x = load(TRK[tid], trim=False)[int(off * SR):]; x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.1   # mismo nivel RMS entre pistas
    seg = loop_to(x, b - a) * 10 ** (gdb / 20)
    if i > 0: seg[:XF] *= np.linspace(0, 1, XF)
    if b < N: seg[-XF:] *= np.linspace(1, 0, XF)
    mus[a:b] += seg
# cortes: YOU DIED de las celdas (en "end" hasta el plano siguiente) y antes del FOLLOW AVA RESTFIELD
yd0, yd1 = word("c3c", "end"), T0["48e_steel"]
g = np.ones(N); g[int(yd0 * SR):int(yd1 * SR)] = 0
fo = int(2.0 * SR); g[-fo:] *= np.linspace(1, 0, fo)   # v2 (usuario): la BGM sigue bajo la tarjeta final hasta el ultimo frame
g = uniform_filter1d(g, int(0.12 * SR)); mus *= g
put(sfx, BOOM, yd0, -6, maxlen=2.5)   # golpe del YOU DIED
env = np.zeros(N); H = int(0.02 * SR)
for i in range(0, N - H, H): env[i:i + H] = np.sqrt(np.mean(voice[i:i + H] ** 2))
spk = uniform_filter1d((env > 0.02).astype(float), int(0.25 * SR))
# v2 (usuario: "no se oye la musica"): nivel por medida -> la musica queda ~7 dB bajo la voz (RMS) y con el ducking de 2.5 dB
# ~9.5 dB mientras habla. Se mide en los tramos con voz y con musica.
act = spk > 0.5
v_rms = np.sqrt(np.mean(voice[act] ** 2)); m_rms = np.sqrt(np.mean(mus[act & (g > 0.5)] ** 2))
# v2b: por SONORIDAD (LUFS, ponderado K), no por RMS: las pistas oscuras son casi todo graves (centroide ~90 Hz) y con RMS
# quedaban 14 LU bajo la voz (inaudibles). Objetivo: musica ~6.5 LU bajo la voz sin ducking -> ~9 LU mientras habla.
mtr = pyln.Meter(SR); sel = act & (g > 0.5)
v_lu = mtr.integrated_loudness(voice[sel]); m_lu = mtr.integrated_loudness(mus[sel])
MUS_DB = v_lu - m_lu - 6.5
music = mus * 10 ** ((MUS_DB - 2.5 * np.clip(spk * 1.5, 0, 1)) / 20)
print("musica bajo la voz (LUFS, tramos con voz):", round(v_lu - mtr.integrated_loudness(music[sel]), 1), "LU")
# v3 (usuario): de 3:14 AM al final del capitulo 3:40 (risers 865550/686659) la BGM chocaba con la voz y los SFX -> ese tramo
# queda a ~12.5 LU bajo la voz (como se siente el resto), con fundidos de 1 s; fuera de el, igual que v2
a3, b3 = T0["card_c0314"], T0["66_item_final"]
w = np.zeros(N); w[int(a3 * SR):int(b3 * SR)] = 1; w = uniform_filter1d(w, int(1.0 * SR))
seg = sel.copy(); seg[:int(a3 * SR)] = False; seg[int(b3 * SR):] = False
d_now = mtr.integrated_loudness(voice[seg]) - mtr.integrated_loudness(music[seg])
music *= 10 ** (-(max(0.0, 12.5 - d_now)) * w / 20)
print(f"tramo 3:14-3:40: musica {mtr.integrated_loudness(voice[seg]) - mtr.integrated_loudness(music[seg]):.1f} LU bajo la voz (antes {d_now:.1f})")
voice = voice * 10 ** (1.5 / 20)   # v3 (usuario): voz +1.5 dB respecto a musica y SFX

# ---------- master estereo ----------
mix = voice + music + sfx * 0.9 + amb
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
for _ in range(3):
    lufs = meter.integrated_loudness(st(mix)); mix *= 10 ** ((-14 - lufs) / 20)
    lim = 10 ** (-3.0 / 20)   # margen para el true peak tras AAC
    if np.abs(mix).max() > lim:
        k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
print("LUFS", round(meter.integrated_loudness(st(mix)), 2), "peak dBFS", round(20 * np.log10(np.abs(mix).max()), 2), "dur", round(DUR, 2))
sf.write(f"{L}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice), ("music", music), ("sfx", sfx * 0.9), ("amb", amb)): sf.write(f"{L}/audio/stem_{name}.wav", x.astype(np.float32), SR)
used = sorted({k for k in LP})
json.dump({k: {kk: LP[k][kk] for kk in ("name", "user", "url")} for k in used}, open(f"{L}/audio/credits_sfx.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

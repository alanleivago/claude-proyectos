# mix3.py -> audio/mix.wav (+ stems), ep3 "The Police Station": voz (ava + policia, voz/track.wav) + musica oscura
# (music/music3.wav, scripts/music3.py) atenuada bajo la voz + lluvia de fondo + SFX en los eventos que exportan los
# sets (audio/sfx_events.json, engine/sfx_dump.mjs). SFX: Dino Crisis (assets/dino-crisis-sfx), zombis de RE
# (assets/zombie-sfx-yt), Freesound CC0 elegidos con earshot (audio/picks.json, CREDITS en LOG.md), kit CC0.
# Master -14 LUFS estereo, true peak <= -1 dBTP.
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
SR = 48000; DUR = 67.6; N = int(DUR * SR)
P = r"F:/Claude Proyectos/pieces/zombie-03-station"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
C2 = r"F:/Claude Proyectos/pieces/zombie-02-window/audio/cand"; KIT = r"F:/Claude Proyectos/sound-layer/kit"; ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"
_c = {}
def load(path, a=None, b=None, trim=True):
    k = (path, a, b, trim)
    if k not in _c:
        cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
        x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
        if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]
        f = int(0.004 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        _c[k] = x / (np.abs(x).max() + 1e-9)
    return _c[k]
sfx = np.zeros(N); amb = np.zeros(N)
def put(buf, x, t, db, fade_out=None, maxlen=None):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]
    if fade_out: f = min(len(x), int(fade_out * SR)); x[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR); j = min(N, i + len(x));
    if i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)
PK = {k: f"{P}/audio/{v}" for k, v in json.load(open(f"{P}/audio/picks.json")).items()}
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); RADIO = load(f"{DC}/kFNdZRE_0II.wav")
UNLOCK = load(f"{DC}/ch/door_and_gate_unlock.wav", 2.18, 3.0); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6)
SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2); ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
STEPS = load(f"{DC}/ch/walk_run_indoors.wav", 1.0, 3.2); KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)
ZMOAN = load(f"{ZS}/z08_110.4.wav"); ZSHOUT = load(f"{ZS}/z11_123.9.wav"); ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
GLASS = load(f"{C2}/glass_bang/104339.mp3"); SLAM = load(f"{C2}/door_slam/406626.mp3")
WHOOSH = load(f"{KIT}/whoosh/fs-109747-hit-with-swooshed-material-a-2.wav")
S = {k: load(v) for k, v in PK.items() if k != "rain"}
RAIN = load(PK["rain"], trim=False)
# nombre del evento -> (sonido, dB, maxlen)
MAP = {
 'type_key': (KEY, -12, None), 'zombie_moan': (ZMOAN, -20, 1.4), 'thunder_crack': (S['thunder'], -5, 3.0), 'thunder': (S['thunder'], -5, 3.0),
 'chain_rattle': (S['padlock'], -16, 0.5), 'padlock_click': (S['padlock'], -8, 0.5), 'glass_hit': (GLASS, -11, 0.5),
 'radio_static': (S['radio_static'], -24, 0.6), 'radio_beep': (S['radio_beep'], -40, 0.1), 'file_open': (INV, -10, None), 'menu_open': (INV, -10, None),
 'label_pop': (DEFAULT, -15, 0.5), 'label': (DEFAULT, -15, 0.5), 'examine_text': (DEFAULT, -16, 0.5), 'paper_tick': (DEFAULT, -21, 0.3), 'ui_tick': (DEFAULT, -20, 0.3),
 'door_unlock': (UNLOCK, -10, None), 'door_creak': (S['door_creak'], -7, 1.7), 'door_slam': (SLAM, -10, 0.8),
 'flashlight_click': (S['flashlight'], -12, 0.3), 'footstep': (S['steps'], -16, 0.3), 'cloth_shrug': (WHOOSH, -24, 0.4),
 'item_select': (DEFAULT, -14, 0.3), 'cursor_move': (DEFAULT, -12, 0.3), 'item_lift': (WHOOSH, -18, 0.5), 'counter_blink': (DEFAULT, -17, 0.4),
 'cooler_glug': (S['water_glug'], -12, 0.8), 'item_pop': (DEFAULT, -17, 0.4), 'total': (SUCCESS, -12, 0.9), 'check': (DEFAULT, -14, 0.5),
 'menu_select': (DEFAULT, -12, 0.5), 'paper': (WHOOSH, -24, 0.3), 'type_return': (KEY, -9, None), 'save_chime': (SUCCESS, -13, 0.9),
 'mag_out': (load(f"{C2}/mag_out/711555.mp3"), -12, None), 'mag_in': (load(f"{C2}/mag_in/815879.mp3", 0.0, 0.45), -10, None),
 'slide_rack': (load(f"{C2}/slide_rack/866514.mp3", 0.0, 0.7), -9, None),
 'clock_tick': (S['clock'], -14, 0.15), 'glass_knock': (S['glass_knock'], -7, 0.3), 'stamp': (S['stamp'], -8, 0.35),
 'light_clack': (S['switch'], -6, 0.3), 'fluorescent_hum_start': (S['fluor'], -13, 2.0),
}
EV = json.load(open(f"{P}/audio/sfx_events.json"))
miss = sorted({e[1] for e in EV if e[1] not in MAP and e[1] != 'rain_street_loop'}); print('sin mapa:', miss)
for t, name, _ in EV:
    if name == 'file_open' and 9 < t < 10: t = 10.0   # v4: primero la radio de Dino Crisis (9.35), luego el menu FILE
    if name in MAP: x, db, ml = MAP[name]; put(sfx, x, t, db, maxlen=ml, fade_out=0.05 if ml else None)
# HUD: entra de golpe con el plano 02 (radio de Dino Crisis) y alarma en cada cambio de estado
put(sfx, DEFAULT, 2.55, -14, maxlen=0.5)   # v3: el HUD entra con el sonido por defecto
put(sfx, RADIO, 9.35, -5, maxlen=0.65, fade_out=0.05)   # v3 (usuario): el pitido de radio de Dino Crisis suena cuando sale la radio
for t in (38.6, 51.85): put(sfx, ALARM, t, -14)   # v2: sin pitido en 7.6 (el usuario lo confundia con la radio de 9.35)
put(sfx, ZSHOUT, 7.7, -12, maxlen=0.75, fade_out=0.3); put(sfx, ZGROWL, 8.6, -15, maxlen=0.9, fade_out=0.3)   # 04 zombis en el cristal
put(sfx, ZGROAN, 52.3, -15, maxlen=1.2, fade_out=0.4)                                                        # 16 la cara de Vickers
# lluvia: fuerte fuera/en el vestibulo, baja en las salas, casi nada en las pantallas RE
rain = np.tile(RAIN, int(np.ceil(N / len(RAIN))) + 1)[:N]
lvl = np.full(N, -24.0)
for a, b, db in ((0, 2.55, -16), (9.35, 30.85, -33), (13.5, 15.3, -40), (17.2, 21.0, -40), (25.75, 30.85, -40), (34.2, 38.6, -34), (46.7, 51.85, -40), (60.7, 67.6, -30)):
    lvl[int(a * SR):int(b * SR)] = db
from scipy.ndimage import uniform_filter1d
amb = rain * 10 ** (uniform_filter1d(lvl, int(0.15 * SR)) / 20)
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15   # v2: voz mas alta (usuario); voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
mus = load(f"{P}/audio/cand/mus_thriller/345069.mp3", trim=False); mus = np.pad(mus, (0, max(0, N - len(mus))))[:N]   # v4: pista real CC0 (Freesound 345069, metrostock99), la sintetica no tenia presencia
fo = int(1.5 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
env = np.zeros(N); H = int(0.02 * SR)
for i in range(0, N - H, H): env[i:i + H] = np.sqrt(np.mean(voice[i:i + H] ** 2))
spk = np.convolve((env > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")
music = mus * 10 ** ((-13 - 2.5 * np.clip(spk * 1.5, 0, 1)) / 20)   # v3: casi sin bombeo bajo la voz (usuario: 'como si faltara por momentos')
mix = voice + music + sfx * 0.9 + amb
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
lufs = meter.integrated_loudness(st(mix)); mix *= 10 ** ((-14 - lufs) / 20)
pk = np.abs(mix).max(); lim = 10 ** (-1.2 / 20)
if pk > lim:
    from scipy.ndimage import minimum_filter1d
    k = int(0.005 * SR); g = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(g, size=2 * k + 1), size=k)
print('LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2))
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice), ("music", music), ("sfx", sfx * 0.9), ("amb", amb)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)

# mix.py -> audio/mix.wav (+ stems): voz (ava, timeline) + musica (music/music.wav, atenuada bajo la voz y cortada en los
# YOU DIED y en el hueco antes de la tarjeta, como la ref) + SFX en los momentos del montaje. SFX: Dino Crisis (pedido del
# usuario: assets/dino-crisis-sfx, sin monetizar), Freesound CC0 (audio/cand, CREDITS.md) y sound-layer kit (CC0).
# Master -14 LUFS integrado (la ref mide -14.0), true peak <= -1 dBTP.
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
SR = 48000; DUR = 55.1; N = int(DUR * SR)
P = r"F:/Claude Proyectos/pieces/zombie-02-window"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"; CAND = f"{P}/audio/cand"; KIT = r"F:/Claude Proyectos/sound-layer/kit"
_c = {}
def load(path, a=None, b=None, trim=True):
    k = (path, a, b, trim)
    if k not in _c:
        cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
        x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
        if trim:   # el cue cae en el ataque, no en el silencio inicial del archivo (el sonido por defecto traia 0,33 s)
            i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]
        f = int(0.004 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        _c[k] = x / (np.abs(x).max() + 1e-9)          # pico a 0 dBFS; la ganancia se pone al colocarlo
    return _c[k]
sfx = np.zeros(N); amb = np.zeros(N)
def put(buf, x, t, db, fade_out=None, maxlen=None):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]
    if fade_out: f = min(len(x), int(fade_out * SR)); x[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR); j = min(N, i + len(x)); buf[i:j] += x[:j - i] * 10 ** (db / 20)
WL = json.load(open(f"{P}/engine/timeline.json", encoding="utf-8"))["words"]
def WT(word, after=0.0): return next(w[1] for w in WL if w[4].lower().strip('…,.!?') == word and w[1] >= after)

# --- Dino Crisis ---
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); RADIO = load(f"{DC}/kFNdZRE_0II.wav")
UNLOCK = load(f"{DC}/ch/door_and_gate_unlock.wav", 2.18, 3.0)
INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6)
SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2)
ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
STEPS = load(f"{DC}/ch/walk_run_indoors.wav", 1.0, 3.2)
PUSH = load(f"{DC}/ch/push_wooden_metal_object.wav", 2.9, 7.0)
TYPE = load(f"{DC}/ch/bonus_2_rick_typing.wav", 1.0, 5.0)
VENT = load(f"{DC}/ch/bonus_3_ventilation_ambiance.wav", 1.0, 18.0, trim=False)
KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)   # una tecla (pulsar + soltar)
# --- Freesound CC0 / kit ---
BURST = load(f"{CAND}/door_burst/160213.mp3"); GROWL = load(f"{CAND}/zombie_groan/754440.mp3"); GROAN = load(f"{CAND}/zombie_groan/196723.mp3")
FALL = load(f"{CAND}/body_fall/346692.mp3"); DRILL = load(f"{CAND}/drill_screw/871631.mp3"); DRILL2 = load(f"{CAND}/drill_screw/873413.mp3")
GLASS = load(f"{CAND}/glass_bang/104339.mp3"); POUND = load(f"{CAND}/door_pound/587930.mp3"); CLANK = load(f"{CAND}/metal_bar_clank/835169.mp3")
ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"   # zombis de Resident Evil (pedido del usuario: video 4JCoB0GUIVs desde 1:20)
ZSHOUT = load(f"{ZS}/z11_123.9.wav"); ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
ZMOAN = load(f"{ZS}/z08_110.4.wav"); ZMOAN2 = load(f"{ZS}/z06_104.9.wav"); ZMOAN3 = load(f"{ZS}/z01_83.0.wav")
MAGOUT = load(f"{CAND}/mag_out/711555.mp3"); MAGIN = load(f"{CAND}/mag_in/815879.mp3", 0.0, 0.45)
RACK = load(f"{CAND}/slide_rack/866514.mp3", 0.0, 0.35); RACK2 = load(f"{CAND}/slide_rack/866514.mp3", 0.36, 0.7)
BOOM = load(f"{KIT}/boom/fs-539968-deep-boom-3.wav"); BOOM2 = load(f"{KIT}/boom/fs-636624-deep-hit-2.wav")

# --- ep2 (Freesound CC0, elegidos con earshot rank) ---
HAMMER = load(f"{CAND}/hammer_nail/394891.mp3")
SPRAY = load(f"{CAND}/water_spray/411811.mp3", trim=False); PBURST = load(f"{CAND}/pipe_burst/186926.mp3")
THUNK = load(f"{CAND}/wood_thunk/803551.mp3"); KNOCK = load(f"{CAND}/knock_wood/865361.mp3")
WHOOSH = load(f"{KIT}/whoosh/fs-109747-hit-with-swooshed-material-a-2.wav")

# ------------------------------------------------------------------ cues (s globales, = tiempos de sets/*.js y film.js)
put(amb, np.tile(VENT, 4), 0.0, -30)                                   # cuarto de maquinas de fondo (Dino Crisis)
put(sfx, MAGOUT, 0.24, -12); put(sfx, MAGIN, 0.96, -10); put(sfx, RACK, 1.16, -10); put(sfx, RACK2, 1.33, -9)   # 01 recarga (frames 8/30/36/40)
for t in (0.48, 1.74, 3.15, 3.74, 5.00, 5.96, 7.21): put(sfx, GLASS if t < 3 else POUND, t, -13 if t < 3 else -15, maxlen=0.5)   # golpes = room.js WIN_HITS (la ventana tiembla)
put(sfx, ZMOAN, 0.3, -20, maxlen=1.6, fade_out=0.4)            # 01 zombi en el cristal
for k in range(5): put(sfx, HAMMER, 2.3 + 7 / 30 + 0.4 * k, -9 - (k % 2), maxlen=0.28, fade_out=0.08)    # 02 martillazos (room.js hit(k))
for k in (0, 2, 4): put(sfx, THUNK, 2.3 + 7 / 30 + 0.4 * k + 0.02, -15, maxlen=0.4)                      # cada tabla que entra
put(sfx, WHOOSH, WT('movies') - 0.15, -14, maxlen=0.6)                 # pose de pelicula
put(sfx, RADIO, 2.3, -10)                                              # entra el HUD de golpe con el corte (film.js HUD_T0)
put(sfx, ALARM, 5.4, -15)                                              # HUD a CAUTION
put(sfx, THUNK, WT('twice'), -9, maxlen=0.5); put(sfx, ZGROAN, 5.6, -21, fade_out=0.3)   # 03 la tabla de abajo cede
put(sfx, ALARM, 7.4, -12)                                              # HUD a DANGER
for k, t in enumerate((7.70, 8.15, 8.60, 9.00)): put(sfx, POUND, t, -14 + (k % 2), maxlen=0.35)   # 04 = room.js WIN_HITS
put(sfx, ZSHOUT, 7.5, -10, fade_out=0.3, maxlen=0.75); put(sfx, ZGROWL, 8.5, -14, maxlen=0.9, fade_out=0.3)
put(sfx, DEFAULT, WT('nails'), -16, maxlen=0.5); put(sfx, DEFAULT, WT('friction'), -16, maxlen=0.5)   # 05 etiquetas
put(sfx, PUSH[::-1].copy(), WT('friction') + 0.05, -14, maxlen=0.4, fade_out=0.1)                     # el clavo se sale
put(sfx, ZGROWL, 14.05, -12, maxlen=0.9, fade_out=0.3)                 # 06 el zombi detras de ella
put(sfx, BOOM2, 14.55, -3)                                             # 07 YOU DIED... again
put(sfx, INV, 17.2, -8); put(sfx, TYPE, 17.28, -14, maxlen=2.3, fade_out=0.2)   # 08 EXAMINE + tecleo de Rick
for w in ('four', 'every', 'studs'): put(sfx, DEFAULT, WT(w, 19.8), -16, maxlen=0.5)   # 09 cotas y etiquetas
put(sfx, DEFAULT, WT('trim'), -14, maxlen=0.5)
for t in (WT('screws', 25), WT('nails', 26), WT('twelve')): put(sfx, DRILL, t, -11, maxlen=0.45, fade_out=0.1)   # 10 taladro
put(sfx, ALARM, 28.2, -15); put(sfx, DEFAULT, WT('which'), -16, maxlen=0.5)                            # 11 HUD a CAUTION, which side
put(sfx, WHOOSH, WT('inside', 30), -16, maxlen=0.5); put(sfx, POUND, WT('push', 31), -12, maxlen=0.35)
put(sfx, FALL, WT('screws', 31.5) - 0.1, -12); put(sfx, DEFAULT, WT('screws', 31.5), -16, maxlen=0.5)   # salta de los tornillos
put(sfx, WHOOSH, WT('outside', 33), -16, maxlen=0.5); put(sfx, POUND, WT('push', 33.5), -12, maxlen=0.35)
put(sfx, SUCCESS, WT('wall', 34), -12, maxlen=0.9)                     # la pared aguanta
put(sfx, ZMOAN, 37.15, -9, maxlen=1.9, fade_out=0.4); put(sfx, ZMOAN2, 37.6, -12, maxlen=1.4, fade_out=0.3)   # 13 horda
put(sfx, ZMOAN3, 38.0, -13, maxlen=1.2, fade_out=0.3); put(sfx, STEPS, 37.2, -16, maxlen=1.9, fade_out=0.3)
put(sfx, THUNK, WT('brace'), -8, maxlen=0.5)                           # 15 el puntal encaja
put(sfx, KNOCK, WT('door') + 0.02, -9, maxlen=0.6); put(sfx, RADIO, 44.2, -14)   # toc toc + HUD a FINE
put(sfx, SUCCESS, 44.62, -7)                                           # 16 CONGRATULATIONS
put(sfx, PBURST, 48.7, -5); put(sfx, SPRAY, 48.72, -11, maxlen=3.85, fade_out=0.3)   # 17/19 revienta la tuberia y sigue el chorro
put(sfx, BOOM, 52.6, -3)                                               # 20 tarjeta: una tecla por letra (film.js endCard)
for k in range(1, 6): put(sfx, KEY, 52.6 + k / 14, -12)               # NEXT:
for k in range(1, 7): put(sfx, KEY, 52.6 + 0.6 + k / 12, -10)         # WATER.
put(sfx, DEFAULT, 52.6 + 1.5 + 1 / 30, -14, maxlen=0.6)               # FOLLOW AVA RESTFIELD!

# ------------------------------------------------------------------ voz + musica
voice = load(f"{P}/voz/track.wav", trim=False) * 0.89; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
mus = load(f"{P}/audio/music/music.wav", trim=False); mus = np.pad(mus, (0, max(0, N - len(mus))))[:N]
env = np.zeros(N); H = int(0.02 * SR)
for i in range(0, N - H, H): env[i:i + H] = np.sqrt(np.mean(voice[i:i + H] ** 2))
spk = np.convolve((env > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")   # habla, suavizada
gain = 10 ** ((-14 - 6 * np.clip(spk * 1.5, 0, 1)) / 20)                # musica ~7 dB bajo la voz, mas abajo mientras habla
for a, b in ((14.55, 17.2), (52.3, 52.6)):                          # cortes: YOU DIED y el hueco antes de la tarjeta
    i, j = int(a * SR), int(b * SR); f = int(0.04 * SR); gain[i:j] = 0; gain[i - f:i] *= np.linspace(1, 0, f)
    gain[j:j + int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
music = mus * gain
for a, b in ((14.55, 17.2),): amb[int(a * SR):int(b * SR)] *= 0.3
mix = voice + music + sfx * 0.9 + amb
# huecos quitados = film.js CUTS_T (corcheas a 111 BPM), de atras hacia delante, con fundido de 30 ms
for c0, c1 in reversed([(16.0, 16.0 + 3 * 30 / 111)]):   # = film.js CUTS_T
    i, j, f = int(c0 * SR), int(c1 * SR), int(0.03 * SR)
    mix = np.concatenate([mix[:i], mix[i:i + f] * np.linspace(1, 0, f) + mix[j:j + f] * np.linspace(0, 1, f), mix[j + f:]])
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)            # se entrega en estereo: se mide en estereo (mono suena +3 dB)
lufs = meter.integrated_loudness(st(mix)); mix *= 10 ** ((-14 - lufs) / 20)
pk = np.abs(mix).max(); lim = 10 ** (-1.2 / 20)
if pk > lim:   # limitador simple: ganancia minima en +-5 ms, suavizada
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    k = int(0.005 * SR); g = np.minimum(1, lim / (np.abs(mix) + 1e-9))
    mix *= uniform_filter1d(minimum_filter1d(g, size=2 * k + 1), size=k)
print('LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2))
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice), ("music", music), ("sfx", sfx * 0.9), ("amb", amb)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)

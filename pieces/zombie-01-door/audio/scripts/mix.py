# mix.py -> audio/mix.wav (+ stems): voz (ava, timeline) + musica (music/music.wav, atenuada bajo la voz y cortada en los
# YOU DIED y en el hueco antes de la tarjeta, como la ref) + SFX en los momentos del montaje. SFX: Dino Crisis (pedido del
# usuario: assets/dino-crisis-sfx, sin monetizar), Freesound CC0 (audio/cand, CREDITS.md) y sound-layer kit (CC0).
# Master -14 LUFS integrado (la ref mide -14.0), true peak <= -1 dBTP.
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
SR = 48000; DUR = 49.0; N = int(DUR * SR)
P = r"F:/Claude Proyectos/pieces/zombie-01-door"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"; CAND = f"{P}/audio/cand"; KIT = r"F:/Claude Proyectos/sound-layer/kit"
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
W = {w[4].lower().strip('…,.'): w for w in json.load(open(f"{P}/engine/timeline.json", encoding="utf-8"))["words"]}

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

# ------------------------------------------------------------------ cues (s globales, sincronizados al montaje)
put(amb, np.tile(VENT, 4), 0.0, -30)                                   # cuarto de maquinas de fondo (Dino Crisis)
put(sfx, MAGOUT, 0.24, -12); put(sfx, MAGIN, 0.96, -10); put(sfx, RACK, 1.16, -10); put(sfx, RACK2, 1.33, -9)   # 01 recarga (frames 8/30/36/40)
put(sfx, UNLOCK, 2.24, -8)                                             # 02 gira el pestillo
put(sfx, RADIO, 3.70, -10)                                             # 03 destello: entra el HUD (pitido de radio)
for t in (W['lock'][1], W['screws'][1], W['screws'][1] + 0.55, W['reach'][1], W['wall'][1]): put(sfx, DEFAULT, t, -16, maxlen=0.5)   # etiquetas 04
put(sfx, ALARM, 6.78, -12)                                             # HUD a DANGER
put(sfx, ZGROAN, 8.9, -19, fade_out=0.3)                             # 05 gimen al otro lado            # 05 golpes al otro lado
put(sfx, BURST, 10.18, -3); put(sfx, ZSHOUT, 10.35, -7, fade_out=0.3, maxlen=0.75)                     # 06 revientan la puerta
for k, t in enumerate((8.82, 9.25, 9.55, 9.85, 10.05)): put(sfx, POUND, t, -16 + k, maxlen=0.4)        # 05 = hall.js THUMPS
for t, db in ((29.35, -17), (29.95, -16), (30.7, -17), (31.35, -16), (32.35, -18), (33.0, -18), (33.7, -19), (38.1, -14), (38.55, -15), (39.05, -16)):
    put(sfx, POUND, t, db, maxlen=0.4)                                 # 16/17/19: siguen empujando
put(sfx, ZMOAN2, 29.6, -21, maxlen=1.5, fade_out=0.4); put(sfx, ZGROWL, 38.3, -20, maxlen=0.9, fade_out=0.3)
put(sfx, BOOM, 11.0, -2)                                               # 07 YOU DIED
put(sfx, STEPS, 12.75, -12, maxlen=0.8, fade_out=0.15); put(sfx, PUSH, 13.35, -9, maxlen=1.35, fade_out=0.2)   # 08 camina y empuja el sofa
put(sfx, POUND, 15.22, -6, maxlen=0.5); put(sfx, PUSH[::-1].copy(), 15.35, -7, maxlen=0.55, fade_out=0.15); put(sfx, FALL, 15.82, -5)  # 09 resbala y cae
put(sfx, BOOM2, 19.6, -3)                                              # 11 YOU DIED... again
put(sfx, INV, 21.0, -8); put(sfx, TYPE, 21.08, -14, maxlen=2.3, fade_out=0.2)                       # 12 EXAMINE + tecleo de Rick
put(sfx, DRILL, 24.0, -11, maxlen=0.65, fade_out=0.1); put(sfx, DRILL, 25.05, -11, maxlen=0.55, fade_out=0.1)   # 13/14 tornillos
put(sfx, DEFAULT, W['they'][1], -16, maxlen=0.5); put(sfx, DRILL2, W['bite'][1], -12, maxlen=0.9, fade_out=0.15)   # 15 entran al montante
put(sfx, DEFAULT, W['bones'][1] + 0.2, -16, maxlen=0.5); put(sfx, ALARM, 26.8, -15)                 # etiqueta + HUD a CAUTION
put(sfx, load(f"{KIT}/whoosh/fs-109747-hit-with-swooshed-material-a-2.wav"), 32.3, -14, maxlen=0.6)   # 17 balanceo de la barra
put(sfx, CLANK, 33.45, -6)                                             # 17 la barra contra el suelo
for k, t in enumerate((34.8, 35.45, 36.1, 36.75, 37.4)): put(sfx, POUND, t, -15 - k * 0.5, maxlen=0.35)
put(sfx, ZMOAN3, 35.0, -19, maxlen=2.6, fade_out=0.5)   # 18 empujan
put(sfx, DEFAULT, W['push'][1], -16, maxlen=0.5); put(sfx, DEFAULT, W['digs'][1], -16, maxlen=0.5)
put(sfx, SUCCESS, 38.02, -7)                                           # 19 CONGRATULATIONS (desbloqueo)
put(sfx, GLASS, 42.25, -6, maxlen=1.6); put(sfx, ZMOAN, 42.4, -10, maxlen=1.9, fade_out=0.4); put(sfx, ZMOAN2, 43.2, -15, maxlen=1.1, fade_out=0.3)      # 21 zombis en la ventana
put(sfx, GLASS, 44.3, -9, maxlen=1.2); put(sfx, ZGROWL, 44.8, -13, maxlen=0.9, fade_out=0.3)        # 22
put(sfx, BOOM, 46.42, -3)                                              # 23 tarjeta: una tecla por letra (film.js endCard)
for k in range(1, 6): put(sfx, KEY, 46.4 + k / 14, -12)               # NEXT:
for k in range(1, 9): put(sfx, KEY, 46.4 + 0.6 + k / 12, -10)         # WINDOWS.
put(sfx, DEFAULT, 46.4 + 1.5 + 1 / 30, -14, maxlen=0.6)               # AVA BREAD   # 23 tarjeta

# ------------------------------------------------------------------ voz + musica
voice = load(f"{P}/voz/track.wav", trim=False) * 0.89; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
mus = load(f"{P}/audio/music/music.wav", trim=False); mus = np.pad(mus, (0, max(0, N - len(mus))))[:N]
env = np.zeros(N); H = int(0.02 * SR)
for i in range(0, N - H, H): env[i:i + H] = np.sqrt(np.mean(voice[i:i + H] ** 2))
spk = np.convolve((env > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")   # habla, suavizada
gain = 10 ** ((-14 - 6 * np.clip(spk * 1.5, 0, 1)) / 20)                # musica ~7 dB bajo la voz, mas abajo mientras habla
for a, b in ((11.0, 12.7), (19.6, 21.0), (45.75, 46.42)):              # cortes de la ref: YOU DIED y el hueco antes de la tarjeta
    i, j = int(a * SR), int(b * SR); f = int(0.04 * SR); gain[i:j] = 0; gain[i - f:i] *= np.linspace(1, 0, f)
    gain[j:j + int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
music = mus * gain
for a, b in ((11.0, 12.7), (19.6, 21.0)): amb[int(a * SR):int(b * SR)] *= 0.3
mix = voice + music + sfx * 0.9 + amb
# huecos quitados = film.js CUTS_T (corcheas a 111 BPM), de atras hacia delante, con fundido de 30 ms
for c0, c1 in reversed([(5.95, 5.95 + 3 * 30 / 111), (18.98, 18.98 + 2 * 30 / 111)]):
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

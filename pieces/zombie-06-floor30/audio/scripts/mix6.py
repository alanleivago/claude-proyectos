# mix6.py -> audio/mix.wav (+ stems), ep6 "Floor 30": voz (voz/track.wav) + BGM CC0 continua medida por LUFS (~11 LU bajo la voz)
# + capa de terror del gancho (0-10 s, como mix5) + ambiente (ciudad de noche / room tone) + SFX reales (Freesound CC0 elegidos
# con earshot rank, Dino Crisis) en su fotograma. Tiempos: engine/cues.json. Master -14 LUFS estereo, TP <= -1 dBTP. python mix6.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-06-floor30"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
CU = json.load(open(f"{P}/engine/cues.json", encoding="utf8")); W, T = CU["W"], CU["T"]; DUR = CU["END"]; N = int(DUR * SR); VEND = CU["VOICE_END"]
PICK = json.load(open(f"{P}/audio/pick_sfx.json", encoding="utf8"))   # {clave: [archivo, credito]} (earshot rank)
def load(path, a=None, b=None, trim=True, norm=True):
    cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
    if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]   # sin silencio inicial
    f = int(0.004 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x / (np.abs(x).max() + 1e-9) if norm else x
def hits(x, n=12, ln=0.3, thr=0.15):   # golpes sueltos cortados en los ataques
    H = int(0.01 * SR); e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    on, out, last = np.where((e[1:] > 3 * e[:-1] + 1e-4) & (e[1:] > thr * e.max()))[0], [], -99
    for k in on:
        if k - last < 18: continue
        last = k; s = x[max(0, k * H - int(0.005 * SR)):k * H + int(ln * SR)].copy(); g = int(0.06 * SR); s[-g:] *= np.linspace(1, 0, g); out.append(s / np.abs(s).max())
        if len(out) >= n: break
    return out
sfx = np.zeros(N); amb = np.zeros(N)
def put(buf, x, t, db, maxlen=None, fade=0.05, fin=0.0):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]; f = min(len(x), int(fade * SR)); x[-f:] *= np.linspace(1, 0, f)
    if fin: f = min(len(x), int(fin * SR)); x[:f] *= np.linspace(0, 1, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)
S = {k: load(f"{C}/{v[0]}", trim=k not in ("tap_fill", "tap_bucket", "fridge_hum", "city_night", "room_tone", "pencil", "furniture_drag")) for k, v in PICK.items()}
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6)
ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1); KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)
PUSH = load(f"{DC}/ch/push_wooden_metal_object.wav", trim=True)
WALK = hits(load(f"{DC}/ch/walk_run_indoors.wav", trim=False, norm=True))
STEP = hits(S["steps_hall"], 12) if "steps_hall" in S else WALK
KNOCK = hits(S["knock"], 6, 0.35) if "knock" in S else []
def steps(t0, t1, period, db, src, k0=0):
    t, i = t0, k0
    while t < t1: put(sfx, src[i % len(src)], t, db + (-2 if i % 2 else 0)); t += period; i += 1
ease = lambda a, b, x: (lambda u: u * u * (3 - 2 * u))(min(1, max(0, (x - a) / (b - a))))
# ---------------- eventos ----------------
put(sfx, S["whoosh"], 0.05, -14, fin=0.05); put(sfx, S["whoosh"], 3.4, -19)                     # 01 la grua sube / llega a la ventana
put(sfx, S["stinger"], W["tonight"] - 0.05, -14, maxlen=2.4, fade=1.0)                          # "until tonight"
steps(T["door"] + 0.05, T["alert"] - 0.05, 0.42, -16, WALK)                                      # 02 POV hasta la puerta 3012
put(sfx, DEFAULT, T["door"], -15, maxlen=0.5)                                                    # HUD entra
put(sfx, S["eas_alert"], T["alert"] + 0.1, -17, maxlen=min(3.0, T["water"] - T["alert"] - 0.2), fade=0.5)   # EMERGENCY ALERT
put(sfx, ALARM, T["alert"] + 0.5, -15)                                                           # HUD CAUTION
D3 = T["item"] - T["water"]
put(sfx, S["tap_fill"], T["water"], -19, maxlen=D3 + 0.2, fade=0.4, fin=0.2)                    # 03 el cano llena la banera
if False: put(sfx, S["tap_bucket"], W["bucket"] - 0.5, -21, maxlen=T["item"] - W["bucket"] + 0.6, fade=0.4, fin=0.2)
for k in ("pumps", "bucket", "forty"): put(sfx, DEFAULT, W[k] - (0 if k != "forty" else 0.1), -16, maxlen=0.4)
put(sfx, INV, T["item"], -10)                                                                     # 04 ITEM
for i in range(4): put(sfx, DEFAULT, T["item"] + 0.1 + i * 0.12, -22, maxlen=0.3)
put(sfx, DEFAULT, W["splits"], -14, maxlen=0.4); put(sfx, ALARM, W["splits"] + 0.05, -20)         # RATION 1/DAY, 12 DAYS
d0, d1 = W["dark"] - T["city"], W["building"] - T["city"]                                         # 05 la ciudad se apaga por bloques
for i in range(7):
    ts = [T["city"] + (d0 - 0.2) + (d1 + 0.3 - d0) * x / 400 for x in range(401)]
    tt = next((t for t in ts if ease(d0 - 0.2, d1 + 0.1, t - T["city"]) * 7.2 > i + 0.5), None)
    if tt: put(sfx, S["block_off"], tt, -19 - (6 - i) * 0.8, maxlen=0.6, fade=0.3)
put(sfx, S["fridge_hum"], T["city"] - 0.2, -27, maxlen=T["fridge"] + 0.25 - T["city"] + 0.2, fade=0.06, fin=0.3)   # la nevera zumba y se corta
put(sfx, S["power_down"], T["fridge"] + 0.15, -11, maxlen=1.4, fade=0.6)                          # el apartamento se apaga
put(sfx, DEFAULT, W["dies"] - 0.1, -16, maxlen=0.4)
tj = T["fridge"] + (T["tap"] - T["fridge"]) - 0.75
if "clock_tick" in S: put(sfx, S["clock_tick"], tj - 0.3, -18, maxlen=0.4, fade=0.1)              # el reloj salta
put(sfx, S["whoosh"], tj - 0.3, -20)
if "faucet_squeak" in S: put(sfx, S["faucet_squeak"], W["faucet"] + 0.05, -14, maxlen=0.7)        # 06 el grifo
put(sfx, S["drip"], W["nothing"] - 0.35 + 0.48, -12, maxlen=0.5)
put(sfx, DEFAULT, W["nothing"], -16, maxlen=0.4); put(sfx, DEFAULT, W["power"] - 0.1, -17, maxlen=0.4)
put(sfx, S["stinger"], W["thirty"] - 0.1, -19, maxlen=1.6, fade=0.8)                             # NO POWER
put(sfx, S["pencil"], W["fema"] - 0.1, -17, maxlen=W["forty7"] + 0.7 - W["fema"], fade=0.3, fin=0.1)   # 07 escribe en el cuaderno
put(sfx, ALARM, W["eighteen"] - 0.1, -17)                                                         # bateria 18 %
put(sfx, PUSH, T["barricade"] + 0.2, -10, maxlen=T["steps"] - T["barricade"] - 0.2, fade=0.4)    # 08 la comoda contra la puerta
if "furniture_drag" in S: put(sfx, S["furniture_drag"], T["barricade"] + 0.25, -17, maxlen=T["steps"] - T["barricade"] - 0.4, fade=0.4)
steps(W["footsteps"] - 0.25, W["stop"] - 0.05, 0.55, -18, STEP)                                   # 09 pasos en el pasillo... se paran
put(sfx, ALARM, W["footsteps"], -15)                                                              # HUD DANGER
put(sfx, S["whoosh"], W["stop"] - 0.15, -15)                                                      # whip a la puerta
steps(T["peep"] + 0.3, T["peep"] + 2.6, 0.7, -21, STEP, 3)                                        # 10 se acerca desde lo oscuro
put(sfx, S["stinger"], W["eleven"] - 0.05, -12, maxlen=2.5, fade=1.0)
for i in range(3): put(sfx, KNOCK[i % len(KNOCK)] if KNOCK else DEFAULT, W["knock"] + i * 0.28, -8)   # golpes
s = "PLEASE...  I JUST NEED WATER."
for i, ch in enumerate(s):
    if ch not in " .": put(sfx, KEY, W["knock"] + 0.25 + (i + 1) / 20, -17)
put(sfx, S["stinger"], W["fudge"] - 0.05, -18, maxlen=1.2, fade=0.6)                              # 11 fudge
put(sfx, INV, T["choice"], -11)                                                                   # 12 menu
put(sfx, DEFAULT, W["open"] - 0.2, -14, maxlen=0.4); put(sfx, DEFAULT, W["quiet"] - 0.2, -14, maxlen=0.4); put(sfx, DEFAULT, W["comment"], -15, maxlen=0.4)
for i, ch in enumerate("MOST COMMENTS DECIDE PART 2."):
    if ch != " ": put(sfx, KEY, W["most"] + (i + 1) / 20, -16)
put(sfx, DEFAULT, VEND + 0.3, -14, maxlen=0.5)                                                   # FOLLOW FOR MORE!
# ---------------- ambiente: ciudad de noche fuera (gancho y ventana) + room tone dentro ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
city = loop(S["city_night"]); room = loop(S["room_tone"])
lc = np.zeros(N); lc[:int(T["door"] * SR)] = 1; lc[int(T["city"] * SR):int(T["fridge"] * SR)] = 0.8; lc[int(T["fridge"] * SR):] = 0.25   # tras el apagon la ciudad queda lejana
lr = np.ones(N) * 0.8; lr[:int(T["door"] * SR)] = 0.2; lr[int(T["item"] * SR):int(T["city"] * SR)] = 0.3; lr[int((T["fridge"] + 0.2) * SR):] = 0.55
lc, lr = uniform_filter1d(lc, int(0.25 * SR)), uniform_filter1d(lr, int(0.25 * SR))
amb = city * 10 ** (-24 / 20) * lc + room * 10 ** (-30 / 20) * lr
# ---------------- voz y musica (por LUFS, 11 LU bajo la voz, continua hasta el final) ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C}/mus_ep4/610534.mp3", trim=False); mus = np.tile(mus, int(np.ceil(N / len(mus))) + 1)[:N] if len(mus) < N else mus[:N]
fo = int(1.0 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 11 - mL) / 20)
HK = int(10.8 * SR); hook = np.zeros(N)                                                           # capa de terror del gancho (mix5)
drone = load(f"{C}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{C}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
env = np.clip(np.arange(N) / (0.4 * SR), 0, 1) * np.clip((10.6 * SR - np.arange(N)) / (2.2 * SR), 0, 1); hook *= env
win = slice(int(0.3 * SR), int(8.0 * SR)); vW = meter.integrated_loudness(st(voice[win])); hW = meter.integrated_loudness(st(hook[win]))
hook *= 10 ** ((vW - 12 - hW) / 20)
mix = voice + music + hook + sfx * 0.9 + amb
lufs = meter.integrated_loudness(st(mix)); g = 10 ** ((-14 - lufs) / 20); mix *= g
pk = np.abs(mix).max(); lim = 10 ** (-1.5 / 20)
if pk > lim:
    k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
print('gancho: voz+BGM 0-8 s', round(vW - meter.integrated_loudness(st((music + hook)[win])), 1), 'LU bajo; musica', round(vL - meter.integrated_loudness(st(music)), 1), 'LU bajo la voz')
print('mix LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2), 'dur', DUR)
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", (music + hook) * g), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
CRED = {k: v[1] for k, v in PICK.items()}
CRED.update({"610534 Dark Sad Mood Orchestra Synth (BGM)": "szegvari", "799307 Ambient Drone (gancho)": "CVLTIV8R", "712798 Scary Music Box (gancho)": "Antenalosmusic", "Dino Crisis SFX": "Capcom (no monetizado)"})
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

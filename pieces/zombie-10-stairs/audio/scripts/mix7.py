# mix7.py -> audio/mix.wav (+ stems), ep7 "The Safe Room": voz (voz/track.wav) + BGM CC0 continua medida por LUFS (~11 LU bajo la voz)
# + capa de terror del gancho (0-10 s, como mix5) + ambiente (ciudad de noche / room tone) + SFX reales (Freesound CC0 elegidos
# con earshot rank, Dino Crisis) en su fotograma. Tiempos: engine/cues.json. Master -14 LUFS estereo, TP <= -1 dBTP. python mix7.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-07-saferoom"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
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
S = {k: load(f"{C}/{v[0]}", trim=k not in ("wind", "room_tone")) for k, v in PICK.items()}
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6)
ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1); KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)
SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2)
ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"; ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
GL = hits(S["glass"], 6, 0.35, 0.08) or [S["glass"][:int(0.35 * SR)]]; TH = hits(S["thunk"], 4, 0.4, 0.05) or [S["thunk"][:int(0.4 * SR)]]; KN = hits(S["knock_wood"], 6, 0.35, 0.08) or hits(S["knock"], 6, 0.35)
ease = lambda a, b, x: (lambda u: u * u * (3 - 2 * u))(min(1, max(0, (x - a) / (b - a))))
def typed(t0, text, rate, db=-17):
    for i, ch in enumerate(text):
        if ch not in " ": put(sfx, KEY, t0 + i / rate, db)
# ---------------- eventos (tiempos = los mismos que los planos, cues.json) ----------------
put(sfx, S["whoosh"], 0.05, -14, fin=0.05); put(sfx, S["whoosh"], 2.0, -19)                         # 01 grua
put(sfx, S["stinger"], W["house"] - 0.05, -17, maxlen=2.0, fade=1.0)
for i, t in enumerate(W["crane_hits"]): put(sfx, KN[i % len(KN)], t, -8 if t < 1.6 else -13); put(sfx, TH[i % len(TH)], t, -15 if t < 1.6 else -19)   # v4: zombis golpean la puerta de entrada (solo la puerta cede)
put(sfx, ZGROWL, 0.15, -12, maxlen=1.8, fade=0.5); put(sfx, ZGROAN, 1.9, -18, maxlen=2.0, fade=0.6); put(sfx, ZGROWL, 3.9, -21, maxlen=1.5, fade=0.6)
put(sfx, DEFAULT, T["02_living"], -15, maxlen=0.5); put(sfx, ALARM, W["biggest"], -15)              # 02 HUD entra / CAUTION
for t in (W["three2"], W["three2"] + 0.26, W["three2"] + 0.52, W["two2"], W["two2"] + 0.28): put(sfx, DEFAULT, t, -13, maxlen=0.4)   # cada destello rojo
HITS = [W["window3"] - 0.05, W["door3"] - 0.05, W["them3"] + 0.05, W["them3"] + 0.45]            # 03 la ventana del ep2 (zombi)
put(sfx, ZGROWL, T["03_window"] + 0.05, -13, maxlen=1.8, fade=0.4)
for i, t in enumerate(HITS): put(sfx, GL[i % len(GL)], t, -9); put(sfx, TH[i % len(TH)], t, -14)
put(sfx, ALARM, W["door3"], -14)
put(sfx, S["stinger"], T["03_died"], -10, maxlen=1.8, fade=0.8); put(sfx, ZGROAN, T["03_died"] + 0.3, -17, maxlen=1.5, fade=0.6)   # YOU DIED
put(sfx, INV, T["04_plan"], -11)                                                                    # 04 MAP
for k in ("small", "onedoor", "nowin", "middle", "bathroom", "closet"): put(sfx, DEFAULT, W[k], -15, maxlen=0.4)
put(sfx, S["whoosh"], T["04_bath"] - 0.15, -19); put(sfx, DEFAULT, W["ready"], -14, maxlen=0.4)
put(sfx, S["whoosh"], T["05_door"] - 0.15, -20)                                                     # 05 puerta
put(sfx, S["drill"], W["screws"] - 0.25, -12, maxlen=W["stud"] + 0.25 - W["screws"] + 0.25, fade=0.15)
put(sfx, DEFAULT, W["inch"], -15, maxlen=0.4); put(sfx, DEFAULT, W["stud"], -14, maxlen=0.4)
put(sfx, S["clank"], W["bar"] - 0.05, -13, maxlen=0.8); put(sfx, TH[0], W["bar"] - 0.05, -12)
put(sfx, SUCCESS, W["know"] - 0.05, -18, maxlen=1.0, fade=0.4)                                       # HUD FINE
put(sfx, INV, T["06_item"], -10)                                                                    # 06 ITEM
for k in ("water", "food", "flashlight", "batteries", "radio", "charger"):
    put(sfx, DEFAULT, W[k], -16, maxlen=0.35); put(sfx, S["item_drop"], W[k] + 0.55, -15, maxlen=0.5)
put(sfx, S["chest_close"], W["chest"] - 0.02, -9, maxlen=1.0)
put(sfx, TH[1 % len(TH)], W["fema"], -12); put(sfx, SUCCESS, W["fema"] + 0.05, -18, maxlen=1.0, fade=0.4)   # sello READY.GOV KIT
put(sfx, S["item_drop"], W["packing"] - 0.2, -18, maxlen=0.5)                                      # 07 empaca
put(sfx, S["cut"], W["cut"] - 0.03, -10, maxlen=0.5); put(sfx, S["stinger"], W["cut"], -13, maxlen=1.4, fade=0.7); put(sfx, ALARM, W["cut"] + 0.05, -14)
put(sfx, S["aerosol"], W["spray"], -11, maxlen=min(1.2, W["bandage"] - W["spray"] - 0.05), fade=0.15)
put(sfx, S["bandage"], W["bandage"], -12, maxlen=0.9, fade=0.3)
put(sfx, INV, T["07_examine"], -12); put(sfx, DEFAULT, W["fifteen"], -14, maxlen=0.4)
put(sfx, S["heal"], W["heal"] - 0.03, -8, maxlen=1.6, fade=0.6)                                       # cura -> FINE
typed(W["day"] - 0.05, "DAY3SAFEROOMSECURED.", 9, -15)                                              # 08 maquina de escribir, una tecla por letra
put(sfx, SUCCESS, W["save"], -15, maxlen=1.2, fade=0.4)
put(sfx, S["whoosh"], T["08_congrats"] - 0.12, -21)
for i, t in enumerate(W["knocks"]): put(sfx, KN[i % len(KN)], t, -6 if i >= 3 else -9)                # 09 golpes dentro del armario
put(sfx, ALARM, W["knocks"][3], -14); put(sfx, S["stinger"], W["knocks"][3], -12, maxlen=2.0, fade=1.0)
for t in (T["09_fudge"] + 0.05, T["09_fudge"] + 1.1): put(sfx, KN[2 % len(KN)], t, -12)
E = T["10_end"]; typed(E, "NEXT:", 14, -16); typed(E + 0.5 + 1 / 12, "THESTAIRS.", 12, -15)           # 10 tarjeta
put(sfx, DEFAULT, E + 1.8, -14, maxlen=0.5)
# ---------------- ambiente: viento de noche afuera (bajo) + room tone ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
amb = loop(S["wind"]) * 10 ** (-31 / 20) + loop(S["room_tone"]) * 10 ** (-30 / 20)
# ---------------- voz y musica (por LUFS, 11 LU bajo la voz, continua hasta el final) ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C}/mus_ep4/610534.mp3", trim=False); mus = np.tile(mus, int(np.ceil(N / len(mus))) + 1)[:N] if len(mus) < N else mus[:N]
fo = int(1.0 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
duck = np.ones(N); duck[int(T['03_died'] * SR):int((T['04_plan'] - 0.2) * SR)] = 0.12; mus *= uniform_filter1d(duck, int(0.15 * SR))   # musica cortada en el YOU DIED
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
CRED.update({"Resident Evil zombie voices (YouTube 4JCoB0GUIVs)": "Capcom (no monetizado)", "610534 Dark Sad Mood Orchestra Synth (BGM)": "szegvari", "799307 Ambient Drone (gancho)": "CVLTIV8R", "712798 Scary Music Box (gancho)": "Antenalosmusic", "Dino Crisis SFX": "Capcom (no monetizado)"})
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

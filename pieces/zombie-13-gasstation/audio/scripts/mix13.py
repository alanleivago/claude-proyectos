# mix13.py -> audio/mix.wav (+ stems), ep13 "Gas Station, Part 1": voz (voz/track.wav, la radio ya filtrada) + BGM CC0 continua por LUFS
# (~10.5 LU bajo la voz, igualada por bloques de 4 s) + capa de terror del gancho 0-10 s (drone + caja de musica) + ambiente de noche
# (grillos + room tone) + SFX reales en su fotograma (Freesound CC0 elegidos con earshot rank, Dino Crisis para la UI).
# Tiempos: engine/cues.json. Master -14 LUFS estereo, TP <= -1 dBTP. python mix13.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
from scipy.signal import butter, sosfilt
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-13-gasstation"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
C4 = r"F:/Claude Proyectos/pieces/zombie-04-subway/audio/cand"; C7 = r"F:/Claude Proyectos/pieces/zombie-07-saferoom/audio/cand"
CU = json.load(open(f"{P}/engine/cues.json", encoding="utf8")); W, T = CU["W"], CU["T"]; DUR = CU["END"]; N = int(DUR * SR); VEND = CU["VOICE_END"]
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
sfx = np.zeros(N)
def put(buf, x, t, db, maxlen=None, fade=0.05, fin=0.0):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]; f = min(len(x), int(fade * SR)); x[-f:] *= np.linspace(1, 0, f)
    if fin: f = min(len(x), int(fin * SR)); x[:f] *= np.linspace(0, 1, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)
lp = lambda x, fc: sosfilt(butter(4, fc, 'lowpass', fs=SR, output='sos'), x)
bp = lambda x, a, b: sosfilt(butter(4, [a, b], 'bandpass', fs=SR, output='sos'), x)
# ---------------- fuentes ----------------
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40); SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2)
STING = load(f"{C4}/stinger/271945.mp3"); BREATH = load(f"{C4}/breath/482827.mp3"); ROOM = load(f"{C7}/room_tone/144046.mp3", trim=False); WIND = load(f"{C7}/wind/438862.mp3", trim=False)
WHOOSH = load(f"{C7}/whoosh/855844.mp3")
ZS = r"F:/Claude Proyectos/assets/zombie-sfx-yt/seg"; ZGROWL = load(f"{ZS}/z07_107.5.wav"); ZGROAN = load(f"{ZS}/z05_103.1.wav")
BEEP = load(f"{C}/pump_beep/862533.mp3"); CHIME = load(f"{C}/door_chime/345275.mp3"); FRIDGE = load(f"{C}/fridge_hum/740110.mp3", trim=False); BUZZ = load(f"{C}/buzz/637543.mp3", trim=False)
CLICK = load(f"{C}/click/502506.mp3"); FUEL = load(f"{C}/fuel_pour/377988.mp3", trim=False); GDOOR = load(f"{C}/glass_door/559754.mp3"); NIGHT = load(f"{C}/night/436528.mp3", trim=False)
KNK = hits(load(f"{C}/knock/193863.mp3", trim=False), 6, 0.3, 0.15, gapf=12) or [load(f"{C}/knock/193863.mp3")[:int(0.3 * SR)]]
STEPS = hits(load(f"{C}/steps/138058.mp3", trim=False), 8, 0.3, 0.15, gapf=25)
def bed(x, t0, t1, db, fin=0.15, fout=0.2):
    n = int((t1 - t0) * SR); y = np.tile(x, n // len(x) + 2)[:n].copy(); f1, f2 = int(fin * SR), int(fout * SR); y[:f1] *= np.linspace(0, 1, f1); y[-f2:] *= np.linspace(1, 0, f2); put(sfx, y, t0, db)
# ---------------- eventos ----------------
put(sfx, STING, 0.05, -13, maxlen=2.2, fade=1.0)                                                                   # 01 gancho
bed(lp(FUEL, 2500), 0.0, W["stops"], -22, fin=0.4, fout=0.08)                                                      # nafta corriendo por la manguera
bed(BUZZ, 0.0, W["stops"], -26, fin=0.4, fout=0.05)                                                                # zumbido de los paneles
for k in range(6): put(sfx, BUZZ[int(k * 0.3 * SR):], W["flicker"] + k * 0.13, -18, maxlen=0.07)                    # chisporroteo del parpadeo
put(sfx, BEEP, W["stops"], -12, maxlen=0.4); put(sfx, BEEP, W["stops"] + 0.32, -15, maxlen=0.4)                    # la bomba se corta con un bip
put(sfx, ALARM, T["01b_pump"], -15)                                                                                # HUD entra
put(sfx, CLICK, W["dead"] - 0.25, -14, maxlen=0.2); put(sfx, CLICK, W["dead"] + 0.05, -15, maxlen=0.2)             # 02 aprieta el gatillo del pico: nada
put(sfx, DEFAULT, W["quarter"], -15, maxlen=0.3); put(sfx, DEFAULT, W["dead"], -14, maxlen=0.3)
put(sfx, INV, T["02b_power"], -12); put(sfx, DEFAULT, W["electricity"], -15, maxlen=0.3); put(sfx, DEFAULT, W["power"], -12, maxlen=0.35)   # 02b diagrama
put(sfx, GDOOR, T["03_shop"] + 0.3, -12, maxlen=1.5, fade=0.4); put(sfx, CHIME, T["03_shop"] + 0.35, -13, maxlen=1.4, fade=0.6)   # 03 puerta + campanita
for i, t in enumerate(np.arange(T["03_shop"] + 0.6, T["03b_inv"] - 0.1, 0.5)): put(sfx, STEPS[i % len(STEPS)], t, -17)
put(sfx, CLICK, T["03_shop"] + 0.1, -16, maxlen=0.2)                                                               # linterna encendida
put(sfx, INV, T["03b_inv"], -10)                                                                                   # 03b ITEMS
for k in ("water", "flashlight", "bandages"): put(sfx, DEFAULT, W[k] - 0.05, -13, maxlen=0.35)
put(sfx, DEFAULT, W["snacks"], -17, maxlen=0.3); put(sfx, DEFAULT, W["days"], -14, maxlen=0.35)
put(sfx, WHOOSH, T["04_xsec"] - 0.3, -15, maxlen=0.6)                                                              # 04 corte
put(sfx, DEFAULT, W["glass"], -14, maxlen=0.3); put(sfx, DEFAULT, W["see"], -16, maxlen=0.3)
for k in ("door4", "thick"): put(sfx, DEFAULT, W[k], -15, maxlen=0.3)
put(sfx, SUCCESS, W["safe"] - 0.05, -15, maxlen=1.0, fade=0.4)
put(sfx, ZGROAN, T["05_low"] + 0.6, -19, maxlen=1.6, fade=0.6); put(sfx, ZGROWL, T["05_low"] + 2.4, -22, maxlen=1.4, fade=0.6)   # 05 afuera
put(sfx, DEFAULT, W["road"], -16, maxlen=0.3); put(sfx, CLICK, W["off"] - 0.05, -10, maxlen=0.25)                  # linterna apagada
put(sfx, BREATH, W["off"] + 0.6, -17, maxlen=1.6, fade=0.6)
for i, h in enumerate([W["knocks"] - 0.05, W["knocks"] + 0.22, W["knocks"] + 0.5, W["bathroom"] + 0.3]): put(sfx, KNK[i % len(KNK)], h, -8)   # 06 golpes
put(sfx, STING, W["knocks"] - 0.05, -12, maxlen=1.6, fade=0.7); put(sfx, ALARM, T["06_knock"], -17)
put(sfx, KNK[0], W["please"] - 0.05, -13)                                                                          # 07 un golpe suave al hablar
put(sfx, CLOTH if 'CLOTH' in dir() else BREATH, W["hand"] - 0.1, -16, maxlen=0.8, fade=0.3)                        # 08 la mano se arrastra
put(sfx, DEFAULT, W["bandage"], -15, maxlen=0.3)
put(sfx, STING, W["drop"] + 0.3, -11, maxlen=1.8, fade=0.8)                                                        # 09 la gota
put(sfx, BREATH, W["fudge"] + 0.9, -15, maxlen=1.4, fade=0.5); put(sfx, DEFAULT, W["cuts"], -14, maxlen=0.35)
put(sfx, INV, T["10_choice"], -10)                                                                                 # 10 menu
for k in ("unlock", "leave", "comment"): put(sfx, DEFAULT, W[k], -13, maxlen=0.35)
put(sfx, DEFAULT, VEND + 0.3, -14, maxlen=0.5); put(sfx, KNK[1 % len(KNK)], VEND + 1.2, -12)                                  # un golpe mas al final
put(sfx, BREATH, T["10_choice"] + 1.2, -17, maxlen=3.0, fade=1.0)
# ---------------- ambiente: noche (grillos lejanos, por las ventanas) + room tone ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
shopT = T["03_shop"] + 0.5
amb = loop(WIND) * 10 ** (-36 / 20)
outK = np.clip((shopT - np.arange(N) / SR) / 0.6, 0, 1); inK = 1 - outK                                           # afuera: grillos; adentro: heladera + room tone
amb += lp(loop(NIGHT), 3500) * 10 ** (-26 / 20) * (0.35 + 0.65 * outK)
fr = loop(FRIDGE) * 10 ** (-30 / 20) * inK; amb += fr + loop(ROOM) * 10 ** (-33 / 20) * inK
scr = np.ones(N)
for a_, b_ in (("02b_power", "03_shop"), ("03b_inv", "04_xsec")): scr[int(T[a_] * SR):int(T[b_] * SR)] = 0.25
amb *= uniform_filter1d(scr, int(0.2 * SR))
# ---------------- voz y musica ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
rg = np.ones(N); rg[int((T["07_voice"] - 0.1) * SR):int(T["08_hand"] * SR)] = 10 ** (-2.0 / 20); voice *= uniform_filter1d(rg, int(0.05 * SR))   # el desconocido detras de la puerta, un poco mas bajo
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C4}/mus_horror/610534.mp3", trim=False); mus = np.tile(mus, int(np.ceil(N / len(mus))) + 1)[:N] if len(mus) < N else mus[:N]
fo = int(1.0 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
duck = np.ones(N); duck[int((W["knocks"] - 0.2) * SR):int((W["knocks"] + 1.2) * SR)] = 0.4; duck[int(T["07_voice"] * SR):int(T["08_hand"] * SR)] = 0.6   # musica baja: golpes / voz tras la puerta
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 10.5 - mL) / 20)
mI = meter.integrated_loudness(st(music)); B = int(4 * SR); gains = []
for i0 in range(0, N, B):
    seg = music[i0:i0 + B]
    try: l = meter.integrated_loudness(st(seg)) if len(seg) > SR and np.abs(seg).max() > 1e-4 else mI
    except Exception: l = mI
    gains.append(np.clip(mI - l, -8, 6) if np.isfinite(l) and l > -70 else 0.0)
cent = np.arange(len(gains)) * B + B // 2; genv = 10 ** (np.interp(np.arange(N), cent, gains) / 20)
music *= genv * uniform_filter1d(duck, int(0.25 * SR))   # el ducking va despues de igualar los bloques
HK = int(10.8 * SR); hook = np.zeros(N)
drone = load(f"{C7}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{C7}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
env = np.clip(np.arange(N) / (0.3 * SR), 0, 1) * np.clip((10.6 * SR - np.arange(N)) / (2.2 * SR), 0, 1); hook *= env
win = slice(int(0.3 * SR), int(8.0 * SR)); vW = meter.integrated_loudness(st(voice[win])); hW = meter.integrated_loudness(st(hook[win]))
hook *= 10 ** ((vW - 12 - hW) / 20)
mix = voice + music + hook + sfx * 0.9 + amb
for _ in range(3):   # normaliza -> limita, dos o tres pasadas hasta -14.0
    lufs = meter.integrated_loudness(st(mix)); gi = 10 ** ((-14 - lufs) / 20); mix *= gi; g = gi if _ == 0 else g * gi
    pk = np.abs(mix).max(); lim = 10 ** (-1.5 / 20)
    if pk > lim:
        k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
print('gancho: voz sobre musica 0-8 s', round(vW - meter.integrated_loudness(st((music + hook)[win])), 1), 'LU; musica', round(vL - meter.integrated_loudness(st(music)), 1), 'LU bajo la voz')
for a, b in ((0, 10), (10, 20), (20, 30), (30, 40), (40, 50), (50, DUR)):
    s_ = slice(int(a * SR), int(b * SR)); print(f'  {a}-{b:.0f} s: musica', round(meter.integrated_loudness(st(((music + hook) * g)[s_])), 1), 'LUFS, voz', round(meter.integrated_loudness(st((voice * g)[s_])), 1))
print('mix LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2), 'dur', DUR)
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", (music + hook) * g), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
CRED = {"Freesound CC0 (ep13)": "862533 beep (Sadiquecat), 345275 door bell (kulppari), 740110 fridge hum (FOSSarts), 637543 light buzz (kyles), 502506 flashlight click (Rudmer_Rotteveel), 377988 pouring (13GPanska_Gorbusinova_Anna), 559754 glass door (nvalbuena22), 193863 door knock (Ligidium), 138058 footsteps (daboy291), 436528 night crickets (KikeVilaplana)",
        "Freesound CC0 (reusados ep4-ep7)": "271945 stinger, 482827 breath, 610534 music (szegvari), 855844 whoosh, 144046 room tone, 438862 wind, 799307 drone (CVLTIV8R), 712798 music box (Antenalosmusic)",
        "Quaternius (CC0)": "Car (poly.pizza Cz6yDaUcM9) and Car (poly.pizza unqqkULtRU)",
        "Resident Evil zombie voices": "Capcom (no monetizado)", "Dino Crisis SFX": "Capcom (no monetizado)"}
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

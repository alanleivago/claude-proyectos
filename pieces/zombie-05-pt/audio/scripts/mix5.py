# mix5.py -> audio/mix.wav (+ stems), ep5 "the ghost behind you (P.T.)": voz (voz/track.wav) + musica CC0 continua medida por LUFS
# (~11 LU bajo la voz) + room tone de casa + SFX reales (Freesound CC0 elegidos con earshot rank) en su fotograma. Todos los
# tiempos salen de la voz (engine/cues.json). Master -14 LUFS estereo, true peak <= -1 dBTP. python mix5.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
SR = 48000
P = r"F:/Claude Proyectos/pieces/zombie-05-pt"; C = f"{P}/audio/cand"; DC = r"F:/Claude Proyectos/assets/dino-crisis-sfx"
CU = json.load(open(f"{P}/engine/cues.json", encoding="utf8")); W, T = CU["W"], CU["T"]; DUR = CU["END"]; N = int(DUR * SR)
CREDITS = {  # Freesound CC0 (earshot rank: z de la consulta entre parentesis)
    "546362 footsteps on wooden floor (z 6.4)": "Freesound CC0", "482827 R15-47-Heavy Breathing (z 5.8)": "craigsmith",
    "724702 Just Regular Radio Static (z 5.1)": "Freesound CC0", "590148 Creaking Wood 11 (z 5.6)": "Greg_Surr", "590160 Creaking in Room 12": "Greg_Surr",
    "855844 Woosh (z 5.0)": "Freesound CC0", "144046 House Room Tone (z 4.9)": "Freesound CC0", "271945 Stingers and Stabs 001": "OverlookHotelRecords",
    "579883 Pentax K1000 Camera Shutter": "yfjesse", "799307 Ambient Drone (z 4.3, gancho v5)": "CVLTIV8R", "712798 Scary Music Box for Spooky Scenes (z 5.1, gancho v5)": "Antenalosmusic", "610534 Dark Sad Mood Orchestra Synth (z 4.0)": "szegvari",
}
def load(path, a=None, b=None, trim=True, norm=True):
    cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
    if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]   # sin silencio inicial
    f = int(0.004 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x / (np.abs(x).max() + 1e-9) if norm else x
def hits(path, n=10, ln=0.3):   # golpes sueltos (un paso cada uno) cortados en los ataques
    x = load(path, trim=False); H = int(0.01 * SR); e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    on, out, last = np.where((e[1:] > 3 * e[:-1] + 1e-4) & (e[1:] > 0.15 * e.max()))[0], [], -99
    for k in on:
        if k - last < 25: continue
        last = k; s = x[max(0, k * H - int(0.005 * SR)):k * H + int(ln * SR)].copy(); g = int(0.08 * SR); s[-g:] *= np.linspace(1, 0, g); out.append(s / np.abs(s).max())
        if len(out) >= n: break
    return out
sfx = np.zeros(N); amb = np.zeros(N)
def put(buf, x, t, db, maxlen=None, fade=0.05, fin=0.0):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]; f = min(len(x), int(fade * SR)); x[-f:] *= np.linspace(1, 0, f)
    if fin: f = min(len(x), int(fin * SR)); x[:f] *= np.linspace(0, 1, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6)
ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1); KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40)
STEP = hits(f"{C}/steps_wood/546362.mp3"); BREATH = load(f"{C}/breath/482827.mp3"); STATIC = load(f"{C}/radio_static/724702.mp3", trim=False)
CREAK = load(f"{C}/house_creak/590148.mp3"); CREAK2 = load(f"{C}/house_creak/590160.mp3"); WHOOSH = load(f"{C}/whoosh/855844.mp3")
ROOM = load(f"{C}/room_tone/144046.mp3", trim=False); STING = load(f"{C}/stinger/271945.mp3"); SHUT = load(f"{C}/shutter/579883.mp3")
print("pasos", len(STEP))
def steps(t0, t1, period, db, k0=0):   # pasos de Ava (clip walk: 2 pasos por segundo a speed 1)
    t, i = t0, k0
    while t < t1: put(sfx, STEP[i % len(STEP)], t, db + (-2 if i % 2 else 0)); t += period; i += 1
# ---- eventos ----
steps(0.15, T["file"] - 0.1, 0.5 / 0.95, -17)                                           # 01 Ava camina hacia la camara (Lisa no hace ruido)
put(sfx, INV, T["file"], -10)                                                          # 02 FILE
for t0, s in ((0.1, "P.T. RELEASED AUG 2014"), (1.15, "LISA FOUND  SEP 2019")):   # v2: 20 letras/s, una tecla por letra
    for i, ch in enumerate(s):
        t = T["file"] + t0 + (i + 1) / 20
        if ch != " " and t < T["loop"]: put(sfx, KEY, t, -16)
for i in range(4): put(sfx, KEY, W["five"] - 0.1 + (i + 1) / 14, -11)                   # 2014
for i in range(4): put(sfx, KEY, W["years"] + (i + 1) / 14, -11)                        # 2019
put(sfx, DEFAULT, W["years"] + 0.5, -16, maxlen=0.4)                                   # 5 YEARS. NOBODY SAW HER.
L0 = T["loop"]; t1, t2 = L0 + 2.55, L0 + 5.0
put(sfx, DEFAULT, L0, -15, maxlen=0.5)                                                 # HUD entra con el pasillo
steps(L0 + 0.1, t1 - 0.12, 0.5 / 1.3, -16); steps(t1 + 0.15, t2 - 0.1, 0.5 / 1.1, -16, 3); steps(t2 + 0.1, T["turn"] - 0.1, 0.5 / 0.9, -17, 5)
put(sfx, CREAK, L0 + 0.9, -9, maxlen=1.3, fade=0.4)                                    # la puerta doble se abre
put(sfx, CREAK2, t1 + 1.15, -16, maxlen=1.2, fade=0.4)                                 # la de entrada se cierra detras
put(sfx, STATIC, t1, -24, maxlen=T["turn"] + 3.5 - t1, fade=1.2, fin=0.3)              # vuelta 1: la radio de la esquina suena (sigue bajo)
put(sfx, STING, t2 + 0.05, -16, maxlen=2.5, fade=1.0)                                  # vuelta 2: luz roja
put(sfx, CREAK, t2 + 0.5, -14, maxlen=1.2, fade=0.4)                                   # la puerta del bano se entreabre
steps(T["turn"] + 0.05, W["turn"] - 0.1, 0.5 / 0.75, -17)                              # 04
put(sfx, BREATH, W["breathing"] - 0.2, -13, maxlen=1.9, fade=0.6, fin=0.15)            # respiracion detras
put(sfx, WHOOSH, W["turn"] - 0.08, -8)                                                 # whip-pan con su giro
put(sfx, ALARM, W["turn"], -16)                                                        # HUD CAUTION
put(sfx, STATIC, T["crt"], -18, maxlen=0.7, fade=0.3, fin=0.08)                       # 05 la tele (estatica al encenderse, v2: sin ataque seco)
put(sfx, DEFAULT, W["modder"] - 0.1, -15, maxlen=0.4)                                  # FREE CAM en pantalla
put(sfx, WHOOSH, W["see"] - 0.12, -15)                                                 # la camara se suelta
steps(W["see"], T["reveal"] - 0.1, 0.5, -19)
steps(T["reveal"] + 0.1, T["hid"] - 0.1, 0.5 / 0.55, -18, 2)                            # 06 pasos lentos
put(sfx, STING, W["lisa"] - 0.05, -8, maxlen=3.5, fade=1.2); put(sfx, ALARM, W["lisa"], -16)   # Lisa / DANGER
for t in (W["turned"], W["face"]): put(sfx, WHOOSH, t, -18)                           # 07 giros en camara lenta (suaves)
put(sfx, STING, W["back7"] - 0.45, -14, maxlen=2.0, fade=0.8)                           # vuelve desde lo oscuro
put(sfx, SHUT, W["second"] - 0.72, -13)                                                # 08 la camara frontal
put(sfx, STING, W["second"], -9, maxlen=3.0, fade=1.0)                                 # la segunda cara
put(sfx, BREATH, T["lean"] + 1.3, -9, maxlen=T["fudge"] - T["lean"] - 1.3, fade=0.5, fin=0.2)   # 09 aliento en el cuello
put(sfx, CREAK2, T["crane"] + 0.3, -15, maxlen=2.0, fade=0.6)                          # 10 la casa cruje mientras sube la grua
steps(T["crane"] + 0.1, T["send"] - 0.1, 0.5 / 0.6, -22); steps(T["send"] + 0.1, T["end"] - 0.2, 0.5 / 0.8, -19)   # 11
for i, ch in enumerate("DON'T LOOK BACK."):                                            # tarjeta final: una tecla por letra
    if ch != " ": put(sfx, KEY, T["end"] + (i + 1) / 14, -12)
put(sfx, DEFAULT, T["end"] + 1.4, -14, maxlen=0.5)                                     # FOLLOW FOR MORE!
for t in (T["file"] - 0.6, W["turn"] - 0.72, T["reveal"] + 0.9, W["lisa"] + 1.2): put(sfx, WHOOSH, t - 0.12, -21, fin=0.04)   # v3: movimientos de camara (relativos a la voz nueva)
# ---- ambiente: room tone de casa; bajo en la pantalla FILE; fundido en la tarjeta ----
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
lvl = np.ones(N); lvl[int(T["file"] * SR):int(T["loop"] * SR)] = 0.3; lvl = uniform_filter1d(lvl, int(0.05 * SR))
amb = loop(ROOM) * 10 ** (-28 / 20) * lvl; amb[int(T["end"] * SR):] *= np.linspace(1, 0, N - int(T["end"] * SR))
# ---- voz y musica (musica por LUFS, 11 LU bajo la voz, continua; fundido final) ----
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
va, vb = int(20.84 * SR), int(20.98 * SR); env = np.ones(N); env[va:vb] = 10 ** (-4 / 20); voice *= uniform_filter1d(env, int(0.015 * SR))   # v2: la "ck" de "hacked" (pico de -2 dBFS) 4 dB mas baja
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C}/mus_ep4/610534.mp3", trim=False); mus = np.pad(mus, (0, max(0, N - len(mus))))[:N]
fo = int(1.5 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 11 - mL) / 20)
# ---- v5 (usuario): mas musica de terror en el gancho (0-10 s): drone oscuro que crece + caja de musica desafinada,
# stingers suaves en "the ghost" y "five years"; igualado por LUFS (~12 LU bajo la voz en ese tramo) y fundido en la BGM ----
HK = int(10.8 * SR); hook = np.zeros(N)
drone = load(f"{C}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{C}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
env = np.clip(np.arange(N) / (0.4 * SR), 0, 1) * np.clip((10.6 * SR - np.arange(N)) / (2.2 * SR), 0, 1)   # entra rapido, se funde en la BGM de 8,4 a 10,6 s
hook *= env
win = slice(int(0.3 * SR), int(8.0 * SR)); vW = meter.integrated_loudness(st(voice[win])); hW = meter.integrated_loudness(st(hook[win]))
hook *= 10 ** ((vW - 12 - hW) / 20)
put(sfx, STING, W["ghost"] - 0.05, -15, maxlen=2.4, fade=1.0)                          # v5: stinger suave en "the ghost"
put(sfx, STING, W["five"] - 0.05, -17, maxlen=2.0, fade=0.9)                           # v5: y en "five years"
mix = voice + music + hook + sfx * 0.9 + amb
lufs = meter.integrated_loudness(st(mix)); g = 10 ** ((-14 - lufs) / 20); mix *= g
pk = np.abs(mix).max(); lim = 10 ** (-1.5 / 20)
if pk > lim:
    k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)
print('gancho: voz', round(vW, 1), '-> capa', round(vW - meter.integrated_loudness(st(hook[win])), 1), 'LU bajo; voz+BGM 0-8 s:', round(vW - meter.integrated_loudness(st((music + hook)[win])), 1), 'LU bajo'); print('voz LUFS', round(vL, 1), '-> musica', round(vL - meter.integrated_loudness(st(music)), 1), 'LU bajo la voz')
print('mix LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2))
sf.write(f"{P}/audio/mix.wav", st(mix).astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", (music + hook) * g), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
json.dump(CREDITS, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

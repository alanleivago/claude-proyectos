# mix14.py -> audio/mix.wav (+ stems), ep14 "The Attic (Stairs, Part 2)". Base: mix13 (ep13) + kit del gigante del largo 3 (STALKER.md).
# Voz (voz/track.wav) + gancho de terror 0-10 s (drone + caja de musica + stinger, ~7 LU bajo la voz) que cruza a la BGM CC0 oscura
# (10-11 LU bajo la voz, igualada por bloques de 4 s) + respiracion real en [RESPIRA] + room tone / noche en las pausas + SFX reales en su
# fotograma (tiempos de engine/cues.json, los mismos que usa attic.js). Musica fuera ~1 s antes del rugido (aterrizaje). Decision RE3:
# drone grave filtrado + latido 40 bpm en el negativo y 60 despues, golpes graves en los destellos, pasos del gigante estirados x0,5.
# Master estereo -14 LUFS, TP <= -1 dBTP. python mix14.py
import json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, minimum_filter1d
from scipy.signal import butter, sosfilt
SR = 48000
R = "/Users/alanleiva/claude-proyectos"; P = f"{R}/pieces/zombie-14-attic"; DC = f"{R}/assets/dino-crisis-sfx"; ZS = f"{R}/assets/zombie-sfx-yt/seg"
L1 = f"{R}/pieces/zombie-03-station/largo/audio/cand"; L2 = f"{R}/pieces/zombie-03-station/largo2/audio/cand"; L3 = f"{R}/pieces/zombie-03-station/largo3/audio/cand"
C4 = f"{R}/pieces/zombie-04-subway/audio/cand"; C7 = f"{R}/pieces/zombie-07-saferoom/audio/cand"; C10 = f"{R}/pieces/zombie-10-stairs/audio/cand"; C13 = f"{R}/pieces/zombie-13-gasstation/audio/cand"
CU = json.load(open(f"{P}/engine/cues.json", encoding="utf8")); W, T = CU["W"], CU["T"]; DUR = CU["END"]; N = int(DUR * SR); VEND = CU["VOICE_END"]
LN = {l[0]: l[1] for l in json.load(open(f"{P}/voz/lines.json", encoding="utf8"))}
TLW = json.load(open(f"{P}/engine/timeline.json", encoding="utf8"))["words"]; LE = lambda i: max(w[2] for w in TLW if w[3] == i)
def load(path, a=None, b=None, trim=True, norm=True):
    cmd = ["ffmpeg", "-v", "quiet"] + (["-ss", str(a)] if a is not None else []) + ["-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)
    if trim: i0 = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max())); x = x[max(0, i0 - int(0.004 * SR)):]   # sin silencio inicial (el SFX cae en su cuadro)
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
lp = lambda x, fc: sosfilt(butter(4, fc, 'lowpass', fs=SR, output='sos'), x)
hp = lambda x, fc: sosfilt(butter(2, fc, 'highpass', fs=SR, output='sos'), x)
slow = lambda x, k=0.5: np.interp(np.linspace(0, len(x) - 1, int(len(x) / k)), np.arange(len(x)), x)   # camara lenta: estira y baja el tono
sfx = np.zeros(N)
def put(buf, x, t, db, maxlen=None, fade=0.05, fin=0.0):
    x = x.copy()
    if maxlen: x = x[:int(maxlen * SR)]; f = min(len(x), int(fade * SR)); x[-f:] *= np.linspace(1, 0, f)
    if fin: f = min(len(x), int(fin * SR)); x[:f] *= np.linspace(0, 1, f)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * 10 ** (db / 20)
# ---------------- fuentes (todas reales: Freesound CC0 de episodios anteriores + Dino Crisis para la UI) ----------------
DEFAULT = load(f"{DC}/9PdkWu31Xwo.wav"); INV = load(f"{DC}/ch/inventory.wav", 1.78, 2.6); ALARM = load(f"{DC}/ch/rick_calling_beep.wav", 3.45, 4.1)
KEY = load(f"{DC}/ch/bonus_2_rick_typing.wav", 2.17, 2.40); SUCCESS = load(f"{DC}/ch/keypad_unlock.wav", 26.5, 28.2)
STING = load(f"{C7}/stinger/271945.mp3"); WHOOSH = load(f"{C7}/whoosh/855844.mp3"); ROOM = load(f"{C7}/room_tone/144046.mp3", trim=False); WIND = load(f"{C7}/wind/438862.mp3", trim=False)
NIGHT = load(f"{C13}/night/436528.mp3", trim=False); CLICK = load(f"{C13}/click/502506.mp3")
KNK = hits(load(f"{C10}/knock_soft/193831.mp3", trim=False), 6, 0.3, 0.15, gapf=12) or [load(f"{C10}/knock_soft/193831.mp3")[:int(0.3 * SR)]]
BREATH = load(f"{L2}/breath_f/318078.mp3")                    # [RESPIRA]: "Whimper_Gasp_1_Female" (Drkvixn91), earshot rank z +6.0
CLOTH = load(f"{L1}/cloth/320142.mp3"); HATCH = load(f"{C10}/window_slide/669069.mp3"); RATTLE = load(f"{C10}/ladder_rattle/453961.mp3")
CREAK = [load(f"{C10}/stair_creak/{f}.mp3") for f in (214875, 214879, 214885)]; BIGCREAK = load(f"{L2}/crate_creak/214871.mp3")
ZGROAN = load(f"{ZS}/z05_103.1.wav"); ZCROWD = [load(f"{ZS}/{z}") for z in ("z02_89.0.wav", "z09_115.7.wav", "z13_127.6.wav")]
GLASS = load(f"{L3}/glass_big/536763.mp3"); WOOD = load(f"{L3}/wood_break/669452.mp3"); DEBRIS = load(f"{L1}/glass_debris/272065.mp3"); LAND = load(f"{L3}/heavy_land/673424.mp3")
GSTEP = lp(load(f"{L3}/impact/735421.mp3"), 900)                # paso descalzo pesado (STALKER.md)
ROAR = lp(slow(load(f"{L3}/monster_growl/366837.mp3"), 0.9), 3500); GROWL = lp(slow(load(f"{L3}/monster_roar/222523.mp3"), 0.9), 2200); CBR = lp(load(f"{L3}/monster_growl/634201.mp3"), 1500)
RUMBLE = lp(load(f"{L3}/house_rumble/337829.mp3", trim=False), 220); HB = lp(load(f"{L1}/heartbeat/130939.mp3"), 1200)[:int(0.9 * SR)]
DRONE = lp(load(f"{L3}/drone_low/871189.mp3", trim=False), 600)
# ---------------- eventos ----------------
EV = lambda t, x, db, ml=None, fade=0.05: put(sfx, x, t, db, maxlen=ml, fade=fade)
EV(0.05, STING, -14, 2.2, 1.0)                                                                                     # 01 gancho
EV(T["01a_room"], ALARM, -15)                                                                                      # HUD de golpe
EV(W["attic"] - 0.05, STING, -13, 1.8, 0.8)                                                                        # "the attic"
kn = [W["knocked"] - 0.05, W["knocked"] + 0.18, W["knocked"] + 0.42, W["begged"], W["begged"] + 0.25, T["02c_quiet"] + 0.3, T["02c_quiet"] + 0.55, T["02d_stops"] + 0.15]   # = knockShake de attic.js
for i, h in enumerate(kn): EV(h, KNK[i % len(KNK)], -9 if h < T["02c_quiet"] else -13)
EV(T["02b_vote"], INV, -12); EV(W["quiet1"] - 0.05, DEFAULT, -13, 0.35)                                            # menu del ep10
EV(T["03_db"] + 0.1, INV, -15); EV(W["sixty"] - 0.05, DEFAULT, -14, 0.3); EV(W["thirty"] - 0.05, DEFAULT, -15, 0.3)   # medidor de dB
tb = LE(3) + 0.08; EV(tb, BREATH, -12, 1.0, 0.25)                                                                  # [RESPIRA] sola en silencio
EV(W["flame"] - 0.05, DEFAULT, -16, 0.3); EV(T["04a_mile"] + 0.4, ZGROAN, -20, 1.6, 0.6); EV(W["mile"] - 0.05, DEFAULT, -14, 0.35)
EV(W["blanket"] - 0.3, CLOTH, -11, 1.0, 0.3); EV(W["blanket"] - 0.05, DEFAULT, -16, 0.3)                           # manta
EV(T["04c_flash"] + 0.05, CLICK, -11, 0.25); EV(W["floor4"] - 0.05, DEFAULT, -15, 0.3)                             # linterna
L1_, L2_, L3_ = 'DAY 5', 'HOUSE - 2F', 'LIGHTS OUT.'
for k, ch in enumerate(L1_ + L2_ + L3_):                                                                           # 05 una tecla por letra (14/s)
    if ch != ' ': EV(W["day5"] - 0.05 + k / 14 + 0.02, KEY, -14 if k % 3 else -12)
EV(max(W["save"], W["day5"] + len(L1_ + L2_ + L3_) / 14 + 0.1) - 0.05, SUCCESS, -15, 1.0, 0.4)   # cuando la hoja termina
EV(T["06_climb"] + 0.05, HATCH, -13, 0.8, 0.3); EV(T["06_climb"] + 0.1, RATTLE, -16, 0.7, 0.3)                    # 06 escotilla + escalera plegable
for i, k in enumerate(range(1, 7)): EV(T["06_climb"] + (k - 0.6) * 0.44, CREAK[i % 3], -15 - (i % 2) * 2, 0.45)     # v5: un crujido por pie apoyado (attic.js CLIMB: S0 0.6, 0.44 s/peldano)
EV(T["06_climb"] + (6.1 - 0.6) * 0.44 + 0.25, CLOTH, -14, 0.5, 0.2); EV(T["06_climb"] + (6.1 - 0.6) * 0.44 + 0.3, lp(CREAK[0], 1500), -13, 0.5)   # manos al piso del desvan, se impulsa
EV(W["water6"] - 0.05, DEFAULT, -16, 0.3); EV(W["mattress"] - 0.05, DEFAULT, -16, 0.3)
EV(W["never"] - 0.45, CLOTH, -12, 0.9, 0.3); EV(W["never"] - 0.4, lp(WHOOSH, 1500), -18, 0.6); EV(W["floor6"] - 0.05, DEFAULT, -16, 0.3); EV(W["boards"] - 0.05, DEFAULT, -16, 0.3)
for i in range(4): EV(T["07_feet"] + 0.2 + i * 0.91, GSTEP, -6 - (i % 2), 1.0)                                    # 07 pasos descalzos pesados (ph = lt * 0.55)
for i in range(2): EV(T["07a_bare"] + 0.25 + i * 1.1, GSTEP, -5, 1.0)
burst = T["07b_burst"] + 0.35 - 0.05; LANDT = W["land"]
EV(burst, GLASS, -3, 2.5, 0.8); EV(burst + 0.02, WOOD, -5, 1.8, 0.6); EV(burst + 0.05, WHOOSH, -12, 0.7)          # la ventana estalla hacia adentro
EV(LANDT, LAND, -2, 2.0, 0.5); EV(LANDT + 0.08, DEBRIS, -14, 1.2, 0.4); EV(LANDT, RUMBLE, -9, 1.6, 0.6)           # cae pesado
EV(LANDT + 0.95, ROAR, -1, 3.4, 1.0)                                                                               # 1 s de silencio y el rugido encima
EV(T["07c_rise"] + 0.9, CBR, -12, 1.6, 0.6)
EV(T["09_sound"] + 0.1, RUMBLE, -10, 2.2, 0.8)                                                                     # 09 grave que viaja
for i, z in enumerate(ZCROWD): EV(T["09b_heads"] + 0.3 + i * 0.45, z, -19 - i, 1.4, 0.5)
EV(W["farther"] - 0.05, DEFAULT, -16, 0.3); EV(W["blocks"] - 0.05, DEFAULT, -15, 0.3)
EV(W["tilts"] - 0.3, CBR, -10, 2.0, 0.6); EV(T["10b_look"] + 0.2, GROWL, -9, 1.6, 0.6)                             # 10 respiracion/grunido al mirar
for i, h in enumerate([W["one11"] + 0.1, W["climb"] + 0.05, W["time11"] + 0.1]):                                   # 11 = stepsAt de attic.js: paso + la barricada cruje
    EV(h, GSTEP, -3, 1.2); EV(h + 0.02, BIGCREAK, -11, 0.9, 0.4); EV(h + 0.05, CREAK[i % 3], -14, 0.5)
EV(W["one11"] - 0.3, GROWL, -12, 1.4, 0.5); EV(W["one11"] - 0.05, DEFAULT, -15, 0.3)
EV(W["need"] - 0.2, CBR, -9, 1.8, 0.6); EV(W["need"] + 0.05, CLOTH, -16, 0.6, 0.2); EV(W["need"] + 0.05, BIGCREAK, -13, 0.9, 0.4)
t12 = T["12_choice"]                                                                                               # 12 decision RE3
for dt in (0.0, 3.25, 6.15): EV(t12 + dt, lp(LAND, 300), -9, 2.0, 0.8)                                            # golpes graves en los destellos
for i in range(14): EV(t12 + 3.5 + i * 0.06, KEY, -17)                                                             # las opciones salen a maquina
EV(W["one12"] - 0.05, DEFAULT, -14, 0.4); EV(W["two12"] - 0.05, DEFAULT, -14, 0.4); EV(t12 + 6.4, INV, -12); EV(W["comment"] - 0.05, DEFAULT, -14, 0.4)
for dt in (7.2, 9.4, 11.6): EV(t12 + dt, slow(GSTEP, 0.5), -9, 2.0)                                                # pasos en camara lenta
EV(t12 + 6.6, slow(CBR, 0.5), -12, 4.5, 1.2)
t = t12 + 0.5
while t < DUR - 0.4: EV(t, HB, -13 if t < t12 + 6.4 else -12); t += 1.5 if t < t12 + 6.4 else 1.0                 # latido 40 bpm en el negativo, 60 despues
# ---------------- ambiente: room tone adentro, noche afuera, mas presente en las pausas ----------------
loop = lambda x: np.tile(x, int(np.ceil(N / len(x))) + 1)[:N]
EXT = [("01_hook", "01a_room"), ("04_flame", "04b_blanket"), ("07_feet", "07b_burst"), ("09_sound", "10_tilt")]
outK = np.zeros(N)
for a, b in EXT: outK[int(T[a] * SR):int(T[b] * SR)] = 1
outK = uniform_filter1d(outK, int(0.15 * SR)); inK = 1 - outK
amb = loop(WIND) * 10 ** (-34 / 20) + lp(loop(NIGHT), 3500) * 10 ** (-27 / 20) * outK + loop(ROOM) * 10 ** (-31 / 20) * inK
pz = np.zeros(N)
for a, b in ((LE(2) + 0.1, LN["03_silence"][0] - 0.05), (LE(6) + 0.1, LN["07_think"][0] - 0.05), (LE(3), LN["04_light"][0])): pz[int(a * SR):int(b * SR)] = 1   # (···) y respiracion
amb *= 1 + 1.0 * uniform_filter1d(pz, int(0.12 * SR))                                                              # +6 dB de ambiente en las pausas
# ---------------- voz y musica ----------------
voice = load(f"{P}/voz/track.wav", trim=False) * 1.15; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
th = np.ones(N); th[int((LN["07_think"][0] - 0.1) * SR):int((LE(7) + 0.2) * SR)] = 10 ** (-1.5 / 20); voice *= uniform_filter1d(th, int(0.05 * SR))   # [PIENSA] seco y cerca, un poco mas bajo
meter = pyln.Meter(SR); st = lambda m: np.stack([m, m], 1)
vL = meter.integrated_loudness(st(voice))
mus = load(f"{C4}/mus_horror/610534.mp3", trim=False); mus = np.tile(mus, int(np.ceil(N / len(mus))) + 1)[:N] if len(mus) < N else mus[:N]
mL = meter.integrated_loudness(st(mus)); music = mus * 10 ** ((vL - 10.5 - mL) / 20)
mI = meter.integrated_loudness(st(music)); B = int(4 * SR); gains = []
for i0 in range(0, N, B):
    seg = music[i0:i0 + B]
    try: l = meter.integrated_loudness(st(seg)) if len(seg) > SR and np.abs(seg).max() > 1e-4 else mI
    except Exception: l = mI
    gains.append(np.clip(mI - l, -8, 6) if np.isfinite(l) and l > -70 else 0.0)
cent = np.arange(len(gains)) * B + B // 2; music *= 10 ** (np.interp(np.arange(N), cent, gains) / 20)
gate = np.ones(N); tt = np.arange(N) / SR
gate[(tt > LANDT - 0.05) & (tt < LANDT + 1.0)] = 0                                                                 # ~1 s sin musica: aterrizaje -> rugido
gate[(tt > burst - 0.05) & (tt < LANDT)] = 0.35                                                                    # la ventana tapa la musica
gate[tt >= t12] = 0                                                                                                # en la decision la musica no sube: solo drone + latido
gate[(tt > T["07_feet"]) & (tt < burst)] = 0.6                                                                     # pasos: la musica se aparta
gate[tt < 9.0] = 0                                                                                                 # 0-10 s: el gancho de terror
gate[(tt >= 9.0) & (tt < 11.0)] = (tt[(tt >= 9.0) & (tt < 11.0)] - 9.0) / 2.0                                      # crossfade al BGM
music *= uniform_filter1d(gate, int(0.06 * SR))
HK = int(11.0 * SR); hook = np.zeros(N)
drone = load(f"{C7}/hook_drone/799307.mp3", trim=False)[:HK]; mbox = load(f"{C7}/hook_musicbox/712798.mp3", trim=False)[:HK]
hook[:len(drone)] += drone; hook[:len(mbox)] += 0.55 * mbox
env = np.clip(tt / 0.3, 0, 1) * np.clip((11.0 - tt) / 2.0, 0, 1); hook *= env
win = slice(int(0.3 * SR), int(8.0 * SR)); vW = meter.integrated_loudness(st(voice[win])); hW = meter.integrated_loudness(st(hook[win]))
hook *= 10 ** ((vW - 7 - hW) / 20)                                                                                 # gancho ~7 LU bajo la voz
dr = np.zeros(N); n12 = N - int(t12 * SR); d = np.tile(DRONE, n12 // len(DRONE) + 2)[:n12]; f = int(0.4 * SR); d[:f] *= np.linspace(0, 1, f); d[-int(0.8 * SR):] *= np.linspace(1, 0, int(0.8 * SR)); dr[int(t12 * SR):] = d
s12 = slice(int(t12 * SR), N); vD = meter.integrated_loudness(st(voice[s12])); dD = meter.integrated_loudness(st(dr[s12])); dr *= 10 ** ((vD - 9 - dD) / 20)
sh_ = lambda x, sec: np.concatenate([np.zeros(int(sec * SR)), x[:N - int(sec * SR)]])   # v2 (earshot: casi mono): musica y ambiente abiertos en estereo
musS = music + hook + dr; ambR = np.roll(amb, int(1.37 * SR))
mixL = voice + musS + sfx * 0.9 + amb; mixR = voice + sh_(musS, 0.013) * 0.97 + sfx * 0.9 + ambR
mix = np.stack([mixL, mixR], 1); st = lambda m: m if m.ndim == 2 else np.stack([m, m], 1)
for _ in range(3):   # normaliza -> limita, hasta -14.0
    lufs = meter.integrated_loudness(st(mix)); gi = 10 ** ((-14 - lufs) / 20); mix *= gi; g = gi if _ == 0 else g * gi
    pk = np.abs(mix).max(); lim = 10 ** (-1.5 / 20)
    if pk > lim:
        k = int(0.005 * SR); gg = np.minimum(1, lim / (np.abs(mix).max(1) + 1e-9)); mix *= uniform_filter1d(minimum_filter1d(gg, size=2 * k + 1), size=k)[:, None]
mus_all = (music + hook + dr) * g
print('gancho 0-8 s: musica', round(vW - meter.integrated_loudness(st(hook[win])), 1), 'LU bajo la voz')
for a, b in ((0, 10), (10, 20), (20, 30), (30, 40), (40, 46), (49, 64), (64, DUR)):
    s_ = slice(int(a * SR), int(b * SR)); lm, lv = meter.integrated_loudness(st(mus_all[s_])), meter.integrated_loudness(st((voice * g)[s_])); print(f'  {a}-{b:.0f} s: musica {lm:.1f} LUFS, voz {lv:.1f}, diferencia {lv - lm:.1f} LU')
print('mix LUFS', round(meter.integrated_loudness(st(mix)), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2), 'dur', DUR)
sf.write(f"{P}/audio/mix.wav", mix.astype(np.float32), SR)
for name, x in (("voice", voice * g), ("music", mus_all), ("sfx", sfx * 0.9 * g), ("amb", amb * g)): sf.write(f"{P}/audio/stem_{name}.wav", x.astype(np.float32), SR)
CRED = {"Freesound CC0 (gigante, largo 3)": "366837 Growl and Roar (Jofae), 222523 Deep Monster Growl (uagadugu), 634201 CreatureBreath (dragonboi50120), 673424 Falling body hits the floor (courtneyeck), 735421 BF_slide the wall (maatre), 536763 glass (egomassive), 669452 wood break (EricsSoundschmiede), 871189 Textured Low Drone (kkenny101), 337829 house rumble",
        "Freesound CC0 (reusados)": "318078 Whimper_Gasp_1_Female (Drkvixn91), 320142 cloth, 272065 glass debris, 130939 heartbeat, 669069 window slide, 453961 ladder rattle, 214871/214875/214879/214885 creaks, 193831 knock, 502506 flashlight click, 436528 night crickets, 271945 stinger, 855844 whoosh, 144046 room tone, 438862 wind, 610534 music (szegvari), 799307 drone (CVLTIV8R), 712798 music box (Antenalosmusic)",
        "Quaternius (CC0)": "cars", "Resident Evil zombie voices": "Capcom (no monetizado)", "Dino Crisis SFX": "Capcom (no monetizado)"}
json.dump(CRED, open(f"{P}/audio/CREDITS.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

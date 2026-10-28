# mix2.py (digger-02 the toilet) VOICE -> audio/<voice>/mix.wav (+ stems): voice track + chiptune bed (ducked) + ambience beds per shot + SFX on
# the film's cues (engine/review_meta_<voice>.json). Real recordings: Freesound CC0 previews (audio/cand, see CREDITS.md)
# and sound-layer kit (CC0). Retro blips/stingers are synthesized here (chip.py). Master: -14 LUFS integrated, -1 dBTP.
import sys, os, json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
sys.path.insert(0, os.path.dirname(__file__))
from chip import *
V = sys.argv[1]
TRACK = sys.argv[2] if len(sys.argv) > 2 else ""      # v2: "" = clean voice track, "_rawn" = unprocessed voice
OUTN = "mix" + TRACK
ROOT = r"F:/Claude Proyectos/pieces/digger-02-toilet"; CAND = f"{ROOT}/audio/cand"; KIT = r"F:/Claude Proyectos/sound-layer/kit"; EP1 = r"F:/Claude Proyectos/pieces/digger-01-fridge/audio/cand"
meta = json.load(open(f"{ROOT}/engine/review_meta.json")); TL = json.load(open(f"{ROOT}/engine/timeline_{V}.json", encoding="utf-8"))
DUR = meta["film"]["dur"]; N = int(DUR * SR)
shots = meta["film"]["shots"]; T0 = [t for _, t, _ in shots] + [DUR]
_cache = {}
def load(path, mono=True):
    if path in _cache: return _cache[path]
    if path.endswith(".mp3"):
        raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout
        x = np.frombuffer(raw, np.float32).astype(np.float64)
    else:
        x, sr = sf.read(path); x = x.mean(1) if x.ndim > 1 else x
        if sr != SR:
            from scipy.signal import resample_poly; x = resample_poly(x, SR, sr)
    _cache[path] = x; return x
def db(x): return 10 ** (x / 20)
def norm_peak(x, pk_db): m = np.max(np.abs(x)) + 1e-9; return x / m * db(pk_db)
def onset_cut(x, maxlen, pre=0.004, thr=-38, tail_thr=-48):
    """first event of a recording: from just before the onset to where it decays (never cuts inside it; fades 8 ms)"""
    a = np.abs(x); pk = a.max() + 1e-9; i0 = int(np.argmax(a > pk * db(thr)))
    i0 = max(0, i0 - int(pre * SR)); seg = x[i0:i0 + int(maxlen * SR)]
    w = int(0.01 * SR); env_ = np.array([np.sqrt(np.mean(seg[k:k + w] ** 2)) for k in range(0, max(1, len(seg) - w), w)])
    lv = 20 * np.log10(env_ / (env_.max() + 1e-9) + 1e-9); after = np.where(lv[5:] < tail_thr + 0)[0]
    end = (after[0] + 5) * w if len(after) else len(seg)
    seg = seg[:max(end, int(0.05 * SR))].copy(); f = min(len(seg) // 4, int(0.008 * SR))
    seg[-f:] *= np.linspace(1, 0, f); seg[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR)); return seg
def window(x, start, dur, fade=0.03):
    s = x[int(start * SR):int((start + dur) * SR)].copy(); f = int(fade * SR)
    if len(s) > 2 * f: s[:f] *= np.linspace(0, 1, f); s[-f:] *= np.linspace(1, 0, f)
    return s
def loop_to(x, n, xf=0.25):
    out = np.zeros(n); f = int(xf * SR); pos = 0
    while pos < n:
        seg = x.copy(); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        k = min(len(seg), n - pos); out[pos:pos + k] += seg[:k]; pos += len(seg) - f
    return out
C = lambda k, i: f"{CAND}/{k}/{i}.mp3"
K = lambda p: f"{KIT}/{p}.wav"

# ---------- chiptune SFX (code) ----------
def blip_up(notes=(76, 83), d=0.055, duty=0.125, vol=0.6):
    return np.concatenate([pulse(mtof(m), int(d * SR), duty=duty) * env(int(d * SR), 0.001, 0.03, 0.6, 0.01) for m in notes]) * vol
def sting(notes=(72, 76, 79, 84), d=0.07): return blip_up(notes, d, 0.25, 0.55)
def pop_chip():
    n = int(0.09 * SR); return pulse(mtof(84), n, duty=0.5, slide=-14) * env(n, 0.001, 0.06, 0.0, 0.02) * 0.6
def notif(): return np.concatenate([pop_chip(), np.zeros(int(0.02 * SR)), blip_up((88, 93), 0.07, 0.25, 0.45)])
def ting(): n = int(0.35 * SR); return (tri(mtof(100), n) * 0.6 + pulse(mtof(100), n, 0.125) * 0.15) * env(n, 0.001, 0.3, 0.0, 0.05)
def sneaky():
    out = [];
    for m in (64, 63, 62, 61, 0, 59):
        n = int(0.09 * SR); out.append(np.zeros(n) if m == 0 else pulse(mtof(m), n, 0.125) * env(n, 0.001, 0.05, 0.0, 0.01) * 0.55)
    return np.concatenate(out)
def boing(): n = int(0.32 * SR); f = mtof(55) * 2 ** (np.sin(np.linspace(0, 9 * np.pi, n)) * 0.25 * np.linspace(1, 0, n) + np.linspace(0, 0.8, n)); return pulse(f, n, 0.25) * env(n, 0.002, 0.25, 0.0, 0.05) * 0.5
def power_down(): n = int(0.55 * SR); f = mtof(84) * 2 ** (-np.linspace(0, 3.2, n)); return (pulse(f, n, 0.5) * 0.4 + noise(n, 3) * 0.1 * np.linspace(1, 0, n)) * env(n, 0.002, 0.4, 0.3, 0.12)
def punch(): n = int(0.18 * SR); f = 160 * 2 ** (-np.linspace(0, 2.5, n)); return (tri(f, n) * 0.9 + noise(n, 4) * 0.25) * env(n, 0.001, 0.12, 0.0, 0.03)
def scan(): return np.concatenate([pulse(mtof(m), int(0.04 * SR), 0.125) * 0.35 for m in (72, 76, 79, 83, 86, 91, 95)])
def bleh():
    n = int(0.45 * SR); f = mtof(50) * 2 ** (np.linspace(0, -0.9, n) + 0.12 * np.sin(2 * np.pi * 14 * np.arange(n) / SR))
    return (pulse(f, n, 0.5) * 0.45 + noise(n, 6) * 0.08) * env(n, 0.01, 0.2, 0.6, 0.1)
def zap_chip(): n = int(0.25 * SR); f = mtof(90) * 2 ** (np.round(np.random.default_rng(3).uniform(-6, 6, n // 400 + 1)).repeat(400)[:n] / 12); return pulse(f, n, 0.125) * env(n, 0.001, 0.2, 0.0, 0.03) * 0.4
def warm_chord():
    n = int(0.9 * SR); return sum(pulse(mtof(m), n, 0.5, vib=0.1) for m in (65, 69, 72)) * env(n, 0.05, 0.4, 0.5, 0.3) * 0.18
def lab_hum(n): t = np.arange(n) / SR; return (tri(55, n) * 0.5 + pulse(110, n, 0.5) * 0.06) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * t))
def noise_sweep(dur, f0, f1, vol=0.3):
    from scipy.signal import butter, sosfilt
    n = int(dur * SR); x = np.random.default_rng(int(f0)).standard_normal(n); out = np.zeros(n); B = 64
    for k in range(0, n, n // B):
        fc = f0 * (f1 / f0) ** (k / n); sos = butter(2, [max(60, fc * 0.6), min(SR / 2.2, fc * 1.6)], btype="band", output="sos", fs=SR); out[k:k + n // B] = sosfilt(sos, x[k:k + n // B])
    return out / (np.max(np.abs(out)) + 1e-9) * env(n, dur * 0.3, dur * 0.5, 0.2, dur * 0.2) * vol

# ---------- digger-02 code sounds ----------
def fall_whistle(): n = int(0.6 * SR); f = mtof(91) * 2 ** (-np.linspace(0, 2.0, n)); return pulse(f, n, 0.25) * env(n, 0.005, 0.5, 0.6, 0.05) * 0.4
def counter(): return np.concatenate([pulse(mtof(76 + (k % 12)), int(0.05 * SR), 0.125) * env(int(0.05 * SR), 0.001, 0.03, 0.4, 0.01) * 0.35 for k in range(28)])
def bonk(): n = int(0.22 * SR); f = mtof(64) * 2 ** (-np.linspace(0, 1.0, n)); return (tri(f, n) * 0.9 + pulse(f, n, 0.5) * 0.15) * env(n, 0.001, 0.15, 0.0, 0.04)
def bricks(): return np.concatenate([np.concatenate([pop_chip(), np.zeros(int(0.06 * SR))]) for _ in range(3)])
F = lambda k: f"{CAND}/{k}/" + sorted(x for x in os.listdir(f"{CAND}/{k}") if x.endswith(".mp3") and x.split(".")[0] == str(PICK[k]))[0]
E = lambda k, i: f"{CAND}/ep01/{k}_{i}.mp3"
P = lambda k: f"{EP1}/" + k
PICK = {k: v["freesound_id"] for k, v in json.load(open(f"{CAND}/picks.json")).items() if isinstance(v, dict) and "freesound_id" in v}
# ---------- cue -> sound ----------
def S(kind):
    """returns (signal, gain dB, offset s) for a cue kind; None = handled elsewhere/silent"""
    R = {
        "shovel_snow": lambda: (onset_cut(load(E("snow_shovel", 560957)), 0.5), -9, -0.02),
        "snow_toss": lambda: (onset_cut(load(E("snow_step", 420549)), 0.35), -14, 0),
        "snow_step": lambda: (onset_cut(load(E("snow_step", 420549)), 0.4), -13, 0),
        "dig_down": lambda: (onset_cut(load(E("snow_shovel", 560957)), 0.6), -11, 0),
        "clink": lambda: (onset_cut(load(F("pottery_clink")), 0.8), -6, -0.005),
        "ceramic_clink": lambda: (onset_cut(load(F("pottery_clink")), 0.8), -10, 0),
        "lid_rattle": lambda: (onset_cut(load(F("pottery_clink")), 0.6), -12, 0),
        "pot_slide": lambda: (noise_sweep(0.45, 400, 1500, 0.5), -20, 0),
        "scan": lambda: (scan(), -16, 0), "sting": lambda: (sting(), -13, 0), "sting_small": lambda: (sting((76, 83, 88), 0.06), -15, 0),
        "label": lambda: (blip_up(), -14, 0), "ding": lambda: (ting(), -16, 0.05), "blip": lambda: (blip_up((88, 81), 0.06), -15, 0),
        "wind_gust": lambda: (window(load(E("wind", 454213)), 3.0, 1.6, 0.3), -13, 0),
        "bubbling": lambda: (window(load(F("bubbling_sewer")), 0.5, 2.0, 0.2), -15, 0),
        "fly_buzz": lambda: (window(load(F("fly_buzz")), 0.3, 1.8, 0.2), -17, 0),
        "wood_thud": lambda: (onset_cut(load(F("wood_thud")), 0.5), -10, -0.01),
        "wood_knock": lambda: (onset_cut(load(F("wood_thud")), 0.4), -14, 0),
        "door_creak": lambda: (window(load(F("wood_door_creak")), 0.0, 1.2, 0.05), -14, 0),
        "teeth_chatter": lambda: (window(load(P("teeth/732995.mp3")), 0.0, 1.2, 0.05), -15, 0),
        "rooster": lambda: (window(load(F("rooster_morning")), 0.0, 2.0, 0.1), -17, 0),
        "shutters": lambda: (window(load(F("window_open")), 0.0, 0.9, 0.04), -13, 0),
        "swing_whoosh": lambda: (noise_sweep(0.45, 500, 2500, 0.5), -17, -0.05),
        "slosh": lambda: (window(load(F("splash_liquid_street")), 0.0, 0.8, 0.03), -12, 0),
        "fall_whistle": lambda: (fall_whistle(), -18, 0),
        "splat": lambda: (onset_cut(load(F("splat")), 0.8), -6, -0.01),
        "footsteps": lambda: (window(load(F("cobble_footsteps")), 0.5, 2.2, 0.15), -17, 0),
        "yelp": lambda: (blip_up((84, 96), 0.05, 0.5, 0.5), -15, 0),
        "gross": lambda: (bleh(), -15, 0.05), "gag": lambda: (bleh(), -19, 0.05),
        "tank_slosh": lambda: (window(load(F("water_tank_gush")), 0.0, 1.0, 0.1), -18, 0),
        "chain": lambda: (onset_cut(load(F("chain_pull")), 0.9), -11, 0),
        "flush": lambda: (window(load(F("toilet_flush")), 0.0, 3.4, 0.2), -7, 0),
        "tank_gush": lambda: None,
        "drain_gurgle": lambda: (window(load(F("bubbling_sewer")), 1.0, 2.2, 0.2), -15, 0),
        "sewer_flow": lambda: (window(load(F("water_pour_fill")), 0.5, 1.6, 0.3), -18, 0),
        "sewer_bubble": lambda: (window(load(F("bubbling_sewer")), 2.0, 1.8, 0.2), -14, 0),
        "gas_hiss": lambda: (window(load(F("gas_hiss")), 0.2, 1.2, 0.15), -17, 0),
        "whoosh_up": lambda: (noise_sweep(0.6, 700, 4000, 0.5), -17, -0.1), "whoosh_small": lambda: (noise_sweep(0.35, 900, 3500, 0.5), -19, -0.05),
        "punch": lambda: (punch(), -13, -0.01),
        "mailbox_creak": lambda: (window(load(E("mailbox", 508281)), 0.0, 0.9, 0.04), -16, 0),
        "paper": lambda: (load(K("paper/fs-151221-page-turn-2-2")), -16, 0),
        "comment_pop": lambda: (notif(), -11, 0), "wink_ting": lambda: (ting(), -14, 0),
        "pipe_creak": lambda: (window(load(F("metal_pipe_bend_creak")), 0.0, 1.6, 0.1), -15, 0),
        "ticking": lambda: (window(load(F("watch_ticking")), 0.0, 2.0, 0.1), -16, 0),
        "water_pour": lambda: (window(load(F("water_pour_fill")), 0.0, 1.4, 0.15), -15, 0),
        "water_drip": lambda: (onset_cut(load(F("drip")), 0.5), -15, 0),
        "bonk": lambda: (bonk(), -13, 0), "brick_pop": lambda: (bricks(), -16, 0), "counter": lambda: (counter(), -19, 0),
        "puff": lambda: (noise_sweep(0.35, 300, 1200, 0.5), -16, 0),
        "shrug_boing": lambda: (boing(), -15, 0), "question_pop": lambda: (pop_chip(), -14, 0), "follow_pop": lambda: (notif(), -12, 0),
        "end_jingle": lambda: None, "wind_start": lambda: None, "night_wind": lambda: None, "night_crickets": lambda: None, "cut": lambda: None,
        "mosaic": lambda: (onset_cut(load(K("swish/fs-14175-27-wav-1")), 0.35), -24, -0.1),
    }
    return R[kind]() if kind in R else None

sfx = np.zeros(N); missing = set(); log = []
for c in meta["cues"]:
    r = S(c["kind"])
    if r is None:
        if c["kind"] not in ("end_jingle", "wind_start", "night_wind", "night_crickets", "cut", "tank_gush"): missing.add(c["kind"])
        continue
    x, g, off = r
    x = norm_peak(x, -1) * db(g); place(sfx, x, c["t"] + off); log.append((round(c["t"] + off, 2), c["kind"]))

# ---------- ambience beds by shot (crossfaded 0.15 s at the boundaries) ----------
amb = np.zeros(N)
wind = load(E("wind", 454213)); room = load(F("room_tone")); crick = load(F("night_crickets")); birds = load(P("birds/733782.mp3"))
sewer = load(F("bubbling_sewer")); tick = load(F("watch_ticking"))
beds = {"wind": norm_peak(loop_to(wind, N), -1) * db(-21), "room": norm_peak(loop_to(room, N), -1) * db(-24),
        "night": norm_peak(loop_to(window(crick, 0.5, 12, 0.5), N), -1) * db(-27), "birds": norm_peak(loop_to(window(birds, 2, 20, 0.5), N), -1) * db(-22),
        "sewer": norm_peak(loop_to(window(sewer, 0.2, 6, 0.4), N), -1) * db(-25), "tick": norm_peak(loop_to(window(tick, 0, 8, 0.3), N), -1) * db(-27),
        "lab": norm_peak(lab_hum(N), -1) * db(-27)}
def gate(i):
    a, b = T0[i], T0[i + 1]; g = np.zeros(N); f = int(0.15 * SR); i0, i1 = int(a * SR), int(b * SR)
    g[max(0, i0 - f):i1 + f] = 1
    if i0 - f > 0: g[i0 - f:i0 + f] = np.linspace(0, 1, 2 * f)
    if i1 + f < N: g[i1 - f:i1 + f] = np.linspace(1, 0, 2 * f)
    return g
BED = {**{k: ["wind"] for k in (1, 2, 3, 4, 5, 6, 7, 21, 22, 28, 30, 31, 32)}, 8: ["wind", "night"], 9: ["room", "night"], 10: ["room", "night"],
       **{k: ["birds", "room"] for k in (11, 12, 13, 14)}, **{k: ["room"] for k in (15, 16, 17, 20)}, 18: ["room", "sewer"], 19: ["room", "sewer"],
       **{k: ["room", "tick"] for k in (23, 24, 25)}, **{k: ["lab"] for k in (26, 27, 29)}}
for i in range(len(shots)):
    g = gate(i)
    for b in BED.get(i + 1, []): amb += beds[b] * g
amb[int((TL["dur"] + 1.6) * SR):] *= np.linspace(1, 0, len(amb) - int((TL["dur"] + 1.6) * SR))
sh = int(1.7 * SR); ambS = np.column_stack([amb, np.concatenate([amb[sh:], amb[:sh]]) * 0.6 + amb * 0.4])

# ---------- voice + ducked music ----------
vx, vsr = sf.read(f"{ROOT}/voz-studio/takes/{V}_track_clean.wav"); vx = vx.mean(1) if vx.ndim > 1 else vx
if vsr != SR:
    from scipy.signal import resample_poly; vx = resample_poly(vx, SR, vsr)
voice = np.zeros(N); voice[:min(N, len(vx))] = vx[:N]
from scipy.signal import butter, sosfilt
def stem(k):
    x, _ = sf.read(f"{ROOT}/audio/{V}/music3_stem_{k}.wav"); y = np.zeros(N); y[:min(N, len(x))] = x[:N]; return y
PAN = {"bass": 0.0, "drums": 0.0, "marimba": -0.3, "pluck": 0.2, "box": 0.35, "pad": 0.0, "sting": 0.0}   # v3: music2.py (sinaboto-style bed)
music = np.zeros((N, 2))
for k, p_ in PAN.items():
    x = stem(k)
    if k == "pad": d = int(0.014 * SR); music[:, 0] += x; music[:, 1] += np.concatenate([np.zeros(d), x[:-d]])   # Haas width
    else: music[:, 0] += x * np.sqrt(0.5 * (1 - p_)) * 1.41; music[:, 1] += x * np.sqrt(0.5 * (1 + p_)) * 1.41
# bed EQ: -2.5 dB around 2.2 kHz (leave room for the voice), +3 dB low shelf under 90 Hz (sub weight)
def peq(x, f0, gdb, q=1.0):
    from scipy.signal import tf2sos
    A = 10 ** (gdb / 40); w0 = 2 * np.pi * f0 / SR; al = np.sin(w0) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w0), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w0), 1 - al / A]
    return sosfilt(tf2sos(b, a), x, axis=0)
music = sosfilt(butter(2, 30 / (SR / 2), btype='high', output='sos'), music, axis=0)   # pulse waves carry DC: remove it
music = peq(music, 2200, -2.5, 0.8)
music += sosfilt(butter(2, 90 / (SR / 2), output="sos"), music, axis=0) * 0.4
# sidechain: voice RMS (20 ms) -> duck up to 9 dB, attack 25 ms, release 300 ms
w = int(0.02 * SR); e = np.sqrt(np.convolve(voice ** 2, np.ones(w) / w, "same")); act = (20 * np.log10(e + 1e-9) > -38).astype(float)
g = np.zeros(N); at, rl = 1 - np.exp(-1 / (0.025 * SR)), 1 - np.exp(-1 / (0.3 * SR)); y = 0.0
for i in range(0, N, 32):
    tgt = act[i]; y += ((at if tgt > y else rl) * 32) * (tgt - y); y = min(1, max(0, y)); g[i:i + 32] = y
music_d = music * db(-7 * g)[:, None]
meter = pyln.Meter(SR)
def lufs(x): return meter.integrated_loudness(x if x.ndim == 2 else np.column_stack([x, x]))
voice_l = lufs(voice)
music_d *= db((voice_l - 7) - lufs(music_d))          # bed ~7 dB under the voice overall -> ~12-13 dB under it while she talks
hp = butter(2, 30 / (SR / 2), btype='high', output='sos'); sfx = sosfilt(hp, sfx) * db(-2); ambS = sosfilt(hp, ambS, axis=0)
mix = voice[:, None] + music_d + sfx[:, None] + ambS
# master: -14 LUFS integrated, true-peak-safe limiter (-1 dBTP, 4x oversampled look)
mix *= db(-14 - lufs(mix))
from scipy.signal import resample_poly
def limiter(x, ceil_db=-1.2):
    c = db(ceil_db); up = resample_poly(x, 4, 1, axis=0); pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:len(x)]
    need = np.minimum(1, c / (pk + 1e-12)); la = int(0.003 * SR)
    from scipy.ndimage import minimum_filter1d
    gmin = minimum_filter1d(need, size=2 * la + 1); rel = 1 - np.exp(-1 / (0.06 * SR)); out = np.empty_like(gmin); y = 1.0
    for i in range(len(gmin)):
        y = gmin[i] if gmin[i] < y else y + rel * (gmin[i] - y); out[i] = y
    return x * out[:, None]
mix = limiter(mix); mix *= db(-14 - lufs(mix)); mix = limiter(mix)
os.makedirs(f"{ROOT}/audio/{V}", exist_ok=True)
for name, x in (("voice", voice), ("music_ducked", music_d), ("sfx", sfx), ("amb", ambS)): sf.write(f"{ROOT}/audio/{V}/stem_mix_{name}.wav", x.astype(np.float32), SR)
sf.write(f"{ROOT}/audio/{V}/{OUTN}.wav", mix.astype(np.float32), SR, subtype="FLOAT")
up = resample_poly(mix, 4, 1, axis=0)
print(V, "mix", round(N / SR, 2), "s  LUFS", round(lufs(mix), 2), " TP", round(20 * np.log10(np.abs(up).max()), 2), "dBTP  voice", round(lufs(voice), 1),
      " music(ducked)", round(lufs(music_d), 1), " sfx", round(lufs(sfx), 1), " amb", round(lufs(amb), 1), " missing", missing)
json.dump(log, open(f"{ROOT}/audio/{V}/sfx_log.json", "w"))

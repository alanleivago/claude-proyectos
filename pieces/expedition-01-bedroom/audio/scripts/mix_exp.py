# mix_exp.py VOICE -> audio/<VOICE>/mix.wav (+ stems): Expedition 01 "the bedroom".
# voice (clean chain) + original MML2-style music (music_exp.py, ducked under the voice) + ambience beds per paragraph area
# + SFX on the film's cues (engine/review_meta.json). Menu SFX: the user's Mega Man Legends set (assets/, ITEM GET / cursor
# / menu open); foley: Freesound CC0 (audio/cand + earlier episodes, see CREDITS.md); retro blips/stingers in code (chip.py
# from digger-04). Master -12 LUFS integrated, true peak <= -1 dBTP.
import sys, os, json, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
sys.path.insert(0, r"F:/Claude Proyectos/pieces/digger-04-alarm/audio/scripts")
from chip import *
from scipy.signal import butter, sosfilt, resample_poly
V = sys.argv[1]
ROOT = r"F:/Claude Proyectos/pieces/expedition-01-bedroom"; P = r"F:/Claude Proyectos/pieces"; KIT = r"F:/Claude Proyectos/sound-layer/kit"
MML = r"F:/Claude Proyectos/assets/megaman legends sfx general"
meta = json.load(open(f"{ROOT}/engine/review_meta.json", encoding="utf-8")); TL = json.load(open(f"{ROOT}/engine/timeline_{V}.json", encoding="utf-8"))
DUR = meta["film"]["dur"]; N = int(DUR * SR)
_cache = {}
def load(path):
    if path in _cache: return _cache[path]
    if not path.endswith(".wav"):
        raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, timeout=120, env=dict(os.environ)).stdout
        x = np.frombuffer(raw, np.float32).astype(np.float64)
    else:
        x, sr = sf.read(path); x = x.mean(1) if x.ndim > 1 else x
        if sr != SR: x = resample_poly(x, SR, sr)
    _cache[path] = x; return x
def db(x): return 10 ** (x / 20)
def norm_peak(x, pk_db): m = np.max(np.abs(x)) + 1e-9; return x / m * db(pk_db)
def onset_cut(x, maxlen, pre=0.004, thr=-38, tail_thr=-48):
    a = np.abs(x); pk = a.max() + 1e-9; i0 = int(np.argmax(a > pk * db(thr))); i0 = max(0, i0 - int(pre * SR)); seg = x[i0:i0 + int(maxlen * SR)]
    w = int(0.01 * SR); e = np.array([np.sqrt(np.mean(seg[k:k + w] ** 2)) for k in range(0, max(1, len(seg) - w), w)])
    lv = 20 * np.log10(e / (e.max() + 1e-9) + 1e-9); after = np.where(lv[5:] < tail_thr)[0]; end = (after[0] + 5) * w if len(after) else len(seg)
    seg = seg[:max(end, int(0.05 * SR))].copy(); f = min(len(seg) // 4, int(0.008 * SR)); seg[-f:] *= np.linspace(1, 0, f); return seg
def window(x, start, dur, fade=0.03):
    s = x[int(start * SR):int((start + dur) * SR)].copy(); f = int(fade * SR)
    if len(s) > 2 * f: s[:f] *= np.linspace(0, 1, f); s[-f:] *= np.linspace(1, 0, f)
    return s
def loop_to(x, n, xf=0.25):
    out = np.zeros(n); f = int(xf * SR); pos = 0
    while pos < n:
        seg = x.copy(); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f); k = min(len(seg), n - pos); out[pos:pos + k] += seg[:k]; pos += len(seg) - f
    return out
K = lambda p: f"{KIT}/{p}.wav"; M_ = lambda n: f"{MML}/sfx-{n}1.wav"
A = lambda k, i: f"{ROOT}/audio/cand/{k}/{i}.mp3"
D2 = lambda k, i: f"{P}/digger-02-toilet/audio/cand/{k}/{i}.mp3"; D3 = lambda k, i: f"{P}/digger-03-lock/audio/cand/{k}/{i}.mp3"; D4 = lambda k, i: f"{P}/digger-04-alarm/audio/cand/{k}/{i}.mp3"
R3 = lambda n: f"{P}/digger-03-lock/audio/cand/reuse/{n}.mp3"
# ---------- code sounds ----------
def blip_up(notes=(76, 83), d=0.055, duty=0.125, vol=0.6): return np.concatenate([pulse(mtof(m), int(d * SR), duty=duty) * env(int(d * SR), 0.001, 0.03, 0.6, 0.01) for m in notes]) * vol
def sting(notes=(72, 76, 79, 84), d=0.07): return blip_up(notes, d, 0.25, 0.55)
def boing(): n = int(0.32 * SR); f = mtof(55) * 2 ** (np.sin(np.linspace(0, 9 * np.pi, n)) * 0.25 * np.linspace(1, 0, n) + np.linspace(0, 0.8, n)); return pulse(f, n, 0.25) * env(n, 0.002, 0.25, 0.0, 0.05) * 0.5
def scan(): return np.concatenate([pulse(mtof(m), int(0.04 * SR), 0.125) * 0.35 for m in (72, 76, 79, 83, 86, 91, 95)])
def det_beep(f=1800, d=0.07): n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * env(n, 0.003, d * 0.6, 0.3, 0.02) * 0.6
def rewind():   # tape-rewind whirr: falling pulse sweep + chattering noise
    n = int(0.9 * SR); f = mtof(96) * 2 ** (-np.linspace(0, 2.5, n)); x = pulse(f, n, 0.25) * 0.3 + noise(n, 3) * 0.12 * (np.sin(np.arange(n) / SR * 2 * np.pi * 22) > 0)
    return x * env(n, 0.02, 0.6, 0.6, 0.2)
def charge(): n = int(1.2 * SR); f = mtof(60) * 2 ** (np.linspace(0, 2.0, n)); return (pulse(f, n, 0.5) * 0.25 + tri(f * 0.5, n) * 0.3) * env(n, 0.05, 0.9, 0.6, 0.2)
def snooze_beep(): return np.concatenate([np.concatenate([det_beep(2600, 0.06), np.zeros(int(0.06 * SR))]) for _ in range(4)])
def puff():
    n = int(0.11 * SR); x = sosfilt(butter(2, [500 / (SR / 2), 2600 / (SR / 2)], btype="band", output="sos"), np.random.default_rng(4).standard_normal(n)); return x * env(n, 0.004, 0.06, 0.0, 0.03) * 0.8
def boss(): n = int(1.4 * SR); return (pulse(mtof(40), n, 0.5) * 0.4 + pulse(mtof(46), n, 0.5) * 0.3 + noise(n, 8) * 0.08) * env(n, 0.01, 0.8, 0.5, 0.4)
def lab_hum(n): t = np.arange(n) / SR; return (tri(55, n) * 0.5 + pulse(110, n, 0.5) * 0.05) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * t))
def S(kind):
    R = {
        "detector_beep": lambda: (det_beep(), -16, 0), "scan": lambda: (scan(), -16, 0), "sting": lambda: (sting(), -13, 0), "label": lambda: (blip_up(), -16, 0), "blip": lambda: (blip_up((88, 81), 0.06), -15, 0),
        "cheer": lambda: (sting((76, 79, 84, 88), 0.06), -14, 0), "rewind": lambda: (rewind(), -12, 0), "charge": lambda: (charge(), -16, 0), "snooze_beep": lambda: (snooze_beep(), -14, 0),
        "spring_boing": lambda: (boing(), -15, 0), "pea_shot": lambda: (puff(), -12, 0), "boss_sting": lambda: (boss(), -11, 0),
        # the user's Mega Man Legends menu set
        "menu_cursor": lambda: (load(M_("cursor-move")), -16, 0), "menu_item_get": lambda: (load(M_("treasure-open")), -9, 0), "menu_open": lambda: (load(M_("cursor-select")), -12, 0),
        # CC0 foley (Freesound previews)
        "dirt_fall": lambda: (window(load(A("dirt_fall", 210867)), 0.0, 1.6, 0.08), -12, 0), "door_thud": lambda: (window(load(A("door_push", 216871)), 0.0, 1.2, 0.05), -10, -0.01),
        "land": lambda: (onset_cut(load(D2("wood_thud", 325267)), 0.6), -9, -0.01), "drawer": lambda: (onset_cut(load(A("drawer", 592190)), 1.2), -11, 0),
        "match": lambda: (onset_cut(load(A("match", 522166)), 1.4), -10, -0.01), "plug": lambda: (onset_cut(load(A("plug", 477641)), 0.4), -9, -0.01),
        "step_back": lambda: (onset_cut(load(A("zipper", 320144)), 0.7), -12, -0.02), "click": lambda: (onset_cut(load(D4("button_click", 243038)), 0.3), -10, -0.01),
        "candle_fizz": lambda: (window(load(D4("candle_flame", 461079)), 0.5, 3.0, 0.3), -20, 0), "fire_crackle": lambda: (window(load(D3("torch_fire_crackle", 872959)), 0.0, 4.0, 0.4), -18, 0),
        "buzz": lambda: (window(load(D2("fly_buzz", 443059)), 0.0, 2.6, 0.2), -17, 0), "snore": lambda: (window(load(D4("snoring", 795284)), 0.0, 2.2, 0.15), -15, 0),
        "tap_glass": lambda: (onset_cut(load(D4("glass_tap", 508400)), 0.3), -11, -0.01), "window_close": lambda: (onset_cut(load(D4("window_open", 371296)), 1.0), -10, -0.02),
        "window_open": lambda: (onset_cut(load(D4("window_open", 371296)), 1.0), -11, -0.02), "door_creak": lambda: (window(load(D2("wood_door_creak", 778447)), 0.0, 1.3, 0.05), -13, 0),
        "dig": lambda: (window(load(A("dirt_fall", 567249)), 0.0, 1.8, 0.1), -15, 0), "crowd_murmur": lambda: (window(load(D3("crowd_murmur", 260122)), 0.0, 5.0, 0.6), -19, 0),
        "page_turn": lambda: (load(K("paper/fs-151221-page-turn-2-2")), -14, 0),
        "mosaic": lambda: (onset_cut(load(K("swish/fs-14175-27-wav-1")), 0.35), -24, -0.1),
        "cut": lambda: None, "end_jingle": lambda: None, "town_ambience": lambda: None, "sea_waves": lambda: None,
    }
    return R[kind]() if kind in R else "missing"
sfx = np.zeros(N); missing = set(); log = []
QUIET = {"detector_beep", "menu_cursor", "label", "spring_boing", "candle_fizz", "buzz"}
for c in meta["cues"]:
    r = S(c["kind"])
    if r == "missing": missing.add(c["kind"]); continue
    if r is None: continue
    x, g, off = r; g -= 3 if c["kind"] in QUIET else 0
    x = norm_peak(x, -1) * db(g); place(sfx, x, c["t"] + off); log.append((round(c["t"] + off, 2), c["kind"]))
# ---------- ambience beds by paragraph area (crossfaded 0.3 s) ----------
W = TL["words"]; pstart = lambda p: min(w[1] for w in W if w[3] == p)
src = {"room": loop_to(load(R3("room_tone_744447")), N), "drip": loop_to(window(load(D3("water_drip", 466559)), 0, 12, 0.5), N), "birds": loop_to(window(load(D4("birds_morning", 468236)), 0.5, 20, 0.5), N),
       "wind": loop_to(load(R3("wind_454213")), N), "cave": loop_to(window(load(A("cave_amb", 392668)), 0.5, 25, 0.5), N), "fire": loop_to(window(load(D3("torch_fire_crackle", 872959)), 0.3, 10, 0.4), N),
       "town": loop_to(window(load(A("town_day", 847110)), 1.0, 40, 0.8), N), "night": loop_to(window(load(R3("night_crickets_451566")), 0.5, 12, 0.5), N), "lab": lab_hum(N)}
LVL = {"room": -27, "drip": -31, "birds": -25, "wind": -24, "cave": -28, "fire": -24, "town": -24, "night": -27, "lab": -31}
beds = {k: norm_peak(x, -1) * db(LVL[k]) for k, x in src.items()}
AREA = {1: ["birds", "wind"], 4: ["wind", "birds"], 5: ["room", "drip"], 9: ["cave", "fire"], 10: ["room"], 11: ["room", "drip"], 13: ["room"], 16: ["room", "drip"], 17: ["room"], 18: ["town"],
        19: ["room"], 20: ["lab"], 24: ["room", "drip"], 25: ["room", "fire"], 26: ["night"], 28: ["lab"], 31: ["room", "drip"], 33: ["room"], 34: ["room", "drip"], 35: ["room"], 37: ["room", "drip"],
        38: ["lab"], 39: ["room", "drip"], 42: ["night"], 43: ["lab"], 46: ["room", "drip"], 48: ["room"], 49: ["birds"]}
ks = sorted(AREA); amb = np.zeros(N)
for i, p in enumerate(ks):
    a = pstart(p) - 0.3; b = pstart(ks[i + 1]) - 0.3 if i + 1 < len(ks) else DUR
    g = np.zeros(N); f = int(0.3 * SR); i0, i1 = max(0, int(a * SR)), min(N, int(b * SR)); g[i0:i1] = 1
    if i0 > 0: g[max(0, i0 - f):i0 + f] = np.linspace(0, 1, len(g[max(0, i0 - f):i0 + f]))
    if i1 < N: g[i1 - f:min(N, i1 + f)] = np.linspace(1, 0, len(g[i1 - f:min(N, i1 + f)]))
    for k in AREA[p]: amb += beds[k] * g
amb[int((TL["dur"] + 1.6) * SR):] *= np.linspace(1, 0, len(amb) - int((TL["dur"] + 1.6) * SR))
sh = int(1.7 * SR); ambS = np.column_stack([amb, np.concatenate([amb[sh:], amb[:sh]]) * 0.6 + amb * 0.4])
# ---------- voice + ducked music ----------
vx, vsr = sf.read(f"{ROOT}/voz/takes/{V}_track_clean.wav"); vx = vx.mean(1) if vx.ndim > 1 else vx
if vsr != SR: vx = resample_poly(vx, SR, vsr)
voice = np.zeros(N); voice[:min(N, len(vx))] = vx[:N]
def stem(k): x, _ = sf.read(f"{ROOT}/audio/{V}/music_exp_stem_{k}.wav"); y = np.zeros(N); y[:min(N, len(x))] = x[:N]; return y
PAN = {"bass": 0.0, "drums": 0.0, "marimba": -0.3, "pluck": 0.2, "box": 0.35, "pad": 0.0, "reed": -0.15, "jingle": 0.0}
music = np.zeros((N, 2))
for k, p_ in PAN.items():
    x = stem(k) * {"drums": db(-3), "marimba": db(-1)}.get(k, 1.0)
    if k == "pad": d = int(0.014 * SR); music[:, 0] += x; music[:, 1] += np.concatenate([np.zeros(d), x[:-d]])
    else: music[:, 0] += x * np.sqrt(0.5 * (1 - p_)) * 1.41; music[:, 1] += x * np.sqrt(0.5 * (1 + p_)) * 1.41
def peq(x, f0, gdb, q=1.0):
    from scipy.signal import tf2sos
    A_ = 10 ** (gdb / 40); w0 = 2 * np.pi * f0 / SR; al = np.sin(w0) / (2 * q); b = [1 + al * A_, -2 * np.cos(w0), 1 - al * A_]; a = [1 + al / A_, -2 * np.cos(w0), 1 - al / A_]
    return sosfilt(tf2sos(b, a), x, axis=0)
music = sosfilt(butter(2, 30 / (SR / 2), btype='high', output='sos'), music, axis=0); music = peq(music, 2200, -2.5, 0.8)
music += sosfilt(butter(2, 90 / (SR / 2), output="sos"), music, axis=0) * 0.4
w = int(0.02 * SR); e = np.sqrt(np.convolve(voice ** 2, np.ones(w) / w, "same")); act = (20 * np.log10(e + 1e-9) > -38).astype(float)
g = np.zeros(N); at, rl = 1 - np.exp(-1 / (0.025 * SR)), 1 - np.exp(-1 / (0.3 * SR)); y = 0.0
for i in range(0, N, 32):
    tgt = act[i]; y += ((at if tgt > y else rl) * 32) * (tgt - y); y = min(1, max(0, y)); g[i:i + 32] = y
music_d = music * db(-10 * g)[:, None]   # v2 (user: music too loud vs the voice): 10 dB duck while she talks
meter = pyln.Meter(SR)
def lufs(x): return meter.integrated_loudness(x if x.ndim == 2 else np.column_stack([x, x]))
voice_l = lufs(voice); music_d *= db((voice_l - 13) - lufs(music_d))   # v2: bed 13 LU under the voice overall (was 7)
hp = butter(2, 30 / (SR / 2), btype='high', output='sos'); sfx = sosfilt(hp, sfx) * db(-2); ambS = sosfilt(hp, ambS, axis=0)
mix = voice[:, None] + music_d + sfx[:, None] + ambS
TARGET = -12.0
mix *= db(TARGET - lufs(mix))
def limiter(x, ceil_db=-1.8):   # -1.8: AAC adds ~0.3 dB of overshoot (v1 measured -0.9 dBTP after encoding)
    c = db(ceil_db); up = resample_poly(x, 4, 1, axis=0); pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:len(x)]
    need = np.minimum(1, c / (pk + 1e-12)); la = int(0.003 * SR)
    from scipy.ndimage import minimum_filter1d
    gmin = minimum_filter1d(need, size=2 * la + 1); rel = 1 - np.exp(-1 / (0.06 * SR)); out = np.empty_like(gmin); y = 1.0
    for i in range(len(gmin)):
        y = gmin[i] if gmin[i] < y else y + rel * (gmin[i] - y); out[i] = y
    limiter.max_gr = max(getattr(limiter, 'max_gr', 0.0), float(-20 * np.log10(out.min() + 1e-12))); return x * out[:, None]
mix = limiter(mix); mix *= db(TARGET - lufs(mix)); mix = limiter(mix)
os.makedirs(f"{ROOT}/audio/{V}", exist_ok=True)
for name, x in (("voice", voice), ("music_ducked", music_d), ("sfx", sfx), ("amb", ambS)): sf.write(f"{ROOT}/audio/{V}/stem_mix_{name}.wav", x.astype(np.float32), SR)
sf.write(f"{ROOT}/audio/{V}/mix.wav", mix.astype(np.float32), SR, subtype="FLOAT")
up = resample_poly(mix, 4, 1, axis=0)
print(V, "mix", round(N / SR, 2), "s  LUFS", round(lufs(mix), 2), " TP", round(20 * np.log10(np.abs(up).max()), 2), "dBTP  voice", round(lufs(voice), 1),
      " music(ducked)", round(lufs(music_d), 1), " sfx", round(lufs(sfx), 1), " amb", round(lufs(amb), 1), " limiter max GR", round(limiter.max_gr, 1), " missing", missing)
json.dump(log, open(f"{ROOT}/audio/{V}/sfx_log.json", "w"))

# builds audio/scripts/music_d08.py (+ an "era" stem: each era's sound, ORIGINAL melodies on CC0 samples / code) and mix_d08.py
D7 = r"F:/Claude Proyectos/pieces/digger-07-navigation/audio/scripts"; D8 = r"F:/Claude Proyectos/pieces/digger-08-music/audio/scripts"
m = open(f"{D7}/music_d07.py", encoding="utf-8").read()
a = m[m.index("PMAP = {"):m.index("\n", m.index("PMAP = {"))]
m = m.replace(a, 'PMAP = {1: "manual", 2: "past", 4: "dungeon", 6: "past", 7: "closing"}   # digger 08: parlor / ballroom + Geneva / Edison + gramophone / radio / Walkman + streaming + goodbye')
m = m.replace('stems = {k: np.zeros(N) for k in ("bass", "pluck", "marimba", "box", "drums", "pad", "reed", "jingle")}', 'stems = {k: np.zeros(N) for k in ("bass", "pluck", "marimba", "box", "drums", "pad", "reed", "jingle", "era")}')
ERA = r'''
# ---------------- ERA SOUNDS (digger 08): one short ORIGINAL phrase per era at the film's cues; the area music steps back under it ----------------
from scipy.signal import butter as _bt
META = json.load(open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), "review_meta.json"), encoding="utf-8"))
MEL = [(74, 1), (78, 1), (81, 1), (79, 0.5), (78, 0.5), (76, 1), (74, 1), (76, 1), (78, 2)]   # an original little minuet line (D major)
def line(inst, base=0, beat=0.27, vel=1.0):
    n = int(sum(d for _, d in MEL) * beat * SR) + SR; x = np.zeros(n); t = 0.0
    for mm, d in MEL:
        y = inst(mm + base, d * beat * 0.95) * vel; i = int(t * SR); x[i:i + len(y)] += y[:n - i]; t += d * beat
    return x
def bass_line(beat=0.27):
    n = int(sum(d for _, d in MEL) * beat * SR) + SR; x = np.zeros(n)
    for k, mm in enumerate([50, 57, 54, 57, 50, 57, 55, 57, 50]): y = pizz(mm, beat * 0.9) * 0.7; i = int(k * beat * SR); x[i:i + len(y)] += y[:n - i]
    return x
def band(x, lo, hi): return sosfilt(_bt(2, [lo / (SR / 2), hi / (SR / 2)], btype="band", output="sos"), x)
def crackle(n, dens=40, amp=0.25, seed=5):
    r = np.random.default_rng(seed); x = np.zeros(n); idx = r.integers(0, n, int(n / SR * dens)); x[idx] = r.uniform(-1, 1, len(idx)) * amp
    return x + sosfilt(_bt(2, [800 / (SR / 2), 6000 / (SR / 2)], btype="band", output="sos"), r.standard_normal(n)) * amp * 0.08
def era(kind):
    if kind == "band_play": x = line(clar) * 0.8 + bass_line() + line(marimba, 12) * 0.25
    elif kind == "sing_off": x = line(lambda mm, dur: reed(mm - 12 + (0.7 if mm % 2 else -0.6), dur, vib=6.0), beat=0.3) * 0.9
    elif kind == "musicbox_play": x = line(lambda mm, dur: musicbox(mm + 12, 1.0), beat=0.22) * 0.9
    elif kind == "phono_play": y = line(clar) * 0.8; y = np.tanh(2.5 * band(y, 700, 2400)); x = y * 0.7 + crackle(len(y), 60, 0.35)
    elif kind == "gramo_play": y = line(clar) * 0.7 + bass_line() * 0.8; y = np.tanh(1.6 * band(y, 300, 3800)); x = y * 0.8 + crackle(len(y), 35, 0.25, 7)
    elif kind == "radio_static": n = int(1.0 * SR); r = np.random.default_rng(3); x = band(r.standard_normal(n), 900, 4500) * 0.5 * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 7))
    elif kind == "radio_play": y = line(clar) * 0.8 + bass_line() * 0.7 + line(marimba, 12) * 0.2; y = band(y, 400, 3200); x = y + band(np.random.default_rng(4).standard_normal(len(y)), 1000, 5000) * 0.04
    elif kind == "walkman_play":
        y = line(marimba, 0) * 0.6 + line(clar) * 0.6 + bass_line() * 0.8; tt = np.arange(len(y)) / SR; idx = np.clip(np.arange(len(y)) + 0.004 * SR * np.sin(2 * np.pi * 1.3 * tt), 0, len(y) - 1)
        x = np.interp(idx, np.arange(len(y)), y) + band(np.random.default_rng(6).standard_normal(len(y)), 3000, 9000) * 0.05
    elif kind == "tape_tangle": n = int(0.8 * SR); tt = np.arange(n) / SR; f = 1400 * 2 ** (-tt * 3) * (1 + 0.05 * np.sin(2 * np.pi * 23 * tt)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.5) * 0.6
    elif kind == "stream_play": x = line(clar) * 0.7 + bass_line() + line(marimba, 12) * 0.4
    else: return None
    x = x / (np.abs(x).max() + 1e-9); f = int(0.05 * SR); x[-f:] *= np.linspace(1, 0, f); return x
GAIN = {"band_play": 0.55, "sing_off": 0.45, "musicbox_play": 0.5, "phono_play": 0.45, "gramo_play": 0.5, "radio_static": 0.35, "radio_play": 0.5, "walkman_play": 0.5, "tape_tangle": 0.4, "stream_play": 0.55}
ERAS = []
for c in META["cues"]:
    x = era(c["kind"])
    if x is None: continue
    place(stems["era"], x * GAIN[c["kind"]], c["t"]); ERAS.append((c["t"], c["t"] + len(x) / SR))
g = np.ones(N); fr = int(0.15 * SR)
for a0, b0 in ERAS:
    i0, i1 = max(0, int(a0 * SR) - fr), min(N, int(b0 * SR) + fr); g[i0:i1] = np.minimum(g[i0:i1], 0.25)
g = np.convolve(g, np.ones(fr) / fr, "same")
for k in stems:
    if k not in ("era", "jingle"): stems[k] *= g
'''
k = m.index('LV = {"bass": 1.15')
m = m[:k] + ERA + m[k:]
m = m.replace('LV = {"bass": 1.15, "pluck": 0.7, "marimba": 0.4, "box": 0.12, "drums": 0.42, "pad": 0.12, "reed": 0.34, "jingle": 0.6}', 'LV = {"bass": 1.15, "pluck": 0.7, "marimba": 0.4, "box": 0.12, "drums": 0.42, "pad": 0.12, "reed": 0.34, "jingle": 0.6, "era": 1.0}')
open(f"{D8}/music_d08.py", "w", encoding="utf-8").write(m)
x = open(f"{D7}/mix_d07.py", encoding="utf-8").read()
R = [
 ('ROOT = r"F:/Claude Proyectos/pieces/digger-07-navigation"', 'ROOT = r"F:/Claude Proyectos/pieces/digger-08-music"'),
 ('music_d07_stem_', 'music_d08_stem_'),
 ('PAN = {"bass": 0.0, "drums": 0.0, "marimba": -0.3, "pluck": 0.2, "box": 0.35, "pad": 0.0, "reed": -0.15, "jingle": 0.0}', 'PAN = {"bass": 0.0, "drums": 0.0, "marimba": -0.3, "pluck": 0.2, "box": 0.35, "pad": 0.0, "reed": -0.15, "jingle": 0.0}'),
 ('        "chime": lambda: (load(K("chime/fs-185822-single-chime-1")), -13, 0),',
  '        "band_play": lambda: None, "sing_off": lambda: None, "musicbox_play": lambda: None, "phono_play": lambda: None, "gramo_play": lambda: None, "radio_static": lambda: None, "radio_play": lambda: None, "walkman_play": lambda: None, "tape_tangle": lambda: None, "stream_play": lambda: None, "speak_horn": lambda: None,\n'
  '        "coins": lambda: (np.concatenate([load(K("chime/fs-127149-ding-wav-1"))[:int(0.25 * SR)] * 0.7, load(K("chime/fs-159011-ding2-wav-1"))[:int(0.35 * SR)]]), -16, 0), "crank": lambda: (np.concatenate([onset_cut(load(C7("stone_tap", 402145)), 0.12) for _ in range(6)]), -16, 0),\n'
  '        "foil_rip": lambda: (np.random.default_rng(8).standard_normal(int(0.35 * SR)) * np.exp(-np.arange(int(0.35 * SR)) / SR * 9), -15, 0), "disc_drop": lambda: (onset_cut(load(D2("wood_thud", 325267)), 0.4), -14, 0),\n'
  '        "pencil_wind": lambda: (np.concatenate([onset_cut(load(C7("stone_tap", 350343)), 0.08) * 0.6 for _ in range(8)]), -18, 0), "pile": lambda: (np.concatenate([onset_cut(load(D2("wood_thud", 325267)), 0.2) for _ in range(5)]), -16, 0),\n'
  '        "chime": lambda: (load(K("chime/fs-185822-single-chime-1")), -13, 0),'),
]
for a, b in R:
    assert x.count(a) == 1, a[:70]; x = x.replace(a, b)
# the era stem: its own level, a gentler duck than the music bed (it is the subject of the line)
a = 'music_d = music * db(-10 * g)[:, None]'
assert a in x
x = x.replace(a, 'era = np.zeros((N, 2)); _e = stem("era"); era[:, 0] = _e; era[:, 1] = _e\nmusic_d = music * db(-10 * g)[:, None]')
a = 'mix = voice[:, None] + music_d + sfx[:, None] + ambS'
assert a in x
x = x.replace(a, 'era_d = era * db(-6 * g)[:, None]; era_d *= db((voice_l - 9) - lufs(era_d + 1e-9))   # era sounds ~9 LU under the voice (audible, voice on top)\nmix = voice[:, None] + music_d + era_d + sfx[:, None] + ambS')
i = x.index("AREA = {"); j = x.index("\n", i)
x = x[:i] + 'AREA = {1: ["room", "birds"], 2: ["room"], 3: ["room", "birds"], 4: ["room"], 5: ["room", "fire"], 6: ["room"], 7: ["birds", "town"], 8: ["town"], 9: ["night"]}' + x[j:]
x = x.replace('C7 = lambda k, i: f"{P}/digger-07-navigation/audio/cand/{k}/{i}.mp3";', 'C7 = lambda k, i: f"{P}/digger-07-navigation/audio/cand/{k}/{i}.mp3";', 1)
open(f"{D8}/mix_d08.py", "w", encoding="utf-8").write(x); print("ok")

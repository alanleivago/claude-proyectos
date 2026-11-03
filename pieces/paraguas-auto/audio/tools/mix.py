# mix.py: the whole soundtrack of paraguas-auto, deterministic.
#   voice (voice/voice.wav) + music (Kevin MacLeod "Ethernight Club", CC BY 4.0, low, ducked under the voice)
#   + ambience beds (rain on the street / under the umbrella / on the cab roof) + recorded foley on every cue (audio/cues.json)
#   + a code-synth layer for presence (sub thumps, whooshes, the crash boom, the motor whine) -> master to -14 LUFS.
# Writes audio/work/premix.wav, audio/stems/*.wav, audio/final.wav. Run with the earshot venv python.
import json, os, sys, zlib
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal

SR = 48000
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PIECE = os.path.dirname(A)
C = json.load(open(os.path.join(A, "cues.json"))); DUR = float(C["duration"]); N = int(DUR * SR)
LUCK = os.path.join(PIECE, "..", "luckier", "audio", "assets")
db = lambda d: 10 ** (d / 20)

def load(p):
    x, sr = sf.read(p, dtype="float64", always_2d=True)
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    x = x[:, :2]
    if sr != SR: g = np.gcd(sr, SR); x = signal.resample_poly(x, SR // g, sr // g, axis=0)
    return x
F = lambda n: os.path.join(A, "assets", "foley", n)
L = lambda n: os.path.join(LUCK, n)
def env(x, w=0.01): k = max(1, int(w * SR)); return np.convolve(np.abs(x).mean(1), np.ones(k) / k, "same")
def shot(path, dur, which=0, pre=0.02, start=None):
    """a one-shot: the which-th strongest transient (peaks >= 0.25 s apart), or a fixed start; fades at both ends"""
    x = load(path)
    if start is None:
        e = env(x); pk, _ = signal.find_peaks(e, distance=int(0.25 * SR)); pk = pk[np.argsort(e[pk])[::-1]]
        s0 = max(0, int(pk[min(which, len(pk) - 1)] - pre * SR))
    else: s0 = int(start * SR)
    y = x[s0:s0 + int(dur * SR)].copy(); n = len(y); fi, fo = min(n // 4, int(0.004 * SR)), min(n // 2, int(min(0.25, dur * 0.4) * SR))
    y[:fi] *= np.linspace(0, 1, fi)[:, None]; y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return y / (np.abs(y).max() + 1e-9)
def bed(path, length, start=0.0, xf=1.0):
    """a bed looped with crossfades to the given length, normalised to -20 LUFS"""
    x = load(path)[int(start * SR):]; out = np.zeros((int(length * SR), 2)); pos = 0; f = int(xf * SR)
    while pos < len(out):
        seg = x[: len(out) - pos + f].copy(); n = len(seg)
        if pos > 0: seg[:f] *= np.linspace(0, 1, f)[:, None]; out[pos:pos + min(f, n)] *= 1  # (previous tail already fading)
        if pos + n < len(out): seg[-f:] *= np.linspace(1, 0, f)[:, None]
        out[pos:pos + n] += seg[: len(out) - pos]; pos += n - f
    m = pyln.Meter(SR); l = m.integrated_loudness(out); return out * db(-20 - l)
def eq(x, hp=None, lp=None):
    if hp: x = signal.sosfilt(signal.butter(2, hp, "hp", fs=SR, output="sos"), x, axis=0)
    if lp: x = signal.sosfilt(signal.butter(2, lp, "lp", fs=SR, output="sos"), x, axis=0)
    return x
def pitch(x, r):  # resample-based pitch/speed change
    return signal.resample_poly(x, 100, int(round(100 * r)), axis=0)
BUS = {k: np.zeros((N, 2)) for k in ("amb", "sfx", "synth")}
def put(bus, x, t, gdb, pan=0.0):
    i = int(t * SR);
    if i >= N: return
    j = min(N, i + len(x)); g = db(gdb); y = x[: j - i] * g
    if pan: y = y * np.array([np.sqrt(0.5 - pan / 2) * 1.414, np.sqrt(0.5 + pan / 2) * 1.414])
    BUS[bus][i:j] += y
def ramp(keys):  # gain envelope (dB) from [(t, dB), ...]
    t = np.arange(N) / SR; return db(np.interp(t, [k[0] for k in keys], [k[1] for k in keys]))[:, None]

T = C; ln = {k: (a, b) for k, a, b in C["lines"]}; bt = dict(C["beats"])

# ---------------- ambience beds
rain = bed(L("storm/fs-243627_heavy-rain.ogg"), DUR)
under = bed(F("fs-467161_field-la-rain-city-under-umbrella-02-wav.ogg"), DUR, 2.0)
roof = bed(F("fs-344460_hard-rain-on-car-roof-wav.ogg"), DUR, 1.0)
inside = bed(F("fs-81089_inside-car-raining-outside-wav.ogg"), DUR, 4.0)
cab0, cab1 = bt["glass"] - 1.2, T["cut"][0]                                  # the over-the-shoulder cab shots
# the payoff gap: everything dips 0.55 s before the crash so the hit lands on near-silence
gap = [(T["crash"] - 0.7, 0), (T["crash"] - 0.5, -20), (T["crash"] - 0.02, -20), (T["crash"], 0)]
def withgap(keys): return sorted(keys + [(a, b) for a, b in gap if keys[0][0] <= a])
rain *= ramp([(0, 0), (48.05, 0), (48.25, -17), (49.0, -17), (49.3, 0), (DUR, 0)])   # a thunder clap baked into the recording at 48.4 s: keep it under the crash
street = rain * ramp([(0, -3), (cab0, -3), (cab0 + 0.5, -14), (cab1 - 0.05, -14), (cab1, -2), (DUR - 2.5, -3), (DUR, -40)]) * ramp(gap)
umb = under * ramp([(0, -2), (T["frame0"], -2), (T["frame0"] + 1.5, -40), (T["grab"] + 0.8, -40), (T["umbIn"], -3), (DUR - 2.5, -3), (DUR, -40)])
cab = (roof * 0.6 + inside * 0.7) * ramp([(0, -60), (bt["seat"], -60), (bt["seat"] + 1.0, -12), (cab0, -12), (cab0 + 0.5, -2), (cab1 - 0.05, -2), (cab1, -60), (DUR, -60)]) * ramp(gap)
BUS["amb"] += street + umb + cab
# wind: the side gust and the sail
for t0, g, path in [(T["windGust"] - 0.3, -10, F("fs-726319_wind-8.ogg")), (T["sailStart"] - 0.8, -6, F("fs-726317_wind-6.ogg")), (T["sailStart"] + 1.2, -9, F("fs-379467_wind2-ogg.ogg"))]:
    w = load(path)[: int(6 * SR)]; n = len(w); w[: int(0.6 * SR)] *= np.linspace(0, 1, int(0.6 * SR))[:, None]; w[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))[:, None]
    put("amb", eq(w / (np.abs(w).max() + 1e-9), hp=80), t0, g)

# ---------------- foley on the cues (gains are pre-master dBFS peaks)
steps = load(F("fs-334457_two-people-s-footsteps-walking-on-a-wet-.ogg"))
e = env(steps, 0.006); pk, _ = signal.find_peaks(e, distance=int(0.22 * SR), height=e.max() * 0.25); clips = [steps[max(0, p - 600): p + int(0.32 * SR)].copy() for p in pk[:24]]
for c in clips: c[-4000:] *= np.linspace(1, 0, 4000)[:, None]
def walk(t0, t1, step=0.52, g=-17, seed=1):
    R = np.random.default_rng(seed); t = t0; k = 0
    while t < t1: c = clips[R.integers(len(clips))]; put("sfx", c / (np.abs(c).max() + 1e-9), t + R.normal(0, 0.012), g + R.normal(0, 1.2), pan=0.15 * (1 if k % 2 else -1)); t += step; k += 1
walk(0.15, T["walls"] - 0.2); walk(T["walls"], T["sailStart"] - 0.2, g=-21, seed=2)
walk(T["exit"], T["standOut"] + 0.2, step=0.45, g=-15, seed=3)
put("sfx", shot(F("fs-698409_loud-sneaker-shoe-squeak-step-sound-fx-n.ogg"), 0.6), T["sailStart"] + 0.25, -16)
put("sfx", shot(F("fs-698409_loud-sneaker-shoe-squeak-step-sound-fx-n.ogg"), 0.6), T["sailStart"] + 1.3, -18, pan=0.3)
# umbrella widens: a fabric snap; walls drop: cloth rustle + flap; sail: tarp flapping
put("sfx", shot(F("fs-352589_umbrella-open.ogg"), 1.0), T["wide"] - 0.06, -9)
put("sfx", shot(F("fs-494797_jacket-cloth-rustle-9.ogg"), 0.9), T["walls"] - 0.02, -8)
put("sfx", shot(F("fs-148918_umbrella-opening-mp3.ogg"), 0.8), T["walls"] + 0.35, -9)
tarp = load(F("fs-138981_tarp-flapping-wav.ogg"))[: int((T["sailEnd"] - T["sailStart"] + 1.2) * SR)]; tarp *= np.sin(np.linspace(0, np.pi, len(tarp)))[:, None] ** 0.6
put("sfx", tarp / np.abs(tarp).max(), T["sailStart"] - 0.2, -11)
# the frame: staggered clanks as the bars snap on, then the back flap rolls up
for k, (path, g) in enumerate([(F("fs-351372_lightringingclang-mp3.ogg"), -15), (F("fs-842171_basic-metal-clang-free.ogg"), -14), (F("fs-835173_wrench-impact-wav.ogg"), -16), (F("fs-351370_heavyringingclang-mp3.ogg"), -13), (F("fs-842171_basic-metal-clang-free.ogg"), -15), (F("fs-835169_pipewrenchdrop-wav.ogg"), -16)]):
    put("sfx", eq(pitch(shot(path, 0.7), 0.94 + 0.03 * k), hp=150), T["frame0"] + k * (T["frame1"] - T["frame0"]) / 6, g, pan=0.4 * np.sin(k * 1.7))
put("sfx", shot(F("fs-94033_roller-blind-up-mp3.ogg"), 1.1, start=0.0), T["backUp"], -15)
put("sfx", shot(F("fs-94033_roller-blind-up-mp3.ogg"), 0.8, start=0.0), T["frontUp"], -15)
# wheels: four thumps (synth below) + the trolley rolling while he pushes; the curb drop
roll = load(F("fs-67287_hospital-trolley-1-wav.ogg"))[int(3 * SR): int(3 * SR) + int((T["motor"] - T["wheels"] + 0.3) * SR)]; roll *= ramp([(0, 0)])[: len(roll)] if False else 1
roll[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]; roll[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))[:, None]
put("sfx", eq(roll / np.abs(roll).max(), hp=60), T["wheels"] + 0.55, -18)
put("sfx", eq(shot(F("fs-835169_pipewrenchdrop-wav.ogg"), 0.5), lp=2500), T["curb"] - 0.02, -15)
# motor: clunk + whine that winds up, runs under everything to the stop, pitch follows speed
put("sfx", shot(F("fs-50697_car-door-handle-wav.ogg"), 0.5), T["motor"] - 0.02, -8)
sc = load(F("fs-697379_electric-scooter.ogg")); seg_ = sc[int(1.0 * SR): int(1.0 * SR) + int((T["stop"] - T["motorGo"] + 1.0) * SR)]
spd = np.interp(np.arange(len(seg_)) / SR + T["motorGo"], [T["motorGo"], T["motorGo"] + 1.2, T["seat"], T["crash"] - 0.2, T["crash"] + 0.4, T["drive"], T["drive"] + 1.5, T["stop"] - 0.6, T["stop"]], [0.0, 0.7, 0.55, 0.6, 0.0, 0.2, 1.0, 0.8, 0.0])
seg_ = seg_ * spd[:, None]; put("sfx", eq(seg_ / np.abs(seg_).max(), hp=120), T["motorGo"], -19)
# seat thunk, the sit squeak; glass in; wiper on + sweeps; steering wheel click
put("sfx", eq(shot(L("ui/fs-467041_deep-thud-wav.ogg"), 0.6), hp=70), T["seat"] - 0.02, -12)
put("sfx", shot(F("fs-698409_loud-sneaker-shoe-squeak-step-sound-fx-n.ogg"), 0.4), T["sit"], -22)
put("sfx", shot(L("ui/fs-426596_clink-wav.ogg"), 0.8), T["glass"] - 0.02, -15)
put("sfx", eq(shot(L("ui/fs-467041_deep-thud-wav.ogg"), 0.4), hp=120), T["glass"] - 0.02, -16)
put("sfx", shot(F("fs-50697_car-door-handle-wav.ogg"), 0.4), T["wiperOn"] - 0.02, -16)
wp = load(F("fs-180946_windshield-wipers-aiff.ogg")); e = env(wp, 0.02); pk, _ = signal.find_peaks(e, distance=int(0.6 * SR), height=e.max() * 0.3)
sw = wp[max(0, pk[1] - int(0.25 * SR)): pk[1] + int(0.65 * SR)].copy(); sw[-3000:] *= np.linspace(1, 0, 3000)[:, None]
for k in range(3): put("sfx", sw / np.abs(sw).max(), T["wiper"] + 0.05 + k * 1.1, -14, pan=0.2 * (1 if k % 2 else -1))
put("sfx", shot(L("ui/fs-12931_003-wav.ogg"), 0.35), T["steer"] + 0.05, -20)
# THE CRASH: bush smash + branches + leaves, loudest moment (plus the synth boom)
put("sfx", shot(F("fs-536777_smash-ogg.ogg"), 1.0), T["crash"] - 0.01, -3)
put("sfx", shot(F("fs-256688_wood-colliding-simulated-tall-ship-crash.ogg"), 1.6), T["crash"] + 0.02, -8)
put("sfx", shot(F("fs-106114_bushmovement-wav.ogg"), 2.2), T["crash"] + 0.05, -6)
put("sfx", shot(L("storm/fs-445816_snapping-branch.ogg"), 0.8), T["crash"] + 0.12, -9, pan=0.3)
put("sfx", shot(F("fs-178615_the-rustle-of-a-bush.ogg"), 1.0), T["crash"] + 0.9, -14, pan=-0.3)
# the drive: a wet pass + puddle; the stop; door handle; umbrella pops open at the end
put("sfx", eq(shot(L("street/fs-462862_passing-car-wet-road.ogg"), 3.2), lp=6000), T["drive"] + 0.6, -21)
put("sfx", shot(F("fs-50697_car-door-handle-wav.ogg"), 0.5), T["exit"] - 0.2, -13)
put("sfx", shot(F("fs-469106_open-umbrella-wav.ogg"), 1.2), T["umbIn"] - 0.02, -8)

# ---------------- synth layer (deterministic): presence under the recordings
def rng(name): return np.random.default_rng(2026 + zlib.crc32(name.encode()))
def thump(f0=62, f1=38, dur=0.45, click=0.0):
    t = np.arange(int(dur * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-t * 18); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 7.5);
    if click: y += click * rng("clk").normal(0, 1, len(t)) * np.exp(-t * 120)
    return np.repeat(y[:, None], 2, 1) / np.abs(y).max()
def whoosh(dur=0.7, f0=400, f1=2400, name="wh"):
    t = np.arange(int(dur * SR)) / SR; n = rng(name).normal(0, 1, len(t)); y = np.zeros_like(n)
    fc = f0 * (f1 / f0) ** (t / dur);
    for i in range(0, len(t), 512):
        b, a = signal.butter(2, [max(40, fc[i] * 0.6), min(SR / 2 - 100, fc[i] * 1.5)], "bp", fs=SR); y[i:i + 512] = signal.lfilter(b, a, n[max(0, i - 2048):i + 512])[-len(n[i:i + 512]):]
    y *= np.sin(np.pi * t / dur) ** 1.5; return np.repeat(y[:, None], 2, 1) / np.abs(y).max()
put("synth", whoosh(0.6, 300, 2600, "wide"), T["wide"] - 0.35, -16)
put("synth", whoosh(0.7, 1800, 300, "walls"), T["walls"] - 0.55, -15)
put("synth", thump(70, 40, 0.5, 0.4), T["walls"], -9)
for k in range(4): put("synth", thump(78, 44, 0.35, 0.3), T["wheels"] + [0, 0.11, 0.22, 0.34][k] + 0.18, -9, pan=0.3 * (1 if k % 2 else -1))
put("synth", thump(60, 34, 0.5), T["seat"], -11)
put("synth", thump(55, 30, 1.2, 0.6), T["crash"], -2)                       # the crash boom (loudest)
put("synth", whoosh(0.5, 2600, 500, "crash"), T["crash"] - 0.42, -18)
put("synth", thump(66, 40, 0.4), T["curb"], -13)
put("synth", thump(90, 50, 0.3, 0.5), T["motor"], -12)
# motor whine: a pitched saw following the speed curve, quiet, under the recording
tm = np.arange(int((T["stop"] - T["motorGo"]) * SR)) / SR + T["motorGo"]; sp = np.interp(tm, [T["motorGo"], T["motorGo"] + 1.2, T["crash"] - 0.2, T["crash"] + 0.4, T["drive"], T["drive"] + 1.5, T["stop"] - 0.6, T["stop"]], [0, 0.7, 0.6, 0, 0.2, 1.0, 0.8, 0])
ph = 2 * np.pi * np.cumsum(180 + 420 * sp) / SR; wh = (signal.sawtooth(ph) * 0.4 + np.sin(ph * 2) * 0.3) * sp
wh = eq(np.repeat(wh[:, None], 2, 1), hp=150, lp=3000); put("synth", wh / np.abs(wh).max(), T["motorGo"], -27)
# the closing "ta-da" on "inventaste el auto": a short bright pluck chord
def pluck(freqs, dur=1.4):
    t = np.arange(int(dur * SR)) / SR; y = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (3 + i)) for i, f in enumerate(freqs)); return np.repeat(y[:, None], 2, 1) / np.abs(y).max()
wa = [w for w in json.load(open(os.path.join(PIECE, "voice.json")))["lines"] if w["id"] == "car"][0]["words"]
auto_t = [w["t0"] for w in wa if "auto" in w["w"].lower()][0]
put("synth", pluck([523.25, 659.25, 783.99, 1046.5]), auto_t + 0.05, -17)
put("synth", whoosh(0.75, 500, 2200, "umbfly"), T["umbIn"] - 0.72, -15)        # the umbrella flies down into his raised hand
put("synth", pluck([1046.5, 1318.5]), T["smile"] + 0.1, -21)                  # the smile at the camera: a tiny bright "ting"

# ---------------- music: low, ducked under the voice, out for the crash gap, back for the payoff, gone before the last line
voice = load(os.path.join(PIECE, "voice", "voice.wav")); voice = np.vstack([voice, np.zeros((max(0, N - len(voice)), 2))])[:N]
m = load(L("music/km_ethernight-club.mp3"))[int(0.0 * SR):]; m = m[:N] if len(m) >= N else np.vstack([m, np.zeros((N - len(m), 2))])
mt = pyln.Meter(SR); m *= db(-20 - mt.integrated_loudness(m[: int(40 * SR)]))
ve = env(voice, 0.08); duck = db(-6 * np.clip(ve / (ve.max() * 0.12), 0, 1))[:, None]
mus = m * duck * ramp([(0, -60), (0.6, -14), (T["crash"] - 0.7, -14), (T["crash"] - 0.5, -60), (T["crash"] + 0.9, -60), (bt["car"], -60), (bt["car"] + 1.2, -16), (ln["car"][1] + 1.0, -15), (bt["arrive"], -22), (bt["loop"], -60), (DUR, -60)])
mus[-int(0.5 * SR):] *= 0
# the act-2 build (frame -> windshield) sits 2.5 dB under the payoff act so the crash + the car stay the loudest act
act2 = ramp([(0, 0), (bt["frame"] - 0.3, 0), (bt["frame"], -2.5), (T["cut"][0] - 0.05, -2.5), (T["cut"][0], 0), (DUR, 0)])
BUS["sfx"] *= act2; BUS["synth"] *= act2; BUS["amb"] *= act2
# the payoff gap on every bus: 0.5 s of near-silence (<= -40 dBFS) right before the crash, after "girar…" ends
G = ramp([(0, 0), (T["crash"] - 0.62, 0), (T["crash"] - 0.52, -60), (T["crash"] - 0.004, -60), (T["crash"], 0), (DUR, 0)])
for k in BUS:
    pre = BUS[k].copy(); BUS[k] *= G
mus *= G
# ---------------- sum, master
vo = voice * db(-16 - mt.integrated_loudness(voice))
mix = vo + mus + BUS["amb"] * db(-6) + BUS["sfx"] * db(-2) + BUS["synth"] * db(-4)
os.makedirs(os.path.join(A, "work"), exist_ok=True); os.makedirs(os.path.join(A, "stems"), exist_ok=True)
sf.write(os.path.join(A, "work", "premix.wav"), mix, SR, subtype="FLOAT")
score = mus + BUS["amb"] * db(-6) + BUS["sfx"] * db(-2) + BUS["synth"] * db(-4)
for k, v in {"voice": vo, "music": mus, "amb": BUS["amb"] * db(-6), "sfx": BUS["sfx"] * db(-2), "synth": BUS["synth"] * db(-4), "score": score}.items(): sf.write(os.path.join(A, "stems", f"{k}.wav"), v, SR, subtype="FLOAT")
print("premix", round(mt.integrated_loudness(mix), 2), "LUFS, peak", round(20 * np.log10(np.abs(mix).max()), 2), "dBFS")

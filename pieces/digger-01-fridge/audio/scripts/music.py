# music.py VOICE -> audio/<voice>/music.wav : original chiptune bed (C - Am - F - G, 120 BPM), composed in code.
# Structure follows the film (engine/review_meta_<voice>.json): intro, groove, breakdown under the viewer comment,
# fill into the payoff, stop on the CRT-off and an end jingle on the title card.
import sys, json, os, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from chip import *
V = sys.argv[1]
ROOT = r"F:/Claude Proyectos/pieces/digger-01-fridge"
meta = json.load(open(f"{ROOT}/engine/review_meta_{V}.json"))
shots = meta["film"]["shots"]; DUR = meta["film"]["dur"]
st = {n: t for n, t, h in shots}
TL = json.load(open(f"{ROOT}/engine/timeline_{V}.json", encoding="utf-8"))
T_OFF = TL["dur"]          # v2: no CRT off; the bed resolves into the jingle under the outro
BPM = 120; BAR = 240 / BPM; S16 = BAR / 16
bar_at = lambda t: int(round(t / BAR))
B_COMMENT0, B_COMMENT1 = bar_at(st["#13"]), bar_at(st["#15"])
B_PAYOFF = bar_at(st["#21"])
B_END = int(T_OFF // BAR)                   # last bar that starts before the CRT off
N = int((DUR + 0.5) * SR); mix = {k: np.zeros(N) for k in ("bass", "arp", "lead", "drums", "pad")}

CH = [("C", 36, [60, 64, 67, 72]), ("Am", 33, [57, 60, 64, 69]), ("F", 29, [53, 57, 60, 65]), ("G", 31, [55, 59, 62, 67])]
MEL = [  # (step16, len16, midi) per bar, A phrase then B phrase
    [(0, 2, 76), (2, 2, 79), (4, 4, 84), (8, 2, 83), (10, 2, 79), (12, 4, 76)],
    [(0, 2, 72), (2, 2, 76), (4, 2, 81), (6, 2, 79), (8, 6, 76), (14, 2, 74)],
    [(0, 2, 72), (2, 2, 74), (4, 2, 77), (6, 2, 81), (8, 4, 79), (12, 2, 77), (14, 2, 76)],
    [(0, 4, 74), (4, 2, 71), (6, 2, 74), (8, 6, 79), (14, 2, 77)],
    [(0, 2, 79), (2, 2, 76), (4, 2, 72), (6, 2, 76), (8, 2, 79), (10, 2, 84), (12, 4, 83)],
    [(0, 4, 81), (4, 2, 79), (6, 2, 76), (8, 8, 72)],
    [(0, 2, 77), (2, 2, 81), (4, 2, 84), (6, 2, 81), (8, 2, 79), (10, 2, 77), (12, 4, 76)],
    [(0, 2, 74), (2, 2, 79), (4, 2, 83), (6, 2, 86), (8, 8, 79)],
]
def note(kind, m, at, dur, vol, **kw):
    n = int(dur * SR)
    if kind == "tri": x = tri(mtof(m), n) * env(n, 0.002, 0.05, 0.85, 0.03)
    else: x = pulse(mtof(m), n, **kw) * env(n, 0.003, 0.09, 0.55, 0.04)
    return x * vol

for b in range(0, B_END + 1):
    t0 = b * BAR; name, root, arp = CH[b % 4]
    breakdown = B_COMMENT0 <= b < B_COMMENT1
    intro = b < 2
    # bass: root on 1, octave pops on the off-beats (triangle)
    for k, (s, l, o) in enumerate([(0, 3, 0), (4, 2, 12), (6, 2, 0), (8, 3, 0), (12, 2, 12), (14, 2, 7)]):
        if breakdown and s not in (0, 8): continue
        mix["bass"] += 0; place(mix["bass"], note("tri", root + 12 + o, t0 + s * S16, l * S16 * 0.95, 0.9), t0 + s * S16)
    # arpeggio: 12.5 % pulse sixteenths (echo-ish second voice an octave up on the breakdown)
    for s in range(16):
        m = arp[s % 4] + (12 if breakdown and s % 2 else 0)
        place(mix["arp"], note("pulse", m, 0, S16 * 0.8, 0.32, duty=0.125), t0 + s * S16)
    # lead: from bar 4, not in the breakdown; phrase A/B alternate every 4 bars, rests in every 4th bar of B under dense talk
    if b >= 4 and not breakdown:
        phrase = MEL[(b % 8)]
        for s, l, m in phrase:
            place(mix["lead"], note("pulse", m, 0, l * S16 * 0.92, 0.42, duty=0.25, vib=0.15 if l >= 4 else 0.0), t0 + s * S16)
    # drums from bar 2
    if not intro and not breakdown:
        for s in (0, 8): place(mix["drums"], kick() * 0.9, t0 + s * S16)
        for s in (4, 12): place(mix["drums"], snare() * 0.7, t0 + s * S16)
        for s in range(0, 16, 2): place(mix["drums"], hat() * (0.5 if s % 4 else 0.7), t0 + s * S16)
        if b == B_PAYOFF - 1:   # fill into the payoff
            for s in (12, 13, 14, 15): place(mix["drums"], snare() * (0.5 + 0.12 * (s - 12)), t0 + s * S16)
    if breakdown:   # soft pad: held chord, 50 % pulse with slow vibrato
        for m in arp[:3]:
            place(mix["pad"], pulse(mtof(m), int(BAR * SR), duty=0.5, vib=0.08) * env(int(BAR * SR), 0.2, 0.4, 0.6, 0.3) * 0.12, t0)

# end jingle on the title card: rising arpeggio + final chord
tj = T_OFF + 0.05
for i, m in enumerate([72, 76, 79, 84, 88]): place(mix["lead"], note("pulse", m, 0, 0.11, 0.5, duty=0.25), tj + i * 0.09)
for m in [60, 64, 67, 72]: place(mix["pad"], pulse(mtof(m), int(2.0 * SR), duty=0.25) * env(int(2.0 * SR), 0.005, 0.4, 0.35, 0.8) * 0.22, tj + 0.48)
place(mix["bass"], tri(mtof(48), int(2.0 * SR)) * env(int(2.0 * SR), 0.005, 0.4, 0.5, 0.8) * 0.9, tj + 0.48)
# hard stop at the CRT off (the picture squeezes; a tiny tape-stop on the bed)
cut = int(T_OFF * SR); fade = int(0.12 * SR)
for k in ("bass", "arp", "drums"):
    x = mix[k]; x[cut:cut + fade] *= np.linspace(1, 0, fade); x[cut + fade:int(tj * SR)] = 0
mix["lead"][cut:int(tj * SR) - 10] *= 0; mix["pad"][cut:int(tj * SR) - 10] *= 0
LV = {"bass": 0.75, "arp": 0.42, "lead": 0.5, "drums": 0.55, "pad": 0.6}
out = sum(lowpass(mix[k], 9000) * v for k, v in LV.items())
out = highpass(out, 35)
out /= max(1e-9, np.max(np.abs(out))) / 0.7
os.makedirs(f"{ROOT}/audio/{V}", exist_ok=True)
for k in mix: sf.write(f"{ROOT}/audio/{V}/stem_{k}.wav", (lowpass(mix[k], 9000) * LV[k]).astype(np.float32), SR)
sf.write(f"{ROOT}/audio/{V}/music.wav", out.astype(np.float32), SR)
print(V, "music", round(len(out) / SR, 2), "s; bars", B_END + 1, "breakdown", B_COMMENT0, B_COMMENT1, "payoff bar", B_PAYOFF)

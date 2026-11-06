"""Cue list (out/cues.json, ms) + music ducking (audio/sounddesign.json buses.music.auto) from voice/timing.json and the
shot logic in build.py (same CUT / wt timings).  python3 out/make_cues.py"""
import json, os

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
FPS = 30
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
T0 = [c / FPS for c in CUT]
D = [((CUT[i + 1] if i + 1 < len(CUT) else END) - CUT[i]) / FPS for i in range(len(CUT))]


def W(line, prefix, end=False):
    w = next(w for w in TIM["words"] if w["line"] == line and w["w"].strip(".,!?-:").lower().startswith(prefix))
    return w["e"] if end else w["s"]


E = []


def ev(t, kind, id, **kw):
    E.append(dict(f=round(t * 1000), kind=kind, id=id, **kw))


def letters(t_in, n, id, stagger=0.045):
    for i in (0, n - 1):
        ev(t_in + i * stagger + 0.02, "pop", f"{id}:{i}", weight=0.7)


for i in range(1, 13):                                   # a soft swish on every hard cut between sets
    ev(T0[i] + 0.01, "cut", f"cut:{i}")
# s01 "60" drops in, punch on the toilet
letters(T0[0] + 0.05, 2, "s01:60"); ev(W(0, "because") - 0.1 + 0.11, "out", "s01:60:out")
ev(W(0, "toilet") - 0.1 + 0.15, "punch", "s01:toilet", variant="peak")
# s02 "1184", pin drops on Erfurt, dive
letters(W(1, "july") + 0.25, 4, "s02:1184"); ev(W(1, "erfurt") - 0.25 + 0.11, "out", "s02:1184:out")
ev(W(1, "erfurt") - 0.1 - 0.05, "thud", "s02:pin")
# s03 the feud at the table: fist bangs, then both pull the deed (strain)
for k, x in enumerate((0.7, 2.1)):
    ev(T0[2] + x, "thud", f"s03:fist:{k}")
ev(W(2, "feuding") - 0.1, "cut", "s03:wide"); ev(W(2, "feuding"), "rope", "s03:deed")
# s04 crown lands, cut to the horse: neigh
ev(W(3, "henry") - 0.15 + 0.3, "clink", "s04:crown")
ev(W(3, "make") - 0.1 + 0.05, "horse", "s04:horse")
# s05 goblet clink in the packed hall
ev(T0[4] + 0.6, "clink", "s05:goblet"); ev(W(4, "room") - 0.1, "punch", "s05:henry", variant="peak")
# s06 creaks, squelchy worm, the beam CRACKS on "rotten"
ev(T0[5] + 0.2, "creak", "s06:creak:0"); ev(T0[5] + 0.9, "squelch", "s06:worm")
ev(W(5, "rotten") - 0.15, "crack", "s06:crack")
# s07 the floor gives way (crack + collapse + gasp), then the floor below (collapse 2), punch on Henry
tg = W(6, "gave") - 0.1; tb = W(6, "below") - 0.15
ev(tg - 0.05, "crack", "s07:crack"); ev(tg, "collapse", "s07:collapse"); ev(tg + 0.12, "gasp", "s07:gasp")
ev(tb, "collapse2", "s07:collapse2")
ev(W(6, "it") + 0.05, "punch", "s07:shock", variant="peak")
# s08 down into the pit: the big SPLASH as we arrive, fly, bubbles
ev(T0[7] + 0.15, "splashb", "s08:splash"); ev(T0[7] + 0.6, "fly", "s08:fly")
for k, x in enumerate((0.9, 1.35)):
    ev(T0[7] + x, "bubble", f"s08:bub:{k}")
# s09 bubbles + tally pops
for k, x in enumerate((0.4, 1.3, 2.2)):
    ev(T0[8] + x, "bubble", f"s09:bub:{k}")
ev(W(8, "men") + 0.7, "pop", "s09:tally", weight=1.0)
# s10 the landgrave bursts out of the muck: splash, squelches, name card pops
ev(T0[9] + 0.15, "splash", "s10:splash"); ev(T0[9] + 0.55, "squelch", "s10:sq:0"); ev(T0[9] + 0.9, "squelch", "s10:sq:1")
letters(T0[9] + 0.35, 16, "s10:name", stagger=0.045)
ev(W(9, "lived") - 0.15, "punch", "s10:lived", variant="peak")
# s11 the bars creak, punch on "hung"
ev(W(10, "so") - 0.1, "creaklong", "s11:bars"); ev(W(10, "hung") - 0.1, "punch", "s11:hung", variant="peak")
# s12 sill creak, the peasant runs in (steps), the ladder clatters
ev(T0[11] + 0.4, "creak", "s12:sill")
tl = W(11, "someone") - 0.2
for k in range(6):
    ev(tl + 0.1 + k * 0.17, "step", f"s12:step:{k}")
ev(tl + 1.25, "ladder", "s12:ladder")
# s13 the tile creaks
tc = W(12, "creaks") - 0.2
ev(tc, "creaklong", "s13:creak"); ev(tc + 0.45, "punch", "s13:look", variant="peak")

E.sort(key=lambda e: e["f"])
json.dump({"fps": 1000, "total": round(TIM["end"] * 1000), "events": E}, open(os.path.join(H, "out", "cues.json"), "w"), indent=1)
segs = []
for w in TIM["words"]:
    if segs and w["s"] - segs[-1][1] < 0.3:
        segs[-1][1] = max(segs[-1][1], w["e"])
    else:
        segs.append([w["s"], w["e"]])
auto = [[0.0, 4.0]]
for s, e in segs:
    auto += [[round(max(s - 0.12, auto[-1][0] + 0.01), 3), 4.0], [round(s, 3), 0.0], [round(e, 3), 0.0], [round(e + 0.12, 3), 4.0]]
sd_p = os.path.join(H, "audio", "sounddesign.json")
sd = json.load(open(sd_p)); sd["buses"]["music"]["auto"] = auto; sd["duration"] = round(TIM["end"], 3)
json.dump(sd, open(sd_p, "w"), indent=1)
print(len(E), "cues;", round(len(E) / TIM["end"] * 60, 1), "per min;", len(segs), "speech segments")

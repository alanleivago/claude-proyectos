"""Cue list (out/cues.json, ms) + music ducking (audio/sounddesign.json buses.music.auto) from voice/timing.json and the
shot logic in build.py (same CUT / wt timings).  python3 out/make_cues.py"""
import json, math, os, sys

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, H)
import motion as MO  # noqa: E402

TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
FPS = 30
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
T0 = [c / FPS for c in CUT]
D = [((CUT[i + 1] if i + 1 < len(CUT) else END) - CUT[i]) / FPS for i in range(len(CUT))]


def W(line, prefix, end=False):
    w = next(w for w in TIM["words"] if w["line"] == line and w["w"].strip(".,!?-").lower().startswith(prefix))
    return w["e"] if end else w["s"]


E = []


def ev(t, kind, id, **kw):
    E.append(dict(f=round(t * 1000), kind=kind, id=id, **kw))


def letters(t_in, n, id, stagger=0.045):          # two pops per title (first + last letter): ~70 cues/min budget
    for i in (0, n - 1):
        ev(t_in + i * stagger + 0.02, "pop", f"{id}:{i}", weight=0.7)


# s01 punch-in, 1-frame blackout on "blind", "40 MIN" in and spin out
ev(T0[0] + 0.25, "punch", "s01:punch", variant="peak")
ev((round(W(0, "blind") * FPS) + 2) / FPS, "glitch", "s01:black")
letters(W(0, "40") - 0.05, 5, "s01:40min")
ev(W(0, "and") - 0.1 + 0.11, "out", "s01:40min:out")
# s02 eyes slide L/C/R (soft), cut to the eyeball, saccades on jump/three/four/second (+ dot pops)
tj = W(1, "they") - 0.1
ev(tj, "cut", "s02:cut")
for w in ("jump", "three", "four", "second"):
    ev(W(1, w), "saccade", f"s02:{w}")
# s03 whip pans at the yaw-speed peaks
sp = [abs(MO.s03_yaw(t + 1 / 60) - MO.s03_yaw(t - 1 / 60)) for t in [i / 60 for i in range(int(D[2] * 60))]]
for i in range(1, len(sp) - 1):
    if sp[i] >= sp[i - 1] and sp[i] > sp[i + 1] and sp[i] > 0.6 * max(sp):          # only the big whips
        ev(T0[2] + i / 60, "whip", f"s03:whip:{i}")
# s04 behind -> front cut, lever yank, monitors die
ev(T0[3] + 0.02, "cut", "s04:in")                     # hard cut into the control room
tc = W(3, "cuts") - 0.05
ev(tc - 0.12, "cut", "s04:cut")
ev(tc - 0.02, "lever", "s04:lever")
ev(tc + 0.08, "crt", "s04:crt")
# s05 photo flies + paste, cut to the front, "ON TIME" + stamp, cut to Kaneda
tf = W(4, "fills") - 0.05; tl = W(4, "lies") - 0.1
ev(tf, "flutter", "s05:photo")
ev(tf + 0.45, "slap", "s05:paste")
ev(tl - 0.05, "cut", "s05:cut")
letters(tl + 0.05, 6, "s05:ontime")
ev(tl + 0.05 + 0.3, "stamp", "s05:stamp")
ev(tl + 0.75, "cut", "s05:kaneda")
# s06 glance (eyes jump), clock: the first tick hangs, then 1 s ticks; shocked punch
tg = W(5, "first") - 0.15; tl6 = W(5, "lasts") - 0.05
ev(T0[5] + 0.35, "saccade", "s06:glance")
n = 0
while tg + (0 if n == 0 else 1.15 + (n - 1)) < tl6 + 0.45:
    ev(tg + (0 if n == 0 else 1.15 + (n - 1)), "tick", f"s06:tick:{n}"); n += 1
ev(tl6 + 0.45 + 0.15, "punch", "s06:shock", variant="peak")
# s07 TRY IT, cut onto the reflection, eye jumps on left / right
letters(W(6, "proof") - 0.1, 5, "s07:try")
ev(W(6, "left") - 0.35 + 0.11, "out", "s07:try:out")
ev(W(6, "left") - 0.1, "cut", "s07:cut")
ev(W(6, "left"), "saccade", "s07:left"); ev(W(6, "right"), "saccade", "s07:right")
# s08 the reflection's eyes jump every 0.33 s
k = 0
while 0.15 + k * 0.33 < D[7]:
    ev(T0[7] + max(0.15, k * 0.33), "saccade", f"s08:jump:{k}"); k += 1
# s09 arrows pop, soft eye moves
ts = W(8, "sees") - 0.1
ev(ts, "pop", "s09:arrows", weight=0.6)

# s10 blackouts, paper sheets landing (every other one), loop punch + "40 MIN"
b = W(9, "blackouts")
for k, x in enumerate((0.0, 0.17, 0.3, 0.4)):
    ev(round((b + x) * FPS) / FPS, "glitch", f"s10:black:{k}")
for i in range(0, 26, 7):
    ev(T0[9] + 0.15 + 1.9 * (i / 26) ** 0.8 + 0.25, "paper", f"s10:paper:{i}")
t40 = W(9, "40") - 0.05
ev(t40 - 0.3 + 0.25, "punch", "s10:punch", variant="peak")
letters(t40, 5, "s10:40min")

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

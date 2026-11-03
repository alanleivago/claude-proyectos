"""Cue list (out/cues.json, ms) + music ducking (audio/sounddesign.json buses.music.auto) from voice/timing.json and the
shot logic in build.py (same CUT / wt / punch / Letters3D timings).  python3 out/make_cues.py"""
import json, math, os

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
FPS = 30
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
T0 = [c / FPS for c in CUT]
D = [((CUT[i + 1] if i + 1 < len(CUT) else END) - CUT[i]) / FPS for i in range(len(CUT))]


def W(line, prefix, end=False):          # global seconds of a word
    w = next(w for w in TIM["words"] if w["line"] == line and w["w"].strip(".,!?-").lower().startswith(prefix))
    return w["e"] if end else w["s"]


E = []


def ev(t, kind, id, **kw):
    E.append(dict(f=round(t * 1000), kind=kind, id=id, **kw))


def letters(t_in, n, kind, id, stagger=0.045):   # Letters3D pop-in: letter i grows from t_in + i*stagger
    for i in range(n):
        ev(t_in + i * stagger + 0.02, kind, f"{id}:{i}", weight=0.7)


def punch_peak(t0, dur):                          # camera punch-in: fastest at the middle of its ease
    return t0 + dur * 0.5


# s01 rises out of the ferns, rifle up, "29"
ev(T0[0] + 0.03, "rustle", "s01:ferns")
ev(T0[0] + 0.55, "rifle", "s01:rifle:click")
t29 = W(0, "29") - 0.05
ev(t29 + 0.02, "pop", "s01:29")
ev(punch_peak(W(0, "29") - 0.1, 0.45), "punch", "s01:punch", variant="peak")
# s02 map: plane flies to Lubang, "1944", pin
ev(T0[1] + 0.02, "plane_map", "s02:plane")
ev(T0[1] + D[1] * 0.75, "pop", "s02:pin", weight=0.6)
# s03 "Never surrender": punch-in on Onoda + stamp
pk = punch_peak(T0[2] + D[2] * 0.45, 0.3)
ev(pk, "punch", "s03:punch", variant="peak")
ev(pk, "stamp", "s03:stamp")
# s04 city cheers + confetti
ev(T0[3] + 0.02, "cheer", "s04:crowd")
ev(T0[3] + 0.05, "popper", "s04:confetti")
# s05 hard cut, bug chirp
ev(T0[4] + 0.15, "chirp", "s05:cricket")
# s06 plane overhead, leaflets flutter, one slaps his face
ev(T0[5] + 0.0, "plane_over", "s06:plane")
ev(T0[5] + 0.35, "flutter", "s06:leaflets")
ev(T0[5] + D[5] * 0.55 + 0.35, "slap", "s06:leaf:face")
# s07 crumple + toss
ev(T0[6] + 0.05, "crumple", "s07:crumple")
ev(T0[6] + 0.5, "pop", "s07:ball", weight=0.5)
ev(T0[6] + D[6] * 0.72 + 0.08, "toss", "s07:toss")
# s08 "One. Ten. Twenty." uniform changes
for k, t in enumerate([W(7, "one"), W(7, "ten"), W(7, "twenty")]):
    ev(t, "beat", f"s08:beat:{k}")
# s09 comrades vanish
for k, t in enumerate([W(8, "left"), W(8, "one"), W(8, "by") + 0.35]):
    ev(t + 1 / FPS, "vanish", f"s09:gone:{k}")
# s10 Suzuki on the trail: backpack jingle, footsteps on every bob contact (|sin(8t)| = 0), "1974"
ev(T0[9] + 0.05, "jingle", "s10:pack")
k = 2
while k * math.pi / 8 < D[9] - 0.1:
    ev(T0[9] + k * math.pi / 8, "step", f"s10:step:{k}", pan=0.15 * (-1) ** k); k += 1
# s11 checklist tap, two whip pans to the posters
ev(T0[10] + 0.08, "tap", "s11:checklist")
ev(W(10, "apanda") + 0.35, "whip", "s11:panda")
ev(W(10, "yeti") - 0.05, "whip", "s11:yeti")
# s12 rifle cock, subtle sting
ev(T0[11] + 0.05, "cock", "s12:rifle:cock")
ev(W(11, "found"), "sting", "s12:sting")
# s13 arms crossed: cloth
ev(T0[12] + 0.04, "cloth", "s13:arms")
# s14 bookshop bell, then the plane
ev(T0[13] + 0.1, "bell", "s14:shop:bell")
ev(W(13, "flew"), "plane_short", "s14:plane")
# s15 the order unrolls
ev(T0[14] + 0.0, "unroll", "s15:order")
# s16 salute snap
ev(punch_peak(T0[15] + 0.3, 0.3), "snap", "s16:salute")
# s17 walks home: footsteps (|sin(7t)|), magic swoosh at the blue jacket, "29" in and out
ev(T0[16] + D[16] * 0.35, "magic", "s17:uniform:blue")
t29 = W(16, "29") - 0.05
ev(t29 + 0.02, "pop", "s17:29")
ev(T0[16] + D[16] - 0.5 + 0.1, "pop", "s17:29:out", weight=0.6)
k = 1
while k * math.pi / 7 < D[16] - 0.7:
    ev(T0[16] + k * math.pi / 7, "step", f"s17:step:{k}", pan=0.15 * (-1) ** k, weight=0.8); k += 1

E.sort(key=lambda e: e["f"])
json.dump({"fps": 1000, "total": round(TIM["end"] * 1000), "events": E}, open(os.path.join(H, "out", "cues.json"), "w"), indent=1)

# music ducking like video #1: 0 dB under speech, +4 dB in pauses >= 0.3 s, 120 ms ramps
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
sd = json.load(open(sd_p))
sd["buses"]["music"]["auto"] = auto
sd["duration"] = round(TIM["end"], 3)
json.dump(sd, open(sd_p, "w"), indent=1)
print(len(E), "cues;", round(len(E) / TIM["end"] * 60, 1), "per min;", len(segs), "speech segments")

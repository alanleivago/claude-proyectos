"""Pauses to cut: global silences (-50 dB >=0.15 s) + any gap between words >=0.3 s (breaths); overlaps merged."""
import json, re, subprocess
w = json.load(open("prep/words.json")); last = w[-1]["e"]
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", "audio/voice.wav", "-af", "silencedetect=n=-50dB:d=0.15", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
Q = [[a, b] for a, b in zip(st, en) if b <= last and a > 0.05]
Q += [[a["e"] + 0.06, b["s"] - 0.06] for a, b in zip(w, w[1:]) if b["s"] - a["e"] - 0.12 >= 0.3]
Q.sort(); M = []
for q in Q:
    if M and q[0] <= M[-1][1] + 0.05: M[-1][1] = max(M[-1][1], q[1])
    else: M.append(list(q))
def near(t, k): return min(w, key=lambda x: abs(x[k] - t))["w"]
P = [{"after": near(a, "e"), "before": near(b, "s"), "quiet": [round(a, 3), round(b, 3)], "len": round(b - a, 3)} for a, b in M]
json.dump(P, open("prep/pauses.json", "w"), indent=1); print(len(P), "pauses", round(sum(p["len"] for p in P), 2), "s")

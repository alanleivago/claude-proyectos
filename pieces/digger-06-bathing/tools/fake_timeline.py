# fake_timeline.py -> engine/timeline_megagirl.json: PROVISIONAL word timing from guion.md (no voice yet), megagirl pace
# (~0.38 s/word + syllables, pauses after "…", sentences, paragraphs). Replaced by prep_timeline.py once the voice exists.
import json, re, os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
g = open(os.path.join(R, "guion.md"), encoding="utf-8").read(); body = g.split("---\n", 2)[2].split("\n---")[0]
pars = [l.strip() for l in body.split("\n") if l.strip() and not l.startswith(("#", "**"))]
W, t = [], 0.3
for pi, p in enumerate(pars, 1):
    for tok in p.split():
        n = re.sub(r"[^a-z0-9']", "", tok.lower())
        if not n: continue
        syl = max(1, len(re.findall(r"[aeiouy]+", n))); d = 0.15 + 0.1 * syl
        cap = re.sub(r'[…":]', "", tok); cap = cap if cap == "I" else cap.lower()
        W.append([cap, round(t, 3), round(t + d, 3), pi, tok]); t += d + 0.05
        if tok.endswith("…"): t += 0.3
        elif tok.endswith((".", "?", '?"', '."')): t += 0.25
        elif tok.endswith(","): t += 0.12
    t += 0.45
dur = round(W[-1][2] + 0.15, 3); N = int(dur * 15) + 1; mouth = ["-"] * N
for w in W:
    for f in range(int(w[1] * 15), int(w[2] * 15) + 1):
        if f < N: mouth[f] = "A" if (f % 2) else "O"
json.dump(dict(voice="megagirl", dur=dur, words=W, mouth="".join(mouth), provisional=True), open(os.path.join(R, "engine", "timeline_megagirl.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("provisional timeline", dur, "s,", len(W), "words, paragraphs", len(pars))

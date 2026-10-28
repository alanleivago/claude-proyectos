# fake_timeline.py -> engine/timeline_megagirl.json: a PROVISIONAL timeline from guion.md (no voice yet) so the storyboard
# board and style frames can be rendered with the real shot list. ~0.38 s per word (+ syllable weight), pauses after "…",
# sentence ends and paragraphs (ep02 megagirl pacing: ~2.5 words/s). Replaced by voz-studio/scripts/prep_timeline.py.
import json, re
R = r"F:/Claude Proyectos/pieces/digger-03-lock/"
g = open(R + "guion.md", encoding="utf-8").read(); body = g.split("~85-95 s)")[1].split("\n---")[0]
pars = [p.strip() for p in body.split("\n\n") if p.strip()]
W, t = [], 0.16
for pi, p in enumerate(pars, 1):
    for tok in p.split():
        n = re.sub(r"[^a-z0-9']", "", tok.lower());
        if not n: continue
        syl = max(1, len(re.findall(r"[aeiouy]+", n))); d = 0.16 + 0.11 * syl
        cap = tok.replace("\u2026", "").replace('"', "").replace(":", ""); cap = cap if cap == "I" else cap.lower()
        W.append([cap, round(t, 3), round(t + d, 3), pi, tok]); t += d + 0.05
        if tok.endswith("\u2026"): t += 0.3
        elif tok.endswith((".", "?", '?"')): t += 0.25
        elif tok.endswith(","): t += 0.12
    t += 0.55 if p != "Sneaky." else 0.85
    if pars[pi - 1 + 1 if pi < len(pars) else 0] == "Sneaky.": t += 0.3
dur = round(W[-1][2] + 0.15, 3); N = int(dur * 15) + 1; mouth = ["-"] * N
for w in W:
    for f in range(int(w[1] * 15), int(w[2] * 15) + 1):
        if f < N: mouth[f] = "A" if (f % 2) else "O"
json.dump(dict(voice="megagirl", dur=dur, words=W, mouth="".join(mouth), provisional=True), open(R + "engine/timeline_megagirl.json", "w", encoding="utf-8"), ensure_ascii=False)
print("provisional timeline", dur, "s,", len(W), "words, paragraphs", len(pars))

# fake_timeline.py -> engine/timeline_megagirl.json: PROVISIONAL word timing from guion.md (no voice yet), megagirl pace
# (~0.38 s/word + syllables, pauses after "…", sentences, paragraphs); +1.6 s before each ITEM GET menu and Body Manual page.
import json, re
R = r"F:/Claude Proyectos/pieces/expedition-01-bedroom/"
g = open(R + "guion.md", encoding="utf-8").read(); body = g.split("---\n", 2)[2].split("## YouTube chapters")[0]
pars = []
for line in body.split("\n"):
    if not line.strip() or line.startswith("#") or line.startswith("**") or line.startswith("---") or re.match(r"^\d\. ", line): continue
    pars.append(line.strip())
W, t = [], 0.3
for pi, p in enumerate(pars, 1):
    if re.search(r"(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth) artifact|^Human Body Manual", p): t += 1.6
    for tok in p.split():
        n = re.sub(r"[^a-z0-9']", "", tok.lower())
        if not n: continue
        syl = max(1, len(re.findall(r"[aeiouy]+", n))); d = 0.15 + 0.1 * syl
        cap = re.sub(r'[…":]', "", tok); cap = cap if cap == "I" else cap.lower()
        W.append([cap, round(t, 3), round(t + d, 3), pi, tok]); t += d + 0.05
        if tok.endswith("\u2026"): t += 0.3
        elif tok.endswith((".", "?", '?"', '."')): t += 0.25
        elif tok.endswith(","): t += 0.12
    t += 0.5
dur = round(W[-1][2] + 0.15, 3); N = int(dur * 15) + 1; mouth = ["-"] * N
for w in W:
    for f in range(int(w[1] * 15), int(w[2] * 15) + 1):
        if f < N: mouth[f] = "A" if (f % 2) else "O"
json.dump(dict(voice="megagirl", dur=dur, words=W, mouth="".join(mouth), provisional=True), open(R + "engine/timeline_megagirl.json", "w", encoding="utf-8"), ensure_ascii=False)
print("provisional timeline", dur, "s,", len(W), "words, paragraphs", len(pars))

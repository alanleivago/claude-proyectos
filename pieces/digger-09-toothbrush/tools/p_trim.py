# fit the 80 s cap: drop "Then he sold them." (paragraph 10) + the shop shot, renumber paragraphs 11-14 -> 10-13, tighter gaps
import os, re, shutil
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
g = open(os.path.join(R, "guion.md"), encoding="utf-8").read()
a = "Then he sold them.\n\n"; assert g.count(a) == 1; g = g.replace(a, "", 1)
g = g.replace("(ARTIFACT 004, 170 words, ~75 s + outro)", "(ARTIFACT 004, 166 words, ~77 s + outro)")
open(os.path.join(R, "guion.md"), "w", encoding="utf-8").write(g)
T = os.path.join(R, "voz", "takes", "raw"); os.makedirs(os.path.join(R, "voz", "takes", "orig"), exist_ok=True)
shutil.move(os.path.join(T, "megagirl_p10.wav"), os.path.join(R, "voz", "takes", "orig", "megagirl_p10_sold.wav"))
for k in range(11, 15): os.rename(os.path.join(T, f"megagirl_p{k:02d}.wav"), os.path.join(T, f"megagirl_p{k - 1:02d}.wav"))
p = os.path.join(R, "voz", "scripts", "assemble.py"); s = open(p, encoding="utf-8").read()
s = s.replace("GAP = {i: 0.4 for i in range(1, 15)}   # digger 09: 14 paragraphs", "GAP = {i: 0.28 for i in range(1, 14)}   # digger 09: 13 paragraphs (80 s cap)")
s = s.replace("GAP.update({1: 0.45, 7: 0.3, 8: 0.5, 13: 0.5})", "GAP.update({1: 0.4, 7: 0.35, 12: 0.45})")
open(p, "w", encoding="utf-8").write(s)
p = os.path.join(R, "engine", "d09_body.js"); s = open(p, encoding="utf-8").read()
i = s.index("  // ===== 14. "); j = s.index("  // ===== ", i + 10); s = s[:i] + s[j:]
s = re.sub(r"(ws\(|SH\(\[)(1[1-4])(,)", lambda m: m.group(1) + str(int(m.group(2)) - 1) + m.group(3), s)
open(p, "w", encoding="utf-8").write(s); print("ok")

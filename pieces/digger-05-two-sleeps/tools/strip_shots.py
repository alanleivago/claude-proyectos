# strip_shots.py: remove the Expedition 01 shot list from the copied film.js, keeping every helper (sets, props, NPC looks)
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine"))
s = open("film.js", encoding="utf-8").read()
a = s.index("  // ===================================== SHOTS =====================================")
b = s.index("  // ===================================== v3 (2026-10-31): sets/props")
s = s[:a] + "  // ===================================== SHOTS: see the DIGGER 05 section below =====================================\n" + s[b:]

def stmt_end(s, i):
    depth, k, q = 0, i, None
    while k < len(s):
        c = s[k]
        if q:
            if c == "\\": k += 2; continue
            if c == q: q = None
        elif c == "/" and s[k + 1] == "/": k = s.index("\n", k); continue
        elif c in "'\"`": q = c
        elif c in "([{": depth += 1
        elif c in ")]}": depth -= 1
        elif c == ";" and depth == 0: return k + 1
        k += 1
    raise Exception("no end")

out, k, n = [], 0, 0
while True:
    cands = [x for x in (s.find("\n  SH([", k), s.find("\n  alt(", k)) if x >= 0]
    if not cands: out.append(s[k:]); break
    i = min(cands) + 1; e = stmt_end(s, i); out.append(s[k:i]); k = e; n += 1
s = "".join(out)
open("film.js", "w", encoding="utf-8").write(s)
print("removed", n, "SH/alt statements")

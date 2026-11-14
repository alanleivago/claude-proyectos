# prep_engine.py: strip the Digger 05 SH shots from the copied film.js, add the 3D font (Luckiest Guy typeface JSON) import,
# and insert engine/d08_shots.js before the shot sort. Run again after editing d08_shots.js (it rebuilds from film_base.js).
import os
E = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine")
base = os.path.join(E, "film_base.js")
if not os.path.exists(base):
    s = open(os.path.join(E, "film.js"), encoding="utf-8").read()
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
        i = s.find("\n  SH([", k)
        if i < 0: out.append(s[k:]); break
        i += 1; e = stmt_end(s, i); out.append(s[k:i]); k = e; n += 1
    s = "".join(out)
    NL = chr(10)
    head = "import { Font } from 'three/addons/loaders/FontLoader.js';" + NL + "import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';" + NL + "const LUCKIEST = " + open(os.path.join(E, "fonts_thumb", "luckiest_typeface.json"), encoding="utf-8").read() + ";" + NL
    s = head + s
    open(base, "w", encoding="utf-8").write(s); print("stripped", n, "SH statements")
s = open(base, encoding="utf-8").read()
k = s.index("  S.sort((a, b) => wi(a.at[0]")
s = s[:k] + open(os.path.join(E, "d08_shots.js"), encoding="utf-8").read() + "\n" + s[k:]
open(os.path.join(E, "film.js"), "w", encoding="utf-8").write(s); print("film.js built")

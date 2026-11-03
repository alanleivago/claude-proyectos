import os
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voz", "scripts")
p = os.path.join(V, "gen_exp.py"); s = open(p, encoding="utf-8").read()
a = 'TTS = [("\\u2026", "..."),'
assert a in s, "tts"
if "1761" not in s:
    s = s.replace(a, a + ' ("1761", "seventeen sixty-one"), ("GPS", "G P S"),', 1)
open(p, "w", encoding="utf-8").write(s)
p = os.path.join(V, "assemble.py"); s = open(p, encoding="utf-8").read()
if '"1761"' not in s:
    s = s.replace('NUM = {"1546"', 'NUM = {"1761": ["seventeen", "sixty", "one"], "1546"', 1)
s = s.replace('INNER = {9: [("minutes", 0.35)]}', 'INNER = {9: [("day", 0.35)]}')
open(p, "w", encoding="utf-8").write(s); print("ok")

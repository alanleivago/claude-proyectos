import os
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voz", "scripts")
p = os.path.join(V, "gen_exp.py"); s = open(p, encoding="utf-8").read()
a = 'TTS = [("\\u2026", "..."),'
assert a in s, "tts"
if "1796" not in s:
    s = s.replace(a, a + ' ("1796", "seventeen ninety-six"), ("1877", "eighteen seventy-seven"), ("1920s", "nineteen twenties"), ("1979", "nineteen seventy-nine"), ("Emile", "Ay-meel"),', 1)
open(p, "w", encoding="utf-8").write(s)
p = os.path.join(V, "assemble.py"); s = open(p, encoding="utf-8").read()
if '"1796"' not in s:
    s = s.replace('NUM = {', 'NUM = {"1796": ["seventeen", "ninety", "six"], "1877": ["eighteen", "seventy", "seven"], "1920s": ["nineteen", "twenties"], "1979": ["nineteen", "seventy", "nine"], ', 1)
s = s.replace('INNER = {9: [("day", 0.35)]}', 'INNER = {9: [("year", 0.35)]}')
open(p, "w", encoding="utf-8").write(s)
p = os.path.join(V, "check_exp.py"); s = open(p, encoding="utf-8").read()
if '"1920s"' not in s:
    s = s.replace('SUB = [', 'SUB = [("1920s", "nineteen twenties"), ', 1)
open(p, "w", encoding="utf-8").write(s); print("ok")

import os, re
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voz", "scripts")
p = os.path.join(V, "gen_exp.py"); s = open(p, encoding="utf-8").read()
a = 'TTS = [("\\u2026", "..."),'
assert a in s
if "1498" not in s:
    s = s.replace(a, a + ' ("1498", "fourteen ninety-eight"), ("1770", "seventeen seventy"), ("1938", "nineteen thirty-eight"), ("miswak", "miss-wack"),', 1)
open(p, "w", encoding="utf-8").write(s)
p = os.path.join(V, "assemble.py"); s = open(p, encoding="utf-8").read()
if '"1498"' not in s:
    s = s.replace('NUM = {', 'NUM = {"1498": ["fourteen", "ninety", "eight"], "1770": ["seventeen", "seventy"], "1938": ["nineteen", "thirty", "eight"], ', 1)
s = re.sub(r"GAP = \{i: 0\.4 for i in range\(1, \d+\)\}.*", "GAP = {i: 0.4 for i in range(1, 15)}   # digger 09: 14 paragraphs", s, 1)
s = s.replace("GAP.update({1: 0.45, 8: 0.5})", "GAP.update({1: 0.45, 7: 0.3, 8: 0.5, 13: 0.5})")
s = s.replace('INNER = {9: [("year", 0.35)]}', 'INNER = {}')
open(p, "w", encoding="utf-8").write(s); print("ok")

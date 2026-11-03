import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voz", "scripts", "gen_exp.py")
s = open(p, encoding="utf-8").read()
a = 'TTS = [("\\u2026", "..."), ("3 a.m.", "three A M"),'
assert a in s
s = s.replace(a, 'TTS = [("\\u2026", "..."), ("500 years", "five hundred years"), ("1546", "fifteen forty-six"), ("1767", "seventeen sixty-seven"), ("Feetham", "Feetum"), ("3 a.m.", "three A M"),')
open(p, "w", encoding="utf-8").write(s); print("ok")

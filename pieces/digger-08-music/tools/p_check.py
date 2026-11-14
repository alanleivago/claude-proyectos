import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voz", "scripts", "check_exp.py"); s = open(p, encoding="utf-8").read()
a = 'lambda m: _num(m) + "s"'
assert a in s
s = s.replace(a, 'lambda m: _num(re.match(r"\\d+", m.group(0))) + "s"')
open(p, "w", encoding="utf-8").write(s); print("ok")

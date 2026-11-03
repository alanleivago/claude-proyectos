import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voz", "scripts", "assemble.py"); s = open(p, encoding="utf-8").read()
a = "key=lambda x: -[norm(w[0]) for w in ws].index(norm(x[0]))):"
b = "            k = [norm(w[0]) for w in ws].index(norm(word))"
assert a in s and b in s
s = s.replace(a, "key=lambda x: -max(j for j, w in enumerate(ws) if norm(w[0]) == norm(x[0]))):")
s = s.replace(b, "            k = max(j for j, w in enumerate(ws) if norm(w[0]) == norm(word))   # d07: the LAST occurrence (\"a day.\" before \"Logging off.\")")
open(p, "w", encoding="utf-8").write(s); print("ok")

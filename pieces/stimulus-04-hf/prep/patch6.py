"""Video 4: plan4 + hook (HIGH SCHOOL / COACHES behind the head, PICTURE THIS key words)."""
p = "prep/gen.py"
s = open(p, encoding="utf-8").read()
i = s.index("# ---------------- beat plan"); j = s.index("# ---------------- helpers")
s = s[:i] + open("prep/plan4.py", encoding="utf-8").read() + s[j:]
R = [
    ('[("hk-k1", "YOUTH", 0), ("hk-k2", "CLUB", 1)]', '[("hk-k1", "HIGH", 0), ("hk-k2", "SCHOOL", 1)]'),
    ('ink("YOUTH CLUB", K_SZ)', 'ink("HIGH SCHOOL", K_SZ)'),
    ("d_end = ws(12) - 0.04", "d_end = ws(14) - 0.04"),
    ("h_end = max(ws(16) + 0.35, pw + 1.0)", "h_end = max(ws(AFTER_HOOK) - 0.05, pw + 1.0)"),
    ("4 QUESTIONS", "PICTURE THIS"),
]
for a, b in R:
    assert a in s, a[:70]
    s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s)
print("ok")

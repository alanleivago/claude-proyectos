"""Video 3: swap in plan3, retarget the hook (YOUTH CLUB / COACHES behind the head, 4 QUESTIONS key words), generic handoff."""
p = "prep/gen.py"
s = open(p, encoding="utf-8").read()
i = s.index("# ---------------- beat plan"); j = s.index("# ---------------- helpers")
s = s[:i] + open("prep/plan3.py", encoding="utf-8").read() + s[j:]
R = [
    ("h_end = ws(13) + 0.1   # PICK WRONG holds ~0.9 s, the next caption waits for it\n", ""),
    ('[("hk-k1", "COACHES", 0), ("hk-k2", "&amp;", 1), ("hk-k3", "CLUB", 2)]', '[("hk-k1", "YOUTH", 0), ("hk-k2", "CLUB", 1)]'),
    ('lsb_d, w_d = ink("DIRECTORS", DIR_SZ); lsb_k, _ = ink("COACHES & CLUB", K_SZ)', 'lsb_d, w_d = ink("COACHES", DIR_SZ); lsb_k, _ = ink("YOUTH CLUB", K_SZ)'),
    ("d_end = ws(9) - 0.04", "d_end = ws(12) - 0.04"),
    ('bigword("hk-dir", "DIRECTORS", ws(3) - 0.04', 'bigword("hk-dir", "COACHES", ws(2) - 0.04'),
    ("pw = ws(9) - 0.03\n", "pw = ws(14) - 0.03\nh_end = max(ws(16) + 0.35, pw + 1.0)   # key words hold >=1 s, the next caption waits for them\n"),
    ("PICK WRONG", "4 QUESTIONS"),
    ("    if w0 == 4: t1 = pw - 0.03", "    if w0 == HOOK_HANDOFF: t1 = pw - 0.03"),
    ("if w0 != 11 else h_end", "if w0 != AFTER_HOOK else h_end"),
    ('RISERS = [(45, "riser_fast", 1.1), (92, "riser_fast", 1.1), (144, "riser_fast", 1.1)]   # fast riser: ~0.9 s build\n', ""),
]
for a, b in R:
    assert a in s, a[:70]
    s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s)
print("ok")

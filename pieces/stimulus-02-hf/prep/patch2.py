"""One-off: turn the stimulus-01 gen.py into the generic one used by video 2 (plan + hook swapped in)."""
p = "prep/gen.py"
s = open(p, encoding="utf-8").read()
i = s.index("# ---------------- beat plan"); j = s.index("# ---------------- helpers")
s = s[:i] + open("prep/plan2.py", encoding="utf-8").read() + s[j:]
i = s.index("# ---------------- hook:"); j = s.index("# ---------------- caption blocks")
s = s[:i] + open("prep/hook2.py", encoding="utf-8").read() + s[j:]
R = [
    ('list_start, cta_start = ws(96), ws(CTA[0][0])', 'list_start, cta_start = ws(LIST_HEAD), ws(CTA[0][0])'),
    ('    if w0 == 96: t1 = ws(CHECKS[0][0]) + 0.01 + 6.0  # "Use it for" stays above the list\n    if w0 == 96: t1 = ws(111) - 0.1\n',
     '    if w0 == LIST_HEAD: t1 = ws(LIST_END) - 0.1   # list header stays above the list\n'),
    ('    if w0 < 12: t1 = min(t1, h_end, land)\n', ''),
    ('top = 960 if w0 == 96 else', 'top = 960 if w0 == LIST_HEAD else'),
    ('c_end = ws(111) - 0.1', 'c_end = ws(LIST_END) - 0.1'),
    ('''<span class="dot"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>''',
     '''<span class="dot">{f'<b class="num">{k + 1}</b>' if NUMBERED else '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</span>'''),
    ('for k, wanted in enumerate(BURNS):\n    t = min(cut_times, key=lambda c: abs(c - ws(wanted)))', 'for k, t in enumerate(cut_times):   # every real cut gets a burn'),
    ('''tw.append(f'tl.to({cam},{{x:{-45 + HOOK_PAN},duration:0.5,ease:"power2.inOut"}},{ws(10) - 0.55:.3f});')   # room for through | fundraising\ntw.append(f'tl.set({cam},{{x:-45}},{segs[2]["at"]:.3f});')\n''', ''),
    ('for i, g in enumerate(segs):\n    a, b = g["at"], g["at"] + g["dur"]',
     'bounds = sorted(set([g["at"] for g in segs] + [ws(h) - 0.03 for h in HARD])) + [D]\nfor i, (a, b) in enumerate(zip(bounds, bounds[1:])):   # real cuts + sentence-start jumps'),
    ('.dot svg{{width:34px;height:34px}}',
     '.dot svg{{width:34px;height:34px}}\n.num{{font-size:36px;line-height:36px;color:#fff;font-style:normal}}\n'
     '.rfill{{background:linear-gradient(180deg,#ff6a72 0%,#ff2a3c 60%,#d9142a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;\n'
     '  filter:drop-shadow(0 0 3px rgba(0,0,0,.8)) drop-shadow(0 0 16px rgba(255,40,60,.6)) drop-shadow(0 6px 10px rgba(0,0,0,.5))}}'),
]
for a, b in R:
    assert a in s, a[:70]
    s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s)
print("patched")

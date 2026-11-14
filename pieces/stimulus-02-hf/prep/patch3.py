"""v2 corrections: no pop-ins anywhere (slide-up + fade), no word SFX, gold big words, word-by-word hook kicker,
merged short blocks, icons under the red list, 4 burns only, no jump closer than 0.6 s to another."""
p = "prep/gen.py"
s = open(p, encoding="utf-8").read()
SLIDE = 'opacity:0,y:38,filter:"blur(12px)"}},{{opacity:1,y:0,filter:"blur(0px)",duration:0.34,ease:"power3.out"}}'
R = [
    # hook kicker word by word, above the cap
    ('''bigword("hk-kick", "COACHES &amp; CLUB", 0.10, d_end, top_for(K_SZ, 455), K_SZ, left=round(x_ink - lsb_k), width=1000, align="left", fill="wfill")''',
     '''kx = x_ink - lsb_k
for eid, txt, wi in [("hk-k1", "COACHES", 0), ("hk-k2", "&amp;", 1), ("hk-k3", "CLUB", 2)]:   # each word appears as he says it
    raw = txt.replace("&amp;", "&")
    bigword(eid, txt, max(ws(wi) - 0.04, 0.05), d_end, top_for(K_SZ, 385), K_SZ, left=round(kx), width=600, align="left", fill="wfill")
    kx += ink(raw + " ", K_SZ)[1] + K_SZ * 0.26'''),
    # PICK WRONG: gold, slide up, no impact
    ('<span class="rfill">PICK WRONG</span>', '<span class="rgb r" data-layout-allow-occlusion>PICK WRONG</span><span class="rgb c" data-layout-allow-occlusion>PICK WRONG</span><span class="gfill">PICK WRONG</span>'),
    ('''tl.fromTo("#pickw .bwin",{{opacity:0,scale:0.7,filter:"blur(12px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.24,ease:"back.out(1.8)"}},{pw:.3f});''',
     '''tl.fromTo("#pickw .bwin",{{''' + SLIDE + ''',{pw:.3f});'''),
    ('sfx("impact", pw + 0.03, 0.5)\n', ''),
    # big caption words: slide up, no impact
    ('''tl.fromTo("#{lid} .bwin",{{opacity:0,scale:0.72,filter:"blur(12px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.26,ease:"back.out(1.8)"}},{tj:.3f});''',
     '''tl.fromTo("#{lid} .bwin",{{''' + SLIDE + ''',{tj:.3f});'''),
    ('            sfx("impact", tj + 0.03, 0.3)\n', ''),
    # icons: slide up + fade, no pop sound
    ('''tl.fromTo("#{iid} img",{{scale:0,opacity:0}},{{scale:1,opacity:1,duration:0.32,ease:"back.out(2.6)"}},{ti:.3f});''',
     '''tl.fromTo("#{iid} img",{{''' + SLIDE + ''',{ti:.3f});'''),
    ('        sfx("pop", ti, 0.25)\n', ''),
    ('    sfx("click", ws(wi), 0.35)\n', ''),
    # burns on 4 chosen cuts only
    ('for k, t in enumerate(cut_times):   # every real cut gets a burn', 'for k, t in enumerate([cut_times[i] for i in BURN_CUTS if i < len(cut_times)]):   # 4 chosen cuts'),
    ('bounds = sorted(set([g["at"] for g in segs] + [ws(h) - 0.03 for h in HARD])) + [D]',
     'bounds = []\nfor b0 in sorted(set([g["at"] for g in segs] + [ws(h) - 0.03 for h in HARD])):\n    if not bounds or b0 - bounds[-1] >= 0.6: bounds.append(b0)   # no two jumps closer than 0.6 s\nbounds += [D]'),
    # merged blocks + icons under the red list
    ('''    (42, [("one sheet,", "w", 42), ("", "sep", 44), ("ONE BOX", "caps", 44)], [("package", 45)]),
    (46, [("ships to you.", "it", 46)], [("truck", 46)]),''',
     '''    (42, [("one sheet,", "w", 42), ("", "sep", 44), ("ONE BOX", "caps", 44), ("ships to you.", "it", 46)], [("package", 45), ("truck", 46)]),'''),
    ('''    (55, [("rosters are small", "w", 55)], [("users", 56)]),
    (59, [("and you're", "w", 59), ("^pressed for time.^", "it", 61)], [("clock", 62)]),''',
     '''    (55, [("rosters are small", "w", 55), ("and you're", "w", 59), ("^pressed for time.^", "it", 61)], [("users", 56), ("clock", 62)]),'''),
    ('''("^& swapping sizes.^", "it", 166)], []),''', '''("^& swapping sizes.^", "it", 166)], [("shirt", 163), ("wallet", 165), ("arrow-left-right", 167)]),'''),
    ('BURN_OPACITY = 0.38', 'BURN_OPACITY = 0.38\nBURN_CUTS = [1, 2, 8, 12]   # which real cuts (index in cut list) get a film burn'),
]
for a, b in R:
    assert a in s, a[:80]
    s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s)
print("ok")

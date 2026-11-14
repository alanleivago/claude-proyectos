"""Round-3 changes to gen.py (user feedback 57-66)."""
from pathlib import Path
p = Path(__file__).with_name("gen.py"); s = p.read_text(encoding="utf-8")
def rep(a, b):
    global s
    assert a in s, a[:90]
    s = s.replace(a, b)

# 1 chevrons tighter to the words
rep('chevron(540 - tw / 2 - 150, 330, 105, 14, False, 0, t1) + chevron(540 + tw / 2 + 45, 330, 105, -14, True, 0, t1)',
    'chevron(540 - tw / 2 - 108, 352, 100, 14, False, 0, t1) + chevron(540 + tw / 2 + 6, 352, 100, -14, True, 0, t1)')
# 2 marker circles: draw-on through the attr plugin
s = s.replace('{strokeDashoffset:1},{strokeDashoffset:0,', '{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},')

# 3 S3 -> octagon-head figure wearing an oversized Flow jersey
a = s.index('J3W = 560; J3H'); b = s.index('pop(4.67, 0.3); whoosh(3.52, 0.25)')
s = s[:a] + '''O3X, O3Y, O3W, O3H = 175, 250, 400, 470
neck3 = (O3X + O3W * 0.52, O3Y + O3H - 8)
J3W = 540; J3H = J3W * 996 / 878; J3X, J3Y = neck3[0] - J3W / 2, neck3[1] - 46
hipx, hipy = neck3[0], J3Y + J3H - 50
feet3 = [(hipx - 130, 1440), (hipx + 120, 1452)]
oct3 = (f'<svg id="s3oct" class="abs" style="left:{O3X}px;top:{O3Y}px" width="{O3W}" height="{O3H}" viewBox="0 0 540 640" preserveAspectRatio="none"><defs><linearGradient id="og3" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#EBD49A"/><stop offset="1" stop-color="#D4AE55"/></linearGradient></defs>'
        '<path d="M150 8 L400 0 L532 210 L505 470 L300 632 L80 540 L10 245 Z" fill="url(#og3)" stroke="#3A3A3A" stroke-width="3" stroke-linejoin="round"/></svg>')
inner = (f'<div id="s3sh" class="ellipse" style="left:{hipx - 300:.0f}px;top:1405px;width:600px;height:130px"></div>'
         + legs_svg("s3", 0, 0, 1080, 1920, (hipx, hipy), feet3)
         + sneakers("s3", feet3, 190)
         + img("assets/flow/jersey_front.png", J3X, J3Y, J3W, "s3j", "transform-origin:50% 0")
         + oct3
         + words_line([("or", 3.57), ("it", 4.00), ("just", 4.21)], 820, 46, "thin", "right", 0, 950)
         + words_line([("doesn't", 4.37)], 876, 46, "thin", "right", 0, 950)
         + words_line([("FIT.", 4.67)], 935, 150, "wide", "right", 0, 950))
scene(s, t0, t1, inner)
fw3 = face(s, O3X + O3W * 0.5, O3Y + O3H * 0.47, 350, t0, t1, bob=0, z=20)
js.append(f'tl.fromTo("#s3j,#s3oct,#{fw3}",{{y:0}},{{y:-10,duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:8}},3.5);')
js.append(f'tl.fromTo("#{fw3},#s3oct",{{rotation:-3}},{{rotation:4,duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3}},3.5);')
walk("s3", (hipx, hipy), feet3, 3.5, 4)
js.append(f'tl.fromTo(".{s}-cam",{{scale:0.62,x:-180,y:260}},{{scale:1,x:0,y:0,duration:0.29,ease:"power3.out"}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1}},{{scale:1.04,duration:1.25,ease:"none",immediateRender:false}},{t0+0.29:.3f});')
js.append('tl.fromTo("#s3sh",{scaleX:0.3},{scaleX:1,duration:0.42,ease:"power2.out"},3.5);')
''' + s[b:]

# 6 S6 -> talking head with thin captions
a = s.index('J6W = 940; J6X, J6Y = 70, 1075'); b = s.index('# =====================================================================\n# S7')
s = s[:a] + '''html.append(f'<div class="cam {s}-cam" style="z-index:10"><video id="th6" class="clip" data-start="{t0}" data-duration="{t1 - t0:.3f}" data-media-start="{t0}" data-track-index="1" src="assets/edit.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
html.append(f'<div class="cam {s}-cam" style="z-index:11"><video id="thb6" class="clip" data-start="{t0}" data-duration="0.3" data-media-start="0" data-track-index="2" src="assets/th_blur_975.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
js.append(f'tl.fromTo("#thb6",{{opacity:1}},{{opacity:0,duration:0.22,ease:"power2.out",data:"smooth"}},{t0 + 0.05:.3f});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.12}},{{scale:1.0,duration:0.3,ease:"power3.out",data:"smooth"}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.0}},{{scale:1.06,duration:{t1 - t0 - 0.3:.2f},ease:"none",immediateRender:false,data:"smooth"}},{t0 + 0.3:.3f});')
for txt, a_, b_ in [("here's what", 9.75, 10.16), ("a good uniform", 10.16, 10.92), ("company", 10.92, 11.29), ("does instead.", 11.29, 12.10)]:
    i = nid("cap")
    html.append(f'<div id="{i}" class="clip thcap" data-start="{a_:.3f}" data-duration="{b_ - a_:.3f}" data-track-index="4" style="z-index:40">{txt}</div>')

''' + s[b:]

# 8 S15 close-up with the Flow jersey (not pixel), standing on the teal floor with reflection
rep('''         + pxs("jersey_teal", 40, 430, 26 * 15, "s15j")
         + '<div class="abs sbar" style="left:0;top:1340px;width:1080px;height:220px"></div>\'''',
    '''         + '<div class="floor-teal" style="top:1330px;opacity:.85"></div>'
         + refl("assets/flow/jersey_front.png", 60, 1330, 540, 540 * 996 / 878, 0.22)
         + img("assets/flow/jersey_front.png", 60, 1330 - 540 * 996 / 878 + 4, 540, "s15j", "transform-origin:50% 100%")''')
rep('''f'<div id="s15ok" class="abs" style="left:430px;top:440px">{check_px(14)}</div>')''',
    '''f'<div id="s15ok" class="abs" style="left:520px;top:690px">{check_px(13)}</div>')''')
rep('''words_line([("WE", 30.54)], 820, 140, "wide", "right", 0, 930)
         + words_line([("REMAKE", 30.64)], 970, 140, "wide", "right", 0, 930)
         + words_line([("IT.", 30.96)], 1120, 140, "wide", "right", 0, 930)''',
    '''words_line([("WE", 30.54)], 300, 120, "wide", "right", 0, 930)
         + words_line([("REMAKE", 30.64)], 430, 120, "wide", "right", 0, 930)
         + words_line([("IT.", 30.96)], 560, 120, "wide", "right", 0, 930)''')
rep('''js.append(f'tl.fromTo("#s15j",{{y:0}},{{y:-10,duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:6}},30.5);')''',
    '''js.append(f'tl.fromTo("#s15j",{{rotation:-4}},{{rotation:3,duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3}},30.5);')''')

# 5 sticker with the reel's peel: big glossy folded corner shrinking to a small curl at the bottom-right
a = s.index('def sticker(i, color_a, color_b, date, title_lines, clock, pin, circ):'); b = s.index('# ---------- face videos ----------')
s = s[:a] + '''SZ = 596
def fold_poly(S):
    return f"polygon(0px 0px, {SZ}px 0px, {SZ}px {SZ - S}px, {SZ - S}px {SZ}px, 0px {SZ}px)"
def fold_pts(S):
    return f"{SZ},{SZ - S} {SZ - S},{SZ} {SZ - S},{SZ - S}"
def sticker(i, color_a, color_b, date, title_lines, clock, pin, circ, flap="#B22A2A"):
    t = "".join(f'<div>{l}</div>' for l in title_lines)
    g = nid("fg")
    return (f'<div id="{i}" class="sticky">'
            f'<div id="{i}b" class="sbody" style="background:linear-gradient(135deg,{color_a},{color_b});clip-path:{fold_poly(70)}"><div class="flag"></div>'
            f'<div class="sdate">{date}</div>'
            f'<svg class="circ" viewBox="0 0 300 130" width="380" height="150" preserveAspectRatio="none"><path id="{i}c" d="M40 40 Q150 -10 270 40 Q300 90 200 112 Q90 128 30 95 Q5 60 60 28 L110 14" fill="none" stroke="{circ}" stroke-width="9" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>'
            f'<div class="stitle">{t}</div><div class="sinfo">&#9719; {clock}<br>&#9906; {pin}</div></div>'
            f'<svg class="abs" style="left:0;top:0;overflow:visible" width="{SZ}" height="{SZ}"><defs><linearGradient id="{g}" x1="1" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{flap}"/><stop offset="0.55" stop-color="{color_b}"/><stop offset="0.8" stop-color="#FFFFFF" stop-opacity=".85"/><stop offset="1" stop-color="{color_a}"/></linearGradient></defs>'
            f'<polygon id="{i}f" points="{fold_pts(70)}" fill="url(#{g})" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/></svg></div>')

''' + s[b:]
rep('''"Coach's garage", TEAL_D, 5.74, 5.95),''', '''"Coach's garage", TEAL_D, 5.74, 6.0, "#9E1B22"),''')
rep('''"Shipping desk", RED, 6.14, 6.32),''', '''"Shipping desk", RED, 6.14, 6.40, "#8C6A1E"),''')
rep('''"Everyone's inbox", "#E8312B", 6.58, 6.78)]''', '''"Everyone's inbox", "#E8312B", 6.58, 6.84, "#1F6B59")]''')
rep('''{sticker(i, a, b, d, tl_, c, p, cc)}</div>'
                  for (i, a, b, d, tl_, c, p, cc, ta, tc), (x, y) in zip(STK, pos))''',
    '''{sticker(i, a, b, d, tl_, c, p, cc, fl)}</div>'
                  for (i, a, b, d, tl_, c, p, cc, ta, tc, fl), (x, y) in zip(STK, pos))''')
rep('''for k, ((i, a, b, d, tl_, c, p, cc, ta, tc), (x, y)) in enumerate(zip(STK, pos)):
    js.append(f'tl.fromTo("#{i}",{{scale:0.6,rotation:-8,opacity:0,transformOrigin:"100% 100%"}},{{scale:1,rotation:0,opacity:1,duration:0.25,ease:"back.out(1.6)"}},{ta:.3f});')''',
    '''for k, ((i, a, b, d, tl_, c, p, cc, ta, tc, fl), (x, y)) in enumerate(zip(STK, pos)):
    # reel peel (67.2 s / 75.75 s): a huge glossy folded corner peels back to a small curl at the bottom-right in ~0.5 s,
    # the note settles 118 % -> 100 %; afterwards the curl keeps lifting a little
    js.append(f'tl.fromTo("#{i}",{{opacity:0}},{{opacity:1,duration:0.083,ease:"none"}},{ta - 0.083:.3f});')
    js.append(f'tl.fromTo("#{i}",{{scale:1.18}},{{scale:1,duration:0.5,ease:"power2.out",transformOrigin:"50% 50%"}},{ta:.3f});')
    js.append(f'tl.fromTo("#{i}b",{{clipPath:"{fold_poly(560)}"}},{{clipPath:"{fold_poly(70)}",duration:0.5,ease:"power2.out"}},{ta:.3f});')
    js.append(f'tl.fromTo("#{i}f",{{attr:{{points:"{fold_pts(560)}"}}}},{{attr:{{points:"{fold_pts(70)}"}},duration:0.5,ease:"power2.out"}},{ta:.3f});')
    js.append(f'tl.fromTo("#{i}f",{{attr:{{points:"{fold_pts(70)}"}}}},{{attr:{{points:"{fold_pts(95)}"}},duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3,immediateRender:false}},{ta + 0.5:.3f});')''')
p.write_text(s, encoding="utf-8"); print("patched")

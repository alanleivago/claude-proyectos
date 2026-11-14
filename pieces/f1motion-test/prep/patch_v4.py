"""Round-4 changes to gen.py (user feedback 67-72)."""
from pathlib import Path
p = Path(__file__).with_name("gen.py"); s = p.read_text(encoding="utf-8")
def rep(a, b):
    global s
    assert a in s, a[:100]
    s = s.replace(a, b)

# ---- 5: head seated inside the van window: masked to the window shape, behind the frame/door, glass reflection on top
rep('''HX, HY, HH = VX + (wx0 + wx1) / 2 + 8, VY + wy0 + 70, 230''',
    '''WX0, WY0, WX1, WY1 = [v * K for v in (216, 79, 448, 223)]          # measured window glass bbox (van px)
HX, HY, HH = VX + (WX0 + WX1) / 2 + 18, VY + WY0 + (WY1 - WY0) * 0.62, 185''')
rep('''fw1 = face(s, HX, HY, HH, t0, t1, bob=7, z=20)''',
    '''fw1 = face(s, HX, HY, HH, t0, t1, bob=4, z=20,
           mask=("s1win", VX, VY, VW, VH, "assets/flow/van_window_mask.png",
                 '<div class="glass"></div>'))''')
rep('''MOV = f"#s1vb,#s1vf,#s1refl,#s1th,#{fw1}"''', '''MOV = "#s1vb,#s1vf,#s1refl,#s1th,#s1win"''')
rep('''def face(scene, cx, cy, head_h, t0, t1, gray=True, bob=9, rot=(0, 0), z=20, period=1/3):''',
    '''def face(scene, cx, cy, head_h, t0, t1, gray=True, bob=9, rot=(0, 0), z=20, period=1/3, mask=None):''')
rep('''    html.append(f'<div class="cam {scene}-cam" style="z-index:{z}"><div id="{wid}" class="fwrap" style="left:{cx - FACE_CX*s:.0f}px;top:{cy - FACE_CY*s:.0f}px;width:{w:.0f}px;height:{h:.0f}px;transform-origin:50% 70%">'
                f'<video id="{vid}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-media-start="{t0:.3f}" data-track-index="3" src="{src}" muted playsinline data-layout-allow-occlusion style="width:100%;height:100%"></video></div></div>')''',
    '''    ox = oy = 0; pre = post = ""
    if mask:   # (id, x, y, w, h, mask png, overlay html): the head only shows through the mask (e.g. a van window)
        mid, mx, my, mw, mh, msrc, over = mask; ox, oy = mx, my
        pre = (f'<div id="{mid}" class="abs" style="left:{mx:.0f}px;top:{my:.0f}px;width:{mw:.0f}px;height:{mh:.0f}px;'
               f'-webkit-mask-image:url({msrc});mask-image:url({msrc});-webkit-mask-size:100% 100%;mask-size:100% 100%">')
        post = over + "</div>"
    html.append(f'<div class="cam {scene}-cam" style="z-index:{z}">{pre}<div id="{wid}" class="fwrap" style="left:{cx - FACE_CX*s - ox:.0f}px;top:{cy - FACE_CY*s - oy:.0f}px;width:{w:.0f}px;height:{h:.0f}px;transform-origin:50% 70%">'
                f'<video id="{vid}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-media-start="{t0:.3f}" data-track-index="3" src="{src}" muted playsinline data-layout-allow-occlusion style="width:100%;height:100%"></video></div>{post}</div>')''')
# thumbs-up hand comes out of the window: arm starts behind the head, inside the cab
rep('''layer(s, t0, t1, img("assets/flow/thumb.png", HX + 20, HY - 250, 250, "s1th", "transform-origin:10% 95%"), 15)''',
    '''layer(s, t0, t1, img("assets/flow/thumb.png", HX + 10, HY - 270, 250, "s1th", "transform-origin:10% 95%"), 15)''')

# ---- 2: real page curl (reel 75.7-76.6 s): curved, shaded roll with highlight band and soft shadow; the page corner is cut
#         along the same curved fold; the fold line travels from beyond the diagonal to a small curl in ~0.5 s (6 steps)
a = s.index('SZ = 596\ndef fold_poly(S):'); b = s.index('def sticker(i, color_a, color_b, date, title_lines, clock, pin, circ, flap="#B22A2A"):')
s = s[:a] + '''SZ = 596
def fold_poly(S):
    """page outline with the corner cut along a curved fold (fold bulges toward the corner like a rolled page)."""
    Z = SZ; c = Z - S * 0.40
    return f"path('M 0 0 L {Z} 0 L {Z} {Z - S:.1f} Q {c:.1f} {c:.1f} {Z - S:.1f} {Z} L 0 {Z} Z')"
def fold_pts(S):
    """the curled flap: concave sides meeting at a tip pulled toward the page centre."""
    Z = SZ; c = Z - S * 0.40; tx = ty = Z - S * 0.86
    return (f"M {Z:.1f} {Z - S:.1f} Q {Z - S * 0.18:.1f} {Z - S * 0.72:.1f} {tx:.1f} {ty:.1f} "
            f"Q {Z - S * 0.72:.1f} {Z - S * 0.18:.1f} {Z - S:.1f} {Z:.1f} Q {c:.1f} {c:.1f} {Z:.1f} {Z - S:.1f} Z")
def fold_hl(S):
    """highlight band just inside the roll edge."""
    Z = SZ; c = Z - S * 0.47
    return f"M {Z - S * 0.10:.1f} {Z - S * 0.93:.1f} Q {c:.1f} {c:.1f} {Z - S * 0.93:.1f} {Z - S * 0.10:.1f}"
''' + s[b:]
a = s.index('def sticker(i, color_a, color_b, date, title_lines, clock, pin, circ, flap="#B22A2A"):'); b = s.index('# ---------- face videos ----------')
s = s[:a] + '''def sticker(i, color_a, color_b, date, title_lines, clock, pin, circ, flap="#B22A2A"):
    t = "".join(f'<div>{l}</div>' for l in title_lines)
    g = nid("fg"); f = nid("fs")
    return (f'<div id="{i}" class="sticky">'
            f'<div id="{i}b" class="sbody" style="background:linear-gradient(135deg,{color_a},{color_b});clip-path:{fold_poly(78)}"><div class="flag"></div>'
            f'<div class="sdate">{date}</div>'
            f'<svg class="circ" viewBox="0 0 300 130" width="380" height="150" preserveAspectRatio="none"><path id="{i}c" d="M40 40 Q150 -10 270 40 Q300 90 200 112 Q90 128 30 95 Q5 60 60 28 L110 14" fill="none" stroke="{circ}" stroke-width="9" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>'
            f'<div class="stitle">{t}</div><div class="sinfo">&#9719; {clock}<br>&#9906; {pin}</div></div>'
            f'<svg class="abs" style="left:0;top:0;overflow:visible" width="{SZ}" height="{SZ}"><defs>'
            f'<linearGradient id="{g}" gradientUnits="objectBoundingBox" x1="1" y1="1" x2="0" y2="0">'
            f'<stop offset="0" stop-color="{color_a}"/><stop offset="0.22" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="0.42" stop-color="{color_b}"/>'
            f'<stop offset="0.8" stop-color="{flap}"/><stop offset="1" stop-color="{flap}"/></linearGradient>'
            f'<filter id="{f}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="-6" dy="-4" stdDeviation="7" flood-color="#000" flood-opacity=".28"/></filter></defs>'
            f'<path id="{i}f" d="{fold_pts(78)}" fill="url(#{g})" filter="url(#{f})"/>'
            f'<path id="{i}h" d="{fold_hl(78)}" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/></svg></div>')

''' + s[b:]
rep('''    js.append(f'tl.fromTo("#{i}f",{{attr:{{points:"{fold_pts(560)}"}}}},{{attr:{{points:"{fold_pts(70)}"}},duration:0.5,ease:"power2.out"}},{ta:.3f});')
    js.append(f'tl.fromTo("#{i}f",{{attr:{{points:"{fold_pts(70)}"}}}},{{attr:{{points:"{fold_pts(95)}"}},duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3,immediateRender:false}},{ta + 0.5:.3f});')''',
    '''    for pid, fn in (("f", fold_pts), ("h", fold_hl)):
        js.append(f'tl.fromTo("#{i}{pid}",{{attr:{{d:"{fn(800)}"}}}},{{attr:{{d:"{fn(78)}"}},duration:0.5,ease:"power2.out"}},{ta:.3f});')
        js.append(f'tl.fromTo("#{i}{pid}",{{attr:{{d:"{fn(78)}"}}}},{{attr:{{d:"{fn(96)}"}},duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3,immediateRender:false}},{ta + 0.5:.3f});')
    js.append(f'tl.fromTo("#{i}b",{{clipPath:"{fold_poly(78)}"}},{{clipPath:"{fold_poly(96)}",duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3,immediateRender:false}},{ta + 0.5:.3f});')''')
rep('''{{clipPath:"{fold_poly(560)}"}},{{clipPath:"{fold_poly(70)}",duration:0.5''', '''{{clipPath:"{fold_poly(800)}"}},{{clipPath:"{fold_poly(78)}",duration:0.5''')

# ---- 3: Stimulus logo instead of his torso in "at STIMULUS"
rep('''tors = "".join(f'<img id="s13p{k}" src="assets/torso_{n}.png" class="abs" style="left:240px;top:330px;width:{TW}px;height:{TH}px;opacity:{1 if k == 0 else 0}">'
               for k, n in enumerate(["px36", "px22", "px12", "px6", "real"]))''',
    '''tors = img("assets/stimulus_icon.png", 540 - 210, 330, 420, "s13logo", "transform-origin:50% 50%")''')
rep('''for k in range(1, 5):
    tk = 26.32 + k * 0.167
    js.append(f'tl.set("#s13p{k}",{{opacity:1}},{tk:.3f}); tl.set("#s13p{k-1}",{{opacity:0}},{tk:.3f});')''',
    '''js.append('tl.fromTo("#s13logo",{scale:0,rotation:-200,opacity:0},{scale:1,rotation:0,opacity:1,duration:0.42,ease:"back.out(1.7)"},26.32);')
js.append(f'tl.fromTo("#s13logo",{{y:0}},{{y:-8,duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:2,immediateRender:false}},26.80);')''')

# ---- 4: silver gradient arms like the legs; shades drop once (own wrapper, no bounce)
rep('''arms = (f'<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920" viewBox="0 0 1080 1920">'
        f'<path d="M{neck[0]:.0f} {neck[1]:.0f} Q {neck[0] - 90:.0f} {neck[1] + 80:.0f} {neck[0] - 230:.0f} {neck[1] + 10:.0f}" stroke="#222" stroke-width="6" fill="none" stroke-linecap="round"/>'
        f'<path d="M{neck[0]:.0f} {neck[1]:.0f} Q {neck[0] + 90:.0f} {neck[1] + 90:.0f} {neck[0] + 190:.0f} {neck[1] + 40:.0f}" stroke="#222" stroke-width="6" fill="none" stroke-linecap="round"/></svg>')''',
    '''arms = (f'<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>'
        f'<linearGradient id="ag0" gradientUnits="userSpaceOnUse" x1="{neck[0]:.0f}" y1="{neck[1]:.0f}" x2="{neck[0] - 230:.0f}" y2="{neck[1] + 10:.0f}"><stop offset="0" stop-color="#5E5E5E"/><stop offset="1" stop-color="#DCDCDC"/></linearGradient>'
        f'<linearGradient id="ag1" gradientUnits="userSpaceOnUse" x1="{neck[0]:.0f}" y1="{neck[1]:.0f}" x2="{neck[0] + 190:.0f}" y2="{neck[1] + 40:.0f}"><stop offset="0" stop-color="#5E5E5E"/><stop offset="1" stop-color="#DCDCDC"/></linearGradient></defs>'
        f'<path d="M{neck[0]:.0f} {neck[1]:.0f} Q {neck[0] - 90:.0f} {neck[1] + 80:.0f} {neck[0] - 230:.0f} {neck[1] + 10:.0f}" stroke="url(#ag0)" stroke-width="11" fill="none" stroke-linecap="round"/>'
        f'<path d="M{neck[0]:.0f} {neck[1]:.0f} Q {neck[0] + 90:.0f} {neck[1] + 90:.0f} {neck[0] + 190:.0f} {neck[1] + 40:.0f}" stroke="url(#ag1)" stroke-width="11" fill="none" stroke-linecap="round"/></svg>')''')
rep('''layer(s, t0, t1, f'<div id="s16sg" class="abs" style="left:{OX + OW*0.5 - 160:.0f}px;top:{OY + OH*0.48 - 12:.0f}px">{shades_px(13)}</div>', 30)
js.append('tl.fromTo("#s16sg",{y:-700},{y:0,duration:0.33,ease:"bounce.out"},33.48);')''',
    '''layer(s, t0, t1, f'<div id="s16sg" class="abs" style="left:{OX + OW*0.5 - 160:.0f}px;top:{OY + OH*0.48 - 12:.0f}px"><div id="s16sgd">{shades_px(13)}</div></div>', 30)
js.append('tl.fromTo("#s16sgd",{y:-760},{y:0,duration:0.33,ease:"power3.out"},33.48);')''')
p.write_text(s, encoding="utf-8"); print("patched")

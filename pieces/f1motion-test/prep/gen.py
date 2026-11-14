"""f1motion-test: generates index.html (HyperFrames, 1080x1920) for the f1motion style applied to stimulus-05.
python prep/gen.py   (edit times = voice times; style constants mirror styles/f1motion/kit.js)"""
import json, math, random
from pathlib import Path
from PIL import ImageFont

R = Path(__file__).resolve().parent.parent
FONT = ImageFont.truetype(str(R / "assets/fonts/TurretRoad-ExtraBold.ttf"), 100)
THINF = ImageFont.truetype(str(R / "assets/fonts/Poppins-Light.ttf"), 100)
SX = 1.30            # horizontal stretch of the display face (Turret Road ExtraBold -> "wide futuristic")
INK, GHOST, THIN, WHITE = "#111111", "#C9C9C9", "#222222", "#FDFDFB"
TEAL, TEAL_D, TEAL_L = "#76BBAB", "#3E9D86", "#CDEDE4"
GOLD_A, GOLD_B, RED = "#EED9A0", "#DDB75A", "#EA2C26"
END = 37.30          # outro starts
BOBH = 1 / 6         # half-cycle of bobs/flaps: 2 steps at 12 fps (reel graphics run on twos)
OUTRO = 2.336
TOTAL = round(END + OUTRO, 3)

html, js, aud = [], [], []
_id = [0]
def nid(p="e"):
    _id[0] += 1
    return f"{p}{_id[0]}"

def wide_w(text, size):
    return FONT.getlength(text) * size / 100 * SX

def fit(text, maxw, maxs):
    s = maxs
    while wide_w(text, s) > maxw and s > 20:
        s -= 2
    return s

def thin_w(text, size):
    return THINF.getlength(text) * size / 100

# ---------- sfx ----------
POPS = ["pop1", "pop2", "pop3"]; _pi = [0]
WH = ["wh1", "wh2", "wh3"]; _wi = [0]
def sfx(name, t, vol):
    i = nid("s")
    aud.append(f'<audio id="{i}" class="clip" data-start="{max(0, t):.3f}" data-track-index="{12 + len(aud)}" src="assets/sfx/{name}.wav" data-volume="{vol}"></audio>')
def pop(t, vol=0.28):
    sfx(POPS[_pi[0] % 3], t, vol); _pi[0] += 1
def whoosh(t, vol=0.32):
    sfx(WH[_wi[0] % 3], t - 0.05, vol); _wi[0] += 1

# ---------- text helpers ----------
def words_line(words, top, size, kind="wide", align="center", left=0, width=1080, ghost=GHOST, ink=None, extra=""):
    """words = [(text, t)]; returns html; schedules ghost->ink reveal on each word's time."""
    ink = ink or (INK if kind == "wide" else THIN)
    spans = []
    for w, t in words:
        i = nid("w")
        spans.append(f'<span id="{i}" class="w" style="color:{ghost}">{w}</span>')
        if kind == "wide":
            js.append(f'tl.fromTo("#{i}",{{color:"{ghost}"}},{{color:"{ink}",duration:0.17,ease:"power1.out"}},{t:.3f});')
        else:
            js.append(f'tl.fromTo("#{i}",{{color:"{ghost}",y:6}},{{color:"{ink}",y:0,duration:0.17,ease:"power2.out"}},{t:.3f});')
    cls = "wl" if kind == "wide" else "tln"
    origin = {"center": "50% 50%", "left": "0% 50%", "right": "100% 50%"}[align]
    return (f'<div class="{cls}" style="top:{top}px;left:{left}px;width:{width}px;font-size:{size}px;'
            f'text-align:{align};transform-origin:{origin};{extra}">{" ".join(spans)}</div>')

def chevron(x, y, w, rot, flip=False, t0=0, t1=0):
    """Flow-made teal arrow-chevron (assets/flow/chevron.png, head up-left); flip = mirrored for the right side."""
    i = nid("cv")
    src = "assets/flow/chevron_r.png" if flip else "assets/flow/chevron.png"
    h = w * 748 / 526
    js.append(f'tl.fromTo("#{i}",{{rotation:{rot}}},{{rotation:{rot + (8 if not flip else -8)},duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:{max(1, int((t1 - t0) / BOBH) - 1)}}},{t0:.3f});')
    return f'<div id="{i}" class="orn" style="left:{x:.0f}px;top:{y:.0f}px;width:{w}px;height:{h:.0f}px;transform-origin:50% 90%"><img src="{src}" style="width:100%;height:100%"></div>'

def pill(cx, top, lines, t, w=330, h=110, wings=True, t1=None, size=34):
    i = nid("pl")
    txt = "<br>".join(lines)
    out = ""
    if wings:
        out += chevron(cx - w / 2 - 92, top - 70, 80, 18, False, t, t1 or t + 2)
        out += chevron(cx + w / 2 + 12, top - 70, 80, -18, True, t, t1 or t + 2)
    out += (f'<div id="{i}" class="pill" style="left:{cx - w/2:.0f}px;top:{top}px;width:{w}px;height:{h}px;font-size:{size}px">'
            f'<span>{txt}</span></div>')
    js.append(f'tl.fromTo("#{i}",{{scale:0.4,opacity:0}},{{scale:1,opacity:1,duration:0.21,ease:"back.out(2.2)"}},{t:.3f});')
    pop(t)
    return out

def tab(left, top, w, h, t):
    i = nid("tb")
    js.append(f'tl.fromTo("#{i}",{{clipPath:"inset(0 50% 0 50%)"}},{{clipPath:"inset(0 0% 0 0%)",duration:0.25,ease:"power3.out"}},{t:.3f});')
    return f'<div id="{i}" class="tab" style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"></div>'

# ---------- pixel sprites ----------
def px(rows, pal, s, extra=""):
    h = len(rows); w = max(len(r) for r in rows)
    rects = []
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c in pal:
                rects.append(f'<rect x="{x}" y="{y}" width="1.02" height="1.02" fill="{pal[c]}"/>')
    return (f'<svg viewBox="0 0 {w} {h}" width="{w*s}" height="{h*s}" shape-rendering="crispEdges" {extra}>' + "".join(rects) + "</svg>")

JERSEY = ["...XXX....XXX...", "..XAAAXXXXAAAX..", ".XAAAAACCAAAAAX.", "XAAAAAAAAAAAAAAX", "XAAAAAAAAAAAAAAX",
          "XXXAAAAAAAAAAXXX", "..XAAAAAAAAAAX..", "..XAAABAABBBAX..", "..XAABBAAAABAX..", "..XAAABAABBBAX..",
          "..XAAABAABAAAX..", "..XAABBBABBBAX..", "..XAAAAAAAAAAX..", "..XXXXXXXXXXXX.."]
def jersey_px(col, num="#FFFFFF", s=10, check=False):
    rows = JERSEY
    if check:   # stimulus-like green/white checker
        rows = []
        for y, r in enumerate(JERSEY):
            rows.append("".join(("D" if c == "A" and ((x // 2 + y // 2) % 2) else c) for x, c in enumerate(r)))
    return px(rows, {"X": "#1B1B1B", "A": col, "D": "#F4F4F4", "B": num, "C": "#FFFFFF"}, s)

BOX = ["XXXXXXXXXXXX", "XAAAAATTAAAX", "XAAAAATTAAAX", "XXXXXXXXXXXX", "XBBBBBTTBBBX", "XBBBBBTTBBBX",
       "XBBWWBTTBBBX", "XBBWWBTTBBBX", "XBBBBBTTBBBX", "XXXXXXXXXXXX"]
def box_px(s=8):
    return px(BOX, {"X": "#4A2F17", "A": "#E0A65A", "B": "#C98B3F", "T": "#F1DDB0", "W": "#FFFFFF"}, s)

COIN = ["...XXXX...", "..XYYYYX..", ".XYWYYYYX.", "XYWYYXYYYX", "XYYYXXYYYX", "XYYYYXYYYX", "XYYYYXYYYX",
        ".XYYXXXYX.", "..XYYYYX..", "...XXXX..."]
def coin_px(s=8):
    return px(COIN, {"X": "#8A5A12", "Y": "#E8B53A", "W": "#FFF1B8"}, s)

VAN = ["......XXXXXXXXXXXXXXXX....", ".....XRRRRRRRRRRRRRRRRX...", "....XRRRRRRRRRRRRRRRRRRXX.", "...XRRRRRRRRRRRRRRRRRRRGGX",
       "..XRRRRRRRRRRRRRRRRRRRRGGX", "..XRRWWWWWWWWWWWWRRRRRRGGX", "..XRRRRRRRRRRRRRRRRRRRRRRX", "..XRRRRRRRRRRRRRRRRRRRRRRX",
       "..XRRRRRRRRRRRRRRRRRRRRRRX", "..XXXKKKXXXXXXXXXXXKKKXXXX", "....KKKKK.........KKKKK...", ".....KKK...........KKK...."]
def van_px(s=12):
    return px(VAN, {"X": "#2A0C0C", "R": "#D8202A", "W": "#FFFFFF", "G": "#9FD8F0", "K": "#1A1A1A"}, s)

HOUSE = [".......XX.......", "......XRRX......", ".....XRRRRX.....", "....XRRRRRRX....", "...XRRRRRRRRX...",
         "..XRRRRRRRRRRX..", ".XXXXXXXXXXXXXX.", "..XWWWWWWWWWWX..", "..XWGGWWWWGGWX..", "..XWGGWWWWGGWX..",
         "..XWWWWDDWWWWX..", "..XWWWWDDWWWWX..", "..XWWWWDDWWWWX..", "..XXXXXXXXXXXX.."]
def house_px(s=12):
    return px(HOUSE, {"X": "#2B2B2B", "R": "#3E9D86", "W": "#F5E9CC", "G": "#9FD8F0", "D": "#8A5A12"}, s)

SHADES = ["XXXXXXXXXXXXXXXXXXXXXXXX", ".XWXWXXXXX....XWXWXXXXX.", ".XXWXWXXXX....XXWXWXXXX.", "..XXXXXXX......XXXXXXX.."]
def shades_px(s=12):
    return px(SHADES, {"X": "#0B0B0B", "W": "#FFFFFF"}, s)

CHECK = ["....XXXX....", "..XXGGGGXX..", ".XGGGGGGGWX.", ".XGGGGGGWWX.", "XGWGGGGWWGGX", "XGWWGGWWGGGX",
         "XGGWWWWGGGGX", "XGGGWWGGGGGX", ".XGGGGGGGGX.", ".XGGGGGGGGX.", "..XXGGGGXX..", "....XXXX...."]
def check_px(s=10):
    return px(CHECK, {"X": "#1F6B59", "G": "#3E9D86", "W": "#FFFFFF"}, s)

# ---------- vector drawings ----------
def jersey_svg(w, back=True, name="", num="12", gid="j"):
    """green/white checker jersey (stimulus-like), front or back view; viewBox 600x640."""
    cells = []
    for y in range(0, 640, 60):
        for x in range(0, 600, 60):
            if (x // 60 + y // 60) % 2 == 0:
                cells.append(f'<rect x="{x}" y="{y}" width="60" height="60" fill="#1F8A4C"/>')
    body = "M150 40 L230 10 Q300 40 370 10 L450 40 L590 150 L520 270 L470 235 L470 630 L130 630 L130 235 L80 270 L10 150 Z"
    collar = '<path d="M230 10 Q300 60 370 10" fill="none" stroke="#111" stroke-width="16"/>' if back else '<path d="M230 10 Q300 95 370 10" fill="#111"/><path d="M245 14 Q300 70 355 14" fill="#F4F4F4"/>'
    txt = ""
    if back:
        if name:
            txt += f'<rect x="150" y="120" width="300" height="72" rx="6" fill="#F7F7F2"/><text x="300" y="178" text-anchor="middle" font-family="Turret" font-size="64" fill="#111" textLength="270" lengthAdjust="spacingAndGlyphs">{name}</text>'
        txt += f'<text x="300" y="470" text-anchor="middle" font-family="Turret" font-size="270" fill="#F7F7F2" stroke="#111" stroke-width="10" paint-order="stroke">{num}</text>'
    else:
        txt += '<circle cx="380" cy="150" r="30" fill="#F7F7F2" stroke="#111" stroke-width="6"/><path d="M366 140 h28 M366 152 h28 M366 164 h20" stroke="#111" stroke-width="6"/>'
        txt += f'<text x="300" y="400" text-anchor="middle" font-family="Turret" font-size="150" fill="#F7F7F2" stroke="#111" stroke-width="8" paint-order="stroke">{num}</text>'
    return (f'<svg viewBox="0 0 600 640" width="{w}" height="{w*640/600:.0f}"><defs><clipPath id="{gid}c"><path d="{body}"/></clipPath>'
            f'<linearGradient id="{gid}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>'
            f'<path d="{body}" fill="#F4F4F4"/><g clip-path="url(#{gid}c)">{"".join(cells)}<rect width="600" height="640" fill="url(#{gid}s)"/></g>'
            f'<path d="{body}" fill="none" stroke="#111" stroke-width="8" stroke-linejoin="round"/>{collar}{txt}</svg>')

def van_side(layer, W=1040):
    """side view delivery van facing right, viewBox 900x420. layer back|front (front = door below the window, wheels)."""
    if layer == "back":
        return (f'<svg viewBox="0 0 900 420" width="{W}" height="{W*420/900:.0f}"><defs><linearGradient id="vb" x1="0" y1="0" x2="0" y2="1">'
                '<stop offset="0" stop-color="#F0444C"/><stop offset=".55" stop-color="#D3202A"/><stop offset="1" stop-color="#9E141C"/></linearGradient></defs>'
                '<path d="M30 60 Q30 30 60 30 L600 30 L640 30 Q700 32 735 90 L800 190 Q860 200 868 250 L870 330 L30 330 Z" fill="url(#vb)" stroke="#5A0B10" stroke-width="5"/>'
                '<path d="M612 60 L700 60 Q718 62 730 90 L780 195 L612 195 Z" fill="#2B3440"/>'
                '<path d="M622 70 L690 70 L760 190 L622 190 Z" fill="#46566A" opacity=".55"/>'
                '<rect x="40" y="70" width="540" height="10" fill="#FFFFFF" opacity=".35"/>'
                '<text x="300" y="185" text-anchor="middle" font-family="Turret" font-size="92" fill="#FFFFFF" textLength="460" lengthAdjust="spacingAndGlyphs">STIMULUS</text>'
                '<text x="300" y="238" text-anchor="middle" font-family="PopL" font-size="36" fill="#FFFFFF">custom jerseys · express</text>'
                '</svg>')
    return (f'<svg viewBox="0 0 900 420" width="{W}" height="{W*420/900:.0f}"><defs><linearGradient id="vf" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0" stop-color="#E2303A"/><stop offset="1" stop-color="#9E141C"/></linearGradient></defs>'
            '<path d="M604 192 L790 192 Q860 202 868 250 L870 330 L604 330 Z" fill="url(#vf)" stroke="#5A0B10" stroke-width="5"/>'
            '<rect x="604" y="186" width="190" height="12" rx="6" fill="#5A0B10"/>'
            '<rect x="820" y="250" width="40" height="22" rx="6" fill="#FFE07A"/>'
            '<rect x="20" y="318" width="860" height="22" rx="10" fill="#2A2A2A"/>'
            + "".join(f'<circle cx="{cx}" cy="335" r="68" fill="#151515"/><circle cx="{cx}" cy="335" r="50" fill="none" stroke="#F2C230" stroke-width="7"/>'
                      f'<circle cx="{cx}" cy="335" r="30" fill="#8C8C8C"/><circle cx="{cx}" cy="335" r="10" fill="#333"/>' for cx in (170, 700)) +
            '</svg>')

def van_top(w):
    """top-down van, viewBox 300x560, nose up."""
    return (f'<svg viewBox="0 0 300 560" width="{w}" height="{w*560/300:.0f}"><defs><linearGradient id="vt" x1="0" x2="1">'
            '<stop offset="0" stop-color="#A3141C"/><stop offset=".5" stop-color="#F0444C"/><stop offset="1" stop-color="#A3141C"/></linearGradient>'
            '<filter id="vsh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs>'
            '<rect x="40" y="40" width="220" height="500" rx="40" fill="#000" opacity=".35" filter="url(#vsh)"/>'
            + "".join(f'<rect x="{x}" y="{y}" width="34" height="82" rx="12" fill="#151515"/>' for x in (22, 244) for y in (80, 400)) +
            '<rect x="36" y="20" width="228" height="520" rx="44" fill="url(#vt)" stroke="#5A0B10" stroke-width="5"/>'
            '<path d="M58 70 Q150 30 242 70 L232 150 Q150 128 68 150 Z" fill="#2B3440"/>'
            '<rect x="62" y="175" width="176" height="340" rx="18" fill="#E2303A" stroke="#7A1016" stroke-width="3"/>'
            '<text x="150" y="350" text-anchor="middle" font-family="Turret" font-size="44" fill="#FFF" transform="rotate(-90 150 345)" textLength="300" lengthAdjust="spacingAndGlyphs">STIMULUS</text>'
            '<rect x="50" y="26" width="40" height="16" rx="6" fill="#FFE07A"/><rect x="210" y="26" width="40" height="16" rx="6" fill="#FFE07A"/>'
            '</svg>')

def speedlines(seed, cx=540, cy=820, n=120, r0=330):
    rnd = random.Random(seed); out = []
    for k in range(n):
        a = rnd.uniform(0, 2 * math.pi); r1 = r0 + rnd.uniform(0, 260); w = rnd.uniform(3, 16)
        x1, y1 = cx + math.cos(a) * r1, cy + math.sin(a) * r1 * 1.35
        x2, y2 = cx + math.cos(a) * 1800, cy + math.sin(a) * 2400
        nx, ny = -math.sin(a) * w, math.cos(a) * w
        out.append(f'<path d="M{x1:.0f} {y1:.0f} L{x2+nx:.0f} {y2+ny:.0f} L{x2-nx:.0f} {y2-ny:.0f} Z" fill="#111"/>')
    return f'<svg viewBox="0 0 1080 1920" width="1080" height="1920">{"".join(out)}</svg>'

def emoji(code, x, y, w, rot=0, i=None):
    i = i or nid("em")
    return f'<div id="{i}" class="orn" style="left:{x}px;top:{y}px;width:{w}px;height:{w}px;transform:rotate({rot}deg)"><img src="assets/emoji/{code}.svg" style="width:100%;height:100%"></div>'

SZ = 596
def fold_poly(S):
    """page outline with the corner cut along a curved fold (fold bulges toward the corner like a rolled page)."""
    Z = SZ; c = Z - S * 0.40
    return f"path('M 0 0 L {Z} 0 L {Z} {Z - S:.1f} Q {c:.1f} {c:.1f} {Z - S:.1f} {Z} L 0 {Z} Z')"
def fold_d(S):
    Z = SZ; c = Z - S * 0.40
    return f"M 0 0 L {Z} 0 L {Z} {Z - S:.1f} Q {c:.1f} {c:.1f} {Z - S:.1f} {Z} L 0 {Z} Z"
def fold_pts(S):
    """the curled flap: concave sides meeting at a tip pulled toward the page centre."""
    Z = SZ; c = Z - S * 0.40; tx = ty = Z - S * 0.86
    return (f"M {Z:.1f} {Z - S:.1f} Q {Z - S * 0.18:.1f} {Z - S * 0.72:.1f} {tx:.1f} {ty:.1f} "
            f"Q {Z - S * 0.72:.1f} {Z - S * 0.18:.1f} {Z - S:.1f} {Z:.1f} Q {c:.1f} {c:.1f} {Z:.1f} {Z - S:.1f} Z")
def fold_hl(S):
    """highlight band just inside the roll edge."""
    Z = SZ; c = Z - S * 0.47
    return f"M {Z - S * 0.10:.1f} {Z - S * 0.93:.1f} Q {c:.1f} {c:.1f} {Z - S * 0.93:.1f} {Z - S * 0.10:.1f}"
def sticker(i, color_a, color_b, date, title_lines, clock, pin, circ, flap="#B22A2A"):
    t = "".join(f'<div>{l}</div>' for l in title_lines)
    g = nid("fg"); f = nid("fs")
    return (f'<div id="{i}" class="sticky">'
            f'<div id="{i}b" class="sbody" style="background:linear-gradient(135deg,{color_a},{color_b});clip-path:url(#{i}cp)"><div class="flag"></div>'
            f'<div class="sdate">{date}</div>'
            f'<svg class="circ" viewBox="0 0 300 130" width="380" height="150" preserveAspectRatio="none"><path id="{i}c" d="M40 40 Q150 -10 270 40 Q300 90 200 112 Q90 128 30 95 Q5 60 60 28 L110 14" fill="none" stroke="{circ}" stroke-width="9" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>'
            f'<div class="stitle">{t}</div><div class="sinfo">&#9719; {clock}<br>&#9906; {pin}</div></div>'
            f'<svg class="abs" style="left:0;top:0;overflow:visible" width="{SZ}" height="{SZ}"><defs><clipPath id="{i}cp" clipPathUnits="userSpaceOnUse"><path id="{i}cpp" d="{fold_d(78)}"/></clipPath>'
            f'<linearGradient id="{g}" gradientUnits="objectBoundingBox" x1="1" y1="1" x2="0" y2="0">'
            f'<stop offset="0" stop-color="{color_a}"/><stop offset="0.22" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="0.42" stop-color="{color_b}"/>'
            f'<stop offset="0.8" stop-color="{flap}"/><stop offset="1" stop-color="{flap}"/></linearGradient>'
            f'<filter id="{f}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="-6" dy="-4" stdDeviation="7" flood-color="#000" flood-opacity=".28"/></filter></defs>'
            f'<path id="{i}f" d="{fold_pts(78)}" fill="url(#{g})" filter="url(#{f})"/>'
            f'<path id="{i}h" d="{fold_hl(78)}" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/></svg></div>')

# ---------- face videos ----------
FACE_CX, FACE_CY, FACE_H = 260, 290, 340      # head centre/height inside face.webm (480x560)
def head_box(t0, t1):
    import numpy as np
    from PIL import Image
    bs = []
    for k in range(5):
        i = int((t0 + (t1 - t0) * (k + 0.5) / 5) * 23.976)
        f = R / f"prep/face/o{i:04d}.png"
        if not f.exists(): continue
        a = np.asarray(Image.open(f))[:, :, 3] > 128
        if a.sum() < 2000: continue
        ys, xs = np.nonzero(a); bs.append((xs.min(), ys.min(), xs.max(), ys.max()))
    if not bs: return FACE_CX, FACE_CY, FACE_H
    x0, y0, x1, y1 = np.median(np.array(bs), 0)
    return (x0 + x1) / 2, (y0 + y1) / 2, y1 - y0

def face(scene, cx, cy, head_h, t0, t1, gray=True, bob=9, rot=(0, 0), z=20, period=1/3, mask=None):
    """face clip positioned by head centre (measured per scene from the matte); bob wrapper animated."""
    FACE_CX, FACE_CY, FH = head_box(t0, t1)
    s = head_h / FH
    w, h = 480 * s, 560 * s
    wid = nid("fw"); vid = nid("fv")
    src = "assets/face_gray12.webm" if gray else "assets/face12.webm"   # held on twos like the reel graphics
    ox = oy = 0; pre = post = ""
    if mask:   # (id, x, y, w, h, mask png, overlay html): the head only shows through the mask (e.g. a van window)
        mid, mx, my, mw, mh, msrc, over = mask; ox, oy = mx, my
        pre = (f'<div id="{mid}" class="abs" style="left:{mx:.0f}px;top:{my:.0f}px;width:{mw:.0f}px;height:{mh:.0f}px;'
               f'-webkit-mask-image:url({msrc});mask-image:url({msrc});-webkit-mask-size:100% 100%;mask-size:100% 100%"><div class="cabin"></div>')
        post = over + "</div>"
    html.append(f'<div class="cam {scene}-cam" style="z-index:{z}">{pre}<div id="{wid}" class="fwrap" style="left:{cx - FACE_CX*s - ox:.0f}px;top:{cy - FACE_CY*s - oy:.0f}px;width:{w:.0f}px;height:{h:.0f}px;transform-origin:50% 70%">'
                f'<video id="{vid}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-media-start="{t0:.3f}" data-track-index="3" src="{src}" muted playsinline data-layout-allow-occlusion style="width:100%;height:100%"></video></div>{post}</div>')
    n = max(1, int((t1 - t0) / (period / 2)) - 1)
    if bob:
        js.append(f'tl.fromTo("#{wid}",{{y:0,scaleY:1}},{{y:-{bob},scaleY:1.025,duration:{period/2},ease:"sine.inOut",yoyo:true,repeat:{n}}},{t0:.3f});')
    if rot != (0, 0):
        js.append(f'tl.fromTo("#{wid}",{{rotation:{rot[0]}}},{{rotation:{rot[1]},duration:{period},ease:"sine.inOut",yoyo:true,repeat:{max(1, int((t1-t0)/period)-1)}}},{t0:.3f});')
    return wid

def scene(sid, t0, t1, inner, bg=WHITE, z=10):
    html.append(f'<div id="{sid}" class="clip scene" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="1" style="z-index:{z};background:{bg}" data-layout-allow-overflow data-layout-allow-overlap>'
                f'<div class="cam {sid}-cam">{inner}</div></div>')

def layer(sid, t0, t1, inner, z):
    lid = nid(sid + "L")
    html.append(f'<div id="{lid}" class="clip scene" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="2" style="z-index:{z};background:transparent" data-layout-allow-overflow data-layout-allow-overlap>'
                f'<div class="cam {sid}-cam">{inner}</div></div>')

def cam_push(sid, t0, t1, a=1.0, b=1.05, origin=None):
    js.append(f'tl.fromTo(".{sid}-cam",{{scale:{a}}},{{scale:{b},duration:{t1 - t0:.3f},ease:"none"}},{t0:.3f});')

def cam_settle(sid, t0, t1, a=1.32, blur=12, push=1.04, d=0.3):
    js.append(f'tl.fromTo(".{sid}-cam",{{scale:{a},filter:"blur({blur}px)"}},{{scale:1,filter:"blur(0px)",duration:{d},ease:"power3.out"}},{t0:.3f});')
    js.append(f'tl.fromTo(".{sid}-cam",{{scale:1}},{{scale:{push},duration:{t1 - t0 - d:.3f},ease:"none",immediateRender:false}},{t0 + d:.3f});')

# =====================================================================
# v2 scenes: Flow-made objects, B&W b-roll with line screen, graphics stepped at 12 fps
# =====================================================================
import re
META = json.loads((R / "prep/assets_meta.json").read_text(encoding="utf-8"))

def img(src, x, y, w, i=None, extra="", h=None, cls="abs"):
    i = i or nid("im")
    hh = f"height:{h:.0f}px;" if h else ""
    return f'<div id="{i}" class="{cls}" style="left:{x:.0f}px;top:{y:.0f}px;width:{w:.0f}px;{hh}{extra}"><img src="{src}" style="width:100%;{"height:100%;" if h else ""}display:block"></div>'

def pxs(name, x, y, w, i=None, extra=""):
    """pixel sprite (Flow art mosaicked to ~26 blocks) shown with nearest-neighbour scaling."""
    i = i or nid("px")
    return f'<div id="{i}" class="abs" style="left:{x:.0f}px;top:{y:.0f}px;width:{w:.0f}px;{extra}"><img src="assets/px/{name}.png" style="width:100%;display:block;image-rendering:pixelated"></div>'

def refl(src, x, y, w, h, op=0.32):
    """mirrored copy under an object standing on the halftone floor (y = floor line)."""
    return (f'<div class="abs" style="left:{x:.0f}px;top:{y:.0f}px;width:{w:.0f}px;height:{h:.0f}px;opacity:{op};transform:scaleY(-1);transform-origin:50% 50%;'
            f'-webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 45%,#000 100%);mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 45%,#000 100%)">'
            f'<img src="{src}" style="width:100%;height:100%;display:block"></div>')

def broll(name, t0, t1, z=60):
    html.append(f'<video id="{name}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="5" src="assets/broll/{name}.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;z-index:{z}"></video>')

def bcap(lines, t0, t1):
    i = nid("bc")
    html.append(f'<div id="{i}" class="clip bcap" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="6" style="z-index:61" data-layout-allow-caption-zone>{"<br>".join(lines)}</div>')
    js.append(f'tl.fromTo("#{i}",{{color:"#8A8A8A"}},{{color:"#FFFFFF",duration:0.125,ease:"none"}},{t0:.3f});')

def legs_svg(sid, x, y, w, h, hip, feet):
    """smooth curved gradient legs (reel walker) + Flow sneakers; hip=(x,y) in svg px, feet=[(x,y),(x,y)]."""
    g = nid("lg")
    out = f'<svg class="abs" style="left:{x}px;top:{y}px;overflow:visible" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs><linearGradient id="{g}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6F6F6F"/><stop offset="1" stop-color="#E2E2E2"/></linearGradient></defs>'
    for k, (fx, fy) in enumerate(feet):
        hx = hip[0] + (-24 if k == 0 else 24); sgn = -1 if k == 0 else 1
        c1 = (hx + sgn * 70, hip[1] + (fy - hip[1]) * 0.30)
        c2 = (fx - sgn * 60, hip[1] + (fy - hip[1]) * 0.72)
        out += (f'<g id="{sid}l{k}" style="transform-origin:{hx}px {hip[1]}px"><path d="M{hx:.0f} {hip[1]:.0f} C {c1[0]:.0f} {c1[1]:.0f}, {c2[0]:.0f} {c2[1]:.0f}, {fx:.0f} {fy:.0f}" '
                f'stroke="url(#{g})" stroke-width="13" fill="none" stroke-linecap="round"/></g>')
    return out + "</svg>"

def walk(sid, hip, feet, t0, n):
    """walk cycle: each leg swings around its own hip point (svgOrigin), its sneaker slides with the foot."""
    for k in range(2):
        hx = hip[0] + (-24 if k == 0 else 24); a = 9 if k == 0 else -9
        L = feet[k][1] - hip[1]; dx = math.sin(math.radians(a)) * L
        js.append(f'gsap.set("#{sid}l{k}",{{svgOrigin:"{hx:.0f} {hip[1]:.0f}"}});')
        js.append(f'tl.fromTo("#{sid}l{k}",{{rotation:{a}}},{{rotation:{-a},duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:{n}}},{t0:.3f});')
        js.append(f'tl.fromTo("#{sid}s{k}",{{x:{-dx:.0f}}},{{x:{dx:.0f},duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:{n}}},{t0:.3f});')

def sneakers(sid, feet_abs, w=200):
    out = ""
    for k, (fx, fy) in enumerate(feet_abs):
        src = "assets/flow/sneaker_l.png" if k == 0 else "assets/flow/sneaker_r.png"
        ar = 391 / 526 if k == 0 else 345 / 568
        out += img(src, fx - w * 0.45, fy - w * ar * 0.55, w, f"{sid}s{k}")
    return out

# =====================================================================
# S1  0.00-1.92  "The jerseys finally show up."  B&W face in the Flow van's cab, Flow thumbs-up hand behind the head
# =====================================================================
t0, t1 = 0.0, 1.92
s = "s1"
VW = 1000; K = VW / META["van_size"][0]; VH = META["van_size"][1] * K
VX, VY = 40, 790
wx0, wy0, wx1, wy1 = [v * K for v in META["van_window"]]
FLOOR = VY + VH - 18
thin_txt = "the jerseys finally"; tw = thin_w(thin_txt, 76)
inner = (f'<div class="floor-teal" style="top:{FLOOR:.0f}px"></div>'
         + f'<div id="s1refl" class="abs" style="left:0;top:0">{refl("assets/flow/van_side.png", VX, FLOOR, VW, VH)}</div>'
         + words_line([("the", 0.32), ("jerseys", 0.46), ("finally", 0.85)], 430, 76, "thin", ghost=GHOST)
         + words_line([("SHOW", 1.12), ("UP", 1.58)], 525, fit("SHOW UP", 780, 160), "wide")
         + chevron(540 - tw / 2 - 108, 352, 100, 14, False, 0, t1) + chevron(540 + tw / 2 + 6, 352, 100, -14, True, 0, t1)
         + img("assets/flow/van_side.png", VX, VY, VW, "s1vb"))
scene(s, t0, t1, inner)
WX0, WY0, WX1, WY1 = [v * K for v in (216, 79, 448, 223)]          # measured window glass bbox (van px)
HX, HY, HH = VX + (WX0 + WX1) / 2 + 18, VY + WY0 + (WY1 - WY0) * 0.62, 185
# thumbs-up arm goes BEHIND the head: hand layer (z 15) under the face (z 20)
layer(s, t0, t1, img("assets/flow/thumb.png", HX + 10, HY - 270, 250, "s1th", "transform-origin:10% 95%"), 15)
fw1 = face(s, HX, HY, HH, t0, t1, bob=4, z=20,
           mask=("s1win", VX, VY, VW, VH, "assets/flow/van_window_mask.png",
                 '<div class="glass"></div>'))
layer(s, t0, t1, img("assets/flow/van_side_low.png", VX, VY, VW, "s1vf"), 30)
MOV = "#s1vb,#s1vf,#s1refl,#s1th,#s1win"
js.append(f'tl.fromTo("{MOV}",{{x:1150}},{{x:0,duration:0.42,ease:"power3.out"}},0);')
js.append(f'tl.fromTo("#s1th img",{{rotation:-6}},{{rotation:6,duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:9}},0.33);')
js.append(f'tl.to("{MOV}",{{x:-1350,duration:0.21,ease:"power3.in"}},1.71);')
cam_push(s, t0, t1, 1.0, 1.04)
sfx("car", 0.0, 0.45); whoosh(1.76, 0.35)

# =====================================================================
# S2  1.92-3.50  "And there's a wrong name on the back."  Flow jersey back, higher, reflected on the halftone floor
# =====================================================================
t0, t1 = 1.92, 3.50
s = "s2"
JW = 600; JH = JW * 951 / 843; JX, JY = 240, 560; FL2 = JY + JH - 6
inner = (f'<div class="floor-teal" style="top:{FL2:.0f}px"></div>'
         + refl("assets/flow/jersey_back.png", JX, FL2, JW, JH, 0.30)
         + pill(540, 215, ["the fine", "print"], 1.97, w=300, h=104, t1=t1)
         + words_line([("and", 1.97), ("there's", 2.07), ("a", 2.23)], 365, 60, "thin")
         + words_line([("WRONG", 2.37), ("NAME", 2.49)], 440, fit("WRONG NAME", 760, 140), "wide")
         + img("assets/flow/jersey_back.png", JX, JY, JW, "s2j")
         + f'<svg class="abs" style="left:{JX + 70}px;top:{JY + 40}px" width="460" height="170" viewBox="0 0 640 300" preserveAspectRatio="none"><path id="s2c" d="M70 90 Q320 0 590 80 Q640 170 450 220 Q230 262 70 200 Q10 140 110 70 L190 40" fill="none" stroke="#E8312B" stroke-width="13" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>')
scene(s, t0, t1, inner)
cam_settle(s, t0, t1, 1.28, 10, 1.05)
js.append('tl.fromTo("#s2c",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.42,ease:"power2.inOut"},2.62);')
sfx("marker", 2.62, 0.5); sfx("marker", 2.82, 0.4)

# =====================================================================
# S3  3.50-5.05  "Or it just doesn't fit."  walker swallowed by an oversized Flow jersey
# =====================================================================
t0, t1 = 3.50, 5.05
s = "s3"
O3X, O3Y, O3W, O3H = 175, 250, 400, 470
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
pop(4.67, 0.3); whoosh(3.52, 0.25)

# B1 5.05-5.72 "A lot of coaches"
broll("b1", 5.05, 5.72); bcap(["A LOT OF", "COACHES"], 5.05, 5.72); whoosh(5.05, 0.2)

# =====================================================================
# S4  5.72-7.45  calendar: sticky notes INSIDE the grid cells (cell 600 px), camera pans cell to cell along the row
# =====================================================================
t0, t1 = 5.72, 7.45
s = "s4"
CELL = 600
grid = "".join(f'<div class="gl" style="left:{x}px;top:-1800px;width:2px;height:5400px"></div>' for x in range(-1500, 3900, CELL)) + \
       "".join(f'<div class="gl" style="left:-1800px;top:{y}px;width:5400px;height:2px"></div>' for y in range(-1800, 3600, CELL))
STK = [("s4a", "#F3413D", "#F07C88", "03 MON", ["RETURN", "LABEL"], "day 3", "Coach's garage", TEAL_D, 5.74, 6.0, "#9E1B22"),
       ("s4b", "#E3C675", "#D7B159", "12 WED", ["STILL", "WAITING"], "day 12", "Shipping desk", RED, 6.14, 6.40, "#8C6A1E"),
       ("s4c", "#8FD0BF", "#4AAB90", "21 FRI", ["BACK AND", "FORTH"], "day 21", "Everyone's inbox", "#E8312B", 6.58, 6.84, "#1F6B59")]
pos = [(300 + CELL * k, 600) for k in range(3)]
st_html = "".join(f'<div class="abs" style="left:{x + 2}px;top:{y + 2}px">{sticker(i, a, b, d, tl_, c, p, cc, fl)}</div>'
                  for (i, a, b, d, tl_, c, p, cc, ta, tc, fl), (x, y) in zip(STK, pos))
inner = f'<div id="s4pan" class="abs" style="left:0;top:0;width:1080px;height:1920px"><div class="abs" style="left:0;top:0;width:1080px;height:1920px;transform:rotate(-14deg);transform-origin:540px 960px">{grid}{st_html}</div></div>'
scene(s, t0, t1, inner)
for k, ((i, a, b, d, tl_, c, p, cc, ta, tc, fl), (x, y)) in enumerate(zip(STK, pos)):
    # reel peel (67.2 s / 75.75 s): a huge glossy folded corner peels back to a small curl at the bottom-right in ~0.5 s,
    # the note settles 118 % -> 100 %; afterwards the curl keeps lifting a little
    js.append(f'tl.fromTo("#{i}",{{opacity:0}},{{opacity:1,duration:0.083,ease:"none"}},{ta - 0.083:.3f});')
    js.append(f'tl.fromTo("#{i}",{{scale:1.18}},{{scale:1,duration:0.5,ease:"power2.out",transformOrigin:"50% 50%"}},{ta:.3f});')
    for pid, fn in (("f", fold_pts), ("h", fold_hl), ("cpp", fold_d)):
        js.append(f'tl.fromTo("#{i}{pid}",{{attr:{{d:"{fn(640)}"}}}},{{attr:{{d:"{fn(78)}"}},duration:0.5,ease:"power2.out"}},{ta:.3f});')
        js.append(f'tl.fromTo("#{i}{pid}",{{attr:{{d:"{fn(78)}"}}}},{{attr:{{d:"{fn(96)}"}},duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3,immediateRender:false}},{ta + 0.5:.3f});')

    js.append(f'tl.fromTo("#{i}c",{{strokeDashoffset:1}},{{strokeDashoffset:0,duration:0.29,ease:"power2.inOut"}},{tc:.3f});')
    sfx("sticker" if k != 1 else "sticker2", ta, 0.45); sfx("marker", tc, 0.38)
    if k:
        js.append(f'tl.to("#{STK[k-1][0]}",{{opacity:0.25,duration:0.17}},{ta:.3f});')
def rot(x, y, a=-14):
    r = math.radians(a); cx, cy = 540, 960
    return cx + (x - cx) * math.cos(r) - (y - cy) * math.sin(r), cy + (x - cx) * math.sin(r) + (y - cy) * math.cos(r)
cen = [rot(x + CELL / 2, y + CELL / 2) for x, y in pos]
dx = [540 - c[0] for c in cen]; dy = [930 - c[1] for c in cen]
js.append(f'tl.fromTo("#s4pan",{{x:{dx[0]:.0f},y:{dy[0]:.0f}}},{{x:{dx[0]:.0f},y:{dy[0]:.0f},duration:0.083}},{t0});')
js.append(f'tl.to("#s4pan",{{x:{dx[1]:.0f},y:{dy[1]:.0f},duration:0.33,ease:"power2.inOut"}},6.0);')
js.append(f'tl.to("#s4pan",{{x:{dx[2]:.0f},y:{dy[2]:.0f},duration:0.33,ease:"power2.inOut"}},6.42);')
whoosh(6.0, 0.2); whoosh(6.42, 0.2)
cam_push(s, t0, t1, 1.0, 1.04)

# =====================================================================
# S5  7.45-8.69  "Whose fault was it?"  red scene, outline stack, pixel boxes in the lane
# =====================================================================
t0, t1 = 7.45, 8.69
s = "s5"
def stack(lines, top, sid):
    out = f'<div id="{sid}" class="stack" style="top:{top}px">'
    for txt, t in lines:
        i = nid("sl")
        out += f'<div id="{i}" class="sln"><span>{txt}</span></div>'
        js.append(f'tl.fromTo("#{i}",{{color:"#F5B5BB",borderColor:"rgba(255,255,255,0)"}},{{color:"#FFFFFF",borderColor:"rgba(255,255,255,0.95)",duration:0.167}},{t:.3f});')
    return out + "</div>"
lane = ('<div class="abs" style="left:80px;top:360px;width:3px;height:1260px;background:rgba(255,255,255,.85)"></div>'
        '<div class="abs" style="left:430px;top:360px;width:3px;height:1260px;background:rgba(255,255,255,.85)"></div>'
        '<div class="abs checker" style="left:83px;top:1540px;width:347px;height:70px"></div>')
boxes = "".join(pxs("box", x, y, 128, f"s5b{k}") for k, (x, y) in enumerate([(120, 520), (270, 860), (130, 1180)]))
inner = ('<div class="dots-red"></div><div class="corner tr"></div><div class="corner bl"></div>' + lane + boxes
         + stack([("WHOSE", 7.53), ("FAULT", 7.77), ("WAS IT?", 8.01)], 620, "s5k1"))
scene(s, t0, t1, inner, bg=RED)
for k, (a, b) in enumerate([(0, 300), (0, -300), (0, 260)]):
    js.append(f'tl.fromTo("#s5b{k}",{{y:{a}}},{{y:{b},duration:0.5,ease:"power2.inOut",yoyo:true,repeat:1}},{t0 + k*0.083:.3f});')
js.append(f'tl.fromTo(".{s}-cam",{{x:-140,filter:"blur(10px)"}},{{x:0,filter:"blur(0px)",duration:0.21,ease:"power3.out"}},{t0});')
whoosh(t0, 0.35); pop(7.53, 0.2); pop(8.01, 0.2)

# B2 8.69-9.75 "Who pays for shipping?"
broll("b2", 8.69, 9.75); bcap(["WHO PAYS", "SHIPPING?"], 8.69, 9.75); whoosh(8.69, 0.2)

# =====================================================================
# S6  9.75-12.10  "Here's what a good uniform company does instead."  B&W face on a giant Flow jersey
# =====================================================================
t0, t1 = 9.75, 12.10
s = "s6"
html.append(f'<div class="cam {s}-cam" style="z-index:10"><video id="th6" class="clip" data-start="{t0}" data-duration="{t1 - t0:.3f}" data-media-start="{t0}" data-track-index="1" src="assets/edit.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
html.append(f'<div class="cam {s}-cam" style="z-index:11"><video id="thb6" class="clip" data-start="{t0}" data-duration="0.3" data-media-start="0" data-track-index="2" src="assets/th_blur_975.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
js.append(f'tl.fromTo("#thb6",{{opacity:1}},{{opacity:0,duration:0.22,ease:"power2.out",data:"smooth"}},{t0 + 0.05:.3f});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.12}},{{scale:1.0,duration:0.3,ease:"power3.out",data:"smooth"}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.0}},{{scale:1.06,duration:{t1 - t0 - 0.3:.2f},ease:"none",immediateRender:false,data:"smooth"}},{t0 + 0.3:.3f});')
for txt, a_, b_ in [("here's what", 9.75, 10.16), ("a good uniform", 10.16, 10.92), ("company", 10.92, 11.29), ("does instead.", 11.29, 12.10)]:
    i = nid("cap")
    html.append(f'<div id="{i}" class="clip thcap" data-start="{a_:.3f}" data-duration="{b_ - a_:.3f}" data-track-index="4" style="z-index:40">{txt}</div>')

# =====================================================================
# S7  12.10-13.36  "They remake it."  pill + teal tab + pixel road (Flow jersey mosaics)
# =====================================================================
t0, t1 = 12.10, 13.36
s = "s7"
inner = (pill(540, 330, ["the fix"], 12.12, w=260, h=86, t1=t1, size=38)
         + tab(110, 470, 860, 300, 12.18)
         + words_line([("THEY", 12.18)], 505, 120, "wide")
         + words_line([("REMAKE", 12.30), ("IT.", 12.60)], 630, fit("REMAKE IT.", 760, 130), "wide")
         + '<div class="road" style="top:1150px"><div id="s7dash" class="dash"></div></div>'
         + pxs("jersey_red", 400, 900, 260, "s7old") + '<div id="s7x" class="xmark" style="left:640px;top:880px">&#10005;</div>'
         + pxs("jersey_green", 400, 900, 260, "s7new")
         + f'<div id="s7ok" class="abs" style="left:660px;top:880px">{check_px(10)}</div>')
scene(s, t0, t1, inner)
js.append('tl.fromTo("#s7dash",{x:0},{x:-900,duration:1.25,ease:"none"},12.10);')
js.append('tl.fromTo("#s7old,#s7x",{x:0},{x:-900,duration:0.25,ease:"power3.in"},12.50);')
js.append('tl.fromTo("#s7new",{x:900},{x:0,duration:0.33,ease:"power3.out"},12.58);')
js.append('tl.fromTo("#s7ok",{scale:0,rotation:-30},{scale:1,rotation:0,duration:0.29,ease:"back.out(2.5)"},12.92);')
cam_push(s, t0, t1, 1.0, 1.04)
whoosh(12.50, 0.3); sfx("coin", 12.92, 0.35)

# B3 + B4 13.36-15.08 "They don't ask whose fault it was."
broll("b3", 13.36, 14.20); broll("b4", 14.20, 15.08); bcap(["NO BLAME", "GAME"], 13.36, 15.08); whoosh(13.36, 0.2)

# =====================================================================
# S8  15.08-16.82  "They cover shipping both ways."  top-down Flow van on the gold lane
# =====================================================================
t0, t1 = 15.08, 16.82
s = "s8"
hair = "".join(f'<div class="hair" id="s8h{k}" style="left:{x}px;top:{y}px;height:{h}px"></div>'
               for k, (x, y, h) in enumerate([(130, 300, 420), (260, 820, 520), (940, 200, 560), (1010, 900, 380), (180, 1300, 300), (900, 1350, 420)]))
inner = ('<div class="lane"></div>' + hair
         + words_line([("they", 15.15), ("cover", 15.31), ("shipping", 15.55)], 300, 60, "thin")
         + words_line([("BOTH", 16.00), ("WAYS", 16.25)], 380, fit("BOTH WAYS", 760, 150), "wide")
         + img("assets/flow/van_top.png", 395, 640, 290, "s8van", "transform-origin:50% 50%"))
scene(s, t0, t1, inner)
js.append('tl.fromTo("#s8van",{y:-1300,filter:"blur(10px)"},{y:0,filter:"blur(0px)",duration:0.29,ease:"power3.out"},15.08);')
js.append('tl.to("#s8van",{rotation:180,duration:0.33,ease:"power2.inOut"},15.98);')
js.append('tl.to("#s8van",{y:1400,duration:0.29,ease:"power3.in"},16.5);')
for k in range(6):
    js.append(f'tl.fromTo("#s8h{k}",{{y:-600}},{{y:900,duration:0.58,ease:"none",repeat:2}},{t0 + k*0.083:.3f});')
cam_push(s, t0, t1, 1.0, 1.05)
sfx("car", 14.70, 0.4); whoosh(15.98, 0.3); whoosh(16.5, 0.3)

# B5 16.82-17.70 "No arguing"
broll("b5", 16.82, 17.70); bcap(["NO ARGUING"], 16.82, 17.70); whoosh(16.82, 0.2)

# =====================================================================
# S9  17.70-18.52  "...over who pays."  manga burst + Flow front-view van rushing at camera, strike-through
# =====================================================================
t0, t1 = 17.70, 18.52
s = "s9"
sl = "".join(f'<div id="s9sl{k}" class="abs" style="left:0;top:0;opacity:{1 if k == 0 else 0}">{speedlines(k + 3, cy=1200, r0=420)}</div>' for k in range(3))
inner = (sl
         + words_line([("no", 16.89), ("arguing", 17.07), ("over", 17.49)], 420, 60, "thin")
         + words_line([("WHO", 17.75), ("PAYS", 17.99)], 500, fit("WHO PAYS", 760, 160), "wide")
         + '<svg class="abs" style="left:150px;top:480px" width="780" height="200" viewBox="0 0 780 200"><path id="s9x" d="M20 120 Q200 60 390 100 T760 70" fill="none" stroke="#E8312B" stroke-width="16" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>'
         + img("assets/flow/van_front.png", 160, 900, 760, "s9van", "transform-origin:50% 60%"))
scene(s, t0, t1, inner)
for k in range(int((t1 - t0) / 0.083)):
    a, b = k % 3, (k + 1) % 3
    js.append(f'tl.set("#s9sl{a}",{{opacity:0}},{t0 + (k+1)*0.083:.3f}); tl.set("#s9sl{b}",{{opacity:1}},{t0 + (k+1)*0.083:.3f});')
js.append('tl.fromTo("#s9van",{scale:0.55,y:-60},{scale:1.08,y:40,duration:0.82,ease:"power1.in"},17.70);')
js.append('tl.fromTo("#s9x",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.25,ease:"power2.out"},18.12);')
cam_settle(s, t0, t1, 1.3, 12, 1.04, 0.25)
sfx("car", 17.30, 0.35); sfx("marker", 18.12, 0.45)

# =====================================================================
# S10 18.52-20.90  "And they ship the new ones straight to the player's house."  pixel van (Flow mosaic) -> pixel house
# =====================================================================
t0, t1 = 18.52, 20.90
s = "s10"
PS = 13; PVW = 44 * PS; PVH = 21 * PS; PVX, PVY = 380, 960
inner = (pill(540, 300, ["free", "remake"], 18.60, w=280, h=104, t1=t1)
         + words_line([("and", 18.60), ("they", 18.72), ("ship", 18.88), ("the", 19.04), ("new", 19.18), ("ones", 19.30)], 425, 50, "thin")
         + tab(90, 500, 900, 300, 18.72)
         + words_line([("STRAIGHT", 19.58), ("TO", 19.83)], 535, fit("STRAIGHT TO", 760, 120), "wide")
         + words_line([("PLAYER'S", 20.10), ("HOUSE", 20.44)], 660, fit("PLAYER'S HOUSE", 760, 120), "wide")
         + '<div class="road" style="top:1230px"><div id="s10dash" class="dash"></div></div>'
         + pxs("house", 50, 960, 22 * 12, "s10house")
         + pxs("van", PVX, PVY, PVW, "s10van")
         + pxs("box", 150, 1130, 96, "s10box"))
scene(s, t0, t1, inner)
pwx0, pwy0, pwx1, pwy1 = [v / META["van_size"][0] * 44 * PS for v in META["van_window"]]
fw10 = face(s, PVX + (pwx0 + pwx1) / 2 + 6, PVY + pwy0 + 30, 120, t0, t1, bob=0, z=20)
layer(s, t0, t1, pxs("van", PVX, PVY, PVW, "s10vf", f"clip-path:inset({(pwy1 / PVH) * 100:.1f}% 0 0 0)"), 30)
MV10 = f"#s10van,#s10vf,#{fw10}"
js.append(f'tl.fromTo("{MV10}",{{x:800}},{{x:0,duration:0.5,ease:"power3.out"}},18.55);')
js.append(f'tl.to("{MV10}",{{x:-50,duration:0.92,ease:"power2.inOut"}},19.40);')
js.append(f'tl.fromTo("{MV10}",{{y:0}},{{y:-5,duration:0.083,ease:"none",yoyo:true,repeat:25}},18.55);')
js.append('tl.fromTo("#s10dash",{x:-1400},{x:0,duration:1.83,ease:"power1.out"},18.55);')
js.append('tl.fromTo("#s10box",{scale:0,y:-60},{scale:1,y:0,duration:0.29,ease:"back.out(2.4)"},20.44);')
cam_push(s, t0, t1, 1.0, 1.05)
sfx("car", 18.10, 0.35); pop(20.44, 0.3)

# B6 + B7 20.90-22.36 "Look, mistakes happen,"
broll("b6", 20.90, 21.62); broll("b7", 21.62, 22.36); bcap(["MISTAKES", "HAPPEN"], 20.90, 22.36); whoosh(20.90, 0.2)

# =====================================================================
# S11 22.36-23.84  talking head (real footage, full fps) + thin white captions, rack-focus in
# =====================================================================
t0, t1 = 22.36, 23.84
s = "s11"
html.append(f'<div class="cam {s}-cam" style="z-index:10"><video id="th" class="clip" data-start="{t0}" data-duration="{t1 - t0:.3f}" data-media-start="{t0}" data-track-index="1" src="assets/edit.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
html.append(f'<div class="cam {s}-cam" style="z-index:11"><video id="thb" class="clip" data-start="{t0}" data-duration="0.3" data-media-start="0" data-track-index="2" src="assets/th_blur.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
js.append(f'tl.fromTo("#thb",{{opacity:1}},{{opacity:0,duration:0.22,ease:"power2.out",data:"smooth"}},{t0 + 0.05:.3f});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.12}},{{scale:1.0,duration:0.3,ease:"power3.out",data:"smooth"}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.0}},{{scale:1.05,duration:{t1 - t0 - 0.3:.2f},ease:"none",immediateRender:false,data:"smooth"}},{t0 + 0.3:.3f});')
for txt, a, b in [("but the fix", 22.36, 22.85), ("shouldn't be", 22.85, 23.30), ("a fight.", 23.30, 23.84)]:
    i = nid("cap")
    html.append(f'<div id="{i}" class="clip thcap" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="4" style="z-index:40">{txt}</div>')

# =====================================================================
# S12 23.84-26.32  "So ask how a company handles it before you order."  dark UI card + cursor (pixel Flow jerseys)
# =====================================================================
t0, t1 = 23.84, 26.32
s = "s12"
ROWS = [("BIG BRAND", "gray"), ("CHEAP CO.", "red"), ("STIMULUS", "green")]
rows = ""
for k, (nm, col) in enumerate(ROWS):
    rows += (f'<div id="s12r{k}" class="urow" style="top:{230 + k*185}px"><div class="ucard"><img src="assets/px/jersey_{col}.png" style="position:absolute;left:22px;top:18px;width:112px;image-rendering:pixelated">'
             f'<div class="uname"><span class="usig">{"ask them" if k < 2 else "remakes it"}</span><b>{nm}</b></div></div>'
             f'<div id="s12b{k}" class="ubtn">?</div></div>')
inner = ('<div class="swoosh"></div>'
         f'<div id="s12card" class="uicard"><div class="uhead">Before you order:</div>{rows}'
         f'<div class="uhead" style="top:800px">Ask them:</div>'
         + "".join(f'<div id="s12q{k}" class="uq" style="top:{875 + k*108}px">{q}</div>' for k, q in enumerate(["What if it doesn't fit?", "Who pays for shipping?", "Wrong name? Remake?"]))
         + '</div>'
         + '<svg id="s12cur" class="abs" style="left:640px;top:1500px" width="90" height="110" viewBox="0 0 30 37"><path d="M2 2 L2 30 L9 23 L14 35 L19 33 L14 21 L24 21 Z" fill="#FFF" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>')
scene(s, t0, t1, inner)
js.append('tl.fromTo("#s12card",{scale:0.6,opacity:0},{scale:1,opacity:1,duration:0.21,ease:"power3.out"},23.86);')
for k in range(3):
    js.append(f'tl.fromTo("#s12r{k}",{{x:-120,opacity:0}},{{x:0,opacity:1,duration:0.17,ease:"power3.out"}},{23.92 + k*0.083:.3f});')
for k, t in enumerate([24.27, 24.73, 24.85]):
    js.append(f'tl.fromTo("#s12q{k}",{{x:-80,opacity:0}},{{x:0,opacity:1,duration:0.17,ease:"power3.out"}},{t:.3f});'); pop(t, 0.16)
js.append('tl.fromTo("#s12cur",{x:120,y:200},{x:0,y:0,duration:0.5,ease:"power2.inOut"},24.95);')
js.append('tl.to("#s12cur",{x:150,y:-640,duration:0.42,ease:"power2.inOut"},25.40);')
js.append('tl.to("#s12cur",{scale:0.85,duration:0.083,yoyo:true,repeat:1},25.83);')
js.append('tl.to("#s12b2",{backgroundColor:"#3E9D86",color:"#FFFFFF",scale:1.08,duration:0.083},25.86);')
js.append('tl.to("#s12b2",{scale:1,duration:0.167},25.95);')
pop(23.86, 0.25); sfx("click", 25.85, 0.55)
cam_push(s, t0, t1, 1.0, 1.04)

# =====================================================================
# S13 26.32-27.32  "At Stimulus,"  pixel torso -> real, script + wide name + capsule
# =====================================================================
t0, t1 = 26.32, 27.32
s = "s13"
TW = 600; TH = round(648 * TW / 714)
tors = img("assets/stimulus_icon.png", 540 - 210, 330, 420, "s13logo", "transform-origin:50% 50%")
inner = (tors
         + words_line([("STIMULUS", 26.52)], 860, fit("STIMULUS", 760, 190), "wide")
         + '<div id="s13sig" class="sig" style="left:250px;top:790px;color:#FFFFFF;-webkit-text-stroke:3px #111;z-index:2">at</div>'
         + f'<div id="s13cap" class="capsule" style="top:1080px"><img src="assets/px/jersey_green.png" style="position:absolute;left:305px;top:22px;width:150px;image-rendering:pixelated"><div class="capt">ATHLETIC</div></div>')
scene(s, t0, t1, inner)
js.append('tl.fromTo("#s13logo",{scale:0,rotation:-200,opacity:0},{scale:1,rotation:0,opacity:1,duration:0.42,ease:"back.out(1.7)"},26.32);')
js.append(f'tl.fromTo("#s13logo",{{y:0}},{{y:-8,duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:2,immediateRender:false}},26.80);')
js.append('tl.fromTo("#s13sig",{scale:0,rotation:-20},{scale:1,rotation:-9,duration:0.125,ease:"back.out(2)"},26.40);')
js.append('tl.fromTo("#s13cap",{clipPath:"inset(0 50% 0 50% round 60px)"},{clipPath:"inset(0 0% 0 0% round 60px)",duration:0.5,ease:"power3.out"},26.62);')
cam_push(s, t0, t1, 1.0, 1.03)
pop(26.40, 0.3); whoosh(26.62, 0.22)

# =====================================================================
# S14 27.32-30.45 list of 11 strips (Flow jersey mosaics, recoloured)
# =====================================================================
t0, t1 = 27.32, 30.45
s = "s14"
COLS = [("teal", "#1F9E8A"), ("red", "#D7263D"), ("orange", "#F28C28"), ("navy", "#1D2B7A"), ("sky", "#4A7FE0"), ("pink", "#E86FB0"),
        ("gray", "#9A9A9A"), ("crimson", "#C21E2B"), ("blue", "#2140D8"), ("green", "#1B7F4E"), ("black", "#2B2B2B")]
LBL = {0: ("DOESN'T FIT", 27.64), 1: ("WRONG NAME", 28.88), 2: ("WRONG NUMBER", 29.56)}
rows = ""
for k, (nm, c) in enumerate(COLS):
    lab = f'<div id="s14l{k}" class="slab">{LBL[k][0]}</div>' if k in LBL else ""
    rows += (f'<div id="s14r{k}" class="srow" style="top:{150 + k * 140}px"><div class="sgrad" style="background:linear-gradient(90deg,#FFFFFF 0%,{c} 92%)">'
             f'<img src="assets/px/jersey_{nm}.png" style="position:absolute;left:150px;top:3px;width:108px;image-rendering:pixelated"></div>'
             f'<div class="sbar"></div>{lab}<div class="snum">{k + 1:02d}</div></div>')
scene(s, t0, t1, rows)
for k in range(11):
    js.append(f'tl.fromTo("#s14r{k}",{{y:-60,opacity:0}},{{y:0,opacity:1,duration:0.083,ease:"power2.out"}},{27.36 + k*0.083:.3f});')
    if k % 3 == 0:
        sfx("click", 27.36 + k * 0.083, 0.12)
for k, (lab, t) in LBL.items():
    js.append(f'tl.fromTo("#s14l{k}",{{scale:0.5,opacity:0}},{{scale:1,opacity:1,duration:0.167,ease:"back.out(2)"}},{t:.3f});'); pop(t, 0.26)
js.append('tl.to(".s14-cam",{scale:2.2,x:700,y:1417,duration:0.33,ease:"power3.in"},30.12);')
whoosh(30.25, 0.3)
cam_push(s, t0, 30.12, 1.0, 1.03)

# S15 30.45-31.68 close-up "WE REMAKE IT."
t0, t1 = 30.45, 31.68
s = "s15"
inner = ('<div class="abs" style="left:-30px;top:0;width:1140px;height:1920px;background:linear-gradient(90deg,#FFFFFF 10%,#7FD6B3 100%)"></div>'
         + '<div class="floor-teal" style="top:1330px;opacity:.85"></div>'
         + refl("assets/flow/jersey_front.png", 90, 1330, 540, 540 * 996 / 878, 0.22)
         + img("assets/flow/jersey_front.png", 90, 1330 - 540 * 996 / 878 + 4, 540, "s15j", "transform-origin:50% 100%")
         + words_line([("WE", 30.54)], 300, 120, "wide", "right", 0, 930)
         + words_line([("REMAKE", 30.64)], 430, 120, "wide", "right", 0, 930)
         + words_line([("IT.", 30.96)], 560, 120, "wide", "right", 0, 930)
         + f'<div id="s15ok" class="abs" style="left:520px;top:690px">{check_px(13)}</div>')
scene(s, t0, t1, inner)
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.6,filter:"blur(12px)"}},{{scale:1,filter:"blur(0px)",duration:0.29,ease:"power3.out"}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1}},{{scale:1.04,duration:0.94,ease:"none",immediateRender:false}},{t0 + 0.29:.3f});')
js.append('tl.fromTo("#s15ok",{scale:0,rotation:-40},{scale:1,rotation:0,duration:0.29,ease:"back.out(2.5)"},30.96);')
js.append(f'tl.fromTo("#s15j",{{rotation:-4}},{{rotation:3,duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3}},30.5);')
pop(30.54, 0.25); sfx("coin", 30.96, 0.35)

# B8 31.68-32.94 "No questions asked."
broll("b8", 31.68, 32.94); bcap(["NO QUESTIONS", "ASKED"], 31.68, 32.94); whoosh(31.68, 0.2)

# =====================================================================
# S16 32.94-34.80  "Want a uniform company like that?"  walker: B&W face in gold octagon, pixel shades,
#                   Flow heart hand + ball, curved gradient legs, Flow sneakers, teal shadow, reel text layout
# =====================================================================
t0, t1 = 32.94, 34.80
s = "s16"
OX, OY, OW, OH = 95, 300, 540, 640
neck = (OX + OW * 0.52, OY + OH - 8)
feet16 = [(neck[0] - 175, 1400), (neck[0] + 150, 1420)]
oct_svg = (f'<svg id="s16oct" class="abs" style="left:{OX}px;top:{OY}px" width="{OW}" height="{OH}" viewBox="0 0 540 640"><defs><linearGradient id="og" x1="0" y1="0" x2="1" y2="1">'
           '<stop offset="0" stop-color="#EBD49A"/><stop offset="1" stop-color="#D4AE55"/></linearGradient></defs>'
           '<path d="M150 8 L400 0 L532 210 L505 470 L300 632 L80 540 L10 245 Z" fill="url(#og)" stroke="#3A3A3A" stroke-width="2.5" stroke-linejoin="round"/></svg>')
arms = (f'<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>'
        f'<linearGradient id="ag0" gradientUnits="userSpaceOnUse" x1="{neck[0]:.0f}" y1="{neck[1]:.0f}" x2="{neck[0] - 230:.0f}" y2="{neck[1] + 10:.0f}"><stop offset="0" stop-color="#5E5E5E"/><stop offset="1" stop-color="#DCDCDC"/></linearGradient>'
        f'<linearGradient id="ag1" gradientUnits="userSpaceOnUse" x1="{neck[0]:.0f}" y1="{neck[1]:.0f}" x2="{neck[0] + 190:.0f}" y2="{neck[1] + 40:.0f}"><stop offset="0" stop-color="#5E5E5E"/><stop offset="1" stop-color="#DCDCDC"/></linearGradient></defs>'
        f'<path d="M{neck[0]:.0f} {neck[1]:.0f} Q {neck[0] - 90:.0f} {neck[1] + 80:.0f} {neck[0] - 230:.0f} {neck[1] + 10:.0f}" stroke="url(#ag0)" stroke-width="11" fill="none" stroke-linecap="round"/>'
        f'<path d="M{neck[0]:.0f} {neck[1]:.0f} Q {neck[0] + 90:.0f} {neck[1] + 90:.0f} {neck[0] + 190:.0f} {neck[1] + 40:.0f}" stroke="url(#ag1)" stroke-width="11" fill="none" stroke-linecap="round"/></svg>')
inner = (f'<div id="s16sh" class="ellipse" style="left:{neck[0] - 300:.0f}px;top:1365px;width:600px;height:130px"></div>'
         + legs_svg("s16", 0, 0, 1080, 1920, neck, feet16)
         + sneakers("s16", feet16, 210)
         + oct_svg + arms
         + img("assets/flow/ball.png", neck[0] - 330, neck[1] - 60, 150, "s16ball")
         + img("assets/flow/heart.png", neck[0] + 165, neck[1] - 85, 92, "s16hand", "transform-origin:30% 90%")
         + words_line([("want", 33.02), ("a", 33.14), ("uniform", 33.48)], 1030, 44, "thin", "right", 0, 930)
         + words_line([("company", 33.72)], 1083, 44, "thin", "right", 0, 930)
         + words_line([("LIKE", 34.00)], 1140, 112, "wide", "right", 0, 930)
         + words_line([("THAT?", 34.20)], 1250, 78, "wide", "right", 0, 930))
scene(s, t0, t1, inner)
fw16 = face(s, OX + OW * 0.5, OY + OH * 0.48, 470, t0, t1, bob=0, z=20)
HB = head_box(t0, t1)
layer(s, t0, t1, f'<div id="s16sg" class="abs" style="left:{OX + OW*0.5 - 160:.0f}px;top:{OY + OH*0.48 - 12:.0f}px"><div id="s16sgd">{shades_px(13)}</div></div>', 30)
js.append('tl.fromTo("#s16sgd",{y:-760},{y:0,duration:0.33,ease:"power3.out"},33.48);')
BODY = f"#{fw16},#s16oct,#s16sg,#s16ball,#s16hand"
js.append(f'tl.fromTo("{BODY}",{{y:0}},{{y:-10,duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:10}},{t0});')
js.append(f'tl.fromTo("#{fw16},#s16oct",{{rotation:-3}},{{rotation:4,duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:4}},{t0});')
walk("s16", neck, feet16, t0, 5)
js.append(f'tl.fromTo("#s16hand",{{rotation:-6}},{{rotation:10,duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:10}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:0.6,x:-200,y:300}},{{scale:1,x:0,y:0,duration:0.29,ease:"power3.out"}},{t0});')
js.append('tl.fromTo("#s16sh",{scaleX:0.3},{scaleX:1,duration:0.42,ease:"power2.out"},32.94);')
whoosh(t0, 0.25); sfx("wh2", 33.40, 0.25); pop(34.00, 0.28)

# =====================================================================
# S17 34.80-37.30  "Start your free design request. Link in bio."  pill + tab + button click
# =====================================================================
t0, t1 = 34.80, 37.30
s = "s17"
inner = (pill(540, 300, ["free", "design"], 35.17, w=280, h=104, t1=t1)
         + tab(90, 450, 900, 330, 34.88)
         + words_line([("START", 34.88), ("YOUR", 35.01)], 490, fit("START YOUR", 760, 120), "wide")
         + words_line([("REQUEST.", 35.84)], 620, fit("REQUEST.", 760, 130), "wide")
         + words_line([("free", 35.17), ("design", 35.49), ("for", 35.6), ("your", 35.7), ("team", 35.8)], 790, 50, "thin")
         + pxs("jersey_green", 290, 920, 26 * 8, "s17j")
         + pxs("coin", 640, 975, 16 * 9, "s17c")
         + '<div id="s17btn" class="cta">LINK IN BIO &#8594;</div>'
         + '<svg id="s17cur" class="abs" style="left:640px;top:1220px" width="90" height="110" viewBox="0 0 30 37"><path d="M2 2 L2 30 L9 23 L14 35 L19 33 L14 21 L24 21 Z" fill="#FFF" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>')
scene(s, t0, t1, inner)
js.append('tl.fromTo("#s17btn",{scale:0.3,opacity:0},{scale:1,opacity:1,duration:0.21,ease:"back.out(2)"},35.9);')
js.append('tl.fromTo("#s17cur",{x:300,y:300},{x:0,y:0,duration:0.42,ease:"power2.inOut"},35.98);')
js.append('tl.to("#s17cur",{scale:0.85,duration:0.083,yoyo:true,repeat:1},36.46);')
js.append('tl.to("#s17btn",{backgroundColor:"#3E9D86",scale:1.06,duration:0.083},36.48); tl.to("#s17btn",{scale:1,duration:0.167},36.6);')
js.append(f'tl.fromTo("#s17j",{{y:0}},{{y:-10,duration:{BOBH},ease:"sine.inOut",yoyo:true,repeat:13}},34.9);')
js.append('tl.fromTo("#s17c",{scaleX:1},{scaleX:0.08,duration:0.167,ease:"sine.inOut",yoyo:true,repeat:13},34.9);')
cam_settle(s, t0, t1, 1.3, 12, 1.04, 0.29)
sfx("riser", 34.80 - 1.10, 0.10); whoosh(34.80, 0.25); pop(35.9, 0.25); sfx("click", 36.48, 0.55)

# outro (stimulus logo card) slides in over everything
html.append(f'<div id="outro-w"><video id="v-outro" class="clip" data-start="{END}" data-duration="{OUTRO}" data-track-index="7" src="assets/outro.mp4" muted playsinline></video></div>')
js.append(f'tl.fromTo("#outro-w",{{x:1080}},{{x:0,duration:0.29,ease:"power2.out"}},{END});')
whoosh(END, 0.25)

aud.insert(0, '<audio id="voice" class="clip" data-start="0" data-duration="37.70" data-track-index="8" src="assets/voice.wav" data-volume="1"></audio>')
aud.insert(1, f'<audio id="music" class="clip" data-start="0" data-duration="{END + 0.4:.2f}" data-media-start="0" data-track-index="10" src="assets/music.wav" data-volume="0.13" data-fade-out="0.6"></audio>')
aud.insert(2, f'<audio id="music-out" class="clip" data-start="{END}" data-duration="{OUTRO}" data-media-start="{END}" data-track-index="11" src="assets/music.wav" data-volume="0.30" data-fade-in="0.6" data-fade-out="0.5"></audio>')

# ---- 12 fps stepped graphics: snap every graphics tween start/duration to the 1/12 s grid (talking head marked smooth) ----
STEP = 12     # final: 12 fps (8 was tested and rejected)
def snap(v, mn=0.0):
    return max(mn, round(float(v) * STEP) / STEP)
def snap_line(l):
    l = re.sub(r'duration:([0-9.]+)', lambda m: f'duration:{snap(m.group(1), 1/STEP):.4f}', l)
    l = re.sub(r'\},(-?[0-9.]+)\);', lambda m: f'}},{snap(m.group(1)):.4f});', l)
    return l
js = [snap_line(l) for l in js]

CSS = (R / "prep/style.css").read_text(encoding="utf-8")
STEPJS = f"""
// reel graphics animate on twos (12 fps at 24 fps): graphics live on tlg, which is seeked to the 1/12 s grid by a driver tween
// on the main timeline (its ease runs on every seek); talking-head tweens stay on tl at full rate.
var __drv = {{v: 0}};
tl.to(__drv, {{v: 1, duration: {TOTAL}, ease: function (p) {{ tlg.totalTime(Math.floor(p * {TOTAL} * 12 + 1e-6) / 12, true); return p; }}}}, 0);
"""
js = [l.replace("tl.", "tlg.") for l in js]   # everything (talking-head moves included) steps at 12 fps
page = f"""<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<style>
{CSS}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920" data-fps="24">
{chr(10).join(html)}
{chr(10).join(aud)}
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{paused:true}});
const tlg = gsap.timeline({{paused:true}});
{chr(10).join(js)}
{STEPJS}
window.__timelines["main"] = tl;
</script>
</body></html>"""
(R / "index.html").write_text(page, encoding="utf-8")
print("ok", TOTAL, len(html), "nodes", len(js), "tweens", len(aud), "audio")

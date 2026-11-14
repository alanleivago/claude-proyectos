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

CHEV = ('<svg viewBox="0 0 130 120" width="{w}" height="{h}"><defs><linearGradient id="{g}" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#2F9F86"/><stop offset="1" stop-color="#D6F2EA"/></linearGradient></defs>'
        '<path d="M8 8 L78 2 L66 70 L50 46 L124 108 L108 118 L36 54 L22 74 Z" fill="url(#{g})" stroke="#2A7F6C" stroke-width="2.5" stroke-linejoin="round"/></svg>')
def chevron(x, y, w, rot, flip=False, t0=0, t1=0):
    i = nid("cv"); g = nid("g")
    sc = "-1" if flip else "1"
    html_s = (f'<div id="{i}" class="orn" style="left:{x}px;top:{y}px;width:{w}px;height:{w*120/130:.0f}px">'
              f'<div style="transform:scaleX({sc})">{CHEV.format(w=w, h=round(w*120/130), g=g)}</div></div>')
    js.append(f'tl.fromTo("#{i}",{{rotation:{rot}}},{{rotation:{rot + (8 if not flip else -8)},duration:0.125,ease:"sine.inOut",yoyo:true,repeat:{max(1, int((t1 - t0) / 0.125) - 1)}}},{t0:.3f});')
    return html_s

def pill(cx, top, lines, t, w=330, h=110, wings=True, t1=None, size=34):
    i = nid("pl")
    txt = "<br>".join(lines)
    out = ""
    if wings:
        out += chevron(cx - w / 2 - 92, top - 58, 110, -14, False, t, t1 or t + 2)
        out += chevron(cx + w / 2 - 18, top - 58, 110, 14, True, t, t1 or t + 2)
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

def sticker(i, color_a, color_b, date, title_lines, clock, pin, circ):
    flag = '<div class="flag"></div>'
    t = "".join(f'<div>{l}</div>' for l in title_lines)
    return (f'<div id="{i}" class="sticky" style="background:linear-gradient(135deg,{color_a},{color_b})">{flag}'
            f'<div class="sdate">{date}</div>'
            f'<svg class="circ" viewBox="0 0 300 130" width="380" height="150" preserveAspectRatio="none"><path id="{i}c" d="M40 40 Q150 -10 270 40 Q300 90 200 112 Q90 128 30 95 Q5 60 60 28 L110 14" fill="none" stroke="{circ}" stroke-width="9" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>'
            f'<div class="stitle">{t}</div><div class="sinfo">&#9719; {clock}<br>&#9906; {pin}</div><div class="curl"></div></div>')

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

def face(scene, cx, cy, head_h, t0, t1, gray=False, bob=9, rot=(0, 0), z=20, period=0.25):
    """face clip positioned by head centre (measured per scene from the matte); bob wrapper animated."""
    FACE_CX, FACE_CY, FH = head_box(t0, t1)
    s = head_h / FH
    w, h = 480 * s, 560 * s
    wid = nid("fw"); vid = nid("fv")
    src = "assets/face_gray.webm" if gray else "assets/face.webm"
    html.append(f'<div class="cam {scene}-cam" style="z-index:{z}"><div id="{wid}" class="fwrap" style="left:{cx - FACE_CX*s:.0f}px;top:{cy - FACE_CY*s:.0f}px;width:{w:.0f}px;height:{h:.0f}px;transform-origin:50% 70%">'
                f'<video id="{vid}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-media-start="{t0:.3f}" data-track-index="3" src="{src}" muted playsinline data-layout-allow-occlusion style="width:100%;height:100%"></video></div></div>')
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
# S1  0.00-1.92  "The jerseys finally show up."  face in a red van on teal halftone floor
# =====================================================================
t0, t1 = 0.0, 1.92
s = "s1"
VX, VY = 20, 820
inner = ('<div class="floor-teal" style="top:1250px"></div>'
         f'<div id="s1refl" class="refl" style="left:{VX}px;top:{VY + 2*330*1040/900 - 420*1040/900 + 165:.0f}px"><div style="position:relative">{van_side("back")}<div style="position:absolute;left:0;top:0">{van_side("front")}</div></div></div>'
         + words_line([("the", 0.32), ("jerseys", 0.46), ("finally", 0.85)], 440, 64, "thin")
         + words_line([("SHOW", 1.12), ("UP", 1.58)], 520, fit("SHOW UP", 760, 150), "wide")
         + chevron(40, 400, 140, -18, False, 0, t1) + chevron(900, 400, 140, 18, True, 0, t1)
         + f'<div id="s1vb" class="abs" style="left:{VX}px;top:{VY}px;transform-origin:0 0">{van_side("back")}</div>')
scene(s, t0, t1, inner)
# face in the cab window, thumbs-up hand, then the door (front layer)
K = 1040 / 900
face(s, VX + 690*K, VY + 128*K, 205*K, t0, t1, bob=8, z=20)
layer(s, t0, t1, f'<div id="s1vf" class="abs" style="left:{VX}px;top:{VY}px">{van_side("front")}</div>'
      f'<svg class="abs" style="left:{VX+720*K:.0f}px;top:{VY-70*K:.0f}px" width="160" height="180" viewBox="0 0 160 180"><path id="s1arm" d="M20 175 Q40 90 95 60" stroke="#F4C542" stroke-width="22" fill="none" stroke-linecap="round"/></svg>'
      + emoji("1f44d", VX + 770*K, VY - 150*K, 160, -10, "s1th"), 30)
js.append(f'tl.fromTo("#s1vb,#s1vf,#s1refl,.{s}-cam .fwrap",{{x:-1050}},{{x:0,duration:0.42,ease:"power3.out"}},0);')
js.append('tl.fromTo("#s1th",{rotation:-16,y:0},{rotation:4,y:-8,duration:0.125,ease:"sine.inOut",yoyo:true,repeat:13},0.4);')
js.append(f'tl.to("#s1vb,#s1vf,#s1refl,.{s}-cam .fwrap,#s1th,#s1arm",{{x:1300,duration:0.2,ease:"power3.in"}},1.72);')
cam_push(s, t0, t1, 1.0, 1.04)
sfx("car", -0.0, 0.45)      # peak 0.9 s in clip -> but van arrives 0.4: use the tail as the arrival
whoosh(1.78, 0.35)

# =====================================================================
# S2  1.92-3.50  "And there's a wrong name on the back."  jersey back, red hand-drawn circle
# =====================================================================
t0, t1 = 1.92, 3.50
s = "s2"
inner = (pill(540, 250, ["the fine", "print"], 1.97, w=300, h=104, t1=t1)
         + words_line([("and", 1.97), ("there's", 2.07), ("a", 2.23)], 420, 58, "thin")
         + words_line([("WRONG", 2.37), ("NAME", 2.49)], 500, fit("WRONG NAME", 800, 140), "wide")
         + f'<div class="abs" style="left:150px;top:690px">{jersey_svg(780, True, "SMTIH", "12", "jb")}</div>'
         + '<svg class="abs" style="left:230px;top:740px" width="640" height="300" viewBox="0 0 640 300"><path id="s2c" d="M70 90 Q320 0 590 80 Q640 170 450 220 Q230 262 70 200 Q10 140 110 70 L190 40" fill="none" stroke="#E8312B" stroke-width="12" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>'
         + '<div class="floor-gray" style="top:1450px;opacity:.55"></div>')
scene(s, t0, t1, inner)
cam_settle(s, t0, t1, 1.28, 10, 1.05)
js.append('tl.fromTo("#s2c",{strokeDashoffset:1},{strokeDashoffset:0,duration:0.42,ease:"power2.inOut"},2.62);')
sfx("marker", 2.62, 0.5); sfx("marker", 2.82, 0.4)

# =====================================================================
# S3  3.50-5.05  "Or it just doesn't fit."  walker in an oversized jersey
# =====================================================================
t0, t1 = 3.50, 5.05
s = "s3"
legs = ('<svg class="abs" style="left:170px;top:1060px" width="460" height="420" viewBox="0 0 460 420"><defs><linearGradient id="lg3" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9A9A9A"/><stop offset="1" stop-color="#D8D8D8"/></linearGradient></defs>'
        '<g id="s3l1" style="transform-origin:200px 0px"><path d="M200 0 Q170 180 130 330" stroke="url(#lg3)" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M80 320 Q130 300 175 330 L182 356 Q120 368 70 356 Z" fill="#F3F3F3" stroke="#555" stroke-width="5"/></g>'
        '<g id="s3l2" style="transform-origin:250px 0px"><path d="M250 0 Q290 190 330 330" stroke="url(#lg3)" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M300 320 Q350 300 400 330 L406 356 Q340 368 292 356 Z" fill="#F3F3F3" stroke="#555" stroke-width="5"/></g></svg>')
inner = ('<div id="s3sh" class="ellipse" style="left:110px;top:1370px;width:560px;height:120px"></div>'
         + legs
         + f'<div id="s3j" class="abs" style="left:85px;top:610px">{jersey_svg(620, False, "", "12", "jf3")}</div>'
         + words_line([("or", 3.57), ("it", 4.00), ("just", 4.21)], 760, 58, "thin", "right", 0, 930)
         + words_line([("doesn't", 4.37)], 840, 58, "thin", "right", 0, 930)
         + words_line([("FIT.", 4.67)], 930, 170, "wide", "right", 0, 930))
scene(s, t0, t1, inner)
face(s, 395, 560, 300, t0, t1, bob=10, rot=(-4, 5), z=20)
js.append('tl.fromTo("#s3j",{y:0,rotation:-2},{y:-10,rotation:2,duration:0.125,ease:"sine.inOut",yoyo:true,repeat:11},3.5);')
js.append('tl.fromTo("#s3l1",{rotation:14},{rotation:-14,duration:0.25,ease:"sine.inOut",yoyo:true,repeat:5},3.5);')
js.append('tl.fromTo("#s3l2",{rotation:-14},{rotation:14,duration:0.25,ease:"sine.inOut",yoyo:true,repeat:5},3.5);')
js.append(f'tl.fromTo(".{s}-cam",{{scale:0.62,x:-180,y:260}},{{scale:1,x:0,y:0,duration:0.3,ease:"power3.out"}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1}},{{scale:1.04,duration:1.25,ease:"none",immediateRender:false}},{t0+0.3});')
js.append('tl.fromTo("#s3sh",{scaleX:0.3},{scaleX:1,duration:0.4,ease:"power2.out"},3.5);')
pop(4.67, 0.3); whoosh(3.52, 0.25)

# =====================================================================
# S4  5.05-7.45  "A lot of coaches get stuck in this back and forth."  tilted calendar + sticky notes
# =====================================================================
t0, t1 = 5.05, 7.45
s = "s4"
grid = "".join(f'<div class="gl" style="left:{x}px;top:-1200px;width:2px;height:4200px"></div>' for x in range(-1200, 3000, 560)) + \
       "".join(f'<div class="gl" style="left:-1200px;top:{y}px;width:4200px;height:2px"></div>' for y in range(-1200, 3000, 560))
STK = [("s4a", "#F3413D", "#F07C88", "03 MON", ["RETURN", "LABEL"], "day 3", "Coach's garage", TEAL_D, 5.12, 5.40),
       ("s4b", "#E3C675", "#D7B159", "12 WED", ["STILL", "WAITING"], "day 12", "Shipping desk", RED, 5.74, 6.00),
       ("s4c", "#8FD0BF", "#4AAB90", "21 FRI", ["BACK AND", "FORTH"], "day 21", "Everyone's inbox", "#E8312B", 6.44, 6.70)]
pos = [(400, 650), (960, 650 + 560), (1520, 650 + 1120)]
st_html = ""
for (i, a, b, d, tl_, c, p, cc, ta, tc), (x, y) in zip(STK, pos):
    st_html += f'<div class="abs" style="left:{x}px;top:{y}px">{sticker(i, a, b, d, tl_, c, p, cc)}</div>'
inner = f'<div id="s4grid" class="abs" style="left:0;top:0;width:1080px;height:1920px;transform:rotate(-14deg);transform-origin:540px 960px">{grid}{st_html}</div>'
inner = f'<div id="s4pan" class="abs" style="left:0;top:0;width:1080px;height:1920px">{inner}</div>'
scene(s, t0, t1, inner)
for k, ((i, a, b, d, tl_, c, p, cc, ta, tc), (x, y)) in enumerate(zip(STK, pos)):
    js.append(f'tl.fromTo("#{i}",{{scale:0.55,rotation:-10,opacity:0,transformOrigin:"100% 100%"}},{{scale:1,rotation:0,opacity:1,duration:0.3,ease:"back.out(1.6)"}},{ta:.3f});')
    js.append(f'tl.fromTo("#{i}c",{{strokeDashoffset:1}},{{strokeDashoffset:0,duration:0.3,ease:"power2.inOut"}},{tc:.3f});')
    sfx("sticker" if k != 1 else "sticker2", ta, 0.45); sfx("marker", tc, 0.38)
    if k:
        pi, (px0, py0) = STK[k - 1][0], pos[k - 1]
        js.append(f'tl.to("#{pi}",{{opacity:0.25,duration:0.25}},{ta:.3f});')
# camera pans along the grid (rotated coords): move so the newest sticker sits at frame centre
def rot(x, y, a=-14):
    r = math.radians(a); cx, cy = 540, 960
    return cx + (x - cx) * math.cos(r) - (y - cy) * math.sin(r), cy + (x - cx) * math.sin(r) + (y - cy) * math.cos(r)
centres = [rot(x + 290, y + 300) for x, y in pos]
dx = [540 - cx for cx, cy in centres]; dy = [930 - cy for cx, cy in centres]
js.append(f'tl.fromTo("#s4pan",{{x:{dx[0]:.0f},y:{dy[0]:.0f}}},{{x:{dx[0]:.0f},y:{dy[0]:.0f},duration:0.01}},{t0});')
js.append(f'tl.to("#s4pan",{{x:{dx[1]:.0f},y:{dy[1]:.0f},duration:0.38,ease:"power2.inOut"}},5.62);')
js.append(f'tl.to("#s4pan",{{x:{dx[2]:.0f},y:{dy[2]:.0f},duration:0.38,ease:"power2.inOut"}},6.32);')
whoosh(5.62, 0.22); whoosh(6.32, 0.22)
cam_push(s, t0, t1, 1.0, 1.05)

# =====================================================================
# S5  7.45-9.75  "Whose fault was it? Who pays for shipping?"  red scene, outline stack, pixel boxes
# =====================================================================
t0, t1 = 7.45, 9.75
s = "s5"
def stack(lines, top, sid):
    out = f'<div id="{sid}" class="stack" style="top:{top}px">'
    for txt, t in lines:
        i = nid("sl")
        out += f'<div id="{i}" class="sln"><span>{txt}</span></div>'
        js.append(f'tl.fromTo("#{i}",{{color:"#F5B5BB",borderColor:"rgba(255,255,255,0)"}},{{color:"#FFFFFF",borderColor:"rgba(255,255,255,0.95)",duration:0.17}},{t:.3f});')
    return out + "</div>"
lane = ('<div class="abs" style="left:80px;top:360px;width:3px;height:1260px;background:rgba(255,255,255,.85)"></div>'
        '<div class="abs" style="left:430px;top:360px;width:3px;height:1260px;background:rgba(255,255,255,.85)"></div>'
        '<div class="abs checker" style="left:83px;top:1540px;width:347px;height:70px"></div>')
boxes = "".join(f'<div id="s5b{k}" class="abs" style="left:{x}px;top:{y}px">{box_px(9)}</div>' for k, (x, y) in enumerate([(120, 520), (290, 860), (130, 1180)]))
inner = ('<div class="dots-red"></div><div class="corner tr"></div><div class="corner bl"></div>' + lane + boxes
         + stack([("WHOSE", 7.53), ("FAULT", 7.77), ("WAS IT?", 8.01)], 620, "s5k1")
         + stack([("WHO", 8.71), ("PAYS FOR", 8.87), ("SHIPPING?", 9.47)], 620, "s5k2"))
scene(s, t0, t1, inner, bg=RED)
js.append('tl.fromTo("#s5k2",{opacity:0},{opacity:1,duration:0.01},8.69); tl.fromTo("#s5k1",{opacity:1},{opacity:0,duration:0.01},8.69);')
for k, (a, b) in enumerate([(0, 300), (0, -300), (0, 260)]):
    js.append(f'tl.fromTo("#s5b{k}",{{y:{a}}},{{y:{b},duration:0.55,ease:"power2.inOut",yoyo:true,repeat:3}},{t0 + k*0.12:.3f});')
js.append(f'tl.fromTo(".{s}-cam",{{x:-140,filter:"blur(10px)"}},{{x:0,filter:"blur(0px)",duration:0.2,ease:"power3.out"}},{t0});')
whoosh(t0, 0.35); pop(7.53, 0.22); pop(8.71, 0.22); whoosh(9.47, 0.2)

# =====================================================================
# S6  9.75-12.10  "Here's what a good uniform company does instead."  face on a big jersey torso
# =====================================================================
t0, t1 = 9.75, 12.10
s = "s6"
inner = ('<div class="floor-gray" style="top:1180px"></div>'
         + words_line([("here's", 9.82), ("what", 10.04), ("a", 10.16), ("good", 10.26)], 190, 60, "thin")
         + words_line([("UNIFORM", 10.42)], 270, fit("UNIFORM", 820, 150), "wide")
         + words_line([("COMPANY", 10.92)], 410, fit("COMPANY", 820, 150), "wide")
         + words_line([("does", 11.29), ("instead.", 11.69)], 555, 60, "thin")
         + f'<div class="abs" style="left:90px;top:1095px">{jersey_svg(900, False, "", "1", "jf6")}</div>')
scene(s, t0, t1, inner)
face(s, 540, 1000, 330, t0, t1, bob=5, z=20, period=0.5)
cam_settle(s, t0, 11.75, 1.35, 14, 1.03, 0.3)
whoosh(t0, 0.28)
js.append(f'tl.to(".{s}-cam",{{scale:0.9,y:-60,duration:0.35,ease:"power2.in"}},11.75);')
pop(10.42, 0.25); pop(10.92, 0.25); whoosh(11.95, 0.25)

# =====================================================================
# S7  12.10-15.08  "They remake it. They don't ask whose fault it was."  pill + teal tab + pixel road
# =====================================================================
t0, t1 = 12.10, 15.08
s = "s7"
road = ('<div class="road" style="top:1150px"><div id="s7dash" class="dash"></div></div>')
inner = (pill(540, 330, ["the fix"], 12.12, w=260, h=86, t1=t1, size=38)
         + tab(110, 470, 860, 300, 12.18)
         + words_line([("THEY", 12.18)], 505, 120, "wide")
         + words_line([("REMAKE", 12.30), ("IT.", 12.60)], 630, fit("REMAKE IT.", 820, 130), "wide")
         + words_line([("they", 13.36), ("don't", 13.54), ("ask", 13.76), ("whose", 14.00), ("fault", 14.27), ("it", 14.46), ("was.", 14.64)], 800, 50, "thin")
         + road
         + f'<div id="s7old" class="abs" style="left:380px;top:990px">{jersey_px("#C21E2B", "#FFFFFF", 12)}<div class="xmark">&#10005;</div></div>'
         + f'<div id="s7new" class="abs" style="left:380px;top:990px">{jersey_px("#1F8A4C", "#FFFFFF", 12, True)}</div>'
         + f'<div id="s7ok" class="abs" style="left:640px;top:950px">{check_px(10)}</div>')
scene(s, t0, t1, inner)
js.append('tl.fromTo("#s7dash",{x:0},{x:-1080,duration:2.98,ease:"none"},12.10);')
js.append('tl.fromTo("#s7old",{x:0},{x:-900,duration:0.3,ease:"power3.in"},12.55);')
js.append('tl.fromTo("#s7new",{x:900},{x:0,duration:0.35,ease:"power3.out"},12.62);')
js.append('tl.fromTo("#s7ok",{scale:0,rotation:-30},{scale:1,rotation:0,duration:0.3,ease:"back.out(2.5)"},12.95);')
js.append('tl.fromTo("#s7new",{y:0},{y:-8,duration:0.125,ease:"sine.inOut",yoyo:true,repeat:15},13.0);')
cam_push(s, t0, t1, 1.0, 1.05)
whoosh(12.55, 0.3); sfx("coin", 12.95, 0.35); pop(13.36, 0.18)

# =====================================================================
# S8  15.08-16.82  "They cover shipping both ways."  top-down van on a gold lane, speed hairlines
# =====================================================================
t0, t1 = 15.08, 16.82
s = "s8"
hair = "".join(f'<div class="hair" id="s8h{k}" style="left:{x}px;top:{y}px;height:{h}px"></div>'
               for k, (x, y, h) in enumerate([(130, 300, 420), (260, 820, 520), (940, 200, 560), (1010, 900, 380), (180, 1300, 300), (900, 1350, 420)]))
inner = ('<div class="lane"></div>' + hair
         + words_line([("they", 15.15), ("cover", 15.31), ("shipping", 15.55)], 330, 58, "thin")
         + words_line([("BOTH", 16.00), ("WAYS", 16.25)], 410, fit("BOTH WAYS", 800, 150), "wide")
         + chevron(380, 1000, 130, 0, False, t0, t1) + chevron(570, 1000, 130, 0, True, t0, t1)
         + f'<div id="s8van" class="abs" style="left:350px;top:640px">{van_top(380)}</div>')
scene(s, t0, t1, inner)
js.append('tl.fromTo("#s8van",{y:-1300,filter:"blur(10px)"},{y:0,filter:"blur(0px)",duration:0.28,ease:"power3.out"},15.08);')
js.append('tl.to("#s8van",{rotation:180,duration:0.35,ease:"power2.inOut"},15.98);')
js.append('tl.to("#s8van",{y:1400,duration:0.3,ease:"power3.in"},16.5);')
for k in range(6):
    js.append(f'tl.fromTo("#s8h{k}",{{y:-600}},{{y:900,duration:0.6,ease:"none",repeat:2}},{t0 + k*0.07:.3f});')
cam_push(s, t0, t1, 1.0, 1.05)
sfx("car", 14.70, 0.4); whoosh(15.98, 0.3); whoosh(16.5, 0.3)

# =====================================================================
# S9  16.82-18.52  "No arguing over who pays."  manga speed burst, strike, pixel coin
# =====================================================================
t0, t1 = 16.82, 18.52
s = "s9"
sl = "".join(f'<div id="s9sl{k}" class="abs" style="left:0;top:0;opacity:{1 if k == 0 else 0}">{speedlines(k + 3)}</div>' for k in range(3))
inner = (sl + '<div class="burst-core"></div>'
         + words_line([("no", 16.89), ("arguing", 17.07), ("over", 17.49)], 640, 60, "thin")
         + words_line([("WHO", 17.75), ("PAYS", 17.99)], 720, fit("WHO PAYS", 800, 160), "wide")
         + '<svg class="abs" style="left:150px;top:700px" width="780" height="200" viewBox="0 0 780 200"><path id="s9x" d="M20 120 Q200 60 390 100 T760 70" fill="none" stroke="#E8312B" stroke-width="16" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>'
         + f'<div id="s9coin" class="abs" style="left:420px;top:910px">{coin_px(24)}</div>'
         + pill(540, 1190, ["$0 for", "your club"], 18.10, w=300, h=104, t1=t1))
scene(s, t0, t1, inner)
for k in range(int((t1 - t0) / 0.1)):
    a, b = k % 3, (k + 1) % 3
    js.append(f'tl.set("#s9sl{a}",{{opacity:0}},{t0 + (k+1)*0.1:.3f}); tl.set("#s9sl{b}",{{opacity:1}},{t0 + (k+1)*0.1:.3f});')
js.append('tl.fromTo("#s9x",{strokeDashoffset:1},{strokeDashoffset:0,duration:0.25,ease:"power2.out"},18.12);')
js.append('tl.fromTo("#s9coin",{scaleX:1},{scaleX:0.08,duration:0.18,ease:"sine.inOut",yoyo:true,repeat:8},16.85);')
cam_settle(s, t0, t1, 1.3, 12, 1.05, 0.25)
whoosh(t0, 0.3); sfx("marker", 18.12, 0.45); sfx("coin", 18.0, 0.3)

# =====================================================================
# S10 18.52-20.90  "And they ship the new ones straight to the player's house."  pixel van -> house
# =====================================================================
t0, t1 = 18.52, 20.90
s = "s10"
inner = (pill(540, 300, ["free", "remake"], 18.60, w=280, h=104, t1=t1)
         + tab(90, 450, 900, 320, 18.72)
         + words_line([("STRAIGHT", 19.58), ("TO", 19.83)], 485, fit("STRAIGHT TO", 820, 120), "wide")
         + words_line([("PLAYER'S", 20.10), ("HOUSE", 20.44)], 610, fit("PLAYER'S HOUSE", 820, 120), "wide")
         + words_line([("and", 18.60), ("they", 18.72), ("ship", 18.88), ("the", 19.04), ("new", 19.18), ("ones", 19.30)], 775, 50, "thin")
         + '<div class="road" style="top:1180px"><div id="s10dash" class="dash"></div></div>'
         + f'<div id="s10house" class="abs" style="left:770px;top:990px">{house_px(13)}</div>'
         + f'<div id="s10van" class="abs" style="left:60px;top:1030px">{van_px(13)}</div>'
         + f'<div id="s10box" class="abs" style="left:820px;top:1110px">{box_px(6)}</div>')
scene(s, t0, t1, inner)
fw = face(s, 60 + 13 * 21, 1030 + 13 * 2, 105, t0, t1, bob=0, z=20)
js.append(f'tl.fromTo("#s10van,#{fw}",{{x:-700}},{{x:0,duration:0.5,ease:"power3.out"}},18.55);')
js.append(f'tl.to("#s10van,#{fw}",{{x:330,duration:0.9,ease:"power2.inOut"}},19.40);')
js.append(f'tl.fromTo("#s10van,#{fw}",{{y:0}},{{y:-5,duration:0.1,ease:"sine.inOut",yoyo:true,repeat:21}},18.55);')
js.append('tl.fromTo("#s10dash",{x:0},{x:-1400,duration:1.8,ease:"power1.out"},18.55);')
js.append('tl.fromTo("#s10box",{scale:0,y:-60},{scale:1,y:0,duration:0.3,ease:"back.out(2.4)"},20.44);')
cam_push(s, t0, t1, 1.0, 1.05)
sfx("car", 18.10, 0.35); pop(20.44, 0.3)

# =====================================================================
# S11 20.90-23.84  talking head (real footage) + thin white captions, rack-focus in
# =====================================================================
t0, t1 = 20.90, 23.84
s = "s11"
html.append(f'<div class="cam {s}-cam" style="z-index:10"><video id="th" class="clip" data-start="{t0}" data-duration="{t1 - t0:.3f}" data-media-start="{t0}" data-track-index="1" src="assets/edit.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
html.append(f'<div class="cam {s}-cam" style="z-index:11"><video id="thb" class="clip" data-start="{t0}" data-duration="0.3" data-media-start="0" data-track-index="2" src="assets/th_blur.mp4" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
js.append(f'tl.fromTo("#thb",{{opacity:1}},{{opacity:0,duration:0.22,ease:"power2.out"}},{t0 + 0.05});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.12}},{{scale:1.0,duration:0.3,ease:"power3.out"}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.0}},{{scale:1.06,duration:{t1 - t0 - 0.3:.2f},ease:"none",immediateRender:false}},{t0 + 0.3});')
CAPS = [("look,", 20.97, 21.40), ("mistakes happen,", 21.40, 22.36), ("but the fix", 22.36, 22.85),
        ("shouldn't be", 22.85, 23.30), ("a fight.", 23.30, 23.84)]
for txt, a, b in CAPS:
    i = nid("cap")
    html.append(f'<div id="{i}" class="clip thcap" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="4" style="z-index:40">{txt}</div>')

# =====================================================================
# S12 23.84-26.32  "So ask how a company handles it before you order."  dark UI card + cursor
# =====================================================================
t0, t1 = 23.84, 26.32
s = "s12"
ROWS = [("BIG BRAND", "#9A9A9A", False), ("CHEAP CO.", "#C21E2B", False), ("STIMULUS", "#1F8A4C", True)]
rows = ""
for k, (nm, col, chk) in enumerate(ROWS):
    rows += (f'<div id="s12r{k}" class="urow" style="top:{230 + k*185}px"><div class="ucard">{jersey_px(col, "#FFF", 7, chk)}'
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
    js.append(f'tl.fromTo("#s12r{k}",{{x:-120,opacity:0}},{{x:0,opacity:1,duration:0.17,ease:"power3.out"}},{23.95 + k*0.09:.3f});')
for k, t in enumerate([24.27, 24.73, 24.85]):
    js.append(f'tl.fromTo("#s12q{k}",{{x:-80,opacity:0}},{{x:0,opacity:1,duration:0.17,ease:"power3.out"}},{t:.3f});'); pop(t, 0.16)
js.append('tl.fromTo("#s12cur",{x:120,y:200},{x:0,y:0,duration:0.5,ease:"power2.inOut"},24.95);')
js.append('tl.to("#s12cur",{x:150,y:-640,duration:0.45,ease:"power2.inOut"},25.40);')
js.append('tl.to("#s12cur",{scale:0.85,duration:0.06,yoyo:true,repeat:1},25.83);')
js.append('tl.to("#s12b2",{backgroundColor:"#3E9D86",color:"#FFFFFF",scale:1.08,duration:0.12},25.86);')
js.append('tl.to("#s12b2",{scale:1,duration:0.15},25.98);')
pop(23.86, 0.25); sfx("click", 25.85, 0.55)
cam_push(s, t0, t1, 1.0, 1.04)

# =====================================================================
# S13 26.32-27.32  "At Stimulus,"  pixel torso -> real, script + wide name + capsule
# =====================================================================
t0, t1 = 26.32, 27.32
s = "s13"
TW = 600; TH = round(648 * TW / 714)
tors = "".join(f'<img id="s13p{k}" src="assets/torso_{n}.png" class="abs" style="left:240px;top:330px;width:{TW}px;height:{TH}px;opacity:{1 if k == 0 else 0}">'
               for k, n in enumerate(["px36", "px22", "px12", "px6", "real"]))
inner = (tors
         + words_line([("STIMULUS", 26.52)], 860, fit("STIMULUS", 820, 190), "wide")
         + '<div id="s13sig" class="sig" style="left:250px;top:790px;color:#FFFFFF;-webkit-text-stroke:3px #111;z-index:2">at</div>'
         + f'<div id="s13cap" class="capsule" style="top:1080px"><div class="abs" style="left:308px;top:24px">{jersey_px("#1F8A4C", "#FFF", 9, True)}</div><div class="capt">ATHLETIC</div></div>')
scene(s, t0, t1, inner)
for k in range(1, 5):
    tk = 26.30 + k * 0.20
    js.append(f'tl.set("#s13p{k}",{{opacity:1}},{tk:.3f}); tl.set("#s13p{k-1}",{{opacity:0}},{tk:.3f});')
js.append('tl.fromTo("#s13sig",{scale:0,rotation:-20},{scale:1,rotation:-9,duration:0.12,ease:"back.out(2)"},26.40);')
js.append('tl.fromTo("#s13cap",{clipPath:"inset(0 50% 0 50% round 60px)"},{clipPath:"inset(0 0% 0 0% round 60px)",duration:0.45,ease:"power3.out"},26.62);')
cam_push(s, t0, t1, 1.0, 1.03)
pop(26.40, 0.3); whoosh(26.62, 0.22)

# =====================================================================
# S14 27.32-30.45 list of 11 strips  |  30.45-32.94 close-up "WE REMAKE IT."
# =====================================================================
t0, t1 = 27.32, 30.45
s = "s14"
COLS = ["#1F9E8A", "#D7263D", "#F28C28", "#1D2B7A", "#4A7FE0", "#E86FB0", "#9A9A9A", "#C21E2B", "#2140D8", "#1B7F4E", "#2B2B2B"]
LBL = {0: ("DOESN'T FIT", 27.64), 1: ("WRONG NAME", 28.88), 2: ("WRONG NUMBER", 29.56)}
rows = ""
for k, c in enumerate(COLS):
    y = 150 + k * 140
    lab = ""
    if k in LBL:
        lab = f'<div id="s14l{k}" class="slab">{LBL[k][0]}</div>'
    rows += (f'<div id="s14r{k}" class="srow" style="top:{y}px"><div class="sgrad" style="background:linear-gradient(90deg,#FFFFFF 0%,{c} 92%)">'
             f'<div class="abs" style="left:120px;top:6px">{jersey_px(c, "#FFF", 9, k == 9)}</div></div>'
             f'<div class="sbar"></div>{lab}<div id="s14d{k}" class="sdone">REMADE &#10003;</div><div class="snum">{k + 1:02d}</div></div>')
scene(s, t0, t1, rows)
for k in range(11):
    js.append(f'tl.fromTo("#s14r{k}",{{y:-60,opacity:0}},{{y:0,opacity:1,duration:0.12,ease:"power2.out"}},{27.36 + k*0.09:.3f});')
    if k % 3 == 0:
        sfx("click", 27.36 + k * 0.09, 0.12)
for k, (lab, t) in LBL.items():
    js.append(f'tl.fromTo("#s14l{k}",{{scale:0.5,opacity:0}},{{scale:1,opacity:1,duration:0.17,ease:"back.out(2)"}},{t:.3f});'); pop(t, 0.26)
js.append('tl.to(".s14-cam",{scale:2.2,x:770,y:1417,duration:0.35,ease:"power3.in"},30.12);')
whoosh(30.25, 0.3)
cam_push(s, t0, 30.12, 1.0, 1.03)

t0, t1 = 30.45, 32.94
s = "s15"
inner = (f'<div class="abs" style="left:-30px;top:0;width:1140px;height:1920px;background:linear-gradient(90deg,#FFFFFF 10%,#7FD6B3 100%)"></div>'
         f'<div id="s15j" class="abs" style="left:40px;top:430px">{jersey_px("#1F9E8A", "#FFF", 22, False)}</div>'
         + f'<div class="abs sbar" style="left:0;top:1340px;width:1080px;height:220px"></div>'
         + words_line([("WE", 30.54)], 780, 130, "wide", "right", 0, 930)
         + words_line([("REMAKE", 30.64)], 920, 130, "wide", "right", 0, 930)
         + words_line([("IT.", 30.96)], 1060, 130, "wide", "right", 0, 930)
         + words_line([("no", 31.68), ("questions", 32.00), ("asked.", 32.32)], 1210, 60, "thin", "right", 0, 930)
         + f'<div id="s15ok" class="abs" style="left:420px;top:440px">{check_px(14)}</div>')
scene(s, t0, t1, inner)
js.append(f'tl.fromTo(".{s}-cam",{{scale:1.6,filter:"blur(12px)"}},{{scale:1,filter:"blur(0px)",duration:0.3,ease:"power3.out"}},{t0});')
js.append(f'tl.fromTo(".{s}-cam",{{scale:1}},{{scale:1.04,duration:2.19,ease:"none",immediateRender:false}},{t0 + 0.3});')
js.append('tl.fromTo("#s15ok",{scale:0,rotation:-40},{scale:1,rotation:0,duration:0.3,ease:"back.out(2.5)"},31.70);')
js.append('tl.fromTo("#s15j",{y:0},{y:-10,duration:0.125,ease:"sine.inOut",yoyo:true,repeat:18},30.5);')
pop(30.54, 0.25); pop(30.96, 0.25); sfx("coin", 31.70, 0.35)

# =====================================================================
# S16 32.94-34.80  "Want a uniform company like that?"  walker: grey face in gold octagon, pixel shades
# =====================================================================
t0, t1 = 32.94, 34.80
s = "s16"
legs = ('<svg class="abs" style="left:150px;top:1010px;overflow:visible" width="460" height="460" viewBox="0 0 460 460"><defs><linearGradient id="lg16" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8E8E8E"/><stop offset="1" stop-color="#DADADA"/></linearGradient></defs>'
        '<path d="M215 -40 L215 70" stroke="#222" stroke-width="7"/>'
        '<path d="M215 30 Q130 40 90 -10" stroke="#222" stroke-width="7" fill="none"/>'
        '<path d="M215 30 Q300 60 330 10" stroke="#222" stroke-width="7" fill="none"/>'
        '<g id="s16l1" style="transform-origin:215px 70px"><path d="M215 70 Q180 230 140 370" stroke="url(#lg16)" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M90 360 Q140 340 185 370 L192 396 Q130 408 80 396 Z" fill="#F3F3F3" stroke="#555" stroke-width="5"/></g>'
        '<g id="s16l2" style="transform-origin:215px 70px"><path d="M215 70 Q260 230 300 370" stroke="url(#lg16)" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M270 360 Q320 340 370 370 L376 396 Q310 408 262 396 Z" fill="#F3F3F3" stroke="#555" stroke-width="5"/></g></svg>')
inner = ('<div id="s16sh" class="ellipse" style="left:110px;top:1360px;width:560px;height:130px"></div>' + legs
         + '<svg id="s16oct" class="abs" style="left:150px;top:420px" width="460" height="560" viewBox="0 0 460 560"><path d="M120 10 L330 0 L450 170 L430 420 L250 550 L60 470 L10 210 Z" fill="#E3C97A" stroke="#2B2B2B" stroke-width="3"/></svg>'
         + f'<div id="s16jr" class="abs" style="left:60px;top:900px">{jersey_px("#1F8A4C", "#FFF", 9, True)}</div>'
         + emoji("1faf0", 420, 960, 100, 10, "s16hand")
         + words_line([("want", 33.02), ("a", 33.14), ("uniform", 33.48)], 1000, 52, "thin", "right", 0, 930)
         + words_line([("company", 33.72)], 1065, 52, "thin", "right", 0, 930)
         + words_line([("LIKE", 34.00)], 1140, 130, "wide", "right", 0, 930)
         + words_line([("THAT?", 34.20)], 1270, 100, "wide", "right", 0, 930))
scene(s, t0, t1, inner)
face(s, 380, 700, 380, t0, t1, gray=True, bob=0, z=20)
layer(s, t0, t1, f'<div id="s16sg" class="abs" style="left:240px;top:650px">{shades_px(12)}</div>', 30)
js.append('tl.fromTo("#s16sg",{y:-700},{y:0,duration:0.35,ease:"bounce.out"},33.48);')
js.append(f'tl.fromTo(".{s}-cam .fwrap,#s16oct,#s16sg",{{y:0,rotation:-3}},{{y:-10,rotation:4,duration:0.125,ease:"sine.inOut",yoyo:true,repeat:13}},{t0});')
js.append('tl.fromTo("#s16l1",{rotation:12},{rotation:-12,duration:0.25,ease:"sine.inOut",yoyo:true,repeat:6},32.94);')
js.append('tl.fromTo("#s16l2",{rotation:-12},{rotation:12,duration:0.25,ease:"sine.inOut",yoyo:true,repeat:6},32.94);')
js.append('tl.fromTo("#s16hand",{rotation:4,y:0},{rotation:16,y:-8,duration:0.125,ease:"sine.inOut",yoyo:true,repeat:13},32.94);')
js.append(f'tl.fromTo(".{s}-cam",{{scale:0.6,x:-200,y:300}},{{scale:1,x:0,y:0,duration:0.3,ease:"power3.out"}},{t0});')
js.append('tl.fromTo("#s16sh",{scaleX:0.3},{scaleX:1,duration:0.4,ease:"power2.out"},32.94);')
whoosh(t0, 0.25); sfx("wh2", 33.40, 0.25); pop(34.00, 0.28)

# =====================================================================
# S17 34.80-37.30  "Start your free design request. Link in bio."  pill + tab + button click
# =====================================================================
t0, t1 = 34.80, 37.30
s = "s17"
inner = (pill(540, 300, ["free", "design"], 35.17, w=280, h=104, t1=t1)
         + tab(90, 450, 900, 330, 34.88)
         + words_line([("START", 34.88), ("YOUR", 35.01)], 490, fit("START YOUR", 820, 120), "wide")
         + words_line([("REQUEST.", 35.84)], 620, fit("REQUEST.", 820, 130), "wide")
         + words_line([("free", 35.17), ("design", 35.49), ("for", 35.6), ("your", 35.7), ("team", 35.8)], 790, 50, "thin")
         + f'<div id="s17j" class="abs" style="left:290px;top:930px">{jersey_px("#1F8A4C", "#FFF", 14, True)}</div>'
         + f'<div id="s17c" class="abs" style="left:640px;top:975px">{coin_px(14)}</div>'
         + '<div id="s17btn" class="cta">LINK IN BIO &#8594;</div>'
         + '<svg id="s17cur" class="abs" style="left:640px;top:1220px" width="90" height="110" viewBox="0 0 30 37"><path d="M2 2 L2 30 L9 23 L14 35 L19 33 L14 21 L24 21 Z" fill="#FFF" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>')
scene(s, t0, t1, inner)
js.append('tl.fromTo("#s17btn",{scale:0.3,opacity:0},{scale:1,opacity:1,duration:0.21,ease:"back.out(2)"},35.9);')
js.append('tl.fromTo("#s17cur",{x:300,y:300},{x:0,y:0,duration:0.45,ease:"power2.inOut"},35.98);')
js.append('tl.to("#s17cur",{scale:0.85,duration:0.06,yoyo:true,repeat:1},36.46);')
js.append('tl.to("#s17btn",{backgroundColor:"#3E9D86",scale:1.06,duration:0.12},36.48); tl.to("#s17btn",{scale:1,duration:0.15},36.6);')
js.append('tl.fromTo("#s17j",{y:0},{y:-10,duration:0.125,ease:"sine.inOut",yoyo:true,repeat:19},34.9);')
js.append('tl.fromTo("#s17c",{scaleX:1},{scaleX:0.08,duration:0.18,ease:"sine.inOut",yoyo:true,repeat:12},34.9);')
cam_settle(s, t0, t1, 1.3, 12, 1.04, 0.28)
sfx("riser", 34.80 - 1.10, 0.10); whoosh(34.80, 0.25); pop(35.9, 0.25); sfx("click", 36.48, 0.55)

# outro (stimulus logo card) slides in over everything
html.append(f'<div id="outro-w"><video id="v-outro" class="clip" data-start="{END}" data-duration="{OUTRO}" data-track-index="7" src="assets/outro.mp4" muted playsinline></video></div>')
js.append(f'tl.fromTo("#outro-w",{{x:1080}},{{x:0,duration:0.3,ease:"power2.out"}},{END});')
whoosh(END, 0.25)

# audio beds
aud.insert(0, f'<audio id="voice" class="clip" data-start="0" data-duration="37.70" data-track-index="8" src="assets/voice.wav" data-volume="1"></audio>')
aud.insert(1, f'<audio id="music" class="clip" data-start="0" data-duration="{END + 0.4:.2f}" data-media-start="0" data-track-index="10" src="assets/music.wav" data-volume="0.13" data-fade-out="0.6"></audio>')
aud.insert(2, f'<audio id="music-out" class="clip" data-start="{END}" data-duration="{OUTRO}" data-media-start="{END}" data-track-index="11" src="assets/music.wav" data-volume="0.30" data-fade-in="0.6" data-fade-out="0.5"></audio>')

CSS = (R / "prep/style.css").read_text(encoding="utf-8")
page = f"""<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<style>
{CSS}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
{chr(10).join(html)}
{chr(10).join(aud)}
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{paused:true}});
{chr(10).join(js)}
window.__timelines["main"] = tl;
</script>
</body></html>"""
(R / "index.html").write_text(page, encoding="utf-8")
print("ok", TOTAL, len(html), "nodes", len(js), "tweens", len(aud), "audio")

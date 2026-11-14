"""docucollage-test: generates index.html (HyperFrames, 1080x1920, 30 fps) - docucollage style on stimulus-01.
python prep/gen.py   (edit times = voice times; constants mirror styles/docucollage/kit.js)
Graphics step at 10 fps (measured in the reels: change every 3,2,3,2 frames at 25 fps); talking-head footage smooth."""
import json, math, random, re
from pathlib import Path
from PIL import ImageFont

R = Path(__file__).resolve().parent.parent
FD = R / "assets/fonts"
CAPF = ImageFont.truetype(str(FD / "Poppins-Bold.ttf"), 54)
MF = {"Lora": FD / "Lora-Bold.ttf", "Bebas": FD / "BebasNeue-Regular.ttf", "Courier": FD / "CourierPrime-Bold.ttf", "Mont": FD / "Montserrat-ExtraBold.ttf"}
def text_w(fam, text, size, tracking_em=0.0):
    f = ImageFont.truetype(str(MF[fam]), 100)
    return (f.getlength(text) + tracking_em * 100 * len(text)) * size / 100
def fit(fam, text, size, maxw=800, tracking_em=0.0):
    while text_w(fam, text, size, tracking_em) > maxw and size > 20: size -= 2
    return size
STEP = 10
END = 50.30           # outro starts
OUTRO = 2.336
TOTAL = round(END + OUTRO, 3)
CREAM, GOLD_T, GOLD_B, YEL, RED, MONO_Y = "#EFE7D8", "#F6DA92", "#C08B3A", "#F2DE2E", "#D8232A", "#F2E04A"
PILL, SPOKEN, CUR, UPC = "#FDF9ED", "#000000", "#3C3830", "#CFCAC0"

html, js, jss, aud = [], [], [], []   # js -> tlg (stepped 10 fps), jss -> tl (smooth)
_id = [0]
def nid(p="e"):
    _id[0] += 1
    return f"{p}{_id[0]}"
rnd = random.Random(7)

# ---------------- sfx ----------------
_rot = {}
def sfx(name, t, vol):
    i = nid("s")
    aud.append(f'<audio id="{i}" class="clip" data-start="{max(0, t):.3f}" data-track-index="{20 + len(aud)}" src="assets/sfx/{name}.wav" data-volume="{vol}"></audio>')
def rot(kind, n, t, vol):
    k = _rot.get(kind, 0); _rot[kind] = k + 1
    sfx(f"{kind}{k % n + 1}", t, vol)
def pop(t, v=0.30): rot("pop", 3, t, v)
def whoosh(t, v=0.28): rot("wh", 3, t - 0.06, v)
def key(t, v=0.13): rot("key", 3, t, v)

# ---------------- scene containers ----------------
def scene(sid, t0, t1, inner, z=10, cam=True, extra="", under="", over=""):
    """under: fixed layer below the camera (bg); over: fixed layer above it (labels that must not ride the push)"""
    camo = f'<div id="{sid}cam" class="cam">{inner}</div>' if cam else inner
    camo = under + camo + (f'<div class="abs full" style="z-index:9">{over}</div>' if over else "")
    html.append(f'<div id="{sid}" class="clip scene" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="2" style="z-index:{z};{extra}">{camo}</div>')

def bg(c1, c2, halftone=True, dust=False, vign=True):
    s = f'<div class="abs full" style="background:linear-gradient(180deg,{c1},{c2})"></div>'
    if halftone: s += '<div class="ht"></div>'
    if dust:
        dots = "".join(f'<div class="dust" style="left:{rnd.randint(20,1060)}px;top:{rnd.randint(20,1900)}px;width:{rnd.choice([3,4,5])}px;height:{rnd.choice([3,4,5])}px;opacity:{rnd.uniform(.25,.6):.2f}"></div>' for _ in range(38))
        s += dots
    if vign: s += '<div class="vig"></div>'
    return s

def topdark(t, h=430):
    i = nid("td")
    js.append(f'tl.fromTo("#{i}",{{opacity:0}},{{opacity:1,duration:0.3,ease:"none"}},{t:.3f});')
    return f'<div id="{i}" class="abs" style="left:0;top:0;width:1080px;height:{h}px;background:linear-gradient(180deg,rgba(10,10,10,.78),rgba(10,10,10,.35) 55%,rgba(10,10,10,0))"></div>'

def th(t0, t1, src="assets/edit.mp4", wid=None, z=5, extra=""):
    """video layer at ROOT level (videos may not sit inside a timed wrapper). Returns '' so it can be concatenated into scene markup."""
    wid = wid or nid("thw")
    html.append(f'<div id="{wid}" class="abs full" style="z-index:{z};{extra}"><video id="{nid("v")}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" '
                f'data-media-start="{t0:.3f}" data-track-index="1" src="{src}" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover"></video></div>')
    return ""

def blurin(t0, t1, src_blur, z=3):
    """rack-focus in: a pre-blurred copy on top that fades out in 2 steps (mp4 -> root-level layer z 26)"""
    i = nid("bl")
    js.append(f'tl.fromTo("#{i}",{{opacity:1}},{{opacity:0,duration:0.2,ease:"none"}},{t0:.3f});')
    if src_blur.endswith(".mp4"):
        html.append(f'<div id="{i}" class="abs full" style="z-index:26"><video id="{nid("v")}" class="clip" data-start="{t0:.3f}" data-duration="{min(0.4, t1 - t0):.3f}" '
                    f'data-media-start="{t0:.3f}" data-track-index="1" src="{src_blur}" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
        return ""
    return f'<img id="{i}" class="abs" src="{src_blur}" style="left:0;top:0;width:1080px;height:1935px;z-index:{z}">'

# ---------------- typed titles ----------------
def typed(text, t, left, top, size, style="gold", cps_step=1.0, width=1080, align="center", z=5, sound=True, lead_ghost=0.45, tracking=None, font=None):
    """letter-by-letter typing on the 10 fps step clock. cps_step = characters per step. Newest letter at 45% for one step."""
    fam = {"gold": "Lora", "cream": "Lora", "yellow": "Lora", "label": "Bebas", "labelg": "Bebas", "labely": "Bebas",
           "mono": "Courier", "digits": "Mont", "ink": "Courier"}[style]
    if font: fam = font
    if align == "center":
        tre = float(tracking[:-2]) if tracking else 0.0
        size = fit(fam, text, size, 800, tre)
    cls = {"Lora": "f-lora", "Bebas": "f-bebas", "Courier": "f-mono", "Mont": "f-mont"}[fam]
    col = {"gold": "grad", "cream": CREAM, "yellow": YEL, "label": CREAM, "labelg": "#EBCB86", "labely": YEL, "mono": MONO_Y, "digits": "grad", "ink": "#3B2B1C"}[style]
    lid = nid("tt")
    spans, n, steps = [], 0, []
    chars = list(text)
    vis = [c for c in chars if c != " "]
    for c in chars:
        if c == " ":
            spans.append('<span class="sp"> </span>'); continue
        k = n // cps_step if cps_step >= 1 else n / cps_step
        tt = t + int(n / cps_step) / STEP
        i = nid("c")
        g = ' class="g"' if col == "grad" else ""
        spans.append(f'<span id="{i}"{g} style="opacity:0">{c}</span>')
        js.append(f'tl.set("#{i}",{{opacity:{lead_ghost}}},{tt:.3f}); tl.set("#{i}",{{opacity:1}},{tt + 1 / STEP:.3f});')
        if tt not in steps: steps.append(tt)
        n += 1
    if sound:
        for k, tt in enumerate(steps):
            if k % 1 == 0: key(tt, 0.12 if fam != "Courier" else 0.16)
    color = "" if col == "grad" else f"color:{col};"
    tr = f"letter-spacing:{tracking};" if tracking else ""
    style_s = f"left:{left}px;top:{top}px;width:{width}px;font-size:{size}px;text-align:{align};{color}{tr}z-index:{z}"
    return f'<div id="{lid}" class="tline {cls}{" gl" if col == "grad" else ""}" style="{style_s}">{"".join(spans)}</div>', steps[-1] + 0.1 if steps else t

# ---------------- torn paper wipe ----------------
def jag(y, x0=-20, x1=1100, amp=11, seed=0):
    r = random.Random(seed); pts = []; x = x0
    while x <= x1:
        pts.append((x, y + r.uniform(-amp, amp) + 16 * math.sin(x / 97 + seed)))
        x += r.choice([9, 12, 15, 18])
    return pts
def band_path(ytop, ybot, seed, grow=0):
    top = jag(ytop - grow, seed=seed); bot = jag(ybot + grow, seed=seed + 50)[::-1]
    return "M" + " L".join(f"{x:.0f} {y:.0f}" for x, y in top + bot) + " Z"
def torn(t, color, z=60):
    """3-step torn-paper band (measured JAM 7.34-7.52): middle band -> up to the top -> full frame. Coloured paper, white fibre rim, soft shadow."""
    frames = [(640, 1440), (-60, 1440), (-60, 1990)]
    out = ""
    for k, (a, b) in enumerate(frames):
        i = nid("tp")
        out += (f'<svg id="{i}" class="abs" width="1080" height="1920" viewBox="0 0 1080 1920" style="left:0;top:0;opacity:0;filter:drop-shadow(0 8px 10px rgba(0,0,0,.4))">'
                f'<path d="{band_path(a, b, 11 + k, 7)}" fill="#F2EEE4"/><path d="{band_path(a, b, 11 + k, 0)}" fill="{color}"/></svg>')
        js.append(f'tl.set("#{i}",{{opacity:1}},{t + k / STEP:.3f}); tl.set("#{i}",{{opacity:0}},{t + (k + 1) / STEP:.3f});')
    html.append(f'<div class="clip" data-start="{t:.3f}" data-duration="0.35" data-track-index="9" style="position:absolute;inset:0;z-index:{z}">{out}</div>')
    sfx("rip", t - 0.04, 0.42); whoosh(t, 0.16)

# ---------------- marks ----------------
def marker_ellipse(cx, cy, rx, ry, t, dur=0.4, w=14, col=RED, tilt=-6):
    i = nid("mk")
    # hand-drawn: start top-right, a bit more than one turn, slightly open
    pts = []
    for k in range(0, 101):
        a = -0.9 + k / 100 * (2 * math.pi + 0.5)
        rr = 1 + 0.05 * math.sin(k / 9)
        pts.append((cx + rx * rr * math.cos(a), cy + ry * rr * math.sin(a) + k * 0.12))
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    js.append(f'tl.fromTo("#{i}",{{attr:{{"stroke-dashoffset":1}}}},{{attr:{{"stroke-dashoffset":0}},duration:{dur},ease:"power1.inOut"}},{t:.3f});')
    sfx("scribble", t, 0.35)
    return (f'<svg class="abs" width="1080" height="1935" style="left:0;top:0;overflow:visible;transform:rotate({tilt}deg);transform-origin:{cx}px {cy}px">'
            f'<path id="{i}" d="{d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/></svg>')
def marker_path(d, t, dur=0.2, w=16, col=RED, snd=True):
    i = nid("mk")
    js.append(f'tl.fromTo("#{i}",{{attr:{{"stroke-dashoffset":1}}}},{{attr:{{"stroke-dashoffset":0}},duration:{dur},ease:"none"}},{t:.3f});')
    if snd: sfx("scribble", t, 0.3)
    return (f'<svg class="abs" width="1080" height="1920" style="left:0;top:0;overflow:visible"><path id="{i}" d="{d}" pathLength="1" stroke-dasharray="1" '
            f'stroke-dashoffset="1" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/></svg>')
def censor(x, y, w, h):
    return f'<div class="abs" style="left:{x - w/2:.0f}px;top:{y - h/2:.0f}px;width:{w}px;height:{h}px;background:#050505"></div>'
def img(i, src, left, top, w, z=4, extra=""):
    return f'<img id="{i}" class="abs" src="{src}" style="left:{left}px;top:{top}px;width:{w}px;z-index:{z};{extra}">'
def popin(i, t, frm=0.4):
    js.append(f'tl.fromTo("#{i}",{{scale:{frm},opacity:0}},{{scale:1,opacity:1,duration:0.2,ease:"back.out(1.8)"}},{t:.3f});')
def sun(i, cx, d, top0, top1, t_pop, t_end, col="#D42A30"):
    js.append(f'tl.fromTo("#{i}",{{y:{1920 - top0}}},{{y:0,duration:0.1,ease:"none"}},{t_pop:.3f});')
    js.append(f'tl.fromTo("#{i}",{{y:0}},{{y:{top1 - top0},duration:{t_end - t_pop - 0.1:.2f},ease:"none"}},{t_pop + 0.1:.3f});')
    return f'<div id="{i}" class="abs" style="left:{cx - d/2}px;top:{top0}px;width:{d}px;height:{d}px;border-radius:50%;background:{col};z-index:2"></div>'
def cam_push(sid, t0, t1, s1=1.04, origin="50% 45%"):
    js.append(f'tl.fromTo("#{sid}cam",{{scale:1,transformOrigin:"{origin}"}},{{scale:{s1},duration:{t1 - t0:.2f},ease:"none"}},{t0:.3f});')
def th_push(wid, t0, t1, s0=1.0, s1=1.05, origin="50% 42%"):
    jss.append(f'tl.fromTo("#{wid}",{{scale:{s0},transformOrigin:"{origin}"}},{{scale:{s1},duration:{t1 - t0:.2f},ease:"none"}},{t0:.3f});')

# =====================================================================
# S1 0.00-1.28 "Club directors,"  talking head + stacked typewriter title (Bebas label + Lora gold)
# =====================================================================
t0, t1 = 0.0, 1.60
a, _ = typed("CLUB", 0.0, 0, 236, 96, "labelg", cps_step=2.5, tracking=".2em")
b, _ = typed("DIRECTORS", 0.2, 0, 330, 158, "gold")
scene("s1", t0, t1, th(t0, t1, wid="th1") + '<div class="abs full dim"></div>' + a + b, z=10, cam=False)
th(t0, 1.28, "assets/cutout_fix.webm", wid="th1c", z=20)
th_push("th1", 0.0, 1.6, 1.0, 1.07); th_push("th1c", 0.0, 1.28, 1.0, 1.06)
js.append('tl.set("#s1 .tline",{opacity:0},1.28);')   # title drops hard on the bg swap

# =====================================================================
# S2 1.28-4.98 "a uniform company offers your club $5,000 through fundraising."
#   halftone circle reveal behind the host (ARR 1.2) -> maroon collage, host drops out the bottom, salesman cutout rises, red sun
# =====================================================================
t0, t1 = 1.28, 4.98
a, _ = typed("THE FUNDRAISING OFFER", 1.40, 0, 214, 76, "label", cps_step=2.5, tracking=".2em")
b, _ = typed("$5,000", 2.40, 0, 292, 212, "digits", lead_ghost=0.3)
inner = (bg("#2E2224", "#7A5558")
         + sun("s2sun", 540, 1150, 660, 500, 1.70, t1)
         + f'<div id="s2man" class="abs" style="left:130px;top:470px;width:820px;z-index:6"><img src="assets/img/salesman2.png" style="width:820px;display:block">{censor(415, 149, 184, 34)}</div>')
scene("s2", t0, t1, inner, z=11, over=a + b)
js.append('tl.fromTo("#s2",{clipPath:"circle(0% at 50% 52%)"},{clipPath:"circle(36% at 50% 52%)",duration:0.1,ease:"none"},1.28);')
js.append('tl.to("#s2",{clipPath:"circle(130% at 50% 52%)",duration:0.2,ease:"power2.in"},1.38);')
js.append('tl.fromTo("#s2man",{y:1320},{y:0,duration:0.5,ease:"power3.out"},1.60); tl.to("#s2man",{y:-40,duration:2.8,ease:"none"},2.10);')
cam_push("s2", 1.28, 4.68, 1.04)
js.append('tl.to("#s2cam",{scale:1.34,duration:0.3,ease:"power2.in"},4.68);')
# host cutout in front during the swap, then drops out
html.append(f'<div id="s2host" class="abs full" style="z-index:30">'
            f'<video id="{nid("v")}" class="clip" data-start="1.28" data-duration="0.82" data-media-start="1.28" data-track-index="3" src="assets/cutout_fix.webm" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
js.append('tl.fromTo("#s2host",{y:0,scale:1.07,transformOrigin:"50% 42%"},{y:1150,duration:0.5,ease:"power2.in"},1.60);')
whoosh(1.28, 0.22); whoosh(1.62, 0.2); pop(1.70, 0.28); sfx("hit", 3.00, 0.30)

# =====================================================================
# S3 4.98-6.36 "Sounds amazing, right?"  talking head, jump punch-in
# =====================================================================
scene("s3", 4.98, 6.36, th(4.98, 6.36, wid="th3"), z=10, cam=False)
th_push("th3", 4.98, 6.36, 1.14, 1.18, "50% 40%")
sfx("hit", 4.98, 0.16)

# =====================================================================
# S4 6.06-9.65 "But wait, read the fine print. That $5,000 is store credit."
#   torn paper -> maroon doc collage, sepia host in front, typewriter label, stepped zoom into the fine print, marker circle
# =====================================================================
torn(6.06, "#7A3340")
t0, t1 = 6.16, 9.65
lab, _ = typed("read the fine print.", 6.36, 84, 196, 60, "mono", cps_step=2.5, width=900, align="left")
line, _ = typed("PAID AS STORE CREDIT ONLY", 8.00, 165, 1012, 38, "ink", cps_step=3, width=700, align="left", z=3)
circ = marker_ellipse(486, 1031, 168, 44, 8.86, 0.4, w=10, tilt=-2)
doc = (f'<div id="s4doc" class="abs" style="left:90px;top:330px;width:900px;height:1247px;transform:rotate(-2deg)">'
       f'<img class="abs" src="assets/img/doc.webp" style="left:0;top:0;width:900px;filter:drop-shadow(0 14px 18px rgba(0,0,0,.45))">'
       f'<div class="abs" style="left:140px;top:1000px;width:640px;height:62px;background:#EADBB9;box-shadow:0 0 10px 6px #EADBB9"></div>{line}{circ}</div>')
scene("s4", t0, t1, doc, z=12, under=bg("#6E3A3A", "#4E2628"), over=topdark(6.30) + lab)
js.append('tl.fromTo("#s4doc",{y:220},{y:0,duration:0.3,ease:"power3.out"},6.16);')
# stepped zoom into the fine print (4 steps, ease in-out); line ends at y~900 above the caption
_lid = re.search(r'id="(tt\d+)"', lab).group(1)
js.append(f'tl.to("#{_lid}",{{y:-320,duration:0.2,ease:"power2.in"}},7.59);')
js.append('tl.to("#s4cam",{scale:1.4,transformOrigin:"540px 2513px",duration:0.4,ease:"power2.inOut"},7.59);')
html.append(f'<div id="s4host" class="abs full" style="z-index:31">'
            f'<video id="{nid("v")}" class="clip" data-start="6.16" data-duration="1.84" data-media-start="6.16" data-track-index="3" src="assets/cutout_fix_sep.webm" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px"></video></div>')
js.append('tl.fromTo("#s4host",{y:0,scale:1.32,transformOrigin:"50% 100%"},{y:1100,duration:0.4,ease:"power2.in"},7.50);')
whoosh(7.52, 0.2); whoosh(7.62, 0.14)

# =====================================================================
# S5 9.65-12.97 "You can only spend it with them on warm-ups and jerseys."  host cutout pops up over navy collage + prop pops
# =====================================================================
t0, t1 = 9.65, 12.97
a, _ = typed("YOU CAN ONLY SPEND IT", 9.70, 0, 206, 74, "label", cps_step=3, tracking=".2em")
b, _ = typed("WITH THEM", 10.10, 0, 286, 160, "gold")
host = th(t0, t1, "assets/cutout_fix.webm", wid="s5h", z=20)
inner = (bg("#0E2038", "#2F5B8C", dust=True) + host)
scene("s5", t0, t1, inner, z=10, over=a + b)
props = (img("s5jk", "assets/img/jacket.png", 30, 860, 330, z=8, extra="filter:drop-shadow(0 16px 14px rgba(0,0,0,.45))")
         + img("s5js", "assets/img/jersey.png", 660, 930, 390, z=8, extra="filter:drop-shadow(0 16px 14px rgba(0,0,0,.45))"))
scene("s5o", t0, t1, props, z=25, cam=False)
js.append('tl.fromTo("#s5h",{y:900,scale:1.0,transformOrigin:"50% 100%"},{y:40,scale:1.42,duration:0.4,ease:"back.out(1.2)"},9.65);')
popin("s5jk", 11.50); popin("s5js", 12.30)
cam_push("s5", t0, t1, 1.04)
whoosh(9.66, 0.22); pop(9.95, 0.22); pop(11.50); pop(12.30)

# =====================================================================
# S6 12.97-15.14 "That money never leaves their store."  teal-duotone halftone photo, censor bar, marker ellipse on the sign
# =====================================================================
t0, t1 = 12.97, 15.34
inner = (f'<div id="s6p" class="abs" style="left:0;top:0;width:1080px;height:1935px">'
         f'<img class="abs" src="assets/img/store.jpg" style="left:0;top:0;width:1080px">{censor(752, 952, 86, 18)}'
         f'{marker_ellipse(790, 318, 235, 108, 13.80, 0.4, w=14)}</div>'
         + blurin(t0, t1, "assets/img/store_blur.jpg", z=3))
scene("s6", t0, t1, inner, z=12)
cam_push("s6", t0, t1, 1.08, "50% 40%")
sfx("hit", t0, 0.18)

# =====================================================================
# S7 15.14-17.23 "Now here's how fundraising with stimulus works."  talking head, title BEHIND the host (cutout on top)
# =====================================================================
t0, t1 = 15.14, 17.43
a, _ = typed("FUNDRAISING WITH", 15.24, 0, 206, 80, "labelg", cps_step=3, tracking=".2em")
b, _ = typed("STIMULUS", 15.50, 0, 290, 196, "gold")
inner = (th(t0, t1, wid="th7") + '<div class="abs full dim dim2"></div>' + a + b + th(t0, t1, "assets/cutout_fix.webm", wid="th7c", z=20) + blurin(t0, t1, "assets/th_blur.mp4", z=8))
scene("s7", t0, t1, inner, z=12, cam=False)
th_push("th7", t0, t1, 1.0, 1.05); th_push("th7c", t0, t1, 1.0, 1.05)
whoosh(t0, 0.16)

# =====================================================================
# S8 17.23-19.73 "Our custom jerseys cost less than big name brands,"  torn paper -> title card with hero jersey, marker "LESS"
# =====================================================================
torn(17.23, "#5547A6")
t0, t1 = 17.33, 19.73
inner = (bg("#5547A6", "#3B2F86", dust=True)
         + f'<div class="tline f-lora gl" style="left:0;top:300px;width:1080px;text-align:center;font-size:{fit("Lora", "CUSTOM", 236, 760)}px;color:{YEL};z-index:3">CUSTOM</div>'
         + img("s8j", "assets/img/jersey.png", 130, 420, 820, z=5, extra="filter:drop-shadow(0 22px 18px rgba(0,0,0,.45))")

         + f'<div id="s8less" class="abs f-hand" style="left:600px;top:880px;font-size:200px;color:{RED};transform:rotate(-10deg);z-index:7;text-shadow:0 0 0 #fff">less!</div>'
         + marker_path("M 610 1000 C 560 960, 520 930, 470 900 M 520 890 L 466 898 L 486 948", 18.62, 0.2, w=14))
scene("s8", t0, t1, inner, z=12, over=f'<div id="s8w" class="tline f-lora gl" style="left:0;top:1080px;width:1080px;text-align:center;font-size:{fit("Lora", "JERSEYS", 200, 780)}px;color:{YEL};z-index:6">JERSEYS</div>')
js.append('tl.fromTo("#s8j",{y:-1250},{y:0,duration:0.2,ease:"power2.in"},17.50); tl.to("#s8j",{y:-14,duration:0.1,yoyo:true,repeat:1},17.70);')
js.append('tl.fromTo("#s8w",{opacity:0,y:180},{opacity:1,y:180,duration:0.01},17.60); tl.to("#s8w",{y:0,duration:0.1,ease:"none"},17.70);')
js.append('tl.fromTo("#s8less",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.4,ease:"none"},18.20);')
cam_push("s8", t0, t1, 1.04)
sfx("riser", 16.65, 0.12); sfx("hit", 17.70, 0.32); pop(17.60, 0.25); sfx("scribble", 18.20, 0.32)

# =====================================================================
# S9 19.73-22.65 "and your club can add a fundraising amount to each jersey."  colourway grid, one jersey per step + gold tags
# =====================================================================
t0, t1 = 19.73, 22.65
a, _ = typed("ADD A FUNDRAISING AMOUNT", 20.20, 0, 214, 74, "labely", cps_step=3, tracking=".18em")
b, _ = typed("TO EACH JERSEY", 21.20, 0, 296, 128, "yellow", cps_step=2)
grid = ""
srcs = ["jersey", "j_red", "j_blue", "j_orange", "j_purple", "j_navy"]
for k, s in enumerate(srcs):
    x = 80 + (k % 3) * 315; y = 540 + (k // 3) * 360
    grid += img(f"s9j{k}", f"assets/img/{s}.png", x, y, 290, z=5, extra="filter:drop-shadow(0 12px 10px rgba(0,0,0,.4))")
    grid += f'<div id="s9t{k}" class="tag" style="left:{x + 180}px;top:{y + 190}px">+$</div>'
    popin(f"s9j{k}", 20.30 + k * 0.1); popin(f"s9t{k}", 20.90 + k * 0.1, 0.3)
    if k % 2 == 0: pop(20.30 + k * 0.1, 0.24)
    if k % 2 == 1: pop(20.90 + k * 0.1, 0.18)
scene("s9", t0, t1, bg("#5547A6", "#3B2F86", dust=True) + grid, z=12, over=a + b)
cam_push("s9", t0, t1, 1.04)

# =====================================================================
# S10 22.65-24.06 "Families see the regular price,"  faded 80s family photo, censor bars, title
# =====================================================================
t0, t1 = 22.65, 24.06
a, _ = typed("FAMILIES SEE THE", 22.62, 0, 206, 74, "label", cps_step=3, tracking=".2em")
b, _ = typed("REGULAR PRICE", 22.90, 0, 286, 132, "gold", cps_step=1.6)
inner = (f'<div id="s10p" class="abs" style="left:-216px;top:0;width:1512px;height:2709px"><img class="abs" src="assets/img/family_sel.jpg" style="left:0;top:0;width:1512px">'
         f'{censor(392*1.4, 426*1.4, 266, 46)}{censor(682*1.4, 322*1.4, 240, 44)}{censor(546*1.4, 668*1.4, 210, 40)}</div>'
         + f'<div class="abs full" style="background:#2b2b2b;z-index:-1"></div>' + f'<img class="abs" src="assets/img/family_sel_blur.jpg" id="s10bl" style="left:-216px;top:0;width:1512px;z-index:3">')
js.append('tl.fromTo("#s10bl",{opacity:1},{opacity:0,duration:0.2,ease:"none"},22.65);')
scene("s10", t0, t1, inner, z=12, under='<div class="abs full" style="background:#3a3a38"></div>', over=topdark(t0) + a + b)
cam_push("s10", t0, t1, 1.05)
sfx("hit", t0, 0.18)

# =====================================================================
# S11 24.06-26.70 "while the fundraising markup stays private."  talking head + app-icon tile (lock) with lime outline trace
# =====================================================================
t0, t1 = 24.06, 26.90
tile = (f'<div id="s11tile" class="tile" style="left:390px;top:380px;width:300px;height:300px">'
        f'<img src="assets/img/lock.png" style="width:190px;height:190px;margin:55px"></div>'
        f'<svg class="abs" width="1080" height="1920" style="left:0;top:0;z-index:9"><rect id="s11out" x="380" y="370" width="320" height="320" rx="66" pathLength="1" '
        f'stroke-dasharray="1" stroke-dashoffset="1" fill="none" stroke="#C6F200" stroke-width="9"/></svg>')
scene("s11", t0, t1, th(t0, t1, wid="th11") + f'<div id="s11g" class="abs full" style="z-index:8">{tile}</div>', z=12, cam=False)
th_push("th11", t0, t1, 1.10, 1.14, "50% 40%")
js.append('tl.fromTo("#s11g",{opacity:0},{opacity:1,duration:0.01},24.86);')
js.append('tl.fromTo("#s11out",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.7,ease:"none"},25.28);')
pop(24.86, 0.30); sfx("click", 25.98, 0.45)

# =====================================================================
# S12 26.70-30.92 "That extra money goes directly into your club in cash, not store credit."  torn navy -> cash drop, yellow sun, voucher + red X
# =====================================================================
torn(26.70, "#0F2038")
t0, t1 = 26.80, 30.92
a, _ = typed("DIRECTLY INTO YOUR CLUB", 26.90, 0, 206, 74, "label", cps_step=3, tracking=".2em")
b, _ = typed("IN CASH", 28.50, 0, 286, 210, "gold")
inner = (bg("#0E2038", "#2F5B8C", dust=True) 
         + img("s12cash", "assets/img/cash.png", 90, 600, 900, z=6, extra="filter:drop-shadow(0 18px 16px rgba(0,0,0,.45))")
         + f'<div id="s12v" class="abs" style="left:430px;top:1000px;width:560px;z-index:8;transform:rotate(8deg)">'
         f'<img src="assets/img/voucher.png" style="width:560px;filter:drop-shadow(0 12px 12px rgba(0,0,0,.45))"></div>'
         + f'<div class="abs full" style="z-index:9">{marker_path("M 520 1030 L 920 1270", 30.10, 0.2, w=18)}{marker_path("M 930 1020 L 510 1290", 30.30, 0.2, w=18, snd=False)}</div>')
scene("s12", t0, t1, inner, z=12, over=a + b)
js.append('tl.fromTo("#s12cash",{y:-1300},{y:0,duration:0.2,ease:"power2.in"},27.00); tl.to("#s12cash",{y:-16,duration:0.1,yoyo:true,repeat:1},27.20); tl.to("#s12cash",{y:-40,duration:3.4,ease:"none"},27.40);')
popin("s12v", 29.80, 0.4)
cam_push("s12", t0, t1, 1.04)
sfx("hit", 27.20, 0.30); pop(27.22, 0.22); pop(29.80, 0.28)

# =====================================================================
# S13 30.92-35.05 list: "Use it for field rentals, coaches, financial assistance for families,"  one image per phrase + typewriter labels
# =====================================================================
t0, t1 = 30.92, 32.42
lab, _ = typed("field rentals", 31.10, 84, 196, 60, "mono", cps_step=3, width=900, align="left")
scene("s13a", t0, t1, f'<img class="abs" src="assets/img/field.jpg" style="left:0;top:0;width:1080px">' + blurin(t0, t1, "assets/img/field_blur.jpg"), z=12, over=topdark(t0) + lab)
cam_push("s13a", t0, t1, 1.12, "50% 60%"); sfx("hit", t0, 0.18)
t0, t1 = 32.42, 33.47
lab, _ = typed("coaches", 32.42, 84, 196, 60, "mono", cps_step=4, width=900, align="left")
inner = (bg("#2E2224", "#7A5558") + sun("s13sun", 540, 1150, 760, 640, 32.62, t1)
         + f'<div id="s13c" class="abs" style="left:40px;top:520px;width:1000px;z-index:6"><img src="assets/img/coach.png" style="width:1000px;display:block">{censor(435, 245, 250, 44)}</div>')
scene("s13b", t0, t1, inner, z=12, over=topdark(t0) + lab)
js.append('tl.fromTo("#s13c",{y:1300},{y:0,duration:0.4,ease:"power3.out"},32.42);')
cam_push("s13b", t0, t1, 1.03); whoosh(32.44, 0.2); pop(32.62, 0.24)
t0, t1 = 33.47, 35.05
lab, _ = typed("financial assistance", 33.50, 84, 196, 60, "mono", cps_step=3, width=900, align="left")
inner = (f'<div class="abs" style="left:-216px;top:0;width:1512px;height:2709px"><img class="abs" src="assets/img/family_bw.jpg" style="left:0;top:0;width:1512px">'
         f'{censor(392*1.4, 426*1.4, 266, 46)}{censor(682*1.4, 322*1.4, 240, 44)}{censor(546*1.4, 668*1.4, 210, 40)}</div>'
         + f'<img class="abs" src="assets/img/family_bw_blur.jpg" id="s13bl" style="left:-216px;top:0;width:1512px;z-index:3">')
js.append('tl.fromTo("#s13bl",{opacity:1},{opacity:0,duration:0.2,ease:"none"},33.47);')
scene("s13c", t0, t1, inner, z=12, under='<div class="abs full" style="background:#2a2a2a"></div>', over=topdark(t0) + lab)
cam_push("s13c", t0, t1, 1.06); sfx("hit", t0, 0.16)

# =====================================================================
# S14 35.05-38.62 "or whatever your club needs. Store credit buys more gear."  talking head punch-in + typewriter label over a top gradient
# =====================================================================
t0, t1 = 35.05, 38.72
lab, _ = typed("store credit = more gear", 36.70, 84, 196, 56, "mono", cps_step=3, width=940, align="left")
scene("s14", t0, t1, th(t0, t1, wid="th14") + f'<div class="abs full" style="z-index:7">{topdark(36.62, 560)}{topdark(36.62, 420)}{lab}</div>', z=12, cam=False)
th_push("th14", t0, t1, 1.08, 1.14, "50% 40%")
sfx("hit", t0, 0.14)

# =====================================================================
# S15 38.62-41.90 "Cash gives your club the freedom to invest in what matters most."  host cutout over dusk gradient, title behind
# =====================================================================
t0, t1 = 38.62, 41.90
a, _ = typed("CASH GIVES YOUR CLUB", 38.70, 0, 206, 74, "label", cps_step=3, tracking=".2em")
b, _ = typed("FREEDOM", 39.00, 0, 286, 214, "gold")
inner = bg("#0E1526", "#D9722E", dust=True) + th(t0, t1, "assets/cutout_fix.webm", wid="s15h", z=20)
scene("s15", t0, t1, inner, z=13, over=a + b)
js.append('tl.fromTo("#s15,#s15h",{opacity:0},{opacity:1,duration:0.2,ease:"none"},38.62);')
js.append('tl.fromTo("#s15h",{scale:1.2,y:-60,transformOrigin:"50% 100%"},{scale:1.4,y:60,duration:0.3,ease:"power3.out"},38.62); tl.to("#s15h",{scale:1.46,duration:3.0,ease:"none"},38.92);')
cam_push("s15", t0, t1, 1.04)
whoosh(38.62, 0.18)

# =====================================================================
# S16 41.90-46.72 "With stimulus, you control your fundraising amount. Change it or turn it off at any time."  TH + toggle tile
# =====================================================================
t0, t1 = 41.90, 46.82
tile = (f'<div class="tile" style="left:370px;top:360px;width:340px;height:340px">'
        f'<div id="s16tr" class="abs" style="left:60px;top:110px;width:220px;height:120px;border-radius:60px;background:#34C759"></div>'
        f'<div id="s16kn" class="abs" style="left:170px;top:120px;width:100px;height:100px;border-radius:50%;background:#FFFFFF;box-shadow:0 4px 8px rgba(0,0,0,.3)"></div></div>'
        f'<svg class="abs" width="1080" height="1920" style="left:0;top:0;z-index:9"><rect id="s16out" x="360" y="350" width="360" height="360" rx="74" pathLength="1" '
        f'stroke-dasharray="1" stroke-dashoffset="1" fill="none" stroke="#C6F200" stroke-width="9"/></svg>')
scene("s16", t0, t1, th(t0, 42.84, wid="th16a") + th(42.84, t1, wid="th16b", z=6) + f'<div id="s16g" class="abs full" style="z-index:8">{tile}</div>', z=12, cam=False)
th_push("th16a", 41.90, 42.84, 1.0, 1.03); th_push("th16b", 42.84, t1, 1.12, 1.16, "50% 40%")
js.append('tl.fromTo("#s16g",{opacity:0},{opacity:1,duration:0.01},44.70);')
js.append('tl.fromTo("#s16out",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.7,ease:"none"},44.80);')
js.append('tl.to("#s16kn",{x:-110,duration:0.2,ease:"power2.out"},45.70); tl.to("#s16tr",{backgroundColor:"#9A9A9A",duration:0.1},45.70);')
sfx("hit", 42.84, 0.14); pop(44.70, 0.30); sfx("click", 45.70, 0.5)

# =====================================================================
# S17 46.72-50.30 "Want to see what your club could raise? Link in bio."  torn blue -> quote card, host cutout low, typewriter quote, jersey pop
# =====================================================================
torn(46.72, "#3C6C9E")
t0, t1 = 46.82, END
q1, e1 = typed('"want to see what', 46.90, 84, 250, 66, "mono", cps_step=2, width=920, align="left")
q2, e2 = typed("your club", e1, 84, 345, 66, "mono", cps_step=2, width=920, align="left")
q3, _ = typed('could raise?"', e2, 84, 440, 66, "mono", cps_step=2, width=920, align="left")
inner = (bg("#4F6EB8", "#1F3A85", dust=True) + q1 + q2 + q3)
scene("s17o", t0, t1, img("s17j", "assets/img/cash.png", 760, 600, 250, z=25, extra="filter:drop-shadow(0 14px 12px rgba(0,0,0,.4))")
         , cam=False, z=25)
th(t0, t1, "assets/cutout_fix.webm", wid="s17h", z=20)
scene("s17", t0, t1, inner, z=12)
popin("s17j", 48.30)
js.append('tl.set("#s17h",{y:150,scale:1.4,transformOrigin:"50% 100%"},46.82);')
cam_push("s17", t0, t1, 1.03)
pop(48.30, 0.28)

# ---------------- captions: karaoke pill (always on top) ----------------
words = json.loads((R / "prep/words_edit.json").read_text(encoding="utf-8"))["words"]
W = []
for w in words:
    if W and (w["w"].startswith(",") or w["w"].startswith("-")):
        W[-1]["w"] += w["w"]; W[-1]["e"] = w["e"]
    else:
        W.append(dict(w))
chunks, cur = [], []
for w in W:
    cur.append(w)
    txt = " ".join(x["w"] for x in cur)
    if w["w"][-1] in ".,?!" or len(cur) >= 4 or len(txt) > 22:
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
cap = []
for k, ch in enumerate(chunks):
    cs = max(0, ch[0]["s"] - 0.1)
    ce = chunks[k + 1][0]["s"] - 0.1 if k + 1 < len(chunks) else END
    ce = min(ce, END)
    txt = " ".join(x["w"] for x in ch)
    wpx = CAPF.getlength(txt) + 2 * 42
    cid = nid("cap")
    spans = []
    for x in ch:
        i = nid("cw")
        spans.append(f'<span id="{i}" style="color:{UPC}">{x["w"]}</span>')
        jss.append(f'tl.set("#{i}",{{color:"{CUR}"}},{x["s"]:.3f}); tl.set("#{i}",{{color:"{SPOKEN}"}},{x["e"]:.3f});')
    cap.append(f'<div id="{cid}" class="clip cap" data-start="{cs:.3f}" data-duration="{ce - cs:.3f}" data-track-index="5" style="left:{540 - wpx/2:.0f}px;width:{wpx:.0f}px">{" ".join(spans)}</div>')
html.append(f'<div id="caps" data-track-kind="captions" style="position:absolute;inset:0;z-index:80">{"".join(cap)}</div>')

# ---------------- outro ----------------
html.append(f'<div id="outro-w" style="position:absolute;inset:0;z-index:90"><video id="v-outro" class="clip" data-start="{END}" data-duration="{OUTRO}" data-track-index="7" src="assets/outro.mp4" muted playsinline style="width:1080px;height:1920px"></video></div>')
jss.append(f'tl.fromTo("#outro-w",{{x:1080}},{{x:0,duration:0.3,ease:"power2.out"}},{END});')
whoosh(END, 0.24)

aud.insert(0, f'<audio id="voice" class="clip" data-start="0" data-duration="{END:.2f}" data-track-index="8" src="assets/voice.wav" data-volume="1"></audio>')
aud.insert(1, f'<audio id="music" class="clip" data-start="0" data-duration="{END + 0.3:.2f}" data-media-start="0" data-track-index="10" src="assets/music.wav" data-volume="0.11" data-fade-out="0.5"></audio>')
aud.insert(2, f'<audio id="music-out" class="clip" data-start="{END}" data-duration="{OUTRO}" data-media-start="{END}" data-track-index="11" src="assets/music.wav" data-volume="0.28" data-fade-in="0.4" data-fade-out="0.5"></audio>')

# ---- 10 fps stepped graphics ----
def snap(v, mn=0.0):
    return max(mn, round(float(v) * STEP) / STEP)
def snap_line(l):
    l = re.sub(r'duration:([0-9.]+)', lambda m: f'duration:{snap(m.group(1), 1/STEP) if float(m.group(1)) > 0.02 else float(m.group(1)):.4f}', l)
    l = re.sub(r'\},(-?[0-9.]+)\);', lambda m: f'}},{snap(m.group(1)):.4f});', l)
    return l
js = [snap_line(l).replace("tl.", "tlg.") for l in js]
CSS = (R / "prep/style.css").read_text(encoding="utf-8")
STEPJS = f"""
// reel graphics animate at 10 fps (3,2,3,2 cadence at 25 fps): graphics live on tlg, seeked to the 1/10 s grid by a driver tween
var __drv = {{v: 0}};
tl.to(__drv, {{v: 1, duration: {TOTAL}, ease: function (p) {{ tlg.totalTime(Math.floor(p * {TOTAL} * {STEP} + 1e-6) / {STEP}, true); return p; }}}}, 0);
"""
page = f"""<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<style>
{CSS}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920" data-fps="30">
{chr(10).join(html)}
{chr(10).join(aud)}
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{paused:true}});
const tlg = gsap.timeline({{paused:true}});
{chr(10).join(js)}
{chr(10).join(jss)}
{STEPJS}
window.__timelines["main"] = tl;
</script>
</body></html>"""
(R / "index.html").write_text(page, encoding="utf-8")
print("ok", TOTAL, len(html), "nodes", len(js) + len(jss), "tweens", len(aud), "audio", len(chunks), "caption chunks")

"""docucollage-test v2 (reel-1 rebuild, Ali Abdaal "Gold Medal Syndrome" spec in styles/docucollage/REEL1_FRAME_ANALISIS.md).
python prep/gen2.py -> index.html (HyperFrames 1080x1920, 24 fps; graphics on a 12 fps step clock; TH, host cutouts, deblur and caption fills smooth)."""
import json, math, random, re
from pathlib import Path
from PIL import ImageFont

R = Path(__file__).resolve().parent.parent
FD = R / "assets/fonts"
STEP = 12
END = 50.30
OUTRO = 2.336
TOTAL = round(END + OUTRO, 3)
GOLD, SHADOW = "#FFD08D", "#422F1A"
CAP_FILL, CAP_UP, CAP_DONE = "#FBF5E5", "#CFC8B6", "#1B1B1B"
CAPF = ImageFont.truetype(str(FD / "Poppins-Bold.ttf"), 44)
FONTS = {"cond": FD / "BebasNeue-Regular.ttf", "serif": FD / "Besley.ttf", "hand": FD / "CoveredByYourGrace.ttf"}
FACES = json.loads((R / "assets/img2/faces.json").read_text())
# manual additions where MediaPipe misses profiles / small faces (checked on grids)
FACES["regtable.jpg"] += [{"cx": 258, "cy": 572, "bar_w": 92, "bar_h": 34, "angle": 8, "eye_span": 50}, {"cx": 318, "cy": 545, "bar_w": 84, "bar_h": 30, "angle": 0, "eye_span": 46}]
FACES["huddle.jpg"] += [{"cx": 108, "cy": 588, "bar_w": 96, "bar_h": 32, "angle": 4, "eye_span": 52}, {"cx": 962, "cy": 585, "bar_w": 90, "bar_h": 32, "angle": 12, "eye_span": 50}]

html, js, jss, aud = [], [], [], []      # js -> tlg (12 fps), jss -> tl (smooth)
_id = [0]
def nid(p="e"):
    _id[0] += 1
    return f"{p}{_id[0]}"

# ---------------- sound ----------------
_rot = {}
def sfx(name, t, vol):
    aud.append(f'<audio id="{nid("s")}" class="clip" data-start="{max(0, t):.3f}" data-track-index="{20 + len(aud)}" src="assets/sfx/{name}.wav" data-volume="{vol}"></audio>')
def rot(kind, n, t, vol):
    k = _rot.get(kind, 0); _rot[kind] = k + 1; sfx(f"{kind}{k % n + 1}", t, vol)
def pop(t, v=0.28): rot("pop", 3, t, v)
def whoosh(t, v=0.26): rot("wh", 3, t - 0.06, v)
def tick(t, v=0.10): rot("tick", 3, t, v)

# ---------------- text measuring ----------------
def text_w(kind, text, size, track_em=0.0):
    f = ImageFont.truetype(str(FONTS[kind]), 100)
    if kind == "serif": f.set_variation_by_axes([900])
    return (f.getlength(text) + track_em * 100 * len(text)) * size / 100
def fit(kind, text, size, maxw, track_em=0.0):
    while text_w(kind, text, size, track_em) > maxw and size > 24: size -= 2
    return size

# ---------------- containers ----------------
def scene(sid, t0, t1, inner, z=10, under="", over="", deblur=True, extra=""):
    camo = under + f'<div id="{sid}cam" class="cam">{inner}</div>' + (f'<div class="abs full" style="z-index:50">{over}</div>' if over else "")
    html.append(f'<div id="{sid}" class="clip scene" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="2" style="z-index:{z};{extra}">{camo}</div>')
    if deblur:   # reel: hard cut + deblur 18,14,10,5,2,0 px in 6 frames (25 fps) -> smooth
        jss.append(f'tl.fromTo("#{sid}",{{filter:"blur(18px)"}},{{filter:"blur(0px)",duration:0.26,ease:"power2.out"}},{t0:.3f});')
def whip_out(sid, t_end):
    """reel WS: blur 4,6,16,18 px over the last 4 frames + bg pushed ~100 px left"""
    jss.append(f'tl.to("#{sid}",{{filter:"blur(18px)",x:-100,duration:0.16,ease:"power2.in"}},{t_end - 0.16:.3f});')
def cam(sid, t0, t1, s1=1.04, origin="50% 45%", dx=0, dy=0, ease="none"):
    js.append(f'tl.fromTo("#{sid}cam",{{scale:1,x:0,y:0,transformOrigin:"{origin}"}},{{scale:{s1},x:{dx},y:{dy},duration:{t1 - t0:.2f},ease:"{ease}"}},{t0:.3f});')
def layer(i, src, left, top, w, z=4, extra="", inner=""):
    return f'<div id="{i}" class="abs" style="left:{left}px;top:{top}px;width:{w}px;z-index:{z};{extra}"><img src="{src}" style="width:{w}px;display:block">{inner}</div>'
def drift(i, t0, t1, dx=0, dy=0, ds=0.0, origin="50% 50%"):
    js.append(f'tl.to("#{i}",{{x:"+={dx}",y:"+={dy}",scale:"+={ds}",transformOrigin:"{origin}",duration:{t1 - t0:.2f},ease:"none"}},{t0:.3f});')
def enter(i, t, dx=0, dy=0, dur=0.6, scale0=None):
    """reel cutout entry: exponential ease-out, decay ~0.5/step, no overshoot, no rotation"""
    s = f",scale:{scale0}" if scale0 else ""
    js.append(f'tl.from("#{i}",{{x:{dx},y:{dy}{s},duration:{dur},ease:"expo.out",immediateRender:true}},{t:.3f});')
def pop_in(i, t, s0=1.28):
    """reel rings/medal: 1-frame pop at x1.28, hold, then shrink ease-out to 1.0"""
    js.append(f'tl.set("#{i}",{{opacity:0}},0); tl.set("#{i}",{{opacity:1,scale:{s0}}},{t:.3f}); tl.to("#{i}",{{scale:1,duration:0.6,ease:"power2.out"}},{t + 0.17:.3f});')
def exit_down(i, t, dy=1400, dur=0.4):
    js.append(f'tl.to("#{i}",{{y:"+={dy}",duration:{dur},ease:"power2.in"}},{t:.3f});')
def swing(i, t0, t1, amp=5, period=1.3, origin="50% 0%"):
    """pendulum (hangers, padlock): damped sine on the 12 fps clock"""
    n = max(1, int((t1 - t0) / (period / 2)))
    t, a, sgn = t0, amp, 1
    js.append(f'tl.set("#{i}",{{transformOrigin:"{origin}",rotation:{-amp}}},{t0:.3f});')
    for k in range(n):
        js.append(f'tl.to("#{i}",{{rotation:{sgn * a:.2f},duration:{period / 2:.2f},ease:"sine.inOut"}},{t:.3f});')
        t += period / 2; a *= 0.82; sgn *= -1

def censor(img, scale=1.0, ox=0, oy=0, style="smudge", skip=()):
    """eye bars from MediaPipe landmarks (assets/img2/faces.json); feathered like the reel"""
    out = ""
    for k, f in enumerate(FACES.get(img, [])):
        if k in skip: continue
        w, h = f["bar_w"] * scale, max(14, f["bar_h"] * scale * 0.82)
        x, y = f["cx"] * scale + ox, f["cy"] * scale + oy
        br = "border-radius:45% 40% 50% 42% / 60% 55% 65% 50%;box-shadow:0 0 12px 7px rgba(11,11,11,.9)" if style == "smudge" else "box-shadow:0 0 6px 3px rgba(11,11,11,.85)"
        out += f'<div class="abs" style="left:{x - w/2:.0f}px;top:{y - h/2:.0f}px;width:{w:.0f}px;height:{h:.0f}px;background:#0B0B0B;transform:rotate({f["angle"]}deg);{br};opacity:.97"></div>'
    return out

# ---------------- videos (root level) ----------------
def video(t0, t1, src, wid, z, extra="", media=None):
    html.append(f'<div id="{wid}" class="abs full" style="z-index:{z};{extra}"><video id="{nid("v")}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" '
                f'data-media-start="{(media if media is not None else t0):.3f}" data-track-index="1" src="{src}" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover"></video></div>')
def th(t0, t1, wid, push=(1.0, 1.03), origin="50% 32%", blur_in=True, dy=0):
    video(t0, t1, "assets/th_big.mp4", wid, 5)
    html.append(f'<div id="{nid("thd")}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="4" style="position:absolute;left:0;top:0;width:1080px;height:300px;z-index:6;background:linear-gradient(180deg,rgba(6,6,8,.96),rgba(6,6,8,.75) 35%,rgba(6,6,8,0))"></div>')
    jss.append(f'tl.fromTo("#{wid}",{{scale:{push[0]},y:{dy},transformOrigin:"{origin}"}},{{scale:{push[1]},y:{dy},duration:{t1 - t0:.2f},ease:"none"}},{t0:.3f});')
    if blur_in:
        b = nid("bl"); video(t0, min(t1, t0 + 0.4), "assets/th_big_blur.mp4", b, 26)
        jss.append(f'tl.fromTo("#{b}",{{opacity:1}},{{opacity:0,duration:0.26,ease:"power2.out"}},{t0:.3f});')
def host(t0, t1, wid, z=20, y=0, scale=1.0):
    video(t0, t1, "assets/cutout_big.webm", wid, z)
    jss.append(f'tl.set("#{wid}",{{y:{y},scale:{scale},transformOrigin:"50% 100%"}},{t0:.3f});')

# ---------------- titles (reel-1: Bebas cond line + Besley 900 serif, flat gold, hard shadow, per-letter wiggle, shine) ----------------
TITLE_BOX = []
def title(lines, t, top, appear="type", shine=True, z=5, exit=None, lead=True):
    """lines: [(kind, text, size, opts)] kind cond|serif|hand. appear: type (letter by letter on the 12 fps grid) | drop (letters fall 100 px, 5 f).
    Returns html. exit: ('up', t) accelerate up | ('fade', t) 6 f fade."""
    out, y, tt = "", top, t
    wid = nid("ti")
    for kind, text, size, o in lines:
        track = o.get("track", 0.2 if kind == "cond" else 0.02)
        size = fit(kind, text, size, o.get("maxw", 800), track)
        col = o.get("color", GOLD)
        fpl = o.get("fpl", 2 if kind == "serif" else 1)          # frames (24 fps) per letter
        sh = max(4, round(size * 0.1))
        amp = o.get("amp", 3.0 if kind != "hand" else 0.8)
        cls = {"cond": "t-cond", "serif": "t-serif", "hand": "t-hand"}[kind]
        spans, sspans = [], []
        n = 0
        for ch in text:
            if ch == " ":
                spans.append('<span class="sp"> </span>'); sspans.append('<span class="sp"> </span>'); continue
            seed = rnd.randint(1, 99999)
            lt = nid("l")
            spans.append(f'<span id="{lt}" class="lt" style="opacity:0"><span class="wg" data-s="{seed}" data-a="{amp}">{ch}</span></span>')
            sspans.append(f'<span class="lt {lt}s" style="opacity:0"><span class="wg" data-s="{seed}" data-a="{amp}">{ch}</span></span>')
            ta = tt + (n * fpl) / 24
            ta = round(ta * STEP) / STEP
            if appear == "type":
                js.append(f'tl.set("#{lt},.{lt}s",{{opacity:0.45}},{ta:.4f}); tl.set("#{lt},.{lt}s",{{opacity:1}},{ta + 1/STEP:.4f});')
            else:
                js.append(f'tl.fromTo("#{lt},.{lt}s",{{opacity:1,y:-100}},{{opacity:1,y:0,duration:0.21,ease:"power3.out",immediateRender:false}},{ta:.4f});')
            if n % 2 == 0: tick(ta, 0.08)
            n += 1
        line_end = tt + (n * fpl) / 24
        style = f"top:{y}px;font-size:{size}px;letter-spacing:{track}em;color:{col};text-shadow:{sh}px {round(sh*0.9)}px 0 {o.get('shadow', SHADOW)}"
        out += f'<div class="tline {cls}" style="{style}">{"".join(spans)}</div>'
        if shine and kind != "hand":
            sid = nid("sh")
            out += f'<div id="{sid}" class="tline {cls} shine" style="top:{y}px;font-size:{size}px;letter-spacing:{track}em">{"".join(sspans)}</div>'
            js.append(f'tl.fromTo("#{sid}",{{"--sx":"130%"}},{{"--sx":"-30%","duration":{o.get("shine_dur", 0.85)},ease:"none"}},{line_end + 0.05:.3f});')
        y += round(size * o.get("lh", 1.0)) + o.get("gap", 4)
        tt = line_end if o.get("serial", True) else tt
    if exit:
        kind, te = exit
        if kind == "up": js.append(f'tl.to("#{wid}",{{y:-700,duration:0.35,ease:"power2.in"}},{te:.3f});')
        else: js.append(f'tl.to("#{wid}",{{opacity:0,duration:0.25,ease:"none"}},{te:.3f});')
    return f'<div id="{wid}" class="abs full" style="z-index:{z}">{out}</div>'
rnd = random.Random(11)

def marker(d, t, dur=0.3, w=14, col="#D8232A", snd=True):
    i = nid("mk")
    js.append(f'tl.fromTo("#{i}",{{attr:{{"stroke-dashoffset":1}}}},{{attr:{{"stroke-dashoffset":0}},duration:{dur},ease:"none"}},{t:.3f});')
    if snd: sfx("scribble", t, 0.3)
    return (f'<svg class="abs" width="1080" height="1920" style="left:0;top:0;overflow:visible;z-index:12"><path id="{i}" d="{d}" pathLength="1" stroke-dasharray="1" '
            f'stroke-dashoffset="1.02" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/></svg>')
def ellipse_d(cx, cy, rx, ry):
    pts = [(cx + rx * (1 + .04 * math.sin(k / 8)) * math.cos(-0.9 + k / 100 * (2 * math.pi + .5)), cy + ry * math.sin(-0.9 + k / 100 * (2 * math.pi + .5)) + k * .1) for k in range(101)]
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)

def jag(y, seed, amp=10):
    r = random.Random(seed); pts = []; x = -20
    while x <= 1100:
        pts.append((x, y + r.uniform(-amp, amp) + 14 * math.sin(x / 90 + seed))); x += r.choice([9, 12, 15, 18])
    return pts
def torn(t, color, z=60):
    """torn paper band (reel P32 / JAM 7.34): middle band -> to the top -> full, 3 steps on the 12 fps clock, white fibre rim"""
    frames = [(640, 1440), (-60, 1440), (-60, 1990)]; out = ""
    for k, (a, b) in enumerate(frames):
        i = nid("tp"); top = jag(a - 7, 11 + k); bot = jag(b + 7, 61 + k)[::-1]; top0 = jag(a, 11 + k); bot0 = jag(b, 61 + k)[::-1]
        P = lambda L: "M" + " L".join(f"{x:.0f} {y:.0f}" for x, y in L) + " Z"
        out += (f'<svg id="{i}" class="abs" width="1080" height="1920" style="left:0;top:0;opacity:0;filter:drop-shadow(0 8px 10px rgba(0,0,0,.4))">'
                f'<path d="{P(top + bot)}" fill="#F2EEE4"/><path d="{P(top0 + bot0)}" fill="{color}"/></svg>')
        js.append(f'tl.set("#{i}",{{opacity:1}},{t + k / STEP:.3f}); tl.set("#{i}",{{opacity:0}},{t + (k + 1) / STEP:.3f});')
    html.append(f'<div id="{nid("torn")}" class="clip" data-start="{t:.3f}" data-duration="0.3" data-track-index="9" style="position:absolute;inset:0;z-index:{z}">{out}</div>')
    sfx("rip", t - 0.04, 0.42); whoosh(t, 0.15)

def bg(c1, c2, ht=True, vign=True):
    return (f'<div class="abs full" style="background:linear-gradient(180deg,{c1},{c2})"></div>' + ('<div class="ht"></div>' if ht else "")
            + ('<div class="vig"></div>' if vign else ""))
def photo(src, i, w=1080, top=0, left=0, z=1, extra=""):
    return f'<img id="{i}" class="abs" src="{src}" style="left:{left}px;top:{top}px;width:{w}px;z-index:{z};{extra}">'

HOST_Y = 740        # host cutout at the bottom of the frame in front of a scene (fav 1/2): head centre ~1260

# =====================================================================
# S1 0.00-1.28 "Club directors,"  host at the bottom in front of the locker room; title behind the head (fav 1)
# =====================================================================
t0, t1 = 0.0, 1.30
ttl = title([("cond", "CLUB", 104, {}), ("serif", "DIRECTORS", 120, {"gap": 0})], 0.0, 300, shine=True)
scene("s1", t0, t1, photo("assets/img2/locker.jpg", "s1bg") + ttl, z=10)
js.append('tl.fromTo("#s1bg",{scale:1.0,y:0},{scale:1.07,y:-20,duration:1.3,ease:"none"},0);')      # +3.7 %/s
js.append(f'tl.fromTo("#{re.search(r"id=.(ti[0-9]+)", ttl).group(1)}",{{scale:1}},{{scale:1.05,transformOrigin:"50% 0%",duration:1.3,ease:"none"}},0);')   # title parallax 1.4x
host(0.0, 1.30, "s1h", y=HOST_Y)
jss.append(f'tl.to("#s1h",{{y:{HOST_Y - 60},duration:1.3,ease:"none"}},0);')
whip_out("s1", 1.30)
jss.append('tl.to("#s1h",{filter:"blur(16px)",duration:0.16,ease:"power2.in"},1.14);')
whoosh(1.20, 0.24)

# =====================================================================
# S2 1.28-4.98 "a uniform company offers your club $5,000 through fundraising."  full-body salesman (Jessica-style), evolves: check pops in
# =====================================================================
t0, t1 = 1.30, 4.98
ttl = title([("cond", "A UNIFORM", 96, {}), ("serif", "COMPANY", 130, {})], 1.34, 168, exit=("up", 2.62))
ttl2 = title([("cond", "THE", 96, {}), ("serif", "$5,000 OFFER", 128, {"fpl": 2})], 2.70, 168)
man = layer("s2man", "assets/img2/salesman.png", 290, 640, 500, z=5, inner=censor("salesman.png", 500 / 760))
inner = (f'<div class="abs full" style="background:radial-gradient(ellipse at 50% 45%,#E9E6E0 0%,#C9C4BA 60%,#8F887C 100%)"></div>'
         + f'<div class="abs" style="left:230px;top:1830px;width:620px;height:80px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.28),rgba(0,0,0,0) 70%);z-index:4"></div>'
         + layer("s2chk", "assets/img2/check.png", 220, 480, 640, z=4, extra="filter:drop-shadow(0 14px 16px rgba(0,0,0,.35))") + man)
scene("s2", t0, t1, inner, z=11, over=ttl + ttl2)
enter("s2man", 1.30, dx=200, dur=0.62)
drift("s2man", 1.92, 4.98, dx=-30, ds=0.05, origin="50% 100%")
pop_in("s2chk", 2.86)
drift("s2chk", 3.10, 4.98, dy=-40, ds=0.04)
cam("s2", 1.30, 4.70, 1.08, "50% 55%", dx=-40)
js.append('tl.to("#s2cam",{scale:1.30,duration:0.28,ease:"power2.in"},4.70);')
whip_out("s2", 4.98)
pop(2.86, 0.32); sfx("shimmer", 2.95, 0.18); sfx("riser", 3.9, 0.10); whoosh(4.92, 0.2)

# =====================================================================
# S3 4.98-6.06 "Sounds amazing, right?"  talking head (big framing) with deblur in
# =====================================================================
th(4.98, 6.16, "th3", push=(1.0, 1.02))
sfx("hit", 4.98, 0.14)

# =====================================================================
# S4 6.06-9.65 "But wait, read the fine print. That $5,000 is store credit."  torn -> document + magnifier, stepped zoom, marker circle
# =====================================================================
torn(6.06, "#7A3340")
t0, t1 = 6.16, 9.65
ttl = title([("cond", "READ THE", 96, {}), ("serif", "FINE PRINT", 134, {})], 6.30, 168, exit=("up", 7.55))
doc = (f'<div id="s4doc" class="abs" style="left:90px;top:340px;width:900px;height:1247px;transform:rotate(-2deg);z-index:3">'
       f'<img class="abs" src="assets/img/doc.webp" style="left:0;top:0;width:900px;filter:drop-shadow(0 14px 18px rgba(0,0,0,.45))">'
       f'<div class="abs" style="left:140px;top:1000px;width:640px;height:62px;background:#EADBB9;box-shadow:0 0 10px 6px #EADBB9"></div>'
       f'<div id="s4line" class="abs f-mono" style="left:165px;top:1012px;font-size:38px;color:#3B2B1C;white-space:pre"></div>'
       f'</div>')
line_txt = "PAID AS STORE CREDIT ONLY"
spans = "".join(f'<span id="s4c{k}" style="opacity:0">{c}</span>' for k, c in enumerate(line_txt))
doc = doc.replace('white-space:pre"></div>', f'white-space:pre">{spans}</div>')
for k in range(len(line_txt)):
    js.append(f'tl.set("#s4c{k}",{{opacity:1}},{8.0 + (k // 3) / STEP:.4f});')
circ = marker(ellipse_d(576, 1371, 172, 42), 8.86, 0.4, w=10)
mag = layer("s4mag", "assets/img2/magnifier.png", 560, 900, 470, z=8, extra="filter:drop-shadow(0 20px 18px rgba(0,0,0,.45))")
scene("s4", t0, t1, doc + mag + f'<div id="s4circ" class="abs full" style="z-index:6">{circ}</div>', z=12, under=bg("#6E3A3A", "#4E2628"), over=ttl)
enter("s4doc", 6.16, dy=260, dur=0.5)
enter("s4mag", 6.50, dx=520, dy=200, dur=0.7)
js.append('tl.to("#s4mag",{x:-260,y:300,rotation:-8,duration:1.2,ease:"sine.inOut"},7.2); tl.to("#s4mag",{x:260,y:520,rotation:6,duration:0.5,ease:"power2.inOut"},8.4);')      # magnifier sweeps over the fine print
js.append('tl.to("#s4cam",{scale:1.4,transformOrigin:"540px 2513px",duration:0.4,ease:"power2.inOut"},7.59);')
drift("s4cam", 8.0, 9.65, ds=0.05)
whoosh(7.6, 0.16); sfx("riser", 7.1, 0.10)

# =====================================================================
# S5 9.65-12.97 "You can only spend it with them on warm-ups and jerseys."  shop window + chain & padlock slam + hanging jacket
# =====================================================================
t0, t1 = 9.65, 12.97
ttl = title([("cond", "ONLY IN", 96, {}), ("serif", "THEIR STORE", 128, {})], 9.70, 168)
inner = (photo("assets/img2/shopwin.jpg", "s5bg")
         + layer("s5jk", "assets/img/jacket.png", 660, 1010, 340, z=5, extra="filter:drop-shadow(0 18px 14px rgba(0,0,0,.45))")
         + layer("s5ch", "assets/img2/chain.png", -50, 980, 1180, z=7, extra="filter:drop-shadow(0 14px 12px rgba(0,0,0,.5))")
         + marker(ellipse_d(560, 760, 300, 150), 12.40, 0.35, w=13))
scene("s5", t0, t1, inner, z=12, over=ttl)
js.append('tl.fromTo("#s5bg",{scale:1.0},{scale:1.05,transformOrigin:"50% 50%",duration:3.3,ease:"none"},9.65);')
js.append('tl.set("#s5ch",{opacity:0},0); tl.set("#s5ch",{opacity:1},10.50); tl.from("#s5ch",{y:-900,duration:0.25,ease:"power3.in",immediateRender:false},10.50);')
swing("s5ch", 10.75, 12.97, amp=3, period=1.0, origin="50% 30%")
js.append('tl.set("#s5jk",{opacity:0},0); tl.set("#s5jk",{opacity:1},11.55);'); enter("s5jk", 11.55, dx=420, dur=0.5)
swing("s5jk", 11.9, 12.97, amp=4, period=1.2, origin="50% 0%")
sfx("hit", 10.70, 0.34); whoosh(10.5, 0.18); pop(11.58, 0.26); sfx("shutter", 9.65, 0.25)

# =====================================================================
# S6 12.97-15.14 "That money never leaves their store."  cash register rises, bills fly into the drawer
# =====================================================================
t0, t1 = 12.97, 15.14
ttl = title([("cond", "THAT MONEY", 96, {}), ("serif", "NEVER LEAVES", 124, {})], 13.00, 168, exit=("fade", 14.9))
bills = ""
for k in range(6):
    x0, y0 = rnd.randint(-200, 1100), rnd.randint(-500, -150)
    bills += layer(f"s6b{k}", "assets/img2/bill.png", x0, y0, rnd.randint(260, 380), z=7 if k % 2 else 3, extra="filter:drop-shadow(0 10px 8px rgba(0,0,0,.35))")
    tx, ty = 470 - x0 + rnd.randint(-60, 60), 1150 - y0 + rnd.randint(-40, 40)
    js.append(f'tl.fromTo("#s6b{k}",{{x:0,y:0,rotation:{rnd.randint(-40, 40)}}},{{x:{tx},y:{ty},rotation:{rnd.randint(-200, 200)},scale:0.55,duration:{0.7 + 0.1 * k:.2f},ease:"power2.in"}},{13.25 + 0.12 * k:.3f});')
    js.append(f'tl.to("#s6b{k}",{{opacity:0,duration:0.05}},{13.25 + 0.12 * k + 0.7 + 0.1 * k:.3f});')
inner = bg("#2E2224", "#7A5558") + layer("s6reg", "assets/img2/register.png", 160, 900, 760, z=5, extra="filter:drop-shadow(0 24px 20px rgba(0,0,0,.5))") + bills
scene("s6", t0, t1, inner, z=12, over=ttl)
enter("s6reg", 12.97, dy=900, dur=0.6)
drift("s6reg", 13.6, 15.14, dy=-30, ds=0.03)
js.append('tl.to("#s6reg",{scale:1.06,duration:0.08,yoyo:true,repeat:1,transformOrigin:"50% 100%"},14.20);')
cam("s6", t0, t1, 1.05)
whoosh(12.99, 0.2); sfx("kaching", 14.18, 0.30)
for k in range(3): sfx("wh2", 13.3 + 0.25 * k, 0.08)

# =====================================================================
# S7 15.14-17.23 "Now here's how fundraising with stimulus works."  talking head; title behind the head, letters drop in (reel WHAT'S NEXT?)
# =====================================================================
t0, t1 = 15.14, 17.33
th(t0, t1, "th7", push=(1.04, 1.06))
ttl = title([("cond", "FUNDRAISING WITH", 92, {}), ("serif", "STIMULUS", 132, {"fpl": 1})], 15.40, 170, appear="drop", exit=("fade", 17.0))
scene("s7", t0, t1, '<div class="abs" style="left:0;top:0;width:1080px;height:520px;background:linear-gradient(180deg,rgba(8,8,10,.92),rgba(8,8,10,.6) 45%,rgba(8,8,10,0))"></div>' + ttl, z=12, deblur=False)
host(t0, t1, "s7h", z=20, y=0, scale=1.04)
jss.append(f'tl.fromTo("#s7h",{{scale:1.04}},{{scale:1.06,transformOrigin:"50% 32%",duration:{t1 - t0:.2f},ease:"none"}},{t0:.3f});')
sfx("riser", 15.0, 0.10); sfx("hit", 16.30, 0.22)

# =====================================================================
# S8 17.23-19.73 "Our custom jerseys cost less than big name brands,"  torn -> two hanging jerseys, $89 tag struck, handwritten "less!"
# =====================================================================
torn(17.23, "#2F5B8C")
t0, t1 = 17.33, 19.73
ttl = title([("cond", "CUSTOM JERSEYS", 92, {}), ("serif", "COST LESS", 150, {})], 17.40, 168)
inner = (bg("#0E2038", "#2F5B8C")
         + layer("s8a", "assets/img/jersey.png", 40, 640, 520, z=5, extra="filter:drop-shadow(0 18px 14px rgba(0,0,0,.45))")
         + layer("s8b", "assets/img2/redjersey.png", 560, 560, 470, z=4, extra="filter:drop-shadow(0 18px 14px rgba(0,0,0,.45))")
         + marker("M 770 760 L 940 860 M 935 760 L 775 865", 18.45, 0.25, w=16)
         + f'<div id="s8hand" class="abs t-hand" style="left:600px;top:1060px;font-size:170px;color:#F4C21C;transform:rotate(-8deg);z-index:9;text-shadow:3px 4px 0 rgba(0,0,0,.35)">less!</div>')
scene("s8", t0, t1, inner, z=12, over=ttl)
enter("s8a", 17.40, dx=-500, dur=0.6); enter("s8b", 17.55, dx=500, dur=0.6)
swing("s8a", 17.9, 19.73, amp=3, period=1.4); swing("s8b", 18.0, 19.73, amp=4, period=1.2)
js.append('tl.fromTo("#s8hand",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:0.4,ease:"none"},18.75);')
cam("s8", t0, t1, 1.05)
whoosh(17.42, 0.18); sfx("scribble", 18.75, 0.28)

# =====================================================================
# S9 19.73-22.65 "and your club can add a fundraising amount to each jersey."  jersey rack + gold "+$" tags one per step, zoom burst
# =====================================================================
t0, t1 = 19.73, 22.65
ttl = title([("cond", "ADD A FUNDRAISING", 92, {}), ("serif", "AMOUNT", 170, {})], 20.20, 168)
tags = ""
spots = [(170, 1010), (330, 1120), (520, 980), (690, 1090), (850, 1000), (420, 1260)]
for k, (x, y) in enumerate(spots):
    tags += f'<div id="s9t{k}" class="tag" style="left:{x}px;top:{y}px">+$</div>'
    pop_in(f"s9t{k}", 20.80 + k * 0.17, 1.35); swing(f"s9t{k}", 21.1 + k * 0.17, t1, amp=8, period=0.9, origin="50% -40%")
    if k % 2 == 0: pop(20.80 + k * 0.17, 0.22)
scene("s9", t0, t1, photo("assets/img2/rack.jpg", "s9bg") + tags, z=12, over=ttl)
cam("s9", t0, 21.85, 1.05, "50% 60%")
for k, s in enumerate([1.08, 1.15, 1.21, 1.24, 1.28]):     # reel P20 burst: +3,+7,+6,+3,+5 % in steps
    js.append(f'tl.set("#s9cam",{{scale:{s}}},{21.92 + k / STEP:.4f});')
sfx("riser", 21.4, 0.10); sfx("hit", 21.93, 0.24); sfx("shutter", 19.73, 0.22)

# =====================================================================
# S10 22.65-24.06 "Families see the regular price,"  selective-colour family, people layer parallax, smudged landmark bars
# =====================================================================
t0, t1 = 22.65, 24.40
ttl = title([("cond", "FAMILIES SEE THE", 92, {}), ("serif", "REGULAR PRICE", 124, {"fpl": 1})], 22.66, 168)
S10 = 1.4
famb = f'<img id="s10bg" class="abs" src="assets/img2/family.jpg" style="left:-216px;top:120px;width:{1080*S10:.0f}px;z-index:1">'
famp = (f'<div id="s10p" class="abs" style="left:-216px;top:120px;width:{1080*S10:.0f}px;z-index:4"><img src="assets/img2/family_people.png" style="width:{1080*S10:.0f}px;display:block">'
        f'{censor("family.jpg", S10, skip=(3, 4, 5))}</div>')
scene("s10", t0, 24.72, famb + famp, z=12, over=ttl, under='<div class="abs full" style="background:#3a3a38"></div>')
js.append('tl.fromTo("#s10bg",{scale:1},{scale:1.02,transformOrigin:"50% 30%",duration:1.75,ease:"none"},22.65);')    # bg 0.3x
js.append('tl.fromTo("#s10p",{scale:1,y:0},{scale:1.07,y:-30,transformOrigin:"50% 30%",duration:1.75,ease:"none"},22.65);')  # subject 1.25x
sfx("shutter", t0, 0.24)

# =====================================================================
# S11 24.06-26.70 "while the fundraising markup stays private."  host rises over the photo (reel P21), dissolves into TH; title behind head
# =====================================================================
host(24.06, 26.80, "s11h", z=20, y=1100)
jss.append('tl.fromTo("#s11h",{y:1100},{y:0,duration:0.44,ease:"expo.out"},24.06);')
jss.append('tl.to("#s10",{opacity:0,duration:0.29,ease:"none"},24.42);')
th(24.06, 26.80, "th11", push=(1.0, 1.0), blur_in=False)
ttl = title([("cond", "THE MARKUP", 92, {}), ("serif", "STAYS PRIVATE", 112, {"fpl": 1})], 25.20, 170, appear="drop", exit=("fade", 26.45))
scene("s11t", 24.40, 26.80, '<div class="abs" style="left:0;top:0;width:1080px;height:520px;background:linear-gradient(180deg,rgba(8,8,10,.92),rgba(8,8,10,.6) 45%,rgba(8,8,10,0))"></div>' + ttl, z=12, deblur=False)

whoosh(24.06, 0.22); sfx("shimmer", 24.45, 0.12); sfx("hit", 25.95, 0.2)

# =====================================================================
# S12 26.70-30.92 "That extra money goes directly into your club in cash, not store credit."  raining cash into a club duffel; voucher torn in two
# =====================================================================
t0, t1 = 26.80, 30.92
ttl = title([("cond", "STRAIGHT INTO", 92, {}), ("serif", "YOUR CLUB", 150, {})], 26.80, 168, exit=("up", 28.85))
ttl2 = title([("cond", "IN", 92, {}), ("serif", "CASH", 190, {"fpl": 2})], 28.95, 168)
bills = ""
for k in range(8):
    x0 = rnd.randint(-100, 900); w = rnd.randint(200, 340); z = 8 if k % 3 == 0 else 3
    bills += layer(f"s12b{k}", "assets/img2/bill20.png", x0, -300, w, z=z, extra="filter:drop-shadow(0 10px 8px rgba(0,0,0,.35))")
    dur = 1.6 + 0.3 * (k % 3); st = 27.1 + 0.28 * k
    js.append(f'tl.fromTo("#s12b{k}",{{y:0,x:0,rotation:{rnd.randint(-30, 30)}}},{{y:{rnd.randint(1500, 1900)},x:{rnd.randint(-160, 160)},rotation:{rnd.randint(-260, 260)},duration:{dur:.2f},ease:"sine.in"}},{st:.3f});')
half = 'assets/img/voucher.png'
vou = (f'<div id="s12vL" class="abs" style="left:300px;top:1180px;width:560px;z-index:9;clip-path:polygon(0 0,52% 0,47% 30%,54% 55%,48% 100%,0 100%);transform:rotate(-6deg)"><img src="{half}" style="width:560px;filter:drop-shadow(0 10px 10px rgba(0,0,0,.45))"></div>'
       f'<div id="s12vR" class="abs" style="left:300px;top:1180px;width:560px;z-index:9;clip-path:polygon(52% 0,100% 0,100% 100%,48% 100%,54% 55%,47% 30%);transform:rotate(-6deg)"><img src="{half}" style="width:560px;filter:drop-shadow(0 10px 10px rgba(0,0,0,.45))"></div>')
inner = bg("#0E2038", "#2F5B8C") + layer("s12bag", "assets/img2/duffel.png", 110, 820, 860, z=5, extra="filter:drop-shadow(0 22px 18px rgba(0,0,0,.5))") + bills + vou
scene("s12", t0, t1, inner, z=12, over=ttl + ttl2)
enter("s12bag", 26.80, dy=900, dur=0.6); drift("s12bag", 27.4, t1, dy=-40, ds=0.04)
js.append('tl.set("#s12vL,#s12vR",{opacity:0},0); tl.set("#s12vL,#s12vR",{opacity:1},29.80);')
enter("s12vL", 29.80, dx=700, dur=0.4); enter("s12vR", 29.80, dx=700, dur=0.4)
js.append('tl.to("#s12vL",{x:-180,y:500,rotation:-28,duration:0.5,ease:"power2.in"},30.36); tl.to("#s12vR",{x:200,y:520,rotation:24,duration:0.5,ease:"power2.in"},30.36);')
cam("s12", t0, t1, 1.05)
whoosh(26.82, 0.2); sfx("kaching", 29.25, 0.22); whoosh(29.8, 0.16); sfx("rip", 30.33, 0.40)

# =====================================================================
# S13 30.92-36.24 B&W montage (reel P24-P27): field / coach / registration / huddle, rack-focus cuts, then host rises and dissolves to TH
# =====================================================================
mont = [("field", 30.92, 32.42, "field.jpg", None, 1.06), ("coach", 32.42, 33.47, "coach.jpg", "coach.jpg", 1.05),
        ("reg", 33.47, 34.62, "regtable.jpg", "regtable.jpg", 1.07), ("hud", 34.62, 36.24, "huddle.jpg", "huddle.jpg", 1.06)]
for nm, a, b, img, fk, s1 in mont:
    i = f"s13{nm}"
    bars = censor(fk, 1.0, style="solid", skip=(1,) if fk == "coach.jpg" else ((6, 8) if fk == "huddle.jpg" else ((10,) if fk == "regtable.jpg" else ()))) if fk else ""
    sc = 1920 / 1446 if img == "coach.jpg" else 1.0
    if img == "coach.jpg": bars = censor(fk, sc, style="solid", skip=(1,))
    left = -(1080 * sc - 1080) / 2; under = ""
    inner = f'<div id="{i}p" class="abs" style="left:{left:.0f}px;top:0;width:{1080*sc:.0f}px"><img src="assets/img2/{img}" style="width:{1080*sc:.0f}px;display:block">{bars}</div>'
    scene(i, a, b + 0.02, inner, z=12, under=under)
    js.append(f'tl.fromTo("#{i}p",{{scale:1}},{{scale:{s1},transformOrigin:"50% 40%",duration:{b - a:.2f},ease:"none"}},{a:.3f});')
    sfx("shutter", a, 0.26)
host(35.76, 38.72, "s13h", z=20, y=1100)
jss.append('tl.fromTo("#s13h",{y:1100},{y:0,duration:0.3,ease:"expo.out"},35.76);')
jss.append('tl.to("#s13hud",{opacity:0,duration:0.25,ease:"none"},36.00);')
whoosh(35.76, 0.22); pop(35.80, 0.18)

# =====================================================================
# S14 36.24-38.62 "Store credit buys more gear."  TH, title drops in behind the head
# =====================================================================
th(35.76, 38.72, "th14", push=(1.0, 1.0), blur_in=False)
ttl = title([("cond", "STORE CREDIT", 92, {}), ("serif", "MORE GEAR", 128, {"fpl": 1})], 36.70, 170, appear="drop", exit=("fade", 38.40))
scene("s14", 36.30, 38.72, '<div class="abs" style="left:0;top:0;width:1080px;height:520px;background:linear-gradient(180deg,rgba(8,8,10,.92),rgba(8,8,10,.6) 45%,rgba(8,8,10,0))"></div>' + ttl, z=12, deblur=False)

sfx("riser", 36.3, 0.10); sfx("hit", 37.55, 0.22)

# =====================================================================
# S15 38.62-41.90 "Cash gives your club the freedom to invest in what matters most."  champions photo, kids layer parallax, burst zoom
# =====================================================================
t0, t1 = 38.62, 41.90
ttl = title([("cond", "THE", 96, {}), ("serif", "FREEDOM", 190, {})], 38.70, 168)
inner = (photo("assets/img2/team_blur.jpg", "s15bg")
         + f'<div id="s15k" class="abs" style="left:0;top:0;width:1080px;z-index:4"><img src="assets/img2/team_kids.png" style="width:1080px;display:block">{censor("team.jpg", 1.0, style="smudge", skip=(6, 7, 8, 9))}</div>')
scene("s15", t0, t1, inner, z=12, over=ttl)
js.append('tl.fromTo("#s15bg",{scale:1.0},{scale:1.03,transformOrigin:"50% 40%",duration:3.28,ease:"none"},38.62);')
js.append('tl.fromTo("#s15k",{scale:1.0,y:30},{scale:1.08,y:-10,transformOrigin:"50% 60%",duration:2.2,ease:"none"},38.62);')
for k, s in enumerate([1.11, 1.17, 1.22, 1.25]):
    js.append(f'tl.set("#s15k",{{scale:{s}}},{40.90 + k / STEP:.4f});')
sfx("shutter", t0, 0.22); sfx("riser", 40.4, 0.10); sfx("hit", 40.90, 0.22)

# =====================================================================
# S16 41.90-46.72 TH; reframe jumps; title drops in behind the head
# =====================================================================
th(41.90, 42.84, "th16a", push=(1.0, 1.01))
th(42.84, 44.76, "th16b", push=(1.07, 1.08), blur_in=False, dy=60)
th(44.76, 46.82, "th16c", push=(1.0, 1.015), blur_in=False)
ttl = title([("cond", "YOU'RE IN", 96, {}), ("serif", "CONTROL", 136, {"fpl": 1})], 42.90, 170, appear="drop", exit=("fade", 44.55))
scene("s16", 42.84, 44.80, '<div class="abs" style="left:0;top:0;width:1080px;height:520px;background:linear-gradient(180deg,rgba(8,8,10,.92),rgba(8,8,10,.6) 45%,rgba(8,8,10,0))"></div>' + ttl, z=12, deblur=False)
host(42.84, 44.80, "s16h", z=20)
jss.append('tl.set("#s16h",{scale:1.07,y:60,transformOrigin:"50% 32%"},42.84);')
sfx("hit", 42.84, 0.16); sfx("hit", 44.76, 0.14)

# =====================================================================
# S17 46.72-50.30 "Want to see what your club could raise? Link in bio."  torn red -> fundraising thermometer fills, 4-line stacked serif
# =====================================================================
torn(46.72, "#B8312F")
t0, t1 = 46.82, END
ttl = title([("serif", "WHAT COULD", 118, {"fpl": 1, "lh": 0.92, "maxw": 540}), ("serif", "YOUR CLUB", 118, {"fpl": 1, "lh": 0.92, "maxw": 540}),
             ("serif", "RAISE?", 150, {"fpl": 1, "maxw": 540})], 46.90, 200, z=5)
ttl = ttl.replace('class="tline', 'class="tline tleft')     # left-aligned stack like NO MORE MOUNTAIN
TX = 640
therm = (f'<div id="s17th" class="abs" style="left:{TX}px;top:250px;width:380px;z-index:6;filter:drop-shadow(0 18px 16px rgba(0,0,0,.45))">'
         f'<img src="assets/img2/thermo.png" style="width:380px;display:block">'
         f'<div id="s17fill" class="abs" style="left:{232*380/560:.0f}px;width:{46*380/560:.0f}px;top:{216*380/560:.0f}px;height:{(1480-216)*380/560:.0f}px;background:#C9221F;transform-origin:50% 100%;border-radius:12px"></div>'
         f'<div class="abs" style="left:{(250-104)*380/560:.0f}px;top:{(1585-104)*380/560:.0f}px;width:{208*380/560:.0f}px;height:{208*380/560:.0f}px;border-radius:50%;background:#C9221F"></div></div>')
scene("s17", t0, t1, therm, z=12, under=f'<div class="abs full" style="background:linear-gradient(180deg,#B8312F,#7E1F22)"></div><div class="ht"></div><div class="vig"></div>', over=ttl)
js.append('tl.fromTo("#s17fill",{scaleY:0.02},{scaleY:0.98,duration:1.4,ease:"power2.inOut"},47.55);')
js.append(f'tl.from("#s17th",{{x:330,duration:0.4,ease:"expo.out",immediateRender:true}},46.82);')
drift("s17th", 47.3, 49.8, dy=-30)
js.append('tl.to("#s17th",{y:"+=1400",duration:0.35,ease:"power2.in"},49.90);')
cam("s17", t0, t1, 0.94, "50% 50%")                         # reel red collage: slow pull-out
for k in range(7): tick(47.6 + k * 0.2, 0.09)
sfx("shimmer", 48.95, 0.14); whoosh(49.92, 0.18)

# ---------------- captions: smaller pill, progressive word fill ----------------
words = json.loads((R / "prep/words_edit.json").read_text(encoding="utf-8"))["words"]
W = []
for w in words:
    if W and (w["w"].startswith(",") or w["w"].startswith("-")): W[-1]["w"] += w["w"]; W[-1]["e"] = w["e"]
    else: W.append(dict(w))
chunks, cur = [], []
for w in W:
    cur.append(w); txt = " ".join(x["w"] for x in cur)
    if w["w"][-1] in ".,?!" or len(cur) >= 4 or len(txt) > 24: chunks.append(cur); cur = []
if cur: chunks.append(cur)
CAP_SWITCH = 24.40      # pill at y 44 % during the graphics run, 72 % from the talking head on (reel f587)
cap = []
for k, ch in enumerate(chunks):
    cs = max(0, ch[0]["s"] - 0.06); ce = min(END, chunks[k + 1][0]["s"] - 0.06 if k + 1 < len(chunks) else END)
    txt = " ".join(x["w"] for x in ch); wpx = CAPF.getlength(txt) + 2 * 32
    TH_SPANS = [(4.98, 6.16), (15.14, 17.33), (24.06, 26.80), (35.76, 38.72), (41.90, 46.82)]
    mid = (ch[0]["s"] + ch[-1]["e"]) / 2
    top = 1384 - 43 if any(a <= mid < b for a, b in TH_SPANS) else 900 - 43
    spans = []
    for x in ch:
        i = nid("cw"); d = min(0.4, max(0.12, x["e"] - x["s"]))
        spans.append(f'<span id="{i}" style="color:{CAP_UP}">{x["w"]}</span>')
        jss.append(f'tl.fromTo("#{i}",{{color:"{CAP_UP}"}},{{color:"{CAP_DONE}",duration:{d:.2f},ease:"power1.inOut"}},{max(0, x["s"] - 0.04):.3f});')
    cap.append(f'<div id="{nid("cap")}" class="clip cap" data-start="{cs:.3f}" data-duration="{ce - cs:.3f}" data-track-index="5" style="left:{540 - wpx/2:.0f}px;width:{wpx:.0f}px;top:{top}px">{" ".join(spans)}</div>')
html.append(f'<div id="caps" data-track-kind="captions" style="position:absolute;inset:0;z-index:80">{"".join(cap)}</div>')

# ---------------- outro ----------------
html.append(f'<div id="outro-w" style="position:absolute;inset:0;z-index:90"><video id="v-outro" class="clip" data-start="{END}" data-duration="{OUTRO}" data-track-index="7" src="assets/outro.mp4" muted playsinline style="width:1080px;height:1920px"></video></div>')
jss.append(f'tl.fromTo("#outro-w",{{x:1080}},{{x:0,duration:0.3,ease:"power2.out"}},{END});')
whoosh(END, 0.22)
aud.insert(0, f'<audio id="voice" class="clip" data-start="0" data-duration="{END:.2f}" data-track-index="8" src="assets/voice.wav" data-volume="1"></audio>')
aud.insert(1, f'<audio id="music" class="clip" data-start="0" data-duration="{END + 0.3:.2f}" data-media-start="0" data-track-index="10" src="assets/music.wav" data-volume="0.11" data-fade-out="0.5"></audio>')
aud.insert(2, f'<audio id="music-out" class="clip" data-start="{END}" data-duration="{OUTRO}" data-media-start="{END}" data-track-index="11" src="assets/music.wav" data-volume="0.28" data-fade-in="0.4" data-fade-out="0.5"></audio>')

# ---- 12 fps step clock for graphics; per-letter wiggle driven by the same clock ----
def snap(v, mn=0.0): return max(mn, round(float(v) * STEP) / STEP)
def snap_line(l):
    l = re.sub(r'duration:([0-9.]+)', lambda m: f'duration:{snap(m.group(1), 1/STEP) if float(m.group(1)) > 0.02 else float(m.group(1)):.4f}', l)
    l = re.sub(r'\},(-?[0-9.]+)\);', lambda m: f'}},{snap(m.group(1)):.4f});', l)
    return l
js = [snap_line(l).replace("tl.", "tlg.") for l in js]
CSS = (R / "prep/style2.css").read_text(encoding="utf-8")
STEPJS = f"""
// graphics: 12 fps step clock (reel measured 10, user asked 12). Wiggle: every letter gets a new random pose each step
// (reel: offset std ~3 px x / 2 px y, rotation std 1.6 deg, 76-94 % of letters move per step).
var __wg = Array.prototype.slice.call(document.querySelectorAll('.wg'));
function __h(a) {{ a = (a ^ 61) ^ (a >>> 16); a = a + (a << 3); a = a ^ (a >>> 4); a = Math.imul(a, 0x27d4eb2d); a = a ^ (a >>> 15); return (a >>> 0) / 4294967295; }}
function __wiggle(step) {{
  for (var i = 0; i < __wg.length; i++) {{
    var e = __wg[i], s = +e.getAttribute('data-s'), A = +e.getAttribute('data-a');
    var r1 = __h(s * 7919 + step * 104729), r2 = __h(s * 31337 + step * 7477), r3 = __h(s * 524287 + step * 3571);
    e.style.transform = 'translate(' + ((r1 - .5) * 2 * A).toFixed(2) + 'px,' + ((r2 - .5) * 1.4 * A).toFixed(2) + 'px) rotate(' + ((r3 - .5) * 2 * A * 0.6).toFixed(2) + 'deg)';
  }}
}}
var __drv = {{v: 0}};
tl.to(__drv, {{v: 1, duration: {TOTAL}, ease: function (p) {{ var st = Math.floor(p * {TOTAL} * {STEP} + 1e-6); tlg.totalTime(st / {STEP}, true); __wiggle(st); return p; }}}}, 0);
"""
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
{chr(10).join(jss)}
{STEPJS}
window.__timelines["main"] = tl;
</script>
</body></html>"""
(R / "index.html").write_text(page, encoding="utf-8")
print("ok", TOTAL, len(html), "nodes", len(js) + len(jss), "tweens", len(aud), "audio", len(chunks), "captions")

"""docucollage final render, step 2: HyperFrames composition (index.html) around the graphics track from render3c.py.
Stack: TH video (z5) -> gfx3c.webm (12 fps graphics, z10) -> host cutout (z20) -> karaoke captions (z80) -> outro (z90).
Audio: voice + music bed (A La Mode 0.11) + SFX on the v3c events (ESTILO.md "Sonido").
python prep/gen3.py && npx --yes hyperframes@0.9.16 check && npx --yes hyperframes@0.9.16 render -o renders/docucollage-v3c.mp4
Template: for a new reel change TH / HOST / CAP_Y / SFX (event times) and the shot list in render3c.py."""
import json
from pathlib import Path
from PIL import ImageFont

R = Path(__file__).resolve().parent.parent
END = 50.30; OUTRO = 2.336; TOTAL = round(END + OUTRO, 3)
CAP_UP, CAP_DONE = "#CFC8B6", "#1B1B1B"
CAPF = ImageFont.truetype(str(R / "assets/fonts/Poppins-Bold.ttf"), 44)
html, jss, aud = [], [], []
_id = [0]
def nid(p="e"):
    _id[0] += 1; return f"{p}{_id[0]}"

# ---------------- sound ----------------
_rot = {}
def sfx(name, t, vol):
    aud.append(f'<audio id="{nid("s")}" class="clip" data-start="{max(0, t):.3f}" data-track-index="{20 + len(aud)}" src="assets/sfx/{name}.wav" data-volume="{vol}"></audio>')
def rot(kind, n, t, vol):
    k = _rot.get(kind, 0); _rot[kind] = k + 1; sfx(f"{kind}{k % n + 1}", t, vol)
def pop(t, v=0.28): rot("pop", 3, t, v)
def whoosh(t, v=0.24): rot("wh", 3, t - 0.06, v)
def typing(a, b, v=0.07):          # title typing: soft key ticks on the 12 fps steps
    t = a
    while t < b: rot("key", 3, t, v); t += 2 / 12

# ---------------- videos (each <video> in its own root-level wrapper) ----------------
def video(t0, t1, src, wid, z, media=None, extra=""):
    html.append(f'<div id="{wid}" class="abs full" style="z-index:{z};{extra}"><video id="{nid("v")}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" '
                f'data-media-start="{(media if media is not None else t0):.3f}" data-track-index="1" src="{src}" muted playsinline style="position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover"></video></div>')
WIDE = '{x:-445.5,y:-904.2,scale:1.65,transformOrigin:"0% 0%"}'     # board tht_/cot_ framing = edit.mp4 cropped at (270,548) x1.65 (fitted, err 6/255)
def th(t0, t1, wid, blur_in=True, dim=False, wide=False):
    """wide = original edit framing (head lower, room for a title behind it: board tht_/cot_); else the big Ali framing (th_big)"""
    video(t0, t1, "assets/edit.mp4" if wide else "assets/th_big.mp4", wid, 5)
    if wide: jss.append(f'tl.set("#{wid}",{WIDE},{t0:.3f});')
    if dim:      # plain TH: short dark top band (the title shots carry their own feathered dim inside gfx)
        html.append(f'<div id="{nid("thd")}" class="clip" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="4" style="position:absolute;left:0;top:0;width:1080px;height:300px;z-index:6;background:linear-gradient(180deg,rgba(6,6,8,.9),rgba(6,6,8,.6) 35%,rgba(6,6,8,0))"></div>')
    if blur_in:  # ref: hard cut + deblur in ~6 frames
        b = nid("bl"); video(t0, min(t1, t0 + 0.4), "assets/th_blur.mp4" if wide else "assets/th_big_blur.mp4", b, 6)
        jss.append(f'tl.fromTo("#{b}",{{opacity:1}},{{opacity:0,duration:0.26,ease:"power2.out"}},{t0:.3f});')
        if wide: jss.append(f'tl.set("#{b}",{WIDE},{t0:.3f});')

# talking heads (edit timeline); each runs 0.12 s past its cut so the 12 fps graphics track never uncovers black;: big framing th_big + cutout_big; wide framing edit.mp4 + cutout_fix (+ th_blur) for titles behind the head
th(4.98, 6.18, "th05", dim=True)
th(15.14, 17.45, "th09", wide=True)
th(36.00, 38.74, "th21", blur_in=False, wide=True)          # appears under the S20 collage while it dissolves (gfx alpha 1 -> 0 at 36.08-36.24)
th(41.90, 46.84, "th23", wide=True)
# host cutouts in front of the graphics / titles
video(0.0, 2.80, "assets/cutout_big.webm", "h01", 20); jss.append('tl.set("#h01",{y:740},0);')                    # host low, collage behind (S01-S02)
video(15.14, 17.33, "assets/cutout_fix.webm", "h09", 20); jss.append(f'tl.set("#h09",{WIDE},15.14);')                                                          # head in front of the S09 title
video(35.80, 36.30, "assets/cutout_s20.webm", "h20", 20, media=0.05); jss.append(f'tl.set("#h20",{WIDE},35.80);'); jss.append('tl.fromTo("#h20",{y:345.8},{y:-904.2,duration:0.30,ease:"expo.out"},35.80);')   # S20 rise: alpha-hardened clip (ball fully opaque over the collage)
video(36.30, 38.62, "assets/cutout_fix.webm", "h21", 20)                                                          # S20: host rises over the frozen collage
jss.append(f'tl.set("#h21",{WIDE},36.30);')                             # ref P27: decay x0.7/f, no overshoot
video(41.90, 46.72, "assets/cutout_fix.webm", "h23", 20); jss.append(f'tl.set("#h23",{WIDE},41.90);')
for w in ("th23", "h23"):                                                                                          # S23 jump cuts: +80 px, +2 %
    jss.append(f'tl.set("#{w}",{{x:-465.2,y:-853.8,scale:1.683,transformOrigin:"0% 0%"}},42.84);')     # jump: +2 % about the head, +80 px
    jss.append(f'tl.set("#{w}",{WIDE},44.76);')
jss.append('tl.fromTo("#th05",{scale:1.0,transformOrigin:"50% 30%"},{scale:1.03,duration:1.08,ease:"none"},4.98);')
# graphics track (12 fps, alpha) over everything below the host
video(0.0, END, "assets/gfx3c.webm", "gfx", 10, media=0.0)

# ---------------- captions: cream pill, 2-state karaoke fill, y per shot (board v3c) ----------------
CAP_Y = [(0, 2.80, 900), (2.80, 4.98, 900), (4.98, 6.06, 1384), (6.06, 9.65, 1384), (9.65, 15.14, 1500), (15.14, 19.73, 1384), (19.73, 24.06, 900),
         (24.06, 26.70, 1384), (26.70, 28.85, 900), (28.85, 30.92, 1384), (30.92, 32.42, 900), (32.42, 38.62, 1384), (38.62, 41.90, 1500), (41.90, END + 1, 1384)]
words = json.loads((R / "prep/words_edit.json").read_text(encoding="utf-8"))["words"]
Wd = []
for w in words:
    if Wd and (w["w"].startswith(",") or w["w"].startswith("-")): Wd[-1]["w"] += w["w"]; Wd[-1]["e"] = w["e"]
    else: Wd.append(dict(w))
chunks, cur = [], []
for w in Wd:
    cur.append(w); txt = " ".join(x["w"] for x in cur)
    if w["w"][-1] in ".,?!" or len(cur) >= 4 or len(txt) > 24: chunks.append(cur); cur = []
if cur: chunks.append(cur)
cap = []
for k, ch in enumerate(chunks):
    cs = max(0, ch[0]["s"] - 0.06); ce = min(END, chunks[k + 1][0]["s"] - 0.06 if k + 1 < len(chunks) else END)
    txt = " ".join(x["w"] for x in ch); wpx = CAPF.getlength(txt) + 2 * 32
    mid = (ch[0]["s"] + ch[-1]["e"]) / 2; y = next(c for a, b, c in CAP_Y if a <= mid < b)
    spans = []
    for x in ch:
        i = nid("cw"); d = min(0.4, max(0.12, x["e"] - x["s"]))
        spans.append(f'<span id="{i}" style="color:{CAP_UP}">{x["w"]}</span>')
        jss.append(f'tl.fromTo("#{i}",{{color:"{CAP_UP}"}},{{color:"{CAP_DONE}",duration:{d:.2f},ease:"power1.inOut"}},{max(0, x["s"] - 0.04):.3f});')
    cap.append(f'<div id="{nid("cap")}" class="clip cap" data-start="{cs:.3f}" data-duration="{ce - cs:.3f}" data-track-index="5" style="left:{540 - wpx/2:.0f}px;width:{wpx:.0f}px;top:{y - 43}px">{" ".join(spans)}</div>')
html.append(f'<div id="caps" data-track-kind="captions" style="position:absolute;inset:0;z-index:80">{"".join(cap)}</div>')

# ---------------- outro ----------------
html.append(f'<div id="outro-w" style="position:absolute;inset:0;z-index:90"><video id="v-outro" class="clip" data-start="{END}" data-duration="{OUTRO}" data-track-index="7" src="assets/outro.mp4" muted playsinline style="width:1080px;height:1920px"></video></div>')
jss.append(f'tl.fromTo("#outro-w",{{x:1080}},{{x:0,duration:0.3,ease:"power2.out"}},{END});')

# ---------------- SFX on the v3c events ----------------
whoosh(1.28, 0.2);                                  # S01/S02: slide, shines
typing(0.10, 0.85); typing(1.38, 2.10)
whoosh(2.80, 0.2); sfx("scribble", 2.92, 0.30); sfx("riser", 3.45, 0.10); pop(4.16, 0.30); sfx("kaching", 4.18, 0.22); pop(4.24, 0.22); sfx("hit", 4.40, 0.14)   # S03/S04
sfx("hit", 4.98, 0.14)                                                                                       # S05 cut to TH
whoosh(6.06, 0.2); sfx("rip", 6.10, 0.22); sfx("scribble", 8.40, 0.26); sfx("shutter", 9.40, 0.14)        # S06 agreement + red ring
whoosh(9.65, 0.18); typing(9.75, 10.65)
for k in range(6): pop(10.25 + k * 0.16, 0.18)                                                               # S07 jerseys hop on
whoosh(12.97, 0.2); typing(13.07, 13.75)
for k in range(6): pop(13.10 + k * 0.10, 0.16)
whoosh(13.85, 0.16); sfx("kaching", 14.20, 0.24)                                                             # S08 arm + money
sfx("riser", 14.85, 0.08); sfx("hit", 15.14, 0.16); typing(15.24, 16.25); sfx("hit", 16.25, 0.14)          # S09 TH title
sfx("rip", 17.29, 0.40); whoosh(17.33, 0.14); pop(17.40, 0.26); typing(17.43, 17.95)                        # S10 torn paper + sun
sfx("shutter", 19.73, 0.2); sfx("riser", 19.95, 0.10); whoosh(20.23, 0.22); typing(20.68, 21.70);   # S11 burst + title
sfx("shutter", 22.65, 0.18); typing(22.75, 23.05); sfx("hit", 23.28, 0.16); typing(23.38, 23.70)          # S12 / S12b punch-in
whoosh(24.06, 0.2); typing(24.14, 25.25);                                       # S13
whoosh(26.70, 0.18); sfx("hit", 26.86, 0.24); typing(26.80, 27.85)                                           # S14 ball drop
whoosh(28.85, 0.18); typing(28.95, 30.00); sfx("rip", 30.86, 0.30)                                           # S15 (+ exit strip)
whoosh(30.92, 0.2); typing(31.22, 31.75);                                        # S16
sfx("shutter", 32.42, 0.18); typing(32.52, 33.10)                                                            # S17
whoosh(33.47, 0.18); sfx("scribble", 33.57, 0.24)                                                            # S18 hand words
pop(35.14, 0.24); typing(35.24, 35.55)                                                                       # S19
whoosh(35.80, 0.24); pop(35.88, 0.22)                                                                        # S20 host rises
typing(36.34, 37.10); sfx("hit", 37.12, 0.16)                                                               # S21
sfx("rip", 38.58, 0.40); whoosh(38.62, 0.14); pop(39.04, 0.22); sfx("hit", 39.30, 0.26); typing(39.45, 39.75);   # S22
sfx("hit", 42.84, 0.16); typing(42.84, 43.45); sfx("hit", 44.76, 0.14)                                     # S23 jump cuts
sfx("rip", 46.68, 0.40); pop(46.74, 0.24); typing(47.12, 47.75);               # S24
whoosh(49.05, 0.2); typing(49.13, 49.60); whoosh(END, 0.22)                   # LINK IN BIO, outro
aud.insert(0, f'<audio id="voice" class="clip" data-start="0" data-duration="{END:.2f}" data-track-index="8" src="assets/voice.wav" data-volume="1"></audio>')
aud.insert(1, f'<audio id="music" class="clip" data-start="0" data-duration="{END + 0.3:.2f}" data-media-start="0" data-track-index="10" src="assets/music.wav" data-volume="0.11" data-fade-out="0.5"></audio>')
aud.insert(2, f'<audio id="music-out" class="clip" data-start="{END}" data-duration="{OUTRO}" data-media-start="{END}" data-track-index="11" src="assets/music.wav" data-volume="0.28" data-fade-in="0.4" data-fade-out="0.5"></audio>')

CSS = (R / "prep/style2.css").read_text(encoding="utf-8")
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
{chr(10).join(jss)}
window.__timelines["main"] = tl;
</script>
</body></html>"""
(R / "index.html").write_text(page, encoding="utf-8")
print("ok", TOTAL, len(html), "nodes", len(jss), "tweens", len(aud), "audio", len(chunks), "captions")

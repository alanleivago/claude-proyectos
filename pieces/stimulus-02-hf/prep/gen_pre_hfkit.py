"""Writes index.html (HyperFrames) for Stimulus 01 from the word timings + the beat plan below.

Markup in caption lines:  ^red^  ~green~  (whole line italic+cream when style "it")
Run: python prep/gen.py   then  npx hyperframes check / snapshot / render
"""
import html, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = json.loads((ROOT / "prep/words_edit.json").read_text())
words, segs, D = W["words"], W["segments"], W["duration"]
OUTRO = 2.336   # outro.mp4 trimmed: first 2 frames had a sliver of the previous clip
TOTAL = round(D - 0.3 + OUTRO, 3)
ws = lambda i: words[i]["s"]
we = lambda i: words[i]["e"]

# ---------------- beat plan (video 2: bulk order vs team store) ----------------
HOOK = dict(end_word=10)
# blocks: (first word, [(line text, style, word where the line appears)], icons [(name, word)])
# style: w | it | big (gold + yellow line) | caps (uppercase gradient + RGB) | sep (glowing separator)
BLOCKS = [
    (4, [("BULK ORDER", "caps", 4), ("or", "orw", 6), ("TEAM STORE", "caps", 7)], []),
    (11, [("and you're spending", "w", 11), ("your weekend", "it", 14)], []),
    (16, [("SORTING JERSEYS", "caps", 16), ("in the garage.", "it", 18)], [("shirt", 17)]),
    (21, [("Here's how to pick", "w", 21), ("", "sep", 25), ("THE RIGHT PLAN", "caps", 25)], []),
    (31, [("First,", "w", 31), ("BULK ORDER", "big", 32)], []),
    (34, [("The coach orders", "w", 34), ("for everyone,", "it", 37)], [("clipboard-list", 36)]),
    (42, [("one sheet,", "w", 42), ("", "sep", 44), ("ONE BOX", "caps", 44), ("ships to you.", "it", 46)], [("package", 45), ("truck", 46)]),
    (49, [("Great when", "w", 49), ("~the club pays,~", "it", 52)], [("wallet", 54)]),
    (55, [("rosters are small", "w", 55), ("and you're", "w", 59), ("^pressed for time.^", "it", 61)], [("users", 56), ("clock", 62)]),
    (64, [("Second,", "w", 64), ("TEAM STORE", "big", 66)], []),
    (68, [("each player orders", "w", 68), ("their own online.", "it", 71)], [("smartphone", 72)]),
    (74, [("It ships right", "w", 74), ("", "sep", 77), ("TO THEIR DOOR", "caps", 77)], [("truck", 79)]),
    (80, [("Great when", "w", 80), ("~families pay,~", "it", 83)], [("users", 84)]),
    (85, [("the club's big", "w", 85), ("or players join", "it", 88), ("mid-season.", "it", 91)], []),
    (94, [("Want the quick test?", "w", 94)], [("zap", 96)]),
    (98, [("Ask yourself", "w", 98), ("THREE QUESTIONS", "caps", 100)], []),
    # numbered list 102-133 (own element); the block above stays as its header
    (134, [("Small order, club pays,", "w", 134), ("you hand them out:", "it", 138), ("GO BULK", "big", 142)], []),
    (144, [("Big order, families pay,", "w", 144), ("shipped to their door:", "it", 148), ("TEAM STORE", "big", 152)], []),
    (155, [("Three questions", "w", 155), ("that save you", "it", 157), ("HOURS", "big", 161)], []),
    (162, [("of ^sorting,^", "w", 162), ("^chasing payments^", "it", 164), ("^& swapping sizes.^", "it", 166)], [("shirt", 163), ("wallet", 165), ("arrow-left-right", 167)]),
]
LH = {"w": 110, "it": 102, "big": 200, "caps": 108, "sep": 36}   # line heights (px) -> icon row sits under the block
FS = {"w": 86, "it": 82, "caps": 94}   # caption sizes; any line wider than 960 px is scaled down to fit
ICON_GAP = 30   # last baseline -> icon ink = same air as between caption lines (~52 px incl. the icon's own padding)
LIST_HEAD, LIST_END = 98, 134            # header block word, word where the list leaves
CHECKS = [(102, "How many uniforms?"), (110, "Sizes & payments?"), (118, "Hand out or ship?")]
NUMBERED = True
CTA = [(169, "Still not sure?", "w"), (172, "Tell us your club size,", "w"), (177, "we'll pick for you.", "it"), (186, "Link in bio.", "big")]
BURN_OPACITY = 0.38
BURN_CUTS = [1, 2, 8, 12]   # which real cuts (index in cut list) get a film burn
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]   # (duration, peak offset) of assets/burnN.mp4
# camera: hard scale change on real cuts AND on these sentence starts; eased zoom-ins on the ZMOVES words
HARD = [21, 31, 49, 64, 80, 94, 102, 110, 118, 134, 144, 155, 169]
ZOOM = [1.16, 1.27, 1.17, 1.28, 1.18, 1.27, 1.16, 1.28, 1.27, 1.17, 1.28, 1.16, 1.27, 1.18]
ZMOVES = [4, 9, 13, 16, 25, 32, 36, 44, 52, 56, 61, 66, 70, 77, 83, 87, 96, 100, 104, 113, 122, 128, 136, 142, 146, 152, 157, 161, 165, 172, 186]
ZSTEP, ZDUR, ZMAX = 0.09, 0.9, 1.42
RISERS = [(9, "riser_fast", 1.1), (32, "riser_fast", 1.1), (66, "riser_fast", 1.1), (100, "riser_fast", 1.1), (186, "riser_fast", 1.1)]

# ---------------- helpers ----------------
def fmt(t):
    e = html.escape(t)
    out, mode = "", None
    for ch in e:
        if ch in "^~":
            if mode == ch:
                out += "</span>"; mode = None
            else:
                out += f'<span class="{"red" if ch == "^" else "grn"}">'; mode = ch
        else:
            out += ch
    return out

parts, tw, audio = [], [], []
z_cap, n = 50, [0]
def nid(p):
    n[0] += 1; return f"{p}{n[0]}"

def fit(txt, sz, maxw=960):
    w = ink(txt, sz)[1] * 1.04
    return sz if w <= maxw else int(sz * maxw / w)

def blur_in(sel, t, dur=0.34, y=38):
    tw.append(f'tl.fromTo("{sel}",{{opacity:0,filter:"blur(12px)",y:{y}}},{{opacity:1,filter:"blur(0px)",y:0,duration:{dur},ease:"power3.out"}},{t:.3f});')

def sfx(name, t, vol):
    i = nid("s")
    audio.append(f'<audio id="{i}" class="clip" data-start="{max(t,0):.3f}" data-track-index="9" src="assets/sfx/{name}.wav" data-volume="{vol}"></audio>')

# ---------------- hook: COACHES & CLUB / DIRECTORS behind the head, BULK ORDER | TEAM STORE flanking it, PICK WRONG in the caption zone ----------------
h_end = ws(13) + 0.1   # PICK WRONG holds ~0.9 s, the next caption waits for it
def bigword(eid, txt, t0, t1, top, size, left=0, width=1080, align="center", z=2, fill="gfill"):
    rgb = "" if fill != "gfill" else (f'<span class="rgb r" data-layout-allow-occlusion>{txt}</span><span class="rgb c" data-layout-allow-occlusion>{txt}</span>')
    parts.append(f'''<div id="{eid}" class="clip bw" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="2" style="z-index:{z};left:{left}px;top:{top}px;width:{width}px" data-layout-allow-overlap>
  <div class="bwin" style="font-size:{size}px;line-height:{int(size * 1.15)}px;text-align:{align};width:{width}px" data-layout-allow-occlusion data-layout-allow-overlap>{rgb}<span class="{fill}">{txt}</span></div></div>''')
    tw.append(f'tl.fromTo("#{eid} .bwin",{{opacity:0,scale:1.18,filter:"blur(16px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.32,ease:"power3.out"}},{t0:.3f});')
    tw.append(f'tl.to("#{eid} .bwin",{{opacity:0,filter:"blur(14px)",duration:0.28,ease:"power2.in"}},{t1 - 0.3:.3f});')
from PIL import ImageFont
def ink(txt, sz):   # (left side bearing, ink width) with letter-spacing -0.02em
    b = ImageFont.truetype(str(ROOT / "assets/fonts/din-bold.ttf"), sz).getbbox(txt, anchor="ls")
    return b[0], b[2] - b[0] - (len(txt) - 1) * 0.02 * sz
def top_for(sz, base): return base - round((int(sz * 1.15) - 1.47 * sz) / 2 + 1.2 * sz)   # DIN asc 1.2 / desc .27 -> baseline on `base`
# 1) COACHES & CLUB (white kicker) over DIRECTORS (huge): same left ink edge, margins on both sides
K_SZ, DIR_SZ = 100, 190
lsb_d, w_d = ink("DIRECTORS", DIR_SZ); lsb_k, _ = ink("COACHES & CLUB", K_SZ)
x_ink = (1080 - w_d) / 2
d_end = ws(9) - 0.04
kx = x_ink - lsb_k
for eid, txt, wi in [("hk-k1", "COACHES", 0), ("hk-k2", "&amp;", 1), ("hk-k3", "CLUB", 2)]:   # each word appears as he says it
    raw = txt.replace("&amp;", "&")
    bigword(eid, txt, max(ws(wi) - 0.04, 0.05), d_end, top_for(K_SZ, 472), K_SZ, left=round(kx), width=600, align="left", z=2, fill="wfill")   # above the matte: the neon logo leaks into it
    kx += ink(raw, K_SZ)[1] + K_SZ * 0.24
bigword("hk-dir", "DIRECTORS", ws(3) - 0.04, d_end, top_for(DIR_SZ, 645), DIR_SZ, left=round(x_ink - lsb_d), width=1000, align="left")
# 2) BULK ORDER / or / TEAM STORE go in the caption zone (block 4), the title stays behind the head until PICK WRONG
# 3) PICK WRONG: big red key words in the caption zone with the yellow line, exactly on "pick"
pw = ws(9) - 0.03
parts.append(f'''<div id="pickw" class="clip bw" data-start="{pw:.3f}" data-duration="{h_end - pw:.3f}" data-track-index="3" style="z-index:{z_cap};left:0;top:1050px;width:1080px" data-layout-allow-overlap>
  <div class="bwin" style="font-size:170px;line-height:190px;text-align:center;width:1080px" data-layout-allow-occlusion data-layout-allow-overlap><span class="rgb r" data-layout-allow-occlusion>PICK WRONG</span><span class="rgb c" data-layout-allow-occlusion>PICK WRONG</span><span class="gfill">PICK WRONG</span></div>
  <div class="gline" style="left:220px;top:212px;width:640px"></div></div>''')
tw.append(f'tl.fromTo("#pickw .bwin",{{opacity:0,y:38,filter:"blur(12px)"}},{{opacity:1,y:0,filter:"blur(0px)",duration:0.34,ease:"power3.out"}},{pw:.3f});')
tw.append(f'tl.fromTo("#pickw .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{pw + 0.15:.3f});')
tw.append(f'tl.to("#pickw .bwin, #pickw .gline",{{opacity:0,filter:"blur(14px)",duration:0.25,ease:"power2.in"}},{h_end - 0.25:.3f});')

# ---------------- caption blocks ----------------
starts = [ws(b[0]) for b in BLOCKS]
list_start, cta_start = ws(LIST_HEAD), ws(CTA[0][0])
for k, (w0, lines, icons) in enumerate(BLOCKS):
    t0 = ws(w0) - 0.05 if w0 != 11 else h_end
    nxt = [s for s in starts[k + 1:]] + [cta_start]
    t1 = min(nxt[0] - 0.07, we(max(l[2] for l in lines)) + 2.2)
    if w0 == LIST_HEAD: t1 = ws(LIST_END) - 0.1   # list header stays above the list
    if w0 == 4: t1 = pw - 0.03   # hand over to PICK WRONG
    cid = nid("cap")
    inner = ""
    for j, (txt, st, wl) in enumerate(lines):
        lid, tj = f"{cid}-{j}", max(ws(wl) - 0.05, t0)
        if st == "big":   # key word: gold gradient + feathered RGB + yellow line, pops like the $5,000
            inner += (f'<div class="ln bigw" id="{lid}"><div class="bwin" data-layout-allow-occlusion data-layout-allow-overlap>'
                      f'<span class="rgb r" data-layout-allow-occlusion>{txt}</span><span class="rgb c" data-layout-allow-occlusion>{txt}</span>'
                      f'<span class="gfill">{txt}</span></div><div class="gline biggl"></div></div>')
            tw.append(f'tl.fromTo("#{lid} .bwin",{{opacity:0,y:38,filter:"blur(12px)"}},{{opacity:1,y:0,filter:"blur(0px)",duration:0.34,ease:"power3.out"}},{tj:.3f});')
            tw.append(f'tl.fromTo("#{lid} .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{tj + 0.12:.3f});')
        elif st == "caps":   # ref look: uppercase, white->cream gradient, visible feathered RGB split
            inner += (f'<div class="ln capw" id="{lid}"><div class="bwin" style="font-size:{fit(txt, FS["caps"])}px" data-layout-allow-occlusion data-layout-allow-overlap>'
                      f'<span class="rgb r" data-layout-allow-occlusion>{txt}</span><span class="rgb c" data-layout-allow-occlusion>{txt}</span>'
                      f'<span class="gfill">{txt}</span></div></div>')
            blur_in(f"#{lid}", tj)
        elif st == "sep":
            inner += f'<div class="sepw" id="{lid}"><div class="gline sep"></div></div>'
            tw.append(f'tl.fromTo("#{lid} .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{tj:.3f});')
        else:
            orw = st == "orw"
            if orw: st = "it"
            cls = "ln it orw" if orw else ("ln it" if st == "it" else "ln")
            body = f'<span class="cream">{fmt(txt)}</span>' if st == "it" and "^" not in txt and "~" not in txt and not orw else fmt(txt)
            sz = fit(txt.replace("^", "").replace("~", ""), FS[st]) + (6 if "^" in txt else 0)   # red text a bit bigger so it reads
            inner += f'<div class="{cls}" id="{lid}" style="font-size:{sz}px">{body}</div>'
            blur_in(f"#{lid}", tj)
    top = 960 if w0 == LIST_HEAD else (1000 if icons else 1060)   # icon blocks sit higher so icons clear the ball
    parts.append(f'<div id="{cid}" class="clip cap" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="3" style="z-index:{z_cap};top:{top}px">{inner}</div>')
    for m, (ic, wi) in enumerate(icons):
        iid = nid("ic")
        x = 540 + (m - (len(icons) - 1) / 2) * 175 - 65
        ti = ws(wi)
        parts.append(f'<div id="{iid}" class="clip icon" data-start="{ti:.3f}" data-duration="{t1 - ti:.3f}" data-track-index="4" style="z-index:51;left:{x:.0f}px;top:{top + sum(LH[l[1]] for l in lines) + ICON_GAP}px"><img src="assets/icons/{ic}.svg" alt=""></div>')
        tw.append(f'tl.fromTo("#{iid} img",{{opacity:0,y:38,filter:"blur(12px)"}},{{opacity:1,y:0,filter:"blur(0px)",duration:0.34,ease:"power3.out"}},{ti:.3f});')

# ---------------- checklist ----------------
c_end = ws(LIST_END) - 0.1
items = ""
for k, (wi, txt) in enumerate(CHECKS):
    items += f'<div class="chk" id="chk{k}"><span class="dot">{f'<b class="num">{k + 1}</b>' if NUMBERED else '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</span><span class="ct">{txt}</span></div>'
    blur_in(f"#chk{k}", ws(wi) - 0.05, y=18)
parts.append(f'<div id="checklist" class="clip list" data-start="{ws(CHECKS[0][0]) - 0.1:.3f}" data-duration="{c_end - ws(CHECKS[0][0]) + 0.1:.3f}" data-track-index="3" style="z-index:{z_cap}">{items}<div class="gline small" id="chk-line"></div></div>')
tw.append(f'tl.fromTo("#chk-line",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.5,ease:"power2.out"}},{ws(CHECKS[-1][0]):.3f});')

# ---------------- CTA (accumulates) ----------------
cta_end = D   # captions stay; the outro card slides over everything
lines = ""
for k, (wi, txt, st) in enumerate(CTA):
    cls = {"w": "ln", "it": "ln it", "big": "ln bigln"}[st]
    body = f'<span class="cream">{fmt(txt)}</span>' if st == "it" else fmt(txt)
    lines += f'<div class="{cls}" id="cta{k}">{body}</div>'
    blur_in(f"#cta{k}", ws(wi) - 0.05)
parts.append(f'<div id="cta" class="clip cap" data-start="{cta_start - 0.06:.3f}" data-duration="{cta_end - cta_start + 0.06:.3f}" data-track-index="3" style="z-index:{z_cap};top:1010px">{lines}</div>')


# ---------------- risers into the big moments (peak lands on the word) ----------------
RISERS = [(45, "riser_fast", 1.1), (92, "riser_fast", 1.1), (144, "riser_fast", 1.1)]   # fast riser: ~0.9 s build
for wi, f, pk in RISERS:
    sfx(f, ws(wi) - pk, 0.08)

# ---------------- film burns on some cuts (screen, low opacity) ----------------
cut_times = [g["at"] for g in segs[1:]]
for k, t in enumerate([cut_times[i] for i in BURN_CUTS if i < len(cut_times)]):   # 4 chosen cuts
    bid = f"burn{k}"
    bd, pk = BURN_CLIPS[k % 4]   # brightest frame lands just before the cut so it covers it
    parts.append(f'<div class="burnw" style="z-index:80;opacity:{BURN_OPACITY}"><video id="{bid}" class="clip" data-start="{t - pk - 0.03:.3f}" data-duration="{bd:.3f}" data-track-index="6" src="assets/burn{k % 4 + 1}.mp4" muted playsinline></video></div>')
    sfx(f"burn{k % 4 + 1}", t - pk - 0.03, 0.4)   # the overlay's own burn sound, starts with its picture

# ---------------- camera: reframe face, hard punch-ins on cuts/sentences, eased push-ins on emphasis, slide to outro ----------------
cam = '"#stage-v, #stage-c"'
tw.append(f'tl.set({cam},{{transformOrigin:"585px 880px",x:-45,y:-150}},0);')
tw.append('tl.fromTo("#stage-v",{filter:"blur(14px)"},{filter:"blur(0px)",duration:0.34,ease:"power2.out"},0);')
# cuts: hard scale change; inside a shot: normal zooms (short ease-in + long ease-out), alternating in/out; holds are static
zt = sorted(ws(j) - 0.08 for j in ZMOVES)
tw.append(f'tl.fromTo({cam},{{scale:1.42}},{{scale:{ZOOM[0]},duration:0.5,ease:"power3.out"}},0);')
bounds = [g["at"] for g in segs]   # real cuts always get the scale change
for b0 in [ws(h) - 0.03 for h in HARD]:   # sentence jumps only far from any other jump (no double jolt)
    if all(abs(b0 - x) >= 1.6 for x in bounds): bounds.append(b0)
bounds = sorted(bounds) + [D]
for i, (a, b) in enumerate(zip(bounds, bounds[1:])):   # real cuts + sentence-start jumps
    z = ZOOM[i % len(ZOOM)]
    if i > 0:
        tw.append(f'tl.set({cam},{{scale:{z:.3f}}},{a:.3f});')
    last, up = a + 0.5, z < 1.22   # wide base -> first move goes in; tight base -> first move goes out
    for t in zt:
        dur = min(ZDUR, b - 0.7 - t)   # zoom settles >=0.7 s before the next cut (no zoom-then-cut jolt)
        if t < last or dur < 0.6 or t > D - 0.9:
            continue
        z2 = round(z + ZSTEP if z + ZSTEP <= ZMAX else max(1.16, z - 2 * ZSTEP), 3)   # >=1.16: frame always covered
        tw.append(f'tl.to({cam},{{scale:{z2:.3f},duration:{dur:.3f},ease:"power2.inOut"}},{t:.3f});')
        z, up, last = z2, not up, t + dur + 0.35
tw.append(f'tl.fromTo("#outro-w",{{x:1080}},{{x:0,duration:0.3,ease:"power2.out"}},{D - 0.3:.3f});')

doc = f'''<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
@font-face{{font-family:"DIN Next";src:url("assets/fonts/din-bold.ttf") format("truetype");font-weight:700;font-style:normal}}
html,body{{margin:0;background:#000}}
#root{{position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;font-family:"DIN Next",sans-serif;font-weight:700}}
.stage{{position:absolute;left:0;top:0;width:1080px;height:1920px}}
.stage video{{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover}}
#outro-w{{position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:90}}
#outro-w video{{width:1080px;height:1920px}}
.cap{{position:absolute;left:0;width:1080px;text-align:center;overflow:visible}}
.ln{{font-size:86px;line-height:110px;color:#fff;letter-spacing:-0.6px;white-space:nowrap;
  text-shadow:0 4px 10px rgba(0,0,0,.6),0 0 2px rgba(0,0,0,.3),0 0 12px rgba(255,255,255,.38),0 0 30px rgba(255,255,255,.22)}}
.ln.it{{font-style:italic;font-size:82px;line-height:102px;padding:0 24px}}
.ln.it .cream{{padding:0 .22em;margin:0 -.22em}}
.bigw{{height:200px;text-shadow:none}}
.bigw .bwin{{font-size:168px;line-height:168px;width:1080px}}
.gline.biggl{{position:relative;left:0;top:28px;width:540px;margin:0 auto}}
.capw{{height:108px;text-shadow:none}}
.capw .bwin{{font-size:94px;line-height:108px;width:1080px;letter-spacing:-0.01em}}
.capw .rgb{{opacity:.5;filter:blur(7px)}}
.capw .rgb.r{{transform:translateX(-4px)}}
.capw .rgb.c{{transform:translateX(4px)}}
.sepw{{height:26px;position:relative}}
.gline.sep{{position:relative;left:0;top:25px;width:560px;height:4px;margin:0 auto}}
.cream{{background:linear-gradient(180deg,#fffef2 0%,#f6f3c4 55%,#e7e98f 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  text-shadow:none;filter:drop-shadow(0 0 9px rgba(238,240,150,.55)) drop-shadow(0 4px 6px rgba(0,0,0,.55))}}
.red{{color:#ff3347;text-shadow:0 0 2px rgba(0,0,0,.9),0 0 6px rgba(0,0,0,.75),0 0 18px rgba(255,40,60,.7),0 4px 10px rgba(0,0,0,.7)}}
.grn{{color:#83ff4e;text-shadow:0 0 16px rgba(120,255,80,.55),0 4px 9px rgba(0,0,0,.6)}}
.ln.it .red,.ln.it .grn{{font-style:italic}}
.bigln{{font-size:92px;line-height:112px}}
.hook-k,.hook-t{{position:absolute;left:0;width:1080px;overflow:visible}}
.hook-k{{top:255px;text-align:center}}
.hook-t{{top:770px;text-align:right}}
.kin,.tin{{display:inline-block;font-size:66px;color:#fff;letter-spacing:-0.6px;
  text-shadow:-3px 0 0 rgba(255,40,80,.55),3px 0 0 rgba(40,200,255,.55),0 4px 10px rgba(0,0,0,.6),0 0 22px rgba(255,255,255,.3)}}
.tin{{font-size:60px;margin-right:70px}}
.big{{position:absolute;left:0;top:380px;width:1080px;height:420px;overflow:visible}}
.bw{{position:absolute;overflow:visible}}
.bwin{{position:relative;letter-spacing:-0.02em;white-space:nowrap}}
.bwin span{{position:absolute;left:0;top:0;width:100%}}
.bwin span:last-child{{position:relative}}
.wfill{{color:#fff;text-shadow:0 0 12px rgba(255,255,255,.7),0 0 34px rgba(255,255,255,.35),0 4px 10px rgba(0,0,0,.5)}}
.orw{{color:#fff;font-size:1.15em;text-shadow:0 0 10px rgba(255,255,255,.6),0 2px 8px rgba(0,0,0,.9),0 0 3px rgba(0,0,0,.9)}}
.burnw{{position:absolute;left:0;top:0;width:1080px;height:1920px;mix-blend-mode:screen;pointer-events:none}}
.burnw video{{width:1080px;height:1920px}}
.bigin{{position:absolute;left:0;top:0;width:1080px;text-align:center;font-size:330px;line-height:400px;letter-spacing:-10px}}
.bigin span{{position:absolute;left:0;top:0;width:1080px;text-align:center}}
.gfill{{background:linear-gradient(180deg,#ffffff 0%,#fbf8dc 45%,#ece88f 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 14px rgba(255,250,190,.65)) drop-shadow(0 0 40px rgba(255,240,160,.35)) drop-shadow(0 6px 10px rgba(0,0,0,.45))}}
.rgb{{opacity:.42;mix-blend-mode:screen;filter:blur(10px)}}
.rgb.r{{color:#ff2a55;transform:translateX(-6px)}}
.rgb.c{{color:#22d4ff;transform:translateX(6px)}}
.gline{{position:absolute;left:190px;top:395px;width:700px;height:5px;border-radius:3px;
  background:linear-gradient(90deg,rgba(200,255,120,0),#d8ff7a 25%,#ffffff 50%,#d8ff7a 75%,rgba(200,255,120,0));
  box-shadow:0 0 14px rgba(210,255,120,.8),0 0 30px rgba(210,255,120,.5)}}
.list{{position:absolute;left:150px;top:1200px;width:860px}}
.chk{{display:flex;align-items:center;height:86px}}
.dot{{width:52px;height:52px;border-radius:50%;background:#22c55e;display:inline-flex;align-items:center;justify-content:center;margin-right:22px;
  box-shadow:0 0 16px rgba(34,197,94,.7),0 3px 8px rgba(0,0,0,.5)}}
.dot svg{{width:34px;height:34px}}
.num{{font-size:36px;line-height:36px;color:#fff;font-style:normal}}
.rfill{{background:linear-gradient(180deg,#ff6a72 0%,#ff2a3c 60%,#d9142a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 3px rgba(0,0,0,.8)) drop-shadow(0 0 16px rgba(255,40,60,.6)) drop-shadow(0 6px 10px rgba(0,0,0,.5))}}
.ct{{font-style:italic;text-transform:uppercase;font-size:54px;color:#fff;letter-spacing:-0.4px;white-space:nowrap;
  text-shadow:-3px 0 2px rgba(255,40,80,.6),3px 0 2px rgba(40,200,255,.6),0 0 14px rgba(255,255,255,.5),0 0 32px rgba(255,255,255,.25),0 4px 10px rgba(0,0,0,.65)}}
.gline.small{{position:relative;left:-20px;top:22px;width:820px;height:4px}}
.icon{{position:absolute;width:130px;height:130px;filter:drop-shadow(0 0 3px rgba(255,255,255,.8)) drop-shadow(0 0 12px rgba(255,255,255,.45)) drop-shadow(0 3px 6px rgba(0,0,0,.5))}}
.icon img{{width:130px;height:130px;filter:drop-shadow(0 0 6px rgba(255,255,255,.9)) drop-shadow(0 0 18px rgba(255,255,255,.6)) drop-shadow(0 3px 6px rgba(0,0,0,.6))}}
.leakw{{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;pointer-events:none}}
.leak{{position:absolute;left:-200px;top:0;width:1480px;height:1920px;mix-blend-mode:screen;
  background:radial-gradient(circle at 25% 40%,rgba(255,150,40,.95),rgba(255,150,40,0) 45%),
             radial-gradient(circle at 70% 65%,rgba(255,60,170,.85),rgba(255,60,170,0) 45%),
             radial-gradient(circle at 55% 20%,rgba(255,240,150,.9),rgba(255,240,150,0) 40%),
             linear-gradient(90deg,rgba(255,200,120,.35),rgba(255,255,255,.15))}}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
  <div id="stage-v" class="stage" style="z-index:1"><video id="v-edit" class="clip" data-start="0" data-duration="{D}" data-track-index="0" src="assets/edit.mp4" playsinline data-has-audio="true"></video></div>
  <div id="stage-c" class="stage" style="z-index:3" data-layout-allow-occlusion><video id="v-cut" class="clip" data-start="0" data-duration="10.4" data-media-start="0" data-track-index="1" src="assets/cutout_pr.webm" muted playsinline data-layout-allow-occlusion></video></div>
  {"".join(parts)}
  <div id="outro-w"><video id="v-outro" class="clip" data-start="{D - 0.3:.3f}" data-duration="{OUTRO}" data-track-index="7" src="assets/outro.mp4" muted playsinline></video></div>
  <audio id="music" class="clip" data-start="0" data-duration="{D + 0.6:.3f}" data-track-index="8" src="assets/music.mp3" data-volume="0.10" data-fade-out="0.9"></audio>
  <audio id="music-outro" class="clip" data-start="{D - 0.3:.3f}" data-duration="{OUTRO:.3f}" data-media-start="{D - 0.3:.3f}" data-track-index="8" src="assets/music.mp3" data-volume="0.32" data-fade-in="0.9" data-fade-out="0.5"></audio>
  {"".join(audio)}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tw)}
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body></html>'''
(ROOT / "index.html").write_text(doc, encoding="utf-8")
print("index.html", TOTAL, "s,", len(BLOCKS), "blocks,", len(audio), "sfx")

"""Writes index.html (HyperFrames) for Stimulus 01 from the word timings + the beat plan below.

Markup in caption lines:  ^red^  ~green~  (whole line italic+cream when style "it")
Run: python prep/gen.py   then  npx hyperframes check / snapshot / render
"""
import html, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parent.parent / "styles/stimulus"))
import hfkit as K   # the user's Premiere look: captions, PNG icons, camera moves, Europa CTA
K.install(ROOT)
W = json.loads((ROOT / "prep/words_edit.json").read_text())
words, segs, D = W["words"], W["segments"], W["duration"]
# real picture cuts (frame-exact; words_edit 'at' drifts up to 6 frames late + the raw takes have their own jump cuts)
CUTF = K.picture_cuts(ROOT / "assets/edit_v.mp4", segs, ROOT / "prep/cuts.json")
CUTS = [K.ft(n) for n in CUTF]
OUTRO = 2.336   # outro.mp4 trimmed: first 2 frames had a sliver of the previous clip
TOTAL = round(D - 0.3 + OUTRO, 3)
ws = lambda i: words[i]["s"]
we = lambda i: words[i]["e"]

# ---------------- beat plan ----------------
HOOK = dict(kicker="Club directors,", tag="through fundraising", land=8, tag_at=10, end_word=11)
# blocks: (first word, [(line text, style, word where the line appears)], icons [(name, word)])
BLOCKS = [   # style: w | it | big (key word, gold + yellow line, like the $5,000)
    (2, [("a uniform company", "w", 2)], []),
    (5, [("offers your club", "w", 5)], []),
    (12, [("Sounds amazing,", "w", 12), ("right?", "it", 14)], [("happy", 13)]),
    (15, [("But wait,", "w", 15), ("", "sep", 17), ("READ THE FINE PRINT.", "caps", 17)], [("search", 19)]),
    (21, [("That", "w", 21), ("$5,000", "big", 22), ("is ^store credit.^", "it", 24)], []),
    (27, [("You can only", "w", 27), ("", "sep", 30), ("SPEND IT WITH THEM", "caps", 30)], [("bags", 30)]),
    (34, [("on warm-ups", "w", 34), ("and jerseys.", "it", 37)], [("kit", 35), ("shirt", 37)]),
    (39, [("That money", "w", 39), ("^never leaves^", "it", 41), ("^their store.^", "it", 43)], []),
    (45, [("Now here's how", "w", 45), ("fundraising with", "it", 48), ("Stimulus works.", "it", 50)], [("idea", 47)]),
    (52, [("Our custom", "w", 52), ("jerseys cost", "it", 54)], [("shirt", 54), ("price", 55)]),
    (56, [("LESS", "big", 56), ("than big name brands,", "it", 57)], []),
    (61, [("and your club can", "w", 61), ("add a fundraising", "it", 65), ("amount", "it", 68)], []),
    (69, [("to each jersey.", "w", 69)], [("shirt", 71)]),
    (83, [("That extra money", "w", 83), ("goes directly", "w", 86), ("into your club in", "it", 88)], []),
    (92, [("CASH,", "big", 92), ("^not store credit.^", "it", 93)], []),
    (96, [("Use it for", "w", 96)], []),
    # checklist 99-110 (own element)
    (111, [("^Store credit^", "w", 111), ("buys more gear.", "it", 113)], [("bags", 114)]),
    (116, [("~Cash~ gives", "w", 116), ("your club the", "it", 118)], []),
    (121, [("FREEDOM", "big", 121), ("to invest", "it", 122)], []),
    (124, [("in what", "w", 124), ("matters most.", "it", 125)], [("goal", 126)]),
    (128, [("With Stimulus,", "w", 128), ("", "sep", 130), ("YOU CONTROL", "caps", 130)], [("hand-money", 131)]),
    (132, [("your fundraising", "it", 132), ("amount.", "it", 134)], []),
    (135, [("Change it or", "w", 135), ("TURN IT OFF", "caps", 138), ("at any time.", "it", 141)], []),
]
LH = {"w": 110, "it": 102, "big": 200, "caps": 108, "sep": 36}
FS = {"w": 86, "it": 82, "caps": 94}   # caption sizes; any line wider than 960 px is scaled down to fit   # line heights (px) -> icon row sits under the block
CHECKS = [(99, "Field rentals"), (101, "Coaches"), (102, "Financial assistance"), (106, "Whatever your club needs")]
CTA = [(144, "Want to see", "w"), (147, "what your club", "w"), (150, "could raise?", "it"), (152, "Link in bio.", "big")]
BURNS = [12, 45, 111]   # 83 (26.57 cut) now opens a b-roll with the Premiere burn   # word near which the nearest cut gets a film burn
BURN_OPACITY = 0.38
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]   # (duration, peak offset) of assets/burnN.mp4
# camera like the refs (measured): static holds, hard scale change on each cut, and "normal" zooms inside a shot:
# ~0.55 s, short ease-in then long ease-out, ~12-14 %, alternating in/out. No slow drifts.
CAM_SEQ, CAM_ENTRIES = "DBECBDEC", "OIOO"   # the user's move types cycled per shot (hfkit.camera); cuts: O = snap out, I = abrupt zoom-in
CAP_TOP, CAP_BOTTOM, LIST_TOP = 980, 1360, 960
K.ICON, K.ICON_DROP = 130, 100   # ball in the lower frame: smaller icon row (ref range 128-256 px)   # caption zone (never on the face / the ball)
CTA_BASE = 1090
LIST_HEAD = 96   # 'Use it for' stays above the checklist

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

def blur_in(sel, t, dur=0.5, y=60):   # every caption enters like the user's Transform: +60 px rise, linear fade
    K.rise(tw, sel, t, dy=y, dur=dur)
ICON_LOG = []

def sfx(name, t, vol):
    i = nid("s")
    audio.append(f'<audio id="{i}" class="clip" data-start="{max(t,0):.3f}" data-track-index="9" src="assets/sfx/{name}.wav" data-volume="{vol}"></audio>')

# ---------------- hook: CLUB DIRECTORS behind the head, $5,000 in the caption zone, through|fundraising flanking the head ----------------
h_end = we(HOOK["end_word"]) + 0.35
d_end = ws(HOOK["land"]) - 0.05
def bigword(eid, txt, t0, t1, top, size, left=0, width=1080, align="center", z=2, fill="gfill"):
    rgb = "" if fill != "gfill" else (f'<span class="rgb r" data-layout-allow-occlusion>{txt}</span><span class="rgb c" data-layout-allow-occlusion>{txt}</span>')
    parts.append(f'''<div id="{eid}" class="clip bw" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="2" style="z-index:{z};left:{left}px;top:{top}px;width:{width}px" data-layout-allow-overlap>
  <div class="bwin" style="font-size:{size}px;line-height:{int(size * 1.15)}px;text-align:{align};width:{width}px" data-layout-allow-occlusion data-layout-allow-overlap>{rgb}<span class="{fill}">{txt}</span></div></div>''')
    # the user's title entry (b): slides in 46 px from the left in 0.73 s (bezier), opacity in 0.22 s, blur settles
    tw.append(f'tl.fromTo("#{eid} .bwin",{{x:-46,filter:"blur(8px)"}},{{x:0,filter:"blur(0px)",duration:0.73,ease:"pr"}},{t0:.3f});')
    tw.append(f'tl.fromTo("#{eid} .bwin",{{opacity:0}},{{opacity:1,duration:0.22,ease:"none"}},{t0:.3f});')
    tw.append(f'tl.to("#{eid} .bwin",{{opacity:0,filter:"blur(14px)",duration:0.28,ease:"power2.in"}},{t1 - 0.3:.3f});')
# CLUB / DIRECTORS: same left ink edge (C over D), DIRECTORS centred with margins
from PIL import ImageFont
def ink(txt, sz):   # (left side bearing, ink width) with letter-spacing -0.02em
    b = ImageFont.truetype(str(ROOT / "assets/fonts/din-bold.ttf"), sz).getbbox(txt, anchor="ls")
    return b[0], b[2] - b[0] - (len(txt) - 1) * 0.02 * sz
CLUB_SZ, DIR_SZ = 134, 190
lsb_d, w_d = ink("DIRECTORS", DIR_SZ); lsb_c, _ = ink("CLUB", CLUB_SZ)
x_ink = (1080 - w_d) / 2
bigword("hk-club", "CLUB", 0.12, d_end, 500, CLUB_SZ, left=round(x_ink - lsb_c), width=500, align="left", fill="wfill")
bigword("hk-dir", "DIRECTORS", ws(1), d_end, 618, DIR_SZ, left=round(x_ink - lsb_d), width=1000, align="left")
# through | fundraising: same size, same line, flanking the head, clear of the frame edges
THR_SZ, FUN_SZ, TF_BASE, TF_M = 96, 80, 790, 52   # big; shared baseline; same outer margin; camera pans left (HOOK_PAN) to open room on the right
HOOK_PAN = -34   # x stays inside the range where the video still covers the frame at scale 1.16
lsb_t, _ = ink("through", THR_SZ); lsb_f, w_f = ink("fundraising", FUN_SZ)
def top_for(sz): return TF_BASE - round((int(sz * 1.15) - 1.47 * sz) / 2 + 1.2 * sz)   # DIN asc 1.2 / desc .27: baseline lands on TF_BASE
bigword("hk-thr", "through", ws(10) - 0.04, h_end, top_for(THR_SZ), THR_SZ, left=round(TF_M - lsb_t), width=520, align="left", fill="wfill")
bigword("hk-fund", "fundraising", ws(11) - 0.04, h_end, top_for(FUN_SZ), FUN_SZ, left=round(1080 - TF_M - w_f - lsb_f), width=520, align="left")
# $5,000 lands exactly on "five thousand", fast count, in the caption zone
land = ws(HOOK["land"]) - 0.03
parts.append(f'''<div id="money" class="clip bw" data-start="{land:.3f}" data-duration="{h_end - land:.3f}" data-track-index="3" style="z-index:{z_cap};left:0;top:1040px;width:1080px" data-layout-allow-overlap>
  <div class="bwin" style="font-size:190px;line-height:220px;text-align:center;width:1080px" data-layout-allow-occlusion data-layout-allow-overlap><span class="rgb r cnt" data-layout-allow-occlusion>$0</span><span class="rgb c cnt" data-layout-allow-occlusion>$0</span><span class="gfill cnt">$0</span></div>
  <div class="gline" style="left:240px;top:244px;width:600px"></div></div>''')
tw.append(f'''(function(){{const o={{v:0}};const els=document.querySelectorAll("#money .cnt");
tl.fromTo(o,{{v:0}},{{v:5000,duration:0.42,ease:"power1.out",onUpdate:function(){{const s="$"+(Math.round(o.v/10)*10).toLocaleString("en-US");els.forEach(e=>e.textContent=s);}}}},{land:.3f});}})();''')
tw.append(f'tl.fromTo("#money .bwin",{{opacity:0,scale:0.7,filter:"blur(12px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.22,ease:"power3.out"}},{land:.3f});')
tw.append(f'tl.fromTo("#money .bwin",{{scale:1}},{{keyframes:[{{scale:1.12,duration:0.08,ease:"power2.out"}},{{scale:1,duration:0.25,ease:"back.out(2)"}}]}},{land + 0.42:.3f});')
tw.append(f'tl.fromTo("#money .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{land + 0.42:.3f});')
tw.append(f'tl.to("#money .bwin, #money .gline",{{opacity:0,filter:"blur(14px)",duration:0.28,ease:"power2.in"}},{h_end - 0.3:.3f});')

# ---------------- caption blocks ----------------
starts = [ws(b[0]) for b in BLOCKS]
list_start, cta_start = ws(96), ws(CTA[0][0])
for k, (w0, lines, icons) in enumerate(BLOCKS):
    t0 = ws(w0) - 0.05
    nxt = [s for s in starts[k + 1:]] + [cta_start]
    t1 = min(nxt[0] - 0.07, we(max(l[2] for l in lines)) + 2.2)
    if w0 == 96: t1 = ws(CHECKS[0][0]) + 0.01 + 6.0  # "Use it for" stays above the list
    if w0 == 96: t1 = ws(111) - 0.1
    if w0 < 12: t1 = min(t1, h_end, land)
    t1 = K.snap(t1, CUTS, 0.12)   # a block that ends 1-3 frames off a cut ends ON the cut (no caption-only flicker next to the jump)
    if lines[0][1] == "cta":   # the user's "for a free design / and sample jersey" graphic, 1:1
        K.cta_free(parts, tw, nid, t0, t1, base1=CTA_BASE)
        continue
    cid = nid("cap")
    inner = ""
    for j, (txt, st, wl) in enumerate(lines):
        lid, tj = f"{cid}-{j}", max(ws(wl) - 0.05, t0)
        if st == "big":   # title word: gold->white gradient + feathered RGB + line; never italic
            inner += (f'<div class="ln bigw" id="{lid}"><div class="bwin" data-layout-allow-occlusion data-layout-allow-overlap>'
                      f'<span class="rgb r" data-layout-allow-occlusion>{txt}</span><span class="rgb c" data-layout-allow-occlusion>{txt}</span>'
                      f'<span class="gfill">{txt}</span></div><div class="gline biggl"></div></div>')
            K.rise(tw, f"#{lid} .bwin", tj, dy=60, dur=0.5)   # key word in the caption zone: subtitle-speed rise so it reads at once
            tw.append(f'tl.fromTo("#{lid} .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{tj + 0.12:.3f});')
        elif st == "caps":   # emphasis line: UPPERCASE italic, gradient to white, feathered RGB split
            inner += (f'<div class="ln capw" id="{lid}"><div class="bwin" style="font-size:{fit(txt, 92)}px" data-layout-allow-occlusion data-layout-allow-overlap>'
                      f'<span class="rgb r" data-layout-allow-occlusion>{txt}</span><span class="rgb c" data-layout-allow-occlusion>{txt}</span>'
                      f'<span class="gfill">{txt}</span></div></div>')
            K.rise(tw, f"#{lid}", tj)
        elif st == "sep":
            inner += f'<div class="sepw" id="{lid}"><div class="gline sep"></div></div>'
            tw.append(f'tl.fromTo("#{lid} .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{tj:.3f});')
        else:   # subtitle: line 1 upright white, punch line italic white, highlights green/red italic
            orw = st == "orw"
            if orw: st = "it"
            cls = "ln it orw" if orw else ("ln it" if st == "it" else "ln")
            sz = fit(txt.replace("^", "").replace("~", ""), K.CAP_FS)
            inner += f'<div class="{cls}" id="{lid}" style="font-size:{sz}px">{fmt(txt)}</div>'
            K.rise(tw, f"#{lid}", tj)
    h_lines = sum(K.LH[l[1]] for l in lines)
    last_base_off = h_lines - K.LH[lines[-1][1]] + K.BASE_OFF + (8 if lines[-1][1] == "caps" else 0)
    h_block = last_base_off + K.ICON_DROP + K.ICON // 2 if icons else h_lines
    top = LIST_TOP if w0 == LIST_HEAD else (1000 if icons else 1060)
    if w0 != LIST_HEAD: top = max(CAP_TOP, min(top, CAP_BOTTOM - (60 if icons else 0) - h_block))   # icon blocks rise 60 px: icons never on the hands   # never on the face, never below CAP_BOTTOM
    parts.append(f'<div id="{cid}" class="clip cap" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="3" style="z-index:{z_cap};top:{top}px">{inner}</div>')
    if icons:   # the user's PNG icons, each on its spoken word, row under the last baseline, all cut together
        K.icon_row(parts, tw, nid, icons, ws, top + last_base_off, t0, t1, log=ICON_LOG)

# ---------------- checklist ----------------
c_end = ws(111) - 0.1
items = ""
for k, (wi, txt) in enumerate(CHECKS):
    items += f'<div class="chk" id="chk{k}"><span class="dot"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="ct">{txt}</span></div>'
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
RISERS = [(8, "riser_fast", 1.1), (45, "riser_fast", 1.1), (92, "riser_fast", 1.1), (144, "riser_fast", 1.1)]   # fast riser: ~0.9 s build
for wi, f, pk in RISERS:
    sfx(f, ws(wi) - pk, 0.08)

# ---------------- b-roll cutaways (client round 2026-11-10): Premiere film burn + purple flash in and out ----------------
BR = ROOT.parent.parent / "Ref videos Dariel/Stimulus/broll"
# v13 (client 2026-11-11): "Families see the regular price ... stays private." (22.65-26.57) cut out; later times -3.92 s
BROLL = [   # balanced (user 2026-11-10): talking head stays the star, only 3 cutaways
    # (clip path, clip start s, t_in, t_out, crop_x)  — catalog: Ref videos Dariel/Stimulus/broll/CATALOGO.md
    (BR / "link4/Drone/DJI_0036.MP4", 4.0, 12.95, 15.45, 0.5),                    # "never leaves their store" -> warehouse aisle
    # (BR / "link2/Day 1/Video/C0147.MP4", 12.0, 19.75, 22.5, 0.45),                # "add a fundraising amount to each jersey" -> laser-cut jersey panels
    (BR / "link6/Crowriver Rec Program video.mov", 11.0, 22.6476, 25.43, 0.5),      # "goes directly into your club" -> coach high-fives the team
    # (BR / "link6/Alchemy Soccer-2.mp4", 33.4, 32.4, 35.2, 0.5),                    # "coaches, financial assistance" -> coach leading a drill
    (BR / "link6/Josh 100 Clips/07-Soccer girls social.mov", 12.6, 34.68, 37.38, 0.5),  # "freedom ... what matters most" -> save + celebration
]
K.broll(ROOT, parts, tw, audio, BROLL, cuts=CUTS)

# ---------------- film burns on some cuts (screen, low opacity) ----------------
BR_EDGES = [K.ft(round(K.snap(x, CUTS) * K.FPS + 0.1)) for r in BROLL for x in r[2:4]]
for k, wanted in enumerate(BURNS):
    t = min(CUTS, key=lambda c: abs(c - ws(wanted)))   # nearest real picture cut
    if any(abs(t - e) < 0.6 for e in BR_EDGES): continue   # a b-roll edge already burns this cut (no double burn)
    bid = f"burn{k}"
    bd, pk = BURN_CLIPS[k % 4]   # brightest frame lands just before the cut so it covers it
    parts.append(f'<div class="burnw" style="z-index:80;opacity:{BURN_OPACITY}"><video id="{bid}" class="clip" data-start="{t - pk - 0.03:.3f}" data-duration="{bd:.3f}" data-track-index="6" src="assets/burn{k % 4 + 1}.mp4" muted playsinline></video></div>')
    sfx(f"burn{k % 4 + 1}", t - pk - 0.03 - 0.4, 0.4)   # the overlay's own burn sound (cut 0.4 s before the picture)


# ---------------- camera: reframe face, hard punch-ins on cuts/sentences, eased push-ins on emphasis, slide to outro ----------------
cam = '"#stage-v, #stage-c"'
tw.append(f'tl.set({cam},{{transformOrigin:"585px 880px",x:-45,y:-150}},0);')
tw.append('tl.fromTo("#stage-v",{filter:"blur(14px)"},{filter:"blur(0px)",duration:0.34,ease:"power2.out"},0);')
# camera = the user's "Acercar lento" moves, per frame: A impact zoom-out, B/C/D/E inside shots, abrupt in/out on real cuts
bounds = [0.0] + CUTS + [D]   # camera shots = real picture cuts (zoom changes land ON the cut frame)
CAM_VALS, CAM_MOVES, CAM_SHOTS = K.camera(bounds, D, CAM_SEQ, entries=CAM_ENTRIES, hook_end=h_end, snap_cuts=CUTS + BR_EDGES, min_shot=1.5)   # 1.58 s shot 6.00-7.59 gets its own framing change on both cuts   # b-roll edges count as cuts too
K.cut_report(CUTF, "V1")
tw.append(K.camera_js(cam, CAM_VALS, 1.16))
tw.append(f'tl.to({cam},{{x:{-45 + HOOK_PAN},duration:0.5,ease:"power2.inOut"}},{ws(10) - 0.55:.3f});')   # room for through | fundraising
tw.append(f'tl.set({cam},{{x:-45}},{K.snap(segs[2]["at"], CUTS, 0.3):.3f});')   # on the real picture cut
tw.append(f'tl.fromTo("#outro-w",{{x:1080}},{{x:0,duration:0.3,ease:"power2.out"}},{D - 0.3:.3f});')

doc = f'''<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920">
{K.HEAD}
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
.capw .rgb{{opacity:.8;filter:blur(1.5px)}}
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
.wfill{{color:#fff;text-shadow:0 0 14px rgba(255,255,255,.45),0 4px 10px rgba(0,0,0,.5)}}
.burnw{{position:absolute;left:0;top:0;width:1080px;height:1920px;mix-blend-mode:screen;pointer-events:none}}
.burnw video{{width:1080px;height:1920px}}
.bigin{{position:absolute;left:0;top:0;width:1080px;text-align:center;font-size:330px;line-height:400px;letter-spacing:-10px}}
.bigin span{{position:absolute;left:0;top:0;width:1080px;text-align:center}}
.gfill{{background:linear-gradient(180deg,#ffffff 0%,#fbf8dc 45%,#ece88f 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 14px rgba(255,250,190,.65)) drop-shadow(0 0 40px rgba(255,240,160,.35)) drop-shadow(0 6px 10px rgba(0,0,0,.45))}}
.rgb{{opacity:.6;mix-blend-mode:screen;filter:blur(5px)}}
.rgb.r{{color:#ff2a55;transform:translateX(-6px)}}
.rgb.c{{color:#22d4ff;transform:translateX(6px)}}
.gline{{position:absolute;left:190px;top:395px;width:700px;height:5px;border-radius:3px;
  background:linear-gradient(90deg,rgba(200,255,120,0),#d8ff7a 25%,#ffffff 50%,#d8ff7a 75%,rgba(200,255,120,0));
  box-shadow:0 0 14px rgba(210,255,120,.8),0 0 30px rgba(210,255,120,.5)}}
.list{{position:absolute;left:150px;top:1050px;width:860px}}
.chk{{display:flex;align-items:center;height:86px}}
.dot{{width:52px;height:52px;border-radius:50%;background:#22c55e;display:inline-flex;align-items:center;justify-content:center;margin-right:22px;
  box-shadow:0 0 16px rgba(34,197,94,.7),0 3px 8px rgba(0,0,0,.5)}}
.dot svg{{width:34px;height:34px}}
.ct{{font-style:italic;text-transform:uppercase;font-size:54px;color:#fff;letter-spacing:-0.4px;white-space:nowrap;
  text-shadow:-3px 0 2px rgba(255,40,80,.6),3px 0 2px rgba(40,200,255,.6),0 0 14px rgba(255,255,255,.5),0 0 32px rgba(255,255,255,.25),0 4px 10px rgba(0,0,0,.65)}}
.gline.small{{position:relative;left:-20px;top:22px;width:820px;height:4px}}
.icon{{position:absolute;width:110px;height:110px}}
.icon img{{width:110px;height:110px;filter:drop-shadow(0 0 10px rgba(255,255,255,.55)) drop-shadow(0 3px 6px rgba(0,0,0,.6))}}
.leakw{{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;pointer-events:none}}
.leak{{position:absolute;left:-200px;top:0;width:1480px;height:1920px;mix-blend-mode:screen;
  background:radial-gradient(circle at 25% 40%,rgba(255,150,40,.95),rgba(255,150,40,0) 45%),
             radial-gradient(circle at 70% 65%,rgba(255,60,170,.85),rgba(255,60,170,0) 45%),
             radial-gradient(circle at 55% 20%,rgba(255,240,150,.9),rgba(255,240,150,0) 40%),
             linear-gradient(90deg,rgba(255,200,120,.35),rgba(255,255,255,.15))}}
{K.CSS}
{K.BROLL_CSS}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
  <div id="stage-v" class="stage" style="z-index:1"><video id="v-edit" class="clip" data-start="0" data-duration="{D}" data-track-index="0" src="assets/edit_v.mp4" playsinline data-has-audio="true"></video></div>
  <div id="stage-c" class="stage" style="z-index:3" data-layout-allow-occlusion><video id="v-cut" class="clip" data-start="0" data-duration="10.4" data-media-start="0" data-track-index="1" src="assets/cutout_pr.webm" muted playsinline data-layout-allow-occlusion></video></div>
  {"".join(parts)}
  <div id="outro-w"><video id="v-outro" class="clip" data-start="{D - 0.3:.3f}" data-duration="{OUTRO}" data-track-index="7" src="assets/outro.mp4" muted playsinline></video></div>
  <audio id="music" class="clip" data-start="0" data-duration="{D - 0.3:.3f}" data-track-index="8" src="assets/music_v2.mp3" data-volume="0.10"></audio>
  <audio id="music-outro" class="clip" data-start="{D - 0.3:.3f}" data-duration="{OUTRO:.3f}" data-media-start="{D - 0.3:.3f}" data-track-index="8" src="assets/music_v2.mp3" data-volume="0.32" data-fade-in="0.2" data-fade-out="0.5"></audio>
  {"".join(audio)}
</div>
<script>
{K.EASES}
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tw)}
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body></html>'''
(ROOT / "index.html").write_text(doc, encoding="utf-8")
print("index.html", TOTAL, "s,", len(BLOCKS), "blocks,", len(audio), "sfx")
print("camera shots:", [(round(a, 2), round(b, 2)) for a, b in CAM_SHOTS])
for t, m in CAM_MOVES: print(f"  cam {t:6.2f}  {m}")
for ic, wi, tw_, ti in ICON_LOG: print(f"  icon {ic:12s} word {wi:3d} '{words[wi]['w']}' @ {tw_:.2f} -> {ti:.2f}")

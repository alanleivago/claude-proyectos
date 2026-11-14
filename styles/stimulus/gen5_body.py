"""Shared body of the v5+ Stimulus gen.py (pieces/stimulus-0N-hf/prep/gen.py defines the plan, then exec()s this).
Copied from the approved v4 gen.py; hook generalised, GOLD_CSS (old yellow gradient), icons late->first line."""
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

def fit(txt, sz, maxw=930):
    w = ink(txt, sz)[1] * 1.04
    return sz if w <= maxw else int(sz * maxw / w)

def blur_in(sel, t, dur=0.5, y=60):   # every caption enters like the user's Transform: +60 px rise, linear fade
    K.rise(tw, sel, t, dy=y, dur=dur)
ICON_LOG = []

def sfx(name, t, vol):
    i = nid("s")
    audio.append(f'<audio id="{i}" class="clip" data-start="{max(t,0):.3f}" data-track-index="9" src="assets/sfx/{name}.wav" data-volume="{vol}"></audio>')

# ---------------- hook: COACHES & CLUB / DIRECTORS behind the head, BULK ORDER | TEAM STORE flanking it, PICTURE THIS in the caption zone ----------------
def bigword(eid, txt, t0, t1, top, size, left=0, width=1080, align="center", z=2, fill="gfill"):
    rgb = "" if fill != "gfill" else (f'<span class="rgb r" data-layout-allow-occlusion>{txt}</span><span class="rgb c" data-layout-allow-occlusion>{txt}</span>')
    parts.append(f'''<div id="{eid}" class="clip bw" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="2" style="z-index:{z};left:{left}px;top:{top}px;width:{width}px" data-layout-allow-overlap>
  <div class="bwin" style="font-size:{size}px;line-height:{int(size * 1.15)}px;text-align:{align};width:{width}px" data-layout-allow-occlusion data-layout-allow-overlap>{rgb}<span class="{fill}">{txt}</span></div></div>''')
    # the user's title entry (b): slides in 46 px from the left in 0.73 s (bezier), opacity in 0.22 s, blur pulse settles
    tw.append(f'tl.fromTo("#{eid} .bwin",{{x:-46,filter:"blur(8px)"}},{{x:0,filter:"blur(0px)",duration:0.73,ease:"pr"}},{t0:.3f});')
    tw.append(f'tl.fromTo("#{eid} .bwin",{{opacity:0}},{{opacity:1,duration:0.22,ease:"none"}},{t0:.3f});')
    tw.append(f'tl.to("#{eid} .bwin",{{opacity:0,filter:"blur(14px)",duration:0.28,ease:"power2.in"}},{t1 - 0.3:.3f});')
from PIL import ImageFont
def ink(txt, sz):   # (left side bearing, ink width) with letter-spacing -0.02em
    b = ImageFont.truetype(str(ROOT / "assets/fonts/din-bold.ttf"), sz).getbbox(txt, anchor="ls")
    return b[0], b[2] - b[0] - (len(txt) - 1) * 0.02 * sz
def top_for(sz, base): return base - round((int(sz * 1.15) - 1.47 * sz) / 2 + 1.2 * sz)   # DIN asc 1.2 / desc .27 -> baseline on `base`
# hook title (v5+ generic): kicker words (white) centred over the BIG word (old yellow gfill), each on its spoken word,
# behind the head (stage-c cutout above them). Optional key words in the caption zone (gold + line) after the title.
K_SZ, DIR_SZ = HOOK.get("k_sz", 82), HOOK.get("big_sz", 225)
big_txt, big_wi = HOOK["big"]
DIR_SZ = min(DIR_SZ, int(DIR_SZ * HOOK.get("big_maxw", 900) / ink(big_txt, DIR_SZ)[1]))   # margins on both sides
lsb_d, w_d = ink(big_txt, DIR_SZ)
x_ink = (1080 - w_d) / 2
d_end = ws(HOOK["end"]) - 0.04
if HOOK.get("kicker"):
    k_full = " ".join(t for t, _ in HOOK["kicker"]).replace("&amp;", "&")
    K_SZ = min(K_SZ, int(K_SZ * 900 / ink(k_full, K_SZ)[1]))
    lsb_k, _ = ink(k_full, K_SZ)
    kx = (1080 - ink(k_full, K_SZ)[1]) / 2 - lsb_k   # kicker centered over the big word
    for m, (txt, wi) in enumerate(HOOK["kicker"]):   # each word appears as he says it
        raw = txt.replace("&amp;", "&")
        bigword(f"hk-k{m}", txt, max(ws(wi) - 0.04, 0.05), d_end, top_for(K_SZ, HOOK.get("k_base", 478)), K_SZ, left=round(kx), width=700, align="left", z=2, fill="wfill")
        kx += ink(raw, K_SZ)[1] + K_SZ * 0.24
# title stacks (user 2026-11-07): small line GLUED to the big word like the refs ("SOCCER/COACHES", "100/Jersey Options"):
# big word's ink top sits HOOK["gap"] (default 14 px) under the kicker baseline
if HOOK.get("kicker"):
    capH = -ImageFont.truetype(str(ROOT / "assets/fonts/din-bold.ttf"), DIR_SZ).getbbox(big_txt, anchor="ls")[1]
    HOOK["big_base"] = HOOK.get("k_base", 478) + HOOK.get("gap", 14) + capH
bigword("hk-dir", big_txt, max(ws(big_wi) - 0.04, 0.05), d_end, top_for(DIR_SZ, HOOK.get("big_base", 668)), DIR_SZ, left=round(x_ink - lsb_d), width=1060, align="left")
pw = None
h_end = d_end
if HOOK.get("key"):   # key words in the caption zone with the luminous line, exactly on their word
    key_txt, key_wi = HOOK["key"]
    pw = ws(key_wi) - 0.03
    h_end = max(ws(AFTER_HOOK) - 0.05, pw + 1.0)   # key words hold >=1 s, the next caption waits for them
    ksz = min(150, int(150 * 900 / ink(key_txt, 150)[1]))
    parts.append(f'''<div id="pickw" class="clip bw" data-start="{pw:.3f}" data-duration="{h_end - pw:.3f}" data-track-index="3" style="z-index:{z_cap};left:0;top:{HOOK.get("key_top", 1050)}px;width:1080px" data-layout-allow-overlap>
  <div class="bwin" style="font-size:{ksz}px;line-height:170px;text-align:center;width:1080px" data-layout-allow-occlusion data-layout-allow-overlap><span class="rgb r" data-layout-allow-occlusion>{key_txt}</span><span class="rgb c" data-layout-allow-occlusion>{key_txt}</span><span class="gfill">{key_txt}</span></div>
  <div class="gline" style="left:220px;top:212px;width:640px"></div></div>''')
    K.rise(tw, "#pickw .bwin", pw, dy=60, dur=0.8)   # title entry (a): +60 px in 0.8 s
    tw.append(f'tl.fromTo("#pickw .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{pw + 0.15:.3f});')
    tw.append(f'tl.to("#pickw .bwin, #pickw .gline",{{opacity:0,filter:"blur(14px)",duration:0.25,ease:"power2.in"}},{h_end - 0.25:.3f});')

# ---------------- caption blocks ----------------
starts = [ws(b[0]) for b in BLOCKS]
cta_start = ws(CTA[0][0]) if CTA else D
for k, (w0, lines, icons) in enumerate(BLOCKS):
    t0 = ws(w0) - 0.05 if (w0 != AFTER_HOOK or pw is None) else h_end
    nxt = [s for s in starts[k + 1:]] + [cta_start]
    t1 = min(nxt[0] - 0.07, we(max(l[2] for l in lines)) + 2.2)
    if CHECKS and w0 == LIST_HEAD: t1 = ws(LIST_END) - 0.1   # list header stays above the list
    if pw is not None and w0 == HOOK_HANDOFF: t1 = pw - 0.03   # hand over to PICTURE THIS
    if lines[0][1] == "cta":   # the user's "for a free design / and sample jersey" graphic, 1:1
        K.cta_free(parts, tw, nid, t0, t1, base1=CTA_BASE, l1=lines[0][0], l2=lines[1][0], tint=JERSEY_TINT, dt2=max(0.4, ws(lines[1][2]) - 0.05 - t0))   # line 2 lands on its word
        continue
    cid = nid("cap")
    inner = ""
    for j, (txt, st, wl) in enumerate(lines):
        lid, tj = f"{cid}-{j}", max(ws(wl) - 0.05, t0)
        if st == "big":   # title word: gold->white gradient + feathered RGB + line; never italic
            bsz = min(168, int(168 * 900 / ink(txt, 168)[1]))   # wide key words fit 900 px
            inner += (f'<div class="ln bigw" id="{lid}"><div class="bwin" style="font-size:{bsz}px" data-layout-allow-occlusion data-layout-allow-overlap>'
                      f'<span class="rgb r" data-layout-allow-occlusion>{txt}</span><span class="rgb c" data-layout-allow-occlusion>{txt}</span>'
                      f'<span class="gfill">{txt}</span></div><div class="gline biggl"></div></div>')
            K.rise(tw, f"#{lid} .bwin", tj, dy=60, dur=0.5)   # key word in the caption zone: subtitle-speed rise so it reads at once
            tw.append(f'tl.fromTo("#{lid} .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{tj + 0.12:.3f});')
            if txt.startswith("$") and txt[1:].replace(",", "").isdigit():   # amounts: fast count (~0.42 s) landing on the word, like v1's $5,000
                val = int(txt[1:].replace(",", ""))
                tw.append(f'''(function(){{const o={{v:0}};const els=document.querySelectorAll("#{lid} .bwin span");
tl.fromTo(o,{{v:0}},{{v:{val},duration:0.42,ease:"power1.out",onUpdate:function(){{const s="$"+(Math.round(o.v/10)*10).toLocaleString("en-US");els.forEach(e=>e.textContent=s);}}}},{tj:.3f});}})();''')
        elif st == "caps":   # emphasis line: UPPERCASE italic, #9F9C81 -> white gradient, feathered RGB split
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
    top = LIST_TOP - 240 if (CHECKS and w0 == LIST_HEAD) else (1000 if icons else 1060)
    if not (CHECKS and w0 == LIST_HEAD): top = max(CAP_TOP, min(top, CAP_BOTTOM - (60 if icons else 0) - h_block))   # icon blocks rise 60 px: icons never on the hands   # never on the face, never below CAP_BOTTOM
    parts.append(f'<div id="{cid}" class="clip cap" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="3" style="z-index:{z_cap};top:{top}px">{inner}</div>')
    if icons:   # the user's PNG icons, each on its spoken word, row under the last baseline, all cut together
        K.icon_row(parts, tw, nid, icons, ws, top + last_base_off, t0, t1, log=ICON_LOG, late_to_first=True)

# ---------------- checklist ----------------
if CHECKS:
    c_end = ws(LIST_END) - 0.1
    items = ""
    for k, (wi, txt) in enumerate(CHECKS):
        items += f'<div class="chk" id="chk{k}"><span class="dot">{f'<b class="num">{k + 1}</b>' if NUMBERED else '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</span><span class="ct">{txt}</span></div>'
        blur_in(f"#chk{k}", ws(wi) - 0.05, y=18)
    parts.append(f'<div id="checklist" class="clip list" data-start="{ws(CHECKS[0][0]) - 0.1:.3f}" data-duration="{c_end - ws(CHECKS[0][0]) + 0.1:.3f}" data-track-index="3" style="z-index:{z_cap}">{items}<div class="gline small" id="chk-line"></div></div>')
    tw.append(f'tl.fromTo("#chk-line",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.5,ease:"power2.out"}},{ws(CHECKS[-1][0]):.3f});')


# ---------------- CTA (accumulates) ----------------
if CTA:
    cta_end = D   # captions stay; the outro card slides over everything
    lines = ""
    for k, (wi, txt, st) in enumerate(CTA):
        cls = {"w": "ln", "it": "ln it", "big": "ln bigln"}[st]
        body = f'<span class="cream">{fmt(txt)}</span>' if st == "it" else fmt(txt)
        lines += f'<div class="{cls}" id="cta{k}">{body}</div>'
        blur_in(f"#cta{k}", ws(wi) - 0.05)
    parts.append(f'<div id="cta" class="clip cap" data-start="{cta_start - 0.06:.3f}" data-duration="{cta_end - cta_start + 0.06:.3f}" data-track-index="3" style="z-index:{z_cap};top:{CTA_TOP}px">{lines}</div>')



# ---------------- risers into the big moments (peak lands on the word) ----------------
for wi, f, pk in RISERS:
    sfx(f, ws(wi) - pk, 0.08)

GLOW = {"green": "60,220,140", "purple": "190,90,255", "navy": "80,140,255", "teal": "60,210,210", "red": "255,90,80"}[JERSEY_TINT]
JERSEY_CSS = "" if JERSEY_TINT == "green" else (".cfj img{filter:brightness(1.6) saturate(1.08) drop-shadow(0 0 10px rgba(%s,.85)) drop-shadow(0 0 34px rgba(%s,.5)) drop-shadow(14px 16px 22px rgba(0,0,0,.75))}" % (GLOW, GLOW))
EDIT = "edit_v.mp4" if (ROOT / "assets/edit_v.mp4").exists() else "edit.mp4"   # edit_v = voice raised to the approved mix level (≈-13.5 LUFS); edit.mp4 stays as the Premiere roto source
# real picture cuts (client 2026-11-11, approved on V2 v4): zoom changes and b-roll edges land ON the cut frame, nothing < 8 frames
CUTF = K.picture_cuts(ROOT / "assets" / EDIT, segs, ROOT / "prep/cuts.json")
CUTS = [K.ft(n) for n in CUTF]
K.cut_report(CUTF, ROOT.name)
# ---------------- b-roll cutaways: plan.py may define BROLL = [(clip, clip_start, t_in, t_out, crop_x)] ----------------
BROLL = globals().get("BROLL", [])
K.broll(ROOT, parts, tw, audio, BROLL, cuts=CUTS)
BR_EDGES = [K.ft(round(K.snap(x, CUTS) * K.FPS + 0.1)) for r in BROLL for x in r[2:4]]
# ---------------- film burns on some cuts (screen, low opacity) ----------------
cut_times = [K.snap(g["at"], CUTS, 0.3) for g in segs[1:]]   # same indexing as BURN_CUTS, real frame
for k, t in enumerate([cut_times[i] for i in BURN_CUTS if i < len(cut_times)]):   # 4 chosen cuts
    if any(abs(t - e) < 0.6 for e in BR_EDGES): continue   # a b-roll edge already burns this cut (no double burn)
    bid = f"burn{k}"
    bd, pk = BURN_CLIPS[k % 4]   # brightest frame lands just before the cut so it covers it
    parts.append(f'<div class="burnw" style="z-index:80;opacity:{BURN_OPACITY}"><video id="{bid}" class="clip" data-start="{t - pk - 0.03:.3f}" data-duration="{bd:.3f}" data-track-index="6" src="assets/burn{k % 4 + 1}.mp4" muted playsinline></video></div>')
    sfx(f"burn{k % 4 + 1}", t - pk - 0.03, 0.4)   # the overlay's own burn sound, starts with its picture


# ---------------- head cutout over the hook title: the user's Premiere roto (cutout_pr.webm) when it exists, else the temporary BiRefNet one
CUT = "cutout_pr.webm" if (ROOT / "assets/cutout_pr.webm").exists() else "cutout_hook.webm"
CUT_DUR = 10.4 if CUT == "cutout_pr.webm" else round(float(__import__("subprocess").run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(ROOT / "assets" / CUT)], capture_output=True, text=True).stdout or 0.1) - 0.05, 3)
print("cutout:", CUT, CUT_DUR)

# ---------------- camera: reframe face, hard punch-ins on cuts/sentences, eased push-ins on emphasis, slide to outro ----------------
cam = '"#stage-v, #stage-c"'
tw.append(f'tl.set({cam},{{transformOrigin:"{CAM_ORIGIN}",x:{CAM_X},y:{CAM_Y}}},0);')
tw.append('tl.fromTo("#stage-v",{filter:"blur(14px)"},{filter:"blur(0px)",duration:0.34,ease:"power2.out"},0);')
# camera = the user's "Acercar lento" moves, per frame: A impact zoom-out, B/C/D/E inside shots, abrupt in/out on real cuts
bounds = [0.0] + CUTS + [D]   # camera shots = real picture cuts
CAM_VALS, CAM_MOVES, CAM_SHOTS = K.camera(bounds, D, CAM_SEQ, entries=CAM_ENTRIES, hook_end=d_end, a_dur=globals().get("A_DUR", 0.4), a_ease=globals().get("A_EASE"), snap_cuts=CUTS + BR_EDGES)   # v5+ (user 2026-11-07): snappy opening zoom-out 0.4 s like the refs
tw.append(K.camera_js(cam, CAM_VALS, 1.16))
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
.wfill{{color:#fff;text-shadow:0 0 3px rgba(0,0,0,.95),0 0 10px rgba(0,0,0,.7),0 0 14px rgba(255,255,255,.55),0 0 34px rgba(255,255,255,.3),0 4px 10px rgba(0,0,0,.6)}}
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
.list{{position:absolute;left:150px;top:{LIST_TOP}px;width:860px}}
.chk{{display:flex;align-items:center;height:86px}}
.dot{{flex:none;width:52px;height:52px;border-radius:50%;background:#22c55e;display:inline-flex;align-items:center;justify-content:center;margin-right:22px;
  box-shadow:0 0 16px rgba(34,197,94,.7),0 3px 8px rgba(0,0,0,.5)}}
.dot svg{{width:34px;height:34px}}
.num{{font-size:36px;line-height:36px;color:#fff;font-style:normal}}
.rfill{{background:linear-gradient(180deg,#ff6a72 0%,#ff2a3c 60%,#d9142a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 3px rgba(0,0,0,.8)) drop-shadow(0 0 16px rgba(255,40,60,.6)) drop-shadow(0 6px 10px rgba(0,0,0,.5))}}
.ct{{font-style:italic;text-transform:uppercase;font-size:54px;color:#fff;letter-spacing:-0.4px;white-space:nowrap;
  text-shadow:-3px 0 2px rgba(255,40,80,.6),3px 0 2px rgba(40,200,255,.6),0 0 14px rgba(255,255,255,.5),0 0 32px rgba(255,255,255,.25),0 4px 10px rgba(0,0,0,.65)}}
.gline.small{{position:relative;left:-20px;top:22px;width:820px;height:4px}}
.cap,.list{{filter:drop-shadow(0 0 5px rgba(0,0,0,.9)) drop-shadow(0 3px 12px rgba(0,0,0,.65))}}   /* white jacket: dark halo keeps every caption readable */
.icon{{position:absolute;width:130px;height:130px;filter:drop-shadow(0 0 3px rgba(255,255,255,.8)) drop-shadow(0 0 12px rgba(255,255,255,.45)) drop-shadow(0 10px 14px rgba(0,0,0,.6))}}
.icon img{{width:130px;height:130px;filter:drop-shadow(0 0 6px rgba(255,255,255,.9)) drop-shadow(0 0 18px rgba(255,255,255,.6)) drop-shadow(0 3px 6px rgba(0,0,0,.6))}}
.leakw{{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;pointer-events:none}}
.leak{{position:absolute;left:-200px;top:0;width:1480px;height:1920px;mix-blend-mode:screen;
  background:radial-gradient(circle at 25% 40%,rgba(255,150,40,.95),rgba(255,150,40,0) 45%),
             radial-gradient(circle at 70% 65%,rgba(255,60,170,.85),rgba(255,60,170,0) 45%),
             radial-gradient(circle at 55% 20%,rgba(255,240,150,.9),rgba(255,240,150,0) 40%),
             linear-gradient(90deg,rgba(255,200,120,.35),rgba(255,255,255,.15))}}
{K.CSS}
{K.GOLD_CSS}
{K.BROLL_CSS}
{JERSEY_CSS}
#pickw .gfill{{filter:drop-shadow(0 0 3px rgba(0,0,0,.85)) drop-shadow(0 0 14px rgba(255,250,190,.5)) drop-shadow(6px 8px 10px rgba(0,0,0,.7))}}
/* white jacket (v4): darker halo under the white icons and the cream CTA line so they read */
.icon img{{filter:drop-shadow(0 0 3px rgba(0,0,0,.85)) drop-shadow(0 0 5px rgba(255,255,255,.6)) drop-shadow(0 0 16px rgba(255,255,255,.35)) drop-shadow(10px 12px 12px rgba(0,0,0,.85))}}
.cf2 span{{filter:drop-shadow(0 0 3px rgba(0,0,0,.85)) drop-shadow(0 0 9px rgba(220,222,150,.3)) drop-shadow(6px 9px 10px rgba(0,0,0,.85))}}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
  <div id="stage-v" class="stage" style="z-index:1"><video id="v-edit" class="clip" data-start="0" data-duration="{D}" data-track-index="0" src="assets/{EDIT}" playsinline data-has-audio="true"></video></div>
  <div id="stage-c" class="stage" style="z-index:3" data-layout-allow-occlusion><video id="v-cut" class="clip" data-start="0" data-duration="{CUT_DUR}" data-media-start="0" data-track-index="1" src="assets/{CUT}" muted playsinline data-layout-allow-occlusion></video></div>
  {"".join(parts)}
  <div id="outro-w"><video id="v-outro" class="clip" data-start="{D - 0.3:.3f}" data-duration="{OUTRO}" data-track-index="7" src="assets/outro.mp4" muted playsinline></video></div>
  <audio id="music" class="clip" data-start="0" data-duration="{D + 0.6:.3f}" data-track-index="8" src="assets/music.mp3" data-volume="{MUSIC_VOL}" data-fade-out="0.9"></audio>
  <audio id="music-outro" class="clip" data-start="{D - 0.3:.3f}" data-duration="{OUTRO:.3f}" data-media-start="{D - 0.3:.3f}" data-track-index="8" src="assets/music.mp3" data-volume="0.32" data-fade-in="0.9" data-fade-out="0.5"></audio>
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

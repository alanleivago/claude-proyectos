# ---------------- hook: COACHES & CLUB / DIRECTORS behind the head, BULK ORDER | TEAM STORE flanking it, PICK WRONG in the caption zone ----------------
h_end = ws(11) - 0.06
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
d_end = ws(4) - 0.04
bigword("hk-kick", "COACHES &amp; CLUB", 0.10, d_end, top_for(K_SZ, 600), K_SZ, left=round(x_ink - lsb_k), width=1000, align="left", fill="wfill")
bigword("hk-dir", "DIRECTORS", ws(3) - 0.04, d_end, top_for(DIR_SZ, 790), DIR_SZ, left=round(x_ink - lsb_d), width=1000, align="left")
# 2) BULK / ORDER left, TEAM / STORE right: stacked, same size, shared baselines, equal outer margins
FL_SZ, FL_M, B1, B2 = 104, 56, 700, 812
f_end = ws(9) - 0.04
for eid, txt, wi, base, side in [("hk-b1", "BULK", 4, B1, "l"), ("hk-b2", "ORDER", 5, B2, "l"), ("hk-t1", "TEAM", 7, B1, "r"), ("hk-t2", "STORE", 8, B2, "r")]:
    lsb, w = ink(txt, FL_SZ)
    left = FL_M - lsb if side == "l" else 1080 - FL_M - w - lsb
    bigword(eid, txt, ws(wi) - 0.04, f_end, top_for(FL_SZ, base), FL_SZ, left=round(left), width=520, align="left", fill="wfill" if side == "l" else "gfill")
# 3) PICK WRONG: big red key words in the caption zone with the yellow line, exactly on "pick"
pw = ws(9) - 0.03
parts.append(f'''<div id="pickw" class="clip bw" data-start="{pw:.3f}" data-duration="{h_end - pw:.3f}" data-track-index="3" style="z-index:{z_cap};left:0;top:1050px;width:1080px" data-layout-allow-overlap>
  <div class="bwin" style="font-size:170px;line-height:190px;text-align:center;width:1080px" data-layout-allow-occlusion data-layout-allow-overlap><span class="rgb r" data-layout-allow-occlusion>PICK WRONG</span><span class="rgb c" data-layout-allow-occlusion>PICK WRONG</span><span class="rfill">PICK WRONG</span></div>
  <div class="gline" style="left:220px;top:212px;width:640px"></div></div>''')
tw.append(f'tl.fromTo("#pickw .bwin",{{opacity:0,scale:0.7,filter:"blur(12px)"}},{{opacity:1,scale:1,filter:"blur(0px)",duration:0.24,ease:"back.out(1.8)"}},{pw:.3f});')
tw.append(f'tl.fromTo("#pickw .gline",{{scaleX:0,opacity:0}},{{scaleX:1,opacity:1,duration:0.35,ease:"power2.out"}},{pw + 0.15:.3f});')
tw.append(f'tl.to("#pickw .bwin, #pickw .gline",{{opacity:0,filter:"blur(14px)",duration:0.25,ease:"power2.in"}},{h_end - 0.25:.3f});')
sfx("impact", pw + 0.03, 0.5)


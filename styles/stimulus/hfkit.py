"""Shared HyperFrames pieces for the Stimulus reels = the user's own Premiere edit ("Stimulus reels buenos").
Numbers from styles/stimulus/premiere_ref/ANALISIS.md + measured on its frames. Used by pieces/stimulus-0N-hf/prep/gen.py.

  captions : DIN Next 83.5 px, tracking -0.031em, 90 px baseline-to-baseline, rise 60 px / 0.5 s (bezier .33,0,0,1),
             opacity linear 0.04-0.43 s, white glow + dark shadow; line 2 / punch line italic white; highlights green / red italic
  icons    : user's PNG icons inverted to white (styles/stimulus/icons_png), 175 px, glow + drop shadow, centres 125 px
             under the last baseline, slots 230 px apart, rise 45 px / 0.51 s, opacity 0.06-0.44 s, land on their word
  camera   : per-frame keyframes from move types A (172->100 linear 0.77 s) B (eased push) C (staircase) D (slow linear)
             E (stacked punches), abrupt zoom-in / snap-out exactly on real cuts
  CTA      : "for a free design / and sample jersey" in Europa Grotesk SH Med like the user's graphic
"""
import json, os, shutil
from pathlib import Path
from PIL import ImageFont

KIT = Path(__file__).resolve().parent
FPS = 24000 / 1001
EUROPA = Path(os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Windows\Fonts\EuropaGroteskSH-Med.otf"))

CAP_FS, CAP_LH = 83.5, 90          # subtitle size / baseline-to-baseline
LH = {"w": 90, "it": 90, "orw": 90, "caps": 100, "big": 200, "sep": 36}
ICON, ICON_DROP = 175, 125         # icon size, last baseline -> icon centre
SLOTS = {1: [540], 2: [425, 655], 3: [310, 540, 770], 4: [190, 420, 660, 890]}
BASE_OFF = 84                      # line top -> baseline for an 83.5/90 DIN line (asc 1.2, desc .27)


def install(root):
    """copy fonts + icons into the piece (HyperFrames serves only the project dir)"""
    root = Path(root)
    (root / "assets/fonts").mkdir(parents=True, exist_ok=True)
    if EUROPA.exists() and not (root / "assets/fonts/europa-med.otf").exists():
        shutil.copyfile(EUROPA, root / "assets/fonts/europa-med.otf")
    dst = root / "assets/icons/png"
    dst.mkdir(parents=True, exist_ok=True)
    for p in (KIT / "icons_png").glob("*.png"):
        shutil.copyfile(p, dst / p.name)


# ---------------- real picture cuts + "zoom change lands ON the cut" (client 2026-11-11) ----------------
SNAP = 0.4        # a camera move / b-roll edge within 0.4 s of a real cut is moved onto the cut frame
MIN_GAP = 8       # frames: never a sliver shorter than this between two cuts or a zoom change and a cut


def ft(n):
    """time that HyperFrames maps to output frame n (a hair early so the change lands ON frame n)"""
    return round(n * 1001 / 24000 - 0.002, 4)


def picture_cuts(video, segments, cache=None):
    """Frame-exact cuts as they really are in the picture of the edit. words_edit 'at' times drift up to ~6 frames
    late in the picture (video trim rounds every segment to whole frames, audio doesn't), and the raw takes also
    contain jump cuts of their own that the segment list doesn't know. Returns sorted output-frame numbers.
    Each segment boundary: predicted frame (cumulative trim rounding) -> the strongest frame difference within
    +-4 frames. Extra cuts: single-frame spikes (diff >= 4 and >= 3.5x the local median)."""
    import math, subprocess
    import numpy as np
    video = Path(video)
    key = f"{video.stat().st_size}|{video.stat().st_mtime_ns}|{len(segments)}"
    if cache and Path(cache).exists():
        c = json.loads(Path(cache).read_text())
        if c.get("key") == key: return c["frames"]
    W, H = 96, 170
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                         capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    d = np.concatenate([[0.0], np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))])   # d[n] = change INTO frame n
    def ratio(n):
        nb = np.concatenate([d[max(1, n - 6):n], d[n + 1:n + 7]])
        return d[n] / (np.median(nb) + 0.3)
    cuts, n, drift = [], 0, 0
    for k, g in enumerate(segments):
        if "src" not in g: n = round(g["at"] * FPS)   # no source map: start from the listed time
        if k:
            n += drift; drift = 0
            lo, hi = max(1, n - 4), min(len(d) - 1, n + 4)
            # a cut is a one-frame SPIKE; a gesture is several high frames in a row (V1 7.6 s: motion at 187 beat the real cut at 182)
            sc = [d[m] - max(d[m - 1], d[min(m + 1, len(d) - 1)]) - 0.15 * abs(m - n) for m in range(lo, hi + 1)]   # ties go to the predicted frame
            m = int(lo + int(np.argmax(sc)))
            if ratio(m) >= 2.0: drift += m - n   # the picture drifts further late as the edit goes on: track it
            cuts.append(m)
        if "src" in g:
            n += math.ceil((g["src"] + g["dur"]) * FPS - 1e-9) - math.ceil(g["src"] * FPS - 1e-9)
    for m in range(2, len(d) - 1):
        if d[m] >= 4 and ratio(m) >= 3.5 and all(abs(m - c) > 6 for c in cuts):
            cuts.append(m)
    cuts = sorted(set(cuts))
    if cache: Path(cache).write_text(json.dumps({"key": key, "frames": cuts}))
    return cuts


def snap(t, cut_times, tol=SNAP):
    """move t onto the nearest real cut if it is within tol"""
    c = min(cut_times, key=lambda c: abs(c - t), default=None)
    return c if c is not None and abs(c - t) <= tol else t


def cut_report(cut_frames, label=""):
    """slivers: consecutive cuts closer than MIN_GAP frames"""
    bad = [(a, b) for a, b in zip(cut_frames, cut_frames[1:]) if b - a < MIN_GAP]
    for a, b in bad: print(f"  SLIVER {label}: cuts at frames {a} and {b} ({b - a} frames)")
    return bad


# ---------------- easing / camera ----------------
def bezier(x1, y1, x2, y2):
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            t = (lo + hi) / 2
            xt = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3
            if xt < x: lo = t
            else: hi = t
        t = (lo + hi) / 2
        return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3
    return f
PR = bezier(0.33, 0, 0, 1)          # Premiere "ease": out 0 vel / 33 %, in 100 %
LIN = lambda x: x
RAMP_DUR, RAMP_EASE = 0.40, bezier(0.25, 1, 0.5, 1)   # opening zoom-out 172->100: very fast start, brakes at the end (all reels, 2026-11-11)


def camera(bounds, D, seq, entries="OIO", cap=1.40, log=None, hook_end=0.0, a_dur=0.77, a_ease=None, snap_cuts=None, min_shot=1.6):
    """bounds = [0, cut1, ..., D].  seq = move types cycled (no type twice in a row), e.g. "BEDCB".
    entries = what each kept real cut does, cycled: O = unfinished zoom snaps back to 100 (abrupt zoom-out),
    I = abrupt zoom-in to 120 exactly on the cut (the shot before it eases home first).
    Cuts closer than 1.6 s to a neighbour keep the framing (jump cuts inside a move)."""
    cuts = [c for c in bounds[1:] if c < D - 0.05]
    keep, prev = [], 0.0
    for i, c in enumerate(cuts):
        nxt = cuts[i + 1] if i + 1 < len(cuts) else D
        if c - prev >= min_shot and nxt - c >= min_shot:
            keep.append(c); prev = c
    shots = list(zip([0.0] + keep, keep + [D]))
    ent = [None] + [entries[i % len(entries)] for i in range(len(keep))]
    segs, moves = [], []
    si, last_typ = 0, None

    def pick(rem, f):
        nonlocal si, last_typ
        fits = {"B": rem >= 1.0, "E": rem >= 1.0, "C": rem >= 3.0, "D": rem >= 1.4 and f <= 1.15}
        for off in range(len(seq)):
            typ = seq[(si + off) % len(seq)]
            if typ != last_typ and fits.get(typ):
                si += off + 1; last_typ = typ; return typ
        last_typ = "E" if last_typ != "E" else "B"; return last_typ

    for n, (a, b) in enumerate(shots):
        final = n == len(shots) - 1
        home = (not final) and ent[n + 1] == "I"          # next cut punches in: be back at 100 before it
        stop = b - (1.0 if home else 0.5)
        if n == 0:
            a_dur, a_ease = RAMP_DUR, RAMP_EASE   # client 2026-11-11: ALL reels use the speed-ramped zoom-out, a bit faster than V8's 0.55 s
            if a_ease is None:
                segs.append((a, a + a_dur, 1.72, 1.0, LIN)); f = 1.0; t = 1.35; moves.append((0.0, f"A 172->100 lineal {a_dur} s"))
            else:   # opt-in speed ramp (V8/V11 client 2026-11-10): fast start, eases out
                segs.append((a, a + a_dur, 1.72, 1.0, a_ease)); f = 1.0; t = 1.35; moves.append((0.0, f"A 172->100 rampa ease-out {a_dur} s"))
            if hook_end > 1.5:   # title behind the head: only the user's small slow push (100->109.5 in 2.7 s) so the cap hides no more letters
                f1 = 1.095; segs.append((0.9, 0.9 + 2.7, 1.0, f1, LIN)); moves.append((0.9, "D corto lineal 1.00->1.095/2.7 s (gancho)"))
                f = 1.0 + 0.095 * min(1, (hook_end - 0.9) / 2.7); f = min(f, f1); t = max(hook_end + 0.1, 3.7)
        elif ent[n] == "I":
            f = 1.2; segs.append((a, a + 0.001, f, f, LIN)); moves.append((a, "CORTE: zoom-in abrupto 100->120")); t = a + 1.1
        else:
            f = 1.0; segs.append((a, a + 0.001, f, f, LIN)); moves.append((a, "CORTE: reset abrupto ->100")); t = a + 0.45
        while t < stop - 0.4:
            rem = b - t
            if final and rem >= 2.5 and f <= 1.15:
                f1 = min(f * 1.27, cap); segs.append((t, t + 5.04, f, f1, LIN)); moves.append((t, f"D lento lineal {f:.2f}->{f1:.2f}/5 s (CTA)"))
                t = b; break
            if f > 1.17:   # tight: ease home (zoom-out with ease)
                segs.append((t, t + 0.67, f, 1.0, PR)); moves.append((t, f"vuelta con ease {f:.2f}->1.00/0.67 s")); f = 1.0; t += 1.5; continue
            typ = pick(stop - t - (0.9 if home else 0), f)
            if typ == "D":
                f1 = min(f * 1.27, cap); segs.append((t, t + 5.04, f, f1, LIN)); moves.append((t, f"D lento lineal {f:.2f}->{f1:.2f}/5 s"))
                dur = min(5.04, stop - t - (0.9 if home else 0)); f = f + (f1 - f) * dur / 5.04; t += dur + 0.05
                if home and f > 1.01:
                    segs.append((t, t + 0.67, f, 1.0, PR)); moves.append((t, "vuelta ->1.00")); f = 1.0; t += 0.8
                continue
            if typ == "C":
                f1, f2 = min(f * 1.15, cap), min(f * 1.26, cap)
                segs += [(t, t + 0.95, f, f1, PR), (t + 1.45, t + 2.55, f1, f2, PR)]
                moves.append((t, f"C escalera {f:.2f}->{f1:.2f} (hold) ->{f2:.2f}")); f = f2; t += 3.4
                continue
            if typ == "E":
                k = 0
                while k < 3 and stop - t >= 0.8 and f * 1.11 <= cap:
                    f1 = f * (1.13 if k == 0 else 1.11)
                    segs.append((t, t + 0.7, f, f1, PR)); moves.append((t, f"E golpe apilado {f:.2f}->{f1:.2f}")); f = f1; t += 1.45; k += 1
                continue
            f1 = min(f * 1.24, cap)                         # B: eased fast-long push, drifts on, eases home
            segs.append((t, t + 1.2, f, f1, PR)); moves.append((t, f"B push con ease {f:.2f}->{f1:.2f}/1.2 s")); f = f1
            if stop - t >= 3.2:
                f2 = min(f * 1.05, cap)
                segs += [(t + 1.2, t + 2.3, f, f2, LIN), (t + 2.4, t + 3.07, f2, 1.0, PR)]
                moves.append((t + 2.4, "B vuelta ->1.00")); f = 1.0; t += 3.2
            else:
                t += 1.5
        if home and f > 1.01:
            if b - t > 0.75:
                tt = max(t, b - 0.95); segs.append((tt, tt + 0.67, f, 1.0, PR)); moves.append((tt, "vuelta ->1.00 (antes del zoom-in)"))
            else:
                ent[n + 1] = "O"
    if snap_cuts:   # client 2026-11-11: a zoom change a few frames off a cut reads as two jumps -> put it ON the cut
        allc = sorted(set(list(snap_cuts) + [a for a, _ in shots[1:]]))
        fixed = []
        for (t0, t1, f0, f1, e) in segs:
            if t0 > 0.05 and all(abs(t0 - c) > 1e-3 for c in allc):
                c = snap(t0, allc)
                sh = next(((a, b) for a, b in shots if a - 1e-6 <= t0 < b), None)
                if c != t0 and sh and sh[0] - 1e-6 <= c < sh[1]:
                    t1, t0 = t1 + (c - t0), c
            fixed.append((t0, t1, f0, f1, e))
        segs = sorted(fixed, key=lambda x: x[0])
    frames = int(D * FPS) + 2
    vals, shot_i = [], 0
    for k in range(frames):
        tk = k / FPS
        while shot_i + 1 < len(shots) and tk >= shots[shot_i + 1][0]:
            shot_i += 1
        a, b = shots[shot_i]
        vals.append(value_at(segs, a, b, tk, None))
    if log is not None:
        log.extend(moves)
    return vals, moves, shots


def value_at(segs, a, b, t, default):
    v = default if default is not None else 1.0
    for (t0, t1, f0, f1, e) in segs:
        if t0 < a - 1e-6 or t0 >= b:
            continue
        if t >= t0:
            v = f1 if t >= t1 else f0 + (f1 - f0) * e((t - t0) / (t1 - t0))
    return v


def camera_js(cam_sel, vals, base):
    """one tl.set per output frame where the scale changes (seek-safe: the last passed set wins)"""
    ts, vs, prev = [], [], None
    for k, v in enumerate(vals):
        sv = round(base * v, 4)
        if sv != prev:
            ts.append(max(0, round(k * 1001 / 24000 - 0.002, 4))); vs.append(sv); prev = sv
    return "\n".join(f'tl.set({cam_sel},{{scale:{v}}},{t});' for t, v in zip(ts, vs))


# ---------------- captions ----------------
def fmt(t):
    import html
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


def rise(tw, sel, t, dy=60, dur=0.5, op0=0.04, op1=0.43):
    """the user's Transform entry: y +60 -> 0 in 0.5 s (bezier), opacity 0->100 linear 0.04-0.43 s, motion blur"""
    tw.append(f'tl.fromTo("{sel}",{{y:{dy},filter:"blur(3px)"}},{{y:0,filter:"blur(0px)",duration:{dur},ease:"pr"}},{t:.3f});')
    tw.append(f'tl.fromTo("{sel}",{{opacity:0}},{{opacity:1,duration:{op1 - op0:.2f},ease:"none"}},{t + op0:.3f});')
    tw.append(f'tl.set("{sel}",{{opacity:0}},0);')


def icon(parts, tw, nid, name, x_center, y_center, t0, t1, size=None):
    size = size or ICON
    iid = nid("ic")
    parts.append(f'<div id="{iid}" class="clip icon" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="4" '
                 f'style="z-index:51;left:{x_center - size / 2:.0f}px;top:{y_center - size / 2:.0f}px;width:{size}px;height:{size}px">'
                 f'<img src="assets/icons/png/{name}.png" alt=""></div>')
    tw.append(f'tl.fromTo("#{iid} img",{{y:45}},{{y:0,duration:0.51,ease:"pr"}},{t0:.3f});')
    tw.append(f'tl.fromTo("#{iid} img",{{opacity:0}},{{opacity:1,duration:0.38,ease:"none"}},{t0 + 0.06:.3f});')
    return iid


def icon_row(parts, tw, nid, icons, ws, last_base, t_block, t1, log=None, stagger=0.12, late_to_first=False):
    """icons [(name, word)] land on their spoken word; same word -> staggered 0.12 s; row under the last baseline.
    late_to_first (v5+): an icon whose word comes late in the block (second half of its screen time, or <1.3 s left)
    enters with the block's FIRST line instead (user, 2026-11-07: store icon on "Their uniforms came from", not on "brand")"""
    n = len(icons)
    xs = SLOTS.get(n, [540 + (m - (n - 1) / 2) * 230 for m in range(n)])
    out = []
    eff = []
    for ic, wi in icons:
        tw_ = ws(wi)
        if late_to_first and (tw_ - t_block > 0.5 * (t1 - t_block) or t1 - tw_ < 1.3):
            tw_ = t_block
        eff.append(max(tw_, t_block))
    if late_to_first:   # a right-hand icon pulled to the first line pulls the ones on its left too (row fills left to right)
        for m in range(len(eff) - 2, -1, -1):
            eff[m] = min(eff[m], eff[m + 1])
    for m, (ic, wi) in enumerate(icons):
        ti = eff[m] + stagger * sum(1 for e in eff[:m] if abs(e - eff[m]) < 1e-6)
        icon(parts, tw, nid, ic, xs[m], last_base + ICON_DROP, ti, t1)
        out.append((ic, wi, ti))
        if log is not None:
            log.append((ic, wi, round(ws(wi), 3), round(ti, 3)))
    return out


def europa_w(txt, sz, track=0.006):
    F = ImageFont.truetype(str(EUROPA), round(sz))
    b = F.getbbox(txt, anchor="ls")
    return (b[2] - b[0]) * sz / round(sz) + (len(txt) - 1) * track * sz


def cta_free(parts, tw, nid, t1, t_end, base1=1000, l1="for a free design", l2="and sample jersey", tint="green", dt2=0.783):
    """the user's CTA graphic (Premiere, 451.98 s): line 1 Europa Med 95.6 white +6; line 2 italic 91 x103 %, +93 px,
    gradient #BDBE83 -> #F8F8F6, 0.78 s later; jersey 165 px tinted, rot 8 deg, on the top-right of 'design', +0.117 s"""
    w1 = europa_w(l1, 95.6)
    x_end = 540 + w1 / 2
    a = nid("cf")
    top1 = round(base1 - 85.4)             # line box 120 px: Europa asc .77/desc .24 em -> baseline 85.4 px from the box top
    parts.append(f'<div id="{a}" class="clip cfw" data-start="{t1:.3f}" data-duration="{t_end - t1:.3f}" data-track-index="5" style="z-index:52;top:{top1}px">'
                 f'<div class="cf1">{l1}</div></div>')
    tw.append(f'tl.fromTo("#{a} .cf1",{{y:103}},{{y:0,duration:0.43,ease:"pr"}},{t1:.3f});')
    tw.append(f'tl.fromTo("#{a} .cf1",{{opacity:0}},{{opacity:1,duration:0.11,ease:"none"}},{t1 + 0.015:.3f});')
    t2 = t1 + dt2
    b = nid("cf")
    parts.append(f'<div id="{b}" class="clip cfw" data-start="{t2:.3f}" data-duration="{t_end - t2:.3f}" data-track-index="5" style="z-index:52;top:{round(base1 + 93 - 84)}px">'
                 f'<div class="cf2"><span>{l2}</span></div></div>')
    tw.append(f'tl.fromTo("#{b} .cf2",{{y:103}},{{y:0,duration:0.43,ease:"pr"}},{t2:.3f});')
    tw.append(f'tl.fromTo("#{b} .cf2",{{opacity:0}},{{opacity:1,duration:0.11,ease:"none"}},{t2 + 0.015:.3f});')
    # Gaussian-blur flicker of the user's line 2 (0 -> peak in 0.21 s -> settled by 0.43 s) + Compound-Arithmetic dips
    tw.append(f'tl.fromTo("#{b} .cf2",{{filter:"blur(0px) brightness(1)"}},{{keyframes:[{{filter:"blur(7px) brightness(1.15)",duration:0.21}},{{filter:"blur(0.6px) brightness(1)",duration:0.22}}]}},{t2:.3f});')
    tw.append(f'tl.fromTo("#{b} .cf2 span",{{opacity:1}},{{keyframes:[{{opacity:.45,duration:.07}},{{opacity:1,duration:.07}},{{opacity:.7,duration:.1}},{{opacity:1,duration:.1}}]}},{t2 + 0.12:.3f});')
    tj = t1 + 0.117
    c = nid("cf")
    parts.append(f'<div id="{c}" class="clip cfj" data-start="{tj:.3f}" data-duration="{t_end - tj:.3f}" data-track-index="5" '
                 f'style="z-index:51;left:{x_end - 8 - 82.5:.0f}px;top:{base1 - 62 - 82.5:.0f}px"><img src="assets/icons/png/jersey_{tint}.png" alt=""></div>')
    tw.append(f'tl.fromTo("#{c} img",{{y:43}},{{y:0,duration:0.51,ease:"pr"}},{tj:.3f});')
    tw.append(f'tl.fromTo("#{c} img",{{opacity:0}},{{opacity:1,duration:0.38,ease:"none"}},{tj + 0.06:.3f});')
    for s in (a, b, c):
        tw.append(f'tl.set("#{s} > *",{{opacity:0}},0);')
    return x_end


# v5+ only (user, 2026-11-07): big words / titles / key words go back to the OLD, more yellow gradient + feathered RGB.
# Appended AFTER CSS by the v5+ gen.py; v1-v4 (approved) never include it.
# ---------------- b-roll cutaways with the user's Premiere film burn (2026-11-10) ----------------
BURN_DIR = KIT / "assets/premiere_burn"
FB_PRE, FB_DUR = 0.43, 0.75     # FilmBurnTransition7_Best8: starts 0.43 s before the cut, brightest 0.26-0.42 s, black after
PC_PRE, PC_DUR, PC_OP = 0.16, 0.10, 0.39   # Purple Cinemarker: 0.10 s at 135 %, opacity 39 %, 0.16 s before the cut


def broll(root, parts, tw, audio, plan, burn_vol=0.9, push=0.07, z=20, cuts=None):
    """plan: [(src, src_start, t_in, t_out, crop_x)] -> 1080x1920 cutaways over the talking head (voice keeps going,
    captions/icons on top), a slow push-in, and the Premiere film burn + purple flash on the cut in AND the cut out."""
    import subprocess
    root = Path(root)
    bdir = root / "assets/broll"; bdir.mkdir(parents=True, exist_ok=True)
    for f in ("fb_v.mp4", "pc_v.mp4", "fb.wav"):
        if not (bdir / f).exists(): shutil.copyfile(BURN_DIR / f, bdir / f)
    for k, (src, ss, t0, t1, cx) in enumerate(plan):
        if cuts:   # client 2026-11-11: b-roll edges land ON a nearby real cut so the burn hides it (no 1-3 frame sliver)
            t0, t1 = snap(t0, cuts), snap(t1, cuts)
        t0, t1 = ft(round(t0 * FPS + 0.1)), ft(round(t1 * FPS + 0.1))   # frame-exact edges: no 1-frame sliver of the head between burn and b-roll
        d = t1 - t0
        out = bdir / f"b{k + 1}.mp4"
        key = f"{src}|{ss}|{d:.3f}|{cx}"
        tag = out.with_suffix(".key")
        if not Path(src).exists() and out.exists():   # source deleted (b-roll folder cleaned): reuse the rendered cut
            keep = bdir / f"b{k + 1}_orig.mp4"
            if not keep.exists(): shutil.copyfile(out, keep)
            have = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(keep)],
                                        capture_output=True, text=True).stdout)
            if tag.read_text(encoding="utf-8") != key:
                sp = max(1.0, (d + 0.1) / have)   # longer than the old cut -> gentle slow motion to fit
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(keep), "-vf", f"setpts={sp:.4f}*PTS,fps=24000/1001,format=yuv420p",
                                "-an", "-c:v", "libx264", "-crf", "16", str(out)], check=True)
                print(f"  b-roll b{k + 1}: source missing, reused rendered cut (speed x{1 / sp:.2f})")
                tag.write_text(key, encoding="utf-8")
        elif not out.exists() or not tag.exists() or tag.read_text(encoding="utf-8") != key:
            vf = (f"scale=-2:1920:flags=lanczos,crop=1080:1920:'max(0,min(iw-1080,iw*{cx}-540))':0,"
                  f"fps=24000/1001,format=yuv420p")
            # portrait sources: scale width instead
            pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                            "stream=width,height:stream_side_data=rotation", "-of", "json", str(src)],
                                           capture_output=True, text=True).stdout)["streams"][0]
            w, h = pr["width"], pr["height"]
            rot = next((abs(int(sd.get("rotation", 0))) for sd in pr.get("side_data_list", []) if "rotation" in sd), 0)
            if rot % 180 == 90: w, h = h, w
            if w / h < 1080 / 1920:
                vf = (f"scale=1080:-2:flags=lanczos,crop=1080:1920:0:'(ih-1920)/2',fps=24000/1001,format=yuv420p")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-i", str(src), "-t", f"{d + 0.1:.3f}",
                            "-vf", vf, "-an", "-c:v", "libx264", "-crf", "16", "-preset", "medium", str(out)], check=True)
            tag.write_text(key, encoding="utf-8")
        bid = f"broll{k + 1}"
        parts.append(f'<div id="{bid}w" class="brw" style="z-index:{z}"><video id="{bid}" class="clip" data-start="{t0:.3f}" '
                     f'data-duration="{d:.3f}" data-track-index="5" src="assets/broll/b{k + 1}.mp4" muted playsinline></video></div>')
        tw.append(f'tl.fromTo("#{bid}w",{{scale:1}},{{scale:{1 + push},duration:{d:.3f},ease:"none"}},{t0:.3f});')
        for j, t in enumerate((t0, t1)):
            fid = f"{bid}fb{j}"
            parts.append(f'<div class="burnw" style="z-index:80" data-layout-allow-occlusion><video id="{fid}" data-layout-allow-occlusion class="clip" data-start="{t - FB_PRE:.3f}" '
                         f'data-duration="{FB_DUR:.3f}" data-track-index="{10 + j}" src="assets/broll/fb_v.mp4" muted playsinline></video></div>')
            parts.append(f'<div class="burnw" style="z-index:81;opacity:{PC_OP}" data-layout-allow-occlusion><video id="{fid}p" data-layout-allow-occlusion class="clip" data-start="{t - PC_PRE:.3f}" '
                         f'data-duration="{PC_DUR:.3f}" data-track-index="{12 + j}" src="assets/broll/pc_v.mp4" muted playsinline></video></div>')
            audio.append(f'<audio id="{fid}a" class="clip" data-start="{t - FB_PRE:.3f}" data-duration="{FB_DUR:.3f}" data-track-index="{14 + j}" '
                         f'src="assets/broll/fb.wav" data-volume="{burn_vol}"></audio>')


BROLL_CSS = """
.brw{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;transform-origin:50% 50%}
.brw video{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;filter:brightness(.84) contrast(1.06)}
.burnw{position:absolute;left:0;top:0;width:1080px;height:1920px;mix-blend-mode:screen;pointer-events:none}
.burnw video{width:1080px;height:1920px}
"""


GOLD_CSS = """
.gfill,.cap .capw .gfill{background:linear-gradient(180deg,#ffffff 0%,#fbf8dc 45%,#ece88f 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.cream{background:linear-gradient(180deg,#fffef2 0%,#f6f3c4 55%,#e7e98f 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
"""

HEAD = ('<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>\n'
        '<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/CustomEase.min.js"></script>')
EASES = 'gsap.registerPlugin(CustomEase); CustomEase.create("pr","M0,0 C0.33,0 0,1 1,1");'

# appended after each piece's own CSS: overrides the caption / icon look with the user's Premiere values
CSS = """
@font-face{font-family:"Europa";src:url("assets/fonts/europa-med.otf") format("opentype");font-weight:500;font-style:normal}
.cap .ln{font-size:83.5px;line-height:90px;letter-spacing:-0.031em;color:#fff;padding:0;
  text-shadow:0 0 1px rgba(0,0,0,.45),5px 7px 12px rgba(0,0,0,.62),0 0 14px rgba(255,255,255,.42),0 0 34px rgba(255,255,255,.2)}
.cap .ln.it{font-style:italic;font-size:83.5px;line-height:90px;padding:0 16px}
.cap .ln.it .cream{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:#fff;filter:none;padding:0;margin:0;
  text-shadow:0 0 1px rgba(0,0,0,.45),5px 7px 12px rgba(0,0,0,.62),0 0 14px rgba(255,255,255,.42),0 0 34px rgba(255,255,255,.2)}
.cap .grn{font-style:italic;color:#78ff00;text-shadow:0 0 1px rgba(0,0,0,.5),5px 7px 12px rgba(0,0,0,.6),0 0 12px rgba(150,255,60,.75),0 0 30px rgba(120,255,0,.4)}
.cap .red{font-style:italic;color:#f92f2f;text-shadow:0 0 2px rgba(0,0,0,.85),5px 7px 12px rgba(0,0,0,.65),0 0 14px rgba(255,50,50,.7),0 0 30px rgba(255,40,40,.35)}
.cap .ln.capw,.cap .ln.bigw{text-shadow:none}
.cap .capw{height:100px}
.cap .capw .bwin{font-size:92px;line-height:100px;letter-spacing:-0.01em;font-style:italic;padding:0 18px;box-sizing:border-box}
.cap .capw .gfill{background:linear-gradient(180deg,#cdc9a9 0%,#f1efe2 50%,#ffffff 94%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 2px rgba(0,0,0,.55)) drop-shadow(0 0 12px rgba(255,255,240,.45)) drop-shadow(5px 7px 9px rgba(0,0,0,.6))}
.cap .capw .rgb{opacity:.38;filter:blur(4px)}
.cap .capw .bwin span{padding:0 .3em;box-sizing:border-box}   /* italic + background-clip:text: room for the last letter's overhang */
.cap .capw .rgb.r{transform:translateX(-3px)}
.cap .capw .rgb.c{transform:translateX(3px)}
.gfill{background:linear-gradient(180deg,#ece4a0 0%,#fbf8e4 50%,#ffffff 94%);-webkit-background-clip:text;background-clip:text;color:transparent}
.icon{position:absolute;filter:none}
.icon img{width:100%;height:100%;filter:drop-shadow(0 0 2px rgba(0,0,0,.7)) drop-shadow(0 0 5px rgba(255,255,255,.7)) drop-shadow(0 0 16px rgba(255,255,255,.4)) drop-shadow(10px 12px 12px rgba(0,0,0,.8))}
.cfw{position:absolute;left:0;width:1080px;text-align:center;overflow:visible}
.cf1{font-family:"Europa",sans-serif;font-weight:500;font-size:95.6px;line-height:120px;letter-spacing:.006em;color:#fff;white-space:nowrap;
  text-shadow:0 0 1px rgba(0,0,0,.4),6px 9px 14px rgba(0,0,0,.7),0 0 14px rgba(255,255,255,.5),0 0 36px rgba(255,255,255,.22)}
.cf2{font-family:"Europa",sans-serif;font-weight:500;font-size:91px;line-height:120px;letter-spacing:.006em;white-space:nowrap;transform:scale(1.03);transform-origin:50% 70%}
.cf2 span{display:inline-block;font-style:italic;padding:0 .15em;
  background:linear-gradient(180deg,#a7a861 17px,#bdbe83 34px,#f8f8f6 80px,#f8f8f6 120px);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 2px rgba(0,0,0,.7)) drop-shadow(0 0 9px rgba(220,222,150,.35)) drop-shadow(6px 9px 10px rgba(0,0,0,.8))}
.cfj{position:absolute;width:165px;height:165px}
.cfj img{width:165px;height:165px;transform:rotate(8deg);
  filter:brightness(1.6) saturate(1.08) drop-shadow(0 0 10px rgba(60,220,140,.85)) drop-shadow(0 0 34px rgba(40,200,120,.5)) drop-shadow(14px 16px 22px rgba(0,0,0,.75))}
"""

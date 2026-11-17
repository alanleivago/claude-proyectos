"""MetalShadow eye atlas: new expressions painted in the model's own eye style (grey head metal, black visor with a 1 px
dark-grey rim, red U-shaped pupil ring with a dark-red rim and a black slot). No mouth on this model: "+talk" cells pulse
the pupils (brighter ring, lit slot) so a talk track alternates <expr> / <expr>+talk.

    python build_face.py      # -> tex/ms_eyes.png (8 x 5 cells of 128 x 64), review/face_cells.png

Cell layout = the pack's Eyes.png: left half = the screen-left eye block (outer edge at x 0, nose at x 64), right half = the
same block mirrored for the screen-right eye. build_ms.py maps the eye quads' UVs onto cell 0 (screen-right eye mirrored),
so every cell is drawn exactly as it reads from the front. Block coords: x 0 = outer, 64 = nose; y 0 = top.
Visible part of a block (the eye quads' UV footprint): (0,12) (35,3) (64,11) (64,52) (33,64) (8,51)."""
import os, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GREY, RIM, AA, BLACK = (77, 77, 77), (43, 43, 43), (58, 58, 58), (0, 0, 0)
RED, RED_RIM, RED_DK = (255, 0, 0), (192, 0, 0), (144, 0, 0)
GLOW, GLOW_RIM, GLOW_SLOT = (255, 120, 80), (255, 40, 20), (200, 0, 0)
SS = 4                                      # supersampling for the shapes, thresholded back to hard pixels
COLS, ROWS, CW, CH = 8, 5, 128, 64
OUTER = [(17, 15.5), (12, 20.5), (9, 27), (8.6, 38), (10.6, 44), (13.6, 50), (16.6, 56), (19.6, 63), (20, 70)]   # visor's outer edge


def mask_from(draw_fn):
    m = Image.new("L", (64 * SS, 64 * SS), 0)
    draw_fn(ImageDraw.Draw(m), SS)
    return m.resize((64, 64), Image.BOX).point(lambda v: 255 if v >= 128 else 0)


def curve(y0, ym, y1):
    """quadratic brow/lid line through (0,y0) (32,ym) (64,y1): returns y(x)"""
    a = (y0 - 2 * ym + y1) / (2 * 32 * 32); b = (ym - y0) / 32 - a * 32
    return lambda x: y0 + b * x + a * x * x


def eye(brow=(7, 23.7, 40.5), low=None, pupil="U", dx=0, dy=0, sc=1.0, talk=False, slit=None):
    """one 64x64 eye block. brow: top edge of the visor (y at x 0/32/64); low: optional bottom edge (squint / happy);
    pupil: 'U' (the original ring), 'O' (closed capsule ring, shows its top), 'arc' (happy upside-down U), 'none';
    slit: draw the closed-eye slit as a 1 px red line at that y range (blink)."""
    by = curve(*brow); ly = curve(*low) if low else None

    def visor(d, s):
        top = [(x, by(x)) for x in range(0, 65, 2)]
        poly = [(x, y) for x, y in OUTER] + [(64, 70)] + [(64, by(64))] + top[::-1]
        d.polygon([(x * s, y * s) for x, y in poly], fill=255)
    V = mask_from(visor)
    # cut everything above the brow and (optionally) below the low line, then the outer edge
    def keep(d, s):
        pts = [(x, by(x)) for x in range(-2, 67, 2)]
        bot = [(x, ly(x)) for x in range(66, -3, -2)] if ly else [(66, 70), (-2, 70)]
        d.polygon([(x * s, y * s) for x, y in pts + bot], fill=255)
    K = mask_from(keep)
    v = (np.array(V) > 0) & (np.array(K) > 0)
    img = np.zeros((64, 64, 3), np.uint8); img[:] = GREY
    img[v] = BLACK
    # visor rim: visor pixels touching grey (4-neighbour) -> RIM; grey pixels diagonal-only to the visor -> AA
    pad = np.pad(v, 1, constant_values=False)
    n4 = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
    rim = v & ~n4
    rim[:, 63] = v[:, 63] & ~(pad[:-2, 64] & pad[2:, 64])      # the nose seam (x 63) is not an edge
    img[rim] = RIM
    d8 = pad[:-2, :-2] | pad[:-2, 2:] | pad[2:, :-2] | pad[2:, 2:]
    any4 = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    img[~v & d8 & ~any4] = AA
    inner = v & ~rim
    # pupil
    cx, w = 42.5 + dx, 8 * sc
    if pupil in ("U", "O"):
        cy = 47.5 + dy; top = (27 if pupil == "U" else cy - 18 * sc) + (dy if pupil == "U" else 0)
        def ring(d, s, hw=w, r=w, t=top, by_=cy):
            if pupil == "U":
                d.rectangle([(cx - hw) * s, (t - 30) * s, (cx + hw) * s, by_ * s], fill=255)
            else:
                d.rectangle([(cx - hw) * s, (t + r) * s, (cx + hw) * s, max(t + r, by_) * s], fill=255)
                d.ellipse([(cx - r) * s, t * s, (cx + r) * s, (t + 2 * r) * s], fill=255)
            d.ellipse([(cx - r) * s, (by_ - r) * s, (cx + r) * s, (by_ + r) * s], fill=255)
        P = np.array(mask_from(ring)) > 0
        hw2 = 3.5 * sc
        S = np.array(mask_from(lambda d, s: ring(d, s, hw=hw2, r=hw2, t=top + (0 if pupil == "U" else 4.5 * sc), by_=cy - 6.5 * sc))) > 0
        S &= P
        ring0 = P & ~S                                     # rim from the unclipped ring: no rim where the lid cuts it
        pp = np.pad(ring0, 1, constant_values=False)
        r4 = pp[:-2, 1:-1] & pp[2:, 1:-1] & pp[1:-1, :-2] & pp[1:-1, 2:]
        P &= inner; S &= inner
        ring_px = ring0 & inner
        edge = ring_px & ~r4
        img[ring_px] = GLOW if talk else RED
        img[edge] = GLOW_RIM if talk else RED_RIM
        img[S] = GLOW_SLOT if talk else BLACK
    elif pupil == "arc":                                   # happy: red upside-down U (closed smiling eye) along the band
        def arc(d, s):
            d.ellipse([(cx - 11 * sc) * s, (36 + dy) * s, (cx + 11 * sc) * s, (58 + dy) * s], fill=255)
        def hole(d, s):
            d.ellipse([(cx - 6.5 * sc) * s, (41.5 + dy) * s, (cx + 6.5 * sc) * s, (63 + dy) * s], fill=255)
            d.rectangle([0, (47 + dy) * s, 64 * s, 64 * s], fill=255)
        P0 = (np.array(mask_from(arc)) > 0) & ~(np.array(mask_from(hole)) > 0)
        pp = np.pad(P0, 1, constant_values=False)
        P = P0 & inner
        edge = P & ~(pp[:-2, 1:-1] & pp[2:, 1:-1] & pp[1:-1, :-2] & pp[1:-1, 2:])
        img[P] = GLOW if talk else RED; img[edge] = GLOW_RIM if talk else RED_RIM
    if slit is not None:                                   # blink: 1 px red line across the pupil's width
        for x in range(int(cx - w), int(cx + w) + 1):
            for y in range(64):
                if inner[y, x] and abs(y - (by(x) + slit)) < 0.5:
                    img[y, x] = GLOW if talk else RED
    return Image.fromarray(img)


def cell(L, R=None):
    R = R or L
    c = Image.new("RGB", (CW, CH))
    c.paste(eye(**L), (0, 0)); c.paste(eye(**R).transpose(Image.FLIP_LEFT_RIGHT), (64, 0))
    return c


N0 = {}
EXPR = [  # name, left (screen-left eye) params, right params (None = same)
    ("neutral", N0, None),
    ("open", dict(brow=(3, 16, 30)), None),
    ("blink", dict(brow=(40, 44, 47), low=(46, 50, 53), pupil="none", slit=2.5), None),
    ("half", dict(brow=(22, 30, 38), dy=1), None),
    ("happy", dict(brow=(33, 25, 35), low=(50, 42, 52), pupil="arc", sc=1.15, dy=-3), None),
    ("angry", dict(brow=(-6, 22, 50), dy=3, sc=0.88), None),
    ("sad", dict(brow=(30, 20, 13), low=(70, 70, 70), dy=3, sc=0.9), None),
    ("surprised", dict(brow=(2, 6, 14), pupil="O", sc=0.78, dy=-1), None),
    ("skeptical", dict(brow=(31, 33, 37), dy=2), dict(brow=(2, 9, 20), pupil="U")),
    ("deadpan", dict(brow=(31, 33, 36), dy=1), None),
    ("smug", dict(brow=(22, 30, 41), low=(56, 50, 52), dx=-3, dy=1), None),
    ("unimpressed", dict(brow=(36, 37, 40), dy=3), None),
    ("annoyed", dict(brow=(18, 31, 46), low=(58, 54, 56), dy=3, sc=0.9), None),
    ("sleepy", dict(brow=(42, 42, 41), low=(54, 52, 54), dy=6), None),
    ("lookL", dict(dx=-7), dict(dx=7)),
    ("lookR", dict(dx=6), dict(dx=-7)),
    ("lookUp", dict(brow=(3, 14, 27), pupil="O", dy=-7, sc=0.9), None),
    ("lookDown", dict(brow=(26, 32, 42), dy=6), None),
    ("worried", dict(brow=(24, 14, 8), pupil="O", sc=0.82, dy=2), None),
    ("wink", dict(brow=(40, 44, 47), low=(46, 50, 53), pupil="none", slit=2.5), N0),
]
assert len(EXPR) * 2 == COLS * ROWS


def build():
    names = [e[0] for e in EXPR] + [e[0] + "+talk" for e in EXPR]
    sheet = Image.new("RGB", (CW * COLS, CH * ROWS))
    cells = []
    for talk in (False, True):
        for name, L, R in EXPR:
            Lp = dict(L, talk=talk); Rp = dict(R, talk=talk) if R is not None else None
            cells.append(cell(Lp, Rp))
    for k, c in enumerate(cells):
        sheet.paste(c, ((k % COLS) * CW, (k // COLS) * CH))
    os.makedirs(os.path.join(HERE, "tex"), exist_ok=True); os.makedirs(os.path.join(HERE, "review"), exist_ok=True)
    sheet.save(os.path.join(HERE, "tex", "ms_eyes.png"))
    # review sheet: every base cell x4 (and its +talk) with its name; the eye quads' visible footprint outlined
    Z = 3; pw, ph = CW * Z, CH * Z
    rev = Image.new("RGB", (5 * (pw + 16) + 16, 8 * (ph + 40) + 60), (24, 24, 28))
    d = ImageDraw.Draw(rev)
    try: f = ImageFont.truetype("arial.ttf", 20)
    except Exception: f = ImageFont.load_default()
    d.text((16, 16), "MetalShadow eye cells (x3, nearest) - left 4 cols = base, '+talk' = pupils pulse (no mouth on this model)", font=f, fill=(230, 230, 230))
    foot = [(0, 12), (35, 3), (64, 11), (64, 52), (33, 64), (8, 51)]
    order = list(range(len(EXPR)))
    for slot, i in enumerate(order):
        col, row = slot % 5, slot // 5
        for t in (0, 1):
            k = i + t * len(EXPR)
            x0 = 16 + col * (pw + 16); y0 = 60 + (row * 2 + t) * (ph + 40)
            im = cells[k].resize((pw, ph), Image.NEAREST)
            rev.paste(im, (x0, y0 + 26))
            for off in (0, 64):
                pts = [((off + (x if off == 0 else 64 - x)) * Z + x0, y * Z + y0 + 26) for x, y in foot]
                d.line(pts + [pts[0]], fill=(60, 200, 255), width=1)
            d.text((x0, y0 + 2), names[k], font=f, fill=(255, 230, 140) if t == 0 else (200, 200, 200))
    rev.save(os.path.join(HERE, "review", "face_cells.png"))
    return names


if __name__ == "__main__":
    names = build()
    meta = {"cells": COLS * ROWS, "cols": COLS, "rows": ROWS, "cell_px": [CW, CH], "talk_suffix": "+talk",
            "ms_eyes": names, "ms_mouth": [], "aliases": {"lookside": "lookL", "frown": None},
            "note": ("40 cells: cell k = column k % cols, row k // cols (row 0 = top). build_ms.py maps the eye UVs onto ONE cell "
                     "at the top-left, so an engine only sets map.offset = ((k % cols)/cols, floor(k/cols)/rows) on the "
                     "'ms_eyes' material (glTF textures, flipY=false), no repeat. No mouth: the third column of every track "
                     "is always 'none'; speech = alternate <expr> and <expr>+talk (pupils pulse). L/R = screen left/right "
                     "seen from the front.")}
    json.dump(meta, open(os.path.join(HERE, "tex", "ms_eyes_meta.json"), "w"), indent=1)
    print("FACE DONE", len(names), "cells")

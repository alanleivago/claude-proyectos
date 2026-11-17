"""Face atlases for upnext-girl, in the engine layout of zero_fem (face_eyes.png / face_mouth.png, 16 cells of 64x64).

    python pieces/upnext-girl/paint_face.py        -> tex/face_eyes.png, tex/face_mouth.png, review/face_atlas.png

Every cell is the whole face block (planar front projection of the head: x -1.05..1.05 -> px 0..64,
z 3.35..1.25 -> rows 0..64). face_eyes is used by the head polys above z 2.10 (row 38), face_mouth by the
ones below, so eyes live in rows 12-37 and mouths/blush below row 39. Same expression names/order as zero_fem,
so face_tracks.json works unchanged. Style copied from the author's Ashley_Face.png: big blocked-in eyes
(grey sclera, dark green iris, brown pupil, white square highlight, thick dark lash), thin brows, orange fringe
strands painted down the middle, darker skin on top/sides and a light lower face (lit from the front and above).
"""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
C, N = 64, 16
EYES = ["open", "half", "blink", "happy", "surprised", "angry", "sad", "wink",
        "hearts", "shocked", "dizzy", "relaxed", "disgust", "smirk", "soft", "sparkle"]
MOUTHS = ["neutral", "smile", "smileOpen", "talkA", "talkO", "surprised", "frown", "shout",
          "blep", "cat", "gasp", "bigShock", "disgust", "smirk", "blushSmile", "blushGasp"]

SKIN_U, SKIN_L, SKIN_S = (242, 178, 130), (252, 208, 160), (226, 150, 112)
HAIR, HAIR_M, HAIR_D = (247, 184, 101), (238, 150, 70), (214, 112, 40)
LASH, LASH2, LID, BROW = (58, 30, 26), (110, 58, 44), (176, 112, 84), (150, 92, 60)
SCL, SCL_D = (226, 226, 222), (196, 196, 196)
IRIS, IRIS_D, IRIS_L, PUP = (30, 118, 24), (18, 82, 16), (76, 160, 60), (66, 32, 24)
WHITE = (255, 255, 255)
MOUTH, MOUTH_D, TONGUE, TEETH = (196, 120, 92), (122, 46, 40), (220, 110, 96), (250, 250, 246)
BLUSH = (246, 140, 136)
PINK_D, PINK, PINK_L = (150, 30, 80), (222, 70, 130), (255, 150, 190)

EL = (6, 15, 29, 36)            # left (screen) eye box x0,y0,x1,y1 ; right eye = mirror x -> 63-x
MY = 48                          # mouth row


def base():
    im = Image.new("RGB", (C, C), SKIN_U); d = ImageDraw.Draw(im)
    d.polygon([(8, 64), (8, 44), (14, 39), (50, 39), (56, 44), (56, 64)], fill=SKIN_L)     # lit lower face
    d.rectangle([0, 0, 3, 63], fill=SKIN_S); d.rectangle([60, 0, 63, 63], fill=SKIN_S)
    # fringe painted on the face (top, hidden mostly by the hair mesh) + strands down the middle
    d.rectangle([0, 0, 63, 5], fill=HAIR)
    d.polygon([(22, 5), (34, 5), (30, 24)], fill=HAIR)
    d.polygon([(30, 5), (36, 5), (32, 20)], fill=HAIR_M)
    d.polygon([(36, 5), (46, 5), (41, 15)], fill=HAIR)
    d.polygon([(10, 5), (22, 5), (14, 14)], fill=HAIR)
    d.line([(31, 12), (30, 22)], fill=HAIR_D)
    d.point([(9, 52), (54, 52)], fill=SKIN_S)                                                   # ear hint
    return im


def mirror_box(b): return (63 - b[2], b[1], 63 - b[0], b[3])


def brow(d, kind, side):
    x0, x1 = (7, 27)
    pts = {"normal": [(x0, 14), (x0 + 4, 12), (x1 - 4, 12), (x1, 13)],
           "up": [(x0, 12), (x0 + 4, 10), (x1 - 4, 10), (x1, 11)],
           "angry": [(x0, 12), (x0 + 6, 13), (x1 - 3, 14), (x1, 15)],
           "sad": [(x0, 14), (x0 + 6, 13), (x1 - 4, 12), (x1, 11)],
           "smirk_up": [(x0, 11), (x0 + 4, 9), (x1 - 4, 10), (x1, 12)]}[kind]
    if side == "R": pts = [(63 - x, y) for x, y in pts]
    d.line(pts, fill=BROW, width=1)


def eye_open(d, b, side, iris=IRIS, small=False, lid=0, look=0):
    x0, y0, x1, y1 = b
    d.ellipse([x0, y0 + lid, x1, y1 + 1], fill=SCL)
    d.rectangle([x0 + 1, y1 - 2, x1 - 1, y1], fill=SCL_D)
    cx = (x0 + x1) // 2 + (1 if side == "L" else -1) + look
    if small:
        d.ellipse([cx - 3, y0 + 6, cx + 3, y0 + 13], fill=iris); d.ellipse([cx - 1, y0 + 8, cx + 1, y0 + 10], fill=PUP)
    else:
        d.rounded_rectangle([cx - 7, y0 + 3 + lid, cx + 6, y1], radius=4, fill=iris)
        d.rounded_rectangle([cx - 6, y1 - 3, cx + 5, y1], radius=2, fill=IRIS_D)
        d.rectangle([cx - 5, y0 + 3 + lid, cx + 4, max(y0 + 3 + lid, y0 + 8 + lid // 2)], fill=PUP)
        d.rectangle([cx - 6, y0 + 4 + lid, cx - 3, y0 + 7 + lid], fill=WHITE)          # square highlight (upper left)
        d.point([(cx + 3, y1 - 2)], fill=IRIS_L)
    # thick upper lash with a little outer wing, thin lower lid
    top = y0 + lid
    d.line([(x0, top + 3), (x0 + 3, top), (x1 - 3, top), (x1, top + 2)], fill=LASH, width=2)
    wx = x0 - 2 if side == "L" else x1 + 2
    d.line([(x0 if side == "L" else x1, top + 3), (wx, top + 4)], fill=LASH, width=1)
    d.line([(x0 + 3, y1 + 1), (x1 - 3, y1 + 1)], fill=LID)


def closed(d, b, side, shape):
    x0, y0, x1, y1 = b; ym = (y0 + y1) // 2 + 3
    if shape == "blink":      # line with drooping ends + lashes
        d.line([(x0, ym + 2), (x0 + 3, ym), (x1 - 3, ym), (x1, ym + 2)], fill=LASH, width=2)
        d.line([(x0 + 4, ym + 2), (x1 - 4, ym + 2)], fill=LID)
    elif shape == "happy":    # ^ ^
        d.line([(x0 + 1, ym + 2), ((x0 + x1) // 2, ym - 4), (x1 - 1, ym + 2)], fill=LASH, width=2)
    elif shape == "relaxed":  # soft thin smile lines
        d.line([(x0 + 1, ym - 1), (x0 + 5, ym + 1), (x1 - 5, ym + 1), (x1 - 1, ym - 1)], fill=LASH, width=1)
        d.line([(x0 + 1, ym - 1), (x0 - 1, ym - 2)] if side == "L" else [(x1 - 1, ym - 1), (x1 + 1, ym - 2)], fill=LASH)


def heart(d, cx, cy):
    d.ellipse([cx - 5, cy - 4, cx, cy + 1], fill=PINK); d.ellipse([cx, cy - 4, cx + 5, cy + 1], fill=PINK)
    d.polygon([(cx - 5, cy - 1), (cx + 5, cy - 1), (cx, cy + 6)], fill=PINK)
    d.rectangle([cx - 3, cy - 2, cx - 2, cy - 1], fill=PINK_L)


def spiral(d, cx, cy):
    import math
    pts = [(cx + 0.9 * t * math.cos(t * 1.25), cy + 0.9 * t * math.sin(t * 1.25)) for t in [i * 0.25 for i in range(26)]]
    d.line(pts, fill=LASH, width=1)


def eye_cell(name):
    im = base(); d = ImageDraw.Draw(im)
    L, R = EL, mirror_box(EL)
    br = {"surprised": "up", "angry": "angry", "sad": "sad", "shocked": "up", "disgust": "angry"}.get(name, "normal")
    for side in "LR":
        brow(d, "smirk_up" if (name == "smirk" and side == "R") else br, side)
    for side, b in (("L", L), ("R", R)):
        x0, y0, x1, y1 = b
        if name == "open": eye_open(d, b, side)
        elif name == "half": eye_open(d, b, side, lid=6)
        elif name in ("blink", "happy", "relaxed"): closed(d, b, side, name)
        elif name == "surprised": eye_open(d, (x0, y0 - 2, x1, y1), side, small=True)
        elif name == "angry":
            eye_open(d, b, side, lid=3)
            pts = [(x0, y0), (x1, y0 + 6)] if side == "L" else [(x1, y0), (x0, y0 + 6)]
            d.polygon(pts + [(pts[1][0], y0 - 1), (pts[0][0], y0 - 1)], fill=SKIN_U); d.line(pts, fill=LASH, width=2)
        elif name == "sad":
            eye_open(d, b, side, lid=2)
            pts = [(x0, y0 + 6), (x1, y0 + 1)] if side == "L" else [(x1, y0 + 6), (x0, y0 + 1)]
            d.polygon(pts + [(pts[1][0], y0 - 1), (pts[0][0], y0 - 1)], fill=SKIN_U); d.line(pts, fill=LASH, width=2)
        elif name == "wink":
            if side == "R": closed(d, b, side, "happy")
            else: eye_open(d, b, side)
        elif name == "hearts":
            eye_open(d, b, side, iris=PINK_D); heart(d, (x0 + x1) // 2 + (1 if side == "L" else -1), (y0 + y1) // 2 + 1)
        elif name == "shocked":
            d.ellipse([x0 + 1, y0 - 1, x1 - 1, y1], fill=WHITE, outline=LASH, width=2)
        elif name == "dizzy":
            d.ellipse([x0 + 1, y0, x1 - 1, y1], fill=SCL); spiral(d, (x0 + x1) // 2, (y0 + y1) // 2 + 1)
        elif name == "disgust":
            eye_open(d, b, side, lid=7)
            d.rectangle([x0, y1 - 2, x1, y1 + 1], fill=SKIN_U); d.line([(x0 + 1, y1 - 2), (x1 - 1, y1 - 3)], fill=LASH)
        elif name == "smirk":
            eye_open(d, b, side, lid=5 if side == "L" else 3, look=2 if side == "L" else 2)
        elif name == "soft":
            eye_open(d, b, side, lid=4); d.arc([x0 + 2, y1 - 4, x1 - 2, y1 + 4], 200, 340, fill=LID)
        elif name == "sparkle":
            eye_open(d, b, side)
            cx = (x0 + x1) // 2 + (1 if side == "L" else -1)
            d.point([(cx + 2, y0 + 10), (cx + 3, y0 + 11), (cx + 2, y0 + 12), (cx + 1, y0 + 11)], fill=WHITE)
            d.point([(cx - 3, y1 - 3)], fill=WHITE)
    return im


def mouth_cell(name):
    im = base(); d = ImageDraw.Draw(im); y = MY
    if name in ("blushSmile", "blushGasp"):
        for x in (10, 47):
            d.rectangle([x, 40, x + 6, 42], fill=BLUSH)
            for k in range(3): d.point([(x + 1 + 2 * k, 39)], fill=BLUSH)
    if name == "neutral":
        d.line([(28, y), (30, y + 1), (34, y + 1), (36, y)], fill=MOUTH)
    elif name in ("smile", "blushSmile"):
        d.line([(26, y - 1), (29, y + 1), (35, y + 1), (38, y - 1)], fill=MOUTH)
    elif name == "smileOpen":
        d.polygon([(26, y - 1), (38, y - 1), (35, y + 3), (29, y + 3)], fill=MOUTH_D)
        d.line([(26, y - 1), (38, y - 1)], fill=TEETH); d.rectangle([30, y + 2, 34, y + 3], fill=TONGUE)
    elif name == "talkA":
        d.ellipse([28, y - 2, 36, y + 4], fill=MOUTH_D); d.rectangle([30, y + 2, 34, y + 3], fill=TONGUE)
    elif name == "talkO":
        d.ellipse([29, y - 2, 35, y + 3], fill=MOUTH_D)
    elif name == "surprised":
        d.ellipse([28, y - 3, 36, y + 5], fill=MOUTH_D); d.rectangle([30, y + 3, 34, y + 4], fill=TONGUE)
    elif name == "frown":
        d.line([(27, y + 2), (30, y), (34, y), (37, y + 2)], fill=MOUTH)
    elif name == "shout":
        d.polygon([(25, y - 2), (39, y - 2), (36, y + 5), (28, y + 5)], fill=MOUTH_D)
        d.rectangle([26, y - 2, 38, y - 1], fill=TEETH); d.rectangle([30, y + 3, 34, y + 4], fill=TONGUE)
    elif name == "blep":
        d.line([(26, y - 1), (29, y + 1), (35, y + 1), (38, y - 1)], fill=MOUTH)
        d.rectangle([33, y + 1, 36, y + 4], fill=TONGUE); d.point([(34, y + 2)], fill=(176, 52, 72))
    elif name == "cat":
        d.line([(27, y - 1), (29, y + 1), (32, y - 1), (35, y + 1), (37, y - 1)], fill=MOUTH)
    elif name in ("gasp", "blushGasp"):
        d.ellipse([30, y - 1, 34, y + 3], fill=MOUTH_D)
    elif name == "bigShock":
        d.rectangle([27, y - 3, 37, y + 7], fill=MOUTH_D); d.rectangle([28, y + 5, 36, y + 7], fill=TONGUE)
        d.line([(27, y - 3), (37, y - 3)], fill=TEETH)
    elif name == "disgust":
        d.line([(26, y + 2), (28, y), (31, y + 1), (34, y - 1), (38, y + 2)], fill=MOUTH)
        d.rectangle([35, y + 1, 37, y + 3], fill=TONGUE)
    elif name == "smirk":
        d.line([(28, y + 1), (33, y + 1), (37, y - 2)], fill=MOUTH)
    return im


def build():
    tex = os.path.join(HERE, "tex"); os.makedirs(tex, exist_ok=True)
    for tag, names, fn in (("eyes", EYES, eye_cell), ("mouth", MOUTHS, mouth_cell)):
        at = Image.new("RGB", (C * N, C))
        for i, n in enumerate(names): at.paste(fn(n), (i * C, 0))
        at.save(os.path.join(tex, f"face_{tag}.png"))
    # preview: combined faces (upper rows from the eye cell, lower from the mouth cell), x4
    os.makedirs(os.path.join(HERE, "review"), exist_ok=True)
    pv = Image.new("RGB", (C * 8 * 4, C * 2 * 4 + 8), (20, 20, 20))
    for i in range(N):
        e, m = eye_cell(EYES[i]), mouth_cell(MOUTHS[i])
        f = m.copy(); f.paste(e.crop((0, 0, C, 38)), (0, 0))
        pv.paste(f.resize((C * 4, C * 4), Image.NEAREST), ((i % 8) * C * 4, (i // 8) * (C * 4 + 8)))
    pv.save(os.path.join(HERE, "review", "face_atlas.png"))
    print("face atlases ok")


if __name__ == "__main__":
    build()

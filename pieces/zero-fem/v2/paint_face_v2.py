"""v2 face atlases: same painter as face/paint_face.py (imported, untouched), from the v2 texture (thicker lashes),
plus 3 new eye cells and 3 new mouth cells (the free cells 13-15):

  eyes  13 smirk    the visible eye (R, not under the bangs) half-closed with a flat, confident brow; the other open with the brow raised (asymmetric)
        14 soft     gentle half-lidded look, soft curved lash line, relaxed brows
        15 sparkle  sweet surprise: brows up, eyes wide with extra star highlights
  mouth 13 smirk    one corner raised, the other flat (asymmetric)
        14 blushSmile soft smile + pink blush strokes on both cheeks
        15 blushGasp  small round "o" + blush

Combos used by the v2 expression actions: smirk = smirk/smirk; wink = wink/smirk; soft blush smile = soft/blushSmile;
flirty/proud = relaxed/smirk; sweet surprise = sparkle/blushGasp.
    python v2/paint_face_v2.py   -> v2/face/face_eyes.png, face_mouth.png, atlas_preview.png"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "face"))
import paint_face as pf

pf.SRC = os.path.join(HERE, "tex", "ZeroVolnuttTexture.png")
pf.EYES = pf.EYES + ["smirk", "soft", "sparkle"]
pf.MOUTHS = pf.MOUTHS + ["smirk", "blushSmile", "blushGasp"]
BL = (240, 120, 140)
pf.PAL["U"] = (BL, 1); pf.PAL["u"] = (BL, .43); pf.PAL["v"] = (BL, .25)

WING_LOW = [(5, 131, "K"), (4, 130, "K"), (4, 129, "k"), (3, 128, "q")]   # winged flick rooted on a lowered lid
CLOSED = ("blink", "happy", "wink", "relaxed", "shocked", "dizzy")
base_eye_cell = pf.eye_cell


def eye_cell(name, base):
    if name in ("smirk", "soft", "sparkle"):
        f = pf.Face(base)
        if name == "smirk":
            for y, r in pf.HALF.items():                       # R (the eye not under the bangs): lowered lid
                f.grid(y, [r], sides="R")
            f.clear(3, 124, 7, 132, sides="R"); pf.pts(f, WING_LOW, 0, "L")
            f.clear(5, 119, 24, 126, sides="R")                # R brow: flat and low (confident)
            f.grid(124, ["    BBBBBBbc            "], sides="R"); f.grid(125, ["          cbBBb         "], sides="R")
            f.clear(5, 120, 22, 126, sides="L")                # L: brow raised, eye open
            for y, r in pf.BROWS_UP.items():
                f.grid(y - 1, [r], sides="L")
        elif name == "soft":
            f.clear(5, 125, 25, 129)                           # lid drops 3 px: soft and gentle
            f.clear(3, 124, 7, 130)
            f.grid(128, ["    qkKKKKKKKKKKKKKKKkq  "]); f.grid(129, ["   KKKKKKKKKKKKKKKKKKKK  "])
            f.grid(130, ["  L                      "])
            pf.pts(f, [(4, 128, "K"), (3, 127, "k"), (3, 126, "q")])
            f.clear(5, 120, 22, 126)
            for y, r in pf.BROWS_UP.items():
                f.grid(y + 1, [r])
        else:   # sparkle
            f.clear(5, 119, 22, 126)
            for y, r in pf.BROWS_UP.items():
                f.grid(y - 2, [r])
            pf.pts(f, [(15, 131, "W"), (16, 131, "W"), (15, 132, "W"), (16, 132, "W"), (17, 133, "w"),   # big highlight
                       (19, 139, "W"), (20, 140, "w"), (14, 141, "W"),                                  # small ones
                       (24, 129, "W"), (25, 128, "a"), (23, 128, "a"), (24, 127, "a")])                  # star at the outer lid
        return f.im
    im = base_eye_cell(name, base)
    if name in CLOSED:                                          # v2 lashes reach outside the cleared box: wipe them
        f = pf.Face(im); sides = "R" if name == "wink" else "LR"
        f.clear(3, 124, 5, 130, sides); f.clear(8, 146, 22, 148, sides); f.clear(8, 141, 11, 146, sides)
        im = f.im
    return im


MOUTH_NEW = {
    "smirk": {"L": {157: "    Z       ", 158: "     zZ     ", 159: "      yZZz  ", 160: "         zZz", 161: "           Z"},
              "R": {161: "        zZZZ"}},
    "blushSmile": {"LR": {159: "      zZ    ", 160: "       yZZz ", 161: "          zZ"}},
    "blushGasp": {"LR": {159: "          zZ", 160: "          LL", 161: "          LL", 162: "          zZ"}},
}
BLUSH = {146: "   vvvvvvvvvv  ", 147: "  vvvvuvvuvvuv ", 148: "  vvvuUvuUvuUv ", 149: "  vvuUvuUvuUvv ",   # soft pink patch +
         150: "  vvUvvUvvUvvv ", 151: "   vvvvvvvvvv  "}                                                       # 3 diagonal strokes
base_mouth_cell = pf.mouth_cell


def mouth_cell(name, base):
    if name not in MOUTH_NEW:
        return base_mouth_cell(name, base)
    f = pf.Face(base)
    f.clear(20, 157, 32, 168)
    for sides, rows in MOUTH_NEW[name].items():
        for y, r in rows.items():
            f.grid(y, [r], x0=20, sides=sides)
    if name.startswith("blush"):
        for y, r in BLUSH.items():
            f.grid(y, [r], x0=5)
    return f.im


pf.eye_cell, pf.mouth_cell = eye_cell, mouth_cell
if __name__ == "__main__":
    out = os.path.join(HERE, "face"); os.makedirs(out, exist_ok=True)
    pf.build(out_dir=out)
    print("v2 atlases written", len(pf.EYES), len(pf.MOUTHS))

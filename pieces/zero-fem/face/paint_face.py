"""Paints the face atlases (pixel by pixel, in the model's style) from ../tex/ZeroVolnuttTexture.png.

Both atlases are 16 cells of 64x64 (1024x64); every cell is a full copy of the face block of the 192px texture
(rect x0-64, y112-176, same layout as IndividualTextures/Face.png) with one expression painted in.
face_eyes.png  -> used by the eye + brow + forehead faces of the Head mesh (material face_eyes)
face_mouth.png -> used by the mouth / cheek / chin faces (material face_mouth)
Cell 0 of each atlas is an exact crop of the texture, so the neutral face stays pixel-identical.

Drawing: grids of characters for the LEFT eye (texture x 4..27); the right eye is the mirror x -> 63-x.
Anti-alias pixels blend the colour over the skin under them at 43% / 25% (the author's AA levels,
measured in the texture: e.g. (193,144,106) = outline over side skin at 43%)."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(HERE), "tex", "ZeroVolnuttTexture.png")
CELL_W, CELL_H, N = 64, 64, 16
EYES_RECT = MOUTH_RECT = (0, 112)     # top-left of a cell inside the 192px texture
EYES = ["open", "half", "blink", "happy", "surprised", "angry", "sad", "wink",
        "hearts", "shocked", "dizzy", "relaxed", "disgust"]       # cell 12 disgust (digger-01 v3); 13-15 free (copy of open)
MOUTHS = ["neutral", "smile", "smileOpen", "talkA", "talkO", "surprised", "frown", "shout",
          "blep", "cat", "gasp", "bigShock", "disgust"]           # cell 12 disgust (digger-01 v3); 13-15 free (copy of neutral)

G, J = (243, 174, 126), (255, 212, 159)          # side skin, front (lit) skin
K, L, Z, B = (38, 20, 26), (92, 44, 40), (128, 106, 80), (191, 117, 0)   # lash, lash2, outline, brow
T = (214, 104, 92)                                # tongue
PD, PM, PL = (150, 30, 80), (222, 70, 130), (255, 150, 190)   # heart-eye iris: dark ring, pink, glow
PAL = {  # char -> (colour, alpha)
    "K": (K, 1), "k": (K, .43), "q": (K, .25),
    "L": (L, 1), "l": (L, .43), "m": (L, .25),
    "Z": (Z, 1), "z": (Z, .43), "y": (Z, .25),
    "B": (B, 1), "b": (B, .43), "c": (B, .25),
    "T": (T, 1), "t": (T, .43),
    "P": (PD, 1), "p": (PM, 1), "h": (PL, 1),
    "R": ((236, 104, 120), 1), "r": ((236, 104, 120), .43), "D": ((176, 52, 72), 1),   # blep tongue + centre line
    "W": ((255, 255, 255), 1), "w": ((236, 246, 246), 1), "a": ((211, 227, 228), 1), "e": ((182, 212, 213), 1),
    "I": ((15, 48, 61), 1), "S": ((40, 67, 116), 1), "s": ((26, 56, 85), 1),
    "N": ((87, 172, 207), 1), "O": ((111, 213, 255), 1), "n": ((69, 141, 171), 1),
}


def skin(x, y):
    """Skin colour under the painted features (the light front-face shape is asymmetric)."""
    if x < 32:                                   # left eye side: light area is a diagonal from (31,126)
        return J if (y >= 145 and x >= 16) or (y >= 126 and x >= 31 - (y - 126) // 2) else G
    if y < 120:
        return G
    xr = min(56, 44 + ((y - 124) * 3) // 2) if y >= 124 else (38, 40, 42, 43)[y - 120]
    return J if x <= xr else G


class Face:
    def __init__(self, base):
        self.im = base.copy(); self.px = self.im.load()
        self.orig = base.load()

    def put(self, x, y, ch, side):
        if ch == " ":
            return
        xx = x if side == "L" else 63 - x
        if ch == "-":
            self.px[xx, y] = skin(xx, y) + (255,); return
        if ch == "o":
            self.px[xx, y] = self.orig[xx, y]; return
        c, a = PAL[ch]
        if a < 1:                                  # AA: blend over the skin under it
            s = skin(xx, y)
            c = tuple(round(s[i] + (c[i] - s[i]) * a) for i in range(3))
        self.px[xx, y] = c + (255,)

    def grid(self, y0, rows, x0=4, sides="LR"):
        for side in sides:
            for dy, row in enumerate(rows):
                for dx, ch in enumerate(row):
                    self.put(x0 + dx, y0 + dy, ch, side)

    def clear(self, x0, y0, x1, y1, sides="LR"):
        for side in sides:
            for y in range(y0, y1):
                for x in range(x0, x1):
                    self.put(x, y, "-", side)


# ---------------------------------------------------------------- eyes (x = 4..27, one char per texel)
BROWS_UP = {121: "    BBbc                ",   # raised, softly arched (happy / surprised)
            122: "    cbBBBbc             ",
            123: "        cbBBbc          "}
BROWS_SAD = {120: "                 cbB    ",  # inner end raised (worried); the inner end shows past the bangs
             121: "              cbBBBBb   ",
             122: "          cbBBBBbc      ",
             123: "      cbBBBBbc          ",
             124: "    bBBBbc              ",
             125: "    c                   "}
BROWS_ANGRY = {123: "    BBb                 ",  # steep, inner end pressed down toward the lid
               124: "    bBBBb               ",
               125: "      cBBBb             ",
               126: "        cBBBb           ",
               127: "          cBBBb         ",
               128: "            cBBBB       ",
               129: "              cBBB      "}

# outer-corner lashes: the wing (lashes.py) and the 2nd shorter flick under it (lashes.py, stage 2)
WING = [(6, 128, "L"), (6, 129, "L"), (7, 129, "K"), (7, 130, "K"), (8, 130, "K"), (8, 131, "K"), (9, 131, "K"), (9, 132, "K")]
FLICK = [(6, 132, "l"), (6, 133, "K"), (7, 134, "K"), (7, 135, "K")]
UNFLICK = [(6, 132, "-"), (6, 133, "-"), (7, 134, "z"), (7, 135, "Z")]   # what was there before the flick

BLINK = {134: " L                      ",      # closed: soft downward curve, wing up + flick down at the outer end
         135: "  LK                    ",
         136: "   KKKk                 ",
         137: "   KzKKKk          qkK  ",
         138: "   L  zKKKkq    qkKKKz  ",
         139: "        zKKKKKKKKKKz    ",
         140: "          zzKKKKzz      "}

HAPPY = {131: "            qkKKkq      ",     # ^ arc, wing + flick fanning out at the outer end
         132: "         qkKKKKKKKKk    ",
         133: "        kKKKkz  zkKKKk  ",
         134: "  l   kKKKz        zKKz ",
         135: "   KkKKKz            zk ",
         136: "    KKKz                ",
         137: "   KKz                  ",
         138: "   l                    "}

RELAXED = {134: "         qKKKKq         ",   # calm closed eyes: thin, gently arched, lashes hanging down
           135: "      kKKz    zKKk      ",
           136: "    KKKz         zKq    ",
           137: "   KKz                  ",
           138: "   K  K                 ",
           139: "   l  l                 "}

HALF = {126: "  ----------------------",     # upper lid lowered to mid-eye (sleepy / blink in-between)
        127: "  ----------------------",
        128: "  ----------------------",
        129: "  ----------------------",
        130: "  ----------------------",
        131: "  L-----qkkkkkkkq-------",
        132: "   LKKKKKKKKKKKKKKKKk---",
        133: "    KKKKKKKKKKKKKKKKKKz ",
        134: "                    q   "}

ANGRY_LID = {126: "  ----------------------",   # lid line slants down toward the nose
             127: "  ----------------------",
             128: "  L---------------------",
             129: "  LKKKKq----------------",
             130: "   KKKKKKKq------------ ",
             131: "      KKKKKKKq-------   ",
             132: "          KKKKKKKq-     ",
             133: "              KKKKk     "}

SAD_LID = {126: "  ----------------------",     # outer half of the lid droops
           127: "  ----------------------",
           128: "  ------------qKKKKk--  ",
           129: "  --------qKKKKKKKK---  ",
           130: "  ----qKKKKKKKK         ",
           131: "  LKKKKKKKK             ",
           132: "  LKKK                  ",
           133: " L                      "}

DISGUST_LID = {126: "  ----------------------",   # squint of disgust: heavy lid slanting down to the nose,
               127: "  ----------------------",   # lower lid pushed up by the cheek -> a narrow slit
               128: "  ----------------------",
               129: "  ----------------------",
               130: "  ----------------------",
               131: "  L---------------------",
               132: "  LKKKKq----------------",
               133: "   KKKKKKKKq------------",
               134: "      KKKKKKKKKKq-------",
               135: "          KKKKKKKKKKk   ",
               140: "    zZZZZZZZZZZZZZz     ",   # raised lower lid
               141: "  ----------------------",
               142: "  ----------------------",
               143: "  ----------------------",
               144: "  ----------------------",
               145: "  ----------------------"}

HEART = {134: "            W W         ",       # white heart, 1 px of pink all around it
         135: "           WWWWW        ",
         136: "           WWWWW        ",
         137: "            WWW         ",
         138: "             W          "}
IRIS_ROWS = {129: (15, 19), 130: (14, 20), 142: (14, 20), 143: (15, 19), 144: (16, 18)}  # rounded top/bottom


def pts(f, lst, dy=0, sides="LR"):
    for side in sides:
        for x, y, ch in lst:
            f.put(x, y + dy, ch, side)


def disc(f, cx, cy, sides, fn):
    """Paint every texel of the eye box with fn(dist, x, y) -> char (None = keep)."""
    import math
    for side in sides:
        for y in range(126, 146):
            for x in range(5, 25):
                ch = fn(math.hypot(x + .5 - cx, y + .5 - cy), x, y)
                if ch:
                    f.put(x, y, ch, side)


def spiral(f, cx, cy, sides, turns=2.3, r1=6.0):
    import math
    seen = set()
    for i in range(3000):                                   # Archimedean spiral, 1 px line
        t = i / 3000 * turns * 2 * math.pi
        r = 0.6 + r1 * i / 3000
        seen.add((int(cx + r * math.cos(t)), int(cy - r * math.sin(t))))
    for side in sides:
        for x, y in seen:
            f.put(x, y, "K", side)


def eye_cell(name, base):
    f = Face(base)
    if name not in EYES:                                       # free cell
        return f.im
    if name in ("half", "blink", "wink"):                     # lash pixel inside the brow -> brow colour
        f.grid(125, ["           B"], sides="R" if name == "wink" else "LR")
    if name in ("blink", "happy", "wink", "relaxed", "shocked", "dizzy"):
        sides = "R" if name == "wink" else "LR"
        f.clear(5, 125, 25, 146, sides)                       # erase the open eye (brows stay)
        if name in ("happy", "relaxed", "shocked", "dizzy"):
            f.clear(5, 120, 22, 126, sides)
            for y, r in BROWS_UP.items():
                f.grid(y - (1 if name == "shocked" else 0), [r], sides=sides)
        if name == "shocked":                                   # scribbled black ring, white void, tiny pupil
            disc(f, 15.2, 136.5, sides, lambda d, x, y:
                 "W" if d < 4.6 else "K" if d < 6.6 else "k" if d < 7.3 else None)
            disc(f, 14.6, 135.8, sides, lambda d, x, y: "K" if 5.4 < d < 6.1 and (x + y) % 3 else None)
            pts(f, WING, 1, sides); pts(f, FLICK, 1, sides)
        elif name == "dizzy":
            spiral(f, 15.5, 136.5, sides)
            pts(f, WING, 1, sides); pts(f, FLICK, 1, sides)
        else:
            for y, r in {"happy": HAPPY, "relaxed": RELAXED}.get(name, BLINK).items():
                f.grid(y, [r], sides=sides)
    elif name == "half":
        for y, r in HALF.items():
            f.grid(y, [r])
        pts(f, UNFLICK); pts(f, FLICK, 2)                     # flick below the lowered lid's wing
    elif name == "surprised":
        f.clear(5, 120, 22, 126)
        for y, r in BROWS_UP.items():
            f.grid(y - 1, [r])
        for side in "LR":                                      # wipe the big iris back to sclera
            for y in range(128, 145):
                for x in range(16, 22):
                    keep = f.orig[x, y][:3] == K
                    f.put(x, y, "o" if keep else ("W" if y >= 138 else ("w" if y >= 131 else "a")), side)
        f.grid(133, ["             SSS        ",               # small iris
                     "            SIIIW       ",
                     "            IIIIW       ",
                     "            IIIII       ",
                     "            INOnI       ",
                     "            sOONs       ",
                     "             III        "])
    elif name == "disgust":
        f.clear(5, 119, 24, 126)
        for y, r in DISGUST_LID.items():
            f.grid(y, [r])
        for y, r in BROWS_ANGRY.items():
            f.grid(y, [r])
        pts(f, UNFLICK); pts(f, FLICK, 2)
    elif name in ("angry", "sad"):
        f.clear(5, 119, 24, 126)
        for y, r in (ANGRY_LID if name == "angry" else SAD_LID).items():
            f.grid(y, [r])
        for y, r in (BROWS_ANGRY if name == "angry" else BROWS_SAD).items():
            f.grid(y, [r])
        if name == "sad":                                      # the drooping lid takes the flick's place: move it down
            pts(f, UNFLICK[1:]); pts(f, FLICK, 3)
    elif name == "hearts":
        for side in "LR":                                      # round pink iris x13-21, dark ring, glow at the bottom
            for y in range(129, 145):
                for x in range(13, 22):                        # old iris -> sclera, then the round pink iris
                    if f.orig[x, y][:3] not in (K, L):
                        f.put(x, y, "W" if y >= 138 else ("w" if y >= 131 else "a"), side)
                x0, x1 = IRIS_ROWS.get(y, (13, 21))
                for x in range(x0, x1 + 1):
                    if f.orig[x, y][:3] in (K, L):
                        continue
                    edge = x in (x0, x1) or y in (129, 130, 143, 144)
                    f.put(x, y, "P" if edge else ("h" if y >= 140 else "p"), side)
        for y, r in HEART.items():
            f.grid(y, [r])
    return f.im


# ---------------------------------------------------------------- mouth (x = 20..31, mirrored to 43..32)
MOUTH = {
    "smile":     {159: "      zZ    ",
                  160: "       yZZz ",
                  161: "          zZ"},
    "smileOpen": {159: "      zZZZZZ",
                  160: "       LLLLL",
                  161: "        LLTT",
                  162: "         lTT"},
    "talkA":     {159: "         zZZ",
                  160: "        lLLL",
                  161: "        LLLL",
                  162: "        LLTT",
                  163: "         lTT"},
    "talkO":     {159: "          zZ",
                  160: "         lLL",
                  161: "         LLL",
                  162: "          lL"},
    "surprised": {158: "          zZ",
                  159: "         zLL",
                  160: "        zLLL",
                  161: "        LLLL",
                  162: "        LLLL",
                  163: "        zLLL",
                  164: "         zll"},
    "frown":     {159: "         zZZ",
                  160: "       zZz  ",
                  161: "      z     "},
    "shout":     {158: "      zZZZZZ",
                  159: "      LWWWWW",
                  160: "      LLLLLL",
                  161: "      LLLLLL",
                  162: "       LLLTT",
                  163: "       LTTTT",
                  164: "        llll"},
    "cat":       {159: "      z    Z",                     # :3 / w cat smile
                  160: "       Z  Zy",
                  161: "        ZZ  "},
    "blep":      {159: "      zZ    ",
                  160: "       yZZz ",
                  161: "          zZ"},
    "gasp":      {159: "          zZ",                     # small round o
                  160: "          LL",
                  161: "          LL",
                  162: "          zZ"},
    "bigShock":  {158: "         qkK",                     # big dark open mouth, wider at the bottom
                  159: "        kKKK",
                  160: "        KKKK",
                  161: "       kKKKK",
                  162: "       KKKKK",
                  163: "       KKKLL",
                  164: "       kKKLL",
                  165: "        qkkk"},
    "disgust":   {158: "       LL  L",                     # wavy grimace, corners pulled down (+ tongue tip, R side)
                  159: "  LL  L  LL ",
                  160: " L  LL      ",
                  161: "L           "},
}
BLEP_TONGUE = {161: "       rRR  ",                    # tongue hanging out under the screen-right side
               162: "       RRDRR",
               163: "       RRDRR",
               164: "       rRDRr",
               165: "        rRr "}


def mouth_cell(name, base):
    f = Face(base)
    if name == "neutral" or name not in MOUTHS:
        return f.im
    f.clear(20, 157, 32, 168)
    for y, r in MOUTH[name].items():
        f.grid(y, [r], x0=20)
    if name == "disgust":
        for y, r in {159: "         rR ", 160: "        rRDr", 161: "         rr "}.items():
            f.grid(y, [r], x0=20, sides="R")
    if name == "blep":
        for y, r in BLEP_TONGUE.items():
            f.grid(y, [r], x0=20, sides="R")
    return f.im


def build(out_dir=HERE, preview=True):
    from PIL import Image
    base = Image.open(SRC).convert("RGBA")
    atlases = {}
    for tag, names, fn, (rx, ry) in (("eyes", EYES, eye_cell, EYES_RECT), ("mouth", MOUTHS, mouth_cell, MOUTH_RECT)):
        at = Image.new("RGBA", (CELL_W * N, CELL_H), (0, 0, 0, 255))
        for i in range(N):
            full = fn(names[i] if i < len(names) else None, base)
            at.paste(full.crop((rx, ry, rx + CELL_W, ry + CELL_H)), (i * CELL_W, 0))
        at.save(os.path.join(out_dir, f"face_{tag}.png"))
        atlases[tag] = at
    if preview:                                      # 6x preview of every cell (eyes row, mouth row)
        s = 6
        pv = Image.new("RGBA", (CELL_W * N * s, CELL_H * 2 * s + s), (0, 0, 0, 255))
        pv.paste(atlases["eyes"].resize((CELL_W * N * s, CELL_H * s), Image.NEAREST), (0, 0))
        pv.paste(atlases["mouth"].resize((CELL_W * N * s, CELL_H * s), Image.NEAREST), (0, CELL_H * s + s))
        pv.save(os.path.join(out_dir, "atlas_preview.png"))
    return atlases


if __name__ == "__main__":
    build()
    print("atlases written")

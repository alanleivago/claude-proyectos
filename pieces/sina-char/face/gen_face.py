"""Face sprites (32x32 RGBA) for the sina girl, same UV layout as NETO512's face meshes.
python gen_face.py  -> writes eyes/ pupils/ brows/ mouths/ next to this file.
Eye/brow sprites: x=0 is the nose side, x=31 the outer side (mirror modifier makes the other eye).
Pupil sprite is drawn in 2x2 blocks (16x16 logical) so its texels match the eye's size on the mesh."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))

PAL = {
    ".": (0, 0, 0, 0),
    "K": (34, 20, 24, 255),      # lash line, near black brown
    "k": (92, 50, 46, 255),      # soft lash / lower lid
    "W": (255, 255, 255, 255),   # sclera
    "w": (206, 214, 236, 255),   # sclera shadow under the lash
    "d": (56, 28, 20, 255),      # iris rim
    "D": (104, 52, 28, 255),     # iris top (dark)
    "M": (160, 86, 40, 255),     # iris mid
    "L": (214, 138, 66, 255),    # iris bottom glow
    "P": (40, 20, 14, 255),      # pupil
    "H": (255, 255, 255, 255),   # highlight
    "h": (255, 236, 214, 255),   # small highlight
    "B": (78, 42, 30, 255),      # brow
    "b": (128, 76, 58, 255),     # brow soft end
    "R": (96, 34, 38, 255),      # mouth line
    "r": (150, 40, 52, 255),     # mouth inside
    "T": (232, 112, 118, 255),   # tongue
    "t": (255, 250, 246, 255),   # teeth
}


def grid(rows, top=0, scale=1):
    """rows of chars -> 32x32 image; rows placed from `top`, each char scale x scale px."""
    im = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    px = im.load()
    for j, row in enumerate(rows):
        for i, c in enumerate(row):
            if c == " ":
                continue
            for dy in range(scale):
                for dx in range(scale):
                    x, y = i * scale + dx, (top + j) * scale + dy
                    if 0 <= x < 32 and 0 <= y < 32:
                        px[x, y] = PAL[c]
    return im


S = {}

# ---------------- eyes (x0 = nose side) ----------------
S["eyes/eye_open.png"] = grid([
    "................................",  # 4
    "............KKKKKKKK....K.......",  # 5
    ".........KKKKKKKKKKKKKKKKK.K....",  # 6
    ".......KKKKKKKKKKKKKKKKKKKKK....",  # 7
    "......KKKKKKKKKKKKKKKKKKKKKKKK..",  # 8
    ".....KKKKwwwwwwwwwwwwwwwKKKKKKK.",  # 9
    ".....KKwwWWWWWWWWWWWWWWWWwKK....",  # 10
    "....KKwWWWWWWWWWWWWWWWWWWWKK....",  # 11
    "....KwWWWWWWWWWWWWWWWWWWWWWK....",  # 12
    "....KWWWWWWWWWWWWWWWWWWWWWWK....",  # 13
    "....kWWWWWWWWWWWWWWWWWWWWWWk....",  # 14
    ".....WWWWWWWWWWWWWWWWWWWWWWk....",  # 15
    ".....kWWWWWWWWWWWWWWWWWWWWWk....",  # 16
    "......WWWWWWWWWWWWWWWWWWWWk.....",  # 17
    "......kWWWWWWWWWWWWWWWWWWWk.....",  # 18
    ".......kWWWWWWWWWWWWWWWWWk......",  # 19
    "........kkWWWWWWWWWWWWWkk.......",  # 20
    "..........kkkkkkkkkkkkk.........",  # 21
], top=4)

S["eyes/eye_wide.png"] = grid([
    "...........KKKKKKKKKK...K.......",  # 3
    "........KKKKKKKKKKKKKKKKK.K.....",  # 4
    "......KKKKKKKKKKKKKKKKKKKKK.....",  # 5
    ".....KKKwwwwwwwwwwwwwwwwKKKKK...",  # 6
    ".....KwwWWWWWWWWWWWWWWWWWwKKKK..",  # 7
    "....KwWWWWWWWWWWWWWWWWWWWWWK....",  # 8
    "....KWWWWWWWWWWWWWWWWWWWWWWK....",  # 9
    "...kWWWWWWWWWWWWWWWWWWWWWWWWk...",  # 10
    "...kWWWWWWWWWWWWWWWWWWWWWWWWk...",  # 11
    "...kWWWWWWWWWWWWWWWWWWWWWWWWk...",  # 12
    "...kWWWWWWWWWWWWWWWWWWWWWWWWk...",  # 13
    "....WWWWWWWWWWWWWWWWWWWWWWWWk...",  # 14
    "....kWWWWWWWWWWWWWWWWWWWWWWk....",  # 15
    ".....WWWWWWWWWWWWWWWWWWWWWWk....",  # 16
    ".....kWWWWWWWWWWWWWWWWWWWWk.....",  # 17
    "......kWWWWWWWWWWWWWWWWWWWk.....",  # 18
    ".......kWWWWWWWWWWWWWWWWWk......",  # 19
    "........kWWWWWWWWWWWWWWWk.......",  # 20
    ".........kkWWWWWWWWWWWkk........",  # 21
    "...........kkkkkkkkkkk..........",  # 22
], top=3)

S["eyes/eye_happy.png"] = grid([          # ^ arc, closed and smiling (low enough to clear the bangs)
    "...........KKKKKKKKK............",  # 12
    ".........KKKKKKKKKKKKK..........",  # 13
    ".......KKKKK.......KKKKK........",  # 14
    "......KKK.............KKKK......",  # 15
    ".....KKK................KKK.....",  # 16
    ".....KK..................KK.....",  # 17
    "....KK....................KK....",  # 18
    "....K......................K....",  # 19
], top=12)

S["eyes/eye_closed.png"] = grid([          # blink: lid line curving down, lashes at the outer end
    "...........................K....",  # 13
    "..........................K.....",  # 14
    ".....KKKK.............KKKK......",  # 15
    "....KKKKKKKKKKKKKKKKKKKKKKKK....",  # 16
    "........KKKKKKKKKKKKKKKK..KK....",  # 17
    "...........................K....",  # 18
], top=13)

# ---------------- pupils (16x16 logical, 2x) ----------------
S["pupils/pupil.png"] = grid([
    "................",  # 0
    "................",  # 1
    "......dddddd....",  # 2
    ".....dDDDDDDd...",  # 3
    "....dHHDDDDDDd..",  # 4
    "....dHHDPPDDDd..",  # 5
    "....dDMPPPPMDd..",  # 6
    "....dMMPPPPMMd..",  # 7
    "....dMMPPPPMMd..",  # 8
    "....dMMMPPMMMd..",  # 9
    "....dLMMMMMMhd..",  # 10
    ".....dLLLLLLd...",  # 11
    "......dddddd....",  # 12
], scale=2)

S["pupils/pupil_small.png"] = grid([
    "................",  # 0-4
    "................",
    "................",
    "................",
    "................",
    "......dddd......",  # 5
    ".....dHMDd......",  # 6  (shifted one block in: H toward nose)
    ".....dMPPd......",  # 7
    ".....dMPLd......",  # 8
    "......dddd......",  # 9
], scale=2)

S["pupils/pupil_none.png"] = grid([])

# ---------------- brows (x0 = nose side) ----------------
S["brows/brow.png"] = grid([
    "...............BBBBBBb..........",  # 10
    ".........bBBBBBB.....BBBb.......",  # 11
    "..........................b.....",  # 12
], top=10)

S["brows/brow_angry.png"] = grid([
    "........................BBb.....",  # 9
    "....................BBBBB.......",  # 10
    "................BBBBB...........",  # 11
    "............BBBBB...............",  # 12
    ".........BBBBB..................",  # 13
    "........BBB.....................",  # 14
], top=9)

S["brows/brow_worried.png"] = grid([
    ".........BBBb...................",  # 8
    "...........BBBBBb...............",  # 9
    "...............BBBBBb...........",  # 10
    "...................BBBBb........",  # 11
    "......................BBb.......",  # 12
    "........................b.......",  # 13
], top=8)

# ---------------- mouths (centre column 16) ----------------
S["mouths/mouth_neutral.png"] = grid([
    "..............RRRR..............",  # 17
], top=17)

S["mouths/mouth_smile.png"] = grid([
    ".............R.....R............",  # 16
    "..............RRRRR.............",  # 17
], top=16)

S["mouths/mouth_open.png"] = grid([      # talking "A"
    ".............RRRRRR.............",  # 15
    "............RrrrrrrR............",  # 16
    "............RrrrrrrR............",  # 17
    ".............RTTTTR.............",  # 18
    "..............RRRR..............",  # 19
], top=15)

S["mouths/mouth_o.png"] = grid([
    "..............RRRR..............",  # 15
    ".............RrrrrR.............",  # 16
    ".............RrrrrR.............",  # 17
    ".............RrTTrR.............",  # 18
    "..............RRRR..............",  # 19
], top=15)

S["mouths/mouth_shout.png"] = grid([      # yelling: square-ish, upper teeth, corners pulled down
    "...........RRRRRRRRRR...........",  # 14
    "..........RttttttttttR..........",  # 15
    ".........RrrrrrrrrrrrrR.........",  # 16
    ".........RrrrrrrrrrrrrR.........",  # 17
    ".........RrrrrTTTTrrrrR.........",  # 18
    ".........RrTTTTTTTTTTrR.........",  # 19
    "..........RRRRRRRRRRRR..........",  # 20
], top=14)


# ---------------- angry: slanted lid (the hard hat + bangs hide the brows from the front) ----------------
# The pupil quad sits in front of the eye quad, so the iris must be cut along the same lid line.
def lid(ex):                      # lid line (eye px row) at eye column ex: low at the nose, high outside
    return 13.0 - (ex - 5) * 5.0 / 22


def eye_row_to_pupil_y(er):       # eye rows are not linear in height (lower half squashed); pupil quad is
    return (er - 7) * 2.0 if er <= 15 else 16 + (er - 15) * 16 / 9.0


def make_angry():
    eye = S["eyes/eye_open.png"].copy(); e = eye.load()
    for x in range(32):
        top = int(round(lid(x)))
        had = any(e[x, y][3] for y in range(32))
        for y in range(top):
            e[x, y] = PAL["."]
        if had and 4 <= x <= 28:
            for y in range(top, top + 3):
                e[x, y] = PAL["K"]
            if e[x, top + 3] == PAL["W"]:
                e[x, top + 3] = PAL["w"]
    for x, y in ((29, 7), (30, 6), (29, 8)):        # outer flick
        e[x, y] = PAL["K"]
    pup = S["pupils/pupil.png"].copy(); p = pup.load()
    for x in range(32):
        ex = 7 + (x + 0.5) * 17 / 32.0
        cut = int(round(eye_row_to_pupil_y(lid(ex) + 2.5)))
        for y in range(32):
            if y < cut:
                p[x, y] = PAL["."]
            elif y < cut + 2 and p[x, y][3]:
                p[x, y] = PAL["d"]
    hx = 11
    hy = int(round(eye_row_to_pupil_y(lid(7 + hx * 17 / 32.0) + 2.5))) + 2
    for dx in range(2):
        for dy in range(2):
            p[hx + dx, hy + dy] = PAL["H"]
    S["eyes/eye_angry.png"] = eye
    S["pupils/pupil_angry.png"] = pup


make_angry()


def main():
    for rel, im in S.items():
        p = os.path.join(HERE, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        im.save(p)
    print(len(S), "sprites")


if __name__ == "__main__":
    main()

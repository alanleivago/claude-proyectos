"""girl2 feminine animation set v1 (clip definitions). Coordinates: model metres, x = her left, -y = her front, z up.
Arm targets are WRIST positions. Spaces: 'chestN' (chest, twist removed), 'pelvis', 'head', 'world'."""
import numpy as np
from animlib import Clip, A, breathe, wave, REST_A, IDLE_F
import core as C

CX = 0.014


def F(s, x, y, yaw=0.0, heel=0.0, lift=0.0, ab=0.0):
    return (x, y, yaw, heel, lift, ab)


# ---------------------------------------------------------------- shared poses
FXL, FXR, FY = CX + 0.078, CX - 0.078, 0.03                                  # stance: ankles 15.6 cm apart (thighs stay separate)
STL, STR = F("L", FXL, FY - 0.015, -4), F("R", FXR, FY + 0.015, 4)
SQ = dict(sz=-4, cz=-6)                                                       # square the chest (his_idle is twisted)


def hang(s, out=0.0, fwd=0.0, up=0.0):
    sg = 1 if s == "L" else -1
    return A((CX + sg * (0.215 + out), 0.0 - fwd, 0.82 + up), "pelvis", (sg * 0.5, 0.85, 0), (0, -10, 22))


def contra(w="R", amt=1.0):
    """weight on leg w: hip slides over it, free hip drops, free heel lifts (toe planted) so the free knee bends forward-in,
    shoulders counter-tilt. Feet never move between contra('R') and contra('L') -> weight shifts without sliding."""
    sg = 1 if w == "L" else -1
    d = dict(px=sg * 0.036 * amt, pz=-0.012 * amt, pry=-sg * 7 * amt, prz=sg * 5 * amt, sy=sg * 3 * amt, cy=sg * 5 * amt)
    hl, hr = (18 * amt, 0) if w == "R" else (0, 18 * amt)
    d.update(fL=F("L", FXL, FY - 0.015, -2, hl), fR=F("R", FXR, FY + 0.015, 2, hr),
             kL=(-0.18 * (w == "R"), -1, 0), kR=(0.18 * (w == "L"), -1, 0))
    return d


CL = []


def clip(*a, **k):
    c = Clip(*a, **k); CL.append(c); return c


def blink(c, *frames, eyes="open", mouth=None):
    b = "+blush" if eyes.endswith("+blush") else ""          # a blushing blink keeps the blush on the half / blink cells
    for f in frames:
        c.face(f, "half" + b, mouth or "neutral"); c.face(f + 1, "blink" + b, mouth or "neutral"); c.face(f + 3, "half" + b, mouth or "neutral"); c.face(f + 4, eyes, mouth or "neutral")


# ================================================================ IDLES
c = clip("idle_shy", 120, loop=True, note="his_idle pose alive: fist at chest, breathing, tiny sway (starts/ends = his_idle)")
c.k(0)
def _a(f, P):
    breathe(P, f, 60, 0.8); w = wave(f, 120)
    P["px"] += 0.004 * w; P["pry"] -= 1.2 * w; P["cy"] += 1.0 * w; P["hy"] += 2.0 * wave(f, 120, 0.15); P["hz"] += 1.5 * wave(f, 120, 0.3)
c.add = _a
c.face(0, "open", "neutral"); c.face(30, "shy", "softSmile"); blink(c, 50, eyes="shy", mouth="softSmile"); c.face(84, "open", "softSmile"); c.face(110, "open", "neutral")

c = clip("idle_sway", 150, loop=True, note="contrapposto weight shift R -> L -> R, hands hanging soft with a wrist flick")
c.k(0, **SQ, **contra("R"), aL=hang("L", 0.01), aR=hang("R"))
c.k(40, **contra("R", 1.05))
c.k(62, **contra("L", 0.3), aL=hang("L", 0.0, 0.01), aR=hang("R", 0.01))
c.k(80, **contra("L"))
c.k(112, **contra("L", 1.05))
c.k(132, **contra("R", 0.3))
c.k(150, **contra("R"), aL=hang("L", 0.01), aR=hang("R"))
c.add = lambda f, P: breathe(P, f, 75, 1.0)
c.face(0, "open", "neutral"); blink(c, 30, 105)

c = clip("idle_cute", 36, loop=True, note="MML-girl cute idle: knees together, arms out with flared fists, little knee bob")
POSE = dict(**SQ, fL=F("L", 0.075, 0.04, -6), fR=F("R", -0.048, 0.04, 6), kL=(-0.35, -1, 0), kR=(0.35, -1, 0), clL_up=4, clR_up=4, hy=6, hz=4,
            aL=A((CX + 0.25, 0.01, 0.84), "pelvis", (0.4, 0.9, -0.2), (0, -30, 40)), aR=A((CX - 0.25, 0.01, 0.84), "pelvis", (-0.4, 0.9, -0.2), (0, -30, 40)))
c.k(0, **POSE, pz=0.0).k(18, pz=-0.018, hy=8, clL_up=2, clR_up=2).k(36, pz=0.0, hy=6, clL_up=4, clR_up=4)
c.face(0, "smiling", "smile"); blink(c, 20, eyes="smiling", mouth="smile")

c = clip("idle_hands_front", 120, loop=True, note="polite idle: wrists together in front of the skirt, shoulders up a little, slow sway")
HF = dict(aL=A((CX + 0.035, -0.15, 0.84), "pelvis", (0.6, 0.6, -0.4), (0, -20, 0)), aR=A((CX - 0.03, -0.155, 0.85), "pelvis", (-0.6, 0.6, -0.4), (0, -20, 0)))
c.k(0, **SQ, **contra("R", 0.6), **HF, clL_up=3, clR_up=3, cx=3)
c.k(60, **contra("L", 0.6)).k(120, **contra("R", 0.6))
c.add = lambda f, P: breathe(P, f, 60, 0.9)
c.face(0, "open", "smile"); blink(c, 40, 95, mouth="smile")


"""v2 idles"""
from v2_clips import *

# ================================================================ idle_shy: his_idle alive (frame 0 / loop point = his_idle exactly)
c = clip("idle_shy", 120, loop=True, note="his_idle pose alive: fist at chest, breathing, shy head tilt, little weight fidget (starts/ends = his_idle)")
c.k(0)
c.follow = {}; c.drag = {"L": 0.0, "R": 0.0}; c.wrdrag = {"L": 0.0, "R": 0.0}; c.skirt = 0; c.bust = 0.6


def _shy(f, P):
    breathe(P, f, 60, 0.9)
    e = 0.5 - 0.5 * np.cos(2 * np.pi * f / 120)               # 0 at the loop point, 1 mid-loop
    P["px"] += -0.006 * e; P["pry"] += 1.6 * e; P["prz"] -= 1.0 * e; P["sy"] -= 0.8 * e; P["cy"] -= 1.4 * e
    P["hy"] += 4.5 * e + 1.2 * wave(f, 120, 0.1) * e; P["hz"] += 3.0 * e; P["hx"] += 2.5 * e; P["nx"] += 1.0 * e
    P["clR_up"] += 2.5 * e; P["clL_up"] += 1.0 * e
    P["_dtR"] = np.array([0.0, 0.004 * e, 0.003 * e]); P["_dtL"] = np.array([0.006 * e, -0.008 * e, 0.004 * e])
    P["_dwrL"] = np.array([0, -6 * e, 6 * e])


c.add = _shy

# ================================================================ idle_sway: contrapposto weight shift
c = clip("idle_sway", 150, loop=True, note="contrapposto weight shift R -> L -> R: hip pop, S-curve, shoulders counter-tilt, soft hanging hands")
# weight on R: her left (free side) hand rests on the front of the thigh at the hem, right arm hangs; and mirrored
THIGH = lambda s: W(s, 0.105, -0.16, 0.795, "pelvis", pole=((0.7 if s == "L" else -0.7), 0.7, 0.0), hand=((-0.35, -0.5, -0.8), (-0.3, 0.9, 0.0)))
SWAY_ARMS_R = dict(aL=THIGH("L"), aR=hang("R", 0.01, 0.0, 0.0))
SWAY_ARMS_L = dict(aL=hang("L", 0.01, 0.0, 0.0), aR=THIGH("R"))
c.k(0, **M(cp("R", 1.0), SWAY_ARMS_R, hy=8, hx=5))
c.k(38, **M(cp("R", 1.08), hz=5, hy=9, hx=5))
c.k(58, **M(cp("L", 0.2), hz=0, hy=0, hx=3))
c.k(75, **M(cp("L", 1.0), SWAY_ARMS_L, hy=-8, hx=5))
c.k(113, **M(cp("L", 1.08), hz=-5, hy=-9, hx=5))
c.k(133, **M(cp("R", 0.2), hz=0, hy=0, hx=3))
c.k(150, **M(cp("R", 1.0), SWAY_ARMS_R, hy=8, hx=5))
c.add = br(75, 1.0)

# ================================================================ idle_cute: MML-girl cute idle
c = clip("idle_cute", 36, loop=True, note="MML-girl cute idle: knees in and soft, arms out with flared hands, little knee bob")
CUTE = dict(fL=Fo("L", CX + 0.092, -0.055, -6), fR=Fo("R", CX - 0.092, 0.05, -4), kL=(-0.35, -1, 0), kR=(0.3, -1, 0),
            sz=-4, cz=-6, cx=-3, hx=4, hy=7, hz=3, clL_up=3, clR_up=3, prx=-3,
            aL=W("L", 0.245, -0.02, 0.86, "pelvis", pole=(0.5, 0.9, -0.1), hand=((1, -0.2, -0.35), (0.3, 0.1, -1))),
            aR=W("R", 0.245, -0.02, 0.86, "pelvis", pole=(-0.5, 0.9, -0.1), hand=((1, -0.2, -0.35), (0.3, 0.1, -1))))
c.k(0, **CUTE, pz=-0.006).k(18, pz=-0.030, hy=9, clL_up=1, clR_up=1, cx=-1).k(36, pz=-0.006, hy=7, clL_up=3, clR_up=3, cx=-3)
c.add = addf(osc("hz", 2, 72), osc("pry", 1.5, 72, 0.25))

# ================================================================ idle_hands_front: polite idle
c = clip("idle_hands_front", 120, loop=True, note="polite idle: hands together in front of the skirt, elbows in, shoulders up a little, slow hip sway, head tilt")
HF = dict(aL=W("L", 0.03, -0.175, 0.835, "pelvis", pole=(0.8, 0.5, -0.2), hand=((-0.45, -0.35, -0.8), (-0.7, 0.6, 0.0))),
          aR=W("R", 0.022, -0.185, 0.85, "pelvis", pole=(-0.8, 0.5, -0.2), hand=((-0.45, -0.35, -0.8), (-0.7, 0.6, 0.0))))
c.k(0, **M(cp("R", 0.75), HF, clL_up=4, clR_up=4, hy=7, hx=6))
c.k(60, **M(cp("L", 0.75), hy=-5, hx=5)).k(120, **M(cp("R", 0.75), hy=7, hx=6))
c.drag = {"L": 0.0, "R": 0.0}
c.add = br(60, 0.9)

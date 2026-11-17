"""sitting / floor / lying clips"""
from clips_stand import *


def FA(x, y, z, yaw=0, pitch=0):
    """absolute ankle target (world), foot yaw + pitch about the ankle (pitch > 0 = toes down)"""
    return (x, y, yaw, pitch, z, 1.0)


def FAp(p, rx=0, ry=0, rz=0, off=(0, 0, 0), yaw=0, pitch=0):
    w = pel_world(p, rx, ry, rz, off); return FA(w[0], w[1], w[2], yaw, pitch)


# ================================================================ CHAIR (seat height ~0.42 m)
SEAT = dict(pz=-0.285, py=0.0, prx=-4, sx=2, **SQ, fL=STL, fR=STR, kL=(-0.1, -1, 0.2), kR=(0.1, -1, 0.2),
            aL=W("L", 0.05, -0.21, 0.62, "world", wr=(0, -15, 0), pole=(1, 0.6, -0.2)), aR=W("R", 0.045, -0.20, 0.625, "world", wr=(0, -15, 0), pole=(-1, 0.6, -0.2)))
c = clip("sit_chair", 120, loop=True, note="sitting on a chair / bench, knees together, hands on the lap, gentle sway"); c.cam = (24, -4.6)
c.k(0, **SEAT)
c.add = addf(br(60, 0.9), osc("hy", 5, 120), osc("sy", 2, 120, 0.1), osc("hz", 3, 120, 0.3))
c.face(0, "open", "smile"); blink(c, 50, mouth="smile")

c = clip("sit_down", 36, note="stand -> chair: knees bend, lean forward, hips back and down, small settle (ends in sit_chair)"); c.cam = (24, -4.2)
c.k(0, **B0).k(4, **B0)
c.k(12, **SQ, pz=-0.10, py=0.03, prx=14, sx=10, cx=8, hx=-8, px=0, pry=0, prz=0, sy=0, cy=0, fL=STL, fR=STR, kL=(-0.1, -1, 0.2), kR=(0.1, -1, 0.2),
    aL=W("L", 0.10, -0.20, 0.82, "pelvis", wr=(0, -10, 0), pole=(1, 0.6, -0.2)), aR=W("R", 0.10, -0.20, 0.82, "pelvis", wr=(0, -10, 0), pole=(-1, 0.6, -0.2)))
c.k(22, **{**SEAT, "prx": 8, "sx": 6, "cx": 4, "pz": -0.29})
c.k(27, **{**SEAT, "pz": -0.292, "cx": -2}).k(36, **SEAT)
c.face(0, "open", "neutral"); c.face(20, "blink", "smile"); c.face(23, "open", "smile")

c = clip("sit_slumped", 90, loop=True, note="UpNext #5: slumped on the edge of a bed / bench, forearms on the thighs, head down, knees in, feet apart"); c.cam = (24, -4.6)
c.k(0, **{**SEAT, "prx": 6, "sx": 14, "cx": 16, "hx": 22, "hy": -6, "clL_up": -4, "clR_up": -4, "clL_fw": 6, "clR_fw": 6,
          "fL": F("L", FXL + 0.05, FY - 0.04, -18, 10), "fR": F("R", FXR - 0.05, FY - 0.02, 18, 0), "kL": (-0.4, -1, 0.2), "kR": (0.4, -1, 0.2),
          "aL": W("L", 0.04, -0.31, 0.50, "world", wr=(0, -30, 0), pole=(1, 0.5, -0.3)), "aR": W("R", 0.03, -0.30, 0.51, "world", wr=(0, -30, 0), pole=(-1, 0.5, -0.3))})
c.add = br(90, 1.4)
c.face(0, "half", "frown"); c.face(40, "blink", "frown"); c.face(43, "half", "frown")

# ================================================================ FLOOR (c.ground: auto floor clamp)
FLOOR_P = dict(pz=-0.655, py=0.02)
c = clip("sit_floor", 120, loop=True, note="side-saddle sit on the floor (yokozuwari): both legs folded to her right, leaning on her left hand")
c.ground = True; c.cam = (24, -6.0)
c.k(0, **SQ, **FLOOR_P, prz=18, pry=-4, sy=9, cy=4, hy=-8, hz=-14,
    fL=FA(CX - 0.26, -0.22, 0.07, -70, 50), fR=FA(CX - 0.34, 0.02, 0.07, -80, 55), kL=(0.2, -1, -0.2), kR=(-0.2, -1, -0.1),
    aL=W("L", 0.27, 0.04, 0.115, "world", wr=(0, 40, 0), pole=(1, 0.7, 0)), aR=W("R", 0.06, -0.26, 0.22, "world", wr=(0, -10, 0), pole=(-1, 0.4, -0.3)))
c.add = addf(br(60, 0.9), osc("hy", 4, 120), osc("hz", 3, 120, 0.25))
c.face(0, "smiling", "softSmile"); blink(c, 70, eyes="smiling", mouth="softSmile")

c = clip("kneel", 120, loop=True, note="seiza: kneeling, sitting back on her heels, hands on the thighs (sinaboto kneel)")
c.ground = True; c.cam = (24, -6.0)
c.k(0, **SQ, pz=-0.50, py=0.07, prx=-6, sx=4, cx=2, hx=4,
    fL=FA(CX + 0.07, 0.17, 0.07, 0, 158), fR=FA(CX - 0.07, 0.17, 0.07, 0, 158), kL=(0, -1, -0.6), kR=(0, -1, -0.6),
    aL=W("L", 0.07, -0.14, 0.36, "world", wr=(0, -10, 0), pole=(1, 0.5, -0.3)), aR=W("R", 0.07, -0.14, 0.36, "world", wr=(0, -10, 0), pole=(-1, 0.5, -0.3)))
c.add = addf(br(60, 0.9), osc("hy", 4, 120))
c.face(0, "open", "smile"); blink(c, 60, mouth="smile")

c = clip("hug_knees", 90, loop=True, note="UpNext #15: sitting on the floor hugging her knees, cheek on the knees, slow rock")
c.ground = True; c.cam = (24, -6.0)
c.k(0, **SQ, pz=-0.64, py=0.06, prx=-18, sx=22, cx=16, hx=14, hy=16, hz=-10,
    fL=FA(CX + 0.06, -0.30, 0.08, -6, 10), fR=FA(CX - 0.06, -0.30, 0.08, 6, 10), kL=(0, -0.3, 1), kR=(0, -0.3, 1),
    aL=W("L", -0.05, -0.44, 0.30, "world", wr=(0, 20, 0), pole=(1, 0.2, -0.6)), aR=W("R", -0.05, -0.43, 0.33, "world", wr=(0, 20, 0), pole=(-1, 0.2, -0.6)))
c.add = addf(br(45, 0.8), osc("prx", 2.5, 90), osc("hy", 3, 90, 0.2))
c.face(0, "shy", "softSmile"); blink(c, 50, eyes="shy", mouth="softSmile")

# ================================================================ LYING
LB = dict(prx=-90, pz=-0.655, py=0.0, **SQ, hx=10)
c = clip("lie_back", 120, loop=True, note="UpNext #10: lying on her back, one knee up, one arm out, hand on the belly, breathing")
c.ground = True; c.cam = (27, -7.2, 1.35)
c.k(0, **LB, fL=FA(CX + 0.08, -0.66, 0.075, 6, -40), fR=FA(CX - 0.06, -0.44, 0.075, -4, 10), kL=(0, -1, 0), kR=(-0.15, -1, 0),
    aL=W("L", 0.42, 0.12, 1.12, wr=(0, 10, 0), pole=(0.3, 1, 0)), aR=W("R", 0.03, -0.23, 1.02, wr=(0, 25, 0), pole=(-1, 0.4, 0)))
c.add = addf(br(75, 1.3), osc("hz", 4, 120))
c.face(0, "relaxed", "smile"); c.face(60, "soft", "smile"); c.face(90, "relaxed", "smile")

LSo = (0, 0, 0)
c = clip("lie_side", 120, loop=True, note="lying on her left side, knees bent forward, head on her arm, top hand on the hip")
c.ground = True; c.cam = (27, -7.2, -0.25)
LS = dict(pry=86, pz=-0.60, px=0.0, **SQ, ny=-14, hy=-8, sy=-4)
c.k(0, **LS, fL=FAp((0.10, -0.30, 0.33), ry=86, off=(0, 0, -0.60), yaw=0, pitch=40), fR=FAp((0.00, -0.38, 0.36), ry=86, off=(0, 0, -0.60), yaw=0, pitch=40),
    kL=(0, -1, 0), kR=(0, -1, 0.1),
    aL=W("L", 0.10, -0.10, 1.66, wr=(0, 20, 0), pole=(0.3, 0.6, 1)), aR=W("R", 0.21, -0.07, 0.96, wr=(0, -10, 0), pole=(-0.6, 0.8, 0)))
c.add = addf(br(75, 1.1))
c.face(0, "bedroom", "softSmile"); blink(c, 70, eyes="bedroom", mouth="softSmile")

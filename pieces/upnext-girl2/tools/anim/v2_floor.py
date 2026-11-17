"""v2 sitting / floor / lying clips"""
from v2_stand import *


def FAp(p, rx=0, ry=0, rz=0, off=(0, 0, 0), yaw=0, pitch=0):
    w = pel_world(p, rx, ry, rz, off); return FA(w[0], w[1], w[2], yaw, pitch)


# ================================================================ CHAIR (seat ~0.42 m behind her standing feet: the root stays at the feet)
SEAT_FEET = dict(fL=FEET["fL"], fR=FEET["fR"])
SEAT = M(dict(sz=-4, cz=-6), SEAT_FEET, pz=-0.305, py=0.265, prx=-4, sx=3, cx=-2, hx=3, prz=6, kL=(-0.25, -1, 0.15), kR=(-0.05, -1, 0.15),
         aL=W("L", 0.045, -0.06, 0.60, "world", pole=(1, 0.6, -0.2), hand=H_LAP), aR=W("R", -0.005, -0.04, 0.615, "world", pole=(-1, 0.6, -0.2), hand=H_LAP))
c = clip("sit_chair", 120, loop=True, note="sitting on a chair / bench behind her feet, knees together slanted to one side, hands stacked on the lap, gentle sway and head tilts")
c.cam = (24, -4.6)
c.skirt_k = (0.62,0.3)  # SITK
c.k(0, **SEAT)
c.drag = {"L": 0.0, "R": 0.0}
c.add = addf(br(60, 0.9), osc("hy", 6, 120), osc("sy", 2, 120, 0.1), osc("hz", 4, 120, 0.3), osc("cy", -1.5, 120, 0.1))

c = clip("sit_down", 36, note="stand -> chair: weight back, knees bend, chest leans forward to balance, hips lower onto the seat, small settle (ends in sit_chair)")
c.cam = (24, -4.2)
c.skirt_k = (0.62,0.3)  # SITK
c.k(0, **B0).k(4, **B0)
SD1 = M(dict(sz=-4, cz=-6), FEET, pz=-0.10, py=0.08, prx=18, sx=10, cx=6, hx=-10, kL=(-0.2, -1, 0.15), kR=(-0.05, -1, 0.15),
        aL=W("L", 0.15, -0.16, 0.82, "pelvis", pole=(1, 0.6, -0.2), hand=H_HANG), aR=W("R", 0.15, -0.16, 0.82, "pelvis", pole=(-1, 0.6, -0.2), hand=H_HANG))
c.k(13, **SD1)
c.k(22, **M(SEAT, prx=10, sx=8, cx=4, pz=-0.30, hx=-2))
c.k(27, **M(SEAT, pz=-0.31, cx=-4, hx=5)).k(36, **SEAT)
c.drag = {"L": 0.3, "R": 0.3}

c = clip("sit_slumped", 90, loop=True, note="UpNext #5: slumped on the edge of a bed / bench, forearms on the thighs, head down, knees in, feet apart")
c.cam = (24, -4.6)
c.skirt_k = (0.62,0.3)  # SITK
SL = M(SEAT, prx=4, sx=16, cx=16, hx=24, hy=-7, clL_up=-5, clR_up=-5, clL_fw=7, clR_fw=7, prz=0,
       fL=Fo("L", CX + 0.13, -0.08, -12, 12), fR=Fo("R", CX - 0.13, -0.06, -14, 0), kL=(-0.1, -1, 0.2), kR=(0.1, -1, 0.2),
       aL=W("L", 0.035, -0.29, 0.52, "world", pole=(1, 0.5, -0.3), hand=((-0.4, -0.7, -0.6), (0.2, 0.4, -1))),
       aR=W("R", 0.03, -0.28, 0.53, "world", pole=(-1, 0.5, -0.3), hand=((-0.4, -0.7, -0.6), (0.2, 0.4, -1))))
c.k(0, **SL)
c.drag = {"L": 0.0, "R": 0.0}
c.add = addf(br(90, 1.4), osc("hy", 2, 90, 0.3))

# ================================================================ FLOOR (ground clamp on)
c = clip("sit_floor", 120, loop=True, note="sitting on the floor leaning back on both hands, legs out in front with the knees softly up and the ankles crossed, head tilted, slow sway")
c.ground = True; c.cam = (24, -6.0)
SF = M(dict(sz=-2, cz=-4), pz=-0.70, py=0.06, prx=-16, pry=-3, prz=-6, sx=5, cx=4, hx=10, hy=10, hz=8, clL_up=6, clR_up=7,
       fL=FA(CX + 0.10, -0.46, 0.075, 12, -50), fR=FA(CX - 0.09, -0.50, 0.075, -12, -52),
       kL=(-0.05, -0.35, 1), kR=(0.05, -0.35, 1),
       aL=W("L", 0.21, 0.22, 0.075, "world", pole=(1, 0.8, 0.3), hand=((0.35, 0.6, -0.1), (0, 0, -1))),
       aR=W("R", 0.21, 0.22, 0.075, "world", pole=(-1, 0.8, 0.3), hand=((0.35, 0.6, -0.1), (0, 0, -1))))
c.k(0, **SF)
c.drag = {"L": 0.0, "R": 0.0}; c.skirt_k = (0.62, 0.3)
c.add = addf(br(60, 0.9), osc("hy", 5, 120), osc("hz", 3, 120, 0.25), osc("pry", 1.5, 120))

c = clip("kneel", 120, loop=True, note="seiza: kneeling, sitting back on her heels, knees together, hands on the thighs, back straight, soft head tilt")
c.ground = True; c.cam = (24, -6.0)
KN = M(dict(sz=-4, cz=-6), pz=-0.52, py=0.10, prx=-4, sx=3, cx=-2, hx=6, hy=6,
       fL=FA(CX + 0.075, 0.24, 0.145, 6, 160), fR=FA(CX - 0.075, 0.24, 0.145, -6, 160), kL=(-0.05, -1, -0.5), kR=(0.05, -1, -0.5),
       aL=W("L", 0.06, -0.10, 0.34, "world", pole=(1, 0.5, -0.3), hand=H_LAP), aR=W("R", 0.06, -0.10, 0.34, "world", pole=(-1, 0.5, -0.3), hand=H_LAP))
c.k(0, **KN)
c.drag = {"L": 0.0, "R": 0.0}
c.add = addf(br(60, 0.9), osc("hy", 5, 120), osc("pry", 1.5, 120, 0.2))

c = clip("hug_knees", 90, loop=True, note="UpNext #15: sitting on the floor hugging her knees, cheek resting on them, slow rock")
c.ground = True; c.cam = (24, -6.0)
HG = M(dict(sz=-4, cz=-6), pz=-0.70, py=0.08, prx=-22, sx=24, cx=18, hx=10, hy=16, hz=-12,
       fL=FA(CX + 0.065, -0.27, 0.085, 4, 12), fR=FA(CX - 0.065, -0.25, 0.085, -4, 12), kL=(0.05, -0.4, 1), kR=(-0.05, -0.4, 1),
       aL=W("L", -0.035, -0.37, 0.28, "world", pole=(1, 0.3, -0.5), hand=((-1, 0.2, -0.1), (0, 1, 0))),
       aR=W("R", -0.035, -0.355, 0.31, "world", pole=(-1, 0.3, -0.5), hand=((-1, 0.2, 0.1), (0, 1, 0))))
c.k(0, **HG)
c.drag = {"L": 0.0, "R": 0.0}
c.add = addf(br(45, 0.8), osc("prx", 2.5, 90), osc("hy", 3, 90, 0.2))

# ================================================================ LYING
c = clip("lie_back", 120, loop=True, note="UpNext #10: lying on her back, left knee up, right leg long, right hand on the belly, left arm out palm up, head turned, breathing")
c.ground = True; c.cam = (24, -7.6, 1.35, 9.0)
LB = M(dict(sz=-4, cz=-6), prx=-88, pz=-0.655, py=0.0, sx=3, cx=-2, hx=4, hz=-18, hy=-6, pry=-3, sy=2, cy=3,
       fL=FA(CX + 0.10, -0.42, 0.085, 6, 0), fR=FA(CX - 0.10, -0.68, 0.075, -18, -62), kL=(0.15, -1, 0), kR=(-0.25, -1, 0),
       aR=W("R", 0.01, -0.19, 0.98, pole=(-1, 0.6, 0), hand=((-0.9, -0.1, 0.25), (0, 1, 0))),
       aL=W("L", 0.20, 0.07, 1.53, pole=(1, 0.3, -0.3), hand=((-0.2, 0.1, 1), (0, -1, 0.1))))
c.k(0, **LB)
c.drag = {"L": 0.0, "R": 0.0}
c.add = addf(br(75, 1.3), osc("hz", 4, 120))

c = clip("lie_side", 120, loop=True, note="lying on her left side, knees bent forward (top leg ahead), head resting on her arm, top hand on the hip")
c.ground = True; c.cam = (24, -7.6, -0.25, 9.0)
LS = M(dict(sz=-4, cz=-6), pry=86, pz=-0.60, px=0.0, ny=-14, hy=-8, sy=-4, cy=2, hx=4,
       fL=FAp((0.10, -0.13, 0.13), ry=86, off=(0, 0, -0.60), yaw=0, pitch=25), fR=FAp((-0.05, -0.44, 0.37), ry=86, off=(0, 0, -0.60), yaw=-6, pitch=45),
       kL=(0, -1, 0), kR=(-0.1, -1, 0.1),
       aL=A(pel_world((CX + 0.14, -0.20, 1.60), ry=86, off=(0, 0, -0.60)), "world", (0.2, -0.3, 1), (0, 0, 0), HD("L", (0.0, -0.6, 0.8), (1, 0, 0))),
       aR=A(pel_world((CX - 0.29, -0.09, 0.81), ry=86, off=(0, 0, -0.60)), "world", (-0.7, 0.7, 0.1), (0, 0, 0), HD("R", (0.15, -0.35, -1), (-1, 0, 0.1))))
c.k(0, **LS)
c.drag = {"L": 0.0, "R": 0.0}
c.add = addf(br(75, 1.1))

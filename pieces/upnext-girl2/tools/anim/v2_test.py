"""debug clips (only when V2TEST=1)"""
from v2_clips import *
c = clip("zz_wrist", 70, note="hand orientation test")
c.follow = {}; c.drag = {"L": 0, "R": 0}; c.wrdrag = {"L": 0, "R": 0}; c.skirt = 0
vals = [((0.3, -1, 0.1), (0, 0, 1)), ((0.3, -1, 0.1), (0, 0, -1)), ((0.1, -0.2, 1), (0, -1, 0)), ((0.2, -0.3, -1), (-1, 0.2, 0)),
        ((0.6, -0.8, 0.2), (-0.3, 0.2, 1)), ((-0.3, -1, 0.3), (0.2, 0.2, 1)), ((0.0, -0.4, 1), (-1, 0, 0))]
for i, h in enumerate(vals):
    c.k(i * 10, **M(B0, aL=W("L", 0.22, -0.28, 1.05, pole=(0.8, 0.5, -0.6), hand=h), aR=W("R", 0.22, -0.28, 1.05, pole=(-0.8, 0.5, -0.6), hand=h)))

# ---------------------------------------------------------------- branding still: lean in + point (only in V2TEST builds)
c = clip("zz_point_sub", 10, note="branding still: leans toward the camera, left arm pointing across the frame, excited")
c.follow = {}; c.drag = {"L": 0, "R": 0}; c.wrdrag = {"L": 0, "R": 0}; c.skirt = 0; c.bust = 0
PS = M(cp("R", 0.6), prx=18, sx=12, cx=18, cy=6, sy=3, cz=12, sz=3, hx=-18, hy=-9, hz=-3, nx=-6, clL_up=11, clR_up=9,
       aL=W("L", 0.44, -0.20, 1.50, "chestN", pole=(0.3, 0.7, -1), hand=((0.88, -0.40, 0.25), (0.05, 0.25, -1))),
       aR=W("R", 0.075, -0.17, 1.21, pole=(-0.6, 0.2, -1), hand=H_FIST_UP))
c.k(0, **PS).k(10, **PS)
c.face(0, "surprised", "oh")

# ---------------------------------------------------------------- branding still v3: close-up lean-in, bent pointing arm, fist at the cheek
c = clip("zz_point_close", 10, note="branding still v3")
c.follow = {}; c.drag = {"L": 0, "R": 0}; c.wrdrag = {"L": 0, "R": 0}; c.skirt = 0; c.bust = 0
PC = M(cp("R", 0.5), prx=16, sx=10, cx=14, cy=-4, sy=-2, cz=-10, sz=-4, hx=-10, hy=12, hz=16, nx=-4, nz=6, clL_up=12, clR_up=10,
       aL=W("L", 0.40, -0.20, 1.50, "chestN", pole=(0.7, 0.7, -0.5), hand=((0.88, -0.42, 0.20), (0.10, 0.25, -1))),
       aR=W("R", 0.06, -0.13, 1.41, pole=(-0.1, -0.35, -1), hand=H_CHEEK))
c.k(0, **PC).k(10, **PC)
c.face(0, "sparkle+blush", "oh+blush")

# ---------------------------------------------------------------- banner v4 pose candidates (bust-up, cute, turned toward the centre)
_PRES = W("L", 0.30, -0.25, 1.10, "chestN", pole=(0.9, 0.6, -0.4), hand=H_UPOUT)
_CHEEK = W("R", 0.085, -0.12, 1.335, pole=(-0.1, -0.35, -1), hand=H_CHEEK)
_CHEER = W("R", 0.30, -0.06, 1.70, pole=(-1, 0.3, 0), hand=((0.3, -0.2, 1), (-0.2, -1, 0)))
_CHIN = dict(aL=W("L", 0.035, -0.17, 1.27, pole=(0.7, 0.3, -1), hand=((-0.4, -0.2, 0.9), (-1, 0.3, 0))),
             aR=W("R", 0.03, -0.175, 1.265, pole=(-0.7, 0.3, -1), hand=((-0.4, -0.2, 0.9), (-1, 0.3, 0))))
_WAVEL = W("L", 0.29, -0.06, 1.48, pole=(1, 0.3, -1), hand=((0.12, -0.2, 1), (0, -1, 0)))
_BODY = dict(sz=4, cz=10, prz=6, cx=6, hx=-4, hy=10, hz=4, clL_up=6, clR_up=6)
for _n, _arms, _extra in (("zz_v4_c1", dict(aL=_PRES, aR=_CHEEK), dict(clR_up=10)), ("zz_v4_c2", dict(aL=_PRES, aR=_CHEER), dict(clR_up=12, hy=-6)),
                          ("zz_v4_c3", _CHIN, dict(clL_up=8, clR_up=8, hy=14)), ("zz_v4_c4", dict(aL=_PRES, aR=W("R", 0.212, 0.03, 0.972, "pelvis", pole=(-1, 0.75, 0.0), hand=H_HIP)), dict(hy=12)),
                          ("zz_v4_c5", dict(aL=_WAVEL, aR=_CHEEK), dict(clL_up=10, clR_up=9, hy=-8)), ("zz_v4_c6", dict(aL=_PRES, aR=W("R", 0.04, -0.20, 1.18, pole=(-1, 0.3, -0.6), hand=H_CHEST)), dict(hy=10))):
    c = clip(_n, 10, note="banner v4 candidate")
    c.follow = {}; c.drag = {"L": 0, "R": 0}; c.wrdrag = {"L": 0, "R": 0}; c.skirt = 0; c.bust = 0
    _P = M(cp("R", 0.5), _BODY, _arms, _extra); c.k(0, **_P).k(10, **_P)

# ---------------------------------------------------------------- banner v4 pose candidates, round 2 (softer bent presenting arm)
_PRES2 = W("L", 0.27, -0.22, 1.31, "chestN", pole=(0.6, 0.5, -1), hand=((0.85, -0.3, 0.45), (-0.3, 0.1, 0.95)))
_CHEER2 = W("R", 0.24, -0.07, 1.63, pole=(-1, 0.2, -0.3), hand=((0.25, -0.25, 1), (-0.3, -1, 0)))
_CHEEK2 = W("R", 0.15, -0.07, 1.36, pole=(-0.6, -0.2, -1), hand=H_CHEEK)
_CHIN2 = dict(aL=W("L", 0.035, -0.19, 1.27, pole=(0.8, 0.2, -1), hand=((-0.4, -0.2, 0.9), (-1, 0.3, 0))),
              aR=W("R", 0.03, -0.195, 1.265, pole=(-0.8, 0.2, -1), hand=((-0.4, -0.2, 0.9), (-1, 0.3, 0))))
for _n, _arms, _extra in (("zz_v4_d1", dict(aL=_PRES2, aR=_CHEER2), dict(clR_up=12, hy=-4, hz=6)), ("zz_v4_d2", dict(aL=_PRES2, aR=_CHEEK2), dict(clR_up=9, hy=-6)),
                          ("zz_v4_d3", dict(aL=_PRES2, aR=W("R", 0.04, -0.20, 1.18, pole=(-1, 0.3, -0.6), hand=H_CHEST)), dict(hy=10)),
                          ("zz_v4_d4", _CHIN2, dict(clL_up=9, clR_up=9, hy=-12, cz=4, sz=2))):
    c = clip(_n, 10, note="banner v4 candidate")
    c.follow = {}; c.drag = {"L": 0, "R": 0}; c.wrdrag = {"L": 0, "R": 0}; c.skirt = 0; c.bust = 0
    _P = M(cp("R", 0.5), _BODY, _arms, _extra); c.k(0, **_P).k(10, **_P)

# ---------------------------------------------------------------- banner v4b: cheer arm up + hand on the chest (no presenting hand)
c = clip("zz_v4_d5", 10, note="banner v4 right pose")
c.follow = {}; c.drag = {"L": 0, "R": 0}; c.wrdrag = {"L": 0, "R": 0}; c.skirt = 0; c.bust = 0
_P = M(cp("R", 0.5), _BODY, dict(aR=_CHEER2, aL=W("L", 0.045, -0.20, 1.17, pole=(1, 0.3, -0.6), hand=H_CHEST)), dict(clR_up=12, hy=-6, hz=6))
c.k(0, **_P).k(10, **_P)

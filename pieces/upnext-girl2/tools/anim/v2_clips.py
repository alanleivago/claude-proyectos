"""girl2 feminine animation set v2: poses (faces come from the v1 clips in clips*.py, see anim2lib).
Coordinates: model metres, x = her left, -y = her front, z up. Channels: see animlib / anim2lib.
E(x, y, z) per bone: +x bend forward, +y lean to her left, +z turn to her left."""
import numpy as np
from anim2lib import Clip2, A, REST_A, IDLE_F, wave, breathe
import core as C

CX = 0.014
CL = []


def clip(name, frames, loop=False, note=""):
    c = Clip2(name, frames, loop, note); CL.append(c); return c


# ---------------------------------------------------------------- feet
# his_idle feet are toed in (L 12.5 deg, R 15 deg); Fo takes the toe-out angle vs straight ahead instead
TOEIN = {"L": 12.5, "R": 15.0}


def Fo(s, x, y, out=0.0, heel=0.0, lift=0.0):
    """flat-foot ankle (x, y); out = toe-out deg (negative = pigeon-toed); heel = heel raise deg (pivot on the toe)"""
    yaw = (out + TOEIN["L"]) if s == "L" else -(out + TOEIN["R"])
    return (x, y, yaw, heel, lift, 0.0)


def pivot(s, spec, dyaw, about="toe"):
    """the same flat-foot spec turned by dyaw about its toe tip (or heel) on the floor -> no sliding at the pivot"""
    from animlib import SOLEPT
    x, y, yaw, heel, lift = spec[:5]
    ank0 = C.IDLE_ANK[s]; p0 = SOLEPT[s][0 if about == "toe" else 1]
    flat = np.array([x, y, ank0[2]]); piv = flat + C.axang([0, 0, 1], yaw) @ (p0 - ank0)
    flat1 = piv - C.axang([0, 0, 1], yaw + dyaw) @ (p0 - ank0)
    return (float(flat1[0]), float(flat1[1]), yaw + dyaw, heel, lift, 0.0)


def step(c, s, f0, f1, a, b, lift=0.05):
    """foot s steps from spec a (frame f0) to spec b (f1): heel peels, the foot moves only while it is in the air, lands"""
    d = f1 - f0; fa, fm, fb = f0 + 0.24 * d, f0 + 0.5 * d, f1 - 0.24 * d
    mid = [(a[i] + b[i]) / 2 for i in range(3)]
    c.k(f0, **{"f" + s: tuple(a)}).k(fa, **{"f" + s: (a[0], a[1], a[2], 24, 0.02, 0)})
    c.k(fm, **{"f" + s: (mid[0], mid[1], mid[2], 8, lift, 0)})
    c.k(fb, **{"f" + s: (b[0], b[1], b[2], -8, 0.02, 0)}).k(f1, **{"f" + s: tuple(b)})
    return c


def FA(x, y, z, yaw=0, pitch=0):
    """absolute ankle (world), foot yaw + pitch about the ankle (pitch > 0 = toes down)"""
    return (x, y, yaw, pitch, z, 1.0)


def W(s, x, y, z, sp="chestN", pole=None, wr=(0, 0, 0), hand=None):
    """wrist target mirrored by side: x = distance from the centre line towards that side; hand = HD(...) or
    (fingers, palm) given for the LEFT side (mirrored for R)"""
    sg = 1 if s == "L" else -1
    if hand is not None and not isinstance(hand, tuple): hand = tuple(hand)
    if hand is not None: hand = HD(s, hand[0], hand[1])
    return A((CX + sg * x, y, z), sp, pole if pole is not None else (sg * 0.6, 0.6, -0.5), wr, hand)


def HD(s, fingers, palm):
    """hand orientation for side s from left-hand body directions (x mirrored for R): fingers dir, palm normal"""
    sg = 1 if s == "L" else -1; f = np.array(fingers, float); p = np.array(palm, float); f[0] *= sg; p[0] *= sg
    return (f, p)


def pel_world(p, rx=0, ry=0, rz=0, off=(0, 0, 0)):
    h = C.Hr[C.BI["Pelvis"]]; return h + np.asarray(off) + C.E(rx, ry, rz) @ (np.asarray(p, float) - h)


def M(*ds, **kw):
    """merge pose dicts (later wins) + overrides"""
    out = {}
    for d in ds: out.update(d)
    out.update(kw); return out


def plus(d, **kw):
    """pose dict with numeric channels offset by kw"""
    out = dict(d)
    for k, v in kw.items(): out[k] = out.get(k, 0.0) + v
    return out


def addf(*fs):
    def f_(f, P):
        for g in fs: g(f, P)
    return f_


def osc(ch, amp, period, phase=0.0, pos=False):
    def g(f, P):
        w = wave(f, period, phase); P[ch] = P[ch] + amp * (max(0.0, w) if pos else w)
    return g


def br(period, amt): return lambda f, P: breathe(P, f, period, amt)


# ---------------------------------------------------------------- stance + contrapposto
# Feet stay put while the weight moves: the weight leg is straight under a pelvis that slides over it, the free hip drops
# and swings forward, the free heel lifts (toe planted) so that knee bends forward and in, the ribcage and shoulders tilt
# the other way (S-curve) and the head settles back towards level.
SW = 0.086                                              # half stance (ankle x from the centre line)
FEET = dict(fL=Fo("L", CX + SW, -0.035, 10), fR=Fo("R", CX - SW, 0.045, 6))         # L foot a little forward


def cp(w="R", amt=1.0, feet=None, heel=15.0, knee_in=0.35):
    """contrapposto, weight on leg w (feet from `feet`, the free heel lifts)"""
    sg = 1 if w == "L" else -1; ft = dict(feet or FEET)
    fr = "R" if w == "L" else "L"
    d = dict(px=sg * 0.044 * amt, pz=-0.016 * amt, pry=-sg * 9 * amt, prz=sg * 6 * amt, prx=-2 * amt,
             sy=sg * 5 * amt, cy=sg * 6 * amt, sz=-sg * 1.5 * amt - 4, cz=-sg * 3 * amt - 6, ny=sg * 1 * amt, hy=-sg * 4 * amt,
             cx=-2 * amt, hx=3 * amt)
    d[f"cl{w}_up"] = -2.5 * amt; d[f"cl{fr}_up"] = 2.0 * amt
    f_ = list(ft["f" + fr]); f_[3] = heel * amt; ft["f" + fr] = tuple(f_)
    f_ = list(ft["f" + w]); f_[3] = 0.0; ft["f" + w] = tuple(f_)
    d.update(ft)
    sgf = 1 if fr == "L" else -1
    d["k" + fr] = (-sgf * knee_in, -1, 0.05); d["k" + w] = (sgf * 0.05, -1, 0)
    return d


# hand presets for the LEFT hand (W / HD mirror them): (fingers direction, palm normal) in the target space
H_HANG = ((0.10, -0.14, -1), (-1, 0.2, 0.05))       # relaxed, fingers down, palm to the thigh
H_UP = ((0.35, -1, 0.15), (0, 0.15, 1))             # palm up, fingers forward-out (explaining)
H_UPOUT = ((1, -0.45, 0.15), (0, 0.1, 1))           # palm up, fingers out (shrug)
H_FWD = ((0.12, -0.2, 1), (0, -1, 0))               # palm forward, fingers up (wave / stop)
H_CHEEK = ((-0.2, -0.25, 1), (-1, 0.2, 0))          # fingers up, palm to her cheek
H_HIP = ((-0.25, 0.55, -0.8), (-1, 0.15, 0.25))     # back of the hand out, knuckles back-down on the hip
H_CHEST = ((-0.75, 0.0, 0.65), (0, 1, 0))           # palm on the chest, fingers to the other shoulder
H_LAP = ((-0.45, -0.75, -0.35), (0, 0.15, -1))      # palm down on the lap / thigh, fingers forward-in
H_DOWN = ((0.15, -1, -0.25), (0, 0, -1))            # palm down, fingers forward
H_MOUTH = ((-0.45, -0.15, 0.9), (0, 1, 0))          # palm over the mouth, fingers up-in
H_CHIN = ((-0.35, -0.25, 0.9), (-0.3, 1, 0))        # knuckles under the chin
H_CUP = ((-0.85, -0.45, 0.2), (0.1, 0.25, 1))       # cupping something, palm up, fingers in
H_BACKHEAD = ((-0.55, 0.15, 0.8), (0, -1, 0.1))     # palm on the back of the head
H_FIST_UP = ((-0.2, -0.3, 1), (-1, 0.4, 0))         # fist held up, knuckles up
H_ACROSS = ((-1, -0.25, -0.1), (0, 1, 0.1))         # forearm across the belly, palm to the body


def hang(s, out=0.0, fwd=0.0, up=0.0, soft=1.0):
    """relaxed arm: hand beside the thigh, elbow soft (target in pelvis space)"""
    sg = 1 if s == "L" else -1
    return A((CX + sg * (0.20 + out), -0.06 - fwd, 0.805 + up), "pelvis", (sg * 0.45, 0.85, 0.2), (0, 0, 0), HD(s, *H_HANG))


B0 = dict(**cp("R", 0.7), aL=hang("L"), aR=hang("R"))          # neutral standing base: one-shots start and end here


def talk(c, f0, f1, step=5, pat=("talkA", "neutral", "talkO", "smile"), eyes="open"):
    k = 0
    for f in range(f0, f1, step): c.face(f, eyes, pat[k % len(pat)]); k += 1


import v2_idle, v2_stand, v2_floor  # noqa: E402,F401  (register their clips)
import os as _os
if _os.environ.get("V2TEST"): import v2_test  # noqa: E402,F401

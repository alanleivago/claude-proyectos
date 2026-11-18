"""Flirty clips for the waitress (reference: TikTok @missmedannypsx, fuentes/missmedannypsx/ANIMS_MUJER.md C-01..C-12),
authored directly on her rig and finished by the same back end as the retargeted set (peak-keeping push-out, elbow-path
smoothing, twist calming, floor pass). python -I tools/wanim/flirty.py [clip,...]
-> adds q_/l_ entries to ref/anim_w.npz and merges out/actions.json + out/face_tracks.json
Coordinates: Blender metres, x = her left, -y = her front (the viewer / him), z up. E(x, y, z): +x bend forward,
+y lean to her left, +z turn to her left (same as Ashley's DSL)."""
import sys, os, json, numpy as np
from scipy.spatial.transform import Rotation as Rot
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import retarget as T

nrm = T.nrm; BI = T.BI; HrW = T.HrW; NB = T.NB; FPS = 30


def E(x=0, y=0, z=0): return Rot.from_euler("ZYX", [z, y, x], degrees=True).as_matrix()


def ss(t): t = float(np.clip(t, 0, 1)); return t * t * (3 - 2 * t)


def back(t, s=1.2):                              # ease-out with overshoot
    t = float(np.clip(t, 0, 1)) - 1; return t * t * ((s + 1) * t + s) + 1


def seg(f, keys, ease=ss):
    """piecewise eased interpolation of (frame, value) keys (values: float or array)"""
    if f <= keys[0][0]: return np.asarray(keys[0][1], float)
    for (f0, a), (f1, b) in zip(keys, keys[1:]):
        if f <= f1:
            t = ease((f - f0) / max(f1 - f0, 1e-6)); return np.asarray(a, float) + (np.asarray(b, float) - np.asarray(a, float)) * t
    return np.asarray(keys[-1][1], float)


# ------------------------------------------------------------------ rig references
ANK0 = {s: HrW[BI[f"Foot.{s}"]].copy() for s in "LR"}
FOOTD = {s: T.FOOT_W[s][0] for s in "LR"}
SH = {s: np.nonzero((T.VPART == "shoe") & ((T.VrW[:, 0] > 0) == (s == "L")))[0] for s in "LR"}
TOE0, HEEL0 = {}, {}
for s in "LR":
    P = T.VrW[SH[s]]; low = P[P[:, 2] < 0.01]; tt = (low[:, :2] - ANK0[s][:2]) @ nrm(FOOTD[s][:2]); toe = low[tt.argmax()].copy(); toe[2] = 0.0
    hl = low[tt.argmin()].copy(); hl[2] = 0.0; TOE0[s] = toe; HEEL0[s] = hl
SG = {"L": 1.0, "R": -1.0}


def foot(s, dx=0.0, dy=0.0, yaw=0.0, heel=0.0, lift=0.0, base_yaw=0.0, piv=(0.0, 0.02)):
    """foot spec -> leg target: rest ankle moved by (dx, dy) [after a whole-body yaw base_yaw about piv],
    yaw deg (+ = toe to her left), heel raise deg pivoting on the toe, lift m"""
    a0 = ANK0[s].copy(); Rb = T.axang([0, 0, 1], base_yaw); c = np.array([piv[0], piv[1], 0.0])
    flat = c + Rb @ (np.array([a0[0] + dx, a0[1] + dy, a0[2]]) - c); flat[2] = a0[2] + lift
    Rz = T.axang([0, 0, 1], base_yaw + yaw); lat = nrm(np.cross(FOOTD[s], [0, 0, 1]))
    piv0 = TOE0[s] if heel >= 0 else HEEL0[s]; p = flat + Rz @ (piv0 - a0)          # toe raise pivots on the heel
    Rf = Rz @ T.axang(lat, -heel); ank = p + Rf @ (a0 - piv0)
    up0 = nrm(np.cross(np.cross(FOOTD[s], [0, 0, 1]), FOOTD[s]))
    knee = Rz @ np.array([0, -1.0, 0])
    return dict(t=ank, pole=knee, fd=Rf @ FOOTD[s], up=Rf @ up0, bend=1.0, flat=(heel < 1.0 and lift < 0.002))


def chest_pt(Q, H, p): i = BI["Chest"]; return H[i] + Q[i] @ (np.asarray(p, float) - HrW[i])
def pel_pt(Q, H, p): return H[0] + Q[0] @ (np.asarray(p, float) - HrW[0])
def head_pt(Q, H, p): i = BI["Head"]; return H[i] + Q[i] @ (np.asarray(p, float) - HrW[i])


def arm_rest(s, Q, H, fwd=0.0, up=0.0, out=0.0):
    ic = BI["Chest"]; t = chest_pt(Q, H, HrW[BI[f"Hand.{s}"]] + np.array([SG[s] * out, -fwd, up]))
    return dict(t=t, pole=Q[ic] @ T.REST_POLE[(s, "arm")][1], fd=Q[ic] @ T.HAND_W[s][0], pd=Q[ic] @ T.HAND_W[s][1])


def arm_hip(s, Q, H):
    """fist on the hip, elbow back and out"""
    sg = SG[s]; ic = BI["Chest"]
    return dict(t=pel_pt(Q, H, [sg * 0.215, 0.03, 0.99]), pole=Q[ic] @ nrm(np.array([sg * 0.75, 0.6, -0.15])),
                fd=Q[0] @ nrm(np.array([-sg * 0.25, -0.45, -0.85])), pd=Q[0] @ nrm(np.array([-sg, 0.15, 0.0])))


def arm_front(s, Q, H):
    """hands loosely together in front of the hips (cute clasp)"""
    sg = SG[s]; ic = BI["Chest"]
    return dict(t=pel_pt(Q, H, [sg * 0.045, -0.165, 0.90]), pole=Q[ic] @ nrm(np.array([sg * 0.75, 0.55, -0.35])),
                fd=Q[0] @ nrm(np.array([-sg * 0.75, -0.35, -0.55])), pd=Q[0] @ nrm(np.array([0.0, 0.85, -0.5])))


def _frame(fd, pd):
    fd = nrm(fd); pd = nrm(pd - (pd @ fd) * fd); return np.stack([fd, pd, np.cross(fd, pd)], 1)


def arm_mix(a, b, w):
    """blend two arm specs: target lerp, pole and hand orientation by rotation slerp (no flips through zero)"""
    if w <= 0: return a
    if w >= 1: return b
    from scipy.spatial.transform import Slerp
    Ma, Mb = _frame(a["fd"], a["pd"]), _frame(b["fd"], b["pd"])
    M = Slerp([0, 1], Rot.from_matrix([Ma, Mb]))(w).as_matrix()
    pa, pb = nrm(a["pole"]), nrm(b["pole"]); ang = np.arccos(np.clip(pa @ pb, -1, 1))
    pole = pa if ang < 1e-6 else T.axang(np.cross(pa, pb) if np.linalg.norm(np.cross(pa, pb)) > 1e-6 else [0, 0, 1], np.degrees(ang) * w) @ pa
    return dict(t=(1 - w) * a["t"] + w * b["t"], pole=pole, fd=M[:, 0], pd=M[:, 1])


def body(ch):
    """channels -> world delta rotations of the trunk / clavicles (+ arms and legs follow their parents), pelvis head"""
    Q = np.tile(np.eye(3), (NB, 1, 1)); g = lambda k: ch.get(k, 0.0)
    Q[0] = E(g("prx"), g("pry"), g("prz")); Hp = HrW[0] + np.array([g("px"), g("py"), g("pz")])
    for n, p, k in (("Spine", "Pelvis", "s"), ("Chest", "Spine", "c"), ("Neck", "Chest", "n"), ("Head", "Neck", "h")):
        Q[BI[n]] = Q[BI[p]] @ E(g(k + "x"), g(k + "y"), g(k + "z"))
    for s in "LR":
        Q[BI[f"Clavicle.{s}"]] = Q[BI["Chest"]] @ E(0, -SG[s] * g(f"cl{s}_up"), -SG[s] * g(f"cl{s}_fw"))
        for n in ("UpperArm", "Forearm", "Hand"): Q[BI[f"{n}.{s}"]] = Q[BI[f"Clavicle.{s}"]]
        for n in ("Thigh", "Calf", "Foot"): Q[BI[f"{n}.{s}"]] = Q[0]
        Q[BI[f"Bust.{s}"]] = Q[BI["Chest"]]
    return Q, Hp


def breathe(f, period=90, amt=1.0):
    w = np.sin(2 * np.pi * f / period); return dict(cx=-1.0 * amt * w, sx=0.4 * amt * w, clL_up=1.0 * amt * w, clR_up=1.0 * amt * w)


def add(ch, d):
    for k, v in d.items(): ch[k] = ch.get(k, 0.0) + v
    return ch


# ------------------------------------------------------------------ clips
CLIPS = {}


def clip(name, n, loop, note, speed=None):
    def deco(fn): CLIPS[name] = dict(n=n, loop=loop, note=note, fn=fn, faces=[], speed=speed); return fn
    return deco


def faces(name, keys): CLIPS[name]["faces"] = [[int(f), e, m] for f, e, m in keys]


@clip("flirt_lean_in", 66, False, "C-01 lean-in: shifts onto the front foot, leans in from the hips (corset keeps the back long), "
      "chin down and eyes up at him, free hand loose, other fist on the hip; hold with breathing, settles back")
def lean_in(f):
    w = seg(f, [(0, 0), (6, 0), (16, 1.0), (50, 1.0), (64, 0)], ease=ss)
    o = 0.12 * np.sin(np.pi * np.clip((f - 6) / 10, 0, 1)) if f < 16 else 0.0          # overshoot on arrival
    ch = dict(py=-0.04 * w, pz=-0.012 * w, prx=3 * w, sx=(10 + 3 * o * 8) * w, cx=8 * w, nx=8 * w, hx=-5 * w, clR_fw=4 * w)
    if 16 <= f <= 50: add(ch, breathe(f - 16, 60, 0.7))
    feet = dict(L=foot("L", 0.005, -0.06), R=foot("R", -0.005, 0.07, 6, 10 * w))
    def arms(Q, H):
        return dict(L=arm_mix(arm_rest("L", Q, H), arm_hip("L", Q, H), ss(f / 8)), R=arm_rest("R", Q, H, fwd=0.07 * w, up=0.03 * w))
    return ch, feet, arms
faces("flirt_lean_in", [(1, "open", "softSmile"), (9, "smug", "smirk"), (21, "bedroom", "ahTongue"), (29, "smug", "smirk"),
                        (42, "half", "smirk"), (45, "blink", "smirk"), (47, "smug", "smirk"), (58, "open", "smile")])


@clip("flirt_hip_tilt", 96, True, "C-02 contrapposto: weight on her right leg, hip popped (free hip up), shoulders counter-tilt, head "
      "rolls to the loaded side, free foot turned out on the ball, fist on the hip; slow hip sway, breathing")
def hip_tilt(f):
    sw = np.sin(2 * np.pi * f / 96)
    ch = dict(px=-0.03 - 0.006 * sw, pz=-0.006, pry=-7 - 1.5 * sw, prz=6, sy=4 + 0.8 * sw, cy=3, hy=-9 - 1.0 * sw, nz=-4, hz=-3)
    add(ch, breathe(f, 96, 0.8))
    feet = dict(R=foot("R", 0.015, 0.0, -4), L=foot("L", 0.045, -0.035, 25, 18))
    def arms(Q, H): return dict(L=arm_hip("L", Q, H), R=arm_rest("R", Q, H, fwd=0.01, out=0.01))
    return ch, feet, arms
faces("flirt_hip_tilt", [(1, "smug", "cat"), (38, "half", "cat"), (40, "blink", "cat"), (43, "smug", "cat"), (60, "sideEyeR", "smirk"),
                         (78, "smug", "cat")])


@clip("flirt_doorframe", 120, True, "C-03 leaning on a door frame / pillar at her right (implied, at about 36 cm): hand high on the edge, "
      "shoulder and head tilted into it, hips pushed toward it, legs crossed with the far foot in front on the ball, other fist "
      "on the hip; slow sway, her gaze slides to him and back")
def doorframe(f):
    sw = np.sin(2 * np.pi * f / 120)
    ch = dict(px=-0.05, pz=-0.012, prz=15, pry=3 + 1.0 * sw, sy=-6 - 1.2 * sw, cy=-3, cz=-4, hy=-13 - 1.5 * sw, hz=-8, nz=-4, clR_up=4)
    add(ch, breathe(f, 120, 0.7))
    feet = dict(R=foot("R", -0.01, 0.06, -6), L=foot("L", -0.055, -0.13, -16, 14))
    def arms(Q, H):
        R = dict(t=np.array([-0.355, -0.03, 1.60]), pole=nrm(np.array([-0.55, 0.45, -0.7])), fd=np.array([0, 0, 1.0]), pd=np.array([-1.0, 0, 0]))
        return dict(L=arm_hip("L", Q, H), R=R)
    return ch, feet, arms
faces("flirt_doorframe", [(1, "smug", "cat"), (28, "sideEyeR", "smirk"), (44, "smug", "cat"), (60, "blink", "cat"), (63, "smug", "cat"),
                          (82, "sideEyeR", "hookSmile" if False else "smirk"), (100, "smug", "cat")])


@clip("flirt_over_shoulder", 75, False, "C-04 look over the shoulder: standing turned away (back three-quarters to the viewer), the chest, neck "
      "and head turn back to him past her right shoulder with a small overshoot, fist on the hip; slow blink at the end")
def over_shoulder(f):
    BY = 140.0
    w = seg(f, [(0, 0), (8, 0), (20, 1.05), (26, 1.0)], ease=ss)
    ch = dict(prz=BY - 6 * w, px=0.0, sz=-14 * w, cz=-12 * w, nz=-20 * w, hz=-22 * w, hy=-6 * w, hx=-3 * w, clR_up=-2 * w, pry=2 * w)
    add(ch, breathe(f, 75, 0.6))
    feet = dict(L=foot("L", 0, -0.03, 4, 0, base_yaw=BY), R=foot("R", 0, 0.05, -8, 8, base_yaw=BY))
    def arms(Q, H): return dict(L=arm_hip("L", Q, H), R=arm_rest("R", Q, H, fwd=0.01))
    return ch, feet, arms
faces("flirt_over_shoulder", [(1, "open", "neutral"), (12, "smug", "smirk"), (40, "sideEyeR", "smirk"), (60, "half", "smirk"), (63, "blink", "smirk"),
                              (68, "smug", "smirk")])


def step_foot(s, f, f0, f1, a, b, lift=0.05):
    """one step: heel peels, foot travels only in the air (lift), lands heel first"""
    if f <= f0: return foot(s, *a)
    if f >= f1: return foot(s, *b)
    t = (f - f0) / (f1 - f0); u = ss(t)
    dx = a[0] + (b[0] - a[0]) * u; dy = a[1] + (b[1] - a[1]) * u
    heel = 22 * np.sin(np.pi * min(t / 0.5, 1)) * (1 - t) - 8 * max(0, np.sin(np.pi * (t - 0.6) / 0.4)) * (t > 0.6)
    return foot(s, dx, dy, 0.0, heel, lift * np.sin(np.pi * t))


@clip("flirt_approach", 80, False, "C-06 walking up into his space: two slow steps (35 cm each) with hip sway, free arm swinging, fist on the "
      "hip, stops with a little hip settle, head tips down to him (he is shorter); root moves 0.7 m forward")
def approach(f):
    fl = step_foot("L", f, 6, 22, (0, 0), (0.0, -0.35)) if f < 38 else step_foot("L", f, 38, 52, (0.0, -0.35), (0.0, -0.70), 0.03)
    fr = step_foot("R", f, 22, 38, (0, 0), (0.0, -0.70))
    yl = fl["t"][1] - ANK0["L"][1]; yr = fr["t"][1] - ANK0["R"][1]
    py = 0.5 * (yl + yr) - 0.03 * np.sin(np.pi * np.clip((f - 6) / 46, 0, 1))      # pelvis rides between the feet, a bit ahead
    sway = 0.022 * np.sin(np.pi * np.clip((f - 6) / 16, 0, 2)) if f < 38 else 0.0
    settle = -0.015 * np.sin(np.pi * np.clip((f - 50) / 14, 0, 1))
    stop = seg(f, [(0, 0), (50, 0), (60, 1)])
    ch = dict(py=py, px=sway, pz=settle - 0.006, prz=5 * np.sin(np.pi * np.clip((f - 6) / 16, 0, 2)) * (f < 38), pry=-3 * sway / 0.022,
              sx=5 * stop, hx=10 * stop, nx=3 * stop)
    add(ch, breathe(f, 80, 0.6))
    feet = dict(L=fl, R=fr)
    def arms(Q, H):
        swing = 0.07 * np.sin(np.pi * np.clip((f - 6) / 16, 0, 2)) * (f < 44)
        return dict(L=arm_mix(arm_rest("L", Q, H), arm_hip("L", Q, H), ss(f / 8)), R=arm_rest("R", Q, H, fwd=swing))
    return ch, feet, arms
faces("flirt_approach", [(1, "open", "softSmile"), (24, "open", "smile"), (44, "open", "smileOpen"), (56, "challenge", "smirk"), (70, "smug", "smirk")])


WALK = dict(N=36, D=0.62 * T.K, width=0.050, arc=0.07, lift=0.06, swing=0.07, bob=0.010, sway=0.040, roll=8.0, yaw=15.0, lead=0.07,
            toe_out=4.0, beta=0.58)


@clip("flirt_walk", 36, True, "C-07 / MercurialForge 12:38 feminine walk, in place (1.2 s cycle): the pelvis leads with sway, roll and "
      "rotation, upright counter-rotating torso, narrow steps on the centre line (the swing foot arcs around the stance foot), soft "
      "knees, light toe-first steps; hands flared out from the body, palms down, wrists bent, swinging a beat late (move the "
      "character at speed_units_per_s)", speed=round(0.62 * T.K / 1.2, 3))
def walk(f):
    W_ = WALK; N = W_["N"]; ph = f / N; beta = W_["beta"]; D = W_["D"]

    def fstep(p):
        p %= 1.0
        if p < beta:                                             # stance: lands on the ball, flat, heel rises at push-off
            s_ = p / beta; y = -D * beta / 2 + D * p
            heel = 6 * max(0, 1 - s_ / 0.12) + 30 * max(0, (s_ - 0.62) / 0.38) ** 1.5
            return y, heel, 0.0, 0.0
        s_ = (p - beta) / (1 - beta); e = 0.5 - 0.5 * np.cos(np.pi * s_)
        y = D * beta / 2 - D * beta * e
        heel = 30 * (1 - s_) ** 2 + 8 * np.sin(np.pi * s_) ** 2 + 6 * s_ ** 3        # toe stays pointed through the swing
        return y, heel, W_["lift"] * np.sin(np.pi * s_) ** 1.4, np.sin(np.pi * s_)
    feet = {}
    for s, off in (("L", 0.0), ("R", 0.5)):
        y, heel, lz, sw = fstep(ph + off); sg = SG[s]
        ax = sg * (W_["width"] + W_["arc"] * sw) - ANK0[s][0]
        feet[s] = foot(s, ax, y + 0.02, sg * W_["toe_out"], heel, lz)
        feet[s]["flat"] = False                                  # in-place walk: feet slide under the root by design
    pl = ph + W_["lead"]                                         # the pelvis moves first
    c2 = np.cos(4 * np.pi * (ph - 0.06)); s1 = np.sin(2 * np.pi * pl); c1 = np.cos(2 * np.pi * pl)
    yaw, roll = W_["yaw"], W_["roll"]
    ch = dict(pz=-0.016 - W_["bob"] * c2, px=W_["sway"] * s1, pry=-roll * s1, prz=-yaw * c1, prx=-2,
              sz=0.45 * yaw * c1, cz=0.70 * yaw * c1, sy=0.55 * roll * s1, cy=0.60 * roll * s1,
              hz=-0.12 * yaw * c1, hy=-0.10 * roll * s1, cx=-4 + 0.8 * c2, hx=-0.6 * c2,
              clL_up=1.2 * c1 + 2.0, clR_up=-1.2 * c1 + 2.0)

    def arms(Q, H):
        out = {}; ic = BI["Chest"]
        for s, off in (("L", 0.5), ("R", 0.0)):                  # arm forward with the opposite leg, a beat late
            sg = SG[s]; a = np.cos(2 * np.pi * (ph + off - 0.06))
            fwd = W_["swing"] * (0.9 * a + 0.1) if a > 0 else W_["swing"] * 0.7 * a
            p = np.array([sg * (0.300 - 0.012 * a), -0.035 - fwd, 0.905 + 0.03 * a * a])
            t = H[ic] + Q[ic] @ (p - HrW[ic])
            flop = 10 * np.sin(2 * np.pi * (ph + off - 0.16))    # the flared hand trails the swing
            fd = Q[ic] @ (T.axang([sg * 1.0, 0, 0], flop) @ nrm(np.array([sg * 0.85, -0.25, -0.40])))
            pd = Q[ic] @ np.array([0, 0.1, -1.0])
            out[s] = dict(t=t, pole=Q[ic] @ nrm(np.array([sg * 0.55, 0.8, 0.1])), fd=fd, pd=nrm(pd - (pd @ fd) * fd))
        return out
    return ch, feet, arms
faces("flirt_walk", [(1, "open", "softSmile"), (13, "sideEyeL", "smirk"), (25, "open", "softSmile")])


@clip("flirt_head_tilt", 75, False, "C-10 head tilt with a cat smile: head rolls toward her right shoulder (small overshoot) and dips, chest "
      "turns a little to him, hands loosely together in front of her hips; hold with a slow sway, comes back")
def head_tilt(f):
    w = float(seg(f, [(0, 0), (4, 0), (14, 1.0), (62, 1.0), (74, 0)], ease=lambda t: back(t, 1.0) if t < 1 else 1.0))
    osc = 1.5 * np.sin(2 * np.pi * (f - 14) / 43) if 14 <= f <= 62 else 0.0
    ch = dict(hy=(-16 - osc) * w, hx=6 * w, ny=-6 * w, cz=5 * w, clR_up=2 * w, pry=1.5 * w, px=-0.008 * w)
    add(ch, breathe(f, 75, 0.7))
    feet = dict(L=foot("L", 0.0, -0.01, 4), R=foot("R", 0.0, 0.01, -4))
    def arms(Q, H):
        b = ss(f / 12) * ss((74 - f) / 10) if f > 60 else ss(f / 12)
        return dict(L=arm_mix(arm_rest("L", Q, H), arm_front("L", Q, H), b), R=arm_mix(arm_rest("R", Q, H), arm_front("R", Q, H), b))
    return ch, feet, arms
faces("flirt_head_tilt", [(1, "open", "softSmile"), (8, "smug", "cat"), (28, "adoring", "sweetSmile"), (40, "blink", "sweetSmile"),
                          (43, "adoring", "sweetSmile"), (52, "smug", "cat"), (66, "open", "smile")])


@clip("flirt_wink", 40, False, "C-12 wink: head tilts and turns a touch to him, near shoulder lifts with a little hip pop, a quick "
      "wink with a sideways smirk, back to neutral")
def wink(f):
    w = float(seg(f, [(0, 0), (2, 0), (12, 1.0), (24, 1.0), (38, 0)]))
    ch = dict(hy=-10 * w, hz=5 * w, clR_up=6 * w, ny=-3 * w, cz=3 * w, pry=2.5 * w, px=0.01 * w)
    feet = dict(L=foot("L"), R=foot("R"))
    def arms(Q, H):
        sg = SG["R"]
        chin = dict(t=head_pt(Q, H, HrW[BI["Head"]] + np.array([-0.055, -0.15, -0.035])), pole=Q[BI["Chest"]] @ nrm(np.array([-0.6, 0.5, -0.6])),
                    fd=Q[BI["Head"]] @ nrm(np.array([0.3, -0.3, 0.9])), pd=Q[BI["Head"]] @ nrm(np.array([0.3, 0.9, 0.0])))
        return dict(L=arm_rest("L", Q, H), R=arm_rest("R", Q, H, fwd=0.015 * w))
    return ch, feet, arms
faces("flirt_wink", [(1, "open", "smile"), (9, "open", "smirk"), (11, "winkR", "smirk"), (19, "open", "smirk"), (30, "open", "smile")])


# ------------------------------------------------------------------ build through the shared back end
def spring(x, hz, zeta, loop):
    x = np.asarray(x, float); n = len(x); w = 2 * np.pi * hz; dt = 1.0 / FPS
    seq = np.concatenate([x[:-1]] * 3 + [x]) if loop else x
    y = seq[0].copy(); v = np.zeros_like(y); out = []
    for s_ in seq:
        for _ in range(4):
            a = w * w * (s_ - y) - 2 * zeta * w * v; v = v + a * dt / 4; y = y + v * dt / 4
        out.append(y.copy())
    return np.array(out)[-n:]


def run(name):
    C = CLIPS[name]; n = C["n"] + 1 if not C["loop"] else C["n"] + 1; loop = C["loop"]
    T.CUR["clip"] = name
    frames = []
    for f in range(n):
        ch, feet, arms = C["fn"](f)
        Q, Hp = body(ch)
        LT = {s: dict(feet[s]) for s in "LR"}
        frames.append((Q, Hp, LT, arms))
    # bust springs (lag of the bust apex behind the chest)
    ic = BI["Chest"]
    for s in "LR":
        ib = BI[f"Bust.{s}"]; ap = T.TrW[ib]; L = np.linalg.norm(ap - HrW[ib]); u = nrm(ap - HrW[ib])
        apw = []
        for Q, Hp, LT, arms in frames:
            H = T.fk(Q, Hp); apw.append(H[ic] + Q[ic] @ (ap - HrW[ic]))
        sp = spring(apw, 3.2, 0.25, loop)
        for i, (Q, Hp, LT, arms) in enumerate(frames):
            d = Q[ic].T @ (sp[i] - apw[i]) * 0.35; dp = d - (d @ u) * u; ang = np.degrees(np.linalg.norm(dp) / L)
            Q[ib] = Q[ic] @ T.axang(np.cross(u, dp), min(ang, 3.5))
    rec, base, loc = [], [], []
    for Q, Hp, LT, arms in frames:
        Q = T.solve_legs(Q, Hp, LT); H = T.fk(Q, Hp)
        AT = arms(Q, H); AT = {s: dict(AT[s]) for s in "LR"}
        Ha = np.zeros((T.NBA, 3))
        for s in "LR": Ha[T.BA[f"Foot.{s}"]] = LT[s]["t"]
        rec.append(dict(LT=LT, za_foot={s: 0.0 if LT[s]["flat"] else 0.05 for s in "LR"}, za_body=1.0, Ha=Ha))
        base.append((Q, Hp, H)); loc.append(T.to_local(Q[ic], H[ic], AT))
    for s in "LR":
        for key, sig in (("t", 0.8), ("pole", 1.0), ("fd", 0.8), ("pd", 0.8)):
            sm = T.gsmooth([L_[s][key] for L_ in loc], loop, sig)
            for L_, v in zip(loc, sm): L_[s][key] = v
    return T.backend(name, loop, rec, base, loc)


def main():
    only = sys.argv[1].split(",") if len(sys.argv) > 1 else list(CLIPS)
    npz = os.path.join(ROOT, "ref", "anim_w.npz"); data = dict(np.load(npz, allow_pickle=True)); data.pop("clips", None)
    acts = json.load(open(os.path.join(ROOT, "out", "actions.json"))); ft = json.load(open(os.path.join(ROOT, "out", "face_tracks.json")))
    meta = json.load(open(os.path.join(ROOT, "ref", "face_meta.json"))); ft["_meta"] = meta
    lines = []
    for name in only:
        res, rep = run(name); C = CLIPS[name]
        data["q_" + name] = np.array([r[0] for r in res]); data["l_" + name] = np.array([r[1] for r in res])
        a = dict(frames=C["n"], fps=30, seconds=round(C["n"] / 30, 3), loop=C["loop"], note="waitress flirty (@missmedannypsx ref): " + C["note"])
        if C["speed"]: a["speed_m_per_s"] = C["speed"]; a["speed_units_per_s"] = round(C["speed"] * T.RG.S_ENGINE, 3)
        acts[name] = a
        for k in C["faces"]: assert k[1] in meta["face_eyes"] and k[2] in meta["face_mouth"], k
        ft[name] = C["faces"]
        ln = (f"{name:20s} frames {len(res):3d}  arm-body penetration {rep['pen'][0] * 1000:5.1f} mm ({rep['pen'][1]})  "
              f"leg-leg {rep.get('leg', 0) * 1000:5.1f} mm  min z {rep['floor'] * 1000:6.1f} mm  planted-foot slide {rep['slide'] * 1000:4.1f} mm/f")
        print(ln, flush=True); lines.append(ln)
    names = sorted(k[2:] for k in data if k.startswith("q_"))
    np.savez(npz, clips=json.dumps(names), **data)
    json.dump(acts, open(os.path.join(ROOT, "out", "actions.json"), "w"), indent=1)
    json.dump(ft, open(os.path.join(ROOT, "out", "face_tracks.json"), "w"), indent=1)
    open(os.path.join(ROOT, "ref", "flirty_checks.txt"), "w").write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()

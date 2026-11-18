"""Suitor clip definitions (masculine set). Edit here, re-run tools/anim/author.py [clip,...].
Pose channels (partial dicts over author.STAND, char frame: x = his left, f = forward, z = up, metres / degrees):
  root (x, f, z) pelvis offset | pel / spine / chest / neck / head (pitch fwd+, yaw his-left+, roll his-left+)
  clavL / clavR (raise, forward) | armL / armR: ("aim", abduct, flex fwd, elbow bend) | ("lm", landmark, (out, fwd, up)) |
  ("t", (out, fwd, up) from the shoulder in the chest frame) | poleL / poleR elbow hint (out, fwd, up) |
  handL / handR (twist palm-fwd+, flex palm-ward+, deviation thumb-ward+) | footL / footR (out, fwd, up, yaw out, pitch toe-up) |
  kneeL / kneeR knee pole outward bias.  Right-side values are mirrored (out = away from the body on both sides).
Landmarks: hip, pocket, back, nape, face, chin, chest, elbow_rest, belly, knee (author.LM)."""
import math
import numpy as np
from author import STAND, sinw, add, FPS, RS

D = lambda **k: k


def breathe(amp=1.0, cyc=1):
    def f(pv, i, n):
        s = sinw(i, n, cyc)
        add(pv, "chest", (-0.8 * amp * s, 0, 0)); add(pv, "clavL", (0.7 * amp * s, 0)); add(pv, "clavR", (0.7 * amp * s, 0))
        add(pv, "head", (0.5 * amp * s, 0, 0))
    return f


def sway(amp=0.010, cyc=1, phase=0.0):
    """weight shift side to side (pelvis moves over one foot, chest counter-rolls), feet stay planted"""
    def f(pv, i, n):
        s = sinw(i, n, cyc, phase)
        add(pv, "root", (amp * s, 0, -0.004 * abs(s))); add(pv, "pel", (0, 0, -2.2 * s)); add(pv, "chest", (0, 0, 2.0 * s))
        add(pv, "head", (0, 0, 0.6 * s))
    return f


def nod_ov(t0, t1, amp=9, count=2):
    def f(pv, i, n):
        if t0 <= i <= t1:
            u = (i - t0) / max(t1 - t0, 1); add(pv, "head", (amp * math.sin(math.pi * count * u) ** 2 * (1 - 0.3 * u), 0, 0))
    return f


# ------------------------------------------------------------------ shared poses
HANG = dict(armL=("aim", 11, 4, 10), armR=("aim", 11, 4, 10))
POCKETS = dict(armL=("lm", "pocket", (0, 0, 0)), armR=("lm", "pocket", (0, 0, 0)), poleL=(1.3, -0.8, 0), poleR=(1.3, -0.8, 0),
               handL=(-35, 10, 8), handR=(-35, 10, 8), clavL=(2, -3), clavR=(2, -3))
POCKET_ALLOW = {"hand_in": ["hips", "thigh", "leg"], "cuff_in": True}
BEHIND = dict(armL=("lm", "back", (0.01, 0, 0)), armR=("lm", "back", (0.01, 0, 0)), poleL=(0.8, -0.3, 0), poleR=(0.8, -0.3, 0),
              handL=(-30, 20, 0), handR=(-30, 20, 0), clavL=(0, -6), clavR=(0, -6))
CROSSED = dict(armL=("t", (-0.27, 0.16, -0.27)), armR=("t", (-0.28, 0.27, -0.06)),     # his left forearm low / close, right one high / in front
               poleL=(0.6, 0.3, -1.0), poleR=(0.6, 0.5, -0.6), handL=(0, 5, 0), handR=(0, 5, 0), clavL=(2, 6), clavR=(3, 8))
OPEN_PALMS = lambda up=0.0: dict(armL=("t", (0.20, 0.30, -0.22 + up)), armR=("t", (0.20, 0.30, -0.22 + up)), poleL=(1, -0.5, -0.4), poleR=(1, -0.5, -0.4),
                                  handL=(80, -10, 0), handR=(80, -10, 0))

CLIPS = {}


def clip(name, frames, keys, loop=False, face=None, overlay=(), **kw):
    CLIPS[name] = dict(frames=frames, keys=keys, loop=loop, face=face or [[1, "open", "neutral"]], overlay=list(overlay), **kw)


# ------------------------------------------------------------------ idles
clip("idle", 120, [(0, D()), (60, D(root=(0.004, 0, -0.012), head=(1, 2, 0))), ], loop=True,
     overlay=[breathe(1, 2), sway(0.006, 1)], face=[[1, "open", "neutral"], [70, "blink", "neutral"], [74, "open", "neutral"]])
clip("idle_shift", 150, [(0, D()), (75, D(footR=(0.03, 0.03, 0, 14, 0), kneeR=0.3))], loop=True,
     overlay=[breathe(1, 2), sway(0.022, 1, 0.25)], face=[[1, "open", "neutral"], [40, "blink", "neutral"], [44, "open", "neutral"]],
     note="weight shifts from foot to foot, relaxed arms")
clip("idle_pockets", 120, [(0, D(**POCKETS)), (60, D(**POCKETS, head=(2, -4, 0)))], loop=True, overlay=[breathe(1, 2), sway(0.008, 1)],
     face=[[1, "open", "smile"], [80, "blink", "smile"], [84, "open", "smile"]], allow=POCKET_ALLOW,
     note="hands in the front pockets: fists tuck into the painted pocket openings on the hip piece")
clip("idle_hands_behind", 120, [(0, D(**BEHIND, chest=(-3, 0, 0), head=(-2, 0, 0))), (60, D(**BEHIND, chest=(-3, 0, 0), head=(0, 5, 0)))], loop=True,
     overlay=[breathe(1, 2), sway(0.006, 1)], face=[[1, "open", "softSmile"]], allow={"arm_arm": 40}, note="polite: hands clasped behind the back (gloves overlap = one hand holds the other)")


def lambda_flap(n, eyes="open", mouths=("talkA", "smileOpen"), step=5, start=1, blink=None):
    """lipflap face track: mouth sprites alternate every `step` frames (6 Hz at 5), optional blink frame"""
    out = []
    for k, f in enumerate(range(start, n + 1, step)):
        e = eyes
        if blink and abs(f - blink) < step: e = "blink"
        out.append([f, e, mouths[k % len(mouths)]])
    return out


def osc(key, i0, i1, vec, cycles=2, env=True):
    """sinusoidal offset on a channel between frames i0..i1 (raised-sine envelope)"""
    def f(pv, i, n):
        if i0 <= i <= i1:
            u = (i - i0) / max(i1 - i0, 1); e = math.sin(math.pi * u) if env else 1.0
            add(pv, key, np.array(vec) * math.sin(2 * math.pi * cycles * u) * e)
    return f


def arm_osc(side, i0, i1, vec, cycles=2):
    """oscillate an arm target (char-frame offset, rotated by the chest), side 'L' / 'R'"""
    from author import B, BI
    def f(T, s, i, n, Q, H):
        if s != side or not (i0 <= i <= i1): return T
        u = (i - i0) / max(i1 - i0, 1); e = math.sin(math.pi * u) ** 0.5
        sg = 1 if s == "L" else -1; v = np.array(vec) * math.sin(2 * math.pi * cycles * u) * e
        return T + Q[BI["Chest"]] @ B(sg * v[0], v[1], v[2])
    return f


# ------------------------------------------------------------------ talking (reference: hands at chest height, palms open)
TALK_R = dict(armR=("t", (-0.02, 0.27, -0.24)), poleR=(1.0, -0.6, -0.5), handR=(70, -5, 0))
clip("talk_explain", 60, [
    (0, D(**TALK_R, head=(0, -3, 0))),
    (15, D(armR=("t", (0.04, 0.31, -0.19)), poleR=(1.0, -0.6, -0.5), handR=(85, -12, 0), head=(-2, -5, 1), chest=(0, -3, 0))),
    (30, D(armR=("t", (-0.05, 0.26, -0.26)), poleR=(1.0, -0.6, -0.5), handR=(60, 0, 0), head=(2, 2, 0))),
    (45, D(armR=("t", (0.06, 0.30, -0.21)), poleR=(1.0, -0.6, -0.5), handR=(90, -10, 0), head=(0, -4, -1), chest=(0, -2, 0))),
], loop=True, overlay=[breathe(0.7, 2)], face=lambda_flap(60, "open", ("talkA", "smileOpen", "talkO", "smileOpen"), 5, blink=26),
   note="TLK-04 explaining with an open palm up (right hand)")
clip("talk_both", 60, [
    (0, D(**OPEN_PALMS(0.0))),
    (15, D(armL=("t", (0.14, 0.30, -0.18)), armR=("t", (0.14, 0.30, -0.18)), poleL=(1, -0.5, -0.4), poleR=(1, -0.5, -0.4),
           handL=(85, -15, 0), handR=(85, -15, 0), head=(-3, 2, 0), chest=(-2, 0, 0))),
    (30, D(**OPEN_PALMS(-0.03), head=(1, -2, 0))),
    (45, D(armL=("t", (0.24, 0.26, -0.20)), armR=("t", (0.24, 0.26, -0.20)), poleL=(1, -0.5, -0.4), poleR=(1, -0.5, -0.4),
           handL=(80, -5, 0), handR=(80, -5, 0), head=(-2, 1, 0))),
], loop=True, overlay=[breathe(0.7, 2)], face=lambda_flap(60, "open", ("talkA", "smileOpen"), 5, blink=41),
   note="TLK-01 / TLK-08 talking with both hands open")
NERV = lambda a, b, c, d, hd: D(armL=("t", a), armR=("t", b), poleL=(1, -0.4, -0.6), poleR=(1, -0.4, -0.6), handL=c, handR=d,
                                clavL=(4, 4), clavR=(4, 4), head=hd, chest=(4, 0, 0))
clip("talk_nervous", 60, [
    (0, NERV((-0.06, 0.20, -0.30), (-0.06, 0.21, -0.29), (20, 20, 0), (25, 20, 0), (8, 4, 3))),
    (15, NERV((-0.08, 0.22, -0.27), (-0.05, 0.23, -0.31), (25, 25, 0), (15, 15, 0), (4, -3, 2))),
    (30, NERV((-0.06, 0.20, -0.30), (-0.07, 0.20, -0.28), (20, 20, 0), (30, 22, 0), (9, 6, 4))),
    (45, NERV((-0.05, 0.22, -0.31), (-0.08, 0.21, -0.27), (15, 15, 0), (25, 25, 0), (5, 1, 2))),
], loop=True, overlay=[breathe(1.0, 3)], face=[[1, "shy+blush", "talkSmall+blush"], [10, "gazeDown+blush", "talkClosed+blush"], [20, "shy+blush", "talkA+blush"],
                                             [30, "glance+blush", "smirkL+blush"], [40, "gazeDown+blush", "talkSmall+blush"], [50, "shy+blush", "talkO+blush"]],
     allow={"arm_arm": 14}, note="NRV-04 stammering, fidgeting hands in front of the belly (balbuceo nervioso)")

# ------------------------------------------------------------------ head gestures
clip("nod", 30, [(0, D()), (29, D())], overlay=[nod_ov(2, 27, 10, 2), breathe(0.6)], face=[[1, "open", "smile"], [8, "half", "smileOpen"], [20, "open", "smile"]],
     note="REA-12 quick approving nod")
clip("head_shake", 36, [(0, D()), (35, D())], overlay=[osc("head", 3, 33, (0, 13, 0), 2.5), osc("neck", 3, 33, (0, 5, 0), 2.5), breathe(0.6)],
     face=[[1, "open", "frown"], [10, "half", "frown"], [26, "open", "frown"]])
SHR = dict(OPEN_PALMS(0.03), armL=("t", (0.20, 0.20, -0.25)), armR=("t", (0.20, 0.20, -0.25)), clavL=(12, 2), clavR=(12, 2), head=(0, 0, 8), neck=(0, 0, 3))
clip("shrug", 40, [(0, D()), (12, D(**SHR)), (26, D(**SHR)), (39, D())], face=[[1, "open", "neutral"], [8, "half", "frown"], [32, "open", "neutral"]])

# ------------------------------------------------------------------ arms
clip("arms_crossed", 50, [(0, D()), (13, D(armL=("t", (-0.12, 0.24, -0.30)), armR=("t", (-0.10, 0.30, -0.16)), poleL=(0.6, 0.3, -1.0), poleR=(0.6, 0.4, -0.8))),
                          (26, D(**CROSSED, chest=(-2, 0, 0), head=(-3, 0, 0))), (49, D(**CROSSED, chest=(-2, 0, 0), head=(-3, 0, 0)))],
     face=[[1, "open", "neutral"], [20, "half", "smirk"]])
clip("arms_crossed_idle", 120, [(0, D(**CROSSED, chest=(-2, 0, 0), head=(-3, 0, 0))), (60, D(**CROSSED, chest=(-2, 2, 0), head=(-2, -5, 0)))],
     loop=True, overlay=[breathe(1, 2), sway(0.008, 1)], face=[[1, "half", "smirk"], [60, "blink", "smirk"], [64, "half", "smirk"]])
PT = dict(armR=("aim", 18, 80, 6), poleR=(0.6, -0.2, -1.0), handR=(10, -5, 0), chest=(0, -10, 0), head=(0, -12, 0), clavR=(2, 6))
clip("point", 40, [(0, D()), (10, D(**PT)), (30, D(**PT)), (39, D())], face=[[1, "open", "neutral"], [8, "open", "talkA"], [20, "open", "smile"]])
WV = dict(armR=("t", (0.28, 0.06, 0.12)), poleR=(0.2, -0.6, -0.8), handR=(90, 0, 0), clavR=(6, 0), head=(0, 0, -4))
clip("wave", 48, [(0, D()), (10, D(**WV)), (38, D(**WV)), (47, D())], arm_overlay=[arm_osc("R", 10, 38, (0.07, 0.0, 0.0), 3)],
     face=[[1, "open", "smile"], [8, "happy", "smileOpen"], [40, "open", "smile"]])
UP2 = lambda z, hd, ch, rz: D(armL=("t", (0.18, 0.05, z)), armR=("t", (0.18, 0.05, z)), poleL=(0.3, -0.8, -0.4), poleR=(0.3, -0.8, -0.4), root=(0, 0, rz),
                              handL=(80, 40, 0), handR=(80, 40, 0), head=(hd, 0, 0), chest=(ch, 0, 0))
clip("cheer", 44, [(0, D()),
                   (8, D(armL=("t", (0.10, 0.12, -0.15)), armR=("t", (0.10, 0.12, -0.15)), poleL=(0.3, -0.6, -1), poleR=(0.3, -0.6, -1), root=(0, 0, -0.05),
                         handL=(60, 40, 0), handR=(60, 40, 0))),
                   (17, UP2(0.42, -12, -6, 0.0)), (27, UP2(0.38, -10, -5, -0.01)), (43, D())],
     face=[[1, "open", "neutral"], [8, "happy", "shout"], [30, "happy", "laugh"]])
EUP = dict(armL=("aim", 70, 15, 15), armR=("aim", 70, 15, 15), poleL=(0.1, -0.5, -1), poleR=(0.1, -0.5, -1), handL=(90, 0, 0), handR=(90, 0, 0),
           head=(-8, 0, 0), chest=(-6, 0, 0), clavL=(6, 0), clavR=(6, 0))
clip("euphoria", 48, [(0, D()), (10, D(**EUP)), (40, D(**EUP)), (47, D())], overlay=[osc("root", 10, 40, (0, 0, 0.012), 3)],
     face=[[1, "open", "neutral"], [8, "surprised", "smileOpen"], [40, "happy", "laugh"]], note="REA-10 arms spread wide with joy")
PROT = lambda hy: D(armL=("t", (0.10, 0.22, -0.02)), armR=("t", (0.10, 0.22, -0.02)), poleL=(1, -0.3, -1), poleR=(1, -0.3, -1),
                    handL=(0, -60, 0), handR=(0, -60, 0), chest=(-4, 0, 0), head=(-4, hy, 0), root=(0, -0.02, -0.012))
clip("hands_up_protest", 40, [(0, D()), (10, PROT(0)), (30, PROT(6)), (39, D())],
     face=[[1, "open", "neutral"], [6, "surprised", "talkWide"], [24, "angry", "shout"], [36, "open", "frown"]], note="palms out, 'wait, wait' / protest")

# ------------------------------------------------------------------ emotions
LAUGH = lambda hd, ch: D(armL=("lm", "belly", (0.02, 0.03, 0.0)), poleL=(1, -0.3, -0.5), handL=(-20, 10, 0), head=hd, chest=ch)
clip("laugh", 36, [(0, LAUGH((-10, 0, 0), (-4, 0, 0))), (18, LAUGH((-6, 0, 2), (2, 0, 0)))],
     loop=True, overlay=[osc("root", 0, 36, (0, 0, -0.008), 3, False), osc("clavR", 0, 36, (4, 0), 3, False), osc("chest", 0, 36, (3, 0, 0), 3, False)],
     face=[[1, "happy+blush", "laugh+blush"], [18, "happy+blush", "grin+blush"]], note="REA-06 laugh")
SUR = lambda rf, ch, z, hf, cl: D(root=(0, rf, -0.015), chest=(ch, 0, 0), head=(ch, 0, 0), armL=("t", (0.05, 0.22, z)), armR=("t", (0.05, 0.22, z)),
                                  poleL=(1, -0.3, -1), poleR=(1, -0.3, -1), handL=(40, hf, 0), handR=(40, hf, 0), clavL=(cl, 0), clavR=(cl, 0),
                                  )
clip("surprised", 36, [(0, D()), (6, SUR(-0.04, -8, -0.18, -40, 10)), (20, SUR(-0.03, -5, -0.22, -30, 6)), (35, D(root=(0, -0.015, -0.012)))],
     face=[[1, "open", "neutral"], [4, "shocked", "bigShock"], [20, "surprised", "gasp"]], note="REA-01 / REA-03 surprised jump back, hands up")
SCR = dict(armR=("lm", "nape", (0, 0, 0)), poleR=(1.0, 0.3, 0.0), handR=(-60, 20, 0), head=(6, 0, -10), clavR=(6, 0), chest=(0, 0, -3))
SCR_MID = dict(armR=("t", (0.02, 0.26, -0.12)), poleR=(0.7, -0.5, -0.5), handR=(-20, 10, 0), head=(3, 0, -4))
clip("scratch_head", 76, [(0, D()), (9, D(**SCR_MID)), (20, D(**SCR)), (52, D(**SCR)), (64, D(**SCR_MID)), (75, D())], arm_overlay=[arm_osc("R", 20, 52, (0.0, 0.0, 0.025), 4)],
     face=[[1, "open", "neutral"], [10, "happy+blush", "blushSmile+blush"], [50, "shy+blush", "softSmile+blush"]], allow={"tremble": True}, clav_auto=False, note="NRV-01 sheepish laugh, rubbing the back of the head (the character's signature tic)")
clip("idle_shy", 120, [(0, D(**BEHIND, head=(14, 8, 4), neck=(6, 0, 0), chest=(4, 0, 0))),
                       (60, D(**BEHIND, head=(12, 3, 5), neck=(6, 0, 0), chest=(4, 0, 0), footR=(0.03, 0.04, 0.0, 20, -8)))], loop=True,
     overlay=[breathe(1, 2)], face=[[1, "gazeDown+blush", "softSmile+blush"], [50, "shy+blush", "softSmile+blush"], [90, "gazeDown+blush", "smirkL+blush"]],
     allow={"arm_arm": 40}, note="shy: looking down, hands behind, scuffs the right toe")
FP = lambda hd: D(armR=("lm", "face", (0, 0, 0)), poleR=(0.4, 0.2, -1), handR=(-80, 10, 0), head=hd, chest=(6, 0, 0))
clip("facepalm", 48, [(0, D()), (12, FP((14, 0, 0))), (36, FP((16, 3, 0))), (47, D())], overlay=[osc("head", 14, 36, (0, 5, 0), 1.5)],
     face=[[1, "open", "neutral"], [10, "blink", "frown"], [40, "half", "frown"]])
TH = lambda hd: D(armR=("lm", "chin", (0, 0, 0)), poleR=(0.3, 0.2, -1), handR=(-30, 65, 0),
                  armL=("t", (-0.21, 0.17, -0.25)), poleL=(0.6, 0.3, -1.0), handL=(0, 5, 0), head=hd)
TH_MID = D(armL=("t", (-0.12, 0.24, -0.30)), poleL=(0.6, 0.3, -1.0), armR=("t", (-0.02, 0.28, -0.18)), poleR=(0.6, -0.3, -1))
clip("think", 64, allow={"arm_arm": 16}, keys= [(0, D()), (9, TH_MID), (18, TH((4, 0, 6))), (48, TH((2, 5, 8))), (56, TH_MID), (63, D())], face=[[1, "open", "neutral"], [12, "gazeUp", "pout"], [40, "half", "neutral"]])

# ------------------------------------------------------------------ props / interaction (object in Hand.R or between the hands)
HOLD = dict(armL=("t", (-0.03, 0.31, -0.25)), armR=("t", (-0.03, 0.31, -0.25)), poleL=(0.3, -0.6, -1), poleR=(0.3, -0.6, -1), handL=(0, -5, 0), handR=(0, -5, 0))
clip("hold_object", 90, [(0, D(**HOLD)), (45, D(**HOLD, head=(3, 3, 0)))], loop=True, overlay=[breathe(1, 3)],
     face=[[1, "open", "smile"], [60, "blink", "smile"], [64, "open", "smile"]], props="object (box / bouquet / candles) between both hands at chest height")
OFFER = dict(armL=("t", (-0.04, 0.42, -0.17)), armR=("t", (-0.04, 0.42, -0.17)), poleL=(0.3, -0.6, -1), poleR=(0.3, -0.6, -1),
             handL=(20, -5, 0), handR=(20, -5, 0), chest=(10, 0, 0), spine=(4, 0, 0), head=(-4, 0, 0))
clip("offer", 60, [(0, D(**HOLD)), (18, D(**OFFER)), (59, D(**OFFER))],
     face=[[1, "open", "smile"], [14, "shy+blush", "blushSmile+blush"], [40, "happy+blush", "softSmile+blush"]], props="flowers / gift between the hands, offered with a little bow")
PHONE = dict(armL=("t", (-0.10, 0.27, -0.25)), poleL=(0.3, -0.6, -1), handL=(70, -30, 0), head=(18, 0, 0), neck=(6, 0, 0))
clip("phone_look", 60, [(0, D(**PHONE)), (30, D(**dict(PHONE, head=(20, 3, 0))))], loop=True, overlay=[breathe(0.8, 2)],
     face=[[1, "gazeDown", "neutral"], [40, "blink", "neutral"], [43, "gazeDown", "neutral"]], props="phone in Hand.L")
TYPE = dict(PHONE, armR=("t", (-0.16, 0.27, -0.17)), poleR=(0.3, -0.6, -1), handR=(40, -40, 0))
clip("phone_type", 40, [(0, D(**TYPE)), (20, D(**TYPE))], loop=True, arm_overlay=[arm_osc("R", 0, 39, (0.0, 0.0, 0.012), 6)],
     face=[[1, "gazeDown", "talkClosed"], [20, "gazeDown", "talkSmall"]], props="phone in Hand.L, right thumb taps", allow={"arm_arm": 15})
SIG_MID = dict(armR=("aim", 20, 80, 30), poleR=(1, -0.3, -0.5), handR=(60, 0, 0), head=(-6, 0, 0))
SIG = dict(armR=("t", (0.15, 0.08, 0.44)), poleR=(1, -0.2, -0.3), handR=(80, 0, 0), head=(-20, 0, 0), chest=(-4, 0, -5), clavR=(10, 0), root=(0.01, 0, -0.012))
clip("phone_signal", 70, [(0, D()), (10, D(**SIG_MID)), (20, D(**SIG)), (50, D(**SIG)), (60, D(**SIG_MID)), (69, D())], arm_overlay=[arm_osc("R", 20, 50, (0.05, 0.03, 0), 1.5)],
     face=[[1, "open", "neutral"], [12, "lookUp", "pout"], [40, "gazeUp", "talkClosed"]], props="phone held up high in Hand.R (searching for signal)")
LEAN = dict(armL=("t", (0.30, 0.04, 0.02)), poleL=(0.3, -0.6, -1), handL=(90, -70, 0), root=(0.02, 0, -0.016), pel=(0, -6, -3), chest=(0, -18, 5),
            head=(0, -12, 3), footR=(0.0, 0.05, 0.0, 12, 0), kneeR=0.3)
clip("lean_door", 120, [(0, D(**LEAN)), (60, D(**dict(LEAN, head=(2, 2, -2))))], loop=True, overlay=[breathe(1, 2)],
     face=[[1, "half", "smirk"], [70, "blink", "smirk"], [74, "half", "smirk"]], props="left palm flat on a door frame / wall ~0.45 m to his left at shoulder height", note="IDL-05 leaning on the door frame, turned toward her")


# ------------------------------------------------------------------ locomotion (in place; the engine moves him at speed_m_per_s)
def walk_fn(stride=0.22, n=32, lift=0.055, arm=16, carry=None):
    """stance foot slides back at the walk speed (planted on the ground once the root motion is applied), swing foot arcs"""
    dur = n / FPS; v = 2 * stride * 2 / dur / 2                       # one step = stride*2 travel... v = (2 steps * step length) / cycle
    step = 2 * stride; v = 2 * step / dur * RS / RS
    ST = 0.6                                                          # stance fraction
    def foot(ph):
        if ph < ST:                                                   # stance: from +D/2 to -D/2
            u = ph / ST; D_ = v * ST * dur; f = D_ / 2 - D_ * u
            pit = 10 * max(0.0, 1 - u / 0.15) - 18 * max(0.0, (u - 0.75) / 0.25)
            return f, 0.0, pit
        u = (ph - ST) / (1 - ST); D_ = v * ST * dur
        e = 0.5 - 0.5 * math.cos(math.pi * u)
        f = -D_ / 2 + D_ * e; z = lift * math.sin(math.pi * u) ** 0.7
        pit = -18 * max(0.0, 1 - u / 0.3) + 12 * max(0.0, (u - 0.6) / 0.4)
        return f, z, pit
    def fn(i, n_):
        p = {}
        phL = (i / n) % 1; phR = (i / n + 0.5) % 1
        for s, ph in (("L", phL), ("R", phR)):
            f, z, pit = foot(ph); p["foot" + s] = (0.03, f, z, 6, pit); p["knee" + s] = 0.1
        c2 = math.cos(4 * math.pi * i / n); c1 = math.cos(2 * math.pi * i / n); s1 = math.sin(2 * math.pi * i / n)
        p["root"] = (0.012 * c1, 0.0, -0.030 - 0.012 * c2)               # bob: low at the contacts
        p["pel"] = (2, 5 * c1, -2.0 * c1)
        p["spine"] = (1, -2 * c1, 0); p["chest"] = (2, -4 * c1, 1.5 * c1); p["head"] = (0, 4 * c1, 0.5 * c1)
        if carry is None:
            p["armL"] = ("aim", 10, -arm * c1 + 3, 18 + 8 * max(0, -c1)); p["armR"] = ("aim", 10, arm * c1 + 3, 18 + 8 * max(0, c1))
            p["poleL"] = (0.1, -1, 0); p["poleR"] = (0.1, -1, 0)
        else:
            p.update(carry)
        return p
    return fn, v


_wf, _wv = walk_fn()
clip("walk", 32, [], loop=True, pose_fn=_wf, speed_m_per_s=round(_wv * RS, 4), face=[[1, "open", "neutral"]], note="in place; move the root at speed_m_per_s")
_wc, _wcv = walk_fn(stride=0.18, n=36, arm=0, carry=dict(HOLD))
clip("walk_carry", 36, [], loop=True, pose_fn=_wc, speed_m_per_s=round(_wcv * RS, 4), face=[[1, "open", "smile"]],
     props="box / bouquet between the hands (caminar con caja)", note="in place; move the root at speed_m_per_s")

# ------------------------------------------------------------------ sitting / kneeling
SEAT_H = 0.43
CHAIR = dict(root=(0, -0.31, -0.294), pel=(-4, 0, 0), spine=(2, 0, 0), chest=(1, 0, 0), head=(-1, 0, 0),
             footL=(0.022, 0.0, 0.0, 7, 0), footR=(0.022, 0.0, 0.0, 7, 0), kneeL=0.2, kneeR=0.2,
             armL=("lm", "knee", (0.012, -0.03, 0.085)), armR=("lm", "knee", (0.012, -0.03, 0.085)), poleL=(0.4, -1, 0), poleR=(0.4, -1, 0),
             handL=(-60, 25, 0), handR=(-60, 25, 0))
clip("sit_chair", 120, [(0, D(**CHAIR)), (60, D(**dict(CHAIR, head=(0, 5, 0))))], loop=True, overlay=[breathe(0.8, 2)],
     face=[[1, "open", "talkClosed+blush"], [80, "blink+blush", "talkClosed+blush"], [84, "open", "talkClosed+blush"]], cam=[24, -4.6],
     props=f"chair seat at {SEAT_H} m (engine scale), seat front edge ~0.05 m behind his toes; feet stay where he stood",
     note="SIT-01 sitting stiff: straight back, hands flat on the thighs")
clip("sit_down", 40, [(0, D()), (14, D(root=(0, -0.13, -0.10), spine=(14, 0, 0), chest=(4, 0, 0), armL=("lm", "knee", (0.04, -0.08, 0.13)), armR=("lm", "knee", (0.04, -0.08, 0.13)), poleL=(0.4, -1, 0), poleR=(0.4, -1, 0), handL=(-40, 15, 0), handR=(-40, 15, 0), footL=(0.022, 0.0, 0.0, 7, 0), footR=(0.022, 0.0, 0.0, 7, 0))),
                      (30, D(**dict(CHAIR, root=(0, -0.31, -0.30), spine=(8, 0, 0)))), (39, D(**CHAIR))],
     face=[[1, "open", "neutral"], [30, "open", "talkClosed+blush"]], cam=[24, -4.6], props=f"chair seat at {SEAT_H} m", note="SIT-02 stand -> sit (ends in sit_chair)")
clip("stand_up", 36, [(0, D(**CHAIR)), (6, D(**dict(CHAIR, chest=(-3, 0, 0)))), (20, D(root=(0, -0.13, -0.10), spine=(16, 0, 0), chest=(4, 0, 0),
                      footL=(0.022, 0.0, 0.0, 7, 0), footR=(0.022, 0.0, 0.0, 7, 0))), (35, D())],
     face=[[1, "open", "talkClosed+blush"], [20, "open", "neutral"]], cam=[24, -4.6], props=f"chair seat at {SEAT_H} m", note="SIT-02 sit -> stand (from sit_chair)")
TABLE = dict(CHAIR, chest=(9, 0, 0), spine=(4, 0, 0), armL=("t", (-0.05, 0.36, -0.30)), armR=("t", (-0.05, 0.36, -0.30)),
             poleL=(0.4, -0.6, -1), poleR=(0.4, -0.6, -1), handL=(0, 0, 0), handR=(0, 0, 0))
clip("sit_talk", 60, [(0, D(**TABLE)), (20, D(**dict(TABLE, head=(-3, 4, 4)))), (40, D(**dict(TABLE, head=(2, -3, -3))))], loop=True, overlay=[breathe(0.7, 2)],
     face=lambda_flap(60, "open", ("talkA", "talkSmall", "smileOpen", "talkClosed")), cam=[24, -4.6],
     props="table top at ~0.70 m in front of him, forearms resting on it", note="SIT-03 seated, leaning on the table, talking")
FLOOR = dict(root=(0, -0.10, -0.815), pel=(-14, 0, 0), spine=(-2, 0, 0), chest=(2, 0, 0), head=(4, 0, 0),
             footL=(0.12, 0.52, 0.0, 16, 0), footR=(0.05, 0.74, 0.0, 10, 10), kneeL=0.4, kneeR=0.10, kdownL=-0.6, kdownR=-0.3,
             armL=("w", (0.27, -0.33, 0.15)), armR=("w", (0.27, -0.33, 0.15)), poleL=(0.2, -1, 0.2), poleR=(0.2, -1, 0.2),
             handL=(-30, -60, 0), handR=(-30, -60, 0))
clip("sit_floor", 120, [(0, D(**FLOOR)), (60, D(**dict(FLOOR, head=(-2, 6, 0))))], loop=True, overlay=[breathe(1, 2)],
     face=[[1, "open", "softSmile"], [80, "blink", "softSmile"], [84, "open", "softSmile"]], cam=[24, -6.0], note="relaxed on the floor: legs out (left knee up), leaning back on both hands")
KNEEL = dict(OFFER)
KNEEL.update(root=(0, 0.09, -0.54), pel=(0, 0, 0), spine=(2, 0, 0), chest=(4, 0, 0), head=(-8, 0, 0),
             footL=(0.04, 0.41, 0.0, 4, 0), footR=(0.03, -0.48, 0.0, 4, -50), kneeL=0.15, kneeR=0.0, kdownR=0.3)
KH = lambda **k: D(**dict(HOLD, **k))
clip("kneel_propose", 96, [(0, D()),
                           (6, KH(footR=(0.022, 0.0, 0.05, 7, 5), root=(0, -0.01, -0.016))),
                           (16, KH(footR=(0.03, -0.40, 0.06, 5, -10), root=(0, -0.02, -0.03))),
                           (21, KH(footR=(0.03, -0.48, 0.012, 4, -18), root=(0, -0.01, -0.05))),
                           (24, KH(footR=(0.03, -0.48, 0.0, 4, -20), root=(0, 0.0, -0.06))),
                           (28, KH(footR=(0.03, -0.48, 0.0, 4, -26), footL=(0.022, 0.0, 0.045, 7, 5), root=(0, 0.01, -0.10), kdownR=0.08)),
                           (34, KH(footR=(0.03, -0.48, 0.0, 4, -35), footL=(0.03, 0.20, 0.06, 4, 8), root=(0, 0.03, -0.20), kdownR=0.15)),
                           (41, KH(footR=(0.03, -0.48, 0.0, 4, -42), footL=(0.04, 0.41, 0.012, 4, 2), root=(0, 0.06, -0.34), kdownR=0.22)),
                           (44, KH(footR=(0.03, -0.48, 0.0, 4, -45), footL=(0.04, 0.41, 0.0, 4, 0), root=(0, 0.07, -0.40), kdownR=0.25)),
                           (58, D(**dict(KNEEL, **HOLD))), (72, D(**KNEEL)), (95, D(**KNEEL))],
     face=[[1, "open", "smile"], [20, "shy+blush", "softSmile+blush"], [62, "sparkle+blush", "blushSmile+blush"]],
     props="ring box / flowers between the hands",
     note="steps the right foot back, goes down on the right knee, left foot forward, offers (pelvis ends ~0.08 m forward: no root move needed)")
clip("kneel_hold", 90, [(0, D(**KNEEL)), (45, D(**dict(KNEEL, head=(-10, 3, 0))))], loop=True, overlay=[breathe(1, 2)],
     face=[[1, "sparkle+blush", "blushSmile+blush"], [60, "blink+blush", "blushSmile+blush"], [64, "sparkle+blush", "blushSmile+blush"]],
     props="ring box / flowers between the hands")


# ================================================================== @missmedannypsx catalogue (fuentes/missmedannypsx/ANIMS_HOMBRE.md)
# every recurring entry; the catalogue id is in the note. Head angles +20 % as the catalogue recommends.
def tremor(key, amp, hz=7.0, i0=0, i1=10 ** 6):
    def f(pv, i, n):
        if i0 <= i <= i1: add(pv, key, np.array(amp) * math.sin(2 * math.pi * hz * i / FPS))
    return f


def head_track(points):
    """head yaw / roll path (frame, yaw, roll) as a smooth overlay (cosine between points, loops if the last frame = n)"""
    def f(pv, i, n):
        for (f0, y0, r0), (f1, y1, r1) in zip(points, points[1:]):
            if f0 <= i <= f1:
                u = 0.5 - 0.5 * math.cos(math.pi * (i - f0) / max(f1 - f0, 1)); add(pv, "head", (0, y0 + (y1 - y0) * u, r0 + (r1 - r0) * u)); return
    return f


# ---- idles
clip("idle_listen", 120, [(0, D(head=(0, 0, 6))), (60, D(head=(0, 0, 6)))], loop=True,
     overlay=[breathe(1, 2), sway(0.008, 1), head_track([(0, 0, 0), (25, 14, 0), (55, 14, 2), (80, -10, 0), (105, -10, -1), (120, 0, 0)]),
              nod_ov(40, 52, 5, 1), nod_ov(95, 107, 5, 1)],
     face=[[1, "open", "talkClosed"], [64, "blink", "talkClosed"], [68, "open", "talkClosed"]], note="IDL-02 listening: head follows her, small nods")
STIFF = dict(armL=("t", (-0.14, 0.20, -0.33)), armR=("t", (-0.13, 0.21, -0.32)), poleL=(0.4, -0.7, -0.6), poleR=(0.4, -0.7, -0.6),
             handL=(10, 15, 0), handR=(10, 15, 0), clavL=(9, 0), clavR=(9, 0), chest=(-2, 0, 0), head=(-2, 0, 0), root=(0, 0, -0.008))
clip("idle_stiff", 90, [(0, D(**STIFF)), (45, D(**STIFF))], loop=True, overlay=[breathe(0.35, 2), tremor("handL", (0, 1.5, 0), 6), tremor("handR", (0, -1.5, 0), 6)],
     face=[[1, "surprised", "talkClosed+blush"]], allow={"arm_arm": 14, "tremble": True}, note="IDL-04 stiff / scared: shoulders up, hands together, no sway")
clip("idle_shy_smile", 90, [(0, D(head=(6, 0, 3))), (45, D(head=(5, 2, -2)))], loop=True, overlay=[breathe(1.2, 2), sway(0.005, 1)],
     face=[[1, "soft+blush", "softSmile+blush"], [60, "blink+blush", "softSmile+blush"], [64, "soft+blush", "softSmile+blush"]],
     note="IDL-06 the character's signature: closed shy smile, head slightly down, blush")
clip("smile_content", 90, [(0, D(root=(0.02, 0, -0.014), pel=(0, 0, -3), chest=(0, 0, 2), head=(0, 0, 8), footR=(0.03, 0.03, 0, 14, 0), kneeR=0.35)),
                           (45, D(root=(0.022, 0, -0.016), pel=(0, 0, -3), chest=(0, 0, 2.5), head=(0, 2, 9), footR=(0.03, 0.03, 0, 14, 0), kneeR=0.35))],
     loop=True, overlay=[breathe(0.8, 2)], face=[[1, "soft+blush", "smile+blush"], [50, "blink+blush", "smile+blush"], [54, "soft+blush", "smile+blush"]],
     note="ROM-05 calm happy smile, weight on the left leg (contrapposto)")
clip("gaze_lock", 60, [(0, D()), (12, D(head=(-4, 30, 0), neck=(0, 6, 0))), (59, D(head=(-4, 30, 0), neck=(0, 6, 0)))],
     overlay=[breathe(0.5, 1)], face=[[1, "open", "talkClosed"], [12, "open", "talkClosed+blush"]], note="ROM-06 looks steadily at her (head turned to his left)")

# ---- locomotion extras
_wh, _whv = walk_fn(stride=0.17, n=22, lift=0.07, arm=25)
def _bounce(pv, i, n): add(pv, "root", (0, 0, 0.012 * abs(math.sin(2 * math.pi * i / n)))); add(pv, "head", (0, 0, 6 * math.sin(2 * math.pi * i / n)))
clip("walk_happy", 22, [], loop=True, pose_fn=lambda i, n, f=_wh: f(i, n), overlay=[_bounce], speed_m_per_s=round(_whv * RS, 4),
     face=[[1, "happy", "smile"]], note="WLK-04 light happy step (exit after a sweet ending); in place, move the root at speed_m_per_s")
STEP_F = 0.38
clip("step_in", 44, [(0, D()), (6, D(footL=(0.022, 0.0, 0.05, 7, 6), root=(0, 0.02, -0.014))), (14, D(footL=(0.022, STEP_F, 0.015, 7, 2), root=(0, STEP_F * 0.42, -0.026))),
                     (17, D(footL=(0.022, STEP_F, 0.0, 7, 0), root=(0, STEP_F / 2, -0.03))),
                     (21, D(footL=(0.022, STEP_F, 0.0, 7, 0), footR=(0.022, 0.0, 0.045, 7, -10), root=(0, STEP_F * 0.6, -0.025))),
                     (27, D(footL=(0.022, STEP_F, 0.0, 7, 0), footR=(0.022, STEP_F * 0.6, 0.06, 7, 5), root=(0, STEP_F * 0.8, -0.02))),
                     (32, D(footL=(0.022, STEP_F, 0.0, 7, 0), footR=(0.022, STEP_F, 0.015, 7, 2), root=(0, STEP_F * 0.95, -0.026))),
                     (35, D(footL=(0.022, STEP_F, 0.0, 7, 0), footR=(0.022, STEP_F, 0.0, 7, 0), root=(0, STEP_F, -0.03))),
                     (43, D(footL=(0.022, STEP_F, 0.0, 7, 0), footR=(0.022, STEP_F, 0.0, 7, 0), root=(0, STEP_F, -0.012)))],
     face=[[1, "open", "smile"], [16, "happy", "laugh"], [34, "happy", "smile"]], note=f"WLK-05 one step in (~{STEP_F * RS:.2f} m forward, ends there: move the root)")


def turn_fn(n=40):
    """OTR-01 turn 180 deg to his left pivoting on the left foot (ball of the foot), the right foot steps around in two steps.
    Ends facing back ~0.23 m to his left: rotate the root 180 deg and move it there."""
    def sm(u): u = min(max(u, 0.0), 1.0); return u * u * (3 - 2 * u)
    PX, PY = 0.114, 0.027                                         # pivot = left ankle (blender xy)
    def rot(x, y, t):
        c, s_ = math.cos(math.radians(t)), math.sin(math.radians(t)); return PX + c * (x - PX) - s_ * (y - PY), PY + s_ * (x - PX) + c * (y - PY)
    def fn(i, n_):
        u = i / (n - 1)
        th = 180 * sm((u - 0.05) / 0.85)
        thR = 90 * sm((u - 0.10) / 0.30) + 90 * sm((u - 0.50) / 0.30)
        cx, cy = rot(0.0, 0.0, th)
        p = {"pel": (0, th, 0), "root": (cx, -cy, -0.014 - 0.01 * math.sin(math.pi * u)), "head": (0, 10 * math.sin(math.pi * sm(u / 0.7)), 0)}
        p["footL"] = (0.022, 0.0, 0.0, 7 + th, 0)
        xr, yr = rot(-0.114, 0.027, thR)
        lift = 0.05 * (math.sin(math.pi * min(max((u - 0.10) / 0.30, 0), 1)) + math.sin(math.pi * min(max((u - 0.50) / 0.30, 0), 1)))
        p["footR"] = (-(xr + 0.092), -(yr - 0.027), lift, 7 - thR, 0)
        return p
    return fn
clip("turn_180", 40, [], pose_fn=turn_fn(40), face=[[1, "open", "neutral"]], allow={"slide": 25},
     note="OTR-01 turns 180 deg to his left pivoting on the left foot; ends facing back ~0.23 m to his left (rotate + move the root)")

# ---- talking
TB = dict(chest=(5, 0, 0), armL=("t", (-0.02, 0.20, -0.33)), armR=("t", (-0.02, 0.20, -0.33)), poleL=(0.4, -0.6, -0.8), poleR=(0.4, -0.6, -0.8),
          handL=(45, 0, 0), handR=(45, 0, 0))
clip("talk", 60, [(0, D(**TB, head=(0, 0, 6))), (15, D(**dict(TB, head=(-3, 0, 9)))), (30, D(**dict(TB, head=(2, 0, 5)))), (45, D(**dict(TB, head=(-2, 0, 10))))],
     loop=True, overlay=[breathe(0.6, 2), osc("head", 0, 60, (3, 0, 0), 6, False)],
     face=lambda_flap(60, "open", ("talkA", "smileOpen"), 5, blink=36), note="TLK-01 base talking: leans in, hands half open, head bobs per syllable")
clip("talk_side", 60, [(0, D(chest=(0, 10, 0), head=(-5, 55, 0), neck=(0, 10, 0))), (30, D(chest=(0, 10, 0), head=(-3, 52, 2), neck=(0, 10, 0)))], loop=True,
     overlay=[breathe(0.6, 2)], face=lambda_flap(60, "gazeR", ("talkSmall", "talkClosed"), 6), note="TLK-02 talking in profile / sideways glance (head to his left)")
clip("ask_tilt", 36, [(0, D()), (8, D(**dict(TB, head=(-4, 0, 12), root=(0, 0.02, -0.012)))), (35, D(**dict(TB, head=(-4, 0, 12), root=(0, 0.02, -0.012))))],
     face=[[1, "open", "talkA"], [6, "surprised", "oh"]], note="TLK-03 asks, tilts the head and waits (ordering / asking)")
clip("talk_dreamy", 60, [(0, D(head=(-4, 0, 6))), (30, D(head=(-4, 0, -6)))], loop=True, overlay=[breathe(0.8, 2)],
     face=lambda_flap(60, "half+blush", ("smileOpen+blush", "smile+blush"), 8), note="TLK-10 dreamy talk, slow head sway")
clip("confess_shy", 45, [(0, D()), (12, D(head=(17, 8, 4), clavL=(4, 6), clavR=(4, 6), chest=(4, 0, 0))), (44, D(head=(16, 6, 6), clavL=(4, 6), clavR=(4, 6), chest=(4, 0, 0)))],
     face=[[1, "open", "talkClosed"], [10, "gazeDown+blush", "talkSmall+blush"], [24, "shy+blush", "parted+blush"], [36, "gazeDown+blush", "talkSmall+blush"]],
     note="TLK-11 shy confession: head down, shoulders in, eyes away")
EXC = dict(root=(0, -0.02, -0.012), chest=(-10, 0, 0), head=(-8, 0, 0), neck=(-6, 0, 0), armR=("t", (0.10, 0.25, -0.20)), poleR=(0.5, -0.5, -1), handR=(80, -10, 0))
clip("exclaim", 30, [(0, D()), (5, D(**dict(EXC, head=(4, 0, 0)))), (9, D(**EXC)), (29, D(**dict(EXC, chest=(-6, 0, 0))))],
     face=[[1, "open", "neutral"], [4, "surprised", "shout"], [16, "surprised", "smileOpen"]], note="TLK-12 emphatic shout (pop), one palm up")
clip("talk_quiet", 45, [(0, D(armR=("t", (-0.10, 0.18, -0.24)), poleR=(0.5, -0.6, -1), handR=(20, 40, 0), head=(6, -6, 0))),
                        (22, D(armR=("t", (-0.10, 0.18, -0.24)), poleR=(0.5, -0.6, -1), handR=(20, 40, 0), head=(6, -8, 2)))], loop=True,
     arm_overlay=[arm_osc("R", 5, 20, (0, 0, 0.03), 2), arm_osc("R", 27, 42, (0, 0, 0.03), 2)],
     face=lambda_flap(45, "gazeL", ("talkSmall", "talkClosed"), 4), note="TLK-09 'quietly': half-closed hand by the chest taps, small talk")

# ---- hand gestures
STOP = dict(armR=("t", (0.06, 0.28, -0.06)), poleR=(0.5, -0.4, -1), handR=(0, -70, 0), chest=(0, 12, 0), head=(-2, 10, 0))
clip("hand_stop", 36, [(0, D()), (9, D(**STOP)), (28, D(**STOP)), (35, D(**STOP))], arm_overlay=[arm_osc("R", 12, 30, (0.03, 0, 0), 2)],
     face=[[1, "open", "neutral"], [6, "surprised", "talkWide"], [24, "surprised", "talkA"]], note="TLK-06 'stop / wait' palm forward, small wave")
DENY = dict(armR=("t", (0.0, 0.30, -0.10)), poleR=(0.5, -0.4, -1), handR=(0, -70, 0), chest=(8, 0, 0), head=(4, 0, 0), root=(0, -0.01, -0.012))
clip("deny_palm", 30, [(0, D()), (7, D(**DENY)), (24, D(**DENY)), (29, D(**DENY))], arm_overlay=[arm_osc("R", 8, 24, (0.045, 0, 0), 3)],
     overlay=[osc("handR", 8, 24, (25, 0, 0), 3)], face=[[1, "open", "neutral"], [5, "surprised+blush", "oh+blush"]], allow={"tremble": True},
     note="TLK-07 polite 'no no' with the palm, panicky")
PB = dict(armR=("t", (0.14, 0.04, -0.10)), poleR=(0.5, -0.3, -1), handR=(60, -20, 0), chest=(0, -6, 0))
clip("point_back", 36, [(0, D()), (9, D(**PB)), (24, D(**PB)), (35, D())], arm_overlay=[arm_osc("R", 10, 22, (0.0, -0.04, 0), 2)], allow={"tremble": True},
     face=[[1, "open", "talkA"], [12, "half", "talkSmall"]], note="TLK-05 variant: thumb / hand pointing back over the shoulder")
IND = dict(chest=(4, 22, 0), head=(4, 6, 0), root=(0, 0.02, -0.012), armR=("t", (-0.02, 0.27, -0.21)), poleR=(0.4, -0.6, -1), handR=(85, -10, 0))
clip("indignant", 36, [(0, D()), (8, D(**IND)), (35, D(**IND))], face=[[1, "open", "neutral"], [6, "angry+blush", "smileOpen+blush"], [24, "angry+blush", "talkA+blush"]],
     note="REA-07 offended protest: turns to her, palm up")

# ---- reactions
FLINCH = dict(root=(0, -0.05, -0.02), chest=(-10, 0, 0), head=(-6, 48, 0), clavL=(11, 0), clavR=(11, 0),
              armL=("t", (-0.04, 0.22, -0.16)), armR=("t", (-0.04, 0.22, -0.16)), poleL=(0.6, -0.4, -1), poleR=(0.6, -0.4, -1), handL=(30, -50, 0), handR=(30, -50, 0))
clip("startle", 36, [(0, D()), (2, D(head=(0, -8, 0))), (10, D(**FLINCH)), (35, D(**dict(FLINCH, chest=(-8, 0, 0))))],
     overlay=[tremor("handL", (0, 2, 0), 8, 9), tremor("handR", (0, -2, 0), 8, 9)], allow={"tremble": True},
     face=[[1, "open", "neutral"], [3, "shocked", "bigShock"], [12, "surprised", "gasp"]], note="REA-01 flinch toward a noise (to his left) + scared hold")
clip("double_take", 30, [(0, D()), (6, D(head=(0, 6, 0))), (12, D(head=(-6, 85, 0), neck=(0, 25, 0), chest=(0, 15, 0))), (29, D(head=(-6, 85, 0), neck=(0, 25, 0), chest=(0, 15, 0)))],
     face=[[1, "open", "neutral"], [11, "surprised", "oh"]], note="REA-02 double take over the left shoulder")
clip("shock_freeze", 40, [(0, D()), (6, D(head=(-8, 0, 0), neck=(-4, 0, 0), clavL=(4, 0), clavR=(4, 0))), (39, D(head=(-8, 0, 0), neck=(-4, 0, 0), clavL=(4, 0), clavR=(4, 0)))],
     overlay=[tremor("head", (0, 0, 1.0), 6, 8)], allow={"tremble": True}, face=[[1, "open", "neutral"], [5, "surprised+blush", "oh+blush"]],
     note="REA-03 frozen shock: snap and hold, tiny tremor")
PANIC = dict(head=(-8, 0, 10), chest=(-4, 0, 0), armL=("aim", 8, 2, 4), armR=("aim", 8, 2, 4), handL=(0, -20, 0), handR=(0, -20, 0), clavL=(-3, 0), clavR=(-3, 0))
clip("panic_final", 60, [(0, D()), (10, D(**PANIC)), (59, D(**PANIC))], overlay=[osc("head", 10, 22, (0, 4, 0), 2), tremor("handL", (0, 2, 0), 8, 10), tremor("handR", (0, -2, 0), 8, 10)],
     allow={"tremble": True}, face=[[1, "open", "neutral"], [8, "shocked", "bigShock"]], note="REA-04 comedy panic ending: limp arms, blank eyes")
clip("deadpan", 60, [(0, D(head=(0, 0, 7))), (59, D(head=(0, 0, 7)))], face=[[1, "half", "talkClosed"], [30, "blink", "talkClosed"], [33, "half", "talkClosed"]],
     note="REA-05 deadpan stare, no sway")
DEF = dict(head=(14, 0, 0), chest=(7, 0, 0), clavL=(-6, 4), clavR=(-6, 4), root=(0, 0, -0.02))
clip("defeat", 45, [(0, D()), (12, D(**dict(DEF, root=(0, 0, -0.03)))), (18, D(**DEF)), (44, D(**DEF))], face=[[1, "open", "neutral"], [10, "gazeDown", "sadPout"]],
     note="REA-08 comic defeat / resignation")
APO = dict(chest=(4, 25, 0), head=(16, 15, 0), armR=("lm", "hip", (0.06, 0.05, 0.02)), poleR=(0.8, -0.6, 0), handR=(-30, 10, 0))
clip("apologize", 45, [(0, D()), (12, D(**APO)), (44, D(**APO))], face=[[1, "open", "neutral"], [10, "sad+blush", "talkSmall+blush"]],
     note="REA-09 apology, turning away, hand near the hip")
clip("nod_slow", 36, [(0, D()), (35, D())], overlay=[nod_ov(2, 34, 10, 1)], face=[[1, "open", "softSmile"], [10, "blink", "softSmile"], [26, "open", "softSmile"]],
     note="REA-12 slow serene nod (eyes close)")
clip("heart_eyes", 90, [(0, D()), (8, D(head=(-4, 0, 0))), (40, D(chest=(12, 0, 0), spine=(4, 0, 0), head=(-6, 0, 0))), (75, D(chest=(10, 0, 0), spine=(4, 0, 0), head=(-4, 0, 4))),
                        (89, D(head=(-4, 0, 4)))], overlay=[osc("head", 40, 70, (6, 0, 0), 3)],
     face=[[1, "hearts+blush", "talkClosed+blush"], [36, "hearts+blush", "smileOpen+blush"], [72, "hearts+blush", "smile+blush"]], note="ROM-01 heart eyes, leans in excited")
clip("blush_look_away", 50, [(0, D()), (10, D(head=(11, -10, 12), clavL=(3, 5), clavR=(3, 5))), (32, D(head=(10, -12, 11), clavL=(3, 5), clavR=(3, 5))), (49, D(head=(5, -4, 6)))],
     overlay=[osc("root", 10, 30, (0, 0, -0.006), 2)], face=[[1, "open", "talkClosed"], [6, "gazeR+blush", "cat+blush"], [32, "shy+blush", "cat+blush"], [42, "open+blush", "softSmile+blush"]],
     note="ROM-02 blushes and looks away, eyes come back")
clip("sly_look", 40, [(0, D()), (10, D(head=(4, -12, 11))), (39, D(head=(4, -12, 11)))], face=[[1, "open", "neutral"], [8, "smirk", "smirk"]],
     note="ROM-03 sly / teasing look")
PK = dict(root=(-0.10, 0, -0.012), chest=(0, 0, 14), spine=(0, 0, 8), head=(0, 0, 14), armL=("aim", 26, 6, 12), armR=("aim", 8, 4, 10))
clip("peek", 45, [(0, D(root=(-0.10, 0, -0.012))), (10, D(**PK)), (44, D(**dict(PK, head=(0, 0, 16))))],
     face=[[1, "open", "smile+blush"], [24, "open+blush", "pout+blush"]], note="ROM-04 leans out sideways from behind a frame (to his left), puppy pout")

# ---- nerves
NW = dict(SCR, armL=("t", (0.20, 0.10, 0.02)), poleL=(0.2, -0.6, -0.8), handL=(80, 0, 0))
clip("nervous_wave", 68, [(0, D()), (10, D(**SCR_MID)), (22, D(**NW)), (44, D(**NW)), (57, D(**SCR_MID)), (67, D())],
     arm_overlay=[arm_osc("R", 22, 44, (0.0, 0.0, 0.02), 3), arm_osc("L", 22, 42, (0.05, 0, 0), 2)], allow={"tremble": True},
     face=[[1, "open", "neutral"], [12, "happy+blush", "smileOpen+blush"]], clav_auto=False, note="NRV-02 hand on the nape + other hand waves 'no, no'")
FAN = dict(armL=("lm", "chest", (0.12, 0.02, 0.10)), armR=("lm", "chest", (0.12, 0.02, 0.10)), poleL=(0.6, -0.3, -1), poleR=(0.6, -0.3, -1),
           handL=(-40, 50, 0), handR=(-40, 50, 0), head=(-6, 0, 0))
clip("fan_collar", 60, [(0, D(**FAN)), (30, D(**FAN))], loop=True, arm_overlay=[arm_osc("L", 0, 59, (0, 0.04, 0), 8), arm_osc("R", 0, 59, (0, 0.04, 0), 8)],
     face=[[1, "open+blush", "smileOpen+blush"]], allow={"arm_arm": 15}, note="NRV-03 fans himself by tugging the collar")

# ---- objects
CUP = dict(armL=("t", (-0.07, 0.27, -0.25)), armR=("t", (-0.07, 0.27, -0.25)), poleL=(0.3, -0.6, -1), poleR=(0.3, -0.6, -1), handL=(0, -5, 0), handR=(0, -5, 0))
clip("hold_cup", 90, [(0, D(**CUP)), (45, D(**CUP))], loop=True, overlay=[breathe(0.8, 3), nod_ov(30, 40, 3, 1), nod_ov(75, 85, 3, 1)],
     face=[[1, "open", "smile"], [60, "blink", "smile"], [64, "open", "smile"]], props="cup / jar between both hands at chest height (~0.2 m apart)",
     note="OBJ-04 holds a cup with both hands, small nods while listening")
RCV = dict(armR=("aim", 12, 72, 12), poleR=(0.6, -0.3, -1), handR=(30, 0, 0))
clip("receive_object", 40, [(0, D()), (12, D(**RCV)), (39, D(**RCV))], face=[[1, "open", "neutral"], [10, "open", "smile"]],
     props="object handed to Hand.R at waist height", note="OBJ-02 / OBJ-08 / FEM-01 reaches out and takes / claims an object")
UPR = dict(armR=("t", (0.10, 0.10, 0.46)), poleR=(1, -0.2, -0.3), handR=(80, 0, 0), head=(-18, 0, 0), chest=(-5, 0, -4), clavR=(10, 0),
           footL=(0.022, 0.0, 0.0, 7, -28), footR=(0.022, 0.0, 0.0, 7, -28), root=(0, 0, 0.04))
UPR_MID = dict(SIG_MID)
clip("reach_up", 60, [(0, D()), (8, D(**UPR_MID)), (16, D(**UPR)), (24, D(**dict(UPR, root=(0, 0, 0.0), footL=(0.022, 0, 0, 7, -5), footR=(0.022, 0, 0, 7, -5)))),
                      (32, D(**UPR)), (40, D(**dict(UPR, root=(0, 0, 0.0), footL=(0.022, 0, 0, 7, -5), footR=(0.022, 0, 0, 7, -5)))), (52, D(**UPR_MID)), (59, D())],
     face=[[1, "open", "neutral"], [10, "lookUp", "grin"], [44, "gazeUp", "pout"]], note="FEM-02 tiptoe reach for an object she holds up (2 tries)")

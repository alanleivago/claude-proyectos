"""standing clips (talk, gestures, reactions, objects, walk)"""
from clips import *

# ---------------------------------------------------------------- helpers for the rest of the set
B0 = dict(**SQ, **contra("R", 0.6), aL=hang("L"), aR=hang("R"))            # standing base: every one-shot starts here


def W(s, x, y, z, sp="chestN", pole=None, wr=(0, 0, 0)):
    sg = 1 if s == "L" else -1
    return A((CX + sg * x, y, z), sp, pole if pole is not None else (sg * 0.6, 0.6, -0.5), wr)


def pel_world(p, rx=0, ry=0, rz=0, off=(0, 0, 0)):
    """pelvis-local rest point -> world, for a held pelvis rotation / offset"""
    h = C.Hr[C.BI["Pelvis"]]; return h + np.asarray(off) + C.E(rx, ry, rz) @ (np.asarray(p, float) - h)


def talk(c, f0, f1, step=5, pat=("talkSmall", "talkA", "talkClosed", "talkEE", "talkOO", "talkWide"), eyes="open"):
    k = 0
    for f in range(f0, f1, step): c.face(f, eyes, pat[k % len(pat)]); k += 1


def addf(*fs):
    def f_(f, P):
        for g in fs: g(f, P)
    return f_


def osc(ch, amp, period, phase=0.0, pos=False):
    def g(f, P):
        w = wave(f, period, phase); P[ch] = P[ch] + amp * (max(0.0, w) if pos else w)
    return g


def br(period, amt): return lambda f, P: breathe(P, f, period, amt)


# ================================================================ LISTEN / GLANCE (UpNext #1, #3)
c = clip("listen_head_down", 75, note="UpNext #1: head drops and holds, hands drift together in front, toe turned in")
c.k(0, **B0).k(6, **B0)
c.k(22, hx=24, hy=-8, hz=-6, cx=6, clL_up=-2, clR_up=-2, **contra("R", 0.8), aL=W("L", 0.035, -0.15, 0.86, "pelvis", wr=(0, -15, 0)), aR=W("R", 0.03, -0.155, 0.87, "pelvis", wr=(0, -15, 0)))
c.k(75, hx=26, hy=-9, hz=-7, cx=7)
c.add = br(75, 0.7)
c.face(0, "open", "neutral"); c.face(14, "half", "neutral"); c.face(60, "blink", "neutral"); c.face(63, "half", "neutral")

c = clip("glance_reply", 60, note="UpNext #3: eyes then head turn to her left partner, chest follows, chin dip on the line")
c.k(0, **B0).k(4, **B0)
c.k(12, hz=30, hy=9, nz=6).k(16, cz=-6 + 9, sz=-4 + 3, clL_up=3)
c.k(28, hx=-2).k(33, hx=7).k(40, hx=0, hz=32).k(60, hz=31, hy=8)
c.add = br(60, 0.8)
c.face(0, "open", "neutral"); c.face(4, "gazeR", "neutral"); c.face(14, "open", "softSmile"); talk(c, 26, 50); c.face(50, "open", "smile")


# ================================================================ WALK (UpNext #4)
def walk_clip(name, N, D, width, lift, arm_swing, bob, sway, roll, yaw, arms=None, note=""):
    c = clip(name, N, loop=True, note=note); c.speed = round(D / (N / 30), 3)
    c.k(0, **{**SQ, "kL": (-0.1, -1, 0.05), "kR": (0.1, -1, 0.05), "aL": hang("L", 0.025), "aR": hang("R", 0.025), **(arms or {})})
    beta = 0.62

    def foot(ph):
        ph %= 1.0
        if ph < beta:
            y = -D * beta / 2 + D * ph; s = ph / beta
            heel = -12 * max(0, 1 - s / 0.12) + 34 * max(0, (s - 0.72) / 0.28) ** 1.5
            return y, heel, 0.0
        s = (ph - beta) / (1 - beta); e = 0.5 - 0.5 * np.cos(np.pi * s)
        y = D * beta / 2 - D * beta * e
        heel = 34 * (1 - s) ** 2 - 14 * s ** 2
        return y, heel, lift * np.sin(np.pi * s) ** 1.2

    def add(f, P):
        ph = f / N
        for s, sg, off in (("L", 1, 0.0), ("R", -1, 0.5)):
            y, heel, lz = foot(ph + off)
            P["_f" + s] = np.array([CX + sg * width, y + 0.03, sg * 6, heel, lz, 0])
        w2 = np.cos(4 * np.pi * (ph - 0.06)); w1 = np.sin(2 * np.pi * ph)
        P["pz"] += -0.016 - bob * w2; P["px"] += sway * w1; P["pry"] += -roll * w1; P["prz"] += -yaw * np.cos(2 * np.pi * ph)
        P["cz"] += 0.7 * yaw * np.cos(2 * np.pi * ph); P["cy"] += 0.6 * roll * w1; P["hy"] -= 0.3 * roll * w1; P["hz"] -= 0.2 * yaw * np.cos(2 * np.pi * ph)
        P["cx"] += 1.5 * w2; P["hx"] -= 1.0 * w2 + 2
        for s in "LR":
            if arms and ("a" + s) in arms: continue
            sw = arm_swing * np.cos(2 * np.pi * (ph + (0.0 if s == "L" else 0.5)) - 0.4)
            P["_dt" + s] = np.array([0.0, sw, 0.015 * abs(sw) / max(arm_swing, 1e-6)])
            P["_dwr" + s] = np.array([0, 10 * sw / max(arm_swing, 1e-6), 0])
    c.add = add
    return c


c = walk_clip("walk", 32, 0.56, 0.054, 0.075, 0.07, 0.011, 0.024, 6, 7, note="feminine walk, in place: narrow steps, hip roll + sway, soft arm swing (move the character at speed_units_per_s)")
c.face(0, "open", "neutral"); blink(c, 20)
c = walk_clip("walk_shy", 36, 0.44, 0.05, 0.06, 0.04, 0.008, 0.018, 4, 5, arms=dict(aR=REST_A["R"], hx=6), note="small shy steps with her right fist at the chest (his_idle arm)")
c.face(0, "shy+blush", "softSmile+blush"); blink(c, 24, eyes="shy+blush", mouth="softSmile+blush")

# ================================================================ TALK
c = clip("talk_explain", 60, loop=True, note="talking: right hand up palm-up with beats, head nods on the beats")
TE = dict(**SQ, **contra("L", 0.6), aR=W("R", 0.15, -0.20, 1.0, wr=(-40, 35, 0), pole=(-0.8, 0.6, -0.6)), aL=hang("L"))
c.k(0, **TE)
for f0 in (0, 20, 40):
    c.k(f0 + 6, aR=W("R", 0.17, -0.22, 0.97, wr=(-40, 20, 0), pole=(-0.8, 0.6, -0.6)), hx=4).k(f0 + 14, aR=W("R", 0.15, -0.20, 1.01, wr=(-40, 38, 0), pole=(-0.8, 0.6, -0.6)), hx=-1)
c.k(60, **TE)
c.add = addf(br(60, 0.8), osc("hy", 4, 60, 0.2))
talk(c, 0, 60, 4)

c = clip("talk_both", 60, loop=True, note="talking with both hands open in front, alternating little circles, chest sway")
c.k(0, **SQ, **contra("R", 0.5), aL=W("L", 0.20, -0.25, 1.04, wr=(50, 35, 0), pole=(1, 0.4, -0.7)), aR=W("R", 0.20, -0.25, 1.04, wr=(50, 35, 0), pole=(-1, 0.4, -0.7)))
def _tb(f, P):
    P["_dtL"] = np.array([0.02 * wave(f, 30), -0.02 * wave(f, 30, 0.25), 0.02 * wave(f, 30, 0.25)])
    P["_dtR"] = np.array([-0.02 * wave(f, 30, 0.5), -0.02 * wave(f, 30, 0.75), 0.02 * wave(f, 30, 0.75)])
c.add = addf(br(60, 0.8), _tb, osc("cy", 3, 60), osc("hy", -4, 60), osc("hx", 3, 15))
talk(c, 0, 60, 4)

c = clip("talk_cute", 48, loop=True, note="cute talking: hands clasped under the chin, side-to-side sway")
c.k(0, **SQ, fL=F("L", 0.075, 0.04, -8), fR=F("R", -0.048, 0.04, 8), kL=(-0.35, -1, 0), kR=(0.35, -1, 0), clL_up=6, clR_up=6, cx=3,
    aL=W("L", 0.045, -0.21, 1.21, wr=(0, 40, 0), pole=(0.7, 0.2, -1)), aR=W("R", 0.04, -0.215, 1.20, wr=(0, 40, 0), pole=(-0.7, 0.2, -1)))
c.add = addf(osc("hy", 9, 48), osc("cy", -3, 48), osc("px", 0.012, 48), osc("pry", -3, 48), osc("hz", 4, 48, 0.2))
talk(c, 0, 48, 4, pat=("talkSmall+blush", "softSmile+blush", "talkOO+blush", "grin+blush"), eyes="smiling+blush")

c = clip("talk_self", 45, note="'me?': right fist taps her chest, head tilts, little lean back")
c.k(0, **B0).k(4, **B0)
c.k(12, aR=W("R", 0.02, -0.16, 1.18, wr=(0, 40, 0), pole=(-1, 0.3, -0.6)), hy=10, cx=-4, py=0.008, clR_up=4)
c.k(18, aR=W("R", 0.02, -0.15, 1.17, wr=(0, 40, 0), pole=(-1, 0.3, -0.6))).k(22, aR=W("R", 0.02, -0.165, 1.18, wr=(0, 40, 0), pole=(-1, 0.3, -0.6)))
c.k(38, hy=12).k(45, hy=12)
c.face(0, "open", "neutral"); c.face(10, "surprised", "talkO"); c.face(20, "open", "talkA"); c.face(26, "open", "smile")

# ================================================================ HEAD GESTURES
c = clip("nod", 30, note="two soft nods with a smile")
c.k(0, **B0).k(4, **B0).k(9, hx=13, cx=2).k(14, hx=-2, cx=0).k(19, hx=9).k(25, hx=0).k(30, hx=0)
c.face(0, "open", "neutral"); c.face(6, "happy", "smile"); c.face(26, "open", "smile")

c = clip("head_shake", 36, note="'no no': head shakes with a little shoulder counter-sway, eyes closed")
c.k(0, **B0).k(4, **B0)
for i, f in enumerate((9, 15, 21, 27)): c.k(f, hz=(14 if i % 2 == 0 else -14) * (1 - 0.18 * i), cz=-6 + (-3 if i % 2 == 0 else 3), hy=-3)
c.k(33, hz=0, cz=-6, hy=0).k(36)
c.face(0, "open", "neutral"); c.face(7, "blink", "frown"); c.face(30, "open", "neutral")

c = clip("shrug", 40, note="shoulders up, palms up and out, head tilt, cute 'dunno' face")
c.k(0, **B0).k(4, **B0)
SH = dict(clL_up=14, clR_up=14, hy=11, hx=-2, cx=-3, aL=W("L", 0.25, -0.24, 1.02, wr=(60, 45, 0), pole=(1, 0.7, -0.5)), aR=W("R", 0.25, -0.24, 1.02, wr=(60, 45, 0), pole=(-1, 0.7, -0.5)))
c.k(12, **SH).k(26, **{**SH, "hy": 13}).k(36, **B0, hy=0, hx=0, cx=0, clL_up=0, clR_up=0).k(40)
c.face(0, "open", "neutral"); c.face(10, "lookUp", "pout"); c.face(34, "open", "neutral")

# ================================================================ ARM POSES
c = clip("arms_crossed", 50, note="arms crossed under the bust, weight on one hip, chin up, pouty 'hmph' (holds)")
c.k(0, **B0).k(4, **B0)
AC = dict(**contra("L", 1.0), hx=-6, hy=-6, hz=-10, aL=W("L", -0.075, -0.16, 1.06, wr=(0, 25, 0), pole=(1, 0.3, -0.8)), aR=W("R", -0.08, -0.12, 1.035, wr=(0, 25, 0), pole=(-1, 0.4, -0.8)))
c.k(16, **AC).k(50, **{**AC, "hz": -12})
c.add = br(50, 0.6)
c.face(0, "open", "neutral"); c.face(12, "blink", "pout"); c.face(16, "sulk", "pout")

HIPL = W("L", 0.205, 0.035, 0.95, "pelvis", pole=(1, 0.6, 0), wr=(0, -20, -35))
HIPR = W("R", 0.205, 0.035, 0.95, "pelvis", pole=(-1, 0.6, 0), wr=(0, -20, -35))
c = clip("hand_on_hip", 45, note="fist on her left hip, elbow back, hip popped out, head tilt to the hip (holds)")
c.k(0, **B0).k(4, **B0)
HH = dict(**contra("L", 1.2), hy=8, hz=4, aL=HIPL, aR=hang("R", 0.01))
c.k(16, **HH).k(45, **{**HH, "hy": 9})
c.add = br(45, 0.6)
c.face(0, "open", "neutral"); c.face(12, "tease", "smirk"); blink(c, 30, eyes="tease", mouth="smirk")

c = clip("hands_on_hips", 45, note="power pose (UpNext #11): fists on hips, elbows wide, chest out, chin up, weight on one leg")
c.k(0, **B0).k(4, **B0)
PP = dict(**SQ, **contra("R", 1.0), cx=-6, hx=-9, hy=-5, aL=HIPL, aR=HIPR)
c.k(14, **PP).k(17, fL=F("L", FXL + 0.018, FY - 0.02, 2, 0, 0.035)).k(21, fL=F("L", FXL + 0.035, FY - 0.025, 6, 0)).k(45, **{**PP, "hx": -10})
c.add = br(45, 0.8)
c.face(0, "open", "neutral"); c.face(12, "happy", "smileOpen"); c.face(32, "relaxed", "smile")

c = clip("think", 60, note="thinking: fist at the chin, other arm across the waist under the elbow, head tilt, eyes up")
c.k(0, **B0).k(4, **B0)
TH = dict(**contra("R", 0.8), hy=12, hx=-5, hz=6, aR=W("R", -0.05, -0.15, 1.01, wr=(0, 20, 0), pole=(-1, 0.3, -0.8)), aL=W("L", 0.02, -0.14, 1.355, wr=(0, 45, 0), pole=(0.2, 0.0, -1)))
c.k(16, **TH).k(36, hy=14, hz=8).k(60, hy=12, hz=6)
c.add = lambda f, P: P.__setitem__("_dtL", np.array([0, 0, 0.006 * wave(f, 12)]) * (f > 20))
c.face(0, "open", "neutral"); c.face(12, "gazeUp", "pout"); c.face(40, "half", "pout"); c.face(44, "gazeUp", "smirkL")

c = clip("surprised", 36, note="startle: hop back, fists up to the collarbone, shoulders up, then settle (holds)")
c.k(0, **B0).k(3, **B0)
SU = dict(**SQ, py=0.02, pz=0.005, cx=-9, hx=-6, clL_up=12, clR_up=12, fL=STL, fR=STR, kL=(-0.2, -1, 0), kR=(0.2, -1, 0),
          aL=W("L", 0.07, -0.17, 1.24, wr=(0, 40, 0), pole=(0.6, 0.2, -1)), aR=W("R", 0.07, -0.17, 1.24, wr=(0, 40, 0), pole=(-0.6, 0.2, -1)))
c.k(8, **SU).k(12, **{**SU, "cx": -6, "py": 0.016, "clL_up": 9, "clR_up": 9}).k(36, **{**SU, "cx": -5, "py": 0.014, "clL_up": 8, "clR_up": 8, "hx": -3})
c.face(0, "open", "neutral"); c.face(5, "surprised", "gasp"); c.face(22, "surprised", "oh")

c = clip("sad_slump", 50, note="deflate (UpNext #8): shoulders drop, chest caves, head hangs, arms limp, knees in (holds)")
c.k(0, **B0).k(4, **B0)
SD = dict(**SQ, **contra("R", 0.4), cx=14, sx=5, hx=24, hy=-6, clL_up=-7, clR_up=-7, clL_fw=6, clR_fw=6,
          aL=W("L", 0.175, -0.10, 0.80, "pelvis", wr=(0, -5, 0)), aR=W("R", 0.175, -0.10, 0.80, "pelvis", wr=(0, -5, 0)))
c.k(11, **{**SD, "hx": 28, "cx": 16}).k(18, **SD).k(50, **{**SD, "hx": 25})
c.add = br(50, 1.3)
c.face(0, "open", "neutral"); c.face(6, "sad", "sadPout"); c.face(30, "half", "sadPout")

c = clip("laugh", 36, loop=True, note="giggle: hand covering the mouth, arm across the belly, shoulders bouncing, lean forward")
LA = dict(**SQ, **contra("L", 0.7), cx=8, hx=4, hy=8, aR=W("R", 0.02, -0.19, 1.37, wr=(0, 50, 0), pole=(-0.4, 0.1, -1)), aL=W("L", -0.04, -0.14, 0.99, wr=(0, 15, 0), pole=(1, 0.3, -0.8)))
c.k(0, **LA)
c.add = addf(osc("clL_up", 4, 9, pos=True), osc("clR_up", 4, 9, pos=True), osc("cx", 2.5, 9, pos=True), osc("hx", -3, 9, pos=True), osc("hy", 3, 36))
c.face(0, "happy+blush", "laugh+blush")

c = clip("embarrassed", 60, loop=True, note="flustered: fists at her cheeks, head and hips sway side to side, knees in, toe turned in")
EM = dict(**SQ, fL=F("L", 0.073, 0.02, -14, 12), fR=F("R", -0.048, 0.045, 8), kL=(-0.4, -1, 0), kR=(0.35, -1, 0), clL_up=8, clR_up=8, cx=4, hx=6,
          aL=W("L", 0.10, -0.11, 1.37, wr=(0, 55, 0), pole=(0.3, 0.1, -1)), aR=W("R", 0.10, -0.11, 1.37, wr=(0, 55, 0), pole=(-0.3, 0.1, -1)))
c.k(0, **EM)
c.add = addf(osc("hy", 10, 60), osc("hz", 7, 60, 0.1), osc("cz", 5, 60, 0.05), osc("px", -0.01, 60), osc("pry", 3, 60))
c.face(0, "shy+blush", "softSmile+blush"); c.face(30, "happy+blush", "lipBite+blush")

c = clip("sheepish", 45, note="hand on the back of the head, head tilt, 'hehe' (UpNext #13)")
c.k(0, **B0).k(4, **B0)
SP = dict(**contra("R", 0.8), hy=-10, hx=6, clR_up=8, aR=W("R", 0.12, 0.16, 1.51, wr=(0, 40, 0), pole=(-0.6, -1, 0.3)), aL=hang("L", -0.01))
c.k(15, **SP).k(45, **{**SP, "hy": -12})
c.add = lambda f, P: P.__setitem__("_dtR", np.array([0.008 * wave(f, 10), 0, 0]) * (f > 15))
c.face(0, "open", "neutral"); c.face(12, "happy+blush", "grin+blush")

c = clip("excited_bounce", 20, loop=True, note="excited: fists at the chest, bouncing on her toes")
EX = dict(**SQ, fL=F("L", 0.075, 0.04, -6), fR=F("R", -0.048, 0.04, 6), kL=(-0.3, -1, 0), kR=(0.3, -1, 0), clL_up=6, clR_up=6, hy=6,
          aL=W("L", 0.07, -0.19, 1.15, wr=(0, 45, 0), pole=(0.5, 0.3, -1)), aR=W("R", 0.07, -0.19, 1.15, wr=(0, 45, 0), pole=(-0.5, 0.3, -1)))
c.k(0, **EX)
def _ex(f, P):
    b = max(0.0, wave(f, 20, 0.0))
    for s in "LR": P["_f" + s] = P["_f" + s].copy(); P["_f" + s][3] = 22 * b
    P["pz"] += 0.03 * b - 0.012 * (1 - b); P["clL_up"] += 4 * b; P["clR_up"] += 4 * b; P["hy"] += 4 * wave(f, 40)
    P["_dtL"] = np.array([0, 0, 0.015 * b]); P["_dtR"] = np.array([0, 0, 0.015 * b])
c.add = _ex
c.face(0, "sparkle", "smileOpen")

c = clip("wave", 48, note="friendly wave: right hand up by the face, wrist waggles, head tilts to it")
c.k(0, **B0).k(3, **B0)
WV = lambda dx, dev: dict(aR=W("R", 0.31 + dx, -0.03, 1.50, wr=(-60, 10, dev), pole=(-1, 0.3, -1)))
c.k(10, **contra("L", 0.7), hy=-8, clR_up=8, **WV(0, 0))
for i, f in enumerate(range(14, 40, 6)): c.k(f, **WV(0.03 if i % 2 else -0.03, 25 if i % 2 else -25))
c.k(40, **WV(0, 0)).k(48, **B0, hy=0, clR_up=0)
c.face(0, "open", "neutral"); c.face(6, "happy", "smileOpen"); c.face(22, "winkR", "grin"); c.face(34, "open", "smile")

c = clip("point", 40, note="points ahead to her right, other hand at her chest, little lean")
c.k(0, **B0).k(3, **B0)
PT = dict(**contra("L", 0.8), cx=4, cz=-12, hz=-8, clR_fw=6, aR=W("R", 0.22, -0.40, 1.24, wr=(-80, -10, 0), pole=(-1, 0.4, -0.6)), aL=W("L", -0.01, -0.20, 1.15, wr=(0, 40, 0), pole=(1, 0.3, -0.8)))
c.k(10, **{**PT, "aR": W("R", 0.24, -0.43, 1.25, wr=(-80, -10, 0), pole=(-1, 0.4, -0.6))}).k(14, **PT).k(40, **PT)
c.face(0, "open", "neutral"); c.face(8, "open", "smileOpen"); c.face(24, "open", "smile")

c = clip("cheer", 36, note="'yay!': arms up in a V, eyes closed, little rise on the toes")
c.k(0, **B0).k(3, **B0)
CH = dict(**SQ, fL=F("L", 0.075, 0.04, -6, 18), fR=F("R", -0.048, 0.04, 6, 18), kL=(-0.3, -1, 0), kR=(0.3, -1, 0), pz=0.022, cx=-5, hx=-8, clL_up=12, clR_up=12,
          aL=W("L", 0.30, -0.04, 1.70, wr=(0, 20, 0), pole=(1, 0.3, 0)), aR=W("R", 0.30, -0.04, 1.70, wr=(0, 20, 0), pole=(-1, 0.3, 0)))
c.k(9, **CH).k(13, **{**CH, "pz": 0.012}).k(30, **{**CH, "pz": 0.015}).k(36, **{**CH, "pz": 0.012})
c.face(0, "open", "neutral"); c.face(6, "happy", "smileOpen")

c = clip("facepalm", 48, note="facepalm (UpNext #13): fist to the forehead, head drops, other arm across the belly")
c.k(0, **B0).k(4, **B0)
FP = dict(**contra("R", 0.6), hx=16, hy=-4, cx=6, aR=W("R", 0.03, -0.20, 1.44, wr=(0, 55, 0), pole=(-0.3, -0.2, -1)), aL=W("L", -0.04, -0.14, 0.99, wr=(0, 15, 0), pole=(1, 0.3, -0.8)))
c.k(14, **FP).k(30, **{**FP, "hz": 6}).k(40, **{**FP, "hz": -6}).k(48, **FP)
c.face(0, "open", "neutral"); c.face(10, "blink", "frown")

# ================================================================ OBJECTS (UpNext #6, #9, #14)
c = clip("hold_object", 90, loop=True, note="UpNext #6: both hands at the navel holding something (mug/jar/phone), looking down at it")
HO = dict(**SQ, **contra("R", 0.5), hx=18, cx=4, aL=W("L", 0.045, -0.20, 0.99, wr=(30, 35, 0), pole=(0.6, 0.6, -0.6)), aR=W("R", 0.045, -0.20, 0.99, wr=(30, 35, 0), pole=(-0.6, 0.6, -0.6)))
c.k(0, **HO).k(45, **contra("R", 0.65), hy=3).k(90, **HO)
c.add = br(45, 0.8)
c.face(0, "soft", "smile"); blink(c, 60, eyes="soft", mouth="smile")

c = clip("drink", 60, note="sip from a cup: right hand to the mouth, head back, eyes closed, back down")
c.k(0, **HO).k(6, **HO)
DR = dict(hx=-8, cx=-2, aR=W("R", 0.02, -0.17, 1.37, wr=(30, 55, 0), pole=(-0.8, 0.2, -1)), aL=W("L", 0.10, -0.18, 1.00, wr=(30, 30, 0), pole=(0.6, 0.6, -0.6)))
c.k(20, **DR).k(42, **{**DR, "hx": -12}).k(54, **HO).k(60, **HO)
c.face(0, "soft", "smile"); c.face(18, "relaxed", "kiss"); c.face(44, "bedroom", "softSmile")

c = clip("phone_look", 60, loop=True, note="UpNext #9: phone at chest height in the right hand, left thumb typing, head down")
PH = dict(**SQ, **contra("L", 0.6), hx=22, cx=5, aR=W("R", 0.04, -0.22, 1.10, wr=(-60, 40, 0), pole=(-0.6, 0.6, -0.8)), aL=W("L", 0.02, -0.21, 1.08, wr=(40, 40, 0), pole=(0.6, 0.6, -0.8)))
c.k(0, **PH)
c.add = addf(br(60, 0.7), lambda f, P: P.__setitem__("_dtL", np.array([0.006 * np.sign(wave(f, 12)), 0, 0.004 * max(0, wave(f, 6))])))
c.face(0, "gazeDown", "softSmile"); blink(c, 40, eyes="gazeDown", mouth="softSmile")

c = clip("raise_object", 40, note="UpNext #14: right arm straight up holding something high, other fist on the hip (holds)")
c.k(0, **B0).k(3, **B0)
RO = dict(**contra("L", 0.8), hx=-10, hy=-4, clR_up=14, aR=W("R", 0.10, -0.02, 1.86, wr=(0, 20, 0), pole=(-1, 0.4, 0)), aL=HIPL)
c.k(12, **{**RO, "aR": W("R", 0.11, -0.03, 1.88, wr=(0, 20, 0), pole=(-1, 0.4, 0))}).k(16, **RO).k(40, **RO)
c.face(0, "open", "neutral"); c.face(8, "happy", "smileOpen"); c.face(28, "sparkle", "smile")

c = clip("lean_reach", 50, note="UpNext #7: bends to offer / take something from a small character, free hand on the knee")
c.k(0, **B0).k(3, **B0)
LR = dict(**SQ, prx=20, sx=16, cx=14, hx=-18, py=0.06, pz=-0.045, fL=STL, fR=STR, kL=(-0.5, -1, 0), kR=(0.5, -1, 0),
          aR=W("R", 0.07, -0.47, 0.66, "world", wr=(70, 30, 0), pole=(-1, 0.4, -0.2)), aL=W("L", 0.09, -0.18, 0.68, "pelvis", wr=(0, 20, 0), pole=(1, 0.5, 0)))
c.k(16, **LR).k(36, **{**LR, "hy": 6}).k(50, **LR)
c.face(0, "open", "neutral"); c.face(10, "happy", "smile")

c = clip("hands_on_knees", 40, loop=True, note="UpNext #12: out of breath, bent over with hands on the knees, knees together, panting")
HK = dict(**SQ, prx=26, sx=18, cx=14, hx=-22, py=0.07, pz=-0.07, fL=STL, fR=STR, kL=(-0.3, -1, 0), kR=(0.3, -1, 0),
          aL=W("L", 0.07, -0.23, 0.56, "world", wr=(0, 10, 0), pole=(1, 0.6, 0)), aR=W("R", 0.07, -0.23, 0.56, "world", wr=(0, 10, 0), pole=(-1, 0.6, 0)))
c.k(0, **HK)
c.add = addf(osc("cx", -3, 20), osc("clL_up", 3, 20), osc("clR_up", 3, 20))
c.face(0, "half", "talkO"); c.face(10, "blink", "talkO"); c.face(13, "half", "talkO")

c = clip("crouch_pickup", 50, note="squat down knees together (angled to one side), pick something up, stand back up"); c.cam = (24, -4.0)
c.k(0, **B0).k(3, **B0)
CR = dict(**SQ, pz=-0.40, py=0.06, prx=18, sx=10, cx=14, hx=-8, prz=10, fL=F("L", FXL, FY - 0.015, -4, 20), fR=F("R", FXR, FY + 0.015, 4, 30),
          kL=(-0.6, -1, 0.1), kR=(-0.2, -1, 0.1), aR=W("R", 0.04, -0.34, 0.12, "world", wr=(60, 30, 0), pole=(-1, 0.4, 0)), aL=W("L", 0.06, -0.30, 0.42, "world", wr=(0, 20, 0), pole=(1, 0.4, 0)))
c.k(16, **CR).k(30, **{**CR, "aR": W("R", 0.04, -0.30, 0.25, "world", wr=(60, 40, 0), pole=(-1, 0.4, 0))})
c.k(46, **{**B0, "py": 0, "prx": 0, "sx": 0, "cx": 0, "hx": 0, "aR": W("R", 0.04, -0.20, 1.0, wr=(30, 35, 0), pole=(-0.6, 0.6, -0.6))}).k(50)
c.face(0, "open", "neutral"); c.face(14, "open", "talkO"); c.face(34, "happy", "smile")

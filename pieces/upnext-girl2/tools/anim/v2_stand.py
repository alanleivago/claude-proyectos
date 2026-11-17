"""v2 standing clips: listen / glance / walk / talk / head / arm poses / reactions / objects"""
from v2_clips import *
from anim2lib import REST_OUT_R


def hold_life(period=60, amt=0.8, sway=1.0):
    """breathing + a slow weight drift so holds never freeze"""
    def g(f, P):
        breathe(P, f, period, amt); w = wave(f, period * 2)
        P["pry"] += 0.8 * sway * w; P["px"] += 0.003 * sway * w; P["cy"] -= 0.6 * sway * w; P["hy"] += 1.0 * sway * wave(f, period * 2, 0.2)
    return g


def one_shot(c, base=B0, settle=4):
    c.k(0, **base).k(settle, **base); return c


# ================================================================ LISTEN / GLANCE (UpNext #1, #3)
c = one_shot(clip("listen_head_down", 75, note="UpNext #1: head drops and holds, hands drift together in front, toe turned in"), settle=5)
LH_FEET = dict(fL=pivot("L", FEET["fL"], -22), fR=FEET["fR"])
c.k(9, **plus(M(B0), hx=-4, cx=-2, clL_up=2, clR_up=2))                    # small breath in before the head goes down
LH = M(cp("R", 0.9, LH_FEET, heel=26, knee_in=0.5), hx=27, hy=-9, hz=-7, nx=6, cx=8, sx=3, clL_up=3, clR_up=3, clL_fw=5, clR_fw=5,
       aL=W("L", 0.03, -0.165, 0.81, "pelvis", pole=(0.7, 0.5, -0.2), hand=((-0.3, -0.3, -1), (-1, 0.4, 0))),
       aR=W("R", 0.025, -0.17, 0.825, "pelvis", pole=(-0.7, 0.5, -0.2), hand=((-0.3, -0.3, -1), (-1, 0.4, 0))))
c.k(26, **plus(LH, hx=3, cx=1)).k(34, **LH).k(75, **plus(LH, hx=2, hy=-1))
c.drag = {"L": 0.6, "R": 0.6}
c.add = hold_life(75, 0.7, 0.6)

c = one_shot(clip("glance_reply", 60, note="UpNext #3: eyes then head turn to her left partner, chest and hips follow, chin dip and a small open-hand gesture on the line"))
c.k(7, **plus(M(B0), hx=4, hz=-3))                                         # tiny dip before the turn (anticipation)
GR = M(cp("L", 0.7), hz=30, hy=10, nz=7, cz=-6 + 10, sz=-4 + 4, prz=8, hx=-2,
       aL=W("L", 0.17, -0.20, 0.97, pole=(0.9, 0.6, -0.4), hand=H_UP), aR=hang("R", 0.0, 0.01))
c.k(15, **plus(GR, hz=4, hx=-3)).k(21, **GR)
c.k(29, **M(GR, hx=7, aL=W("L", 0.18, -0.21, 0.94, pole=(0.9, 0.6, -0.4), hand=H_UP)))
c.k(35, **M(GR, hx=-1)).k(42, **M(GR, hx=5, aL=W("L", 0.17, -0.20, 0.96, pole=(0.9, 0.6, -0.4), hand=H_UP)))
c.k(50, **M(GR, hx=1, aL=W("L", 0.15, -0.10, 0.88, "pelvis", pole=(0.8, 0.8, -0.2), hand=H_HANG))).k(60, **M(GR, hx=1, hz=31, aL=hang("L", 0.0, 0.02)))
c.add = hold_life(60, 0.8, 0.5)


# ================================================================ WALK (UpNext #4)  v5: hip-led feminine walk (MercurialForge 12:38 timing)
def walk_clip(name, N, D, width, lift, swing, bob, sway, roll, yaw, arms=None, toe_out=4, knee_in=0.15, lead=0.07, out=0.035, note=""):
    """pelvis leads (yaw / sway phase-advanced by `lead` of a cycle), torso upright and counter-rotating, feet placed close
    to the centre line (the swing foot arcs out around the stance boot), soft knees (never locked), light toe-first steps,
    relaxed arms swinging a little out from the body with soft wrists, two small bounces per cycle"""
    c = clip(name, N, loop=True, note=note); c.speed = round(D / (N / 30), 3)
    base = dict(sz=-4, cz=-6, prx=-2, cx=-4, hx=0, kL=(-knee_in, -1, 0.05), kR=(knee_in, -1, 0.05),
                aL=W("L", 0.19 + out, -0.035, 0.80, "chestN", pole=(0.6, 0.8, 0.15), hand=H_HANG),
                aR=W("R", 0.19 + out, -0.035, 0.80, "chestN", pole=(-0.6, 0.8, 0.15), hand=H_HANG))
    base.update(arms or {}); c.k(0, **base)
    c.drag = {"L": 0.45, "R": 0.45}; c.wrdrag = {"L": 2.2, "R": 2.2}
    c.follow = dict(c.follow); c.follow.update({"hz": (2.0, 0.6), "hy": (2.0, 0.6)})          # the head stays calm
    beta = 0.58

    def foot(ph):
        ph %= 1.0
        if ph < beta:                                              # stance: soft landing on the ball -> flat -> heel rise
            s_ = ph / beta; y = -D * beta / 2 + D * ph
            heel = 6 * max(0, 1 - s_ / 0.12) + 30 * max(0, (s_ - 0.62) / 0.38) ** 1.5
            return y, heel, 0.0, 0.0
        s_ = (ph - beta) / (1 - beta); e = 0.5 - 0.5 * np.cos(np.pi * s_)
        y = D * beta / 2 - D * beta * e
        heel = 30 * (1 - s_) ** 2 + 8 * np.sin(np.pi * s_) ** 2 + 6 * s_ ** 3      # toe stays pointed through the swing
        return y, heel, lift * np.sin(np.pi * s_) ** 1.4, np.sin(np.pi * s_)

    def add(f, P):
        ph = f / N
        for s_, sg, off in (("L", 1, 0.0), ("R", -1, 0.5)):
            y, heel, lz, sw = foot(ph + off)
            yw = (toe_out + TOEIN["L"]) if s_ == "L" else -(toe_out + TOEIN["R"])
            P["_f" + s_] = np.array([CX + sg * (width + 0.065 * sw), y + 0.02, yw, heel, lz, 0])
        pl = ph + lead                                             # the pelvis moves first
        c2 = np.cos(4 * np.pi * (ph - 0.06)); s1 = np.sin(2 * np.pi * pl); c1 = np.cos(2 * np.pi * pl)
        P["pz"] += -0.016 - bob * c2                               # soft knees all through, low at the contacts
        P["px"] += sway * s1                                       # weight over the stance foot
        P["pry"] += -roll * s1                                     # the free hip drops
        P["prz"] += -yaw * c1                                      # hip swings forward with the leg
        P["sz"] += 0.45 * yaw * c1; P["cz"] += 0.70 * yaw * c1    # shoulders counter-rotate (stay square / slightly opposite)
        P["sy"] += 0.55 * roll * s1; P["cy"] += 0.60 * roll * s1   # ribcage counter-tilts: upright torso
        P["hz"] -= 0.12 * yaw * c1; P["hy"] -= 0.10 * roll * s1
        P["cx"] += 0.8 * c2; P["hx"] -= 0.6 * c2
        P["clL_up"] += 1.2 * c1; P["clR_up"] -= 1.2 * c1
        for s_, sg, off in (("L", 1, 0.5), ("R", -1, 0.0)):        # arm forward with the opposite leg, a beat late
            if arms and ("a" + s_) in arms: continue
            a = np.cos(2 * np.pi * (ph + off - 0.06))
            fwd = swing * (0.9 * a + 0.1) if a > 0 else swing * 0.7 * a
            P["_dt" + s_] = np.array([-sg * 0.015 * a, -fwd, 0.03 * a * a]); P["_dtsp" + s_] = "chestN"
    c.add = add
    return c


c = walk_clip("walk", 36, 0.62, 0.042, 0.06, 0.075, 0.010, 0.040, 8, 15,
              note="feminine walk, in place (1.2 s cycle like MercurialForge 12:38): hips lead with sway and rotation, upright counter-rotating torso, narrow steps near the centre line, soft knees, light toe-first steps, relaxed arm swing with soft wrists (move the character at speed_units_per_s)")
c = walk_clip("walk_shy", 40, 0.42, 0.06, 0.05, 0.035, 0.008, 0.028, 6, 10, toe_out=-1, knee_in=0.25, out=0.0,
              arms=dict(aR=REST_OUT_R, hx=8, hy=6, clL_up=3, clR_up=4), note="small shy pigeon-toed steps, knees in, hips leading softly, head down, her right fist at the chest (his_idle arm)")

# ================================================================ TALK
c = clip("talk_explain", 60, loop=True, note="talking: right hand palm-up with beats, weight on one hip, head nods on the beats, left hand soft")
TE = M(cp("L", 0.75), hy=6, aR=W("R", 0.17, -0.24, 0.99, pole=(-0.9, 0.6, -0.5), hand=H_UP), aL=hang("L", 0.0, 0.01))
c.k(0, **TE)
for f0 in (0, 20, 40):
    c.k(f0 + 5, **M(TE, aR=W("R", 0.19, -0.26, 0.955, pole=(-0.9, 0.6, -0.5), hand=((0.5, -1, 0.0), (0, 0.15, 1))), hx=6, cx=0))
    c.k(f0 + 12, **M(TE, aR=W("R", 0.16, -0.23, 1.01, pole=(-0.9, 0.6, -0.5), hand=H_UP), hx=-1))
c.k(60, **TE)
c.add = addf(br(60, 0.8), osc("hy", 3, 60, 0.2), osc("pry", 1.2, 60), osc("pz", -0.006, 20, 0.15, pos=True), osc("clR_up", 2.5, 20, 0.15, pos=True))

c = clip("talk_both", 60, loop=True, note="talking with both hands open palms-up in front of the waist, elbows in, alternating little circles, head tilting with them")
TB = M(cp("R", 0.55), clL_up=2, clR_up=2,
       aL=W("L", 0.135, -0.28, 0.985, pole=(0.45, 0.9, -0.5), hand=((0.45, -1, 0.1), (-0.15, 0.1, 1))),
       aR=W("R", 0.135, -0.28, 0.985, pole=(-0.45, 0.9, -0.5), hand=((0.45, -1, 0.1), (-0.15, 0.1, 1))))
c.k(0, **TB)


def _tb(f, P):
    a, b = wave(f, 30), wave(f, 30, 0.25)
    P["_dtL"] = np.array([0.025 * b, -0.02 * a, 0.03 * a]); P["_dtspL"] = "chestN"
    P["_dtR"] = np.array([-0.025 * (-b), 0.02 * a, -0.03 * a]); P["_dtspR"] = "chestN"
    P["hy"] += 6 * wave(f, 60); P["cy"] -= 2.5 * wave(f, 60); P["hx"] += 3 * max(0, wave(f, 15))


c.add = addf(br(60, 0.8), _tb, osc("pz", -0.007, 15, pos=True), osc("clL_up", 2.5, 15, pos=True), osc("clR_up", 2.5, 15, pos=True))

c = clip("talk_cute", 48, loop=True, note="cute talking: hands clasped under the chin, knees in, side-to-side sway with head tilts")
TC = dict(sz=-4, cz=-6, fL=Fo("L", CX + 0.09, -0.045, -8), fR=Fo("R", CX - 0.09, 0.05, -6), kL=(-0.35, -1, 0), kR=(0.3, -1, 0), clL_up=7, clR_up=7, cx=2, hx=4,
          aL=W("L", 0.035, -0.17, 1.27, pole=(0.7, 0.3, -1), hand=((-0.4, -0.2, 0.9), (-1, 0.3, 0))),
          aR=W("R", 0.03, -0.175, 1.265, pole=(-0.7, 0.3, -1), hand=((-0.4, -0.2, 0.9), (-1, 0.3, 0))))
c.k(0, **TC)
c.drag = {"L": 0.1, "R": 0.1}
c.add = addf(osc("hy", 11, 48), osc("cy", -4, 48), osc("px", 0.014, 48), osc("pry", -4, 48), osc("hz", 5, 48, 0.2), osc("pz", -0.008, 24, pos=True), br(48, 0.6))

c = one_shot(clip("talk_self", 45, note="'me?': anticipation dip, right fist taps her chest, head tilts, lean back, left hand opens out"))
c.k(6, **plus(M(B0), pz=-0.008, hx=4, cx=3))
TS = M(cp("R", 0.6), py=0.012, cx=-6, hy=13, hz=-7, hx=-3, clR_up=5, clL_up=3,
       aR=W("R", 0.045, -0.215, 1.17, pole=(-1, 0.3, -0.6), hand=H_CHEST), aL=W("L", 0.24, -0.14, 0.95, pole=(0.9, 0.7, -0.2), hand=((0.8, -0.6, -0.2), (0, -0.4, 1))))
c.k(13, **M(TS, aR=W("R", 0.045, -0.205, 1.165, pole=(-1, 0.3, -0.6), hand=H_CHEST)))
c.k(17, **M(TS, aR=W("R", 0.045, -0.235, 1.175, pole=(-1, 0.3, -0.6), hand=H_CHEST))).k(21, **TS)
c.k(45, **plus(TS, hy=2))
c.drag = {"L": 0.5, "R": 0.0}
c.add = hold_life(45, 0.7, 0.4)

# ================================================================ HEAD GESTURES
c = one_shot(clip("nod", 30, note="two soft nods with a smile, the chest and shoulders join each nod"))
DF = {k: v for k, v in c.follow.items() if not k.startswith("h")}
c.follow = dict(DF)
c.k(5, **plus(M(B0), hx=-4, cx=-1)).k(10, **plus(M(B0), hx=15, cx=3, hy=5, clL_up=-1, clR_up=-1)).k(15, **plus(M(B0), hx=-2, hy=5))
c.k(20, **plus(M(B0), hx=10, cx=2, hy=6)).k(25, **plus(M(B0), hx=0, hy=6)).k(30, **plus(M(B0), hx=1, hy=6))

c = one_shot(clip("head_shake", 36, note="'no no': head shakes with shoulder counter-sway, a little hand wave, eyes closed"))
c.follow = dict(DF)
for i, f in enumerate((8, 14, 20, 26)):
    sgn = 1 if i % 2 == 0 else -1; a = 1 - 0.18 * i
    c.k(f, **plus(M(B0), hz=15 * sgn * a, cz=-3.5 * sgn * a, hy=-3, hx=2, sz=-1 * sgn * a))
c.k(33, **plus(M(B0), hx=1)).k(36, **B0)

c = one_shot(clip("shrug", 40, note="'dunno': little dip, shoulders up, elbows in, forearms out with palms up, head tilt, hip pop, then settle"))
c.k(6, **plus(M(B0), pz=-0.01, clL_up=-3, clR_up=-3, hx=3))
SH = M(cp("L", 0.9), clL_up=17, clR_up=17, hy=15, hx=-3, cx=-4, hz=4,
       aL=W("L", 0.26, -0.16, 0.95, pole=(0.7, 0.9, -0.3), hand=H_UPOUT), aR=W("R", 0.26, -0.16, 0.95, pole=(-0.7, 0.9, -0.3), hand=H_UPOUT))
c.k(13, **plus(SH, clL_up=2, clR_up=2, hy=1)).k(18, **SH).k(27, **plus(SH, hy=2, clL_up=-1, clR_up=-1)).k(37, **B0).k(40, **B0)

# ================================================================ ARM POSES
HIPL = W("L", 0.198, 0.03, 0.968, "pelvis", pole=(1, 0.75, 0.0), hand=H_HIP)
HIPR = W("R", 0.198, 0.03, 0.968, "pelvis", pole=(-1, 0.75, 0.0), hand=H_HIP)

c = one_shot(clip("arms_crossed", 50, note="'hmph': huff in, arms cross under the bust, hip popped, chin up and head turned away (holds)"))
c.k(8, **plus(M(B0), cx=-4, clL_up=4, clR_up=4, hx=-3))
AC = M(cp("L", 1.15), hx=-8, hy=-7, hz=-14, clL_up=4, clR_up=4, cx=-3,
       aL=W("L", -0.07, -0.155, 1.055, pole=(1, 0.3, -0.8), hand=((-1, 0.1, 0.15), (0, 1, 0))),
       aR=W("R", -0.075, -0.13, 1.025, pole=(-1, 0.4, -0.8), hand=((-1, 0.2, 0.25), (0, 1, 0))))
c.k(17, **plus(AC, hz=-3, hx=-2)).k(22, **AC).k(50, **plus(AC, hz=-2))
c.drag = {"L": 0.3, "R": 0.3}
c.add = hold_life(50, 0.7, 0.5)

c = one_shot(clip("hand_on_hip", 45, note="fist on her left hip, elbow back, hip popped out, head tilts to the hip, free hand soft (holds)"))
c.k(7, **plus(M(B0), pz=-0.006))
HH = M(cp("L", 1.3), hy=11, hz=5, hx=2, clL_up=3, aL=HIPL, aR=hang("R", 0.02, 0.0))
c.k(16, **plus(HH, hy=2)).k(21, **HH).k(45, **plus(HH, hy=1))
c.drag = {"L": 0.0, "R": 0.5}
c.add = hold_life(45, 0.6, 0.4)

c = one_shot(clip("hands_on_hips", 45, note="power pose (UpNext #11): small step out, fists on hips, elbows wide, chest out, chin up, hip popped over one leg"))
PP_FEET = dict(fL=Fo("L", CX + SW + 0.045, -0.04, 16), fR=Fo("R", CX - SW, 0.045, 8))
PP = M(cp("R", 1.0, PP_FEET, heel=10, knee_in=0.2), cx=-8, hx=-10, hy=-5, clL_fw=-4, clR_fw=-4, clL_up=2, clR_up=2, aL=HIPL, aR=HIPR)
c.k(8, **M(B0, cx=-2))
c.k(13, **{k: v for k, v in M(B0, aL=HIPL, aR=HIPR, cx=-4).items() if k != "fL"})
c.k(17, **{k: v for k, v in PP.items() if k != "fL"})
c.k(20, **{k: v for k, v in plus(PP, cx=-1, hx=-1).items() if k != "fL"}).k(25, **{k: v for k, v in PP.items() if k != "fL"})
c.k(45, **{k: v for k, v in plus(PP, hx=-1).items() if k != "fL"})
c._cc = {}; c.keys = [(f, {k: v for k, v in ch.items() if k != "fL"}) for f, ch in c.keys]
step(c, "L", 8, 17, list(FEET["fL"][:3]) + [0, 0, 0], list(PP_FEET["fL"][:3]) + [0, 0, 0], 0.055).k(45, fL=tuple(list(PP_FEET["fL"][:3]) + [0, 0, 0]))
c.drag = {"L": 0.0, "R": 0.0}
c.add = hold_life(45, 0.8, 0.4)

c = one_shot(clip("think", 60, note="thinking: knuckles at the chin, other forearm across the waist under the elbow, head tilt, eyes up, finger taps"))
TH = M(cp("R", 0.85), hy=13, hx=-7, hz=7, clL_up=3,
       aR=W("R", -0.06, -0.14, 1.01, pole=(-1, 0.3, -0.8), hand=H_ACROSS), aL=W("L", 0.035, -0.13, 1.33, pole=(0.3, 0.2, -1), hand=H_CHIN))
c.k(16, **plus(TH, hy=-2)).k(22, **TH).k(40, **plus(TH, hy=3, hz=2)).k(60, **TH)
c.drag = {"L": 0.2, "R": 0.1}
c.add = addf(hold_life(60, 0.7, 0.4), lambda f, P: P.__setitem__("_dtL", np.array([0, 0, 0.006 * max(0, wave(f, 12))]) * (f > 24)))

c = one_shot(clip("surprised", 36, note="startle: fists jump up to the collarbone, shoulders up, lean back, one knee pops up, then she settles"), settle=2)
SU_FEET = dict(fL=FEET["fL"], fR=FEET["fR"])
SU = M(dict(sz=-4, cz=-6), SU_FEET, py=0.022, pz=0.004, cx=-11, hx=-8, clL_up=14, clR_up=14, kL=(-0.3, -1, 0), kR=(0.2, -1, 0),
       aL=W("L", 0.07, -0.165, 1.23, pole=(0.6, 0.2, -1), hand=H_FIST_UP), aR=W("R", 0.07, -0.165, 1.23, pole=(-0.6, 0.2, -1), hand=H_FIST_UP))
fL0 = list(FEET["fL"])
c.k(5, **M(SU, fL=(fL0[0], fL0[1], fL0[2], 40, 0.10, 0), kL=(-0.5, -1, 0.2)))
c.k(9, **M(SU, cx=-13, hx=-10, clL_up=16, clR_up=16, fL=(fL0[0], fL0[1], fL0[2], 45, 0.12, 0), kL=(-0.5, -1, 0.2)))
c.k(16, **M(SU, cx=-8, py=0.018, fL=(fL0[0], fL0[1], fL0[2], 30, 0.05, 0), kL=(-0.5, -1, 0.2)))
c.k(20, **M(SU, cx=-7, py=0.016, clL_up=10, clR_up=10, fL=(fL0[0], fL0[1], fL0[2], 12, 0.0, 0)))
c.k(36, **M(SU, cx=-5, py=0.014, clL_up=8, clR_up=8, hx=-3, fL=(fL0[0], fL0[1], fL0[2], 8, 0.0, 0)))
c.add = addf(hold_life(36, 0.9, 0.3), lambda f, P: P.__setitem__("hz", P["hz"] + (1.5 * wave(f, 5) if 12 < f < 24 else 0)))

c = one_shot(clip("sad_slump", 50, note="deflate (UpNext #8): a sigh in, then shoulders drop, chest caves, head hangs, arms limp, knees in, toe turned in (holds)"))
c.k(8, **plus(M(B0), cx=-5, clL_up=5, clR_up=5, hx=-4))
SD_FEET = dict(fL=pivot("L", FEET["fL"], -24), fR=FEET["fR"])
SD = M(cp("R", 0.5, SD_FEET, heel=20, knee_in=0.55), cx=15, sx=6, hx=25, hy=-7, clL_up=-8, clR_up=-8, clL_fw=7, clR_fw=7, pz=-0.014,
       aL=W("L", 0.17, -0.09, 0.79, "pelvis", pole=(0.4, 0.9, 0.1), hand=H_HANG), aR=W("R", 0.17, -0.09, 0.79, "pelvis", pole=(-0.4, 0.9, 0.1), hand=H_HANG))
c.k(19, **plus(SD, hx=4, cx=3, clL_up=-2, clR_up=-2)).k(27, **SD).k(50, **plus(SD, hx=2))
c.drag = {"L": 0.8, "R": 0.8}
c.add = hold_life(50, 1.3, 0.3)

c = clip("laugh", 36, loop=True, note="giggle: hand over the mouth, arm across the belly, shoulders bouncing, leaning forward, knees in")
LA = M(cp("L", 0.7), cx=9, hx=5, hy=9, hz=-5, clR_up=4,
       aR=W("R", 0.02, -0.16, 1.36, pole=(-0.4, 0.1, -1), hand=H_MOUTH), aL=W("L", -0.05, -0.16, 0.985, pole=(1, 0.3, -0.8), hand=H_ACROSS))
c.k(0, **LA)
c.drag = {"L": 0.2, "R": 0.3}
c.add = addf(osc("clL_up", 4, 9, pos=True), osc("clR_up", 4, 9, pos=True), osc("cx", 3, 9, pos=True), osc("hx", -3, 9, pos=True),
             osc("hy", 4, 36), osc("pz", -0.006, 9, pos=True), osc("pry", 2, 36))

c = clip("embarrassed", 60, loop=True, note="flustered: hands at her cheeks, shoulders up, head and hips sway side to side, knees in, toe turned in")
EM = dict(sz=-4, cz=-6, fL=Fo("L", CX + 0.09, -0.05, -14, 14), fR=Fo("R", CX - 0.09, 0.05, -4), kL=(-0.38, -1, 0), kR=(0.25, -1, 0),
          clL_up=9, clR_up=9, cx=4, hx=7, pz=-0.01,
          aL=W("L", 0.085, -0.12, 1.335, pole=(0.1, -0.35, -1), hand=H_CHEEK), aR=W("R", 0.085, -0.12, 1.335, pole=(-0.1, -0.35, -1), hand=H_CHEEK))
c.k(0, **EM)
c.drag = {"L": 0.0, "R": 0.0}; c.wrdrag = {"L": 0, "R": 0}
c.add = addf(osc("hy", 11, 60), osc("hz", 8, 60, 0.1), osc("cz", 5, 60, 0.05), osc("px", -0.012, 60), osc("pry", 4, 60), osc("cy", -3, 60))

c = one_shot(clip("sheepish", 45, note="'hehe' (UpNext #13): hand to the back of the head, head tilts into it, knee in, little scratch"))
SP = M(cp("L", 0.85), hy=-12, hx=6, hz=-4, clR_up=10,
       aR=W("R", 0.10, 0.14, 1.50, pole=(-0.7, -1, 0.4), hand=H_BACKHEAD), aL=W("L", 0.10, -0.12, 0.84, "pelvis", pole=(0.6, 0.8, -0.2), hand=H_HANG))
c.k(9, aR=W("R", 0.17, -0.10, 1.24, pole=(-0.8, 0.0, -1), hand=((0.2, -0.2, 1), (-0.5, -0.8, 0))))
c.k(15, **plus(SP, hy=-3)).k(20, **SP).k(45, **plus(SP, hy=-2))
c.drag = {"L": 0.5, "R": 0.0}
c.add = addf(hold_life(45, 0.7, 0.4), lambda f, P: (P.__setitem__("_dtR", np.array([0.01 * wave(f, 9), 0, 0.004 * wave(f, 9, 0.25)]) * (f > 20)), P.__setitem__("_dtspR", "chestN")))

c = clip("excited_bounce", 20, loop=True, note="excited: fists at the chest, bouncing on her toes, head and fists lag a beat")
EX = dict(sz=-4, cz=-6, fL=Fo("L", CX + 0.092, -0.045, -2), fR=Fo("R", CX - 0.092, 0.05, 0), kL=(-0.22, -1, 0), kR=(0.22, -1, 0), clL_up=7, clR_up=7, hy=6, cx=-2,
          aL=W("L", 0.075, -0.18, 1.14, pole=(0.5, 0.3, -1), hand=H_FIST_UP), aR=W("R", 0.075, -0.18, 1.14, pole=(-0.5, 0.3, -1), hand=H_FIST_UP))
c.k(0, **EX)
c.drag = {"L": 0.5, "R": 0.5}


def _ex(f, P):
    b = max(0.0, wave(f, 20, 0.0)); sq = max(0.0, -wave(f, 20, 0.0))
    for s in "LR": P["_f" + s] = P["_f" + s].copy(); P["_f" + s][3] = 24 * b
    P["pz"] += 0.03 * b - 0.02 * sq; P["clL_up"] += 4 * b; P["clR_up"] += 4 * b; P["hy"] += 5 * wave(f, 40); P["cx"] += 2 * sq


c.add = _ex

c = one_shot(clip("wave", 48, note="friendly wave: anticipation dip, right hand swings up beside her face palm out, wrist waggles, head tilts to it"), settle=3)
c.k(7, **plus(M(B0), pz=-0.006))
WV = lambda dx, rot: M(cp("L", 0.75), hy=-9, hx=-1, clR_up=9, aR=W("R", 0.29 + dx, -0.06, 1.48, pole=(-1, 0.3, -1), hand=((0.12 + rot, -0.2, 1), (0.25 * rot, -1, 0))))
c.k(13, **WV(0.02, 0.0))
for i, f in enumerate(range(17, 41, 6)): c.k(f, **WV(0.035 if i % 2 else -0.025, 0.45 if i % 2 else -0.35))
c.k(41, **WV(0, 0)).k(48, **B0)
c.drag = {"L": 0.5, "R": 0.15}

c = one_shot(clip("point", 40, note="points ahead to her right, other hand at her chest, leans into it"), settle=3)
PT = M(cp("L", 0.8), cx=4, cz=-14, hz=-9, sz=-6, clR_fw=7,
       aR=W("R", 0.22, -0.41, 1.24, pole=(-1, 0.4, -0.6), hand=((0.25, -1, 0.05), (0, 0, -1))), aL=W("L", -0.005, -0.19, 1.15, pole=(1, 0.3, -0.8), hand=H_CHEST))
c.k(9, **M(PT, aR=W("R", 0.24, -0.45, 1.26, pole=(-1, 0.4, -0.6), hand=((0.25, -1, 0.05), (0, 0, -1))), cx=6)).k(13, **PT).k(40, **plus(PT, hz=-1))
c.drag = {"L": 0.3, "R": 0.15}
c.add = hold_life(40, 0.7, 0.3)

c = one_shot(clip("cheer", 36, note="'yay!': crouch to load, then springs up onto her toes with arms up in a V, eyes closed, little bounce (feet stay planted)"), settle=3)
CH0 = M(B0, pz=-0.04, cx=6, hx=4, kL=(-0.3, -1, 0), kR=(0.3, -1, 0),
        aL=W("L", 0.17, 0.02, 0.86, "pelvis", pole=(0.4, 0.9, 0), hand=H_HANG), aR=W("R", 0.17, 0.02, 0.86, "pelvis", pole=(-0.4, 0.9, 0), hand=H_HANG))
fL0, fR0 = list(FEET["fL"]), list(FEET["fR"])
CH = dict(sz=-4, cz=-6, fL=(fL0[0], fL0[1], fL0[2], 26, 0, 0), fR=(fR0[0], fR0[1], fR0[2], 26, 0, 0), kL=(-0.25, -1, 0), kR=(0.25, -1, 0),
          pz=0.02, cx=-7, hx=-9, clL_up=13, clR_up=13, hy=6,
          aL=W("L", 0.30, -0.06, 1.70, pole=(1, 0.3, 0), hand=((0.3, -0.2, 1), (-0.2, -1, 0))), aR=W("R", 0.30, -0.06, 1.70, pole=(-1, 0.3, 0), hand=((0.3, -0.2, 1), (-0.2, -1, 0))))
c.k(8, **CH0).k(13, **M(CH, pz=0.03)).k(17, **M(CH, pz=0.012)).k(24, **M(CH, pz=0.022)).k(30, **M(CH, pz=0.014)).k(36, **M(CH, pz=0.017))
c.drag = {"L": 0.4, "R": 0.4}

c = one_shot(clip("facepalm", 48, note="facepalm (UpNext #13): palm to the forehead, head drops into it and shakes, other arm across the belly"))
FP = M(cp("R", 0.6), hx=17, hy=-4, cx=7, clR_up=4,
       aR=W("R", 0.025, -0.175, 1.43, pole=(-0.3, -0.2, -1), hand=((-0.5, -0.1, 0.85), (0, 1, 0.1))), aL=W("L", -0.05, -0.13, 0.99, pole=(1, 0.3, -0.8), hand=H_ACROSS))
c.k(12, **plus(FP, hx=-6)).k(17, **FP).k(26, **plus(FP, hz=7)).k(34, **plus(FP, hz=-6)).k(42, **plus(FP, hz=3)).k(48, **FP)
c.drag = {"L": 0.2, "R": 0.0}
c.add = hold_life(48, 0.9, 0.3)

# ================================================================ OBJECTS (UpNext #6, #9, #14)
HO = M(cp("R", 0.55), hx=19, cx=5, hy=5, clL_up=2, clR_up=2,
       aL=W("L", 0.05, -0.235, 0.99, pole=(0.6, 0.6, -0.6), hand=H_CUP), aR=W("R", 0.05, -0.235, 0.99, pole=(-0.6, 0.6, -0.6), hand=H_CUP))
c = clip("hold_object", 90, loop=True, note="UpNext #6: both hands cupped at the navel holding something (mug/jar/phone), looking down at it, slow hip sway")
c.k(0, **HO).k(45, **M(cp("R", 0.75), hx=20, cx=5, hy=-3, clL_up=2, clR_up=2)).k(90, **HO)
c.drag = {"L": 0.0, "R": 0.0}
c.add = br(45, 0.8)

c = one_shot(clip("drink", 60, note="sip from a cup: right hand to the mouth, head tips back, eyes closed, back down"), HO, 6)
DR = M(HO, hx=-9, cx=-3, hy=3, aR=W("R", 0.035, -0.19, 1.335, pole=(-0.8, 0.2, -1), hand=((-0.6, -0.3, 0.7), (0.1, 1, 0.3))),
       aL=W("L", 0.10, -0.19, 1.0, pole=(0.6, 0.6, -0.6), hand=H_CUP))
c.k(18, **plus(DR, hx=8)).k(23, **DR).k(42, **plus(DR, hx=-4)).k(54, **HO).k(60, **HO)
c.drag = {"L": 0.0, "R": 0.0}

c = clip("phone_look", 60, loop=True, note="UpNext #9: phone at chest height in the right hand, left thumb typing, head down, weight on one hip")
PH = M(cp("L", 0.65), hx=23, cx=5, hy=-4,
       aR=W("R", 0.035, -0.22, 1.10, pole=(-0.6, 0.6, -0.8), hand=((-0.6, -0.5, 0.5), (0, 0.6, 0.8))),
       aL=W("L", 0.015, -0.215, 1.085, pole=(0.6, 0.6, -0.8), hand=((-0.7, -0.4, 0.4), (0, 0.5, 0.9))))
c.k(0, **PH)
c.drag = {"L": 0.0, "R": 0.0}
c.add = addf(br(60, 0.7), osc("pry", 1.2, 60), lambda f, P: (P.__setitem__("_dtL", np.array([0.006 * np.sign(wave(f, 12)), 0, 0.004 * max(0, wave(f, 6))])), P.__setitem__("_dtspL", "chestN")))

c = one_shot(clip("raise_object", 40, note="UpNext #14: dip, then right arm swings straight up holding something high, left fist on the hip, chin up (holds)"), settle=3)
c.k(7, **plus(M(B0), pz=-0.01, cx=3))
RO = M(cp("L", 0.85), hx=-12, hy=-5, cx=-4, clR_up=15, aR=W("R", 0.10, -0.03, 1.87, pole=(-1, 0.4, 0), hand=((0.05, -0.15, 1), (-0.6, -0.8, 0))), aL=HIPL)
c.k(14, **M(RO, aR=W("R", 0.11, -0.04, 1.89, pole=(-1, 0.4, 0), hand=((0.05, -0.15, 1), (-0.6, -0.8, 0))))).k(18, **RO).k(40, **plus(RO, hx=-1))
c.drag = {"L": 0.0, "R": 0.1}
c.add = hold_life(40, 0.7, 0.3)

c = one_shot(clip("lean_reach", 50, note="UpNext #7: bends from the hips to offer / take something from a small character, back long, one knee soft, free hand on her thigh, looks at them"), settle=3)
LR_FEET = dict(fL=Fo("L", CX + SW, -0.035, 10), fR=Fo("R", CX - SW, 0.045, 6))
LR = M(dict(sz=-4, cz=-6), LR_FEET, prx=34, sx=8, cx=6, hx=-24, nx=-6, py=0.075, pz=-0.05, pry=4, px=-0.012, kL=(-0.35, -1, 0), kR=(0.1, -1, 0),
       aR=W("R", 0.07, -0.50, 0.70, "world", pole=(-1, 0.4, -0.2), hand=((0.1, -1, -0.2), (0, 0.1, 1))),
       aL=W("L", 0.11, -0.13, 0.62, "world", pole=(1, 0.5, 0.2), hand=((-0.3, -0.6, -0.8), (0, 0.4, -0.9))))
c.k(9, **plus(M(B0), cx=-3, hx=-3)).k(18, **plus(LR, prx=3, hx=3)).k(23, **LR).k(36, **plus(LR, hy=7, hz=4)).k(50, **plus(LR, hy=3))
c.drag = {"L": 0.0, "R": 0.3}
c.add = hold_life(50, 0.8, 0.2)

c = clip("hands_on_knees", 40, loop=True, note="UpNext #12: out of breath, bent over with hands on the knees, knees in, toes in, panting")
HK_FEET = dict(fL=Fo("L", CX + SW + 0.012, -0.02, 0), fR=Fo("R", CX - SW - 0.012, 0.035, 0))
HK = M(dict(sz=-4, cz=-6), HK_FEET, prx=38, sx=17, cx=13, hx=-30, py=0.12, pz=-0.15, kL=(0.05, -1, 0), kR=(-0.05, -1, 0),
       aL=A(C.Tr[C.BI["Thigh.L"]] + [0.015, -0.075, 0.13], "thighL", (1, 0.6, 0.3), (0, 0, 0), HD("L", (-0.3, -0.5, -0.8), (0, 0.3, -1))),
       aR=A(C.Tr[C.BI["Thigh.R"]] + [-0.015, -0.075, 0.13], "thighR", (-1, 0.6, 0.3), (0, 0, 0), HD("R", (-0.3, -0.5, -0.8), (0, 0.3, -1))))
c.k(0, **HK)
c.drag = {"L": 0.0, "R": 0.0}
c.add = addf(osc("cx", -4, 20), osc("clL_up", 4, 20), osc("clR_up", 4, 20), osc("hx", 3, 20, 0.1), osc("hy", 3, 40))

c = one_shot(clip("crouch_pickup", 50, note="squat down knees together angled to one side, hand holding the skirt, pick something up, stand back up"), settle=3)
c.cam = (24, -4.0)
CR = M(dict(sz=-4, cz=-6), pz=-0.40, py=0.05, prx=22, sx=8, cx=10, hx=-10, prz=14, pry=-3,
       fL=Fo("L", CX + SW + 0.01, -0.035, 10, 24), fR=Fo("R", CX - SW - 0.01, 0.045, 6, 34), kL=(-0.55, -1, 0.1), kR=(-0.6, -1, 0.1),
       aR=W("R", 0.05, -0.33, 0.12, "world", pole=(-1, 0.4, 0), hand=((0.1, -0.6, -1), (0, 0.3, -1))),
       aL=W("L", 0.02, -0.25, 0.42, "world", pole=(1, 0.4, 0), hand=H_LAP))
c.k(8, **plus(M(B0), pz=-0.02, cx=3)).k(18, **CR).k(24, **M(CR, aR=W("R", 0.05, -0.32, 0.105, "world", pole=(-1, 0.4, 0), hand=((0.1, -0.6, -1), (0, 0.3, -1)))))
c.k(31, **M(CR, aR=W("R", 0.05, -0.30, 0.24, "world", pole=(-1, 0.4, 0), hand=H_CUP), hx=-14))
c.k(44, **M(B0, aR=W("R", 0.05, -0.20, 0.99, pole=(-0.6, 0.6, -0.6), hand=H_CUP), hx=10)).k(50, **M(B0, aR=W("R", 0.05, -0.20, 0.99, pole=(-0.6, 0.6, -0.6), hand=H_CUP), hx=8))
c.drag = {"L": 0.0, "R": 0.2}

# ================================================================ NEW: hair tuck (feminine hand-to-hair gesture)
c = one_shot(clip("hair_tuck", 54, note="NEW: shy hair tuck: left hand rises to her cheek, slides the hair back behind the ear, head tilts into it, then the hand settles at the collarbone"))
c.k(7, **plus(M(B0), hy=-3, clL_up=2))
HT = M(cp("R", 0.9), hy=11, hz=-7, hx=5, clL_up=6, aR=hang("R", 0.01, 0.0))
c.k(15, **M(HT, aL=W("L", 0.15, -0.05, 1.43, pole=(0.5, -0.6, -0.8), hand=((-0.15, 0.1, 1), (-1, 0.1, 0)))))
c.k(24, **M(HT, hy=13, aL=W("L", 0.15, 0.025, 1.44, pole=(0.55, -0.4, -0.8), hand=((-0.1, 0.8, 0.6), (-1, 0, 0.1)))))
c.k(30, **M(HT, hy=11, hz=-6, aL=W("L", 0.11, -0.13, 1.33, pole=(0.7, 0.0, -1), hand=((-0.3, -0.2, 1), (-0.6, 0.8, 0)))))
c.k(37, **M(HT, hy=10, hz=-5, aL=W("L", 0.045, -0.15, 1.20, pole=(0.9, 0.4, -0.8), hand=H_CHEST)))
c.k(54, **M(HT, hy=9, hz=-4, aL=W("L", 0.045, -0.155, 1.19, pole=(0.9, 0.4, -0.8), hand=H_CHEST)))
c.drag = {"L": 0.2, "R": 0.5}
c.add = hold_life(54, 0.7, 0.4)
c.face(0, "open", "neutral"); c.face(9, "soft+blush", "softSmile+blush"); c.face(30, "blink+blush", "softSmile+blush")
c.face(33, "shy+blush", "softSmile+blush")

"""Blender (exec'd inside build.py): isolated self-check stills of the NEW #5 props on a plain grey floor -> review/iso/.
bowls (food / empty, 3/4 + side + top), lamppost (whole + base + lantern), towel + treats, headline cards, glasses, newspaper.
/Applications/Blender.app/Contents/MacOS/Blender -b -P build.py -- exec tools/props5_iso.py"""
import os
OUTD = os.path.join(H, "review", "iso"); os.makedirs(OUTD, exist_ok=True)
reset()
X0, Y0 = 0.0, -25.0                                                    # an empty spot behind the living room (y = -60 is the back sky)
fl = K.box("iso_floor", (8, 8, 0.02), (X0, Y0, -0.02), mcol("#8C8C8C"))
bk = K.plane("iso_back", 8, 5, (X0, Y0 + 2.5, 2.5), mat=mcol("#B4B4B4")); bk.rotation_euler = (math.pi / 2, 0, math.pi)
GL = card("iso_glasses", "glasses", 0.06, (0, -40, 0)); NP = card("iso_paper", "newspaper", 0.3, (0, -40, 0))
shots = []


def snap(name, pos, aim, lens=40):
    cam(pos, aim, lens); p = os.path.join(OUTD, f"p5_{name}.png"); render(p, (480, 480)); shots.append(p)


put(BOWL_F, (X0 - 0.15, Y0, 0)); put(BOWL_E, (X0 + 0.15, Y0, 0))
snap("bowls_34", (X0 + 0.0, Y0 - 0.75, 0.45), (X0, Y0, 0.03))
snap("bowls_side", (X0, Y0 - 0.9, 0.04), (X0, Y0, 0.04))
snap("bowls_top", (X0, Y0 - 0.01, 0.75), (X0, Y0, 0.0))
for o in (BOWL_F, BOWL_E):
    o.location = (0, -40, 0)
lp = LAMP_OBJS
for o in lp:
    o.location.x += X0 - LAMP[0]; o.location.y += Y0 - LAMP[1]
snap("lamppost", (X0 + 0.3, Y0 - 3.2, 1.6), (X0, Y0, 1.75), 24)
snap("lamp_base", (X0 + 0.5, Y0 - 1.2, 0.5), (X0, Y0, 0.4))
snap("lamp_head", (X0 + 0.6, Y0 - 1.3, 3.1), (X0, Y0, 3.2))
for o in lp:
    o.location.x -= X0 - LAMP[0]; o.location.y -= Y0 - LAMP[1]
put(TOWEL, (X0, Y0, 0), 0.3)
for k, o in enumerate(TREATS):
    o.location = (X0 - 0.45 + 0.4 * k, Y0 - 0.35, 0.035); o.rotation_euler = (math.pi / 2, 0, 0); hide(o, False)
for k, o in enumerate(TREAT_BITS):
    o.location = (X0 - 0.4 + 0.1 * k, Y0 - 0.5, 0.005); o.rotation_euler = (0, 0, 0.5 * k); hide(o, False)
snap("towel_treats", (X0 + 0.3, Y0 - 1.4, 0.7), (X0, Y0 - 0.15, 0.0), 32)
snap("towel_low", (X0 - 0.2, Y0 - 1.3, 0.12), (X0, Y0 - 0.2, 0.05), 32)
put(TOWEL, (0, -40, 0)); [hide(o, True) for o in TREATS + TREAT_BITS]
for k, (key_, c) in enumerate(NEWS.items()):
    c.location = (X0 - 0.25 + 0.5 * k, Y0, 0.4); c.rotation_euler = (math.pi / 2, 0, 0); hide(c, False)
snap("headlines", (X0, Y0 - 1.6, 0.4), (X0, Y0, 0.4), 40)
for c in NEWS.values():
    hide(c, True)
GL.location = (X0 - 0.15, Y0, 0.03 + 0.025); NP.location = (X0 + 0.15, Y0 + 0.05, 0.15)
snap("glasses_paper", (X0, Y0 - 0.75, 0.16), (X0, Y0, 0.12), 40)
print("props5 stills", len(shots), "-> sheet: venv tools/rawsheet-style join in review/iso/props5_sheet.jpg")

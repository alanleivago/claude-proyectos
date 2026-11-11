"""Blender (exec'd inside build.py): isolated self-check stills of the NEW characters + the new set -> review/iso/.
- rival: the white fluffy park dog alone (front, 3/4, side, back, 3/4 back, head close-up) on a plain floor
- plush: the stuffed fake dog alone (side, 3/4, front, back, top, lying on its side) + its bark / wag poses
- park:  the DOG PARK set, empty, from four corners + dog height
/Applications/Blender.app/Contents/MacOS/Blender -b -P build.py -- exec tools/iso_check.py <rival|plush|park>"""
import math, os
WHAT = ARGS[2] if len(ARGS) > 2 else "rival"
OUTD = os.path.join(H, "review", "iso"); os.makedirs(OUTD, exist_ok=True)
reset()


def solo(keep):
    """hide every mesh except keep (and a plain grey floor)."""
    for o in bpy.data.objects:
        if o.type == "MESH" and o not in keep:
            o.hide_render = True


def shot(name, pos, tgt, lens=35, res=(540, 540)):
    cam(pos, tgt, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)
    render(os.path.join(OUTD, f"{WHAT}_{name}.png"), res)


if WHAT == "rival":
    dd = dog(1, (0, -20, 0), 0.0, "happy", 0.3); D.happy_wag(dd["arm"], 0.3, 1.0, 4.4, up=0.25)
    for s_ in ("tail1", "tail2"):
        D.rotl(dd["arm"], s_, [((1, 0, 0), 0.5)])
    fl = box("iso_floor", (4, 4, 0.02), (0, -20, -0.02), mcol("#9A968C"))
    solo([DOGS[1]["o"], DOGS[1]["sh"], fl])
    c = Vector((0, -20, 0.32))
    for nm, off in (("front", (0, -1.7, 0.25)), ("f34", (1.2, -1.2, 0.25)), ("side", (1.7, 0, 0.2)), ("back", (0, 1.7, 0.3)), ("b34", (-1.2, 1.2, 0.3))):
        shot(nm, tuple(c + Vector(off)), tuple(c), 35)
    shot("head", tuple(c + Vector((0.45, -0.75, 0.2))), tuple(c + Vector((0, -0.25, 0.15))), 40)
elif WHAT == "plush":
    fl = box("iso_floor", (4, 4, 0.02), (0, -20, -0.02), mcol("#9A968C"))
    solo(PLUSH_PARTS + [fl])
    c = Vector((0, -20, 0.16))
    plush((0, -20, 0), 0.0, 0.05, 0.0)
    for nm, off in (("side", (1.1, 0, 0.05)), ("f34", (0.8, -0.8, 0.15)), ("front", (0, -1.1, 0.1)), ("back", (0, 1.1, 0.1)),
                    ("top", (0.3, -0.3, 1.0)), ("b34", (-0.8, 0.8, 0.15))):
        shot(nm, tuple(c + Vector(off)), tuple(c), 35)
    plush((0, -20, 0), 0.0, 0.05, 1.0); shot("bark", tuple(c + Vector((1.1, 0, 0.05))), tuple(c), 35)
    plush((0, -20, 0.085), 0.0, 0.05, 0.0, roll=math.pi / 2); shot("lying", tuple(c + Vector((0.2, -1.1, 0.25))), tuple(c - Vector((0, 0, 0.08))), 35)
elif WHAT == "park":
    for nm, pos, tgt in (("wide_n", (PX, PY - 4.5, 1.6), (PX, PY + 5, 0.8)), ("dog_eye", (PX - 1.5, PY - 1.0, 0.5), (PX + 1.0, PY + 6, 0.6)),
                         ("corner", (PX + 5.5, PY - 3.0, 1.4), (PX - 2, PY + 5, 0.7)), ("sign", (PX + 0.3, PY + 3.4, 0.9), (PX + 0.9, PY + 5.9, 1.2)),
                         ("dispenser", (PX - 3.6, PY + 3.8, 0.8), (PX - 4.6, PY + 5.5, 0.8)), ("back", (PX + 1, PY + 5.5, 1.2), (PX, PY - 5, 1.0))):
        shot(nm, pos, tgt, 24, (540, 960))

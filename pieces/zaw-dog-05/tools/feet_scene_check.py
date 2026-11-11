# run inside build.py:  Blender -b -P build.py -- exec tools/feet_scene_check.py  -> review/people3/feetscene_*.png
# ankle-in-shoe fit in the real poses: owner on the sofa, owner on the bedroom floor, stranger in the armchair,
# owner walking (10a); side + 3/4 close-ups at shoe height.
OUTD = os.path.join(H, "review", "people3"); os.makedirs(OUTD, exist_ok=True)


def shoot(name, P, pose, sideoff, off34):
    reset(); pose()
    for o in LR_CT:
        hide(o, True)
    bpy.context.view_layer.update()
    c = (bone_w(P, "foot.L") + bone_w(P, "foot.R")) / 2 + Vector((0, 0, -0.02))
    for k, off in enumerate((sideoff, off34, (0.0, -0.9, 0.2))):
        cam(tuple(c + pvec(P, off)), tuple(c), 35); render(os.path.join(OUTD, f"feetscene_{name}_{k}.png"), (360, 360))


shoot("sofa", OWNER, lambda: owner_sofa(0.3), (0.85, 0.0, 0.12), (0.55, -0.6, 0.25))
shoot("floor", OWNER, lambda: owner_floor(0.2), (0.85, 0.0, 0.12), (0.55, -0.6, 0.25))
shoot("chair", STR, lambda: sit(STR, STR_CHAIR, math.pi / 2, ARM_SEAT_Z, lean=0.3), (-0.85, 0.0, 0.12), (-0.55, -0.6, 0.25))
shoot("walk", OWNER, lambda: b10a(0.55, 1.33), (0.85, 0.0, 0.12), (0.55, -0.6, 0.25))
print("feet scene done")

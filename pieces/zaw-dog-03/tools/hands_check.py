# run inside build.py:  Blender -b -P build.py -- exec tools/hands_check.py   -> review/people3_hands.jpg
# close-ups of every hand pose the board uses, in the scene: tissue fist at the eye, open palms over the face,
# palm-down hand held out to the dog, arms open; front 3/4 and side, so floating / detached hands would show.
OUTD = os.path.join(H, "review", "people3"); os.makedirs(OUTD, exist_ok=True)
shots = []


def snap(name, pose, views):
    for k, (off, tgt_bone) in enumerate(views):
        reset(); pose(); bpy.context.view_layer.update()
        P_, bn = tgt_bone; c = bone_w(P_, bn) + pvec(P_, (0, -0.1, 0.05))
        cam(tuple(c + pvec(P_, off)), tuple(c), 30); p_ = os.path.join(OUTD, f"hands_{name}_{k}.png"); render(p_, (400, 400)); shots.append(p_)


def p_tissue():
    for o in LR_CT: hide(o, True)
    owner_sofa(0.32); OWNER.rot("head", [((1, 0, 0), 0.25)]); cry_tissue(OWNER, "R"); hands_lap(OWNER, "L")


def p_face():
    for o in LR_CT: hide(o, True)
    owner_sofa(0.35); OWNER.rot("head", [((1, 0, 0), 0.3)]); hands_on_face(OWNER)


def p_str():
    for o in LR_CT: hide(o, True)
    b08b(1.0, 1.6)
    hide(DOGS[0]["o"], True); hide(DOGS[0]["sh"], True)


def p_open():
    for o in LR_CT: hide(o, True)
    owner_sofa(0.05); arms_open(OWNER, 1.0)


snap("tissue", p_tissue, [((0.35, -0.6, 0.0), (OWNER, "head")), ((0.7, 0.0, 0.0), (OWNER, "head"))])
snap("face", p_face, [((0.3, -0.6, 0.0), (OWNER, "head")), ((0.7, 0.05, 0.0), (OWNER, "head"))])
snap("stranger", p_str, [((-0.2, -0.75, 0.0), (STR, "chest")), ((0.6, -0.4, 0.1), (STR, "chest"))])
snap("open", p_open, [((0.0, -1.3, 0.0), (OWNER, "chest")), ((0.9, -0.6, 0.1), (OWNER, "chest"))])
print('hands done', len(shots))

"""Biblioteca de animaciones de zero_fem (estilo PS1 / Megaman Legends), hecha 100 % por script.

  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b out/zero_fem.blend --python anim/build_anim.py

Lee out/zero_fem.blend (no lo guarda), copia la pose Render3 de assets/ (solo lectura) y escribe:
  anim/zero_anim.blend   acciones con fake user + una pista NLA por accion
  anim/zero_anim.glb     una animacion glTF con nombre por accion (muestreada: el IK queda en los huesos)
  anim/face_tracks.json  [frame, ojos, boca] por accion
  anim/actions.json      frames, loop, zancada (lo usa viewer.html y el README)

Ejes (armature = mundo): el personaje mira a -Y, Z arriba, +X = su izquierda (huesos .L).
Angulos (grados) en ejes del armature: pitch +X = inclinar hacia delante / punta del pie abajo,
roll +Y = inclinar hacia +X (su izquierda), yaw +Z = girar la cara hacia +X.
Vectores de brazo/pie por lado: (afuera, adelante, arriba); se espejan solos para .R.
"""
import bpy, sys, os, math, json
from mathutils import Vector, Quaternion, Matrix
from bpy_extras import anim_utils

HERE = os.path.dirname(os.path.abspath(__file__))
ASSET = os.path.join(HERE, "..", "..", "..", "assets", "crashsune", "MegamanLegendsModel", "ZeroVolnutt.blend")
OUTD = os.environ.get("ZF_OUT", HERE)   # v2 body: ZF_OUT=v2/anim (default: anim/, unchanged)
V2 = bool(os.environ.get("ZF_V2"))       # v2 only: the extra feminine expression actions
FPS = 30
sc = bpy.context.scene
sc.render.fps = FPS
arm = bpy.data.objects["Armature"]
PB = arm.pose.bones
BONES = [b.name for b in arm.data.bones]
REST = {b.name: b.matrix_local.to_3x3() for b in arm.data.bones}
HEAD0 = {b.name: b.head_local.copy() for b in arm.data.bones}
TAIL0 = {b.name: b.tail_local.copy() for b in arm.data.bones}
FLOOR = -9.0          # suela (z minima de la malla)
ANKLE = HEAD0["FootControl.L"].z


def sgn(side): return 1 if side == "L" else -1


def V(side, v):
    """(afuera, adelante, arriba) -> vector del armature para ese lado"""
    return Vector((v[0] * sgn(side), -v[1], v[2]))


def q(p=0, r=0, y=0):
    R = math.radians
    return Quaternion((0, 0, 1), R(y)) @ Quaternion((0, 1, 0), R(r)) @ Quaternion((1, 0, 0), R(p))


def unit(v):
    v = Vector(v); return v.normalized() if v.length > 1e-9 else Vector((0, 0, 1))


def rotdiff(a, b): return unit(a).rotation_difference(unit(b))


def frame(a, n):
    a = unit(a); n = unit(n - a * a.dot(n)); return Matrix((a, n, a.cross(n))).transposed()


def to_local(bone, q_arm=None, v_arm=None):
    R = REST[bone]; Rq = R.to_quaternion()
    ql = Rq.inverted() @ q_arm @ Rq if q_arm is not None else Quaternion()
    vl = R.inverted() @ Vector(v_arm) if v_arm is not None else Vector()
    return vl, ql


# ---------------------------------------------------------------- pose -> valores locales
def arm_q(side, spec):
    U, F, H = f"UpperArm.{side}", f"Forearm.{side}", f"Hand.{side}"
    S = HEAD0[U]
    r_u, r_f, r_h = [unit(TAIL0[b] - HEAD0[b]) for b in (U, F, H)]
    a, b = (TAIL0[U] - HEAD0[U]).length, (TAIL0[F] - HEAD0[F]).length
    if "ik" in spec:                                   # IK analitico de 2 huesos (codo hacia 'pole')
        T = S + V(side, spec["ik"]); d = T - S
        dist = min(d.length, (a + b) * 0.999); u = unit(d)
        p = V(side, spec.get("pole", (0.3, -1, -0.2)))
        v = unit(p - u * u.dot(p))
        al = math.acos(max(-1, min(1, (a * a + dist * dist - b * b) / (2 * a * dist))))
        E = S + a * (math.cos(al) * u + math.sin(al) * v)
        d_u, d_f = unit(E - S), unit(S + u * dist - E)
    else:
        d_u = unit(V(side, spec["up"])); d_f = unit(V(side, spec.get("fore", spec["up"])))
        if "pole" in spec: p = V(side, spec["pole"])
        else:
            p = -(d_f - d_u * d_u.dot(d_f))
            if p.length < 0.05: p = V(side, (0, -1, 0))   # brazo recto: codo hacia atras
    p = p - d_u * d_u.dot(p)
    n_rest = r_u.cross(Vector((0, -1, 0)))
    n_act = d_u.cross(-unit(p))
    Du = (frame(d_u, n_act) @ frame(r_u, n_rest).transposed()).to_quaternion()
    Du = Quaternion(d_u, math.radians(spec.get("ut", 0)) * sgn(side)) @ Du
    Df = rotdiff(Du @ r_f, d_f) @ Du
    Df = Quaternion(d_f, math.radians(spec.get("ft", 0)) * sgn(side)) @ Df
    d_h = unit(V(side, spec["hand"])) if "hand" in spec else Df @ r_h
    Dh = rotdiff(Df @ r_h, d_h) @ Df
    Dh = Quaternion(d_h, math.radians(spec.get("ht", 0)) * sgn(side)) @ Dh
    return {U: Du, F: Du.inverted() @ Df, H: Df.inverted() @ Dh}


GRIP = 0.8      # centro del puno a lo largo del hueso Hand (desde la muneca)


def world_spec(side, spec, P):
    """gw/iw = punto en el MUNDO (afuera, adelante, arriba absolutos), gc = punto en el marco del pecho (coords de reposo),
    hw/pw = direcciones de mano/codo en el mundo. Convierte todo al marco del pecho ('ik', 'hand', 'pole')."""
    if not any(k in spec for k in ("gw", "iw", "hw", "pw", "gc")): return spec
    pel = P["pel"]; Qp = q(*pel.get("rot", (0, 0, 0))); Qc = q(*P.get("chest", (0, 0, 0)))
    Lp = Vector(pel.get("loc", (0, 0, 0))); Hp = HEAD0["Pelvis"]; Hc = HEAD0["Chest"]
    S = HEAD0[f"UpperArm.{side}"]
    pt = lambda w: Hc + Qc.inverted() @ (Qp.inverted() @ (V(side, w) - Lp - Hp) - (Hc - Hp))
    dr = lambda d: (Qp @ Qc).inverted() @ V(side, d)
    back = lambda v: (v[0] * sgn(side), -v[1], v[2])
    s = dict(spec)
    if "hw" in s: s["hand"] = back(dr(s.pop("hw")))
    if "pw" in s: s["pole"] = back(dr(s.pop("pw")))
    c = pt(s.pop("gw")) if "gw" in s else (V(side, s.pop("gc")) if "gc" in s else None)
    if c is not None:
        hd = unit(V(side, s["hand"])) if "hand" in s else unit(c - S)
        s["ik"] = back(c - hd * GRIP - S)
    if "iw" in s: s["ik"] = back(pt(s.pop("iw")) - S)
    return s


def foot_pts(side):
    """talon y punta (en la suela) relativos al tobillo, medidos en la malla"""
    A = HEAD0[f"FootControl.{side}"]
    return Vector((0, -1.99, FLOOR)) - Vector((0, A.y, A.z)), Vector((0, 1.06, FLOOR)) - Vector((0, A.y, A.z))


def compile_pose(P):
    raw = {}
    pel = P["pel"]
    raw["Pelvis"] = to_local("Pelvis", q(*pel.get("rot", (0, 0, 0))), Vector(pel.get("loc", (0, 0, 0))))
    for bone, k in (("Chest", "chest"), ("Neck", "neck"), ("Head", "head")):
        raw[bone] = to_local(bone, q(*P.get(k, (0, 0, 0))))
    for side in "LR":
        for bone, qa in arm_q(side, world_spec(side, P["arm" + side], P)).items():
            raw[bone] = to_local(bone, qa)
        f = P["foot" + side]
        pit, rol, yaw = f.get("rot", (0, 0, 0))
        qa = q(pit, rol * sgn(side), yaw * sgn(side))
        loc = V(side, f.get("loc", (0, 0, 0)))
        piv = f.get("piv", "auto")
        if piv == "auto": piv = "toe" if pit > 1e-6 else ("heel" if pit < -1e-6 else None)
        if piv:
            toe, heel = foot_pts(side); t = toe if piv == "toe" else heel
            qy = q(0, rol * sgn(side), yaw * sgn(side)); qp = q(pit, 0, 0)
            loc = loc + qy @ (t - qp @ t)                    # pivota solo el pitch sobre punta/talon
        raw[f"FootControl.{side}"] = to_local(f"FootControl.{side}", None, loc)
        raw[f"FootRotation.{side}"] = to_local(f"FootRotation.{side}", qa)
        raw[f"FootPoleTarget.{side}"] = to_local(f"FootPoleTarget.{side}", None, V(side, P.get("pole" + side, (0, 0, 0))))
    out = {}
    for b in BONES:
        if b in raw: out[b] = (raw[b][0], raw[b][1], Vector((1, 1, 1)))
        else: out[b] = (Vector(), Quaternion(), Vector((1, 1, 1)))
    return out


def deep(d, upd):
    d = {k: (dict(v) if isinstance(v, dict) else v) for k, v in d.items()}
    for k, v in upd.items():
        if isinstance(v, dict) and isinstance(d.get(k), dict) and not k.startswith("arm"): d[k] = deep(d[k], v)
        else: d[k] = v
    return d


# ---------------------------------------------------------------- pose base (femenina, peso en la pierna R)
ARM_DOWN = {"ik": (1.15, 0.35, -2.85), "pole": (0.35, -1, 0), "hand": (0.45, 0.25, -1), "ft": -10}
BASE = {
    "pel": {"loc": (-0.22, 0, -0.2), "rot": (1, 4, -5)},
    "chest": (-2, -5, 6), "neck": (0, 1, 0), "head": (3, 4, -3),
    "armL": dict(ARM_DOWN), "armR": dict(ARM_DOWN, ik=(1.05, 0.25, -2.9)),
    "footL": {"loc": (-0.2, 0.55, 0), "rot": (0, 0, 14)},
    "footR": {"loc": (0.0, -0.05, 0), "rot": (0, 0, 8)},
    "poleL": (0, 0, 0), "poleR": (0, 0, 0),
}


def P(**upd): return deep(BASE, upd)


REST_POSE = {b: (Vector(), Quaternion(), Vector((1, 1, 1))) for b in BONES}


def raw_mix(A, B, t, keep_feet=True):
    """interpola (t>1 extrapola = overshoot). Los controles de pie siguen a B si keep_feet."""
    out = {}
    for b in BONES:
        la, qa, sa = A[b]; lb, qb, sb = B[b]
        if keep_feet and b.startswith(("FootControl", "FootPoleTarget", "FootRotation")) and (t > 1 or t < 0):
            out[b] = B[b] if t > 1 else A[b]; continue
        if qa.dot(qb) < 0: qb = -qb
        dq = qb @ qa.inverted(); ax, ang = dq.to_axis_angle()
        out[b] = (la.lerp(lb, t), Quaternion(ax, ang * t) @ qa, sa.lerp(sb, t))
    return out


def load_action_raw(act):
    vals = {b: [Vector(), Quaternion(), Vector((1, 1, 1))] for b in BONES}
    for slot in act.slots:
        cb = anim_utils.action_get_channelbag_for_slot(act, slot)
        if not cb: continue
        for fc in cb.fcurves:
            b = fc.data_path.split('"')[1]; prop = fc.data_path.rsplit(".", 1)[1]
            v = fc.evaluate(fc.keyframe_points[0].co.x)
            idx = {"location": 0, "rotation_quaternion": 1, "scale": 2}.get(prop)
            if idx is not None and b in vals: vals[b][idx][fc.array_index] = v
    return {b: (l, r.normalized(), s) for b, (l, r, s) in vals.items()}


# ---------------------------------------------------------------- keys
def new_action(name):
    old = bpy.data.actions.get(name)
    if old: bpy.data.actions.remove(old)
    a = bpy.data.actions.new(name); a.use_fake_user = True
    arm.animation_data.action = a
    return a


def fcurves(act):
    return anim_utils.action_get_channelbag_for_slot(act, arm.animation_data.action_slot).fcurves


def put(b, f, val, prev):
    l, r, s = val; pb = PB[b]
    if b in prev and prev[b].dot(r) < 0: r = -r      # continuidad de signo del cuaternion
    prev[b] = r
    pb.location, pb.rotation_quaternion, pb.scale = l, r, s
    for path in ("location", "rotation_quaternion", "scale"):
        pb.keyframe_insert(path, frame=f, group=b)


LAG_DEFAULT = {"Neck": 1, "Head": 2, "UpperArm": 1, "Forearm": 2, "Hand": 3}


def lag_of(b, lag):
    for k, v in lag.items():
        if b.startswith(k): return v
    return 0


def build(name, keys, N, loop=False, lag=None, interp="AUTO_CLAMPED", per_frame=False):
    """keys = [(frame, raw)]; one-shot: primera y ultima key fijas, las intermedias se retrasan 'lag' frames.
    loop: frame N+1 = frame 1, todas las keys de un hueso se desplazan y el modificador Cycles las envuelve."""
    lag = LAG_DEFAULT if lag is None else lag
    act = new_action(name)
    prev = {}
    for b in BONES:
        if b == "Hair": continue
        lg = lag_of(b, lag); prev = {}
        for i, (f, raw) in enumerate(keys):
            ff = f
            if loop: ff = f + lg
            elif 0 < i < len(keys) - 1:
                nxt = keys[i + 1][0]
                ff = min(f + lg, nxt - 1 if i + 1 < len(keys) - 1 else nxt - 0.5)
            put(b, ff, raw[b], prev)
    for fc in fcurves(act):
        for kp in fc.keyframe_points:
            if per_frame: kp.interpolation = "LINEAR"
            kp.handle_left_type = kp.handle_right_type = ("AUTO" if loop else interp)
        if loop: fc.modifiers.new("CYCLES")
        fc.update()
    act.use_frame_range = True
    act.frame_start, act.frame_end = 1, N + 1 if loop else N
    act.use_cyclic = loop
    hair_spring(act, N, loop, grav=HAIR_GRAV.get(name, 0.7))   # ep04: lying -> the ponytail follows the head (lies on the pillow)
    LIB[name] = dict(frames=N, loop=loop, fps=FPS)
    return act


# ---------------------------------------------------------------- pelo con muelle (movimiento secundario)
BACK_MIN = 0.3        # componente minima hacia atras (+Y del pecho) de la coleta, que ahora cuelga (feminize.py)


HAIR_GRAV = {}
_LIE_H, _SIT_H = tuple(map(float, os.environ.get('ZF_LIEH', '0.32,-0.9,0.02').split(','))), (0.0, 0.88, -0.42)
def _wake_h(f): k = min(1, max(0, (f - 6) / 11)); return tuple(a + (b - a) * k for a, b in zip(_LIE_H, _SIT_H))
HAIR_DIR = {'sleep_lie': lambda f: _LIE_H, 'slap_snooze': lambda f: _LIE_H, 'wake_sit_up': _wake_h}


def hair_spring(act, N, loop, k_hz=2.2, zeta=0.32, gain=1.0, clamp=45, grav=0.7):
    arm.animation_data.action = act
    if HAIR_DIR.get(act.name): clamp = 180   # ep04: the forced pillow direction must not be clamped to the head-follow cone
    hb = "Hair"; H0, T0 = HEAD0[hb], TAIL0[hb]; L = (T0 - H0).length
    rest_dir_head = REST["Head"].inverted() @ (T0 - H0).normalized()
    frames = list(range(1, N + 2)) if loop else list(range(1, N + 1))
    seq = []
    for f in frames:
        sc.frame_set(f)
        M = arm.pose.bones["Head"].matrix                     # armature space, posado
        Dh = (M.to_3x3() @ REST["Head"].inverted()).to_quaternion()
        root = arm.pose.bones[hb].head.copy()
        rw = REST["Head"] @ rest_dir_head; fd = Dh @ rw
        g = unit(Vector((fd.x, fd.y, fd.z * (1 - grav) + rw.z * grav)))   # la gravedad la mantiene en su caida de reposo
        hd = HAIR_DIR.get(act.name)
        if hd: g = unit(Vector(hd(f)))   # ep04: lying/sitting in bed -> the ponytail lies back on the pillow / mattress
        Dc = (arm.pose.bones["Chest"].matrix.to_3x3() @ REST["Chest"].inverted()).to_quaternion()
        seq.append((Dh, root, root + g * L, root + fd * L, Dc))
    w = 2 * math.pi * k_hz; c = 2 * zeta * w; dt = 1 / FPS / 4
    reps = 4 if loop else 1
    p = seq[0][2].copy(); vel = Vector(); out = []
    period = len(seq) - 1 if loop else len(seq)
    for r in range(reps):
        for i in range(period):
            tgt = seq[i][2]; tgt_n = seq[(i + 1) % len(seq)][2] if loop else seq[min(i + 1, len(seq) - 1)][2]
            tv = (tgt_n - tgt) * FPS
            for s in range(4):
                tt = tgt.lerp(tgt_n, s / 4)
                acc = (tt - p) * w * w - (vel - tv) * c
                vel += acc * dt; p += vel * dt
            if r == reps - 1: out.append(p.copy())
    # p ya avanzado: out[i] corresponde al frame i+1 (posicion al final del paso) -> desplazar 1
    out = [out[-1]] + out[:-1] if loop else [seq[0][2]] + out[:-1]
    prev = {}
    fc_old = [fc for fc in fcurves(act) if fc.data_path.startswith('pose.bones["Hair"]')]
    for fc in fc_old: fcurves(act).remove(fc)
    vals = []
    for i, f in enumerate(frames[:period]):
        Dh, root, tgt, fol, Dc = seq[i]
        want = unit((out[i] - tgt) * gain + (tgt - root))
        wc = Dc.inverted() @ want                             # coleta colgando: nunca hacia dentro de la espalda
        if wc.y < BACK_MIN and not HAIR_DIR.get(act.name):
            wc.y = BACK_MIN; want = Dc @ unit(wc)
        cur = unit(fol - root)
        dq = rotdiff(cur, want); ax, ang = dq.to_axis_angle()
        dq = Quaternion(ax, max(-math.radians(clamp), min(math.radians(clamp), ang)))
        qa = Dh.inverted() @ dq @ Dh
        vals.append(to_local(hb, qa)[1])
    if loop: vals.append(vals[0])
    for f, ql in zip(frames, vals):
        put(hb, f, (Vector(), ql, Vector((1, 1, 1))), prev)
    for fc in fcurves(act):
        if fc.data_path.startswith('pose.bones["Hair"]'):
            for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
            if loop: fc.modifiers.new("CYCLES")


LIB = {}
FACE = {}


# ================================================================ helpers de autoria
def C(P0): return compile_pose(P0)


def swing(v, deg):
    """gira un vector (afuera, adelante, arriba) en el plano adelante/arriba; + = hacia atras"""
    o, f, u = v; d = math.radians(deg)
    return (o, f * math.cos(d) + u * math.sin(d), -f * math.sin(d) + u * math.cos(d))


def oneshot(name, target, N=40, antic=None, t_antic=5, t_hit=12, over=1.12, t_settle=19, start=None, lag=None):
    """reposo -> anticipacion -> pose con overshoot -> asentar -> hold hasta N"""
    A = C(BASE) if start is None else start
    B = target if isinstance(target, dict) and "Pelvis" in target else C(target)
    K = antic if antic is not None else raw_mix(A, B, -0.12)
    keys = [(1, A), (t_antic, K), (t_hit, raw_mix(A, B, over)), (t_settle, B), (N, B)]
    return build(name, keys, N, lag=lag)


def face(name, keys): FACE[name] = [[int(f), e, m] for f, e, m in keys]


def blinks(N, every=100, start=40, eyes="open", mouth="neutral", base=None):
    """parpadeo open->half->blink->half->open en 4 frames"""
    out = list(base or [[1, eyes, mouth]])
    f = start
    while f + 4 < N:
        out += [[f, "half", None], [f + 1, "blink", None], [f + 3, "half", None], [f + 4, eyes, None]]
        f += every
    out.sort(key=lambda k: k[0])
    m = out[0][2]
    res = []
    for fr, e, mo in out:
        m = mo if mo is not None else m
        res.append([fr, e, m])
    return res


# ================================================================ acciones
def A_idle():
    N = 50
    a = C(BASE)
    inhale = P(pel={"loc": (-0.24, 0, -0.26), "rot": (1, 4.6, -5)}, chest=(-4, -5.5, 6), neck=(-1, 1, 0), head=(5, 5, -3),
               armL=dict(ARM_DOWN, ik=(1.25, 0.3, -2.75)), armR=dict(ARM_DOWN, ik=(1.15, 0.2, -2.8)))
    build("idle", [(1, a), (26, C(inhale)), (51, a)], N, loop=True,
          lag={"Neck": 2, "Head": 4, "UpperArm": 3, "Forearm": 4, "Hand": 6})
    face("idle", blinks(N, every=110, start=30))


def periodic(vals, u):
    n = len(vals); x = (u % 1.0) * n; i = int(math.floor(x)); t = x - i
    p0, p1, p2, p3 = vals[(i - 1) % n], vals[i % n], vals[(i + 1) % n], vals[(i + 2) % n]
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)


WALK_S = 1.8          # medio paso (unidades): pie delantero +S, trasero -S
WALK_IN = 0.25        # pies hacia la linea central (andar femenino)


def stance_spec(u):
    """apoyo, u en [0, 0.5]: el punto de contacto retrocede a velocidad constante (sin deslizar)"""
    S = WALK_S
    p = S - 4 * S * u
    th = periodic_lin([(0, -20), (0.1, 0), (0.32, 0), (0.42, 10), (0.5, 26)], u)
    return {"loc": (-WALK_IN, p, 0), "rot": (th, 0, 8)}


def walk_foot(u):
    """pose de un pie en la fase u (0 = contacto delantero de ese pie)"""
    S = WALK_S; u %= 1.0
    if u < 0.5: return stance_spec(u)
    pts = [walk_foot_ankle(0.375), walk_foot_ankle(0.5), (-WALK_IN, -S + 0.6, 1.25, 38), (-WALK_IN, 0.0, 0.8, 14),
           (-WALK_IN, S - 0.35, 0.4, -12),
           walk_foot_ankle(0.0), walk_foot_ankle(0.125)]
    x = (u - 0.375) / 0.125; i = int(x); t = x - i
    p0, p1, p2, p3 = [Vector(pts[min(max(j, 0), len(pts) - 1)]) for j in (i - 1, i, i + 1, i + 2)]
    r = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)
    return {"loc": (r[0], r[1], r[2]), "rot": (r[3], 0, 8), "piv": None}


def periodic_lin(tab, u):
    for (u0, v0), (u1, v1) in zip(tab, tab[1:]):
        if u0 <= u <= u1:
            t = (u - u0) / (u1 - u0); t = t * t * (3 - 2 * t); return v0 + (v1 - v0) * t
    return tab[-1][1]


def walk_foot_ankle(u):
    """(afuera, adelante, arriba, pitch) del tobillo real en la fase de apoyo u (lado L, normalizado)"""
    sp = stance_spec(u)
    th = sp["rot"][0]; yaw = sp["rot"][2]
    toe, heel = foot_pts("L")
    loc = V("L", sp["loc"])
    t = toe if th > 1e-6 else heel
    if abs(th) > 1e-6: loc += q(0, 0, yaw) @ (t - q(th, 0, 0) @ t)
    return (loc.x, -loc.y, loc.z, th)


def A_walk():
    N = 30
    # tablas por fase (8 poses: contacto, abajo, paso, arriba x2); L delante en la fase 0
    PZ = [-0.15, -0.42, -0.24, -0.12] * 2
    PX = [0.0, 0.14, 0.24, 0.12, 0.0, -0.14, -0.24, -0.12]        # cadera sobre el pie de apoyo
    YAW = [-8, -5, 0, 4, 8, 5, 0, -4]                               # cadera gira hacia la pierna delantera
    ROLL = [0, -2.5, -6, -2.5, 0, 2.5, 6, 2.5]                      # cae del lado de la pierna en el aire
    CP = [-1, 1, 2, 0] * 2
    ARM = [16, 18, 4, -12, -16, -18, -4, 12]                        # brazo L: + = atras (opuesto a la pierna L)
    HEADP = [0, 2.5, 1, -1.5] * 2
    raws = []
    for f in range(N + 1):
        u = f / N
        g = lambda tab: periodic(tab, u)
        pose = P(pel={"loc": (g(PX), -0.1, g(PZ)), "rot": (5, g(ROLL), g(YAW))},
                 chest=(g(CP) - 1, -g(ROLL) * 0.5, -g(YAW) * 0.8), neck=(0, 0, 0),
                 head=(periodic(HEADP, u - 1 / N) - 3, -periodic(ROLL, u - 1 / N) * 0.3, -periodic(YAW, u - 1 / N) * 0.2),
                 footL=walk_foot(u), footR=walk_foot(u + 0.5))
        for side, sg in (("L", 1), ("R", -1)):
            sw = periodic(ARM, u - 1 / N) * sg
            swf = periodic(ARM, u - 2 / N) * sg
            up = swing((0.42, 0, -1), sw)
            fore = swing((0.42, 0, -1), swf - 14 - max(0, -swf) * 0.9)   # codo mas doblado al ir delante
            hand = swing((0.75, 0.0, -1), periodic(ARM, u - 3 / N) * sg - 22)
            pose["arm" + side] = {"up": up, "fore": fore, "hand": hand, "pole": (0.3, -1, 0), "ft": -10}
        raws.append((f + 1, C(pose)))
    act = build("walk", raws, N, loop=True, lag={}, interp="AUTO_CLAMPED", per_frame=True)
    LIB["walk"]["stride_per_cycle"] = round(4 * WALK_S, 3)
    LIB["walk"]["speed_units_per_s"] = round(4 * WALK_S / (N / FPS), 3)
    face("walk", blinks(N, every=200, start=18))


def author(name, act_name):
    src = bpy.data.actions.get(act_name)
    if src is None:
        with bpy.data.libraries.load(ASSET, link=False) as (dsrc, ddst):
            ddst.actions = [act_name]
        src = bpy.data.actions[act_name]
    src.use_fake_user = True
    B = load_action_raw(src)
    for b in BONES: PB[b].location, PB[b].rotation_quaternion, PB[b].scale = B[b]
    arm.animation_data.action = None; bpy.context.view_layer.update()
    dz = FLOOR - min(p.z for sd in "LR" for p in sole_pts(sd))
    if dz > 1e-3:                                    # la pose del autor hunde un pie: subir pelvis + controles de pie
        for b in ("Pelvis", "FootControl.L", "FootControl.R", "FootPoleTarget.L", "FootPoleTarget.R"):
            l, r, sc_ = B[b]; B[b] = (l + to_local(b, None, Vector((0, 0, dz)))[0], r, sc_)
        print("AUTHOR", act_name, "subida", round(dz, 3))
    A = C(BASE); mid = raw_mix(A, B, 0.55)
    for sd in "LR":                                    # el pie que gira mucho pasa por el aire (no atraviesa el suelo)
        b = f"FootControl.{sd}"; l, r, sc_ = mid[b]; mid[b] = (l + to_local(b, None, Vector((0, 0, 0.7)))[0], r, sc_)
    build(name, [(1, A), (6, raw_mix(A, B, -0.1)), (11, mid), (16, B), (40, B)], 40)
    face(name, [[1, "open", "neutral"], [10, "happy", "smileOpen"], [26, "open", "smile"]])


def A_point():
    tgt = P(pel={"loc": (0.2, -0.1, -0.22), "rot": (0, -3, 8)}, chest=(-3, 3, 14), head=(2, -6, 22),
            armL={"up": (1, 0.45, 0.12), "fore": (1, 0.5, 0.14), "hand": (1, 0.55, 0.2), "pole": (0, 0, -1), "ft": 0, "ht": 60},
            armR=dict(ARM_DOWN, ik=(0.9, 0.5, -2.6), hand=(0.2, 0.4, -1)))
    ant = P(pel={"loc": (-0.3, 0.1, -0.35), "rot": (2, 5, -10)}, chest=(4, -6, -8), head=(6, 5, -8),
            armL=dict(ARM_DOWN, ik=(0.5, -0.5, -1.4), hand=(0.2, -0.3, -1)))
    oneshot("point", C(tgt), N=36, antic=C(ant), t_antic=6, t_hit=11, t_settle=17)
    face("point", [[1, "open", "neutral"], [9, "open", "smile"], [24, "half", "smile"], [25, "blink", "smile"],
                   [27, "half", "smile"], [28, "open", "smile"]])



def seq(name, N, keys, lag=None, loop=False):
    """keys = [(frame, pose dict o raw)]"""
    return build(name, [(f, C(k) if "pel" in k else k) for f, k in keys], N, lag=lag, loop=loop)


# ---- brazos reutilizables (afuera, adelante, arriba)
HIP = {"gc": (1.62, 0.05, -1.95), "hand": (-0.55, -0.3, -1), "pole": (1, -0.8, 0.1)}       # puno en la cadera (marco del pecho)
HIP_LOOSE = {"gc": (1.75, 0.35, -2.2), "hand": (-0.4, -0.1, -1), "pole": (1, -0.6, 0)}


def A_wave():
    up = {"up": (0.85, 0.15, 0.35), "fore": (0.1, 0.25, 1), "hand": (0.0, 0.2, 1), "pole": (0.3, -0.5, -1)}
    a = lambda d: dict(up, fore=(d, 0.25, 1), hand=(d * 1.4, 0.2, 1))
    body = dict(pel={"loc": (-0.35, 0, -0.22), "rot": (0, 6, -8)}, chest=(-3, -6, -6), head=(0, -10, -6))
    ant = P(pel={"loc": (-0.2, 0, -0.4), "rot": (3, 4, -5)}, chest=(5, -3, 2), head=(6, 4, -3),
            armR=dict(ARM_DOWN, ik=(0.6, 0.6, -2.2)))
    keys = [(1, BASE), (5, ant), (11, P(armR=a(-0.15), **body)), (15, P(armR=a(0.55), **body)),
            (19, P(armR=a(-0.1), **body)), (23, P(armR=a(0.55), **body)), (27, P(armR=a(-0.1), **body)),
            (31, P(armR=a(0.45), **body)), (36, P(armR=a(0.12), **body)), (45, P(armR=a(0.12), **body))]
    seq("wave", 45, keys, lag={"Neck": 1, "Head": 2, "Forearm": 1, "Hand": 2})
    face("wave", [[1, "open", "neutral"], [7, "happy", "smileOpen"], [34, "happy", "smile"], [40, "open", "smile"]])


def A_hands_on_hips():
    tgt = P(pel={"loc": (-0.3, 0, -0.22), "rot": (0, 7, -6)}, chest=(-7, -7, 7), head=(-3, 8, -4),
            armL=dict(HIP), armR=dict(HIP))
    ant = P(pel={"loc": (-0.1, 0, -0.35), "rot": (3, 2, -3)}, chest=(4, -2, 2), head=(5, 2, 0),
            armL=dict(ARM_DOWN, ik=(1.4, -0.4, -2.4)), armR=dict(ARM_DOWN, ik=(1.4, -0.4, -2.4)))
    oneshot("hands_on_hips", C(tgt), N=36, antic=C(ant), t_antic=5, t_hit=11, t_settle=17, over=1.1)
    face("hands_on_hips", [[1, "open", "neutral"], [10, "open", "smile"], [26, "half", "smile"], [27, "blink", "smile"],
                           [29, "half", "smile"], [30, "open", "smile"]])


def A_cheer():
    UP = lambda o: {"up": (o, 0.12, 1), "fore": (o * 0.75, 0.2, 1), "hand": (o * 0.6, 0.15, 1), "pole": (1, -0.3, 0)}
    BEND = {"up": (0.75, 0.1, 0.7), "fore": (0.1, 0.25, 1), "hand": (0.0, 0.2, 1), "pole": (1, -0.2, -0.6)}
    feet = {}
    crouch = P(pel={"loc": (0, 0.1, -0.75), "rot": (8, 0, 0)}, chest=(10, 0, 0), head=(10, 0, 0),
               armL=dict(ARM_DOWN, ik=(0.5, 0.9, -2.0), hand=(-0.2, 0.4, -1)), armR=dict(ARM_DOWN, ik=(0.5, 0.9, -2.0), hand=(-0.2, 0.4, -1)),
               **feet)
    up = P(pel={"loc": (0, -0.1, -0.08), "rot": (-3, 0, 0)}, chest=(-10, 0, 0), head=(-12, 0, 0), armL=UP(0.5), armR=UP(0.5), **feet)
    pump = P(pel={"loc": (0, -0.05, -0.3), "rot": (0, 0, 0)}, chest=(-5, 0, 0), head=(-6, 4, 0), armL=BEND, armR=BEND, **feet)
    hold = P(pel={"loc": (-0.2, -0.05, -0.18), "rot": (-2, 4, -4)}, chest=(-8, -3, 3), head=(-8, 8, 0), armL=UP(0.55), armR=UP(0.45), **feet)
    seq("cheer", 42, [(1, BASE), (6, crouch), (11, up), (16, pump), (21, up), (25, pump), (30, hold), (42, hold)],
        lag={"Head": 1, "Forearm": 1, "Hand": 2})
    face("cheer", [[1, "open", "neutral"], [5, "blink", "neutral"], [8, "happy", "smileOpen"]])


def A_think():
    chin = {"gw": (-0.25, 2.25, 0.7), "hw": (0.1, 0.25, 1), "pw": (0.35, 0.3, -1)}          # puno R bajo la barbilla
    cross = {"gw": (-0.55, 1.85, -1.05), "hw": (-1, 0.15, 0.1), "pw": (0.6, -0.2, -1)}       # brazo L cruzado
    body = dict(pel={"loc": (0.25, 0, -0.22), "rot": (0, -5, 6)}, chest=(4, 4, -4), armR=chin, armL=cross)
    tgt = P(head=(6, -14, 8), **body)
    seq("think", 45, [(1, BASE), (6, P(pel={"loc": (0, 0, -0.3), "rot": (2, 0, 0)}, head=(-6, 0, 10))),
                      (14, tgt), (20, P(head=(4, -11, 10), **body)), (45, tgt)])
    face("think", [[1, "open", "neutral"], [8, "half", "neutral"], [30, "blink", "neutral"], [32, "half", "frown"]])


def A_shrug():
    arm = {"up": (0.55, 0.25, -1), "fore": (0.85, 0.75, 0.25), "hand": (0.9, 0.5, 0.5), "pole": (0.1, -1, -0.2), "ft": 35}
    arm2 = dict(arm, fore=(0.85, 0.8, 0.1))
    tgt = P(pel={"loc": (-0.2, 0, -0.16), "rot": (0, 3, -3)}, chest=(-4, -2, 2), head=(2, 14, 0), armL=arm, armR=arm)
    seq("shrug", 36, [(1, BASE), (5, P(pel={"loc": (-0.2, 0, -0.32), "rot": (2, 4, -4)}, chest=(4, -4, 4), head=(6, 4, -2))),
                      (11, tgt), (16, P(pel={"loc": (-0.2, 0, -0.2), "rot": (0, 3, -3)}, chest=(-3, -2, 2), head=(2, 10, 0), armL=arm2, armR=arm2)),
                      (21, tgt), (36, tgt)])
    face("shrug", [[1, "open", "neutral"], [6, "half", "neutral"], [10, "relaxed", "cat"]])


def A_surprised():
    hands = lambda o: {"gw": (o, 1.7, 0.6), "hw": (-0.2, 0.2, 1), "pw": (1, -0.4, -0.8)}
    flail = {"up": (0.9, 0.3, 0.6), "fore": (0.4, 0.4, 1), "hand": (0.3, 0.3, 1)}
    feet_back = dict(footL={"loc": (-0.2, -0.65, 0), "rot": (0, 0, 14)}, footR={"loc": (0.0, -1.05, 0), "rot": (0, 0, 8)})
    ant = P(pel={"loc": (-0.2, 0, -0.45), "rot": (4, 3, -4)}, chest=(6, -4, 4), head=(6, 3, -2))
    air = P(pel={"loc": (0, 0.9, 0.45), "rot": (-8, 0, 0)}, chest=(-10, 0, 0), head=(-12, 0, 0), armL=flail, armR=flail,
            footL={"loc": (-0.2, -0.1, 0.9), "rot": (25, 0, 14), "piv": None}, footR={"loc": (0.0, -0.6, 1.1), "rot": (30, 0, 8), "piv": None})
    land = P(pel={"loc": (-0.1, 1.0, -0.7), "rot": (-2, 2, 0)}, chest=(-6, -2, 0), head=(-8, 4, 0), armL=hands(0.95), armR=hands(1.05), **feet_back)
    hold = P(pel={"loc": (-0.15, 0.95, -0.38), "rot": (-4, 3, -2)}, chest=(-8, -3, 2), head=(-6, 6, 0), armL=hands(0.9), armR=hands(1.0), **feet_back)
    build("surprised", [(1, C(BASE)), (4, C(ant)), (8, C(air)), (12, C(land)), (17, raw_mix(C(land), C(hold), 1.15)), (21, C(hold)),
                        (32, C(hold))], 32, lag={"Head": 1, "Forearm": 1, "Hand": 1})
    face("surprised", [[1, "open", "neutral"], [4, "surprised", "surprised"], [24, "shocked", "gasp"]])


KNEEL = P(pel={"loc": (0.1, 0.65, -4.25), "rot": (6, -2, 4)}, chest=(4, 3, -4), head=(-4, 8, -3),
          footL={"loc": (-0.05, 2.5, 0), "rot": (0, 0, 10)},
          footR={"loc": (0.05, -2.75, 1.15), "rot": (68, 0, 0), "piv": None},
          poleL=(0.3, 0, 4.5), poleR=(0, 0, -4.0),
          armL={"gw": (1.0, 2.35, -4.75), "hw": (-0.2, 0.6, -1), "pw": (1, -0.5, 0)}, armR=dict(ARM_DOWN, ik=(0.9, 0.6, -2.7)))


def A_kneel():
    step = P(pel={"loc": (0.15, 0.3, -1.4), "rot": (4, -3, 4)}, chest=(4, 2, -2), head=(4, 4, 0),
             footL={"loc": (-0.05, 2.5, 0), "rot": (0, 0, 10)},
             footR={"loc": (0.05, -1.8, 1.4), "rot": (40, 0, 0), "piv": None}, poleL=(0.3, 0, 2.5), poleR=(0, 0, -2.0))
    lift = P(pel={"loc": (0.1, 0, -0.4), "rot": (2, -4, 2)}, footL={"loc": (-0.05, 1.4, 0.9), "rot": (-10, 0, 10), "piv": None})
    plant = P(pel={"loc": (0.1, 0.1, -0.6), "rot": (3, -3, 3)}, footL={"loc": (-0.05, 2.5, 0), "rot": (0, 0, 10)}, poleL=(0.3, 0, 1.5))
    seq("kneel", 45, [(1, BASE), (5, lift), (10, plant), (17, step), (23, deep(KNEEL, {"pel": {"loc": (0.1, 0.65, -4.45)}})),
                      (29, KNEEL), (45, KNEEL)], lag={"Head": 2, "UpperArm": 1, "Forearm": 2, "Hand": 2})
    face("kneel", [[1, "open", "neutral"], [20, "half", "neutral"], [21, "blink", "neutral"], [23, "half", "smile"], [24, "open", "smile"]])


def A_sit_floor():
    hands_back = lambda o: {"gw": (o, -1.9, -8.25), "hw": (0.1, -0.3, -1), "pw": (0.4, -1, 0.2)}
    sit = P(pel={"loc": (0.0, 0.8, -6.25), "rot": (-14, 0, 0)}, chest=(-2, 0, 0), head=(10, 8, 0),
            footL={"loc": (-0.15, 3.6, 0), "rot": (-35, 0, 6)}, footR={"loc": (-0.15, 3.3, 0), "rot": (-35, 0, 6)},
            poleL=(-0.4, 0, 5), poleR=(-0.4, 0, 5), armL=hands_back(2.0), armR=hands_back(2.0))
    fold = {"up": (0.6, 0.6, -0.6), "fore": (0.3, 1, -0.4), "hand": (0.2, 1, -0.5)}
    crouch = P(pel={"loc": (0.0, 0.8, -3.3), "rot": (18, 0, 0)}, chest=(12, 0, 0), head=(4, 0, 0),
               footL={"loc": (-0.1, 0.9, 0), "rot": (0, 0, 8)}, footR={"loc": (-0.1, 0.6, 0), "rot": (0, 0, 8)},
               poleL=(0, 0, 2), poleR=(0, 0, 2), armL=fold, armR=fold)
    down = deep(sit, {"pel": {"loc": (0.0, 0.85, -6.3), "rot": (-6, 0, 0)}, "chest": (6, 0, 0),
                      "footL": {"loc": (-0.15, 2.4, 0.6), "rot": (-10, 0, 6), "piv": None},
                      "footR": {"loc": (-0.15, 2.2, 0.5), "rot": (-10, 0, 6), "piv": None}})
    seq("sit_floor", 50, [(1, BASE), (5, P(pel={"loc": (0, 0.1, -0.45), "rot": (4, 0, 0)}, chest=(4, -2, 2))),
                          (13, crouch), (20, down), (26, raw_mix(C(down), C(sit), 1.15)), (32, sit), (50, sit)],
        lag={"Head": 2, "Forearm": 1, "Hand": 2})
    face("sit_floor", [[1, "open", "neutral"], [18, "blink", "neutral"], [22, "relaxed", "smile"], [30, "open", "smile"]])


def A_nod():
    hp = lambda p: P(head=(p, 4, -3), neck=(p * 0.35, 1, 0), chest=(-2 + p * 0.1, -5, 6))
    seq("nod", 30, [(1, BASE), (4, hp(-4)), (8, hp(15)), (12, hp(-2)), (16, hp(12)), (20, hp(0)), (24, hp(3)), (30, hp(3))], lag={"Head": 1})
    face("nod", [[1, "open", "neutral"], [6, "happy", "smile"], [22, "open", "smile"]])


def A_shake_head():
    hy = lambda y: P(head=(4, 2, y), neck=(0, 1, y * 0.3), chest=(-2, -5, 6 + y * 0.12))
    seq("shake_head", 36, [(1, BASE), (5, hy(-20)), (10, hy(18)), (15, hy(-17)), (20, hy(14)), (25, hy(-5)), (30, hy(0)), (36, hy(0))],
        lag={"Head": 1})
    face("shake_head", [[1, "open", "neutral"], [4, "half", "frown"]])


def A_look_around():
    ly = lambda y, p=0: P(head=(p, 4 - y * 0.1, y), neck=(0, 1, y * 0.25), chest=(-2, -5, 6 + y * 0.25),
                         pel={"loc": (-0.22, 0, -0.2), "rot": (1, 4, -5 + y * 0.1)})
    seq("look_around", 60, [(1, BASE), (6, ly(-4)), (12, ly(38, -3)), (24, ly(36, -2)), (31, ly(-6)), (36, ly(-38, -3)), (47, ly(-36, -2)),
                            (54, ly(2)), (60, ly(0))], lag={"Head": 1, "Neck": 1})
    face("look_around", [[1, "open", "neutral"], [27, "half", "neutral"], [28, "blink", "neutral"], [30, "half", "neutral"],
                         [31, "open", "neutral"], [52, "open", "smile"]])


def A_talk_gesture():
    N = 40
    beat = lambda d, lh: P(chest=(-2 + d * 2, -5, 6 - d * 3), head=(3 + d * 5, 4, -3 + d * 2),
                           armR={"up": (0.5, 0.35, -1), "fore": (0.5, 1, 0.15 - d * 0.35), "hand": (0.6, 1, 0.35 - d * 0.7), "pole": (0.2, -1, -0.3)},
                           armL=dict(ARM_DOWN, ik=(1.1, 0.4 + lh, -2.85 + lh * 1.5), hand=(0.45, 0.25 + lh, -1)))
    keys = [(1, beat(0, 0)), (5, beat(1, 0)), (11, beat(0.1, 0)), (15, beat(0.7, 0.4)), (21, beat(0, 0.2)), (25, beat(1, 0)),
            (31, beat(0.2, 0)), (35, beat(0.6, 0)), (41, beat(0, 0))]
    build("talk_gesture", [(f, C(k)) for f, k in keys], N, loop=True, lag={"Head": 1, "Forearm": 1, "Hand": 2})
    face("talk_gesture", [[1, "open", "talkA"], [4, "open", "neutral"], [7, "open", "talkO"], [10, "open", "talkA"], [13, "open", "neutral"],
                          [16, "open", "smile"], [19, "open", "talkO"], [22, "open", "talkA"], [25, "half", "neutral"], [26, "blink", "neutral"],
                          [28, "half", "talkO"], [29, "open", "talkO"], [31, "open", "talkA"], [34, "open", "neutral"], [37, "open", "smile"]])


# ---------------------------------------------------------------- inspiradas en sinaboto
def A_hold_up_object():
    cup = {"gw": (1.55, 1.75, 2.05), "hw": (0.1, 0.25, 1), "pw": (1, -0.2, -0.7)}         # R: vaso a la altura de la cabeza
    tgt = P(pel={"loc": (0.2, 0, -0.2), "rot": (0, -5, 6)}, chest=(-4, 5, -8), head=(-6, -10, -28), armR=cup, armL=dict(HIP))
    ant = P(pel={"loc": (0.1, 0, -0.35), "rot": (2, -2, 2)}, chest=(4, 2, -2), head=(6, -2, -6),
            armR={"gw": (1.2, 1.9, -1.6), "hw": (0.1, 0.6, 1), "pw": (0.6, -0.3, -1)})
    oneshot("hold_up_object", C(tgt), N=40, antic=C(ant), t_antic=6, t_hit=13, t_settle=20, over=1.08)
    face("hold_up_object", [[1, "open", "neutral"], [12, "half", "neutral"], [26, "half", "frown"]])


def A_drink():
    raise_ = {"gw": (0.55, 2.05, 0.4), "hw": (-0.2, 0.3, 1), "pw": (0.6, -0.3, -1)}
    low = dict(raise_, gw=(0.75, 2.0, 0.1))
    sip = {"gw": (0.15, 1.9, 1.35), "hw": (-0.25, -0.6, 1), "pw": (0.7, -0.1, -0.6)}       # vaso en la boca, inclinado
    body = dict(pel={"loc": (0.15, 0, -0.2), "rot": (0, -4, 4)}, armL=dict(HIP))
    keys = [(1, BASE), (6, P(armR=raise_, head=(6, 0, 0), **body)), (13, P(armR=sip, chest=(-6, 2, -4), head=(-14, -4, -4), **body)),
            (30, P(armR=sip, chest=(-8, 2, -4), head=(-18, -4, -4), **body)),
            (37, P(armR=low, chest=(-3, 2, -2), head=(2, 6, 0), **body)), (45, P(armR=low, chest=(-3, 2, -2), head=(2, 6, 0), **body))]
    seq("drink", 45, keys, lag={"Head": 2, "Forearm": 1, "Hand": 1})
    face("drink", [[1, "open", "neutral"], [11, "relaxed", "neutral"], [36, "happy", "smile"]])


def A_pour():
    hold = lambda o, f, u, hw: {"gw": (o, f, u), "hw": hw, "pw": (1, -0.3, -0.5)}
    lift = P(pel={"loc": (-0.1, 0.05, -0.3), "rot": (3, 2, -2)}, chest=(2, -2, 2), head=(10, 0, 0),
             armL=hold(0.75, 2.4, -1.2, (-0.6, 0.6, 0.2)), armR=hold(0.75, 2.4, -1.2, (-0.6, 0.6, 0.2)))
    tilt = P(pel={"loc": (-0.1, 0.25, -0.35), "rot": (10, 2, -2)}, chest=(14, -2, 2), head=(16, 4, 0),
             armL=hold(0.7, 2.9, -0.4, (-0.5, 0.2, 0.8)), armR=hold(0.75, 3.6, -2.0, (-0.5, 0.8, -0.6)))
    seq("pour", 45, [(1, BASE), (6, P(pel={"loc": (-0.2, 0, -0.4), "rot": (4, 3, -3)}, chest=(5, -3, 3))), (12, lift),
                     (20, tilt), (24, deep(tilt, {"armR": hold(0.75, 3.7, -2.15, (-0.5, 0.85, -0.7))})), (28, tilt), (45, tilt)],
        lag={"Head": 2, "Forearm": 1, "Hand": 1})
    face("pour", [[1, "open", "neutral"], [12, "half", "neutral"], [30, "half", "smile"]])


def A_carry_heavy():
    sack = {"gc": (0.75, 0.4, 1.45), "hand": (-0.6, -0.5, 0.6), "pole": (0.4, 1, -0.6)}      # puno R sobre el hombro, codo adelante
    bal = {"up": (1, -0.15, -0.35), "fore": (1, 0.25, -0.6), "hand": (1, 0.2, -0.4)}          # brazo L abierto (equilibrio)
    tgt = P(pel={"loc": (0.3, 0, -0.75), "rot": (6, -7, 4)}, chest=(8, 9, -4), head=(4, 6, 0), armR=sack, armL=bal)
    heave = deep(tgt, {"pel": {"loc": (0.3, 0, -1.05), "rot": (10, -9, 4)}, "chest": (14, 11, -4), "head": (10, 8, 0)})
    seq("carry_heavy", 40, [(1, BASE), (5, P(pel={"loc": (0, 0, -0.55), "rot": (6, 0, 0)}, chest=(8, 0, 0), armR=sack)),
                            (12, heave), (18, deep(tgt, {"pel": {"loc": (0.3, 0, -0.65)}})), (24, tgt), (40, tgt)],
        lag={"Head": 2, "UpperArm": 1, "Forearm": 1, "Hand": 1})
    face("carry_heavy", [[1, "open", "neutral"], [6, "blink", "frown"], [10, "angry", "shout"], [20, "sad", "frown"]])


def A_pump():
    N = 30
    handle = lambda u: {"gw": (0.55, 2.7, u), "hw": (-0.3, 0.6, -0.4), "pw": (1, -0.7, 0)}
    top = P(pel={"loc": (0.1, 0, -0.2), "rot": (4, -3, 2)}, chest=(4, 2, -4), head=(4, -6, 0), armR=handle(-0.4), armL=dict(HIP))
    bot = P(pel={"loc": (0.1, 0.05, -0.75), "rot": (12, -3, 2)}, chest=(16, 2, -4), head=(14, -6, 0), armR=handle(-2.4), armL=dict(HIP))
    build("pump", [(1, C(top)), (8, raw_mix(C(top), C(bot), 0.4)), (14, C(bot)), (22, raw_mix(C(top), C(bot), 0.6)), (31, C(top))], N,
          loop=True, lag={"Head": 2, "Hand": 1})
    face("pump", [[1, "half", "neutral"], [12, "angry", "shout"], [18, "half", "neutral"]])


SHOVEL_LO, SHOVEL_HI = 5.6, 8.6     # puno L / puno R a lo largo del mango, desde la punta de la hoja (unidades)


def A_dig():
    """cavar con pala (loop): clavar con las dos manos, pisar la hoja con el pie R, palanca, levantar y tirar la tierra
    a su izquierda. Cada key define la pala por el puno R (arriba, en el mango) y la direccion del mango hacia la hoja
    (pitch bajo la horizontal, yaw hacia su izquierda); el puno L va 3 u mas abajo en la misma recta y la punta a 8.6 u.
    Armature: +X su izquierda, -Y delante, Z arriba. En three.js la pala se orienta de HandL a HandR (README)."""
    N = 36

    def shovel(R, pitch, yaw=0):
        p, y = math.radians(pitch), math.radians(yaw)
        d = Vector((math.sin(y) * math.cos(p), -math.cos(y) * math.cos(p), -math.sin(p)))
        R = Vector(R); return R, R + d * (SHOVEL_HI - SHOVEL_LO)

    def pose(sh, **kw):
        R, L = sh
        g = lambda p, side, hw: {"gw": (p.x * sgn(side), -p.y, p.z), "hw": hw, "pw": (1, -0.3, -0.8)}
        return P(armR=g(R, "R", (-0.6, 0.7, -0.2)), armL=g(L, "L", (-0.8, 0.5, 0.2)), **kw)

    stance = dict(footL={"loc": (-0.1, 0.9, 0), "rot": (0, 0, 16)}, footR={"loc": (0.1, -0.5, 0), "rot": (0, 0, 6)})
    SH = {"set": shovel((-0.35, -1.9, -0.6), 79), "push": shovel((-0.3, -2.0, -1.15), 80), "pry": shovel((-0.4, -0.9, -2.0), 68),
          "lift": shovel((-0.45, -2.0, -0.9), 45), "toss": shovel((-0.6, -1.1, -0.4), 30, 70)}
    set_ = pose(SH["set"], pel={"loc": (0.0, 0.3, -0.9), "rot": (14, 0, -6)}, chest=(22, 0, -8), head=(-8, 0, -4), **stance)
    push = pose(SH["push"], pel={"loc": (0.3, 0.45, -0.95), "rot": (16, -4, -6)}, chest=(32, 2, -8), head=(-4, 0, -4),
                footL=stance["footL"], footR={"loc": (-0.4, 2.05, 1.25), "rot": (0, 0, 0), "piv": None}, poleR=(0, 0, 2.5))
    pry = pose(SH["pry"], pel={"loc": (0.0, 0.8, -1.6), "rot": (20, 0, -6)}, chest=(32, 0, -6), head=(-8, 0, -2), **stance)
    lift = pose(SH["lift"], pel={"loc": (0.0, 0.45, -1.0), "rot": (12, 0, -4)}, chest=(28, 0, -4), head=(-8, 0, 0), **stance)
    toss = pose(SH["toss"], pel={"loc": (0.15, 0.25, -0.6), "rot": (4, 3, 10)}, chest=(8, 4, 24), head=(2, 2, 18), **stance)
    keys = [(1, C(set_)), (9, C(push)), (15, C(pry)), (22, C(lift)), (27, C(toss)), (32, raw_mix(C(toss), C(set_), 0.65)), (37, C(set_))]
    act = build("dig", keys, N, loop=True, lag={"Head": 2})
    for fc in fcurves(act):                                   # el pie no debe pasar bajo el suelo al bajar de la hoja
        if "FootControl" in fc.data_path:
            for kp in fc.keyframe_points: kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"
            fc.update()
    face("dig", [[1, "half", "neutral"], [7, "angry", "shout"], [15, "angry", "frown"], [24, "half", "neutral"], [27, "happy", "smile"],
                 [33, "half", "neutral"]])
    for f, k in (("set", 1), ("push", 9), ("pry", 15), ("lift", 22), ("toss", 27)):   # que tan lejos quedan los punos de la pala
        sc.frame_set(k); miss = []
        for side, want in zip("RL", SH[f]):
            hb = PB[f"Hand.{side}"]; fist = hb.head + (hb.tail - hb.head).normalized() * GRIP
            miss.append(round((fist - want).length, 2))
        print(f"DIG {f:5s} f{k:02d} miss R/L {miss}")


def A_scoop_kneel():
    scoop = deep(KNEEL, {"pel": {"rot": (16, -2, 4)}, "chest": (18, 3, -4), "head": (14, 4, -4),
                         "armR": {"gw": (0.4, 3.0, -8.0), "hw": (0, 1, -0.3), "pw": (1, -0.2, 0.4)}})
    scoop2 = deep(scoop, {"armR": {"gw": (0.4, 2.4, -8.05)}})
    lift = deep(KNEEL, {"chest": (2, 3, -6), "head": (6, -6, -10),
                        "armR": {"gw": (0.5, 2.2, -2.4), "hw": (-0.2, 0.3, 1), "pw": (0.8, -0.2, -1)}})
    seq("scoop_kneel", 50, [(1, KNEEL), (8, scoop), (14, scoop2), (22, lift), (27, deep(lift, {"armR": {"gw": (0.5, 2.25, -2.2)}})),
                            (32, lift), (50, lift)], lag={"Head": 2, "Forearm": 1, "Hand": 1})
    face("scoop_kneel", [[1, "open", "neutral"], [8, "half", "neutral"], [24, "open", "smile"]])


def A_saw():
    N = 20
    hold = {"gw": (-0.9, 2.6, -2.1), "hw": (0.2, 0.8, -0.6), "pw": (1, -0.4, 0.3)}           # mano L apoyada en la tabla
    saw = lambda f: {"gw": (0.75, f, -1.85), "hw": (0, 1, -0.25), "pw": (0.5, -1, 0.1)}
    body = lambda p, f: P(pel={"loc": (-0.2, 0.1, -0.55), "rot": (8 + p, 3, -6)}, chest=(12 + p, -3, 4), head=(10, 3, 0),
                          armL=hold, armR=saw(f), footR={"loc": (0.05, -0.6, 0), "rot": (0, 0, 14)})
    build("saw", [(1, C(body(0, 2.0))), (6, C(body(3, 3.0))), (11, C(body(5, 3.7))), (16, C(body(2, 2.8))), (21, C(body(0, 2.0)))], N,
          loop=True, lag={"Head": 1, "Hand": 1})
    face("saw", [[1, "angry", "neutral"], [9, "angry", "shout"], [14, "angry", "neutral"]])


def A_present():
    palm = {"up": (0.75, 0.6, -0.35), "fore": (0.7, 0.75, -0.1), "hand": (0.7, 0.65, -0.05), "pole": (0.2, -1, -0.5), "ft": 80}
    tgt = P(pel={"loc": (0.15, 0, -0.2), "rot": (0, -4, 8)}, chest=(-2, 3, 12), head=(4, -8, 4), armL=palm, armR=dict(HIP_LOOSE))
    ant = P(pel={"loc": (-0.1, 0, -0.3), "rot": (2, 3, -4)}, chest=(3, -3, -6), head=(6, 4, -6),
            armL=dict(ARM_DOWN, ik=(0.6, 0.7, -2.4), hand=(0.0, 0.5, -1)))
    seq("present", 40, [(1, BASE), (6, ant), (12, raw_mix(C(ant), C(tgt), 1.1)), (18, tgt),
                        (24, deep(tgt, {"head": (2, -6, 18)})), (40, deep(tgt, {"head": (0, -6, 20)}))])
    face("present", [[1, "open", "neutral"], [10, "open", "smile"], [22, "happy", "smileOpen"], [32, "open", "smile"]])


def A_phone_look():
    phone = {"gw": (-0.15, 2.3, -1.15), "hw": (-0.35, 0.6, 0.6), "pw": (0.7, -0.6, -0.5)}
    other = {"gw": (-0.35, 2.15, -1.55), "hw": (-0.8, 0.5, 0.2), "pw": (0.7, -0.6, -0.5)}
    tgt = P(pel={"loc": (-0.2, 0, -0.2), "rot": (2, 4, -4)}, chest=(6, -2, 0), neck=(8, 0, 0), head=(20, 6, 0), armR=phone, armL=other)
    seq("phone_look", 40, [(1, BASE), (6, P(armR=dict(phone, gw=(0.4, 1.8, -2.4)), head=(4, 4, -3))), (13, tgt),
                           (18, deep(tgt, {"head": (18, 8, 0)})), (40, deep(tgt, {"head": (19, 9, 0)}))])
    face("phone_look", [[1, "open", "neutral"], [10, "half", "neutral"], [30, "blink", "neutral"], [32, "half", "talkO"]])


def A_sick():
    mouth = {"gw": (-0.05, 2.0, 1.5), "hw": (-0.6, -0.2, 0.8), "pw": (0.6, -0.2, -1)}
    belly = {"gw": (-0.4, 1.7, -1.6), "hw": (-1, 0.1, 0.1), "pw": (0.8, -0.5, -0.6)}
    recoil = P(pel={"loc": (0.2, 0.55, -0.45), "rot": (-6, -5, 10)}, chest=(-12, 5, 12), head=(-4, -10, 16), armR=mouth, armL=belly)
    hunch = P(pel={"loc": (0.2, 0.45, -0.5), "rot": (4, -5, 10)}, chest=(10, 5, 10), head=(8, -8, 14), armR=mouth, armL=belly)
    mid = raw_mix(C(hunch), C(recoil), 0.4)
    seq("sick", 36, [(1, BASE), (4, P(head=(10, 0, -3))), (9, recoil), (14, hunch), (20, mid), (36, mid)],
        lag={"Head": 1, "Forearm": 1, "Hand": 1})
    face("sick", [[1, "open", "neutral"], [4, "shocked", "bigShock"], [12, "dizzy", "frown"], [22, "sad", "frown"]])


def A_smug():
    tgt = P(pel={"loc": (-0.35, 0, -0.18), "rot": (-2, 8, -10)}, chest=(-8, -8, 12), head=(-10, 10, 6),
            armL=dict(HIP), armR=dict(HIP), footL={"loc": (-0.25, 0.55, 0), "rot": (0, 0, 18)})
    ant = P(pel={"loc": (-0.1, 0, -0.32), "rot": (3, 2, -3)}, chest=(5, -2, 2), head=(8, 2, 0))
    oneshot("smug", C(tgt), N=36, antic=C(ant), t_antic=5, t_hit=11, t_settle=17, over=1.12)
    face("smug", [[1, "open", "neutral"], [6, "half", "smile"], [9, "relaxed", "cat"], [30, "wink", "cat"]])


# ---------------------------------------------------------------- digger-01 (storyboard: #16 shiver, #22 warm_hands, #4 drop_object)
def A_shiver():
    """tiritona (loop): brazos cruzados frotando los brazos, hombros arriba, rodillas juntas y temblor de 1-2 px.
    Keys cada 2 frames (el motor muestrea a 15 fps: f1, f3, f5... alternan A/B); interpolacion lineal, sin lag."""
    N = 16
    feet = dict(footL={"loc": (-0.42, 0.25, 0), "rot": (0, 0, -6)}, footR={"loc": (-0.3, -0.05, 0), "rot": (0, 0, -8)})
    def hug(k, j):
        rub = 0.22 * math.sin(k / 8 * 2 * math.pi)                       # frotar: las manos suben y bajan por los brazos
        armL = {"gw": (-0.95, 1.75, -0.45 + rub), "hw": (-1, 0.2, 0.15), "pw": (0.8, -0.2, -1)}   # L delante
        armR = {"gw": (-0.9, 1.35, -0.85 - rub), "hw": (-1, 0.1, 0.1), "pw": (0.8, -0.3, -1)}
        return P(pel={"loc": (-0.1 + j * 0.07, 0.05, -0.42), "rot": (6, 1 + j * 2.5, -2)}, chest=(10, j * 3.5, j * 2), neck=(4, 0, 0),
                 head=(10, -j * 3, j * 2.5), armL=armL, armR=armR, **feet)
    keys = [(1 + 2 * k, C(hug(k, 1 if k % 2 == 0 else -1))) for k in range(8)] + [(N + 1, C(hug(0, 1)))]
    build("shiver", keys, N, loop=True, lag={}, per_frame=True)
    face("shiver", [[1, "shocked", "bigShock"]])


def A_warm_hands():
    """agachada calentandose las manos (loop): palmas hacia delante a la altura del pecho, vaiven suave"""
    N = 40
    feet = dict(footL={"loc": (0.05, 0.6, 0), "rot": (0, 0, 14)}, footR={"loc": (0.05, 0.0, 0), "rot": (0, 0, 10)}, poleL=(0, 0, 1.6), poleR=(0, 0, 1.6))
    def crouch(s):
        palm = lambda o: {"gw": (o, 2.9 + s * 0.25, -2.55 + s * 0.12), "hw": (0.1, 0.35, 1), "pw": (1, -0.3, -1), "ht": 0}
        return P(pel={"loc": (0.0, 0.55, -2.1 - s * 0.08), "rot": (10, s * 3, s * 3)}, chest=(4, -s * 3, -s * 4), neck=(0, 0, 0),
                 head=(-2, s * 4, 0), armL=palm(0.55), armR=palm(0.55), **feet)
    keys = [(1, C(crouch(-1))), (21, C(crouch(1))), (41, C(crouch(-1)))]
    build("warm_hands", keys, N, loop=True, lag={"Head": 3, "Forearm": 2, "Hand": 3})
    face("warm_hands", blinks(N, every=100, start=18, eyes="relaxed", mouth="cat",
                              base=[[1, "relaxed", "cat"]]))


def A_drop_object():
    """sostiene algo con la mano L extendida (f12-f20), lo suelta en f22 (la mano se abre: muneca abajo), rebote y mira abajo.
    En three.js el prop se suelta con scene.attach(prop) al llegar a RELEASE_F = 22 (0,70 s) y cae con gravedad."""
    hold = {"up": (0.55, 0.82, -0.15), "fore": (0.45, 1, 0.0), "hand": (0.4, 1, -0.1), "pole": (0.3, -0.4, -1), "ft": 70}
    flick = dict(hold, hand=(0.4, 0.7, -0.9))
    bounce = dict(hold, up=(0.55, 0.8, -0.02), fore=(0.45, 1, 0.22), hand=(0.4, 0.9, 0.35))
    settle = dict(hold, up=(0.55, 0.8, -0.1), fore=(0.45, 1, 0.08), hand=(0.4, 1, 0.05))
    body = dict(pel={"loc": (0.15, 0, -0.2), "rot": (0, -4, 8)}, chest=(2, 3, 12), armR=dict(HIP_LOOSE))
    ant = P(pel={"loc": (-0.1, 0, -0.3), "rot": (2, 3, -4)}, chest=(3, -3, -6), head=(6, 4, -6),
            armL=dict(ARM_DOWN, ik=(0.6, 0.7, -2.4), hand=(0.0, 0.5, -1)))
    look = (16, -6, 14)
    seq("drop_object", 45, [(1, BASE), (6, ant), (12, P(armL=hold, head=(8, -6, 12), **body)), (20, P(armL=hold, head=look, **body)),
                            (22, P(armL=flick, head=look, **body)), (26, P(armL=bounce, head=(20, -6, 14), **body)),
                            (32, P(armL=settle, head=(18, -6, 12), **body)), (45, P(armL=settle, head=(18, -6, 12), **body))],
        lag={"Head": 1, "Forearm": 1, "Hand": 0})
    face("drop_object", [[1, "open", "neutral"], [10, "happy", "smileOpen"], [21, "open", "surprised"], [27, "relaxed", "cat"]])


# ---------------------------------------------------------------- digger-02 (squat, pinch_nose, pull_chain, throw_out_window, bend_pipe)
# Puntos medidos en la pose (armature: x = su izquierda, -y = delante, z arriba). gw = (afuera, adelante, arriba) del lado.
NOSE = None   # se rellena en measure() (centroide de los poligonos de la nariz, README de face)


def A_squat():
    """agachada profunda sobre un agujero, como sentada en un inodoro invisible (one-shot, se queda): abre los pies con dos
    pasitos (pie en el aire, sin deslizar), baja con overshoot, pelvis baja y atras, espalda casi recta, punos en las
    rodillas; balanceo leve."""
    N = 40
    fL = {"loc": (0.55, 0.35, 0), "rot": (0, 0, 22)}; fR = {"loc": (0.55, 0.35, 0), "rot": (0, 0, 22)}
    air = lambda f: {"loc": (f["loc"][0], f["loc"][1], 0.75), "rot": (8, 0, f["rot"][2]), "piv": None}
    poles = dict(poleL=(KNEE_OUT, 0, 0.4), poleR=(KNEE_OUT, 0, 0.4))
    knee = lambda w, side: {"gw": (SQ_KNEE[0] - (w if side == "L" else -w) * 0.06, SQ_KNEE[1], SQ_KNEE[2]), "hw": (-0.3, 0.8, -0.5), "pw": (1, -0.3, 0.3)}
    def sq(w=0.0, z=-3.1):
        return P(pel={"loc": (w * 0.08, 0.75, z), "rot": (16, w * 2.5, 0)}, chest=(2, -w * 2, 0), neck=(2, 0, 0), head=(-10, w * 2, 0),
                 armL=knee(w, "L"), armR=knee(w, "R"), footL=fL, footR=fR, **poles)
    b0 = BASE
    stepR = P(pel={"loc": (0.2, 0, -0.35), "rot": (2, -3, -3)}, chest=(2, 3, 3), head=(4, -2, -2), footR=air(fR), footL=b0["footL"])
    plantR = P(pel={"loc": (-0.2, 0, -0.4), "rot": (2, 3, -3)}, chest=(2, -3, 3), head=(4, 2, -2), footR=fR, footL=b0["footL"])
    stepL = P(pel={"loc": (-0.3, 0, -0.4), "rot": (2, 4, 3)}, chest=(2, -3, -3), head=(4, 2, 2), footR=fR, footL=air(fL))
    plantL = P(pel={"loc": (0.0, 0.1, -0.6), "rot": (4, 0, 0)}, chest=(2, 0, 0), head=(4, 0, 0), footR=fR, footL=fL, **poles)
    seq("squat", N, [(1, BASE), (4, stepR), (7, plantR), (9, stepL), (12, plantL), (17, sq(0, -3.35)), (23, sq(0, -3.05)),
                     (30, sq(1)), (36, sq(-0.8)), (40, sq(0))], lag={"Head": 2, "Forearm": 1, "Hand": 1})
    face("squat", [[1, "open", "neutral"], [10, "open", "surprised"], [17, "half", "frown"], [32, "half", "frown"], [33, "blink", "frown"],
                   [35, "half", "frown"]])


KNEE_OUT = -0.6                     # polo de la rodilla hacia fuera (unidades): rodillas adelante y algo abiertas
SQ_KNEE = (1.85, 0.75, -3.72)         # puno sobre la rodilla (se ajusta con la medida de las rodillas)


def A_pinch_nose():
    """se echa atras, gira la cabeza un poco, el puno R pinza la nariz (delante de la cara) desde f12; la mano L abanica 2 veces."""
    N = 36
    body = dict(pel={"loc": (0.1, 0.25, -0.28), "rot": (-3, -2, 6)}, chest=(-4, -2, 8), neck=(-1, 0, 4), head=(-2, -6, 12))
    nose = lambda dz=0.0: {"gw": (PINCH[0], PINCH[1], PINCH[2] + dz), "hw": (-0.75, 0.3, 0.6), "pw": (1, -0.2, -0.6)}
    fan = lambda o: {"gw": (o, 2.55, -0.55), "hw": (o * 0.3, 0.35, 1), "pw": (1, -0.4, -0.7)}
    sniff = P(pel={"loc": (-0.1, -0.1, -0.3), "rot": (3, 2, -3)}, chest=(6, -3, 2), neck=(4, 0, 0), head=(10, 2, -2),
              armR=dict(ARM_DOWN, ik=(0.8, 0.9, -2.3)))
    seq("pinch_nose", N, [(1, BASE), (5, sniff), (11, P(armR=nose(-0.15), armL=fan(0.9), **body)), (14, P(armR=nose(), armL=fan(-0.15), **body)),
                          (18, P(armR=nose(), armL=fan(1.0), **body)), (22, P(armR=nose(), armL=fan(-0.1), **body)),
                          (27, P(armR=nose(), armL=fan(0.55), **body)), (36, P(armR=nose(), armL=fan(0.55), **body))],
        lag={"Head": 1, "Forearm": 1, "Hand": 0})
    face("pinch_nose", [[1, "open", "neutral"], [4, "open", "surprised"], [8, "disgust", "disgust"]])


def A_pull_chain():
    """brazo R arriba y un poco delante-derecha, de puntillas; cierra el puno en la cadena en f10, tira hacia abajo hasta
    la altura del hombro (f18), mantiene a f24, suelta y vuelve a la base en f36. Mano L en la cadera."""
    N = 40
    TOP = {"gw": (1.0, 0.9, 5.4), "hw": (0.05, 0.15, 1), "pw": (1, 0.2, -0.4), "ht": 0}
    DOWN = {"gw": (1.95, 1.75, 0.55), "hw": (0.0, 0.35, 1), "pw": (1, -0.2, -0.8), "ht": 0}
    toes = dict(footL={"loc": (-0.2, 0.55, 0), "rot": (18, 0, 14)}, footR={"loc": (0.0, -0.05, 0), "rot": (18, 0, 8)})
    reach = P(pel={"loc": (-0.4, 0.05, 0.3), "rot": (-4, 6, -4)}, chest=(-6, 8, 4), neck=(-2, -2, 0), head=(-18, -4, -6),
              armR=TOP, armL=dict(HIP), **toes)
    pull = P(pel={"loc": (-0.2, 0.1, -0.55), "rot": (6, 4, -4)}, chest=(8, -4, 4), head=(-4, -2, -4), armR=DOWN, armL=dict(HIP))
    ant = P(pel={"loc": (-0.22, 0, -0.45), "rot": (3, 4, -4)}, chest=(4, -4, 4), head=(-4, 2, -3),
            armR={"gw": (2.15, 1.15, 0.9), "hw": (0.3, 0.2, 1), "pw": (1, 0, -0.6)}, armL=dict(HIP))
    mid = raw_mix(C(reach), C(pull), 0.55)
    seq("pull_chain", N, [(1, BASE), (5, ant), (10, reach), (12, reach), (15, mid), (18, pull), (21, raw_mix(C(pull), C(reach), -0.12)),
                          (24, pull), (30, raw_mix(C(pull), C(BASE), 0.6)), (36, BASE), (40, BASE)],
        lag={"Head": 1, "Forearm": 0, "Hand": 0, "UpperArm": 0})
    face("pull_chain", [[1, "open", "neutral"], [5, "open", "smileOpen"], [17, "happy", "smile"], [32, "happy", "smile"], [36, "open", "smile"]])


def A_throw_out_window():
    """empieza sujetando un orinal con los dos punos delante del pecho; atras (f6-9), balanceo grande adelante-arriba
    (brazos casi estirados a la altura del hombro f18), las munecas vuelcan f20-24 (suelta en f21), seguimiento y se queda."""
    N = 45
    hold = lambda f, u, hw: {"gw": (1.3, f, u), "hw": hw, "pw": (1, -0.3, -0.7)}
    carry = P(pel={"loc": (-0.1, 0.1, -0.25), "rot": (0, 2, -2)}, chest=(-2, -2, 2), head=(8, 0, 0),
              armL=hold(2.9, -0.45, (-0.4, 1, 0.25)), armR=hold(2.9, -0.45, (-0.4, 1, 0.25)))
    back = P(pel={"loc": (-0.05, 0.45, -0.65), "rot": (-3, 2, -2)}, chest=(-9, -2, 2), head=(-2, 0, 0),
             armL=hold(1.95, -1.6, (-0.4, 1, 0.6)), armR=hold(1.95, -1.6, (-0.4, 1, 0.6)))
    swing_ = P(pel={"loc": (-0.05, -0.35, -0.3), "rot": (7, 2, -2)}, chest=(14, -2, 2), head=(-8, 0, 0),
               armL=hold(4.5, 0.95, (-0.3, 1, 0.45)), armR=hold(4.5, 0.95, (-0.3, 1, 0.45)))
    dump = deep(swing_, {"armL": hold(4.6, 0.85, (-0.3, 0.6, -1)), "armR": hold(4.6, 0.85, (-0.3, 0.6, -1)), "chest": (16, -2, 2)})
    dump2 = deep(dump, {"armL": hold(4.6, 0.6, (-0.25, 0.15, -1)), "armR": hold(4.6, 0.6, (-0.25, 0.15, -1)), "head": (-2, 0, 0)})
    follow = P(pel={"loc": (-0.05, -0.4, -0.38), "rot": (9, 2, -2)}, chest=(18, -2, 2), head=(0, 0, 0),
               armL=hold(4.3, 0.25, (-0.25, 0.3, -1)), armR=hold(4.3, 0.25, (-0.25, 0.3, -1)))
    settle = P(pel={"loc": (-0.1, -0.25, -0.3), "rot": (6, 2, -2)}, chest=(12, -2, 2), head=(-4, 2, 0),
               armL=hold(3.9, -0.1, (-0.25, 0.5, -1)), armR=hold(3.9, -0.1, (-0.25, 0.5, -1)))
    seq("throw_out_window", N, [(1, carry), (4, raw_mix(C(carry), C(back), 0.5)), (7, back), (9, back), (18, swing_), (20, swing_),
                                (21, dump), (24, dump2), (30, follow), (36, settle), (45, settle)],
        lag={"Head": 1, "Forearm": 0, "Hand": 0, "UpperArm": 0})
    face("throw_out_window", [[1, "angry", "neutral"], [6, "angry", "shout"], [22, "happy", "smileOpen"], [38, "happy", "smile"]])


def A_bend_pipe():
    """sujeta un tubo horizontal con los dos punos delante del pecho (~0,5 m entre punos); esfuerzo: el puno R sube y se
    acerca, el L baja y se acerca (doblar en S) entre f10 y f32 con sacudidas; luego se queda."""
    N = 45
    grip = lambda o, f, u: {"gw": (o, f, u), "hw": (-0.25, 1, 0.0), "pw": (1, -0.3, -0.8), "ht": 0}
    def pose(k, j=0.0):
        rL, rR = grip(2.06 - 0.3 * k, 2.7, -0.75 * k + j * 0.07), grip(2.06 - 0.3 * k, 2.7, 0.65 * k - j * 0.07)
        return P(pel={"loc": (-0.1, 0.15, -0.45 - 0.1 * k), "rot": (3, j * 1.5, -2)}, chest=(4 + 2 * k, -2 - j * 1.5, 2), neck=(4, 0, 0),
                 head=(10, j * 2, 0), armL=rL, armR=rR)
    up = deep(pose(0), {"pel": {"loc": (-0.1, 0.1, -0.15)}, "chest": (-4, -2, 2), "head": (2, 0, 0)})
    keys = [(1, pose(0)), (6, up), (10, pose(0.05))]
    for i, f in enumerate(range(14, 31, 3)): keys.append((f, pose((f - 10) / 22, 1 if i % 2 == 0 else -1)))
    keys += [(32, pose(1.0)), (37, pose(1.04)), (45, pose(1.0))]
    seq("bend_pipe", N, keys, lag={"Head": 1, "Forearm": 0, "Hand": 0, "UpperArm": 0})
    face("bend_pipe", [[1, "open", "neutral"], [5, "angry", "neutral"], [10, "angry", "shout"], [34, "happy", "smile"]])


# ---------------------------------------------------------------- digger-03 (detector, melt beam, catch, push, door, bar, peek, key)
# Puntos de puno en METROS de three.js (afuera de su lado, adelante, altura desde el suelo; raiz en los pies, 1,6 m de alto)
S3 = 1.6 / 13.2
def M(o, f, y): return (o / S3, f / S3, y / S3 - 9.0)


def A_detector_walk():
    """andar (loop 30 f, misma zancada que walk: 7,2 u/s) con un detector de metales en la mano R: puno bajo delante de la
    cadera (~0,3 m), brazo estirado abajo/adelante, barrido izquierda-derecha una vez por ciclo (~0,25 m); mano L en la
    cadera; cabeza mirando al suelo delante. Pies: las mismas fases de contacto que walk (sin deslizar)."""
    N = 30
    PZ = [-0.15, -0.42, -0.24, -0.12] * 2
    PX = [0.0, 0.14, 0.24, 0.12, 0.0, -0.14, -0.24, -0.12]
    YAW = [-8, -5, 0, 4, 8, 5, 0, -4]
    ROLL = [0, -2.5, -6, -2.5, 0, 2.5, 6, 2.5]
    CP = [-1, 1, 2, 0] * 2
    HEADP = [0, 2.5, 1, -1.5] * 2
    raws = []
    for f in range(N + 1):
        u = f / N
        g = lambda tab: periodic(tab, u)
        sweep = math.sin(2 * math.pi * (u - 2 / N))                       # el barrido va 2 f detras del cuerpo
        det = {"gw": M(0.06 + 0.125 * sweep, 0.30, 0.72), "hw": (-0.15 - 0.25 * sweep, 0.75, -1), "pw": (1, -0.2, -0.3), "ht": 0}
        pose = P(pel={"loc": (g(PX), -0.1, g(PZ)), "rot": (7, g(ROLL), g(YAW) * 0.6)},
                 chest=(g(CP) + 7, -g(ROLL) * 0.5, -g(YAW) * 0.5 - 6 * sweep), neck=(4, 0, 0),
                 head=(periodic(HEADP, u - 1 / N) + 16, -periodic(ROLL, u - 1 / N) * 0.3, -6 * periodic([1, 0.7, 0, -0.7, -1, -0.7, 0, 0.7], u - 3 / N)),
                 footL=walk_foot(u), footR=walk_foot(u + 0.5), armR=det, armL=dict(HIP))
        raws.append((f + 1, C(pose)))
    build("detector_walk", raws, N, loop=True, lag={}, interp="AUTO_CLAMPED", per_frame=True)
    LIB["detector_walk"]["stride_per_cycle"] = round(4 * WALK_S, 3)
    LIB["detector_walk"]["speed_units_per_s"] = round(4 * WALK_S / (N / FPS), 3)
    face("detector_walk", blinks(N, every=200, start=18, eyes="open", mouth="smile"))


DET_HOLD = {"gw": M(0.06, 0.30, 0.72), "hw": (-0.15, 0.75, -1), "pw": (1, -0.2, -0.3), "ht": 0}


def A_detector_stop():
    """desde la base con el detector (mismo agarre), se para, se inclina, mira al suelo delante y se agacha un poco con el
    detector sobre el punto (one-shot 40 f, se queda)."""
    N = 40
    knees = dict(poleL=(0, 0, 1.6), poleR=(0, 0, 1.6))
    start = P(armR=DET_HOLD, armL=dict(HIP), chest=(4, -5, 6), head=(12, 4, -3))
    ant = P(pel={"loc": (-0.22, -0.15, -0.1), "rot": (-2, 4, -5)}, chest=(-4, -5, 6), head=(4, 4, -3), armL=dict(HIP),
            armR={"gw": M(0.08, 0.24, 0.78), "hw": (-0.15, 0.75, -1), "pw": (1, -0.2, -0.3), "ht": 0})
    lean = P(pel={"loc": (-0.15, 0.2, -0.45), "rot": (10, 2, -3)}, chest=(16, -2, 3), neck=(4, 0, 0), head=(8, 2, 0), armL=dict(HIP),
             armR={"gw": M(0.04, 0.40, 0.55), "hw": (-0.1, 0.6, -1), "pw": (1, -0.2, -0.3), "ht": 0}, **knees)
    crouch = P(pel={"loc": (-0.1, 0.45, -1.5), "rot": (14, 1, -2)}, chest=(16, -1, 2), neck=(2, 0, 0), head=(4, 0, 0), armL=dict(HIP),
               armR={"gw": M(0.03, 0.44, 0.42), "hw": (-0.05, 0.5, -1), "pw": (1, -0.2, -0.3), "ht": 0}, **knees)
    seq("detector_stop", N, [(1, start), (5, ant), (12, lean), (19, raw_mix(C(lean), C(crouch), 1.12)), (24, crouch), (40, crouch)],
        lag={"Head": 1, "Forearm": 1, "Hand": 1})
    face("detector_stop", [[1, "open", "smile"], [8, "surprised", "surprised"], [20, "surprised", "gasp"]])


def A_melt_beam():
    """estocada baja con las DOS palmas hacia un punto del suelo ~0,5 m delante de los pies a ~0,25 m de altura (punos a
    ~0,3 m entre si, munecas dobladas hacia el blanco); temblor de esfuerzo desde f15 (one-shot 45 f, se queda)."""
    N = 45
    feet = dict(footL={"loc": (-0.15, 1.6, 0), "rot": (0, 0, 10)}, footR={"loc": (0.05, -1.7, 0), "rot": (16, 0, 10)},
                poleL=(0, 0, 1.8), poleR=(0, 0, -1.0))
    def aim(j=0.0, k=1.0):
        palm = lambda: {"gw": M(0.15, 0.36 + 0.02 * j, 0.6 + 0.012 * j), "hw": (-0.25, 0.55, -1), "pw": (1, -0.4, -0.5), "ht": 0}
        return P(pel={"loc": (0.0, 0.55, -2.3 * k + 0.05 * j), "rot": (12, j * 1.2, 0)}, chest=(20 + j, j * 1.5, 0), neck=(6, 0, 0),
                 head=(4, -j, 0), armL=palm(), armR=palm(), **feet)
    ant = P(pel={"loc": (-0.1, -0.2, -0.6), "rot": (-4, 2, -2)}, chest=(-8, -2, 2), head=(-4, 0, 0),
            armL={"gw": M(0.2, 0.05, 0.95), "hw": (0, 0.2, 1), "pw": (1, -0.5, -0.6)}, armR={"gw": M(0.2, 0.05, 0.95), "hw": (0, 0.2, 1), "pw": (1, -0.5, -0.6)})
    air = lambda f: {"loc": (f["loc"][0], f["loc"][1], 0.75), "rot": (6, 0, f["rot"][2]), "piv": None}
    stepL = deep(ant, {"footL": air(feet["footL"])}); plantL = deep(ant, {"footL": feet["footL"], "poleL": feet["poleL"]})
    stepR = deep(plantL, {"footR": air(feet["footR"])})
    keys = [(1, BASE), (4, stepL), (6, plantL), (8, stepR), (10, deep(plantL, {"footR": feet["footR"], "poleR": feet["poleR"]})),
            (13, aim(0, 1.06)), (15, aim())]
    for i, f in enumerate(range(17, 44, 2)): keys.append((f, aim(1 if i % 2 == 0 else -1)))
    keys.append((45, aim()))
    seq("melt_beam", N, keys, lag={"Head": 1, "Forearm": 0, "Hand": 0, "UpperArm": 0})
    face("melt_beam", [[1, "open", "neutral"], [6, "angry", "neutral"], [12, "angry", "shout"]])


def A_catch_object():
    """mano R ahuecada palma arriba delante del pecho (~0,3 m) recibe un objeto en f14 (baja un poco f14-16 con el peso),
    luego lo sube a la altura de los ojos (a su derecha, sin taparle la cara) en f30 y lo mira (one-shot 36 f, se queda)."""
    N = 36
    cup = lambda y, f=0.3, o=0.06: {"gw": M(o, f, y), "hw": (-0.2, 1, 0.05), "pw": (1, -0.3, -0.8), "ht": -80}
    body = dict(pel={"loc": (0.1, 0, -0.22), "rot": (0, -4, 4)}, armL=dict(HIP))
    wait = P(chest=(4, -2, 2), head=(14, 2, -6), armR=cup(1.0), **body)
    look = P(chest=(-3, 3, -6), head=(2, -6, -22), armR={"gw": M(0.33, 0.3, 1.3), "hw": (0.1, 0.6, 0.6), "pw": (1, -0.2, -0.8), "ht": -80}, **body)
    seq("catch_object", N, [(1, BASE), (6, P(armR=cup(0.95, 0.22), head=(6, 2, -3), **body)), (11, wait), (14, wait),
                            (16, P(chest=(7, -2, 2), head=(16, 2, -6), armR=cup(0.93), **body)), (20, wait), (30, look), (36, look)],
        lag={"Head": 1, "Forearm": 1, "Hand": 0})
    face("catch_object", [[1, "open", "neutral"], [8, "open", "surprised"], [14, "surprised", "gasp"], [24, "happy", "smileOpen"]])


def A_push_heavy():
    """empujar algo pesado (loop 40 f): inclinada ~35 grados, las dos palmas delante a la altura del pecho (~0,45 m delante,
    ~0,3 m entre punos), piernas en estocada con los pies plantados (three.js mueve la raiz), balanceo de esfuerzo."""
    N = 40
    feet = dict(footL={"loc": (-0.1, 1.2, 0), "rot": (0, 0, 10)}, footR={"loc": (0.05, -1.9, 0), "rot": (22, 0, 8)},
                poleL=(0, 0, 1.8), poleR=(0, 0, -0.5))
    def push(k):
        palm = {"gw": M(0.15, 0.50 + 0.03 * k, 0.92 - 0.02 * k), "hw": (0.05, 0.45, 1), "pw": (1, -0.2, -0.8), "ht": 0}
        return P(pel={"loc": (0.0, 0.7 + 0.1 * k, -0.95 - 0.25 * k), "rot": (16 + 3 * k, 0, 0)}, chest=(20 + 4 * k, 0, 0), neck=(-6, 0, 0),
                 head=(-14 - 2 * k, 0, 0), armL=palm, armR=palm, **feet)
    build("push_heavy", [(1, C(push(0))), (11, C(push(1))), (21, C(push(0.2))), (31, C(push(0.9))), (41, C(push(0)))], N,
          loop=True, lag={"Head": 2, "Forearm": 1, "Hand": 1})
    face("push_heavy", [[1, "angry", "shout"], [16, "angry", "frown"], [24, "angry", "shout"], [36, "angry", "frown"]])


def A_push_door():
    """dos empujones a una puerta delante (palmas a la altura del hombro, ~0,4 m delante), cada uno con rebote atras; pies
    plantados; enfado -> triste (one-shot 40 f)."""
    N = 40
    palm = lambda f, y=1.0: {"gw": M(0.2, f, y), "hw": (0.05, 0.45, 1), "pw": (1, -0.2, -0.8), "ht": 0}
    feet = {}   # pies de la base: plantados (sin deslizar)
    ready = P(pel={"loc": (0, 0.0, -0.4), "rot": (2, 0, 0)}, chest=(0, 0, 0), head=(2, 0, 0), armL=palm(0.22), armR=palm(0.22), **feet)
    shove = P(pel={"loc": (0, 0.55, -0.35), "rot": (8, 0, 0)}, chest=(10, 0, 0), head=(-2, 0, 0), armL=palm(0.42), armR=palm(0.42), **feet)
    recoil = P(pel={"loc": (0, -0.25, -0.45), "rot": (-4, 0, 0)}, chest=(-6, 0, 0), head=(-6, 0, 0), armL=palm(0.28, 0.96), armR=palm(0.28, 0.96), **feet)
    slump = P(pel={"loc": (0, 0.0, -0.5), "rot": (6, 2, -2)}, chest=(10, -2, 2), neck=(6, 0, 0), head=(14, 4, 0),
              armL=dict(ARM_DOWN, ik=(1.0, 0.5, -2.85)), armR=dict(ARM_DOWN, ik=(0.95, 0.45, -2.9)), **feet)
    seq("push_door", N, [(1, BASE), (5, ready), (8, shove), (13, recoil), (17, ready), (22, shove), (27, recoil), (33, slump), (40, slump)],
        lag={"Head": 1, "Forearm": 1, "Hand": 0})
    face("push_door", [[1, "open", "neutral"], [5, "angry", "neutral"], [8, "angry", "shout"], [14, "angry", "frown"], [22, "angry", "shout"],
                       [30, "sad", "frown"]])


def A_lift_bar():
    """sujeta una tranca horizontal larga con los dos punos a la altura del hombro (~0,35 m delante, ~0,6 m entre punos),
    la sube por encima de la cabeza (f15) y la baja hacia delante hasta el pecho (f30) como dejandola en los soportes."""
    N = 45
    grip = lambda f, y: {"gw": M(0.30, f, y), "hw": (-0.3, 1, 0.15), "pw": (1, -0.2, -0.8), "ht": 0}
    hold = P(pel={"loc": (0, 0.0, -0.3), "rot": (0, 0, 0)}, chest=(0, 0, 0), head=(-4, 0, 0), armL=grip(0.35, 1.12), armR=grip(0.35, 1.12))
    dip = P(pel={"loc": (0, 0.1, -0.85), "rot": (4, 0, 0)}, chest=(4, 0, 0), head=(0, 0, 0), armL=grip(0.33, 1.0), armR=grip(0.33, 1.0))
    top = P(pel={"loc": (0, -0.1, -0.1), "rot": (-4, 0, 0)}, chest=(-10, 0, 0), neck=(-6, 0, 0), head=(-16, 0, 0),
            armL=grip(0.18, 1.62), armR=grip(0.18, 1.62))
    drop = P(pel={"loc": (0, 0.35, -0.55), "rot": (8, 0, 0)}, chest=(12, 0, 0), head=(4, 0, 0), armL=grip(0.45, 1.0), armR=grip(0.45, 1.0))
    seq("lift_bar", N, [(1, hold), (6, dip), (15, top), (19, top), (30, drop), (34, raw_mix(C(top), C(drop), 1.1)), (38, drop), (45, drop)],
        lag={"Head": 1, "Forearm": 0, "Hand": 0, "UpperArm": 0})
    face("lift_bar", [[1, "open", "neutral"], [6, "angry", "neutral"], [12, "angry", "shout"], [32, "happy", "smile"]])


def A_peek():
    """asomarse por una esquina (loop 40 f): inclinada hacia su derecha ~25 grados, mano L plana en una pared imaginaria a
    la altura del hombro a su izquierda, cabeza ladeada, balanceo curioso."""
    N = 40
    wall = {"gw": M(0.42, 0.04, 1.0), "hw": (0.15, 0.1, 1), "pw": (1, 0.2, -0.6), "ht": 90}
    def lean(k):
        return P(pel={"loc": (-0.45 - 0.08 * k, 0.05, -0.3), "rot": (2, -8 - 2 * k, 0)}, chest=(4, -14 - 3 * k, 0), neck=(0, -4, 0),
                 head=(4 + 3 * k, -8 - 2 * k, -4 * k), armL=wall, armR=dict(ARM_DOWN, ik=(1.0, 0.45, -2.85)),
                 footL={"loc": (-0.05, 0.4, 0), "rot": (0, 0, 10)}, footR={"loc": (-0.25, -0.1, 0), "rot": (0, 0, 8)})
    build("peek", [(1, C(lean(0))), (11, C(lean(1))), (21, C(lean(0.2))), (31, C(lean(0.9))), (41, C(lean(0)))], N, loop=True,
          lag={"Head": 2, "Forearm": 1, "Hand": 1})
    face("peek", blinks(N, every=100, start=26, eyes="open", mouth="neutral"))


def A_turn_key():
    """el puno R llega a una cerradura a la altura de la cintura ~0,45 m delante (f10), gira la muneca 90 grados (f14-20)
    y se retira (f28); se queda (one-shot 36 f)."""
    N = 36
    key = lambda f, y, t=0: {"gw": M(0.05, f, y), "hw": (-0.1, 1, 0.0), "pw": (1, -0.1, -0.8), "ht": t}
    body = dict(pel={"loc": (-0.05, 0.4, -0.35), "rot": (8, 0, 2)}, chest=(12, 0, 2), neck=(4, 0, 0), head=(12, 0, 0), armL=dict(HIP))
    reach = P(armR=key(0.45, 0.85), **body)
    seq("turn_key", N, [(1, BASE), (5, P(armR=key(0.25, 0.8), head=(6, 0, 0), armL=dict(HIP))), (10, reach), (14, reach),
                        (20, P(armR=key(0.45, 0.85, 90), **body)), (22, P(armR=key(0.45, 0.85, 90), **body)),
                        (28, P(pel={"loc": (-0.15, 0.1, -0.25), "rot": (2, 2, -2)}, chest=(2, -2, 2), head=(4, 2, 0), armL=dict(HIP),
                               armR=key(0.25, 0.86, 60))), (36, P(pel={"loc": (-0.15, 0.1, -0.25), "rot": (2, 2, -2)}, chest=(2, -2, 2), head=(2, 2, 0),
                                                                    armL=dict(HIP), armR=key(0.25, 0.86, 60)))],
        lag={"Head": 1, "Forearm": 0, "Hand": 0})
    face("turn_key", [[1, "open", "neutral"], [10, "open", "smile"], [21, "happy", "smileOpen"]])


PINCH = (0.2, 0.85, 1.2)    # se corrige con la medida de la nariz (measure: NOSE)


def measure(name, frames):
    """punos, coronilla y nariz en las keys: armature y three.js (m, raiz en los pies, mirando a +Z)"""
    S3 = 1.6 / 13.2
    act = bpy.data.actions[name]; arm.animation_data.action = act
    head_m = bpy.data.objects["Head"]
    cand = [head_m.matrix_world @ v.co for v in head_m.data.vertices]
    nose_l = min((v for v in cand if abs(v.x) < 0.5 and 1.0 < v.z < 2.6), key=lambda v: v.y)   # punta de la nariz (lo mas adelantado)
    hb = arm.data.bones["Head"]
    for f in frames:
        sc.frame_set(f); out = []
        Mh = PB["Head"].matrix @ hb.matrix_local.inverted()
        for side in "LR":
            b = PB[f"Hand.{side}"]; fist = b.head + (b.tail - b.head).normalized() * GRIP
            out.append(f"{side}=({fist.x:+.2f},{fist.y:+.2f},{fist.z:+.2f}) js({fist.x * S3:+.3f},{(fist.z + 9) * S3:.3f},{-fist.y * S3:+.3f})")
        top = Mh @ Vector((0, 0, 4.24)); nose = Mh @ nose_l
        print(f"MEAS {name} f{f:02d} {' '.join(out)} headtop_z={top.z:+.2f} nose=({nose.x:+.2f},{nose.y:+.2f},{nose.z:+.2f}) "
              f"knees L({PB['Calf.L'].head.x:+.2f},{PB['Calf.L'].head.y:+.2f},{PB['Calf.L'].head.z:+.2f})")


# ---------------------------------------------------------------- 2026-10-28: feminine expression poses (new face cells 13-15, v1 atlas)
# eyes: smirk, soft, sparkle (cells 13-15) / mouths: smirk, blushSmile, blushGasp (cells 13-15), see face/paint_face.py
def A_smirk_pose():
    """confident smirk: hand on hip, weight on one leg, head tilted, one eye half closed (one-shot 40 f, holds)"""
    tgt = P(pel={"loc": (-0.4, 0, -0.2), "rot": (0, 9, -10)}, chest=(-5, -8, 10), head=(-4, 12, -8), armL=dict(HIP))
    ant = P(pel={"loc": (-0.15, 0, -0.3), "rot": (2, 3, -4)}, chest=(4, -3, 3), head=(4, 3, -2))
    oneshot("smirk_pose", C(tgt), N=40, antic=C(ant), t_antic=5, t_hit=11, t_settle=18, over=1.1)
    face("smirk_pose", [[1, "open", "neutral"], [8, "smirk", "smirk"]])

def A_proud_pose():
    """flirty / proud: both hands on hips, chin up, eyes closed, smirk (one-shot 40 f, holds)"""
    tgt = P(pel={"loc": (-0.35, 0, -0.18), "rot": (-2, 8, -10)}, chest=(-9, -8, 12), head=(-14, 10, 6),
            armL=dict(HIP), armR=dict(HIP), footL={"loc": (-0.25, 0.55, 0), "rot": (0, 0, 18)})
    ant = P(pel={"loc": (-0.1, 0, -0.32), "rot": (3, 2, -3)}, chest=(5, -2, 2), head=(8, 2, 0))
    oneshot("proud_pose", C(tgt), N=40, antic=C(ant), t_antic=5, t_hit=11, t_settle=18, over=1.1)
    face("proud_pose", [[1, "open", "neutral"], [8, "relaxed", "smirk"], [30, "wink", "smirk"]])

def A_flirty_wink():
    """wink + blush: R fist beside the face (two-finger salute feel), head tilt (one-shot 40 f, holds)"""
    up = {"gw": M(-0.3, 0.1, 1.22), "hw": (-0.3, 0.2, 1), "pw": (1, -0.2, -0.8)}   # fist beside the cheek, face clear
    tgt = P(pel={"loc": (-0.3, 0, -0.2), "rot": (0, 7, -8)}, chest=(-4, -6, 8), head=(-3, 14, -6), armR=up, armL=dict(HIP))
    seq("flirty_wink", 40, [(1, BASE), (6, P(head=(4, 4, -3), chest=(3, -3, 2))), (12, tgt), (18, P(pel={"loc": (-0.3, 0, -0.22), "rot": (0, 7, -8)}, chest=(-4, -6, 8), head=(-3, 16, -6), armR=up, armL=dict(HIP))), (40, tgt)],
        lag={"Head": 2, "Forearm": 1, "Hand": 2})
    face("flirty_wink", [[1, "open", "smile"], [10, "wink", "smirk"], [20, "wink", "blushSmile"]])

def A_shy_smile():
    """soft smile with blush: fists together low in front, shoulders in, head tilted (one-shot 45 f, holds)"""
    hand = lambda o: {"gw": M(o, 0.22, 0.78), "hw": (-0.3, 0.5, -1), "pw": (1, 0.2, -0.6)}
    tgt = P(pel={"loc": (0.1, 0, -0.25), "rot": (2, -4, 4)}, chest=(6, 3, -4), head=(8, -12, 4), armL=hand(0.03), armR=hand(0.03))
    oneshot("shy_smile", C(tgt), N=45, antic=None, t_hit=12, t_settle=20, over=1.06)
    face("shy_smile", [[1, "open", "neutral"], [8, "soft", "blushSmile"], [30, "happy", "blushSmile"], [36, "soft", "blushSmile"]])

def A_sweet_surprise():
    """sweet surprise: small hop back, fists up by the cheeks, eyes sparkling, blush (one-shot 36 f, holds)"""
    cheek = lambda o: {"gw": M(o, 0.2, 1.12), "hw": (-0.2, 0.4, 1), "pw": (1, -0.3, -0.7)}   # fists under the cheeks
    tgt = P(pel={"loc": (0, 0.15, -0.15), "rot": (-3, 0, 0)}, chest=(-5, 0, 0), head=(-6, 0, 0), armL=cheek(0.24), armR=cheek(0.24))
    ant = P(pel={"loc": (0, 0, -0.45), "rot": (4, 0, 0)}, chest=(6, 0, 0), head=(4, 0, 0))
    oneshot("sweet_surprise", C(tgt), N=36, antic=C(ant), t_antic=4, t_hit=9, t_settle=15, over=1.08)
    face("sweet_surprise", [[1, "open", "neutral"], [6, "sparkle", "blushGasp"], [26, "sparkle", "blushSmile"]])

# ---------------------------------------------------------------- 2026-10-29: digger-04 (alarm clock) actions
# lying is authored on the rig (pelvis pitched back ~88 deg, legs straight forward, heels on the "floor" = the mattress),
# so three.js just puts the root ON the mattress top: no rigid rotation, nothing sinks into the bed.
LIE_FEET = dict(footL={"loc": (-0.05, 7.6, 0.95), "rot": (-72, 0, 4)}, footR={"loc": (-0.05, 7.4, 0.95), "rot": (-70, 0, 4)},
                poleL=(0, 0, 6), poleR=(0, 0, 6))
BELLY = lambda o, f: {"gw": M(o, f, 0.25), "hw": (-0.6, -0.3, 0.6), "pw": (1, 0, 0.6)}     # hands resting on the belly


def LIE(k=0.0, head=(14, 0, 0), **kw):
    """lying on the back; k 0..1 = breath (chest rises)"""
    d = dict(pel={"loc": (0.0, 0.8, -5.0), "rot": (-88, 0, 0)}, chest=(-2 - 2 * k, 0, 0), neck=(4, 0, 0), head=head,
             armL=BELLY(0.06, -0.18), armR=BELLY(0.08, -0.32))
    d.update(LIE_FEET); d.update(kw)
    return P(**d)


def A_sleep_lie():
    """asleep on her back in bed (loop 90 f): slow breathing, hands on the belly, head a little to her right"""
    N = 90
    build("sleep_lie", [(1, C(LIE(0, head=(14, 0, -10)))), (46, C(LIE(1, head=(15, 0, -11)))), (91, C(LIE(0, head=(14, 0, -10))))], N,
          loop=True, lag={})
    face("sleep_lie", [[1, "blink", "cat"]])


HANDS_BED = lambda o: {"gw": M(o * 0.5, 0.22, 0.32), "hw": (-0.3, 0.6, -0.4), "pw": (1, 0.2, -0.6)}   # palms on the mattress behind the hips


def SIT_BED(**kw):
    d = dict(pel={"loc": (0.0, 0.8, -5.95), "rot": (-8, 0, 0)}, chest=(6, 0, 0), neck=(2, 0, 0), head=(6, 0, 0),
             armL=HANDS_BED(0.24), armR=HANDS_BED(0.24))
    d.update(LIE_FEET); d.update(kw)
    return P(**d)


def A_wake_sit_up():
    """jolt awake: from lying, sits bolt upright in bed (palms on the mattress), small overshoot, then squints (one-shot 36 f)"""
    lie = C(LIE(0)); sit = C(SIT_BED())
    mid = C(P(**dict(LIE_FEET, pel={"loc": (0.0, 0.8, -5.2), "rot": (-50, 0, 0)}, chest=(4, 0, 0), head=(-6, 0, 0),
                     armL=HANDS_BED(0.3), armR=HANDS_BED(0.3))))
    build("wake_sit_up", [(1, lie), (4, lie), (8, mid), (12, raw_mix(mid, sit, 1.12)), (17, sit), (36, sit)], 36,
          lag={"Head": 2, "Forearm": 1, "Hand": 1})
    face("wake_sit_up", [[1, "blink", "cat"], [5, "surprised", "gasp"], [20, "half", "frown"]])


def A_slap_snooze():
    """still lying, the R arm swings up and out and slaps down on the bedside clock (out to her right, ~0.5 m), then flops
    back asleep (one-shot 45 f)"""
    up = {"gw": M(0.42, -0.25, 0.75), "hw": (0.6, 0, -1), "pw": (0.2, 0, 1)}
    slap = {"gw": M(0.58, -0.3, 0.28), "hw": (0.8, 0, -1), "pw": (0.2, 0, 1)}
    lie = C(LIE(0)); a = C(LIE(0, armR=up, head=(14, 0, -18))); b = C(LIE(0, armR=slap, head=(14, 0, -20)))
    build("slap_snooze", [(1, lie), (6, a), (12, raw_mix(a, b, 1.1)), (14, b), (26, b), (34, C(LIE(0.5, head=(14, 0, -10)))), (45, lie)], 45,
          lag={"Head": 1, "Forearm": 1, "Hand": 1})
    face("slap_snooze", [[1, "angry", "frown"], [13, "angry", "shout"], [24, "blink", "cat"]])


def A_push_nail():
    """at a table: L hand steadies the candle (~0.33 m ahead, ~1.0 m up), the R fist pushes a nail into it twice (one-shot 40 f)"""
    N = 40
    nail = lambda f: {"gw": M(-0.02, f, 1.03), "hw": (-0.2, 1, 0.1), "pw": (1, -0.1, -0.8)}
    hold = {"gw": M(-0.06, 0.34, 1.0), "hw": (0.3, 1, 0.3), "pw": (1, -0.2, -0.8)}
    body = dict(pel={"loc": (0.0, 0.25, -0.3), "rot": (5, 0, 0)}, chest=(8, 0, 0), neck=(2, 0, 0), head=(12, 0, 0), armL=hold)
    seq("push_nail", N, [(1, BASE), (6, P(armR=nail(0.22), armL=hold, head=(8, 0, 0))), (12, P(armR=nail(0.32), **body)),
                         (16, P(armR=nail(0.39), **body)), (20, P(armR=nail(0.33), **body)), (24, P(armR=nail(0.4), **body)),
                         (30, P(armR=nail(0.36), **body)), (40, P(armR=nail(0.36), **body))],
        lag={"Head": 1, "Forearm": 0, "Hand": 0})
    face("push_nail", [[1, "open", "neutral"], [12, "half", "frown"], [26, "happy", "smileOpen"]])


def A_run():
    """run cycle (18 f loop): the walk tables with a forward lean, a deeper bounce and big pumping arms (bent elbows)"""
    N = 18
    PZ = [-0.3, -0.75, -0.4, -0.05] * 2
    PX = [0.0, 0.1, 0.18, 0.1, 0.0, -0.1, -0.18, -0.1]
    YAW = [-10, -6, 0, 6, 10, 6, 0, -6]
    ARM = [36, 40, 10, -26, -36, -40, -10, 26]
    raws = []
    for f in range(N + 1):
        u = f / N
        g = lambda tab: periodic(tab, u)
        pose = P(pel={"loc": (g(PX), 0.2, g(PZ)), "rot": (14, 0, g(YAW))}, chest=(10, 0, -g(YAW) * 0.8), neck=(-4, 0, 0),
                 head=(-8, 0, -g(YAW) * 0.2), footL=walk_foot(u), footR=walk_foot(u + 0.5))
        for side, sg in (("L", 1), ("R", -1)):
            sw = periodic(ARM, u - 1 / N) * sg
            up = swing((0.35, 0, -1), sw)
            fore = swing((0.35, 0, -1), sw - 85)
            hand = swing((0.5, 0.0, -1), sw - 80)
            pose["arm" + side] = {"up": up, "fore": fore, "hand": hand, "pole": (0.3, -1, 0), "ft": -10}
        raws.append((f + 1, C(pose)))
    build("run", raws, N, loop=True, lag={}, interp="AUTO_CLAMPED", per_frame=True)
    LIB["run"]["stride_per_cycle"] = round(4 * WALK_S, 3)
    face("run", [[1, "surprised", "gasp"]])


def A_tap_pole():
    """both hands up on a long pole (R low ~1.2 m, L high ~1.55 m, slightly ahead), looking up; the pole jabs forward-up
    twice a second (loop 30 f)"""
    N = 30
    pole = lambda k: ({"gw": M(-0.02, 0.2 + 0.05 * k, 1.18 + 0.04 * k), "hw": (-0.4, 0.4, 1), "pw": (1, -0.3, -0.6)},
                      {"gw": M(-0.06, 0.3 + 0.06 * k, 1.5 + 0.05 * k), "hw": (0.4, 0.3, 1), "pw": (1, -0.3, -0.4)})
    def pose(k):
        r, l = pole(k)
        return C(P(pel={"loc": (0.0, -0.1, -0.25), "rot": (-6, 0, 0)}, chest=(-12, 0, 0), neck=(-8, 0, 0), head=(-26, 0, 0), armR=r, armL=l))
    build("tap_pole", [(1, pose(0)), (6, pose(1)), (9, pose(0)), (16, pose(1)), (19, pose(0)), (31, pose(0))], N, loop=True,
          lag={"Head": 1, "Forearm": 1, "Hand": 1})
    face("tap_pole", [[1, "open", "smile"], [15, "happy", "smileOpen"]])


def A_blow_tube():
    """pea shooter: both fists bring a tube to the mouth (R at the lips, L ~0.15 m ahead), the tube points up-forward at a
    window; three puffs (head jerks), cheeks out (one-shot 45 f)"""
    N = 45
    r = {"gw": M(0.05, 0.16, 1.33), "hw": (-0.3, 0.6, 0.6), "pw": (1, -0.3, -0.7)}
    l = {"gw": M(-0.06, 0.3, 1.45), "hw": (0.2, 0.6, 0.6), "pw": (1, -0.3, -0.6)}
    body = lambda h: dict(pel={"loc": (0.0, -0.05, -0.22), "rot": (-4, 0, 0)}, chest=(-8, 0, 0), neck=(-6, 0, 0), head=(h, 0, 0), armR=r, armL=l)
    seq("blow_tube", N, [(1, BASE), (8, P(**body(-18))), (14, P(**body(-18))), (16, P(**body(-12))), (20, P(**body(-18))),
                         (24, P(**body(-12))), (28, P(**body(-18))), (32, P(**body(-12))), (36, P(**body(-18))), (45, P(**body(-18)))],
        lag={"Head": 1, "Forearm": 1, "Hand": 1})
    face("blow_tube", [[1, "open", "neutral"], [8, "half", "talkO"], [36, "half", "smirk"]])

# ================================================================ verificacion
def sole_pts(side):
    fb = PB[f"Foot.{side}"]; ML = arm.data.bones[f"Foot.{side}"].matrix_local
    x = HEAD0[f"Foot.{side}"].x
    return [fb.matrix @ (ML.inverted() @ Vector((x, y, FLOOR))) for y in (-1.99, 1.06)]


def check(name):
    act = bpy.data.actions[name]; arm.animation_data.action = act
    N = LIB[name]["frames"]; rng = range(1, N + 1)
    minz, reach, slide = 9e9, 0, 0
    prev = None
    for f in rng:
        sc.frame_set(f)
        pts = {s: sole_pts(s) for s in "LR"}
        for s in "LR":
            minz = min(minz, *[p.z for p in pts[s]])
            th = PB[f"Thigh.{s}"].head; tgt = PB[f"FootControl.{s}"].head
            reach = max(reach, (tgt - th).length / 5.367)
        if prev and name not in ("walk", "detector_walk"):
            for s in "LR":
                for a, b in zip(prev[s], pts[s]):
                    if a.z < FLOOR + 0.05 and b.z < FLOOR + 0.05:
                        slide = max(slide, (Vector((a.x, a.y)) - Vector((b.x, b.y))).length)
        prev = pts
    LIB[name].update(min_sole_z=round(minz - FLOOR, 3), max_reach=round(reach, 3), planted_slide=round(slide, 3))
    print(f"CHECK {name:16s} frames={N:3d} sole_min={minz - FLOOR:+.3f} reach={reach:.3f} slide={slide:.3f}")


def check_walk(name="walk"):
    """en el walk, el punto de apoyo debe retroceder exactamente 4S/N por frame (luego three.js avanza el root)"""
    act = bpy.data.actions[name]; arm.animation_data.action = act
    N = LIB[name]["frames"]; v = 4 * WALK_S / N; err = 0
    prev = None
    for f in range(1, N + 2):
        sc.frame_set(f); pts = sole_pts("L")
        if "-v" in sys.argv:
            th = PB["Thigh.L"].head; tg = PB["FootControl.L"].head; ft = PB["Foot.L"].head
            print(f"  f{f:02d} reach={(tg - th).length / 5.367:.3f} miss={(ft - tg).length:.3f} toe=({pts[0].x:+.2f},{pts[0].y:+.2f},{pts[0].z - FLOOR:+.2f}) heel=({pts[1].y:+.2f},{pts[1].z - FLOOR:+.2f})")
        if prev is not None:
            for a, b in zip(prev, pts):
                if a.z < FLOOR + 0.005 and b.z < FLOOR + 0.005:
                    e = max(abs((b.y - a.y) - v), abs(b.x - a.x))
                    if e > err: err, ef = e, f
        prev = pts
    LIB[name]["slide_error_per_frame"] = round(err, 4)
    print(f"WALK {name} slide error per frame {err:.4f} at f{ef if err else 0} (velocidad {v:.3f}/frame)")


# ================================================================ main
def export():
    ad = arm.animation_data
    for t in list(ad.nla_tracks): ad.nla_tracks.remove(t)
    for name in LIB:
        act = bpy.data.actions[name]
        tr = ad.nla_tracks.new(); tr.name = name
        st = tr.strips.new(name, 1, act)
        st.action_frame_start, st.action_frame_end = act.frame_start, act.frame_end
        tr.mute = False
    ad.action = None
    for pb in PB: pb.location, pb.rotation_quaternion, pb.scale = Vector(), Quaternion(), Vector((1, 1, 1))
    sc.frame_start, sc.frame_end = 1, max(v["frames"] + 1 for v in LIB.values())
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTD, "zero_anim.blend"), copy=False)
    for o in bpy.data.objects:
        if o.type in ("MESH", "ARMATURE"): o.hide_set(False)
        o.select_set(o.type in ("MESH", "ARMATURE"))
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTD, "zero_anim.glb"), use_selection=True, export_apply=True,
        export_animations=True, export_animation_mode="NLA_TRACKS", export_force_sampling=True, export_frame_step=1,
        export_anim_slide_to_zero=True, export_optimize_animation_size=False, export_reset_pose_bones=True,
        export_yup=True)


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    arm.animation_data_create()
    for t in list(arm.animation_data.nla_tracks): arm.animation_data.nla_tracks.remove(t)
    todo = [k for k in list(globals()) if k.startswith("A_")]
    for k in todo:
        if argv and k[2:] not in argv: continue
        globals()[k]()
    author("pose_author_a", "Render2") if not argv or "pose_author_a" in argv else None
    author("pose_author_b", "Render3") if not argv or "pose_author_b" in argv else None
    for name in LIB:
        if name in ("walk", "detector_walk"): check_walk(name)
        check(name)
    MK = {"squat": (1, 12, 17, 23, 30, 40), "pinch_nose": (1, 11, 14, 36), "pull_chain": (1, 10, 12, 18, 24, 36),
          "throw_out_window": (1, 7, 18, 21, 24, 45), "bend_pipe": (1, 10, 32, 45),
          "detector_walk": (1, 8, 16, 23), "detector_stop": (1, 12, 24, 40), "melt_beam": (1, 15, 30, 45), "catch_object": (1, 14, 16, 30, 36),
          "push_heavy": (1, 11, 21), "push_door": (1, 8, 13, 22, 40), "lift_bar": (1, 15, 30, 45), "peek": (1, 11, 21),
          "turn_key": (1, 10, 14, 20, 28, 36)}
    for name, fr in MK.items():
        if name in LIB: measure(name, fr)
    if "--dry" in argv: sys.exit(0)   # digger-02: medir sin exportar (no pisa glb/json)
    export()
    json.dump(FACE, open(os.path.join(OUTD, "face_tracks.json"), "w"), indent=1)
    json.dump(LIB, open(os.path.join(OUTD, "actions.json"), "w"), indent=1)
    print("DONE", list(LIB))

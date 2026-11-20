"""ownerf assembly (Blender): kit object/material contract + procedural skin weights on the MakeHuman "default" rig.
    Blender -b work/uv.blend -P tools/final.py      -> styles/zawdog/humans/ownerf/ownerf.blend
Contract (human.py / retarget.py): objects "ownerf_rig" + "ownerf_body"; body slot 0 = atlas ("img"), slot 1 = face
("img" = faces/<expr>.png, a baked head texture on the "head" UV) -> P.face(expr) swaps slot 1's "img"; boots are
100 % foot.L/R (retarget finds the shoe through its top-weighted foot vertices)."""
import json
import math
import os
import sys

import bmesh
import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import D, NAME  # noqa: E402

W = os.path.join(D, "work")
G = json.load(open(os.path.join(W, "geo.json"))); META = json.load(open(os.path.join(W, "mesh_meta.json")))
SRC = META["src"]; PARTS = META["parts"]
rig = bpy.data.objects[NAME + "_rig"]; ob = bpy.data.objects[NAME + "_body"]
me = ob.data
B = {b.name: b for b in rig.data.bones}
J = lambda n, tail=False: np.array(B[n].tail_local if tail else B[n].head_local)  # noqa: E731
LM = G["landmarks"]


# ------------------------------------------------------------------ materials (kit flat look: 50 % diffuse + 50 % emission, Closest)
def img_load(path, name, noncolor=False):
    im = bpy.data.images.load(path, check_existing=False); im.name = name; im.pack()
    if noncolor:
        im.colorspace_settings.name = "Non-Color"
    return im


def flat_out(nt, color_socket):
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse"); emi = nt.nodes.new("ShaderNodeEmission"); mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs[0].default_value = 0.5
    nt.links.new(color_socket, dif.inputs["Color"]); nt.links.new(color_socket, emi.inputs["Color"])
    nt.links.new(dif.outputs[0], mix.inputs[1]); nt.links.new(emi.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs[0])


ATLAS = img_load(os.path.join(D, "atlas.png"), NAME + "_atlas")
m0 = bpy.data.materials.new(NAME + "_atlas"); m0.use_nodes = True; nt = m0.node_tree; nt.nodes.clear()
uvn = nt.nodes.new("ShaderNodeUVMap"); uvn.uv_map = "UVMap"
t0 = nt.nodes.new("ShaderNodeTexImage"); t0.name = "img"; t0.image = ATLAS; t0.interpolation = "Closest"
nt.links.new(uvn.outputs[0], t0.inputs[0]); flat_out(nt, t0.outputs[0]); m0["flat_ready"] = 1

m1 = bpy.data.materials.new(NAME + "_face"); m1.use_nodes = True; nt = m1.node_tree; nt.nodes.clear()
up = nt.nodes.new("ShaderNodeUVMap"); up.uv_map = "headuv"   # (not "head": that name is also a vertex group)
ph = nt.nodes.new("ShaderNodeTexImage"); ph.name = "img"; ph.interpolation = "Closest"
ph.image = img_load(os.path.join(D, "faces", "neutral.png"), "neutral.png")
nt.links.new(up.outputs[0], ph.inputs[0])
flat_out(nt, ph.outputs[0]); m1["flat_ready"] = 1      # the whole head: face photo baked into its own head texture
me.materials.clear(); me.materials.append(m0); me.materials.append(m1)

part = np.array([me.attributes["part"].data[i].value for i in range(len(me.polygons))])
srcf = np.array([me.attributes["src"].data[i].value for i in range(len(me.polygons))])
HEAD = PARTS.index("head")
for p in me.polygons:
    c = p.center; n = p.normal
    p.material_index = 1 if part[p.index] == HEAD else 0
    p.use_smooth = False

# ------------------------------------------------------------------ weights
V = np.array([v.co[:] for v in me.vertices])
nv = len(V)
vpart = np.full(nv, -1)
for p in me.polygons:
    for vi in p.vertices:
        vpart[vi] = part[p.index]
PN = {k: i for i, k in enumerate(PARTS)}
vsrc = [set() for _ in range(nv)]
for p in me.polygons:
    for vi in p.vertices:
        vsrc[vi].add(SRC[srcf[p.index]])
WT = [dict() for _ in range(nv)]


def add(i, bone, w):
    if w > 1e-4:
        WT[i][bone] = WT[i].get(bone, 0.0) + w


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def seg_t(p, a, b):
    ab = b - a
    return float((p - a) @ ab / (ab @ ab))


# spine tents (bone mid-heights); mapped by retarget: root, spine05, spine03, spine01 (04/02 follow their parents)
SPN = [("root", 0.845), ("spine05", 0.92), ("spine04", 0.987), ("spine03", 1.066), ("spine02", 1.19), ("spine01", 1.33),
       ("neck01", 1.43)]


def spine_w(z):
    zs = np.array([c for _, c in SPN]); out = {}
    if z <= zs[0]:
        return {"root": 1.0}
    if z >= zs[-1]:
        return {"neck01": 1.0}
    k = int(np.searchsorted(zs, z)) - 1
    t = (z - zs[k]) / (zs[k + 1] - zs[k])
    out[SPN[k][0]] = 1 - t; out[SPN[k + 1][0]] = t
    return out


SH = {s: J(f"upperarm01.{s}") for s in "LR"}; EL = {s: J(f"lowerarm01.{s}") for s in "LR"}; WR = {s: J(f"wrist.{s}") for s in "LR"}
HJ = {s: J(f"upperleg01.{s}") for s in "LR"}; KN = {s: J(f"lowerleg01.{s}") for s in "LR"}; AN = {s: J(f"foot.{s}") for s in "LR"}
CL = {s: J(f"clavicle.{s}") for s in "LR"}

for i in range(nv):
    p = V[i]; pt = vpart[i]; s = "L" if p[0] >= 0 else "R"
    if pt in (PN["hair"], PN["ears"]):
        add(i, "head", 1.0); continue
    if pt == PN["head"]:
        z = p[2]
        if z > LM["chin"] + 0.02:
            add(i, "head", 1.0)
        else:
            t = sstep(1.400, LM["chin"] + 0.02, z)
            if t > 0.66:
                add(i, "head", (t - 0.66) / 0.34); add(i, "neck03", 1 - (t - 0.66) / 0.34)
            elif t > 0.33:
                add(i, "neck03", (t - 0.33) / 0.33); add(i, "neck02", 1 - (t - 0.33) / 0.33)
            else:
                add(i, "neck02", t / 0.33); add(i, "neck01", 1 - t / 0.33)
        continue
    if pt == PN["boots"]:
        z = p[2]; wl = sstep(0.12, 0.205, z) * 0.55
        add(i, f"foot.{s}", 1 - wl); add(i, f"lowerleg01.{s}", wl); continue
    if pt == PN["hands"]:
        # nearest finger bone chain or the palm (wrist)
        best = ("wrist." + s, 1e9)
        for f_ in range(1, 6):
            for k in (1, 2, 3):
                a = J(f"finger{f_}-{k}.{s}"); b = J(f"finger{f_}-{k}.{s}", True)
                t = np.clip(seg_t(p, a, b), 0, 1); d = np.linalg.norm(p - (a + (b - a) * t))
                if d < best[1]:
                    best = (f"finger{f_}-{k}.{s}", d, f_, k, t)
        # palm: inside the box between the wrist and the knuckles
        kn = (J(f"finger2-1.{s}") + J(f"finger5-1.{s}")) / 2
        tp = seg_t(p, WR[s], kn)
        if tp < 0.92 or best[1] > 0.02:
            add(i, "wrist." + s, 1.0)
        else:
            _, d, f_, k, t = best
            # soft joints: blend with the parent near the bone head
            parent = (f"finger{f_}-{k - 1}.{s}" if k > 1 else "wrist." + s)
            wb = sstep(-0.10, 0.25, t) if k > 1 else sstep(-0.3, 0.2, t)
            add(i, best[0], wb); add(i, parent, 1 - wb)
        continue
    if pt == PN["forearm"]:
        t = seg_t(p, EL[s], WR[s])
        we = sstep(-0.10, 0.10, t); ww = sstep(0.85, 1.02, t) * 0.5
        add(i, f"upperarm01.{s}", 1 - we); add(i, f"lowerarm01.{s}", we * (1 - ww)); add(i, f"wrist.{s}", we * ww)
        continue
    # ---- trunk: body (torso patch, pelvis, legs) and jacket (shell, sleeves, collar)
    z = p[2]
    on_leg = (pt == PN["body"]) and z < LM["crotch"] + 0.03 and abs(p[0]) > 0.005
    if pt == PN["body"] and z < 0.955:
        # legs + pelvis: thigh / calf along the chain, hip blend with root, knee blend
        legw = sstep(0.93, 0.80, z)                      # 0 above the belt bottom .. 1 below the thigh top (butt follows the thigh)
        if abs(p[0]) < 0.004 and z < 0.87:              # centre verts (H0, H180, crotch) split between both legs
            for s2 in "LR":
                add(i, f"upperleg01.{s2}", 0.5 * legw)
            for b_, w_ in spine_w(z).items():
                add(i, b_, 1 - legw)
            continue
        tk = seg_t(p, HJ[s], KN[s]); ta = seg_t(p, KN[s], AN[s])
        wk = sstep(-0.12, 0.12, ta) if tk > 0.6 else 0.0
        add(i, f"upperleg01.{s}", legw * (1 - wk)); add(i, f"lowerleg01.{s}", legw * wk)
        for b_, w_ in spine_w(z).items():
            add(i, b_, (1 - legw) * w_)
        continue
    # torso / jacket: spine tents + shoulder / arm blend
    ws = {}
    for b_, w_ in spine_w(min(z, 1.40)).items():
        ws[b_] = w_
    # sleeve: parameter along the upper arm (armhole verts ~0)
    ta = seg_t(p, SH[s], EL[s])
    d_arm = np.linalg.norm(p - (SH[s] + (EL[s] - SH[s]) * np.clip(ta, 0, 1)))
    sl = bool(vsrc[i] & {"sleeve", "cuffband"}); jk = bool(vsrc[i] & {"jacket", "hem"})
    if pt == PN["jacket"] and sl:
        if jk:                                           # armhole ring: shared by the shell and the sleeve
            wu, wcl = 0.40, 0.30
        else:
            wu = 0.80 + 0.20 * sstep(0.30, 0.55, ta); wcl = (1 - wu) * 0.8
        wl = sstep(0.84, 1.02, ta) * 0.5                 # rolled cuff over the elbow
        out = {f"upperarm01.{s}": wu * (1 - wl), f"lowerarm01.{s}": wu * wl, f"clavicle.{s}": wcl}
        for b_, w_ in ws.items():
            out[b_] = out.get(b_, 0) + max(0.0, 1 - wu - wcl) * w_
        for b_, w_ in out.items():
            add(i, b_, w_)
        continue
    # shoulder region of the shell / torso patch / collar: share the clavicle + a little upper arm (kit v6.1 rule)
    dsh = np.linalg.norm(p - SH[s])
    k_ = float(np.clip(1 - dsh / 0.15, 0, 1)) ** 1.5
    wcl = 0.35 * k_ * (abs(p[0]) > 0.04); wup = 0.12 * k_ * (abs(p[0]) > 0.10)
    if srcf is not None and pt == PN["jacket"] and z > 1.395:      # collar: chest + a bit of neck
        ws = {"spine01": 1.0}; wcl = 0.0; wup = 0         # collar rides the chest only (no flare with the shoulders)
    for b_, w_ in ws.items():
        add(i, b_, w_ * (1 - wcl - wup))
    add(i, f"clavicle.{s}", wcl); add(i, f"upperarm01.{s}", wup)

# smooth the deforming parts' weights over their edges (2 passes), rigid parts untouched
edges = np.array([e.vertices[:] for e in me.edges])
RIGID = {PN["hair"], PN["ears"], PN["boots"], PN["hands"]}
for _ in range(2):
    new = [dict(w) for w in WT]
    acc = [dict() for _ in range(nv)]; cnt = np.zeros(nv)
    for a, b in edges:
        if vpart[a] != vpart[b] or vpart[a] in RIGID:
            continue
        for x, y in ((a, b), (b, a)):
            for bn, w in WT[y].items():
                acc[x][bn] = acc[x].get(bn, 0) + w
            cnt[x] += 1
    for i in range(nv):
        if cnt[i] and vpart[i] not in RIGID and vpart[i] != PN["head"]:
            tot = {}
            for bn, w in WT[i].items():
                tot[bn] = tot.get(bn, 0) + 0.5 * w
            for bn, w in acc[i].items():
                tot[bn] = tot.get(bn, 0) + 0.5 * w / cnt[i]
            new[i] = tot
    WT = new
for o in list(ob.vertex_groups):
    ob.vertex_groups.remove(o)
groups = {}
for i, w in enumerate(WT):
    tot = sum(w.values()) or 1.0
    for bn, x in w.items():
        if bn not in B:
            continue
        if bn not in groups:
            groups[bn] = ob.vertex_groups.new(name=bn)
        groups[bn].add([i], x / tot, "REPLACE")
# ------------------------------------------------------------------ proportions: longer legs (reference crotch ~0.50 of the
# height vs MakeHuman's 0.47), applied to mesh + rig together after skinning: z between the ankle and the hip joint is
# stretched by K_LEG, everything above shifts up, then the whole figure is scaled back to 1.68 m.
K_LEG = 1.18
ZA_, ZH_ = LM["ankle"], LM["hipjoint"]
H0 = max(v.co.z for v in me.vertices)
H1 = H0 + (ZH_ - ZA_) * (K_LEG - 1)
SC = 1.68 / (H1 + 0.004)


def remap(co):
    x, y, z = co
    if z > ZH_:
        z2 = z + (ZH_ - ZA_) * (K_LEG - 1)
    elif z > ZA_:
        z2 = ZA_ + (z - ZA_) * K_LEG
    else:
        z2 = z
    return (x * SC, y * SC, z2 * SC)


for v in me.vertices:
    v.co = remap(tuple(v.co))
bpy.context.view_layer.objects.active = rig; rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
for eb in rig.data.edit_bones:
    roll = eb.roll
    eb.head = remap(tuple(eb.head)); eb.tail = remap(tuple(eb.tail)); eb.roll = roll
bpy.ops.object.mode_set(mode="OBJECT")
print(f"proportions: legs x{K_LEG}, scale {SC:.3f}, height {max(v.co.z for v in me.vertices):.3f}")
for m_ in list(ob.modifiers):
    ob.modifiers.remove(m_)
am = ob.modifiers.new("Armature", "ARMATURE"); am.object = rig
ob.parent = rig
for u_ in [u_ for u_ in me.uv_layers if u_.name not in ("UVMap", "headuv")]:
    me.uv_layers.remove(u_)
me.uv_layers["UVMap"].active_render = True
for o in [o for o in bpy.data.objects if o not in (ob, rig)]:
    bpy.data.objects.remove(o)
ntri = sum(len(p.vertices) - 2 for p in me.polygons)
print(f"{NAME}: {len(me.polygons)} faces, {ntri} tris, {len(me.vertices)} verts, groups {len(groups)}")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, NAME + ".blend"))

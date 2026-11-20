"""ownerf head (round 2): a real low-poly 3D head instead of ring slices. Base topology = the MakeHuman CC0 'proxy741'
retopology (a hand-modelled low-poly human: nose, brow, lips, chin, jaw, round ears, full skull), fitted to our female
MakeHuman body, cut at the neck base; eye sockets and the mouth slit closed; decimated (symmetric) to the PS1 budget;
reshaped toward TomGrave3D's head (longer face, firmer chin, deeper brow / nose in profile).
Used by geo.py:   verts, faces, uvs, info = build_head(HS, mh, UD, transform, z_cut, ratio)"""
import math
import os

import bmesh
import bpy
import numpy as np
from mathutils import Vector


def _loops(bm, faces_set):
    """boundary edge loops of a face subset -> list of vertex lists (ordered)."""
    bnd = [e for e in bm.edges if sum(1 for f in e.link_faces if f in faces_set) == 1]
    adj = {}
    for e in bnd:
        a, b = e.verts
        adj.setdefault(a, []).append(b); adj.setdefault(b, []).append(a)
    seen = set(); loops = []
    for v0 in adj:
        if v0 in seen:
            continue
        loop = [v0]; seen.add(v0); prev = None; cur = v0
        while True:
            nx = [n for n in adj[cur] if n is not prev and n not in seen]
            if not nx:
                break
            prev, cur = cur, nx[0]; loop.append(cur); seen.add(cur)
        loops.append(loop)
    return loops


def build_head(HS, mh, UD, transform, z_cut, ratio=0.62, reshape=None):
    px = HS.add_mhclo_asset(os.path.join(UD, "proxymeshes", "proxy741", "proxy741.proxy"), mh, asset_type="Proxymeshes",
                            subdiv_levels=0)
    for m in list(px.modifiers):
        px.modifiers.remove(m)
    if px.parent:
        px.parent = None
    px.data.transform(transform)
    me = px.data
    bm = bmesh.new(); bm.from_mesh(me)
    uvl = bm.loops.layers.uv.active
    keep = set(f for f in bm.faces if all(v.co.z > z_cut for v in f.verts))
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f not in keep], context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    faces_set = set(bm.faces)
    info = {"holes": []}
    for loop in _loops(bm, faces_set):
        P = np.array([v.co[:] for v in loop]); c = P.mean(0)
        if c[2] < z_cut + 0.02:
            info["neck_loop"] = len(loop); continue                     # the neck stays open (inside the collar)
        # eye sockets / mouth slit: a centre vertex slightly recessed (toward the head's middle), triangle fan
        cen = Vector(c); inward = Vector((-c[0] * 0.3, 0.06 - c[1], 0)).normalized()
        cv = bm.verts.new(cen + inward * 0.002)
        uvc = None
        for i in range(len(loop)):
            a, b = loop[i], loop[(i + 1) % len(loop)]
            try:
                f = bm.faces.new((b, a, cv))
            except ValueError:
                continue
            if uvl is not None:
                for l in f.loops:
                    if l.vert is cv:
                        continue
                    lf = next((ll for ll in l.vert.link_loops if ll.face is not f), None)
                    if lf is not None:
                        l[uvl].uv = lf[uvl].uv
                uvs = [l[uvl].uv.copy() for l in f.loops if l.vert is not cv]
                for l in f.loops:
                    if l.vert is cv:
                        l[uvl].uv = (uvs[0] + uvs[1]) / 2 if uvc is None else uvc
        info["holes"].append((round(float(c[0]), 3), round(float(c[2]), 3), len(loop)))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    # PS1 budget: symmetric collapse decimation (the face keeps more detail than the skull, which the hair covers)
    bpy.context.view_layer.objects.active = px; px.select_set(True)
    gface = px.vertex_groups.new(name="_detail")
    for v in me.vertices:
        w = 1.0 if (v.co.y < -0.02 and v.co.z < 1.62) or abs(v.co.x) > 0.062 else 0.35
        gface.add([v.index], w, "REPLACE")
    d = px.modifiers.new("dec", "DECIMATE"); d.decimate_type = "COLLAPSE"; d.ratio = ratio
    d.use_symmetry = True; d.symmetry_axis = "X"; d.vertex_group = "_detail"; d.vertex_group_factor = 1.0
    bpy.ops.object.modifier_apply(modifier="dec")
    me = px.data
    if reshape:
        for v in me.vertices:
            v.co = Vector(reshape(np.array(v.co[:])))
    V = [tuple(v.co) for v in me.vertices]
    F = [tuple(p.vertices) for p in me.polygons]
    U = None
    if me.uv_layers:
        ul = me.uv_layers.active.data
        U = [[tuple(ul[li].uv) for li in p.loop_indices] for p in me.polygons]
    info["tris"] = sum(len(f) - 2 for f in F)
    bpy.data.objects.remove(px)
    return V, F, U, info

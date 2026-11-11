"""kimodo.cpp raw output -> BVH (Y up, metres, 30 fps), exact quaternions -> Euler ZXY. Used on the Mac (and the PC option A).
    Blender -b --python styles/zawdog/tools/kimodo_cpp_to_bvh.py -- <kmd-generate OUTDIR> <out.bvh> <kimodo.cpp>/scripts/export_glb.py
OUTDIR holds root_positions.f32 + local_rotations_xyzw.f32 written by `kmd-generate`; the skeleton (SOMA 30 joints, offsets)
is read from kimodo.cpp's own scripts/export_glb.py. (The repo's scripts/export_bvh.py is ~20 cm off at hands/feet: not used.)"""
import sys, struct, runpy
from mathutils import Quaternion
mdir, out, export_glb = sys.argv[sys.argv.index("--")+1:][:3]
sk = runpy.run_path(export_glb)["SKELETONS"]["soma30"]
names, parents, offs = sk["names"], sk["parents"], sk["offsets"]
J = len(names)
rb = open(f"{mdir}/root_positions.f32","rb").read(); qb = open(f"{mdir}/local_rotations_xyzw.f32","rb").read()
F = len(rb)//12
R = struct.unpack(f"{F*3}f", rb); Q = struct.unpack(f"{F*J*4}f", qb)
kids = {i: [c for c in range(J) if parents[c] == i] for i in range(J)}
L = []
def joint(i, d):
    t = "\t"*d
    L.append(f"{t}{'ROOT' if i == 0 else 'JOINT'} {names[i]}"); L.append(t+"{")
    o = (0.0, 0.0, 0.0) if i == 0 else offs[i]
    L.append(f"{t}\tOFFSET {o[0]:.6f} {o[1]:.6f} {o[2]:.6f}")
    L.append(f"{t}\tCHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation" if i == 0 else f"{t}\tCHANNELS 3 Zrotation Xrotation Yrotation")
    if kids[i]:
        for c in kids[i]: joint(c, d+1)
    else:
        L.append(f"{t}\tEnd Site"); L.append(t+"\t{"); L.append(f"{t}\t\tOFFSET 0.000000 0.000000 0.000000"); L.append(t+"\t}")
    L.append(t+"}")
L.append("HIERARCHY"); joint(0, 0)
order = []
def dfs(i):
    order.append(i); [dfs(c) for c in kids[i]]
dfs(0)
L += ["MOTION", f"Frames: {F}", "Frame Time: 0.033333"]
import math
for f in range(F):
    vals = list(R[f*3:f*3+3])
    for j in order:
        x, y, z, w = Q[(f*J+j)*4:(f*J+j)*4+4]
        e = Quaternion((w, x, y, z)).to_euler('YXZ')   # matrix = Rz * Rx * Ry  == channel order Z X Y
        vals += [math.degrees(e.z), math.degrees(e.x), math.degrees(e.y)]
    L.append(" ".join(f"{v:.6f}" for v in vals))
open(out, "w").write("\n".join(L) + "\n"); print("WROTE", out, F, "frames")

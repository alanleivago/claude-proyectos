"""python -I tools/anim/pose_sheet.py clip[:frame],clip[:frame] [views] [out.png] [zoom]: key poses of several clips (fresh author run + build)"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, "tools"))
import anim_review as AR, review as RV, rig as RG
spec = [x.split(":") for x in sys.argv[1].split(",")]
views = (sys.argv[2] if len(sys.argv) > 2 else "front,3q,side").split(",")
out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, "review", "_poses.png")
zoom = sys.argv[4] if len(sys.argv) > 4 else "body"
names = [x[0] for x in spec]
subprocess.run([sys.executable, "-I", os.path.join(HERE, "author.py"), ",".join(names)], check=True, capture_output=True)
BL = r"/Applications/Blender.app/Contents/MacOS/Blender"
r = subprocess.run([BL, "-b", "--factory-startup", "--python", os.path.join(HERE, "bl_build.py"), "--", os.path.join(ROOT, "ref", "build3_forest.json"),
                    os.path.join(ROOT, "ref", "anim.npz"), os.path.join(ROOT, "ref", "a_wine.blend")], capture_output=True, text=True)
if "BUILD saved" not in r.stdout: print(r.stdout[-2000:], r.stderr[-2000:]); raise SystemExit
u = AR.u; S = RG.S_ENGINE
shots, rows, labels = [], [], []
for x in spec:
    c = x[0]; f = int(x[1]) if len(x) > 1 else AR.nframes(c) // 2
    ctr = dict(ctr=u([0, 0, 1.15]), ext=0.95 * S) if zoom == "upper" else AR.frame_ctr(c)
    row = []
    for v in views:
        e, m = AR.face_at(c, f)
        o = os.path.join(AR.TMP, f"ps_{c}_{v}.png"); shots.append(dict(out=o, clip=c, frame=f + 1, view=v, eyes=e, mouth=m, **ctr)); row.append(o)
    rows.append(row); labels.append(f"{c}\nf{f}")
AR.render(AR.GLB["wine"], shots, 340)
RV.grid(rows, out, labels, views, "key poses")

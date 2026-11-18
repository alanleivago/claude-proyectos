"""out/face_tracks.json + out/actions.json (Zero's library + his_idle) and out/turntable_cam.json (his calibrated camera
in GLB units for the engine viewer). python tools/export_meta.py ref/rig_in.npz ref/<fit>.npz"""
import sys, json, numpy as np
sys.path.insert(0, "tools")
from cam import basis
R = np.load(sys.argv[1], allow_pickle=True); D = np.load(sys.argv[2], allow_pickle=True)
V = R["V"]; zmin, zmax = float(V[:, 2].min()), float(V[:, 2].max()); S = 13.24 / (zmax - zmin)
cam = json.loads(str(D["cam"])); A = D["alphas"]
C, Rv, U, F = basis(cam)
json.dump(dict(C=C.tolist(), R=Rv.tolist(), U=U.tolist(), F=F.tolist(), f=cam["f"], alphas=[float(a) for a in A], S=S, zmin=zmin,
               note="model metres -> GLB units: (x*S, (z-zmin)*S-9, -y*S) in three.js; frame k = model turned alpha_k deg about up"),
          open("out/turntable_cam.json", "w"), indent=1)
ZA = "/Users/alanleiva/claude-proyectos/pieces/zero-fem/anim/"
faces = json.load(open(ZA + "face_tracks.json")); acts = json.load(open(ZA + "actions.json"))
# his blink (video f027 half, f029-f031 closed, f033 open at 24 fps) at 30 fps, held pose 1..100
faces["his_idle"] = [[1, "open", "neutral"], [34, "half", "neutral"], [36, "blink", "neutral"], [40, "half", "neutral"], [42, "open", "neutral"]]
acts["his_idle"] = {"frames": 99, "loop": True, "source": "TikTok @.rashiyx 7634232804288564513 (turntable pose, blink at 1.1 s)"}
json.dump(faces, open("out/face_tracks.json", "w"), indent=1); json.dump(acts, open("out/actions.json", "w"), indent=1)
print("meta written: S", S, "zmin", zmin, "actions", len(acts))

"""Solve all clips -> ref/anim2.npz + out/actions.json + out/face_tracks.json, self-checks, then Blender GLBs.
python tools/anim/build_anims.py [clip,clip...] [--variants bare,tights] [--noglb]"""
import sys, os, json, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import core as C
import clips as CLP
import clips_stand, clips_sit  # noqa: F401  (register their clips in CLP.CL)
from checks import check_clip
import v2_clips as V2                 # v2 poses (anim2lib.Clip2); faces stay with the v1 clips (face-expression work)
V2C = {c.name: c for c in V2.CL}
ORDER = [V2C.get(c.name, c) for c in CLP.CL] + [c for c in V2.CL if c.name not in {o.name for o in CLP.CL}]
V1F = {c.name: c.faces for c in CLP.CL}

args = sys.argv[1:]
only = [a for a in args if not a.startswith("--")]
only = only[0].split(",") if only else None
variants = "bare,tights"
if "--variants" in args: variants = args[args.index("--variants") + 1]; only = None if only == [variants] else only
TAG = args[args.index("--tag") + 1] if "--tag" in args else None      # test build: ref/anim2_<tag>.npz, out/_<tag>_<variant>.glb
if TAG and only == [TAG]: only = None
BL = r"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
data = {}; acts = {}; faces = {}; report = []
for c in ORDER:
    if only and c.name not in only: continue
    qs, ls, Vs, Hs = [], [], [], []
    for f in c.frames():
        Q, H = c.solve(f); q, l = C.local_basis(Q, H); qs.append(q); ls.append(l); Hs.append(H)
        if "--nocheck" not in args: Vs.append(C.skin(Q, H))
    data["q_" + c.name] = np.array(qs); data["l_" + c.name] = np.array(ls)
    acts[c.name] = dict(frames=c.N, fps=30, seconds=round(c.N / 30, 3), loop=c.loop, note=c.note)
    if getattr(c, "cam", None): acts[c.name]["cam"] = c.cam
    if getattr(c, "speed", None): acts[c.name]["speed_m_per_s"] = c.speed; acts[c.name]["speed_units_per_s"] = round(c.speed * float(C.G["S"]), 3)
    fc = c.faces if (getattr(c, "own_faces", True) or c.name not in V1F) else V1F[c.name]
    if getattr(c, "face_map", None): fc = [[max(1, int(round(c.face_map(k[0] - 1))) + 1)] + list(k[1:]) for k in fc]
    tr = sorted(fc, key=lambda x: x[0]) or [[1, "open", "neutral"]]
    if tr[0][0] > 1: tr = [[1, "open", "neutral"]] + tr
    faces[c.name] = tr
    if Vs: report.append(check_clip(c, np.array(Vs), Hs))
# his_idle: the exact fitted pose, held (frames 1..100 like before)
# his_idle: the fitted pose with the right fist moved slightly out of the rebuilt bust (anim2lib.REST_OUT_R)
import anim2lib as A2
_hi = A2.Clip2("his_idle", 1, False); _hi.k(0); _hi.follow = {}; _hi.drag = {"L": 0, "R": 0}; _hi.wrdrag = {"L": 0, "R": 0}; _hi.skirt = 0; _hi.bust = 0
QI, HI = _hi.solve(0)
q, l = C.local_basis(QI, HI)
data["q_his_idle"] = np.repeat(q[None], 100, 0); data["l_his_idle"] = np.repeat(l[None], 100, 0)
acts["his_idle"] = dict(frames=99, fps=30, seconds=3.3, loop=True, note="fitted pose of the user-approved turntable (TikTok @.rashiyx), held; right fist rests on the chest (moved 3.5 cm out of the rebuilt bust)")
faces["his_idle"] = [[1, "open", "neutral"], [34, "half", "neutral"], [36, "blink", "neutral"], [40, "half", "neutral"], [42, "open", "neutral"]]
ANPZ = f"ref/anim2_{TAG}.npz" if TAG else "ref/anim2.npz"
if TAG and only and os.path.exists(ANPZ):          # test build of a few clips: keep the other clips of the last test build
    OLD = np.load(ANPZ, allow_pickle=True)
    for k in OLD.files:
        if k != "clips" and k not in data and (not k.startswith("q_") or OLD[k].shape[1] == C.NB): data[k] = OLD[k]
    data = {k: v for k, v in data.items() if not k.startswith("l_") or ("q_" + k[2:]) in data}
names = sorted(k[2:] for k in data if k.startswith("q_"))
np.savez(ANPZ, clips=json.dumps(names), **data)
# face tracks / actions: merge, keeping keys owned by others (e.g. "_meta" written by the face-atlas work)
F0 = json.load(open("out/face_tracks.json")) if os.path.exists("out/face_tracks.json") else {}
A0 = json.load(open("out/actions.json")) if (only and os.path.exists("out/actions.json")) else {}
if only is None: F0 = {k: v for k, v in F0.items() if k.startswith("_")}
A0.update(acts); F0.update(faces)
json.dump(A0, open("out/actions.json", "w"), indent=1); json.dump(F0, open("out/face_tracks.json", "w"), indent=1)
for r in report: print(r)
if "--noglb" in args: sys.exit()
for v in variants.split(","):
    out = f"out/_{TAG}_{v}.glb" if TAG else f"out/girl2_curvy_{v}.glb"
    p = subprocess.run([BL, "-b", "--factory-startup", "--python", "tools/anim/bl_build2.py", "--", "ref/rig2.npz", ANPZ, v, out],
                       capture_output=True, text=True)
    print("\n".join(l for l in p.stdout.splitlines() if "BUILD" in l or "Error" in l or "rror" in l)[-3000:])
    if p.returncode or "exported" not in p.stdout: print("BLENDER FAILED", p.returncode, p.stderr[-3000:], p.stdout[-1500:])

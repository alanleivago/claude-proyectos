"""Camera motion of a reference video, frame by frame.
LK optical flow + similarity RANSAC between consecutive frames -> pan x/y (px/frame at 1080 wide),
zoom (%/frame), roll (deg/frame). Detects cuts, then per shot: how many direction changes, how many
axes move at once, path curvature, speed profile.  Writes <out>/<id>_cam.csv and <id>_cam.md.
usage: python cam_motion.py video.mp4 [more.mp4 ...] --out fuentes/cartoon3d/cam
"""
import sys, math, csv
from pathlib import Path
import cv2, numpy as np

args = sys.argv[1:]
out = Path(args[args.index("--out") + 1]) if "--out" in args else Path(".")
vids = [a for a in args if a.endswith(".mp4")]
out.mkdir(parents=True, exist_ok=True)


def measure(path):
    cap = cv2.VideoCapture(str(path)); fps = cap.get(cv2.CAP_PROP_FPS) or 30
    prev = None; prevh = None; rows = []
    while True:
        ok, fr = cap.read()
        if not ok: break
        s = 540 / fr.shape[1]
        g = cv2.cvtColor(cv2.resize(fr, None, fx=s, fy=s), cv2.COLOR_BGR2GRAY)
        h = cv2.calcHist([g], [0], None, [32], [0, 256]); cv2.normalize(h, h)
        r = dict(f=len(rows), cut=0, dx=0.0, dy=0.0, zoom=0.0, roll=0.0, inl=0)
        if prev is not None:
            hd = cv2.compareHist(prevh, h, cv2.HISTCMP_BHATTACHARYYA)
            p0 = cv2.goodFeaturesToTrack(prev, 400, 0.01, 8)
            M = None
            if p0 is not None and len(p0) > 12:
                p1, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, p0, None, winSize=(21, 21), maxLevel=4)
                a, b = p0[st == 1], p1[st == 1]
                if len(a) > 12:
                    M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=2.0)
                    r["inl"] = int(inl.sum()) if inl is not None else 0
            if hd > 0.45 or M is None or r["inl"] < 15:
                r["cut"] = 1
            else:
                sc = math.hypot(M[0, 0], M[1, 0])
                # camera motion = opposite of image motion; px at 1080 wide
                r["dx"] = -M[0, 2] / s; r["dy"] = -M[1, 2] / s
                r["zoom"] = (sc - 1) * 100; r["roll"] = -math.degrees(math.atan2(M[1, 0], M[0, 0]))
        rows.append(r); prev, prevh = g, h
    return rows, fps


def summarize(rows, fps, vid):
    shots, cur = [], []
    for r in rows:
        if r["cut"] and cur: shots.append(cur); cur = []
        cur.append(r)
    if cur: shots.append(cur)
    L = [f"# {vid}: camera, frame by frame", "", f"{len(rows)} frames @ {fps:.0f} fps, {len(shots)} shots", "",
         "Per shot: dur s | still % (<2 px & <0.15 %/f) | moving axes at once (median) | direction changes of the pan "
         "| zoom sign changes | path length px | peak px/f | mean |zoom| %/f | max |roll| deg/f", "",
         "| shot | t0 | dur | still% | axes | pan dir chg | zoom chg | path | peak | zoom | roll |", "|---|---|---|---|---|---|---|---|---|---|---|"]
    allaxes = []
    for i, sh in enumerate(shots):
        m = sh[1:] if sh[0]["cut"] else sh
        if len(m) < 3: continue
        dx = np.array([r["dx"] for r in m]); dy = np.array([r["dy"] for r in m])
        z = np.array([r["zoom"] for r in m]); ro = np.array([r["roll"] for r in m])
        # smooth over 3 frames to ignore jitter
        k = np.ones(3) / 3
        dxs, dys, zs, ros = (np.convolve(v, k, "same") for v in (dx, dy, z, ro))
        sp = np.hypot(dxs, dys)
        still = np.mean((sp < 2) & (np.abs(zs) < 0.15)) * 100
        axes = (np.abs(dxs) > 2).astype(int) + (np.abs(dys) > 2) + (np.abs(zs) > 0.15) + (np.abs(ros) > 0.05)
        allaxes += list(axes)
        ang = np.arctan2(dys, dxs); mv = sp > 3
        chg = 0; last = None
        for a, mo in zip(ang, mv):
            if not mo: continue
            if last is not None and abs((a - last + np.pi) % (2 * np.pi) - np.pi) > np.radians(60): chg += 1
            last = a
        zsg = np.sign(np.where(np.abs(zs) > 0.15, zs, 0)); zsg = zsg[zsg != 0]
        zchg = int(np.sum(zsg[1:] != zsg[:-1])) if len(zsg) > 1 else 0
        L.append(f"| {i+1} | {m[0]['f']/fps:.2f} | {len(m)/fps:.2f} | {still:.0f} | {np.median(axes[axes>0]) if (axes>0).any() else 0:.0f} "
                 f"| {chg} | {zchg} | {sp.sum():.0f} | {sp.max():.0f} | {np.abs(zs).mean():.2f} | {np.abs(ros).max():.2f} |")
    A = np.array(allaxes)
    L += ["", f"Frames with 0/1/2/3+ axes moving: " + " / ".join(f"{np.mean(A==n)*100:.0f}%" for n in (0, 1, 2)) + f" / {np.mean(A>=3)*100:.0f}%"]
    return "\n".join(L)


for v in vids:
    vid = Path(v).stem
    rows, fps = measure(v)
    with open(out / f"{vid}_cam.csv", "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    (out / f"{vid}_cam.md").write_text(summarize(rows, fps, vid), encoding="utf-8")
    print("ok", vid)

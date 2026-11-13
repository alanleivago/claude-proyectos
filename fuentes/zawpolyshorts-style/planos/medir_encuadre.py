"""Framing measurement (ENCUADRE.md): Zaw shorts vs our renders, per real shot (not frames every 2 s).
1) cuts: every frame at 144x256, cut = a peak of (mean abs diff + HSV-histogram distance) over the local median;
2) per shot: start / middle / end frames (360x640) + pixel camera move between start and end (ORB + partial affine:
   zoom factor, pan as a fraction of the frame width, rotation) and the mean frame-to-frame flow;
3) API (claude-sonnet-5-5, messages.stream, text blocks only): per shot size, subject boxes (animal / human, as
   fractions of the frame), camera height and pitch, lens feel and horizontal FOV, how much set is visible, prop
   scale vs the animal, the nearest foreground object, the camera move.
Writes <out>/<tag>/shots.json (+ frames) and <out>/<tag>/measure.json.
Usage: .venv/bin/python -I medir_encuadre.py <out_dir> <tag>=<video.mp4> [...] [--api]"""
import base64, json, subprocess, sys
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT / "tools"))
MODEL = "claude-sonnet-5-5"


def read_frames(video, w=144, h=256):
    cap = cv2.VideoCapture(str(video)); fps = cap.get(cv2.CAP_PROP_FPS) or 30.0; out = []
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        out.append(cv2.resize(fr, (w, h), interpolation=cv2.INTER_AREA))
    return out, fps


def cuts_of(frames, fps):
    d = [0.0]
    for a, b in zip(frames, frames[1:]):
        mad = float(np.abs(a.astype(np.int16) - b.astype(np.int16)).mean()) / 255
        ha = cv2.calcHist([cv2.cvtColor(a, cv2.COLOR_BGR2HSV)], [0, 1], None, [24, 8], [0, 180, 0, 256])
        hb = cv2.calcHist([cv2.cvtColor(b, cv2.COLOR_BGR2HSV)], [0, 1], None, [24, 8], [0, 180, 0, 256])
        cv2.normalize(ha, ha); cv2.normalize(hb, hb)
        d.append(mad + 0.5 * cv2.compareHist(ha, hb, cv2.HISTCMP_BHATTACHARYYA))
    d = np.array(d); cuts = []
    for i in range(1, len(d)):
        lo, hi = max(0, i - 8), min(len(d), i + 9)
        med = np.median(np.r_[d[lo:i], d[i + 1:hi]])
        if d[i] > 0.12 and d[i] > 3.0 * med + 0.04 and d[i] == d[max(0, i - 3):i + 4].max():
            if not cuts or i - cuts[-1] >= int(0.3 * fps):
                cuts.append(i)
    return cuts, d


def move_of(a, b):
    """camera move between two frames of one shot: zoom (>1 = push-in / zoom-in), pan (fraction of width), rot (deg)."""
    orb = cv2.ORB_create(1500)
    ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    mk = np.full(ga.shape, 255, np.uint8); h_ = ga.shape[0]; mk[int(0.58 * h_):int(0.74 * h_)] = 0   # no captions
    ka, da = orb.detectAndCompute(ga, mk); kb, db = orb.detectAndCompute(gb, mk)
    if da is None or db is None or len(ka) < 12 or len(kb) < 12:
        return None
    m = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(da, db)
    if len(m) < 12:
        return None
    pa = np.float32([ka[x.queryIdx].pt for x in m]); pb = np.float32([kb[x.trainIdx].pt for x in m])
    M, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=4.0)
    if M is None:
        return None
    s = float(np.hypot(M[0, 0], M[1, 0])); r = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
    W = a.shape[1]
    return {"zoom": round(s, 3), "pan_x": round(float(M[0, 2]) / W, 3), "pan_y": round(float(M[1, 2]) / W, 3),
            "rot": round(r, 2), "inliers": int(inl.sum()), "matches": len(m)}


def grab(video, t, path, w=360, h=640):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1",
                    "-vf", f"scale={w}:{h}", "-q:v", "3", str(path)], check=True)
    return path


def flow_mag(frames, i0, i1):
    v = []
    for i in range(i0, max(i0 + 1, i1 - 1), 2):
        a = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY); b = cv2.cvtColor(frames[min(i + 1, i1 - 1)], cv2.COLOR_BGR2GRAY)
        f = cv2.calcOpticalFlowFarneback(a, b, None, 0.5, 2, 13, 2, 5, 1.1, 0)
        v.append(float(np.median(np.hypot(f[..., 0], f[..., 1]))) / a.shape[1])
    return float(np.mean(v)) if v else 0.0


def stage1(out, tag, video):
    d = out / tag; d.mkdir(parents=True, exist_ok=True)
    frames, fps = read_frames(video); n = len(frames)
    cuts, _ = cuts_of(frames, fps)
    edges = [0] + cuts + [n]; shots = []
    for k, (a, b) in enumerate(zip(edges, edges[1:])):
        if b - a < 3:
            continue
        ia, ib = a + 1, b - 2; im = (a + b) // 2
        fa = grab(video, ia / fps, d / f"s{k:02d}_a.jpg"); fm = grab(video, im / fps, d / f"s{k:02d}_m.jpg")
        fb = grab(video, ib / fps, d / f"s{k:02d}_b.jpg")
        mv = move_of(cv2.imread(str(fa)), cv2.imread(str(fb)))
        shots.append({"k": k, "t0": round(a / fps, 3), "t1": round(b / fps, 3), "dur": round((b - a) / fps, 3),
                      "move_px": mv, "flow": round(flow_mag(frames, a, b) * fps, 4)})   # flow = frame widths per second
    js = {"video": str(video), "fps": fps, "frames": n, "dur": round(n / fps, 2), "shots": shots}
    (d / "shots.json").write_text(json.dumps(js, indent=1))
    print(f"{tag}: {len(shots)} shots, {n / fps:.1f} s, mean {n / fps / max(1, len(shots)):.2f} s", flush=True)
    return js


PROMPT = """You are measuring camera framing in vertical 9:16 low-poly 3D animated shorts about a pet ({animal}) and people, frame by frame, as a cinematographer would. Be numeric and literal; do not flatter or guess the style.
For each SHOT you get the MIDDLE frame (large) and a strip of its FIRST | LAST frames (small). Ignore burned-in yellow captions.
Real-world size references (use them to judge scale): the {animal} {animal_ref}; an adult human is ~1.75 m; a door ~2.0 m; a sofa seat ~0.45 m; a dining table ~0.75 m; a kitchen counter ~0.9 m.
Return ONLY a JSON array, one object per shot, with exactly these keys:
{{"shot": n,
 "size": one of ["ECU","CU","MCU","MS","MFS","FS","WS","INSERT"]  (size of the MAIN subject: ECU = part of the face; CU = head; MCU = head+chest; MS = waist up / for an animal head + front half; MFS = knees up / animal almost whole; FS = whole body with little room; WS = whole body small in a room),
 "main": "animal" | "human" | "object" | "both",
 "animal_box": [x0,y0,x1,y1] or null  (the {animal}'s visible body in the middle frame, fractions 0..1 of frame width/height, y down),
 "animal_cut": "none"|"top"|"bottom"|"sides"|"several",
 "animal_pose": short text (sitting / standing / lying / walking, facing camera / side / back),
 "human_box": [x0,y0,x1,y1] or null  (the most prominent human, visible body),
 "human_cut": "none"|"head"|"above_knees"|"waist"|"chest"|"several",
 "human_head_y": head-top y fraction or null,
 "cam_height_m": estimated camera height above the floor in metres (use the references),
 "cam_rel": one of ["below_animal_eye","animal_eye","above_animal_low","human_waist","human_chest","human_eye","above_human"],
 "pitch_deg": camera pitch in degrees (0 = level, negative = looking down),
 "hfov_deg": estimated HORIZONTAL field of view of this 9:16 frame in degrees (strong converging perspective close to subjects = wide, flat = tele),
 "subject_dist_m": estimated distance from camera to the main subject in metres,
 "set_visible": one of ["none","patch","corner","one_wall","most_room"],
 "set_frac": fraction of the frame area that is set (not subjects, not sky),
 "props": up to 3 objects of furniture/architecture visible with their apparent height divided by the {animal}'s apparent full height (same depth if possible) as [["name", ratio], ...],
 "set_scale_vs_real": how big the furniture/architecture looks relative to the {animal} compared with real life (1.0 = realistic, 1.5 = 50 % oversized),
 "foreground": null or {{"what": text, "dist_m": metres from the camera, "frac": fraction of the frame it covers}},
 "move": one of ["static","push_in","pull_out","track_lateral","pan","tilt","crane_up","crane_down","orbit","zoom","whip","handheld"],
 "notes": max 12 words}}"""

REF = {"cat": "is a domestic cat: ~0.25 m at the shoulder, ~0.32 m to the top of the head when sitting, ~0.45 m long",
       "dog": "is a beagle-size dog: ~0.40 m at the shoulder, ~0.60 m to the top of the head when sitting, ~0.75 m long"}


def b64(p):
    return {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(Path(p).read_bytes()).decode()}}


def strip(d, k):
    a, b = cv2.imread(str(d / f"s{k:02d}_a.jpg")), cv2.imread(str(d / f"s{k:02d}_b.jpg"))
    s = np.hstack([cv2.resize(a, (180, 320)), np.zeros((320, 6, 3), np.uint8), cv2.resize(b, (180, 320))])
    p = d / f"s{k:02d}_ab.jpg"; cv2.imwrite(str(p), s, [cv2.IMWRITE_JPEG_QUALITY, 80]); return p


def stage2(out, tag, animal):
    import anthropic
    from revisar_render import load_env_key
    d = out / tag; js = json.loads((d / "shots.json").read_text())
    if (d / "measure.json").exists():
        return json.loads((d / "measure.json").read_text())
    client = anthropic.Anthropic(api_key=load_env_key(), timeout=900)
    rows = []
    shots = js["shots"]
    for i0 in range(0, len(shots), 10):
        content = []
        for j, s in enumerate(shots[i0:i0 + 10], i0 + 1):
            content += [{"type": "text", "text": f"SHOT {j} ({s['dur']:.2f} s) middle frame:"}, b64(d / f"s{s['k']:02d}_m.jpg"),
                        {"type": "text", "text": f"SHOT {j} first | last:"}, b64(strip(d, s["k"]))]
        content.append({"type": "text", "text": PROMPT.format(animal=animal, animal_ref=REF[animal])})
        with client.messages.stream(model=MODEL, max_tokens=16000, messages=[{"role": "user", "content": content}]) as st:
            r = st.get_final_message()
        text = "".join(b.text for b in r.content if b.type == "text").strip()
        rows += json.loads(text[text.find("["): text.rfind("]") + 1])
        print(f"  {tag} shots {i0 + 1}-{i0 + len(shots[i0:i0 + 10])}: {r.usage.input_tokens} in / {r.usage.output_tokens} out", flush=True)
    for row, s in zip(rows, shots):
        row.update(t0=s["t0"], t1=s["t1"], dur=s["dur"], move_px=s["move_px"], flow=s["flow"], k=s["k"])
    (d / "measure.json").write_text(json.dumps(rows, indent=1))
    return rows


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    out = Path(a[0]); api = "--api" in sys.argv
    for spec in a[1:]:
        tag, video = spec.split("=", 1)
        if not (out / tag / "shots.json").exists():
            stage1(out, tag, Path(video))
        if api:
            stage2(out, tag, "dog" if tag.startswith("ours") else "cat")

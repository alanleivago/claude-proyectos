"""Animation review: contact sheets and the labelled all-clips front video.
python -I tools/wanim/anim_review.py sheet <opt> clip,clip [views]     -> review/_anim_<opt>.png
python -I tools/wanim/anim_review.py video                           -> review/anims_front.mp4 (B | C side by side)
python -I tools/wanim/anim_review.py combo                           -> review/face_combo.png (3D head close-ups)"""
import os, sys, json, subprocess, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, "tools"))
import rig as RG

BL = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
S = RG.S_ENGINE
u = lambda c: [c[0] * S, c[1] * S, c[2] * S + RG.FLOOR]
TMP = os.path.join(ROOT, "review", "_tmp"); os.makedirs(TMP, exist_ok=True)
FT = json.load(open(os.path.join(ROOT, "out", "face_tracks.json"))); META = FT["_meta"]
GLB = {"B": os.path.join(ROOT, "out", "waitress_shorts.blend"), "C": os.path.join(ROOT, "out", "waitress_jeans.blend")}


def face_at(clip, i):
    e, m = "open", "neutral"
    for k in FT.get(clip, []):
        if k[0] <= i + 1: e, m = k[1], k[2]
    return e, m


def render(blend, shots, size=400):
    spec = os.path.join(TMP, f"aspec_{os.getpid()}.json")
    json.dump({"size": size, "meta": META, "shots": shots}, open(spec, "w"))
    r = subprocess.run([BL, "-b", blend, "--factory-startup", "--python", os.path.join(HERE, "bl_anim_render.py"), "--", spec],
                       capture_output=True, text=True, timeout=3600)
    if "ARENDER done" not in r.stdout: print(r.stdout[-3000:], r.stderr[-2000:]); raise SystemExit("render failed")


def font(n):
    for f in ("arialbd.ttf", "arial.ttf"):
        try: return ImageFont.truetype(f, n)
        except Exception: pass
    return ImageFont.load_default()


def nframes(clip):
    import numpy as np
    A = np.load(os.path.join(ROOT, "ref", "anim_w.npz"), allow_pickle=True); return len(A["q_" + clip])


def frame_ctr(clip):
    floor = any(w in clip for w in ("sit_floor", "kneel", "lie", "hug"))
    low = any(w in clip for w in ("sit", "crouch", "hands_on_knees"))
    if floor: return dict(ctr=u([0, 0, 0.42]), ext=1.25 * S)
    return dict(ctr=u([0, 0, 0.7 if low else 0.88]), ext=(1.6 if low else 1.9) * S)


def sheet(opt, clips, views="front"):
    clips = clips.split(","); views = views.split(","); rows = []; labels = []
    for c in clips:
        n = nframes(c); fr = [int(round(x)) for x in np.linspace(0, n - 1, 6)]
        for v in views:
            shots = [dict(out=os.path.join(TMP, f"as_{c}_{v}_{f}.png"), clip=c, frame=f + 1, view=v, **frame_ctr(c),
                          **dict(zip(("eyes", "mouth"), face_at(c, f)))) for f in fr]
            render(GLB[opt], shots, 300); rows.append([s["out"] for s in shots]); labels.append(f"{c}\n{v}")
    import review as RV
    RV.grid(rows, os.path.join(ROOT, "review", f"_anim_{opt}.png"), labels, None, f"option {opt}: frames across each clip")


def video():
    A = np.load(os.path.join(ROOT, "ref", "anim_w.npz"), allow_pickle=True); clips = json.loads(str(A["clips"]))
    acts = json.load(open(os.path.join(ROOT, "out", "actions.json")))
    fdir = os.path.join(TMP, "vid"); shutil.rmtree(fdir, ignore_errors=True); os.makedirs(fdir)
    for opt in "BC":
        shots = []
        for c in clips:
            n = len(A["q_" + c]); reps = 1 if n > 60 or not acts[c].get("loop") else 2
            for r in range(reps):
                for i in range(n):
                    e, m = face_at(c, i)
                    shots.append(dict(out=os.path.join(fdir, f"{opt}_{c}_{r}_{i:03d}.png"), clip=c, frame=i + 1, view="front",
                                      ctr=u([0, 0, 0.86]), ext=1.95 * S, eyes=e, mouth=m))
        render(GLB[opt], shots, 480)
    # compose: B | C, label bar
    out = os.path.join(fdir, "seq"); os.makedirs(out)
    k = 0; F = font(22); F2 = font(16)
    for c in clips:
        n = len(A["q_" + c]); reps = 1 if n > 60 or not acts[c].get("loop") else 2
        for r in range(reps):
            for i in range(n):
                b = Image.open(os.path.join(fdir, f"B_{c}_{r}_{i:03d}.png")).convert("RGB"); cc = Image.open(os.path.join(fdir, f"C_{c}_{r}_{i:03d}.png")).convert("RGB")
                im = Image.new("RGB", (960, 540), (34, 36, 42)); im.paste(b, (0, 60)); im.paste(cc, (480, 60))
                d = ImageDraw.Draw(im); e, m = face_at(c, i)
                d.text((12, 8), f"{c}", fill=(240, 240, 240), font=F)
                d.text((12, 34), f"frame {i + 1}/{n}   {'loop' if acts[c].get('loop') else 'one-shot'}   face: {e} / {m}", fill=(200, 200, 200), font=F2)
                d.text((700, 12), "shorts | jeans", fill=(200, 200, 200), font=F2)
                im.save(os.path.join(out, f"{k:05d}.png")); k += 1
    mp4 = os.path.join(ROOT, "review", os.environ.get("VIDEO_NAME", "anims_front.mp4"))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", os.path.join(out, "%05d.png"), "-c:v", "libx264",
                    "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], check=True, timeout=1800)
    print("VIDEO", mp4, k, "frames")


def video360():
    """each clip plays while the camera makes one full orbit (clip repeated to at least 4 s per turn), shorts | jeans"""
    A = np.load(os.path.join(ROOT, "ref", "anim_w.npz"), allow_pickle=True); clips = json.loads(str(A["clips"]))
    acts = json.load(open(os.path.join(ROOT, "out", "actions.json")))
    fdir = os.path.join(TMP, "vid360"); shutil.rmtree(fdir, ignore_errors=True); os.makedirs(fdir)
    plan = []
    for c in clips:
        n = len(A["q_" + c]); loop = acts[c].get("loop")
        tot = max(n, 120) if loop else max(n, 120)
        seq = [i % n for i in range(tot)] if loop else [min(i, n - 1) for i in range(tot)]   # one-shots hold the last pose
        for k, i in enumerate(seq): plan.append((c, k, i, 360.0 * k / tot, n, loop))
    for opt in "BC":
        shots = []
        for c, k, i, yaw, n, loop in plan:
            e, m = face_at(c, i)
            shots.append(dict(out=os.path.join(fdir, f"{opt}_{c}_{k:04d}.png"), clip=c, frame=i + 1, view=yaw, ctr=u([0, 0, 0.86]), ext=1.95 * S, eyes=e, mouth=m))
        render(GLB[opt], shots, 480)
    out = os.path.join(fdir, "seq"); os.makedirs(out); F = font(22); F2 = font(16)
    for idx, (c, k, i, yaw, n, loop) in enumerate(plan):
        b = Image.open(os.path.join(fdir, f"B_{c}_{k:04d}.png")).convert("RGB"); cc = Image.open(os.path.join(fdir, f"C_{c}_{k:04d}.png")).convert("RGB")
        im = Image.new("RGB", (960, 540), (34, 36, 42)); im.paste(b, (0, 60)); im.paste(cc, (480, 60)); d = ImageDraw.Draw(im); e, m = face_at(c, i)
        d.text((12, 8), c, fill=(240, 240, 240), font=F)
        d.text((12, 34), f"frame {i + 1}/{n}  {'loop' if loop else 'one-shot (holds last pose)'}  camera {yaw:5.1f} deg  face: {e} / {m}", fill=(200, 200, 200), font=F2)
        d.text((700, 12), "shorts | jeans", fill=(200, 200, 200), font=F2)
        im.save(os.path.join(out, f"{idx:05d}.png"))
    mp4 = os.path.join(ROOT, "review", os.environ.get("VIDEO_NAME", "anims_360.mp4"))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", os.path.join(out, "%05d.png"), "-c:v", "libx264",
                    "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], check=True, timeout=3600)
    shutil.rmtree(fdir, ignore_errors=True)
    print("VIDEO", mp4, len(plan), "frames")


def combo():
    combos = [("open", "neutral"), ("happy", "smileOpen"), ("blink", "softSmile"), ("surprised", "gasp"), ("angry", "frown"),
              ("sad", "sadPout"), ("wink", "blep"), ("hearts+blush", "kiss+blush"), ("shocked", "bigShock"), ("dizzy", "talkO"),
              ("smirk", "smirk"), ("bedroom+blush", "lipBite+blush"), ("shy+blush", "blushSmile+blush"), ("sparkle", "grin"),
              ("relaxed", "smile"), ("eyeRoll", "talkClosed"), ("disgust", "disgust"), ("tease", "smirkL"), ("half", "talkA"),
              ("smiling", "laugh"), ("gazeL", "parted"), ("sulk", "pout"), ("dreamy+blush", "softSmile+blush"), ("glance", "talkEE")]
    shots = [dict(out=os.path.join(TMP, f"fc_{i}.png"), clip=None, frame=1, view=v, ctr=u([0, 0, 1.585]), ext=0.36 * S, eyes=e, mouth=m)
             for i, (e, m) in enumerate(combos) for v in ("front",)]
    render(GLB["B"], shots, 300)
    shots2 = [dict(out=os.path.join(TMP, f"fc3_{i}.png"), clip=None, frame=1, view="3q", ctr=u([0, 0, 1.585]), ext=0.36 * S, eyes=e, mouth=m)
              for i, (e, m) in enumerate(combos[:8])]
    render(GLB["B"], shots2, 300)
    W = 300; im = Image.new("RGB", (8 * W, 4 * (W + 26) + 46), (34, 36, 42)); d = ImageDraw.Draw(im)
    d.text((10, 10), "Expressions on the model (eyes + mouth atlas cells, flat unlit); last row = 3/4", fill=(235, 235, 235), font=font(22))
    for i, (e, m) in enumerate(combos):
        r, q = divmod(i, 8); im.paste(Image.open(os.path.join(TMP, f"fc_{i}.png")).convert("RGB"), (q * W, 46 + r * (W + 26)))
        d.text((q * W + 6, 46 + r * (W + 26) + W + 3), f"{e} / {m}", fill=(220, 220, 220), font=font(15))
    for i, (e, m) in enumerate(combos[:8]):
        im.paste(Image.open(os.path.join(TMP, f"fc3_{i}.png")).convert("RGB"), (i * W, 46 + 3 * (W + 26)))
        d.text((i * W + 6, 46 + 3 * (W + 26) + W + 3), f"{e} / {m}", fill=(220, 220, 220), font=font(15))
    im.save(os.path.join(ROOT, "review", "face_combo.png")); print("COMBO saved")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "sheet": sheet(*sys.argv[2:])
    else: globals()[cmd]()

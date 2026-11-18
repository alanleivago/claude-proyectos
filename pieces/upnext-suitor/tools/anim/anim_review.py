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
GLB = {"wine": os.path.join(ROOT, "ref", "a_wine.blend")}
NPZ = os.path.join(ROOT, "ref", "anim.npz")
HS = json.load(open(os.path.join(ROOT, "ref", "build3_forest.json")))["height"] / 1.86


def face_at(clip, i):
    e, m = "open", "neutral"
    for k in FT.get(clip, []):
        if k[0] <= i + 1: e, m = k[1], k[2]
    return e, m


def render(blend, shots, size=400, meta=None, override=None):
    spec = os.path.join(TMP, f"aspec_{os.getpid()}.json")
    json.dump({"size": size, "meta": meta or META, "shots": shots, "img_override": override or {}}, open(spec, "w"))
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
    A = np.load(NPZ, allow_pickle=True); return len(A["q_" + clip])


def frame_ctr(clip):
    floor = any(w in clip for w in ("sit_floor", "lie", "hug"))
    low = any(w in clip for w in ("sit", "crouch", "hands_on_knees", "kneel"))
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
    RV.grid(rows, os.path.join(ROOT, "review", os.environ.get("SHEET", "_anim.png")), labels, None, "frames across each clip")


def video():
    A = np.load(NPZ, allow_pickle=True); clips = json.loads(str(A["clips"]))
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
    """each clip plays while the camera makes one full orbit (clip repeated / last pose held to >= 3.2 s per turn), labelled"""
    A = np.load(NPZ, allow_pickle=True); clips = json.loads(str(A["clips"]))
    only = os.environ.get("CLIPS"); clips = [c for c in clips if not only or c in only.split(",")]
    acts = json.load(open(os.path.join(ROOT, "out", "actions.json")))
    fdir = os.path.join(TMP, "vid360"); shutil.rmtree(fdir, ignore_errors=True); os.makedirs(fdir)
    plan = []
    for c in clips:
        n = len(A["q_" + c]); loop = acts[c].get("loop"); tot = max(n, 96)
        seq = [i % n for i in range(tot)] if loop else [min(i, n - 1) for i in range(tot)]
        for k, i in enumerate(seq): plan.append((c, k, i, 360.0 * k / tot, n, loop))
    shots = []
    for c, k, i, yaw, n, loop in plan:
        e, m = face_at(c, i); fc = frame_ctr(c)
        shots.append(dict(out=os.path.join(fdir, f"{c}_{k:04d}.png"), clip=c, frame=i + 1, view=yaw, eyes=e, mouth=m, **fc))
    render(GLB["wine"], shots, 540)
    out = os.path.join(fdir, "seq"); os.makedirs(out); F = font(24); F2 = font(16)
    for idx, (c, k, i, yaw, n, loop) in enumerate(plan):
        b = Image.open(os.path.join(fdir, f"{c}_{k:04d}.png")).convert("RGB")
        im = Image.new("RGB", (540, 620), (34, 36, 42)); im.paste(b, (0, 80)); d = ImageDraw.Draw(im); e, m = face_at(c, i)
        note = acts[c].get("note", "")[:70]
        d.text((12, 8), c, fill=(240, 240, 240), font=F)
        d.text((12, 38), f"frame {i + 1}/{n}  {'loop' if loop else 'one-shot (holds last pose)'}  cam {yaw:5.1f}", fill=(200, 200, 200), font=F2)
        d.text((12, 58), f"face {e} / {m}   {note}", fill=(170, 170, 170), font=font(13))
        im.save(os.path.join(out, f"{idx:05d}.png"))
    mp4 = os.path.join(ROOT, "review", os.environ.get("VIDEO_NAME", "anims_360.mp4"))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", os.path.join(out, "%05d.png"), "-c:v", "libx264",
                    "-crf", "21", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], check=True, timeout=3600)
    shutil.rmtree(fdir, ignore_errors=True)
    print("VIDEO", mp4, len(plan), "frames")


def combo():
    combos = [("open", "neutral"), ("happy", "smileOpen"), ("blink", "softSmile"), ("surprised", "gasp"), ("angry", "frown"),
              ("sad", "sadPout"), ("wink", "blep"), ("hearts+blush", "smile+blush"), ("shocked", "bigShock"), ("dizzy", "talkO"),
              ("smirk", "smirk"), ("half+blush", "cat+blush"), ("shy+blush", "blushSmile+blush"), ("sparkle", "grin"),
              ("relaxed", "smile"), ("eyeRoll", "talkClosed"), ("disgust", "disgust"), ("tease", "smirkL"), ("half", "talkA"),
              ("smiling", "laugh"), ("gazeL", "parted"), ("sulk", "pout"), ("dreamy+blush", "softSmile+blush"), ("glance", "talkEE")]
    shots = [dict(out=os.path.join(TMP, f"fc_{i}.png"), clip=None, frame=1, view=v, ctr=u([0, 0, 1.64 * HS]), ext=0.46 * S * HS, eyes=e, mouth=m)
             for i, (e, m) in enumerate(combos) for v in ("front",)]
    render(GLB["wine"], shots, 300)
    shots2 = [dict(out=os.path.join(TMP, f"fc3_{i}.png"), clip=None, frame=1, view="3q", ctr=u([0, 0, 1.64 * HS]), ext=0.46 * S * HS, eyes=e, mouth=m)
              for i, (e, m) in enumerate(combos[:8])]
    render(GLB["wine"], shots2, 300)
    W = 300; im = Image.new("RGB", (8 * W, 4 * (W + 26) + 46), (34, 36, 42)); d = ImageDraw.Draw(im)
    d.text((10, 10), "Suitor expressions on the model (eyes + mouth atlas cells, flat unlit); last row = 3/4", fill=(235, 235, 235), font=font(22))
    for i, (e, m) in enumerate(combos):
        r, q = divmod(i, 8); im.paste(Image.open(os.path.join(TMP, f"fc_{i}.png")).convert("RGB"), (q * W, 46 + r * (W + 26)))
        d.text((q * W + 6, 46 + r * (W + 26) + W + 3), f"{e} / {m}", fill=(220, 220, 220), font=font(15))
    for i, (e, m) in enumerate(combos[:8]):
        im.paste(Image.open(os.path.join(TMP, f"fc3_{i}.png")).convert("RGB"), (i * W, 46 + 3 * (W + 26)))
        d.text((i * W + 6, 46 + 3 * (W + 26) + W + 3), f"{e} / {m}", fill=(220, 220, 220), font=font(15))
    im.save(os.path.join(ROOT, "review", "face_combo.png")); print("COMBO saved")


def eyes64():
    """all 64 eye cells on the model, zoomed on the eyes (mouth neutral) + the native-texel zoom of the rebuilt cells"""
    names = META["face_eyes"]
    shots = [dict(out=os.path.join(TMP, f"e64_{i}.png"), clip=None, frame=1, view="front", ctr=u([0, 0, 1.60 * HS * 1.86 / 1.82]),
                  ext=0.27 * S * HS, eyes=n, mouth="neutral") for i, n in enumerate(names)]
    render(GLB["wine"], shots, 240)
    W, Hh = 240, 240 + 22; cols = 8; rows = (len(names) + cols - 1) // cols
    zoom = Image.open(os.path.join(ROOT, "review", "_eyezoom.png")).convert("RGB")
    im = Image.new("RGB", (max(cols * W, zoom.width), 46 + rows * Hh + zoom.height + 10), (34, 36, 42)); d = ImageDraw.Draw(im)
    d.text((10, 10), "v3: all 64 eye cells on the model (zoomed on the eyes, flat unlit); below: the rebuilt cells at native texels", fill=(235, 235, 235), font=font(22))
    for i, n in enumerate(names):
        r, q = divmod(i, cols); im.paste(Image.open(os.path.join(TMP, f"e64_{i}.png")).convert("RGB"), (q * W, 46 + r * Hh))
        d.text((q * W + 6, 46 + r * Hh + W + 2), n, fill=(220, 220, 220), font=font(15))
    im.paste(zoom, (0, 46 + rows * Hh + 10))
    im.save(os.path.join(ROOT, "review", "face_cells_v3.png")); print("EYES64 saved")


def fix_armpit_blush():
    """before / after: raised-arm poses (armpit) and blush cells on the face"""
    before = os.path.join(ROOT, "ref", "before_fix.blend"); after = GLB["wine"]
    poses = [("reach_up", 17, "front"), ("reach_up", 17, "3qb"), ("cheer", 18, "front"), ("euphoria", 30, "3q"), ("receive_object", 20, "side2")]
    faces = [("shy+blush", "softSmile+blush"), ("happy+blush", "blushSmile+blush"), ("open+blush", "talkClosed+blush")]
    oldmeta = dict(META); oldmeta["cell_px"] = [184, 96]
    rows = []
    for tag, bl, ov, meta in (("b", before, {"face_eyes": os.path.join(ROOT, "tex", "face_eyes_before.png")}, oldmeta), ("a", after, {}, META)):
        sh = [dict(out=os.path.join(TMP, f"fx_{tag}_{i}.png"), clip=c, frame=f + 1, view=v, ctr=u([0, 0, 1.25 * HS]), ext=0.95 * S * HS,
                   eyes="open", mouth="neutral") for i, (c, f, v) in enumerate(poses)]
        sh += [dict(out=os.path.join(TMP, f"fx_{tag}_f{i}.png"), clip=None, frame=1, view="front", ctr=u([0, 0, 1.58 * HS * 1.86 / 1.82]),
                    ext=0.34 * S * HS, eyes=e, mouth=m) for i, (e, m) in enumerate(faces)]
        render(bl, sh, 300, meta=meta, override=ov); rows.append([x["out"] for x in sh])
    import review as RV
    RV.grid(rows, os.path.join(ROOT, "review", "fix_armpit_blush.png"), ["before", "after"],
            ["reach_up", "reach_up (back)", "cheer", "euphoria", "receive (side)"] + [f"{e}" for e, m in faces],
            "Armpit skinning (blended chest/clavicle/upper arm + clavicle lift) and blush moved onto the cheeks: before | after")


def armpit_v2():
    """shot-14 pose (reach_up f17) + straight up (cheer) + 90 deg (euphoria): before | after the armpit bridge"""
    M = json.load(open(os.path.join(ROOT, "ref", "armpit_measure.json")))
    before = os.path.join(ROOT, "ref", "before_armpit2.blend"); after = GLB["wine"]
    poses = [("reach_up", 16, "front"), ("reach_up", 16, "3q"), ("reach_up", 16, "back"), ("cheer", 17, "front"), ("cheer", 17, "3q"),
             ("euphoria", 30, "front"), ("euphoria", 30, "3qb")]
    rows = []
    for tag, bl in (("b", before), ("a", after)):
        sh = [dict(out=os.path.join(TMP, f"ap2_{tag}_{i}.png"), clip=c, frame=f + 1, view=v, ctr=u([0, 0, 1.30 * HS]), ext=0.80 * S * HS,
                   eyes="surprised", mouth="parted") for i, (c, f, v) in enumerate(poses)]
        render(bl, sh, 300); rows.append([x["out"] for x in sh])
    import review as RV
    m = lambda k, s: M[k][s]["thickness_cm"]
    title = (f"Armpit bridge (front web + back web + armpit floor, chest->upper arm). Shoulder section depth 5 cm down the raised arm: "
             f"reach_up {m('before reach_up','R')} -> {m('after reach_up','R')} cm, straight up {m('before cheer','R')} -> {m('after cheer','R')} cm, "
             f"90 deg {m('before euphoria','R')} -> {m('after euphoria','R')} cm")
    RV.grid(rows, os.path.join(ROOT, "review", "armpit_v2.png"), ["before", "after"],
            ["reach_up (shot 14)", "reach_up 3/4", "reach_up back", "straight up", "straight up 3/4", "90 deg", "90 deg 3/4 back"], title)


def blush_soft():
    D = json.load(open(os.path.join(ROOT, "ref", "blush_diff.json")))
    faces = [("shy+blush", "softSmile+blush"), ("happy+blush", "blushSmile+blush"), ("open+blush", "talkClosed+blush"), ("gazeDown+blush", "smile+blush"),
             ("open", "neutral")]
    rows = []
    for tag, ov in (("b", {"face_eyes": os.path.join(ROOT, "tex", "face_eyes_prev.png")}), ("a", {})):
        sh = [dict(out=os.path.join(TMP, f"bs_{tag}_{i}.png"), clip=None, frame=1, view="front", ctr=u([0, 0, 1.585 * HS * 1.86 / 1.82]),
                   ext=0.26 * S * HS, eyes=e, mouth=m) for i, (e, m) in enumerate(faces)]
        sh.append(dict(out=os.path.join(TMP, f"bs_{tag}_3q.png"), clip=None, frame=1, view="3q", ctr=u([0, 0, 1.585 * HS * 1.86 / 1.82]),
                       ext=0.26 * S * HS, eyes="shy+blush", mouth="softSmile+blush"))
        render(GLB["wine"], sh, 300, override=ov); rows.append([x["out"] for x in sh])
    import review as RV
    t = (f"Blush softened (feathered edge + 1-texel dither, ~32 % lower opacity) in the 32 +blush cells only. Pixel diff of the non-blush cells: "
         f"eyes {D['eyes']['nonblush_changed_px']} px, mouths {D['mouth']['nonblush_changed_px']} px changed")
    RV.grid(rows, os.path.join(ROOT, "review", "blush_soft.png"), ["before", "after"], [e for e, m in faces] + ["shy+blush 3/4"], t)


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "sheet": sheet(*sys.argv[2:])
    else: globals()[cmd]()

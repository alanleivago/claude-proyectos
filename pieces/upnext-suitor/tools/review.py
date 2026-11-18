"""Review sheets.  python -I tools/review.py <quick|turntable|options|arms|walk> [opt]"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BL = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
TMP = os.path.join(ROOT, "review", "_tmp")
os.makedirs(TMP, exist_ok=True)
C = 0.0


def run(blend, shots, size=512, orig=False):
    spec = os.path.join(TMP, "spec.json")
    json.dump({"orig_offset_x": -C if orig else None, "size": size, "shots": shots}, open(spec, "w"))
    r = subprocess.run([BL, "-b", blend, "--factory-startup", "--python", os.path.join(ROOT, "tools", "bl_review.py"), "--", spec],
                       capture_output=True, text=True, timeout=900)
    if "REVIEW done" not in r.stdout:
        print(r.stdout[-3000:], r.stderr[-2000:]); raise SystemExit("render failed")


def font(n):
    for f in ("arialbd.ttf", "arial.ttf"):
        try: return ImageFont.truetype(f, n)
        except Exception: pass
    return ImageFont.load_default()


def grid(rows, out, labels_r=None, labels_c=None, title=None, crop=None):
    ims = [[Image.open(p).convert("RGB") for p in r] for r in rows]
    if crop:
        ims = [[i.crop(crop(i)) for i in r] for r in ims]
    w, h = ims[0][0].size
    lw = 150 if labels_r else 0
    th = 40 if labels_c else 0
    tt = 46 if title else 0
    W, H = lw + w * max(len(r) for r in ims), tt + th + h * len(ims)
    o = Image.new("RGB", (W, H), (34, 36, 42)); d = ImageDraw.Draw(o)
    if title: d.text((12, 10), title, fill=(235, 235, 235), font=font(24))
    for j, l in enumerate(labels_c or []):
        d.text((lw + j * w + 10, tt + 8), l, fill=(220, 220, 220), font=font(20))
    for i, r in enumerate(ims):
        for j, im in enumerate(r):
            o.paste(im, (lw + j * w, tt + th + i * h))
        if labels_r: d.text((10, tt + th + i * h + h // 2 - 12), labels_r[i], fill=(235, 235, 235), font=font(20))
    o.save(out)
    print("SHEET", out, o.size)


import sys as _s; _s.path.insert(0, os.path.join(ROOT, "tools", "anim"))
import rig as RG
S = RG.S_ENGINE
u = lambda c: [c[0] * S, c[1] * S, c[2] * S + RG.FLOOR]
BODY = dict(ctr=u([0, 0, 0.90]), ext=1.95 * S)
BODY2 = dict(ctr=u([0, 0, 0.90]), ext=1.95 * S)
VIEWS = [("front", "front"), ("3q", "3/4"), ("side", "side"), ("back", "back")]
cr = lambda i: (64, 0, i.width - 64, i.height)
ORIG = os.path.join(ROOT, "ref", "orig.blend")
ORIG_ENGINE = os.path.join(ROOT, "ref", "orig_engine.blend")
ORIG_ENGINE_V2 = os.path.join(ROOT, "ref", "orig_engine_v2.blend")


def blend(opt): return os.path.join(ROOT, "ref", f"s_{opt}.blend")


def quick(opt="wine", name="_quick"):
    shots = [dict(out=os.path.join(TMP, f"q_{v}.png"), view=v, **BODY) for v, _ in VIEWS + [("3qb", "")]]
    run(blend(opt), shots)
    grid([[s["out"] for s in shots]], os.path.join(ROOT, "review", f"{name}_{opt}.png"), crop=cr)


def close(opt="wine", z="1.1", ext="0.8"):
    c = dict(ctr=u([0, 0, float(z)]), ext=float(ext) * S)
    shots = [dict(out=os.path.join(TMP, f"c_{v}_{e}.png"), view=v, elev=e, **c) for v, e in (("front", 0), ("3q", 10), ("side", 0), ("3qb", 10), ("back", 0), ("front", -30))]
    run(blend(opt), shots, size=400)
    grid([[s["out"] for s in shots]], os.path.join(ROOT, "review", f"_close_{opt}.png"))




WAITRESS = os.path.abspath(os.path.join(ROOT, "..", "upnext-waitress", "out", "waitress_jeans.blend"))


def pair_shots(opt, shots, size=512, dx=0.62):
    spec = os.path.join(TMP, "pspec.json"); json.dump({"size": size, "shots": shots}, open(spec, "w"))
    r = subprocess.run([BL, "-b", blend(opt), "--factory-startup", "--python", os.path.join(ROOT, "tools", "bl_pair.py"), "--",
                        WAITRESS, str(dx * S), spec], capture_output=True, text=True, timeout=900)
    if "REVIEW done" not in r.stdout: print(r.stdout[-3000:], r.stderr[-2000:]); raise SystemExit("render failed")


NAMES = {"wine": "wine red\n(recommended)", "forest": "forest green", "oat": "oatmeal"}


def options():
    rows = []
    for o in ("wine", "forest", "oat"):
        s = [dict(out=os.path.join(TMP, f"op_{o}_{v}.png"), view=v, **BODY) for v in ("front", "3q", "3qb")]
        run(blend(o), s)
        p = [dict(out=os.path.join(TMP, f"op_{o}_pair.png"), view="3q", ctr=u([0.31, 0, 0.9]), ext=1.95 * S, aspect=1.25)]
        pair_shots(o, p)
        im = Image.open(p[0]["out"]).convert("RGB").resize((512, 410)); bg = Image.new("RGB", (512, 512), im.getpixel((2, 2))); bg.paste(im, (0, 51)); bg.save(p[0]["out"])
        rows.append([x["out"] for x in s] + [p[0]["out"]])
    grid(rows, os.path.join(ROOT, "review", "colour_options.png"), [NAMES[o] for o in ("wine", "forest", "oat")],
         ["front", "3/4", "3/4 back", "next to the waitress (jeans)"], "Sweater colour options (trousers black, same model)", cr)


def turntable(opt="wine"):
    so = [dict(out=os.path.join(TMP, f"o_{v}.png"), view=v, **BODY) for v, _ in VIEWS]
    sm = [dict(out=os.path.join(TMP, f"m_{v}.png"), view=v, **BODY) for v, _ in VIEWS]
    run(ORIG_ENGINE, so); run(blend(opt), sm)
    grid([[s["out"] for s in so], [s["out"] for s in sm]], os.path.join(ROOT, "review", "turntable.png"),
         ["original\n(rip)", f"modified\n({opt})"], [l for _, l in VIEWS],
         "Suitor (MML Artillery rip): original vs modified, flat unlit", cr)


def turntable_v2():
    rows = []
    for tag, bl in (("o", ORIG_ENGINE_V2), ("v1", blend("wine")), ("v2", os.path.join(ROOT, "ref", "s2_forest.blend"))):
        sh = [dict(out=os.path.join(TMP, f"tt_{tag}_{v}.png"), view=v, **BODY) for v, _ in VIEWS]
        run(bl, sh); rows.append([x["out"] for x in sh])
    grid(rows, os.path.join(ROOT, "review", "turntable_v2.png"), ["original (scaled)", "v1", "v2"], [l for _, l in VIEWS],
         "Suitor: original | v1 | v2 (original lower body, bare fists, original belly shading, forest green, 1.52 m), flat unlit", cr)


def height_pair():
    WS = os.path.abspath(os.path.join(ROOT, "..", "upnext-waitress", "out", "waitress_shorts.blend"))
    shots = [dict(out=os.path.join(TMP, f"hp_{v}.png"), view=v, ctr=u([0.28, 0, 0.92]), ext=2.0 * S, aspect=1.3) for v in ("front", "3q", "back")]
    spec = os.path.join(TMP, "pspec.json"); json.dump({"size": 560, "shots": shots}, open(spec, "w"))
    r = subprocess.run([BL, "-b", os.path.join(ROOT, "ref", "s2_forest.blend"), "--factory-startup", "--python", os.path.join(ROOT, "tools", "bl_pair.py"), "--",
                        WS, str(0.56 * S), spec], capture_output=True, text=True, timeout=900)
    if "REVIEW done" not in r.stdout: print(r.stdout[-3000:], r.stderr[-2000:]); raise SystemExit("render failed")
    grid([[x["out"] for x in shots]], os.path.join(ROOT, "review", "height_pair.png"), None, ["front", "3/4", "back"],
         "Height: suitor v2 (1.52 m) next to the waitress (1.75 m, shorts GLB): she is clearly taller", None)


def turntable_v3():
    rows = []
    for tag, bl in (("o", os.path.join(ROOT, "ref", "orig_engine_v3.blend")), ("v2", os.path.join(ROOT, "ref", "s2_forest.blend")),
                    ("v3", os.path.join(ROOT, "ref", "s3_forest.blend"))):
        sh = [dict(out=os.path.join(TMP, f"t3_{tag}_{v}.png"), view=v, **BODY) for v, _ in VIEWS]
        run(bl, sh); rows.append([x["out"] for x in sh])
    grid(rows, os.path.join(ROOT, "review", "turntable_v3.png"), ["original (1.67)", "v2 (1.52)", "v3 (1.67)"], [l for _, l in VIEWS],
         "Suitor: original | v2 | v3 (1.67 m, smaller fists, blended knees, green collar, pocket openings), flat unlit", cr)


def height_pair_v3():
    WS = os.path.abspath(os.path.join(ROOT, "..", "upnext-waitress", "out", "waitress_shorts.blend"))
    shots = [dict(out=os.path.join(TMP, f"hp3_{v}.png"), view=v, ctr=u([0.28, 0, 0.92]), ext=2.0 * S, aspect=1.3) for v in ("front", "3q", "back")]
    shots.append(dict(out=os.path.join(TMP, "hp3_head.png"), view="front", ctr=u([0.28, 0, 1.55]), ext=0.6 * S, aspect=1.3))
    spec = os.path.join(TMP, "pspec.json"); json.dump({"size": 560, "shots": shots}, open(spec, "w"))
    r = subprocess.run([BL, "-b", os.path.join(ROOT, "ref", "s3_forest.blend"), "--factory-startup", "--python", os.path.join(ROOT, "tools", "bl_pair.py"), "--",
                        WS, str(0.56 * S), spec], capture_output=True, text=True, timeout=900)
    if "REVIEW done" not in r.stdout: print(r.stdout[-3000:], r.stderr[-2000:]); raise SystemExit("render failed")
    grid([[x["out"] for x in shots]], os.path.join(ROOT, "review", "height_pair_v3.png"), None, ["front", "3/4", "back", "close-up: his hair top vs her brow"],
         "Height v3: suitor 1.67 m next to the waitress 1.75 m (shorts GLB): she is slightly taller", None)


if __name__ == "__main__":
    cmd = sys.argv[1]; a = sys.argv[2:]
    globals()[cmd](*a)

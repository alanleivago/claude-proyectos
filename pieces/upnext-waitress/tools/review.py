"""Review sheets.  python -I tools/review.py <quick|turntable|options|arms|walk> [opt]"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BL = r"/Applications/Blender.app/Contents/MacOS/Blender"
TMP = os.path.join(ROOT, "review", "_tmp")
os.makedirs(TMP, exist_ok=True)
C = json.load(open(os.path.join(ROOT, "ref", "build_A.json")))["centre_x"]
BODY = dict(ctr=[0, 0, 0.88], ext=1.9)


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


def blend(opt): return os.path.join(ROOT, "ref", f"waitress_{opt}.blend")
ORIG = os.path.join(ROOT, "review", "look", "orig.blend")
VIEWS = [("front", "front"), ("3q", "3/4"), ("side", "side"), ("back", "back")]


def quick(opt="A"):
    shots = [dict(out=os.path.join(TMP, f"q_{v}.png"), view=v, **BODY) for v, _ in VIEWS]
    run(blend(opt), shots)
    grid([[s["out"] for s in shots]], os.path.join(ROOT, "review", f"_quick_{opt}.png"))


def turntable():
    so = [dict(out=os.path.join(TMP, f"o_{v}.png"), view=v, **BODY) for v, _ in VIEWS]
    sm = [dict(out=os.path.join(TMP, f"m_{v}.png"), view=v, **BODY) for v, _ in VIEWS]
    run(ORIG, so, orig=True); run(blend("A"), sm)
    cr = lambda i: (64, 0, i.width - 64, i.height)
    grid([[s["out"] for s in so], [s["out"] for s in sm]], os.path.join(ROOT, "review", "turntable.png"),
         ["original", "modified\n(A: pleated\nmini)"], [l for _, l in VIEWS], "Waitress (MML2 rip): original vs modified, flat unlit", cr)


def options():
    rows = []
    for opt in "ABC":
        s = [dict(out=os.path.join(TMP, f"op{opt}_{v}.png"), view=v, **BODY) for v in ("front", "3q", "3qb")]
        run(blend(opt), s); rows.append([x["out"] for x in s])
    cr = lambda i: (64, 0, i.width - 64, i.height)
    grid(rows, os.path.join(ROOT, "review", "outfit_options.png"),
         ["A pleated mini\n(recommended)", "B high-waist\nshorts", "C cropped\nslim jeans"], ["front", "3/4", "3/4 back"],
         "Outfit options (same rig, legs and shoes)", cr)


def arms():
    # close-ups: right arm from her right, left arm from her left (mirror), front/back pair, both arms down
    up = dict(ctr=[0, 0, 1.08], ext=0.75)
    s = [dict(out=os.path.join(TMP, "a_r.png"), view="side2", **{"ctr": [-0.2, 0, 1.08], "ext": 0.75}),
         dict(out=os.path.join(TMP, "a_l.png"), view="side", **{"ctr": [0.2, 0, 1.08], "ext": 0.75}),
         dict(out=os.path.join(TMP, "a_f.png"), view="front", **up),
         dict(out=os.path.join(TMP, "a_b.png"), view="back", **up),
         dict(out=os.path.join(TMP, "a_down.png"), view="front", **BODY),
         dict(out=os.path.join(TMP, "a_t.png"), view="front", action="Tpose", frame=1, ctr=[0, 0, 0.88], ext=1.9)]
    run(blend("A"), s)
    grid([[s[0]["out"], s[1]["out"], s[2]["out"]], [s[3]["out"], s[4]["out"], s[5]["out"]]],
         os.path.join(ROOT, "review", "arm_check.png"), None, None,
         "Top: her right arm | her left arm (rebuilt as mirror) | front.   Bottom: back | both arms down (rest) | T-pose")


def walk(opt="A"):
    rows = []
    for v in ("side", "front", "3q"):
        s = [dict(out=os.path.join(TMP, f"w_{v}_{f}.png"), view=v, action="walk", frame=f, **BODY) for f in (1, 4, 7, 10, 13, 16, 19, 22)]
        run(blend(opt), s, size=320); rows.append([x["out"] for x in s])
    s = [dict(out=os.path.join(TMP, f"i_{f}.png"), view="3q", action="idle", frame=f, **BODY) for f in (1, 13, 25, 37)]
    s += [dict(out=os.path.join(TMP, f"wl_{f}.png"), view="front", action="walk", frame=f, elev=-25, **BODY) for f in (1, 7, 13, 19)]
    run(blend(opt), s, size=320); rows.append([x["out"] for x in s])
    grid(rows, os.path.join(ROOT, "review", f"anim_check_{opt}.png"), ["walk side", "walk front", "walk 3/4", "idle | low"], None,
         f"Option {opt}: walk (frames 1-22) and idle / low-angle walk")


if __name__ == "__main__":
    cmd = sys.argv[1]; a = sys.argv[2:]
    globals()[cmd](*a)

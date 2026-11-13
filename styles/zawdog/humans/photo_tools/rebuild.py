"""Kit v6: rebuild one human with its Flow garment photo + the review renders (fresh Blender per step).
    .venv/bin/python styles/zawdog/humans/photo_tools/rebuild.py <slug> [out_dir] [--no-renders]
build_human3 (photo/map.npz -> garments from the photo) -> idle bake c_<slug>_idle -> inspect_human + sheet.py
-> cast sheet <out_dir>/<slug>_cast.jpg (default pieces/zaw-dog-06/review/cast). The owner is not in cast.json: hair=short02."""
import json, os, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".."))
BL = "/Applications/Blender.app/Contents/MacOS/Blender"; PY = os.path.join(R, ".venv/bin/python")
slug = sys.argv[1]
OUT = next((a for a in sys.argv[2:] if not a.startswith("--")), os.path.join(R, "pieces/zaw-dog-06/review/cast"))
cast = {c["slug"]: c for c in json.load(open(os.path.join(R, "styles/zawdog/humans/cast.json")))["cast"]}
c = cast.get(slug, dict(height=1.78, build=dict(hair="short02")))
W = os.path.join(OUT, "work", slug); os.makedirs(W, exist_ok=True)


def run(cmd, tag):
    p = subprocess.run(cmd, cwd=R, capture_output=True, text=True)
    out = p.stdout + p.stderr
    bad = [l for l in out.splitlines() if "Traceback" in l or "Error" in l]
    keep = [l for l in out.splitlines() if l.startswith((slug + ":", slug + " "))]
    print(f"[{tag}] rc={p.returncode}", *keep[:3], *bad[:5], sep="\n  ")
    if p.returncode or any("Traceback" in l for l in bad):
        print(out[-3000:]); sys.exit(1)


run([BL, "-b", "-P", "styles/zawdog/humans/build_human3.py", "--", slug, f"height={c['height']}"] + [f"{k}={v}" for k, v in c["build"].items()], "build")
run([BL, "-b", "-P", "styles/zawdog/tools/retarget.py", "--", "styles/zawdog/motions/100style/Neutral_ID.bvh", f"c_{slug}_idle",
     "start=700", "end=820", f"human={slug}", "still=1", "stance=0.1"], "idle")
if "--no-renders" in sys.argv:
    sys.exit(0)
run([BL, "-b", "-P", "styles/zawdog/humans/inspect_human.py", "--", slug, W], "inspect")
run([PY, "styles/zawdog/humans/sheet.py", W, slug], "sheet")
run([BL, "-b", "-P", "pieces/cast-pack/tools/cast_render.py", "--", "sheet", slug, os.path.join(W, "cs")], "cast_render")
run([PY, "pieces/cast-pack/tools/compose_sheet.py", slug, os.path.join(W, "cs"), os.path.join(OUT, slug + "_cast.jpg")], "compose")

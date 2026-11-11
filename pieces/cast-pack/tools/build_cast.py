"""Build + self-check one cast member from styles/zawdog/humans/cast.json (fresh Blender per step).
    .venv/bin/python pieces/cast-pack/tools/build_cast.py <slug> [--skip-build]
prep_human -> build_human -> idle bake (c_<slug>_idle) -> inspect_human + sheet.py (review/work/<slug>/sheet.jpg)
-> cast_render sheet -> compose_sheet (review/<slug>_cast.jpg)."""
import json, os, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
BL = "/Applications/Blender.app/Contents/MacOS/Blender"; PY = os.path.join(R, ".venv/bin/python")
slug = sys.argv[1]
c = next(x for x in json.load(open(os.path.join(R, "styles/zawdog/humans/cast.json")))["cast"] if x["slug"] == slug)
W = os.path.join(R, "pieces/cast-pack/review/work", slug)


def run(cmd, tag):
    p = subprocess.run(cmd, cwd=R, capture_output=True, text=True)
    out = p.stdout + p.stderr
    bad = [l for l in out.splitlines() if "Traceback" in l or "Error" in l]
    keep = [l for l in out.splitlines() if l.startswith((slug + ":", "skin match", "RETARGET")) or "neck_hw" in l]
    print(f"[{tag}] rc={p.returncode}", *keep[:3], *bad[:5], sep="\n  ")
    if p.returncode or any("Traceback" in l for l in bad):
        print(out[-3000:]); sys.exit(1)


if "--skip-build" not in sys.argv:
    run([PY, "styles/zawdog/humans/prep_human.py", slug, "--eye", str(c["eye"]), "--chin", str(c["chin"])] + sum((["--" + k, str(c[k])] for k in ("mouth", "throat", "top") if c.get(k)), []), "prep")
    run([BL, "-b", "-P", "styles/zawdog/humans/build_human.py", "--", slug, f"height={c['height']}"] + [f"{k}={v}" for k, v in c["build"].items()], "build")
    run([BL, "-b", "-P", "styles/zawdog/tools/retarget.py", "--", "styles/zawdog/motions/100style/Neutral_ID.bvh", f"c_{slug}_idle",
         "start=700", "end=820", f"human={slug}", "still=1", "stance=0.1"], "idle")
run([BL, "-b", "-P", "styles/zawdog/humans/inspect_human.py", "--", slug, W], "inspect")
run([PY, "styles/zawdog/humans/sheet.py", W, slug], "sheet")
run([BL, "-b", "-P", "pieces/cast-pack/tools/cast_render.py", "--", "sheet", slug, os.path.join(W, "cs")], "cast_render")
run([PY, "pieces/cast-pack/tools/compose_sheet.py", slug, os.path.join(W, "cs"), os.path.join(R, "pieces/cast-pack/review", slug + "_cast.jpg")], "compose")

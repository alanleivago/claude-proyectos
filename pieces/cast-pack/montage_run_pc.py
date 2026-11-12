"""PC cast pack montage (cast_pc.json): same as montage_run.py, own clip per person, frames in renders_pc/frames.
    .venv/Scripts/python pieces/cast-pack/montage_run_pc.py [bake] [render]   then   montage_post.py <out.mp4> renders_pc"""
import json, os, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
BL = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" if os.name == "nt" else "/Applications/Blender.app/Contents/MacOS/Blender"
M = "styles/zawdog/motions/"
G = ["still=1", "stance=0.12"]                                        # standing gestures
# slug, clip (index.json), retarget extras, face swapped in
SHOTS = [
    ("firefighter", "wave_hello_141_16", G, "smile"),
    ("gardener", "kimodo_facepalm", [], "crying"),
    ("librarian", "shrug_subtle_111_25", G, "surprised"),
    ("mechanic", "kimodo_shake_fist_angry", [], "surprised"),
    ("nurse", "wave_113_27", G, "smile"),
    ("painter", "scared_cower_79_73", G, "scared"),
    ("barista", "happy_laugh_79_70", G, "laughing"),
    ("guard", "kimodo_point_forward", [], "surprised"),
    ("teacher", "rude_arguing_80_48", G, "surprised"),
    ("tourist", "kimodo_laugh_bend_back", [], "laughing"),
    ("skater", "kimodo_happy_jump", [], "laughing"),
    ("vendor", "sad_79_71", G, "crying"),
    ("driver", "kimodo_shrug_palms_up", [], "surprised"),
    ("yogi", "happy_very_79_69", G, "smile"),
    ("fisherman", "kimodo_startle_jump_back", [], "scared"),
]
IDX = json.load(open(os.path.join(R, M, "index.json")))["clips"]
steps = sys.argv[1:] or ["bake", "render"]
only = [a for a in steps if a not in ("bake", "render")]
steps = [a for a in steps if a in ("bake", "render")] or ["bake", "render"]
for i, (slug, clip, extra, face) in enumerate(SHOTS):
    if only and slug not in only:
        continue
    act = f"c_{slug}_m"; e = IDX[clip]
    if "bake" in steps:
        rng = [] if clip.startswith("kimodo_") else [f"start={e['suggested_range'][0]}", f"end={e['suggested_range'][1]}"]
        p = subprocess.run([BL, "-b", "-P", "styles/zawdog/tools/retarget.py", "--", M + e["file"], act, f"human={slug}"] + rng + extra,
                           cwd=R, capture_output=True, text=True, encoding="utf-8", errors="replace")
        line = next((l for l in p.stdout.splitlines() if l.startswith("RETARGET")), "FAILED " + p.stdout[-800:] + p.stderr[-800:])
        fe = json.loads(line[9:])["feet"] if line.startswith("RETARGET") else line
        print(slug, clip, "feet", fe if isinstance(fe, str) else {k: (v["max_slide_m"], v["min_ankle_z"]) for k, v in fe.items()}, flush=True)
    if "render" in steps:
        p = subprocess.run([BL, "-b", "-P", "pieces/zaw-dog-05/build.py", "--", "exec", "pieces/cast-pack/montage_kit.py", slug, act, face,
                            os.path.join(R, "pieces/cast-pack/renders_pc/frames"), f"{i + 1:02d}_{slug}"], cwd=R, capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
        print(slug, "render rc", p.returncode, [l for l in (p.stdout + p.stderr).splitlines() if "Error" in l][:3], flush=True)

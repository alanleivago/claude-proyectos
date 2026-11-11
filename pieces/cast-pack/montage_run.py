"""Cast pack montage: bake one mocap clip per cast member on its own rig (retarget.py human=<slug>), render each shot
(montage_kit.py in the kit living room with the dog, fresh Blender), then montage_post.py.   .venv/bin/python pieces/cast-pack/montage_run.py [bake] [render]"""
import json, os, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
BL = "/Applications/Blender.app/Contents/MacOS/Blender"; M = "styles/zawdog/motions/"
# slug, clip (index.json), retarget extras, face swapped in
SHOTS = [
    ("vet", "kimodo_wave_hello", "kimodo/wave_hello.bvh", [], "smile"),
    ("neighbour", "shrug_141_21", "cmu/shrug_141_21.bvh", ["start=50", "end=190", "still=1", "stance=0.12"], "surprised"),
    ("kid", "kimodo_happy_jump", "kimodo/happy_jump.bvh", [], "laughing"),
    ("grandma", "sad_crying_79_72", "cmu/sad_crying_79_72.bvh", ["start=200", "end=560", "still=1", "stance=0.1"], "crying"),
    ("mailman", "kimodo_startle_jump_back", "kimodo/startle_jump_back.bvh", [], "scared"),
    ("scientist", "kimodo_point_forward", "kimodo/point_forward.bvh", [], "surprised"),
    ("dogwalker", "neutral_walk_FW", "100style/Neutral_FW.bvh", ["yaw=path"], "smile"),
    ("youngwoman", "kimodo_laugh_bend_back", "kimodo/laugh_bend_back.bvh", [], "laughing"),
    ("police", "point_traffic_14_24", "cmu/point_traffic_14_24.bvh", ["start=100", "end=280", "still=1", "stance=0.12"], "surprised"),
    ("delivery", "kimodo_cower_crouch", "kimodo/cower_crouch.bvh", [], "scared"),
    ("teen", "wave_both_arms_143_25", "cmu/wave_both_arms_143_25.bvh", ["start=300", "end=560", "still=1", "stance=0.1"], "smile"),
    ("chef", "kimodo_stomach_pain", "kimodo/stomach_pain.bvh", [], "crying"),
    ("jogger", "happy_80_43", "cmu/happy_80_43.bvh", ["still=1", "stance=0.12"], "laughing"),
    ("oldman", "kimodo_sad_slump", "kimodo/sad_slump.bvh", [], "crying"),
    ("businesswoman", "kimodo_shrug_palms_up", "kimodo/shrug_palms_up.bvh", [], "surprised"),
]
IDX = json.load(open(os.path.join(R, M, "index.json")))["clips"]
steps = sys.argv[1:] or ["bake", "render"]
for i, (slug, clip, bvh, extra, face) in enumerate(SHOTS):
    act = f"c_{slug}_m"
    if "bake" in steps:
        if clip in ("elated_walk_FW", "neutral_walk_FW"):
            a, b = IDX[clip]["suggested_range"]; extra = extra + [f"start={a}", f"end={b}"]
        p = subprocess.run([BL, "-b", "-P", "styles/zawdog/tools/retarget.py", "--", M + bvh, act, f"human={slug}"] + extra,
                           cwd=R, capture_output=True, text=True)
        line = next((l for l in p.stdout.splitlines() if l.startswith("RETARGET")), "FAILED " + p.stdout[-800:] + p.stderr[-800:])
        fe = json.loads(line[9:])["feet"] if line.startswith("RETARGET") else line
        print(slug, clip, "feet", fe if isinstance(fe, str) else {k: (v["max_slide_m"], v["min_ankle_z"]) for k, v in fe.items()})
    if "render" in steps:
        p = subprocess.run([BL, "-b", "-P", "pieces/zaw-dog-05/build.py", "--", "exec", "pieces/cast-pack/montage_kit.py", slug, act, face,
                            "pieces/cast-pack/renders/frames", f"{i + 1:02d}_{slug}"], cwd=R, capture_output=True, text=True)
        print(slug, "render rc", p.returncode, [l for l in (p.stdout + p.stderr).splitlines() if "Error" in l][:3])
json.dump([dict(slug=s, clip=c, face=f) for s, c, _, _, f in SHOTS], open(os.path.join(R, "pieces/cast-pack/renders/montage_shots.json"), "w"), indent=1)

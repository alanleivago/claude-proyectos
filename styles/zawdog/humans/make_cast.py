"""Flow images for the PC character pack (cast_pc.json) through the srz-google-flow-mcp CLI, one image per call.
    python styles/zawdog/humans/make_cast.py neutral [names...]   -> <name>/src/neutral_c*.jpg (2 candidates; pick -> faces/neutral.jpg)
    python styles/zawdog/humans/make_cast.py faces   [names...]   -> <name>/faces/{smile,surprised,crying,laughing,scared}.jpg
    python styles/zawdog/humans/make_cast.py sheet   [names...]   -> <name>/src/sheet_c*.jpg (2 candidates; pick -> src/sheet.jpg)
Skips files that already exist. On a failure: reload Flow (tools/flow_reload.js) and retry, 4 tries."""
import json
import os
import re
import shutil
import subprocess
import sys

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, "../../.."))
CLI = os.path.join(ROOT, "tools/srzGoogleFlowMCP/srzGoogleFlowMCP")
CAST = {c["slug"]: dict(c, top=c["top_prompt"]) for c in json.load(open(os.path.join(H, "cast_pc.json"), encoding="utf-8"))["cast"]}

NEUTRAL = ("Studio passport-style portrait photo of {face}, calm neutral expression, mouth closed, looking straight into the "
           "camera, perfectly frontal and symmetrical head, both ears visible. Wearing {top}, the collar and the base of the neck "
           "clearly visible. Framing: head and top of shoulders, the eyes at 40% of the image height, the chin at 68%, the top of "
           "the hair at about 20%, head centred. Plain flat light-grey seamless background, soft even studio light, no shadows on "
           "the background, realistic photo, sharp focus, no text.")
EXPR = {
    "smile": "a big warm happy smile showing the teeth, eyes slightly squinting with joy",
    "surprised": "wide-open surprised eyes, raised eyebrows, mouth open in a round 'oh' of surprise",
    "crying": "crying sadly, eyebrows pulled up in the middle, eyes wet and red with tears running down the cheeks, mouth turned down",
    "laughing": "laughing out loud, mouth wide open, eyes squeezed almost shut with laughter",
    "scared": "scared and frightened, eyes wide open showing white around the irises, eyebrows raised and pulled together, mouth slightly open",
}
EDIT = ("Edit this photo @{{{ref}}}: the same person, identical photo, identical framing, head size and position, same light-grey "
        "background, same lighting, same clothes. Change only the facial expression: {expr}. Head still frontal and straight, "
        "looking into the camera.")
SHEET = ("Character turnaround reference photo on a flat solid pure magenta (#FF00FF) background. The same person as in @{{{ref}}} "
         "(same face, hair and skin tone) shown three times side by side at the same scale, full body from head to shoes, standing "
         "in a relaxed A-pose with straight arms angled down about 30 degrees away from the body, fingers together: left = front "
         "view, centre = right profile view facing right, right = back view. Wearing {outfit}. Realistic photo, even flat studio "
         "light, no shadows on the background, the three figures well separated, nothing else in the image, no text.")


def gen(prompt, aspect, out_dir, n=1):
    os.makedirs(out_dir, exist_ok=True)
    for t in range(4):
        r = subprocess.run(["node", "src/cli.js", prompt, "--aspect", aspect, "--count", str(n), "--model", "pro", "--out", out_dir],
                           cwd=CLI, capture_output=True, text=True, encoding="utf-8", errors="replace")
        paths = re.findall(r"[A-Za-z]:\\[^\r\n]+?\.(?:jpg|png)", r.stdout)
        if paths:
            return paths
        print("  fallo intento", t + 1, (r.stdout + r.stderr).strip()[-200:], flush=True)
        subprocess.run(["node", os.path.join(ROOT, "tools/flow_reload.js")], capture_output=True)
    raise RuntimeError("Flow no generó tras 4 intentos")


def upload(path, name):
    subprocess.run(["node", "src/cli.js", "upload", path, "--name", name, "--replace"], cwd=CLI, check=True,
                   capture_output=True, text=True, encoding="utf-8", errors="replace")


def main():
    stage, names = sys.argv[1], sys.argv[2:] or list(CAST)
    for name in names:
        c = CAST[name]; D = os.path.join(H, name); src = os.path.join(D, "src"); faces = os.path.join(D, "faces")
        if stage == "neutral":
            if os.path.exists(os.path.join(faces, "neutral.jpg")) or os.path.exists(os.path.join(src, "neutral_c1.jpg")):
                continue
            ps = gen(NEUTRAL.format(**c), "1:1", src, 2)
            for i, p in enumerate(ps, 1):
                shutil.move(p, os.path.join(src, f"neutral_c{i}.jpg"))
        elif stage == "faces":
            todo = [e for e in EXPR if not os.path.exists(os.path.join(faces, e + ".jpg"))]
            if not todo:
                continue
            ref = name + "_neutral"
            upload(os.path.join(faces, "neutral.jpg"), ref)
            for e in todo:
                p = gen(EDIT.format(ref=ref, expr=EXPR[e]), "1:1", src)[0]
                shutil.move(p, os.path.join(faces, e + ".jpg"))
                print(" ", name, e, flush=True)
        elif stage == "sheet":
            if os.path.exists(os.path.join(src, "sheet.jpg")) or os.path.exists(os.path.join(src, "sheet_c1.jpg")):
                continue
            ref = name + "_neutral"
            upload(os.path.join(faces, "neutral.jpg"), ref)
            ps = gen(SHEET.format(ref=ref, outfit=c["outfit"]), "16:9", src, 2)
            for i, p in enumerate(ps, 1):
                shutil.move(p, os.path.join(src, f"sheet_c{i}.jpg"))
        print("OK", stage, name, flush=True)
    print("FIN", stage, flush=True)


if __name__ == "__main__":
    main()

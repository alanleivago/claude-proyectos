"""v3 assets (template-copy rebuild): flow/v3 gens -> cutouts (rembg birefnet-general) in assets/img3 + eye boxes.
python prep/assets3.py"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image
R = Path(__file__).resolve().parent.parent; I = R / "flow/v3"; O = R / "assets/img3"; O.mkdir(exist_ok=True)
from rembg import new_session, remove
S = new_session("birefnet-general")
CUT = ["director", "girl", "medal", "readerman", "shopowner", "counter", "jars_a", "jars_b", "thumb", "headband", "podium", "woman",
       "ball", "cashman", "bleachers", "runner_kid", "mother", "gearcoach", "trophy", "rock", "climber", "cashfan"]
PHOTO = ["bench", "paper", "stadium_blur", "clubhouse", "strip_topdown", "strip_start", "pitch_sky", "skyline", "track_bw", "bleachers", "director", "headband", "gearcoach"]
for n in CUT:
    if (O / f"{n}.png").exists(): continue
    o = remove(Image.open(I / f"{n}.jpg").convert("RGB"), session=S); o.save(O / f"{n}.png"); print("cut", n, o.size)
for n in PHOTO:
    Image.open(I / f"{n}.jpg").convert("RGB").save(O / f"{n}.jpg", quality=92)
files = [str(I / f"{n}.jpg") for n in ["director", "girl", "readerman", "shopowner", "headband", "podium", "woman", "cashman", "gearcoach", "climber", "mother", "runner_kid"]]
files.append(str(R / "assets/img2/coach.jpg")); files.append(str(R / "assets/img2/family.jpg"))
out = subprocess.run([sys.executable, str(R.parent.parent / "tools/face_eyes.py")] + files, capture_output=True, text=True).stdout
faces = json.loads(out[out.index("{"):])
faces = {Path(k).stem: [f for f in v if abs(f["angle"]) < 30 and f["eye_span"] > 12] for k, v in faces.items()}
(O / "faces.json").write_text(json.dumps(faces, indent=1))
for k, v in faces.items(): print(k, [(f["cx"], f["cy"], f["bar_w"], f["angle"]) for f in v])

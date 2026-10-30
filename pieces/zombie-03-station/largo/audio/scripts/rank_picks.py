# Elige con earshot (api.rank) el mejor candidato de cada carpeta cand/<key> para su descripcion -> picks_largo.json
import json, os, sys, glob
sys.path.insert(0, r"F:/earshot")
from earshot import api
sys.path.insert(0, os.path.dirname(__file__)); import importlib.util
spec = importlib.util.spec_from_file_location("fsf", os.path.join(os.path.dirname(__file__), "fs_fetch.py"))
src = open(spec.origin, encoding="utf-8").read()
SFX2 = eval(src[src.index("SFX2 = {") + 7:src.index("}\nif ONLY and 'SFX2'") + 1])
DESC = {k: v[0] for k, v in SFX2.items()}
DESC.update({"vending_glass": "glass cracking", "bars_rattle": "metal cage bars rattling", "dial_click": "a combination safe dial clicking", "pen_write": "a pen writing on paper", "dog_paws": "dog paws clicking on a hard floor", "dog_collar": "metal dog tags jingling", "phone_pickup": "a telephone handset picked up", "phone_keys": "phone keypad button beeps", "reel_tape": "a reel to reel tape machine running", "car_tick": "a hot car engine ticking as it cools", "mug": "a ceramic mug set on a table", "hiss": "steam hissing"})
DESC.update({"dog_growl": "a dog growling low and threatening", "dog_whine": "a dog whining softly", "generator": "a small gasoline generator engine running",
             "tape_click": "a tape recorder button click", "glass_shatter": "a glass pane shattering into many pieces", "cough": "a man coughing once"})
out = {}
for d in sorted(glob.glob("cand/*/")):
    k = os.path.basename(d.rstrip("/\\"))
    if k.startswith("mus_") or k not in DESC or not glob.glob(d + "*.mp3"): continue
    r = api.rank(d, DESC[k], top=3)
    best = r["results"][0]
    meta = {str(m["id"]): m for m in json.load(open(d + "meta.json", encoding="utf-8"))}
    m = meta.get(best["name"].split(".")[0], {})
    out[k] = dict(file=best["path"].replace("\\", "/"), z=best["z"], verdict=best["verdict"], name=m.get("name"), user=m.get("user"), url=m.get("url"))
    print(f"{k:14s} z{best['z']:+.2f} {best['verdict']:9s} {m.get('name','')[:40]}", flush=True)
json.dump(out, open("picks_largo.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

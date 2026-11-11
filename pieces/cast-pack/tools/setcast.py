"""set fields in cast.json:  .venv/bin/python pieces/cast-pack/tools/setcast.py <slug> key=value ...  (numbers parsed)"""
import json, os, sys
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "styles/zawdog/humans/cast.json")
d = json.load(open(p)); c = next(x for x in d["cast"] if x["slug"] == sys.argv[1])
for kv in sys.argv[2:]:
    k, v = kv.split("=", 1)
    try: v = json.loads(v)
    except ValueError: pass
    if k.startswith("build."): c["build"][k[6:]] = v
    else: c[k] = v
json.dump(d, open(p, "w"), indent=1)

# Freesound CC0 (busqueda + preview HQ) para el ep12 (The Radio) -> audio/cand/<key>/<id>.mp3 + meta.json. python fs_fetch5.py [keys]
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/zombie-12-radio/audio/cand"
Q = {"static": ("radio static noise", 2, 15), "tuning": ("radio tuning dial", 1, 8), "crank": ("hand crank ratchet", 1, 8), "plug": ("headphone jack plug", 0.1, 2),
     "door_creak": ("old door creak open", 1, 5), "heavy_steps": ("heavy footsteps boots slow", 2, 15), "night_amb": ("night crickets ambience", 10, 60),
     "pencil": ("pencil writing paper", 1, 6), "chime": ("save chime", 0.5, 3), "paper": ("paper sticky note", 0.2, 2)}
only = set(sys.argv[1:])
for key, (q, dmin, dmax) in Q.items():
    if only and key not in only: continue
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username", "sort": "score", "page_size": 6, "token": KEY})
    try: r = json.load(urllib.request.urlopen(url, timeout=30))
    except Exception as e: print(key, "ERR", e); continue
    meta = []
    for s in r["results"][:5]:
        fn = os.path.join(d, f"{s['id']}.mp3")
        if not os.path.exists(fn):
            try: urllib.request.urlretrieve(s["previews"]["preview-hq-mp3"], fn)
            except Exception as e: print("dl err", e); continue
        meta.append(dict(id=s["id"], name=s["name"], user=s["username"], license=s["license"], dur=s["duration"], url=f"https://freesound.org/s/{s['id']}/"))
    json.dump(meta, open(os.path.join(d, "meta.json"), "w", encoding="utf-8"), indent=1)
    print(key, len(meta), [m["name"][:30] for m in meta])

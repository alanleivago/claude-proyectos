# Freesound CC0 (busqueda + preview HQ) para el ep7 (Safe Room) -> audio/cand/<key>/<id>.mp3 + meta.json. python fs_fetch5.py [keys]
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/zombie-07-saferoom/audio/cand"
Q = {"aerosol": ("spray can", 0.3, 5), "bandage": ("tape", 0.3, 5), "chest_open": ("wooden lid", 0.3, 4), "chest_close": ("box close", 0.2, 3),
     "heal": ("heal", 0.3, 4), "cut": ("cut", 0.1, 2), "item_drop": ("drop wood", 0.1, 2), "wind": ("wind", 10, 120), "chest_creak": ("creak", 0.3, 4)}
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

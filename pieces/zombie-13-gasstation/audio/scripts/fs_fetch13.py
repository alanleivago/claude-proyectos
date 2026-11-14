# Freesound CC0 (busqueda + preview HQ) para el ep13 (Gas Station) -> audio/cand/<key>/<id>.mp3 + meta.json. python fs_fetch5.py [keys]
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/zombie-13-gasstation/audio/cand"
Q = {"pump_beep": ("gas pump beep", 0.1, 3), "fuel_pour": ("fuel nozzle pumping gas", 2, 20), "power_down": ("electrical power down hum", 1, 8), "buzz": ("fluorescent light buzz", 2, 20),
     "door_chime": ("shop door bell chime", 0.5, 4), "fridge_hum": ("refrigerator hum", 5, 40), "knock": ("knocking on wooden door", 0.5, 5), "groan": ("zombie groan distant", 1, 8),
     "night": ("night crickets ambience", 10, 60), "glass_door": ("glass door open", 0.5, 4), "click": ("flashlight click", 0.1, 2), "steps": ("footsteps tile floor", 2, 15)}
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

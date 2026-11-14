# ep8: copia de largo/audio/scripts/fs_fetch.py con busquedas de la granja. python fs_fetch8.py [keys]
# largo: copia de ../../audio/scripts/fs_fetch.py con busquedas nuevas. Freesound CC0 search + HQ preview download: audio/cand/<key>/<id>.mp3 and audio/cand/<key>/meta.json
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/zombie-08-farm/audio/cand"
Q = {
 "cow_moo": ("cow moo single", 0.8, 6), "cow_herd": ("cows mooing herd farm", 3, 30), "chicken_cluck": ("chickens clucking farm", 2, 30), "chicken_alarm": ("chicken alarm call squawk", 0.5, 6),
 "rooster": ("rooster crow", 1, 6), "dog_bark": ("dog bark single", 0.2, 3), "farm_day": ("countryside ambience birds wind field", 20, 180), "crickets": ("crickets night ambience", 20, 180),
 "wind": ("wind field gentle", 10, 120), "tap_run": ("kitchen faucet water running", 2, 15), "tub_fill": ("bathtub filling water", 3, 30), "jug_fill": ("filling bottle water tap", 1, 10),
 "chain": ("metal chain rattle", 0.5, 5), "gate_metal": ("metal farm gate close clang", 0.5, 5), "truck_idle": ("pickup truck engine idle", 3, 30), "traffic_jam": ("traffic jam horns cars", 5, 60),
 "phone_alert": ("phone notification alert", 0.3, 4), "phone_vibrate": ("phone vibrate", 0.3, 3), "barn_door": ("barn door slide wood rolling", 0.8, 6), "gravel_steps": ("footsteps gravel walking", 2, 20),
 "drill": ("cordless drill screw", 0.5, 5), "screw_drive": ("screwdriver screw wood", 0.5, 5), "fridge_stop": ("fridge hum stop", 1, 10), "power_flicker": ("electric spark flicker buzz", 0.3, 4),
 "corn_rustle": ("corn field rustle leaves", 1, 15), "hooves": ("cow hooves walking", 1, 15), "moo_far": ("cow mooing distant", 1, 10), "owl": ("owl hoot night", 1, 6),
 "keys_hook": ("keys jingle hang", 0.3, 3), "porch_creak": ("wooden floor creak", 0.3, 3), "coffee_sip": ("sip coffee", 0.3, 2),
 "mus_hook": ("horror cinematic dark intro", 40, 400), "mus_farm": ("dark ambient rural horror", 60, 600), "mus_calm": ("melancholic ambient piano dark", 60, 600),
}
def get(url): return json.load(urllib.request.urlopen(url, timeout=30))
Q2 = {"barn_door": ("sliding door", 0.5, 8), "chicken_alarm": ("hen squawk", 0.3, 8), "corn_rustle": ("leaves rustle", 1, 15), "drill": ("drill", 0.5, 8),
 "fridge_stop": ("refrigerator", 2, 30), "gate_metal": ("gate", 0.5, 8), "hooves": ("hooves", 1, 20), "keys_hook": ("keys", 0.3, 4), "power_flicker": ("electric buzz", 0.3, 5),
 "mus_farm": ("dark ambient", 60, 600), "mus_calm": ("sad piano ambient", 60, 600), "cow_moo": ("moo", 0.5, 6), "truck_idle": ("engine idle", 3, 30), "jug_fill": ("pouring water", 1, 10), "coffee_sip": ("slurp", 0.2, 3)}
Q3 = {"dog_growl_big2": ("growl dog", 1, 12), "dog_growl_big3": ("german shepherd growl", 0.5, 12), "dog_growl_big4": ("angry dog", 0.5, 12)}
if len(sys.argv) > 1 and sys.argv[1] == "Q2": Q = Q2; sys.argv = sys.argv[:1]
if len(sys.argv) > 1 and sys.argv[1] == "Q3": Q = Q3; sys.argv = sys.argv[:1]
ONLY=set(sys.argv[1:])
for key, (q, dmin, dmax) in Q.items():
    if ONLY and key not in ONLY: continue
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username,avg_rating,num_downloads", "sort": "score", "page_size": 6, "token": KEY})
    try: r = get(url)
    except Exception as e: print(key, "ERR", e); continue
    meta = []
    for s in [x for x in r["results"] if str(x["id"])+".mp3" not in os.listdir(d)][:4] + [x for x in r["results"] if str(x["id"])+".mp3" in os.listdir(d)][:0]:
        fn = os.path.join(d, f"{s['id']}.mp3")
        if not os.path.exists(fn):
            try: urllib.request.urlretrieve(s["previews"]["preview-hq-mp3"], fn)
            except Exception as e: print("dl err", e); continue
        meta.append(dict(id=s["id"], name=s["name"], user=s["username"], license=s["license"], dur=s["duration"], url=f"https://freesound.org/s/{s['id']}/"))
    old = json.load(open(os.path.join(d, "meta.json"), encoding="utf-8")) if os.path.exists(os.path.join(d, "meta.json")) else []
    ids = {m["id"] for m in meta}; meta = meta + [m for m in old if m["id"] not in ids]
    json.dump(meta, open(os.path.join(d, "meta.json"), "w", encoding="utf-8"), indent=1)
    print(key, len(meta), [m["name"][:28] for m in meta])

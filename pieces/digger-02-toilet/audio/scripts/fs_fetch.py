# Freesound CC0 search + HQ preview download: audio/cand/<key>/<id>.mp3 and audio/cand/<key>/meta.json
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/digger-02-toilet/audio/cand"
Q = {
 "toilet_flush": ("toilet flush", 2, 15), "chain_pull": ("chain rattle", 0.3, 4), "water_tank_gush": ("water gush", 1, 8),
 "wood_door_creak": ("wooden door creak", 0.5, 6), "wood_thud": ("wood thud", 0.1, 2), "splash_liquid_street": ("water thrown splash", 0.3, 4),
 "window_open": ("window open", 0.4, 5), "pottery_clink": ("ceramic clink", 0.1, 3), "cobble_footsteps": ("footsteps walking pavement", 2, 25),
 "crowd_gasp_or_ew": ("crowd gasp", 0.4, 4), "night_crickets": ("crickets night", 10, 120), "rooster_morning": ("rooster crow", 1, 8),
 "bubbling_sewer": ("bubbling gurgle", 1, 10), "gas_hiss": ("gas hiss", 0.5, 6), "metal_pipe_bend_creak": ("metal creak bend", 0.4, 6),
 "watch_ticking": ("watch ticking", 2, 20), "water_pour_fill": ("toilet cistern filling", 1, 15), "drip": ("water drip", 0.1, 3),
 "room_tone": ("room tone", 10, 120), "fly_buzz": ("fly buzzing", 1, 10), "splat": ("mud splat", 0.1, 2),
}
def get(url): return json.load(urllib.request.urlopen(url, timeout=30))
ONLY=set(sys.argv[1:])
for key, (q, dmin, dmax) in Q.items():
    if ONLY and key not in ONLY: continue
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username,avg_rating,num_downloads", "sort": "score", "page_size": 8, "token": KEY})
    try: r = get(url)
    except Exception as e: print(key, "ERR", e); continue
    meta = []
    for s in [x for x in r["results"] if str(x["id"])+".mp3" not in os.listdir(d)][:6] + [x for x in r["results"] if str(x["id"])+".mp3" in os.listdir(d)][:0]:
        fn = os.path.join(d, f"{s['id']}.mp3")
        if not os.path.exists(fn):
            try: urllib.request.urlretrieve(s["previews"]["preview-hq-mp3"], fn)
            except Exception as e: print("dl err", e); continue
        meta.append(dict(id=s["id"], name=s["name"], user=s["username"], license=s["license"], dur=s["duration"], url=f"https://freesound.org/s/{s['id']}/"))
    old = json.load(open(os.path.join(d, "meta.json"), encoding="utf-8")) if os.path.exists(os.path.join(d, "meta.json")) else []
    ids = {m["id"] for m in meta}; meta = meta + [m for m in old if m["id"] not in ids]
    json.dump(meta, open(os.path.join(d, "meta.json"), "w", encoding="utf-8"), indent=1)
    print(key, len(meta), [m["name"][:28] for m in meta])

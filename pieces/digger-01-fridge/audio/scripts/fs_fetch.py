# Freesound CC0 search + HQ preview download: audio/cand/<key>/<id>.mp3 and audio/cand/<key>/meta.json
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/digger-01-fridge/audio/cand"
Q = {
 "snow_shovel": ("shovel snow", 0.3, 8), "snow_step": ("footsteps snow", 1, 20), "wind": ("winter wind", 20, 300),
 "metal_clang": ("metal clang", 0.2, 4), "thud_snow": ("snowball impact", 0.1, 3), "ice_saw": ("sawing", 1, 15),
 "ice_crack": ("ice crack", 0.3, 6), "sawdust": ("pouring sand", 1, 10), "door_wood": ("wooden door creak", 0.5, 6),
 "water_slosh": ("water slosh", 0.5, 6), "splash_small": ("small splash water", 0.2, 3), "drip": ("water drip", 0.1, 3),
 "birds": ("birds summer", 5, 60), "mailbox": ("metal creak", 0.4, 4), "boil": ("boiling water", 3, 30),
 "liquid_fill": ("water pouring", 1, 8), "fridge_hum": ("refrigerator hum", 5, 60), "piston": ("compressor", 1, 10),
 "crackle": ("fire crackle", 3, 30), "teeth": ("teeth chattering", 0.5, 6), "ice_place": ("ice block", 0.2, 4),
 "wood_creak": ("wood creak", 0.4, 5), "room": ("room tone", 10, 120), "gulp_bleh": ("disgust", 0.3, 3),
}
def get(url): return json.load(urllib.request.urlopen(url, timeout=30))
for key, (q, dmin, dmax) in Q.items():
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username,avg_rating,num_downloads", "sort": "score", "page_size": 8, "token": KEY})
    try: r = get(url)
    except Exception as e: print(key, "ERR", e); continue
    meta = []
    for s in r["results"][:6]:
        fn = os.path.join(d, f"{s['id']}.mp3")
        if not os.path.exists(fn):
            try: urllib.request.urlretrieve(s["previews"]["preview-hq-mp3"], fn)
            except Exception as e: print("dl err", e); continue
        meta.append(dict(id=s["id"], name=s["name"], user=s["username"], license=s["license"], dur=s["duration"], url=f"https://freesound.org/s/{s['id']}/"))
    json.dump(meta, open(os.path.join(d, "meta.json"), "w", encoding="utf-8"), indent=1)
    print(key, len(meta), [m["name"][:28] for m in meta])

# Freesound CC0 search + HQ preview download: audio/cand/<key>/<id>.mp3 and audio/cand/<key>/meta.json
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/zombie-02-window/audio/cand"
Q = {
 "zombie_groan": ("zombie groan", 0.8, 6), "zombie_growl_attack": ("zombie attack growl", 0.5, 4),
 "door_burst": ("door kicked open wood break", 0.3, 4), "wood_splinter": ("wood splinter crack", 0.2, 3),
 "body_fall": ("body fall floor thud", 0.2, 2.5), "drill_screw": ("drill screw into wood", 0.5, 4),
 "screwdriver": ("screwdriver screwing", 0.5, 5), "glass_bang": ("hand banging on window glass", 0.3, 4),
 "metal_bar_clank": ("metal pipe clank floor", 0.1, 2.5), "door_pound": ("pounding on door", 0.5, 5),
 "couch_drag": ("furniture drag floor", 0.5, 5), "lock_click": ("door lock turn click", 0.1, 2),
}
def get(url): return json.load(urllib.request.urlopen(url, timeout=30))
ONLY=set(sys.argv[1:])
ALT = {
 "door_burst": ("door break", 0.3, 5), "drill_screw": ("electric drill", 0.5, 5), "screwdriver": ("cordless screwdriver", 0.3, 5),
 "glass_bang": ("knocking glass", 0.3, 5), "door_pound": ("door banging", 0.5, 6), "lock_click": ("door lock", 0.1, 2),
 "door_slam": ("door slam", 0.2, 3),
}
RELOAD = {"mag_out": ("magazine release pistol", 0.1, 2), "mag_in": ("pistol magazine insert", 0.1, 2), "slide_rack": ("pistol slide rack", 0.1, 2), "gun_reload": ("handgun reload", 0.5, 4)}
EP2 = {"hammer_nail": ("hammering", 0.5, 6), "pipe_burst": ("metal burst", 0.2, 4), "water_spray": ("water spray", 1, 15), "wood_thunk": ("wood hit", 0.1, 2), "knock_wood": ("knocking", 0.3, 4), "water_leak": ("water leak", 1, 20)}
if ONLY and 'EP2' in ONLY: Q = EP2; ONLY = set()
if ONLY and 'ALT' in ONLY: Q = ALT; ONLY = set()
if ONLY and 'RELOAD' in ONLY: Q = RELOAD; ONLY = set()
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

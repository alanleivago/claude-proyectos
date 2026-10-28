# Freesound CC0 search + HQ preview download: audio/cand/<key>/<id>.mp3 and audio/cand/<key>/meta.json
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/digger-03-lock/audio/cand"
Q = {
 "metal_detector_beep": ("metal detector beep", 0.3, 8), "ice_crack": ("ice crack", 0.2, 4), "ice_split_break": ("ice breaking shatter", 0.3, 5),
 "steam_hiss": ("steam hiss", 0.5, 6), "water_drip": ("water drip", 0.1, 3), "padlock_clink": ("padlock drop metal", 0.1, 2),
 "rock_roll": ("stone rolling", 0.5, 6), "rock_thud": ("rock thud impact", 0.1, 2), "wood_bar_drop": ("wooden beam drop", 0.2, 3),
 "door_bump": ("door knock bang wooden", 0.2, 3), "wood_scrape_slide": ("wood sliding scrape", 0.3, 4), "lock_pick_scratch": ("lock picking", 0.5, 8),
 "pin_click": ("lock click", 0.05, 1), "key_turn_lock": ("key turning lock", 0.3, 4), "tiptoe_steps": ("sneaking footsteps", 1, 10),
 "crowd_murmur": ("crowd murmur indoor", 5, 60), "torch_fire_crackle": ("torch fire crackle", 3, 30), "metal_clink": ("coins clink", 0.2, 3),
}
def get(url): return json.load(urllib.request.urlopen(url, timeout=30))
ONLY=set(sys.argv[1:])
ALT = {
 "padlock_clink": ("keys dropped", 0.1, 3), "rock_roll": ("rolling boulder stone", 0.5, 8), "rock_thud": ("heavy stone drop", 0.1, 3),
 "wood_bar_drop": ("wooden plank drop", 0.1, 3), "metal_detector_beep": ("metal detector", 0.5, 15), "tiptoe_steps": ("tiptoe footsteps", 1, 10),
}
if ONLY and 'ALT' in ONLY: Q = ALT; ONLY = set()
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

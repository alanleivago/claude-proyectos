# Freesound CC0 search + HQ preview download: audio/cand/<key>/<id>.mp3 and audio/cand/<key>/meta.json
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/digger-04-alarm/audio/cand"
Q = {
 "metal_clang": ("metal plate clang", 0.3, 4), "nail_drop": ("nail drop metal small", 0.1, 2), "candle_flame": ("candle flame", 2, 20),
 "glass_tap": ("knock on window glass", 0.2, 3), "blow_puff": ("blow air puff mouth", 0.1, 1.5), "pebble_glass": ("small stone hits glass", 0.05, 1.5),
 "alarm_bell": ("old alarm clock bell ringing", 1, 8), "clock_ticking": ("clock ticking", 3, 15), "birds_morning": ("birds singing morning", 10, 60),
 "rooster": ("rooster crow", 1, 6), "snoring": ("snoring", 1, 8), "factory_ambience": ("factory machinery ambience", 5, 40),
 "steam_whistle": ("steam whistle", 1, 8), "running_cobble": ("running footsteps cobblestone", 1, 6), "iron_gate": ("iron gate slam", 0.4, 4),
 "cash_register": ("cash register ding", 0.3, 3), "footsteps_cobble": ("footsteps walking cobblestone", 2, 10), "window_open": ("old window open slam", 0.3, 3),
 "grumble": ("man grumbling annoyed", 0.5, 4), "button_click": ("button press click", 0.05, 1), "pillow": ("pillow fluff cloth", 0.2, 2),
 "coins": ("coins drop table", 0.2, 3), "bonk": ("small bonk hit head cartoon", 0.1, 1.5),
}
def get(url): return json.load(urllib.request.urlopen(url, timeout=30))
ONLY=set(sys.argv[1:])
ALT = {
 "blow_puff": ("blowing", 0.1, 2), "pebble_glass": ("glass tap", 0.05, 2), "running_cobble": ("running footsteps", 1, 8), "iron_gate": ("metal gate close", 0.3, 5),
 "cash_register": ("cash register", 0.3, 5), "footsteps_cobble": ("footsteps stone", 2, 12), "window_open": ("window open", 0.3, 4), "grumble": ("grumble", 0.3, 4),
 "pillow": ("pillow", 0.1, 3), "bonk": ("bonk", 0.05, 1.5), "glass_tap": ("tapping glass", 0.2, 4), "alarm_bell": ("alarm clock ringing", 1, 10), "nail_drop": ("small metal drop", 0.1, 2),
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

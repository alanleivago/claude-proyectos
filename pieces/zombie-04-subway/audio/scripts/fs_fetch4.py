# Freesound CC0 (busqueda + preview HQ) para el ep4 -> audio/cand/<key>/<id>.mp3 + meta.json. python fs_fetch4.py [keys]
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/zombie-04-subway/audio/cand"
Q = {"train_depart": ("subway train departing", 4, 30), "subway_doors": ("subway train doors closing", 1, 10),
     "door_chime": ("subway door chime", 0.5, 6), "breath": ("heavy breathing close", 2, 15), "steps_slow": ("slow footsteps concrete", 3, 20),
     "steps_run": ("running footsteps concrete", 2, 12), "chain_rattle": ("chain rattle metal gate", 0.5, 6), "paper_tear": ("paper tear", 0.3, 3),
     "paper_rustle": ("paper rustle", 0.3, 3), "relay_clunk": ("electrical breaker switch off clunk", 0.1, 3), "fluor_hum": ("fluorescent light hum", 5, 60),
     "tunnel_wind": ("subway tunnel ambience wind", 10, 120), "room_tone": ("subway station ambience empty", 10, 120), "phone_beep": ("phone error beep", 0.1, 2),
     "stinger": ("horror stinger hit", 1, 8), "mus_horror": ("dark horror ambient music", 70, 400), "door_air": ("pneumatic door hiss", 0.3, 4)}
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

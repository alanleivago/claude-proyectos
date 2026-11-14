# fetch_fs.py -> audio/cand/<cat>/<id>.mp3: candidatos Freesound CC0 (preview HQ) para los sonidos nuevos del LARGO 2.
# Se eligen despues con earshot rank. python fetch_fs.py
import json, os, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
H = os.path.dirname(os.path.abspath(__file__))
Q = {
    "wind_roof": ("rooftop wind ambience", 4, 120),
    "helicopter": ("helicopter flyby", 3, 60),
    "heli_hover": ("helicopter hovering overhead", 3, 90),
    "birds_city": ("pigeons city birds ambience", 3, 90),
    "city_far": ("distant city ambience empty", 6, 180),
    "tunnel_water": ("tunnel dripping water cave ambience", 5, 120),
    "typewriter": ("old typewriter typing", 1, 30),
    "steps_gravel": ("footsteps gravel roof", 2, 30),
    "metal_tube": ("metal pipe drop on concrete", 0.5, 5),
    "crate_creak": ("wooden crate creak", 0.3, 5),
    "room_hum": ("basement electrical hum room tone", 5, 120),
    "knock_far": ("distant knocking on glass door", 1, 20),
    "water_pour": ("pouring water into cup", 1, 10),
    "zombie_far": ("distant zombie crowd moan", 3, 60),
}
for cat, (q, dmin, dmax) in Q.items():
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username", "page_size": 8, "sort": "rating_desc", "token": KEY})
    try: res = json.load(urllib.request.urlopen(url, timeout=30))["results"]
    except Exception as e: print(cat, "ERR", e); continue
    os.makedirs(f"{H}/cand/{cat}", exist_ok=True); meta = []
    for r in res:
        f = f"{H}/cand/{cat}/{r['id']}.mp3"
        if not os.path.exists(f):
            try: urllib.request.urlretrieve(r["previews"]["preview-hq-mp3"], f)
            except Exception as e: print(" dl", r["id"], e); continue
        meta.append({"id": r["id"], "name": r["name"], "user": r["username"], "dur": r["duration"], "url": f"https://freesound.org/s/{r['id']}/"})
    json.dump(meta, open(f"{H}/cand/{cat}/meta.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print(cat, len(meta))

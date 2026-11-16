# fetch_fs.py -> audio/cand/<cat>/<id>.mp3: candidatos Freesound CC0 (preview HQ) para los sonidos nuevos del LARGO 2.
# Se eligen despues con earshot rank. python fetch_fs.py
import json, os, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
H = os.path.dirname(os.path.abspath(__file__))
Q = {
    "sewer_water": ("sewer flowing water underground", 10, 180),
    "forest_night": ("night forest ambience wind quiet", 20, 240),
    "leaves_steps": ("footsteps wet leaves forest", 2, 30),
    "fire_crackle": ("fireplace crackling", 10, 120),
    "glass_big": ("large window glass shatter", 1, 8),
    "wood_break": ("wood splinter break crash", 0.5, 6),
    "heavy_land": ("heavy body fall impact floor thud", 0.3, 4),
    "stairs_creak": ("old wooden stairs creak", 0.5, 8),
    "gate_slam": ("metal gate slam heavy", 0.5, 6),
    "pipe_bang": ("banging metal pipe railing", 1, 15),
    "splash_crowd": ("people wading splashing water", 3, 60),
    "radio_static": ("radio static noise hiss", 3, 40),
    "heli_dawn": ("helicopter distant approaching", 5, 90),
    "drone_low": ("dark ambient drone low", 30, 300),
    "house_rumble": ("rumble shaking house earthquake", 1, 15),
    "big_steps": ("heavy footsteps giant stomp", 1, 20),
    "lever": ("metal lever pull clunk", 0.3, 4),
    "grate_metal": ("rusty metal grate open", 0.5, 6),
    "mic_key": ("radio microphone push to talk click", 0.1, 3),
    "door_wood_close": ("heavy wooden door close boom", 0.5, 6),
    "crows": ("crow caw single", 0.5, 5),
    "music_chase": ("tense percussion ostinato loop", 15, 180),
}
for cat, (q, dmin, dmax) in Q.items():
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username", "page_size": 6, "sort": "rating_desc", "token": KEY})
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

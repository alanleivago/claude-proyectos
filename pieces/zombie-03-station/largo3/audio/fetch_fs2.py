# fetch_fs.py -> audio/cand/<cat>/<id>.mp3: candidatos Freesound CC0 (preview HQ) para los sonidos nuevos del LARGO 2.
# Se eligen despues con earshot rank. python fetch_fs.py
import json, os, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
H = os.path.dirname(os.path.abspath(__file__))
Q = {
    "wood_break": ("wood crack", 0.3, 8),
    "pipe_bang": ("metal pipe hit", 0.2, 10),
    "splash_crowd": ("water splashing", 1, 40),
    "house_rumble": ("rumble", 1, 20),
    "lever": ("lever", 0.2, 6),
    "grate_metal": ("metal creak", 0.5, 8),
    "mic_key": ("walkie talkie", 0.2, 5),
    "music_chase": ("percussion loop tense", 10, 240),
    "sewer_water2": ("water stream flowing", 10, 180),
    "glass_big2": ("glass breaking", 0.5, 8),
    "impact": ("body fall", 0.3, 5),
}
for cat, (q, dmin, dmax) in Q.items():
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username", "page_size": 5, "sort": "rating_desc", "token": KEY})
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

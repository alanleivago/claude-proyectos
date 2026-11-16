# fetch_fs3.py (v3) -> audio/cand/<cat>/<id>.mp3: rugido/gruñido CC0 del gigante (preview HQ). Se elige con earshot rank.
import json, os, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
H = os.path.dirname(os.path.abspath(__file__))
Q = {"monster_roar": [("monster roar", 1.5, 8), ("creature roar", 1.5, 8), ("beast roar deep", 1.5, 8)],
     "monster_growl": [("monster growl", 1, 8), ("creature growl low", 1, 8), ("monster breathing", 1, 10)]}
for cat, qs in Q.items():
    os.makedirs(f"{H}/cand/{cat}", exist_ok=True); meta = []
    for q, dmin, dmax in qs:
        url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username", "page_size": 8, "sort": "rating_desc", "token": KEY})
        try: res = json.load(urllib.request.urlopen(url, timeout=30))["results"]
        except Exception as e: print(cat, "ERR", e); continue
        for r in res:
            f = f"{H}/cand/{cat}/{r['id']}.mp3"
            if not os.path.exists(f):
                try: urllib.request.urlretrieve(r["previews"]["preview-hq-mp3"], f)
                except Exception as e: print(" dl", r["id"], e); continue
            meta.append({"id": r["id"], "name": r["name"], "user": r["username"], "dur": r["duration"], "license": r["license"], "url": f"https://freesound.org/s/{r['id']}/"})
    json.dump(meta, open(f"{H}/cand/{cat}/meta.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False); print(cat, len(meta))

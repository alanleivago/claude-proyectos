"""venv: search Freesound (CC0 only) and download HQ previews -> audio/assets/sfx2 + manifests/blind.json.
FREESOUND_API_KEY comes from the environment (never printed). python audio/fetch_fs.py"""
import json, os, re, sys, urllib.parse, urllib.request
K = os.environ["FREESOUND_API_KEY"]; H = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(H, "assets", "sfx2"); MAN = os.path.join(H, "assets", "manifests", "blind.json")
UA = {"User-Agent": "Mozilla/5.0 (sound-fetch)"}
Q = {"clock": "wall clock tick", "crt": "crt tv turn off", "lever": "lever pull switch", "camera": "eye saccade swoosh short", "paper": "paper sheet drop table"}
man = json.load(open(MAN)) if os.path.exists(MAN) else []
for key, q in Q.items():
    u = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": 'license:"Creative Commons 0" duration:[0.1 TO 8]', "fields": "id,name,username,license,url,previews,duration", "page_size": 4, "sort": "rating_desc", "token": K})
    r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
    for s in r["results"][:3]:
        fn = f"fs-{s['id']}_" + re.sub(r"[^a-z0-9]+", "-", s["name"].lower()).strip("-")[:40] + ".ogg"
        p = os.path.join(OUT, fn)
        if not os.path.exists(p):
            open(p, "wb").write(urllib.request.urlopen(urllib.request.Request(s["previews"]["preview-hq-ogg"], headers=UA), timeout=60).read())
        if not any(m["id"] == s["id"] for m in man):
            man.append({"id": s["id"], "file": "audio/assets/sfx2/" + fn, "title": s["name"], "author": s["username"], "license": s["license"], "url": s["url"], "duration": s["duration"], "q": key})
        print(key, fn, round(s["duration"], 2))
json.dump(man, open(MAN, "w"), indent=1)

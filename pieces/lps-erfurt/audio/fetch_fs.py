"""venv: search Freesound (CC0 / CC BY only, never NC) and download HQ previews -> audio/assets/sfx2 + manifests/erfurt.json.
FREESOUND_API_KEY comes from the environment (never printed); generic User-Agent, no personal data in headers."""
import json, os, re, urllib.parse, urllib.request
K = os.environ["FREESOUND_API_KEY"]; H = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(H, "assets", "sfx2"); MAN = os.path.join(H, "assets", "manifests", "erfurt.json")
UA = {"User-Agent": "Mozilla/5.0"}
Q = {"collapse": "wood crash", "collapse2": "debris falling", "beam": "creak", "splash": "splash", "splash3": "mud splash",
     "ladder": "wood plank drop", "pin": "thumbtack", "bubble": "bubbles", "whoosh": "whoosh", "pop": "pop", "neigh": "horse"}
LIC = 'license:("Creative Commons 0" OR "Attribution")'
man = json.load(open(MAN)) if os.path.exists(MAN) else []
for key, q in Q.items():
    u = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": LIC + " duration:[0.1 TO 10]", "fields": "id,name,username,license,url,previews,duration", "page_size": 4, "sort": "rating_desc", "token": K})
    r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
    for s in r["results"][:3]:
        fn = f"fs-{s['id']}_" + re.sub(r"[^a-z0-9]+", "-", s["name"].lower()).strip("-")[:40] + ".ogg"
        p = os.path.join(OUT, fn)
        if not os.path.exists(p):
            open(p, "wb").write(urllib.request.urlopen(urllib.request.Request(s["previews"]["preview-hq-ogg"], headers=UA), timeout=60).read())
        if not any(m["id"] == s["id"] for m in man):
            man.append({"id": s["id"], "file": "audio/assets/sfx2/" + fn, "title": s["name"], "author": s["username"], "license": s["license"], "url": s["url"], "duration": s["duration"], "q": key})
        print(key, fn, round(s["duration"], 2), s["license"].split("/")[-3] if "/" in s["license"] else s["license"])
json.dump(man, open(MAN, "w"), indent=1)

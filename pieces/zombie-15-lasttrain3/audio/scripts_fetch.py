import json, os, sys, urllib.request, urllib.parse
K = json.load(open(os.path.expanduser("~/.freesound.json")))
key = K.get("token") or K.get("api_key") or K.get("key") or list(K.values())[0]
def q(cat, query, n=5):
    os.makedirs(f"cand/{cat}", exist_ok=True)
    u = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": query, "filter": 'license:"Creative Commons 0" duration:[0.3 TO 12]', "fields": "id,name,username,license,previews,duration", "page_size": n, "sort": "rating_desc"})
    r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"Authorization": f"Token {key}"})))
    meta = {}
    for s in r["results"]:
        p = f"cand/{cat}/{s['id']}.mp3"
        if not os.path.exists(p): urllib.request.urlretrieve(s["previews"]["preview-hq-mp3"], p)
        meta[s["id"]] = {"name": s["name"], "author": s["username"], "license": s["license"], "dur": s["duration"]}
    json.dump(meta, open(f"cand/{cat}/meta.json", "w"), indent=1); print(cat, list(meta.items()))
q("tape_rip", "duct tape rip")
q("rail_clack", "train wheels clack rail joint")
q("metal_door", "metal cabin door open creak")

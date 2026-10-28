"""Openverse image search (no key): python ov_search.py queries.json outdir  -> <id>_o<k>.jpg + ov_credits.json"""
import json, os, sys, urllib.parse, urllib.request
UA = {"User-Agent": "yt-editor/1.0"}
qs, out = json.load(open(sys.argv[1], encoding="utf-8-sig")), sys.argv[2]
os.makedirs(out, exist_ok=True)
cred = {}
for q in qs:
    url = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
        {"q": q["q"], "aspect_ratio": "wide", "size": "large", "page_size": 8})
    try:
        res = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())["results"]
    except Exception as e:
        print(q["id"], "ERROR", e); continue
    k = 0
    for r in res:
        if k == 3: break
        try:
            data = urllib.request.urlopen(urllib.request.Request(r["url"], headers=UA), timeout=60).read()
        except Exception:
            continue
        k += 1
        f = f"{q['id']}_o{k}.jpg"
        open(os.path.join(out, f), "wb").write(data)
        cred[f] = {"title": r.get("title"), "author": r.get("creator"), "license": f"{r['license']} {r.get('license_version','')}", "url": r.get("foreign_landing_url")}
    print(q["id"], k, "|", q["q"])
json.dump(cred, open(os.path.join(out, "ov_credits.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)

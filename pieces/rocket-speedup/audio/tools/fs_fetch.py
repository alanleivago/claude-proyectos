# fs_fetch.py QUERIES.json : search Freesound (CC0 / CC BY only), download HQ previews into assets/<cat>/,
# append one manifest entry per file to assets/manifests/<cat>.json.  Key: env FREESOUND_API_KEY (never printed).
# QUERIES.json = [{"cat": "amb", "q": "ocean waves beach", "n": 4, "dur": [10, 600]}, ...]
import json, os, re, sys, time, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = os.environ["FREESOUND_API_KEY"]
UA = {"User-Agent": "wave-grew-sound/1.0"}
FIELDS = "id,name,license,username,duration,previews,num_downloads,avg_rating,tags,description,url,samplerate,channels"

def ok_licence(u):
    u = u.lower()
    if "publicdomain/zero" in u: return "CC0 1.0"
    m = re.search(r"/licenses/by/(\d\.\d)/", u)
    return f"CC BY {m.group(1)}" if m else None

def search(q, dur, pool=15):
    flt = 'license:("Creative Commons 0" OR "Attribution")'
    if dur: flt += f" duration:[{dur[0]} TO {dur[1]}]"
    p = dict(query=q, filter=flt, fields=FIELDS, page_size=pool, token=KEY)
    u = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode(p)
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))["results"]

def main():
    from concurrent.futures import ThreadPoolExecutor
    qs = json.load(open(sys.argv[1]))
    seen, jobs, mans = set(), [], {}
    for item in qs:
        cat, q, n = item["cat"], item["q"], item.get("n", 4)
        d = os.path.join(ROOT, "assets", cat); os.makedirs(d, exist_ok=True)
        mp = os.path.join(ROOT, "assets", "manifests", f"{cat}.json")
        if cat not in mans: mans[cat] = json.load(open(mp)) if os.path.exists(mp) else []
        have = {m["id"] for m in mans[cat]}
        try: res = search(q, item.get("dur"))
        except Exception as e: print("ERR", q, e); continue
        res = [r for r in res if ok_licence(r["license"])]
        res.sort(key=lambda r: -r["num_downloads"])
        got = 0
        for r in res:
            if got >= n: break
            sid = f"fs-{r['id']}"
            if sid in have or sid in seen: continue
            slug = re.sub(r"[^a-z0-9]+", "-", r["name"].lower()).strip("-")[:40]
            fn = os.path.join(d, f"{sid}_{slug}.ogg")
            url = r["previews"]["preview-hq-ogg"]
            seen.add(sid); got += 1
            lic = ok_licence(r["license"])
            jobs.append((url, fn))
            mans[cat].append({"id": sid, "file": os.path.relpath(fn, ROOT), "source": "freesound", "title": r["name"],
                        "author": r["username"], "page_url": r["url"], "licence_url": r["license"], "licence": lic,
                        "download_url": url, "duration_s": r["duration"], "downloads": r["num_downloads"],
                        "rating": r["avg_rating"], "tags": r["tags"][:12], "query": q,
                        "attribution": (None if lic.startswith("CC0") else
                                        f"\"{r['name']}\" by {r['username']} ({r['url']}), licensed under {lic} ({r['license']})")})
            print(f"{cat:8s} {sid:10s} {lic:8s} {r['duration']:7.1f}s dl={r['num_downloads']:6d} {r['name'][:60]}", flush=True)
        time.sleep(1.1)
    for cat, man in mans.items():
        json.dump(man, open(os.path.join(ROOT, "assets", "manifests", f"{cat}.json"), "w"), indent=1)
    def dl(j):
        url, fn = j
        try:
            urllib.request.urlretrieve(url, fn + ".part"); os.replace(fn + ".part", fn)
        except Exception as e: print("DLERR", fn, e, flush=True)
    with ThreadPoolExecutor(10) as ex: list(ex.map(dl, jobs))
    print("downloaded", len(jobs), flush=True)

main()

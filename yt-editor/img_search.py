"""Real photos for the support images: Wikimedia Commons search (free licences, many US-gov public domain).

  python img_search.py queries.json outdir

queries.json: [{"id": "c01", "q": "CBP officer passport control airport"}, ...]
Downloads the top landscape candidates (>=1280 px wide) per query as outdir/<id>_<k>.jpg
and writes outdir/credits.json (file, title, author, licence, page url) for the video description.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

UA = {"User-Agent": "yt-editor/1.0 (personal YouTube editing; alanleivago@gmail.com)"}
API = "https://commons.wikimedia.org/w/api.php"


def get(url, tries=4):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception:
            if k == tries - 1:
                raise
            time.sleep(2 + 3 * k)


def search(q, n=3):
    params = {"action": "query", "generator": "search", "gsrsearch": f"{q} filetype:bitmap",
              "gsrnamespace": 6, "gsrlimit": 20, "prop": "imageinfo",
              "iiprop": "url|size|extmetadata", "iiurlwidth": 1920, "format": "json"}
    data = json.loads(get(API + "?" + urllib.parse.urlencode(params)))
    pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    out = []
    for p in pages:
        ii = p["imageinfo"][0]
        w, h = ii.get("width", 0), ii.get("height", 1)
        if w < 1280 or w / h < 1.2:      # landscape and big enough for full screen
            continue
        meta = ii.get("extmetadata", {})
        lic = meta.get("LicenseShortName", {}).get("value", "")
        author = re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", "")).strip()
        out.append({"title": p["title"], "url": ii.get("thumburl") or ii["url"], "page": ii["descriptionurl"],
                    "license": lic, "author": author[:120], "w": w, "h": h})
        if len(out) >= n:
            break
    return out


def main(qfile, outdir):
    os.makedirs(outdir, exist_ok=True)
    credits = {}
    for item in json.load(open(qfile, encoding="utf-8-sig")):
        try:
            found = search(item["q"])
        except Exception as e:
            print(item["id"], "ERROR", e)
            continue
        for k, c in enumerate(found, 1):
            fn = f"{item['id']}_{k}.jpg"
            path = os.path.join(outdir, fn)
            if not os.path.exists(path):
                open(path, "wb").write(get(c["url"]))
                time.sleep(0.5)
            credits[fn] = c
        print(item["id"], len(found), "|", item["q"])
    json.dump(credits, open(os.path.join(outdir, "credits.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])


# commons.py "query" [n]: search Wikimedia Commons for audio files, print title, duration, licence, url (CC0 / public domain only)
import json, sys, urllib.parse, urllib.request
UA = {"User-Agent": "asteroide-sound/1.0 (alanleivago@gmail.com)"}
def api(**p):
    p.update(format="json"); u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
q, n = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 12
r = api(action="query", generator="search", gsrsearch=f"{q} filetype:audio", gsrnamespace=6, gsrlimit=n, prop="imageinfo", iiprop="url|extmetadata|size|mediatype")
for pg in (r.get("query", {}).get("pages", {}) or {}).values():
    ii = pg["imageinfo"][0]; md = ii.get("extmetadata", {}); lic = md.get("LicenseShortName", {}).get("value", "?")
    ok = any(k in lic.lower() for k in ("cc0", "public domain", "pd"))
    print(("OK " if ok else "-- ") + f"{pg['title'][5:][:70]:70s} | {lic[:22]:22s} | {md.get('Artist', {}).get('value', '')[:40]!r} | {ii['url']}")

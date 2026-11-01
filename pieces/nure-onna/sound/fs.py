# fs.py "query" n  -> download CC0 Freesound previews (HQ mp3) into fs/<slug>/
import json, os, sys, urllib.parse, urllib.request, re
K = os.environ["FREESOUND_API_KEY"]; q, n = sys.argv[1], int(sys.argv[2])
u = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode(dict(query=q, filter='license:"Creative Commons 0" duration:[0.3 TO 120]', fields="id,name,username,duration,previews,license", page_size=n, sort="rating_desc", token=K))
r = json.load(urllib.request.urlopen(u, timeout=60)); d = "fs/" + re.sub(r"\W+", "_", q)[:30]; os.makedirs(d, exist_ok=True)
for s in r["results"]:
    f = f"{d}/{s['id']}_{re.sub(r'[^A-Za-z0-9]+', '_', s['name'])[:40]}.mp3"
    urllib.request.urlretrieve(s["previews"]["preview-hq-mp3"], f); print(f"{s['id']}\t{s['duration']:.1f}s\t{s['username']}\t{s['name'][:50]}")

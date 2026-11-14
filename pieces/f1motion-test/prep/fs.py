import json, os, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path(os.path.expanduser("~/.freesound.json")).read_text(encoding="utf-8-sig"))["api_key"]
def search(q, dmin=0, dmax=600, n=15, sort="score"):
    f = f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]'
    u = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f, "sort": sort, "page_size": n, "fields": "id,name,duration,previews,username,num_downloads,avg_rating", "token": K})
    return json.load(urllib.request.urlopen(u))["results"]
def get(r, folder):
    p = Path(folder) / f"{r['id']}.mp3"
    if not p.exists():
        urllib.request.urlretrieve(r["previews"]["preview-hq-mp3"], p)
    return p
if __name__ == "__main__":
    q, folder, dmin, dmax = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
    n = int(sys.argv[5]) if len(sys.argv) > 5 else 12
    Path(folder).mkdir(parents=True, exist_ok=True)
    for r in search(q, dmin, dmax, n, "downloads_desc"):
        get(r, folder); print(r["id"], round(r["duration"], 1), r["num_downloads"], r["name"][:60])

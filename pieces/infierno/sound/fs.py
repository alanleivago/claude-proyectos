# fs.py "query" n [min_dur max_dur]: search Freesound for CC0 sounds, print id, name, duration, rating, downloads
import json, os, sys, urllib.parse, urllib.request
K = os.environ['FREESOUND_API_KEY']
q, n = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 10
lo, hi = (sys.argv[3], sys.argv[4]) if len(sys.argv) > 4 else ('1', '600')
p = dict(query=q, filter=f'license:"Creative Commons 0" duration:[{lo} TO {hi}]', sort='rating_desc', fields='id,name,duration,avg_rating,num_downloads,previews,username', page_size=n, token=K)
r = json.load(urllib.request.urlopen('https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode(p), timeout=60))
for s in r['results']: print(f"{s['id']:>8} {s['duration']:6.1f}s r{s['avg_rating']:.1f} d{s['num_downloads']:>6} {s['name'][:60]} | {s['username']}")

# Odyssey p5 "sonido pro": search Freesound (CC0 only) and download HQ previews into audio/sfxlib/raw/<cat>/fs<id>.mp3.
# Key from $FREESOUND_API_KEY (never printed). Appends to audio/sfxlib/freesound_meta.json.
import json, os, sys, urllib.request, urllib.parse
KEY = os.environ['FREESOUND_API_KEY']
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.path.join(os.path.dirname(HERE), 'sfxlib')
NEEDS = {   # cat: (query, min_dur, max_dur, n)
  'axe_chop': ('axe chopping wood', 0.5, 30, 5), 'tree_fall': ('tree falling crash', 1, 20, 4), 'stream': ('small stream water', 10, 180, 4),
  'wring': ('wringing wet cloth', 0.5, 20, 4), 'women_laugh': ('women laughing', 1, 20, 5), 'girls_play': ('girls playing laughing outdoor', 3, 60, 4),
  'ball': ('ball catch hands', 0.2, 10, 5), 'lyre': ('lyre', 3, 120, 6), 'hawk': ('hawk cry', 0.5, 10, 4), 'rain': ('heavy rain', 10, 180, 3),
  'feast': ('medieval tavern crowd', 10, 180, 4), 'log_thud': ('wooden log drop', 0.3, 8, 4), 'leaves': ('dry leaves rustle', 1, 30, 4),
  'spring': ('spring water trickle', 5, 120, 3), 'feast2': ('restaurant crowd chatter', 10, 180, 4), 'banquet': ('banquet crowd', 5, 180, 4),
  'girls2': ('children laughing playing', 3, 60, 4), 'ball2': ('ball bounce', 0.2, 10, 5), 'lyre2': ('harp pluck', 1, 60, 5), 'lyre3': ('lyre playing', 3, 120, 5),
  'log2': ('wood log drop', 0.3, 8, 4), 'cutlery': ('cups clink', 0.3, 10, 3), 'woman_angry': ('woman angry shout', 0.5, 8, 4), 'crickets_night': ('crickets night', 10, 180, 2),
}
mp = os.path.join(LIB, 'freesound_meta.json'); meta = json.load(open(mp)) if os.path.exists(mp) else {}
only = sys.argv[1:]
for cat, (q, a, b, n) in NEEDS.items():
    if only and cat not in only: continue
    os.makedirs(os.path.join(LIB, 'raw', cat), exist_ok=True)
    url = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode({'query': q, 'filter': f'license:"Creative Commons 0" duration:[{a} TO {b}]',
          'sort': 'rating_desc', 'fields': 'id,name,duration,previews,username,license,url', 'page_size': n, 'token': KEY})
    try: res = json.load(urllib.request.urlopen(url, timeout=60))['results']
    except Exception as e: print(cat, 'ERR', e); continue
    for r in res:
        p = os.path.join(LIB, 'raw', cat, f"fs{r['id']}.mp3")
        if not os.path.exists(p): urllib.request.urlretrieve(r['previews']['preview-hq-mp3'], p)
        meta[str(r['id'])] = dict(cat=cat, q=q, name=r['name'], user=r['username'], url=r['url'], license=r['license'], dur=r['duration'], file=p)
    print(cat, [(r['id'], r['name'][:32], round(r['duration'], 1)) for r in res], flush=True)
json.dump(meta, open(mp, 'w'), indent=1)

# Odyssey p3 "sonido pro": search Freesound (CC0 only) and download HQ previews into audio/sfxlib/raw/<cat>/fs<id>.mp3.
# Key from $FREESOUND_API_KEY (never printed). Appends to audio/sfxlib/freesound_meta.json.
import json, os, sys, urllib.request, urllib.parse
KEY = os.environ['FREESOUND_API_KEY']
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.path.join(os.path.dirname(HERE), 'sfxlib')
NEEDS = {   # cat: (query, min_dur, max_dur, n)
  'loom': ('loom weaving', 1, 60, 4), 'hum_woman': ('woman humming', 2, 60, 5), 'forest': ('forest ambience birds', 30, 300, 3),
  'lion': ('lion growl', 0.5, 15, 4), 'dog_pant': ('dog panting', 1, 20, 3), 'wolf': ('wolf growl', 0.5, 15, 3),
  'cup': ('ceramic cup clink', 0.2, 5, 4), 'chime': ('wind chimes', 1, 30, 4), 'pig_squeal': ('pig squeal', 0.5, 15, 4),
  'acorn': ('acorns falling', 0.3, 10, 3), 'run_sand': ('running footsteps gravel', 1, 20, 3), 'wings': ('wings flapping', 0.3, 10, 4),
  'rustle': ('pulling plant out of ground', 0.5, 10, 3), 'dig': ('digging dirt shovel', 1, 20, 4), 'grain': ('pouring rice', 1, 15, 3),
  'drip': ('liquid dripping', 1, 15, 3), 'crowd_murmur': ('crowd murmur', 10, 120, 4), 'moan': ('man moan groan', 0.5, 10, 4),
  'woman_cry': ('woman crying', 1, 20, 3), 'acorn2': ('nuts falling', 0.3, 10, 4), 'rustle2': ('leaves rustle', 0.5, 10, 4), 'wolf2': ('wolf snarl', 0.5, 15, 4),
  'moan2': ('man groan pain', 0.5, 10, 5), 'loom2': ('wooden loom', 1, 60, 4), 'crowd2': ('men murmuring', 5, 120, 3), 'body_fall': ('body fall', 0.3, 5, 4), 'cloth': ('cloth whoosh', 0.2, 5, 4),
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

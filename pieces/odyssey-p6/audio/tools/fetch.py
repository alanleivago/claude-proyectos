# Odyssey p6 "sonido pro": search Freesound (CC0 only) and download HQ previews into audio/sfxlib/raw/<cat>/fs<id>.mp3.
# Key from $FREESOUND_API_KEY (never printed). Appends to audio/sfxlib/freesound_meta.json.
import json, os, sys, urllib.request, urllib.parse
KEY = os.environ['FREESOUND_API_KEY']
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.path.join(os.path.dirname(HERE), 'sfxlib')
NEEDS = {   # cat: (query, min_dur, max_dur, n)   (round 2: the empty searches again with other words)
  'jeer': ('booing crowd', 1, 30, 4), 'bow_creak': ('wood creak stress', 0.3, 10, 6), 'bow_twang': ('archery bow', 0.2, 8, 8), 'bow_twang2': ('bowstring', 0.1, 8, 6),
  'arrow_hit': ('arrow impact', 0.1, 5, 6), 'arrow_hit2': ('arrow target', 0.1, 5, 6), 'arrows_drop': ('arrows', 0.2, 8, 8), 'spears': ('wooden sticks drop', 0.3, 8, 5),
  'string_pluck': ('string pluck low', 0.3, 6, 5), 'crowd_boo': ('crowd boo', 1, 30, 4), 'men_jeer': ('men laughing mocking', 0.5, 20, 5),
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

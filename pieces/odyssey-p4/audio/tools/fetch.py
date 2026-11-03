# Odyssey p4 "sonido pro": search Freesound (CC0 only) and download HQ previews into audio/sfxlib/raw/<cat>/fs<id>.mp3.
# Key from $FREESOUND_API_KEY (never printed). Appends to audio/sfxlib/freesound_meta.json.
import json, os, sys, urllib.request, urllib.parse
KEY = os.environ['FREESOUND_API_KEY']
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.path.join(os.path.dirname(HERE), 'sfxlib')
NEEDS = {   # cat: (query, min_dur, max_dur, n)
  'hum_women': ('female choir humming', 3, 90, 5), 'vocalise': ('female vocal ethereal', 3, 90, 5), 'wax': ('clay squish', 0.3, 8, 4),
  'jaw_snap': ('monster bite', 0.3, 6, 5), 'man_scream': ('man scream', 0.5, 8, 5), 'whirlpool': ('whirlpool water', 5, 180, 4),
  'drain': ('water draining', 5, 120, 3), 'paddle': ('hand paddling water', 1, 30, 4), 'bones': ('bones rattle', 0.3, 8, 4),
  'seagulls': ('seagulls', 5, 120, 3), 'squelch': ('squelch flesh', 0.3, 6, 4), 'drag': ('dragging leather', 0.5, 10, 4),
  'hum2': ('woman humming melody', 2, 90, 5), 'paddle2': ('splashing water hands', 1, 30, 4), 'drag2': ('dragging body', 0.5, 10, 4),
  'waterfall': ('waterfall roar', 10, 180, 3), 'rapids': ('river rapids', 10, 180, 3), 'chomp': ('teeth chomp bite', 0.2, 4, 4), 'dough': ('kneading dough', 1, 30, 3),
  'scales': ('metal chain clink', 0.3, 6, 3), 'wood_crack': ('wood crack break', 0.3, 6, 4), 'rope_creak': ('rope creak', 1, 30, 4),
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

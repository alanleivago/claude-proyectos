# zelda-oot "sonido pro": search Freesound (CC0 only) and download HQ previews into audio/sfxlib/raw/<cat>/fs<id>.mp3.
# Key from $FREESOUND_API_KEY (never printed). Appends to audio/sfxlib/freesound_meta.json.
import json, os, sys, urllib.request, urllib.parse
KEY = os.environ['FREESOUND_API_KEY']
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.path.join(os.path.dirname(HERE), 'sfxlib')
NEEDS = {
  'lava': ('lava bubbling', 4, 60, 5), 'bubbles': ('underwater bubbles', 3, 40, 5), 'explosion': ('explosion small', 0.5, 6, 5), 'cheer': ('crowd cheer', 2, 20, 5),
  'scroll': ('paper scroll unroll', 0.4, 5, 6), 'fountain': ('fountain water', 5, 60, 4), 'dragon': ('monster roar', 0.8, 8, 6), 'magic': ('magic whoosh', 0.4, 5, 6),
  'chain': ('chain rattle', 0.5, 8, 5), 'drum': ('tom drum hit', 0.3, 6, 5), 'organ': ('pipe organ chord', 2, 20, 5), 'harp': ('harp glissando', 1, 8, 5),
  'gallop': ('horse gallop', 2, 20, 5), 'cloth_swish': ('cloth swish', 0.2, 2, 8), 'sparkle2': ('magic chime sparkle', 0.5, 5, 6), 'crumble': ('rocks crumbling', 1, 10, 5),
  'wind_desert': ('desert wind', 10, 90, 4), 'cave': ('cave ambience dripping', 10, 90, 4), 'hall': ('large hall room tone', 10, 90, 4), 'birds_forest': ('forest birds', 10, 90, 4),
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

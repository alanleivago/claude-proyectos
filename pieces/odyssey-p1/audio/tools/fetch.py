# Odyssey p1 "sonido pro": search Freesound (CC0 only) and download HQ previews into audio/sfxlib/raw/<cat>/fs<id>.mp3.
# Key from $FREESOUND_API_KEY (never printed). Appends to audio/sfxlib/freesound_meta.json.
import json, os, sys, urllib.request, urllib.parse
KEY = os.environ['FREESOUND_API_KEY']
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.path.join(os.path.dirname(HERE), 'sfxlib')
NEEDS = {   # cat: (query, min_dur, max_dur, n)
  'crowd_party': ('crowd party cheering celebration', 5, 120, 3), 'crowd_drunk': ('tavern crowd', 5, 200, 3),
  'drum_frame': ('tambourine', 2, 60, 3), 'wood_creak': ('wood creak', 1, 20, 4),
  'rope_strain': ('rope creak', 1, 20, 3), 'cart_wheels': ('wooden cart wheels rolling', 3, 30, 3),
  'hatch': ('trapdoor', 0.5, 10, 3), 'gate': ('large wooden gate open creak', 1, 12, 3),
  'army_march': ('marching', 5, 120, 3), 'battle': ('battle swords crowd fighting', 5, 120, 3),
  'sword_clash': ('sword clash metal hit', 0.3, 4, 3), 'big_fire': ('large fire burning roar', 10, 120, 3),
  'scream_crowd': ('crowd screaming panic', 2, 30, 3), 'scream_woman': ('woman scream', 0.5, 4, 3),
  'cow': ('cow moo', 0.5, 6, 3), 'pour': ('pouring water', 1, 10, 3), 'thunder': ('thunder clap close', 2, 15, 3),
  'storm': ('storm wind rain heavy', 20, 300, 3), 'wind_howl': ('wind howling strong', 10, 120, 2),
  'birds': ('birds meadow calm morning', 20, 300, 3), 'calm_shore': ('calm waves lapping shore', 20, 300, 2),
  'coins': ('coins', 0.5, 8, 3), 'chains': ('chains rattle heavy', 0.5, 6, 3),
  'crows': ('crow caw', 0.5, 8, 2), 'sobbing': ('man crying sobbing', 1, 10, 3), 'ghost_wind': ('eerie wind ghostly', 10, 120, 2),
  'pig': ('pig oink', 0.5, 6, 3), 'bow': ('bow string draw arrow release', 0.5, 6, 3), 'crickets': ('crickets night', 20, 300, 2),
  'armor': ('armor rattle chainmail', 0.5, 6, 3), 'arrows': ('arrow whoosh', 0.2, 3, 3),
  'war_horn': ('war horn ancient', 1, 10, 3), 'bite_chew': ('eating fruit bite chew', 0.5, 5, 2), 'oar_bench': ('rowing', 5, 120, 2),
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

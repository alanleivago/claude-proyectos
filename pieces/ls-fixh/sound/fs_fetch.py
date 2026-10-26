"""Busca y baja previews HQ de Freesound (solo CC0) para los ambientes y SFX reales de lego-sea."""
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser('~/.freesound.json'), encoding='utf-8-sig'))['api_key']
NEEDS = {   # name: (query, min_dur, max_dur, n)
  'surf_bed': ('ocean waves beach calm', 40, 600, 3), 'storm_bed': ('storm sea rain wind heavy', 30, 600, 3),
  'underwater_bed': ('underwater ambience', 30, 600, 3), 'gull': ('seagull call', 0.5, 6, 4),
  'wave_crash': ('big wave crash', 1, 8, 3), 'thunder': ('thunder clap close', 2, 12, 3),
  'dog_bark': ('small dog bark single', 0.2, 2.5, 3), 'dog_pant': ('dog panting', 1, 6, 2),
  'splash_big': ('big splash water object', 0.5, 4, 3), 'bubbles': ('underwater bubbles', 0.5, 5, 3),
  'ship_creak': ('ship wood creak hull', 1, 8, 3), 'alarm_bell': ('ship alarm bell', 1, 8, 2),
  'crowd_gasp': ('crowd gasp surprise', 0.5, 4, 2), 'confetti': ('party popper confetti', 0.3, 3, 2),
  'sand_steps': ('footsteps sand beach', 2, 15, 2), 'lego_rattle': ('lego bricks rattle', 0.5, 5, 3),
  'clock_tick': ('clock ticking fast', 1, 10, 2), 'paper_flip': ('book pages flip', 0.5, 4, 2),
  'metal_chain': ('chain snap metal', 0.3, 4, 2), 'container_scrape': ('metal container scrape slide', 1, 6, 2),
}
out = {}
for name, (q, a, b, n) in NEEDS.items():
    url = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode({'query': q, 'filter': f'license:"Creative Commons 0" duration:[{a} TO {b}]',
          'sort': 'rating_desc', 'fields': 'id,name,duration,previews,username,num_downloads', 'page_size': n, 'token': KEY})
    try: res = json.load(urllib.request.urlopen(url, timeout=60))['results']
    except Exception as e: print(name, 'ERR', e); continue
    for r in res:
        p = f"fs/{name}_{r['id']}.mp3"
        if not os.path.exists(p): urllib.request.urlretrieve(r['previews']['preview-hq-mp3'], p)
        out.setdefault(name, []).append({'file': p, 'id': r['id'], 'name': r['name'], 'dur': round(r['duration'], 1), 'by': r['username']})
    print(name, [(x['id'], x['name'][:30], x['dur']) for x in out.get(name, [])], flush=True)
json.dump(out, open('fs/index.json', 'w'), indent=1)

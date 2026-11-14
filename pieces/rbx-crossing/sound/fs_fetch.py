"""Busca y baja previews HQ de Freesound (solo CC0) para rbx-crossing. Uso: python fs_fetch.py [name ...] (sin args = todos los que faltan).
La clave sale de %USERPROFILE%/.freesound.json (api_key) y nunca se imprime. Indice en fs/index.json."""
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser('~/.freesound.json'), encoding='utf-8-sig'))['api_key']
NEEDS = {  # name: (query, min s, max s, how many)
  'squeak': ('shoe squeak', 0.15, 2, 5), 'sneaker': ('footsteps concrete walking', 2, 12, 3), 'step': ('footstep concrete', 0.1, 1.2, 4),
  'crowdwalk': ('crowd walking footsteps', 3, 30, 3), 'murmur': ('crowd murmur outdoor', 4, 40, 3), 'crowdgasp': ('crowd gasp', 0.4, 4, 3),
  'chant': ('crowd chanting', 2, 15, 3), 'splash': ('body splash water', 0.4, 4, 3), 'fountain': ('fountain water', 4, 40, 2),
  'shutter': ('phone camera shutter', 0.1, 2, 3), 'megaphone': ('megaphone', 0.3, 6, 4), 'subway': ('metro train interior ride', 8, 90, 3),
  'doors': ('train doors closing', 0.8, 5, 3), 'bell': ('school bell', 1, 8, 2), 'chalk': ('chalk blackboard writing', 0.5, 6, 2),
  'meow': ('cat meow', 0.3, 3, 3), 'horns': ('traffic jam car horns', 2, 20, 2), 'fridge': ('refrigerator hum', 4, 40, 2),
  'paper': ('paper rustle', 0.3, 3, 3), 'spoon': ('spoon cereal bowl', 0.5, 5, 2), 'door': ('front door open', 0.5, 4, 3),
  'birds': ('morning birds suburb', 6, 60, 2), 'wind': ('wind ambience', 8, 90, 2), 'heart': ('heartbeat', 1, 8, 2),
  'laugh': ('crowd laugh', 1, 6, 2), 'shrug': ('cloth rustle', 0.2, 2, 3), 'cafe': ('restaurant ambience', 6, 60, 2), 'classroom': ('classroom ambience', 6, 60, 2),
}
os.makedirs('fs', exist_ok=True)
only = sys.argv[1:]
idx = json.load(open('fs/index.json')) if os.path.exists('fs/index.json') else {}
for name, (q, a, b, n) in NEEDS.items():
    if only and name not in only: continue
    if name in idx and not only: continue
    url = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode({'query': q, 'filter': f'license:"Creative Commons 0" duration:[{a} TO {b}]',
          'sort': 'rating_desc', 'fields': 'id,name,duration,previews,username,license', 'page_size': n, 'token': KEY})
    try: res = json.load(urllib.request.urlopen(url, timeout=60))['results']
    except Exception as e: print(name, 'ERR', type(e).__name__); continue
    idx[name] = []
    for r in res:
        if 'publicdomain/zero' not in r['license']: continue
        p = f"fs/{name}_{r['id']}.mp3"
        if not os.path.exists(p): urllib.request.urlretrieve(r['previews']['preview-hq-mp3'], p)
        idx[name].append({'file': p, 'id': r['id'], 'name': r['name'], 'dur': round(r['duration'], 1), 'by': r['username'], 'license': r['license']})
    print(name, [(x['id'], x['name'][:28], x['dur']) for x in idx[name]], flush=True)
    json.dump(idx, open('fs/index.json', 'w'), indent=1)

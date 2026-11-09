"""Busca y baja previews HQ de Freesound (solo CC0) para rbx-chess. Uso: fs_fetch.py [name ...] (sin args = todos).
Reusa lo copiado de rbx-thursday/sound/fs (ya en fs/index.json). La clave sale de ~/.zshrc (FREESOUND_API_KEY) y nunca se imprime."""
import json, os, sys, subprocess, urllib.request, urllib.parse
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
NEEDS = {
  'town': ('village ambience', 20, 900, 3), 'night_town': ('night ambience crickets', 20, 900, 3),
  'wood_thud': ('wood thud', 0.1, 3, 3), 'lid_slide': ('wood slide', 0.5, 8, 3), 'rooftop_land': ('body fall', 0.1, 3, 3),
  'school_bell': ('bell ring', 0.5, 8, 3), 'wood_creak': ('wood creak', 0.5, 6, 3), 'chess_piece': ('chess', 0.1, 4, 4),
}
only = sys.argv[1:]
idx = json.load(open('fs/index.json')) if os.path.exists('fs/index.json') else {}
for name, (q, a, b, n) in NEEDS.items():
    if only and name not in only: continue
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

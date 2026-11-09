"""Busca y baja previews HQ de Freesound (solo CC0) para rbx-rope. Uso: fs_fetch.py [name ...] (sin args = todos).
Reusa lo copiado de rbx-chess/sound/fs (fs/index.json). La clave sale de ~/.zshrc (FREESOUND_API_KEY) y nunca se imprime."""
import json, os, sys, subprocess, urllib.request, urllib.parse
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
NEEDS = {
  'rope_creak': ('rope creak', 0.5, 8, 4), 'rope_strain': ('rope tension stretch', 0.5, 8, 4), 'rope_slip': ('rope slide friction', 0.3, 5, 4),
  'crowd_heave': ('crowd effort grunt', 0.5, 6, 4), 'tug_grunt': ('grunt effort', 0.3, 3, 4), 'crowd_cheer': ('crowd cheer', 2, 15, 3),
  'tractor': ('tractor engine', 3, 20, 3), 'elephant': ('elephant trumpet', 0.5, 6, 4), 'sneeze': ('sneeze', 0.3, 3, 4),
  'zipline': ('zip line', 0.5, 6, 3), 'pulley': ('pulley squeak', 0.3, 4, 3), 'seagulls': ('seagulls waves', 10, 120, 3),
  'landslide': ('rocks falling landslide', 1, 10, 3), 'rock_slide': ('gravel slide', 0.5, 6, 3), 'chalk': ('chalk writing blackboard', 0.5, 6, 3),
  'playground': ('children playground', 10, 120, 3), 'kids_cheer': ('kids cheering', 1, 8, 3), 'mountain_wind': ('mountain wind howling', 10, 90, 3),
  'stake_hit': ('wooden stake hammer', 0.2, 3, 3), 'rope_pull': ('rope pull', 0.3, 6, 4), 'crowd_shout': ('crowd shouting', 1, 10, 3), 'hammer_wood': ('hammer wood hit', 0.2, 3, 3), 'tractor_idle': ('tractor diesel', 3, 30, 3), 'birds_dawn': ('dawn birds', 10, 120, 2), 'waves': ('ocean waves', 10, 120, 2), 'wedding_bells': ('wedding bells', 2, 12, 3), 'whoosh_deep': ('whoosh deep', 0.5, 4, 3),
}
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
    print(name, [(x['id'], x['name'][:30], x['dur']) for x in idx[name]], flush=True)
    json.dump(idx, open('fs/index.json', 'w'), indent=1)

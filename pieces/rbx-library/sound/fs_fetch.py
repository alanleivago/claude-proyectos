"""Busca y baja previews HQ de Freesound (solo CC0) para rbx-library. Uso: fs_fetch.py [name ...] (sin args = todos).
Reusa lo copiado de rbx-chess/sound/fs (fs/index.json). La clave sale de ~/.zshrc (FREESOUND_API_KEY) y nunca se imprime."""
import json, os, sys, subprocess, urllib.request, urllib.parse
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
NEEDS = {
  'stamp_thunk': ('heavy wooden thud', 0.2, 3, 5), 'rubber_stamp': ('rubber stamp', 0.1, 2, 4), 'big_thud': ('heavy door slam boom', 0.3, 4, 4),
  'mailbox': ('mailbox lid metal', 0.2, 3, 4), 'skitter': ('insect scurry', 0.3, 4, 3), 'library_amb': ('library ambience', 10, 180, 3),
  'stopwatch': ('stopwatch ticking', 1, 10, 3), 'fire_alarm': ('fire alarm bell', 1, 10, 3), 'fire_horn': ('fire truck horn', 0.5, 6, 3),
  'sticker': ('sticker peel', 0.2, 3, 3), 'splat': ('splat', 0.1, 2, 4), 'desk_bell': ('service bell ding', 0.2, 3, 3), 'metal_slide': ('metal slide scrape', 0.5, 5, 3),
  'tension': ('horror tension drone', 5, 60, 3), 'pages_burst': ('book pages flutter', 0.3, 4, 4), 'kids_giggle': ('children giggling', 0.5, 5, 3),
  'bubbling': ('bubbling soup pot', 2, 20, 3), 'tiptoe': ('tiptoe footsteps', 0.5, 6, 3),
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

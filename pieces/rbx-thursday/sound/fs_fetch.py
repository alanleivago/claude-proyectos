"""Busca y baja previews HQ de Freesound (solo CC0) para rbx-thursday. Uso: fs_fetch.py [name ...] (sin args = todos).
La clave sale de ~/.zshrc (FREESOUND_API_KEY) y nunca se imprime."""
import json, os, sys, subprocess, urllib.request, urllib.parse
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
NEEDS = {   # name: (query, min_dur, max_dur, n)
  # music / drone
  'musicbox': ('music box lullaby', 20, 400, 6), 'musicbox2': ('music box melody slow', 15, 400, 4),
  'drone': ('dark ambient drone low', 30, 600, 4), 'warm': ('warm gentle piano music loop', 20, 400, 4),
  # beds
  'crickets': ('night crickets ambience', 30, 600, 3), 'wind_bed': ('night wind ambience soft', 30, 600, 3),
  'roomtone': ('room tone quiet house night', 30, 600, 3), 'classroom': ('classroom murmur children ambience', 20, 600, 3),
  'morning': ('morning birds suburb ambience', 30, 600, 2),
  # sfx
  'hammer': ('hammer nail wood single hit', 0.3, 6, 4), 'school_bell': ('school bell ringing', 1, 10, 3),
  'desk_slam': ('head hit wooden desk thud', 0.2, 3, 3), 'chalk': ('chalk writing blackboard', 1, 10, 3),
  'creak': ('wood board creak', 0.5, 6, 4), 'nail_squeak': ('nail pulled out of wood squeak', 0.3, 5, 3),
  'board_drop': ('wooden plank drop floor', 0.3, 4, 3), 'rumble': ('deep low rumble', 2, 12, 3),
  'whoosh_big': ('big whoosh', 0.5, 4, 3), 'riser': ('riser whoosh up', 1.5, 6, 3),
  'shingles': ('roof tiles rattle', 0.5, 8, 3), 'church_bell': ('church bell single toll', 2, 15, 3),
  'clock_tick': ('clock ticking', 2, 15, 3), 'wind_gust': ('wind gust howl', 1.5, 10, 3),
  'cheer_soft': ('small crowd cheer applause', 2, 10, 3), 'plate_clink': ('ceramic plate clink', 0.2, 3, 3),
  'car_engine': ('car engine drive by slow', 3, 15, 3), 'car_door': ('car door close', 0.3, 3, 3),
  'footsteps': ('footsteps sidewalk walking', 2, 15, 3), 'sniff': ('sniff sniffing nose', 0.3, 4, 3),
  'water_pour': ('watering can pour plants', 1, 10, 3), 'cat_meow': ('cat meow single', 0.3, 3, 3),
  'blanket': ('blanket cloth rustle', 0.5, 5, 3), 'trunk_slam': ('car trunk slam', 0.3, 3, 3),
  'mug_clink': ('mug clink ceramic', 0.2, 3, 3), 'heartbeat': ('heartbeat slow', 2, 15, 3),
  'breath': ('deep slow breathing monster', 2, 12, 3), 'scratch': ('scratching wood', 0.5, 6, 3),
  'ladder': ('ladder climbing metal', 1, 8, 2), 'paper': ('paper rustle', 0.3, 4, 3),
  'suitcase': ('suitcase zipper', 0.5, 5, 2), 'balloon': ('balloon squeak rub', 0.3, 4, 2),
  'cardboard': ('cardboard box handling', 0.3, 4, 2), 'boards_pull': ('wood plank pry off creak', 0.5, 6, 3),
  'bed_creak': ('bed creak sit up', 0.3, 5, 2), 'kid_cry': ('child crying short', 0.5, 5, 2),
  'trophy': ('metal trophy clink', 0.2, 3, 2), 'whoosh_soft': ('soft whoosh swish', 0.2, 2, 3),
  'squish': ('wet eyelid blink squish', 0.1, 2, 3), 'door_open': ('window open wooden', 0.5, 5, 2),
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

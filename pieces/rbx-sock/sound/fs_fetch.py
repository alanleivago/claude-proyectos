"""Busca y baja previews HQ de Freesound (solo CC0) para rbx-sock. Uso: fs_fetch.py [name ...] (sin args = todos).
Reusa lo copiado de rbx-thursday/sound/fs (ya en fs/index.json). La clave sale de ~/.zshrc (FREESOUND_API_KEY) y nunca se imprime."""
import json, os, sys, subprocess, urllib.request, urllib.parse
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
NEEDS = {   # name: (query, min_dur, max_dur, n)
  # beds
  'laundry_hum': ('washing machine dryer running ambience', 20, 600, 3), 'cave': ('cave ambience drips', 20, 600, 3),
  'shower': ('shower running water', 10, 300, 3), 'hospital': ('hospital ambience', 20, 600, 3),
  'chute_wind': ('wind tunnel howl', 5, 120, 3), 'suburb': ('suburb day ambience birds', 30, 600, 3),
  # sfx
  'sock_pull': ('cloth rustle', 0.3, 5, 4), 'cloth_stretch': ('fabric stretch cloth', 0.3, 5, 4),
  'string_tie': ('string pull', 0.3, 6, 3), 'knitting': ('knitting', 0.5, 60, 5),
  'school_door': ('door open close school', 0.5, 5, 3), 'whistle': ('sports whistle blow', 0.2, 4, 4),
  'dryer_start': ('dryer', 1, 30, 3), 'dryer_drum': ('washing machine', 3, 60, 3),
  'flashlight': ('flashlight click', 0.1, 2, 3), 'chute_rattle': ('metal rattle', 0.3, 5, 4),
  'drain': ('drain gurgle', 1, 15, 3), 'whisper': ('whisper creepy', 1, 10, 3),
  'vent': ('metal scrape', 0.3, 6, 3), 'wet_steps': ('wet footsteps squelch', 1, 12, 3),
  'gasp': ('gasp breath inhale', 0.2, 3, 4), 'fall_wind': ('falling wind whoosh', 1, 8, 3),
  'soft_land': ('body fall', 0.2, 4, 3), 'pop': ('cartoon pop', 0.05, 1, 3),
  'comic': ('boing', 0.2, 3, 3), 'slide_whistle': ('slide whistle down', 0.3, 3, 3),
  'clothespin': ('clothespin', 0.1, 5, 3), 'cushion': ('pillow hit', 0.1, 5, 3),
  'dog': ('dog panting', 0.5, 10, 3), 'baby_coo': ('baby laugh', 0.5, 6, 3),
  'alarm_clock': ('alarm clock ticking bedside', 1, 15, 2), 'grate': ('metal clank', 0.2, 3, 3),
  'creepy_whoosh': ('dark creepy whoosh', 0.5, 4, 3), 'chime': ('chime', 0.5, 4, 3),
  'giggle': ('child giggle', 0.5, 5, 3), 'drip': ('water drip', 0.3, 5, 3), 'knot': ('knot tie', 0.3, 6, 3), 'drawer': ('cardboard box', 0.3, 4, 3), 'mashed': ('food squish', 0.2, 3, 3), 'thud_soft': ('thud', 0.1, 2, 3),
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

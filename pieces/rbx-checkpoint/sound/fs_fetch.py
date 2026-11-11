"""Busca y baja previews HQ de Freesound (solo CC0) para rbx-checkpoint. Uso: fs_fetch.py [name ...] (sin args = todos).
Reusa lo copiado de rbx-chess/sound/fs (fs/index.json). La clave sale de ~/.zshrc (FREESOUND_API_KEY) y nunca se imprime."""
import json, os, sys, subprocess, urllib.request, urllib.parse
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
NEEDS = {
  'poof': ('puff', 0.2, 2.5, 4), 'smoke_puff': ('smoke', 0.2, 2.5, 4), 'magic_pop': ('magic appear', 0.3, 2.5, 4), 'sparkle': ('sparkle twinkle', 0.3, 3, 3),
  'bodyfall': ('body fall', 0.3, 2.5, 4), 'trip': ('trip stumble fall', 0.3, 3, 3), 'stairs_fall': ('falling down stairs', 1, 5, 3),
  'flag_flap': ('flag flapping wind', 1, 15, 3), 'ref_whistle': ('referee whistle blow', 0.3, 3, 4), 'dog_bark': ('small dog bark', 0.2, 3, 4), 'dog_pant': ('dog panting', 1, 8, 3),
  'dog_whine': ('puppy whine', 0.3, 3, 3), 'ear_flap': ('dog shake ears', 0.3, 3, 3), 'chew': ('dog chewing', 0.5, 6, 3),
  'ground_crack': ('earthquake', 1, 10, 4), 'collapse': ('rubble', 0.5, 8, 4), 'debris': ('rocks falling debris', 0.5, 5, 3), 'rock_break': ('stone crack', 0.2, 3, 4),
  'crowd_scream': ('crowd screaming', 1, 6, 3), 'crowd_ooh': ('crowd ooh', 0.5, 4, 3), 'ladder': ('metal ladder', 0.3, 4, 3), 'rope_throw': ('rope throw whoosh', 0.3, 3, 3),
  'tuba': ('tuba note', 0.5, 4, 4), 'marching_band': ('marching band drum', 2, 15, 3), 'splash': ('splash', 0.4, 4, 4), 'waterpark': ('swimming pool kids', 10, 120, 2),
  'carnival': ('carnival fair ambience', 10, 120, 3), 'stick_dirt': ('shovel dirt', 0.2, 2, 3), 'yell': ('kid yell shout', 0.3, 3, 3), 'snore': ('snore', 0.5, 4, 3),
  'leash': ('dog leash chain', 0.3, 3, 3), 'climb': ('climbing rock grab', 0.3, 4, 3), 'interior_room': ('mansion room tone', 10, 120, 2),
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

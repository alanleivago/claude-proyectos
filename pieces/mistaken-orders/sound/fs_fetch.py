"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json)."""
import json, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {  # key: (query, min s, max s)
    'rest_bed': ('restaurant ambience chatter cutlery', 20, 300), 'alley_bed': ('tokyo street night ambience', 20, 300), 'care_bed': ('quiet room clock ticking ambience', 20, 300),
    'plate': ('ceramic plate', 0.2, 4), 'clink': ('cup saucer clink', 0.2, 3), 'cutlery': ('spoon drop table', 0.2, 3), 'tick': ('clock ticking', 2, 20),
    'chalk': ('chalk writing blackboard', 0.5, 6), 'applause': ('small group applause', 2, 10), 'crowdlaugh': ('group laughter', 1, 8), 'chew': ('eating chewing', 0.5, 5),
    'kbell': ('service bell ding', 0.2, 3), 'noren': ('cloth fabric swish', 0.2, 3), 'slide': ('sliding door wooden', 0.3, 4), 'boom': ('explosion', 2, 8), 'debris': ('wood debris', 0.5, 6), 'scream': ('cartoon scream', 0.3, 3),
}
idx = json.loads(Path('fs/index.json').read_text()) if Path('fs/index.json').exists() else {}
for key in (sys.argv[1:] or Q):
    q, a, b = Q[key]
    u = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode(dict(query=q, filter=f'license:"Creative Commons 0" duration:[{a} TO {b}]', fields='id,name,username,duration,previews', page_size=3, sort='rating_desc', token=K))
    try: r = json.load(urllib.request.urlopen(u, timeout=60))
    except Exception as e: print(key, 'ERR', e); continue
    idx[key] = []
    for s in r['results']:
        f = f"fs/{key}_{s['id']}.mp3"
        if not Path(f).exists(): urllib.request.urlretrieve(s['previews']['preview-hq-mp3'], f)
        idx[key].append({'file': f, 'id': s['id'], 'name': s['name'], 'dur': round(s['duration'], 1), 'by': s['username']})
    print(key, [(x['id'], x['dur'], x['name'][:34]) for x in idx[key]])
Path('fs/index.json').write_text(json.dumps(idx, indent=1))

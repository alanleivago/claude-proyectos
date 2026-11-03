"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json)."""
import json, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {  # key: (query, min s, max s)
    'library_bed': ('library quiet room ambience', 20, 300), 'street_bed': ('european city street ambience people', 20, 300), 'canal_bed': ('water lapping harbour', 15, 300),
    'steps_cobble': ('footsteps cobblestone', 1, 15), 'steps_wood': ('footsteps wooden floor', 1, 15), 'stamp': ('rubber stamp', 0.1, 2), 'paper': ('paper slide', 0.2, 3),
    'pencil': ('pencil scribble', 0.3, 4), 'gulp': ('gulp swallow', 0.2, 2), 'laugh': ('man chuckle', 0.3, 3), 'chair': ('wooden chair', 0.2, 4),
    'bikebell': ('bicycle bell ring', 0.2, 3), 'door': ('heavy door close', 0.3, 4), 'flag': ('flag flapping wind', 1, 10),
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

"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json)."""
import json, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {  # key: (query, min s, max s)
    'home_bed': ('room tone apartment', 20, 600), 'lady_bed': ('living room clock ticking ambience', 20, 400), 'office_bed': ('office ambience quiet', 20, 400),
    'squeak': ('guinea pig squeak', 0.2, 3), 'wheek': ('guinea pig squeal', 0.3, 6), 'chirp': ('guinea pig', 0.3, 5),
    'pen': ('writing pen paper', 0.5, 8), 'door': ('door open creak', 0.4, 3), 
    'boxshake': ('cardboard box shake', 0.3, 3), 'boom': ('cartoon explosion', 0.5, 4), 'debris': ('wood planks falling', 0.4, 6),
    'cardboard': ('cardboard box tear', 0.3, 3), 'hammer': ('hammer nail wood', 0.2, 2), 'phone': ('rotary phone ring', 0.5, 4),
    'siren': ('police siren short', 0.5, 3), 'boing': ('cartoon boing', 0.2, 2), 'thump2': ('soft thud', 0.1, 2),
    'scurry': ('tiny footsteps running', 0.3, 5), 'sparkle': ('magic sparkle chime', 0.3, 2), 'gasp': ('cartoon gasp', 0.2, 2),
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
    print(key, [(x['id'], x['dur'], x['name'][:30].encode('ascii', 'replace').decode()) for x in idx[key]], flush=True)
    Path('fs/index.json').write_text(json.dumps(idx, indent=1))

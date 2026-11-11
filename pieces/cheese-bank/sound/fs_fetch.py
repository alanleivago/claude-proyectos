"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json)."""
import json, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {
    'bank_bed2': ('office lobby ambience people', 15, 400), 'vault_bed2': ('warehouse room tone', 15, 400), 'knock2': ('knocking', 0.2, 4), 'clunk2': ('metal clunk', 0.2, 3),
    'neon2': ('fluorescent light on', 0.3, 5), 'rustle2': ('banknotes', 0.3, 4), 'trombone2': ('trombone fail', 0.5, 5), 'cellar_bed2': ('basement ambience', 15, 400),  # key: (query, min s, max s)
    'bank_bed': ('bank lobby ambience', 20, 300), 'cellar_bed': ('cellar room tone ambience', 20, 300), 'piazza_bed': ('italian town square ambience', 20, 300), 'vault_bed': ('large warehouse interior ambience', 20, 300),
    'knock': ('knock on wood', 0.2, 3), 'sniff': ('sniffing nose', 0.2, 3), 'truck': ('truck engine passing', 3, 15), 'clunk': ('heavy metal latch clunk', 0.2, 3),
    'creak': ('heavy door creak', 0.4, 4), 'slam': ('metal vault door close', 0.3, 4), 'neon': ('neon light turn on', 0.3, 4), 'cashreg': ('cash register', 0.3, 3),
    'flip': ('paper page flip', 0.1, 2), 'slap': ('paper slap table', 0.1, 2), 'brush': ('scrubbing brush', 1, 6), 'thud': ('heavy thud', 0.2, 3),
    'scrape': ('wood slide table scrape', 0.3, 3), 'rustle': ('money bills rustle', 0.3, 3), 'trombone': ('sad trombone', 0.8, 4), 'swish': ('cloth fabric swish', 0.2, 3),
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

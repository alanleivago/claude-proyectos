"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json)."""
import json, os, re, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {  # key: (query, min s, max s)
    'hall_bed': ('auction hall crowd murmur indoor ambience', 20, 240), 'country_bed': ('countryside birds wind ambience', 20, 240),
    'warehouse_bed': ('warehouse industrial hall ambience', 20, 240), 'greenhouse_bed': ('morning birds ambience', 20, 240),
    'cafe_bed': ('cafe restaurant ambience', 20, 240), 'auctionroom_bed': ('crowd bidding auction', 5, 120),
    'button': ('big button press click', 0.1, 2), 'buzzer': ('game show buzzer', 0.2, 3), 'clocktick': ('clock tick', 1, 10),
    'trolley': ('cart trolley rolling wheels', 1, 10), 'gavel': ('gavel bang', 0.2, 3), 'plane': ('propeller airplane flyby', 2, 12),
    'scissors': ('scissors cut', 0.2, 3), 'gasp': ('gasp surprise', 0.2, 2), 'stamp': ('rubber stamp', 0.1, 2), 'tug': ('electric cart motor', 1, 10),
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
    print(key, [(x['id'], x['dur'], x['name'][:30]) for x in idx[key]])
Path('fs/index.json').write_text(json.dumps(idx, indent=1))

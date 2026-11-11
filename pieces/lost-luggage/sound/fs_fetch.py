"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json).
Recipe: pieces/guinea-rent/sound/fs_fetch.py. Usage: python fs_fetch.py [key ...]"""
import json, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {  # key: (query, min s, max s)
    'airport_bed': ('airport terminal announcement ambience', 30, 900), 'street_bed': ('small town street ambience birds traffic', 30, 180),
    'warehouse_bed': ('factory ambience', 20, 300), 'store_bed': ('supermarket store ambience', 30, 180), 'museum_bed': ('museum ambience', 20, 300),
    'warehouse_bed2': ('warehouse', 20, 300), 'hall_bed': ('large hall room tone', 20, 300),
    'conveyor': ('conveyor belt motor', 2, 60), 'clunk': ('heavy box drop', 0.3, 4), 'roll': ('suitcase wheels rolling', 0.8, 10),
    'zip': ('zipper open', 0.3, 3), 'latch': ('suitcase latch', 0.2, 2), 'chicken': ('rubber chicken squeak', 0.3, 3),
    'bowling': ('bowling ball', 0.3, 6), 'beep': ('barcode scanner beep', 0.1, 1.5), 'drawer': ('cash register drawer open', 0.3, 3),
    'steps': ('footsteps hard floor', 1, 10), 'carpass': ('car pass by', 1.5, 8), 'truck': ('truck pass by', 2, 10),
    'hiss': ('snake hiss', 0.4, 4), 'rattle': ('rattlesnake rattle', 0.5, 6), 'visor': ('metal armor clank', 0.2, 3),
    'flutter': ('paper flutter', 0.3, 3), 'typing': ('keyboard typing', 1, 10), 'slide': ('automatic sliding door', 0.8, 6),
    'pricegun': ('stapler', 0.1, 2), 'washer': ('washing machine spin', 2, 30), 'cash': ('money', 0.3, 5),
    'dolly': ('trolley rolling', 1, 15), 'cloth': ('clothes rustle', 0.3, 3), 'socks': ('cloth flap whoosh', 0.2, 2),
    'creak': ('metal hinge creak short', 0.3, 3), 'lidthud': ('suitcase open', 0.2, 3), 'crowd': ('small crowd murmur indoor', 10, 120),
}
idx = json.loads(Path('fs/index.json').read_text()) if Path('fs/index.json').exists() else {}
def get(key):   # parallel per key; downloads go to .part, then renamed (an interrupted run leaves no truncated mp3)
    q, a, b = Q[key]
    u = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode(dict(query=q, filter=f'license:"Creative Commons 0" duration:[{a} TO {b}]', fields='id,name,username,duration,previews', page_size=2 if key.endswith('_bed') else 3, sort='rating_desc', token=K))
    try: r = json.load(urllib.request.urlopen(u, timeout=60))
    except Exception as e: return key, 'ERR ' + str(e)
    out = []
    for s in r['results']:
        f = f"fs/{key}_{s['id']}.mp3"
        if not Path(f).exists():
            try: urllib.request.urlretrieve(s['previews']['preview-hq-mp3'], f + '.part'); Path(f + '.part').rename(f)
            except Exception as e: continue
        out.append({'file': f, 'id': s['id'], 'name': s['name'], 'dur': round(s['duration'], 1), 'by': s['username']})
    return key, out
from concurrent.futures import ThreadPoolExecutor
keys = [k for k in (sys.argv[1:] or Q) if k not in idx or sys.argv[1:]]
with ThreadPoolExecutor(8) as ex:
    for key, out in ex.map(get, keys):
        if isinstance(out, str): print(key, out, flush=True); continue
        idx[key] = out; Path('fs/index.json').write_text(json.dumps(idx, indent=1))
        print(key, [(x['id'], x['dur'], x['name'][:30].encode('ascii', 'replace').decode()) for x in out], flush=True)

"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json).
Recipe: pieces/guinea-rent/sound/fs_fetch.py. Usage: python fs_fetch.py [key ...]"""
import json, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {  # key: (query, min s, max s)
    'flap4': ('mechanical clicks', 0.3, 10),
    'beep2': ('reversing', 1, 20),
    'flap2': ('card flip', 0.1, 5),
    'slam2': ('tailgate', 0.3, 6),
    'chime2': ('glockenspiel', 0.5, 6),
    'signcreak2': ('creaking hinge', 0.5, 6),
    'slide2': ('book slide', 0.2, 4),
    'flap3': ('departure board', 0.3, 30),
    'street_bed': ('city street dawn birds ambience', 30, 300), 'street2_bed': ('street ambience morning', 30, 300),
    'depot_bed': ('room tone kitchen fridge hum', 20, 300), 'factory_bed': ('warehouse ambience', 20, 300),
    'library_bed': ('library ambience quiet', 20, 300), 'bay_bed': ('backyard ambience', 20, 300),
    'class_bed': ('classroom ambience children', 20, 300), 'cell_bed': ('prison jail ambience', 20, 300),
    'fire_bed': ('fireplace crackling', 20, 300), 'idle': ('garbage truck', 3, 120), 'urn': ('kettle boiling bubbling', 5, 120),
    'arrive': ('air brake', 0.5, 10), 'reverse': ('truck reversing beep', 1, 15), 'lifter': ('hydraulic', 1, 20),
    'bagthud': ('trash bag', 0.2, 5), 'chomp': ('compactor', 1, 30), 'crush': ('plastic crushing crunch', 0.3, 4),
    'stepstreet': ('footsteps concrete', 1, 15), 'run': ('running footsteps concrete', 1, 10), 'land': ('jump landing', 0.2, 3),
    'rustle': ('plastic bag rustle', 0.5, 6), 'bagopen': ('plastic bag', 0.3, 5), 'strain': ('grunt', 0.3, 4),
    'chime': ('bell tree', 1, 8), 'bookpick': ('book handling', 0.3, 8), 'bookdown': ('book table', 0.2, 4),
    'bookdrop': ('book drop', 0.2, 3), 'books': ('books fall', 0.5, 8), 'cabdoor': ('truck door open close', 0.5, 5),
    'crate': ('wooden box drop', 0.2, 4), 'doorbang': ('door slam open bang', 0.3, 4), 'dooropen': ('door open creak', 0.5, 5),
    'glass': ('tea glass clink spoon', 0.3, 5), 'creak': ('wood creak stress', 0.5, 5), 'gasp': ('man gasp surprise', 0.3, 3),
    'yelp': ('yelp', 0.2, 3), 'laugh': ('man laugh short', 0.5, 4), 'kidlaugh': ('child laugh giggle', 0.5, 5),
    'ooh': ('crowd ooh', 0.5, 5), 'thud': ('heavy body fall thud', 0.3, 4), 'woodsteps': ('footsteps wooden floor', 1, 15),
    'chain': ('chain rattle metal', 0.3, 4), 'signcreak': ('swinging sign', 0.5, 8), 'flap': ('flip display', 0.1, 20),
    'cratelift': ('lift box', 0.3, 5), 'van': ('van engine idle', 3, 60), 'lidopen': ('chest open', 0.3, 4),
    'bars': ('jail door', 0.3, 6), 'slide': ('paper slide', 0.2, 3), 'sob': ('man crying sobbing', 1, 10),
    'tissue': ('tissue paper pull', 0.2, 3), 'binlid': ('trash bin lid', 0.3, 4), 'marker': ('marker writing squeak', 0.5, 8),
    'drive': ('truck drive away', 3, 15), 'hydraulic': ('truck hydraulic', 1, 15), 'slam': ('metal door slam', 0.3, 4),
    'harp': ('harp', 1, 6), 'cloth': ('clothes rustle movement', 0.3, 3), 'poof': ('puff', 0.2, 3),
    'pages': ('book page flip', 0.2, 3), 'cellmate': ('man sniff', 0.2, 3),
}
idx = json.loads(Path('fs/index.json').read_text()) if Path('fs/index.json').exists() else {}
def get(key):   # parallel per key; downloads go to .part, then renamed (an interrupted run leaves no truncated mp3)
    q, a, b = Q[key]
    u = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode(dict(query=q, filter=f'license:"Creative Commons 0" duration:[{a} TO {b}]', fields='id,name,username,duration,previews', page_size=3 if key.endswith('_bed') else 4, sort='rating_desc', token=K))
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

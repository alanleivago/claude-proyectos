"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json).
Recipe: pieces/trash-library/sound/fs_fetch.py (its fs/ cache is reused for steps, books-free foley, gasps, laughs, the
hydraulic lifter, chimes, the flip display, paper slide: copied in with --reuse). Usage: python fs_fetch.py [key ...] | --reuse"""
import json, sys, shutil, urllib.parse, urllib.request
from pathlib import Path
Q = {  # key: (query, min s, max s)
    # beds (one per set) + layers
    'arena_bed': ('arena crowd ambience', 20, 300), 'news_bed': ('newsroom office ambience', 20, 300),
    'press_bed': ('printing press machine', 10, 300), 'hq_bed': ('empty office ambience', 20, 300),
    'board_bed': ('conference room tone', 20, 300), 'trade_bed': ('stock exchange', 20, 300),
    'phones_bed': ('office phones ringing ambience', 10, 300), 'hall_bed': ('empty hall ambience', 20, 300),
    # A keynote stage
    'cheer': ('crowd cheering applause', 3, 20), 'applause': ('applause concert', 3, 20), 'flyby': ('whoosh fly by', 0.5, 4),
    'tvon': ('television switch on', 0.3, 6), 'tvoff': ('crt tv turn off', 0.3, 4), 'blip': ('electronic beep device', 0.1, 2),
    'switch': ('light switch', 0.1, 3), 'unfold': ('paper unfold', 0.3, 3), 'tear': ('paper tear', 0.3, 3),
    'clunk': ('heavy metal clunk', 0.2, 3), 'ting': ('triangle', 0.5, 6),
    # C newsroom
    'stamp': ('rubber stamp', 0.1, 3), 'pin': ('thumbtack', 0.1, 4), 'neon': ('neon', 0.5, 10),
    'cash': ('money', 0.3, 6), 'typewriter': ('typewriter typing', 1, 15), 'splat': ('splat', 0.1, 2),
    # B HQ
    'typing': ('keyboard typing', 1, 15), 'vibrate': ('phone vibrate', 0.5, 6), 'chair': ('office chair', 0.3, 6),
    'blinds': ('venetian blinds', 0.5, 8),
    # D boardroom
    'folder': ('book slam table', 0.1, 3), 'glasses': ('glasses clink rattle', 0.3, 4),
    # E trading floor
    'crowdgasp': ('crowd gasp', 0.5, 5), 'mugdrop': ('mug drop floor', 0.2, 3), 'splash': ('water splash', 0.2, 3),
    'beep': ('microwave beep', 0.1, 2), 'ski': ('skiing snow', 1, 10), 'wind': ('wind gust', 1, 6),
    'shatter': ('glass window break', 0.5, 5), 'cart': ('shopping cart', 2, 20), 'cardboard': ('cardboard box', 0.3, 4),
    'carpet': ('footsteps carpet', 1, 10),
    # A' empty stage
    'mop': ('mop floor', 1, 10), 'bucket': ('metal bucket', 0.2, 3), 'leather': ('leather jacket rustle', 0.3, 5),
    'hanger': ('clothes hanger', 0.2, 3), 'bigwhoosh': ('whoosh', 0.8, 3), 'flick': ('light flicker', 0.3, 4), 'paperhandle': ('paper sheet handling', 0.3, 4),
    'clap': ('applause small', 2, 10), 'pop': ('cork pop', 0.1, 1.5), 'banknotes': ('counting banknotes', 0.5, 10), 'fluoro': ('fluorescent light flicker', 1, 10), 'crt': ('crt', 0.3, 5),
    'office_bed': ('busy office ambience', 20, 300), 'hum': ('electrical hum buzz', 2, 20), 'static': ('tv static', 0.5, 5),
    'mop2': ('mopping floor', 2, 30), 'swivel': ('chair swivel creak', 0.3, 5), 'tvbuzz': ('crt tv on', 0.3, 5), 'ukulele': ('ukulele', 1, 8), 'musicbox': ('music box melody', 3, 20), 'trombone': ('sad trombone', 1, 5),
}
# trash-library recordings that fit here (same CC0 ids, same index entries)
REUSE = ['stepstreet', 'woodsteps', 'run', 'land', 'gasp', 'laugh', 'lifter', 'chime', 'harp', 'flap', 'flap2', 'flap4', 'slide2',
         'slide', 'cloth', 'glass', 'crate', 'thud', 'ooh', 'pages', 'slam', 'slam2', 'strain', 'poof', 'yelp', 'doorbang', 'bookdown', 'chime2', 'marker', 'dooropen']
if sys.argv[1:] == ['--reuse']:
    src = Path('../../trash-library/sound/fs'); ti = json.loads((src / 'index.json').read_text()); idx = json.loads(Path('fs/index.json').read_text()) if Path('fs/index.json').exists() else {}
    for k in REUSE:
        for x in ti.get(k, []):
            if (src / Path(x['file']).name).exists(): shutil.copy(src / Path(x['file']).name, 'fs/')
        idx[k] = ti.get(k, [])
    Path('fs/index.json').write_text(json.dumps(idx, indent=1)); print('reused', len(REUSE), 'keys'); sys.exit()
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
idx = json.loads(Path('fs/index.json').read_text()) if Path('fs/index.json').exists() else {}
def get(key):   # parallel per key; downloads go to .part, then renamed (an interrupted run leaves no truncated mp3)
    q, a, b = Q[key]
    u = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode(dict(query=q, filter=f'license:"Creative Commons 0" duration:[{a} TO {b}]', fields='id,name,username,duration,previews', page_size=3 if key.endswith('_bed') else 4, sort='rating_desc', token=K))
    try: r = json.load(urllib.request.urlopen(u, timeout=60))
    except Exception as e: return key, 'ERR ' + type(e).__name__
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

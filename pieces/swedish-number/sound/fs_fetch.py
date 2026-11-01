"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json)."""
import json, os, re, sys, urllib.parse, urllib.request
from pathlib import Path
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {  # key: (query, min s, max s)
    'ring_old': ('old telephone ring bell', 1, 10), 'ring_mobile': ('mobile phone ringing ringtone', 1, 10), 'dial': ('phone keypad dtmf tones', 0.3, 6),
    'chew': ('chewing eating food mouth', 0.5, 6), 'gulp': ('gulp swallow', 0.2, 3), 'moo': ('cow moo', 1, 6), 'snowstep': ('footsteps snow crunch', 1, 8),
    'winter_bed': ('winter wind ambience', 20, 240), 'callcenter_bed': ('call center office ambience phones', 20, 240),
    'cheer': ('small crowd cheer applause', 1, 8), 'partyhorn': ('party horn', 0.3, 3), 'crumple': ('paper crumple ball', 0.3, 3), 'tear': ('paper tear rip', 0.3, 3),
    'bookthud': ('book drop', 0.2, 2), 'switch': ('lever switch', 0.2, 2), 'bin': ('trash can', 0.2, 2),
    'snore': ('snoring man', 1, 8), 'typing': ('keyboard typing office', 1, 8), 'cowbell': ('cowbell', 0.5, 4), 'bonk': ('bonk', 0.2, 2),
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

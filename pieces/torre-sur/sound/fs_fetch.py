"""Freesound CC0 candidates (HQ mp3 previews) per sound key -> fs/<key>_<id>.mp3 + fs/index.json (key in ~/.freesound.json)."""
import json, sys, time, urllib.parse, urllib.request
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
K = json.loads(Path.home().joinpath('.freesound.json').read_text(encoding='utf-8-sig')); K = K.get('api_key') or K.get('key') or K.get('token') or next(iter(K.values()))
Q = {  # key: (query, min s, max s)
 'office': ('office ambience', 20, 400), 'hvac': ('air conditioning hum room tone', 15, 400), 'typing': ('keyboard typing office', 5, 120),
 'phone': ('office phone ringing', 2, 30), 'phone2': ('old telephone ring bell', 2, 30), 'ding2': ('elevator arrival bell', 0.3, 6), 'jet': ('jet airplane flyby', 6, 60), 'explosion': ('big explosion', 2, 15),
 'rattle': ('window glass rattle', 0.5, 8), 'mug': ('ceramic mug break', 0.3, 5), 'screams': ('people screaming panic', 3, 90),
 'panic': ('crowd panic', 4, 120), 'running': ('people running footsteps', 2, 60), 'alarm': ('fire alarm bell', 3, 90),
 'chair': ('office chair', 0.5, 6), 'papers': ('paper rustle', 0.5, 10), 'button': ('elevator button', 0.1, 3),
 'ding': ('elevator ding', 0.3, 5), 'doors': ('elevator doors opening', 1, 10), 'murmur': ('crowd murmur indoor', 10, 300),
 'stairs': ('running down stairs footsteps', 3, 60), 'stairwell': ('stairwell echo footsteps people', 5, 120), 'firedoor': ('metal door slam', 0.3, 5),
 'tick': ('clock ticking', 3, 60), 'hall': ('large hall crowd reverb', 15, 300), 'lift': ('elevator ride interior', 5, 120),
 'sirens': ('distant sirens city', 10, 200), 'boom': ('cinematic boom impact', 2, 12),
 'drone': ('dark ambient drone tension', 20, 300), 'scream': ('screaming', 1, 30), 'shouts': ('people shouting', 2, 60), 'blast': ('explosion distant large', 3, 20),
 'quake': ('building rumble debris', 2, 20), 'hit': ('impact boom', 1, 10), 'lobby': ('lobby crowd walla', 15, 300), 'walla': ('crowd chatter indoor', 15, 300),
}
idx = json.loads(Path('fs/index.json').read_text()) if Path('fs/index.json').exists() else {}
for key in (sys.argv[1:] or Q):
    q, a, b = Q[key]
    u = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode(dict(query=q, filter=f'license:"Creative Commons 0" duration:[{a} TO {b}]', fields='id,name,username,duration,previews,license,url', page_size=3, sort='rating_desc', token=K))
    try: r = json.load(urllib.request.urlopen(u, timeout=60))
    except Exception as e: print(key, 'ERR', e); continue
    idx[key] = []
    for s in r['results']:
        f = f"fs/{key}_{s['id']}.mp3"
        if not Path(f).exists(): urllib.request.urlretrieve(s['previews']['preview-hq-mp3'], f); time.sleep(0.3)
        idx[key].append({'file': f, 'id': s['id'], 'name': s['name'], 'dur': round(s['duration'], 1), 'by': s['username'], 'license': s['license'], 'url': s['url']})
    Path("fs/index.json").write_text(json.dumps(idx, indent=1)); print(key, [(x['id'], x['dur'], x['name'][:30]) for x in idx[key]], flush=True)
Path('fs/index.json').write_text(json.dumps(idx, indent=1))

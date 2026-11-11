# earshot describe + realness on every distinct (file, segment) the cue list uses -> verify.json
import json
from earshot import api
C = json.load(open('cues.json')); seen = {}
for c in C:
    k = (c['file'], c.get('ss', 0), c.get('to'))
    if k in seen or 'men_steps' in c['file'] or 'slide_whoosh' in c['file']: continue
    try: dur = api.measure(c['file'])['duration']
    except Exception: continue
    s = c.get('ss', 0) % max(1, dur - 1); e = min(c.get('to') or s + 8, dur)
    d = api.describe(c['file'], start=s, end=e); r = api.realness(c['file'], start=s, end=e)
    tt = (d.get('top_tags') or [{}])[0]
    seen[k] = dict(name=c['name'], ss=s, tag=tt.get('term'), z=tt.get('z'), p_real=r.get('p_real'), verdict=r.get('verdict'))
    print(json.dumps(seen[k]), flush=True)
json.dump(list(seen.values()), open('verify.json', 'w'), indent=1)

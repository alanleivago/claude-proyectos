"""earshot listening pass: timeline + critique of mix.wav and sfx.wav, realness of every recording used -> earshot_*.json/txt"""
import json, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.stdout.reconfigure(encoding='utf-8')
from earshot import api
cues = json.load(open('cues.json'))
cl = [{'t': c['t'], 'id': c['id']} for c in cues]
json.dump(cl, open('cues_earshot.json', 'w'))
out = {}
for f in ['mix.wav', 'sfx.wav']:
    try: out[f + ':timeline'] = api.timeline(os.path.abspath(f), detail='normal')
    except Exception as e: out[f + ':timeline'] = {'error': repr(e)}
out['mix.wav:critique'] = api.critique(os.path.abspath('mix.wav'))
files = sorted({c['f'] for c in cues if 'f' in c})
out['realness'] = {f: api.realness(os.path.abspath(f) if not f.startswith('F:') else f) for f in files}
json.dump(out, open('earshot_report.json', 'w'), indent=1, default=str)
for k, v in out.items():
    if k == 'realness':
        for f, r in v.items(): print('REAL', f.split('/')[-1], r.get('verdict'), r.get('p_real') if isinstance(r, dict) else r)
    else: print('##', k); print((v.get('summary') or v.get('text') or json.dumps(v, default=str))[:3000] if isinstance(v, dict) else str(v)[:3000])

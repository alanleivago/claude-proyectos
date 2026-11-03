# earshot describe + realness on every downloaded P3 candidate (first 8 s, or a given window) -> screen.json
import json, os, glob
from earshot import api
LIB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sfxlib', 'raw')
out = {}
for f in sorted(glob.glob(LIB + '/*/*.mp3')):
    cat = f.split('/')[-2]
    try:
        d = api.describe(f, start=0, end=8); r = api.realness(f, start=0, end=8)
        out[cat + '/' + os.path.basename(f)] = dict(tags=[(t['term'], round(t['z'], 1)) for t in d.get('top_tags', [])[:3]], aset=[(a['label'], round(a['p'], 2)) for a in d.get('audioset', [])[:3]], p_real=r.get('p_real'), verdict=r.get('verdict'))
    except Exception as e: out[cat + '/' + os.path.basename(f)] = dict(err=str(e)[:80])
    print(cat, os.path.basename(f), json.dumps(out[cat + '/' + os.path.basename(f)]), flush=True)
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'screen.json'), 'w'), indent=1)

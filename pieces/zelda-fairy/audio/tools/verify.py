import json,os
from earshot import api
C=json.load(open('cues.json'));seen={}
for c in [c for c in C if '/zelda-fairy/' in c['file']]:
    k=(c['file'],c.get('ss',0),c.get('to'))
    if k in seen: continue
    end=c.get('to') or c.get('ss',0)+20
    import soundfile as _sf
    try:
        dur=api.measure(c['file'])['duration']
    except Exception: dur=1e9
    if c.get('ss',0)>=dur-0.5: continue
    end=min(end,dur)
    d=api.describe(c['file'],start=c.get('ss',0),end=end)
    r=api.realness(c['file'],start=c.get('ss',0),end=end)
    tt=(d.get('top_tags') or [{}])[0]; aset=(d.get('audioset') or [])[:2]
    seen[k]=dict(name=c['name'],ss=c.get('ss',0),to=c.get('to'),tag=tt.get('term'),z=tt.get('z'),audioset=[(a['label'],round(a['p'],2)) for a in aset],p_real=r.get('p_real'),verdict=r.get('verdict'))
    print(json.dumps(seen[k]),flush=True)
json.dump(list(seen.values()),open('verify.json','w'),indent=1)

import json,os
from earshot import api
C=json.load(open('cues.json'));seen={}
for c in C:
    k=(c['file'],c.get('ss',0),c.get('to'))
    if k in seen: continue
    end=c.get('to') or min(c.get('ss',0)+20, 1e9)
    d=api.describe(c['file'],start=c.get('ss',0),end=end)
    r=api.realness(c['file'],start=c.get('ss',0),end=end)
    tt=d.get('top_tags',[{}])[0]; aset=d.get('audioset',[{}])[:2]
    seen[k]=dict(name=c['name'],ss=c.get('ss',0),to=c.get('to'),tag=tt.get('term'),z=tt.get('z'),audioset=[(a['label'],round(a['p'],2)) for a in aset],p_real=r.get('p_real'),verdict=r.get('verdict'))
    print(json.dumps(seen[k]),flush=True)
json.dump(list(seen.values()),open('verify.json','w'),indent=1)

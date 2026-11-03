import json,glob,re,numpy as np,soundfile as sf
from faster_whisper import WhisperModel
m=WhisperModel('small.en',device='cpu',compute_type='int8')
norm=lambda s:re.sub(r'[^a-z ]','',s.lower().replace('-',' ')).split()
lines=dict(json.load(open('lines.json')))
res={}
for f in sorted(glob.glob('takes/*_s*.wav')):
    id=f.split('/')[-1].rsplit('_s',1)[0]; seed=int(f.rsplit('_s',1)[1][:-4])
    a,sr=sf.read(f); a=a if a.ndim==1 else a.mean(1)
    a16=np.interp(np.arange(0,len(a)/sr,1/16000),np.arange(len(a))/sr,a).astype(np.float32)
    segs,_=m.transcribe(a16,word_timestamps=True,language='en')
    W=[w for s in segs for w in s.words]
    if not W: continue
    got=norm(' '.join(w.word for w in W)); want=norm(lines[id])
    import difflib; match=difflib.SequenceMatcher(None,got,want).ratio()
    pre=a[:max(0,int((W[0].start-0.05)*sr))]
    stray=20*np.log10(np.abs(pre).max()+1e-9) if len(pre) else -99
    fr=a[:len(a)//1024*1024].reshape(-1,1024); db=20*np.log10(np.sqrt((fr**2).mean(1))+1e-9)
    floor=np.percentile(db,10); wps=len(W)/(W[-1].end-W[0].start)
    sc=match*10-max(0,stray+40)*0.1-max(0,floor+60)*0.1-abs(wps-3.2)
    res.setdefault(id,[]).append((round(sc,2),seed,round(match,3),round(stray,1),round(floor,1),round(wps,2),W[0].start,W[-1].end))
pick={}
for id in lines:
    r=sorted(res.get(id,[]),reverse=True); print(id,r)
    if r: pick[id]=r[0][1]
json.dump({k:[x for x in res[k]] for k in res},open('takes/scores.json','w'))
json.dump(pick,open('takes/pick.json','w')); print(pick)

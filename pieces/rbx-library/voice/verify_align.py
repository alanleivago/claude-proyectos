# Whisper word timestamps on voice_final.wav vs words.json starts (sequence-aligned on normalized words).
import json, subprocess, numpy as np, difflib, sys, re
sys.argv=[sys.argv[0]]
from fix import m, num
a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice_final.wav','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
H=[(w.word.strip(),w.start) for s in m.transcribe(a,language='en',beam_size=5,word_timestamps=True,condition_on_previous_text=False)[0] for w in s.words]
W=json.load(open('words.json')); k=lambda x:re.sub(r'[^a-z0-9]','',num(x).lower())
d=[]
for o,i1,i2,j1,j2 in difflib.SequenceMatcher(None,[k(w['word']) for w in W],[k(h[0]) for h in H],autojunk=False).get_opcodes():
    if o=='equal': d+= [(W[i]['word'],W[i]['start'],H[j][1]) for i,j in zip(range(i1,i2),range(j1,j2))]
e=np.array([abs(x[1]-x[2]) for x in d])
print('matched',len(d),'of',len(W),'median |dt|',round(float(np.median(e)),3),'within 0.05s',round(float((e<=0.05).mean())*100,1),'%','max',round(float(e.max()),3))
print('worst',sorted(d,key=lambda x:-abs(x[1]-x[2]))[:8])

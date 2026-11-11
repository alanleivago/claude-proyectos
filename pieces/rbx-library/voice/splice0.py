# Replace the opening sentence of voice_final_v1.wav with open0/open_final.wav (new line, same trim+pitch chain).
# Cut points from 5 ms RMS: old audio kept from 1.620 s (silence before "If"); new opening kept to 2.145 s
# (same -40 dB-to-cut distance as the old one), 10 ms fades at the join. Rest of the audio untouched.
import numpy as np, soundfile as sf, json
o,sr=sf.read('voice_final_v1.wav',dtype='float32'); n,_=sf.read('open0/open_final.wav',dtype='float32')
OC,NC=1.620,2.145; f=int(0.01*sr); r=np.linspace(1,0,f,dtype='float32')
a=n[:int(NC*sr)].copy(); a[-f:]*=r; b=o[int(OC*sr):].copy(); b[:f]*=r[::-1]
sf.write('voice_final.wav',np.concatenate([a,b]),sr,subtype='PCM_16')
d=round(NC-OC,3)
L=open('lines_v1.txt').read().splitlines(); L[0]="In this town, you can't return a library book late."; open('lines.txt','w').write('\n'.join(L)+'\n')
NW=json.load(open('open0/words.json'))
W=json.load(open('words_v1.json')); assert W[6]['word']=='If'
new=[{'word':w['w'],'start':w['s'],'end':w['e']} for w in NW]+[{'word':w['word'],'start':round(w['start']+d,3),'end':round(w['end']+d,3)} for w in W[6:]]
assert [w['word'] for w in new]==open('lines.txt').read().split()
json.dump(new,open('words.json','w'),ensure_ascii=False,indent=1)
R=json.load(open('words_raw_v1.json')); k=next(i for i,w in enumerate(R) if w['w']=='If')
json.dump(NW+[{'w':w['w'],'s':round(w['s']+d,3),'e':round(w['e']+d,3)} for w in R[k:]],open('words_raw.json','w'),ensure_ascii=False,indent=1)
print('delta',d,'dur',len(a)/sr+len(b)/sr)

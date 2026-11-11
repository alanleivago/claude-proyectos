# v3c (take 7) rebuilt with a natural comma gap: tight("In this town,") + no added silence (tails only) + tight("you can't ..."),
# 5 ms fades, then the same trim + pitch + splice into voice_final_v1.wav (old audio kept from 1.620 s).
import os, sys, json, subprocess, numpy as np, soundfile as sf, hashlib
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
a,sr=sf.read('open0/v3/pa.wav',dtype='float32'); b,_=sf.read('open0/v3/pb.wav',dtype='float32')
def tight(y,db=-45):
    h=int(0.005*sr); e=np.array([20*np.log10(np.sqrt((y[i:i+h]**2).mean())+1e-9) for i in range(0,len(y)-h,h)]); v=np.where(e>db)[0]
    return y[max(0,v[0]*h-h):min(len(y),(v[-1]+3)*h)]
ta,tb=tight(a),tight(b)
old=np.concatenate([ta,np.zeros(int(0.12*sr),'float32'),tb,np.zeros(int(0.25*sr),'float32')])
t7,_=sf.read('open0/v3/t7.wav',dtype='float32'); print('pieces are take 7:',len(old)==len(t7) and np.allclose(old,t7,atol=1e-4))
f=int(0.005*sr); r=np.linspace(1,0,f,dtype='float32'); ta=ta.copy(); tb=tb.copy(); ta[-f:]*=r; tb[:f]*=r[::-1]
sf.write('open0/v3/t7_nogap.wav',np.concatenate([ta,tb,np.zeros(int(0.25*sr),'float32')]),sr)
d='open0/v3/c_nogap'; os.makedirs(d,exist_ok=True)
subprocess.run([sys.executable,'../../../styles/cartoon3d/tools/trim_voice.py','open0/v3/t7_nogap.wav',d],capture_output=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',f'{d}/voice.wav','-af','asetrate=48000*2^(4/12),aresample=48000,atempo=1/2^(4/12)',f'{d}/open_final.wav'])
o,sr2=sf.read('voice_final_v1.wav',dtype='float32'); W=json.load(open('words_v1.json')); OC=1.620
n,_=sf.read(f'{d}/open_final.wav',dtype='float32'); NW=json.load(open(f'{d}/words.json'))
h=int(0.005*sr2); t=int(NW[-1]['e']*sr2)
while t+h<len(n) and 20*np.log10(np.sqrt((n[t:t+h]**2).mean())+1e-9)>-40: t+=h
NC=t/sr2+0.01; f=int(0.01*sr2); r=np.linspace(1,0,f,dtype='float32')
x=n[:int(NC*sr2)].copy(); x[-f:]*=r; y=o[int(OC*sr2):].copy(); y[:f]*=r[::-1]
sf.write('voice_final.wav',np.concatenate([x,y]),sr2,subtype='PCM_16')
sf.write('open0/open_final.wav',np.concatenate([x,o[int(OC*sr2):int((next(w['end'] for w in W if w['word']=='hand.')+0.15)*sr2)]]),sr2,subtype='PCM_16')
dl=round(NC-OC,3); S=open('lines.txt').read().split(); assert len(NW)==10, NW
new=[{'word':w,'start':q['s'],'end':q['e']} for w,q in zip(S[:10],NW)]+[{'word':w['word'],'start':round(w['start']+dl,3),'end':round(w['end']+dl,3)} for w in W[6:]]
assert [w['word'] for w in new]==S
json.dump(new,open('words.json','w'),ensure_ascii=False,indent=1)
R=json.load(open('words_raw_v1.json')); k=next(i for i,w in enumerate(R) if w['w']=='If')
json.dump(NW+[{'w':w['w'],'s':round(w['s']+dl,3),'e':round(w['e']+dl,3)} for w in R[k:]],open('words_raw.json','w'),ensure_ascii=False,indent=1)
print('town/you',NW[2],NW[3],'cut',round(NC,3),'delta',dl,'dur',round((len(x)+len(y))/sr2,3))
# measured comma gap (after pitch) by RMS between town, and you
h=int(0.005*sr2); e=[20*np.log10(np.sqrt((n[i:i+h]**2).mean())+1e-9) for i in range(int(NW[2]['s']*sr2),int(NW[3]['e']*sr2),h)]
print('quiet(<-40dB) ms between town/you:',5*sum(1 for v in e if v<-40))

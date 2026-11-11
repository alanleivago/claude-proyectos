# Describe each word-perfect take (length, pitch median/range, end-of-"town," pause, contour), pick the 3 most
# different from each other and from the current take (c0_t2), then trim+pitch+splice each into voice_final_v1.wav
# exactly like splice0.py: old audio kept from 1.620 s; new opening cut 10 ms after its -40 dB decay point.
import os, sys, json, subprocess, numpy as np, soundfile as sf, librosa, itertools
os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..')
ok=[int(l.split()[0]) for l in open('open0/v3/gen.log') if l.strip().endswith('[]')]
def feat(f):
    y,sr=sf.read(f,dtype='float32'); f0,v,_=librosa.pyin(y,fmin=80,fmax=500,sr=sr,hop_length=256)
    st=12*np.log2(f0/np.nanmedian(f0)); idx=np.where(~np.isnan(st))[0]; c=np.interp(np.linspace(idx[0],idx[-1],40),idx,st[idx])
    rms=librosa.feature.rms(y=y,hop_length=240)[0]; db=20*np.log10(rms+1e-9); act=np.where(db>db.max()-35)[0]
    dur=(act[-1]-act[0])*0.01
    return dict(dur=dur,med=float(np.nanmedian(f0)),rng=float(np.nanpercentile(st,95)-np.nanpercentile(st,5)),contour=c,end=float(c[-6:].mean()-c[:6].mean()))
F={'cur':feat('c0_t2.wav')}; F.update({k:feat(f'open0/v3/t{k}.wav') for k in ok})
vec=lambda d:np.concatenate([[d['dur']*8,12*np.log2(d['med']/180)/1.5,d['rng']/3,d['end']/3],d['contour']/4])
V={k:vec(d) for k,d in F.items()}; dist=lambda a,b:float(np.linalg.norm(V[a]-V[b]))
for k,d in F.items(): print(k,f"dur {d['dur']:.2f}s med {d['med']:.0f}Hz range {d['rng']:.1f}st end-slope {d['end']:+.1f}st", f"dist-to-cur {dist(k,'cur'):.2f}" if k!='cur' else '')
best=max(itertools.combinations(ok,3),key=lambda t:min([dist(a,b) for a,b in itertools.combinations(t,2)]+[dist(a,'cur') for a in t]))
print('PICK',best)
o,sr=sf.read('voice_final_v1.wav',dtype='float32'); W=json.load(open('words_v1.json')); OC=1.620; f=int(0.01*sr); r=np.linspace(1,0,f,dtype='float32')
for tag,k in zip('abc',best):
    d=f'open0/v3/{tag}'; os.makedirs(d,exist_ok=True)
    subprocess.run([sys.executable,'../../../styles/cartoon3d/tools/trim_voice.py',f'open0/v3/t{k}.wav',d],capture_output=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'{d}/voice.wav','-af','asetrate=48000*2^(4/12),aresample=48000,atempo=1/2^(4/12)',f'{d}/open_final.wav'])
    n,_=sf.read(f'{d}/open_final.wav',dtype='float32'); NW=json.load(open(f'{d}/words.json'))
    h=int(0.005*sr); t=int(NW[-1]['e']*sr)
    while t+h<len(n) and 20*np.log10(np.sqrt((n[t:t+h]**2).mean())+1e-9)>-40: t+=h
    NC=t/sr+0.01; a=n[:int(NC*sr)].copy(); a[-f:]*=r; b=o[int(OC*sr):].copy(); b[:f]*=r[::-1]
    sf.write(f'voice_final_v3{tag}.wav',np.concatenate([a,b]),sr,subtype='PCM_16')
    sf.write(f'open0/open_v3{tag}.wav',np.concatenate([a,o[int(OC*sr):int((next(w['end'] for w in W if w['word']=='hand.')+0.15)*sr)]]),sr,subtype='PCM_16')  # opening + next line
    dl=round(NC-OC,3); S=open('lines.txt').read().split()
    new=[{'word':w,'start':x['s'],'end':x['e']} for w,x in zip(S[:10],NW)]+[{'word':w['word'],'start':round(w['start']+dl,3),'end':round(w['end']+dl,3)} for w in W[6:]]
    assert len(NW)==10 and [w['word'] for w in new]==S, [x['w'] for x in NW]
    json.dump(new,open(f'words_v3{tag}.json','w'),ensure_ascii=False,indent=1)
    print(tag,'take',k,'cut',round(NC,3),'delta',dl,'dur',round((len(a)+len(b))/sr,2),flush=True)

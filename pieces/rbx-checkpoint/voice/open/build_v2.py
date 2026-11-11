# Builds voice_final_v2{a,b,c}.wav: new opening spliced into c1 (rest untouched), then concat + trim_voice + pitch + words.
import numpy as np, soundfile as sf, subprocess, json, re, difflib, os, sys
P='/Users/alanleiva/claude-proyectos/.venv/bin/python'; TRIM='/Users/alanleiva/claude-proyectos/styles/cartoon3d/tools/trim_voice.py'
SR=24000; cut=json.load(open('open/c1_cut.json'))['cut']
c1,_=sf.read('c1.wav',dtype='float32'); rest=c1[int(cut*SR):]
def ld(f): return sf.read(f,dtype='float32')[0]
def trimq(x,th=0.01):
    i=np.where(np.abs(x)>th)[0]; return x[max(0,i[0]-int(.02*SR)):i[-1]+int(.06*SR)]
gap=lambda s:np.zeros(int(s*SR),np.float32)
V={'a':trimq(ld('open/takes/o_5.wav')),
   'b':np.concatenate([trimq(ld('open/takes/oa_1.wav')),gap(.2),trimq(ld('open/takes/ob_0.wav'))]),
   'c':np.concatenate([trimq(ld('open/takes/oa_0.wav')),gap(.2),trimq(ld('open/takes/ob_1.wav'))])}
S=open('lines.txt').read().split()
n=lambda x:re.sub(r"[^a-z0-9]","",x.lower())
for v,op in V.items():
    d=f'open/v2{v}'; os.makedirs(d,exist_ok=True)
    sf.write(f'{d}/c1.wav',np.concatenate([op,gap(.2),rest]),SR)
    L=[]
    for c in ['c1','c2','c3','c4','c5','c6','c7','c8','c9a','c9b','c10']:
        L.append(f"file '{os.path.abspath(d+'/c1.wav') if c=='c1' else os.path.abspath(c+'.wav')}'")
        if c!='c10': L.append(f"file '{os.path.abspath('s.wav')}'")
    open(f'{d}/list.txt','w').write('\n'.join(L)+'\n')
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'{d}/list.txt','-c','copy',f'{d}/voice_raw.wav'],check=True)
    subprocess.run([P,TRIM,f'{d}/voice_raw.wav',d],check=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'{d}/voice.wav','-af','asetrate=48000*2^(4/12),aresample=48000,atempo=1/2^(4/12)',f'voice_final_v2{v}.wav'],check=True)
    W=json.load(open(f'{d}/words.json'))
    json.dump([{'word':w['w'],'start':w['s'],'end':w['e']} for w in W],open(f'{d}/words_raw.json','w'),indent=1)
    a=[n(x) for x in S]; b=[n(w['w']) for w in W]; out=[]
    for o,i1,i2,j1,j2 in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes():
        if o=='equal':
            out+= [{'word':S[i],'start':W[j]['s'],'end':W[j]['e']} for i,j in zip(range(i1,i2),range(j1,j2))]; continue
        print(v,'fix',o,S[i1:i2],[w['w'] for w in W[j1:j2]])
        if i2==i1: continue
        s,e=(W[j1]['s'],W[j2-1]['e']) if j2>j1 else (out[-1]['end'],)*2
        k=i2-i1
        out+=[{'word':S[i],'start':round(s+(e-s)*q/k,3),'end':round(s+(e-s)*(q+1)/k,3)} for q,i in enumerate(range(i1,i2))]
    assert [o['word'] for o in out]==S
    json.dump(out,open(f'words_v2{v}.json','w'),ensure_ascii=False,indent=1)
    rich=next(o for o in out if o['word']=='Rich')['start']
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'voice_final_v2{v}.wav','-t',str(rich-0.05),'-af','afade=t=out:st=%.3f:d=0.05'%(rich-0.1),f'open/open_v2{v}.wav'],check=True)
    print(v,'final',sf.info(f'voice_final_v2{v}.wav').duration,'opening',round(rich-0.05,2),flush=True)

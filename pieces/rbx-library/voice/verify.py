# Final check of voice_final.wav against the script: full transcript diff + per-sentence windows (from words.json).
import json, subprocess, numpy as np, difflib, sys
sys.argv=[sys.argv[0]]
from fix import m, n, num
a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice_final.wav','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
T=lambda x:' '.join(s.text for s in m.transcribe(x,language='en',beam_size=5,condition_on_previous_text=False)[0])
def d(ref,hyp):
    A=n(num(ref)); B=n(num(hyp))
    return [(o,' '.join(A[i1:i2]),' '.join(B[j1:j2])) for o,i1,i2,j1,j2 in difflib.SequenceMatcher(None,A,B,autojunk=False).get_opcodes() if o!='equal']
full=d(open('lines.txt').read(),T(a)); print('FULL', len(full), full, flush=True)
W=json.load(open('words.json')); S=[]; cur=[]
for w in W:
    cur.append(w)
    if w['word'].rstrip('"\'')[-1:] in '.?!': S.append(cur); cur=[]
if cur: S.append(cur)
bad=0
for s in S:
    x=a[max(0,int((s[0]['start']-0.15)*16000)):int((s[-1]['end']+0.2)*16000)]
    ref=' '.join(w['word'] for w in s); e=d(ref,T(x))
    if e: bad+=1; print(f"{s[0]['start']:.2f}", ref, '->', e, flush=True)
print('sentences',len(S),'with diffs',bad)

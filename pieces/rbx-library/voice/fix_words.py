# words_raw.json (trim_voice {w,s,e}) -> words.json {word,start,end} with exactly the script tokens of lines.txt.
# Both sides are expanded to normalized sub-words (numbers spelled out), aligned, and each script token takes the
# span of its matched sub-words; tokens Whisper missed are spread over the gap between neighbours.
import json, re, difflib, sys
sys.argv=[sys.argv[0]]
from fix import num   # loads whisper model too; cheap enough
S=open('lines.txt').read().split(); R=json.load(open('words_raw.json'))
n=lambda s:[re.sub(r"[^a-z0-9]","",x.lower()) for x in num(s).split() if re.sub(r"[^a-z0-9]","",x.lower())]
A=[(t,i) for i,w in enumerate(S) for t in n(w)]
B=[]
for w in R:
    sub=n(w['w']); k=max(len(sub),1)
    for q,t in enumerate(sub): B.append((t,w['s']+(w['e']-w['s'])*q/k,w['s']+(w['e']-w['s'])*(q+1)/k))
span=[[None,None] for _ in S]
for o,i1,i2,j1,j2 in difflib.SequenceMatcher(None,[a[0] for a in A],[b[0] for b in B],autojunk=False).get_opcodes():
    if o=='equal' or (o=='replace' and i2-i1==j2-j1):
        pairs=zip(range(i1,i2),range(j1,j2))
    elif o=='replace':
        pairs=[(i,j1+int((i-i1)*(j2-j1)/(i2-i1))) for i in range(i1,i2)]
        print('replace',[a[0] for a in A[i1:i2]],'<-',[b[0] for b in B[j1:j2]])
    else:
        if o=='delete': print('missed by whisper:',[S[A[i][1]] for i in range(i1,i2)])
        else: print('extra in whisper:',[b[0] for b in B[j1:j2]])
        continue
    for i,j in pairs:
        si=A[i][1]; s,e=B[j][1],B[j][2]
        span[si][0]=s if span[si][0] is None else min(span[si][0],s); span[si][1]=e if span[si][1] is None else max(span[si][1],e)
i=0
while i<len(S):
    if span[i][0] is None:
        j=i
        while j<len(S) and span[j][0] is None: j+=1
        t0=span[i-1][1] if i else 0.0; t1=span[j][0] if j<len(S) else t0+0.3*(j-i); k=j-i
        for q in range(k): span[i+q]=[t0+(t1-t0)*q/k,t0+(t1-t0)*(q+1)/k]
        print('interpolated:',S[i:j]); i=j
    else: i+=1
out=[{'word':w,'start':round(s,3),'end':round(e,3)} for w,(s,e) in zip(S,span)]
json.dump(out,open('words.json','w'),ensure_ascii=False,indent=1); print('words',len(out))

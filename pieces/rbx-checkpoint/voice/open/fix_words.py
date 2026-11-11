# Rebuild words_v2{a,b,c}.json from each pass's words_raw.json, aligned to the script.
# Words Whisper skipped in a pass take v1 times mapped linearly between the neighbouring matched words.
# Hand fix (all versions): Whisper gives "down." zero length before "Turbo" -> split the span 40/60.
import json, re, difflib
S=open('lines.txt').read().split(); V1=json.load(open('words_v1.json'))
n=lambda x:re.sub(r"[^a-z0-9]","",x.lower())
def downfix(W):
    for i,w in enumerate(W):
        if w['word']=='down.' and W[i+1]['word']=='Turbo' and w['end']-w['start']<0.05:
            s,e=w['start'],W[i+1]['end']; m=round(s+0.4*(e-s),3)
            w['end']=m; W[i+1]['start']=m
    return W
json.dump(downfix(V1),open('words_v1.json','w'),ensure_ascii=False,indent=1)
json.dump(V1,open('words.json','w'),ensure_ascii=False,indent=1)
for v in 'abc':
    R=json.load(open(f'open/v2{v}/words_raw.json'))
    a=[n(x) for x in S]; b=[n(w['word']) for w in R]; out=[None]*len(S)
    ops=difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes()
    for o,i1,i2,j1,j2 in ops:
        if o=='equal' or (o=='replace' and i2-i1==j2-j1):
            for i,j in zip(range(i1,i2),range(j1,j2)): out[i]={'word':S[i],'start':R[j]['start'],'end':R[j]['end']}
        elif o=='replace':  # e.g. "Three hundred" <- "300": spread over the heard span
            s,e,k=R[j1]['start'],R[j2-1]['end'],i2-i1
            for q,i in enumerate(range(i1,i2)): out[i]={'word':S[i],'start':round(s+(e-s)*q/k,3),'end':round(s+(e-s)*(q+1)/k,3)}
    for o,i1,i2,j1,j2 in ops:
        if o=='delete':
            p,q=i1-1,i2; x0,x1=V1[p]['end'],V1[q]['start']; y0,y1=out[p]['end'],out[q]['start']
            f=lambda t:round(y0+(t-x0)*(y1-y0)/max(x1-x0,1e-3),3)
            for i in range(i1,i2): out[i]={'word':S[i],'start':f(V1[i]['start']),'end':f(V1[i]['end'])}
            print(v,'skipped by whisper, mapped from v1:',[(w['word'],w['start'],w['end']) for w in out[i1:i2]])
    assert all(out) and [w['word'] for w in out]==S
    json.dump(downfix(out),open(f'words_v2{v}.json','w'),ensure_ascii=False,indent=1)

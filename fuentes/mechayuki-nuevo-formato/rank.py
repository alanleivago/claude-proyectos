import json,re,sys
sys.stdout.reconfigure(encoding='utf-8')
d=json.load(open(sys.argv[1],encoding='utf-8'))
items=d['items'] if isinstance(d,dict) else d
minv=int(sys.argv[2]) if len(sys.argv)>2 else 400000
def g(it,k):
    if k in it: return it[k]
    a,b=k.split('.'); v=it.get(a); return v.get(b) if isinstance(v,dict) else None
rows=[]
for it in items:
    p=it.get('playCount') or 0; fans=g(it,'authorMeta.fans') or 0; vid=g(it,'authorMeta.video') or 1; heart=g(it,'authorMeta.heart') or 0
    avgl=heart/max(vid,1); dig=it.get('diggCount') or 0
    rows.append((p, p/max(fans,1), dig/max(avgl,1), it.get('searchQuery'), g(it,'authorMeta.name'), fans, vid, g(it,'videoMeta.duration'), (it.get('createTimeISO') or '')[:10], it.get('webVideoUrl'), re.sub(r'\s+',' ',(it.get('text') or ''))[:100]))
rows.sort(key=lambda r:-r[0])
for r in rows:
    if r[0]<minv: continue
    print(f"{r[0]/1e6:.1f}M v/f={r[1]:.1f} lk/avg={r[2]:.1f} [{r[3]}] @{r[4]} fans={r[5]} vids={r[6]} {r[7]}s {r[8]} | {r[10]}")

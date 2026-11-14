import re,sys,pathlib
p=pathlib.Path(sys.argv[1]); thr=float(sys.argv[2]) if len(sys.argv)>2 else 6
t=None; rows=[]
for l in p.read_text().splitlines():
    m=re.search(r"pts_time:([\d.]+)",l)
    if m: t=float(m.group(1))
    m=re.search(r"lavfi.scd.score=([\d.]+)",l)
    if m and t is not None: rows.append((t,float(m.group(1))))
# local maxima above thr, min gap 0.2s
cuts=[]
for i,(t,s) in enumerate(rows):
    if s>=thr and s==max(x[1] for x in rows[max(0,i-3):i+4]):
        if not cuts or t-cuts[-1]>0.2: cuts.append(t)
print(" ".join(f"{c:.2f}" for c in cuts))

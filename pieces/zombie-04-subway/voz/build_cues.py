# v4: tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, R2: palabras de la regla 2, END}. Lo leen film.js, sets/subway.js y mix4.py.
# python build_cues.py  (despues de prep.py + assemble.py + fix_caps.py)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-04-subway/engine"; V = r"F:/Claude Proyectos/pieces/zombie-04-subway/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9:%']", "", s.lower().replace("’", "'"))
def words(line): return [w for w in WD if w[3] == line]
def find(line, w, nth=0, after=0.0):
    hits = [x for x in words(line) if nrm(x[0]) == nrm(w) and x[1] >= after]
    if len(hits) <= nth: raise SystemExit(f"no encuentro '{w}' (#{nth}) en la linea {line}: {[x[0] for x in words(line)]}")
    return round(hits[nth][1], 3)
part = lambda line, j: LN[line - 1][1][j]
W = dict(train0=find(1, "train"), locks=find(1, "locks"), phone=find(2, "phone"), signal=find(2, "signal"), pct=find(2, "3%"), time=find(2, "11:42"),
         next=find(2, "next"), five=find(2, "5:30"), sheet=find(3, "sheet"), night=find(3, "night"), rule1=find(3, "rule"), never=find(3, "never"),
         empty=find(3, "empty"), rule2=find(4, "rule"), torn=find(4, "torn"), ifw=find(4, "if"), dont=find(4, "don't"), ends=find(4, "ends"),
         laugh=find(5, "laugh"), prank=find(5, "pranking"), eleven=part(6, 0), clock=find(6, "clock"), midnight=find(6, "midnight"), every=part(6, 1),
         out=find(6, "out"), train=part(7, 0), headlights=find(7, "headlights"), sound=find(7, "sound"), doors=find(7, "doors"), open=find(7, "open"),
         empty2=find(7, "empty"), steps=find(8, "footsteps"), something=find(8, "something"), breathing=find(8, "breathing"), neck=find(8, "neck"),
         fudge=part(9, 0), closing=find(10, "closing"), so=part(11, 0), geton=find(11, "get"), stay=find(11, "stay"), comment=part(12, 0),
         one=find(12, "one"), two=find(12, "two"), most=find(12, "most"))
vend = max(w[2] for w in WD)
R2 = [[w[0].upper(), round(w[1], 3)] for w in words(4) if w[1] >= W["ifw"] - 0.01 and w[1] <= W["dont"] + 0.01]
R2 = [[("DON'T—" if nrm(a) == "don't" else a), t] for a, t in R2]; R2 = [[a + ("," if a == "YOU" and i == len(R2) - 2 else ""), t] for i, (a, t) in enumerate(R2)]
T = dict(plat=0.0, gate=part(1, 1), phone=part(2, 0), board=part(2, 1), booth=part(3, 0), file=W["night"], laugh=part(5, 0), clock=part(6, 0),
         dark=W["every"], train=part(7, 0), doors=round(W["doors"] - 0.06, 3), steps=part(8, 0), eyes=W["something"], neck=part(8, 1), fudge=part(9, 0),
         close=part(10, 0), choice=part(11, 0), end=round(vend + 1.95, 3))   # v5/v6: menu mas largo
T["follow"] = round(T["end"] + 0.6, 3)
out = dict(W=W, T=T, R2=R2, END=round(T["end"] + 6.4, 2), VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "| cortes", {k: round(v, 2) for k, v in T.items()}); print("R2", R2)

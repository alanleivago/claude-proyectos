# ep5: tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END}. Lo leen film.js, sets/pt.js y el mix. python build_cues.py (tras prep.py + assemble.py)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-05-pt/engine"; V = r"F:/Claude Proyectos/pieces/zombie-05-pt/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'"))
def find(line, w, nth=0):
    hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
    if len(hits) <= nth: raise SystemExit(f"no encuentro '{w}' (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
    return round(hits[nth][1], 3)
part = lambda line, j: LN[line - 1][1][j]
W = dict(pt=find(1, "pt"), ghost=find(1, "ghost"), behind1=find(1, "behind"), nobody=find(2, "nobody"), five=find(2, "five"), years=find(2, "years"),
         hallway=find(3, "hallway"), door=find(3, "door"), back3=find(3, "back"), loop=find(3, "loop"), weirder=find(3, "weirder"),
         breathing=find(4, "breathing"), turn=find(4, "turn"), nothing=find(4, "nothing"), modder=find(5, "modder"), camera=find(5, "camera"),
         see=find(5, "see"), player=find(5, "player"), was=find(6, "was"), lisa=find(6, "lisa"), stuck=find(6, "stuck"), flashlight=find(6, "flashlight"),
         step=find(6, "step"), turned=find(7, "turned"), hide=find(7, "hide"), face=find(7, "face"), back7=find(7, "back"), trick=find(8, "trick"),
         front=find(8, "front"), phone=find(8, "phone"), second=find(8, "second"), screen=find(8, "screen"), breath=find(9, "breath"), neck=find(9, "neck"),
         fudge=part(10, 0), feeling=find(11, "feeling"), real=find(11, "real"), send=find(12, "send"), night=find(12, "night"), never=find(12, "never"),
         looks=find(12, "looks"))
vend = max(w[2] for w in WD)
T = dict(hall=0.0, file=part(2, 0), loop=part(3, 0), turn=part(4, 0), crt=part(5, 0), reveal=part(6, 0), hid=part(7, 0), selfie=part(8, 0),
         lean=part(9, 0), fudge=part(10, 0), crane=part(11, 0), send=part(12, 0), end=round(vend + 0.35, 3))
out = dict(W=W, T=T, END=round(T["end"] + 3.85, 2), VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "| cortes", {k: round(v, 2) for k, v in T.items()})

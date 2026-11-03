# ep6: tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END}. Lo leen film.js, sets/pt.js y el mix. python build_cues.py (tras prep.py + assemble.py)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-06-floor30/engine"; V = r"F:/Claude Proyectos/pieces/zombie-06-floor30/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'"))
def find(line, w, nth=0):
    hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
    if len(hits) <= nth: raise SystemExit(f"no encuentro '{w}' (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
    return round(hits[nth][1], 3)
part = lambda line, j: LN[line - 1][1][j]
def anyw(line, *ws, nth=0):   # la primera forma que aparezca (whisper puede escribir 3011 / thirty-eleven / 40 / forty)
    for w in ws:
        try: return find(line, w, nth)
        except SystemExit: pass
    raise SystemExit(f"no encuentro {ws} en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
W = dict(thirtieth=anyw(1, "thirtieth", "30th"), worst=find(1, "worst"), tonight=find(1, "tonight"),
         phone=find(2, "phone"), once=find(2, "once"),
         water=find(3, "water"), pumps=find(3, "pumps"), electricity=find(3, "electricity"), tub=find(3, "tub"), bucket=find(3, "bucket"),
         pressure=find(3, "pressure"), forty=anyw(3, "forty", "40"), gallons=find(3, "gallons"),
         counts=find(4, "counts"), food=find(4, "food"), splits=find(4, "splits"), days4=find(4, "days"),
         seven=anyw(5, "seven", "7"), dark=find(5, "dark"), block=find(5, "block"), building=find(5, "building"), fridge=find(5, "fridge"), dies=find(5, "dies"),
         faucet=find(6, "faucet"), nothing=find(6, "nothing"), power=find(6, "power"), thirty=anyw(6, "thirty", "30"), floors=find(6, "floors"),
         fema=anyw(7, "fema", "femur"), gallon=find(7, "gallon"), forty7=anyw(7, "forty", "40"), days7=find(7, "days"), phone7=anyw(7, "phone's", "phones", "phone"),
         eighteen=anyw(7, "eighteen", "18"), percent=anyw(7, "percent", "18%"),
         pushes=find(8, "pushes"), dresser=find(8, "dresser"), door8=find(8, "door"),
         midnight=find(9, "midnight"), footsteps=find(9, "footsteps"), freezes=find(9, "freezes"), stop=find(9, "stop"),
         peephole=find(10, "peephole"), guy=find(10, "guy"), eleven=anyw(10, "thirty-eleven", "3011", "eleven"), staring=find(10, "staring"),
         fudge=part(11, 0), open=find(12, "open"), quiet=find(12, "quiet"), comment=find(12, "comment"), one=anyw(12, "one", "1"),
         two=anyw(12, "two", "2"), most=find(12, "most"), part2=find(12, "part"))
vend = max(w[2] for w in WD)
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)   # fin de la linea
T = dict(crane=0.0, door=part(2, 0) - 0.15, alert=round(W["phone"] - 0.1, 3), water=part(3, 0), item=part(4, 0), city=part(5, 0),
         fridge=round(W["building"] - 0.1, 3), tap=part(6, 0), note=part(7, 0), barricade=part(8, 0), steps=part(9, 0), peep=part(10, 0),
         fudge=part(11, 0), choice=part(12, 0), end=round(vend + 0.35, 3))
W["knock"] = round(LE(10) + 0.15, 3)   # golpes del vecino tras "staring right at it"
out = dict(W=W, T=T, END=round(max(vend + 4.0, 62.0), 2), VOICE_END=round(vend, 3))   # usuario: minimo 61 s, objetivo ~62; el menu final queda vivo hasta el final
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "| cortes", {k: round(v, 2) for k, v in T.items()})

# ep7 "The Safe Room": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END}. Lo leen film.js, sets/saferoom.js y el mix. python build_cues.py (tras prep + assemble + fix_words)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-07-saferoom/engine"; V = r"F:/Claude Proyectos/pieces/zombie-07-saferoom/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'"))
def find(line, w, nth=0):
    hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
    if len(hits) <= nth: raise SystemExit(f"no encuentro '{w}' (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
    return round(hits[nth][1], 3)
def anyw(line, *ws, nth=0):   # la primera forma que aparezca (whisper puede escribir 3 / three, fema's / femas)
    for w in ws:
        try: return find(line, w, nth)
        except SystemExit: pass
    raise SystemExit(f"no encuentro {ws} en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)   # fin de la linea
W = dict(house=find(1, "house"), one=find(1, "one"), room1=find(1, "room"),
         living=find(2, "living"), biggest=find(2, "biggest"), three2=anyw(2, "three", "3"), windows2=find(2, "windows"), two2=anyw(2, "two", "2"), doors2=find(2, "doors"),
         window3=find(3, "window"), door3=find(3, "door"), them3=find(3, "them"),
         small=find(4, "small"), onedoor=find(4, "door"), nowin=find(4, "windows"), middle=find(4, "middle"), bathroom=find(4, "bathroom"), closet=find(4, "closet"),
         ready=find(4, "ready"), inside=find(4, "inside"), few=find(4, "few"), possible=find(4, "possible"),
         fix=find(5, "fix"), lasttime=find(5, "last"), drive=find(5, "drive"), inch=anyw(5, "three", "3"), screws=find(5, "screws"), stud=find(5, "stud"),
         wedge=find(5, "wedge"), bar=find(5, "bar"), handle=find(5, "handle"), already=find(5, "already"), know=find(5, "know"),
         item=find(6, "item"), box=find(6, "box"), water=find(6, "water"), food=find(6, "food"), flashlight=find(6, "flashlight"), batteries=find(6, "batteries"),
         radio=find(6, "radio"), charger=find(6, "charger"), chest=find(6, "chest"), fema=anyw(6, "fema's", "femas", "fema"), list6=find(6, "list"),
         packing=find(7, "packing"), cut=find(7, "cut"), hand=find(7, "hand"), nail=find(7, "nail"), barricade=find(7, "barricade"), bleeding=find(7, "bleeding"),
         spray=find(7, "spray"), bandage=find(7, "bandage"), press=find(7, "press"), hard=find(7, "hard"), fifteen=anyw(7, "fifteen", "15"), minutes=find(7, "minutes"), peeking=find(7, "peeking"),
         day=find(8, "day"), save=find(8, "save"), game=find(8, "game"), congrats=find(8, "congratulations"), safe=find(8, "safe"), room8=find(8, "room"),
         fudge=part(9, 0), stairs=find(10, "stairs"), week=find(10, "week"))
vend = max(w[2] for w in WD)
W["heal"] = round(LE(7) + 0.15, 3)                       # HUD -> FINE con el sonido de curacion
W["knock"] = round(LE(8) + 0.45, 3)                      # golpes dentro del armario (del bano)
W["crane_hits"] = [round(0.5 + k * 1.667 + d, 3) for k in range(4) for d in (0.0, 0.53) if 0.5 + k * 1.667 + d < part(2, 0) - 0.3]   # golpes de los zombis en la puerta de entrada (thin-zombie attack2: impactos a 0.30 y 0.83 s del clip, bucle 1.667 s)
W["knocks"] = [round(W["knock"] + d, 3) for d in (0.0, 0.32, 0.62, 1.35, 1.62)]
T = {"01_crane": 0.0, "02_living": round(part(2, 0) - 0.1, 3), "03_window": round(part(3, 0) - 0.1, 3), "03_died": round(LE(3) + 0.3, 3),
     "04_plan": round(part(4, 0) - 0.1, 3), "04_bath": round(W["ready"] - 0.12, 3),
     "05_door": round(part(5, 0) - 0.1, 3), "05_screw": round(W["drive"] - 0.08, 3), "05_bar": round(W["wedge"] - 0.12, 3), "05_know": round(W["already"] - 0.12, 3),
     "06_item": round(part(6, 0) - 0.1, 3),
     "07_pack": round(part(7, 0) - 0.1, 3), "07_spray": round(part(7, 1) - 0.1, 3), "07_examine": round(W["press"] - 0.1, 3),
     "08_save": round(part(8, 0) - 0.1, 3), "08_congrats": round(part(8, 1) - 0.1, 3), "09_knock": round(LE(8) + 0.3, 3), "09_fudge": round(part(9, 0) - 0.1, 3),
     "10_end": round(part(10, 0) - 0.25, 3)}
out = dict(W=W, T=T, END=round(max(vend + 4.0, 62.0), 2), VOICE_END=round(vend, 3))   # usuario: minimo 61 s, objetivo ~62
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "| cortes", {k: round(v, 2) for k, v in T.items()})

# ep10 "The Stairs": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END, VOICE_END}. Lo leen film.js, sets/*.js y el mix. python build_cues.py (tras prep + assemble + fix_words + fix_caps)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-10-stairs/engine"; V = r"F:/Claude Proyectos/pieces/zombie-10-stairs/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'"))
def find(line, *ws, nth=0):
    for w in ws:
        hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
        if len(hits) > nth: return round(hits[nth][1], 3)
    raise SystemExit(f"no encuentro {ws} (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)
W = dict(safe1=find(1, "safe"), forever=find(1, "forever"), up1=find(1, "up"),
         down=find(2, "downstairs"), two=find(2, "two", "2"), doors=find(2, "doors"), five=find(2, "five", "5"), windows=find(2, "windows"), guard=find(2, "guard"),
         gives=find(3, "gives"), pour=find(3, "pour"), late=find(3, "late"), stairs3=find(3, "stairs"),
         world=find(4, "world"), terrible=find(4, "terrible"), stairs4=find(4, "stairs"), staircase=find(4, "staircase"), wall=find(4, "wall"), one4=find(4, "one", "1"), climb=find(4, "climb"),
         bottom=find(5, "bottom"), tip=find(5, "tip"), sofa=find(5, "sofa"), dresser=find(5, "dresser"), screw5=find(5, "screw"), three=find(5, "three", "3", "3-inch", "three-inch"), screws=find(5, "screws"), know=find(5, "already"),
         top=find(6, "top"), screw6=find(6, "screw"), edge=find(6, "edge"), push6=find(6, "push"), shelf=find(6, "shelf"),
         trap=find(7, "trap"), exit=find(7, "exit"), window7=find(7, "window"), escape=find(7, "escape"), ladder=find(7, "ladder"), fire=find(7, "fire"), ways=find(7, "ways"),
         water=find(8, "water"), backpack=find(8, "backpack"), radio=find(8, "radio"), spray=find(8, "first"), day=find(8, "day"), save=find(8, "save"),
         knocks9=find(9, "knocks"), zombies9=find(9, "zombies"), knock9=find(9, "knock"),
         hello=part(10, 0), please=part(10, 1), bitten=find(10, "bitten"),
         should=find(11, "should"), let11=find(11, "let"), quiet11=find(11, "quiet"), comment=find(11, "comment"))
vend = max(w[2] for w in WD)
T = {"01_crane": 0.0, "02_down": round(part(2, 0) - 0.1, 3), "03_door": round(part(3, 0) - 0.1, 3), "03b_late": round(part(3, 1) - 0.1, 3), "03_died": round(LE(3) + 0.25, 3),
     "04_rule": round(part(4, 0) - 0.1, 3), "04b_map": round(part(4, 1) - 0.1, 3),
     "05_block": round(part(5, 0) - 0.1, 3), "05_drill": round(part(5, 1) - 0.1, 3), "05_screw": round(W["three"] - 0.15, 3), "05_know": round(W["know"] - 0.35, 3),
     "06_top": round(part(6, 0) - 0.1, 3), "06b_shelf": round(W["push6"] - 0.15, 3),
     "07_ladder": round(part(7, 0) - 0.1, 3), "07b_out": round(find(7, "with") - 0.1, 3), "07_item": round(part(7, 1) - 0.1, 3),
     "08_carry": round(part(8, 0) - 0.1, 3), "08_save": round(part(8, 1) - 0.1, 3),
     "09_knock": round(part(9, 0) - 0.35, 3), "09b_ava": round(W["zombies9"] - 0.1, 3), "09c_door": round(part(10, 0) - 0.1, 3), "09d_look": round(part(10, 1) - 0.1, 3),
     "10_choice": round(part(11, 0) - 0.1, 3)}
W["crane_hits"] = [round(x, 3) for x in (0.25, 0.85, 1.5, 2.2, 2.9, 3.6)]                 # golpes de los zombis en la puerta de entrada (abrir)
W["knock_hits"] = [round(W["knocks9"] + d, 3) for d in (-0.28, -0.04, 0.2)] + [round(part(10, 0) - 0.55 + d, 3) for d in (0.0, 0.22)]   # golpes de nudillos (persona), no golpes de zombi
W["knock_end"] = [round(T["10_choice"] + d, 3) for d in (2.2, 2.42)]
out = dict(W=W, T=T, END=round(max(vend + 2.6, 62.0), 2), VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "VOICE_END", round(vend, 2)); print({k: round(v, 2) for k, v in T.items()})

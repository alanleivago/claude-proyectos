# ep9 "The Last Train, Part 2": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, R2: palabras de la regla 2, END}. Lo leen film.js, sets/subway2.js y el mix. python build_cues.py (tras prep + assemble + fix_words)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-09-subway2/engine"; V = r"F:/Claude Proyectos/pieces/zombie-09-subway2/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'"))
def find(line, w, nth=0):
    hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
    if len(hits) <= nth: raise SystemExit(f"no encuentro '{w}' (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
    return round(hits[nth][1], 3)
def anyw(line, *ws, nth=0):
    for w in ws:
        try: return find(line, w, nth)
        except SystemExit: pass
    raise SystemExit(f"no encuentro {ws} en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)
W = dict(choose=find(1, "choose"), geton=find(1, "get"), stay=find(1, "stay"),
         stay2=find(2, "stay"), doors2=find(2, "doors"), close2=find(2, "close"), leaves=find(2, "leaves"), floor=find(2, "floor"), rest=find(2, "rest"),
         rule2=find(2, "rule"), ifw=find(2, "if"), steps2=find(2, "footsteps"), dont=anyw(2, "don't", "dont"), turn2=find(2, "turn"), around2=find(2, "around"),
         steps3=find(3, "footsteps"), turn3=find(3, "turn"), around3=find(3, "around"), eyes=find(3, "eyes"), dark3=find(3, "dark"), smile=find(3, "smile"), wide=find(3, "wide"),
         run=find(4, "run"), exit=find(4, "exit"), gate=find(4, "gate"), locked=find(4, "locked"),
         fudge=part(5, 0), rewind=find(6, "rewind"),
         geton7=find(7, "get"), doors7=find(7, "doors"), shut=find(7, "shut"), face7=find(7, "face"), bangs=find(7, "bangs"), glass=find(7, "glass"), inside=find(7, "inside"), breathe=find(7, "breathe"),
         speeds=find(8, "speeds"), switches=find(8, "switches"), tracks=find(8, "tracks"), stops=find(8, "stops"), tunnel=find(8, "tunnel"), lights=find(8, "lights"), out8=find(8, "out"),
         screen=find(9, "screen"), welcome=find(9, "welcome"), laststop=find(9, "stop"), minute=find(9, "minute"), red=find(9, "red"), leave9=find(9, "leave"), white=find(9, "white"), stay9=find(9, "stay"), board=find(9, "board"),
         open10=find(10, "open"), darkness=find(10, "darkness"), five=anyw(10, "five", "5"), left10=find(10, "left"), something=find(10, "something"), breathing=find(10, "breathing"),
         what=find(11, "what"), leave11=find(11, "leave"), stay11=find(11, "stay"), comment=find(11, "comment"), one=anyw(11, "one", "1"), two=anyw(11, "two", "2"))
vend = max(w[2] for w in WD)
R2 = [[w[0].upper(), round(w[1], 3)] for w in WD if w[3] == 2 and W["ifw"] - 0.01 <= w[1] <= W["around2"] + 0.01]
R2 = [[a.replace("YOU", "YOU,") if i == len(R2) - 4 else a, t] for i, (a, t) in enumerate(R2)]
R2 = [[a + ("." if i == len(R2) - 1 else ""), t] for i, (a, t) in enumerate(R2)]
T = {"01_hook": 0.0, "02_stay": round(part(2, 0) - 0.1, 3), "02b_floor": round(part(2, 1) - 0.1, 3), "02c_file": round(W["rule2"] - 0.1, 3),
     "03_turn": round(part(3, 0) - 0.1, 3), "03b_eyes": round(part(3, 1) - 0.1, 3), "03c_smile": round(part(3, 2) - 0.1, 3),
     "04_run": round(part(4, 0) - 0.1, 3), "04b_fudge": round(part(5, 0) - 0.1, 3), "04c_died": round(LE(5) + 0.2, 3),
     "05_rewind": round(part(6, 0) - 0.55, 3),
     "06_geton": round(part(7, 0) - 0.1, 3), "06b_shut": round(W["doors7"] - 0.1, 3), "06c_breathe": round(part(7, 1) - 0.1, 3),
     "07_speed": round(part(8, 0) - 0.1, 3), "07b_tunnel": round(W["stops"] - 0.1, 3), "07c_dark": round(part(8, 1) - 0.1, 3),
     "08_screen": round(part(9, 0) - 0.1, 3), "08b_buttons": round(part(9, 1) - 0.1, 3),
     "09_open": round(part(10, 0) - 0.1, 3), "09b_count": round(part(10, 2) - 0.1, 3), "09c_breath": round(W["something"] - 0.1, 3),
     "10_choice": round(part(11, 0) - 0.1, 3)}
W["bang_hits"] = [round(W["bangs"] + d, 3) for d in (0.0, 0.53)]   # thin-zombie attack2 una sola vez: impactos a 0.30 y 0.83 s del clip
W["rew0"] = T["05_rewind"]
out = dict(W=W, T=T, R2=R2, END=round(max(vend + 2.5, 62.0), 2), VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "| cortes", {k: round(v, 2) for k, v in T.items()}); print("R2", R2)

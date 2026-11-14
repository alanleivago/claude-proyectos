# ep13 "Gas Station, Part 1": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END, VOICE_END}. Lo leen film.js, sets/*.js y el mix. python build_cues.py (tras prep + assemble + fix_words + fix_caps)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-13-gasstation/engine"; V = r"F:/Claude Proyectos/pieces/zombie-13-gasstation/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'").replace("-", ""))
def find(line, *ws, nth=0):
    for w in ws:
        hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
        if len(hits) > nth: return round(hits[nth][1], 3)
    raise SystemExit(f"no encuentro {ws} (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)
W = dict(two=find(1, "2", "two"), alone=find(1, "alone"), flicker=find(1, "flicker"), stops=find(1, "stops"), forty=find(1, "forty", "40", "1240", "12.40"),
         quarter=find(2, "quarter"), dead=find(2, "dead"), electricity=find(2, "electricity"), power=find(2, "power"),
         shop=find(3, "shop"), water=find(3, "water"), snacks=find(3, "snacks"), flashlight=find(3, "flashlight"), bandages=find(3, "bandages"), days=find(3, "days"),
         windows=find(4, "windows"), glass=find(4, "glass"), see=find(4, "see"), cooler=find(4, "cooler"), door4=find(4, "door"), thick=find(4, "thick"), safe=find(4, "safe"),
         shapes=find(5, "shapes"), headlights=find(5, "headlights"), off=find(5, "off"), low=find(5, "low"), move=find(5, "move"), road=find(5, "road"),
         knocks=find(6, "knocks"), bathroom=find(6, "bathroom"), please=find(7, "please"), bitten=find(7, "bitten"), cut7=find(7, "cut"),
         hand=find(8, "hand"), bandage=find(8, "bandage"), drop=find(9, "drop"), blood=find(9, "blood"), fudge=part(9, 1), cuts=find(9, "cuts"),
         unlock=find(10, "unlock", nth=1), leave=find(10, "leave"), comment=find(10, "comment"))
vend = max(w[2] for w in WD)
T = {"01_hook": 0.0, "01b_pump": round(part(1, 1) - 0.1, 3), "02_dead": round(part(2, 0) - 0.1, 3), "02b_power": round(part(2, 1) - 0.15, 3), "03_shop": round(part(3, 0) - 0.1, 3),
     "03b_inv": round(part(3, 1) - 0.15, 3), "04_xsec": round(part(4, 0) - 0.15, 3), "05_low": round(part(5, 0) - 0.1, 3), "05b_off": round(W["off"] - 0.45, 3), "06_knock": round(part(6, 0) - 0.1, 3),
     "07_voice": round(part(7, 0) - 0.15, 3), "08_hand": round(part(8, 0) - 0.1, 3), "09_blood": round(part(9, 0) - 0.1, 3), "09b_key": round(part(9, 1) - 0.25, 3), "10_choice": round(part(10, 0) - 0.1, 3)}
out = dict(W=W, T=T, END=round(max(vend + 2.6, 62.0), 2), VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "VOICE_END", round(vend, 2)); print({k: round(v, 2) for k, v in T.items()})

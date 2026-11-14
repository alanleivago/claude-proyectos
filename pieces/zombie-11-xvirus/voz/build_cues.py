# ep11 "How Not to Turn": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END, VOICE_END}. Lo leen film.js, sets/*.js y el mix. python build_cues.py (tras prep + assemble + fix_words + fix_caps)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-11-xvirus/engine"; V = r"F:/Claude Proyectos/pieces/zombie-11-xvirus/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'").replace("-", ""))
def find(line, *ws, nth=0):
    for w in ws:
        hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
        if len(hits) > nth: return round(hits[nth][1], 3)
    raise SystemExit(f"no encuentro {ws} (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)
W = dict(bite1=find(1, "bite"), turns=find(1, "turns"), xvirus=part(1, 1),
         world2=find(2, "world"), rabies=find(2, "rabies"), blood=find(2, "blood"), spit=find(2, "spit"), bite2=find(2, "bite"), scratch2=find(2, "scratch"), splash2=find(2, "splash"), eyes=find(2, "eyes"), mouth=find(2, "mouth"),
         bare=find(3, "bare"), arms=find(3, "arms"), drop=find(3, "drop"), eye3=find(3, "eye"), splash3=find(3, "splash"), bite3=find(3, "bite"),
         cover=find(4, "cover"), sleeves=find(4, "sleeves"), gloves=find(4, "gloves"), goggles=find(4, "goggles"), mask=find(4, "mask"), bandana=find(4, "bandana"), laundry=find(4, "laundry"),
         bitten=find(5, "bitten"), wash5=find(5, "wash"), soap=find(5, "soap"), running=find(5, "running"), fifteen5=find(5, "fifteen", "15"), disinfect=find(5, "disinfect"), medical=find(5, "medical"),
         touch=find(6, "touch"), face=find(6, "face"), wash6=find(6, "wash"), hands=find(6, "hands"),
         world7=find(7, "world"), fast=find(7, "fast"), day1=find(7, "day"), fever=find(7, "fever"), day2=find(7, "day", nth=1), red=find(7, "red"), stare=find(7, "stare"), day3=find(7, "day", nth=2), know=find(7, "know"),
         anyone=find(8, "anyone"), guy=find(8, "guy"), alone=find(8, "alone"), seventy=find(8, "seventytwo", "seventy", "72"), hours=find(8, "hours"),
         scratch9=find(9, "scratch"), arm=find(9, "arm"), when=find(9, "when"), fudge=part(9, 2),
         what=find(10, "what"), wash10=find(10, "wash"), quarantine=find(10, "quarantine"), comment=find(10, "comment"))
vend = max(w[2] for w in WD)
T = {"01_hook": 0.0, "01b_push": round(W["turns"] - 0.05, 3), "02_micro": round(part(2, 0) - 0.2, 3), "03_fight": round(part(3, 0) - 0.1, 3), "03b_splash": round(part(3, 1) - 0.1, 3), "03_died": round(LE(3) + 0.25, 3),
     "04_gear": round(part(4, 0) - 0.1, 3), "05_wash": round(part(5, 0) - 0.1, 3), "05b_timer": round(W["running"] - 0.1, 3), "05c_spray": round(part(5, 1) - 0.1, 3),
     "06_face": round(part(6, 0) - 0.1, 3), "06b_hands": round(W["wash6"] - 0.1, 3), "07_diary": round(part(7, 0) - 0.1, 3),
     "08_quar": round(part(8, 0) - 0.1, 3), "08b_front": round(W["guy"] - 0.35, 3), "08c_sign": round(W["alone"] - 0.1, 3), "09_twist": round(part(9, 0) - 0.1, 3), "10_choice": round(part(10, 0) - 0.1, 3)}
out = dict(W=W, T=T, END=round(max(vend + 2.6, 62.0), 2), VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "VOICE_END", round(vend, 2)); print({k: round(v, 2) for k, v in T.items()})

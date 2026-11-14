# ep12 "The Radio": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END, VOICE_END}. Lo leen film.js, sets/*.js y el mix. python build_cues.py (tras prep + assemble + fix_words + fix_caps)
import json, re
E = r"F:/Claude Proyectos/pieces/zombie-12-radio/engine"; V = r"F:/Claude Proyectos/pieces/zombie-12-radio/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'").replace("-", ""))
def find(line, *ws, nth=0):
    for w in ws:
        hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
        if len(hits) > nth: return round(hits[nth][1], 3)
    raise SystemExit(f"no encuentro {ws} (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)
W = dict(lights=find(1, "lights"), bars=find(1, "bars"), phones=find(1, "phones"), friend=find(1, "friend"),
         radio2=find(2, "radio"), grid=find(2, "grid"), tower=find(2, "tower"), crank2=find(2, "crank", nth=1), minute=find(2, "minute"), talking=find(2, "talking"),
         earbud=find(3, "earbud"), speaker=find(3, "speaker"), noise=find(3, "noise"), brings=find(3, "brings"), ear=find(3, "ear"), house=find(3, "house"),
         night=find(4, "night"), daytime=find(4, "daytime", "day"), far=find(4, "far"), bounce=find(4, "bounce"), sky=find(4, "sky"), hundreds=find(4, "hundreds"), miles=find(4, "miles"), scan=find(4, "scan"), dark=find(4, "dark"),
         batteries=find(5, "batteries"), top=find(5, "top"), news=find(5, "news"), write=find(5, "write"), time5=find(5, "time"), frequency=find(5, "frequency"),
         repeating=find(6, "repeating"), shelters=find(6, "shelters"), routes=find(6, "routes"), curfew=find(6, "curfew"), official=find(6, "official"),
         stranger=find(7, "stranger"), army=find(7, "army"), rescue=find(7, "rescue"), listening=find(7, "listening"), free=find(7, "free"), talking7=find(7, "talking"), where=find(7, "where"),
         anyone=find(8, "anyone"), police=find(8, "police"), food=find(8, "food"), gate=find(8, "gate"), fudge=part(9, 0),
         what=find(10, "what"), answer=find(10, "answer"), silent=find(10, "silent"), comment=find(10, "comment"))
vend = max(w[2] for w in WD)
T = {"01_hook": 0.0, "01b_crank": round(part(1, 1) - 0.1, 3), "02_item": round(part(2, 0) - 0.15, 3), "03_earbud": round(part(3, 0) - 0.1, 3), "03b_ear": round(part(3, 1) - 0.1, 3),
     "04_iono": round(part(4, 0) - 0.15, 3), "05_clock": round(part(5, 0) - 0.1, 3), "05b_log": round(part(5, 1) - 0.1, 3), "06_fridge": round(part(6, 0) - 0.1, 3),
     "07_voice": round(part(7, 0) - 0.1, 3), "07b_door": round(part(7, 2) - 0.45, 3), "07c_ping": round(W["talking7"] + 0.3, 3), "08_radio": round(part(8, 0) - 0.15, 3),
     "08b_window": round(LE(8) + 0.25, 3), "09_save": round(part(10, 0) - 0.1, 3), "10_choice": round(W["answer"] - 0.1, 3)}
out = dict(W=W, T=T, END=round(max(vend + 2.6, 62.0), 2), VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "VOICE_END", round(vend, 2)); print({k: round(v, 2) for k, v in T.items()})

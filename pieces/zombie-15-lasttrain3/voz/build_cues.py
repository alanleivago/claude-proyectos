# ep15 "The Last Train, Part 3": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END, VOICE_END}. Lo leen film.js, sets/*.js y el mix. python build_cues.py (tras prep + assemble + fix_words + fix_caps)
import json, re
E = r"/Users/alanleiva/claude-proyectos/pieces/zombie-15-lasttrain3/engine"; V = r"/Users/alanleiva/claude-proyectos/pieces/zombie-15-lasttrain3/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'").replace("-", ""))
def find(line, *ws, nth=0):
    for w in ws:
        hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
        if len(hits) > nth: return round(hits[nth][1], 3)
    raise SystemExit(f"no encuentro {ws} (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)
W = dict(last1=find(1, "last"), driving=find(1, "driving"),
         red=find(2, "red"), so2=find(2, "so"), tunnel2=find(2, "tunnel"), dont2=find(2, "don't", "dont"), third=find(2, "third"), rail=find(2, "rail"), six=find(2, "six", "600"), volts=find(2, "volts"),
         footsteps3=find(3, "footsteps"), turn=find(3, "turn"), around=find(3, "around"),
         rewind=find(5, "rewind"),
         white=find(6, "white"), doors=find(6, "doors"), close=find(6, "close"), smile6=find(6, "hunter"), then6=find(6, "then"), speeds=find(6, "speeds"), nobody=find(6, "nobody"),
         switch7=find(7, "switch"), if7=find(7, "if"), lets=find(7, "lets", "let's"), brakes=find(7, "brakes"), doesnt=find(7, "doesn't", "doesnt"),
         rule8=find(8, "rule"), three8=find(8, "three", "3"), never8=find(8, "never"), enter8=find(8, "enter"), the8=find(8, "the"), cab8=find(8, "cab"), you8=find(8, "you"), rip=find(8, "rip"), lever=find(8, "lever"), pull=find(8, "pull"), brake8=find(8, "brake"),
         stops=find(9, "stops"), dark=find(9, "dark"), then9=find(9, "then"), footsteps9=find(9, "footsteps"), car9=find(9, "car"), smile9=find(9, "hunter"), board=find(9, "board"),
         ten=find(10, "ten", "10"), run=find(10, "run"), exit10=find(10, "exit"), lock=find(10, "lock"), comment=find(10, "comment"), one10=find(10, "one", "1"), two10=find(10, "two", "2"))
vend = max(w[2] for w in WD)
T = {"01_hook": 0.0, "01b_cab": round(part(1, 1) - 0.15, 3), "02_leave": round(part(2, 0) - 0.1, 3), "02b_step": round(W["so2"] - 0.15, 3), "02c_rail": round(W["dont2"] - 0.15, 3),
     "03_steps": round(part(3, 0) - 0.1, 3), "03b_turn": round(part(3, 1) - 0.1, 3), "03c_back": round(LE(3) + 0.3, 3), "04_fudge": round(part(4, 0) - 0.35, 3), "04c_died": round(LE(4) + 0.15, 3), "05_rewind": round(part(5, 0) - 0.05, 3),
     "06_stay": round(part(6, 0) - 0.1, 3), "06b_close": round(W["doors"] - 0.2, 3), "06c_speed": round(W["then6"] - 0.15, 3), "06d_empty": round(W["nobody"] - 0.25, 3),
     "07_dms": round(part(7, 0) - 0.1, 3), "07b_letgo": round(W["if7"] - 0.15, 3), "07c_tape": round(part(7, 2) - 0.1, 3),
     "08_rule": round(part(8, 0) - 0.1, 3), "08b_enter": round(W["you8"] - 0.15, 3), "08c_tape": round(W["rip"] - 0.2, 3), "08d_brake": round(W["pull"] - 0.3, 3), "08e_sparks": round(LE(8) + 0.05, 3),
     "09_stop": round(part(9, 0) - 0.1, 3), "09b_next": round(W["then9"] - 0.15, 3), "09c_smile": round(part(9, 2) - 0.1, 3), "10_count": round(part(10, 0) - 0.1, 3), "10_choice": round(part(10, 1) - 3.6, 3)}
END = round(max(vend + 2.6, W["ten"] + 10.3, 62.0), 2)
out = dict(W=W, T=T, END=END, VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "VOICE_END", round(vend, 2)); print({k: round(v, 2) for k, v in T.items()})

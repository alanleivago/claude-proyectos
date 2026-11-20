# ep16 "Stuck On Floor 30, Part 2": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END, VOICE_END}. Lo leen film.js, sets/*.js y el mix. python build_cues.py (tras prep + assemble + fix_words + fix_caps)
import json, re
E = r"/Users/alanleiva/claude-proyectos/pieces/zombie-16-floor30-2/engine"; V = r"/Users/alanleiva/claude-proyectos/pieces/zombie-16-floor30-2/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'").replace("-", ""))
def find(line, *ws, nth=0):
    for w in ws:
        hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
        if len(hits) > nth: return round(hits[nth][1], 3)
    raise SystemExit(f"no encuentro {ws} (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)
W = dict(thirty1=find(1, "thirty"), stairs1=find(1, "stairs"), only=find(1, "only"), tonight=find(1, "tonight"), something=find(1, "something"), big=find(1, "big"), walked=find(1, "walked"), building=find(1, "building"),
         last2=find(2, "last"), knocked=find(2, "knocked"), n3012=find(2, "3012", "thirty-twelve", "thirtytwelve", "30-12"), some2=find(2, "some"), open2a=find(2, "open"), so2=find(2, "so"), move=find(2, "move"), dresser=find(2, "dresser"),
         open2b=find(2, "open", nth=1), door2=find(2, "door"), his=find(2, "his"), arm=find(2, "arm"), bitten=find(2, "bitten"),
         fudge=find(3, "fudge"), rewind=find(4, "rewind"),
         most=find(5, "most"), quiet=find(5, "quiet"), wait=find(5, "wait"), note=find(5, "note"), slides=find(5, "slides"), door5=find(5, "door"), stairs5=find(5, "stairs"), its5=find(5, "it's", "its"), coming=find(5, "coming"), up5=find(5, "up"),
         phone6=find(6, "phone's", "phones", "phone"), eighteen=find(6, "eighteen", "18"), percent=find(6, "percent"), airplane=find(6, "airplane"), stretch=find(6, "stretch"), hours=find(6, "hours"),
         then7=find(7, "then"), stairwell7=find(7, "stairwell"), footsteps=find(7, "footsteps"), heavy=find(7, "heavy"), bare=find(7, "bare"), in7=find(7, "in", nth=1), sound=find(7, "sound"), carries=find(7, "carries"), floor7=find(7, "floor"),
         through=find(8, "through"), peephole=find(8, "peephole"), hunter=find(8, "hunter"), reaches=find(8, "reaches"), floor8=find(8, "floor"),
         hide=find(9, "hide"), tub=find(9, "tub"), climb=find(9, "climb"), balcony=find(9, "balcony"), comment=find(9, "comment"), one9=find(9, "one", "1"), two9=find(9, "two", "2"))
vend = max(w[2] for w in WD)
T = {"01_crane": 0.0, "01b_window": round(min(2.6, max(2.2, W["only"] - 0.1)), 3), "01c_inlobby": round(W["walked"] - 0.1, 3),
     "02_knock": round(part(2, 0) - 0.15, 3), "02a_some": round(part(2, 1) - 0.12, 3), "02b_dresser": round(W["so2"] - 0.15, 3), "02c_open": round(W["open2b"] - 0.25, 3), "02d_arm": round(part(2, 3) - 0.1, 3), "02e_lunge": round(LE(2) + 0.2, 3),
     "03_fudge": round(part(3, 0) - 0.35, 3), "03c_died": round(LE(3) + 0.15, 3), "04_rewind": round(part(4, 0) - 0.05, 3),
     "05_quiet": round(part(5, 0) - 0.1, 3), "05b_note": round(part(5, 2) - 0.1, 3), "05c_file": round(part(5, 3) - 0.2, 3),
     "06_phone": round(part(6, 0) - 0.1, 3), "06a_air": round(part(6, 1) - 0.12, 3), "06b_save": round(LE(6) + 0.15, 3),
     "07_shaft": round(part(7, 0) - 0.1, 3), "07b_feet": round(W["heavy"] - 0.15, 3), "07c_carry": round(part(7, 2) - 0.1, 3),
     "08_peep": round(part(8, 0) - 0.15, 3), "08b_fish": round(part(8, 1) - 0.2, 3), "08c_pound": round(LE(8) + 0.25, 3), "09_choice": round(part(9, 0) - 2.3, 3)}
END = round(max(vend + 2.6, 62.0), 2)
out = dict(W=W, T=T, END=END, VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "VOICE_END", round(vend, 2)); print({k: round(v, 2) for k, v in T.items()})

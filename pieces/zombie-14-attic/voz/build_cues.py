# ep14 "The Attic": tiempos de imagen y sonido derivados de la voz (engine/timeline.json + voz/lines.json) -> engine/cues.json
# {W: palabras clave, T: cortes de plano, END, VOICE_END}. Lo leen film.js, sets/*.js y el mix. python build_cues.py (tras prep + assemble + fix_words + fix_caps)
import json, re
E = r"/Users/alanleiva/claude-proyectos/pieces/zombie-14-attic/engine"; V = r"/Users/alanleiva/claude-proyectos/pieces/zombie-14-attic/voz"
TL = json.load(open(f"{E}/timeline.json", encoding="utf8")); LN = json.load(open(f"{V}/lines.json", encoding="utf8"))
WD = TL["words"]; nrm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace(".", "").replace("’", "'").replace("-", ""))
def find(line, *ws, nth=0):
    for w in ws:
        hits = [x for x in WD if x[3] == line and nrm(x[0]) == nrm(w)]
        if len(hits) > nth: return round(hits[nth][1], 3)
    raise SystemExit(f"no encuentro {ws} (#{nth}) en la linea {line}: {[x[0] for x in WD if x[3] == line]}")
part = lambda line, j: LN[line - 1][1][j]
LE = lambda line: round(max(w[2] for w in WD if w[3] == line), 3)
W = dict(room=find(1, "room"), nobody=find(1, "nobody"), checks=find(1, "checks"), attic=find(1, "attic"),
         knocked=find(2, "knocked"), begged=find(2, "begged"), quiet1=find(2, "quiet"), stops=find(2, "stops"),
         silence=find(3, "silence"), talking=find(3, "talking"), sixty=find(3, "sixty", "60"), whisper3=find(3, "whisper"), thirty=find(3, "thirty", "30"), dont=find(3, "don't", "dont"),
         worse=find(4, "worse"), darkness=find(4, "darkness"), flame=find(4, "flame"), seen=find(4, "seen"), mile=find(4, "mile"), blanket=find(4, "blanket"), flashlight4=find(4, "flashlight"), floor4=find(4, "floor"),
         day5=find(5, "day"), save=find(5, "save"),
         up6=find(6, "up"), water6=find(6, "water"), mattress=find(6, "mattress"), floor6=find(6, "floor"), heat=find(6, "heat"), never=find(6, "never"), boards=find(6, "boards"),
         footsteps=find(7, "footsteps"), heavy=find(7, "heavy"), bare=find(7, "bare"), zombie=find(8, "zombie"),
         low9=find(9, "low"), farther=find(9, "farther"), everything=find(9, "everything"), blocks=find(9, "blocks"),
         tilts=find(10, "tilts"), looks=find(10, "looks"), attic10=find(10, "attic"),
         one11=find(11, "only"), climb=find(11, "climb"), time11=find(11, "time"), need=find(11, "need"),
         one12=find(12, "one", "1"), two12=find(12, "two", "2"), jump=find(12, "jump"), roof=find(12, "roof"), comment=find(12, "comment"))
vend = max(w[2] for w in WD)
burst = round(LE(7) + 0.3, 3)
T = {"01_hook": 0.0, "01a_room": round(W["room"] - 0.1, 3), "01b_attic": round(part(1, 1) - 0.15, 3), "02_recap": round(part(2, 0) - 0.1, 3), "02b_vote": round(part(2, 1) - 0.1, 3), "02c_quiet": round(part(2, 2) - 0.1, 3), "02d_stops": round(part(2, 3) - 0.1, 3),
     "03_db": round(part(3, 0) - 0.1, 3), "03b_whisper": round(W["whisper3"] - 0.25, 3), "03c_breath": round(part(3, 1) - 0.1, 3),
     "04_flame": round(part(4, 0) - 0.1, 3), "04a_mile": round(W["seen"] - 0.3, 3), "04b_blanket": round(part(4, 1) - 0.1, 3), "04c_flash": round(W["flashlight4"] - 0.3, 3),
     "05_save": round(part(5, 0) - 0.1, 3), "06_climb": round(part(6, 0) - 0.1, 3), "06b_attic": round(part(6, 1) - 0.1, 3), "06c_sleep": round(W["never"] - 0.25, 3),
     "07_feet": round(part(7, 0) - 0.15, 3), "07a_bare": round(part(7, 1) - 0.1, 3), "07b_burst": burst, "07c_rise": round(burst + 0.35 + 0.8 + 0.9, 3), "08_ava": round(part(8, 0) - 0.15, 3),
     "09_sound": round(part(9, 0) - 0.1, 3), "09b_heads": round(W["everything"] - 0.25, 3), "10_tilt": round(part(10, 0) - 0.1, 3), "10b_look": round(part(10, 1) - 0.1, 3),
     "11_step": round(part(11, 0) - 0.1, 3), "11b_need": round(part(11, 1) - 0.1, 3), "12_choice": round(part(12, 0) - 0.1, 3)}
W["land"] = round(burst + 0.35 + 0.8, 3)   # el gigante toca el piso (mezcla: 1 s de silencio y despues el rugido)
out = dict(W=W, T=T, END=round(max(vend + 2.6, 62.0), 2), VOICE_END=round(vend, 3))
json.dump(out, open(f"{E}/cues.json", "w", encoding="utf8"), indent=1, ensure_ascii=False)
print("END", out["END"], "VOICE_END", round(vend, 2)); print({k: round(v, 2) for k, v in T.items()})

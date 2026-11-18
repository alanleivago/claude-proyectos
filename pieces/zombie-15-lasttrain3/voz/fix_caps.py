# ep11: limpia palabras de engine/timeline.json (sin '!'/'?', numeros en letras donde la voz los dice). python fix_caps.py (despues de fix_words.py)
import json
E = r"/Users/alanleiva/claude-proyectos/pieces/zombie-15-lasttrain3/engine/timeline.json"
TL = json.load(open(E, encoding="utf8")); NUM = {"1": "one", "2": "two", "3": "three", "10": "ten"}
for w in TL["words"]:
    for k in (0, 4): w[k] = NUM.get(w[k].strip("!?,."), w[k].replace("!", "").replace("?", ""))
json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("ok", len(TL["words"]))
# ep15: whisper escribe "600" -> "six hundred" en dos palabras (mitad del tiempo para cada una)
W2 = []
for w in TL["words"]:
    if w[0].strip(".,…").lower() == "600":
        m = round((w[1] + w[2]) / 2, 3); W2 += [["six", w[1], m, w[3], "six"], ["hundred", m, w[2], w[3], "hundred"]]
    else: W2.append(w)
TL["words"] = W2; json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("600 partido")

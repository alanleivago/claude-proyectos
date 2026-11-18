# ep11: limpia palabras de engine/timeline.json (sin '!'/'?', numeros en letras donde la voz los dice). python fix_caps.py (despues de fix_words.py)
import json
E = r"/Users/alanleiva/claude-proyectos/pieces/zombie-14-attic/engine/timeline.json"
TL = json.load(open(E, encoding="utf8")); NUM = {"1": "one", "2": "two", "3": "three", "15": "fifteen", "72": "seventy-two"}
for w in TL["words"]:
    for k in (0, 4): w[k] = NUM.get(w[k].strip("!?,."), w[k].replace("!", "").replace("?", ""))
json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("ok", len(TL["words"]))
# ep14: whisper junta "bare boards" en "bareboards": se parte en dos palabras (mitad del tiempo para cada una)
W2 = []
for w in TL["words"]:
    if w[0].strip(".,…").lower() == "bareboards":
        m = round((w[1] + w[2]) / 2, 3); W2 += [["bare", w[1], m, w[3], "bare"], ["boards", m, w[2], w[3], "boards."]]
    else: W2.append(w)
TL["words"] = W2; json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("bareboards partido")

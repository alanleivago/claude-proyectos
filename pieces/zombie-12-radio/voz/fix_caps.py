# ep11: limpia palabras de engine/timeline.json (sin '!'/'?', numeros en letras donde la voz los dice). python fix_caps.py (despues de fix_words.py)
import json
E = r"F:/Claude Proyectos/pieces/zombie-12-radio/engine/timeline.json"
TL = json.load(open(E, encoding="utf8")); NUM = {"1": "one", "2": "two", "3": "three", "15": "fifteen", "72": "seventy-two"}
for w in TL["words"]:
    for k in (0, 4): w[k] = NUM.get(w[k].strip("!?,."), w[k].replace("!", "").replace("?", ""))
json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("ok", len(TL["words"]))

# ep10: limpia palabras de engine/timeline.json (sin '!'/'?', numeros en letras donde la voz los dice). python fix_caps.py (despues de fix_words.py)
import json
E = r"F:/Claude Proyectos/pieces/zombie-10-stairs/engine/timeline.json"
TL = json.load(open(E, encoding="utf8")); NUM = {"4": "four", "1": "one", "2": "two"}
for w in TL["words"]:
    for k in (0, 4): w[k] = NUM.get(w[k].strip("!?"), w[k].replace("!", "").replace("?", ""))
json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("ok", len(TL["words"]))
# la voz del hombre (linea 10) no mueve la boca de Ava
M = list(TL["mouth"])
for w in TL["words"]:
    if w[3] == 10:
        for f in range(int(w[1] * 15), int(w[2] * 15) + 2):
            if f < len(M): M[f] = "-"
TL["mouth"] = "".join(M); json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("boca de Ava quieta en la linea del hombre")

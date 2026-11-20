# ep11: limpia palabras de engine/timeline.json (sin '!'/'?', numeros en letras donde la voz los dice). python fix_caps.py (despues de fix_words.py)
import json
E = r"/Users/alanleiva/claude-proyectos/pieces/zombie-16-floor30-2/engine/timeline.json"
TL = json.load(open(E, encoding="utf8")); NUM = {"1": "one", "2": "two", "3": "three", "10": "ten", "30": "thirty"}
for w in TL["words"]:
    for k in (0, 4): w[k] = NUM.get(w[k].strip("!?,."), w[k].replace("!", "").replace("?", ""))
json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("ok", len(TL["words"]))
# ep16: "thirty-twelve" / "30-12" -> "3012" en el subtitulo; "18%" -> "eighteen percent"
W2 = []
for w in TL["words"]:
    k = w[0].strip(".,…").lower()
    if k in ("thirty-twelve", "30-12", "3012", "thirtytwelve"): W2.append(["3012", w[1], w[2], w[3], "3012"])
    elif k in ("18%", "18"):
        m = round((w[1] + w[2]) / 2, 3); W2 += [["eighteen", w[1], m, w[3], "eighteen"], ["percent", m, w[2], w[3], "percent"]]
    else: W2.append(w)
TL["words"] = W2; json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("ep16 palabras")

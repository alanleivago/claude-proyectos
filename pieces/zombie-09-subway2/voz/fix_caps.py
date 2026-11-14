# Corrige palabras que whisper oye mal en la toma unida (la toma suelta si dice lo del guion: gen_report OK).
# Une 'door is closed' -> 'doors close' y 'door shut' -> 'doors shut'. python fix_caps.py (despues de fix_words.py)
import json
E = r"F:/Claude Proyectos/pieces/zombie-09-subway2/engine/timeline.json"
TL = json.load(open(E, encoding="utf8")); W = TL["words"]; out = []; i = 0
while i < len(W):
    w = W[i]; w[0] = w[0].replace("!", ""); w[4] = w[4].replace("!", ""); seq = [x[0] for x in W[i:i + 3]]
    if w[3] == 1 and w[0] == "the" and i + 1 < len(W) and W[i + 1][0] == "last": W[i + 1][1] = w[1]; i += 1; continue   # v5: whisper inventa 'the' antes de 'Last time'
    if seq == ["door", "is", "closed"]: out += [["doors", w[1], W[i + 1][2], w[3], "doors"], ["close", W[i + 2][1], W[i + 2][2], w[3], "close"]]; i += 3; continue
    if w[0] == "door" and i + 1 < len(W) and W[i + 1][0] == "shut": w = ["doors", w[1], w[2], w[3], "doors"]
    if w[0] == "2" and i > 0 and W[i - 1][0] == "rule": w = ["two", w[1], w[2], w[3], "two"]
    out.append(w); i += 1
TL["words"] = out; json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print(len(W), "->", len(out))

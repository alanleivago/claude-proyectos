# tras assemble.py: numeros de los subtitulos como se leen (1142 -> 11:42, 3 % -> 3%, 5 30 -> 5:30). python fix_caps.py
import json; p = r"F:/Claude Proyectos/pieces/zombie-04-subway/engine/timeline.json"; t = json.load(open(p, encoding="utf8")); W = t["words"]; out = []; i = 0
while i < len(W):
    w = W[i]
    if w[0] == "1142": w[0] = "11:42"
    for a, b, c in (("3", "%", "3%"), ("5", "30", "5:30")):
        if w[0] == a and i + 1 < len(W) and W[i + 1][0] == b: w[0] = c; w[2] = W[i + 1][2]; i += 1
    out.append(w); i += 1
t["words"] = out; json.dump(t, open(p, "w", encoding="utf8"), ensure_ascii=False)

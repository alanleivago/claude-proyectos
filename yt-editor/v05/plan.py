import json, re, unicodedata
W = json.load(open("raw_full.words.json", encoding="utf-8"))
def norm(s): return re.sub(r"[^a-z0-9 ]", "", unicodedata.normalize("NFD", s.lower()).encode("ascii", "ignore").decode())
toks = [norm(w[2]) for w in W]
def find(phrase, after=0):
    p = norm(phrase).split()
    for i in range(len(toks) - len(p) + 1):
        if W[i][0] >= after and toks[i:i + len(p)] == p:
            return W[i][0]
    raise SystemExit("not found: " + phrase)
FIXED = [("v05/flow/f01.jpg", 4, "llegando a casa"), ("v05/flow/f04.jpg", 15, "aviso para comparecer"),
         ("v05/flow/f05.jpg", 26, "la guarda en un cajon"), ("v05/cand/a08_1.jpg", 36, "el juez puede")]
PLAN = [("v05/cand/a11_3.jpg", "un caso de deportacion"), ("v05/flow/f02.jpg", "direccion de la corte"), ("v05/cand/a14_1.jpg", "mandar estos avisos"),
        ("v05/cand/a07_2.jpg", "pones tus huellas"), ("v05/cand/a16_3.jpg", "antes de pedir la ciudadania"),
        ("v05/cand/a14_2.jpg", "o en un matrimonio"), ("v05/cand/a17_3.jpg", "demasiado tiempo fuera"),
        ("v05/flow/f08.jpg", "busca tu caso"), ("v05/flow/f03.jpg", "consigue un abogado"),
        ("v05/flow/f02.jpg", "nunca faltes a una cita"), ("v05/flow/f06.jpg", "si te mudas avisa"),
        ("v05/cand/a06_3.jpg", "muchos residentes con anos"), ("v05/cand/a17_2.jpg", "no salgas del pais"),
        ("v05/cand/a11_2.jpg", "en una oficina de"), ("v05/flow/f07.jpg", "ten tus papeles en orden"),
        ("v05/cand/a06_2.jpg", "riesgo para siempre"), ("v05/cand/a10_2.jpg", "de su familia ya")]
SUBS = [120, 289, 435]
SUBS.append(find("suscribanse"))
blocked = [(40.8, 48.6), (213.8, 249.4)] + [(s, s + 6.8) for s in SUBS]
DUR, GAP = 6.5, 8
out = [{"file": f, "start": t, "end": min(t + 5, 40.7), "phrase": p} for f, t, p in FIXED]
for f, ph in PLAN:
    s = round(find(ph, 50), 2)
    e = s + DUR
    for a, b in blocked:
        if s < b and e > a:
            e = a - 0.2 if s < a else None
            break
    if e is None or e - s < 4.5:
        print("SKIP (blocked)", ph, s); continue
    prev = out[-1]
    if s - prev["end"] < GAP:
        prev["end"] = max(prev["start"] + 5, s - GAP)
        if s - prev["end"] < GAP - 0.01:
            print("SKIP (gap)", ph, s); continue
    out.append({"file": f, "start": s, "end": round(e, 2), "phrase": ph})
json.dump({"plan": out, "subs": SUBS}, open("plan.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
tot = W[-1][1]
print(len(out), "images, one every", round(tot / len(out), 1), "s; subs", SUBS)
for o in out: print(f"{o['start']:7.2f}-{o['end']:7.2f} {o['file'][4:]:22} {o['phrase']}")

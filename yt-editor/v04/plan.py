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
FIXED = [("v04/flow/f01.jpg", 4, "agente se acerca a tu ventana"), ("v04/cand/b05_2.jpg", 15, "empiezas a contestar"),
         ("v04/cand/b04_2.jpg", 26, "le contaste tu vida a un agente"), ("v04/cand/a03_3.jpg", 37, "que papeles si tienes que mostrar")]
PLAN = [("v04/cand/b02_2.jpg", "una falta de trafico"), ("v04/flow/f02.jpg", "mostrar tu licencia no es"),
        ("v04/cand/a18_1.jpg", "a definir la situacion"), ("v04/flow/f03.jpg", "los que van contigo"), ("v04/cand/a06_2.jpg", "lo ha permitido la corte suprema"),
        ("v04/cand/a16_2.jpg", "tiene una razon legal"), ("v04/cand/a14_1.jpg", "no metas la mano"),
        ("v04/cand/a20_1.jpg", "te fueras a ir"), ("v04/cand/a13_2.jpg", "area de los angeles"), ("v04/cand/b03_1.jpg", "los retenes fijos"),
        ("v04/cand/a08_3.jpg", "carros sin marcas"), ("v04/cand/b04_1.jpg", "cuantos agentes eran"),
        ("v04/cand/a19_2.jpg", "camaras que leen las placas"), ("v04/cand/a12_2.jpg", "revisa tu carro"),
        ("v04/cand/a20_2.jpg", "bajas la ventana"), ("v04/cand/a15_2.jpg", "maneja todos los dias")]
SUBS = [120, 289, 435]
SUBS.append(find("suscribanse"))
blocked = [(44.4, 52.0), (226.3, 262.0)] + [(s, s + 6.8) for s in SUBS]
DUR, GAP = 6.5, 8
out = [{"file": f, "start": t, "end": t + 5, "phrase": p} for f, t, p in FIXED]
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

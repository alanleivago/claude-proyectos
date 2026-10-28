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
FIXED = [("v03/cand/a25_2.jpg", 4, "agente de ICE se te acerca"), ("v03/cand/a08_1.jpg", 15, "en ese telefono esta toda tu vida"),
         ("v03/cand/a06_1.jpg", 26, "puede abrir un caso contra ti"), ("v03/cand/c08_2.jpg", 37, "si se quieren llevar tu telefono")]
PLAN = [("v03/cand/b04_o1.jpg", "telefono desbloqueado"), ("v03/cand/b08_o1.jpg", "en un operativo"),
        ("v03/cand/a08_3.jpg", "los grupos de whatsapp"), ("v03/cand/a09_2.jpg", "la corte suprema"), ("v03/cand/a20_1.jpg", "una cartera o una billetera"),
        ("v03/cand/a19_3.jpg", "o si lo desbloqueas"), ("v03/cand/a19_3.jpg", "me deja ver su telefono"), ("v03/flow/f02.jpg", "una orden administrativa"),
        ("v03/cand/a13_1.jpg", "orden judicial firmada"), 
        ("v03/flow/f05.jpg", "con la huella"), ("v03/cand/a16_2.jpg", "en un iphone"),
        ("v03/cand/a19_1.jpg", "no lo tires"), ("v03/flow/f04.jpg", "identificacion en el telefono"), ("v03/cand/a02_2.jpg", "puede quedarse con tu telefono"),
        ("v03/cand/a25_1.jpg", "numero de placa"), ("v03/flow/f06.jpg", "grabando un operativo"),
        ("v02/img/c02_3.jpg", "en los aeropuertos"), ("v03/cand/a24_1.jpg", "practica la frase con tu familia"),
        ("v03/cand/a16_3.jpg", "si un agente te pide tu telefono"), ("v03/cand/b08_o2.jpg", "toda la comunidad hispana")]
SUBS = [120, 240, 346, 480]
SUBS.append(find("suscribanse"))
blocked = [(42.9, 50.6), (289.9, 322.9)] + [(s, s + 6.8) for s in SUBS]
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

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
FIXED = [("v06/flow/f01.jpg", 4, "alguien golpea"), ("v06/cand/b02_3.jpg", 16, "puede cambiar la vida"),
         ("v06/flow/f10.jpg", 39.5, "el papel que si")]
PLAN = [("v06/cand/b08_2.jpg", "a que hora se hacen"), ("v06/cand/b12_2.jpg", "oportunidad de empujar"),
        ("v06/flow/f02.jpg", "pasela por debajo de la puerta"), ("v06/cand/b14_1.jpg", "quien vive aqui"),
        ("v06/cand/b07_1.jpg", "una orden judicial"), ("v06/cand/b06_1.jpg", "departamento de seguridad nacional y"),
        ("v05/cand/a11_3.jpg", "orden de deportacion final"), ("v06/flow/f03.jpg", "vamos punto por punto"),
        ("v06/cand/b08_1.jpg", "chalecos que dicen policia"), ("v06/flow/f11.jpg", "puede ser ice"),
        ("v05/cand/a16_3.jpg", "da las green cards"), ("v06/cand/b20_1.jpg", "se hacen muy temprano"),
        ("v06/cand/b02_1.jpg", "no doy mi consentimiento"), ("v06/cand/b15_1.jpg", "escribe todo"),
        ("v05/flow/f03.jpg", "llama un abogado de"), ("v06/flow/f08.jpg", "si vives con mas gente"),
        ("v06/flow/f05.jpg", "no te olvides de los ninos"), ("v06/flow/f07.jpg", "sacar la basura"),
        ("v06/flow/f04.jpg", "mirar por la ventana"), ("v06/flow/f09.jpg", "tu pasaporte de tu pais"),
        ("v06/flow/f12.jpg", "vamos a practicarlo"), ("v06/flow/f06.jpg", "timbre con camara"),
        ("v05/cand/a06_3.jpg", "si soy ciudadano"), ("v06/flow/f13.jpg", "la tarjeta roja cerca"),
        ("v06/cand/b14_1.jpg", "en su barrio")]
SUBS = [205, 480, 720]
SUBS.append(find("suscribanse"))
blocked = [(46.1, 53.9), (266.8, 324.0)] + [(s, s + 6.8) for s in SUBS]
DUR, GAP = 6.5, 8
out = [{"file": f, "start": t, "end": min(t + 5, 46.0), "phrase": p} for f, t, p in FIXED]
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

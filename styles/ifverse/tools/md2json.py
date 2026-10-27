# ifverse script.md -> voice/script.json: one line per narrator sentence, [Name] lines as character lines,
# [beat Ns] adds real silence after the previous line.  usage: python3 md2json.py <piece>
import sys, re, json, os
piece = sys.argv[1]
CAST = json.load(open(f"{piece}/voice/cast.json"))
lines, n = [], {}
SENT, PARA, CHAR = float(sys.argv[2]) if len(sys.argv) > 2 else 0.55, float(sys.argv[3]) if len(sys.argv) > 3 else 0.85, float(sys.argv[4]) if len(sys.argv) > 4 else 0.45
BEATX = float(sys.argv[5]) if len(sys.argv) > 5 else 0   # extra seconds added to every [beat]
def add(who, text, after):
    n[who] = n.get(who, 0) + 1
    lines.append({"id": f"{len(lines)+1:03d}-{re.sub('[^a-z]', '', who.lower())}", "who": who, "text": text, "after": after})
for raw in open(f"{piece}/script.md").read().splitlines()[1:]:
    raw = raw.strip()
    if not raw: continue
    m = re.match(r"\[beat (\d+(?:\.\d+)?)s\]", raw)
    if m:
        if lines: lines[-1]["after"] = round(lines[-1]["after"] + float(m.group(1)) + BEATX, 2); lines[-1]["beat"] = float(m.group(1))
        continue
    m = re.match(r"\[([^\]]+)\] (.*)", raw)
    if m:
        add(m.group(1), m.group(2), CHAR); continue
    prot = re.sub(r'\b(Mrs|Mr|Dr|Ms|St)\.', r'\1§', raw)   # abbreviations never end a sentence
    sents = [x.replace('§', '.') for x in re.findall(r'[^.!?]+[.!?]+["”]?|[^.!?]+$', prot)]
    for i, s in enumerate(sents):
        add("Narrator", s.strip(), PARA if i == len(sents) - 1 else SENT)
for L in lines: assert L["who"] in CAST, L["who"]
json.dump({"lead": 1.0, "tail": 2.5, "lines": lines}, open(f"{piece}/voice/script.json", "w"), indent=1)
print(len(lines), "lines", n)

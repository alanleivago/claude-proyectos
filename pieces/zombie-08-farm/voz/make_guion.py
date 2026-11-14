# Escribe guion.md desde takes.py (texto exacto por toma). python make_guion.py
import re
from takes import T, CH
L = ["# AVA: The Last Farm — Day 1 (Part 1) — guion (largo 16:9)", "",
     "Narración en segunda persona, voz de Ava (\"ava bread buena\" f2a102da, speed 0.85). Cada \"…\" separa dos tomas (nunca se corta una toma en \"…\"). Texto exacto por toma: `takes.py`.", ""]
TIT = {"c1": "1. THE ALERT (0:00)", "c2": "2. DON'T GO TO TOWN", "c3": "3. THE WATER CLOCK", "c4": "4. THE GENERATOR", "c5": "5. NOISY ANIMALS", "c6": "6. LOCK THE GATE", "c7": "7. INVENTORY", "c8": "8. SOMETHING IN THE BARN"}
cur, para = None, ""
def flush():
    global para
    if para: L.extend([para.strip(), ""]); para = ""
for tid, ch, who, text, reuse, gap in T:
    if ch != cur:
        flush(); cur = ch; c = CH[ch]; L.extend([f"## {TIT[ch]}" + (f" — tarjeta RE: {c[0]} / {c[1]}" if c else " — sin tarjeta (abre el teléfono, 6:42 AM)"), ""])
    if tid == "b8": flush(); L.extend(["(YOU DIED)", ""])
    if reuse: flush(); L.extend(["Oh, fudge. *(toma del ep1, `zombie-01-door/voz/lines/13_fudge.wav`)*", ""]); continue
    para += text + " "
flush(); L.append("(tarjeta final: PART 2: SOMETHING IN THE BARN / SUBSCRIBE!)")
n = sum(len(re.findall(r"[\w'-]+", t[3])) for t in T)
L += ["", "---", f"{len(T)} tomas, {n} palabras.",
      "Humanizer: conectores en vez de listas sueltas, sin contrastes \"no X sino Y\" ni aperturas teatrales; los datos van dentro de frases normales.",
      "Callbacks: tornillos de 3 in (ep1), calentador de 40 gal (comisaría), sin First Aid Spray (ep7), \"Oh, fudge\" (ep1). Datos y fuentes: `../brief.md`."]
open("guion.md", "w", encoding="utf8").write("\n".join(L)); print(n)

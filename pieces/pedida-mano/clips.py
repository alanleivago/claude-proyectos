"""Genera los clips de pedida-mano PARTE 1 (La Pedida de Mano, video 24, historia ORIGINAL no navideña, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4)."""
import json, re, subprocess, sys, os, tempfile, time
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
D = Path(__file__).parent
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = D / "clips"
L = json.loads((D / "lines.json").read_text(encoding="utf-8"))
STYLE = ("Cinematic vertical shot from a Mexican telenovela, photorealistic, natural skin texture, 85mm lens, shallow depth of field, "
         "static camera with a very slow push-in. Keep every character exactly as in their reference sheet (same face, hair, clothes, accessories). "
         "No music. Clean frame, no captions, no subtitles, no text on screen, no name tags, no lettering on clothes.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, unhurried, every word clearly pronounced, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / buen-hijo-p2 c27 / mecanico c25 / regreso-20 c25: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA nochebuena c18 / regreso-20 c25 / sazon-concha c16: letras en la franja inferior -> CLEAN después de NOSUB
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA agua-hacienda-p2 c13 / chocolate-rancho-p2 c34 / regreso-20 c28 / mecanico c21: frase o palabra repetida al final -> silencio tras la última palabra
# QA regreso-20 c14/c22: se perdía la 2ª frase -> el diálogo va completo y cada clip tiene margen (8 s para dos frases)
END = "After the last word the person stays silent until the end of the shot."
# QA camionero c04/c05/c16/c25/c30 / posada c07-c23 / regreso-20 c06/c21/c27: espaldas, dobles y gente en el borde -> TODOS los planos son de una sola persona
# (ONE + ALONE) con la mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder (QA padre-veladoras-p2, canasta c12).
# QA regreso-20 c26: personaje que entra a cuadro -> "already in place from the very first frame" (va en ALONE).
# Geografía fija (solo define hacia dónde mira cada uno):
#   Estacionamiento de día (c01-c12, r1): Lorenzo a la IZQUIERDA junto a su camioneta verde; Isabela y Beatriz a la DERECHA junto al portón de cantera.
#   Comedor privado (c13-c32, r2, r3): Isabela y Beatriz a la IZQUIERDA, sentadas a la mesa; Esteban a la DERECHA, de pie; Lorenzo a la DERECHA, de pie en la puerta de arco.
#   Estacionamiento al anochecer (c33, c34, r4): Lorenzo IZQUIERDA junto a su camioneta; Beatriz DERECHA en el portón. CTA (c35): Lorenzo solo junto a su camioneta, a cámara.
# Hojas de locación SIMPLES (lección intercambio c07/c23/c25/c32: Omni copia cada detalle de la hoja en todos los planos): nada religioso, sin adornos, sin letreros.
EST = ("in the cobblestone parking lot @{LOC_PORTONPEDIDA} in front of a hacienda-style restaurant at midday, a plain pale cantera stone wall with one tall arched dark wooden gate, "
       "soft natural daylight; no readable text, no signs, no license plates with letters; no extras, nobody else in the parking lot besides the person described")
ESTD = EST.replace("at midday", "at dusk").replace("soft natural daylight", "soft blue dusk light, one iron wall lantern glowing by the gate")
COM = ("inside the private dining room @{LOC_COMEDORPEDIDA} of a hacienda-style restaurant in the afternoon, pale cantera stone walls, one long table with a plain white tablecloth, "
       "simple white plates and glasses, dark wooden chairs, one arched wooden doorway, warm soft window light; no flowers, no decorations, no paintings, no readable text, no signs; "
       "no extras, no waiters, nobody else in the room besides the person described")
TRUCK = "next to one old faded green pickup truck with a flat front tire, the only vehicle in the shot"
# Anclas de identidad y ropa (vestuario fijo, todo pasa el mismo día). NADIE lleva sombrero ni lentes (QA reten/medalla/fierro c17/chocolate c30: sombreros dobles o flotando;
# reten-sierra-p2: lentes que entran y salen). Manos abiertas, nadie señala con el dedo (QA canasta c18). Sin uniformes, sin gafetes ni letras en la ropa (QA canasta c28, camionero c33).
# QA suegra c09/c27, buen-hijo-p2 c26, tele-nueva c07: ropa o peinado que cambian -> ropa y peinado descritos completos en CADA plano.
ISA = ("@{ISABELA_VALDIVIA} (30-year-old Mexican woman, light skin, beautiful proud face, long wavy dark brown hair worn loose over her shoulders, no hat, no glasses, "
       "fitted red knee-length cocktail dress with thin straps, small gold hoop earrings, her hands kept low, she never points a finger at anyone)")
BEA = ("@{BEATRIZ_VALDIVIA} (58-year-old Mexican woman, light skin, elegant stern face, short smooth ash-blonde bob haircut, no hat, no glasses, "
       "emerald green dress with a matching short jacket, one thin gold necklace, her hands kept low, she never points a finger at anyone)")
LOR = ("@{LORENZO_CARRASCO} (62-year-old Mexican man, brown skin, kind weathered face, short grey hair, thick grey moustache, no beard, no hat, no glasses, "
       "clean white guayabera shirt with short sleeves, dark brown trousers, a little dark grease on his fingers, his hands open)")
EST_ = ("@{ESTEBAN_CARRASCO} (32-year-old Mexican man, brown skin, friendly honest face, short black hair, short neat black beard, no hat, no glasses, "
        "navy blue suit jacket, white shirt with an open collar, no tie, his hands open)")
# QA tele-nueva c19/c22, sazon-concha i1, buen-hijo c29, chocolate-rancho-p2 (sobre lacrado): utilería duplicada o inventada -> cada objeto, uno solo, simple y nombrado;
# ninguna carpeta, sobre ni papel en la historia. QA mecanico c07 / suegra c11: objeto que cambia de mano -> siempre en la MISMA mano.
PHONE = "one black smartphone held in his RIGHT hand to his right ear, its screen turned away from the camera"
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
# QA posada c09/c16 / regreso-20 c06 / camionero c16 / camionetas c28: dobles en el borde -> se nombra lo que NO debe repetirse
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

CLIPS = [
 # 1. Gancho / humillación (estacionamiento de día): Isabela habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Isabela", one(f"Close-up of {ISA} {EST}, standing on the RIGHT by the arched wooden gate, a proud cold look, chin up, she glances down with disgust", "LEFT",
     NODOUBLE("woman in a red dress")), "proud, rude, cold")),
 ("c02", 6, talk("c02", "Lorenzo", one(f"Close-up of {LOR} {EST}, crouching on the LEFT {TRUCK}, he looks up politely, a humble small smile, his open hands resting on his knees", "RIGHT",
     NODOUBLE("man in a white guayabera")), "polite, humble, calm")),
 ("c03", 8, talk("c03", "Isabela", one(f"Close-up of {ISA} {EST}, standing on the RIGHT by the gate, impatient, she rolls her eyes", "LEFT"),
     "impatient, condescending, cold")),
 ("c04", 6, talk("c04", "Lorenzo", one(f"Close-up of {LOR} {EST}, crouching on the LEFT {TRUCK}, calm and patient, a small kind smile", "RIGHT"),
     "patient, kind, calm")),
 ("c05", 8, talk("c05", "Isabela", one(f"Close-up of {ISA} {EST}, standing on the RIGHT by the gate, a mocking laugh, she looks him up and down slowly", "LEFT",
     NODOUBLE("woman in a red dress")), "mocking, cold, sweet")),
 ("c06", 8, talk("c06", "Lorenzo", one(f"Close-up of {LOR} {EST}, standing on the LEFT {TRUCK}, he looks at his own open hands with a little grease on the fingers, then lifts his eyes, dignified", "RIGHT"),
     "dignified, calm, wise")),
 ("c07", 8, talk("c07", "Isabela", one(f"Close-up of {ISA} {EST}, standing on the RIGHT by the gate, she raises her eyebrows, a cold smile", "LEFT"),
     "mocking, condescending, final")),
 ("c08", 8, talk("c08", "Beatriz", one(f"Close-up of {BEA} {EST}, standing on the RIGHT in the open arched gate, impatient, she glances quickly to the side without interest", "LEFT",
     NODOUBLE("blonde woman in a green dress")), "impatient, cold, hurried")),
 ("c09", 8, talk("c09", "Isabela", one(f"Close-up of {ISA} {EST}, standing on the RIGHT by the gate, she turns her head with a little laugh", "LEFT"),
     "amused, dismissive, light")),
 ("c10", 8, talk("c10", "Beatriz", one(f"Close-up of {BEA} {EST}, standing on the RIGHT in the open gate, a superior little smile, she adjusts her short jacket", "LEFT"),
     "condescending, cold, sweet")),
 ("r1", 6, one(f"Close-up of {LOR} {EST}, standing on the LEFT {TRUCK}, in silence, he looks down at his open hands, his eyes shine, he breathes slowly", "RIGHT") + " Slow push-in. No dialogue."),
 # 2. La siembra (el espectador sabe quién es): Lorenzo solo, al celular con su hijo
 ("c11", 8, talk("c11", "Lorenzo", one(f"Close-up of {LOR} {EST}, standing alone on the LEFT {TRUCK}, {PHONE}, a tired warm smile", "RIGHT"),
     "warm, tired, gentle")),
 ("c12", 8, talk("c12", "Lorenzo", one(f"Close-up of {LOR} {EST}, standing alone on the LEFT {TRUCK}, {PHONE}, his smile fades, serious and decided", "RIGHT"),
     "serious, calm, decided")),
 # 3. El comedor privado: lo esperan sin saber quién es
 ("c13", 8, talk("c13", "Esteban", one(f"Close-up of {EST_} {COM}, standing on the RIGHT by the table, a warm happy smile", "LEFT"),
     "warm, happy, proud")),
 ("c14", 6, talk("c14", "Isabela", one(f"Close-up of {ISA} {COM}, sitting on the LEFT at the table, she smooths her hair, a polite tight smile", "RIGHT",
     NODOUBLE("woman in a red dress")), "polite, cold, proud")),
 ("c15", 6, talk("c15", "Beatriz", one(f"Close-up of {BEA} {COM}, sitting on the LEFT at the table, a small mocking smile", "RIGHT",
     NODOUBLE("blonde woman in a green dress")), "mocking, sweet, cold")),
 ("c16", 6, talk("c16", "Esteban", one(f"Close-up of {EST_} {COM}, standing on the RIGHT, his smile fades, curious and worried", "LEFT"),
     "curious, worried, quiet")),
 ("c17", 8, talk("c17", "Isabela", one(f"Close-up of {ISA} {COM}, sitting on the LEFT at the table, she laughs lightly and shrugs", "RIGHT"),
     "amused, dismissive, light")),
 ("c18", 8, talk("c18", "Esteban", one(f"Close-up of {EST_} {COM}, standing on the RIGHT, serious, his face goes still, he lowers his voice", "LEFT"),
     "serious, quiet, worried")),
 ("r2", 6, one(f"Close-up of {ISA} {COM}, sitting on the LEFT at the table, in silence, her smile slowly disappears, her eyes open in worry", "RIGHT") + " Slow push-in. No dialogue."),
 # 4. El giro de poder: el señor del estacionamiento es el papá del novio (entra la cama cálida)
 ("c19", 6, talk("c19", "Lorenzo", one(f"Close-up of {LOR} {COM}, standing on the RIGHT in the arched wooden doorway, calm and serene, a small polite smile", "LEFT",
     NODOUBLE("man in a white guayabera")), "calm, polite, serene")),
 ("c20", 8, talk("c20", "Esteban", one(f"Close-up of {EST_} {COM}, standing on the RIGHT, proud, he lifts his chin, one open hand on his chest", "LEFT"),
     "proud, firm, warm")),
 ("c21", 8, talk("c21", "Isabela", one(f"Close-up of {ISA} {COM}, sitting on the LEFT at the table, her eyes open in shock, she stammers, one hand on her chest", "RIGHT",
     NODOUBLE("woman in a red dress")), "shocked, quiet, stammering")),
 ("c22", 8, talk("c22", "Lorenzo", one(f"Close-up of {LOR} {COM}, standing on the RIGHT in the doorway, calm and serious, he nods slowly", "LEFT"),
     "calm, serious, wise")),
 ("c23", 8, talk("c23", "Beatriz", one(f"Close-up of {BEA} {COM}, sitting on the LEFT at the table, a forced nervous smile, her open hand gestures toward a chair", "RIGHT",
     NODOUBLE("blonde woman in a green dress")), "nervous, sweet, forced")),
 ("c24", 8, talk("c24", "Lorenzo", one(f"Close-up of {LOR} {COM}, standing on the RIGHT in the doorway, a calm small smile, he shakes his head once", "LEFT"),
     "calm, ironic, polite")),
 # 5. El payoff: la pedida se pospone
 ("c25", 8, talk("c25", "Lorenzo", one(f"Close-up of {LOR} {COM}, standing on the RIGHT, serious and dignified, he looks at her calmly", "LEFT"),
     "serious, calm, final")),
 # QA pedida-mano c26 v1: lloraba y la voz se trabó ("humillando y llando", sílaba repetida) -> ojos brillantes pero voz firme y clara, sin sollozos
 ("c26", 8, talk("c26", "Isabela", one(f"Close-up of {ISA} {COM}, sitting on the LEFT at the table, upset and desperate, her eyes shine but she is not sobbing, her voice stays steady", "RIGHT"),
     "upset, pleading, steady and clear, no sobbing, no stutter, every word said once")),
 ("c27", 8, talk("c27", "Esteban", one(f"Close-up of {EST_} {COM}, standing on the RIGHT, firm and moved, he shakes his head softly", "LEFT"),
     "firm, moved, calm")),
 ("c28", 8, talk("c28", "Esteban", one(f"Close-up of {EST_} {COM}, standing on the RIGHT, firm, a sad decided look", "LEFT",
     NODOUBLE("man in a navy suit")), "firm, sad, decided")),
 ("c29", 8, talk("c29", "Beatriz", one(f"Close-up of {BEA} {COM}, sitting on the LEFT at the table, cold and serious, chin up", "RIGHT"),
     "cold, arrogant, firm")),
 ("c30", 8, talk("c30", "Lorenzo", one(f"Close-up of {LOR} {COM}, standing on the RIGHT, calm, a small dignified smile", "LEFT",
     NODOUBLE("man in a white guayabera")), "calm, dignified, a little ironic")),
 ("r3", 6, one(f"Close-up of {ISA} {COM}, sitting on the LEFT at the table, in silence, humiliated, she lowers her eyes and breathes", "RIGHT") + " Slow push-in. No dialogue."),
 # QA pedida-mano c31 v1: salió con vestido blanco floreado (otra ropa) -> se repite el vestido ROJO y se prohíbe el floreado
 ("c31", 6, talk("c31", "Isabela", one(f"Close-up of {ISA} {COM}, sitting on the LEFT at the table, wearing the same plain fitted RED cocktail dress with thin straps as in her reference sheet "
     f"(not white, no flowers, no print), gold hoop earrings visible, ashamed, her eyes shine, she speaks softly", "RIGHT",
     NODOUBLE("woman in a red dress")), "ashamed, soft, quiet")),
 ("c32", 8, talk("c32", "Lorenzo", one(f"Close-up of {LOR} {COM}, standing on the RIGHT in the doorway, kind and serious, a soft sad smile", "LEFT"),
     "kind, wise, serious")),
 # 6. Gancho para la Parte 2 (vuelve el suspenso): Beatriz y Lorenzo se conocían
 ("c33", 8, talk("c33", "Beatriz", one(f"Close-up of {BEA} {ESTD}, standing alone on the RIGHT in the arched gate, nervous, her hands held together low", "LEFT",
     NODOUBLE("blonde woman in a green dress")), "nervous, quiet, emotional")),
 ("c34", 8, talk("c34", "Lorenzo", one(f"Close-up of {LOR} {ESTD}, standing alone on the LEFT {TRUCK}, he turns his head slowly, serious, a calm knowing look", "RIGHT"),
     "calm, serious, knowing")),
 ("r4", 6, one(f"Close-up of {BEA} {ESTD}, standing alone on the RIGHT in the gate, in silence, her face goes pale, she lowers her eyes, worried", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Lorenzo junto a su camioneta, a cámara
 # QA pedida-mano c35 v1: levantaba el índice hacia cámara (~6.5-7.2 s) -> manos abiertas, sin índice, el gesto final es una palma abierta
 ("c35", 10, talk("c35", "Lorenzo", f"Medium close-up of {LOR} {ESTD}, alone {TRUCK}, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, his lips moving clearly; while he speaks he tilts his head, raises his eyebrows, rubs his moustache with one hand, nods and smiles; "
     f"his hands stay open and relaxed the whole time, he never points and never raises an index finger, for the last sentence he only shows one open palm and nods. "
     f"Nobody else in the parking lot.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("defensive", "serious"), ("commanding", "firm"),
        ("ashamed", "humble"), ("humiliated", "quiet"), ("stammering", "quiet"), ("stammers", "pauses"), ("forced", "small"), ("shocked", "surprised"), ("in shock", "in surprise"),
        ("desperate", "worried"), ("pleading", "soft"), ("rude", "proud"), ("goes pale", "goes still"),
        ("eyes wide", "eyes open"), ("eyes open in surprise", "eyes open"), ("condescending", "polite"), ("dismissive", "calm"),
        ("swallows", "breathes"), ("hurt", "sad"), ("grease", "dust"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("disappointed", "serious"), ("cold", "serious"), ("bitter", "serious"),
        ("arrogant", "proud"), ("indignant", "serious"), ("uneasy", "quiet"),
        ("¡", ""), ("!", "."), ("no quiero que mis suegros vean esta basura", "no quiero que mis suegros vean esto"),
        ("Tu papá me está humillando delante de mi familia", "Tu papá me está avergonzando delante de mi familia"),
        ("A esta gente se le ve de lejos lo que es", "A esta gente se le nota de lejos")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family engagement lunch at a hacienda-style restaurant, soft natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{ISABELA_VALDIVIA}", "an elegant Mexican woman"), ("@{BEATRIZ_VALDIVIA}", "an elegant Mexican lady"),
         ("@{LORENZO_CARRASCO}", "a humble Mexican man"), ("@{ESTEBAN_CARRASCO}", "a Mexican man"),
         (" @{LOC_PORTONPEDIDA}", ""), (" @{LOC_COMEDORPEDIDA}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (END, NOSUB y CLEAN quedan, van después del diálogo)
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:  # entorno explícito y tope de 10 min por llamada (flow.js ya corta a los 90 s por video)
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control (regla del usuario): si un clip falla, generar algo neutro para saber si falla el prompt o Flow."""
    # gatito como IMAGEN (no gasta créditos; el video costaba 12-15 por prueba)
    try:
        r = subprocess.run(["node", "src/cli.js", "--count", "1", "--aspect", "9:16", "--out", str(D / "canary"),
                            "A fluffy orange kitten playing with a ball of yarn on a sofa, soft daylight. No text."],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300)
        files = [l for l in r.stdout.splitlines() if l.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))]
    except subprocess.TimeoutExpired:
        files = []
    for x in files: os.remove(x)
    print("CONTROL gatito:", "Flow OK -> el problema es el prompt" if files else "Flow FALLA -> esperar", flush=True)
    return bool(files)

def reload_flow():
    subprocess.run(["node", str(Path(__file__).resolve().parents[2] / "tools" / "flow_reload.js")], capture_output=True, text=True, timeout=120)
    print("RECARGA Flow", flush=True)

def main():
    want = set(sys.argv[1:])
    OUT.mkdir(exist_ok=True)
    for cid, dur, body in CLIPS:
        dst = OUT / f"{cid}.mp4"
        if want and cid not in want: continue
        if dst.exists():
            if not want: continue
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1  # regenerar: guardar la versión anterior
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            files, log = gen(variant(body, k), dur, OUT)
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()  # Flow no se desbloquea esperando: recargar la página
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                reload_flow(); time.sleep(20); continue  # Flow caído: no gastar un intento de redacción
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()

"""Genera los clips de fierro-herradura PARTE 1 (El Fierro de Herradura, video 20, historia ORIGINAL) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / reten-sierra-p2: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA agua-hacienda-p2 c29 / chocolate-rancho-p2 c34 / medalla-mezcal-p2 c01: frase repetida al final -> silencio tras la última palabra
END = "After the last word the person stays silent until the end of the shot."
# QA camionero v1 (c04 c05 c16 c25 c30): "looking at X off-screen" pone a X (o a un doble) en el borde -> TODOS los planos son de una sola persona
# (ONE + ALONE) con la mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder (QA padre-veladoras-p2, canasta c12).
# Geografía fija (solo define hacia dónde mira cada uno):
#   Corral (c01-c10, r1): Jacinta y Lucero a la IZQUIERDA junto a la cerca; Fulgencio y Cristóbal a la DERECHA; Leocadio al CENTRO.
#   Oficina (c11-c21, i1, r2): escritorio con el libro y Eloísa sentada a la IZQUIERDA (Jacinta de pie a su lado); Leocadio al CENTRO; Fulgencio y Cristóbal a la DERECHA.
#   Pista (c22-c29, i2, r3, c30): Jacinta y Lucero a la IZQUIERDA; Leocadio al CENTRO; Cristóbal y Eloísa a la DERECHA.
COR = ("in the wooden cattle pen @{LOC_CORRALFERIA} of a Mexican regional cattle fair, rough wooden fence rails, straw on the dirt floor, warm late afternoon sun; "
       "no signs, no banners with words; no extras, nobody else in the pen besides the people described")
OFI = ("in the small rustic office @{LOC_OFICINAASOC} of the cattle breeders association at the fair, adobe walls, a heavy wooden desk, wooden shelves with old leather ledgers, "
       "warm lamp light; no readable text anywhere, no posters, no framed certificates; no extras, nobody else in the room")
PIS = ("in the covered show ring @{LOC_PISTAFERIA} of the regional cattle fair, raked sand floor, low white wooden railing, warm string lights high above, "
       "empty wooden bleachers far behind and softly out of focus; no signs, no banners with words; no extras, nobody else in the ring")
# Anclas de identidad y ropa (vestuario fijo). Sombreros: cada uno UNO solo, siempre puesto, nunca se lo quita (QA reten/medalla P2: dos sombreros;
# padre-veladoras-p2: sombrero flotando). Cristóbal y Eloísa sin sombrero. Manos abiertas, nadie señala con el dedo.
JAC = ("@{JACINTA_CORRAL} (36-year-old Mexican mestizo woman, brown skin, one long black braid over her shoulder, one single tan straw cowboy hat with a brown leather band worn on her head, "
       "burgundy western shirt with pearl snaps and rolled sleeves, dark blue jeans, brown leather belt with a plain silver buckle, small gold stud earrings, her hands open)")
FUL = ("@{FULGENCIO_ARREDONDO} (62-year-old heavyset Mexican mestizo man, brown skin, thick grey moustache, one single cream felt cowboy hat worn on his head, "
       "chocolate-brown western suit jacket over a white shirt, black bolo tie with a plain silver tip, one gold ring, his hands open and kept low, he never points a finger at anyone)")
CRI = ("@{CRISTOBAL_ARREDONDO} (30-year-old Mexican mestizo man, brown skin, short black hair, completely clean-shaven face with no beard and no moustache, no hat, "
       "sky-blue western shirt, dark jeans, brown belt, his hands empty)")
LEO = ("@{LEOCADIO_JUEZ} (70-year-old Mexican mestizo man, brown weathered skin, white hair, neat white moustache, one single light grey felt cowboy hat worn on his head, "
       "white long-sleeve guayabera with no badge and no lettering, beige trousers, his hands open, he never points a finger at anyone)")
ELO = ("@{ELOISA_REGISTRO} (45-year-old Mexican mestizo woman, light brown skin, black hair in a low ponytail, no glasses, no hat, teal knit cardigan over a white blouse, "
       "black skirt, small silver hoop earrings)")
# QA padre-veladoras-p2 (MEDAL) / medalla-mezcal-p2 / reten-sierra-p2: utilería duplicada -> cada objeto, uno solo
LUC = ("one single black bull @{PROP_TOROLUCERO} with a small white star on its forehead and one horseshoe-shaped brand mark on its left hip, standing calm and still, "
       "tied by a plain rope halter; no second bull and no other animal anywhere")
BOOK = ("one single large old brown leather-bound ledger, open, its handwritten pages too small and faded to read, no logo")
# QA v1 i2: la escarapela salió con letras -> centro liso, sin texto
RIB = ("one single plain solid blue ribbon rosette, its round center button completely blank and smooth, "
       "with no letters, no words, no numbers and no printing anywhere on it")
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
# QA camionero c33: parche con letras legibles -> sombrero liso
PLAINHAT = "the hat is completely plain, with no patch, no logo, no picture and no letters on it"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

CLIPS = [
 # 1. Gancho / humillación en el corral: Fulgencio habla desde el frame 0 (sin plano abierto)
 ("c01", 10, talk("c01", "Fulgencio", one(f"Close-up of {FUL} {COR}, standing on the RIGHT, a proud half smile, chin up, one open hand turned up", "LEFT",
     NODOUBLE("man in a cowboy hat")), "proud, mocking, slow")),
 ("c02", 8, talk("c02", "Jacinta", one(f"Close-up of {JAC} {COR}, standing on the LEFT beside the wooden fence, hurt and dignified, one open hand on her chest", "RIGHT"),
     "hurt, firm, dignified")),
 ("c03", 10, talk("c03", "Cristóbal", one(f"Close-up of {CRI} {COR}, standing on the RIGHT, sure of himself, he opens one hand toward the pen", "LEFT",
     NODOUBLE("man in a blue shirt")), "sure, polite, a little proud")),
 ("c04", 10, talk("c04", "Fulgencio", one(f"Close-up of {FUL} {COR}, standing on the RIGHT, satisfied, he nods and opens both hands low", "LEFT"),
     "satisfied, mocking, commanding")),
 ("c05", 8, talk("c05", "Jacinta", one(f"Close-up of {JAC} {COR}, standing on the LEFT, eyes shining, she lifts her chin", "RIGHT"),
     "hurt, firm, controlled")),
 ("c06", 10, talk("c06", "Fulgencio", one(f"Close-up of {FUL} {COR}, standing on the RIGHT, a cold smile, he shakes his head slowly", "LEFT"),
     "cold, proud, mocking")),
 ("c07", 8, talk("c07", "Jacinta", f"Medium close-up of {JAC} {COR}, standing on the LEFT, eyes shining, one hand resting on the neck of {LUC} beside her; "
     f"{gaze('RIGHT')}; she is the only person in the whole shot, already in place from the very first frame; no hands or arms entering from the edges.",
     "quiet, hurt, then firm")),
 ("r1", 6, one(f"Close-up of {CRI} {COR}, standing on the RIGHT, in silence, uneasy, he lowers his eyes and swallows", "LEFT") + " Slow push-in. No dialogue."),
 # 2. Llega el juez (ya en su lugar desde el frame 0, nunca entra caminando)
 ("c08", 8, talk("c08", "Leocadio", one(f"Close-up of {LEO} {COR}, standing in the CENTER, calm and serious, one open hand raised a little", "RIGHT", PLAINHAT),
     "calm, serious, authoritative")),
 ("c09", 8, talk("c09", "Fulgencio", one(f"Close-up of {FUL} {COR}, standing on the RIGHT, a friendly smile, both hands open low", "LEFT"),
     "friendly, smooth, a little nervous")),
 ("c10", 8, talk("c10", "Leocadio", one(f"Close-up of {LEO} {COR}, standing in the CENTER, firm, he turns his head a little to the LEFT", "LEFT", PLAINHAT),
     "firm, calm, decided")),
 # 3. Oficina de la asociación: el libro de fierros (libro y Eloísa IZQUIERDA; Leocadio CENTRO; Fulgencio y Cristóbal DERECHA)
 ("c11", 8, talk("c11", "Eloísa", one(f"Close-up of {ELO} {OFI}, sitting at the desk on the LEFT with {BOOK} in front of her, she glances down at the page, then up", "RIGHT",
     NODOUBLE("woman in a teal cardigan")), "clear, careful, professional")),
 ("i1", 6, f"Extreme close-up insert {OFI}: {BOOK} lying on the wooden desk, one handwritten page with a small hand-drawn horseshoe shape and faded unreadable ink lines; "
           f"a woman's hand in a teal cardigan sleeve slowly turns the page. No faces, no readable words, no numbers. No dialogue."),
 ("c12", 8, talk("c12", "Leocadio", one(f"Close-up of {LEO} {OFI}, standing in the CENTER, serious, he leans a little toward the desk", "LEFT", PLAINHAT),
     "serious, calm, precise")),
 ("c13", 8, talk("c13", "Eloísa", one(f"Close-up of {ELO} {OFI}, sitting at the desk on the LEFT, she shakes her head slowly, one hand flat on the open ledger", "RIGHT"),
     "clear, sure, calm")),
 ("c14", 6, talk("c14", "Fulgencio", one(f"Close-up of {FUL} {OFI}, standing on the RIGHT, a small smile, both hands open in front of his chest", "LEFT"),
     "smooth, a little nervous")),
 ("c15", 8, talk("c15", "Leocadio", one(f"Close-up of {LEO} {OFI}, standing in the CENTER, firm and calm", "RIGHT", PLAINHAT),
     "firm, calm, final")),
 ("c16", 10, talk("c16", "Cristóbal", one(f"Close-up of {CRI} {OFI}, standing on the RIGHT, surprised and hurt, he frowns slowly", "RIGHT",
     NODOUBLE("man in a cowboy hat")), "surprised, hurt, quiet")),
 ("c17", 6, talk("c17", "Fulgencio", one(f"Close-up of {FUL} {OFI}, standing on the RIGHT, upset, he turns his head to the RIGHT, one hand open low", "RIGHT",
     NODOUBLE("cowboy hat or man in a cowboy hat") + "; nothing hanging on the wall or the shelves behind him, the only hat in the shot is the one on his head"),
     "upset, low, firm")),
 ("c18", 8, talk("c18", "Jacinta", one(f"Close-up of {JAC} {OFI}, standing on the LEFT beside the desk, eyes shining, dignified", "RIGHT"),
     "hurt, firm, slow")),
 ("r2", 6, one(f"Close-up of {FUL} {OFI}, standing on the RIGHT, in silence, his smile slowly disappears and he lowers his eyes", "LEFT") + " Slow push-in. No dialogue."),
 ("c19", 10, talk("c19", "Leocadio", one(f"Close-up of {LEO} {OFI}, standing in the CENTER, firm and fair, he nods once", "RIGHT", PLAINHAT),
     "firm, fair, authoritative")),
 ("c20", 8, talk("c20", "Fulgencio", one(f"Close-up of {FUL} {OFI}, standing on the RIGHT, upset, his jaw tight, hands open low", "LEFT"),
     "upset, low, proud")),
 ("c21", 6, talk("c21", "Leocadio", one(f"Close-up of {LEO} {OFI}, standing in the CENTER, calm, a tiny serious smile", "RIGHT", PLAINHAT),
     "calm, dry, final")),
 # 4. Payoff en la pista (cama cálida): Lucero gana
 ("c22", 8, talk("c22", "Leocadio", one(f"Close-up of {LEO} {PIS}, standing in the CENTER, proud and warm, one open hand raised toward the ring", "LEFT", PLAINHAT),
     "warm, proud, announcing")),
 ("i2", 6, f"Close-up insert {PIS}: {RIB} is hung by a woman's hands in a burgundy shirt sleeve on the plain rope halter of {LUC}; the bull stays calm. "
           f"Only the hands and the bull's head and neck are visible, no faces. No dialogue."),
 ("c23", 6, talk("c23", "Jacinta", one(f"Close-up of {JAC} {PIS}, standing on the LEFT, eyes shining, a grateful smile, one hand on her chest", "RIGHT"),
     "moved, grateful, warm")),
 ("c24", 6, talk("c24", "Leocadio", one(f"Close-up of {LEO} {PIS}, standing in the CENTER, a warm smile, he nods", "LEFT", PLAINHAT),
     "warm, kind, proud")),
 ("c25", 8, talk("c25", "Cristóbal", one(f"Close-up of {CRI} {PIS}, standing on the RIGHT, humble, his hands joined in front of him, he lowers his eyes, then looks up", "LEFT"),
     "humble, sincere, quiet")),
 ("c26", 6, talk("c26", "Jacinta", one(f"Close-up of {JAC} {PIS}, standing on the LEFT, calm and kind, a small nod", "RIGHT"),
     "calm, kind, firm")),
 # 5. Gancho para la Parte 2
 ("c27", 8, talk("c27", "Eloísa", one(f"Close-up of {ELO} {PIS}, standing on the RIGHT holding {BOOK} open against her chest, worried, she lowers her voice", "LEFT"),
     "worried, low, careful")),
 ("c28", 8, talk("c28", "Leocadio", one(f"Close-up of {LEO} {PIS}, standing in the CENTER, looking down at {BOOK} in his open hands, serious, then he looks up", "LEFT", PLAINHAT),
     "serious, slow, surprised")),
 ("c29", 10, talk("c29", "Jacinta", one(f"Close-up of {JAC} {PIS}, standing on the LEFT, her warm smile disappears, surprised, eyes shining", "RIGHT"),
     "surprised, hurt, low")),
 ("r3", 6, one(f"Close-up of {JAC} {PIS}, standing on the LEFT, in silence, she stays very still, her eyes open wide, thinking", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Jacinta junto a Lucero en el corral, a cámara
 ("c30", 10, talk("c30", "Jacinta", f"Medium close-up of {JAC} {COR}, alone, standing beside {LUC}, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, her lips moving clearly; while she speaks she adjusts the brim of her hat, nods, tilts her head, smiles and pats the bull's neck with one open hand. "
     f"The pen behind her is empty, no other people; {PLAINHAT}.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("defensive", "serious"), ("commanding", "firm"),
        ("ashamed", "humble"), ("stammering", "quiet"), ("fake polite", "polite"), ("forced", "small"), ("eyes wide", "eyes open"), ("eyes open wide", "eyes open"),
        ("jaw tight", "serious face"), ("swallows", "breathes"), ("hurt", "sad"), ("heavyset", "broad"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("disappointed", "serious"), ("nervous", "quiet"), ("cold", "serious"), ("bitter", "serious"),
        ("arrogant", "proud"), ("indignant", "serious"), ("defeated", "quiet"), ("brand mark", "white mark"),
        ("¡", ""), ("!", "."), ("quitar", "llevar"), ("se quedó con él", "lo tomó")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican countryside cattle fair, warm soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican ranch drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{JACINTA_CORRAL}", "a Mexican ranch woman"), ("@{FULGENCIO_ARREDONDO}", "a Mexican rancher"),
         ("@{CRISTOBAL_ARREDONDO}", "a Mexican man"), ("@{LEOCADIO_JUEZ}", "a Mexican cattle fair judge"),
         ("@{ELOISA_REGISTRO}", "a Mexican office clerk"), ("@{PROP_TOROLUCERO}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Extreme close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (END y NOSUB quedan, van después del diálogo)
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

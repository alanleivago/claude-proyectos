"""Genera los clips de monedas-carretera PARTE 1 (La Gasolinera, historia propia tipo CAPOS, premisa 7 de fuentes/atrium-vista/resumen.md, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / buen-hijo-p2 c27 / mecanico c25 / regreso-20 c25: subtítulos quemados -> al final de cada clip con diálogo
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA nochebuena c18 / regreso-20 c25 / sazon-concha c16: letras en la franja inferior -> CLEAN después de NOSUB
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA agua-hacienda-p2 c13 / regreso-20 c28: frase repetida al final -> silencio tras la última palabra; QA regreso-20 c14/c22: 2ª frase perdida -> 8 s para dos frases
END = "After the last word the person stays silent until the end of the shot."
# Regla camionero v1: TODOS los planos hablados son de una sola persona (ONE + ALONE) con la mirada a un lado SIN nombrar al otro (gaze). Nada de over-the-shoulder.
# QA regreso-20 c26: nadie entra a cuadro -> "already in place from the very first frame" (va en ALONE).
# Fórmula capos (resumen atrium-vista): gancho visual en 0-2 s (Kevin vacía el monedero del anciano en el piso) con cifra y plazo (mil doscientos, "un minuto");
# poder SIN armas: convoy de siete camionetas, escoltas de manos cruzadas, radio. Insertos i* sin caras y reacciones mudas r* para el ritmo de <=2 s por plano.
# Distinta de camionetas / pedida-mano / canasta: Amador no se disfraza ni pone a prueba a nadie; paga con las monedas de su difunta y el castigo es recogerlas una por una.
# Geografía fija (solo define hacia dónde mira cada uno), toda la pieza en la gasolinera:
#   Amador a la IZQUIERDA junto a su troca blanca vieja; Kevin a la DERECHA junto a la bomba. Amador mira a la DERECHA (Kevin, Memo); a la IZQUIERDA cuando habla con Benigno.
#   Memo al CENTRO, detrás de la bomba: mira a la DERECHA hacia Kevin; a la IZQUIERDA hacia Amador (c29).
#   Benigno a la IZQUIERDA junto a las camionetas negras, detrás de Amador: mira a la DERECHA. Kevin siempre mira a la IZQUIERDA. CTA (c35): Amador solo, a cámara.
# Hojas de locación SIMPLES (lección intercambio: Omni copia cada detalle de la hoja en todos los planos): sin marcas, sin precios, sin números, sin letreros.
GAS = ("at the small roadside gas station @{LOC_GASCARRETERA} on a desert highway in the golden afternoon: two plain grey fuel pumps under a plain white canopy, "
       "grey concrete ground, dry hills far behind; warm golden light; no logos, no brand colors, no price signs, no numbers, no readable text; "
       "no extras, nobody else at the station besides the person described")
# Anclas de identidad y ropa. Solo Amador lleva barba blanca y sombrero claro; solo Benigno sombrero negro y bigote; Kevin de rojo, Memo de azul marino. Nadie con lentes.
# Manos abiertas, nadie señala con el dedo. Sin gafetes, logos ni letras en la ropa. Ropa y peinado descritos completos en CADA plano (QA suegra c09/c27).
AMA = ("@{AMADOR_QUINTANAR} (72-year-old Mexican man, tan weathered skin, serene dignified face, short neat white beard, cream straw cowboy hat, no glasses, "
       "plain white long-sleeved shirt under a brown leather vest, his hands kept low and calm)")
KEV = ("@{KEVIN_BARRON} (29-year-old Mexican man, light brown skin, cocky face, gelled spiky black hair, clean-shaven, no hat, no glasses, "
       "plain red work polo shirt with no logo and no name tag, black trousers, his hands kept low, he never points a finger at anyone)")
MEM = ("@{MEMO_RANGEL} (23-year-old Mexican man, clearly an adult, brown skin, kind shy face, short curly brown hair, clean-shaven, no hat, no glasses, "
       "plain navy blue work shirt with no logo and no name tag, sleeves rolled up, grey trousers, his hands kept low)")
BEN = ("@{BENIGNO_ARTEAGA} (52-year-old Mexican man, dark tan skin, serious calm face, thick black mustache, black felt cowboy hat, no glasses, "
       "black denim jacket over a plain grey shirt, one black handheld radio clipped to his chest, his hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano (QA mecanico c07 / suegra c11).
PURSE = "one small worn brown leather coin purse"
PURSEH = "one small worn brown leather coin purse held in his LEFT hand"
COIN = "one old silver and gold ten-peso coin with a tiny cross scratched on it"
TRUCK = "one old faded white pickup truck parked behind him"
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
# QA posada c09/c16 / camionetas c28: dobles en el borde -> se nombra lo que NO debe repetirse
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

AL = f"standing on the LEFT, {TRUCK}"                         # Amador
KR = "standing on the RIGHT beside a plain grey fuel pump"     # Kevin
MC = "standing in the CENTER behind a plain grey fuel pump"    # Memo
BL = "standing on the LEFT in front of a black SUV with no logo"  # Benigno

CLIPS = [
 # 1. Gancho (0-2 s): las monedas al piso, precio y plazo
 ("i01", 6, f"Close-up insert {GAS}: a hand in a red work polo sleeve turns {PURSE} upside down; dozens of coins fall and scatter on the grey concrete beside a plain grey fuel pump. "
            f"Only the hand and the coins, no faces. No dialogue."),
 ("c01", 8, talk("c01", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, a mocking cold smile", "LEFT",
     NODOUBLE("man in a red polo shirt")), "mocking, cold, impatient, he says every sentence in full with a short breath between sentences, and only then stays silent")),
 ("c02", 8, talk("c02", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, calm and dignified, he looks down at the ground and back up", "RIGHT",
     NODOUBLE("old man in a straw cowboy hat")), "calm, dignified, low")),
 ("c03", 6, talk("c03", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, he shrugs, dismissive", "LEFT"),
     "dismissive, arrogant")),
 ("r1", 6, one(f"Close-up of {MEM} {GAS}, {MC}, in silence, he looks down at the coins on the ground, ashamed, his jaw tight", "RIGHT",
     NODOUBLE("young man in a navy blue shirt")) + " Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Memo", one(f"Close-up of {MEM} {GAS}, {MC}, shy but decided, he speaks low", "RIGHT"),
     "shy, sincere, quiet")),
 ("c05", 6, talk("c05", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, he turns his head sharply, annoyed", "LEFT"),
     "annoyed, cold, firm")),
 ("c06", 6, talk("c06", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, serious and calm, he does not raise his voice", "RIGHT"),
     "serious, calm, firm")),
 ("c07", 6, talk("c07", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, a proud smile, he crosses his arms", "LEFT"),
     "arrogant, mocking")),
 ("i02", 6, f"Extreme close-up insert {GAS}: an old weathered hand in a white shirt sleeve picks up coins one by one from the grey concrete and puts them back into {PURSE}. "
            f"Only the hand, no faces. No dialogue."),
 # 2. Momento cálido: las monedas de su esposa
 ("c08", 8, talk("c08", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, {PURSEH}, his eyes shine, a soft sad smile", "RIGHT"),
     "tender, quiet, moved")),
 ("c09", 8, talk("c09", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, {PURSEH}, he presses the purse gently against his chest", "RIGHT"),
     "tender, warm, quiet")),
 ("c10", 6, talk("c10", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, he laughs once, mocking", "LEFT"),
     "mocking, cruel, amused")),
 ("r2", 6, one(f"Close-up of {AMA} {GAS}, {AL}, in silence, he looks toward the highway, he touches the brim of his straw hat, a small calm smile", "RIGHT") + " Slow push-in. No dialogue."),
 # 3. El convoy: siete camionetas que no son clientes cualquiera
 ("i03", 6, f"Aerial drone shot over the empty desert highway @{{LOC_TRAMODESIERTO}} in the golden afternoon: seven black SUVs with no logos drive in a line toward a small roadside gas station, "
            f"raising a long cloud of dust. No people visible. No dialogue."),
 ("c11", 8, talk("c11", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, he looks toward the highway, pleased, rubbing his hands", "LEFT"),
     "pleased, greedy, quick")),
 ("c12", 6, talk("c12", "Memo", one(f"Close-up of {MEM} {GAS}, {MC}, worried, he looks toward the highway and back", "RIGHT"),
     "worried, quiet")),
 ("i04", 6, f"Wide shot {GAS}: seven black SUVs with tinted windows stop in a line beside the plain grey fuel pumps, all doors closed, dust settling; "
            f"no people visible, no logos, no license plates. No dialogue."),
 ("c13", 6, talk("c13", "Benigno", one(f"Close-up of {BEN} {GAS}, {BL}, calm and serious, he stays still", "RIGHT",
     NODOUBLE("man in a black felt hat")), "calm, respectful, low")),
 ("c14", 8, talk("c14", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, calm, a small dry smile, he glances to his side", "LEFT"),
     "calm, dry, a little amused")),
 ("r3", 6, one(f"Close-up of {KEV} {GAS}, {KR}, in silence, his smile freezes, he looks at the black SUVs, worried", "LEFT") + " Slow push-in. No dialogue."),
 ("c15", 6, talk("c15", "Benigno", one(f"Close-up of {BEN} {GAS}, {BL}, he turns his eyes slowly, serious", "RIGHT"),
     "serious, cold, slow")),
 ("c16", 6, talk("c16", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, nervous, a forced smile, his hands open and low", "LEFT"),
     "nervous, quick, forced")),
 ("c17", 6, talk("c17", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, calm, he tilts his head", "RIGHT"),
     "calm, firm")),
 ("c18", 6, talk("c18", "Benigno", one(f"Close-up of {BEN} {GAS}, {BL}, one hand on the radio at his chest, serious", "RIGHT"),
     "serious, low, ready")),
 ("i05", 6, f"Medium wide shot {GAS}: five men in plain dark grey shirts and jeans stand still in a row beside the black SUVs, hands crossed in front of them, calm faces, "
            f"no hats; nobody moves, no weapons. No dialogue."),
 ("c19", 6, talk("c19", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, he raises one open hand a little, calm", "LEFT"),
     "calm, quiet, in charge")),
 # 4. Quién es: media carretera y el terreno de la gasolinera
 ("c20", 6, talk("c20", "Memo", one(f"Close-up of {MEM} {GAS}, {MC}, he speaks low and fast, wide eyes", "RIGHT",
     NODOUBLE("young man in a navy blue shirt")), "worried, a whisper, quick")),
 ("c21", 6, talk("c21", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, defensive, he raises his chin", "LEFT"),
     "defensive, proud")),
 ("c22", 6, talk("c22", "Memo", one(f"Close-up of {MEM} {GAS}, {MC}, serious, he nods slowly", "RIGHT"),
     "serious, quiet")),
 ("c23", 6, talk("c23", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, worried, pleading, his hands open and low", "LEFT"),
     "pleading, worried")),
 ("c24", 6, talk("c24", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, calm, he looks down at the ground and back at him", "RIGHT"),
     "calm, firm, slow")),
 ("c25", 6, talk("c25", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, serious, his eyes fixed", "RIGHT"),
     "serious, final, low")),
 ("i06", 6, f"Close-up insert {GAS}: two hands with bare forearms below the SHORT sleeves of a red polo shirt pick up scattered coins quickly from the grey concrete under a plain grey fuel pump. "
            f"One single continuous close-up from the very first frame to the last, no cuts, no wide shot. Only the hands and the coins, no faces. No dialogue."),
 ("r4", 6, one(f"Close-up of {KEV} {GAS}, crouching on the RIGHT beside a plain grey fuel pump, in silence, sweating, he looks up, worried", "LEFT") + " Slow push-in. No dialogue."),
 # 5. La cuenta atrás y la moneda de la cruz
 ("c26", 6, talk("c26", "Benigno", one(f"Close-up of {BEN} {GAS}, {BL}, he glances at the coins on the ground, calm", "RIGHT"),
     "calm, cold, low")),
 ("c27", 6, talk("c27", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, out of breath, nervous", "LEFT"),
     "nervous, out of breath")),
 ("c28", 8, talk("c28", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, {PURSEH}, he looks inside the purse, serious", "RIGHT"),
     "serious, quiet, sad")),
 ("i07", 6, f"Extreme close-up insert {GAS}: a young man's open palm in a navy blue sleeve slowly shows {COIN}. Only the hand and the coin, no faces. No dialogue."),
 ("c29", 6, talk("c29", "Memo", one(f"Close-up of {MEM} {GAS}, {MC}, shy, he holds out his open hand", "LEFT"),
     "shy, sincere, quiet")),
 ("c30", 6, talk("c30", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, moved, a warm smile, his eyes shine", "RIGHT"),
     "warm, grateful, moved")),
 ("c31", 6, talk("c31", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, warm and firm, he nods", "RIGHT"),
     "warm, firm")),
 # 6. Gancho Parte 2: el dueño es el papá de Kevin y Amador ya lo sabía
 ("c32", 6, talk("c32", "Kevin", one(f"Close-up of {KEV} {GAS}, {KR}, standing up straight again, a confident smile returns", "LEFT",
     NODOUBLE("man in a red polo shirt")), "confident, defiant, smug")),
 ("c33", 6, talk("c33", "Benigno", one(f"Close-up of {BEN} {GAS}, {BL}, he lowers his head to the radio at his chest and listens, then looks up", "RIGHT"),
     "calm, low")),
 ("c34", 6, talk("c34", "Amador", one(f"Close-up of {AMA} {GAS}, {AL}, a slow knowing smile", "RIGHT"),
     "calm, knowing, low")),
 ("r5", 6, one(f"Close-up of {KEV} {GAS}, {KR}, in silence, his smile fades, confused, he looks toward the highway", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Amador junto a su troca, a cámara
 ("c35", 10, talk("c35", "Amador", f"Medium close-up of {AMA} {GAS}, alone, standing in front of {TRUCK.replace(' parked behind him', '')}, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, his lips moving clearly; while he speaks he adjusts the brim of his straw hat, tilts his head, raises his eyebrows, nods and smiles. "
     f"Nobody else at the station.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly"), ("turns his head sharply", "turns his head")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"),
        ("arrogant", "proud"), ("greedy", "pleased"), ("defiant", "sure"), ("forced", "small"), ("ashamed", "quiet"), ("nervous", "quiet"), ("pleading", "sincere"),
        ("impatient", "serious"), ("out of breath", "tired"), ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"),
        ("controlled", "calm"), ("dismissive", "calm"), ("cold", "serious"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"),
        ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"),
        ("¡", ""), ("!", "."), ("Vaya a llorar a otra gasolinera.", "Vaya a contarlo a otra gasolinera."), ("¿Le cerramos la carretera, patrón?", "¿Les aviso a los muchachos, patrón?"),
        ("Los muchachos ya están en posición.", "Los muchachos ya están listos."), ("Tú te callas, Memo.", "Tú no te metas, Memo."), ("O te vas con él, a pie.", "O te vas con él.")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a small roadside gas station on a Mexican desert highway, warm golden afternoon light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis (también quita las hojas de locación)
NOREF = [("@{AMADOR_QUINTANAR}", "an old Mexican rancher"), ("@{KEVIN_BARRON}", "a Mexican gas station manager"),
         ("@{MEMO_RANGEL}", "a Mexican gas station attendant"), ("@{BENIGNO_ARTEAGA}", "a Mexican ranch foreman"),
         (" @{LOC_GASCARRETERA}", ""), (" @{LOC_TRAMODESIERTO}", "")]
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

def new_project():
    subprocess.run(["node", "src/cli.js", "project", "new"], cwd=MCP, capture_output=True, text=True, timeout=180)
    pid = subprocess.run(["node", "src/cli.js", "project"], cwd=MCP, capture_output=True, text=True, timeout=60).stdout.strip()
    subprocess.run(["node", str(Path(__file__).resolve().parents[2] / "tools" / "flow_tabs.js"), "--close-extra", pid], capture_output=True, text=True, timeout=60)
    subprocess.run([sys.executable, "-I", "make_sheets.py", "--reupload"], cwd=D, capture_output=True, text=True, timeout=1800)
    print("PROYECTO NUEVO", pid, "(hojas resubidas)", flush=True)

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
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"  # MP4 que no decodifica: reintentar
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()  # Flow no se desbloquea esperando: recargar la página
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                global CAIDAS; CAIDAS = globals().get("CAIDAS", 0) + 1
                if CAIDAS >= 2: new_project(); CAIDAS = 0  # recargar no bastó: proyecto nuevo + volver a subir hojas
                else: reload_flow()
                time.sleep(20); continue
            CAIDAS = 0  # Flow caído: no gastar un intento de redacción
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()

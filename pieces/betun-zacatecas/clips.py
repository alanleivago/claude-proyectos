"""Genera los clips de betun-zacatecas PARTE 1 (El Bolero de Zacatecas, remake transformado de "Lo dejó por vender empanadas… sin saber que él heredaría todo" de @atriumstories_, Zacatecas, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de plata-taxco (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
END = "After the last word the person stays silent until the end of the shot."
# Gancho 0-2 s: los dedos con betún lustrando un zapato en el estribo de la caja azul y la carpeta roja que cae encima (i01); Noemí con el plazo: "Fírmalo antes de las doce campanadas."
# Plazo: las doce campanadas de la catedral (i02). Inversión: el divorcio sigue sin firmar y "ahora yo decido cuándo" (c31).
# Herencia (sin cifras de dinero): don Rosalío Bañuelos, el viejito al que Apolinar le boleó las botas doce años sin cobrarle cuando no traía, le dejó los Hoteles Bañuelos (c16-c22).
# Giro: la firma de la carpeta roja es de la gerente del hotel de la plaza (Noemí) y el amante, Fabricio, quiso comprarle los hoteles a don Rosalío (c29-c33). Castigo para la Parte 2.
# Geografía: 1) Plaza de Armas de Zacatecas (media mañana, la catedral de cantera rosa al fondo): Apolinar sentado a la IZQUIERDA en su banquito junto a la caja azul; Noemí al CENTRO-DERECHA;
#   Fabricio a la DERECHA un paso atrás de ella; el notario Teódulo (desde c14) al CENTRO. 2) Notaría (c23-c33): Teódulo a la DERECHA tras su escritorio; Apolinar a la IZQUIERDA en un sillón de cuero.
# Un plano de presentación por personaje (plano medio con la ropa completa): Noemí c01, Apolinar c02, Fabricio c05, Teódulo c14. CTA (c34): Apolinar solo junto a su caja en la plaza, a cámara. Sin Navidad.
PLZ0 = ("in the Plaza de Armas of Zacatecas @{LOC_PLAZAZAC} on a sunny late morning: the ornate baroque pink cantera stone facade of the Zacatecas cathedral behind, colonial pink stone buildings, "
        "iron benches and laurel trees, a shoeshine stand with a small wooden bench and a green canvas umbrella; no readable text, no signs, no logos")
PLZ = PLZ0 + "; nobody else in the background, no extras, nobody besides the person described"
NOT = ("inside a notary office in Zacatecas @{LOC_NOTARIAZAC} at midday: dark wooden bookshelves full of thick bound volumes, a big wooden desk, a brown leather armchair, "
       "a tall window with a view of the rocky Cerro de la Bufa hill; no readable text, no signs, no logos; nobody else in the background, nobody besides the person described")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Apolinar barba entrecana, camisa de mezclilla y mandil con betún; solo Noemí saco mostaza y luces miel; solo Fabricio traje gris claro de tres piezas,
# corbata vino y lentes oscuros sobre la cabeza; solo Teódulo pelo blanco, lentes redondos de carey y traje carbón.
APO = ("@{APOLINAR_ESCAMILLA} (46-year-old Mexican man from Zacatecas, brown skin, medium build, short curly black hair with some grey, a short salt-and-pepper beard, no hat, no glasses, "
       "a faded light-blue denim shirt with rolled sleeves under a brown canvas apron stained with black shoe polish, black polish on his fingertips, his hands kept low)")
NOE = ("@{NOEMI_MONREAL} (41-year-old Mexican woman, light-brown skin, slim, long straight dark brown hair with honey highlights, small gold hoop earrings, a thin gold chain, "
       "a mustard-yellow blazer over a black blouse, black trousers, her hands kept low)")
FAB = ("@{FABRICIO_URQUIDI} (44-year-old Mexican man, light skin, tall, black hair slicked back, a neatly trimmed black beard, dark sunglasses pushed up on his head, "
       "a light-grey three-piece suit, a burgundy tie, gold cufflinks, his hands in his trouser pockets)")
TEO = ("@{TEODULO_ARIZPE} (63-year-old Mexican man, brown skin, slim, white hair combed back, clean-shaven, round tortoiseshell glasses, a charcoal-grey suit, a white shirt, a navy-blue tie, "
       "his hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
BOX = "a wooden shoeshine box painted bright blue with a brass footrest on top"
FOLDER_R = "one red cardboard folder"
FOLDER_G = "one dark-green leather folder"
BOOTS = "a pair of worn ox-blood leather cowboy boots with silver toe tips"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
PRES = ("presentation shot: a single-person medium shot from the knees up that shows the whole outfit clearly, NOT an over-the-shoulder shot, "
        "no foreground figure and nobody else at the edges of the frame")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

AL = f"sitting on the LEFT on a small wooden bench at his shoeshine stand, {BOX} on the stones in front of him"                  # Apolinar en la plaza
NR = f"standing at the CENTER-RIGHT of the plaza, {FOLDER_R} held in her LEFT hand"                                              # Noemí
FR = "standing on the RIGHT one step behind, the cathedral facade behind him"                                                     # Fabricio
TC = f"standing in the CENTER of the plaza, {FOLDER_G} held against his chest with his LEFT hand"                                 # Teódulo en la plaza
TD = f"sitting on the RIGHT behind a big wooden desk, {FOLDER_G} open in front of him"                                            # Teódulo en la notaría
AN = "sitting on the LEFT in a brown leather armchair in front of the desk, his canvas apron still on"                            # Apolinar en la notaría

CLIPS = [
 # 1. Gancho (0-2 s): el zapato, la carpeta roja y el plazo de las doce campanadas
 ("i01", 6, f"Close-up insert {PLZ0}: fingertips stained with black shoe polish buff a black leather shoe resting on the brass footrest of {BOX} with a soft cloth; "
            f"{FOLDER_R} drops onto the lid of the box from above, a woman's slim hand with small gold rings lets it go. Only the hands, the shoe, the box and the folder, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Noemí", f"Medium shot of {NOE} {PLZ}, {NR}, cold and in a hurry, she looks down at the man sitting at the shoeshine stand, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a mustard blazer')}.", "cold, hurried, cutting")),
 ("c02", 6, talk("c02", "Apolinar", f"Medium shot of {APO} {PLZ}, {AL}, his smile freezing, he looks up from his work holding a small clay cup of coffee, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a polish-stained apron')}.", "confused, gentle, warm")),
 ("c03", 6, talk("c03", "Noemí", one(f"Close-up of {NOE} {PLZ}, {NR}, she looks at his hands with disgust", "LEFT"),
     "disgusted, cold")),
 ("c04", 6, talk("c04", "Apolinar", one(f"Close-up of {APO} {PLZ}, {AL}, he glances at the tall man behind her, his face turns serious", "RIGHT"),
     "serious, slow, hurt")),
 ("c05", 6, talk("c05", "Fabricio", f"Medium shot of {FAB} {PLZ}, {FR}, a smug smile, he barely looks at the man on the bench, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a light-grey suit')}.", "smug, arrogant, smooth")),
 ("c06", 6, talk("c06", "Noemí", one(f"Close-up of {NOE} {PLZ}, {NR}, she looks away toward the cathedral, ashamed and cold", "LEFT"),
     "cold, ashamed, sharp")),
 ("c07", 6, talk("c07", "Apolinar", one(f"Close-up of {APO} {PLZ}, {AL}, he puts one polish-stained hand on the blue box, hurt", "RIGHT"),
     "hurt, quiet, firm")),
 ("c08", 6, talk("c08", "Noemí", one(f"Close-up of {NOE} {PLZ}, {NR}, she lifts her chin, proud", "LEFT"),
     "proud, cutting")),
 ("c09", 6, talk("c09", "Apolinar", one(f"Close-up of {APO} {PLZ}, {AL}, he turns his eyes to the tall man, calm and dignified", "RIGHT"),
     "calm, dignified, a little ironic")),
 ("c10", 6, talk("c10", "Fabricio", one(f"Close-up of {FAB} {PLZ}, {FR}, he sniffs the air and smiles with contempt", "LEFT"),
     "arrogant, mocking")),
 ("c11", 6, talk("c11", "Apolinar", one(f"Close-up of {APO} {PLZ}, {AL}, he shows his polish-stained hands for a second, his eyes shine", "RIGHT"),
     "hurt, sincere, low")),
 ("c12", 6, talk("c12", "Noemí", one(f"Close-up of {NOE} {PLZ}, {NR}, she taps the red folder with one finger, impatient", "LEFT"),
     "impatient, cold")),
 ("i02", 6, f"Low-angle shot of the ornate pink cantera stone bell tower of the Zacatecas cathedral against a clear blue sky at noon: the big bronze bells begin to swing. "
            f"No people, no letters. No dialogue."),
 ("c13", 6, talk("c13", "Fabricio", one(f"Close-up of {FAB} {PLZ}, {FR}, he glances up at the bell tower, then waves his hand in front of his nose, mocking", "LEFT"),
     "mocking, smooth")),
 ("r1", 6, one(f"Close-up of {APO} {PLZ}, {AL}, in silence, he looks down at the red folder on his blue box, unsigned, his jaw tight, the bells ringing", "RIGHT") + " Slow push-in. No dialogue."),
 # 2. Llega el notario
 ("c14", 6, talk("c14", "Teódulo", f"Medium shot of {TEO} {PLZ}, {TC}, formal and serious, he looks down at the man on the bench, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a charcoal suit')}.", "formal, serious, calm")),
 ("c15", 6, talk("c15", "Apolinar", one(f"Close-up of {APO} {PLZ}, {AL}, he wipes his hands on his apron, polite, a little confused", "RIGHT"),
     "polite, humble")),
 ("c16", 6, talk("c16", "Teódulo", one(f"Close-up of {TEO} {PLZ}, {TC}, he takes off his round glasses for a second, sad", "LEFT"),
     "sad, calm, low")),
 ("c17", 6, talk("c17", "Apolinar", one(f"Close-up of {APO} {PLZ}, {AL}, surprised and moved, his eyes shine", "RIGHT"),
     "surprised, moved, low")),
 ("i03", 6, f"Close-up insert {PLZ0}: a man's hand with a charcoal-grey sleeve sets {BOOTS} down on the brass footrest of {BOX}. "
            f"Only the hand, the boots and the box, no faces. No dialogue."),
 ("c18", 6, talk("c18", "Teódulo", one(f"Close-up of {TEO} {PLZ}, {TC}, a small warm smile, he nods toward the boots", "LEFT"),
     "warm, slow")),
 ("c19", 6, talk("c19", "Apolinar", one(f"Close-up of {APO} {PLZ}, {AL}, he touches the old boots with tenderness, his eyes wet", "RIGHT"),
     "tender, sad, quiet")),
 ("c20", 6, talk("c20", "Teódulo", one(f"Close-up of {TEO} {PLZ}, {TC}, serious and clear", "LEFT"),
     "serious, clear")),
 ("c21", 6, talk("c21", "Apolinar", one(f"Close-up of {APO} {PLZ}, {AL}, he laughs once in disbelief and pats his blue box", "RIGHT"),
     "disbelieving, humble")),
 ("c22", 6, talk("c22", "Teódulo", one(f"Close-up of {TEO} {PLZ}, {TC}, calm, he does not blink", "LEFT"),
     "calm, firm")),
 # 3. La notaría (música cálida c24-c27)
 ("c23", 6, talk("c23", "Apolinar", one(f"Close-up of {APO} {NOT}, {AN}, overwhelmed, he rubs his forehead with his polish-stained fingers", "RIGHT"),
     "overwhelmed, quick")),
 ("c24", 6, talk("c24", "Teódulo", one(f"Close-up of {TEO} {NOT}, {TD}, warm, he closes the green folder", "LEFT"),
     "warm, sincere")),
 ("c25", 6, talk("c25", "Apolinar", one(f"Close-up of {APO} {NOT}, {AN}, he shakes his head, humble and scared", "RIGHT"),
     "humble, worried")),
 ("c26", 6, talk("c26", "Teódulo", one(f"Close-up of {TEO} {NOT}, {TD}, a small proud smile", "LEFT"),
     "warm, firm")),
 ("c27", 6, talk("c27", "Apolinar", one(f"Close-up of {APO} {NOT}, {AN}, his eyes shine, he lowers his head", "RIGHT"),
     "sad, very low")),
 ("c28", 6, talk("c28", "Teódulo", one(f"Close-up of {TEO} {NOT}, {TD}, back to business, firm", "LEFT"),
     "firm, calm")),
 # 4. Giro: la firma de la carpeta roja
 ("r2", 6, one(f"Close-up of {APO} {NOT}, {AN}, in silence, he places {FOLDER_R} on the desk in front of him and slides it forward slowly", "RIGHT") + " Slow push-in. No dialogue."),
 ("c29", 6, talk("c29", "Teódulo", one(f"Close-up of {TEO} {NOT}, {TD}, he opens {FOLDER_R} and reads, he raises his eyebrows, surprised", "LEFT"),
     "surprised, slow")),
 ("c30", 6, talk("c30", "Teódulo", one(f"Close-up of {TEO} {NOT}, {TD}, he looks up over his round glasses with a small smile", "LEFT"),
     "amused, calm, low")),
 ("c31", 6, talk("c31", "Apolinar", one(f"Close-up of {APO} {NOT}, {AN}, a slow small smile, calm and sure for the first time", "RIGHT"),
     "calm, sure, quiet")),
 ("c32", 6, talk("c32", "Teódulo", one(f"Close-up of {TEO} {NOT}, {TD}, serious again, he leans forward", "LEFT"),
     "serious, low, slow")),
 ("c33", 6, talk("c33", "Apolinar", one(f"Close-up of {APO} {NOT}, {AN}, his smile disappears, he understands, serious", "RIGHT"),
     "surprised, serious, low")),
 # CTA con carisma (después del BLACK): Apolinar solo junto a su caja en la plaza, a cámara
 ("c34", 10, talk("c34", "Apolinar", f"Close-up from the chest up of {APO} {PLZ}, alone, sitting at his shoeshine stand, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a mischievous little smile, makes a short pause, raises one eyebrow, "
     f"taps the lid of his blue shoeshine box twice, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful and mischievous, talking directly to the viewer")),
 ("i06", 6, f"Medium shot of {FAB} {PLZ}, {FR}, he walks two slow steps forward and stops, puts one hand in his trouser pocket, adjusts his cuff and looks down to his LEFT with a smug half smile, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a light-grey suit')}. Slow push-in. In silence, no dialogue, his mouth closed."),  # plano de presentación de Fabricio (antes de c04)
]
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("eyes wet", "eyes shine"), ("with contempt", "coldly")
        ]
# Frases primero: si no, "hurt"/"cold" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Puro betún, como siempre.", "Siempre igual, Apolinar."), ("Y no huelo a betún.", "Y no ando en la plaza."),
        ("Vámonos, se me pega el olor.", "Vámonos ya, mi amor."), ("Y tú sigues hincado en la plaza.", "Y tú sigues en la plaza."),
        ("Me da vergüenza, Apolinar.", "Ya no puedo, Apolinar."), ("Se nos fue anoche.", "Falleció anoche."),
        ("he sniffs the air and smiles", "he smiles"), ("waves his hand in front of his nose, mocking", "smiles"), ("drops onto the lid", "is placed on the lid"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("disgusted", "serious"), ("impatient", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("cutting", "serious"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("overwhelmed", "surprised"), ("mischievous", "friendly"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, sunny late-morning light in the Plaza de Armas of Zacatecas, pink cantera stone cathedral, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a colonial city of pink stone in Zacatecas, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft daylight, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{APOLINAR_ESCAMILLA}", "a Mexican man with a short salt-and-pepper beard in a denim shirt and a brown apron stained with shoe polish"),
         ("@{NOEMI_MONREAL}", "a slim Mexican woman with long honey-highlighted hair in a mustard-yellow blazer"),
         ("@{FABRICIO_URQUIDI}", "a tall Mexican man with slicked-back hair and a trimmed beard in a light-grey three-piece suit and a burgundy tie"),
         ("@{TEODULO_ARIZPE}", "an older Mexican man with white hair and round tortoiseshell glasses in a charcoal suit"),
         (" @{LOC_PLAZAZAC}", ""), (" @{LOC_NOTARIAZAC}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    if "LIMITE DE CREDITOS" in r.stdout: print(r.stdout.strip(), flush=True); sys.exit("FIN por limite de creditos")
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control: gatito como IMAGEN (no gasta créditos)."""
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
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            files, log = gen(variant(body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"
            if files:
                new = Path(files[0]).resolve()  # solo contra los clips ya guardados (c*/i*/r*.mp4), nunca contra la descarga misma
                dup = [p for p in OUT.glob("*.mp4") if re.fullmatch(r"[cir]\d+", p.stem) and p.resolve() != new and p.stat().st_size == Path(files[0]).stat().st_size and _md5(p) == _md5(Path(files[0]))]
                if dup: os.remove(files[0]); files, log = [], f"DUPLICADO md5 de {dup[0].name}"  # Flow devolvió un clip ya bajado
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                global CAIDAS; CAIDAS = globals().get("CAIDAS", 0) + 1
                if CAIDAS >= 2: new_project(); CAIDAS = 0
                else: reload_flow()
                time.sleep(20); continue
            CAIDAS = 0
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()

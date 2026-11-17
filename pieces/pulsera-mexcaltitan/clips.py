"""Genera los clips de pulsera-mexcaltitan PARTE 1 (La Pulsera del Estero, versión nueva y muy transformada de "Llegó buscando a la patrona… secreto de 20 años" (1.6M) de @atriumstories_:
aquí, en la isla de Mexcaltitán, Nayarit, el hijo de la patrona del estero humilla a una muchacha en el muelle y la patrona resulta ser su abuela; MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de sarape-saltillo (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Gancho 0-2 s (c01, el villano hablando, sin plano previo de objetos): Arsenio en el muelle con la cubeta vacía boca abajo y los tamales de Maura flotando detrás: "La última lancha sale a las seis. Y tú te vas en ella, arrimada." (injusticia + plazo).
# Plazo: la lancha de las seis; vuelve invertido cuando llega la patrona: "¿En la de las seis? Qué bueno, porque en esa te vas tú." (c16).
# Capas: los tamales al agua -> "mi madre no recibe arrimadas" (c03) -> Tamara la quiere lejos antes de que llegue la suegra (c07) -> la pulsera de chaquira (i01, c11, r3)
# -> llega la lancha de la patrona antes de tiempo (i02, c13) -> plazo invertido (c16) -> la pulsera la tejió Eustolia para su hijo (c20) -> Maura es hija de Arsenio (c26, c27).
# Herlinda Graciano (la madre de Maura) no sale: solo se nombra.
# Geografía fija (muelle): Arsenio y Tamara a la DERECHA, del lado de tierra junto a la fonda de palma; Maura a la IZQUIERDA, en la orilla del agua; Eustolia baja de su lancha a la IZQUIERDA, junto a Maura.
# Plano de presentación: Arsenio c01, Maura r1, Tamara r2, Eustolia r4. CTA (c28): Eustolia sola en el muelle, a cámara. Sin Navidad. Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio.
DOCK0 = ("on the old wooden dock of the small round island town of Mexcaltitán, Nayarit @{LOC_MUELLEMEXCAL} at sunset: weathered wooden planks, colorful low houses with red tile roofs behind, "
         "wooden canoes and white fiberglass boats tied along the dock, a palm-roof fonda at the land end of the dock, calm green-brown lagoon water and mangroves on the far shore under an orange sky; "
         "no readable text, no signs, no logos")
DOCK = DOCK0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
BRACELET = "a bracelet of tiny blue and yellow glass beads with a small white deer pattern"
BUCKET = "an empty dented tin bucket"
TAMALES = "corn-husk tamales floating in the water"
BOAT = "a long white wooden lancha with a blue stripe and an outboard motor"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Eustolia pelo plateado en chongo con flor de tulipán rojo y vestido azul marino bordado (figura de poder);
# solo Arsenio hombre robusto de barba negra corta y camisa de lino blanca (villano); solo Tamara mujer rubia platinada de vestido rosa mexicano con abanico (traidora);
# solo Maura joven de pelo negro ondulado suelto, blusa turquesa y la pulsera de chaquira en la muñeca IZQUIERDA.
EUS = ("@{EUSTOLIA_LOMELI} (72-year-old Mexican woman, dark-brown wrinkled skin, tall and upright, silver hair in a low bun with a red hibiscus flower behind her right ear, gold hoop earrings, "
       "a navy-blue cotton dress with white embroidery at the neckline, brown leather sandals)")
ARS = ("@{ARSENIO_LOMELI} (47-year-old Mexican man, brown skin, heavyset, short black hair, a short black beard, a white linen shirt half unbuttoned, "
       "khaki trousers, brown leather sandals, a big gold ring on his right hand)")
TAM = ("@{TAMARA_LOMELI} (44-year-old Mexican woman, light skin, platinum-blonde wavy hair to the shoulders, big sunglasses pushed up on her head, "
       "a hot-pink sleeveless dress, gold bangles, a woven palm fan in her right hand)")
MAU = ("@{MAURA_GRACIANO} (24-year-old Mexican woman, brown skin, slim, long wavy black hair worn loose, a faded turquoise cotton blouse, a long white skirt, brown sandals, "
       f"{BRACELET} on her LEFT wrist)")
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

AR = "standing on the dock on the RIGHT, near the palm-roof fonda"                               # Arsenio
TR = "standing on the dock on the RIGHT beside the palm-roof fonda, fanning herself"             # Tamara
ML = f"standing at the water edge of the dock on the LEFT, {BRACELET} on her LEFT wrist"         # Maura
EL = f"standing on the dock on the LEFT, just off her boat, {BOAT} tied behind her"              # Eustolia

CLIPS = [
 # 1. Gancho (0-2 s): Arsenio YA hablando, con la cubeta vacía y los tamales flotando detrás; plazo de la lancha de las seis
 ("c01", 6, talk("c01", "Arsenio", f"Medium shot of {ARS} {DOCK}, {AR}, talking from the very first frame, holding {BUCKET} upside down in his right hand, {TAMALES} behind him beside the dock, "
     f"cold and arrogant, he jerks his chin toward the water; {gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('bearded man in a white shirt')}.", "cold, arrogant, mocking")),
 ("r1", 6, f"Medium shot of {MAU} {DOCK}, {ML}, she looks at the tamales floating in the water, then lifts her chin with dignity, her eyes shine, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young woman in a turquoise blouse')}. Slow push-in. No dialogue."),
 ("c02", 6, talk("c02", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, humble but firm", "RIGHT"),
     "humble, tired, sincere")),
 ("c03", 6, talk("c03", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, he tosses the empty bucket onto the planks, smug", "LEFT"),
     "contemptuous, smug")),
 ("r2", 6, f"Medium shot of {TAM} {DOCK}, {TR}, she looks the girl up and down with a cold little smile, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('blonde woman in a pink dress')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, she speaks sideways, gossiping, suspicious", "LEFT"),
     "gossipy, suspicious, cold")),
 ("c05", 6, talk("c05", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, she holds her LEFT wrist against her chest", "RIGHT"),
     "firm, dignified")),
 ("c06", 6, talk("c06", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, he taps his gold ring, impatient", "LEFT"),
     "impatient, arrogant")),
 ("c07", 6, talk("c07", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, she stops fanning herself, nervous under her smile", "LEFT"),
     "nervous, hurried, cold")),
 ("c08", 6, talk("c08", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, she tilts her head, surprised by the woman's fear", "RIGHT"),
     "calm, curious, firm")),
 ("c09", 6, talk("c09", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, offended, she points her fan toward the water", "LEFT"),
     "offended, cold")),
 ("c10", 6, talk("c10", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, cold and final", "LEFT"),
     "cold, final")),
 # 2. La pulsera (inserto en medio de la pieza)
 ("i01", 6, f"Close-up insert {DOCK0}: a young woman's LEFT hand closes tightly around {BRACELET} on her wrist, the edge of a faded turquoise sleeve, the dock planks below. "
            f"Only the hand, the wrist and the bracelet, no faces. No dialogue."),
 ("c11", 6, talk("c11", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, she lifts her LEFT wrist to show the bracelet, proud and hurt", "RIGHT"),
     "hurt, dignified")),
 ("r3", 6, one(f"Close-up of {ARS} {DOCK}, {AR}, in silence, his eyes catch the bracelet on her wrist, a flicker of memory, he frowns and looks away", "LEFT") + " Slow push-in. No dialogue."),
 ("c12", 6, talk("c12", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, he shrugs it off too fast", "LEFT"),
     "dismissive, uneasy")),
 # 3. Llega la patrona antes de tiempo
 ("i02", 6, f"Wide shot of a calm lagoon at sunset in Nayarit: {BOAT} leads five more wooden lanchas full of men in white shirts and straw hats toward a small round island town with red tile roofs, "
            f"long golden reflections on the water. No faces, no letters, no signs. No dialogue."),
 ("c13", 6, talk("c13", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, she looks out at the lagoon, her fan freezes, worried", "LEFT"),
     "worried, quiet")),
 ("r4", 6, f"Medium shot of {EUS} {DOCK}, {EL}, she has just stepped off her boat onto the planks, she looks around slowly with quiet authority, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old woman in a navy-blue dress')}. Slow push-in. No dialogue."),
 ("c14", 6, talk("c14", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, she glances at the tamales floating in the water, serious", "RIGHT"),
     "calm, serious, authoritative")),
 ("c15", 6, talk("c15", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, he forces a smile at his mother", "LEFT"),
     "nervous, smug")),
 ("c16", 6, talk("c16", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, a slow dry smile, she raises one eyebrow", "RIGHT"),
     "dry, ironic, firm")),
 ("c17", 6, talk("c17", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, stern and calm", "RIGHT"),
     "stern, calm, slow")),
 ("c18", 6, talk("c18", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, she turns to the girl, her face softens", "LEFT"),
     "soft, warm, firm")),
 ("c19", 6, talk("c19", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, she holds out her LEFT wrist with the bracelet, nervous and hopeful", "RIGHT"),
     "nervous, hopeful")),
 # 4. La pulsera: la tejió Eustolia para su hijo
 ("i03", 6, f"Close-up insert {DOCK0}: a young woman's LEFT wrist held out with {BRACELET}, old dark-brown wrinkled fingers gently touch the beads, the hem of a navy-blue embroidered sleeve. "
            f"Only the hands and the bracelet, no faces. No dialogue."),
 ("c20", 6, talk("c20", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, she looks down at the bracelet, moved, her eyes shine", "LEFT"),
     "moved, slow, soft")),
 ("r5", 6, one(f"Close-up of {TAM} {DOCK}, {TR}, in silence, she closes her eyes for a second and looks away, she knew", "LEFT") + " Slow push-in. No dialogue."),
 ("c21", 6, talk("c21", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, sad, she swallows", "RIGHT"),
     "sad, soft")),
 ("c22", 6, talk("c22", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, remembering, she nods slowly", "LEFT"),
     "thoughtful, sad")),
 ("c23", 6, talk("c23", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, she turns her head toward her son, hard and quiet", "RIGHT"),
     "hard, quiet, slow")),
 ("r6", 6, one(f"Close-up of {ARS} {DOCK}, {AR}, in silence, the color leaves his face, he takes half a step back", "LEFT") + " Slow push-in. No dialogue."),
 ("c24", 6, talk("c24", "Arsenio", one(f"Close-up of {ARS} {DOCK}, {AR}, he rubs the back of his neck, avoiding her eyes", "LEFT"),
     "defensive, nervous")),
 ("c25", 6, talk("c25", "Tamara", one(f"Close-up of {TAM} {DOCK}, {TR}, she steps in quickly, pointing her fan at the girl", "LEFT"),
     "hurried, defensive, cold")),
 ("c26", 6, talk("c26", "Eustolia", one(f"Close-up of {EUS} {DOCK}, {EL}, she lifts one hand to silence her, then looks hard at her son", "RIGHT"),
     "firm, slow, final")),
 ("c27", 6, talk("c27", "Maura", one(f"Close-up of {MAU} {DOCK}, {ML}, she looks at the man in disbelief, her lips part", "RIGHT"),
     "disbelieving, quiet")),
 # 5. Gancho a la Parte 2: la lancha de las seis espera
 ("i04", 6, f"Wide shot of the end of an old wooden dock on a lagoon at sunset in Nayarit: a small empty blue passenger lancha waits with its outboard motor idling, ripples on the water, golden light. "
            f"No people visible, no letters, no signs. No dialogue."),
 # CTA con carisma (después del BLACK): Eustolia sola en el muelle, a cámara
 ("c28", 10, talk("c28", "Eustolia", f"Close-up from the chest up of {EUS} {DOCK}, alone, standing on the dock with the lagoon behind her, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a knowing half smile, makes a short pause, raises one eyebrow, "
     f"touches the red hibiscus flower behind her ear, tilts her head, nods slowly and smiles. Nobody else around.",
     "warm, charismatic, a little ironic, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"hurt" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Y tú te vas en ella, arrimada.", "Y tú te vas en ella."), ("Mi madre no recibe arrimadas.", "Mi madre no está, muchacha."),
        ("Sácala ya de este muelle.", "Que se vaya ya."), ("Y no vuelvas a pisar la isla.", "Y que te vaya bien."),
        ("Qué bueno, porque en esa te vas tú.", "Qué bueno, en esa vas tú."), ("Tú cállate, Tamara. Contigo hablo después.", "Espera, Tamara."),
        ("Mírala bien, Arsenio. La que corriste es tu hija.", "Mírala bien, Arsenio. Es tu hija."), ("¿El que me tiró los tamales al agua?", "¿Él?"),
        ("Esa pulsera se la robó.", "Esa pulsera no es suya."),
        ("holding an empty dented tin bucket upside down in his right hand", "holding an empty dented tin bucket in his right hand"), ("he jerks his chin toward the water", "he glances at the water"),
        ("he tosses the empty bucket onto the planks", "he sets the empty bucket down"), ("pointing her fan", "holding her fan"), ("points her fan", "holds her fan"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"), ("contemptuous", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm sunset light on a lagoon island town in Nayarit, wooden dock and red tile roofs, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a fishing town on the Pacific coast of Mexico at sunset, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EUSTOLIA_LOMELI}", "a tall old Mexican woman with silver hair in a low bun, a red hibiscus flower behind her ear and a navy-blue embroidered dress"),
         ("@{ARSENIO_LOMELI}", "a heavyset Mexican man in his late forties with a short black beard and a half-unbuttoned white linen shirt"),
         ("@{TAMARA_LOMELI}", "a Mexican woman in her forties with platinum-blonde wavy hair, sunglasses on her head and a hot-pink sleeveless dress"),
         ("@{MAURA_GRACIANO}", "a slim adult Mexican woman in her twenties with long wavy black hair and a faded turquoise blouse"),
         (" @{LOC_MUELLEMEXCAL}", "")]
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

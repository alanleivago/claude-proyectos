"""Genera los clips de sarape-saltillo PARTE 1 (El Sarape de Saltillo, segunda versión muy transformada de "Su propio hijo le cerró la puerta" (saga Evaristo) de @atriumstories_: aquí es una madre, tejedora de sarapes de Saltillo, Coahuila,
a la que su hija y su yerno le cierran la puerta; VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de garrafon-bernal (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Gancho 0-2 s: Clementina recoge del escalón su sarape tirado (i01, su presentación) y Fabián, arriba en la puerta de cristal: "Antes de las nueve se me va, suegra. A las nueve llega mi jefe a cenar." (injusticia + plazo).
# Plazo: las nueve (la cena con el jefe); vuelve invertido al final: Clementina le pide al dueño de la fábrica que pase por ella "antes de las nueve" para llegar juntos a esa cena (c26-c27).
# Capas: el sarape tirado ("ese trapo de colores") -> la hija se avergüenza de venir de tejedores (c09) -> "usted no combina con mi casa" (c11) -> la hija la manda con el hermano (c13)
# -> Tereso, panadero, le da su catre y duerme en los costales (c21-c23) -> la llamada: Clementina fue la nana del dueño de la fábrica (c24, c29) -> el carro negro llega a la panadería (i04).
# Mauricio Arocha (el dueño) no sale: solo se nombra y no se oye.
# Geografía fija. Casa: Fabián (y Florinda) arriba a la DERECHA junto a la puerta de cristal; Clementina abajo a la IZQUIERDA al pie de la escalinata.
# Panadería: Tereso a la IZQUIERDA junto al horno; Clementina a la DERECHA junto a la cortina y el catre. Plano de presentación: Clementina i01, Fabián c01, Florinda r1, Tereso c16.
# CTA (c30): Clementina sola en la panadería, a cámara. Sin Navidad.
HOUSE0 = ("in front of a large modern house in an upscale neighborhood of Saltillo, Coahuila @{LOC_CASASALTILLO} at dusk: wide grey stone front steps, a tall glass front door with warm lights inside, "
          "a dark stone and white stucco facade, a neat lawn, the dry mountains of the Sierra de Zapalinamé on the horizon under an orange sky; no readable text, no signs, no logos")
HOUSE = HOUSE0 + "; nobody else in the background, no extras, nobody besides the person described"
BAKE0 = ("inside a small old bakery in downtown Saltillo, Coahuila @{LOC_PANADERIASALT} in the evening, lit by bare bulbs and the orange glow of the oven: a big brick wood-fired oven glowing on the LEFT, "
         "wooden racks of round golden breads, a long wooden worktable dusted with flour, a stack of white flour sacks, a faded flowered cloth curtain on the RIGHT half-hiding a narrow folding cot, "
         "the street door at the back; no readable text, no signs, no logos")
BAKE = BAKE0 + "; nobody else in the background, no extras, nobody besides the person described"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Clementina trenzas blancas en corona y rebozo gris; solo Fabián cabeza rapada, candado negro y camisa blanca (villano);
# solo Florinda mujer de blusa de satín verde esmeralda y mechas miel (traidora); solo Tereso pelo rizado, bigote delgado y mandil blanco con harina.
CLE = ("@{CLEMENTINA_RAMOS} (74-year-old Mexican woman, light-brown wrinkled skin, small and thin, white hair in two braids pinned around her head like a crown, small silver earrings, "
       "a dark grey rebozo with thin white stripes over a lavender blouse, a long black skirt, black flat shoes)")
FAB = ("@{FABIAN_ELIZONDO} (46-year-old Mexican man, light skin, stocky, completely shaved head, a thick black goatee, a white slim-fit dress shirt with an open collar, "
       "black trousers, a heavy silver watch on his left wrist)")
FLO = ("@{FLORINDA_RAMOS} (49-year-old Mexican woman, light-brown skin, slim, long straight black hair with honey highlights, red lipstick, a thin gold necklace, "
       "an emerald-green satin blouse, beige wide trousers)")
TER = ("@{TERESO_RAMOS} (41-year-old Mexican man, brown skin, lanky, curly black hair, a thin black mustache, a faded dark-green t-shirt, "
       "a white cloth apron dusted with flour, jeans)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
SARAPE = "a folded Saltillo sarape with bright rainbow stripes and fringed ends"
ARM = f"with {SARAPE} over her LEFT forearm"
PHONE = "an old silver phone with big buttons"
TRAY = "a wooden tray of round golden breads"
CAR = "a long black car with no logos and no license plate"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
PRES = ("presentation shot: a single-person medium shot from the knees up that shows the whole outfit clearly, NOT an over-the-shoulder shot, "
        "no foreground figure and nobody else at the edges of the frame")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
FLOOR = f"{SOLO}, eyes looking down at the floor in front of her"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

def vert(desc, look, extra=""):
    """Como one() pero con otra mirada (al teléfono, al piso)."""
    return f"{desc}, {look}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

FR = "standing at the top of the stone steps on the RIGHT, blocking the glass front door"       # Fabián
FLR = "standing in the open glass doorway on the RIGHT, at the top of the steps"               # Florinda
CL = f"standing at the bottom of the stone steps on the LEFT, {ARM}"                             # Clementina (casa)
TL = "standing on the LEFT beside the glowing brick oven"                                       # Tereso
CR = f"standing on the RIGHT beside the flowered curtain, {ARM}"                                 # Clementina (panadería)
CC = f"sitting on the edge of the narrow folding cot behind the half-open flowered curtain on the RIGHT, {ARM}"   # Clementina (catre)

CLIPS = [
 # 1. Gancho (0-2 s): el sarape tirado en el escalón y Fabián con el plazo de las nueve
 ("i01", 6, f"Medium shot of {CLE} {HOUSE}, at the bottom of the stone steps on the LEFT, {SARAPE} lies thrown on the bottom step; she bends slowly, picks it up and holds it against her chest, hurt and dignified, "
            f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c01", 6, talk("c01", "Fabián", f"Medium shot of {FAB} {HOUSE}, {FR}, one hand on the door frame, cold and impatient, he taps his silver watch, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('bald man in a white shirt')}.", "cold, impatient, arrogant")),
 ("c02", 6, talk("c02", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, she looks up the steps, humble and tired", "RIGHT"),
     "humble, tired, sincere")),
 ("c03", 6, talk("c03", "Fabián", one(f"Close-up of {FAB} {HOUSE}, {FR}, he glances at the sarape with contempt", "LEFT"),
     "contemptuous, cold")),
 ("r1", 6, f"Medium shot of {FLO} {HOUSE}, {FLR}, arms crossed, uneasy, she looks down the steps and bites her lip, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in an emerald-green blouse')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, she strokes the sarape with her RIGHT hand, proud and hurt", "RIGHT"),
     "hurt, dignified")),
 ("c05", 6, talk("c05", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, she lifts her eyes toward the doorway, her eyes shine", "RIGHT"),
     "sad, soft, pleading")),
 ("c06", 6, talk("c06", "Florinda", one(f"Close-up of {FLO} {HOUSE}, {FLR}, she avoids her mother's eyes, uncomfortable", "LEFT"),
     "uncomfortable, steady and clear, every word said once, no stumbling")),
 ("c07", 6, talk("c07", "Fabián", one(f"Close-up of {FAB} {HOUSE}, {FR}, he adjusts his silver watch, proud and smug", "LEFT"),
     "proud, smug")),
 ("r2", 6, one(f"Close-up of {CLE} {HOUSE}, {CL}, in silence, she blinks at a name she knows, a flicker of memory, she lowers her eyes and almost smiles", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, thoughtful, a little smile of memory", "RIGHT"),
     "thoughtful, soft")),
 ("c09", 6, talk("c09", "Florinda", one(f"Close-up of {FLO} {HOUSE}, {FLR}, she rubs her forehead, ashamed of her mother", "LEFT"),
     "ashamed, cold, quiet")),
 ("c10", 6, talk("c10", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, she straightens up with dignity", "RIGHT"),
     "dignified, firm, hurt")),
 ("c11", 6, talk("c11", "Fabián", one(f"Close-up of {FAB} {HOUSE}, {FR}, he looks her up and down, disdainful", "LEFT"),
     "disdainful, cold")),
 ("c12", 6, talk("c12", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, she ignores him and looks only at her daughter in the doorway", "RIGHT"),
     "firm, sad, slow")),
 ("r3", 6, one(f"Close-up of {FLO} {HOUSE}, {FLR}, in silence, she glances aside toward her husband, then down at the floor", "LEFT") + " Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Florinda", one(f"Close-up of {FLO} {HOUSE}, {FLR}, she cannot hold her mother's eyes", "LEFT"),
     "quiet, guilty, cold")),
 ("c14", 6, talk("c14", "Florinda", one(f"Close-up of {FLO} {HOUSE}, {FLR}, she steps back half a step toward the door, guilty", "LEFT"),
     "guilty, hurried")),
 ("c15", 6, talk("c15", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, she nods once with dignity, a sad gentle smile, pressing the sarape against her chest", "RIGHT"),
     "dignified, soft, sad")),
 # 2. El camino: la catedral de Saltillo
 ("i02", 6, f"Wide shot of a narrow colonial street in downtown Saltillo, Coahuila, at nightfall, the carved stone towers of the cathedral at the end, warm street lamps; "
            f"a small old woman seen only from behind, in a dark grey rebozo, white braids pinned around her head, {SARAPE} over her LEFT forearm, walks away slowly. No faces, no letters, no signs. No dialogue."),
 # 3. La panadería de Tereso
 ("c16", 6, talk("c16", "Tereso", f"Medium shot of {TER} {BAKE}, {TL}, holding {TRAY}, he has just turned toward the street door and stops, surprised and worried, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a flour-dusted apron')}.", "surprised, warm, worried")),
 ("c17", 6, talk("c17", "Clementina", one(f"Close-up of {CLE} {BAKE}, {CR}, tired, she tries to smile", "LEFT"),
     "tired, soft")),
 ("c18", 6, talk("c18", "Tereso", one(f"Close-up of {TER} {BAKE}, {TL}, he puts the tray down on the worktable, his jaw tight", "RIGHT"),
     "hurt, indignant, low")),
 ("c19", 6, talk("c19", "Tereso", one(f"Close-up of {TER} {BAKE}, {TL}, his face softens, warm and caring", "RIGHT"),
     "warm, caring")),
 ("c20", 6, talk("c20", "Clementina", one(f"Close-up of {CLE} {BAKE}, {CR}, she glances at the curtain and the narrow cot, embarrassed", "LEFT"),
     "embarrassed, soft")),
 ("c21", 6, talk("c21", "Tereso", one(f"Close-up of {TER} {BAKE}, {TL}, he gestures toward the curtain with an open hand, smiling", "RIGHT"),
     "warm, decided")),
 ("c22", 6, talk("c22", "Clementina", one(f"Close-up of {CLE} {BAKE}, {CR}, worried for him", "LEFT"),
     "worried, tender")),
 ("c23", 6, talk("c23", "Tereso", one(f"Close-up of {TER} {BAKE}, {TL}, he shrugs and smiles, lighthearted", "RIGHT"),
     "light, warm, reassuring")),
 ("r4", 6, one(f"Close-up of {CLE} {BAKE}, {CC}, in silence, she watches her son working by the oven, her eyes shine, she breathes in slowly", "LEFT") + " Slow push-in. No dialogue."),
 # 4. La llamada: la nana del dueño de la fábrica
 ("i03", 6, f"Close-up insert {BAKE0}: old wrinkled hands open {PHONE} and press a button, {SARAPE} folded on her lap, the warm orange light of the oven. "
            f"Only the hands, the phone and the sarape, no faces, the phone screen is plain. No dialogue."),
 ("c24", 6, talk("c24", "Clementina", vert(f"Close-up of {CLE} {BAKE}, {CC}, she holds {PHONE} to her ear with her RIGHT hand, talking on the phone, a soft smile", FLOOR),
     "warm, calm, on the phone")),
 ("c25", 6, talk("c25", "Clementina", vert(f"Close-up of {CLE} {BAKE}, {CC}, {PHONE} at her ear, her look turns serious", FLOOR),
     "calm, serious, on the phone")),
 ("r5", 6, one(f"Close-up of {TER} {BAKE}, {TL}, in silence, he stops kneading at the worktable and turns his head slowly, astonished", "RIGHT") + " Slow push-in. No dialogue."),
 ("c26", 6, talk("c26", "Clementina", vert(f"Close-up of {CLE} {BAKE}, {CC}, {PHONE} at her ear, firm and calm", FLOOR),
     "firm, calm, on the phone")),
 ("c27", 6, talk("c27", "Clementina", vert(f"Close-up of {CLE} {BAKE}, {CC}, {PHONE} at her ear, a small knowing smile", FLOOR),
     "ironic, calm, on the phone")),
 ("c28", 6, talk("c28", "Tereso", one(f"Close-up of {TER} {BAKE}, {TL}, flour on his hands, his mouth half open, astonished", "RIGHT"),
     "astonished, quiet")),
 ("c29", 6, talk("c29", "Clementina", one(f"Close-up of {CLE} {BAKE}, {CC}, she lowers the phone to her lap, serene and determined", "LEFT"),
     "serene, determined, slow, saying every word of the line clearly and completely")),
 # 5. Gancho a la Parte 2: llega el carro negro
 ("i04", 6, f"Wide shot at night of the street door of a small old bakery in downtown Saltillo, Coahuila: {CAR} pulls up and stops by the curb, headlights on, warm light from the bakery door. "
            f"No people visible, no letters, no signs. No dialogue."),
 # CTA con carisma (después del BLACK): Clementina sola en la panadería, a cámara
 ("c30", 10, talk("c30", "Clementina", f"Close-up from the chest up of {CLE} {BAKE}, alone, standing in front of the glowing oven {ARM}, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a knowing little smile, makes a short pause, raises one eyebrow, "
     f"adjusts the grey rebozo on her shoulders, pats the sarape on her arm, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"hurt" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Antes de las nueve se me va, suegra.", "Antes de las nueve, suegra."), ("Ni para ese trapo de colores.", "Ni para ese sarape."),
        ("No es un trapo, es un sarape.", "Es un sarape, Fabián."), ("Y usted no combina con mi casa.", "Y hoy no es buen día."),
        ("Esta noche va a saber cómo trataron a su nana.", "Esta noche va a saber todo."), ("A ver si así combino con su casa.", "A ver qué dice Fabián."),
        ("thrown on the bottom step", "on the bottom step"), ("he glances at the sarape with contempt", "he glances at the sarape"), ("blocking the glass front door", "by the glass front door"),
        ("ashamed of her mother", "uncomfortable"), ("contemptuous", "serious"), ("contempt", "a cool look"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm evening light in Saltillo, Coahuila, stone and warm lamps, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a city in northern Mexico in the evening, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CLEMENTINA_RAMOS}", "a small old Mexican woman with white braids pinned around her head and a dark grey striped rebozo over a lavender blouse"),
         ("@{FABIAN_ELIZONDO}", "a stocky Mexican man in his forties with a shaved head, a thick black goatee and a white dress shirt"),
         ("@{FLORINDA_RAMOS}", "a slim Mexican woman in her late forties with long black hair with honey highlights and an emerald-green satin blouse"),
         ("@{TERESO_RAMOS}", "a lanky Mexican man around forty with curly black hair, a thin mustache and a white flour-dusted apron over a dark-green t-shirt"),
         (" @{LOC_CASASALTILLO}", ""), (" @{LOC_PANADERIASALT}", "")]
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

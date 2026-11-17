"""Genera los clips de baul-sanmiguel PARTE 1 (El Baúl de San Miguel, remake transformado de "Su propio hijo le cerró la puerta · Parte 1" de @atriumstories_, San Miguel de Allende, Guanajuato, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# Gancho 0-2 s: el baúl de lámina verde en la escalinata y el tacón de Mirna junto a él (i01); Mirna con el plazo: "Su baúl afuera antes de las ocho. Esta casa no es pensión."
# Plazo: las ocho, cuando llega la mamá de Mirna (c09). Contraste: el hijo rico le cierra la puerta (c20) y el hijo pobre, cantero, le da su cama (c31).
# Complicación (sin cifras ni deudas): el dueño del cuartito lo quiere para su sobrino y Ciriaco va a vender su cortadora de cantera, con la que trabaja (c32-c35).
# Giro: Hilario lo oye, abre el baúl (papeles atados con cordón rojo y un llavero de latón, i04) y llama al notario: "Ya sé cuál de mis hijos… se va a quedar con todo." (c36-c37). El secreto queda para la Parte 2.
# Geografía: 1) escalinata de la casona de Raymundo en San Miguel de Allende (atardecer): Mirna ARRIBA a la DERECHA en la puerta tallada; Raymundo ARRIBA a la IZQUIERDA en lo alto de la escalinata;
#   Hilario ABAJO al CENTRO en los escalones con el baúl a sus pies. 2) casita de cantera de Ciriaco (anochecer): Ciriaco en la puerta a la IZQUIERDA, Felícitas a la DERECHA junto a la mesa, Hilario al CENTRO.
#   3) noche en la misma casita (c32-c37): Felícitas y Ciriaco en la cocina; Hilario en el cuarto junto al baúl.
# Un plano de presentación por personaje (plano medio con la ropa completa): Mirna c01, Hilario c02, Raymundo c05, Ciriaco c22, Felícitas c25. CTA (c38): Hilario solo junto a su baúl, a cámara. Sin Navidad.
CAS0 = ("on the stone front steps of a big colonial mansion in San Miguel de Allende, Guanajuato @{LOC_CASONASM} at golden dusk: ochre walls covered in magenta bougainvillea, "
        "a tall carved wooden double door at the top of the steps, iron lanterns, the pink neo-gothic spires of the Parroquia church in the distance; no readable text, no signs, no logos")
CAS = CAS0 + "; nobody else in the background, no extras, nobody besides the person described"
CUA0 = ("at a small humble house of rough cantera stone in a poor neighborhood of San Miguel de Allende, Guanajuato @{LOC_CUARTOCANTERA} at dusk: a tin roof, a narrow open wooden door, "
        "a tiny patio with half-carved pink cantera stone pieces and stone dust, a plain wooden table with a plastic tablecloth, one bare light bulb; no readable text, no signs, no logos")
CUA = CUA0 + "; nobody else in the background, no extras, nobody besides the person described"
NOCHE = ("inside the same small humble house of rough cantera stone @{LOC_CUARTOCANTERA} at night: a tiny kitchen with a two-burner stove and clay pots, one bare light bulb, "
         "a curtain of flowered cloth as a door to the only bedroom; no readable text; nobody else in the background, nobody besides the person described")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Hilario sombrero de fieltro gris, bigote blanco y bastón; solo Raymundo saco azul marino y lentes; solo Mirna melena rubia platinada y traje blanco;
# solo Ciriaco polvo de cantera y playera azul marino; solo Felícitas trenza y rebozo rojo.
HIL = ("@{HILARIO_PENALOZA} (77-year-old Mexican man, brown weathered skin, thin and a little stooped, white wavy hair, a thick white mustache, a grey felt hat with a black band, "
       "a brown corduroy jacket over a cream guayabera shirt, grey trousers, a mesquite wood walking cane always in his LEFT hand)")
RAY = ("@{RAYMUNDO_PENALOZA} (51-year-old Mexican man, light-brown skin, tall, black hair combed back with grey streaks, a short grey goatee, thin rimless glasses, no hat, "
       "a navy-blue blazer over a white shirt with no tie, grey trousers, his hands kept low)")
MIR = ("@{MIRNA_OLGUIN} (46-year-old Mexican woman, light skin, slim, a straight platinum-blonde chin-length bob, pearl stud earrings, a white linen pantsuit, nude heels, "
       "her arms crossed, she never points a finger at anyone)")
CIR = ("@{CIRIACO_PENALOZA} (42-year-old Mexican man, brown skin, stocky, short black hair, thick eyebrows, a short black beard, a dusty navy-blue t-shirt, pale pink stone dust on his forearms "
       "and hands, dusty jeans, no hat, no glasses, his hands kept low)")
FEL = ("@{FELICITAS_CANCHOLA} (40-year-old Mexican woman, brown skin, medium build, long black hair in a thick braid, small silver earrings, a white blouse embroidered with red flowers, "
       "a red rebozo over her shoulders, a dark skirt, her hands kept low)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
TRUNK = "a small old green tin trunk painted with red flowers and a brass latch"
PHONE_H = "one small old black flip phone held in his RIGHT hand"
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

HC = f"standing at the bottom of the stone steps in the CENTER, {TRUNK} on the step at his feet"                       # Hilario en la casona
MR = "standing at the top of the steps on the RIGHT in front of the tall carved wooden door"                            # Mirna
RL = "standing at the top of the steps on the LEFT, the carved wooden door half open beside him"                        # Raymundo
CL = "standing on the LEFT in the narrow open wooden door of the small stone house"                                     # Ciriaco
FR = "standing on the RIGHT beside the plain wooden table under the bare light bulb"                                    # Felícitas
HQ = f"standing in the CENTER of the tiny patio, {TRUNK} on the ground beside him"                                      # Hilario en la casita
KF = "standing in the tiny kitchen at night, beside the two-burner stove"                                               # Felícitas / Ciriaco de noche
HB = f"sitting on the edge of an old iron bed in a tiny bedroom at night, {TRUNK} on the floor beside him, a grey wool blanket on the bed, one bare light bulb"  # Hilario de noche

CLIPS = [
 # 1. Gancho (0-2 s): el baúl en la escalinata y el plazo de las ocho
 ("i01", 6, f"Close-up insert {CAS0}: an old wrinkled hand sets {TRUNK} down on a stone step, a mesquite wood cane leaning beside it; a woman's foot in a nude high heel and white linen trousers "
            f"stops one step above it. Only the hand, the cane, the trunk and the shoe, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Mirna", f"Medium shot of {MIR} {CAS}, {MR}, cold, looking down the steps with her arms crossed, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a white pantsuit')}.", "cold, cutting, unhurried")),
 ("c02", 6, talk("c02", "Hilario", f"Medium shot of {HIL} {CAS}, {HC}, tired and humble, he looks up the steps, leaning on his cane, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a felt hat')}.", "humble, tired, dignified")),
 ("c03", 6, talk("c03", "Mirna", one(f"Close-up of {MIR} {CAS}, {MR}, she raises one eyebrow, annoyed", "LEFT"),
     "annoyed, cold")),
 ("c04", 6, talk("c04", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, he glances up at the man at the top of the steps, sad", "RIGHT"),
     "sad, quiet")),
 ("c05", 6, talk("c05", "Raymundo", f"Medium shot of {RAY} {CAS}, {RL}, uncomfortable, he adjusts his glasses, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy blazer')}.", "uncomfortable, quick, distant")),
 ("c06", 6, talk("c06", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, he holds his cane with both hands, sincere", "RIGHT"),
     "sincere, humble, low")),
 ("c07", 6, talk("c07", "Mirna", one(f"Close-up of {MIR} {CAS}, {MR}, a cold polite smile", "LEFT"),
     "cold, falsely polite")),
 ("c08", 6, talk("c08", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, he nods humbly, hopeful", "RIGHT"),
     "hopeful, humble")),
 ("c09", 6, talk("c09", "Mirna", one(f"Close-up of {MIR} {CAS}, {MR}, she glances toward the street, impatient", "LEFT"),
     "cold, quick")),
 ("c10", 6, talk("c10", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, a small hurt smile, he looks down at his trunk", "RIGHT"),
     "hurt, quiet, ironic")),
 ("c11", 6, talk("c11", "Raymundo", one(f"Close-up of {RAY} {CAS}, {RL}, impatient, he looks away", "RIGHT"),
     "impatient, annoyed")),
 ("c12", 6, talk("c12", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, calm and dignified, he looks up at his son", "LEFT"),
     "calm, dignified, low")),
 ("c13", 6, talk("c13", "Mirna", one(f"Close-up of {MIR} {CAS}, {MR}, she counts on her fingers, cold", "LEFT"),
     "cold, condescending")),
 ("c14", 6, talk("c14", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, he lifts one hand a little, almost pleading", "RIGHT"),
     "pleading, humble")),
 ("c15", 6, talk("c15", "Mirna", one(f"Close-up of {MIR} {CAS}, {MR}, she waves one hand toward the street, dismissive", "LEFT"),
     "dismissive, cold")),
 ("c16", 6, talk("c16", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, he looks straight at his son at the top of the steps, sad", "LEFT"),
     "sad, firm, low")),
 ("c17", 6, talk("c17", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, his voice breaks a little, he takes off his felt hat and holds it to his chest", "LEFT"),
     "pleading, sad, low")),
 ("c18", 6, talk("c18", "Mirna", one(f"Close-up of {MIR} {CAS}, {MR}, she shakes her head with a cold smile", "LEFT"),
     "cold, sarcastic")),
 ("c19", 6, talk("c19", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, holding his felt hat, he looks only at his son, waiting", "LEFT"),
     "quiet, firm, hurt")),
 ("r1", 6, one(f"Close-up of {RAY} {CAS}, {RL}, in silence, he lowers his eyes and looks away, ashamed, he swallows", "RIGHT") + " Slow push-in. No dialogue."),
 ("c20", 6, talk("c20", "Raymundo", one(f"Close-up of {RAY} {CAS}, {RL}, he avoids his father's eyes, cold and quick", "RIGHT"),
     "cold, quick, low")),
 ("c21", 6, talk("c21", "Hilario", one(f"Close-up of {HIL} {CAS}, {HC}, he puts his felt hat back on slowly, his eyes shine, dignified", "LEFT"),
     "dignified, hurt, slow")),
 # 2. El camino: de la casona a la casita de cantera
 ("i02", 6, f"Wide shot at golden dusk of a steep cobbled street in San Miguel de Allende, Guanajuato: a thin old man in a grey felt hat and a brown corduroy jacket walks slowly downhill "
            f"seen from behind, a mesquite cane in his LEFT hand, carrying {TRUNK} in his RIGHT hand, colorful colonial houses on both sides, the pink spires of the Parroquia far behind. "
            f"Only him in the street. No dialogue, no letters."),
 # 3. La casita: Ciriaco y Felícitas lo reciben (música cálida c22-c31)
 ("c22", 6, talk("c22", "Ciriaco", f"Medium shot of {CIR} {CUA}, {CL}, surprised and worried, he wipes the stone dust from his hands on his jeans, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a dusty navy t-shirt')}.", "surprised, worried, warm")),
 ("c23", 6, talk("c23", "Hilario", one(f"Close-up of {HIL} {CUA}, {HQ}, his eyes wet, he tries to smile", "LEFT"),
     "broken, quiet, humble")),
 ("c24", 6, talk("c24", "Ciriaco", one(f"Close-up of {CIR} {CUA}, {CL}, without a second of doubt, warm, he turns his head toward the house", "RIGHT"),
     "warm, quick, sure")),
 ("c25", 6, talk("c25", "Felícitas", f"Medium shot of {FEL} {CUA}, {FR}, she smiles warmly, adjusting her red rebozo, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a red rebozo')}.", "warm, sweet, sincere")),
 ("c26", 6, talk("c26", "Ciriaco", one(f"Close-up of {CIR} {CUA}, {CL}, frowning, worried", "RIGHT"),
     "worried, low")),
 ("c27", 6, talk("c27", "Hilario", one(f"Close-up of {HIL} {CUA}, {HQ}, he lowers his eyes", "LEFT"),
     "sad, quiet")),
 ("c28", 6, talk("c28", "Ciriaco", one(f"Close-up of {CIR} {CUA}, {CL}, indignant, he shakes his head", "RIGHT"),
     "indignant, low")),
 ("c29", 6, talk("c29", "Felícitas", one(f"Close-up of {FEL} {CUA}, {FR}, tender, she pulls out a chair at the table", "LEFT"),
     "tender, warm")),
 ("c30", 6, talk("c30", "Hilario", one(f"Close-up of {HIL} {CUA}, {HQ}, a shy grateful smile", "RIGHT"),
     "humble, grateful, quiet")),
 ("c31", 6, talk("c31", "Ciriaco", one(f"Close-up of {CIR} {CUA}, {CL}, firm and loving, he puts one hand on his own chest", "RIGHT"),
     "firm, loving, sincere")),
 ("r2", 6, one(f"Close-up of {HIL} {CUA}, {HQ}, in silence, his eyes shine, he holds his cane with both hands and nods slowly, moved", "LEFT") + " Slow push-in. No dialogue."),
 # 4. Noche: el cuartito y la cortadora
 ("i03", 6, f"Close-up insert at night inside a tiny bedroom of a humble stone house in San Miguel de Allende: {TRUNK} on the floor next to an old iron bed with a grey wool blanket, "
            f"one bare light bulb, a flowered cloth curtain as a door. No people, no letters. No dialogue."),
 ("c32", 6, talk("c32", "Felícitas", one(f"Close-up of {FEL} {NOCHE}, {KF}, worried, she whispers so nobody else hears", "RIGHT"),
     "worried, whispering")),
 ("c33", 6, talk("c33", "Ciriaco", one(f"Close-up of {CIR} {NOCHE}, {KF}, tired but decided, whispering", "LEFT"),
     "decided, whispering")),
 ("c34", 6, talk("c34", "Felícitas", one(f"Close-up of {FEL} {NOCHE}, {KF}, she shakes her head, her eyes shine", "RIGHT"),
     "worried, whispering, tender")),
 ("c35", 6, talk("c35", "Ciriaco", one(f"Close-up of {CIR} {NOCHE}, {KF}, he glances at the flowered cloth curtain, whispering", "LEFT"),
     "whispering, sad, firm")),
 ("r3", 6, one(f"Close-up of {HIL} at night, {HB}, without his hat, in silence, he has heard everything through the curtain, his eyes wet, his face slowly turns serious and decided", "RIGHT") + " Slow push-in. No dialogue."),
 ("i04", 6, f"Close-up insert at night: two old wrinkled hands open the brass latch of {TRUNK} on the floor of a tiny bedroom; inside lies a thick bundle of old folded papers tied with red string "
            f"and a ring of old brass keys. Only the hands, the trunk, the papers and the keys, no faces, no readable letters. No dialogue."),
 ("c36", 6, talk("c36", "Hilario", one(f"Close-up of {HIL} at night, {HB}, without his hat, {PHONE_H} at his ear, speaking very low and calm, a new firmness in his eyes", "RIGHT"),
     "very low, calm, firm")),
 ("c37", 6, talk("c37", "Hilario", one(f"Close-up of {HIL} at night, {HB}, without his hat, still with the phone at his ear, a slow small smile", "RIGHT"),
     "calm, low, certain")),
 # CTA con carisma (después del BLACK): Hilario solo junto a su baúl, a cámara
 ("c38", 10, talk("c38", "Hilario", f"Close-up from the chest up of {HIL} {CUA}, alone, standing in the tiny patio beside his trunk, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a sly little smile, makes a short pause, touches the brim of his felt hat, "
     f"raises one eyebrow, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful and mischievous, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("eyes wet", "eyes shine")
        ]
# Frases primero: si no, "hurt"/"cold" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Esta casa no es pensión.", "Aquí no hay lugar."), ("No empieces, papá.", "Ya lo hablamos, papá."),
        ("Ojalá nunca toques puertas así.", "Ojalá nunca te pase lo mismo."), ("Ya bastante le dolió hoy.", "Ya tuvo un día muy feo."),
        ("his voice breaks a little", "his voice gets softer"), ("almost pleading", "sincere"), ("an old wrinkled hand", "an old hand"), ("two old wrinkled hands", "two old hands"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"), ("sarcastic", "dry"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("broken", "sad"), ("impatient", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("cutting", "serious"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("mischievous", "friendly"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden dusk light in San Miguel de Allende, Guanajuato, colonial stone, bougainvillea and cobbled streets, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a colonial town in Guanajuato at dusk, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft evening light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{HILARIO_PENALOZA}", "a thin old Mexican man with a white mustache, a grey felt hat and a brown corduroy jacket"),
         ("@{RAYMUNDO_PENALOZA}", "a tall Mexican man with a grey goatee and rimless glasses in a navy-blue blazer"),
         ("@{MIRNA_OLGUIN}", "a slim Mexican woman with a platinum-blonde bob in a white linen pantsuit"),
         ("@{CIRIACO_PENALOZA}", "a stocky Mexican man with a short black beard in a dusty navy-blue t-shirt"),
         ("@{FELICITAS_CANCHOLA}", "a Mexican woman with a long black braid and a red rebozo"),
         (" @{LOC_CASONASM}", ""), (" @{LOC_CUARTOCANTERA}", "")]
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

"""Genera los clips de piloncillo-rio PARTE 1 (El Paso del Río, remake transformado de "Le dio 5 minutos… y no le creyó" de @atriumstories_, Huasteca potosina, SIN MARCA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de cafe-neblina (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (un cono de piloncillo cae al río turquesa) con figura y plazo ("Diez minutos, viejito");
# poder SIN armas: cuatro camionetas azul marino junto al río, hombres de camisa azul marino con las manos cruzadas, Celerina que le dice "patrón" al viejito de huaraches.
# El que no le cree: Rigoberto encadenó el paso de la balsa y humilla a Fortino sin saber que es el dueño de la molienda. Plazo de Fortino: "antes que espese el piloncillo" (i03, c18).
# Indicios del giro ANTES de revelarlo: "me lo rentaron" (c05), "mi jefe sabe quién eres" (c07), "mi jefe me rentó el paso" (c29), "está en la otra orilla" (c31).
#   Revelación: la troca blanca en la otra orilla (i07, r4) y Celerina: "Es la de su hijo." (c32); Fortino: "¿Mi propio hijo rentó el río?" (c33). Castigo para la Parte 2.
# Sin Navidad. Geografía fija en el paso del río (Huasteca potosina, mediodía):
#   el río turquesa y la rampa de tierra con la balsa a la DERECHA; la troca roja vieja de Fortino a la IZQUIERDA; Fortino al CENTRO-IZQUIERDA frente a su troca;
#   Rigoberto a la DERECHA junto a la cadena de la rampa; Crispín a la DERECHA junto al poste del cable de la balsa.
#   Celerina (desde c23) al CENTRO, sus cuatro camionetas azul marino detrás. Leobardo (r4) solo, en la otra orilla junto a una troca blanca.
#   c18-c19: la molienda de Fortino (LOC_TRAPICHE). CTA (c34): Fortino solo junto a su troca, a cámara.
RIO0 = ("at a river crossing in the Huasteca region of San Luis Potosí @{LOC_PASORIO} at midday: a wide turquoise river between green hills and tropical trees, a dirt ramp down to the water "
        "with a flat wooden river raft on a steel cable, a heavy iron chain across the ramp, an old red pickup truck loaded with cones of piloncillo wrapped in dry cane leaves; "
        "no readable text, no signs, no logos")
RIO = RIO0 + "; nobody else in the background, no extras, nobody besides the person described"
TRA = ("at a small open-air sugar-cane mill of the Huasteca @{LOC_TRAPICHE} at midday: a tin roof on wooden posts, a big round copper pan of thick boiling cane juice with steam, "
       "piles of cut sugar cane, wooden molds with brown piloncillo cones, green hills beyond; no logos, no readable text")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Fortino lleva sombrero (palma gastada) y paliacate rojo; solo Rigoberto camisa negra satinada con palmeras blancas;
# solo Crispín gorra beige y camiseta naranja; solo Celerina rebozo gris; solo Leobardo polo blanca y lentes.
FOR = ("@{FORTINO_TAVERA} (71-year-old Mexican man from the Huasteca, dark-brown sun-weathered skin, short and stocky, round wrinkled face, white stubble, short white mustache, "
       "a worn palm-leaf hat, a plain white cotton shirt, a red bandana knotted at the neck, grey trousers, old leather huaraches, his hands empty and low)")
RIG = ("@{RIGOBERTO_URBINA} (38-year-old Mexican man, light-brown skin, skinny, narrow face, thin line beard, black hair gelled up, no hat, no glasses, "
       "a shiny black satin short-sleeve shirt with small white palm-tree prints, a thin silver chain, white jeans, his hands kept low, he never points a finger at anyone)")
CRI = ("@{CRISPIN_MIRELES} (66-year-old Mexican man, dark-brown skin, thin and wiry, long face, grey stubble, an old beige cap with no logo, "
       "a faded orange t-shirt, his hands kept low)")
CEL = ("@{CELERINA_PANTOJA} (54-year-old Mexican woman, brown skin, sturdy, square jaw, short black hair with a grey streak, small silver earrings, no hat, no glasses, "
       "a grey cotton shawl over a dark-red long-sleeve blouse, black trousers, her hands empty)")
LEO = ("@{LEOBARDO_TAVERA} (44-year-old Mexican man, brown skin, clean-shaven oval face, short neat black hair with a side part, thin metal-frame glasses, "
       "a white polo shirt with no logo, beige chinos, a black phone held low in his RIGHT hand)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
PHONE_R = "one black phone held low in his RIGHT hand"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

FS = "standing at the CENTER-LEFT of the dirt road in front of his old red pickup truck"              # Fortino
RR = "standing on the RIGHT beside the iron chain across the ramp, the turquoise river behind him"    # Rigoberto
CR = "standing on the RIGHT beside the old wooden post of the raft cable, the turquoise river behind"  # Crispín
CC = "standing in the CENTER of the dirt road, four dark-blue pickup trucks parked behind her"        # Celerina

CLIPS = [
 # 1. Gancho (0-2 s): el piloncillo al río, "diez minutos"
 ("i01", 6, f"Close-up insert {RIO0}: a skinny hand with a thin silver chain at the wrist of a black satin sleeve tosses one brown cone of piloncillo wrapped in dry cane leaves "
            f"off the dirt ramp; it falls and splashes into the turquoise river and floats away. Only the hand, the cone and the water, no faces, no person anywhere in the water, nobody swimming. No dialogue."),
 ("c01", 6, talk("c01", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, relaxed and sure of himself, a small mocking half smile", "LEFT",
     NODOUBLE("man in a black satin shirt")), "relaxed, mocking, unhurried, like he owns the place")),
 ("c02", 6, talk("c02", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, calm, he glances down toward the river where the cone fell", "RIGHT",
     NODOUBLE("old man in a palm-leaf hat")), "calm, quiet, dignified")),
 ("c03", 6, talk("c03", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, he tilts his head, cold", "LEFT"),
     "cold, sure")),
 ("c04", 6, talk("c04", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, serene, he looks at the river for a moment, then back", "RIGHT"),
     "serene, slow, low")),
 ("c05", 6, talk("c05", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, he spreads his arms a little, proud", "LEFT"),
     "proud, mocking")),
 ("c06", 6, talk("c06", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, a tiny patient smile under the white mustache", "RIGHT"),
     "patient, calm, low")),
 ("c07", 6, talk("c07", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, his smile drops, cold and quick", "LEFT"),
     "cold, quick, low")),
 ("i02", 6, f"Close-up insert {RIO0}: a heavy iron chain stretched across the dirt ramp; a skinny hand with a thin silver chain at the wrist snaps an old padlock shut on it. "
            f"Only the hand, the chain and the padlock, no faces, no letters. No dialogue."),
 ("c08", 6, talk("c08", "Crispín", one(f"Close-up of {CRI} {RIO}, {CR}, the thin old man in the faded ORANGE t-shirt and beige cap is the one who speaks, worried, he leans a little and speaks low; no young man in a black shirt in the frame", "LEFT",
     NODOUBLE("old man in a beige cap")), "worried, low, respectful")),
 ("c09", 6, talk("c09", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, he turns his head sharply to his side, annoyed", "RIGHT"),
     "annoyed, quick, low")),
 ("r1", 6, one(f"Close-up of {CRI} {RIO}, {CR}, in silence, he lowers his head, ashamed, then lifts his eyes for a second", "LEFT") + " Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, he looks with sadness toward the old raft man", "RIGHT"),
     "sad, quiet, warm")),
 ("c11", 6, talk("c11", "Crispín", one(f"Close-up of {CRI} {RIO}, {CR}, ashamed, his eyes shine, he speaks very low", "LEFT"),
     "ashamed, very low, honest")),
 ("c12", 6, talk("c12", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, he laughs once and looks him up and down, arrogant", "LEFT"),
     "amused, arrogant")),
 # 2. El plazo de Fortino: "antes que espese el piloncillo"
 ("c13", 6, talk("c13", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, very calm, he lifts his chin a little, a small sure smile", "RIGHT"),
     "very calm, low, the one who is in charge")),
 ("c14", 6, talk("c14", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, he laughs and looks around at the empty road", "LEFT"),
     "mocking, amused")),
 ("c15", 6, talk("c15", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, calm, he glances toward the green hills beyond the river", "RIGHT"),
     "calm, slow, sure")),
 ("c16", 6, talk("c16", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, he shrugs, smug", "LEFT"),
     "smug, dismissive")),
 ("c17", 6, talk("c17", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, he breathes in slowly through his nose, eyes half closed, at peace", "RIGHT"),
     "calm, quiet, almost amused")),
 # 3. Montaje paralelo: la molienda
 ("i03", 6, f"Close-up insert {TRA}: thick dark-golden cane juice bubbles in a big round copper pan over a wood fire, heavy steam rises; a wooden paddle stirs and the juice turns thick. "
            f"Only the pan, the paddle and the steam, no faces. No dialogue."),
 ("c18", 6, talk("c18", "Celerina", one(f"Close-up of {CEL} {TRA}, she stops stirring and looks far away toward the river, serious", "LEFT",
     NODOUBLE("woman in a grey shawl")), "serious, worried, low")),
 ("c19", 6, talk("c19", "Celerina", one(f"Close-up of {CEL} {TRA}, she turns her head and speaks firmly to people off screen", "RIGHT"),
     "firm, quick, decided")),
 ("i04", 6, f"Aerial drone shot at midday over the green hills of the Huasteca: four dark-blue pickup trucks with no logos leave a small sugar-cane mill and drive in a line "
            f"along a dirt road beside a wide turquoise river, dust behind them. No people visible, no letters on the trucks. No dialogue."),
 # 4. El tiempo se acaba: llegan las camionetas
 ("c20", 6, talk("c20", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, he checks {PHONE_R}, then looks up, smug", "LEFT"),
     "smug, impatient")),
 ("c21", 6, talk("c21", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, a slow small smile, he does not move", "RIGHT"),
     "calm, quiet, sure")),
 ("c22", 6, talk("c22", "Crispín", one(f"Close-up of {CRI} {RIO}, {CR}, he turns his head toward the road, alarmed", "LEFT"),
     "alarmed, quick, low")),
 ("r2", 6, one(f"Close-up of {RIG} {RIO}, {RR}, in silence, his smile fades slowly and he turns his head toward the road", "LEFT") + " Slow push-in. No dialogue."),
 ("i05", 6, f"Wide shot {RIO0}: four dark-blue pickup trucks stop on the dirt road near the ramp in a cloud of dust; men in plain navy-blue shirts, no hats, step out "
            f"and stand still in a row, hands crossed in front of them; their hands are empty, no weapons. No dialogue."),
 ("i06", 6, f"Close-up insert {RIO0}: brown leather ankle boots under black trousers step down from a dark-blue pickup onto the dirt road and walk past a cone of piloncillo "
            f"wrapped in dry cane leaves lying in the dust. Only the boots, the road and the cone, no faces. No dialogue."),
 ("c23", 6, talk("c23", "Celerina", one(f"Close-up of {CEL} {RIO0}, {CC}, worried and respectful, she looks toward the old man on her left", "LEFT",
     NODOUBLE("woman in a grey shawl")), "worried, respectful, low")),
 ("c24", 6, talk("c24", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, his face goes pale, nervous", "LEFT"),
     "nervous, quick")),
 # 5. Crispín recupera su balsa (música cálida c25-c26)
 ("c25", 6, talk("c25", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, his eyes soft, he nods toward the old raft man", "RIGHT"),
     "warm, sincere, low")),
 ("c26", 6, talk("c26", "Crispín", one(f"Close-up of {CRI} {RIO}, {CR}, moved, his eyes shine, he keeps his one beige cap ON his head the whole time, his hands low and empty", "LEFT"),
     "moved, quiet, grateful")),
 # 6. Inversión: el plazo cambia de lado (el castigo queda para la Parte 2)
 ("c27", 6, talk("c27", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, he turns his eyes slowly to the right, firm now", "RIGHT"),
     "firm, slow, low")),
 ("c28", 6, talk("c28", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, still and calm, he does not blink", "RIGHT"),
     "calm, final, slow")),
 ("c29", 6, talk("c29", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, his hands open and low, pleading", "LEFT"),
     "pleading, quick")),
 ("c30", 6, talk("c30", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, he takes one small step closer, serious", "RIGHT"),
     "serious, quiet, slow")),
 ("c31", 6, talk("c31", "Rigoberto", one(f"Close-up of {RIG} {RIO}, {RR}, nervous, he avoids looking and glances over his shoulder across the river", "LEFT"),
     "nervous, low, quick")),
 # 7. La troca blanca en la otra orilla: gancho a la Parte 2
 ("r3", 6, one(f"Close-up of {FOR} {RIO}, {FS}, in silence, he slowly turns his head to look across the river, his smile gone", "RIGHT") + " Slow push-in. No dialogue."),
 ("i07", 6, f"Wide shot across a wide turquoise river in the Huasteca at midday: on the far bank, between tropical trees, a white pickup truck with no logos is parked "
            f"and one man in a white shirt stands still beside it, too far to see his face. Calm water in front, green hills behind. No dialogue."),
 ("r4", 6, one(f"Medium close-up of {LEO}, standing alone on the far bank of a wide turquoise river beside a white pickup truck with no logos, tropical trees and green hills behind, "
               f"already standing still from the first frame, in silence, he lowers the phone slowly and looks across the water, serious", "LEFT") + " Slow push-in. No dialogue."),
 ("c32", 6, talk("c32", "Celerina", one(f"Close-up of {CEL} {RIO0}, {CC}, she looks across the river, then lowers her eyes, sad", "LEFT"),
     "sad, very low")),
 ("c33", 6, talk("c33", "Fortino", one(f"Close-up of {FOR} {RIO}, {FS}, frozen, his eyes on the far bank, then his face slowly breaks, hurt", "RIGHT"),
     "shocked, hurt, very low")),
 # CTA con carisma (después del BLACK): Fortino junto a su troca, a cámara
 ("c34", 10, talk("c34", "Fortino", f"Close-up from the chest up of {FOR} {RIO}, alone, standing on the dirt road in front of his old red pickup truck, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; while he speaks he pushes his palm-leaf hat back a little, adjusts the red bandana, "
     f"tilts his head, raises his eyebrows, nods and smiles a little. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly")
        ]
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"),
        ("¡", ""), ("!", "."), ("Tú cállate, Crispín.", "Tú no te metas, Crispín."), ("Me dejas la mitad de la carga.", "Me dejas la mitad del piloncillo."),
        ("O te regresas por donde viniste.", "O te das la vuelta."), ("Me quitaron la balsa, don Fortino.", "Me quedé sin balsa, don Fortino."),
        ("looks him up and down", "looks at him"), ("his face goes pale", "his face turns serious"), ("then his face slowly breaks, hurt", "his face turns serious"),
        ("frozen, his eyes", "very still, his eyes"), ("tosses", "drops"), ("snaps an old padlock shut on it", "closes an old padlock on it"), ("he turns his head sharply", "he turns his head")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, bright midday light by a turquoise river in the green hills of the Huasteca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a river crossing in the tropical hills of San Luis Potosí at midday, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft daylight, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FORTINO_TAVERA}", "an old Mexican farmer in a worn palm-leaf hat and a red bandana"), ("@{RIGOBERTO_URBINA}", "a skinny Mexican man in a black satin shirt with palm prints"),
         ("@{CRISPIN_MIRELES}", "an old Mexican raft man in a beige cap and an orange t-shirt"), ("@{CELERINA_PANTOJA}", "a sturdy Mexican woman in a grey shawl"),
         ("@{LEOBARDO_TAVERA}", "a Mexican man in glasses and a white polo shirt"),
         (" @{LOC_PASORIO}", ""), (" @{LOC_TRAPICHE}", "")]
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

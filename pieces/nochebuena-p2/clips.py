"""Genera los clips de nochebuena PARTE 2 (La Cena de Nochebuena) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4). Copia de regreso-20-p2/clips.py con todas sus defensas (reload_flow en fallos, gatito de control)."""
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
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / reten-sierra-p2 / buen-hijo-p2 c27 / regreso-20 c25 / gardenia c20: subtítulos quemados -> al final de cada clip con diálogo
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA regreso-20 c25: subtítulos en la franja inferior -> CLEAN también al final (queda en el prompt mínimo del intento 6)
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA regreso-20 c14/c22/c28 / agua-hacienda-p2 / medalla-mezcal-p2: 2.a frase perdida o palabra repetida -> silencio tras la última palabra
END = "After the last word the person stays silent until the end of the shot."
# QA camionero c04/c05/c16/c25/c30, posada, regreso-20 c06/c21/c27, regreso-chicago-p2: dobles, nucas y hombros en los bordes mientras hablan desde el inicio
# -> SOLO primeros planos limpios de una persona (ONE + ALONE + NODOUBLE) y mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder.
# QA regreso-20 c26 / gardenia c20: personajes que entran caminando -> ALONE ("already in place from the very first frame").
# Nadie lleva sombrero (Parte 1: los sombreros flotantes fueron la falla más repetida).
# QA nochebuena P1 c18: letras en la franja inferior -> CLEAN tras cada diálogo. Nada de nacimiento en P2 (Omni lo copiaba en todo el comedor): solo patio y cocina.
# Geografía fija:
#   Patio de luces (c01-c05, r1): sigue en el mismo segundo de P1 c32. Gerardo y Regina de pie a la IZQUIERDA bajo las luces (miran a la DER.);
#     Herminia de pie a la DERECHA junto a la puerta de madera (mira a la IZQ.), ya en cuadro. La piñata de estrella, una sola, arriba al fondo.
#   Cocina, Herminia e Ignacio (i1, c06-c10): Ignacio de pie a la IZQUIERDA en la puerta (mira a la DER.); Herminia a la DERECHA junto al fogón y la olla (mira a la IZQ.).
#   Cocina, la firma (c11-c26, r2, r3): Gerardo y Regina de pie a la IZQUIERDA en la puerta (miran a la DER.);
#     Herminia a la DERECHA junto al fogón con el papel; Ignacio de pie a la DERECHA a su lado (los dos miran a la IZQ.).
#   CTA (c27): Herminia sola en el patio de luces, a cámara.
PAT = ("in the night courtyard entrance @{LOC_PATIOPINATA} of an old Mexican hacienda on Christmas Eve, an arched stone portal with strings of warm "
       "multicolor Christmas lights, paper lanterns, red poinsettias in clay pots, one single colorful seven-pointed star piñata hanging high in the background, perfectly still; "
       "no nativity scene, no figurines; no extras, nobody else outside besides the person described")
COC = ("in the traditional hacienda kitchen @{LOC_COCINAPONCHE} at night, blue and white talavera tiles, a brick wood stove with one single large clay pot of steaming ponche, "
       "hanging clay pots, strings of dried chiles, warm amber light; no nativity scene, no figurines; no extras, nobody else in the kitchen besides the person described")
# Anclas de identidad y ropa (hojas de la Parte 1, mismos nombres de asset). Edades numéricas adultas solo aquí. Manos abiertas y bajas (sin dedo acusador). Nadie con sombrero.
HER = ("@{HERMINIA} (64-year-old woman, black hair with grey streaks in a low braid, small silver earrings, a simple navy-blue long-sleeve dress, "
       "a wine-red rebozo shawl over her shoulders, no hat, her hands open and kept low, she never points a finger at anyone)")
GER = ("@{GERARDO} (38-year-old man, short neatly combed black hair, clean-shaven, charcoal grey blazer over a white open-collar shirt, black trousers, "
       "a silver watch, no tie, no hat, his hands open and kept low, he never points a finger at anyone)")
REG = ("@{REGINA} (32-year-old woman, long wavy light-brown hair, emerald satin long-sleeve dress, gold hoop earrings, red lipstick, "
       "no hat, her hands open and kept low, she never points a finger at anyone)")
IGN = ("@{IGNACIO} (66-year-old man, short grey hair, clean-shaven, round wire glasses, dark brown corduroy jacket over a cream turtleneck sweater, "
       "brown trousers, no hat, calm and kind)")
# QA padre-veladoras-p2 c30 / regreso-chicago-p2 c11 / regreso-20-p2 i1: utilería duplicada -> un solo papel (el de Regina) y nada más en las manos
PAPER = ("There is only ONE paper in the whole shot: one single white typed sheet of paper, the text too small to read, "
         "no envelope, no folder, no pen, no other papers")
NOPROP = "There is no paper, phone, pen, cup or glass in anyone's hands"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
# QA gardenia / posada / intercambio: el doble del mismo personaje (misma ropa) en el borde -> NODOUBLE con la ropa de cada uno
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
TWIN = {"Herminia": "woman in a wine-red rebozo", "Gerardo": "man in a charcoal blazer", "Regina": "woman in an emerald dress",
        "Ignacio": "man in a brown corduroy jacket"}

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def shot(who, person, place, where, action, side, prop=NOPROP):
    return f"Close-up of {person} {place}, {where}, {action}, {gaze(side)}; {ONE}; {ALONE}; {NODOUBLE(TWIN[who])}. {prop}."

L_PAT = "standing on the LEFT under the Christmas lights"
R_DOOR = "standing on the RIGHT by the carved wooden door"
L_DOOR = "standing on the LEFT in the open kitchen doorway"
R_STOVE = "standing on the RIGHT by the brick stove and the clay pot"
R_SIDE = "standing on the RIGHT near the brick stove"

CLIPS = [
 # 1. Patio de luces: sigue en el mismo segundo de P1 c32 (Herminia habla desde el frame 0, sin plano abierto)
 ("c01", 8, talk("c01", "Herminia", shot("Herminia", HER, PAT, R_DOOR, "already standing still by the door from the first frame, serious and calm, her eyes shining", "LEFT"),
     "calm, quiet, serious")),
 ("c02", 8, talk("c02", "Gerardo", shot("Gerardo", GER, PAT, L_PAT, "caught by surprise, then a quick nervous smile, both hands open low", "RIGHT"),
     "surprised, nervous, then falsely sweet")),
 ("c03", 8, talk("c03", "Regina", shot("Regina", REG, PAT, L_PAT, "a sweet smile that looks a little false, she tilts her head", "RIGHT"),
     "falsely sweet, polite")),
 ("c04", 8, talk("c04", "Herminia", shot("Herminia", HER, PAT, R_DOOR, "a small calm smile, she adjusts her wine-red rebozo", "LEFT"),
     "calm, dignified, a little ironic")),
 ("r1", 6, f"Close-up of {GER} {PAT}, {L_PAT}, in silence, a relieved smile that turns nervous, he swallows, {gaze('RIGHT')}; {ONE}; {ALONE}; {NODOUBLE(TWIN['Gerardo'])}. {NOPROP}. Slow push-in. No dialogue."),
 ("c05", 8, talk("c05", "Regina", shot("Regina", REG, PAT, L_PAT, "a satisfied smile, her voice low, she glances to the side", "LEFT"),
     "low, satisfied, scheming")),
 # 2. Cocina: Herminia e Ignacio (cálida desde i1)
 ("i1", 6, f"Close-up {COC}: the one single large clay pot of steaming ponche on the brick stove, guava and cinnamon sticks floating, soft steam rising; "
           f"only the pot in frame, no hands, no people, no second pot, no figurines; static shot, slow push-in. No dialogue."),
 ("c06", 8, talk("c06", "Ignacio", shot("Ignacio", IGN, COC, L_DOOR, "worried and kind, he speaks softly", "RIGHT"),
     "worried, kind, soft")),
 # QA c07 v1: decía "firme la hacienda A don Ignacio" (una "a" de más cambia el sentido) -> pausa marcada antes del nombre, sin nada en medio
 ("c07", 8, talk("c07", "Herminia", shot("Herminia", HER, COC, R_STOVE, "sad and calm, her eyes shining", "LEFT"),
     "sad, calm, quiet, she says the first sentence exactly as written, with a clear comma pause right after the word hacienda "
     "and then only the name don Ignacio, adding no extra word or syllable between them, every word said once")),
 ("c08", 8, talk("c08", "Ignacio", shot("Ignacio", IGN, COC, L_DOOR, "his kind face turns serious and upset, he takes off his glasses for a moment", "RIGHT"),
     "surprised, then firm and upset")),
 ("c09", 8, talk("c09", "Herminia", shot("Herminia", HER, COC, R_STOVE, "calm and firm, she raises one open hand gently", "LEFT"),
     "calm, firm, wise")),
 ("c10", 6, talk("c10", "Ignacio", shot("Ignacio", IGN, COC, L_DOOR, "a warm respectful smile, he nods slowly", "RIGHT"),
     "warm, respectful")),
 # 3. Cocina: la firma (suspenso desde c11)
 ("c11", 8, talk("c11", "Gerardo", shot("Gerardo", GER, COC, L_DOOR, "a wide eager smile, he holds the paper out in front of him with both hands", "RIGHT", PAPER),
     "eager, sweet, in a hurry")),
 ("c12", 6, talk("c12", "Herminia", shot("Herminia", HER, COC, R_STOVE, "calm, she holds the paper low in front of her with both hands and looks up from it", "LEFT", PAPER),
     "calm, quiet, knowing")),
 ("c13", 6, talk("c13", "Gerardo", shot("Gerardo", GER, COC, L_DOOR, "a nervous smile, both hands open low", "RIGHT"),
     "nervous, quick, falsely sweet")),
 ("c14", 8, talk("c14", "Herminia", shot("Herminia", HER, COC, R_STOVE, "she reads the paper held low in both hands, then slowly looks up, serious", "LEFT", PAPER),
     "slow, serious, clear")),
 ("r2", 6, f"Close-up of {GER} {COC}, {L_DOOR}, in silence, his smile freezes, his face changes, then he slowly turns his head to his side, {gaze('RIGHT')}; {ONE}; {ALONE}; {NODOUBLE(TWIN['Gerardo'])}. {NOPROP}. Slow push-in. No dialogue."),
 ("c15", 8, talk("c15", "Gerardo", shot("Gerardo", GER, COC, L_DOOR, "shocked and hurt, he turns his head toward his side", "LEFT"),
     "shocked, hurt, disbelieving")),
 ("c16", 8, talk("c16", "Regina", shot("Regina", REG, COC, L_DOOR, "a cold careless smile, she shrugs, chin up", "LEFT"),
     "cold, careless, falsely sweet")),
 ("c17", 8, talk("c17", "Herminia", shot("Herminia", HER, COC, R_STOVE, "sad and dignified, her eyes shining", "LEFT"),
     "sad, dignified, firm")),
 ("c18", 8, talk("c18", "Ignacio", shot("Ignacio", IGN, COC, R_SIDE, "serious and disappointed, his voice low and firm", "LEFT"),
     "disappointed, firm, low")),
 ("c19", 6, talk("c19", "Regina", shot("Regina", REG, COC, L_DOOR, "her proud face breaks, offended, both hands open low", "RIGHT"),
     "offended, arrogant, disbelieving")),
 ("c20", 8, talk("c20", "Ignacio", shot("Ignacio", IGN, COC, R_SIDE, "firm and calm, then a proud look", "LEFT"),
     "firm, calm, proud")),
 ("r3", 6, f"Close-up of {REG} {COC}, {L_DOOR}, in silence, humiliated, she lowers her eyes and presses her red lips together, {gaze('RIGHT')}; {ONE}; {ALONE}; {NODOUBLE(TWIN['Regina'])}. {NOPROP}. Slow push-in. No dialogue."),
 ("c21", 6, talk("c21", "Herminia", shot("Herminia", HER, COC, R_STOVE, "calm and firm, holding the paper low in both hands she slowly rips it in two", "LEFT", PAPER),
     "calm, firm, final")),
 # 4. Justicia (cálida desde c22)
 ("c22", 8, talk("c22", "Gerardo", shot("Gerardo", GER, COC, L_DOOR, "his eyes fill with tears, he lowers his head, ashamed, one open hand on his chest", "RIGHT"),
     "ashamed, sincere, quiet")),
 ("c23", 8, talk("c23", "Herminia", shot("Herminia", HER, COC, R_STOVE, "her eyes shining, a small warm smile, then firm", "LEFT"),
     "warm, motherly, then firm")),
 ("c24", 6, talk("c24", "Gerardo", shot("Gerardo", GER, COC, L_DOOR, "a humble grateful smile, his eyes shining, he nods", "RIGHT"),
     "humble, grateful, sincere")),
 ("c25", 8, talk("c25", "Ignacio", shot("Ignacio", IGN, COC, R_SIDE, "a proud warm smile, one open hand on his chest", "LEFT"),
     "warm, proud, kind")),
 ("c26", 6, talk("c26", "Herminia", shot("Herminia", HER, COC, R_STOVE, "a warm grateful smile, then a little playful", "LEFT"),
     "warm, grateful, a little playful")),
 # CTA con carisma (después del BLACK): Herminia sola en el patio de luces, a cámara
 ("c27", 10, talk("c27", "Herminia", f"Close-up of {HER} {PAT}, alone, standing under the Christmas lights, looking straight into the camera and talking to the viewer from the very first second, "
     f"her lips moving clearly from the first frame; with warmth and charisma, while she speaks she adjusts her wine-red rebozo, tilts her head, smiles, nods and gestures "
     f"with one open hand toward the lights. The courtyard behind her is empty, no other people; {ONE}; {NODOUBLE(TWIN['Herminia'])}. {NOPROP}.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("tears", "shining eyes"), ("his voice breaks", "quiet voice"), ("furious", "upset")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("cold laugh", "short laugh"), ("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "serious"), ("threatening", "serious"),
        ("tense", "serious"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shocked", "surprised"), ("shock", "surprise"), ("cold", "serious"), ("bitter", "serious"), ("arrogant", "proud"), ("hurt", "sad"),
        ("disbelieving", "surprised"), ("ashamed", "sad"), ("goes pale", "changes"), ("eyes open wide", "eyes open"), ("breaks", "changes"),
        ("annoyed", "serious"), ("careless", "calm"), ("defensive", "firm"), ("young", "adult"), ("teenager", "adult"),
        ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"),
        ("¡", ""), ("!", "."), ("scheming", "quiet"), ("rips it in two", "folds it away")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican hacienda on Christmas Eve, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{HERMINIA}", "an older Mexican woman"), ("@{GERARDO}", "a Mexican man"),
         ("@{REGINA}", "an elegant Mexican woman"), ("@{IGNACIO}", "an older Mexican gentleman")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Extreme close-up", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
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
    print("FIN P2", flush=True)

if __name__ == "__main__":
    main()

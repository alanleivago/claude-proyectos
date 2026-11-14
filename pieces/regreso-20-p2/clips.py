"""Genera los clips de regreso-20 PARTE 2 (El Regreso) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4). Copia de camionero-p2/clips.py con sus defensas."""
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
# Geografía fija:
#   Cocina al atardecer (c01-c12, i1): sigue en el mismo segundo de P1 c30. Leonor de pie en la puerta abierta a la IZQUIERDA (mira a la DER.);
#     don Bernardo sentado a la DERECHA en la cabecera de la mesa, junto a la ventana (mira a la IZQ.). Un solo retrato sepia en la pared.
#   Portal, mañana siguiente (r1, c13-c28, r2): Leonor y don Bernardo a la IZQUIERDA (miran a la DER.); Clemencia y Joaquín a la DERECHA con la maleta (miran a la IZQ.).
#   CTA (c29): Leonor sola en el portal, a cámara.
COC = ("in the same rustic ranch kitchen-dining room @{LOC_ADOBE} at dusk, warm adobe walls, a long wooden table, shelves with clay pots, "
       "one single framed old sepia portrait of a moustached man hanging on the wall, warm low amber light from the window; "
       "no extras, nobody else in the room besides the person described")
POR = ("on the shaded front porch @{LOC_TEJABAN} of an old Mexican ranch house the next morning, wooden posts and a tiled roof, a wooden fence, trees and a dirt path behind, "
       "soft clear morning light; no extras, nobody else outside besides the person described")
# Anclas de identidad y ropa (hojas de la Parte 1, mismos nombres de asset). Edades numéricas adultas. Manos abiertas y bajas (sin dedo acusador).
CLE = ("@{CLEMENCIA} (68-year-old woman, grey hair in a tight bun, small gold stud earrings, dark green dress with small white flowers, "
       "a pale grey apron with lace trim, no hat, her hands open and kept low, she never points a finger at anyone)")
LEO = ("@{LEONOR} (46-year-old woman, dark brown hair in a low ponytail, dark teal short-sleeve t-shirt, a beige cotton apron, dark grey long skirt, "
       "no jewelry, no hat, she never points a finger at anyone)")
JOA = ("@{JOAQUIN} (44-year-old man, short black hair, thick black moustache, red and brown plaid long-sleeve shirt, blue jeans, "
       "a brown leather belt, no hat, his hands open and kept low, he never points a finger at anyone)")
BER = ("@{BERNARDO} (62-year-old man, grey hair combed back, neat grey moustache, light beige guayabera shirt, tan trousers, no hat, calm and kind)")
# QA padre-veladoras-p2 c30 / sazon-concha i1 / regreso-chicago-p2 c11 / medalla-mezcal-p2: utilería duplicada o inventada -> cada objeto, uno solo, y nada más en las manos
LETTER = ("There is only ONE paper in the whole shot: one single old yellowed folded sheet handwritten in faded ink, the writing too small to read, "
          "no envelope, no wax seal, no folder, no other papers")
BAG = "There is only ONE suitcase in the whole shot: one single old brown suitcase standing on the floor beside him; no other bags"
NOPROP = "There is no paper, phone, key, cup or bag in anyone's hands"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
# QA gardenia / posada / intercambio: el doble del mismo personaje (misma ropa) en el borde -> NODOUBLE con la ropa de cada uno
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
TWIN = {"Leonor": "woman in a teal t-shirt", "Bernardo": "man in a beige guayabera", "Clemencia": "woman in a green floral dress",
        "Joaquín": "man in a plaid shirt"}

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def shot(who, person, place, where, action, side, prop=NOPROP):
    return f"Close-up of {person} {place}, {where}, {action}, {gaze(side)}; {ONE}; {ALONE}; {NODOUBLE(TWIN[who])}. {prop}."

L_DOOR = "standing on the LEFT in the open doorway"
R_TAB = "sitting on the RIGHT at the head of the wooden table, by the window"
L_POR = "standing on the LEFT by a wooden post"
R_POR = "standing on the RIGHT near the porch steps"

CLIPS = [
 # 1. Cocina al atardecer: sigue en el mismo segundo de P1 c30 (Leonor habla desde el frame 0, sin plano abierto)
 ("c01", 8, talk("c01", "Leonor", shot("Leonor", LEO, COC, L_DOOR, "already standing still in the doorway from the first frame, confused and worried", "RIGHT"),
     "confused, quiet, a little worried")),
 ("c02", 8, talk("c02", "Bernardo", shot("Bernardo", BER, COC, R_TAB, "surprised for a second, then calm and serious, he gestures to a chair with one open hand", "LEFT"),
     "surprised, then calm and serious")),
 ("c03", 8, talk("c03", "Bernardo", shot("Bernardo", BER, COC, R_TAB, "serious and warm, he holds the old folded letter low in front of him with both hands", "LEFT", LETTER),
     "serious, warm, slow")),
 # QA P2 i1: mangas de franela a cuadros gris oscuro (Bernardo lleva guayabera beige) -> puños de la guayabera beige descritos
 ("i1", 6, f"Close-up {COC}: on the wooden table, the hands of @{{BERNARDO}}, an older man wearing a light beige linen long-sleeve guayabera shirt, "
           f"only the light beige cuffs and sleeves visible (no plaid, no flannel, no dark sleeves), slowly unfold one single old yellowed sheet of paper handwritten in faded ink, "
           f"the writing too small to read; only the hands and the paper in frame, no faces; no second sheet under it, no envelope, no seal, no folder, no other papers; static shot, slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Leonor", shot("Leonor", LEO, COC, L_DOOR, "her eyes shining, one open hand on her chest, moved", "RIGHT"),
     "moved, soft, surprised")),
 ("c05", 8, talk("c05", "Bernardo", shot("Bernardo", BER, COC, R_TAB, "calm and serious, he nods slowly", "LEFT"),
     "calm, clear, firm")),
 ("c06", 8, talk("c06", "Leonor", shot("Leonor", LEO, COC, L_DOOR, "she shakes her head slowly, not wanting to believe it", "RIGHT"),
     "surprised, hurt, quiet")),
 ("c07", 8, talk("c07", "Bernardo", shot("Bernardo", BER, COC, R_TAB, "serious, his voice low, he looks down for a moment and then up", "LEFT"),
     "low, serious, sad")),
 ("c08", 8, talk("c08", "Bernardo", shot("Bernardo", BER, COC, R_TAB, "firm and calm, both hands resting open on the table", "LEFT"),
     "firm, calm, sure")),
 ("c09", 6, talk("c09", "Leonor", shot("Leonor", LEO, COC, L_DOOR, "her eyes shining, a small hopeful smile", "RIGHT"),
     "moved, soft, grateful")),
 ("c10", 8, talk("c10", "Bernardo", shot("Bernardo", BER, COC, R_TAB, "a warm kind smile, then serious again", "LEFT"),
     "warm, kind, then serious")),
 ("c11", 6, talk("c11", "Leonor", shot("Leonor", LEO, COC, L_DOOR, "surprised, she frowns a little", "RIGHT"),
     "surprised, quick")),
 ("c12", 8, talk("c12", "Bernardo", shot("Bernardo", BER, COC, R_TAB, "a small knowing smile, calm, he raises his eyebrows", "LEFT"),
     "calm, a little playful, knowing")),
 # 2. Portal, mañana siguiente (Leonor y Bernardo IZQ.; Clemencia y Joaquín DER.)
 ("r1", 6, f"Close-up of {JOA} {POR}, {R_POR}, in silence, impatient, he taps his foot and sighs, {gaze('LEFT')}; {ONE}; {ALONE}; {NODOUBLE(TWIN['Joaquín'])}. {BAG}. Slow push-in. No dialogue."),
 # QA P2 c13: repitió "por su culpa nos regresamos" -> sin "fast", cada frase una sola vez
 ("c13", 8, talk("c13", "Joaquín", shot("Joaquín", JOA, POR, R_POR, "impatient and annoyed, both hands open low", "LEFT", BAG),
     "impatient, annoyed, clear and unhurried, every word said only once, no repeated phrase")),
 ("c14", 6, talk("c14", "Bernardo", shot("Bernardo", BER, POR, L_POR, "calm and serious, his hands open and relaxed", "RIGHT"),
     "calm, serious, firm")),
 ("c15", 8, talk("c15", "Leonor", shot("Leonor", LEO, POR, L_POR, "serious and dignified, she holds the old folded letter low in front of her with both hands", "RIGHT", LETTER),
     "serious, dignified, steady")),
 ("c16", 6, talk("c16", "Clemencia", shot("Clemencia", CLE, POR, R_POR, "her face goes pale, her eyes open wide, she speaks before thinking", "LEFT"),
     "shocked, fast, then she stops herself")),
 ("c17", 8, talk("c17", "Leonor", shot("Leonor", LEO, POR, L_POR, "her eyes fill with tears, hurt and disbelieving", "RIGHT"),
     "hurt, disbelieving, soft")),
 ("c18", 8, talk("c18", "Clemencia", shot("Clemencia", CLE, POR, R_POR, "cold and bitter, chin up, arms crossed", "LEFT"),
     "cold, bitter, defensive")),
 ("c19", 8, talk("c19", "Bernardo", shot("Bernardo", BER, POR, L_POR, "calm and serious, a slow nod", "RIGHT"),
     "calm, serious, slow")),
 ("c20", 6, talk("c20", "Joaquín", shot("Joaquín", JOA, POR, R_POR, "annoyed, a cold laugh and a shrug", "LEFT"),
     "annoyed, cold, careless")),
 ("c21", 6, talk("c21", "Clemencia", shot("Clemencia", CLE, POR, R_POR, "her proud face breaks, her eyes shining, she turns her head toward her son", "RIGHT"),
     "hurt, quiet, disbelieving")),
 ("c22", 6, talk("c22", "Joaquín", shot("Joaquín", JOA, POR, R_POR, "cold, he looks away and puts one hand on the handle of the suitcase beside him", "LEFT", BAG),
     "cold, careless, short")),
 ("r2", 6, f"Medium wide shot {POR}: seen from behind, @{{JOAQUIN}} (red and brown plaid shirt, blue jeans, no hat) walks away alone down the dirt path carrying one single old brown suitcase, "
           f"getting smaller in the distance; he is the only person in the whole shot, nobody walks with him, nobody on the porch; static camera. No dialogue."),
 # 3. Justicia (cálida desde c23)
 ("c23", 6, talk("c23", "Clemencia", shot("Clemencia", CLE, POR, R_POR, "humble, her eyes shining, her hands joined in front of her", "LEFT"),
     "humble, quiet, sad")),
 ("c24", 8, talk("c24", "Leonor", shot("Leonor", LEO, POR, L_POR, "calm and dignified, her eyes shining, a small sad smile", "RIGHT"),
     "calm, dignified, warm")),
 ("c25", 6, talk("c25", "Leonor", shot("Leonor", LEO, POR, L_POR, "firm and calm, chin up", "RIGHT"),
     "firm, calm, sure")),
 ("c26", 6, talk("c26", "Clemencia", shot("Clemencia", CLE, POR, R_POR, "she lowers her head, ashamed, and nods slowly", "LEFT"),
     "ashamed, quiet")),
 ("c27", 8, talk("c27", "Bernardo", shot("Bernardo", BER, POR, L_POR, "a proud warm smile, one open hand on his chest", "RIGHT"),
     "warm, proud, kind")),
 ("c28", 6, talk("c28", "Leonor", shot("Leonor", LEO, POR, L_POR, "her eyes shining, a warm grateful smile", "RIGHT"),
     "warm, grateful, moved")),
 # CTA con carisma (después del BLACK): Leonor sola en el portal, a cámara
 ("c29", 10, talk("c29", "Leonor", f"Close-up of {LEO} {POR}, alone, standing on her porch, looking straight into the camera and talking to the viewer from the very first second, "
     f"her lips moving clearly from the first frame; with warmth and charisma, while she speaks she tucks a strand of hair behind her ear, nods, tilts her head, smiles and gestures "
     f"with one open hand toward her house. The porch behind her is empty, no other people; {ONE}; {NODOUBLE(TWIN['Leonor'])}. {NOPROP}.",
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
        ("¡", ""), ("!", "."), ("Arréglense ustedes", "Allá ustedes")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic Mexican ranch, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{CLEMENCIA}", "an older Mexican ranch woman"), ("@{LEONOR}", "a Mexican ranch woman"),
         ("@{JOAQUIN}", "a Mexican man"), ("@{BERNARDO}", "an older Mexican rancher")]
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

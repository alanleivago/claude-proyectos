"""Genera los clips de nochebuena PARTE 1 (La Cena de Nochebuena, historia original) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / regreso-20 c25: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA padre-veladoras-p2 / agua-hacienda-p2 / medalla-mezcal-p2 / regreso-20: con alguien de espaldas en el borde la cámara se corre (sombrero/hombro flotando)
# o el del borde se vuelve otra persona -> SOLO primeros planos limpios de una persona, mirando al otro fuera de cuadro. Nada de over-the-shoulder. Nadie con sombrero.
# Geografía fija:
#   Patio de luces, llegada (c01-c04, r1): Gerardo a la IZQUIERDA; Herminia a la DERECHA junto a la puerta.
#   Comedor, presentación (c05-c10, r2, i2): Regina y Gerardo a la IZQUIERDA junto al nacimiento; Herminia a la DERECHA junto a la puerta.
#   Cocina (i1, r3, c11-c20, r4, r5): Ignacio a la IZQUIERDA en la puerta; Herminia a la DERECHA junto al fogón y la olla de ponche.
#   Comedor, cena (c21-c30, r6, r7): Gerardo y Regina sentados a la IZQUIERDA; Ignacio de pie a la DERECHA en la cabecera; Herminia de pie a la DERECHA.
#   Patio, gancho (c31, c32): Gerardo a la IZQUIERDA; Regina a la DERECHA, la piñata de estrella arriba al fondo. CTA (c33): Herminia sola en la cabecera.
PAT = ("in the night courtyard entrance @{LOC_PATIOPINATA} of an old Mexican hacienda on Christmas Eve, an arched stone portal with strings of warm "
       "multicolor Christmas lights, paper lanterns, red poinsettias in clay pots, one single colorful seven-pointed star piñata hanging high in the background; "
       "no extras, nobody else outside besides the people described")
COM = ("in the elegant hacienda dining room @{LOC_COMEDORLUCES} on Christmas Eve, thick white walls with dark wooden beams, warm string lights, red poinsettias, "
       "a long wooden table with a white tablecloth and candles, one single nativity scene of small painted clay figures on moss in the corner; "
       "no extras, nobody else in the room besides the people described")
COC = ("in the traditional hacienda kitchen @{LOC_COCINAPONCHE} at night, blue and white talavera tiles, a brick wood stove, hanging clay pots, strings of dried chiles, "
       "warm amber light; no extras, nobody else in the kitchen besides the people described")
# Anclas de identidad y ropa (mestizos mexicanos). Edades numéricas adultas solo en el prompt, nunca en el diálogo. Manos abiertas y bajas (sin dedo acusador).
HER = ("@{HERMINIA} (64-year-old woman, black hair with grey streaks in a low braid, small silver earrings, a simple navy-blue long-sleeve dress, "
       "a wine-red rebozo shawl over her shoulders, her hands open and kept low, she never points a finger at anyone)")
GER = ("@{GERARDO} (38-year-old man, short neatly combed black hair, clean-shaven, charcoal grey blazer over a white open-collar shirt, black trousers, "
       "a silver watch, no tie, no hat, his hands open and kept low, he never points a finger at anyone)")
REG = ("@{REGINA} (32-year-old woman, long wavy light-brown hair, emerald satin long-sleeve dress, gold hoop earrings, red lipstick, "
       "her hands open and kept low, she never points a finger at anyone)")
IGN = ("@{IGNACIO} (66-year-old man, short grey hair, clean-shaven, round wire glasses, dark brown corduroy jacket over a cream turtleneck sweater, "
       "brown trousers, no hat, calm and kind)")
# QA padre-veladoras-p2 / medalla-mezcal-p2: utilería duplicada -> cada objeto, uno solo
POT = "one single large clay pot of steaming ponche with guava and cinnamon sticks"
CUP = "one single small clay cup of ponche"
BASKET = "one single small basket covered with an embroidered white cloth"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
# QA regreso-20 v1/v2: dobles y extras en los bordes, personajes entrando a cuadro, planos por encima del hombro, 2ª frase perdida
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
look = lambda who, side: f"{SOLO}, looking at {who} off-screen to the {side}"
CU = lambda who, where, how, eyes: f"Close-up of {who} {where}, {how}, {ONE}, {ALONE}, {eyes}."

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    both = f" {who} speaks from the first second and says both sentences completely before the clip ends." if len(L[cid]) > 1 else f" {who} speaks from the first second."
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}{both} {NOSUB}"

CLIPS = [
 # 1. Patio de luces: la llegada (Gerardo IZQUIERDA; Herminia DERECHA). Gerardo habla desde el frame 0: la humillación en la 1ª línea, sin plano abierto.
 ("c01", 8, talk("c01", "Gerardo", CU(GER, PAT, "standing on the LEFT under the Christmas lights, uneasy, his voice low", look("his mother", "RIGHT")),
     "low, embarrassed, firm")),
 ("c02", 8, talk("c02", "Herminia", CU(HER, PAT, f"standing on the RIGHT by the wooden door, holding {BASKET}, surprised and hurt, eyes shining", look("her son", "LEFT")),
     "hurt, surprised, soft")),
 ("c03", 8, talk("c03", "Gerardo", CU(GER, PAT, "standing on the LEFT, he glances at her shawl and shakes his head", look("his mother", "RIGHT")),
     "cold, ashamed, impatient")),
 ("r1", 6, f"Close-up of {HER} {PAT}, standing on the RIGHT, in silence, eyes shining, she pulls the wine-red rebozo closer around her shoulders, {ONE}, {ALONE}, {look('her son', 'LEFT')}. Slow push-in. No dialogue."),
 ("c04", 8, talk("c04", "Herminia", CU(HER, PAT, "standing on the RIGHT, a sad dignified small smile, eyes shining", look("her son", "LEFT")),
     "sad, dignified, quiet")),
 # 2. Comedor: la presentación (Regina y Gerardo IZQUIERDA junto al nacimiento; Herminia DERECHA junto a la puerta)
 ("c05", 6, talk("c05", "Regina", CU(REG, COM, "standing on the LEFT beside the nativity scene, a bright smile that turns curious", look("Gerardo and the woman beside him", "RIGHT")),
     "sweet, then curious and a little snobbish")),
 ("c06", 8, talk("c06", "Gerardo", CU(GER, COM, "standing on the LEFT, a forced polite smile, he avoids looking at his mother", gaze("RIGHT")),
     "polite, nervous, a little cold")),
 ("r2", 6, f"Close-up of {HER} {COM}, standing on the RIGHT by the doorway, in silence, eyes shining, a small dignified nod, {ONE}, {ALONE}, {look('her son', 'LEFT')}. Slow push-in. No dialogue."),
 ("c07", 8, talk("c07", "Regina", CU(REG, COM, "standing on the LEFT, a cold polite smile, chin up, one open hand gesturing toward the back of the house", look("Herminia", "RIGHT")),
     "snobbish, cold, falsely sweet")),
 ("c08", 8, talk("c08", "Herminia", CU(HER, COM, "standing on the RIGHT by the doorway, calm, she glances fondly toward the nativity scene off-screen", look("Regina", "LEFT")),
     "calm, polite, nostalgic")),
 ("i2", 6, f"Close-up insert {COM}: the nativity scene of small painted clay figures on green moss and hay, warm string lights blinking softly around it. No people, no hands. Slow push-in. No dialogue."),
 ("c09", 6, talk("c09", "Regina", CU(REG, COM, "standing on the LEFT, puzzled, she frowns slightly", look("Herminia", "RIGHT")),
     "puzzled, suspicious")),
 ("c10", 6, talk("c10", "Gerardo", CU(GER, COM, "standing on the LEFT, nervous, he nods quickly toward the back of the house", look("his mother", "RIGHT")),
     "nervous, impatient, firm")),
 # 3. Cocina: la verdad (Ignacio IZQUIERDA en la puerta; Herminia DERECHA junto al fogón)
 ("i1", 6, f"Extreme close-up insert {COC}: {POT} on the brick stove, steam rising, a wooden spoon resting on the rim, a plate of golden buñuelos beside it. No people, no hands. No dialogue."),
 ("r3", 6, f"Close-up of {HER} {COC}, standing on the RIGHT at the brick stove beside {POT}, in silence, eyes shining, she slowly stirs the ponche with a wooden spoon, {ONE}, {ALONE}. Slow push-in. No dialogue."),
 ("c11", 8, talk("c11", "Ignacio", CU(IGN, COC, "standing on the LEFT in the kitchen doorway, he breathes in the smell and smiles, moved", look("the cook", "RIGHT")),
     "warm, nostalgic, surprised")),
 ("c12", 6, talk("c12", "Herminia", CU(HER, COC, f"standing on the RIGHT beside {POT}, a small knowing smile", look("Ignacio", "LEFT")),
     "calm, warm, knowing")),
 ("c13", 6, talk("c13", "Ignacio", CU(IGN, COC, "standing on the LEFT, astonished, he takes off his glasses slowly", look("Herminia", "RIGHT")),
     "astonished, emotional")),
 ("c14", 8, talk("c14", "Herminia", CU(HER, COC, "standing on the RIGHT, a tender nostalgic smile, eyes shining", look("Ignacio", "LEFT")),
     "tender, nostalgic")),
 ("c15", 8, talk("c15", "Ignacio", CU(IGN, COC, "standing on the LEFT, serious and moved, one hand on his chest", look("Herminia", "RIGHT")),
     "serious, sincere, moved")),
 ("r4", 6, f"Close-up of {HER} {COC}, standing on the RIGHT beside {POT}, in silence, she lowers the wooden spoon, eyes shining, {ONE}, {ALONE}, {look('Ignacio', 'LEFT')}. Slow push-in. No dialogue."),
 ("c16", 8, talk("c16", "Herminia", CU(HER, COC, "standing on the RIGHT, eyes shining, calm and humble", look("Ignacio", "LEFT")),
     "humble, quiet, sincere")),
 ("c17", 6, talk("c17", "Ignacio", CU(IGN, COC, "standing on the LEFT, surprised, he tilts his head", look("Herminia", "RIGHT")),
     "surprised, curious")),
 # QA v1: c18 salió con la 2ª frase quemada como subtítulo (3.2-6.0 s) -> gaze + CLEAN además de NOSUB
 ("c18", 8, talk("c18", "Herminia", CU(HER, COC, "standing on the RIGHT, a sad small smile, her voice low", gaze("LEFT")),
     "sad, low, dignified") + " " + CLEAN),
 ("r5", 6, f"Close-up of {IGN} {COC}, standing on the LEFT in the doorway, in silence, his surprise slowly turns serious, {ONE}, {ALONE}, {look('Herminia', 'RIGHT')}. Slow push-in. No dialogue."),
 ("c19", 8, talk("c19", "Ignacio", CU(IGN, COC, "standing on the LEFT, serious and upset, decided", look("Herminia", "RIGHT")),
     "upset, firm, protective")),
 ("c20", 8, talk("c20", "Herminia", CU(HER, COC, "standing on the RIGHT, calm, one open hand raised softly to stop him, a serene determined look", look("Ignacio", "LEFT")),
     "calm, serene, determined")),
 # 4. Comedor: la cena (Gerardo y Regina sentados IZQUIERDA; Ignacio de pie DERECHA en la cabecera; Herminia de pie DERECHA)
 ("c21", 8, talk("c21", "Gerardo", CU(GER, COM, f"seated on the LEFT at the dinner table, raising {CUP} in a toast, a proud confident smile", gaze("RIGHT")),
     "proud, confident, festive")),
 ("c22", 6, talk("c22", "Gerardo", CU(GER, COM, "seated on the LEFT at the table, a cold polite smile, he does not look up", look("his mother", "RIGHT")),
     "cold, polite, superior")),
 ("c23", 6, talk("c23", "Herminia", CU(HER, COM, "standing still on the RIGHT by the nativity scene, eyes shining, a calm dignified nod", look("her son", "LEFT")),
     "quiet, calm, dignified")),
 ("c24", 8, talk("c24", "Ignacio", CU(IGN, COM, "standing on the RIGHT at the head of the table, one hand resting on the back of an empty carved wooden chair, calm and firm", look("Herminia", "LEFT")),
     "calm, firm, respectful")),
 ("r6", 6, f"Close-up of {GER} {COM}, seated on the LEFT at the table, in silence, his toasting smile freezes into surprise, {ONE}, {ALONE}, {look('Ignacio', 'RIGHT')}. Slow push-in. No dialogue."),
 ("c25", 6, talk("c25", "Regina", CU(REG, COM, "seated on the LEFT at the table, confused, a nervous little laugh", look("her father", "RIGHT")),
     "confused, nervous")),
 ("c26", 8, talk("c26", "Ignacio", CU(IGN, COM, "standing on the RIGHT at the head of the table, calm and serious, one open hand toward the room", look("Regina", "LEFT")),
     "calm, serious, firm")),
 ("c27", 6, talk("c27", "Gerardo", CU(GER, COM, "seated on the LEFT, pale, a nervous smile", look("Ignacio", "RIGHT")),
     "nervous, disbelieving")),
 ("c28", 6, talk("c28", "Herminia", CU(HER, COM, "standing on the RIGHT, calm, eyes shining, chin up with dignity", look("her son", "LEFT")),
     "calm, dignified, firm")),
 ("c29", 6, talk("c29", "Regina", CU(REG, COM, "seated on the LEFT, shocked, her eyes wide", look("Gerardo beside her", "LEFT")),
     "shocked, disbelieving")),
 ("c30", 8, talk("c30", "Herminia", CU(HER, COM, "standing on the RIGHT, calm and serene, a soft sad smile", look("her son", "LEFT")),
     "calm, serene, firm")),
 ("r7", 6, f"Close-up of {GER} {COM}, seated on the LEFT at the table, in silence, he slowly lowers his eyes, ashamed, {ONE}, {ALONE}. Slow push-in. No dialogue."),
 # 5. Patio: el gancho (Gerardo IZQUIERDA; Regina DERECHA)
 ("c31", 8, talk("c31", "Regina", CU(REG, PAT, "standing on the RIGHT under the Christmas lights, her voice low, calculating", look("Gerardo", "LEFT")),
     "low, calculating, cold")),
 ("c32", 8, talk("c32", "Gerardo", CU(GER, PAT, "standing on the LEFT, he slowly looks up at the star piñata off-screen, then a cold small smile", gaze("RIGHT")),
     "low, cold, decided")),
 # CTA con carisma (después del BLACK): Herminia sola en la cabecera
 ("c33", 8, talk("c33", "Herminia", f"Close-up of {HER} {COM}, seated alone at the head of the table, looking straight into the camera and talking to the viewer from the very first second, with warmth and charisma, her lips moving clearly; while she speaks she adjusts her wine-red rebozo, tilts her head, smiles, nods and gestures with one open hand. The room behind her is empty, no other people. {CLEAN}",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("breaking", "trembling"),
        ("staring at", "looking at")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("dismissive", "serious"),
        ("mocking", "amused"), ("bitter", "sad"), ("stern", "serious"), ("suspicious", "thoughtful"), ("mysterious", "thoughtful"), ("trembling", "soft"),
        ("young", "adult"), ("teenager", "adult"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("annoyed", "serious"), ("cold", "serious"), ("ironic", "calm"), ("indifferent", "calm"),
        ("ashamed", "uneasy"), ("embarrassed", "uneasy"), ("snobbish", "proud"), ("calculating", "thoughtful"), ("superior", "proud"),
        ("shocked", "surprised"), ("upset", "serious"), ("pale", "surprised"), ("impatient", "hurried"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm Christmas lights, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican hacienda on Christmas Eve, warm cinematic light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family Christmas drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{HERMINIA}", "a Mexican woman"), ("@{GERARDO}", "a Mexican man"), ("@{REGINA}", "an elegant Mexican woman"), ("@{IGNACIO}", "a Mexican gentleman")]
TRIES = 6

def sub(body, pairs):
    """Reemplazo por palabra completa (\\b solo en los bordes alfanuméricos): 'cold' no toca 'scold', 'rage' no toca 'garage'."""
    for a, b in pairs:
        body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    return body

def variant(body, k):
    body = sub(body, SAFE)
    if k >= 1: body = sub(body, SOFT)
    if k >= 3: body = body.replace("Extreme close-up insert", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4: body = sub(body, NOREF)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (NOSUB queda, va después del diálogo)
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body).replace(" and says both sentences completely before the clip ends", "")
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

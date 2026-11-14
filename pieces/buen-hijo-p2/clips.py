"""Genera los clips de buen-hijo PARTE 2 (El Buen Hijo) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / reten-sierra-p2 / mecanico / sazon-concha: subtítulos quemados -> al final de cada clip con diálogo
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA recetario c04 / agua-hacienda-p2 c13 / medalla-mezcal-p2 c01 / regreso-20 c28 / chocolate-rancho-p2 c34: frase o palabra repetida al final
END = "After the last word the person stays silent until the end of the shot."
# QA camionero / posada / regreso-20 / padre-veladoras / encendedor / regreso-chicago-p2: dobles y nucas en los bordes -> SOLO primeros planos
# limpios de una persona (ONE + ALONE), mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder ni plano medio con dos.
# Sin sombreros (padre-veladoras-p2 / fierro-herradura / medalla-mezcal-p2: sombreros flotando o duplicados): nadie lleva sombrero ni gorra.
# Geografía fija:
#   Cocina de la nana (c01-c09, sigue en el mismo segundo de P1 c30/c31): Tadeo sentado a la mesa a la IZQUIERDA (mira a la DER.);
#     Aurelia de pie a la DERECHA (mira a la IZQ.).
#   Salón de la casa (r1, c10-c28, CTA c29): Tadeo y Aurelia a la IZQUIERDA junto a la puerta de entrada (miran a la DER.);
#     Abundio y Román a la DERECHA junto a la escalera (miran a la IZQ.), igual que P1 c23.
# QA P2: salón clásico con barandal en r1/c10/c12/c14/c18/c20/c23 -> se describe el moderno de la hoja (escalera flotante sin barandal)
SAL = ("in the elegant modern minimalist living room @{LOC_SALON} of a wealthy Mexican house, a floating dark wood staircase with no railing, beige sofas, a dark wood coffee table, floor lamps, "
       "warm golden-hour window light; no extras, nobody else in the room")
FOG = ("in the warm bright kitchen @{LOC_FOGON} of a modest Mexican house, a wooden table with a woven placemat, clay pots on the wall, "
       "soft morning window light; no extras, nobody else in the kitchen")
# Anclas de identidad (hojas de la Parte 1, revisadas en hoja de contactos). Manos abiertas, nadie señala; sin sombreros.
ABU = ("@{ABUNDIO} (62-year-old Mexican mestizo man, brown skin, grey hair combed back, thick grey moustache, no beard, no hat, "
       "light beige long-sleeve dress shirt, dark brown trousers, brown leather belt, brown leather shoes, his hands open, he never points a finger at anyone)")
TAD = ("@{TADEO} (27-year-old Mexican mestizo man, brown skin, short curly black hair, clean-shaven, no moustache, no beard, no hat, "
       "sage green long-sleeve button shirt, light grey chinos, white sneakers)")
ROM = ("@{ROMAN} (32-year-old Mexican mestizo man, brown skin, black hair combed back, clean-shaven, no moustache, no beard, no hat, "
       "navy blue long-sleeve shirt, black trousers, silver wristwatch, black shoes, his hands open, he never points a finger at anyone)")
AUR = ("@{AURELIA} (70-year-old Mexican mestiza woman, brown skin, grey hair in a low bun, no hat, white blouse, turquoise apron, "
       "dark brown skirt, brown flat shoes)")
NOBADGE = "Nobody wears an ID badge or a lanyard"
# QA medalla-mezcal-p2 / padre-veladoras-p2 / tele-nueva / buen-hijo c29 / chocolate-rancho-p2 (sobre lacrado): utilería duplicada o inventada
# -> UNA sola carta, doblada, en una sola mano, sin sobre ni sello; letra diminuta ilegible. Sin cafetera ni jarra en las manos (buen-hijo c29).
def LET(who, open_=False):
    return (f"There is only ONE letter in the whole shot: one single folded sheet of cream paper, held only by {who}, "
            + ("unfolded, covered in tiny faded handwriting too small to read" if open_ else "folded closed, nothing written on it can be seen")
            + "; no envelope, no wax seal, no second paper anywhere")
NOLET = "There is no letter, paper, envelope, cup or coffee pot in anyone's hands"
# QA camionero v1: alguien de espaldas/de perfil en el borde y dobles en primer plano mientras hablan desde el inicio -> ONE + ALONE + gaze
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB}"

def shot(person, place, where, action, side, prop=NOLET):
    return f"Close-up of {person} {place}, {where}, {action}, {gaze(side)}; {ONE}; {ALONE}. {prop}. {NOBADGE}."

T_FOG = "seated at the wooden table on the LEFT"
A_FOG = "standing on the RIGHT next to the table"
T_SAL = "standing on the LEFT near the front door"
A_SAL = "standing on the LEFT near the front door"
B_SAL = "standing on the RIGHT next to the staircase"

CLIPS = [
 # 1. La cocina de la nana: sigue en el mismo segundo de P1 c31 (Aurelia habla desde el frame 0, sin plano abierto)
 ("c01", 10, talk("c01", "Aurelia", shot(AUR, FOG, A_FOG, "serious, her voice low, her hands resting on the back of a chair", "LEFT"),
     "serious, low, grave; she says the first long sentence in one breath, every word clear and complete")),
 ("c02", 8, talk("c02", "Tadeo", shot(TAD, FOG, T_FOG, "surprised and confused, his open hands on the table", "RIGHT"),
     "surprised, confused, quiet")),
 ("c03", 8, talk("c03", "Aurelia", shot(AUR, FOG, A_FOG, "a sad tender smile, remembering", "LEFT"),
     "tender, nostalgic, quiet")),
 ("c04", 8, talk("c04", "Aurelia", shot(AUR, FOG, A_FOG, "holding the folded letter out gently in one hand at chest height, her eyes shining", "LEFT", LET("Aurelia")),
     "tender, serious, emotional")),
 ("c05", 8, talk("c05", "Tadeo", shot(TAD, FOG, T_FOG, "holding the folded letter against his chest with both hands, his eyes shining", "RIGHT", LET("Tadeo")),
     "moved, surprised, sad")),
 ("c06", 8, talk("c06", "Aurelia", shot(AUR, FOG, A_FOG, "she lowers her eyes, ashamed, her hands empty and folded in front of her apron", "LEFT"),
     "ashamed, sad, quiet")),
 ("c07", 8, talk("c07", "Tadeo", shot(TAD, FOG, T_FOG, "sad, the folded letter held low in his left hand, his right hand open", "RIGHT", LET("Tadeo")),
     "sad, quiet, hurt")),
 ("c08", 10, talk("c08", "Aurelia", shot(AUR, FOG, A_FOG, "a warm sad smile, her eyes shining, one hand on her heart", "LEFT"),
     "tender, sad, sincere")),
 ("c09", 8, talk("c09", "Tadeo", shot(TAD, FOG, "now standing up on the LEFT next to the table", "calm and decided, holding the folded letter in his left hand", "RIGHT", LET("Tadeo")),
     "calm, firm, decided")),
 # 2. De vuelta en el salón (Tadeo y Aurelia IZQ.; Abundio y Román DER.)
 ("r1", 6, f"Close-up of {ABU} {SAL}, {B_SAL}, in silence, he looks up toward the front door and freezes, surprised, {gaze('LEFT')}; {ONE}; {ALONE}. {NOLET}. {NOBADGE}. Slow push-in. No dialogue."),
 ("c10", 8, talk("c10", "Abundio", shot(ABU, SAL, B_SAL, "cold and serious, his arms crossed", "LEFT"),
     "cold, serious, firm")),
 ("c11", 8, talk("c11", "Tadeo", shot(TAD, SAL, T_SAL, "calm and dignified, raising the folded letter a little in his left hand", "RIGHT", LET("Tadeo")),
     "calm, dignified, firm")),
 ("c12", 6, talk("c12", "Román", shot(ROM, SAL, B_SAL, "surprised, his confident face slowly changing", "LEFT"),
     "surprised, curious")),
 ("c13", 10, talk("c13", "Tadeo", shot(TAD, SAL, T_SAL, "reading aloud from the unfolded letter held in both hands at chest height, his voice soft, his eyes shining", "RIGHT", LET("Tadeo", True)),
     "soft, moved, reading slowly")),
 ("c14", 8, talk("c14", "Abundio", shot(ABU, SAL, B_SAL, "serious and stubborn, shaking his head slowly", "LEFT"),
     "cold, stubborn, proud")),
 ("c15", 8, talk("c15", "Aurelia", shot(AUR, SAL, A_SAL, "calm and brave, her hands folded in front of her apron", "RIGHT"),
     "calm, brave, firm")),
 ("c16", 8, talk("c16", "Aurelia", shot(AUR, SAL, A_SAL, "serious, her eyes shining, looking straight across the room", "RIGHT"),
     "serious, firm, emotional")),
 ("c17", 6, talk("c17", "Román", shot(ROM, SAL, B_SAL, "he turns his head slowly, surprised and sad", "LEFT"),
     "surprised, sad, quiet")),
 ("c18", 8, talk("c18", "Abundio", shot(ABU, SAL, B_SAL, "his cold face breaks, he lowers his eyes, sad and tired", "LEFT"),
     "quiet, sad, tired, the coldness gone")),
 # cálida desde c19: el payoff
 ("c19", 8, talk("c19", "Tadeo", shot(TAD, SAL, T_SAL, "sincere, his eyes shining, the folded letter held low in his left hand", "RIGHT", LET("Tadeo")),
     "sincere, sad, gentle")),
 ("c20", 10, talk("c20", "Román", shot(ROM, SAL, B_SAL, "ashamed, his hands open in front of him, he finally tells the truth", "LEFT"),
     "ashamed, sincere, quiet")),
 ("c21", 8, talk("c21", "Abundio", shot(ABU, SAL, B_SAL, "his eyes shining, a small sad smile, humble", "LEFT"),
     "humble, moved, quiet")),
 ("c22", 8, talk("c22", "Tadeo", shot(TAD, SAL, T_SAL, "calm and proud, a small kind smile", "RIGHT", LET("Tadeo")),
     "calm, kind, firm")),
 ("c23", 8, talk("c23", "Aurelia", shot(AUR, SAL, A_SAL, "a big warm smile, her eyes shining, one hand on her heart", "RIGHT"),
     "warm, proud, moved")),
 # 3. Gancho nuevo: doña Petra
 ("c24", 6, talk("c24", "Aurelia", shot(AUR, SAL, A_SAL, "her smile fades into curiosity, she tilts her head", "RIGHT"),
     "curious, gentle")),
 ("c25", 8, talk("c25", "Tadeo", shot(TAD, SAL, T_SAL, "relaxed, a small smile, remembering", "RIGHT", LET("Tadeo")),
     "relaxed, warm")),
 # QA P2 c26: salió sin mandil (playera beige) -> ropa explícita
 ("c26", 8, talk("c26", "Aurelia", shot(AUR, SAL, A_SAL, "she freezes, her eyes wide and shining, one hand slowly covering her lips after she speaks; "
     "she wears her white embroidered blouse with the turquoise apron over it for the whole shot, exactly as in her reference sheet", "RIGHT"),
     "surprised, quiet, grave")),
 # QA P2 c27: subtítulos quemados en las dos frases + mujer de blusa floreada en el borde IZQ. al inicio
 ("c27", 8, talk("c27", "Abundio", shot(ABU, SAL, B_SAL, "he freezes, ashamed, his eyes on the floor; no woman and no floral blouse at the left edge", "LEFT"),
     "ashamed, low, grave") + " No subtitles at any moment, not even during his long first sentence; the middle and lower part of the frame show only his shirt and the room."),
 ("c28", 6, talk("c28", "Tadeo", shot(TAD, SAL, T_SAL, "surprised, his eyes shining, slowly understanding", "RIGHT", LET("Tadeo")),
     "surprised, quiet, moved")),
 # CTA con carisma (después del BLACK): Tadeo solo en el salón, a cámara
 ("c29", 8, talk("c29", "Tadeo", f"Close-up of {TAD} {SAL}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"his lips moving clearly from the first frame; with warmth and charisma, while he speaks he nods, tilts his head, gives a small smile "
     f"and gestures with one open hand. The room behind him is empty, no other people. {NOLET}. {NOBADGE}.",
     "warm, charismatic, a little intriguing, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("tears", "shining eyes"), ("his voice breaks", "quiet voice"), ("furious", "upset")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "serious"), ("threatening", "serious"),
        ("tense", "serious"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shocked", "surprised"), ("shock", "surprise"), ("stubborn", "serious"), ("ashamed", "thoughtful"), ("cold", "serious"),
        ("freezes", "pauses"), ("eyes wide", "eyes open"), ("hurt", "sad"), ("grave", "serious"), ("brave", "calm"), ("proud", "calm"),
        ("young", "adult"), ("teenager", "adult"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("bitter", "serious"),
        ("¡", ""), ("!", "."), ("sacó", "mandó lejos"), ("me iba de la casa", "ya no podía quedarme"), ("ya no vale nada", "ya no importa"),
        ("no te dije la verdad", "me quedé callado")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family story, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{ABUNDIO}", "a Mexican factory owner"), ("@{TADEO}", "a Mexican man"), ("@{ROMAN}", "a Mexican businessman"),
         ("@{AURELIA}", "a Mexican housekeeper")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Extreme close-up", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
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
    print("FIN P2", flush=True)

if __name__ == "__main__":
    main()

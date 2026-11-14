"""Genera los clips de recetario PARTE 2 (El Recetario) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / reten-sierra-p2 / mecanico: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA recetario P1 c04 / agua-hacienda-p2 c13 / medalla-mezcal-p2 c01 / regreso-20 c28: frase o palabra repetida al final -> silencio tras la última palabra
END = "After the last word the person stays silent until the end of the shot."
# QA camionero / posada / regreso-20 / padre-veladoras-p2 / agua-hacienda-p2 y recetario P1 c24 (el Leopoldo del borde era otro hombre): nadie en los bordes.
# SOLO primeros planos limpios de una persona (ONE + ALONE), mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder.
# Geografía fija:
#   Oficina de Samanta (c01-c04, igual que P1 c28/c29): Mireya a la IZQUIERDA (mira a la DER.); Samanta a la DERECHA junto al escritorio (mira a la IZQ.).
#   Cocina de la familia (c05-c12, r1): Hortensia y Chencho sentados a la mesa a la IZQUIERDA (miran a la DER.); Mireya de pie a la DERECHA junto a la puerta (mira a la IZQ.).
#   Cafetería (c13-c19): Leopoldo a la IZQUIERDA (mira a la DER.); Chencho y Hortensia a la DERECHA (miran a la IZQ.), igual que P1 c23/c24.
#   Obrador de Mireya (c20-c27, c30): las visitas (Samanta, Leopoldo) a la IZQUIERDA junto a la puerta (miran a la DER.); Mireya a la DERECHA en la mesa de acero (mira a la IZQ.).
#   Cocina, gancho (c28-c29): Hortensia sentada a la IZQUIERDA (mira a la DER.); Chencho de pie a la DERECHA (mira a la IZQ.).
ALA = ("in the modest warm kitchen @{LOC_ALACENA} of a humble Mexican house, beige tiled walls, a wooden table with a few small clear dessert cups, "
       "an old white fridge, a wooden drawer cabinet with all drawers closed, warm soft window light; no extras, nobody else in the kitchen")
OFI = ("in a bright modern office @{LOC_OFICINA} with a large window over the city, a white desk, cool white daylight; no extras, nobody else in the office")
CAF = ("in a quiet Mexican café @{LOC_CAFETERIA}, a dark wooden table with white coffee cups, brick wall, warm dim light; the café is closed and empty, "
       "no customers at the other tables, nobody in the background")
OBR = ("in a small bright new pastry kitchen @{LOC_OBRADOR}, a stainless steel worktable, white tiled walls, open shelves with baking molds and glass jars, "
       "warm morning window light; no extras, nobody else in the kitchen")
# Anclas de identidad (hojas de la Parte 1, revisadas en hoja de contactos). Manos abiertas, nunca señalan.
MIR = ("@{MIREYA} (28-year-old Mexican mestiza woman, brown skin, long straight dark brown hair, small gold hoop earrings, "
       "sleeveless light lilac dress with a small white flower print and thin straps, white flat sandals)")
CHE = ("@{CHENCHO} (38-year-old Mexican mestizo man, brown skin, heavy build, short black gelled hair, short black beard and black moustache, "
       "pale mint green t-shirt with faint stains, blue jeans, black sneakers, his hands open, he never points a finger at anyone)")
HOR = ("@{HORTENSIA} (62-year-old Mexican mestiza woman, brown skin, dark grey hair pulled back in a bun, small gold earrings, thin gold chain, "
       "light blue floral housedress with short sleeves, beige flat sandals, her hands open, she never points a finger at anyone)")
SAM = ("@{SAMANTA} (42-year-old Mexican mestiza woman, brown skin, shoulder-length wavy brown hair, small pearl earrings, "
       "light grey pantsuit, white silk blouse, black heels)")
LEO = ("@{LEOPOLDO} (45-year-old Mexican mestizo man, brown skin, black hair combed back, short trimmed black beard and black moustache, "
       "lavender pinstriped long-sleeve dress shirt, charcoal trousers, black belt, silver wristwatch, his hands open, he never points a finger at anyone)")
# QA medalla-mezcal-p2 / padre-veladoras-p2 / tele-nueva / buen-hijo: utilería duplicada -> cada objeto, uno solo y en una sola mano
def NB(who, open_=False):
    return (f"There is only ONE notebook in the whole shot: the worn brown leather notebook @{{PROP_RECETARIO}}, held only by {who}, "
            + ("open, its pages covered in tiny faded handwriting too small to read" if open_ else "kept closed") + "; no second notebook anywhere")
NONB = "There is no notebook in the shot"
PAGE = "one single folded sheet of yellowed paper, folded closed, nothing written on it can be seen, no second paper anywhere"
CUP = "one single small clear dessert cup and one spoon, no other cup in her hands"
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

CLIPS = [
 # 1. Recap y golpe: sigue en el mismo segundo de P1 c29 (oficina, Mireya habla desde el frame 0, sin plano abierto)
 ("c01", 10, talk("c01", "Mireya", f"Close-up of {MIR} {OFI}, standing on the LEFT, her eyes shining, in shock but thinking clearly, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "shocked, quiet, realizing; she says the second sentence in one breath, every word clear and complete, with no long pause inside it")),
 ("c02", 8, talk("c02", "Samanta", f"Close-up of {SAM} {OFI}, standing on the RIGHT by the desk, calm and focused, one open hand raised gently, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "calm, focused, warm")),
 ("c03", 8, talk("c03", "Mireya", f"Close-up of {MIR} {OFI}, standing on the LEFT, she breathes, then a small confident smile appears, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "quiet, then confident")),
 ("c04", 8, talk("c04", "Samanta", f"Close-up of {SAM} {OFI}, standing on the RIGHT, smiling with confidence, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "confident, warm, decided")),
 # 2. La cocina de la familia (Hortensia y Chencho IZQ. a la mesa; Mireya DER. junto a la puerta)
 ("c05", 6, talk("c05", "Hortensia", f"Close-up of {HOR} {ALA}, seated at the table on the LEFT, surprised, then a forced sweet smile, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "surprised, fake sweet, ironic")),
 ("c06", 8, talk("c06", "Mireya", f"Close-up of {MIR} {ALA}, standing on the RIGHT by the door, calm and firm, her hands open at her sides, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "calm, firm")),
 ("c07", 8, talk("c07", "Chencho", f"Close-up of {CHE} {ALA}, seated at the table on the LEFT, he shrugs with both hands open, unbothered, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "careless, smug, quick")),
 ("c08", 8, talk("c08", "Mireya", f"Close-up of {MIR} {ALA}, standing on the RIGHT, serious, her eyes shining, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "serious, hurt, controlled")),
 ("c09", 8, talk("c09", "Hortensia", f"Close-up of {HOR} {ALA}, seated at the table on the LEFT, she laughs softly and waves one open hand, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "dismissive, amused")),
 ("c10", 8, talk("c10", "Mireya", f"Close-up of {MIR} {ALA}, standing on the RIGHT, calm, a little sad, then firm, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "calm, sad, firm")),
 ("c11", 6, talk("c11", "Chencho", f"Close-up of {CHE} {ALA}, seated at the table on the LEFT, his half smile fades, he frowns, curious, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "curious, uneasy")),
 ("c12", 8, talk("c12", "Mireya", f"Close-up of {MIR} {ALA}, standing on the RIGHT by the door, a small calm smile, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "calm, sure, a little proud")),
 ("r1", 6, f"Close-up of {HOR} {ALA}, seated at the table on the LEFT, in silence, her smile slowly disappears and she looks down at the table, worried; {ONE}; {ALONE}. {NONB}. Slow push-in. No dialogue."),
 # 3. La cafetería: el postre de Leopoldo no sirve (Leopoldo IZQ.; Chencho y Hortensia DER.)
 ("c13", 8, talk("c13", "Leopoldo", f"Close-up of {LEO} {CAF}, seated at the table on the LEFT, serious and disappointed, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "serious, disappointed, calm")),
 ("c14", 8, talk("c14", "Chencho", f"Close-up of {CHE} {CAF}, seated at the table on the RIGHT, nervous, both hands open in front of his chest, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "nervous, insisting")),
 ("c15", 8, talk("c15", "Leopoldo", f"Close-up of {LEO} {CAF}, seated on the LEFT, he leans back slowly, realizing, calm, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "calm, realizing, serious")),
 ("c16", 8, talk("c16", "Hortensia", f"Close-up of {HOR} {CAF}, seated at the table on the RIGHT, a nervous small smile, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "nervous, fake polite")),
 ("c17", 8, talk("c17", "Leopoldo", f"Close-up of {LEO} {CAF}, seated on the LEFT, calm and firm, holding the closed notebook in both hands against his chest, {gaze('RIGHT')}; {ONE}; {ALONE}. {NB('Leopoldo')}.",
     "calm, firm, final")),
 ("c18", 6, talk("c18", "Chencho", f"Close-up of {CHE} {CAF}, seated on the RIGHT, his face falls, both hands open and empty, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "defeated, quiet")),
 ("c19", 6, talk("c19", "Leopoldo", f"Close-up of {LEO} {CAF}, seated on the LEFT, calm, he adjusts the cuff of his shirt, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "calm, cold, final")),
 # 4. El lanzamiento de Mireya (cama cálida; visitas IZQ., Mireya DER.)
 ("c20", 8, talk("c20", "Samanta", f"Close-up of {SAM} {OBR}, standing on the LEFT, tasting from {CUP}, then smiling, impressed, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "impressed, warm, happy")),
 ("c21", 8, talk("c21", "Mireya", f"Close-up of {MIR} {OBR}, standing on the RIGHT at the steel worktable, smiling with shining happy eyes, one hand on her chest, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "moved, warm, quiet")),
 ("c22", 8, talk("c22", "Leopoldo", f"Close-up of {LEO} {OBR}, standing on the LEFT, humble and serious, holding the closed notebook out in both hands, {gaze('RIGHT')}; {ONE}; {ALONE}. {NB('Leopoldo')}.",
     "humble, serious, sincere")),
 ("c23", 8, talk("c23", "Mireya", f"Close-up of {MIR} {OBR}, standing on the RIGHT, holding the closed notebook against her chest with both hands, her eyes shining, {gaze('LEFT')}; {ONE}; {ALONE}. {NB('Mireya')}.",
     "moved, grateful, quiet")),
 ("c24", 8, talk("c24", "Leopoldo", f"Close-up of {LEO} {OBR}, standing on the LEFT, his hands open and empty, sincere, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "sincere, firm, respectful")),
 ("c25", 8, talk("c25", "Samanta", f"Close-up of {SAM} {OBR}, standing on the LEFT, a proud warm smile, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "warm, proud")),
 # 5. Gancho nuevo: falta una página
 ("c26", 8, talk("c26", "Mireya", f"Close-up of {MIR} {OBR}, standing on the RIGHT, turning the pages of the open notebook held low in both hands, smiling, then her smile fades and she stops, {gaze('LEFT')}; {ONE}; {ALONE}. {NB('Mireya', True)}.",
     "happy, then worried")),
 ("c27", 8, talk("c27", "Mireya", f"Close-up of {MIR} {OBR}, standing on the RIGHT, worried, her eyes shining, she looks up slowly, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "worried, quiet, sad")),
 ("c28", 8, talk("c28", "Chencho", f"Close-up of {CHE} {ALA}, standing on the RIGHT, a calm sly smile, holding up {PAGE} between two fingers, {gaze('LEFT')}; {ONE}; {ALONE}. {NONB}.",
     "sly, amused, low")),
 ("c29", 8, talk("c29", "Hortensia", f"Close-up of {HOR} {ALA}, seated on the LEFT, her smile slowly returns, satisfied, her hands empty, {gaze('RIGHT')}; {ONE}; {ALONE}. {NONB}.",
     "satisfied, smug, low")),
 # CTA con carisma (después del BLACK): Mireya sola en su obrador, a cámara
 ("c30", 10, talk("c30", "Mireya", f"Close-up of {MIR} {OBR}, alone, standing at the steel worktable, looking straight into the camera and talking to the viewer from the very first second, "
     f"her lips moving clearly from the first frame; with warmth and charisma, while she speaks she tucks her hair behind her ear, tilts her head, nods, gives a small smile "
     f"and gestures with one open hand. The kitchen behind her is empty, no other people. {NONB}.",
     "warm, charismatic, a little intriguing, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("tears", "shining eyes")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "serious"), ("threatening", "serious"),
        ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shocked", "surprised"), ("shock", "surprise"), ("dismissive", "relaxed"), ("mocking", "ironic"), ("sly", "calm"), ("greedy", "pleased"),
        ("disappointed", "serious"), ("nervous", "quiet"), ("fake sweet", "sweet"), ("fake polite", "polite"), ("forced", "small"), ("cold", "serious"),
        ("defeated", "quiet"), ("hurt", "sad"), ("uneasy", "thoughtful"), ("young", "adult"), ("teenager", "adult"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("bitter", "serious"), ("arrogant", "proud"),
        ("¡", ""), ("!", "."), ("vendieron", "dieron"), ("vendo recetas", "uso recetas")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family story, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{MIREYA}", "a Mexican pastry cook"), ("@{CHENCHO}", "a Mexican man"), ("@{HORTENSIA}", "a Mexican housewife"),
         ("@{SAMANTA}", "a Mexican businesswoman"), ("@{LEOPOLDO}", "a Mexican businessman"), (" @{PROP_RECETARIO}", "")]
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

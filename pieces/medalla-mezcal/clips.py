"""Genera los clips de medalla-mezcal con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Uso: python -I clips.py [ID ...]"""
import re, subprocess, sys, os, tempfile, time
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = Path(__file__).parent / "clips"
STYLE = ("Cinematic vertical shot from a Mexican telenovela, photorealistic, natural skin texture, 85mm lens, shallow depth of field, "
         "static camera with a very slow push-in. Keep every character exactly as in their reference sheet (same face, hair, clothes, accessories). "
         "No music, no subtitles, no text on screen.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync"
MEZ = "in the yard of the rustic mezcal distillery @{LOC_MEZCALERA}, warm golden hour light, smoke from the earth oven"
CAN = "inside the old village cantina @{LOC_CANTINA}, dim warm light, ceiling fan turning"
PUE = "on the dusty street in front of the old stone church @{LOC_PUEBLO}, late afternoon light"
TER = "on the dirt road through the agave fields @{LOC_TERRACERIA}, dusty golden light"
POR = "in front of the big wooden gate of the mezcal ranch @{LOC_PORTON}, sunset light"

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: la capturan (mezcalera) — sin plano abierto, hablando desde el frame 0
 ("c01", 8, talk("Nicanor", f"Medium close-up of the foreman @{{CAPORAL}} {MEZ}, firmly holding the arm of the dusty young woman @{{HEROINA}} beside him, the blurred hat of @{{ARREOLA}} seated in the foreground.",
     ["Patrón, esta muchacha venía escondida entre las piñas del camión.", "¿Le hablo a la policía, patrón?"], "rough, alert, respectful to his boss")),
 ("c02", 10, talk("Fausto", f"Close-up of @{{ARREOLA}} seated at a wooden table with a clay cup of mezcal {MEZ}, looking up, hard and suspicious.",
     ["¿Vienes a robarme?", "¿Entonces qué hacías en mi camión?", "Ya llegaste. Habla."], "deep, calm, severe voice")),
 ("c03", 10, talk("Marisol", f"Close-up of @{{HEROINA}} {MEZ}, her arm held by the foreman's hand, dust on her face, scared but determined.",
     ["No, señor. Se lo juro.", "Era la única forma de llegar hasta usted.", "Primero que me suelte. Tengo algo que enseñarle."], "nervous, breathless, then firm")),
 ("c04", 10, talk("Fausto", f"Close-up of @{{ARREOLA}} {MEZ}, he raises a hand to the foreman, then stares at something in her hand, shocked, touching the silver horse-head ring on his own finger @{{PROP_ANILLO}}.",
     ["Suéltala, Nicanor.", "¿De dónde sacaste ese anillo?", "Mi padre mandó hacer solo dos."], "commanding, then disturbed")),
 # 2. Revelación
 ("c05", 8, talk("Marisol", f"Medium shot of @{{HEROINA}} {MEZ}, rubbing her arm, then holding out her open palm with an old silver horse-head ring @{{PROP_ANILLO}}.",
     ["¿Conoce este anillo?", "Uno es el suyo. El otro era de Ramiro."], "quiet, steady")),
 ("i1", 6, f"Extreme close-up insert {MEZ}: the open palm of @{{HEROINA}} holding the silver horse-head ring @{{PROP_ANILLO}}; next to it the hand of @{{ARREOLA}} wearing the identical ring. Both rings shine in the sun. No dialogue."),
 ("c06", 10, talk("Fausto", f"Over-the-shoulder close-up of @{{ARREOLA}} (short grey beard, tan palm cowboy hat with a dark leather band, cream linen guayabera shirt, brown leather belt, dark blue jeans) {MEZ}, his eyes narrowing; in the foreground, the blurred back of @{{HEROINA}} seen from behind (long dark braid down her back, faded denim jacket, no embroidered blouse).",
     ["¿Quién te dijo ese nombre?", "¿Y quién es tu mamá?", "Eso no me dice nada."], "cold, suspicious")),
 ("c07", 10, talk("Marisol", f"Close-up of @{{HEROINA}} {MEZ}, eyes wet but holding his gaze.",
     ["Mi mamá. Me habló de él toda la vida.", "Teresa Lozano. Vendía tortillas en el mercado de Ocotlán.", "Antes de morir me pidió que lo buscara."], "soft, sad, sincere")),
 ("c08", 8, talk("Fausto", f"Close-up of @{{ARREOLA}} {MEZ}, slowly standing up from the table, confused.",
     ["¿A mí? ¿Para qué?", "¿Qué estás diciendo, muchacha?"], "low, unsettled")),
 ("c09", 10, talk("Marisol", f"Close-up of @{{HEROINA}} {MEZ}, golden backlight with a soft lens flare, a tear running down her dusty cheek.",
     ["Para decirle que Ramiro tuvo una hija.", "Que Ramiro Arreola era mi papá."], "trembling, emotional, very clear")),
 ("r1", 6, f"Close-up of @{{ARREOLA}} {MEZ}, in silence, looking down at the silver ring on his finger, his eyes fill with tears, jaw tight. No dialogue."),
 # 3. Duda y objeto clave
 ("c10", 10, talk("Fausto", f"Close-up of @{{ARREOLA}} {MEZ}, voice breaking, then hard again.",
     ["A mi hermano lo mataron hace veintidós años.", "¿Y por qué nunca supe de ti?", "¿Miedo de quién?"], "painful, then demanding")),
 ("c11", 10, talk("Marisol", f"Over-the-shoulder close-up of @{{HEROINA}} (long dark hair in one braid, faded torn denim jacket over a dusty white t-shirt, yellow bandana tied on her left wrist, worn jeans) {MEZ}; in the foreground, the blurred shoulder and tan palm cowboy hat of @{{ARREOLA}} seen from behind (dark leather hat band, cream linen guayabera, no red trim).",
     ["Ya lo sé. Yo nací tres meses después.", "Porque mi mamá vivía con miedo.", "Nunca me lo quiso decir."], "quiet, honest")),
 ("c12", 8, talk("Fausto", f"Medium shot of @{{ARREOLA}} {MEZ}, arms crossed, then dropping his arms, worried.",
     ["¿Y llegas así nomás, esperando que te crea?", "¿Cómo que murió?"], "skeptical, then alarmed")),
 ("c13", 10, talk("Marisol", f"Close-up of @{{HEROINA}} {MEZ}, fighting back tears.",
     ["No. Vine porque mi mamá murió el domingo.", "Unos hombres entraron a la casa. Voltearon todo.", "Buscaban algo."], "broken, then firm")),
 ("c14", 10, talk("Fausto", f"Close-up of @{{ARREOLA}} {MEZ}, first listening, then looking down, intrigued, at a broken half of a silver San Judas medal @{{PROP_MEDALLA}} resting in his open palm.",
     ["¿Qué buscaban?", "Media medalla de San Judas.", "¿Y la otra mitad?"], "intrigued, low voice")),
 ("c15", 10, talk("Marisol", f"Medium close-up of @{{HEROINA}} {MEZ}, taking a small cloth bundle from her jacket pocket.",
     ["No sé. Pero ella alcanzó a darme esto.", "Eso mismo vine a preguntarle a usted."], "quiet, intense")),
 ("i2", 6, f"Extreme close-up insert {MEZ}: dusty fingers unfold a small cloth and reveal half of a broken silver San Judas medal @{{PROP_MEDALLA}} with a jagged edge, glinting in the golden light. No dialogue."),
 # 4. Entra el villano (cantina)
 ("c16", 10, talk("Tobías", f"Over-the-shoulder medium close-up of the henchman @{{TOBIAS}} (reddish-blond stubble, straw cowboy hat, khaki work shirt with rolled sleeves, aviator sunglasses hanging from the collar, radio on the chest pocket, jeans) {CAN}; in the foreground, the blurred back of the head and shoulder of @{{SEVERO}} seen from behind (no hat, short black hair, black work vest over a blue denim shirt).",
     ["Patrón, ya apareció la hija de la Teresa.", "En la mezcalera de Fausto Arreola.", "Ahí se fue a meter, patrón."], "eager, servile")),
 ("c17", 10, talk("Severo", f"Close-up of @{{SEVERO}} seated at the wooden bar with a small glass of mezcal {CAN}, slowly turning his head.",
     ["¿Dónde?", "¿Arreola? ¿Estás seguro?", "¿Y esa chamaca cree que Arreola la va a cuidar?"], "slow, raspy, menacing")),
 ("c18", 8, talk("Severo", f"Close-up of @{{SEVERO}} {CAN}, a cold smile, his fingers touching the half San Judas medal hanging on his silver chain @{{PROP_MEDALLA}}.",
     ["Pues se equivocó de puerta.", "Esa medalla no es de ella."], "quiet, cruel, amused")),
 ("i3", 6, f"Extreme close-up insert {CAN}: the thin silver chain over the blue denim shirt and open black work vest of @{{SEVERO}} (no hat, short black hair, thick black moustache, black zip-up work vest over a blue denim shirt, black jeans), with the other half of the broken San Judas medal @{{PROP_MEDALLA}}, jagged edge visible, swinging slightly. No dialogue."),
 # 5. La pista (mezcalera)
 ("c20", 10, talk("Fausto", f"Close-up of @{{ARREOLA}} {MEZ}, leaning closer, serious.",
     ["Dime la verdad. ¿Viste a esos hombres?", "¿Cómo era?"], "low, urgent")),
 ("c21", 10, talk("Marisol", f"Close-up of @{{HEROINA}} (long dark hair in one braid, faded torn denim jacket over a dusty white t-shirt, yellow bandana tied on her left wrist, worn jeans) {MEZ}, remembering with fear.",
     ["Solo a uno. Al que mandaba.", "De bigote negro, bien grueso.", "Con un chaleco negro y camisa de mezclilla."], "shaky, remembering")),
 ("r2", 6, f"Close-up of @{{ARREOLA}} {MEZ}, in profile, in silence, he recognizes who it is: his face goes hard, he looks off toward the road. No dialogue."),
 # 6. Escalada (pueblo)
 ("c22", 8, f"Medium two-shot {PUE}: @{{SEVERO}} (no hat, short black hair, thick black moustache, black zip-up work vest over a blue denim shirt, black jeans) walks out of the cantina zipping up his black vest, bareheaded; @{{TOBIAS}} (reddish-blond stubble, straw cowboy hat, khaki work shirt with rolled sleeves, aviator sunglasses hanging from the collar, radio on the chest pocket, jeans) beside him. Severo {VOICE}, raspy commanding voice, says: \"Tobías, junta a todos los muchachos.\" Then a short pause. Tobías answers quickly: \"Ahorita, patrón.\""),
 ("c23", 10, talk("Severo", f"Medium shot {PUE}: @{{SEVERO}} stands in front of about thirty men in dark clothes next to black pickup trucks, @{{TOBIAS}} at his side, dust in the air.",
     ["La muchacha que se nos fue el domingo ya apareció.", "Está con Fausto Arreola.", "Vamos por ella."], "loud, cold, commanding")),
 ("c24", 10, f"Medium two-shot {PUE}: @{{TOBIAS}} next to @{{SEVERO}} by a black pickup truck. Tobías {VOICE}, asks: \"¿Usted también va, patrón?\" Then a short pause. Severo answers, cold and slow: \"Esto lo arreglo yo en persona.\" Then a short pause. Severo shouts to his men: \"¡Súbanse! ¡Nos vamos!\""),
 # 7. Amenaza (terracería)
 ("c25", 6, f"Aerial drone shot {TER}: a convoy of six black pickup trucks speeds along the dirt road raising a long cloud of dust. No dialogue."),
 ("c26", 10, f"Inside a black pickup truck driving {TER}, light through the side window: @{{TOBIAS}} at the wheel {VOICE}, asks: \"¿Nomás vamos por la muchacha, patrón?\" Then a short pause. Close-up of @{{SEVERO}} in the passenger seat, answering slowly: \"Por la muchacha y por Arreola.\""),
 ("c27", 10, f"Inside a black pickup truck driving {TER}: @{{TOBIAS}} at the wheel {VOICE}, worried: \"Don Fausto tiene su gente, patrón.\" Then a short pause. Close-up of @{{SEVERO}} staring ahead, with a cold smile: \"Hace veintidós años también tenía.\" Then a short pause. Then: \"Y no le sirvió de nada.\""),
 # 8. Aviso y lealtad (mezcalera)
 ("c28", 10, talk("Nicanor", f"Over-the-shoulder medium close-up of the foreman @{{CAPORAL}} (faded red baseball cap, light khaki work shirt with rolled sleeves, black walkie-talkie on his belt, brown work pants) {MEZ}, lowering his walkie-talkie radio, tense; in the foreground, the blurred shoulder and tan palm cowboy hat of @{{ARREOLA}} seen from behind (dark leather hat band, cream linen guayabera). Nobody else in the foreground.",
     ["Patrón, avisan del pueblo. Vienen seis camionetas negras.", "Más de treinta hombres, patrón."], "urgent, worried")),
 ("c29", 10, talk("Fausto", f"Medium shot of @{{ARREOLA}} {MEZ}, workers with radios behind him, he takes command.",
     ["¿Cuántos?", "Cierren el portón. Todos a sus puestos."], "firm, controlled")),
 ("c30", 10, talk("Marisol", f"Close-up of @{{HEROINA}} {MEZ}, frightened, stepping toward Fausto.",
     ["Don Fausto, vienen por mí.", "Déjeme ir. Si me voy, a usted no le hacen nada."], "scared, pleading")),
 ("c31", 10, talk("Fausto", f"Medium two-shot {MEZ}: @{{ARREOLA}} puts his hand on the shoulder of @{{HEROINA}} and looks her in the eyes; golden backlight.",
     ["Ya lo sé.", "Escúchame bien. Si eres hija de Ramiro, de aquí nadie te saca."], "protective, deep, emotional")),
 ("c32", 8, f"Medium two-shot {MEZ}: @{{CAPORAL}} runs in holding his radio and says, {VOICE}: \"Ya llegaron, patrón.\" Then a short pause. @{{ARREOLA}} turns to @{{HEROINA}}, firm: \"Métete a la casa.\""),
 ("c33", 8, f"Medium two-shot {MEZ}: @{{HEROINA}} says, {VOICE}, pleading: \"Pero, don Fausto…\" Then a short pause. @{{ARREOLA}} answers, sharp and loud: \"¡Ahora!\" She runs toward the stone house."),
 # 9. Cliffhanger (portón)
 ("c34", 6, f"Wide shot {POR}: black pickup trucks stop in a cloud of dust outside the open gate; @{{SEVERO}} steps out and walks forward, armed men behind him; @{{ARREOLA}} waits inside the gate with @{{CAPORAL}}. No dialogue."),
 ("c35", 10, talk("Severo", f"Over-the-shoulder close-up of @{{SEVERO}} (no hat, short black hair, thick black moustache, black zip-up work vest over a blue denim shirt, black jeans) {POR}, a mocking smile; in the foreground, the blurred shoulder and tan palm cowboy hat of @{{ARREOLA}} seen from behind (dark leather hat band, cream linen guayabera; no bandana, no vest).",
     ["Fausto.", "Veintidós años sin vernos, compadre.", "Vine a cobrar lo que me debía tu hermano."], "slow, mocking, menacing")),
 ("c36", 10, talk("Fausto", f"Over-the-shoulder close-up of @{{ARREOLA}} (short grey beard, tan palm cowboy hat with a dark leather band, cream linen guayabera shirt, brown leather belt, dark blue jeans) {POR}, contained rage; in the foreground, the blurred back of the head and shoulder of @{{SEVERO}} seen from behind (no hat, short black hair, black work vest over blue denim shirt sleeves).",
     ["Severo Camargo.", "¿Qué se te perdió en mi tierra?", "Mi hermano no te debía nada."], "hard, contained, deep")),
 ("c37", 8, talk("Severo", f"Close-up of @{{SEVERO}} {POR}, taking one step closer, the half medal on his chain catching the light.",
     ["La muchacha está aquí.", "Entrégamela."], "quiet, threatening")),
 ("c38", 8, talk("Fausto", f"Close-up of @{{ARREOLA}} {POR}, not moving, eyes fixed on Severo.",
     ["No.", "Esa muchacha es una Arreola."], "calm, absolute, deep")),
 ("r3", 6, f"Close-up of @{{SEVERO}} {POR}, in silence, a slow cold smile, his fingers closing around the half medal on his chain @{{PROP_MEDALLA}}. Slow push-in. No dialogue."),
 ("r4", 6, f"Close-up of @{{HEROINA}} behind a window of the stone house, sunset light, watching outside in silence, scared, holding her half medal @{{PROP_MEDALLA}}. No dialogue."),
 # CTA final (tras negro)
 ("c39", 8, talk("Marisol", f"Close-up of @{{HEROINA}} (long dark hair in one braid, faded torn denim jacket over a dusty white t-shirt, yellow bandana tied on her left wrist, worn jeans) {MEZ}, looking straight into the camera with charisma, holding the silver half medal @{{PROP_MEDALLA}} in one hand; she tucks a loose strand of hair behind her ear, tilts her head slightly, a knowing half smile, nods once and gestures toward the camera with her free hand as she talks, then lifts the half medal a little toward the lens; natural organic movement like a telenovela star talking to her audience.",
     ["¿Creen que Severo mató a mi papá?", "Denle me gusta y compartan para ver la segunda parte."], "warm, intimate, confident, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("firmly holding the arm of", "standing right next to"), ("her arm held by the foreman's hand", "the foreman standing beside her"),
        ("armed men behind him", "his men behind him"), ("a tear running down her dusty cheek", "teary eyes"),
        ("furious", "upset"), ("crying", "with teary eyes")]
# Reformulaciones para reintentos (4 intentos, cada uno con otra redacción)
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("¡", ""), ("!", "."), ("cállese", "ya no discuta"), ("quinientos mil pesos", "quinientos mil"), ("matar", "lastimar"), ("muerto", "perdido")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican countryside, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{SEVERO}", "a 50-year-old Mexican man with short black hair and a thick black moustache, no hat, wearing a black zip-up work vest over a blue denim shirt and black jeans"),
         ("@{TOBIAS}", "a 38-year-old man with sunburnt skin and reddish-blond stubble, wearing a straw cowboy hat, a khaki work shirt with rolled sleeves and jeans")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Wide shot", "Medium wide shot")
    if k >= 4:  # sin imagen de referencia: Severo y Tobías pasan a descripción en texto
        for a, b in NOREF: body = body.replace(a, b)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then: "[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                       cwd=MCP, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control (regla del usuario): si un clip falla, generar algo neutro para saber si falla el prompt o Flow."""
    # gatito como IMAGEN (no gasta créditos; el video costaba 12-15 por prueba)
    try:
        r = subprocess.run(["node", "src/cli.js", "--count", "1", "--aspect", "9:16", "--out", str(OUT.parent / "canary"),
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
        if dst.exists() or (want and cid not in want): continue
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

if __name__ == "__main__":
    main()

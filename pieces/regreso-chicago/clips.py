"""Genera los clips de regreso-chicago con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
FAC = "in front of the mustard-yellow colonial house @{LOC_FACHADA} on a cobblestone street in Guanajuato, a dark green wrought-iron gate, a Virgin of Guadalupe tile niche on the wall, warm golden-hour light"
COC = "at the open garage @{LOC_COCHERA} of the same mustard-yellow colonial house, a new white pickup truck parked inside, terracotta floor, dark green wrought-iron gate, warm golden-hour light"
# Ancla de identidad: primera mención de cada personaje en cada prompt
YES = "@{YESENIA} (38-year-old woman, long wavy dark brown hair with caramel highlights, big gold hoop earrings, thick gold chain, black blazer over an emerald green satin blouse, black trousers)"
ROG = "@{ROGELIO} (42-year-old man, short black hair greying at the temples, short black goatee and moustache, black denim jacket over a mustard-yellow t-shirt, olive green canvas crossbody bag)"
ULI = "@{ULISES} (36-year-old man, short slicked-back black hair, clean-shaven with no beard and no moustache, royal blue polo shirt with a white collar trim, sunglasses hooked on the collar, gold wristwatch, beige chino trousers, brown leather loafers)"
REB = "@{REBECA} (60-year-old woman, short dyed platinum-blonde hair, pearl earrings, black-and-white zebra-print blouse, burgundy cardigan)"
JOS = "@{JOSEFINA} (68-year-old woman, long grey braid, navy blue rebozo shawl over her shoulders, white blouse with red embroidered flowers, dark brown skirt)"
CAR = "@{PROP_CARPETA}"  # carpeta azul claro con los papeles sellados (sello dorado)
BOOTS = "a pair of dusty tan work boots hanging over his shoulder by the laces"

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: Yesenia lo corre desde la reja, sin plano abierto, hablando desde el frame 0
 ("c01", 10, talk("Yesenia", f"Close-up of {YES} standing behind the dark green iron gate {FAC}, looking down with contempt; {ROG} seen from behind and blurred at the right edge of the frame, {BOOTS}.",
     ["Quítate de mi puerta, Rogelio.", "La gente va a pensar que contraté otro peón.", "Aquí ya no vives."], "cold, mocking, arrogant")),
 ("c02", 8, talk("Rogelio", f"Close-up of {ROG} on the cobblestone sidewalk {FAC}, {BOOTS}, tired and hurt, {YES} blurred behind the gate at the left edge of the frame.",
     ["Con estas manos te levanté esta casa desde Chicago, Yesenia.", "Nueve años techando casas ajenas."], "quiet, hurt, tired")),
 ("c03", 8, talk("Yesenia", f"Medium shot {FAC}: {YES} standing just inside the open dark green iron gate turns her head to {ULI}, who stands right beside her. Ulises wears beige chino trousers and brown loafers exactly as in his reference sheet, never jeans or dark trousers. No other people.",
     ["¿Ya viste, mi vida? Este pobre diablo se cree el dueño.", "Agarra tus botas y vete a una casa de huéspedes."], "mocking, arrogant, a little laugh")),
 ("i1", 6, f"Close-up detail {FAC}: the hand of {ULI} with his gold wristwatch resting gently on the waist of {YES}, her emerald green satin blouse and black blazer, the dark green iron gate behind. No faces, no other people. Slow push-in. No dialogue."),
 ("c04", 8, talk("Rogelio", f"Close-up of {ROG} {FAC}, {BOOTS}, disbelief in his eyes, {ULI} blurred behind the gate at the left edge of the frame.",
     ["¿Le dices \"mi vida\" a mi compadre Ulises?", "¿Aquí, en la casa que levanté con mi espalda?"], "low, hurt, disbelief")),
 ("c05", 8, talk("Ulises", f"Over-the-shoulder medium shot {FAC}: {ULI} behind the iron gate faces the camera with a confident smile, {YES} at his side, {ROG} seen from behind and blurred in the foreground.",
     ["Tu espalda puso los ladrillos, compadre.", "Pero alguien tenía que cuidar a la señora."], "confident, mocking, relaxed")),
 ("c06", 10, talk("Rogelio", f"Medium shot of {ROG} {FAC}, {BOOTS}, he holds up a black smartphone toward the gate, showing old photos on the screen, {YES} blurred at the left edge of the frame.",
     ["Nueve años mandándote cada quincena por el celular.", "Y tú me mandabas fotos de cada cuarto."], "firm, hurt, steady")),
 ("c07", 8, talk("Yesenia", f"Over-the-shoulder close-up {FAC}: {YES} behind the iron gate faces the camera, rolling her eyes, {ROG} seen from behind and blurred in the foreground.",
     ["Lo que mandabas apenas alcanzaba para la luz y el mandado.", "No me vengas a presumir tus migajas."], "cold, dismissive")),
 ("c08", 6, talk("Ulises", f"Close-up of {ULI} behind the iron gate {FAC}, a mocking smile, arms crossed. No other people.",
     ["Ya ni llores, compadre."], "mocking, relaxed")),
 # 2. La suegra y las chapas
 ("c09", 8, talk("Rebeca", f"Medium shot {FAC}: {REB} steps next to {YES} behind the iron gate, looking at Rogelio off-screen with disdain. No other people.",
     ["Cierra bien la reja, hija.", "No se nos vaya a meter a la casa."], "sharp, disdainful, unhurried, every word clearly pronounced")),
 ("i2", 6, f"Close-up detail {FAC}: the hand of {ROG} (only his hand and the sleeve of his black denim jacket visible) puts a brass key into the lock of the dark green iron gate and tries to turn it, but the key does not turn. No faces, no other people. No dialogue."),
 ("c10", 8, talk("Yesenia", f"Close-up profile of {YES} behind the iron gate {FAC}, the Virgin of Guadalupe tile niche behind her, a cold smile.",
     ["Cambié las chapas hace medio año.", "Para mí dejaste de existir el día que cruzaste."], "cold, slow, cutting")),
 ("c11", 8, talk("Yesenia", f"Close-up of {YES} behind the iron gate {FAC}, holding a black smartphone in her hand, {ROG} blurred at the right edge of the frame.",
     ["Si a las siete sigues aquí, le hablo a mi licenciado.", "Y te vas con todo y tus botas."], "firm, arrogant")),
 ("c12", 10, talk("Rogelio", f"Medium shot of {ROG} {FAC}, arms crossed, {BOOTS}, calm, a few neighbors blurred far in the background.",
     ["¿Tu licenciado?", "¿Y ya revisaste a nombre de quién está esta casa?"], "calm, serious, a little ironic")),
 ("c13", 8, talk("Rebeca", f"Medium shot of {REB} behind the dark green iron bars {FAC}, pointing her finger at Rogelio off-screen.",
     ["Está a nombre de mi hija.", "Porque tú la dejaste sola nueve años."], "sharp, accusing")),
 ("c14", 10, talk("Rogelio", f"Medium shot of {ROG} {FAC}, the cobblestone street behind him, {REB} blurred behind the gate at the left edge of the frame.",
     ["¿Sola?", "Con mis horas extras le pagué hasta los dientes nuevos, doña Rebeca."], "bitter, firm")),
 # 3. Los papeles falsos
 ("c15", 10, talk("Yesenia", f"Medium shot {FAC}: {YES} behind the iron gate holds up a single sheet of paper toward Rogelio off-screen, {ULI} standing behind her.",
     ["Cállate, peón.", "Mira estos papeles.", "Por abandono, la casa ya está a mi nombre."], "cold, triumphant")),
 ("c16", 8, talk("Rogelio", f"Close-up of {ROG} {FAC}, looking at the sheet of paper, then up at {YES}, who is blurred behind the gate at the left edge of the frame.",
     ["Esa hoja ni sello tiene, Yesenia.", "Y esa firma no es mía."], "calm, firm")),
 ("c17", 6, talk("Ulises", f"Close-up of {ULI} behind the dark green iron bars {FAC}, a smug smile. No other people.",
     ["Aquí tu firma vale lo mismo que tú, compadre."], "mocking, cold")),
 # 4. La camioneta
 ("c18", 10, talk("Ulises", f"Medium shot {COC}: {ULI} leans proudly on the white pickup truck, spinning its key in his hand; Ulises wears beige chino trousers and brown loafers exactly as in his reference sheet, never jeans. {ROG} seen from behind and blurred at the right edge of the frame, only his black denim jacket, olive crossbody strap and greying hair visible. No other people.",
     ["¿Ves esta camioneta del año, compadre?", "Me la compré con mis negocios."], "proud, mocking")),
 ("c19", 8, talk("Rogelio", f"Close-up of {ROG} {COC}, looking at the white pickup truck, {ULI} blurred at the left edge of the frame.",
     ["Esa camioneta salió de lo que mandé en diciembre para el techo."], "low, bitter, controlled")),
 ("c20", 6, talk("Yesenia", f"Close-up of {YES} {COC}, standing next to the white pickup truck, shrugging with a proud smile. No other people.",
     ["Yo se la regalé. ¿Y qué?"], "arrogant, defiant")),
 ("c21", 10, talk("Rebeca", f"Medium shot of {REB} {COC}, arms crossed, {ROG} seen from behind and blurred at the right edge of the frame.",
     ["Vete a tu rancho con tu mamá.", "Que esa viejita tampoco tiene ni dónde caerse."], "sharp, mocking")),
 ("c22", 8, talk("Rogelio", f"Close-up of {ROG} {COC}, his jaw tight, {REB} blurred at the left edge of the frame.",
     ["A mi madre no la mencione, doña Rebeca.", "Gracias a ella usted come tres veces al día."], "low, firm, contained")),
 # 5. La maleta
 ("c23", 8, talk("Ulises", f"Medium shot {FAC}: {ULI} comes out through the open iron gate carrying a worn brown suitcase, {YES} behind him at the gate. Ulises wears beige chino trousers and brown loafers exactly as in his reference sheet, never jeans or dark trousers. No other people.",
     ["Ya bájale, compadre.", "Tu maleta te la dejo aquí en la banqueta."], "mocking, relaxed")),
 ("c24", 8, talk("Yesenia", f"Close-up of {YES} at the open iron gate {FAC}, smiling proudly, a few neighbors blurred far behind on the street.",
     ["Déjala en la calle.", "Que todo el barrio vea quién manda en esta casa."], "arrogant, proud")),
 ("i3", 6, f"Close-up detail {FAC}: the hand of {ULI} gently places a worn brown suitcase on the cobblestone sidewalk next to a pair of dusty tan work boots. No faces, no other people. No dialogue."),
 # 6. Llega la madre (cama cálida)
 ("r1", 6, f"Medium wide shot {FAC}: {JOS} walks slowly up the cobblestone street toward the house, holding a light blue folder {CAR} against her chest; {ROG} stands alone on the sidewalk next to his old worn brown leather suitcase with leather straps (not a black rolling suitcase) and his pair of dusty tan work boots, and turns to see her. Only these two characters appear, each one exactly once. No other people. Slow push-in. No dialogue."),
 ("c25", 10, talk("Josefina", f"Medium shot of {JOS} {FAC}, holding the light blue folder {CAR}, she stops next to {ROG}, who is blurred at the right edge of the frame.",
     ["No levantes nada del suelo, mijo.", "Los que gritan más fuerte casi nunca son los dueños."], "calm, warm, firm")),
 ("c26", 8, talk("Yesenia", f"Close-up of {YES} behind the iron gate {FAC}, annoyed, {JOS} blurred at the right edge of the frame.",
     ["Nomás eso me faltaba.", "La suegra metiche con sus papeles viejos."], "annoyed, mocking")),
 ("c27", 10, talk("Josefina", f"Close-up of {JOS} {FAC}, she opens the light blue folder {CAR} and shows a page with a gold seal toward the gate, {YES} blurred at the left edge of the frame.",
     ["Viejos no, mija. Tienen sello.", "Esta casa está a mi nombre desde el primer ladrillo."], "calm, firm, slow")),
 ("c28", 6, talk("Yesenia", f"Close-up of {YES} behind the iron gate {FAC}, her smile fades, surprised, {ULI} blurred behind her. No other people.",
     ["¿Cómo que a su nombre?"], "surprised, unsettled")),
 ("c29", 10, talk("Josefina", f"Over-the-shoulder close-up {FAC}: {JOS} faces the camera holding the light blue folder {CAR}, {YES} seen from behind and blurred in the foreground behind the gate.",
     ["Mi hijo me la puso a mí, por si algún día pasaba esto.", "Y hoy pasó.", "Aquí la que se va eres tú."], "calm, firm, dignified")),
 ("c30", 8, talk("Rogelio", f"Close-up of {ROG} {FAC}, his eyes wet, a small grateful smile, {JOS} blurred at the left edge of the frame.",
     ["Gracias, amá.", "Ya estoy en mi casa."], "quiet, emotional, with teary eyes")),
 # CTA final (tras negro)
 ("c31", 8, talk("Rogelio", f"Close-up of {ROG} {FAC}, looking straight into the camera with warmth and charisma, moving naturally: he adjusts the strap of his bag, nods, tilts his head, smiles and gestures with one hand. No other people.",
     ["¿Ustedes creen que Yesenia se va a salir por las buenas?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("stands very close in front of", "stands in front of"), ("pointing her finger at", "looking at"),
        ("steps closer to", "faces"), ("his voice rises", "serious"), ("his voice breaks", "quiet voice"),
        ("his jaw tight", "serious"), ("furious", "upset"), ("crying", "with teary eyes")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("contempt", "pride"), ("disdain", "pride"), ("disdainful", "proud"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), (" rage", " annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"),
        ("accusing", "serious"), ("cutting", "serious"), ("mocking", "playful"), ("bitter", "sad"),
        ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), (" gun", " radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"),
        ("resting gently on the waist of", "next to"), ("spinning its key in his hand", "smiling"),
        ("¡", ""), ("!", "."), ("pobre diablo", "señor"), ("peón", "señor"), ("migajas", "cuentos"), ("Cállate", "Ya basta"),
        ("dejaste de existir", "te fuiste"), ("mandándote cada quincena", "escribiéndote cada semana")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, colonial Mexican street, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{ULISES}", "a 36-year-old Mexican man"),
         ("@{REBECA}", "a 60-year-old Mexican woman"),
         ("@{YESENIA}", "a 38-year-old Mexican woman")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Over-the-shoulder medium shot", "Medium shot").replace("Medium wide shot", "Medium shot")
    if k >= 4:  # cambiar el personaje: sin imagen de referencia, descripción civil
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

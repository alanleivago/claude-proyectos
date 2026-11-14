"""Genera los clips de mecanico con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
PEC = ("in the glass-walled office @{LOC_PECERA} above a Mexican auto repair shop, a wooden desk with papers and a desk lamp, "
       "a big glass window looking down onto the workshop floor, warm light")
NAV = ("in the large Mexican auto repair shop @{LOC_NAVE}, blue hydraulic car lifts, a silver pickup truck raised on a lift, red tool cabinets, "
       "grey concrete floor, fluorescent ceiling lights and cool daylight from the open door")
SOL = ("in the humble backyard carport @{LOC_SOLAR} of a small Mexican house, a corrugated metal roof, a concrete floor, an old wooden workbench, "
       "pale blue painted walls, soft late afternoon light")
# Ancla de identidad: primera mención de cada personaje en cada prompt (también el del borde: ropa completa con pantalón, calzado y accesorios)
EVA = ("@{EVARISTO} (50-year-old Mexican mestizo man, brown skin, weathered face, messy short black hair with a little grey, thick black moustache "
       "and short black stubble beard, dark olive green long-sleeve mechanic coverall with grease stains over a grey t-shirt, "
       "a faded blue and white checkered rag over his left shoulder, black work boots)")
FER = ("@{PATRONTALLER} (56-year-old Mexican mestizo man, brown skin, grey hair combed back, clean-shaven with no beard and no moustache, "
       "dark burgundy zip-up jacket over a light blue dress shirt, charcoal grey trousers, black shoes, gold wristwatch on his left wrist)")
OSV = ("@{OSVALDO} (25-year-old Mexican mestizo man, brown skin, short straight black hair, clean-shaven with no beard and no moustache, "
       "brand-new clean light grey mechanic coverall over a black t-shirt, black work boots)")
CEL = ("@{CELSO} (62-year-old Mexican mestizo man, brown skin, grey moustache and no beard, tan baseball cap, dark green quilted vest "
       "over a red and navy plaid flannel shirt, blue jeans, brown work boots)")
NO = " No other people."
TRUCK = "a white pickup truck with its hood open behind them"
def BOX(where): return f" There is only ONE toolbox in the scene, the red metal toolbox @{{PROP_CAJAROJA}}, {where}."
NOBOX = " There is no toolbox in the shot."
CABLE = " There is only ONE cable in the scene, a short corroded ground cable with a green crusted end, held only by Evaristo in his right hand."

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

HOLD = "held only by Evaristo in his right hand for the whole shot"
CLIPS = [
 # 1. El despido (oficina de cristal). Fermín habla desde el frame 0, sin plano abierto.
 # Bordes: en los planos de Fermín, Evaristo a la IZQUIERDA de espaldas; en los de Evaristo, Fermín a la DERECHA. Manos vacías.
 ("c01", 8, talk("Fermín", f"Medium close-up of {FER} {PEC}, standing behind his desk, serious, his hands resting on the desk; {EVA} at the left edge of the frame, seen from behind, slightly blurred, his hands empty. Fermín speaks from the very first second.{NOBOX}{NO}",
     ["Evaristo, a partir de hoy ya no te necesito.", "Recoge tus cosas."], "cold, serious, firm")),
 ("c02", 8, talk("Evaristo", f"Close-up of {EVA} {PEC}, standing, surprised and hurt, his hands empty; {FER} blurred at the right edge of the frame, standing behind the desk, his hands on the desk.{NOBOX}{NO}",
     ["¿Cómo que ya no me necesita?", "Faltan tres días para el bono, don Fermín."], "surprised, hurt")),
 ("c03", 8, talk("Fermín", f"Close-up of {FER} {PEC}, standing behind his desk, arms crossed, calm and cold; {EVA} at the left edge of the frame, seen from behind, his hands empty.{NOBOX}{NO}",
     ["Ya no rindes como antes.", "Necesito gente nueva aquí."], "cold, dismissive")),
 ("c04", 8, talk("Evaristo", f"Medium close-up of {EVA} {PEC}, standing, upset but dignified, his hands empty; {FER} blurred at the right edge of the frame, arms crossed.{NOBOX}{NO}",
     ["Veinte años aquí y nunca tuvo un reclamo de mí.", "¿Y lo que me tocaba del bono?"], "upset, dignified, firm")),
 ("c05", 6, talk("Fermín", f"Close-up of {FER} {PEC}, sitting down in his chair, looking at his papers, unbothered; {EVA} at the left edge of the frame, seen from behind, his hands empty.{NOBOX}{NO}",
     ["El bono es para los que se quedan."], "cold, careless")),
 # 2. El sobrino (taller). Evaristo sale con la caja roja en la mano DERECHA; Osvaldo ya está en su lugar.
 # Bordes: en los planos de Osvaldo, Evaristo a la IZQUIERDA con la caja; en los de Evaristo, Osvaldo a la DERECHA, manos vacías.
 ("c06", 8, talk("Osvaldo", f"Medium close-up of {OSV} {NAV}, standing next to a red tool cabinet, nervous, ashamed, his hands empty; {EVA} at the left edge of the frame, seen from behind, slightly blurred, holding the red toolbox in his right hand.{BOX(HOLD)}{NO}",
     ["Don Evaristo… perdóneme.", "Mi tío me dio su puesto ayer."], "nervous, ashamed, quiet")),
 ("c07", 8, talk("Evaristo", f"Close-up of {EVA} {NAV}, standing, facing the camera, realizing, bitter; he holds the red toolbox by its handle in his RIGHT hand, which is on the LEFT side of the frame, his left hand empty; the checkered rag hangs over his LEFT shoulder, on the RIGHT side of the frame; {OSV} blurred at the right edge of the frame, his hands empty (Evaristo on the left side of the frame, Osvaldo on the right).{BOX(HOLD)}{NO}",
     ["¿Tu tío? ¿Entonces por eso me sacó?", "Tres días antes del bono."], "bitter, realizing, quiet")),
 ("c08", 6, talk("Osvaldo", f"Close-up of {OSV} {NAV}, standing, worried, shaking his head slowly, his hands empty; {EVA} at the left edge of the frame, seen from behind, holding the red toolbox in his right hand.{BOX(HOLD)}{NO}",
     ["Yo no sabía nada, se lo prometo."], "worried, sincere")),
 ("c09", 8, talk("Evaristo", f"Medium close-up of {EVA} {NAV}, standing, holding the red toolbox in his right hand, a tired, kind look; {OSV} blurred at the right edge of the frame, his hands empty.{BOX(HOLD)}{NO}",
     ["No es tu culpa, muchacho.", "Nomás aprende a hacer las cosas bien."], "tired, kind, calm")),
 # 3. Llega Celso con su camioneta blanca (taller). Bordes: en los planos de Celso, Fermín a la DERECHA; en los de Fermín, Celso a la IZQUIERDA.
 ("c10", 8, talk("Celso", f"Medium close-up of {CEL} {NAV}, standing, {TRUCK}, looking around, puzzled, his hands empty; {FER} blurred at the right edge of the frame, his hands empty.{NOBOX}{NO}",
     ["¿Dónde está Evaristo?", "Él siempre atiende mis camionetas."], "puzzled, direct")),
 ("c11", 8, talk("Fermín", f"Medium close-up of {FER} {NAV}, standing, a polite fake smile, his hands empty; {CEL} at the left edge of the frame, seen from behind, slightly blurred, his hands empty.{NOBOX}{NO}",
     ["Evaristo ya no daba resultados.", "Ahora te atiende mi sobrino, Osvaldo."], "polite, fake, smooth")),
 ("c12", 6, talk("Celso", f"Close-up of {CEL} {NAV}, standing, arms crossed, raising one eyebrow, skeptical; {FER} blurred at the right edge of the frame, his hands empty.{NOBOX}{NO}",
     ["Qué raro. Nunca tuve un reclamo de él."], "skeptical, dry")),
 # 4. Osvaldo no encuentra la falla. Bordes: en los planos de Celso, Osvaldo a la DERECHA (manos con grasa, vacías); en los de Osvaldo, Celso a la IZQUIERDA.
 ("c13", 8, talk("Celso", f"Medium close-up of {CEL} {NAV}, standing, {TRUCK}, impatient, checking his wristwatch; {OSV} blurred at the right edge of the frame, his greasy hands empty.{NOBOX}{NO}",
     ["Ya van dos horas, muchacho.", "Y la camioneta sigue perdiendo fuerza."], "impatient, firm")),
 ("c14", 8, talk("Osvaldo", f"Medium close-up of {OSV} {NAV}, standing next to the open hood of a white pickup truck, embarrassed, rubbing his greasy empty hands together; {CEL} at the left edge of the frame, seen from behind, his hands empty.{NOBOX}{NO}",
     ["No le encuentro el problema, señor.", "Don Evaristo ya lo hubiera encontrado."], "embarrassed, honest")),
 ("c15", 8, talk("Celso", f"Close-up of {CEL} {NAV}, standing, leaning in a little, speaking low and serious, his hands empty; {OSV} blurred at the right edge of the frame, his greasy hands empty.{NOBOX}{NO}",
     ["Dime la verdad, Osvaldo.", "¿Evaristo hacía mal las cosas?"], "serious, low voice")),
 ("c16", 8, talk("Osvaldo", f"Close-up of {OSV} {NAV}, standing, glancing up toward the glass office, then back, speaking low, his greasy hands empty; {CEL} at the left edge of the frame, seen from behind, his hands empty.{NOBOX}{NO}",
     ["No, señor. Nadie aquí sabe más que él.", "Mi tío lo sacó tres días antes del bono."], "low voice, guilty, honest")),
 # 5. Celso enfrenta a Fermín (oficina). Bordes: en los planos de Celso, Fermín a la DERECHA; en los de Fermín, Celso a la IZQUIERDA.
 ("c17", 8, talk("Celso", f"Medium close-up of {CEL} {PEC}, standing in front of the desk, upset, his hands empty; {FER} blurred at the right edge of the frame, standing behind the desk, his hands empty.{NOBOX}{NO}",
     ["¿Sacaste a Evaristo tres días antes del bono?", "¿Nomás para poner a tu sobrino?"], "upset, firm")),
 ("c18", 6, talk("Fermín", f"Close-up of {FER} {PEC}, standing behind his desk, arms crossed, cold; {CEL} at the left edge of the frame, seen from behind, his hands empty.{NOBOX}{NO}",
     ["Evaristo ya no daba resultados."], "cold, stubborn")),
 ("c19", 8, talk("Celso", f"Close-up of {CEL} {PEC}, standing, shaking his head, disappointed, his hands empty; {FER} blurred at the right edge of the frame, arms crossed.{NOBOX}{NO}",
     ["Tu sobrino ni encontró el problema.", "Ya escuché suficiente, Fermín."], "disappointed, firm")),
 ("c20", 6, talk("Celso", f"Medium close-up of {CEL} {PEC}, standing, adjusting his tan cap with his right hand, decided; {FER} blurred at the right edge of the frame, arms crossed.{NOBOX}{NO}",
     ["Mis ocho camionetas se van con Evaristo."], "decided, calm, firm")),
 ("c21", 8, talk("Fermín", f"Close-up of {FER} {PEC}, standing behind his desk, a proud cold smile, his hands on the desk; {CEL} at the left edge of the frame, seen from behind, his hands empty (Celso on the left side of the frame, Fermín on the right).{NOBOX}{NO}",
     ["Haz lo que quieras.", "Luego no vengas a pedirme nada."], "proud, cold, saying each line only once")),
 # 6. La oferta (cochera de la casa de Evaristo). La caja roja cerrada sobre el banco, nadie la toca.
 # Bordes: en los planos de Celso, Evaristo a la IZQUIERDA; en los de Evaristo, Celso a la DERECHA. Manos vacías.
 ("c22", 6, talk("Celso", f"Medium close-up of {CEL} {SOL}, standing, warm and direct, his hands empty; {EVA} at the left edge of the frame, seen from behind, slightly blurred, his hands empty.{BOX('closed on the workbench in the background, nobody touches it')}{NO}",
     ["Evaristo, quiero que tú atiendas mis ocho camionetas."], "warm, direct")),
 ("c23", 8, talk("Evaristo", f"Close-up of {EVA} {SOL}, standing next to the workbench, surprised, then sad, his hands empty; {CEL} blurred at the right edge of the frame, his hands empty.{BOX('closed on the workbench next to him, nobody touches it')}{NO}",
     ["Ya no tengo local, don Celso.", "Nomás me quedan mis herramientas."], "sad, humble, quiet")),
 ("c24", 8, talk("Celso", f"Close-up of {CEL} {SOL}, standing, a confident small smile, his hands empty; {EVA} at the left edge of the frame, seen from behind, his hands empty.{BOX('closed on the workbench in the background, nobody touches it')}{NO}",
     ["Pues empieza aquí mismo, en tu casa.", "Mañana te traigo la primera."], "confident, warm")),
 ("c25", 8, talk("Evaristo", f"Medium close-up of {EVA} {SOL}, standing, facing the camera, moved, standing taller with pride, his hands empty; the checkered rag hangs over his LEFT shoulder, on the RIGHT side of the frame; {CEL} blurred at the right edge of the frame, his hands empty (Evaristo on the left side of the frame, Celso on the right).{BOX('closed on the workbench next to him, nobody touches it')}{NO} No subtitles, no captions, no words written anywhere on the image.",
     ["Acepto, pero no como favor.", "Me lo voy a ganar."], "proud, moved, firm")),
 # 7. Encuentra la falla (cochera, al día siguiente). Evaristo con UN cable en la mano DERECHA; Celso a la DERECHA en sus planos.
 ("c26", 8, talk("Evaristo", f"Medium close-up of {EVA} {SOL}, morning light, standing next to the open hood of a white pickup truck, a satisfied small smile, holding up a short corroded cable in his right hand; {CEL} blurred at the right edge of the frame, his hands empty.{CABLE}{NOBOX}{NO}",
     ["Aquí está el problema, don Celso.", "Este cable de tierra está sulfatado."], "satisfied, calm, confident")),
 ("c27", 8, talk("Celso", f"Medium close-up of {CEL} {SOL}, morning light, standing next to the open hood of a white pickup truck, surprised, then smiling, nodding, his right hand resting on the truck; {EVA} at the left edge of the frame, seen from behind, holding up the short corroded cable in his RIGHT hand, on the side of his body closest to Celso, his left hand empty (Evaristo on the left side of the frame, Celso on the right).{CABLE} It is the same cable as before: about 40 cm long, dark grey insulation, a green crusted terminal at each end; no red wires, no jumper cables, nothing hanging down to the floor.{NOBOX}{NO}",
     ["Con Fermín me aseguraron que era normal.", "Las otras siete también son tuyas."], "surprised, happy, warm")),
 # 8. Fermín y Osvaldo (oficina). Bordes: en los planos de Fermín, Osvaldo a la IZQUIERDA; en los de Osvaldo, Fermín a la DERECHA.
 ("c28", 8, talk("Fermín", f"Close-up of {FER} {PEC}, standing behind his desk, upset, his hands on the desk; {OSV} at the left edge of the frame, seen from behind, his hands empty.{NOBOX}{NO}",
     ["¿Tú le contaste a Celso?", "Me hiciste quedar como mentiroso."], "upset, cold")),
 ("c29", 8, talk("Osvaldo", f"Medium close-up of {OSV} {PEC}, standing in front of the desk, calm and firm, looking straight at his uncle, his hands empty; {FER} blurred at the right edge of the frame, his hands on the desk.{NOBOX}{NO}",
     ["Nomás le conté la verdad, tío.", "Yo nunca le pedí que sacara a don Evaristo."], "calm, firm, honest")),
 # 9. Cliffhanger: Fermín solo junto al ventanal, planea cortarle las refacciones. Funde a negro (BLACK 0.4).
 ("c30", 8, talk("Fermín", f"Medium close-up of {FER} {PEC}, alone, standing by the big glass window, looking down at the workshop, a slow scheming smile, his hands in his pockets.{NOBOX}{NO}",
     ["Si Evaristo quiere competir conmigo, que lo intente.", "Mañana hablo con el proveedor de refacciones."], "scheming, calm, low")),
 # CTA final (tras negro)
 ("c31", 8, talk("Evaristo", f"Close-up of {EVA} {SOL}, alone, looking straight into the camera and talking to the viewer from the very first second, his lips moving clearly from the first frame; with warmth and charisma, while he speaks he adjusts the rag on his shoulder, tilts his head, nods, gives a small proud smile and gestures with one open hand.{NOBOX}{NO}",
     ["¿Ustedes creen que Fermín se va a salir con la suya?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little intriguing, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("stands very close in front of", "stands in front of"), ("pointing", "gesturing"), ("steps closer to", "faces"),
        ("his voice rises", "serious"), ("her voice breaks", "quiet voice"), ("furious", "upset"), ("crying softly", "with teary eyes"),
        ("crying", "with teary eyes")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("disdainful", "serious"), ("arrogant", "proud"), ("mocking", "ironic"), ("condescending", "serious"), ("menacing", "calm"),
        ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "serious"), ("threatening", "serious"),
        ("tense", "serious"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shock", "surprise"), ("goes pale", "freezes"), ("dismissive", "serious"), ("irritated", "annoyed"), ("greedy", "pleased"),
        ("young", "adult"), ("teenager", "adult"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"),
        ("cold", "serious"), ("hurt", "sad"), ("pleading", "soft"), ("desperate", "worried"), ("bitter", "serious"),
        ("scheming", "smiling"), ("sly", "calm"), ("suspicious", "curious"), ("trembling", "still"), ("tears forming", "wet eyes"),
        ("breaking", "sad"), ("envious", "surprised"), ("demanding", "insistent"), ("loud", "firm"), ("defiant", "proud"),
        ("bossy", "serious"), ("theatrical", "expressive"), ("stubborn", "insistent"), ("offended", "serious"), ("upset", "serious"),
        ("fake", "polite"), ("guilty", "sad"), ("corroded", "old"), ("crusted", "dirty"),
        ("¡", ""), ("!", "."), ("Recoge tus cosas.", "Ya te puedes ir a tu casa."),
        ("Me hiciste quedar como mentiroso.", "Me hiciste quedar mal."), ("Luego no vengas a pedirme nada.", "Luego no me busques."),
        ("que lo intente", "adelante")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican working-class story, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{EVARISTO}", "a 50-year-old Mexican man"),
         ("@{PATRONTALLER}", "a 56-year-old Mexican man"),
         ("@{OSVALDO}", "a 25-year-old Mexican man"),
         ("@{CELSO}", "a 62-year-old Mexican man"),
         (" @{PROP_CAJAROJA}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Over-the-shoulder medium shot", "Medium shot").replace("Extreme close-up", "Close-up").replace("Medium wide shot", "Medium shot")
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

"""Genera los clips de chocolate-rancho con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
PAT = "on the stone patio of the humble ranch @{LOC_HUERTO}, terracotta adobe walls, red bougainvillea, mesquite trees behind, a dark grey SUV parked at the side, warm afternoon light"
ORO = "on the stone patio of the humble ranch @{LOC_HUERTO}, terracotta adobe walls, red bougainvillea, mesquite trees behind, warm golden-hour backlight, pink sky"
POR = "on the wooden porch of the ranch @{LOC_HUERTO}, clay pots with red bougainvillea, an old wooden bench, soft pink-gold sunset light"
# Ancla de identidad: primera mención de cada personaje en cada prompt
REN = "@{RENATA} (52, shoulder-length wavy dark-brown hair, bottle-green blazer over a pale grey silk blouse, thin gold necklace)"
PRU = "@{PRUDENCIO} (72, thick white moustache, light grey felt cowboy hat, dark navy canvas ranch jacket, red plaid shirt, rust-red bandana)"
EUL = "@{EULALIA} (68, long grey braid, white blouse embroidered with red flowers, mustard-yellow rebozo, coral bead necklace)"
DAM = "@{DAMIAN} (34, neat short black beard, black hair combed back, navy-blue suit, white shirt, mustard-gold tie, white pocket square)"
BEN = "@{BENAVIDES} (60, silver hair, round wire glasses, light grey suit, navy tie, brown leather folder)"

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: los papeles sobre la mesa, sin plano abierto, hablando desde el frame 0 (tarde)
 ("c01", 8, talk("Renata", f"Over-the-shoulder medium shot {PAT}: {REN} places a cream folder firmly on an old wooden table in front of {PRU}, who is seen from behind and blurred in the foreground; Renata looks down at him, cold and proud.",
     ["Firme aquí, don Prudencio. La empresa no va a esperar más.", "Este terreno ya tiene nuevo dueño."], "cold, arrogant")),
 ("c02", 8, talk("Prudencio", f"Close-up of {PRU} {PAT}, his chin up, the blurred bottle-green shoulder of Renata in the foreground.",
     ["Esta tierra no se vende, señora.", "Aquí nací y aquí me voy a morir."], "proud, hurt, firm")),
 ("c03", 10, talk("Renata", f"Medium shot of {REN} {PAT}, she taps the cream folder on the table with two fingers, a thin smile.",
     ["Las escrituras nunca se registraron, don Prudencio.", "El viernes vence el plazo y el terreno pasa a la empresa."], "calm, cold, condescending")),
 ("c04", 8, talk("Eulalia", f"Close-up of {EUL} {PAT}, standing beside the table, indignant, the cream folder blurred in the foreground.",
     ["Guarde sus papeles, licenciada.", "Aquí nadie va a firmar nada."], "indignant, trembling voice")),
 ("c05", 8, talk("Renata", f"Medium shot of {REN} {PAT}, arms crossed, the dark grey SUV behind her, {PRU} blurred at the edge of the frame.",
     ["Entonces vayan haciendo sus maletas.", "El viernes vengo a sacarlos de aquí."], "cold, slow, dismissive")),
 ("c06", 8, talk("Prudencio", f"Close-up of {PRU} {PAT}, he raises his index finger, eyes wet but steady.",
     ["Cuarenta años sembrando esta tierra.", "No se la voy a dar a usted."], "proud, emotional, firm")),
 ("c07", 8, talk("Eulalia", f"Close-up of {EUL} {PAT}, teary eyes, her hands pressed together at her chest.",
     ["Dios está viendo lo que hace.", "Algún día le va a tocar a usted."], "soft, with teary eyes, full of faith")),
 ("c08", 8, talk("Renata", f"Close-up of {REN} {PAT}, a sarcastic smile, one eyebrow raised.",
     ["Pues dígale a Dios que venga el viernes.", "A ver si él firma por ustedes."], "sarcastic, mocking")),
 # 2. Entra el héroe: la taza de chocolate de hace veinte años
 ("c09", 8, talk("Damián", f"Close-up of {DAM} {PAT}, he has just walked in, calm and serious, the blurred shoulder and wavy dark-brown hair of {REN} seen from behind in the left foreground (a woman, not an object; no bottles or jugs anywhere in the frame).",
     ["¿Todo bien por aquí, don Prudencio?", "Buenas tardes, doña Eulalia."], "calm, polite, serious")),
 ("c10", 6, talk("Renata", f"Close-up of {REN} {PAT}, she turns her head, frowning, annoyed.",
     ["¿Y usted quién es?"], "annoyed, cold")),
 ("c11", 10, talk("Damián", f"Close-up of {DAM} {PAT}, looking straight at Renata off-screen, a hurt look in his eyes.",
     ["Hace veinte años usted me tiró una taza de chocolate al piso.", "Yo nada más le pedí algo de comer."], "slow, quiet, hurt")),
 ("c12", 8, talk("Renata", f"Close-up of {REN} {PAT}, dismissive at first, then her eyes narrow as she remembers.",
     ["Yo he tirado muchas cosas en mi vida.", "¿Tú eres el muchacho flaco de la bicicleta?"], "dismissive, then surprised")),
 ("c13", 8, talk("Damián", f"Close-up of {DAM} {PAT}, a small polite nod.",
     ["Damián Robles, para servirle.", "Y esta familia me dio de comer ese mismo día."], "calm, dignified")),
 ("c14", 8, talk("Renata", f"Medium shot of {REN} {PAT}, arms crossed, the dark grey SUV behind her.",
     ["Esto es un negocio, muchacho.", "No tiene nada que ver contigo."], "cold, impatient")),
 ("c15", 6, talk("Damián", f"Close-up of {DAM} {PAT}, firm, he does not blink.",
     ["Cuando se meten con mi familia, sí tiene que ver conmigo."], "low, firm, controlled")),
 # 3. Reencuentro (cama cálida)
 ("c16", 8, talk("Prudencio", f"Close-up of {PRU} {ORO}, his eyes fill with tears, a trembling smile.",
     ["¿Damián? ¿De verdad eres tú, muchacho?", "Mira nomás qué grande estás."], "emotional, voice breaking")),
 ("c17", 8, talk("Damián", f"Close-up of {DAM} {ORO}, eyes wet, a small smile, {PRU} seen from behind and blurred in the left foreground: white hair under his light grey felt cowboy hat, dark navy canvas ranch jacket, rust-red bandana (an old man with a hat, never a dark-haired man in a suit). No other people in the frame.",
     ["Soy yo, don Prudencio.", "Perdóneme por tardar tanto en volver."], "emotional, soft")),
 ("r1", 6, f"Medium wide shot {ORO}: {DAM} hugs {PRU} warmly, {EUL} stands next to them with both hands on her chest, teary eyes. No dialogue."),
 ("c18", 8, talk("Eulalia", f"Close-up of {EUL} {ORO}, with teary eyes, smiling.",
     ["Mi muchacho, virgencita santa.", "Volviste a casa."], "with teary eyes, tender")),
 ("c19", 10, talk("Damián", f"Close-up of {DAM} {ORO}, a tear on his cheek, looking at Eulalia off-screen.",
     ["Nunca los olvidé, doña Eulalia.", "Ni un solo día de estos veinte años."], "emotional, slow, sincere")),
 # 4. Contraataque: las escrituras y la empresa
 ("c20", 8, talk("Renata", f"Medium shot of {REN} {ORO}, arms crossed, a sarcastic half smile.",
     ["Qué bonito reencuentro.", "Pero el viernes este terreno es de la empresa."], "sarcastic, cold")),
 ("c21", 8, talk("Damián", f"Close-up profile of {DAM} {ORO}, calm and sure, he turns his head toward the gate.",
     ["Nadie va a salir de esta casa.", "Ya me encargué de eso. Licenciado Benavides, pase por favor."], "calm, confident")),
 ("c22", 10, talk("Benavides", f"Medium shot of the lawyer {BEN} {ORO}, he opens the brown leather folder and shows a stamped document.",
     ["Buenas tardes. Aquí están las escrituras.", "Registradas esta mañana, a nombre de don Prudencio y doña Eulalia."], "polite, precise")),
 ("c23", 8, talk("Renata", f"Close-up of {REN} {ORO}, her smile disappears, upset.",
     ["Eso no puede ser.", "Mi director nunca va a aceptar esto."], "shaken, then upset")),
 ("c24", 10, talk("Damián", f"Close-up of {DAM} {ORO}, perfectly calm, looking straight at Renata off-screen.",
     ["Su director ya lo aceptó.", "Esta mañana le compré la empresa.", "Ahora el dueño soy yo."], "calm, slow, firm")),
 ("r2", 6, f"Close-up of {REN} {ORO}, in silence, her face goes pale, her lips part, she lowers her eyes. No dialogue."),
 ("c25", 10, talk("Damián", f"Over-the-shoulder medium shot {ORO}: {DAM} places a white envelope with the deed into the hands of {PRU}, who is blurred in the foreground; {EUL} beside them.",
     ["Lo importante no es la empresa, don Prudencio.", "Lo importante es esto.", "Esta tierra es suya. Y nadie se la va a quitar."], "warm, firm")),
 # 5. Caída y perdón
 ("c26", 10, talk("Renata", f"Close-up of {REN} {ORO}, with teary eyes, her voice breaks, she holds her arms tight.",
     ["Damián, espera.", "Mi esposo murió hace un año, y desde entonces todo se me vino abajo.", "Ahora te toca a ti. Quítame todo."], "broken, with teary eyes")),
 ("c27", 8, talk("Damián", f"Close-up of {DAM} {ORO}, serene, no anger in his face.",
     ["Eso no lo aprendí en esta casa.", "Mañana la espero en mi oficina."], "calm, kind, firm")),
 ("c28", 8, talk("Renata", f"Close-up of {REN} {ORO}, confused, wiping a tear.",
     ["¿Para qué?", "¿Después de todo lo que te hice?"], "confused, quiet")),
 ("c29", 8, talk("Damián", f"Close-up of {DAM} {ORO}, a small serious nod.",
     ["Necesito a alguien que conozca esta tierra.", "Usted decide si viene o no."], "calm, serious")),
 # 6. El porche al atardecer: "ya me pagaron"
 ("c30", 8, talk("Prudencio", f"Medium shot of {PRU} seated on the old wooden bench {POR}, wearing his one light grey cowboy hat on his head, {DAM} seated beside him on the same bench. One single continuous image, no duplicated objects, nothing floating in the air.",
     ["¿Cómo te vamos a pagar todo esto, muchacho?", "Nosotros no tenemos nada."], "soft, humble, emotional")),
 ("c31", 10, talk("Damián", f"Close-up of {DAM} seated {POR}, teary eyes, a grateful smile.",
     ["Ya me pagaron, don Prudencio.", "Hace veinte años, con una taza de chocolate y un pan.", "Sin pedirme nada a cambio."], "emotional, slow, grateful")),
 ("c32", 8, talk("Eulalia", f"Close-up of {EUL} {POR}, a steaming blue-and-white talavera cup of hot chocolate @{{PROP_TAZA}} in the foreground, soft warm haze, tender smile.",
     ["Tómatelo despacito, está caliente.", "En esta casa siempre va a haber un plato para ti."], "tender, soft, motherly")),
 ("r3", 6, f"Medium shot of {REN} {ORO}, standing by the open door of the dark grey SUV, she stops and looks back at the ranch porch in silence, unsure. Slow push-in. No dialogue."),
 # CTA final (tras negro)
 ("c33", 8, talk("Damián", f"Close-up of {DAM} {POR}, looking straight into the camera, serious, {PRU} and {EUL} blurred behind him.",
     ["¿Ustedes creen que Renata va a venir mañana?", "Denle me gusta y compartan para ver la segunda parte."], "intimate, firm, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("places a cream folder firmly on", "places a cream folder on"), ("he raises his index finger", "he raises his hand"),
        ("she taps the cream folder on the table with two fingers", "she rests her hand on the cream folder"), ("a tear on his cheek", "teary eyes"),
        ("her voice breaks, she holds her arms tight", "she holds her arms"), ("furious", "upset"), ("crying", "with teary eyes")]
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

NOREF = [("@{RENATA}", "a 52-year-old Mexican businesswoman"),
         ("@{DAMIAN}", "a 34-year-old Mexican man")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Wide shot", "Medium wide shot")
    if k >= 4:  # cambiar el personaje: la hoja de Garza tiene uniforme y placa -> descripción civil sin imagen
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

"""Genera los clips de chocolate-rancho PARTE 2 (La Taza de Chocolate) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
         "No music. Clean frame, no captions, no subtitles, no text on screen.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# Hojas de la Parte 1 (revisadas en hoja de contactos, md5 distintos): RENATA, PRUDENCIO, EULALIA, DAMIAN, BENAVIDES, LOC_HUERTO, PROP_TAZA.
# Hoja nueva: LOC_DESPACHOROBLES (la oficina de Damián).
# Geografía fija. OFICINA: Renata a la IZQUIERDA del cuadro (lado de la puerta), Damián a la DERECHA (tras su escritorio), Benavides de pie a la DERECHA junto a la ventana.
# RANCHO: Prudencio y Eulalia a la IZQUIERDA (lado del porche), Renata y Damián a la DERECHA; Renata sentada en el lado derecho de la mesa de madera.
# QA P2: la hoja LOC_DESPACHOROBLES que bajó Flow es en realidad el sobre lacrado de hacienda-sangre (md5 igual a PROP_SOBRELACRE) y metió
# un sobre con sello de cera en c08, c09, c11, r1, c17 -> la oficina va SIN imagen de referencia, solo descrita, y sin sobres.
OFI = ("in a bright modern executive office in a Mexican city, dark wood desk, brown leather chairs, large window with a city view, soft morning light, "
       "no envelopes and no wax seals anywhere, no name plates, no logos, no lettering anywhere")
ORO = "on the stone patio of the humble ranch @{LOC_HUERTO}, terracotta adobe walls, red bougainvillea, an old wooden table, mesquite trees behind, warm golden-hour backlight"
POR = "on the stone patio of the ranch @{LOC_HUERTO} at sunset, clay pots with red bougainvillea, the wooden porch behind, soft pink-gold sunset light"
# Ancla de identidad y ropa (también para los bordes y planos sobre el hombro: mismo personaje, misma ropa que en la Parte 1).
# QA P1 c09: "bottle-green" salió como un garrafón -> "dark forest-green".
REN = "@{RENATA} (52-year-old woman, shoulder-length wavy dark-brown hair, dark forest-green blazer over a pale grey silk blouse, thin gold necklace)"
DAM = "@{DAMIAN} (34-year-old man, neat short black beard, black hair combed back, navy-blue suit, white shirt, mustard-gold tie, white pocket square)"
# QA reten/medalla P2: dos sombreros en una persona -> exactamente uno, en la cabeza
PRU = "@{PRUDENCIO} (72-year-old man, thick white moustache, exactly one light grey felt cowboy hat worn on his head and no other hat anywhere, dark navy canvas ranch jacket, red plaid shirt, rust-red bandana)"
EUL = "@{EULALIA} (68-year-old woman, long grey braid, white blouse embroidered with red flowers, mustard-yellow rebozo, coral bead necklace)"
# Utilería duplicada: Benavides sin carpeta (la única carpeta es la crema de Renata)
BEN = "@{BENAVIDES} (60-year-old man, short silver hair, round wire glasses, light grey suit, navy tie, both hands empty and clasped in front of him, no folder)"
REN_B = "the blurred back of @{RENATA} seen from behind (a woman with shoulder-length wavy dark-brown hair and a dark forest-green blazer; a woman, not an object)"
DAM_B = "the blurred back of @{DAMIAN} seen from behind (a man with black hair combed back and a navy-blue suit jacket)"
PRU_B = "the blurred back of @{PRUDENCIO} seen from behind (white hair under his one light grey felt cowboy hat, dark navy canvas ranch jacket; an old man with a hat, never a man in a suit)"
FOLDER = "one single plain cream-colored paper folder"
CUP = "one single steaming blue-and-white talavera cup of hot chocolate @{PROP_TAZA} and one round concha sweet bread"
# La carpeta abierta: solo hojas sueltas (QA P2: salía un sobre lacrado encima)
OPEN = "the open cream folder on the desk, holding only a few loose typed sheets of paper, no envelope"
# QA P2 c25: subtítulos quemados -> el diálogo solo se oye (igual que en hacienda-sangre-p2)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {NOSUB}"

CLIPS = [
 # 1. La oficina, a la mañana siguiente (sigue del cliffhanger: ¿Renata va a venir?) — hablando desde el frame 0, recap en 1 frase
 ("c01", 10, talk("c01", "Benavides", f"Medium close-up of the lawyer {BEN} {OFI}, standing on the RIGHT by the window, glancing at his wristwatch; {DAM} seated at the desk, blurred in the right foreground.",
     "polite, precise, a little doubtful")),
 ("c02", 8, talk("c02", "Damián", f"Close-up of {DAM} seated behind the dark wood desk {OFI}, on the RIGHT side of the frame, calm, looking at the office door off-screen to the left.",
     "calm, sure, quiet")),
 ("c03", 10, talk("c03", "Benavides", f"Close-up of the lawyer {BEN} {OFI}, he raises his eyebrows, doubtful.",
     "careful, low")),
 ("c04", 6, f"Medium wide shot {OFI}: the office door on the LEFT opens and {REN} walks in calmly, holding {FOLDER} against her chest; on the RIGHT, {DAM} stands up slowly behind the desk and {BEN} stands by the window. No dialogue."),
 ("c05", 8, talk("c05", "Renata", f"Over-the-shoulder close-up of {REN} {OFI}, standing on the LEFT, holding {FOLDER} against her chest, serious, no smile; in the RIGHT foreground, {DAM_B}.",
     "serious, quiet, proud")),
 ("c06", 8, talk("c06", "Damián", f"Over-the-shoulder close-up of {DAM} {OFI}, standing on the RIGHT behind the desk, he gestures politely with an open hand toward a leather chair; in the LEFT foreground, {REN_B}.",
     "polite, calm, curious")),
 ("c07", 10, talk("c07", "Renata", f"Close-up of {REN} {OFI}, seated in a leather chair, tired eyes, holding {FOLDER} on her lap with both hands.",
     "low, tired, sincere")),
 ("i1", 6, f"Extreme close-up insert {OFI}: the hands of {REN} place {FOLDER} on the dark wood desk and open it; inside, one sheet with a blurred typed list, unreadable. No dialogue."),
 ("c08", 6, talk("c08", "Damián", f"Close-up of {DAM} {OFI}, he looks down at {OPEN}, then up at Renata off-screen to the left.",
     "quiet, serious")),
 ("c09", 10, talk("c09", "Renata", f"Close-up of {REN} seated {OFI}, she looks down at {OPEN}, her voice low.",
     "low, ashamed, honest")),
 ("c10", 10, talk("c10", "Benavides", f"Close-up of the lawyer {BEN} {OFI}, he leans over the desk to look at the open folder, adjusting his round glasses with one finger.",
     "precise, surprised")),
 ("c11", 10, talk("c11", "Damián", f"Close-up of {DAM} {OFI}, he leans back in his chair, studying Renata off-screen to the left; nothing on the desk in front of him.",
     "calm, testing her")),
 ("c12", 10, talk("c12", "Renata", f"Close-up of {REN} {OFI}, eyes shining, she holds his look.",
     "quiet, sincere, voice a little shaky")),
 ("r1", 6, f"Close-up of {DAM} {OFI}, in silence, his serious face softens, he gives one small slow nod; nothing on the desk in front of him. Slow push-in. No dialogue."),
 ("c13", 10, talk("c13", "Benavides", f"Medium close-up of the lawyer {BEN} {OFI}, standing on the RIGHT by the window, looking at the open folder on the desk, impressed.",
     "precise, impressed, calm")),
 ("c14", 10, talk("c14", "Damián", f"Close-up of {DAM} {OFI}, he rises from his chair, calm and decided.",
     "calm, firm, warm")),
 ("c15", 10, talk("c15", "Renata", f"Close-up of {REN} {OFI}, she lowers her eyes, a sad half smile.",
     "quiet, sad")),
 ("c16", 10, talk("c16", "Damián", f"Over-the-shoulder close-up of {DAM} {OFI}, standing on the RIGHT, a small kind smile; in the LEFT foreground, {REN_B}.",
     "soft, firm")),
 ("c17", 10, talk("c17", "Renata", f"Close-up of {REN} {OFI}, surprised, she lifts her eyes to him; nothing on the desk in front of her.",
     "surprised, worried")),
 # 2. El rancho: el perdón y la taza (pago)
 ("c18", 8, talk("c18", "Prudencio", f"Over-the-shoulder close-up of {PRU} {ORO}, standing on the LEFT near the porch, wary, chin up; in the RIGHT foreground, {REN_B}.",
     "rough, wary, proud")),
 ("c19", 10, talk("c19", "Renata", f"Over-the-shoulder close-up of {REN} {ORO}, standing on the RIGHT, her empty hands together in front of her, {DAM} blurred one step behind her; in the LEFT foreground, {PRU_B}.",
     "humble, quiet, sincere")),
 ("c20", 10, talk("c20", "Eulalia", f"Close-up of {EUL} {ORO}, standing on the LEFT beside {PRU}, her arms crossed over her mustard-yellow rebozo, hurt.",
     "hurt, firm, trembling voice")),
 ("c21", 10, talk("c21", "Renata", f"Close-up of {REN} {ORO}, eyes shining, she does not look away.",
     "soft, ashamed, honest")),
 ("c22", 6, talk("c22", "Prudencio", f"Close-up of {PRU} {ORO}, he turns his head to look at Damián off-screen to the right.",
     "low, doubtful")),
 ("c23", 8, talk("c23", "Damián", f"Close-up of {DAM} {ORO}, standing on the RIGHT, a respectful small smile.",
     "calm, respectful")),
 ("r2", 6, f"Close-up of {EUL} {ORO}, in silence, she looks at Renata off-screen for a long moment, then her face softens and she lowers her arms. Slow push-in. No dialogue."),
 ("c24", 10, talk("c24", "Eulalia", f"Medium shot of {EUL} {ORO}, standing on the LEFT side of the old wooden table, she pulls out a wooden chair and gestures to it with an open hand.",
     "tender, motherly, simple")),
 ("i2", 6, f"Close-up insert {ORO}: the hands of {EUL} set {CUP} on the old wooden table in front of {REN}, who is seated on the RIGHT side of the table. No dialogue."),
 ("c25", 10, talk("c25", "Renata", f"Close-up of {REN} seated at the old wooden table {ORO}, {CUP} in front of her, eyes shining, both hands around the cup.",
     "emotional, quiet, voice breaking a little")),
 ("c26", 8, talk("c26", "Eulalia", f"Close-up of {EUL} {ORO}, standing by the table, a tender smile, golden light on her face.",
     "tender, soft, motherly")),
 ("c27", 10, talk("c27", "Damián", f"Close-up of {DAM} {ORO}, standing on the RIGHT, a warm smile, eyes shining.",
     "warm, emotional")),
 # 3. Gancho nuevo: el primer nombre de la lista
 ("c28", 10, talk("c28", "Prudencio", f"Medium close-up of {PRU} {ORO}, standing on the LEFT by the table, a small proud smile.",
     "rough, warm, proud")),
 ("c29", 10, talk("c29", "Renata", f"Close-up of {REN} seated at the old wooden table {ORO}, she opens {FOLDER} and reads the first line.",
     "calm, reading")),
 ("r3", 6, f"Close-up of {DAM} {ORO}, in silence, his smile slowly disappears, his eyes go wide, he freezes. Slow push-in. No dialogue."),
 ("c30", 6, talk("c30", "Prudencio", f"Close-up of {PRU} {ORO}, curious, he looks at Damián off-screen to the right.",
     "curious, low")),
 ("c31", 10, talk("c31", "Damián", f"Close-up of {DAM} {ORO}, standing very still, his voice low, eyes shining.",
     "low, shaken, slow")),
 ("c32", 10, talk("c32", "Eulalia", f"Close-up of {EUL} {ORO}, both hands on her chest, surprised and moved.",
     "surprised, tender")),
 ("c33", 10, talk("c33", "Damián", f"Close-up of {DAM} {ORO}, he looks away toward the road, golden light on his face.",
     "low, heavy, sad")),
 ("c34", 8, talk("c34", "Renata", f"Close-up of {REN} seated at the old wooden table {ORO}, she stays seated on her wooden chair, closes {FOLDER} and holds it against her chest, worried; after the last word she stays silent until the end of the shot.",
     "worried, sincere, quiet")),
 ("r4", 6, f"Medium shot of {DAM} {POR}, in silence, he looks down the dirt road toward the hills, decided, the sunset behind him. Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK)
 ("c35", 10, talk("c35", "Damián", f"Close-up of {DAM} {POR}, looking straight into the camera with charisma; he adjusts the knot of his mustard-gold tie with two fingers, tilts his head slightly, a knowing half smile, nods once and gestures toward the camera with his open hand as he talks, natural organic movement like a telenovela star talking to his audience.",
     "warm, intimate, confident, talking directly to the viewer")),
]

# Flow rechaza llanto exagerado y gestos bruscos: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("voice breaking a little", "soft voice"), ("crying", "with shining eyes"),
        ("ashamed", "quiet"), ("shaken", "surprised"), ("hurt", "serious")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("wary", "careful"), ("testing her", "thoughtful"), ("heavy", "calm"), ("sad", "quiet"), ("doubtful", "thoughtful"),
        ("¡", ""), ("!", "."), ("la puerta en la cara", "la puerta"), ("sacar", "quitar"), ("vergüenza", "pena"), ("romperla", "guardarla"),
        ("borraran", "perdieran"), ("matar", "lastimar"), ("muerto", "perdido")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family drama, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{RENATA}", "a Mexican businesswoman"), ("@{DAMIAN}", "a Mexican businessman"), ("@{BENAVIDES}", "a Mexican lawyer")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
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

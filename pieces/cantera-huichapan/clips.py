"""Genera los clips de cantera-huichapan PARTE 1 (La Cantera de Huichapan, remake transformado de "Le cobraba el equipo de seguridad a los obreros" de @atriumstories_, cantera de Huichapan, Hidalgo, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de aserrin-huamantla (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, unhurried, every word clearly pronounced, clear lip sync, says each sentence only once with no repetitions"
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
END = "After the last word the person stays silent until the end of the shot."
# Gancho 0-2 s: manos desnudas y polvosas tallando cantera junto a unos lentes viejos pegados con cinta (i01) y Rosalba con el plazo: "Abdías, antes de que acabe el turno… me dices por qué cortas sin guantes."
# Plazo: el fin del turno; vuelve invertido contra el villano: "Sotero, súbete a la caseta. Antes de que acabe el turno." (c28).
# La paradoja (como en el original, con otros objetos): el cantero devuelve guantes de carnaza y lentes nuevos porque "todavía no los paga" (c02). Sotero miente con el "reglamento" y la "libreta del almacén" (c15-c17).
# Giro propio: Rosalba le pide a Abdías que vuelva a su mesa con el celular en llamada (c11); Sotero se delata (c24, c27) y ella lo oye todo por ese celular (i03, c29). Sin cámaras ni radio.
# Geografía fija. Patio de la cantera (tarde dorada): Abdías a la IZQUIERDA en su mesa de labrado; Rosalba (c01-c11) y Sotero (c19-c27) a la DERECHA. Junto al tejabán: Sotero a la IZQUIERDA, Rosalba a la DERECHA (c12-c18).
# Caseta: Rosalba sola junto a la ventana (c28-c30). Plano de presentación: Abdías c02, Rosalba c01, Sotero c13. CTA (c30): Rosalba sola en la caseta, a cámara. Sin Navidad.
YARD0 = ("in the open-air work yard of a pink cantera stone quarry near Huichapan, Hidalgo @{LOC_CANTERAHUICH} in warm late-afternoon golden light: big rough blocks of pink and ochre cantera stone, "
         "white stone dust on the ground, a heavy wooden carving table on the LEFT with a half-carved stone block, an old wooden shed with a tin roof, "
         "pale quarry walls cut in steps behind, dry hills with organ cactus on the horizon; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CAB0 = ("inside the small office cabin of the cantera quarry near Huichapan, Hidalgo @{LOC_CASETACANT} in warm afternoon light: wooden walls, an old wooden desk with papers, "
        "a metal shelf with cardboard boxes of new tan leather work gloves and clear safety goggles, a big window looking down at the dusty quarry yard; no readable text, no signs, no logos")
CAB = CAB0 + "; nobody else in the background, no extras, nobody besides the person described"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Rosalba melena corta gris y abrigo camel; solo Abdías bigote delgado, camisa rojo ladrillo y paliacate gris;
# solo Sotero calvo con piocha gris, lentes redondos, camisa de cuadros mostaza y chaleco acolchado verde oscuro liso (sin letras).
ROS = ("@{ROSALBA_MONROY} (52-year-old Mexican woman, light-brown skin, slim, short silver-grey bob haircut, small pearl earrings, no glasses, "
       "a long camel-brown wool coat over a cream turtleneck sweater, dark grey trousers, brown ankle boots, her hands kept low)")
ABD = ("@{ABDIAS_CARBAJAL} (31-year-old Mexican man, brown skin, lean, short black hair, a thin black mustache, no beard, no hat, no glasses on his face, "
       "a faded brick-red cotton work shirt with rolled sleeves covered in white stone dust, a grey bandana tied loosely around his neck, dark brown work trousers)")
SOT = ("@{SOTERO_VERASTEGUI} (56-year-old Mexican man, light skin, heavyset, completely bald head, a thick grey goatee, round wire-rimmed glasses, "
       "a mustard-and-brown plaid flannel shirt under a plain dark-green quilted vest with no letters and no logos, khaki trousers, a yellow pencil behind his right ear)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
GEAR = "a pair of new tan leather work gloves and clear safety goggles inside a clear plastic bag"
OLDG = "old scratched safety goggles with a cracked lens held together with grey tape"
PHONE_R = "one phone with a black case held to her RIGHT ear"
NOTE = "a small black notebook held in his LEFT hand"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
PRES = ("presentation shot: a single-person medium shot from the knees up that shows the whole outfit clearly, NOT an over-the-shoulder shot, "
        "no foreground figure and nobody else at the edges of the frame")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

AL = "standing on the LEFT at the heavy wooden carving table with the half-carved pink stone block"        # Abdías (patio)
RR = "standing on the RIGHT of the quarry yard among the big blocks of pink stone"                          # Rosalba (patio, c01-c11)
SL = "standing on the LEFT in front of the old wooden shed with the tin roof"                               # Sotero (tejabán, c12-c18)
RS = "standing on the RIGHT in front of the old wooden shed, a few steps away"                               # Rosalba (tejabán)
SR = "standing on the RIGHT of the quarry yard among the big blocks of pink stone"                          # Sotero (patio, c19-c27)
RW = "standing alone by the big window of the office cabin, the dusty quarry yard far below"               # Rosalba (caseta)

CLIPS = [
 # 1. Gancho (0-2 s): manos desnudas en la cantera y los lentes pegados con cinta; Rosalba con el plazo del turno
 ("i01", 6, f"Close-up insert {YARD0}: two bare brown hands covered in white dust carve a block of pink cantera stone with a small mallet and a flat chisel, little clouds of dust, "
            f"{OLDG} resting on the stone beside them. Only the hands, the stone and the old goggles, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Rosalba", f"Medium shot of {ROS} {YARD}, {RR}, she has just stopped walking, serious, her eyes on the carving table, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a camel coat')}.", "firm, serious, controlled")),
 ("c02", 6, talk("c02", "Abdías", f"Medium shot of {ABD} {YARD}, {AL}, he lifts {GEAR} from the table with both dusty hands, ashamed but honest, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a brick-red shirt')}.", "humble, honest, quiet")),
 ("c03", 6, talk("c03", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, she frowns, puzzled", "LEFT"),
     "puzzled, firm")),
 ("c04", 6, talk("c04", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, he lowers his eyes for a second, then looks up", "RIGHT"),
     "quiet, honest")),
 ("c05", 6, talk("c05", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, her eyes go wide, then harden", "LEFT"),
     "shocked, firm")),
 ("c06", 6, talk("c06", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, he holds the plastic bag against his chest", "RIGHT"),
     "quiet, sad")),
 ("c07", 6, talk("c07", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, she shakes her head slowly, very serious", "LEFT"),
     "very firm, low")),
 ("c08", 6, talk("c08", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, he glances toward the quarry walls behind him", "RIGHT"),
     "sad, honest")),
 ("i02", 6, f"Close-up insert {YARD0}: {OLDG} lying on a dusty block of pink cantera stone, golden light, white dust in the air. Only the goggles and the stone, no people, no letters. No dialogue."),
 ("c09", 6, talk("c09", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, disbelief, she breathes in", "LEFT"),
     "disbelieving, serious")),
 ("c10", 6, talk("c10", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, the lean young man with the thin mustache is the one who speaks, he counts on his dusty fingers; no woman in the frame", "RIGHT",
     NODOUBLE("man in a brick-red shirt")), "tired, honest")),
 ("c11", 6, talk("c11", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, she lowers her voice, calm and decided", "LEFT"),
     "quiet, decided, secret")),
 # 2. Interrogatorio junto al tejabán: Sotero miente
 ("c12", 6, talk("c12", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RS}, calm on the surface, she looks at the man in front of her", "LEFT"),
     "calm, controlled")),
 ("c13", 6, talk("c13", "Sotero", f"Medium shot of {SOT} {YARD}, {SL}, {NOTE}, a wide polite smile, he opens his free hand, "
     f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('bald man in a green vest')}.", "polite, friendly, a little too sweet")),
 ("c14", 6, talk("c14", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RS}, she does not blink", "LEFT"),
     "calm, firm")),
 ("c15", 6, talk("c15", "Sotero", one(f"Close-up of {SOT} {YARD}, {SL}, he laughs a little, adjusts his round glasses", "RIGHT"),
     "smooth, lying, friendly")),
 ("c16", 6, talk("c16", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RS}, she raises one eyebrow", "LEFT"),
     "calm, serious")),
 ("c17", 6, talk("c17", "Sotero", one(f"Close-up of {SOT} {YARD}, {SL}, he taps the black notebook, his smile a bit stiff", "RIGHT"),
     "nervous, polite")),
 ("c18", 6, talk("c18", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RS}, a small cold smile, she turns to leave", "LEFT"),
     "cold, calm")),
 ("r1", 6, one(f"Close-up of {SOT} {YARD}, {SL}, in silence, his polite smile drops slowly and his face turns hard, he watches someone walk away", "RIGHT") + " Slow push-in. No dialogue."),
 # 3. El villano sin máscara: amenaza a Abdías
 ("c19", 6, talk("c19", "Sotero", one(f"Close-up of {SOT} {YARD}, {SL}, alone, he mutters to himself through his teeth, looking down", "RIGHT"),
     "muttering, angry, low")),
 ("c20", 6, talk("c20", "Sotero", one(f"Close-up of {SOT} {YARD}, {SR}, he leans forward, angry", "LEFT"),
     "angry, sharp")),
 ("c21", 6, talk("c21", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, he stands straight, calm and brave", "RIGHT"),
     "calm, brave")),
 ("c22", 6, talk("c22", "Sotero", one(f"Close-up of {SOT} {YARD}, {SR}, he wags one finger slowly", "LEFT"),
     "menacing, low")),
 ("c23", 6, talk("c23", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, he tilts his head, confused", "RIGHT"),
     "confused, firm")),
 ("c24", 6, talk("c24", "Sotero", one(f"Close-up of {SOT} {YARD}, {SR}, a cocky half smile, he spreads his hands", "LEFT"),
     "cocky, mocking")),
 ("c25", 6, talk("c25", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, he realizes, hurt and angry", "RIGHT"),
     "hurt, indignant")),
 ("c26", 6, talk("c26", "Sotero", one(f"Close-up of {SOT} {YARD}, {SR}, he glances around to check nobody hears", "LEFT"),
     "threatening, quiet")),
 ("c27", 6, talk("c27", "Sotero", one(f"Close-up of {SOT} {YARD}, {SR}, he pushes his round glasses up, arrogant", "LEFT"),
     "arrogant, cold, slow")),
 # 4. La vuelta: el celular en llamada
 ("i03", 6, f"Close-up insert {YARD0}: the chest pocket of a faded brick-red work shirt covered in white stone dust, a phone inside the pocket with its screen lit, "
            f"a call in progress shown only as a green glow, nothing readable. Only the pocket and the phone, no face. No dialogue."),
 ("c28", 6, talk("c28", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RW}, {PHONE_R}, still wearing her long camel wool coat over the cream turtleneck exactly as in her reference sheet (no dark blouse), she looks down through the window, cold and firm", "LEFT"),
     "cold, firm, slow")),
 ("c29", 6, talk("c29", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RW}, {PHONE_R}, a small triumphant look", "LEFT"),
     "calm, final")),
 ("r2", 6, one(f"Close-up of {SOT} {YARD}, {SR}, in silence, he holds a phone to his ear with his RIGHT hand, his face goes pale, he slowly looks up toward the cabin window", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Rosalba sola en la caseta, a cámara
 ("c30", 10, talk("c30", "Rosalba", f"Close-up from the chest up of {ROS} {CAB}, alone, standing by the window, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a knowing little smile, makes a short pause, raises one eyebrow, "
     f"tucks her silver hair behind one ear, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "angry"/"hurt" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Si sigues hablando, mañana no entras.", "Si sigues hablando, mañana platicamos."), ("Nadie te obliga a quedarte.", "Tú sabrás."),
        ("Mientras yo esté a cargo, aquí mando yo.", "Aquí las cosas se hacen a mi modo."), ("Ese Abdías ya abrió la boca.", "Ese Abdías ya fue a contar."),
        ("Esto lo arreglo ahorita.", "Esto lo platico ahorita."),
        ("carve a block of pink cantera stone with a small mallet and a flat chisel", "rub a block of pink cantera stone"),
        ("he glances around to check nobody hears", "he glances around"), ("he wags one finger slowly", "he raises one hand"),
        ("his face goes pale", "his face changes"), ("through his teeth", ""),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("lying", "smooth"), ("muttering", "speaking low"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm late-afternoon light at a pink cantera stone quarry near Huichapan, Hidalgo, stone blocks and white dust, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a stone quarry in Hidalgo in the afternoon, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft afternoon light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROSALBA_MONROY}", "a slim Mexican woman in her fifties with a short silver-grey bob in a long camel-brown wool coat"),
         ("@{ABDIAS_CARBAJAL}", "a lean Mexican man in his thirties with a thin mustache in a dusty brick-red work shirt and a grey neck bandana"),
         ("@{SOTERO_VERASTEGUI}", "a heavyset bald Mexican man with a grey goatee and round glasses in a plaid flannel shirt and a plain dark-green quilted vest"),
         (" @{LOC_CANTERAHUICH}", ""), (" @{LOC_CASETACANT}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    if "LIMITE DE CREDITOS" in r.stdout: print(r.stdout.strip(), flush=True); sys.exit("FIN por limite de creditos")
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control: gatito como IMAGEN (no gasta créditos)."""
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

def new_project():
    subprocess.run(["node", "src/cli.js", "project", "new"], cwd=MCP, capture_output=True, text=True, timeout=180)
    pid = subprocess.run(["node", "src/cli.js", "project"], cwd=MCP, capture_output=True, text=True, timeout=60).stdout.strip()
    subprocess.run(["node", str(Path(__file__).resolve().parents[2] / "tools" / "flow_tabs.js"), "--close-extra", pid], capture_output=True, text=True, timeout=60)
    subprocess.run([sys.executable, "-I", "make_sheets.py", "--reupload"], cwd=D, capture_output=True, text=True, timeout=1800)
    print("PROYECTO NUEVO", pid, "(hojas resubidas)", flush=True)

def main():
    want = set(sys.argv[1:])
    OUT.mkdir(exist_ok=True)
    for cid, dur, body in CLIPS:
        dst = OUT / f"{cid}.mp4"
        if want and cid not in want: continue
        if dst.exists():
            if not want: continue
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            files, log = gen(variant(body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"
            if files:
                new = Path(files[0]).resolve()  # solo contra los clips ya guardados (c*/i*/r*.mp4), nunca contra la descarga misma
                dup = [p for p in OUT.glob("*.mp4") if re.fullmatch(r"[cir]\d+", p.stem) and p.resolve() != new and p.stat().st_size == Path(files[0]).stat().st_size and _md5(p) == _md5(Path(files[0]))]
                if dup: os.remove(files[0]); files, log = [], f"DUPLICADO md5 de {dup[0].name}"  # Flow devolvió un clip ya bajado
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                global CAIDAS; CAIDAS = globals().get("CAIDAS", 0) + 1
                if CAIDAS >= 2: new_project(); CAIDAS = 0
                else: reload_flow()
                time.sleep(20); continue
            CAIDAS = 0
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()

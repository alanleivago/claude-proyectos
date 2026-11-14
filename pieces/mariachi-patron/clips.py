"""Genera los clips de mariachi-patron PARTE 1 (El Mariachi del Patrón, historia propia tipo CAPOS, premisa 8 de fuentes/atrium-vista/resumen.md, VISTA) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de viuda-aguacate (todas sus defensas). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (el sombrero de charro tirado al piso de la fiesta) con plazo y cifra (cinco minutos, veinte mil);
# poder SIN armas: convoy de camionetas de noche, escoltas de manos cruzadas, radio, anillo de plata. Insertos i* sin caras y reacciones mudas r* para <=2 s por plano.
# El protector poderoso (don Rosendo) llega a medianoche porque el mariachi nunca faltó a su cumpleaños. Gancho P2: Gildardo es hijo de Higinio. Castigo para la Parte 2.
# Geografía fija (solo define hacia dónde mira cada uno), todo en el patio de la hacienda de noche:
#   Higinio a la IZQUIERDA junto a la tarima de madera; Maclovio a la IZQUIERDA cerca de él; Gildardo a la DERECHA; Eulogio a la DERECHA.
#   Rosendo (desde c22) al CENTRO: mira a la IZQUIERDA (Higinio) o a la DERECHA (Gildardo/Eulogio). c16: Rosendo solo en su camioneta (sin hoja de locación).
#   CTA (c36): Higinio solo bajo los arcos del patio, a cámara.
PAT0 = ("in the stone patio of a rich cattle hacienda @{LOC_PATIOGANADERO} in Los Altos de Jalisco at night during a party: stone arches, warm string lights overhead, "
        "long tables with white tablecloths far behind, a small wooden stage at one side; warm night light; no readable text, no signs, no logos, no license plates")
PAT = PAT0 + "; the tables far behind are empty, no extras, nobody else in the patio besides the person described"
SUV = ("inside the back seat of a black SUV with tinted windows at night, dark agave fields and distant lights passing outside; no logos, no readable text; "
       "nobody else visible in the car")
# Anclas de identidad y ropa. Solo Rosendo lleva sombrero puesto; solo Maclovio lentes; solo Higinio traje de charro; solo Eulogio cabeza rapada y barba; solo Gildardo chaleco de cuero crema.
HIG = ("@{HIGINIO_LUMBRERAS} (74-year-old Mexican man, brown skin, thin long face with deep wrinkles, thick white mustache, white hair combed back, no hat, no glasses, "
       "worn black charro suit with small silver buttons and a red bow tie, his hands kept low)")
MAC = ("@{MACLOVIO_ZAVALETA} (24-year-old Mexican man, clearly an adult, light brown skin, slim oval face, short straight black hair with a side part, clean-shaven, "
       "thin wire-rimmed glasses, no hat, plain white long-sleeved shirt and black trousers, his hands kept low)")
GIL = ("@{GILDARDO_MONTEMAYOR} (56-year-old Mexican man, light tan skin, heavy square face, slicked-back black hair, thick black horseshoe mustache, no hat, no glasses, "
       "white embroidered western shirt under a cream leather vest, a gold watch, his hands kept low, he never points a finger at anyone)")
EUL = ("@{EULOGIO_MANCERA} (40-year-old Mexican man, tan skin, broad face, shaved head, short black beard, no hat, no glasses, "
       "grey western shirt under a black leather jacket, his hands kept low)")
RING = "a heavy silver ring on his right hand"
ROS = ("@{ROSENDO_CABANAS} (77-year-old Mexican man, tan weathered skin, long serene face with deep wrinkles, short white beard, white hair, "
       f"a black felt cowboy hat, no glasses, dark grey suit over a black shirt with no tie, {RING})")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
HAT = "one black charro hat with silver embroidery"
WATCH = "one old silver pocket watch"
GUIT = "one old wooden guitar"
RADIO = "one black handheld radio held low in his RIGHT hand"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

HL = "standing on the LEFT beside the small wooden stage"                      # Higinio
ML = "standing on the LEFT near the small wooden stage"                        # Maclovio
GR = "standing on the RIGHT under the string lights"                           # Gildardo
ER = "standing on the RIGHT under a stone arch"                                # Eulogio
RC = "standing in the CENTER of the stone patio, black SUVs far behind him beyond the arches"  # Rosendo

CLIPS = [
 # 1. Gancho (0-2 s): el sombrero de charro al piso, plazo de cinco minutos y los veinte mil
 ("i01", 6, f"Close-up insert {PAT0}: a man's hand in a white embroidered sleeve throws {HAT} onto the stone floor; the hat lands upside down under the string lights. "
            f"Only the hand, the hat and the floor, no faces. No dialogue."),
 ("c01", 8, talk("c01", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, a cold arrogant smile", "LEFT",
     NODOUBLE("man in a cream leather vest")), "arrogant, cold, unhurried")),
 ("i02", 6, f"Close-up insert {PAT0}: a man's hands in grey sleeves tear one small white paper in two and drop the pieces on the stone floor beside {HAT}. "
            f"Only the hands, the paper and the hat, no faces. No dialogue."),
 ("c02", 6, talk("c02", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, dignified, holding back his anger", "RIGHT",
     NODOUBLE("man in a black charro suit")), "dignified, firm, quiet")),
 ("c03", 6, talk("c03", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, he shrugs, mocking", "LEFT"),
     "mocking, bored, cold")),
 ("r1", 6, one(f"Close-up of {MAC} {PAT}, {ML}, in silence, he picks up {HAT} from the floor and holds it against his chest, his jaw tight", "RIGHT") + " Slow push-in. No dialogue."),
 ("c04", 8, talk("c04", "Maclovio", one(f"Close-up of {MAC} {PAT}, {ML}, worried, holding {HAT} in both hands", "LEFT",
     NODOUBLE("young man in glasses")), "worried, upset, quick")),
 ("c05", 6, talk("c05", "Eulogio", one(f"Close-up of {EUL} {PAT}, {ER}, {RADIO}, a cold half smile", "LEFT",
     NODOUBLE("man with a shaved head")), "cold, dismissive")),
 # 2. Lo corren: dos mil de limosna y un compromiso a las doce
 ("c06", 6, talk("c06", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, calm, he nods once", "RIGHT"),
     "calm, tired, firm")),
 ("c07", 6, talk("c07", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, he laughs once, mocking", "LEFT"),
     "mocking, amused")),
 ("c08", 6, talk("c08", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, he holds up two folded bills between two fingers, a cold smile", "LEFT"),
     "cold, arrogant, low")),
 ("c09", 6, talk("c09", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, proud, he shakes his head slowly", "RIGHT"),
     "proud, firm, quiet")),
 ("c10", 6, talk("c10", "Eulogio", one(f"Close-up of {EUL} {PAT}, {ER}, {RADIO}, he tilts his head toward the arches", "LEFT"),
     "cold, firm")),
 ("r2", 6, one(f"Close-up of {HIG} {PAT}, {HL}, in silence, he looks down at {WATCH} open in his RIGHT hand, serious", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", 6, talk("c11", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, {WATCH} in his RIGHT hand, calm and proud", "RIGHT"),
     "calm, proud, warm")),
 ("c12", 6, talk("c12", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, he laughs, mocking", "LEFT"),
     "mocking, amused, cold")),
 # 3. Las doce: el reloj, el cumpleaños de don Rosendo, la guitarra a su estuche
 ("i03", 6, f"Extreme close-up insert {PAT0}: an old wrinkled hand opens {WATCH}; its two hands are almost at twelve. Only the hand and the watch, no faces. No dialogue."),
 ("c13", 6, talk("c13", "Maclovio", one(f"Close-up of {MAC} {PAT}, {ML}, worried, he speaks low", "LEFT",
     NODOUBLE("young man in glasses")), "worried, a whisper")),
 ("c14", 6, talk("c14", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, sad, he lowers his eyes", "LEFT"),
     "sad, quiet, tender")),
 ("i04", 6, f"Close-up insert {PAT0}: an old man's hands in black sleeves with small silver buttons lay {GUIT} into a worn black guitar case and close the lid slowly. "
            f"Only the hands, the guitar and the case, no faces. No dialogue."),
 ("c15", 6, talk("c15", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, tired but dignified", "LEFT"),
     "tired, dignified, quiet")),
 # 4. Montaje paralelo: don Rosendo lo espera y sale el convoy
 ("c16", 6, talk("c16", "Rosendo", one(f"Close-up of {ROS} {SUV}, he looks at a gold wristwatch, serious", "LEFT",
     NODOUBLE("old man in a black felt hat")), "serious, low, slow, the one who is in charge")),
 ("i05", 6, f"Aerial drone shot at night over a dirt road between dark agave fields in Los Altos de Jalisco: eight black SUVs with no logos and their headlights on "
            f"drive in a line raising dust. No people visible, no license plates. No dialogue."),
 ("c17", 6, talk("c17", "Eulogio", one(f"Close-up of {EUL} {PAT}, {ER}, {RADIO}, he lowers the radio, surprised", "LEFT"),
     "surprised, quick, low")),
 ("c18", 6, talk("c18", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, relaxed, he adjusts his vest", "LEFT"),
     "relaxed, proud")),
 ("c19", 6, talk("c19", "Eulogio", one(f"Close-up of {EUL} {PAT}, {ER}, {RADIO}, worried", "LEFT"),
     "worried, low")),
 ("c20", 6, talk("c20", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, he frowns, a little uneasy", "LEFT"),
     "surprised, uneasy")),
 # 5. La llegada: las camionetas; don Rosendo viene por su mariachi
 ("i06", 6, f"Wide shot at night {PAT0}: eight black SUVs with no logos stop with their headlights on beyond the stone arches of the patio; men in plain black suits step out "
            f"and stand still in a row, hands crossed in front of them; their hands are empty, no weapons. No dialogue."),
 ("c21", 6, talk("c21", "Eulogio", one(f"Close-up of {EUL} {PAT}, {ER}, {RADIO}, worried, a whisper", "LEFT"),
     "worried, a whisper")),
 ("i07", 6, f"Close-up insert at night {PAT0}: an old man's hand with {RING} rests on the edge of the open door of a black SUV; black boots step down onto the stone floor. "
            f"Only the hand, the door and the boots, no faces. No dialogue."),
 ("c22", 6, talk("c22", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, he touches the brim of his hat, warm and serious", "LEFT",
     NODOUBLE("old man in a black felt hat")), "warm, serious, low")),
 ("c23", 6, talk("c23", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, a nervous forced smile, his hands open", "LEFT"),
     "nervous, flattering")),
 ("c24", 6, talk("c24", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, calm, he looks straight at him", "RIGHT"),
     "calm, cold, slow")),
 ("r3", 6, one(f"Close-up of {GIL} {PAT}, {GR}, in silence, his smile fades, he swallows and glances toward the old mariachi", "LEFT") + " Slow push-in. No dialogue."),
 ("c25", 6, talk("c25", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, worried, his hands open and low", "LEFT"),
     "worried, quick, pleading")),
 ("c26", 6, talk("c26", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, very calm", "RIGHT"),
     "calm, proud, low")),
 # 6. Momento cálido: cincuenta años de mañanitas, las canciones gratis en la feria
 ("c27", 6, talk("c27", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, his eyes shine, a small sad smile", "RIGHT"),
     "tender, a little ashamed, quiet")),
 ("c28", 6, talk("c28", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, his eyes soft, he speaks gently", "LEFT"),
     "gentle, sincere, low")),
 ("c29", 6, talk("c29", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, he nods slowly, a warm small smile", "LEFT"),
     "warm, grateful, low")),
 ("r4", 6, one(f"Close-up of {HIG} {PAT}, {HL}, in silence, his eyes shine, he holds {HAT} against his chest with both hands", "RIGHT") + " Slow push-in. No dialogue."),
 # 7. Inversión, plazo y la verdad (el castigo queda para la Parte 2)
 ("c30", 6, talk("c30", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, calm, he lifts his chin toward the floor", "RIGHT"),
     "calm, firm, low")),
 ("r5", 6, f"Medium shot of {EUL} {PAT}, {ER}, in silence, he kneels on the stone floor and picks up two pieces of torn white paper, ashamed, eyes down; "
           f"{SOLO}; {ALONE}. Slow push-in. No dialogue."),
 ("c31", 6, talk("c31", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, still, calm and final", "RIGHT"),
     "calm, final, slow")),
 ("c32", 6, talk("c32", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, sweating, his hands open and low", "LEFT"),
     "ashamed, worried, quick")),
 ("c33", 6, talk("c33", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, he narrows his eyes, suspicious", "RIGHT"),
     "calm, suspicious, quiet")),
 ("c34", 6, talk("c34", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, his eyes shine, he speaks with sad dignity", "RIGHT"),
     "sad, dignified, low")),
 ("c35", 6, talk("c35", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, hurt and serious, he slowly shakes his head", "RIGHT"),
     "hurt, serious, low")),
 # CTA con carisma (después del BLACK): Higinio bajo los arcos, a cámara
 ("c36", 10, talk("c36", "Higinio", f"Medium close-up of {HIG} {PAT}, alone, standing under a stone arch of the patio, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; while he speaks he puts on {HAT}, adjusts its brim, tilts his head, "
     f"raises his eyebrows, nods and smiles a little under his white mustache. Nobody else in the patio.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("with disgust", "coldly"), ("brake hard", "stop")]
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"),
        ("¡", ""), ("!", "."), ("Agarren sus guitarras y se van.", "Tomen sus guitarras y se van."), ("¿Otro borracho de cantina?", "¿Otro amigo de cantina?"),
        ("Y no vuelva a pisar mi hacienda.", "Y no vuelva a mi hacienda."), ("Y de los veinte mil, olvídese.", "Y los veinte mil, olvídelos."),
        ("throws", "drops"), ("tear one small white paper in two and drop the pieces", "fold one small white paper and drop it"),
        ("two pieces of torn white paper", "two pieces of white paper"), ("two folded bills", "one folded paper")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm night light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, the stone patio of a hacienda in Jalisco at night with warm string lights, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm night light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{HIGINIO_LUMBRERAS}", "an old Mexican mariachi"), ("@{MACLOVIO_ZAVALETA}", "a Mexican violinist"),
         ("@{GILDARDO_MONTEMAYOR}", "a rich Mexican rancher"), ("@{EULOGIO_MANCERA}", "a Mexican foreman"),
         ("@{ROSENDO_CABANAS}", "an old Mexican rancher"), (" @{LOC_PATIOGANADERO}", "")]
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

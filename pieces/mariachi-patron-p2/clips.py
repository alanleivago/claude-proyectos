"""Genera los clips de mariachi-patron-p2 PARTE 2 (El Mariachi del Patrón, VISTA, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de chofer-patrona (todas sus defensas: gatito en imagen, recarga, proyecto nuevo, duplicados md5). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
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
# Parte 2 (castigo, sin armas ni sangre). Gancho visual 0-2 s: los escoltas de Rosendo cierran los arcos ("que nadie salga").
# Castigos: Gildardo confiesa en la tarima, con micrófono, que el mariachi es su padre; Eulogio deja el radio y se va a pie; Rosendo se lleva el ganado por la cosecha;
# Higinio se lo devuelve con una condición: un año tocando con él en la plaza, por limosna (eco de "yo no canto por limosna" de la Parte 1). Cierre: amanece y cantan las mañanitas.
# Geografía fija (la de la Parte 1), todo en el patio de la hacienda: Higinio IZQUIERDA junto a la tarima; Maclovio IZQUIERDA cerca de él; Gildardo DERECHA (en la tarima c07, c09);
#   Eulogio DERECHA bajo un arco; Rosendo CENTRO: mira a la IZQUIERDA (Higinio/Maclovio) o a la DERECHA (Gildardo/Eulogio). CTA (c34): Higinio solo bajo un arco, a cámara.
# Luz: noche con foquitos hasta c14; azul del alba desde c15 hasta c30; amanecer dorado desde i07 hasta el CTA.
PAT0 = ("in the stone patio of a rich cattle hacienda @{LOC_PATIOGANADERO} in Los Altos de Jalisco late at night after a party: stone arches, warm string lights overhead, "
        "long tables with white tablecloths far behind, a small wooden stage at one side; warm night light; no readable text, no signs, no logos, no license plates")
DAWN0 = PAT0.replace("late at night after a party", "in the deep blue light just before dawn").replace("warm night light", "cold blue dawn light mixed with the warm string lights")
SUN0 = PAT0.replace("late at night after a party", "at sunrise").replace("warm night light", "soft golden sunrise light, the string lights still on")
EMPTY = "; the tables far behind are empty, no extras, nobody else in the patio besides the person described"
PAT, DAWN, SUN = PAT0 + EMPTY, DAWN0 + EMPTY, SUN0 + EMPTY
# Anclas de identidad y ropa (las de la Parte 1). Solo Rosendo lleva sombrero puesto; solo Maclovio lentes; solo Higinio traje de charro; solo Eulogio cabeza rapada y barba; solo Gildardo chaleco de cuero crema.
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
GUIT = "one old wooden guitar"
CASE = "one worn black guitar case"
MIC = "one black microphone on a chrome stand in front of him"
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
GS = f"standing on the small wooden stage at the RIGHT, {MIC}"                 # Gildardo en la tarima (c07, c09)
ER = "standing on the RIGHT under a stone arch"                                # Eulogio
RC = "standing in the CENTER of the stone patio, black SUVs far behind him beyond the arches"  # Rosendo

CLIPS = [
 # 1. Gancho (0-2 s): los escoltas cierran los arcos; nadie sale
 ("i01", 6, f"Wide shot {PAT0}: men in plain black suits step in a row under the stone arches and close the way out, hands crossed in front of them; "
            f"eight black SUVs with their headlights on wait behind them. Their hands are empty, no weapons, no faces in sharp focus. No dialogue."),
 ("c01", 6, talk("c01", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, very calm, the one in charge", "RIGHT",
     NODOUBLE("old man in a black felt hat")), "calm, cold, slow, the one who is in charge")),
 ("c02", 6, talk("c02", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, a nervous forced smile, his hands open and low", "LEFT",
     NODOUBLE("man in a cream leather vest")), "nervous, quick, flattering")),
 ("r1", 6, one(f"Close-up of {HIG} {PAT}, {HL}, in silence, he lowers his eyes and holds {HAT} against his chest with both hands", "RIGHT") + " Slow push-in. No dialogue."),
 ("c03", 6, talk("c03", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, sad and dignified, {HAT} against his chest", "RIGHT",
     NODOUBLE("man in a black charro suit")), "sad, dignified, low")),
 ("c04", 6, talk("c04", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, he narrows his eyes, disappointed", "RIGHT"),
     "disappointed, cold, low")),
 ("c05", 6, talk("c05", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GR}, defensive, he looks away", "LEFT"),
     "defensive, quick")),
 ("c06", 6, talk("c06", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, calm and final, he lifts his chin toward the stage", "RIGHT"),
     "calm, firm, slow")),
 ("i02", 6, f"Close-up insert {PAT0}: brown boots under dark jeans climb the three wooden steps of the small stage toward {MIC}. "
            f"Only the boots, the steps and the microphone stand, no faces. No dialogue."),
 # 2. Castigo público: confiesa en la tarima
 ("c07", 6, talk("c07", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GS}, ashamed, he speaks into the microphone, eyes down", "LEFT"),
     "ashamed, quiet, his voice heard through a microphone")),
 ("r2", 6, one(f"Close-up of {HIG} {PAT}, {HL}, in silence, his eyes shine, he looks up toward the stage", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, very calm, he does not blink", "RIGHT"),
     "calm, cold, low")),
 ("c09", 6, talk("c09", "Gildardo", one(f"Close-up of {GIL} {PAT}, {GS}, ashamed, he swallows before speaking into the microphone", "LEFT"),
     "ashamed, low, his voice heard through a microphone")),
 # 3. Castigo de Eulogio: deja el radio y se va a pie
 ("c10", 6, talk("c10", "Eulogio", one(f"Close-up of {EUL} {PAT}, {ER}, {RADIO}, worried, his free hand open", "LEFT",
     NODOUBLE("man with a shaved head")), "worried, quick, pleading")),
 ("c11", 6, talk("c11", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, calm, he glances at the radio", "RIGHT"),
     "calm, firm, low")),
 ("i03", 6, f"Close-up insert {PAT0}: a man's hand in a black leather sleeve puts one black handheld radio down on a white tablecloth and lets go of it. "
            f"Only the hand, the radio and the table, no faces. No dialogue."),
 ("c12", 6, talk("c12", "Rosendo", one(f"Close-up of {ROS} {PAT}, {RC}, it is still deep black night, the sky above the arches is completely black, only the warm string lights glow, still, calm and final", "RIGHT"),
     "calm, final, slow")),
 ("c13", 6, talk("c13", "Eulogio", one(f"Close-up of {EUL} {PAT}, {ER}, ashamed, eyes down, his hands empty", "LEFT"),
     "ashamed, quiet, sincere")),
 ("c14", 6, talk("c14", "Higinio", one(f"Close-up of {HIG} {PAT}, {HL}, calm and dignified, a small nod", "RIGHT"),
     "calm, dignified, warm")),
 ("i04", 6, f"Wide shot at night from behind: a bald man in a black leather jacket and black jeans walks away alone down a dirt road between dark agave fields, "
            f"past the headlights of the parked black SUVs, his hands empty. Seen only from behind, no face. No dialogue."),
 ("r3", 6, one(f"Close-up of {MAC} {PAT}, {ML}, in silence, a small proud smile, he looks toward his grandfather", "LEFT") + " Slow push-in. No dialogue."),
 # 4. La cosecha: se lleva el ganado
 ("c15", 6, talk("c15", "Rosendo", one(f"Close-up of {ROS} {DAWN}, {RC}, calm, he looks at the blue sky over the arches", "RIGHT"),
     "calm, cold, slow")),
 ("c16", 6, talk("c16", "Gildardo", one(f"Close-up of {GIL} {DAWN}, {GR}, sweating, his hands open and low", "LEFT"),
     "worried, pleading, quick")),
 ("c17", 6, talk("c17", "Rosendo", one(f"Close-up of {ROS} {DAWN}, {RC}, calm and final, he barely moves", "RIGHT"),
     "calm, final, low")),
 ("i05", 6, f"Wide shot in the deep blue light just before dawn: three plain cattle trucks with no logos and no license plates, loaded with brown cows, "
            f"drive slowly out through the open wooden gate of a hacienda corral raising dust; the corral behind them is empty. No people visible. No dialogue."),
 ("r4", 6, one(f"Close-up of {GIL} {DAWN}, {GR}, in silence, he goes pale and looks toward the empty corral, his lips slightly open", "LEFT") + " Slow push-in. No dialogue."),
 ("c18", 6, talk("c18", "Gildardo", one(f"Close-up of {GIL} {DAWN}, {GR}, his voice breaks, his hands open and low", "LEFT"),
     "desperate, quiet, pleading")),
 ("c19", 6, talk("c19", "Maclovio", one(f"Close-up of {MAC} {DAWN}, {ML}, serious and calm, he looks straight at him", "RIGHT",
     NODOUBLE("young man in glasses")), "serious, calm, low")),
 # 5. Momento cálido: la verdad del padre
 ("c20", 6, talk("c20", "Higinio", one(f"Close-up of {HIG} {DAWN}, {HL}, his eyes shine, a small sad smile", "RIGHT"),
     "tender, sad, quiet")),
 ("c21", 6, talk("c21", "Gildardo", one(f"Close-up of {GIL} {DAWN}, {GR}, confused and hurt, he frowns", "LEFT"),
     "hurt, confused, low")),
 ("c22", 6, talk("c22", "Higinio", one(f"Close-up of {HIG} {DAWN}, {HL}, he shakes his head slowly, gentle", "RIGHT"),
     "gentle, sad, low")),
 ("r5", 6, one(f"Close-up of {GIL} {DAWN}, {GR}, in silence, his eyes shine, he lowers his head slowly", "LEFT") + " Slow push-in. No dialogue."),
 ("c23", 6, talk("c23", "Gildardo", one(f"Close-up of {GIL} {DAWN}, {GR}, ashamed, his eyes shine, he speaks very softly", "LEFT"),
     "ashamed, broken, very quiet")),
 # 6. Higinio decide: un año por limosna
 ("c24", 6, talk("c24", "Rosendo", one(f"Close-up of {ROS} {DAWN}, {RC}, he turns his eyes to his friend, serious and kind", "LEFT"),
     "serious, kind, low")),
 ("c25", 6, talk("c25", "Higinio", one(f"Close-up of {HIG} {DAWN}, {HL}, calm, he lifts one finger slightly", "RIGHT"),
     "calm, firm, warm")),
 ("c26", 6, talk("c26", "Higinio", one(f"Close-up of {HIG} {DAWN}, {HL}, a small knowing smile under his white mustache", "RIGHT"),
     "calm, a little playful, firm")),
 ("c27", 6, talk("c27", "Gildardo", one(f"Close-up of {GIL} {DAWN}, {GR}, surprised, his eyebrows up", "LEFT"),
     "surprised, quick")),
 ("c28", 6, talk("c28", "Rosendo", one(f"Close-up of {ROS} {DAWN}, {RC}, calm, a very small smile", "RIGHT"),
     "calm, firm, low")),
 ("c29", 6, talk("c29", "Maclovio", one(f"Close-up of {MAC} {DAWN}, {ML}, a small smile, he adjusts his glasses", "RIGHT"),
     "friendly, a little playful")),
 ("i06", 6, f"Close-up insert {DAWN0}: an old wrinkled hand in a black sleeve with small silver buttons hands {CASE} to a man's hands with a gold watch "
            f"in a white embroidered sleeve; the younger hands hold it carefully. Only the hands and the case, no faces. No dialogue."),
 ("c30", 6, talk("c30", "Gildardo", one(f"Close-up of {GIL} {DAWN}, {GR}, he nods, humble, {CASE} held against his chest", "LEFT"),
     "humble, quiet, sincere")),
 # 7. Amanece: las mañanitas
 ("i07", 6, f"Wide shot at sunrise: the first golden sunlight rises over the blue agave fields of Los Altos de Jalisco behind the stone arches of the hacienda. "
            f"No people visible. No dialogue."),
 ("c31", 6, talk("c31", "Rosendo", one(f"Close-up of {ROS} {SUN}, {RC}, warm, he touches the brim of his hat and smiles", "LEFT"),
     "warm, gentle, low")),
 ("c32", 6, talk("c32", "Higinio", one(f"Close-up of {HIG} {SUN}, {HL}, the sky behind him bright pale gold and orange with the first sunrise light on his face, it is clearly morning and not night, a warm smile, he turns his head to his right", "RIGHT"),
     "warm, happy, tender")),
 ("i08", 6, f"Close-up insert {SUN0}: a man's hands with a gold watch open {CASE} and lift out {GUIT}; an old wrinkled hand in a black charro sleeve takes it by the neck. "
            f"Only the hands, the case and the guitar, no faces. No dialogue."),
 ("c33", 6, talk("c33", "Gildardo", one(f"Close-up of {GIL} {SUN}, {GR}, a shy small smile, his eyes shine", "LEFT"),
     "shy, warm, quiet")),
 # CTA con carisma (después del BLACK): Higinio bajo un arco al amanecer, a cámara
 ("c34", 10, talk("c34", "Higinio", f"Medium close-up of {HIG} {SUN}, alone, standing under a stone arch of the patio, looking straight into the camera and talking to the viewer "
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
        ("desperate", "worried"), ("broken", "quiet"), ("his voice breaks", "very quiet"), ("goes pale", "stays very still"), ("disappointed", "serious"),
        ("¡", ""), ("!", "."), ("Su mamá se lo llevó chiquito.", "Su mamá se lo llevó hace años."), ("Me va a dejar sin nada.", "Me quedo sin nada."),
        ("Ese señor no es nada mío.", "Ese señor no es mi familia."), ("Y le tiré su sombrero.", "Y le quité su sombrero."),
        ("close the way out", "stand in a line"), ("loaded with brown cows", "carrying brown cattle")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm string lights and blue dawn light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, the stone patio of a hacienda in Jalisco near dawn with warm string lights, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft dawn light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

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
    print("FIN P2", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()

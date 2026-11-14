"""Genera los clips de plata-taxco PARTE 1 (Los Faroles de Taxco, remake transformado de "Lo corrieron por ayudar a un anciano…" de @atriumstories_, Taxco, Guerrero, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de invernadero-atlixco (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# Fórmula capos: gancho visual 0-2 s (la charola de piezas de plata cae al empedrado) con la figura y el plazo ("Antes que prendan los faroles, maestro. Ni el viejo de la mina lo salva");
# poder SIN armas: una fila de camionetas blancas de la mina baja del cerro, los mineros en fila con los brazos cruzados, el patrón que levanta del suelo la pulsera del maestro.
# El que humilla: Gumaro, joyero de la plaza, le tira las piezas a Severiano, maestro platero, y le exige que le firme el local del taller. Plazo: los faroles del callejón (i03).
# Indicios del giro ANTES de revelarlo: "alguien de arriba me lo dio" + el anillo de plata con estrella (c07, i02), "yo hice ese anillo" (c08), "me juraron que usted no bajaba" (c23),
#   "me abrieron la puerta, alguien de su propia casa" (c29), "está en mi balcón" (c31). Revelación: se cierran las persianas del balcón (i07, r4) y Severiano: "Es su nieta Leocadia." (c32);
#   Anastasio: "¿Le diste el anillo de tu abuela?" (c33). Castigo para la Parte 2. Sin Navidad.
# Geografía fija en el callejón empedrado de Taxco (hora azul, el callejón baja hacia la cámara, las torres rosas de Santa Prisca arriba al fondo):
#   el taller de platería con su mesa de trabajo de madera a la IZQUIERDA; la joyería de Gumaro con su balcón de madera y persianas a la DERECHA, cruzando el callejón.
#   Severiano al CENTRO-IZQUIERDA junto a la mesa de trabajo; Gumaro a la DERECHA frente a su joyería, el balcón arriba detrás de él; Eufrosina a la IZQUIERDA en la puerta del taller.
#   Anastasio (desde c22) al CENTRO en el empedrado, sus camionetas blancas detrás, callejón abajo. Leocadia (r4) en el balcón de la joyería.
#   Faroles de fierro APAGADOS hasta i03; desde i03 ENCENDIDOS. c17-c18: el portal de la oficina de la mina (LOC_MINA2). CTA (c34): Severiano solo en la puerta de su taller, a cámara.
TAL0 = ("in a steep cobbled alley of Taxco, Guerrero @{LOC_TALLERPLATA} at blue-hour dusk: white houses with red clay tile roofs, the open wooden door of a small silversmith workshop "
        "with an old wooden workbench out front, wrought-iron street lamps on the white walls, the pink stone twin towers of the Santa Prisca church at the top of the alley; "
        "no readable text, no signs, no logos")
OFF = "; the wrought-iron street lamps are still unlit"
ON = "; the wrought-iron street lamps are now lit with warm yellow light"
TAL = TAL0 + "; nobody else in the background, no extras, nobody besides the person described"
MIN = ("on the stone porch of the office of an old silver mine in the hills above Taxco @{LOC_MINA2} at dusk: a rusty iron mine headframe, a dusty yard with white pickup trucks "
       "with no logos, the white town of Taxco far below; no logos, no readable text")
# Anclas de identidad y ropa (ver make_sheets.py). Solo Anastasio lleva sombrero (de palma blanco con banda negra) y bigote blanco; solo Severiano lentes redondos y mandil de cuero;
# solo Gumaro pelo engominado, bigote delgado y camisa vino; solo Eufrosina paliacate rojo y mandil negro; solo Leocadia vestido verde esmeralda.
SEV = ("@{SEVERIANO_OCAMPO} (64-year-old Mexican man from Guerrero, brown skin, thin and wiry, bald on top with short grey hair at the sides, small round wire glasses, short grey stubble, "
       "no hat, a grey work shirt with rolled sleeves under a worn brown leather work apron, his hands kept low)")
GUM = ("@{GUMARO_LIZARDI} (48-year-old Mexican man, light skin, short and stocky, thick black hair slicked back with gel, a thin pencil mustache, clean-shaven chin, no hat, no glasses, "
       "a wine-red long-sleeve dress shirt, black trousers, a thick gold wristwatch on his LEFT wrist, his hands kept low, he never points a finger at anyone)")
EUF = ("@{EUFROSINA_BAHENA2} (34-year-old Mexican woman, brown skin, slim, short wavy black hair tied back with a red bandana, no glasses, "
       "an olive-green blouse under a black canvas work apron, her hands kept low)")
ANA = ("@{ANASTASIO_BERMEJO2} (72-year-old Mexican man, tan weathered skin, tall and broad-shouldered, short white hair, a thick white mustache, a white palm straw sombrero with a black band, "
       "a tan suede jacket over a white shirt, one wide silver ring engraved with a small star on his RIGHT hand, his hands empty and low)")
LEO = ("@{LEOCADIA_BERMEJO2} (29-year-old Mexican woman, light-brown skin, slim, long straight black hair worn loose, small gold hoop earrings, a sleeveless emerald-green dress, "
       "red nail polish)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre en la MISMA mano.
PHONE_R = "one black phone held in her RIGHT hand"
PHONE_RH = "one black phone held in his RIGHT hand"
RING_R = "one small wide silver ring engraved with a small star, held up between the fingers of his RIGHT hand"
CUFF = "a wide silver cuff bracelet engraved with a jaguar and set with one round black obsidian stone"
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

SC = "standing at the CENTER-LEFT beside the old wooden workbench in front of the open workshop door"                                          # Severiano
GR = "standing on the RIGHT in front of a jewelry shop with a closed wooden balcony above and behind him, across the alley"                      # Gumaro
EL_ = "standing on the LEFT in the open wooden doorway of the silversmith workshop, shelves with tools behind her"                              # Eufrosina
AC = "standing in the CENTER of the cobbled alley, white pickup trucks with no logos parked behind him further down the alley"                   # Anastasio
RING_SWING = "one small wide silver ring engraved with a small star turned slowly between the thick fingers of a heavy hand, a wine-red sleeve at the wrist"

CLIPS = [
 # 1. Gancho (0-2 s): las piezas de plata al empedrado, "antes que prendan los faroles"
 ("i01", 6, f"Close-up insert {TAL0}{OFF}: a heavy LEFT hand with a thick gold wristwatch and a wine-red sleeve sweeps a black velvet tray of handmade silver jewelry off the old wooden workbench; "
            f"the silver pieces fall and scatter on the cobblestones, among them {CUFF}. Only the hand, the tray, the jewelry and the stones, no faces. No dialogue."),
 ("c01", 6, talk("c01", "Gumaro", one(f"Close-up of {GUM} {TAL}{OFF}, {GR}, relaxed and sure of himself, a small mocking half smile", "LEFT",
     NODOUBLE("man in a wine-red shirt")), "relaxed, mocking, unhurried, like he owns the street")),
 ("c02", 6, talk("c02", "Severiano", one(f"Close-up of {SEV} {TAL}{OFF}, {SC}, calm, he glances down at his silver pieces on the cobblestones", "RIGHT",
     NODOUBLE("man in a leather apron")), "calm, quiet, firm")),
 ("c03", 6, talk("c03", "Gumaro", one(f"Close-up of {GUM} {TAL}{OFF}, {GR}, he looks the workshop up and down, cold", "LEFT"),
     "cold, sure")),
 ("c04", 6, talk("c04", "Severiano", one(f"Close-up of {SEV} {TAL}{OFF}, {SC}, he looks at the scattered pieces for a moment, then back, sad but steady", "RIGHT"),
     "sad, slow, low")),
 ("c05", 6, talk("c05", "Gumaro", one(f"Close-up of {GUM} {TAL}{OFF}, {GR}, he glances at the gold watch on his left wrist, proud", "LEFT"),
     "proud, mocking")),
 ("c06", 6, talk("c06", "Severiano", one(f"Close-up of {SEV} {TAL}{OFF}, {SC}, suspicious, he pushes his round glasses up his nose", "RIGHT"),
     "suspicious, calm, low")),
 ("c07", 6, talk("c07", "Gumaro", one(f"Close-up of {GUM} {TAL}{OFF}, {GR}, with a sly smile he shows {RING_R}", "LEFT"),
     "sly, quiet, amused")),
 ("i02", 6, f"Close-up insert {TAL0}{OFF}: {RING_SWING}; the little star is hand-engraved on the polished silver. "
            f"Only the fingers and the ring, no faces, no letters. No dialogue."),
 ("c08", 6, talk("c08", "Severiano", one(f"Close-up of {SEV} {TAL}{OFF}, {SC}, he leans forward a little and looks closely at the ring, his eyes narrow behind the round glasses", "RIGHT"),
     "surprised, low, slow")),
 ("c09", 6, talk("c09", "Gumaro", one(f"Close-up of {GUM} {TAL}{OFF}, {GR}, he closes his hand over the ring and smiles, dismissive", "LEFT"),
     "dismissive, quick")),
 ("c10", 6, talk("c10", "Eufrosina", one(f"Close-up of {EUF} {TAL}{OFF}, {EL_}, the slim woman with the red bandana and the black apron is the one who speaks, worried, she speaks low and respectful; no man in the frame", "RIGHT",
     NODOUBLE("woman in a red bandana")), "worried, low, respectful")),
 ("c11", 6, talk("c11", "Gumaro", one(f"Close-up of {GUM} {TAL}{OFF}, {GR}, he turns his head sharply to his side, annoyed", "LEFT"),
     "annoyed, quick, low")),
 ("r1", 6, one(f"Close-up of {EUF} {TAL}{OFF}, {EL_}, in silence, she lowers her eyes, then slips {PHONE_R} out of her apron pocket and holds it low toward the cobblestones as if taking a photo", "RIGHT") + " Slow push-in. No dialogue."),
 ("c12", 6, talk("c12", "Severiano", one(f"Close-up of {SEV} {TAL}{OFF}, {SC}, he turns his eyes to his side and speaks low, decided", "LEFT"),
     "low, decided, quick")),
 ("c13", 6, talk("c13", "Eufrosina", one(f"Close-up of {EUF} {TAL}{OFF}, {EL_}, she nods quickly and speaks very low", "RIGHT"),
     "very low, quick, determined")),
 ("c14", 6, talk("c14", "Gumaro", one(f"Close-up of {GUM} {TAL}{OFF}, {GR}, he laughs once and glances up the hill, arrogant", "LEFT"),
     "amused, arrogant")),
 # 2. El plazo: los faroles del callejón
 ("c15", 6, talk("c15", "Severiano", one(f"Close-up of {SEV} {TAL}{OFF}, {SC}, very calm, a small sad smile, he takes off his round glasses for a second and puts them back", "RIGHT"),
     "very calm, low, sincere")),
 ("c16", 6, talk("c16", "Gumaro", one(f"Close-up of {GUM} {TAL}{OFF}, {GR}, he shrugs, smug, and crosses his arms, glancing at the street lamps", "LEFT"),
     "smug, dismissive")),
 # 3. Montaje paralelo: los faroles y la mina
 ("i03", 6, f"Low-angle shot at blue-hour dusk in a steep cobbled alley of Taxco, Guerrero: the wrought-iron street lamps on the white walls light up one after another with warm yellow light, "
            f"climbing up the alley toward the pink stone twin towers of the Santa Prisca church against a deep blue sky. No people, no letters. No dialogue."),
 ("c17", 6, talk("c17", "Anastasio", one(f"Close-up of {ANA} {MIN}, he looks down at {PHONE_RH}, then lifts it to his ear, his face turns serious and very calm", "LEFT",
     NODOUBLE("man in a straw sombrero")), "serious, calm, low")),
 ("c18", 6, talk("c18", "Anastasio", one(f"Close-up of {ANA} {MIN}, he lowers the phone and turns his head to speak firmly to people off screen", "RIGHT"),
     "firm, quick, decided")),
 ("i04", 6, f"Aerial drone shot at blue-hour dusk over Taxco, Guerrero: a long line of white pickup trucks with no logos drives down a winding hill road into the white town with red tile roofs, "
            f"headlights on, dust behind them, the pink twin towers of Santa Prisca below. No people visible, no letters on the trucks. No dialogue."),
 # 4. Se acaba el tiempo: bajan los de la mina
 ("c19", 6, talk("c19", "Gumaro", one(f"Close-up of {GUM} {TAL}{ON}, {GR}, he looks up at a lit street lamp, then back, smug", "LEFT"),
     "smug, impatient")),
 ("c20", 6, talk("c20", "Eufrosina", one(f"Close-up of {EUF} {TAL}{ON}, {EL_}, she turns her head toward the bottom of the alley, alarmed", "RIGHT"),
     "alarmed, quick, low")),
 ("c21", 6, talk("c21", "Severiano", one(f"Close-up of {SEV} {TAL}{ON}, {SC}, a slow small smile, he looks down the alley", "RIGHT"),
     "calm, quiet, sure")),
 ("r2", 6, one(f"Close-up of {GUM} {TAL}{ON}, {GR}, in silence, his smile fades slowly and he turns his head toward the bottom of the alley", "LEFT") + " Slow push-in. No dialogue."),
 ("i05", 6, f"Wide shot {TAL0}{ON}: a line of white pickup trucks with no logos stops on the cobblestones at the bottom of the alley; men and women in dusty plain work clothes, "
            f"no hats, step down and stand still in a row, arms crossed in front of them; their hands are empty. No dialogue."),
 ("i06", 6, f"Close-up insert {TAL0}{ON}: on the cobblestones among scattered silver jewelry lies {CUFF}; a large weathered man's hand with a tan suede sleeve and one wide silver ring "
            f"engraved with a small star reaches down and gently picks up the bracelet. Only the hand, the sleeve and the jewelry, no faces. No dialogue."),
 ("c22", 6, talk("c22", "Anastasio", one(f"Close-up of {ANA} {TAL}{ON}, {AC}, holding {CUFF} in his hand against his chest, very calm, cold eyes toward the man on his right", "RIGHT",
     NODOUBLE("man in a straw sombrero")), "very calm, quiet, cold")),
 ("c23", 6, talk("c23", "Gumaro", one(f"Close-up of {GUM} {TAL}{ON}, {GR}, his face goes pale, nervous, he tries to smile", "LEFT"),
     "nervous, quick")),
 # 5. Anastasio y Severiano (música cálida c24-c26)
 ("c24", 6, talk("c24", "Anastasio", one(f"Close-up of {ANA} {TAL}{ON}, {AC}, his eyes soft and warm, he looks toward the old silversmith on his left", "LEFT"),
     "warm, sincere, low")),
 ("c25", 6, talk("c25", "Severiano", one(f"Close-up of {SEV} {TAL}{ON}, {SC}, moved, his eyes shine behind the round glasses, he stands straight", "RIGHT"),
     "moved, quiet, proud")),
 ("c26", 6, talk("c26", "Anastasio", one(f"Close-up of {ANA} {TAL}{ON}, {AC}, he looks for a moment at the silver ring on his right hand, then nods slowly with a small warm smile", "LEFT"),
     "warm, tender, low")),
 # 6. Inversión: el plazo cambia de lado (el castigo queda para la Parte 2)
 ("c27", 6, talk("c27", "Anastasio", one(f"Close-up of {ANA} {TAL}{ON}, {AC}, he turns his eyes slowly to the right, firm now, he tips his chin toward the lit lamps", "RIGHT"),
     "firm, slow, low")),
 ("c28", 6, talk("c28", "Anastasio", one(f"Close-up of {ANA} {TAL}{ON}, {AC}, still and calm, he does not blink", "RIGHT"),
     "calm, final, slow")),
 ("c29", 6, talk("c29", "Gumaro", one(f"Close-up of {GUM} {TAL}{ON}, {GR}, his hands open and low, he tries to sound sure", "LEFT"),
     "defensive, quick")),
 ("c30", 6, talk("c30", "Anastasio", one(f"Close-up of {ANA} {TAL}{ON}, {AC}, he lifts his chin a little, serious", "RIGHT"),
     "serious, quiet, slow")),
 ("c31", 6, talk("c31", "Gumaro", one(f"Close-up of {GUM} {TAL}{ON}, {GR}, nervous, he shows {RING_R} and glances up over his shoulder at the wooden balcony behind him", "LEFT"),
     "nervous, low, quick")),
 # 7. El balcón: gancho a la Parte 2
 ("r3", 6, one(f"Close-up of {ANA} {TAL}{ON}, {AC}, in silence, he looks at the ring, then slowly up at a balcony across the alley, his calm face slowly turns serious", "RIGHT") + " Slow push-in. No dialogue."),
 ("i07", 6, f"Close-up insert at blue-hour dusk in a cobbled alley of Taxco: the wooden shutters of a balcony on a white house start to close slowly; a woman's slim hand with red nail polish "
            f"pulls one shutter from inside, warm lamplight behind it. Only the shutters and the hand, no face. No dialogue."),
 ("r4", 6, one(f"Medium close-up of {LEO} standing alone on a wooden balcony of a white house in a cobbled alley of Taxco at blue-hour dusk, half behind an open wooden shutter, "
               f"warm lamplight behind her, already standing still from the first frame, in silence, she lowers her eyes and steps back a little, ashamed", "LEFT") + " Slow push-in. No dialogue."),
 ("c32", 6, talk("c32", "Severiano", one(f"Close-up of {SEV} {TAL}{ON}, {SC}, he looks up at the balcony, then lowers his eyes, sad", "RIGHT"),
     "sad, very low")),
 ("c33", 6, talk("c33", "Anastasio", one(f"Close-up of {ANA} {TAL}{ON}, {AC}, very still, his eyes up on the balcony, then his face slowly breaks, hurt", "RIGHT"),
     "shocked, hurt, very low")),
 # CTA con carisma (después del BLACK): Severiano solo en la puerta de su taller, a cámara
 ("c34", 10, talk("c34", "Severiano", f"Close-up from the chest up of {SEV} {TAL}{ON}, alone, standing in the open doorway of his silversmith workshop, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a mischievous little smile, makes a short pause, raises one eyebrow, "
     f"pushes his round glasses up his nose, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful and mischievous, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly")
        ]
# Frases primero: si no, "hurt"/"nervous" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Tú no te metas, muchacha.", "Tú no opines, muchacha."), ("Ni el viejo de la mina lo salva.", "Ni el de la mina lo ayuda."),
        ("Pues recójalas del suelo, viejo.", "Pues recójalas, maestro."), ("¿Quién tiró el trabajo del maestro?", "¿Quién dejó así el trabajo del maestro?"),
        ("Severiano, ¿te lastimaron?", "Severiano, ¿estás bien?"), ("Nomás me tiraron las piezas.", "Nomás se cayeron las piezas."),
        ("Antes que amanezca, te vas de Taxco.", "Mañana temprano, te vas de Taxco."), ("Ya se te prendieron a ti.", "Ahora el plazo es tuyo."),
        ("his face goes pale", "his face turns serious"), ("then his face slowly breaks, hurt", "his face turns serious"),
        ("sweeps a black velvet tray", "moves a black velvet tray"), ("the silver pieces fall and scatter on the cobblestones", "the silver pieces lie on the cobblestones"),
        ("he turns his head sharply", "he turns his head"), (" as if taking a photo", ""),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("hard", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("mischievous", "friendly"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, blue-hour dusk light in a steep cobbled alley of Taxco, Guerrero, white houses and red tile roofs, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a colonial silver town in the mountains of Guerrero at dusk, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft evening light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEVERIANO_OCAMPO}", "a thin bald older Mexican man with round wire glasses in a brown leather work apron"), ("@{GUMARO_LIZARDI}", "a short stocky Mexican man with slicked-back black hair and a pencil mustache in a wine-red shirt"),
         ("@{EUFROSINA_BAHENA2}", "a slim Mexican woman with a red bandana in a black work apron"), ("@{ANASTASIO_BERMEJO2}", "a tall older Mexican man with a white mustache, a white straw sombrero and a tan suede jacket"),
         ("@{LEOCADIA_BERMEJO2}", "a slim Mexican woman with long black hair in an emerald-green dress"),
         (" @{LOC_TALLERPLATA}", ""), (" @{LOC_MINA2}", "")]
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

"""Genera los clips de baul-sanmiguel-p2 PARTE 2 (El Baúl de San Miguel, continuación de pieces/baul-sanmiguel, San Miguel de Allende, Guanajuato, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de aserrin-huamantla-p2 (todas sus defensas: gatito en imagen, reload_flow, new_project, control de descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS en gen()).
Mismas hojas que la Parte 1 (copiadas a chars/, se resuben con make_sheets.py --reupload) + ANSELMO_VILLAGOMEZ (el notario). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
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
# Gancho 0-2 s: recordatorio de la P1 (i01 <= 0.9 s: las manos abren el broche del baúl, papeles con cordón rojo y llavero de latón) y Hilario, que oyó todo: "La cortadora no se vende, mijo. Ya oí todo."
# Ritmo emocional de la P2 de Atrium (7706270980758441247, 390K): el padre oye el sacrificio del hijo pobre -> pide llamar al hijo rico una vez más -> reunión en la casa humilde ("¿durmieron en el piso?")
# -> la nuera lo trata de carga ("una boca más") -> "estoy aquí" -> el hijo rico propone un asilo -> el hijo pobre recuerda lo que hizo por él -> "si tanto lo quieren, quédense con él" -> "me recibieron, no me recogieron".
# Detalles propios (más allá de Atrium): Hilario abre el baúl de día, llega el notario Villagómez a las nueve: la casona de Raymundo siempre fue de Hilario. Castigo: "Sus cosas afuera antes de las ocho.
# Esa casa no es pensión." (el gancho de la P1 al revés). Reconocimiento: Ciriaco firma; la casona y la cantera del abuelo son suyas; el llavero de latón pasa a su mano empolvada; la cortadora se queda.
# Geografía: 1) noche en la casita (c01-c07, misma que el final de la P1): Ciriaco y Felícitas en la cocinita; Hilario en la puerta del cuarto, con la cortina floreada abierta.
#   2) mañana en el patio de la casita (desde c08): Hilario SENTADO al CENTRO en la mesa de madera, el baúl a sus pies (en la mesa desde i03); Ciriaco y Felícitas a la IZQUIERDA junto a la puerta de la casa;
#   Raymundo y Mirna a la DERECHA, recién entrados por la puerta angosta del patio; el notario a la DERECHA junto a la mesa.
# Misma ropa que la P1. Hilario lleva su sombrero de fieltro gris en TODOS los planos (también de noche). Presentación del personaje nuevo: el notario en c26 (plano medio, ropa completa). Sin Navidad.
NOCHE = ("inside the same small humble house of rough cantera stone @{LOC_CUARTOCANTERA} at night: a tiny kitchen with a two-burner stove and clay pots, one bare light bulb, "
         "a curtain of flowered cloth as a door to the only bedroom; no readable text; nobody else in the background, nobody besides the person described")
DIA0 = ("in the tiny patio of the same small humble house of rough cantera stone in San Miguel de Allende, Guanajuato @{LOC_CUARTOCANTERA} in soft early-morning light: a tin roof, "
        "the narrow open wooden door of the house on the LEFT, half-carved pink cantera stone pieces and stone dust on the ground, a plain wooden table with a plastic tablecloth in the CENTER, "
        "a narrow wooden patio gate on the RIGHT; no readable text, no signs, no logos")
DIA = DIA0 + "; nobody else in the background, no extras, nobody besides the person described"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Hilario sombrero de fieltro gris, bigote blanco y bastón; solo Raymundo saco azul marino y lentes sin armazón; solo Mirna melena rubia platinada y traje blanco;
# solo Ciriaco polvo de cantera y playera azul marino; solo Felícitas trenza y rebozo rojo; solo el notario calvo con lentes redondos de carey y traje gris oxford con corbata vino.
HIL = ("@{HILARIO_PENALOZA} (77-year-old Mexican man, brown weathered skin, thin and a little stooped, white wavy hair, a thick white mustache, a grey felt hat with a black band "
       "that he keeps on his head in every shot, also at night and indoors, a brown corduroy jacket over a cream guayabera shirt, grey trousers, a mesquite wood walking cane always in his LEFT hand)")
RAY = ("@{RAYMUNDO_PENALOZA} (51-year-old Mexican man, light-brown skin, tall, black hair combed back with grey streaks, a short grey goatee, thin rimless glasses, no hat, "
       "a navy-blue blazer over a white shirt with no tie, grey trousers, his hands kept low)")
MIR = ("@{MIRNA_OLGUIN} (46-year-old Mexican woman, light skin, slim, a straight platinum-blonde chin-length bob, pearl stud earrings, a white linen pantsuit, nude heels, "
       "her arms crossed, she never points a finger at anyone)")
CIR = ("@{CIRIACO_PENALOZA} (42-year-old Mexican man, brown skin, stocky, short black hair, thick eyebrows, a short black beard, a dusty navy-blue t-shirt, pale pink stone dust on his forearms "
       "and hands, dusty jeans, no hat, no glasses, his hands kept low)")
FEL = ("@{FELICITAS_CANCHOLA} (40-year-old Mexican woman, brown skin, medium build, long black hair in a thick braid, small silver earrings, a white blouse embroidered with red flowers, "
       "a red rebozo over her shoulders, a dark skirt, her hands kept low)")
NOT = ("@{ANSELMO_VILLAGOMEZ} (63-year-old Mexican man, a notary, light-brown skin, round face, bald on top with short grey hair at the sides, clean-shaven, round tortoiseshell glasses, "
       "a charcoal-grey suit with a white shirt and a burgundy tie, black polished shoes, a brown leather briefcase in his LEFT hand)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
TRUNK = "a small old green tin trunk painted with red flowers and a brass latch"
PAPERS = "a thick bundle of old folded papers tied with red string"
KEYS = "a ring of old brass keys"
CASE = "a brown leather briefcase"
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

HN = "standing in the doorway of the tiny bedroom at night, holding the flowered cloth curtain open with his RIGHT hand, one bare light bulb"   # Hilario de noche
KF = "standing in the tiny kitchen at night, beside the two-burner stove"                                                                     # Ciriaco / Felícitas de noche
HT = f"sitting on a wooden chair at the plain wooden table in the CENTER of the tiny patio, {TRUNK} on the ground at his feet"                 # Hilario (c08-c24)
HO = f"sitting on a wooden chair at the plain wooden table in the CENTER of the tiny patio, {TRUNK} open on the table in front of him"          # Hilario (desde i03)
CD = "standing on the LEFT beside the narrow open wooden door of the stone house"                                                             # Ciriaco
FD = "standing on the LEFT next to the rough stone wall of the house, near the narrow open wooden door"                                       # Felícitas
RG = "standing on the RIGHT just inside the narrow wooden patio gate, among half-carved pink cantera stone pieces"                             # Raymundo
MG = "standing on the RIGHT just inside the narrow wooden patio gate, her nude heels in the pale stone dust"                                   # Mirna
NG = f"standing on the RIGHT beside the plain wooden table, the narrow wooden patio gate behind him"                                          # Notario

CLIPS = [
 # 1. Gancho (0-2 s): recordatorio de la P1 (el baúl abierto de noche) y Hilario, que oyó todo
 ("i01", 6, f"Close-up insert at night: two old hands open the brass latch of {TRUNK} on the floor of a tiny bedroom; inside lies {PAPERS} and {KEYS}, one bare light bulb above. "
            f"Only the hands, the trunk, the papers and the keys, no faces, no readable letters. No dialogue."),
 ("c01", 6, talk("c01", "Hilario", one(f"Close-up of {HIL} {NOCHE}, {HN}, his eyes shine, calm and firm, wearing his grey felt hat", "LEFT",
     NODOUBLE("old man in a felt hat")), "calm, firm, low, moved")),
 # 2. La noche: el sacrificio y la llamada al hermano (como el arranque de la P2 de Atrium)
 ("c02", 6, talk("c02", "Ciriaco", one(f"Close-up of {CIR} {NOCHE}, {KF}, surprised, then gentle, he turns toward the curtain", "RIGHT",
     NODOUBLE("man in a navy-blue t-shirt")), "surprised, gentle, whispering")),
 ("c03", 6, talk("c03", "Hilario", one(f"Close-up of {HIL} {NOCHE}, {HN}, he shakes his head slowly, his voice breaks a little", "LEFT"),
     "sad, tender, low")),
 ("c04", 6, talk("c04", "Felícitas", one(f"Close-up of {FEL} {NOCHE}, {KF}, she pulls her red rebozo over her shoulders, kind, a little ashamed", "RIGHT",
     NODOUBLE("woman in a red rebozo")), "kind, soft, whispering")),
 ("c05", 6, talk("c05", "Hilario", one(f"Close-up of {HIL} {NOCHE}, {HN}, decided, his eyes on his son", "LEFT"),
     "firm, calm")),
 ("c06", 6, talk("c06", "Ciriaco", one(f"Close-up of {CIR} {NOCHE}, {KF}, hurt for his father, he shakes his head", "RIGHT"),
     "hurt, low, sincere")),
 ("c07", 6, talk("c07", "Hilario", one(f"Close-up of {HIL} {NOCHE}, {HN}, a tired small smile, then serious", "LEFT"),
     "calm, sad, firm")),
 # 3. La mañana: llegan Raymundo y Mirna a la casita
 ("i02", 6, f"Low close-up insert {DIA0}: a woman's feet in nude high heels and white linen trousers step through the narrow wooden gate onto the pale stone dust, between half-carved pink stone pieces, "
            f"and stop. Only the shoes, the trouser hems and the stones, no faces. No dialogue."),
 ("c08", 6, talk("c08", "Mirna", one(f"Close-up of {MIR} {DIA}, {MG}, she looks around the poor patio with fake pity, a cold little smile", "LEFT",
     NODOUBLE("woman in white")), "fake sweet, mocking")),
 ("c09", 6, talk("c09", "Felícitas", one(f"Close-up of {FEL} {DIA}, {FD}, dignified, chin up, calm", "RIGHT"),
     "calm, dignified")),
 ("c10", 6, talk("c10", "Raymundo", one(f"Close-up of {RAY} {DIA}, {RG}, impatient, he glances at his wristwatch", "LEFT",
     NODOUBLE("man in a navy-blue blazer")), "impatient, cold")),
 ("c11", 6, talk("c11", "Hilario", one(f"Close-up of {HIL} {DIA}, {HT}, wearing his grey felt hat, he tips his head toward the house, sad and firm", "RIGHT"),
     "sad, firm, low")),
 # 4. La humillación: carga, asilo, arrimado (la reunión de la P2 de Atrium)
 ("c12", 6, talk("c12", "Mirna", one(f"Close-up of {MIR} {DIA}, {MG}, arms crossed, she shrugs, cold", "LEFT"),
     "cold, dismissive")),
 ("c13", 6, talk("c13", "Hilario", one(f"Close-up of {HIL} {DIA}, {HT}, wearing his grey felt hat, he lifts his eyes, hurt but calm", "RIGHT"),
     "hurt, calm, firm")),
 ("c14", 6, talk("c14", "Raymundo", one(f"Close-up of {RAY} {DIA}, {RG}, he pushes up his rimless glasses, falsely reasonable", "LEFT"),
     "falsely reasonable, cool")),
 ("c15", 6, talk("c15", "Hilario", one(f"Close-up of {HIL} {DIA}, {HT}, wearing his grey felt hat, his eyes fill with tears, disbelief", "RIGHT"),
     "disbelieving, broken, low")),
 ("c16", 6, talk("c16", "Mirna", one(f"Close-up of {MIR} {DIA}, {MG}, she tilts her head, condescending", "LEFT"),
     "condescending, cold")),
 ("c17", 6, talk("c17", "Ciriaco", one(f"Close-up of {CIR} {DIA}, {CD}, he steps up, firm, protective", "RIGHT"),
     "firm, protective")),
 ("c18", 6, talk("c18", "Mirna", one(f"Close-up of {MIR} {DIA}, {MG}, a short mocking laugh, cutting", "LEFT"),
     "mocking, cutting")),
 ("c19", 6, talk("c19", "Ciriaco", one(f"Close-up of {CIR} {DIA}, {CD}, he looks at his dusty hands, then at his brother, hurt", "RIGHT"),
     "hurt, firm, slow")),
 ("c20", 6, talk("c20", "Raymundo", one(f"Close-up of {RAY} {DIA}, {RG}, defensive, offended", "LEFT"),
     "defensive, offended")),
 ("c21", 6, talk("c21", "Ciriaco", one(f"Close-up of {CIR} {DIA}, {CD}, his voice breaks a little, sincere", "RIGHT"),
     "sincere, hurt, low")),
 ("c22", 6, talk("c22", "Raymundo", one(f"Close-up of {RAY} {DIA}, {RG}, he buttons his navy-blue blazer, cold, ready to leave", "LEFT"),
     "cold, dry")),
 ("c23", 6, talk("c23", "Hilario", one(f"Close-up of {HIL} {DIA}, {HT}, wearing his grey felt hat, very calm, he looks at his son without blinking", "RIGHT"),
     "very calm, slow, dignified")),
 ("r1", 6, one(f"Close-up of {RAY} {DIA}, {RG}, in silence, he looks away and adjusts his rimless glasses, uncomfortable", "LEFT") + " Slow push-in. No dialogue."),
 # 5. El giro: Hilario abre el baúl y llega el notario a las nueve
 ("c24", 6, talk("c24", "Hilario", one(f"Close-up of {HIL} {DIA}, {HT}, wearing his grey felt hat, he turns to his daughter-in-law on his left, serene, a new firmness in his eyes", "LEFT"),
     "serene, firm")),
 ("i03", 6, f"Close-up insert {DIA0}: two old hands open the brass latch of {TRUNK} standing on the plain wooden table with a plastic tablecloth; inside lies {PAPERS} and {KEYS}. "
            f"Only the hands, the trunk, the papers and the keys, no faces, no readable letters. No dialogue."),
 ("c25", 6, talk("c25", "Mirna", one(f"Close-up of {MIR} {DIA}, {MG}, she raises one eyebrow at the trunk, mocking", "LEFT"),
     "mocking, fake sweet")),
 ("i04", 6, f"Low close-up insert {DIA0}: a man's black polished shoes and grey suit trousers step through the narrow wooden gate onto the pale stone dust, {CASE} swinging at his side. "
            f"Only the shoes, the trousers and the briefcase, no faces. No dialogue."),
 ("c26", 6, talk("c26", "the notary", f"Medium shot of {NOT} {DIA}, {NG}, polite and serious, a small nod toward the old man at the table, "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey suit')}.", "polite, formal, calm")),
 ("c27", 6, talk("c27", "Raymundo", one(f"Close-up of {RAY} {DIA}, {RG}, he recognizes him, shocked, his face goes pale", "LEFT"),
     "shocked, nervous")),
 ("c28", 6, talk("c28", "the notary", one(f"Close-up of {NOT} {DIA}, {NG}, he takes one old paper from the bundle, formal, calm", "LEFT"),
     "formal, calm, clear")),
 ("r2", 6, one(f"Close-up of {MIR} {DIA}, {MG}, in silence, her arms drop from her chest, shocked, her mouth half open", "LEFT") + " Slow push-in. No dialogue."),
 ("c29", 6, talk("c29", "Mirna", one(f"Close-up of {MIR} {DIA}, {MG}, shocked, almost laughing from nerves", "LEFT"),
     "shocked, nervous, quick")),
 # 6. El castigo: el gancho de la P1 al revés
 ("c30", 6, talk("c30", "Hilario", one(f"Close-up of {HIL} {DIA}, {HO}, wearing his grey felt hat, he rests his RIGHT hand on the open trunk, calm", "RIGHT"),
     "calm, slow, firm")),
 ("c31", 6, talk("c31", "Hilario", one(f"Close-up of {HIL} {DIA}, {HO}, wearing his grey felt hat, he looks straight at his daughter-in-law, final", "RIGHT"),
     "firm, final, low")),
 ("c32", 6, talk("c32", "Raymundo", one(f"Close-up of {RAY} {DIA}, {RG}, his eyes shine, almost pleading, he takes one step forward", "LEFT"),
     "pleading, broken")),
 ("c33", 6, talk("c33", "Hilario", one(f"Close-up of {HIL} {DIA}, {HO}, wearing his grey felt hat, sad, he shakes his head slowly", "RIGHT"),
     "sad, calm, firm")),
 ("c34", 6, talk("c34", "Mirna", one(f"Close-up of {MIR} {DIA}, {MG}, she turns toward the gate, cold and resentful", "LEFT"),
     "cold, resentful")),
 ("r3", 6, one(f"Medium close-up of {RAY} {DIA0}, standing alone in the narrow wooden patio gate on the RIGHT, in silence he looks back over his shoulder with shining eyes, then looks down and goes", "LEFT")
     + " Slow push-in. No dialogue."),
 # 7. El reconocimiento: el hijo cantero
 ("c35", 6, talk("c35", "the notary", one(f"Close-up of {NOT} {DIA}, {NG}, he holds out one old paper and a fountain pen, kind", "LEFT"),
     "kind, formal")),
 ("c36", 6, talk("c36", "Ciriaco", one(f"Close-up of {CIR} {DIA}, {CD}, confused, he wipes his dusty hands on his jeans", "RIGHT"),
     "confused, humble, quiet")),
 ("c37", 6, talk("c37", "Hilario", one(f"Close-up of {HIL} {DIA}, {HO}, wearing his grey felt hat, he turns to his son on his left with a warm proud smile, his eyes shine", "LEFT"),
     "warm, proud, moved")),
 ("i05", 6, f"Close-up insert {DIA0}: an old hand places {KEYS} into a big open hand covered in pale pink stone dust, the fingers close slowly around the keys. "
            f"Only the two hands and the keys, no faces. No dialogue."),
 ("c38", 6, talk("c38", "Felícitas", one(f"Close-up of {FEL} {DIA}, {FD}, her eyes shine but she is not crying, a hand on her chest over the red rebozo", "RIGHT"),
     "moved, soft, steady and clear, no sobbing, every word said slowly and completely")),
 ("c39", 6, talk("c39", "Ciriaco", one(f"Close-up of {CIR} {DIA}, {CD}, holding the brass keys against his chest, moved, a big shy smile", "RIGHT"),
     "moved, warm")),
 ("c40", 6, talk("c40", "Hilario", one(f"Close-up of {HIL} {DIA}, {HO}, wearing his grey felt hat AND his brown corduroy jacket over the cream shirt exactly as in his reference sheet, calm and moved, he nods to his son on his left", "LEFT"),
     "calm, moved, slow")),
 # CTA con carisma (después del BLACK): Hilario solo en el patio, a cámara
 ("c41", 10, talk("c41", "Hilario", f"Close-up from the chest up of {HIL} {DIA}, alone, standing in the tiny patio beside his open trunk, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a knowing little smile, makes a short pause, touches the brim of his grey felt hat, "
     f"raises one eyebrow, tilts his head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful and mischievous, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("eyes wet", "eyes shine")
        ]
# Frases primero: si no, "hurt"/"cold" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Una boca más es mucha carga.", "Ya están muy apretados aquí."), ("No puede vivir de arrimado.", "No puede vivir en casa ajena."),
        ("Mi apá no es ningún arrimado.", "Mi apá no estorba aquí."), ("¿Aquí? Si a ustedes los están corriendo.", "¿Aquí? Si ustedes ya se tienen que ir."),
        ("¿Me quieres meter en un asilo?", "¿Me quieres mandar a una casa de reposo?"), ("Y hoy se la quito.", "Y hoy la recupero."),
        ("Esa casa no es pensión.", "Esa casa ya no es suya."), ("Esto no se va a quedar así.", "Esto no termina aquí."),
        ("his voice breaks a little", "his voice gets softer"), ("almost pleading", "sincere"), ("his face goes pale", "his face changes"),
        ("a short mocking laugh, cutting", "a short laugh"), ("cold and resentful", "serious"), ("ready to leave", "serious"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"), ("sarcastic", "dry"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("broken", "sad"), ("impatient", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("cutting", "serious"),
        ("resentful", "serious"), ("falsely reasonable", "calm"), ("fake pity", "a polite look"), ("fake sweet", "polite"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("mischievous", "friendly"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft morning light at a humble cantera stone house in San Miguel de Allende, Guanajuato, stone dust and a tin roof, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a humble house in a colonial town of Guanajuato, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{HILARIO_PENALOZA}", "a thin old Mexican man with a white mustache, a grey felt hat and a brown corduroy jacket"),
         ("@{RAYMUNDO_PENALOZA}", "a tall Mexican man with a grey goatee and rimless glasses in a navy-blue blazer"),
         ("@{MIRNA_OLGUIN}", "a slim Mexican woman with a platinum-blonde bob in a white linen pantsuit"),
         ("@{CIRIACO_PENALOZA}", "a stocky Mexican man with a short black beard in a dusty navy-blue t-shirt"),
         ("@{FELICITAS_CANCHOLA}", "a Mexican woman with a long black braid and a red rebozo"),
         ("@{ANSELMO_VILLAGOMEZ}", "a bald Mexican man in his sixties with round tortoiseshell glasses in a charcoal-grey suit and a burgundy tie"),
         (" @{LOC_CUARTOCANTERA}", "")]
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
    print("FIN P2", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()

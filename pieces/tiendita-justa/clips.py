"""Genera los clips de tiendita-justa PARTE 1 (La Tiendita del Precio Justo, video 25, remake de la ref 7698839837180169504 de @solreflection, MEXI) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / buen-hijo-p2 c27 / mecanico c25 / regreso-20 c25: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA nochebuena c18 / regreso-20 c25 / sazon-concha c16: letras en la franja inferior -> CLEAN después de NOSUB
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA agua-hacienda-p2 c13 / chocolate-rancho-p2 c34 / regreso-20 c28 / mecanico c21: frase o palabra repetida al final -> silencio tras la última palabra
# QA regreso-20 c14/c22: se perdía la 2ª frase -> el diálogo va completo y cada clip tiene margen (8 s para dos frases)
END = "After the last word the person stays silent until the end of the shot."
# QA camionero c04/c05/c16/c25/c30 / posada c07-c23 / regreso-20 c06/c21/c27: espaldas, dobles y gente en el borde -> TODOS los planos son de una sola persona
# (ONE + ALONE) con la mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder (QA padre-veladoras-p2, canasta c12).
# QA regreso-20 c26: personaje que entra a cuadro -> "already in place from the very first frame" (va en ALONE).
# Geografía fija (solo define hacia dónde mira cada uno):
#   Tienda de Evaristo (c01-c06, r1, c24, c25): Evaristo a la IZQUIERDA tras el mostrador; Cipriano a la DERECHA en la puerta enrollable.
#   Tiendita de Chuy (c07-c16, c28, c29, c35-c41, r2): Chuy a la IZQUIERDA tras el mostrador; Aurelio, Toña y el inspector a la DERECHA, del lado de los clientes.
#   Patio de la bodega (c17-c19): Chuy a la IZQUIERDA; Fidel a la DERECHA junto a su camioneta roja.
#   Cabina de la camioneta (c20-c23): Chuy maneja a la IZQUIERDA; Aurelio de copiloto a la DERECHA.
#   Calle de la tiendita (c26, c27, c30, c31, r3): Chuy en la puerta de su tiendita (IZQ.), Aurelio junto a la camioneta roja (DER.); Evaristo solo detrás de la cerca de alambre.
#   Ventanilla municipal (c32-c34): Marisol a la IZQUIERDA tras el vidrio; Evaristo a la DERECHA, de pie. CTA (c42): Chuy solo tras su mostrador, a cámara.
# Hojas de locación SIMPLES (lección intercambio c07/c23/c25/c32: Omni copia cada detalle de la hoja en todos los planos): nada religioso, sin adornos, sin letreros, sin precios.
# Política: sin dinero en cuadro (ni billetes, ni sobres, ni precios, ni cifras); el "precio justo" solo se dice. Chuy anota en una libreta cerrada (la ref mostraba billetes).
# El inspector es un funcionario civil (traje, sin gafete, sin escudos ni sellos), como pide resumen.md.
NOTEXT = "no readable text, no signs, no price tags, no numbers, no brand logos, no money or banknotes anywhere"
TEV = ("inside the old rural grocery store @{LOC_TIENDAEVARISTO}, a worn dark wooden counter, one old metal scale, a few half-empty wooden shelves with plain unbranded packages, "
       f"a wide open roll-up door to a dirt road, grey cloudy daylight; {NOTEXT}; no extras, nobody else in the store besides the person described")
TCH = ("inside the small humble village grocery shop @{LOC_TIENDITACHUY}, simple light pine shelves with plain unbranded bags of rice, plain bottles of oil and plain white milk cartons, "
       f"a plain pine counter, warm daylight from the open door; {NOTEXT}; no extras, no shoppers, nobody else in the shop besides the person described")
TCHV = (TCH.replace("simple light pine shelves with plain unbranded bags of rice, plain bottles of oil and plain white milk cartons",
                    "simple light pine shelves almost empty, only a few plain packages left").replace("warm daylight", "warm late-afternoon light"))
TCHN = TCH.replace("simple light pine shelves", "new fully stocked light pine shelves")
BOD = ("in the loading yard @{LOC_BODEGAFLETE} of a wholesale warehouse, plain brown cardboard boxes stacked on wooden pallets, a concrete floor, cool daylight; "
       f"{NOTEXT}, no printing on the boxes; no extras, no workers, nobody else in the yard besides the person described")
TRUCK = "next to one old faded red pickup truck loaded with plain brown cardboard boxes, the only vehicle in the shot, no license plate letters"
CAB = ("inside the cab @{LOC_CABINAFLETE} of an old pickup truck driving slowly on a rural dirt road, green hills through the windows, soft morning daylight; "
       "no readable text; nobody else in the cab besides the person described")
CALLE = ("on the dirt street @{LOC_CERCATIENDITA} of a Mexican village, a small whitewashed shop with a wide open door, a rusty wire fence across the street, soft morning daylight; "
         f"{NOTEXT}")
CERCA = CALLE + "; the shop is far in the background, a few small blurred shoppers waiting far away by its door, out of focus, nobody near the camera"
VEN = ("at the service window @{LOC_VENTANILLAMUNI} of a plain municipal office, a clear glass partition with a small opening, a plain desk, plain pale green walls, fluorescent light; "
       "no readable text, no signs, no posters, no flags, no seals, no logos; no extras, nobody else in the office besides the person described")
# Anclas de identidad y ropa: atuendos de la ref (camiseta + jeans, camisa de trabajo + paliacate, camisa a cuadros + mandil, blusa floreada + morral de red, traje + corbata) con OTROS colores.
# NADIE lleva sombrero, gorra ni lentes (QA reten/medalla/fierro c17/chocolate c30: sombreros dobles o flotando). Manos abiertas, nadie señala con el dedo (QA canasta c18).
# Sin uniformes, sin gafetes ni letras en la ropa (QA canasta c28, camionero c33). El paliacate de Aurelio es LISO (en la ref cambiaba de estampado entre planos).
# QA suegra c09/c27, buen-hijo-p2 c26, tele-nueva c07: ropa o peinado que cambian -> ropa y peinado descritos completos en CADA plano.
CHUY = ("@{CHUY_MEDINA} (30-year-old Mexican man, brown skin, honest friendly face, short black hair, clean-shaven, no hat, no cap, no glasses, "
        "faded wine-red crew-neck t-shirt, black jeans, his hands open)")
AUR = ("@{AURELIO_MEDINA} (62-year-old Mexican man, brown skin, kind weathered face, short grey hair, grey moustache, no hat, no glasses, "
       "light blue long-sleeved work shirt with the sleeves rolled up, one plain mustard-yellow bandana knotted at the neck with no pattern, his hands open)")
EVA = ("@{EVARISTO_LOZANO} (50-year-old Mexican man, light brown skin, round heavy face, thick black moustache, slicked-back black hair with grey temples, no hat, no glasses, "
       "blue-and-white checked shirt, dark green shop apron, his hands kept low, he never points a finger at anyone)")
EVAX = EVA.replace(", dark green shop apron", "")  # en la ventanilla va sin mandil
CIP = ("@{CIPRIANO_ROBLES} (66-year-old Mexican man, brown skin, thin kind face, short white hair, white moustache, no hat, no glasses, "
       "light grey button-up shirt, brown trousers, one full plain white plastic shopping bag in each hand)")
TON = ("@{TONA_ARELLANO} (58-year-old Mexican woman, brown skin, warm round face, long grey hair in one braid over her right shoulder, no hat, no glasses, "
       "lilac blouse with small white flowers, one woven net bag hanging on her LEFT arm)")
FID = ("@{FIDEL_CARMONA} (52-year-old Mexican man, brown skin, friendly face, short black hair with some grey, short stubble, no cap, no hat, no glasses, "
       "khaki work shirt, dark jeans, his hands open)")
MAR = ("@{MARISOL_TREJO} (35-year-old Mexican woman, light brown skin, polite neutral face, dark hair in a neat ponytail, no glasses, "
       "plain burgundy blouse, no badge, no lanyard)")
INS = ("@{LIC_ZAMARRIPA} (48-year-old Mexican man, light skin, serious formal face, short combed dark hair, clean-shaven, no hat, no glasses, "
       "dark brown suit, white shirt, wine-red tie, no badge, no lanyard, no pins, one plain brown clipboard held in his LEFT hand with its paper turned away)")
# QA tele-nueva c19/c22, sazon-concha i1, buen-hijo c29: utilería duplicada o inventada -> cada objeto, uno solo, simple y nombrado; QA mecanico c07: siempre en la MISMA mano.
NOTE = "one small closed spiral notebook in his LEFT hand and one pencil in his RIGHT hand, no money, no banknotes"
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
# QA posada c09/c16 / regreso-20 c06 / camionero c16 / camionetas c28: dobles en el borde -> se nombra lo que NO debe repetirse
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

def far(desc, side, extra=""):
    """Plano de una persona con la fila de clientes lejos y desenfocada al fondo (ref p. 30/35): ONE sin ALONE."""
    return (f"{desc}, {gaze(side)}; {ONE}; already in place from the very first frame, never walking in, no hands or arms entering from the edges"
            f"{'; ' + extra if extra else ''}.")

CLIPS = [
 # 1. Gancho / antagonista (tienda de Evaristo, nublado; golpe en el frame 0): Evaristo habla desde el frame 0 (sin plano abierto)
 ("c01", 8, talk("c01", "Evaristo", one(f"Close-up of {EVA} {TEV}, standing on the LEFT behind his counter, surprised and annoyed, his eyebrows raised", "RIGHT",
     NODOUBLE("man in a checked shirt")), "surprised, annoyed, loud")),
 ("c02", 8, talk("c02", "Cipriano", one(f"Close-up of {CIP} {TEV}, standing on the RIGHT in the open roll-up door, a calm simple smile, he lifts the full bags a little", "LEFT",
     NODOUBLE("man in a grey shirt")), "calm, simple, honest")),
 ("r1", 6, one(f"Close-up of {EVA} {TEV}, standing on the LEFT behind his counter, in silence, his smile disappears, his jaw tightens, he breathes slowly", "RIGHT") + " Slow push-in. No dialogue."),
 ("c03", 6, talk("c03", "Evaristo", one(f"Close-up of {EVA} {TEV}, standing on the LEFT behind his counter, suspicious, he narrows his eyes", "RIGHT"),
     "suspicious, annoyed, low")),
 ("c04", 8, talk("c04", "Cipriano", one(f"Close-up of {CIP} {TEV}, standing on the RIGHT in the open door, he shrugs with a small smile", "LEFT"),
     "calm, simple, a little amused")),
 ("c05", 6, talk("c05", "Evaristo", one(f"Close-up of {EVA} {TEV}, standing on the LEFT behind his counter, upset, his face goes red, his open hands rest flat on the counter", "RIGHT",
     NODOUBLE("man in a checked shirt")), "upset, bitter, firm")),
 # 2. Pérdida del villano: solo en su tienda vacía
 ("c06", 8, talk("c06", "Evaristo", one(f"Close-up of {EVA} {TEV}, standing alone behind his counter in the empty store, bitter and thoughtful, he looks out the open door", "RIGHT"),
     "bitter, thoughtful, low")),
 # 3. Éxito del héroe (entra la cama cálida): tiendita casi vacía al atardecer, Chuy con su libreta (sin billetes)
 ("c07", 8, talk("c07", "Chuy", one(f"Close-up of {CHUY} {TCHV}, standing on the LEFT behind the counter, {NOTE}, a big happy smile", "RIGHT",
     NODOUBLE("man in a wine-red t-shirt") + ", no green clothing at the right edge"), "happy, excited, warm, steady pace, each word said only once, he says 'se vendió' a single time and never repeats it")),
 ("c08", 8, talk("c08", "Aurelio", one(f"Close-up of {AUR} {TCHV}, standing on the RIGHT by the almost empty shelves, he laughs warmly and shakes his head", "LEFT",
     NODOUBLE("man in a light blue shirt")), "warm, happy, surprised")),
 ("c09", 8, talk("c09", "Chuy", one(f"Close-up of {CHUY} {TCHV}, standing on the LEFT behind the counter, {NOTE}, he looks up, decided and happy", "RIGHT"),
     "decided, happy, calm")),
 ("c10", 8, talk("c10", "Aurelio", one(f"Close-up of {AUR} {TCHV}, standing on the RIGHT by the shelves, proud and wise, he nods slowly", "LEFT"),
     "proud, wise, warm")),
 # 4. Prueba social: doña Toña
 ("c11", 6, talk("c11", "Toña", one(f"Close-up of {TON} {TCH}, standing on the RIGHT at the counter, curious and a little worried", "LEFT",
     NODOUBLE("woman in a lilac blouse")), "curious, humble, a little worried")),
 ("c12", 8, talk("c12", "Chuy", one(f"Close-up of {CHUY} {TCH}, standing on the LEFT behind the counter, one plain bag of rice in his RIGHT hand, a kind smile", "RIGHT"),
     "kind, warm, friendly")),
 ("c13", 10, talk("c13", "Toña", one(f"Close-up of {TON} {TCH}, standing on the RIGHT at the counter, moved and happy, her eyes shine, one open hand on her chest", "LEFT",
     NODOUBLE("woman in a lilac blouse")), "moved, grateful, happy")),
 ("c14", 8, talk("c14", "Chuy", one(f"Close-up of {CHUY} {TCH}, standing on the LEFT behind the counter, a warm humble smile", "RIGHT"),
     "warm, humble, kind")),
 # 5. Mecánica del precio / alianza: el flete y la bodega (en la ref, préstamo de billetes; aquí "le adelanto los viajes", sin dinero en cuadro)
 ("c15", 6, talk("c15", "Aurelio", one(f"Close-up of {AUR} {TCH}, standing on the RIGHT by the shelves, one plain broom in his RIGHT hand, practical", "LEFT"),
     "practical, calm, warm")),
 ("c16", 6, talk("c16", "Chuy", one(f"Close-up of {CHUY} {TCHV}, standing on the LEFT behind the counter, {NOTE}, busy and cheerful", "RIGHT"),
     "busy, cheerful, quick")),
 ("c17", 8, talk("c17", "Chuy", one(f"Close-up of {CHUY} {BOD}, standing on the LEFT among the boxes, {NOTE}, thinking, then a satisfied small smile", "RIGHT",
     NODOUBLE("man in a wine-red t-shirt")), "thoughtful, calm, satisfied")),
 ("c18", 8, talk("c18", "Chuy", one(f"Close-up of {CHUY} {BOD}, standing on the LEFT, his hands open, friendly and generous", "RIGHT"),
     "friendly, generous, warm")),
 ("c19", 8, talk("c19", "Fidel", one(f"Close-up of {FID} {BOD}, standing on the RIGHT {TRUCK}, relieved and grateful, one open hand on his chest", "LEFT",
     NODOUBLE("man in a khaki shirt")), "relieved, grateful, warm")),
 # 6. Ilusión de futuro: la cabina de la camioneta
 ("c20", 6, talk("c20", "Aurelio", one(f"Close-up of {AUR} {CAB}, sitting on the RIGHT in the passenger seat, hopeful, a soft smile", "LEFT",
     NODOUBLE("man in a light blue shirt")), "hopeful, warm, soft")),
 ("c21", 6, talk("c21", "Chuy", one(f"Close-up of {CHUY} {CAB}, sitting on the LEFT at the wheel, both hands on the steering wheel, eyes on the road, then a quick glance and a smile", "RIGHT"),
     "confident, cheerful, warm")),
 ("c22", 8, talk("c22", "Chuy", one(f"Close-up of {CHUY} {CAB}, sitting on the LEFT at the wheel, both hands on the steering wheel, a dreamy hopeful look", "RIGHT"),
     "hopeful, dreamy, sincere")),
 ("c23", 6, talk("c23", "Aurelio", one(f"Close-up of {AUR} {CAB}, sitting on the RIGHT in the passenger seat, proud, he nods", "LEFT"),
     "proud, warm, firm")),
 # 7. Escalada de la envidia (vuelve el suspenso): Evaristo en su tienda vacía; la fila en la tiendita
 ("c24", 8, talk("c24", "Evaristo", one(f"Close-up of {EVA} {TEV}, standing alone behind his counter in the empty store, bitter, he wipes the counter slowly with one plain rag", "RIGHT"),
     "bitter, upset, low")),
 ("c25", 6, talk("c25", "Evaristo", one(f"Close-up of {EVA} {TEV}, standing alone behind his counter, suspicious, he looks out the open door", "RIGHT",
     NODOUBLE("man in a checked shirt")), "suspicious, cold, low")),
 ("c26", 8, talk("c26", "Chuy", far(f"Close-up of {CHUY} {CERCA}, standing on the LEFT in front of the open door of his shop, amazed and happy", "RIGHT",
     NODOUBLE("man in a wine-red t-shirt")), "amazed, happy, excited")),
 ("c27", 8, talk("c27", "Aurelio", one(f"Close-up of {AUR} {CALLE}, standing on the RIGHT {TRUCK}, one plain cardboard box held in both hands, surprised and happy", "LEFT",
     NODOUBLE("man in a light blue shirt")), "surprised, happy, practical")),
 ("c28", 6, talk("c28", "Chuy", one(f"Close-up of {CHUY} {TCH}, standing on the LEFT behind the counter, a friendly smile", "RIGHT"),
     "friendly, warm, quick")),
 ("c29", 6, talk("c29", "Toña", one(f"Close-up of {TON} {TCH}, standing on the RIGHT at the counter, cheerful, she lifts her net bag a little", "LEFT"),
     "cheerful, warm, grateful")),
 # 8. Resentimiento: Evaristo tras la cerca de alambre, la fila lejos y desenfocada
 ("c30", 8, talk("c30", "Evaristo", far(f"Close-up of {EVA} {CERCA}, standing alone behind the rusty wire fence, his hands resting on the fence wire, envious", "LEFT",
     NODOUBLE("man in a checked shirt")), "envious, bitter, low")),
 ("c31", 8, talk("c31", "Evaristo", far(f"Close-up of {EVA} {CERCA}, standing alone behind the wire fence, cold and decided, his eyes narrow", "LEFT"),
     "cold, decided, quiet")),
 # 9. Giro / traición: la queja en la ventanilla (empleada civil, sin gafete)
 ("c32", 8, talk("c32", "Evaristo", one(f"Close-up of {EVAX} {VEN}, standing on the RIGHT in front of the glass window, polite and false", "LEFT",
     NODOUBLE("man in a checked shirt")), "polite, false, firm")),
 ("c33", 6, talk("c33", "Marisol", one(f"Close-up of {MAR} {VEN}, sitting on the LEFT behind the glass partition, neutral and polite, one pen in her RIGHT hand", "RIGHT",
     NODOUBLE("woman in a burgundy blouse")), "neutral, polite, professional")),
 ("c34", 6, talk("c34", "Evaristo", one(f"Close-up of {EVAX} {VEN}, standing on the RIGHT in front of the glass, centered in the frame from the very first frame, never walking in from the side, "
     "WITHOUT any apron: only his blue-and-white checked shirt is visible, no green apron, the same outfit as when he arrived at the window, a slow satisfied smile", "LEFT",
     NODOUBLE("man in a checked shirt")),
     "satisfied, sweet, false")),
 # 10. Falsa calma: un mes después, estantes nuevos
 ("c35", 8, talk("c35", "Chuy", one(f"Close-up of {CHUY} {TCHN}, standing on the LEFT behind the counter, proud and happy, he looks around the shop", "RIGHT",
     NODOUBLE("man in a wine-red t-shirt")), "proud, happy, warm")),
 ("c36", 8, talk("c36", "Aurelio", one(f"Close-up of {AUR} {TCHN}, standing on the RIGHT by the full shelves, placing one plain can on a shelf, proud, his eyes shine", "LEFT"),
     "proud, moved, warm")),
 # 11. Cliffhanger: el inspector municipal (civil: traje café, sin gafete)
 ("c37", 6, talk("c37", "The inspector", one(f"Close-up of {INS} {TCHN}, standing on the RIGHT at the counter, formal and serious", "LEFT",
     NODOUBLE("man in a brown suit")), "formal, serious, polite")),
 ("c38", 6, talk("c38", "Chuy", one(f"Close-up of {CHUY} {TCHN}, standing on the LEFT behind the counter, polite, a little surprised", "RIGHT"),
     "polite, surprised, calm")),
 ("c39", 8, talk("c39", "The inspector", one(f"Close-up of {INS} {TCHN}, standing on the RIGHT at the counter, serious and formal, he glances at his clipboard", "LEFT",
     NODOUBLE("man in a brown suit")), "serious, formal, firm")),
 ("c40", 6, talk("c40", "Chuy", one(f"Close-up of {CHUY} {TCHN}, standing on the LEFT behind the counter, centered in the frame from the very first frame, worried, he turns his head to the side", "RIGHT",
     NODOUBLE("man in a wine-red t-shirt")), "worried, quiet, polite, each word said only once, he says 'del cajón' a single time and never repeats it")),
 ("r2", 6, one(f"Close-up of {AUR} {TCHN}, standing on the RIGHT by the shelves, in silence, worried, his smile disappears, he breathes slowly", "LEFT") + " Slow push-in. No dialogue."),
 ("c41", 8, talk("c41", "The inspector", one(f"Close-up of {INS} {TCHN}, standing on the RIGHT at the counter, serious and final", "LEFT",
     NODOUBLE("man in a brown suit")), "serious, firm, final")),
 ("r3", 6, far(f"Close-up of {EVA} {CERCA}, standing alone behind the wire fence across the street, in silence, a slow satisfied smile", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Chuy tras su mostrador, a cámara
 ("c42", 10, talk("c42", "Chuy", f"Medium close-up of {CHUY} {TCHN}, alone behind the counter, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, his lips moving clearly; while he speaks he tilts his head, raises his eyebrows, leans his open hands on the counter, nods and smiles. "
     f"Nobody else in the shop.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("trembling", "small"), ("jaw tightens", "face goes still")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("upset", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("defensive", "serious"), ("commanding", "firm"),
        ("ashamed", "humble"), ("humiliated", "quiet"), ("stammering", "quiet"), ("stammers", "pauses"), ("forced", "small"), ("shocked", "surprised"), ("in shock", "in surprise"),
        ("desperate", "worried"), ("pleading", "soft"), ("rude", "proud"), ("goes pale", "goes still"), ("goes red", "goes still"), ("envious", "thoughtful"),
        ("false", "calm"), ("suspicious", "thoughtful"), ("narrows his eyes", "looks carefully"), ("his eyes narrow", "he looks carefully"),
        ("eyes wide", "eyes open"), ("condescending", "polite"), ("dismissive", "calm"),
        ("swallows", "breathes"), ("hurt", "sad"), ("money", "goods"), ("banknotes", "receipts"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("disappointed", "serious"), ("cold", "serious"), ("bitter", "serious"),
        ("arrogant", "proud"), ("indignant", "serious"), ("uneasy", "quiet"), ("municipal office", "office"), ("The inspector", "The man in the suit"),
        ("¡", ""), ("!", "."), ("me las va a pagar", "me va a oír"), ("Le voy a dar su escarmiento a ese Chuy", "Ese Chuy va a ver quién soy yo"),
        ("lo vamos a tener que clausurar hoy mismo", "lo vamos a tener que cerrar hoy mismo")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a humble grocery shop in a Mexican village, soft natural light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican village drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{CHUY_MEDINA}", "a Mexican shopkeeper"), ("@{AURELIO_MEDINA}", "a humble Mexican man"), ("@{EVARISTO_LOZANO}", "a Mexican shopkeeper"),
         ("@{CIPRIANO_ROBLES}", "a humble Mexican man"), ("@{TONA_ARELLANO}", "a humble Mexican woman"), ("@{FIDEL_CARMONA}", "a Mexican driver"),
         ("@{MARISOL_TREJO}", "an office clerk"), ("@{LIC_ZAMARRIPA}", "a Mexican man in a suit"),
         (" @{LOC_TIENDAEVARISTO}", ""), (" @{LOC_TIENDITACHUY}", ""), (" @{LOC_BODEGAFLETE}", ""), (" @{LOC_CABINAFLETE}", ""),
         (" @{LOC_CERCATIENDITA}", ""), (" @{LOC_VENTANILLAMUNI}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (END, NOSUB y CLEAN quedan, van después del diálogo)
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:  # entorno explícito y tope de 10 min por llamada (flow.js ya corta a los 90 s por video)
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
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
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()

"""Genera los clips de obsidiana-teotihuacan PARTE 1 (La Obsidiana de Teotihuacán, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado, sin niños (humillación + plazo -> la llamada que el villano no cree -> llega la figura de poder -> plazo invertido -> giro familiar): frente a las pirámides de Teotihuacán,
Brandon (33) quiere el taller del tallador don Lauro (70) para una tienda de recuerdos, le rompe una máscara de obsidiana encargada por el museo y le da plazo "antes del equinoccio"; su hija
Paloma (29) lo defiende. Lauro llama a la doctora Ibarra (52), directora del museo: plazo invertido y permiso cancelado. Giro: la doctora es hija de la madre de Paloma, su media hermana.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (taller abierto): Lauro y Paloma a la IZQUIERDA (repisas y banco de tallado); Brandon y la doctora a la DERECHA (del lado del patio).
YARD0 = ("in a small open-front obsidian carving workshop near the Pyramid of the Sun in Teotihuacán, State of Mexico @{LOC_TALLEROBSIDIANA} in the afternoon: wooden shelves with shiny black obsidian masks and figures, "
         "a carving bench with a grinding wheel, a dusty yard with nopal cacti, the great stone pyramid in the distance, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
MASK = "a polished black obsidian mask"
PHONE = "an old small flip phone"
LAU = ("@{LAURO_ZEMPOALTECA} (70-year-old Mexican man, thin, brown wrinkled skin, short grey hair, a grey mustache, round glasses on a cord, a beige work shirt, a dark canvas apron with stone dust)")
PAL = ("@{PALOMA_ZEMPOALTECA} (29-year-old Mexican woman, brown skin, long straight loose black hair, a white blouse under a dark-red cardigan)")
BRA = ("@{BRANDON_VILLASENOR} (33-year-old Mexican man, light skin, short bleached-blond hair, light stubble, a tight black polo shirt, a gold watch, white trousers)")
IBA = ("@{DRA_IBARRA} (52-year-old elegant Mexican woman, brown skin, black hair in a neat low bun, black-rimmed glasses, a navy-blue tailored blazer over a white blouse, a silver necklace)")
#@INCLUDE funcs1
# Bordes: Brandon o la doctora le hablan a Lauro/Paloma -> espalda LEFT; Lauro o Paloma les hablan -> espalda RIGHT.
LAU_B = "@{LAURO_ZEMPOALTECA} seen from behind (short grey hair, beige work shirt, apron strings, thin)"
PAL_B = "@{PALOMA_ZEMPOALTECA} seen from behind (long straight loose black hair, dark-red cardigan)"
BRA_B = "@{BRANDON_VILLASENOR} seen from behind (short bleached-blond hair, tight black polo shirt)"
IBA_B = "@{DRA_IBARRA} seen from behind (black hair in a neat low bun, navy-blue blazer)"
#@INCLUDE funcs2
#@INCLUDE d8
LL = "standing on the LEFT at his carving bench"                         # Lauro
PL = "standing on the LEFT beside the shelves of obsidian pieces"        # Paloma
BR = "standing on the RIGHT at the open front of the workshop"           # Brandon
IR = "standing on the RIGHT in the dusty yard in front of the workshop"  # Doctora

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Brandon YA hablando en la entrada del taller; Lauro de espaldas (LEFT) en su banco.
 ("c01", D8("c01"), S("c01", "Brandon", f"Medium close-up of {BRA} {YARD0}, {BR}, talking from the very first frame, arrogant, he looks around the workshop with disdain", LAU_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {BRA} {YARD}, {BR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Lauro", f"Close-up of {LAU} {YARD0}, {LL}, calm and proud, stone dust on his hands", BRA_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {LAU} {YARD}, {LL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, a cocky smile, he picks up a small obsidian figure and looks at it with disdain", "LEFT"), "cocky, mocking")),
 ("r1", 6, f"Medium shot of {PAL} {YARD}, {PL}, already in place, she puts down a box and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a dark-red cardigan')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Paloma", f"Close-up of {PAL} {YARD0}, {PL}, firm and protective", BRA_B, "RIGHT", "firm, protective",
     f"Close-up of {PAL} {YARD}, {PL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Brandon", f"Close-up of {BRA} {YARD0}, {BR}, offended, he raises an eyebrow", PAL_B, "LEFT", "offended, cold",
     f"Close-up of {BRA} {YARD}, {BR}, offended", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a gold watch slowly knocks {MASK} off a wooden shelf and it lands on the dusty floor in pieces; only the hand, the shelf and the obsidian, no face. No dialogue."),
 ("c06", 6, S("c06", "Lauro", f"Close-up of {LAU} {YARD0}, {LL}, his eyes shine, he looks down at the broken mask, dignified", BRA_B, "RIGHT", "hurt, dignified",
     f"Close-up of {LAU} {YARD}, {LL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {LAU} {YARD}, he slowly kneels and gathers the black obsidian pieces into his apron, dignified, "
           f"{SOLO}; {ALONE}; {NODOUBLE('old man in a canvas apron')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Lauro", two(f"{LAU} on the LEFT holding obsidian pieces in his apron and {PAL} on the RIGHT, close together by the shelves {YARD0}, framed from the waist up; "
     f"Lauro speaks calmly to his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Lauro", "Paloma"), "calm, firm, low"),
   talk("c08", "Lauro", one(f"Close-up of {LAU} {YARD}, {LL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, laughing, amused", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of an elegant dark car driving slowly along a dirt road with nopal cacti toward the Pyramid of the Sun in Teotihuacán, warm afternoon light, dust behind it; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {IBA} {YARD}, {IR}, already standing in place, she takes off her glasses and looks at the workshop, elegant and serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a navy blazer')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Ibarra", f"Close-up of {IBA} {YARD0}, {IR}, warm and respectful, a small smile", LAU_B, "LEFT", "warm, respectful",
     f"Close-up of {IBA} {YARD}, {IR}, warm and respectful", "LEFT")),
 ("c11", 6, talk("c11", "Brandon", one(f"Close-up of {BRA} {YARD}, {BR}, he turns around, his smile gone, pale", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Ibarra", one(f"Close-up of {IBA} {YARD}, {IR}, cold and serious, she looks at Brandon", "RIGHT"), "cold, serious, slow")),
 ("c13", D8("c13"), talk("c13", "Ibarra", one(f"Close-up of {IBA} {YARD}, {IR}, she points at the broken pieces, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {BRA} {YARD}, kneeling on the dusty floor in his white trousers, he picks up black obsidian pieces one by one, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a black polo shirt')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Paloma", f"Close-up of {PAL} {YARD0}, {PL}, grateful, a small smile", IBA_B, "RIGHT", "grateful, warm",
     f"Close-up of {PAL} {YARD}, {PL}, grateful", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Ibarra", f"Close-up of {IBA} {YARD0}, {IR}, her smile fades, serious, she glances at the old man", PAL_B, "LEFT", "serious, soft, slow",
     f"Close-up of {IBA} {YARD}, {IR}, serious", "LEFT")),
 ("c16", 6, talk("c16", "Paloma", one(f"Close-up of {PAL} {YARD}, {PL}, confused, she turns to her father", "RIGHT"), "confused, worried")),
 ("c17", D8("c17"), (talk("c17", "Lauro", two(f"{PAL} on the LEFT and {LAU} on the RIGHT, facing each other by the carving bench {YARD0}, framed from the waist up; "
     f"Lauro, his eyes shine, speaks low to his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Lauro", "Paloma"), "low, emotional, slow"),
   talk("c17", "Lauro", one(f"Close-up of {LAU} {YARD}, {LL}, low and emotional, his eyes shine", "LEFT"), "low, emotional, slow"))),
 # CTA con carisma (después del BLACK): Paloma sola, a cámara
 ("c18", 10, talk("c18", "Paloma", f"Close-up from the chest up of {PAL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, pushes her hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small surprised half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("¿Y ella qué va a hacer, curarle la tristeza?", "¿Y ella qué va a hacer?"), ("Y usted le rompe su máscara.", "Y usted maltrata su máscara."),
        ("knocks", "moves"), ("lands on the dusty floor in pieces", "rests on the dusty floor"), ("broken", "fallen"), ("humiliated", "quiet"), ("offended", "surprised"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in an obsidian carving workshop near the pyramids of Teotihuacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic stone carving workshop with black obsidian pieces and a pyramid far behind, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LAURO_ZEMPOALTECA}", "a thin elderly Mexican man with grey hair, a grey mustache, round glasses on a cord and a dusty canvas apron"),
         ("@{PALOMA_ZEMPOALTECA}", "a Mexican woman around thirty with long loose black hair and a dark-red cardigan"),
         ("@{BRANDON_VILLASENOR}", "a Mexican man in his thirties with short bleached-blond hair, a black polo shirt and white trousers"),
         ("@{DRA_IBARRA}", "an elegant Mexican woman in her fifties with a neat bun, black-rimmed glasses and a navy blazer"),
         (" @{LOC_TALLEROBSIDIANA}", "")]
#@INCLUDE tail

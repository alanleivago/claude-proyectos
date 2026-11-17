"""Genera los clips de barrica-valle PARTE 1 (La Barrica del Valle, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (patrón acusa a su hombre de confianza -> plazo -> aparece la prueba -> el traidor es de la familia -> plazo invertido): en la cava de una vinícola del Valle de Guadalupe,
don Leopoldo Garza (67) acusa a su capataz Cirilo (56), veinte años a su lado, de abrir las barricas; su yerno Esteban (35) lo señala. La esposa Amparo (62) encuentra la llave perdida en la
chamarra de Esteban. Giro: Esteban no se apellida Salinas, es un Montaño, la familia rival. Leopoldo le pide perdón a Cirilo y le da a Esteban hasta mañana para irse.
Copia del clips.py de sombrero-sahuayo (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (cava): Cirilo y Esteban a la IZQUIERDA (entre las barricas); Leopoldo y Amparo a la DERECHA (junto a la puerta en arco).
YARD0 = ("inside the stone wine cellar of a family winery in Valle de Guadalupe, Baja California @{LOC_CAVAVALLE} in the evening: rows of oak wine barrels on wooden racks, "
         "a wet stone floor, warm hanging lamps, an arched wooden door open to vineyard rows at dusk; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
KEY = "an old black iron key"
LEO = ("@{LEOPOLDO_GARZA} (67-year-old Mexican man, tall and heavy-set, light skin, thick silver hair combed back, a full grey beard, a dark-brown suede jacket over a black shirt)")
CIR = ("@{CIRILO_BUSTOS} (56-year-old Mexican man, dark-brown sun-tanned skin, short black hair grey at the temples, a black mustache, a faded denim work shirt, a beige wide-brim work hat)")
AMP = ("@{AMPARO_GARZA} (62-year-old Mexican woman, light-brown skin, shoulder-length grey-blond hair, pearl stud earrings, a cream wool cardigan over a navy-blue blouse)")
EST = ("@{ESTEBAN_SALINAS} (35-year-old Mexican man, fair skin, neat short light-brown hair, clean-shaven, a tan leather jacket over a black turtleneck)")
#@INCLUDE funcs1
# Bordes: Leopoldo o Amparo le hablan a Cirilo/Esteban -> espalda LEFT; Cirilo o Esteban le hablan a Leopoldo/Amparo -> espalda RIGHT.
LEO_B = "@{LEOPOLDO_GARZA} seen from behind (thick silver hair, dark-brown suede jacket, heavy-set)"
CIR_B = "@{CIRILO_BUSTOS} seen from behind (beige wide-brim work hat, faded denim work shirt)"
AMP_B = "@{AMPARO_GARZA} seen from behind (shoulder-length grey-blond hair, cream wool cardigan)"
EST_B = "@{ESTEBAN_SALINAS} seen from behind (neat short light-brown hair, tan leather jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
CL = "standing on the LEFT between the rows of barrels"            # Cirilo
EL = "standing on the LEFT, leaning on a wine barrel"              # Esteban
LR = "standing on the RIGHT near the arched wooden door"           # Leopoldo
AR = "standing on the RIGHT by the arched wooden door"             # Amparo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Leopoldo YA hablando en la cava; Cirilo de espaldas (LEFT).
 ("c01", 6, S("c01", "Leopoldo", f"Medium close-up of {LEO} {YARD0}, {LR}, talking from the very first frame, grave and hard, he slaps the top of a barrel with his open hand", CIR_B, "LEFT", "grave, hard, contained anger",
     f"Medium close-up of {LEO} {YARD}, {LR}, talking from the very first frame, grave and hard", "LEFT")),
 ("c02", 6, S("c02", "Cirilo", f"Close-up of {CIR} {YARD0}, {CL}, worried and sincere, he takes off his hat", LEO_B, "RIGHT", "worried, sincere",
     f"Close-up of {CIR} {YARD}, {CL}, worried and sincere", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Leopoldo", one(f"Close-up of {LEO} {YARD}, {LR}, disappointed and cold, his eyes shine", "LEFT"), "disappointed, cold, slow")),
 ("r1", 6, f"Medium shot of {EST} {YARD}, {EL}, already in place, arms crossed, a faint calculating smile that disappears, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a tan leather jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Esteban", f"Close-up of {EST} {YARD0}, {EL}, pretending to be sorry, soft voice", LEO_B, "RIGHT", "falsely sorry, soft",
     f"Close-up of {EST} {YARD}, {EL}, pretending to be sorry", "RIGHT")),
 ("c05", D8("c05"), talk("c05", "Cirilo", one(f"Close-up of {CIR} {YARD}, {CL}, hurt and surprised, holding his hat against his chest", "LEFT"), "hurt, surprised")),
 ("c06", 6, S("c06", "Leopoldo", f"Close-up of {LEO} {YARD0}, {LR}, cold and final, he holds out his open hand", CIR_B, "LEFT", "cold, final",
     f"Close-up of {LEO} {YARD}, {LR}, cold and final, he holds out his open hand", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {KEY} lies on top of an oak wine barrel under the warm lamp light; only the key and the barrel, no face, no hands, no people. No dialogue."),
 ("c07", 6, S("c07", "Cirilo", f"Close-up of {CIR} {YARD0}, {CL}, dignified, his eyes shine, he puts his hat back on", LEO_B, "RIGHT", "dignified, sad, low",
     f"Close-up of {CIR} {YARD}, {CL}, dignified, his eyes shine", "RIGHT")),
 ("r2", 6, f"Medium shot of {AMP} {YARD}, {AR}, already in place in the doorway, serious and decided, holding {KEY} up in one hand, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a cream cardigan')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Amparo", two(f"{AMP} on the RIGHT holding {KEY} up and {LEO} on the LEFT, close together by the arched door {YARD0}, framed from the waist up; "
     f"Amparo speaks firmly to her husband, slightly closer to the camera and in sharper focus") + " " + MOUTH("Amparo", "Leopoldo"), "firm, urgent"),
   talk("c08", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, firm, holding {KEY} up", "LEFT"), "firm, urgent"))),
 ("c09", 6, S("c09", "Esteban", f"Close-up of {EST} {YARD0}, {EL}, nervous, forcing a smile, he raises his palms", AMP_B, "RIGHT", "nervous, defensive",
     f"Close-up of {EST} {YARD}, {EL}, nervous, forcing a smile", "RIGHT")),
 ("c10", D8("c10"), S("c10", "Leopoldo", f"Close-up of {LEO} {YARD0}, {LR}, suspicious, his eyes narrow", EST_B, "LEFT", "suspicious, low, hard",
     f"Close-up of {LEO} {YARD}, {LR}, suspicious, his eyes narrow", "LEFT")),
 ("i02", 6, "Wide shot of vineyard rows at dusk in Valle de Guadalupe, Baja California, a dark SUV with its headlights on parked and waiting at the ranch gate; no people visible, no readable text, no logos. No dialogue."),
 ("c11", 6, talk("c11", "Esteban", one(f"Close-up of {EST} {YARD}, {EL}, his nervous smile turns cold, he straightens up", "RIGHT"), "cold, calm, cynical")),
 ("c12", 6, talk("c12", "Leopoldo", one(f"Close-up of {LEO} {YARD}, {LR}, stunned, then hard", "LEFT"), "stunned, hard")),
 ("c13", 6, S("c13", "Esteban", f"Close-up of {EST} {YARD0}, {EL}, a cold proud half smile", LEO_B, "RIGHT", "cold, proud, slow",
     f"Close-up of {EST} {YARD}, {EL}, a cold proud half smile", "RIGHT")),
 ("r3", 6, one(f"Close-up of {LEO} {YARD}, {LR}, in silence, stunned, he closes his eyes, his jaw tightens", "LEFT") + " Slow push-in. No dialogue."),
 ("c14", 6, (talk("c14", "Leopoldo", two(f"{CIR} on the LEFT and {LEO} on the RIGHT, facing each other in profile among the barrels {YARD0}, framed from the waist up; "
     f"Leopoldo, ashamed, puts a hand on the foreman's shoulder, slightly closer to the camera and in sharper focus") + " " + MOUTH("Leopoldo", "Cirilo"), "ashamed, sincere, low"),
   talk("c14", "Leopoldo", one(f"Close-up of {LEO} {YARD}, {LR}, ashamed and sincere", "LEFT"), "ashamed, sincere, low"))),
 ("c15", 6, S("c15", "Cirilo", f"Close-up of {CIR} {YARD0}, {CL}, loyal and serious, a short nod", LEO_B, "RIGHT", "loyal, serious",
     f"Close-up of {CIR} {YARD}, {CL}, loyal and serious", "RIGHT")),
 ("c16", 6, talk("c16", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, worried, her eyes shine", "LEFT"), "worried, sad, low")),
 ("c17", 6, S("c17", "Leopoldo", f"Close-up of {LEO} {YARD0}, {LR}, cold and final, he gestures toward the door", EST_B, "LEFT", "cold, final, slow",
     f"Close-up of {LEO} {YARD}, {LR}, cold and final", "LEFT")),
 # CTA con carisma (después del BLACK): Leopoldo solo, a cámara
 ("c18", 10, talk("c18", "Leopoldo", f"Close-up from the chest up of {LEO} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, strokes his grey beard, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small hard half smile. Nobody else around.",
     "charismatic, grave, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Esto la va a destrozar.", "Esto le va a doler mucho."), ("contained anger", "serious"), ("slaps the top of a barrel with his open hand", "rests his hand on a barrel"),
        ("cynical", "calm"), ("calculating", "small"), ("contemptuous", "cool"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm lamp light in the stone wine cellar of a family winery in Baja California, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, wine cellar with oak barrels in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm low light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LEOPOLDO_GARZA}", "a tall heavy-set Mexican man in his sixties with thick silver hair combed back, a full grey beard and a dark-brown suede jacket"),
         ("@{CIRILO_BUSTOS}", "a Mexican man in his fifties with dark sun-tanned skin, a black mustache, a faded denim work shirt and a beige wide-brim work hat"),
         ("@{AMPARO_GARZA}", "a Mexican woman in her sixties with shoulder-length grey-blond hair, pearl earrings and a cream wool cardigan"),
         ("@{ESTEBAN_SALINAS}", "a Mexican man in his thirties with neat short light-brown hair, clean-shaven, in a tan leather jacket over a black turtleneck"),
         (" @{LOC_CAVAVALLE}", "")]
#@INCLUDE tail

"""Genera los clips de cobre-santaclara PARTE 1 (El Cobre de Santa Clara, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la figura de poder -> plazo invertido -> giro familiar): en Santa Clara del Cobre, Michoacán, Gerardo (32), dueño de una fábrica,
le tira a doña Celestina (64) el cazo de cobre de un encargo y le da plazo "antes de que empiece la feria"; llega don Lázaro (60), poderoso de la región, por el cazo de la boda de su hija:
Gerardo es el novio. Plazo invertido y boda cancelada. Giro: viene un nieto en camino... y Gerardo ya tiene otra familia en Morelia.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (taller de cobre): Celestina y Fausto a la IZQUIERDA (yunque y fragua); Gerardo y Lázaro a la DERECHA, en la entrada abierta a la plaza.
YARD0 = ("in a hammered-copper workshop in Santa Clara del Cobre, Michoacán @{LOC_TALLERCOBRE} in the afternoon: wooden shelves full of shiny hammered copper pots, a big iron anvil, "
         "a small forge with orange glow, a stone floor, white arcades of the plaza outside, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CAZO = "a big shiny hammered copper pot"
CEL = ("@{CELESTINA_PATINO} (64-year-old Mexican woman, brown skin, grey hair in two long braids, a dark leather work apron over a royal-blue blouse)")
FAU = ("@{FAUSTO_PATINO} (35-year-old Mexican man, thin and wiry, brown skin, short black hair, a thin black mustache, a black t-shirt, a dark leather work apron)")
GER = ("@{GERARDO_MALDONADO} (32-year-old Mexican man, light skin, styled curly dark-brown hair, clean-shaven, a beige suede jacket over a white t-shirt, a rose-gold watch, slim tinted glasses)")
LAZ = ("@{LAZARO_IBARRA} (60-year-old Mexican man, broad and heavy, dark-brown skin, short grey hair, a grey felt cowboy hat, a black leather jacket over a dark-red shirt)")
#@INCLUDE funcs1
# Bordes: Gerardo o Lázaro le hablan a Celestina/Fausto -> espalda LEFT; Celestina o Fausto les hablan -> espalda RIGHT.
CEL_B = "@{CELESTINA_PATINO} seen from behind (grey hair in two long braids, the straps of a leather apron over a royal-blue blouse)"
FAU_B = "@{FAUSTO_PATINO} seen from behind (short black hair, black t-shirt, thin)"
GER_B = "@{GERARDO_MALDONADO} seen from behind (styled curly dark-brown hair, beige suede jacket)"
LAZ_B = "@{LAZARO_IBARRA} seen from behind (grey felt cowboy hat, black leather jacket, broad shoulders)"
#@INCLUDE funcs2
#@INCLUDE d8
CL = "standing on the LEFT at the iron anvil, holding a small hammer"            # Celestina
CS = "standing on the LEFT beside the iron anvil"                                # Celestina sin martillo
FL = "standing on the LEFT beside the glowing forge"                             # Fausto
GR = "standing on the RIGHT in the open entrance of the workshop"                # Gerardo
LR = "standing on the RIGHT in the open entrance of the workshop, the plaza behind him"  # Lázaro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Gerardo YA hablando en la entrada del taller; Celestina de espaldas (LEFT) en el yunque. Plazo: antes de que empiece la feria.
 ("c01", D8("c01"), S("c01", "Gerardo", f"Medium close-up of {GER} {YARD0}, {GR}, talking from the very first frame, arrogant, he looks around the workshop with disdain", CEL_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {GER} {YARD}, {GR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Celestina", f"Close-up of {CEL} {YARD0}, {CL}, she stops hammering, firm and proud", GER_B, "RIGHT", "firm, proud, slow",
     f"Close-up of {CEL} {YARD}, {CL}, firm and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, a mocking smile, he adjusts his tinted glasses", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {FAU} {YARD}, {FL}, already in place, he puts down a pair of tongs and steps forward, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black t-shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Fausto", f"Close-up of {FAU} {YARD0}, {FL}, firm, protective", GER_B, "RIGHT", "firm, protective",
     f"Close-up of {FAU} {YARD}, {FL}, firm, protective", "RIGHT")),
 ("c05", 6, S("c05", "Gerardo", f"Close-up of {GER} {YARD0}, {GR}, he laughs once with contempt", FAU_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {GER} {YARD}, {GR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a white sneaker slowly pushes {CAZO} off a low wooden stand and it rolls and stops on the stone floor with a dent; only the shoe and the copper pot, no face. No dialogue."),
 ("c06", 6, S("c06", "Celestina", f"Close-up of {CEL} {YARD0}, {CS}, her eyes shine, she gestures down at the dented copper pot, indignant", GER_B, "RIGHT", "hurt, indignant",
     f"Close-up of {CEL} {YARD}, {CS}, her eyes shine, indignant", "RIGHT")),
 ("c07", 6, talk("c07", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {CEL} {YARD}, {CS}, she slowly kneels and lifts the dented copper pot into her arms, her eyes shine, dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("i02", 6, "Wide shot of two dark SUVs arriving slowly and stopping in a colonial plaza with white arcades and a kiosk in Santa Clara del Cobre, Michoacán, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {LAZ} {YARD}, {LR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey cowboy hat')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Lázaro", f"Close-up of {LAZ} {YARD0}, {LR}, polite and warm, he touches the brim of his hat", CEL_B, "LEFT", "polite, warm, calm",
     f"Close-up of {LAZ} {YARD}, {LR}, polite and warm", "LEFT")),
 ("c09", 6, S("c09", "Celestina", f"Close-up of {CEL} {YARD0}, {CS}, holding the dented copper pot, ashamed and sad", LAZ_B, "RIGHT", "sad, humble",
     f"Close-up of {CEL} {YARD}, {CS}, holding the dented copper pot, sad", "RIGHT")),
 ("c10", 6, talk("c10", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, he turns around, his smile gone, pale and nervous", "RIGHT"), "surprised, nervous")),
 ("c11", 6, talk("c11", "Lázaro", one(f"Close-up of {LAZ} {YARD}, {LR}, cold and serious, he looks at the young man", "LEFT"), "cold, serious, slow")),
 ("c12", 6, talk("c12", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, nervous, a forced smile, he raises both palms", "RIGHT"), "nervous, pleading")),
 ("c13", 6, S("c13", "Celestina", f"Close-up of {CEL} {YARD0}, {CS}, calm and firm", LAZ_B, "RIGHT", "calm, firm",
     f"Close-up of {CEL} {YARD}, {CS}, calm and firm", "RIGHT")),
 ("c14", D8("c14"), talk("c14", "Lázaro", one(f"Close-up of {LAZ} {YARD}, {LR}, cold and final, he points slowly toward the plaza", "LEFT"), "cold, final, slow")),
 ("c15", D8("c15"), talk("c15", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, a crooked smile returns, confident again", "RIGHT"), "sly, confident")),
 ("r4", 6, one(f"Close-up of {LAZ} {YARD}, {LR}, in silence, his eyes narrow, a shadow of doubt crosses his face", "LEFT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Lázaro", one(f"Close-up of {LAZ} {YARD}, {LR}, low and dangerous, very serious", "LEFT"), "low, serious, slow")),
 ("c17", 6, talk("c17", "Gerardo", one(f"Close-up of {GER} {YARD}, {GR}, a smug smile, he spreads his hands", "RIGHT"), "smug, slow")),
 ("c18", D8("c18"), (talk("c18", "Celestina", two(f"{CEL} on the LEFT holding the dented copper pot and {LAZ} on the RIGHT, in profile facing each other in the workshop entrance {YARD0}, "
     f"framed from the waist up; Celestina steps closer and speaks low, serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Celestina", "Lázaro"), "low, serious, firm"),
   talk("c18", "Celestina", one(f"Close-up of {CEL} {YARD}, {CS}, low and serious", "RIGHT"), "low, serious, firm"))),
 # CTA con carisma (después del BLACK): Lázaro solo, a cámara
 ("c19", 10, talk("c19", "Lázaro", f"Close-up from the chest up of {LAZ} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts the brim of his grey felt hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small dangerous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Que viene en camino un nieto suyo, suegro.", "Que su hija y yo vamos a tener familia, suegro."), ("¿Qué estás insinuando?", "¿Qué quieres decir?"),
        ("Pero este joven me lo tiró al suelo.", "Pero este joven lo maltrató."), ("pushes", "moves"), ("with a dent", "on its side"), ("dented", "fallen"),
        ("low and dangerous", "low"), ("dangerous", "serious"), ("with contempt", "coldly"), ("contemptuous", "cool"), ("powerful", "serious"), ("crooked", "small"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in a hammered-copper workshop on a colonial plaza in Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic copper workshop with shelves of shiny copper pots in a Mexican town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CELESTINA_PATINO}", "a Mexican woman in her sixties with grey hair in two braids, a leather apron and a royal-blue blouse"),
         ("@{FAUSTO_PATINO}", "a thin Mexican man in his thirties with a thin mustache, a black t-shirt and a leather apron"),
         ("@{GERARDO_MALDONADO}", "a light-skinned Mexican man in his thirties with curly dark hair, tinted glasses and a beige suede jacket"),
         ("@{LAZARO_IBARRA}", "a broad Mexican man in his sixties with a grey felt cowboy hat and a black leather jacket"),
         (" @{LOC_TALLERCOBRE}", "")]
#@INCLUDE tail

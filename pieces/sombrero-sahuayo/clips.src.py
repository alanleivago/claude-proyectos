"""Genera los clips de sombrero-sahuayo PARTE 1 (El Sombrero de Sahuayo, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada que el villano no cree -> llega el padrino poderoso -> plazo invertido -> giro familiar): bajo el portal de Sahuayo, Michoacán, Joaquín
Valencia (32) quiere el local del sombrerero don Isidro (70), pisa un sombrero de encargo y le da plazo "antes de que termine la feria"; su hija Clara (28) lo defiende. Isidro llama a don Honorio (72),
padrino de Joaquín, que se casó con un sombrero tejido por Isidro. Plazo invertido. Giro: la madre de Clara no se fue de casa: se fue con el papá de Joaquín.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (portal): Isidro y Clara a la IZQUIERDA (puesto de sombreros); Joaquín y Honorio a la DERECHA (del lado de la plaza).
YARD0 = ("under a colonial stone arcade on the main plaza of Sahuayo, Michoacán @{LOC_PORTALSAHUAYO} in the afternoon: a small stall with many woven palm cowboy hats hanging and stacked, "
         "bundles of dried palm, a kiosk and trees in the plaza beyond, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HAT = "a new finely woven palm cowboy hat"
PHONE = "an old small flip phone"
ISI = ("@{ISIDRO_GODINEZ} (70-year-old Mexican man, thin, brown wrinkled skin, short white hair, a white mustache, a light-blue long-sleeve shirt, a brown leather apron)")
CLA = ("@{CLARA_GODINEZ} (28-year-old Mexican woman, light-brown skin, long wavy brown hair, a white embroidered blouse, a denim skirt)")
JOA = ("@{JOAQUIN_VALENCIA} (32-year-old Mexican man, light skin, slicked-back black hair, a thin goatee, a black leather jacket over a white t-shirt, a gold chain)")
HON = ("@{HONORIO_RUELAS} (72-year-old Mexican man, tall and broad, light-brown skin, white hair, a thick white mustache, a fine cream palm cowboy hat, a dark-grey western jacket over a white shirt)")
#@INCLUDE funcs1
# Bordes: Joaquín u Honorio le hablan a Isidro/Clara -> espalda LEFT; Isidro o Clara les hablan -> espalda RIGHT.
ISI_B = "@{ISIDRO_GODINEZ} seen from behind (short white hair, light-blue shirt, the strings of a leather apron, thin)"
CLA_B = "@{CLARA_GODINEZ} seen from behind (long wavy brown hair, white embroidered blouse)"
JOA_B = "@{JOAQUIN_VALENCIA} seen from behind (slicked-back black hair, black leather jacket)"
HON_B = "@{HONORIO_RUELAS} seen from behind (cream palm cowboy hat, dark-grey western jacket, broad shoulders)"
#@INCLUDE funcs2
#@INCLUDE d8
IL = "sitting on the LEFT on a wooden stool at his hat stall, weaving palm"   # Isidro sentado
IS = "standing on the LEFT at his hat stall"                                 # Isidro de pie
CL = "standing on the LEFT beside the hat stall"                             # Clara
JR = "standing on the RIGHT under the arcade, on the plaza side"             # Joaquín
HR = "standing on the RIGHT under the arcade, the plaza behind him"          # Honorio

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Joaquín YA hablando frente al puesto; Isidro de espaldas (LEFT) tejiendo.
 ("c01", D8("c01"), S("c01", "Joaquín", f"Medium close-up of {JOA} {YARD0}, {JR}, talking from the very first frame, arrogant, he flicks a hanging hat with his finger", ISI_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {JOA} {YARD}, {JR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Isidro", f"Close-up of {ISI} {YARD0}, {IL}, calm and proud, palm strips in his hands", JOA_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {ISI} {YARD}, {IL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Joaquín", one(f"Close-up of {JOA} {YARD}, {JR}, a cold smile, he spreads his arms", "LEFT"), "cocky, cold")),
 ("r1", 6, f"Medium shot of {CLA} {YARD}, {CL}, already in place arranging hats, she stops and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young woman with wavy brown hair')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Clara", f"Close-up of {CLA} {YARD0}, {CL}, firm and protective", JOA_B, "RIGHT", "firm, protective",
     f"Close-up of {CLA} {YARD}, {CL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Joaquín", f"Close-up of {JOA} {YARD0}, {JR}, he laughs once, mocking", CLA_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {JOA} {YARD}, {JR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {HAT} lies on the stone floor of the arcade and a white sneaker slowly steps on its brim; only the shoe and the hat, no face. No dialogue."),
 ("c06", 6, S("c06", "Isidro", f"Close-up of {ISI} {YARD0}, {IS}, his eyes shine, hurt but dignified, he looks down at the hat", JOA_B, "RIGHT", "hurt, dignified",
     f"Close-up of {ISI} {YARD}, {IS}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Joaquín", one(f"Close-up of {JOA} {YARD}, {JR}, mocking, he dusts off his hands", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {ISI} {YARD}, he slowly bends down and picks up the stepped-on hat, brushing the dust off its brim with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('old man in a leather apron')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Isidro", two(f"{ISI} on the LEFT holding the dusty hat and {CLA} on the RIGHT, close together at the stall {YARD0}, framed from the waist up; "
     f"Isidro speaks calmly to his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Isidro", "Clara"), "calm, firm, low"),
   talk("c08", "Isidro", one(f"Close-up of {ISI} {YARD}, {IS}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Joaquín", one(f"Close-up of {JOA} {YARD}, {JR}, laughing, amused", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two dark SUVs arriving slowly around a colonial plaza with a kiosk and stone arcades in Sahuayo, Michoacán, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {HON} {YARD}, {HR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cream palm hat')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Honorio", f"Close-up of {HON} {YARD0}, {HR}, warm and respectful, he touches the brim of his hat", ISI_B, "LEFT", "warm, respectful",
     f"Close-up of {HON} {YARD}, {HR}, warm and respectful", "LEFT")),
 ("c11", 6, talk("c11", "Joaquín", one(f"Close-up of {JOA} {YARD}, {JR}, he turns around, his smile gone, pale", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Honorio", one(f"Close-up of {HON} {YARD}, {HR}, cold and serious, he looks at his godson", "RIGHT"), "cold, serious, slow")),
 ("c13", D8("c13"), talk("c13", "Honorio", one(f"Close-up of {HON} {YARD}, {HR}, he points at the hat, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {JOA} {YARD}, he bends down, takes the hat from the old man's stall and holds it with both hands, head lowered, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a black leather jacket')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Clara", f"Close-up of {CLA} {YARD0}, {CL}, grateful, a small smile", HON_B, "RIGHT", "grateful, warm",
     f"Close-up of {CLA} {YARD}, {CL}, grateful", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Honorio", f"Close-up of {HON} {YARD0}, {HR}, serious, he looks at the old man meaningfully", ISI_B, "LEFT", "serious, low",
     f"Close-up of {HON} {YARD}, {HR}, serious", "LEFT")),
 ("c16", 6, talk("c16", "Clara", one(f"Close-up of {CLA} {YARD}, {CL}, confused and worried", "RIGHT"), "confused, worried")),
 ("c17", 6, (talk("c17", "Isidro", two(f"{CLA} on the LEFT and {ISI} on the RIGHT, facing each other at the stall {YARD0}, framed from the waist up; "
     f"Isidro, his eyes shine, speaks low to his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Isidro", "Clara"), "low, sad, slow"),
   talk("c17", "Isidro", one(f"Close-up of {ISI} {YARD}, {IS}, low and sad, his eyes shine", "LEFT"), "low, sad, slow"))),
 # CTA con carisma (después del BLACK): Clara sola, a cámara
 ("c18", 10, talk("c18", "Clara", f"Close-up from the chest up of {CLA} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, pushes her hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Y tú le pisoteas su trabajo.", "Y tú le maltratas su trabajo."), ("Pues tenga su sombrero, viejo.", "Pues tenga su sombrero, don."),
        ("slowly steps on its brim", "rests beside it"), ("stepped-on", "dusty"), ("humiliated", "quiet"), ("contemptuous", "cool"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light under a colonial arcade with a stall of woven palm hats in Sahuayo, Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colonial plaza arcade with a hat stall in a Mexican town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ISIDRO_GODINEZ}", "a thin elderly Mexican man with short white hair, a white mustache, a light-blue shirt and a leather apron"),
         ("@{CLARA_GODINEZ}", "a Mexican woman in her late twenties with long wavy brown hair and a white embroidered blouse"),
         ("@{JOAQUIN_VALENCIA}", "a Mexican man in his thirties with slicked-back hair, a thin goatee and a black leather jacket"),
         ("@{HONORIO_RUELAS}", "a tall broad elderly Mexican man with a white mustache, a cream palm cowboy hat and a dark-grey western jacket"),
         (" @{LOC_PORTALSAHUAYO}", "")]
#@INCLUDE tail

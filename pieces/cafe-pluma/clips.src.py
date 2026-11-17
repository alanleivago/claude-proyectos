"""Genera los clips de cafe-pluma PARTE 1 (El Cafetal de Pluma, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada que el villano no cree -> llega el patrón -> plazo invertido -> giro familiar): en un cafetal de Pluma Hidalgo, Oaxaca, Rodrigo
Arteaga (34) quiere sacar a doña Eulalia (66) de su loma "antes de la cosecha" y le tira un costal de café; su hijo Mateo (30) la defiende. Eulalia llama a don Severiano (70), papá de Rodrigo
y patrón del café de la sierra, a quien ella le dio de comer cuando no tenía nada. Plazo invertido. Giro: Severiano se casó con Eulalia antes que con la mamá de Rodrigo y nunca se divorciaron.
Copia del clips.py de sombrero-sahuayo (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio de secado): Eulalia y Mateo a la IZQUIERDA (casa de adobe); Rodrigo y Severiano a la DERECHA (camino de la loma).
YARD0 = ("on the concrete drying patio of a coffee farm in the mountains of Pluma Hidalgo, Oaxaca @{LOC_CAFETALPLUMA} in the morning: coffee beans spread out to dry, burlap sacks, "
         "an old adobe house with a tile roof, green coffee plants and misty mountain slopes behind, soft light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
SACK = "a burlap sack full of roasted coffee beans"
PHONE = "an old small cell phone"
EUL = ("@{EULALIA_RUIZ} (66-year-old Mexican woman, brown skin, grey hair in a long braid, a dark-green embroidered blouse, a beige rebozo shawl on her shoulders)")
MAT = ("@{MATEO_RUIZ} (30-year-old Mexican man, brown skin, short black hair, clean-shaven, a light-grey work shirt with rolled sleeves)")
ROD = ("@{RODRIGO_ARTEAGA} (34-year-old Mexican man, light skin, wavy dark-brown hair combed back, a trimmed beard, a navy-blue quilted vest over a white shirt)")
SEV = ("@{SEVERIANO_ARTEAGA} (70-year-old Mexican man, tall, light-brown skin, white hair, a grey goatee, a brown felt cowboy hat, a black wool jacket over a cream shirt, a bolo tie)")
#@INCLUDE funcs1
# Bordes: Rodrigo o Severiano le hablan a Eulalia/Mateo -> espalda LEFT; Eulalia o Mateo les hablan -> espalda RIGHT.
EUL_B = "@{EULALIA_RUIZ} seen from behind (grey hair in a long braid, beige rebozo shawl over a dark-green blouse)"
MAT_B = "@{MATEO_RUIZ} seen from behind (short black hair, light-grey work shirt, a straw hat hanging on his back)"
ROD_B = "@{RODRIGO_ARTEAGA} seen from behind (wavy dark-brown hair, navy-blue quilted vest over a white shirt)"
SEV_B = "@{SEVERIANO_ARTEAGA} seen from behind (brown felt cowboy hat, black wool jacket, tall)"
#@INCLUDE funcs2
#@INCLUDE d8
EL = "standing on the LEFT by her coffee sacks, in front of the adobe house"   # Eulalia
ML = "standing on the LEFT beside the adobe house"                             # Mateo
RR = "standing on the RIGHT on the patio, the path down the slope behind him"  # Rodrigo
SR = "standing on the RIGHT on the patio, coffee plants behind him"            # Severiano

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Rodrigo YA hablando en el patio; Eulalia de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Rodrigo", f"Medium close-up of {ROD} {YARD0}, {RR}, talking from the very first frame, arrogant, he kicks a few coffee beans with the tip of his shoe", EUL_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {ROD} {YARD}, {RR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Eulalia", f"Close-up of {EUL} {YARD0}, {EL}, calm and proud, a handful of coffee beans in her palm", ROD_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {EUL} {YARD}, {EL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, a cold smile, he spreads his arms toward the mountains", "LEFT"), "cocky, cold")),
 ("r1", 6, f"Medium shot of {MAT} {YARD}, {ML}, already in place carrying nothing, he stops and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey work shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Mateo", f"Close-up of {MAT} {YARD0}, {ML}, firm and protective", ROD_B, "RIGHT", "firm, protective",
     f"Close-up of {MAT} {YARD}, {ML}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Rodrigo", f"Close-up of {ROD} {YARD0}, {RR}, he laughs once, mocking", MAT_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {ROD} {YARD}, {RR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {SACK} tips over on the concrete patio and the dark coffee beans spill out across the ground; only the sack and the beans, no face, no people. No dialogue."),
 ("c06", 6, S("c06", "Eulalia", f"Close-up of {EUL} {YARD0}, {EL}, her eyes shine, hurt but dignified, she looks down at the spilled coffee", ROD_B, "RIGHT", "hurt, dignified",
     f"Close-up of {EUL} {YARD}, {EL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, mocking, he dusts off his hands", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {EUL} {YARD}, she slowly crouches and gathers spilled coffee beans back into the sack with both hands, with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman with a grey braid')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Eulalia", two(f"{EUL} on the LEFT and {MAT} on the RIGHT, close together by the adobe house {YARD0}, framed from the waist up; "
     f"Eulalia speaks calmly to her son, slightly closer to the camera and in sharper focus") + " " + MOUTH("Eulalia", "Mateo"), "calm, firm, low"),
   talk("c08", "Eulalia", one(f"Close-up of {EUL} {YARD}, {EL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, laughing, amused, arms crossed", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two dark SUVs driving slowly up a winding dirt road between green coffee plants on a misty mountain slope in Oaxaca, soft morning light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {SEV} {YARD}, {SR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a brown felt hat')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Severiano", f"Close-up of {SEV} {YARD0}, {SR}, warm and respectful, he touches the brim of his hat", EUL_B, "LEFT", "warm, respectful",
     f"Close-up of {SEV} {YARD}, {SR}, warm and respectful", "LEFT")),
 ("c11", 6, talk("c11", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, he turns around, his smile gone, pale", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Severiano", one(f"Close-up of {SEV} {YARD}, {SR}, cold and serious, he looks at his son", "RIGHT"), "cold, serious, slow")),
 ("c13", D8("c13"), talk("c13", "Severiano", one(f"Close-up of {SEV} {YARD}, {SR}, he gestures at the spilled coffee, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {ROD} {YARD}, he crouches on the patio and gathers spilled coffee beans into the sack with his hands, head lowered, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a navy-blue vest')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Mateo", f"Close-up of {MAT} {YARD0}, {ML}, grateful but confused", SEV_B, "RIGHT", "grateful, puzzled",
     f"Close-up of {MAT} {YARD}, {ML}, grateful but confused", "RIGHT")),
 ("c15", 6, S("c15", "Severiano", f"Close-up of {SEV} {YARD0}, {SR}, serious, he looks at the woman meaningfully", EUL_B, "LEFT", "serious, low",
     f"Close-up of {SEV} {YARD}, {SR}, serious", "LEFT")),
 ("c16", 6, talk("c16", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {RR}, confused and worried", "LEFT"), "confused, worried")),
 ("c17", D8("c17"), (talk("c17", "Eulalia", two(f"{EUL} on the LEFT and {ROD} on the RIGHT, facing each other on the patio {YARD0}, framed from the waist up; "
     f"Eulalia, calm and firm, speaks low to him, slightly closer to the camera and in sharper focus") + " " + MOUTH("Eulalia", "Rodrigo"), "low, firm, slow"),
   talk("c17", "Eulalia", one(f"Close-up of {EUL} {YARD}, {EL}, low and firm", "RIGHT"), "low, firm, slow"))),
 # CTA con carisma (después del BLACK): Eulalia sola, a cámara
 ("c18", 10, talk("c18", "Eulalia", f"Close-up from the chest up of {EUL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, adjusts the rebozo on her shoulders, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Y tú le tiras su café.", "Y tú le maltratas su café."), ("A ver si así aprende.", "A ver si así entiende."),
        ("tips over", "lies open"), ("humiliated", "quiet"), ("contemptuous", "cool"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft morning light on the drying patio of a coffee farm in the mountains of Oaxaca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, coffee farm patio in the Mexican mountains, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EULALIA_RUIZ}", "a Mexican woman in her sixties with brown skin, grey hair in a long braid, a dark-green embroidered blouse and a beige rebozo shawl"),
         ("@{MATEO_RUIZ}", "a Mexican man around thirty with brown skin, short black hair and a light-grey work shirt"),
         ("@{RODRIGO_ARTEAGA}", "a Mexican man in his thirties with wavy dark-brown hair combed back, a trimmed beard and a navy-blue quilted vest"),
         ("@{SEVERIANO_ARTEAGA}", "a tall elderly Mexican man with white hair, a grey goatee, a brown felt cowboy hat and a black wool jacket"),
         (" @{LOC_CAFETALPLUMA}", "")]
#@INCLUDE tail

"""Genera los clips de manzana-cuauhtemoc PARTE 1 (La Manzana de Cuauhtémoc, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la figura de poder -> plazo invertido -> giro familiar): en una huerta de Cuauhtémoc, Chihuahua, Kevin (34) le tira la cosecha
a doña Herminia (68) y le da plazo "antes de que caiga la helada" para quedarse con la huerta; ella llama a Anselmo (65), al que escondió en su sótano en una nevada hace treinta años,
y resulta que es el padrino de Kevin. Giro: Joel (29), el nieto de Herminia, es hijo de Anselmo (con Rebeca, la hija de Herminia).
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio de empaque de la huerta): a la IZQUIERDA Herminia y Joel junto a las cajas de manzanas; a la DERECHA Kevin recargado en su camioneta;
# Anselmo llega desde r4 por la DERECHA, por el camino de tierra.
YARD0 = ("in the packing yard of an apple orchard in Cuauhtémoc, Chihuahua @{LOC_HUERTACUAUH} in the late autumn afternoon: rows of apple trees with red apples, stacked wooden apple crates, "
         "a small weathered wooden packing shed, a dirt road, dry golden grass, pale cold light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CRATES = "stacked wooden crates of red apples"
PHONE = "an old small flip phone"
HER = ("@{HERMINIA_OCHOA} (68-year-old Mexican woman, small and thin, wrinkled light-brown skin, white hair in a low bun, a maroon knitted wool cardigan over a dark floral blouse, "
       "a long dark-brown skirt)")
JOE = ("@{JOEL_OCHOA} (29-year-old Mexican man, tall and thin, light brown skin, short black hair, a short black beard, a red-and-black plaid flannel shirt under a tan canvas work jacket)")
KEV = ("@{KEVIN_LOERA} (34-year-old Mexican man, light skin, slicked-back black hair, a thin black mustache, a shiny black puffer jacket open over a burgundy button-up shirt, a silver watch)")
ANS = ("@{ANSELMO_QUINONES} (65-year-old Mexican man, tall and broad, light skin, grey hair, a grey goatee, a black felt cowboy hat, a long dark-brown sheepskin coat)")
#@INCLUDE funcs1
# Bordes: Kevin o Anselmo le hablan a Herminia/Joel -> espalda LEFT; Herminia o Joel le hablan a Kevin/Anselmo -> espalda RIGHT.
HER_B = "@{HERMINIA_OCHOA} seen from behind (white hair in a low bun, maroon knitted wool cardigan, small)"
JOE_B = "@{JOEL_OCHOA} seen from behind (short black hair, tan canvas work jacket, tall and thin)"
KEV_B = "@{KEVIN_LOERA} seen from behind (slicked-back black hair, shiny black puffer jacket)"
ANS_B = "@{ANSELMO_QUINONES} seen from behind (black felt cowboy hat, long dark-brown sheepskin coat, broad shoulders)"
#@INCLUDE funcs2
#@INCLUDE d8
HL = f"standing on the LEFT beside {CRATES}"                                   # Herminia
JL = f"standing on the LEFT beside {CRATES}"                                   # Joel
KR = "standing on the RIGHT, leaning on a black pickup truck"                  # Kevin
AR = "standing on the RIGHT on the dirt road"                                  # Anselmo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Kevin YA hablando, le extiende un papel; Herminia de espaldas (LEFT). Plazo: antes de que caiga la helada.
 ("c01", D8("c01"), S("c01", "Kevin", f"Medium close-up of {KEV} {YARD0}, {KR}, talking from the very first frame, arrogant, he holds out a sheet of paper and a pen", HER_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {KEV} {YARD}, {KR}, talking from the very first frame, arrogant, holding a sheet of paper", "LEFT")),
 ("c02", D8("c02"), S("c02", "Herminia", f"Close-up of {HER} {YARD0}, {HL}, firm and proud, she pushes the paper away with one hand", KEV_B, "RIGHT", "firm, proud, slow",
     f"Close-up of {HER} {YARD}, {HL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Kevin", one(f"Close-up of {KEV} {YARD}, {KR}, a cocky smile, he tilts his head", "LEFT"), "cocky, mocking, calm")),
 ("r1", 6, f"Medium shot of {JOE} {YARD}, {JL}, already in place holding an apple crate, he sets it down and steps forward, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a plaid flannel shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Joel", f"Close-up of {JOE} {YARD0}, {JL}, firm, protective", KEV_B, "RIGHT", "firm, protective",
     f"Close-up of {JOE} {YARD}, {JL}, firm, protective", "RIGHT")),
 ("c05", 6, S("c05", "Kevin", f"Close-up of {KEV} {YARD0}, {KR}, he laughs once with contempt", JOE_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {KEV} {YARD}, {KR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a pointed black boot slowly tips over a wooden crate of red apples and the apples roll across the dry dirt; only the boot, the crate and the apples, no face. No dialogue."),
 ("c06", 6, S("c06", "Herminia", f"Close-up of {HER} {YARD0}, {HL}, indignant, her eyes shine, she gestures down at the apples", KEV_B, "RIGHT", "indignant, hurt",
     f"Close-up of {HER} {YARD}, {HL}, indignant, her eyes shine", "RIGHT")),
 ("c07", 6, talk("c07", "Kevin", one(f"Close-up of {KEV} {YARD}, {KR}, laughing, he spreads his arms", "LEFT"), "mocking, cruel")),
 ("r2", 6, one(f"Close-up of {HER} {YARD}, {HL}, in silence, her jaw tight, her eyes shine, she looks down at the apples on the ground", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", D8("c08"), talk("c08", "Herminia", one(f"Close-up of {HER} {YARD}, {HL}, quiet and serious, a memory in her eyes", "RIGHT"), "quiet, serious, slow")),
 ("c09", 6, S("c09", "Kevin", f"Close-up of {KEV} {YARD0}, {KR}, mocking, he shakes his head", HER_B, "LEFT", "mocking, amused",
     f"Close-up of {KEV} {YARD}, {KR}, mocking", "LEFT")),
 ("r3", 6, f"Medium shot of {HER} {YARD}, {HL}, she takes {PHONE} out of her cardigan pocket, opens it and slowly presses a number with her thumb, calm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Herminia", one(f"Close-up of {HER} {YARD}, {HL}, holding {PHONE} to her ear, calm and serious", "RIGHT"), "calm, serious, low")),
 ("i02", 6, "Wide shot of three dark pickup trucks driving slowly in a line along a dirt road between rows of apple trees in Chihuahua at sunset, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r4", 6, f"Medium shot of {ANS} {YARD}, {AR}, already standing in place, a dark pickup truck parked behind him, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black cowboy hat')}. Slow push-in. No dialogue."),
 ("c11", 6, S("c11", "Anselmo", f"Close-up of {ANS} {YARD0}, {AR}, respectful and moved, he touches the brim of his hat", HER_B, "LEFT", "respectful, warm, moved",
     f"Close-up of {ANS} {YARD}, {AR}, respectful and moved, he touches the brim of his hat", "LEFT")),
 ("c12", D8("c12"), S("c12", "Herminia", f"Close-up of {HER} {YARD0}, {HL}, tired and firm", ANS_B, "RIGHT", "tired, firm",
     f"Close-up of {HER} {YARD}, {HL}, tired and firm", "RIGHT")),
 ("c13", 6, talk("c13", "Kevin", one(f"Close-up of {KEV} {YARD}, {KR}, his smile gone, pale and surprised", "RIGHT"), "surprised, nervous")),
 ("c14", 6, talk("c14", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, cold and serious, he looks at his godson", "LEFT"), "cold, serious, slow")),
 ("c15", 6, talk("c15", "Kevin", one(f"Close-up of {KEV} {YARD}, {KR}, nervous, a forced smile, he raises both palms", "RIGHT"), "nervous, pleading")),
 ("c16", D8("c16"), talk("c16", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, he gestures slowly toward the apples on the ground, cold and final", "LEFT"), "cold, final, slow")),
 ("r5", 6, f"Medium shot of {KEV} {YARD}, kneeling on the dry dirt, he picks up red apples one by one and puts them back into a wooden crate, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a black puffer jacket')}. No dialogue."),
 ("c17", 6, S("c17", "Joel", f"Close-up of {JOE} {YARD0}, {JL}, grateful and respectful, a small nod", ANS_B, "RIGHT", "grateful, respectful",
     f"Close-up of {JOE} {YARD}, {JL}, grateful, a small nod", "RIGHT")),
 ("c18", 6, S("c18", "Anselmo", f"Close-up of {ANS} {YARD0}, {AR}, he looks at the young man carefully, curious, his eyes narrow", JOE_B, "LEFT", "curious, slow, thoughtful",
     f"Close-up of {ANS} {YARD}, {AR}, curious, his eyes narrow", "LEFT")),
 ("c19", 6, talk("c19", "Joel", one(f"Close-up of {JOE} {YARD}, {JL}, a little confused", "RIGHT"), "confused, polite")),
 ("c20", 6, talk("c20", "Kevin", one(f"Close-up of {KEV} {YARD}, kneeling on the dirt, an apple in his hand, resentful, his voice low", "RIGHT"), "resentful, low")),
 ("c21", D8("c21"), (talk("c21", "Herminia", two(f"{HER} on the LEFT and {ANS} on the RIGHT, in profile facing each other beside the apple crates {YARD0}, framed from the waist up; "
     f"Herminia steps closer and speaks low, serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Herminia", "Anselmo"), "low, serious, confessing"),
   talk("c21", "Herminia", one(f"Close-up of {HER} {YARD}, {HL}, low and serious, confessing", "RIGHT"), "low, serious, confessing"))),
 ("c22", 6, talk("c22", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, stunned, his eyes shine, he slowly turns to look at the young man", "LEFT"), "stunned, low, moved")),
 ("c23", 6, S("c23", "Joel", f"Close-up of {JOE} {YARD0}, {JL}, confused and surprised, he looks at his grandmother", HER_B, "LEFT", "confused, surprised",
     f"Close-up of {JOE} {YARD}, {JL}, confused and surprised", "LEFT")),
 # CTA con carisma (después del BLACK): Anselmo solo, a cámara
 ("c24", 10, talk("c24", "Anselmo", f"Close-up from the chest up of {ANS} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts the brim of his black cowboy hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Y nunca te enseñé a pisotear a una viuda.", "Y nunca te enseñé a tratar así a una señora."), ("Me tiraron la cosecha, Anselmo.", "Se perdió mi cosecha, Anselmo."),
        ("Ya se ha de haber muerto, doña.", "Ya ni se ha de acordar, doña."), ("escondí a un hombre en mi sótano", "ayudé a un hombre en mi casa"),
        ("tips over", "moves"), ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"), ("stunned", "surprised"),
        ("resentful", "serious"), ("powerful", "serious"), ("three dark pickup trucks", "three pickup trucks"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, cold late-autumn light in an apple orchard packing yard in Chihuahua, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, apple orchard with wooden crates of red apples in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{HERMINIA_OCHOA}", "a small elderly Mexican woman with white hair in a bun and a maroon knitted cardigan"),
         ("@{JOEL_OCHOA}", "a tall thin Mexican man in his late twenties with a short black beard, a plaid flannel shirt and a tan work jacket"),
         ("@{KEVIN_LOERA}", "a Mexican man in his thirties with slicked-back black hair, a thin mustache and a shiny black puffer jacket"),
         ("@{ANSELMO_QUINONES}", "a tall broad Mexican man in his sixties with a grey goatee, a black cowboy hat and a dark-brown sheepskin coat"),
         (" @{LOC_HUERTACUAUH}", "")]
#@INCLUDE tail

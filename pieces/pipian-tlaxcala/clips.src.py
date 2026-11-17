"""Genera los clips de pipian-tlaxcala PARTE 1 (El Pipián de Tlaxcala, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #25 "La suegra en la cocina" (traición familiar), cierre tipo 7 (objeto que delata): en la comida del domingo, doña Cristina (66), dueña del restaurante más famoso de Tlaxcala,
humilla a su nuera Sofía (30) por su pipián y tira el plato; su hijo Emilio (34) intenta calmarla. Sofía saca el cuaderno de recetas de su mamá, Amparo Juárez: es el mismo pipián del menú
de Cristina. Cristina reconoce la letra: "Yo creí que ese cuaderno se había perdido."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (comedor): Cristina en la cabecera a la DERECHA; Sofía de pie a la IZQUIERDA junto a la mesa; Emilio sentado a la IZQUIERDA junto a Sofía.
YARD0 = ("in the dining room of a large old family house in Tlaxcala @{LOC_COMEDORTLAXCALA} at midday on a Sunday: a long dark wooden table with clay dishes and talavera plates, "
         "a pot of green pipián sauce, white walls, a window to a garden, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
BOOK = "an old worn notebook with a faded cloth cover"
CRI = ("@{CRISTINA_ARRIAGA} (66-year-old Mexican woman, fair skin, short silver hair styled with volume, gold-rimmed glasses on a chain, a burgundy silk blouse, a big gold brooch)")
SOF = ("@{SOFIA_JUAREZ} (30-year-old Mexican woman, brown skin, long black hair in a side braid, a mustard-yellow cardigan over a white blouse)")
EMI = ("@{EMILIO_ARRIAGA} (34-year-old Mexican man, fair skin, short curly brown hair, clean-shaven, a light-blue sweater over a white collared shirt)")
#@INCLUDE funcs1
CRI_B = "@{CRISTINA_ARRIAGA} seen from behind (short silver hair with volume, burgundy silk blouse)"
SOF_B = "@{SOFIA_JUAREZ} seen from behind (long black hair in a side braid, mustard-yellow cardigan)"
EMI_B = "@{EMILIO_ARRIAGA} seen from behind (short curly brown hair, light-blue sweater)"
#@INCLUDE funcs2
#@INCLUDE d8
CR = "sitting at the head of the table on the RIGHT"
SL = "standing on the LEFT beside the table"
EL = "sitting at the table on the LEFT"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Cristina YA hablando con la cuchara en la mano; Sofía de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Cristina", f"Medium close-up of {CRI} {YARD0}, {CR}, talking from the very first frame, haughty, she drops a spoon onto her plate of green pipián", SOF_B, "LEFT", "haughty, cold, mocking",
     f"Medium close-up of {CRI} {YARD}, {CR}, talking from the very first frame, haughty", "LEFT")),
 ("c02", 6, S("c02", "Sofía", f"Close-up of {SOF} {YARD0}, {SL}, polite, hiding her hurt, hands clasped", CRI_B, "RIGHT", "polite, hurt, soft",
     f"Close-up of {SOF} {YARD}, {SL}, polite, hiding her hurt", "RIGHT")),
 ("c03", 6, talk("c03", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, she takes off her glasses, cold", "LEFT"), "cold, proud")),
 ("r1", 6, f"Medium shot of {EMI} {YARD}, {EL}, already in place, uneasy, he puts down his fork and looks from one woman to the other, "
           f"{gaze('RIGHT')}; {ALONE}; {NODOUBLE('man in a light-blue sweater')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Emilio", f"Close-up of {EMI} {YARD0}, {EL}, uneasy, trying to calm things", CRI_B, "RIGHT", "uneasy, soft",
     f"Close-up of {EMI} {YARD}, {EL}, uneasy", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Cristina", f"Close-up of {CRI} {YARD0}, {CR}, she raises one hand to silence him, haughty", EMI_B, "LEFT", "haughty, sharp",
     f"Close-up of {CRI} {YARD}, {CR}, haughty", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a talavera plate of green pipián is scraped off with a spoon into an empty clay bowl at the edge of the table; only the plate, the spoon and a hand with a gold ring, no face. No dialogue."),
 ("c06", 6, S("c06", "Sofía", f"Close-up of {SOF} {YARD0}, {SL}, her eyes shine, dignified", CRI_B, "RIGHT", "hurt, dignified, low",
     f"Close-up of {SOF} {YARD}, {SL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, a superior smile, she folds her napkin", "LEFT"), "superior, mocking")),
 ("c08", 6, talk("c08", "Sofía", two(f"{SOF} standing on the LEFT and {EMI} sitting on the RIGHT at the table {YARD0}, framed from the waist up; Sofía, suddenly calm and sure, speaks to her husband, "
     f"slightly closer to the camera and in sharper focus") + " " + MOUTH("Sofía", "Emilio"), "calm, sure, low")),
 ("c09", 6, talk("c09", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, she laughs once, scornful", "LEFT"), "scornful, amused")),
 ("r2", 6, f"Medium shot of {SOF} {YARD}, {SL}, already in place, she opens {BOOK} with both hands and turns the yellowed pages slowly, calm; {PRES}; {ALONE}; {NODOUBLE('woman in a mustard cardigan')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Sofía", f"Close-up of {SOF} {YARD0}, {SL}, reading aloud from {BOOK}, calm and clear", CRI_B, "RIGHT", "calm, clear, slow",
     f"Close-up of {SOF} {YARD}, {SL}, reading aloud from {BOOK}", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Sofía", f"Close-up of {SOF} {YARD0}, {SL}, she turns the open notebook toward her mother-in-law, firm", CRI_B, "RIGHT", "firm, calm",
     f"Close-up of {SOF} {YARD}, {SL}, she holds up the open notebook, firm", "RIGHT")),
 ("c12", 6, S("c12", "Cristina", f"Close-up of {CRI} {YARD0}, {CR}, she puts on her glasses and stares at the notebook, her face goes pale", SOF_B, "LEFT", "shaken, whispering",
     f"Close-up of {CRI} {YARD}, {CR}, she stares, pale", "LEFT")),
 ("r3", 6, one(f"Close-up of {CRI} {YARD}, {CR}, in silence, pale, her hand slowly goes to her gold brooch, she cannot speak", "LEFT") + " Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Emilio", one(f"Close-up of {EMI} {YARD}, {EL}, confused and worried, looking at his mother", "RIGHT"), "confused, worried")),
 ("c14", 6, talk("c14", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, she whispers to herself, her eyes fixed on the notebook, lost in memory", "LEFT"), "whispering, shaken, slow")),
 # CTA con carisma (después del BLACK): Sofía sola, a cámara
 ("c15", 10, talk("c15", "Sofía", f"Close-up from the chest up of {SOF} {YARD}, alone, holding {BOOK} against her chest, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, taps the notebook cover, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Sofía, este pipián sabe a comida de fonda.", "Sofía, este pipián no sabe como el mío."), ("scornful", "amused"), ("haughty", "proud"), ("shaken", "surprised"),
        ("is scraped off with a spoon into an empty clay bowl", "sits untouched"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm midday light in the dining room of an old family house in Tlaxcala during Sunday lunch, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family dining room with clay dishes, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CRISTINA_ARRIAGA}", "an elegant Mexican woman in her sixties with short silver hair, gold-rimmed glasses on a chain and a burgundy silk blouse"),
         ("@{SOFIA_JUAREZ}", "a Mexican woman around thirty with brown skin, a long black side braid and a mustard-yellow cardigan"),
         ("@{EMILIO_ARRIAGA}", "a Mexican man in his thirties with short curly brown hair and a light-blue sweater"),
         (" @{LOC_COMEDORTLAXCALA}", "")]
#@INCLUDE tail

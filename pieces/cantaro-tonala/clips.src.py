"""Genera los clips de cantaro-tonala PARTE 1 (El Cántaro de Tonalá, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra + padre que pone orden (humillación + plazo -> la llamada que la villana no cree -> llega el patriarca -> plazo invertido -> giro familiar): en el patio de una casona de
alfareros de Tonalá, Jalisco, la madrastra Fabiola (46) rompe el cántaro que hizo la mamá de Mariana (26) y le da plazo "antes del domingo"; la ama de llaves Remedios (62) la defiende.
Mariana llama a su papá don Anselmo (68), dueño del taller más grande de Tonalá. Plazo invertido. Giro: la mamá de Mariana no murió en ese viaje, y Fabiola sabe dónde está.
Copia del clips.py de sombrero-sahuayo (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio): Mariana y Remedios a la IZQUIERDA (repisas de barro); Fabiola y Anselmo a la DERECHA (arcos de la entrada).
YARD0 = ("in the inner courtyard of a large old family house in Tonalá, Jalisco @{LOC_PATIOTONALA} in the afternoon: terracotta floor, arches, potted plants, "
         "wooden shelves with burnished clay pottery and painted clay water jugs, a stone fountain, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
JUG = "a large old hand-painted clay water jug"
MAR = ("@{MARIANA_OCHOA} (26-year-old Mexican woman, light-brown skin, long straight black hair in a low ponytail, a cream cotton blouse, light-blue jeans)")
FAB = ("@{FABIOLA_LEDESMA} (46-year-old Mexican woman, fair skin, short styled auburn hair, red lipstick, pearl earrings, a fitted wine-red dress)")
REM = ("@{REMEDIOS_CANO} (62-year-old Mexican woman, brown skin, grey hair in a bun, round glasses, a brown knitted cardigan over a floral blouse)")
ANS = ("@{ANSELMO_OCHOA} (68-year-old Mexican man, tall and broad, light-brown skin, grey hair, a thick grey mustache, a cream panama hat, a white long-sleeve guayabera)")
#@INCLUDE funcs1
# Bordes: Fabiola o Anselmo le hablan a Mariana/Remedios -> espalda LEFT; Mariana o Remedios les hablan -> espalda RIGHT.
MAR_B = "@{MARIANA_OCHOA} seen from behind (long straight black hair in a low ponytail, cream blouse)"
REM_B = "@{REMEDIOS_CANO} seen from behind (grey hair in a bun, brown knitted cardigan)"
FAB_B = "@{FABIOLA_LEDESMA} seen from behind (short styled auburn hair, fitted wine-red dress)"
ANS_B = "@{ANSELMO_OCHOA} seen from behind (cream panama hat, white guayabera, broad shoulders)"
#@INCLUDE funcs2
#@INCLUDE d8
ML = "standing on the LEFT by the shelves of clay pottery"      # Mariana
RL = "standing on the LEFT near the stone fountain"             # Remedios
FR = "standing on the RIGHT under an arch of the courtyard"     # Fabiola
AR = "standing on the RIGHT under an arch, the entrance behind him"  # Anselmo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Fabiola YA hablando en el patio; Mariana de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Fabiola", f"Medium close-up of {FAB} {YARD0}, {FR}, talking from the very first frame, arrogant, she taps {JUG} on the shelf with one fingernail", MAR_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {FAB} {YARD}, {FR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Mariana", f"Close-up of {MAR} {YARD0}, {ML}, hurt but firm, one hand resting on {JUG}", FAB_B, "RIGHT", "hurt, firm",
     f"Close-up of {MAR} {YARD}, {ML}, hurt but firm", "RIGHT")),
 ("c03", 6, talk("c03", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, a cold smile, she adjusts her bracelet", "LEFT"), "cocky, cold")),
 ("r1", 6, f"Medium shot of {REM} {YARD}, {RL}, already in place holding a folded cloth, she stops and steps forward, worried and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('older woman in a brown cardigan')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Remedios", f"Close-up of {REM} {YARD0}, {RL}, respectful but firm", FAB_B, "RIGHT", "respectful, firm",
     f"Close-up of {REM} {YARD}, {RL}, respectful but firm", "RIGHT")),
 ("c05", 6, S("c05", "Fabiola", f"Close-up of {FAB} {YARD0}, {FR}, she laughs once, mocking", REM_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {FAB} {YARD}, {FR}, she laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {JUG} falls from a wooden shelf onto the terracotta floor and breaks into pieces; only the jug and the floor, no face, no people. No dialogue."),
 ("c06", 6, S("c06", "Mariana", f"Close-up of {MAR} {YARD0}, {ML}, her eyes shine, she looks down at the broken pieces", FAB_B, "RIGHT", "hurt, low",
     f"Close-up of {MAR} {YARD}, {ML}, her eyes shine", "RIGHT")),
 ("c07", 6, talk("c07", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, mocking, she brushes off her hands", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {MAR} {YARD}, she slowly crouches and gathers broken pieces of painted clay from the terracotta floor into her hands, with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('young woman with a black ponytail')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Mariana", two(f"{MAR} on the LEFT holding broken clay pieces and {REM} on the RIGHT, close together by the fountain {YARD0}, framed from the waist up; "
     f"Mariana speaks firmly to the older woman, slightly closer to the camera and in sharper focus") + " " + MOUTH("Mariana", "Remedios"), "firm, decided, low"),
   talk("c08", "Mariana", one(f"Close-up of {MAR} {YARD}, {ML}, firm and decided", "RIGHT"), "firm, decided, low"))),
 ("c09", 6, talk("c09", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, amused, arms crossed", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two dark SUVs stopping slowly on a cobblestone street of colonial houses with clay pottery displayed on the sidewalks in Tonalá, Jalisco, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {ANS} {YARD}, {AR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cream panama hat')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Anselmo", f"Close-up of {ANS} {YARD0}, {AR}, warm and protective, he looks at his daughter", MAR_B, "LEFT", "warm, protective",
     f"Close-up of {ANS} {YARD}, {AR}, warm and protective", "LEFT")),
 ("c11", 6, talk("c11", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, she turns around, her smile gone, pale, then forces a sweet smile", "RIGHT"), "surprised, nervous, falsely sweet")),
 ("c12", D8("c12"), talk("c12", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, cold and serious, he looks at his wife", "RIGHT"), "cold, serious, slow")),
 ("c13", 6, talk("c13", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, he gestures toward the entrance, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {FAB} {YARD}, she lowers her head and slowly takes off her pearl earrings, quiet and defeated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman in a wine-red dress')}. No dialogue."),
 ("c14", 6, S("c14", "Mariana", f"Close-up of {MAR} {YARD0}, {ML}, grateful, a small smile, her eyes shine", ANS_B, "RIGHT", "grateful, warm",
     f"Close-up of {MAR} {YARD}, {ML}, grateful", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Remedios", f"Close-up of {REM} {YARD0}, {RL}, serious, she looks at the old man meaningfully", ANS_B, "RIGHT", "serious, low",
     f"Close-up of {REM} {YARD}, {RL}, serious", "RIGHT")),
 ("c16", 6, talk("c16", "Mariana", one(f"Close-up of {MAR} {YARD}, {ML}, confused and worried", "RIGHT"), "confused, worried")),
 ("c17", 6, (talk("c17", "Anselmo", two(f"{MAR} on the LEFT and {ANS} on the RIGHT, facing each other in the courtyard {YARD0}, framed from the waist up; "
     f"Anselmo, his eyes shine, speaks low to his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Anselmo", "Mariana"), "low, sad, slow"),
   talk("c17", "Anselmo", one(f"Close-up of {ANS} {YARD}, {AR}, low and sad, his eyes shine", "LEFT"), "low, sad, slow"))),
 # CTA con carisma (después del BLACK): Mariana sola, a cámara
 ("c18", 10, talk("c18", "Mariana", f"Close-up from the chest up of {MAR} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a loose strand of hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("¿Por qué me odia tanto?", "¿Por qué me hace esto?"), ("falls from a wooden shelf onto the terracotta floor and breaks into pieces", "lies on the terracotta floor, cracked"),
        ("defeated", "quiet"), ("contemptuous", "cool"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in the courtyard of an old family house with clay pottery in Tonalá, Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colonial house courtyard with clay pottery in a Mexican town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MARIANA_OCHOA}", "a Mexican woman in her twenties with long straight black hair in a low ponytail and a cream cotton blouse"),
         ("@{FABIOLA_LEDESMA}", "an elegant Mexican woman in her forties with short styled auburn hair, pearl earrings and a fitted wine-red dress"),
         ("@{REMEDIOS_CANO}", "a Mexican woman in her sixties with grey hair in a bun, round glasses and a brown knitted cardigan"),
         ("@{ANSELMO_OCHOA}", "a tall broad Mexican man in his late sixties with a thick grey mustache, a cream panama hat and a white guayabera"),
         (" @{LOC_PATIOTONALA}", "")]
#@INCLUDE tail

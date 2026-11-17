"""Genera los clips de arbol-metepec PARTE 1 (El Árbol de Metepec, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la figura de poder -> plazo invertido -> traidor en casa, como el modelo 7704056500502793502): en el mercado de artesanías de Metepec,
Uriel (36) le rompe a Jazmín (27) el árbol de la vida que tenía encargado y le da plazo "antes de que acabe la feria"; llega la dueña del encargo, doña Amparo (70), matriarca para la que
trabaja el papá de Uriel. Plazo invertido. Giro: el puesto ya lo firmó a escondidas Ramiro (31), el marido de Jazmín.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (pasillo del mercado): Jazmín SIEMPRE a la IZQUIERDA detrás de su puesto de árboles de la vida; Uriel, Amparo y Ramiro a la DERECHA en el pasillo.
YARD0 = ("in an artisan market aisle in Metepec, State of Mexico @{LOC_MERCADOMETEPEC} during the day: small stalls full of colorful painted clay trees of life, clay suns and pottery on wooden shelves, "
         "colorful plain paper banners overhead, a stone floor, soft daylight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
TREE = "a large colorful painted clay tree of life"
PHONE = "a smartphone"
JAZ = ("@{JAZMIN_ESQUIVEL} (27-year-old Mexican woman, light-brown skin, black hair in a high ponytail tied with a red ribbon, a mustard-yellow t-shirt, a denim apron with small paint stains)")
URI = ("@{URIEL_SAUCEDO} (36-year-old Mexican man, stocky, light-brown skin, black hair shaved on the sides with a gelled top, a black goatee, a burgundy velvet bomber jacket over a black t-shirt, two gold rings)")
AMP = ("@{AMPARO_VILLALBA} (70-year-old elegant Mexican matriarch, light skin, silver hair in an elegant low bun, a black shawl over a black dress, a pearl necklace, big gold rings)")
RAM = ("@{RAMIRO_LUNA} (31-year-old Mexican man, thin, brown skin, messy short black hair, light stubble, a grey hoodie)")
#@INCLUDE funcs1
# Bordes: los de la DERECHA le hablan a Jazmín -> espalda de ella LEFT; Jazmín les habla -> espalda de ellos RIGHT.
JAZ_B = "@{JAZMIN_ESQUIVEL} seen from behind (black high ponytail with a red ribbon, mustard-yellow t-shirt, denim apron straps)"
URI_B = "@{URIEL_SAUCEDO} seen from behind (black hair shaved on the sides, burgundy velvet bomber jacket, stocky)"
AMP_B = "@{AMPARO_VILLALBA} seen from behind (silver hair in a low bun, black shawl over the shoulders)"
RAM_B = "@{RAMIRO_LUNA} seen from behind (messy short black hair, grey hoodie, thin)"
#@INCLUDE funcs2
#@INCLUDE d8
JL = "standing on the LEFT behind her stall of painted clay trees of life"       # Jazmín
UR = "standing on the RIGHT in the market aisle, leaning on the stall"            # Uriel
AR = "standing on the RIGHT in the market aisle"                                  # Amparo
RR = "standing on the RIGHT at the corner of the stall"                           # Ramiro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Uriel YA hablando, recargado en el puesto, toca un árbol de barro; Jazmín de espaldas (LEFT). Plazo: antes de que acabe la feria.
 ("c01", D8("c01"), S("c01", "Uriel", f"Medium close-up of {URI} {YARD0}, {UR}, talking from the very first frame, arrogant, he taps a small clay figure with one finger", JAZ_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {URI} {YARD}, {UR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Jazmín", f"Close-up of {JAZ} {YARD0}, {JL}, firm and proud, she raises her chin", URI_B, "RIGHT", "firm, proud",
     f"Close-up of {JAZ} {YARD}, {JL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, a cocky smile, he shakes his head", "LEFT"), "cocky, mocking, cold")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with two gold rings slowly pushes {TREE} off the edge of a wooden shelf and it breaks into colorful pieces on the stone floor; only the hand, the clay and the floor, no face. No dialogue."),
 ("c04", 6, S("c04", "Jazmín", f"Close-up of {JAZ} {YARD0}, {JL}, her eyes shine, she looks down at the broken clay, indignant", URI_B, "RIGHT", "hurt, indignant",
     f"Close-up of {JAZ} {YARD}, {JL}, her eyes shine, indignant", "RIGHT")),
 ("c05", 6, talk("c05", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, laughing, he spreads his hands", "LEFT"), "mocking, cruel")),
 ("r1", 6, f"Medium shot of {AMP} {YARD}, {AR}, already standing in place in the middle of the aisle, she slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('elderly woman in black')}. Slow push-in. No dialogue."),
 ("c06", D8("c06"), talk("c06", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, calm and cold, she looks at the broken clay", "LEFT"), "calm, cold, slow")),
 ("c07", 6, talk("c07", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, he turns his head, cocky and annoyed", "RIGHT"), "cocky, annoyed")),
 ("c08", 6, talk("c08", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, a small cold smile, completely calm", "LEFT"), "calm, cold, slow")),
 ("r2", 6, f"Medium shot of {URI} {YARD}, {UR}, he takes {PHONE} out of his jacket and dials quickly, his smile slowly disappears, "
           f"{SOLO}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c09", D8("c09"), talk("c09", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, holding {PHONE} to his ear, nervous, his face pale", "RIGHT"), "nervous, quick")),
 ("c10", D8("c10"), talk("c10", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, serious and powerful, she looks at the young man", "LEFT"), "serious, cold, slow")),
 ("c11", 6, talk("c11", "Uriel", one(f"Close-up of {URI} {YARD}, {UR}, nervous, a forced smile, he lowers the phone", "RIGHT"), "nervous, pleading")),
 ("c12", D8("c12"), talk("c12", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, she points with her chin at the broken clay on the floor, cold and final", "LEFT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {URI} {YARD}, kneeling on the stone floor, he picks up colorful pieces of broken clay one by one, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a burgundy jacket')}. No dialogue."),
 ("c13", 6, S("c13", "Jazmín", f"Close-up of {JAZ} {YARD0}, {JL}, grateful, her eyes shine", AMP_B, "RIGHT", "grateful, soft",
     f"Close-up of {JAZ} {YARD}, {JL}, grateful, her eyes shine", "RIGHT")),
 ("c14", 6, S("c14", "Amparo", f"Close-up of {AMP} {YARD0}, {AR}, warm, a small kind smile", JAZ_B, "LEFT", "warm, kind, slow",
     f"Close-up of {AMP} {YARD}, {AR}, warm, a small kind smile", "LEFT")),
 ("c15", 6, talk("c15", "Uriel", one(f"Close-up of {URI} {YARD}, kneeling on the stone floor, a piece of clay in his hand, a resentful smile, his voice low", "RIGHT"), "resentful, low")),
 ("c16", 6, talk("c16", "Jazmín", one(f"Close-up of {JAZ} {YARD}, {JL}, confused, worried", "RIGHT"), "confused, worried")),
 ("c17", 6, S("c17", "Uriel", f"Close-up of {URI} {YARD0}, kneeling, he looks up with a mean smile", JAZ_B, "LEFT", "mean, slow, amused",
     f"Close-up of {URI} {YARD}, kneeling, a mean smile", "LEFT")),
 ("r4", 6, f"Medium shot of {RAM} {YARD}, {RR}, already in place, he stops with his hands in his hoodie pockets and lowers his eyes, guilty, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey hoodie')}. Slow push-in. No dialogue."),
 ("c18", 6, S("c18", "Jazmín", f"Close-up of {JAZ} {YARD0}, {JL}, shocked and hurt, her voice breaks", RAM_B, "RIGHT", "shocked, hurt",
     f"Close-up of {JAZ} {YARD}, {JL}, shocked and hurt", "RIGHT")),
 ("c19", 6, S("c19", "Ramiro", f"Close-up of {RAM} {YARD0}, {RR}, ashamed, he cannot look at her", JAZ_B, "LEFT", "ashamed, low, quick",
     f"Close-up of {RAM} {YARD}, {RR}, ashamed", "LEFT")),
 ("c20", 6, talk("c20", "Amparo", one(f"Close-up of {AMP} {YARD}, {AR}, she turns slowly to the husband, cold contempt", "LEFT"), "cold, contemptuous, slow")),
 # CTA con carisma (después del BLACK): Jazmín sola, a cámara
 ("c21", 10, talk("c21", "Jazmín", f"Close-up from the chest up of {JAZ} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, adjusts the red ribbon in her ponytail, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Tu abuela ya no está para defenderte.", "Tu abuela ya no está aquí."), ("Entonces eres peor que este muchacho.", "Entonces no eres mejor que este muchacho."),
        ("breaks into colorful pieces on the stone floor", "lands on the stone floor in pieces"), ("pushes", "moves"), ("a mean smile", "a smile"), ("cold contempt", "serious"),
        ("contemptuous", "cool"), ("humiliated", "quiet"), ("shocked and hurt", "surprised"), ("her voice breaks", "softly"), ("his face pale", "quiet"),
        ("resentful", "serious"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft daylight in an artisan market aisle full of painted clay trees of life in Metepec, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican artisan market with colorful clay pottery stalls, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{JAZMIN_ESQUIVEL}", "a Mexican woman in her twenties with a high black ponytail with a red ribbon, a mustard-yellow t-shirt and a denim apron"),
         ("@{URIEL_SAUCEDO}", "a stocky Mexican man in his thirties with a black goatee, gelled hair and a burgundy velvet bomber jacket"),
         ("@{AMPARO_VILLALBA}", "an elegant elderly Mexican woman with silver hair in a bun, a black shawl and a pearl necklace"),
         ("@{RAMIRO_LUNA}", "a thin Mexican man in his early thirties with messy black hair and a grey hoodie"),
         (" @{LOC_MERCADOMETEPEC}", "")]
#@INCLUDE tail

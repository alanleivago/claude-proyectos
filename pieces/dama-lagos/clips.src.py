"""Genera los clips de dama-lagos PARTE 1 (La Dama de Compañía, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #52 "La gata del rancho" [CAPO] (Patronas y haciendas), cierre tipo 3 (palabra reveladora: un nombre): en el comedor de la casa grande de una hacienda en Lagos de Moreno,
la nieta rica Paulina (26) no quiere que Macrina (23), la nueva dama de compañía de su abuela, se siente a la mesa. La matriarca Benigna (76) la sienta y le pregunta quién le enseñó a hablar tan derecho:
"Mi papá… Ventura Altamirano", el tío que se fue de la casa. Benigna se congela; Paulina se queda sin habla.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (comedor): Benigna SENTADA a la DERECHA en la cabecera; Paulina DE PIE a la DERECHA junto a la silla de la abuela; Macrina DE PIE a la IZQUIERDA junto a una silla vacía.
ROOM0 = ("in the large old dining room of a colonial hacienda house in Lagos de Moreno, Jalisco @{LOC_COMEDORLAGOS} in the morning: a long dark wooden table with a white embroidered tablecloth, porcelain plates, a silver coffee pot, "
         "heavy carved wooden chairs, thick white walls, warm sunlight through tall windows; no readable text, no signs, no logos")
ROOM = ROOM0 + "; nobody else in the background, no extras, nobody besides the person described"
BEN = ("@{BENIGNA_ALTAMIRANO} (76-year-old Mexican woman, fair wrinkled skin, silver-white hair in a tight low bun, sharp pale-brown eyes, a high-necked black dress with a small gold brooch)")
PAU = ("@{PAULINA_ALTAMIRANO} (26-year-old Mexican woman, light skin, long straight light-brown hair with honey highlights, nude lipstick, a cream silk blouse, gold hoop earrings)")
MAC = ("@{MACRINA_LEAL} (23-year-old Mexican woman, warm brown skin, thick black hair in one long braid over her shoulder, strong dark eyebrows, a white cotton blouse with red embroidered flowers)")
#@INCLUDE funcs1
BEN_B = "@{BENIGNA_ALTAMIRANO} seen from behind (silver-white hair in a tight low bun, high-necked black dress), seated"
PAU_B = "@{PAULINA_ALTAMIRANO} seen from behind (long light-brown hair with honey highlights, cream silk blouse)"
MAC_B = "@{MACRINA_LEAL} seen from behind (one long thick black braid, white embroidered blouse)"
#@INCLUDE funcs2
#@INCLUDE d8
BR = "seated on the RIGHT at the head of the table"
PR = "standing on the RIGHT beside the grandmother's chair at the head of the table"
ML = "standing on the LEFT beside an empty carved chair at the table"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Paulina YA hablando, despectiva, Macrina de espaldas en el borde.
 ("c01", 6, S("c01", "Paulina", f"Medium close-up of {PAU} {ROOM0}, {PR}, talking from the very first frame, dismissive, looking down at the young woman, arms crossed", MAC_B, "LEFT", "dismissive, cold, spoiled",
     f"Medium close-up of {PAU} {ROOM}, {PR}, talking from the very first frame, dismissive", "LEFT")),
 ("c02", 6, S("c02", "Macrina", f"Close-up of {MAC} {ROOM0}, {ML}, chin up, proud, holding the gaze without blinking, firm but calm", PAU_B, "RIGHT", "proud, firm, calm",
     f"Close-up of {MAC} {ROOM}, {ML}, chin up, proud", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Paulina", f"Close-up of {PAU} {ROOM0}, {PR}, a mocking smile, rolling her eyes, then hard", MAC_B, "LEFT", "mocking, cold, cutting",
     f"Close-up of {PAU} {ROOM}, {PR}, mocking smile", "LEFT")),
 ("c04", 6, S("c04", "Benigna", f"Close-up of {BEN} {ROOM0}, {BR}, she sets down her porcelain cup and speaks with total authority, without raising her voice", PAU_B, "RIGHT", "authoritative, calm, cold",
     f"Close-up of {BEN} {ROOM}, {BR}, total authority, setting down her cup", "LEFT")),
 ("c05", 6, S("c05", "Paulina", f"Close-up of {PAU} {ROOM0}, {PR}, turning to her grandmother, offended, pointing with her chin at the young woman", BEN_B, "LEFT", "offended, whiny, scornful",
     f"Close-up of {PAU} {ROOM}, {PR}, offended", "LEFT")),
 ("c06", D8("c06"), S("c06", "Macrina", f"Close-up of {MAC} {ROOM0}, {ML}, she pulls the empty chair back slowly, dignified, voice steady", PAU_B, "RIGHT", "dignified, steady, proud",
     f"Close-up of {MAC} {ROOM}, {ML}, dignified, voice steady", "RIGHT")),
 ("c07", 6, S("c07", "Benigna", f"Close-up of {BEN} {ROOM0}, {BR}, a faint approving half-smile, then a cold look up at her granddaughter", PAU_B, "RIGHT", "dry, amused, stern",
     f"Close-up of {BEN} {ROOM}, {BR}, faint approving half-smile", "LEFT")),
 ("c08", 6, S("c08", "Paulina", f"Close-up of {PAU} {ROOM0}, {PR}, leaning slightly toward the young woman, a sweet sly smile, talking low", MAC_B, "LEFT", "low, sweet, sly",
     f"Close-up of {PAU} {ROOM}, {PR}, sweet sly smile, talking low", "LEFT")),
 ("c09", 6, S("c09", "Macrina", f"Close-up of {MAC} {ROOM0}, {ML}, back straight, she answers calmly, unafraid", PAU_B, "RIGHT", "calm, unafraid, firm",
     f"Close-up of {MAC} {ROOM}, {ML}, back straight, unafraid", "RIGHT")),
 ("c10", 6, S("c10", "Benigna", f"Close-up of {BEN} {ROOM0}, {BR}, curious, studying the young woman's face closely, a slight tilt of the head", MAC_B, "LEFT", "curious, slow, probing",
     f"Close-up of {BEN} {ROOM}, {BR}, curious, studying her", "LEFT")),
 ("c11", 6, S("c11", "Macrina", f"Close-up of {MAC} {ROOM0}, {ML}, she looks the old woman straight in the eyes, a small pause, then says the name softly and clearly", BEN_B, "RIGHT", "soft, clear, meaningful",
     f"Close-up of {MAC} {ROOM}, {ML}, looking straight ahead, soft and clear", "RIGHT")),
 ("i01", 6, f"Close-up insert {ROOM0}: an old wrinkled hand with a gold ring lets a small silver spoon slip; it falls onto a white porcelain saucer; no faces, no readable text. No dialogue."),
 ("r1", 6, one(f"Close-up of {BEN} {ROOM}, {BR}, frozen, her stern face breaks, her eyes fill with surprise and old sadness, her lips part, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r2", 6, one(f"Close-up of {PAU} {ROOM}, {PR}, stunned, her smile gone, she slowly turns her head toward her grandmother, mouth slightly open", "LEFT") + " No dialogue."),
 # CTA con carisma (después del BLACK): Macrina a cámara
 ("c12", 10, talk("c12", "Macrina", f"Close-up from the chest up of {MAC} {ROOM}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, brushes her long braid back over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("dismissive, cold, spoiled", "cold, spoiled"), ("mocking, cold, cutting", "mocking, cold"), ("scornful", "annoyed"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm morning light in the dining room of a colonial hacienda in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, hacienda dining room with a long wooden table in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{BENIGNA_ALTAMIRANO}", "a stern Mexican woman in her seventies with silver-white hair in a low bun and a high-necked black dress"),
         ("@{PAULINA_ALTAMIRANO}", "a Mexican woman in her twenties with long light-brown hair with honey highlights and a cream silk blouse"),
         ("@{MACRINA_LEAL}", "a young Mexican woman with one long black braid and a white blouse with red embroidered flowers"),
         (" @{LOC_COMEDORLAGOS}", "")]
#@INCLUDE tail

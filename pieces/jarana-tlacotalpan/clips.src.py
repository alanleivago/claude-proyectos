"""Genera los clips de jarana-tlacotalpan PARTE 1 (La Jarana de Tlacotalpan, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la matriarca -> plazo invertido -> giro familiar): en la fiesta de Tlacotalpan, Veracruz, Lorena (40), organizadora y nuera de doña Cristina,
quiere quitar el puesto del jaranero don Matías (72) "antes de que salga la procesión" y le tira una jarana; su nieto Ismael (26) lo defiende. La jarana era el encargo de doña Cristina (68):
la de su difunto marido. Plazo invertido. Giro: Lorena revela que Ismael no es nieto de Matías sino de Cristina (hijo de Rodolfo).
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (plaza): Matías e Ismael a la IZQUIERDA (puesto de jaranas); Lorena y Cristina a la DERECHA (en la plaza).
YARD0 = ("in a colonial plaza in Tlacotalpan, Veracruz @{LOC_PLAZATLACOTALPAN} during the town festival in the afternoon: brightly painted houses with arcades in blue, pink and yellow, "
         "a small wooden stall with handmade jarana guitars hanging, papel picado without letters overhead, palm trees, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
JARANA = "a small handmade jarana guitar of dark polished wood"
MAT = ("@{MATIAS_REYES} (72-year-old Mexican man, thin, dark-brown skin, short white curly hair, a white mustache, a white embroidered guayabera, a red bandana around his neck)")
ISM = ("@{ISMAEL_REYES} (26-year-old Mexican man, brown skin, short curly black hair, light stubble, a plain light-blue cotton shirt with rolled sleeves)")
LOR = ("@{LORENA_OCHOA} (40-year-old Mexican woman, light skin, long straight highlighted light-brown hair, big gold earrings, red lipstick, an elegant white off-shoulder dress)")
CRI = ("@{CRISTINA_AGUIRRE} (68-year-old elegant Mexican matriarch, light-brown skin, silver hair in a bun with a red flower, a black embroidered dress with a black lace shawl)")
#@INCLUDE funcs1
# Bordes: Lorena o Cristina le hablan a Matías/Ismael -> espalda LEFT; Matías o Ismael les hablan -> espalda RIGHT.
MAT_B = "@{MATIAS_REYES} seen from behind (short white curly hair, white guayabera, the knot of a red bandana)"
ISM_B = "@{ISMAEL_REYES} seen from behind (short curly black hair, light-blue cotton shirt)"
LOR_B = "@{LORENA_OCHOA} seen from behind (long straight highlighted hair, white off-shoulder dress)"
CRI_B = "@{CRISTINA_AGUIRRE} seen from behind (silver hair in a bun with a red flower, black lace shawl)"
#@INCLUDE funcs2
#@INCLUDE d8
ML = "standing on the LEFT behind his wooden stall of jaranas"            # Matías
IL = "standing on the LEFT beside the jarana stall"                       # Ismael
LR = "standing on the RIGHT in the plaza, fanning herself"                # Lorena
CR = "standing on the RIGHT in the plaza"                                 # Cristina

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Lorena YA hablando abanicándose frente al puesto; Matías de espaldas (LEFT). Plazo: antes de que salga la procesión.
 ("c01", D8("c01"), S("c01", "Lorena", f"Medium close-up of {LOR} {YARD0}, {LR}, talking from the very first frame, arrogant and bossy, she points at the stall with her closed fan", MAT_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {LOR} {YARD}, {LR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Matías", f"Close-up of {MAT} {YARD0}, {ML}, calm and proud, holding {JARANA}", LOR_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {MAT} {YARD}, {ML}, calm and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, a cold smile, she looks at the jaranas with disdain", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {ISM} {YARD}, {IL}, already in place tuning a jarana, he stops and steps forward, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young man in a light-blue shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Ismael", f"Close-up of {ISM} {YARD0}, {IL}, firm and protective", LOR_B, "RIGHT", "firm, protective",
     f"Close-up of {ISM} {YARD}, {IL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Lorena", f"Close-up of {LOR} {YARD0}, {LR}, offended, she snaps her fan shut", ISM_B, "LEFT", "offended, cold",
     f"Close-up of {LOR} {YARD}, {LR}, offended", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with red nails and gold bracelets slowly knocks {JARANA} off the wooden stall and it falls onto the cobblestones; only the hand, the stall and the jarana, no face. No dialogue."),
 ("c06", 6, S("c06", "Matías", f"Close-up of {MAT} {YARD0}, {ML}, his eyes shine, calm and serious, he looks down at the fallen jarana", LOR_B, "RIGHT", "calm, serious, low",
     f"Close-up of {MAT} {YARD}, {ML}, his eyes shine, calm and serious", "RIGHT")),
 ("c07", 6, talk("c07", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, she laughs and fans herself, mocking", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of an elegant dark car stopping slowly on a cobblestone street with brightly painted colonial houses with arcades in Tlacotalpan, Veracruz, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {CRI} {YARD}, {CR}, already standing in place, she slowly opens her black fan, elegant, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('elderly woman in black lace')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Cristina", f"Close-up of {CRI} {YARD0}, {CR}, warm and respectful, a small smile", MAT_B, "LEFT", "warm, respectful, calm",
     f"Close-up of {CRI} {YARD}, {CR}, warm and respectful", "LEFT")),
 ("c09", 6, talk("c09", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, she turns, pale and nervous, she stops fanning", "RIGHT"), "surprised, nervous")),
 ("c10", D8("c10"), (talk("c10", "Cristina", two(f"{MAT} on the LEFT holding the fallen jarana and {CRI} on the RIGHT, facing each other beside the stall {YARD0}, framed from the waist up; "
     f"Cristina, moved, touches the jarana, slightly closer to the camera and in sharper focus") + " " + MOUTH("Cristina", "Matías"), "moved, soft"),
   talk("c10", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, moved, her eyes shine", "LEFT"), "moved, soft"))),
 ("c11", 6, talk("c11", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, nervous, a forced smile", "RIGHT"), "nervous, pleading")),
 ("c12", D8("c12"), talk("c12", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, cold and final, she points at the jarana with her closed fan", "RIGHT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {LOR} {YARD}, bending down in her white dress, she picks up the jarana from the cobblestones and holds it out, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman in a white dress')}. No dialogue."),
 ("c13", 6, S("c13", "Ismael", f"Close-up of {ISM} {YARD0}, {IL}, grateful, a small shy smile", CRI_B, "RIGHT", "grateful, shy",
     f"Close-up of {ISM} {YARD}, {IL}, grateful", "RIGHT")),
 ("c14", D8("c14"), S("c14", "Cristina", f"Close-up of {CRI} {YARD0}, {CR}, she looks at the young man carefully, curious and moved", ISM_B, "LEFT", "curious, moved, slow",
     f"Close-up of {CRI} {YARD}, {CR}, curious and moved", "LEFT")),
 ("c15", 6, talk("c15", "Ismael", one(f"Close-up of {ISM} {YARD}, {IL}, polite, a little confused", "RIGHT"), "polite, confused")),
 ("c16", D8("c16"), talk("c16", "Lorena", one(f"Close-up of {LOR} {YARD}, {LR}, holding the jarana, a sudden spiteful smile", "RIGHT"), "spiteful, sly")),
 ("r4", 6, one(f"Close-up of {MAT} {YARD}, {ML}, in silence, he closes his eyes and lowers his head, guilty", "RIGHT") + " Slow push-in. No dialogue."),
 ("c17", 6, talk("c17", "Cristina", one(f"Close-up of {CRI} {YARD}, {CR}, stunned, her fan trembles in her hand, her eyes shine", "LEFT"), "stunned, emotional")),
 # CTA con carisma (después del BLACK): Cristina sola, a cámara
 ("c18", 10, talk("c18", "Cristina", f"Close-up from the chest up of {CRI} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, opens her black fan slowly, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small mysterious half smile. Nobody else around.",
     "charismatic, elegant, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Doña Cristina no compra baratijas, viejo.", "Doña Cristina no compra cosas así, don."), ("Y sus jaranas viejas afean la plaza.", "Y sus jaranas no van con la fiesta."),
        ("knocks", "moves"), ("falls onto the cobblestones", "rests on the cobblestones"), ("humiliated", "quiet"), ("spiteful", "small"), ("stunned", "surprised"),
        ("trembles", "stops"), ("offended", "surprised"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in a colorful colonial plaza in Tlacotalpan, Veracruz, during a festival, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colorful colonial plaza with a stall of handmade guitars in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MATIAS_REYES}", "a thin elderly Mexican man with white curly hair, a white mustache, a white guayabera and a red bandana"),
         ("@{ISMAEL_REYES}", "a young Mexican man in his twenties with short curly black hair and a light-blue cotton shirt"),
         ("@{LORENA_OCHOA}", "a Mexican woman around forty with long highlighted hair, gold earrings and an elegant white off-shoulder dress"),
         ("@{CRISTINA_AGUIRRE}", "an elegant elderly Mexican woman with a silver bun with a red flower, a black dress and a black lace shawl"),
         (" @{LOC_PLAZATLACOTALPAN}", "")]
#@INCLUDE tail

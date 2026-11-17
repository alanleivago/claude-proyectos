"""Genera los clips de pan-comala PARTE 1 (El Pan de Comala, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la abuela manda llamar al patrón -> plazo invertido -> giro familiar): en una panadería de Comala, Colima, Toño (35), hombre de don Horacio,
se niega a pagar el pan, se lo tira al suelo a Matilde (30) y le da plazo "antes de que cierre la feria"; la abuela Clemencia (78) manda llamar a Horacio (55): ella le dio de comer cuando
dormía en la plaza. Plazo invertido. Giro: Clemencia es la madre de Horacio; lo dejó en la iglesia cuando era muy joven.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (panadería): Matilde y Clemencia a la IZQUIERDA (mostrador y horno); Toño y Horacio a la DERECHA (del lado de la puerta a la calle).
YARD0 = ("inside a traditional bakery in Comala, Colima @{LOC_PANADERIA} in the morning: a big wood-fired brick oven, wicker baskets full of Mexican sweet bread, a long wooden counter, "
         "white walls, an open door to a cobblestone street with white houses, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
BREAD = "a wicker basket full of Mexican sweet bread"
PHONE = "a smartphone"
MAT = ("@{MATILDE_RUELAS} (30-year-old Mexican woman, light-brown skin, curly black hair tied under a white bandana, a red t-shirt under a white baker's apron dusted with flour)")
CLE = ("@{CLEMENCIA_RUELAS} (78-year-old Mexican grandmother, small, brown wrinkled skin, short curly white hair, a navy-blue dress with small white flowers, a white apron)")
TON = ("@{TONO_BECERRA} (35-year-old Mexican man, stocky, light-brown skin, a short black beard, a plain black cap, a grey sleeveless hoodie, a gold chain)")
HOR = ("@{HORACIO_VALDEZ} (55-year-old Mexican man, tall, light-brown skin, slicked-back grey hair, grey stubble, a black suit with an open black shirt, a gold watch)")
#@INCLUDE funcs1
# Bordes: Toño u Horacio le hablan a Matilde/Clemencia -> espalda LEFT; Matilde o Clemencia les hablan -> espalda RIGHT.
MAT_B = "@{MATILDE_RUELAS} seen from behind (curly black hair under a white bandana, red t-shirt, apron strings)"
CLE_B = "@{CLEMENCIA_RUELAS} seen from behind (short curly white hair, navy-blue dress with small white flowers, small)"
TON_B = "@{TONO_BECERRA} seen from behind (plain black cap, grey sleeveless hoodie, stocky)"
HOR_B = "@{HORACIO_VALDEZ} seen from behind (slicked-back grey hair, black suit jacket, tall)"
#@INCLUDE funcs2
#@INCLUDE d8
ML = "standing on the LEFT behind the wooden counter"                    # Matilde
CL = "standing on the LEFT beside the wood-fired oven"                   # Clemencia
TR = "standing on the RIGHT in front of the counter, chewing a piece of bread"   # Toño
HR = "standing on the RIGHT just inside the open door"                   # Horacio

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Toño YA hablando, comiendo pan sin pagar frente al mostrador; Matilde de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Toño", f"Medium close-up of {TON} {YARD0}, {TR}, talking from the very first frame, arrogant, mouth half full", MAT_B, "LEFT", "arrogant, mocking, bossy",
     f"Medium close-up of {TON} {YARD}, {TR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Matilde", f"Close-up of {MAT} {YARD0}, {ML}, firm and tired, she puts both hands on the counter", TON_B, "RIGHT", "firm, tired, brave",
     f"Close-up of {MAT} {YARD}, {ML}, firm and tired", "RIGHT")),
 ("c03", 6, talk("c03", "Toño", one(f"Close-up of {TON} {YARD}, {TR}, he stops chewing, a cold smile", "LEFT"), "cold, mocking")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a gold chain bracelet slowly tips {BREAD} off the wooden counter and the bread rolls across the floor; only the hand, the basket and the bread, no face. No dialogue."),
 ("r1", 6, f"Medium shot of {CLE} {YARD}, {CL}, already in place, she stops kneading by the oven and turns, serious and calm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('elderly woman in a navy dress')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Clemencia", f"Close-up of {CLE} {YARD0}, {CL}, calm and firm, flour on her hands", TON_B, "RIGHT", "calm, firm, slow",
     f"Close-up of {CLE} {YARD}, {CL}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Toño", f"Close-up of {TON} {YARD0}, {TR}, he laughs once with contempt", CLE_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {TON} {YARD}, {TR}, he laughs once", "LEFT")),
 ("c06", 6, S("c06", "Clemencia", f"Close-up of {CLE} {YARD0}, {CL}, completely calm, a small knowing look", TON_B, "RIGHT", "calm, knowing, slow",
     f"Close-up of {CLE} {YARD}, {CL}, completely calm", "RIGHT")),
 ("c07", 6, talk("c07", "Toño", one(f"Close-up of {TON} {YARD}, {TR}, holding {PHONE} to his ear, laughing, mocking", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two black SUVs stopping slowly on a cobblestone street with white houses and red clay tile roofs in Comala, Colima, a volcano far away, morning light; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {HOR} {YARD}, {HR}, already standing in place, he slowly takes off his black hat and holds it against his chest, moved and respectful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black suit')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Horacio", f"Close-up of {HOR} {YARD0}, {HR}, holding his black hat, moved, his eyes shine, a small smile", CLE_B, "LEFT", "moved, warm, low",
     f"Close-up of {HOR} {YARD}, {HR}, holding his hat, moved", "LEFT")),
 ("c09", 6, talk("c09", "Toño", one(f"Close-up of {TON} {YARD}, {TR}, he turns around, pale and surprised, he takes off his cap", "RIGHT"), "surprised, nervous")),
 ("c10", D8("c10"), talk("c10", "Horacio", one(f"Close-up of {HOR} {YARD}, {HR}, cold and serious, he looks at his man", "RIGHT"), "cold, serious, slow")),
 ("c11", 6, talk("c11", "Toño", one(f"Close-up of {TON} {YARD}, {TR}, nervous, holding his cap in both hands", "RIGHT"), "nervous, pleading")),
 ("c12", D8("c12"), talk("c12", "Horacio", one(f"Close-up of {HOR} {YARD}, {HR}, he points slowly at the bread on the floor, cold and final", "RIGHT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {TON} {YARD}, kneeling on the bakery floor, he picks up the sweet bread piece by piece and puts it back in the wicker basket, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a black cap')}. No dialogue."),
 ("c13", D8("c13"), S("c13", "Matilde", f"Close-up of {MAT} {YARD0}, {ML}, grateful and curious", HOR_B, "RIGHT", "grateful, curious, soft",
     f"Close-up of {MAT} {YARD}, {ML}, grateful and curious", "RIGHT")),
 ("c14", D8("c14"), (talk("c14", "Clemencia", two(f"{CLE} on the LEFT and {HOR} on the RIGHT, in profile facing each other beside the oven {YARD0}, framed from the waist up; "
     f"Clemencia steps closer and speaks low, her eyes shine, slightly closer to the camera and in sharper focus") + " " + MOUTH("Clemencia", "Horacio"), "low, emotional, slow"),
   talk("c14", "Clemencia", one(f"Close-up of {CLE} {YARD}, {CL}, low and emotional, her eyes shine", "RIGHT"), "low, emotional, slow"))),
 ("c15", D8("c15"), S("c15", "Horacio", f"Close-up of {HOR} {YARD0}, {HR}, confused, his voice soft", CLE_B, "LEFT", "confused, soft",
     f"Close-up of {HOR} {YARD}, {HR}, confused, his voice soft", "LEFT")),
 ("c16", D8("c16"), S("c16", "Clemencia", f"Close-up of {CLE} {YARD0}, {CL}, tears in her eyes, she holds his hand", HOR_B, "RIGHT", "emotional, broken, soft",
     f"Close-up of {CLE} {YARD}, {CL}, her eyes shine, emotional", "RIGHT")),
 ("r4", 6, one(f"Close-up of {HOR} {YARD}, {HR}, in silence, stunned, his eyes fill with tears, the hat slips in his hands", "LEFT") + " Slow push-in. No dialogue."),
 ("c17", 6, talk("c17", "Matilde", one(f"Close-up of {MAT} {YARD}, {ML}, stunned, she covers her mouth with one hand then lowers it", "RIGHT"), "stunned, soft")),
 # CTA con carisma (después del BLACK): Horacio solo, a cámara
 ("c18", 10, talk("c18", "Horacio", f"Close-up from the chest up of {HOR} {YARD}, alone, holding his black hat, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, wipes one eye with his thumb, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small bittersweet half smile. Nobody else around.",
     "charismatic, emotional, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Al cabo usted ya ni para hornear sirve.", "Usted ya está muy cansada."), ("Te dejé en la iglesia cuando yo era muy joven.", "Te dejé en la iglesia porque no tenía nada."),
        ("tips", "moves"), ("rolls across the floor", "rests on the floor"), ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"),
        ("stunned", "surprised"), ("his eyes fill with tears", "his eyes shine"), ("tears in her eyes", "her eyes shine"), ("broken", "soft"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm morning light inside a traditional bakery with a wood-fired oven in Comala, Colima, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic Mexican bakery with baskets of sweet bread, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MATILDE_RUELAS}", "a Mexican woman around thirty with curly black hair under a white bandana and a white baker's apron"),
         ("@{CLEMENCIA_RUELAS}", "a small elderly Mexican woman with short curly white hair, a navy dress with white flowers and a white apron"),
         ("@{TONO_BECERRA}", "a stocky Mexican man in his thirties with a short beard, a black cap, a grey sleeveless hoodie and a gold chain"),
         ("@{HORACIO_VALDEZ}", "a tall Mexican man in his fifties with slicked-back grey hair and a black suit with an open black shirt"),
         (" @{LOC_PANADERIA}", "")]
#@INCLUDE tail

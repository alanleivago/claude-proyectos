"""Genera los clips de talavera-cholula PARTE 1 (La Talavera de Cholula, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado del modelo 7704056500502793502 (el patrón acusa a su hombre de confianza; el traidor es su hijo), sin copiarlo: en un taller de talavera de Cholula, don Ezequiel (64) pierde
un pedido y acusa a su encargado Rubén (40); su esposa Leonor (60) encuentra que su hijo Adrián se fue. Llega el rival Fausto Cuéllar (55) con plazo "antes de que se apaguen los hornos":
tiene los papeles del taller firmados por Adrián. Sin armas, sin dinero.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio del taller): Ezequiel SIEMPRE a la IZQUIERDA junto a su mesa de piezas; Rubén, Leonor y Fausto a la DERECHA.
YARD0 = ("in the arched patio of a traditional talavera pottery workshop in San Pedro Cholula, Puebla @{LOC_TALLERTALAVERA} in the golden afternoon: shelves full of blue-and-white glazed plates and vases, "
         "a wood-fired kiln, a potter's wheel, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PLATE = "a blue-and-white talavera plate"
BOX = "a wooden box full of broken blue-and-white plate shards"
EZE = ("@{EZEQUIEL_OSORIO} (64-year-old Mexican man, heavy-set, light-brown skin, grey slicked-back hair, a thick grey mustache, a wine-red shirt under a brown suede vest, a silver ring)")
RUB = ("@{RUBEN_TAPIA} (40-year-old Mexican man, strong, brown skin, curly black hair, a short beard, a denim shirt with rolled sleeves over a white t-shirt, clay dust on his forearms)")
LEO = ("@{LEONOR_OSORIO} (60-year-old Mexican woman, light-brown skin, grey hair in a bun, gold earrings, a mustard-yellow fringed shawl over a navy-blue dress)")
FAU = ("@{FAUSTO_CUELLAR} (55-year-old Mexican man, tall and thin, light skin, dyed black hair, a black goatee, a black leather jacket over a grey shirt, a gold chain, NOT wearing sunglasses, his eyes clearly visible)")
#@INCLUDE funcs1
# Bordes: Ezequiel habla -> espalda del otro RIGHT; los demás le hablan a Ezequiel -> espalda de él LEFT.
EZE_B = "@{EZEQUIEL_OSORIO} seen from behind (grey slicked-back hair, brown suede vest over a wine-red shirt, heavy-set)"
RUB_B = "@{RUBEN_TAPIA} seen from behind (curly black hair, denim shirt)"
LEO_B = "@{LEONOR_OSORIO} seen from behind (grey hair in a bun, mustard-yellow fringed shawl)"
FAU_B = "@{FAUSTO_CUELLAR} seen from behind (dyed black hair, black leather jacket, tall and thin)"
#@INCLUDE funcs2
#@INCLUDE d8
EL = f"standing on the LEFT beside a rustic wooden table with {PLATE}"   # Ezequiel
RR = "standing on the RIGHT by the potter's wheel"                      # Rubén
LR = "standing on the RIGHT in the doorway to the house"                # Leonor
FR = "standing on the RIGHT under the patio arch"                       # Fausto

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Rubén YA hablando, recién llegado y agitado; Ezequiel de espaldas (LEFT) en su mesa.
 ("c01", D8("c01"), S("c01", "Rubén", f"Medium close-up of {RUB} {YARD0}, {RR}, talking from the very first frame, worried and urgent", EZE_B, "LEFT", "urgent, worried",
     f"Medium close-up of {RUB} {YARD}, {RR}, talking from the very first frame, worried and urgent", "LEFT")),
 ("c02", 6, S("c02", "Ezequiel", f"Close-up of {EZE} {YARD0}, {EL}, holding {PLATE}, he looks up, offended and proud", RUB_B, "RIGHT", "offended, proud, low",
     f"Close-up of {EZE} {YARD}, {EL}, holding {PLATE}, offended and proud", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a silver ring slowly puts {PLATE} down on the rustic wooden table with a small crack running through it; only the hand and the plate, no face. No dialogue."),
 ("c03", 6, talk("c03", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {EL}, cold and suspicious, his eyes narrow", "RIGHT"), "cold, suspicious, slow")),
 ("c04", 6, S("c04", "Rubén", f"Close-up of {RUB} {YARD0}, {RR}, hurt, one hand on his chest", EZE_B, "LEFT", "hurt, sincere",
     f"Close-up of {RUB} {YARD}, {RR}, hurt, one hand on his chest", "LEFT")),
 ("c05", D8("c05"), S("c05", "Ezequiel", f"Close-up of {EZE} {YARD0}, {EL}, he steps closer, his voice low and hard", RUB_B, "RIGHT", "low, hard",
     f"Close-up of {EZE} {YARD}, {EL}, his voice low and hard", "RIGHT")),
 ("r1", 6, f"Medium shot of {LEO} {YARD}, {LR}, already in place, she stops in the doorway, worried, holding the edge of her shawl, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a yellow shawl')}. Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Leonor", one(f"Close-up of {LEO} {YARD}, {LR}, worried", "LEFT"), "worried, soft")),
 ("c07", 6, talk("c07", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {EL}, firm, without looking away", "RIGHT"), "firm, urgent")),
 ("c08", 6, talk("c08", "Leonor", one(f"Close-up of {LEO} {YARD}, {LR}, holding {BOX}, scared, her eyes shine", "LEFT"), "scared, soft")),
 ("i02", 6, "Wide shot of two black SUVs stopping slowly on a cobblestone street in San Pedro Cholula, Puebla, the great pyramid with a yellow church far behind, golden afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {FAU} {YARD}, {FR}, already standing in place, he slowly takes off aviator sunglasses and smiles, calm and confident, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black leather jacket')}. Slow push-in. No dialogue."),
 ("c09", 6, S("c09", "Fausto", f"Close-up of {FAU} {YARD0}, {FR}, a confident smile, holding a leather folder", EZE_B, "LEFT", "confident, ironic",
     f"Close-up of {FAU} {YARD}, {FR}, a confident smile", "LEFT")),
 ("c10", 6, S("c10", "Ezequiel", f"Close-up of {EZE} {YARD0}, standing on the LEFT in the patio, cold and firm", FAU_B, "RIGHT", "cold, firm",
     f"Close-up of {EZE} {YARD}, standing on the LEFT in the patio, cold and firm", "RIGHT")),
 ("c11", D8("c11"), talk("c11", "Fausto", one(f"Close-up of {FAU} {YARD}, {FR}, calm and sure, he taps the leather folder", "LEFT"), "calm, sure, slow")),
 ("c12", 6, talk("c12", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {EL}, surprised, uneasy", "RIGHT"), "surprised, uneasy")),
 ("c13", D8("c13"), talk("c13", "Fausto", one(f"Close-up of {FAU} {YARD}, {FR}, he opens the folder and shows a signed paper, enjoying it", "LEFT"), "sly, slow")),
 ("r3", 6, one(f"Close-up of {EZE} {YARD}, {EL}, in silence, stunned, he closes his eyes, his jaw trembles", "RIGHT") + " Slow push-in. No dialogue."),
 ("c14", 6, (talk("c14", "Ezequiel", two(f"{EZE} on the LEFT and {RUB} on the RIGHT, in profile facing each other in the patio {YARD0}, framed from the waist up; "
     f"Ezequiel puts one hand on Rubén's shoulder, sincere and ashamed, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ezequiel", "Rubén"), "sincere, ashamed, low"),
   talk("c14", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {EL}, sincere and ashamed", "RIGHT"), "sincere, ashamed, low"))),
 ("c15", 6, S("c15", "Rubén", f"Close-up of {RUB} {YARD0}, {RR}, loyal and serious, a short nod", EZE_B, "LEFT", "loyal, serious",
     f"Close-up of {RUB} {YARD}, {RR}, loyal and serious", "LEFT")),
 ("c16", 6, talk("c16", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {EL}, broken, his eyes shine, he looks at the broken plate", "RIGHT"), "broken, low, slow")),
 # CTA con carisma (después del BLACK): Ezequiel solo, a cámara
 ("c17", 10, talk("c17", "Ezequiel", f"Close-up from the chest up of {EZE} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his grey mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small bitter half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Si me mientes, aquí se acaba tu trabajo.", "Si me mientes, ya no hay nada entre tú y yo."), ("Le vendió el taller de su abuelo al enemigo.", "Le dio el taller de su abuelo a la competencia."),
        ("¿Ustedes perdonarían a un hijo que los vende?", "¿Ustedes perdonarían a un hijo así?"), ("his voice low and hard", "his voice low"), ("enjoying it", "calm"),
        ("stunned", "surprised"), ("his jaw trembles", "quiet"), ("broken", "sad"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden afternoon in the arched patio of a talavera pottery workshop in Cholula, Puebla, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colonial pottery workshop with blue-and-white plates in central Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EZEQUIEL_OSORIO}", "a heavy-set Mexican man in his sixties with a grey mustache, a wine-red shirt and a brown suede vest"),
         ("@{RUBEN_TAPIA}", "a strong Mexican man around forty with curly black hair, a short beard and a denim shirt"),
         ("@{LEONOR_OSORIO}", "a Mexican woman around sixty with grey hair in a bun and a mustard-yellow shawl"),
         ("@{FAUSTO_CUELLAR}", "a tall thin Mexican man in his fifties with a black goatee and a black leather jacket"),
         (" @{LOC_TALLERTALAVERA}", "")]
#@INCLUDE tail

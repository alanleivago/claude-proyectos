"""Genera los clips de silla-izamal PARTE 1 (La Silla de Izamal, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #14 "El esposo que no camina" [CAPO], cierre tipo 4 (el villano descubre que lo vieron): en la terraza de su hacienda henequenera en Izamal, don Jacinto (66) finge seguir en
silla de ruedas y sin entender nada tras un accidente. Su esposa Graciela (52) y el administrador Octavio (46) planean poner la hacienda a nombre de ella con su huella; la cocinera Chabela (64)
lo defiende. A solas, Jacinto le habla a Chabela, se pone de pie y llama al licenciado: "Son los dos." Graciela vuelve y lo ve de pie.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (terraza): Jacinto en su silla de ruedas al CENTRO-IZQUIERDA de espaldas a los arcos; Chabela a la IZQUIERDA; Graciela y Octavio a la DERECHA.
YARD0 = ("on the covered terrace of an old henequen hacienda near Izamal, Yucatán @{LOC_HACIENDAIZAMAL} in the afternoon: mustard-yellow walls, tall stone arches, a tiled floor, "
         "a hammock, a small wooden table, henequen agave fields beyond the arches, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CHAIR = "sitting still in an old wheelchair"
JAC = ("@{JACINTO_CERVERA} (66-year-old Mexican man, broad shoulders, light-brown skin, thick grey hair combed back, a grey mustache, a white long-sleeve guayabera, cream linen trousers)")
GRA = ("@{GRACIELA_CERVERA} (52-year-old Mexican woman, fair skin, black hair in an elegant low bun, red lipstick, pearl earrings, a fitted navy-blue dress)")
OCT = ("@{OCTAVIO_PENICHE} (46-year-old Mexican man, light skin, neat short brown hair with a side part, a trimmed brown beard, a light-grey linen shirt)")
CHA = ("@{CHABELA_CHAN} (64-year-old Mexican Mayan woman, brown skin, grey hair in a long braid, a white embroidered huipil dress with colorful flowers)")
#@INCLUDE funcs1
GRA_B = "@{GRACIELA_CERVERA} seen from behind (black hair in a low bun, fitted navy-blue dress)"
OCT_B = "@{OCTAVIO_PENICHE} seen from behind (neat short brown hair, light-grey linen shirt)"
CHA_B = "@{CHABELA_CHAN} seen from behind (grey hair in a long braid, white embroidered huipil)"
#@INCLUDE funcs2
#@INCLUDE d8
BLANK = f"{JAC} {CHAIR} in the background between them, staring blankly at nothing, motionless, mouth closed the whole shot"
GR = "standing on the RIGHT side of the terrace"
OR = "standing on the RIGHT near an arch"
CL = "standing on the LEFT by the small wooden table"
JC = f"{CHAIR} at the center of the terrace"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

def OTS3(cid, who, spk, lis_b, side, tone, one_desc, one_side):
    """OTS sobre el que escucha, con Jacinto ausente al fondo (3 personas, solo habla uno)."""
    return (talk(cid, who, f"Over-the-shoulder shot from behind {lis_b}: the listener's blurred shoulder and the back of the head fill the {side} edge of the frame in the foreground, "
                 f"out of focus, face never visible. {spk}, facing the camera three-quarters, talking to the person in the foreground; {BLANK}; only these three people, no extras. "
                 f"Only {who} speaks: {who}'s lips move clearly with every word; the others stay silent with closed mouths.", tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Graciela YA hablando, Octavio de espaldas, Jacinto ausente en su silla al fondo.
 ("c01", D8("c01"), OTS3("c01", "Graciela", f"Medium close-up of {GRA} {YARD0}, {GR}, talking from the very first frame, cold and careless, she gestures toward the man in the wheelchair", OCT_B, "LEFT", "cold, careless, low",
     f"Medium close-up of {GRA} {YARD}, {GR}, talking from the very first frame, cold and careless", "LEFT")),
 ("c02", 6, OTS3("c02", "Octavio", f"Close-up of {OCT} {YARD0}, {OR}, calculating, a small satisfied smile", GRA_B, "RIGHT", "calm, calculating, low",
     f"Close-up of {OCT} {YARD}, {OR}, calculating", "RIGHT")),
 ("c03", 6, talk("c03", "Graciela", one(f"Close-up of {GRA} {YARD}, {GR}, a cold proud smile, she touches her pearl earring", "LEFT"), "cold, proud")),
 ("r1", 6, one(f"Close-up of {JAC} {YARD}, {JC}, a blank empty stare, completely still, then his eyes move slightly to one side for an instant and go blank again", "RIGHT") + " Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Chabela", f"Close-up of {CHA} {YARD0}, {CL}, holding a tray with a cup of tea, worried and respectful", GRA_B, "RIGHT", "worried, respectful, soft",
     f"Close-up of {CHA} {YARD}, {CL}, holding a tray with a cup of tea, worried", "RIGHT")),
 ("c05", 6, S("c05", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, contemptuous, without looking at her", CHA_B, "LEFT", "contemptuous, cold",
     f"Close-up of {GRA} {YARD}, {GR}, contemptuous", "LEFT")),
 ("c06", 6, S("c06", "Octavio", f"Close-up of {OCT} {YARD0}, {OR}, worried, he lowers his voice", GRA_B, "RIGHT", "worried, low",
     f"Close-up of {OCT} {YARD}, {OR}, worried", "RIGHT")),
 ("c07", 6, S("c07", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, calm and cold, a thin smile", OCT_B, "LEFT", "calm, cold",
     f"Close-up of {GRA} {YARD}, {GR}, calm and cold", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: on the small wooden table, a printed document with an empty box for a fingerprint and an open ink pad next to it; no readable text, only the paper and the ink pad, no hands, no people. No dialogue."),
 ("c08", 6, talk("c08", "Graciela", two(f"{GRA} bending down beside {JAC} {CHAIR} {YARD0}, framed from the waist up; she kisses his forehead with a fake sweet smile and whispers, "
     f"he stares blankly ahead, motionless") + " " + MOUTH("Graciela", "Jacinto"), "falsely sweet, soft")),
 ("c09", 6, talk("c09", "Chabela", two(f"{CHA} kneeling beside {JAC} {CHAIR} {YARD0}, framed from the waist up; she holds his hand in both of hers and whispers to him, he stares blankly ahead") + " " + MOUTH("Chabela", "Jacinto"), "whispering, hopeful, emotional")),
 ("r2", 6, f"Close-up {YARD0}: the old man's hand in the wheelchair slowly squeezes the hand of the kneeling woman in the white embroidered huipil, firmly; only the two hands on the armrest of the wheelchair, no faces. No dialogue."),
 ("c10", 6, talk("c10", "Jacinto", two(f"{CHA} kneeling on the LEFT and {JAC} {CHAIR} on the RIGHT {YARD0}, framed from the waist up; his eyes come alive, he turns his head to her and speaks very low, "
     f"slightly closer to the camera and in sharper focus, she covers her mouth with one hand") + " " + MOUTH("Jacinto", "Chabela"), "very low, calm, firm")),
 ("c11", 6, talk("c11", "Chabela", one(f"Close-up of {CHA} {YARD}, kneeling, her eyes shine, one hand on her chest, amazed", "RIGHT"), "amazed, emotional, whispering")),
 ("c12", D8("c12"), talk("c12", "Jacinto", one(f"Close-up of {JAC} {YARD}, {JC}, his eyes sharp and alive now, calm and cold", "LEFT"), "calm, cold, slow")),
 ("r3", 6, f"Medium shot of {JAC} {YARD}, he slowly puts both hands on the armrests and stands up from the wheelchair, tall and steady, he straightens his guayabera; {SOLO}; {ALONE}; {NODOUBLE('man in a white guayabera')}. Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Jacinto", one(f"Close-up of {JAC} {YARD}, standing by the empty wheelchair, holding a cell phone to his ear, calm and powerful", "LEFT"), "calm, firm, low")),
 ("c14", 6, talk("c14", "Graciela", one(f"Close-up of {GRA} {YARD}, standing under an arch on the RIGHT, she has just come back for her shawl and stops, frozen, pale, staring", "LEFT"), "stunned, whispering, scared")),
 # CTA con carisma (después del BLACK): Jacinto de pie, a cámara
 ("c15", 10, talk("c15", "Jacinto", f"Close-up from the chest up of {JAC} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, rests one hand on the handle of the empty wheelchair, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small cold half smile. Nobody else around.",
     "charismatic, grave, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Quería saber quién me iba a traicionar primero.", "Quería saber quién me iba a fallar primero."), ("contemptuous", "cool"), ("calculating", "calm"),
        ("stunned", "surprised"), ("scared", "worried"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light on the arched terrace of an old henequen hacienda in Yucatán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, yellow hacienda terrace with stone arches in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{JACINTO_CERVERA}", "a broad-shouldered Mexican man in his sixties with thick grey hair combed back, a grey mustache and a white guayabera"),
         ("@{GRACIELA_CERVERA}", "an elegant Mexican woman in her fifties with black hair in a low bun, pearl earrings and a navy-blue dress"),
         ("@{OCTAVIO_PENICHE}", "a Mexican man in his forties with neat short brown hair, a trimmed brown beard and a light-grey linen shirt"),
         ("@{CHABELA_CHAN}", "a Mexican Mayan woman in her sixties with grey hair in a long braid and a white embroidered huipil dress"),
         (" @{LOC_HACIENDAIZAMAL}", "")]
#@INCLUDE tail

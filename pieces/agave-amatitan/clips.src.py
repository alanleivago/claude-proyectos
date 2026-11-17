"""Genera los clips de agave-amatitan PARTE 1 (El Agave de Amatitán, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega el dueño poderoso -> plazo invertido -> el salvador es el enemigo): en los campos de agave de Amatitán, Jalisco, la licenciada Mariela (36),
gerente de la tequilera, despide al viejo jimador don Tobías (66), pisa el sombrero de su padre y le da plazo "antes de que se acabe la temporada"; su hija Lupe (30) lo defiende.
Llega el dueño, don Leandro (72): plazo invertido. Giro: Tobías rechaza su ayuda; el padre de Leandro se quedó con esas tierras con un papel falso, y Tobías tiene el verdadero.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (campo de agave junto al camino): Tobías y Lupe a la IZQUIERDA (entre los surcos); Mariela y Leandro a la DERECHA (del lado del camino de tierra).
YARD0 = ("in a blue agave field in Amatitán, Jalisco @{LOC_AGAVEAMATITAN} in the late afternoon: rows of spiky blue agave plants on red earth, a pile of harvested agave hearts beside a dirt road, "
         "green hills behind, warm golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HAT = "an old worn straw hat"
TOB = ("@{TOBIAS_CORONA} (66-year-old Mexican man, lean and strong, dark-brown weathered skin, short grey hair, a thick white mustache, a white long-sleeve cotton work shirt)")
LUP = ("@{LUPE_CORONA} (30-year-old Mexican woman, brown skin, a long black braid, a light-pink long-sleeve work shirt with rolled sleeves)")
MAR = ("@{MARIELA_ZEPEDA} (36-year-old Mexican businesswoman, light skin, black hair in a sleek high ponytail, red lipstick, a white blazer over a black top, sunglasses on her head)")
LEA = ("@{LEANDRO_ESCALANTE} (72-year-old elegant Mexican man, light skin, silver hair, a neat silver goatee, a cream panama hat, a navy-blue linen suit with a white shirt)")
#@INCLUDE funcs1
# Bordes: Mariela o Leandro le hablan a Tobías/Lupe -> espalda LEFT; Tobías o Lupe les hablan -> espalda RIGHT.
TOB_B = "@{TOBIAS_CORONA} seen from behind (short grey hair, white long-sleeve cotton work shirt, lean)"
LUP_B = "@{LUPE_CORONA} seen from behind (a long black braid, light-pink work shirt)"
MAR_B = "@{MARIELA_ZEPEDA} seen from behind (black sleek high ponytail, white blazer)"
LEA_B = "@{LEANDRO_ESCALANTE} seen from behind (cream panama hat, navy-blue linen suit jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
TL = "standing on the LEFT between rows of blue agave"                 # Tobías
UL = "standing on the LEFT beside a pile of harvested agave hearts"     # Lupe
MR = "standing on the RIGHT at the edge of the dirt road, holding a clipboard"   # Mariela
ER = "standing on the RIGHT on the dirt road"                          # Leandro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Mariela YA hablando con su tabla en la mano; Tobías de espaldas (LEFT). Plazo: antes de que se acabe la temporada.
 ("c01", D8("c01"), S("c01", "Mariela", f"Medium close-up of {MAR} {YARD0}, {MR}, talking from the very first frame, cold and bossy, she taps the clipboard with a pen", TOB_B, "LEFT", "cold, bossy, arrogant",
     f"Medium close-up of {MAR} {YARD}, {MR}, talking from the very first frame, cold and bossy", "LEFT")),
 ("c02", D8("c02"), S("c02", "Tobías", f"Close-up of {TOB} {YARD0}, {TL}, holding {HAT} in his hands, calm and proud", MAR_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {TOB} {YARD}, {TL}, holding {HAT}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Mariela", one(f"Close-up of {MAR} {YARD}, {MR}, a cold smile, she shrugs", "LEFT"), "cold, mocking")),
 ("r1", 6, f"Medium shot of {LUP} {YARD}, {UL}, already in place, she drops an agave heart on the pile, wipes her hands and steps forward, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman with a black braid')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Lupe", f"Close-up of {LUP} {YARD0}, {UL}, firm and protective", MAR_B, "RIGHT", "firm, protective",
     f"Close-up of {LUP} {YARD}, {UL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Mariela", f"Close-up of {MAR} {YARD0}, {MR}, offended, she raises an eyebrow", LUP_B, "LEFT", "offended, cold",
     f"Close-up of {MAR} {YARD}, {MR}, offended", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {HAT} lies on the red dusty earth and a white sneaker slowly steps on its brim; only the shoe and the hat, no face. No dialogue."),
 ("c06", 6, S("c06", "Tobías", f"Close-up of {TOB} {YARD0}, {TL}, his eyes shine, hurt but dignified, he looks down at the hat", MAR_B, "RIGHT", "hurt, dignified",
     f"Close-up of {TOB} {YARD}, {TL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Mariela", one(f"Close-up of {MAR} {YARD}, {MR}, mocking, she puts her sunglasses on", "LEFT"), "mocking, cruel")),
 ("i02", 6, "Wide shot of two dark SUVs driving slowly along a dusty dirt road between endless rows of blue agave in Amatitán, Jalisco, golden afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {LEA} {YARD}, {ER}, already standing in place, a dark SUV behind him, he slowly takes off dark sunglasses, elegant and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a panama hat')}. Slow push-in. No dialogue."),
 ("c08", D8("c08"), talk("c08", "Leandro", one(f"Close-up of {LEA} {YARD}, {ER}, serious, he frowns at the hat on the ground", "RIGHT"), "serious, cold, slow")),
 ("c09", 6, talk("c09", "Mariela", one(f"Close-up of {MAR} {YARD}, {MR}, she quickly takes off her sunglasses, a nervous polite smile", "RIGHT"), "nervous, polite")),
 ("c10", D8("c10"), talk("c10", "Leandro", one(f"Close-up of {LEA} {YARD}, {ER}, indignant and cold, he points at the old man", "RIGHT"), "indignant, cold")),
 ("c11", 6, talk("c11", "Mariela", one(f"Close-up of {MAR} {YARD}, {MR}, pale and nervous", "RIGHT"), "nervous, pleading")),
 ("c12", D8("c12"), talk("c12", "Leandro", one(f"Close-up of {LEA} {YARD}, {ER}, cold and final", "RIGHT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {MAR} {YARD}, she bends down in her white blazer, picks up {HAT} from the dust and brushes it off, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman in a white blazer')}. No dialogue."),
 ("c13", 6, S("c13", "Lupe", f"Close-up of {LUP} {YARD0}, {UL}, grateful, a small relieved smile", LEA_B, "RIGHT", "grateful, warm",
     f"Close-up of {LUP} {YARD}, {UL}, grateful", "RIGHT")),
 ("c14", 6, S("c14", "Leandro", f"Close-up of {LEA} {YARD0}, {ER}, warm and generous, a friendly smile", TOB_B, "LEFT", "warm, generous",
     f"Close-up of {LEA} {YARD}, {ER}, warm, a friendly smile", "LEFT")),
 ("c15", 6, S("c15", "Tobías", f"Close-up of {TOB} {YARD0}, {TL}, holding his straw hat again, cold and serious, his eyes hard", LEA_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {TOB} {YARD}, {TL}, cold and serious", "RIGHT")),
 ("c16", 6, talk("c16", "Leandro", one(f"Close-up of {LEA} {YARD}, {ER}, confused, his smile fades", "LEFT"), "confused, defensive")),
 ("c17", D8("c17"), (talk("c17", "Tobías", two(f"{TOB} on the LEFT and {LEA} on the RIGHT, in profile facing each other between the agave rows {YARD0}, framed from the waist up; "
     f"Tobías steps closer and speaks low and firm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Tobías", "Leandro"), "low, firm, slow"),
   talk("c17", "Tobías", one(f"Close-up of {TOB} {YARD}, {TL}, low and firm", "RIGHT"), "low, firm, slow"))),
 ("r4", 6, one(f"Close-up of {LEA} {YARD}, {ER}, in silence, stunned, his face pale, he slowly lowers his sunglasses", "LEFT") + " Slow push-in. No dialogue."),
 ("c18", 6, S("c18", "Lupe", f"Close-up of {LUP} {YARD0}, {UL}, surprised, she turns to her father", TOB_B, "LEFT", "surprised, soft",
     f"Close-up of {LUP} {YARD}, {UL}, surprised", "LEFT")),
 # CTA con carisma (después del BLACK): Tobías solo, a cámara
 ("c19", 10, talk("c19", "Tobías", f"Close-up from the chest up of {TOB} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, puts his old straw hat on, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small proud half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Por eso mismo, ya está viejo.", "Por eso mismo, ya está cansado."), ("Tu padre se quedó con estas tierras con un papel falso.", "Tu padre se quedó con estas tierras con un papel que no era."),
        ("slowly steps on its brim", "rests beside it"), ("humiliated", "quiet"), ("stunned", "surprised"), ("his face pale", "quiet"), ("indignant and cold", "serious"),
        ("powerful", "serious"), ("offended", "surprised"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden late-afternoon light in a blue agave field in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rows of blue agave on red earth in western Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TOBIAS_CORONA}", "a lean elderly Mexican man with dark weathered skin, a thick white mustache and a white long-sleeve work shirt"),
         ("@{LUPE_CORONA}", "a Mexican woman around thirty with a long black braid and a light-pink work shirt"),
         ("@{MARIELA_ZEPEDA}", "a Mexican businesswoman in her thirties with a sleek black ponytail, red lipstick and a white blazer"),
         ("@{LEANDRO_ESCALANTE}", "an elegant elderly Mexican man with a silver goatee, a cream panama hat and a navy-blue linen suit"),
         (" @{LOC_AGAVEAMATITAN}", "")]
#@INCLUDE tail

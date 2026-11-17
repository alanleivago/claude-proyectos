"""Genera los clips de pinata-acolman PARTE 1 (La Piñata de Acolman, MAJESTIC STORIES, navideña) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre-hijos-herencia transformada (ranking2) con tema de Navidad: en Nochebuena, en un taller de piñatas de Acolman, la nuera Yesenia (42) le hace la maleta a don Pascual (76) para mandarlo
al asilo "antes de que empiece la posada" y su hijo Emilio (45) dice que ya firmó. Llega la licenciada Eugenia (60), notaria, por las piñatas de la posada del barrio: la firma es falsa.
Giro: quien falsificó la firma fue su propio hijo Emilio.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio del taller): Pascual a la IZQUIERDA junto a su mesa de piñatas (luego con Eugenia a su lado); Yesenia y Emilio a la DERECHA, junto a la puerta de la casa.
YARD0 = ("in the patio of a family piñata workshop in Acolman, State of Mexico @{LOC_PATIOPINATAS} on Christmas Eve night: colorful seven-pointed star piñatas hanging from strings, "
         "warm string lights and paper lanterns, a long wooden table with paper and glue pots, an adobe house with a wooden door; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CASE = "an old brown suitcase"
PAS = ("@{PASCUAL_ROJAS} (76-year-old Mexican man, small and thin, brown wrinkled skin, white hair, round glasses, a white mustache, a beige knitted cardigan over a plaid shirt)")
EMI = ("@{EMILIO_ROJAS} (45-year-old Mexican man, light-brown skin, short black hair with a receding hairline, clean-shaven, a navy-blue quilted vest over a light-blue shirt)")
YES = ("@{YESENIA_PINEDA} (42-year-old Mexican woman, light skin, straight dyed burgundy hair, heavy makeup, a red Christmas sweater with white snowflakes)")
EUG = ("@{EUGENIA_SALAS} (60-year-old elegant Mexican woman, light-brown skin, short grey hair, gold-rimmed glasses, a camel wool coat over a black turtleneck, a red scarf)")
#@INCLUDE funcs1
# Bordes: Yesenia o Emilio le hablan a Pascual/Eugenia -> espalda LEFT; Pascual o Eugenia les hablan -> espalda RIGHT.
PAS_B = "@{PASCUAL_ROJAS} seen from behind (white hair, beige knitted cardigan, small and thin)"
EMI_B = "@{EMILIO_ROJAS} seen from behind (short black hair, navy-blue quilted vest)"
YES_B = "@{YESENIA_PINEDA} seen from behind (straight burgundy hair, red Christmas sweater)"
EUG_B = "@{EUGENIA_SALAS} seen from behind (short grey hair, camel wool coat, red scarf)"
#@INCLUDE funcs2
#@INCLUDE d8
PL = f"standing on the LEFT beside the wooden table of piñatas, {CASE} at his feet"    # Pascual
GL = "standing on the LEFT in the patio"                                                # Eugenia
YR = "standing on the RIGHT by the wooden door of the house, holding a folder of papers"   # Yesenia
ER = "standing on the RIGHT by the wooden door of the house"                            # Emilio

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Yesenia YA hablando junto a la puerta, con la maleta del suegro a sus pies; Pascual de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Yesenia", f"Medium close-up of {YES} {YARD0}, {YR}, talking from the very first frame, cold and bossy, the old suitcase next to the old man", PAS_B, "LEFT", "cold, bossy, smug",
     f"Medium close-up of {YES} {YARD}, {YR}, talking from the very first frame, cold and bossy", "LEFT")),
 ("c02", D8("c02"), S("c02", "Pascual", f"Close-up of {PAS} {YARD0}, {PL}, hurt but dignified, glue on his fingers", YES_B, "RIGHT", "hurt, dignified, slow",
     f"Close-up of {PAS} {YARD}, {PL}, hurt but dignified", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Yesenia", one(f"Close-up of {YES} {YARD}, {YR}, a cold smile, she rolls her eyes", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {EMI} {YARD}, {ER}, already in place, he comes out of the wooden door and stops, uncomfortable, avoiding his father's eyes, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy vest')}. Slow push-in. No dialogue."),
 ("c04", D8("c04"), S("c04", "Pascual", f"Close-up of {PAS} {YARD0}, {PL}, his eyes shine behind his glasses, he looks at his son", EMI_B, "RIGHT", "hurt, soft, sad",
     f"Close-up of {PAS} {YARD}, {PL}, his eyes shine", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Emilio", f"Close-up of {EMI} {YARD0}, {ER}, uncomfortable, he looks down", PAS_B, "LEFT", "uncomfortable, quick",
     f"Close-up of {EMI} {YARD}, {ER}, uncomfortable", "LEFT")),
 ("c06", 6, talk("c06", "Pascual", one(f"Close-up of {PAS} {YARD}, {PL}, firm and calm, he raises his steady hand", "RIGHT"), "firm, calm, slow")),
 ("i01", 6, f"Close-up insert {YARD0}: a colorful seven-pointed star piñata hanging under the warm string lights, slowly turning, a small nativity scene below; only the piñata and the lights, no people. No dialogue."),
 ("r2", 6, f"Medium shot of {EUG} {YARD}, {GL}, already standing in place near the gate of the patio, she looks at the piñatas with a warm smile, elegant, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a camel coat')}. Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Eugenia", one(f"Close-up of {EUG} {YARD}, {GL}, warm and polite, she adjusts her red scarf", "RIGHT"), "warm, polite")),
 ("c08", D8("c08"), (talk("c08", "Pascual", two(f"{PAS} on the LEFT and {EUG} on the RIGHT, facing each other under the hanging piñatas {YARD0}, framed from the waist up; "
     f"Pascual, glad but sad, slightly closer to the camera and in sharper focus") + " " + MOUTH("Pascual", "Eugenia"), "glad, soft"),
   talk("c08", "Pascual", one(f"Close-up of {PAS} {YARD}, {PL}, glad but sad", "RIGHT"), "glad, soft"))),
 ("c09", 6, talk("c09", "Eugenia", one(f"Close-up of {EUG} {YARD}, {GL}, surprised, she looks down at the suitcase", "RIGHT"), "surprised, concerned")),
 ("c10", 6, talk("c10", "Pascual", one(f"Close-up of {PAS} {YARD}, {PL}, tired and humble, a sad small smile", "RIGHT"), "tired, humble")),
 ("c11", D8("c11"), S("c11", "Eugenia", f"Close-up of {EUG} {YARD0}, {GL}, firm and professional, she holds out her hand for the papers", YES_B, "RIGHT", "firm, professional",
     f"Close-up of {EUG} {YARD}, {GL}, firm and professional", "RIGHT")),
 ("c12", 6, S("c12", "Yesenia", f"Close-up of {YES} {YARD0}, {YR}, nervous, she holds the folder against her chest", EUG_B, "LEFT", "nervous, defensive",
     f"Close-up of {YES} {YARD}, {YR}, nervous", "LEFT")),
 ("c13", D8("c13"), talk("c13", "Eugenia", one(f"Close-up of {EUG} {YARD}, {GL}, holding a paper and looking at it through her glasses, then looking up, cold and sure", "RIGHT"), "cold, sure, slow")),
 ("r3", 6, one(f"Close-up of {YES} {YARD}, {YR}, in silence, pale, she presses her lips together and glances at her husband", "LEFT") + " Slow push-in. No dialogue."),
 ("c14", 6, S("c14", "Pascual", f"Close-up of {PAS} {YARD0}, {PL}, serious and firm, his eyes hard behind his glasses", YES_B, "RIGHT", "serious, firm",
     f"Close-up of {PAS} {YARD}, {PL}, serious and firm", "RIGHT")),
 ("c15", D8("c15"), talk("c15", "Yesenia", one(f"Close-up of {YES} {YARD}, {YR}, a sudden spiteful smile, she points with her chin at her husband", "LEFT"), "spiteful, sly")),
 ("r4", 6, one(f"Close-up of {PAS} {YARD}, {PL}, in silence, stunned, he slowly takes off his glasses, his eyes fill with tears", "RIGHT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Emilio", one(f"Close-up of {EMI} {YARD}, {ER}, ashamed, his voice breaking", "LEFT"), "ashamed, pleading")),
 # CTA con carisma (después del BLACK): Pascual solo, a cámara
 ("c17", 10, talk("c17", "Pascual", f"Close-up from the chest up of {PAS} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, puts his round glasses back on, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("¿Ustedes qué harían con un hijo que falsifica su firma?", "¿Ustedes qué harían con un hijo así?"), ("Esta firma no es de don Pascual.", "Esta no es la firma de don Pascual."),
        ("spiteful", "small"), ("stunned", "surprised"), ("his eyes fill with tears", "his eyes shine"), ("his voice breaking", "softly"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm string lights in the patio of a piñata workshop on Christmas Eve in Acolman, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican Christmas posada patio with colorful star piñatas and lanterns, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{PASCUAL_ROJAS}", "a small thin elderly Mexican man with white hair, round glasses, a white mustache and a beige knitted cardigan"),
         ("@{EMILIO_ROJAS}", "a Mexican man in his forties with a receding hairline and a navy-blue quilted vest"),
         ("@{YESENIA_PINEDA}", "a Mexican woman in her forties with burgundy hair, heavy makeup and a red Christmas sweater"),
         ("@{EUGENIA_SALAS}", "an elegant Mexican woman around sixty with short grey hair, gold glasses, a camel coat and a red scarf"),
         (" @{LOC_PATIOPINATAS}", "")]
#@INCLUDE tail

"""Genera los clips de copita-matatlan PARTE 1 (El Catador de Matatlán, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #1 "El catador" [CAPO] (identidad oculta), cierre tipo 1 (entra un personaje inesperado): en la feria del mezcal de Santiago Matatlán, el productor de moda Iker (35) y su novia
Daniela (30) se burlan de don Teófilo (74), un viejo callado que prueba sus copitas y le dice que al mezcal le apuraron el horno. Iker presume que renta la loma de Las Ánimas "a un viejo
que ni se aparece". Llega su compradora más importante, Brígida (52), y saluda al viejo: "¡Don Teófilo!". Él: "Desde hoy, que no corten ni una piña de su lado."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (puesto): Iker y Daniela detrás del mostrador a la DERECHA; Teófilo frente al mostrador a la IZQUIERDA; Brígida llega por la IZQUIERDA.
YARD0 = ("at a mezcal fair stall in Santiago Matatlán, Oaxaca @{LOC_FERIAMATATLAN} at midday: a rustic wooden counter with clay cups and unlabeled glass bottles of mezcal, colorful papel picado "
         "without letters overhead, agave fields and dry hills beyond, bright sun; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
NIC = ("@{TEOFILO_RUIZ} (74-year-old Zapotec Mexican man, deep brown weathered skin, short white hair, a thin white mustache, a worn palm-leaf hat, a simple white cotton shirt)")
IKE = ("@{IKER_LASCURAIN} (35-year-old Mexican man, light skin, styled brown hair with short sides, a short trimmed beard, a beige linen shirt with open collar, a thin silver chain)")
DAN = ("@{DANIELA_MORA} (30-year-old Mexican woman, fair skin, long straight dyed-blond hair, big sunglasses pushed up on her head, a white linen blouse)")
BRI = ("@{BRIGIDA_ORTEGA} (52-year-old Mexican woman, light-brown skin, short black hair, red lipstick, large silver earrings, a black blazer over a colorful embroidered Oaxacan blouse)")
#@INCLUDE funcs1
TEO_B = "@{TEOFILO_RUIZ} seen from behind (worn palm-leaf hat, white cotton shirt)"
IKE_B = "@{IKER_LASCURAIN} seen from behind (styled brown hair, beige linen shirt)"
DAN_B = "@{DANIELA_MORA} seen from behind (long straight dyed-blond hair, white linen blouse)"
#@INCLUDE funcs2
#@INCLUDE d8
NL = "standing on the LEFT in front of the wooden counter, a small clay cup in his hand"
IR = "standing on the RIGHT behind the wooden counter"
DR = "standing on the RIGHT behind the counter next to Iker, a cell phone in her hand"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Iker YA hablando, burlón, Teófilo de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Iker", f"Medium close-up of {IKE} {YARD0}, {IR}, talking from the very first frame, mocking, he pulls a clay cup away from the counter", TEO_B, "LEFT", "mocking, arrogant, loud",
     f"Medium close-up of {IKE} {YARD}, {IR}, talking from the very first frame, mocking", "LEFT")),
 ("c02", 6, S("c02", "Teófilo", f"Close-up of {NIC} {YARD0}, {NL}, he smells the clay cup calmly, unbothered, a tiny smile", IKE_B, "RIGHT", "calm, slow, wise",
     f"Close-up of {NIC} {YARD}, {NL}, calm, smelling the clay cup", "RIGHT")),
 ("c03", 6, S("c03", "Daniela", f"Close-up of {DAN} {YARD0}, {DR}, laughing with disdain, rolling her eyes", TEO_B, "LEFT", "disdainful, laughing",
     f"Close-up of {DAN} {YARD}, {DR}, laughing with disdain", "LEFT")),
 ("c04", D8("c04"), S("c04", "Iker", f"Close-up of {IKE} {YARD0}, {IR}, proud, he taps a bottle on the counter", TEO_B, "LEFT", "proud, condescending",
     f"Close-up of {IKE} {YARD}, {IR}, proud", "LEFT")),
 ("c05", 6, S("c05", "Teófilo", f"Close-up of {NIC} {YARD0}, {NL}, he looks up from under his hat, curious and calm", IKE_B, "RIGHT", "calm, curious, low",
     f"Close-up of {NIC} {YARD}, {NL}, curious and calm", "RIGHT")),
 ("c06", 6, S("c06", "Iker", f"Close-up of {IKE} {YARD0}, {IR}, careless, shrugging, a smug laugh", TEO_B, "LEFT", "careless, smug",
     f"Close-up of {IKE} {YARD}, {IR}, careless and smug", "LEFT")),
 ("r1", 6, one(f"Close-up of {NIC} {YARD}, {NL}, a slow knowing smile under the white mustache, he gently puts the clay cup down on the counter", "RIGHT") + " Slow push-in. No dialogue."),
 ("c07", 6, S("c07", "Daniela", f"Close-up of {DAN} {YARD0}, {DR}, impatient, she waves one hand dismissively", TEO_B, "LEFT", "impatient, rude",
     f"Close-up of {DAN} {YARD}, {DR}, impatient", "LEFT")),
 ("c08", 6, S("c08", "Teófilo", f"Close-up of {NIC} {YARD0}, {NL}, he touches the brim of his palm hat politely, serene", DAN_B, "RIGHT", "serene, polite, calm",
     f"Close-up of {NIC} {YARD}, {NL}, serene", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Iker", f"Close-up of {IKE} {YARD0}, {IR}, he points away with his chin, then smooths his shirt, looking past the old man", TEO_B, "LEFT", "dismissive, excited",
     f"Close-up of {IKE} {YARD}, {IR}, dismissive", "LEFT")),
 # Entrada inesperada: Brígida saluda al viejo con respeto
 ("c10", 6, talk("c10", "Brígida", two(f"{BRI} on the RIGHT and {NIC} on the LEFT {YARD0}, framed from the waist up, both already in place; she takes his hand in both of hers with great respect and surprise, "
     f"slightly closer to the camera and in sharper focus") + " " + MOUTH("Brígida", "Teófilo"), "surprised, respectful, warm")),
 ("r2", 6, one(f"Close-up of {IKE} {YARD}, {IR}, his smile freezes and disappears, he goes pale, mouth slightly open, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Teófilo", f"Close-up of {NIC} {YARD0}, {NL}, calm and firm, now with quiet authority, he does not look at the young man", "@{BRIGIDA_ORTEGA} seen from behind (short black hair, black blazer)", "RIGHT", "calm, firm, authoritative",
     f"Close-up of {NIC} {YARD}, {NL}, calm and authoritative", "RIGHT")),
 # CTA con carisma (después del BLACK): Teófilo a cámara
 ("c12", 10, talk("c12", "Teófilo", f"Close-up from the chest up of {NIC} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, touches the brim of his palm hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small wise smile. Nobody else around.",
     "charismatic, calm, wise, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("mocking", "amused"), ("arrogant", "proud"), ("disdainful", "amused"), ("rude", "impatient"), ("condescending", "proud"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, bright midday sun at a rustic mezcal fair stall in Oaxaca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, outdoor mezcal fair in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TEOFILO_RUIZ}", "an old Zapotec Mexican man with deep brown skin, white hair, a thin white mustache, a worn palm-leaf hat and a white cotton shirt"),
         ("@{IKER_LASCURAIN}", "a trendy Mexican man in his thirties with styled brown hair, a short beard, a beige linen shirt and a thin silver chain"),
         ("@{DANIELA_MORA}", "a Mexican woman around thirty with long dyed-blond hair, sunglasses on her head and a white linen blouse"),
         ("@{BRIGIDA_ORTEGA}", "a Mexican woman in her fifties with short black hair, red lipstick, silver earrings and a black blazer over an embroidered blouse"),
         (" @{LOC_FERIAMATATLAN}", "")]
#@INCLUDE tail

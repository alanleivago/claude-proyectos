"""Genera los clips de queso-tequisquiapan PARTE 1 (El Queso de Tequisquiapan, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada que la villana no cree -> llega el patrón -> giro familiar): en Tequisquiapan, Querétaro, Vanesa (38), esposa del ranchero
Fulgencio, le corta la leche a doña Petra (72), le tira los quesos y le da plazo "antes de que suenen las campanas". Petra le manda saludos a su marido; Fulgencio llega en persona.
Giro: Petra es su esposa (nunca se divorciaron) y Nicanor (45), el hijo callado de Petra, es su primer hijo.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (quesería bajo el portal): Petra y Nicanor a la IZQUIERDA (mostrador y tina); Vanesa y Fulgencio a la DERECHA (del lado de la plaza).
YARD0 = ("in a small artisan cheese shop under a stone arcade in Tequisquiapan, Querétaro @{LOC_QUESERIA} in the morning: a wooden counter with rounds of fresh white cheese, metal milk cans, "
         "a big steel vat with curd, cheesecloths hanging, a cobblestone square with pink bougainvillea behind, soft morning light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PHONE = "a smartphone"
PET = ("@{PETRA_OLVERA} (72-year-old Mexican woman, small, brown skin, white hair in a long braid, small gold earrings, a light-blue checkered apron over a dark-green dress)")
NIC = ("@{NICANOR_OLVERA} (45-year-old Mexican man, stocky, brown skin, short black hair, a round gentle face, a plain white t-shirt, a white rubber work apron)")
VAN = ("@{VANESA_UGALDE} (38-year-old glamorous Mexican woman, light skin, long straight black hair, red lipstick, big sunglasses on her head, a fuchsia silk blouse, white jeans)")
FUL = ("@{FULGENCIO_ARVIZU} (72-year-old Mexican man, tall, light-brown skin, white hair, a short white beard, a grey felt cowboy hat, a tan suede jacket over a white shirt)")
#@INCLUDE funcs1
# Bordes: Vanesa o Fulgencio le hablan a Petra/Nicanor -> espalda LEFT; Petra o Nicanor les hablan -> espalda RIGHT.
PET_B = "@{PETRA_OLVERA} seen from behind (white hair in a long braid, the strings of a light-blue checkered apron over a dark-green dress, small)"
NIC_B = "@{NICANOR_OLVERA} seen from behind (short black hair, white t-shirt, stocky)"
VAN_B = "@{VANESA_UGALDE} seen from behind (long straight black hair, fuchsia silk blouse)"
FUL_B = "@{FULGENCIO_ARVIZU} seen from behind (grey felt cowboy hat, tan suede jacket, tall)"
#@INCLUDE funcs2
#@INCLUDE d8
PL = "standing on the LEFT behind the wooden counter of fresh cheeses"          # Petra
NL = "standing on the LEFT beside the steel vat of curd"                         # Nicanor
VR = "standing on the RIGHT in front of the counter, on the side of the square"  # Vanesa
FR = "standing on the RIGHT under the stone arcade, the square behind him"       # Fulgencio

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Vanesa YA hablando frente al mostrador; Petra de espaldas (LEFT). Plazo: antes de que suenen las campanas.
 ("c01", D8("c01"), S("c01", "Vanesa", f"Medium close-up of {VAN} {YARD0}, {VR}, talking from the very first frame, arrogant, she taps a metal milk can with her long nails", PET_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {VAN} {YARD}, {VR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Petra", f"Close-up of {PET} {YARD0}, {PL}, calm and proud, she wipes her hands on her apron", VAN_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {PET} {YARD}, {PL}, calm and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, a cold smile, she lowers her sunglasses", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {NIC} {YARD}, {NL}, already in place stirring the curd with a long wooden paddle, he stops and looks up, serious and shy, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a white apron')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Nicanor", f"Close-up of {NIC} {YARD0}, {NL}, shy but firm", VAN_B, "RIGHT", "shy, firm, soft",
     f"Close-up of {NIC} {YARD}, {NL}, shy but firm", "RIGHT")),
 ("c05", 6, S("c05", "Vanesa", f"Close-up of {VAN} {YARD0}, {VR}, she laughs once with contempt", NIC_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {VAN} {YARD}, {VR}, she laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with red nails slowly tips a wooden tray of fresh round white cheeses off the edge of the counter and they fall onto the stone floor; only the hand, the tray and the cheeses, no face. No dialogue."),
 ("c06", 6, S("c06", "Petra", f"Close-up of {PET} {YARD0}, {PL}, her eyes shine, indignant but dignified", VAN_B, "RIGHT", "hurt, firm",
     f"Close-up of {PET} {YARD}, {PL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, she shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, one(f"Close-up of {PET} {YARD}, {PL}, in silence, she looks down at the cheeses on the floor, then slowly raises her eyes with a small calm knowing smile", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", D8("c08"), S("c08", "Petra", f"Close-up of {PET} {YARD0}, {PL}, calm, a small knowing smile", VAN_B, "RIGHT", "calm, knowing, slow",
     f"Close-up of {PET} {YARD}, {PL}, calm, a small knowing smile", "RIGHT")),
 ("c09", 6, talk("c09", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, holding {PHONE} to her ear, laughing and mocking", "LEFT"), "mocking, amused")),
 ("c10", 6, talk("c10", "Fulgencio", f"Close-up of {FUL} sitting in the back seat of a dark SUV, holding {PHONE} to his ear, his face changes from bored to shocked and serious, "
     f"the only person in the shot; {ONE}.", "shocked, serious, firm")),
 ("i02", 6, "Wide shot of two dark SUVs arriving slowly on a cobblestone street with colorful colonial houses and a stone arcade in Tequisquiapan, Querétaro, soft morning light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {FUL} {YARD}, {FR}, already standing in place, he slowly takes off his grey felt hat, moved and serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a tan suede jacket')}. Slow push-in. No dialogue."),
 ("c11", 6, S("c11", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, holding his hat against his chest, moved, his eyes shine", PET_B, "LEFT", "moved, low, slow",
     f"Close-up of {FUL} {YARD}, {FR}, holding his hat, moved", "LEFT")),
 ("c12", 6, S("c12", "Petra", f"Close-up of {PET} {YARD0}, {PL}, calm and firm, without emotion", FUL_B, "RIGHT", "calm, firm, dry",
     f"Close-up of {PET} {YARD}, {PL}, calm and firm", "RIGHT")),
 ("c13", 6, talk("c13", "Fulgencio", one(f"Close-up of {FUL} {YARD}, {FR}, cold and serious, he looks at his young wife", "RIGHT"), "cold, serious, firm")),
 ("c14", 6, talk("c14", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, she laughs in disbelief, arrogant", "LEFT"), "arrogant, disbelieving")),
 ("c15", 6, talk("c15", "Fulgencio", one(f"Close-up of {FUL} {YARD}, {FR}, very calm and cold, his voice low", "RIGHT"), "calm, cold, low")),
 ("r4", 6, one(f"Close-up of {VAN} {YARD}, {VR}, in silence, her smile freezes and disappears, stunned, her mouth half open", "LEFT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Vanesa", one(f"Close-up of {VAN} {YARD}, {VR}, stunned, a nervous laugh", "LEFT"), "stunned, nervous")),
 ("c17", D8("c17"), S("c17", "Petra", f"Close-up of {PET} {YARD0}, {PL}, calm and sure, a hint of a smile", VAN_B, "RIGHT", "calm, sure, slow",
     f"Close-up of {PET} {YARD}, {PL}, calm and sure", "RIGHT")),
 ("c18", 6, (talk("c18", "Fulgencio", two(f"{NIC} on the LEFT beside the steel vat and {FUL} on the RIGHT, in profile facing each other under the stone arcade {YARD0}, framed from the waist up; "
     f"Fulgencio looks at him with shining eyes, slightly closer to the camera and in sharper focus") + " " + MOUTH("Fulgencio", "Nicanor"), "moved, low, proud"),
   talk("c18", "Fulgencio", one(f"Close-up of {FUL} {YARD}, {FR}, moved, his eyes shine", "LEFT"), "moved, low, proud"))),
 ("c19", 6, S("c19", "Nicanor", f"Close-up of {NIC} {YARD0}, {NL}, stunned, he turns to his mother", PET_B, "LEFT", "stunned, small, soft",
     f"Close-up of {NIC} {YARD}, {NL}, stunned", "LEFT")),
 # CTA con carisma (después del BLACK): Petra sola, a cámara
 ("c20", 10, talk("c20", "Petra", f"Close-up from the chest up of {PET} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, moves her braid over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small wise half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Ya está acostumbrada a agacharse.", "Usted sabe hacerlo."), ("Sin leche, usted no es nadie.", "Sin leche, usted no tiene nada."),
        ("Su boda no vale nada.", "Su boda no cuenta."), ("Ni loca, Fulgencio.", "Eso nunca, Fulgencio."), ("Treinta años de abandono", "treinta años de ausencia"),
        ("tips", "moves"), ("fall onto the stone floor", "rest on the floor"), ("with contempt", "coldly"), ("contemptuous", "cool"),
        ("stunned", "surprised"), ("shocked", "surprised"), ("her mouth half open", "quiet"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft morning light in a small cheese shop under a stone arcade in Tequisquiapan, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic artisan cheese shop with fresh white cheeses in central Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{PETRA_OLVERA}", "a small elderly Mexican woman with a long white braid and a light-blue checkered apron over a green dress"),
         ("@{NICANOR_OLVERA}", "a stocky Mexican man in his forties with a round gentle face, a white t-shirt and a white rubber apron"),
         ("@{VANESA_UGALDE}", "a glamorous Mexican woman in her late thirties with long straight black hair, red lipstick and a fuchsia blouse"),
         ("@{FULGENCIO_ARVIZU}", "a tall elderly Mexican man with a short white beard, a grey felt cowboy hat and a tan suede jacket"),
         (" @{LOC_QUESERIA}", "")]
#@INCLUDE tail

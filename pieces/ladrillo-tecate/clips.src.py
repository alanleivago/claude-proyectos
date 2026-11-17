"""Genera los clips de ladrillo-tecate PARTE 1 (El Ladrillo de Tecate, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la figura de poder estaba ahí de incógnito -> plazo invertido -> giro familiar): en una ladrillera de Tecate, Santiago (33), hijo de un constructor,
le tira el ladrillo a don Clemente (72) y le da plazo "antes de que se enfríe el horno"; el peón Teófilo (45), que lleva un mes trabajando ahí, hace una llamada: es "Don Teo", el que manda en Tecate.
Giro: Teo vino a buscar al hombre que embarazó a su madre Rosa hace 45 años... y es Clemente, su padre.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio de la ladrillera): de izquierda a derecha Clemente (junto a las hileras de adobe), Teófilo (junto a la pila de lodo y los moldes), Santiago (a la DERECHA junto a su camioneta).
YARD0 = ("in an artisan brick kiln yard in Tecate, Baja California @{LOC_LADRILLERA} in the late afternoon: rows of fresh adobe bricks drying on the ground, tall stacks of red fired bricks, "
         "a big old brick kiln with light smoke, dry rocky hills behind, golden dusty light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PHONE = "an old small phone"
CLE = ("@{CLEMENTE_ARCE} (72-year-old Mexican man, tall and thin, sunburned light-brown skin, thin white hair, a short white beard, a faded denim long-sleeve shirt with clay dust, a wide straw hat)")
TEO = ("@{TEOFILO_MEDINA} (45-year-old Mexican man, strong build, brown skin, short black hair with grey temples, a thick black mustache, a worn grey long-sleeve work shirt with mud stains, "
       "a plain faded green cap)")
SAN = ("@{SANTIAGO_DELVALLE} (33-year-old Mexican man, light skin, styled light-brown hair, a trimmed beard, a light-blue linen shirt, white chinos, an expensive watch)")
#@INCLUDE funcs1
# Bordes: orden C - T | S. Santiago le habla a Clemente/Teo -> espalda LEFT; Clemente o Teo le hablan a Santiago -> espalda RIGHT;
# Clemente le habla a Teo -> espalda de Teo RIGHT; Teo le habla a Clemente -> espalda de Clemente LEFT.
CLE_B = "@{CLEMENTE_ARCE} seen from behind (wide straw hat, faded denim shirt, tall and thin)"
TEO_B = "@{TEOFILO_MEDINA} seen from behind (plain faded green cap, worn grey work shirt, strong shoulders)"
SAN_B = "@{SANTIAGO_DELVALLE} seen from behind (styled light-brown hair, light-blue linen shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
CL = "standing on the LEFT beside rows of drying adobe bricks"                    # Clemente
TL = "standing beside a mud pit with wooden brick molds"                           # Teófilo
SR = "standing on the RIGHT beside a shiny grey pickup truck"                      # Santiago

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Santiago YA hablando junto a su camioneta; Clemente de espaldas (LEFT). Plazo: antes de que se enfríe el horno.
 ("c01", D8("c01"), S("c01", "Santiago", f"Medium close-up of {SAN} {YARD0}, {SR}, talking from the very first frame, arrogant, he looks around the yard with disdain", CLE_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {SAN} {YARD}, {SR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Clemente", f"Close-up of {CLE} {YARD0}, {CL}, firm and proud, dust on his face", SAN_B, "RIGHT", "firm, proud, slow",
     f"Close-up of {CLE} {YARD}, {CL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Santiago", one(f"Close-up of {SAN} {YARD}, {SR}, a mocking smile, he glances at the worker", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {TEO} {YARD}, {TL}, already in place pressing mud into a wooden brick mold, he stops, wipes his hands and slowly straightens up, calm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a green cap')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Teófilo", f"Close-up of {TEO} {YARD0}, {TL}, calm and respectful, his eyes steady", SAN_B, "RIGHT", "calm, respectful, firm",
     f"Close-up of {TEO} {YARD}, {TL}, calm, his eyes steady", "RIGHT")),
 ("c05", 6, S("c05", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, he laughs once with contempt", TEO_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {SAN} {YARD}, {SR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a brown loafer slowly pushes over a neat row of fresh adobe bricks and they fall and crack on the dusty ground; only the shoe and the bricks, no face. No dialogue."),
 ("c06", 6, S("c06", "Clemente", f"Close-up of {CLE} {YARD0}, {CL}, indignant, his eyes shine, he gestures at the cracked bricks", SAN_B, "RIGHT", "indignant, hurt",
     f"Close-up of {CLE} {YARD}, {CL}, indignant, his eyes shine", "RIGHT")),
 ("c07", 6, talk("c07", "Santiago", one(f"Close-up of {SAN} {YARD}, {SR}, he dusts off his hands, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {TEO} {YARD}, {TL}, calm, he takes {PHONE} out of his shirt pocket and dials one number with his thumb, his eyes cold and steady, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Teófilo", one(f"Close-up of {TEO} {YARD}, {TL}, holding {PHONE} to his ear, calm and commanding, his voice low", "RIGHT"), "calm, commanding, low")),
 ("c09", 6, S("c09", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, mocking, he shakes his head", TEO_B, "LEFT", "mocking, amused",
     f"Close-up of {SAN} {YARD}, {SR}, mocking", "LEFT")),
 ("i02", 6, "Wide shot of three black SUVs driving slowly in a line along a dusty dirt road between rocky hills and boulders in Tecate, Baja California, golden afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {TEO} {YARD}, {TL}, black SUVs parked far behind him, he slowly takes off his faded cap and stands tall, calm and powerful, his whole presence changes, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey work shirt')}. Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Santiago", one(f"Close-up of {SAN} {YARD}, {SR}, his smile gone, pale and surprised", "LEFT"), "surprised, nervous")),
 ("c11", D8("c11"), S("c11", "Teófilo", f"Close-up of {TEO} {YARD0}, {TL}, holding his cap, cold and serious", SAN_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {TEO} {YARD}, {TL}, holding his cap, cold and serious", "RIGHT")),
 ("c12", 6, talk("c12", "Santiago", one(f"Close-up of {SAN} {YARD}, {SR}, nervous, a forced smile, he raises both palms", "LEFT"), "nervous, pleading")),
 ("c13", D8("c13"), talk("c13", "Teófilo", one(f"Close-up of {TEO} {YARD}, {TL}, he gestures slowly toward the cracked bricks on the ground, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {SAN} {YARD}, kneeling on the dusty ground in his white chinos, he picks up cracked adobe bricks one by one and stacks them again, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a light-blue shirt')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Clemente", f"Close-up of {CLE} {YARD0}, {CL}, amazed and confused, he looks at the worker", TEO_B, "RIGHT", "amazed, confused, slow",
     f"Close-up of {CLE} {YARD}, {CL}, amazed and confused", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Teófilo", f"Close-up of {TEO} {YARD0}, {TL}, serious, his voice softer, his eyes shine a little", CLE_B, "LEFT", "serious, soft, slow",
     f"Close-up of {TEO} {YARD}, {TL}, serious, his voice softer", "LEFT")),
 ("c16", D8("c16"), talk("c16", "Clemente", one(f"Close-up of {CLE} {YARD}, {CL}, surprised, a distant memory in his eyes", "RIGHT"), "surprised, low, remembering")),
 ("c17", D8("c17"), (talk("c17", "Teófilo", two(f"{CLE} on the LEFT and {TEO} on the RIGHT, in profile facing each other beside the drying bricks {YARD0}, framed from the waist up; "
     f"Teófilo steps closer and speaks low, serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Teófilo", "Clemente"), "low, serious, slow"),
   talk("c17", "Teófilo", one(f"Close-up of {TEO} {YARD}, {TL}, low and serious", "LEFT"), "low, serious, slow"))),
 ("c18", 6, talk("c18", "Clemente", one(f"Close-up of {CLE} {YARD}, {CL}, stunned, his voice small", "RIGHT"), "stunned, small, slow")),
 ("c19", 6, S("c19", "Teófilo", f"Close-up of {TEO} {YARD0}, {TL}, his eyes shine, a small trembling smile", CLE_B, "LEFT", "moved, soft, slow",
     f"Close-up of {TEO} {YARD}, {TL}, his eyes shine", "LEFT")),
 # CTA con carisma (después del BLACK): Teófilo solo, a cámara
 ("c20", 10, talk("c20", "Teófilo", f"Close-up from the chest up of {TEO} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, puts his faded cap back on, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("La corrió su papá cuando supo que estaba embarazada.", "Su papá la mandó lejos cuando supo que esperaba un hijo."), ("¿Embarazada?", "¿Un hijo?"),
        ("¿Usted es el que manda en Tecate?", "¿Usted es don Teo, el de Tecate?"), ("Tú regrésate a tu lodo.", "Tú regresa a tu trabajo."),
        ("pushes over", "moves"), ("crack", "rest"), ("cracked", "fallen"), ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"),
        ("stunned", "surprised"), ("commanding", "serious"), ("powerful", "serious"), ("trembling", "small"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden dusty afternoon in an artisan brick kiln yard in Baja California, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, brick kiln yard with rows of drying adobe bricks in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CLEMENTE_ARCE}", "a tall thin elderly Mexican man with a short white beard, a faded denim shirt and a wide straw hat"),
         ("@{TEOFILO_MEDINA}", "a strong Mexican man in his forties with a thick black mustache, a worn grey work shirt and a faded green cap"),
         ("@{SANTIAGO_DELVALLE}", "a light-skinned Mexican man in his thirties with a trimmed beard and a light-blue linen shirt"),
         (" @{LOC_LADRILLERA}", "")]
#@INCLUDE tail

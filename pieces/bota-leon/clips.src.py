"""Genera los clips de bota-leon PARTE 1 (La Bota de León, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> llega la figura de poder -> plazo invertido -> el salvador también es amenaza): en un taller de botas de León, Guanajuato, Óscar (40),
dueño de una curtiduría, le corta el cuero a Leticia (32) y le da plazo "antes de que acabe la feria" para quedarse con los moldes de su difunto padre; le tira unas botas de encargo.
Llega el dueño del encargo, don Rodrigo (68), que levantó la curtiduría de Óscar: plazo invertido. Giro: el taller siempre estuvo a nombre de Rodrigo, y ahora viene por los moldes.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (taller): Leticia y don Ramón a la IZQUIERDA (mesas de trabajo); Óscar y Rodrigo a la DERECHA (Rodrigo entra por la puerta a la calle).
YARD0 = ("inside a traditional boot workshop in León, Guanajuato @{LOC_TALLERBOTAS} in the afternoon: long wooden workbenches with pieces of brown leather, wooden shoe lasts, "
         "shelves full of handmade cowboy boots, tanned hides on the wall, an open door to a colonial street, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
BOOTS = "a pair of new handmade brown cowboy boots"
LET = ("@{LETICIA_TADEO} (32-year-old Mexican woman, light-brown skin, dark curly hair in a low bun, small gold hoop earrings, a black t-shirt, a brown leather work apron)")
RAM = ("@{RAMON_ESTRADA} (70-year-old Mexican man, bald on top with a white fringe of hair, thick black-rimmed glasses, a white mustache, a grey work shirt, a worn dark leather apron)")
OSC = ("@{OSCAR_RENTERIA} (40-year-old Mexican man, tall, light skin, slicked-back dark-blond hair, clean-shaven, a cognac leather jacket over a black t-shirt, a gold watch)")
ROD = ("@{RODRIGO_BARCENAS} (68-year-old elegant Mexican man, light-brown skin, silver hair, a thick silver mustache, a cream felt cowboy hat, a grey wool suit with a black bolo tie)")
#@INCLUDE funcs1
# Bordes: Óscar o Rodrigo le hablan a Leticia/Ramón -> espalda LEFT; Leticia o Ramón les hablan -> espalda RIGHT.
LET_B = "@{LETICIA_TADEO} seen from behind (dark curly hair in a low bun, black t-shirt, the strings of a brown leather apron)"
RAM_B = "@{RAMON_ESTRADA} seen from behind (bald head with a white fringe of hair, grey work shirt)"
OSC_B = "@{OSCAR_RENTERIA} seen from behind (slicked-back dark-blond hair, cognac leather jacket, tall)"
ROD_B = "@{RODRIGO_BARCENAS} seen from behind (cream felt cowboy hat, grey wool suit jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
LL = "standing on the LEFT behind a wooden workbench with pieces of leather"     # Leticia
RL = "sitting on the LEFT at a back workbench with a hammer and a shoe last"     # Ramón
RS = "standing on the LEFT beside a back workbench"                              # Ramón de pie
OR = "standing on the RIGHT, leaning on the end of the workbench"                # Óscar
DR = "standing on the RIGHT just inside the open door to the street"             # Rodrigo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Óscar YA hablando, recargado en la mesa con una bota en la mano; Leticia de espaldas (LEFT). Plazo: antes de que acabe la feria.
 ("c01", D8("c01"), S("c01", "Óscar", f"Medium close-up of {OSC} {YARD0}, {OR}, talking from the very first frame, arrogant, turning a leather boot in his hand with disdain", LET_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {OSC} {YARD}, {OR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Leticia", f"Close-up of {LET} {YARD0}, {LL}, firm and proud, she puts both hands flat on the bench", OSC_B, "RIGHT", "firm, proud",
     f"Close-up of {LET} {YARD}, {LL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Óscar", one(f"Close-up of {OSC} {YARD}, {OR}, a cold smile, he tilts his head", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {RAM} {YARD}, {RL}, already in place hammering a sole, he stops, lowers the hammer and looks up over his glasses, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in glasses')}. Slow push-in. No dialogue."),
 ("c04", D8("c04"), S("c04", "Ramón", f"Close-up of {RAM} {YARD0}, {RS}, calm and firm, he takes off his glasses", OSC_B, "RIGHT", "calm, firm, slow",
     f"Close-up of {RAM} {YARD}, {RS}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Óscar", f"Close-up of {OSC} {YARD0}, {OR}, he laughs once with contempt", RAM_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {OSC} {YARD}, {OR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a gold watch slowly pushes {BOOTS} off the edge of the wooden workbench and they fall onto the dusty floor; only the hand, the bench and the boots, no face. No dialogue."),
 ("c06", 6, S("c06", "Leticia", f"Close-up of {LET} {YARD0}, {LL}, her eyes shine, indignant, she gestures down at the boots on the floor", OSC_B, "RIGHT", "hurt, indignant",
     f"Close-up of {LET} {YARD}, {LL}, her eyes shine, indignant", "RIGHT")),
 ("c07", 6, talk("c07", "Óscar", one(f"Close-up of {OSC} {YARD}, {OR}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("i02", 6, "Wide shot of two black SUVs stopping slowly in a narrow colonial street with colorful facades in León, Guanajuato, warm afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {ROD} {YARD}, {DR}, already standing in place, he slowly takes off dark sunglasses, elegant, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cream cowboy hat')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Rodrigo", f"Close-up of {ROD} {YARD0}, {DR}, polite and warm, he touches the brim of his hat", LET_B, "LEFT", "polite, warm, calm",
     f"Close-up of {ROD} {YARD}, {DR}, polite and warm", "LEFT")),
 ("c09", 6, S("c09", "Leticia", f"Close-up of {LET} {YARD0}, {LL}, holding {BOOTS} against her chest, ashamed and sad", ROD_B, "RIGHT", "sad, humble",
     f"Close-up of {LET} {YARD}, {LL}, holding {BOOTS}, sad", "RIGHT")),
 ("c10", 6, talk("c10", "Óscar", one(f"Close-up of {OSC} {YARD}, {OR}, he turns around, his smile gone, pale and nervous", "RIGHT"), "surprised, nervous")),
 ("c11", D8("c11"), talk("c11", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {DR}, cold and serious, he looks at the younger man", "LEFT"), "cold, serious, slow")),
 ("c12", 6, talk("c12", "Óscar", one(f"Close-up of {OSC} {YARD}, {OR}, nervous, a forced smile, he raises both palms", "RIGHT"), "nervous, pleading")),
 ("c13", D8("c13"), talk("c13", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {DR}, he points slowly at the boots, cold and final", "LEFT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {OSC} {YARD}, kneeling on the dusty floor of the workshop, he wipes a brown cowboy boot with a cloth, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a cognac leather jacket')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Leticia", f"Close-up of {LET} {YARD0}, {LL}, grateful, a small relieved smile", ROD_B, "RIGHT", "grateful, warm",
     f"Close-up of {LET} {YARD}, {LL}, grateful, a small relieved smile", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Rodrigo", f"Close-up of {ROD} {YARD0}, {DR}, his smile fades slowly, his eyes become cold", LET_B, "LEFT", "calm, cold, slow",
     f"Close-up of {ROD} {YARD}, {DR}, his smile fades, his eyes become cold", "LEFT")),
 ("c16", 6, talk("c16", "Leticia", one(f"Close-up of {LET} {YARD}, {LL}, confused, worried", "RIGHT"), "confused, worried")),
 ("c17", 6, talk("c17", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {DR}, calm and cold, completely sure", "LEFT"), "calm, cold, slow")),
 ("r4", 6, one(f"Close-up of {RAM} {YARD}, {RS}, in silence, he slowly lowers his eyes and takes off his glasses, ashamed", "RIGHT") + " Slow push-in. No dialogue."),
 ("c18", 6, (talk("c18", "Ramón", two(f"{RAM} on the LEFT and {LET} on the RIGHT, in profile facing each other beside the workbench {YARD0}, framed from the waist up; "
     f"Ramón, sad and honest, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ramón", "Leticia"), "sad, honest, low"),
   talk("c18", "Ramón", one(f"Close-up of {RAM} {YARD}, {RS}, sad and honest", "RIGHT"), "sad, honest, low"))),
 ("c19", 6, talk("c19", "Rodrigo", one(f"Close-up of {ROD} {YARD}, {DR}, he looks around the workshop slowly, a small cold smile", "LEFT"), "cold, calm, slow")),
 # CTA con carisma (después del BLACK): Leticia sola, a cámara
 ("c20", 10, talk("c20", "Leticia", f"Close-up from the chest up of {LET} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a curl behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small defiant half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Que se las lleve la basura.", "Que se las lleve otro."), ("¿Y así me pagas, tirando mis botas?", "¿Y así tratas mis botas?"),
        ("Pero el señor las tiró al suelo.", "Pero el señor las maltrató."), ("pushes", "moves"), ("fall onto the dusty floor", "rest on the floor"),
        ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"), ("his eyes become cold", "he becomes serious"), ("powerful", "serious"),
        ("defiant", "brave"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in a traditional boot workshop in León, Guanajuato, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic workshop with leather and handmade cowboy boots in central Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LETICIA_TADEO}", "a Mexican woman in her thirties with dark curly hair in a bun, a black t-shirt and a brown leather apron"),
         ("@{RAMON_ESTRADA}", "an elderly bald Mexican man with thick glasses, a white mustache and a grey work shirt"),
         ("@{OSCAR_RENTERIA}", "a tall Mexican man in his forties with slicked-back dark-blond hair and a cognac leather jacket"),
         ("@{RODRIGO_BARCENAS}", "an elegant elderly Mexican man with a silver mustache, a cream cowboy hat and a grey suit with a bolo tie"),
         (" @{LOC_TALLERBOTAS}", "")]
#@INCLUDE tail

"""Genera los clips de guitarra-paracho PARTE 1 (La Guitarra de Paracho, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos + estructura de la ref @alisorxomrb 7706249552289860896 (transformada): en la fábrica de guitarras de los Cuevas en Paracho, Michoacán, Ricardo (30), hijo del patrón, se burla de la
guitarra campeona del difunto padre de Efraín (24) y la tira al suelo; el patrón Gilberto (62) corre a Efraín; su madre Josefina (55) lo regaña; Efraín promete arreglarla y ganar el festival;
remate: Gilberto se ríe y apuesta su fábrica.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija. Fábrica: Efraín a la IZQUIERDA en su banco de trabajo; Ricardo y Gilberto a la DERECHA. Casa: Efraín IZQUIERDA, Josefina DERECHA.
YARD0 = ("inside a guitar factory workshop in Paracho, Michoacán @{LOC_FABRICAGUITARRAS} in the afternoon: rows of unfinished wooden guitars hanging from the ceiling, wooden workbenches "
         "with clamps and wood shavings, a big window to a cobblestone street, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HOME0 = ("in a humble wooden house in Paracho, Michoacán @{LOC_CASAPARACHO} at dusk: a small kitchen-patio with a wooden table, a hanging lamp, clay pots, pine-covered hills behind, warm light; "
         "no readable text, no signs, no logos")
HOME = HOME0 + "; nobody else in the background, no extras, nobody besides the person described"
GUITAR = "an old handmade classical guitar with a dark rosewood body and a decorated sound hole"
EFR = ("@{EFRAIN_CHAVEZ} (24-year-old Mexican man, light-brown skin, curly black hair, light stubble, a grey t-shirt under a denim work apron with sawdust)")
RIC = ("@{RICARDO_CUEVAS} (30-year-old Mexican man, light skin, slicked-back black hair, a thin goatee, sunglasses on his head, a white linen shirt open at the chest, a gold chain)")
GIL = ("@{GILBERTO_CUEVAS} (62-year-old Mexican man, heavy-set, light-brown skin, grey hair, a thick grey mustache, a black felt cowboy hat, a burgundy western shirt)")
JOS = ("@{JOSEFINA_CHAVEZ} (55-year-old Mexican woman, brown skin, black hair with grey strands in a low bun, a dark-green shawl over a white blouse, a checked apron)")
#@INCLUDE funcs1
# Bordes: Ricardo/Gilberto/Josefina le hablan a Efraín -> espalda de él LEFT; Efraín les habla -> espalda RIGHT.
EFR_B = "@{EFRAIN_CHAVEZ} seen from behind (curly black hair, grey t-shirt, denim apron straps)"
RIC_B = "@{RICARDO_CUEVAS} seen from behind (slicked-back black hair, white linen shirt)"
GIL_B = "@{GILBERTO_CUEVAS} seen from behind (black felt cowboy hat, burgundy western shirt, heavy-set)"
JOS_B = "@{JOSEFINA_CHAVEZ} seen from behind (black-and-grey hair in a low bun, dark-green shawl)"
#@INCLUDE funcs2
#@INCLUDE d8
EL = "standing on the LEFT at his wooden workbench"                                   # Efraín en la fábrica
RR = f"sitting on the RIGHT on the edge of a workbench, holding {GUITAR}"            # Ricardo con la guitarra
RS = "standing on the RIGHT by the workbench"                                         # Ricardo de pie
GR = "standing on the RIGHT in the middle of the workshop"                            # Gilberto
EH = "standing on the LEFT in the kitchen-patio, holding a broken guitar"             # Efraín en casa
JR = "standing on the RIGHT by the wooden table"                                      # Josefina

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ricardo YA hablando, sentado en el banco con la guitarra del padre en las manos, burlándose; Efraín de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Ricardo", f"Medium close-up of {RIC} {YARD0}, {RR}, talking from the very first frame, mocking, he strums the strings carelessly", EFR_B, "LEFT", "mocking, arrogant",
     f"Medium close-up of {RIC} {YARD}, {RR}, talking from the very first frame, mocking", "LEFT")),
 ("c02", D8("c02"), S("c02", "Efraín", f"Close-up of {EFR} {YARD0}, {EL}, worried and firm, he reaches out one hand", RIC_B, "RIGHT", "worried, firm",
     f"Close-up of {EFR} {YARD}, {EL}, worried and firm", "RIGHT")),
 ("c03", 6, talk("c03", "Ricardo", one(f"Close-up of {RIC} {YARD}, {RS}, standing up with the guitar held loosely in one hand, a cruel smile", "LEFT"), "mocking, cold")),
 ("i01", 6, f"Close-up insert {YARD0}: {GUITAR} slips from a man's hand and falls onto the wooden floor among wood shavings, the neck cracks; only the hand, the guitar and the floor, no face. No dialogue."),
 ("c04", 6, S("c04", "Efraín", f"Close-up of {EFR} {YARD0}, {EL}, his eyes fill with tears, hurt and angry but controlled", RIC_B, "RIGHT", "hurt, low, firm",
     f"Close-up of {EFR} {YARD}, {EL}, his eyes shine, hurt", "RIGHT")),
 ("r1", 6, f"Medium shot of {GIL} {YARD}, {GR}, already in place, he walks slowly in from the office, annoyed, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black cowboy hat')}. Slow push-in. No dialogue."),
 ("c05", 6, talk("c05", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GR}, annoyed, bossy", "LEFT"), "annoyed, bossy")),
 ("c06", D8("c06"), talk("c06", "Ricardo", one(f"Close-up of {RIC} {YARD}, {RS}, he turns to his father, accusing, sly", "RIGHT"), "sly, accusing")),
 ("c07", D8("c07"), S("c07", "Gilberto", f"Close-up of {GIL} {YARD0}, {GR}, offended and proud", EFR_B, "LEFT", "offended, proud, mocking",
     f"Close-up of {GIL} {YARD}, {GR}, offended and proud", "LEFT")),
 ("c08", D8("c08"), S("c08", "Efraín", f"Close-up of {EFR} {YARD0}, {EL}, respectful but firm, his eyes shine", GIL_B, "RIGHT", "respectful, firm, emotional",
     f"Close-up of {EFR} {YARD}, {EL}, respectful but firm", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Gilberto", f"Close-up of {GIL} {YARD0}, {GR}, cold and final, he points at the door", EFR_B, "LEFT", "cold, final",
     f"Close-up of {GIL} {YARD}, {GR}, cold and final", "LEFT")),
 ("r2", 6, f"Medium shot of {EFR} {YARD}, he slowly kneels, picks up the cracked guitar from the floor and holds it against his chest with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('young man in a denim apron')}. Slow push-in. No dialogue."),
 ("i02", 6, f"Wide shot of a cobblestone street in Paracho, Michoacán at dusk with small guitar shops and wooden houses: {EFR} small in the frame, walking away alone carrying a cracked guitar; seen from far away, no other people, no readable text. No dialogue."),
 ("c10", 6, S("c10", "Josefina", f"Close-up of {JOS} {HOME0}, {JR}, worried, a hand on her chest", EFR_B, "LEFT", "worried, soft",
     f"Close-up of {JOS} {HOME}, {JR}, worried", "LEFT")),
 ("c11", D8("c11"), S("c11", "Efraín", f"Close-up of {EFR} {HOME0}, {EH}, ashamed and sad", JOS_B, "RIGHT", "sad, low",
     f"Close-up of {EFR} {HOME}, {EH}, ashamed and sad", "RIGHT")),
 ("c12", D8("c12"), talk("c12", "Josefina", one(f"Close-up of {JOS} {HOME}, {JR}, upset and scared, she raises her hands", "LEFT"), "upset, scared, scolding")),
 ("c13", D8("c13"), (talk("c13", "Efraín", two(f"{EFR} on the LEFT holding the cracked guitar and {JOS} on the RIGHT by the table, facing each other {HOME0}, framed from the waist up; "
     f"Efraín, determined, slightly closer to the camera and in sharper focus") + " " + MOUTH("Efraín", "Josefina"), "determined, brave"),
   talk("c13", "Efraín", one(f"Close-up of {EFR} {HOME}, {EH}, determined", "RIGHT"), "determined, brave"))),
 ("c14", 6, talk("c14", "Josefina", one(f"Close-up of {JOS} {HOME}, {JR}, worried, she makes the sign of the cross", "LEFT"), "worried, resigned")),
 ("r3", 6, f"Medium shot {HOME}: {EFR} at the wooden table at night under the hanging lamp, carefully gluing and clamping the cracked neck of the guitar, focused, the only person in the shot. Slow push-in. No dialogue."),
 ("c15", D8("c15"), talk("c15", "Efraín", f"Close-up of {EFR} at the wooden table at night under the hanging lamp {HOME}, holding the repaired guitar, speaking softly to it, a small determined smile; "
     f"the only person in the shot; {ONE}.", "tender, soft, determined")),
 ("c16", D8("c16"), talk("c16", "Ricardo", one(f"Close-up of {RIC} sitting at a wooden table in the factory office corner {YARD}, amused, gossiping", "RIGHT"), "amused, mocking")),
 ("c17", D8("c17"), talk("c17", "Gilberto", one(f"Close-up of {GIL} sitting at a wooden table in the factory office corner {YARD}, he laughs out loud and slaps the table, mocking", "LEFT"), "mocking, laughing")),
 # CTA con carisma (después del BLACK): Efraín solo, a cámara
 ("c18", 10, talk("c18", "Efraín", f"Close-up from the chest up of {EFR} {HOME}, alone, holding the repaired guitar, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, taps the guitar body softly, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small confident half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Si tanto vale, que aguante el suelo.", "Si tanto vale, que lo demuestre."), ("Suena peor que una lata de chiles.", "Suena como lata."),
        ("the neck cracks", "it lies on the floor"), ("cracked", "damaged"), ("his eyes fill with tears, hurt and angry but controlled", "his eyes shine, sad"),
        ("a cruel smile", "a smile"), ("slaps the table", "leans back"), ("offended", "surprised"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm light in a guitar factory workshop in Paracho, Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic guitar workshop with unfinished guitars hanging, in a Mexican mountain town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EFRAIN_CHAVEZ}", "a young Mexican man in his twenties with curly black hair, a grey t-shirt and a denim work apron"),
         ("@{RICARDO_CUEVAS}", "a Mexican man around thirty with slicked-back hair, a thin goatee, a white linen shirt and a gold chain"),
         ("@{GILBERTO_CUEVAS}", "a heavy-set Mexican man in his sixties with a grey mustache, a black cowboy hat and a burgundy western shirt"),
         ("@{JOSEFINA_CHAVEZ}", "a Mexican woman in her fifties with grey-streaked hair in a bun, a green shawl and a checked apron"),
         (" @{LOC_FABRICAGUITARRAS}", ""), (" @{LOC_CASAPARACHO}", "")]
#@INCLUDE tail

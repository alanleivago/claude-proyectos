"""Genera los clips de ponche-zitacuaro PARTE 1 (El Ponche de Zitácuaro, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre que pone orden a los hijos + Navidad (humillación + plazo -> la carpeta que nadie esperaba -> plazo invertido -> giro): en Nochebuena, en el patio de su casa en Zitácuaro,
la nuera Daniela (38) desprecia el ponche de don Gilberto (72) y su hijo mayor Héctor (42) anuncia que después de Navidad la casa se vende y el papá se va al cuartito de atrás; el hijo
menor Ramiro (38) lo defiende. Gilberto saca una carpeta: la casa ya está a nombre de Ramiro. Plazo invertido: hasta el Año Nuevo para que Héctor y Daniela saquen sus cosas.
Giro: Héctor ya le había prometido la casa a un comprador, el papá de Daniela.
Copia del clips.py de sombrero-sahuayo (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio): Gilberto y Ramiro a la IZQUIERDA (olla de ponche al fuego); Héctor y Daniela a la DERECHA (mesa de la cena).
YARD0 = ("in the patio of an old family house in Zitácuaro, Michoacán @{LOC_PATIOZITACUARO} on Christmas Eve at dusk: string lights and colorful papel picado overhead, "
         "a long dinner table with a white tablecloth, a big clay pot of fruit punch on a small wood fire, poinsettias, adobe walls with arches, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
POT = "a big clay pot of hot Mexican fruit punch with guavas and cinnamon sticks"
FOLDER = "a worn brown cardboard folder with papers inside"
GIL = ("@{GILBERTO_SALGADO} (72-year-old Mexican man, thin, brown wrinkled skin, short white hair, a neat white mustache, a dark-red wool sweater over a white collared shirt)")
RAM = ("@{RAMIRO_SALGADO} (38-year-old Mexican man, brown skin, short wavy black hair, a short black beard, a green flannel shirt)")
HEC = ("@{HECTOR_SALGADO} (42-year-old Mexican man, light-brown skin, receding black hair combed back, thin metal glasses, a navy-blue blazer over a light-blue shirt)")
DAN = ("@{DANIELA_ROBLES} (38-year-old Mexican woman, fair skin, long straight caramel-blonde hair, big gold hoop earrings, a fitted emerald-green velvet dress)")
#@INCLUDE funcs1
# Bordes: Héctor o Daniela le hablan a Gilberto/Ramiro -> espalda LEFT; Gilberto o Ramiro les hablan -> espalda RIGHT.
GIL_B = "@{GILBERTO_SALGADO} seen from behind (short white hair, dark-red wool sweater, thin)"
RAM_B = "@{RAMIRO_SALGADO} seen from behind (short wavy black hair, green flannel shirt)"
HEC_B = "@{HECTOR_SALGADO} seen from behind (receding black hair combed back, navy-blue blazer)"
DAN_B = "@{DANIELA_ROBLES} seen from behind (long straight caramel-blonde hair, emerald-green velvet dress)"
#@INCLUDE funcs2
#@INCLUDE d8
GL = "standing on the LEFT beside the clay pot of punch on the fire"   # Gilberto
RL = "standing on the LEFT near the adobe arch"                         # Ramiro
HR = "standing on the RIGHT beside the dinner table"                    # Héctor
DR = "standing on the RIGHT by the dinner table"                        # Daniela

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Daniela YA hablando junto a la mesa; Gilberto de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Daniela", f"Medium close-up of {DAN} {YARD0}, {DR}, talking from the very first frame, arrogant, she wrinkles her nose at the clay pot", GIL_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {DAN} {YARD}, {DR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Gilberto", f"Close-up of {GIL} {YARD0}, {GL}, calm and hurt, holding a wooden ladle", DAN_B, "RIGHT", "calm, hurt, slow",
     f"Close-up of {GIL} {YARD}, {GL}, calm and hurt", "RIGHT")),
 ("c03", 6, S("c03", "Héctor", f"Close-up of {HEC} {YARD0}, {HR}, cold and practical, he adjusts his glasses", GIL_B, "LEFT", "cold, practical",
     f"Close-up of {HEC} {YARD}, {HR}, cold and practical", "LEFT")),
 ("r1", 6, f"Medium shot of {RAM} {YARD}, {RL}, already in place, he stops and looks up, upset and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a green flannel shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Ramiro", one(f"Close-up of {RAM} {YARD}, {RL}, upset and protective", "RIGHT"), "upset, protective")),
 ("c05", D8("c05"), S("c05", "Daniela", f"Close-up of {DAN} {YARD0}, {DR}, she laughs once, mocking", RAM_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {DAN} {YARD}, {DR}, she laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {POT} tips over on the ground by the fire and the punch with guavas spills across the floor tiles; only the pot and the punch, no face, no people. No dialogue."),
 ("c06", D8("c06"), S("c06", "Gilberto", f"Close-up of {GIL} {YARD0}, {GL}, his eyes shine, hurt but dignified", HEC_B, "RIGHT", "hurt, dignified",
     f"Close-up of {GIL} {YARD}, {GL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Héctor", one(f"Close-up of {HEC} {YARD}, {HR}, cold, he puts his hands in his pockets", "LEFT"), "cold, final")),
 ("r2", 6, f"Medium shot of {GIL} {YARD}, he slowly bends down and lifts the empty clay pot from the floor with both hands, with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('old man in a dark-red sweater')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Gilberto", two(f"{GIL} on the LEFT and {RAM} on the RIGHT, close together by the adobe arch {YARD0}, framed from the waist up; "
     f"Gilberto speaks calmly to his son, slightly closer to the camera and in sharper focus") + " " + MOUTH("Gilberto", "Ramiro"), "calm, firm, low"),
   talk("c08", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Daniela", one(f"Close-up of {DAN} {YARD}, {DR}, amused, arms crossed, she rolls her eyes", "LEFT"), "mocking, amused")),
 ("r3", 6, f"Medium shot of {RAM} {YARD}, {RL}, already in place, holding {FOLDER} with both hands, serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a green flannel shirt')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Gilberto", f"Close-up of {GIL} {YARD0}, {GL}, calm and firm, holding {FOLDER} open", HEC_B, "RIGHT", "calm, firm",
     f"Close-up of {GIL} {YARD}, {GL}, calm and firm, holding {FOLDER} open", "RIGHT")),
 ("c11", 6, talk("c11", "Héctor", one(f"Close-up of {HEC} {YARD}, {HR}, shocked, he takes off his glasses", "LEFT"), "shocked, nervous")),
 ("c12", 6, S("c12", "Gilberto", f"Close-up of {GIL} {YARD0}, {GL}, serious, a calm sad look", HEC_B, "RIGHT", "serious, slow",
     f"Close-up of {GIL} {YARD}, {GL}, serious", "RIGHT")),
 ("c13", 6, talk("c13", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GL}, cold and final, he closes the folder", "RIGHT"), "cold, final, slow")),
 ("r4", 6, one(f"Close-up of {DAN} {YARD}, {DR}, in silence, her smile disappears, she swallows, speechless", "LEFT") + " Slow push-in. No dialogue."),
 ("c14", D8("c14"), (talk("c14", "Ramiro", two(f"{GIL} on the LEFT and {RAM} on the RIGHT, facing each other in profile under the string lights {YARD0}, framed from the waist up; "
     f"Ramiro, moved, speaks softly to his father, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ramiro", "Gilberto"), "moved, soft"),
   talk("c14", "Ramiro", one(f"Close-up of {RAM} {YARD}, {RL}, moved, his eyes shine", "RIGHT"), "moved, soft"))),
 ("c15", 6, talk("c15", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GL}, a warm small smile that turns serious", "RIGHT"), "warm, then serious")),
 ("c16", 6, talk("c16", "Ramiro", one(f"Close-up of {RAM} {YARD}, {RL}, worried", "RIGHT"), "worried, low")),
 ("c17", D8("c17"), (talk("c17", "Gilberto", two(f"{RAM} on the LEFT and {GIL} on the RIGHT, facing each other under the string lights {YARD0}, framed from the waist up; "
     f"Gilberto speaks low to his son, slightly closer to the camera and in sharper focus") + " " + MOUTH("Gilberto", "Ramiro"), "low, grave, slow"),
   talk("c17", "Gilberto", one(f"Close-up of {GIL} {YARD}, {GL}, low and grave", "RIGHT"), "low, grave, slow"))),
 # CTA con carisma (después del BLACK): Gilberto solo, a cámara
 ("c18", 10, talk("c18", "Gilberto", f"Close-up from the chest up of {GIL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his white mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small warm half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Mi papá no se merece esto.", "Mi papá no merece esto."), ("tips over on the ground", "sits on the ground"), ("spills across the floor tiles", "steams"),
        ("shocked", "surprised"), ("speechless", "quiet"), ("contemptuous", "cool"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm string lights at dusk in a family house patio decorated for Christmas Eve in Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family patio on Christmas Eve with papel picado, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm evening light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{GILBERTO_SALGADO}", "a thin Mexican man in his seventies with short white hair, a neat white mustache and a dark-red wool sweater"),
         ("@{RAMIRO_SALGADO}", "a Mexican man in his late thirties with short wavy black hair, a short black beard and a green flannel shirt"),
         ("@{HECTOR_SALGADO}", "a Mexican man in his forties with receding black hair, thin metal glasses and a navy-blue blazer"),
         ("@{DANIELA_ROBLES}", "a Mexican woman in her late thirties with long straight caramel-blonde hair, gold hoop earrings and an emerald-green velvet dress"),
         (" @{LOC_PATIOZITACUARO}", "")]
#@INCLUDE tail

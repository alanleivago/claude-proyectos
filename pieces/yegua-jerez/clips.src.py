"""Genera los clips de yegua-jerez PARTE 1 (La Yegua de Jerez, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Inspirado (transformado, no copiado) en la ref de @alisorxomrb 7706249552289860896 (fuentes/atrium-vista/videos/7706249552289860896_analisis.md): mujer sola defiende a un ex campeón
maltratado contra el capataz y el patrón; la corren; segunda pelea en casa; promesa; remate burlón del patrón. Aquí: Rosalba (26), escaramuza charra en un rancho de Jerez, Zacatecas,
defiende a la Duquesa, yegua campeona lastimada que el capataz Cutberto (35) quiere vender; el patrón Arnulfo (70) la corre con la yegua; la abuela Chayo (75) la regaña;
Rosalba promete ganar la charreada de Jerez; el patrón se burla.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija. Corral: Rosalba (arrodillada junto a la yegua) a la IZQUIERDA; Cutberto y Arnulfo a la DERECHA. Casa de la abuela: Rosalba IZQUIERDA con la yegua, Chayo DERECHA en la puerta.
YARD0 = ("in a horse ranch corral in Jerez, Zacatecas @{LOC_CORRALJEREZ} under a stormy grey sky: wooden fences, a dirt corral with straw, an old metal windmill, a hacienda gate with stone arches; "
         "no readable text, no signs, no logos, no brand logos on clothes")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HOME0 = ("in the dirt yard of a small humble adobe house in Jerez, Zacatecas @{LOC_CASAABUELA} at dusk: a tiny wooden stable with straw, clay pots, a wooden door with a lantern, warm light; "
         "no readable text, no signs, no logos")
HOME = HOME0 + "; nobody else in the background, no extras, nobody besides the person described"
MARE = "@{DUQUESA} (an old thin chestnut mare with a white blaze and a white bandage on her front left leg)"
ROS = ("@{ROSALBA_ACUNA} (26-year-old Mexican woman, light-brown skin, long dark wavy hair in a low braid, a brown-and-cream checked long-sleeve shirt, jeans)")
CUT = ("@{CUTBERTO_LARA} (35-year-old Mexican man, light-brown skin, a thin black mustache, a black felt cowboy hat, a black leather vest over a white shirt, leather chaps)")
ARN = ("@{ARNULFO_VILLA} (70-year-old Mexican rancher, weathered light skin, a white mustache, a brown felt cowboy hat, a camel canvas work jacket)")
CHA = ("@{CHAYO_ACUNA} (75-year-old Mexican grandmother, small, brown wrinkled skin, grey hair in a bun, a purple checked apron over a beige blouse)")
#@INCLUDE funcs1
# Bordes: Cutberto/Arnulfo/Chayo le hablan a Rosalba -> espalda de ella LEFT; Rosalba les habla -> espalda RIGHT.
ROS_B = "@{ROSALBA_ACUNA} seen from behind (long dark wavy hair in a low braid, brown-and-cream checked shirt)"
CUT_B = "@{CUTBERTO_LARA} seen from behind (black felt cowboy hat, black leather vest)"
ARN_B = "@{ARNULFO_VILLA} seen from behind (brown felt cowboy hat, camel canvas work jacket)"
CHA_B = "@{CHAYO_ACUNA} seen from behind (grey hair in a bun, purple checked apron strings)"
#@INCLUDE funcs2
#@INCLUDE d8
RK = f"kneeling on the LEFT in the dirt beside {MARE}, wrapping a bandage on the mare's leg"      # Rosalba en el corral
RS = f"standing on the LEFT beside {MARE}"                                                        # Rosalba de pie
CR = "standing on the RIGHT by the wooden fence, arms crossed"                                    # Cutberto
AR = "standing on the RIGHT in the corral"                                                        # Arnulfo
RH = f"standing on the LEFT in the yard holding the halter rope of {MARE}"                        # Rosalba en casa
HR = "standing on the RIGHT in the doorway of the adobe house"                                    # Chayo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Cutberto YA hablando y riéndose junto a la cerca; Rosalba arrodillada de espaldas (LEFT) junto a la yegua. La injusticia se ve en el frame 0.
 ("c01", D8("c01"), S("c01", "Cutberto", f"Medium close-up of {CUT} {YARD0}, {CR}, talking from the very first frame, mocking and laughing, the injured mare visible beside the kneeling woman", ROS_B, "LEFT", "mocking, cruel, arrogant",
     f"Medium close-up of {CUT} {YARD}, {CR}, talking from the very first frame, mocking and laughing", "LEFT")),
 ("c02", D8("c02"), S("c02", "Rosalba", f"Close-up of {ROS} {YARD0}, {RK}, she looks up, indignant and proud", CUT_B, "RIGHT", "indignant, proud, firm",
     f"Close-up of {ROS} {YARD}, {RK}, indignant and proud", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Cutberto", one(f"Close-up of {CUT} {YARD}, {CR}, a mean smile, he tips his hat back", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {ARN} {YARD}, {AR}, already in place, he walks slowly closer from the porch, serious and annoyed, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a brown cowboy hat')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Arnulfo", one(f"Close-up of {ARN} {YARD}, {AR}, annoyed, serious", "LEFT"), "annoyed, bossy")),
 ("c05", D8("c05"), talk("c05", "Cutberto", one(f"Close-up of {CUT} {YARD}, {CR}, he turns to the boss, accusing, pointing at the woman with his chin", "RIGHT"), "accusing, sly")),
 ("c06", D8("c06"), S("c06", "Arnulfo", f"Close-up of {ARN} {YARD0}, {AR}, offended and proud, he looks down at her", ROS_B, "LEFT", "offended, proud, mocking",
     f"Close-up of {ARN} {YARD}, {AR}, offended and proud", "LEFT")),
 ("c07", D8("c07"), S("c07", "Rosalba", f"Close-up of {ROS} {YARD0}, {RS}, she stands up, respectful but firm, her eyes shine", ARN_B, "RIGHT", "respectful, firm, emotional",
     f"Close-up of {ROS} {YARD}, {RS}, respectful but firm, her eyes shine", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Arnulfo", f"Close-up of {ARN} {YARD0}, {AR}, cold and final, he points at the gate", ROS_B, "LEFT", "cold, final, slow",
     f"Close-up of {ARN} {YARD}, {AR}, cold and final", "LEFT")),
 ("r2", 6, one(f"Close-up of {ROS} {YARD}, {RS}, in silence, tears in her eyes, she swallows and nods slowly with dignity", "RIGHT") + " Slow push-in. No dialogue."),
 ("i01", 6, f"Wide shot {YARD0}: {ROS} small in the frame, walking slowly out through the stone-arched hacienda gate, leading {MARE} that limps beside her, under the stormy sky; seen from far away, no other people. No dialogue."),
 ("c09", 6, talk("c09", "Cutberto", one(f"Close-up of {CUT} {YARD}, leaning on the gate post, waving goodbye with a mocking smile", "LEFT"), "mocking, cruel")),
 ("c10", 6, S("c10", "Chayo", f"Close-up of {CHA} {HOME0}, {HR}, surprised and worried, a hand on her cheek", ROS_B, "LEFT", "surprised, worried",
     f"Close-up of {CHA} {HOME}, {HR}, surprised and worried", "LEFT")),
 ("c11", D8("c11"), S("c11", "Rosalba", f"Close-up of {ROS} {HOME0}, {RH}, tired but proud, she strokes the mare's neck", CHA_B, "RIGHT", "tired, proud, honest",
     f"Close-up of {ROS} {HOME}, {RH}, tired but proud", "RIGHT")),
 ("c12", 6, talk("c12", "Chayo", one(f"Close-up of {CHA} {HOME}, {HR}, upset, scolding, she raises both hands", "LEFT"), "upset, scolding")),
 ("c13", D8("c13"), (talk("c13", "Rosalba", two(f"{ROS} on the LEFT holding the halter of {MARE} and {CHA} on the RIGHT in the doorway, facing each other in the yard {HOME0}, framed from the waist up; "
     f"Rosalba, determined, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rosalba", "Chayo"), "determined, brave, emotional"),
   talk("c13", "Rosalba", one(f"Close-up of {ROS} {HOME}, {RH}, determined", "RIGHT"), "determined, brave, emotional"))),
 ("c14", 6, talk("c14", "Chayo", one(f"Close-up of {CHA} {HOME}, {HR}, worried, she makes the sign of the cross", "LEFT"), "worried, resigned, soft")),
 ("r3", 6, f"Medium shot {HOME}: {ROS} inside the tiny wooden stable at night, gently brushing {MARE} by lantern light, tender and tired, the only person in the shot. Slow push-in. No dialogue."),
 ("i02", 6, f"Close-up insert {HOME0}: an old faded printed photo held in a woman's hand by lantern light, showing a young chestnut mare with a white blaze winning a charro competition with a smiling woman rider in a traditional escaramuza dress; only the hand and the photo, no readable text. No dialogue."),
 ("c15", D8("c15"), talk("c15", "Rosalba", f"Close-up of {ROS} inside the tiny wooden stable at night by lantern light {HOME}, holding an old photo next to the head of {MARE}, she speaks softly to the mare, "
     f"tender, a small smile through tears; the only person in the shot; {ONE}.", "tender, soft, determined")),
 ("c16", D8("c16"), talk("c16", "Cutberto", one(f"Close-up of {CUT} sitting at a wooden table on the covered porch of the ranch {YARD}, gossiping, amused", "RIGHT"), "amused, gossiping")),
 ("c17", 6, talk("c17", "Arnulfo", one(f"Close-up of {ARN} sitting at a wooden table on the covered porch of the ranch {YARD}, he laughs out loud, mocking", "LEFT"), "mocking, laughing")),
 # CTA con carisma (después del BLACK): Rosalba sola, a cámara
 ("c18", 10, talk("c18", "Rosalba", f"Close-up from the chest up of {ROS} {HOME}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, moves her braid over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small brave half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Ella no es un trapo para tirarlo.", "Ella merece respeto."), ("la hicieron saltar lastimada", "la hicieron correr cansada"),
        ("Esa yegua ya no sirve ni para jalar carreta, Rosalba.", "Esa yegua ya está muy vieja, Rosalba."),
        ("limps", "walks slowly"), ("injured mare", "tired mare"), ("a mean smile", "a smile"), ("cruel", "cold"), ("tears in her eyes", "her eyes shine"),
        ("small through tears", "small"), ("offended", "surprised"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, stormy light on a horse ranch in Zacatecas, 85mm lens, slow push-in. Characters and the horse look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rural horse ranch and humble adobe house in northern Mexico, steady camera. Same faces, clothes and horse as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROSALBA_ACUNA}", "a Mexican woman in her twenties with a long dark braid and a brown-and-cream checked shirt"),
         ("@{CUTBERTO_LARA}", "a Mexican man in his thirties with a thin mustache, a black cowboy hat and a black leather vest"),
         ("@{ARNULFO_VILLA}", "an elderly Mexican rancher with a white mustache, a brown felt cowboy hat and a camel work jacket"),
         ("@{CHAYO_ACUNA}", "a small elderly Mexican woman with grey hair in a bun and a purple checked apron"),
         ("@{DUQUESA}", "an old thin chestnut mare with a white blaze"),
         (" @{LOC_CORRALJEREZ}", ""), (" @{LOC_CASAABUELA}", "")]
#@INCLUDE tail

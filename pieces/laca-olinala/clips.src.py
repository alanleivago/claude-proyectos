"""Genera los clips de laca-olinala PARTE 1 (La Laca de Olinalá, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre-hijos-herencia transformada (ranking2, saga Evaristo): en su cumpleaños 80, en Olinalá, Guerrero, don Isauro recibe a sus hijos Germán (45) y Rocío (42) después de veinte años:
traen un papel para quedarse con la casa "antes de que se acabe la comida" y humillan a Chabela (50), la que lo cuida. Isauro saca el cofre rojo de laca: la casa ya es de Chabela.
Giro: Chabela es su hija mayor.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio, mesa del cumpleaños): Isauro (sentado) y Chabela (de pie detrás de él) a la IZQUIERDA; Germán y Rocío a la DERECHA, del otro lado de la mesa.
YARD0 = ("in the patio of a family house and lacquer workshop in Olinalá, Guerrero @{LOC_PATIOLACA} at midday: a long wooden table with a simple birthday lunch and colorful hand-painted lacquered "
         "wooden boxes, adobe walls with orange bougainvillea, green mountains behind, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CHEST = "a red hand-painted lacquered wooden chest with flowers and birds"
PAPER = "a few typed papers"
ISA = ("@{ISAURO_NAVA} (80-year-old Mexican man, thin, brown wrinkled skin, white hair combed back, a thin white mustache, a light-beige long-sleeve shirt buttoned to the neck)")
GER = ("@{GERMAN_NAVA} (45-year-old Mexican man, balding with short dark hair on the sides, rectangular glasses, a black mustache, a white dress shirt with a navy tie)")
ROC = ("@{ROCIO_NAVA} (42-year-old Mexican woman, light-brown skin, shoulder-length dyed caramel hair, big sunglasses on her head, an emerald-green dress, a gold necklace)")
CHA = ("@{CHABELA_RUIZ} (50-year-old Mexican woman, brown skin, black hair with a grey streak in a low bun, a plain lilac blouse, a white apron)")
#@INCLUDE funcs1
# Bordes: Germán o Rocío le hablan a Isauro/Chabela -> espalda LEFT; Isauro o Chabela les hablan -> espalda RIGHT.
ISA_B = "@{ISAURO_NAVA} seen from behind (white hair combed back, light-beige shirt, thin shoulders)"
CHA_B = "@{CHABELA_RUIZ} seen from behind (black hair with a grey streak in a low bun, lilac blouse, white apron strings)"
GER_B = "@{GERMAN_NAVA} seen from behind (balding head with short dark hair on the sides, white dress shirt)"
ROC_B = "@{ROCIO_NAVA} seen from behind (shoulder-length caramel hair, emerald-green dress)"
#@INCLUDE funcs2
#@INCLUDE d8
IL = "sitting on the LEFT at the head of the long wooden table, a small lacquered box and a brush in front of him"   # Isauro
CL = "standing on the LEFT behind the old man's chair"                                                              # Chabela
GR = f"standing on the RIGHT across the table, holding {PAPER}"                                                    # Germán
RR = "standing on the RIGHT across the table"                                                                       # Rocío

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Germán YA hablando, le pone los papeles enfrente al padre; Isauro de espaldas (LEFT). Plazo: antes de que se acabe la comida.
 ("c01", D8("c01"), S("c01", "Germán", f"Medium close-up of {GER} {YARD0}, {GR}, talking from the very first frame, impatient, he pushes the papers and a pen across the table", ISA_B, "LEFT", "impatient, cold, bossy",
     f"Medium close-up of {GER} {YARD}, {GR}, talking from the very first frame, impatient", "LEFT")),
 ("c02", D8("c02"), S("c02", "Isauro", f"Close-up of {ISA} {YARD0}, {IL}, hurt but dignified, he puts down the brush", GER_B, "RIGHT", "hurt, dignified, slow",
     f"Close-up of {ISA} {YARD}, {IL}, hurt but dignified", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Rocío", one(f"Close-up of {ROC} {YARD}, {RR}, she rolls her eyes, fake sweet", "LEFT"), "fake sweet, impatient")),
 ("r1", 6, f"Medium shot of {CHA} {YARD}, {CL}, already in place holding a small birthday cake with candles, she stops and looks at the visitors, worried, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a lilac blouse')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Chabela", f"Close-up of {CHA} {YARD0}, {CL}, calm and firm, protective", GER_B, "RIGHT", "calm, firm, protective",
     f"Close-up of {CHA} {YARD}, {CL}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Germán", f"Close-up of {GER} {YARD0}, {GR}, contemptuous, he does not even look at her", CHA_B, "LEFT", "contemptuous, cold",
     f"Close-up of {GER} {YARD}, {GR}, contemptuous", "LEFT")),
 ("c06", D8("c06"), talk("c06", "Rocío", one(f"Close-up of {ROC} {YARD}, {RR}, a cold smile, she waves her hand", "LEFT"), "cold, mocking")),
 ("i01", 6, f"Close-up insert {YARD0}: a man's hand slaps {PAPER} and a pen down on the wooden table next to a small colorful lacquered box; only the hand, the papers and the box, no face. No dialogue."),
 ("c07", D8("c07"), talk("c07", "Isauro", one(f"Close-up of {ISA} {YARD}, {IL}, sad, his eyes shine", "RIGHT"), "sad, slow, quiet")),
 ("c08", 6, S("c08", "Germán", f"Close-up of {GER} {YARD0}, {GR}, impatient, he taps the papers", ISA_B, "LEFT", "impatient, cold",
     f"Close-up of {GER} {YARD}, {GR}, impatient", "LEFT")),
 ("r2", 6, one(f"Close-up of {ISA} {YARD}, {IL}, in silence, he slowly turns his head to look at the caretaker and gives a small gentle smile", "LEFT") + " Slow push-in. No dialogue."),
 ("c09", 6, (talk("c09", "Isauro", two(f"{ISA} sitting on the LEFT and {CHA} standing on the RIGHT beside his chair, looking at each other at the table {YARD0}, framed from the waist up; "
     f"Isauro, calm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Isauro", "Chabela"), "calm, gentle"),
   talk("c09", "Isauro", one(f"Close-up of {ISA} {YARD}, {IL}, calm and gentle", "LEFT"), "calm, gentle"))),
 ("r3", 6, f"Medium shot of {CHA} {YARD}, she walks in from the house and slowly places {CHEST} on the wooden table, "
           f"{SOLO}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c10", 6, talk("c10", "Rocío", one(f"Close-up of {ROC} {YARD}, {RR}, curious and suspicious, she lowers her sunglasses", "LEFT"), "curious, suspicious")),
 ("c11", D8("c11"), S("c11", "Isauro", f"Close-up of {ISA} {YARD0}, {IL}, he opens the red lacquered chest and takes out a folded document, calm", GER_B, "RIGHT", "calm, firm, slow",
     f"Close-up of {ISA} {YARD}, {IL}, holding a folded document, calm", "RIGHT")),
 ("c12", 6, S("c12", "Germán", f"Close-up of {GER} {YARD0}, {GR}, nervous, he adjusts his glasses", ISA_B, "LEFT", "nervous, quick",
     f"Close-up of {GER} {YARD}, {GR}, nervous", "LEFT")),
 ("c13", 6, S("c13", "Isauro", f"Close-up of {ISA} {YARD0}, {IL}, serene, a small proud smile", GER_B, "RIGHT", "serene, proud, slow",
     f"Close-up of {ISA} {YARD}, {IL}, serene, a small proud smile", "RIGHT")),
 ("c14", 6, talk("c14", "Rocío", one(f"Close-up of {ROC} {YARD}, {RR}, shocked and indignant, she takes off her sunglasses", "LEFT"), "indignant, shocked")),
 ("c15", 6, talk("c15", "Germán", one(f"Close-up of {GER} {YARD}, {GR}, cold and resentful, his jaw tight", "LEFT"), "resentful, cold")),
 ("c16", 6, talk("c16", "Isauro", one(f"Close-up of {ISA} {YARD}, {IL}, calm, he raises one hand slowly", "RIGHT"), "calm, firm, slow")),
 ("c17", 6, (talk("c17", "Isauro", f"Medium wide group shot {YARD0}: {ISA} sitting on the LEFT at the head of the table with {CHA} standing behind him, {GER} and {ROC} standing on the RIGHT across the table; "
     f"Isauro speaks, closest to the camera and in sharp focus; only these four people, no extras. Only Isauro speaks: his lips move clearly; the other three stay silent with mouths closed.", "firm, moved, slow"),
   talk("c17", "Isauro", one(f"Close-up of {ISA} {YARD}, {IL}, firm and moved", "RIGHT"), "firm, moved, slow"))),
 ("r4", 6, one(f"Close-up of {GER} {YARD}, {GR}, in silence, stunned, he slowly lowers the papers", "LEFT") + " Slow push-in. No dialogue."),
 ("c18", 6, S("c18", "Chabela", f"Close-up of {CHA} {YARD0}, {CL}, her eyes fill with light, stunned and moved, one hand on her chest", ISA_B, "LEFT", "stunned, moved, soft",
     f"Close-up of {CHA} {YARD}, {CL}, stunned and moved, one hand on her chest", "LEFT")),
 # CTA con carisma (después del BLACK): Isauro solo, a cámara
 ("c19", 10, talk("c19", "Isauro", f"Close-up from the chest up of {ISA} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his white mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small mischievous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Tú nomás eres la que limpia.", "Tú no eres de la familia."), ("Usted ya no sabe lo que hace, apá.", "Usted no puede hacer eso, apá."),
        ("slaps", "puts"), ("contemptuous", "cool"), ("stunned", "surprised"), ("shocked and indignant", "surprised"), ("resentful", "serious"),
        ("her eyes fill with light", "her eyes shine"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm midday light in the patio of a family lacquer workshop in Olinalá, Guerrero, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic patio with colorful lacquered boxes on a wooden table in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ISAURO_NAVA}", "a thin very old Mexican man with white combed-back hair, a thin white mustache and a light-beige shirt"),
         ("@{GERMAN_NAVA}", "a balding Mexican man in his forties with rectangular glasses, a mustache, a white shirt and a navy tie"),
         ("@{ROCIO_NAVA}", "a Mexican woman in her forties with caramel hair, sunglasses on her head and an emerald-green dress"),
         ("@{CHABELA_RUIZ}", "a Mexican woman around fifty with black hair with a grey streak in a bun, a lilac blouse and a white apron"),
         (" @{LOC_PATIOLACA}", "")]
#@INCLUDE tail

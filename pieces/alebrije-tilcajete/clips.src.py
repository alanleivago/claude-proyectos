"""Genera los clips de alebrije-tilcajete PARTE 1 (El Alebrije de Tilcajete, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos + padre-hijos (humillación + plazo -> llega el jefe poderoso -> el jefe es el hijo -> el traidor es él mismo): en San Martín Tilcajete, Oaxaca, la licenciada Paulina (40) quiere el terreno
del tallador don Crispín (68) para un hotel, le rompe un alebrije y da plazo "antes de que acabe la Guelaguetza". Llama a su jefe: llega Ezequiel (42), el hijo que se fue hace veinte años.
Giro: fue el propio Ezequiel quien la mandó a apretar "al viejo terco".
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio del taller): Crispín SIEMPRE a la IZQUIERDA en su mesa de tallar; Paulina y Ezequiel a la DERECHA (Ezequiel llega por el camino de tierra).
YARD0 = ("in the patio of a family alebrije workshop in San Martín Tilcajete, Oaxaca @{LOC_TALLERALEBRIJE} in the afternoon: wooden tables full of colorful painted fantastical wooden animal figures, "
         "small paint pots, adobe walls with pink bougainvillea, agave plants and dry hills beyond, warm sunlight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
ALE = "a colorful painted wooden figure of a fantastical winged jaguar"
PHONE = "a smartphone"
CRI = ("@{CRISPIN_MENDOZA} (68-year-old Zapotec Mexican man, brown skin, short grey hair, grey stubble, round wire glasses, a white cotton shirt, a brown work apron with wood shavings)")
PAU = ("@{PAULINA_ARRIAGA} (40-year-old Mexican businesswoman, light skin, a sleek black bob haircut, red lipstick, a red blazer over a white blouse)")
EZE = ("@{EZEQUIEL_MENDOZA} (42-year-old Mexican man, brown skin, short black slicked-back hair, a short black beard, a black dress shirt under a black blazer, a gold watch)")
#@INCLUDE funcs1
# Bordes: Paulina o Ezequiel le hablan a Crispín -> espalda de él LEFT; Crispín les habla -> espalda RIGHT.
CRI_B = "@{CRISPIN_MENDOZA} seen from behind (short grey hair, white cotton shirt, the strings of a brown apron)"
PAU_B = "@{PAULINA_ARRIAGA} seen from behind (sleek black bob haircut, red blazer)"
EZE_B = "@{EZEQUIEL_MENDOZA} seen from behind (short black slicked-back hair, black blazer)"
#@INCLUDE funcs2
#@INCLUDE d8
CL = "standing on the LEFT behind a wooden table of painted alebrijes"            # Crispín
PR = "standing on the RIGHT in the patio, holding a black leather folder"          # Paulina
ER = "standing on the RIGHT in the patio"                                          # Ezequiel

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Paulina YA hablando, le extiende la carpeta; Crispín de espaldas (LEFT). Plazo: antes de que acabe la Guelaguetza.
 ("c01", D8("c01"), S("c01", "Paulina", f"Medium close-up of {PAU} {YARD0}, {PR}, talking from the very first frame, impatient and arrogant, she holds out the open folder and a pen", CRI_B, "LEFT", "impatient, arrogant, cold",
     f"Medium close-up of {PAU} {YARD}, {PR}, talking from the very first frame, impatient and arrogant", "LEFT")),
 ("c02", 6, S("c02", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, calm and proud, he keeps holding a small carving knife over a piece of wood", PAU_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {CRI} {YARD}, {CL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, a cold little laugh, she looks at the figures with disdain", "LEFT"), "mocking, cold")),
 ("i01", 6, f"Close-up insert {YARD0}: the corner of a black leather folder slowly pushes {ALE} off the edge of a wooden table and it lands on the dusty ground with one wing broken off; only the folder, the table and the figure, no face. No dialogue."),
 ("c04", 6, S("c04", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, his eyes shine behind his glasses, indignant but calm", PAU_B, "RIGHT", "hurt, firm",
     f"Close-up of {CRI} {YARD}, {CL}, his eyes shine, indignant", "RIGHT")),
 ("c05", 6, talk("c05", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, she shrugs, mocking", "LEFT"), "mocking, cruel")),
 ("r1", 6, f"Medium shot of {CRI} {YARD}, he slowly kneels and picks up {ALE} and its broken wing from the ground, his eyes shine, dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a white shirt')}. Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, holding {PHONE} to her ear, impatient, she rolls her eyes", "LEFT"), "impatient, annoyed")),
 ("i02", 6, "Wide shot of two black SUVs driving slowly along a dusty dirt road between agave fields and dry hills in Oaxaca, warm afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {EZE} {YARD}, {ER}, already standing in place, a black SUV parked behind him, he takes off dark sunglasses, confident and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black blazer')}. Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, a polite smile for her boss, she gestures toward the old man", "RIGHT"), "polite, mocking")),
 ("c08", 6, S("c08", "Ezequiel", f"Close-up of {EZE} {YARD0}, {ER}, he freezes, stunned, his confident face falls", CRI_B, "LEFT", "stunned, low, small",
     f"Close-up of {EZE} {YARD}, {ER}, stunned, his face falls", "LEFT")),
 ("c09", D8("c09"), S("c09", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, holding the broken figure, sad and dignified", EZE_B, "RIGHT", "sad, dignified, slow",
     f"Close-up of {CRI} {YARD}, {CL}, holding the broken figure, sad and dignified", "RIGHT")),
 ("c10", 6, talk("c10", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, surprised, her smile disappears", "RIGHT"), "surprised, nervous")),
 ("c11", 6, talk("c11", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {ER}, cold and furious but controlled, he looks at her", "RIGHT"), "cold, firm, slow")),
 ("c12", 6, talk("c12", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, a slow defiant smile returns", "RIGHT"), "defiant, sly")),
 ("c13", D8("c13"), (talk("c13", "Paulina", two(f"{PAU} on the LEFT and {EZE} on the RIGHT, in profile facing each other in the patio {YARD0}, framed from the waist up; "
     f"Paulina, sly and calm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Paulina", "Ezequiel"), "sly, calm, slow"),
   talk("c13", "Paulina", one(f"Close-up of {PAU} {YARD}, {PR}, sly and calm", "RIGHT"), "sly, calm, slow"))),
 ("r3", 6, one(f"Close-up of {CRI} {YARD}, {CL}, in silence, he slowly raises his eyes to his son, deeply hurt", "RIGHT") + " Slow push-in. No dialogue."),
 ("c14", D8("c14"), S("c14", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, hurt, his voice low", EZE_B, "RIGHT", "hurt, low, slow",
     f"Close-up of {CRI} {YARD}, {CL}, hurt, his voice low", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Ezequiel", f"Close-up of {EZE} {YARD0}, {ER}, ashamed, he cannot hold his father's eyes", CRI_B, "LEFT", "ashamed, quick, low",
     f"Close-up of {EZE} {YARD}, {ER}, ashamed", "LEFT")),
 ("c16", 6, talk("c16", "Crispín", one(f"Close-up of {CRI} {YARD}, {CL}, calm, sad, he takes off his glasses", "RIGHT"), "calm, sad, slow")),
 ("c17", 6, talk("c17", "Ezequiel", one(f"Close-up of {EZE} {YARD}, {ER}, pleading, he opens his hands", "LEFT"), "pleading, quick")),
 ("c18", 6, S("c18", "Crispín", f"Close-up of {CRI} {YARD0}, {CL}, firm and calm, holding the broken alebrije", EZE_B, "RIGHT", "firm, calm, final",
     f"Close-up of {CRI} {YARD}, {CL}, firm and calm", "RIGHT")),
 # CTA con carisma (después del BLACK): Crispín solo, a cámara
 ("c19", 10, talk("c19", "Crispín", f"Close-up from the chest up of {CRI} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts his round glasses, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Usted me dijo: el viejo es terco, apriétalo hasta que firme.", "Usted me dijo: el señor es terco, insiste hasta que firme."),
        ("Pobre es el que vende a su padre.", "Pobre es el que olvida a su padre."), ("Al cabo se la pasa agachado todo el día.", "Usted sabe hacerlo mejor."),
        ("with one wing broken off", "on its side"), ("broken", "small"), ("pushes", "moves"), ("cold and furious but controlled", "serious"), ("stunned", "surprised"),
        ("deeply hurt", "sad"), ("powerful", "serious"), ("defiant", "calm"), ("carving knife", "carving tool"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon sun in the patio of an alebrije workshop in Oaxaca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic workshop patio with colorful painted wooden figures in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CRISPIN_MENDOZA}", "an elderly indigenous Mexican man with short grey hair, round wire glasses, a white shirt and a brown apron"),
         ("@{PAULINA_ARRIAGA}", "a Mexican businesswoman in her forties with a sleek black bob and a red blazer"),
         ("@{EZEQUIEL_MENDOZA}", "a Mexican man in his forties with a short black beard, slicked-back hair and a black blazer"),
         (" @{LOC_TALLERALEBRIJE}", "")]
#@INCLUDE tail

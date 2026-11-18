"""Genera los clips de barrica-mascota PARTE 1 (La Barrica de Mascota, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #50 "La viña de la discordia" [CAPO] (Patronas y haciendas; trasladada a una destilería de raicilla y con otro contenido en la barrica), cierre tipo 7 (objeto que delata):
en la bodega de la hacienda raicillera de Mascota, los medios hermanos Julio (38) y Héctor (34) se pelean la destilería del padre muerto. La maestra raicillera Conchita (52) revela que el padre
dejó una barrica sellada para el día que se pelearan. Dentro no hay raicilla: hay una foto de las madres de los dos, abrazadas.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (bodega): Julio a la DERECHA junto a la barrica sellada; Héctor a la IZQUIERDA junto a las filas de barricas; Conchita al CENTRO-DERECHA, un paso detrás de la barrica.
CEL0 = ("in the old barrel cellar of a raicilla distillery in a hacienda in Mascota, Jalisco @{LOC_BODEGAMASCOTA} in the warm late afternoon: rows of dark oak barrels on wooden racks, thick adobe walls, wooden beams, "
        "warm sunbeams with floating dust, one large old oak barrel standing apart sealed with wax; no readable text, no signs, no logos")
CEL = CEL0 + "; nobody else in the background, no extras, nobody besides the person described"
JUL = ("@{JULIO_MONTALVO} (38-year-old Mexican man, fair skin, short wavy light-brown hair, clean-shaven, a fitted black button-up shirt with rolled sleeves, a silver watch)")
HEC = ("@{HECTOR_MONTALVO} (34-year-old Mexican man, brown skin, short black curly hair, a short black beard, intense dark eyes, a dusty olive-green work shirt over a white t-shirt)")
CON = ("@{CONCHITA_RUELAS} (52-year-old Mexican woman, tanned skin, long grey-streaked black braid, calm wise dark eyes, a cream blouse with rolled sleeves under a brown leather apron)")
#@INCLUDE funcs1
JUL_B = "@{JULIO_MONTALVO} seen from behind (short wavy light-brown hair, black button-up shirt)"
HEC_B = "@{HECTOR_MONTALVO} seen from behind (short black curly hair, olive-green work shirt)"
CON_B = "@{CONCHITA_RUELAS} seen from behind (long grey-streaked black braid, brown leather apron strings over a cream blouse)"
#@INCLUDE funcs2
#@INCLUDE d8
JR = "standing on the RIGHT with one hand on the big wax-sealed barrel"
HL = "standing on the LEFT by the rows of barrels"
CR = "standing on the RIGHT a step behind the big sealed barrel"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Julio YA hablando, la mano sobre la barrica, Héctor de espaldas en el borde.
 ("c01", 6, S("c01", "Julio", f"Medium close-up of {JUL} {CEL0}, {JR}, talking from the very first frame, hard and possessive, blocking the barrel", HEC_B, "LEFT", "hard, possessive, cold",
     f"Medium close-up of {JUL} {CEL}, {JR}, talking from the very first frame, hard and possessive", "LEFT")),
 ("c02", 6, S("c02", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, calm but defiant, arms crossed", JUL_B, "RIGHT", "defiant, calm, bitter",
     f"Close-up of {HEC} {CEL}, {HL}, defiant, arms crossed", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, proud, a contemptuous look at his half-brother", HEC_B, "LEFT", "proud, scornful, cold",
     f"Close-up of {JUL} {CEL}, {JR}, proud", "LEFT")),
 ("c04", 6, S("c04", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, stepping forward, voice hard, old resentment in his eyes", JUL_B, "RIGHT", "hard, resentful, cutting",
     f"Close-up of {HEC} {CEL}, {HL}, resentful", "RIGHT")),
 ("c05", 6, S("c05", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, furious, pointing a finger at him", HEC_B, "LEFT", "furious, sharp, warning",
     f"Close-up of {JUL} {CEL}, {JR}, furious, pointing", "LEFT")),
 ("c06", 6, S("c06", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, she raises one open hand between them, firm and calm", JUL_B, "LEFT", "firm, calm, motherly",
     f"Close-up of {CON} {CEL}, {CR}, firm and calm, hand raised", "LEFT")),
 ("c07", 6, S("c07", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, turning to her, impatient and condescending", CON_B, "LEFT", "impatient, condescending, curt",
     f"Close-up of {JUL} {CEL}, {JR}, impatient", "LEFT")),
 ("c08", D8("c08"), S("c08", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, unbothered, a calm steady look, wiping her hands on her apron", JUL_B, "LEFT", "calm, steady, proud",
     f"Close-up of {CON} {CEL}, {CR}, calm, wiping her hands", "LEFT")),
 ("c09", 6, S("c09", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, urgent, demanding, his voice cracking a little", CON_B, "RIGHT", "urgent, demanding, hurt",
     f"Close-up of {HEC} {CEL}, {HL}, urgent, demanding", "RIGHT")),
 ("c10", 6, S("c10", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, a sad gentle look at him, she shakes her head slowly", HEC_B, "LEFT", "sad, gentle, mysterious",
     f"Close-up of {CON} {CEL}, {CR}, sad gentle look", "LEFT")),
 ("c11", 6, S("c11", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, bitter, his voice low, grief under the anger", CON_B, "LEFT", "bitter, low, grieving",
     f"Close-up of {JUL} {CEL}, {JR}, bitter and grieving", "LEFT")),
 ("c12", D8("c12"), S("c12", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, she lays her palm on the wax seal of the big barrel, solemn", JUL_B, "LEFT", "solemn, slow, meaningful",
     f"Close-up of {CON} {CEL}, {CR}, solemn, palm on the wax seal", "LEFT")),
 ("r1", 6, f"Medium two-shot {CEL}: {JUL} on the RIGHT and {HEC} on the LEFT turn their heads slowly and look at each other across the big sealed barrel, tense, silent; only these two people. No dialogue."),
 ("c13", 6, S("c13", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, decided, nodding toward the barrel", CON_B, "RIGHT", "decided, firm, intense",
     f"Close-up of {HEC} {CEL}, {HL}, decided", "RIGHT")),
 ("c14", D8("c14"), S("c14", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, protective of the barrel, worried", CON_B, "LEFT", "worried, protective, tense",
     f"Close-up of {JUL} {CEL}, {JR}, protective, worried", "LEFT")),
 ("c15", 6, S("c15", "Conchita", f"Close-up of {CON} {CEL0}, {CR}, a small knowing smile, quiet", JUL_B, "LEFT", "quiet, knowing, calm",
     f"Close-up of {CON} {CEL}, {CR}, small knowing smile", "LEFT")),
 ("r2", 6, one(f"Close-up of {JUL} {CEL}, {JR}, stunned, he slowly takes his hand off the barrel, frowning, silent", "LEFT") + " No dialogue."),
 ("i01", 6, f"Close-up insert {CEL0}: a woman's hands in a brown leather apron break the old red wax seal and lift the round wooden lid off the big oak barrel; dust in the sunbeams; no faces, no readable text. No dialogue."),
 ("r3", 6, one(f"Close-up of {HEC} {CEL}, standing by the open barrel, leaning over it, looking inside, his face lit from below, frozen", "LEFT") + " No dialogue."),
 ("i02", 6, f"Close-up insert {CEL0}: inside the dry empty oak barrel lies a single old faded printed photograph of two young Mexican women hugging and laughing in front of this hacienda; no readable text, no letters. No dialogue."),
 ("c16", 6, S("c16", "Héctor", f"Close-up of {HEC} {CEL0}, {HL}, holding up an old faded photograph, his voice shaking, eyes wet", JUL_B, "RIGHT", "shaken, whispering, stunned",
     f"Close-up of {HEC} {CEL}, {HL}, holding up an old photo, shaken", "RIGHT")),
 ("c17", D8("c17"), S("c17", "Julio", f"Close-up of {JUL} {CEL0}, {JR}, staring at the photo, pale, shaking his head in disbelief", HEC_B, "LEFT", "disbelief, shaken, low",
     f"Close-up of {JUL} {CEL}, {JR}, pale, in disbelief", "LEFT")),
 ("r4", 6, one(f"Close-up of {CON} {CEL}, {CR}, silent, she lowers her eyes with a sad knowing look, completely still", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Héctor a cámara
 ("c18", 10, talk("c18", "Héctor", f"Close-up from the chest up of {HEC} {CEL}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, holds up the old photo for a second, raises one eyebrow, gestures with his other open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("furious, sharp, warning", "angry, sharp"), ("hard, resentful, cutting", "hard, resentful"), ("proud, scornful, cold", "proud, cold"), ("furious", "angry"), ("break the old red wax seal", "open the old wax seal"), ("shaken", "moved"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm late afternoon sunbeams in an old oak barrel cellar of a distillery in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old barrel cellar with oak barrels in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{JULIO_MONTALVO}", "a Mexican man in his late thirties with wavy light-brown hair in a black button-up shirt"),
         ("@{HECTOR_MONTALVO}", "a Mexican man in his thirties with short black curly hair, a short beard and an olive-green work shirt"),
         ("@{CONCHITA_RUELAS}", "a Mexican woman in her fifties with a long grey-streaked braid and a brown leather apron"),
         (" @{LOC_BODEGAMASCOTA}", "")]
#@INCLUDE tail

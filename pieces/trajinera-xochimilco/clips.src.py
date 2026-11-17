"""Genera los clips de trajinera-xochimilco PARTE 1 (La Trajinera de Xochimilco, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos + estructura de la ref @alisorxomrb 7706249552289860896 (transformada): en el embarcadero de don Celso (68) en Xochimilco, el capataz Rubén (40) quiere desarmar para leña la
Lupita, la vieja trajinera que hizo el abuelo de Abril (25); Celso la corre con su trajinera; su abuelo Teodoro (80) cuenta que Celso siempre la quiso desde que perdió una regata;
Abril promete correr la regata de este año; remate: Celso se burla.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija. Embarcadero: Abril a la IZQUIERDA en su trajinera junto al muelle; Rubén y Celso a la DERECHA en el muelle. Chinampa: Abril IZQUIERDA, Teodoro DERECHA.
YARD0 = ("on a trajinera pier in Xochimilco, Mexico City @{LOC_EMBARCADERO} in the late afternoon: a wooden dock on a green canal with colorful wooden trajinera boats with painted floral arches, "
         "tall ahuejote trees along the water, warm light; no readable text, no signs, no names painted on boats, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HOME0 = ("on the small wooden dock of a humble chinampa house in Xochimilco @{LOC_CHINAMPA} at dusk: a quiet canal, vegetable beds and flowers, a lantern on a post, ahuejote trees, warm light; "
         "no readable text, no signs, no logos")
HOME = HOME0 + "; nobody else in the background, no extras, nobody besides the person described"
BOAT = "an old faded wooden trajinera boat with a peeling painted floral arch and no letters"
ABR = ("@{ABRIL_NAVARRO} (25-year-old Mexican woman, brown skin, shoulder-length wavy black hair, a white tank top under an open red flannel shirt, rolled-up jeans)")
RUB = ("@{RUBEN_ARCE} (40-year-old Mexican man, light-brown skin, shaved bald head, a black goatee, sunglasses on his head, a black polo shirt, a gold watch)")
CEL = ("@{CELSO_MONTES} (68-year-old Mexican man, heavy-set, light skin, white hair, a thick white mustache, a grey flat cap, a dark-green bomber jacket over a white shirt)")
TEO = ("@{TEODORO_NAVARRO} (80-year-old Mexican man, very thin, brown wrinkled skin, a short white beard, a worn straw hat, a loose white cotton shirt)")
#@INCLUDE funcs1
# Bordes: Rubén/Celso/Teodoro le hablan a Abril -> espalda de ella LEFT; Abril les habla -> espalda RIGHT.
ABR_B = "@{ABRIL_NAVARRO} seen from behind (shoulder-length wavy black hair, open red flannel shirt)"
RUB_B = "@{RUBEN_ARCE} seen from behind (shaved bald head, black polo shirt)"
CEL_B = "@{CELSO_MONTES} seen from behind (grey flat cap, dark-green bomber jacket, heavy-set)"
TEO_B = "@{TEODORO_NAVARRO} seen from behind (worn straw hat, loose white cotton shirt, very thin)"
#@INCLUDE funcs2
#@INCLUDE d8
AL = f"standing on the LEFT on {BOAT} moored beside the pier, holding a paintbrush"   # Abril en su trajinera
RR = "standing on the RIGHT on the wooden pier"                                        # Rubén
CR = "standing on the RIGHT on the wooden pier, the colorful boats behind him"         # Celso
AH = f"standing on the LEFT on the small dock beside {BOAT}"                           # Abril en la chinampa
TR = "standing on the RIGHT on the small dock"                                         # Teodoro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Rubén YA hablando desde el muelle, señalando con desprecio la trajinera vieja; Abril de espaldas (LEFT) pintando el arco.
 ("c01", D8("c01"), S("c01", "Rubén", f"Medium close-up of {RUB} {YARD0}, {RR}, talking from the very first frame, mocking, he points with disdain at the old faded boat", ABR_B, "LEFT", "mocking, arrogant, cold",
     f"Medium close-up of {RUB} {YARD}, {RR}, talking from the very first frame, mocking", "LEFT")),
 ("c02", D8("c02"), S("c02", "Abril", f"Close-up of {ABR} {YARD0}, {AL}, proud and firm, paint on her hands", RUB_B, "RIGHT", "proud, firm",
     f"Close-up of {ABR} {YARD}, {AL}, proud and firm", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Rubén", one(f"Close-up of {RUB} {YARD}, {RR}, a cold smile, he crosses his arms", "LEFT"), "cold, bossy")),
 ("r1", 6, f"Medium shot of {CEL} {YARD}, {CR}, already in place, he walks slowly along the pier toward the camera, annoyed, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey flat cap')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Celso", one(f"Close-up of {CEL} {YARD}, {CR}, annoyed, bossy", "LEFT"), "annoyed, bossy")),
 ("c05", D8("c05"), talk("c05", "Rubén", one(f"Close-up of {RUB} {YARD}, {RR}, he turns to the boss, accusing, sly", "RIGHT"), "sly, accusing")),
 ("c06", D8("c06"), S("c06", "Celso", f"Close-up of {CEL} {YARD0}, {CR}, offended and proud, he looks down at her", ABR_B, "LEFT", "offended, proud, mocking",
     f"Close-up of {CEL} {YARD}, {CR}, offended and proud", "LEFT")),
 ("c07", D8("c07"), S("c07", "Abril", f"Close-up of {ABR} {YARD0}, {AL}, respectful but firm, her eyes shine", CEL_B, "RIGHT", "respectful, firm, emotional",
     f"Close-up of {ABR} {YARD}, {AL}, respectful but firm", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Celso", f"Close-up of {CEL} {YARD0}, {CR}, cold and final, he points down the canal", ABR_B, "LEFT", "cold, final",
     f"Close-up of {CEL} {YARD}, {CR}, cold and final", "LEFT")),
 ("r2", 6, one(f"Close-up of {ABR} {YARD}, {AL}, in silence, her eyes shine, she unties the mooring rope with dignity", "RIGHT") + " Slow push-in. No dialogue."),
 ("i01", 6, f"Wide shot of a quiet green canal in Xochimilco at dusk with ahuejote trees: {ABR} small in the frame, rowing alone with a long wooden pole on {BOAT}, moving away from the colorful pier; seen from far away, no other people, no readable text. No dialogue."),
 ("c09", 6, S("c09", "Teodoro", f"Close-up of {TEO} {HOME0}, {TR}, surprised and worried", ABR_B, "LEFT", "surprised, worried, soft",
     f"Close-up of {TEO} {HOME}, {TR}, surprised and worried", "LEFT")),
 ("c10", D8("c10"), S("c10", "Abril", f"Close-up of {ABR} {HOME0}, {AH}, sad and ashamed, her eyes shine", TEO_B, "RIGHT", "sad, low",
     f"Close-up of {ABR} {HOME}, {AH}, sad and ashamed", "RIGHT")),
 ("c11", D8("c11"), talk("c11", "Teodoro", one(f"Close-up of {TEO} {HOME}, {TR}, a slow knowing smile, a memory in his eyes", "LEFT"), "calm, knowing, slow")),
 ("c12", D8("c12"), (talk("c12", "Abril", two(f"{ABR} on the LEFT and {TEO} on the RIGHT, facing each other on the small dock beside the old boat {HOME0}, framed from the waist up; "
     f"Abril, determined, slightly closer to the camera and in sharper focus") + " " + MOUTH("Abril", "Teodoro"), "determined, brave"),
   talk("c12", "Abril", one(f"Close-up of {ABR} {HOME}, {AH}, determined", "RIGHT"), "determined, brave"))),
 ("c13", D8("c13"), talk("c13", "Teodoro", one(f"Close-up of {TEO} {HOME}, {TR}, moved, his eyes shine, a small proud smile", "LEFT"), "moved, proud, soft")),
 ("r3", 6, f"Medium shot {HOME}: {ABR} kneeling on {BOAT} at night under the lantern light, carefully repainting the faded floral arch with a small brush, focused, the only person in the shot. Slow push-in. No dialogue."),
 ("c14", 6, talk("c14", "Abril", f"Close-up of {ABR} kneeling on the old boat at night under the lantern light {HOME}, one hand on the painted arch, speaking softly to the boat, a small determined smile; "
     f"the only person in the shot; {ONE}.", "tender, soft, determined")),
 ("c15", D8("c15"), talk("c15", "Rubén", one(f"Close-up of {RUB} sitting at a small table on the pier {YARD}, gossiping, amused", "RIGHT"), "amused, gossiping")),
 ("c16", D8("c16"), talk("c16", "Celso", one(f"Close-up of {CEL} sitting at a small table on the pier {YARD}, he laughs out loud, mocking", "LEFT"), "mocking, laughing")),
 # CTA con carisma (después del BLACK): Abril sola, a cámara
 ("c17", 10, talk("c17", "Abril", f"Close-up from the chest up of {ABR} {HOME}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, pushes her hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small brave half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Mañana la mando a desarmar para leña.", "Mañana la mando quitar de aquí."), ("Don Celso dijo que la Lupita es pura leña.", "Don Celso dijo que la Lupita ya no sirve."),
        ("Esa tabla vieja se hunde antes de la primera curva.", "Esa trajinera vieja no llega ni a la primera curva."), ("offended", "surprised"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm late-afternoon light on a trajinera pier in Xochimilco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colorful wooden boats on a green canal with ahuejote trees in Mexico City, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ABRIL_NAVARRO}", "a Mexican woman in her twenties with shoulder-length wavy black hair, a white tank top and an open red flannel shirt"),
         ("@{RUBEN_ARCE}", "a bald Mexican man around forty with a black goatee, sunglasses on his head and a black polo shirt"),
         ("@{CELSO_MONTES}", "a heavy-set elderly Mexican man with a white mustache, a grey flat cap and a dark-green bomber jacket"),
         ("@{TEODORO_NAVARRO}", "a very thin elderly Mexican man with a short white beard, a worn straw hat and a white cotton shirt"),
         (" @{LOC_EMBARCADERO}", ""), (" @{LOC_CHINAMPA}", "")]
#@INCLUDE tail

"""Genera los clips de panuelo-jalpan PARTE 1 (El Pañuelo de Jalpan, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #56 "La señora de la hacienda y el administrador" [CAPO] (Patronas y haciendas), época (1890s, ropa civil de época, sin uniformes), cierre tipo 6 (mirada muda):
en el patio de su hacienda en Jalpan, el hacendado Anastasio (60) le prohíbe al administrador Matías (30) acercarse a su hija Mariana (22), prometida a don Rafael Garduño.
Mariana defiende a Matías; el padre da por cerrado el tema y se va. A sus espaldas, ella le pasa un pañuelo bordado: "Esta noche, en la capilla". El padre se detiene en la puerta y voltea:
una mirada muda entre él y Matías, con el pañuelo en la mano.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio): Anastasio a la DERECHA junto al corredor de arcos; Mariana a la DERECHA junto a la fuente, un paso detrás de su padre; Matías a la IZQUIERDA, sombrero en mano.
YARD0 = ("in the inner courtyard of an old 19th-century hacienda in Jalpan, Sierra Gorda of Queretaro @{LOC_HACIENDAJALPAN} in the soft late afternoon, in the 1890s: ochre and white walls, a stone fountain, arched corridors with heavy wooden doors, potted geraniums, "
         "green mountains beyond the roofs; period setting, no modern objects; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
ANA = ("@{ANASTASIO_ECHEVERRIA} (60-year-old Mexican man, fair skin, grey hair combed back, thick grey sideburns and a grey mustache, a black 19th-century frock coat over a grey silk waistcoat with a gold watch chain, a black cravat)")
MAR = ("@{MARIANA_ECHEVERRIA} (22-year-old Mexican woman, fair skin, dark-brown hair in an elegant 19th-century updo with loose curls, large dark eyes, a pale-blue high-necked 19th-century dress with white lace collar)")
MAT = ("@{MATIAS_ROBLEDO} (30-year-old Mexican mestizo man, warm brown skin, short black hair, a neat black mustache, a simple brown wool 19th-century jacket over a white collarless shirt, a brown waistcoat)")
#@INCLUDE funcs1
ANA_B = "@{ANASTASIO_ECHEVERRIA} seen from behind (grey hair combed back, black frock coat)"
MAR_B = "@{MARIANA_ECHEVERRIA} seen from behind (dark-brown 19th-century updo, pale-blue dress)"
MAT_B = "@{MATIAS_ROBLEDO} seen from behind (short black hair, brown wool jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
AR = "standing on the RIGHT by the arched corridor"
MR = "standing on the RIGHT by the stone fountain, a step behind her father"
TL = "standing on the LEFT, holding his wide-brimmed palm hat against his chest"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Anastasio YA hablando, duro, Matías de espaldas en el borde.
 ("c01", 6, S("c01", "Anastasio", f"Medium close-up of {ANA} {YARD0}, {AR}, talking from the very first frame, cold and hard, pointing one finger at the administrator", MAT_B, "LEFT", "cold, hard, commanding",
     f"Medium close-up of {ANA} {YARD}, {AR}, talking from the very first frame, cold and hard", "LEFT")),
 ("c02", D8("c02"), S("c02", "Matías", f"Close-up of {MAT} {YARD0}, {TL}, respectful, head slightly bowed but eyes steady", ANA_B, "RIGHT", "respectful, calm, steady",
     f"Close-up of {MAT} {YARD}, {TL}, respectful, eyes steady", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Anastasio", f"Close-up of {ANA} {YARD0}, {AR}, stern, he adjusts his gold watch chain as he speaks", MAT_B, "LEFT", "stern, cold, final",
     f"Close-up of {ANA} {YARD}, {AR}, stern", "LEFT")),
 ("c04", 6, S("c04", "Mariana", f"Close-up of {MAR} {YARD0}, {MR}, stepping toward her father, eyes wet, pleading", ANA_B, "RIGHT", "pleading, sad, trembling",
     f"Close-up of {MAR} {YARD}, {MR}, eyes wet, pleading", "RIGHT")),
 ("c05", 6, S("c05", "Anastasio", f"Close-up of {ANA} {YARD0}, {AR}, turning to his daughter, cold and certain, without softening", MAR_B, "LEFT", "cold, certain, proud",
     f"Close-up of {ANA} {YARD}, {AR}, cold and certain", "LEFT")),
 ("c06", D8("c06"), S("c06", "Matías", f"Close-up of {MAT} {YARD0}, {TL}, he lifts his chin, quiet dignity, holding the old man's gaze", ANA_B, "RIGHT", "quiet, dignified, firm",
     f"Close-up of {MAT} {YARD}, {TL}, quiet dignity", "RIGHT")),
 ("c07", 6, S("c07", "Anastasio", f"Close-up of {ANA} {YARD0}, {AR}, eyes narrowing, a low warning voice", MAT_B, "LEFT", "low, warning, icy",
     f"Close-up of {ANA} {YARD}, {AR}, eyes narrowing, low warning voice", "LEFT")),
 ("c08", D8("c08"), S("c08", "Mariana", f"Close-up of {MAR} {YARD0}, {MR}, brave now, defending him, hands clasped at her waist", ANA_B, "RIGHT", "brave, firm, emotional",
     f"Close-up of {MAR} {YARD}, {MR}, brave, defending him", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Anastasio", f"Close-up of {ANA} {YARD0}, {AR}, he cuts the conversation with a sharp gesture of his hand, final", MAR_B, "LEFT", "sharp, final, authoritative",
     f"Close-up of {ANA} {YARD}, {AR}, sharp final gesture", "LEFT")),
 ("r1", 6, f"Wide medium shot {YARD0}: {ANA} turns his back and walks away toward the arched corridor on the RIGHT; on the LEFT, behind his back, {MAR} quickly steps to {MAT} and presses a small folded white embroidered handkerchief into his hand, both glancing at the father's back; nobody else, no extras. No dialogue."),
 ("i01", 6, f"Close-up insert {YARD0}: a man's brown hand closing around a small folded white handkerchief embroidered with tiny blue flowers, the sleeve of a brown wool jacket; no faces, no readable text, no letters. No dialogue."),
 ("c10", 6, S("c10", "Mariana", f"Close-up of {MAR} {YARD0}, close to him, whispering urgently, glancing once toward the corridor", MAT_B, "LEFT", "whispering, urgent, tender",
     f"Close-up of {MAR} {YARD}, whispering urgently", "LEFT")),
 ("r2", 6, one(f"Medium close-up of {ANA} {YARD}, standing under an arch of the corridor on the RIGHT, he stops, then slowly turns his head back over his shoulder, his eyes hard and fixed, silent", "LEFT") + " Slow push-in. No dialogue."),
 ("r3", 6, one(f"Close-up of {MAT} {YARD}, {TL}, his hand closed around the small white handkerchief, he holds the gaze in silence, still, not looking away", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Mariana a cámara
 ("c11", 10, talk("c11", "Mariana", f"Close-up from the chest up of {MAR} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, touches a loose curl by her ear, raises one eyebrow, gestures gently with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("low, warning, icy", "low, serious"), ("pleading, sad, trembling", "pleading, sad"), ("icy", "serious"), ("pointing one finger at", "looking at"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican period TV drama set in the 1890s, realistic, soft late afternoon light in a hacienda courtyard, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical period drama shot, 19th-century hacienda courtyard in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican period drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ANASTASIO_ECHEVERRIA}", "a stern Mexican hacienda owner around sixty with grey sideburns and mustache, in a black 19th-century frock coat"),
         ("@{MARIANA_ECHEVERRIA}", "a young Mexican woman with a dark-brown 19th-century updo and a pale-blue high-necked lace-collar dress"),
         ("@{MATIAS_ROBLEDO}", "a Mexican man around thirty with a neat black mustache, in a simple brown wool 19th-century jacket and waistcoat"),
         (" @{LOC_HACIENDAJALPAN}", "")]
#@INCLUDE tail

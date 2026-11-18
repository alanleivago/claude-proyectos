"""Genera los clips de jima-arandas PARTE 1 (La Jimadora de Arandas, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #46 "La recolectora y el heredero" [CAPO] (Patronas y haciendas), cierre tipo 3 (palabra reveladora: el apellido): en el campo de agave de su hacienda tequilera en Arandas,
la jimadora Marisol (28) corrige al heredero Santiago (34). La matriarca doña Graciela (64) la pone en su lugar; Marisol dice que su madre Eugenia jimó para don Rodrigo, el esposo de Graciela.
Graciela palidece, le pide su nombre completo: "Marisol Olmos, señora. Como usted."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (campo): Graciela y Santiago a la DERECHA entre los surcos; Marisol a la IZQUIERDA junto a unas piñas recién cortadas.
YARD0 = ("in a blue agave field of an old tequila hacienda in the highlands of Arandas, Jalisco @{LOC_AGAVEARANDAS} in the morning: long rows of blue-grey agave plants on red earth, "
         "a few freshly harvested agave hearts on the ground, the white hacienda house with a bell tower far in the background, soft morning light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
GRA = ("@{GRACIELA_OLMOS} (64-year-old Mexican woman, fair skin, grey hair in a tight low bun, a stern face, a black silk blouse, a burgundy rebozo over her shoulders, a strand of pearls)")
SAN = ("@{SANTIAGO_OLMOS} (34-year-old Mexican man, light skin, short brown hair, a short trimmed beard, a white linen shirt with rolled sleeves, a light straw hat)")
MAR = ("@{MARISOL_OLMOS} (28-year-old Mexican woman, warm brown skin, long black hair in a single thick braid, a worn wide straw hat, a faded light-blue denim shirt, a red bandana around her neck)")
#@INCLUDE funcs1
GRA_B = "@{GRACIELA_OLMOS} seen from behind (grey hair in a tight low bun, burgundy rebozo over a black blouse)"
SAN_B = "@{SANTIAGO_OLMOS} seen from behind (light straw hat, white linen shirt)"
MAR_B = "@{MARISOL_OLMOS} seen from behind (long black braid, worn wide straw hat, faded light-blue denim shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
GR = "standing on the RIGHT between the agave rows"
SR = "standing on the RIGHT among the agave plants"
ML = "standing on the LEFT next to freshly cut agave hearts"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Marisol YA hablando, Santiago de espaldas en el borde.
 ("c01", 6, S("c01", "Marisol", f"Medium close-up of {MAR} {YARD0}, {ML}, talking from the very first frame, frank and direct, pointing down at an agave heart", SAN_B, "RIGHT", "frank, direct, confident",
     f"Medium close-up of {MAR} {YARD}, {ML}, talking from the very first frame, frank and direct", "RIGHT")),
 ("c02", 6, S("c02", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, surprised and half amused, a crooked smile", MAR_B, "LEFT", "surprised, amused, teasing",
     f"Close-up of {SAN} {YARD}, {SR}, surprised and half amused", "LEFT")),
 ("c03", D8("c03"), S("c03", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, proud, she shows with a flat open hand the angle of the cut", SAN_B, "RIGHT", "proud, patient, firm",
     f"Close-up of {MAR} {YARD}, {ML}, proud, showing with a flat open hand", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: a harvested blue agave heart lying on the red earth, its leaves cut off unevenly and roughly, morning light; no people, no hands, no tools. No dialogue."),
 ("c04", 6, S("c04", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, cold and severe, she lifts her chin, talking to her son", MAR_B, "LEFT", "cold, severe, commanding",
     f"Close-up of {GRA} {YARD}, {GR}, cold and severe", "LEFT")),
 ("c05", 6, S("c05", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, embarrassed but honest, he gestures toward the agave on the ground", GRA_B, "LEFT", "honest, a bit embarrassed",
     f"Close-up of {SAN} {YARD}, {SR}, embarrassed but honest", "LEFT")),
 ("c06", 6, S("c06", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, contemptuous, she adjusts her rebozo without looking at her", MAR_B, "LEFT", "contemptuous, icy, slow",
     f"Close-up of {GRA} {YARD}, {GR}, contemptuous, adjusting her rebozo", "LEFT")),
 ("c07", D8("c07"), S("c07", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, dignified, eyes shining but steady, she takes off her straw hat and holds it", GRA_B, "RIGHT", "dignified, contained, low",
     f"Close-up of {MAR} {YARD}, {ML}, dignified, holding her straw hat", "RIGHT")),
 ("c08", 6, S("c08", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, suddenly curious, a flicker of unease, her eyes narrow", MAR_B, "LEFT", "curious, suspicious, slower",
     f"Close-up of {GRA} {YARD}, {GR}, suddenly curious and uneasy", "LEFT")),
 ("c09", 6, S("c09", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, calm, holding her gaze, soft voice", GRA_B, "RIGHT", "calm, soft, meaningful",
     f"Close-up of {MAR} {YARD}, {ML}, calm, holding her gaze", "RIGHT")),
 ("r1", 6, one(f"Close-up of {GRA} {YARD}, {GR}, frozen, her face slowly goes pale, her hand tightens on her rebozo, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Santiago", f"Close-up of {SAN} {YARD0}, {SR}, worried, looking at his mother", GRA_B, "LEFT", "worried, gentle",
     f"Close-up of {SAN} {YARD}, {SR}, worried", "LEFT")),
 ("c11", 6, S("c11", "Graciela", f"Close-up of {GRA} {YARD0}, {GR}, tense, her voice low and slow, staring at the young woman", MAR_B, "LEFT", "tense, low, demanding",
     f"Close-up of {GRA} {YARD}, {GR}, tense, staring ahead", "LEFT")),
 ("c12", 6, talk("c12", "Marisol", two(f"{MAR} on the LEFT and {GRA} on the RIGHT {YARD0}, framed from the waist up; the young woman puts her straw hat back on and answers serenely, looking her in the eye, "
     f"the older woman stands frozen") + " " + MOUTH("Marisol", "Graciela"), "serene, slow, firm")),
 ("r2", 6, one(f"Close-up of {SAN} {YARD}, {SR}, stunned, his eyes move slowly from his mother to the young woman, his lips part, no words", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Marisol a cámara
 ("c13", 10, talk("c13", "Marisol", f"Close-up from the chest up of {MAR} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serene, makes a short pause, touches the brim of her straw hat, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small proud smile. Nobody else around.",
     "charismatic, proud, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous, icy", "cool"), ("contemptuous", "cool"), ("severe", "firm"), ("icy", "cold"), ("teasing", "light"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft morning light in a blue agave field of a tequila hacienda in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, blue agave field in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{GRACIELA_OLMOS}", "a stern Mexican woman in her sixties with grey hair in a tight bun, a black blouse, a burgundy rebozo and pearls"),
         ("@{SANTIAGO_OLMOS}", "a Mexican man in his thirties with a short beard, a white linen shirt and a light straw hat"),
         ("@{MARISOL_OLMOS}", "a Mexican woman in her late twenties with a thick black braid, a worn straw hat, a faded denim shirt and a red bandana"),
         (" @{LOC_AGAVEARANDAS}", "")]
#@INCLUDE tail

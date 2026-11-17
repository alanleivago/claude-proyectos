"""Genera los clips de cacao-comalcalco PARTE 1 (La Heredera de Comalcalco, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #53 "La heredera salvaje" [CAPO] (Patronas y haciendas), cierre tipo 3 (una palabra reveladora): en el comedor de la hacienda cacaotera de Comalcalco, Rosario (38), una mujer
de la sierra que heredó todo por testamento, come con la mano. Los cuñados Arturo (58) y Leonor (56) se burlan y anuncian que mañana un doctor firmará que no está en sus cabales; el
mayordomo Eusebio (72) la defiende. Rosario cuenta que don Julián subía a verla cada mes y, cuando le preguntan quién es, responde: "La hija de Julián… y de Candelaria" (la cocinera).
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (comedor): Rosario sentada a la IZQUIERDA en la cabecera; Arturo y Leonor sentados a la DERECHA de la mesa; Eusebio de pie a la IZQUIERDA junto al aparador.
YARD0 = ("in the dining room of an old cacao hacienda in Comalcalco, Tabasco @{LOC_HACIENDACACAO} at midday: high ceilings, a slow ceiling fan, tall wooden doors with open shutters to a green garden "
         "of cacao trees, a long dark-wood dining table with white plates and a clay basket of tortillas, a wooden sideboard, humid tropical light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
ROS = ("@{ROSARIO_BENITEZ} (38-year-old Mexican woman, sun-tanned brown skin, thick curly black hair tied back with loose strands, no makeup, a plain white cotton blouse with rolled-up sleeves)")
ART = ("@{ARTURO_GARRIDO} (58-year-old Mexican man, light skin, receding grey hair, gold-rimmed glasses, a cream linen suit over a light-blue shirt)")
MER = ("@{LEONOR_GARRIDO} (56-year-old Mexican woman, fair skin, auburn hair in a short neat bob, a pearl necklace, a lilac silk blouse)")
EUS = ("@{EUSEBIO_MAY} (72-year-old Mexican man, dark-brown skin, short white hair, a thin white beard, a beige long-sleeve shirt buttoned to the top)")
#@INCLUDE funcs1
ROS_B = "@{ROSARIO_BENITEZ} seen from behind (thick curly black hair tied back, plain white cotton blouse)"
ART_B = "@{ARTURO_GARRIDO} seen from behind (receding grey hair, cream linen suit jacket)"
LEO_B = "@{LEONOR_GARRIDO} seen from behind (auburn hair in a short bob, lilac silk blouse)"
#@INCLUDE funcs2
#@INCLUDE d8
RL = "seated at the head of the table on the LEFT"
AR = "seated on the RIGHT side of the table"
MR = "seated on the RIGHT side of the table next to Arturo"
EL = "standing on the LEFT by the wooden sideboard"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Arturo YA hablando con desprecio, Leonor de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Arturo", f"Medium close-up of {ART} {YARD0}, {AR}, talking from the very first frame, contemptuous, he nods toward the head of the table", LEO_B, "LEFT", "contemptuous, low, mocking",
     f"Medium close-up of {ART} {YARD}, {AR}, talking from the very first frame, contemptuous", "LEFT")),
 ("c02", 6, S("c02", "Leonor", f"Close-up of {MER} {YARD0}, {MR}, wrinkling her nose with disgust, she dabs her lips with a napkin", ART_B, "RIGHT", "snobbish, disgusted, low",
     f"Close-up of {MER} {YARD}, {MR}, snobbish", "RIGHT")),
 ("c03", 6, S("c03", "Rosario", f"Close-up of {ROS} {YARD0}, {RL}, calmly folding a tortilla with her fingers, unbothered, looking at them", LEO_B, "RIGHT", "calm, dry, unbothered",
     f"Close-up of {ROS} {YARD}, {RL}, calmly holding a folded tortilla, unbothered", "RIGHT")),
 ("c04", D8("c04"), S("c04", "Arturo", f"Close-up of {ART} {YARD0}, {AR}, he takes off his glasses, cold and condescending", ROS_B, "LEFT", "cold, condescending",
     f"Close-up of {ART} {YARD}, {AR}, cold and condescending", "LEFT")),
 ("c05", 6, talk("c05", "Eusebio", one(f"Close-up of {EUS} {YARD}, {EL}, respectful but firm, his hands clasped in front of him", "RIGHT"), "respectful, firm, old voice")),
 ("c06", 6, S("c06", "Leonor", f"Close-up of {MER} {YARD0}, {MR}, without looking at him, icy", ROS_B, "LEFT", "icy, dismissive",
     f"Close-up of {MER} {YARD}, {MR}, icy", "LEFT")),
 ("c07", D8("c07"), S("c07", "Arturo", f"Close-up of {ART} {YARD0}, {AR}, a satisfied thin smile, he leans back in his chair", ROS_B, "LEFT", "satisfied, cold, slow",
     f"Close-up of {ART} {YARD}, {AR}, a satisfied thin smile", "LEFT")),
 ("r1", 6, one(f"Close-up of {ROS} {YARD}, {RL}, she slowly puts the tortilla down on her plate and wipes her fingers, her eyes fixed on him, completely calm", "RIGHT") + " Slow push-in. No dialogue."),
 ("c08", D8("c08"), S("c08", "Rosario", f"Close-up of {ROS} {YARD0}, {RL}, quiet and steady, a sad half smile", ART_B, "RIGHT", "quiet, steady, low",
     f"Close-up of {ROS} {YARD}, {RL}, quiet and steady", "RIGHT")),
 ("c09", 6, S("c09", "Leonor", f"Close-up of {MER} {YARD0}, {MR}, a short incredulous laugh", ROS_B, "LEFT", "incredulous, mocking",
     f"Close-up of {MER} {YARD}, {MR}, incredulous", "LEFT")),
 ("c10", 6, S("c10", "Rosario", f"Close-up of {ROS} {YARD0}, {RL}, calm, certain, she holds her gaze", LEO_B, "RIGHT", "calm, certain",
     f"Close-up of {ROS} {YARD}, {RL}, calm and certain", "RIGHT")),
 ("c11", 6, S("c11", "Arturo", f"Close-up of {ART} {YARD0}, {AR}, leaning forward over the table, nervous now, his voice rising", ROS_B, "LEFT", "nervous, rising, demanding",
     f"Close-up of {ART} {YARD}, {AR}, leaning forward, nervous", "LEFT")),
 ("c12", 6, talk("c12", "Rosario", one(f"Close-up of {ROS} {YARD}, {RL}, very calm, she says it low and slowly, her eyes shining, chin up", "RIGHT"), "very low, slow, firm, emotional")),
 ("r2", 6, f"Medium two-shot {YARD0}: {MER} and {ART} {AR}, both frozen; she drops her fork on the plate, he goes pale and stares ahead; {PAIR}. Nobody speaks, all mouths closed. No dialogue."),
 # CTA con carisma (después del BLACK): Rosario a cámara
 ("c13", 10, talk("c13", "Rosario", f"Close-up from the chest up of {ROS} {YARD}, standing by the table, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a loose curl behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small proud smile. Nobody else around.",
     "charismatic, proud, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous", "cool"), ("mocking", "amused"), ("disgusted", "annoyed"), ("icy", "cold"), ("condescending", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, humid midday light in the high-ceilinged dining room of an old cacao hacienda in Tabasco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old hacienda dining room in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROSARIO_BENITEZ}", "a sun-tanned Mexican woman in her late thirties with curly black hair tied back and a plain white cotton blouse"),
         ("@{ARTURO_GARRIDO}", "a Mexican man in his late fifties with receding grey hair, gold-rimmed glasses and a cream linen suit"),
         ("@{LEONOR_GARRIDO}", "an elegant Mexican woman in her fifties with an auburn bob, a pearl necklace and a lilac silk blouse"),
         ("@{EUSEBIO_MAY}", "an old Mexican man with dark-brown skin, short white hair, a thin white beard and a beige buttoned shirt"),
         (" @{LOC_HACIENDACACAO}", "")]
#@INCLUDE tail

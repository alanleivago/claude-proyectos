"""Genera los clips de manteles-apan PARTE 1 (La Patrona de Apan, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #48 "La que regresó convertida en patrona" [CAPO] (Patronas y haciendas), cierre tipo 2 (se lee un documento y se corta antes del dato clave): en la comida de su hacienda pulquera
de Apan, doña Clemencia (66) desprecia a la recién llegada que compró la tierra de junto. Es Renata (42), a quien años atrás hizo lavar un mantel de rodillas delante de sus invitados.
La cocinera Tomasa (63) la reconoce. Clemencia la manda a sentarse con la servidumbre; Renata le pide a Bernardo (44), el hijo, que lea la escritura en voz alta: "Con todo y el pozo que…".
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio): Clemencia y Bernardo a la DERECHA junto a la mesa larga; Renata a la IZQUIERDA cerca de un arco; Tomasa a la IZQUIERDA junto a los jarros.
YARD0 = ("in the inner patio of an old pulque hacienda in Apan, Hidalgo @{LOC_HACIENDAAPAN} at midday: red-ochre walls, stone archways, a long table with a white embroidered tablecloth, "
         "clay jugs, potted geraniums, maguey fields beyond the archways; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CLE = ("@{CLEMENCIA_ARRIAGA} (66-year-old Mexican woman, fair skin, silver hair in a high elegant chignon, a cream silk blouse with a jade brooch, a long black skirt)")
REN = ("@{RENATA_SOLIS} (42-year-old Mexican woman, warm brown skin, long wavy black hair worn loose, gold hoop earrings, a fitted emerald-green dress with long sleeves)")
BER = ("@{BERNARDO_ARRIAGA} (44-year-old Mexican man, light skin, slicked-back black hair, a thin black mustache, a navy-blue blazer over an open-collar white shirt)")
TOM = ("@{TOMASA_HERNANDEZ} (63-year-old Mexican woman, brown skin, grey hair in two long braids, a plain lilac blouse, a dark-grey rebozo over her shoulders)")
#@INCLUDE funcs1
CLE_B = "@{CLEMENCIA_ARRIAGA} seen from behind (silver hair in a high chignon, cream silk blouse, long black skirt)"
REN_B = "@{RENATA_SOLIS} seen from behind (long wavy black hair worn loose, fitted emerald-green dress)"
BER_B = "@{BERNARDO_ARRIAGA} seen from behind (slicked-back black hair, navy-blue blazer)"
#@INCLUDE funcs2
#@INCLUDE d8
CR = "standing on the RIGHT by the long table"
BR = "standing on the RIGHT beside the long table"
RL = "standing on the LEFT near a stone archway"
TL = "standing on the LEFT by the clay jugs"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Clemencia YA hablando, Renata de espaldas en el borde.
 ("c01", 6, S("c01", "Clemencia", f"Medium close-up of {CLE} {YARD0}, {CR}, talking from the very first frame, haughty, looking the newcomer up and down", REN_B, "LEFT", "haughty, cold, sharp",
     f"Medium close-up of {CLE} {YARD}, {CR}, talking from the very first frame, haughty", "LEFT")),
 ("c02", 6, S("c02", "Renata", f"Close-up of {REN} {YARD0}, {RL}, calm and elegant, a faint smile", CLE_B, "RIGHT", "calm, elegant, confident",
     f"Close-up of {REN} {YARD}, {RL}, calm and elegant", "RIGHT")),
 ("c03", 6, S("c03", "Bernardo", f"Close-up of {BER} {YARD0}, {BR}, leaning toward his mother with a curious smirk", CLE_B, "LEFT", "amused, low, gossiping",
     f"Close-up of {BER} {YARD}, {BR}, a curious smirk", "LEFT")),
 ("c04", 6, S("c04", "Clemencia", f"Close-up of {CLE} {YARD0}, {CR}, a false polite smile, superior", REN_B, "LEFT", "falsely polite, superior",
     f"Close-up of {CLE} {YARD}, {CR}, a false polite smile", "LEFT")),
 ("c05", 6, S("c05", "Renata", f"Close-up of {REN} {YARD0}, {RL}, she takes one slow step closer, serene, eyes fixed on her", CLE_B, "RIGHT", "serene, slow, firm",
     f"Close-up of {REN} {YARD}, {RL}, serene, eyes fixed ahead", "RIGHT")),
 ("r1", 6, one(f"Close-up of {CLE} {YARD}, {CR}, her false smile slowly disappears, her eyes narrow as she remembers, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Tomasa", one(f"Close-up of {TOM} {YARD}, {TL}, one hand over her heart, eyes shining, amazed", "RIGHT"), "amazed, emotional, soft")),
 ("c07", D8("c07"), S("c07", "Clemencia", f"Close-up of {CLE} {YARD0}, {CR}, a cruel little laugh, she lifts her chin", REN_B, "LEFT", "mocking, cruel, slow",
     f"Close-up of {CLE} {YARD}, {CR}, a cruel little laugh", "LEFT")),
 ("c08", 6, S("c08", "Renata", f"Close-up of {REN} {YARD0}, {RL}, her jaw tight, eyes wet but steady, dignified", CLE_B, "RIGHT", "dignified, contained, low",
     f"Close-up of {REN} {YARD}, {RL}, eyes wet but steady", "RIGHT")),
 ("c09", 6, S("c09", "Bernardo", f"Close-up of {BER} {YARD0}, {BR}, annoyed, one hand raised as if to stop her", REN_B, "LEFT", "annoyed, dismissive",
     f"Close-up of {BER} {YARD}, {BR}, annoyed", "LEFT")),
 ("c10", D8("c10"), S("c10", "Clemencia", f"Close-up of {CLE} {YARD0}, {CR}, contemptuous, she points toward the far end of the table without looking", REN_B, "LEFT", "contemptuous, icy",
     f"Close-up of {CLE} {YARD}, {CR}, contemptuous", "LEFT")),
 ("c11", D8("c11"), talk("c11", "Renata", two(f"{REN} on the LEFT and {BER} on the RIGHT {YARD0}, framed from the waist up; she calmly holds out a folded old document toward him with a cold smile, "
     f"he hesitates and takes it, slightly confused") + " " + MOUTH("Renata", "Bernardo"), "calm, cold, polite")),
 ("i01", 6, f"Close-up insert {YARD0}: on the white embroidered tablecloth, a folded old property deed with a red wax seal next to a clay jug of pulque; no readable text, only the paper and the seal, no hands, no people. No dialogue."),
 ("c12", 6, talk("c12", "Bernardo", one(f"Close-up of {BER} {YARD}, {BR}, reading aloud from an old document held in both hands, his voice slows down, his face slowly goes pale, he stops reading mid-sentence", "LEFT"), "reading aloud, slowing down, uneasy")),
 ("c13", 6, S("c13", "Clemencia", f"Close-up of {CLE} {YARD0}, {CR}, impatient and nervous, staring at her son", BER_B, "RIGHT", "impatient, nervous, sharp",
     f"Close-up of {CLE} {YARD}, {CR}, impatient and nervous", "RIGHT")),
 ("r2", 6, one(f"Close-up of {BER} {YARD}, {BR}, frozen, pale, holding the document, he slowly lifts his eyes from the paper toward his mother without a word", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Renata a cámara
 ("c14", 10, talk("c14", "Renata", f"Close-up from the chest up of {REN} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serene, makes a short pause, tucks a lock of hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, serene, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous", "cool"), ("cruel", "proud"), ("mocking", "amused"), ("icy", "cold"), ("haughty", "proud"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, midday light in the red-ochre patio of an old pulque hacienda in Hidalgo, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, hacienda patio with stone archways in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CLEMENCIA_ARRIAGA}", "an elegant Mexican woman in her sixties with silver hair in a high chignon and a cream silk blouse with a jade brooch"),
         ("@{RENATA_SOLIS}", "an elegant Mexican woman in her forties with long wavy black hair, gold hoop earrings and an emerald-green dress"),
         ("@{BERNARDO_ARRIAGA}", "a Mexican man in his forties with slicked-back black hair, a thin mustache and a navy-blue blazer"),
         ("@{TOMASA_HERNANDEZ}", "a Mexican woman in her sixties with grey hair in two braids, a lilac blouse and a grey rebozo"),
         (" @{LOC_HACIENDAAPAN}", "")]
#@INCLUDE tail

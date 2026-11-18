"""Genera los clips de trapiche-cuautla PARTE 1 (El Trapiche de Cuautla, VISTA) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #58 "La viuda del trapiche" [CAPO] (premisa nueva tipo patrona; Patronas y haciendas, época ~1910), cierre tipo 3 (palabra reveladora: "Hijo…"):
el hacendado vecino Adalberto (62) le propone a la viuda Fidelina (48) casarse para juntar las haciendas; ella le presenta a su nuevo administrador Elías (34), al que Adalberto
le cerró la puerta hace años. Elías pone sobre la mesa el reloj que su madre Dominga le dejó; Adalberto lo reconoce y lo llama "Hijo…".
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (portal de arcos): Fidelina a la IZQUIERDA; Adalberto a la DERECHA junto a la mesa; Elías entra por los arcos del fondo y se queda al CENTRO-IZQUIERDA junto a Fidelina.
ARC0 = ("under the covered stone arcade of an old sugarcane hacienda house in Morelos around 1910 @{LOC_TRAPICHECUAUTLA} in the warm afternoon: thick stone arches, a long table with a white tablecloth and a glass jug of agua fresca, "
        "potted ferns, green sugarcane fields, an old stone aqueduct and a brick mill chimney beyond the arches; period setting; no readable text, no signs, no logos")
ARC = ARC0 + "; nobody else in the background, no extras, nobody besides the person described"
FID = ("@{FIDELINA_VILLASENOR} (48-year-old Mexican woman, light-brown skin, black hair with a few grey strands in a tight bun with a tortoiseshell comb, proud dark eyes, a high-collared black lace blouse, a long dark-grey skirt, an ivory cameo brooch)")
ADA = ("@{ADALBERTO_LARREA} (62-year-old Mexican man, fair tanned skin, a neat grey goatee and grey hair, heavy eyelids, a white linen three-piece suit with a gold watch chain, a white straw panama hat)")
ELI = ("@{ELIAS_CERVERA} (34-year-old Mexican mestizo man, brown skin, wavy black hair, a thin black mustache, calm intense eyes, a cream cotton shirt with rolled sleeves, a brown wool vest)")
#@INCLUDE funcs1
FID_B = "@{FIDELINA_VILLASENOR} seen from behind (tight black bun with a tortoiseshell comb, black lace blouse)"
ADA_B = "@{ADALBERTO_LARREA} seen from behind (white straw panama hat, white linen suit jacket)"
ELI_B = "@{ELIAS_CERVERA} seen from behind (wavy black hair, brown wool vest over a cream shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
FL = "standing on the LEFT"
AR = "standing on the RIGHT next to the table"
EC = "standing in the CENTER-LEFT next to the widow"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

def T(cid, who, other, desc, tone, one_desc, one_side):
    return (talk(cid, who, two(desc) + " " + MOUTH(who, other), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Adalberto YA hablando, Fidelina de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Adalberto", f"Medium close-up of {ADA} {ARC0}, {AR}, talking from the very first frame, smug and confident, one hand resting on the table", FID_B, "LEFT", "smug, confident, patronizing",
     f"Medium close-up of {ADA} {ARC}, {AR}, talking from the very first frame, smug", "LEFT")),
 ("c02", D8("c02"), S("c02", "Fidelina", f"Close-up of {FID} {ARC0}, {FL}, chin up, proud and cold, not blinking", ADA_B, "RIGHT", "proud, cold, firm",
     f"Close-up of {FID} {ARC}, {FL}, proud and cold", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, a condescending smile, tilting his head", FID_B, "LEFT", "condescending, smooth",
     f"Close-up of {ADA} {ARC}, {AR}, condescending smile", "LEFT")),
 ("c04", D8("c04"), S("c04", "Fidelina", f"Close-up of {FID} {ARC0}, {FL}, a small confident smile, she turns her head toward the arches behind her at the end", ADA_B, "RIGHT", "confident, calm, a little proud",
     f"Close-up of {FID} {ARC}, {FL}, confident smile", "RIGHT")),
 ("r1", 6, one(f"Medium shot of {ELI} {ARC}, he walks in slowly under the stone arches from the sugarcane fields and takes off his wide-brimmed straw hat, serious, eyes fixed ahead", "RIGHT") + " " + MUTE),
 ("c05", 6, S("c05", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, holding his straw hat, calm, a cold polite look", ADA_B, "RIGHT", "calm, cold, polite",
     f"Close-up of {ELI} {ARC}, {EC}, calm and cold, holding his hat", "RIGHT")),
 ("r2", 6, one(f"Close-up of {ADA} {ARC}, {AR}, his smile vanishes, the glass of agua fresca stops halfway to his mouth, his face goes pale", "LEFT") + " Slow push-in. " + MUTE),
 ("c06", 6, S("c06", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, he puts the glass down hard, tense, looking at the widow", FID_B, "LEFT", "tense, alarmed, low",
     f"Close-up of {ADA} {ARC}, {AR}, tense, alarmed", "LEFT")),
 ("c07", D8("c07"), T("c07", "Fidelina", "Elías", f"{FID} {FL} and {ELI} {EC} {ARC0}, side by side, she speaks proudly toward the man off-screen on the right while Elias stands calm beside her", "proud, calm, firm",
     f"Close-up of {FID} {ARC}, {FL}, proud", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, scornful, pointing with his chin at the younger man", FID_B, "LEFT", "scornful, hard",
     f"Close-up of {ADA} {ARC}, {AR}, scornful", "LEFT")),
 ("c09", D8("c09"), S("c09", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, steady and controlled, a bitter look", ADA_B, "RIGHT", "steady, bitter, controlled",
     f"Close-up of {ELI} {ARC}, {EC}, steady and bitter", "RIGHT")),
 ("c10", 6, T("c10", "Fidelina", "Elías", f"{FID} and {ELI} {ARC0}, she turns to face him, surprised and hurt, he lowers his eyes", "surprised, soft, hurt",
     f"Close-up of {FID} {ARC}, {FL}, surprised and hurt", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, sad, a quiet voice, eyes shining", FID_B, "LEFT", "sad, quiet, tender",
     f"Close-up of {ELI} {ARC}, {EC}, sad, eyes shining", "LEFT")),
 ("c12", D8("c12"), S("c12", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, angry and nervous, sweating, raising one hand to stop him", ELI_B, "LEFT", "angry, nervous, loud",
     f"Close-up of {ADA} {ARC}, {AR}, angry and nervous", "LEFT")),
 ("c13", D8("c13"), S("c13", "Fidelina", f"Close-up of {FID} {ARC0}, {FL}, sharp and calm, looking down at his hand, then into his eyes", ADA_B, "RIGHT", "sharp, calm, probing",
     f"Close-up of {FID} {ARC}, {FL}, sharp and calm", "RIGHT")),
 ("c14", D8("c14"), S("c14", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, cold and threatening, leaning forward over the table", FID_B, "LEFT", "cold, threatening, low",
     f"Close-up of {ADA} {ARC}, {AR}, cold and threatening", "LEFT")),
 ("c15", 6, S("c15", "Fidelina", f"Close-up of {FID} {ARC0}, {FL}, unmoved, pointing at a chair with one open hand, commanding", ADA_B, "RIGHT", "commanding, cold, steady",
     f"Close-up of {FID} {ARC}, {FL}, commanding", "RIGHT")),
 ("i01", 6, f"Close-up insert {ARC0}: a man's brown hand slowly places an old engraved silver pocket watch on the white tablecloth next to a glass of agua fresca; no readable text. No dialogue."),
 ("c16", D8("c16"), S("c16", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, his hand still near the silver pocket watch on the table, looking straight at the older man", ADA_B, "RIGHT", "calm, heavy, deliberate",
     f"Close-up of {ELI} {ARC}, {EC}, calm and heavy", "RIGHT")),
 ("r3", 6, one(f"Close-up of {ADA} {ARC}, {AR}, staring down at something on the table, pale, his hand trembling as he reaches out slowly", "LEFT") + " Slow push-in. " + MUTE),
 ("c17", D8("c17"), S("c17", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, holding an old silver pocket watch in his trembling hand, broken, almost whispering, eyes wet", ELI_B, "LEFT", "broken, whispering, moved",
     f"Close-up of {ADA} {ARC}, {AR}, holding a silver pocket watch, broken", "LEFT")),
 ("c18", 6, S("c18", "Elías", f"Close-up of {ELI} {ARC0}, {EC}, firm, holding back emotion", ADA_B, "RIGHT", "firm, emotional, steady",
     f"Close-up of {ELI} {ARC}, {EC}, firm, holding back emotion", "RIGHT")),
 ("c19", 6, S("c19", "Adalberto", f"Close-up of {ADA} {ARC0}, {AR}, he slowly raises his wet eyes to the younger man, a long pause before speaking, his voice breaking", ELI_B, "LEFT", "broken, slow, trembling",
     f"Close-up of {ADA} {ARC}, {AR}, wet eyes, voice breaking", "LEFT")),
 ("r4", 6, one(f"Close-up of {FID} {ARC}, {FL}, her eyes go wide, she slowly raises one hand to her lips, shocked and silent", "RIGHT") + " Slow push-in. " + MUTE),
 # CTA con carisma (después del BLACK): Fidelina a cámara
 ("c20", 10, talk("c20", "Fidelina", f"Close-up from the chest up of {FID} {ARC}, alone under the arches, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, touches her cameo brooch, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("cold, threatening, low", "cold, serious, low"), ("angry, nervous, loud", "nervous, loud"), ("threatening", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican period TV drama around 1910, realistic, warm afternoon light under the stone arches of a sugarcane hacienda, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical period drama shot, Mexican hacienda arcade with sugarcane fields behind, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican period drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FIDELINA_VILLASENOR}", "a Mexican woman in her late forties with a tight black bun, a high-collared black lace blouse and a cameo brooch"),
         ("@{ADALBERTO_LARREA}", "an older Mexican man with a grey goatee, a white linen suit and a white panama hat"),
         ("@{ELIAS_CERVERA}", "a Mexican man in his thirties with wavy black hair, a thin mustache, a cream shirt and a brown vest"),
         (" @{LOC_TRAPICHECUAUTLA}", "")]
#@INCLUDE tail

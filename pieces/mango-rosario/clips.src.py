"""Genera los clips de mango-rosario PARTE 1 (El Mango de El Rosario, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra-justicia transformada (ranking2), sin niños: en un rancho de mangos de El Rosario, Sinaloa, Brenda (40) tiene a su hijastra Ximena (22) empacando sola bajo el sol porque corrió a los
trabajadores; Arturo (54) llega antes, descubre que Brenda cortó el árbol que plantó su difunta Lucía y la corre "antes de que se meta el sol". Giro: Lucía dejó testamento: el rancho es de su
hermano Gabino, que ya se lo vendió a Brenda.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (empaque junto a la casa): de izquierda a derecha Ximena (en la mesa de empaque), Arturo (en medio, llega en su camioneta), Brenda (en la terraza de la casa).
YARD0 = ("at a mango ranch in El Rosario, Sinaloa @{LOC_RANCHOMANGO} in the hot late afternoon: a packing area under a tin roof with stacks of wooden crates of ripe mangos, a long sorting table, "
         "rows of big mango trees, a white ranch house with a shaded veranda, golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
XIM = ("@{XIMENA_LIZARRAGA} (22-year-old Mexican woman, tanned light-brown skin, long dark-brown hair in a high ponytail, a faded green cotton t-shirt, a canvas apron)")
ART = ("@{ARTURO_LIZARRAGA} (54-year-old Mexican rancher, tall, tanned light skin, short black-and-grey hair, a black goatee, a straw cowboy hat, a light-blue denim shirt with rolled sleeves)")
BRE = ("@{BRENDA_OSUNA} (40-year-old Mexican woman, light skin, long wavy platinum-blonde hair, big sunglasses on her head, red lipstick, a white linen sundress, gold bracelets)")
#@INCLUDE funcs1
# Bordes: orden fijo X - A - B. Brenda o Arturo le hablan a Ximena -> espalda de ella LEFT; Ximena le habla a Arturo o Brenda -> espalda RIGHT;
# Arturo le habla a Brenda -> espalda de ella RIGHT; Brenda le habla a Arturo -> espalda de él LEFT.
XIM_B = "@{XIMENA_LIZARRAGA} seen from behind (long dark-brown high ponytail, faded green t-shirt, apron strings)"
ART_B = "@{ARTURO_LIZARRAGA} seen from behind (straw cowboy hat, light-blue denim shirt, tall)"
BRE_B = "@{BRENDA_OSUNA} seen from behind (long wavy platinum-blonde hair, white linen sundress)"
#@INCLUDE funcs2
#@INCLUDE d8
XL = "standing on the LEFT at the long sorting table, packing mangos into a wooden crate"   # Ximena
XS = "standing on the LEFT beside the sorting table"                                       # Ximena quieta
AC = "standing in the middle of the packing area"                                          # Arturo
BL = "lounging on a chair on the RIGHT on the shaded veranda, holding an iced drink"       # Brenda sentada
BR = "standing on the RIGHT at the edge of the veranda"                                    # Brenda de pie

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Brenda YA hablando desde la terraza con su bebida; Ximena de espaldas (LEFT) empacando.
 ("c01", D8("c01"), S("c01", "Brenda", f"Medium close-up of {BRE} {YARD0}, {BL}, talking from the very first frame, bossy and lazy, she sips her drink", XIM_B, "LEFT", "bossy, lazy, arrogant",
     f"Medium close-up of {BRE} {YARD}, {BL}, talking from the very first frame, bossy", "LEFT")),
 ("c02", D8("c02"), talk("c02", "Ximena", one(f"Close-up of {XIM} {YARD}, {XL}, sweaty and tired, she raises her eyes", "RIGHT"), "tired, firm")),
 ("c03", D8("c03"), S("c03", "Brenda", f"Close-up of {BRE} {YARD0}, {BL}, a lazy smile, she lowers her sunglasses", XIM_B, "LEFT", "lazy, mocking",
     f"Close-up of {BRE} {YARD}, {BL}, a lazy smile", "LEFT")),
 ("r1", 6, f"Medium shot of {ART} {YARD}, already in place, he steps down from a dusty pickup truck and stops, looking at the packing area, serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a straw cowboy hat')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Arturo", one(f"Close-up of {ART} {YARD}, {AC}, serious, his jaw tight", "RIGHT"), "serious, firm")),
 ("c05", 6, S("c05", "Brenda", f"Close-up of {BRE} {YARD0}, {BR}, she has just stood up, a big nervous smile", ART_B, "LEFT", "nervous, sweet, fake",
     f"Close-up of {BRE} {YARD}, {BR}, a big nervous smile", "LEFT")),
 ("c06", 6, S("c06", "Ximena", f"Close-up of {XIM} {YARD0}, {XL}, a tired small smile", ART_B, "RIGHT", "soft, tired",
     f"Close-up of {XIM} {YARD}, {XL}, a tired small smile", "RIGHT")),
 ("c07", D8("c07"), (talk("c07", "Arturo", two(f"{XIM} on the LEFT at the sorting table and {ART} on the RIGHT beside her, looking at her scraped hands {YARD0}, framed from the waist up; "
     f"Arturo, worried and tender, slightly closer to the camera and in sharper focus") + " " + MOUTH("Arturo", "Ximena"), "worried, tender"),
   talk("c07", "Arturo", one(f"Close-up of {ART} {YARD}, {AC}, worried and tender, looking down", "LEFT"), "worried, tender"))),
 ("c08", 6, talk("c08", "Brenda", one(f"Close-up of {BRE} {YARD}, {BR}, she waves her hand, careless, her sunglasses stay pushed up on top of her head and her eyes are clearly visible", "LEFT"), "careless, cold")),
 ("r2", 6, one(f"Close-up of {ART} {YARD}, {AC}, in silence, he turns his head toward the house and freezes, his face darkens", "RIGHT") + " Slow push-in. No dialogue."),
 ("i01", 6, f"Close-up insert {YARD0}: a freshly cut thick tree stump with sawdust around it next to the white ranch house, a few mango leaves on the ground; only the stump, no people. No dialogue."),
 ("c09", 6, S("c09", "Arturo", f"Close-up of {ART} {YARD0}, {AC}, serious, his voice low, he gestures toward the stump", BRE_B, "RIGHT", "serious, low",
     f"Close-up of {ART} {YARD}, {AC}, serious, his voice low", "RIGHT")),
 ("c10", 6, S("c10", "Brenda", f"Close-up of {BRE} {YARD0}, {BR}, she shrugs, cool, sipping her drink", ART_B, "LEFT", "cool, careless",
     f"Close-up of {BRE} {YARD}, {BR}, she shrugs, cool", "LEFT")),
 ("r3", 6, one(f"Close-up of {XIM} {YARD}, {XS}, in silence, her eyes shine, she presses her lips together", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Ximena", f"Close-up of {XIM} {YARD0}, {XS}, her eyes shine, her voice breaks a little", BRE_B, "RIGHT", "hurt, sad, firm",
     f"Close-up of {XIM} {YARD}, {XS}, her eyes shine", "RIGHT")),
 ("c12", D8("c12"), S("c12", "Arturo", f"Close-up of {ART} {YARD0}, {AC}, cold and serious", BRE_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {ART} {YARD}, {AC}, cold and serious", "RIGHT")),
 ("c13", 6, talk("c13", "Brenda", one(f"Close-up of {BRE} {YARD}, {BR}, she rolls her eyes", "LEFT"), "careless, mocking")),
 ("c14", D8("c14"), talk("c14", "Arturo", one(f"Close-up of {ART} {YARD}, {AC}, disappointed, his eyes hard", "RIGHT"), "disappointed, firm")),
 ("c15", 6, S("c15", "Brenda", f"Close-up of {BRE} {YARD0}, {BR}, defiant, her chin up", ART_B, "LEFT", "defiant, mocking",
     f"Close-up of {BRE} {YARD}, {BR}, defiant", "LEFT")),
 ("c16", D8("c16"), S("c16", "Arturo", f"Close-up of {ART} {YARD0}, {AC}, firm and calm, he points at the road", BRE_B, "RIGHT", "firm, calm, final",
     f"Close-up of {ART} {YARD}, {AC}, firm and calm", "RIGHT")),
 ("i02", 6, f"Wide shot of rows of big mango trees at golden sunset in El Rosario, Sinaloa, warm orange light through the leaves, wooden crates of mangos in the foreground; no people, no readable text. No dialogue."),
 ("c17", D8("c17"), talk("c17", "Brenda", one(f"Close-up of {BRE} {YARD}, {BR}, a slow knowing smile spreads on her face", "LEFT"), "sly, amused")),
 ("c18", 6, talk("c18", "Arturo", one(f"Close-up of {ART} {YARD}, {AC}, sure, a little uneasy", "RIGHT"), "sure, uneasy")),
 ("c19", D8("c19"), S("c19", "Brenda", f"Close-up of {BRE} {YARD0}, {BR}, she takes a folded paper out of her bag, enjoying it", ART_B, "LEFT", "sly, slow",
     f"Close-up of {BRE} {YARD}, {BR}, holding a folded paper, enjoying it", "LEFT")),
 ("c20", 6, S("c20", "Brenda", f"Close-up of {BRE} {YARD0}, {BR}, a cruel little smile, she looks at the daughter", XIM_B, "LEFT", "cruel, sweet, slow",
     f"Close-up of {BRE} {YARD}, {BR}, a little smile", "LEFT")),
 ("r4", 6, one(f"Close-up of {ART} {YARD}, {AC}, in silence, stunned, he slowly takes off his straw hat", "RIGHT") + " Slow push-in. No dialogue."),
 ("c21", 6, talk("c21", "Ximena", one(f"Close-up of {XIM} {YARD}, {XS}, stunned and hurt, her voice small", "RIGHT"), "stunned, hurt, soft")),
 # CTA con carisma (después del BLACK): Ximena sola, a cámara
 ("c22", 10, talk("c22", "Ximena", f"Close-up from the chest up of {XIM} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, wipes her forehead with the back of her hand, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small brave half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("¿Y qué vas a hacer, correrme?", "¿Y qué vas a hacer, sacarme?"), ("¿Por un árbol y una malcriada?", "¿Por un árbol y por ella?"),
        ("Y tú tratas a mi hija como a una peona.", "Y tú tienes a mi hija trabajando sola."), ("a cruel little smile", "a little smile"), ("his face darkens", "he becomes serious"),
        ("enjoying it", "calm"), ("fake", "polite"), ("her voice breaks a little", "softly"), ("stunned", "surprised"), ("defiant", "confident"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, hot golden late-afternoon light at a mango ranch in Sinaloa, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, mango packing area with wooden crates and a ranch house in northwest Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{XIMENA_LIZARRAGA}", "a young Mexican woman with a long dark-brown high ponytail, a faded green t-shirt and a canvas apron"),
         ("@{ARTURO_LIZARRAGA}", "a tall Mexican rancher in his fifties with a black goatee, a straw cowboy hat and a light-blue denim shirt"),
         ("@{BRENDA_OSUNA}", "a Mexican woman around forty with long wavy platinum-blonde hair, red lipstick and a white linen sundress"),
         (" @{LOC_RANCHOMANGO}", "")]
#@INCLUDE tail

"""Genera los clips de nuez-parras PARTE 1 (La Nuez de Parras, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada al hijo perdido -> el hijo es el jefe del villano -> plazo invertido -> giro familiar): en una nogalera de Parras, Coahuila,
Ulises (35) le tira la nuez a don Anacleto (74) y le da plazo "antes de que acabe la cosecha"; doña Refugio (68) le pide que llame a Mateo (40), el hijo que no ve hace quince años.
Mateo llega: Ulises trabaja para él. Giro: Ulises es hijo de Anacleto con otra mujer, hermano de Mateo.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (nogalera): Anacleto y Refugio a la IZQUIERDA (junto a los costales y la casa de adobe); Ulises y Mateo a la DERECHA (del lado del camino de tierra).
YARD0 = ("in a pecan orchard in Parras de la Fuente, Coahuila @{LOC_NOGALERA} during the autumn harvest in the late afternoon: rows of tall pecan trees with yellowing leaves, burlap sacks of pecans "
         "on the ground, an old adobe farmhouse, dry desert mountains behind, golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
SACK = "a burlap sack full of pecans"
PHONE = "an old small flip phone"
ANA = ("@{ANACLETO_DAVILA} (74-year-old Mexican man, thin, sun-weathered light-brown skin, white hair, white stubble, a beige straw hat, a faded denim work shirt)")
REF = ("@{REFUGIO_DAVILA} (68-year-old Mexican woman, plump, light-brown skin, short grey permed hair, small glasses on a chain, a blue cardigan over a floral print dress)")
ULI = ("@{ULISES_GARZA} (35-year-old Mexican man, tall and strong, light-brown skin, shaved head, a short black beard, mirrored sunglasses on his head, an olive-green bomber jacket over a grey t-shirt)")
MAT = ("@{MATEO_DAVILA} (40-year-old Mexican man, light-brown skin, short black hair with grey temples, clean-shaven, a charcoal-grey suit with an open white shirt)")
#@INCLUDE funcs1
# Bordes: Ulises o Mateo le hablan a Anacleto/Refugio -> espalda LEFT; Anacleto o Refugio les hablan -> espalda RIGHT.
ANA_B = "@{ANACLETO_DAVILA} seen from behind (beige straw hat, faded denim work shirt, thin)"
REF_B = "@{REFUGIO_DAVILA} seen from behind (short grey permed hair, blue cardigan)"
ULI_B = "@{ULISES_GARZA} seen from behind (shaved head, olive-green bomber jacket, broad shoulders)"
MAT_B = "@{MATEO_DAVILA} seen from behind (short black hair with grey at the sides, charcoal-grey suit jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
AL = f"standing on the LEFT beside {SACK} under a pecan tree"      # Anacleto
FL = "standing on the LEFT in front of the old adobe farmhouse"     # Refugio
UR = "standing on the RIGHT, leaning on a black pickup truck"       # Ulises
MR = "standing on the RIGHT on the dirt road"                       # Mateo

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ulises YA hablando recargado en su camioneta; Anacleto de espaldas (LEFT). Plazo: antes de que acabe la cosecha.
 ("c01", D8("c01"), S("c01", "Ulises", f"Medium close-up of {ULI} {YARD0}, {UR}, talking from the very first frame, arrogant, he points at the orchard with his chin", ANA_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {ULI} {YARD}, {UR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Anacleto", f"Close-up of {ANA} {YARD0}, {AL}, firm and proud", ULI_B, "RIGHT", "firm, proud, slow",
     f"Close-up of {ANA} {YARD}, {AL}, firm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Ulises", one(f"Close-up of {ULI} {YARD}, {UR}, a cocky smile, he spreads his arms", "LEFT"), "cocky, mocking")),
 ("r1", 6, f"Medium shot of {REF} {YARD}, {FL}, already in place, she steps out of the farmhouse door wiping her hands on a cloth and stops, worried, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('elderly woman in a blue cardigan')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Refugio", f"Close-up of {REF} {YARD0}, {FL}, worried, pleading softly", ULI_B, "RIGHT", "worried, pleading, soft",
     f"Close-up of {REF} {YARD}, {FL}, worried", "RIGHT")),
 ("c05", 6, S("c05", "Ulises", f"Close-up of {ULI} {YARD0}, {UR}, he laughs once with contempt", REF_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {ULI} {YARD}, {UR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a black boot slowly tips over {SACK} and the brown pecans spill across the dry dirt; only the boot, the sack and the pecans, no face. No dialogue."),
 ("c06", 6, S("c06", "Anacleto", f"Close-up of {ANA} {YARD0}, {AL}, his eyes shine, indignant but dignified", ULI_B, "RIGHT", "hurt, indignant",
     f"Close-up of {ANA} {YARD}, {AL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Ulises", one(f"Close-up of {ULI} {YARD}, {UR}, laughing, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {ANA} {YARD}, he slowly kneels on the dry dirt and starts picking up pecans one by one with shaking hands, dignified, "
           f"{SOLO}; {ALONE}; {NODOUBLE('old man in a straw hat')}. No dialogue."),
 ("c08", D8("c08"), (talk("c08", "Refugio", two(f"{REF} on the LEFT and {ANA} on the RIGHT, close together beside the spilled pecans {YARD0}, framed from the waist up; "
     f"Refugio speaks softly and urgently to her husband, slightly closer to the camera and in sharper focus") + " " + MOUTH("Refugio", "Anacleto"), "soft, urgent, low"),
   talk("c08", "Refugio", one(f"Close-up of {REF} {YARD}, {FL}, soft and urgent, looking at her husband", "RIGHT"), "soft, urgent, low"))),
 ("r3", 6, f"Medium shot of {ANA} {YARD}, {AL}, he takes {PHONE} out of his shirt pocket, hesitates, then slowly presses a number with his thumb, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c09", 6, talk("c09", "Anacleto", one(f"Close-up of {ANA} {YARD}, {AL}, holding {PHONE} to his ear, his voice breaks, his eyes shine", "RIGHT"), "emotional, low, humble")),
 ("i02", 6, "Wide shot of two black SUVs driving slowly along a dusty dirt road between rows of tall pecan trees in Parras, Coahuila, golden afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r4", 6, f"Medium shot of {MAT} {YARD}, {MR}, already standing in place, a black SUV behind him, he slowly takes off dark sunglasses, moved and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a charcoal suit')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Mateo", f"Close-up of {MAT} {YARD0}, {MR}, moved, his eyes shine, a small smile", ANA_B, "LEFT", "moved, warm, low",
     f"Close-up of {MAT} {YARD}, {MR}, moved, his eyes shine", "LEFT")),
 ("c11", 6, talk("c11", "Ulises", one(f"Close-up of {ULI} {YARD}, {UR}, his smile gone, pale and nervous, he takes the sunglasses off his head", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Mateo", one(f"Close-up of {MAT} {YARD}, {MR}, cold and serious, he looks at his employee", "RIGHT"), "cold, serious, slow")),
 ("c13", 6, talk("c13", "Ulises", one(f"Close-up of {ULI} {YARD}, {UR}, nervous, he raises both palms", "RIGHT"), "nervous, pleading")),
 ("c14", D8("c14"), talk("c14", "Mateo", one(f"Close-up of {MAT} {YARD}, {MR}, he points slowly at the pecans on the ground, cold and final", "RIGHT"), "cold, final, slow")),
 ("r5", 6, f"Medium shot of {ULI} {YARD}, kneeling on the dry dirt, he picks up pecans one by one and puts them back in the burlap sack, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in an olive bomber jacket')}. No dialogue."),
 ("c15", D8("c15"), talk("c15", "Ulises", one(f"Close-up of {ULI} {YARD}, kneeling, a pecan in his hand, a bitter smile, his voice low", "LEFT"), "bitter, low, slow")),
 ("c16", 6, S("c16", "Mateo", f"Close-up of {MAT} {YARD0}, {MR}, confused, he turns to his father", ANA_B, "LEFT", "confused, worried",
     f"Close-up of {MAT} {YARD}, {MR}, confused", "LEFT")),
 ("c17", D8("c17"), (talk("c17", "Anacleto", two(f"{ANA} on the LEFT and {MAT} on the RIGHT, in profile facing each other under the pecan trees {YARD0}, framed from the waist up; "
     f"Anacleto, ashamed, speaks low, slightly closer to the camera and in sharper focus") + " " + MOUTH("Anacleto", "Mateo"), "ashamed, low, slow"),
   talk("c17", "Anacleto", one(f"Close-up of {ANA} {YARD}, {AL}, ashamed, low", "RIGHT"), "ashamed, low, slow"))),
 ("c18", 6, talk("c18", "Refugio", one(f"Close-up of {REF} {YARD}, {FL}, stunned, her eyes fill with tears of anger, she takes off her glasses", "RIGHT"), "stunned, hurt")),
 # CTA con carisma (después del BLACK): Anacleto solo, a cámara
 ("c19", 10, talk("c19", "Anacleto", f"Close-up from the chest up of {ANA} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts the brim of his straw hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Recójala usted, viejo.", "Recójala usted, don."), ("A ver si todavía se puede agachar.", "Usted sabe cómo."), ("Pregúntele a su papá por qué lo odio.", "Pregúntele a su papá quién soy."),
        ("tips over", "moves"), ("with shaking hands", "slowly"), ("her eyes fill with tears of anger", "her eyes shine"), ("with contempt", "coldly"), ("contemptuous", "cool"),
        ("humiliated", "quiet"), ("stunned", "surprised"), ("bitter", "serious"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden autumn afternoon in a pecan orchard in Coahuila, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, pecan orchard with burlap sacks and an adobe farmhouse in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ANACLETO_DAVILA}", "a thin elderly Mexican man with white stubble, a beige straw hat and a faded denim shirt"),
         ("@{REFUGIO_DAVILA}", "a plump elderly Mexican woman with short grey permed hair, a blue cardigan and a floral dress"),
         ("@{ULISES_GARZA}", "a tall Mexican man in his thirties with a shaved head, a black beard and an olive-green bomber jacket"),
         ("@{MATEO_DAVILA}", "a Mexican man around forty with grey temples and a charcoal-grey suit with an open white shirt"),
         (" @{LOC_NOGALERA}", "")]
#@INCLUDE tail

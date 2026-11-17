"""Genera los clips de camaron-escuinapa PARTE 1 (El Camarón de Escuinapa, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada que el villano no cree -> llega el patrón -> plazo invertido -> giro): en un muelle de Escuinapa, Sinaloa, Braulio Zazueta (31)
corre a doña Chayo (63) de su puesto de camarón "antes de que salga la luna" y le tira la charola; su hija Itzel (27) la defiende. Chayo le marca "al Güero", que resulta ser don Teodoro (66),
el papá de Braulio y dueño de la flota, a quien ella sacó del mar. Plazo invertido. Giro: los barcos de la flota están a nombre de Chayo desde hace treinta años.
Copia del clips.py de sombrero-sahuayo (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (muelle): Chayo e Itzel a la IZQUIERDA (puesto de camarón); Braulio y Teodoro a la DERECHA (lado de las lanchas).
YARD0 = ("on a weathered wooden fishing dock on a lagoon in Escuinapa, Sinaloa @{LOC_MUELLEESCUINAPA} in the late afternoon: a small shrimp stall under a tarp, plastic trays of fresh shrimp on ice, "
         "nets and colorful fishing boats moored behind, palm trees and calm water, golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
TRAY = "a plastic tray full of fresh shrimp on ice"
CHA = ("@{ROSARIO_LIZARRAGA} (63-year-old Mexican woman, tanned brown skin, curly grey hair tied back with a red bandana, a turquoise sleeveless blouse, a white apron)")
ITZ = ("@{ITZEL_LIZARRAGA} (27-year-old Mexican woman, tanned skin, long curly dark-brown hair, a yellow t-shirt)")
BRA = ("@{BRAULIO_ZAZUETA} (31-year-old Mexican man, light skin, short spiky black hair, a thin mustache, a white western shirt with a black yoke, a thick gold chain)")
TEO = ("@{TEODORO_ZAZUETA} (66-year-old Mexican man, tall, fair sun-tanned skin, blond-grey hair, a blond-grey mustache, a white straw cowboy hat, a light-blue linen shirt)")
#@INCLUDE funcs1
# Bordes: Braulio o Teodoro le hablan a Chayo/Itzel -> espalda LEFT; Chayo o Itzel les hablan -> espalda RIGHT.
CHA_B = "@{ROSARIO_LIZARRAGA} seen from behind (curly grey hair tied with a red bandana, turquoise blouse, apron strings)"
ITZ_B = "@{ITZEL_LIZARRAGA} seen from behind (long curly dark-brown hair, yellow t-shirt)"
BRA_B = "@{BRAULIO_ZAZUETA} seen from behind (short spiky black hair, white western shirt with a black yoke)"
TEO_B = "@{TEODORO_ZAZUETA} seen from behind (white straw cowboy hat, light-blue linen shirt, tall)"
#@INCLUDE funcs2
#@INCLUDE d8
CL = "standing on the LEFT behind her shrimp stall"                 # Chayo
IL = "standing on the LEFT beside the shrimp stall"                 # Itzel
BR = "standing on the RIGHT on the dock, the moored boats behind him"   # Braulio
TR = "standing on the RIGHT on the dock, the lagoon behind him"         # Teodoro

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Braulio YA hablando frente al puesto; Chayo de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Braulio", f"Medium close-up of {BRA} {YARD0}, {BR}, talking from the very first frame, arrogant, he taps the edge of the stall with his knuckles", CHA_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {BRA} {YARD}, {BR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Chayo", f"Close-up of {CHA} {YARD0}, {CL}, calm and proud, her hands resting on the stall", BRA_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {CHA} {YARD}, {CL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Braulio", one(f"Close-up of {BRA} {YARD}, {BR}, a cold smile, he spreads his arms toward the boats", "LEFT"), "cocky, cold")),
 ("r1", 6, f"Medium shot of {ITZ} {YARD}, {IL}, already in place arranging shrimp trays, she stops and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young woman with curly hair')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Itzel", f"Close-up of {ITZ} {YARD0}, {IL}, firm and protective", BRA_B, "RIGHT", "firm, protective",
     f"Close-up of {ITZ} {YARD}, {IL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Braulio", f"Close-up of {BRA} {YARD0}, {BR}, he laughs once, mocking", ITZ_B, "LEFT", "mocking, contemptuous",
     f"Close-up of {BRA} {YARD}, {BR}, he laughs once", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: {TRAY} tips over and the shrimp and ice spill across the wet wooden planks of the dock; only the tray and the shrimp, no face, no people. No dialogue."),
 ("c06", 6, S("c06", "Chayo", f"Close-up of {CHA} {YARD0}, {CL}, her eyes shine, hurt but dignified, she looks down at the spilled shrimp", BRA_B, "RIGHT", "hurt, dignified",
     f"Close-up of {CHA} {YARD}, {CL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Braulio", one(f"Close-up of {BRA} {YARD}, {BR}, mocking, he wipes his hands on a rag and tosses it away", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {CHA} {YARD}, she slowly crouches and gathers spilled shrimp back into the plastic tray with both hands, with dignity, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman with a red bandana')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Chayo", two(f"{CHA} on the LEFT and {ITZ} on the RIGHT, close together at the stall {YARD0}, framed from the waist up; "
     f"Chayo speaks calmly to her daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Chayo", "Itzel"), "calm, firm, low"),
   talk("c08", "Chayo", one(f"Close-up of {CHA} {YARD}, {CL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Braulio", one(f"Close-up of {BRA} {YARD}, {BR}, laughing, amused", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two dark SUVs driving slowly along a sandy road beside a lagoon with moored colorful fishing boats and palm trees in Sinaloa, golden late-afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {TEO} {YARD}, {TR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a white straw hat')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Teodoro", f"Close-up of {TEO} {YARD0}, {TR}, warm and respectful, he touches the brim of his hat", CHA_B, "LEFT", "warm, respectful",
     f"Close-up of {TEO} {YARD}, {TR}, warm and respectful", "LEFT")),
 ("c11", 6, talk("c11", "Braulio", one(f"Close-up of {BRA} {YARD}, {BR}, he turns around, his smile gone, pale", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Teodoro", one(f"Close-up of {TEO} {YARD}, {TR}, cold and serious, he looks at his son", "RIGHT"), "cold, serious, slow")),
 ("c13", D8("c13"), talk("c13", "Teodoro", one(f"Close-up of {TEO} {YARD}, {TR}, he gestures at the spilled shrimp, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {BRA} {YARD}, he crouches on the dock and puts the spilled shrimp back into the tray with his hands, head lowered, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a white western shirt')}. No dialogue."),
 ("c14", 6, S("c14", "Itzel", f"Close-up of {ITZ} {YARD0}, {IL}, grateful but puzzled", TEO_B, "RIGHT", "grateful, puzzled",
     f"Close-up of {ITZ} {YARD}, {IL}, grateful but puzzled", "RIGHT")),
 ("c15", 6, S("c15", "Teodoro", f"Close-up of {TEO} {YARD0}, {TR}, serious, he looks at the woman meaningfully", CHA_B, "LEFT", "serious, low",
     f"Close-up of {TEO} {YARD}, {TR}, serious", "LEFT")),
 ("c16", 6, talk("c16", "Itzel", one(f"Close-up of {ITZ} {YARD}, {IL}, confused and worried", "RIGHT"), "confused, worried")),
 ("c17", D8("c17"), (talk("c17", "Chayo", two(f"{ITZ} on the LEFT and {CHA} on the RIGHT, facing each other at the stall {YARD0}, framed from the waist up; "
     f"Chayo, calm and firm, speaks low to her daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Chayo", "Itzel"), "low, firm, slow"),
   talk("c17", "Chayo", one(f"Close-up of {CHA} {YARD}, {CL}, low and firm", "LEFT"), "low, firm, slow"))),
 # CTA con carisma (después del BLACK): Chayo sola, a cámara
 ("c18", 10, talk("c18", "Chayo", f"Close-up from the chest up of {CHA} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, adjusts her red bandana, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Y tú le tiras su camarón.", "Y tú le maltratas su camarón."), ("Ese viejo ni ha de existir, doña.", "Ese señor ni ha de existir, doña."),
        ("tips over", "sits"), ("humiliated", "quiet"), ("contemptuous", "cool"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden late-afternoon light on a wooden fishing dock with a shrimp stall in Sinaloa, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, fishing dock with boats in a Mexican coastal town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROSARIO_LIZARRAGA}", "a Mexican woman in her sixties with tanned skin, curly grey hair tied back with a red bandana, a turquoise blouse and a white apron"),
         ("@{ITZEL_LIZARRAGA}", "a Mexican woman in her late twenties with long curly dark-brown hair and a yellow t-shirt"),
         ("@{BRAULIO_ZAZUETA}", "a Mexican man in his thirties with short spiky black hair, a thin mustache, a white western shirt and a gold chain"),
         ("@{TEODORO_ZAZUETA}", "a tall Mexican man in his sixties with blond-grey hair and mustache, a white straw cowboy hat and a light-blue linen shirt"),
         (" @{LOC_MUELLEESCUINAPA}", "")]
#@INCLUDE tail

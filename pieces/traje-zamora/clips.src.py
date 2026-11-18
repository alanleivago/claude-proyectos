"""Genera los clips de traje-zamora PARTE 1 (El Sastre de Zamora, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #5 "El sastre del pueblo" [CAPO] (Identidad oculta), cierre tipo 1 (entra un personaje inesperado): el cacique don Fulgencio (64) manda hacer su traje de boda con el sastre Abundio (62).
Al medirlo, Abundio reconoce la cicatriz de su mano: es el hombre que se llevó a su prometida una semana antes de la boda. Fulgencio se burla. Entra la novia, Amparo (58), y se queda helada al ver al sastre.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (sastrería): Fulgencio a la DERECHA frente al espejo alto; Abundio a la IZQUIERDA junto al mostrador; Amparo entra por la puerta de madera y vidrio.
YARD0 = ("inside an old tailor shop in the historic center of Zamora, Michoacán @{LOC_SASTRERIAZAMORA} in the afternoon: dark wooden counter, shelves with bolts of fabric, an antique black sewing machine, "
         "a dressmaker mannequin with a half-made black suit jacket, a tall standing mirror, warm sunlight through a tall window; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
FUL = ("@{FULGENCIO_RANGEL} (64-year-old Mexican man, tanned light skin, thick grey hair combed back, a grey goatee, heavy eyebrows, a white dress shirt with a black vest and a gold pocket-watch chain)")
ABU = ("@{ABUNDIO_TREVINO} (62-year-old Mexican man, light-brown skin, thin face, neatly combed grey hair, round wire-rimmed glasses, a brown knitted cardigan, a yellow measuring tape around his neck)")
AMP = ("@{AMPARO_LEDESMA} (58-year-old Mexican woman, fair skin, shoulder-length wavy chestnut hair, small gold earrings, a pale-rose silk dress with long sleeves, a cream shawl)")
#@INCLUDE funcs1
FUL_B = "@{FULGENCIO_RANGEL} seen from behind (thick grey hair combed back, black vest over a white shirt)"
ABU_B = "@{ABUNDIO_TREVINO} seen from behind (neatly combed grey hair, brown knitted cardigan)"
#@INCLUDE funcs2
#@INCLUDE d8
FR = "standing on the RIGHT in front of the tall mirror"
AL = "standing on the LEFT by the wooden counter"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Fulgencio YA hablando, arrogante, Abundio de espaldas en el borde.
 ("c01", 6, S("c01", "Fulgencio", f"Medium close-up of {FUL} {YARD0}, {FR}, talking from the very first frame, arrogant and pleased with himself, arms slightly open", ABU_B, "LEFT", "arrogant, proud, loud",
     f"Medium close-up of {FUL} {YARD}, {FR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, quiet and polite, he takes the measuring tape from his neck", FUL_B, "RIGHT", "quiet, polite, humble",
     f"Close-up of {ABU} {YARD}, {AL}, quiet and polite, holding the measuring tape", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, arms raised to be measured, smug, looking at himself in the mirror", ABU_B, "LEFT", "smug, condescending",
     f"Close-up of {FUL} {YARD}, {FR}, arms raised, smug", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a man's raised right hand and forearm in a rolled-up WHITE dress-shirt sleeve (no jacket, no dark sleeve), a gold ring, and a long thick pale old scar clearly visible running diagonally across the back of the hand; a yellow measuring tape held against the wrist; the scar is the focus, sharp and obvious; only the arm and hand, no faces. No dialogue."),
 ("r1", 6, one(f"Close-up of {ABU} {YARD}, {AL}, frozen, staring down at something, behind his glasses his eyes widen, the measuring tape still in his hands, completely still", "RIGHT") + " Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, he lowers his arms, annoyed and suspicious, rubbing the back of his right hand", ABU_B, "LEFT", "annoyed, suspicious, curt",
     f"Close-up of {FUL} {YARD}, {FR}, annoyed and suspicious", "LEFT")),
 ("c05", 6, S("c05", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, calm on the surface, his jaw tight, he slowly takes off his glasses", FUL_B, "RIGHT", "calm, contained, slow",
     f"Close-up of {ABU} {YARD}, {AL}, calm, slowly taking off his glasses", "RIGHT")),
 ("c06", 6, S("c06", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, a cold half smile, warning him with one raised finger", ABU_B, "LEFT", "cold, warning, superior",
     f"Close-up of {FUL} {YARD}, {FR}, a cold half smile", "LEFT")),
 ("c07", D8("c07"), S("c07", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, eyes wet but steady, an old pain in his voice", FUL_B, "RIGHT", "painful, low, steady",
     f"Close-up of {ABU} {YARD}, {AL}, eyes wet but steady", "RIGHT")),
 ("c08", 6, S("c08", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, a short cruel laugh, he adjusts his vest in the mirror", ABU_B, "LEFT", "mocking, cruel, relaxed",
     f"Close-up of {FUL} {YARD}, {FR}, a short laugh, adjusting his vest", "LEFT")),
 ("c09", 6, S("c09", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, dignified, he puts his glasses back on, a faint enigmatic smile", FUL_B, "RIGHT", "dignified, quiet, enigmatic",
     f"Close-up of {ABU} {YARD}, {AL}, dignified, a faint smile", "RIGHT")),
 ("c10", 6, S("c10", "Fulgencio", f"Close-up of {FUL} {YARD0}, {FR}, he turns his head toward the front door, smiling proudly", ABU_B, "LEFT", "proud, pleased, warm",
     f"Close-up of {FUL} {YARD}, {FR}, turning toward the door, smiling proudly", "LEFT")),
 ("r2", 6, one(f"Medium shot of {AMP} {YARD}, standing just inside the wooden front door of the tailor shop, she was smiling, then her smile fades, one hand goes to her chest, she stares at someone across the room, frozen", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", 6, talk("c11", "Fulgencio", two(f"{FUL} on the RIGHT and {AMP} on the LEFT {YARD0}, framed from the waist up near the front door; he holds her arm, confused, looking at her pale face; "
     f"she does not look at him, she stares past him toward the counter") + " " + MOUTH("Fulgencio", "Amparo"), "confused, uneasy, gentle")),
 ("r3", 6, one(f"Close-up of {ABU} {YARD}, {AL}, looking toward the front door, the yellow measuring tape slowly slips from his fingers, his eyes fill with tears, no words", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Abundio a cámara
 ("c12", 10, talk("c12", "Abundio", f"Close-up from the chest up of {ABU} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, adjusts his round glasses, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("mocking, cruel", "amused"), ("cruel", "proud"), ("mocking", "amused"), ("arrogant", "proud"), ("condescending", "superior"), ("painful", "sad"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light inside an old tailor shop in Michoacán, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old tailor shop with bolts of fabric in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FULGENCIO_RANGEL}", "a powerful Mexican man in his sixties with grey hair combed back, a grey goatee, a white shirt and a black vest with a gold watch chain"),
         ("@{ABUNDIO_TREVINO}", "a thin Mexican tailor in his sixties with combed grey hair, round wire glasses, a brown cardigan and a yellow measuring tape around his neck"),
         ("@{AMPARO_LEDESMA}", "an elegant Mexican woman in her late fifties with wavy chestnut hair, a pale-rose silk dress and a cream shawl"),
         (" @{LOC_SASTRERIAZAMORA}", "")]
#@INCLUDE tail

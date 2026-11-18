"""Genera los clips de viajante-sombrerete PARTE 1 (El Viajante de Sombrerete, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #12 "El viajante" [CAPO] (Doble vida y secretos), cierre tipo 1 (entra un personaje inesperado): en la tienda de Sombrerete, Remigio (55) y su socio Baltasar (48) desconfían
del viajante Aurelio (62), que pregunta por las cartas que la gente deja para el patrón. Aurelio encuentra una carta a medio quemar en la estufa. Baltasar va a la hacienda a avisarle al patrón...
y encuentra al viajante sentado en la silla del patrón.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (tienda): Remigio y Baltasar a la DERECHA detrás del mostrador; Aurelio a la IZQUIERDA junto a los costales y la estufa. Despacho: Aurelio sentado en la silla tallada.
YARD0 = ("inside an old general store in Sombrerete, Zacatecas @{LOC_TIENDASOMBRERETE} in the afternoon: a long dark wooden counter, shelves full of jars, sacks of beans and corn, "
         "an old cast-iron wood stove in the corner, hanging lanterns, dusty warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
OFF = ("in the office of an old wealthy hacienda in Zacatecas @{LOC_DESPACHOSOMBRERETE} in the afternoon: a huge carved dark-wood desk, a tall carved wooden chair like a throne, stone walls, "
       "sunlight from a big window, bookshelves; no readable text, no signs, no logos; nobody else in the background, no extras, nobody besides the person described")
AUR = ("@{AURELIO_MONTES} (62-year-old Mexican man, light-brown skin, short salt-and-pepper hair, a neat grey mustache, calm sharp eyes, a worn beige travel jacket over a light-blue shirt, a small grey fedora)")
AUR_RICH = ("@{AURELIO_MONTES} (62-year-old Mexican man, light-brown skin, short salt-and-pepper hair, a neat grey mustache, calm sharp eyes; same face, but now wearing an elegant charcoal three-piece suit with a white shirt, no hat)")
REM = ("@{REMIGIO_PENA} (55-year-old Mexican man, brown skin, balding with black hair on the sides, a round face, a thin black mustache, a white shirt with a brown cardigan vest, reading glasses on a cord)")
BAL = ("@{BALTASAR_RUELAS} (48-year-old Mexican man, light skin, slicked black hair, a sharp hard face, a short black beard, a dark-red western shirt, a black leather jacket)")
#@INCLUDE funcs1
AUR_B = "@{AURELIO_MONTES} seen from behind (small grey fedora, worn beige travel jacket)"
REM_B = "@{REMIGIO_PENA} seen from behind (balding head with black hair on the sides, brown cardigan vest over a white shirt)"
BAL_B = "@{BALTASAR_RUELAS} seen from behind (slicked black hair, black leather jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
RR = "standing on the RIGHT behind the wooden counter"
BR = "standing on the RIGHT behind the counter, next to his partner"
AL = "standing on the LEFT by the sacks of corn, near the old stove"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Remigio YA hablando bajito con Baltasar detrás del mostrador.
 ("c01", 6, S("c01", "Remigio", f"Medium close-up of {REM} {YARD0}, {RR}, talking from the very first frame, whispering, suspicious, glancing sideways toward the back of the store", BAL_B, "LEFT", "whispering, suspicious, nervous",
     f"Medium close-up of {REM} {YARD}, {RR}, talking from the very first frame, whispering and suspicious", "LEFT")),
 ("c02", 6, S("c02", "Baltasar", f"Close-up of {BAL} {YARD0}, {BR}, dismissive, leaning on the counter, a cold smirk", REM_B, "LEFT", "dismissive, cold, low",
     f"Close-up of {BAL} {YARD}, {BR}, dismissive, a cold smirk", "LEFT")),
 ("c03", D8("c03"), S("c03", "Aurelio", f"Close-up of {AUR} {YARD0}, {AL}, polite and friendly, he touches the brim of his fedora", REM_B, "RIGHT", "polite, friendly, curious",
     f"Close-up of {AUR} {YARD}, {AL}, polite and friendly", "RIGHT")),
 ("c04", 6, S("c04", "Remigio", f"Close-up of {REM} {YARD0}, {RR}, a forced nervous smile, rubbing his hands", AUR_B, "LEFT", "nervous, overly friendly",
     f"Close-up of {REM} {YARD}, {RR}, a forced nervous smile", "LEFT")),
 ("c05", 6, S("c05", "Aurelio", f"Close-up of {AUR} {YARD0}, {AL}, calm, a faint ironic smile, studying the man", REM_B, "RIGHT", "calm, ironic, slow",
     f"Close-up of {AUR} {YARD}, {AL}, calm, a faint ironic smile", "RIGHT")),
 ("c06", 6, S("c06", "Baltasar", f"Close-up of {BAL} {YARD0}, {BR}, hostile, he straightens up and points at the door", AUR_B, "LEFT", "hostile, sharp, warning",
     f"Close-up of {BAL} {YARD}, {BR}, hostile", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: the open door of an old cast-iron wood stove, inside among grey ashes a half-burned paper envelope with charred edges and a dark-red wax seal; no readable text, no people, no hands. No dialogue."),
 ("c07", 6, S("c07", "Aurelio", f"Close-up of {AUR} {YARD0}, {AL}, holding up a half-burned envelope with charred edges, calm and serious, his eyes hard now", REM_B, "RIGHT", "calm, serious, cutting",
     f"Close-up of {AUR} {YARD}, {AL}, holding up a half-burned envelope, serious", "RIGHT")),
 ("r1", 6, one(f"Close-up of {REM} {YARD}, {RR}, frozen, his face goes pale, sweat on his forehead, his reading glasses slip from his fingers, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Baltasar", f"Close-up of {BAL} {YARD0}, {BR}, tense and angry, talking low to his partner, he grabs his leather jacket collar", REM_B, "LEFT", "tense, low, decided",
     f"Close-up of {BAL} {YARD}, {BR}, tense, talking low", "LEFT")),
 ("r2", 6, one(f"Medium shot of {BAL} {OFF}, he walks in through the office door confidently, then suddenly stops dead, his confident face turns to shock, staring at the carved chair", "RIGHT") + " No dialogue."),
 ("r3", 6, one(f"Medium shot of {AUR_RICH} {OFF}, seated calmly in the tall carved wooden chair behind the huge desk, hands folded, a slow knowing smile", "LEFT") + " Slow push-in. No dialogue."),
 ("c09", 6, talk("c09", "Aurelio", ots(f"Close-up of {AUR_RICH} {OFF}, seated in the tall carved wooden chair, calm, powerful, a small smile", BAL_B, "LEFT") + " " + MOUTH("Aurelio", "the listener"), "calm, powerful, ironic")),
 # CTA con carisma (después del BLACK): Aurelio a cámara
 ("c10", 10, talk("c10", "Aurelio", f"Close-up from the chest up of {AUR_RICH} {OFF}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, adjusts the lapel of his suit, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile.",
     "charismatic, calm, powerful, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("hostile, sharp, warning", "firm, serious"), ("hostile", "unfriendly"), ("tense and angry", "tense"), ("angry", "upset"), ("cutting", "firm"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, dusty warm afternoon light in an old general store in Zacatecas, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican general store, steady camera. Same faces as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{AURELIO_MONTES}", "a Mexican man in his sixties with salt-and-pepper hair and a neat grey mustache"),
         ("@{REMIGIO_PENA}", "a balding round-faced Mexican shopkeeper in his fifties with a thin mustache and a brown cardigan vest"),
         ("@{BALTASAR_RUELAS}", "a hard-faced Mexican man in his late forties with slicked black hair, a short black beard and a black leather jacket"),
         (" @{LOC_TIENDASOMBRERETE}", ""), (" @{LOC_DESPACHOSOMBRERETE}", "")]
#@INCLUDE tail

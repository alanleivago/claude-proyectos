"""Genera los clips de sobre-alamos PARTE 1 (El Sobre de Álamos, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #7 "La silla vacía" [CAPO], cierre tipo 2 (se lee un documento y se corta antes del dato clave): en la lectura del testamento del hacendado don Ignacio Robles, en Álamos, Sonora,
el notario Barragán (60) pide esperar a un heredero más. Los hijos Fernando (45) y Lorena (42) se burlan. Entra el capataz Nicanor (62) y se sienta en la silla vacía. El notario abre un sobre con su
nombre: "Nicanor Durán no es mi empleado… Nicanor Durán es mi…" Corte.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (despacho): Fernando y Lorena sentados a la IZQUIERDA de la mesa; el notario de pie a la DERECHA en la cabecera; la silla vacía y la puerta a la DERECHA.
YARD0 = ("in the study of an old colonial hacienda in Álamos, Sonora @{LOC_DESPACHOALAMOS} in the afternoon: thick white walls, a tall wooden door, a long dark wooden table with high-backed leather chairs, "
         "one empty leather armchair at the end, bookshelves, a barred window with sunlight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
ENV = "a thick cream envelope closed with a red wax seal"
BAR = ("@{LIC_BARRAGAN} (60-year-old Mexican man, thin, light skin, white hair neatly combed, round tortoiseshell glasses, a charcoal-grey three-piece suit, a dark-green tie)")
FER = ("@{FERNANDO_ROBLES} (45-year-old Mexican man, fair skin, short light-brown hair, a trimmed beard, a black suit jacket over a white open-collar shirt)")
LOR = ("@{LORENA_ROBLES} (42-year-old Mexican woman, fair skin, shoulder-length blonde-highlighted hair, sunglasses pushed on her head, a black fitted mourning dress, a pearl necklace)")
NIC = ("@{NICANOR_DURAN} (62-year-old Mexican man, dark sun-tanned wrinkled skin, short grey hair, a grey mustache, a faded denim shirt buttoned to the neck, holding a beige straw cowboy hat)")
#@INCLUDE funcs1
BAR_B = "@{LIC_BARRAGAN} seen from behind (white neatly combed hair, charcoal-grey suit)"
FER_B = "@{FERNANDO_ROBLES} seen from behind (short light-brown hair, black suit jacket)"
LOR_B = "@{LORENA_ROBLES} seen from behind (shoulder-length blonde-highlighted hair, black dress)"
NIC_B = "@{NICANOR_DURAN} seen from behind (short grey hair, faded denim shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
BR = "standing on the RIGHT at the head of the long table"
FL = "sitting on the LEFT at the long table"
LL = "sitting on the LEFT at the long table, legs crossed"
NR = "standing on the RIGHT by the tall wooden door"
NS = "sitting on the RIGHT in the leather armchair at the end of the table"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): el notario YA hablando, la mano sobre el respaldo de la silla vacía; Fernando de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "el notario", f"Medium close-up of {BAR} {YARD0}, {BR}, talking from the very first frame, solemn, his hand resting on the back of the empty leather armchair", FER_B, "LEFT", "solemn, calm, slow",
     f"Medium close-up of {BAR} {YARD}, {BR}, talking from the very first frame, solemn", "LEFT")),
 ("c02", 6, S("c02", "Fernando", f"Close-up of {FER} {YARD0}, {FL}, impatient and arrogant, he checks his gold watch", BAR_B, "RIGHT", "impatient, arrogant",
     f"Close-up of {FER} {YARD}, {FL}, impatient", "RIGHT")),
 ("c03", 6, talk("c03", "Lorena", one(f"Close-up of {LOR} {YARD}, {LL}, a mocking smile, she rolls her eyes", "RIGHT"), "mocking, bored")),
 ("i01", 6, f"Close-up insert {YARD0}: the empty high-backed leather armchair at the end of the long wooden table, a ray of sunlight from the barred window falls on it; no people. No dialogue."),
 ("r1", 6, f"Medium shot of {NIC} {YARD}, {NR}, already standing in place in the doorway, humble and serious, holding his straw hat against his chest, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a faded denim shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Fernando", f"Close-up of {FER} {YARD0}, {FL}, annoyed and superior", NIC_B, "RIGHT", "annoyed, superior",
     f"Close-up of {FER} {YARD}, {FL}, annoyed", "RIGHT")),
 ("c05", 6, S("c05", "el notario", f"Close-up of {BAR} {YARD0}, {BR}, respectful, he pulls out the empty armchair with one hand", NIC_B, "RIGHT", "respectful, calm",
     f"Close-up of {BAR} {YARD}, {BR}, respectful", "RIGHT")),
 ("c06", 6, S("c06", "Lorena", f"Close-up of {LOR} {YARD0}, {LL}, she laughs, outraged", BAR_B, "RIGHT", "outraged, mocking",
     f"Close-up of {LOR} {YARD}, {LL}, outraged", "RIGHT")),
 ("c07", 6, S("c07", "Nicanor", f"Close-up of {NIC} {YARD0}, {NR}, humble and confused, turning his hat in his hands", LOR_B, "LEFT", "humble, confused, low",
     f"Close-up of {NIC} {YARD}, {NR}, humble and confused", "LEFT")),
 ("r2", 6, f"Medium shot of {NIC} {YARD}, he slowly sits down in the leather armchair at the end of the table, uncomfortable, and places his straw hat on his knee; {SOLO}; {ALONE}; {NODOUBLE('man in a faded denim shirt')}. Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "el notario", one(f"Close-up of {BAR} {YARD}, {BR}, holding up {ENV}, serious", "LEFT"), "serious, solemn")),
 ("c09", 6, S("c09", "Fernando", f"Close-up of {FER} {YARD0}, {FL}, contemptuous, leaning back", BAR_B, "RIGHT", "contemptuous, impatient",
     f"Close-up of {FER} {YARD}, {FL}, contemptuous", "RIGHT")),
 ("r3", 6, f"Close-up insert {YARD0}: hands in a charcoal-grey suit break the red wax seal of {ENV} and unfold a handwritten letter; only the hands and the paper, no readable text, no face. No dialogue."),
 ("c10", D8("c10"), talk("c10", "el notario", one(f"Close-up of {BAR} {YARD}, {BR}, reading aloud from a handwritten letter, he adjusts his glasses, solemn", "LEFT"), "solemn, reading aloud, slow")),
 ("c11", 6, talk("c11", "Lorena", one(f"Close-up of {LOR} {YARD}, {LL}, her smile gone, she sits up straight, nervous", "RIGHT"), "nervous, sharp")),
 ("c12", 6, talk("c12", "el notario", one(f"Close-up of {BAR} {YARD}, {BR}, reading the letter, he stops mid-sentence and slowly looks up toward the man in the armchair", "LEFT"), "solemn, slow, hesitant")),
 ("r4", 6, one(f"Close-up of {NIC} {YARD}, {NS}, in silence, his eyes wide, his hands tighten on his straw hat", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Nicanor solo, a cámara
 ("c13", 10, talk("c13", "Nicanor", f"Close-up from the chest up of {NIC} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, puts on his straw hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small humble half smile. Nobody else around.",
     "charismatic, humble, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Licenciado, esto tiene que ser una broma.", "Licenciado, esto no puede ser."), ("contemptuous", "impatient"), ("outraged", "surprised"),
        ("break the red wax seal of", "open"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, afternoon sunlight in the study of an old colonial hacienda in Sonora, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, colonial hacienda study with a long wooden table, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LIC_BARRAGAN}", "a thin Mexican man around sixty with neatly combed white hair, round tortoiseshell glasses and a charcoal-grey three-piece suit"),
         ("@{FERNANDO_ROBLES}", "a Mexican man in his forties with short light-brown hair, a trimmed beard and a black suit jacket over a white shirt"),
         ("@{LORENA_ROBLES}", "a Mexican woman in her forties with blonde-highlighted hair, sunglasses on her head and a black dress with pearls"),
         ("@{NICANOR_DURAN}", "a Mexican man in his sixties with dark tanned skin, a grey mustache, a faded denim shirt and a straw cowboy hat"),
         (" @{LOC_DESPACHOALAMOS}", "")]
#@INCLUDE tail

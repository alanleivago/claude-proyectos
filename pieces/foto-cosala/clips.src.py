"""Genera los clips de foto-cosala PARTE 1 (La Foto del Cumpleaños, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #41 "La foto del cumpleaños" [CAPO] (Chantajes y pruebas), cierre tipo 4 (el villano descubre que lo oyeron): en la cocina de la fiesta de cumpleaños de don Cipriano en Cosalá,
Fabián (24), ayudante de la banquetera (ropa de diario), recoge una foto que se le cayó a Benito (52), el socio del patrón: Benito abrazado con don Horacio Lugo, el rival de don Cipriano.
Benito lo presiona para que la devuelva y calle; Fabián toca el celular en su bolsa de la camisa: "Todo lo que dijo se quedó aquí". Benito se da cuenta de que lo grabó.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (cocina): Benito a la DERECHA junto a la puerta con luces de fiesta; Fabián a la IZQUIERDA junto a la mesa de trabajo con charolas de copas.
KIT0 = ("in the large old kitchen of a rancher's colonial house in Cosala, Sinaloa @{LOC_COCINACOSALA} at night during a party: yellow tiled walls, copper pots hanging, a long wooden work table with trays of glasses and plates, "
        "a doorway with warm light and blurred party lights beyond; no readable text, no signs, no logos")
KIT = KIT0 + "; nobody else in the background, no extras, nobody besides the person described"
BEN = ("@{BENITO_QUIROGA} (52-year-old Mexican man, light-brown skin, slicked-back dark hair greying at the sides, a thin trimmed goatee, small cold eyes, a charcoal-grey suit jacket over an open-collar black shirt)")
FAB = ("@{FABIAN_ROSAS} (24-year-old Mexican young man, brown skin, short curly black hair, clean-shaven, honest dark eyes, a plain white long-sleeve shirt with rolled sleeves, a smartphone in his shirt pocket)")
#@INCLUDE funcs1
BEN_B = "@{BENITO_QUIROGA} seen from behind (slicked-back dark hair greying at the sides, charcoal-grey suit jacket)"
FAB_B = "@{FABIAN_ROSAS} seen from behind (short curly black hair, plain white shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
BR = "standing on the RIGHT by the doorway with the party lights"
FL = "standing on the LEFT by the work table with trays of glasses"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Benito YA hablando, tenso, la mano extendida; Fabián de espaldas en el borde con la foto.
 ("c01", 6, S("c01", "Benito", f"Medium close-up of {BEN} {KIT0}, {BR}, talking from the very first frame, tense and cold, one open hand held out, eyes fixed on a small printed photo in the young man's hand", FAB_B, "LEFT", "tense, cold, controlled",
     f"Medium close-up of {BEN} {KIT}, {BR}, talking from the very first frame, tense and cold, one hand held out", "LEFT")),
 ("c02", 6, S("c02", "Fabián", f"Close-up of {FAB} {KIT0}, {FL}, holding a small printed photo face down, surprised, a little nervous", BEN_B, "RIGHT", "surprised, nervous, polite",
     f"Close-up of {FAB} {KIT}, {FL}, holding a small photo, a little nervous", "RIGHT")),
 ("c03", 6, S("c03", "Benito", f"Close-up of {BEN} {KIT0}, {BR}, stepping closer, voice low, studying the young man's face", FAB_B, "LEFT", "low, suspicious, pressing",
     f"Close-up of {BEN} {KIT}, {BR}, voice low, suspicious", "LEFT")),
 ("c04", D8("c04"), S("c04", "Fabián", f"Close-up of {FAB} {KIT0}, {FL}, he swallows and answers honestly, glancing down at the photo and back up", BEN_B, "RIGHT", "honest, uneasy, quiet",
     f"Close-up of {FAB} {KIT}, {FL}, honest and uneasy", "RIGHT")),
 ("i01", 6, f"Close-up insert {KIT0}: a young man's hand holding a small printed color photograph showing two men in their fifties hugging and smiling at a restaurant table, one of them with slicked-back greying hair and a thin goatee; no readable text, no letters, no logos. No dialogue."),
 ("c05", 6, S("c05", "Benito", f"Close-up of {BEN} {KIT0}, {BR}, a forced thin smile, cold eyes, adjusting his gold signet ring", FAB_B, "LEFT", "cold, dismissive, condescending",
     f"Close-up of {BEN} {KIT}, {BR}, forced thin smile, cold eyes", "LEFT")),
 ("c06", D8("c06"), S("c06", "Fabián", f"Close-up of {FAB} {KIT0}, {FL}, he straightens up, his voice steady now, loyal and firm", BEN_B, "RIGHT", "loyal, steady, firm",
     f"Close-up of {FAB} {KIT}, {FL}, steady, loyal and firm", "RIGHT")),
 ("c07", D8("c07"), S("c07", "Benito", f"Close-up of {BEN} {KIT0}, {BR}, a short mocking laugh, then hard, leaning in", FAB_B, "LEFT", "mocking, arrogant, hard",
     f"Close-up of {BEN} {KIT}, {BR}, mocking, leaning in", "LEFT")),
 ("c08", 6, S("c08", "Benito", f"Close-up of {BEN} {KIT0}, {BR}, hand held out again, a quiet pressing voice", FAB_B, "LEFT", "quiet, pressing, cold",
     f"Close-up of {BEN} {KIT}, {BR}, hand held out, quiet and pressing", "LEFT")),
 ("c09", 6, S("c09", "Fabián", f"Close-up of {FAB} {KIT0}, {FL}, calm now, he taps twice with two fingers on the smartphone in his shirt pocket, the screen lit, a small steady look", BEN_B, "RIGHT", "calm, quiet, confident",
     f"Close-up of {FAB} {KIT}, {FL}, calm, tapping the smartphone in his shirt pocket", "RIGHT")),
 ("r1", 6, one(f"Close-up of {BEN} {KIT}, {BR}, frozen, his eyes drop slowly to the young man's shirt pocket, his forced smile disappears, his jaw tightens, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r2", 6, one(f"Close-up of {FAB} {KIT}, {FL}, holding the gaze in silence, the lit smartphone visible in his shirt pocket, he slowly puts the photo inside his shirt pocket too", "RIGHT") + " No dialogue."),
 # CTA con carisma (después del BLACK): Fabián a cámara
 ("c10", 10, talk("c10", "Fabián", f"Close-up from the chest up of {FAB} {KIT}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, taps the smartphone in his shirt pocket, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("mocking, arrogant, hard", "mocking, arrogant"), ("cold, dismissive, condescending", "cold, dismissive"), ("pressing", "insistent"), ("jaw tightens", "face tenses"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm night light in the old kitchen of a rancher's house during a party in Sinaloa, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican house kitchen at night with party lights in the doorway, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{BENITO_QUIROGA}", "a Mexican man in his fifties with slicked-back greying hair, a thin goatee and a charcoal-grey suit jacket over a black shirt"),
         ("@{FABIAN_ROSAS}", "a young Mexican man with short curly black hair in a plain white shirt with rolled sleeves and a phone in his shirt pocket"),
         (" @{LOC_COCINACOSALA}", "")]
#@INCLUDE tail

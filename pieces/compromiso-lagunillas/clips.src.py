"""Genera los clips de compromiso-lagunillas PARTE 1 (El Compromiso de Lagunillas, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #34 "El hijo del hacendado y la hija del rival" [CAPO] (Capos, caciques y patrones), cierre tipo 3 (palabra reveladora / confesión): en el jardín de su hacienda en San Pedro Lagunillas,
don Lázaro (66) rechaza a Carolina Benavides (27), novia de su hijo Marcelo (30): las familias no se hablan hace treinta años. Su esposa Estela (61) sale, reconoce en Carolina los ojos de su padre
y confiesa: "Yo estuve comprometida con su padre".
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (jardín): Lázaro a la DERECHA junto a los arcos de la fachada; Estela llega por la DERECHA y queda junto a él; Marcelo y Carolina a la IZQUIERDA, lado a lado, frente a la laguna.
GAR0 = ("in the front garden of an old hacienda by the lagoon of San Pedro Lagunillas, Nayarit @{LOC_JARDINLAGUNILLAS} in the warm late afternoon: green lawn, tall royal palms, a white facade with arches and a red tile roof, hibiscus in terracotta pots, "
        "the calm lagoon and green hills behind; no readable text, no signs, no logos")
GAR = GAR0 + "; nobody else in the background, no extras, nobody besides the person described"
LAZ = ("@{LAZARO_UGALDE} (66-year-old Mexican man, tanned skin, short grey hair, a thick grey mustache, bushy eyebrows, stern dark eyes, a white guayabera shirt, a cream palm hat)")
EST = ("@{ESTELA_UGALDE} (61-year-old Mexican woman, fair skin, shoulder-length auburn hair in soft waves, gentle sad hazel eyes, a lilac blouse, a thin gold chain with a small medal)")
MAR = ("@{MARCELO_UGALDE} (30-year-old Mexican man, light-brown skin, short dark-brown hair with a side part, clean-shaven, a light-blue button-up shirt with rolled sleeves)")
CAR = ("@{CAROLINA_BENAVIDES} (27-year-old Mexican woman, warm olive skin, long straight black hair with a center part, large hazel-green eyes, a coral summer dress with a white cardigan)")
#@INCLUDE funcs1
LAZ_B = "@{LAZARO_UGALDE} seen from behind (cream palm hat, white guayabera shirt)"
EST_B = "@{ESTELA_UGALDE} seen from behind (shoulder-length auburn wavy hair, lilac blouse)"
MAR_B = "@{MARCELO_UGALDE} seen from behind (short dark-brown hair, light-blue shirt)"
CAR_B = "@{CAROLINA_BENAVIDES} seen from behind (long straight black hair, white cardigan over a coral dress)"
#@INCLUDE funcs2
#@INCLUDE d8
LR = "standing on the RIGHT by the white arches of the facade"
ER = "standing on the RIGHT beside her husband, by the arches"
ML = "standing on the LEFT beside his girlfriend, the lagoon behind"
CL = "standing on the LEFT beside her boyfriend, the lagoon behind"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Lázaro YA hablando, indignado, Marcelo de espaldas en el borde.
 ("c01", 6, S("c01", "Lázaro", f"Medium close-up of {LAZ} {GAR0}, {LR}, talking from the very first frame, indignant and hard, looking from his son to the young woman", MAR_B, "LEFT", "indignant, hard, scornful",
     f"Medium close-up of {LAZ} {GAR}, {LR}, talking from the very first frame, indignant", "LEFT")),
 ("c02", 6, S("c02", "Marcelo", f"Close-up of {MAR} {GAR0}, {ML}, determined, he takes a half step forward to stand by her", LAZ_B, "RIGHT", "determined, firm, respectful",
     f"Close-up of {MAR} {GAR}, {ML}, determined", "RIGHT")),
 ("c03", 6, S("c03", "Lázaro", f"Close-up of {LAZ} {GAR0}, {LR}, cold and final, a hard look at the young woman", CAR_B, "LEFT", "cold, final, proud",
     f"Close-up of {LAZ} {GAR}, {LR}, cold and final", "LEFT")),
 ("c04", D8("c04"), S("c04", "Carolina", f"Close-up of {CAR} {GAR0}, {CL}, polite but brave, chin up, holding his gaze", LAZ_B, "RIGHT", "polite, brave, steady",
     f"Close-up of {CAR} {GAR}, {CL}, polite but brave", "RIGHT")),
 ("c05", 6, S("c05", "Lázaro", f"Close-up of {LAZ} {GAR0}, {LR}, a bitter half-smile, provoking her", CAR_B, "LEFT", "bitter, provoking, cold",
     f"Close-up of {LAZ} {GAR}, {LR}, bitter half-smile", "LEFT")),
 ("c06", D8("c06"), S("c06", "Carolina", f"Close-up of {CAR} {GAR0}, {CL}, thoughtful and sincere, a touch of sadness", LAZ_B, "RIGHT", "sincere, thoughtful, sad",
     f"Close-up of {CAR} {GAR}, {CL}, thoughtful and sincere", "RIGHT")),
 ("c07", 6, S("c07", "Marcelo", f"Close-up of {MAR} {GAR0}, {ML}, frustrated, demanding an answer from his father", LAZ_B, "RIGHT", "frustrated, demanding, firm",
     f"Close-up of {MAR} {GAR}, {ML}, frustrated, demanding", "RIGHT")),
 ("c08", 6, S("c08", "Lázaro", f"Close-up of {LAZ} {GAR0}, {LR}, he turns his face away toward the lagoon, jaw tight, refusing", MAR_B, "LEFT", "curt, closed, proud",
     f"Close-up of {LAZ} {GAR}, {LR}, turning his face away, refusing", "LEFT")),
 ("r1", 6, one(f"Medium shot of {EST} {GAR}, walking out from under the white arches on the RIGHT, she stops and stares at the young woman's face, a hand to her chest", "LEFT") + " No dialogue."),
 ("c09", 6, S("c09", "Estela", f"Close-up of {EST} {GAR0}, {ER}, softly, almost to herself, eyes fixed on the young woman, moved", CAR_B, "LEFT", "soft, moved, nostalgic",
     f"Close-up of {EST} {GAR}, {ER}, softly, moved", "LEFT")),
 ("c10", 6, S("c10", "Lázaro", f"Close-up of {LAZ} {GAR0}, {LR}, he turns sharply to his wife, an order, nervous under the anger", EST_B, "RIGHT", "sharp, commanding, nervous",
     f"Close-up of {LAZ} {GAR}, {LR}, turning sharply to his wife", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Estela", f"Close-up of {EST} {GAR0}, {ER}, calm and decided, she looks at her husband, then at the young woman, eyes wet", LAZ_B, "LEFT", "calm, decided, emotional",
     f"Close-up of {EST} {GAR}, {ER}, calm and decided, eyes wet", "LEFT")),
 ("r2", 6, one(f"Close-up of {LAZ} {GAR}, {LR}, frozen, his stern face collapses, he lowers his eyes, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r3", 6, f"Medium two-shot {GAR}: on the LEFT, {MAR} and {CAR} side by side, stunned, they slowly turn to look at each other, completely silent; only these two people. No dialogue."),
 # CTA con carisma (después del BLACK): Carolina a cámara
 ("c12", 10, talk("c12", "Carolina", f"Close-up from the chest up of {CAR} {GAR}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, pulls her white cardigan closed, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("indignant, hard, scornful", "indignant, hard"), ("bitter, provoking, cold", "dry, cold"), ("scornful", "annoyed"), ("collapses", "changes"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm late afternoon light in the garden of a hacienda by a lagoon in Nayarit, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, hacienda garden with royal palms by a lagoon in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LAZARO_UGALDE}", "a stern Mexican man in his sixties with a thick grey mustache, a white guayabera and a cream palm hat"),
         ("@{ESTELA_UGALDE}", "a Mexican woman around sixty with shoulder-length auburn wavy hair and a lilac blouse"),
         ("@{MARCELO_UGALDE}", "a Mexican man around thirty with short dark-brown side-parted hair in a light-blue shirt"),
         ("@{CAROLINA_BENAVIDES}", "a young Mexican woman with long straight black hair in a coral dress and white cardigan"),
         (" @{LOC_JARDINLAGUNILLAS}", "")]
#@INCLUDE tail

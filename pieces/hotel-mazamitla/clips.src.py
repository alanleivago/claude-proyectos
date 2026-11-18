"""Genera los clips de hotel-mazamitla PARTE 1 (El Hotel de Mazamitla, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #28 "La recepcionista del hotel" [CAPO] (Revancha del empleado humillado), cierre tipo 3 (palabra reveladora: "hermana"): de noche, en la recepción del hotel de montaña,
Sebastián (29), hijo del dueño, humilla a Liliana (27), la recepcionista, porque no le da una suite ocupada. Ella no cede. Llega don Alfonso (62), el dueño, la conoce por su nombre
y le da la razón. "Sebastián… te presento a tu hermana." Corte en el hijo.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (recepción): Liliana a la IZQUIERDA detrás del mostrador; Sebastián a la DERECHA frente al mostrador; Alfonso entra por la DERECHA y queda junto a su hijo.
LOB0 = ("in the lobby of a luxury mountain lodge hotel in Mazamitla, Jalisco @{LOC_HOTELMAZAMITLA} at night: a polished dark-wood reception counter with a small brass bell and a lamp, stone walls, a lit stone fireplace, wooden beams, "
        "large windows with dark pine forest outside, warm amber light; no readable text, no signs, no logos")
LOB = LOB0 + "; nobody else in the background, no extras, nobody besides the person described"
SEB = ("@{SEBASTIAN_LOZADA} (29-year-old Mexican man, fair skin, styled swept-back light-brown hair, clean-shaven, arrogant smirk, a camel wool coat over a white turtleneck sweater)")
LIL = ("@{LILIANA_CRUZ} (27-year-old Mexican woman, warm brown skin, long dark-brown hair in a neat low ponytail, calm dark eyes, a plain dark-green knit cardigan over a white blouse)")
ALF = ("@{ALFONSO_LOZADA} (62-year-old Mexican man, fair tanned skin, neat silver hair, a short trimmed grey beard, a dark charcoal overcoat over a navy suit with an open-collar light-blue shirt)")
#@INCLUDE funcs1
SEB_B = "@{SEBASTIAN_LOZADA} seen from behind (swept-back light-brown hair, camel wool coat)"
LIL_B = "@{LILIANA_CRUZ} seen from behind (dark-brown low ponytail, dark-green knit cardigan), behind the counter"
ALF_B = "@{ALFONSO_LOZADA} seen from behind (neat silver hair, dark charcoal overcoat)"
#@INCLUDE funcs2
#@INCLUDE d8
LL = "standing on the LEFT behind the dark-wood reception counter"
SR = "standing on the RIGHT in front of the reception counter"
AR = "standing on the RIGHT in front of the counter, beside his son"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Sebastián YA hablando, prepotente, Liliana de espaldas en el borde.
 ("c01", 6, S("c01", "Sebastián", f"Medium close-up of {SEB} {LOB0}, {SR}, talking from the very first frame, arrogant, he slaps his palm on the counter, leaning in", LIL_B, "LEFT", "arrogant, cold, condescending",
     f"Medium close-up of {SEB} {LOB}, {SR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, polite and calm, a professional small smile, not intimidated", SEB_B, "RIGHT", "polite, calm, firm",
     f"Close-up of {LIL} {LOB}, {LL}, polite and calm", "RIGHT")),
 ("c03", 6, S("c03", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, a mocking laugh, spreading his arms", LIL_B, "LEFT", "mocking, arrogant, loud",
     f"Close-up of {SEB} {LOB}, {SR}, mocking laugh", "LEFT")),
 ("c04", D8("c04"), S("c04", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, she keeps her hands folded on the counter, calm and firm", SEB_B, "RIGHT", "calm, firm, respectful",
     f"Close-up of {LIL} {LOB}, {LL}, calm and firm", "RIGHT")),
 ("c05", 6, S("c05", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, his smirk turns hard, leaning closer over the counter", LIL_B, "LEFT", "hard, arrogant, threatening",
     f"Close-up of {SEB} {LOB}, {SR}, leaning closer, hard", "LEFT")),
 ("c06", D8("c06"), S("c06", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, holding his gaze, steady, without raising her voice", SEB_B, "RIGHT", "steady, calm, brave",
     f"Close-up of {LIL} {LOB}, {LL}, steady", "RIGHT")),
 ("c07", 6, S("c07", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, irritated, snapping his fingers at her", LIL_B, "LEFT", "irritated, bossy, cold",
     f"Close-up of {SEB} {LOB}, {SR}, irritated, snapping his fingers", "LEFT")),
 ("c08", 6, S("c08", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, a small calm smile, she straightens a pen on the counter", SEB_B, "RIGHT", "calm, dry, confident",
     f"Close-up of {LIL} {LOB}, {LL}, small calm smile", "RIGHT")),
 ("c09", 6, S("c09", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, laughing at her, looking her up and down with contempt", LIL_B, "LEFT", "mocking, dismissive, amused",
     f"Close-up of {SEB} {LOB}, {SR}, laughing at her", "LEFT")),
 ("c10", 6, S("c10", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, proud, chin up, a firm voice", SEB_B, "RIGHT", "proud, firm, quiet",
     f"Close-up of {LIL} {LOB}, {LL}, proud, chin up", "RIGHT")),
 ("c11", 6, S("c11", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, a cruel smile, turning half away from her", LIL_B, "LEFT", "dismissive, cruel, cold",
     f"Close-up of {SEB} {LOB}, {SR}, cruel smile", "LEFT")),
 ("r1", 6, one(f"Medium shot of {ALF} {LOB}, walking in through the hotel's front door on the RIGHT, shaking off the cold, pulling a small suitcase, he stops and looks toward the counter", "LEFT") + " No dialogue."),
 ("c12", 6, S("c12", "Alfonso", f"Close-up of {ALF} {LOB0}, {AR}, serious, commanding without raising his voice, looking from his son to the counter", SEB_B, "LEFT", "serious, commanding, calm",
     f"Close-up of {ALF} {LOB}, {AR}, serious and commanding", "LEFT")),
 ("c13", 6, S("c13", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, suddenly all smiles, turning to his father, pointing at the receptionist", ALF_B, "RIGHT", "fake, whiny, smug",
     f"Close-up of {SEB} {LOB}, {SR}, all smiles, pointing", "RIGHT")),
 ("c14", 6, S("c14", "Alfonso", f"Close-up of {ALF} {LOB0}, {AR}, his face softens when he sees the receptionist, a warm worried look", LIL_B, "LEFT", "warm, soft, worried",
     f"Close-up of {ALF} {LOB}, {AR}, softening, warm look", "LEFT")),
 ("c15", D8("c15"), S("c15", "Liliana", f"Close-up of {LIL} {LOB0}, {LL}, respectful, a little nervous now, she lowers her eyes then looks up at him", ALF_B, "RIGHT", "respectful, nervous, honest",
     f"Close-up of {LIL} {LOB}, {LL}, respectful, a little nervous", "RIGHT")),
 ("c16", D8("c16"), S("c16", "Alfonso", f"Close-up of {ALF} {LOB0}, {AR}, he nods slowly at her, then turns a hard look at his son", SEB_B, "LEFT", "firm, proud, stern",
     f"Close-up of {ALF} {LOB}, {AR}, firm, nodding", "LEFT")),
 ("c17", 6, S("c17", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, offended, disbelieving, his voice rising", ALF_B, "RIGHT", "offended, disbelieving, loud",
     f"Close-up of {SEB} {LOB}, {SR}, offended", "RIGHT")),
 ("c18", 6, S("c18", "Alfonso", f"Close-up of {ALF} {LOB0}, {AR}, calm and grave, a short pause before his son's name", SEB_B, "LEFT", "grave, calm, meaningful",
     f"Close-up of {ALF} {LOB}, {AR}, calm and grave", "LEFT")),
 ("r2", 6, one(f"Close-up of {SEB} {LOB}, {SR}, confused, his smirk fading, he looks from his father to the receptionist and back", "LEFT") + " No dialogue."),
 ("c19", 6, S("c19", "Sebastián", f"Close-up of {SEB} {LOB0}, {SR}, suspicious and nervous, his voice tighter", ALF_B, "RIGHT", "suspicious, nervous, tight",
     f"Close-up of {SEB} {LOB}, {SR}, suspicious and nervous", "RIGHT")),
 ("r3", 6, f"Medium two-shot {LOB}: {ALF} walks around the end of the reception counter and gently puts a hand on the shoulder of {LIL}; she looks up at him, nervous, emotional; only these two people. No dialogue."),
 ("c20", D8("c20"), S("c20", "Alfonso", f"Close-up of {ALF} {LOB0}, now standing beside the receptionist behind the counter, his hand on her shoulder, looking straight at his son, a pause before the last word", SEB_B, "RIGHT", "grave, emotional, firm",
     f"Close-up of {ALF} {LOB}, beside her behind the counter, grave and emotional", "RIGHT")),
 ("r4", 6, one(f"Close-up of {SEB} {LOB}, {SR}, frozen, his mouth falls slightly open, all the arrogance gone from his face, completely still", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Liliana a cámara
 ("c21", 10, talk("c21", "Liliana", f"Close-up from the chest up of {LIL} {LOB}, standing behind the counter, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, taps the small brass bell once, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("hard, arrogant, threatening", "hard, arrogant"), ("dismissive, cruel, cold", "dismissive, cold"), ("a cruel smile", "a cold smile"), ("cruel", "cold"), ("contempt", "disdain"), ("slaps his palm on", "puts his hand on"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm amber night light in the lobby of a mountain lodge hotel in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, luxury hotel reception with a stone fireplace at night in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEBASTIAN_LOZADA}", "a young Mexican man with swept-back light-brown hair in a camel wool coat over a white turtleneck"),
         ("@{LILIANA_CRUZ}", "a young Mexican woman with a dark-brown low ponytail in a dark-green cardigan over a white blouse"),
         ("@{ALFONSO_LOZADA}", "a Mexican man in his sixties with silver hair, a trimmed grey beard and a charcoal overcoat"),
         (" @{LOC_HOTELMAZAMITLA}", "")]
#@INCLUDE tail

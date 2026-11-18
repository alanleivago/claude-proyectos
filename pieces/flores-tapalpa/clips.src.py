"""Genera los clips de flores-tapalpa PARTE 1 (Las Flores de Tapalpa, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #16 "El pretendiente del mercado" [CAPO] (Bodas, compromisos y pretendientes), cierre tipo 1 (entra un personaje inesperado): doña Hortensia (60), viuda dueña de una hacienda en Tapalpa,
invita a cenar a Gael (30), el florista del mercado novio de su hija Valentina (27), para humillarlo. Presume que esa noche llega su socio, don Patricio, dueño de las tierras de junto.
Llega don Patricio (64), le pone la mano en el hombro a Gael: "Veo que ya conociste a mi hijo."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (comedor): Hortensia sentada a la DERECHA en la cabecera; Gael sentado a la IZQUIERDA; Valentina sentada a la IZQUIERDA junto a Gael; el arco de entrada al fondo a la izquierda.
YARD0 = ("in the dining room of an old hacienda in Tapalpa, Jalisco @{LOC_COMEDORTAPALPA} at night: a dark carved wooden table with a white lace tablecloth, antique porcelain plates, crystal glasses, "
         "a silver candelabra with lit candles, a vase of fresh flowers, white adobe walls, dark wooden ceiling beams, warm candlelight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
HOR = ("@{HORTENSIA_SALAZAR} (60-year-old Mexican woman, fair skin, short ash-blonde hair in stiff waves, coral lipstick, a navy-blue silk blouse with a high collar, a large gold brooch)")
VAL = ("@{VALENTINA_SALAZAR} (27-year-old Mexican woman, light skin, long straight light-brown hair with a side part, pearl stud earrings, a simple burgundy long-sleeve dress)")
GAE = ("@{GAEL_ITURBE} (30-year-old Mexican man, warm brown skin, short curly black hair, clean-shaven, a clean white cotton shirt buttoned to the neck with sleeves rolled)")
PAT = ("@{PATRICIO_ITURBE} (64-year-old Mexican man, brown skin, white hair combed back, a neat white mustache, a dark-grey three-piece suit with a white shirt and no tie)")
#@INCLUDE funcs1
HOR_B = "@{HORTENSIA_SALAZAR} seen from behind (short ash-blonde hair in stiff waves, navy-blue silk blouse)"
VAL_B = "@{VALENTINA_SALAZAR} seen from behind (long straight light-brown hair, burgundy dress)"
GAE_B = "@{GAEL_ITURBE} seen from behind (short curly black hair, white cotton shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
HR = "seated on the RIGHT at the head of the table"
GL = "seated on the LEFT side of the table"
VL = "seated on the LEFT side of the table, next to the young man"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Hortensia YA hablando, mirando las manos de Gael, él de espaldas en el borde.
 ("c01", 6, S("c01", "Hortensia", f"Medium close-up of {HOR} {YARD0}, {HR}, talking from the very first frame, looking down at the young man's hands with disdain, holding a crystal glass", GAE_B, "LEFT", "haughty, disdainful, sharp",
     f"Medium close-up of {HOR} {YARD}, {HR}, talking from the very first frame, disdainful", "LEFT")),
 ("c02", D8("c02"), S("c02", "Gael", f"Close-up of {GAE} {YARD0}, {GL}, calm and kind, he shows his open hands on the tablecloth", HOR_B, "RIGHT", "calm, kind, proud",
     f"Close-up of {GAE} {YARD}, {GL}, calm and kind", "RIGHT")),
 ("c03", 6, S("c03", "Valentina", f"Close-up of {VAL} {YARD0}, {VL}, embarrassed and pleading, looking at her mother", HOR_B, "RIGHT", "embarrassed, pleading, soft",
     f"Close-up of {VAL} {YARD}, {VL}, embarrassed and pleading", "RIGHT")),
 ("c04", D8("c04"), S("c04", "Hortensia", f"Close-up of {HOR} {YARD0}, {HR}, a false smile, she taps an antique porcelain plate with one fingernail", GAE_B, "LEFT", "falsely sweet, superior",
     f"Close-up of {HOR} {YARD}, {HR}, a false smile", "LEFT")),
 ("c05", 6, S("c05", "Gael", f"Close-up of {GAE} {YARD0}, {GL}, serene, a polite smile, holding her gaze", HOR_B, "RIGHT", "serene, polite, firm",
     f"Close-up of {GAE} {YARD}, {GL}, serene, a polite smile", "RIGHT")),
 ("r1", 6, one(f"Close-up of {HOR} {YARD}, {HR}, her false smile freezes, she slowly puts down her glass, offended, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c06", 6, S("c06", "Hortensia", f"Close-up of {HOR} {YARD0}, {HR}, a short mocking laugh, she raises one eyebrow", GAE_B, "LEFT", "mocking, cold, amused",
     f"Close-up of {HOR} {YARD}, {HR}, a short mocking laugh", "LEFT")),
 ("c07", 6, S("c07", "Valentina", f"Close-up of {VAL} {YARD0}, {VL}, eyes wet, hurt but brave, she takes the young man's hand on the table", HOR_B, "RIGHT", "hurt, brave, emotional",
     f"Close-up of {VAL} {YARD}, {VL}, eyes wet, hurt but brave", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Hortensia", f"Close-up of {HOR} {YARD0}, {HR}, smug, she glances toward the arched doorway and fixes her brooch", GAE_B, "LEFT", "smug, proud, dismissive",
     f"Close-up of {HOR} {YARD}, {HR}, smug, fixing her brooch", "LEFT")),
 ("c09", 6, S("c09", "Gael", f"Close-up of {GAE} {YARD0}, {GL}, a small knowing smile, he slowly puts his napkin on the table", HOR_B, "RIGHT", "calm, knowing, light",
     f"Close-up of {GAE} {YARD}, {GL}, a small knowing smile", "RIGHT")),
 ("c10", 6, S("c10", "Hortensia", f"Close-up of {HOR} {YARD0}, {HR}, irritated and suspicious, she leans forward", GAE_B, "LEFT", "irritated, suspicious, sharp",
     f"Close-up of {HOR} {YARD}, {HR}, irritated, leaning forward", "LEFT")),
 ("i01", 6, f"Insert {YARD0}: the arched doorway of the dining room, the heavy wooden hall door beyond it slowly swings open, warm candlelight, the hallway still empty; no people visible yet, no text. No dialogue."),
 ("r2", 6, one(f"Medium shot of {PAT} {YARD}, standing in the arched doorway of the dining room, he takes off his black felt hat, smiling warmly, then he walks in slowly", "LEFT") + " No dialogue."),
 ("c11", D8("c11"), talk("c11", "Patricio", two(f"{PAT} standing on the LEFT behind the seated {GAE}, resting one hand proudly on the young man's shoulder, {YARD0}, framed from the waist up; the older man smiles toward the head of the table, "
     f"the young man stays calm") + " " + MOUTH("Patricio", "the young man"), "warm, proud, cordial")),
 ("r3", 6, one(f"Close-up of {HOR} {YARD}, {HR}, frozen, her face goes pale, the crystal glass trembles in her hand, her mouth opens without a word", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Gael a cámara
 ("c12", 10, talk("c12", "Gael", f"Close-up from the chest up of {GAE} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, adjusts the rolled sleeve of his shirt, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("haughty, disdainful, sharp", "proud, cool"), ("disdainful", "cool"), ("disdain", "doubt"), ("mocking", "amused"), ("haughty", "proud"), ("dismissive", "proud"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm candlelight in the dining room of an old hacienda in Jalisco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, candlelit hacienda dining room in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{HORTENSIA_SALAZAR}", "a proud Mexican woman around sixty with short ash-blonde waved hair, coral lipstick, a navy-blue silk blouse and a gold brooch"),
         ("@{VALENTINA_SALAZAR}", "a young Mexican woman with long straight light-brown hair, pearl earrings and a burgundy dress"),
         ("@{GAEL_ITURBE}", "a Mexican man around thirty with short curly black hair and a clean white cotton shirt with rolled sleeves"),
         ("@{PATRICIO_ITURBE}", "a distinguished Mexican man in his sixties with white hair, a white mustache and a dark-grey three-piece suit"),
         (" @{LOC_COMEDORTAPALPA}", "")]
#@INCLUDE tail

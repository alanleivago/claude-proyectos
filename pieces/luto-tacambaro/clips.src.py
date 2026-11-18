"""Genera los clips de luto-tacambaro PARTE 1 (El Luto de Tacámbaro, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #33 "La viuda del capo" [CAPO] (Capos, caciques y patrones; adaptada: hacendado poderoso, sin armas), cierre tipo 2 (se lee un documento y se corta antes del dato clave):
en el velorio de don Aniceto, el lugarteniente Moisés (42) y el cuñado Prisciliano (60) dan por hecho que la viuda Altagracia (54) no sabe nada. Ella toma el mando,
llama a la amante Areli (31) a sentarse a su lado; Areli trae una libreta que Aniceto le dio "para la persona correcta" y que no debía darle a Prisciliano. Altagracia la lee:
"Si un día yo falto… el que me traicionó fue…" y alza la vista. Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (sala del velorio, ataúd cerrado al fondo): Altagracia a la IZQUIERDA junto al ataúd; Prisciliano a la DERECHA; Moisés al CENTRO junto a Prisciliano; Areli al fondo, luego a la IZQUIERDA junto a Altagracia.
ROOM0 = ("in the large candlelit living room of an old ranch house in Tacambaro, Michoacan @{LOC_VELORIOTACAMBARO} late at night during a wake after the mourners have left: a closed dark wooden coffin at the back, "
         "big arrangements of white lilies, tall lit candles, rows of empty folding chairs, white walls with dark wooden beams, warm dim candlelight; no readable text, no signs, no logos")
ROOM = ROOM0 + "; nobody else in the background, no extras, nobody besides the person described"
ALT = ("@{ALTAGRACIA_SOTELO} (54-year-old Mexican woman, light-brown skin, dark hair with grey streaks in a low bun under a thin black lace mantilla veil, calm sharp dark eyes, a long-sleeved black dress, a pearl necklace)")
PRI = ("@{PRISCILIANO_SOTELO} (60-year-old heavyset Mexican man, tanned skin, short grey hair, a thick grey mustache, a black western suit, white shirt and a silver bolo tie, no hat)")
MOI = ("@{MOISES_RANGEL} (42-year-old Mexican man, brown skin, shaved head, a short black beard, a black leather jacket over a black shirt)")
ARE = ("@{ARELI_CAMPOS} (31-year-old Mexican woman, fair-olive skin, long wavy auburn hair, red lipstick, teary eyes, a fitted black knee-length dress, small gold earrings)")
#@INCLUDE funcs1
ALT_B = "@{ALTAGRACIA_SOTELO} seen from behind (low bun with grey streaks under a black lace mantilla veil, black dress)"
PRI_B = "@{PRISCILIANO_SOTELO} seen from behind (short grey hair, heavyset, black western suit jacket)"
MOI_B = "@{MOISES_RANGEL} seen from behind (shaved head, black leather jacket)"
ARE_B = "@{ARELI_CAMPOS} seen from behind (long wavy auburn hair, fitted black dress)"
#@INCLUDE funcs2
#@INCLUDE d8
AL = "standing on the LEFT beside the closed coffin"
PR = "standing on the RIGHT"
MC = "standing in the CENTER next to the man in the black suit"
RL = "standing on the LEFT next to the widow, beside the coffin"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

def T(cid, who, other, desc, tone, one_desc, one_side):
    return (talk(cid, who, two(desc) + " " + MOUTH(who, other), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Moisés YA hablando en voz baja, Prisciliano de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Moisés", f"Medium close-up of {MOI} {ROOM0}, {MC}, talking from the very first frame in a low voice, leaning in, glancing toward the widow by the coffin", PRI_B, "RIGHT", "low, conspiratorial, serious",
     f"Medium close-up of {MOI} {ROOM}, {MC}, talking from the very first frame, low voice", "RIGHT")),
 ("c02", D8("c02"), S("c02", "Prisciliano", f"Close-up of {PRI} {ROOM0}, {PR}, adjusting his bolo tie, a smug half smile", MOI_B, "LEFT", "smug, dismissive, proud",
     f"Close-up of {PRI} {ROOM}, {PR}, smug, adjusting his bolo tie", "LEFT")),
 ("c03", D8("c03"), S("c03", "Altagracia", f"Close-up of {ALT} {ROOM0}, {AL}, she turns from the coffin slowly, calm and cold, one hand resting on the coffin lid", PRI_B, "RIGHT", "calm, cold, cutting",
     f"Close-up of {ALT} {ROOM}, {AL}, calm and cold, hand on the coffin", "RIGHT")),
 ("c04", 6, S("c04", "Prisciliano", f"Close-up of {PRI} {ROOM0}, {PR}, condescending, waving one hand toward the kitchen door", ALT_B, "LEFT", "condescending, impatient",
     f"Close-up of {PRI} {ROOM}, {PR}, condescending", "LEFT")),
 ("c05", D8("c05"), S("c05", "Altagracia", f"Close-up of {ALT} {ROOM0}, {AL}, she steps closer, eyes fixed on him, unshaken", PRI_B, "RIGHT", "quiet, firm, intimidating",
     f"Close-up of {ALT} {ROOM}, {AL}, unshaken, stepping closer", "RIGHT")),
 ("r1", 6, two(f"{PRI} {PR} and {MOI} {MC} {ROOM}, the two men exchange a long uneasy look without a word, Moises swallows") + " " + MUTE),
 ("c06", 6, S("c06", "Moisés", f"Close-up of {MOI} {ROOM0}, {MC}, polite but patronizing, hands folded in front of him", ALT_B, "LEFT", "polite, patronizing",
     f"Close-up of {MOI} {ROOM}, {MC}, polite but patronizing", "LEFT")),
 ("c07", D8("c07"), S("c07", "Altagracia", f"Close-up of {ALT} {ROOM0}, {AL}, a small cold smile, she glances past him toward the back rows of chairs", MOI_B, "RIGHT", "cold, knowing, calm",
     f"Close-up of {ALT} {ROOM}, {AL}, small cold smile, glancing to the back", "RIGHT")),
 ("r2", 6, one(f"Medium shot of {ARE} {ROOM}, sitting alone in the last row of empty folding chairs at the back, she freezes, lowers her eyes and grips her small black purse", "RIGHT") + " " + MUTE),
 ("c08", 6, S("c08", "Prisciliano", f"Close-up of {PRI} {ROOM0}, {PR}, tense, lowering his voice, a warning look", ALT_B, "LEFT", "tense, warning, low",
     f"Close-up of {PRI} {ROOM}, {PR}, tense, warning", "LEFT")),
 ("c09", D8("c09"), S("c09", "Altagracia", f"Close-up of {ALT} {ROOM0}, {AL}, serene, she raises her voice just enough and gestures with one open hand to the empty chair beside her", PRI_B, "RIGHT", "serene, commanding",
     f"Close-up of {ALT} {ROOM}, {AL}, serene and commanding, gesturing to a chair", "RIGHT")),
 ("r3", 6, one(f"Medium shot of {ARE} {ROOM}, she stands up and walks slowly up the aisle between the empty folding chairs toward the coffin, nervous, clutching her purse", "LEFT") + " " + MUTE),
 ("c10", D8("c10"), S("c10", "Areli", f"Close-up of {ARE} {ROOM0}, {RL}, teary, voice trembling, eyes down", ALT_B, "LEFT", "trembling, ashamed, soft",
     f"Close-up of {ARE} {ROOM}, {RL}, teary, trembling", "LEFT")),
 ("c11", D8("c11"), T("c11", "Altagracia", "Areli", f"{ALT} and {ARE} standing side by side beside the closed coffin {ROOM0}, Altagracia takes the younger woman's hand and guides her to sit, a sad calm look", "sad, calm, gentle",
     f"Close-up of {ALT} {ROOM}, {AL}, sad and calm", "RIGHT")),
 ("c12", 6, S("c12", "Prisciliano", f"Close-up of {PRI} {ROOM0}, {PR}, outraged, red-faced, pointing with an open hand at the young woman", ALT_B, "LEFT", "outraged, loud, disgusted",
     f"Close-up of {PRI} {ROOM}, {PR}, outraged", "LEFT")),
 ("c13", D8("c13"), S("c13", "Altagracia", f"Close-up of {ALT} {ROOM0}, {AL}, calm, she turns her head toward the young woman sitting beside her at the end of the sentence", PRI_B, "RIGHT", "calm, sharp, knowing",
     f"Close-up of {ALT} {ROOM}, {AL}, calm and sharp", "RIGHT")),
 ("c14", D8("c14"), S("c14", "Areli", f"Close-up of {ARE} {ROOM0}, {RL}, nervous, opening her small black purse", ALT_B, "LEFT", "nervous, whispering, honest",
     f"Close-up of {ARE} {ROOM}, {RL}, nervous, opening her purse", "LEFT")),
 ("c15", 6, S("c15", "Prisciliano", f"Close-up of {PRI} {ROOM0}, {PR}, stepping forward greedy and hard, holding out his open hand", ARE_B, "LEFT", "greedy, hard, demanding",
     f"Close-up of {PRI} {ROOM}, {PR}, holding out his open hand, demanding", "LEFT")),
 ("c16", D8("c16"), S("c16", "Areli", f"Close-up of {ARE} {ROOM0}, {RL}, holding a small black notebook tight against her chest, scared but brave", PRI_B, "RIGHT", "scared, brave, steady",
     f"Close-up of {ARE} {ROOM}, {RL}, holding a small black notebook to her chest", "RIGHT")),
 ("r4", 6, two(f"{PRI} {PR} and {MOI} {MC} {ROOM}, Prisciliano's face hardens and goes pale, Moises looks down at the floor, avoiding everyone's eyes") + " Slow push-in. " + MUTE),
 ("i01", 6, f"Close-up insert {ROOM0}: a young woman's hand with red nails gives a small worn black leather notebook to an older woman's hand next to a lit candle; no readable text. No dialogue."),
 ("c17", 6, S("c17", "Altagracia", f"Close-up of {ALT} {ROOM0}, {AL}, holding the small black notebook, opening it slowly", PRI_B, "RIGHT", "calm, solemn, low",
     f"Close-up of {ALT} {ROOM}, {AL}, opening a small black notebook", "RIGHT")),
 ("c18", 6, talk("c18", "Altagracia", one(f"Close-up of {ALT} {ROOM}, {AL}, reading aloud from the small black notebook in candlelight, her voice slowing down, she stops in the middle of the sentence", "RIGHT"),
     "slow, low, shaken")),
 ("r5", 6, one(f"Close-up of {ALT} {ROOM}, {AL}, she slowly lifts her eyes from the open notebook and stares at the men in front of her, cold and silent", "RIGHT") + " Slow push-in. " + MUTE),
 # CTA con carisma (después del BLACK): Altagracia a cámara
 ("c19", 10, talk("c19", "Altagracia", f"Close-up from the chest up of {ALT} {ROOM}, standing next to the coffin, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, holds up the small black notebook for a second, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("outraged, loud, disgusted", "angry, loud"), ("greedy, hard, demanding", "hard, demanding"), ("coffin", "wooden casket"), ("lover", "friend"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm dim candlelight in a big ranch house living room at night, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican ranch house at night with candles and white lilies, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, candlelight, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ALTAGRACIA_SOTELO}", "a Mexican woman in her fifties with a grey-streaked bun, a black lace veil, a black dress and pearls"),
         ("@{PRISCILIANO_SOTELO}", "a heavyset Mexican man in his sixties with grey hair, a grey mustache, a black western suit and a bolo tie"),
         ("@{MOISES_RANGEL}", "a Mexican man in his forties with a shaved head, a short black beard and a black leather jacket"),
         ("@{ARELI_CAMPOS}", "a young Mexican woman with long wavy auburn hair, red lipstick and a black dress"),
         (" @{LOC_VELORIOTACAMBARO}", "")]
#@INCLUDE tail

"""Genera los clips de danzon-cordoba PARTE 1 (El Danzón de Córdoba, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #39 "La maestra de baile" [CAPO] (Regreso, amnesia y pasado), cierre tipo 6 (mirada muda): en la plaza de Córdoba, don Feliciano (63), hacendado viudo, le pide una pieza
a Esperanza (58), la maestra de danzón con la que iba a casarse hace treinta años. Ella reclama que nunca recibió una carta; él jura que escribió cada mes. Llega su hermana Hermelinda (67),
ve a Esperanza, se le borra la cara y se va sin decir nada; mirada muda entre las dos.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (plaza): Feliciano a la DERECHA junto al kiosco; Esperanza a la IZQUIERDA junto a las bancas de hierro; Hermelinda llega por la DERECHA desde los portales.
PLZ0 = ("in the main square of Cordoba, Veracruz @{LOC_PLAZACORDOBA} in the early warm afternoon: a white wrought-iron bandstand kiosk, tall laurel trees, colonial arcades, checkered tile floor, iron benches, soft golden light; "
        "no readable text, no signs, no logos")
PLZ = PLZ0 + "; nobody else in the background, no extras, nobody besides the person described"
FEL = ("@{FELICIANO_CARRANZA} (63-year-old Mexican man, fair tanned skin, silver hair combed back, a short silver beard, a cream linen suit jacket over a white guayabera, a white panama hat in his hand)")
ESP = ("@{ESPERANZA_LARA} (58-year-old Mexican woman, warm brown skin, black hair with a white streak in a low bun with a red flower, red lipstick, a flowing white dress with red embroidery, a red fan)")
HER = ("@{HERMELINDA_CARRANZA} (67-year-old Mexican woman, fair skin, short white curly hair, thin gold glasses, a dark-navy dress with a white collar, a pearl necklace, a small black handbag)")
#@INCLUDE funcs1
FEL_B = "@{FELICIANO_CARRANZA} seen from behind (silver hair, cream linen suit jacket)"
ESP_B = "@{ESPERANZA_LARA} seen from behind (black low bun with a red flower, white dress)"
HER_B = "@{HERMELINDA_CARRANZA} seen from behind (short white curly hair, dark-navy dress)"
#@INCLUDE funcs2
#@INCLUDE d8
FR = "standing on the RIGHT by the white kiosk"
EL = "standing on the LEFT by the iron benches under the laurel trees"
HR = "standing on the RIGHT under the colonial arcades, a few steps behind her brother"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Feliciano YA hablando, mano tendida, Esperanza de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Feliciano", f"Medium close-up of {FEL} {PLZ0}, {FR}, talking from the very first frame, holding out one open hand toward her, a nervous hopeful smile", ESP_B, "LEFT", "hopeful, warm, nervous",
     f"Medium close-up of {FEL} {PLZ}, {FR}, talking from the very first frame, holding out one hand", "LEFT")),
 ("c02", 6, S("c02", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, proud and hurt, she closes her red fan with a snap", FEL_B, "RIGHT", "proud, hurt, cold",
     f"Close-up of {ESP} {PLZ}, {EL}, proud and hurt", "RIGHT")),
 ("c03", 6, S("c03", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, earnest, pressing his panama hat to his chest", ESP_B, "LEFT", "earnest, sad, sincere",
     f"Close-up of {FEL} {PLZ}, {FR}, earnest, hat on his chest", "LEFT")),
 ("c04", 6, S("c04", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, eyes narrowing, a sharp knowing question", FEL_B, "RIGHT", "sharp, bitter, knowing",
     f"Close-up of {ESP} {PLZ}, {EL}, eyes narrowing", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, ashamed, lowering his eyes, then looking at her again", ESP_B, "LEFT", "ashamed, sad, honest",
     f"Close-up of {FEL} {PLZ}, {FR}, ashamed", "LEFT")),
 ("c06", 6, S("c06", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, eyes shining with old pain, voice tight", FEL_B, "RIGHT", "tight, sad, hurt",
     f"Close-up of {ESP} {PLZ}, {EL}, eyes shining, voice tight", "RIGHT")),
 ("c07", 6, S("c07", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, confused, insisting, shaking his head slowly", ESP_B, "LEFT", "confused, insisting, sincere",
     f"Close-up of {FEL} {PLZ}, {FR}, confused, insisting", "LEFT")),
 ("c08", D8("c08"), S("c08", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, she glances at the kiosk, remembering, hurt", FEL_B, "RIGHT", "soft, sad, nostalgic",
     f"Close-up of {ESP} {PLZ}, {EL}, remembering", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, slowly realizing something, a shadow of doubt crossing his face", ESP_B, "LEFT", "slow, doubtful, troubled",
     f"Close-up of {FEL} {PLZ}, {FR}, a shadow of doubt", "LEFT")),
 ("c10", 6, S("c10", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, softer, curious despite herself", FEL_B, "RIGHT", "soft, curious, guarded",
     f"Close-up of {ESP} {PLZ}, {EL}, softer, curious", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, a sad gentle smile, looking around the square", ESP_B, "LEFT", "gentle, sad, warm",
     f"Close-up of {FEL} {PLZ}, {FR}, sad gentle smile", "LEFT")),
 ("c12", 6, S("c12", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, a proud sad smile, she opens her red fan slowly; a faded red ribbon is tied to the fan handle", FEL_B, "RIGHT", "proud, sad, tender",
     f"Close-up of {ESP} {PLZ}, {EL}, proud sad smile, opening her fan", "RIGHT")),
 ("i01", 6, f"Close-up insert {PLZ0}: a woman's hand holding a red folding fan, a faded old red silk ribbon tied around its handle, soft golden light; no faces, no readable text. No dialogue."),
 ("c13", 6, S("c13", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, moved, staring at the ribbon on her fan, his voice breaking a little", ESP_B, "LEFT", "moved, soft, emotional",
     f"Close-up of {FEL} {PLZ}, {FR}, moved, staring", "LEFT")),
 ("c14", 6, S("c14", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, eyes wet, a small shy smile", FEL_B, "RIGHT", "tender, shy, emotional",
     f"Close-up of {ESP} {PLZ}, {EL}, eyes wet, small smile", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, a tender smile, holding out his hand again", ESP_B, "LEFT", "tender, warm, hopeful",
     f"Close-up of {FEL} {PLZ}, {FR}, tender smile, hand held out", "LEFT")),
 ("r1", 6, f"Medium two-shot {PLZ}: {ESP} hesitates, then places her hand in the hand of {FEL}; they begin a slow elegant danzon step together next to the white kiosk, close, looking into each other's eyes; only these two people. No dialogue."),
 ("c16", 6, S("c16", "Hermelinda", f"Close-up of {HER} {PLZ0}, {HR}, impatient, calling her brother, then her eyes land on the woman and she stops", FEL_B, "LEFT", "impatient, stiff, cold",
     f"Close-up of {HER} {PLZ}, {HR}, impatient, calling her brother", "LEFT")),
 ("r2", 6, one(f"Close-up of {HER} {PLZ}, {HR}, frozen, staring at the other woman, her face hardens, she grips her handbag", "LEFT") + " No dialogue."),
 ("c17", 6, S("c17", "Hermelinda", f"Close-up of {HER} {PLZ0}, {HR}, cold and stiff, looking down at the other woman over her glasses", ESP_B, "LEFT", "cold, stiff, disdainful",
     f"Close-up of {HER} {PLZ}, {HR}, cold, over her glasses", "LEFT")),
 ("c18", 6, S("c18", "Esperanza", f"Close-up of {ESP} {PLZ0}, {EL}, she lets go of his hand, faces the older woman, calm and cutting", HER_B, "RIGHT", "calm, cutting, firm",
     f"Close-up of {ESP} {PLZ}, {EL}, calm and cutting", "RIGHT")),
 ("r3", 6, one(f"Medium shot of {HER} {PLZ}, {HR}, without a word she turns her back and walks away toward the colonial arcades, stiff, clutching her handbag", "LEFT") + " No dialogue."),
 ("c19", 6, S("c19", "Feliciano", f"Close-up of {FEL} {PLZ0}, {FR}, turning his head toward his sister walking away, a painful suspicion in his voice", HER_B, "RIGHT", "slow, hurt, suspicious",
     f"Close-up of {FEL} {PLZ}, {FR}, looking after his sister, suspicious", "RIGHT")),
 ("r4", 6, one(f"Close-up of {HER} {PLZ}, standing under the colonial arcades on the RIGHT, she stops and looks back over her shoulder, a long silent cold look, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r5", 6, one(f"Close-up of {ESP} {PLZ}, {EL}, silent, holding the older woman's look, a long knowing stare, her jaw set, completely still", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Esperanza a cámara
 ("c20", 10, talk("c20", "Esperanza", f"Close-up from the chest up of {ESP} {PLZ}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, opens her red fan and fans herself slowly, raises one eyebrow, gestures with the closed fan, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("impatient, stiff, cold", "impatient, stiff"), ("bitter, tight, sad", "tight, sad"), ("the color leaves her face", "her expression changes"), ("bitter", "sad"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm golden afternoon light in a colonial town square with a white kiosk in Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican town square with a kiosk and laurel trees, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FELICIANO_CARRANZA}", "a Mexican man in his sixties with silver hair, a short silver beard and a cream linen suit jacket over a guayabera"),
         ("@{ESPERANZA_LARA}", "a Mexican woman in her late fifties with a black low bun with a red flower and a white embroidered dress"),
         ("@{HERMELINDA_CARRANZA}", "an older Mexican woman with short white curly hair, thin gold glasses and a dark-navy dress"),
         (" @{LOC_PLAZACORDOBA}", "")]
#@INCLUDE tail

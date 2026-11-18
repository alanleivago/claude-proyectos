"""Genera los clips de relevo-ures PARTE 1 (El Relevo de Ures, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #24 "El hermano que volvió" [CAPO] (Traición familiar), cierre tipo 5 (la acusación se vuelve contra quien acusa): en la hacienda ganadera de Ures, Gustavo (46) ya se sienta en la silla
del padre muerto. Vuelve Lisardo (40) tras ocho años; Gustavo lo acusó de vender el ganado a escondidas. La madre Natividad (70) reconoce la letra del padre en la carta que trae Lisardo:
el padre escribió quién vendía el ganado, y no era Lisardo.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (sala): Gustavo a la DERECHA junto al sillón de cuero bajo el retrato; Natividad a la DERECHA junto a la mesita con flores; Lisardo a la IZQUIERDA cerca de la ventana.
YARD0 = ("in the main living room of an old cattle hacienda in Ures, Sonora @{LOC_SALAURES} in the afternoon: thick white adobe walls, dark mesquite beams, a big leather armchair, "
         "a large framed oil portrait of an old rancher with a white mustache, a cowhide rug, a side table with white flowers and a lit candle, dusty golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
GUS = ("@{GUSTAVO_IBARRA} (46-year-old Mexican man, fair sunburned skin, thinning light-brown hair combed back, a thick brown mustache, a black western shirt with pearl snaps, a black leather vest, a black felt cowboy hat)")
LIS = ("@{LISARDO_IBARRA} (40-year-old Mexican man, tanned skin, short dark hair with some grey, short dark stubble, a dusty tan canvas jacket over a plain white t-shirt)")
NAT = ("@{NATIVIDAD_IBARRA} (70-year-old Mexican woman, light-brown skin, white hair in a neat low bun, a black mourning dress, a black lace shawl, a small gold cross necklace)")
#@INCLUDE funcs1
GUS_B = "@{GUSTAVO_IBARRA} seen from behind (black felt cowboy hat, black leather vest over a black shirt)"
LIS_B = "@{LISARDO_IBARRA} seen from behind (short dark hair, dusty tan canvas jacket)"
NAT_B = "@{NATIVIDAD_IBARRA} seen from behind (white hair in a low bun, black lace shawl)"
#@INCLUDE funcs2
#@INCLUDE d8
GR = "on the RIGHT, seated in the big leather armchair under the portrait"
GRS = "standing on the RIGHT beside the big leather armchair"
NR = "standing on the RIGHT by the side table with white flowers"
LL = "standing on the LEFT near the tall window"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Gustavo YA hablando desde el sillón del padre, Lisardo de espaldas en el borde.
 ("c01", 6, S("c01", "Gustavo", f"Medium close-up of {GUS} {YARD0}, {GR}, talking from the very first frame, arrogant, his hands on the armrests", LIS_B, "LEFT", "arrogant, cold, superior",
     f"Medium close-up of {GUS} {YARD}, {GR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Lisardo", f"Close-up of {LIS} {YARD0}, {LL}, tired but firm, a bitter half smile", GUS_B, "RIGHT", "tired, bitter, firm",
     f"Close-up of {LIS} {YARD}, {LL}, tired but firm", "RIGHT")),
 ("c03", 6, S("c03", "Natividad", f"Close-up of {NAT} {YARD0}, {NR}, eyes full of tears, one hand on her gold cross, moved", LIS_B, "LEFT", "moved, tearful, soft",
     f"Close-up of {NAT} {YARD}, {NR}, eyes full of tears, moved", "LEFT")),
 ("c04", 6, S("c04", "Gustavo", f"Close-up of {GUS} {YARD0}, {GR}, contemptuous, talking to his mother without looking at his brother", NAT_B, "LEFT", "contemptuous, sarcastic",
     f"Close-up of {GUS} {YARD}, {GR}, contemptuous", "LEFT")),
 ("c05", D8("c05"), S("c05", "Lisardo", f"Close-up of {LIS} {YARD0}, {LL}, contained anger, his jaw tight, eyes fixed on his brother", GUS_B, "RIGHT", "contained, hurt, firm",
     f"Close-up of {LIS} {YARD}, {LL}, contained anger, eyes fixed ahead", "RIGHT")),
 ("c06", 6, S("c06", "Gustavo", f"Close-up of {GUS} {YARD0}, {GRS}, he stands up from the armchair slowly, proud, chin raised", LIS_B, "LEFT", "proud, smug, cold",
     f"Close-up of {GUS} {YARD}, {GRS}, proud, chin raised", "LEFT")),
 ("c07", D8("c07"), S("c07", "Natividad", f"Close-up of {NAT} {YARD0}, {NR}, sad and firm, looking at her elder son", GUS_B, "LEFT", "sad, firm, reproachful",
     f"Close-up of {NAT} {YARD}, {NR}, sad and firm", "LEFT")),
 ("c08", 6, S("c08", "Gustavo", f"Close-up of {GUS} {YARD0}, {GRS}, cold and impatient, he taps the armrest of the leather armchair", NAT_B, "LEFT", "cold, impatient, final",
     f"Close-up of {GUS} {YARD}, {GRS}, cold and impatient", "LEFT")),
 ("c09", 6, talk("c09", "Lisardo", two(f"{LIS} on the LEFT and {GUS} on the RIGHT {YARD0}, framed from the waist up; the younger brother slowly takes an old sealed envelope out of his canvas jacket and holds it up, "
     f"the elder brother stops smiling") + " " + MOUTH("Lisardo", "Gustavo"), "calm, cutting, slow")),
 ("i01", 6, f"Close-up insert {YARD0}: wrinkled old hands opening an old envelope with a broken dark-red wax seal and unfolding a handwritten letter in old ink; the handwriting is blurry and unreadable, only paper and hands, no faces. No dialogue."),
 ("c10", 6, talk("c10", "Natividad", one(f"Close-up of {NAT} {YARD}, {NR}, holding an old handwritten letter with trembling hands, her eyes wide, whispering", "LEFT"), "whispering, shocked, emotional")),
 ("c11", D8("c11"), S("c11", "Lisardo", f"Close-up of {LIS} {YARD0}, {LL}, calm and heavy, looking straight at his brother", GUS_B, "RIGHT", "calm, heavy, firm",
     f"Close-up of {LIS} {YARD}, {LL}, calm and heavy", "RIGHT")),
 ("r1", 6, one(f"Close-up of {GUS} {YARD}, {GRS}, frozen, his face goes pale, he swallows, his eyes drop to the floor, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r2", 6, one(f"Close-up of {NAT} {YARD}, {NR}, she slowly lowers the letter and turns her eyes toward her elder son, deeply disappointed, a tear rolls down, no words", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Lisardo a cámara
 ("c12", 10, talk("c12", "Lisardo", f"Close-up from the chest up of {LIS} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, adjusts the collar of his canvas jacket, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small tired smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous, sarcastic", "cool, ironic"), ("contemptuous", "cool"), ("arrogant", "proud"), ("contained anger", "tension"), ("bitter", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, dusty golden afternoon light in the living room of an old cattle hacienda in Sonora, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old hacienda living room with adobe walls in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{GUSTAVO_IBARRA}", "a Mexican rancher in his mid forties with a thick brown mustache, a black western shirt, a black leather vest and a black cowboy hat"),
         ("@{LISARDO_IBARRA}", "a Mexican man around forty with greying short dark hair, stubble and a dusty tan canvas jacket over a white t-shirt"),
         ("@{NATIVIDAD_IBARRA}", "an old Mexican woman with white hair in a low bun, a black mourning dress and a black lace shawl"),
         (" @{LOC_SALAURES}", "")]
#@INCLUDE tail

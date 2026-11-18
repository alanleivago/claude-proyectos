"""Genera los clips de tienda-mineral PARTE 1 (La Tienda de Mineral del Chico, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #30 "La ahijada del cacique" [CAPO] (Capos, caciques y patrones; adaptada: sobrina, sin niños), cierre tipo 1 (entra un personaje inesperado): Itzel (28) reabre la tienda de su difunta tía Cuca
en Mineral del Chico; el vecino Eutimio (73) le advierte del cacique. El Güero (35), mandadero del cacique, llega a intimidarla; al oír el nombre de la tía se va a avisar. Ella encuentra una foto
de la tía con un muchacho. Llega el cacique Maximino (66) con flores blancas: "Quince años esperé que se abriera esta puerta… Cuca". Ella: "Soy su sobrina. Mi tía murió hace dos meses."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (tienda): Itzel a la IZQUIERDA detrás del mostrador; Eutimio a la DERECHA junto al mostrador; el Güero y Maximino entran por la puerta abierta a la DERECHA.
SHOP0 = ("inside an old small general store in Mineral del Chico, Hidalgo @{LOC_TIENDAMINERAL} in the misty morning: worn wooden counter, old shelves with glass candy jars and dusty cans, colorful walls with peeling paint, "
         "a wide open door onto a steep cobblestone street with pine mountains and fog; no readable text, no signs, no logos")
SHOP = SHOP0 + "; nobody else in the background, no extras, nobody besides the person described"
ITZ = ("@{ITZEL_IBANEZ} (28-year-old Mexican woman, light-brown skin, shoulder-length straight black hair with bangs, determined dark eyes, a mustard-yellow knit sweater, small silver hoop earrings)")
EUT = ("@{EUTIMIO_SOTO} (73-year-old Mexican man, brown wrinkled skin, white stubble, thick glasses, a grey wool flat cap, a brown cardigan over a plaid shirt)")
GUE = ("@{GUERO_VALDES} (35-year-old Mexican man, fair skin, short bleached-blond hair, light stubble, arrogant smirk, a black leather jacket over a grey t-shirt, sunglasses pushed up on his head)")
MAX = ("@{MAXIMINO_UGARTE} (66-year-old Mexican man, tanned skin, thick white hair, a white mustache, deep-set dark eyes, a black suede jacket over a white shirt, a black felt cowboy hat)")
#@INCLUDE funcs1
ITZ_B = "@{ITZEL_IBANEZ} seen from behind (shoulder-length straight black hair, mustard-yellow knit sweater)"
EUT_B = "@{EUTIMIO_SOTO} seen from behind (grey wool flat cap, brown cardigan)"
GUE_B = "@{GUERO_VALDES} seen from behind (short bleached-blond hair, black leather jacket)"
MAX_B = "@{MAXIMINO_UGARTE} seen from behind (black felt cowboy hat, black suede jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
IL = "standing on the LEFT behind the wooden counter"
ER = "standing on the RIGHT by the end of the counter"
GR = "standing on the RIGHT just inside the open door"
XR = "standing on the RIGHT in the open doorway"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Eutimio YA hablando, asustado, Itzel de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Eutimio", f"Medium close-up of {EUT} {SHOP0}, {ER}, talking from the very first frame, worried, glancing at the open door, lowering his voice", ITZ_B, "LEFT", "worried, low, fearful",
     f"Medium close-up of {EUT} {SHOP}, {ER}, talking from the very first frame, worried", "LEFT")),
 ("c02", D8("c02"), S("c02", "Itzel", f"Close-up of {ITZ} {SHOP0}, {IL}, wiping the counter with a cloth, determined, chin up", EUT_B, "RIGHT", "determined, firm, warm",
     f"Close-up of {ITZ} {SHOP}, {IL}, determined, wiping the counter", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Eutimio", f"Close-up of {EUT} {SHOP0}, {ER}, shaking his head slowly, sad", ITZ_B, "LEFT", "sad, cautious, low",
     f"Close-up of {EUT} {SHOP}, {ER}, shaking his head, sad", "LEFT")),
 ("c04", D8("c04"), S("c04", "Itzel", f"Close-up of {ITZ} {SHOP0}, {IL}, defiant, putting a glass jar back on the shelf with a firm hand", EUT_B, "RIGHT", "defiant, proud, firm",
     f"Close-up of {ITZ} {SHOP}, {IL}, defiant", "RIGHT")),
 ("c05", 6, S("c05", "Eutimio", f"Close-up of {EUT} {SHOP0}, {ER}, a sad tender smile, remembering", ITZ_B, "LEFT", "tender, nostalgic, sad",
     f"Close-up of {EUT} {SHOP}, {ER}, sad tender smile", "LEFT")),
 ("c06", 6, S("c06", "Itzel", f"Close-up of {ITZ} {SHOP0}, {IL}, softer, a touch of sadness, looking around the old store", EUT_B, "RIGHT", "soft, sad, proud",
     f"Close-up of {ITZ} {SHOP}, {IL}, softer, looking around", "RIGHT")),
 ("r1", 6, one(f"Medium shot of {GUE} {SHOP}, {GR}, he walks in through the open door slowly, chewing gum, looking around the store with an arrogant smirk", "LEFT") + " No dialogue."),
 ("c07", D8("c07"), S("c07", "Güero", f"Close-up of {GUE} {SHOP0}, {GR}, leaning on the counter, arrogant, a mocking smile", ITZ_B, "LEFT", "arrogant, mocking, cold",
     f"Close-up of {GUE} {SHOP}, {GR}, arrogant, leaning on the counter", "LEFT")),
 ("c08", 6, S("c08", "Itzel", f"Close-up of {ITZ} {SHOP0}, {IL}, she puts down the cloth and holds his gaze, unafraid", GUE_B, "RIGHT", "firm, unafraid, cold",
     f"Close-up of {ITZ} {SHOP}, {IL}, unafraid", "RIGHT")),
 ("c09", 6, S("c09", "Güero", f"Close-up of {GUE} {SHOP0}, {GR}, he laughs once, looking her up and down", ITZ_B, "LEFT", "mocking, condescending, amused",
     f"Close-up of {GUE} {SHOP}, {GR}, mocking laugh", "LEFT")),
 ("c10", 6, S("c10", "Itzel", f"Close-up of {ITZ} {SHOP0}, {IL}, calm and deliberate, a small challenging look", GUE_B, "RIGHT", "calm, deliberate, challenging",
     f"Close-up of {ITZ} {SHOP}, {IL}, calm and challenging", "RIGHT")),
 ("r2", 6, one(f"Close-up of {GUE} {SHOP}, {GR}, his smirk disappears, he stops chewing, he straightens up off the counter, surprised and uneasy", "LEFT") + " No dialogue."),
 ("c11", 6, S("c11", "Güero", f"Close-up of {GUE} {SHOP0}, {GR}, nervous now, taking out his phone and stepping back toward the door", ITZ_B, "LEFT", "nervous, surprised, hurried",
     f"Close-up of {GUE} {SHOP}, {GR}, nervous, stepping back", "LEFT")),
 ("c12", 6, S("c12", "Eutimio", f"Close-up of {EUT} {SHOP0}, {ER}, frightened, hands on his cap, looking at the door then at her", ITZ_B, "LEFT", "frightened, worried, fast",
     f"Close-up of {EUT} {SHOP}, {ER}, frightened", "LEFT")),
 ("c13", D8("c13"), S("c13", "Itzel", f"Close-up of {ITZ} {SHOP0}, {IL}, opening a drawer under the counter, steady and brave", EUT_B, "RIGHT", "brave, steady, curious",
     f"Close-up of {ITZ} {SHOP}, {IL}, brave, opening a drawer", "RIGHT")),
 ("i01", 6, f"Close-up insert {SHOP0}: a young woman's hand lifting an old faded printed photograph from a wooden drawer; the photo shows a young couple smiling in front of this same store, a young woman with long black hair and a young man with a black cowboy hat; no readable text. No dialogue."),
 ("c14", 6, S("c14", "Itzel", f"Close-up of {ITZ} {SHOP0}, {IL}, holding the old photo up toward the old man, puzzled", EUT_B, "RIGHT", "puzzled, curious, soft",
     f"Close-up of {ITZ} {SHOP}, {IL}, holding up an old photo, puzzled", "RIGHT")),
 ("c15", 6, S("c15", "Eutimio", f"Close-up of {EUT} {SHOP0}, {ER}, he looks away from the photo, then his eyes go wide toward the door", ITZ_B, "LEFT", "evasive, nervous, whispering",
     f"Close-up of {EUT} {SHOP}, {ER}, evasive, eyes going to the door", "LEFT")),
 ("r3", 6, f"Medium shot {SHOP0}, seen from inside the store through the open door: a black pickup truck pulls up and stops on the steep cobblestone street in the fog; nobody else. No dialogue."),
 ("r4", 6, one(f"Medium shot of {MAX} {SHOP}, {XR}, he steps into the store slowly holding a bouquet of white lilies, he takes off his black hat, his eyes fixed on the woman behind the counter, moved", "LEFT") + " Slow push-in. No dialogue."),
 ("c16", 6, S("c16", "Maximino", f"Close-up of {MAX} {SHOP0}, {XR}, holding the white lilies and his hat, eyes wet, a trembling soft voice, a pause before the name", ITZ_B, "LEFT", "soft, moved, trembling",
     f"Close-up of {MAX} {SHOP}, {XR}, holding white lilies, eyes wet", "LEFT")),
 ("c17", D8("c17"), S("c17", "Itzel", f"Close-up of {ITZ} {SHOP0}, {IL}, gentle but firm, a sad look", MAX_B, "RIGHT", "gentle, sad, firm",
     f"Close-up of {ITZ} {SHOP}, {IL}, gentle and sad", "RIGHT")),
 ("r5", 6, one(f"Close-up of {MAX} {SHOP}, {XR}, the white lilies slowly lower in his hand, his hard face breaks, a tear runs down his cheek, completely silent", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Itzel a cámara
 ("c18", 10, talk("c18", "Itzel", f"Close-up from the chest up of {ITZ} {SHOP}, standing behind the counter, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, holds up the old photo for a second, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("arrogant, mocking, cold", "arrogant, cold"), ("mocking, condescending, amused", "amused, dismissive"), ("frightened, worried, fast", "worried, fast"), ("frightened", "worried"), ("fearful", "worried"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft misty morning light inside an old general store in a mountain town in Hidalgo, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican general store with candy jars, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ITZEL_IBANEZ}", "a young Mexican woman with shoulder-length black hair with bangs and a mustard-yellow sweater"),
         ("@{EUTIMIO_SOTO}", "an old Mexican man with thick glasses, a grey flat cap and a brown cardigan"),
         ("@{GUERO_VALDES}", "a Mexican man in his thirties with bleached-blond hair and a black leather jacket"),
         ("@{MAXIMINO_UGARTE}", "an older Mexican man with white hair, a white mustache, a black suede jacket and a black cowboy hat"),
         (" @{LOC_TIENDAMINERAL}", "")]
#@INCLUDE tail

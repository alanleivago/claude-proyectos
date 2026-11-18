"""Genera los clips de prueba-penjamo PARTE 1 (La Prueba de la Sobremesa, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #43 "La prueba de ADN en la sobremesa" [CAPO] (Chantajes y pruebas), cierre tipo 5 (la acusación se vuelve contra quien acusa): en el portal de su rancho en Pénjamo,
el hijo mayor Saúl (41), harto de que el patrón Evodio (68) prefiera a Gerónimo (32), pone sobre la mesa un sobre con una prueba de paternidad. Evodio lo lee, lo cierra:
"Ya lo sabía… ¿Y tú? ¿Quieres saber de quién eres hijo?". Saúl se queda helado.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (portal): Evodio SENTADO a la DERECHA en la cabecera; Gerónimo SENTADO a la DERECHA junto a su padre; Saúl DE PIE a la IZQUIERDA junto a la mesa.
PORCH0 = ("on the wide stone porch of an old cattle ranch house in Penjamo, Guanajuato @{LOC_PORTALPENJAMO} in the late golden afternoon: thick stone arches with magenta bougainvillea, a long rustic wooden table with clay plates and glasses, "
          "dry hills and mesquite trees in the distance; a plain white envelope lies on the table; no readable text, no signs, no logos")
PORCH = PORCH0 + "; nobody else in the background, no extras, nobody besides the person described"
EVO = ("@{EVODIO_SALCEDO} (68-year-old Mexican man, tanned weathered skin, thick white hair combed back, a full white mustache, heavy eyebrows, a dark-brown suede jacket over a white shirt buttoned to the collar)")
SAU = ("@{SAUL_SALCEDO} (41-year-old Mexican man, light-brown skin, short black hair with grey at the temples, clean-shaven, a tense square jaw, a navy-blue quilted vest over a light-blue checkered shirt)")
GER = ("@{GERONIMO_SALCEDO} (32-year-old Mexican man, olive skin, wavy dark-brown hair, a short trimmed beard, a beige linen shirt with rolled sleeves)")
#@INCLUDE funcs1
EVO_B = "@{EVODIO_SALCEDO} seen from behind (thick white hair, dark-brown suede jacket), seated"
SAU_B = "@{SAUL_SALCEDO} seen from behind (short black hair, navy-blue quilted vest)"
GER_B = "@{GERONIMO_SALCEDO} seen from behind (wavy dark-brown hair, beige linen shirt), seated"
#@INCLUDE funcs2
#@INCLUDE d8
ER = "seated on the RIGHT at the head of the table"
GR = "seated on the RIGHT beside his father at the table"
SL = "standing on the LEFT at the end of the table"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Saúl YA hablando, deja el sobre en la mesa, Evodio de espaldas en el borde.
 ("c01", 6, S("c01", "Saúl", f"Medium close-up of {SAU} {PORCH0}, {SL}, talking from the very first frame, bitter, he slaps a plain white envelope down onto the table in front of his father", EVO_B, "RIGHT", "bitter, sarcastic, defiant",
     f"Medium close-up of {SAU} {PORCH}, {SL}, talking from the very first frame, bitter, putting a white envelope on the table", "RIGHT")),
 ("c02", 6, S("c02", "Evodio", f"Close-up of {EVO} {PORCH0}, {ER}, calm and heavy, he looks at the envelope and then up at his son without touching it", SAU_B, "LEFT", "calm, heavy, warning",
     f"Close-up of {EVO} {PORCH}, {ER}, calm and heavy", "LEFT")),
 ("c03", 6, S("c03", "Saúl", f"Close-up of {SAU} {PORCH0}, {SL}, resentful, jaw tight, pointing with his chin at his younger brother", EVO_B, "RIGHT", "resentful, tight, accusing",
     f"Close-up of {SAU} {PORCH}, {SL}, resentful, jaw tight", "RIGHT")),
 ("c04", 6, S("c04", "Gerónimo", f"Close-up of {GER} {PORCH0}, {GR}, confused and hurt, leaning forward toward his brother", SAU_B, "LEFT", "confused, hurt, rising",
     f"Close-up of {GER} {PORCH}, {GR}, confused and hurt", "LEFT")),
 ("c05", 6, S("c05", "Saúl", f"Close-up of {SAU} {PORCH0}, {SL}, a cold satisfied half-smile at his brother", GER_B, "RIGHT", "cold, satisfied, cutting",
     f"Close-up of {SAU} {PORCH}, {SL}, cold satisfied half-smile", "RIGHT")),
 ("c06", 6, S("c06", "Gerónimo", f"Close-up of {GER} {PORCH0}, {GR}, turning to his father, pleading, his voice tight", EVO_B, "RIGHT", "pleading, tight, upset",
     f"Close-up of {GER} {PORCH}, {GR}, pleading", "LEFT")),
 ("c07", D8("c07"), S("c07", "Evodio", f"Close-up of {EVO} {PORCH0}, {ER}, he raises one hand slowly and speaks with total authority without raising his voice", GER_B, "RIGHT", "authoritative, slow, cold",
     f"Close-up of {EVO} {PORCH}, {ER}, total authority, one hand raised", "LEFT")),
 ("r1", 6, one(f"Close-up of {EVO} {PORCH}, {ER}, he opens the white envelope, unfolds a sheet of paper and reads in silence, his face unreadable, the paper turned away from the camera, no readable text", "LEFT") + " No dialogue."),
 ("c08", 6, S("c08", "Saúl", f"Close-up of {SAU} {PORCH0}, {SL}, leaning on the table with both hands, triumphant, staring at his father", EVO_B, "RIGHT", "triumphant, cruel, eager",
     f"Close-up of {SAU} {PORCH}, {SL}, leaning on the table, triumphant", "RIGHT")),
 ("c09", 6, S("c09", "Evodio", f"Close-up of {EVO} {PORCH0}, {ER}, he folds the paper calmly and puts it back in the envelope, serene, looking up at his eldest son", SAU_B, "LEFT", "serene, calm, slow",
     f"Close-up of {EVO} {PORCH}, {ER}, serene, folding the paper", "LEFT")),
 ("c10", 6, S("c10", "Evodio", f"Close-up of {EVO} {PORCH0}, {ER}, he leans forward, eyes fixed on his eldest son, a cold quiet voice, a short pause between the two questions", SAU_B, "LEFT", "cold, quiet, deadly calm",
     f"Close-up of {EVO} {PORCH}, {ER}, leaning forward, cold and quiet", "LEFT")),
 ("r2", 6, one(f"Close-up of {SAU} {PORCH}, {SL}, frozen, the triumph drains from his face, his lips part, he slowly straightens up, completely still", "RIGHT") + " Slow push-in. No dialogue."),
 ("r3", 6, one(f"Close-up of {GER} {PORCH}, {GR}, stunned, he slowly turns his head from his father to his brother", "LEFT") + " No dialogue."),
 # CTA con carisma (después del BLACK): Evodio a cámara
 ("c11", 10, talk("c11", "Evodio", f"Close-up from the chest up of {EVO} {PORCH}, seated, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, picks up his cream felt cowboy hat and puts it on slowly, strokes his white mustache, raises one eyebrow, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("triumphant, cruel, eager", "triumphant, eager"), ("cold, quiet, deadly calm", "cold, quiet, calm"), ("cruel", "proud"), ("deadly", "very"), ("slaps", "puts"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden afternoon light on the stone porch of a cattle ranch in Guanajuato, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, ranch porch with stone arches in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{EVODIO_SALCEDO}", "a stern Mexican rancher in his late sixties with thick white hair, a white mustache and a dark-brown suede jacket"),
         ("@{SAUL_SALCEDO}", "a Mexican man around forty with grey temples, clean-shaven, in a navy-blue quilted vest over a checkered shirt"),
         ("@{GERONIMO_SALCEDO}", "a Mexican man in his early thirties with wavy dark-brown hair, a short beard and a beige linen shirt"),
         (" @{LOC_PORTALPENJAMO}", "")]
#@INCLUDE tail

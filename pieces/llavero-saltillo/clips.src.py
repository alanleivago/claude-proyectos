"""Genera los clips de llavero-saltillo PARTE 1 (El Llavero de Saltillo, MAJESTIC) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #8 "Las llaves de la bodega" (Herencia y testamento; con figura de poder: don Gregorio, el patrón de los camiones), cierre tipo 1 (entra un personaje inesperado):
en la lectura del testamento, los hijos Reinaldo (46) y Zulema (41) se burlan de la nuera viuda Itzayana (32), que cuidó al patrón; a ella le toca solo un llavero viejo:
la llave de una bodega de la calle Allende que "nadie conocía". Ella la abre al anochecer: sentada bajo una lámpara la espera una señora elegante (63): "Te estaba esperando, Itzayana."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (despacho): el notario Olegario SENTADO detrás del escritorio al CENTRO; Itzayana de pie a la IZQUIERDA; Reinaldo y Zulema de pie a la DERECHA (Zulema más cerca del escritorio).
OFF0 = ("in the wood-paneled private office of a late powerful businessman in Saltillo, Coahuila @{LOC_DESPACHOSALTILLO} in the afternoon: a large dark wooden desk with a green banker's lamp, leather armchairs, bookshelves, "
        "a big window with dry mountains in the distance; no readable text, no signs, no logos")
OFF = OFF0 + "; nobody else in the background, no extras, nobody besides the person described"
BOD0 = ("inside an old brick warehouse in Saltillo at dusk @{LOC_BODEGAALLENDE}: dusty wooden floor, old furniture covered with white sheets, stacked wooden crates, a single warm floor lamp lit next to an old velvet armchair, "
        "high small windows with the last orange light; no readable text, no signs, no logos")
BOD = BOD0 + "; nobody else in the background, no extras, nobody besides the person described"
ITZ = ("@{ITZAYANA_CORDERO} (32-year-old Mexican woman, warm brown skin, long straight black hair in a low ponytail, kind tired dark eyes, no makeup, a simple navy-blue cardigan over a white blouse, a thin gold chain)")
ZUL = ("@{ZULEMA_MONTEMAYOR} (41-year-old Mexican woman, fair skin, a blonde highlighted bob, red lipstick, a cream designer blazer, large pearl earrings, big sunglasses pushed up on her head)")
REI = ("@{REINALDO_MONTEMAYOR} (46-year-old Mexican man, light skin, slicked-back black hair with grey temples, a trimmed black beard, a charcoal suit with an open-collar white shirt, a gold watch)")
OLE = ("@{OLEGARIO_ZERTUCHE} (66-year-old Mexican man, bald on top with white hair on the sides, round wire glasses, a white mustache, a brown tweed jacket and a dark-red bow tie)")
MUJ = ("@{MUJER_BODEGA} (63-year-old elegant Mexican woman, light-brown skin, silver hair in a neat chignon, dark serene eyes, an emerald-green shawl over a long black dress, small emerald earrings)")
#@INCLUDE funcs1
ITZ_B = "@{ITZAYANA_CORDERO} seen from behind (long black low ponytail, navy-blue cardigan)"
ZUL_B = "@{ZULEMA_MONTEMAYOR} seen from behind (blonde bob with sunglasses on her head, cream blazer)"
REI_B = "@{REINALDO_MONTEMAYOR} seen from behind (slicked-back black hair with grey temples, charcoal suit jacket)"
OLE_B = "@{OLEGARIO_ZERTUCHE} seen from behind (bald head with white hair on the sides, brown tweed jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
IL = "standing on the LEFT in front of the desk"
ZR = "standing on the RIGHT in front of the desk"
RR = "standing on the RIGHT next to his sister"
OC = "sitting behind the big desk in the CENTER, a leather folder open in front of him"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

def T(cid, who, other, desc, tone, one_desc, one_side):
    return (talk(cid, who, two(desc) + " " + MOUTH(who, other), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Zulema YA hablando con desprecio, Itzayana de espaldas en el borde.
 ("c01", 6, S("c01", "Zulema", f"Medium close-up of {ZUL} {OFF0}, {ZR}, talking from the very first frame, looking her up and down with contempt, arms crossed", ITZ_B, "LEFT", "contemptuous, mocking, cold",
     f"Medium close-up of {ZUL} {OFF}, {ZR}, talking from the very first frame, contemptuous", "LEFT")),
 ("c02", D8("c02"), S("c02", "Itzayana", f"Close-up of {ITZ} {OFF0}, {IL}, calm and dignified, holding back her hurt", ZUL_B, "RIGHT", "calm, dignified, soft",
     f"Close-up of {ITZ} {OFF}, {IL}, calm and dignified", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Reinaldo", f"Close-up of {REI} {OFF0}, {RR}, a cruel half smile, adjusting his gold watch", ITZ_B, "LEFT", "cruel, mocking, dismissive",
     f"Close-up of {REI} {OFF}, {RR}, cruel half smile", "LEFT")),
 ("c04", 6, S("c04", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, raising one hand for calm, then adjusting his round glasses", REI_B, "RIGHT", "calm, formal, firm",
     f"Close-up of {OLE} {OFF}, {OC}, raising one hand for calm", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, reading formally from the papers in the leather folder", REI_B, "RIGHT", "formal, slow, clear",
     f"Close-up of {OLE} {OFF}, {OC}, reading formally from a folder", "RIGHT")),
 ("r1", 6, two(f"{ZUL} {ZR} and {REI} {RR} {OFF}, the two siblings exchange a satisfied smug smile, Zulema touches her pearl earring") + " " + MUTE),
 ("c06", 6, S("c06", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, a short pause, he slides something small across the desk toward the woman on the left", ITZ_B, "LEFT", "formal, slow, a little solemn",
     f"Close-up of {OLE} {OFF}, {OC}, sliding something across the desk", "LEFT")),
 ("i01", 6, f"Close-up insert {OFF0}: on the dark wooden desk, an old rusty iron key ring with one big old key and a small worn leather tag, a woman's hand slowly picks it up; no readable text. No dialogue."),
 ("c07", 6, S("c07", "Zulema", f"Close-up of {ZUL} {OFF0}, {ZR}, bursting into a mocking laugh, pointing with her chin at the key ring", ITZ_B, "LEFT", "mocking, laughing, cruel",
     f"Close-up of {ZUL} {OFF}, {ZR}, mocking laugh", "LEFT")),
 ("c08", 6, S("c08", "Reinaldo", f"Close-up of {REI} {OFF0}, {RR}, smug, hands in his pockets", ITZ_B, "LEFT", "smug, cold, dismissive",
     f"Close-up of {REI} {OFF}, {RR}, smug", "LEFT")),
 ("c09", D8("c09"), S("c09", "Itzayana", f"Close-up of {ITZ} {OFF0}, {IL}, holding the old key ring in her hand, eyes shining, dignified", REI_B, "RIGHT", "dignified, hurt, steady",
     f"Close-up of {ITZ} {OFF}, {IL}, holding an old key ring, dignified", "RIGHT")),
 ("c10", D8("c10"), S("c10", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, leaning forward, lowering his voice, looking at her over his round glasses", ITZ_B, "LEFT", "low, serious, meaningful",
     f"Close-up of {OLE} {OFF}, {OC}, leaning forward, serious", "LEFT")),
 ("c11", 6, S("c11", "Reinaldo", f"Close-up of {REI} {OFF0}, {RR}, his smile freezes, he takes his hands out of his pockets, tense", OLE_B, "LEFT", "tense, defensive, fast",
     f"Close-up of {REI} {OFF}, {RR}, tense, smile frozen", "LEFT")),
 ("c12", D8("c12"), S("c12", "Olegario", f"Close-up of {OLE} {OFF0}, {OC}, calm, a knowing look at the eldest son", REI_B, "RIGHT", "calm, knowing, firm",
     f"Close-up of {OLE} {OFF}, {OC}, calm and knowing", "RIGHT")),
 ("r2", 6, two(f"{ZUL} {ZR} and {REI} {RR} {OFF}, Zulema turns to her brother confused, Reinaldo avoids her eyes and swallows") + " " + MUTE),
 ("c13", 6, T("c13", "Zulema", "Reinaldo", f"{ZUL} and {REI} {OFF0}, side by side, she turns to her brother, confused and suspicious, he stares ahead", "confused, suspicious, sharp",
     f"Close-up of {ZUL} {OFF}, {ZR}, confused and suspicious", "LEFT")),
 ("c14", 6, S("c14", "Reinaldo", f"Close-up of {REI} {OFF0}, {RR}, stepping toward her, holding out his open hand, hard and nervous", ITZ_B, "LEFT", "hard, nervous, demanding",
     f"Close-up of {REI} {OFF}, {RR}, holding out his open hand, demanding", "LEFT")),
 ("c15", 6, S("c15", "Itzayana", f"Close-up of {ITZ} {OFF0}, {IL}, closing her hand around the old key ring, firm and calm for the first time", REI_B, "RIGHT", "firm, calm, brave",
     f"Close-up of {ITZ} {OFF}, {IL}, closing her hand around a key ring, firm", "RIGHT")),
 ("r3", 6, f"Medium shot of {ITZ} at dusk on an empty old street in Saltillo, standing in front of the old wooden double door of a brick warehouse, she puts the big old key into the lock and turns it; nobody else around; no readable text, no signs. Nobody speaks. No dialogue."),
 ("r4", 6, one(f"Medium shot of {ITZ} {BOD}, she pushes the door open and steps slowly into the dim warehouse, looking around, holding the key ring, uneasy", "RIGHT") + " " + MUTE),
 ("c16", 6, talk("c16", "Itzayana", one(f"Close-up of {ITZ} {BOD}, walking slowly between the furniture covered with white sheets, calling out softly into the dim warehouse, uneasy", "RIGHT"), "uneasy, soft, calling out")),
 ("r5", 6, one(f"Medium shot of {MUJ} {BOD}, sitting very still in the old velvet armchair under the warm floor lamp, she slowly turns her head toward the camera and smiles serenely", "LEFT") + " Slow push-in. " + MUTE),
 ("c17", D8("c17"), S("c17", "The lady", f"Close-up of {MUJ} {BOD0}, sitting in the velvet armchair under the lamp, serene, a small mysterious smile", ITZ_B, "LEFT", "serene, warm, mysterious",
     f"Close-up of {MUJ} {BOD}, sitting in a velvet armchair, serene, mysterious smile", "LEFT")),
 # CTA con carisma (después del BLACK): Itzayana a cámara
 ("c18", 10, talk("c18", "Itzayana", f"Close-up from the chest up of {ITZ} {BOD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, holds up the old key ring for a second, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("contemptuous, mocking, cold", "cold, dismissive"), ("mocking, laughing, cruel", "laughing, amused"), ("cruel, mocking, dismissive", "smug, dismissive"), ("cruel half smile", "smug half smile"), ("cruel", "smug"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in a wood-paneled office, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family office, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ITZAYANA_CORDERO}", "a young Mexican woman with a long black low ponytail and a navy-blue cardigan"),
         ("@{ZULEMA_MONTEMAYOR}", "a Mexican woman in her forties with a blonde bob, red lipstick and a cream blazer"),
         ("@{REINALDO_MONTEMAYOR}", "a Mexican man in his forties with slicked-back hair, grey temples, a trimmed beard and a charcoal suit"),
         ("@{OLEGARIO_ZERTUCHE}", "an old Mexican man with round wire glasses, a white mustache, a tweed jacket and a bow tie"),
         ("@{MUJER_BODEGA}", "an elegant older Mexican woman with silver hair in a chignon and an emerald-green shawl"),
         (" @{LOC_DESPACHOSALTILLO}", ""), (" @{LOC_BODEGAALLENDE}", "")]
#@INCLUDE tail

"""Genera los clips de carta-durango PARTE 1 (La Carta de Durango, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #49 "El hacendado y la hija del enemigo" [CAPO] (Patronas y haciendas), cierre tipo 4 (descubre que la vieron): Inés Ocampo (29) entra a trabajar al despacho de la hacienda
ganadera de don Fausto (63), el hombre que acusó a su padre de robarle ganado, con el apellido falso "Ruiz". Fausto cree reconocer sus ojos; la ama de llaves Pilar (60) la presentó; el hijo
Joaquín (32) es amable con ella. De noche, Inés abre el cajón con llave y lee una carta con el sello de la hacienda; Joaquín la encuentra: "Ese cajón es de mi papá."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (despacho): Fausto sentado detrás del escritorio a la DERECHA; Inés de pie a la IZQUIERDA; Pilar a la IZQUIERDA junto a la puerta; Joaquín a la DERECHA junto a la ventana.
YARD0 = ("in the study of an old cattle hacienda near Durango @{LOC_DESPACHODURANGO} in the afternoon: a heavy dark-wood desk with a small locked drawer, a green desk lamp, leather armchairs, "
         "wooden bookshelves, a tall window showing dry plains and wooden corrals, warm light; no readable text, no signs, no logos")
NIGHT0 = ("in the same hacienda study @{LOC_DESPACHODURANGO} at night: dark, only the green desk lamp on, the heavy dark-wood desk with its small drawer, the window black; "
          "no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
NIGHT = NIGHT0 + "; nobody else in the background, no extras, nobody besides the person described"
FAU = ("@{FAUSTO_ELIZONDO} (63-year-old Mexican man, light weathered skin, thick white hair combed back, a short white beard, a tan suede jacket over a white shirt with a silver bolo tie)")
INE = ("@{INES_OCAMPO} (29-year-old Mexican woman, olive skin, long dark-brown hair in a thick braid over one shoulder, a simple mustard-yellow long-sleeve blouse)")
JOA = ("@{JOAQUIN_ELIZONDO} (32-year-old Mexican man, tanned skin, short black hair, light stubble, an open faded denim western shirt over a grey t-shirt)")
PIL = ("@{PILAR_SOTO} (60-year-old Mexican woman, brown skin, short curly grey hair, reading glasses hanging on a chain, a navy-blue cardigan over a floral blouse)")
#@INCLUDE funcs1
FAU_B = "@{FAUSTO_ELIZONDO} seen from behind (thick white hair, tan suede jacket)"
INE_B = "@{INES_OCAMPO} seen from behind (long dark-brown braid, mustard-yellow blouse)"
JOA_B = "@{JOAQUIN_ELIZONDO} seen from behind (short black hair, faded denim shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
FR = "seated behind the dark-wood desk on the RIGHT"
IL = "standing on the LEFT in front of the desk"
PL = "standing on the LEFT near the door"
JR = "standing on the RIGHT by the tall window"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Fausto YA hablando, mirándola fijo; Inés de espaldas en el borde.
 ("c01", 6, S("c01", "Fausto", f"Medium close-up of {FAU} {YARD0}, {FR}, talking from the very first frame, studying her face with narrowed eyes, suspicious", INE_B, "LEFT", "slow, suspicious, low",
     f"Medium close-up of {FAU} {YARD}, {FR}, talking from the very first frame, suspicious", "LEFT")),
 ("c02", 6, S("c02", "Inés", f"Close-up of {INE} {YARD0}, {IL}, a polite small smile that hides tension", FAU_B, "RIGHT", "polite, calm, hiding nerves",
     f"Close-up of {INE} {YARD}, {IL}, a polite small smile", "RIGHT")),
 ("c03", 6, talk("c03", "Pilar", one(f"Close-up of {PIL} {YARD}, {PL}, her hands clasped, helpful and a little nervous", "RIGHT"), "helpful, quick, respectful")),
 ("c04", 6, S("c04", "Fausto", f"Close-up of {FAU} {YARD0}, {FR}, leaning back in his chair, fingers together, testing her", INE_B, "LEFT", "testing, slow, cold",
     f"Close-up of {FAU} {YARD}, {FR}, testing her", "LEFT")),
 ("c05", 6, S("c05", "Inés", f"Close-up of {INE} {YARD0}, {IL}, she holds his gaze without blinking", FAU_B, "RIGHT", "steady, short, calm",
     f"Close-up of {INE} {YARD}, {IL}, holding his gaze", "RIGHT")),
 ("r1", 6, one(f"Close-up of {FAU} {YARD}, {FR}, he stares at her in silence for a long moment, his grey eyes narrowing, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c06", 6, S("c06", "Fausto", f"Close-up of {FAU} {YARD0}, {FR}, cold, proud, a hard smile", INE_B, "LEFT", "cold, proud, hard",
     f"Close-up of {FAU} {YARD}, {FR}, cold and proud", "LEFT")),
 ("c07", 6, S("c07", "Inés", f"Close-up of {INE} {YARD0}, {IL}, her jaw tight, eyes shining with contained anger, still polite", FAU_B, "RIGHT", "contained, low, cutting",
     f"Close-up of {INE} {YARD}, {IL}, contained anger", "RIGHT")),
 ("c08", 6, S("c08", "Joaquín", f"Close-up of {JOA} {YARD0}, {JR}, friendly, a light smile, slightly embarrassed for his father", FAU_B, "RIGHT", "friendly, light, warm",
     f"Close-up of {JOA} {YARD}, {JR}, friendly", "LEFT")),
 ("c09", D8("c09"), S("c09", "Fausto", f"Close-up of {FAU} {YARD0}, {FR}, he taps the small locked drawer of the desk with one finger, firm", JOA_B, "LEFT", "firm, commanding",
     f"Close-up of {FAU} {YARD}, {FR}, firm", "LEFT")),
 ("c10", 6, talk("c10", "Joaquín", two(f"{JOA} on the RIGHT and {INE} on the LEFT {YARD0}, standing by the bookshelves, framed from the waist up; he talks to her softly with an apologetic smile, "
     f"slightly closer to the camera and in sharper focus, she listens") + " " + MOUTH("Joaquín", "Inés"), "soft, apologetic, warm")),
 ("c11", 6, S("c11", "Inés", f"Close-up of {INE} {YARD0}, standing by the bookshelves on the LEFT, a soft sad smile, her eyes conflicted", JOA_B, "RIGHT", "soft, conflicted, low",
     f"Close-up of {INE} {YARD}, standing by the bookshelves, conflicted", "RIGHT")),
 # Noche: abre el cajón
 ("r2", 6, one(f"Medium shot of {INE} {NIGHT}, alone, bent over the desk, she opens the small drawer with a hairpin and takes out an old folded letter, nervous, glancing toward the door", "RIGHT", NODOUBLE("woman with a braid")) + " No dialogue."),
 ("i01", 6, f"Close-up insert {NIGHT0}: an old folded letter closed with a red wax seal shaped like a bull's head lies open in the lamp light on the dark-wood desk; no readable text, only the paper and the seal, no hands, no people. No dialogue."),
 ("c12", 6, talk("c12", "Joaquín", one(f"Close-up of {JOA} {NIGHT}, standing in the dark doorway, lit by the desk lamp, surprised and hurt, staring at her", "LEFT"), "surprised, low, hurt")),
 ("r3", 6, one(f"Close-up of {INE} {NIGHT}, standing behind the desk holding the open letter, frozen, she slowly lifts her eyes toward the door, caught", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Inés a cámara
 ("c13", 10, talk("c13", "Inés", f"Close-up from the chest up of {INE} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts determined, makes a short pause, runs her fingers along her braid, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small bittersweet smile. Nobody else around.",
     "charismatic, determined, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Aquí hubo un Ocampo que me robó ganado.", "Aquí hubo un Ocampo que me falló."), ("anger", "emotion"), ("cutting", "firm"), ("hairpin", "small key"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm light in the dark-wood study of an old cattle hacienda in Durango, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old hacienda study in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FAUSTO_ELIZONDO}", "a Mexican man in his sixties with thick white hair, a short white beard, a tan suede jacket and a silver bolo tie"),
         ("@{INES_OCAMPO}", "a Mexican woman in her late twenties with a long dark-brown braid over one shoulder and a mustard-yellow blouse"),
         ("@{JOAQUIN_ELIZONDO}", "a tanned Mexican man in his early thirties with short black hair, light stubble and an open denim shirt over a grey t-shirt"),
         ("@{PILAR_SOTO}", "a Mexican woman around sixty with short curly grey hair, glasses on a chain and a navy cardigan over a floral blouse"),
         (" @{LOC_DESPACHODURANGO}", "")]
#@INCLUDE tail

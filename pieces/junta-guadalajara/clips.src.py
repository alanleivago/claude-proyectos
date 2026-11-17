"""Genera los clips de junta-guadalajara PARTE 1 (La Junta de Guadalajara, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #26 "La secretaria que no olvidó" [CAPO], cierre tipo 1 (entra un personaje inesperado): en la sala de juntas de su casa tequilera, don Ernesto Valdivia (60) le pide café a la mujer
que entra, creyendo que es una asistente: es Lucía (40), la secretaria a la que humilló hace quince años, hoy socia mayoritaria del grupo con el que él quiere aliarse. Su hijo Mauricio (32) se burla.
Ernesto intenta arreglarlo; Lucía dice que su socia viene subiendo. Entra Beatriz (58), la esposa de Ernesto: "Vengo a firmar con mi socia."
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (sala de juntas): Ernesto sentado y Mauricio de pie a la DERECHA de la mesa; Lucía a la IZQUIERDA (luego en la cabecera izquierda); la puerta de vidrio a la IZQUIERDA.
YARD0 = ("in a modern boardroom on the top floor of a tequila company in Guadalajara, Jalisco @{LOC_JUNTAGUADALAJARA} in the morning: glass walls, a long dark wood conference table with leather chairs, "
         "a blue agave plant in a big clay pot, shelves with unlabeled tequila bottles, a wide window with the city view, soft light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
FOLDER = "a black leather document folder and a silver fountain pen"
ERN = ("@{ERNESTO_VALDIVIA} (60-year-old Mexican man, heavy-set, light skin, slicked-back grey hair, a grey goatee, a dark-navy pinstripe suit, a white shirt with no tie, a gold signet ring)")
LUC = ("@{LUCIA_MENDEZ} (40-year-old Mexican woman, light-brown skin, sleek straight black shoulder-length hair, small diamond earrings, a tailored ivory pantsuit over a black silk blouse)")
MAU = ("@{MAURICIO_VALDIVIA} (32-year-old Mexican man, fair skin, styled short black hair with a quiff, clean-shaven, a slim light-grey suit, a pink shirt open at the collar)")
BEA = ("@{BEATRIZ_VALDIVIA} (58-year-old Mexican woman, fair skin, short elegant light-brown bob, pearl earrings, a camel wool coat over a black turtleneck dress, a black handbag on her arm)")
#@INCLUDE funcs1
ERN_B = "@{ERNESTO_VALDIVIA} seen from behind (slicked-back grey hair, dark-navy pinstripe suit, heavy-set)"
LUC_B = "@{LUCIA_MENDEZ} seen from behind (sleek straight black shoulder-length hair, ivory pantsuit)"
MAU_B = "@{MAURICIO_VALDIVIA} seen from behind (styled short black hair, light-grey suit)"
#@INCLUDE funcs2
#@INCLUDE d8
ER = "sitting on the RIGHT at the conference table, leaning back in a leather chair"
MR = "standing on the RIGHT behind his father's chair"
LL = "standing on the LEFT near the glass door"
LH = "sitting at the head of the conference table on the LEFT, very straight"
BL = "standing on the LEFT in the open glass doorway"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ernesto YA hablando sin levantar la vista de su celular; Lucía de espaldas (LEFT).
 ("c01", 6, S("c01", "Ernesto", f"Medium close-up of {ERN} {YARD0}, {ER}, talking from the very first frame without looking up from his cell phone, arrogant, he waves two fingers", LUC_B, "LEFT", "arrogant, bored, bossy",
     f"Medium close-up of {ERN} {YARD}, {ER}, talking from the very first frame without looking up from his phone, arrogant", "LEFT")),
 ("c02", 6, S("c02", "Lucía", f"Close-up of {LUC} {YARD0}, {LL}, calm, a cold small smile", ERN_B, "RIGHT", "calm, cold, slow",
     f"Close-up of {LUC} {YARD}, {LL}, calm, a cold small smile", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Ernesto", one(f"Close-up of {ERN} {YARD}, {ER}, he finally looks up, surprised, then scoffs", "LEFT"), "surprised, scornful")),
 ("r1", 6, f"Medium shot of {MAU} {YARD}, {MR}, already in place, hands in his pockets, a mocking smirk, {gaze('LEFT')}; {ALONE}; {NODOUBLE('young man in a light-grey suit')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Mauricio", one(f"Close-up of {MAU} {YARD}, {MR}, mocking, he chuckles", "LEFT"), "mocking, cocky")),
 ("c05", 6, S("c05", "Lucía", f"Close-up of {LUC} {YARD0}, {LL}, calm and firm, she places {FOLDER} on the table", MAU_B, "RIGHT", "calm, firm",
     f"Close-up of {LUC} {YARD}, {LL}, calm and firm", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: {FOLDER} lie on the dark wood conference table, the folder opens to show printed pages without readable text; only the folder and the pen, no hands, no people. No dialogue."),
 ("c06", D8("c06"), S("c06", "Ernesto", f"Close-up of {ERN} {YARD0}, {ER}, contemptuous, he points lazily at the door", LUC_B, "LEFT", "contemptuous, cruel",
     f"Close-up of {ERN} {YARD}, {ER}, contemptuous", "LEFT")),
 ("c07", 6, talk("c07", "Lucía", one(f"Close-up of {LUC} {YARD}, {LH}, she has just sat down at the head of the table, calm, powerful, a cold stare", "RIGHT"), "calm, powerful, slow")),
 ("r2", 6, one(f"Close-up of {ERN} {YARD}, {ER}, in silence, stunned, his cell phone slowly lowers, his smile disappears", "LEFT") + " Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Mauricio", one(f"Close-up of {MAU} {YARD}, {MR}, nervous now, he bends toward his father", "LEFT"), "nervous, whispering")),
 ("c09", 6, S("c09", "Ernesto", f"Close-up of {ERN} {YARD0}, {ER}, a big false smile, he spreads his hands", LUC_B, "LEFT", "falsely warm, nervous",
     f"Close-up of {ERN} {YARD}, {ER}, a big false smile", "LEFT")),
 ("c10", 6, S("c10", "Lucía", f"Close-up of {LUC} {YARD0}, {LH}, firm, her eyes shine with contained anger", ERN_B, "RIGHT", "firm, low, contained",
     f"Close-up of {LUC} {YARD}, {LH}, firm", "RIGHT")),
 ("c11", 6, talk("c11", "Ernesto", one(f"Close-up of {ERN} {YARD}, {ER}, he leans forward, trying to negotiate", "LEFT"), "nervous, persuasive")),
 ("c12", 6, S("c12", "Lucía", f"Close-up of {LUC} {YARD0}, {LH}, a small mysterious smile, she glances toward the glass door", ERN_B, "RIGHT", "calm, mysterious",
     f"Close-up of {LUC} {YARD}, {LH}, a small mysterious smile", "RIGHT")),
 ("r3", 6, f"Medium shot of {BEA} {YARD}, {BL}, already standing in place, elegant and serious, she slowly takes off dark sunglasses, {gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a camel coat')}. Slow push-in. No dialogue."),
 ("c13", 6, talk("c13", "Ernesto", one(f"Close-up of {ERN} {YARD}, he stands up from his chair, pale, confused", "LEFT"), "confused, scared, low")),
 ("c14", 6, talk("c14", "Beatriz", one(f"Close-up of {BEA} {YARD}, {BL}, cold and hurt, chin up", "RIGHT"), "cold, hurt, firm")),
 # CTA con carisma (después del BLACK): Lucía sola, a cámara
 ("c15", 10, talk("c15", "Lucía", f"Close-up from the chest up of {LUC} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, taps the silver fountain pen on her palm, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small satisfied half smile. Nobody else around.",
     "charismatic, confident, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Usted me humilló frente a toda la oficina.", "Usted me hizo menos frente a toda la oficina."), ("No una secretaria que lloraba en el baño.", "No una secretaria de hace años."),
        ("contained anger", "emotion"), ("contemptuous", "cool"), ("scornful", "amused"), ("stunned", "surprised"), ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft morning light in a modern boardroom of a tequila company in Guadalajara, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, modern corporate boardroom with glass walls in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ERNESTO_VALDIVIA}", "a heavy-set Mexican man around sixty with slicked-back grey hair, a grey goatee and a dark-navy pinstripe suit"),
         ("@{LUCIA_MENDEZ}", "a Mexican businesswoman around forty with sleek straight black shoulder-length hair and a tailored ivory pantsuit"),
         ("@{MAURICIO_VALDIVIA}", "a Mexican man in his early thirties with a styled black quiff, a slim light-grey suit and a pink shirt"),
         ("@{BEATRIZ_VALDIVIA}", "an elegant Mexican woman in her late fifties with a short light-brown bob, pearl earrings and a camel wool coat"),
         (" @{LOC_JUNTAGUADALAJARA}", "")]
#@INCLUDE tail

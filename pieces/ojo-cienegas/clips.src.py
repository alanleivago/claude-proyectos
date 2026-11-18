"""Genera los clips de ojo-cienegas PARTE 1 (El Ojo de Agua, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #51 "La cacica del Miedo" [CAPO] (Patronas y haciendas), cierre tipo 2 (documento leído, corte antes del dato): en el lindero de su hacienda nogalera en Cuatro Ciénegas,
la temida doña Tránsito (58) encara a Andrés (35), licenciado y nieto del vecino, que vino a medir. Su capataz Rosendo (54) lo reconoce. Andrés acusa que ella fue corriendo la cerca
y despliega el plano original que guardó su abuelo: "el ojo de agua queda dentro de la tierra de…" (corte).
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (lindero): Tránsito a la DERECHA junto a los nogales; Rosendo a la DERECHA un paso detrás de ella; Andrés a la IZQUIERDA junto a la cerca de alambre y la mesa de madera.
LIN0 = ("at the boundary of a pecan hacienda in Cuatro Cienegas, Coahuila @{LOC_LINDEROCIENEGAS} in the dry mid-afternoon: an old barbed wire fence with crooked wooden posts, tall pecan trees, desert scrub and pale mountains, "
        "a clear turquoise spring pool in the distance; no readable text, no signs, no logos")
LIN = LIN0 + "; nobody else in the background, no extras, nobody besides the person described"
TRA = ("@{TRANSITO_ELIZONDO} (58-year-old Mexican woman, sun-tanned skin, short silver-streaked black hair swept back, sharp dark eyes, a black felt cowboy hat, a tan suede ranch jacket over a black blouse)")
AND = ("@{ANDRES_VILLARREAL} (35-year-old Mexican man, fair skin, short neat brown hair, light stubble, rimless glasses, a navy blazer over a white shirt without tie)")
ROS = ("@{ROSENDO_AYALA} (54-year-old Mexican man, dark weathered skin, grey stubble, a straw cowboy hat, a red bandana around his neck, a faded beige work shirt)")
#@INCLUDE funcs1
TRA_B = "@{TRANSITO_ELIZONDO} seen from behind (black felt cowboy hat, tan suede ranch jacket)"
AND_B = "@{ANDRES_VILLARREAL} seen from behind (short neat brown hair, navy blazer)"
ROS_B = "@{ROSENDO_AYALA} seen from behind (straw cowboy hat, red bandana, beige work shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
TR = "standing on the RIGHT under the pecan trees"
RR = "standing on the RIGHT a step behind the patrona, under the pecan trees"
AL = "standing on the LEFT by the barbed wire fence and a wooden table"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Tránsito YA hablando, dura, Andrés de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Tránsito", f"Medium close-up of {TRA} {LIN0}, {TR}, talking from the very first frame, cold and dominant, she tips her hat brim up with one finger", AND_B, "LEFT", "cold, dominant, threatening",
     f"Medium close-up of {TRA} {LIN}, {TR}, talking from the very first frame, cold and dominant", "LEFT")),
 ("c02", 6, S("c02", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, calm and polite, adjusting his glasses, not intimidated", TRA_B, "RIGHT", "calm, polite, firm",
     f"Close-up of {AND} {LIN}, {AL}, calm, adjusting his glasses", "RIGHT")),
 ("c03", 6, S("c03", "Rosendo", f"Close-up of {ROS} {LIN0}, {RR}, leaning toward the patrona, talking low, worried", TRA_B, "LEFT", "low, worried, respectful",
     f"Close-up of {ROS} {LIN}, {RR}, talking low, worried", "LEFT")),
 ("c04", D8("c04"), S("c04", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, quiet and sincere, he rests one hand on a crooked fence post", TRA_B, "RIGHT", "quiet, sincere, firm",
     f"Close-up of {AND} {LIN}, {AL}, quiet and sincere, hand on a fence post", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, a dry contemptuous smile, looking the lawyer up and down", AND_B, "LEFT", "dry, scornful, proud",
     f"Close-up of {TRA} {LIN}, {TR}, dry smile", "LEFT")),
 ("c06", 6, S("c06", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, without looking away from the lawyer, she gives a curt order to her foreman beside her", ROS_B, "RIGHT", "curt, commanding, cold",
     f"Close-up of {TRA} {LIN}, {TR}, giving a curt order", "RIGHT")),
 ("r1", 6, one(f"Close-up of {ROS} {LIN}, {RR}, he hesitates, looks down at the wooden stakes in the ground by the fence, then at the patrona, uneasy, he does not move", "LEFT") + " No dialogue."),
 ("c07", D8("c07"), S("c07", "Rosendo", f"Close-up of {ROS} {LIN0}, {RR}, uneasy, holding his straw hat, speaking carefully to the patrona", TRA_B, "LEFT", "careful, uneasy, honest",
     f"Close-up of {ROS} {LIN}, {RR}, careful and uneasy", "LEFT")),
 ("c08", D8("c08"), S("c08", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, he points calmly at a crooked fence post, steady voice", TRA_B, "RIGHT", "steady, accusing, calm",
     f"Close-up of {AND} {LIN}, {AL}, pointing calmly at the fence", "RIGHT")),
 ("c09", 6, S("c09", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, she takes a slow step toward him, eyes hard, voice low", AND_B, "LEFT", "low, hard, warning",
     f"Close-up of {TRA} {LIN}, {TR}, eyes hard, voice low", "LEFT")),
 ("c10", 6, S("c10", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, he steps forward too, calm, face to face with her", TRA_B, "RIGHT", "calm, firm, brave",
     f"Close-up of {AND} {LIN}, {AL}, calm and brave", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, a cold proud smile, enjoying the memory", AND_B, "LEFT", "cold, proud, cutting",
     f"Close-up of {TRA} {LIN}, {TR}, cold proud smile", "LEFT")),
 ("c12", 6, S("c12", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, his jaw tightens, controlled anger, steady voice", TRA_B, "RIGHT", "controlled, accusing, steady",
     f"Close-up of {AND} {LIN}, {AL}, controlled anger", "RIGHT")),
 ("r2", 6, one(f"Close-up of {ROS} {LIN}, {RR}, he slowly turns his head toward the patrona, surprised, as if hearing this for the first time, silent", "LEFT") + " No dialogue."),
 ("c13", 6, S("c13", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, he holds up a rolled old yellowed paper, serious", TRA_B, "RIGHT", "serious, calm, meaningful",
     f"Close-up of {AND} {LIN}, {AL}, holding up a rolled old paper", "RIGHT")),
 ("r3", 6, one(f"Medium shot of {AND} {LIN}, {AL}, he unrolls a large old yellowed hand-drawn land map on the wooden table and holds its corners flat, the map facing away from the camera, no readable text", "RIGHT") + " No dialogue."),
 ("i01", 6, f"Close-up insert {LIN0}: a man's hands holding flat an old yellowed hand-drawn land map on a wooden table, with faded ink lines, a drawn spring pool and an old round red wax seal in the corner; no readable text, no letters, no numbers. No dialogue."),
 ("c14", 6, S("c14", "Rosendo", f"Close-up of {ROS} {LIN0}, {RR}, staring at the map, he takes off his straw hat slowly, uneasy", TRA_B, "LEFT", "uneasy, low, surprised",
     f"Close-up of {ROS} {LIN}, {RR}, staring, taking off his hat", "LEFT")),
 ("c15", 6, S("c15", "Tránsito", f"Close-up of {TRA} {LIN0}, {TR}, arms crossed, defiant, but her eyes go to the map", AND_B, "LEFT", "defiant, dismissive, tense",
     f"Close-up of {TRA} {LIN}, {TR}, arms crossed, defiant", "LEFT")),
 ("c16", D8("c16"), S("c16", "Andrés", f"Close-up of {AND} {LIN0}, {AL}, looking down at the map on the table and reading slowly, then lifting his eyes to her before the last word", TRA_B, "RIGHT", "slow, deliberate, quiet",
     f"Close-up of {AND} {LIN}, {AL}, reading slowly from the map", "RIGHT")),
 ("r4", 6, one(f"Close-up of {TRA} {LIN}, {TR}, frozen, her hard face slowly breaks, her lips part, her eyes fixed on the map, completely still", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Andrés a cámara
 ("c17", 10, talk("c17", "Andrés", f"Close-up from the chest up of {AND} {LIN}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, takes off his glasses and holds them in one hand, raises one eyebrow, gestures with the other open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("cold, dominant, threatening", "cold, dominant"), ("low, hard, warning", "low, serious"), ("dry, scornful, proud", "dry, proud"), ("threatening", "serious"), ("barbed wire", "wire"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, dry afternoon light at the fence line of a pecan hacienda in the Coahuila desert, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, pecan trees and an old fence in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TRANSITO_ELIZONDO}", "a stern Mexican woman in her late fifties with short silver-streaked hair, a black felt cowboy hat and a tan suede ranch jacket"),
         ("@{ANDRES_VILLARREAL}", "a Mexican man in his mid thirties with neat brown hair, rimless glasses and a navy blazer"),
         ("@{ROSENDO_AYALA}", "a Mexican foreman in his fifties with grey stubble, a straw cowboy hat and a red bandana"),
         (" @{LOC_LINDEROCIENEGAS}", "")]
#@INCLUDE tail

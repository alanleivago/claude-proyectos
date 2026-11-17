"""Genera los clips de lucero-parral PARTE 1 (El Caballo de Parral, MEXITV) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #22 "El compadre" [CAPO] (traición familiar), cierre tipo 7 (objeto que delata): en los corrales de la feria ganadera de Parral, el ganadero don Rufino (62) reconoce a su
caballo Lucero con el fierro de su rival Ismael (55). Ismael presume que se lo vendió "alguien que come en su mesa cada domingo"; su hija Ximena (34) nombra al compadre Anselmo.
En el establo de Ismael cuelga el sombrero negro que Rufino le regaló a su compadre el día que nació Lucero.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (corrales): Rufino y Ximena a la IZQUIERDA; Ismael a la DERECHA junto al caballo amarrado a la cerca.
YARD0 = ("at the livestock fair corrals in Parral, Chihuahua @{LOC_FERIAPARRAL} in the afternoon: weathered wooden corral fences, wooden horse stalls under a tin roof, hay bales, "
         "a dusty ground, a chestnut stallion with a white blaze on its forehead tied at the fence, dry mountains far away, golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
RUF = ("@{RUFINO_ALCANTARA} (62-year-old Mexican rancher, deeply tanned skin, a thick white mustache, a beige straw cowboy hat, a light-blue denim western shirt, a brown leather vest)")
ISM = ("@{ISMAEL_QUINONES} (55-year-old Mexican rancher, light skin, a neat black goatee, a white felt cowboy hat, a burgundy western shirt with embroidered yoke, a large silver belt buckle)")
VAL = ("@{XIMENA_ALCANTARA} (34-year-old Mexican woman, light-brown skin, long brown hair in a low ponytail, a cream western shirt, a denim jacket)")
#@INCLUDE funcs1
RUF_B = "@{RUFINO_ALCANTARA} seen from behind (beige straw cowboy hat, brown leather vest over a light-blue shirt)"
ISM_B = "@{ISMAEL_QUINONES} seen from behind (white felt cowboy hat, burgundy western shirt)"
VAL_B = "@{XIMENA_ALCANTARA} seen from behind (long brown hair in a low ponytail, denim jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
RL = "standing on the LEFT by the corral fence"
VL = "standing on the LEFT beside her father"
IR = "standing on the RIGHT next to the chestnut stallion"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ismael YA hablando junto al caballo, Rufino de espaldas en el borde.
 ("c01", 6, S("c01", "Ismael", f"Medium close-up of {ISM} {YARD0}, {IR}, talking from the very first frame, smug, one hand on the horse's neck", RUF_B, "LEFT", "smug, proud, mocking",
     f"Medium close-up of {ISM} {YARD}, {IR}, talking from the very first frame, smug", "LEFT")),
 ("c02", 6, S("c02", "Rufino", f"Close-up of {RUF} {YARD0}, {RL}, staring at the horse, moved and serious", ISM_B, "RIGHT", "serious, low, moved",
     f"Close-up of {RUF} {YARD}, {RL}, moved and serious", "RIGHT")),
 ("c03", 6, S("c03", "Ismael", f"Close-up of {ISM} {YARD0}, {IR}, a fake laugh, he pats the horse", RUF_B, "LEFT", "fake friendly, mocking",
     f"Close-up of {ISM} {YARD}, {IR}, a fake laugh", "LEFT")),
 ("c04", 6, S("c04", "Ximena", f"Close-up of {VAL} {YARD0}, {VL}, urgent and sure, she looks from the horse to her father", RUF_B, "RIGHT", "urgent, whispering, sure",
     f"Close-up of {VAL} {YARD}, {VL}, urgent and sure", "RIGHT")),
 ("c05", 6, S("c05", "Rufino", f"Close-up of {RUF} {YARD0}, {RL}, his voice hard now, eyes on the rival", ISM_B, "RIGHT", "hard, firm, contained",
     f"Close-up of {RUF} {YARD}, {RL}, hard and firm", "RIGHT")),
 ("c06", 6, S("c06", "Ismael", f"Close-up of {ISM} {YARD0}, {IR}, shrugging, relaxed, a sly smile", RUF_B, "LEFT", "relaxed, sly",
     f"Close-up of {ISM} {YARD}, {IR}, a sly smile", "LEFT")),
 ("r1", 6, one(f"Close-up of {RUF} {YARD}, {RL}, his jaw tightens under the white mustache, he breathes slowly, completely still", "RIGHT") + " Slow push-in. No dialogue."),
 ("c07", 6, S("c07", "Rufino", f"Close-up of {RUF} {YARD0}, {RL}, he takes one step closer, low and dangerous", ISM_B, "RIGHT", "low, slow, demanding",
     f"Close-up of {RUF} {YARD}, {RL}, low and demanding", "RIGHT")),
 ("c08", 6, S("c08", "Ismael", f"Close-up of {ISM} {YARD0}, {IR}, he leans in, enjoying it, a cruel half smile", RUF_B, "LEFT", "enjoying it, slow, insinuating",
     f"Close-up of {ISM} {YARD}, {IR}, a half smile", "LEFT")),
 ("c09", 6, talk("c09", "Ximena", two(f"{VAL} on the LEFT and {RUF} on the RIGHT {YARD0}, framed from the waist up; she speaks to her father in a low worried voice, slightly closer to the camera "
     f"and in sharper focus, he turns his head to her slowly") + " " + MOUTH("Ximena", "Rufino"), "worried, low, hesitant")),
 ("c10", 6, S("c10", "Rufino", f"Close-up of {RUF} {YARD0}, {RL}, he raises one hand to stop her, hurt and stern", VAL_B, "RIGHT", "stern, hurt, firm",
     f"Close-up of {RUF} {YARD}, {RL}, stern and hurt", "RIGHT")),
 ("c11", D8("c11"), S("c11", "Ismael", f"Close-up of {ISM} {YARD0}, {IR}, he tips his white hat, mocking, satisfied", RUF_B, "LEFT", "mocking, satisfied, slow",
     f"Close-up of {ISM} {YARD}, {IR}, mocking", "LEFT")),
 ("c12", 6, talk("c12", "Ximena", one(f"Close-up of {VAL} {YARD}, {VL}, she freezes, staring toward the horse stalls behind the rival, she slowly points with one finger", "RIGHT"), "shocked, whispering")),
 ("i01", 6, f"Close-up insert {YARD0}: inside a wooden horse stall, a black felt cowboy hat with a silver band and a brown hawk feather hangs alone on a nail; only the hat on the wooden wall, no hands, no people. No dialogue."),
 ("r2", 6, one(f"Medium shot of {RUF} {YARD}, standing by a wooden horse stall, he slowly takes a black felt cowboy hat with a silver band off a nail and holds it with both hands, staring at it, his eyes wet", "RIGHT", NODOUBLE("man in a straw cowboy hat")) + " Slow push-in. No dialogue."),
 ("c13", D8("c13"), talk("c13", "Rufino", one(f"Close-up of {RUF} {YARD}, standing by a wooden horse stall, holding a black felt cowboy hat with a silver band in both hands, his voice breaking, eyes wet", "RIGHT"), "broken, low, betrayed")),
 # CTA con carisma (después del BLACK): Rufino a cámara
 ("c14", 10, talk("c14", "Rufino", f"Close-up from the chest up of {RUF} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts bitter, makes a short pause, adjusts the brim of his straw hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small hard half smile. Nobody else around.",
     "charismatic, bitter, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("cruel", "proud"), ("mocking", "amused"), ("dangerous", "serious"), ("betrayed", "sad"), ("shocked", "surprised"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden afternoon light at the wooden horse corrals of a livestock fair in Chihuahua, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, ranch corrals and horse stalls in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{RUFINO_ALCANTARA}", "a tanned Mexican rancher in his sixties with a thick white mustache, a beige straw cowboy hat and a brown leather vest"),
         ("@{ISMAEL_QUINONES}", "a Mexican rancher in his fifties with a black goatee, a white felt cowboy hat and a burgundy western shirt"),
         ("@{XIMENA_ALCANTARA}", "a Mexican woman in her thirties with a long brown ponytail, a cream western shirt and a denim jacket"),
         (" @{LOC_FERIAPARRAL}", "")]
#@INCLUDE tail

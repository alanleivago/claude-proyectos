"""Genera los clips de cajeta-celaya PARTE 1 (La Cajeta de Celaya, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre-hijos-herencia transformada (ranking2): en Celaya, Leticia (45) le avisa a su padre don Rogaciano (74) que ella y su hermano ya vendieron la fábrica de cajeta y que se tiene que salir
"antes de que acabe el mes" a un cuarto atrás. Llega el comprador, el licenciado Mendoza (50): Rogaciano revela que la fábrica y la receta siguen a su nombre. Giro: los hijos ya se gastaron
el anticipo de una venta que no era suya.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (fábrica): Rogaciano a la IZQUIERDA junto a su cazo de cobre; Leticia y el licenciado Mendoza a la DERECHA (junto a la puerta al patio).
YARD0 = ("inside a small family cajeta factory beside a house in Celaya, Guanajuato @{LOC_FABRICACAJETA} in the afternoon: big copper cazos of bubbling caramel, wooden paddles, rows of small round wooden boxes, "
         "white tiled walls, an open door to a patio with a jacaranda tree, warm light; no readable text, no signs, no labels, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PADDLE = "a long wooden paddle"
ROG = ("@{ROGACIANO_LEON} (74-year-old Mexican man, small and thin, light-brown wrinkled skin, white hair combed to the side, a thin white mustache, a white collared shirt under a brown knitted button-front vest)")
LET = ("@{LETICIA_LEON} (45-year-old Mexican woman, light skin, short straight black bob haircut, red lipstick, a cream blazer over a black blouse, gold earrings)")
MEN = ("@{LIC_MENDOZA} (50-year-old Mexican man, light-brown skin, short grey hair, rectangular glasses, clean-shaven, a light-grey suit with a white shirt and a dark-blue tie)")
#@INCLUDE funcs1
# Bordes: Leticia o Mendoza le hablan a Rogaciano -> espalda de él LEFT; Rogaciano les habla -> espalda RIGHT. Mendoza le habla a Leticia: espalda de ella LEFT (ella queda a su izquierda).
ROG_B = "@{ROGACIANO_LEON} seen from behind (white hair combed to the side, brown knitted vest over a white shirt, small and thin)"
LET_B = "@{LETICIA_LEON} seen from behind (short straight black bob haircut, cream blazer)"
MEN_B = "@{LIC_MENDOZA} seen from behind (short grey hair, light-grey suit jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
RL = f"standing on the LEFT beside a big copper cazo of caramel, holding {PADDLE}"     # Rogaciano
LR = "standing on the RIGHT, holding a folder of papers"                                # Leticia
MR = "standing on the RIGHT in the open doorway to the patio, holding a black briefcase"   # Mendoza

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Leticia YA hablando con su carpeta; Rogaciano de espaldas (LEFT) moviendo la cajeta.
 ("c01", D8("c01"), S("c01", "Leticia", f"Medium close-up of {LET} {YARD0}, {LR}, her lips already moving and talking from the very first frame, mouth clearly opening on every word, cold and practical, she taps the folder", ROG_B, "LEFT", "cold, practical, bossy",
     f"Medium close-up of {LET} {YARD}, {LR}, talking from the very first frame, cold and practical", "LEFT")),
 ("c02", D8("c02"), S("c02", "Rogaciano", f"Close-up of {ROG} {YARD0}, {RL}, he stops stirring, hurt and stunned", LET_B, "RIGHT", "hurt, stunned, slow",
     f"Close-up of {ROG} {YARD}, {RL}, hurt and stunned", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Leticia", one(f"Close-up of {LET} {YARD}, {LR}, a cold polite smile", "LEFT"), "cold, polite, impatient")),
 ("r1", 6, f"Medium shot of {ROG} {YARD}, {RL}, in silence, he slowly lays the wooden paddle across the copper cazo and looks around the factory, his eyes shine, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a brown vest')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Rogaciano", f"Close-up of {ROG} {YARD0}, {RL}, sad and dignified", LET_B, "RIGHT", "sad, dignified",
     f"Close-up of {ROG} {YARD}, {RL}, sad and dignified", "RIGHT")),
 ("c05", 6, S("c05", "Leticia", f"Close-up of {LET} {YARD0}, {LR}, careless, she checks her watch", ROG_B, "LEFT", "careless, cold",
     f"Close-up of {LET} {YARD}, {LR}, careless", "LEFT")),
 ("c06", 6, talk("c06", "Rogaciano", one(f"Close-up of {ROG} {YARD}, {RL}, his eyes shine, a bitter small smile", "RIGHT"), "bitter, soft, slow")),
 ("i01", 6, f"Close-up insert {YARD0}: thick golden-brown caramel bubbling slowly in a big copper cazo, a wooden paddle resting across it; only the cazo and the caramel, no people. No dialogue."),
 ("r2", 6, f"Medium shot of {MEN} {YARD}, {MR}, already standing in place, he looks around the factory with a polite professional smile, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey suit')}. Slow push-in. No dialogue."),
 ("c07", 6, talk("c07", "Mendoza", one(f"Close-up of {MEN} {YARD}, {MR}, polite and professional", "LEFT"), "polite, professional")),
 ("c08", 6, S("c08", "Rogaciano", f"Close-up of {ROG} {YARD0}, {RL}, surprised, then calm, he studies the man", MEN_B, "RIGHT", "surprised, calm",
     f"Close-up of {ROG} {YARD}, {RL}, surprised, then calm", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Mendoza", f"Close-up of {MEN} {YARD0}, {MR}, polite, he adjusts his glasses", ROG_B, "LEFT", "polite, slightly confused",
     f"Close-up of {MEN} {YARD}, {MR}, polite", "LEFT")),
 ("c10", 6, talk("c10", "Rogaciano", one(f"Close-up of {ROG} {YARD}, {RL}, calm and firm", "RIGHT"), "calm, firm")),
 ("c11", D8("c11"), talk("c11", "Leticia", one(f"Close-up of {LET} {YARD}, {LR}, nervous, a forced smile", "LEFT"), "nervous, quick")),
 ("c12", D8("c12"), (talk("c12", "Rogaciano", two(f"{ROG} on the LEFT and {MEN} on the RIGHT, facing each other beside the copper cazo {YARD0}, framed from the waist up; "
     f"Rogaciano, calm and sure, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rogaciano", "Mendoza"), "calm, sure, slow"),
   talk("c12", "Rogaciano", one(f"Close-up of {ROG} {YARD}, {RL}, calm and sure", "RIGHT"), "calm, sure, slow"))),
 ("r3", 6, one(f"Close-up of {LET} {YARD}, {LR}, in silence, pale, she grips the folder tightly", "LEFT") + " Slow push-in. No dialogue."),
 ("c13", D8("c13"), S("c13", "Leticia", f"Close-up of {LET} {YARD0}, {LR}, shocked and angry", ROG_B, "LEFT", "shocked, upset",
     f"Close-up of {LET} {YARD}, {LR}, shocked", "LEFT")),
 ("c14", D8("c14"), S("c14", "Rogaciano", f"Close-up of {ROG} {YARD0}, {RL}, firm, a small sure smile", LET_B, "RIGHT", "firm, sure, slow",
     f"Close-up of {ROG} {YARD}, {RL}, firm, a small sure smile", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Mendoza", f"Close-up of {MEN} {YARD0}, {MR}, serious now, he turns to the daughter", LET_B, "LEFT", "serious, cold",
     f"Close-up of {MEN} {YARD}, {MR}, serious", "LEFT")),
 ("r4", 6, one(f"Close-up of {ROG} {YARD}, {RL}, in silence, stunned, he slowly turns his head to his daughter", "RIGHT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Rogaciano", one(f"Close-up of {ROG} {YARD}, {RL}, hurt and disappointed, his voice low", "RIGHT"), "hurt, low, disappointed")),
 # CTA con carisma (después del BLACK): Rogaciano solo, a cámara
 ("c17", 10, talk("c17", "Rogaciano", f"Close-up from the chest up of {ROG} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his thin mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small mischievous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Y el anticipo que les di, ¿dónde está?", "Y lo que les adelanté, ¿dónde está?"), ("¿Qué anticipo, Leticia?", "¿Qué adelanto, Leticia?"),
        ("¿Ya se gastaron un dinero que no era suyo?", "¿Ya se gastaron algo que no era suyo?"), ("Con lo de la venta nos repartimos todo.", "Y nosotros nos encargamos de todo."),
        ("shocked and angry", "surprised"), ("shocked", "surprised"), ("stunned", "surprised"), ("bitter", "sad"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light inside a small family cajeta factory with copper pots in Celaya, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic Mexican candy workshop with big copper pots of caramel, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROGACIANO_LEON}", "a small thin elderly Mexican man with white combed hair, a thin white mustache and a brown knitted vest"),
         ("@{LETICIA_LEON}", "a Mexican woman in her forties with a short black bob, red lipstick and a cream blazer"),
         ("@{LIC_MENDOZA}", "a Mexican businessman around fifty with grey hair, rectangular glasses and a light-grey suit"),
         (" @{LOC_FABRICACAJETA}", "")]
#@INCLUDE tail

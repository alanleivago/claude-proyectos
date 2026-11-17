"""Genera los clips de gloria-linares PARTE 1 (La Gloria de Linares, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Padre-hijos-herencia transformada (ranking2, saga Evaristo): en Linares, Nuevo León, la nuera Fabiola (38) le hace la maleta a don Abundio (72), el que levantó casa y fábrica de glorias,
para que no lo vea la compradora de Monterrey; su hijo Mauricio (40) la deja. Llega Consuelo (62), la compradora: solo compra las glorias de don Abundio; sin él no hay trato.
Giro: Fabiola le quiso vender a escondidas la libreta de recetas... y Abundio revela que la libreta está en blanco.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (frente de la casa, Linares): de izquierda a derecha Consuelo (llega por el portón, luego al pie de la escalinata), Abundio (al pie de la escalinata con su maleta),
# Mauricio y Fabiola (arriba, en el porche).
YARD0 = ("in front of a large two-story family house in Linares, Nuevo León @{LOC_CASALINARES} in the hot afternoon: wide stone steps up to a covered front porch, a big wooden door, "
         "orange trees in the yard, a small brick candy workshop beside the house, bright sun; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CASE = "an old brown leather suitcase"
ABU = ("@{ABUNDIO_TREVINO} (72-year-old Mexican man, thin, light skin, white hair combed back, a neat white mustache, a blue-and-white checkered western shirt with pearl snaps, "
       "grey trousers, brown boots)")
MAU = ("@{MAURICIO_TREVINO} (40-year-old Mexican man, slightly overweight, light skin, short dark hair, clean-shaven round face, a navy-blue polo shirt, khaki trousers)")
FAB = ("@{FABIOLA_GARZA} (38-year-old Mexican woman, light skin, long straight bleached-blonde hair, heavy makeup, a white sleeveless dress, large sunglasses on her head, "
       "many gold bracelets)")
CON = ("@{CONSUELO_VILLARREAL} (62-year-old elegant Mexican businesswoman, light skin, a short silver bob haircut, pearl earrings, a cream-colored pantsuit)")
#@INCLUDE funcs1
# Bordes: orden fijo C - A | M - F. Mauricio o Fabiola le hablan a Abundio/Consuelo -> espalda LEFT; Abundio o Consuelo le hablan a Mauricio/Fabiola -> espalda RIGHT;
# Fabiola le habla a Mauricio -> espalda de él LEFT.
ABU_B = "@{ABUNDIO_TREVINO} seen from behind (white hair combed back, blue-and-white checkered western shirt, thin)"
MAU_B = "@{MAURICIO_TREVINO} seen from behind (short dark hair, navy-blue polo shirt, slightly overweight)"
FAB_B = "@{FABIOLA_GARZA} seen from behind (long straight bleached-blonde hair, white sleeveless dress)"
CON_B = "@{CONSUELO_VILLARREAL} seen from behind (short silver bob haircut, cream-colored jacket)"
#@INCLUDE funcs2
#@INCLUDE d8
AL = f"standing on the LEFT at the bottom of the stone steps, {CASE} at his feet"            # Abundio
CL = "standing on the LEFT at the bottom of the stone steps"                                 # Consuelo
MR = "standing on the RIGHT at the top of the stone steps, on the porch"                     # Mauricio
FR = "standing on the RIGHT at the top of the stone steps, on the porch, holding a glass of orange juice"  # Fabiola

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Fabiola YA hablando arriba de la escalinata; Abundio de espaldas (LEFT) abajo con la maleta. Plazo: antes de que llegue la compradora.
 ("c01", D8("c01"), S("c01", "Fabiola", f"Medium close-up of {FAB} {YARD0}, {FR}, talking from the very first frame, smug, looking down at the old man below", ABU_B, "LEFT", "smug, bossy, cold",
     f"Medium close-up of {FAB} {YARD}, {FR}, talking from the very first frame, smug, looking down", "LEFT")),
 ("c02", D8("c02"), S("c02", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, dignified, he looks up at her", FAB_B, "RIGHT", "dignified, hurt, firm",
     f"Close-up of {ABU} {YARD}, {AL}, dignified, he looks up", "RIGHT")),
 ("c03", D8("c03"), talk("c03", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, she sips the juice and smiles coldly", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {MAU} {YARD}, he steps out of the big wooden door onto the porch and stops, uncomfortable, he rubs the back of his neck, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy polo shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Abundio", f"Close-up of {ABU} {YARD0}, {AL}, his eyes shine, he looks up at his son", MAU_B, "RIGHT", "hurt, soft, sad",
     f"Close-up of {ABU} {YARD}, {AL}, his eyes shine", "RIGHT")),
 ("c05", D8("c05"), S("c05", "Mauricio", f"Close-up of {MAU} {YARD0}, {MR}, he avoids his father's eyes, uncomfortable", ABU_B, "LEFT", "uncomfortable, quick, embarrassed",
     f"Close-up of {MAU} {YARD}, {MR}, he avoids looking down", "LEFT")),
 ("c06", 6, talk("c06", "Abundio", one(f"Close-up of {ABU} {YARD}, {AL}, quiet, his eyes shine, a sad smile", "RIGHT"), "quiet, sad, slow")),
 ("c07", 6, talk("c07", "Mauricio", one(f"Close-up of {MAU} {YARD}, {MR}, impatient, he waves toward the street", "LEFT"), "impatient, uncomfortable")),
 ("i01", 6, f"Close-up insert {YARD0}: a small wooden box full of round milk candies wrapped in red cellophane resting on a stone step next to {CASE}; only the box and the suitcase, no people. No dialogue."),
 ("r2", 6, f"Medium shot of {ABU} {YARD}, {AL}, he slowly bends down, picks up {CASE} by the handle and straightens up with dignity, "
           f"{SOLO}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("i02", 6, "Wide shot of a white SUV arriving slowly and stopping at an iron gate in front of a large house with orange trees in Linares, Nuevo León, bright afternoon sun; no people visible, no readable text, no logos, no license plate text. No dialogue."),
 ("r3", 6, f"Medium shot of {CON} {YARD}, standing at the iron gate, already in place, a white SUV parked behind her, she slowly takes off dark sunglasses, elegant and serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a cream pantsuit')}. Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Consuelo", one(f"Close-up of {CON} {YARD}, {CL}, polite and serious, she looks up at the porch", "RIGHT"), "polite, serious, calm")),
 ("c09", 6, S("c09", "Mauricio", f"Close-up of {MAU} {YARD0}, {MR}, a big eager smile, he comes down one step", CON_B, "LEFT", "eager, friendly, quick",
     f"Close-up of {MAU} {YARD}, {MR}, a big eager smile", "LEFT")),
 ("c10", 6, (talk("c10", "Consuelo", two(f"{CON} on the LEFT and {ABU} on the RIGHT holding {CASE}, in profile facing each other at the bottom of the stone steps {YARD0}, "
     f"framed from the waist up; Consuelo, surprised and warm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Consuelo", "Abundio"), "surprised, warm"),
   talk("c10", "Consuelo", one(f"Close-up of {CON} {YARD}, {CL}, surprised and warm", "RIGHT"), "surprised, warm"))),
 ("c11", 6, talk("c11", "Abundio", one(f"Close-up of {ABU} {YARD}, holding {CASE}, humble, a tired smile", "LEFT"), "humble, tired, soft")),
 ("c12", D8("c12"), S("c12", "Consuelo", f"Close-up of {CON} {YARD0}, {CL}, cold and serious, she looks up at the son", MAU_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {CON} {YARD}, {CL}, cold and serious", "RIGHT")),
 ("c13", D8("c13"), S("c13", "Fabiola", f"Close-up of {FAB} {YARD0}, {FR}, a forced polite smile", CON_B, "LEFT", "fake polite, quick",
     f"Close-up of {FAB} {YARD}, {FR}, a forced polite smile", "LEFT")),
 ("c14", 6, S("c14", "Consuelo", f"Close-up of {CON} {YARD0}, {CL}, unimpressed, she shakes her head slowly", FAB_B, "RIGHT", "dry, cold",
     f"Close-up of {CON} {YARD}, {CL}, unimpressed", "RIGHT")),
 ("c15", D8("c15"), talk("c15", "Abundio", one(f"Close-up of {ABU} {YARD}, holding {CASE}, calm and wise, a small knowing smile", "RIGHT"), "calm, wise, slow")),
 ("c16", 6, (talk("c16", "Consuelo", f"Medium wide group shot {YARD0}: {CON} and {ABU} standing at the bottom of the stone steps on the LEFT, {MAU} and {FAB} on the porch at the top on the RIGHT; "
     f"Consuelo, firm, speaks looking up at the couple, closest to the camera and in sharp focus; only these four people, no extras. Only Consuelo speaks: her lips move clearly; the other three stay silent with mouths closed.", "firm, final, calm"),
   talk("c16", "Consuelo", one(f"Close-up of {CON} {YARD}, {CL}, firm and final", "RIGHT"), "firm, final, calm"))),
 ("c17", D8("c17"), S("c17", "Mauricio", f"Close-up of {MAU} {YARD0}, {MR}, ashamed, he comes down the steps reaching out a hand", ABU_B, "LEFT", "ashamed, pleading, quick",
     f"Close-up of {MAU} {YARD}, {MR}, ashamed", "LEFT")),
 ("c18", D8("c18"), S("c18", "Abundio", f"Close-up of {ABU} {YARD0}, holding {CASE}, dignified and calm, his eyes shine", MAU_B, "RIGHT", "dignified, calm, hurt",
     f"Close-up of {ABU} {YARD}, holding {CASE}, dignified, his eyes shine", "RIGHT")),
 ("c19", 6, talk("c19", "Fabiola", one(f"Close-up of {FAB} {YARD}, {FR}, she rolls her eyes and mutters to herself", "LEFT"), "annoyed, low, mocking")),
 ("c20", D8("c20"), S("c20", "Consuelo", f"Close-up of {CON} {YARD0}, {CL}, she raises one eyebrow, calm and sharp", FAB_B, "RIGHT", "calm, sharp, slow",
     f"Close-up of {CON} {YARD}, {CL}, she raises one eyebrow", "RIGHT")),
 ("r4", 6, one(f"Close-up of {MAU} {YARD}, standing on the porch, in silence, he slowly turns his head to his wife, stunned, his mouth half open", "RIGHT") + " Slow push-in. No dialogue."),
 ("c21", 6, (talk("c21", "Mauricio", two(f"{MAU} on the LEFT and {FAB} on the RIGHT, in profile facing each other on the porch {YARD0}, framed from the waist up; "
     f"Mauricio, shocked and hurt, slightly closer to the camera and in sharper focus") + " " + MOUTH("Mauricio", "Fabiola"), "shocked, hurt"),
   talk("c21", "Mauricio", one(f"Close-up of {MAU} {YARD}, standing on the porch, shocked and hurt", "RIGHT"), "shocked, hurt"))),
 ("c22", 6, S("c22", "Fabiola", f"Close-up of {FAB} {YARD0}, standing on the RIGHT on the porch, cold, she shrugs", MAU_B, "LEFT", "cold, careless",
     f"Close-up of {FAB} {YARD}, standing on the RIGHT on the porch, cold, she shrugs", "LEFT")),
 ("c23", D8("c23"), talk("c23", "Abundio", one(f"Close-up of {ABU} {YARD}, holding {CASE}, calm, a small satisfied smile", "RIGHT"), "calm, satisfied, slow")),
 # CTA con carisma (después del BLACK): Abundio solo, a cámara
 ("c24", 10, talk("c24", "Abundio", f"Close-up from the chest up of {ABU} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his white mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small mischievous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Tu papá ya no va a durar mucho.", "Tu papá ya está muy grande."), ("huele a viejo", "huele a polvo"),
        ("Lo que pesa es lo que me hiciste.", "Lo que pesa es otra cosa."), ("stunned", "surprised"), ("shocked and hurt", "surprised"),
        ("fake polite", "polite"), ("mutters to herself", "speaks low"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, bright afternoon sun in front of a large family house with stone steps in Nuevo León, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, front porch and stone steps of a family house with orange trees in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ABUNDIO_TREVINO}", "a thin elderly Mexican man with white combed-back hair, a white mustache and a blue-and-white checkered western shirt"),
         ("@{MAURICIO_TREVINO}", "a slightly overweight Mexican man in his forties with short dark hair and a navy-blue polo shirt"),
         ("@{FABIOLA_GARZA}", "a Mexican woman in her thirties with long bleached-blonde hair, heavy makeup and a white sleeveless dress"),
         ("@{CONSUELO_VILLARREAL}", "an elegant Mexican woman in her sixties with a short silver bob and a cream-colored pantsuit"),
         (" @{LOC_CASALINARES}", "")]
#@INCLUDE tail

"""Genera los clips de vainilla-papantla PARTE 1 (La Vainilla de Papantla, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado del modelo de Atrium "Veinte años a su lado… y lo vendieron" (fuentes/atrium-vista/videos/7704056500502793502_analisis.md), sin copiarlo:
en un beneficio de vainilla de Papantla, Veracruz, llegan las camionetas de Fermín (62), rival de Tuxpan; el patrón Severiano (66) acusa a su hombre de confianza Chava (42).
Fermín da plazo "antes de que se seque la vainilla". Giro: la que le abrió la puerta fue su esposa Inés (58), y su hija Ximena es hija de Fermín. Sin federales, sin armas, sin dinero.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (beneficio de vainilla): Severiano SIEMPRE a la IZQUIERDA (junto a su mesa de vainas); Chava, Inés y Fermín a la DERECHA (Fermín en el patio de tierra, junto a su camioneta).
YARD0 = ("in an open-sided vanilla curing house in Papantla, Veracruz @{LOC_BENEFICIO} in the humid golden afternoon: long wooden tables with dark-brown vanilla pods drying on woven palm mats, "
         "a red tiled roof on thick wooden posts, a dirt yard and lush green tropical plants beyond; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PODS = "a bundle of dark vanilla pods"
SEV = ("@{SEVERIANO_OLARTE} (66-year-old Mexican man, heavy-set, dark-brown skin, short white hair, a thick white mustache, a white long-sleeve linen shirt, a dark-brown leather vest)")
CHA = ("@{CHAVA_ROSAS} (42-year-old Mexican man, strong, brown skin, curly black hair, a short black beard, a light-grey work shirt with rolled-up sleeves, a red bandana around his neck)")
INE = ("@{INES_OLARTE} (58-year-old Mexican woman, brown skin, grey hair in a braided crown, gold earrings, a white embroidered blouse with a white lace cape over the shoulders)")
FER = ("@{FERMIN_ALDANA} (62-year-old Mexican man, tall and thin, light skin, dyed black slicked-back hair, a thin black mustache, a black western shirt with silver embroidery, "
       "a white straw cowboy hat)")
#@INCLUDE funcs1
# Bordes: Severiano habla -> espalda del otro RIGHT; los demás le hablan a Severiano -> espalda de él LEFT.
SEV_B = "@{SEVERIANO_OLARTE} seen from behind (short white hair, dark-brown leather vest over a white linen shirt, heavy-set)"
CHA_B = "@{CHAVA_ROSAS} seen from behind (curly black hair, light-grey work shirt, a red bandana knot at the back of the neck)"
INE_B = "@{INES_OLARTE} seen from behind (grey hair in a braided crown, white lace cape over the shoulders)"
FER_B = "@{FERMIN_ALDANA} seen from behind (white straw cowboy hat, black western shirt, tall and thin)"
#@INCLUDE funcs2
#@INCLUDE d8
SL = "standing on the LEFT beside a long wooden table of drying vanilla pods"     # Severiano
CR = "standing on the RIGHT under the tiled roof"                                 # Chava
IR = "standing on the RIGHT in the doorway to the house"                          # Inés
FR = "standing on the RIGHT in the dirt yard, a dark pickup truck behind him"     # Fermín

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Chava YA hablando, recién llegado y agitado; Severiano de espaldas (LEFT) en su mesa de vainas.
 ("c01", 6, S("c01", "Chava", f"Medium close-up of {CHA} {YARD0}, {CR}, talking from the very first frame, out of breath and urgent, he has just arrived", SEV_B, "LEFT", "urgent, worried, quick",
     f"Medium close-up of {CHA} {YARD}, {CR}, talking from the very first frame, urgent", "LEFT")),
 ("c02", D8("c02"), S("c02", "Severiano", f"Close-up of {SEV} {YARD0}, {SL}, holding {PODS}, he looks up slowly, serious", CHA_B, "RIGHT", "serious, suspicious, low",
     f"Close-up of {SEV} {YARD}, {SL}, holding {PODS}, serious", "RIGHT")),
 ("i01", 6, "Wide shot of three dark pickup trucks driving slowly in a line along a muddy dirt road through lush green tropical vegetation and banana plants in Veracruz, golden afternoon light; no people visible, no readable text, no logos. No dialogue."),
 ("c03", D8("c03"), talk("c03", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, he puts the pods down, cold and suspicious", "RIGHT"), "cold, suspicious, slow")),
 ("c04", D8("c04"), S("c04", "Chava", f"Close-up of {CHA} {YARD0}, {CR}, hurt, one hand on his chest", SEV_B, "LEFT", "hurt, sincere, firm",
     f"Close-up of {CHA} {YARD}, {CR}, hurt, one hand on his chest", "LEFT")),
 ("c05", D8("c05"), S("c05", "Severiano", f"Close-up of {SEV} {YARD0}, {SL}, he steps closer, his voice low and hard", CHA_B, "RIGHT", "low, hard, serious",
     f"Close-up of {SEV} {YARD}, {SL}, his voice low and hard", "RIGHT")),
 ("r1", 6, f"Medium shot of {INE} {YARD}, {IR}, already in place, she stops in the doorway, worried, one hand on the door frame, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman with a white lace cape')}. Slow push-in. No dialogue."),
 ("c06", 6, talk("c06", "Inés", one(f"Close-up of {INE} {YARD}, {IR}, worried", "LEFT"), "worried, soft, quick")),
 ("c07", 6, talk("c07", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, firm, without looking away", "RIGHT"), "firm, cold")),
 ("r2", 6, f"Medium shot of {FER} {YARD}, {FR}, already standing in place, he slowly takes off dark sunglasses and smiles, calm and confident, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a white cowboy hat')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Fermín", f"Close-up of {FER} {YARD0}, {FR}, a confident smile, he touches the brim of his hat", SEV_B, "LEFT", "confident, ironic, calm",
     f"Close-up of {FER} {YARD}, {FR}, a confident smile", "LEFT")),
 ("c09", 6, S("c09", "Severiano", f"Close-up of {SEV} {YARD0}, standing on the LEFT at the edge of the curing house, cold and firm", FER_B, "RIGHT", "cold, firm",
     f"Close-up of {SEV} {YARD}, standing on the LEFT at the edge of the curing house, cold and firm", "RIGHT")),
 ("c10", D8("c10"), talk("c10", "Fermín", one(f"Close-up of {FER} {YARD}, {FR}, calm and sure, he gestures toward the drying pods", "LEFT"), "calm, sure, slow")),
 ("c11", 6, talk("c11", "Chava", one(f"Close-up of {CHA} {YARD}, {CR}, he steps forward, protective and firm", "RIGHT"), "protective, firm")),
 ("c12", 6, talk("c12", "Fermín", one(f"Close-up of {FER} {YARD}, {FR}, he laughs once, amused", "LEFT"), "amused, mocking")),
 ("r3", 6, one(f"Close-up of {SEV} {YARD}, {SL}, in silence, he turns his eyes to his loyal man, a flash of regret on his face", "RIGHT") + " Slow push-in. No dialogue."),
 ("c13", 6, S("c13", "Fermín", f"Close-up of {FER} {YARD0}, {FR}, he lowers his voice, enjoying the moment", SEV_B, "LEFT", "sly, low, slow",
     f"Close-up of {FER} {YARD}, {FR}, he lowers his voice", "LEFT")),
 ("c14", D8("c14"), talk("c14", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, surprised, thinking fast", "RIGHT"), "surprised, low")),
 ("r4", 6, one(f"Close-up of {INE} {YARD}, {IR}, in silence, she slowly lowers her eyes and presses her lips together", "LEFT") + " Slow push-in. No dialogue."),
 ("c15", 6, (talk("c15", "Severiano", two(f"{SEV} on the LEFT and {CHA} on the RIGHT, in profile facing each other under the tiled roof {YARD0}, framed from the waist up; "
     f"Severiano puts one hand on Chava's shoulder, sincere, slightly closer to the camera and in sharper focus") + " " + MOUTH("Severiano", "Chava"), "sincere, low, humble"),
   talk("c15", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, sincere and humble", "RIGHT"), "sincere, low, humble"))),
 ("c16", 6, S("c16", "Chava", f"Close-up of {CHA} {YARD0}, {CR}, a short nod, serious", SEV_B, "LEFT", "serious, loyal",
     f"Close-up of {CHA} {YARD}, {CR}, a short nod", "LEFT")),
 ("c17", 6, S("c17", "Severiano", f"Close-up of {SEV} {YARD0}, {SL}, he turns to his wife, his voice breaking", INE_B, "RIGHT", "hurt, low, slow",
     f"Close-up of {SEV} {YARD}, {SL}, his voice breaking", "RIGHT")),
 ("c18", D8("c18"), S("c18", "Inés", f"Close-up of {INE} {YARD0}, {IR}, her eyes shine, defiant, she raises her chin", SEV_B, "LEFT", "defiant, tired, firm",
     f"Close-up of {INE} {YARD}, {IR}, her eyes shine, defiant", "LEFT")),
 ("c19", 6, talk("c19", "Severiano", one(f"Close-up of {SEV} {YARD}, {SL}, broken, his eyes shine", "RIGHT"), "broken, low")),
 ("c20", 6, talk("c20", "Inés", one(f"Close-up of {INE} {YARD}, {IR}, cold and calm, a tear on her cheek", "LEFT"), "cold, calm, slow")),
 ("c21", 6, (talk("c21", "Fermín", f"Medium wide group shot {YARD0}: {SEV} on the LEFT under the tiled roof, {CHA} and {INE} in the middle, {FER} on the RIGHT in the dirt yard; "
     f"Fermín, with a victorious smile, speaks, closest to the camera and in sharp focus; only these four people, no extras. Only Fermín speaks: his lips move clearly; the other three stay silent with mouths closed.", "victorious, calm"),
   talk("c21", "Fermín", one(f"Close-up of {FER} {YARD}, {FR}, a victorious smile", "LEFT"), "victorious, calm"))),
 ("r5", 6, one(f"Close-up of {SEV} {YARD}, {SL}, in silence, stunned, his face pale, he slowly closes his eyes", "RIGHT") + " Slow push-in. No dialogue."),
 ("c22", 6, talk("c22", "Chava", one(f"Close-up of {CHA} {YARD}, {CR}, loyal and firm, looking at his patron", "LEFT"), "loyal, firm, low")),
 # CTA con carisma (después del BLACK): Severiano solo, a cámara
 ("c23", 10, talk("c23", "Severiano", f"Close-up from the chest up of {SEV} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, smooths his white mustache, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small bitter half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Porque si me mientes, aquí se acaba todo entre tú y yo.", "Porque si me mientes, ya no hay nada entre tú y yo."),
        ("Primero tendría que pasar por mí, don Fermín.", "Primero hable conmigo, don Fermín."), ("Si él ya te tiene por traidor.", "Si él ya ni te cree."),
        ("Y tu gente se viene conmigo.", "Y tu gente trabaja para mí."), ("his voice low and hard", "his voice low"), ("enjoying the moment", "calm"),
        ("stunned", "surprised"), ("his face pale", "quiet"), ("victorious", "confident"), ("defiant", "firm"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, humid golden afternoon in a vanilla curing house in Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic open-sided curing house with drying vanilla pods in tropical Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEVERIANO_OLARTE}", "a heavy-set elderly Mexican man with short white hair, a thick white mustache, a white linen shirt and a brown leather vest"),
         ("@{CHAVA_ROSAS}", "a strong Mexican man in his forties with curly black hair, a short beard, a grey work shirt and a red bandana"),
         ("@{INES_OLARTE}", "a Mexican woman in her late fifties with grey braided hair and a white embroidered blouse with a lace cape"),
         ("@{FERMIN_ALDANA}", "a tall thin Mexican man in his sixties with a thin mustache, a black embroidered western shirt and a white straw cowboy hat"),
         (" @{LOC_BENEFICIO}", "")]
#@INCLUDE tail

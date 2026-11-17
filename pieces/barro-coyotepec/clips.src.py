"""Genera los clips de barro-coyotepec PARTE 1 (El Barro de Coyotepec, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado, sin niños (humillación + plazo -> la llamada que el villano no cree -> llega el poderoso agradecido -> plazo invertido -> giro familiar): en San Bartolo Coyotepec, Oaxaca,
el licenciado Efrén (36) quiere quitarle el taller de barro negro a doña Fidela (72), le rompe un cántaro de la mayordomía y le da plazo "antes de que empiece la Guelaguetza"; su sobrino
Rogelio (30) la defiende. Fidela llama a don Matías (58), su antiguo aprendiz, hoy jefe de Efrén. Plazo invertido. Giro: el que le quemó el taller hace treinta años fue el padre de Matías.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio del taller): Fidela y Rogelio a la IZQUIERDA (repisas y horno); Efrén y Matías a la DERECHA (del lado del portón).
YARD0 = ("in the patio of a family black clay pottery workshop in San Bartolo Coyotepec, Oaxaca @{LOC_TALLERBARRO} in the afternoon: shelves full of shiny black clay pots and jars, "
         "an underground brick kiln with smoke, adobe walls, agave plants, a low gate to a dirt road, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
JAR = "a large shiny black clay jar"
PHONE = "an old small flip phone"
FID = ("@{FIDELA_PEDRO} (72-year-old Zapotec Mexican woman, small, dark-brown wrinkled skin, grey hair in two braids with dark ribbons, a dark-blue embroidered huipil, a grey rebozo)")
ROG = ("@{ROGELIO_PEDRO} (30-year-old Zapotec Mexican man, brown skin, short black hair, light stubble, a plain grey t-shirt, a clay-stained canvas apron)")
EFR = ("@{EFREN_MATUS} (36-year-old Mexican man, light-brown skin, gelled black hair, rectangular glasses, a thin mustache, a light-blue dress shirt with a dark tie, holding a black folder)")
MAT = ("@{MATIAS_LUIS} (58-year-old tall Mexican man, brown skin, short grey hair, a neat grey beard, a cream guayabera, a gold watch)")
#@INCLUDE funcs1
# Bordes: Efrén o Matías le hablan a Fidela/Rogelio -> espalda LEFT; Fidela o Rogelio les hablan -> espalda RIGHT.
FID_B = "@{FIDELA_PEDRO} seen from behind (grey hair in two braids with dark ribbons, grey rebozo over a dark-blue huipil, small)"
ROG_B = "@{ROGELIO_PEDRO} seen from behind (short black hair, grey t-shirt, apron strings)"
EFR_B = "@{EFREN_MATUS} seen from behind (gelled black hair, light-blue dress shirt)"
MAT_B = "@{MATIAS_LUIS} seen from behind (short grey hair, cream guayabera, tall)"
#@INCLUDE funcs2
#@INCLUDE d8
FL = f"standing on the LEFT beside shelves of black clay pots"            # Fidela
RL = "standing on the LEFT near the brick kiln"                            # Rogelio
ER = "standing on the RIGHT just inside the low gate of the patio"         # Efrén
MR = "standing on the RIGHT at the low gate of the patio"                  # Matías

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Efrén YA hablando con su carpeta; Fidela de espaldas (LEFT) junto a sus repisas.
 ("c01", D8("c01"), S("c01", "Efrén", f"Medium close-up of {EFR} {YARD0}, {ER}, talking from the very first frame, arrogant and cold, he taps his folder", FID_B, "LEFT", "arrogant, cold, bossy",
     f"Medium close-up of {EFR} {YARD}, {ER}, talking from the very first frame, arrogant and cold", "LEFT")),
 ("c02", D8("c02"), S("c02", "Fidela", f"Close-up of {FID} {YARD0}, {FL}, calm and proud, clay on her hands", EFR_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {FID} {YARD}, {FL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Efrén", one(f"Close-up of {EFR} {YARD}, {ER}, a mocking smile, he adjusts his glasses", "LEFT"), "mocking, cold")),
 ("r1", 6, f"Medium shot of {ROG} {YARD}, {RL}, already in place, he puts down a clay jar and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a grey t-shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Rogelio", f"Close-up of {ROG} {YARD0}, {RL}, firm and protective", EFR_B, "RIGHT", "firm, protective",
     f"Close-up of {ROG} {YARD}, {RL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Efrén", f"Close-up of {EFR} {YARD0}, {ER}, dismissive, he waves him off", ROG_B, "LEFT", "dismissive, cold",
     f"Close-up of {EFR} {YARD}, {ER}, dismissive", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: the corner of a black folder knocks {JAR} off a low wooden shelf and it lands on the dirt floor in pieces; only the folder, the shelf and the clay, no face. No dialogue."),
 ("c06", 6, S("c06", "Fidela", f"Close-up of {FID} {YARD0}, {FL}, her eyes shine, she looks down at the broken clay, dignified", EFR_B, "RIGHT", "hurt, dignified",
     f"Close-up of {FID} {YARD}, {FL}, her eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Efrén", one(f"Close-up of {EFR} {YARD}, {ER}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("r2", 6, f"Medium shot of {FID} {YARD}, she slowly kneels and gathers the black clay pieces into her rebozo, dignified, "
           f"{SOLO}; {ALONE}; {NODOUBLE('elderly woman in a huipil')}. Slow push-in. No dialogue."),
 ("c08", 6, (talk("c08", "Fidela", two(f"{FID} on the LEFT holding broken clay in her rebozo and {ROG} on the RIGHT, close together near the kiln {YARD0}, framed from the waist up; "
     f"Fidela speaks calmly to her nephew, slightly closer to the camera and in sharper focus") + " " + MOUTH("Fidela", "Rogelio"), "calm, firm, low"),
   talk("c08", "Fidela", one(f"Close-up of {FID} {YARD}, {FL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Efrén", one(f"Close-up of {EFR} {YARD}, {ER}, laughing, amused", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two dark SUVs arriving slowly on a dirt road between adobe houses and agave plants in San Bartolo Coyotepec, Oaxaca, warm afternoon light, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {MAT} {YARD}, {MR}, already standing in place, he slowly takes off dark sunglasses, calm and powerful, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a cream guayabera')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Matías", f"Close-up of {MAT} {YARD0}, {MR}, warm and respectful, he bows his head slightly", FID_B, "LEFT", "warm, respectful",
     f"Close-up of {MAT} {YARD}, {MR}, warm and respectful", "LEFT")),
 ("c11", 6, talk("c11", "Efrén", one(f"Close-up of {EFR} {YARD}, {ER}, he turns around, his smile gone, pale", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Matías", one(f"Close-up of {MAT} {YARD}, {MR}, serious, he looks at Efrén", "RIGHT"), "serious, firm, slow")),
 ("c13", D8("c13"), talk("c13", "Matías", one(f"Close-up of {MAT} {YARD}, {MR}, he points at the broken clay, cold and final", "RIGHT"), "cold, final, slow")),
 ("r4", 6, f"Medium shot of {EFR} {YARD}, kneeling on the dirt floor in his shirt and tie, he picks up pieces of black clay one by one, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a light-blue shirt')}. No dialogue."),
 ("c14", 6, S("c14", "Fidela", f"Close-up of {FID} {YARD0}, {FL}, moved, a small smile", MAT_B, "RIGHT", "moved, warm",
     f"Close-up of {FID} {YARD}, {FL}, moved", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Matías", f"Close-up of {MAT} {YARD0}, {MR}, serious, his eyes shine, guilty", FID_B, "LEFT", "serious, low, guilty",
     f"Close-up of {MAT} {YARD}, {MR}, serious, his eyes shine", "LEFT")),
 ("c16", 6, talk("c16", "Fidela", one(f"Close-up of {FID} {YARD}, {FL}, worried, she holds her rebozo", "RIGHT"), "worried, soft")),
 ("c17", 6, (talk("c17", "Matías", two(f"{FID} on the LEFT and {MAT} on the RIGHT, facing each other in the patio {YARD0}, framed from the waist up; "
     f"Matías speaks low, ashamed, slightly closer to the camera and in sharper focus") + " " + MOUTH("Matías", "Fidela"), "low, ashamed, slow"),
   talk("c17", "Matías", one(f"Close-up of {MAT} {YARD}, {MR}, low and ashamed", "LEFT"), "low, ashamed, slow"))),
 # CTA con carisma (después del BLACK): Fidela sola, a cámara
 ("c18", 10, talk("c18", "Fidela", f"Close-up from the chest up of {FID} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, adjusts her rebozo on her shoulders, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small wise half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("El hombre que le incendió el taller hace treinta años.", "El hombre que le destruyó el taller hace treinta años."),
        ("¿Ustedes perdonarían al hijo de quien les quemó todo?", "¿Ustedes perdonarían al hijo de quien les quitó todo?"), ("Al cabo tierra le sobra.", "Usted sabe cómo."),
        ("knocks", "moves"), ("lands on the dirt floor in pieces", "rests on the dirt floor"), ("broken", "fallen"), ("humiliated", "quiet"), ("powerful", "serious"), ("guilty", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm afternoon light in the patio of a black clay pottery workshop in Oaxaca, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic pottery patio with shiny black clay jars in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FIDELA_PEDRO}", "a small elderly indigenous Mexican woman with grey braids, a dark-blue embroidered huipil and a grey rebozo"),
         ("@{ROGELIO_PEDRO}", "a Mexican man around thirty with short black hair, a grey t-shirt and a clay-stained apron"),
         ("@{EFREN_MATUS}", "a Mexican man in his thirties with gelled hair, rectangular glasses, a light-blue shirt and a dark tie"),
         ("@{MATIAS_LUIS}", "a tall Mexican man in his late fifties with a neat grey beard and a cream guayabera"),
         (" @{LOC_TALLERBARRO}", "")]
#@INCLUDE tail

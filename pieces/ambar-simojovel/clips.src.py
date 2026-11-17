"""Genera los clips de ambar-simojovel PARTE 1 (El Ámbar de Simojovel, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra-justicia transformada (ranking2): en un taller de ámbar de Simojovel, Chiapas, Rosaura (45) tiene a su hijastra Itzel (24) puliendo sola desde las cinco mientras
ella está en la hamaca; Fidencio (55) regresa antes de la feria, descubre que vendió el ámbar de la libélula de su difunta Amalia y la corre "antes de que se meta el sol".
Giro: la compradora fue Amalia, que está viva en Comitán, y Fidencio siempre lo supo.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (taller de ámbar, Simojovel): de izquierda a derecha Itzel (sentada en su banquito en la mesa de pulir), Fidencio (de pie junto a la mesa, entra por la puerta),
# Rosaura (en la hamaca del corredor; desde c05 de pie junto a la hamaca).
YARD0 = ("inside a rustic amber workshop in a wooden house in Simojovel, Chiapas @{LOC_TALLERAMBAR} during the day: a long wooden workbench with a small polishing wheel, "
         "trays of golden-orange amber pieces, a woven hammock on the porch side, an open door to green misty hills, warm window light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
AMBER = "a small piece of golden amber"
PHONE = "a smartphone"
ITZ = ("@{ITZEL_GORDILLO} (24-year-old Mexican woman from Chiapas, warm brown skin, a long single black braid over one shoulder, a white cotton blouse with small red and green "
       "embroidered flowers on the neckline, a plain dark-blue skirt)")
FID = ("@{FIDENCIO_GORDILLO} (55-year-old Mexican man, stocky, brown skin, short grey hair, a thick grey mustache, a grey palm-straw hat, a plain olive-green cotton shirt "
       "with rolled-up sleeves, dark jeans, a woven wool shoulder bag)")
ROS = ("@{ROSAURA_PENAGOS} (45-year-old Mexican woman, light tan skin, shoulder-length dyed auburn hair in a glossy blowout, red lipstick, big gold hoop earrings, "
       "a satin leopard-print blouse, tight black trousers)")
#@INCLUDE funcs1
# Bordes: orden fijo I - F - R. Rosaura o Fidencio le hablan a Itzel -> espalda de ella LEFT; Itzel le habla a Fidencio o Rosaura -> espalda RIGHT;
# Fidencio le habla a Rosaura -> espalda de ella RIGHT; Rosaura le habla a Fidencio -> espalda de él LEFT.
ITZ_B = "@{ITZEL_GORDILLO} seen from behind (a long single black braid, white embroidered cotton blouse)"
FID_B = "@{FIDENCIO_GORDILLO} seen from behind (grey palm-straw hat, olive-green cotton shirt, stocky)"
ROS_B = "@{ROSAURA_PENAGOS} seen from behind (shoulder-length glossy auburn hair, satin leopard-print blouse)"
#@INCLUDE funcs2
#@INCLUDE d8
IL = f"sitting on a low wooden stool on the LEFT at the workbench, polishing {AMBER}"       # Itzel
IS = "standing on the LEFT beside the workbench"                                           # Itzel de pie (desde r4)
FC = "standing in the middle of the workshop"                                               # Fidencio
RH = f"lying back in a woven hammock on the RIGHT, holding {PHONE}"                         # Rosaura en la hamaca
RS = "standing on the RIGHT beside the woven hammock"                                       # Rosaura de pie

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Rosaura YA hablando desde la hamaca con el celular; Itzel de espaldas (LEFT) puliendo. Plazo: antes de que se meta el sol.
 ("c01", D8("c01"), S("c01", "Rosaura", f"Medium close-up of {ROS} {YARD0}, {RH}, talking from the very first frame, bossy, she barely looks up from the phone", ITZ_B, "LEFT", "bossy, lazy, arrogant",
     f"Medium close-up of {ROS} {YARD}, {RH}, talking from the very first frame, bossy", "LEFT")),
 ("c02", D8("c02"), talk("c02", "Itzel", one(f"Close-up of {ITZ} {YARD}, {IL}, tired but proud, she raises her eyes from the amber", "RIGHT"), "tired, firm, proud")),
 ("c03", 6, S("c03", "Rosaura", f"Close-up of {ROS} {YARD0}, {RH}, a lazy smile, she scrolls the phone", ITZ_B, "LEFT", "lazy, mocking",
     f"Close-up of {ROS} {YARD}, {RH}, a lazy smile", "LEFT")),
 ("r1", 6, f"Medium shot of {FID} {YARD}, standing in the open doorway of the workshop, already in place, a woven wool bag on his shoulder, he stops and slowly takes off his hat, serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a straw hat')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, serious, his jaw tight", "RIGHT"), "serious, firm, controlled")),
 ("c05", 6, S("c05", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, she has just stood up from the hammock, a big nervous smile, she fixes her hair", FID_B, "LEFT", "nervous, sweet, fake",
     f"Close-up of {ROS} {YARD}, {RS}, a big nervous smile, she fixes her hair", "LEFT")),
 ("c06", 6, S("c06", "Itzel", f"Close-up of {ITZ} {YARD0}, {IL}, she hides her hands under the workbench, a shy smile", FID_B, "RIGHT", "soft, shy, tired",
     f"Close-up of {ITZ} {YARD}, {IL}, a shy smile", "RIGHT")),
 ("c07", 6, (talk("c07", "Fidencio", two(f"{ITZ} sitting on the LEFT on a low wooden stool at the workbench showing her open hands, and {FID} standing on the RIGHT beside her, "
     f"bending down to look at her hands {YARD0}, framed from the waist up; Fidencio, worried and tender, slightly closer to the camera and in sharper focus") + " " + MOUTH("Fidencio", "Itzel"), "worried, tender, low"),
   talk("c07", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, worried and tender, looking down", "LEFT"), "worried, tender, low"))),
 ("c08", 6, talk("c08", "Rosaura", one(f"Close-up of {ROS} {YARD}, {RS}, she waves one hand with a fake laugh", "LEFT"), "dismissive, fake, light")),
 ("r2", 6, one(f"Close-up of {FID} {YARD}, {FC}, in silence, he turns his head and looks at a small empty glass display box on a wooden shelf, his face darkens", "RIGHT") + " Slow push-in. No dialogue."),
 ("c09", 6, S("c09", "Fidencio", f"Close-up of {FID} {YARD0}, {FC}, serious, his voice low, he gestures toward the shelf", ROS_B, "RIGHT", "serious, low, suspicious",
     f"Close-up of {FID} {YARD}, {FC}, serious, his voice low", "RIGHT")),
 ("c10", 6, S("c10", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, she shrugs, cool, examining her nails", FID_B, "LEFT", "cool, careless",
     f"Close-up of {ROS} {YARD}, {RS}, she shrugs, cool", "LEFT")),
 ("r3", 6, one(f"Close-up of {ITZ} {YARD}, {IL}, in silence, she stops polishing, her eyes shine, she presses her lips together", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Itzel", f"Close-up of {ITZ} {YARD0}, {IL}, her eyes shine, her voice breaks a little", ROS_B, "RIGHT", "hurt, sad, firm",
     f"Close-up of {ITZ} {YARD}, {IL}, her eyes shine", "RIGHT")),
 ("c12", D8("c12"), S("c12", "Fidencio", f"Close-up of {FID} {YARD0}, {FC}, cold and serious", ROS_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {FID} {YARD}, {FC}, cold and serious", "RIGHT")),
 ("c13", 6, talk("c13", "Rosaura", one(f"Close-up of {ROS} {YARD}, {RS}, she rolls her eyes and crosses her arms", "LEFT"), "careless, cold, mocking")),
 ("c14", 6, talk("c14", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, disappointed, his eyes hard", "RIGHT"), "disappointed, firm, slow")),
 ("c15", 6, S("c15", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, defiant, her chin up", FID_B, "LEFT", "defiant, mocking",
     f"Close-up of {ROS} {YARD}, {RS}, defiant, her chin up", "LEFT")),
 ("c16", D8("c16"), S("c16", "Fidencio", f"Close-up of {FID} {YARD0}, {FC}, firm and calm, he gestures slowly toward the open door", ROS_B, "RIGHT", "firm, calm, final",
     f"Close-up of {FID} {YARD}, {FC}, firm and calm", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: polished pieces of golden amber glowing in a small wooden tray on the workbench in the warm window light, the polishing wheel slowly stops; only the amber and the bench, no people. No dialogue."),
 ("c17", D8("c17"), talk("c17", "Rosaura", one(f"Close-up of {ROS} {YARD}, {RS}, a slow knowing smile spreads on her face", "LEFT"), "sly, amused, slow")),
 ("c18", 6, talk("c18", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, firm, impatient", "RIGHT"), "firm, impatient")),
 ("c19", D8("c19"), S("c19", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, she leans in slightly and lowers her voice, enjoying it", FID_B, "LEFT", "sly, low, slow",
     f"Close-up of {ROS} {YARD}, {RS}, she lowers her voice, enjoying it", "LEFT")),
 ("r4", 6, f"Medium shot of {ITZ} {YARD}, she slowly stands up from the low wooden stool beside the workbench, surprised, her hand on her chest, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman with a black braid')}. Slow push-in. No dialogue."),
 ("c20", 6, talk("c20", "Itzel", one(f"Close-up of {ITZ} {YARD}, {IS}, surprised, her voice small", "RIGHT"), "surprised, soft, confused")),
 ("c21", D8("c21"), S("c21", "Rosaura", f"Close-up of {ROS} {YARD0}, {RS}, a cruel little smile, she looks at the daughter", ITZ_B, "LEFT", "cruel, sweet, slow",
     f"Close-up of {ROS} {YARD}, {RS}, a little smile", "LEFT")),
 ("c22", 6, talk("c22", "Fidencio", one(f"Close-up of {FID} {YARD}, {FC}, pale, his voice low and tight, he looks away", "RIGHT"), "low, tight, ashamed")),
 ("c23", 6, S("c23", "Itzel", f"Close-up of {ITZ} {YARD0}, {IS}, her eyes shine, she looks at her father", FID_B, "RIGHT", "hurt, soft, desperate",
     f"Close-up of {ITZ} {YARD}, {IS}, her eyes shine", "RIGHT")),
 # CTA con carisma (después del BLACK): Itzel sola, a cámara
 ("c24", 10, talk("c24", "Itzel", f"Close-up from the chest up of {ITZ} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, moves her braid over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Los muertos no reclaman nada.", "Ella ya no reclama nada."), ("Las traes llenas de cortadas.", "Las traes muy lastimadas."),
        ("Cállate, Rosaura.", "Ya basta, Rosaura."), ("¿Por una piedra y una malcriada?", "¿Por una piedra y por ella?"),
        ("a cruel little smile", "a little smile"), ("his face darkens", "he becomes serious"), ("enjoying it", "calm"), ("fake", "polite"),
        ("ashamed", "quiet"), ("tight", "quiet"), ("her voice breaks a little", "softly"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm daylight inside a rustic wooden amber workshop in Chiapas, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic workshop with a wooden workbench and golden amber pieces in southern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ITZEL_GORDILLO}", "a Mexican woman in her twenties with a long black braid and a white blouse with embroidered flowers"),
         ("@{FIDENCIO_GORDILLO}", "a stocky Mexican man in his fifties with a grey mustache, a grey palm-straw hat and an olive-green shirt"),
         ("@{ROSAURA_PENAGOS}", "a Mexican woman in her forties with glossy auburn hair, red lipstick, gold hoops and a leopard-print blouse"),
         (" @{LOC_TALLERAMBAR}", "")]
#@INCLUDE tail

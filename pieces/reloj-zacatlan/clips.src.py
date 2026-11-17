"""Genera los clips de reloj-zacatlan PARTE 1 (El Reloj de Zacatlán, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra-justicia transformada (ranking2): en una relojería de Zacatlán, Puebla, Gisela (44) tiene a su hijastra Marisol (25) componiendo relojes toda la noche; Ernesto (58) llega antes,
encuentra en el suelo el reloj cucú que hizo su difunta Leonor y la corre "antes de que den las doce". Giro: el contrato del reloj de la parroquia se lo dio el primo de Gisela;
si la corre, se lo quitan. Es ella o el reloj.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (relojería): de izquierda a derecha Marisol (en la mesa de trabajo), Ernesto (de pie en medio, entra por la puerta), Gisela (sentada en el banco del mostrador; desde c05 de pie).
YARD0 = ("inside a small family clock shop in Zacatlán de las Manzanas, Puebla @{LOC_RELOJERIA} on a foggy morning: walls covered with wooden wall clocks, cuckoo clocks and grandfather clocks, "
         "a wooden workbench with tiny gears and a magnifying lamp, a glass counter, a window to a foggy cobblestone street, warm lamp light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CUCKOO = "a broken hand-carved wooden cuckoo clock"
MAR = ("@{MARISOL_TELLEZ} (25-year-old Mexican woman, light-brown skin, dark-brown hair in a ponytail, a mustard-yellow cardigan over a white blouse, a brown leather work apron)")
ERN = ("@{ERNESTO_TELLEZ} (58-year-old Mexican man, light-brown skin, short grey hair, a short grey beard, a dark-green wool jacket over a red-and-grey checked flannel shirt)")
GIS = ("@{GISELA_RAMOS} (44-year-old Mexican woman, light skin, curly dyed red hair, heavy makeup, long red nails, gold bangles, a tight purple dress)")
#@INCLUDE funcs1
# Bordes: orden fijo M - E - G. Gisela o Ernesto le hablan a Marisol -> espalda de ella LEFT; Marisol le habla a Ernesto o Gisela -> espalda RIGHT;
# Ernesto le habla a Gisela -> espalda de ella RIGHT; Gisela le habla a Ernesto -> espalda de él LEFT.
MAR_B = "@{MARISOL_TELLEZ} seen from behind (dark-brown ponytail, mustard-yellow cardigan, apron strings)"
ERN_B = "@{ERNESTO_TELLEZ} seen from behind (short grey hair, dark-green wool jacket)"
GIS_B = "@{GISELA_RAMOS} seen from behind (curly dyed red hair, tight purple dress)"
#@INCLUDE funcs2
#@INCLUDE d8
ML = "sitting on the LEFT at the wooden workbench, repairing a small clock under a magnifying lamp"   # Marisol
MS = "standing on the LEFT beside the workbench"                                                     # Marisol de pie
EC = "standing in the middle of the clock shop"                                                      # Ernesto
GS = "sitting on a stool on the RIGHT behind the glass counter, filing her nails"                    # Gisela sentada
GR = "standing on the RIGHT beside the glass counter"                                                # Gisela de pie

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Gisela YA hablando desde el mostrador limándose las uñas; Marisol de espaldas (LEFT). Plazo: antes de que den las doce.
 ("c01", D8("c01"), S("c01", "Gisela", f"Medium close-up of {GIS} {YARD0}, {GS}, talking from the very first frame, bossy, she does not even look up from her nails", MAR_B, "LEFT", "bossy, lazy, arrogant",
     f"Medium close-up of {GIS} {YARD}, {GS}, talking from the very first frame, bossy", "LEFT")),
 ("c02", D8("c02"), talk("c02", "Marisol", one(f"Close-up of {MAR} {YARD}, {ML}, tired, red eyes, she raises her head from the clock", "RIGHT"), "tired, firm")),
 ("c03", 6, S("c03", "Gisela", f"Close-up of {GIS} {YARD0}, {GS}, a lazy smile, she blows on her nails", MAR_B, "LEFT", "lazy, mocking",
     f"Close-up of {GIS} {YARD}, {GS}, a lazy smile", "LEFT")),
 ("r1", 6, f"Medium shot of {ERN} {YARD}, standing in the open front door of the shop, already in place, holding a wooden toolbox, fog behind him, he stops and looks around, serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a green wool jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Ernesto", one(f"Close-up of {ERN} {YARD}, {EC}, serious, his jaw tight", "RIGHT"), "serious, firm, controlled")),
 ("c05", 6, S("c05", "Gisela", f"Close-up of {GIS} {YARD0}, {GR}, she has just jumped up from the stool, a big nervous smile, she hides the nail file", ERN_B, "LEFT", "nervous, sweet, fake",
     f"Close-up of {GIS} {YARD}, {GR}, a big nervous smile", "LEFT")),
 ("c06", 6, S("c06", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, a shy tired smile", ERN_B, "RIGHT", "soft, shy, tired",
     f"Close-up of {MAR} {YARD}, {ML}, a shy tired smile", "RIGHT")),
 ("c07", 6, (talk("c07", "Ernesto", two(f"{MAR} sitting on the LEFT at the workbench and {ERN} standing on the RIGHT beside her, gently lifting her chin to look at her tired eyes {YARD0}, "
     f"framed from the waist up; Ernesto, worried and tender, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ernesto", "Marisol"), "worried, tender, low"),
   talk("c07", "Ernesto", one(f"Close-up of {ERN} {YARD}, {EC}, worried and tender, looking down", "LEFT"), "worried, tender, low"))),
 ("c08", 6, talk("c08", "Gisela", one(f"Close-up of {GIS} {YARD}, {GR}, she waves one hand with a fake laugh", "LEFT"), "dismissive, fake, light")),
 ("r2", 6, one(f"Close-up of {ERN} {YARD}, {EC}, in silence, he looks down and sees {CUCKOO} lying on the wooden floor, his face darkens", "RIGHT") + " Slow push-in. No dialogue."),
 ("c09", 6, S("c09", "Ernesto", f"Close-up of {ERN} {YARD0}, {EC}, holding {CUCKOO} in his hands, serious, his voice low", GIS_B, "RIGHT", "serious, low, suspicious",
     f"Close-up of {ERN} {YARD}, {EC}, holding {CUCKOO}, serious", "RIGHT")),
 ("c10", 6, S("c10", "Gisela", f"Close-up of {GIS} {YARD0}, {GR}, she shrugs, looking at her red nails", ERN_B, "LEFT", "cool, careless",
     f"Close-up of {GIS} {YARD}, {GR}, she shrugs, cool", "LEFT")),
 ("r3", 6, one(f"Close-up of {MAR} {YARD}, {ML}, in silence, she puts down her tweezers, her eyes shine, she presses her lips together", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Marisol", f"Close-up of {MAR} {YARD0}, {ML}, her eyes shine, her voice breaks a little", GIS_B, "RIGHT", "hurt, sad, firm",
     f"Close-up of {MAR} {YARD}, {ML}, her eyes shine", "RIGHT")),
 ("c12", D8("c12"), S("c12", "Ernesto", f"Close-up of {ERN} {YARD0}, {EC}, holding {CUCKOO}, cold and serious", GIS_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {ERN} {YARD}, {EC}, holding {CUCKOO}, cold and serious", "RIGHT")),
 ("c13", 6, talk("c13", "Gisela", one(f"Close-up of {GIS} {YARD}, {GR}, she rolls her eyes and crosses her arms", "LEFT"), "careless, cold, mocking")),
 ("c14", D8("c14"), talk("c14", "Ernesto", one(f"Close-up of {ERN} {YARD}, {EC}, disappointed, his eyes hard", "RIGHT"), "disappointed, firm, slow")),
 ("c15", 6, S("c15", "Gisela", f"Close-up of {GIS} {YARD0}, {GR}, defiant, her chin up", ERN_B, "LEFT", "defiant, mocking",
     f"Close-up of {GIS} {YARD}, {GR}, defiant, her chin up", "LEFT")),
 ("c16", D8("c16"), S("c16", "Ernesto", f"Close-up of {ERN} {YARD0}, {EC}, firm and calm, he points slowly at the clocks on the wall", GIS_B, "RIGHT", "firm, calm, final",
     f"Close-up of {ERN} {YARD}, {EC}, firm and calm", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: several old clock faces on the wooden wall, their hands almost at twelve, brass pendulums swinging slowly in the warm lamp light; only the clocks, no people. No dialogue."),
 ("c17", D8("c17"), talk("c17", "Gisela", one(f"Close-up of {GIS} {YARD}, {GR}, a slow knowing smile spreads on her face", "LEFT"), "sly, amused, slow")),
 ("c18", 6, talk("c18", "Ernesto", one(f"Close-up of {ERN} {YARD}, {EC}, proud and firm", "RIGHT"), "proud, firm")),
 ("c19", D8("c19"), S("c19", "Gisela", f"Close-up of {GIS} {YARD0}, {GR}, she leans in slightly and smiles, enjoying it", ERN_B, "LEFT", "sly, low, slow",
     f"Close-up of {GIS} {YARD}, {GR}, she smiles, enjoying it", "LEFT")),
 ("r4", 6, one(f"Close-up of {ERN} {YARD}, {EC}, in silence, his firm face slowly fills with doubt, he looks down at the cuckoo clock in his hands", "RIGHT") + " Slow push-in. No dialogue."),
 ("c20", D8("c20"), S("c20", "Marisol", f"Close-up of {MAR} {YARD0}, {MS}, she stands up, brave and firm, her eyes shine", ERN_B, "RIGHT", "brave, firm, emotional",
     f"Close-up of {MAR} {YARD}, {MS}, brave and firm", "RIGHT")),
 ("c21", 6, (talk("c21", "Gisela", f"Medium wide group shot {YARD0}: {MAR} standing on the LEFT by the workbench, {ERN} in the middle holding the cuckoo clock, {GIS} standing on the RIGHT by the counter; "
     f"Gisela, sure of herself, speaks, closest to the camera and in sharp focus; only these three people, no extras. Only Gisela speaks: her lips move clearly; the other two stay silent with mouths closed.", "sly, calm, final"),
   talk("c21", "Gisela", one(f"Close-up of {GIS} {YARD}, {GR}, sure of herself", "LEFT"), "sly, calm, final"))),
 # CTA con carisma (después del BLACK): Marisol sola, a cámara
 ("c22", 10, talk("c22", "Marisol", f"Close-up from the chest up of {MAR} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a loose strand of hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small hopeful half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Si no, hoy no comes.", "Y sin pretextos."), ("¿Y qué vas a hacer, correrme?", "¿Y qué vas a hacer, sacarme?"), ("Usted lo tiró anoche, yo la vi.", "Usted lo descolgó anoche, yo la vi."),
        ("his face darkens", "he becomes serious"), ("enjoying it", "calm"), ("fake", "polite"), ("her voice breaks a little", "softly"), ("defiant", "confident"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm lamp light inside a small clock shop full of wall clocks on a foggy morning in Puebla, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, cozy old clock shop with cuckoo clocks and a workbench in a Mexican mountain town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MARISOL_TELLEZ}", "a Mexican woman in her twenties with a dark-brown ponytail, a mustard-yellow cardigan and a brown leather apron"),
         ("@{ERNESTO_TELLEZ}", "a Mexican man in his fifties with short grey hair, a grey beard and a dark-green wool jacket"),
         ("@{GISELA_RAMOS}", "a Mexican woman in her forties with curly dyed red hair, heavy makeup and a tight purple dress"),
         (" @{LOC_RELOJERIA}", "")]
#@INCLUDE tail

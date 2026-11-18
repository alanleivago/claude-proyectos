"""Genera los clips de cafetal-coatepec PARTE 1 (La Patrona del Cafetal, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #45 "La patrona que dejaron en el altar" [CAPO] (Patronas y haciendas), cierre tipo 7 (objeto que delata): en el patio de secado de su hacienda cafetalera en Coatepec,
la temida patrona Griselda (45) recibe a Celestino (40), un capataz sin recomendación que le sostiene la mirada. La mayordoma Felipa (61) cuenta que a la patrona la dejaron en el altar.
Él se va contratado y se le cae la cartera: Felipa la recoge y adentro está la foto de Griselda vestida de novia.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (patio de secado): Griselda a la DERECHA junto a los arcos; Felipa a la DERECHA un paso detrás de ella; Celestino a la IZQUIERDA junto al café tendido.
YARD0 = ("on the large stone drying patio of an old coffee hacienda in Coatepec, Veracruz @{LOC_CAFETALCOATEPEC} in the misty morning: red coffee cherries and pale beans spread to dry on the stones, "
         "white colonial arches with red tile roofs, green coffee plants on the hills beyond, soft fog; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
GRI = ("@{GRISELDA_MONTIEL} (45-year-old Mexican woman, fair skin, straight jet-black hair in a severe high ponytail, sharp cheekbones, dark red lipstick, a fitted black riding jacket over a white blouse)")
CEL = ("@{CELESTINO_BARRAGAN} (40-year-old Mexican man, tanned brown skin, short dark hair, a short dark beard, calm deep-set eyes, a worn brown leather jacket over a grey henley shirt, a palm-leaf hat in his hand)")
FEL = ("@{FELIPA_CRUZ} (61-year-old Mexican woman, brown skin, grey curly hair tied back with a white ribbon, kind round face, a pale-yellow blouse, a white cotton shawl)")
#@INCLUDE funcs1
GRI_B = "@{GRISELDA_MONTIEL} seen from behind (jet-black high ponytail, fitted black riding jacket)"
CEL_B = "@{CELESTINO_BARRAGAN} seen from behind (short dark hair, worn brown leather jacket)"
FEL_B = "@{FELIPA_CRUZ} seen from behind (grey curly hair tied with a white ribbon, white cotton shawl)"
#@INCLUDE funcs2
#@INCLUDE d8
GR = "standing on the RIGHT by the white arches"
FR = "standing on the RIGHT a step behind the patrona, by the arches"
CL = "standing on the LEFT beside the coffee spread on the stones"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Griselda YA hablando, seca, Celestino de espaldas en el borde.
 ("c01", 6, S("c01", "Griselda", f"Medium close-up of {GRI} {YARD0}, {GR}, talking from the very first frame, cold and dry, arms crossed", CEL_B, "LEFT", "cold, dry, commanding",
     f"Medium close-up of {GRI} {YARD}, {GR}, talking from the very first frame, cold and dry", "LEFT")),
 ("c02", 6, S("c02", "Celestino", f"Close-up of {CEL} {YARD0}, {CL}, calm, holding her gaze without blinking, respectful but firm", GRI_B, "RIGHT", "calm, respectful, firm",
     f"Close-up of {CEL} {YARD}, {CL}, calm, holding the gaze", "RIGHT")),
 ("c03", 6, S("c03", "Felipa", f"Close-up of {FEL} {YARD0}, {FR}, leaning toward the patrona, talking low with a small amused smile", GRI_B, "LEFT", "low, amused, friendly",
     f"Close-up of {FEL} {YARD}, {FR}, talking low with a small smile", "LEFT")),
 ("c04", 6, S("c04", "Griselda", f"Close-up of {GRI} {YARD0}, {GR}, sharp, she raises her chin and narrows her eyes at him", CEL_B, "LEFT", "sharp, cold, suspicious",
     f"Close-up of {GRI} {YARD}, {GR}, sharp, chin raised", "LEFT")),
 ("c05", 6, S("c05", "Celestino", f"Close-up of {CEL} {YARD0}, {CL}, serene, turning the palm-leaf hat in his hands", GRI_B, "RIGHT", "serene, simple, honest",
     f"Close-up of {CEL} {YARD}, {CL}, serene, turning his hat", "RIGHT")),
 ("c06", D8("c06"), S("c06", "Griselda", f"Close-up of {GRI} {YARD0}, {GR}, bitter and guarded, a hard look", CEL_B, "LEFT", "bitter, guarded, cold",
     f"Close-up of {GRI} {YARD}, {GR}, bitter and guarded", "LEFT")),
 ("c07", 6, S("c07", "Felipa", f"Close-up of {FEL} {YARD0}, {FR}, softly, almost whispering to the man, with sad eyes", CEL_B, "LEFT", "soft, sad, confiding",
     f"Close-up of {FEL} {YARD}, {FR}, softly, sad eyes", "LEFT")),
 ("c08", 6, S("c08", "Griselda", f"Close-up of {GRI} {YARD0}, {GR}, she turns her head sharply toward the housekeeper, furious, eyes burning", FEL_B, "RIGHT", "furious, sharp, hurt",
     f"Close-up of {GRI} {YARD}, {GR}, furious, turning her head sharply", "RIGHT")),
 ("c09", 6, S("c09", "Celestino", f"Close-up of {CEL} {YARD0}, {CL}, quiet and sincere, a shadow of guilt in his eyes", GRI_B, "RIGHT", "quiet, sincere, heavy",
     f"Close-up of {CEL} {YARD}, {CL}, quiet and sincere", "RIGHT")),
 ("c10", 6, S("c10", "Griselda", f"Close-up of {GRI} {YARD0}, {GR}, cold again, intrigued despite herself, she studies his face", CEL_B, "LEFT", "cold, controlled, curt",
     f"Close-up of {GRI} {YARD}, {GR}, cold, studying him", "LEFT")),
 ("r1", 6, one(f"Medium shot of {CEL} {YARD}, {CL}, he nods, puts on his palm-leaf hat, turns and walks away across the patio; as he turns, a small worn leather wallet slips out of his jacket and falls onto the stones without him noticing", "RIGHT") + " No dialogue."),
 ("i01", 6, f"Close-up insert {YARD0}: wrinkled old hands opening a worn leather wallet; inside, an old faded printed photograph of a bride in a white wedding dress and veil, the face of @{{GRISELDA_MONTIEL}} younger, standing beside a young groom; no readable text, no faces other than in the photo. No dialogue."),
 ("c11", 6, talk("c11", "Felipa", one(f"Close-up of {FEL} {YARD}, {FR}, holding an open worn leather wallet, one hand over her mouth, stunned, whispering, then lifting her eyes", "LEFT"), "stunned, whispering, frightened")),
 ("r2", 6, one(f"Close-up of {GRI} {YARD}, {GR}, frozen, her hard mask breaks for a second, her lips part, her eyes go to the wallet, completely still", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Celestino a cámara
 ("c12", 10, talk("c12", "Celestino", f"Close-up from the chest up of {CEL} {YARD}, standing, alone, bareheaded, holding his single palm-leaf hat against his chest with one hand, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, turns the hat slowly in his hand, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("furious, sharp, hurt", "upset, hurt"), ("furious", "upset"), ("bitter", "serious"), ("burning", "intense"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, soft misty morning light on the drying patio of a coffee hacienda in Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, coffee hacienda patio with white arches in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{GRISELDA_MONTIEL}", "a stern Mexican woman in her forties with a jet-black high ponytail, dark red lipstick and a fitted black riding jacket"),
         ("@{CELESTINO_BARRAGAN}", "a Mexican man around forty with a short dark beard, a worn brown leather jacket and a palm-leaf hat"),
         ("@{FELIPA_CRUZ}", "a kind Mexican woman in her sixties with grey curly hair tied with a white ribbon, a pale-yellow blouse and a white shawl"),
         (" @{LOC_CAFETALCOATEPEC}", "")]
#@INCLUDE tail

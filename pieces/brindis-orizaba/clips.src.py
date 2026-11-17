"""Genera los clips de brindis-orizaba PARTE 1 (El Brindis de Orizaba, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #19 "El brindis" [CAPO], cierre tipo 5 (se vuelve la acusación contra quien acusa): en la fiesta de compromiso de Diego (30), hijo del cacique don Clemente Salas (65), el padrino
Tomás (56) brinda con indirectas sobre el pasado de la novia Valeria (28); doña Mercedes (60) la desprecia. Valeria toma el micrófono: sí tuvo otro apellido, pero ella no va los jueves al hotel
del centro… "Pregúntele a su esposa, don Clemente." Mercedes y el padrino se quedan helados.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (jardín): Tomás de pie al CENTRO-DERECHA junto al micrófono; Valeria y Diego a la IZQUIERDA en la mesa principal; Clemente y Mercedes a la DERECHA en la mesa principal.
YARD0 = ("in the garden of an old hacienda in Orizaba, Veracruz @{LOC_JARDINORIZABA} at night during an engagement party: string lights overhead, round tables with white tablecloths and white flowers, "
         "a long head table with crystal glasses, a small wooden stage with a microphone stand, tropical plants, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
TOM = ("@{TOMAS_ARCE} (56-year-old Mexican man, tall and thin, tanned skin, slicked-back salt-and-pepper hair, a thin mustache, a white embroidered guayabera)")
VAL = ("@{VALERIA_RIOS} (28-year-old Mexican woman, light-brown skin, long wavy dark-brown hair half up, small gold earrings, an elegant light-pink satin cocktail dress)")
DIE = ("@{DIEGO_SALAS} (30-year-old Mexican man, fair skin, short neat black hair, clean-shaven, a navy-blue suit, a white shirt, a light-blue tie)")
CLE = ("@{CLEMENTE_SALAS} (65-year-old Mexican man, heavy-set, light skin, white hair, a white beard, a cream panama hat, a black linen jacket over a black shirt, a gold chain)")
MER = ("@{MERCEDES_SALAS} (60-year-old Mexican woman, fair skin, voluminous dyed red hair, heavy makeup, big emerald earrings, an emerald-green sequined evening dress)")
#@INCLUDE funcs1
TOM_B = "@{TOMAS_ARCE} seen from behind (slicked-back salt-and-pepper hair, white embroidered guayabera, tall and thin)"
VAL_B = "@{VALERIA_RIOS} seen from behind (long wavy dark-brown hair half up, light-pink satin dress)"
CLE_B = "@{CLEMENTE_SALAS} seen from behind (cream panama hat, black linen jacket, heavy-set)"
#@INCLUDE funcs2
#@INCLUDE d8
TR = "standing on the RIGHT near the microphone stand, holding a glass of champagne"
VL = "standing on the LEFT at the head table"
DL = "standing on the LEFT at the head table beside his fiancée"
CR = "sitting on the RIGHT at the head table"
MR = "sitting on the RIGHT at the head table, next to her husband"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Tomás YA hablando, copa en alto; Valeria de espaldas (LEFT).
 ("c01", D8("c01"), S("c01", "Tomás", f"Medium close-up of {TOM} {YARD0}, {TR}, talking from the very first frame, raising his glass, a sly venomous smile", VAL_B, "LEFT", "sly, ironic, loud",
     f"Medium close-up of {TOM} {YARD}, {TR}, talking from the very first frame, raising his glass, a sly smile", "LEFT")),
 ("c02", 6, S("c02", "Valeria", f"Close-up of {VAL} {YARD0}, {VL}, a frozen polite smile, holding her glass", TOM_B, "RIGHT", "polite, tense, soft",
     f"Close-up of {VAL} {YARD}, {VL}, a frozen polite smile", "RIGHT")),
 ("c03", 6, talk("c03", "Tomás", one(f"Close-up of {TOM} {YARD}, {TR}, he shakes his head slowly, enjoying it", "LEFT"), "sly, slow")),
 ("r1", 6, f"Medium shot of {CLE} {YARD}, {CR}, already in place, he slowly puts down his glass, serious and heavy, {gaze('LEFT')}; {ALONE}; {NODOUBLE('man in a cream panama hat')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Clemente", one(f"Close-up of {CLE} {YARD}, {CR}, serious, a warning look", "LEFT"), "serious, heavy, low")),
 ("c05", D8("c05"), S("c05", "Tomás", f"Close-up of {TOM} {YARD0}, {TR}, he turns to the boss with a fake respectful bow", CLE_B, "RIGHT", "sly, fake respectful",
     f"Close-up of {TOM} {YARD}, {TR}, a fake respectful bow", "RIGHT")),
 ("c06", 6, S("c06", "Diego", f"Close-up of {DIE} {YARD0}, {DL}, annoyed and protective, he puts a hand on his fiancée's back", TOM_B, "RIGHT", "annoyed, firm",
     f"Close-up of {DIE} {YARD}, {DL}, annoyed and protective", "RIGHT")),
 ("c07", 6, talk("c07", "Mercedes", two(f"{MER} on the RIGHT leaning toward {CLE} on the LEFT at the head table {YARD0}, framed from the waist up; she whispers to her husband with a smug smile, "
     f"slightly closer to the camera and in sharper focus") + " " + MOUTH("Mercedes", "Clemente"), "smug, whispering")),
 ("i01", 6, f"Close-up insert {YARD0}: crystal champagne glasses on the white tablecloth of the head table under the string lights, the bubbles rising, a small microphone lying beside them; no hands, no people. No dialogue."),
 ("r2", 6, f"Medium shot of {VAL} {YARD}, {VL}, already in place, she puts down her glass, picks up the microphone from the table and straightens up, calm and decided, {gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a pink satin dress')}. Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Valeria", f"Close-up of {VAL} {YARD0}, {VL}, holding the microphone, calm, a small dangerous smile", TOM_B, "RIGHT", "calm, sweet, dangerous",
     f"Close-up of {VAL} {YARD}, {VL}, holding the microphone, calm", "RIGHT")),
 ("c09", 6, talk("c09", "Tomás", one(f"Close-up of {TOM} {YARD}, {TR}, his smile gone, nervous, he lowers his glass", "LEFT"), "nervous, quick, low")),
 ("c10", 6, S("c10", "Valeria", f"Close-up of {VAL} {YARD0}, {VL}, holding the microphone, firm, looking straight at the padrino", TOM_B, "RIGHT", "firm, clear",
     f"Close-up of {VAL} {YARD}, {VL}, holding the microphone, firm", "RIGHT")),
 ("c11", 6, talk("c11", "Clemente", one(f"Close-up of {CLE} {YARD}, {CR}, frowning, confused, he leans forward", "LEFT"), "confused, heavy")),
 ("c12", 6, S("c12", "Valeria", f"Close-up of {VAL} {YARD0}, {VL}, holding the microphone, she slowly turns her eyes toward the boss's wife", CLE_B, "RIGHT", "calm, cutting, slow",
     f"Close-up of {VAL} {YARD}, {VL}, holding the microphone, calm and cutting", "RIGHT")),
 ("r3", 6, one(f"Close-up of {MER} {YARD}, {MR}, in silence, her smug smile freezes, she goes pale and slowly lowers her eyes", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Valeria sola, a cámara
 ("c13", 10, talk("c13", "Valeria", f"Close-up from the chest up of {VAL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks her hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small confident half smile. Nobody else around.",
     "charismatic, confident, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Pero yo no voy los jueves al hotel del centro.", "Pero yo no tengo citas los jueves en el centro."), ("venomous", "ironic"), ("dangerous", "confident"),
        ("smug", "proud"), ("cutting", "firm"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm string lights at night in the garden of a hacienda in Veracruz during an engagement party, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, elegant Mexican garden party at night, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm evening light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TOMAS_ARCE}", "a tall thin Mexican man in his fifties with slicked-back salt-and-pepper hair, a thin mustache and a white embroidered guayabera"),
         ("@{VALERIA_RIOS}", "a Mexican woman in her late twenties with long wavy dark-brown hair half up and a light-pink satin cocktail dress"),
         ("@{DIEGO_SALAS}", "a Mexican man around thirty with short neat black hair in a navy-blue suit and a light-blue tie"),
         ("@{CLEMENTE_SALAS}", "a heavy-set Mexican man in his sixties with a white beard, a cream panama hat and a black linen jacket"),
         ("@{MERCEDES_SALAS}", "a Mexican woman around sixty with voluminous dyed red hair, emerald earrings and an emerald-green sequined dress"),
         (" @{LOC_JARDINORIZABA}", "")]
#@INCLUDE tail

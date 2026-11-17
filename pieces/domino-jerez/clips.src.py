"""Genera los clips de domino-jerez PARTE 1 (El Dominó de Jerez, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #31 "La partida de dominó" [CAPO], cierre tipo 3 (una palabra reveladora): en una cantina de Jerez, Zacatecas, el forastero Julián (35) le gana tres partidas seguidas a don Severo (68),
el hombre que manda en la región; el cantinero Toño (58) le pide que pare. Severo pide la cuarta y pone una foto boca abajo: si gana Julián, le dice quién es. Julián voltea la foto: es su madre, Rosario.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (cantina): Severo sentado a la DERECHA de la mesa de dominó; Julián sentado a la IZQUIERDA; Toño de pie a la IZQUIERDA, detrás de Julián, junto a la barra.
YARD0 = ("inside an old traditional cantina in Jerez, Zacatecas @{LOC_CANTINAJEREZ} in the late afternoon: a long dark wooden bar with shelves of unlabeled bottles, a square wooden table with domino tiles, "
         "ceiling fans, an old tiled floor, warm light through swinging doors; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PHOTO = "an old faded black-and-white photograph of a smiling woman in her twenties with long braids"
SEV = ("@{SEVERO_LECHUGA} (68-year-old Mexican man, heavy-set, weathered light-brown skin, grey hair, a thick grey mustache, a black felt cowboy hat, a dark-brown leather jacket over a black western shirt, silver rings)")
JUL = ("@{JULIAN_ROSALES} (35-year-old Mexican man, brown skin, short black hair, a short black beard, a tan canvas jacket over a white t-shirt)")
TON = ("@{TONO_CARRILLO} (58-year-old Mexican man, bald with grey sides, a round face, a grey mustache, a red-and-black checked flannel shirt, a white towel over one shoulder)")
#@INCLUDE funcs1
SEV_B = "@{SEVERO_LECHUGA} seen from behind (black felt cowboy hat, dark-brown leather jacket, heavy-set)"
JUL_B = "@{JULIAN_ROSALES} seen from behind (short black hair, tan canvas jacket)"
TON_B = "@{TONO_CARRILLO} seen from behind (bald head with grey sides, red-and-black checked flannel shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
SR = "sitting on the RIGHT at the domino table"
JL = "sitting on the LEFT at the domino table"
TL = "standing on the LEFT by the bar"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Toño YA hablando, inclinado, al oído de Julián; Julián de espaldas (RIGHT).
 ("c01", 6, S("c01", "Toño", f"Medium close-up of {TON} {YARD0}, {TL}, talking from the very first frame, bending down and whispering, nervous, he wipes his hands on the towel", JUL_B, "RIGHT", "nervous, whispering, urgent",
     f"Medium close-up of {TON} {YARD}, {TL}, talking from the very first frame, whispering, nervous", "RIGHT")),
 ("c02", 6, S("c02", "Julián", f"Close-up of {JUL} {YARD0}, {JL}, calm and relaxed, he stacks domino tiles", TON_B, "LEFT", "calm, relaxed, low",
     f"Close-up of {JUL} {YARD}, {JL}, calm, stacking domino tiles", "LEFT")),
 ("c03", 6, S("c03", "Severo", f"Close-up of {SEV} {YARD0}, {SR}, cold and heavy, he taps a domino tile on the table", JUL_B, "LEFT", "cold, heavy, slow",
     f"Close-up of {SEV} {YARD}, {SR}, cold and heavy", "LEFT")),
 ("r1", 6, f"Medium shot of {JUL} {YARD}, {JL}, already in place, he leans back in his chair, calm, holding his gaze, {gaze('RIGHT')}; {ALONE}; {NODOUBLE('man in a tan canvas jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Julián", f"Close-up of {JUL} {YARD0}, {JL}, calm, a small respectful nod", SEV_B, "RIGHT", "calm, respectful",
     f"Close-up of {JUL} {YARD}, {JL}, calm", "RIGHT")),
 ("c05", 6, S("c05", "Severo", f"Close-up of {SEV} {YARD0}, {SR}, suspicious, his eyes narrow", JUL_B, "LEFT", "suspicious, low",
     f"Close-up of {SEV} {YARD}, {SR}, suspicious", "LEFT")),
 ("c06", 6, talk("c06", "Julián", one(f"Close-up of {JUL} {YARD}, {JL}, a calm half smile", "RIGHT"), "calm, mysterious")),
 ("i01", 6, f"Close-up insert {YARD0}: domino tiles are shuffled face down on the wooden table by two hands with silver rings; only the tiles and the hands, no face. No dialogue."),
 ("c07", 6, talk("c07", "Severo", one(f"Close-up of {SEV} {YARD}, {SR}, cold, he pushes his hat back slightly", "LEFT"), "cold, firm")),
 ("c08", 6, S("c08", "Toño", f"Close-up of {TON} {YARD0}, {TL}, nervous and respectful, twisting the towel", SEV_B, "RIGHT", "nervous, pleading, low",
     f"Close-up of {TON} {YARD}, {TL}, nervous", "RIGHT")),
 ("c09", 6, talk("c09", "Severo", one(f"Close-up of {SEV} {YARD}, {SR}, without looking at him, calm and cold", "LEFT"), "calm, cold")),
 ("r2", 6, f"Medium shot of {SEV} {YARD}, {SR}, he slowly takes an old photograph out of his leather jacket and places it face down on the domino table, then rests his hand on it; {SOLO}; {ALONE}; {NODOUBLE('man in a black felt hat')}. Slow push-in. No dialogue."),
 ("c10", D8("c10"), S("c10", "Severo", f"Close-up of {SEV} {YARD0}, {SR}, serious, his hand on the face-down photo", JUL_B, "LEFT", "serious, slow",
     f"Close-up of {SEV} {YARD}, {SR}, serious", "LEFT")),
 ("c11", 6, S("c11", "Julián", f"Close-up of {JUL} {YARD0}, {JL}, serious now, steady", SEV_B, "RIGHT", "serious, steady",
     f"Close-up of {JUL} {YARD}, {JL}, serious", "RIGHT")),
 ("r3", 6, f"Close-up insert {YARD0}: on the wooden table among domino tiles, a hand with silver rings turns over {PHOTO}; only the photo, the tiles and the hand, no face. No dialogue."),
 ("c12", 6, talk("c12", "Severo", one(f"Close-up of {SEV} {YARD}, {SR}, looking down at the photo, his hard face softens, his eyes shine", "LEFT"), "low, nostalgic, slow")),
 ("c13", 6, talk("c13", "Julián", one(f"Close-up of {JUL} {YARD}, {JL}, staring at the photo, shaken, his voice breaks", "RIGHT"), "shaken, low, emotional")),
 ("r4", 6, one(f"Close-up of {SEV} {YARD}, {SR}, in silence, stunned, he slowly lifts his eyes from the photo to the young man, his lips part", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Julián solo, a cámara
 ("c14", 10, talk("c14", "Julián", f"Close-up from the chest up of {JUL} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, picks up a domino tile and turns it between his fingers, raises one eyebrow, "
     f"tilts his head, nods slowly and gives a small half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Si pierdes, me dices quién te mandó.", "Si pierdes, me dices a qué viniste."), ("Tú sirve los tequilas, Toño.", "Tú sirve las bebidas, Toño."),
        ("stunned", "surprised"), ("shaken", "moved"), ("suspicious", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm late-afternoon light in an old traditional cantina in Zacatecas, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican cantina with a domino table, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm low light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEVERO_LECHUGA}", "a heavy-set Mexican man in his sixties with a thick grey mustache, a black felt cowboy hat and a dark-brown leather jacket"),
         ("@{JULIAN_ROSALES}", "a Mexican man in his thirties with short black hair, a short black beard and a tan canvas jacket"),
         ("@{TONO_CARRILLO}", "a bald Mexican man in his fifties with a grey mustache, a red-and-black checked flannel shirt and a towel on his shoulder"),
         (" @{LOC_CANTINAJEREZ}", "")]
#@INCLUDE tail

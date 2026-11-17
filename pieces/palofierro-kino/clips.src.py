"""Genera los clips de palofierro-kino PARTE 1 (El Palo Fierro de Kino, MEXI TV) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado ("le dio cinco minutos y no le creyó"): en la playa de Bahía de Kino, Sonora, Brayan (32) le tira las figuras de palo fierro a don Eliseo (70) y le da plazo
"antes de que se meta el sol" para poner su restaurante. Eliseo, tranquilo, le da cinco minutos para levantarlas. Brayan llama a su papá Saúl (58), que llega y le pide perdón al viejo:
Eliseo era "el patrón" de toda la costa antes de retirarse. Giro: el que lo traicionó aquella noche sigue vivo. Su nieta Nayeli (24) no sabía nada.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (puesto en la playa): Eliseo (sentado en su mesa de tallado) y Nayeli a la IZQUIERDA; Brayan y Saúl a la DERECHA, del lado del camino de arena.
YARD0 = ("on the beach at Bahía de Kino, Sonora @{LOC_PLAYAKINO} at golden sunset: a small open palm-roof stand on the sand with a wooden table full of polished dark ironwood carvings "
         "of dolphins, turtles and eagles, rocky hills with saguaro cacti, the calm turquoise sea behind, warm golden light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CARVING = "a small polished dark ironwood carving of a dolphin"
PHONE = "a smartphone"
ELI = ("@{ELISEO_ROBLES} (70-year-old Mexican man, lean, deeply tanned skin, white hair tied in a short ponytail, a short white beard, a faded light-blue linen shirt)")
NAY = ("@{NAYELI_ROBLES} (24-year-old Mexican woman, tanned skin, long loose black hair, an open white linen shirt over a coral top)")
BRA = ("@{BRAYAN_SOTO} (32-year-old Mexican man, light-brown skin, curly black hair with a fade, a thin mustache, a printed silk shirt with green palm leaves, a gold chain, sunglasses on his head)")
SAU = ("@{SAUL_SOTO} (58-year-old Mexican man, heavy-set, light-brown skin, grey crew cut, a thick grey mustache, a cream straw cowboy hat, a black polo shirt)")
#@INCLUDE funcs1
# Bordes: Brayan o Saúl le hablan a Eliseo/Nayeli -> espalda LEFT; Eliseo o Nayeli les hablan -> espalda RIGHT.
ELI_B = "@{ELISEO_ROBLES} seen from behind (white hair in a short ponytail, faded light-blue linen shirt)"
NAY_B = "@{NAYELI_ROBLES} seen from behind (long loose black hair, open white linen shirt)"
BRA_B = "@{BRAYAN_SOTO} seen from behind (curly black hair with a fade, printed silk shirt with green palm leaves)"
SAU_B = "@{SAUL_SOTO} seen from behind (cream straw cowboy hat, black polo shirt, heavy-set)"
#@INCLUDE funcs2
#@INCLUDE d8
EL = f"sitting on the LEFT at his wooden carving table under the palm roof, sanding {CARVING}"   # Eliseo
ES = "standing on the LEFT beside his wooden carving table"                                      # Eliseo de pie
NL = "standing on the LEFT beside the palm-roof stand"                                           # Nayeli
BR = "standing on the RIGHT on the sand, a black SUV parked behind him"                          # Brayan
SR = "standing on the RIGHT on the sand"                                                         # Saúl

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Brayan YA hablando junto a su camioneta; Eliseo de espaldas (LEFT) en su mesa. Plazo: antes de que se meta el sol.
 ("c01", D8("c01"), S("c01", "Brayan", f"Medium close-up of {BRA} {YARD0}, {BR}, talking from the very first frame, arrogant, he waves a hand at the carvings with disdain", ELI_B, "LEFT", "arrogant, bossy, mocking",
     f"Medium close-up of {BRA} {YARD}, {BR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Eliseo", f"Close-up of {ELI} {YARD0}, {EL}, completely calm, he keeps sanding without looking up", BRA_B, "RIGHT", "calm, slow, firm",
     f"Close-up of {ELI} {YARD}, {EL}, completely calm", "RIGHT")),
 ("c03", 6, talk("c03", "Brayan", one(f"Close-up of {BRA} {YARD}, {BR}, a cocky smile, he taps his phone in his pocket", "LEFT"), "cocky, mocking")),
 ("r1", 6, f"Medium shot of {NAY} {YARD}, {NL}, already in place arranging carvings, she stops and looks at the visitor, worried and annoyed, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young woman with long black hair')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Nayeli", f"Close-up of {NAY} {YARD0}, {NL}, firm and protective", BRA_B, "RIGHT", "firm, protective",
     f"Close-up of {NAY} {YARD}, {NL}, firm and protective", "RIGHT")),
 ("c05", 6, S("c05", "Brayan", f"Close-up of {BRA} {YARD0}, {BR}, dismissive, he does not even look at her", NAY_B, "LEFT", "dismissive, cold",
     f"Close-up of {BRA} {YARD}, {BR}, dismissive", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a hand with a gold chain bracelet slowly sweeps several polished ironwood carvings off the wooden table and they fall onto the sand; only the hand, the table and the carvings, no face. No dialogue."),
 ("c06", D8("c06"), S("c06", "Eliseo", f"Close-up of {ELI} {YARD0}, {EL}, he slowly puts down the carving and looks up, calm and cold, his eyes very steady", BRA_B, "RIGHT", "calm, cold, slow",
     f"Close-up of {ELI} {YARD}, {EL}, calm and cold, his eyes very steady", "RIGHT")),
 ("c07", 6, talk("c07", "Brayan", one(f"Close-up of {BRA} {YARD}, {BR}, he laughs out loud, amused", "LEFT"), "amused, mocking")),
 ("c08", 6, talk("c08", "Eliseo", one(f"Close-up of {ELI} {YARD}, {EL}, a small calm smile, completely sure", "RIGHT"), "calm, sure, low")),
 ("r2", 6, f"Medium shot of {ELI} {YARD}, {EL}, in silence, he calmly picks up another piece of wood and keeps sanding, then glances at an old wristwatch, unbothered, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}. Slow push-in. No dialogue."),
 ("c09", 6, talk("c09", "Brayan", one(f"Close-up of {BRA} {YARD}, {BR}, holding {PHONE} to his ear, laughing and mocking", "LEFT"), "mocking, amused")),
 ("c10", 6, talk("c10", "Saúl", f"Close-up of {SAU} sitting in the back seat of a dark SUV, holding {PHONE} to his ear, his face goes pale and serious, the only person in the shot; {ONE}.", "shocked, serious, firm")),
 ("i02", 6, "Wide shot of two black SUVs driving fast along a sandy coastal road between saguaro cacti and the turquoise sea at Bahía de Kino, Sonora, at golden sunset, dust behind them; no people visible, no readable text, no logos. No dialogue."),
 ("r3", 6, f"Medium shot of {SAU} {YARD}, {SR}, already standing in place, he quickly takes off his cream straw hat and holds it against his chest, humble and nervous, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a black polo shirt')}. Slow push-in. No dialogue."),
 ("c11", 6, S("c11", "Saúl", f"Close-up of {SAU} {YARD0}, {SR}, holding his hat against his chest, humble and respectful, he lowers his head", ELI_B, "LEFT", "humble, respectful, nervous",
     f"Close-up of {SAU} {YARD}, {SR}, holding his hat, humble and respectful", "LEFT")),
 ("c12", 6, talk("c12", "Brayan", one(f"Close-up of {BRA} {YARD}, {BR}, confused and offended, he looks at his father", "RIGHT"), "confused, offended")),
 ("c13", 6, talk("c13", "Saúl", one(f"Close-up of {SAU} {YARD}, {SR}, cold and furious with his son, very serious", "RIGHT"), "cold, serious, firm")),
 ("r4", 6, f"Medium shot of {BRA} {YARD}, kneeling on the sand in his white trousers, he picks up the ironwood carvings one by one and puts them back on the table, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a palm leaf shirt')}. No dialogue."),
 ("c14", 6, S("c14", "Eliseo", f"Close-up of {ELI} {YARD0}, {ES}, calm and serious, a little tired", SAU_B, "RIGHT", "calm, serious, tired",
     f"Close-up of {ELI} {YARD}, {ES}, calm and serious", "RIGHT")),
 ("c15", 6, S("c15", "Saúl", f"Close-up of {SAU} {YARD0}, {SR}, respectful, he nods slowly", ELI_B, "LEFT", "respectful, low",
     f"Close-up of {SAU} {YARD}, {SR}, respectful, he nods", "LEFT")),
 ("c16", 6, talk("c16", "Nayeli", one(f"Close-up of {NAY} {YARD}, {NL}, stunned, she turns to her grandfather", "RIGHT"), "stunned, confused")),
 ("c17", D8("c17"), (talk("c17", "Eliseo", two(f"{NAY} on the LEFT and {ELI} on the RIGHT, close together beside the carving table {YARD0}, framed from the waist up; "
     f"Eliseo speaks low and calm to his granddaughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Eliseo", "Nayeli"), "low, calm, honest"),
   talk("c17", "Eliseo", one(f"Close-up of {ELI} {YARD}, {ES}, low, calm and honest", "LEFT"), "low, calm, honest"))),
 ("c18", 6, talk("c18", "Saúl", one(f"Close-up of {SAU} {YARD}, {SR}, he steps closer and lowers his voice, worried", "LEFT"), "low, worried, serious")),
 # CTA con carisma (después del BLACK): Eliseo solo, a cámara
 ("c19", 10, talk("c19", "Eliseo", f"Close-up from the chest up of {ELI} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, strokes his white beard, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small dangerous half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Con una llamada, usted se va de Kino.", "Con una llamada, todo cambia."), ("Antes de tallar madera, yo mandaba en toda esta costa.", "Antes de tallar madera, yo era el patrón de toda esta costa."),
        ("El que lo traicionó aquella noche sigue vivo.", "El que le falló aquella noche sigue por aquí."),
        ("sweeps", "moves"), ("fall onto the sand", "rest on the sand"), ("cold and furious with his son", "serious"), ("humiliated", "quiet"), ("stunned", "surprised"),
        ("shocked", "surprised"), ("dangerous", "mysterious"), ("his face goes pale", "he becomes serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden sunset light on a beach stand with ironwood carvings at Bahía de Kino, Sonora, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, beach palm-roof stand with saguaro hills and the turquoise sea in northern Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ELISEO_ROBLES}", "a lean deeply tanned elderly Mexican man with a white ponytail, a short white beard and a light-blue linen shirt"),
         ("@{NAYELI_ROBLES}", "a tanned Mexican woman in her twenties with long loose black hair and an open white linen shirt over a coral top"),
         ("@{BRAYAN_SOTO}", "a Mexican man in his thirties with curly black hair, a thin mustache, a palm-leaf silk shirt and a gold chain"),
         ("@{SAUL_SOTO}", "a heavy-set Mexican man in his late fifties with a grey mustache, a cream straw cowboy hat and a black polo shirt"),
         (" @{LOC_PLAYAKINO}", "")]
#@INCLUDE tail

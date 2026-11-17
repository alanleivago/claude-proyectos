"""Genera los clips de red-janitzio PARTE 1 (La Red de Janitzio, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Capos transformado (humillación + plazo -> la llamada que el villano no cree -> llega la figura de poder -> plazo invertido -> giro familiar): en el muelle frente a Janitzio, Ignacio (38),
que maneja la cooperativa, le quita su lugar al viejo pescador don Severo (78), le avienta al agua la red que tejió su esposa y le da plazo "antes de que salgan las canoas"; su nieta Nayeli (25)
lo defiende. Severo hace una llamada: llega el gobernador (50), al que sacó del lago de niño. Plazo invertido. Giro: al niño lo aventaron al agua... el papá de Ignacio, su tío.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (muelle): Severo y Nayeli a la IZQUIERDA (junto a su canoa y sus redes); Ignacio y el gobernador a la DERECHA (del lado de la orilla).
YARD0 = ("on a wooden fishermen's dock on Lake Pátzcuaro, Michoacán @{LOC_MUELLEJANITZIO} in the cold misty morning: small wooden canoes tied along the dock, piles of fishing nets, "
         "the island of Janitzio in the distance across the calm lake, soft grey light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
NET = "an old hand-woven fishing net"
PHONE = "an old small flip phone"
SEV = ("@{SEVERO_TZINTZUN} (78-year-old Purépecha Mexican fisherman, thin, dark-brown deeply wrinkled skin, short white hair, a woven palm hat, a faded white cotton shirt)")
NAY = ("@{NAYELI_TZINTZUN} (25-year-old Mexican woman, brown skin, long straight black hair in a ponytail, a beige trench coat over a black t-shirt)")
IGN = ("@{IGNACIO_BARRAGAN} (38-year-old Mexican man, light-brown skin, gelled black hair, a thin mustache, a blue windbreaker jacket over a white polo shirt, holding a clipboard)")
GOB = ("@{GOBERNADOR_ARREOLA} (50-year-old tall Mexican man, light-brown skin, neat black hair with grey temples, clean-shaven, a dark navy suit with a white shirt and no tie)")
#@INCLUDE funcs1
# Bordes: Ignacio o el gobernador le hablan a Severo/Nayeli -> espalda LEFT; Severo o Nayeli les hablan -> espalda RIGHT.
SEV_B = "@{SEVERO_TZINTZUN} seen from behind (woven palm hat, faded white cotton shirt, thin)"
NAY_B = "@{NAYELI_TZINTZUN} seen from behind (long black ponytail, beige trench coat)"
IGN_B = "@{IGNACIO_BARRAGAN} seen from behind (gelled black hair, blue windbreaker jacket)"
GOB_B = "@{GOBERNADOR_ARREOLA} seen from behind (neat black hair with grey at the sides, dark navy suit jacket, tall)"
#@INCLUDE funcs2
#@INCLUDE d8
SL = f"standing on the LEFT on the dock beside his wooden canoe and {NET}"     # Severo
NL = "standing on the LEFT on the dock"                                        # Nayeli
IR = "standing on the RIGHT on the dock, on the shore side"                    # Ignacio
GR = "standing on the RIGHT at the end of the dock, on the shore side"         # Gobernador

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Ignacio YA hablando con su tabla en la mano; Severo de espaldas (LEFT). Plazo: antes de que salgan las canoas.
 ("c01", D8("c01"), S("c01", "Ignacio", f"Medium close-up of {IGN} {YARD0}, {IR}, talking from the very first frame, arrogant, tapping the clipboard", SEV_B, "LEFT", "arrogant, bossy, cold",
     f"Medium close-up of {IGN} {YARD}, {IR}, talking from the very first frame, arrogant", "LEFT")),
 ("c02", D8("c02"), S("c02", "Severo", f"Close-up of {SEV} {YARD0}, {SL}, calm and proud, his voice slow", IGN_B, "RIGHT", "calm, proud, slow",
     f"Close-up of {SEV} {YARD}, {SL}, calm and proud", "RIGHT")),
 ("c03", 6, talk("c03", "Ignacio", one(f"Close-up of {IGN} {YARD}, {IR}, a cold smile, he spreads his hands", "LEFT"), "cocky, cold")),
 ("r1", 6, f"Medium shot of {NAY} {YARD}, {NL}, already in place, she puts down a bag and steps forward, serious and protective, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young woman in a beige trench coat')}. Slow push-in. No dialogue."),
 ("c04", 6, S("c04", "Nayeli", f"Close-up of {NAY} {YARD0}, {NL}, firm, protective", IGN_B, "RIGHT", "firm, protective",
     f"Close-up of {NAY} {YARD}, {NL}, firm, protective", "RIGHT")),
 ("c05", 6, S("c05", "Ignacio", f"Close-up of {IGN} {YARD0}, {IR}, contemptuous, he waves her off", NAY_B, "LEFT", "contemptuous, mocking",
     f"Close-up of {IGN} {YARD}, {IR}, contemptuous", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: a man's foot in khaki trousers slowly pushes {NET} off the edge of the wooden dock and it sinks slowly into the calm grey water; only the foot, the net and the water, no face. No dialogue."),
 ("c06", 6, S("c06", "Severo", f"Close-up of {SEV} {YARD0}, {SL}, his eyes shine, hurt but dignified, he looks at the water", IGN_B, "RIGHT", "hurt, dignified, slow",
     f"Close-up of {SEV} {YARD}, {SL}, his eyes shine, dignified", "RIGHT")),
 ("c07", 6, talk("c07", "Ignacio", one(f"Close-up of {IGN} {YARD}, {IR}, he shrugs and smiles, mocking", "LEFT"), "mocking, cruel")),
 ("c08", 6, (talk("c08", "Severo", two(f"{SEV} on the LEFT and {NAY} on the RIGHT, close together on the dock {YARD0}, framed from the waist up; "
     f"Severo speaks calmly to his granddaughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Severo", "Nayeli"), "calm, firm, low"),
   talk("c08", "Severo", one(f"Close-up of {SEV} {YARD}, {SL}, calm and firm", "RIGHT"), "calm, firm, low"))),
 ("c09", 6, talk("c09", "Ignacio", one(f"Close-up of {IGN} {YARD}, {IR}, laughing, amused", "LEFT"), "mocking, amused")),
 ("i02", 6, "Wide shot of two black SUVs arriving slowly along a lakeside road by Lake Pátzcuaro, Michoacán, in the misty morning, the island of Janitzio in the distance; no people visible, no readable text, no logos. No dialogue."),
 ("r2", 6, f"Medium shot of {GOB} {YARD}, {GR}, already standing in place, he walks slowly onto the dock with a serious and powerful look, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy suit')}. Slow push-in. No dialogue."),
 ("c10", 6, S("c10", "Gobernador", f"Close-up of {GOB} {YARD0}, {GR}, respectful and warm, he bows his head slightly to the old man", SEV_B, "LEFT", "respectful, warm",
     f"Close-up of {GOB} {YARD}, {GR}, respectful and warm", "LEFT")),
 ("c11", 6, talk("c11", "Ignacio", one(f"Close-up of {IGN} {YARD}, {IR}, his smile gone, pale, he lowers the clipboard", "RIGHT"), "surprised, nervous")),
 ("c12", D8("c12"), talk("c12", "Gobernador", one(f"Close-up of {GOB} {YARD}, {GR}, cold and serious, he looks at Ignacio", "RIGHT"), "cold, serious, slow")),
 ("c13", D8("c13"), talk("c13", "Gobernador", one(f"Close-up of {GOB} {YARD}, {GR}, he points at the water, cold and final", "RIGHT"), "cold, final, slow")),
 ("r3", 6, f"Medium shot of {IGN} {YARD}, kneeling at the edge of the dock, he pulls the wet fishing net out of the lake with both hands, humiliated, "
           f"{SOLO}; {ALONE}; {NODOUBLE('man in a blue windbreaker')}. No dialogue."),
 ("c14", D8("c14"), S("c14", "Nayeli", f"Close-up of {NAY} {YARD0}, {NL}, grateful, a small smile", GOB_B, "RIGHT", "grateful, warm",
     f"Close-up of {NAY} {YARD}, {NL}, grateful", "RIGHT")),
 ("c15", D8("c15"), S("c15", "Severo", f"Close-up of {SEV} {YARD0}, {SL}, very serious, a memory in his eyes", GOB_B, "RIGHT", "serious, low, slow",
     f"Close-up of {SEV} {YARD}, {SL}, very serious", "RIGHT")),
 ("c16", D8("c16"), talk("c16", "Gobernador", one(f"Close-up of {GOB} {YARD}, {GR}, shocked, his voice low", "LEFT"), "shocked, low")),
 ("c17", 6, talk("c17", "Severo", one(f"Close-up of {SEV} {YARD}, {SL}, he slowly turns his eyes to Ignacio, grave", "RIGHT"), "grave, slow, low")),
 # CTA con carisma (después del BLACK): Severo solo, a cámara
 ("c18", 10, talk("c18", "Severo", f"Close-up from the chest up of {SEV} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts serious, makes a short pause, adjusts his palm hat, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small wise half smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("A ese niño lo aventaron al agua.", "A ese niño alguien lo dejó en el agua."), ("¿Quién me aventó, don Severo?", "¿Quién me dejó en el agua, don Severo?"),
        ("¿Ustedes perdonarían a la familia que los quiso ahogar?", "¿Ustedes perdonarían algo así a su familia?"), ("Y tú le tiras su red al agua.", "Y tú le maltratas su red."),
        ("pushes", "moves"), ("sinks slowly into the calm grey water", "rests in the water"), ("contemptuous", "cool"), ("humiliated", "quiet"), ("shocked", "surprised"),
        ("powerful", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, cold misty morning on a fishermen's dock on Lake Pátzcuaro, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, wooden dock with canoes and nets on a misty Mexican lake, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SEVERO_TZINTZUN}", "a thin very old indigenous Mexican fisherman with white hair, a woven palm hat and a faded white shirt"),
         ("@{NAYELI_TZINTZUN}", "a Mexican woman in her twenties with a long black ponytail and a beige trench coat"),
         ("@{IGNACIO_BARRAGAN}", "a Mexican man in his late thirties with gelled black hair, a thin mustache and a blue windbreaker"),
         ("@{GOBERNADOR_ARREOLA}", "a tall Mexican man around fifty with grey temples and a dark navy suit without tie"),
         (" @{LOC_MUELLEJANITZIO}", "")]
#@INCLUDE tail

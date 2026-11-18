"""Genera los clips de moro-sabinas PARTE 1 (El Moro de Sabinas, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #54 "El patrón en otro cuerpo" [CAPO] (Patronas y haciendas), cierre tipo 4 (el villano descubre que lo oyeron): en la caballeriza de su rancho en Sabinas Hidalgo,
la joven viuda Marlene (36) presume con su amante Darío (41), el administrador, que ya manda ella. Tobías (58), el caballerango contratado ayer, cepilla al Moro y sabe cosas que solo
el difunto don Rigoberto sabía. Darío se da cuenta: "este hombre oyó todo".
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (caballeriza): Marlene a la DERECHA junto a la puerta ancha; Darío frente a ella, también cerca de la puerta; Tobías a la IZQUIERDA en el establo abierto con el caballo negro.
STB0 = ("in an old wooden horse stable of a cattle ranch in Sabinas Hidalgo, Nuevo Leon @{LOC_CABALLERIZASABINAS} in the bright morning: wooden stalls, hay bales, saddles on racks, dusty sunbeams through the slats, "
        "a beautiful black horse in an open stall; no readable text, no signs, no logos")
STB = STB0 + "; nobody else in the background, no extras, nobody besides the person described"
MAR = ("@{MARLENE_SALINAS} (36-year-old Mexican woman, fair skin, long platinum-blonde wavy hair, heavy eyeliner, glossy pink lips, a fitted black satin blouse, large gold earrings)")
DAR = ("@{DARIO_LOZANO} (41-year-old Mexican man, light-brown skin, slicked-back black hair, a groomed black beard, a fitted burgundy polo shirt, a big silver belt buckle)")
TOB = ("@{TOBIAS_GUERRA} (58-year-old Mexican man, dark weathered skin, grey hair under an old straw cowboy hat, a grey mustache, calm grey eyes, a faded denim shirt with rolled sleeves)")
#@INCLUDE funcs1
MAR_B = "@{MARLENE_SALINAS} seen from behind (long platinum-blonde wavy hair, black satin blouse)"
DAR_B = "@{DARIO_LOZANO} seen from behind (slicked-back black hair, burgundy polo shirt)"
TOB_B = "@{TOBIAS_GUERRA} seen from behind (old straw cowboy hat, faded denim shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
MR = "standing on the RIGHT by the wide stable doorway"
DR = "standing near the stable doorway, facing her"
TL = "standing on the LEFT in the open stall, brushing the black horse"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Marlene YA hablando, triunfante, Darío de espaldas en el borde.
 ("c01", D8("c01"), S("c01", "Marlene", f"Medium close-up of {MAR} {STB0}, {MR}, talking from the very first frame, triumphant and smug, a satisfied smile, arms open as if the place is hers", DAR_B, "LEFT", "smug, triumphant, flirty",
     f"Medium close-up of {MAR} {STB}, {MR}, talking from the very first frame, smug and triumphant", "LEFT")),
 ("c02", 6, S("c02", "Darío", f"Close-up of {DAR} {STB0}, {DR}, a cold smug grin, leaning close to her", MAR_B, "RIGHT", "smug, cold, low",
     f"Close-up of {DAR} {STB}, {DR}, cold smug grin", "RIGHT")),
 ("c03", 6, S("c03", "Marlene", f"Close-up of {MAR} {STB0}, {MR}, playing with her gold earring, careless and pleased", DAR_B, "LEFT", "careless, pleased, low",
     f"Close-up of {MAR} {STB}, {MR}, careless and pleased", "LEFT")),
 ("c04", 6, S("c04", "Darío", f"Close-up of {DAR} {STB0}, {DR}, he takes her hand, a greedy satisfied smile, voice low", MAR_B, "RIGHT", "greedy, satisfied, low",
     f"Close-up of {DAR} {STB}, {DR}, greedy satisfied smile", "RIGHT")),
 ("c05", 6, S("c05", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, without stopping the slow brushing, calm, eyes on the horse, then on her", MAR_B, "RIGHT", "calm, quiet, knowing",
     f"Close-up of {TOB} {STB}, {TL}, calm, brushing the horse", "RIGHT")),
 ("c06", 6, S("c06", "Darío", f"Close-up of {DAR} {STB0}, {DR}, letting go of her hand, turning sharply toward the stall, annoyed and arrogant", TOB_B, "LEFT", "arrogant, annoyed, sharp",
     f"Close-up of {DAR} {STB}, {DR}, annoyed and arrogant", "LEFT")),
 ("c07", 6, S("c07", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, he touches the brim of his straw hat politely, serene", DAR_B, "RIGHT", "polite, serene, simple",
     f"Close-up of {TOB} {STB}, {TL}, polite, touching his hat", "RIGHT")),
 ("c08", 6, S("c08", "Marlene", f"Close-up of {MAR} {STB0}, {MR}, her smile frozen, nervous, glancing at Darío and back at the old man", TOB_B, "LEFT", "nervous, sharp, tense",
     f"Close-up of {MAR} {STB}, {MR}, nervous, smile frozen", "LEFT")),
 ("c09", 6, S("c09", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, calm, a hint of a smile, patting the black horse", MAR_B, "RIGHT", "calm, dry, polite",
     f"Close-up of {TOB} {STB}, {TL}, calm, patting the horse", "RIGHT")),
 ("c10", 6, S("c10", "Marlene", f"Close-up of {MAR} {STB0}, {MR}, her smile gone, suspicious, narrowing her eyes at the old man", TOB_B, "LEFT", "suspicious, tense, cold",
     f"Close-up of {MAR} {STB}, {MR}, suspicious, smile gone", "LEFT")),
 ("c11", D8("c11"), S("c11", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, he looks around the old stable with quiet nostalgia", MAR_B, "RIGHT", "quiet, nostalgic, calm",
     f"Close-up of {TOB} {STB}, {TL}, quiet nostalgia", "RIGHT")),
 ("c12", 6, S("c12", "Darío", f"Close-up of {DAR} {STB0}, {DR}, a scornful laugh, stepping toward the stall", TOB_B, "LEFT", "dismissive, arrogant, cold",
     f"Close-up of {DAR} {STB}, {DR}, dismissive laugh", "LEFT")),
 ("c13", D8("c13"), S("c13", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, holding Darío's gaze calmly, a small pause before the last words", DAR_B, "RIGHT", "calm, meaningful, steady",
     f"Close-up of {TOB} {STB}, {TL}, holding the gaze calmly", "RIGHT")),
 ("c14", 6, S("c14", "Darío", f"Close-up of {DAR} {STB0}, {DR}, irritated, rolling up his sleeves, walking toward the black horse", TOB_B, "LEFT", "irritated, proud, challenging",
     f"Close-up of {DAR} {STB}, {DR}, irritated, walking toward the horse", "LEFT")),
 ("r1", 6, f"Medium shot {STB}: {DAR} reaches for the halter of the black horse in the open stall; the horse snorts, tosses its head and steps back away from him, refusing him, nobody is hurt; {TOB} stands calmly beside the horse; only these two people. No dialogue."),
 ("c15", D8("c15"), S("c15", "Tobías", f"Close-up of {TOB} {STB0}, {TL}, he strokes the black horse's neck gently and speaks softly, a small pause before the last words, a calm knowing look", DAR_B, "RIGHT", "soft, calm, meaningful",
     f"Close-up of {TOB} {STB}, {TL}, stroking the horse, soft and knowing", "RIGHT")),
 ("r2", 6, one(f"Medium close-up of {TOB} {STB}, {TL}, he whispers something into the black horse's ear and the horse lowers its head, completely calm", "RIGHT") + " No dialogue."),
 ("c16", 6, S("c16", "Marlene", f"Close-up of {MAR} {STB0}, {MR}, pale, she grabs Darío's arm and whispers, frightened", DAR_B, "LEFT", "whispering, worried, tense",
     f"Close-up of {MAR} {STB}, {MR}, whispering, worried", "LEFT")),
 ("c17", 6, S("c17", "Darío", f"Close-up of {DAR} {STB0}, {DR}, the grin gone, he leans to her and whispers, tense, without taking his eyes off the old man", MAR_B, "RIGHT", "whispering, tense, alarmed",
     f"Close-up of {DAR} {STB}, {DR}, whispering, tense", "RIGHT")),
 ("r3", 6, one(f"Close-up of {MAR} {STB}, {MR}, frozen, the color drains from her face, she slowly turns her head toward the stall, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("r4", 6, one(f"Close-up of {TOB} {STB}, {TL}, he keeps brushing the black horse slowly, then lifts his calm grey eyes to them, a tiny knowing smile under the mustache, silent", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Tobías a cámara
 ("c18", 10, talk("c18", "Tobías", f"Close-up from the chest up of {TOB} {STB}, standing by the black horse, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, pats the horse's neck, adjusts his straw hat, raises one eyebrow, "
     f"tilts his head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("smug, triumphant, flirty", "smug, pleased"), ("whispering, tense, alarmed", "whispering, tense"), ("the color drains from her face", "her expression changes"), ("alarmed", "worried"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, bright morning sunbeams in an old wooden horse stable on a ranch in northern Mexico, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, ranch horse stable with a black horse in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{MARLENE_SALINAS}", "a Mexican woman in her thirties with long platinum-blonde wavy hair, a black satin blouse and gold earrings"),
         ("@{DARIO_LOZANO}", "a Mexican man around forty with slicked-back black hair, a groomed beard and a burgundy polo shirt"),
         ("@{TOBIAS_GUERRA}", "an older Mexican stable hand with a grey mustache, an old straw cowboy hat and a faded denim shirt"),
         (" @{LOC_CABALLERIZASABINAS}", "")]
#@INCLUDE tail

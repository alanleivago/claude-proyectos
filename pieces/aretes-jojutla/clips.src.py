"""Genera los clips de aretes-jojutla PARTE 1 (Los Aretes de Jojutla, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #47 "La matriarca y los tres capataces" [CAPO] (Patronas y haciendas), cierre tipo 7 (objeto que delata): en el corredor de su hacienda arrocera en Jojutla,
la temida matriarca Leonarda (67) interroga a Abel (33), que llegó con sus dos hermanos a pedir trabajo. Su hija Isadora (28) lo defiende. Abel cuenta que su hermana trabajó ahí
y dejó de escribirles; Leonarda dice no acordarse. Isadora se acomoda el pelo y Abel ve sus aretes de filigrana: "Esos aretes… yo se los regalé a Lucía".
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (corredor): Leonarda a la DERECHA junto a los arcos; Isadora a la DERECHA un paso detrás de su madre, junto a la banca; Abel a la IZQUIERDA, sombrero en mano.
COR0 = ("in the wide corridor of the main house of an old rice hacienda in Jojutla, Morelos @{LOC_HACIENDAJOJUTLA} in the bright mid-morning: thick ochre stone arches, red clay tile floor, potted ferns and bougainvillea, "
        "green rice fields and tall palm trees beyond the arches; no readable text, no signs, no logos")
COR = COR0 + "; nobody else in the background, no extras, nobody besides the person described"
LEO = ("@{LEONARDA_MONTOYA} (67-year-old Mexican woman, tanned skin, grey-streaked black hair in a thick braided crown, hard dark eyes, a dark-green dress with a black shawl, a small silver cross necklace)")
ISA = ("@{ISADORA_MONTOYA} (28-year-old Mexican woman, light-brown skin, long wavy black hair loose over one shoulder, soft brown eyes, a white linen blouse, long silver filigree teardrop earrings)")
ABE = ("@{ABEL_CORTES} (33-year-old Mexican man, dark-brown skin, short black hair, a thin black mustache, serious dark eyes, a faded denim work shirt with rolled sleeves, a straw cowboy hat in his hand)")
#@INCLUDE funcs1
LEO_B = "@{LEONARDA_MONTOYA} seen from behind (grey-streaked black braided crown, black shawl over a dark-green dress)"
ISA_B = "@{ISADORA_MONTOYA} seen from behind (long wavy black hair, white linen blouse)"
ABE_B = "@{ABEL_CORTES} seen from behind (short black hair, faded denim work shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
LR = "standing on the RIGHT by the stone arches"
IR = "standing on the RIGHT a step behind her mother, by the wooden bench"
AL = "standing on the LEFT, holding his straw cowboy hat in front of him"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Leonarda YA hablando, seca, Abel de espaldas en el borde.
 ("c01", 6, S("c01", "Leonarda", f"Medium close-up of {LEO} {COR0}, {LR}, talking from the very first frame, dry and hard, looking him up and down", ABE_B, "LEFT", "dry, hard, suspicious",
     f"Medium close-up of {LEO} {COR}, {LR}, talking from the very first frame, dry and hard", "LEFT")),
 ("c02", D8("c02"), S("c02", "Abel", f"Close-up of {ABE} {COR0}, {AL}, respectful but steady, holding her gaze", LEO_B, "RIGHT", "respectful, steady, serious",
     f"Close-up of {ABE} {COR}, {AL}, respectful but steady", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Leonarda", f"Close-up of {LEO} {COR0}, {LR}, eyes narrowing, a cold sideways look", ABE_B, "LEFT", "cold, distrustful, cutting",
     f"Close-up of {LEO} {COR}, {LR}, eyes narrowing", "LEFT")),
 ("c04", 6, S("c04", "Isadora", f"Close-up of {ISA} {COR0}, {IR}, stepping forward gently, a soft voice toward her mother", LEO_B, "RIGHT", "soft, gentle, persuasive",
     f"Close-up of {ISA} {COR}, {IR}, soft voice", "RIGHT")),
 ("c05", 6, S("c05", "Leonarda", f"Close-up of {LEO} {COR0}, {LR}, turning her head sharply to her daughter, stern", ISA_B, "LEFT", "stern, sharp, controlling",
     f"Close-up of {LEO} {COR}, {LR}, stern, turning her head sharply", "LEFT")),
 ("c06", D8("c06"), S("c06", "Abel", f"Close-up of {ABE} {COR0}, {AL}, quiet and serious, a short pause before the last words, his grip tightening on his hat", LEO_B, "RIGHT", "quiet, serious, heavy",
     f"Close-up of {ABE} {COR}, {AL}, quiet and serious", "RIGHT")),
 ("c07", 6, S("c07", "Leonarda", f"Close-up of {LEO} {COR0}, {LR}, a flicker of unease behind her hard face, she raises her chin", ABE_B, "LEFT", "guarded, curt, uneasy",
     f"Close-up of {LEO} {COR}, {LR}, guarded, chin raised", "LEFT")),
 ("c08", 6, S("c08", "Abel", f"Close-up of {ABE} {COR0}, {AL}, he looks straight at her, voice low and controlled, sadness in his eyes", LEO_B, "RIGHT", "low, controlled, sad",
     f"Close-up of {ABE} {COR}, {AL}, low and controlled, sad eyes", "RIGHT")),
 ("c09", D8("c09"), S("c09", "Leonarda", f"Close-up of {LEO} {COR0}, {LR}, cold, too quick, she looks away toward the rice fields as she answers", ABE_B, "LEFT", "cold, quick, evasive",
     f"Close-up of {LEO} {COR}, {LR}, cold, looking away", "LEFT")),
 ("r1", 6, one(f"Medium close-up of {ISA} {COR}, {IR}, she tucks her long hair behind her ear with one hand, revealing a long silver filigree teardrop earring that catches the sunlight", "LEFT") + " No dialogue."),
 ("i01", 6, f"Extreme close-up insert {COR0}: a long silver filigree teardrop earring hanging from a young woman's ear, glinting in the sunlight, strands of wavy black hair; no full face, no readable text. No dialogue."),
 ("c10", 6, S("c10", "Abel", f"Close-up of {ABE} {COR0}, {AL}, frozen, staring at the young woman's earring, his voice barely a whisper, his eyes wet", ISA_B, "RIGHT", "whispering, shaken, stunned",
     f"Close-up of {ABE} {COR}, {AL}, frozen, whispering, eyes wet", "RIGHT")),
 ("r2", 6, one(f"Close-up of {LEO} {COR}, {LR}, completely still, her hard face goes pale, her hand slowly closes on her black shawl, her eyes locked on him", "LEFT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Abel a cámara
 ("c11", 10, talk("c11", "Abel", f"Close-up from the chest up of {ABE} {COR}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, his lips moving clearly; he starts calm, makes a short pause, turns his straw hat slowly in his hands, raises one eyebrow, gestures with one open hand, "
     f"tilts his head, nods slowly and gives a small knowing look. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("whispering, shaken, stunned", "whispering, stunned"), ("cold, distrustful, cutting", "cold, distrustful"), ("goes pale", "changes"), ("shaken", "moved"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, bright mid-morning light in the stone corridor of a rice hacienda in Morelos, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, hacienda corridor with stone arches and rice fields in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{LEONARDA_MONTOYA}", "a stern Mexican woman in her late sixties with a grey-streaked black braided crown and a black shawl over a dark-green dress"),
         ("@{ISADORA_MONTOYA}", "a Mexican woman in her late twenties with long wavy black hair, a white linen blouse and long silver filigree earrings"),
         ("@{ABEL_CORTES}", "a Mexican man in his early thirties with a thin black mustache, a faded denim work shirt and a straw cowboy hat in his hand"),
         (" @{LOC_HACIENDAJOJUTLA}", "")]
#@INCLUDE tail

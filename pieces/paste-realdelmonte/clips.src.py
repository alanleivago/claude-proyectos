"""Genera los clips de paste-realdelmonte PARTE 1 (El Paste de Real del Monte, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra-justicia transformada (ranking2): en una pastería de Real del Monte, Hidalgo, Karla (40) tiene a su hijastra Daniela (23) amasando sola desde las cuatro mientras ella está en el sillón;
Rogelio (52) llega antes, ve el rodillo de su difunta Elvira en la basura y la corre "antes de que salga el turno de la mina".
Giro: Rogelio firmó sin saber y el local ya está a nombre de Karla.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (pastería): de izquierda a derecha Daniela (en la mesa de amasar), Rogelio (de pie en medio, entra por la puerta), Karla (en el sillón de la salita; desde c05 de pie junto al sillón).
YARD0 = ("inside a small family paste bakery in Real del Monte, Hidalgo @{LOC_PASTERIA} on a cold foggy morning: a long wooden kneading table covered in flour, an old brick oven, a glass display case, "
         "a doorway to a small living room with a worn sofa, a window to a misty hillside town, warm lamp light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PIN = "an old carved wooden rolling pin"
PHONE = "a smartphone"
DAN = ("@{DANIELA_ROMERO} (23-year-old Mexican woman, light skin with rosy cheeks, brown hair in a messy bun, a grey wool sweater with rolled-up sleeves, a white apron dusted with flour)")
ROG = ("@{ROGELIO_ROMERO} (52-year-old Mexican man, stocky, light-brown skin, short black-and-grey hair, a black beard with grey, a dark-blue quilted work jacket, a grey knitted beanie)")
KAR = ("@{KARLA_MONTIEL} (40-year-old Mexican woman, light skin, wavy platinum-blonde dyed hair, long pink acrylic nails, a pink satin robe over pajamas)")
#@INCLUDE funcs1
# Bordes: orden fijo D - R - K. Karla o Rogelio le hablan a Daniela -> espalda de ella LEFT; Daniela le habla a Rogelio o Karla -> espalda RIGHT;
# Rogelio le habla a Karla -> espalda de ella RIGHT; Karla le habla a Rogelio -> espalda de él LEFT.
DAN_B = "@{DANIELA_ROMERO} seen from behind (brown hair in a messy bun, grey wool sweater, white apron strings)"
ROG_B = "@{ROGELIO_ROMERO} seen from behind (grey knitted beanie, dark-blue quilted work jacket, stocky)"
KAR_B = "@{KARLA_MONTIEL} seen from behind (wavy platinum-blonde hair, pink satin robe)"
#@INCLUDE funcs2
#@INCLUDE d8
DL = "standing on the LEFT at the long wooden kneading table, her hands in the dough"      # Daniela
DS = "standing on the LEFT beside the kneading table"                                      # Daniela quieta
RC = "standing in the middle of the bakery"                                                # Rogelio
KS = f"lounging on a worn sofa on the RIGHT in the small living room, holding {PHONE}"      # Karla en el sillón
KR = "standing on the RIGHT beside the worn sofa"                                          # Karla de pie

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Karla YA hablando desde el sillón con el celular; Daniela de espaldas (LEFT) amasando. Plazo: antes de que salga el turno de la mina.
 ("c01", D8("c01"), S("c01", "Karla", f"Medium close-up of {KAR} {YARD0}, {KS}, talking from the very first frame, bossy, she barely looks up from the phone", DAN_B, "LEFT", "bossy, lazy, arrogant",
     f"Medium close-up of {KAR} {YARD}, {KS}, talking from the very first frame, bossy", "LEFT")),
 ("c02", D8("c02"), talk("c02", "Daniela", one(f"Close-up of {DAN} {YARD}, {DL}, tired but firm, flour on her cheek, she raises her eyes", "RIGHT"), "tired, firm")),
 ("c03", D8("c03"), S("c03", "Karla", f"Close-up of {KAR} {YARD0}, {KS}, a lazy smile, she scrolls the phone", DAN_B, "LEFT", "lazy, mocking",
     f"Close-up of {KAR} {YARD}, {KS}, a lazy smile", "LEFT")),
 ("r1", 6, f"Medium shot of {ROG} {YARD}, standing in the open front door of the bakery, already in place, cold fog behind him, he stops and slowly pulls off his beanie, serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a blue work jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, serious, his jaw tight", "RIGHT"), "serious, firm, controlled")),
 ("c05", 6, S("c05", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, she has just jumped up from the sofa, a big nervous smile, she closes her robe", ROG_B, "LEFT", "nervous, sweet, fake",
     f"Close-up of {KAR} {YARD}, {KR}, a big nervous smile", "LEFT")),
 ("c06", 6, S("c06", "Daniela", f"Close-up of {DAN} {YARD0}, {DL}, a shy tired smile", ROG_B, "RIGHT", "soft, shy, tired",
     f"Close-up of {DAN} {YARD}, {DL}, a shy tired smile", "RIGHT")),
 ("c07", 6, (talk("c07", "Rogelio", two(f"{DAN} on the LEFT at the floury kneading table and {ROG} on the RIGHT beside her, gently brushing flour off her cheek with his thumb {YARD0}, "
     f"framed from the waist up; Rogelio, worried and tender, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rogelio", "Daniela"), "worried, tender, low"),
   talk("c07", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, worried and tender, looking down", "LEFT"), "worried, tender, low"))),
 ("c08", 6, talk("c08", "Karla", one(f"Close-up of {KAR} {YARD}, {KR}, she waves one hand with a fake laugh", "LEFT"), "dismissive, fake, light")),
 ("r2", 6, one(f"Close-up of {ROG} {YARD}, {RC}, in silence, he looks down into a trash bin and sees {PIN} inside, his face darkens", "RIGHT") + " Slow push-in. No dialogue."),
 ("c09", 6, S("c09", "Rogelio", f"Close-up of {ROG} {YARD0}, {RC}, serious, his voice low, he gestures toward the trash bin", KAR_B, "RIGHT", "serious, low, suspicious",
     f"Close-up of {ROG} {YARD}, {RC}, serious, his voice low", "RIGHT")),
 ("c10", 6, S("c10", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, she shrugs, looking at her long nails", ROG_B, "LEFT", "cool, careless",
     f"Close-up of {KAR} {YARD}, {KR}, she shrugs, cool", "LEFT")),
 ("r3", 6, one(f"Close-up of {DAN} {YARD}, {DL}, in silence, she stops kneading, her eyes shine, she presses her lips together", "RIGHT") + " Slow push-in. No dialogue."),
 ("c11", D8("c11"), S("c11", "Daniela", f"Close-up of {DAN} {YARD0}, {DL}, her eyes shine, her voice breaks a little", KAR_B, "RIGHT", "hurt, sad, firm",
     f"Close-up of {DAN} {YARD}, {DL}, her eyes shine", "RIGHT")),
 ("c12", D8("c12"), S("c12", "Rogelio", f"Close-up of {ROG} {YARD0}, {RC}, holding {PIN} in both hands, cold and serious", KAR_B, "RIGHT", "cold, serious, slow",
     f"Close-up of {ROG} {YARD}, {RC}, holding {PIN}, cold and serious", "RIGHT")),
 ("c13", 6, talk("c13", "Karla", one(f"Close-up of {KAR} {YARD}, {KR}, she rolls her eyes and crosses her arms", "LEFT"), "careless, cold, mocking")),
 ("c14", D8("c14"), talk("c14", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, disappointed, his eyes hard", "RIGHT"), "disappointed, firm, slow")),
 ("c15", 6, S("c15", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, defiant, her chin up", ROG_B, "LEFT", "defiant, mocking",
     f"Close-up of {KAR} {YARD}, {KR}, defiant, her chin up", "LEFT")),
 ("c16", D8("c16"), S("c16", "Rogelio", f"Close-up of {ROG} {YARD0}, {RC}, firm and calm, he gestures slowly toward the front door", KAR_B, "RIGHT", "firm, calm, final",
     f"Close-up of {ROG} {YARD}, {RC}, firm and calm", "RIGHT")),
 ("i01", 6, f"Close-up insert {YARD0}: a metal tray of golden baked pastes steaming on the floury wooden table in the warm lamp light; only the pastes and the table, no people. No dialogue."),
 ("c17", D8("c17"), talk("c17", "Karla", one(f"Close-up of {KAR} {YARD}, {KR}, a slow knowing smile spreads on her face", "LEFT"), "sly, amused, slow")),
 ("c18", 6, talk("c18", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, firm, but a shadow of doubt in his eyes", "RIGHT"), "firm, uneasy")),
 ("c19", 6, S("c19", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, she leans in slightly and smiles, enjoying it", ROG_B, "LEFT", "sly, low, slow",
     f"Close-up of {KAR} {YARD}, {KR}, she smiles, enjoying it", "LEFT")),
 ("r4", 6, f"Medium shot of {DAN} {YARD}, {DS}, she slowly steps back from the table, surprised, her floury hands raised a little, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a grey sweater')}. Slow push-in. No dialogue."),
 ("c20", 6, talk("c20", "Daniela", one(f"Close-up of {DAN} {YARD}, {DS}, surprised and hurt, her voice small", "RIGHT"), "surprised, soft, hurt")),
 ("c21", 6, talk("c21", "Rogelio", one(f"Close-up of {ROG} {YARD}, {RC}, pale, his voice low, he looks at his daughter", "LEFT"), "low, ashamed, pleading")),
 ("c22", 6, S("c22", "Karla", f"Close-up of {KAR} {YARD0}, {KR}, a cruel little smile, she looks at the daughter", DAN_B, "LEFT", "cruel, sweet, slow",
     f"Close-up of {KAR} {YARD}, {KR}, a little smile", "LEFT")),
 # CTA con carisma (después del BLACK): Daniela sola, a cámara
 ("c23", 10, talk("c23", "Daniela", f"Close-up from the chest up of {DAN} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, wipes flour off her cheek with the back of her hand, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small sad half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("Amasar no mata a nadie.", "Amasar no le hace daño a nadie."), ("¿Correrme por tu hijita?", "¿Sacarme por tu hija?"),
        ("No para que mi hija fuera tu sirvienta.", "No para que mi hija hiciera todo sola."), ("Te lo juro por tu madre.", "Créeme, mija."),
        ("a cruel little smile", "a little smile"), ("his face darkens", "he becomes serious"), ("enjoying it", "calm"), ("fake", "polite"),
        ("ashamed", "quiet"), ("her voice breaks a little", "softly"), ("trash bin", "corner"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm lamp light inside a small paste bakery on a cold foggy morning in Hidalgo, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, small rustic bakery with a floury wooden kneading table in a Mexican mountain town, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{DANIELA_ROMERO}", "a Mexican woman in her twenties with brown hair in a messy bun, a grey sweater and a floury white apron"),
         ("@{ROGELIO_ROMERO}", "a stocky Mexican man in his fifties with a greying beard, a dark-blue quilted jacket and a grey beanie"),
         ("@{KARLA_MONTIEL}", "a Mexican woman in her forties with wavy platinum-blonde hair, long pink nails and a pink satin robe"),
         (" @{LOC_PASTERIA}", "")]
#@INCLUDE tail

"""Genera los clips de mole-atocpan PARTE 1 (El Mole de Atocpan, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Madrastra-justicia transformada (ranking2): en San Pedro Atocpan, Mónica (43) tiene a su hijastra Xóchitl (24) moliendo chiles desde las tres y vende el mole de la difunta Rosario con su
propio nombre; Gonzalo (56) llega y la corre "antes de que abra la feria". Giro: la marca del mole ya está registrada a nombre de Mónica; la firmó Patricia, la hija mayor.
Copia del clips.py de jaiba-lagunamadre (diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas). Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (cocina): de izquierda a derecha Xóchitl (en el metate), Gonzalo (en medio, entra por la puerta), Mónica (junto a la puerta de la salita).
YARD0 = ("in the traditional mole kitchen of a family house in San Pedro Atocpan, Mexico City @{LOC_COCINAMOLE} at dawn: a huge clay pot of dark mole on a wood fire, a stone metate with dried chiles, "
         "baskets of chiles, blue Talavera tiled counters, a doorway to a small living room, warm firelight; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
PHONE = "a smartphone"
XOC = ("@{XOCHITL_LUNA} (24-year-old Mexican woman, brown skin, long black hair in two braids, a mustard-yellow blouse, a dark-red apron stained with mole)")
GON = ("@{GONZALO_LUNA} (56-year-old Mexican man, stocky, light-brown skin, short grey hair, a grey mustache, a brown leather jacket over a white t-shirt)")
MON = ("@{MONICA_SALGADO} (43-year-old Mexican woman, light skin, wavy dyed caramel-blonde hair, red lipstick, a tight emerald-green satin blouse, white trousers, a gold necklace)")
#@INCLUDE funcs1
# Bordes: orden fijo X - G - M. Mónica o Gonzalo le hablan a Xóchitl -> espalda de ella LEFT; Xóchitl le habla a Gonzalo o Mónica -> espalda RIGHT;
# Gonzalo le habla a Mónica -> espalda de ella RIGHT; Mónica le habla a Gonzalo -> espalda de él LEFT.
XOC_B = "@{XOCHITL_LUNA} seen from behind (long black hair in two braids, mustard-yellow blouse, dark-red apron strings)"
GON_B = "@{GONZALO_LUNA} seen from behind (short grey hair, brown leather jacket, stocky)"
MON_B = "@{MONICA_SALGADO} seen from behind (wavy caramel-blonde hair, emerald-green satin blouse)"
#@INCLUDE funcs2
#@INCLUDE d8
XL = "kneeling on the LEFT at the stone metate, grinding dried chiles"     # Xóchitl en el metate
XS = "standing on the LEFT beside the stone metate"                        # Xóchitl de pie
GC = "standing in the middle of the kitchen"                               # Gonzalo
MR = f"standing on the RIGHT in the doorway to the living room, holding {PHONE}"   # Mónica

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Mónica YA hablando en la puerta con el celular; Xóchitl de espaldas (LEFT) moliendo.
 ("c01", D8("c01"), S("c01", "Mónica", f"Medium close-up of {MON} {YARD0}, {MR}, talking from the very first frame, bossy, she barely looks up from the phone", XOC_B, "LEFT", "bossy, cold, arrogant",
     f"Medium close-up of {MON} {YARD}, {MR}, talking from the very first frame, bossy", "LEFT")),
 ("c02", D8("c02"), talk("c02", "Xóchitl", one(f"Close-up of {XOC} {YARD}, {XL}, tired, chile dust on her hands, she raises her eyes", "RIGHT"), "tired, firm, hurt")),
 ("c03", D8("c03"), S("c03", "Mónica", f"Close-up of {MON} {YARD0}, {MR}, a cold smile", XOC_B, "LEFT", "cold, mocking",
     f"Close-up of {MON} {YARD}, {MR}, a cold smile", "LEFT")),
 ("r1", 6, f"Medium shot of {GON} {YARD}, standing in the kitchen doorway from the patio, already in place, he stops and looks around, serious, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a brown leather jacket')}. Slow push-in. No dialogue."),
 ("c04", 6, talk("c04", "Xóchitl", one(f"Close-up of {XOC} {YARD}, {XL}, her eyes shine, indignant", "RIGHT"), "hurt, indignant")),
 ("c05", D8("c05"), talk("c05", "Gonzalo", one(f"Close-up of {GON} {YARD}, {GC}, serious, his jaw tight", "RIGHT"), "serious, firm")),
 ("c06", D8("c06"), S("c06", "Mónica", f"Close-up of {MON} {YARD0}, {MR}, a big nervous smile, she hides the phone", GON_B, "LEFT", "nervous, sweet, fake",
     f"Close-up of {MON} {YARD}, {MR}, a big nervous smile", "LEFT")),
 ("c07", D8("c07"), S("c07", "Xóchitl", f"Close-up of {XOC} {YARD0}, {XS}, she stands up, her eyes shine, firm", GON_B, "RIGHT", "firm, hurt, emotional",
     f"Close-up of {XOC} {YARD}, {XS}, firm, her eyes shine", "RIGHT")),
 ("c08", D8("c08"), S("c08", "Gonzalo", f"Close-up of {GON} {YARD0}, {GC}, serious, his voice low", MON_B, "RIGHT", "serious, low, suspicious",
     f"Close-up of {GON} {YARD}, {GC}, serious, his voice low", "RIGHT")),
 ("c09", 6, S("c09", "Mónica", f"Close-up of {MON} {YARD0}, {MR}, she shrugs, cool", GON_B, "LEFT", "cool, careless",
     f"Close-up of {MON} {YARD}, {MR}, she shrugs, cool", "LEFT")),
 ("i01", 6, f"Close-up insert {YARD0}: the huge clay pot of dark mole bubbling slowly on the wood fire, a wooden spoon resting on its edge; only the pot and the fire, no people. No dialogue."),
 ("c10", 6, talk("c10", "Gonzalo", one(f"Close-up of {GON} {YARD}, {GC}, disappointed, his eyes hard", "RIGHT"), "disappointed, cold")),
 ("c11", 6, S("c11", "Mónica", f"Close-up of {MON} {YARD0}, {MR}, defiant, her chin up", GON_B, "LEFT", "defiant, mocking",
     f"Close-up of {MON} {YARD}, {MR}, defiant", "LEFT")),
 ("c12", D8("c12"), S("c12", "Gonzalo", f"Close-up of {GON} {YARD0}, {GC}, firm and calm, he points at the door", MON_B, "RIGHT", "firm, calm, final",
     f"Close-up of {GON} {YARD}, {GC}, firm and calm", "RIGHT")),
 ("r2", 6, one(f"Close-up of {XOC} {YARD}, {XS}, in silence, a small hopeful smile through shining eyes", "RIGHT") + " Slow push-in. No dialogue."),
 ("c13", D8("c13"), talk("c13", "Mónica", one(f"Close-up of {MON} {YARD}, {MR}, a slow knowing smile, she raises her phone showing the screen", "LEFT"), "sly, amused, slow")),
 ("c14", 6, talk("c14", "Gonzalo", one(f"Close-up of {GON} {YARD}, {GC}, surprised and uneasy", "RIGHT"), "surprised, uneasy")),
 ("c15", 6, S("c15", "Mónica", f"Close-up of {MON} {YARD0}, {MR}, she leans in, enjoying it", GON_B, "LEFT", "sly, low, slow",
     f"Close-up of {MON} {YARD}, {MR}, enjoying it", "LEFT")),
 ("r3", 6, one(f"Close-up of {GON} {YARD}, {GC}, in silence, stunned, he slowly sits down on a wooden chair", "RIGHT") + " Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Xóchitl", one(f"Close-up of {XOC} {YARD}, {XS}, stunned and hurt, her voice small", "RIGHT"), "stunned, hurt, soft")),
 # CTA con carisma (después del BLACK): Xóchitl sola, a cámara
 ("c17", 10, talk("c17", "Xóchitl", f"Close-up from the chest up of {XOC} {YARD}, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, moves one braid over her shoulder, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small brave half smile. Nobody else around.",
     "charismatic, sincere, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("¿Correrme por una olla de mole?", "¿Sacarme por una olla de mole?"), ("Y tú lo vendes con tu cara.", "Y tú lo vendes como tuyo."),
        ("enjoying it", "calm"), ("fake", "polite"), ("stunned", "surprised"), ("defiant", "confident"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm firelight in a traditional mole kitchen at dawn in Mexico City, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, rustic Mexican kitchen with a clay pot of mole and a stone metate, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{XOCHITL_LUNA}", "a young Mexican woman with two long black braids, a mustard-yellow blouse and a dark-red apron"),
         ("@{GONZALO_LUNA}", "a stocky Mexican man in his fifties with short grey hair, a grey mustache and a brown leather jacket"),
         ("@{MONICA_SALGADO}", "a Mexican woman in her forties with wavy caramel-blonde hair, red lipstick and an emerald-green satin blouse"),
         (" @{LOC_COCINAMOLE}", "")]
#@INCLUDE tail

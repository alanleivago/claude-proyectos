"""Genera los clips de vendimia-ensenada PARTE 1 (La Vendimia de Ensenada, VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
CATALOGO.md #55 "La capataz contra su padre" [CAPO] (Patronas y haciendas), cierre tipo 6 (mirada muda entre dos personajes): en el viñedo del Valle de Guadalupe, Fernanda (34) dirige la vendimia;
su padre don Silvestre (66) va a entregar el viñedo a un socio italiano. Ella se le planta. Llega el socio, Luca Ferrante (40): se quita los lentes y él y Fernanda se quedan mirándose en silencio.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (viñedo): Silvestre a la DERECHA junto a las cajas de cosecha; Fernanda a la IZQUIERDA entre las vides; Luca llega por la DERECHA desde la bodega de piedra.
YARD0 = ("in a vineyard of a wine estate in the Valle de Guadalupe, Ensenada, Baja California @{LOC_VINEDOENSENADA} in the golden late afternoon: long rows of green grapevines heavy with dark grapes, "
         "dry pale earth, wooden harvest crates, a stone winery with a terracotta roof in the background, dry golden hills, warm light; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
SIL = ("@{SILVESTRE_LARREA} (66-year-old Mexican man, tanned light skin, thick white hair combed back, a trimmed white beard, a cream linen shirt under a dark-green quilted vest, a panama hat)")
FER = ("@{FERNANDA_LARREA} (34-year-old Mexican woman, light-brown skin, dark-brown hair in a loose low bun with a few strands falling, small gold earrings, a rust-colored work shirt with rolled cuffs)")
LUC = ("@{LUCA_FERRANTE} (40-year-old Italian man, olive skin, wavy dark hair greying at the temples, a short neat beard, a light-grey linen suit with a white open-collar shirt)")
#@INCLUDE funcs1
SIL_B = "@{SILVESTRE_LARREA} seen from behind (panama hat, dark-green quilted vest over a cream shirt)"
FER_B = "@{FERNANDA_LARREA} seen from behind (dark-brown hair in a loose low bun, rust-colored work shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
SR = "standing on the RIGHT by the wooden harvest crates"
FL = "standing on the LEFT between the grapevines"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Fernanda YA hablando, desafiante, Silvestre de espaldas en el borde.
 ("c01", 6, S("c01", "Fernanda", f"Medium close-up of {FER} {YARD0}, {FL}, talking from the very first frame, defiant, pointing at a folded contract in her father's hand", SIL_B, "RIGHT", "defiant, firm, intense",
     f"Medium close-up of {FER} {YARD}, {FL}, talking from the very first frame, defiant", "RIGHT")),
 ("c02", 6, S("c02", "Silvestre", f"Close-up of {SIL} {YARD0}, {SR}, stern and offended, holding a folded contract", FER_B, "LEFT", "stern, offended, authoritarian",
     f"Close-up of {SIL} {YARD}, {SR}, stern, holding a folded contract", "LEFT")),
 ("c03", D8("c03"), S("c03", "Fernanda", f"Close-up of {FER} {YARD0}, {FL}, proud, she touches a bunch of dark grapes on the vine beside her", SIL_B, "RIGHT", "proud, sharp, confident",
     f"Close-up of {FER} {YARD}, {FL}, proud, touching a bunch of grapes", "RIGHT")),
 ("c04", D8("c04"), S("c04", "Silvestre", f"Close-up of {SIL} {YARD0}, {SR}, condescending, a satisfied smile, tapping the contract against his palm", FER_B, "LEFT", "condescending, pleased",
     f"Close-up of {SIL} {YARD}, {SR}, a satisfied smile", "LEFT")),
 ("c05", 6, S("c05", "Fernanda", f"Close-up of {FER} {YARD0}, {FL}, hurt and ironic, a bitter laugh", SIL_B, "RIGHT", "ironic, hurt, sharp",
     f"Close-up of {FER} {YARD}, {FL}, hurt and ironic", "RIGHT")),
 ("c06", D8("c06"), S("c06", "Silvestre", f"Close-up of {SIL} {YARD0}, {SR}, paternal but dismissive, he shakes his head slowly", FER_B, "LEFT", "paternal, dismissive, firm",
     f"Close-up of {SIL} {YARD}, {SR}, shaking his head slowly", "LEFT")),
 ("c07", 6, S("c07", "Fernanda", f"Close-up of {FER} {YARD0}, {FL}, eyes wet, voice low and cutting", SIL_B, "RIGHT", "low, cutting, emotional",
     f"Close-up of {FER} {YARD}, {FL}, eyes wet, voice low", "RIGHT")),
 ("r1", 6, one(f"Close-up of {SIL} {YARD}, {SR}, stung, his jaw tightens, he looks away toward the hills for a second, completely still", "LEFT") + " Slow push-in. No dialogue."),
 ("c08", 6, S("c08", "Silvestre", f"Close-up of {SIL} {YARD0}, {SR}, he recovers, adjusts his panama hat and glances to the right toward the winery", FER_B, "LEFT", "curt, cold, hurried",
     f"Close-up of {SIL} {YARD}, {SR}, adjusting his panama hat", "LEFT")),
 ("i01", 6, f"Insert {YARD0}: at the end of a vine row on the dirt path, polished brown leather loafers and the bottom of light-grey linen trousers walking slowly toward the camera on the pale earth; only the legs and shoes, no face. No dialogue."),
 ("c09", D8("c09"), talk("c09", "Silvestre", two(f"{SIL} on the LEFT and {LUC} on the RIGHT {YARD0}, framed from the waist up; the older man shakes the visitor's hand warmly and points toward his daughter off screen, "
     f"the visitor smiles politely, wearing dark sunglasses") + " " + MOUTH("Silvestre", "the visitor"), "warm, proud, welcoming")),
 ("r2", 6, one(f"Close-up of {LUC} {YARD}, standing on the RIGHT, he slowly takes off his dark sunglasses, his polite smile disappears, he stares at someone in front of him, frozen, eyes full of memory", "LEFT") + " Slow push-in. No dialogue."),
 ("r3", 6, one(f"Close-up of {FER} {YARD}, {FL}, frozen, her lips part, her breath stops, she stares at someone in front of her, a tear forms but she does not move, no words", "RIGHT") + " Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Fernanda a cámara
 ("c10", 10, talk("c10", "Fernanda", f"Close-up from the chest up of {FER} {YARD}, standing, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts serious, makes a short pause, tucks a fallen strand of hair behind her ear, raises one eyebrow, gestures with one open hand, "
     f"tilts her head, nods slowly and gives a small bittersweet smile. Nobody else around.",
     "charismatic, bittersweet, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("condescending, pleased", "pleased"), ("condescending", "superior"), ("dismissive", "firm"), ("bitter laugh", "short laugh"), ("cutting", "firm"), ("authoritarian", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden late-afternoon light in a vineyard of Baja California, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, vineyard rows in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SILVESTRE_LARREA}", "a Mexican wine-estate owner in his sixties with white hair, a white beard, a dark-green quilted vest and a panama hat"),
         ("@{FERNANDA_LARREA}", "a Mexican woman in her thirties with dark-brown hair in a loose bun and a rust-colored work shirt"),
         ("@{LUCA_FERRANTE}", "an Italian man around forty with wavy greying dark hair, a short beard and a light-grey linen suit"),
         (" @{LOC_VINEDOENSENADA}", "")]
#@INCLUDE tail

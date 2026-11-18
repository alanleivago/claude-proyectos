"""Genera los clips de puro-tuxtla PARTE 1 (El Puro de San Andrés, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Premisa nueva tipo patrona (Patronas y haciendas, inventada; catálogo #45-#56 agotado) [CAPO], cierre tipo 5 (la acusación se vuelve contra quien acusa): en la galera de su hacienda tabacalera
en San Andrés Tuxtla, la temida doña Elvira (60) desprecia a Azucena (30), la torcedora nueva que contrató su hijo Iván (33). Azucena tuerce un puro con el remate de tres vueltas que solo hacía
el difunto esposo de Elvira. Elvira la acusa de espía de los Rivadeneira y el capataz Anacleto (52) la apoya. Azucena revela que anoche vio a Anacleto abrirles la bodega.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
#@INCLUDE common_head
# Geografía fija (galera): Elvira a la DERECHA junto a la mesa de torcido; Anacleto a la DERECHA un paso detrás de ella; Azucena a la IZQUIERDA sentada a la mesa con las hojas; Iván a la IZQUIERDA de pie junto a ella.
GAL0 = ("in the cigar rolling room of an old tobacco hacienda in San Andres Tuxtla, Veracruz @{LOC_GALERATUXTLA} in the mid-morning: long wooden rolling tables with bundles of brown tobacco leaves, wooden cigar molds, "
        "dried tobacco leaves hanging from the ceiling, tall open windows onto green tobacco fields; no readable text, no signs, no logos")
GAL = GAL0 + "; nobody else in the background, no extras, nobody besides the person described"
ELV = ("@{ELVIRA_SANTAMARIA} (60-year-old Mexican woman, fair skin, short sleek silver bob, sharp dark eyes, deep red lipstick, a tailored black linen dress, a thick gold bracelet)")
AZU = ("@{AZUCENA_MORA} (30-year-old Mexican woman, brown skin, black hair in a tight bun with loose strands, focused dark eyes, a sleeveless cream cotton blouse)")
ANA = ("@{ANACLETO_BARRERA} (52-year-old Mexican man, tanned skin, a big black mustache with grey hairs, round face, a tobacco-stained white guayabera, a ring of old keys on his belt)")
IVA = ("@{IVAN_SANTAMARIA} (33-year-old Mexican man, light-brown skin, short dark hair, a neat short beard, kind eyes, a light-grey linen shirt with rolled sleeves)")
#@INCLUDE funcs1
ELV_B = "@{ELVIRA_SANTAMARIA} seen from behind (short sleek silver bob, black linen dress)"
AZU_B = "@{AZUCENA_MORA} seen from behind (black hair in a tight bun, sleeveless cream blouse)"
ANA_B = "@{ANACLETO_BARRERA} seen from behind (straw hat, white guayabera)"
IVA_B = "@{IVAN_SANTAMARIA} seen from behind (short dark hair, light-grey linen shirt)"
#@INCLUDE funcs2
#@INCLUDE d8
ER = "standing on the RIGHT by the rolling table"
NR = "standing on the RIGHT a step behind the patrona"
ZL = "seated on the LEFT at the rolling table with tobacco leaves in front of her"
IL = "standing on the LEFT beside the seated roller"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Elvira YA hablando, despectiva, Azucena de espaldas en el borde.
 ("c01", 6, S("c01", "Elvira", f"Medium close-up of {ELV} {GAL0}, {ER}, talking from the very first frame, cold and dismissive, looking down at the seated woman over her glasses", AZU_B, "LEFT", "cold, dismissive, proud",
     f"Medium close-up of {ELV} {GAL}, {ER}, talking from the very first frame, cold and dismissive", "LEFT")),
 ("c02", D8("c02"), S("c02", "Azucena", f"Close-up of {AZU} {GAL0}, {ZL}, she looks up, calm and confident, one hand open on the table", ELV_B, "RIGHT", "calm, confident, respectful",
     f"Close-up of {AZU} {GAL}, {ZL}, calm and confident", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Anacleto", f"Close-up of {ANA} {GAL0}, {NR}, leaning to the patrona, a sly distrustful look at the woman", ELV_B, "LEFT", "sly, distrustful, low",
     f"Close-up of {ANA} {GAL}, {NR}, sly and distrustful", "LEFT")),
 ("c04", D8("c04"), S("c04", "Iván", f"Close-up of {IVA} {GAL0}, {IL}, stepping in, respectful but firm toward his mother", ELV_B, "RIGHT", "firm, respectful, warm",
     f"Close-up of {IVA} {GAL}, {IL}, firm and respectful", "RIGHT")),
 ("c05", 6, S("c05", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, a cold sharp look at her son", IVA_B, "LEFT", "sharp, cold, controlling",
     f"Close-up of {ELV} {GAL}, {ER}, sharp cold look", "LEFT")),
 ("c06", 6, S("c06", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, she drops a single tobacco leaf on the table in front of the woman, a challenge", AZU_B, "LEFT", "challenging, dry, cold",
     f"Close-up of {ELV} {GAL}, {ER}, dropping a tobacco leaf, challenging", "LEFT")),
 ("r1", 6, one(f"Medium close-up of {AZU} {GAL}, {ZL}, her hands roll a cigar from brown tobacco leaves quickly and precisely, focused, she finishes the cap with three fast twists", "RIGHT") + " No dialogue."),
 ("i01", 6, f"Extreme close-up insert {GAL0}: a woman's fingers finishing the head of a hand-rolled brown cigar with a perfect triple spiral twist, then setting it on the wooden table; no faces, no readable text. No dialogue."),
 ("c07", 6, S("c07", "Anacleto", f"Close-up of {ANA} {GAL0}, {NR}, a forced scoffing laugh, but his eyes are nervous", ELV_B, "LEFT", "scoffing, nervous, dismissive",
     f"Close-up of {ANA} {GAL}, {NR}, forced scoff", "LEFT")),
 ("c08", 6, S("c08", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, she picks up the cigar and stares at its head, her hard face shaken, her voice dropping", AZU_B, "LEFT", "shaken, low, stunned",
     f"Close-up of {ELV} {GAL}, {ER}, staring at the cigar, shaken", "LEFT")),
 ("c09", 6, S("c09", "Azucena", f"Close-up of {AZU} {GAL0}, {ZL}, quiet, she looks down at her hands, guarded", ELV_B, "RIGHT", "quiet, guarded, humble",
     f"Close-up of {AZU} {GAL}, {ZL}, quiet and guarded", "RIGHT")),
 ("c10", D8("c10"), S("c10", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, suspicion hardening, she sets the cigar down hard on the table", AZU_B, "LEFT", "suspicious, hard, accusing",
     f"Close-up of {ELV} {GAL}, {ER}, suspicious and accusing", "LEFT")),
 ("c11", 6, S("c11", "Anacleto", f"Close-up of {ANA} {GAL0}, {NR}, eagerly nodding, pointing at the woman", ELV_B, "LEFT", "eager, accusing, fast",
     f"Close-up of {ANA} {GAL}, {NR}, eagerly pointing", "LEFT")),
 ("c12", 6, S("c12", "Iván", f"Close-up of {IVA} {GAL0}, {IL}, worried, one hand raised toward his mother", ELV_B, "RIGHT", "worried, firm, pleading",
     f"Close-up of {IVA} {GAL}, {IL}, worried", "RIGHT")),
 ("c13", D8("c13"), S("c13", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, cold and certain, staring at the seated woman", AZU_B, "LEFT", "cold, certain, accusing",
     f"Close-up of {ELV} {GAL}, {ER}, cold and certain", "LEFT")),
 ("c14", 6, S("c14", "Azucena", f"Close-up of {AZU} {GAL0}, {ZL}, she stands up slowly from the table, calm, holding the patrona's gaze", ELV_B, "RIGHT", "calm, firm, meaningful",
     f"Close-up of {AZU} {GAL}, {ZL}, standing up slowly, calm", "RIGHT")),
 ("c15", 6, S("c15", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, arms crossed, one short cold order", AZU_B, "LEFT", "curt, cold, commanding",
     f"Close-up of {ELV} {GAL}, {ER}, arms crossed, curt", "LEFT")),
 ("c16", D8("c16"), S("c16", "Azucena", f"Close-up of {AZU} {GAL0}, standing on the LEFT by the rolling table, steady, then she turns her eyes to the foreman", ELV_B, "RIGHT", "steady, accusing, calm",
     f"Close-up of {AZU} {GAL}, standing on the LEFT by the rolling table, steady and accusing", "RIGHT")),
 ("r2", 6, one(f"Close-up of {ANA} {GAL}, {NR}, frozen, his smile disappears, his hand goes to the ring of keys on his belt, sweat on his forehead", "LEFT") + " No dialogue."),
 ("c17", 6, S("c17", "Anacleto", f"Close-up of {ANA} {GAL0}, {NR}, loud and nervous, turning to the patrona, too fast", ELV_B, "RIGHT", "loud, nervous, defensive",
     f"Close-up of {ANA} {GAL}, {NR}, loud and nervous", "RIGHT")),
 ("c18", 6, S("c18", "Azucena", f"Close-up of {AZU} {GAL0}, standing on the LEFT by the rolling table, a calm cutting look at the keys on his belt", ANA_B, "RIGHT", "calm, cutting, quiet",
     f"Close-up of {AZU} {GAL}, standing on the LEFT, calm and cutting", "RIGHT")),
 ("r3", 6, one(f"Close-up of {ELV} {GAL}, {ER}, she slowly turns her head toward her foreman, her eyes go to the keys on his belt, her face turning to stone, silent", "LEFT") + " Slow push-in. No dialogue."),
 ("r4", 6, one(f"Close-up of {IVA} {GAL}, {IL}, stunned, staring at the foreman, then at his mother, silent", "RIGHT") + " No dialogue."),
 # CTA con carisma (después del BLACK): Azucena a cámara
 ("c19", 10, talk("c19", "Azucena", f"Close-up from the chest up of {AZU} {GAL}, standing by the rolling table, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, holds up the hand-rolled cigar for a second, raises one eyebrow, gestures with her other open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

#@INCLUDE safe
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("sly, distrustful, low", "distrustful, low"), ("suspicious, hard, accusing", "suspicious, serious"), ("eager, accusing, fast", "eager, fast"), ("sweat on his forehead", "worried"), ("accusing", "serious"),
#@INCLUDE soft_generic
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm humid morning light in the cigar rolling room of a tobacco hacienda in Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, tobacco hacienda rolling room with hanging leaves in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ELVIRA_SANTAMARIA}", "a stern Mexican woman around sixty with a short silver bob, red lipstick and a black linen dress"),
         ("@{AZUCENA_MORA}", "a Mexican woman around thirty with black hair in a tight bun and a sleeveless cream blouse"),
         ("@{ANACLETO_BARRERA}", "a Mexican foreman in his fifties with a big black mustache, a white guayabera and keys on his belt"),
         ("@{IVAN_SANTAMARIA}", "a Mexican man in his thirties with a neat short beard and a light-grey linen shirt"),
         (" @{LOC_GALERATUXTLA}", "")]
#@INCLUDE tail

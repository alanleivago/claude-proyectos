"""Genera los clips de gaviota-bacalar PARTE 1 (La Gaviota de Bacalar, variante transformada del Final de la saga de la madrastra de @atriumstories_,
"¡Quería quedarse con la casa de su hijastra! FINAL" (7705499092683590942; la saga madrastra-justicia suma 1.07M, mediana 336K): aquí, en el muelle de lanchas de Bacalar, Quintana Roo,
el lanchero Saturnino corre a su esposa Araceli "antes de que regrese la última lancha" por haber puesto a su hija Ixchel a tallar el muelle; ella reclama las lanchas, la hija la desmiente
(La Gaviota era de su mamá) y le entrega el cepillo; Araceli llama a Wilberto, el hermano de Saturnino, que llega en la última lancha: "la mitad de este muelle es mía"; VISTA STORIES)
con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de hamaca-comalcalco (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS).
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4).
Encuadres tipo Atrium (OTS/two-shot/grupo con respaldo single en los intentos 4-6). Si un OTS sale con un doble: python -I clips.py <ID> --one"""
import json, re, subprocess, sys, os, tempfile, time
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
D = Path(__file__).parent
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = D / "clips"
L = json.loads((D / "lines.json").read_text(encoding="utf-8"))
STYLE = ("Cinematic vertical shot from a Mexican telenovela, photorealistic, natural skin texture, 85mm lens, shallow depth of field, "
         "static camera with a very slow push-in. Keep every character exactly as in their reference sheet (same face, hair, clothes, accessories). "
         "No music. Clean frame, no captions, no subtitles, no text on screen, no name tags, no lettering on clothes.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, unhurried, every word clearly pronounced, clear lip sync, says each sentence only once with no repetitions"
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
END = "After the last word the person stays silent until the end of the shot."
# Gancho 0-2 s (c01, la villana hablando, sin plano previo de objetos): Araceli, con su vestido de playa junto a su maleta dorada bajo la palapa, se burla de Saturnino;
# al fondo, pequeña y desenfocada, Ixchel tallando de rodillas las tablas del muelle (la injusticia se ve): "¿Antes de que regrese la última lancha? ¿Me vas a correr así, por esa muchachita?"
# Plazo: antes de que regrese la última lancha; vuelve contra Saturnino en c28: "¿No que antes de la última lancha? Pues ya llegó, Saturnino." (en ella viene Wilberto).
# Capas: la corre del muelle -> cuatro años tallando (c04) -> sus hijas (c05-c06) -> perdón falso (c07-c08) -> "las lanchas también son mías" (c09) -> Ixchel la desmiente (c10)
# -> La Gaviota de su mamá, le mandó borrar el nombre (c11-c12) -> "no me voy sin lo que me toca" (c13-c16) -> "tallas bien por donde pisé" / el cepillo (c17-c19)
# -> amenaza (c21-c22) -> la llamada a Wilberto (c23) -> el tío tiene llave y firmó los papeles (c25) -> llega en la última lancha: "la mitad de este muelle es mía" (c26) -> CTA.
# Geografía fija (muelle de madera de la laguna de Bacalar): Saturnino a la IZQUIERDA junto a las lanchas amarradas, Ixchel a la IZQUIERDA a la izquierda de su padre;
# Araceli a la DERECHA bajo la palapa con el camastro y la maleta dorada; Wilberto a la DERECHA en la punta del muelle, junto a Araceli.
# Plano de presentación: Araceli c01, Saturnino r1, Ixchel r2, Wilberto r7. CTA (c29): Saturnino solo a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio.
DOCK0 = ("on a long wooden dock over the turquoise and deep-blue striped lagoon of Bacalar, Quintana Roo @{LOC_MUELLEBACALAR} in the late afternoon: white tour boats tied along the dock, "
         "a palapa with a thatched palm roof at the end of the dock, mangroves on the shore, golden light; no readable text, no signs, no logos")
DOCK = DOCK0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
GAVIOTA = "a small old wooden boat painted turquoise with a white seagull painted on its side, its name scraped off"
BRUSH = "a wooden scrub brush"
BUCKET = "a blue plastic bucket"
SUITCASE = "a gold hard-shell suitcase"
CHAIRW = "a wooden lounge chair"
ENVELOPE = "a yellow manila envelope"
PHONE = "a phone with a gold case"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Saturnino barba gris corta y guayabera blanca (figura de autoridad);
# solo Araceli pelo negro largo con mechas cobrizas y vestido largo de playa naranja con flores (villana); solo Wilberto calvo, bigote negro, lentes dorados y polo amarilla (traidor);
# solo Ixchel coleta alta, playera blanca lisa y capri azul marino, descalza.
SAT = ("@{SATURNINO_DZIB} (56-year-old Mexican man, broad-shouldered, dark brown sun-weathered skin, short grey hair, a short grey beard, a white short-sleeve guayabera shirt, "
       "khaki trousers rolled at the ankles, brown leather sandals, a black diving wristwatch)")
ARA = ("@{ARACELI_BRACAMONTES} (45-year-old Mexican woman, light olive skin, long black hair with copper highlights, big dark sunglasses pushed up on her head, red lipstick, "
       "a long flowing orange floral beach dress, gold bangles, gold sandals)")
IXC = ("@{IXCHEL_DZIB} (24-year-old Mexican woman with Maya features, brown skin, black hair in a high ponytail, a plain white t-shirt with wet patches, "
       "navy-blue capri trousers, barefoot)")
WIL = ("@{WILBERTO_DZIB} (52-year-old Mexican man, thin, bald, a thick black mustache, gold-rimmed glasses, a lemon-yellow polo shirt, white trousers, white loafers)")
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
PRES = ("presentation shot: a single-person medium shot from the knees up that shows the whole outfit clearly, NOT an over-the-shoulder shot, "
        "no foreground figure and nobody else at the edges of the frame")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

# Encuadres tipo Atrium (fuentes/atrium-vista/encuadres.md): OTS ~50 %, single ~25 %, two-shot ~15 %, grupo ~10 %.
# La persona de espaldas va con su @{ASSET} + pelo y ropa vistos desde atrás (así Omni no mete un doble ni un desconocido).
# Cada clip OTS/two/grupo es una tupla (prompt_nuevo, prompt_one): desde el intento ONE_FROM+1 (4-6) o con --one vuelve al single.
# Bordes: Araceli/Wilberto le hablan a Saturnino -> espalda de Saturnino en el borde LEFT; Saturnino les habla -> espalda de Araceli o de Wilberto en el borde RIGHT;
# Ixchel le habla a Araceli -> espalda de Araceli RIGHT; Araceli le habla a Ixchel -> espalda de Ixchel LEFT; Saturnino le habla a Ixchel -> espalda de Ixchel LEFT
# (dentro del par Ixchel-Saturnino, Ixchel siempre a la izquierda).
SAT_B = "@{SATURNINO_DZIB} seen from behind (short grey hair, white short-sleeve guayabera shirt, broad shoulders)"
ARA_B = "@{ARACELI_BRACAMONTES} seen from behind (long black hair with copper highlights, dark sunglasses on top of her head, orange floral beach dress)"
IXC_B = "@{IXCHEL_DZIB} seen from behind (black hair in a high ponytail, plain white t-shirt)"
WIL_B = "@{WILBERTO_DZIB} seen from behind (bald head, the arms of gold-rimmed glasses over his ears, lemon-yellow polo shirt, thin)"
PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening.")
GMOUTH = lambda spk: f"Only {spk} speaks: {spk}'s lips move clearly with every word; the other people stay silent the whole shot, mouths closed, only listening."
MUTE = "Nobody speaks, all mouths closed. No dialogue."
ONE_FROM = 3  # k (0-based): intentos 4-6 usan el prompt single

def ots(speaker, listener, side):
    """Plano sobre el hombro como el de Atrium: quien escucha, de espaldas y desenfocado en el borde `side`."""
    return (f"Over-the-shoulder shot from behind {listener}: the listener's blurred shoulder and the back of the head fill the {side} "
            f"edge of the frame in the foreground, out of focus, face never visible. {speaker}, facing the camera three-quarters "
            f"and looking at the person in the foreground; {PAIR}.")

def two(desc):
    """Two-shot de perfil, de las rodillas o la cintura para arriba."""
    return f"Medium two-shot, both characters fully in frame, {desc}; {PAIR}."

SL = f"standing on the LEFT on the wooden dock beside the tied boats, {GAVIOTA} moored behind him"            # Saturnino
IL = f"standing on the LEFT on the wooden dock beside her father, holding {BRUSH}"                             # Ixchel
AR = f"standing on the RIGHT under the thatched palapa beside {CHAIRW} and {SUITCASE}"                         # Araceli
WR = f"standing on the RIGHT at the end of the dock, a white boat just moored behind him, holding {ENVELOPE}"  # Wilberto

CLIPS = [
 # 1. Gancho (0-2 s): Araceli YA hablando junto a su maleta; al fondo Ixchel tallando de rodillas; plazo: antes de que regrese la última lancha.  OTS (Saturnino de espaldas, LEFT)
 ("c01", 6, (talk("c01", "Araceli", f"Over-the-shoulder shot from behind {SAT_B}: his blurred shoulder and the back of his head fill the LEFT edge of the frame in the foreground, "
     f"out of focus, face never visible. Medium shot of {ARA} {DOCK0}, {AR}, facing the camera three-quarters, talking from the very first frame, one hand on her hip, mocking and comfortable; "
     f"far behind her on the dock, small and out of focus, {IXC} kneeling on the wooden planks scrubbing them with {BRUSH} beside {BUCKET}; "
     f"only these three people, no extras. " + MOUTH("Araceli", "Saturnino") + " The kneeling young woman in the background stays silent, head down, working.", "mocking, arrogant"),
   talk("c01", "Araceli", f"Medium shot of {ARA} {DOCK}, {AR}, talking from the very first frame, one hand on her hip, mocking and comfortable; "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in an orange floral dress')}.", "mocking, arrogant"))),
 # r1: presentación de Saturnino (single PRES)
 ("r1", 6, f"Medium shot of {SAT} {DOCK}, {SL}, already standing in place, he drops a coiled mooring rope onto the dock and straightens up, firm and calm, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a white guayabera')}. Slow push-in. No dialogue."),
 ("c02", 6, (talk("c02", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, firm, his jaw tight", ARA_B, "RIGHT") + " " + MOUTH("Saturnino", "Araceli"),
     "firm, contained"),
   talk("c02", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, firm, his jaw tight", "RIGHT"), "firm, contained"))),
 # c03 (la víctima falsa): single
 ("c03", 6, talk("c03", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, she puts a hand on her chest, acting offended", "LEFT"),
     "dramatic, self-pitying")),
 ("c04", 6, (talk("c04", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, a dry, sad look", ARA_B, "RIGHT") + " " + MOUTH("Saturnino", "Araceli"),
     "dry, sad, firm"),
   talk("c04", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, a dry, sad look", "RIGHT"), "dry, sad, firm"))),
 # r2: presentación de Ixchel (single PRES), de rodillas con el cepillo y la cubeta
 ("r2", 6, f"Medium shot of {IXC} {DOCK}, kneeling on the LEFT on the wooden dock planks with {BRUSH} in her hand and {BUCKET} beside her, her whole outfit clearly visible, "
           f"she stops scrubbing and lifts her tired eyes, dignified, {gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('young woman in a white t-shirt')}. Slow push-in. No dialogue."),
 ("c05", 6, (talk("c05", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, pleading, playing the victim", SAT_B, "LEFT") + " " + MOUTH("Araceli", "Saturnino"),
     "pleading, manipulative"),
   talk("c05", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, pleading, playing the victim", "LEFT"), "pleading, manipulative"))),
 ("c06", 6, (talk("c06", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, unmoved, calm", ARA_B, "RIGHT") + " " + MOUTH("Saturnino", "Araceli"),
     "unmoved, calm"),
   talk("c06", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, unmoved, calm", "RIGHT"), "unmoved, calm"))),
 ("c07", 6, (talk("c07", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, suddenly sweet, a big fake smile, she tilts her head", SAT_B, "LEFT") + " " + MOUTH("Araceli", "Saturnino"),
     "falsely sweet, soft"),
   talk("c07", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, suddenly sweet, a big fake smile", "LEFT"), "falsely sweet, soft"))),
 # c08 (no le cree): single de Saturnino
 ("c08", 6, talk("c08", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, he shakes his head slowly, tired of her lies", "RIGHT"),
     "tired, firm")),
 ("c09", 6, (talk("c09", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, she lifts her chin, greedy and defiant", SAT_B, "LEFT") + " " + MOUTH("Araceli", "Saturnino"),
     "greedy, defiant"),
   talk("c09", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, she lifts her chin, greedy and defiant", "LEFT"), "greedy, defiant"))),
 ("r3", 6, one(f"Close-up of {IXC} {DOCK}, {IL}, in silence, she has just stood up, she grips the scrub brush and takes a breath", "RIGHT") + " Slow push-in. No dialogue."),
 ("c10", 6, (talk("c10", "Ixchel", ots(f"Close-up of {IXC} {DOCK0}, {IL}, calm but firm, finally speaking up", ARA_B, "RIGHT") + " " + MOUTH("Ixchel", "Araceli"),
     "calm, firm, brave"),
   talk("c10", "Ixchel", one(f"Close-up of {IXC} {DOCK}, {IL}, calm but firm", "RIGHT"), "calm, firm, brave"))),
 # c11 (La Gaviota, casi llanto): single
 ("c11", 6, talk("c11", "Ixchel", one(f"Close-up of {IXC} {DOCK0}, {IL}, her eyes shine, she glances at {GAVIOTA} moored behind her", "RIGHT"),
     "emotional, sad")),
 ("c12", 6, (talk("c12", "Saturnino", two(f"{IXC} on the LEFT and {SAT} on the RIGHT, side by side on the wooden dock {DOCK0}, {GAVIOTA} moored behind them, framed from the waist up; "
            f"Saturnino puts a hand on his daughter's shoulder and speaks to her, tender and firm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Saturnino", "Ixchel"),
     "tender, firm"),
   talk("c12", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, tender and firm", "LEFT"), "tender, firm"))),
 # r4 grupo mudo: el padre abraza a su hija; Araceli los mira junto a su maleta
 ("r4", 6, (f"Medium wide shot from the knees up {DOCK0}: on the LEFT {IXC} {IL} and {SAT} {SL}, he has his arm around her shoulders; "
            f"on the RIGHT under the palapa {ARA} {AR}, arms crossed, watching them; only these three people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {ARA} {DOCK}, {AR}, in silence, arms crossed, her fake smile gone", "LEFT") + " Slow push-in. No dialogue.")),
 ("c13", 6, (talk("c13", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, she laughs without humor, then hardens", SAT_B, "LEFT") + " " + MOUTH("Araceli", "Saturnino"),
     "scornful, hard"),
   talk("c13", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, she laughs without humor, then hardens", "LEFT"), "scornful, hard"))),
 ("c14", 6, (talk("c14", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, he nods toward the gold suitcase, calm", ARA_B, "RIGHT") + " " + MOUTH("Saturnino", "Araceli"),
     "calm, final"),
   talk("c14", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, calm and final", "RIGHT"), "calm, final"))),
 ("c15", 6, (talk("c15", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, she narrows her eyes, warning him", SAT_B, "LEFT") + " " + MOUTH("Araceli", "Saturnino"),
     "warning, venomous"),
   talk("c15", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, she narrows her eyes", "LEFT"), "warning, venomous"))),
 ("c16", 6, (talk("c16", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, a calm half smile, he glances at the lagoon", ARA_B, "RIGHT") + " " + MOUTH("Saturnino", "Araceli"),
     "calm, proud of his daughter"),
   talk("c16", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, a calm half smile", "RIGHT"), "calm, proud of his daughter"))),
 ("c17", 6, (talk("c17", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, she lowers her sunglasses, a cruel little smile for the young woman", IXC_B, "LEFT") + " " + MOUTH("Araceli", "Ixchel"),
     "cruel, mocking"),
   talk("c17", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, she lowers her sunglasses, a cruel little smile", "LEFT"), "cruel, mocking"))),
 # i01: el cepillo y la cubeta en las tablas del muelle (inserto en medio)
 ("i01", 6, f"Close-up insert {DOCK0}: {BRUSH} lying on the wet wooden dock planks next to {BUCKET} with soapy water, the turquoise lagoon below the gaps, golden light. "
            f"Only the brush, the bucket and the planks, no people, no hands, no letters. No dialogue."),
 # c18 two-shot: Ixchel le entrega el cepillo a Araceli
 ("c18", 6, (talk("c18", "Ixchel", two(f"{IXC} on the LEFT and {ARA} on the RIGHT, in profile facing each other on the wooden dock near the palapa {DOCK0}, framed from the waist up; "
            f"Ixchel holds out the wooden scrub brush to her with a calm, dignified half smile, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ixchel", "Araceli"),
     "calm, dignified, a little ironic"),
   talk("c18", "Ixchel", one(f"Close-up of {IXC} {DOCK}, {IL}, she holds out the scrub brush with a calm, dignified half smile", "RIGHT"), "calm, dignified, a little ironic"))),
 # c19 (el insulto): single
 ("c19", 6, talk("c19", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, holding the scrub brush away from her body, offended, she spits the words", "LEFT"),
     "offended, nasty")),
 ("c20", 6, (talk("c20", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, he takes one step forward, serious, protective", ARA_B, "RIGHT") + " " + MOUTH("Saturnino", "Araceli"),
     "serious, protective, low"),
   talk("c20", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, serious and protective", "RIGHT"), "serious, protective, low"))),
 ("c21", 6, (talk("c21", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, she drops the brush on the dock, menacing", SAT_B, "LEFT") + " " + MOUTH("Araceli", "Saturnino"),
     "menacing, cold"),
   talk("c21", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, menacing", "LEFT"), "menacing, cold"))),
 ("c22", 6, (talk("c22", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, unshaken, he gestures toward the shore end of the dock", ARA_B, "RIGHT") + " " + MOUTH("Saturnino", "Araceli"),
     "unshaken, calm, firm"),
   talk("c22", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, unshaken, calm and firm", "RIGHT"), "unshaken, calm, firm"))),
 # r5 grupo mudo: Araceli toma su maleta; padre e hija la miran
 ("r5", 6, (f"Medium wide shot from the knees up {DOCK0}: on the RIGHT under the palapa {ARA} {AR}, she grabs the handle of the gold suitcase and pulls out a phone; "
            f"on the LEFT {SAT} {SL} and {IXC} {IL}, both watching her in silence; only these three people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {ARA} {DOCK}, {AR}, in silence, she grabs the handle of the gold suitcase and takes out her phone", "LEFT") + " Slow push-in. No dialogue.")),
 # c23 (la llamada): single
 ("c23", 6, talk("c23", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, {PHONE} to her ear, half turned away, whispering with a sly smile", "LEFT"),
     "low, sly, whispering")),
 # r6 grupo mudo: padre e hija oyen el nombre
 ("r6", 6, (f"Medium wide shot from the knees up {DOCK0}: on the LEFT {IXC} {IL} and {SAT} {SL}, both turn their heads sharply toward the palapa; "
            f"on the RIGHT under the palapa {ARA} {AR}, {PHONE} to her ear; only these three people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {SAT} {DOCK}, {SL}, in silence, he turns his head slowly, his face hardens", "RIGHT") + " Slow push-in. No dialogue.")),
 ("c24", 6, (talk("c24", "Ixchel", two(f"{IXC} on the LEFT and {SAT} on the RIGHT, in profile facing each other on the wooden dock {DOCK0}, framed from the waist up; "
            f"Ixchel, worried and confused, slightly closer to the camera and in sharper focus") + " " + MOUTH("Ixchel", "Saturnino"),
     "worried, confused"),
   talk("c24", "Ixchel", one(f"Close-up of {IXC} {DOCK}, {IL}, worried and confused", "RIGHT"), "worried, confused"))),
 ("c25", 6, (talk("c25", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, worried, thinking fast", IXC_B, "LEFT") + " " + MOUTH("Saturnino", "Ixchel"),
     "worried, low"),
   talk("c25", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, worried, thinking fast", "LEFT"), "worried, low"))),
 # i02: la última lancha llegando por la laguna (lejos, sin nadie reconocible)
 ("i02", 6, f"Wide insert {DOCK0}: a white tour boat crossing the turquoise lagoon toward the dock at sunset, still far away, its wake shining, too far to see anyone on board. "
            f"Only the boat, the water and the mangroves, no letters. No dialogue."),
 # r7: presentación de Wilberto (single PRES), ya en la punta del muelle
 ("r7", 6, f"Medium shot of {WIL} {DOCK}, {WR}, already standing in place, he adjusts his gold-rimmed glasses and tucks the envelope under his arm, a thin satisfied smile, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a yellow polo shirt')}. Slow push-in. No dialogue."),
 ("c26", 6, (talk("c26", "Wilberto", ots(f"Close-up of {WIL} {DOCK0}, {WR}, calm and smug, he taps the envelope", SAT_B, "LEFT") + " " + MOUTH("Wilberto", "Saturnino"),
     "calm, smug"),
   talk("c26", "Wilberto", one(f"Close-up of {WIL} {DOCK}, {WR}, calm and smug, he taps the envelope", "LEFT"), "calm, smug"))),
 ("c27", 6, (talk("c27", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, hurt and stunned, his voice low", WIL_B, "RIGHT") + " " + MOUTH("Saturnino", "Wilberto"),
     "hurt, stunned, low"),
   talk("c27", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, hurt and stunned", "RIGHT"), "hurt, stunned, low"))),
 # c28 two-shot de los aliados: Araceli y Wilberto en la punta del muelle, mirando hacia la izquierda
 ("c28", 6, (talk("c28", "Araceli", two(f"{ARA} {AR} and {WIL} standing beside her at the end of the dock holding the envelope, both {DOCK0}, framed from the waist up, both facing the camera three-quarters toward someone at the LEFT; "
            f"Araceli smiles in triumph and lifts her sunglasses, slightly closer to the camera and in sharper focus; Wilberto stays silent, satisfied") + " " + MOUTH("Araceli", "Wilberto"),
     "triumphant, mocking"),
   talk("c28", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, she smiles in triumph and lifts her sunglasses", "LEFT"), "triumphant, mocking"))),
 # CTA con carisma (después del BLACK): Saturnino solo en el muelle, La Gaviota detrás, a cámara
 ("c29", 10, talk("c29", "Saturnino", f"Close-up from the chest up of {SAT} {DOCK0}, alone, {GAVIOTA} moored behind him, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts serious, makes a short pause, rubs his grey beard, raises one eyebrow, "
     f"tilts his head, nods and gives a small confident smile. Nobody else around.",
     "warm, charismatic, a little defiant, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("spits the words", "says it coldly")
        ]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Y la encontré tallando el muelle de rodillas.", "Y la encontré trabajando."), ("Y la volviste a poner a tallar bajo el sol.", "Y no cambiaste."),
        ("Malagradecida.", "Qué grosera."), ("Saliste igual que tu madre.", "Igual que ella."), ("Tú no sabes con quién te metiste.", "Ya verás."),
        ("Para que se acuerde de mis rodillas.", "Para que se acuerde de mí."), ("A su madre no la nombras, Araceli.", "A ella no la nombras, Araceli."),
        ("kneeling on the wooden planks scrubbing them", "cleaning the wooden planks"), ("she drops the brush on the dock, menacing", "serious"),
        ("whispering with a sly smile", "speaking quietly"), ("sly", "calm"), ("scornful", "serious"), ("nasty", "serious"), ("manipulative", "sincere"), ("self-pitying", "sad"),
        ("venomous", "calm"), ("greedy", "surprised"), ("falsely sweet", "sweet"), ("defiant", "firm"), ("smug", "confident"), ("triumphant", "confident"), ("warning", "serious"),
        ("menacing", "calm"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("stunned", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"), ("hard", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "sunglasses"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, golden late-afternoon light on a wooden dock over the turquoise lagoon of Bacalar, Quintana Roo, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, wooden dock with a thatched palapa over a turquoise lagoon in the Mexican Caribbean, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{SATURNINO_DZIB}", "a broad-shouldered Mexican man in his fifties with short grey hair, a short grey beard and a white short-sleeve guayabera"),
         ("@{ARACELI_BRACAMONTES}", "a Mexican woman in her forties with long black hair with copper highlights, sunglasses on her head and a long orange floral beach dress"),
         ("@{IXCHEL_DZIB}", "a Mexican woman in her twenties with Maya features, a high black ponytail, a plain white t-shirt and navy-blue capri trousers"),
         ("@{WILBERTO_DZIB}", "a thin bald Mexican man in his fifties with a thick black mustache, gold-rimmed glasses and a lemon-yellow polo shirt"),
         (" @{LOC_MUELLEBACALAR}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    if "LIMITE DE CREDITOS" in r.stdout: print(r.stdout.strip(), flush=True); sys.exit("FIN por limite de creditos")
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control: gatito como IMAGEN (no gasta créditos)."""
    try:
        r = subprocess.run(["node", "src/cli.js", "--count", "1", "--aspect", "9:16", "--out", str(D / "canary"),
                            "A fluffy orange kitten playing with a ball of yarn on a sofa, soft daylight. No text."],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300)
        files = [l for l in r.stdout.splitlines() if l.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))]
    except subprocess.TimeoutExpired:
        files = []
    for x in files: os.remove(x)
    print("CONTROL gatito:", "Flow OK -> el problema es el prompt" if files else "Flow FALLA -> esperar", flush=True)
    return bool(files)

def reload_flow():
    subprocess.run(["node", str(Path(__file__).resolve().parents[2] / "tools" / "flow_reload.js")], capture_output=True, text=True, timeout=120)
    print("RECARGA Flow", flush=True)

def new_project():
    subprocess.run(["node", "src/cli.js", "project", "new"], cwd=MCP, capture_output=True, text=True, timeout=180)
    pid = subprocess.run(["node", "src/cli.js", "project"], cwd=MCP, capture_output=True, text=True, timeout=60).stdout.strip()
    subprocess.run(["node", str(Path(__file__).resolve().parents[2] / "tools" / "flow_tabs.js"), "--close-extra", pid], capture_output=True, text=True, timeout=60)
    subprocess.run([sys.executable, "-I", "make_sheets.py", "--reupload"], cwd=D, capture_output=True, text=True, timeout=1800)
    print("PROYECTO NUEVO", pid, "(hojas resubidas)", flush=True)

def main():
    force_one = "--one" in sys.argv  # regenerar con el single (p. ej. si el OTS salió con un doble)
    want = set(a for a in sys.argv[1:] if a != "--one")
    OUT.mkdir(exist_ok=True)
    for cid, dur, body in CLIPS:
        dst = OUT / f"{cid}.mp4"
        if want and cid not in want: continue
        if dst.exists():
            if not want: continue
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            alt = isinstance(body, tuple)  # (OTS/two/grupo, respaldo single)
            use_one = alt and (force_one or k >= ONE_FROM)
            files, log = gen(variant((body[1] if use_one else body[0]) if alt else body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"
            if files:
                new = Path(files[0]).resolve()  # solo contra los clips ya guardados (c*/i*/r*.mp4), nunca contra la descarga misma
                dup = [p for p in OUT.glob("*.mp4") if re.fullmatch(r"[cir]\d+", p.stem) and p.resolve() != new and p.stat().st_size == Path(files[0]).stat().st_size and _md5(p) == _md5(Path(files[0]))]
                if dup: os.remove(files[0]); files, log = [], f"DUPLICADO md5 de {dup[0].name}"  # Flow devolvió un clip ya bajado
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1}{', single' if use_one else ''})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                global CAIDAS; CAIDAS = globals().get("CAIDAS", 0) + 1
                if CAIDAS >= 2: new_project(); CAIDAS = 0
                else: reload_flow()
                time.sleep(20); continue
            CAIDAS = 0
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()

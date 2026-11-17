"""Genera los clips de gaviota-bacalar-p2 PARTE 2 (La Gaviota de Bacalar · Parte 2, VISTA STORIES, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Arranca desde el gancho de la P1: Wilberto, el hermano de Saturnino, llega en la última lancha con el sobre amarillo: "Ya llegó la última lancha, hermano. Y la mitad de este muelle es mía."
Desenlace del giro: Ixchel saca de debajo del asiento de La Gaviota el papel que guardaba su mamá: cuando Wilberto se fue a Cancún le cedió su mitad a ella, y lo de su mamá ahora es de Ixchel.
Araceli y Wilberto se culpan; castigo: se van los dos en la misma última lancha y Wilberto entrega la llave de la bodega. Cálida: mañana le pintan el nombre a La Gaviota.
Gancho para la Parte 3: Araceli en la lancha, "ya veremos cuando mis hijas lleguen a este muelle".
Copia del clips.py de costal-cuyutlan-p2 (encuadres de Atrium: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one; y todas sus defensas: gatito en imagen, reload_flow, new_project,
descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4). Si un OTS sale con un doble: python -I clips.py <ID> --one"""
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
# Gancho 0-2 s (c01, Wilberto hablando, sin plano previo de objetos): Wilberto en la punta del muelle, la lancha blanca recién amarrada detrás, golpea el sobre amarillo contra la palma:
# "Ya llegó la última lancha, hermano. Y la mitad de este muelle es mía." (recordatorio del gancho de la P1).
# Capas: "te fuiste a Cancún" (c02) -> trae los papeles y se pone del lado de Araceli (c03-c04) -> Ixchel se acuerda de La Gaviota (r1, c05) y saca el papel de su mamá (r2, i01)
# -> Wilberto le cedió su mitad a la mamá (c06) -> lo de su mamá es de Ixchel (c08) -> Araceli y Wilberto se culpan (c09-c10) -> "cada tabla me la sé" (c11)
# -> plazo vuelto contra ella: se va en la misma última lancha (c12-c13) -> la llave de la bodega (c14, r4) -> "la sangre no se presta" (c16) -> "las tablas resbalan" (c18, r5)
# -> cálida: el nombre de La Gaviota (c19-c21, r6) -> gancho: Araceli en la lancha, "mis hijas" (c22) -> CTA de Saturnino (c23).
# Geografía fija (muelle de madera de la laguna de Bacalar, la misma de la P1): Saturnino a la IZQUIERDA junto a las lanchas amarradas, con La Gaviota detrás; Ixchel a la IZQUIERDA, a la izquierda de su padre;
# Araceli a la DERECHA bajo la palapa con el camastro y la maleta dorada; Wilberto a la DERECHA en la punta del muelle, a la derecha de Araceli, con la lancha blanca detrás.
# Sin personajes nuevos (no hace falta plano de presentación). CTA (c23): Saturnino solo junto a La Gaviota, a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: el inserto va solo en medio.
DOCK0 = ("on a long wooden dock over the turquoise and deep-blue striped lagoon of Bacalar, Quintana Roo @{LOC_MUELLEBACALAR} in the late afternoon: white tour boats tied along the dock, "
         "a palapa with a thatched palm roof at the end of the dock, mangroves on the shore, golden light; no readable text, no signs, no logos")
DOCK = DOCK0 + "; nobody else in the background, no extras, nobody besides the person described"
LAKE = ("in a white tour boat pulling away from the long wooden dock across the turquoise lagoon of Bacalar, Quintana Roo @{LOC_MUELLEBACALAR} at sunset, the dock and its thatched palapa small behind; "
        "no readable text, no signs, no logos; nobody else visible in the boat or in the frame, no extras, nobody besides the person described")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual (la misma de la P1 + el papel de la mamá y la llave de la bodega).
GAVIOTA = "a small old wooden boat painted turquoise with a white seagull painted on its side, its name scraped off"
BRUSH = "a wooden scrub brush"
SUITCASE = "a gold hard-shell suitcase"
CHAIRW = "a wooden lounge chair"
ENVELOPE = "a yellow manila envelope"
OLDPAPER = "a folded old yellowed paper wrapped in clear plastic, with faded illegible handwriting"
IRONKEY = "an old iron key"
WBOAT = "a white tour boat"
# Anclas de identidad y ropa: las mismas de la Parte 1 (make_sheets.py). Solo Saturnino barba gris corta y guayabera blanca (figura de autoridad);
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
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"DIALOGUE (exact Spanish words, nothing else): {who} says {said} {desc} {who} {VOICE}, {tone}. {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

# Encuadres tipo Atrium (fuentes/atrium-vista/encuadres.md): OTS ~50 %, single ~25 %, two-shot ~15 %, grupo ~10 %.
# La persona de espaldas va con su @{ASSET} + pelo y ropa vistos desde atrás (así Omni no mete un doble ni un desconocido).
# Cada clip OTS/two/grupo es una tupla (prompt_nuevo, prompt_one): desde el intento ONE_FROM+1 (4-6) o con --one vuelve al single.
# Bordes (geografía fija): Araceli/Wilberto le hablan a Saturnino -> espalda de Saturnino en el borde LEFT; Saturnino les habla -> espalda de Araceli o de Wilberto en el borde RIGHT;
# Ixchel le habla a Araceli o a Wilberto -> espalda de ellos RIGHT; Araceli le habla a Ixchel -> espalda de Ixchel LEFT; Ixchel le habla a su papá -> espalda de Saturnino RIGHT;
# Saturnino le habla a Ixchel -> espalda de Ixchel LEFT; Araceli le habla a Wilberto -> espalda de Wilberto RIGHT; Wilberto le habla a Araceli -> espalda de Araceli LEFT.
SAT_B = "@{SATURNINO_DZIB} seen from behind (short grey hair, white short-sleeve guayabera shirt, broad shoulders)"
ARA_B = "@{ARACELI_BRACAMONTES} seen from behind (long black hair with copper highlights, dark sunglasses on top of her head, orange floral beach dress)"
IXC_B = "@{IXCHEL_DZIB} seen from behind (black hair in a high ponytail, plain white t-shirt)"
WIL_B = "@{WILBERTO_DZIB} seen from behind (bald head, the arms of gold-rimmed glasses over his ears, lemon-yellow polo shirt, thin)"
PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening.")
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


D8 = lambda cid: 8 if len(" ".join(L[cid]).split()) > 13 else 6  # clips de más de 13 palabras: 8 s

SL = f"standing on the LEFT on the wooden dock beside the tied boats, {GAVIOTA} moored behind him"            # Saturnino
IL = f"standing on the LEFT on the wooden dock beside her father, holding {BRUSH}"                             # Ixchel
AR = f"standing on the RIGHT under the thatched palapa beside {CHAIRW} and {SUITCASE}"                         # Araceli
WR = f"standing on the RIGHT at the end of the dock, a white boat just moored behind him, holding {ENVELOPE}"  # Wilberto

CLIPS = [
 # 1. Gancho (0-2 s): Wilberto YA hablando en la punta del muelle; Saturnino de espaldas a la izquierda
 ("c01", D8("c01"), (talk("c01", "Wilberto", ots(f"Medium close-up of {WIL} {DOCK0}, {WR}, talking from the very first frame, smug, he taps the envelope against his palm", SAT_B, "LEFT") + " " + MOUTH("Wilberto", "Saturnino"),
     "smug, calm, defiant"),
   talk("c01", "Wilberto", one(f"Medium close-up of {WIL} {DOCK}, {WR}, talking from the very first frame, smug, he taps the envelope against his palm", "LEFT"), "smug, calm, defiant"))),
 ("c02", D8("c02"), (talk("c02", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, hurt and firm, his jaw tight", WIL_B, "RIGHT") + " " + MOUTH("Saturnino", "Wilberto"),
     "hurt, firm, low"),
   talk("c02", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, hurt and firm, his jaw tight", "RIGHT"), "hurt, firm, low"))),
 ("c03", D8("c03"), (talk("c03", "Wilberto", ots(f"Close-up of {WIL} {DOCK0}, {WR}, he lifts the yellow envelope, a thin satisfied smile", SAT_B, "LEFT") + " " + MOUTH("Wilberto", "Saturnino"),
     "smug, cold"),
   talk("c03", "Wilberto", one(f"Close-up of {WIL} {DOCK}, {WR}, he lifts the yellow envelope, a thin satisfied smile", "LEFT"), "smug, cold"))),
 # c04: Araceli triunfal (single)
 ("c04", D8("c04"), talk("c04", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, a triumphant smug smile, she pats her gold suitcase", "LEFT"),
     "triumphant, mocking")),
 # r1 grupo mudo: Ixchel voltea a ver La Gaviota
 ("r1", 6, (f"Medium wide shot from the knees up {DOCK0}: on the LEFT {IXC} {IL} and {SAT} {SL}; Ixchel slowly turns her head toward the turquoise boat with the white seagull behind them, "
            f"an idea in her eyes; on the RIGHT {ARA} beside the gold suitcase and {WIL} with the yellow envelope, both smiling; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {IXC} {DOCK}, {IL}, in silence, she slowly turns her head toward the turquoise boat behind her, an idea in her eyes", "RIGHT") + " Slow push-in. No dialogue.")),
 # 2. Desenlace del giro: el papel de la mamá en La Gaviota
 ("c05", D8("c05"), (talk("c05", "Ixchel", ots(f"Close-up of {IXC} {DOCK0}, {IL}, urgent and hopeful, she glances at the turquoise boat", SAT_B, "RIGHT") + " " + MOUTH("Ixchel", "Saturnino"),
     "urgent, hopeful, low"),
   talk("c05", "Ixchel", one(f"Close-up of {IXC} {DOCK}, {IL}, urgent and hopeful", "RIGHT"), "urgent, hopeful, low"))),
 ("r2", 6, f"Medium shot of {IXC} {DOCK}, kneeling barefoot inside {GAVIOTA} moored at the dock, she lifts the wooden seat and pulls out {OLDPAPER}, "
           f"{SOLO}; {ALONE}; {NODOUBLE('woman with a high ponytail')}. Slow push-in. No dialogue."),
 ("i01", 6, f"Close-up insert {DOCK0}: two brown hands unwrap {OLDPAPER} and unfold it, drops of lagoon water on the plastic; only the hands and the paper, no face, no readable words. No dialogue."),
 ("c06", D8("c06"), (talk("c06", "Ixchel", ots(f"Close-up of {IXC} {DOCK0}, standing on the LEFT on the wooden dock, she holds up the open old yellowed paper, firm, her eyes shine", WIL_B, "RIGHT") + " " + MOUTH("Ixchel", "Wilberto"),
     "firm, moved, clear"),
   talk("c06", "Ixchel", one(f"Close-up of {IXC} {DOCK}, standing on the LEFT on the wooden dock, she holds up the open old yellowed paper, firm, her eyes shine", "RIGHT"), "firm, moved, clear"))),
 # c07: Wilberto acorralado (single)
 ("c07", D8("c07"), talk("c07", "Wilberto", one(f"Close-up of {WIL} {DOCK}, {WR}, nervous, a forced smile, sweat on his bald head, he pushes up his gold-rimmed glasses", "LEFT"),
     "nervous, dismissive")),
 ("c08", D8("c08"), (talk("c08", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, firm and proud, he rests a hand on the edge of the turquoise boat", WIL_B, "RIGHT") + " " + MOUTH("Saturnino", "Wilberto"),
     "firm, proud, calm"),
   talk("c08", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, firm and proud", "RIGHT"), "firm, proud, calm"))),
 # r3 grupo mudo: Araceli mira a Wilberto, él esconde el sobre
 ("r3", 6, (f"Medium wide shot from the knees up {DOCK0}: on the RIGHT {ARA} lowers her sunglasses and looks hard at {WIL}, who hides the yellow envelope behind his back; "
            f"on the LEFT {SAT} with one hand on the shoulder of {IXC}, who holds the old paper; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {ARA} {DOCK}, {AR}, in silence, she lowers her sunglasses slowly, her smile gone", "RIGHT") + " Slow push-in. No dialogue.")),
 # 3. La villana y el traidor se culpan
 ("c09", 6, (talk("c09", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, furious, she turns to Wilberto", WIL_B, "RIGHT") + " " + MOUTH("Araceli", "Wilberto"),
     "furious, humiliated"),
   talk("c09", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, furious", "RIGHT"), "furious, humiliated"))),
 ("c10", D8("c10"), (talk("c10", "Wilberto", ots(f"Close-up of {WIL} {DOCK0}, {WR}, defensive, he nods toward the woman on the dock", ARA_B, "LEFT") + " " + MOUTH("Wilberto", "Araceli"),
     "defensive, bitter"),
   talk("c10", "Wilberto", one(f"Close-up of {WIL} {DOCK}, {WR}, defensive", "LEFT"), "defensive, bitter"))),
 ("c11", D8("c11"), (talk("c11", "Ixchel", ots(f"Close-up of {IXC} {DOCK0}, {IL}, calm and proud, she raises her chin", ARA_B, "RIGHT") + " " + MOUTH("Ixchel", "Araceli"),
     "calm, proud, firm"),
   talk("c11", "Ixchel", one(f"Close-up of {IXC} {DOCK}, {IL}, calm and proud, she raises her chin", "RIGHT"), "calm, proud, firm"))),
 # 4. Castigo: en la misma última lancha, y la llave de la bodega
 ("c12", D8("c12"), (talk("c12", "Saturnino", two(f"{SAT} on the LEFT in profile facing right and {ARA} on the RIGHT beside the gold suitcase in profile facing left, a meter apart {DOCK0}, framed from the waist up; "
            f"Saturnino, calm and final, gestures toward the white boat moored at the end of the dock, slightly closer to the camera and in sharper focus") + " " + MOUTH("Saturnino", "Araceli"),
     "calm, final, firm"),
   talk("c12", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, calm and final", "RIGHT"), "calm, final, firm"))),
 ("c13", 6, (talk("c13", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, outraged, she glances at the small open white boat", SAT_B, "LEFT") + " " + MOUTH("Araceli", "Saturnino"),
     "outraged, offended"),
   talk("c13", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, outraged, she glances at the boat", "LEFT"), "outraged, offended"))),
 ("c14", D8("c14"), (talk("c14", "Saturnino", ots(f"Close-up of {SAT} {DOCK0}, {SL}, firm, he holds out his open hand", WIL_B, "RIGHT") + " " + MOUTH("Saturnino", "Wilberto"),
     "firm, cold, slow"),
   talk("c14", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, firm, he holds out his open hand", "RIGHT"), "firm, cold, slow"))),
 # r4 two-shot mudo: la llave de la bodega
 ("r4", 6, (two(f"{SAT} on the LEFT in profile facing right, his open hand held out, and {WIL} on the RIGHT in profile facing left, who drops {IRONKEY} into Saturnino's palm without looking at him {DOCK0}, framed from the waist up") + " Slow push-in. " + MUTE,
   one(f"Close-up of {SAT} {DOCK}, {SL}, in silence, he closes his hand around {IRONKEY}", "RIGHT") + " Slow push-in. No dialogue.")),
 ("c15", 6, (talk("c15", "Wilberto", ots(f"Close-up of {WIL} {DOCK0}, {WR}, pleading and offended, he takes off his gold-rimmed glasses", SAT_B, "LEFT") + " " + MOUTH("Wilberto", "Saturnino"),
     "pleading, offended"),
   talk("c15", "Wilberto", one(f"Close-up of {WIL} {DOCK}, {WR}, pleading and offended, he takes off his gold-rimmed glasses", "LEFT"), "pleading, offended"))),
 # c16: la sangre no se presta (single)
 ("c16", D8("c16"), talk("c16", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, sad and firm, his eyes shine, he closes his fist around {IRONKEY}", "RIGHT"),
     "sad, firm, slow")),
 ("c17", D8("c17"), (talk("c17", "Araceli", ots(f"Close-up of {ARA} {DOCK0}, {AR}, cold and menacing, she pulls the handle of her gold suitcase", IXC_B, "LEFT") + " " + MOUTH("Araceli", "Ixchel"),
     "cold, menacing"),
   talk("c17", "Araceli", one(f"Close-up of {ARA} {DOCK}, {AR}, cold and menacing", "LEFT"), "cold, menacing"))),
 ("c18", 6, (talk("c18", "Ixchel", ots(f"Close-up of {IXC} {DOCK0}, {IL}, a small polite smile", ARA_B, "RIGHT") + " " + MOUTH("Ixchel", "Araceli"),
     "polite, calm, a little ironic"),
   talk("c18", "Ixchel", one(f"Close-up of {IXC} {DOCK}, {IL}, a small polite smile", "RIGHT"), "polite, calm, a little ironic"))),
 # r5: Araceli arrastra la maleta dorada por las tablas mojadas (de espaldas, con su ropa)
 ("r5", 6, f"Medium shot {DOCK}: {ARA_B} drags {SUITCASE} along the wet wooden planks toward {WBOAT} moored at the end of the dock, already in frame from the first frame, "
           f"slipping a little in her gold sandals; the only person in the shot, {SOLO}. No dialogue."),
 # 5. Cálida: el nombre de La Gaviota
 ("c19", D8("c19"), (talk("c19", "Saturnino", two(f"{IXC} on the LEFT and {SAT} on the RIGHT, in profile facing each other in front of {GAVIOTA} {DOCK0}, framed from the waist up; "
            f"Saturnino, tender, looks at the boat and then at his daughter, slightly closer to the camera and in sharper focus") + " " + MOUTH("Saturnino", "Ixchel"),
     "tender, warm, moved"),
   talk("c19", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, tender, warm", "LEFT"), "tender, warm, moved"))),
 ("c20", D8("c20"), (talk("c20", "Ixchel", ots(f"Close-up of {IXC} {DOCK0}, {IL}, her eyes shine, a proud warm smile", SAT_B, "RIGHT") + " " + MOUTH("Ixchel", "Saturnino"),
     "warm, proud, moved"),
   talk("c20", "Ixchel", one(f"Close-up of {IXC} {DOCK}, {IL}, her eyes shine, a proud warm smile", "RIGHT"), "warm, proud, moved"))),
 ("c21", D8("c21"), (talk("c21", "Saturnino", two(f"{IXC} on the LEFT and {SAT} on the RIGHT, in profile facing each other on the wooden dock {DOCK0}, framed from the knees up; "
            f"Saturnino gently takes the wooden scrub brush from her hands, his eyes shine, slightly closer to the camera and in sharper focus") + " " + MOUTH("Saturnino", "Ixchel"),
     "tender, sorry, sincere"),
   talk("c21", "Saturnino", one(f"Close-up of {SAT} {DOCK}, {SL}, tender, his eyes shine", "LEFT"), "tender, sorry, sincere"))),
 # r6 grupo mudo: padre e hija junto a La Gaviota, la lancha se aleja con Araceli y Wilberto
 ("r6", 6, (f"Medium wide shot {DOCK0}: on the LEFT, close to the camera, {SAT} with his arm around the shoulders of {IXC}, both sitting on the edge of the dock beside {GAVIOTA}; "
            f"far away on the RIGHT, small on the turquoise lagoon, {WBOAT} moving away with {ARA_B} and {WIL_B} on board; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {IXC} {DOCK}, sitting on the edge of the dock beside {GAVIOTA}, in silence, a calm smile, the wind in her ponytail", "RIGHT") + " Slow push-in. No dialogue.")),
 # 6. Gancho: Araceli en la lancha que se aleja (single)
 ("c22", 6, talk("c22", "Araceli", one(f"Close-up of {ARA} {LAKE}, seated beside {SUITCASE}, the wind in her hair, she looks back at the dock with a cold secretive smile", "LEFT"),
     "low, cold, secretive")),
 # CTA con carisma (después del BLACK): Saturnino solo junto a La Gaviota, a cámara
 ("c23", 10, talk("c23", "Saturnino", f"Close-up from the chest up of {SAT} {DOCK0}, alone, {GAVIOTA} moored behind him, holding {IRONKEY}, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, his lips moving clearly; he starts with a calm half smile, makes a short pause, raises one eyebrow, "
     f"tosses the old iron key once in his hand, rubs his grey beard, tilts his head toward the lagoon, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")
        ]
# Frases primero: si no, "cold"/"furious" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Y tu mamá ya no está aquí para reclamar nada.", "Eso ya es cosa vieja."), ("Me hiciste quedar en ridículo delante de todos.", "Me hiciste quedar mal."),
        ("Disfruta tu muelle mientras puedas, que te dura poco.", "Disfruta tu muelle."), ("¿Me vas a correr como a ella, delante de tu hija?", "¿Me vas a sacar como a ella?"),
        ("La sangre no se presta para quitarle a mi hija.", "La familia no se usa contra mi hija."), ("Esto no termina aquí, muchachita.", "Ya nos veremos, muchachita."),
        ("sweat on his bald head", "his bald head shining"), ("slipping a little", "walking carefully"), ("humiliated", "surprised"), ("triumphant", "confident"),
        ("secretive", "thoughtful"), ("outraged", "surprised"), ("sorry", "sincere"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"), ("defiant", "confident"),
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
    print("FIN P2", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()

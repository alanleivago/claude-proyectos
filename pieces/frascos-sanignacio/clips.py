"""Genera los clips de frascos-sanignacio PARTE 1 (Los Frascos de San Ignacio, variante transformada de "Se burlaron del padre… sin saber a quién iba a llamar" de @atriumstories_
(7702486655336320286, 231K; 1.ª versión: padre-veladoras): aquí, en la plaza del oasis de San Ignacio, Baja California Sur, un novio rico le tira los frascos de hierbas a una partera vieja
para poner su boda y le da hasta que llegue la novia; ella llama a su ahijado, figura de poder, que llega con sus camionetas, y la novia resulta ser la hija del ahijado; MAJESTIC STORIES)
con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de costal-cuyutlan (todas sus defensas: gatito en imagen, reload_flow, new_project, control de duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS).
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
# Gancho 0-2 s (c01, el villano hablando, sin plano previo de objetos): Bastián, el novio de traje azul cielo, con un frasco de hierbas de Tiburcia en la mano, junto al puesto
# con frascos tirados y el arco de flores de la boda: "Antes de que llegue la novia, aquí no queda ni un frasco." (injusticia + plazo).
# Plazo: la llegada de la novia, al meterse el sol; vuelve invertido en c24-c25: "Le diste hasta que llegara la novia… Antes de que llegue, levantas cada frasco."
# Capas: tira los frascos -> "hoy aquí me caso yo" (c03) -> Iker los echa a la caja (c04-c05) -> la partera llama (r3, c10) -> Belarmino: "Ya voy" (c11) -> burlas (c12-c13)
# -> en la camioneta: por qué le debe todo (c15-c16) y que hoy es la boda de su hija (c17) -> convoy (i01) -> llegan las camionetas (i02-r6) -> plazo invertido (c24-c25)
# -> Bastián: "Mi suegro es don Belarmino Arciniega" (c26) -> la novia es la hija de Belarmino (c27-c29).
# Geografía fija (plaza del oasis): Tiburcia a la IZQUIERDA detrás de su puesto de hierbas; Bastián a la DERECHA frente al arco de flores; Iker a la DERECHA junto a la caja, un paso detrás de Bastián;
# Belarmino llega a la IZQUIERDA, a la derecha de Tiburcia (entre ella y Bastián); Zacarías detrás de Belarmino. En la camioneta: Zacarías maneja a la IZQUIERDA, Belarmino de copiloto a la DERECHA.
# Plano de presentación: Bastián c01, Tiburcia r1, Iker r2, Belarmino r4 (y cuerpo entero en r6), Zacarías c14. CTA (c30): Tiburcia sola a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio.
PLZ0 = ("in a quiet old town plaza in the desert oasis of San Ignacio, Baja California Sur @{LOC_PLAZASANIGN} in the late afternoon: tall date palms and dark green Indian laurel trees, "
        "a white stone colonial church facade at the back, low adobe houses, warm orange sunset light; no readable text, no signs, no logos")
PLZ = PLZ0 + "; nobody else in the background, no extras, nobody besides the person described"
CAR0 = ("inside a black SUV driving along a straight desert highway in Baja California Sur @{LOC_DESIERTOBCS} at sunset, tall cardón cacti and dry mountains passing by the windows; "
        "no readable text, no logos")
CAR = CAR0 + "; nobody else in the car, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
STALL = "her small wooden herb stall with glass jars of dried herbs under a palm-leaf awning, several jars knocked over"
JAR = "a glass jar of dried herbs"
BOX = "a cardboard box half full of glass jars of herbs"
ARCH = "a white flower wedding arch"
SUVS = "four black SUVs with dark tinted windows, no logos and no license plates"
PHONE = "an old small black flip phone"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Tiburcia chongo blanco, vestido azul marino de florecitas, mandil blanco y rebozo gris (la humillada);
# solo Bastián traje de lino azul cielo y copete castaño claro (villano); solo Iker pelirrojo de rizos con camisa verde menta de palmeras (secuaz);
# solo Belarmino sombrero de fieltro café, bigote gris grueso y camisa vaquera crema (figura de poder); solo Zacarías rapado con barba negra y traje gris oscuro (escolta).
TIB = ("@{TIBURCIA_OSUNA} (76-year-old Mexican woman, short and stout, deeply tanned wrinkled skin, white hair pulled back in a low bun, small silver earrings, "
       "a faded navy-blue cotton dress with tiny white flowers, a white apron with a front pocket, a grey rebozo shawl over her shoulders, brown leather sandals)")
BAS = ("@{BASTIAN_TALAMANTES} (29-year-old Mexican man, light skin, slim and tall, styled light-brown hair with a quiff, clean-shaven, a sky-blue slim-fit linen suit, "
       "an open-collar white shirt with no tie, white sneakers, a thin gold chain bracelet)")
IKE = ("@{IKER_BARAJAS} (28-year-old Mexican man, lanky, olive skin, curly dark-red hair, a short reddish beard, a loose mint-green short-sleeve shirt with a palm-leaf print, "
       "beige chinos, brown boat shoes)")
BEL = ("@{BELARMINO_ARCINIEGA} (63-year-old Mexican man, broad and solid, tanned skin, thick grey hair combed back, a thick grey mustache, a dark brown felt cowboy hat, "
       "a cream long-sleeve western shirt with pearl snaps, dark jeans, a big plain silver belt buckle, brown cowboy boots)")
ZAC = ("@{ZACARIAS_MAGANA} (41-year-old Mexican man, burly, brown skin, shaved head, a short black beard, a charcoal-grey suit over a black shirt with no tie, black shoes)")
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
# Bordes: Bastián/Iker le hablan a Tiburcia -> espalda de Tiburcia en el borde LEFT; Tiburcia le habla a Bastián -> espalda de Bastián en el borde RIGHT;
# Iker le habla a Bastián (que está a su izquierda) -> espalda de Bastián en el borde LEFT; Belarmino le habla a Bastián -> espalda de Bastián RIGHT;
# Bastián le habla a Belarmino -> espalda de Belarmino LEFT; Tiburcia le habla a Belarmino (que está a su derecha) -> espalda de Belarmino RIGHT;
# en la camioneta: Belarmino habla -> hombro de Zacarías (chofer) en el borde LEFT; Zacarías habla -> hombro de Belarmino en el borde RIGHT.
TIB_B = "@{TIBURCIA_OSUNA} seen from behind (white hair in a low bun, grey rebozo over her shoulders, faded navy-blue dress, white apron ties at her back)"
BAS_B = "@{BASTIAN_TALAMANTES} seen from behind (styled light-brown hair, sky-blue linen suit jacket, slim and tall)"
BEL_B = "@{BELARMINO_ARCINIEGA} seen from behind (dark brown felt cowboy hat, thick grey hair at the nape, cream western shirt, broad shoulders)"
ZAC_B = "@{ZACARIAS_MAGANA} seen from behind (shaved head, charcoal-grey suit jacket, burly shoulders)"
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

TL = f"standing on the LEFT behind {STALL}"                                               # Tiburcia
BR = f"standing on the RIGHT in front of {ARCH}"                                           # Bastián
IR = f"standing on the RIGHT beside {BOX}, a step behind the groom"                        # Iker
BL = "standing on the LEFT beside the herb stall, next to the old woman, the black SUVs parked behind him"   # Belarmino en la plaza
ZD = "driving, in the driver's seat on the LEFT, eyes on the road"                         # Zacarías en la camioneta
BP = "sitting in the front passenger seat on the RIGHT"                                     # Belarmino en la camioneta

CLIPS = [
 # 1. Gancho (0-2 s): Bastián YA hablando con un frasco de Tiburcia en la mano, el puesto con frascos tirados y el arco de la boda; plazo de la novia.  OTS (Tiburcia de espaldas, LEFT)
 ("c01", 6, (talk("c01", "Bastián", ots(f"Medium shot of {BAS} {PLZ0}, {BR}, talking from the very first frame, holding {JAR} up and shaking it with disdain, "
     f"arrogant and spoiled, {STALL} in front of him", TIB_B, "LEFT") + " " + MOUTH("Bastián", "Tiburcia"), "arrogant, spoiled, mocking"),
   talk("c01", "Bastián", f"Medium shot of {BAS} {PLZ}, {BR}, talking from the very first frame, holding {JAR} up and shaking it with disdain, arrogant and spoiled; "
     f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a sky-blue suit')}.", "arrogant, spoiled, mocking"))),
 # r1: presentación de Tiburcia como two-shot mudo (cuerpo entero visible)
 ("r1", 6, (two(f"{TIB} on the LEFT {TL}, in profile facing right, and {BAS} on the RIGHT {BR}, in profile facing left, holding {JAR}, {PLZ0}, framed from the knees up so both outfits show clearly; "
            f"Tiburcia looks at the jar in his hand, then lifts her eyes slowly to him, calm and dignified, slightly closer to the camera and in sharper focus") + " Slow push-in. " + MUTE,
   f"Medium shot of {TIB} {PLZ}, {TL}, she looks at the knocked-over jars, then lifts her eyes slowly, calm and dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old woman in a grey rebozo')}. Slow push-in. No dialogue.")),
 ("c02", 6, (talk("c02", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL}, calm, she straightens one jar on the table", BAS_B, "RIGHT") + " " + MOUTH("Tiburcia", "Bastián"),
     "calm, dignified, slow"),
   talk("c02", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL}, calm, she straightens one jar on the table", "RIGHT"), "calm, dignified, slow"))),
 ("c03", 6, (talk("c03", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR}, he spreads his arms toward the flower arch, smug", TIB_B, "LEFT") + " " + MOUTH("Bastián", "Tiburcia"),
     "smug, spoiled"),
   talk("c03", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, he spreads his arms toward the flower arch, smug", "LEFT"), "smug, spoiled"))),
 # r2: presentación de Iker (single PRES)
 ("r2", 6, f"Medium shot of {IKE} {PLZ}, {IR}, he drops another jar of herbs into the box and smirks, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('red-haired man in a mint-green shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, (talk("c04", "Iker", ots(f"Close-up of {IKE} {PLZ0}, {IR}, amused, he holds up a bundle of dried herbs", BAS_B, "LEFT") + " " + MOUTH("Iker", "Bastián"),
     "amused, mocking"),
   talk("c04", "Iker", one(f"Close-up of {IKE} {PLZ}, {IR}, amused, he holds up a bundle of dried herbs", "LEFT"), "amused, mocking"))),
 # c05 (la orden cruel): single
 ("c05", 6, talk("c05", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, he waves his hand without looking back, bored and cruel", "RIGHT"),
     "bored, cruel")),
 ("c06", 6, (talk("c06", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL}, she pulls her grey rebozo tighter, serious", BAS_B, "RIGHT") + " " + MOUTH("Tiburcia", "Bastián"),
     "serious, quiet"),
   talk("c06", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL}, she pulls her grey rebozo tighter, serious", "RIGHT"), "serious, quiet"))),
 ("c07", 6, (talk("c07", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR}, a fake surprised face, then a mocking smile", TIB_B, "LEFT") + " " + MOUTH("Bastián", "Tiburcia"),
     "mocking, condescending"),
   talk("c07", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, a fake surprised face, then a mocking smile", "LEFT"), "mocking, condescending"))),
 ("c08", 6, (talk("c08", "Tiburcia", two(f"{TIB} on the LEFT {TL}, in profile facing right, and {BAS} on the RIGHT {BR}, in profile facing left, {PLZ0}, framed from the knees up; "
            f"Tiburcia puts one hand into her apron pocket, serene, slightly closer to the camera and in sharper focus") + " " + MOUTH("Tiburcia", "Bastián"),
     "serene, polite"),
   talk("c08", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL}, she puts one hand into her apron pocket, serene", "RIGHT"), "serene, polite"))),
 ("c09", 6, (talk("c09", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR}, he checks his gold bracelet, bored, and laughs", TIB_B, "LEFT") + " " + MOUTH("Bastián", "Tiburcia"),
     "bored, arrogant"),
   talk("c09", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, he checks his gold bracelet, bored, and laughs", "LEFT"), "bored, arrogant"))),
 # 2. La llamada (singles): Tiburcia marca; Belarmino contesta en la camioneta
 ("r3", 6, one(f"Close-up of {TIB} {PLZ}, {TL}, in silence, she takes {PHONE} out of her apron pocket, opens it and dials slowly with her thumb, calm", "RIGHT") + " No dialogue."),
 ("c10", 6, talk("c10", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL}, holding {PHONE} to her ear, calm, her voice low", "RIGHT"),
     "calm, low, warm")),
 ("r4", 6, f"Medium close-up of {BEL} {CAR}, {BP}, presentation shot from the waist up that shows his hat, mustache and western shirt clearly, he listens to a phone at his ear "
           f"and his face hardens slowly, {gaze('LEFT')}; {ALONE}; {NODOUBLE('man in a brown cowboy hat')}. Slow push-in. No dialogue."),
 ("c11", 6, talk("c11", "Belarmino", one(f"Close-up of {BEL} {CAR}, {BP}, a phone at his ear, serious and protective", "LEFT"),
     "serious, protective, firm")),
 ("c12", 6, (talk("c12", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR}, he laughs and glances at the setting sun", TIB_B, "LEFT") + " " + MOUTH("Bastián", "Tiburcia"),
     "mocking, confident"),
   talk("c12", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, he laughs and glances at the setting sun", "LEFT"), "mocking, confident"))),
 ("c13", 6, (talk("c13", "Iker", ots(f"Close-up of {IKE} {PLZ0}, {IR}, he fakes a shiver and laughs", TIB_B, "LEFT") + " " + MOUTH("Iker", "Tiburcia"),
     "mocking, playful"),
   talk("c13", "Iker", one(f"Close-up of {IKE} {PLZ}, {IR}, he fakes a shiver and laughs", "LEFT"), "mocking, playful"))),
 # 3. En la camioneta: por qué le debe todo. c14 two-shot = presentación de Zacarías
 ("c14", 6, (talk("c14", "Zacarías", two(f"{ZAC} {ZD} and {BEL} {BP}, seen through the windshield {CAR0}, both from the waist up; Zacarías glances at his boss for a second, curious, "
            f"slightly in sharper focus") + " " + MOUTH("Zacarías", "Belarmino"),
     "curious, respectful"),
   talk("c14", "Zacarías", one(f"Close-up of {ZAC} {CAR}, {ZD}, he glances to his right for a second, curious and respectful", "RIGHT"), "curious, respectful"))),
 ("c15", 6, (talk("c15", "Belarmino", ots(f"Close-up of {BEL} {CAR0}, {BP}, he looks out at the desert, moved", ZAC_B, "LEFT") + " " + MOUTH("Belarmino", "Zacarías"),
     "moved, quiet, slow"),
   talk("c15", "Belarmino", one(f"Close-up of {BEL} {CAR}, {BP}, he looks out at the desert, moved", "LEFT"), "moved, quiet, slow"))),
 ("c16", 6, (talk("c16", "Belarmino", ots(f"Close-up of {BEL} {CAR0}, {BP}, he turns his eyes to the driver, grateful", ZAC_B, "LEFT") + " " + MOUTH("Belarmino", "Zacarías"),
     "grateful, quiet"),
   talk("c16", "Belarmino", one(f"Close-up of {BEL} {CAR}, {BP}, he turns his eyes to the driver, grateful", "LEFT"), "grateful, quiet"))),
 ("c17", 6, (talk("c17", "Zacarías", ots(f"Close-up of {ZAC} {CAR0}, {ZD}, he glances at his boss, a little worried", BEL_B, "RIGHT") + " " + MOUTH("Zacarías", "Belarmino"),
     "careful, worried"),
   talk("c17", "Zacarías", one(f"Close-up of {ZAC} {CAR}, {ZD}, he glances to his right, a little worried", "RIGHT"), "careful, worried"))),
 ("c18", 6, (talk("c18", "Belarmino", ots(f"Close-up of {BEL} {CAR0}, {BP}, he lowers the brim of his hat, firm", ZAC_B, "LEFT") + " " + MOUTH("Belarmino", "Zacarías"),
     "firm, final"),
   talk("c18", "Belarmino", one(f"Close-up of {BEL} {CAR}, {BP}, he lowers the brim of his hat, firm", "LEFT"), "firm, final"))),
 # i01: el convoy por la carretera del desierto (inserto en medio)
 ("i01", 6, f"Wide shot of {SUVS} driving fast in a line along a straight desert highway in Baja California Sur @{{LOC_DESIERTOBCS}} between tall cardón cacti at sunset, dust rising behind them. "
            f"No people visible, no letters, no license plates. No dialogue."),
 ("c19", 6, (talk("c19", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR}, he looks at the orange sky, satisfied", TIB_B, "LEFT") + " " + MOUTH("Bastián", "Tiburcia"),
     "satisfied, mocking"),
   talk("c19", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, he looks at the orange sky, satisfied", "LEFT"), "satisfied, mocking"))),
 ("c20", 6, (talk("c20", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL}, she raises one hand and tilts her head, listening, a tiny smile", BAS_B, "RIGHT") + " " + MOUTH("Tiburcia", "Bastián"),
     "calm, knowing"),
   talk("c20", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL}, she raises one hand and tilts her head, listening, a tiny smile", "RIGHT"), "calm, knowing"))),
 ("r5", 6, one(f"Close-up of {BAS} {PLZ}, {BR}, in silence, his smile fades slowly as he hears engines coming, he turns his head toward the street", "LEFT") + " Slow push-in. No dialogue."),
 # i02: las camionetas se forman en la orilla de la plaza (inserto en medio)
 ("i02", 6, f"Wide shot of the plaza {PLZ0}: {SUVS} pull up one after another and stop in a line along the street at the back of the plaza, dust settling, doors still closed. "
            f"No faces, no letters. No dialogue."),
 ("c21", 6, (talk("c21", "Iker", two(f"{IKE} and {BAS} side by side on the RIGHT in front of {ARCH} {PLZ0}, framed from the waist up, both facing the camera three-quarters and looking toward the street at the LEFT; "
            f"Iker speaks in a low voice, nervous, slightly closer to the camera and in sharper focus; Bastián swallows") + " " + MOUTH("Iker", "Bastián"),
     "nervous, low"),
   talk("c21", "Iker", one(f"Close-up of {IKE} {PLZ}, {IR}, nervous, looking toward the street", "LEFT"), "nervous, low"))),
 # r6 grupo mudo: Belarmino de cuerpo entero junto a su camioneta, Zacarías detrás, Tiburcia en primer término a la izquierda
 ("r6", 6, (f"Medium wide shot from the knees up {PLZ0}: in the LEFT foreground {TIB_B}, in three-quarter back view beside her herb stall; in the center {BEL}, already standing beside the open passenger door "
            f"of a black SUV with dark tinted windows, no logos and no license plate, he looks at the knocked-over jars, serious, his whole outfit clearly visible; "
            f"{ZAC} stands one step behind him; only these three people, no extras. Slow push-in. " + MUTE,
   f"Medium shot of {BEL} {PLZ}, {BL}, he looks at the knocked-over jars, serious, his whole outfit clearly visible, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a brown cowboy hat')}. Slow push-in. No dialogue.")),
 ("c22", 6, (talk("c22", "Belarmino", ots(f"Close-up of {BEL} {PLZ0}, {BL}, calm and dangerous, very slow", BAS_B, "RIGHT") + " " + MOUTH("Belarmino", "Bastián"),
     "calm, firm, slow"),
   talk("c22", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, calm and very slow", "RIGHT"), "calm, firm, slow"))),
 ("c23", 6, (talk("c23", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR}, nervous, a forced smile, he hides his hands behind his back", BEL_B, "LEFT") + " " + MOUTH("Bastián", "Belarmino"),
     "nervous, forced"),
   talk("c23", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, nervous, a forced smile", "LEFT"), "nervous, forced"))),
 ("c24", 6, (talk("c24", "Belarmino", ots(f"Close-up of {BEL} {PLZ0}, {BL}, he glances at the sinking sun and back, a cold half smile", BAS_B, "RIGHT") + " " + MOUTH("Belarmino", "Bastián"),
     "ironic, firm"),
   talk("c24", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, he glances at the sinking sun and back, a cold half smile", "RIGHT"), "ironic, firm"))),
 # c25 grupo: el castigo (Belarmino a la izquierda señala los frascos; Bastián e Iker a la derecha)
 ("c25", 6, (talk("c25", "Belarmino", f"Medium wide shot from the knees up {PLZ0}: on the LEFT, closest to the camera and in sharp focus, {BEL} {BL}, he gestures with an open hand toward the knocked-over jars; "
            f"on the RIGHT in front of {ARCH}, {BAS} and {IKE}, both frozen and silent; only these three people, no extras. " + GMOUTH("Belarmino"), "firm, slow, final"),
   talk("c25", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, firm, slow and final", "RIGHT"), "firm, slow, final"))),
 # c26 (la amenaza del novio que destapa el giro): single
 ("c26", 6, talk("c26", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, he lifts his chin, trying to sound powerful, desperate", "LEFT"),
     "desperate, trying to sound powerful")),
 ("r7", 6, one(f"Close-up of {BEL} {PLZ}, {BL}, in silence, his face changes slowly as he understands, he looks the young man up and down", "RIGHT") + " Slow push-in. No dialogue."),
 ("c27", 6, (talk("c27", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL}, sad and calm, she looks up at her godson", BEL_B, "RIGHT") + " " + MOUTH("Tiburcia", "Belarmino"),
     "sad, calm"),
   talk("c27", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL}, sad and calm", "RIGHT"), "sad, calm"))),
 ("c28", 6, (talk("c28", "Belarmino", two(f"{BEL} on the LEFT, in profile facing right, and {BAS} on the RIGHT in front of {ARCH}, in profile facing left, {PLZ0}, framed from the knees up; "
            f"Belarmino takes one slow step toward the young man, slightly closer to the camera and in sharper focus") + " " + MOUTH("Belarmino", "Bastián"),
     "slow, heavy, firm"),
   talk("c28", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, he takes one slow step forward, heavy and firm", "RIGHT"), "slow, heavy, firm"))),
 ("c29", 6, (talk("c29", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR}, the color drains from his face, his voice breaks", BEL_B, "LEFT") + " " + MOUTH("Bastián", "Belarmino"),
     "shocked, frightened"),
   talk("c29", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, the color drains from his face", "LEFT"), "shocked, frightened"))),
 # CTA con carisma (después del BLACK): Tiburcia sola junto a su puesto, a cámara
 ("c30", 10, talk("c30", "Tiburcia", f"Close-up from the chest up of {TIB} {PLZ0}, alone beside her herb stall, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a calm knowing smile, makes a short pause, raises one eyebrow, "
     f"pulls her grey rebozo over her shoulders, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Échalas todas, que huelen a viejo.", "Guárdalas todas."), ("¿Le echo sus hierbitas a la basura?", "¿Le guardo sus hierbitas?"),
        ("Al cabo nadie viene por una hierbera.", "Nadie va a venir."), ("Uy, ya estoy temblando, señora.", "Uy, qué miedo, señora."),
        ("¿Quién le tiró los frascos a mi madrina?", "¿Quién molestó a mi madrina?"), ("Y le besas la mano a mi madrina.", "Y le pides perdón a mi madrina."),
        ("Usted no sabe con quién se mete.", "Usted no sabe quién soy."), ("Pues ahora el que tiene prisa eres tú.", "Pues ahora te toca a ti."), ("El que me tiró los frascos.", "El de mi puesto."),
        ("several jars knocked over", "several jars on the table"), ("knocked-over jars", "jars"), ("shaking it with disdain", "looking at it"), ("driving fast", "driving"),
        ("dust rising behind them", "under the sunset"), ("calm and dangerous", "calm"), ("the color drains from his face, his voice breaks", "he looks surprised"),
        ("the color drains from his face", "he looks surprised"), ("bored and cruel", "bored"), ("desperate", "serious"), ("spoiled", "confident"), ("frozen", "still"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm sunset light in the palm oasis of San Ignacio, Baja California Sur, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, desert town plaza with date palms in Baja California Sur at sunset, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TIBURCIA_OSUNA}", "a short stout old Mexican woman with white hair in a low bun, a faded navy-blue flowered dress, a white apron and a grey rebozo"),
         ("@{BASTIAN_TALAMANTES}", "a slim tall Mexican man around thirty with styled light-brown hair and a sky-blue linen suit"),
         ("@{IKER_BARAJAS}", "a lanky Mexican man around thirty with curly dark-red hair, a short reddish beard and a mint-green palm-print shirt"),
         ("@{BELARMINO_ARCINIEGA}", "a broad Mexican man in his sixties with a thick grey mustache, a dark brown felt cowboy hat and a cream western shirt"),
         ("@{ZACARIAS_MAGANA}", "a burly Mexican man around forty with a shaved head, a short black beard and a charcoal-grey suit"),
         (" @{LOC_PLAZASANIGN}", ""), (" @{LOC_DESIERTOBCS}", "")]
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

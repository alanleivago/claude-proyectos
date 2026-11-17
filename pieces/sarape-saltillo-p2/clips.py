"""Genera los clips de sarape-saltillo-p2 PARTE 2 (El Sarape de Saltillo · Parte 2, VISTA STORIES, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Arranca desde el gancho de la P1 (el carro negro del dueño de la fábrica se detuvo frente a la panadería): son las nueve y Clementina baja de ese carro frente a la casa de Fabián, con Mauricio Arocha y con Tereso.
Mauricio cuenta que ella fue su nana (desenlace del giro), Fabián pierde la oficina de gerente (castigo del villano), Florinda pide perdón y Clementina le da a Tereso el sarape que tejió para la boda de ella (castigo de la traidora).
Copia del clips.py de jipi-becal-p2 (encuadres de Atrium: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one; y todas sus defensas: gatito en imagen, reload_flow, new_project,
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
# Gancho 0-2 s (c01, Fabián hablando, sin plano previo de objetos): Fabián, arriba en la puerta de cristal, ve a su suegra al pie de la escalinata junto al carro negro:
# "¿Suegra? ¿Usted qué hace bajándose de ese carro? Le dije que antes de las nueve se me iba." (recordatorio breve del plazo de la P1).
# Capas: Mauricio se presenta (r1) y dice que ella fue su nana (c02) -> Florinda sale a la puerta (r2) y se hace la que no sabía (c04) -> "¿es cierto que aquí mi nana no combinaba?" (c07)
# -> el sarape tirado en el escalón (c09-c10) -> castigo: "Mañana me entregas la oficina" (c12) -> Florinda defiende a su marido y Clementina le recuerda la central de camiones (c13-c14)
# -> "yo no combino con su casa" (c16) -> Florinda llora (c17), perdón sin regreso (c18) -> el sarape de la boda de Florinda pasa a los hombros de Tereso (i02, c19) -> Tereso no acepta nada (c22)
# -> "así lo crié" (c23) -> Florinda suelta a Fabián (r4, c24) -> gancho: Fabián, "todavía no sabe lo que yo sé de esa fábrica" (c25) -> CTA de Clementina (c26).
# Geografía fija (frente de la casa, de noche, toda la escena): Fabián arriba a la DERECHA en el último escalón junto a la puerta de cristal y Florinda a su derecha en la puerta abierta;
# abajo a la IZQUIERDA, al pie de la escalinata: Tereso, Clementina y Mauricio (en ese orden de izquierda a derecha), con el carro negro estacionado detrás de ellos.
# Personaje nuevo: Mauricio Arocha (presentación en r1, plano medio con la ropa completa). CTA (c26): Clementina sola al pie de la escalinata, a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio. El sarape va en el antebrazo IZQUIERDO de Clementina hasta i02; desde i02 lo lleva Tereso en los hombros.
HOUSE0 = ("in front of a large modern house in an upscale neighborhood of Saltillo, Coahuila @{LOC_CASASALTILLO} at night: wide grey stone front steps, a tall glass front door with warm lights inside, "
          "a dark stone and white stucco facade lit by warm wall lamps, a neat lawn, the dark outline of the Sierra de Zapalinamé under a deep blue night sky; no readable text, no signs, no logos")
HOUSE = HOUSE0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
SARAPE = "a folded Saltillo sarape with bright rainbow stripes and fringed ends"
ARM = f"with {SARAPE} over her LEFT forearm"
SHOULD = f"with {SARAPE} over his shoulders"
CAR = "a long black car with no logos and no license plate"
# Anclas de identidad y ropa: las mismas de la Parte 1 (make_sheets.py) + Mauricio. Solo Clementina trenzas blancas en corona y rebozo gris; solo Fabián cabeza rapada, candado negro y camisa blanca (villano);
# solo Florinda mujer de blusa de satín verde esmeralda y mechas miel (traidora); solo Tereso pelo rizado, bigote delgado y mandil blanco con harina; solo Mauricio pelo y barba plateados, lentes y traje azul marino.
CLE = ("@{CLEMENTINA_RAMOS} (74-year-old Mexican woman, light-brown wrinkled skin, small and thin, white hair in two braids pinned around her head like a crown, small silver earrings, "
       "a dark grey rebozo with thin white stripes over a lavender blouse, a long black skirt, black flat shoes)")
FAB = ("@{FABIAN_ELIZONDO} (46-year-old Mexican man, light skin, stocky, completely shaved head, a thick black goatee, a white slim-fit dress shirt with an open collar, "
       "black trousers, a heavy silver watch on his left wrist)")
FLO = ("@{FLORINDA_RAMOS} (49-year-old Mexican woman, light-brown skin, slim, long straight black hair with honey highlights, red lipstick, a thin gold necklace, "
       "an emerald-green satin blouse, beige wide trousers)")
TER = ("@{TERESO_RAMOS} (41-year-old Mexican man, brown skin, lanky, curly black hair, a thin black mustache, a faded dark-green t-shirt, "
       "a white cloth apron dusted with flour, jeans)")
MAU = ("@{MAURICIO_AROCHA} (56-year-old Mexican man, light-brown skin, tall and slim, short neatly combed silver-grey hair, a short trimmed grey beard, thin black-rimmed glasses, "
       "a navy-blue suit with a light-blue shirt and no tie, a white pocket square, polished black shoes)")
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
# Bordes (geografía fija): los de abajo (Clementina, Tereso, Mauricio) le hablan a Fabián o a Florinda -> espalda de ellos en el borde RIGHT;
# Fabián o Florinda le hablan a los de abajo -> espalda del otro en el borde LEFT; entre los de abajo: Clementina le habla a Tereso -> espalda de él en el borde LEFT,
# Tereso a Clementina -> espalda de ella en el borde RIGHT; arriba, Florinda le habla a Fabián -> espalda de él en el borde LEFT.
CLE_B = f"@{{CLEMENTINA_RAMOS}} seen from behind (small and thin, white hair in two braids pinned around her head like a crown, dark grey rebozo with thin white stripes, {SARAPE} over her left forearm)"
CLE_B2 = "@{CLEMENTINA_RAMOS} seen from behind (small and thin, white hair in two braids pinned around her head like a crown, dark grey rebozo with thin white stripes)"  # ya sin sarape (desde i02)
FAB_B = "@{FABIAN_ELIZONDO} seen from behind (completely shaved head, stocky build, white slim-fit dress shirt)"
FLO_B = "@{FLORINDA_RAMOS} seen from behind (long straight black hair with honey highlights, emerald-green satin blouse)"
TER_B = f"@{{TERESO_RAMOS}} seen from behind (curly black hair, lanky, faded dark-green t-shirt, {SARAPE} over his shoulders)"
MAU_B = "@{MAURICIO_AROCHA} seen from behind (short silver-grey hair, tall and slim, navy-blue suit jacket)"
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

FR = "standing on the top stone step on the RIGHT, beside the glass front door"                        # Fabián
FLR = "standing in the open glass doorway on the RIGHT, at the top of the steps"                         # Florinda
CL = f"standing at the bottom of the stone steps on the LEFT, {ARM}"                                     # Clementina (con sarape, hasta i02)
CL2 = "standing at the bottom of the stone steps on the LEFT, her arms empty"                            # Clementina (sin sarape, desde i02)
ML = f"standing at the bottom of the stone steps on the LEFT, {CAR} parked behind him"                  # Mauricio
TL = "standing at the bottom of the stone steps on the LEFT, beside the black car"                      # Tereso
SPK = lambda spk: f"Only {spk} speaks: {spk}'s lips move clearly with every word; everyone else stays silent the whole shot with closed mouths, only listening."

CLIPS = [
 # 1. Gancho (0-2 s): Fabián YA hablando desde la puerta; Clementina, de espaldas abajo a la izquierda, junto al carro negro
 ("c01", D8("c01"), (talk("c01", "Fabián", ots(f"Medium close-up of {FAB} {HOUSE0}, {FR}, talking from the very first frame, shocked and annoyed, he looks down the steps toward the black car", CLE_B, "LEFT") + " " + MOUTH("Fabián", "Clementina"),
     "shocked, annoyed, arrogant"),
   talk("c01", "Fabián", one(f"Medium close-up of {FAB} {HOUSE}, {FR}, talking from the very first frame, shocked and annoyed, he looks down the steps", "LEFT"), "shocked, annoyed, arrogant"))),
 # r1: presentación de Mauricio (personaje nuevo), plano medio con la ropa completa
 ("r1", 6, f"Medium shot of {MAU} {HOUSE}, {ML}, he buttons his navy jacket and looks up the steps, calm and serious, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a navy suit')}. Slow push-in. No dialogue."),
 ("c02", D8("c02"), (talk("c02", "Mauricio", ots(f"Close-up of {MAU} {HOUSE0}, {ML}, calm, polite and firm, he rests a hand on the old woman's shoulder off frame", FAB_B, "RIGHT") + " " + MOUTH("Mauricio", "Fabián"),
     "calm, polite, firm"),
   talk("c02", "Mauricio", one(f"Close-up of {MAU} {HOUSE}, {ML}, calm, polite and firm", "RIGHT"), "calm, polite, firm"))),
 ("c03", 6, (talk("c03", "Fabián", ots(f"Close-up of {FAB} {HOUSE0}, {FR}, his face goes pale, he swallows, confused", MAU_B, "LEFT") + " " + MOUTH("Fabián", "Mauricio"),
     "confused, nervous"),
   talk("c03", "Fabián", one(f"Close-up of {FAB} {HOUSE}, {FR}, his face goes pale, he swallows, confused", "LEFT"), "confused, nervous"))),
 # r2 grupo mudo: Florinda sale a la puerta, Fabián a su lado, Clementina abajo (geografía completa)
 ("r2", 6, (f"Medium wide shot from the knees up {HOUSE0}: on the RIGHT in the open glass doorway {FLO} stands frozen, a hand on her gold necklace; beside her on the top step {FAB}, pale; "
            f"at the bottom of the steps on the LEFT {CLE_B} in three-quarter back view, looking up at them; only these three people, no extras. Slow push-in. " + MUTE,
   f"Medium shot of {FLO} {HOUSE}, {FLR}, frozen, a hand on her gold necklace, she looks down the steps, ashamed, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in an emerald-green blouse')}. Slow push-in. No dialogue.")),
 ("c04", 6, (talk("c04", "Florinda", ots(f"Close-up of {FLO} {HOUSE0}, {FLR}, a nervous forced smile, she comes one step forward", CLE_B, "LEFT") + " " + MOUTH("Florinda", "Clementina"),
     "nervous, sweet, fake"),
   talk("c04", "Florinda", one(f"Close-up of {FLO} {HOUSE}, {FLR}, a nervous forced smile", "LEFT"), "nervous, sweet, fake"))),
 ("c05", 6, (talk("c05", "Clementina", ots(f"Close-up of {CLE} {HOUSE0}, {CL}, serene, dignified, a sad half smile", FLO_B, "RIGHT") + " " + MOUTH("Clementina", "Florinda"),
     "serene, dignified, sad"),
   talk("c05", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, serene, dignified, a sad half smile", "RIGHT"), "serene, dignified, sad"))),
 ("c06", D8("c06"), (talk("c06", "Tereso", ots(f"Close-up of {TER} {HOUSE0}, {TL}, flour still on his hands, calm and hurt, he looks up at his sister", FLO_B, "RIGHT") + " " + MOUTH("Tereso", "Florinda"),
     "calm, hurt, humble"),
   talk("c06", "Tereso", one(f"Close-up of {TER} {HOUSE}, {TL}, flour still on his hands, calm and hurt", "RIGHT"), "calm, hurt, humble"))),
 # 2. El dueño le pregunta al gerente; el sarape tirado
 ("c07", 6, (talk("c07", "Mauricio", two(f"{MAU} on the LEFT at the bottom of the steps in profile facing right and {FAB} on the RIGHT on the top step in profile facing left {HOUSE0}, framed from the waist up; "
            f"Mauricio, calm and serious, slightly closer to the camera and in sharper focus") + " " + MOUTH("Mauricio", "Fabián"),
     "calm, serious, quiet"),
   talk("c07", "Mauricio", one(f"Close-up of {MAU} {HOUSE}, {ML}, calm and serious", "RIGHT"), "calm, serious, quiet"))),
 ("c08", 6, (talk("c08", "Fabián", ots(f"Close-up of {FAB} {HOUSE0}, {FR}, a nervous smile, he rubs the back of his shaved head", MAU_B, "LEFT") + " " + MOUTH("Fabián", "Mauricio"),
     "nervous, flattering"),
   talk("c08", "Fabián", one(f"Close-up of {FAB} {HOUSE}, {FR}, a nervous smile, he rubs the back of his shaved head", "LEFT"), "nervous, flattering"))),
 ("c09", 6, (talk("c09", "Clementina", ots(f"Close-up of {CLE} {HOUSE0}, {CL}, calm and ironic, she lifts the sarape a little on her arm", FAB_B, "RIGHT") + " " + MOUTH("Clementina", "Fabián"),
     "calm, ironic, firm"),
   talk("c09", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, calm and ironic, she lifts the sarape a little on her arm", "RIGHT"), "calm, ironic, firm"))),
 ("i01", 6, f"Close-up insert {HOUSE0}: two small wrinkled hands smooth {SARAPE} folded over a forearm covered by a dark grey rebozo with thin white stripes; "
            f"only the hands and the sarape, no face, no letters. No dialogue."),
 ("c10", D8("c10"), (talk("c10", "Mauricio", ots(f"Close-up of {MAU} {HOUSE0}, {ML}, serious, his jaw tight, he looks up the steps", FAB_B, "RIGHT") + " " + MOUTH("Mauricio", "Fabián"),
     "serious, firm, controlled"),
   talk("c10", "Mauricio", one(f"Close-up of {MAU} {HOUSE}, {ML}, serious, his jaw tight", "RIGHT"), "serious, firm, controlled"))),
 # c11 súplica: single
 ("c11", 6, talk("c11", "Fabián", one(f"Close-up of {FAB} {HOUSE}, {FR}, sweating, pleading, he presses his hands together", "LEFT"),
     "pleading, nervous, desperate")),
 # 3. Castigo del villano
 ("c12", D8("c12"), (talk("c12", "Mauricio", ots(f"Close-up of {MAU} {HOUSE0}, {ML}, calm and final, he adjusts his glasses", FAB_B, "RIGHT") + " " + MOUTH("Mauricio", "Fabián"),
     "calm, cold, final"),
   talk("c12", "Mauricio", one(f"Close-up of {MAU} {HOUSE}, {ML}, calm and final, he adjusts his glasses", "RIGHT"), "calm, cold, final"))),
 ("r3", 6, one(f"Close-up of {FAB} {HOUSE}, {FR}, in silence, his face falls, he loosens his open collar and looks at his silver watch", "LEFT") + " Slow push-in. No dialogue."),
 # c13 grupo: Florinda defiende a su marido, Mauricio de espaldas abajo
 ("c13", 6, (talk("c13", "Florinda", f"Medium wide shot from the knees up {HOUSE0}: on the RIGHT at the top of the steps {FLO} speaks, holding her husband's arm, pleading, looking down at the man in the suit; "
            f"{FAB} beside her on the top step, head down; at the bottom of the steps on the LEFT {MAU_B} in three-quarter back view; only these three people, no extras. " + SPK("Florinda"),
     "pleading, nervous"),
   talk("c13", "Florinda", one(f"Close-up of {FLO} {HOUSE}, {FLR}, pleading, holding her gold necklace", "LEFT"), "pleading, nervous"))),
 ("c14", D8("c14"), (talk("c14", "Clementina", ots(f"Close-up of {CLE} {HOUSE0}, {CL}, hurt but calm, her eyes shine", FLO_B, "RIGHT") + " " + MOUTH("Clementina", "Florinda"),
     "hurt, calm, firm"),
   talk("c14", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, hurt but calm, her eyes shine", "RIGHT"), "hurt, calm, firm"))),
 ("c15", 6, (talk("c15", "Fabián", ots(f"Close-up of {FAB} {HOUSE0}, {FR}, a sweet fake smile, he gestures toward the open glass door", CLE_B, "LEFT") + " " + MOUTH("Fabián", "Clementina"),
     "sweet, fake, flattering"),
   talk("c15", "Fabián", one(f"Close-up of {FAB} {HOUSE}, {FR}, a sweet fake smile, he gestures toward the open glass door", "LEFT"), "sweet, fake, flattering"))),
 ("c16", 6, (talk("c16", "Clementina", ots(f"Close-up of {CLE} {HOUSE0}, {CL}, a dry little smile, serene and ironic", FAB_B, "RIGHT") + " " + MOUTH("Clementina", "Fabián"),
     "dry, ironic, serene"),
   talk("c16", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, a dry little smile, serene and ironic", "RIGHT"), "dry, ironic, serene"))),
 # 4. La hija traidora: llanto (single), perdón sin regreso (two-shot) y el sarape para Tereso
 ("c17", 6, talk("c17", "Florinda", one(f"Close-up of {FLO} {HOUSE}, {FLR}, her eyes fill with tears, her red lips tremble, ashamed", "LEFT"),
     "crying, ashamed, pleading")),
 ("c18", D8("c18"), (talk("c18", "Clementina", two(f"{CLE} on the LEFT at the bottom of the steps, {ARM}, in profile facing right, and {FLO} on the RIGHT, two steps up, in profile facing left, a meter apart {HOUSE0}, "
            f"framed from the waist up; Clementina, sad and serene, slightly closer to the camera and in sharper focus") + " " + MOUTH("Clementina", "Florinda"),
     "sad, serene, firm"),
   talk("c18", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL}, sad and serene", "RIGHT"), "sad, serene, firm"))),
 ("i02", 6, f"Close-up insert {HOUSE0}: two small wrinkled hands place {SARAPE} over the shoulders of a man in a faded dark-green t-shirt and a white flour-dusted apron; "
            f"only the hands, the sarape and his shoulders, no faces, no letters. No dialogue."),
 ("c19", D8("c19"), (talk("c19", "Clementina", ots(f"Close-up of {CLE} {HOUSE0}, {CL2}, tender and proud, her eyes shine, she looks at her son", TER_B, "LEFT") + " " + MOUTH("Clementina", "Tereso"),
     "tender, proud, emotional"),
   talk("c19", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL2}, tender and proud, her eyes shine", "LEFT"), "tender, proud, emotional"))),
 # c20 emoción de Tereso: single
 ("c20", 6, talk("c20", "Tereso", one(f"Close-up of {TER} {HOUSE}, {TL}, {SHOULD}, moved, his eyes shine, a shy smile", "RIGHT"),
     "moved, humble, soft")),
 # c21 grupo: los tres de abajo, Mauricio le habla a Tereso
 ("c21", D8("c21"), (talk("c21", "Mauricio", f"Medium shot from the knees up {HOUSE0}: at the bottom of the stone steps, {TER} on the left {SHOULD}, {CLE} in the middle with her arms empty, and {MAU} on the right, "
            f"{CAR} parked behind them; Mauricio speaks to Tereso, warm and respectful; only these three people, no extras. " + SPK("Mauricio"),
     "warm, respectful"),
   talk("c21", "Mauricio", one(f"Close-up of {MAU} {HOUSE}, {ML}, warm and respectful", "LEFT"), "warm, respectful"))),
 ("c22", D8("c22"), (talk("c22", "Tereso", ots(f"Close-up of {TER} {HOUSE0}, {TL}, {SHOULD}, a humble proud smile", MAU_B, "RIGHT") + " " + MOUTH("Tereso", "Mauricio"),
     "humble, proud, warm"),
   talk("c22", "Tereso", one(f"Close-up of {TER} {HOUSE}, {TL}, {SHOULD}, a humble proud smile", "RIGHT"), "humble, proud, warm"))),
 ("c23", 6, (talk("c23", "Clementina", two(f"{CLE} on the LEFT with her arms empty and {MAU} on the RIGHT, in profile facing each other very close at the bottom of the steps {HOUSE0}, framed from the waist up; "
            f"Clementina pats his cheek with tenderness, slightly closer to the camera and in sharper focus") + " " + MOUTH("Clementina", "Mauricio"),
     "warm, tender, proud"),
   talk("c23", "Clementina", one(f"Close-up of {CLE} {HOUSE}, {CL2}, warm, tender and proud", "RIGHT"), "warm, tender, proud"))),
 # r4 two-shot mudo: arriba, Florinda suelta a Fabián
 ("r4", 6, (two(f"{FAB} on the LEFT on the top step and {FLO} on the RIGHT in the open glass doorway, a meter apart {HOUSE0}, framed from the waist up, both looking down the steps; "
            f"Florinda slowly lets go of his arm and steps away from him") + " Slow push-in. " + MUTE,
   one(f"Close-up of {FLO} {HOUSE}, {FLR}, in silence, she lets go of something with her hand and steps back, cold", "LEFT") + " Slow push-in. No dialogue.")),
 ("c24", 6, (talk("c24", "Florinda", ots(f"Close-up of {FLO} {HOUSE0}, {FLR}, cold and hurt, her eyes red, she looks at her husband", FAB_B, "LEFT") + " " + MOUTH("Florinda", "Fabián"),
     "cold, hurt, bitter"),
   talk("c24", "Florinda", one(f"Close-up of {FLO} {HOUSE}, {FLR}, cold and hurt, her eyes red", "LEFT"), "cold, hurt, bitter"))),
 # 5. Gancho: Fabián solo en la puerta (single)
 ("c25", D8("c25"), talk("c25", "Fabián", one(f"Close-up of {FAB} {HOUSE}, {FR}, alone at the glass door, he watches the street with a cold scheming look, then a small dark smile", "LEFT"),
     "low, scheming, cold")),
 # CTA con carisma (después del BLACK): Clementina sola al pie de la escalinata, a cámara
 ("c26", 10, talk("c26", "Clementina", f"Close-up from the chest up of {CLE} {HOUSE0}, alone at the bottom of the stone steps, {CAR} behind her, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a knowing little smile, makes a short pause, raises one eyebrow, "
     f"adjusts the grey rebozo on her shoulders, glances up at the glass door, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("tremble", "move"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"hurt" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Le dije que antes de las nueve se me iba.", "Ya son las nueve, suegra."), ("Usted lo tiró en ese escalón.", "Estaba en ese escalón."),
        ("Un gerente que corre a su suegra no cuida a nadie.", "Un gerente cuida a su gente."), ("Mañana me entregas la oficina, Fabián.", "Mañana hablamos, Fabián."),
        ("Pero en mi panadería a mi amá nadie la corrió.", "Pero en mi panadería mi amá está a gusto."), ("Por tu cena me quedé sin madre, Fabián.", "Por tu cena, Fabián."),
        ("Todavía no sabe lo que yo sé de esa fábrica, licenciado.", "Ya veremos, licenciado."), ("En mi fábrica nadie le falta al respeto a quien la levantó.", "En mi fábrica se respeta a quien la levantó."),
        ("he rests a hand on the old woman's shoulder off frame", "he stands calmly"), ("he loosens his open collar", "he touches his collar"), ("ashamed", "quiet"),
        ("scheming", "quiet"), ("a small dark smile", "a small smile"), ("desperate", "sincere"), ("fake", "polite"), ("flattering", "polite"), ("bitter", "quiet"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, night in front of a modern stone house in Saltillo, Coahuila, warm lamps, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a city in northern Mexico at night, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm night light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{CLEMENTINA_RAMOS}", "a small old Mexican woman with white braids pinned around her head and a dark grey striped rebozo over a lavender blouse"),
         ("@{FABIAN_ELIZONDO}", "a stocky Mexican man in his forties with a shaved head, a thick black goatee and a white dress shirt"),
         ("@{FLORINDA_RAMOS}", "a slim Mexican woman in her late forties with long black hair with honey highlights and an emerald-green satin blouse"),
         ("@{TERESO_RAMOS}", "a lanky Mexican man around forty with curly black hair, a thin mustache and a white flour-dusted apron over a dark-green t-shirt"),
         ("@{MAURICIO_AROCHA}", "a tall slim Mexican man in his fifties with short silver-grey hair, a trimmed grey beard, thin glasses and a navy-blue suit"),
         (" @{LOC_CASASALTILLO}", "")]
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

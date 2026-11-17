"""Genera los clips de hamaca-comalcalco-p2 PARTE 2 (La Hamaca de Comalcalco · Parte 2, VISTA STORIES, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Arranca desde el gancho de la P1 (el notario: Norberto fue el lunes a preguntar cómo quitarle las tierras a su madre; Isaura: "Eso fue idea de él"): Norberto confiesa y culpa a Isaura,
el notario cuenta que ella esperaba en la camioneta (desenlace del giro), Fortunata pone la finca del río a nombre de Zenobia, la hija humilde, la pareja entrega la casa el domingo,
Isaura deja a Norberto y Fortunata le da a él su hamaca (castigo). Gancho: Isaura llama a su mamá, "esa finca no va a ser de Zenobia por mucho tiempo".
Copia del clips.py de sarape-saltillo-p2 (encuadres de Atrium: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one; y todas sus defensas: gatito en imagen, reload_flow, new_project,
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
# Gancho 0-2 s (c01, Norberto hablando, sin plano previo de objetos): "Sí fui con el licenciado, amá, no le voy a mentir. Pero fue Isaura la que me mandó." (sigue al instante del final de la P1).
# Capas: Isaura lo niega (c02) -> el notario: ella esperaba en la camioneta abanicándose (c03) -> "los dos fueron" (c04) -> excusas de Norberto (c05-c06) -> Zenobia y su hermano (c07-c09)
# -> la finca del río a nombre de Zenobia (c10-c12) -> llanto de Zenobia (c13) -> "la tierra se le da a quien no la pide" (c14) -> el domingo le dejan las llaves (c16, plazo de la P1 cumplido)
# -> "en el asoleadero hay lugar de sobra" (c18) -> Isaura deja a Norberto (c19) -> Norberto solo (c20) -> Fortunata le da su hamaca (c21, r4) -> gancho: Isaura llama a su mamá (c23) -> CTA (c24).
# Geografía fija (la misma de la P1, misma tarde, corredor de la casa nueva junto al asoleadero): Isaura a la DERECHA en la mecedora (de pie junto a ella desde r3); Norberto a la DERECHA de pie junto a la mecedora;
# Fortunata a la IZQUIERDA en la orilla del asoleadero con la hamaca en brazos (hasta r4; desde r4 la lleva Norberto); Zenobia a la IZQUIERDA, a la izquierda de su madre; Olegario a la IZQUIERDA en el camino, junto a Fortunata.
# Sin personajes nuevos (los 5 de la P1 con su misma ropa). CTA (c24): Fortunata sola junto al asoleadero, a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: el inserto va solo en medio. Grupos (r2, r3, r5) mudos: en los grupos con diálogo Omni a veces mueve la boca equivocada.
CAC0 = ("on the front porch of a new two-story white house with a tiled floor in Comalcalco, Tabasco @{LOC_CACAOCOMALC} in the late afternoon: beside it an old cement cacao drying patio "
        "covered with brown cacao beans spread out to dry, cacao trees with yellow and red pods and tall shade trees behind, humid golden light; no readable text, no signs, no logos")
CAC = CAC0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual (la misma de la P1).
HAMMOCK = "a rolled-up white cotton hammock"
CHAIR = "a white wicker rocking chair"
FAN = "a red folding hand fan"
FOLDER = "a brown leather folder"
# Anclas de identidad y ropa: las mismas de la Parte 1 (make_sheets.py). Solo Fortunata trenza gris con listón rojo y blusa blanca bordada (figura de autoridad);
# solo Isaura rubia teñida con blusa fucsia de satín (villana); solo Norberto alto con camisa blanca de manga larga y reloj plateado (traidor);
# solo Zenobia con chongo bajo, playera lila y mandil de cuadros con harina; solo Olegario bajito y canoso con lentes de carey y saco de lino beige.
FOR = ("@{FORTUNATA_LANDERO} (73-year-old Mexican woman, small and slender, dark brown wrinkled skin, long grey hair in a single braid tied with a red ribbon, small gold hoop earrings, "
       "a white blouse embroidered with bright flowers around the neckline, a long dark-green skirt, black sandals)")
ISA = ("@{ISAURA_GARDUZA} (43-year-old Mexican woman, light tan skin, shoulder-length wavy dyed blonde hair, big gold hoop earrings, long red nails, a fuchsia satin blouse, "
       "tight white trousers, gold sandals)")
NOR = ("@{NORBERTO_LANDERO} (47-year-old Mexican man, tall with a thick neck, brown skin, short black hair with grey temples, clean-shaven, a crisp white long-sleeve button shirt, "
       "navy trousers, brown leather shoes, a big silver wristwatch)")
ZEN = ("@{ZENOBIA_LANDERO} (40-year-old Mexican woman, brown skin, round face, black hair in a low bun, a plain lilac t-shirt, a blue-and-white checked apron dusted with corn flour, "
       "dark jeans, white sneakers)")
OLE = ("@{OLEGARIO_OCHOA} (61-year-old Mexican man, short and plump, light brown skin, short white hair, a white mustache, round tortoiseshell glasses, "
       "a beige linen jacket over a white shirt with no tie, brown trousers)")
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
# Bordes (los de la P1): Isaura/Norberto le hablan a Fortunata -> espalda de Fortunata en el borde LEFT; Fortunata les habla -> espalda de Isaura o de Norberto en el borde RIGHT;
# Olegario le habla a Isaura -> espalda de Isaura en el borde RIGHT; Norberto le habla a Zenobia -> espalda de Zenobia LEFT; Zenobia le habla a Norberto -> espalda de Norberto RIGHT;
# dentro del par Zenobia-Fortunata, Zenobia siempre a la izquierda: Zenobia le habla a su madre -> espalda de Fortunata RIGHT; Fortunata a Zenobia -> espalda de Zenobia LEFT.
FOR_B = "@{FORTUNATA_LANDERO} seen from behind (long grey braid tied with a red ribbon, white embroidered blouse, long dark-green skirt, a rolled white hammock in her arms)"
FOR_B2 = "@{FORTUNATA_LANDERO} seen from behind (long grey braid tied with a red ribbon, white embroidered blouse, long dark-green skirt, her arms empty)"  # ya sin hamaca (desde r4)
ISA_B = "@{ISAURA_GARDUZA} seen from behind, seated in the white wicker rocking chair (shoulder-length wavy dyed blonde hair, fuchsia satin blouse)"
NOR_B = "@{NORBERTO_LANDERO} seen from behind (short black hair, crisp white long-sleeve shirt, tall with a thick neck)"
ZEN_B = "@{ZENOBIA_LANDERO} seen from behind (black hair in a low bun, lilac t-shirt, the ties of a checked apron at her back)"
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

FL = f"standing on the LEFT at the edge of the cacao drying patio, holding {HAMMOCK} in her arms"     # Fortunata (con hamaca, hasta r4)
FL2 = "standing on the LEFT at the edge of the cacao drying patio, her arms empty"                    # Fortunata (sin hamaca, desde r4)
IR = f"sitting on the RIGHT in {CHAIR} on the porch, {FAN} in one hand and a phone in the other"     # Isaura (sentada, hasta r3)
IR2 = f"standing on the RIGHT on the porch beside the empty {CHAIR}, {FAN} closed in one hand and a phone in the other"  # Isaura (de pie, desde r3)
NR = f"standing on the RIGHT on the porch beside {CHAIR}"                                            # Norberto
NR2 = f"standing on the RIGHT on the porch beside {CHAIR}, holding {HAMMOCK} in his arms"            # Norberto (con la hamaca, desde r4)
ZL = "standing on the LEFT at the edge of the cacao drying patio, beside her mother"                  # Zenobia
OL = f"standing on the LEFT on the path beside the cacao drying patio, holding {FOLDER}"              # Olegario

CLIPS = [
 # 1. Gancho (0-2 s): Norberto YA hablando, confiesa y culpa a Isaura.  OTS (Fortunata de espaldas, LEFT)
 ("c01", D8("c01"), (talk("c01", "Norberto", ots(f"Close-up of {NOR} {CAC0}, {NR}, talking from the very first frame, cornered, he points his open hand at his wife beside him", FOR_B, "LEFT") + " " + MOUTH("Norberto", "Fortunata"),
     "cornered, defensive, fast"),
   talk("c01", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, talking from the very first frame, cornered", "LEFT"), "cornered, defensive, fast"))),
 # c02 two-shot de la pareja: Isaura lo niega
 ("c02", D8("c02"), (talk("c02", "Isaura", two(f"{ISA} {IR} and {NOR} {NR}, both on the porch {CAC0}, framed from the waist up; Isaura looks up at her husband, offended, she snaps the fan shut, "
            f"slightly closer to the camera and in sharper focus; Norberto looks down at her") + " " + MOUTH("Isaura", "Norberto"),
     "offended, defensive"),
   talk("c02", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR}, offended, she snaps the fan shut", "LEFT"), "offended, defensive"))),
 ("c03", D8("c03"), (talk("c03", "Olegario", ots(f"Close-up of {OLE} {CAC0}, {OL}, polite but firm, he pushes up his round glasses", ISA_B, "RIGHT") + " " + MOUTH("Olegario", "Isaura"),
     "polite, precise, firm"),
   talk("c03", "Olegario", one(f"Close-up of {OLE} {CAC}, {OL}, polite but firm, he pushes up his round glasses", "RIGHT"), "polite, precise, firm"))),
 # r1: Isaura se queda helada (reacción)
 ("r1", 6, one(f"Close-up of {ISA} {CAC}, {IR}, in silence, the fan stops in the air, she swallows and looks away", "LEFT") + " Slow push-in. No dialogue."),
 ("c04", 6, (talk("c04", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, calm, a sad dry half smile", NOR_B, "RIGHT") + " " + MOUTH("Fortunata", "Norberto"),
     "calm, dry, slow"),
   talk("c04", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, calm, a sad dry half smile", "RIGHT"), "calm, dry, slow"))),
 ("c05", D8("c05"), (talk("c05", "Norberto", ots(f"Close-up of {NOR} {CAC0}, {NR}, he softens his voice, trying to sound reasonable, he rubs his silver watch", FOR_B, "LEFT") + " " + MOUTH("Norberto", "Fortunata"),
     "falsely reasonable, nervous"),
   talk("c05", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, trying to sound reasonable", "LEFT"), "falsely reasonable, nervous"))),
 ("c06", D8("c06"), (talk("c06", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, hurt, she holds the hammock tighter", NOR_B, "RIGHT") + " " + MOUTH("Fortunata", "Norberto"),
     "hurt, firm"),
   talk("c06", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, hurt, she holds the hammock tighter", "RIGHT"), "hurt, firm"))),
 # r2 grupo mudo: la geografía completa (izquierda: Zenobia, Fortunata, Olegario; derecha: Isaura sentada y Norberto)
 ("r2", 6, (f"Medium wide shot from the knees up {CAC0}: on the LEFT at the edge of the cacao drying patio {ZEN}, then {FOR} holding {HAMMOCK}, then {OLE} holding {FOLDER}; "
            f"on the RIGHT on the porch {ISA} {IR} and {NOR} {NR}; everyone is silent and looks at Norberto; only these five people, no extras. Slow push-in. " + MUTE,
   f"Medium shot of {ZEN} {CAC}, {ZL}, in silence, she shakes her head slowly, sad, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a lilac t-shirt and checked apron')}. Slow push-in. No dialogue.")),
 # 2. Zenobia y su hermano
 ("c07", D8("c07"), (talk("c07", "Zenobia", two(f"{ZEN} on the LEFT and {FOR} beside her on the RIGHT holding the rolled hammock, at the edge of the cacao drying patio {CAC0}, framed from the waist up, "
            f"both looking toward the porch; Zenobia, hurt and disappointed, slightly closer to the camera and in sharper focus") + " " + MOUTH("Zenobia", "Fortunata"),
     "hurt, disappointed"),
   talk("c07", "Zenobia", one(f"Close-up of {ZEN} {CAC}, {ZL}, hurt and disappointed", "RIGHT"), "hurt, disappointed"))),
 ("c08", D8("c08"), (talk("c08", "Norberto", ots(f"Close-up of {NOR} {CAC0}, {NR}, bitter and jealous, he points his chin at his sister", ZEN_B, "LEFT") + " " + MOUTH("Norberto", "Zenobia"),
     "bitter, jealous"),
   talk("c08", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, bitter and jealous", "LEFT"), "bitter, jealous"))),
 ("c09", D8("c09"), (talk("c09", "Zenobia", ots(f"Close-up of {ZEN} {CAC0}, {ZL}, calm and sincere, her eyes shine", NOR_B, "RIGHT") + " " + MOUTH("Zenobia", "Norberto"),
     "calm, sincere"),
   talk("c09", "Zenobia", one(f"Close-up of {ZEN} {CAC}, {ZL}, calm and sincere, her eyes shine", "RIGHT"), "calm, sincere"))),
 # 3. La finca del río para la hija humilde
 ("c10", D8("c10"), talk("c10", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, decided, she turns her head to the man with the folder", "LEFT"),
     "decided, firm")),
 ("c11", 6, talk("c11", "Olegario", one(f"Close-up of {OLE} {CAC}, {OL}, he opens the folder and takes out a pen, attentive", "RIGHT"),
     "attentive, formal")),
 ("c12", 6, (talk("c12", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, she looks at her daughter with tenderness and pride", ZEN_B, "LEFT") + " " + MOUTH("Fortunata", "Zenobia"),
     "tender, proud, slow"),
   talk("c12", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, tender and proud", "LEFT"), "tender, proud, slow"))),
 # c13 llanto de Zenobia: single
 ("c13", D8("c13"), talk("c13", "Zenobia", one(f"Close-up of {ZEN} {CAC}, {ZL}, her eyes fill with tears, she covers her mouth for a second and then speaks", "RIGHT"),
     "crying softly, moved")),
 ("c14", D8("c14"), (talk("c14", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, a warm smile, her eyes shine", ZEN_B, "LEFT") + " " + MOUTH("Fortunata", "Zenobia"),
     "warm, wise"),
   talk("c14", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, a warm smile, her eyes shine", "LEFT"), "warm, wise"))),
 # i01: el notario anota en la carpeta (inserto en medio)
 ("i01", 6, f"Close-up insert {CAC0}: two plump hands with a beige linen sleeve write with a pen on a paper inside {FOLDER}, the writing small and blurred, not readable, golden light. "
            f"Only the hands, the pen and the folder, no face, no letters. No dialogue."),
 # 4. La casa y la nuera
 ("c15", D8("c15"), (talk("c15", "Isaura", ots(f"Close-up of {ISA} {CAC0}, {IR}, suddenly worried, she leans forward in the rocking chair", FOR_B, "LEFT") + " " + MOUTH("Isaura", "Fortunata"),
     "worried, falsely sweet"),
   talk("c15", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR}, suddenly worried, she leans forward in the rocking chair", "LEFT"), "worried, falsely sweet"))),
 ("c16", D8("c16"), (talk("c16", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, calm and final", ISA_B, "RIGHT") + " " + MOUTH("Fortunata", "Isaura"),
     "calm, firm, final"),
   talk("c16", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, calm and final", "RIGHT"), "calm, firm, final"))),
 ("c17", D8("c17"), (talk("c17", "Isaura", ots(f"Close-up of {ISA} {CAC0}, {IR}, upset, she fans herself fast, she is the blonde woman in the fuchsia satin blouse and white jeans exactly as in her reference sheet (NOT the old woman, NOT a white embroidered blouse)", FOR_B, "LEFT") + " " + MOUTH("Isaura", "Fortunata"),
     "upset, whiny"),
   talk("c17", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR}, upset, she fans herself fast", "LEFT"), "upset, whiny"))),
 ("c18", D8("c18"), (talk("c18", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, a dry ironic little smile", ISA_B, "RIGHT") + " " + MOUTH("Fortunata", "Isaura"),
     "dry, ironic, calm"),
   talk("c18", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, a dry ironic little smile", "RIGHT"), "dry, ironic, calm"))),
 # r3 grupo mudo: Isaura se levanta de la mecedora y se aparta de Norberto
 ("r3", 6, (f"Medium wide shot from the knees up {CAC0}: on the RIGHT on the porch {ISA} slowly stands up from {CHAIR} and takes one step away from {NOR}, who stays beside the chair; "
            f"on the LEFT at the edge of the cacao drying patio {FOR} holding {HAMMOCK} and {ZEN} beside her, watching; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {ISA} {CAC}, {IR2}, in silence, she has just stood up, cold, she steps away from someone", "LEFT") + " Slow push-in. No dialogue.")),
 # c19 two-shot de la pareja: Isaura deja a Norberto
 ("c19", D8("c19"), (talk("c19", "Isaura", two(f"{ISA} {IR2} on the LEFT and {NOR} {NR} on the RIGHT, both on the porch, in profile facing each other {CAC0}, framed from the waist up; "
            f"Isaura, cold and resentful, slightly closer to the camera and in sharper focus; Norberto stares at her, lost") + " " + MOUTH("Isaura", "Norberto"),
     "cold, resentful"),
   talk("c19", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR2}, cold and resentful", "RIGHT"), "cold, resentful"))),
 # c20 Norberto solo (casi llanto): single
 ("c20", D8("c20"), talk("c20", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, his eyes red and wet, his voice breaks, lost", "LEFT"),
     "broken, lost, low")),
 ("c21", D8("c21"), (talk("c21", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, serene, sad and firm, she lifts the rolled hammock a little in her arms", NOR_B, "RIGHT") + " " + MOUTH("Fortunata", "Norberto"),
     "serene, sad, firm"),
   talk("c21", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, serene, sad and firm", "RIGHT"), "serene, sad, firm"))),
 # r4 two-shot mudo: Fortunata le pone la hamaca en los brazos a su hijo (desde aquí la hamaca es de Norberto)
 ("r4", 6, (two(f"{FOR} on the LEFT and {NOR} on the RIGHT, standing face to face at the foot of the porch {CAC0}, in profile, framed from the waist up; "
            f"Fortunata places {HAMMOCK} in her son's arms and steps back, Norberto holds it, defeated") + " Slow push-in. " + MUTE,
   one(f"Close-up of {NOR} {CAC}, {NR2}, in silence, he looks down at the hammock in his arms, defeated", "LEFT") + " Slow push-in. No dialogue.")),
 # r5 grupo mudo: Norberto solo con la hamaca en el corredor; Isaura aparte con el celular; a la izquierda, madre, hija y notario
 ("r5", 6, (f"Medium wide shot from the knees up {CAC0}: on the RIGHT on the porch {NOR} {NR2}, alone and defeated, and {ISA} a few steps away from him, standing, typing on her phone; "
            f"on the LEFT at the edge of the cacao drying patio {ZEN}, {FOR} with her arms empty and {OLE} holding {FOLDER}; only these five people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {NOR} {CAC}, {NR2}, alone in silence, defeated, holding the hammock", "LEFT") + " Slow push-in. No dialogue.")),
 ("c22", D8("c22"), (talk("c22", "Zenobia", ots(f"Close-up of {ZEN} {CAC0}, {ZL}, a warm tearful smile, she takes her mother's hand", FOR_B2, "RIGHT") + " " + MOUTH("Zenobia", "Fortunata"),
     "warm, tender"),
   talk("c22", "Zenobia", one(f"Close-up of {ZEN} {CAC}, {ZL}, a warm tearful smile", "RIGHT"), "warm, tender"))),
 # 5. Gancho: Isaura al teléfono con su mamá (single, llamada)
 ("c23", D8("c23"), talk("c23", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR2}, a phone pressed to her ear, she turns her back to the porch and speaks low, scheming, her eyes narrow", "LEFT"),
     "low, scheming, cold")),
 # CTA con carisma (después del BLACK): Fortunata sola junto al asoleadero, a cámara, ya sin la hamaca
 ("c24", 10, talk("c24", "Fortunata", f"Close-up from the chest up of {FOR} {CAC0}, alone at the edge of the cacao drying patio, her arms empty, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a satisfied little smile, picks up a cacao bean and shows it, makes a short pause, "
     f"raises one eyebrow, tilts her head, gives a small shrug, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying softly", "with shining eyes"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("tremble", "move"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"bitter" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Pero fue Isaura la que me mandó.", "Pero Isaura también sabía."), ("Se quedó esperando en la camioneta, abanicándose.", "Ella también estaba."),
        ("Junto a los costales, donde tú me pusiste.", "Junto a los costales."), ("Tú no te metas, que a ti te conviene.", "Tú no te metas, hermana."),
        ("Ahora resulta que te vas a quedar con todo.", "Ahora la finca es tuya."), ("Ahí se duerme muy fresco, yo lo sé.", "Ahí se está muy fresco."),
        ("Yo me voy con mi mamá, pero tú no vienes.", "Yo me voy con mi mamá."), ("Esa finca no va a ser de Zenobia por mucho tiempo.", "Ya veremos lo de la finca."),
        ("Me quedé sin casa, sin mujer y sin madre.", "Me quedé solo."),
        ("he points his open hand at his wife beside him", "he gestures toward his wife"), ("she snaps the fan shut", "she closes the fan"),
        ("his eyes red and wet, his voice breaks", "his eyes shine"), ("she covers her mouth for a second and then speaks", "she speaks softly"),
        ("scheming", "quiet"), ("her eyes narrow", "thoughtful"), ("cornered", "serious"), ("falsely reasonable", "calm"), ("falsely sweet", "sweet"), ("jealous", "serious"),
        ("resentful", "serious"), ("whiny", "worried"), ("broken", "sad"), ("defeated", "quiet"), ("disappointed", "sad"), ("lost", "quiet"), ("fast", "clear"),
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
          "Vertical scene from a Mexican TV drama, realistic, humid golden late-afternoon light among the cacao trees of Comalcalco, Tabasco, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, porch of a house beside a cacao drying patio in tropical Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{FORTUNATA_LANDERO}", "a small slender old Mexican woman with a long grey braid tied with a red ribbon, a white embroidered blouse and a long dark-green skirt"),
         ("@{ISAURA_GARDUZA}", "a Mexican woman in her forties with wavy dyed blonde hair to the shoulders, big gold hoop earrings and a fuchsia satin blouse"),
         ("@{NORBERTO_LANDERO}", "a tall Mexican man in his late forties with short black hair, grey temples, a crisp white long-sleeve shirt and a silver wristwatch"),
         ("@{ZENOBIA_LANDERO}", "a round-faced Mexican woman around forty with black hair in a low bun, a lilac t-shirt and a checked apron"),
         ("@{OLEGARIO_OCHOA}", "a short plump Mexican man in his sixties with white hair, a white mustache, round tortoiseshell glasses and a beige linen jacket"),
         (" @{LOC_CACAOCOMALC}", "")]
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

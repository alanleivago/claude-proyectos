"""Genera los clips de frascos-sanignacio-p2 PARTE 2 (Los Frascos de San Ignacio · Parte 2, MAJESTIC STORIES, la misma marca de la Parte 1) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Arranca desde el gancho de la P1 (Bastián: "¿Usted… es don Belarmino? Señor, yo no sabía."): Belarmino lo pone a levantar los frascos con Iker, llega la novia, Jimena (27, hija de Belarmino, personaje nuevo),
se entera de que su novio humilló a la partera que la recibió (desenlace del giro: el novio Bastián se casa con la hija de Belarmino), Bastián le besa la mano a Tiburcia, Jimena le devuelve el anillo
y suspende la boda, y le da su ramo a Tiburcia (castigo). Gancho: Bastián llama a su papá y Tiburcia: "A él también lo recibí yo."
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
# Gancho 0-2 s (c01, Belarmino hablando, sin plano previo de objetos): "¿No sabías? Pues ya lo sabes, muchacho. Empieza a levantar frascos, que la novia ya viene en camino." (sigue al instante del final de la P1).
# Capas: Bastián se excusa (c02) -> "a la gente se le respeta sin saber quién es" (c03) -> Bastián recoge frascos (r1) -> Iker quiere irse y Belarmino no lo deja (c04-c05) -> los dos recogen (r2)
# -> llega Jimena vestida de novia (r3, presentación) -> se entera (c06-c07) -> Tiburcia la recibió (c08-c09) -> "una vendedora cualquiera" (c10-c11) -> Iker y Bastián se echan la culpa (c12-c13)
# -> el beso en la mano (c14, r4, c15) -> Jimena: "Hoy en esta plaza no hay boda" y el anillo (c16, i01, c17) -> "que vean quién levantó los frascos" (c19) -> el ramo para Tiburcia (c20-c21)
# -> fuera el arco (c22) -> gancho: Bastián llama a su papá (c23) y Tiburcia: "A él también lo recibí yo" (c24) -> CTA de Jimena (c25).
# Geografía fija (la misma de la P1, plaza del oasis, ya metido el sol): a la IZQUIERDA Tiburcia detrás de su puesto, Belarmino a su derecha y Jimena a la derecha de su padre (hacia el centro), Zacarías detrás de Belarmino;
# a la DERECHA Bastián frente al arco de flores e Iker un paso detrás de él.
# Personaje nuevo: Jimena Arciniega, la novia (presentación en r3, plano medio con el vestido completo). CTA (c25): Jimena sola a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: el inserto va solo en medio. Grupos (r2, r5, r6) mudos: en los grupos con diálogo Omni a veces mueve la boca equivocada.
PLZ0 = ("in a quiet old town plaza in the desert oasis of San Ignacio, Baja California Sur @{LOC_PLAZASANIGN} at dusk, right after sunset: tall date palms and dark green Indian laurel trees, "
        "a white stone colonial church facade at the back, low adobe houses, the last orange and violet glow of the sunset in the sky; no readable text, no signs, no logos")
PLZ = PLZ0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual (la misma de la P1 + el ramo y el anillo de Jimena).
STALL = "her small wooden herb stall with glass jars of dried herbs under a palm-leaf awning, several jars knocked over"
STALL2 = "her small wooden herb stall with glass jars of dried herbs under a palm-leaf awning, all the jars standing upright again"  # desde r2
BOX = "a cardboard box half full of glass jars of herbs"
ARCH = "a white flower wedding arch"
SUVS = "black SUVs with dark tinted windows, no logos and no license plates"
BOUQUET = "a small round bouquet of white flowers"
# Anclas de identidad y ropa: las mismas de la Parte 1 (make_sheets.py) + Jimena. Solo Tiburcia chongo blanco, vestido azul marino de florecitas, mandil blanco y rebozo gris;
# solo Bastián traje de lino azul cielo y copete castaño claro (villano); solo Iker pelirrojo de rizos con camisa verde menta de palmeras (secuaz);
# solo Belarmino sombrero de fieltro café, bigote gris grueso y camisa vaquera crema (figura de poder); solo Zacarías rapado con barba negra y traje gris oscuro (escolta);
# solo Jimena vestido de novia blanco de satín con mangas largas de encaje, velo largo y chongo bajo castaño oscuro.
TIB = ("@{TIBURCIA_OSUNA} (76-year-old Mexican woman, short and stout, deeply tanned wrinkled skin, white hair pulled back in a low bun, small silver earrings, "
       "a faded navy-blue cotton dress with tiny white flowers, a white apron with a front pocket, a grey rebozo shawl over her shoulders, brown leather sandals)")
BAS = ("@{BASTIAN_TALAMANTES} (29-year-old Mexican man, light skin, slim and tall, styled light-brown hair with a quiff, clean-shaven, a sky-blue slim-fit linen suit, "
       "an open-collar white shirt with no tie, white sneakers, a thin gold chain bracelet)")
IKE = ("@{IKER_BARAJAS} (28-year-old Mexican man, lanky, olive skin, curly dark-red hair, a short reddish beard, a loose mint-green short-sleeve shirt with a palm-leaf print, "
       "beige chinos, brown boat shoes)")
BEL = ("@{BELARMINO_ARCINIEGA} (63-year-old Mexican man, broad and solid, tanned skin, thick grey hair combed back, a thick grey mustache, a dark brown felt cowboy hat, "
       "a cream long-sleeve western shirt with pearl snaps, dark jeans, a big plain silver belt buckle, brown cowboy boots)")
ZAC = ("@{ZACARIAS_MAGANA} (41-year-old Mexican man, burly, brown skin, shaved head, a short black beard, a charcoal-grey suit over a black shirt with no tie, black shoes)")
JIM = ("@{JIMENA_ARCINIEGA} (27-year-old Mexican woman, light-brown skin, slim, long dark-brown hair in a low elegant bun under a long sheer white veil, small pearl earrings, "
       "a simple long white satin wedding dress with a high lace neckline and long lace sleeves, white satin heels)")
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
    return f"DIALOGUE (exact Spanish words, nothing else): {who} says {said} {desc} {who} {VOICE}, {tone}. {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    """Plano de una persona: mirada a un lado sin nombrar al otro + ONE + ALONE (regla camionero v1)."""
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

# Encuadres tipo Atrium (fuentes/atrium-vista/encuadres.md): OTS ~50 %, single ~25 %, two-shot ~15 %, grupo ~10 %.
# La persona de espaldas va con su @{ASSET} + pelo y ropa vistos desde atrás (así Omni no mete un doble ni un desconocido).
# Cada clip OTS/two/grupo es una tupla (prompt_nuevo, prompt_one): desde el intento ONE_FROM+1 (4-6) o con --one vuelve al single.
# Bordes (geografía fija): Belarmino, Tiburcia o Jimena le hablan a Bastián -> espalda de Bastián en el borde RIGHT; Belarmino le habla a Iker -> espalda de Iker RIGHT;
# Bastián le habla a Belarmino o a Jimena -> espalda de ellos en el borde LEFT; Jimena le habla a su padre (a su izquierda) -> espalda de Belarmino LEFT;
# Belarmino o Tiburcia le hablan a Jimena (a la derecha de ellos) -> espalda de Jimena RIGHT; Jimena le habla a Tiburcia -> espalda de Tiburcia LEFT.
TIB_B = "@{TIBURCIA_OSUNA} seen from behind (white hair in a low bun, grey rebozo over her shoulders, faded navy-blue dress, white apron ties at her back)"
BAS_B = "@{BASTIAN_TALAMANTES} seen from behind (styled light-brown hair, sky-blue linen suit jacket, slim and tall)"
IKE_B = "@{IKER_BARAJAS} seen from behind (curly dark-red hair, mint-green palm-print short-sleeve shirt, lanky)"
BEL_B = "@{BELARMINO_ARCINIEGA} seen from behind (dark brown felt cowboy hat, thick grey hair at the nape, cream western shirt, broad shoulders)"
JIM_B = "@{JIMENA_ARCINIEGA} seen from behind (dark-brown hair in a low bun under a long sheer white veil, long white satin wedding dress with lace sleeves)"
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

TL = f"standing on the LEFT behind {STALL}"                                                 # Tiburcia (frascos tirados, hasta r2)
TL2 = f"standing on the LEFT behind {STALL2}"                                               # Tiburcia (frascos levantados, desde r2)
BR = f"standing on the RIGHT in front of {ARCH}"                                             # Bastián (hasta r1)
BR2 = f"standing on the RIGHT in front of {ARCH}, the knees of his sky-blue trousers dusty"   # Bastián (después de recoger los frascos)
IR = f"standing on the RIGHT holding {BOX}, a step behind the groom"                         # Iker (con la caja)
IR2 = "standing on the RIGHT a step behind the groom, near the flower arch, his hands empty"  # Iker (desde r2)
BL = f"standing on the LEFT beside the herb stall, next to the old woman, {SUVS} parked behind him"   # Belarmino
JL = f"standing on the LEFT at her father's right, toward the center of the plaza, holding {BOUQUET}"   # Jimena (con ramo, hasta c20)
JL2 = "standing on the LEFT at her father's right, toward the center of the plaza, her hands empty"    # Jimena (sin ramo, desde c20)

CLIPS = [
 # 1. Gancho (0-2 s): Belarmino YA hablando, ordena levantar los frascos.  OTS (Bastián de espaldas, RIGHT)
 ("c01", D8("c01"), (talk("c01", "Belarmino", ots(f"Close-up of {BEL} {PLZ0}, {BL}, talking from the very first frame, calm and dangerous, he points his chin at the knocked-over jars", BAS_B, "RIGHT") + " " + MOUTH("Belarmino", "Bastián"),
     "calm, dangerous, slow"),
   talk("c01", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, talking from the very first frame, calm and dangerous", "RIGHT"), "calm, dangerous, slow"))),
 ("c02", D8("c02"), (talk("c02", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR}, pale, a nervous smile, he raises both palms", BEL_B, "LEFT") + " " + MOUTH("Bastián", "Belarmino"),
     "nervous, pleading"),
   talk("c02", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR}, pale, a nervous smile, he raises both palms", "LEFT"), "nervous, pleading"))),
 ("c03", D8("c03"), (talk("c03", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL}, serene and wise, she folds her hands on her apron", BAS_B, "RIGHT") + " " + MOUTH("Tiburcia", "Bastián"),
     "serene, wise, slow"),
   talk("c03", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL}, serene and wise", "RIGHT"), "serene, wise, slow"))),
 # r1: Bastián, de traje, se agacha a recoger un frasco (single)
 ("r1", 6, one(f"Medium shot of {BAS} {PLZ}, he crouches on the stone ground of the plaza and picks up a glass jar of dried herbs with both hands, humiliated, his sky-blue suit wrinkling", "LEFT")
           + " Slow push-in. No dialogue."),
 # c04 two-shot: Iker quiere irse
 ("c04", 6, (talk("c04", "Iker", two(f"{BAS} on the LEFT crouching on the ground picking up a jar, and {IKE} on the RIGHT standing, {BOX} in his hands, {PLZ0}, framed from the knees up; "
            f"Iker sets the box down on the ground and backs away one step, cowardly, slightly closer to the camera and in sharper focus") + " " + MOUTH("Iker", "Bastián"),
     "cowardly, quick"),
   talk("c04", "Iker", one(f"Close-up of {IKE} {PLZ}, {IR}, cowardly, he backs away one step", "LEFT"), "cowardly, quick"))),
 ("c05", D8("c05"), (talk("c05", "Belarmino", ots(f"Close-up of {BEL} {PLZ0}, {BL}, he raises one finger, firm, without raising his voice", IKE_B, "RIGHT") + " " + MOUTH("Belarmino", "Iker"),
     "firm, calm, dry"),
   talk("c05", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, he raises one finger, firm", "RIGHT"), "firm, calm, dry"))),
 # r2 grupo mudo: Bastián e Iker levantan los frascos en el puesto; Tiburcia, Belarmino y Zacarías miran
 ("r2", 6, (f"Medium wide shot from the knees up {PLZ0}: in the center {BAS} and {IKE} put the glass jars back upright on the herb stall, one by one, ashamed; "
            f"on the LEFT behind the stall {TIB} watches calmly, with {BEL} standing beside her and {ZAC} one step behind him; {ARCH} on the RIGHT; only these five people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {BAS} {PLZ}, in silence, he puts a glass jar of herbs back upright on a wooden stall, humiliated", "LEFT") + " Slow push-in. No dialogue.")),
 # r3: presentación de Jimena (personaje nuevo), plano medio con el vestido completo
 ("r3", 6, f"Medium shot of {JIM} {PLZ}, {JL}, she has just arrived and is already standing in place, confused, she looks from her father to the groom, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a wedding dress')}. Slow push-in. No dialogue."),
 # 2. La novia se entera
 ("c06", D8("c06"), (talk("c06", "Jimena", ots(f"Close-up of {JIM} {PLZ0}, {JL}, confused and worried, she looks at her father", BEL_B, "LEFT") + " " + MOUTH("Jimena", "Belarmino"),
     "confused, worried"),
   talk("c06", "Jimena", one(f"Close-up of {JIM} {PLZ}, {JL}, confused and worried", "LEFT"), "confused, worried"))),
 ("c07", D8("c07"), (talk("c07", "Belarmino", ots(f"Close-up of {BEL} {PLZ0}, {BL}, serious, his voice soft for his daughter", JIM_B, "RIGHT") + " " + MOUTH("Belarmino", "Jimena"),
     "serious, soft, sad"),
   talk("c07", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, serious, his voice soft", "RIGHT"), "serious, soft, sad"))),
 ("c08", D8("c08"), (talk("c08", "Jimena", ots(f"Close-up of {JIM} {PLZ0}, {JL}, surprised and moved, her eyes shine", TIB_B, "LEFT") + " " + MOUTH("Jimena", "Tiburcia"),
     "surprised, moved"),
   talk("c08", "Jimena", one(f"Close-up of {JIM} {PLZ}, {JL}, surprised and moved, her eyes shine", "LEFT"), "surprised, moved"))),
 ("c09", D8("c09"), (talk("c09", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL2}, tender, a sad little smile", JIM_B, "RIGHT") + " " + MOUTH("Tiburcia", "Jimena"),
     "tender, sad, slow"),
   talk("c09", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL2}, tender, a sad little smile", "RIGHT"), "tender, sad, slow"))),
 ("c10", D8("c10"), (talk("c10", "Bastián", ots(f"Close-up of {BAS} {PLZ0}, {BR2}, a desperate smile, he opens his hands toward the bride", JIM_B, "LEFT") + " " + MOUTH("Bastián", "Jimena"),
     "desperate, flattering"),
   talk("c10", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR2}, a desperate smile, he opens his hands", "LEFT"), "desperate, flattering"))),
 ("c11", 6, (talk("c11", "Jimena", ots(f"Close-up of {JIM} {PLZ0}, {JL}, offended, she lifts her chin, the bouquet held tight", BAS_B, "RIGHT") + " " + MOUTH("Jimena", "Bastián"),
     "offended, cold"),
   talk("c11", "Jimena", one(f"Close-up of {JIM} {PLZ}, {JL}, offended, she lifts her chin", "RIGHT"), "offended, cold"))),
 # c12 two-shot de los dos amigos: Iker se lava las manos
 ("c12", D8("c12"), (talk("c12", "Iker", two(f"{BAS} {BR2} on the LEFT and {IKE} {IR2} on the RIGHT, in profile facing each other in front of the flower arch {PLZ0}, framed from the waist up; "
            f"Iker talks toward the bride off frame on the left, cowardly, slightly closer to the camera and in sharper focus; Bastián turns to look at him in disbelief") + " " + MOUTH("Iker", "Bastián"),
     "cowardly, fast"),
   talk("c12", "Iker", one(f"Close-up of {IKE} {PLZ}, {IR2}, cowardly", "LEFT"), "cowardly, fast"))),
 # c13 Bastián contra Iker: single
 ("c13", 6, talk("c13", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR2}, furious with his friend, he turns his head to him", "RIGHT"),
     "furious, betrayed")),
 # 3. El beso en la mano
 ("c14", 6, (talk("c14", "Belarmino", ots(f"Close-up of {BEL} {PLZ0}, {BL}, calm, he nods toward the old woman", BAS_B, "RIGHT") + " " + MOUTH("Belarmino", "Bastián"),
     "calm, firm, slow"),
   talk("c14", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, calm, he nods toward someone", "RIGHT"), "calm, firm, slow"))),
 # r4 two-shot mudo: Bastián le besa la mano a Tiburcia por encima del puesto
 ("r4", 6, (two(f"{TIB} on the LEFT behind the herb stall and {BAS} on the RIGHT, in profile facing each other over the stall {PLZ0}, framed from the waist up; "
            f"Tiburcia holds out her wrinkled hand, Bastián bends forward stiffly and kisses the back of her hand, humiliated; Tiburcia stays serene") + " Slow push-in. " + MUTE,
   one(f"Close-up of {TIB} {PLZ}, {TL2}, in silence, serene, she holds out her hand and looks down at someone bending over it", "RIGHT") + " Slow push-in. No dialogue.")),
 ("c15", D8("c15"), (talk("c15", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL2}, she pulls her hand back slowly, wise and dry", BAS_B, "RIGHT") + " " + MOUTH("Tiburcia", "Bastián"),
     "dry, wise, calm"),
   talk("c15", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL2}, wise and dry", "RIGHT"), "dry, wise, calm"))),
 # 4. La novia suspende la boda: llanto contenido (single), el anillo y el ramo
 ("c16", D8("c16"), talk("c16", "Jimena", one(f"Close-up of {JIM} {PLZ}, {JL}, her eyes fill with tears but her voice is firm, she lifts her veil from her face", "RIGHT"),
     "hurt, firm, emotional")),
 ("i01", 6, f"Close-up insert {PLZ0}: a slim hand in a long white lace sleeve sets a gold engagement ring down on the wooden herb stall, between the glass jars of dried herbs. "
            f"Only the hand, the ring and the jars, no face, no letters. No dialogue."),
 ("c17", 6, (talk("c17", "Jimena", ots(f"Close-up of {JIM} {PLZ0}, {JL}, cold and dignified, tears on her cheeks", BAS_B, "RIGHT") + " " + MOUTH("Jimena", "Bastián"),
     "cold, dignified, final"),
   talk("c17", "Jimena", one(f"Close-up of {JIM} {PLZ}, {JL}, cold and dignified", "RIGHT"), "cold, dignified, final"))),
 # r5 grupo mudo: la plaza se queda helada; Bastián solo frente al arco
 ("r5", 6, (f"Medium wide shot from the knees up {PLZ0}: on the LEFT {TIB} {TL2}, {BEL} beside her and {JIM} at her father's right, all three looking at the groom; "
            f"on the RIGHT {BAS} stands alone in front of {ARCH}, frozen, and {IKE} a few steps behind him looks away; only these five people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {BAS} {PLZ}, {BR2}, alone in silence, frozen, he looks at the ring on the stall", "LEFT") + " Slow push-in. No dialogue.")),
 # c18 súplica: single
 ("c18", D8("c18"), talk("c18", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR2}, desperate, he glances back toward the church", "LEFT"),
     "desperate, pleading")),
 ("c19", D8("c19"), (talk("c19", "Belarmino", ots(f"Close-up of {BEL} {PLZ0}, {BL}, a cold half smile, he adjusts his felt hat", BAS_B, "RIGHT") + " " + MOUTH("Belarmino", "Bastián"),
     "cold, ironic, firm"),
   talk("c19", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, a cold half smile, he adjusts his felt hat", "RIGHT"), "cold, ironic, firm"))),
 # c20 two-shot: Jimena le da su ramo a Tiburcia (desde aquí el ramo es de Tiburcia)
 ("c20", D8("c20"), (talk("c20", "Jimena", two(f"{TIB} on the LEFT behind the herb stall and {JIM} on the RIGHT, in profile facing each other {PLZ0}, framed from the waist up; "
            f"Jimena gives {BOUQUET} to Tiburcia with both hands, emotional, slightly closer to the camera and in sharper focus") + " " + MOUTH("Jimena", "Tiburcia"),
     "emotional, sweet, humble"),
   talk("c20", "Jimena", one(f"Close-up of {JIM} {PLZ}, {JL}, emotional, she holds out the bouquet with both hands", "LEFT"), "emotional, sweet, humble"))),
 ("c21", D8("c21"), (talk("c21", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL2}, holding {BOUQUET}, a warm tender smile, her eyes shine", JIM_B, "RIGHT") + " " + MOUTH("Tiburcia", "Jimena"),
     "warm, tender"),
   talk("c21", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL2}, holding {BOUQUET}, a warm tender smile", "RIGHT"), "warm, tender"))),
 # c22 two-shot: Belarmino le ordena a Zacarías quitar el arco
 ("c22", D8("c22"), (talk("c22", "Belarmino", two(f"{BEL} {BL} in the foreground on the LEFT and {ZAC} one step behind him at his shoulder {PLZ0}, framed from the waist up; "
            f"Belarmino gives the order calmly without turning, pointing with his open hand toward the flower arch on the right, slightly closer to the camera and in sharper focus; Zacarías nods") + " " + MOUTH("Belarmino", "Zacarías"),
     "calm, commanding"),
   talk("c22", "Belarmino", one(f"Close-up of {BEL} {PLZ}, {BL}, calm and commanding", "RIGHT"), "calm, commanding"))),
 # 5. Gancho: Bastián llama a su papá (single, llamada) y Tiburcia contesta
 ("c23", D8("c23"), talk("c23", "Bastián", one(f"Close-up of {BAS} {PLZ}, {BR2}, a phone pressed to his ear, he turns half away and speaks low and fast, humiliated and resentful", "LEFT"),
     "low, resentful, fast")),
 # r6 grupo mudo: Belarmino pasa el brazo por los hombros de Tiburcia; Jimena a su lado; Bastián al teléfono a la derecha
 ("r6", 6, (f"Medium wide shot from the knees up {PLZ0}: on the LEFT {BEL} puts an arm around the shoulders of {TIB}, who holds {BOUQUET}, and {JIM} {JL2} stands beside them, the three calm; "
            f"on the RIGHT {BAS} in front of {ARCH} talks on a phone, turned half away; only these four people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {TIB} {PLZ}, {TL2}, in silence, holding {BOUQUET}, calm, she listens to someone talking on a phone", "RIGHT") + " Slow push-in. No dialogue.")),
 ("c24", 6, (talk("c24", "Tiburcia", ots(f"Close-up of {TIB} {PLZ0}, {TL2}, holding {BOUQUET}, calm, a knowing little smile", BAS_B, "RIGHT") + " " + MOUTH("Tiburcia", "Bastián"),
     "calm, knowing, slow"),
   talk("c24", "Tiburcia", one(f"Close-up of {TIB} {PLZ}, {TL2}, holding {BOUQUET}, calm, a knowing little smile", "RIGHT"), "calm, knowing, slow"))),
 # CTA con carisma (después del BLACK): Jimena sola en la plaza, a cámara
 ("c25", 10, talk("c25", "Jimena", f"Close-up from the chest up of {JIM} {PLZ0}, alone in the plaza, her hands empty, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a brave little smile and wipes one tear with her finger, makes a short pause, "
     f"pushes her veil back over her shoulder, raises one eyebrow, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, brave, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("tears on her cheeks", "shining eyes"), ("wipes one tear with her finger", "touches her cheek"),
        ("pointing", "gesturing"), ("shaken", "surprised"), ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("tremble", "move"),
        ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"desperate" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Le echó sus hierbas a la basura.", "Le tiró sus hierbas."), ("¿Y a las cualquieras sí se les tira todo?", "¿Así hablas de ella?"),
        ("Y tú humillaste a la primera que te estorbó.", "Y tú no la respetaste."), ("Me lo da el miedo que trae.", "Me lo da la prisa."),
        ("Un tal Belarmino me dejó sin novia.", "Se cayó la boda."), ("Tú no te vas a ningún lado, pelirrojo.", "Tú también te quedas, pelirrojo."),
        ("Tu novio corrió de su puesto a mi madrina, mija.", "Tu novio no respetó a mi madrina, mija."),
        ("calm and dangerous", "calm and serious"), ("dangerous", "serious"), ("he points his chin at the knocked-over jars", "he looks at the jars"),
        ("humiliated and resentful", "quiet"), ("humiliated", "quiet"), ("furious with his friend", "surprised by his friend"), ("betrayed", "surprised"),
        ("cowardly", "quick"), ("desperate", "sincere"), ("flattering", "polite"), ("resentful", "serious"), ("commanding", "firm"), ("knocked over", "out of place"),
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
          "Vertical scene from a Mexican TV drama, realistic, the last glow of sunset in the palm oasis of San Ignacio, Baja California Sur, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, desert town plaza with date palms in Baja California Sur at dusk, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{TIBURCIA_OSUNA}", "a short stout old Mexican woman with white hair in a low bun, a faded navy-blue flowered dress, a white apron and a grey rebozo"),
         ("@{BASTIAN_TALAMANTES}", "a slim tall Mexican man around thirty with styled light-brown hair and a sky-blue linen suit"),
         ("@{IKER_BARAJAS}", "a lanky Mexican man around thirty with curly dark-red hair, a short reddish beard and a mint-green palm-print shirt"),
         ("@{BELARMINO_ARCINIEGA}", "a broad Mexican man in his sixties with a thick grey mustache, a dark brown felt cowboy hat and a cream western shirt"),
         ("@{ZACARIAS_MAGANA}", "a burly Mexican man around forty with a shaved head, a short black beard and a charcoal-grey suit"),
         ("@{JIMENA_ARCINIEGA}", "a slim Mexican woman in her late twenties with dark-brown hair in a low bun under a long white veil and a long-sleeved white satin wedding dress"),
         (" @{LOC_PLAZASANIGN}", "")]
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

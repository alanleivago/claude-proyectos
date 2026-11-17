"""Genera los clips de hamaca-comalcalco PARTE 1 (La Hamaca de Comalcalco, variante transformada de la saga de don Evaristo de @atriumstories_,
"Lo trataron como un estorbo… sin saber que era millonario" (P3, 7706316327023119647; la saga suma 1.06M): aquí, en una finca de cacao de Comalcalco, Tabasco,
la nuera manda a la suegra a colgar su hamaca en el asoleadero y le da hasta el domingo para irse a una casa de reposo; la madre llega con el notario
y revela que la finca y el terreno son suyos y que los estaba poniendo a prueba; VISTA STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# Gancho 0-2 s (c01, la villana hablando, sin plano previo de objetos): Isaura en su mecedora con el celular y el abanico; Fortunata de pie con su hamaca enrollada en brazos:
# "Su hamaca se cuelga en el asoleadero, suegra. Y el domingo se me va a la casa de reposo." (injusticia + plazo).
# Plazo: el domingo; vuelve invertido en c24: "Pues el domingo, ustedes me entregan esta casa."
# Capas: la hamaca al asoleadero -> llega el notario (r3, c06) -> la finca y el terreno son de ella (c08) -> los puso a prueba (c11) -> Zenobia vendió su molino (c15)
# -> la nuera recula y luego insinúa que Zenobia sabía (c17-c21) -> plazo invertido (c24) -> el notario: el hijo ya había ido a preguntar cómo quitarle las tierras (c25-c26)
# -> "¿Tú sabías, Norberto?" (c27) -> Isaura lo entrega (c28).
# Geografía fija (corredor de la casa nueva junto al asoleadero de cacao): Isaura a la DERECHA sentada en la mecedora; Norberto a la DERECHA de pie junto a la mecedora;
# Fortunata a la IZQUIERDA en la orilla del asoleadero con la hamaca en brazos; Zenobia a la IZQUIERDA, a la izquierda de su madre; Olegario a la IZQUIERDA en el camino, junto a Fortunata.
# Plano de presentación: Isaura c01, Fortunata r1, Norberto r2, Olegario r3, Zenobia r5. CTA (c29): Fortunata sola a cámara. Sin Navidad.
# Ningún plano abre con objetos, manos o algo que cae: los insertos van solo en medio.
CAC0 = ("on the front porch of a new two-story white house with a tiled floor in Comalcalco, Tabasco @{LOC_CACAOCOMALC} in the late afternoon: beside it an old cement cacao drying patio "
        "covered with brown cacao beans spread out to dry, cacao trees with yellow and red pods and tall shade trees behind, humid golden light; no readable text, no signs, no logos")
CAC = CAC0 + "; nobody else in the background, no extras, nobody besides the person described"
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
HAMMOCK = "a rolled-up white cotton hammock"
CHAIR = "a white wicker rocking chair"
FAN = "a red folding hand fan"
FOLDER = "a brown leather folder"
# Anclas de identidad y ropa (ver make_sheets.py). Solo Fortunata trenza gris con listón rojo y blusa blanca bordada (figura de autoridad);
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
# Bordes: Isaura/Norberto le hablan a Fortunata -> espalda de Fortunata en el borde LEFT; Fortunata les habla -> espalda de Isaura (sentada) o de Norberto en el borde RIGHT;
# Olegario le habla a Norberto -> espalda de Norberto en el borde RIGHT; Norberto le habla a Olegario -> espalda de Olegario en el borde LEFT;
# dentro del par Zenobia-Fortunata, Zenobia siempre a la izquierda: Zenobia le habla a su madre -> espalda de Fortunata RIGHT; Fortunata a Zenobia -> espalda de Zenobia LEFT.
FOR_B = "@{FORTUNATA_LANDERO} seen from behind (long grey braid tied with a red ribbon, white embroidered blouse, long dark-green skirt, a rolled white hammock in her arms)"
ISA_B = "@{ISAURA_GARDUZA} seen from behind, seated in the white wicker rocking chair (shoulder-length wavy dyed blonde hair, fuchsia satin blouse)"
NOR_B = "@{NORBERTO_LANDERO} seen from behind (short black hair, crisp white long-sleeve shirt, tall with a thick neck)"
ZEN_B = "@{ZENOBIA_LANDERO} seen from behind (black hair in a low bun, lilac t-shirt, the ties of a checked apron at her back)"
OLE_B = "@{OLEGARIO_OCHOA} seen from behind (short white hair, beige linen jacket, short and plump)"
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

FL = f"standing on the LEFT at the edge of the cacao drying patio, holding {HAMMOCK} in her arms"     # Fortunata
IR = f"sitting on the RIGHT in {CHAIR} on the porch, {FAN} in one hand and a phone in the other"     # Isaura
NR = f"standing on the RIGHT on the porch beside {CHAIR}"                                            # Norberto
ZL = "standing on the LEFT at the edge of the cacao drying patio, beside her mother"                  # Zenobia
OL = f"standing on the LEFT on the path beside the cacao drying patio, holding {FOLDER}"              # Olegario

CLIPS = [
 # 1. Gancho (0-2 s): Isaura YA hablando desde la mecedora, Fortunata con su hamaca en brazos; plazo del domingo.  OTS (Fortunata de espaldas, LEFT)
 ("c01", 6, (talk("c01", "Isaura", ots(f"Medium shot of {ISA} {CAC0}, {IR}, talking from the very first frame, fanning herself lazily, cold and comfortable, "
     f"she barely looks up from her phone", FOR_B, "LEFT") + " " + MOUTH("Isaura", "Fortunata"), "cold, comfortable, mocking"),
   talk("c01", "Isaura", f"Medium shot of {ISA} {CAC}, {IR}, talking from the very first frame, fanning herself lazily, cold and comfortable, "
     f"she barely looks up from her phone; {gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a fuchsia blouse')}.", "cold, comfortable, mocking"))),
 # r1: presentación de Fortunata como two-shot mudo (cuerpo entero visible)
 ("r1", 6, (two(f"{FOR} on the LEFT {FL}, in profile facing right, and {ISA} on the RIGHT {IR}, in profile facing left, {CAC0}, framed from the knees up so both outfits show clearly; "
            f"Fortunata holds the hammock close to her chest and lifts her eyes slowly, calm and dignified, slightly closer to the camera and in sharper focus") + " Slow push-in. " + MUTE,
   f"Medium shot of {FOR} {CAC}, {FL}, she holds the hammock close to her chest and lifts her eyes slowly, calm and dignified, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('old woman with a grey braid')}. Slow push-in. No dialogue.")),
 ("c02", 6, (talk("c02", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, calm and firm", ISA_B, "RIGHT") + " " + MOUTH("Fortunata", "Isaura"),
     "calm, firm, slow"),
   talk("c02", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, calm and firm", "RIGHT"), "calm, firm, slow"))),
 # c03 (la burla clave): single
 ("c03", 6, talk("c03", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR}, she laughs once and points the closed fan at the hammock", "LEFT"),
     "mocking, cruel")),
 # r2: presentación de Norberto (single PRES)
 ("r2", 6, f"Medium shot of {NOR} {CAC}, {NR}, he has just come out of the house, he adjusts his silver wristwatch and looks down from the porch, impatient, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('man in a white shirt')}. Slow push-in. No dialogue."),
 ("c04", 6, (talk("c04", "Norberto", ots(f"Close-up of {NOR} {CAC0}, {NR}, impatient, he crosses his arms", FOR_B, "LEFT") + " " + MOUTH("Norberto", "Fortunata"),
     "impatient, cold"),
   talk("c04", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, impatient, he crosses his arms", "LEFT"), "impatient, cold"))),
 ("c05", 6, (talk("c05", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, she looks up at her son, serene and firm", NOR_B, "RIGHT") + " " + MOUTH("Fortunata", "Norberto"),
     "serene, firm"),
   talk("c05", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, she looks up at her son, serene and firm", "RIGHT"), "serene, firm"))),
 # r3: presentación de Olegario (single PRES), ya en su lugar en el camino
 ("r3", 6, f"Medium shot of {OLE} {CAC}, {OL}, already standing in place, he pushes up his round glasses and holds the folder against his chest, formal and polite, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('man in a beige linen jacket')}. Slow push-in. No dialogue."),
 ("c06", 6, (talk("c06", "Olegario", ots(f"Close-up of {OLE} {CAC0}, {OL}, polite and formal, he nods once", NOR_B, "RIGHT") + " " + MOUTH("Olegario", "Norberto"),
     "polite, formal"),
   talk("c06", "Olegario", one(f"Close-up of {OLE} {CAC}, {OL}, polite and formal, he nods once", "RIGHT"), "polite, formal"))),
 ("c07", 6, (talk("c07", "Norberto", ots(f"Close-up of {NOR} {CAC0}, {NR}, he laughs through his nose, dismissive", OLE_B, "LEFT") + " " + MOUTH("Norberto", "Olegario"),
     "dismissive, arrogant"),
   talk("c07", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, he laughs through his nose, dismissive", "LEFT"), "dismissive, arrogant"))),
 # c08 grupo: la revelación (Olegario abre la carpeta junto a Fortunata; Norberto en el corredor)
 ("c08", 6, (talk("c08", "Olegario", f"Medium wide shot from the knees up {CAC0}: on the LEFT {OLE} {OL}, he opens the folder and shows the papers toward the porch; beside him {FOR} {FL}, calm; "
            f"on the RIGHT {NOR} {NR}, frozen; only these three people, no extras. " + GMOUTH("Olegario"), "calm, precise"),
   talk("c08", "Olegario", one(f"Close-up of {OLE} {CAC}, {OL}, he opens the folder and looks up, calm and precise", "RIGHT"), "calm, precise"))),
 ("r4", 6, one(f"Close-up of {ISA} {CAC}, {IR}, in silence, she stops fanning and slowly lowers her phone, her mouth half open", "LEFT") + " Slow push-in. No dialogue."),
 ("c09", 6, (talk("c09", "Isaura", ots(f"Close-up of {ISA} {CAC0}, {IR}, astonished, she sits up in the rocking chair", OLE_B, "LEFT") + " " + MOUTH("Isaura", "Olegario"),
     "astonished, greedy"),
   talk("c09", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR}, astonished, she sits up in the rocking chair", "LEFT"), "astonished, greedy"))),
 ("c10", 6, (talk("c10", "Norberto", ots(f"Close-up of {NOR} {CAC0}, {NR}, confused, a little offended", FOR_B, "LEFT") + " " + MOUTH("Norberto", "Fortunata"),
     "confused, offended"),
   talk("c10", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, confused, a little offended", "LEFT"), "confused, offended"))),
 ("c11", 6, (talk("c11", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, quiet, her eyes shine", NOR_B, "RIGHT") + " " + MOUTH("Fortunata", "Norberto"),
     "quiet, sincere, slow"),
   talk("c11", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, quiet, her eyes shine", "RIGHT"), "quiet, sincere, slow"))),
 ("c12", 6, (talk("c12", "Norberto", two(f"{FOR} on the LEFT {FL}, in profile facing right, and {NOR} on the RIGHT {NR}, in profile facing left, {CAC0}, framed from the knees up; "
            f"Norberto spreads his hands, offended, slightly closer to the camera and in sharper focus") + " " + MOUTH("Norberto", "Fortunata"),
     "offended, defensive"),
   talk("c12", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, he spreads his hands, offended", "LEFT"), "offended, defensive"))),
 ("c13", 6, (talk("c13", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, she squeezes the hammock, hurt but dignified, wearing her long plain dark green skirt (not white, no embroidery on the skirt) exactly as in her reference sheet", NOR_B, "RIGHT") + " " + MOUTH("Fortunata", "Norberto"),
     "hurt, dignified"),
   talk("c13", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, she squeezes the hammock, hurt but dignified", "RIGHT"), "hurt, dignified"))),
 # i01: dónde la mandaron a dormir (inserto en medio)
 ("i01", 6, f"Close-up insert {CAC0}: in the corner of the cement cacao drying patio, under a small tin roof, a thin straw sleeping mat lies on the floor beside sacks of cacao beans, "
            f"brown beans drying all around. Only the mat, the sacks and the beans, no people, no letters. No dialogue."),
 # r5 grupo mudo: presentación de Zenobia (ya en su lugar junto a su madre) con la geografía completa
 ("r5", 6, (f"Medium wide shot from the knees up {CAC0}: on the LEFT {ZEN} {ZL}, catching her breath, her whole outfit clearly visible, she looks at her mother; beside her {FOR} {FL}; "
            f"on the RIGHT on the porch {NOR} {NR} and {ISA} {IR}; only these four people, no extras. Slow push-in. " + MUTE,
   f"Medium shot of {ZEN} {CAC}, {ZL}, catching her breath, worried, "
           f"{gaze('RIGHT')}; {PRES}; {ALONE}; {NODOUBLE('woman in a lilac t-shirt and checked apron')}. Slow push-in. No dialogue.")),
 ("c14", 6, (talk("c14", "Zenobia", two(f"{ZEN} on the LEFT and {FOR} beside her on the RIGHT holding the rolled hammock, in profile facing each other at the edge of the cacao drying patio {CAC0}, "
            f"framed from the waist up; Zenobia, confused and hurt, slightly closer to the camera and in sharper focus") + " " + MOUTH("Zenobia", "Fortunata"),
     "confused, hurt"),
   talk("c14", "Zenobia", one(f"Close-up of {ZEN} {CAC}, {ZL}, confused and hurt", "RIGHT"), "confused, hurt"))),
 # c15 (el sacrificio, casi llanto): single
 ("c15", 6, talk("c15", "Zenobia", one(f"Close-up of {ZEN} {CAC}, {ZL}, her eyes shine, she wipes her hands on the checked apron", "RIGHT"),
     "emotional, sad")),
 ("c16", 6, (talk("c16", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, tender, a small warm smile for her daughter", ZEN_B, "LEFT") + " " + MOUTH("Fortunata", "Zenobia"),
     "tender, warm"),
   talk("c16", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, tender, a small warm smile", "LEFT"), "tender, warm"))),
 ("c17", 6, (talk("c17", "Isaura", ots(f"Close-up of {ISA} {CAC0}, {IR}, suddenly sweet, a big fake smile, she puts the phone down", FOR_B, "LEFT") + " " + MOUTH("Isaura", "Fortunata"),
     "falsely sweet, nervous"),
   talk("c17", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR}, suddenly sweet, a big fake smile", "LEFT"), "falsely sweet, nervous"))),
 ("c18", 6, (talk("c18", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, a dry half smile", ISA_B, "RIGHT") + " " + MOUTH("Fortunata", "Isaura"),
     "dry, ironic, calm"),
   talk("c18", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, a dry half smile", "RIGHT"), "dry, ironic, calm"))),
 ("c19", 6, (talk("c19", "Norberto", ots(f"Close-up of {NOR} {CAC0}, {NR}, he comes down one step from the porch, impatient", FOR_B, "LEFT") + " " + MOUTH("Norberto", "Fortunata"),
     "impatient, pushy"),
   talk("c19", "Norberto", one(f"Close-up of {NOR} {CAC}, {NR}, impatient, pushy", "LEFT"), "impatient, pushy"))),
 ("c20", 6, (talk("c20", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, she glances at the folder and back at her son, sad", NOR_B, "RIGHT") + " " + MOUTH("Fortunata", "Norberto"),
     "sad, firm"),
   talk("c20", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, sad and firm", "RIGHT"), "sad, firm"))),
 ("c21", 6, (talk("c21", "Isaura", ots(f"Close-up of {ISA} {CAC0}, {IR}, she narrows her eyes, fanning herself again, venomous", ZEN_B, "LEFT") + " " + MOUTH("Isaura", "Zenobia"),
     "venomous, insinuating"),
   talk("c21", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR}, she narrows her eyes, fanning herself again", "LEFT"), "venomous, insinuating"))),
 ("c22", 6, (talk("c22", "Zenobia", ots(f"Close-up of {ZEN} {CAC0}, {ZL}, indignant, her voice breaks a little", ISA_B, "RIGHT") + " " + MOUTH("Zenobia", "Isaura"),
     "indignant, hurt"),
   talk("c22", "Zenobia", one(f"Close-up of {ZEN} {CAC}, {ZL}, indignant, her voice breaks a little", "RIGHT"), "indignant, hurt"))),
 ("c23", 6, (talk("c23", "Fortunata", two(f"{FOR} on the LEFT {FL}, in profile facing right, and {ISA} on the RIGHT {IR}, in profile facing left, {CAC0}, framed from the knees up; "
            f"Fortunata takes one step toward the porch, firm, slightly closer to the camera and in sharper focus") + " " + MOUTH("Fortunata", "Isaura"),
     "firm, protective"),
   talk("c23", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, firm and protective", "RIGHT"), "firm, protective"))),
 # c24 grupo: el plazo invertido (Fortunata en primer término a la izquierda; la pareja en el corredor a la derecha)
 ("c24", 6, (talk("c24", "Fortunata", f"Medium wide shot from the knees up {CAC0}: on the LEFT, closest to the camera and in sharp focus, {FOR} {FL}, firm and slow, looking at the porch; "
            f"on the RIGHT on the porch {NOR} {NR} and {ISA} {IR}, both silent and stiff; only these three people, no extras. " + GMOUTH("Fortunata"), "firm, slow, final"),
   talk("c24", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, firm, slow and final", "RIGHT"), "firm, slow, final"))),
 ("r6", 6, one(f"Close-up of {NOR} {CAC}, {NR}, in silence, he swallows and glances nervously toward the man with the folder", "LEFT") + " Slow push-in. No dialogue."),
 # c25 (el giro empieza): single del notario
 ("c25", 6, talk("c25", "Olegario", one(f"Close-up of {OLE} {CAC}, {OL}, he clears his throat and adjusts his glasses, serious", "RIGHT"),
     "serious, careful")),
 ("c26", 6, (talk("c26", "Olegario", ots(f"Close-up of {OLE} {CAC0}, {OL}, serious, looking straight at the son", NOR_B, "RIGHT") + " " + MOUTH("Olegario", "Norberto"),
     "serious, precise"),
   talk("c26", "Olegario", one(f"Close-up of {OLE} {CAC}, {OL}, serious, precise", "RIGHT"), "serious, precise"))),
 ("r7", 6, one(f"Close-up of {FOR} {CAC}, {FL}, in silence, she turns her head slowly toward her son, her calm face breaks", "RIGHT") + " Slow push-in. No dialogue."),
 ("c27", 6, (talk("c27", "Fortunata", ots(f"Close-up of {FOR} {CAC0}, {FL}, hurt, she can barely say it", NOR_B, "RIGHT") + " " + MOUTH("Fortunata", "Norberto"),
     "hurt, low, slow"),
   talk("c27", "Fortunata", one(f"Close-up of {FOR} {CAC}, {FL}, hurt, she can barely say it", "RIGHT"), "hurt, low, slow"))),
 # c28 two-shot de la pareja: Isaura lo entrega y él la mira sin creerlo
 ("c28", 6, (talk("c28", "Isaura", two(f"{ISA} {IR} and {NOR} standing beside her rocking chair, both on the porch {CAC0}, framed from the waist up, both facing the camera three-quarters toward someone at the LEFT; "
            f"Isaura raises her hands, quick and cowardly, slightly closer to the camera and in sharper focus; Norberto turns his head to look at his wife in disbelief") + " " + MOUTH("Isaura", "Norberto"),
     "quick, cowardly"),
   talk("c28", "Isaura", one(f"Close-up of {ISA} {CAC}, {IR}, she raises her hands, quick and cowardly", "LEFT"), "quick, cowardly"))),
 # i02: la carpeta en la mesita del corredor, junto al celular y el abanico rojo
 ("i02", 6, f"Close-up insert {CAC0}: {FOLDER} lies closed on a small wooden table on the porch, next to a phone and {FAN}, golden light. "
            f"Only the objects, no people, no hands, no letters. No dialogue."),
 # CTA con carisma (después del BLACK): Fortunata sola junto al asoleadero, a cámara
 ("c29", 10, talk("c29", "Fortunata", f"Close-up from the chest up of {FOR} {CAC0}, alone, holding the rolled white hammock, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a calm knowing smile, makes a short pause, raises one eyebrow, "
     f"tucks her grey braid over her shoulder, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "cold"/"cruel" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Y el domingo se me va a la casa de reposo.", "Y el domingo se va."), ("Si no tiene ni dónde colgar su hamaca.", "Usted no tiene casa."),
        ("Y tú me mandaste a dormir con el cacao.", "Y tú me mandaste afuera."), ("Y cómo quitárselas sin que supiera.", "Y qué tenía."),
        ("¿Sabías y aun así me corriste?", "¿Sabías?"), ("A lo mejor ella sí sabía.", "Qué casualidad."),
        ("she laughs once and points the closed fan at the hammock", "she smiles and looks at the hammock"), ("venomous", "calm"), ("cowardly", "quick"),
        ("greedy", "surprised"), ("falsely sweet", "sweet"), ("insinuating", "calm"), ("pushy", "serious"), ("her calm face breaks", "she looks sad"),
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
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()

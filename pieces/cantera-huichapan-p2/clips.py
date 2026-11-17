"""Genera los clips de cantera-huichapan-p2 PARTE 2 (La Cantera de Huichapan, continuación de pieces/cantera-huichapan; ritmo de la P2 de @atriumstories_ "Su jefe les cobraba lo que era gratis", cantera de Huichapan, Hidalgo, MAJESTIC STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Copia del clips.py de la Parte 1 (todas sus defensas: gatito en imagen, reload_flow, new_project, control de descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT, NOREF, parada LIMITE DE CREDITOS en gen()).
Mismas hojas que la Parte 1 (copiadas a chars/, se resuben con make_sheets.py --reupload) + BONIFACIO_URIBE (el cantero mayor). Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4).
Encuadres tipo Atrium como en pieces/costal-cuyutlan/clips.py (OTS/two-shot/grupo con respaldo single en los intentos 4-6). Si un OTS sale con un doble: python -I clips.py <ID> --one"""
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
# Gancho 0-2 s: Rosalba YA hablando en la caseta desde el frame 0 (c01, OTS desde detrás de Sotero): "Les cobraste a todos lo que era gratis, Sotero. Hoy se te acaba el turno."
# Recordatorio de la P1 (i01, el celular encendido en la bolsa de la camisa de Abdías) va DESPUÉS de c01: ningún plano abre con objetos.
# Ritmo de la P2 de Atrium (sentencia -> excusa del "malentendido" -> prueba -> orgullo herido -> despido, devolución en mano o la ley -> amenaza en el patio y réplica del honesto
# -> agradecimiento y ascenso -> el equipo gratis para todos), con detalles propios: la libreta del almacén contra la libreta negra de Sotero, "Esto te lo voy a cobrar" / "Ya cobró bastante",
# Sotero devuelve en mano delante de todos, Abdías encargado del patio y don Bonifacio (el cantero mayor que cortaba sin lentes) recibe lentes nuevos. Sin cifras.
# Misma ropa que la P1 (anclas ROS, ABD y SOT idénticas). Personaje nuevo con plano de presentación MUDO antes de hablar o ser nombrado: Bonifacio r4.
# Geografía fija. Caseta (c01-c16): Rosalba a la DERECHA junto a la ventana grande; Sotero a la IZQUIERDA, recién entrado por la puerta.
# Patio al acabar el turno (i04-c29): Abdías a la IZQUIERDA en su mesa de labrado; Sotero (c17, r2) y Rosalba (c19-c24, r5) a la DERECHA; Bonifacio al CENTRO entre los bloques. CTA (c30): Rosalba sola en el patio, a cámara. Sin Navidad.
YARD0 = ("in the open-air work yard of a pink cantera stone quarry near Huichapan, Hidalgo @{LOC_CANTERAHUICH} at the end of the shift, in low orange sunset light: big rough blocks of pink and ochre cantera stone, "
         "white stone dust on the ground, a heavy wooden carving table on the LEFT with a half-carved stone block, an old wooden shed with a tin roof, "
         "pale quarry walls cut in steps behind, dry hills with organ cactus on the horizon; no readable text, no signs, no logos")
YARD = YARD0 + "; nobody else in the background, no extras, nobody besides the person described"
CAB0 = ("inside the small office cabin of the cantera quarry near Huichapan, Hidalgo @{LOC_CASETACANT} in warm late-afternoon light: wooden walls, an old wooden desk with papers, "
        "a metal shelf with cardboard boxes of new tan leather work gloves and clear safety goggles, a big window looking down at the dusty quarry yard; no readable text, no signs, no logos")
CAB = CAB0 + "; nobody else in the background, no extras, nobody besides the person described"
# Anclas de identidad y ropa (ver make_sheets.py). Las de la P1 sin cambios. Solo Bonifacio pelo blanco corto, barba blanca de días, sombrero de palma y camisa azul cielo empolvada.
ROS = ("@{ROSALBA_MONROY} (52-year-old Mexican woman, light-brown skin, slim, short silver-grey bob haircut, small pearl earrings, no glasses, "
       "a long camel-brown wool coat over a cream turtleneck sweater, dark grey trousers, brown ankle boots, her hands kept low)")
ABD = ("@{ABDIAS_CARBAJAL} (31-year-old Mexican man, brown skin, lean, short black hair, a thin black mustache, no beard, no hat, no glasses on his face, "
       "a faded brick-red cotton work shirt with rolled sleeves covered in white stone dust, a grey bandana tied loosely around his neck, dark brown work trousers)")
SOT = ("@{SOTERO_VERASTEGUI} (56-year-old Mexican man, light skin, heavyset, completely bald head, a thick grey goatee, round wire-rimmed glasses, "
       "a mustard-and-brown plaid flannel shirt under a plain dark-green quilted vest with no letters and no logos, khaki trousers, a yellow pencil behind his right ear)")
BON = ("@{BONIFACIO_URIBE} (64-year-old Mexican man, dark brown weathered skin, thin, short white hair, white stubble, no glasses, a worn palm straw hat, "
       "a faded sky-blue long-sleeve work shirt covered in white stone dust, beige work trousers)")
# Utilería: cada objeto, uno solo, simple y nombrado; siempre igual.
GEAR = "a pair of new tan leather work gloves and clear safety goggles inside a clear plastic bag"
LEDGER = "a thick brown ledger book held against his chest with both hands"
NOTEB = "a small black notebook held up in her RIGHT hand"
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
# Bordes. Caseta: Rosalba habla -> espalda de Sotero en el borde LEFT; Sotero habla -> espalda de Rosalba en el borde RIGHT.
# Patio: Sotero/Rosalba hablan -> espalda de Abdías en el borde LEFT; Abdías les habla -> su espalda en el borde RIGHT;
# Abdías le habla a Bonifacio (al centro, a su derecha) -> espalda de Bonifacio RIGHT; Bonifacio a Abdías -> espalda de Abdías LEFT; Bonifacio a Rosalba -> espalda de Rosalba RIGHT.
ROS_B = "@{ROSALBA_MONROY} seen from behind (short silver-grey bob haircut, long camel-brown wool coat, slim build)"
SOT_B = "@{SOTERO_VERASTEGUI} seen from behind (completely bald head, plain dark-green quilted vest over a mustard-and-brown plaid flannel shirt, heavyset build)"
ABD_B = "@{ABDIAS_CARBAJAL} seen from behind (short black hair, faded brick-red work shirt covered in white stone dust, grey bandana knotted at his neck)"
BON_B = "@{BONIFACIO_URIBE} seen from behind (worn palm straw hat, short white hair at the nape, faded sky-blue work shirt covered in white stone dust, thin build)"
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

RC = "standing on the RIGHT by the big window of the office cabin, the dusty quarry yard far below"        # Rosalba (caseta)
SC = "standing on the LEFT just inside the cabin door, beside the metal shelf with the boxes of gloves"     # Sotero (caseta)
AL = "standing on the LEFT at the heavy wooden carving table with the half-carved pink stone block"         # Abdías (patio)
SR = "standing on the RIGHT of the quarry yard among the big blocks of pink stone"                           # Sotero (patio)
RR = "standing on the RIGHT of the quarry yard among the big blocks of pink stone"                           # Rosalba (patio)
BC = "standing in the CENTER of the yard between two big blocks of pink stone"                               # Bonifacio (patio)
CAB2 = (f"{SOT} on the LEFT just inside the cabin door in profile facing right, and {ROS} on the RIGHT by the big window in profile facing left, "
        f"two meters apart {CAB0}, framed from the knees up")

CLIPS = [
 # 1. Gancho (0-2 s): Rosalba YA hablando, la sentencia con el plazo del turno.  OTS (Sotero de espaldas, LEFT)
 ("c01", 6, (talk("c01", "Rosalba", ots(f"Close-up of {ROS} {CAB0}, {RC}, talking from the very first frame, cold and firm, she has just turned from the window toward the door", SOT_B, "LEFT")
     + " " + MOUTH("Rosalba", "Sotero"), "cold, firm, slow"),
   talk("c01", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, talking from the very first frame, cold and firm, she has just turned from the window toward the door", "LEFT"), "cold, firm, slow"))),
 # Recordatorio de la P1 (después del primer plano hablado)
 ("i01", 6, f"Close-up insert {YARD0}: the chest pocket of a faded brick-red work shirt covered in white stone dust, a phone inside the pocket with its screen lit, "
            f"a call in progress shown only as a green glow, nothing readable. Only the pocket and the phone, no face. No dialogue."),
 # 2. La excusa y la prueba. c02 two-shot: fija la geografía de la caseta
 ("c02", 6, (talk("c02", "Sotero", two(f"{CAB2}; Sotero, {LEDGER}, a nervous polite smile, slightly closer to the camera and in sharper focus") + " " + MOUTH("Sotero", "Rosalba"),
     "nervous, too polite, quick"),
   talk("c02", "Sotero", one(f"Close-up of {SOT} {CAB}, {SC}, {LEDGER}, a nervous polite smile", "RIGHT"), "nervous, too polite, quick"))),
 ("c03", 6, (talk("c03", "Sotero", ots(f"Close-up of {SOT} {CAB0}, {SC}, {LEDGER}, he shrugs and smiles, lying", ROS_B, "RIGHT") + " " + MOUTH("Sotero", "Rosalba"),
     "smooth, lying, friendly"),
   talk("c03", "Sotero", one(f"Close-up of {SOT} {CAB}, {SC}, {LEDGER}, he shrugs and smiles, lying", "RIGHT"), "smooth, lying, friendly"))),
 ("c04", 6, (talk("c04", "Rosalba", ots(f"Close-up of {ROS} {CAB0}, {RC}, she gestures with her head toward the metal shelf with the boxes of gloves", SOT_B, "LEFT") + " " + MOUTH("Rosalba", "Sotero"),
     "firm, cutting"),
   talk("c04", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, she gestures with her head toward the metal shelf with the boxes of gloves", "LEFT"), "firm, cutting"))),
 ("c05", 6, (talk("c05", "Rosalba", two(f"{CAB2}; Rosalba does not blink, indignant, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rosalba", "Sotero"),
     "indignant, firm"),
   talk("c05", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, she does not blink, indignant", "LEFT"), "indignant, firm"))),
 ("c06", 6, (talk("c06", "Sotero", ots(f"Close-up of {SOT} {CAB0}, {SC}, {LEDGER}, his smile turns sour, he shakes his head", ROS_B, "RIGHT") + " " + MOUTH("Sotero", "Rosalba"),
     "defensive, dismissive"),
   talk("c06", "Sotero", one(f"Close-up of {SOT} {CAB}, {SC}, {LEDGER}, his smile turns sour, he shakes his head", "RIGHT"), "defensive, dismissive"))),
 ("c07", 6, (talk("c07", "Rosalba", two(f"{CAB2}; Rosalba takes one step forward toward him, calm and cold, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rosalba", "Sotero"),
     "calm, cold, firm"),
   talk("c07", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, she takes one step forward, calm and cold", "LEFT"), "calm, cold, firm"))),
 ("c08", 6, (talk("c08", "Rosalba", ots(f"Close-up of {ROS} {CAB0}, {RC}, {NOTEB}, a hard look", SOT_B, "LEFT") + " " + MOUTH("Rosalba", "Sotero"),
     "firm, slow"),
   talk("c08", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, {NOTEB}, a hard look", "LEFT"), "firm, slow"))),
 ("i02", 6, f"Close-up insert {CAB0}: a small black notebook lying open on the old wooden desk, its pages full of illegible pencil scribbles in a long column with a check mark beside each line, "
            f"nothing readable, no numbers. Only the notebook and the desk, no people. No dialogue."),
 # r1 reacción fuerte: single
 ("r1", 6, one(f"Close-up of {SOT} {CAB}, {SC}, {LEDGER}, in silence, his polite smile freezes, a drop of sweat on his bald head, he swallows", "RIGHT") + " Slow push-in. No dialogue."),
 # 3. El orgullo herido y el castigo (c10 voz quebrada y c13 "Estás despedido": single)
 ("c09", 6, (talk("c09", "Sotero", ots(f"Close-up of {SOT} {CAB0}, {SC}, {LEDGER}, he forces a laugh, defensive", ROS_B, "RIGHT") + " " + MOUTH("Sotero", "Rosalba"),
     "defensive, a little too loud"),
   talk("c09", "Sotero", one(f"Close-up of {SOT} {CAB}, {SC}, {LEDGER}, he forces a laugh, defensive", "RIGHT"), "defensive, a little too loud"))),
 ("c10", 6, talk("c10", "Sotero", one(f"Close-up of {SOT} {CAB}, {SC}, he lowers the ledger, wounded pride, his voice breaks a little", "RIGHT"),
     "wounded, bitter")),
 ("c11", 6, (talk("c11", "Sotero", ots(f"Close-up of {SOT} {CAB0}, {SC}, he lifts his chin, bitter and proud", ROS_B, "RIGHT") + " " + MOUTH("Sotero", "Rosalba"),
     "bitter, proud"),
   talk("c11", "Sotero", one(f"Close-up of {SOT} {CAB}, {SC}, he lifts his chin, bitter and proud", "RIGHT"), "bitter, proud"))),
 ("c12", 6, (talk("c12", "Rosalba", ots(f"Close-up of {ROS} {CAB0}, {RC}, controlled, her voice low and firm", SOT_B, "LEFT") + " " + MOUTH("Rosalba", "Sotero"),
     "firm, low, controlled"),
   talk("c12", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, controlled, her voice low and firm", "LEFT"), "firm, low, controlled"))),
 ("c13", 6, talk("c13", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, final, she points at the desk with an open hand", "LEFT"),
     "final, cold, firm")),
 ("i03", 6, f"Close-up insert {CAB0}: a heavy man's hand with a plaid flannel cuff drops a ring of brass keys on the old wooden desk next to a small black notebook. "
            f"Only the hand, the keys and the notebook, no faces. No dialogue."),
 ("c14", 6, (talk("c14", "Rosalba", ots(f"Close-up of {ROS} {CAB0}, {RC}, she crosses her arms, firm", SOT_B, "LEFT") + " " + MOUTH("Rosalba", "Sotero"),
     "firm, slow"),
   talk("c14", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, she crosses her arms, firm", "LEFT"), "firm, slow"))),
 # c15 (la ley) y c16 (derrota): single
 ("c15", 6, talk("c15", "Rosalba", one(f"Close-up of {ROS} {CAB}, {RC}, she looks at the window, calm and cold", "LEFT"),
     "calm, cold, final")),
 ("c16", 6, talk("c16", "Sotero", one(f"Close-up of {SOT} {CAB}, {SC}, defeated, he looks down at the floor", "RIGHT"),
     "defeated, very quiet")),
 # 4. El patio al acabar el turno: la amenaza y la réplica
 ("i04", 6, f"Wide shot {YARD0}: the quarry yard at the end of the shift, the sun low over the dry hills, long shadows across the blocks, dust floating in the orange light. "
            f"No people, no letters, no signs. No dialogue."),
 ("c17", 6, (talk("c17", "Sotero", ots(f"Close-up of {SOT} {YARD0}, {SR}, humiliated and resentful, he leans forward, low", ABD_B, "LEFT") + " " + MOUTH("Sotero", "Abdías"),
     "resentful, low, threatening"),
   talk("c17", "Sotero", one(f"Close-up of {SOT} {YARD}, {SR}, humiliated and resentful, he leans forward, low", "LEFT"), "resentful, low, threatening"))),
 ("c18", 6, (talk("c18", "Abdías", ots(f"Close-up of {ABD} {YARD0}, {AL}, calm and firm, he holds his ground, chin up", SOT_B, "RIGHT") + " " + MOUTH("Abdías", "Sotero"),
     "calm, firm, dignified"),
   talk("c18", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, calm and firm, he holds his ground, chin up", "RIGHT"), "calm, firm, dignified"))),
 # c19 grupo PMA: llega la patrona (Abdías LEFT, Sotero a la derecha de espaldas a medias, Rosalba al fondo a la RIGHT)
 ("c19", 6, (talk("c19", "Rosalba", f"Medium wide shot from the knees up {YARD0}: {ABD} on the LEFT at the heavy wooden carving table; {SOT} in the middle on the right, half turned away from the camera; "
     f"{ROS} on the far RIGHT among the blocks of pink stone, she has just arrived, serious, her eyes on the bald man, slightly closer to the camera and in sharper focus; "
     f"only these three people, no extras. Only Rosalba speaks: Rosalba's lips move clearly with every word; Abdías and Sotero stay silent the whole shot, mouths closed, only listening.",
     "firm, serious"),
   talk("c19", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, she has just arrived, serious, her eyes on the bald man", "LEFT"), "firm, serious"))),
 ("r2", 6, one(f"Close-up of {SOT} {YARD}, {SR}, in silence, he lowers his head, humiliated, and turns his face away", "LEFT") + " Slow push-in. No dialogue."),
 # 5. Recompensa: Abdías encargado del patio
 ("c20", 6, (talk("c20", "Rosalba", ots(f"Close-up of {ROS} {YARD0}, {RR}, her face softens, a warm grateful look", ABD_B, "LEFT") + " " + MOUTH("Rosalba", "Abdías"),
     "warm, grateful"),
   talk("c20", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, her face softens, a warm grateful look", "LEFT"), "warm, grateful"))),
 ("c21", 6, (talk("c21", "Abdías", ots(f"Close-up of {ABD} {YARD0}, {AL}, humble, he wipes the dust from his hands on his trousers", ROS_B, "RIGHT") + " " + MOUTH("Abdías", "Rosalba"),
     "humble, sincere"),
   talk("c21", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, humble, he wipes the dust from his hands on his trousers", "RIGHT"), "humble, sincere"))),
 ("c22", 6, (talk("c22", "Rosalba", two(f"{ABD} on the LEFT at the heavy wooden carving table in profile facing right, and {ROS} on the RIGHT among the blocks of pink stone in profile facing left, "
     f"two meters apart {YARD0}, framed from the knees up; Rosalba smiles slightly, proud and sure, slightly closer to the camera and in sharper focus") + " " + MOUTH("Rosalba", "Abdías"),
     "warm, proud, firm"),
   talk("c22", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, she smiles slightly, proud and sure", "LEFT"), "warm, proud, firm"))),
 ("r3", 6, one(f"Close-up of {ABD} {YARD}, {AL}, in silence, his eyes shine, he can not believe it, a shy smile grows on his face", "RIGHT") + " Slow push-in. No dialogue."),
 ("c23", 6, (talk("c23", "Abdías", ots(f"Close-up of {ABD} {YARD0}, {AL}, moved, he puts one hand on his chest", ROS_B, "RIGHT") + " " + MOUTH("Abdías", "Rosalba"),
     "moved, then firm"),
   talk("c23", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, moved, he puts one hand on his chest", "RIGHT"), "moved, then firm"))),
 ("c24", 6, (talk("c24", "Rosalba", ots(f"Close-up of {ROS} {YARD0}, {RR}, she nods toward the cabin with a small smile", ABD_B, "LEFT") + " " + MOUTH("Rosalba", "Abdías"),
     "warm, decisive"),
   talk("c24", "Rosalba", one(f"Close-up of {ROS} {YARD}, {RR}, she nods toward the cabin with a small smile", "LEFT"), "warm, decisive"))),
 ("i05", 6, f"Close-up insert {YARD0}: an open cardboard box full of new tan leather work gloves and clear safety goggles on the heavy wooden carving table, "
            f"dusty hands in a brick-red sleeve take out pairs one by one. Only the box and the hands, no faces, no letters. No dialogue."),
 # c25 grupo PG: Abdías llama al patio; canteros sin cara al fondo
 ("c25", 6, (talk("c25", "Abdías", f"Wide shot {YARD0}: {ABD} in the LEFT foreground at the heavy wooden carving table, facing the camera three-quarters, he lifts {GEAR} high and calls out to the yard, proud and happy; "
     f"far behind him, small and out of focus, a few quarry workers in plain grey and white clothes covered in dust walk toward the table, no faces visible, nobody else in a brick-red shirt. "
     f"Only Abdías speaks: Abdías's lips move clearly with every word; everyone else stays silent.",
     "proud, happy, clear"),
   talk("c25", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, he lifts {GEAR} high and calls out to the yard, proud and happy", "RIGHT"), "proud, happy, clear"))),
 # Presentación muda de Bonifacio antes de que lo nombren (single PRES)
 ("r4", 6, f"Medium shot of {BON} {YARD}, {BC}, in silence, he squints at a block of stone, rubs his tired eyes with his dusty fingers, then looks up, "
           f"{gaze('LEFT')}; {PRES}; {ALONE}; {NODOUBLE('old man in a straw hat')}. Slow push-in. No dialogue."),
 ("c26", 6, (talk("c26", "Abdías", ots(f"Close-up of {ABD} {YARD0}, {AL}, warm and respectful, he holds out {GEAR}", BON_B, "RIGHT") + " " + MOUTH("Abdías", "Bonifacio"),
     "warm, respectful"),
   talk("c26", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, warm and respectful, he holds out {GEAR}", "RIGHT"), "warm, respectful"))),
 ("c27", 6, (talk("c27", "Bonifacio", ots(f"Close-up of {BON} {YARD0}, {BC}, moved, his eyes shine, a small smile under the straw hat", ABD_B, "LEFT") + " " + MOUTH("Bonifacio", "Abdías"),
     "moved, old, soft"),
   talk("c27", "Bonifacio", one(f"Close-up of {BON} {YARD}, {BC}, moved, his eyes shine, a small smile under the straw hat", "LEFT"), "moved, old, soft"))),
 ("c28", 6, (talk("c28", "Abdías", two(f"{ABD} on the LEFT in profile facing right and {BON} on the RIGHT in profile facing left, one meter apart between the blocks of pink stone {YARD0}, framed from the waist up; "
     f"Abdías smiles at the old man with affection, slightly closer to the camera and in sharper focus") + " " + MOUTH("Abdías", "Bonifacio"),
     "warm, affectionate"),
   talk("c28", "Abdías", one(f"Close-up of {ABD} {YARD}, {AL}, he smiles at the old man with affection", "RIGHT"), "warm, affectionate"))),
 ("i06", 6, f"Close-up insert {YARD0}: old wrinkled dusty hands in faded sky-blue sleeves put on new clear safety goggles; the orange sunset light shines on the clean lenses. "
            f"Only the hands and the goggles, no full face. No dialogue."),
 ("c29", 6, (talk("c29", "Bonifacio", ots(f"Close-up of {BON} {YARD0}, {BC}, wearing the new clear safety goggles, he nods slowly in respect, his straw hat on", ROS_B, "RIGHT") + " " + MOUTH("Bonifacio", "Rosalba"),
     "grateful, soft"),
   talk("c29", "Bonifacio", one(f"Close-up of {BON} {YARD}, {BC}, wearing the new clear safety goggles, he nods slowly in respect, his straw hat on", "RIGHT"), "grateful, soft"))),
 # r5 grupo PMA mudo (desenlace): Rosalba de 3/4 de espaldas a la RIGHT, Abdías LEFT, Bonifacio al centro con los lentes
 ("r5", 6, (f"Medium wide shot from the knees up {YARD0}: in the RIGHT foreground {ROS_B}, in three-quarter back view, watching; on the LEFT {ABD} at the heavy wooden carving table, smiling; "
            f"in the CENTER {BON} wearing new clear safety goggles, nodding slowly; only these three people, no extras. Slow push-in. " + MUTE,
   one(f"Close-up of {ROS} {YARD}, {RR}, in silence, she watches the yard with a small proud smile, her eyes shine", "LEFT") + " Slow push-in. No dialogue.")),
 # CTA con carisma (después del BLACK): Rosalba sola en el patio al atardecer, a cámara
 ("c30", 10, talk("c30", "Rosalba", f"Close-up from the chest up of {ROS} {YARD}, alone, standing among the blocks of pink stone, looking straight into the camera and talking to the viewer "
     f"from the very first second, with warmth and charisma, her lips moving clearly; she starts with a knowing little smile, makes a short pause, raises one eyebrow, "
     f"tucks her silver hair behind one ear, tilts her head, nods and smiles. Nobody else around.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks")
        ]
# Frases primero: si no, "hurt"/"angry" sueltos se reemplazan antes y la frase ya no coincide.
SOFT = [("Les cobraste a todos lo que era gratis, Sotero.", "Les pediste a todos lo que era gratis, Sotero."), ("Hoy se te acaba el turno.", "Hoy hablamos claro."),
        ("Esto te lo voy a cobrar.", "Esto no se queda así."), ("O mañana lo arreglas con la ley.", "O mañana lo vemos en serio."),
        ("Estás despedido, Sotero.", "Hasta aquí llegaste, Sotero."), ("Siempre ha sido un revoltoso.", "Siempre ha sido así."),
        ("Algo me tenía que tocar a mí.", "Yo también trabajo aquí."),
        ("a drop of sweat on his bald head, he swallows", "he swallows"), ("she points at the desk with an open hand", "she looks at the desk"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("lying", "smooth"), ("muttering", "speaking low"),
        ("humiliated", "quiet"), ("resentful", "serious"), ("wounded", "sad"), ("defeated", "quiet"), ("cutting", "clear"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("dark sunglasses", "dark clothes"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm sunset light at a pink cantera stone quarry near Huichapan, Hidalgo, stone blocks and white dust, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, a stone quarry in Hidalgo at sunset, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft sunset light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ROSALBA_MONROY}", "a slim Mexican woman in her fifties with a short silver-grey bob in a long camel-brown wool coat"),
         ("@{ABDIAS_CARBAJAL}", "a lean Mexican man in his thirties with a thin mustache in a dusty brick-red work shirt and a grey neck bandana"),
         ("@{SOTERO_VERASTEGUI}", "a heavyset bald Mexican man with a grey goatee and round glasses in a plaid flannel shirt and a plain dark-green quilted vest"),
         ("@{BONIFACIO_URIBE}", "a thin old Mexican man in his sixties with short white hair and white stubble in a palm straw hat and a dusty sky-blue work shirt"),
         (" @{LOC_CANTERAHUICH}", ""), (" @{LOC_CASETACANT}", "")]
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

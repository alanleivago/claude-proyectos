"""Genera los clips de padre-veladoras PARTE 2 (Las Veladoras) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P2" al terminar la tanda.
Con IDs: regenera solo esos (la versión anterior pasa a clips/old/<id>_vN.mp4)."""
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
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2: subtítulos quemados -> se agrega al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# Hojas de la Parte 1 revisadas en hoja de contactos (md5 distintos; la Parte 1 tuvo hojas corridas un nombre, las malas están en ../padre-veladoras/chars/mal y NO se usan):
# ANSELMO (cura), RUFINOVIBORA (Rufino; NO existe RUFINO), CHATOBANDANA (Chato; NO existe CHATO), RAMIRO, MAUROESCOLTA (Mauro; NO existe MAURO),
# LOC_TEMPLO (nave; NO LOC_PARROQUIA), LOC_ATRIO (plaza), PROP_VELADORAS. Ninguna hoja nueva.
# Geografía fija de la nave: el candelero de veladoras está a la DERECHA junto al barandal del altar y Anselmo siempre a la DERECHA, junto a él.
# Bloque A (c04-c08, antes de que llegue Rufino): Ramiro a la IZQUIERDA en el pasillo; en sus planos, Anselmo de espaldas en el borde DERECHO.
# r1: Ramiro pasa a la primera banca de la DERECHA y ahí se queda (bloque B).
# Bloque B (desde r2): Rufino y Chato a la IZQUIERDA (entran por el pasillo central). Planos de Rufino: Ramiro o Anselmo de espaldas en el borde DERECHO.
# Planos de Ramiro y de Anselmo: Rufino de espaldas en el borde IZQUIERDO. Mauro solo en la plaza y en la puerta principal (sin bordes).
IGL = ("inside the colonial parish church @{LOC_TEMPLO} on a Sunday morning before mass, pink cantera stone columns, a carved dark wooden altarpiece with gold details, "
       "empty wooden pews, soft morning sunbeams through the windows; the iron candle stand with glass saint candles @{PROP_VELADORAS} is on the RIGHT side by the altar rail; "
       "no extras: nobody else in the church besides the people described")
ATR = ("in the stone plaza @{LOC_ATRIO} in front of the pink cantera church, early Sunday morning light, one black SUV parked by the steps, "
       "no motorcycles, nobody else in the plaza")
PUE = "at the open main wooden door of the parish church @{LOC_TEMPLO}, the sunny stone plaza behind him, morning light"
# Ancla de identidad y ropa (también para los bordes: mismo personaje, misma ropa que en la Parte 1). QA P1: Anselmo salía con barba -> lampiño explícito.
ANS = ("@{ANSELMO} (55-year-old priest, short salt-and-pepper hair combed back, completely clean-shaven face with no beard and no stubble, thin rimless glasses, "
       "charcoal-grey priest suit, dark grey clerical shirt with white collar, one dark red wooden rosary)")
RUF = ("@{RUFINOVIBORA} (45-year-old man, long black hair in a low ponytail, thick black goatee, silver hoop earring, tattooed arms, sleeveless dark brown leather vest "
       "with cream rattlesnakes embroidered on it, black tank top, one thin silver chain with one small oval silver saint medal)")
CHA = ("@{CHATOBANDANA} (42-year-old man, dark green paisley bandana tied on his head, black moustache, blue plaid shirt with rolled sleeves under a sleeveless "
       "dark brown leather vest with cream rattlesnakes embroidered on it, both hands empty)")
# QA reten/medalla P2: dos sombreros -> exactamente uno, en la cabeza. Su medalla es de ORO (la de Rufino es de plata): una sola cada uno.
RAM = ("@{RAMIRO} (64-year-old man, thick white moustache, exactly one dark brown felt cowboy hat worn on his head and no other hat anywhere, light blue linen guayabera "
       "with white embroidery, one gold chain with one gold medal, gold ring)")
# QA medalla/reten P2: escoltas con rifles -> manos vacías, sin armas, sin radio
MAU = ("@{MAUROESCOLTA} (40-year-old man, short black hair, trimmed black beard, aviator sunglasses, navy-blue suit, white open-collar shirt, "
       "both hands empty and relaxed, carrying nothing)")
ANS_B = "the blurred back of @{ANSELMO} seen from behind (salt-and-pepper hair, charcoal-grey priest suit; a priest, no hat)"
RUF_B = "the blurred back of @{RUFINOVIBORA} seen from behind (long black ponytail, tattooed arm, sleeveless dark brown leather vest with a cream rattlesnake on the back)"
RAM_B = "the blurred back of @{RAMIRO} seen from behind (white hair under his one dark brown felt cowboy hat, light blue linen guayabera; never a man in a suit)"
MATCH = "one single long wooden match"
# QA P2: en c26 salió una 2ª cadena de plata -> una sola cadena, una sola medalla
MEDAL = "the one small oval silver saint medal on his only thin silver chain (no ribbon, no second medal, no second chain)"
# QA P2: en c11, c21 y c30 (Rufino con RAM_B en el borde) Ramiro salía de cuadro y su sombrero quedaba flotando -> planos de Rufino sin nadie en primer plano
RUF_SOLO = "nobody in the foreground, he looks at Ramiro off-screen to the RIGHT"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {NOSUB}"

CLIPS = [
 # 1. Domingo en la plaza (sigue del cliffhanger: ¿Rufino va a venir el domingo?) — hablando desde el frame 0, recap en 1 frase
 ("c01", 10, talk("c01", "Ramiro", f"Medium close-up of {RAM} {ATR}, standing on the LEFT, looking at the empty plaza; {MAU} blurred on the RIGHT by the black SUV.",
     "calm, low, serious")),
 ("c02", 8, talk("c02", "Mauro", f"Close-up of {MAU} {ATR}, standing on the RIGHT by the black SUV, he looks around the empty plaza, then back at Ramiro off-screen to the left.",
     "respectful, doubtful")),
 ("c03", 8, talk("c03", "Ramiro", f"Close-up of {RAM} {ATR}, he adjusts the brim of his one cowboy hat on his head and turns toward the church door.",
     "calm, firm")),
 # 2. Adentro: la primera fila vacía y las veladoras prendidas cada noche (bloque A: Ramiro IZQUIERDA, Anselmo DERECHA)
 ("c04", 8, talk("c04", "Anselmo", f"Over-the-shoulder close-up of {ANS} {IGL}, standing on the RIGHT by the candle stand, lighting a glass candle with {MATCH}, he turns his head with a warm smile; in the LEFT foreground, {RAM_B}.",
     "warm, calm")),
 ("c05", 10, talk("c05", "Ramiro", f"Over-the-shoulder close-up of {RAM} {IGL}, standing on the LEFT in the central aisle, he glances at the empty first pew; in the RIGHT foreground, {ANS_B}.",
     "respectful, doubtful")),
 ("c06", 10, talk("c06", "Anselmo", f"Close-up of {ANS} {IGL}, standing on the RIGHT by the candle stand, the lit glass candles glowing beside him, a calm knowing look.",
     "calm, full of faith, a little mysterious")),
 ("c07", 8, talk("c07", "Ramiro", f"Close-up of {RAM} {IGL}, standing on the LEFT in the aisle, he frowns, curious.",
     "surprised, curious")),
 ("c08", 8, talk("c08", "Anselmo", f"Close-up of {ANS} {IGL}, he looks at the row of lit glass candles beside him, a soft smile.",
     "soft, tender, intrigued")),
 ("r1", 6, f"Medium shot {IGL}: {RAM} walks slowly to the first wooden pew on the RIGHT side near the candle stand and stands beside it, thoughtful, his one cowboy hat on his head; {ANS} blurred by the candles. Slow push-in. No dialogue."),
 # 3. Llega Rufino (bloque B: Rufino y Chato IZQUIERDA; Ramiro y Anselmo DERECHA)
 ("c09", 8, talk("c09", "Mauro", f"Medium close-up of {MAU} {PUE}, he leans in through the doorway and speaks toward the altar, surprised.",
     "surprised, respectful")),
 ("r2", 6, f"Medium wide shot {IGL}: through the central aisle, {RUF} walks slowly toward the altar on the LEFT side of the aisle, calm, head a little down, his empty hands relaxed, and {CHA} walks one step behind him; no one else enters. Slow push-in. No dialogue."),
 ("c10", 8, talk("c10", "Chato", f"Medium close-up of {CHA} {IGL}, standing on the LEFT in the aisle beside the first pew, a shy grin, he tilts his head toward Rufino beside him.",
     "friendly, a little playful")),
 ("c11", 8, talk("c11", "Rufino", f"Close-up of {RUF} {IGL}, standing on the LEFT in the aisle, serious, calm, no smile, {RUF_SOLO}.",
     "quiet, respectful, nervous")),
 ("c12", 8, talk("c12", "Ramiro", f"Over-the-shoulder close-up of {RAM} {IGL}, standing on the RIGHT beside the first pew, studying him; in the LEFT foreground, {RUF_B}.",
     "low, calm, surprised")),
 ("c13", 8, talk("c13", "Rufino", f"Close-up of {RUF} {IGL}, standing on the LEFT, he lowers his eyes for a second, then looks up again.",
     "humble, honest, quiet")),
 ("c14", 8, talk("c14", "Anselmo", f"Over-the-shoulder close-up of {ANS} {IGL}, standing on the RIGHT by the candle stand, his eyes open wide behind his glasses, moved; in the LEFT foreground, {RUF_B}.",
     "soft, surprised, moved")),
 ("r3", 6, f"Close-up of {RUF} {IGL}, standing on the LEFT, in silence, he lowers his eyes and gives one slow small nod. Slow push-in. No dialogue."),
 ("c15", 8, talk("c15", "Rufino", f"Over-the-shoulder close-up of {RUF} {IGL}, standing on the LEFT, he rubs the back of his neck, shy; in the RIGHT foreground, {ANS_B}.",
     "quiet, shy, honest")),
 ("c16", 8, talk("c16", "Anselmo", f"Close-up of {ANS} {IGL}, a tender look, he holds his dark red rosary in both hands.",
     "tender, soft")),
 ("c17", 10, talk("c17", "Rufino", f"Close-up of {RUF} {IGL}, he looks at the lit glass candles, his eyes shining, his voice low.",
     "low, emotional, sincere")),
 ("c18", 8, talk("c18", "Anselmo", f"Close-up of {ANS} {IGL}, a slow warm smile of recognition, he glances at the first pew on the LEFT.",
     "warm, tender, remembering")),
 ("c19", 8, talk("c19", "Rufino", f"Close-up of {RUF} {IGL}, standing on the LEFT, he rests one hand on the back of the first wooden pew, eyes shining.",
     "quiet, emotional")),
 ("r4", 6, f"Close-up of {RAM} {IGL}, standing on the RIGHT by the first pew, in silence, his stern face slowly softens, he gives one small nod. Slow push-in. No dialogue."),
 ("c20", 8, talk("c20", "Ramiro", f"Over-the-shoulder close-up of {RAM} {IGL}, standing on the RIGHT, calm but still firm; in the LEFT foreground, {RUF_B}.",
     "firm, calm, testing him")),
 ("c21", 10, talk("c21", "Rufino", f"Close-up of {RUF} {IGL}, standing on the LEFT, he glances up at the ceiling, then back at Ramiro; {RUF_SOLO}.",
     "sincere, decided")),
 ("c22", 8, talk("c22", "Chato", f"Medium close-up of {CHA} {IGL}, standing on the LEFT beside Rufino, he raises one open hand like a promise, a proud grin.",
     "proud, friendly")),
 ("c23", 8, talk("c23", "Anselmo", f"Close-up of {ANS} {IGL}, a wide warm smile, he gestures with an open hand toward the first pew on the LEFT.",
     "warm, happy, a little playful")),
 ("c24", 10, talk("c24", "Ramiro", f"Close-up of {RAM} {IGL}, standing on the RIGHT, a small proud half smile, he nods toward the candle stand.",
     "warm, firm")),
 # 4. Gancho nuevo: el San Judas de plata
 ("i1", 6, f"Extreme close-up insert {IGL}: the tattooed hand of {RUF} lights the last glass candle on the candle stand with {MATCH}; as he leans forward, {MEDAL} slips out and swings in the warm candlelight. No dialogue."),
 ("r5", 6, f"Close-up of {RAM} {IGL}, in silence, his eyes fixed on something at Rufino's chest off-screen to the left, his smile slowly disappears, he freezes. Slow push-in. No dialogue."),
 ("c25", 8, talk("c25", "Ramiro", f"Over-the-shoulder close-up of {RAM} {IGL}, standing on the RIGHT, he takes one slow step forward, staring at the medal; in the LEFT foreground, {RUF_B}.",
     "low, surprised, slow")),
 ("c26", 10, talk("c26", "Rufino", f"Close-up of {RUF} {IGL}, standing on the LEFT, he lifts {MEDAL} a little between two fingers and looks down at it, eyes shining; he wears only that one chain.",
     "quiet, tender, sad")),
 ("c27", 8, talk("c27", "Ramiro", f"Close-up of {RAM} {IGL}, his voice low, he touches the one gold medal on his own gold chain at his chest, eyes shining.",
     "low, shaken, slow")),
 ("c28", 8, talk("c28", "Anselmo", f"Close-up of {ANS} {IGL}, standing on the RIGHT, he looks from Ramiro to Rufino, worried, both hands on his dark red rosary.",
     "worried, soft")),
 ("c29", 6, talk("c29", "Ramiro", f"Close-up of {RAM} {IGL}, he looks at Rufino off-screen to the left, very serious, almost a whisper.",
     "very low, serious, slow")),
 # QA P2 (c30 v2): sosteniendo la medalla salió una 2ª cadena con otra medalla -> manos abajo y vacías, la medalla colgando sola
 ("c30", 10, talk("c30", "Rufino", f"Close-up of {RUF} {IGL}, standing on the LEFT, confused, both hands down at his sides and empty, not touching the medal; {MEDAL} hangs still at the center of his chest; he wears only that one chain; {RUF_SOLO}.",
     "quiet, confused, honest")),
 ("r6", 6, f"Close-up of {RAM} {IGL}, in silence, his eyes go wide, his hand rests on the one gold medal at his chest, he does not move, the candlelight on his face. Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK)
 ("c31", 10, talk("c31", "Anselmo", f"Close-up of {ANS} {IGL}, the lit candles glowing behind him, looking straight into the camera with warmth and charisma, moving naturally: he nods, tilts his head, smiles, adjusts his glasses with one hand and gestures with the dark red wooden rosary in the other; he holds nothing else, no scarf, no cloth. The church behind him is empty: empty wooden pews, no other people.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza llanto exagerado y gestos bruscos: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("shaken", "surprised"), ("he freezes", "he stays still"),
        ("staring at", "looking at"), ("takes one slow step forward", "stands still")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("testing him", "thoughtful"), ("doubtful", "thoughtful"), ("sad", "quiet"), ("nervous", "quiet"), ("stern", "serious"),
        ("¡", ""), ("!", "."), ("irse con Dios", "irse")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, Mexican family drama, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{RUFINOVIBORA}", "a Mexican motorcycle rider"), ("@{CHATOBANDANA}", "a Mexican motorcycle rider"),
         ("@{MAUROESCOLTA}", "a Mexican assistant"), ("@{RAMIRO}", "a Mexican rancher")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (NOSUB queda, va después del diálogo)
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:  # entorno explícito y tope de 10 min por llamada (flow.js ya corta a los 90 s por video)
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control (regla del usuario): si un clip falla, generar algo neutro para saber si falla el prompt o Flow."""
    # gatito como IMAGEN (no gasta créditos; el video costaba 12-15 por prueba)
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

def main():
    want = set(sys.argv[1:])
    OUT.mkdir(exist_ok=True)
    for cid, dur, body in CLIPS:
        dst = OUT / f"{cid}.mp4"
        if want and cid not in want: continue
        if dst.exists():
            if not want: continue
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1  # regenerar: guardar la versión anterior
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            files, log = gen(variant(body, k), dur, OUT)
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()  # Flow no se desbloquea esperando: recargar la página
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                reload_flow(); time.sleep(20); continue  # Flow caído: no gastar un intento de redacción
            k += 1
        time.sleep(17)
    print("FIN P2", flush=True)

if __name__ == "__main__":
    main()

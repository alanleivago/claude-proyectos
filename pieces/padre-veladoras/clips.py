"""Genera los clips de padre-veladoras con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Uso: python -I clips.py [ID ...]"""
import re, subprocess, sys, os, tempfile, time
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = Path(__file__).parent / "clips"
STYLE = ("Cinematic vertical shot from a Mexican telenovela, photorealistic, natural skin texture, 85mm lens, shallow depth of field, "
         "static camera with a very slow push-in. Keep every character exactly as in their reference sheet (same face, hair, clothes, accessories). "
         "No music, no subtitles, no text on screen.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync"
IGL = "inside the colonial parish church @{LOC_TEMPLO}, pink cantera stone columns, a carved dark wooden altarpiece with gold details, rows of lit candles, wooden pews, warm dusty sunbeams through stained glass windows"
SAC = "in the quiet side chapel of the parish church @{LOC_TEMPLO}, pink cantera stone wall, a small wooden crucifix, a few lit candles, dim warm light"
MIR = "on the arched stone terrace of a rich hacienda @{LOC_TERRAZA}, a wrought-iron table with a coffee cup, potted agaves, green hills behind, warm daylight"
SUV = "in the back seat of a black SUV driving on a dirt road, beige leather seats, dry fields passing by through the window, soft daylight"
ATR = "in the stone plaza @{LOC_ATRIO} in front of the pink cantera church, black SUVs parked, motorcycles lined up by the steps, golden afternoon light"
# Ancla de identidad: primera mención de cada personaje en cada prompt
ANS = "@{ANSELMO} (55, short salt-and-pepper hair combed back, completely clean-shaven face with no beard and no stubble, thin rimless glasses, charcoal-grey priest suit, dark grey clerical shirt with white collar, dark red wooden rosary)"
RUF = "@{RUFINOVIBORA} (45, long black hair in a low ponytail, thick black goatee, silver hoop earring, tattooed arms, sleeveless dark brown leather vest with cream rattlesnakes embroidered on it, black tank top, thick silver chain with a saint medal)"
CHA = "@{CHATOBANDANA} (42, dark green paisley bandana tied on his head, black moustache, blue plaid shirt with rolled sleeves under a sleeveless dark brown leather vest with cream rattlesnakes embroidered on it)"
RAM = "@{RAMIRO} (64, thick white moustache, dark brown felt cowboy hat, light blue linen guayabera with white embroidery, gold chain with a medal, gold ring)"
MAU = "@{MAUROESCOLTA} (40, short black hair, trimmed black beard, aviator sunglasses, navy-blue suit, white open-collar shirt)"

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: los motociclistas en la parroquia, sin plano abierto, hablando desde el frame 0
 ("c01", 8, talk("Rufino", f"Over-the-shoulder medium shot {IGL}: {RUF} stands very close in front of {ANS}, who is seen from behind and blurred in the foreground; Rufino looks down at him with a crooked smile, two bikers in dark brown leather vests blurred far behind.",
     ["Padrecito, usted y yo tenemos que hablar.", "Desde hoy, esta iglesia es nuestro punto de reunión."], "slow, arrogant, mocking")),
 ("c02", 8, talk("Anselmo", f"Close-up of {ANS} {IGL}, holding his dark red rosary, calm and firm, {RUF} seen from behind and blurred at the left edge of the frame.",
     ["Esta es la casa de Dios, no un taller.", "Aquí se entra con respeto."], "calm, firm, dignified")),
 ("c03", 8, talk("Rufino", f"Close-up of {RUF} {IGL}, he laughs through his nose and tilts his head, two bikers blurred behind him.",
     ["¿Respeto?", "Nosotros no le pedimos permiso a nadie."], "mocking, arrogant")),
 ("c04", 8, talk("Anselmo", f"Over-the-shoulder medium shot {IGL}: {ANS} faces the camera, his face smooth and clean-shaven like in his reference sheet, {RUF} seen from behind and blurred in the right foreground.",
     ["Entonces les voy a pedir que se retiren.", "Por las buenas."], "calm, serious")),
 ("c05", 8, talk("Rufino", f"Medium shot {IGL}: {RUF} leans over the altar rail and blows out a row of lit glass candles @{{PROP_VELADORAS}}, then turns back with a crooked smile; {ANS} blurred at the right edge of the frame.",
     ["Uy, se apagaron sus veladoras.", "¿Y ahora qué va a hacer, padrecito?"], "mocking, playful, cold")),
 ("c06", 8, talk("Anselmo", f"Close-up of {ANS} {IGL}, he holds the dark red rosary against his chest, eyes steady, a thin line of smoke from the candles behind him.",
     ["No se burle de mi fe.", "Dios está viendo todo lo que hace."], "quiet, firm, full of faith")),
 ("c07", 8, talk("Rufino", f"Close-up profile of {RUF} {IGL}, face to face with {ANS}, who is blurred at the edge of the frame; Rufino grins.",
     ["¿Y su Dios va a bajar a defenderlo?", "Aquí lo espero, padrecito."], "mocking, slow")),
 ("c08", 8, talk("Chato", f"Medium shot {IGL}: {CHA} sits sprawled on a wooden pew, laughing, pointing with his chin toward the side door of the church.",
     ["Ey, Rufino, ya se va el padre.", "Seguro va a pedir ayuda."], "laughing, mocking")),
 ("c09", 8, talk("Rufino", f"Close-up of {RUF} {IGL}, he calls out toward someone walking away off-screen, a wide mocking grin.",
     ["¿Qué pasó, padrecito?", "¿Le va a marcar a Dios?"], "loud, mocking")),
 # 2. La llamada (montaje paralelo parroquia / terraza)
 ("c10", 8, talk("Anselmo", f"Close-up of {ANS} alone {SAC}, the crucifix on the wall right behind him (not the main nave, no pews), holding a black smartphone to his ear, he closes his eyes for a second, worried but calm. Nobody else in the frame, no other people in the background.",
     ["Ramiro, soy Anselmo.", "Necesito tu ayuda."], "low, worried, calm")),
 ("c11", 8, talk("Ramiro", f"Close-up of {RAM} {MIR}, seated at the wrought-iron table, answering a black smartphone, he frowns.",
     ["¿Qué pasó, padre? ¿Está bien?", "¿Quiénes son?"], "concerned, serious")),
 ("c12", 10, talk("Anselmo", f"Close-up of {ANS} {SAC}, the black smartphone at his ear, he looks down, hurt.",
     ["Se metieron seis motociclistas a la parroquia.", "Me apagaron las veladoras y se burlaron de mí.", "Les dicen Los Víboras. El que manda es Rufino."], "quiet, hurt, steady")),
 ("c13", 10, talk("Ramiro", f"Medium shot of {RAM} {MIR}, the phone at his ear, his eyes go cold; then he lowers the phone and raises one hand toward {MAU}, who stands behind him.",
     ["Ese hombre acaba de cometer un grave error.", "Voy en camino, padre.", "Mauro, prepara las camionetas."], "low, cold, controlled")),
 # 3. Falsa victoria de Rufino
 ("c14", 8, talk("Rufino", f"Over-the-shoulder medium shot {IGL}: {RUF} in the central aisle, arms spread, {ANS} seen from behind and blurred in the foreground as he walks back in.",
     ["Miren quién volvió.", "¿Qué pasó, padrecito? ¿Ya viene Dios a salvarlo?"], "mocking, arrogant")),
 ("c15", 8, talk("Anselmo", f"Close-up of {ANS} {IGL}, serene, the dark red rosary in his hand, {RUF} blurred at the left edge of the frame.",
     ["Les recomiendo que se vayan.", "Todavía están a tiempo."], "calm, serene, serious")),
 ("c16", 8, talk("Rufino", f"Close-up of {RUF} {IGL}, arms crossed, a slow smirk.",
     ["¿Me está amenazando, padrecito?", "De aquí no nos movemos."], "mocking, defiant")),
 # 4. El camino: por qué Ramiro va (cama cálida)
 ("r1", 6, "Aerial drone shot from high above: five black SUVs drive in a line along a dusty dirt road between dry fields toward a small town with a pink stone church tower, golden afternoon light, dust trailing behind them. No people visible. No dialogue."),
 ("c17", 8, talk("Mauro", f"Medium shot {SUV}: {MAU} seated beside {RAM}, he turns his head toward him.",
     ["Patrón, ¿qué tan cercano es usted al padre?", "¿Desde cuándo lo conoce?"], "respectful, curious")),
 ("c18", 8, talk("Ramiro", f"Close-up of {RAM} {SUV}, looking out of the window, {MAU} blurred at the right edge of the frame.",
     ["Anselmo no es nada más un cura.", "Es como un hermano para mí."], "quiet, warm, serious")),
 ("c19", 10, talk("Ramiro", f"Medium profile shot of {RAM} {SUV}, the window in front of him, the dry fields passing by, his eyes wet.",
     ["Hace veinte años mi familia se quedó sin nada.", "Todos nos dieron la espalda.", "Anselmo fue el único que no se fue."], "slow, emotional, sincere")),
 # 5. Ironía: Rufino sigue confiado, el convoy se acerca
 ("c20", 10, talk("Rufino", f"Medium shot {IGL}: {RUF} sits on the stone steps in front of the altar, elbows on his knees, looking up at {ANS}, who stands blurred at the edge of the frame.",
     ["¿Y entonces, padrecito? ¿A quién le marcó?", "¿Que me conoce?", "Aquí no viene nadie a salvarlo."], "mocking, then curious, then arrogant")),
 ("c21", 8, talk("Anselmo", f"Close-up of {ANS} {IGL}, looking down at {RUF}, who is seen from behind and blurred at the left edge of the frame (only his tattooed arm, black ponytail and sleeveless dark brown leather vest visible), a calm half smile. No other people, no women.",
     ["A alguien que te conoce.", "Eso espero, por tu bien."], "calm, serene")),
 ("c22", 8, talk("Ramiro", f"Close-up of {RAM} {SUV}, looking straight ahead through the windshield, a fixed, cold gaze.",
     ["Ya casi estamos.", "Que nadie se adelante. Con Rufino quiero hablar yo."], "low, cold, firm")),
 # 6. Llegada
 ("c23", 8, talk("Chato", f"Medium shot of {CHA} at the open wooden door of the church, looking outside at the plaza, worried, then he turns back toward the altar.",
     ["Rufino, afuera hay cinco camionetas.", "Vienen repletas de gente."], "worried, fast")),
 ("c24", 8, talk("Rufino", f"Close-up of {RUF} {IGL}, his smirk fades, he looks toward the door, then at Anselmo off-screen.",
     ["¿Y quién es ese?", "¿Usted conoce a Ramiro Salcedo?"], "surprised, uneasy")),
 ("c25", 8, talk("Anselmo", f"Medium two-shot {IGL}: {ANS} calm with a faint smile, {RUF} beside him, uneasy.",
     ["Es Ramiro Salcedo.", "Lo conozco desde hace muchos años."], "calm, serene")),
 ("c26", 8, talk("Ramiro", f"Medium shot of {RAM} {ATR}, standing next to the open door of a black SUV, {MAU} beside him, several ranch hands in jeans and white shirts waiting behind.",
     ["Ustedes se quedan aquí afuera.", "A Rufino lo atiendo yo solo."], "calm, cold, firm")),
 # 7. Cara a cara
 ("c27", 10, talk("Ramiro", f"Over-the-shoulder medium shot {IGL}: {RAM} stands in the central aisle facing {RUF}, who is seen from behind and blurred in the foreground.",
     ["¿Así que tú eres Rufino?", "¿Tú le apagaste las veladoras al padre?", "¿Y también te burlaste de él?"], "slow, cold, controlled")),
 ("c28", 8, talk("Rufino", f"Close-up of {RUF} {IGL}, he swallows, nervous, eyes going from Ramiro to the floor, {RAM} blurred at the left edge of the frame.",
     ["Sí, señor.", "Sí, fui yo.", "Sí."], "nervous, quiet")),
 ("c29", 8, talk("Ramiro", f"Close-up of {RAM} {IGL}, his voice rises, he points at the floor.",
     ["Seis hombres contra un cura.", "A ver, repíteme en la cara lo que le dijiste."], "firm, indignant")),
 ("c30", 10, talk("Rufino", f"Close-up of {RUF} {IGL}, looking down, nervous, rubbing his hands.",
     ["Yo no le dije nada, señor.", "El padre entendió mal.", "Le pregunté si su Dios iba a bajar a defenderlo. Y me burlé de él."], "nervous, ashamed")),
 ("c31", 10, talk("Ramiro", f"Medium shot {IGL}: {RAM} steps closer to {RUF}, who is blurred at the right edge of the frame, {ANS} standing in the background by the altar.",
     ["¿Me estás diciendo que el padre miente?", "Ahora míralo a la cara.", "Y pídele perdón."], "low, firm, slow")),
 ("c32", 8, talk("Rufino", f"Close-up of {RUF} {IGL}, looking at Anselmo off-screen, with teary eyes, his voice breaks.",
     ["Perdóneme, padre.", "No sabía lo que hacía."], "ashamed, with teary eyes")),
 ("c33", 10, talk("Ramiro", f"Close-up of {RAM} {IGL}, calm again, he adjusts his dark brown cowboy hat.",
     ["Con el padre Anselmo nadie se mete.", "Vas a prender una por una las veladoras que apagaste.", "Y el domingo te quiero aquí, en primera fila."], "calm, slow, firm")),
 ("r2", 6, f"Medium shot {IGL}: {RUF} lights the glass candles @{{PROP_VELADORAS}} one by one with a long match, embarrassed, head down; {ANS} watches from the background with a faint smile. Slow push-in. No dialogue."),
 # CTA final (tras negro)
 ("c34", 8, talk("Anselmo", f"Close-up of {ANS} {IGL}, the candles relit behind him, looking straight into the camera with warmth and charisma, moving naturally: he nods, tilts his head, smiles, adjusts his glasses and gestures with the dark red wooden rosary in his hand; he holds nothing else, no scarf, no cloth. The church behind him is empty: empty wooden pews, no other people.",
     ["¿Ustedes creen que Rufino va a venir el domingo?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("stands very close in front of", "stands in front of"), ("he points at the floor", "he lowers his hand"),
        ("steps closer to", "faces"), ("his voice rises", "serious"), ("his voice breaks", "quiet voice"), ("sits sprawled on", "sits on"),
        ("he swallows, nervous", "worried"), ("furious", "upset"), ("crying", "with teary eyes")]
# Reformulaciones para reintentos (4 intentos, cada uno con otra redacción)
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("¡", ""), ("!", "."), ("cállese", "ya no discuta"), ("quinientos mil pesos", "quinientos mil"), ("matar", "lastimar"), ("muerto", "perdido")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican countryside, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{RUFINOVIBORA}", "a 45-year-old Mexican motorcycle rider"),
         ("@{CHATOBANDANA}", "a 42-year-old Mexican motorcycle rider")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Wide shot", "Medium wide shot")
    if k >= 4:  # cambiar el personaje: la hoja de Garza tiene uniforme y placa -> descripción civil sin imagen
        for a, b in NOREF: body = body.replace(a, b)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then: "[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                       cwd=MCP, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control (regla del usuario): si un clip falla, generar algo neutro para saber si falla el prompt o Flow."""
    # gatito como IMAGEN (no gasta créditos; el video costaba 12-15 por prueba)
    try:
        r = subprocess.run(["node", "src/cli.js", "--count", "1", "--aspect", "9:16", "--out", str(OUT.parent / "canary"),
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
        if dst.exists() or (want and cid not in want): continue
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

if __name__ == "__main__":
    main()

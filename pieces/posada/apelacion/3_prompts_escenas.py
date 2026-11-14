"""Genera los clips de posada PARTE 1 (La Posada del Mercado, historia original navideña) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
         "No music. Clean frame, no captions, no subtitles, no text on screen, no name tags, no lettering on clothes or signs.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / mecanico c25: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA padre-veladoras-p2 / agua-hacienda-p2 / regreso-20 / chocolate-rancho c17: con alguien en el borde la cámara se corre y queda un sombrero/hombro flotando
# o el del borde se vuelve otra persona -> SOLO primeros planos limpios de UNA persona mirando al otro fuera de cuadro. Nada de over-the-shoulder.
# Nadie lleva sombrero. Multitudes (procesión) solo en planos abiertos mudos (r3, r5); QA medalla-mezcal-p2 / reten-sierra-p2: gente ajena y objetos de más en las multitudes.
# Geografía fija:
#   Portal del mercado, el pleito (c01-c09, r1, r2, i1): Cata y Nacho a la IZQUIERDA junto al nacimiento; Bruno a la DERECHA, del lado de la calle.
#     Luces ENCENDIDAS hasta i1 (Bruno las desconecta); desde r2 el portal queda a la luz de un farol y de las velas.
#   Llega la procesión (r3, c10-c18, i2, r4): la gente, Herminia, Cata y Nacho a la IZQUIERDA; Bruno solo a la DERECHA con la carpeta negra. Luces APAGADAS hasta i3.
#   Pidiendo posada (r5, c19, c20, i4): luces encendidas. Nacho AFUERA a la DERECHA del portón de madera; Cata ADENTRO a la IZQUIERDA.
#   Aparte junto a la olla de ponche (c21-c23, r6): Herminia a la IZQUIERDA; Cata a la DERECHA.
#   Gancho (r7, c24): ya tarde, portal vacío con las luces encendidas, Bruno solo frente al nacimiento. CTA (c25): Cata sola junto al nacimiento.
ARC = ("under the stone arcade of an old Mexican town market @{LOC_ARCOS} on a December night, a large handmade nativity scene on a low wooden platform "
       "with clay shepherds, sheep, a donkey, an ox, Mary and Joseph beside an empty straw manger, moss and small paper houses, "
       "warm Christmas string lights glowing between the stone arches, colorful papel picado; no extras, nobody else in the arcade besides the people described")
DARK = ("under the same stone arcade of the old market @{LOC_ARCOS} at night, the Christmas string lights now switched off, the arcade lit only by a warm "
        "street lamp and soft candlelight, every string of bulbs dark and unlit with no glowing bulbs anywhere, the large clay nativity scene in shadow behind; no extras at the edges of the frame")
PLZ = ("in the small Mexican town square @{LOC_PLAZUELA} on a December night, cobblestones, a white kiosk, old colonial facades, "
       "the dark stone arcade of the market on one side")
LATE = ("under the same stone arcade @{LOC_ARCOS} very late at night, completely empty and quiet, the warm Christmas string lights still glowing, "
        "the large clay nativity scene beside him, cold blue night beyond the arches")
# Anclas de identidad y ropa. Edades numéricas adultas solo en el prompt (en el diálogo no hay palabras de edad). Manos abiertas y bajas (sin dedo acusador).
CAT = ("@{CATALINA} (70-year-old Mexican woman, long grey braid over one shoulder, small silver earrings, a burgundy rebozo shawl with fringes "
       "over a navy blue long-sleeve dress, her hands open and kept low, she never points a finger at anyone)")
NAC = ("@{NACHO_ARCOS} (74-year-old Mexican man, short white hair, thick white moustache, no hat, brown wool cardigan over a cream button shirt, "
       "dark grey trousers, calm and dignified)")
BRU = ("@{BRUNO} (45-year-old Mexican man, black hair slicked back, clean-shaven, no hat, long charcoal grey wool overcoat over a black turtleneck, "
       "a gold wristwatch on his left wrist, his hands open and kept low, he never points a finger at anyone)")
HER = ("@{HERMINIA_MERCADO} (70-year-old Mexican woman, short wavy silver hair, small pearl earrings, camel wool coat, a lilac knitted scarf, "
       "holding one single small lit white candle in a paper cup)")
# QA padre-veladoras-p2 / medalla-mezcal-p2 / chocolate-rancho-p2 (sobre lacrado): utilería duplicada -> cada objeto, uno solo
FOLDER = ("one single black folder with a few loose typed sheets of paper, the typed text too small to read, "
          "no envelope, no wax seal, no logo, no photos")
JARRO = "one single small clay jarrito cup of hot ponche"
PLUG = "one single black extension cord plug of the string lights"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
# QA regreso-20 v1/v2: dobles en los bordes, gente que entra a cuadro, planos sobre el hombro aunque no se pidan
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# Procesión (solo planos abiertos mudos): adultos, una vela cada uno, nadie con abrigo gris carbón (para que no salga un doble de Bruno)
CROWD = ("a quiet procession of about fifteen adult neighbors, all of them adults between 40 and 75 years old, in plain jackets, sweaters and shawls, "
         "no hats, no uniforms, nobody in a charcoal grey overcoat, each one holding one small lit white candle in a paper cup")
# QA posada v1 (c07, c09, c16, c21, c23): dobles y espaldas oscuras en el borde -> sin "looking at X", con gaze + ONE + ALONE y "nadie más con la ropa de X"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
look = lambda who, side: f"{SOLO}, looking at {who} off-screen to the {side}"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {NOSUB}"

CLIPS = [
 # 1. Portal del mercado, luces encendidas: Bruno corre la posada (gancho en la 1ª línea). Bruno DERECHA; Cata y Nacho IZQUIERDA.
 ("c01", 8, talk("c01", "Bruno", f"Close-up of {BRU} {ARC}, standing on the RIGHT, arrogant cold face, chin up, {ONE}, {look('Cata', 'LEFT')}.",
     "arrogant, cold, dismissive")),
 ("r1", 6, f"Close-up of {CAT} {ARC}, standing on the LEFT beside the nativity scene, holding {JARRO} in both hands, in silence, her smile slowly disappears, "
           f"{look('Bruno', 'RIGHT')}. Slow push-in. No dialogue."),
 ("c02", 8, talk("c02", "Cata", f"Close-up of {CAT} {ARC}, standing on the LEFT beside the nativity scene, worried, pleading, {ALONE}, {look('Bruno', 'RIGHT')}.",
     "worried, pleading, soft")),
 ("c03", 8, talk("c03", "Bruno", f"Close-up of {BRU} {ARC}, standing on the RIGHT, a cold smug smile, he glances down at the nativity scene off-screen, {ONE}, {gaze('LEFT')}.",
     "smug, mocking, cold")),
 ("c04", 8, talk("c04", "Nacho", f"Close-up of {NAC} {ARC}, standing on the LEFT in front of the nativity scene, one hand on his chest, {ALONE}, {look('Bruno', 'RIGHT')}.",
     "dignified, calm, a little hurt")),
 ("c05", 6, talk("c05", "Bruno", f"Close-up of {BRU} {ARC}, standing on the RIGHT, he looks at his gold watch and then back up, {ONE}, {gaze('LEFT')}.",
     "cold, dismissive")),
 ("c06", 8, talk("c06", "Cata", f"Close-up of {CAT} {ARC}, standing on the LEFT, eyes fill with tears, {ALONE}, {look('Bruno', 'RIGHT')}.",
     "sad, firm, emotional")),
 ("c07", 6, talk("c07", "Bruno", f"Close-up of {BRU} {ARC}, standing on the RIGHT, a cold smile, {ONE}, {ALONE}, {gaze('LEFT')}, {NODOUBLE('person in dark clothes')}, the lower left corner shows only the empty stone floor.",
     "cold, cruel, calm")),
 ("i1", 6, f"Extreme close-up insert {ARC}: the hand of {BRU} pulls {PLUG} out of the wall socket, and the warm string lights go dark. No dialogue."),
 ("r2", 6, f"Close-up of {CAT} {DARK}, standing on the LEFT, in silence, her face lit only by a dim warm street lamp, eyes shine, she slowly looks up into the darkness overhead, no lit bulbs anywhere above her from the first frame to the last; {ONE}, {ALONE}. Slow push-in. No dialogue."),
 ("c08", 6, talk("c08", "Nacho", f"Close-up of {NAC} {DARK}, standing on the LEFT, he turns gently toward his wife beside him off-screen, firm and tender, {ONE}, {gaze('LEFT')}.",
     "firm, tender, low")),
 ("c09", 8, talk("c09", "Cata", f"Close-up of {CAT} {DARK}, standing on the LEFT, eyes fill with tears, her voice low, {ONE}, {ALONE}, {gaze('RIGHT')}, {NODOUBLE('woman in a burgundy shawl')}.",
     "very low, hurt, slow")),
 # 2. Llega la procesión (todos IZQUIERDA; Bruno solo DERECHA con la carpeta). Multitud SOLO en plano abierto mudo.
 ("r3", 6, f"Wide shot {PLZ}: seen from a distance, {CROWD}, walk slowly across the cobblestones toward the dark market arcade, singing softly. "
           "Nobody in the foreground, nobody close to the camera. Slow push-in. No dialogue."),
 ("c10", 8, talk("c10", "Bruno", f"Close-up of {BRU} {DARK}, standing on the RIGHT, holding {FOLDER} under one arm, arrogant, raising his voice a little, {ONE}, {ALONE}, {gaze('LEFT')}.",
     "arrogant, firm, cold")),
 ("c11", 6, talk("c11", "Herminia", f"Close-up of {HER} {DARK}, standing on the LEFT, the candlelight warm on her face, calm, one eyebrow raised, {ONE}, {ALONE}, {look('Bruno', 'RIGHT')}.",
     "calm, ironic, firm")),
 ("c12", 8, talk("c12", "Bruno", f"Close-up of {BRU} {DARK}, standing on the RIGHT, holding {FOLDER}, a confident smile, {ONE}, {look('Herminia', 'LEFT')}.",
     "confident, smug")),
 ("c13", 8, talk("c13", "Herminia", f"Close-up of {HER} {DARK}, standing on the LEFT, serene and firm, {ONE}, {ALONE}, {look('Bruno', 'RIGHT')}. She keeps talking until the end of the clip and says both sentences completely.",
     "serene, firm, clear")),
 ("c13b", 6, talk("c13b", "Herminia", f"Close-up of {HER} {DARK}, standing on the LEFT, a proud nostalgic smile, {ONE}, {ALONE}, {look('Bruno', 'RIGHT')}. She speaks from the first second.",
     "warm, proud, nostalgic")),
 ("c14", 6, talk("c14", "Bruno", f"Close-up of {BRU} {DARK}, standing on the RIGHT, holding {FOLDER}, his smile tight, {ONE}, {look('Herminia', 'LEFT')}.",
     "tense, defensive")),
 ("c15", 8, talk("c15", "Herminia", f"Close-up of {HER} {DARK}, standing on the LEFT, calm, a small knowing smile, {ONE}, {ALONE}, {look('Bruno', 'RIGHT')}.",
     "calm, sure, firm")),
 ("i2", 6, f"Extreme close-up insert {DARK}: the hands of {BRU} open {FOLDER} and turn slowly to the last page. No dialogue."),
 ("r4", 6, f"Close-up of {BRU} {DARK}, standing on the RIGHT, reading {FOLDER} in silence, his arrogant smile slowly disappears, {ONE}, {ALONE}. Slow push-in. No dialogue."),
 ("c16", 6, talk("c16", "Nacho", f"Close-up of {NAC} {DARK}, standing on the LEFT, a calm dignified half smile, {ONE}, {ALONE}, {gaze('RIGHT')}, {NODOUBLE('man with black hair')}.",
     "calm, dignified")),
 ("c17", 8, talk("c17", "Cata", f"Close-up of {CAT} {DARK}, standing on the LEFT, chin up, a dignified gentle smile, eyes shining, {ALONE}, {look('Bruno', 'RIGHT')}.",
     "dignified, gentle, firm")),
 ("c18", 6, talk("c18", "Bruno", f"Close-up of {BRU} {DARK}, standing on the RIGHT, he closes {FOLDER}, serious, his voice low, {ONE}, {ALONE}, {gaze('LEFT')}.",
     "low, serious, contained")),
 ("i3", 6, f"Extreme close-up insert {DARK}: the hand of {BRU} pushes {PLUG} back into the wall socket, and the warm string lights glow again. No dialogue."),
 # 3. Pidiendo posada (luces encendidas). Nacho AFUERA a la DERECHA del portón; Cata ADENTRO a la IZQUIERDA. Multitud SOLO en plano abierto mudo.
 ("r5", 6, f"Wide shot {ARC}, the string lights glowing again: seen from a distance, {CROWD}, gather slowly in front of the arcade, "
           "a big colorful seven-point star piñata hanging from a rope above them, swaying gently. Nobody in the foreground, nobody close to the camera. Slow push-in. No dialogue."),
 ("c19", 8, talk("c19", "Nacho", f"Close-up of {NAC} {ARC}, standing on the RIGHT outside a wooden gate, holding one single small lit white candle in a paper cup, "
                 f"eyes closed for a moment then open, {ONE}, {ALONE}, {gaze('LEFT')}. He says the traditional posada verse softly, half sung.",
     "soft, warm, half sung, reverent")),
 ("c20", 8, talk("c20", "Cata", f"Close-up of {CAT} {ARC}, standing on the LEFT inside the wooden gate, a warm smile, eyes shining, {ONE}, {ALONE}, {gaze('RIGHT')}. She says the traditional posada verse softly, half sung.",
     "soft, warm, half sung, joyful")),
 ("i4", 6, f"Close-up insert {ARC}: the hands of {CAT} ladle steaming ponche with guava and sugar cane from a clay pot into {JARRO}. No dialogue."),
 # 4. Aparte junto a la olla de ponche (Herminia IZQUIERDA; Cata DERECHA)
 ("c21", 8, talk("c21", "Herminia", f"Close-up of {HER} {ARC}, standing on the LEFT beside a clay pot of ponche, worried, her voice low, {ONE}, {ALONE}, {gaze('RIGHT')}, {NODOUBLE('person in dark clothes')}.",
     "low, worried, confidential")),
 ("c22", 6, talk("c22", "Cata", f"Close-up of {CAT} {ARC}, standing on the RIGHT, holding {JARRO}, worried, {ONE}, {ALONE}, {look('Herminia', 'LEFT')}.",
     "worried, curious, low")),
 ("c23", 8, talk("c23", "Herminia", f"Close-up of {HER} {ARC}, standing on the LEFT, serious, her voice low, {ONE}, {ALONE}, {gaze('RIGHT')}, {NODOUBLE('person in dark clothes')}. She keeps talking until the end of the clip and says both sentences completely.",
     "low, serious, uneasy")),
 ("r6", 6, f"Close-up of {CAT} {ARC}, standing on the RIGHT, holding {JARRO}, in silence, worried, she slowly turns her eyes to the nativity scene off-screen; {SOLO}. Slow push-in. No dialogue."),
 # 5. Gancho: Bruno solo frente al nacimiento, ya tarde
 ("r7", 6, f"Medium shot of {BRU} {LATE}, alone, he crouches slowly beside the nativity platform and rests one open hand flat on the old floor stones, a slow cold smile appears; "
           f"{SOLO}, {ALONE}. Slow push-in. No dialogue."),
 ("c24", 8, talk("c24", "Bruno", f"Close-up of {BRU} {LATE}, crouched alone beside the nativity platform, looking down at the floor stones, a cold satisfied smile, his voice very low; {ONE}, {ALONE}.",
     "very low, mysterious, satisfied")),
 # CTA con carisma (después del BLACK): Cata sola junto al nacimiento, luces encendidas
 ("c25", 8, talk("c25", "Cata", f"Close-up of {CAT} {ARC}, alone, looking straight into the camera and talking to the viewer from the very first second, with warmth and charisma, "
                 "her lips moving clearly; while she speaks she adjusts her rebozo on her shoulder, tilts her head, smiles, nods and gestures with one open hand toward the nativity scene. "
                 "The arcade behind her is empty, no other people.",
     "warm, charismatic, a little playful, talking directly to the viewer") + " " + CLEAN),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("breaking", "trembling"),
        ("staring at", "looking at"), ("pulls", "slowly takes")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("raising his voice a little", "speaking clearly"), ("disbelieving", "surprised"),
        ("dismissive", "serious"), ("arrogant", "proud"), ("defensive", "serious"),
        ("mocking", "amused"), ("bitter", "sad"), ("stern", "serious"), ("suspicious", "thoughtful"), ("mysterious", "thoughtful"), ("trembling", "soft"),
        ("uneasy", "thoughtful"), ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("annoyed", "serious"), ("cold", "serious"), ("ironic", "calm"), ("indifferent", "calm"),
        ("lit white candle", "white candle"), ("candlelight", "warm light"),
        ("¡", ""), ("!", "."), (", y aquí mando yo", ""), ("Treinta años de estorbo", "Treinta años ya son muchos"), ("como si no fuéramos nadie", "así nomás")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm Christmas night light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican town market at Christmas, warm cinematic light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama at Christmas, warm light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{BRUNO}", "a Mexican businessman"), ("@{HERMINIA_MERCADO}", "an elderly Mexican lady"), ("@{CATALINA}", "an elderly Mexican woman"),
         ("@{NACHO_ARCOS}", "an elderly Mexican man")]
TRIES = 6

def sub(body, pairs):
    """Reemplazo por palabra completa (\\b solo en los bordes alfanuméricos): 'cold' no toca 'scold', 'rage' no toca 'garage'."""
    for a, b in pairs:
        body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    return body

def variant(body, k):
    body = sub(body, SAFE)
    if k >= 1: body = sub(body, SOFT)
    if k >= 3: body = body.replace("Extreme close-up insert", "Close-up").replace("Wide shot", "Medium wide shot")
    if k >= 4: body = sub(body, NOREF)
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
    files, _ = gen("A fluffy orange kitten playing with a ball of yarn on a sofa, soft daylight. No text.", 6, D / "canary")
    for x in files: os.remove(x)
    print("CONTROL gatito:", "Flow OK -> el problema es el prompt" if files else "Flow FALLA -> esperar", flush=True)
    return bool(files)

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
            time.sleep(240 if "inusual" in log else 17)
            if "políticas" not in log and not flow_ok():
                time.sleep(60); continue  # Flow caído: no gastar un intento de redacción
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()

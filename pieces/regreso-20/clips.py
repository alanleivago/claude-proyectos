"""Genera los clips de regreso-20 PARTE 1 (El Regreso) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
         "No music. Clean frame, no captions, no subtitles, no text on screen, no name tags, no lettering on clothes.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2 / chocolate-rancho-p2: subtítulos quemados -> al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA padre-veladoras-p2 / agua-hacienda-p2 / medalla-mezcal-p2: con alguien de espaldas en el borde, la cámara se corre y queda un sombrero/hombro flotando,
# o el del borde se convierte en otra persona -> SOLO primeros planos limpios de una persona, mirando al otro fuera de cuadro. Nada de over-the-shoulder.
# Nadie lleva sombrero (los sombreros flotantes fueron la falla más repetida).
# Geografía fija:
#   Cocina, discusión (c01-c12, r1, r2): Clemencia y Joaquín a la IZQUIERDA junto al retrato de don Julián; Leonor a la DERECHA junto a la mesa.
#   Cocina, firma (i1, c13-c21, r3): don Bernardo sentado a la DERECHA en la cabecera, junto a la ventana; Clemencia, Joaquín y Leonor a la IZQUIERDA.
#   Portal, aparte (c22-c24): Clemencia a la IZQUIERDA; Joaquín a la DERECHA junto a la maleta.
#   Portal, despedida (c25-c29, r4): Leonor a la IZQUIERDA; Clemencia y Joaquín a la DERECHA; don Bernardo llega por la DERECHA.
#   Cocina al atardecer (r5, c30): don Bernardo solo frente al retrato. CTA (c31): Leonor sola en el portal.
COC = ("in the rustic ranch kitchen-dining room @{LOC_ADOBE}, warm adobe walls, a long wooden table, shelves with clay pots and small saint figures, "
       "one single framed old sepia portrait of a moustached man hanging on the wall, golden natural light from the open door and the window; "
       "no extras, nobody else in the room besides the people described")
POR = ("on the shaded front porch @{LOC_TEJABAN} of an old Mexican ranch house, wooden posts and a tiled roof, a wooden fence, trees and a dirt path behind, "
       "warm late afternoon light; no extras, nobody else outside besides the people described")
TAR = ("in the same rustic ranch kitchen @{LOC_ADOBE} at dusk, the room empty and quiet, warm low amber light from the window, "
       "one single framed old sepia portrait of a moustached man hanging on the adobe wall")
# Anclas de identidad y ropa: los atuendos de la referencia con otros colores. Edades numéricas adultas. Manos abiertas y bajas (sin dedo acusador).
CLE = ("@{CLEMENCIA} (68-year-old woman, grey hair in a tight bun, small gold stud earrings, dark green dress with small white flowers, "
       "a pale grey apron with lace trim, her hands open and kept low, she never points a finger at anyone)")
LEO = ("@{LEONOR} (46-year-old woman, dark brown hair in a low ponytail, dark teal short-sleeve t-shirt, a beige cotton apron, no jewelry)")
JOA = ("@{JOAQUIN} (44-year-old man, short black hair, thick black moustache, red and brown plaid long-sleeve shirt, blue jeans, "
       "a brown leather belt, no hat, his hands open and kept low, he never points a finger at anyone)")
BER = ("@{BERNARDO} (62-year-old man, grey hair combed back, neat grey moustache, light beige guayabera shirt, tan trousers, no hat, calm and kind)")
# QA padre-veladoras-p2 (MEDAL) / medalla-mezcal-p2: utilería duplicada -> cada objeto, uno solo
FOLDER = ("one single brown folder holding a few loose typed sheets of paper, the typed text too small to read, "
          "no envelope, no wax seal, no logo, no photos")
BAG = "one single old brown suitcase"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
# QA regreso-20 v1: c14 y c22 sin la 2ª frase, c28 repite "aquí"; dobles/extras en los bordes (c06 otro hombre a cuadros, c21 y c27 mujeres de blusa blanca), Clemencia entrando a cuadro (c26), subtítulos (c25)
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
# QA regreso-20 v2: c06 y c27 otra vez con alguien de espaldas/de perfil en primer plano (plano por encima del hombro) mientras habla desde 0.0 s;
# c14 sin la 2ª frase por 2ª vez (el intento 6 recorta a una sola línea) -> se parte en c14 + c14b, una frase cada uno.
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, his eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
look = lambda who, side: f"{SOLO}, looking at {who} off-screen to the {side}"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {NOSUB}"

CLIPS = [
 # 1. Cocina: el anuncio (Clemencia y Joaquín IZQUIERDA; Leonor DERECHA). Clemencia habla desde el frame 0, sin plano abierto.
 ("c01", 8, talk("c01", "Clemencia", f"Close-up of {CLE} {COC}, standing on the LEFT beside the framed portrait, stern face, chin up, {look('Leonor', 'RIGHT')}.",
     "cold, firm, decided")),
 ("r1", 6, f"Close-up of {JOA} {COC}, standing on the LEFT, in silence, a small satisfied smile, {look('Leonor', 'RIGHT')}. Slow push-in. No dialogue."),
 ("c02", 8, talk("c02", "Leonor", f"Close-up of {LEO} {COC}, standing on the RIGHT by the wooden table, eyes fill with tears, {look('her mother', 'LEFT')}.",
     "hurt, pleading, soft")),
 ("c03", 8, talk("c03", "Clemencia", f"Close-up of {CLE} {COC}, standing on the LEFT, arms crossed, {look('Leonor', 'RIGHT')}.",
     "cold, dismissive")),
 ("c04", 8, talk("c04", "Leonor", f"Close-up of {LEO} {COC}, standing on the RIGHT, one hand on her chest, eyes shining, {look('her mother', 'LEFT')}.",
     "hurt, disbelieving, soft")),
 ("c05", 6, talk("c05", "Clemencia", f"Close-up of {CLE} {COC}, standing on the LEFT beside the framed portrait, {look('Leonor', 'RIGHT')}.",
     "cold, firm")),
 ("c06", 6, talk("c06", "Joaquín", f"Close-up of {JOA} {COC}, standing on the LEFT, a smug half smile, {ONE}, {ALONE}, no other man in a plaid shirt anywhere, {gaze('RIGHT')}.",
     "smug, annoyed")),
 ("c07", 8, talk("c07", "Leonor", f"Close-up of {LEO} {COC}, standing on the RIGHT, she turns her eyes to her brother, bitter, {look('Joaquín', 'LEFT')}.",
     "bitter, hurt, firm")),
 ("c08", 6, talk("c08", "Joaquín", f"Close-up of {JOA} {COC}, standing on the LEFT, a cold confident smile, {look('Leonor', 'RIGHT')}.",
     "cold, confident")),
 ("c09", 8, talk("c09", "Leonor", f"Close-up of {LEO} {COC}, standing on the RIGHT, eyes fill with tears, both hands joined in front of her, {look('her mother', 'LEFT')}.",
     "pleading, soft, breaking")),
 ("c10", 6, talk("c10", "Clemencia", f"Close-up of {CLE} {COC}, standing on the LEFT, chin up, {look('Leonor', 'RIGHT')}.",
     "cold, firm, final")),
 ("c11", 8, talk("c11", "Leonor", f"Close-up of {LEO} {COC}, standing on the RIGHT, eyes shining, her voice low, {look('her mother', 'LEFT')}.",
     "very low, hurt, slow")),
 ("c12", 6, talk("c12", "Clemencia", f"Close-up of {CLE} {COC}, standing on the LEFT, she turns her face away, cold, {SOLO}.",
     "cold, final")),
 ("r2", 6, f"Close-up of {LEO} {COC}, standing on the RIGHT, in silence, eyes shining, she slowly looks up at the framed portrait on the wall off-screen; {SOLO}. Slow push-in. No dialogue."),
 # 2. Cocina: la firma (don Bernardo DERECHA en la cabecera; la familia IZQUIERDA)
 ("i1", 6, f"Extreme close-up insert {COC}: on the long wooden table, the hands of {BER} set down {FOLDER} and open it slowly. No dialogue."),
 ("c13", 8, talk("c13", "Bernardo", f"Close-up of {BER} {COC}, seated on the RIGHT at the head of the wooden table by the window, one hand resting on {FOLDER}, {look('Clemencia', 'LEFT')}.",
     "calm, polite, serious")),
 ("c14", 8, talk("c14", "Clemencia", f"Close-up of {CLE} {COC}, seated on the LEFT at the table, a polite proud smile, {ALONE}, {look('Bernardo', 'RIGHT')}. She keeps talking until the end of the clip and says both sentences completely.",
     "polite, proud, sweet")),
 ("c14b", 6, talk("c14b", "Clemencia", f"Close-up of {CLE} {COC}, seated on the LEFT at the table, a proud nostalgic smile, {ONE}, {ALONE}, {look('Bernardo', 'RIGHT')}. She speaks from the first second.",
     "warm, proud, nostalgic")),
 ("c15", 6, talk("c15", "Bernardo", f"Close-up of {BER} {COC}, seated on the RIGHT at the head of the table, he turns his eyes with interest, {look('Leonor', 'LEFT')}.",
     "calm, curious, kind")),
 ("c16", 6, talk("c16", "Leonor", f"Close-up of {LEO} {COC}, standing on the LEFT by the stove, sad, eyes shining, {look('Bernardo', 'RIGHT')}.",
     "sad, quiet")),
 ("c17", 8, talk("c17", "Bernardo", f"Close-up of {BER} {COC}, seated on the RIGHT, a kind warm smile, one open hand, {look('Leonor', 'LEFT')}.",
     "warm, kind, calm")),
 ("r3", 6, f"Close-up of {CLE} {COC}, seated on the LEFT at the table, in silence, surprised, she glances sideways at her son beside her off-screen; {SOLO}. Slow push-in. No dialogue."),
 ("c18", 6, talk("c18", "Leonor", f"Close-up of {LEO} {COC}, standing on the LEFT, surprised, eyes shining, {look('Bernardo', 'RIGHT')}.",
     "surprised, emotional, soft")),
 ("c19", 8, talk("c19", "Bernardo", f"Close-up of {BER} {COC}, seated on the RIGHT, calm and kind, {look('Leonor', 'LEFT')}.",
     "calm, kind, sincere")),
 ("c20", 8, talk("c20", "Leonor", f"Close-up of {LEO} {COC}, standing on the LEFT, a grateful smile, eyes fill with tears, one hand on her chest, {look('Bernardo', 'RIGHT')}.",
     "grateful, emotional, warm")),
 ("c21", 6, talk("c21", "Joaquín", f"Close-up of {JOA} {COC}, seated on the LEFT at the table, a mocking smile, {ALONE}, no woman beside him, he glances sideways at his sister off-screen; {SOLO}.",
     "mocking, ironic")),
 # 3. Portal: los dos aparte (Clemencia IZQUIERDA; Joaquín DERECHA junto a la maleta)
 ("c22", 8, talk("c22", "Clemencia", f"Close-up of {CLE} {POR}, standing on the LEFT, suspicious, her voice low, {ALONE}, {look('Joaquín', 'RIGHT')}. She keeps talking until the end of the clip and says both sentences completely.",
     "suspicious, low, curious")),
 ("c23", 8, talk("c23", "Joaquín", f"Close-up of {JOA} {POR}, standing on the RIGHT beside {BAG}, a cold smile, {look('his mother', 'LEFT')}.",
     "cruel, mocking")),
 ("c24", 8, talk("c24", "Clemencia", f"Close-up of {CLE} {POR}, standing on the LEFT, she shrugs, cold, {look('Joaquín', 'RIGHT')}.",
     "cold, indifferent")),
 # 4. Portal: la despedida (Leonor IZQUIERDA; Clemencia y Joaquín DERECHA; don Bernardo llega por la DERECHA)
 ("c25", 6, talk("c25", "Leonor", f"Close-up of {LEO} {POR}, standing on the LEFT, a sad dignified smile, eyes shining, {ALONE}, {look('her mother', 'RIGHT')}. {CLEAN}",
     "sad, dignified, soft") + " " + CLEAN),
 ("c26", 6, talk("c26", "Clemencia", f"Close-up of {CLE} {POR}, standing still on the RIGHT, framed from the first frame and speaking from the first second, {ALONE}, cold, a short polite nod, {look('Leonor', 'LEFT')}.",
     "cold, distant")),
 ("r4", 6, f"Medium wide shot {POR}: seen from behind, {CLE} and {JOA} walk slowly away down the dirt path, Joaquín carrying {BAG}. Only these two characters appear in the whole shot, each one exactly once, both visible from the first frame. Slow push-in. No dialogue."),
 ("c27", 6, talk("c27", "Bernardo", f"Close-up of {BER} {POR}, standing on the RIGHT, concerned and kind, {ONE}, {ALONE}, no women in the shot, only the wooden fence and trees beside him, {gaze('LEFT')}.",
     "gentle, concerned")),
 ("c28", 8, talk("c28", "Leonor", f"Close-up of {LEO} {POR}, standing on the LEFT, eyes fill with tears, a brave small smile, {look('Bernardo', 'RIGHT')}. She says every word only once, without repeating any word.",
     "sad, quiet, brave")),
 ("c29", 6, talk("c29", "Bernardo", f"Close-up of {BER} {POR}, standing on the RIGHT, a warm reassuring smile, {look('Leonor', 'LEFT')}.",
     "warm, reassuring")),
 # 5. Gancho: don Bernardo solo frente al retrato de don Julián
 ("r5", 6, f"Close-up of {BER} {TAR}, standing alone in the empty kitchen, in silence, his smile slowly disappears as he looks up at the framed portrait on the wall off-screen; {SOLO}. Slow push-in. No dialogue."),
 ("c30", 8, talk("c30", "Bernardo", f"Close-up of {BER} {TAR}, standing alone, looking up at the framed portrait off-screen, serious and mysterious, his voice very low; {SOLO}.",
     "very low, mysterious, serious")),
 # CTA con carisma (después del BLACK): Leonor sola en el portal
 ("c31", 8, talk("c31", "Leonor", f"Close-up of {LEO} {POR}, alone, looking straight into the camera and talking to the viewer from the very first second, with warmth and charisma, her lips moving clearly; while she speaks she tucks a strand of hair behind her ear, tilts her head, smiles, nods and gestures with one open hand. The porch behind her is empty, no other people.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("breaking", "trembling"),
        ("staring at", "looking at")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("dismissive", "serious"),
        ("mocking", "amused"), ("bitter", "sad"), ("stern", "serious"), ("suspicious", "thoughtful"), ("mysterious", "thoughtful"), ("trembling", "soft"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("annoyed", "serious"), ("cold", "serious"), ("ironic", "calm"), ("indifferent", "calm"),
        ("¡", ""), ("!", "."), ("solterona amargada", "mujer tan seria"), ("Te guste o no", "Así lo decidí")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, old Mexican ranch house, warm cinematic light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{JOAQUIN}", "a Mexican man"), ("@{BERNARDO}", "a Mexican rancher"), ("@{CLEMENCIA}", "an elderly Mexican woman")]
TRIES = 6

def sub(body, pairs):
    """Reemplazo por palabra completa (\\b solo en los bordes alfanuméricos): 'cold' no toca 'scold', 'rage' no toca 'garage'."""
    for a, b in pairs:
        body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    return body

def variant(body, k):
    body = sub(body, SAFE)
    if k >= 1: body = sub(body, SOFT)
    if k >= 3: body = body.replace("Extreme close-up insert", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4: body = sub(body, [(a, b) for a, b in NOREF])
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
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()

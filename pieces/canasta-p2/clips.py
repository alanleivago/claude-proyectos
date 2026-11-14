"""Genera los clips de canasta PARTE 2 (La Canasta) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# QA hacienda-sangre-p2 / chocolate-rancho-p2: subtítulos quemados -> se agrega al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# Hojas de la Parte 1 revisadas en hoja de contactos (cada nombre es su persona/lugar, md5 distintos y sin coincidencias con otras piezas):
# REFUGIO, HORACIO, MARIBEL, EUSEBIO, FEDERICO, LOC_VESTIBULO, LOC_GERENCIA, LOC_BANQUETA, LOC_SALITA. Ninguna hoja nueva.
# QA padre-veladoras-p2 / agua-hacienda-p2: con alguien de espaldas en el borde, la cámara se corre y queda un sombrero/cuerpo flotando, y en canasta P1 c12
# la Refugio del borde se convirtió en otra mujer -> SOLO primeros planos limpios de una persona (SOLO), mirando al otro fuera de cuadro. Nada de over-the-shoulder.
# Geografía fija:
#   Banqueta con lluvia (c01-c06): Federico y Refugio a la IZQUIERDA en los escalones bajo el paraguas; Horacio a la DERECHA en la puerta de vidrio.
#   Recepción (c07-c25): Federico y Refugio a la IZQUIERDA junto a las puertas de vidrio; el mostrador a la DERECHA con Maribel detrás; Horacio y Eusebio a la DERECHA.
#   Gerencia (i1-r6): Federico a la DERECHA detrás del escritorio; Refugio a la IZQUIERDA junto al ventanal.
VES = ("in the bright reception hall @{LOC_VESTIBULO} of a Mexican candy company, the long wooden reception counter on the RIGHT side, white walls with blue Talavera tile accents, "
       "potted plants, the glass entrance doors on the LEFT side with grey light rain outside, soft daylight; no extras, nobody else in the hall besides the people described")
GER = ("in the manager's office @{LOC_GERENCIA}, a dark wooden desk, a black leather chair, a large window over the city on a grey rainy morning, soft daylight; "
       "no extras, nobody else in the office")
LLU = ("at the glass entrance @{LOC_BANQUETA} of the company building, three grey stone steps, light rain, wet shiny sidewalk, cold grey light; "
       "no extras, nobody else on the sidewalk")
SAL = "in the warm living room @{LOC_SALITA} of a Mexican house, a wooden dining table with a white embroidered tablecloth, family photos on the wall, green plants, golden morning light"
# Anclas de identidad y ropa (las de la Parte 1). QA P1 c28: a Refugio le salió el gafete de Maribel -> sin gafete explícito. QA P1 c18: Horacio señaló con el dedo -> manos abiertas y bajas.
# QA reten-sierra-p2: cintas de nombre con letras inventadas -> gafetes blancos lisos, sin nada escrito.
REF = ("@{REFUGIO} (70-year-old woman, grey hair in a low bun, small silver stud earrings, mustard-yellow knitted cardigan, white blouse, long dark blue skirt, "
       "no lanyard and no ID card, carrying her one wicker basket of gum packets and candies)")
HOR = ("@{HORACIO} (50-year-old man, slicked-back black hair with grey temples, completely clean-shaven, black suit, white shirt, solid royal blue tie, "
       "his hands open and kept low, he never points a finger at anyone)")
MAR = "@{MARIBEL} (30-year-old woman, dark hair in a ponytail, light pink blouse, black trousers, blue lanyard with a plain blank white ID card with nothing written on it)"
# QA reten/medalla P2: escoltas con rifles o radios -> manos vacías; portero civil, sin placa ni uniforme oficial
EUS = ("@{EUSEBIO} (55-year-old man, short grey hair, thick grey moustache, plain light blue long-sleeve work shirt, navy blue trousers, "
       "a plain blank white ID card on a lanyard, both hands empty, no badge, no radio, carrying nothing)")
FED = "@{FEDERICO} (42-year-old man, short dark hair, short neat black beard, charcoal grey suit, light grey shirt with open collar, no tie)"
# QA padre-veladoras-p2 (MEDAL): utilería duplicada -> cada objeto, uno solo
UMB = "one single black umbrella"
FOLDER = ("one single open cream folder on the desk holding only a few loose typed sheets of paper, the typed text too small to read, "
          "no envelope, no wax seal, no logo, no photos")
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
look = lambda who, side: f"{SOLO}, looking at {who} off-screen to the {side}"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {NOSUB}"

CLIPS = [
 # 1. Sigue del cliffhanger bajo la lluvia ("¿Su… mamá?") — Federico hablando desde el frame 0, recap en 1 frase
 ("c01", 10, talk("c01", "Federico", f"Close-up of {FED} {LLU}, standing on the LEFT on the wet steps holding {UMB} over his head, {look('Horacio', 'RIGHT')}.",
     "low, serious, controlled")),
 ("c02", 8, talk("c02", "Horacio", f"Close-up of {HOR} {LLU}, standing on the RIGHT in the open glass doorway, his face pale, eyes wide, {look('Federico', 'LEFT')}.",
     "nervous, stammering, quiet")),
 ("c03", 8, talk("c03", "Refugio", f"Close-up of {REF} {LLU}, standing on the LEFT on the steps under {UMB}, serene and dignified, {look('Horacio', 'RIGHT')}.",
     "calm, firm, dignified")),
 ("c04", 8, talk("c04", "Federico", f"Close-up of {FED} {LLU}, standing on the LEFT holding {UMB}, he glances with pride at his mother beside him off-screen, then back to the RIGHT; {SOLO}.",
     "proud, firm")),
 ("r1", 6, f"Close-up of {HOR} {LLU}, standing on the RIGHT in the glass doorway, in silence, he lowers his eyes and swallows, the rain falling behind him; {SOLO}. Slow push-in. No dialogue."),
 ("c05", 8, talk("c05", "Horacio", f"Close-up of {HOR} {LLU}, standing on the RIGHT, a forced polite smile, he opens one hand toward the inside of the building, {look('Refugio', 'LEFT')}.",
     "nervous, fake polite")),
 ("c06", 8, talk("c06", "Refugio", f"Close-up of {REF} {LLU}, standing on the LEFT under {UMB}, a small knowing smile, {look('Horacio', 'RIGHT')}.",
     "calm, ironic, dignified")),
 # 2. Adentro: la recepción se entera (Federico y Refugio IZQUIERDA; mostrador, Maribel, Horacio y Eusebio DERECHA)
 ("r2", 6, f"Medium shot {VES}: {FED} closes {UMB} and walks in through the glass doors on the LEFT side beside {REF}, both calm. Only these two characters appear in the whole shot, each one exactly once. Slow push-in. No dialogue."),
 ("c07", 8, talk("c07", "Maribel", f"Close-up of {MAR} {VES}, standing behind the wooden reception counter on the RIGHT, both hands on her mouth for a second, surprised, eyes shining, {look('Refugio', 'LEFT')}.",
     "surprised, emotional, soft")),
 ("c08", 8, talk("c08", "Refugio", f"Close-up of {REF} {VES}, standing on the LEFT near the glass doors, a warm grateful smile, {look('Maribel', 'RIGHT')}.",
     "warm, tender, grateful")),
 ("c09", 8, talk("c09", "Maribel", f"Close-up of {MAR} {VES}, behind the counter on the RIGHT, a shy smile, {look('Refugio', 'LEFT')}.",
     "shy, warm, humble")),
 ("c10", 8, talk("c10", "Eusebio", f"Close-up of {EUS} {VES}, standing on the RIGHT beside the counter, he lowers his eyes, ashamed, his hands joined in front of him, {look('Federico', 'LEFT')}.",
     "humble, quiet, ashamed")),
 ("c11", 8, talk("c11", "Refugio", f"Close-up of {REF} {VES}, standing on the LEFT, a kind smile, {look('Eusebio', 'RIGHT')}.",
     "kind, warm, calm")),
 ("c12", 8, talk("c12", "Horacio", f"Close-up of {HOR} {VES}, standing on the RIGHT in front of the counter, his hands open in front of his chest, trying to explain, {look('Federico', 'LEFT')}.",
     "nervous, defensive, fast")),
 ("c13", 8, talk("c13", "Federico", f"Close-up of {FED} {VES}, standing on the LEFT, his hands empty, serious and calm, {look('Horacio', 'RIGHT')}.",
     "serious, calm, disappointed")),
 ("c14", 8, talk("c14", "Horacio", f"Close-up of {HOR} {VES}, standing on the RIGHT, a nervous half smile, {look('Federico', 'LEFT')}.",
     "nervous, smooth, insisting")),
 ("c15", 6, talk("c15", "Refugio", f"Close-up of {REF} {VES}, standing on the LEFT, she turns her head to her son beside her off-screen, worried; {SOLO}.",
     "worried, soft")),
 ("c16", 8, talk("c16", "Federico", f"Close-up of {FED} {VES}, standing on the LEFT, he looks at his mother beside him, then turns his eyes to the RIGHT; {SOLO}.",
     "low, serious, realizing")),
 ("r3", 6, f"Close-up of {FED} {VES}, standing on the LEFT, in silence, he takes one slow breath and his face becomes firm, {look('Horacio', 'RIGHT')}. Slow push-in. No dialogue."),
 ("c17", 8, talk("c17", "Federico", f"Close-up of {FED} {VES}, standing on the LEFT, calm and firm, {look('Horacio', 'RIGHT')}.",
     "firm, calm, final")),
 ("c18", 8, talk("c18", "Horacio", f"Close-up of {HOR} {VES}, standing on the RIGHT, his eyes wide, his hands open low, {look('Federico', 'LEFT')}.",
     "upset, disbelieving")),
 ("c19", 8, talk("c19", "Refugio", f"Close-up of {REF} {VES}, standing on the LEFT, chin up, holding her one wicker basket with both hands, {look('Horacio', 'RIGHT')}.",
     "calm, firm, dignified")),
 # El espejo de la Parte 1: ahora don Eusebio acompaña a Horacio a la salida
 ("c20", 6, talk("c20", "Federico", f"Close-up of {FED} {VES}, standing on the LEFT, he turns his head toward the counter on the RIGHT, calm; {SOLO}.",
     "calm, firm")),
 ("c21", 8, talk("c21", "Eusebio", f"Close-up of {EUS} {VES}, standing on the RIGHT, polite and serene, he offers his arm gently, {look('Horacio', 'LEFT')}.",
     "gentle, polite, serene")),
 # QA v1 r4: caminaron hacia la cámara (entrando, no saliendo) y al final apareció un letrero verde de salida con letras -> de espaldas, alejándose hacia las puertas; sin letreros
 ("r4", 6, f"Medium shot from behind {VES}: {EUS} walks calmly beside {HOR} away from the camera toward the glass entrance doors on the LEFT, both seen from behind, leaving the building, Horacio carrying nothing, his head down; the light rain outside the glass doors. No exit signs and no signs with words anywhere on the walls or doors. Only these two characters appear in the whole shot, each one exactly once. Slow push-in. No dialogue."),
 ("c22", 6, talk("c22", "Horacio", f"Close-up of {HOR} {VES}, standing at the glass doors, he turns his head back over his shoulder, cold and quiet; {SOLO}.",
     "cold, quiet, slow")),
 # 3. Recompensa (cama cálida)
 ("c23", 8, talk("c23", "Refugio", f"Close-up of {REF} {VES}, standing on the LEFT, a warm proud smile, she looks at her son beside her off-screen; {SOLO}.",
     "warm, wise, a little playful")),
 ("c24", 8, talk("c24", "Federico", f"Close-up of {FED} {VES}, standing on the LEFT, a warm smile, {look('Maribel and Eusebio', 'RIGHT')}.",
     "warm, grateful, firm")),
 ("c25", 6, talk("c25", "Maribel", f"Close-up of {MAR} {VES}, behind the counter on the RIGHT, eyes shining, a big smile, one hand on her chest, {look('Federico', 'LEFT')}.",
     "emotional, grateful, happy")),
 # 4. Gancho nuevo: los papeles de Horacio (gerencia: Federico DERECHA detrás del escritorio, Refugio IZQUIERDA junto al ventanal)
 ("i1", 6, f"Extreme close-up insert {GER}: the hands of {FED} open {FOLDER} and turn one sheet slowly. No dialogue."),
 ("c26", 8, talk("c26", "Federico", f"Close-up of {FED} {GER}, standing on the RIGHT behind the dark wooden desk, holding one loose typed sheet low, its text not readable, {look('his mother', 'LEFT')}.",
     "serious, worried")),
 ("c27", 6, talk("c27", "Refugio", f"Close-up of {REF} {GER}, standing on the LEFT by the large window, surprised, {look('Federico', 'RIGHT')}.",
     "surprised, worried, soft")),
 ("c28", 8, talk("c28", "Federico", f"Close-up of {FED} {GER}, standing on the RIGHT, he glances down at the sheet in his hand, then up, {look('his mother', 'LEFT')}.",
     "serious, curious")),
 ("r5", 6, f"Close-up of {REF} {GER}, standing on the LEFT by the window, in silence, her smile slowly disappears and she holds her one wicker basket closer; {SOLO}. Slow push-in. No dialogue."),
 ("c29", 10, talk("c29", "Refugio", f"Close-up of {REF} {GER}, standing on the LEFT by the window, eyes shining, her voice low, {look('Federico', 'RIGHT')}.",
     "very low, shaken, slow")),
 ("r6", 6, f"Close-up of {FED} {GER}, standing on the RIGHT, in silence, his eyes go wide and he stays still, the loose sheet in his hand; {SOLO}. Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK), en la salita como el CTA de la Parte 1
 ("c30", 10, talk("c30", "Refugio", f"Close-up of {REF} {SAL}, alone, looking straight into the camera and talking to the viewer from the very first second, with warmth and charisma, her lips moving clearly; while she speaks she nods, tilts her head, smiles and gestures with one open hand toward her wicker basket. The room behind her is empty, no other people.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("defensive", "serious"),
        ("ashamed", "humble"), ("stammering", "quiet"), ("fake polite", "polite"), ("forced", "small"), ("eyes wide", "eyes open"), ("his face pale", "his face serious"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("disappointed", "serious"), ("nervous", "quiet"), ("cold", "serious"), ("ironic", "calm"),
        ("¡", ""), ("!", "."), ("humillar", "tratar mal"), ("sacar", "despedir")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, modern Mexican office building, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{HORACIO}", "a Mexican office manager"), ("@{EUSEBIO}", "a Mexican doorman"), ("@{FEDERICO}", "a Mexican businessman")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Extreme close-up insert", "Close-up").replace("Medium wide shot", "Medium shot")
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

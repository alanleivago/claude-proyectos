"""Genera los clips de tele-nueva con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
CAS = ("in the modest living room @{LOC_CASITA} of an old Mexican house, a floral armchair, a brown sofa, shelves with saint figurines and family photos, "
       "a picture of the Virgin of Guadalupe, an old boxy CRT television on a wooden stand, warm window light")
CAN = ("in the modest living room @{LOC_CASITA} of an old Mexican house, a floral armchair, a brown sofa, shelves with saint figurines and family photos, "
       "a picture of the Virgin of Guadalupe, a large new flat-screen television on the wooden stand, warm window light")
RES = ("in the comfortable living room @{LOC_RESIDENCIA} of a Mexican house, cream sofas, golden curtains, landscape paintings, "
       "a carved wooden TV cabinet with a large flat-screen television, warm daylight")
RSV = ("in the comfortable living room @{LOC_RESIDENCIA} of a Mexican house, cream sofas, golden curtains, landscape paintings, "
       "an empty carved wooden TV cabinet, warm daylight")
# Ancla de identidad: primera mención de cada personaje en cada prompt (también el del borde: ropa completa con pantalón y calzado)
GEN = ("@{GENARO} (38-year-old Mexican mestizo man, brown skin, short black hair combed back, short neat black moustache, no beard, "
       "olive green long-sleeve work shirt with the sleeves rolled up, dark blue jeans, brown leather belt, brown leather work boots)")
REM = ("@{REMEDIOS} (86-year-old Mexican mestiza woman, brown skin, white hair in a low bun, no glasses, dark green dress with a small white flower print, "
       "white crochet apron, black cloth slippers)")
GRI = ("@{GRISELDA} (36-year-old Mexican mestiza woman, brown skin, long straight black hair, red lipstick, cobalt blue long-sleeve blouse, "
       "black trousers, black flat shoes)")
CHA = ("@{CHABELA} (62-year-old Mexican mestiza woman, brown skin, short wavy light brown hair, gold necklace, small gold earrings, "
       "purple blouse with a large white flower print, cream trousers, beige flat shoes)")
NO = " No other people."
NOBADGE = " Nobody wears an ID badge or a lanyard."

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: Genaro habla desde el frame 0, la tele vieja al fondo
 ("c01", 8, talk("Genaro", f"Medium close-up of {GEN} {CAS}, seated on the brown sofa, frowning and confused, looking at the old boxy television; {REM} seated in the floral armchair, blurred at the left edge of the frame. Genaro speaks from the very first second.{NO}{NOBADGE}",
     ["Mamá, ¿qué haces viendo la tele en ese aparato tan antiguo?", "¿Y la tele nueva que te regalé?"], "surprised, concerned")),
 ("c02", 8, talk("Remedios", f"Close-up of {REM} {CAS}, seated in the floral armchair, sad, her hands in her lap; {GEN} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Vino tu esposa esta mañana, mi rey.", "Dice que su mamá la necesita más que yo."], "quiet, sad, a fragile voice")),
 ("c03", 6, talk("Genaro", f"Close-up of {GEN} {CAS}, his eyebrows raised in disbelief, looking at {REM}, who is blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["¿Griselda? ¿Cómo que te la quitó?"], "surprised, upset")),
 ("c04", 10, talk("Remedios", f"Close-up of {REM} {CAS}, seated in the floral armchair, her eyes wet, looking down; {GEN} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Me dice que yo ya estoy muy grande…", "que a mis ochenta y seis años ni le entiendo a esas teles modernas."], "quiet, hurt, with teary eyes")),
 ("c05", 8, talk("Genaro", f"Medium shot {CAS}: {GEN} stands up from the brown sofa, serious, facing {REM}, who is seated in the floral armchair, blurred in the foreground.{NO}{NOBADGE}",
     ["Eso sí que no, mamá.", "Nadie te va a hacer menos por tu edad."], "firm, protective")),
 ("c06", 6, talk("Genaro", f"Medium close-up of {GEN} {CAS}, standing, holding a black smartphone at his ear, serious; only Genaro holds a phone; {REM} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Griselda, ¿dónde estás?"], "serious, controlled")),
 ("c07", 8, talk("Griselda", f"Medium close-up of {GRI} {RES}, alone, seated on a cream sofa with a black smartphone at her ear, relaxed, her long straight black hair worn loose over her shoulders (no ponytail, the same loose hair in every shot), the large flat-screen television on behind her, its picture stays inside the screen; only Griselda holds a phone. Nobody else in the room.{NO}{NOBADGE}",
     ["En casa de mi mamá, viendo su programa.", "¿Por qué?"], "casual, carefree")),
 ("c08", 8, talk("Genaro", f"Close-up of {GEN} {CAS}, standing, the black smartphone at his ear, his jaw tight; {REM} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["No te muevas de ahí.", "Voy en camino."], "low, serious, firm")),
 ("c09", 8, talk("Remedios", f"Close-up of {REM} {CAS}, seated in the floral armchair, worried, looking up at {GEN}, who is blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Ve con calma, mi rey.", "No quiero que se peleen por mi culpa."], "soft, worried, pleading")),
 # 2. Confrontación en casa de la suegra
 ("c10", 10, talk("Genaro", f"Medium shot {RES}: {GEN} stands in front of {GRI}, who sits on a cream sofa; the large flat-screen television is behind her.{NO}{NOBADGE}",
     ["Griselda, ¿cómo está eso de que le quitaste la tele a mi mamá?", "Esa tele yo se la regalé."], "serious, upset, controlled")),
 ("c11", 8, talk("Griselda", f"Close-up of {GRI} {RES}, seated on a cream sofa, rolling her eyes, a cynical half smile; {GEN} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Ay, Genaro, no exageres.", "Tu mamá ya está grande, ni cuenta se da."], "cynical, dismissive")),
 ("c12", 10, talk("Genaro", f"Close-up of {GEN} {RES}, one hand on his chest, upset; {GRI} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["¿Que no se da cuenta?", "En ese aparato no se distinguen ni las caras.", "Yo se la compré a ella, para sus novelas."], "hurt, firm, his voice rising a little")),
 ("c13", 8, talk("Chabela", f"Medium close-up of {CHA} {RES}, seated in a cream armchair, a fake sweet smile, her hands folded on her knees; {GEN} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Ay, Genarito, no te pongas así.", "Tu mamá entendió perfecto."], "fake sweet, manipulative")),
 ("c14", 8, talk("Genaro", f"Close-up of {GEN} {RES}, turning toward {CHA}, who is blurred at the right edge of the frame, serious.{NO}{NOBADGE}",
     ["¿Pues cómo quiere que me ponga, suegra?", "No se vale que se aprovechen de mi mamá."], "serious, firm, respectful")),
 ("c15", 8, talk("Chabela", f"Close-up of {CHA} {RES}, seated in a cream armchair, shaking her head, clutching a cushion; {GEN} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["No, no, no. Griselda me la regaló.", "Tú no me la puedes quitar, Genarito."], "whiny, stubborn")),
 ("c16", 10, talk("Genaro", f"Medium shot {RES}: {GEN} stands next to the large flat-screen television on the carved wooden TV cabinet, resting one open hand on top of its thin black frame, looking at {CHA}, who is seated in a cream armchair, seen from behind and blurred in the foreground. The television is switched off: a plain flat black screen with a thin black frame, the same shape from the first to the last frame, nothing on or around it.{NO}{NOBADGE}",
     ["Claro que puedo. Yo la compré.", "Usted tiene a sus muchachos para que le compren una igual."], "calm, firm, a little ironic")),
 ("c17", 8, talk("Griselda", f"Medium close-up of {GRI} {RES}, standing with her arms crossed, annoyed; {GEN} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Mis hermanos andan muy apretados, Genaro.", "Pagan escuelas privadas."], "annoyed, defensive")),
 ("c18", 10, talk("Genaro", f"Close-up of {GEN} {RES}, his open palms turned up, tired but proud; {GRI} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["¿Y yo no? Hago turnos dobles en la obra, de sol a sol.", "Y lo hago con gusto, porque mi mamá se lo merece."], "firm, proud, emotional")),
 ("c19", 8, talk("Genaro", f"Medium shot {RES}: {GEN} calmly unplugs the large flat-screen television from the wall and lifts it carefully with both hands; {GRI} stands with her arms crossed, blurred at the left edge of the frame, she stays at that edge the whole shot. There is only one television in the room: once Genaro lifts it, the carved wooden TV cabinet stays empty, no second television anywhere.{NO}{NOBADGE}",
     ["Con permiso, suegra."], "calm, final")),
 ("c20", 8, talk("Griselda", f"Close-up of {GRI} {RES}, upset, her eyes wide, looking at {GEN}, who holds the flat-screen television, blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["¿De verdad le vas a hacer esto a mi mamá?", "Mírala, pobrecita."], "upset, dramatic")),
 ("c21", 8, talk("Chabela", f"Close-up of {CHA} {RES}, seated in a cream armchair, one hand on her chest, an exaggerated sad face; {GEN} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Ay, pobre de mí.", "Me voy a quedar sin mis programas."], "theatrical, self-pitying")),
 ("c22", 10, talk("Genaro", f"Medium shot {RSV}: {GEN} already holds the large flat-screen television in both arms from the first frame, standing still in the middle of the room, looking at {CHA}, who is seated in a cream armchair, seen from behind and blurred in the foreground. It is the only television in the room: the carved wooden TV cabinet behind him is empty from the first to the last frame, no second television anywhere.{NO}{NOBADGE}",
     ["Lo siento, suegra.", "Usted que se siente tan moderna… póngase a ahorrar y cómprese una nueva."], "calm, ironic, firm")),
 ("c23", 6, talk("Chabela", f"Medium shot {RSV}: {CHA} sinks down on a cream sofa with a long sigh, staring at the empty TV cabinet; {GRI} sits next to her and gently rests a hand on her shoulder.{NO}{NOBADGE}",
     ["Ay, Griselda… ¿y ahora qué voy a ver?"], "whiny, defeated, comic")),
 # 3. Regreso con la mamá (cama cálida)
 ("c24", 8, talk("Genaro", f"Medium shot {CAS}: {GEN} walks in through the front door carrying the large flat-screen television in both arms, smiling; {REM} sits in the floral armchair, blurred in the foreground.{NO}{NOBADGE}",
     ["¡Mamá, mira quién regresó!"], "happy, warm")),
 ("c25", 6, talk("Remedios", f"Close-up of {REM} {CAS}, seated in the floral armchair, her face lighting up with surprise, both hands on her cheeks; {GEN} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["¡Mi rey! ¿Me regresaste mi tele?"], "surprised, joyful, a fragile voice")),
 ("c26", 10, talk("Genaro", f"Medium shot {CAN}: {GEN} sets the large flat-screen television on the wooden stand, the old boxy television now on the floor next to it, and smiles at {REM}, who is blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Claro que sí, mamá. Es tuya y de nadie más.", "Ese aparato antiguo se va para afuera."], "warm, proud")),
 ("c27", 10, talk("Remedios", f"Close-up of {REM} {CAN}, seated in the floral armchair, holding a TV remote, her eyes wet with joy, the bright screen light on her face; only Remedios holds a remote; {GEN} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Ay, mi rey… se ve todo a colores.", "Que Dios te bendiga siempre."], "tender, emotional, with teary eyes")),
 ("c28", 8, talk("Genaro", f"Medium close-up {CAN}: {GEN} sits on the brown sofa next to {REM}, his arm gently around her shoulders, smiling at her.{NO}{NOBADGE}",
     ["Te mereces eso y más, mamá.", "Mientras yo viva, nadie te va a faltar al respeto."], "warm, tender, firm")),
 # 4. Cliffhanger: llega Griselda
 ("c29", 8, talk("Griselda", f"Medium shot {CAN}: {GRI} stands in the open front doorway, serious, her hands clasped in front of her; {GEN} seen from behind and blurred in the foreground (only his black hair and olive green shirt visible).{NO}{NOBADGE}",
     ["Genaro… vine a hablar contigo."], "serious, quiet")),
 ("c30", 6, talk("Genaro", f"Close-up of {GEN} {CAN}, standing, serious, his arms crossed, looking at {GRI}, who is blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Si vienes por la tele, ni lo intentes."], "cold, firm")),
 ("c31", 8, talk("Griselda", f"Close-up of {GRI} {CAN}, standing in the doorway, her eyes wet, worried; {GEN} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["No vengo por la tele…", "Es mi mamá, Genaro."], "quiet, worried, emotional")),
 # CTA final (tras negro)
 ("c32", 8, talk("Genaro", f"Close-up of {GEN} {CAN}, alone, looking straight into the camera and talking to the viewer from the very first second, his lips moving clearly from the first frame; with warmth and charisma, while he speaks he nods, tilts his head, smiles and gestures with one open hand toward the new television behind him.{NO}{NOBADGE}",
     ["¿Qué creen que le pasó a doña Chabela?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("stands very close in front of", "stands in front of"), ("pointing", "gesturing"), ("steps closer to", "faces"),
        ("his voice rises", "serious"), ("his voice breaks", "quiet voice"), ("furious", "upset"), ("crying", "with teary eyes")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("disdainful", "serious"), ("disdain", "seriousness"), ("arrogant", "proud"), ("mocking", "ironic"), ("condescending", "serious"),
        ("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("tense", "serious"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shock", "surprise"), ("goes pale", "freezes"), ("commanding", "firm"), ("dismissive", "serious"), ("irritated", "annoyed"),
        ("young", "adult"), ("teenager", "adult"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"),
        ("cynical", "ironic"), ("manipulative", "sweet"), ("unplugs", "disconnects"), ("clutching", "holding"), ("his jaw tight", "serious"),
        ("his voice rising a little", "serious"), ("theatrical", "sad"), ("self-pitying", "sad"), ("defeated", "sad"),
        ("¡", ""), ("!", "."), ("se aprovechen de", "le hagan esto a"), ("apretados", "ocupados"), ("peleen", "discutan")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, modest Mexican family home, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{GENARO}", "a 38-year-old Mexican man"),
         ("@{GRISELDA}", "a 36-year-old Mexican woman"),
         ("@{CHABELA}", "a 62-year-old Mexican woman"),
         ("@{REMEDIOS}", "an 86-year-old Mexican woman")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4:  # cambiar el personaje: sin imagen de referencia, descripción civil
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

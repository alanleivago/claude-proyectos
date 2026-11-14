"""Genera los clips de suegra con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
DEP = ("in the living room with open kitchen @{LOC_DEPTO} of a modern middle-class Mexican house, white walls, dark wooden doors, a grey fabric sofa "
       "covered with blankets, pillows and travel bags, a light wood kitchen counter, a white fridge, warm lamp light")
AZO = ("on the sunny rooftop laundry area @{LOC_AZOTEA} of a Mexican house, a white concrete washtub, clotheslines with hanging clothes, "
       "white walls, potted plants, bright daylight")
COR = ("in a bright modern open office @{LOC_CORPORATIVO}, a light wood reception counter near the entrance, white desks with computers, "
       "a large window, a green plant, cool daylight")
# Ancla de identidad: primera mención de cada personaje en cada prompt (también el del borde: ropa completa con pantalón, calzado y accesorios)
PAL = ("@{PALOMA} (32-year-old Mexican mestiza woman, brown skin, long wavy black hair, small gold hoop earrings, thin gold pendant necklace, "
       "light sage green ribbed knit top with small buttons and long sleeves, light grey high-waist trousers with a thin brown belt, nude flat shoes)")
ROD = ("@{RODRIGO} (34-year-old Mexican mestizo man, brown skin, short black hair, short trimmed black beard and black moustache, "
       "pale yellow long-sleeve dress shirt with rolled-up sleeves, navy blue trousers, brown belt, brown shoes, black wristwatch on his left wrist)")
SOC = ("@{SOCORRO} (60-year-old Mexican mestiza woman, brown skin, heavy build, grey hair in a loose bun, gold hoop earrings, "
       "dark green short-sleeve dress with a small yellow and white flower print, brown flat sandals)")
PAN = ("@{PANCHO} (29-year-old Mexican mestizo man, brown skin, chubby, curly black hair, short black beard and black moustache, "
       "faded navy blue t-shirt with faint stains, khaki cargo shorts, black flip-flops)")
YAD = ("@{YADIRA} (27-year-old Mexican mestiza woman, brown skin, dark brown hair in a messy bun, light peach t-shirt, "
       "light blue pajama pants with a small white flower print, pink slippers)")
IRE = ("@{IRENE} (45-year-old Mexican mestiza woman, brown skin, chin-length dark brown bob, small pearl earrings, navy blue blazer, "
       "white blouse, black trousers, black low heels)")
NO = " No other people."
NOBADGE = " Nobody wears an ID badge or a lanyard."
BAG = "a black leather shoulder bag hanging from her left shoulder, her hands empty"   # Paloma en la llegada (esc. 1) y la salida (esc. 4)
def BL(who, hand): return f" There is only ONE white blouse in the scene, a stained white blouse, held only by {who} in her {hand} hand for the whole shot."
def CT(who, hand): return (f" There is only ONE remote control in the scene, the small black garage remote @{{PROP_CONTROL}}, "
                           f"held only by {who} in her {hand} hand for the whole shot.")
NOC = " There is no remote control in the shot."

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Llegada (noche): la familia ya está instalada. Rodrigo habla desde el frame 0, sin plano abierto.
 ("c01", 8, talk("Rodrigo", f"Medium close-up of {ROD} {DEP}, evening, standing just inside the front door, surprised, looking toward the sofa, his hands empty; {PAL} stands next to him at the right edge of the frame, slightly blurred, {BAG}. Rodrigo speaks from the very first second.{NOC}{NO}",
     ["¿Mamá? ¿Qué hacen todos aquí?", "¿Y todas esas maletas?"], "surprised, confused")),
 ("c02", 8, talk("Socorro", f"Medium close-up of {SOC} {DEP}, evening, seated on the grey sofa among blankets and travel bags, calm, her hands resting on her lap; {ROD} blurred at the right edge of the frame, seen from behind, his hands empty.{NOC}{NO}",
     ["Nos sacaron del departamento, Rodrigo.", "Nomás van a ser unos días."], "calm, sweet, a little sly")),
 ("c03", 6, talk("Pancho", f"Medium shot of {PAN} {DEP}, evening, lying on the grey sofa with his hands behind his head, relaxed, grinning; {PAL} blurred at the left edge of the frame, {BAG}.{NOC}{NO}",
     ["Cuñada, ¿qué hay de cenar?"], "lazy, cheeky")),
 ("c04", 8, talk("Paloma", f"Close-up of {PAL} {DEP}, evening, standing, {BAG}, tired and annoyed; {PAN} lying on the sofa, blurred at the right edge of the frame, his hands behind his head.{NOC}{NO}",
     ["Vengo cansada de la oficina, Pancho.", "¿Unos días… con tantas maletas?"], "tired, annoyed, quiet")),
 ("c05", 8, talk("Socorro", f"Close-up of {SOC} {DEP}, evening, seated on the sofa, raising her chin, offended; {PAL} blurred at the right edge of the frame, {BAG}.{NOC}{NO}",
     ["Somos familia, Paloma.", "Una buena nuera no pone esas caras."], "offended, cold")),
 ("c06", 8, talk("Rodrigo", f"Close-up of {ROD} {DEP}, evening, standing, his hands empty, turning to speak softly to {PAL}, who stands at the right edge of the frame, blurred, {BAG}.{NOC}{NO}",
     ["Nomás es en lo que encuentran algo.", "Aguántame tantito, mi amor."], "soft, conciliatory, low voice")),
 # 2. La mañana: se comieron la comida de la semana
 ("c07", 8, talk("Paloma", f"Medium close-up of {PAL} {DEP}, morning light, standing in front of an open, almost empty white fridge, holding the fridge door with her left hand, upset; {YAD} blurred at the right edge of the frame, holding a white mug in both hands.{NOC}{NO}",
     ["¿Dónde quedó la comida de la semana?", "Ayer compré de todo."], "upset, surprised")),
 ("c08", 6, talk("Yadira", f"Medium close-up of {YAD} {DEP}, morning light, leaning on the kitchen counter, holding a white mug in both hands, eyes half closed, unbothered; {PAL} blurred at the left edge of the frame, her hands empty.{NOC}{NO}",
     ["Ay, nos la acabamos anoche."], "careless, lazy")),
 ("c09", 8, talk("Paloma", f"Close-up of {PAL} {DEP}, morning light, standing next to the open fridge, her hands empty at her sides, upset and firm. Paloma wears exactly her reference outfit: the sage green knit top with her LIGHT GREY trousers and the thin brown belt (NOT green pants, NOT a matching knit set). {YAD} blurred at the RIGHT edge of the frame, holding a white mug in both hands.{NOC}{NO}",
     ["Era para mis almuerzos de la semana.", "Ustedes también pueden comprar comida."], "upset, firm")),
 ("c10", 6, talk("Socorro", f"Medium close-up of {SOC} {DEP}, morning light, seated on a stool at the kitchen counter, waving one hand, dismissive; {PAL} blurred at the right edge of the frame, her hands empty.{NOC}{NO}",
     ["Ay, pues compras más. Ni que fuera tanto."], "dismissive, careless")),
 # 3. Azotea: la blusa de la oficina
 ("c11", 8, talk("Paloma", f"Medium close-up of {PAL} {AZO}, standing next to the washtub, holding up a stained white blouse in her RIGHT hand (the hand on the left side of the frame), her left hand empty, upset; {YAD} blurred at the RIGHT edge of the frame, her hands empty.{BL('Paloma', 'right')}{NOC}{NO}",
     ["¿Quién agarró mi blusa blanca?", "Es la de la oficina."], "upset, worried")),
 ("c12", 8, talk("Yadira", f"Medium close-up of {YAD} {AZO}, standing, her hands empty, eyes closed, a careless little smile, shrugging; {PAL} blurred at the left edge of the frame, holding the stained white blouse in her right hand.{BL('Paloma', 'right')}{NOC}{NO}",
     ["La usé para limpiar el piso, poquito.", "Ay, pues se lava, ¿no?"], "careless, ironic")),
 ("c13", 6, talk("Paloma", f"Close-up of {PAL} {AZO}, her eyes wet, holding the stained white blouse against her chest with her right hand; {YAD} blurred at the right edge of the frame, her hands empty.{BL('Paloma', 'right')}{NOC}{NO}",
     ["Hoy tengo una presentación, Yadira."], "hurt, quiet, teary")),
 # 4. La salida: la suegra manda
 ("c14", 8, talk("Socorro", f"Medium close-up of {SOC} {DEP}, morning light, standing next to the kitchen counter piled with dirty dishes, her arms crossed, bossy; {PAL} blurred at the right edge of the frame, {BAG}.{NOC}{NO}",
     ["Antes de irte, limpia la cocina.", "Esos trastes no se lavan solos."], "bossy, cold")),
 ("c15", 8, talk("Paloma", f"Close-up of {PAL} {DEP}, morning light, standing, {BAG}, in a hurry, her eyes wet; {SOC} blurred at the left edge of the frame, her arms crossed.{NOC}{NO}",
     ["Voy tarde por culpa de Yadira.", "Pancho y Yadira también viven aquí."], "upset, hurried")),
 ("c16", 8, talk("Socorro", f"Close-up of {SOC} {DEP}, morning light, her arms crossed, raising her eyebrows; {PAL} blurred at the right edge of the frame, {BAG}.{NOC}{NO}",
     ["Pues organízate.", "Esos dos ya tienen sus problemas."], "cold, dismissive")),
 # 5. La oficina: la suegra llega a exigir el control de la cochera
 ("c17", 6, talk("Irene", f"Over-the-shoulder medium shot {COR}: {IRE} standing, serious, her hands empty, speaking to {PAL}, who is seated at a white desk at the left edge of the frame, seen from behind, her hands on the desk.{NOC}{NO}{NOBADGE}",
     ["Paloma, una señora te busca en recepción."], "serious, discreet")),
 ("c18", 6, talk("Paloma", f"Medium close-up of {PAL} {COR}, standing near the reception counter, surprised, one hand on her chest; {SOC} blurred at the right edge of the frame, her arms crossed.{NOC}{NO}{NOBADGE}",
     ["¿Doña Socorro? ¿Qué hace usted aquí?"], "surprised, nervous")),
 ("c19", 8, talk("Socorro", f"Medium close-up of {SOC} {COR}, leaning one elbow on the reception counter, demanding, loud; {PAL} blurred at the left edge of the frame, her hands empty.{NOC}{NO}{NOBADGE}",
     ["Vine por el control de la cochera.", "Quiero entrar y salir cuando yo quiera."], "demanding, loud, stubborn")),
 ("c20", 8, talk("Paloma", f"Close-up of {PAL} {COR}, standing, embarrassed, glancing around, her eyes wet, her hands empty; {SOC} blurred at the right edge of the frame, one elbow on the reception counter.{NOC}{NO}{NOBADGE}",
     ["Estoy en la oficina, señora.", "Aquí no, por favor."], "embarrassed, pleading, quiet")),
 ("c21", 8, talk("Socorro", f"Medium close-up of {SOC} {COR}, standing, both arms open wide, theatrical; {PAL} blurred at the LEFT edge of the frame, her hands empty.{NOC}{NO}{NOBADGE}",
     ["No me voy sin ese control.", "Eres una egoísta, Paloma."], "loud, offended, theatrical")),
 ("c22", 6, talk("Paloma", f"Close-up of {PAL} {COR}, tears in her eyes, firm, her hands empty; {SOC} blurred at the right edge of the frame, her arms crossed.{NOC}{NO}{NOBADGE}",
     ["Vino a avergonzarme frente a todos."], "hurt, firm, quiet")),
 # 6. El ultimátum (noche)
 ("c23", 8, talk("Rodrigo", f"Medium close-up of {ROD} {DEP}, evening, standing, serious and upset, his hands empty; {SOC} blurred at the right edge of the frame, her arms crossed.{NOC}{NO}",
     ["Mamá, ¿fuiste a molestar a Paloma a la oficina?", "Le pudo ir muy mal por tu culpa."], "serious, upset, firm")),
 ("c24", 8, talk("Socorro", f"Close-up of {SOC} {DEP}, evening, her arms crossed, offended; {ROD} blurred at the left edge of the frame, his hands empty.{NOC}{NO}",
     ["Nomás pedí el control.", "¿Ahora la vas a defender?"], "offended, defiant")),
 ("c25", 8, talk("Rodrigo", f"Close-up of {ROD} {DEP}, evening, standing, his hands empty, speaking firmly while looking down to his right at {PAN}, who is seated on the sofa, blurred at the right edge of the frame, his hands behind his head.{NOC}{NO}",
     ["Pancho, mañana sales a buscar empleo.", "Y si no respetan nuestra casa, se van."], "firm, serious")),
 ("c26", 8, talk("Socorro", f"Close-up of {SOC} {DEP}, evening, standing, her chin up, her arms crossed, defiant; {ROD} blurred at the left edge of the frame, his hands empty.{NOC}{NO}",
     ["Esta casa es de Rodrigo.", "Él no nos va a sacar."], "defiant, proud")),
 ("c27", 6, talk("Paloma", f"Medium close-up of {PAL} {DEP}, evening, seated on a grey armchair, tired, her eyes wet, her hands on her knees. Paloma wears exactly her reference outfit: the sage green knit top with her LIGHT GREY trousers and the thin brown belt (NOT black pants, NOT jeans). {SOC} blurred at the LEFT edge of the frame, her arms crossed.{NOC}{NO}",
     ["Rodrigo también es mi esposo, señora."], "tired, hurt, quiet")),
 ("c28", 8, talk("Socorro", f"Medium shot {DEP}, evening: {ROD} on the LEFT side of the frame and {SOC} on the RIGHT side of the frame stand face to face (Rodrigo always on the left, Socorro always on the right), both with empty hands; Rodrigo wears his black wristwatch on his left wrist; Socorro speaks, her arms crossed.{NOC}{NO}",
     ["Pues decide, Rodrigo.", "Tu madre o tu esposa."], "cold, firm, dramatic")),
 ("c29", 6, talk("Rodrigo", f"Close-up of {ROD} {DEP}, evening, doubtful, looking down, his hands empty, his plain pale yellow shirt without pockets; {SOC} blurred at the RIGHT edge of the frame, her arms crossed (Rodrigo on the left side of the frame, Socorro on the right).{NOC}{NO}",
     ["No me hagas escoger, mamá."], "doubtful, quiet, torn")),
 # 7. Cliffhanger: la suegra ya tiene el control de la casa
 ("c30", 8, talk("Socorro", f"Medium close-up of {SOC} {DEP}, evening, seated on the sofa, a triumphant smile, showing the small black garage remote in her right hand; {PAN} seated next to her at the right edge of the frame, laughing quietly, his hands on his belly.{CT('Socorro', 'right')}{NO}",
     ["Entonces nos quedamos todos aquí.", "Total… Rodrigo ya me dio el suyo."], "triumphant, sly, low")),
 # CTA final (tras negro)
 ("c31", 8, talk("Paloma", f"Close-up of {PAL} {DEP}, evening, alone, looking straight into the camera and talking to the viewer from the very first second, her lips moving clearly from the first frame; with warmth and charisma, while she speaks she tucks her hair behind her ear, tilts her head, nods, gives a small sad smile and gestures with one open hand.{NOC}{NO}",
     ["¿Ustedes creen que Rodrigo va a escoger a su mamá?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little intriguing, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("stands very close in front of", "stands in front of"), ("pointing", "gesturing"), ("steps closer to", "faces"),
        ("his voice rises", "serious"), ("her voice breaks", "quiet voice"), ("furious", "upset"), ("crying softly", "with teary eyes"),
        ("crying", "with teary eyes")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("disdainful", "serious"), ("arrogant", "proud"), ("mocking", "ironic"), ("condescending", "serious"), ("menacing", "calm"),
        ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "serious"), ("threatening", "serious"),
        ("tense", "serious"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shock", "surprise"), ("goes pale", "freezes"), ("dismissive", "serious"), ("irritated", "annoyed"), ("greedy", "pleased"),
        ("young", "adult"), ("teenager", "adult"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"),
        ("cold", "serious"), ("hurt", "sad"), ("pleading", "soft"), ("desperate", "worried"), ("bitter", "serious"),
        ("scheming", "smiling"), ("sly", "calm"), ("suspicious", "curious"), ("trembling", "still"), ("tears forming", "wet eyes"),
        ("breaking", "sad"), ("envious", "surprised"), ("demanding", "insistent"), ("loud", "firm"), ("defiant", "proud"),
        ("bossy", "serious"), ("theatrical", "expressive"), ("stubborn", "insistent"), ("offended", "serious"), ("upset", "serious"),
        ("¡", ""), ("!", "."), ("Eres una egoísta, Paloma.", "Eres muy difícil, Paloma."),
        ("Le pudo ir muy mal por tu culpa.", "La pusiste en un apuro."), ("No me voy sin ese control.", "Yo de aquí no me muevo."),
        ("Nos sacaron del departamento", "Nos quedamos sin departamento")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican family story, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{PALOMA}", "a 32-year-old Mexican woman"),
         ("@{RODRIGO}", "a 34-year-old Mexican man"),
         ("@{SOCORRO}", "a 60-year-old Mexican woman"),
         ("@{PANCHO}", "a 29-year-old Mexican man"),
         ("@{YADIRA}", "a 27-year-old Mexican woman"),
         ("@{IRENE}", "a 45-year-old Mexican woman"),
         (" @{PROP_CONTROL}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Over-the-shoulder medium shot", "Medium shot").replace("Extreme close-up", "Close-up").replace("Medium wide shot", "Medium shot")
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

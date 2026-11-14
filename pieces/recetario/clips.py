"""Genera los clips de recetario con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
ALA = ("in the modest warm kitchen @{LOC_ALACENA} of a humble Mexican house, beige tiled walls, a wooden table covered with small clear "
       "dessert cups, an old white fridge, a small TV on the counter, a wooden drawer cabinet, warm soft window light")
OFI = ("in a bright modern office @{LOC_OFICINA} with a large window over the city, a white desk with a tray of small dessert cups, "
       "cool white daylight")
CAF = ("in a quiet Mexican café @{LOC_CAFETERIA}, a dark wooden table with white coffee cups, brick wall, warm dim light")
# Ancla de identidad: primera mención de cada personaje en cada prompt (también el del borde: ropa completa con pantalón, calzado y accesorios)
MIR = ("@{MIREYA} (28-year-old Mexican mestiza woman, brown skin, long straight dark brown hair, small gold hoop earrings, "
       "sleeveless light lilac dress with a small white flower print and thin straps, white flat sandals)")
CHE = ("@{CHENCHO} (38-year-old Mexican mestizo man, brown skin, heavy build, short black gelled hair, short black beard and black moustache, "
       "pale mint green t-shirt with faint stains, blue jeans, black sneakers)")
HOR = ("@{HORTENSIA} (62-year-old Mexican mestiza woman, brown skin, dark grey hair pulled back in a bun, small gold earrings, thin gold chain, "
       "light blue floral housedress with short sleeves, beige flat sandals)")
SAM = ("@{SAMANTA} (42-year-old Mexican mestiza woman, brown skin, shoulder-length wavy brown hair, small pearl earrings, "
       "light grey pantsuit, white silk blouse, black heels)")
LEO = ("@{LEOPOLDO} (45-year-old Mexican mestizo man, brown skin, black hair slicked back, short trimmed black beard and black moustache, "
       "lavender pinstriped long-sleeve dress shirt, charcoal trousers, black belt, black shoes, silver wristwatch)")
NO = " No other people."
NOBADGE = " Nobody wears an ID badge or a lanyard."
def NB(who): return f" There is only ONE notebook in the scene, the worn brown leather notebook @{{PROP_RECETARIO}}, held only by {who} for the whole shot."
NONB = " There is no notebook in the shot."
def SCREEN(what): return (f" The screen shows {what} as a flat 2D image displayed INSIDE the screen rectangle; nothing comes out of the screen, "
                          "nobody from the screen appears in the room.")

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: la familia se come el pedido (Hortensia habla desde el frame 0, sin plano abierto)
 ("c01", 8, talk("Hortensia", f"Medium close-up of {HOR} {ALA}, seated at the table, laughing, handing a small dessert cup to {CHE}, who is seated at the right edge of the frame eating with a spoon. Hortensia speaks from the very first second.{NONB}{NO}{NOBADGE}",
     ["Agarren, que para eso los hizo.", "Están bien buenos, ¿verdad, Chencho?"], "cheerful, careless, laughing")),
 ("c02", 6, talk("Mireya", f"Close-up of {MIR} {ALA}, standing, her eyes wet, both hands raised in front of her, looking at the table; {HOR} blurred at the left edge of the frame.{NONB}{NO}{NOBADGE}",
     ["No, mamá… esos son de un pedido."], "upset, pleading, about to cry")),
 ("c03", 8, talk("Mireya", f"Medium close-up of {MIR} {ALA}, standing, looking around the counter, worried; {CHE} seated, blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Me levanté a las cuatro para hacerlos.", "¿Y mi batidora? No está en su lugar."], "tired, upset, worried")),
 ("c04", 8, talk("Chencho", f"Medium close-up of {CHE} {ALA}, seated, his arms crossed, unbothered, a spoon in a dessert cup in front of him; {MIR} standing, blurred at the LEFT edge of the frame. He says each sentence only once, without repeating any words.{NONB}{NO}{NOBADGE}",
     ["La vendí. Mi mamá necesitaba unos zapatos.", "Ni la usabas tanto."], "smug, careless, calm")),
 ("c05", 8, talk("Mireya", f"Close-up of {MIR} {ALA}, standing, tears in her eyes, her hands trembling; {CHE} blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Con esa batidora hago todo, Chencho.", "Sin la batidora no entrego nada."], "hurt, desperate, crying softly")),
 ("c06", 8, talk("Hortensia", f"Medium close-up of {HOR} {ALA}, seated at the table, rolling her eyes, waving one hand; {MIR} standing, blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Ay, ya, no exageres.", "Son puros vasitos, eso cualquiera lo hace."], "dismissive, mocking")),
 ("c07", 8, talk("Mireya", f"Close-up of {MIR} {ALA}, standing, her eyes wet, her voice quiet; {HOR} blurred at the left edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Ustedes nunca me han valorado.", "Todo lo que gano se va en esta casa."], "hurt, quiet, teary")),
 ("c08", 8, talk("Chencho", f"Medium shot {ALA}: {CHE} seated, eating from a dessert cup, half smiling; {HOR} seated next to him, laughing.{NONB}{NO}{NOBADGE}",
     ["Pues para eso eres de la familia.", "Aquí todos ponemos algo."], "ironic, careless")),
 ("c09", 8, talk("Mireya", f"Close-up of {MIR} {ALA}, standing, wiping a tear, her face now firm and decided; {CHE} blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Ya me cansé de ser la sirvienta de todos.", "Me voy de esta casa."], "firm, quiet, decided")),
 ("c10", 8, talk("Hortensia", f"Close-up of {HOR} {ALA}, seated, her arms crossed, a mocking half smile; {MIR} blurred at the left edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Ándale, vete.", "A ver cuánto duras sin nosotros."], "mocking, cold")),
 ("c11", 6, talk("Mireya", f"Medium shot {ALA}: {MIR} alone, putting baking molds into a cardboard box on the counter, sad, in a hurry; behind her a wooden drawer is half open with the worn brown leather notebook @{{PROP_RECETARIO}} inside it; she does not see it and does not touch it. There is only ONE notebook.{NO}{NOBADGE}",
     ["Mis moldes y mis cosas, nada más."], "sad, quiet, in a hurry")),
 # 2. El éxito (cama cálida)
 ("c12", 8, talk("Samanta", f"Medium close-up of {SAM} {OFI}, seated behind the white desk, holding a small dessert cup and a spoon, smiling, impressed; {MIR} seated, blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Mireya, probé tus postres en la feria.", "Quiero ponerlos en todas mis tiendas."], "warm, professional, impressed")),
 ("c13", 8, talk("Mireya", f"Close-up of {MIR} {OFI}, seated, surprised, her eyes wet with emotion, a hand on her chest; {SAM} blurred at the left edge of the frame.{NONB}{NO}{NOBADGE}",
     ["¿En serio, licenciada?", "Yo los hacía en la cocina de mi mamá."], "surprised, moved, hopeful")),
 ("c14", 8, talk("Samanta", f"Close-up of {SAM} {OFI}, seated, smiling warmly, gesturing with one open hand; {MIR} blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Pues ahora vas a tener tu propia cocina.", "Y tu nombre en cada empaque."], "warm, confident")),
 ("c15", 6, talk("Mireya", f"Close-up of {MIR} {OFI}, seated, smiling through happy tears; {SAM} blurred at the left edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Esto es lo que siempre soñé."], "moved, happy, quiet")),
 # 3. La familia la ve en la tele y encuentra la libreta
 ("c16", 8, talk("Chencho", f"Over-the-shoulder medium shot {ALA}: {CHE} seated at the table looking at the small TV on the counter, surprised, half turned toward {HOR}, who is blurred at the left edge of the frame." + SCREEN("Mireya smiling in a bright office, a small flat 2D news image") + f"{NONB}{NO}{NOBADGE}",
     ["Mira nomás, mamá… Mireya salió en la tele.", "Dicen que sus postres ya están en todas partes."], "surprised, envious")),
 ("c17", 8, talk("Hortensia", f"Close-up of {HOR} {ALA}, seated, frowning, offended, looking toward the TV; {CHE} blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["¿Y a nosotros? Ni una visita.", "Malagradecida."], "offended, bitter")),
 ("c18", 8, talk("Hortensia", f"Medium close-up of {HOR} {ALA}, standing at the wooden drawer cabinet, slowly taking the worn brown leather notebook out of the open drawer, curious; {CHE} blurred at the right edge of the frame.{NB('Hortensia')}{NO}{NOBADGE}",
     ["¿Y esto qué es?", "Es su libreta… la olvidó aquí."], "curious, then sly")),
 ("c19", 8, talk("Chencho", f"Medium close-up of {CHE} {ALA}, standing, holding the open worn brown leather notebook in BOTH hands in front of his chest and turning its pages, his eyes wide, a greedy smile; {HOR} standing, blurred at the LEFT edge of the frame, her hands empty.{NB('Chencho')}{NO}{NOBADGE}",
     ["Son todas sus recetas, mamá.", "Las de los vasitos que la hicieron famosa."], "excited, greedy, low voice")),
 ("c20", 6, talk("Hortensia", f"Close-up of {HOR} {ALA}, standing, a little worried, glancing at the notebook in the hands of {CHE}, who is blurred at the right edge of the frame.{NB('Chencho')}{NO}{NOBADGE}",
     ["¿Y si Mireya se entera?"], "worried, whispering")),
 ("c21", 8, talk("Chencho", f"Close-up of {CHE} {ALA}, standing, holding the worn brown leather notebook against his chest, smiling slyly; {HOR} blurred at the left edge of the frame.{NB('Chencho')}{NO}{NOBADGE}",
     ["Ni se acuerda que existe.", "Algo nos tenía que tocar, ¿no?"], "sly, confident")),
 ("c22", 8, talk("Chencho", f"Medium shot {ALA}: {HOR} stands on the LEFT side of the frame and {CHE} stands on the RIGHT side (same sides as the previous shot), side by side, Chencho tapping the cover of the worn brown leather notebook, both smiling with complicity.{NB('Chencho')}{NO}{NOBADGE}",
     ["Se las ofrecemos a la competencia.", "Que otros las hagan… y nosotros cobramos."], "scheming, amused")),
 # 4. Venta al rival
 ("c23", 8, talk("Leopoldo", f"Medium close-up of {LEO} {CAF}, seated, holding the open worn brown leather notebook in BOTH hands over the table and turning its pages, suspicious; {CHE} seated, blurred at the RIGHT edge of the frame, his hands empty. The café is closed and empty: no customers at the other tables, nobody in the background.{NB('Leopoldo')}{NO}{NOBADGE}",
     ["¿Cómo consiguieron estas recetas?", "¿Mireya sabe que están aquí?"], "suspicious, calm")),
 ("c24", 8, talk("Chencho", f"Close-up of {CHE} {CAF}, seated, leaning forward, confident; {LEO} seated at the LEFT edge of the frame in three-quarter view, blurred, always the same man as in his reference: black hair slicked back, short trimmed black beard and black moustache clearly visible, lavender pinstriped shirt; {HOR} seated next to Chencho on his left side (right side of the frame), nodding. The café is closed and empty: no customers at the other tables, nobody in the background.{NONB}{NO}{NOBADGE}",
     ["Son de mi familia, don Leopoldo.", "En la cocina de mi mamá aprendió todo."], "confident, persuasive")),
 ("c25", 8, talk("Leopoldo", f"Close-up of {LEO} {CAF}, seated, tasting one small dessert cup with a spoon, raising his eyebrows, then smiling; {CHE} blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Sabe igualito al de Mireya.", "Me quedo con todas. Trato hecho."], "impressed, satisfied")),
 ("c26", 6, talk("Hortensia", f"Close-up of {HOR} {CAF}, seated, smiling widely, delighted; {CHE} blurred at the left edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Ahora sí, Mireya nos va a mantener."], "delighted, smug")),
 # 5. Cliffhanger
 ("c27", 8, talk("Mireya", f"Medium close-up of {MIR} {OFI}, standing, happy and excited, holding a small dessert cup; {SAM} blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Licenciada, mañana presento mi receta nueva.", "Nadie más la conoce."], "happy, proud, excited")),
 ("c28", 8, talk("Samanta", f"Over-the-shoulder close-up {OFI}: {SAM} standing, worried, holding a black smartphone toward {MIR}, who is at the left edge of the frame; only Samanta holds a phone." + SCREEN("a man in a lavender shirt presenting a dessert cup, a small flat 2D video") + f"{NONB}{NO}{NOBADGE}",
     ["Mireya… mira esto.", "Don Leopoldo acaba de anunciar tu misma receta."], "worried, serious, low")),
 ("c29", 6, talk("Mireya", f"Extreme close-up of {MIR} {OFI}, her eyes wide, tears forming, in shock; {SAM} blurred at the right edge of the frame.{NONB}{NO}{NOBADGE}",
     ["Esa receta estaba en mi libreta…", "¿Quién se la dio?"], "shocked, breaking, quiet")),
 ("c30", 6, talk("Chencho", f"Medium shot {ALA}: {CHE} seated at the table with the worn brown leather notebook open in his hands, smiling; {HOR} seated next to him, laughing quietly.{NB('Chencho')}{NO}{NOBADGE}",
     ["Pobrecita.", "Y todavía no sabe lo que le espera."], "sly, amused, low")),
 # CTA final (tras negro)
 ("c31", 8, talk("Mireya", f"Close-up of {MIR} {OFI}, alone, looking straight into the camera and talking to the viewer from the very first second, her lips moving clearly from the first frame; with warmth and charisma, while she speaks she tucks her hair behind her ear, tilts her head, nods, gives a small sad smile and gestures with one open hand.{NONB}{NO}{NOBADGE}",
     ["¿Ustedes creen que fue mi propia familia?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little intriguing, talking directly to the viewer")),
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
        ("breaking", "sad"), ("envious", "surprised"),
        ("¡", ""), ("!", "."), ("Malagradecida.", "Qué ingrata."), ("nosotros cobramos", "nos va bien"),
        ("sirvienta", "ayudante"), ("competencia", "otra marca")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican family story, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{MIREYA}", "a 28-year-old Mexican woman"),
         ("@{CHENCHO}", "a 38-year-old Mexican man"),
         ("@{HORTENSIA}", "a 62-year-old Mexican woman"),
         ("@{SAMANTA}", "a 42-year-old Mexican woman"),
         ("@{LEOPOLDO}", "a 45-year-old Mexican man"),
         (" @{PROP_RECETARIO}", "")]
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

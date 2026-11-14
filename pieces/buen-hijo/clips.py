"""Genera los clips de buen-hijo con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
SAL = ("in the elegant living room @{LOC_SALON} of a wealthy Mexican house, beige sofas, a dark wood coffee table, floor lamps, "
       "a dark wood staircase at the back, warm golden-hour window light")
AVE = ("on a quiet tree-lined avenue @{LOC_AVENIDA} of a Mexican city at sunset, a zebra crosswalk, parked cars along the curb, warm golden light")
PCH = ("at the corner of the avenue @{LOC_AVENIDA}, in front of a small peach-colored house with a dark green wooden door, warm sunset light")
NOC = ("on an empty city sidewalk @{LOC_PERSIANA} at night, a closed dark blue metal shop shutter behind, warm streetlamp light, "
       "flattened cardboard boxes on the ground")
ZAG = ("at the open wooden front door of a small green-painted Mexican house @{LOC_ZAGUAN}, potted plants, soft morning light")
FOG = ("in the warm bright kitchen @{LOC_FOGON} of a modest Mexican house, a wooden table with a woven placemat, clay pots on the wall, "
       "soft morning window light")
# Ancla de identidad: primera mención de cada personaje en cada prompt (también el del borde: ropa completa con pantalón, calzado y accesorios)
ABU = ("@{ABUNDIO} (62-year-old Mexican mestizo man, brown skin, grey hair combed back, thick grey moustache, no beard, "
       "light beige long-sleeve dress shirt, dark brown trousers, brown leather belt, brown leather shoes)")
TAD = ("@{TADEO} (27-year-old Mexican mestizo man, brown skin, short curly black hair, clean-shaven, no moustache, no beard, "
       "sage green long-sleeve button shirt, light grey chinos, white sneakers)")
ROM = ("@{ROMAN} (32-year-old Mexican mestizo man, brown skin, black hair combed back, clean-shaven, no moustache, no beard, "
       "navy blue long-sleeve shirt, black trousers, silver wristwatch, black shoes)")
PET = ("@{PETRA} (80-year-old Mexican mestiza woman, brown skin, grey hair in a bun, pale pink embroidered blouse, long brown skirt, "
       "grey rebozo shawl over her shoulders, black flat shoes, a small white plastic bag in her left hand)")
AUR = ("@{AURELIA} (70-year-old Mexican mestiza woman, brown skin, grey hair in a low bun, white blouse, turquoise apron, "
       "dark brown skirt, brown flat shoes)")
NO = " No other people."
NOBADGE = " Nobody wears an ID badge or a lanyard."
BAG = " Only Petra carries the small white plastic bag, always in her left hand, the same bag for the whole shot."
CASE = " Only Tadeo has the black rolling suitcase, the same suitcase for the whole shot."

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Teaser en paralelo: el padre habla desde el frame 0 / Tadeo ayuda a doña Petra
 ("c01", 8, talk("Abundio", f"Medium close-up of {ABU} {SAL}, seated on a beige sofa, frowning, cold; {ROM} seated at the right edge of the frame, blurred. Abundio speaks from the very first second.{NO}{NOBADGE}",
     ["Tu hermano no sirve para nada, Román.", "Todo lo de la fábrica va a ser para ti."], "cold, firm, disappointed")),
 ("c02", 6, talk("Abundio", f"Close-up of {ABU} {SAL}, seated, his face hard, looking off to the side at {ROM}, who is blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Y hoy mismo se va de esta casa."], "cold, firm, quiet")),
 ("c03", 8, talk("Tadeo", f"Medium shot {AVE}: {TAD} walks slowly across the zebra crosswalk arm in arm with {PET}, patient and kind, looking at her.{BAG}{NO}{NOBADGE}",
     ["Tómeme del brazo, doñita.", "Yo la cruzo, no tenga miedo."], "kind, warm, patient")),
 ("c04", 8, talk("Román", f"Close-up of {ROM} {SAL}, seated on a beige sofa, a confident half smile; {ABU} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Me parece bien, papá.", "Yo sí vengo diario a la fábrica… él nomás anda de buen samaritano."], "smug, calm, ironic")),
 ("c05", 8, talk("Abundio", f"Medium shot {SAL}: {ABU} stands up from the beige sofa, serious; {ROM} seated, blurred in the foreground.{NO}{NOBADGE}",
     ["Cuando regrese, que me dé cuentas.", "Y si trae otro cuento, se va esta misma noche."], "firm, cold")),
 ("c06", 8, talk("Petra", f"Close-up of {PET} {AVE}, on the sidewalk, facing the camera, grateful, her eyes soft; {TAD} stands at her right side, blurred at the LEFT edge of the frame, her right arm hooked in his arm, the same sides as when they crossed the street. Her LEFT hand (on the right side of the frame) holds the small white plastic bag for the whole shot; her right hand never holds the bag.{BAG}{NO}{NOBADGE}",
     ["Dios te lo pague, muchacho.", "Salí por mis medicinas y ya no supe cómo regresar."], "grateful, a fragile old voice")),
 ("c07", 8, talk("Tadeo", f"Medium shot {PCH}: {TAD} stands next to {PET} at the green door, smiling gently at her.{BAG}{NO}{NOBADGE}",
     ["Aquí está su casa, doña Petra.", "Ya me voy, que mi papá me está esperando."], "kind, warm, a little hurried")),
 # 2. Reproche en el salón
 ("c08", 8, talk("Abundio", f"Medium close-up of {ABU} {SAL}, standing, turning toward the entrance, serious; {TAD} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["¿Qué horas son estas, Tadeo?", "El proveedor te esperó una hora en la fábrica."], "cold, upset, controlled")),
 ("c09", 8, talk("Tadeo", f"Close-up of {TAD} {SAL}, standing, worried, his hands open; {ABU} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Perdón, papá.", "Una señora no podía cruzar la avenida y la acompañé a su casa."], "apologetic, sincere")),
 ("c10", 8, talk("Abundio", f"Close-up of {ABU} {SAL}, his eyebrows raised in disbelief, looking at {TAD}, who is blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["¿Y por una desconocida plantaste al proveedor?", "Siempre tienes un pretexto."], "cold, disdainful")),
 ("c11", 8, talk("Tadeo", f"Medium close-up of {TAD} {SAL}, standing, earnest, one hand on his chest; {ABU} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Voy ahorita a la fábrica, papá.", "Todavía puedo revisar los pedidos."], "earnest, eager to fix it")),
 ("c12", 8, talk("Abundio", f"Close-up of {ABU} {SAL}, serious, shaking his head slowly; {ROM} standing behind him, blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Tu hermano sí sabe lo que es el compromiso.", "Tú nomás quieres quedar bien con todos."], "cold, disappointed")),
 ("c13", 8, talk("Tadeo", f"Close-up of {TAD} {SAL}, pleading softly, his eyes wet; {ABU} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["Mañana me quedo más tarde, si quieres.", "Nada más déjame arreglarlo."], "soft, pleading")),
 ("c14", 8, talk("Abundio", f"Medium close-up of {ABU} {SAL}, standing, his arms crossed, firm; {TAD} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Ya me cansé de tus buenas obras.", "Agarra tus cosas y te vas hoy mismo."], "cold, final")),
 ("c15", 8, talk("Tadeo", f"Close-up of {TAD} {SAL}, hurt, his voice quiet, his eyes wet; {ABU} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["¿Me estás corriendo por esto, papá?", "Siempre he hecho todo para que estés orgulloso de mí."], "hurt, quiet, with teary eyes")),
 ("c16", 8, talk("Román", f"Medium close-up of {ROM} {SAL}, standing next to the staircase with his arms crossed, ironic; {TAD} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Ya no hagas drama, Tadeo.", "Mi papá ya decidió."], "ironic, cold")),
 ("c17", 10, talk("Tadeo", f"Close-up of {TAD} {SAL}, turning toward {ROM}, who is blurred at the right edge of the frame, hurt and surprised.{NO}{NOBADGE}",
     ["Román, tú sabes que anoche terminé tu inventario.", "Díselo… dile que yo sí cumplo."], "hurt, sincere, pleading")),
 ("c18", 8, talk("Román", f"Close-up of {ROM} {SAL}, holding a closed black folder against his chest; only Román holds the black folder, the same folder for the whole shot; {TAD} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Yo nunca te pedí ayuda.", "No me lo eches en cara enfrente de mi papá."], "cold, dismissive")),
 ("c19", 8, talk("Abundio", f"Medium shot {SAL}: {ABU} stands next to {ROM}, one hand resting on Román's shoulder, both serious, looking at {TAD}, who is blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Román se va a quedar con la fábrica y con todo.", "Necesito a alguien responsable."], "cold, solemn")),
 ("c20", 10, talk("Tadeo", f"Close-up of {TAD} {SAL}, his eyes wet, confused, his open palms turned up; {ABU} blurred at the right edge of the frame.{NO}{NOBADGE}",
     ["No te estoy pidiendo nada, papá.", "Nomás quiero entender… ¿por una hora de retraso ya no quieres verme?"], "hurt, quiet, emotional")),
 ("c21", 6, talk("Abundio", f"Close-up of {ABU} {SAL}, his face hard, looking away from {TAD}, who is blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Mi decisión está tomada."], "cold, final, quiet")),
 # 3. Expulsión
 ("c22", 8, talk("Tadeo", f"Medium shot {SAL}: {TAD} calmly places a small ring of house keys on the dark wood coffee table, a black rolling suitcase standing next to him; only Tadeo holds the keys.{CASE}{NO}{NOBADGE}",
     ["Ahí está todo lo de la casa.", "Nada más me voy con mi ropa."], "quiet, dignified, sad")),
 ("c23", 10, talk("Abundio", f"Medium shot {SAL}: {ABU} stands next to {ROM} near the staircase, both serious, looking toward the front door.{NO}{NOBADGE}",
     ["Déjalo ir, Román.", "Si tanto le importa la gente de la avenida, que alguien de ahí lo reciba."], "cold, contemptuous")),
 ("c24", 10, talk("Tadeo", f"Medium close-up of {TAD} {SAL}, standing at the open front door holding the handle of a black rolling suitcase, looking back, sad but proud; {ABU} blurred at the right edge of the frame.{CASE}{NO}{NOBADGE}",
     ["No te voy a molestar más, papá.", "Pero esa señora necesitaba ayuda… y lo volvería a hacer."], "sad, dignified, firm")),
 # 4. Soledad de noche
 ("c25", 10, talk("Tadeo", f"Medium shot {NOC}: {TAD} sits alone on the flattened cardboard against the metal shutter, the black rolling suitcase next to him, tired and sad.{CASE}{NO}{NOBADGE}",
     ["¿Y ahora dónde voy a pasar la noche?", "Siempre pensé que si hacía todo bien… algún día iba a quererme."], "quiet, sad, talking to himself")),
 ("c26", 8, talk("Tadeo", f"Over-the-shoulder close-up {NOC}: {TAD} sits on the cardboard looking down at a black smartphone in his hand; the phone screen shows a flat 2D contact list displayed INSIDE the screen rectangle, nothing comes out of the screen; only Tadeo holds a phone.{NO}{NOBADGE}",
     ["La nana Aurelia siempre me dijo que la buscara si necesitaba algo.", "Mañana temprano voy a verla."], "quiet, a little hopeful, talking to himself")),
 # 5. Casa de la nana y cliffhanger (cama cálida)
 ("c27", 8, talk("Tadeo", f"Medium shot {ZAG}: {TAD} stands at the doorway holding the handle of the black rolling suitcase, tired, facing {AUR}, who stands inside the doorway, blurred at the right edge of the frame.{CASE}{NO}{NOBADGE}",
     ["Nana, perdón por venir así.", "Mi papá me corrió anoche."], "tired, sad, quiet")),
 ("c28", 8, talk("Aurelia", f"Close-up of {AUR} {ZAG}, standing in the doorway, worried and tender, reaching one hand toward {TAD}, who is blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Ay, mi niño, pásale.", "Aquí tienes casa el tiempo que quieras."], "tender, warm, worried")),
 ("c29", 8, talk("Tadeo", f"Medium shot {FOG}: {TAD} sits at the wooden table, sad, while {AUR} pours coffee into the single white cup in front of him; only Aurelia holds the coffee pot. There is only ONE clay coffee pot in the whole kitchen, the one in Aurelia's hand: no other clay pot, jug or jar on the table, the table holds only the woven placemat and the one white cup.{NO}{NOBADGE}",
     ["Tú me criaste, nana.", "¿Siempre le he dado vergüenza a mi papá?"], "sad, quiet, emotional")),
 ("c30", 8, talk("Aurelia", f"Close-up of {AUR} {FOG}, standing, serious, holding a white coffee cup with both hands; {TAD} seated, blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Escúchame bien, Tadeo.", "Yo sé por qué tu papá te trata así."], "serious, low, grave")),
 ("c31", 6, talk("Aurelia", f"Extreme close-up of {AUR} {FOG}, her eyes serious, lowering her voice; {TAD} blurred at the left edge of the frame.{NO}{NOBADGE}",
     ["Y por muchos años me hizo guardar silencio."], "low, grave, secretive")),
 # CTA final (tras negro)
 ("c32", 8, talk("Tadeo", f"Close-up of {TAD} {FOG}, alone, looking straight into the camera and talking to the viewer from the very first second, his lips moving clearly from the first frame; with warmth and charisma, while he speaks he nods, tilts his head, gives a small smile and gestures with one open hand.{NO}{NOBADGE}",
     ["¿Qué secreto creen que guarda la nana Aurelia?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little intriguing, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("stands very close in front of", "stands in front of"), ("pointing", "gesturing"), ("steps closer to", "faces"),
        ("his voice rises", "serious"), ("his voice breaks", "quiet voice"), ("furious", "upset"), ("crying", "with teary eyes")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("disdainful", "serious"), ("disdain", "seriousness"), ("arrogant", "proud"), ("mocking", "ironic"), ("condescending", "serious"),
        ("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "serious"), ("threatening", "serious"),
        ("tense", "serious"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shock", "surprise"), ("goes pale", "freezes"), ("commanding", "firm"), ("dismissive", "serious"), ("irritated", "annoyed"),
        ("young", "adult"), ("teenager", "adult"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"),
        ("contemptuous", "serious"), ("cold", "serious"), ("hard", "serious"), ("hurt", "sad"), ("pleading", "soft"),
        ("flattened cardboard boxes", "a folded blanket"), ("flattened cardboard", "a folded blanket"), ("the cardboard", "a folded blanket"),
        ("¡", ""), ("!", "."), ("no sirve para nada", "no pone atención"), ("corriendo", "sacando"), ("corrió", "sacó"),
        ("eches en cara", "reclames")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican family home, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{ABUNDIO}", "a 62-year-old Mexican man"),
         ("@{TADEO}", "a 27-year-old Mexican man"),
         ("@{ROMAN}", "a 32-year-old Mexican man"),
         ("@{PETRA}", "an 80-year-old Mexican woman"),
         ("@{AURELIA}", "a 70-year-old Mexican woman")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Extreme close-up", "Close-up").replace("Medium wide shot", "Medium shot")
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

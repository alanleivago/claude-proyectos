"""Genera los clips de camionetas con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
VIT = "in the bright luxury car showroom @{LOC_VITRINA}, white marble floor, tall glass walls, three new white SUVs with no logos, soft cool daylight"
EXH = "in the second car showroom @{LOC_EXHIBIDOR}, grey polished floor, a light wood sales desk with car brochures, a new silver SUV with no logos, large windows, cool daylight"
AGE = "in the third car showroom @{LOC_AGENCIA}, warm beige floor, wooden accent wall with green plants, new dark blue SUVs with no logos, warm soft daylight"
JAR = "on the sidewalk @{LOC_JARDINERA} outside a glass car showroom, a long concrete planter bench with green bushes, parked cars, soft grey daylight"
# Ancla de identidad: primera mención de cada personaje en cada prompt
AMP = "@{AMPARO} (62-year-old Mexican indigenous woman, long grey-black braid, dark brown felt hat with a narrow black band, deep blue fringed rebozo shawl, white cotton blouse with red and yellow embroidered flowers, red woven sash, long black skirt, thin gold necklaces, a brown woven palm-leaf bag)"
PAM = "@{PAMELA} (30-year-old woman, long wavy light brown hair, fitted solid red skirt suit, white blouse, black high heels, small gold name badge)"
GON = "@{GONZALO} (36, short dark brown hair combed back, completely clean-shaven with no moustache and no beard, navy blue suit, white shirt, solid dark green tie, silver wristwatch, white ID card on a black lanyard)"
ITZ = "@{ITZELMORENA} (27-year-old Mexican mestiza woman, warm brown morena skin, dark brown eyes, the exact face of her reference sheet, long straight black hair worn loose, light beige trouser suit, white shirt, small silver name badge, black flat shoes)"
NO = " No other people."

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: primera agencia, Amparo habla desde el frame 0 y Pamela la desprecia
 ("c01", 10, talk("Amparo", f"Close-up of {AMP} {VIT}, polite and calm, gesturing with an open hand toward the white SUVs; {PAM} blurred at the right edge of the frame.{NO}",
     ["Señorita, buenas tardes.", "Me interesan esas tres camionetas blancas de la entrada.", "¿Me ayuda con ellas?"], "polite, calm, serene")),
 ("c02", 10, talk("Pamela", f"Medium close-up of {PAM} {VIT}, raising one eyebrow with disdain, looking down at {AMP}, who is seen from behind and blurred at the left edge of the frame (only her brown felt hat, grey-black braid and deep blue fringed rebozo visible; she wears the deep blue rebozo, never a brown shawl). Only these two characters appear.{NO}",
     ["¿Las tres? Ay, señora, no me haga perder el tiempo.", "Mírese nomás cómo viene.", "Aquí vendemos lujo, no artesanías."], "mocking, disdainful, arrogant")),
 ("c03", 8, talk("Amparo", f"Close-up of {AMP} {VIT}, serene and firm, holding her palm-leaf bag; {PAM} blurred at the right edge of the frame.{NO}",
     ["No vine a vender nada, señorita. Vine a comprar.", "¿Cuánto cuesta cada una?"], "calm, firm, dignified")),
 ("c04", 10, talk("Pamela", f"Medium shot {VIT}: {PAM} stands next to a white SUV, arms crossed, facing {AMP}, who is seen from behind and blurred in the foreground (only her brown felt hat and deep blue rebozo visible).{NO}",
     ["¿De veras no entiende?", "Aunque vendiera todo lo que trae encima, no le alcanza ni para las llantas.", "Mejor váyase antes de que la saquen."], "cold, condescending, mocking")),
 ("c05", 8, talk("Amparo", f"Medium shot of {AMP} {VIT}, standing next to a white SUV, one hand near the door handle, calm; {PAM} blurred in the background.{NO}",
     ["Nomás quiero ver por dentro esa camioneta.", "Antes de decidir, quiero ver si me conviene."], "calm, patient")),
 ("c06", 8, talk("Pamela", f"Over-the-shoulder close-up {VIT}: {PAM} faces the camera, annoyed; {AMP} seen from behind and blurred in the foreground (only her brown felt hat and deep blue rebozo visible).{NO}",
     ["Ni se le ocurra tocarla.", "Esa camioneta vale más que su casa y todo su pueblo juntos."], "cold, arrogant, irritated")),
 ("c07", 8, talk("Amparo", f"Close-up of {AMP} {VIT}, looking down for a moment and then up again, calm; {PAM} blurred at the right edge of the frame.{NO}",
     ["Pensaba llevarme las tres hoy mismo, de contado.", "Dígame el precio, por favor."], "quiet, calm, firm")),
 ("c08", 8, talk("Pamela", f"Medium close-up of {PAM} {VIT}, a mocking laugh, glancing down at the bag of {AMP}, who is blurred at the left edge of the frame holding her bag still and low; the bag is the same small brown woven palm-leaf basket with two handles as in her reference sheet from the first to the last frame, it never changes. Only these two characters appear.{NO}",
     ["¿De contado? Con esa bolsita no se compra ni un espejo.", "Ya deje de hacer el ridículo."], "mocking, arrogant, amused")),
 ("c09", 8, talk("Amparo", f"Close-up of {AMP} {VIT}, chin up, serious and dignified; {PAM} blurred at the right edge of the frame.{NO}",
     ["Entonces dígame su nombre.", "Quiero acordarme de quién me sacó sin escucharme."], "calm, serious, dignified")),
 ("c10", 8, talk("Pamela", f"Close-up of {PAM} {VIT}, tapping her small gold name badge with one finger, a cold smile; {AMP} blurred at the left edge of the frame.{NO}",
     ["Ahí dice, en el gafete. Pamela.", "Quéjese con quien quiera. Tengo clientes de verdad esperando."], "cold, dismissive, proud")),
 # 2. Puente: sale de la agencia y llama por teléfono
 ("r1", 6, f"Medium shot from behind {VIT}: {AMP} walks slowly toward the glass doors and out to the street, holding her palm-leaf bag. Only this character appears in the whole shot.{NO} Slow push-in. No dialogue."),
 ("c11", 10, talk("Amparo", f"Medium close-up of {AMP} {JAR}, seated alone on the planter bench, holding a black smartphone at her ear, serious and calm.{NO}",
     ["Ya salí de la primera agencia. Ya vi suficiente.", "Ni me preguntó qué buscaba. Nomás me vio la ropa.", "Ahora voy a la segunda. Quiero saber si es una persona… o es toda la empresa."], "low, calm, serious, determined")),
 # 3. Segunda agencia: Gonzalo, el gerente de ventas
 ("c12", 8, talk("Amparo", f"Medium shot {EXH}: {AMP} stands next to the silver SUV and speaks to {GON}, who stands by the sales desk.{NO}",
     ["Buenas tardes.", "¿Cuál es la camioneta más fina que tienen? ¿Cuál me recomienda?"], "polite, calm")),
 ("c13", 10, talk("Gonzalo", f"Medium close-up of {GON} {EXH}, a condescending smile, gesturing with an open hand toward the back of the showroom; {AMP} blurred at the left edge of the frame.{NO}",
     ["¿Usted, doñita?", "Aquí manejamos otro nivel de vehículos.", "Los seminuevos están allá atrás. A lo mejor ahí encuentra algo a su alcance."], "condescending, smug, mocking")),
 ("c14", 8, talk("Amparo", f"Close-up of {AMP} {EXH}, calm and firm; {GON} blurred at the right edge of the frame.{NO}",
     ["No le pregunté qué me alcanza.", "Le pregunté cuál es la mejor. Quiero verla por dentro."], "calm, firm")),
 ("c15", 8, talk("Gonzalo", f"Medium shot of {GON} {EXH}, leaning on the silver SUV and laughing, looking at {AMP}, who is blurred at the left edge of the frame.{NO}",
     ["¿La mejor? Ni la toque, doñita.", "Cuesta más de lo que usted va a ganar en toda su vida."], "mocking, arrogant, amused")),
 ("c16", 8, talk("Amparo", f"Close-up of {AMP} {EXH}, raising one open hand calmly; {GON} blurred at the right edge of the frame.{NO}",
     ["Entonces cotíceme tres iguales.", "Quiero saber el precio y cuándo me las entregan."], "calm, serene, firm")),
 ("c17", 10, talk("Gonzalo", f"Medium shot of {GON} {EXH}, standing at the sales desk with a car brochure in his hands, laughing; {AMP} blurred at the left edge of the frame.{NO}",
     ["¿Tres? Usted no se lleva ni los tapetes.", "No pierdo mi tiempo cotizando sueños."], "mocking, condescending")),
 ("c18", 6, talk("Amparo", f"Close-up of {AMP} {EXH}, serious, holding her palm-leaf bag with both hands; {GON} blurred at the right edge of the frame.{NO}",
     ["Entonces llame a alguien que sí quiera venderme las tres."], "calm, firm")),
 ("c19", 10, talk("Gonzalo", f"Over-the-shoulder close-up {EXH}: {GON} faces the camera, proud; {AMP} seen from behind and blurred in the foreground (only her brown felt hat and deep blue rebozo visible).{NO}",
     ["No insista. Soy el gerente de ventas.", "Aquí yo decido a quién se atiende.", "Y si yo digo que no, nadie la atiende."], "proud, cold, arrogant")),
 ("c20", 10, talk("Amparo", f"Close-up of {AMP} {EXH}, looking straight at {GON}, who is blurred at the right edge of the frame, serene and challenging.{NO}",
     ["¿Y si pudiera pagarlas hoy mismo?", "¿Seguiría diciendo que no merezco que me atiendan?"], "calm, slow, challenging")),
 ("c21", 10, talk("Gonzalo", f"Medium close-up of {GON} {EXH}, one hand on his chest, smiling with arrogance; {AMP} blurred at the left edge of the frame.{NO}",
     ["Mire, si usted se lleva esas tres hoy…", "renuncio aquí mismo, delante de todos.", "Pero ya deje de soñar, doñita."], "arrogant, amused, confident")),
 ("c22", 8, talk("Amparo", f"Close-up of {AMP} {EXH}, a calm knowing smile, holding her palm-leaf bag; {GON} blurred at the right edge of the frame.{NO}",
     ["Perfecto. No se le olvide lo que acaba de prometer.", "Delante de todos."], "calm, knowing, slow")),
 ("c23", 8, talk("Gonzalo", f"Medium shot {EXH}: {GON} stands by the sales desk, smiling with irony, watching {AMP} walk away toward the glass doors, seen from behind.{NO}",
     ["Ándele, váyase tranquila.", "Cuando regrese por sus camionetas, yo mismo le abro la puerta."], "mocking, ironic, amused")),
 # 4. Tercera agencia: Itzel la atiende con respeto (cama cálida)
 ("c24", 8, talk("Amparo", f"Medium shot {AGE}: {AMP} stands next to a dark blue SUV and speaks to {ITZ}, who walks up to her smiling.{NO}",
     ["Buenas tardes, señorita.", "Quisiera ver tres camionetas. ¿Cuál me recomienda?"], "polite, calm")),
 ("c25", 10, talk("Itzel", f"Medium close-up of {ITZ} {AGE}, smiling warmly, gesturing with an open hand toward a dark blue SUV; {AMP} blurred at the left edge of the frame.{NO}",
     ["Claro que sí, señora. Con mucho gusto.", "Véalas con calma, no hay prisa.", "Empecemos por esta y luego vemos las otras."], "warm, kind, friendly")),
 ("c26", 8, talk("Amparo", f"Medium shot of {AMP} {AGE}, one hand on the open door of a dark blue SUV; {ITZ} blurred at the right edge of the frame.{NO}",
     ["En otra agencia me dijeron que ni la tocara.", "¿Aquí también?"], "quiet, curious, a little sad")),
 ("c27", 10, talk("Itzel", f"Medium close-up of {ITZ} {AGE}, next to the open door of a dark blue SUV, offering a car key with an open hand to {AMP}, who is blurred at the left edge of the frame.{NO}",
     ["No, señora, para nada.", "Súbase si gusta, conózcala por dentro", "y pregúnteme todo lo que quiera."], "warm, kind, sincere")),
 ("c28", 6, talk("Amparo", f"Close-up of {AMP} {AGE}, holding a car key, a soft curious look; {ITZ} seen from behind and blurred at the right edge of the frame (only her long loose black hair and beige jacket visible), she stays at that edge the whole shot. Only these two characters appear, nobody in the background, a single Itzel.{NO}",
     ["¿Y si al final no me llevo ninguna?"], "soft, curious, testing")),
 ("c29", 10, talk("Itzel", f"Close-up of {ITZ} {AGE}, one hand on her chest, a sincere smile; {AMP} blurred at the left edge of the frame.{NO}",
     ["No pasa nada, señora.", "Mi deber es atenderla bien, compre o no compre.", "Usted merece conocer sus opciones."], "warm, sincere, gentle")),
 ("c30", 8, talk("Amparo", f"Medium shot {AGE}: {AMP} and {ITZ} stand side by side in front of three dark blue SUVs; Amparo looks at the cars and asks.{NO}",
     ["De estas tres, ¿cuál escogería usted…", "para usarla diario y salir a carretera?"], "calm, interested")),
 ("c31", 10, talk("Itzel", f"Medium close-up of {ITZ} {AGE}, gesturing with an open hand toward one dark blue SUV, honest and confident; {AMP} blurred at the left edge of the frame.{NO}",
     ["Esta. No es la más cara…", "pero es más espaciosa, gasta menos gasolina", "y le va a durar muchos años."], "honest, warm, confident")),
 ("c32", 8, talk("Amparo", f"Close-up of {AMP} {AGE}, a warm satisfied smile; {ITZ} blurred at the right edge of the frame.{NO}",
     ["Oiga, ¿cómo se llama?", "¿Y cuánto tiempo lleva aquí?"], "warm, kind")),
 ("c33", 10, talk("Itzel", f"Close-up of {ITZ} {AGE}, a shy sincere smile, touching her small silver name badge; {AMP} blurred at the left edge of the frame.{NO}",
     ["Me llamo Itzel. Llevo seis meses.", "A lo mejor no tengo mucha experiencia…", "pero aprendí que aquí todo el que entra merece respeto."], "humble, sincere, warm")),
 # 5. Giro: la cita en el corporativo (funde a negro)
 ("c34", 8, talk("Amparo", f"Close-up of {AMP} {AGE}, a serene knowing smile, a quiet authority in her eyes, speaking from the first second; {ITZ} seen from behind and blurred at the right edge of the frame (only her long loose black hair and beige jacket visible, her face is not shown). Only these two characters appear.{NO}",
     ["Itzel, mañana a las diez te quiero en la sala de juntas del corporativo."], "calm, warm, with quiet authority")),
 # CTA final (tras negro)
 ("c35", 8, talk("Amparo", f"Close-up of {AMP} {AGE}, looking straight into the camera with warmth and charisma, moving naturally: she adjusts her brown felt hat, nods, tilts her head, smiles and gestures with one hand toward the dark blue SUVs.{NO}",
     ["¿Ustedes creen que el gerente va a renunciar delante de todos?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("stands very close in front of", "stands in front of"), ("pointing", "gesturing"), ("steps closer to", "faces"),
        ("his voice rises", "serious"), ("his voice breaks", "quiet voice"), ("furious", "upset"), ("crying", "with teary eyes")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("disdainful", "serious"), ("disdain", "seriousness"), ("arrogant", "proud"), ("arrogance", "pride"), ("mocking", "ironic"), ("condescending", "serious"),
        ("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("tense", "serious"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shock", "surprise"), ("goes pale", "freezes"), ("commanding", "firm"), ("dismissive", "serious"), ("irritated", "annoyed"),
        ("young", "adult"), ("teenager", "adult"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("challenging", "firm"),
        ("¡", ""), ("!", "."), ("antes de que la saquen", "por favor"), ("me sacó", "no me atendió"), ("hacer el ridículo", "insistir"),
        ("de contado", "hoy"), ("Ni se le ocurra tocarla", "Mejor no la toque"), ("su casa y todo su pueblo juntos", "lo que usted se imagina")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, modern Mexican car showroom, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{PAMELA}", "a 30-year-old Mexican saleswoman"),
         ("@{GONZALO}", "a 36-year-old Mexican car salesman"),
         ("@{ITZELMORENA}", "a 27-year-old Mexican saleswoman")]
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

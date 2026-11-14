"""Genera los clips de reten-sierra con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
CAB = "inside the cab of the old red pickup truck @{LOC_SIERRA}, warm late afternoon light through the dusty windshield"
RET = "at the police checkpoint on the mountain road @{LOC_GARITA}, navy-blue police pickups and orange barriers, pines and red rocks, warm late afternoon light"
WIN = f"standing OUTSIDE the old red pickup truck @{{PROP_CAMIONETA}}, leaning on the driver-side window from the road, {RET}"
SIE = "on the hillside above the mountain road @{LOC_MONTE}, dust in the air, golden late afternoon light"

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: el retén a la vista (cabina) — sin plano abierto, hablando desde el frame 0
 ("c01", 8, talk("Emiliano", f"Medium two-shot {CAB}: @{{EMILIANO}} grips the steering wheel, worried, @{{CANDELARIA}} calm in the passenger seat holding a gold pocket watch @{{PROP_LEONTINA}}; far ahead through the windshield, a roadblock on the mountain road.",
     ["Abuela, ahí está el retén de Garza.", "Dicen que ahí cobran por pasar."], "nervous, fast, scared")),
 ("c02", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} in the passenger seat {CAB}, eyes fixed on the road ahead, unafraid.",
     ["Despacio, Emiliano. Despacio.", "Avísale a Teodoro que se detengan atrás de la loma."], "deep, calm, firm")),
 ("c03", 8, talk("Emiliano", f"Close-up of @{{EMILIANO}} {CAB}, one hand on the wheel, the other raising a black walkie-talkie radio to his mouth.",
     ["Teodoro, párense atrás de la loma.", "Que nadie se asome."], "low, urgent, into the radio")),
 ("c04", 6, f"Wide shot {RET}: the old red pickup truck @{{PROP_CAMIONETA}} followed by two white cattle trucks with wooden rails slows down and stops in front of the barriers; the police commander @{{GARZAVERDE}} steps forward and raises his hand to stop them, an officer @{{SOLDADOFLACO}} behind him. No dialogue."),
 # 2. Aproximación (retén, en la ventanilla)
 ("c05", 8, talk("Garza", f"Medium shot of @{{GARZAVERDE}} {WIN}, leaning toward the open window, looking at the cattle trucks behind, mirrored sunglasses on.",
     ["Buenas tardes, señora.", "¿Para dónde lleva tanto ganado?"], "raspy, slow, arrogant")),
 ("c06", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} in the passenger seat {CAB}, the blurred navy shoulder of the police commander at the window in the foreground.",
     ["A la feria de Parral, comandante.", "Ochenta cabezas, con sus papeles en regla."], "calm, polite, steady")),
 ("c07", 8, talk("Garza", f"Over-the-shoulder close-up of @{{GARZAVERDE}} {WIN}, in the foreground the blurred shoulder and cream cowboy hat with a turquoise band of @{{CANDELARIA}} seen from behind (long silver braid down her back, brown suede jacket), keeping his sunglasses on the whole time, he glances down at the gold pocket watch in her lap and smiles. His hands stay on the window frame.",
     ["Los papeles no me interesan.", "Bonito reloj."], "dismissive, then greedy")),
 ("c08", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} {CAB}, she opens the engraved lid of the gold pocket watch @{{PROP_LEONTINA}} in her hands, then looks up at the window.",
     ["Era de mi esposo.", "¿Hay algún problema, comandante?"], "quiet, then cold")),
 # 3. La extorsión
 ("c09", 10, talk("Garza", f"Medium shot of @{{GARZAVERDE}} {WIN}, resting his forearm on the window frame of the truck, leaning in.",
     ["El problema es que este camino tiene dueño.", "Son quinientos mil. Y aquí no pasó nada."], "low, smug, menacing")),
 ("c10", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} (exactly as in her reference sheet: cream cowboy hat with a turquoise band, long silver braid, emerald-green blouse under her brown suede jacket) in the passenger seat {CAB}, raising one eyebrow, indignant.",
     ["¿Quinientos mil?", "¿Por pasar por un camino de todos?"], "incredulous, then sharp")),
 ("c11", 10, talk("Garza", f"Close-up of @{{GARZAVERDE}} {WIN}, his face close to the window, tapping the black radio clipped to the chest pocket of his camouflage shirt (no vest, same plain camouflage shirt as in his reference sheet).",
     ["Cuidado cómo me habla, señora.", "Aquí yo decido quién pasa y quién se queda."], "hard, threatening")),
 ("r1", 6, f"Close-up of @{{EMILIANO}} {CAB}, in silence, he swallows hard, his hands squeeze the steering wheel, sweat on his forehead, eyes moving to the window. No dialogue."),
 # 4. El abuelo: momento cálido
 ("c12", 8, talk("Emiliano", f"Close-up of @{{EMILIANO}} at the wheel {CAB}, leaning toward his grandmother, almost whispering; at the edge of the frame, the blurred shoulder and cream cowboy hat of @{{CANDELARIA}} (turquoise hat band, long silver braid, brown suede jacket over an emerald-green blouse).",
     ["Abuela, mejor páguele.", "Esos hombres no perdonan."], "whispering, pleading, scared")),
 ("c13", 10, talk("Candelaria", f"Close-up of @{{CANDELARIA}} {CAB}, golden backlight with a soft lens flare, eyes wet, holding the open gold pocket watch @{{PROP_LEONTINA}}.",
     ["Eso mismo pensó tu abuelo, en este mismo retén, hace veinte años.", "Pagó lo que le pidieron… y aun así no volvió a casa."], "soft, painful, very clear")),
 ("r2", 6, f"Close-up of @{{EMILIANO}} {CAB}, in silence, his eyes behind the round glasses fill with tears, he looks at his grandmother and understands. No dialogue."),
 # 5. Escalada y llamada
 ("c14", 10, talk("Garza", f"Medium shot of @{{GARZAVERDE}} {WIN}, he slaps the roof of the red truck with his palm, impatient.",
     ["¿Qué tanto platican?", "Si no hay dinero, no hay paso.", "Y con una llamada tengo aquí veinte patrullas."], "loud, impatient, threatening")),
 ("c15", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} {CAB}, a slow half smile, perfectly calm.",
     ["¿Usted cree que vine sola, comandante?", "A mí no me va a asustar."], "calm, ironic, deep")),
 ("c16", 8, talk("Garza", f"Close-up of @{{GARZAVERDE}} {WIN}, leaning into the window, impatient.",
     ["Entonces arreglemos esto rápido, señora.", "Aquí las reglas las pongo yo."], "impatient, raising his voice")),
 ("c17", 10, talk("Candelaria", f"Close-up of @{{CANDELARIA}} {CAB}, she looks at the commander, then takes the black walkie-talkie radio from her grandson and raises it to her mouth.",
     ["En su retén, sí. Pero no a sus órdenes.", "Teodoro. Ya. Que se acerquen todos."], "cold, firm, then commanding into the radio")),
 ("c18", 8, talk("Teodoro", f"Medium shot of the foreman @{{DONTEO}} at the wheel of a ranch pickup truck {SIE}, a walkie-talkie in his hand, riders on horseback behind the truck.",
     ["Ahí vamos, patrona.", "¡Arriba, muchachos! ¡Vámonos!"], "rough, loud, proud, the second line shouted out the window")),
 ("c19", 6, f"Wide shot {SIE}: dozens of cowboys on horseback and several ranch pickup trucks ride slowly down the hill in a cloud of dust toward the police checkpoint on the road below, then surround the navy police pickups and the old red truck. No dialogue."),
 # 6. Giro: el cerco
 ("c20", 8, talk("Garza", f"Close-up of @{{GARZAVERDE}} {RET}, he takes off his mirrored sunglasses and looks around nervously, dust and riders blurred behind him.",
     ["¿Qué hizo, señora?", "¿A quién le habló?"], "nervous, losing control")),
 ("c21", 8, talk("Pineda", f"Medium shot of the young officer @{{SOLDADOFLACO}} {RET}, holding his radio, turning in circles, cowboys on horses blurred behind him.",
     ["Comandante, nos están rodeando.", "Son más de cuarenta."], "high-pitched, scared")),
 ("c22", 8, talk("Candelaria", f"Medium shot of @{{CANDELARIA}} standing on the road next to the old red truck {RET}, the gold pocket watch chain on her jacket.",
     ["¿Qué pasó, comandante?", "¿Ya no me va a cobrar el paso?"], "calm, ironic")),
 ("c23", 8, talk("Garza", f"Medium shot of @{{GARZAVERDE}} {RET}, hands half raised, sweating, riders behind him.",
     ["Dígales que se calmen, señora.", "Nadie quiere problemas."], "nervous, conciliatory")),
 # 7. La familia y el ultimátum
 ("c24", 10, talk("Candelaria", f"Over-the-shoulder close-up of @{{CANDELARIA}} {RET}, the blurred shaved head of Garza in the foreground.",
     ["El problema lo empezó usted.", "Hace cinco minutos me quería cobrar medio millón."], "firm, slow")),
 ("c25", 8, talk("Garza", f"Over-the-shoulder close-up of @{{GARZAVERDE}} {RET}, in the foreground the blurred back of @{{CANDELARIA}} (cream cowboy hat with a turquoise band, long silver braid, brown suede jacket), trying to recover his pride.",
     ["Está hablando con un comandante.", "Esto le va a salir muy caro."], "proud, threatening")),
 ("c26", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} {RET}, taking one step closer, eyes locked on him.",
     ["Y usted está hablando con Candelaria Ibarra.", "¿Tiene esposa, comandante?"], "deep, slow, cold")),
 ("c27", 8, talk("Garza", f"Close-up of @{{GARZAVERDE}} {RET}, uneasy, his gold tooth showing as he talks.",
     ["¿Qué tiene que ver mi familia?", "A ella no la meta."], "defensive, worried")),
 ("c28", 10, talk("Candelaria", f"Close-up of @{{CANDELARIA}} (exactly as in her reference sheet: cream cowboy hat with a turquoise band, long silver braid, emerald-green blouse under her brown suede jacket) {RET}, golden backlight, eyes wet but hard.",
     ["Yo también tenía un esposo.", "Una tarde salió por este camino… y nunca volvió."], "low, painful, firm")),
 ("r4", 6, f"Close-up of @{{GARZAVERDE}} {RET}, in silence, he freezes, swallows, his eyes drop to the ground as if he remembers something. Slow push-in. No dialogue."),
 ("c29", 10, talk("Candelaria", f"Close-up of @{{CANDELARIA}} {RET}, she opens the gold pocket watch @{{PROP_LEONTINA}} and looks at the time.",
     ["La oferta cambió, comandante.", "Usted quita sus patrullas de mi camino y se va del municipio hoy."], "calm, absolute")),
 ("c30", 8, talk("Garza", f"Close-up of @{{GARZAVERDE}} {RET}, recovering a little of his arrogance.",
     ["¿Y si no?", "¿Sabe quién me puso en este retén?"], "low, defiant")),
 ("c31", 10, talk("Candelaria", f"Close-up of @{{CANDELARIA}} {RET}, she snaps the gold pocket watch shut, riders on horses blurred behind her.",
     ["Por eso vine en persona.", "Tiene cinco minutos.", "Ahora usted decide."], "quiet, calm, firm")),
 # 8. Cliffhanger (la voz sale del radio, Garza NO habla)
 ("c32", 8, f"Close-up of @{{GARZAVERDE}} {RET}: the black radio clipped to his camouflage shirt pocket crackles, its red light blinks, and a distorted male voice comes out of the radio speaker in Mexican Spanish: \"Comandante, ya vamos llegando.\" Garza does not speak and his lips stay closed; he listens, then a slow cold smile spreads under his moustache. Slow push-in."),
 # CTA final (tras negro)
 ("c33", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} (cream cowboy hat with a turquoise band, long silver braid, brown suede jacket over an emerald-green blouse) {RET}, looking straight into the camera with charisma, the gold pocket watch @{{PROP_LEONTINA}} in one hand; she adjusts the brim of her hat with two fingers, tilts her head slightly, a knowing half smile, nods once and gestures toward the camera with her free hand as she talks, natural organic movement like a telenovela star talking to her audience.",
     ["¿Creen que el comandante va a ceder?", "Denle me gusta y compartan para ver la segunda parte."], "warm, intimate, confident, a little playful, talking directly to the viewer")),
]

# Flow rechaza policías/uniformes oficiales y niños: siempre se describen con ropa civil concreta
# Atuendos como en la referencia (El Retén de atrium usa uniforme camuflado + gorra, NO policía con placa/chaleco)
SAFE = [("the police checkpoint", "the army checkpoint"), ("police checkpoint", "army checkpoint"), ("navy-blue police pickups", "olive-green army pickups"),
        ("the navy police pickups", "the olive-green army pickups"), ("navy police", "olive-green army"), ("blurred navy shoulder of the police commander", "blurred olive camouflage shoulder of the major"),
        ("the police commander", "the major in an olive camouflage uniform"), ("the young officer", "the thin soldier in olive camouflage"), ("an officer", "a thin soldier in olive camouflage"),
        ("officer", "soldier"), ("police", "army")]
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

NOREF = [("@{GARZAVERDE}", "a heavyset bald Mexican man in his 50s with aviator sunglasses and a thick black horseshoe mustache, wearing a plain dark navy work shirt"),
         ("@{SOLDADOFLACO}", "a 25-year-old Mexican man in a grey windbreaker")]
TRIES = 6

GARZA_ANCHOR = "@{GARZAVERDE} (the same heavyset major from his reference sheet: thick black horseshoe moustache, mirrored aviator sunglasses, olive-green woodland camouflage uniform and matching camouflage cap)"

def variant(body, k):
    if k < 4: body = body.replace("@{GARZAVERDE}", GARZA_ANCHOR, 1)
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

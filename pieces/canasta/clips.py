"""Genera los clips de canasta con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
VES = "in the bright reception hall @{LOC_VESTIBULO} of a Mexican candy company, a long wooden reception counter, white walls with blue Talavera tile accents, potted plants, glass doors to the street, soft daylight"
GER = "in the manager's office @{LOC_GERENCIA}, a dark wooden desk with folders, a black leather chair, a large window over the city, soft daylight"
BAN = "at the glass entrance @{LOC_BANQUETA} of the company building, three grey stone steps, a wide sidewalk, potted plants, soft grey daylight"
LLU = "at the glass entrance @{LOC_BANQUETA} of the company building, three grey stone steps, light rain, wet shiny sidewalk, cold grey light"
SAL = "in the warm living room @{LOC_SALITA} of a Mexican house, a wooden dining table with a white embroidered tablecloth, family photos on the wall, green plants, golden morning light"
# Ancla de identidad: primera mención de cada personaje en cada prompt
REF = "@{REFUGIO} (70-year-old woman, grey hair in a low bun, small silver stud earrings, mustard-yellow knitted cardigan, white blouse, long dark blue skirt, black flat shoes, a wicker basket of gum packets and candies)"
HOR = "@{HORACIO} (50, slicked-back black hair with grey temples, completely clean-shaven, black suit, white shirt, solid royal blue tie)"
MAR = "@{MARIBEL} (30-year-old woman, dark hair in a ponytail, light pink blouse, black trousers, blue lanyard with a white ID card)"
EUS = "@{EUSEBIO} (55, short grey hair, thick grey moustache, plain light blue long-sleeve work shirt, navy blue trousers, white ID card on a lanyard)"
FED = "@{FEDERICO} (42, short dark hair, short neat black beard, charcoal grey suit, light grey shirt with open collar, no tie)"
NO = " No other people."

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: Horacio humilla a Refugio en la recepción, hablando desde el frame 0
 ("c01", 10, talk("Horacio", f"Close-up of {HOR} {VES}, frowning with disdain, gesturing with one open hand at the edge of the frame; {REF} seen from behind and blurred at the right edge of the frame.{NO}",
     ["¿Quién metió aquí a esta señora?", "Aquí nomás entra gente importante.", "Agarre su canasta y salga de aquí."], "cold, disdainful, arrogant")),
 ("c02", 10, talk("Refugio", f"Close-up of {REF} {VES}, hurt but dignified, holding her wicker basket; {HOR} blurred at the left edge of the frame.{NO}",
     ["Yo no vengo a pedir nada, señor.", "Vendo mis chicles, no ando pidiendo limosna.", "No tiene por qué hablarme así."], "hurt, quiet, dignified")),
 ("c03", 8, talk("Horacio", f"Medium shot {VES}: {HOR} stands at the reception counter and looks at {MAR}, who stands behind the counter holding two small gum packets; {REF} blurred in the background with her basket.{NO}",
     ["Maribel, ¿qué haces comprándole?", "Si le compras hoy, mañana tenemos aquí a todo el mercado."], "cold, annoyed, condescending")),
 ("c04", 6, talk("Maribel", f"Close-up of {MAR} {VES}, behind the reception counter, two small gum packets in her hand, worried; {HOR} blurred at the left edge of the frame.{NO}",
     ["Nomás fueron dos paquetitos, licenciado."], "quiet, worried, respectful")),
 # 2. El villano a solas
 ("c05", 10, talk("Horacio", f"Medium close-up of {HOR} {GER}, alone, standing by the window, looking down at the city with a slow satisfied smile.{NO}",
     ["Ya mero, Horacio. Ya mero.", "En cuanto Federico firme, esta empresa es mía.", "Y aquí voy a decidir yo quién entra."], "low, slow, ambitious, satisfied")),
 # 3. La aliada
 ("c06", 8, talk("Maribel", f"Medium shot {VES}, next to the glass doors: {MAR} faces {REF}, who is seen from behind and blurred at the right edge of the frame.{NO}",
     ["Señora, espérese. Soy Maribel.", "Discúlpelo. No todos aquí somos así."], "warm, kind, a little nervous")),
 ("c07", 8, talk("Refugio", f"Close-up of {REF} {VES}, next to the glass doors, a small grateful smile; {MAR} blurred at the left edge of the frame.{NO}",
     ["Gracias, muchacha. Yo soy Refugio.", "Dime una cosa… ¿ese señor siempre trata así a la gente?"], "warm, curious, calm")),
 ("c08", 10, talk("Maribel", f"Close-up of {MAR} {VES}, glancing back toward the corridor, worried; {REF} blurred at the right edge of the frame.{NO}",
     ["Es el licenciado Horacio, el administrador.", "Desde que el dueño anda fuera del país, se siente el mandamás.", "Al que no le hace caso, lo corre."], "low, worried, confidential")),
 ("c09", 10, talk("Horacio", f"Medium shot of {HOR} {GER}, alone, seated at the desk with a black smartphone at his ear, a folder open in front of him, a fake friendly smile.{NO}",
     ["Tú tranquilo, Federico. Tú descansa.", "Nomás fírmame los permisos y yo me encargo de todo.", "Aquí todo está en orden."], "smooth, fake friendly, calm")),
 ("c10", 8, talk("Refugio", f"Close-up of {REF} {VES}, next to the glass doors, concerned; {MAR} blurred at the left edge of the frame.{NO}",
     ["¿Y no te da miedo que te vea platicando conmigo?"], "soft, concerned")),
 ("c11", 10, talk("Maribel", f"Close-up of {MAR} {VES}, her eyes wet but firm; {REF} blurred at the right edge of the frame.{NO}",
     ["Claro que me da miedo, doña Refugio.", "Necesito este empleo.", "Pero no le voy a ayudar a humillar a nadie."], "quiet, emotional, then firm")),
 # 4. Confrontación en el mostrador
 ("c12", 8, talk("Horacio", f"Medium shot {VES}: {HOR} walks up to the reception counter and stops in front of {MAR} and {REF}, both blurred in the foreground.{NO}",
     ["Maribel, aquí se viene a cumplir, no a platicar.", "Regrese a su lugar."], "cold, irritated, controlled")),
 ("c13", 8, talk("Maribel", f"Medium close-up of {MAR} {VES}, standing next to {REF}, holding up the two small gum packets; {HOR} blurred at the left edge of the frame.{NO}",
     ["Ya la atendí, licenciado.", "La señora no está molestando a nadie."], "calm, respectful, firm")),
 ("c14", 10, talk("Horacio", f"Over-the-shoulder close-up {VES}: {HOR} faces the camera; {MAR} seen from behind and blurred in the foreground (only her dark ponytail and light pink blouse visible).{NO}",
     ["A ver si te queda claro.", "Mientras Federico no esté, aquí mando yo.", "Y conmigo no se discute."], "slow, cold, serious")),
 ("c15", 8, talk("Refugio", f"Close-up of {REF} {VES}, firm and serene, holding her basket; {HOR} blurred at the left edge of the frame.{NO}",
     ["La muchacha ya le explicó todo.", "Si quiere que me vaya, me voy. Pero no la amenace."], "calm, firm, dignified")),
 ("c16", 8, talk("Horacio", f"Close-up of {HOR} {VES}, a mocking half smile, looking down at {REF}, who is blurred at the right edge of the frame.{NO}",
     ["¿Ahora también me va a decir cómo hacer las cosas?", "Le compran dos chicles y ya se siente la dueña."], "mocking, arrogant, cold")),
 ("c17", 6, talk("Refugio", f"Close-up of {REF} {VES}, holding her wicker basket with both hands, chin up; {HOR} blurred at the left edge of the frame.{NO}",
     ["No necesito que me compren nada para que me respeten."], "quiet, firm, dignified")),
 # 5. La expulsión
 ("c18", 8, talk("Horacio", f"Medium shot {VES}: {HOR} turns toward {EUS}, who stands by the glass doors, and calmly shows the way out with an open palm, fingers together, his hand kept low; he never points a finger at anyone. {REF} is seen from behind and blurred in the foreground (only her grey low bun and mustard-yellow cardigan visible).{NO}",
     ["Don Eusebio, venga.", "Acompañe a la señora a la salida."], "cold, commanding")),
 ("c19", 8, talk("Eusebio", f"Medium shot {VES}, by the glass doors: {EUS} offers his arm gently to {REF}, kind and respectful.{NO}",
     ["Venga conmigo, señora.", "Cuidado con el escalón. Si gusta, deme el brazo."], "gentle, kind, respectful")),
 ("c20", 8, talk("Horacio", f"Close-up of {HOR} {VES}, annoyed, looking toward {EUS}, who is blurred at the right edge of the frame.{NO}",
     ["Le pedí que la sacara, no que la acompañara de paseo.", "Por eso luego no se quieren ir."], "irritated, sarcastic")),
 ("c21", 8, talk("Refugio", f"Close-up of {REF} {VES}, holding the arm of {EUS}, who is blurred at the left edge of the frame, calm and dignified.{NO}",
     ["Don Eusebio nomás está siendo amable.", "Ya me voy, como usted quiere."], "calm, dignified, a little sad")),
 ("c22", 8, talk("Horacio", f"Medium close-up of {HOR} {VES}, arms crossed, cold; {REF} blurred at the right edge of the frame.{NO}",
     ["Pues apúrele.", "Y no la quiero ver vendiendo nada aquí afuera."], "cold, dismissive")),
 ("c23", 10, talk("Refugio", f"Close-up of {REF} {BAN}, standing on the steps with her wicker basket, her eyes wet; {HOR} blurred at the left edge of the frame.{NO}",
     ["Con esta canasta he salido adelante toda mi vida.", "Nunca me había dado vergüenza cargarla…", "hasta hoy, que usted quiso hacérmela sentir."], "quiet, emotional, with teary eyes, dignified")),
 # 6. Gestos de bondad
 ("c24", 8, talk("Maribel", f"Medium shot {BAN}: {MAR} comes out of the glass doors holding a glass of water and offers it to {REF}, who stands on the steps.{NO}",
     ["Doña Refugio, espérese.", "Tómese un vasito de agua antes de irse."], "warm, caring")),
 ("c25", 8, talk("Horacio", f"Close-up of {HOR} {BAN}, standing in the open glass doorway, cold, looking at {MAR}, who is blurred at the right edge of the frame.{NO}",
     ["Muy bien, Maribel.", "Cuando me pidas un permiso, acuérdate de este día."], "slow, cold, serious")),
 ("c26", 10, talk("Refugio", f"Close-up of {REF} {BAN}, holding the glass of water, serene and firm; {HOR} blurred at the left edge of the frame.{NO}",
     ["La muchacha no necesita que yo la defienda.", "Lo que necesita es un patrón…", "que no la castigue por tener buen corazón."], "calm, firm, wise")),
 ("c27", 8, talk("Horacio", f"Medium shot {BAN}: {HOR} stands in the glass doorway and gestures toward the street with an open hand; {EUS} stands next to him.{NO}",
     ["Ya estuvo, señora. Váyase y no vuelva.", "Don Eusebio, a esta señora no me la vuelve a pasar."], "cold, final, dismissive")),
 ("c28", 8, talk("Refugio", f"Medium shot {BAN}: {REF} smiles warmly at {MAR} and {EUS}, who stand together on the steps, Maribel with wet eyes. Refugio wears no lanyard and no ID card, only her mustard-yellow cardigan over her white blouse exactly as in her reference sheet; only Maribel and Eusebio wear lanyards.{NO}",
     ["Gracias, Maribel. Gracias, don Eusebio.", "Una nunca olvida quién le tendió la mano."], "warm, grateful, serene")),
 # 7. El giro: al día siguiente, en casa de Refugio (cama cálida)
 ("r1", 6, f"Medium shot {SAL}: {FED} comes in with a dark grey suitcase and gives {REF} a warm hug. Only these two characters appear in the whole shot, each one exactly once.{NO} Slow push-in. No dialogue."),
 ("c29", 10, talk("Federico", f"Medium close-up of {FED} {SAL}, smiling with love at {REF}, who is blurred at the left edge of the frame.{NO}",
     ["Mamá, ya estoy en casa.", "Hoy te quiero presentar en la empresa…", "para que conozcan a la señora que la fundó."], "warm, proud, tender")),
 ("c30", 10, talk("Refugio", f"Close-up of {REF} {SAL}, a knowing serene smile, her wicker basket on the table; {FED} blurred at the right edge of the frame.{NO}",
     ["Ayer fui con mi canasta, Federico.", "Quería ver cómo tratan ahí a una desconocida.", "Hoy quiero que lo veas tú también."], "calm, knowing, serious")),
 # 8. Cliffhanger bajo la lluvia
 ("r2", 6, f"Medium wide shot {LLU}: {FED} holds a black umbrella over {REF} as they walk up the steps; {HOR} comes out of the glass doors toward them. Only these three characters appear in the whole shot, each one exactly once.{NO} Slow push-in. No dialogue."),
 ("c31", 8, talk("Horacio", f"Close-up of {HOR} {LLU}, standing in the glass doorway, frowning at {REF}, who is blurred at the right edge of the frame.{NO}",
     ["¿Otra vez usted?", "Ayer le advertí que no volviera."], "cold, irritated, arrogant")),
 ("c32", 8, talk("Federico", f"Medium close-up of {FED} {LLU}, holding a black umbrella, he steps in front of {REF} and looks at {HOR}, who is blurred at the left edge of the frame.{NO}",
     ["¿Así recibes a mi mamá cuando no estoy?"], "low, serious, controlled")),
 ("c33", 6, talk("Horacio", f"Close-up of {HOR} {LLU}, his face goes pale, eyes wide open in shock, looking at {FED}, who is blurred at the right edge of the frame.{NO}",
     ["¿Su… mamá?"], "barely a whisper, shocked")),
 # CTA final (tras negro)
 ("c34", 8, talk("Refugio", f"Close-up of {REF} {SAL}, alone, looking straight into the camera and talking to the viewer from the very first second, with warmth and charisma, her lips moving clearly; while she speaks she nods, tilts her head, smiles and gestures with one open hand toward her wicker basket.{NO}",
     ["¿Qué creen que le va a pasar a Horacio?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little playful, talking directly to the viewer")),
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
        ("¡", ""), ("!", "."), ("humillar", "tratar mal"), ("lo corre", "lo despide"), ("castigue", "regañe"), ("amenace", "regañe")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, modern Mexican office building, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{HORACIO}", "a 50-year-old Mexican office manager"),
         ("@{EUSEBIO}", "a 55-year-old Mexican doorman"),
         ("@{FEDERICO}", "a 42-year-old Mexican businessman")]
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

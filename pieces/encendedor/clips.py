"""Genera los clips de encendedor con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
EST = "in the dark wooden study @{LOC_ESTUDIO} of a ranch house, an old laptop and papers on the desk, a black iron safe, a framed portrait on the wall, warm amber light through half-closed curtains"
BOD = "in the dim adobe storeroom @{LOC_BODEGA}, stacked burlap sacks of corn, a small barred window, dusty beams of warm light"
PAT = "in the colonial courtyard @{LOC_PATIO} of a rich hacienda, terracotta-red walls, stone arches, a stone fountain, potted bougainvillea, warm late-afternoon light"
STA = "at the abandoned desert train station @{LOC_ESTACION}, a faded wooden platform, an old water tower, rusty rails, dry brush, orange sunset light with floating dust"
COR = "on the long arched corridor @{LOC_CORREDOR} of a ranch house at sunset, terracotta floor, wooden columns, hanging lanterns, palm trees and a pink sky behind"
# Ancla de identidad: primera mención de cada personaje en cada prompt
CON = "@{CONSUELO} (52, long wavy dark hair, light grey cowboy hat with a black leather band, dark green shirt, tan suede vest, silver bolo tie with a round red stone, small gold hoop earrings)"
SAN = "@{SANTIAGO} (25-year-old man, messy dark hair, light stubble, worn light brown work shirt torn at the shoulder over a dirty white t-shirt, black string bracelet)"
CIR = "@{CIRILO} (48, short black beard, dark brown cap, grey-green camouflage jacket over a black t-shirt, sunglasses hanging from his collar)"
BAL = "@{BALTASAR} (62, slicked-back grey hair, thick grey moustache, dark red leather jacket with black floral embroidery, black shirt, gold chain with a round medallion, big silver belt buckle)"
ROQ = "@{ROQUE} (40, shaved head, dark blue suit, black shirt, small earpiece)"
LEA = "@{LEANDRO} (55, short grey beard, cream straw cowboy hat, dark blue denim shirt)"
ENC = "@{PROP_ENCENDEDOR}"  # encendedor antiguo de plata que esconde una memoria USB

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: el video de Leandro, sin plano abierto, hablando desde el frame 0
 ("c01", 10, talk("Leandro", f"Medium shot over the shoulder of {CON}, seen from behind and blurred at the left edge, sitting at the desk {EST} and watching an old open laptop. On the FLAT laptop screen a recorded webcam video plays: {LEA} talking to his webcam. He is only a 2D image displayed INSIDE the screen rectangle, fully contained within the screen bezel; nothing comes out of the screen, no part of him extends beyond the screen edges. The voice comes from the laptop speakers. No other people.",
     ["Consuelo, si estás viendo esto, es que ya no estoy.", "Baltasar me quiere quitar de en medio.", "Todo está en mi encendedor. Cuida a mi muchacho."], "low, tired, sincere, urgent")),
 ("c02", 8, talk("Consuelo", f"Close-up of {CON} {EST}, her eyes wet, holding the old silver lighter {ENC} in her hand, the glow of the laptop on her face.",
     ["Ay, Leandro…", "¿Por qué no me dijiste nada?"], "quiet, sad, with teary eyes")),
 ("c03", 8, talk("Consuelo", f"Medium close-up of {CON} {EST}, holding a black smartphone to her ear, the silver lighter {ENC} in her other hand, determined.",
     ["Licenciada Ordaz, tengo las pruebas.", "Necesito que me ayude hoy mismo."], "low, firm, determined")),
 # 2. Santiago retenido en la bodega
 ("c04", 8, talk("Santiago", f"Medium shot {BOD}: {SAN} sits on the floor against the adobe wall, looking up; {CIR} seen from behind and blurred in the foreground.",
     ["¿Usted conoció a mi papá?", "¿Y así le paga?"], "tired, hurt, defiant")),
 ("c05", 8, talk("Cirilo", f"Over-the-shoulder medium shot {BOD}: {CIR} faces the camera, uneasy, {SAN} seen from behind and blurred at the right edge of the frame.",
     ["Le cuidé el rancho muchos años.", "Tú no entiendes nada, muchacho."], "low, uneasy, avoiding eye contact")),
 ("c06", 8, talk("Santiago", f"Close-up of {SAN} {BOD}, standing up slowly, his gaze firm, {CIR} blurred at the left edge of the frame.",
     ["Entiendo que mi papá confiaba en usted.", "Y usted lo vendió."], "quiet, firm, disappointed")),
 ("c07", 6, talk("Cirilo", f"Close-up of {CIR} {BOD}, he looks away toward the barred window, guilty.",
     ["No hables tan fuerte. Aquí las paredes oyen."], "low, nervous, guilty")),
 # 3. Baltasar descubre la caja vacía
 ("c08", 10, talk("Baltasar", f"Close-up of {BAL} {PAT}, seated at a stone table with a glass of tequila, he opens a small empty wooden box and looks inside.",
     ["¿Qué es esto?", "Aquí no hay nada.", "Leandro siempre fue más listo que todos."], "slow, cold, irritated")),
 ("c09", 8, talk("Roque", f"Over-the-shoulder close-up {PAT}: {ROQ} faces the camera, worried, {BAL} seen from behind and blurred in the foreground.",
     ["Era lo único que había en la caja fuerte, patrón.", "Se lo prometo por mi madre."], "worried, respectful")),
 ("c10", 8, talk("Baltasar", f"Close-up of {BAL} {PAT}, he stands up and looks at {ROQ}, who is blurred at the right edge of the frame.",
     ["¿Me estás viendo la cara?", "Entonces el encendedor lo tiene Consuelo."], "low, cold, slow")),
 # 4. La llamada (montaje paralelo estudio / patio)
 ("c11", 10, talk("Consuelo", f"Close-up of {CON} {EST}, alone in the study, a black smartphone at her ear, she raises one single small silver lighter {ENC} in front of her face with a faint smile: exactly the engraved silver lighter of its reference image, one solid piece with the lid closed, held still between her fingers. No other people.",
     ["¿Buscabas esto, Baltasar?", "Te cambio la verdad por el muchacho.", "Ahí voy a estar."], "calm, cold, confident")),
 ("c12", 10, talk("Baltasar", f"Medium shot of {BAL} {PAT}, standing alone by the fountain with a black smartphone at his ear, a slow cold smile. No other people.",
     ["Consuelo.", "Qué sorpresa.", "Ven sola. A la antigua estación del tren.", "Al atardecer."], "slow, cold, controlled, unhurried, every word clearly pronounced")),
 ("c13", 8, talk("Baltasar", f"Over-the-shoulder medium shot {PAT}: {BAL} faces the camera, {CIR} seen from behind and blurred in the left foreground.",
     ["Cuando tenga ese encendedor en la mano…", "no quiero volver a ver a ninguno de los dos."], "low, cold, serious")),
 ("c14", 6, talk("Cirilo", f"Close-up of {CIR} {PAT}, he lowers his eyes, hesitant, {BAL} blurred at the right edge of the frame.",
     ["Como usted diga, patrón."], "quiet, hesitant")),
 # 5. Promesa
 ("c15", 8, talk("Consuelo", f"Medium profile shot of {CON} {EST}, standing in front of the framed portrait of {LEA} on the wall, a dusty sunbeam between them, she puts the silver lighter {ENC} in her vest pocket.",
     ["Hoy se termina, hermano.", "Te lo prometo."], "quiet, emotional, determined")),
 # 6. El intercambio en la estación
 ("r1", 6, f"Wide shot {STA}: a dusty dark green pickup truck stops on the dirt road beside the platform and {CON} steps out of it; {BAL}, {CIR} and {SAN} wait together on the platform. Only these four characters appear in the whole shot, each one exactly once. No other people, no duplicates. Slow push-in. No dialogue."),
 ("c16", 8, talk("Baltasar", f"Over-the-shoulder medium shot {STA}: {BAL} faces the camera, {CIR} and {SAN} standing behind him, {CON} seen from behind and blurred in the foreground.",
     ["Puntual como siempre, Consuelo.", "Primero el encendedor."], "slow, mocking, cold")),
 ("c17", 8, talk("Santiago", f"Close-up of {SAN} {STA}, standing next to {CIR}, worried, looking toward Consuelo off-screen.",
     ["Tía, no le dé nada.", "Es una trampa."], "worried, urgent")),
 ("c18", 8, talk("Consuelo", f"Close-up of {CON} {STA}, calm, the orange sunset behind her, {BAL} blurred at the right edge of the frame.",
     ["Tranquilo, Santiago. Todo va a estar bien.", "Suéltalo primero, Baltasar."], "calm, warm, then firm")),
 ("c19", 8, talk("Consuelo", f"Medium shot {STA}: {CON} holds up the silver lighter {ENC} between two fingers, {BAL} blurred at the left edge of the frame.",
     ["Aquí está.", "Ahora suéltalo."], "firm, steady")),
 ("c20", 8, talk("Baltasar", f"Close-up of {BAL} {STA}, holding the silver lighter {ENC} in his hand, looking at it with greed and a slow smile.",
     ["Veinte años esperando esto."], "slow, satisfied")),
 ("c21", 8, talk("Consuelo", f"Close-up of {CON} {STA}, a small triumphant smile under her light grey cowboy hat, {BAL} blurred at the left edge of the frame.",
     ["Disfrútalo.", "La licenciada Ordaz ya tiene una copia."], "calm, ironic, triumphant")),
 ("c22", 8, talk("Baltasar", f"Close-up of {BAL} {STA}, his smile fades, he turns his head toward {CIR}, who is blurred at the edge of the frame.",
     ["¿Cómo que una copia?", "Cirilo, súbelo a la camioneta."], "surprised, then cold")),
 # 7. Cirilo cambia de bando
 ("c23", 8, talk("Cirilo", f"Medium shot {STA}: {CIR} steps in front of {SAN} and faces {BAL}, who is seen from behind and blurred at the left edge of the frame (only his dark red leather jacket with black floral embroidery and slicked-back grey hair visible), calm and firm. No other people.",
     ["No, patrón.", "Al muchacho no lo toca nadie."], "calm, firm, decided")),
 ("c24", 8, talk("Baltasar", f"Close-up profile of {BAL} {STA}, looking at {CIR}, who is blurred at the edge of the frame, disbelief in his face.",
     ["¿Tú también, Cirilo?", "¿Después de todo lo que hice por ti?"], "slow, cold, disappointed")),
 ("c25", 10, talk("Cirilo", f"Over-the-shoulder close-up {STA}: {CIR} faces the camera, {BAL} seen from behind and blurred in the foreground.",
     ["Don Leandro me tendió la mano cuando nadie más.", "Se lo debo.", "Y voy a declarar todo lo que sé."], "low, steady, sincere")),
 ("c26", 8, talk("Baltasar", f"Close-up of {BAL} {STA}, he slowly puts the silver lighter in his jacket pocket, looking at Consuelo off-screen.",
     ["Esto no se acaba aquí, Consuelo."], "low, cold, serious")),
 ("c27", 8, talk("Consuelo", f"Close-up of {CON} {STA}, serene, the sunset behind her, {BAL} blurred at the left edge of the frame.",
     ["Aquí se acaba, Baltasar."], "calm, firm, serene")),
 ("c28", 8, talk("Consuelo", f"Medium shot {STA}: {CON} faces {CIR}, who is seen from behind and blurred at the right edge of the frame, she nods to him.",
     ["Hoy salvaste al muchacho de Leandro.", "Eso no se olvida."], "warm, grateful")),
 ("c29", 8, talk("Santiago", f"Close-up of {SAN} {STA}, looking at {CIR}, who is blurred at the edge of the frame, a small sad smile.",
     ["Gracias, Cirilo.", "Mi papá tenía razón con usted."], "quiet, grateful")),
 # 8. Resolución en el corredor (cama cálida)
 ("c30", 8, talk("Consuelo", f"Medium shot {COR}: {CON} hands an old photograph to {SAN}, who stands in front of her.",
     ["Esto era de tu papá.", "Ahora es tuyo."], "warm, tender")),
 ("c31", 8, talk("Santiago", f"Close-up of {SAN} {COR}, holding the old photograph, his eyes wet, {CON} blurred at the left edge of the frame.",
     ["Es lo único que me queda de él.", "¿Me puedo quedar aquí, tía?"], "quiet, emotional, with teary eyes")),
 ("c32", 8, talk("Consuelo", f"Close-up of {CON} {COR}, warm smile, the pink sky behind her, {SAN} blurred at the right edge of the frame.",
     ["Esta siempre fue tu casa, Santiago."], "warm, tender, sincere")),
 ("r2", 6, f"Medium wide shot {COR}: {CON} and {SAN} share a gentle hug at sunset, the old photograph in his hand. Consuelo wears blue jeans and brown boots exactly as in her reference sheet, a plain belt with nothing hanging from it. No other people. Slow push-in. No dialogue."),
 # CTA final (tras negro)
 ("c33", 8, talk("Santiago", f"Close-up of {SAN} {COR}, looking straight into the camera with warmth and charisma, moving naturally: he runs a hand through his hair, nods, tilts his head, smiles and gestures with the old photograph in his hand.",
     ["¿Ustedes creen que Baltasar se va a quedar quieto?", "Denle me gusta y compartan para ver la segunda parte."], "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("stands very close in front of", "stands in front of"), ("he points at the floor", "he lowers his hand"),
        ("steps closer to", "faces"), ("his voice rises", "serious"), ("his voice breaks", "quiet voice"), ("sits sprawled on", "sits on"),
        ("he swallows, nervous", "worried"), ("furious", "upset"), ("crying", "with teary eyes"), ("with greed and", "with")]
# Reformulaciones para reintentos (cada uno con otra redacción)
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("camouflage jacket", "olive work jacket"), ("tequila", "water"), ("earpiece", "wristwatch"), ("torn at the shoulder", "worn"), ("dirty white", "white"),
        ("¡", ""), ("!", "."), ("quitar de en medio", "hacer a un lado"), ("lo vendió", "le falló"), ("trampa", "mala idea"), ("declarar", "contar")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican countryside, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{CIRILO}", "a 48-year-old Mexican ranch hand"),
         ("@{ROQUE}", "a 40-year-old Mexican assistant"),
         ("@{BALTASAR}", "a 62-year-old rich Mexican rancher")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Wide shot", "Medium wide shot")
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

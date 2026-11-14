"""Genera los clips de agua-hacienda PARTE 2 con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
         "No music, no subtitles, no text on screen.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync"
POR = "on the porch of the humble ranch @{LOC_PORCHE}, wooden bench, stone well in the yard, late afternoon light"
PORN = "on the porch of the humble ranch @{LOC_PORCHE} at dusk, a warm oil lamp on the wooden table, blue evening sky"
HAC = "in the dusty courtyard of the old hacienda @{LOC_HACIENDA}, the stone water trough completely dry and cracked, harsh afternoon sun"
COM = "at the old stone irrigation canal with a rusty metal sluice gate and a hand wheel @{LOC_COMPUERTA}, dry hills behind, clear morning light"
# Ropa de cada personaje para los bordes de cuadro y planos sobre el hombro (mismo personaje, misma ropa)
EZ = "@{EZEQUIEL_RICO} (beige suit, open-collar shirt, thick gold chain, fine black cowboy hat with a silver hatband, grey mustache)"
LU = "@{LUPITA_ABOGADA} (grey tailored suit, white blouse, small silver earrings, dark hair in a low bun)"
CH = "@{DON_CHUY_VIEJO} (wide palm sombrero, red bandana around the neck, faded green plaid shirt, white mustache)"
RO = "@{DONA_ROSA_VIEJA} (purple rebozo shawl, white hair in a thin braid, white apron)"
BE = "@{BETO} (light-blue shirt, navy-blue sweater vest, glasses)"
JAR = "the small clay jarrito with a faded painted flower @{LOC_JARRITO}"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Cara a cara en el porche (sigue del cliffhanger de la Parte 1) — hablando desde el frame 0, sin plano abierto
 ("c01", 10, talk("c01", "Lupita", f"Over-the-shoulder close-up of {LU} {POR}, she holds {JAR} in her left hand at her waist; in the LEFT foreground, the blurred back of the head and right shoulder of {EZ}, seen from behind. He stands still at the left edge the whole shot, his black hat always firmly on his grey head, head, hat and shoulder always together and fully visible.",
     "calm, firm, contained emotion")),
 ("c02", 8, talk("c02", "Ezequiel", f"Close-up of {EZ} {POR}, an arrogant half smile; in the RIGHT foreground, the blurred left shoulder and dark low bun of {LU}, seen from behind.",
     "arrogant, dismissive, slow")),
 ("c03", 8, talk("c03", "Lupita", f"Close-up of {LU} {POR}, chin up, steady eyes, both hands holding {JAR} at her waist.",
     "calm, confident, firm")),
 ("c04", 8, talk("c04", "Don Chuy", f"Medium close-up of {CH} standing at the edge of the porch {POR}, he takes one slow step forward and squints, his eyes fill with tears of recognition.",
     "old, trembling, amazed, very soft")),
 ("c05", 8, talk("c05", "Lupita", f"Close-up of {LU} {POR}, a teary smile, she lifts {JAR} slightly with both hands to show it.",
     "tender, emotional, warm")),
 ("c06", 8, talk("c06", "Doña Rosa", f"Close-up of {RO} {POR}, one hand on her chest, eyes shining with happy tears, smiling.",
     "old, tender, motherly")),
 ("c07", 8, talk("c07", "Ezequiel", f"Close-up of {EZ} {POR}, he laughs and adjusts the brim of his black hat with his right hand.",
     "mocking, laughing, arrogant")),
 ("c08", 8, talk("c08", "Lupita", f"Close-up of {LU} {POR}, a calm small smile, she does not blink.",
     "calm, quiet, sure of herself")),
 ("c09", 8, talk("c09", "Ezequiel", f"Close-up of {EZ} {POR}, he hooks his thumbs in his belt and smiles proudly.",
     "smug, slow, sure")),
 ("c10", 8, talk("c10", "Lupita", f"Over-the-shoulder close-up of {LU} {POR}; in the LEFT foreground, the blurred right shoulder and black hat of {EZ}, seen from behind.",
     "calm, final, firm")),
 ("r1", 4, f"Close-up of {EZ} {POR}, in silence, his proud smile slowly fades, he blinks, unsure. No dialogue."),
 # 2. El pozo no se secó solo
 ("c11", 8, talk("c11", "Beto", f"Medium shot of {BE} {POR}, he steps forward holding an open cream folder with printed photos of a closed metal gate on a stream.",
     "young professional, polite, a little nervous")),
 ("c12", 8, talk("c12", "Lupita", f"Close-up of {LU} {POR}, looking straight at Ezequiel off-screen, her hands calmly folded around {JAR}.",
     "calm, precise, cold")),
 ("c13", 8, talk("c13", "Ezequiel", f"Close-up of {EZ} {POR}, his smile gone, he shakes his head slowly. He says each sentence only once, clearly, without repeating any word.",
     "defensive, low, uneasy")),
 ("c14", 10, talk("c14", "Beto", f"Medium close-up of {BE} {POR}, he holds up one old printed document with an official stamp in both hands.",
     "polite, sure, steady")),
 ("c15", 8, talk("c15", "Don Chuy", f"Medium two-shot {POR}: {CH} holds the hand of {RO} on the wooden bench; he looks at the dry well, eyes wet.",
     "old, slow, sad, then a bitter little laugh")),
 ("c16", 8, talk("c16", "Ezequiel", f"Medium shot of {EZ} {POR}, he puts his black hat back on with both hands and turns toward his white pick-up truck, then looks back over his shoulder.",
     "low, cold, serious")),
 ("c17", 8, talk("c17", "Lupita", f"Close-up of {LU} {POR}, she holds his gaze, a calm half smile.",
     "calm, firm, quiet")),
 # 3. La compuerta (cama cálida)
 ("c18", 6, f"Wide shot {COM}: {CH}, {LU} and {BE} walk up to the closed rusty sluice gate; the stone canal below it is dry and full of dust. Don Chuy rests both hands on the iron wheel. No dialogue."),
 ("c19", 8, talk("c19", "Beto", f"Medium close-up of {BE} {COM}, with exactly the same face as his reference sheet: soft delicate face, short straight dark hair with a side fringe, thin round wire glasses; looking at the rusty iron wheel of the gate, rolling up his sleeves.",
     "friendly, polite")),
 ("c20", 10, talk("c20", "Don Chuy", f"Medium shot of {CH} {COM}, smiling, he turns the iron wheel of the sluice gate slowly with both hands; {LU} stands beside him on the right.",
     "old, warm, proud, with a little laugh")),
 ("c21", 6, f"Wide shot {COM}: the rusty gate slowly rises and clear water flows gently into the dry stone canal, sparkling in the morning sun; {CH} and {LU} watch it, smiling. No dialogue."),
 ("c22", 10, talk("c22", "Lupita", f"Close-up of {LU} {COM}, the clear water flowing behind her, happy tears in her eyes, a wide smile.",
     "emotional, soft, joyful")),
 ("c23", 10, talk("c23", "Doña Rosa", f"Medium shot of {RO} in the yard {POR}, she pulls the rope of the stone well and a wooden bucket comes up full of clear water; she smiles toward the sky.",
     "old, joyful, amazed")),
 # 4. La pila de Ezequiel se seca
 ("c24", 10, talk("c24", "Ezequiel", f"Medium shot of {EZ} {HAC}, looking down into the empty dry trough, talking to someone off-screen.",
     "surprised, worried, impatient")),
 ("c25", 8, talk("c25", "Ezequiel", f"Close-up of {EZ} {HAC}, he takes off his black hat and wipes his forehead with the back of his hand, looking at the dry ground.",
     "worried, low, tired")),
 # 5. Ezequiel pide agua (el pago)
 ("c26", 6, f"Wide shot {POR}: {EZ} walks up slowly holding his black hat in both hands against his chest and stops at the foot of the porch, in front of {LU} and {CH}. No dialogue."),
 ("c27", 10, talk("c27", "Ezequiel", f"Close-up of {EZ} {POR}, humble, holding his black hat in both hands at his chest, eyes lowered.",
     "humble, quiet, ashamed")),
 ("c28", 10, talk("c28", "Lupita", f"Over-the-shoulder close-up of {LU} {POR}; in the LEFT foreground, the blurred bare grey head and beige right shoulder of {EZ} (hat in his hands), seen from behind.",
     "soft, calm, without anger")),
 ("r2", 4, f"Close-up of {EZ} {POR}, in silence, holding his hat at his chest, he lowers his eyes, ashamed. No dialogue."),
 ("c29", 10, talk("c29", "Don Chuy", f"Close-up of {CH} {POR}, he looks at Lupita off-screen with a gentle smile and nods slowly.",
     "old, warm, calm")),
 ("c30", 10, talk("c30", "Lupita", f"Clean frame with NO captions or burned-in subtitles. Medium two-shot {POR}: {LU} fills {JAR} with water from the wooden well bucket and holds it out with both hands to {EZ}, who stands on the right holding his black hat at his chest: he is the same 60-year-old man as his reference sheet, grey hair, thick grey mustache, gold chain, beige suit.",
     "calm, warm, serene")),
 ("c31", 8, talk("c31", "Ezequiel", f"Close-up of {EZ} {POR}, holding {JAR} full of water in both hands, his eyes wet.",
     "voice breaking, humble, low")),
 ("c32", 8, talk("c32", "Lupita", f"Close-up of {LU} {POR}, a serene look, a small nod.",
     "calm, kind, then firm")),
 ("c33", 8, talk("c33", "Ezequiel", f"Medium shot of {EZ} {POR}, he drinks from {JAR}, lowers his head and gives it back with both hands.",
     "humble, quiet, sincere")),
 ("c34", 10, f"Medium two-shot {POR}: {RO} hugs {LU}, then holds her face with both hands. Rosa {VOICE}, old tender voice: \"{L['c34'][0]}\" Then a short pause. Then Lupita answers, smiling with happy tears: \"{L['c34'][1]}\""),
 # 6. Nuevo gancho (al anochecer)
 ("c35", 10, talk("c35", "Beto", f"Medium shot of {BE} seated at the wooden table {PORN}, reading a yellowed old property document under the oil lamp, then looking up.",
     "careful, intrigued, a little nervous")),
 ("c36", 6, talk("c36", "Lupita", f"Close-up of {LU} {PORN}, she turns her head toward Beto off-screen, {JAR} in her hands.",
     "curious, soft")),
 ("c37", 8, talk("c37", "Lupita", f"Close-up of {LU} {PORN}, she freezes, her eyes go wide and fill with tears, she holds {JAR} against her chest. Slow push-in to her face.",
     "a whisper, stunned")),
 # CTA con carisma (después del BLACK)
 ("c38", 8, talk("c38", "Lupita", f"Close-up of {LU} {POR}, looking straight into the camera with a warm confident half smile, moving naturally: she tucks a loose strand of hair behind her ear, tilts her head, lifts {JAR} a little and nods.",
     "confident, warm, playful, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("tears of recognition", "emotion"), ("happy tears", "shining eyes"), ("eyes fill with tears", "eyes shine"), ("eyes wet", "eyes shining"),
        ("his eyes wet", "his eyes shining"), ("wipes his forehead with the back of his hand", "rubs his forehead")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("mocking", "amused"), ("arrogant", "proud"), ("ashamed", "quiet"), ("official stamp", "seal"), ("juez", "licenciado"),
        ("¡", ""), ("!", "."), ("escuincla", "muchacha"), ("remate", "venta"), ("matar", "lastimar"), ("muerto", "perdido")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican countryside, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{EZEQUIEL_RICO}", "a 60-year-old Mexican rancher with a thick grey mustache"),
         ("@{BETO}", "a 30-year-old Mexican man with short hair and glasses")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Wide shot", "Medium wide shot")
    if k >= 4:  # cambiar el personaje: sin imagen de referencia, descripción civil (la ropa ya va entre paréntesis)
        for a, b in NOREF: body = body.replace(a, b)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
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

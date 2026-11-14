"""Genera los clips de medalla-mezcal PARTE 2 con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# Geografía del portón (fija en toda la escena): Fausto DENTRO del portón, a la IZQUIERDA del cuadro; Severo FUERA, a la DERECHA.
POR = "at the big open wooden gate of the mezcal ranch @{LOC_PORTON}, sunset light, dust in the air"
PORN = "at the big wooden gate of the mezcal ranch @{LOC_PORTON} at night, a warm lantern hanging on the stone wall, dark blue sky"
MEZ = "in the yard of the rustic mezcal distillery @{LOC_MEZCALERA}, last warm light of sunset, smoke from the earth oven"
# Ropa de cada personaje (bordes de cuadro y planos sobre el hombro: mismo personaje, misma ropa)
AR = "@{ARREOLA} (short grey beard, tan palm cowboy hat with a dark leather band, cream linen guayabera shirt, brown leather belt, dark blue jeans)"
MA = "@{HEROINA} (long dark hair in one braid, faded torn denim jacket over a dusty white t-shirt, yellow bandana tied on her left wrist, worn jeans)"
NI = "@{CAPORAL} (faded red baseball cap, light khaki work shirt with rolled sleeves, black walkie-talkie on his belt, brown work pants)"
SE = "@{SEVERO} (no hat, short black hair, thick black moustache, black zip-up work vest over a blue denim shirt, black jeans, a thin silver chain with half of a broken San Judas medal on his chest)"
SE0 = "@{SEVERO} (no hat, short black hair, thick black moustache, black zip-up work vest over a blue denim shirt, black jeans, nothing around his neck: no chain, no medal)"  # después de entregar su mitad (i2)
TO = "@{TOBIAS} (reddish-blond stubble, straw cowboy hat, khaki work shirt with rolled sleeves, aviator sunglasses hanging from the collar, radio on the chest pocket, jeans)"
TOH = "@{TOBIAS} (bare head with short reddish-blond hair, reddish-blond stubble, khaki work shirt with rolled sleeves, aviator sunglasses hanging from the collar, radio on the chest pocket, jeans)"  # sombrero en la mano: un solo sombrero
MED = "@{PROP_MEDALLA}"
CMED = "complete round silver San Judas medal (the two broken halves joined, a thin crack line across it, plain silver, no ribbon, no colors)"
RING = "the silver horse-head ring @{PROP_ANILLO}"
MEN = "about ten unarmed men in plain dark civilian clothes, both hands empty and relaxed at their sides, nothing in their hands, standing still by black pickup trucks"
TOWN = "about twenty adult villagers, men and women in simple everyday clothes, straw hats and rebozos, standing calmly"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

def duo(cid, desc, a, ta, b, tb):
    """Clip de dos personajes: a dice la línea 0, b la línea 1."""
    return f"{desc} {a} {VOICE}, {ta}: \"{L[cid][0]}\" Then a short pause. Then {b} answers, {tb}: \"{L[cid][1]}\""

CLIPS = [
 # 1. Cara a cara en el portón (sigue del cliffhanger de la Parte 1) — hablando desde el frame 0, sin plano abierto
 ("c01", 10, talk("c01", "Fausto", f"Over-the-shoulder close-up of {AR} {POR}, standing still and firm just inside the gate; in the RIGHT foreground, the blurred back of the head and left shoulder of {SE}, seen from behind. Fausto says each sentence only once, clearly, without repeating any phrase.",
     "deep, calm, hard")),
 ("c02", 8, talk("c02", "Severo", f"Over-the-shoulder close-up of {SE} {POR}, standing just outside the gate, a slow mocking half smile; in the LEFT foreground, the blurred right shoulder and tan palm hat of {AR}, seen from behind.",
     "raspy, slow, mocking")),
 ("c03", 6, talk("c03", "Fausto", f"Close-up of {AR} {POR}, eyes narrowing, not moving.",
     "low, cold")),
 ("c04", 8, talk("c04", "Severo", f"Close-up of {SE} {POR}, his right fingers resting on the half medal on his chain {MED}, a cold satisfied smile.",
     "slow, raspy, sure of himself")),
 ("r1", 4, f"Close-up of {AR} {POR}, in silence, his jaw tightens and a flash of doubt crosses his eyes. No dialogue."),
 ("c05", 10, talk("c05", "Marisol", f"Medium shot of {MA} {POR}, she walks up from inside the ranch and stops beside the gate, on the right of {AR}, holding her half medal {MED} tight in her right hand.",
     "trembling but firm, brave")),
 ("c06", 8, talk("c06", "Severo", f"Close-up of {SE} {POR}, looking at Marisol off-screen, a slow cold smile, he tilts his head.",
     "raspy, slow, amused")),
 ("c07", 8, duo("c07", f"Medium two-shot {POR}: {AR} on the LEFT turns his head to {MA} on the RIGHT, beside him inside the gate.",
     "Fausto", "low, protective, firm", "Marisol", "firm, chin up")),
 ("c08", 8, talk("c08", "Marisol", f"Close-up of {MA} {POR}, looking straight at Severo off-screen, eyes shining, chin up.",
     "firm, defiant, steady")),
 ("c09", 8, talk("c09", "Severo", f"Close-up of {SE} {POR}, with his right hand he lifts the half medal on his silver chain {MED} so it catches the sunset light, smiling.",
     "slow, proud, raspy")),
 ("i1", 6, f"Extreme close-up insert {POR}: the thin silver chain on the black vest and blue denim shirt of {SE}, with half of a broken San Judas medal {MED}, jagged edge visible, swinging slightly in the sunset light. No dialogue."),
 ("c10", 10, talk("c10", "Fausto", f"Close-up of {AR} {POR}, staring at the medal off-screen, his eyes shining with emotion, then hard again.",
     "deep, moved, then demanding")),
 ("c11", 8, talk("c11", "Severo", f"Close-up of {SE} {POR}, he lets the medal fall back on his chest and shrugs slowly.",
     "cold, slow, dismissive")),
 # 2. Las medallas se juntan (el pago)
 ("c12", 10, talk("c12", "Marisol", f"Close-up of {MA} {POR}, she holds out her half medal {MED} on her open right palm toward Severo off-screen.",
     "firm, clear, emotional")),
 ("c13", 8, talk("c13", "Severo", f"Close-up of {SE} {POR}, his smile gone, he turns his head to speak to someone behind him.",
     "cold, impatient, low")),
 ("c14", 8, talk("c14", "Nicanor", f"Medium shot of the foreman {NI} {POR}, he walks up to the gate and points with his open hand toward the dirt road.",
     "rough, alert, a little relieved")),
 ("c15", 6, f"Wide shot {POR}: on the dirt road behind the black pickup trucks, {TOWN}, walk up slowly and stop to watch, in a separate group behind the trucks; {MEN} turn their heads toward them. No dialogue."),
 ("c16", 8, talk("c16", "Fausto", f"Close-up of {AR} {POR}, a calm small smile. Clean single shot: he is alone in the frame, nobody in the foreground, no shoulders or hats at the edges.",
     "calm, firm, deep")),
 ("c17", 10, talk("c17", "Severo", f"Close-up of {SE} {POR}, he glances at the villagers, forces a smile, and with both hands slowly unclasps the thin silver chain from his neck.",
     "forced calm, slow, raspy")),
 ("i2", 6, f"Extreme close-up insert {POR}: the open right palm of {MA} holds ONE HALF of a broken silver San Judas medal {MED} (a half-moon piece with a jagged broken edge); the fingers of {SE0} place the OTHER matching half beside it, jagged edge against jagged edge, in the same plane, not on top; the two halves join into one {CMED}, glinting in the sunset. Only two half pieces, never two whole medals. No dialogue."),
 ("c18", 10, talk("c18", "Marisol", f"Close-up of {MA} {POR}, she turns the complete medal over in her right hand and reads the fine engraving on the back, her eyes fill with tears of joy.",
     "a soft whisper, then emotional and clear")),
 ("c19", 8, talk("c19", "Fausto", f"Close-up of {AR} {POR}, he lifts his chin, his eyes shining, speaking loud to the villagers off-screen.",
     "deep, proud, emotional")),
 ("r2", 4, f"Close-up of {SE0} {POR}, in silence, his cold smile slowly fades, he swallows, unsure. No dialogue."),
 ("c20", 8, talk("c20", "Marisol", f"Close-up of {MA} {POR}, holding the {CMED} against her chest with both hands, looking straight at Severo off-screen.",
     "quiet, firm, without fear")),
 # 3. Tobías dice la verdad
 ("c21", 8, duo("c21", f"Medium two-shot outside the gate {POR}: {SE0} on the LEFT turns toward {TO} on the RIGHT, next to a black pickup truck; Tobías does not move.",
     "Severo", "cold, impatient", "Tobías", "quiet, decided")),
 ("c22", 10, talk("c22", "Tobías", f"Medium shot of {TO} {POR}, he takes off his straw cowboy hat and holds it at his chest with both hands, looking at the villagers off-screen.",
     "serious, sincere, voice heavy with guilt")),
 ("c23", 6, talk("c23", "Marisol", f"Close-up of {MA} {POR}, her eyes wide, the complete medal in her right hand.",
     "soft, stunned")),
 ("c24", 8, talk("c24", "Tobías", f"Close-up of {TOH} {POR}, bare head, his only straw hat held at his chest in both hands, eyes lowered, then he looks up at her.",
     "humble, quiet, ashamed")),
 ("c25", 8, talk("c25", "Severo", f"Close-up of {SE0} {POR}, looking sideways at Tobías off-screen, his jaw tight.",
     "low, cold, menacing")),
 ("c26", 8, talk("c26", "Tobías", f"Medium shot of {TO} {POR}, he steps away from the black truck and stands next to the villagers, hat in his hands.",
     "calm, firm, decided")),
 ("c27", 6, f"Wide shot {POR}: one by one, {MEN} lower their heads and walk away from {SE0} toward the villagers; Severo is left standing alone by his black pickup truck. No dialogue."),
 ("c28", 8, talk("c28", "Severo", f"Close-up of {SE0} {POR}, alone, without his chain, a cold look toward Fausto and Marisol off-screen.",
     "slow, cold, raspy, menacing")),
 ("c29", 8, talk("c29", "Fausto", f"Close-up of {AR} {POR}, he does not blink.",
     "calm, absolute, deep")),
 ("c30", 6, f"Wide shot {POR}: {SE0} gets into his black pickup truck alone and drives away slowly down the dirt road, raising dust; the villagers watch him go. No dialogue."),
 # 4. Bienvenida (cama cálida)
 ("c31", 10, duo("c31", f"Medium two-shot {MEZ}: {AR} on the LEFT takes {RING} and slides it onto the right ring finger of {MA} on the RIGHT, golden backlight.",
     "Fausto", "deep, warm, emotional", "Marisol", "teary, smiling, soft")),
 ("c32", 8, talk("c32", "Marisol", f"Close-up of {MA} {MEZ}, looking at {RING} on her right ring finger and at the {CMED} resting in her right palm, a teary smile.",
     "soft, emotional, tender")),
 ("c33", 8, talk("c33", "Fausto", f"Close-up of {AR} {MEZ}, a warm smile, he puts his hand on her shoulder off-screen and nods slowly.",
     "deep, warm, gentle")),
 ("c34", 8, duo("c34", f"Medium two-shot {MEZ}: {NI} on the RIGHT, cap in his hand, speaks to {AR} on the LEFT.",
     "Nicanor", "respectful, friendly", "Fausto", "warm, firm, proud")),
 # 5. Nuevo gancho (de noche en el portón)
 ("c35", 10, talk("c35", "Tobías", f"Medium close-up of {TO} {PORN}, his only straw hat on his head, his hands empty at his sides, speaking quietly to Marisol off-screen.",
     "low, careful, a secret")),
 ("c36", 6, talk("c36", "Marisol", f"Close-up of {MA} {PORN}, the complete medal hanging on a chain around her neck, she frowns, confused.",
     "soft, confused, worried")),
 ("c37", 10, talk("c37", "Tobías", f"Close-up of {TO} {PORN}, he looks around and leans a little closer.",
     "a low whisper, sure")),
 ("c38", 8, talk("c38", "Marisol", f"Close-up of {MA} {PORN}, she freezes, her eyes go wide and fill with tears, her right hand closes around the medal at her neck. Slow push-in to her face.",
     "a whisper, stunned")),
 # CTA con carisma (después del BLACK)
 ("c39", 8, talk("c39", "Marisol", f"Close-up of {MA} {MEZ}, looking straight into the camera with a warm confident half smile, moving naturally: she tucks a loose strand of hair behind her ear, tilts her head, lifts the complete medal {MED} on her chain a little toward the lens and nods once.",
     "warm, intimate, confident, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("eyes fill with tears of joy", "eyes shine with joy"), ("eyes fill with tears", "eyes shine"), ("teary, smiling", "smiling"),
        ("a teary smile", "a soft smile"), ("forces a smile", "smiles politely"), ("points with his open hand", "gestures with his open hand")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("mocking", "amused"), ("defiant", "steady"), ("guilt", "regret"), ("ashamed", "quiet"), ("jaw tight", "serious face"),
        ("¡", ""), ("!", "."), ("a la fuerza", "sin permiso"), ("te llevaste a mi hermano", "perdí a mi hermano por ti"), ("matar", "lastimar"), ("muerto", "perdido")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican countryside, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

NOREF = [("@{SEVERO}", "a 50-year-old Mexican man with short black hair and a thick black moustache"),
         ("@{TOBIAS}", "a 38-year-old Mexican man with sunburnt skin and reddish-blond stubble")]
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

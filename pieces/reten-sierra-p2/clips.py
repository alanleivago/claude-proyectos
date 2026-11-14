"""Genera los clips de reten-sierra PARTE 2 (El Retén) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# Assets que de verdad muestran a la persona/lugar correcto (Parte 1 tuvo hojas corridas): cabina = @{LOC_SIERRA}, sierra = @{LOC_MONTE},
# Teodoro = @{DONTEO}, reloj = @{PROP_LEONTINA}, troca roja = @{PROP_CAMIONETA}, Garza = @{GARZAVERDE}, Pineda = @{SOLDADOFLACO}.
# Retén = @{LOC_PUESTOVERDE} (hoja nueva: pickups verde olivo sin letreros; LOC_GARITA tenía la patrulla "POLICÍA ESTATAL").
# Geografía del retén (fija): Candelaria a la IZQUIERDA del cuadro (la troca roja detrás de ella), Garza a la DERECHA (Pineda y las vallas detrás de él).
RET = "on the mountain road at the roadblock @{LOC_PUESTOVERDE}, orange-and-white road barriers, olive-green pickup trucks, pines and red rocks, warm late afternoon light, dust in the air"
CAB = "inside the cab of the old red pickup truck @{LOC_SIERRA}, warm late afternoon light through the dusty windshield"
DUSK = "on the hillside above the mountain road @{LOC_MONTE} at dusk, a small campfire, ranch pickup trucks parked behind, deep orange sky"
# QA v1: las cintas de nombre salían con letras inventadas ("KONY", "LO.M. LMATO") -> uniforme liso sin letras
# Ropa de cada personaje (bordes de cuadro y planos sobre el hombro: mismo personaje, misma ropa que en la Parte 1)
CA = "@{CANDELARIA} (63-year-old woman, cream felt cowboy hat with a turquoise band, long silver braid over her right shoulder, emerald-green blouse under a dark brown suede jacket)"
GA = "@{GARZAVERDE} (heavyset 52-year-old man, thick black horseshoe moustache, mirrored aviator sunglasses, olive-green woodland camouflage uniform shirt and matching camouflage cap, plain uniform without name tapes or lettering)"
# QA v1: después de c21 Garza tiene los lentes en la mano (nunca puestos) -> GA0
GA0 = "@{GARZAVERDE} (heavyset 52-year-old man, thick black horseshoe moustache, NO sunglasses on his face, olive-green woodland camouflage uniform shirt and matching camouflage cap, plain uniform without name tapes or lettering)"
EM = "@{EMILIANO} (24-year-old man, thin, curly black hair, round wire-rimmed glasses, orange-and-white checked flannel shirt over a grey t-shirt)"
PI = "@{SOLDADOFLACO} (29-year-old man, very thin, big ears, olive-green woodland camouflage uniform and matching camouflage cap, plain uniform without name tapes or lettering)"
TE = "@{DONTEO} (58-year-old foreman, huge bushy white beard, black felt cowboy hat, red neckerchief, denim jacket with a sheepskin collar)"
# QA v1: Teodoro salió con el sombrero puesto Y otro en las manos (c36, c38) -> TE0 = sin sombrero en la cabeza, un solo sombrero en las manos
TE0 = "@{DONTEO} (58-year-old foreman, huge bushy white beard, bare head with messy white hair and NO hat on his head, red neckerchief, denim jacket with a sheepskin collar, holding his only black felt cowboy hat against his chest with both hands)"
WATCH = "the gold pocket watch @{PROP_LEONTINA}"
TRUCK = "the old red pickup truck @{PROP_CAMIONETA}"
# QA v1: c18 salió con rifles -> manos vacías y a la vista, sin cargar nada
MEN = "about eight adult men in olive-green camouflage jackets and caps, both hands empty and visible, arms relaxed at their sides, carrying nothing, standing still by three olive-green pickup trucks"
COWS = "cowboys on horseback and ranch pickup trucks waiting calmly in the background"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Recapitulación y llegan los hombres de Garza (sigue del cliffhanger: el radio dijo "ya vamos llegando") — hablando desde el frame 0
 ("c01", 10, talk("c01", "Candelaria", f"Over-the-shoulder close-up of {CA} {RET}, standing on the road on the LEFT, holding {WATCH} closed in her hand; in the RIGHT foreground, the blurred back and camouflage cap of {GA}, seen from behind.",
     "deep, calm, firm")),
 ("c02", 10, talk("c02", "Garza", f"Over-the-shoulder close-up of {GA} {RET}, standing on the RIGHT, the black radio on his chest pocket, a slow cold smile; in the LEFT foreground, the blurred back of {CA} seen from behind (cream hat, silver braid, brown suede jacket).",
     "raspy, slow, arrogant")),
 ("c03", 6, f"Wide shot {RET}: three olive-green pickup trucks arrive slowly down the road in a cloud of dust and stop behind the barriers; {MEN} step out and stand still behind {GA}. {COWS}. No dialogue."),
 ("c04", 8, talk("c04", "Emiliano", f"Close-up of {EM} at the wheel {CAB}, looking through the dusty windshield at the olive-green pickup trucks ahead, worried.",
     "nervous, low, fast")),
 ("c05", 8, talk("c05", "Candelaria", f"Close-up of {CA} {RET}, she glances back toward the red truck behind her, then looks ahead again, perfectly calm.",
     "calm, warm to her grandson, then firm")),
 ("c06", 10, talk("c06", "Garza", f"Medium shot of {GA} {RET}, standing in front of the barriers, {MEN} behind him, chin up, proud again.",
     "loud, slow, arrogant")),
 ("c07", 8, talk("c07", "Teodoro", f"Medium shot of the foreman {TE} {RET}, standing beside his ranch pickup truck, cowboys on horses calm behind him, looking toward his boss off-screen.",
     "rough, low, loyal")),
 ("c08", 8, talk("c08", "Candelaria", f"Close-up of {CA} {RET}, she raises one open hand slightly to calm her people, without looking away from Garza off-screen.",
     "firm, calm, commanding")),
 # 2. El reloj: el pago
 ("c09", 8, talk("c09", "Candelaria", f"Close-up of {CA} {RET}, she lifts {WATCH} by its short gold chain so it catches the sunlight, eyes fixed on Garza off-screen.",
     "slow, deep, sure")),
 ("c10", 8, talk("c10", "Garza", f"Close-up of {GA} {RET}, a forced dismissive smile, but his eyes stay on the watch off-screen.",
     "dismissive, raspy")),
 ("i1", 6, f"Extreme close-up insert {RET}: the weathered hands of {CA} open the engraved lid of {WATCH}; the gold catches the warm sunlight, the chain swings slightly. No dialogue."),
 ("c11", 10, talk("c11", "Candelaria", f"Close-up of {CA} {RET}, holding the open gold pocket watch, her eyes shining but hard.",
     "slow, low, very clear")),
 ("r1", 6, f"Close-up of {GA} {RET}, in silence, his smile disappears, he swallows and freezes, his eyes drop to the ground. Slow push-in. No dialogue."),
 ("c12", 8, talk("c12", "Garza", f"Close-up of {GA} {RET}, uneasy, he turns his head toward the small guard booth behind him.",
     "low, worried, then hard")),
 ("c13", 8, talk("c13", "Pineda", f"Medium shot of the thin soldier {PI} {RET}, he takes one step forward from behind the barriers, hands at his sides, nervous but decided.",
     "high-pitched, nervous, honest")),
 ("c14", 8, talk("c14", "Garza", f"Close-up of {GA} {RET}, he turns to look at Pineda off-screen, surprised and hurt.",
     "surprised, bitter")),
 ("c15", 8, talk("c15", "Pineda", f"Close-up of the thin soldier {PI} {RET}, his camouflage cap stays on his head, his empty hands clasped in front of him, eyes on Garza off-screen.",
     "quiet, sincere, a little scared")),
 ("c16", 8, talk("c16", "Pineda", f"Medium close-up of the thin soldier {PI} {RET}, he walks slowly to stand beside {CA}, on her right.",
     "firm, honest, voice trembling a little")),
 # 3. Garza se queda solo
 ("c17", 8, talk("c17", "Garza", f"Medium shot of {GA} {RET}, he turns toward {MEN} behind him and gestures with his open hand toward the cattle trucks.",
     "loud, impatient")),
 ("c18", 6, f"Wide shot {RET}: {MEN} look at each other, nobody moves toward the cattle trucks; one by one they step back to their olive-green pickup trucks; {GA} is left standing alone in front of the barriers. No dialogue."),
 ("c19", 10, talk("c19", "Garza", f"Close-up of {GA} {RET}, alone, looking around at his men off-screen, his pride breaking.",
     "bitter, disbelieving, then cold")),
 ("c20", 10, talk("c20", "Candelaria", f"Over-the-shoulder close-up of {CA} {RET}, she takes one step closer; in the RIGHT foreground, the blurred back and camouflage cap of {GA}, seen from behind.",
     "low, firm, then painful")),
 # QA v2: c21 v2 se quita los lentes y a los 3.8 s le reaparecen en la cara (morph) -> sin lentes desde el primer fotograma (GA0), sin gesto
 ("c21", 10, talk("c21", "Garza", f"Close-up of {GA0} {RET}, his eyes bare and visible for the whole shot, his folded sunglasses held low in one hand at his belt, he never lifts them, his eyes tired and old, looking down.",
     "low, tired, sincere")),
 ("c22", 8, talk("c22", "Candelaria", f"Close-up of {CA} {RET}, eyes locked on him, the open gold pocket watch in her hand.",
     "quiet, sharp")),
 ("c23", 10, talk("c23", "Garza", f"Close-up of {GA0} {RET}, sunglasses in his hand, the barriers and the guard booth behind him, he looks toward the pine hills.",
     "low, heavy, slow")),
 ("c24", 8, talk("c24", "Candelaria", f"Close-up of {CA} {RET}, golden backlight, her eyes shining, her hand closes around the gold pocket watch.",
     "a whisper, then painful and firm")),
 ("c25", 8, talk("c25", "Garza", f"Close-up of {GA} {RET}, sunglasses in his hand, ashamed, he cannot hold her look.",
     "low, broken, honest")),
 ("c26", 10, talk("c26", "Candelaria", f"Medium shot of {CA} {RET}, she straightens her cream hat, then turns her head toward Pineda off-screen.",
     "calm, absolute, deep")),
 ("c27", 6, talk("c27", "Pineda", f"Medium shot of the thin soldier {PI} {RET}, with a small smile he slides one orange-and-white barrier aside, opening the road.",
     "relieved, polite")),
 ("c28", 8, talk("c28", "Garza", f"Close-up of {GA0} {RET}, his camouflage cap stays on his head, his folded sunglasses in his hand, he looks straight at her.",
     "low, tired, then serious")),
 ("c29", 8, talk("c29", "Garza", f"Over-the-shoulder close-up of {GA} {RET}, he leans a little closer and lowers his voice; in the LEFT foreground, the blurred back of {CA} seen from behind (cream hat, silver braid, brown suede jacket).",
     "a low secret voice, slow")),
 ("r2", 6, f"Close-up of {CA} {RET}, in silence, her face goes still, she slowly turns her head to look at Teodoro off-screen; the foreman blurred far behind her. No dialogue."),
 ("c30", 6, f"Wide shot {RET}: {GA} gets alone into one olive-green pickup truck and drives slowly away down the mountain road; the barriers are open and {TRUCK} followed by two white cattle trucks with wooden rails passes through. No dialogue."),
 # 4. Momento cálido (cabina, ya del otro lado del retén)
 ("c31", 8, talk("c31", "Emiliano", f"Close-up of {EM} at the wheel {CAB}, driving, a wide relieved smile, glancing at his grandmother beside him.",
     "happy, emotional, young voice")),
 ("c32", 8, talk("c32", "Candelaria", f"Close-up of {CA} in the passenger seat {CAB}, golden backlight with a soft lens flare, holding the open gold pocket watch, a soft smile and shining eyes.",
     "soft, tender, emotional")),
 ("c33", 8, talk("c33", "Emiliano", f"Close-up of {EM} at the wheel {CAB}, his smile fades, he glances at her, unsure.",
     "careful, low")),
 ("c34", 8, talk("c34", "Candelaria", f"Close-up of {CA} in the passenger seat {CAB}, she snaps the gold pocket watch shut and looks ahead at the road.",
     "calm, firm, decided")),
 # 5. Gancho nuevo (de noche en la loma)
 ("c35", 8, talk("c35", "Candelaria", f"Medium close-up of {CA} {DUSK}, the firelight on her face, looking at Teodoro off-screen.",
     "low, serious, firm")),
 ("c36", 8, talk("c36", "Teodoro", f"Close-up of the foreman {TE0} {DUSK}, eyes lowered, then he looks up at her.",
     "rough, low, full of regret")),
 ("c37", 6, talk("c37", "Candelaria", f"Close-up of {CA} {DUSK}, she frowns, the firelight flickering on her face.",
     "a whisper, worried")),
 ("c38", 8, talk("c38", "Teodoro", f"Close-up of the foreman {TE0} {DUSK}, a long breath before he speaks.",
     "a low whisper, heavy")),
 ("r3", 6, f"Close-up of {CA} {DUSK}, in silence, her eyes go wide, her hand closes around {WATCH} at her chest. Slow push-in to her face. No dialogue."),
 # CTA con carisma (después del BLACK)
 ("c39", 8, talk("c39", "Candelaria", f"Close-up of {CA} {RET}, looking straight into the camera with charisma, {WATCH} in one hand; she adjusts the brim of her hat with two fingers, tilts her head slightly, a knowing half smile, nods once and gestures toward the camera with her free open hand as she talks, natural organic movement like a telenovela star talking to her audience.",
     "warm, intimate, confident, a little playful, talking directly to the viewer")),
]

# Flow rechaza policías/uniformes oficiales con placa, niños y llanto exagerado: siempre se suaviza desde el 1er intento.
# Garza y Pineda van de camuflaje verde olivo (como la ref de atrium y la Parte 1), nunca de policía con placa.
SAFE = [("police checkpoint", "roadblock"), ("eyes fill with tears", "eyes shine"), ("eyes shining but hard", "eyes steady"),
        ("ashamed", "quiet"), ("his pride breaking", "unsure"), ("disbelieving", "surprised")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("arrogant", "proud"), ("bitter", "sad"), ("broken", "quiet"), ("regret", "sadness"), ("soldier", "man"),
        ("¡", ""), ("!", "."), ("no a golpes", "con calma"), ("arrepentir", "acordar"), ("se lo llevaron rumbo al monte", "se lo llevaron lejos"),
        ("mi cárcel", "mi castigo"), ("se lo juro", "créame"), ("matar", "lastimar"), ("muerto", "perdido")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican countryside, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa (camuflaje verde olivo, nunca policía con placa) sigue descrita entre paréntesis
NOREF = [("@{GARZAVERDE}", "a heavyset bald Mexican man"), ("@{SOLDADOFLACO}", "a thin Mexican man")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Wide shot", "Medium wide shot")
    if k >= 4:
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

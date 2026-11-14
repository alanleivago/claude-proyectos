"""Genera los clips de camionero PARTE 1 (El Camionero) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
Diálogos en lines.json (fuente única). Uso: python -I clips.py [ID ...]   -> imprime "FIN P1" al terminar la tanda.
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
         "No music. Clean frame, no captions, no subtitles, no text on screen, no name tags, no lettering on clothes.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / reten-sierra-p2: subtítulos quemados -> se agrega al final de cada clip con diálogo (queda también en el prompt mínimo del intento 6)
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA agua-hacienda-p2 c29 / chocolate-rancho-p2 c34 / medalla-mezcal-p2 c01: frase repetida al final -> silencio tras la última palabra
END = "After the last word the person stays silent until the end of the shot."
# QA padre-veladoras-p2 / agua-hacienda-p2: con alguien de espaldas en el borde, la cámara se corre y queda un sombrero/cuerpo flotando, y en canasta P1 c12
# la persona del borde se convirtió en otra -> SOLO primeros planos limpios de una persona (SOLO), mirando al otro fuera de cuadro. Nada de over-the-shoulder.
# Geografía fija:
#   Andén (c01-c09, r1, c21-c33): Teófilo y Lalo a la IZQUIERDA frente al tráiler blanco; Clemente y Fidel a la DERECHA junto a los anaqueles;
#                                  Leonor y Nayeli al CENTRO (Leonor mira a la IZQ. a Teófilo y a la DER. a Clemente).
#   Cuarto de monitores (c10-c12, i1): la pared de monitores y Nayeli sentada al escritorio a la IZQUIERDA; Leonor y Teófilo de pie a la DERECHA.
#   Pasillo (c13-c16, r2): la puerta de metal gris cerrada a la DERECHA con Clemente y Fidel; Leonor y Teófilo a la IZQUIERDA.
#   Cuarto de cajas (c17-c20): la pila de cajas y Nayeli a la IZQUIERDA; Leonor y Teófilo al CENTRO; Clemente a la DERECHA en la puerta abierta.
AND = ("at the loading dock @{LOC_ANDENCARGA} of a Mexican distribution warehouse, one white semi-trailer backed into the dock door on the LEFT side, "
       "tall metal shelves with brown cardboard boxes on the RIGHT side, grey concrete floor, cool fluorescent ceiling light; no extras, nobody else on the dock besides the people described")
MON = ("in the small security monitor room @{LOC_SALAMONITORES} of the warehouse, a wall of monitors on the LEFT side, each screen showing only grey 2D security-camera footage "
       "displayed INSIDE the screen rectangle (tiny figures between shelves, nothing comes out of any screen, no readable text, no labels), a desk with a keyboard, dim cool light; "
       "no extras, nobody else in the room")
PAS = ("in a long warehouse aisle @{LOC_PASILLORACKS} with tall orange and dark blue pallet racks, yellow metal safety railings, a closed grey metal door on the RIGHT side, "
       "cool fluorescent light; no extras, nobody else in the aisle")
CUA = ("inside the small side storeroom @{LOC_CUARTOCAJAS} of the warehouse, bare grey walls, dusty empty metal shelves, the open grey metal door on the RIGHT side, "
       "one hanging ceiling lamp; no extras, nobody else in the room")
# Anclas de identidad y ropa (las de la ref con colores cambiados). Sin dedo acusador: manos abiertas. QA reten-sierra-p2: cintas de nombre con letras
# inventadas -> gafetes blancos lisos. QA reten/medalla P2: dos gorras/sombreros -> una sola gorra puesta. Víctor (ref) cambió a blazer en un plano -> Clemente nunca lleva saco.
TEO = ("@{TEOFILO_TRAILERO} (60-year-old Mexican mestizo man, thick grey-black moustache, one single dark green trucker cap with a tan mesh back worn on his head and no second cap anywhere, "
       "blue and black plaid flannel shirt open over a white t-shirt, blue jeans, his hands open and empty)")
LEO = ("@{LEONOR_DIRECTORA} (48-year-old Mexican mestizo woman, shoulder-length wavy dark brown hair, light camel blazer, royal blue silk blouse, "
       "one thin silver chain with a small round silver pendant, small silver hoop earrings, her hands open, she never points a finger at anyone)")
CLE = ("@{CLEMENTE_BODEGUERO} (46-year-old Mexican mestizo man, slicked-back black hair, short black moustache and goatee, dark navy long-sleeve shirt with no jacket and no blazer, "
       "dark green tie, a plain blank white ID card with nothing written on it on a black lanyard, his hands open and kept low, he never points a finger at anyone)")
NAY = ("@{NAYELI_MONITOREO} (32-year-old Mexican mestizo woman, black hair in a neat low bun, lavender blouse, black trousers, "
       "a plain blank white ID card with nothing written on it on a grey lanyard)")
LAL = ("@{LALO_CHALECO} (26-year-old Mexican mestizo man, short black hair, clean-shaven, plain orange safety vest with silver reflective stripes and no lettering, "
       "over a navy blue t-shirt, his hands empty)")
FID = ("@{FIDEL_CARGADOR} (36-year-old Mexican mestizo man, short black hair, short black beard, dark grey quilted vest over a maroon hoodie, "
       "dark work trousers, his hands empty unless described)")
# QA padre-veladoras-p2 (MEDAL) / medalla-mezcal-p2 / reten-sierra-p2: utilería duplicada -> cada objeto, uno solo
CLIP = ("her one single clipboard holding two loose typed sheets of paper, the typed text too small to read, no logo")
KEY = "one single small silver key"
BOXES = ("one single stack of ten sealed brown cardboard boxes with plain white labels, nothing on the labels can be read, no logos")
# QA padre-veladoras-p2 (RUF_SOLO): planos de una sola persona, sin nadie en primer plano ni en los bordes
SOLO = "nobody in the foreground and nobody at the edges of the frame"
look = lambda who, side: f"{SOLO}, looking at {who} off-screen to the {side}"
# QA camionero v1: c04, c16, c25 y c30 con alguien de espaldas/de perfil en el borde y c05 con una doble de Nayeli en primer plano, mientras hablan
# desde el inicio -> plano de una sola persona (ONE + ALONE) y mirada a un lado SIN nombrar al otro personaje (gaze), como en regreso-20 v2.
# c33: parche de la gorra con letras legibles en primer plano -> gorra lisa (PLAINCAP).
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
PLAINCAP = "the cap is completely plain, with no patch, no logo, no picture and no letters on it"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB}"

CLIPS = [
 # 1. Gancho / conflicto en el andén: Leonor llega hablando desde el frame 0 (sin plano abierto)
 ("c01", 8, talk("c01", "Leonor", f"Close-up of {LEO} {AND}, standing in the CENTER, serious and firm, one open hand turned up toward the trucker, {look('Clemente', 'RIGHT')}.",
     "firm, indignant, controlled")),
 ("c02", 8, talk("c02", "Clemente", f"Close-up of {CLE} {AND}, standing on the RIGHT by the shelves, a confident half smile, both hands open low, {look('Leonor', 'LEFT')}.",
     "smooth, confident, a little arrogant")),
 ("c03", 10, talk("c03", "Teófilo", f"Close-up of {TEO} {AND}, standing on the LEFT in front of the white trailer, frowning, hurt and dignified, {look('Leonor', 'RIGHT')}.",
     "hurt, firm, tired")),
 ("c04", 6, talk("c04", "Leonor", f"Close-up of {LEO} {AND}, standing in the CENTER, calm and serious, {gaze('LEFT')}; {ONE}; {ALONE}.",
     "calm, serious, fair")),
 # 2. Las dos hojas
 ("c05", 8, talk("c05", "Nayeli", f"Close-up of {NAY} {AND}, standing in the CENTER holding {CLIP} low in front of her, she glances down at it, then up, {gaze('LEFT')}; {ONE}; {ALONE}; no other woman in a lavender blouse anywhere.",
     "clear, careful, professional")),
 ("c06", 6, talk("c06", "Clemente", f"Close-up of {CLE} {AND}, standing on the RIGHT, he shrugs with both hands open low, {look('Leonor', 'LEFT')}.",
     "dismissive, quick")),
 ("c07", 8, talk("c07", "Teófilo", f"Close-up of {TEO} {AND}, standing on the LEFT in front of the white trailer, eyes shining, chin up, one open hand on his chest, {look('Clemente', 'RIGHT')}.",
     "hurt, proud, firm")),
 ("r1", 6, f"Close-up of {CLE} {AND}, standing on the RIGHT, in silence, he looks away and adjusts his tie with one hand; {SOLO}. Slow push-in. No dialogue."),
 # 3. El testigo
 ("c08", 8, talk("c08", "Lalo", f"Close-up of {LAL} {AND}, standing on the LEFT near the white trailer, he takes a small step forward, serious and honest, {look('Leonor', 'RIGHT')}.",
     "honest, a little shy, firm")),
 ("c09", 8, talk("c09", "Leonor", f"Close-up of {LEO} {AND}, standing in the CENTER, decisive, she turns her head to the RIGHT and then to the LEFT toward Teófilo; {SOLO}.",
     "decisive, firm, fair")),
 # 4. Cuarto de monitores (monitores y Nayeli IZQUIERDA; Leonor y Teófilo DERECHA)
 ("c10", 8, talk("c10", "Nayeli", f"Close-up of {NAY} {MON}, sitting at the desk on the LEFT in front of the monitors, she gestures with one open hand toward the screens, then {look('Leonor', 'RIGHT')}.",
     "focused, careful, then surprised")),
 ("i1", 6, f"Close-up {MON}: one monitor fills the frame, showing grey 2D security-camera footage INSIDE the screen rectangle: a small distant man in a dark grey vest pushes a hand cart with "
           f"a few brown cardboard boxes away down a warehouse aisle; nothing comes out of the screen, no readable text, no timestamps, no people in the room visible. No dialogue."),
 ("c11", 6, talk("c11", "Teófilo", f"Close-up of {TEO} {MON}, standing on the RIGHT, the glow of the screens on his face, relieved and indignant, {look('the monitors', 'LEFT')}.",
     "indignant, relieved")),
 ("c12", 8, talk("c12", "Leonor", f"Close-up of {LEO} {MON}, standing on the RIGHT, the glow of the screens on her face, serious, {look('the monitors', 'LEFT')}.",
     "serious, cold, realizing")),
 # 5. El cuarto cerrado (puerta, Clemente y Fidel DERECHA; Leonor y Teófilo IZQUIERDA)
 ("c13", 6, talk("c13", "Leonor", f"Close-up of {LEO} {PAS}, standing on the LEFT, firm, one open hand turned toward the closed door, {look('Clemente', 'RIGHT')}.",
     "firm, demanding")),
 ("c14", 8, talk("c14", "Clemente", f"Close-up of {CLE} {PAS}, standing on the RIGHT next to the closed grey metal door, a forced smile, both hands open low, {look('Leonor', 'LEFT')}.",
     "nervous, defensive, fast")),
 ("c15", 6, talk("c15", "Fidel", f"Close-up of {FID} {PAS}, standing on the RIGHT, he lifts {KEY} a little between two fingers, serious, {look('Leonor', 'LEFT')}.",
     "quiet, decided")),
 ("c16", 6, talk("c16", "Clemente", f"Close-up of {CLE} {PAS}, standing on the RIGHT, upset, he holds out one open hand palm up asking for the key, {gaze('RIGHT')}; {ONE}; {ALONE}; no other man in a dark shirt anywhere.",
     "angry, low, insisting")),
 ("r2", 6, f"Medium shot {PAS}: {FID} turns {KEY} in the lock of the closed grey metal door on the RIGHT and slowly pushes the door open. Only Fidel appears in the whole shot. Slow push-in. No dialogue."),
 # Cuarto de cajas (pila y Nayeli IZQUIERDA; Leonor y Teófilo CENTRO; Clemente DERECHA en la puerta)
 ("c17", 8, talk("c17", "Nayeli", f"Close-up of {NAY} {CUA}, standing on the LEFT beside {BOXES}, she checks {CLIP} against a box label, then {look('Leonor', 'RIGHT')}.",
     "surprised, clear")),
 ("c18", 8, talk("c18", "Teófilo", f"Close-up of {TEO} {CUA}, standing in the CENTER, eyes shining, he shakes his head slowly, {look('Clemente', 'RIGHT')}.",
     "hurt, indignant, low")),
 ("c19", 6, talk("c19", "Leonor", f"Close-up of {LEO} {CUA}, standing in the CENTER, cold and firm, {look('Clemente', 'RIGHT')}.",
     "cold, firm, disappointed")),
 ("c20", 6, talk("c20", "Clemente", f"Close-up of {CLE} {CUA}, standing on the RIGHT in the open doorway, a nervous smile, both hands open low, {look('Leonor', 'LEFT')}.",
     "nervous, fake polite")),
 # 6-7. El giro, de vuelta en el andén
 ("c21", 8, talk("c21", "Fidel", f"Close-up of {FID} {AND}, standing on the RIGHT by the shelves, his head low, then he looks up, ashamed, {look('Leonor', 'LEFT')}.",
     "ashamed, low, honest")),
 ("c22", 6, talk("c22", "Clemente", f"Close-up of {CLE} {AND}, standing on the RIGHT, eyes wide, both hands open in front of his chest, {look('Leonor', 'LEFT')}.",
     "defensive, fast, nervous")),
 ("c23", 8, talk("c23", "Nayeli", f"Close-up of {NAY} {AND}, standing in the CENTER holding {CLIP}, serious, {look('Leonor', 'LEFT')}.",
     "serious, careful")),
 ("c24", 8, talk("c24", "Fidel", f"Close-up of {FID} {AND}, standing on the RIGHT, ashamed, his hands joined in front of him, {look('Leonor', 'LEFT')}.",
     "ashamed, quiet, sincere")),
 ("c25", 6, talk("c25", "Leonor", f"Close-up of {LEO} {AND}, standing in the CENTER, cold and calm, {gaze('RIGHT')}; {ONE}; {ALONE}.",
     "cold, calm, final")),
 ("c26", 6, talk("c26", "Clemente", f"Close-up of {CLE} {AND}, standing on the RIGHT, defeated, he lowers his eyes, his shoulders drop; {SOLO}.",
     "defeated, very low")),
 ("c27", 8, talk("c27", "Leonor", f"Close-up of {LEO} {AND}, standing in the CENTER, firm and controlled, {look('Clemente', 'RIGHT')}.",
     "firm, serious, controlled")),
 ("c28", 6, talk("c28", "Nayeli", f"Close-up of {NAY} {AND}, standing in the CENTER, polite and serious, she opens one hand toward the exit, {look('Clemente', 'RIGHT')}.",
     "polite, serious")),
 ("c29", 6, talk("c29", "Clemente", f"Close-up of {CLE} {AND}, standing on the RIGHT, bitter, {look('Teófilo', 'LEFT')}.",
     "bitter, upset, low")),
 # 8. Justicia (cama cálida)
 ("c30", 8, talk("c30", "Teófilo", f"Close-up of {TEO} {AND}, standing on the LEFT in front of the white trailer, calm and dignified, {gaze('RIGHT')}; {ONE}; {ALONE}.",
     "calm, dignified, firm")),
 ("c31", 6, talk("c31", "Leonor", f"Close-up of {LEO} {AND}, standing in the CENTER, a sincere warm look, one hand on her chest, {look('Teófilo', 'LEFT')}.",
     "sincere, warm, humble")),
 # Gancho nuevo para la Parte 2
 ("c32", 8, talk("c32", "Fidel", f"Close-up of {FID} {AND}, standing on the RIGHT, he steps closer and lowers his voice, worried, {look('Leonor', 'LEFT')}.",
     "low, worried, slow")),
 ("r3", 6, f"Close-up of {LEO} {AND}, standing in the CENTER, in silence, her warm look slowly disappears and her eyes open wide, she stays still; {SOLO}. Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK): Teófilo solo junto a su tráiler, a cámara
 ("c33", 10, talk("c33", "Teófilo", f"Close-up of {TEO} {AND}, alone, standing in front of his white trailer, looking straight into the camera and talking to the viewer from the very first second, "
     f"with warmth and charisma, his lips moving clearly; while he speaks he adjusts his cap, nods, tilts his head, smiles and gestures with one open hand toward his trailer. "
     f"The dock behind him is empty, no other people; {PLAINCAP}.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("disbelieving", "surprised"), ("defensive", "serious"),
        ("ashamed", "humble"), ("stammering", "quiet"), ("fake polite", "polite"), ("forced", "small"), ("eyes wide", "eyes open"), ("eyes open wide", "eyes open"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("disappointed", "serious"), ("nervous", "quiet"), ("cold", "serious"), ("bitter", "serious"),
        ("arrogant", "proud"), ("indignant", "serious"), ("defeated", "quiet"), ("security-camera", "video"), ("security monitor room", "monitor room"),
        ("¡", ""), ("!", "."), ("a escondidas", "sin avisar"), ("escondidas", "guardadas"), ("echar la culpa", "culpar")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, modern Mexican warehouse, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican workplace drama, cool natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{TEOFILO_TRAILERO}", "a Mexican truck driver"), ("@{LEONOR_DIRECTORA}", "a Mexican company director"),
         ("@{CLEMENTE_BODEGUERO}", "a Mexican warehouse manager"), ("@{NAYELI_MONITOREO}", "a Mexican office clerk"),
         ("@{LALO_CHALECO}", "a Mexican warehouse worker"), ("@{FIDEL_CARGADOR}", "a Mexican warehouse loader")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Extreme close-up insert", "Close-up").replace("Medium wide shot", "Medium shot")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo (END y NOSUB quedan, van después del diálogo)
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:  # entorno explícito y tope de 10 min por llamada (flow.js ya corta a los 90 s por video)
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
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
    print("FIN P1", flush=True)

if __name__ == "__main__":
    main()

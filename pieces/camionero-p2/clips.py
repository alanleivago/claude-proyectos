"""Genera los clips de camionero PARTE 2 (El Camionero) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
         "No music. Clean frame, no captions, no subtitles, no text on screen, no name tags, no lettering on clothes.")
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, clear lip sync, says each sentence only once with no repetitions"
# QA hacienda-sangre-p2 / chocolate-rancho-p2 / reten-sierra-p2 / buen-hijo-p2 c27 / regreso-20 c25 / gardenia c20: subtítulos quemados -> al final de cada clip con diálogo
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
# QA regreso-20 c14/c22/c28 / agua-hacienda-p2 / medalla-mezcal-p2: 2.a frase perdida o palabra repetida -> silencio tras la última palabra
END = "After the last word the person stays silent until the end of the shot."
# QA camionero c04/c05/c16/c25/c30, posada, regreso-20, regreso-chicago-p2: dobles, nucas y hombros en los bordes mientras hablan desde el inicio
# -> SOLO primeros planos limpios de una persona (ONE + ALONE) y mirada a un lado SIN nombrar al otro personaje (gaze). Nada de over-the-shoulder.
# QA regreso-20 c26 / gardenia c20: personajes que entran caminando -> ALONE ("already in place from the very first frame").
# Geografía fija (la de la Parte 1):
#   Andén (c01-c07, r1, c12-c28, CTA c29): Teófilo y Lalo a la IZQUIERDA frente al tráiler blanco (miran a la DER.);
#     Fidel e Iván a la DERECHA junto a los anaqueles (miran a la IZQ.); Leonor y Nayeli al CENTRO (Leonor mira a la IZQ. a Teófilo y a la DER. a Iván/Fidel).
#   Cuarto de monitores (c08-c11, i1): la pared de monitores y Nayeli sentada a la IZQUIERDA; Leonor, Teófilo y Fidel de pie a la DERECHA (miran a la IZQ.).
AND = ("at the loading dock @{LOC_ANDENCARGA} of a Mexican distribution warehouse, one white semi-trailer backed into the dock door on the LEFT side, "
       "tall metal shelves with brown cardboard boxes on the RIGHT side, grey concrete floor, cool fluorescent ceiling light; no extras, nobody else on the dock besides the person described")
MON = ("in the small security monitor room @{LOC_SALAMONITORES} of the warehouse, a wall of monitors on the LEFT side, each screen showing only grey 2D security-camera footage "
       "displayed INSIDE the screen rectangle (tiny figures, nothing comes out of any screen, no readable text, no labels), a desk with a keyboard, dim cool light; "
       "no extras, nobody else in the room")
# Anclas de identidad y ropa (hojas de la Parte 1 + IVAN_SOBRINO nueva). Manos abiertas, nadie señala.
# QA camionero c33 (letras en el parche de la gorra) / reten / medalla P2 (dos gorras): una sola gorra, lisa, en TODOS los planos de Teófilo.
PLAINCAP = "the cap is completely plain, with no patch, no logo, no picture and no letters on it"
TEO = ("@{TEOFILO_TRAILERO} (60-year-old Mexican mestizo man, thick grey-black moustache, one single dark green trucker cap with a tan mesh back worn on his head and no second cap anywhere, "
       f"{PLAINCAP}, blue and black plaid flannel shirt open over a white t-shirt, blue jeans, his hands open and empty)")
LEO = ("@{LEONOR_DIRECTORA} (48-year-old Mexican mestizo woman, shoulder-length wavy dark brown hair, light camel blazer, royal blue silk blouse, "
       "one thin silver chain with a small round silver pendant, small silver hoop earrings, her hands open and empty, she never points a finger at anyone)")
NAY = ("@{NAYELI_MONITOREO} (32-year-old Mexican mestizo woman, black hair in a neat low bun, lavender blouse, black trousers, "
       "a plain blank white ID card with nothing written on it on a grey lanyard)")
LAL = ("@{LALO_CHALECO} (26-year-old Mexican mestizo man, short black hair, clean-shaven, plain orange safety vest with silver reflective stripes and no lettering, "
       "over a navy blue t-shirt, his hands empty)")
FID = ("@{FIDEL_CARGADOR} (36-year-old Mexican mestizo man, short black hair, short black beard, dark grey quilted vest over a maroon hoodie, "
       "dark work trousers, his hands empty)")
# QA buen-hijo-p2 c26 / sazon-concha c09: ropa cambiada -> ropa explícita; Iván sin saco, sin corbata, sin gafete.
IVA = ("@{IVAN_SOBRINO} (34-year-old Mexican mestizo man, short black hair neatly combed to the side, clean-shaven, no moustache, no beard, "
       "light sky blue long-sleeve dress shirt with no tie and no jacket, charcoal grey trousers, brown leather belt, silver wristwatch, no ID card and no lanyard, "
       "his hands open and empty, he never points a finger at anyone)")
# QA padre-veladoras-p2 c30 / sazon-concha i1 / regreso-chicago-p2 c11 (dos camionetas): utilería duplicada o inventada -> nada en las manos salvo la tabla de Nayeli
CLIP = "There is only ONE clipboard in the whole shot, held by her, with two loose typed sheets, the typed text too small to read, no logo"
NOPROP = "There is no paper, phone, key, cup or box in anyone's hands"
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {END} {NOSUB}"

def shot(person, place, where, action, side, prop=NOPROP):
    return f"Close-up of {person} {place}, {where}, {action}, {gaze(side)}; {ONE}; {ALONE}. {prop}."

T_AND = "standing on the LEFT in front of the white trailer"
L_AND = "standing on the LEFT near the white trailer"
C_AND = "standing in the CENTER of the dock"
R_AND = "standing on the RIGHT by the shelves"
N_MON = "sitting at the desk on the LEFT in front of the monitors"
R_MON = "standing on the RIGHT, the glow of the screens on the face"

CLIPS = [
 # 1. El nombre: sigue en el mismo segundo de P1 c32/r3 (Leonor habla desde el frame 0, sin plano abierto)
 ("c01", 10, talk("c01", "Leonor", shot(LEO, AND, C_AND, "serious and hurt, her voice low, one open hand on her chest", "RIGHT"),
     "serious, low, hurt; she says the first long sentence in one breath, every word clear and complete")),
 ("c02", 8, talk("c02", "Fidel", shot(FID, AND, R_AND, "his head low, then he looks up, humble and sincere", "LEFT"),
     "low, humble, sincere")),
 ("c03", 8, talk("c03", "Leonor", shot(LEO, AND, C_AND, "she shakes her head slowly, surprised, not wanting to believe it", "RIGHT"),
     "surprised, firm, a little hurt")),
 ("c04", 8, talk("c04", "Teófilo", shot(TEO, AND, T_AND, "calm and serious, one open hand on his chest", "RIGHT"),
     "calm, serious, sincere")),
 ("c05", 8, talk("c05", "Lalo", shot(LAL, AND, L_AND, "honest, a little shy, he nods", "RIGHT"),
     "honest, a little shy, firm")),
 ("c06", 6, talk("c06", "Leonor", shot(LEO, AND, C_AND, "decisive, she turns her head", "LEFT"),
     "decisive, firm")),
 ("c07", 8, talk("c07", "Nayeli", shot(NAY, AND, C_AND, "holding the clipboard low in front of her, she glances down at it, then up; no other woman in a lavender blouse anywhere", "LEFT", CLIP),
     "clear, careful, professional")),
 # 2. Cuarto de monitores (monitores y Nayeli IZQ.; Leonor, Teófilo y Fidel DER.)
 ("c08", 8, talk("c08", "Nayeli", shot(NAY, MON, N_MON, "she gestures with one open hand toward the screens, focused", "RIGHT"),
     "focused, clear")),
 ("i1", 6, f"Close-up {MON}: one monitor fills the frame, showing grey 2D night footage INSIDE the screen rectangle: a grey pickup truck parked by a back gate "
           f"and two small distant figures loading a few brown cardboard boxes into it; the truck seen from the side with its license plate area blank; dark night sky; nothing comes out of the screen; "
           f"the screen shows only the grey image, with no date, no time, no numbers and no letters anywhere on the screen or its frame; static shot, no zoom; no people in the room visible. No dialogue."),
 ("c09", 6, talk("c09", "Fidel", shot(FID, MON, R_MON, "humble, his hands joined in front of him", "LEFT"),
     "low, humble")),
 ("c10", 8, talk("c10", "Leonor", shot(LEO, MON, R_MON, "her eyes shining, sad and disappointed, she breathes slowly", "LEFT"),
     "sad, disappointed, quiet")),
 ("c11", 6, talk("c11", "Teófilo", shot(TEO, MON, R_MON, "kind and sincere, a small sad smile", "LEFT"),
     "kind, sincere, gentle")),
 # 3. Iván en el andén (Iván DER.)
 ("r1", 6, f"Close-up of {IVA} {AND}, {R_AND}, in silence, confident, a half smile, he adjusts the cuff of his shirt, {gaze('LEFT')}; {ONE}; {ALONE}. {NOPROP}. Slow push-in. No dialogue."),
 ("c12", 8, talk("c12", "Iván", shot(IVA, AND, R_AND, "relaxed and confident, a half smile, both hands open low", "LEFT"),
     "relaxed, confident, a little arrogant")),
 ("c13", 8, talk("c13", "Leonor", shot(LEO, AND, C_AND, "cold and firm, her hands open and low", "RIGHT"),
     "cold, firm, controlled")),
 ("c14", 8, talk("c14", "Iván", shot(IVA, AND, R_AND, "a forced smile, both hands open in front of his chest", "LEFT"),
     "nervous, fast, fake polite")),
 ("c15", 8, talk("c15", "Fidel", shot(FID, AND, R_AND, "serious and humble, he shakes his head slowly", "LEFT"),
     "quiet, firm, sincere")),
 ("c16", 8, talk("c16", "Nayeli", shot(NAY, AND, C_AND, "holding the clipboard low in front of her, calm and serious; no other woman in a lavender blouse anywhere", "RIGHT", CLIP),
     "calm, clear, slow, every word said once")),
 ("c17", 6, talk("c17", "Iván", shot(IVA, AND, R_AND, "his smile slowly disappears, worried, both hands open", "LEFT"),
     "worried, quiet, fast")),
 ("c18", 6, talk("c18", "Leonor", shot(LEO, AND, C_AND, "very calm and serious, her eyes shining", "RIGHT"),
     "calm, serious, hurt")),
 ("c19", 10, talk("c19", "Iván", shot(IVA, AND, R_AND, "his confident face breaks, bitter, he lowers his eyes and then looks up", "LEFT"),
     "bitter, low, honest at last")),
 ("c20", 8, talk("c20", "Teófilo", shot(TEO, AND, T_AND, "calm and dignified, chin up", "RIGHT"),
     "calm, dignified, firm")),
 # 4. Payoff (cálida desde c21)
 ("c21", 8, talk("c21", "Leonor", shot(LEO, AND, C_AND, "firm and calm, her eyes shining", "RIGHT"),
     "firm, calm, sad")),
 ("c22", 6, talk("c22", "Iván", shot(IVA, AND, R_AND, "humble, his hands joined in front of him", "LEFT"),
     "quiet, humble")),
 ("c23", 8, talk("c23", "Leonor", shot(LEO, AND, C_AND, "a sad calm look, one hand on her heart", "RIGHT"),
     "sad, calm, firm")),
 ("c24", 8, talk("c24", "Leonor", shot(LEO, AND, C_AND, "a warm sincere smile, she turns her head", "LEFT"),
     "warm, sincere, respectful")),
 ("c25", 8, talk("c25", "Teófilo", shot(TEO, AND, T_AND, "his eyes shining, a proud humble smile, one open hand on his chest", "RIGHT"),
     "moved, proud, warm")),
 ("c26", 6, talk("c26", "Lalo", shot(LAL, AND, L_AND, "a big happy smile, he nods", "RIGHT"),
     "happy, warm, cheerful")),
 # 5. Gancho nuevo (suspenso desde c27)
 ("c27", 8, talk("c27", "Iván", shot(IVA, AND, R_AND, "serious, his voice low, a small cold smile", "LEFT"),
     "low, serious, slow, says each sentence only once, never repeats words")),
 ("c28", 6, talk("c28", "Leonor", shot(LEO, AND, C_AND, "her warm smile disappears, she stays still, her eyes open wide", "RIGHT"),
     "quiet, surprised, slow")),
 # CTA con carisma (después del BLACK): Teófilo solo junto a su tráiler, a cámara
 ("c29", 10, talk("c29", "Teófilo", f"Close-up of {TEO} {AND}, alone, standing in front of his white trailer, looking straight into the camera and talking to the viewer from the very first second, "
     f"his lips moving clearly from the first frame; with warmth and charisma, while he speaks he adjusts his cap, nods, tilts his head, smiles and gestures with one open hand toward his trailer. "
     f"The dock behind him is empty, no other people; {ONE}. {NOPROP}.",
     "warm, charismatic, a little playful, talking directly to the viewer")),
]

# Flow rechaza gestos bruscos y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("tears", "shining eyes"), ("his voice breaks", "quiet voice"), ("furious", "upset")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "serious"), ("threatening", "serious"),
        ("tense", "serious"), ("angry", "upset"), ("rage", "annoyance"), ("shouting", "speaking firmly"), ("yelling", "speaking firmly"),
        ("shocked", "surprised"), ("shock", "surprise"), ("cold", "serious"), ("bitter", "serious"), ("arrogant", "proud"), ("hurt", "sad"),
        ("forced", "small"), ("fake polite", "polite"), ("nervous", "quiet"), ("disappointed", "serious"), ("eyes open wide", "eyes open"),
        ("breaks", "changes"), ("young", "adult"), ("teenager", "adult"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"),
        ("security-camera", "video"), ("security monitor room", "monitor room"), ("loading a few brown cardboard boxes into it", "next to a few brown cardboard boxes"),
        ("¡", ""), ("!", "."), ("y culpó a don Teófilo", "y dijo que fue don Teófilo"), ("cargar con la culpa", "quedar mal"), ("lastimar a la gente", "hacer daño"),
        ("se tapaba la cara con la capucha", "llevaba la capucha puesta"), ("sacarlas", "moverlas")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, modern Mexican warehouse, cinematic soft light, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican workplace drama, cool natural light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{TEOFILO_TRAILERO}", "a Mexican truck driver"), ("@{LEONOR_DIRECTORA}", "a Mexican company director"),
         ("@{NAYELI_MONITOREO}", "a Mexican office clerk"), ("@{LALO_CHALECO}", "a Mexican warehouse worker"),
         ("@{FIDEL_CARGADOR}", "a Mexican warehouse loader"), ("@{IVAN_SOBRINO}", "a Mexican office manager")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Extreme close-up", "Close-up").replace("Medium wide shot", "Medium shot")
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
    print("FIN P2", flush=True)

if __name__ == "__main__":
    main()

"""Genera los clips de hacienda-sangre con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
SALA = "in the grand living hall of the hacienda @{LOC_ESTANCIA}, oil paintings of horses, dark wooden beams, two maids in aprons blurred in the background, soft window light"
BUF = "in the lawyer's office @{LOC_BUFETE}, a wall of law books, a wooden desk with folders, soft cool window light"
REC = "in the rustic bedroom @{LOC_RECAMARA}, white plaster walls, a wooden crucifix, an open brown suitcase on the bed, soft warm window light"
RAN = "on the porch of the small humble ranch @{LOC_RANCHITO}, wooden posts, horses in a corral and dry hills behind, warm golden morning light"
BAN = "in the elegant old lobby @{LOC_BANCO}, dark marble counter, potted plants, cool even light"

def talk(who, desc, lines, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in lines)
    return f"{desc} {who} {VOICE}, {tone}, saying: {said}"

CLIPS = [
 # 1. Gancho: la prueba de sangre en la sala, delante del servicio — sin plano abierto, hablando desde el frame 0
 ("c01", 8, talk("Octavio", f"Over-the-shoulder medium shot {SALA}: @{{OCTAVIO}} holds up a folded white document in front of @{{MATEO}}, who is seen from behind and blurred in the foreground; Octavio frowns, cold and proud.",
     ["Aquí está la prueba, Mateo. No eres de mi sangre.", "Treinta años engañado en mi propia casa."], "hard, cold, contemptuous")),
 ("c02", 8, talk("Mateo", f"Close-up of @{{MATEO}} {SALA}, tears running down his face; in the foreground, the blurred shoulder and silver-grey hair of @{{OCTAVIO}} seen from behind (charcoal-brown three-piece suit).",
     ["Papá, yo no sabía nada.", "Yo soy el mismo de siempre."], "broken, crying, pleading")),
 ("c03", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} {SALA}, standing very straight, he drops the white document on the floor in front of him.",
     ["No me digas papá.", "Tienes hasta mañana para irte de esta hacienda."], "slow, icy, final")),
 ("c04", 8, talk("Teresa", f"Close-up of @{{TERESA}} {SALA}, eyes full of tears, hands pressed together at her chest.",
     ["Octavio, por favor.", "Él no tiene la culpa de nada."], "crying, pleading")),
 ("c05", 8, talk("Octavio", f"Close-up of @{{OCTAVIO}} {SALA}, he points his finger at Teresa off-screen, jaw tight.",
     ["Y tú no me hables, Teresa.", "Contigo voy a arreglar cuentas después."], "low, cold, contained anger")),
 # 2. El despacho del abogado: la hacienda no es suya
 ("c06", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} standing {BUF}, a white document in his hand, the blurred tan shoulder of the lawyer in the foreground.",
     ["Arturo, quiero a Mateo fuera del testamento.", "Hoy mismo. No quiero que herede ni un metro."], "commanding, impatient")),
 ("c07", 8, talk("Arturo", f"Medium shot of the lawyer @{{ARTURO}} seated {BUF}, an open cream folder in his hands, he looks up over his glasses.",
     ["Don Octavio, eso no se puede.", "La hacienda no está a su nombre."], "careful, polite, nervous")),
 ("c08", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} {BUF}, leaning forward with both hands flat on the wooden desk, furious.",
     ["¿Cómo que no? Es mi hacienda.", "Treinta años levantándola con mis manos."], "loud, indignant")),
 ("c09", 10, talk("Arturo", f"Medium shot of @{{ARTURO}} {BUF}, his finger pointing at a paragraph in the open folder.",
     ["Era de su suegro, Don Isauro.", "Y en su testamento se la heredó a su nieto. Mateo Cárdenas."], "calm, precise")),
 ("r1", 6, f"Close-up profile of @{{OCTAVIO}} {BUF}, in silence, he freezes, his face goes pale, he stops breathing for a moment. No dialogue."),
 ("c10", 8, talk("Arturo", f"Medium shot of @{{ARTURO}} standing {BUF}, reading aloud from a single white sheet.",
     ["Aquí dice: para mi nieto Mateo, el que crió mi Teresa.", "No dice nada de sangre, Don Octavio."], "reading slowly, then firm")),
 ("c11", 8, talk("Octavio", f"Close-up of @{{OCTAVIO}} {BUF}, jaw clenched, staring at the sheet, eyes narrowing.",
     ["Don Isauro sabía algo.", "Y nadie me avisó."], "through clenched teeth, low")),
 # 3. La recámara: despedida (cama cálida)
 ("c12", 8, talk("Teresa", f"Close-up of @{{TERESA}} {REC}, crying softly, the blurred olive-green shoulder of Mateo packing in the foreground.",
     ["No te vayas así, mi amor.", "Esta también es tu casa."], "soft, broken, tender")),
 ("c13", 8, talk("Mateo", f"Medium shot of @{{MATEO}} {REC}, folding a shirt into the open suitcase, eyes wet.",
     ["Ya escuchaste, mamá.", "Para él, yo nunca fui nada."], "quiet, hurt")),
 ("c14", 10, talk("Teresa", f"Medium shot of @{{TERESA}} and @{{MATEO}} (wearing his olive-green corduroy jacket over a navy t-shirt, exactly as in his reference sheet) {REC}, she places the small carved wooden figurine of a farmer with a plough and two oxen @{{PROP_SANISIDRO}} into Mateo's hands, holding his hands with hers.",
     ["Toma. Era de tu abuelo Isauro.", "Lo cargaba a todas partes. Él te quería más que a nadie."], "tender, through tears")),
 ("c15", 8, talk("Mateo", f"Medium shot of @{{MATEO}} {REC}, holding the small wooden saint figurine @{{PROP_SANISIDRO}}, a sad smile.",
     ["Mi abuelo decía que San Isidro cuida al que siembra.", "Ahora me toca sembrar en otro lado."], "soft, sad, with a small smile")),
 # 4. El ranchito de Nicanor: el refugio (cama cálida)
 ("c16", 8, talk("Nicanor", f"Medium shot of the old cowboy @{{DONNICO}} {RAN}, smiling, pouring coffee from a blue enamel pot into a white mug, a brown suitcase on the wooden floor.",
     ["Siéntate, muchacho. El café está recién hecho.", "Sabía que ibas a venir."], "warm, raspy, kind")),
 ("c17", 8, talk("Mateo", f"Medium shot of @{{MATEO}} seated on a bench {RAN}, holding a white mug of coffee with both hands, surprised.",
     ["¿Cómo que sabía, Don Nicanor?", "Si ni yo sabía a dónde iba."], "puzzled, tired")),
 ("c18", 10, talk("Nicanor", f"Close-up of @{{DONNICO}} {RAN}, his smile fades, serious, looking straight at Mateo.",
     ["Tu abuelo me lo pidió antes de morir.", "Si un día lo corren, ábrele la puerta. Esa tierra es de él."], "slow, serious, warm")),
 # 5. La recámara vacía: Teresa le planta cara (vuelve el suspenso)
 ("c19", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} in the doorway {REC}, the suitcase is gone and the bed is empty, a cold half smile.",
     ["¿Ya se fue?", "Qué bueno. Uno menos en esta casa."], "cold, arrogant")),
 ("c20", 8, talk("Teresa", f"Over-the-shoulder close-up of @{{TERESA}} {REC}, arms crossed, chin up, the blurred grey shoulder of Octavio in the foreground.",
     ["Te lo advirtió mi papá.", "Que tu soberbia te iba a costar caro."], "firm, cold, defiant")),
 ("c21", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} {REC}, taking a step toward her, raising his voice.",
     ["¿Me vas a decir quién es el padre?", "Tengo derecho a saberlo."], "angry, loud")),
 ("r2", 6, f"Medium shot of @{{TERESA}} {REC}, in silence, arms crossed, she holds his gaze without blinking. No dialogue."),
 ("c22", 8, talk("Teresa", f"Close-up of @{{TERESA}} {REC}, eyes locked on Octavio, perfectly calm.",
     ["Eso lo va a saber Mateo primero.", "Tú perdiste ese derecho hoy en la mañana."], "quiet, firm, cutting")),
 # 6. El banco: la revelación
 ("c23", 8, talk("Quintero", f"Medium shot of the bank manager @{{QUINTERO}} behind the marble counter {BAN}, hands folded on a folder, the blurred grey shoulder of Octavio in the foreground.",
     ["Don Octavio, revisé los papeles de la hacienda.", "No podemos darle el préstamo."], "polite, uncomfortable")),
 ("c24", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} {BAN}, a proud smile that fades into doubt.",
     ["¿Cómo que no? Tengo veinte años con ustedes.", "Esa tierra vale el triple de lo que pido."], "arrogant, then unsure")),
 ("c25", 10, talk("Quintero", f"Medium shot of @{{QUINTERO}} (the same man from his reference sheet: clean-shaven, slate-grey suit, light-blue tie) {BAN}, holding up a single printed sheet toward Octavio.",
     ["La propiedad está a nombre de Mateo Cárdenas.", "Desde hoy, nada se mueve sin su firma."], "calm, careful")),
 ("r3", 6, f"Close-up of @{{OCTAVIO}} {BAN}, in silence, his eyes open wide, he slowly leans back from the counter. No dialogue."),
 ("c26", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} {BAN}, one hand on the marble counter, anguished.",
     ["Eso no puede ser.", "Yo puse esa tierra de garantía en todos mis créditos."], "shaken, losing control")),
 ("c27", 10, talk("Quintero", f"Medium shot of @{{QUINTERO}} (the same man from his reference sheet: clean-shaven, slate-grey suit, light-blue tie) {BAN}, hands folded on the counter, serious.",
     ["Por eso le hablo, Don Octavio.", "Su plazo termina este viernes.", "Y el terreno ya no está a su nombre."], "polite, calm")),
 # 7. El ranchito: cara a cara con Nicanor
 ("c28", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} at the wheel of a shiny black pickup truck parked {RAN}, talking through the open driver window.",
     ["¿Dónde está Mateo, Nicanor?", "Sé que está aquí."], "angry, demanding")),
 ("c29", 8, talk("Nicanor", f"Medium shot of @{{DONNICO}} standing on the porch {RAN}, thumbs in his belt, a calm smile.",
     ["Buenos días, Don Octavio.", "Aquí no entra nadie sin pedir permiso."], "calm, amused")),
 ("c30", 8, talk("Octavio", f"Medium shot of @{{OCTAVIO}} (the same man from his reference sheet: silver-grey hair, grey moustache, charcoal-brown three-piece suit, burgundy tie) in the black pickup truck {RAN}, he points through the window.",
     ["Esa hacienda es mía.", "Dile que venga a hablar conmigo."], "loud, proud")),
 ("c31", 8, talk("Nicanor", f"Close-up of @{{DONNICO}} {RAN}, serene, eyes on the truck.",
     ["Ya no es suya, Don Octavio.", "Ahora usted es el que va a tocar la puerta."], "slow, calm, dry")),
 ("c32", 6, f"Medium shot of @{{MATEO}} standing on the porch {RAN}, a white mug in his hand, he watches the black pickup truck in silence, a calm look, then a small half smile. Slow push-in. No dialogue."),
 # CTA final (tras negro)
 ("c33", 8, talk("Mateo", f"Close-up of @{{MATEO}} (olive-green corduroy jacket over a navy t-shirt, exactly as in his reference sheet) {RAN}, looking straight into the camera with charisma, the small carved wooden figurine @{{PROP_SANISIDRO}} in one hand; he tilts his head slightly, a confident half smile, nods once, lifts the figurine a little and gestures toward the camera with his free hand as he talks, natural organic movement like a telenovela star talking to his audience.",
     ["¿Ustedes perdonarían a Don Octavio?", "Denle me gusta y compartan para ver la segunda parte."], "warm, intimate, confident, talking directly to the viewer")),
]

# Flow rechaza gestos agresivos y llanto exagerado: siempre se suavizan desde el 1er intento
SAFE = [("he points his finger at Teresa off-screen", "he raises his hand toward Teresa off-screen"), ("he points through the window", "he gestures through the window"),
        ("he drops the white document on the floor in front of him", "he lowers the white document"), ("tears running down his face", "teary eyes"),
        ("furious", "upset"), ("crying", "with teary eyes")]
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

NOREF = [("@{OCTAVIO}", "a 63-year-old Mexican man with grey hair combed back and a thick grey moustache, wearing a charcoal-brown three-piece suit with a burgundy tie and a white pocket square"),
         ("@{QUINTERO}", "a 38-year-old Mexican man with short black hair, clean-shaven, wearing a slate-grey suit with a light blue tie")]
TRIES = 6

def variant(body, k):
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

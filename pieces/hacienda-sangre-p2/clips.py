"""Genera los clips de hacienda-sangre PARTE 2 (La Hacienda) con Omni Flash por el Flow MCP (CLI), uno por uno. Salta los que ya existen.
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
# Assets verificados en hoja de contactos (chars/ de la Parte 1): OCTAVIO, MATEO, TERESA, ARTURO (abogado de lentes), DONNICO (= Nicanor, NO existe NICANOR),
# LOC_RANCHITO (porche de adobe con corral), PROP_SANISIDRO (figura de madera con arado y bueyes). Hojas nuevas: LOC_QUINQUE, PROP_SOBRELACRE.
# Geografía del porche (fija): la puerta y el porche a la IZQUIERDA del cuadro (Nicanor, Mateo y luego Teresa ahí); Octavio en el patio de tierra a la
# DERECHA, con su camioneta negra detrás. Sobre el hombro: en los planos del porche, Octavio de espaldas en el borde DERECHO; en los de Octavio,
# el del porche de espaldas en el borde IZQUIERDO.
# Interior de noche (LOC_QUINQUE): Mateo sentado a la IZQUIERDA de la mesa, Teresa sentada a la DERECHA, Arturo de pie en la puerta, a la DERECHA detrás de ella.
RAN = "on the porch of the small humble adobe ranch @{LOC_RANCHITO}, wooden posts, a wooden door, horses in a corral and dry hills behind, warm golden morning light"
YARD = "in the dirt yard in front of the small adobe ranch @{LOC_RANCHITO}, a shiny black pickup truck parked behind him, dry hills, warm golden morning light"
NIGHT = "inside the humble adobe ranch house at night @{LOC_QUINQUE}, a rough wooden table, a glowing oil lamp, warm amber lamplight and deep shadows"
# Ropa de cada personaje (bordes de cuadro y planos sobre el hombro: mismo personaje, misma ropa que en la Parte 1)
OC = "@{OCTAVIO} (63-year-old man, silver-grey hair combed back, thick grey moustache, charcoal-brown three-piece suit, burgundy tie, white pocket square)"
MA = "@{MATEO} (30-year-old man, short dark brown hair, light stubble, olive-green corduroy jacket open over a navy-blue t-shirt, dark jeans)"
TE = "@{TERESA} (56-year-old woman, dark hair with grey streaks in a low bun, small pearl earrings, pale sky-blue blouse, dark forest-green trousers)"
NI = "@{DONNICO} (76-year-old cowboy, short white beard, palm-straw cowboy hat, navy-blue bandana, dark grey suede vest over a faded light-blue shirt)"
AR = "@{ARTURO} (42-year-old lawyer, side-parted brown hair, clean-shaven, thin rectangular glasses, light tan suit, chocolate-brown tie)"
SAINT = "the small carved wooden figurine of a farmer with a plough and two oxen @{PROP_SANISIDRO}"
LETTER = "the cream envelope sealed with dark red wax @{PROP_SOBRELACRE}"
OC_BACK = "in the RIGHT foreground, the blurred back and silver-grey hair of " + OC + ", seen from behind"
PORCH_BACK = lambda who: "in the LEFT foreground, the blurred back of " + who + ", seen from behind"
# QA v1: c14, c19 y c33 salieron con subtítulos quemados (el texto del diálogo en pantalla) -> se repite en cada clip con diálogo
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"{desc} {who} {VOICE}, {tone}, saying: {said} {NOSUB}"

CLIPS = [
 # 1. Recapitulación y la puerta (sigue del cliffhanger: Nicanor no lo deja pasar) — hablando desde el frame 0
 ("c01", 10, talk("c01", "Nicanor", f"Over-the-shoulder close-up of {NI} {RAN}, standing on the porch on the LEFT, thumbs in his belt, calm; {OC_BACK}.",
     "slow, raspy, calm, a little amused")),
 ("c02", 8, talk("c02", "Octavio", f"Over-the-shoulder medium shot of {OC} standing {YARD} on the RIGHT, chin up, proud; {PORCH_BACK(NI)} (palm-straw hat, grey suede vest).",
     "cold, proud, contemptuous")),
 ("c03", 8, talk("c03", "Nicanor", f"Close-up of {NI} {RAN}, serene, he does not move from the porch.",
     "dry, calm, firm")),
 ("c04", 6, f"Medium wide shot {RAN}: {OC} walks slowly from the black pickup truck up the two wooden steps of the porch, past {NI} standing on the LEFT, stops at the wooden door, hesitates, swallows his pride and knocks three times with his knuckles. No dialogue."),
 # 2. Mateo abre: el pago
 ("c05", 8, talk("c05", "Mateo", f"Over-the-shoulder medium shot of {MA} standing in the open wooden doorway {RAN} on the LEFT, a white mug in his hand, calm and serious; {OC_BACK}.",
     "calm, quiet, with a hint of irony")),
 ("c06", 8, talk("c06", "Octavio", f"Over-the-shoulder close-up of {OC} on the porch {RAN} on the RIGHT, a folded white document in his hand; {PORCH_BACK(MA)} (olive-green corduroy jacket, dark brown hair).",
     "controlled, forcing politeness")),
 ("c07", 8, talk("c07", "Mateo", f"Close-up of {MA} in the doorway {RAN}, eyes steady, hurt but calm.",
     "low, hurt, firm")),
 ("c08", 10, talk("c08", "Octavio", f"Medium shot of {OC} on the porch {RAN}, he holds out the folded white document toward Mateo off-screen on the LEFT, a forced smile.",
     "smooth, persuasive, arrogant")),
 ("c09", 8, talk("c09", "Mateo", f"Over-the-shoulder close-up of {MA} {RAN} on the LEFT, he takes the white document, glances at it and looks up; {OC_BACK}.",
     "calm, slow, very sure")),
 ("r1", 6, f"Close-up of {OC} on the porch {RAN}, in silence, his forced smile disappears, his jaw tightens and he swallows. Slow push-in. No dialogue."),
 ("c10", 10, talk("c10", "Octavio", f"Close-up of {OC} {RAN}, he raises his open hands a little, proud and hurt.",
     "loud, proud, then bitter")),
 ("c11", 8, talk("c11", "Mateo", f"Medium shot of {MA} in the doorway {RAN}, he folds the white document and gives it back calmly toward Octavio off-screen on the RIGHT.",
     "calm, respectful, firm")),
 # 3. Llega Teresa
 ("c12", 6, f"Wide shot {RAN}: on the dirt road on the RIGHT, behind the black pickup truck, {TE} walks slowly toward the ranch carrying a small brown suitcase; {OC} turns his head toward her, surprised; {MA} and {NI} watch from the porch on the LEFT. No dialogue."),
 ("c13", 8, talk("c13", "Octavio", f"Medium shot of {OC} {YARD}, turning toward his wife off-screen on the RIGHT, surprised, then commanding.",
     "surprised, then commanding")),
 ("c14", 10, talk("c14", "Teresa", f"Close-up of {TE} {YARD}, holding a small brown suitcase, chin up, eyes shining but steady.",
     "soft, then firm, decided")),
 ("c15", 6, talk("c15", "Octavio", f"Close-up of {OC} {YARD}, he frowns, a little lost.",
     "disbelieving, low")),
 ("c16", 8, talk("c16", "Teresa", f"Medium shot of {TE} stepping onto the porch {RAN} next to {MA} on the LEFT, she puts the brown suitcase down beside him.",
     "warm, sure, tender")),
 ("c17", 8, talk("c17", "Octavio", f"Over-the-shoulder close-up of {OC} {YARD} on the RIGHT, his voice lower; {PORCH_BACK(TE)} (low bun, pale sky-blue blouse).",
     "low, pleading, embarrassed")),
 ("c18", 8, talk("c18", "Teresa", f"Over-the-shoulder close-up of {TE} on the porch {RAN} on the LEFT, arms crossed, calm and dignified; {OC_BACK}.",
     "quiet, firm, cutting")),
 # 4. Las condiciones de Mateo
 ("c19", 10, talk("c19", "Mateo", f"Medium shot of {MA} on the porch {RAN}, his mother {TE} beside him, he steps forward one pace toward Octavio off-screen on the RIGHT.",
     "calm, generous, firm")),
 ("c20", 6, talk("c20", "Octavio", f"Close-up of {OC} {YARD}, surprised, his eyebrows rising.",
     "surprised, unsure")),
 ("c21", 10, talk("c21", "Mateo", f"Close-up of {MA} {RAN}, steady, serious, eyes on Octavio off-screen on the RIGHT.",
     "slow, firm, very clear")),
 ("r2", 6, f"Close-up of {OC} {YARD}, in silence, he looks at his wife off-screen on the LEFT, opens his mouth, closes it, and slowly lowers his eyes. No dialogue."),
 ("c22", 8, talk("c22", "Octavio", f"Close-up of {OC} {YARD}, eyes lowered, then he looks up at Teresa off-screen on the LEFT, humbled.",
     "low, humbled, sincere")),
 ("c23", 8, talk("c23", "Teresa", f"Close-up of {TE} on the porch {RAN}, eyes shining, a small sad smile.",
     "soft, calm, firm at the end")),
 ("c24", 6, talk("c24", "Octavio", f"Medium shot of {OC} {YARD}, he nods slowly toward Mateo off-screen on the LEFT, with a stiff little bow of his head.",
     "low, stiff, then with a dry irony")),
 ("c25", 8, talk("c25", "Nicanor", f"Medium shot of {NI} on the porch {RAN}, he touches the brim of his palm-straw hat, a calm amused smile.",
     "warm, raspy, amused")),
 ("c26", 6, f"Wide shot {RAN}: {OC} walks alone to the shiny black pickup truck, gets in and drives slowly away down the dirt road in a soft cloud of dust; {MA}, {TE} and {NI} watch calmly from the porch on the LEFT. No dialogue."),
 # 5. Momento cálido (porche)
 ("c27", 10, talk("c27", "Teresa", f"Close-up of {TE} on the porch bench {RAN}, golden backlight, she looks at her son off-screen with tenderness.",
     "soft, tender, proud")),
 ("c28", 8, talk("c28", "Mateo", f"Medium close-up of {MA} on the porch bench {RAN}, holding {SAINT} in his hands, a small warm smile.",
     "soft, warm, hopeful")),
 ("c29", 10, talk("c29", "Nicanor", f"Medium shot of {NI} {RAN}, pouring coffee from a blue enamel pot into a white mug, smiling under his hat.",
     "warm, raspy, kind")),
 # 6. Gancho nuevo (de noche): la carta del abuelo
 ("c30", 10, talk("c30", "Arturo", f"Medium shot of the lawyer {AR} standing in the doorway {NIGHT} on the RIGHT, holding {LETTER} in both hands.",
     "careful, polite, serious")),
 ("c31", 8, talk("c31", "Mateo", f"Close-up of {MA} seated at the wooden table {NIGHT} on the LEFT, the lamplight on his face, surprised.",
     "surprised, low")),
 ("c32", 8, talk("c32", "Arturo", f"Close-up of {AR} {NIGHT}, he places {LETTER} on the table in front of Mateo off-screen on the LEFT.",
     "quiet, serious, slow")),
 ("i1", 6, f"Extreme close-up insert {NIGHT}: the hands of {MA} break the dark red wax seal of {LETTER} and unfold a handwritten letter in the warm lamplight. No dialogue."),
 ("c33", 10, talk("c33", "Mateo", f"Over-the-shoulder close-up of {MA} at the table {NIGHT} on the LEFT, the open letter in his hands, he looks up from it toward his mother; in the RIGHT foreground, the blurred back of {TE}, seen from behind (low bun, pale sky-blue blouse).",
     "a whisper, then shaken")),
 ("c34", 10, talk("c34", "Teresa", f"Over-the-shoulder close-up of {TE} seated at the table {NIGHT} on the RIGHT, the lamplight trembling on her face, eyes shining; in the LEFT foreground, the blurred back of {MA} (olive-green corduroy jacket, dark brown hair), seen from behind.",
     "soft, worried, pleading")),
 ("r3", 6, f"Close-up of {MA} {NIGHT}, in silence, the open letter in his hands, his eyes go wide, he slowly turns his head toward the dark doorway. Slow push-in. No dialogue."),
 # CTA con carisma (después del BLACK)
 ("c35", 8, talk("c35", "Mateo", f"Close-up of {MA} {RAN}, looking straight into the camera with charisma, {SAINT} in one hand; he tilts his head slightly, a knowing half smile, raises his eyebrows, nods once and gestures toward the camera with his free open hand as he talks, natural organic movement like a telenovela star talking to his audience.",
     "warm, intimate, confident, a little playful, talking directly to the viewer")),
]

# Flow rechaza niños, gestos agresivos, armas y llanto exagerado: siempre se suaviza desde el 1er intento.
SAFE = [("swallows his pride", "takes a breath"), ("eyes shining but steady", "eyes steady"), ("eyes shining", "eyes soft"),
        ("disbelieving", "surprised"), ("contemptuous", "cold"), ("arrogant", "proud")]
# Palabras "fuertes" -> versión liviana; se aplican desde el 2º intento (regla del usuario)
SOFT = [("menacing", "calm"), ("smug", "confident"), ("frightened", "worried"), ("scared", "worried"), ("cruel", "cold"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("sweat", "light"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("shouted", "said firmly"), ("screaming", "speaking loudly"), ("yelling", "speaking firmly"), ("veins on his neck", "a serious look"),
        ("surround", "gather around"), ("chasing", "walking behind"), ("chase", "follow"), ("rush", "walk"), ("charge", "ride"), ("young", "adult"), ("teenager", "adult"), ("dead", "gone"), ("gun", "radio"), ("weapon", "radio"), ("blood", "dust"), ("fight", "argument"), ("grab", "hold"),
        ("hostile", "serious"), ("aggressive", "firm"), ("arrest", "stop"), ("bribe", "payment"), ("extort", "charge"),
        ("bitter", "sad"), ("broken", "quiet"), ("cutting", "calm"), ("break the dark red wax seal", "open"), ("jaw tightens", "face goes still"),
        ("humbled", "quiet"), ("embarrassed", "quiet"), ("shaken", "surprised"), ("worried", "calm"), ("pleading", "gentle"),
        ("¡", ""), ("!", "."), ("corrió", "sacó"), ("correr", "sacar"), ("sangre", "familia"), ("Me cegó la soberbia", "Me equivoqué"), ("de sol a sol", "todos los días")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, natural light, 85mm lens, slow push-in. Characters look exactly like their reference images. No music, no subtitles, no text.",
          "Realistic vertical drama shot, Mexican countryside, cinematic soft light, steady camera. Same faces and clothes as the reference images. No text on screen, no music.",
          "Photorealistic vertical shot, Mexican family drama, warm natural light, calm camera. Match the reference images exactly. No music, no captions."]

# Cambiar el personaje: sin imagen de referencia; la ropa sigue descrita entre paréntesis
NOREF = [("@{OCTAVIO}", "a Mexican man"), ("@{ARTURO}", "a Mexican lawyer"), ("@{DONNICO}", "an old Mexican cowboy")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Over-the-shoulder close-up", "Close-up").replace("Over-the-shoulder medium shot", "Medium shot").replace("Wide shot", "Medium wide shot")
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

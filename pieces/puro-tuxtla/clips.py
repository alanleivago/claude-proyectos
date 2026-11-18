"""Genera los clips de puro-tuxtla PARTE 1 (El Puro de San Andrés, MEXI STORIES) con Omni Flash por el Flow MCP (CLI), uno por uno.
Premisa nueva tipo patrona (Patronas y haciendas, inventada; catálogo #45-#56 agotado) [CAPO], cierre tipo 5 (la acusación se vuelve contra quien acusa): en la galera de su hacienda tabacalera
en San Andrés Tuxtla, la temida doña Elvira (60) desprecia a Azucena (30), la torcedora nueva que contrató su hijo Iván (33). Azucena tuerce un puro con el remate de tres vueltas que solo hacía
el difunto esposo de Elvira. Elvira la acusa de espía de los Rivadeneira y el capataz Anacleto (52) la apoya. Azucena revela que anoche vio a Anacleto abrirles la bodega.
Diálogo AL INICIO del prompt, encuadres de Atrium, todas las defensas. Uso: python -I clips.py [ID ...] [--one]  -> "FIN P1"."""
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
VOICE = "speaks in native Mexican Spanish with a natural Mexican accent, unhurried, every word clearly pronounced, clear lip sync, says each sentence only once with no repetitions"
NOSUB = "The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."
CLEAN = "The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."
END = "After the last word the person stays silent until the end of the shot."
# Geografía fija (galera): Elvira a la DERECHA junto a la mesa de torcido; Anacleto a la DERECHA un paso detrás de ella; Azucena a la IZQUIERDA sentada a la mesa con las hojas; Iván a la IZQUIERDA de pie junto a ella.
GAL0 = ("in the cigar rolling room of an old tobacco hacienda in San Andres Tuxtla, Veracruz @{LOC_GALERATUXTLA} in the mid-morning: long wooden rolling tables with bundles of brown tobacco leaves, wooden cigar molds, "
        "dried tobacco leaves hanging from the ceiling, tall open windows onto green tobacco fields; no readable text, no signs, no logos")
GAL = GAL0 + "; nobody else in the background, no extras, nobody besides the person described"
ELV = ("@{ELVIRA_SANTAMARIA} (60-year-old Mexican woman, fair skin, short sleek silver bob, sharp dark eyes, deep red lipstick, a tailored black linen dress, a thick gold bracelet)")
AZU = ("@{AZUCENA_MORA} (30-year-old Mexican woman, brown skin, black hair in a tight bun with loose strands, focused dark eyes, a sleeveless cream cotton blouse)")
ANA = ("@{ANACLETO_BARRERA} (52-year-old Mexican man, tanned skin, a big black mustache with grey hairs, round face, a tobacco-stained white guayabera, a ring of old keys on his belt)")
IVA = ("@{IVAN_SANTAMARIA} (33-year-old Mexican man, light-brown skin, short dark hair, a neat short beard, kind eyes, a light-grey linen shirt with rolled sleeves)")
SOLO = "nobody in the foreground and nobody at the edges of the frame"
ALONE = ("the only person in the whole shot, already in place from the very first frame, never walking in; "
         "no second person, no hands or arms entering from the edges, only the empty background behind")
ONE = ("a single-person close-up framed from the chest up, NOT an over-the-shoulder shot: no foreground figure, no back of a head, "
       "no shoulder, ear or hair of anyone else anywhere in the frame, from the first frame to the last")
PRES = ("presentation shot: a single-person medium shot from the knees up that shows the whole outfit clearly, NOT an over-the-shoulder shot, "
        "no foreground figure and nobody else at the edges of the frame")
gaze = lambda side: f"{SOLO}, eyes turned slightly to the {side} of the camera, toward someone far outside the frame"
NODOUBLE = lambda what: f"no other {what} anywhere in the frame, no dark figure or back of anyone at the left or right edge"

def talk(cid, who, desc, tone):
    said = " Then a short pause. Then: ".join(f'"{l}"' for l in L[cid])
    return f"DIALOGUE (exact Spanish words, nothing else): {who} says {said} {desc} {who} {VOICE}, {tone}. {END} {NOSUB} {CLEAN}"

def one(desc, side, extra=""):
    return f"{desc}, {gaze(side)}; {ONE}; {ALONE}{'; ' + extra if extra else ''}."

ELV_B = "@{ELVIRA_SANTAMARIA} seen from behind (short sleek silver bob, black linen dress)"
AZU_B = "@{AZUCENA_MORA} seen from behind (black hair in a tight bun, sleeveless cream blouse)"
ANA_B = "@{ANACLETO_BARRERA} seen from behind (straw hat, white guayabera)"
IVA_B = "@{IVAN_SANTAMARIA} seen from behind (short dark hair, light-grey linen shirt)"
PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening.")
MUTE = "Nobody speaks, all mouths closed. No dialogue."
ONE_FROM = 3

def ots(speaker, listener, side):
    return (f"Over-the-shoulder shot from behind {listener}: the listener's blurred shoulder and the back of the head fill the {side} "
            f"edge of the frame in the foreground, out of focus, face never visible. {speaker}, facing the camera three-quarters "
            f"and looking at the person in the foreground; {PAIR}.")

def two(desc):
    return f"Medium two-shot, both characters fully in frame, {desc}; {PAIR}."

D8 = lambda cid: 8 if len(" ".join(L[cid]).split()) > 13 else 6

ER = "standing on the RIGHT by the rolling table"
NR = "standing on the RIGHT a step behind the patrona"
ZL = "seated on the LEFT at the rolling table with tobacco leaves in front of her"
IL = "standing on the LEFT beside the seated roller"

def S(cid, who, spk_desc, lis_b, side, tone, one_desc, one_side):
    return (talk(cid, who, ots(spk_desc, lis_b, side) + " " + MOUTH(who, "the listener"), tone),
            talk(cid, who, one(one_desc, one_side), tone))

CLIPS = [
 # 1. Gancho (0-2 s): Elvira YA hablando, despectiva, Azucena de espaldas en el borde.
 ("c01", 6, S("c01", "Elvira", f"Medium close-up of {ELV} {GAL0}, {ER}, talking from the very first frame, cold and dismissive, looking down at the seated woman over her glasses", AZU_B, "LEFT", "cold, dismissive, proud",
     f"Medium close-up of {ELV} {GAL}, {ER}, talking from the very first frame, cold and dismissive", "LEFT")),
 ("c02", D8("c02"), S("c02", "Azucena", f"Close-up of {AZU} {GAL0}, {ZL}, she looks up, calm and confident, one hand open on the table", ELV_B, "RIGHT", "calm, confident, respectful",
     f"Close-up of {AZU} {GAL}, {ZL}, calm and confident", "RIGHT")),
 ("c03", D8("c03"), S("c03", "Anacleto", f"Close-up of {ANA} {GAL0}, {NR}, leaning to the patrona, a sly distrustful look at the woman", ELV_B, "LEFT", "sly, distrustful, low",
     f"Close-up of {ANA} {GAL}, {NR}, sly and distrustful", "LEFT")),
 ("c04", D8("c04"), S("c04", "Iván", f"Close-up of {IVA} {GAL0}, {IL}, stepping in, respectful but firm toward his mother", ELV_B, "RIGHT", "firm, respectful, warm",
     f"Close-up of {IVA} {GAL}, {IL}, firm and respectful", "RIGHT")),
 ("c05", 6, S("c05", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, a cold sharp look at her son", IVA_B, "LEFT", "sharp, cold, controlling",
     f"Close-up of {ELV} {GAL}, {ER}, sharp cold look", "LEFT")),
 ("c06", 6, S("c06", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, she drops a single tobacco leaf on the table in front of the woman, a challenge", AZU_B, "LEFT", "challenging, dry, cold",
     f"Close-up of {ELV} {GAL}, {ER}, dropping a tobacco leaf, challenging", "LEFT")),
 ("r1", 6, one(f"Medium close-up of {AZU} {GAL}, {ZL}, her hands roll a cigar from brown tobacco leaves quickly and precisely, focused, she finishes the cap with three fast twists", "RIGHT") + " No dialogue."),
 ("i01", 6, f"Extreme close-up insert {GAL0}: a woman's fingers finishing the head of a hand-rolled brown cigar with a perfect triple spiral twist, then setting it on the wooden table; no faces, no readable text. No dialogue."),
 ("c07", 6, S("c07", "Anacleto", f"Close-up of {ANA} {GAL0}, {NR}, a forced scoffing laugh, but his eyes are nervous", ELV_B, "LEFT", "scoffing, nervous, dismissive",
     f"Close-up of {ANA} {GAL}, {NR}, forced scoff", "LEFT")),
 ("c08", 6, S("c08", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, she picks up the cigar and stares at its head, her hard face shaken, her voice dropping", AZU_B, "LEFT", "shaken, low, stunned",
     f"Close-up of {ELV} {GAL}, {ER}, staring at the cigar, shaken", "LEFT")),
 ("c09", 6, S("c09", "Azucena", f"Close-up of {AZU} {GAL0}, {ZL}, quiet, she looks down at her hands, guarded", ELV_B, "RIGHT", "quiet, guarded, humble",
     f"Close-up of {AZU} {GAL}, {ZL}, quiet and guarded", "RIGHT")),
 ("c10", D8("c10"), S("c10", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, suspicion hardening, she sets the cigar down hard on the table", AZU_B, "LEFT", "suspicious, hard, accusing",
     f"Close-up of {ELV} {GAL}, {ER}, suspicious and accusing", "LEFT")),
 ("c11", 6, S("c11", "Anacleto", f"Close-up of {ANA} {GAL0}, {NR}, eagerly nodding, pointing at the woman", ELV_B, "LEFT", "eager, accusing, fast",
     f"Close-up of {ANA} {GAL}, {NR}, eagerly pointing", "LEFT")),
 ("c12", 6, S("c12", "Iván", f"Close-up of {IVA} {GAL0}, {IL}, worried, one hand raised toward his mother", ELV_B, "RIGHT", "worried, firm, pleading",
     f"Close-up of {IVA} {GAL}, {IL}, worried", "RIGHT")),
 ("c13", D8("c13"), S("c13", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, cold and certain, staring at the seated woman", AZU_B, "LEFT", "cold, certain, accusing",
     f"Close-up of {ELV} {GAL}, {ER}, cold and certain", "LEFT")),
 ("c14", 6, S("c14", "Azucena", f"Close-up of {AZU} {GAL0}, {ZL}, she stands up slowly from the table, calm, holding the patrona's gaze", ELV_B, "RIGHT", "calm, firm, meaningful",
     f"Close-up of {AZU} {GAL}, {ZL}, standing up slowly, calm", "RIGHT")),
 ("c15", 6, S("c15", "Elvira", f"Close-up of {ELV} {GAL0}, {ER}, arms crossed, one short cold order", AZU_B, "LEFT", "curt, cold, commanding",
     f"Close-up of {ELV} {GAL}, {ER}, arms crossed, curt", "LEFT")),
 ("c16", D8("c16"), S("c16", "Azucena", f"Close-up of {AZU} {GAL0}, standing on the LEFT by the rolling table, steady, then she turns her eyes to the foreman", ELV_B, "RIGHT", "steady, accusing, calm",
     f"Close-up of {AZU} {GAL}, standing on the LEFT by the rolling table, steady and accusing", "RIGHT")),
 ("r2", 6, one(f"Close-up of {ANA} {GAL}, {NR}, frozen, his smile disappears, his hand goes to the ring of keys on his belt, sweat on his forehead", "LEFT") + " No dialogue."),
 ("c17", 6, S("c17", "Anacleto", f"Close-up of {ANA} {GAL0}, {NR}, loud and nervous, turning to the patrona, too fast", ELV_B, "RIGHT", "loud, nervous, defensive",
     f"Close-up of {ANA} {GAL}, {NR}, loud and nervous", "RIGHT")),
 ("c18", 6, S("c18", "Azucena", f"Close-up of {AZU} {GAL0}, standing on the LEFT by the rolling table, a calm cutting look at the keys on his belt", ANA_B, "RIGHT", "calm, cutting, quiet",
     f"Close-up of {AZU} {GAL}, standing on the LEFT, calm and cutting", "RIGHT")),
 ("r3", 6, one(f"Close-up of {ELV} {GAL}, {ER}, she slowly turns her head toward her foreman, her eyes go to the keys on his belt, her face turning to stone, silent", "LEFT") + " Slow push-in. No dialogue."),
 ("r4", 6, one(f"Close-up of {IVA} {GAL}, {IL}, stunned, staring at the foreman, then at his mother, silent", "RIGHT") + " No dialogue."),
 # CTA con carisma (después del BLACK): Azucena a cámara
 ("c19", 10, talk("c19", "Azucena", f"Close-up from the chest up of {AZU} {GAL}, standing by the rolling table, alone, looking straight into the camera and talking to the viewer from the very first second, "
     f"with charisma, her lips moving clearly; she starts calm, makes a short pause, holds up the hand-rolled cigar for a second, raises one eyebrow, gestures with her other open hand, "
     f"tilts her head, nods slowly and gives a small knowing smile. Nobody else around.",
     "charismatic, calm, intriguing, talking directly to the viewer")),
]

SAFE = [("eyes fill with tears", "eyes shine"), ("crying", "with shining eyes"), ("pointing", "gesturing"), ("shaken", "surprised"),
        ("staring at", "looking at"), ("stares at", "looks at"), ("trembling", "small"), ("with disgust", "coldly"), ("glares", "looks"), ("looks hard at", "looks at")]
# Frases primero: si no, palabras sueltas se reemplazan antes y la frase ya no coincide.
SOFT = [("sly, distrustful, low", "distrustful, low"), ("suspicious, hard, accusing", "suspicious, serious"), ("eager, accusing, fast", "eager, fast"), ("sweat on his forehead", "worried"), ("accusing", "serious"),
        ("with contempt", "coldly"), ("contemptuous", "cool"), ("humiliated", "quiet"), ("stunned", "surprised"), ("his face darkens slowly", "thoughtful"),
        ("resentful", "serious"), ("powerful", "serious"), ("three black pickup trucks", "three dark pickup trucks"), ("pushes", "moves"),
        ("hurt and angry", "serious"), ("secretive", "thoughtful"), ("cruel", "cold"),
        ("menacing", "calm"), ("smug", "confident"), ("mocking", "confident"), ("frightened", "worried"), ("scared", "worried"), ("afraid", "worried"), ("threatening", "serious"),
        ("sweating", "thoughtful"), ("tense", "serious"), ("furious", "annoyed"), ("angry", "upset"), ("anger", "feelings"), ("upset", "serious"), ("annoyed", "serious"), ("rage", "annoyance"),
        ("shouting", "speaking firmly"), ("yelling", "speaking firmly"), ("loud", "clear"), ("disbelieving", "surprised"), ("disbelief", "surprise"), ("indignant", "serious"),
        ("defensive", "serious"), ("disdainful", "cool"), ("condescending", "calm"), ("calculating", "calm"), ("sly", "calm"), ("cocky", "confident"), ("arrogant", "confident"),
        ("irritated", "serious"), ("offended", "surprised"), ("pleading", "sincere"), ("ashamed", "quiet"), ("nervous", "quiet"), ("embarrassed", "quiet"), ("urgent", "serious"),
        ("stern", "serious"), ("shocked", "surprised"), ("hurt", "serious"), ("uneasy", "quiet"), ("suspicious", "thoughtful"), ("dismissive", "calm"), ("bitter", "quiet"),
        ("proud", "calm"), ("cold", "serious"), ("alarmed", "surprised"), ("guilty", "quiet"), ("impatient", "serious"), ("defiant", "confident"), ("bossy", "firm"), ("lazy", "relaxed"),
        ("young", "adult"), ("teenager", "adult"), ("gun", "folder"), ("weapon", "folder"), ("knife", "spoon"),
        ("fight", "argument"), ("grab", "hold"), ("hostile", "serious"), ("aggressive", "firm"), ("victim", "tired one"),
        ("¡", ""), ("!", ".")]
STYLES = [STYLE,
          "Vertical scene from a Mexican TV drama, realistic, warm humid morning light in the cigar rolling room of a tobacco hacienda in Veracruz, 85mm lens, slow push-in. Characters look exactly like their reference images. No music. Clean frame, no captions, no text.",
          "Realistic vertical drama shot, tobacco hacienda rolling room with hanging leaves in Mexico, steady camera. Same faces and clothes as the reference images. No music. Clean frame, no captions, no text on screen.",
          "Photorealistic vertical shot, Mexican drama, soft light, calm camera. Match the reference images exactly. No music. Clean frame, no captions."]

NOREF = [("@{ELVIRA_SANTAMARIA}", "a stern Mexican woman around sixty with a short silver bob, red lipstick and a black linen dress"),
         ("@{AZUCENA_MORA}", "a Mexican woman around thirty with black hair in a tight bun and a sleeveless cream blouse"),
         ("@{ANACLETO_BARRERA}", "a Mexican foreman in his fifties with a big black mustache, a white guayabera and keys on his belt"),
         ("@{IVAN_SANTAMARIA}", "a Mexican man in his thirties with a neat short beard and a light-grey linen shirt"),
         (" @{LOC_GALERATUXTLA}", "")]
TRIES = 6

def variant(body, k):
    for a, b in SAFE: body = body.replace(a, b)
    if k >= 1:
        for a, b in SOFT: body = re.sub((r"\b" if a[0].isalnum() else "") + re.escape(a) + (r"\b" if a[-1].isalnum() else ""), b, body)
    if k >= 3: body = body.replace("Close-up insert", "Close-up").replace("Medium close-up", "Close-up")
    if k >= 4:
        for a, b in NOREF: body = body.replace(a, b)
        body = re.sub(r"  +", " ", body)
    if k >= 5:  # prompt mínimo: solo la primera línea de diálogo
        body = re.sub(r' Then a short pause\. Then[^"]*"[^"]*"', "", body)
    return STYLES[min(k, 3)] + chr(10) + body

def gen(text, dur, out):
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    try:
        r = subprocess.run(["node", "src/cli.js", "video", "--prompt-file", f.name, "--aspect", "9:16", "--duration", str(dur), "--out", str(out)],
                           cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        return [], "timeout del CLI (600 s)"
    if "LIMITE DE CREDITOS" in r.stdout: print(r.stdout.strip(), flush=True); sys.exit("FIN por limite de creditos")
    low = (r.stdout + r.stderr).lower()
    if any(w in low for w in ("crédito", "credito", "credit", "quota", "cuota", "insufficient", "suficientes", "saldo")) and not any(l.endswith(".mp4") for l in r.stdout.splitlines()):
        print("SIN CREDITOS:", (r.stdout + r.stderr).strip()[-400:].replace(chr(10), " "), flush=True); sys.exit("FIN por SIN CREDITOS")
    return [l for l in r.stdout.splitlines() if l.endswith(".mp4")], r.stdout + r.stderr

def flow_ok():
    """Prueba de control: gatito como IMAGEN (no gasta créditos)."""
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

def new_project():
    subprocess.run(["node", "src/cli.js", "project", "new"], cwd=MCP, capture_output=True, text=True, timeout=180)
    pid = subprocess.run(["node", "src/cli.js", "project"], cwd=MCP, capture_output=True, text=True, timeout=60).stdout.strip()
    subprocess.run(["node", str(Path(__file__).resolve().parents[2] / "tools" / "flow_tabs.js"), "--close-extra", pid], capture_output=True, text=True, timeout=60)
    subprocess.run([sys.executable, "-I", "make_sheets.py", "--reupload"], cwd=D, capture_output=True, text=True, timeout=1800)
    print("PROYECTO NUEVO", pid, "(hojas resubidas)", flush=True)

def main():
    force_one = "--one" in sys.argv
    want = set(a for a in sys.argv[1:] if a != "--one")
    OUT.mkdir(exist_ok=True)
    if want: reload_flow(); time.sleep(5)  # regens tras --reupload: el selector de assets queda abierto y el @ no abre el picker
    for cid, dur, body in CLIPS:
        dst = OUT / f"{cid}.mp4"
        if want and cid not in want: continue
        if dst.exists():
            if not want: continue
            old = OUT / "old"; old.mkdir(exist_ok=True); n = 1
            while (old / f"{cid}_v{n}.mp4").exists(): n += 1
            os.replace(dst, old / f"{cid}_v{n}.mp4")
        k = 0
        while k < TRIES:
            alt = isinstance(body, tuple)
            use_one = alt and (force_one or k >= ONE_FROM)
            files, log = gen(variant((body[1] if use_one else body[0]) if alt else body, k), dur, OUT)
            if files and subprocess.run(["ffmpeg", "-v", "error", "-i", files[0], "-f", "null", "-"], capture_output=True, text=True).stderr.strip():
                os.remove(files[0]); files, log = [], "descarga corrupta"
            if files:
                new = Path(files[0]).resolve()
                dup = [p for p in OUT.glob("*.mp4") if re.fullmatch(r"[cir]\d+", p.stem) and p.resolve() != new and p.stat().st_size == Path(files[0]).stat().st_size and _md5(p) == _md5(Path(files[0]))]
                if dup: os.remove(files[0]); files, log = [], f"DUPLICADO md5 de {dup[0].name}"
            if files: os.replace(files[0], dst); print("OK", cid, f"(intento {k + 1}{', single' if use_one else ''})", flush=True); break
            print("FALLO", cid, f"intento {k + 1}:", log[-200:].replace(chr(10), " "), flush=True)
            if "políticas" not in log: reload_flow()
            time.sleep(17)
            if "políticas" not in log and not flow_ok():
                global CAIDAS; CAIDAS = globals().get("CAIDAS", 0) + 1
                if CAIDAS >= 2: new_project(); CAIDAS = 0
                else: reload_flow()
                time.sleep(20); continue
            CAIDAS = 0
            k += 1
        time.sleep(17)
    print("FIN P1", flush=True)

def _md5(p):
    import hashlib
    return hashlib.md5(p.read_bytes()).hexdigest()

if __name__ == "__main__":
    main()

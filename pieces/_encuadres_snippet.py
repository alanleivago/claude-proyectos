"""Encuadres tipo Atrium para los clips.py de novelas (copiar a cada pieza; no se importa).
Origen: fuentes/atrium-vista/encuadres.md. Atrium: OTS 62 %, two-shot 16 %, grupo 6 %, single 14 %; nosotros teníamos 94 % single.
Meta por pieza: OTS ~50 %, single ~25 %, two-shot ~15 %, grupo ~10 %. CTA, llamadas, llanto y reacciones fuertes siguen en single (one()).
Aplicado por primera vez en pieces/costal-cuyutlan/clips.py (ver ahí el reparto clip por clip)."""

# 1. Una descripción "de espaldas" por personaje: su @{ASSET} + lo que se ve desde atrás (pelo, ropa, complexión).
#    Ejemplo de costal-cuyutlan:
# ATA_B = "@{ATANASIO_VARELA} seen from behind (short white curly hair, faded sky-blue work shirt, white cloth knotted at his neck)"
# LEO_B = "@{LEONIDAS_PAZOS} seen from behind (cream straw fedora with a black band, black polo shirt, heavy build)"

# 2. Texto común (pegar después de one() en clips.py).
PAIR = "only these two people in the frame, no third person, no extras"
MOUTH = lambda spk, other: (f"Only {spk} speaks: {spk}'s lips move clearly with every word; "
                            f"{other} stays silent the whole shot, mouth closed and not visible, only listening.")
MUTE = "Nobody speaks, all mouths closed. No dialogue."
ONE_FROM = 3  # k (0-based): intentos 4-6 usan el prompt single de respaldo

def ots(speaker, listener, side):
    """Plano sobre el hombro como el de Atrium: quien escucha, de espaldas y desenfocado en el borde `side`."""
    return (f"Over-the-shoulder shot from behind {listener}: the listener's blurred shoulder and the back of the head fill the {side} "
            f"edge of the frame in the foreground, out of focus, face never visible. {speaker}, facing the camera three-quarters "
            f"and looking at the person in the foreground; {PAIR}.")

def two(desc):
    """Two-shot de perfil, de las rodillas o la cintura para arriba."""
    return f"Medium two-shot, both characters fully in frame, {desc}; {PAIR}."

# 3. Geografía fija por escena: si X está a la DERECHA y Y a la IZQUIERDA, en el OTS de X la espalda de Y va en el borde "LEFT",
#    y en el contraplano la espalda de X va en el borde "RIGHT". El speaker usa SAL0 (sin "nobody else"), no SAL.

# 4. Cada clip OTS/two/grupo es una tupla (prompt_nuevo, prompt_single_de_respaldo):
# ("c03", 6, (talk("c03", "Leónidas", ots(f"Close-up of {LEO} {SAL0}, {LR}, he pats the hood of his white truck, smug", ATA_B, "LEFT") + " " + MOUTH("Leónidas", "Atanasio"), "smug, cold"),
#             talk("c03", "Leónidas", one(f"Close-up of {LEO} {SAL}, {LR}, he pats the hood of his white truck, smug", "LEFT"), "smug, cold"))),
# Two-shot con diálogo: el que habla "slightly closer to the camera and in sharper focus". Grupo/two mudo: + " " + MUTE.

# 5. En main() (el resto de defensas queda igual: gatito, md5, recarga, proyecto nuevo, NOREF, SOFT, LIMITE DE CREDITOS):
#     force_one = "--one" in sys.argv  # regenerar con el single (p. ej. si el OTS salió con un doble)
#     want = set(a for a in sys.argv[1:] if a != "--one")
#     ...
#         alt = isinstance(body, tuple)  # (OTS/two/grupo, respaldo single)
#         use_one = alt and (force_one or k >= ONE_FROM)
#         files, log = gen(variant((body[1] if use_one else body[0]) if alt else body, k), dur, OUT)
#     ...
#         print("OK", cid, f"(intento {k + 1}{', single' if use_one else ''})", flush=True)

# 6. QA: la figura del borde es el personaje nombrado con su ropa; solo se mueve la boca del que está de frente; sin tercero; geografía L/R.

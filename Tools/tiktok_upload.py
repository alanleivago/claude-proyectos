"""Sube un video de LucidLink a TikTok en el teléfono de VMOS, sin gastar tokens:
encuentra los botones por su texto (uiautomator) y solo usa coordenadas fijas donde
TikTok no expone texto (cámara/galería).

Uso: python tools/tiktok_upload.py <Estilo> <archivo.mp4> [--dry]
  ej: python tools/tiktok_upload.py Majestic chofer-patrona-p1.mp4
El video debe estar en LucidLink: Renders finales claude/<Estilo>/<archivo.mp4>.
Pie de foto = <archivo>.txt al lado (sin la marca MAJESTIC/VISTA/MEXI, máx. 5 hashtags).
--dry: llega hasta escribir el pie de foto, no publica (y descarta).
"""
import os
import random
import re
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))
from vmos import call, env, run  # noqa: E402

PAD = env().get('VMOS_PAD') or 'APP6958QPXXF8LD7'
TT, LL = 'com.zhiliaoapp.musically', 'com.lucidlink.android.files'
LUCID = r'C:\Volumes\alanwork\trabajo\Renders finales claude'


def sh(cmd):
    call('asyncCmd', {'padCodes': [PAD], 'scriptContent': cmd})


def nodes():
    # la API corta la salida a 2000 caracteres: filtrar en el teléfono (texto|desc|bounds)
    txt = run(PAD, "uiautomator dump /sdcard/ui.xml >/dev/null 2>&1; "
                   "sed 's/<node/\\n<node/g' /sdcard/ui.xml | sed -n "
                   "'s/.* text=\"\\([^\"]*\\)\".* content-desc=\"\\([^\"]*\\)\".* "
                   "bounds=\"\\([^\"]*\\)\".*/\\1|\\2|\\3/p' | grep -v '^||' | cut -c1-70")
    out = []
    for m in re.finditer(r'^([^|\n]*)\|([^|\n]*)\|.*?\[(\d+),(\d+)\]\[(\d+),(\d+)\]', txt, re.M):
        t, d, x1, y1, x2, y2 = m.groups()
        out.append(((t or d).strip(), (int(x1) + int(x2)) // 2, (int(y1) + int(y2)) // 2))
    return out


def find(pattern, ns=None):
    for t, x, y in ns if ns is not None else nodes():
        if t and re.fullmatch(pattern, t, re.I):
            return x, y
    return None


def tap(x, y, wait=2.5):
    # como un dedo: nunca el mismo píxel, y pausas que varían
    sh(f'input tap {x + random.randint(-12, 12)} {y + random.randint(-10, 10)}')
    time.sleep(wait * random.uniform(0.9, 1.6))


def browse(n):
    """Mira n videos del Para ti como una persona (sin LLM)."""
    from tiktok_warmup import swipe, watch_time
    for _ in range(n):
        time.sleep(watch_time())
        swipe()


def tap_text(pattern, timeout=20, wait=2.5):
    end = time.time() + timeout
    while time.time() < end:
        p = find(pattern)
        if p:
            return tap(*p, wait=wait) or True
        time.sleep(2)
    raise RuntimeError(f'no apareció: {pattern}')


def dismiss_dialogs(ns):
    """Permisos y avisos de TikTok/Android. Devuelve True si tocó algo."""
    for pat in (r'MIENTRAS SE USA LA APLICACI[ÓO]N', r'PERMITIR ACCESO A TODOS',
                r'NO PERMITIR', r'CANCELAR', r'Ahora no', r'Not now'):
        p = find(pat, ns)
        if p:
            if pat == 'NO PERMITIR' and find(r'MIENTRAS SE USA.*|PERMITIR ACCESO.*', ns):
                continue
            tap(*p)
            return True
    return False


def caption_for(style, name):
    path = os.path.join(LUCID, style, os.path.splitext(name)[0] + '.txt')
    if not os.path.exists(path):
        return ''
    t = open(path, encoding='utf-8').read()
    t = re.sub(r'(?i)\b(majestic|vista|mexi\s*tv|mexi)\b[:\s|·-]*', '', t, count=1).strip()
    tags = re.findall(r'#\w+', t)
    for extra in tags[5:]:  # TikTok solo acepta 5 hashtags
        t = t.replace(' ' + extra, '').replace(extra, '')
    return t.strip()


def download_from_lucid(style, name):
    size = os.path.getsize(os.path.join(LUCID, style, name))
    run(PAD, f"rm -f '/sdcard/Download/{name}'")
    sh(f'am force-stop {LL}; monkey -p {LL} -c android.intent.category.LAUNCHER 1')
    time.sleep(6)
    for _ in range(12):  # navegar hasta la carpeta del estilo
        ns = nodes()
        row = find(re.escape(name), ns)
        if row:
            break
        for pat in (re.escape(style), r'Renders finales claude', r'trabajo'):
            p = find(pat, ns)
            if p and not (pat == re.escape(style) and p[1] < 400):  # no el breadcrumb
                tap(*p)
                break
        else:
            sh('input swipe 540 1800 540 900 300')  # la carpeta puede estar más abajo
            time.sleep(2)
    else:
        raise RuntimeError(f'no encontré {style}/{name} en LucidLink')
    tap(995, row[1])  # menú ⋮ de esa fila
    tap_text(r'Download|Descargar')
    tap_text(r'GUARDAR|SAVE')
    for _ in range(180):
        out = run(PAD, f"stat -c %s '/sdcard/Download/{name}' 2>/dev/null")
        if out.strip() == str(size):
            break
        time.sleep(3)
    else:
        raise RuntimeError('la descarga no terminó')
    run(PAD, f'am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE '
             f"-d 'file:///sdcard/Download/{name}' >/dev/null")
    print('descargado en el teléfono', flush=True)


def post_tiktok(caption, dry):
    sh(f'am force-stop {TT}; sleep 1; monkey -p {TT} -c android.intent.category.LAUNCHER 1')
    time.sleep(10)
    for _ in range(3):  # avisos al abrir
        if not dismiss_dialogs(nodes()):
            break
    if not dry:
        browse(random.randint(3, 6))  # primero mira unos videos, como cualquiera
    tap(540, 2337, wait=5)  # "+"
    for _ in range(4):
        if not dismiss_dialogs(nodes()):
            break
    for _ in range(4):  # miniatura de la galería: misma fila que "CÁMARA", a la izquierda
        ns = nodes()
        if find(r'Recientes|Recents', ns):
            break
        if dismiss_dialogs(ns):
            continue
        cam = find(r'C[ÁA]MARA|CAMERA', ns)
        tap(120, cam[1] if cam else 2305, wait=4)
    else:
        raise RuntimeError('no se abrió la galería')
    tap(302, 412, wait=2)  # primer elemento = el más reciente
    tap_text(r'Siguiente.*', wait=8)
    tap_text(r'Siguiente', wait=6)
    tap_text(r'Añade una descripci.*|Add a description.*')
    call('inputText', {'padCodes': [PAD], 'text': caption})
    time.sleep(3)
    sh('input keyevent 4')
    time.sleep(2)
    if dry:
        print('DRY: pie de foto escrito, no se publica', flush=True)
        sh(f'am force-stop {TT}')
        return
    tap_text(r'Publicar|Post', wait=30)
    for _ in range(3):
        if not dismiss_dialogs(nodes()):
            break
    print('publicado', flush=True)
    tap(107, 2337, wait=4)  # Inicio
    browse(random.randint(4, 8))  # y se queda un rato mirando


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    style, name, dry = sys.argv[1], sys.argv[2], '--dry' in sys.argv
    cap = caption_for(style, name)
    print('pie de foto:\n' + cap + '\n---', flush=True)
    download_from_lucid(style, name)
    post_tiktok(cap, dry)

"""Lee todas las conversaciones de la pestaña de Mensajes abierta en el V06.
Uso: python tools/patrick_inbox.py <avatar_x> <salida.md>   (88 = Principal, 90 = Solicitudes)
Toca cada fila, vuelca el texto visible del chat y vuelve. No escribe nada."""
import os, sys, time, random
os.environ.setdefault('VMOS_PAD', 'ATP63362YSJXJF2F')
sys.path.insert(0, os.path.dirname(__file__))
from tiktok_upload import nodes, tap, sh

AX, OUT = int(sys.argv[1]), sys.argv[2]
SKIP = {'Contactos', 'Personas', 'Crear', 'Recuerdos', 'Monetización', 'TikTok Shop',
        'Notificaciones del sistema', 'Novedades para creadores', 'Actividad y nuevos seguidores'}
seen, stale = set(), 0
with open(OUT, 'a', encoding='utf-8') as f:
    while stale < 2:
        ns = nodes()
        rows = []
        for _, x, ay in ns:
            if abs(x - AX) < 4 and 150 < ay < 1170:
                names = [t.strip('‎ ') for t, nx, ny in ns if 170 < nx < 460 and ay - 45 <= ny <= ay - 10 and t]
                if names and names[0] not in SKIP and not names[0].startswith('IA de'):
                    rows.append((names[0], ay))
        new = [(t, y) for t, y in rows if t not in seen]
        stale = 0 if new else stale + 1
        for t, y in new:
            seen.add(t)
            tap(330, y, wait=2.5)
            chat = [n[0] for n in nodes() if n[0]]
            f.write(f'\n## {t}\n' + '\n'.join(chat) + '\n')
            f.flush()
            print(t, flush=True)
            sh('input keyevent 4')
            time.sleep(random.uniform(1.8, 3))
        sh(f'input swipe {360 + random.randint(-20, 20)} 1000 {360 + random.randint(-20, 20)} 450 500')
        time.sleep(2)

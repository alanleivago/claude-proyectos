"""Responde un chat de la bandeja de Mensajes del V06 (TikTok de Patrick).
Uso: python tools/patrick_dm.py "<nombre visible>" "<mensaje>" [--solicitudes] [--dry]
Empieza con la pestaña Mensajes abierta arriba del todo. Baja hasta encontrar la fila, abre, escribe, envía, vuelve."""
import os, sys, time, random
os.environ.setdefault('VMOS_PAD', 'ATP63362YSJXJF2F')
sys.path.insert(0, os.path.dirname(__file__))
from tiktok_upload import nodes, tap, sh, PAD
from vmos import call

name, msg = sys.argv[1], sys.argv[2]
dry = '--dry' in sys.argv
for _ in range(25):
    hit = [(x, y) for t, x, y in nodes() if t.strip('\u200e ') == name and 150 < y < 1180 and x > 150]
    if hit:
        break
    sh(f'input swipe {360 + random.randint(-20, 20)} 1000 {360 + random.randint(-20, 20)} 500 600')
    time.sleep(2)
else:
    sys.exit(f'NO ENCONTRADO: {name}')
tap(330, hit[0][1], wait=3)
ns = nodes()
box = next(((x, y) for t, x, y in ns if t.startswith('Mensaje') or t.startswith('Envía un mensaje')), None)
if not box:
    acc = next(((x, y) for t, x, y in ns if t == 'Aceptar'), None)
    if acc:
        tap(*acc, wait=3)
        ns = nodes()
        box = next(((x, y) for t, x, y in ns if t.startswith('Mensaje')), None)
if not box:
    sys.exit('SIN CAJA DE TEXTO: ' + ' | '.join(t for t, _, _ in ns)[:400])
tap(*box, wait=1.5)
sh('input keycombination 113 29; input keyevent 67'); time.sleep(1)
call('inputText', {'padCodes': [PAD], 'text': msg})
time.sleep(random.uniform(2, 4))
send = next(((x, y) for t, x, y in nodes() if t == 'Enviar'), None)
if dry or not send:
    print('DRY' if dry else 'SIN BOTON ENVIAR', send)
else:
    tap(*send, wait=2)
    print('ENVIADO', name)
    from vmos import call as _c
    url = _c('getLongGenerateUrl', {'padCodes': [PAD]})['data'][0]['url']
    import requests; open(os.path.join(os.environ.get('TEMP', '.'), 'dm_last.jpg'), 'wb').write(requests.get(url, timeout=60).content)
sh('input keyevent 4'); time.sleep(1.5); sh('input keyevent 4'); time.sleep(2)

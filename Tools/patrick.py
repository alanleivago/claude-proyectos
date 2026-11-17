"""Control a mano del V06 (TikTok de Patrick). Uso:
  python tools/patrick.py ui            -> textos visibles con su centro x,y
  python tools/patrick.py tap X Y       -> toque con jitter
  python tools/patrick.py type "texto"  -> escribe en el campo enfocado
  python tools/patrick.py key back|home|enter
  python tools/patrick.py swipe up|down
"""
import os, sys, time, random
os.environ.setdefault('VMOS_PAD', 'ATP63362YSJXJF2F')
sys.path.insert(0, os.path.dirname(__file__))
from tiktok_upload import nodes, tap, sh, PAD
from vmos import call

a = sys.argv[1:]
if a[0] == 'ui':
    for t, x, y in nodes():
        print(f'{x},{y}  {t}')
elif a[0] == 'tap':
    tap(int(a[1]), int(a[2]), wait=1.5)
elif a[0] == 'type':
    call('inputText', {'padCodes': [PAD], 'text': a[1]})
elif a[0] == 'key':
    sh('input keyevent ' + {'back': '4', 'home': '3', 'enter': '66'}[a[1]])
elif a[0] == 'swipe':
    y1, y2 = (1000, 400) if a[1] == "up" else (400, 1000)
    sh(f'input swipe {360 + random.randint(-30, 30)} {y1} {360 + random.randint(-30, 30)} {y2} {random.randint(350, 600)}')
time.sleep(1)

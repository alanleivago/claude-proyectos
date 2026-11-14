"""Calienta la cuenta de TikTok del teléfono de VMOS como un humano: mira el "Para ti",
desliza con tiempos al azar y da algún like. No gasta tokens del plan: el bucle es puro
script y solo cada N videos manda una captura chica a Haiku 5.5 (créditos de API)
para detectar ventanas emergentes, directos o anuncios y cerrarlos.

Uso: python tools/tiktok_warmup.py [minutos=20] [prob_like=0.06]
Log en tools/logs/warmup_<fecha>.log
"""
import base64
import json
import os
import random
import sys
import time
from datetime import datetime
from io import BytesIO

import anthropic
import requests
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from vmos import ROOT, call, env  # noqa: E402

PAD = env().get('VMOS_PAD') or 'APP6958QPXXF8LD7'
PKG = 'com.zhiliaoapp.musically'
W, H = 1080, 2410
CHECK_EVERY = 8
MINUTES = float(sys.argv[1]) if len(sys.argv) > 1 else 20
P_LIKE = float(sys.argv[2]) if len(sys.argv) > 2 else 0.06

os.makedirs(os.path.join(ROOT, 'tools', 'logs'), exist_ok=True)
LOG = os.path.join(ROOT, 'tools', 'logs', f'warmup_{datetime.now():%Y%m%d_%H%M}.log')
client = anthropic.Anthropic(api_key=env()['ANTHROPIC_API_KEY'])

PROMPT = f"""This is a {W}x{H} Android screenshot (shown scaled down) of TikTok on a phone we control.
Classify it and say how to get back to a normal "For You" video feed.
Reply ONLY with JSON: {{"state": "feed"|"popup"|"live"|"ad"|"other_screen"|"not_tiktok",
"tap": [x, y] or null, "back": true|false, "note": "few words"}}
- feed: a normal video playing full screen with the bottom nav bar visible. tap null, back false.
- popup: a dialog/sheet over the app. "tap" = the close/X/"not now"/"cancel"/"no" button,
  never anything that buys, follows, shares, or grants payment. Coordinates in the FULL {W}x{H} space.
- live or ad: tap null, back false (we just swipe past it).
- other_screen (profile, search, comments, settings...): back true.
- not_tiktok: back false, tap null."""


def log(msg):
    line = f'{datetime.now():%H:%M:%S} {msg}'
    print(line, flush=True)
    open(LOG, 'a', encoding='utf-8').write(line + '\n')


def sh(cmd):
    call('asyncCmd', {'padCodes': [PAD], 'scriptContent': cmd})


def shot_b64(width=360):
    url = call('getLongGenerateUrl', {'padCodes': [PAD]})['data'][0]['url']
    img = Image.open(BytesIO(requests.get(url, timeout=60).content)).convert('RGB')
    img = img.resize((width, round(width * img.height / img.width)))
    buf = BytesIO()
    img.save(buf, 'JPEG', quality=70)
    return base64.b64encode(buf.getvalue()).decode()


def check_screen():
    """Una captura chica a Haiku; devuelve dict con state/tap/back."""
    text = ''
    with client.messages.stream(
        model='claude-haiku-5-5', max_tokens=16000,
        messages=[{'role': 'user', 'content': [
            {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg',
                                         'data': shot_b64()}},
            {'type': 'text', 'text': PROMPT}]}],
    ) as s:
        msg = s.get_final_message()
    text = ''.join(b.text for b in msg.content if b.type == 'text')
    try:
        return json.loads(text[text.index('{'):text.rindex('}') + 1])
    except ValueError:
        return {'state': 'unknown', 'note': text[:80]}


def restart_app():
    sh(f'am force-stop {PKG}; sleep 1; monkey -p {PKG} -c android.intent.category.LAUNCHER 1')
    time.sleep(8)


def fix_screen():
    for i in range(4):
        if i == 3:  # atrás no sirvió: reiniciar TikTok (abre en el feed)
            log('  reinicio TikTok')
            restart_app()
        r = check_screen()
        log(f'  revisión: {r}')
        st = r.get('state')
        if st in ('feed', 'live', 'ad', 'unknown'):
            return
        if st == 'not_tiktok':
            sh(f'monkey -p {PKG} -c android.intent.category.LAUNCHER 1')
        elif st == 'popup' and r.get('tap'):
            x, y = r['tap']
            sh(f'input tap {int(x)} {int(y)}')
        else:
            sh('input keyevent 4')
        time.sleep(3)


def swipe():
    x1 = random.randint(430, 650)
    y1 = random.randint(1650, 1900)
    y2 = random.randint(450, 750)
    sh(f'input swipe {x1} {y1} {x1 + random.randint(-60, 60)} {y2} {random.randint(180, 380)}')


def like():
    x, y = random.randint(380, 700), random.randint(900, 1400)
    sh(f'input tap {x} {y}; sleep 0.12; input tap {x + 3} {y + 2}')


def watch_time():
    r = random.random()
    if r < 0.30:
        return random.uniform(2, 5)      # se salta rápido
    if r < 0.85:
        return random.uniform(7, 18)     # mira un rato
    return random.uniform(25, 50)        # lo ve entero


def main():
    log(f'inicio: {MINUTES} min, like {P_LIKE:.0%}')
    restart_app()
    fix_screen()
    end = time.time() + MINUTES * 60
    n = likes = 0
    while time.time() < end:
        t = watch_time()
        time.sleep(t)
        liked = t > 8 and random.random() < P_LIKE
        if liked:
            like()
            likes += 1
            time.sleep(random.uniform(1, 3))
        swipe()
        n += 1
        log(f'video {n}: {t:.0f}s{" + like" if liked else ""}')
        if n % CHECK_EVERY == 0:
            fix_screen()
        if random.random() < 0.03:  # pausa larga ocasional
            time.sleep(random.uniform(20, 60))
    log(f'fin: {n} videos, {likes} likes')


if __name__ == '__main__':
    main()

"""Cliente mínimo de la OpenAPI de VMOS Cloud (firma V2 SHA-256).

Uso:
  python tools/vmos.py list                          # teléfonos de la cuenta
  python tools/vmos.py <ruta> ['{"json":"body"}']    # cualquier endpoint
    ej: python tools/vmos.py screenshot '{"padCodes":["AC..."]}'
Rutas cortas se completan con /vcpcloud/api/padApi/. Docs:
https://cloud.vmoscloud.com/vmoscloud/doc/zh/server/llms.html
Lee VMOS_AK y VMOS_SK del .env de la raíz.
"""
import hashlib
import json
import os
import sys
import time

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = 'https://api.vmoscloud.com'
PREFIX = '/vcpcloud/api/padApi/'


def env():
    vals = {}
    for line in open(os.path.join(ROOT, '.env'), encoding='utf-8'):
        if '=' in line and not line.lstrip().startswith('#'):
            k, v = line.split('=', 1)
            vals[k.strip()] = v.strip().strip('"\'')
    return vals


def call(path, body=None):
    e = env()
    ak, sk = e['VMOS_AK'], e['VMOS_SK']
    if not path.startswith('/'):
        path = PREFIX + path
    data = json.dumps(body, separators=(',', ':'), ensure_ascii=False) if body is not None else ''
    ts = str(int(time.time()))
    sign = hashlib.sha256((sk + ts + path + data).encode('utf-8')).hexdigest()
    headers = {'X-Access-Key': ak, 'X-Timestamp': ts, 'X-Sign': sign,
               'Content-Type': 'application/json'}
    for i in range(5):  # la red de VMOS corta conexiones a veces
        try:
            return requests.post(HOST + path, headers=headers, data=data.encode('utf-8'),
                                 timeout=60).json()
        except requests.RequestException:
            if i == 4:
                raise
            time.sleep(2 + 3 * i)


def run(pad, cmd, wait=120):
    """Ejecuta un comando shell en el teléfono y devuelve su salida."""
    tid = call('asyncCmd', {'padCodes': [pad], 'scriptContent': cmd})['data'][0]['taskId']
    for _ in range(wait):
        time.sleep(1)
        d = call('executeScriptInfo', {'taskIds': [tid]})['data'][0]
        if d['taskStatus'] in (3, -1, -2, -3, -4):
            return d['taskResult'] or d['errorMsg'] or ''
    raise TimeoutError(cmd[:80])


def push(pad, src, dst, chunk=4000):  # asyncCmd admite máx 4096 caracteres
    """Sube un archivo local al teléfono en trozos base64 vía asyncCmd; verifica md5."""
    import base64
    raw = open(src, 'rb').read()
    b64 = base64.b64encode(raw).decode()
    run(pad, 'rm -rf /sdcard/.vpush; mkdir -p /sdcard/.vpush')
    parts = [b64[i:i + chunk] for i in range(0, len(b64), chunk)]
    for n, p in enumerate(parts):
        run(pad, f"echo -n '{p}' > /sdcard/.vpush/{n:05d}")
        print(f'  parte {n + 1}/{len(parts)}', flush=True)
    out = run(pad, f"cat /sdcard/.vpush/* | base64 -d > '{dst}'; rm -rf /sdcard/.vpush; md5sum '{dst}'")
    ok = hashlib.md5(raw).hexdigest() in out
    return ok, out.strip()


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pad = env().get('VMOS_PAD') or 'APP6958QPXXF8LD7'
    if sys.argv[1] == 'shot':  # shot [salida.jpg] -> captura actual (432 px de ancho)
        url = call('getLongGenerateUrl', {'padCodes': [pad]})['data'][0]['url']
        out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'vmos_shot.jpg')
        from io import BytesIO
        from PIL import Image
        img = Image.open(BytesIO(requests.get(url, timeout=60).content)).convert('RGB')
        img.resize((432, round(432 * img.height / img.width))).save(out)
        sys.exit(print(out))
    if sys.argv[1] == 'push':  # push <local> <ruta en el teléfono>
        sys.exit(print(push(pad, sys.argv[2], sys.argv[3])))
    if sys.argv[1] == 'run':  # run "cmd" -> espera y muestra la salida
        sys.exit(print(run(pad, sys.argv[2])))
    if sys.argv[1] == 'sh':  # sh "input tap 540 1200" -> comando shell en el teléfono
        res = call('asyncCmd', {'padCodes': [pad], 'scriptContent': sys.argv[2]})
    elif sys.argv[1] == 'list':
        res = call('infos', {'page': 1, 'rows': 50})
    else:
        res = call(sys.argv[1], json.loads(sys.argv[2]) if len(sys.argv) > 2 else None)
    print(json.dumps(res, indent=2, ensure_ascii=False))

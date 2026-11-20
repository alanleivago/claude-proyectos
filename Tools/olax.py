"""Cliente del router Olax AX8 Pro (API /hbapi-json, la misma que usa su panel web).

Uso:
  python3 tools/olax.py <modulo> <metodo> ['{"json":"args"}']
    ej: python3 tools/olax.py system system_getnetoverview
Lee ROUTER_URL, ROUTER_USER y ROUTER_PASS del .env de la raíz.
"""
import hashlib
import json
import os
import sys
from urllib.parse import urlsplit

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def env():
    e = {}
    for line in open(os.path.join(ROOT, '.env'), encoding='utf-8'):
        if '=' in line and not line.lstrip().startswith('#'):
            k, v = line.strip().split('=', 1)
            e[k] = v
    return e


class Olax:
    def __init__(self):
        e = env()
        u = urlsplit(e['ROUTER_URL'])
        self.base = f'{u.scheme}://{u.netloc}'
        self.user, self.pw = e['ROUTER_USER'], e['ROUTER_PASS']
        self.sid = ''

    def rpc(self, module, method, args=None):
        body = {'params': [self.sid, module, method, args or {'param1': 'null'}]}
        r = requests.post(self.base + '/hbapi-json', json=body, timeout=15)
        r.raise_for_status()
        return r.json()

    def login(self):
        nonce = self.rpc('system', 'system_challenge', {'username': self.user})['params']['nonce']
        h1 = hashlib.md5(f'{self.user}:{self.pw}'.encode()).hexdigest()
        h2 = hashlib.md5(f'{h1}:{nonce}'.encode()).hexdigest()
        res = self.rpc('system', 'system_login', {'username': self.user, 'password': h2})
        if res.get('result') != 'ok':
            raise SystemExit(f'login falló: {res.get("result")}')
        self.sid = res['params']['sid']
        return self


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    o = Olax().login()
    args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None
    print(json.dumps(o.rpc(sys.argv[1], sys.argv[2], args), indent=1, ensure_ascii=False))

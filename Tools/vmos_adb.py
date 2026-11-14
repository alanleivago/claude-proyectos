"""Abre el túnel SSH de ADB al teléfono de VMOS Cloud y lo deja corriendo.

Uso: python tools/vmos_adb.py      (dejarlo en segundo plano)
Luego: adb -s localhost:<puerto> push/shell ...  (el puerto se imprime al conectar)
"""
import re
import select
import socket
import subprocess
import sys
import threading

import paramiko

sys.path.insert(0, __import__('os').path.dirname(__file__))
from vmos import call, env  # noqa: E402

pad = env().get('VMOS_PAD') or 'APP6958QPXXF8LD7'
call('openOnlineAdb', {'padCodes': [pad], 'status': 1})
info = call('adb', {'padCode': pad, 'enable': True})['data']
user, host, rport, lport, dhost, dport = re.search(
    r'(\w+)@([\d.]+) -p (\d+) -L (\d+):([\w.]+):(\d+)', info['command']).groups()

t = paramiko.Transport((host, int(rport)))
t.connect(username=user, password=info['key'])
t.set_keepalive(30)


def pipe(cli):
    ch = t.open_channel('direct-tcpip', (dhost, int(dport)), cli.getpeername())
    while True:
        r, _, _ = select.select([cli, ch], [], [])
        src, dst = (cli, ch) if cli in r else (ch, cli)
        data = src.recv(65536)
        if not data:
            break
        dst.sendall(data)
    ch.close()
    cli.close()


srv = socket.socket()
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(('127.0.0.1', int(lport)))
srv.listen(8)
threading.Thread(target=lambda: print(subprocess.run(
    ['adb', 'connect', f'localhost:{lport}'], capture_output=True, text=True).stdout, flush=True),
    daemon=True).start()
print(f'tunel listo: localhost:{lport} (expira {info["expireTime"]})', flush=True)
while True:
    c, _ = srv.accept()
    threading.Thread(target=pipe, args=(c,), daemon=True).start()

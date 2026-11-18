# Publica en TikTok (@agentedavis, teléfono VMOS V06 ATP63362YSJXJF2F) el siguiente video de la cola.
# Lo corre el Programador de tareas de Windows a las 07:00, 11:00, 15:00 y 19:00 (hora del PC).
# Cola: tools/agente_cola.json {"cola": [["Agente davis", "pieza.mp4"], ...], "hechos": [...]}
# El video y su pie de foto (<pieza>.txt) van en LucidLink: Renders finales claude/Agente davis/
import json, os, subprocess, sys, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
COLA = ROOT / 'tools' / 'agente_cola.json'
LOG = ROOT / 'tools' / 'agente_publicar.log'


def log(msg):
    with open(LOG, 'a', encoding='utf8') as f:
        f.write(f'{datetime.datetime.now():%Y-%m-%d %H:%M} {msg}\n')


d = json.loads(COLA.read_text(encoding='utf8'))
if not d['cola']:
    sys.exit(log('cola vacia, nada que publicar'))
estilo, archivo = d['cola'][0]
env = dict(os.environ, VMOS_PAD='ATP63362YSJXJF2F')
r = subprocess.run([sys.executable, str(ROOT / 'tools' / 'tiktok_upload.py'), estilo, archivo], cwd=ROOT, env=env, timeout=3600)
if r.returncode == 0:
    d['cola'].pop(0)
    d['hechos'].append([estilo, archivo, f'{datetime.datetime.now():%Y-%m-%d %H:%M}'])
    COLA.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf8')
    log(f'publicado {estilo}/{archivo}')
else:
    log(f'FALLO {estilo}/{archivo} (codigo {r.returncode}), queda en la cola')

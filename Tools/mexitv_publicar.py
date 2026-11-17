# Publica en TikTok (@mexitve, Pixel VMOS) el siguiente video de la cola, segun el horario.
# Lo corre el Programador de tareas de Windows a las 08:00 y 18:00 (hora del PC).
# Horario: primeros 3 dias desde "inicio" solo 18:00; despues 08:00 y 18:00.
# Cola: tools/mexitv_cola.json {"inicio": "YYYY-MM-DD", "cola": [["MexiTV", "pieza.mp4"], ...], "hechos": [...]}
import json, subprocess, sys, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
COLA = ROOT / 'tools' / 'mexitv_cola.json'
LOG = ROOT / 'tools' / 'mexitv_publicar.log'


def log(msg):
    with open(LOG, 'a', encoding='utf8') as f:
        f.write(f'{datetime.datetime.now():%Y-%m-%d %H:%M} {msg}\n')


d = json.loads(COLA.read_text(encoding='utf8'))
now = datetime.datetime.now()
dia = (now.date() - datetime.date.fromisoformat(d['inicio'])).days
if dia < 0:
    sys.exit(log('aun no empieza el horario'))
if now.hour < 12 and dia < 3:
    sys.exit(log('08:00 sin publicar (primeros 3 dias: solo 18:00)'))
if not d['cola']:
    sys.exit(log('cola vacia, nada que publicar'))
estilo, archivo = d['cola'][0]
r = subprocess.run([sys.executable, str(ROOT / 'tools' / 'tiktok_upload.py'), estilo, archivo], cwd=ROOT)
if r.returncode == 0:
    d['cola'].pop(0)
    d['hechos'].append([estilo, archivo, f'{now:%Y-%m-%d %H:%M}'])
    COLA.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf8')
    log(f'publicado {estilo}/{archivo}')
else:
    log(f'FALLO {estilo}/{archivo} (codigo {r.returncode}), queda en la cola')

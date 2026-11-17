"""Lee los chats del V06 con capturas + Claude (créditos API) y responde llevando al link.
Uso: python tools/patrick_ai_inbox.py <avatar_x 88|90> [--max N] [--send]
Empieza con la pestaña abierta arriba del todo. Sin --send solo redacta (reporte en agente-davis/tiktok/dm_borradores.md)."""
import os, sys, time, random, json, base64, re, requests
os.environ.setdefault('VMOS_PAD', 'ATP63362YSJXJF2F')
sys.path.insert(0, os.path.dirname(__file__))
from tiktok_upload import nodes, tap, sh, PAD
from vmos import call, env
import anthropic

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'agente-davis', 'tiktok')
AX = int(sys.argv[1]); SEND = '--send' in sys.argv
MAX = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 999
client = anthropic.Anthropic(api_key=env()['ANTHROPIC_API_KEY'])
PROMPT = open(os.path.join(OUT, 'prompt_dm.md'), encoding='utf-8').read()
SKIP = {'Contactos', 'Chatea con tus contactos', 'Encuéntralos y chatea con ellos', 'Personas', 'Crear', 'Recuerdos', 'Monetización', 'TikTok Shop',
        'Notificaciones del sistema', 'Novedades para creadores', 'Actividad y nuevos seguidores'}


def shot():
    url = call('getLongGenerateUrl', {'padCodes': [PAD]})['data'][0]['url']
    return base64.b64encode(requests.get(url, timeout=60).content).decode()


def ask(img):
    with client.messages.stream(model='claude-sonnet-5-5', max_tokens=16000, messages=[{'role': 'user', 'content': [
            {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': img}},
            {'type': 'text', 'text': PROMPT}]}]) as s:
        msg = s.get_final_message()
    txt = ''.join(b.text for b in msg.content if b.type == 'text')
    return json.loads(re.search(r'\{.*\}', txt, re.S).group(0))


def reply(text):
    ns = nodes()
    box = next(((x, y) for t, x, y in ns if t == 'Aceptar'), None)
    if box:
        tap(*box, wait=3); ns = nodes()
    box = next(((x, y) for t, x, y in ns if y > 1170 and 200 < x < 420 and t), None)
    if not box:
        return 'SIN CAJA'
    tap(*box, wait=1.5)
    sh('input keyevent 123 ' + ' '.join(['67'] * 500)); time.sleep(4)
    call('inputText', {'padCodes': [PAD], 'text': text}); time.sleep(random.uniform(3, 5))
    send = next(((x, y) for t, x, y in nodes() if t == 'Enviar'), None)
    if not send:
        return 'SIN ENVIAR'
    tap(*send, wait=2.5)
    return 'ENVIADO'


seen, stale, done = set(), 0, 0
_lp = os.path.join(OUT, 'run_principal.log' if AX == 88 else 'run_solicitudes.log')
if os.path.exists(_lp):
    seen = {l.split(' | ')[0] for l in open(_lp, encoding='utf-8') if ' | ' in l and 'SIN CAJA' not in l}
log = open(os.path.join(OUT, 'dm_borradores.md'), 'a', encoding='utf-8')
dem = open(os.path.join(OUT, 'demandas.md'), 'a', encoding='utf-8')
while stale < 14 and done < MAX:
    ns = nodes(); rows = []
    no = next(((x, y) for t, x, y in ns if t in ('NO PERMITIR', 'No permitir')), None)
    if no:
        tap(*no, wait=2); ns = nodes()
    for _, x, ay in ns:
        if abs(x - AX) < 4 and 150 < ay < 1170:
            names = [t.strip('\u200e ') for t, nx, ny in ns if 170 < nx < 460 and ay - 45 <= ny <= ay - 10 and t]
            if names and names[0] not in SKIP and not names[0].startswith('IA de') and names[0] not in seen:
                rows.append((names[0], ay))
    stale = 0 if rows else stale + 1
    for name, y in rows:
        if done >= MAX:
            break
        seen.add(name); done += 1
        tap(330, y, wait=6)
        try:
            r = ask(shot())
        except Exception as e:
            r = {'responder': False, 'resumen': f'ERROR {e}'}
        estado = reply(r['respuesta']) if SEND and r.get('responder') else 'borrador'
        log.write(f"\n## {name} — {estado}\n- Pide: {r.get('resumen')}\n- Producto: {r.get('producto')}\n- Respuesta: {r.get('respuesta')}\n")
        log.flush()
        if r.get('demanda_nueva'):
            dem.write(f"- {r['demanda_nueva']} ({name})\n"); dem.flush()
        print(name, '|', estado, '|', r.get('producto'), flush=True)
        sh('input keyevent 4'); time.sleep(random.uniform(2, 3.5))
        if not any((t in ('Mensajes', 'Solicitudes de mensajes filtradas') and y < 150) for t, _, y in nodes()):
            sh('input keyevent 4'); time.sleep(2)
        if SEND:
            time.sleep(random.uniform(20, 60))  # ritmo humano
    sh(f'input swipe {360 + random.randint(-20, 20)} 1000 {360 + random.randint(-20, 20)} 450 500'); time.sleep(2)

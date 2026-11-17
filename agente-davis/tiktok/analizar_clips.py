"""Analiza reels de reacción de Patrick por API: fotogramas cada 3 s + transcripción local -> reporte .md."""
import base64, glob, os, subprocess, sys, tempfile
from pathlib import Path
import anthropic
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[2]
for line in (ROOT / '.env').read_text(encoding='utf-8').splitlines():
    if line.startswith('ANTHROPIC_API_KEY='):
        os.environ['ANTHROPIC_API_KEY'] = line.split('=', 1)[1].strip()

videos = sys.argv[1:]
out = Path(__file__).parent / (os.environ.get('OUT') or 'analisis_reels.md')
wm = WhisperModel('small', device='cpu', compute_type='int8')
client = anthropic.Anthropic()
report = ['---\ntype: summary\nstatus: active\ntags: [agente-davis, tiktok, formato-reaccion]\nrelatedTo: [piloto-01]\n---\n\n# Análisis de reels de reacción\n']

for v in videos:
    tmp = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-v', 'error', '-i', v, '-vf', 'fps=1/3,scale=360:-1', f'{tmp}/f%03d.jpg'], check=True)
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', v, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    segs, _ = wm.transcribe(np.frombuffer(raw, np.int16).astype(np.float32) / 32768, language='es')
    tr = '\n'.join(f'[{s.start:.1f}-{s.end:.1f}] {s.text.strip()}' for s in segs)
    content = []
    for i, f in enumerate(sorted(glob.glob(f'{tmp}/*.jpg'))):
        content += [{'type': 'text', 'text': f't={i*3}s'},
                    {'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg',
                                                 'data': base64.b64encode(open(f, 'rb').read()).decode()}}]
    content.append({'type': 'text', 'text': f"""Transcripción:
{tr}

Este reel (de otra cuenta) se usará como clip de ARRIBA en un TikTok del 'Agente Patrick Davis' (agente de ICE que aconseja a inmigrantes latinos; Patrick reacciona abajo y luego opina a cámara y recomienda su LISTA GRATIS de 15 cosas que la familia debe tener listas / Kit Plan de Emergencia Familiar; CTA: "Escríbeme LISTA en los comentarios").
Responde en español, conciso:
1. CLIPS: ¿cuántas escenas/historias distintas trae? Para cada una: tiempo inicio-fin (s), qué pasa, diálogo, si sirve sola.
2. Para CADA clip utilizable: título gancho (caja negra, máx 8 palabras, estilo "ICE llegó a… ¡MIRA lo que hizo…!"), y guion de Patrick: (a) opinión 2-3 frases (solo afirmaciones legalmente seguras: orden firmada por un juez, derecho a guardar silencio, no firmar nada sin abogado, no abrir la puerta; nada inventado), (b) giro a la familia/hijos 1-2 frases, (c) CTA a la LISTA 1-2 frases. Español natural, frases cortas, sin "no es X, es Y". Total hablado ≤ 25 s."""})
    with client.messages.stream(model='claude-sonnet-5-5', max_tokens=16000,
                                messages=[{'role': 'user', 'content': content}]) as s:
        msg = s.get_final_message()
    text = ''.join(b.text for b in msg.content if b.type == 'text')
    report.append(f'\n## {Path(v).name}\n\n{text}\n')
    print('ok', Path(v).name, flush=True)

out.write_text('\n'.join(report), encoding='utf-8')
print(out)

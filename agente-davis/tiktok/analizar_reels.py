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
out = Path(__file__).parent / 'analisis_reels.md'
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
    content.append({'type': 'text', 'text': f"""Transcripción:\n{tr}\n\nEste es un TikTok vertical del canal 'Agente Davis' (un agente de ICE que da consejos a inmigrantes). Formato: arriba un clip viral generado por IA, abajo el agente reaccionando; luego habla; luego recomienda un producto.
Describe en español, conciso:
1. Estructura con tiempos exactos (gancho, reacción, opinión, CTA/producto, cierre).
2. Layout: proporción arriba/abajo, dónde va el título gancho (texto, colores, caja), estilo de subtítulos (color, tamaño, posición, palabras por línea), etiquetas, flechas, efectos, transiciones.
3. Qué hace el agente mientras mira (gestos) y cuándo pasa a hablar a cámara (¿pantalla completa?).
4. Cómo es el CTA: frase exacta, qué se muestra en pantalla y cuánto dura.
5. Música/sonido si se nota por la transcripción.
6. Una plantilla reutilizable en 6-8 pasos."""})
    with client.messages.stream(model='claude-sonnet-5-5', max_tokens=16000,
                                messages=[{'role': 'user', 'content': content}]) as s:
        msg = s.get_final_message()
    text = ''.join(b.text for b in msg.content if b.type == 'text')
    report.append(f'\n## {Path(v).name}\n\n{text}\n')
    print('ok', Path(v).name, flush=True)

out.write_text('\n'.join(report), encoding='utf-8')
print(out)

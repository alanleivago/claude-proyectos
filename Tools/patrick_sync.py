"""Alinea la voz de VoiceStudio a un clip de Omni frase por frase (lipsync aproximado).
Uso: python tools/patrick_sync.py clip.mp4 voz.wav salida.mp4
Cada frase (cortada en . ? ! …) de la voz se estira con atempo para durar lo mismo que esa frase en el clip
y se coloca en el instante en que Omni la empieza. Imprime el desfase por frase para verificar."""
import re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

clip, voice, out = sys.argv[1:4]
wm = WhisperModel('small', device='cpu', compute_type='int8')


def words(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'],
                         capture_output=True, check=True).stdout
    segs, _ = wm.transcribe(np.frombuffer(raw, np.int16).astype(np.float32) / 32768, language='es', word_timestamps=True)
    return [w for s in segs for w in s.words]


def sentences(ws):
    out, cur = [], []
    for w in ws:
        cur.append(w)
        if re.search(r'[.?!…]\s*$', w.word):
            out.append((cur[0].start, cur[-1].end)); cur = []
    if cur:
        out.append((cur[0].start, cur[-1].end))
    return out


def by_gaps(ws, n):
    # corta en las n-1 pausas más largas entre palabras
    gaps = sorted(range(1, len(ws)), key=lambda i: ws[i].start - ws[i - 1].end, reverse=True)[:n - 1]
    cuts = [0] + sorted(gaps) + [len(ws)]
    return [(ws[cuts[k]].start, ws[cuts[k + 1] - 1].end) for k in range(len(cuts) - 1)]


wc, wv = words(clip), words(voice)
import tempfile, os
def groups(ws):
    # índices de fin de frase (palabra con . ? ! …)
    ends = [i + 1 for i, w in enumerate(ws) if re.search(r'[.?!…,]\s*$', w.word)]
    return ends if ends and ends[-1] == len(ws) else ends + [len(ws)]


def spans(ws, ends):
    st = [0] + ends[:-1]
    return [(ws[s].start, ws[e - 1].end) for s, e in zip(st, ends)]


src = wc if len(groups(wc)) >= len(groups(wv)) else wv  # el que tenga la puntuación
fr = [e / len(src) for e in groups(src)]  # fronteras como fracción de palabras
a = spans(wc, sorted({max(1, round(f * len(wc))) for f in fr}))
b = spans(wv, sorted({max(1, round(f * len(wv))) for f in fr}))
if len(a) != len(b):
    sys.exit(f'frases distintas: clip {len(a)} / voz {len(b)}')
# Retime del VIDEO por frase: cada frase de Omni dura lo mismo que esa frase en la voz (la voz nunca se acelera)
cc = [0.0] + [(a[m][1] + a[m + 1][0]) / 2 for m in range(len(a) - 1)]
vc = [0.0] + [(b[m][1] + b[m + 1][0]) / 2 for m in range(len(b) - 1)]
cend = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip], capture_output=True, text=True).stdout)
vend0 = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voice], capture_output=True, text=True).stdout)
cc.append(cend); vc.append(vend0)
fs = [min(1.3, max(0.75, (b[m][1] - b[m][0]) / (a[m][1] - a[m][0]))) for m in range(len(a))]
fs.append(fs[-1])
segs = list(zip(cc[:-1], cc[1:]))  # frase m va de cc[m] a cc[m+1]
fc, cat = [], ''
for m, ((t0, t1), f) in enumerate(zip(segs, fs)):
    fc.append(f'[0:v]trim={t0}:{t1},setpts={f}*(PTS-STARTPTS)[v{m}];[0:a]atrim={t0}:{t1},asetpts=PTS-STARTPTS,atempo={1/f}[a{m}]')
    cat += f'[v{m}][a{m}]'
fc.append(f'{cat}concat=n={len(segs)}:v=1:a=1[vc][ac];[vc]tpad=stop_mode=clone:stop_duration=1.0[v];[ac]apad=pad_dur=1.0[a]')
tmpv = os.path.join(tempfile.mkdtemp(), 'retime.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', clip, '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', tmpv], check=True)
print('video retime por frase:', [round(f, 3) for f in fs[:-1]])
clip = tmpv
wc = words(clip)
a = spans(wc, sorted({max(1, round(f * len(wc))) for f in fr}))
if len(a) != len(b):
    sys.exit(f'frases distintas tras retime: clip {len(a)} / voz {len(b)}')
# Cortes de la voz en el punto medio de la pausa entre frases (sin solapes ni ecos); la última frase llega al final del archivo
vdur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voice], capture_output=True, text=True).stdout)
cdur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip], capture_output=True, text=True).stdout)
cuts = [max(b[0][0] - 0.15, 0)] + [(b[k][1] + b[k + 1][0]) / 2 for k in range(len(b) - 1)] + [vdur]


def render(shift):
  parts, mix, prev = [], [], 0.0
  for i, ((cs, ce), (vs, ve)) in enumerate(zip(a, b)):
    cs -= shift[i]; ce -= shift[i]
    r = min(1.0, max(0.92, (ve - vs) / (ce - cs)))  # nunca acelerar la voz; como mucho 8 % más lenta
    c0 = max(vs - 0.06, cuts[i]) if i else cuts[0]
    c1 = cuts[i + 1] if i == len(a) - 1 else min(ve + 0.10, cuts[i + 1])
    start = max(cs - (vs - c0) / r, prev)  # nunca encima de la frase anterior
    prev = start + (c1 - c0) / r
    print(f'frase {i+1}: clip {cs:.2f}-{ce:.2f}  voz {vs:.2f}-{ve:.2f}  tempo {r:.3f}  entra {start:.2f}')
    parts.append(f'[1]atrim={c0}:{c1},asetpts=PTS-STARTPTS,atempo={r},afade=t=in:d=0.01,afade=t=out:st={max((c1 - c0) / r - 0.02, 0)}:d=0.02,adelay={int(start * 1000)}:all=1[p{i}]')
    mix.append(f'[p{i}]')
  total = max(cdur, prev + 0.6)
  fc = ';'.join(parts) + f';{"".join(mix)}amix=inputs={len(mix)}:normalize=0,aresample=48000,apad[a];[0:v]tpad=stop_mode=clone:stop_duration={total - cdur + 0.1}[v]'
  subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', clip, '-i', voice, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', f'{total:.3f}',
                '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
  print(f'voz termina {prev:.2f} s, video {total:.2f} s')


shift = [0.0] * len(a)
for it in range(3):
    render(shift)
    wo = words(out)
    d = [y.start - x.start for x, y in zip(wc, wo)]
    bounds = [0] + [sum(1 for w in wc if w.start <= ce) for _, ce in a]
    per = [float(np.mean(d[bounds[k]:bounds[k + 1]] or [0])) for k in range(len(a))]
    print(f'pasada {it+1}: desfase medio por frase', [round(x, 2) for x in per], 'max palabra', round(max(map(abs, d)), 2), '| palabras clip/voz', len(wc), len(wo))
    if max(map(abs, d)) <= 0.12:
        break
    shift = [s_ + p_ for s_, p_ in zip(shift, per)]
print(out)

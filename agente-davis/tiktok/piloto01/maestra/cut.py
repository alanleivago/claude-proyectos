"""Corta los silencios de los clips Omni de Patrick (cortes secos como en los TikToks de @agentedavis).
Salida: op_cut.mp4, cta_cut.mp4 y subs.json (frases con tiempos en el clip cortado)."""
import json, subprocess

W = json.load(open('v2/words.json', encoding='cp1252'))
CLIPS = {  # archivo: (silencios a cortar (energía -35 dB, solo entre palabras), grupos de palabras por subtítulo)
    'v2/2026-11-18T16-44-29-agente_hd-el-mismo-hombre-el-mismo-lugar-1.mp4':
        ([(0, .214), (1.946, 2.697), (4.145, 4.585), (6.264, 6.775), (9.429, 10.03)], [2, 3, 4, 3, 4, 3, 2, 3, 3],
         ['Esa maestra', 'es una heroína.', 'No se trata solo', 'de una escuela,', 'se trata de proteger',
          'a los niños.', 'Ningún niño', 'debería tener miedo', 'en su salón.']),
    'v2/2026-11-18T16-45-16-agente_hd-el-mismo-hombre-el-mismo-lugar-1.mp4':
        ([(0, 1.029), (3.341, 3.730), (5.484, 6.086), (9.333, 10.03)], [4, 3, 3, 3, 3, 2, 4, 2],
         ['Tengo una lista gratis', 'con 15 cosas', 'que tu familia', 'debe tener listas,', 'que sé que',
          'te salvarán', 'si vives una situación', 'como esta.']),
    'v2/2026-11-18T16-46-03-agente_hd-el-mismo-hombre-el-mismo-lugar-1.mp4':
        ([(0, 1.299), (3.490, 4.074), (4.993, 6.04)], [2, 3, 4], ['Escríbeme LISTA', 'en los comentarios', 'y te la enviaré.']),
}
PAD, TAIL = 0.07, 0.25  # aire alrededor de cada corte / cola después de la última palabra (que no se corte la voz)


def keep_segments(sil, dur):
    segs, t = [], 0.0
    for s, e in sil:
        a, b = (s + PAD, e - PAD) if s > 0 else (0, e - PAD)
        if e >= dur - 0.01:  # silencio final: dejar cola
            b = dur; a = min(s + TAIL, dur)
        if a > t: segs.append((t, a))
        t = max(t, b)
    if t < dur - 0.01: segs.append((t, dur))
    return [(a, b) for a, b in segs if b - a > 0.05]


def mapt(t, segs):
    off = 0.0
    for a, b in segs:
        if t < a: return off
        if t <= b: return off + t - a
        off += b - a
    return off


def cut(files, out):
    fc, n, subs, off = [], 0, [], 0.0
    for f in files:
        sil, groups, texts = CLIPS[f]
        dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
        segs = keep_segments(sil, dur)
        words, i = W[f.replace('/', '\\')] if f.replace('/', '\\') in W else W[f.split('/')[-1]], 0
        for g, txt in zip(groups, texts):
            st = max(words[i][0], segs[0][0])
            subs.append((round(off + mapt(st, segs), 3), txt)); i += g
        for a, b in segs:
            fc.append(f'[{files.index(f)}:v]trim={a}:{b},setpts=PTS-STARTPTS[v{n}]')
            fc.append(f'[{files.index(f)}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={b - a - 0.012}:d=0.012[a{n}]')
            n += 1
        off += sum(b - a for a, b in segs)
    fc.append(''.join(f'[v{k}][a{k}]' for k in range(n)) + f'concat=n={n}:v=1:a=1[v][a]')
    args = ['ffmpeg', '-v', 'error', '-y']
    for f in files: args += ['-i', f]
    subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '14',
                           '-r', '30', '-c:a', 'pcm_s16le', '-ar', '48000', out.replace('.mp4', '.mov')], check=True)
    subs[0] = (0.0, subs[0][1])
    return round(off, 3), subs


ks = list(CLIPS)
d1, s1 = cut([ks[0]], 'op_cut.mp4')
d2, s2 = cut([ks[1], ks[2]], 'cta_cut.mp4')
json.dump({'op': [d1, s1], 'cta': [d2, s2]}, open('subs.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(d1, d2)

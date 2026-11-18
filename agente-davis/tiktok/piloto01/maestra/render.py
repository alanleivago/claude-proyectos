"""Render del video de la maestra (formato reacción de Agente Reels_67). Salida: maestra_v3.mp4"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = 'f:/Claude Proyectos/'
REEL = ROOT + 'fuentes/mikewayne/clips/DWOzPiZk55B.mp4'
REAC = ROOT + 'Ref youtube agente/Agente reaccion.mp4'
MUSIC = ROOT + 'Ref youtube agente/Hiraoka-Kotaro-musica agente.m4a'
LISTA = ROOT + 'agente-davis/productos/kit-familiar/portada-checklist.png'
OP, CTA = 'op_cut.mov', 'cta_cut.mov'  # clips Omni sin silencios (cut.py)
FD = 'D:/Alan/Fiverr Upwork trabajo fotos y videos/Fuentes/Montserrat/'
import json
SJ = json.load(open('subs.json', encoding='utf8'))
A, B1, B2 = 10.0, SJ['op'][0], SJ['cta'][0]  # tramo de reacción, opinión y CTA
T = A + B1 + B2
TIT = ['¿ICE Llegó A La Escuela?', '¡MIRA Lo Que Hizo La Maestra!']
SUBS = [  # (inicio, fin, texto) en tiempo global
    (0.00, 1.42, '¡Fuera de mi escuela!'), (1.42, 1.96, '¿Me oyes?'), (1.96, 2.58, 'Aquí no entras,'),
    (2.58, 3.26, 'ni hoy,'), (3.26, 3.84, 'ni nunca.'), (3.84, 5.12, '¡Atrás! ¡Muévete!'),
    (5.12, 6.10, 'Créame, señora.'), (6.10, 6.78, '¡Sigue caminando!'), (6.78, 7.58, 'Quien te haya enviado,'),
    (7.58, 8.26, 'esta es mi escuela.'), (8.26, 9.04, 'Son mis niños,'), (9.04, A, 'y aquí no eres bienvenido.')]
for s, t in SJ['op'][1]: SUBS.append((A + s, 0, t))
for s, t in SJ['cta'][1]: SUBS.append((A + B1 + s, 0, t))
LISTA_IN = A + B1
# cada subtítulo dura hasta el siguiente (sin huecos) y el último de cada tramo hasta el final del tramo
for i in range(len(SUBS)):
    s_, e_, t_ = SUBS[i]
    end = next(x for x in (A, A + B1, T) if s_ < x)
    nxt = SUBS[i + 1][0] if i + 1 < len(SUBS) and SUBS[i + 1][0] < end else end
    SUBS[i] = (s_, nxt, t_)
os.makedirs('ov', exist_ok=True)


def font(sz, w, italic=False):
    f = ImageFont.truetype(FD + ('Montserrat-Italic-VariableFont_wght.ttf' if italic else 'Montserrat-VariableFont_wght.ttf'), sz)
    f.set_variation_by_name(w + (' Italic' if italic else ''))
    return f


def overlay(junction, text):
    """Lienzo transparente 1080x1920: sin texto = raya negra en la unión + título en caja negra (fijo, no parpadea);
    con texto = solo el subtítulo amarillo."""
    im = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = font(56, 'Bold'); lh = 70
    tw = max(d.textlength(l, font=f) for l in TIT)
    h = lh * len(TIT) + 30; y0 = junction - h + 4
    if not text:
        d.rectangle([0, junction - 7, 1080, junction + 7], fill='black')
        d.rounded_rectangle([540 - tw / 2 - 36, y0, 540 + tw / 2 + 36, junction + 4], 26, fill='black')
        for i, l in enumerate(TIT):
            d.text((540, y0 + 15 + lh * i + lh / 2), l, font=f, fill='white', anchor='mm')
    else:
        sz = 80
        while d.textlength(text, font=font(sz, 'Black', italic=True)) > 1000: sz -= 4
        fs = font(sz, 'Black', italic=True)
        d.text((540, y0 - 80), text, font=fs, fill='#f5f523', anchor='mm', stroke_width=7, stroke_fill='black')
    return im


def lista_png():
    p = Image.open(LISTA).convert('RGBA').resize((600, 338), Image.LANCZOS)
    m = Image.new('L', p.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, *p.size], 26, fill=255)
    p.putalpha(m)
    pad = 40; c = Image.new('RGBA', (p.width + 2 * pad, p.height + 2 * pad), (0, 0, 0, 0))
    sh = Image.new('RGBA', c.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 10, pad + p.width, pad + p.height + 10], 26, fill=(0, 0, 0, 170))
    c = Image.alpha_composite(c, sh.filter(ImageFilter.GaussianBlur(16))); c.alpha_composite(p, (pad, pad))
    c.save('ov/lista.png')
    return c.size


lw, lh_ = lista_png()
ovs = []
for i, (s, e, t) in enumerate(SUBS):
    overlay(1312 if s < A else 1080, t).save(f'ov/s{i:02d}.png'); ovs.append((s, e))
overlay(1312, '').save('ov/base_a.png'); overlay(1080, '').save('ov/base_b.png')

# --- filtros ---
top = lambda h: f'scale=1166:-2,crop=1080:{h}'  # agrandado ~8 % para quitar las franjas negras laterales del reel
bot = lambda h: f'scale=1080:{h}:force_original_aspect_ratio=increase,crop=1080:{h},eq=saturation=1.35'  # Patrick más saturado
fc = [
    '[0:v]split=3[r1][r2][r3]',
    f'[r1]{top(1312)},setsar=1,fps=30,trim=0:{A},setpts=PTS-STARTPTS[ta]',
    f'[1:v]{bot(608).replace("1.35","1.1")},setsar=1,fps=30,trim=0:{A},setpts=PTS-STARTPTS[ba]',
    '[ta][ba]vstack[va]',
    f'[r2]setpts={B1 / A}*PTS,{top(1080)},hue=s=0,setsar=1,fps=30,trim=0:{B1},setpts=PTS-STARTPTS[tb]',
    f'[r3]setpts={B2 / A}*PTS,{top(1080)},hue=s=0,setsar=1,fps=30,trim=0:{B2},setpts=PTS-STARTPTS[tc]',
    f'[2:v]{bot(840)},setsar=1,fps=30[bb]', '[tb][bb]vstack[vb]',
    f'[3:v]{bot(840)},setsar=1,fps=30[bc]', '[tc][bc]vstack[vc0]',
    f'[5:v]format=rgba,fade=t=in:st=0.05:d=0.4:alpha=1[li]',
    f'[vc0][li]overlay=x={540 - lw // 2}:y={1600 - lh_ // 2}:shortest=0:eof_action=repeat[vc]',
    '[va][vb][vc]concat=n=3:v=1:a=0[v0]',
]
inputs = ['-i', REEL, '-stream_loop', '-1', '-i', REAC, '-i', OP, '-i', CTA, '-i', MUSIC,
          '-loop', '1', '-t', str(B2), '-i', 'ov/lista.png']
inputs += ['-loop', '1', '-t', str(T), '-i', 'ov/base_a.png', '-loop', '1', '-t', str(T), '-i', 'ov/base_b.png']
fc.append(f"[v0][6:v]overlay=enable='lt(t,{A})'[ta0]")
fc.append(f"[ta0][7:v]overlay=enable='gte(t,{A})'[tb0]")
last = 'tb0'
for i, (s, e) in enumerate(ovs):
    inputs += ['-loop', '1', '-t', str(T), '-i', f'ov/s{i:02d}.png']
for i, (s, e) in enumerate(ovs):
    fc.append(f'[{last}][{8 + i}:v]overlay=enable=\'between(t,{s},{e - 0.001})\'[o{i}]'); last = f'o{i}'
fc.append(f'[{last}]format=yuv420p[v]')
# audio: reel + Patrick (op, cta) seguidos, música baja debajo
fc += [f'[0:a]atrim=0:{A},asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5,aresample=48000[a0]',
       '[2:a]loudnorm=I=-13:TP=-1.5,aresample=48000[a1]', '[3:a]loudnorm=I=-13:TP=-1.5,aresample=48000[a2]',
       '[a0][a1][a2]concat=n=3:v=0:a=1[voz]',
       f'[4:a]atrim=0:{T},asetpts=PTS-STARTPTS,volume=0.23,afade=t=out:st={T - 1.5}:d=1.5,aresample=48000[mus]',
       '[voz][mus]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]']
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]',
                '-t', str(T), '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'maestra_v3.mp4'], check=True, env=os.environ.copy(), timeout=1800)
print('maestra_v3.mp4', T)

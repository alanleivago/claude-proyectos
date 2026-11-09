"""Catálogo de peinados, atuendos y expresiones de los shorts de Gneef (API, créditos del plan Max).
Uso: .venv/bin/python fuentes/roblox-cartoon/gneef_looks.py  -> fuentes/roblox-cartoon/gneef-looks.md"""
import base64, subprocess, sys, tempfile, json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import anthropic
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
from revisar_render import load_env_key

MODEL = 'claude-sonnet-5-5'
ROOT = Path(__file__).resolve().parents[2]
VIDS = ROOT / 'Ref roblox/Gneef'
TITLES = {l.split('|')[1]: l.split('|')[2] for l in (ROOT / 'Ref roblox/list_Gneef.txt').read_text().splitlines() if l.count('|') >= 2}
client = anthropic.Anthropic(api_key=load_env_key(), timeout=600)

PER = """These are frames from a Roblox-avatar story short (vertical). I want to REPLICATE its characters' look in my own
three.js blocky-avatar kit (R15-like body, separate head, hats/hair as meshes, face = 2D decal texture, shirt/pants textures).
Catalog EVERY distinct character you see. For each one:
- role (hero, mom, villain, crowd extra...)
- HAIR: exact shape, volume, colour, how it sits (spiky, pompadour, huge afro, side-swept emo, buns, mohawk, etc.), any hat/hood
- OUTFIT: shirt/jacket/pants/shoes, colours, patterns, graphic prints, layered accessories (glasses, chains, bags, wings, masks)
- SKIN colour, body proportions (default blocky, slim, big head?)
- FACE / EXPRESSIONS: describe each face decal you see as a drawing spec (eye shape, pupils, brows angle, mouth shape, teeth,
  blush, tears, sweat, line weight) and when it appears (shock, rage, crying, smug, creepy smile...)
Then: what makes these looks "wild" (exaggeration, colour clash, scale, meme items). Be concrete, no fluff. English."""

SYN = """Below are per-video catalogs of characters from the Roblox story channel Gneef. Write a REPLICATION SPEC for my
three.js avatar kit, in English, as markdown:
1. Recurring hair styles (top ~15) with a build recipe (primitive shapes, sizes relative to a 1-unit head, colours).
2. Recurring outfits / archetypes (hero, parents, kids, villains, extras) with colours, prints and accessories.
3. Face decal library: the ~15 expressions they use most, each as a precise 2D drawing spec (eyes, brows, mouth, extras) and the story moment it is used for.
4. The "wild" rules: what makes these looks extreme and how to push it (scale, colour, layering, meme props).
5. A checklist to apply to every new video.
Be concrete and dense."""


def frames(mp4, tmp, n=14):
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp4)],
                               capture_output=True, text=True).stdout)
    out = []
    for i in range(n):
        t = dur * (i + 0.5) / n; f = tmp / f'{mp4.stem}_{i:02d}.jpg'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', str(mp4), '-frames:v', '1', '-vf', 'scale=-2:900', '-q:v', '4', str(f)])
        out.append(f)
    return out


def ask(content, mt=16000):
    with client.messages.stream(model=MODEL, max_tokens=mt, messages=[{'role': 'user', 'content': content}]) as s:
        r = s.get_final_message()
    return ''.join(b.text for b in r.content if b.type == 'text').strip()


def one(mp4):
    with tempfile.TemporaryDirectory() as d:
        c = []
        for f in frames(mp4, Path(d)):
            c.append({'type': 'image', 'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': base64.b64encode(f.read_bytes()).decode()}})
    c.append({'type': 'text', 'text': PER})
    return mp4.stem, ask(c)


vids = sorted(VIDS.glob('*.mp4'))
with ThreadPoolExecutor(5) as ex:
    res = list(ex.map(one, vids))
per = '\n\n'.join(f'## {k} — {TITLES.get(k, "")}\n\n{t}' for k, t in res)
(ROOT / 'fuentes/roblox-cartoon/gneef-looks-per-video.md').write_text(per + '\n')
spec = ask([{'type': 'text', 'text': SYN + '\n\n' + per}], 32000)
(ROOT / 'fuentes/roblox-cartoon/gneef-looks.md').write_text(
    '---\ntype: reference\nstatus: active\ntags: [roblox, gneef, characters, hair, outfits, expressions]\nrelatedTo: [styles/roblox/STYLE.md]\n---\n\n'
    f'# Gneef — peinados, atuendos y expresiones\n\nFuente: {len(vids)} shorts de Gneef (Ref roblox/Gneef), detalle en gneef-looks-per-video.md.\n\n' + spec + '\n')
print('ok', len(vids))

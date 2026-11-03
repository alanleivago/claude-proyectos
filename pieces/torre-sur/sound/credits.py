"""CREDITS.md for the recordings build.py actually uses (Freesound index + sound-layer kit credits)."""
import json, re, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.stdout.reconfigure(encoding='utf-8')
cues = json.load(open('cues.json')); idx = json.load(open('fs/index.json'))
byfile = {x['file']: x for v in idx.values() for x in v}
kit = {}
for l in open('F:/Claude Proyectos/sound-layer/kit/CREDITS.md', encoding='utf-8'):
    m = re.match(r'- (\S+): (.*)', l.strip())
    if m: kit[m.group(1)] = m.group(2)
used = {}
for c in cues:
    if 'f' in c: used.setdefault(c['f'], []).append(c['id'])
L = ['# Torre Sur: sound credits', '', 'Every sound is a real recording under CC0 (public domain); credit is not required but given. '
     'Two low sub layers (impact:sub at 5.6 s, sting:sub at 65.0 s) are code-made (a pitch-dropping sine). '
     'Simple decaying-noise reverb is processing only. Voices: VoiceStudio (project voices).', '',
     '| file | title | author | licence | source | used in |', '|---|---|---|---|---|---|']
for f, ids in sorted(used.items()):
    if f.startswith('fs/'):
        x = byfile[f]; lic = 'CC0 1.0' if 'zero' in x['license'] or 'Creative Commons 0' in x['license'] else x['license']
        L.append(f"| {f} | {x['name']} | {x['by']} | {lic} | {x['url']} | {', '.join(ids)} |")
    else:
        k = f.split('/kit/')[1].rsplit('.', 1)[0]; t = kit[k]
        m = re.match(r'"(.*)" by (.*?), (CC0), (\S+)', t)
        L.append(f"| sound-layer/kit/{k}.wav | {m.group(1)} | {m.group(2)} | CC0 1.0 | {m.group(4)} | {', '.join(ids)} |")
open('CREDITS.md', 'w', encoding='utf-8').write('\n'.join(L) + '\n'); print('\n'.join(L))

# A/B voice test: generate the excerpt lines at a native TTS speed into takes_<speed>/ (seeds given), no stretching
# usage: python abgen.py 0.82 7,21
import json, sys, subprocess, os
sp, seeds = sys.argv[1], [int(s) for s in sys.argv[2].split(',')]
IDS = 'l001 l002 l003 l004 l005 l006 l162 l163 l164 l165 l166 l167 l168 l081 l082 l083 l084 l085 l086 l087 l088'.split()
L = dict(json.load(open('../lines.json'))); ref = open('../takes/ref.txt').read().strip(); d = f'takes_{sp}'; os.makedirs(d, exist_ok=True)
for id in IDS:
    for s in seeds:
        out = f'{d}/{id}_s{s}.wav'
        if os.path.exists(out): continue
        r = subprocess.run(['curl', '-s', '-f', '-m', '300', '-o', out, '-X', 'POST', 'http://127.0.0.1:3900/generate', '-F', f'text={L[id]}', '-F', 'ref_audio=@../takes/ref_clean.wav',
                            '-F', f'ref_text={ref}', '-F', 'language=English', '-F', f'seed={s}', '-F', f'speed={sp}'])
        print(id, s, r.returncode, flush=True)

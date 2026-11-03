# Genera una toma en VoiceStudio (REST /generate). uso: vs.py out.wav "texto" instruct|profile seed guidance [speed]
import sys, requests
out, text, who, seed, g = sys.argv[1:6]; speed = sys.argv[6] if len(sys.argv) > 6 else '1.0'
d = {'text': text, 'language': 'es', 'num_step': '32', 'seed': seed, 'guidance_scale': g, 'speed': speed, 'effect_preset': 'raw'}
if len(who) == 8 and all(c in '0123456789abcdef' for c in who): d['profile_id'] = who
else: d['instruct'] = who
r = requests.post('http://127.0.0.1:3900/generate', files={k: (None, v) for k, v in d.items()}, timeout=300)
r.raise_for_status()
ct = r.headers.get('content-type', '')
if 'audio' in ct: open(out, 'wb').write(r.content)
else:
    j = r.json(); u = j.get('audio_url') or j.get('url') or j.get('audio_path'); print(j if not u else '')
    if u: open(out, 'wb').write(requests.get('http://127.0.0.1:3900' + u if u.startswith('/') else u).content)
print(out)

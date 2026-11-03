# extra takes with a TTS-only spelling or speed: python3 gen_var.py <out_id> <speed> <seeds> "<text>"
import sys, subprocess, os
oid, speed, seeds, text = sys.argv[1], sys.argv[2], sys.argv[3].split(','), sys.argv[4]
ref = open('takes/ref.txt').read().strip()
for s in seeds:
    out = f'takes/{oid}_s{s}.wav'
    if os.path.exists(out): continue
    r = subprocess.run(['curl', '-s', '-f', '-m', '300', '-o', out, '-X', 'POST', 'http://127.0.0.1:3900/generate', '-F', f'text={text}', '-F', 'ref_audio=@takes/ref_clean.wav', '-F', f'ref_text={ref}', '-F', 'language=English', '-F', f'seed={s}', '-F', f'speed={speed}'])
    print(oid, s, r.returncode, flush=True)

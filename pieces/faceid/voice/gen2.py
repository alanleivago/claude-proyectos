"""VoiceStudio clips the last syllable of a take. Each paragraph is generated with a sacrificial word ("Veamos.")
   after it, at the model's own length; whisper finds that word and the take is cut in the pause before it, so the
   real last word ends naturally. 3 seeds per paragraph; keep the one with the longest natural fall."""
import subprocess, os, sys, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); paras = [l.strip() for l in open(os.path.join(D, 'paras.txt'), encoding='utf-8') if l.strip()]
M = WhisperModel('small', device='cpu', compute_type='int8')
def db(m, sr): n = sr // 100; return 20 * np.log10(np.sqrt((m[:len(m) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
only = [int(a) for a in sys.argv[1:]] or range(1, len(paras) + 1)
for k in only:
    best = None
    for s in range(3):
        f = os.path.join(D, 'raw', f'g{k:02d}_{s}.wav')
        subprocess.run(['curl', '-s', '-X', 'POST', 'http://127.0.0.1:3900/generate', '-F', f'text={paras[k - 1]} Veamos.', '-F', 'language=Spanish', '-F', 'profile_id=44a50a60', '-F', 'num_step=32', '-F', f'seed={5000 + k * 10 + s}', '-o', f], check=True)
        x, sr = sf.read(f, always_2d=True); m = x.mean(1)
        a = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
        ws = [w for sg in M.transcribe(np.frombuffer(a, np.int16).astype(np.float32) / 32768, word_timestamps=True, language='es')[0] for w in sg.words]
        v = [w for w in ws if 'veamos' in w.word.lower()]
        if not v or len(ws) < 2: print(f'p{k:02d} s{s}: no Veamos'); continue
        e = db(m, sr); i0 = int(v[-1].start * 100)
        while i0 > 0 and e[i0] > -45: i0 -= 1                      # back into the pause before "Veamos"
        last = i0
        while last > 0 and e[last] < -30: last -= 1                 # the real last word's loud end
        fall = i0 - last; gap = 0
        j = i0
        while j > 0 and e[j] < -45: j -= 1; gap += 1
        cut = min(len(m), (i0 + 2) * sr // 100)
        print(f'p{k:02d} s{s}: cut {cut / sr:.2f}s, fall {fall * 10} ms, pause {gap * 10} ms, last heard "{ws[-2].word.strip()}"', flush=True)
        if gap >= 3 and (best is None or fall > best[0]): best = (fall, m[:cut].copy(), sr)
    if best: sf.write(os.path.join(D, 'raw2', f'p{k:02d}.wav'), best[1], best[2]); print(f'p{k:02d} -> fall {best[0] * 10} ms')
    else: print(f'p{k:02d} FAILED')

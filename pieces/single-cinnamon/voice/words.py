"""faster-whisper large-v3 word timings (same format as cheese-bank/voice/words.json).
python pieces/single-cinnamon/voice/words.py <in.wav> <out.json>"""
import json, sys
from faster_whisper import WhisperModel

src, dst = sys.argv[1], sys.argv[2]
prompt = open(__file__.replace('voice\\words.py', 'script.txt').replace('voice/words.py', 'script.txt'), encoding='utf-8').read()
m = WhisperModel('large-v3', device='cpu', compute_type='int8')
import soundfile as sf
from scipy.signal import resample_poly
a, sr = sf.read(src, dtype='float32')          # decode here (installed PyAV lacks metadata_errors)
if a.ndim > 1: a = a.mean(1)
a = resample_poly(a, 16000, sr).astype('float32')
segs, _ = m.transcribe(a, language='en', word_timestamps=True, beam_size=5)
out = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2)} for s in segs for w in s.words]
json.dump(out, open(dst, 'w', encoding='utf-8'), indent=0)
print(len(out), 'words;', ' '.join(o['w'] for o in out))

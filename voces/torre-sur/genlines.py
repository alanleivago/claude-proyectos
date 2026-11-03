# Genera cada línea clonando la toma elegida de su personaje (ref_audio), 3 semillas, verifica con whisper y elige.
import json, requests, difflib, re, numpy as np, soundfile as sf, sys
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
REF = {'diego': ('test/diego_s1.wav', '¡Dios mío! ¡Un avión chocó contra la torre! ¿Oíste? Es el otro edificio. Volvamos arriba.'),
       'pov': ('test/pov_s7.wav', '¿Amor? Algo chocó contra la otra torre... Diego... tengo un muy mal presentimiento. No deberíamos subir.'),
       'jefa': ('test/jefa_s99.wav', '¡Todos fuera! ¡Dejen todo y salgan ya! ¡Ahora!'),
       'comp': ('test/comp_s99.wav', '¿Eso es... otro avión?'),
       'pa': ('test/pa_s1.wav', 'Atención. El edificio dos es seguro. No es necesario evacuar el edificio dos.')}
m = WhisperModel('small', device='cpu', compute_type='int8')
norm = lambda s: re.sub(r'[^a-záéíóúñü ]', '', s.lower()).split()
only = sys.argv[1:]
res = {}
for lid, who, text in json.load(open('lines.json', encoding='utf-8')):
    if only and lid not in only: continue
    best = None
    for seed in (1, 2, 3):
        ra, rt = REF[who]
        d = {'text': text, 'language': 'es', 'num_step': '32', 'seed': str(seed), 'guidance_scale': '3.0', 'effect_preset': 'raw', 'ref_text': rt}
        files = {k: (None, v) for k, v in d.items()}; files['ref_audio'] = ('ref.wav', open(ra, 'rb'), 'audio/wav')
        r = requests.post('http://127.0.0.1:3900/generate', files=files, timeout=300); r.raise_for_status()
        f = f'lines/{lid}_s{seed}.wav'; open(f, 'wb').write(r.content)
        y, sr = sf.read(f, dtype='float32'); y = y if y.ndim == 1 else y.mean(1)
        hyp = ' '.join(s.text for s in m.transcribe(resample_poly(y, 16000, sr).astype('float32'), language='es')[0])
        sim = difflib.SequenceMatcher(None, norm(text), norm(hyp)).ratio()
        fr = np.array([np.sqrt(np.mean(y[i:i+sr//20]**2)) for i in range(0, len(y)-sr//20, sr//20)]) + 1e-9
        loud = 20*np.log10(np.percentile(fr, 90))
        score = sim * 10 + loud * 0.05
        print(lid, who, seed, f'sim {sim:.2f} loud {loud:.1f}', hyp.strip()[:70], flush=True)
        if sim >= 0.85 and (best is None or score > best[0]): best = (score, seed)
    res[lid] = best[1] if best else None
json.dump(res, open('lines/pick.json', 'w'), indent=0); print(res)

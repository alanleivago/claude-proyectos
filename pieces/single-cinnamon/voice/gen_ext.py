"""Frase extra de cierre (voz continua hasta 60.5 s), misma voz/ajustes; varias semillas."""
import io, json, urllib.request, sys
import soundfile as sf, scipy.signal as ss
TXT = "Because somewhere out there, a thirty-year-old is still sneezing pepper."
for s in [18, 11, 12, 13, 14, 15]:
    body = json.dumps({"model": "omnivoice", "input": TXT, "voice": "d9b69bea", "response_format": "wav", "num_step": 32,
                       "language": "English", "seed": s, "guidance_scale": 3.0, "duration": 3.5}).encode()
    r = urllib.request.urlopen(urllib.request.Request("http://127.0.0.1:3900/v1/audio/speech", data=body, headers={"Content-Type": "application/json"}), timeout=600)
    a, sr = sf.read(io.BytesIO(r.read()), dtype="float32"); a = a.mean(1) if a.ndim > 1 else a
    if sr != 48000: a = ss.resample_poly(a, 48000, sr).astype("float32")
    sf.write(f"ext2/ext_{s}.wav", a, 48000); print(s, round(len(a)/48000, 2), flush=True)

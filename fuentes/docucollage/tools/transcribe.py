import json,subprocess,wave,sys
from pathlib import Path
import numpy as np
from faster_whisper import WhisperModel
m=WhisperModel("small",device="cpu",compute_type="int8")
for d in sorted(Path(sys.argv[1]).iterdir()):
    out=d/"words.json"
    if out.exists(): continue
    wav=d/"a16.wav"
    subprocess.run(["ffmpeg","-y","-v","error","-i",str(d/"reel.mp4"),"-ac","1","-ar","16000",str(wav)],check=True)
    with wave.open(str(wav)) as w: a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    segs,_=m.transcribe(a,word_timestamps=True,language="en")
    data=[{"start":s.start,"end":s.end,"text":s.text.strip(),"words":[{"w":x.word.strip(),"s":round(x.start,2),"e":round(x.end,2)} for x in s.words]} for s in segs]
    out.write_text(json.dumps(data,ensure_ascii=False,indent=1),encoding="utf-8"); print(d.name,len(data),flush=True)

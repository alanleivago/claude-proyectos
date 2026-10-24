# generate every line of <piece>/voice/script.json with VoiceStudio (:3900), voice per speaker from voice/cast.json.
# profile voices: seeds 1,2 and keep the take whisper hears best; instruct voices: their fixed seed (retry +10 if bad).
# usage: /usr/bin/python3 vs_cast_gen.py <piece> [ids,comma,separated]
import sys, json, re, subprocess, difflib, urllib.request, uuid, os
from faster_whisper import WhisperModel
piece = sys.argv[1]; only = sys.argv[2].split(",") if len(sys.argv) > 2 else None
V = f"{piece}/voice"; os.makedirs(f"{V}/takes", exist_ok=True)
S = json.load(open(f"{V}/script.json")); CAST = json.load(open(f"{V}/cast.json"))
asr = WhisperModel("small.en", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("-", " "))
def gen(fields, out):
    b = uuid.uuid4().hex
    body = "".join(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k, v in fields.items()) + f"--{b}--\r\n"
    req = urllib.request.Request("http://localhost:3900/generate", data=body.encode(), headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=600).read())
def score(raw, text):
    heard = " ".join(s.text for s in asr.transcribe(raw, language="en")[0])
    return difflib.SequenceMatcher(None, norm(text).split(), norm(heard).split()).ratio(), heard.strip()
for L in S["lines"]:
    if only and L["id"] not in only: continue
    if not only and os.path.exists(f"{V}/{L['id']}.wav"): continue
    c = CAST[L["who"]]; base = {"text": L["text"], "language": "en", "speed": str(c.get("speed", 1.0))}
    if "profile_id" in c: base["profile_id"] = c["profile_id"]; seeds = [1, 2]
    else: base["instruct"] = c["instruct"]; seeds = [c["seed"]]
    best = None
    for sd in seeds + [s + 10 for s in seeds]:
        if best and best[0] >= 0.9: break
        raw = f"{V}/takes/{L['id']}_s{sd}.wav"
        if not os.path.exists(raw): gen({**base, "seed": str(sd)}, raw)
        sc, heard = score(raw, L["text"])
        print(f"{L['id']:16s} s{sd}: {sc:.2f} {heard[:70]}", flush=True)
        if not best or sc > best[0]: best = (sc, raw)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", best[1], "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse",
        "-ac", "1", "-ar", "44100", f"{V}/{L['id']}.wav"], check=True)
    L["file"] = f"{L['id']}.wav"; L["take_score"] = round(best[0], 3)
    json.dump(S, open(f"{V}/script.json", "w"), indent=1)
print("done")

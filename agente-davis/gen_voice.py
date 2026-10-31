"""Generate a script's voiceover with VoiceStudio (voice 'Agente davis'), paragraph by paragraph.

  python gen_voice.py guiones/01-aeropuerto-green-card.md voz/01

Resumable: paragraphs already rendered are skipped. Then joins them into <outdir>.wav
with a short pause between paragraphs.
"""
import json, os, re, subprocess, sys, time, urllib.request

API = "http://127.0.0.1:3900/v1/audio/speech"
VOICE = "d31aa86f"   # 'Agente davis' clone
SEED = 7             # same seed for every paragraph so the voice stays consistent
PAUSE = 0.45         # seconds of silence between paragraphs


# how the voice must say certain words (the script keeps the normal spelling)
SAY = {r"\bICE\b": "ais"}  # user: "ICE" se pronuncia "ais", no letra por letra


def tts(text, out):
    for pat, rep in SAY.items():
        text = re.sub(pat, rep, text)
    body = json.dumps({"model": "omnivoice", "input": text, "voice": VOICE, "language": "es",
                       "response_format": "wav", "num_step": 32, "seed": SEED}).encode()
    req = urllib.request.Request(API, body, {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=1800) as r, open(out, "wb") as f:
        f.write(r.read())


def main(script, outdir):
    paras = [p.strip() for p in open(script, encoding="utf-8").read().split("\n\n") if p.strip() and not p.lstrip().startswith("#")]  # "# Título" header is not voiced
    os.makedirs(outdir, exist_ok=True)
    for i, p in enumerate(paras, 1):
        out = os.path.join(outdir, f"p{i:02d}.wav")
        if os.path.exists(out) and os.path.getsize(out) > 1000:
            continue
        t0 = time.time()
        tts(p, out)
        print(f"[{i}/{len(paras)}] {time.time() - t0:.0f}s  {p[:50]}", flush=True)
    # join with silence
    sil = os.path.join(outdir, "_sil.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                    "-t", str(PAUSE), sil], check=True)
    lst = os.path.join(outdir, "_list.txt")
    with open(lst, "w", encoding="utf-8") as f:
        for i in range(1, len(paras) + 1):
            f.write(f"file 'p{i:02d}.wav'\n")
            if i < len(paras):
                f.write("file '_sil.wav'\n")
    final = outdir.rstrip("/\\") + ".wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-ar", "24000", "-ac", "1", final], check=True)
    print("done:", final)
    split_in_two(final, [os.path.join(outdir, f"p{i:02d}.wav") for i in range(1, len(paras) + 1)])


def split_in_two(final, parts):
    """The user records the raw video in 2 parts: cut in the paragraph pause closest to the middle."""
    import soundfile as sf
    a, sr = sf.read(final)
    total, t, best = len(a) / sr, 0.0, None
    for k, p in enumerate(parts[:-1], 1):
        t += sf.info(p).duration
        mid = t + PAUSE / 2
        if best is None or abs(mid - total / 2) < abs(best[1] - total / 2):
            best = (k, mid)
        t += PAUSE
    c = int(round(best[1] * sr))
    base = final[:-4]
    sf.write(base + "_parte1.wav", a[:c], sr)
    sf.write(base + "_parte2.wav", a[c:], sr)
    print(f"split after paragraph {best[0]}: parte1 {c / sr:.1f}s, parte2 {(len(a) - c) / sr:.1f}s")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

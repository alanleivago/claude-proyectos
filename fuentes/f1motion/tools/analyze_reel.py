"""Analiza el reel de referencia por la API (créditos): transcripción word-level + análisis de frames en ventanas."""
import base64, json, os, subprocess, sys, wave
from pathlib import Path
import numpy as np

ROOT = Path(r"F:\Claude Proyectos")
REF = ROOT / "fuentes/f1motion/ref"
VIDEO = REF / "reel.mp4"
MODEL = "claude-sonnet-5-5"
FPS = 4
WIN = 20.0

def key():
    for line in (ROOT / ".env").read_text(encoding="utf-8-sig").splitlines():
        k, s, v = line.strip().partition("=")
        if s and k.strip() == "ANTHROPIC_API_KEY":
            return v.strip().strip('"').strip("'")

def transcribe():
    out = REF / "words.json"
    if out.exists():
        return json.loads(out.read_text(encoding="utf-8"))
    from faster_whisper import WhisperModel
    wav = REF / "a16.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(VIDEO), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio, word_timestamps=True, language="en")
    data = []
    for s in segs:
        data.append({"start": s.start, "end": s.end, "text": s.text.strip(),
                     "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in s.words]})
    out.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    return data

PROMPT = """You are a senior motion designer reverse-engineering the editing style of a vertical (1080x1920, 24fps) Instagram reel so we can replicate it exactly.
These are frames sampled at {fps} fps from {a:.1f}s to {b:.1f}s (each labeled with its timestamp). Scene cut times detected in this window: {cuts}.
Transcript of this window: {tr}

Describe EVERY shot in this window in chronological order, in English, as precise numbers. For each shot:
- [start-end s] and what words are spoken
- background (color hex estimates, halftone/gradient/floor/reflection)
- every element on screen: type (face cutout on body/vehicle, pixel sprite, vector illustration, photo, UI card, text) and its position as % of frame (x,y center, width%)
- text: exact words, which font style (thin lowercase geometric sans / wide futuristic display caps / script / outline), approx cap height in px at 1080 wide, color, alignment, decoration (teal tab, gold pill, chevrons, outline stack)
- animation: how each element enters and exits (slide from where, scale pop with overshoot, mask wipe, typewriter, bounce), approx duration in frames, easing feel; camera moves (push-in, pan, whip, tilt)
- transition INTO the next shot (hard cut, whip pan, slide push, zoom-through, mask reveal, pixel dissolve, match cut) with frames duration
- how face cutouts move (bob, squash/stretch, wobble, rotation angles)
Be concise but exhaustive; use bullet lists. No intro or outro."""

def frames_for(a, b, tmp):
    for p in tmp.glob("*.jpg"):
        p.unlink()
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(a), "-t", str(b - a), "-i", str(VIDEO),
                    "-vf", f"fps={FPS},scale=384:-2", "-q:v", "4", str(tmp / "f%04d.jpg")], check=True)
    return [(a + i / FPS, p) for i, p in enumerate(sorted(tmp.glob("f*.jpg")))]

def main():
    import anthropic
    client = anthropic.Anthropic(api_key=key())
    words = transcribe()
    cuts = [float(x) for x in (REF / "scenes.txt").read_text().split()]
    dur = 181.17
    tmp = REF / "_tmp"; tmp.mkdir(exist_ok=True)
    outdir = REF / "analysis"; outdir.mkdir(exist_ok=True)
    a = 0.0
    while a < dur:
        b = min(dur, a + WIN)
        out = outdir / f"w_{int(a):03d}.md"
        if not out.exists():
            tr = " ".join(f"[{w['s']:.1f}]{w['w']}" for s in words for w in s["words"] if a <= w["s"] < b)
            content = []
            for t, p in frames_for(a, b, tmp):
                content.append({"type": "text", "text": f"[{t:.2f}s]"})
                content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(p.read_bytes()).decode()}})
            cw = ", ".join(f"{c:.2f}" for c in cuts if a <= c < b)
            content.append({"type": "text", "text": PROMPT.format(fps=FPS, a=a, b=b, cuts=cw, tr=tr)})
            with client.messages.stream(model=MODEL, max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
                r = s.get_final_message()
            out.write_text("".join(x.text for x in r.content if x.type == "text"), encoding="utf-8")
            print(f"{a:.0f}-{b:.0f}: {r.usage.input_tokens} in / {r.usage.output_tokens} out", flush=True)
        a = b

if __name__ == "__main__":
    main()

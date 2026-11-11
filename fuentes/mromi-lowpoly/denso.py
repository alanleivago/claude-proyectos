"""Dense pass over the Mr omi low-poly tutorial: 1 frame per second, sent to Claude (API credits)
in 60 s windows with the Whisper transcript of each window. Every window note goes to denso/,
then one last call merges them into DENSO.md (concrete craft details only).
Usage: .venv/bin/python -I fuentes/mromi-lowpoly/denso.py <video>"""
import base64, subprocess, sys, wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from revisar_render import load_env_key  # noqa: E402

MODEL = "claude-sonnet-5-5"
WIN = 60

PROMPT = """These are frames sampled once per second (with timestamps) from a tutorial on making low-poly PS1-style 3D shorts with Claude + Blender, plus the transcript of this window.
We make similar shorts (dog channel, low-poly Blender, photo-textured humans) and want to copy every technique that makes them better.
Describe ONLY concrete, reusable craft details you can actually see or hear, with [MM:SS]:
- example short clips: shot size, camera angle, camera movement, lens feel, composition, how cuts are paced;
- characters: model look (polycount, face = photo texture?), rig, how bodies move (mocap-like? weight, secondary motion), hands, how faces change expression (swap timing, which expressions);
- sets/props: real 3D models vs built geometry, textures, skies, lighting, fog, colour grade, PS1 effects (dither, vertex jitter, resolution);
- text on screen / captions style;
- sound: what SFX cues are listed or heard, how they're layered, music, screams;
- anything readable on screen: file names, folder names, JSON keys, motion names/categories, commands, settings, numbers.
Be exhaustive on readable on-screen text (copy lists exactly). English, bullet points, no intro."""

MERGE = """Below are dense notes from consecutive 60 s windows of the same tutorial. Merge them into one clean markdown reference in Spanish, grouped under: ## Planos y cámara, ## Personajes y rig, ## Caras y expresiones, ## Movimiento (Kimodo y librería de movimientos), ## Escenarios, props y luz, ## Sonido, ## Texto en pantalla, ## Archivos y datos visibles (copiar listas exactas), ## Ideas aplicables a un canal de perros low poly. Keep every concrete detail and [MM:SS]; drop duplicates and fluff."""


def mmss(t):
    return f"{int(t // 60):02d}:{int(t % 60):02d}"


def stream(client, content):
    with client.messages.stream(model=MODEL, max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
        r = s.get_final_message()
    print(f"  {r.usage.input_tokens} in / {r.usage.output_tokens} out", flush=True)
    return "".join(b.text for b in r.content if b.type == "text").strip()


def main():
    import anthropic, numpy as np
    from faster_whisper import WhisperModel
    video = Path(sys.argv[1])
    work = video.parent
    out = HERE / "denso"; out.mkdir(exist_ok=True)
    fr = work / "frames"; fr.mkdir(exist_ok=True)
    if not any(fr.glob("*.jpg")):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf", "fps=1,scale=640:-2",
                        "-q:v", "4", str(fr / "f%04d.jpg")], check=True)
    wav = work / "a.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs = list(WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio)[0])
    frames = sorted(fr.glob("*.jpg"))
    client = anthropic.Anthropic(api_key=load_env_key(), timeout=900)
    notes = []
    for w0 in range(0, len(frames), WIN):
        dst = out / f"w{w0 // WIN:02d}.md"
        if dst.exists():
            notes.append(dst.read_text()); continue
        content = []
        for i in range(w0, min(w0 + WIN, len(frames))):
            content.append({"type": "text", "text": f"[{mmss(i)}]"})
            content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                        "data": base64.b64encode(frames[i].read_bytes()).decode()}})
        tr = "\n".join(f"[{mmss(s.start)}] {s.text.strip()}" for s in segs if w0 - 2 <= s.start < w0 + WIN)
        content.append({"type": "text", "text": f"TRANSCRIPT:\n{tr}\n\n{PROMPT}"})
        print(f"window {mmss(w0)}", flush=True)
        txt = stream(client, content)
        dst.write_text(txt, encoding="utf-8")
        notes.append(txt)
    merged = stream(client, [{"type": "text", "text": MERGE + "\n\n" + "\n\n---\n\n".join(notes)}])
    (HERE / "DENSO.md").write_text("---\ntype: research\nstatus: done\ntags: [mromi, low-poly, tutorial]\n"
                                   "relatedTo: [fuentes/mromi-lowpoly/how-to-make-low-poly-shorts-using-claude-full-workflow.md]\n---\n"
                                   "# Mr omi low-poly tutorial: pasada densa (1 fps)\n\n" + merged + "\n", encoding="utf-8")
    print("DENSO.md written")


if __name__ == "__main__":
    main()

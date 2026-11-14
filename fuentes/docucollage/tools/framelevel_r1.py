"""Reel 1 (DIV6ZPFIx3y, YouTube 1080p copy) frame-by-frame: EVERY frame at 25 fps, windows of 3.6 s (90 frames), API credits.
Writes reels/DIV6ZPFIx3y/frames25/w_XXXX.md"""
import base64, json, subprocess, tempfile, sys
from pathlib import Path
import anthropic
ROOT = Path(r"F:\Claude Proyectos"); D = ROOT / "fuentes/docucollage/reels/DIV6ZPFIx3y"; V = D / "reel1080.mp4"
def key():
    for line in (ROOT / ".env").read_text(encoding="utf-8-sig").splitlines():
        k, s, v = line.strip().partition("=")
        if s and k.strip() == "ANTHROPIC_API_KEY": return v.strip().strip('"').strip("'")
client = anthropic.Anthropic(api_key=key())
WIN = 3.6
words = [w for s in json.loads((D / "words.json").read_text(encoding="utf-8")) for w in s["words"]]
cuts = [float(x) for x in (D / "scenes1080.txt").read_text().split()]
P = """You are reverse-engineering, frame by frame, the motion design of a vertical Instagram/YouTube short (Ali Abdaal style psychology explainer, 1080x1920, 25 fps). These are EVERY frame from {a:.2f}s to {b:.2f}s (labeled by time and frame number f = t*25). Cuts detected: {cuts}. Transcript (word start times): {tr}
Report in English, terse, numbers only where possible (px at 1080x1920, frames, %):
1. Shot list with exact first/last frame numbers and kind (talking head / host cutout over bg / photo collage / title card / transition).
2. CAMERA per shot: zoom/punch-in on the host or collage (scale start->end, over which frames, ease shape: linear/ease-out/ease-in), pans (px/frame), shake.
3. LAYERS: for every person/object/photo cutout, its motion frame by frame: entry (from where, how many frames, overshoot), drift px/s direction, scale change %/s, rotation deg, parallax relative to the background, exit.
4. TITLES (top text): font look per line; HOW letters appear (typewriter per letter? frames per letter? fade? scale?); does each letter wiggle/jitter independently (estimate amplitude px and how often it changes, in frames)? shadow (direction, offset px, blur, colour)? is there a light/shine sweep across the letters (direction, width, how many frames to cross)? how the title exits.
5. CAPTIONS (bottom pill): position/size (px), font size, and HOW words change colour: whole word instantly, or progressive left-to-right fill inside the word over its duration? timing vs speech.
6. TRANSITIONS between shots: type, frames, blur amount (px, estimate), any flash/whip/zoom.
7. STEPPING: in graphic motion, how many frames does each pose hold (1 = 25 fps, 2 = 12.5 fps, 3 = ~8 fps)? per element if different (title letters, cutouts, camera, captions).
8. SFX cues you would expect (pop, whoosh, riser, typewriter...) per event with frame.
No intro."""
od = D / "frames25"; od.mkdir(exist_ok=True)
Dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(V)],capture_output=True,text=True).stdout)
a = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
END = float(sys.argv[2]) if len(sys.argv) > 2 else 1e9
while a < min(Dur, END) - 0.05:
    b = min(Dur, a + WIN); out = od / f"w_{int(round(a*100)):05d}.md"
    if not out.exists():
        with tempfile.TemporaryDirectory() as td:
            subprocess.run(["ffmpeg","-v","error","-ss",f"{a:.3f}","-t",f"{b-a:.3f}","-i",str(V),"-vf","scale=360:640","-q:v","4",str(Path(td)/"f%04d.jpg")],check=True)
            content = []
            for i, p in enumerate(sorted(Path(td).glob("f*.jpg"))):
                t = a + i / 25
                content += [{"type":"text","text":f"[{t:.2f}s f{round(t*25)}]"},{"type":"image","source":{"type":"base64","media_type":"image/jpeg","data":base64.b64encode(p.read_bytes()).decode()}}]
        tr = " ".join(f"[{w['s']:.2f}]{w['w']}" for w in words if a - 0.3 <= w["s"] < b)
        content.append({"type":"text","text":P.format(a=a,b=b,cuts=", ".join(f"{c:.2f}" for c in cuts if a<=c<b) or "none",tr=tr)})
        for _ in range(3):
            try:
                with client.messages.stream(model="claude-sonnet-5-5",max_tokens=16000,messages=[{"role":"user","content":content}]) as s:
                    r = s.get_final_message()
                out.write_text("".join(x.text for x in r.content if x.type=="text"),encoding="utf-8"); break
            except Exception as e: print("retry", e, flush=True)
        print(f"{a:.1f}", flush=True)
    a = b
print("FIN")

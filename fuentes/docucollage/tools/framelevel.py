"""Full-coverage frame-level analysis of 4 reels (API credits). Every frame at 12.5 fps (every 2nd of 25), windows of 7.2 s.
Writes reels/<id>/framelevel/w_XXX.md and shots.json (per-shot classification)."""
import base64, json, subprocess, sys, tempfile
from pathlib import Path
import anthropic
ROOT = Path(r"F:\Claude Proyectos"); R = ROOT / "fuentes/docucollage/reels"
def key():
    for line in (ROOT / ".env").read_text(encoding="utf-8-sig").splitlines():
        k, s, v = line.strip().partition("=")
        if s and k.strip() == "ANTHROPIC_API_KEY": return v.strip().strip('"').strip("'")
client = anthropic.Anthropic(api_key=key())
WIN = 7.2
P = """You are a senior motion designer reverse-engineering the editing style of a vertical Instagram reel (psychology / self-improvement explainer, host talking to camera, editorial collage graphics). Source is 25 fps; these are EVERY 2nd frame (12.5 fps) from {a:.2f}s to {b:.2f}s, labeled with time. Detected cut times in this window (may include false positives / miss jump cuts): {cuts}.
Transcript (word start times): {tr}
Describe EVERY shot in the window in chronological order, terse, in English, with numbers (px at 1080x1920 frame, % of frame, hex colors, durations in seconds/frames at 25 fps):
- [start-end s] kind: talking-head | talking-head+overlay | graphics (designed bg/collage) | photo/broll (still or footage, with treatment) | host-cutout-over-bg | transition
- background: color/gradient/texture (paper grain, vignette, sepia, B&W, duotone, red half-circle...), photo treatment (B&W, sepia, contrast, grain)
- every element: photos, cutouts (person cut out with white/no outline?), censor bars over eyes, props, icons/emoji, hand-drawn marks (circles, grades A+/F), torn paper edges, pictograms; position x,y center % and width %; z-order (host in front of title?)
- titles: exact text, font class (serif bold/condensed serif/typewriter mono/wide sans caps/script/handwriting), weight, color hex, size (cap height px), letter spacing, alignment, position; HOW it appears (letter-by-letter typewriter: chars per second; word pop; fade; mask wipe; scale) and exits
- captions: style of the caption box (pill/rect color, radius, padding), text colors of spoken vs upcoming words, font, size, y position, how words change state (karaoke per word?), how chunks swap
- motion: every element's enter/exit (direction, distance, scale from/to, overshoot), camera push/zoom % per second, shake, parallax between layers; frames per step (is it stepped/choppy?)
- transition into next shot (hard cut, flash, whip, zoom, slide, torn paper wipe, glitch...) with duration
- what spoken word triggers each graphic event (with time)
End with ONE JSON line exactly like: {{"shots":[{{"start":s,"end":s,"kind":"...","type":"short scene type name","note":"6-15 words"}}]}}"""
def frames(v, a, b, d):
    subprocess.run(["ffmpeg","-v","error","-ss",f"{a:.3f}","-t",f"{b-a:.3f}","-i",str(v),"-vf","fps=12.5,scale=270:480","-q:v","5",str(Path(d)/"f%04d.jpg")],check=True)
    return [(a+i/12.5,p) for i,p in enumerate(sorted(Path(d).glob("f*.jpg")))]
for d in [R / x for x in sys.argv[1:]] or sorted(R.iterdir()):
    v = d/"reel.mp4"; od = d/"framelevel"; od.mkdir(exist_ok=True)
    D = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(v)],capture_output=True,text=True).stdout)
    cuts = [float(x) for x in (d/"scenes.txt").read_text().split()]
    words = [w for s in json.loads((d/"words.json").read_text(encoding="utf-8")) for w in s["words"]]
    allj = []; a = 0.0
    while a < D - 0.1:
        b = min(D, a+WIN); out = od/f"w_{int(a*10):04d}.md"
        if not out.exists():
            with tempfile.TemporaryDirectory() as td:
                content = []
                for t,p in frames(v,a,b,td):
                    content += [{"type":"text","text":f"[{t:.2f}s]"},{"type":"image","source":{"type":"base64","media_type":"image/jpeg","data":base64.b64encode(p.read_bytes()).decode()}}]
            tr = " ".join(f"[{w['s']:.2f}]{w['w']}" for w in words if a-0.5 <= w["s"] < b)
            content.append({"type":"text","text":P.format(a=a,b=b,cuts=", ".join(f"{c:.2f}" for c in cuts if a<=c<b) or "none",tr=tr)})
            for _ in range(3):
                try:
                    with client.messages.stream(model="claude-sonnet-5-5",max_tokens=16000,messages=[{"role":"user","content":content}]) as s:
                        r = s.get_final_message()
                    out.write_text("".join(x.text for x in r.content if x.type=="text"),encoding="utf-8"); break
                except Exception as e: print("retry",e,flush=True)
            print(d.name, f"{a:.1f}", flush=True)
        t = out.read_text(encoding="utf-8")
        try: allj += json.loads(t[t.rindex('{"shots"'):].strip().splitlines()[0])["shots"]
        except Exception as e: print("nojson", out.name, e)
        a = b
    (d/"shots.json").write_text(json.dumps(allj,indent=1,ensure_ascii=False),encoding="utf-8")
    print("FIN", d.name, len(allj), flush=True)

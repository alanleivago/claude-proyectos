"""Pick b-roll moments with Claude (API credits): frames every 1 s per source -> JSON of segments per intent."""
import base64, json, subprocess, sys, tempfile
from pathlib import Path
sys.path.insert(0, r"F:\Claude Proyectos\fuentes\f1motion\tools")
from analyze_reel import key
import anthropic
R = Path(__file__).resolve().parent.parent; S = R / "broll/src"
INTENTS = {
 "coaches": "a youth soccer coach or adult on the sideline looking stressed / gesturing",
 "who_pays": "an adult (parent/coach) frustrated, shrugging, hands on head, or arguing",
 "whose_fault": "kids or players pointing at each other / shrugging / confused, or a referee gesturing",
 "no_arguing": "adults or parents arguing with a referee or each other",
 "mistakes": "a kid missing the ball, falling over, or a funny soccer fail",
 "no_questions": "kids celebrating a goal happily / high fives",
}
c = anthropic.Anthropic(api_key=key()); PJ = R / "broll/picks.json"
out = json.loads(PJ.read_text(encoding="utf-8")) if PJ.exists() else {}
for v in sorted(S.glob("*.*")):
    if v.name in out: continue
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(v), "-t", "120", "-vf", "fps=1,scale=320:-2", "-q:v", "5", str(Path(d) / "f%03d.jpg")], check=True)
        content = []
        for i, p in enumerate(sorted(Path(d).glob("*.jpg"))):
            content += [{"type": "text", "text": f"[{i}s]"}, {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(p.read_bytes()).decode()}}]
    content.append({"type": "text", "text": "Frames at 1 fps from a video. For each intent below, give the best continuous segment (start,end seconds, 1.5-3 s long, one camera shot without cuts, no burned-in text/logos/watermarks if possible) or null. Also flag if the frames have big burned-in captions. Intents:\n" + json.dumps(INTENTS) + '\nReply ONLY JSON: {"has_text": bool, "segments": {"intent": [start, end, "short description", quality 1-5] | null}}'})
    for _try in range(3):
        try:
            with c.messages.stream(model="claude-sonnet-5-5", max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
                r = s.get_final_message()
            break
        except Exception as e:
            print("retry", e, flush=True)
    t = "".join(b.text for b in r.content if b.type == "text"); t = t[t.index("{"): t.rindex("}") + 1]
    out[v.name] = json.loads(t); print(v.name, json.dumps(out[v.name]), flush=True)
    PJ.write_text(json.dumps(out, indent=1), encoding="utf-8")
(R / "broll/picks.json").write_text(json.dumps(out, indent=1), encoding="utf-8")

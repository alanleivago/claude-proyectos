"""Shot-type analysis of every @zawpolyshorts short: downloads each one, detects the cuts,
takes 3 frames per shot (start/middle/end) and asks Claude (API credits) to classify size, angle
and movement. Writes planos/<slug>.json and planos/PLANOS.md with the totals.
Usage: .venv/bin/python -I fuentes/zawpolyshorts-style/planos/analizar_planos.py"""
import base64, json, subprocess, sys, collections
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from revisar_render import load_env_key  # noqa: E402

WORK = Path("/private/tmp/claude-501/-Users-alanleiva-claude-proyectos/f6eddb32-1ebc-41f0-bf7c-55a6c417e15b/scratchpad/zawplanos")
MODEL = "claude-sonnet-5-5"
UA = "Mozilla/5.0"

PROMPT = """These are the shots of one YouTube short in a low-poly PS1 3D animation style (a cat channel).
Each image is one frame sampled every 2 s, labelled "SHOT n". Consecutive frames may be the same shot; still classify each frame. Movement can only be guessed from consecutive frames of the same shot (else "static").
For EVERY shot return one JSON object, and nothing else but a JSON array:
{"shot": n, "size": one of ["extreme wide","wide","full","medium","close-up","extreme close-up","insert/object"],
 "angle": one of ["eye level (human height)","eye level (animal height)","low angle (looking up)","high angle (looking down)","overhead/top-down","dutch/tilted"],
 "pov": one of ["none","animal POV","human POV","over-the-shoulder","through window/door","screen/split"],
 "movement": one of ["static","slow push-in","slow pull-out","pan/track","orbit","fast move/whip","handheld shake","zoom"],
 "subject": short text (who/what is framed), "set": short text, "notes": short text on composition (e.g. centred subject, foreground object, symmetry)}
Judge the angle by the horizon and the floor: if we see a lot of floor below the subject's feet and the camera sits above them, it is high angle; if we see ceiling and look up at faces, it is low angle."""


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw).stdout


def shots_of(video):
    dur = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)]))
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(video), "-vf", "select='gt(scene,0.28)',showinfo",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    cuts = [float(l.split("pts_time:")[1].split()[0]) for l in out.splitlines() if "pts_time:" in l]
    edges = [0.0] + [c for c in cuts if c > 0.25] + [dur]
    shots = []
    for a, b in zip(edges, edges[1:]):
        if b - a >= 0.25:
            shots.append((a, b))
    return shots


def frame(video, t, out):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(video), "-frames:v", "1",
                    "-vf", "scale=270:-2", "-q:v", "5", str(out)], check=True)
    return out


def main():
    import anthropic
    WORK.mkdir(parents=True, exist_ok=True)
    sets = sorted(d for d in (HERE.parent / "sets").iterdir() if d.is_dir())
    lst = {"entries": [{"title": d.name, "dir": d} for d in sets]}
    client = anthropic.Anthropic(api_key=load_env_key(), timeout=600)
    allrows = []
    for e in lst["entries"]:
        slug = "".join(c if c.isalnum() else "-" for c in e["title"].lower())[:50].strip("-")
        js = HERE / f"{slug}.json"
        if js.exists():
            allrows += json.loads(js.read_text()); continue
        frames = sorted(e["dir"].glob("f_*.jpg"))
        shots = [(2.0 * i, 2.0 * i + 2) for i in range(len(frames))]
        content = []
        for i, f in enumerate(frames, 1):
            content.append({"type": "text", "text": f"SHOT {i} (frame at {2*(i-1)} s)"})
            content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                        "data": base64.b64encode(f.read_bytes()).decode()}})
        content.append({"type": "text", "text": PROMPT})
        with client.messages.stream(model=MODEL, max_tokens=16000,
                                    messages=[{"role": "user", "content": content}]) as s:
            r = s.get_final_message()
        text = "".join(b.text for b in r.content if b.type == "text").strip()
        text = text[text.find("["): text.rfind("]") + 1]
        rows = json.loads(text)
        for row, (a, b) in zip(rows, shots):
            row.update(video=e["title"], t0=round(a, 2), t1=round(b, 2), views=None)
        js.write_text(json.dumps(rows, indent=1, ensure_ascii=False))
        allrows += rows
        print(f"{e['title'][:50]}: {len(shots)} shots, {r.usage.input_tokens} in / {r.usage.output_tokens} out", flush=True)

    n = len(allrows)
    lines = [f"# Planos de Zaw Poly Shorts ({len(lst['entries'])} shorts, {n} planos)\n"]
    for key in ("size", "angle", "pov", "movement"):
        c = collections.Counter(r.get(key, "?") for r in allrows)
        lines.append(f"## {key}\n" + "\n".join(f"- {k}: {v} ({100 * v / n:.0f}%)" for k, v in c.most_common()) + "\n")
    durs = [r["t1"] - r["t0"] for r in allrows]
    lines.append(f"## duración de plano\n- media {sum(durs) / n:.2f} s, planos por short {n / len(lst['entries']):.1f}\n")
    (HERE / "PLANOS_raw.md").write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines))


if __name__ == "__main__":
    main()

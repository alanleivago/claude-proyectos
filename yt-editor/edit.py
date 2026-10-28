"""YouTube edit in the style of 'Ref youtube agente' (video 1).

  python edit.py transcribe raw.mp4            -> raw.srt (segments)
  python edit.py words raw.mp4                 -> raw.words.json (word timing)
  python edit.py build raw.mp4 cues.json out.mp4

cues.json (times are seconds in the RAW video):
  {
    "images":       [{"file": "raw/img/s01.jpg", "start": 4.0, "end": 8.0}],   # full screen
    "pips":         [{"file": "v03/cards/tr1.mp4", "x": 24, "y": 192, "w": 703, "h": 405,
                      "start": 292.5, "end": 302.4, "fade_in": 0.3}],          # side cards, video loops
    "titles":       [{"start": 0.3, "end": 5.0, "l1": "text *yellow* text", "l2": "..."}],
    "intro_at":     70.0,         # default: where he says "soy el agente ..."
    "intro_hold":   2.1,          # extra seconds the intro card stays (ref: ~7.5 s total)
    "subscribe_at": [120, 240],   # default: last "suscr..." in the transcript
    "bgm_lufs":     -24
  }
"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
W, H, FPS = 1920, 1080, 30   # raws are 1080p
BGM_LUFS = -10.8             # measured loudness of assets/bgm.mp3
LEAK_FRAMES = 20             # assets/leak/leak_000..019.png (0.67 s), cut sits in the middle
YELLOW = "&H0000D4FF&"       # #FFD400 in ASS BGR


def run(cmd, cwd=None):
    print("$", " ".join(cmd)[:200], flush=True)
    subprocess.run(cmd, check=True, cwd=cwd)


def probe_len(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", path], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def ts(sec):
    h, m = int(sec // 3600), int(sec % 3600 // 60)
    return f"{h}:{m:02d}:{sec % 60:05.2f}"


def decode_audio(raw):
    import numpy as np
    # PyAV 19 breaks faster-whisper's own loader, so decode with ffmpeg
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-vn", "-ac", "1", "-ar", "16000",
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32)


def transcribe(raw):
    from faster_whisper import WhisperModel
    model = WhisperModel("medium", device="cpu", compute_type="int8")
    segs, info = model.transcribe(decode_audio(raw), language="es", vad_filter=True, beam_size=1)
    out = os.path.splitext(raw)[0] + ".srt"
    n = 0
    with open(out, "w", encoding="utf-8") as f:
        for s in segs:
            n += 1
            f.write(f"{n}\n{ts(s.start).replace('.', ',')} --> {ts(s.end).replace('.', ',')}\n{s.text.strip()}\n\n")
    print(f"wrote {out} ({n} segments, {info.duration:.0f}s audio)")


def transcribe_words(raw):
    """Word-level timing -> raw.words.json: [[start, end, word], ...]"""
    from faster_whisper import WhisperModel
    model = WhisperModel("medium", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(decode_audio(raw), language="es", vad_filter=True, beam_size=1,
                               word_timestamps=True)
    segs = list(segs)
    words = [[round(w.start, 2), round(w.end, 2), w.word.strip()] for s in segs for w in s.words]
    # same pass also writes the segment .srt (intro / subscribe detection), so one transcription is enough
    with open(os.path.splitext(raw)[0] + ".srt", "w", encoding="utf-8") as f:
        for n, s in enumerate(segs, 1):
            f.write(f"{n}\n{ts(s.start).replace('.', ',')} --> {ts(s.end).replace('.', ',')}\n{s.text.strip()}\n\n")
    out = os.path.splitext(raw)[0] + ".words.json"
    json.dump(words, open(out, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"wrote {out} ({len(words)} words)")


def parse_srt(path):
    segs = []
    for b in open(path, encoding="utf-8").read().strip().split("\n\n"):
        p = b.split("\n")
        if len(p) < 3:
            continue
        a, c = p[1].split(" --> ")
        def sec(x):
            hh, mm, ss = x.replace(",", ".").split(":")
            return int(hh) * 3600 + int(mm) * 60 + float(ss)
        segs.append((sec(a), sec(c), " ".join(p[2:])))
    return segs


def caption_chunks(words, skip, max_chars=32):
    """One-line captions like the ref: short phrases, break on punctuation or pauses."""
    out, cur = [], []
    def flush():
        if cur:
            out.append([cur[0][0], cur[-1][1], " ".join(w[2] for w in cur)])
            cur.clear()
    for i, w in enumerate(words):
        if any(a <= w[0] < b for a, b in skip):
            flush()
            continue
        # a phrase-ending word may run a little long, so it isn't left alone on the next caption
        limit = max_chars + 8 if re.search(r"[.,;:?!]$", w[2]) else max_chars
        if cur and (len(" ".join(x[2] for x in cur)) + 1 + len(w[2]) > limit or w[0] - cur[-1][1] > 0.45):
            flush()
        cur.append(w)
        if re.search(r"[.,;:?!]$", w[2]):
            flush()
    flush()
    # hold each caption until the next one starts (short gaps only), so it doesn't flicker
    for i in range(len(out) - 1):
        if out[i + 1][0] - out[i][1] < 0.5:
            out[i][1] = out[i + 1][0]
    return out


def title_text(s):
    """'a *b c* d' -> ASS with b c in yellow."""
    return re.sub(r"\*(.+?)\*", lambda m: "{\\c" + YELLOW + "}" + m.group(1) + "{\\c&H00FFFFFF&}", s)


def write_ass(path, caps, titles):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,FreeSans,78,&H00FFFFFF,&H000000FF,&H00000000,&H78000000,-1,0,0,0,100,100,0,0,1,4,2,2,60,60,140,1
Style: Title,FreeSans,88,&H00FFFFFF,&H000000FF,&H40000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,0,2,40,40,200,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = [head]
    for a, b, text in caps:
        ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},Sub,,0,0,0,,{text}\n")
    for t in titles:
        lines = title_text(t["l1"]) + ("\\N" + title_text(t["l2"]) if t.get("l2") else "")
        # glow layer: wide blurred bright halo (white; yellow behind the highlighted words)
        glow = re.sub(r"\{\\c" + re.escape(YELLOW) + r"\}", "{\\\\3c" + YELLOW + "}", lines)
        glow = glow.replace("{\\c&H00FFFFFF&}", "{\\3c&H00FFFFFF&}")
        ev.append(f"Dialogue: 0,{ts(t['start'])},{ts(t['end'])},Title,,0,0,0,,"
                  f"{{\\bord9\\blur14\\1a&HFF&\\3a&H70&\\3c&H00FFFFFF&}}{glow}\n")
        # text layer: brighter fill, thin soft dark edge for contrast
        ev.append(f"Dialogue: 1,{ts(t['start'])},{ts(t['end'])},Title,,0,0,0,,"
                  f"{{\\bord3\\blur2\\3a&H60&}}{lines}\n")
    open(path, "w", encoding="utf-8").write("".join(ev))


ZOOM_RATE = 0.0055  # zoom per second: always a slow push-in, never a jump (user: 0.0045 a bit too slow)


def zoom_expr(shots, var="in", fps=FPS):
    """One continuous slow push-in per talking stretch; resets only under images/intro."""
    t = f"({var}/{fps})"
    expr = "1"
    for a, b in reversed(shots):
        expr = f"if(lt({t}\\,{b:.2f})\\,min(1+{ZOOM_RATE}*({t}-{a:.2f})\\,1.15)\\,{expr})"
    return expr


def persp(z, ax=0.5, ay=0.35):
    """Sub-pixel crop-zoom with perspective (zoompan rounds to whole pixels and shimmers)."""
    x0, y0 = f"{ax}*(W-W/({z}))", f"{ay}*(H-H/({z}))"
    x1, y2 = f"{x0}+W/({z})", f"{y0}+H/({z})"
    return (f"perspective=x0='{x0}':y0='{y0}':x1='{x1}':y1='{y0}':x2='{x0}':y2='{y2}':"
            f"x3='{x1}':y3='{y2}':interpolation=cubic:eval=frame")


def talk_shots(blocked, total):
    """The talking stretches between images/intro; each gets one uninterrupted slow zoom."""
    free, t = [], 0.0
    for a, b in sorted(blocked):
        if a > t:
            free.append((t, a))
        t = max(t, b)
    free.append((t, total))
    return free


def build(raw, cues_path, out):
    cues = json.load(open(cues_path, encoding="utf-8-sig"))
    raw, out = os.path.abspath(raw), os.path.abspath(out)
    base = os.path.splitext(raw)[0]
    segs = parse_srt(base + ".srt")
    words = json.load(open(base + ".words.json", encoding="utf-8"))
    raw_dur = probe_len(raw)
    work = os.path.dirname(out)
    outro_len = probe_len(os.path.join(ASSETS, "outro.mp4"))
    intro_len = probe_len(os.path.join(ASSETS, "intro.mp4"))

    intro_at = cues.get("intro_at")
    if intro_at is None:
        hit = [a for a, _, t in segs if re.search(r"(?i)soy el agente", t)]
        intro_at = hit[0] if hit else None
    hold = cues.get("intro_hold", 2.1)
    subs = cues.get("subscribe_at")
    if subs is None:
        hit = [a for a, _, t in segs if re.search(r"(?i)suscr", t)]
        subs = hit[-1:] if hit else []
    images = cues.get("images", [])
    titles = cues.get("titles", [])
    print(f"intro at {intro_at}, subscribe at {subs}, {len(images)} images, {len(titles)} titles")

    # captions: one line, skipped while a title is on screen
    caps = caption_chunks(words, [(t["start"], t["end"]) for t in titles])
    tvid = cues.get("titles_video")  # animated titles rendered with Remotion (yt-remotion), replace the ASS ones
    write_ass(os.path.join(work, "subs.ass"), caps, [] if tvid else titles)

    blocked = [(im["start"], im["end"]) for im in images]
    intro_end = None
    if intro_at is not None:
        intro_end = intro_at + intro_len + hold
        blocked.append((intro_at, intro_end))
    shots = talk_shots(blocked, raw_dur + outro_len)

    inputs = ["-i", raw, "-stream_loop", "-1", "-i", os.path.join(ASSETS, "bgm.mp3"),
              "-i", os.path.join(ASSETS, "sub_overlay.mp4"),
              "-i", os.path.join(ASSETS, "intro.mp4"),
              "-i", os.path.join(ASSETS, "outro.mp4"),
              "-f", "lavfi", "-i", "nullsrc=s=16x16:d=0.1"]  # slot 5 kept so image inputs stay at 6+
    filt = []
    # talking head: slow continuous push-in, sub-pixel so it doesn't tremble
    filt.append(f"[0:v]scale={W}:{H},fps={FPS},setsar=1,"
                f"tpad=stop_mode=clone:stop_duration={outro_len:.3f},"
                f"{persp(zoom_expr(shots))}[v0]")
    last = "v0"
    cuts = []
    for i, im in enumerate(images, start=6):
        dur = im["end"] - im["start"]
        n = int(round(dur * FPS))
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}", "-i", os.path.join(HERE, im["file"])]
        # full screen, slow zoom in
        filt.append(f"[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,"
                    f"{persp(f'1+0.006*in/{FPS}', 0.5, 0.5)},"
                    f"setpts=PTS-STARTPTS+{im['start']}/TB[im{i}]")
        filt.append(f"[{last}][im{i}]overlay=0:0:eof_action=pass[v{i}]")
        last = f"v{i}"
        cuts += [im["start"], im["end"]]
    # side cards over the talking head (red card block): rounded corners, fades, videos loop
    for j, p in enumerate(cues.get("pips", [])):
        dur = p["end"] - p["start"]
        src = os.path.join(HERE, p["file"])
        idx = sum(1 for a in inputs if a == "-i")
        if src.lower().endswith((".mp4", ".mov", ".webm")):
            inputs += ["-stream_loop", "-1", "-t", f"{dur:.3f}", "-i", src]
        else:
            inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}", "-i", src]
        pw, ph = p["w"], p["h"]
        mask = os.path.join(work, f"pipmask_{pw}x{ph}.png")
        m = Image.new("L", (pw, ph), 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, pw - 1, ph - 1), p.get("radius", 22), fill=255)
        m.save(mask)
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}", "-i", mask]
        fades = ""
        if p.get("fade_in"):
            fades += f",fade=t=in:st=0:d={p['fade_in']}:alpha=1"
        if p.get("fade_out"):
            fades += f",fade=t=out:st={dur - p['fade_out']:.3f}:d={p['fade_out']}:alpha=1"
        filt.append(f"[{idx}:v]fps={FPS},scale={pw}:{ph}:force_original_aspect_ratio=increase,crop={pw}:{ph},"
                    f"setsar=1,format=rgba[pc{j}];[{idx + 1}:v]format=gray[pm{j}];"
                    f"[pc{j}][pm{j}]alphamerge{fades},setpts=PTS-STARTPTS+{p['start']}/TB[pp{j}]")
        # soft drop shadow under the card (user: "una ligera sombra")
        pad, off = 40, 10
        shadow = os.path.join(work, f"pipshadow_{pw}x{ph}.png")
        s = Image.new("RGBA", (pw + 2 * pad, ph + 2 * pad), (0, 0, 0, 0))
        ImageDraw.Draw(s).rounded_rectangle((pad, pad, pad + pw - 1, pad + ph - 1), p.get("radius", 22),
                                            fill=(0, 0, 0, 150))
        s.filter(ImageFilter.GaussianBlur(16)).save(shadow)
        sidx = sum(1 for a in inputs if a == "-i")
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.3f}", "-i", shadow]
        filt.append(f"[{sidx}:v]format=rgba{fades},setpts=PTS-STARTPTS+{p['start']}/TB[ps{j}]")
        filt.append(f"[{last}][ps{j}]overlay={p['x'] - pad + off}:{p['y'] - pad + off}:eof_action=pass[vq{j}]")
        filt.append(f"[vq{j}][pp{j}]overlay={p['x']}:{p['y']}:eof_action=pass[vp{j}]")
        last = f"vp{j}"
    if intro_at is not None:
        filt.append(f"[3:v]scale={W}:{H},tpad=stop_mode=clone:stop_duration={hold},"
                    f"setpts=PTS-STARTPTS+{intro_at}/TB[intro]")
        filt.append(f"[{last}][intro]overlay=0:0:eof_action=pass[vi]")
        last = "vi"
        cuts += [intro_at, intro_end]
    filt.append(f"[4:v]scale={W}:{H},setpts=PTS-STARTPTS+{raw_dur}/TB[outro]")
    filt.append(f"[{last}][outro]overlay=0:0:eof_action=pass[vo]")
    last = "vo"
    cuts.append(raw_dur)
    # film burn (from the ref's "film burn.mp4") on every cut to or from full-screen material;
    # the 8 burns rotate, and each one's brightest frame sits on the cut
    burns = json.load(open(os.path.join(ASSETS, "burns", "burns.json")))
    cuts = [c for c in cuts if c <= cues.get("burn_until", 50)]  # after that: straight cuts
    use = {}
    for j, c in enumerate(cuts):
        use.setdefault(j % len(burns), []).append((j, c))
    for k, lst in use.items():
        idx = sum(1 for a in inputs if a == "-i")  # index of the input added next
        inputs += ["-framerate", str(FPS), "-i", os.path.join(ASSETS, "burns", burns[k]["dir"], "f_%03d.png")]
        filt.append(f"[{idx}:v]format=rgba,split={len(lst)}" + "".join(f"[bk{j}]" for j, _ in lst))
        for j, c in lst:
            t0 = max(c - burns[k]["peak"] / FPS, 0)
            filt.append(f"[bk{j}]setpts=PTS-STARTPTS+{t0:.3f}/TB[bt{j}]")
    for j, c in enumerate(cuts):
        filt.append(f"[{last}][bt{j}]overlay=0:0:eof_action=pass[vl{j}]")
        last = f"vl{j}"
    if subs:
        filt.append(f"[2:v]split={len(subs)}" + "".join(f"[sr{j}]" for j in range(len(subs))))
    for j, st in enumerate(subs):
        filt.append(f"[sr{j}]scale={W}:{H},colorkey=0x000000:0.15:0.05,format=rgba,setpts=PTS-STARTPTS+{st}/TB[sub{j}]")
        filt.append(f"[{last}][sub{j}]overlay=0:-60:eof_action=pass[vs{j}]")
        last = f"vs{j}"
    if tvid:
        idx = sum(1 for a in inputs if a == "-i")
        inputs += ["-i", os.path.join(HERE, tvid)]
        filt.append(f"[{idx}:v]format=yuva444p,setpts=PTS-STARTPTS[tt]")
        filt.append(f"[{last}][tt]overlay=0:0:eof_action=pass[vt]")
        last = "vt"
    fonts = os.path.relpath(os.path.join(HERE, "fonts"), work).replace("\\", "/")
    filt.append(f"[{last}]ass=subs.ass:fontsdir={fonts}[vout]")
    bgm_gain = cues.get("bgm_lufs", -29) - BGM_LUFS  # user: -27 still a little loud
    filt.append(f"[0:a]apad=pad_dur={outro_len:.3f},loudnorm=I=-14:TP=-1.5:LRA=11[va];"
                f"[1:a]volume={bgm_gain:.1f}dB[ba];"
                f"[va][ba]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.89[aout]")
    fc = ";".join(filt)
    open(os.path.join(work, "filter_debug.txt"), "w", encoding="utf-8").write(fc)
    total = min(raw_dur + outro_len, cues.get("max_t", 1e9))  # max_t: quick preview renders
    run(["ffmpeg", "-v", "error", "-y", *inputs,
         "-/filter_complex", "filter_debug.txt", "-map", "[vout]", "-map", "[aout]",
         "-c:v", "h264_nvenc", "-preset", "p5", "-cq", "19", "-b:v", "0",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
         "-t", f"{total:.3f}", out], cwd=work)
    print("done:", out)


if __name__ == "__main__":
    if sys.argv[1] == "transcribe":
        transcribe(sys.argv[2])
    elif sys.argv[1] == "words":
        transcribe_words(sys.argv[2])
    elif sys.argv[1] == "build":
        build(sys.argv[2], sys.argv[3], sys.argv[4])

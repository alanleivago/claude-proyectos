"""Stimulus 01 — builds the editable Tesseract project from the raw take (style: styles/stimulus/ESTILO.md).

python build.py            -> rebuilds stimulus-01.tsrct from scratch (source of truth = this script)
python build.py --preview T [T ...]   -> also renders preview PNGs at edit times (s) into .tesseract-work/checks/
"""
import json, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).parent
W = ROOT / ".tesseract-work"
PROJ = ROOT / "stimulus-01.tsrct"
X = str(Path(os.environ["LOCALAPPDATA"]) / "Tesseract/public-cli/0.5.0-x86_64/bin/tsrct.exe")
RAW = ROOT.parent.parent / "Ref videos Dariel/Stimulus/raw footage/1.mp4"
STY = ROOT.parent.parent / "styles/stimulus/assets"
SL = ROOT.parent.parent / "sound-layer/kit"
FPS = 24000 / 1001
RAW_MS = 56981
OUTRO_MS = 2436
FACE = (585, 880)            # presenter's face in the SOURCE frame (scale anchor)
FACE_SCR = (540, 790)        # where the face sits on screen (head at ~35-48 %); needs zoom >= 110 to hide edges
CAP_Y = 1050                 # caption baseline (~54 %, upper chest)
LIST_Y, LIST_DY = 1085, 88   # checklist baselines
DIN, GLO = "DIN Next LT Arabic", "Gloucester MT Extra Condensed"
WHITE, LIME = [1, 1, 1, 1], [0.902, 0.949, 0.353, 1]
CREAM = [0.957, 0.949, 0.627, 1]

def tsrct(*a, quiet=True):
    r = subprocess.run([X, *map(str, a)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        sys.exit(f"tsrct {a[:2]} failed:\n{r.stderr[-3000:]}\n{r.stdout[-1500:]}")
    if not quiet: print(r.stdout[-400:])
    return r.stdout

# ---------- timeline: tighten pauses (cuts only inside measured silence) ----------
words = json.loads((W / "words.json").read_text())
pauses = json.loads((W / "pauses.json").read_text())
snap = lambda s: round(round(s * FPS) / FPS, 4)
keep, cur = [], 0.0
for p in pauses:
    qs, qe = p["quiet"]
    if qe - qs < 0.40: continue
    keep.append((cur, snap(qs + 0.10))); cur = snap(qe - 0.10)
keep.append((cur, snap(min(words[-1]["e"] + 0.65, RAW_MS / 1000 - 0.1))))   # hold after "Link in bio."
segs, t = [], 0.0
for s, e in keep:
    segs.append(dict(src=s, dur=e - s, at=t)); t += e - s
EDIT_END = t

def m(src):
    """source seconds -> edit ms"""
    for g in segs:
        if g["src"] - 0.001 <= src <= g["src"] + g["dur"] + 0.001:
            return int(round((g["at"] + src - g["src"]) * 1000))
    best = min(segs, key=lambda g: min(abs(src - g["src"]), abs(src - g["src"] - g["dur"])))
    return int(round((best["at"] + min(max(src - best["src"], 0), best["dur"])) * 1000))

ws = lambda i: m(words[i]["s"])
we = lambda i: m(words[i]["e"])
END_MS = int(EDIT_END * 1000)
OUT_AT = END_MS - 300            # outro starts under the slide-out
DOC_S = (OUT_AT + OUTRO_MS) / 1000

# ---------- editorial plan ----------
# captions: (first word, last word, text, style, icon)
CAPS = [
    (0, 1, "Club directors,", "w", None),
    (2, 4, "a uniform company", "w", None),
    (5, 7, "offers your club", "w", None),
    (8, 11, "through fundraising.", "w", None),
    (12, 13, "Sounds amazing,", "w", None),
    (14, 14, "right?", "a", None),
    (15, 16, "But wait,", "w", "warning"),
    (17, 20, "read the fine print.", "a", None),
    (21, 24, "That $5,000 is", "w", None),
    (27, 30, "You can only spend", "w", None),
    (31, 34, "it with them on", "w", None),
    (35, 38, "warm-ups and jerseys.", "w", "t_shirt"),
    (39, 40, "That money", "w", None),
    (41, 44, "never leaves their store.", "a", "locked"),
    (45, 47, "Now here's how", "w", None),
    (48, 49, "fundraising with", "w", None),
    (50, 51, "Stimulus works.", "a", None),
    (52, 54, "Our custom jerseys", "w", None),
    (55, 56, "cost less", "a", "chart_decreasing"),
    (57, 60, "than big name brands,", "w", None),
    (61, 64, "and your club can", "w", None),
    (65, 68, "add a fundraising amount", "a", "money_bag"),
    (69, 71, "to each jersey.", "w", None),
    (72, 73, "Families see", "w", None),
    (74, 76, "the regular price,", "w", None),
    (77, 80, "while the fundraising markup", "w", None),
    (81, 82, "stays private.", "a", "locked"),
    (83, 85, "That extra money", "w", None),
    (86, 87, "goes directly", "w", None),
    (88, 90, "into your club", "w", None),
    (93, 95, "not store credit.", "w", "no_entry"),
    (96, 98, "Use it for", "w", None),
    (113, 115, "buys more gear.", "w", None),
    (117, 119, "gives your club", "w", None),
    (120, 123, "the freedom to invest", "a", None),
    (124, 127, "in what matters most.", "w", None),
    (128, 129, "With Stimulus,", "w", None),
    (130, 131, "you control", "a", "control_knobs"),
    (132, 134, "your fundraising amount.", "w", None),
    (135, 137, "Change it or", "w", None),
    (138, 140, "turn it off", "a", None),
    (141, 143, "at any time.", "w", None),
]
MIDS = [(25, 26, "STORE CREDIT", "credit_card", 30), (45, 47, "HOW IT WORKS", "soccer_ball", 51), (74, 76, "REGULAR PRICE", "receipt", 80), (91, 92, "IN CASH", "dollar_banknote", 95),
        (111, 112, "STORE CREDIT", "no_entry", 115), (116, 116, "CASH", "check_mark_button", 123)]  # (first, last, text, icon, last word shown)
LIST = [(99, 100, "FIELD RENTALS"), (101, 101, "COACHES"), (102, 105, "FINANCIAL ASSISTANCE"), (106, 110, "WHATEVER YOUR CLUB NEEDS")]
CTA = [(144, 146, "Want to see", "w"), (147, 149, "what your club", "w"), (150, 151, "could raise?", "a"), (152, 154, "Link in bio.", "w")]
CTA_ICON = {150: "chart_increasing", 152: "link"}
FLASHES = [ws(45), ws(91)]
# punch-in per segment (100 = wide); jumps land on new ideas, long takes drift in slowly
JUMPS = [45, 52, 61, 72, 77, 83, 86, 96, 102, 116, 128, 135, 144]   # word indices: new sentence -> instant reframe
ZOOM = [110, 120, 112, 124, 114, 122, 111, 118, 124, 112, 122, 110, 120, 114, 124, 112]

# ---------- build ----------
def build():
    if PROJ.exists(): PROJ.unlink()
    tsrct("project", "create", "--project", PROJ)
    tsrct("project", "import-video", "--project", PROJ, "--file", RAW, "--asset-id", "raw")
    tsrct("project", "import-video", "--project", PROJ, "--file", STY / "outro.mp4", "--asset-id", "outro")
    FONT_ID[DIN] = json.loads(tsrct("project", "import-font", "--project", PROJ, "--file", STY / "DIN Next LT Arabic Bold.ttf"))["assetId"]
    FONT_ID[GLO] = json.loads(tsrct("project", "import-font", "--project", PROJ, "--file", ROOT / "assets/fonts/GloucesterMTExtraCondensed-Regular.ttf"))["assetId"]
    icons = sorted({c[4] for c in CAPS if c[4]} | {x[3] for x in MIDS} | set(CTA_ICON.values()) | {"check_mark_button"})
    for ic in icons:
        tsrct("project", "import-asset", "--project", PROJ, "--file", ROOT / f"assets/icons/{ic}.png", "--asset-id", f"ic-{ic}", "--kind", "image")
    sfx = {"whoosh": SL / "whoosh/fs-30240-swoop1-flac-1.wav", "pop": SL / "pop/fs-188381-3-popping-pops-1.wav",
           "tick": SL / "tick/fs-403001-clock-tick-tik-tak-2.wav", "click": SL / "click/kenney-ui-audio-click1.wav",
           "impact": ROOT / "audio/soft-impact.wav", "voice": ROOT / "audio/voice.wav", "music": ROOT / "audio/music_696111.mp3"}
    if not sfx["impact"].exists():
        subprocess.run([sys.executable, str(Path.home() / ".claude/skills/tesseract-video/scripts/tesseract_sound.py"), "make", "--preset", "soft-impact", "--output", str(sfx["impact"])], check=True, capture_output=True)
    durs = {}
    for k, f in sfx.items():
        tsrct("project", "import-asset", "--project", PROJ, "--file", f, "--asset-id", f"a-{k}", "--kind", "audio")
        durs[k] = int(float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)], capture_output=True, text=True).stdout) * 1000)

    # ---- document JSON: videos, images, audio ----
    tsrct("project", "checkout", "--project", PROJ, "--output", W / "editable.json")
    doc = json.loads((W / "editable.json").read_text(encoding="utf-8"))
    doc["duration"] = DOC_S
    doc["backgroundColor"] = [0, 0, 0, 1]
    tfm = lambda x=0, y=0, s=100, ax=0, ay=0: {"anchorPoint": [ax, ay], "position": [x, y], "scale": [s, s], "rotation": 0, "opacity": 100}

    def video(lid, name, asset, at_ms, src_ms, dur_ms, intr, vol):
        return {"type": "Video", "id": lid, "name": name,
                "playback": {"type": "windowed", "inputRange": {"start": at_ms, "duration": dur_ms},
                             "mapping": {"type": "linear", "input": {"start": at_ms, "duration": dur_ms}, "output": {"start": 0, "duration": dur_ms}},
                             "inputOffsetMs": src_ms},
                "sourceRange": {"start": src_ms, "duration": dur_ms}, "sourceIntrinsicDuration": intr, "volume": vol,
                "transform": tfm(), "source": {"assetId": asset, "fit": "cover", "sourceRect": {"x": 0, "y": 0, "width": 1080, "height": 1920}}}

    def audio(lid, name, asset, at_ms, dur_ms, intr, vol, src_ms=0):
        return {"type": "Audio", "id": lid, "name": name,
                "playback": {"type": "windowed", "inputRange": {"start": at_ms, "duration": dur_ms},
                             "mapping": {"type": "linear", "input": {"start": at_ms, "duration": dur_ms}, "output": {"start": 0, "duration": dur_ms}},
                             "inputOffsetMs": src_ms},
                "sourceRange": {"start": src_ms, "duration": dur_ms}, "sourceIntrinsicDuration": intr, "volume": vol, "source": {"assetId": asset}}

    HOOK_END = we(11) + 250
    title_iv = [(0, HOOK_END)] + [(ws(a), we(endw) + 150) for a, b, txt, ic, endw in MIDS]
    hook = [i for i, g in enumerate(segs) if any(g["at"] * 1000 < e and (g["at"] + g["dur"]) * 1000 > s0 for s0, e in title_iv)]
    L_person = [video(300 + i, f"Person cutout {i+1}", "raw", int(segs[i]["at"] * 1000), int(segs[i]["src"] * 1000), int(segs[i]["dur"] * 1000), RAW_MS, None) for i in hook]
    for v in L_person: v.pop("volume")
    L_base = [video(100 + i, f"Shot {i+1}", "raw", int(g["at"] * 1000), int(g["src"] * 1000), int(g["dur"] * 1000), RAW_MS, None) for i, g in enumerate(segs)]
    L_outro = [video(90, "Outro (brand)", "outro", OUT_AT, 0, OUTRO_MS, OUTRO_MS, 1.0)]

    # images (icons): one layer per appearance, created here, animated by actions
    imgs, img_anim = [], []
    def icon(name, start, end, x=880, y=CAP_Y - 165, size=150, rot=8):
        lid = 2000 + len(imgs)
        s = size / 256 * 100
        imgs.append({"type": "Image", "id": lid, "name": f"Icon {name}", "blendMode": "normal",
                     "activeRange": {"start": start, "duration": max(end - start, 200)},
                     "transform": {**tfm(x, y, s, 128, 128), "rotation": rot}, "source": {"assetId": f"ic-{name}"}})
        img_anim.append((lid, s))
        sfx_at.append(("pop", start, 0.22))
    sfx_at = []

    nxt = lambda k: ws(CAPS[k + 1][0]) if k + 1 < len(CAPS) else None
    cap_items = []
    for k, (a, b, txt, st, ic) in enumerate(CAPS):
        start = ws(a)
        end = min(x for x in [nxt(k), we(b) + 900, ws(CTA[0][0])] if x is not None and x > start)
        if b == 98: end = ws(LIST[0][0])
        cap_items.append((start, end, txt, st))
        if ic: icon(ic, start + 60, end)
    for a, b, txt, ic, endw in MIDS:
        tsize = mid_size(txt)
        icon(ic, ws(a) + 180, we(endw) + 150, x=min(950, 540 + int(0.40 * tsize * len(txt) / 2) + 55), y=760 - int(tsize * 0.85), size=140, rot=-6)
    CTA_END = END_MS - 300
    for a, b, txt, st in CTA:
        if a in CTA_ICON:
            icon(CTA_ICON[a], ws(a) + 60, CTA_END, x=890 if a == 150 else 870, y=1180 if a == 150 else 1320, size=120)
    # check icons for the list
    LIST_END = ws(111)
    for n, (a, b, txt) in enumerate(LIST):
        icon("check_mark_button", ws(a), LIST_END, x=128, y=LIST_Y + n * LIST_DY - 21, size=84, rot=0)

    # sfx
    sfx_at += [("whoosh", 0, 0.35), ("whoosh", OUT_AT - 120, 0.35), ("impact", ws(8) - 40, 0.55)]
    for f in FLASHES: sfx_at.append(("whoosh", f - 200, 0.4))
    for a, *_ in MIDS: sfx_at.append(("impact", ws(a) + 120, 0.45))
    for a, b, txt in LIST: sfx_at.append(("click", ws(a), 0.35))
    aud = [audio(3000 + n, f"SFX {k}", f"a-{k}", at, durs[k], durs[k], g) for n, (k, at, g) in enumerate(sfx_at) if at >= 0]
    aud += [audio(3200 + i, f"Voice {i+1}", "a-voice", int(g["at"] * 1000), int(g["dur"] * 1000), durs["voice"], 1.0, int(g["src"] * 1000)) for i, g in enumerate(segs)]
    aud.append(audio(3900, "Music bed", "a-music", 0, OUT_AT + 200, durs["music"], 0.13))

    doc["composition"]["layers"] = imgs + L_person + L_base + L_outro + aud
    (W / "editable.json").write_text(json.dumps(doc), encoding="utf-8")
    tsrct("project", "commit", "--project", PROJ, "--file", W / "editable.json")

    # ---- actions ----
    A = []
    C = "main"
    def kf(lid, prop, pts, kind="float"):
        ks = []
        for n, p in enumerate(pts):
            t_, v = p[0], p[1]
            ease = p[2] if len(p) > 2 else "out"
            e = {"hold": {"type": "hold"}, "lin": {"type": "linear"}, "out": {"type": "cubicBezier", "x1": 0.2, "y1": 0.8, "x2": 0.3, "y2": 1},
                 "in": {"type": "cubicBezier", "x1": 0.6, "y1": 0, "x2": 0.9, "y2": 0.4}, "back": {"type": "cubicBezier", "x1": 0.3, "y1": 1.6, "x2": 0.5, "y2": 1}}[ease]
            ks.append({"id": f"k{lid}-{prop}-{n}", "layerTime": int(t_), "value": {"type": kind, "value": v}, "easing": e})
        A.append({"type": "setFxPropertyKeyframes", "compositionId": C, "property": {"layerId": lid, "propertyType": prop}, "keyframes": ks})
    def scale(lid, pts):
        kf(lid, "scaleX", pts); kf(lid, "scaleY", pts)
    def eff(lid, eid, e): A.append({"type": "addFxLayerEffect", "compositionId": C, "layerId": lid, "effectId": eid, "effect": e})
    shadow = lambda k=0.6, b=10: {"type": "dropShadow", "blendMode": "normal", "blurRadius": b, "color": [0, 0, 0, k], "enabled": True, "offset": [0, 4], "spreadRadius": 0}

    # wrap every shot in a group: zoom/slide live on the group so the footage (and its person matte) stays untouched
    for i in hook:
        A.append({"type": "applyFxVideoPersonCutout", "compositionId": C, "layerId": 300 + i, "newMatteLayerId": 500 + i, "newEffectId": 600 + i})
    def group_shot(vid, gid, i, name):
        g = segs[i]; at = int(g["at"] * 1000); d = int(g["dur"] * 1000)
        A.append({"type": "groupFxCompositionLayers", "compositionId": C, "layerIds": [500 + i, vid] if vid >= 300 else [vid],
                  "groupLayerId": gid, "name": name, "transform": tfm(FACE_SCR[0], FACE_SCR[1], ZOOM[i % len(ZOOM)], FACE[0], FACE[1])})
        z = ZOOM[i % len(ZOOM)]
        pts = [(0, z, "lin")]
        jt = [ws(j) - at for j in JUMPS if 400 < ws(j) - at < d - 400]
        for n_, tj in enumerate(jt):                                        # drift in, then snap to a new framing
            z2 = z + 12 if z < 116 else z - 10
            zj = z2 if n_ % 2 == 0 else z
            pts += [(tj - 1, pts[-1][1] + 2.5, "lin"), (tj, zj, "hold")]
        pts.append((d, pts[-1][1] + min(4, d / 1000 * 1.4), "lin"))
        if i == 0: pts = [(0, z + 16, "lin"), (330, z, "out"), (d, z + min(5, d / 1000 * 1.6), "lin")]
        scale(gid, pts)
        if i == len(segs) - 1:
            kf(gid, "positionX", [(d - 300, FACE_SCR[0], "lin"), (d, FACE_SCR[0] - 1080, "in")])
    for i in hook: group_shot(300 + i, 400 + i, i, f"Person {i+1}")
    for i in range(len(segs)): group_shot(100 + i, 200 + i, i, f"Shot {i+1}")
    A.append({"type": "addFxLayerEffect", "compositionId": C, "layerId": 100, "effectId": 700, "effect": {"type": "radialBlur", "centerX": 0.5, "centerY": 0.47, "amount": 0}})
    A.append({"type": "setFxLayerEffectParamAnimator", "compositionId": C, "layerId": 100, "effectId": 700, "paramName": "amount", "dependencies": [],
              "animator": {"type": "jsScript", "layerTimeJsCode": "var t=input.time.milliseconds; return t>=330?0:30*Math.pow(1-t/330,2);"}})
    kf(400, "opacity", [(0, 0, "hold"), (330, 100, "hold")])

    # hook title behind the presenter: counter $0 -> $5,000 landing on the spoken number
    n_person = len(imgs) + len(hook)   # root order: icons, person groups, [titles here], shots
    t0, t1 = 350, ws(8)
    HT = 800
    A.append({"type": "createFxTextLayer", "compositionId": C, "layerId": HT, "name": "Hook number", "insertIndex": n_person,
              "activeRange": {"start": t0, "duration": HOOK_END - t0},
              "transform": tfm(540, 760), "sourceText": {"text": "$5,000", "fontFamily": GLO, "fontAssetId": FONT_ID[GLO], "fontStyle": "Regular", "fontSize": 430, "fillColor": CREAM, "justification": "center"}})
    steps = max(2, (t1 - t0) // 90)
    vals = [round(5000 * (1 - (1 - n / steps) ** 2.2) / 10) * 10 for n in range(steps + 1)]
    A.append({"type": "setFxPropertyKeyframes", "compositionId": C, "property": {"layerId": HT, "propertyType": "textContent"},
              "keyframes": [{"id": f"cnt{n}", "layerTime": int(n * (t1 - t0) / steps), "value": {"type": "string", "value": f"${v:,}"}, "easing": {"type": "hold"}} for n, v in enumerate(vals)]})
    for n in range(0, steps, 2): sfx_late.append(("tick", t0 + int(n * (t1 - t0) / steps), 0.18))
    scale(HT, [(0, 80), (220, 100), (t1 - t0, 100, "hold"), (t1 - t0 + 160, 112, "out"), (t1 - t0 + 420, 100, "out")])
    kf(HT, "opacity", [(0, 0), (180, 100), (HOOK_END - t0 - 300, 100, "hold"), (HOOK_END - t0, 0, "lin")])
    eff(HT, 801, {"type": "chromaticAberration", "amount": 0.6, "direction": 90})
    eff(HT, 802, {"type": "glow", "glowThreshold": 55, "glowRadius": 28, "glowIntensity": 0.6})

    # everything below is stacked at index 0 (later = higher)
    nid = [900]
    def text(txt, start, end, x, y, size, color, font=DIN, style="Bold", skew=0, just="center", track=-10, fade=120, pop=90, idx=0):
        lid = nid[0]; nid[0] += 1
        A.append({"type": "createFxTextLayer", "compositionId": C, "layerId": lid, "name": txt[:30], "insertIndex": idx,
                  "activeRange": {"start": start, "duration": max(end - start, 100)},
                  "transform": {**tfm(x, y), "skew": skew, "skewAxis": -90 if skew else 0, "rotation": -skew},   # engine: axis -90 + counter-rotation = true italic shear
                  "sourceText": {"text": txt, "fontFamily": font, "fontAssetId": FONT_ID[font], "fontStyle": style, "fontSize": size, "fillColor": color, "justification": just, "tracking": track}})
        if fade: kf(lid, "opacity", [(0, 0), (fade, 100)])
        if pop: scale(lid, [(0, pop), (150, 100)])
        return lid

    for a, b, txt, ic, endw in MIDS:
        s, e = ws(a), we(endw) + 150
        lid = text(txt, s, e, 540, 760, mid_size(txt), CREAM, font=GLO, style="Regular", skew=0, track=0, fade=100, pop=None, idx=n_person)
        scale(lid, [(0, 135), (230, 100), (e - s, 104, "lin")])
        eff(lid, lid * 10, {"type": "chromaticAberration", "amount": 0.5, "direction": 90})
        eff(lid, lid * 10 + 1, {"type": "glow", "glowThreshold": 60, "glowRadius": 22, "glowIntensity": 0.5})
        eff(lid, lid * 10 + 2, shadow())
    for start, end, txt, st in cap_items:
        size = min(74, int(900 / (0.47 * len(txt))))     # keep long lines inside ~900 px
        lid = text(txt, start, end, 540, CAP_Y, size, LIME if st == "a" else WHITE, skew=-17 if st == "a" else 0)
        eff(lid, lid * 10, shadow())
    for n, (a, b, txt) in enumerate(LIST):
        y = LIST_Y + n * LIST_DY
        lid = text(txt, ws(a), LIST_END, 190, y, 56, LIME if n == 3 else WHITE, skew=-12, just="left", track=0, fade=180, pop=None)
        kf(lid, "positionY", [(0, y + 26), (220, y)])
        eff(lid, lid * 10, shadow(0.85, 16))
    for n, (a, b, txt, st) in enumerate(CTA):
        lid = text(txt, ws(a), CTA_END, 540, 1040 + n * 104, 84 if n == 3 else 72, LIME if st == "a" else WHITE, skew=-17 if st == "a" else 0)
        eff(lid, lid * 10, shadow(0.85, 16))
    for n, f in enumerate(FLASHES):
        lid = 1900 + n
        A.append({"type": "createFxRectLayer", "compositionId": C, "layerId": lid, "name": "Warm flash", "insertIndex": 0,
                  "activeRange": {"start": f, "duration": 340}, "transform": tfm(),
                  "rect": {"size": [1080, 1920], "fillColor": [1, 1, 0.62, 1]}})
        kf(lid, "opacity", [(0, 75), (260, 0, "out")])
    for lid, s in img_anim:
        scale(lid, [(0, 0), (170, s * 1.18, "out"), (290, s, "out")])
        kf(lid, "opacity", [(0, 0), (90, 100)])
    # icons + their pops to the very top
    for lid, s in img_anim:
        A.append({"type": "moveFxCompositionLayer", "compositionId": C, "layerId": lid, "parentLayerId": None, "insertIndex": 0})

    (W / "actions.json").write_text(json.dumps(A), encoding="utf-8")
    out = tsrct("project", "apply", "--project", PROJ, "--actions", W / "actions.json")
    warn = json.loads(out).get("warnings")
    if warn: print("WARNINGS:", json.dumps(warn)[:2000])

    # late sfx (ticks) need the asset layers too -> second commit
    if sfx_late:
        tsrct("project", "checkout", "--project", PROJ, "--output", W / "editable.json")
        doc = json.loads((W / "editable.json").read_text(encoding="utf-8"))
        for n, (k, at, g) in enumerate(sfx_late):
            doc["composition"]["layers"].append(audio(3500 + n, f"SFX {k}", f"a-{k}", at, durs[k], durs[k], g))
        (W / "editable.json").write_text(json.dumps(doc), encoding="utf-8")
        tsrct("project", "commit", "--project", PROJ, "--file", W / "editable.json")
    json.dump({"segments": segs, "edit_end_s": EDIT_END, "doc_s": DOC_S}, open(W / "timeline.json", "w"), indent=1)
    print(f"built: {len(segs)} shots, edit {EDIT_END:.2f}s + outro -> {DOC_S:.2f}s, {len(A)} actions")

sfx_late = []
FONT_ID = {}
mid_size = lambda txt: min(330, int(880 / (0.36 * len(txt))))
if __name__ == "__main__":
    build()
    if "--preview" in sys.argv:
        (W / "checks").mkdir(exist_ok=True)
        for tt in sys.argv[sys.argv.index("--preview") + 1:]:
            tsrct("preview", "--project", PROJ, "--time", tt, "--output", W / f"checks/p_{tt}.png")

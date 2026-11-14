"""v3 corrections: kicker hugs DIRECTORS + glow, white 'or', softer RGB, no riser at 2 s, no zoom right before a cut,
burn sound with its picture, icon glow, smooth music ramp into the outro."""
p = "prep/gen.py"
s = open(p, encoding="utf-8").read()
R = [
    ('top_for(K_SZ, 385)', 'top_for(K_SZ, 472)'),
    ('("or", "it", 6)', '("or", "orw", 6)'),
    ('            cls = "ln it" if st == "it" else "ln"', '            if st == "orw": st = "it"; txt = "<span class=\'orw\'>" + txt + "</span>"\n            cls = "ln it" if st == "it" else "ln"'),
    ('body = f\'<span class="cream">{fmt(txt)}</span>\' if st == "it" and "^" not in txt and "~" not in txt else fmt(txt)',
     'body = f\'<span class="cream">{fmt(txt)}</span>\' if st == "it" and "^" not in txt and "~" not in txt and "orw" not in txt else fmt(txt)'),
    ('.wfill{{color:#fff;text-shadow:0 0 14px rgba(255,255,255,.45),0 4px 10px rgba(0,0,0,.5)}}',
     '.wfill{{color:#fff;text-shadow:0 0 12px rgba(255,255,255,.7),0 0 34px rgba(255,255,255,.35),0 4px 10px rgba(0,0,0,.5)}}\n'
     '.orw{{color:#fff;font-size:1.15em;text-shadow:0 0 10px rgba(255,255,255,.6),0 2px 8px rgba(0,0,0,.9),0 0 3px rgba(0,0,0,.9)}}'),
    ('.capw .rgb{{opacity:.8;filter:blur(1.5px)}}', '.capw .rgb{{opacity:.5;filter:blur(7px)}}'),
    ('.rgb{{opacity:.6;mix-blend-mode:screen;filter:blur(5px)}}', '.rgb{{opacity:.42;mix-blend-mode:screen;filter:blur(10px)}}'),
    ('RISERS = [(8, "riser_fast", 1.1), (45,', 'RISERS = [(45,'),
    ('    sfx(f"burn{k % 4 + 1}", t - pk - 0.03 - 0.4, 0.4)   # the overlay\'s own burn sound (cut 0.4 s before the picture)',
     '    sfx(f"burn{k % 4 + 1}", t - pk - 0.03, 0.4)   # the overlay\'s own burn sound, starts with its picture'),
    ('    if not bounds or b0 - bounds[-1] >= 0.6: bounds.append(b0)   # no two jumps closer than 0.6 s',
     '    if not bounds or b0 - bounds[-1] >= 1.6: bounds.append(b0)   # no jump right before/after another one'),
    ('        dur = min(ZDUR, b - 0.05 - t)   # shorter shot -> slightly shorter zoom, never across a cut',
     '        dur = min(ZDUR, b - 0.7 - t)   # zoom settles >=0.7 s before the next cut (no zoom-then-cut jolt)'),
    ('.icon img{{width:130px;height:130px;filter:drop-shadow(0 0 10px rgba(255,255,255,.55)) drop-shadow(0 3px 6px rgba(0,0,0,.6))}}',
     '.icon img{{width:130px;height:130px;filter:drop-shadow(0 0 6px rgba(255,255,255,.9)) drop-shadow(0 0 18px rgba(255,255,255,.6)) drop-shadow(0 3px 6px rgba(0,0,0,.6))}}'),
    ('data-duration="{D - 0.3:.3f}" data-track-index="8" src="assets/music.mp3" data-volume="0.10"></audio>',
     'data-duration="{D + 0.6:.3f}" data-track-index="8" src="assets/music.mp3" data-volume="0.10" data-fade-out="0.9"></audio>'),
    ('data-volume="0.32" data-fade-in="0.2" data-fade-out="0.5"', 'data-volume="0.32" data-fade-in="0.9" data-fade-out="0.5"'),
]
for a, b in R:
    assert a in s, a[:80]
    s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s)
print("ok")

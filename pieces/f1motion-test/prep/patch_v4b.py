"""Sticker body cut via an SVG clipPath whose path is tweened with the attr plugin (CSS path() clip-path does not tween)."""
from pathlib import Path
p = Path(__file__).with_name("gen.py"); s = p.read_text(encoding="utf-8")
def rep(a, b):
    global s
    assert a in s, a[:100]
    s = s.replace(a, b)
rep('''def fold_pts(S):''', '''def fold_d(S):
    Z = SZ; c = Z - S * 0.40
    return f"M 0 0 L {Z} 0 L {Z} {Z - S:.1f} Q {c:.1f} {c:.1f} {Z - S:.1f} {Z} L 0 {Z} Z"
def fold_pts(S):''')
rep('''f'<div id="{i}b" class="sbody" style="background:linear-gradient(135deg,{color_a},{color_b});clip-path:{fold_poly(78)}">''',
    '''f'<div id="{i}b" class="sbody" style="background:linear-gradient(135deg,{color_a},{color_b});clip-path:url(#{i}cp)">''')
rep('''f'<svg class="abs" style="left:0;top:0;overflow:visible" width="{SZ}" height="{SZ}"><defs>\'''',
    '''f'<svg class="abs" style="left:0;top:0;overflow:visible" width="{SZ}" height="{SZ}"><defs><clipPath id="{i}cp" clipPathUnits="userSpaceOnUse"><path id="{i}cpp" d="{fold_d(78)}"/></clipPath>\'''')
rep('''    for pid, fn in (("f", fold_pts), ("h", fold_hl)):
        js.append(f'tl.fromTo("#{i}{pid}",{{attr:{{d:"{fn(800)}"}}}},{{attr:{{d:"{fn(78)}"}},duration:0.5,ease:"power2.out"}},{ta:.3f});')''',
    '''    for pid, fn in (("f", fold_pts), ("h", fold_hl), ("cpp", fold_d)):
        js.append(f'tl.fromTo("#{i}{pid}",{{attr:{{d:"{fn(640)}"}}}},{{attr:{{d:"{fn(78)}"}},duration:0.5,ease:"power2.out"}},{ta:.3f});')''')
rep('''    js.append(f'tl.fromTo("#{i}b",{{clipPath:"{fold_poly(78)}"}},{{clipPath:"{fold_poly(96)}",duration:{2*BOBH},ease:"sine.inOut",yoyo:true,repeat:3,immediateRender:false}},{ta + 0.5:.3f});')''', '')
# drop the old CSS clip-path entry tween on the body
import re
s = re.sub(r"\n    js\.append\(f'tl\.fromTo\(\"#\{i\}b\",\{\{clipPath:\"\{fold_poly\(800\)\}\"\}\},\{\{clipPath:\"\{fold_poly\(78\)\}\",duration:0\.5,ease:\"power2\.out\"\}\},\{ta:\.3f\}\);'\)", "", s)
p.write_text(s, encoding="utf-8"); print("ok", s.count("fold_poly(800)"))

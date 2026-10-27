"""python vtt2txt.py <in.vtt> <out.txt> — YouTube auto-subs to a de-duplicated transcript in ~20 s paragraphs."""
import re, sys

src, dst = sys.argv[1], sys.argv[2]
out, last = [], ""
for blk in open(src, encoding="utf-8").read().split("\n\n"):
    m = re.search(r"(\d\d):(\d\d):(\d\d)\.\d+ -->", blk)
    if not m:
        continue
    txt = " ".join(l for l in (re.sub(r"<[^>]+>", "", l).strip() for l in blk.split("\n")[1:] if "-->" not in l) if l)
    if not txt or txt == last:
        continue
    new = txt[len(last):].strip() if txt.startswith(last) else txt
    # auto-subs repeat the previous line before the new one
    if last and new.startswith(last.split("\n")[-1]):
        new = new[len(last.split("\n")[-1]):].strip()
    last = txt
    if new:
        out.append((int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3]), new))
paras, cur, t0 = [], [], 0
for s, w in out:
    if not cur:
        t0 = s
    cur.append(w)
    if s - t0 >= 20:
        paras.append(f"[{t0 // 60}:{t0 % 60:02d}] " + " ".join(cur)); cur = []
if cur:
    paras.append(f"[{t0 // 60}:{t0 % 60:02d}] " + " ".join(cur))
open(dst, "w", encoding="utf-8").write("\n".join(paras))
print(len(paras), "paragraphs")

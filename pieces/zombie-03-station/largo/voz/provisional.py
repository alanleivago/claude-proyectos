# Timeline PROVISIONAL (sin audio): palabras a ~2.6 palabras/s para que los decorados se puedan montar mientras se genera la
# voz. assemble.py la sustituye por la real (mismo formato). python provisional.py
import json, re
from takes import T, CH
words, t, chapters, prev = [], 0.3, [], None
for p, (tid, ch, who, text, reuse, gap) in enumerate(T, 1):
    if ch != prev: chapters.append([ch, CH[ch], round(t, 3)]); prev = ch
    ws = re.findall(r"[\w'’-]+[…,.?:]*", text)
    for w in ws:
        d = 0.16 + 0.055 * len(w)
        words.append([re.sub(r"[…\".,:?]", "", w).lower(), round(t, 3), round(t + d, 3), p, w]); t += d + 0.04
    t += gap
dur = round(t + 6.0, 2)
json.dump(dict(voice="ava", provisional=True, dur=dur, takes=[x[0] for x in T], takeChapter={x[0]: x[1] for x in T}, chapters=chapters, words=words, mouth="-" * (int(dur * 15) + 1)),
          open("../engine/timeline.json", "w", encoding="utf-8"), ensure_ascii=False)
print("dur", dur, "words", len(words))

"""Cut one long voice-over take (e.g. the Algrow "Mad 3" MP3) into the script's lines.
   usage: python split_voice.py <take.mp3> <piece dir> [--model small.en]
Reads <piece>/voice/script.json, hears every word with faster-whisper (local), aligns the script's words to the heard
ones, cuts each line at the quietest point of the silence between lines (never inside a word) and writes <piece>/voice/take/<id>.wav, setting
"file" on every line (its "after" pause is kept; default 0.2s — this style wants a continuous voice).
Then: node <skill>/tools/voice.mjs <piece>  (lines + word times -> voice.json), rebuild."""
import difflib, json, os, re, subprocess, sys
import numpy as np

args = sys.argv[1:]
model = 'small.en'
if '--model' in args: i = args.index('--model'); model = args[i + 1]; del args[i:i + 2]
take, piece = args[0], args[1]
vdir = os.path.join(piece, 'voice'); out = os.path.join(vdir, 'take'); os.makedirs(out, exist_ok=True)
S = json.load(open(os.path.join(vdir, 'script.json'), encoding='utf-8'))

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', take, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, np.float32); dur = len(audio) / 16000
from faster_whisper import WhisperModel
segs, _ = WhisperModel(model, device='cpu', compute_type='int8').transcribe(audio, word_timestamps=True, language='en', beam_size=5)
heard = [(w.word, w.start, w.end) for s in segs for w in s.words]

norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
# whisper writes numbers as digits ("23", "99.9", "100,000", "6%"); say them as words so they align with the script
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def say(n):
    if n < 20: return [ONES[n]]
    if n < 100: return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000: return [ONES[n // 100], 'hundred'] + (say(n % 100) if n % 100 else [])
    for v, w in ((10 ** 9, 'billion'), (10 ** 6, 'million'), (1000, 'thousand')):
        if n >= v: return say(n // v) + [w] + (say(n % v) if n % v else [])
def spoken(w):
    t = w.lower().strip().replace(',', '')
    m = re.fullmatch(r'[^0-9]*?(\d+)(?:\.(\d+))?(%?)[^0-9]*', t)
    if not m: return [norm(w)]
    out = say(int(m.group(1)))
    if m.group(2): out += ['point'] + [ONES[int(d)] for d in m.group(2)]
    if m.group(3): out += ['percent']
    return out
script, owner = [], []
for k, L in enumerate(S['lines']):
    for w in re.split(r'[\s\-]+', L['text']):
        if norm(w): script.append(norm(w)); owner.append(k)
hw, hidx = [], []                                                  # heard tokens (numbers spelled out) -> their word
for i, h in enumerate(heard):
    for t in spoken(h[0]):
        if t: hw.append(t); hidx.append(i)
sm = difflib.SequenceMatcher(None, script, hw, autojunk=False)
first, last = {}, {}
for a, b, n in sm.get_matching_blocks():
    for q in range(n):
        k, h = owner[a + q], heard[hidx[b + q]]
        first[k] = min(first.get(k, 1e9), h[1]); last[k] = max(last.get(k, -1e9), h[2])
# cut points: never inside a word. Between line k and k+1, look in the gap from the end of k's last heard word to the
# start of k+1's first heard word (widened when whisper's times overlap) and cut at the quietest 30 ms of the audio there.
hop = 160                                                          # 10 ms at 16 kHz
rms = np.sqrt(np.convolve(audio.astype(np.float64) ** 2, np.ones(480) / 480, mode='same') + 1e-12)[::hop]
lvl = 20 * np.log10(rms)
def quietest(t0, t1):
    """the middle of the LONGEST silence (< -45 dBFS) in [t0, t1]: a sentence ends on a longer pause than a comma;
    with no silence there, the quietest 10 ms"""
    i0, i1 = max(0, int(t0 * 100)), min(len(lvl) - 1, int(t1 * 100))
    if i1 <= i0: return t0, lvl[min(i0, len(lvl) - 1)]
    best, run = None, None
    for j in range(i0, i1 + 2):
        q = j <= i1 and lvl[j] < -45
        if q and run is None: run = j
        if not q and run is not None:
            if best is None or j - run > best[1] - best[0]: best = (run, j)
            run = None
    if best: j = (best[0] + best[1]) // 2; return j / 100, lvl[j]
    j = i0 + int(np.argmin(lvl[i0:i1 + 1])); return j / 100, lvl[j]
# a line whose last script words were not matched (e.g. numbers whisper wrote as digits) may run past its last heard word
def TAIL_UNHEARD(k):
    idx = [i for i, o in enumerate(owner) if o == k]
    matched = set(a + q for a, b, n in sm.get_matching_blocks() for q in range(n))
    return bool(idx) and idx[-1] not in matched
cuts = [0.0]
for k in range(len(S['lines']) - 1):
    lo, hi = last.get(k), first.get(k + 1)
    if lo is None and hi is None: print('warning: no heard words around line', S['lines'][k]['id'], '- cut by estimate'); cuts.append(cuts[-1] + 0.5); continue
    if lo is None: lo = hi - 0.4
    if hi is None: hi = lo + 0.4
    # never before the previous line's last word has ended (a plosive's closure inside a word, e.g. the 'b' of 'boom', is silent too)
    w0, w1 = lo - 0.06, (hi + 0.02 if hi > lo + 0.04 else lo + 0.45)
    nxt = first.get(k + 2); w1 = max(w1, min(hi + 1.2, nxt - 0.1 if nxt else hi + 1.2)) if TAIL_UNHEARD(k) else w1
    t, l = quietest(max(w0, cuts[-1] + 0.2), w1)
    if l > -38: print(f'warning: no real silence between "{S["lines"][k]["id"]}" and "{S["lines"][k + 1]["id"]}" (quietest {l:.0f} dBFS at {t:.2f}s): listen to that cut')
    cuts.append(t)
cuts.append(dur)
for k, L in enumerate(S['lines']):
    a, b = cuts[k], cuts[k + 1]
    f = os.path.join(out, L['id'] + '.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', take, '-af', f'afade=t=in:d=0.008,afade=t=out:st={max(0, b - a - 0.008):.3f}:d=0.008', '-ac', '1', '-ar', '48000', f], check=True)
    L['file'] = f'take/{L["id"]}.wav'; L.setdefault('after', 0.2)
    print(f'{L["id"]:10s} {a:7.2f}-{b:7.2f}s  cut at {lvl[min(len(lvl) - 1, int(b * 100))]:5.0f} dBFS  {L["text"][:52]}')
json.dump(S, open(os.path.join(vdir, 'script.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(f'{len(S["lines"])} lines from {dur:.1f}s; {len(heard)} words heard')

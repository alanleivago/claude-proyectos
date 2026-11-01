"""Sound design for rescate: real CC0 recordings (Freesound previews in audio/fs, the sound-layer library) placed on
the beats, which are timed to the voice (voice.json). Writes audio/track.wav (beds + effects, no voice) at -14 LUFS;
export.mjs lays the voice on top. Run: python audio/mix_track.py (from the piece folder or anywhere)."""
import json, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SR = 48000; LIB = r'F:\Claude Proyectos\sound-layer\kit'
V = json.load(open(os.path.join(ROOT, 'voice.json'), encoding='utf-8'))
DUR = V['duration']; N = int(DUR * SR)
LINE = {l['id']: l for l in V['lines']}
ORDER = [l['id'] for l in V['lines']]
S = {k: (0 if i == 0 else LINE[k]['t0'] - 0.35) for i, k in enumerate(ORDER)}           # shot starts (as in head.html)
E = {k: (S[ORDER[i + 1]] if i + 1 < len(ORDER) else DUR) for i, k in enumerate(ORDER)}   # shot ends

def fs(name): return next(os.path.join(HERE, 'fs', f) for f in os.listdir(os.path.join(HERE, 'fs')) if f.startswith(name))
def load(path, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + (['-af', af] if af else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
def norm(x, peak_db=-3):
    p = np.abs(x).max() or 1; return x * (10 ** (peak_db / 20) / p)

out = np.zeros((N, 2), np.float32)
def place(clip, t, db=0, fin=0.01, fout=0.05, dur=None, off=0.0, loop=False):
    a = int(off * SR); c = clip[a:]
    if dur is not None:
        n = int(dur * SR)
        if loop and len(c) < n: c = np.concatenate([c] + [clip] * (n // len(clip) + 1))
        c = c[:n]
    c = c.copy(); n = len(c); fi, fo = int(fin * SR), int(fout * SR)
    if fi: c[:min(fi, n)] *= np.linspace(0, 1, min(fi, n))[:, None]
    if fo: c[-min(fo, n):] *= np.linspace(1, 0, min(fo, n))[:, None]
    i = int(t * SR); j = min(N, i + n)
    if j > i: out[i:j] += c[:j - i] * 10 ** (db / 20)

# ---- sources (all checked with earshot describe/rank: what they are)
drone = norm(load(fs('drone_2')), -3)                                  # dark tense ambient music (szegvari 560618, CC0)
piano = norm(load(fs('uplift_2')), -3)                                 # "Late Autumn sky", soft solo piano (Bigvegie 661267, CC0)
jungle = norm(load(fs('jungle_0')), -3)                                # Malaysian jungle by day, birds (paulprit 619264)
river = norm(load(fs('river_2')), -3)                                  # flowing river (Tom_Kaszuba 660252)
drip = norm(load(fs('drip_2')), -3)                                    # water dripping, large echo (editor_adp 162116)
cave = norm(load(fs('cave_amb_0')), -3)                                # large cave room tone (fonografico 636124)
uw = norm(load(fs('uw_amb_1')), -3)                                    # underwater cave ambience (TommyListens 839819)
bub = norm(load(fs('bubbles_1'), 'lowpass=f=3000'), -3)                # deep bubbly rumble (loganzsound 875512)
exh = norm(load(fs('bubbles_2'), 'lowpass=f=2500'), -3)                # diver's exhaust bubbles (plaamook 409301)
heart = norm(load(fs('heartbeat_0')), -3)                              # slow heartbeat (mezcel 390425)
fishs = norm(load(fs('fishsplash_1')), -3)                             # fish splash, hook and release (paulprit 591348)
dive = norm(load(fs('divesplash_3')), -3)                              # body jumping into water (280219)
splash = norm(load(fs('splash_1')), -3)                                # water splash (swordofkings128 398039)
wade = norm(load(fs('wading_2'), 'aecho=0.8:0.5:50:0.3'), -3)          # wading, with a cave echo (JW_Audio 803663)
cheer = norm(load(fs('cheer_0')), -3)                                  # small crowd cheering (678542)
siren = norm(load(fs('siren_0'), 'lowpass=f=2500'), -3)                # distant siren (TRP 574394)
thud = [norm(load(os.path.join(LIB, p), 'lowpass=f=900'), -3) for p in [r'thump\fs-342535-medium-thud-1-1.wav', r'thump\fs-405535-thud-4-wav-1.wav', r'thump\fs-496187-light-body-thud-on-clothing-1.wav']]
boom_short = norm(load(os.path.join(LIB, r'boom\fs-13895-43-wav-1.wav'), 'lowpass=f=600'), -3)
drop = norm(load(os.path.join(LIB, r'boom\fs-141570-4-sec-drop-wav-1.wav')), -3)
cold = norm(load(os.path.join(LIB, r'hit\fs-130855-cold-cave-a-mp3-1.wav')), -3)

def word(k, w): return next(x['t0'] for x in LINE[k]['words'] if x['w'].lower().startswith(w))
PAY = S['light']                       # the payoff hit lands on the cut to "Y por fin... la luz"
TURN = word('voice', 'vivo')           # the music turns lighter on "esta vivo"
# ---- music: the dark drone until "vivo", then the soft piano; out for the 0.85 s before the payoff, back after
def bed(clip, a, b, fin, fout, gain_db):
    n = int((b - a) * SR); c = clip[:n] if len(clip) >= n else np.concatenate([clip] * (n // len(clip) + 1))[:n]
    place(c, a, gain_db, fin, fout)
bed(drone, 0, TURN + 1.5, 2.0, 2.5, -17)
bed(piano, TURN - 0.5, DUR, 3.0, 3.0, -15)

# ---- beds per place
OUT = [('river', S['river'], E['river']), ('fish', S['fish'], S['fish'] + 1.2), ('search', S['search'], E['search']),
       ('gust', S['gust'], S['gust'] + 3.6), ('out', S['out'] + 2.6, E['out']), ('light', S['light'] + 1.35, E['light']),
       ('hospital', S['hospital'], E['hospital']), ('end', S['end'], DUR)]
for k, a, b in OUT:
    db = {'search': -26, 'end': -24, 'hospital': -21}.get(k, -18)
    place(jungle, a, db, 0.3, 0.6, dur=b - a, off=(a * 1.7) % 150, loop=True)
    place(river, a, db - 3, 0.3, 0.6, dur=b - a, off=(a * 2.3) % 50, loop=True)
CAVE = [('hook', 0, E['hook']), ('lost', S['lost'] + 3.7, E['lost']), ('days', S['days'], E['days']), ('chamber', S['chamber'] + 2.7, E['chamber']),
        ('voice', S['voice'], E['voice']), ('promise', S['promise'], E['promise']), ('brief', S['brief'], E['brief'])]
for k, a, b in CAVE:
    place(cave, a, -24, 0.3, 0.4, dur=b - a, off=(a * 1.3) % 40, loop=True)
    place(drip, a, -12 if k == 'days' else -18, 0.3, 0.4, dur=b - a, off=(a * 3.1) % 50, loop=True)   # the spring
UNDER = [('fish', S['fish'] + 0.6, E['fish']), ('lost', S['lost'], S['lost'] + 3.8), ('gust', S['gust'] + 3.6, E['gust']), ('chamber', S['chamber'], S['chamber'] + 2.8),
         ('out', S['out'], S['out'] + 2.7), ('back', S['back'], E['back']), ('file', S['file'], E['file']), ('light', S['light'], S['light'] + 1.4)]
for k, a, b in UNDER:                                                                            # under water: muffled cave
    place(uw, a, -14, 0.15, 0.25, dur=b - a, off=(a * 3.7) % 10, loop=True)
    place(bub, a, -20, 0.2, 0.4, dur=b - a, off=(a * 2.3) % 40, loop=True)
place(uw, S['search'], -20, 0.3, 0.4, dur=E['search'] - S['search'], off=3, loop=True)           # the diver in the search
for k in ['search', 'gust', 'back', 'file']:                                                     # divers breathing out
    a = S[k] + (4.0 if k == 'gust' else 0.5)
    for i in range(int((E[k] - a) / 2.6)): place(exh, a + i * 2.6, -15, 0.02, 0.3, dur=1.6, off=(i % 3) * 1.5)
for k in ['lost', 'chamber', 'voice', 'promise', 'brief']: place(wade, S[k] + (3.8 if k == 'lost' else 2.8 if k == 'chamber' else 0), -24, 0.3, 0.4, dur=2.5, off=3)

# ---- events
place(cold, 0.15, -10, 0.01, 1.5)                                                                # cold open
place(splash, S['fish'] + 0.4, -14, 0.005, 0.4)                                                  # he ducks under
place(fishs, word('fish', 'pez'), -12, 0.005, 0.4)                                               # the fish
place(heart, S['lost'], -15, 0.6, 0.5, dur=3.8, loop=True)
place(bub, S['lost'], -18, 0.2, 0.5, dur=3.8, off=10)                                            # panic in the dark
place(splash, S['lost'] + 3.75, -12, 0.005, 0.4)                                                 # he surfaces in the pocket
place(thud[2], word('search', 'arp'), -14, 0.002, 0.3)                                           # the speargun found
for dt in [0, 1.4, 3.0, 4.0, 5.0, 6.1]: place(boom_short, S['days'] + dt, -20, 0.005, 0.6)       # each jump of the time-lapse
place(dive, S['gust'] + 3.3, -8, 0.005, 0.5)                                                     # Gust goes in
place(splash, S['chamber'] + 2.7, -13, 0.005, 0.4)                                               # he surfaces in the chamber
place(splash, S['out'] + 2.6, -13, 0.005, 0.4)                                                   # back out in the river
place(thud[0], S['brief'] + 1.5, -12, 0.002, 0.3)                                                # the tank goes on
g = np.ones(N, np.float32); a, b = int((PAY - 0.95) * SR), int((PAY - 0.85) * SR); g[a:b] = np.linspace(1, 0, b - a); g[b:int(PAY * SR)] = 0
out *= g[:, None]                                                                                # everything out for ~0.85 s before it
place(drop, PAY, -1, 0.002, 2.5, off=0.75); place(cold, PAY, -4, 0.002, 2.5)                               # the payoff: loudest, after silence
place(splash, S['light'] + 1.35, -9, 0.005, 0.5)                                                 # he breaks the surface into the light
place(cheer, S['light'] + 1.5, -16, 0.3, 2.5, dur=E['light'] - S['light'] + 2.5)                 # the bank cheers
place(siren, S['hospital'] + 0.5, -24, 1.5, 2.0, dur=E['hospital'] - S['hospital'] - 0.5, loop=True)

# ---- master to -14 LUFS (measured), peaks under -1.5 dBFS (scaled first so the 16-bit temp file never clips)
out *= min(1.0, 0.89 / (np.abs(out).max() or 1))
tmp = os.path.join(HERE, '_track_raw.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', tmp], input=out.astype(np.float32).tobytes(), check=True)
m = subprocess.run(['ffmpeg', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = f"loudnorm=I=-16:TP=-1.5:LRA=14:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:linear=true"
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', af, '-ar', str(SR), os.path.join(HERE, 'track.wav')], check=True)
os.remove(tmp)
print('track.wav', round(DUR, 2), 's; raw', j['input_i'], 'LUFS', j['input_tp'], 'dBTP; payoff at', round(PAY, 2))

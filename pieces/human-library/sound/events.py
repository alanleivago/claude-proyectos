"""What happens on screen, per set, timed on the voice words (voice/words.json, take 17) -> events-<set>.json (t, what)."""
import json
W = json.load(open('../voice/words.json'))
def w(word, t0=0, fb=None):
    for x in W:
        if x['s'] >= t0 - 0.01 and ''.join(c for c in x['w'] if c.isalnum()).lower() == word.lower(): return x['s']
    return fb
E = {k: [] for k in ['street', 'room']}
def ev(s, t, what): E[s].append({'t': round(t, 3), 'what': what})
# ---- street: s01 walkers going in; s13-s15 aerial, banner, the far quay
for k in range(6): ev('street', 0.1 + k * 0.3, 'footsteps on cobbles')
ev('street', 0.5, 'bicycle bell'); ev('street', 1.5, 'door thump: someone goes in')
ev('street', 38.75, 'whoosh: cut to the aerial'); ev('street', 39.6, 'flag flutter paper')
ev('street', 41.3, 'whoosh: cut to the banner'); ev('street', w('human', 41) + 0.05, 'shimmer twinkle on the banner')
ev('street', 42.08, 'whoosh: cut across the canal')
for i in range(5): ev('street', 42.76 + i * 0.14, 'pop: a title card')
# ---- room
ev('room', 1.88, 'whoosh: the flash into the room'); ev('room', 1.95, 'shimmer twinkle')
for k in range(4): ev('room', 2.95 + k * 0.28, 'footsteps on wood floor')
ev('room', 4.5, 'paper slide: the catalog across the desk')
ev('room', 5.7, 'whoosh: cut to the catalog')
for t in [5.9, 8.4, 9.26, 10.52, 11.38]: ev('room', t - 0.04, 'pop: a catalog entry')
ev('room', 7.4, 'pencil scribble paper: crossed out'); ev('room', 12.1, 'pop: the pick lights up')
ev('room', 12.4, 'whoosh: cut to you'); ev('room', w('bold', 13) + 0.1, 'nervous gulp swallow'); ev('room', w('former', 14) + 0.02, 'tap')
ev('room', 15.62, 'whoosh: cut to the librarian'); ev('room', w('stamps', 15.8) + 0.02, 'rubber stamp'); ev('room', w('stamps', 15.8) + 0.08, 'thump on the desk')
ev('room', 17.6, 'paper card slide')
ev('room', 20.1, 'whoosh: cut to the aisle')
for k in range(5): ev('room', 20.5 + k * 0.3, 'footsteps on wood floor')
ev('room', w('sits', 21.5) + 0.02, 'chair thud: he sits')
ev('room', 23.7, 'whoosh: cut to the two of you'); ev('room', w('awkward', 24) + 0.1, 'nervous gulp swallow')
for i in range(7): ev('room', 25.24 + i * 0.2, 'pop: a question mark')
ev('room', 29.0, 'laugh chuckle'); ev('room', w('book', 29.3) + 0.02, 'pop: THE BOOK card')
ev('room', 31.14, 'whoosh: glide to the next table'); ev('room', w('leans', 32.8) + 0.05, 'chair thud lean')
ev('room', w('firefighter', 35) + 0.1, 'laugh chuckle'); ev('room', 36.2, 'whoosh: cut to the lady'); ev('room', w('interesting', 37) + 0.1, 'laugh chuckle')
ev('room', 47.0, 'whoosh: cut to the table'); ev('room', 48.8, 'pop: a speech bubble'); ev('room', 49.28, 'pop: a speech bubble')
ev('room', 50.05, 'whoosh: wide over the room'); ev('room', 53.0, 'whoosh glide: down to you two')
for i in range(5): ev('room', 53.4 + i * 0.09, 'pop: the titles go away')
ev('room', 55.66, 'whoosh: cut to the globe'); ev('room', 55.9, 'whoosh spin: the globe turns')
for i in range(14): ev('room', 56.34 + i * 0.1, 'pop: a pin')
ev('room', 57.85, 'whoosh: cut to the librarian')
ev('room', 58.85, 'whoosh: cut to the desk'); ev('room', 60.62, 'rubber stamp'); ev('room', 60.7, 'pop: BORROWED'); ev('room', 60.8, 'laugh chuckle')
for k, v in E.items(): json.dump(sorted(v, key=lambda e: e['t']), open(f'events-{k}.json', 'w'), indent=1)
print({k: len(v) for k, v in E.items()})

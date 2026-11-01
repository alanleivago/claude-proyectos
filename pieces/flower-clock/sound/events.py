"""What happens on screen, per set, timed on the voice words (voice/words.json) -> events-<set>.json (t, what)."""
import json
W = json.load(open('../voice/words.json'))


def w(word, t0=0, fb=None):
    for x in W:
        if x['s'] >= t0 - 0.01 and ''.join(c for c in x['w'] if c.isalnum()).lower() == word.lower(): return x['s']
    return fb


E = {k: [] for k in ['hall', 'out', 'classic', 'floor', 'world', 'date']}
def ev(s, t, what): E[s].append({'t': round(t, 3), 'what': what})


# ---- hall: the clock, the buttons, the people
for k in range(10): ev('hall', 0.9 + k * 0.17, 'clock tick')                      # s01 the dot races down
ev('hall', 0.82, 'whoosh: cut to the giant clock'); ev('hall', 1.0, 'sparkle twinkle on the clock')
ev('hall', 2.58, 'whoosh: cut to you'); ev('hall', w('terrifying', 3.4) + 0.05, 'nervous gulp swallow'); ev('hall', w('terrifying', 3.4) + 0.15, 'sweat drip drop')
ev('hall', 8.2, 'whoosh: cut to the button'); ev('hall', w('button', 9.3) + 0.05, 'button hover tap')
ev('hall', 10.0, 'whoosh: cut to the hall'); ev('hall', w('clock', 11.5), 'clock tick'); ev('hall', w('clock', 11.5) + 0.3, 'clock tick')
for k in range(8): ev('hall', 12.3 + k * 0.18, 'clock tick')                       # s07 hands spinning
ev('hall', w('price', 13.7) - 0.05, 'whoosh flip: the clock turns into prices'); ev('hall', w('price', 13.7) + 0.1, 'sparkle twinkle')
ev('hall', 14.46, 'trolley rolling wheels'); ev('hall', 15.2, 'trolley rolling wheels')
ev('hall', w('high', 17.0), 'riser: price 100 blazes'); ev('hall', w('high', 17.0) + 0.1, 'button hover tap')
ev('hall', 17.8, 'scoff huff sigh'); ev('hall', w('wait', 18.5), 'chair creak lean back thump')
for wd, t0 in [('drops', 19.3), ('drops', 20.2)]: ev('hall', w(wd, t0), 'clock drop thump'); ev('hall', w(wd, t0) + 0.05, 'clock tick')
ev('hall', 21.1, 'sparkle twinkle'); ev('hall', 21.2, 'gasp surprise')
for k in range(5): ev('hall', w('twitches', 22.4) - 0.1 + k * 0.1, 'button hover tap')
ev('hall', w('twitches', 22.4) + 0.2, 'sweat drip drop')
ev('hall', w('wait', 23.5) - 0.1, 'thought bubble pop'); ev('hall', w('cheaper', 24.8), 'sparkle twinkle')
ev('hall', w('wait', 25.7), 'sigh content')
c = w('Click', 26); ev('hall', c, 'big button press click'); ev('hall', c + 0.02, 'stamp thump'); ev('hall', c + 0.05, 'pop')
ev('hall', w('pressed', 27.1), 'buzzer: sold'); ev('hall', 27.0, 'clock drop thump')
ev('hall', 27.7, 'trolley rolling wheels'); ev('hall', 28.6, 'gasp surprise')
ev('hall', 29.4, 'chair creak lean'); ev('hall', w('strategy', 31), 'laugh chuckle'); ev('hall', w('him', 32.5) + 0.1, 'laugh chuckle'); ev('hall', 32.9, 'sigh deflated')
ev('hall', 33.1, 'whoosh: cut to the clock wall'); ev('hall', w('Dutch', 34), 'stamp thump plaque')
for k in range(6): ev('hall', w('Dutch', 34) - 0.4 + k * 0.1, 'pop: tulip')
ev('hall', 37.16, 'whoosh: cut over the shoulder')
for k in range(10): ev('hall', 37.4 + k * 0.17, 'clock tick')
p = w('presses', 39); ev('hall', p, 'big button press click'); ev('hall', p + 0.05, 'pop'); ev('hall', p + 0.1, 'buzzer: sold')
ev('hall', 40.52, 'big button press click'); ev('hall', w('second', 40.9) - 0.25, 'stamp thump SOLD'); ev('hall', w('second', 40.9) - 0.2, 'gasp surprise')
ev('hall', 41.84, 'whoosh camera glide along the row')
for k in range(6): ev('hall', 42.0 + k * 0.6, 'button hover tap')
ev('hall', 43.2, 'nervous gulp swallow'); ev('hall', 44.6, 'sweat drip drop')
s_ = w('split', 45.7); ev('hall', s_, 'big button press click'); ev('hall', s_ + 0.05, 'pop')
ev('hall', 57.32, 'whoosh: cut to the rival'); r = w('refused', 58.5); ev('hall', r, 'big button press click'); ev('hall', r + 0.15, 'sparkle twinkle halo'); ev('hall', r + 0.2, 'riser: halo glow')
ev('hall', 59.62, 'whoosh: cut to the clock')
for k in range(4): ev('hall', 59.7 + k * 0.17, 'clock tick')
ev('hall', w('one', 60.1), 'clock drop thump'); ev('hall', w('one', 60.1) + 0.05, 'sparkle twinkle')
# ---- out: aerial + greenhouse
ev('out', 4.42, 'whoosh: fly over the fields'); ev('out', 5.4, 'whoosh swish windmill sails'); ev('out', 6.14, 'whoosh: glide over the roof')
ev('out', 51.08, 'whoosh: cut to the greenhouse'); ev('out', w('cut', 52.1), 'scissors snip'); ev('out', w('cut', 52.1) + 0.05, 'pop'); ev('out', w('morning', 52.5), 'sparkle twinkle')
# ---- classic auction room
ev('classic', 35.04, 'whoosh: cut to the auction room')
for k in range(3): ev('classic', 35.2 + k * 0.38, 'gavel bang')
for k in range(6): ev('classic', 35.15 + k * 0.3, 'paddle whoosh')
for k in range(3): ev('classic', 35.25 + k * 0.6, 'pop: up arrow')
# ---- floor
ev('floor', 46.68, 'whoosh: cut to the floor'); c = w('click', 47.2); ev('floor', c, 'big button press click'); ev('floor', c + 0.05, 'pop')
ev('floor', c + 0.1, 'electric cart motor'); ev('floor', c + 0.2, 'trolley rolling wheels'); ev('floor', 48.3, 'trolley rolling wheels')
for k in range(12): ev('floor', 48.9 + k * 0.18, 'counter digits tick')
ev('floor', w('day', 50.5), 'sparkle twinkle')
# ---- world map
ev('world', 52.98, 'whoosh: cut to the map'); ev('world', 53.3, 'propeller airplane flyby')
ev('world', 55.3, 'pop: flower shop pin'); ev('world', w('day', 54.8) - 0.1, 'paper card flip'); ev('world', w('two', 55.1) - 0.1, 'paper card flip')
# ---- date
ev('date', 55.66, 'whoosh: cut to the cafe'); ev('date', 55.9, 'paper rustle bouquet'); ev('date', w('date', 57) - 0.2, 'gasp surprise'); ev('date', w('date', 57), 'pop: hearts')
for k, v in E.items(): json.dump(sorted(v, key=lambda e: e['t']), open(f'events-{k}.json', 'w'), indent=1)
print({k: len(v) for k, v in E.items()}, sum(len(v) for v in E.values()))

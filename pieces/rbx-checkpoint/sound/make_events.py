"""board/shots.json + a per-shot action list -> events.json (t = shot start + u * shot length). One line per on-screen action."""
import json
S = json.load(open('../board/shots.json'))
A = {  # shot number: [(u, key, what)]
 1: [(0.0, 'swish', 'aerial over the square'), (0.2, 'flap', 'big flag')], 2: [(0.1, 'trip', 'guy trips'), (0.5, 'yell', 'arms flail')], 3: [(0.05, 'poof', 'poof'), (0.15, 'spawn', 'pops in on the pad')],
 4: [(0.3, 'grab', 'hand touches the pole')], 5: [(0.05, 'spawn', 'pad lights green'), (0.3, 'shimmer', 'sparkles')], 6: [(0.15, 'trip', 'hero trips on the sidewalk'), (0.35, 'yell', 'hero yells')],
 7: [(0.0, 'poof', 'POOF')], 8: [(0.0, 'spawn', 'pops in on the tower'), (0.5, 'boing', 'oh no')], 9: [(0.05, 'snore', 'rich guy snores'), (0.5, 'shimmer', 'gold flag')],
 10: [(0.05, 'stairs', 'throws himself down the stairs')], 11: [(0.0, 'poof', 'poof'), (0.15, 'spawn', 'back in bed'), (0.4, 'blanket', 'under the covers')],
 12: [(0.1, 'chalk', 'fractions on the board'), (0.6, 'shimmer', 'purple flag')], 13: [(0.1, 'trip', 'kid trips by the lockers'), (0.25, 'kidyell', 'kid yells')],
 14: [(0.0, 'poof', 'poof'), (0.1, 'spawn', 'kid pops in'), (0.6, 'chalk', 'teacher taps 1/2+1/4')], 15: [(0.2, 'grab', 'slaps the cyan flag'), (0.45, 'giggle', 'kids laugh')],
 16: [(0.0, 'swanee', 'jump'), (0.7, 'splash', 'cannonball')], 17: [(0.0, 'whoosh', 'tilt up'), (0.1, 'flap', 'the big flag')], 18: [(0.2, 'thump', 'Flagman salutes')], 19: [(0.1, 'whistlesoft', 'Flagman puffs up')],
 20: [(0.0, 'drums', 'parade drums'), (0.3, 'tuba', 'tuba')], 21: [(0.1, 'flap', 'cloth in his arms'), (0.5, 'tubalow', 'tuba')], 22: [(0.15, 'trip', 'people trip'), (0.4, 'poof', 'poof'), (0.55, 'poof', 'poof')],
 23: [(0.05, 'spawn', 'pop in behind the tuba'), (0.3, 'tubalow', 'tuba honk')], 24: [(0.1, 'swish', 'looks up at the tower')], 25: [(0.2, 'grab', 'little hand slaps the flag'), (0.4, 'giggle', 'age four')],
 26: [(0.0, 'whoosh', 'push to the tiny flag'), (0.4, 'shimmer', 'tiny flag')], 27: [(0.15, 'trip', 'hero trips'), (0.4, 'yell', 'yell')], 28: [(0.05, 'step', 'step'), (0.35, 'step', 'step'), (0.65, 'step', 'step')],
 29: [(0.2, 'pant_h', 'out of breath')], 30: [(0.0, 'kids', 'recess')], 31: [(0.0, 'boom', 'floor is lava'), (0.3, 'swanee', 'leap'), (0.85, 'land', 'lands on the bench')], 32: [(0.2, 'kidscheer', 'kids cheer')],
 33: [(0.05, 'pant', 'Turbo pants'), (0.5, 'bark', 'bark')], 34: [(0.4, 'sniff', 'boop'), (0.6, 'spawn', 'flag save')], 35: [(0.05, 'earflap', 'ears flying'), (0.4, 'step', 'paws')],
 36: [(0.2, 'earflap', 'steps on his ears'), (0.45, 'trip', 'faceplant'), (0.6, 'whine', 'whine')], 37: [(0.0, 'poof', 'poof')], 38: [(0.0, 'spawn', 'Turbo pops in'), (0.5, 'bark', 'happy bark')],
 39: [(0.0, 'carnival', 'the Fair')], 40: [(0.0, 'crack', 'the ground cracks'), (0.05, 'rumble', 'rumble'), (0.3, 'scream', 'screams')], 41: [(0.0, 'collapse', 'the square falls in'), (0.3, 'debris', 'debris')],
 42: [(0.05, 'fall', 'flag falls'), (0.8, 'debris', 'lands')], 43: [(0.1, 'debris', 'candy stand falls')], 44: [(0.0, 'whine', 'Turbo'), (0.1, 'fall', 'Turbo falls')],
 45: [(0.1, 'trip', 'lady trips'), (0.6, 'poof', 'poof')], 46: [(0.0, 'spawn', 'pops in at the bottom'), (0.5, 'gasp', 'oh no')], 47: [(0.1, 'murmur', 'half the town below')], 48: [(0.3, 'whistlesoft', 'still holding his whistle')],
 49: [(0.1, 'ladder', 'ladder lowered'), (0.6, 'ladder', 'clank')], 50: [(0.1, 'grab', 'climbing'), (0.55, 'grab', 'climbing')], 51: [(0.05, 'scream', 'slips'), (0.3, 'fall', 'falls')],
 52: [(0.0, 'poof', 'poof'), (0.1, 'spawn', 'back at the bottom')], 53: [(0.05, 'lasso', 'rope thrown'), (0.5, 'rope', 'rope uncoils')], 54: [(0.1, 'grab', 'climbs the rope'), (0.6, 'grab', 'hand over hand')],
 55: [(0.1, 'ooh', 'he made it'), (0.5, 'giggle', 'waves')], 56: [(0.0, 'swanee', 'slips'), (0.55, 'poof', 'poofs down')], 57: [(0.1, 'bark', 'bark'), (0.4, 'boing', 'jump')],
 58: [(0.0, 'bark', 'jump')], 59: [(0.0, 'poof', 'poof'), (0.15, 'spawn', 'back down')], 60: [(0.0, 'bark', 'jump')], 61: [(0.0, 'poof', 'poof'), (0.15, 'spawn', 'back down')],
 62: [(0.2, 'murmur', 'worried rim')], 63: [(0.1, 'gravel', 'pebbles fall')], 64: [(0.1, 'rope', 'leash lowered')], 65: [(0.05, 'chew', 'chewing'), (0.7, 'rope', 'leash snaps')],
 66: [(0.0, 'heart', 'night')], 67: [(0.1, 'flap', 'flag in the dark')], 68: [(0.3, 'heart', 'thinking')], 69: [(0.0, 'whoosh', 'flashback'), (0.1, 'drums', 'parade')], 70: [(0.1, 'spawn', 'pop behind the tuba'), (0.4, 'tubalow', 'honk')],
 71: [(0.3, 'shimmer', 'idea')], 72: [(0.1, 'shimmer', 'my tower')], 73: [(0.1, 'gravel', 'over the edge'), (0.5, 'grab', 'grips')], 74: [(0.1, 'step', 'rock'), (0.5, 'step', 'rock')],
 75: [(0.1, 'grab', 'rock'), (0.5, 'gravel', 'rock to rock')], 76: [(0.1, 'grab', 'root'), (0.55, 'grab', 'root')], 77: [(0.1, 'land', 'lands at the bottom'), (0.4, 'gasp', 'the town turns')],
 78: [(0.2, 'rope', 'untying the cloth'), (0.6, 'flap', 'the cloth')], 79: [(0.2, 'flap', 'cloth in teeth')], 80: [(0.1, 'grab', 'climbs'), (0.5, 'grab', 'climbs'), (0.8, 'gravel', 'loose stones')],
 81: [(0.1, 'rockbreak', 'the rock breaks'), (0.3, 'debris', 'stones fall')], 82: [(0.05, 'grab', 'one hand'), (0.4, 'heart', 'hanging')], 83: [(0.2, 'grab', 'strain')], 84: [(0.2, 'grab', 'swings up'), (0.6, 'gravel', 'rock')],
 85: [(0.25, 'dig', 'stabs the flag into the dirt'), (0.5, 'spawn', 'new checkpoint lights'), (0.7, 'flap', 'cloth')], 86: [(0.05, 'whoosh', 'yell down')], 87: [(0.0, 'whistle', 'WHISTLE')], 88: [(0.6, 'thump', 'the motto')],
 89: [(0.15, 'trip', 'everyone falls flat'), (0.35, 'trip', 'falls'), (0.55, 'trip', 'falls')], 90: [(0.0, 'poof', 'POOF'), (0.2, 'poof', 'poof'), (0.45, 'poof', 'poof')],
 91: [(0.0, 'spawn', 'pop'), (0.3, 'spawn', 'pop')], 92: [(0.0, 'spawn', 'pop'), (0.3, 'spawn', 'pop')], 93: [(0.05, 'cheer', 'the whole town cheers')], 94: [(0.0, 'spawn', 'Turbo pops in last'), (0.4, 'bark', 'bark')],
 95: [(0.1, 'pant', 'pole in his mouth')], 96: [(0.1, 'pant', 'proud'), (0.5, 'giggle', 'hero laughs')], 97: [(0.0, 'swish', 'morning'), (0.2, 'step', 'step'), (0.6, 'step', 'step')],
 98: [(0.1, 'step', 'stairs'), (0.4, 'step', 'stairs'), (0.7, 'pant', 'Turbo climbs')], 99: [(0.5, 'sniff', 'boop'), (0.6, 'spawn', 'flag save')], 100: [(0.1, 'earflap', 'steps on his ears'), (0.45, 'trip', 'trips')],
 101: [(0.0, 'poof', 'poof'), (0.15, 'spawn', 'lands next to me')], 102: [(0.2, 'earflap', 'ears'), (0.45, 'trip', 'trips again')], 103: [(0.3, 'bark', 'one bark'), (0.6, 'giggle', 'hero laughs')],
}
ev = []
for s in S:
    for u, k, w in A.get(s['i'] + 1, []): ev.append({'t': round(s['t0'] + u * (s['t1'] - s['t0']), 3), 'k': k, 'what': w})
json.dump(sorted(ev, key=lambda e: e['t']), open('events.json', 'w'), indent=1); print(len(ev), 'events')

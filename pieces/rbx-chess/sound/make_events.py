"""board/shots.json + a per-shot action list -> events.json (t = shot start + u * shot length). One line per on-screen action."""
import json
S = json.load(open('../board/shots.json'))
A = {  # shot number: [(u, key, what)]
 1: [(0.02, 'swish', 'crane down over the kingdom on the table')], 2: [(0.25, 'piece', 'pieces on their squares'), (0.7, 'piece', 'pawn steps one square')],
 3: [(0.0, 'wheels', 'rook pulls the taxi cart')], 4: [(0.05, 'wheels', 'taxi racing straight'), (0.5, 'whoosh', 'straight arrow')],
 5: [(0.25, 'whoosh', 'taxi whooshes past camera'), (0.3, 'wheels', 'wheels rattle past')], 6: [(0.08, 'stop', 'taxi stops dead'), (0.5, 'pop', 'rook shrugs')],
 7: [(0.05, 'swish', 'cut to the aunt waving')], 8: [(0.1, 'tap', 'uncle waves back')], 9: [(0.3, 'piece', 'top-down on the two squares')], 10: [(0.1, 'pop', 'they wave')],
 11: [(0.05, 'bell', 'Sunday bells, game night'), (0.5, 'murmur', 'citizens look up')], 12: [(0.0, 'lid', 'clouds slide back like a lid'), (0.2, 'rumble', 'sky opens')],
 13: [(0.05, 'handwhoosh', 'the Hand comes down')], 14: [(0.15, 'creepy', 'Hand over the Box'), (0.6, 'pop', 'drops the pawn'), (0.92, 'boxthud', 'pawn lands in the Box')],
 15: [(0.05, 'boom', 'the Box, low angle')], 16: [(0.05, 'swish', 'cut to dad')], 17: [(0.08, 'hop', 'dad jumps the L'), (0.72, 'land', 'lands')],
 18: [(0.1, 'whoosh', 'dad over the cottage roof')], 19: [(0.1, 'hop', 'dad jumps'), (0.82, 'land', 'lands on the bakery roof')], 20: [(0.05, 'pop', 'hero intro')],
 21: [(0.35, 'piece', 'one square forward')], 22: [(0.1, 'tap', 'the engraved 7')], 23: [(0.2, 'steps', 'at the door')],
 24: [(0.05, 'hop', 'dad jumps'), (0.78, 'land', 'dad lands')], 25: [(0.15, 'steps', 'hero steps'), (0.55, 'steps', 'hero steps'), (0.75, 'tap', 'dad taps his foot')],
 26: [(0.1, 'page', 'the rulebook')], 27: [(0.15, 'shimmer', 'tiny print')], 28: [(0.15, 'gasp', 'hero gasps')], 29: [(0.0, 'fogwind', 'fog bank on row eight')],
 30: [(0.05, 'handwhoosh', 'the Hand plucks a pawn'), (0.5, 'gasp', 'pawn lifted')], 31: [(0.05, 'handwhoosh', 'the Hand comes down over the street'), (0.5, 'murmur', 'frozen citizens')],
 32: [(0.15, 'whoosh', 'Hand past the bakery')], 33: [(0.15, 'whoosh', 'Hand past aunt and uncle')], 34: [(0.1, 'boom', 'it stops over the hero'), (0.4, 'heart', 'heartbeat')],
 35: [(0.03, 'hop', 'dad jumps'), (0.88, 'land', 'dad lands')], 36: [(0.05, 'thump', 'dad in front, arms out')], 37: [(0.1, 'creepy', 'the Hand grabs dad'), (0.35, 'gasp', 'hero cries out')],
 38: [(0.2, 'wind', 'alone next day')], 39: [(0.1, 'steps', 'hero walks to the rook')], 41: [(0.05, 'swish', 'top-down map')], 42: [(0.1, 'steps', 'to the aunt')],
 43: [(0.1, 'steps', 'aunt walks the diagonal')], 44: [(0.3, 'strain', 'aunt strains')], 45: [(0.1, 'steps', 'hero walks to the castle')], 46: [(0.1, 'shimmer', 'queen arrows')],
 47: [(0.05, 'swish', 'over the queen shoulder')], 49: [(0.0, 'sizzle', 'king at the stove'), (0.5, 'pans', 'pots')], 50: [(0.4, 'pans', 'stirring')],
 51: [(0.2, 'steps', 'king shuffles'), (0.7, 'doorrattle', 'the OUT door')], 52: [(0.05, 'tap', 'calendar')], 53: [(0.3, 'piece', 'one square')],
 54: [(0.0, 'fogwind', 'looks at row eight')], 55: [(0.0, 'fogwind', 'nothing but fog')], 57: [(0.45, 'steps', 'one step into the fog')],
 58: [(0.05, 'whoosh', 'the fog clears')], 59: [(0.15, 'crowdgasp', 'the whole kingdom stares')], 60: [(0.1, 'steps', 'stragglers')], 61: [(0.05, 'wheels', 'rooks with the taxi')],
 62: [(0.0, 'rumble', 'voice from the sky'), (0.2, 'shimmer', 'shaft of light')], 63: [(0.1, 'murmur', 'everybody expected a knight')], 64: [(0.0, 'magic', 'crown appears'), (0.02, 'boom', 'transformation')],
 65: [(0.25, 'piece', 'sideways'), (0.7, 'piece', 'sideways')], 66: [(0.1, 'steps', 'backwards'), (0.4, 'crowdgasp', 'crowd gasps')], 67: [(0.3, 'piece', 'diagonal')],
 68: [(0.05, 'swish', 'across the board')], 69: [(0.2, 'steps', 'to the Box')], 70: [(0.05, 'boxthud', 'inside the Box')], 73: [(0.15, 'pop', 'dad on top')],
 75: [(0.1, 'shimmer', 'queen arrows in the Box')], 76: [(0.45, 'thump', 'arrows stop at the wall')], 78: [(0.75, 'hop', 'dad jumps')],
 79: [(0.05, 'whoosh', 'over the wall and the street')], 80: [(0.45, 'land', 'onto the bakery roof')], 82: [(0.05, 'handwhoosh', 'the Hand in the sky stops')],
 83: [(0.15, 'whoosh', 'the Hand goes back'), (0.6, 'lid', 'clouds close')], 84: [(0.1, 'shimmer', 'anywhere')], 85: [(0.1, 'steps', 'running')],
 86: [(0.15, 'schoolbell', 'morning school bell'), (0.4, 'steps', 'out of the cottage')], 87: [(0.3, 'steps', 'walk')], 88: [(0.05, 'hop', 'dad jumps'), (0.7, 'land', 'lands')],
 89: [(0.3, 'steps', 'walking')], 90: [(0.55, 'shimmer', 'best part of my day')],
}
ev = []
for s in S:
    for u, k, w in A.get(s['i'] + 1, []): ev.append({'t': round(s['t0'] + u * (s['t1'] - s['t0']), 3), 'k': k, 'what': w})
json.dump(sorted(ev, key=lambda e: e['t']), open('events.json', 'w'), indent=1); print(len(ev), 'events')

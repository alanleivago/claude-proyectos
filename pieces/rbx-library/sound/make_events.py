"""board/shots.json + a per-shot action list -> events.json (t = shot start + u * shot length). One line per on-screen action."""
import json
S = json.load(open('../board/shots.json'))
A = {  # shot number: [(u, key, what)]
 1: [(0.0, 'swish', 'aerial'), (0.3, 'birds', 'morning')], 2: [(0.1, 'step', 'step'), (0.45, 'step', 'step'), (0.8, 'step', 'step')], 3: [(0.1, 'clunk', 'drop box')],
 4: [(0.0, 'whoosh', 'night falls'), (0.4, 'creepwhoosh', 'library goes dark')], 5: [(0.1, 'midnight', 'midnight bell'), (0.4, 'tick', 'clock')], 6: [(0.15, 'drag', 'hem drags'), (0.6, 'creak', 'stair creak')],
 7: [(0.2, 'creak', 'stamps sway'), (0.5, 'heart', 'heartbeat')], 8: [(0.1, 'blanket', 'blanket up'), (0.5, 'heart', 'heartbeat')], 9: [(0.2, 'shimmer_dark', 'glints'), (0.5, 'creak', 'creak')],
 10: [(0.0, 'THUNK', 'stamp on step'), (0.5, 'THUNK', 'stamp on step')], 11: [(0.1, 'THUNK_far', 'up the stairs'), (0.6, 'THUNK_far', 'thunk')], 12: [(0.1, 'scream', 'kid screams'), (0.7, 'THUNK', 'stamp')],
 13: [(0.0, 'poof', 'poof'), (0.05, 'pages', 'pages burst'), (0.15, 'splat', 'ink splat')], 14: [(0.1, 'paper', 'book lands'), (0.4, 'shimmer_dark', 'face')],
 15: [(0.3, 'stamp', 'stamp on card')], 16: [(0.1, 'pageturn', 'ledger')], 17: [(0.1, 'stamp', 'stamp lifts')], 18: [(0.2, 'paper', 'card')],
 19: [(0.0, 'murmur', 'town'), (0.3, 'tick', 'stopwatches')], 20: [(0.0, 'stopwatch', 'stopwatch'), (0.5, 'pageturn', 'flip')], 21: [(0.0, 'tick', 'tick'), (0.5, 'tick', 'tick')],
 22: [(0.0, 'murmur', 'pajama queue'), (0.4, 'step', 'shuffle')], 23: [(0.3, 'clunk', 'book in slot'), (0.6, 'thudbook', 'book drops in')], 24: [(0.2, 'pant', 'panting')],
 25: [(0.0, 'swish', 'sepia'), (0.2, 'run', 'running'), (0.6, 'run', 'running')], 26: [(0.1, 'tick', 'clock 12:01'), (0.4, 'THUNK', 'the stamp')], 27: [(0.2, 'shimmer', 'cookbook')],
 28: [(0.1, 'bubble', 'soup bubbles')], 29: [(0.0, 'kids', 'kids racing'), (0.4, 'pageturn', 'page one')], 30: [(0.3, 'pageturn', 'old book')], 31: [(0.0, 'swish', 'flashback'), (0.4, 'giggle', 'little hero')],
 32: [(0.35, 'stamp', 'renewal stamp'), (0.7, 'stamp', 'again')], 33: [(0.2, 'shimmer', '212')], 34: [(0.0, 'kids', 'recess chaos'), (0.4, 'kidyell', 'yelling')],
 35: [(0.1, 'shh', 'shhh'), (0.5, 'giggle', 'kids crack up')], 36: [(0.2, 'medal', 'gold medal'), (0.4, 'kidscheer', 'cheer')], 37: [(0.0, 'alarm', 'fire alarm'), (0.3, 'run', 'kids run')],
 38: [(0.0, 'horn', 'fire truck'), (0.4, 'land', 'firemen jump off')], 39: [(0.2, 'step', 'fireman steps'), (0.6, 'step', 'step')], 40: [(0.25, 'cloth', 'hung on the hook'), (0.6, 'boing', 'deadpan')],
 41: [(0.0, 'birds', 'morning'), (0.3, 'giggle', 'Nico waves')], 42: [(0.3, 'giggle', 'Nico grins')], 43: [(0.1, 'step', 'waddle'), (0.45, 'step', 'waddle'), (0.75, 'paper', 'books wobble')],
 44: [(0.1, 'pageturn', 'flip'), (0.5, 'giggle', 'laughs')], 45: [(0.2, 'pageturn', 'reading in bed'), (0.6, 'tick', 'clock')], 46: [(0.2, 'snore', 'asleep')], 47: [(0.1, 'tick', 'tick'), (0.5, 'creepwhoosh', 'DUE')],
 48: [(0.0, 'tick', 'tick'), (0.5, 'tick', 'tick')], 49: [(0.1, 'gasp', 'sits up'), (0.6, 'heart', 'heartbeat')], 50: [(0.0, 'THUNK', 'thunk'), (0.45, 'THUNK', 'thunk')],
 51: [(0.0, 'THUNK', 'thunk'), (0.5, 'drag', 'up his stairs'), (0.8, 'creak', 'door')], 52: [(0.0, 'birds', 'morning')], 53: [(0.1, 'step', 'walk'), (0.5, 'step', 'walk')],
 54: [(0.2, 'shimmer', 'NEW ARRIVAL')], 55: [(0.1, 'gasp', 'mom gasps')], 56: [(0.0, 'stinger', 'his face')], 57: [(0.3, 'clunk', 'into the slot'), (0.6, 'thudbook', 'falls in')],
 58: [(0.1, 'metalslide', 'slides back'), (0.7, 'thudbook', 'lands')], 59: [(0.1, 'stamp', 'RETURNS ARE FINAL')], 60: [(0.3, 'paper', 'money')], 61: [(0.1, 'clunk', 'slot opens'), (0.3, 'creak', 'bony hand')],
 62: [(0.5, 'stamp', 'stamps her palm')], 63: [(0.05, 'scream', 'mom screams')], 64: [(0.1, 'clunk', 'flap'), (0.5, 'cloth', 'climbs in')], 65: [(0.0, 'chute', 'slides down'), (0.6, 'yelp', 'held in')],
 66: [(0.15, 'land', 'lands on books'), (0.2, 'paper', 'books')], 67: [(0.0, 'creepwhoosh', 'tilt up'), (0.5, 'shelfcreak', 'shelves creak')], 68: [(0.2, 'whisper', 'faces')], 69: [(0.1, 'whisper', 'whisper')],
 70: [(0.2, 'shimmer_dark', 'glints')], 71: [(0.0, 'THUNK_far', 'thunk'), (0.45, 'THUNK_far', 'thunk'), (0.5, 'dust', 'dust')], 72: [(0.0, 'whisper', 'help'), (0.5, 'whisper', 'help')],
 73: [(0.1, 'whisper', 'help')], 74: [(0.0, 'THUNK_far', 'closer'), (0.5, 'shelfcreak', 'creak')], 75: [(0.2, 'zip', 'zips mouth')], 76: [(0.2, 'skitter', 'spider drops')], 77: [(0.0, 'skitter', 'on his nose'), (0.5, 'strain', 'holds it')],
 78: [(0.3, 'thudbook', 'pulls the book')], 79: [(0.1, 'tiptoe', 'tiptoe'), (0.5, 'tiptoe', 'tiptoe')], 80: [(0.3, 'THUNK', 'THUNK behind him')], 81: [(0.2, 'creak', 'turns'), (0.5, 'heart', 'heartbeat')],
 82: [(0.0, 'stinger', 'reveal'), (0.3, 'drag', 'cardigan')], 83: [(0.2, 'shimmer_dark', 'glasses glint'), (0.5, 'chain', 'chain')], 84: [(0.1, 'creak', 'stamps up'), (0.4, 'heart', 'heartbeat')],
 85: [(0.2, 'swish', 'turns to camera')], 86: [(0.3, 'card', 'card flip')], 87: [(0.4, 'thudbook', 'book on counter')], 88: [(0.6, 'bell', 'desk bell')], 89: [(0.0, 'freeze', 'she froze')],
 90: [(0.1, 'creak', 'head snaps')], 91: [(0.1, 'creak', 'head tilts')], 92: [(0.1, 'creak', 'leans')], 93: [(0.2, 'shimmer', '212 stamps')], 94: [(0.3, 'whoosh', 'raises the stamp')],
 95: [(0.1, 'THUNK', 'NEW DUE DATE')], 96: [(0.1, 'shimmer', 'due date')], 97: [(0.0, 'poof', 'poof'), (0.05, 'pages', 'pages'), (0.2, 'spawn', 'Nico pops out')], 98: [(0.2, 'giggle', 'Nico laughs')],
 99: [(0.1, 'step', 'carry'), (0.4, 'stamp', 'stamp'), (0.7, 'stamp', 'stamp')], 100: [(0.1, 'ladder', 'ladder'), (0.5, 'kidscheer', 'kids pop out')], 101: [(0.0, 'poof', 'poof'), (0.15, 'spawn', 'Dale pops out')],
 102: [(0.1, 'bubble', 'soup'), (0.3, 'sniff', 'phew')], 103: [(0.1, 'stamp', 'stamp'), (0.4, 'yawn', 'yawn'), (0.7, 'stamp', 'stamp')], 104: [(0.1, 'stamp', 'stamp'), (0.35, 'stamp', 'stamp'), (0.6, 'stamp', 'stamp'), (0.85, 'poof', 'pop')],
 105: [(0.2, 'shimmer', 'humming')], 106: [(0.0, 'birds', 'morning'), (0.2, 'murmur', 'town')], 107: [(0.3, 'stamp_soft', 'friendly stamp'), (0.6, 'giggle', 'kids')], 108: [(0.0, 'kidsamb', 'story time')],
 109: [(0.2, 'pageturn', 'picture book')], 110: [(0.1, 'kidscheer', 'kids scream with joy'), (0.5, 'giggle', 'giggles')], 111: [(0.4, 'sticker', 'sticker peel')], 112: [(0.1, 'sticker', 'pressed on'), (0.4, 'shimmer', 'GOOD READER')],
 113: [(0.4, 'bookclose', 'closes the book')], 114: [(0.5, 'stamp_soft', 'renewed anyway')], 115: [(0.1, 'step', 'walk'), (0.5, 'step', 'walk')], 116: [(0.55, 'stamp_soft', 'forehead stamp')],
 117: [(0.05, 'giggle', 'Nico giggles')], 118: [(0.3, 'kidscheer', 'all wave'), (0.6, 'shimmer', 'end')],
}
ev = []
for s in S:
    for u, k, w in A.get(s['i'] + 1, []): ev.append({'t': round(s['t0'] + u * (s['t1'] - s['t0']), 3), 'k': k, 'what': w})
json.dump(sorted(ev, key=lambda e: e['t']), open('events.json', 'w'), indent=1); print(len(ev), 'events')

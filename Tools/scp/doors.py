"""Extract the doors FillRoom() creates per room (MapSystem.bb, SCP:CB) -> JSON in rmesh units.
Usage: python doors.py MapSystem.bb room1 room2 ... > doors.json"""
import re, sys, json
RS = 8.0 / 2048.0
src = open(sys.argv[1], encoding='latin-1').read()
fill = src[src.index('Function FillRoom'):]
fill = fill[:fill.index('End Function')]
blocks = re.split(r'\n\s*Case\s+(?=")', fill)
def split_args(s):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch == '(' : depth += 1
        if ch == ')':
            if depth == 0: break
            depth -= 1
        if ch == ',' and depth == 0: out.append(cur.strip()); cur = ''
        else: cur += ch
    out.append(cur.strip()); return out
def ev(e, env={}):
    e = re.sub(r'r\\[xyz]', '0', e, flags=re.I).replace('RoomScale', str(RS))
    e = re.sub(r'Entity[XYZ]\(r\\obj\)', '0', e)
    e = re.sub(r'\bNot\b', ' not ', e)
    for k, v in env.items(): e = re.sub(r'\b%s%%?' % k, str(v), e)
    if not re.fullmatch(r'[0-9.+\-*/ ()e]+|.*not.*', e) or re.search(r'[A-Za-z_]', e.replace('not', '')): raise ValueError(e)
    return float(eval(e))
res = {}
for name in sys.argv[2:]:
    doors = []
    for b in blocks:
        head = b.split('\n', 1)[0]
        names = [x.strip().strip('"').lower() for x in head.split(',')]
        if name.lower() not in names: continue
        for m in re.finditer(r'CreateDoor\(', b):
            a = split_args(b[m.end():])
            # loop variables (e.g. the Class-D cell doors): expand the nearest preceding For ranges
            loops = {}
            for v in set(re.findall(r'\b([a-z]temp)\b', ' '.join(a[1:5]))):
                f = list(re.finditer(r'For\s+%s%%?\s*=\s*(-?\d+)\s+To\s+(-?\d+)' % v, b[:m.start()]))
                if f: loops[v] = range(int(f[-1].group(1)), int(f[-1].group(2)) + 1)
            import itertools
            combos = [dict(zip(loops, c)) for c in itertools.product(*loops.values())] if loops else [{}]
            for env in combos:
                try:
                    x, y, z, ang = ev(a[1], env) / RS, ev(a[2], env) / RS, ev(a[3], env) / RS, ev(a[4], env)
                except Exception as ex:
                    print('skip', name, a[:5], ex, file=sys.stderr); continue
                big = a[7].strip() if len(a) > 7 else '0'
                big = {'true': 1, 'false': 0}.get(big.lower(), big)
                try: big = int(big)
                except ValueError: big = 0
                doors.append({'pos': [x, y, z], 'angle': ang, 'big': big})
            continue
            big = a[7].strip() if len(a) > 7 else '0'
            big = {'true': 1, 'false': 0}.get(big.lower(), big)
            try: big = int(big)
            except ValueError: big = 0
            doors.append({'pos': [x, y, z], 'angle': ang, 'big': big})
    res[name] = doors
json.dump(res, sys.stdout, indent=1)

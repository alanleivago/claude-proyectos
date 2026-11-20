"""Reader for SCP: Containment Breach .rmesh rooms.
Format follows LoadRMesh() in MapSystem.bb of https://github.com/Regalis11/scpcb (CC BY-SA 3.0).
Blitz strings = int32 length + bytes; all little-endian."""
import struct

class R:
    def __init__(s, b): s.b, s.p = b, 0
    def i(s): v = struct.unpack_from('<i', s.b, s.p)[0]; s.p += 4; return v
    def f(s): v = struct.unpack_from('<f', s.b, s.p)[0]; s.p += 4; return v
    def u8(s): v = s.b[s.p]; s.p += 1; return v
    def s(s):
        n = s.i(); v = s.b[s.p:s.p + n].decode('latin-1'); s.p += n; return v

def read_rmesh(path):
    r = R(open(path, 'rb').read())
    head = r.s()
    assert head in ('RoomMesh', 'RoomMesh.HasTriggerBox'), head
    out = {'surfaces': [], 'entities': []}
    for _ in range(r.i()):
        tex = []
        for j in range(2):
            flag = r.u8()
            tex.append((flag, r.s()) if flag else (0, ''))
        nv = r.i(); verts = []
        for _ in range(nv):
            x, y, z = r.f(), r.f(), r.f()
            u0, v0, u1, v1 = r.f(), r.f(), r.f(), r.f()
            c = (r.u8(), r.u8(), r.u8())
            verts.append((x, y, z, u0, v0, u1, v1, c))
        tris = [(r.i(), r.i(), r.i()) for _ in range(r.i())]
        # tex[0] = lightmap (uv set 1), tex[1] = diffuse (uv set 0); flag 3 = alpha surface
        out['surfaces'].append({'lm': tex[0], 'diff': tex[1], 'verts': verts, 'tris': tris})
    for _ in range(r.i()):  # invisible collision
        for _ in range(r.i()): r.f(); r.f(); r.f()
        for _ in range(r.i()): r.i(); r.i(); r.i()
    if head.endswith('TriggerBox'):
        for _ in range(r.i()):
            for _ in range(r.i()):
                for _ in range(r.i()): r.f(); r.f(); r.f()
                for _ in range(r.i()): r.i(); r.i(); r.i()
            r.s()
    for _ in range(r.i()):
        k = r.s(); e = {'type': k}
        if k == 'screen': e['pos'] = (r.f(), r.f(), r.f()); e['img'] = r.s()
        elif k == 'waypoint': e['pos'] = (r.f(), r.f(), r.f())
        elif k == 'light': e['pos'] = (r.f(), r.f(), r.f()); e['range'] = r.f(); e['color'] = r.s(); e['intensity'] = r.f()
        elif k == 'spotlight':
            e['pos'] = (r.f(), r.f(), r.f()); e['range'] = r.f(); e['color'] = r.s(); e['intensity'] = r.f()
            e['angles'] = r.s(); e['inner'] = r.i(); e['outer'] = r.i()
        elif k == 'soundemitter': e['pos'] = (r.f(), r.f(), r.f()); e['id'] = r.i(); e['range'] = r.f()
        elif k == 'playerstart': e['pos'] = (r.f(), r.f(), r.f()); e['angles'] = r.s()
        elif k == 'model':
            e['file'] = r.s()
            e['pos'] = (r.f(), r.f(), r.f())
            if e['file']:
                e['rot'] = (r.f(), r.f(), r.f()); e['scale'] = (r.f(), r.f(), r.f())
        else: raise ValueError('unknown entity ' + k)
        out['entities'].append(e)
    return out

if __name__ == '__main__':
    import sys
    for p in sys.argv[1:]:
        m = read_rmesh(p)
        xs = [v[0] for s in m['surfaces'] for v in s['verts']]; ys = [v[1] for s in m['surfaces'] for v in s['verts']]; zs = [v[2] for s in m['surfaces'] for v in s['verts']]
        print(p.split('/')[-1], len(m['surfaces']), 'surf', 'bbox x', min(xs), max(xs), 'y', min(ys), max(ys), 'z', min(zs), max(zs))
        print('  tex', sorted({(s['diff'][0], s['diff'][1], s['lm'][0], s['lm'][1]) for s in m['surfaces']})[:12])
        print('  ents', [(e['type'], e.get('file')) for e in m['entities'] if e['type'] in ('model', 'playerstart')])

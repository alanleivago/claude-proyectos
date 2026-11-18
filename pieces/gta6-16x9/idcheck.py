"""Batch identity check: python idcheck.py <suffix> name:char[:x] ...   (suffix e.g. _photo.jpg or _painted.jpg)"""
import sys, cv2
sys.path.insert(0, 'styles/gta6/tools'); import face_id as fi
suf = sys.argv[1]
for spec in sys.argv[2:]:
    p = spec.split(':'); n, ch = p[0], p[1]; x = float(p[2]) if len(p) > 2 else None
    s, rank, tab = fi.check(cv2.imread(f'pieces/gta6-16x9/poses/{n}{suf}'), ch, x)
    extra = f" shots {tab['lucia_shots']:.2f}" if 'lucia_shots' in tab and ch == 'lucia' else ''
    top = extra + ' | ' + ' '.join(f'{k} {v:.2f}' for k, v in sorted(tab.items(), key=lambda kv: -kv[1])[:3])
    print(f'{n:15s} {ch:8s} {s:.3f} rank {rank} {"PASS" if fi.passes(ch, s, rank, tab) else "FAIL"} | {top}')

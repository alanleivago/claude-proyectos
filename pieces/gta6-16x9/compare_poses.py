"""Per-character sheet: official artwork | new pose (v4 hybrid) + face crops + SFace identity score."""
import sys, cv2, numpy as np
sys.path.insert(0, 'styles/gta6/tools'); import face_id as fi
R = 'pieces/gta6-16x9/'; A = 'pieces/gta6-parallax-16x9/assets/'
C = [('jason', 'jason_aim', 'jason', None, 'jl_plate', 'JASON - aiming'), ('lucia', 'lucia5', 'lucia', None, 'dimez_plate', 'LUCIA - looking back'),
     ('cal', 'cal_bino3', 'cal', None, 'bay_plate', 'CAL HAMPTON - binoculars'), ('boobie', 'boobie_studio', 'boobie', None, 'boobie_plate', 'BOOBIE IKE - studio'),
     ('dimez', 'dimez_selfie', 'dimez_l', 0.4, 'dimez_plate', 'REAL DIMEZ - selfie'), ('raul', 'raul_light', 'raul', None, 'raul_plate', 'RAUL BAUTISTA - lighter'),
     ('brian', 'brian_phone', 'brian', None, 'brian_plate', 'BRIAN HEDER - phone call'), ('drequan', 'drequan_cash', 'drequan', None, 'drequan_plate', 'DREQUAN PRIEST - cash')]
for idn, pose, ch, x, plate, label in C:
    off = cv2.imread(R + f'id/{idn}.jpg'); new = cv2.imread(R + f'poses/{pose}_final.png', cv2.IMREAD_UNCHANGED)
    pl = cv2.resize(cv2.imread(A + plate + '.jpg'), (new.shape[1], new.shape[0])).astype(np.float32)
    al = new[..., 3:] / 255.; comp = (new[..., :3] * al + pl * (1 - al)).astype(np.uint8)
    painted = cv2.imread(R + f'poses/{pose}_painted.jpg')
    s, rank, tab = fi.check(painted, ch, x)
    extra = ''
    if idn == 'dimez':
        s2, r2, _ = fi.check(painted, 'dimez_r', 0.6); extra = f'  |  right woman {s2:.2f} (rank {r2})'
    H = 900; o = cv2.resize(off, (int(off.shape[1] * H / off.shape[0]), H)); n = cv2.resize(comp, (int(comp.shape[1] * H / comp.shape[0]), H))
    out = np.full((H + 60, o.shape[1] + n.shape[1] + 30, 3), (20, 10, 24), np.uint8)
    out[50:50 + H, 10:10 + o.shape[1]] = o; out[50:50 + H, 20 + o.shape[1]:20 + o.shape[1] + n.shape[1]] = n
    if idn == 'lucia':
        extra = f'  |  vs 8 official screenshots {tab["lucia_shots"]:.2f}'
    verdict = 'PASS' if fi.passes(ch, s, rank, tab) else ('rank-1, below gate' if rank == 1 else 'FAIL')
    cv2.putText(out, f'{label}   official (left) | new pose, v4 hybrid (right)   SFace identity {s:.2f}, rank {rank}/9  {verdict}{extra}',
                (12, 34), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (180, 240, 255), 2, cv2.LINE_AA)
    cv2.imwrite(R + f'compare/{pose}.jpg', out, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(f'{pose}: {s:.3f} rank {rank} {verdict}{extra}')

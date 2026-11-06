# lines whose best take is weak (Whisper match < 0.95, or a stray blip / noisy floor), comma-separated, for a seed-21 retake
import json
sc = json.load(open('takes/scores.json')); bad = []
for id, rows in sc.items():
    b = max(rows)
    if b[2] < 0.95 or b[3] > -35 or b[0] < 8: bad.append(id)
missing = [id for id, _ in json.load(open('lines.json')) if id not in sc]
print(','.join(sorted(bad + missing)))

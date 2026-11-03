# rank -> find -> realness with earshot for each Freesound folder; writes picks.json
from earshot import api
import json, os
Q = {
 "winter_wind_house": "cold winter wind blowing against a wooden house",
 "room_tone_night": "quiet room tone at night",
 "fireplace_crackle": "embers crackling in a fireplace",
 "wooden_floor_creak": "a wooden floor creaking",
 "claws_scratching_wood": "scratching on wood",
 "bone_crack": "a dry crack of bone",
 "old_woman_breathing_sleeping": "slow breathing of a sleeping person",
 "match_strike": "a match being struck",
 "paper_tearing": "paper tearing",
 "barefoot_running_wooden_floor": "bare footsteps on a wooden floor",
 "creature_hiss": "a creature hissing",
 "creepy_whisper": "a creepy whisper",
 "temple_bell": "a large temple bell struck once",
 "shakuhachi": "a breathy bamboo flute note",
 "cinematic_impact_boom": "a deep cinematic impact boom",
 "dog_barking_distant": "a dog barking far away",
 "candle_flame_sputter": "a flame flickering and sputtering",
 "scared_breathing_woman": "a frightened woman breathing",
 "heartbeat": "a slow heartbeat",}
out = json.load(open("picks.json")) if os.path.exists("picks.json") else {}
for d, q in Q.items():
    if d in out or not os.path.isdir(f"fs/{d}") or not os.listdir(f"fs/{d}"): continue
    try:
        r = api.rank(f"fs/{d}", q, top=3); b = r["results"][0]; p = b.get("path") or b.get("file")
        f = api.find(p, q, top=1); sg = (f.get("segments") or f.get("results") or [f])[0]
        rl = api.realness(p, start=sg.get("start"), end=sg.get("end"))
        out[d] = dict(file=p, q=q, z=b.get("z"), seg=[sg.get("start"), sg.get("end")], p_real=rl.get("p_real"), verdict=rl.get("verdict"), alt=[(x.get("path") or x.get("file"), x.get("z")) for x in r["results"][1:3]]); print(d, json.dumps(out[d]), flush=True)
    except Exception as e: print(d, "ERR", e, flush=True)
    json.dump(out, open("picks.json", "w"), indent=1)

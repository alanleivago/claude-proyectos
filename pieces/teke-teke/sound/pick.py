# rank -> find -> realness with earshot for each Freesound folder; writes picks.json
from earshot import api
import json, os
Q = {
 "snow_wind": "cold winter wind blowing",
 "snow_steps": "footsteps crunching in snow",
 "snow_run": "running footsteps in snow",
 "crossing_bell": "a railway crossing bell ringing",
 "fumikiri": "a railway crossing bell ringing",
 "train_pass": "a train passing by fast",
 "train_horn": "a train horn blast",
 "motor": "an electric motor whirring",
 "nails_concrete": "fingernails scratching on concrete",
 "nails": "fingernails tapping on a hard surface",
 "knock": "a knock on wood",
 "cloth_drag": "cloth dragging on a floor",
 "drip": "water dripping",
 "crow": "a crow cawing",
 "breath_run": "heavy breathing while running",
 "breath_panic": "heavy scared breathing",
 "snow_crunch": "snow crunching",
 "gasp": "a scared gasp",
 "whisper": "a creepy whisper",
 "shakuhachi": "a breathy bamboo flute note",
 "cinematic_impact_boom": "a deep cinematic impact boom",
 "dog_distant": "a dog barking far away",
 "buzz": "an electrical buzz",
}
out = json.load(open("picks.json")) if os.path.exists("picks.json") else {}
for d, q in Q.items():
    if d in out or not os.path.isdir(f"fs/{d}") or not os.listdir(f"fs/{d}"): continue
    try:
        r = api.rank(f"fs/{d}", q, top=3); b = r["results"][0]; p = b.get("path") or b.get("file")
        f = api.find(p, q, top=1); sg = (f.get("segments") or f.get("results") or [f])[0]
        rl = api.realness(p, start=sg.get("start"), end=sg.get("end"))
        out[d] = dict(file=p, q=q, z=b.get("z"), seg=[sg.get("start"), sg.get("end")], p_real=rl.get("p_real"), verdict=rl.get("verdict"), alt=[(x.get("path") or x.get("file"), x.get("z")) for x in r["results"][1:3]]); print(d, out[d]["file"], out[d]["z"], out[d]["seg"], out[d]["p_real"], flush=True)
    except Exception as e: print(d, "ERR", e, flush=True)
    json.dump(out, open("picks.json", "w"), indent=1)

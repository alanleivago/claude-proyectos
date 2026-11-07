# rank -> find -> realness with earshot for each Freesound folder; writes picks.json
from earshot import api
import json, os
Q = {
 "cave_drip": "water drops dripping in a cave",
 "cave_tone": "hollow cave room tone",
 "night_crickets": "crickets at night",
 "wind_brush": "night wind in dry bushes",
 "dog_distant": "a dog barking far away",
 "metal_tick": "hot metal ticking as it cools",
 "steps_gravel": "slow footsteps on gravel",
 "cloth": "jacket fabric rustling",
 "crawl_rock": "a body dragging over rock",
 "grit": "small stones trickling down",
 "nails": "fingernails tapping on a hard surface",
 "lamp_click": "a flashlight switch clicking",
 "buzz": "an electrical buzz flickering",
 "whisper": "a creepy whisper",
 "breath_panic": "heavy scared breathing",
 "squelch": "a wet slimy squelch",
 "teeth_grind": "teeth grinding",
 "generator": "a generator running",
 "shovel": "a shovel digging into gravel",
 "radio": "walkie talkie radio chatter",
 "shakuhachi": "a breathy bamboo flute note",
 "temple_bell": "a large temple bell struck once",
 "cinematic_impact_boom": "a deep cinematic impact boom",
 "bone_crack": "a dry crack of bone",
 "monster_breathing_deep": "a huge creature's slow deep breath",
}
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

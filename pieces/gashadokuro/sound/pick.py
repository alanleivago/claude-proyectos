# rank -> find -> realness with earshot for each Freesound folder; writes picks.json
from earshot import api
import json, os
Q = {
 "winter_wind_mountain": "cold winter wind blowing over a mountain",
 "wind_through_grass": "wind blowing through tall grass",
 "footsteps_snow": "slow footsteps crunching in snow",
 "gravel_footsteps_slow": "slow footsteps on a dirt path",
 "bones_rattle": "dry bones rattling and clicking",
 "bones_falling": "bones clattering and tumbling on the ground",
 "teeth_chattering": "teeth chattering",
 "crow_caw": "a crow cawing",
 "bird_wings_flapping": "a bird flapping its wings taking off",
 "tree_creaking": "a tree trunk creaking in the wind",
 "temple_bell": "a large temple bell struck once",
 "dog_barking_distant": "a dog barking far away",
 "cinematic_impact_boom": "a deep cinematic impact boom",
 "bone_crack": "a dry crack of bone",
 "monster_breathing_deep": "a huge creature's slow deep breath",
 "stone_grinding": "heavy stone grinding",
 "wooden_creak_small": "a small wooden creak",
 "paper_rustle": "paper rustling",
 "skull_rolling": "a hollow object rolling on the ground",
 "shakuhachi": "a breathy bamboo flute note",
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

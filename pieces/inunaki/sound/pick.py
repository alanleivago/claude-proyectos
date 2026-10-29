from earshot import api
import json, os
Q = {
 "car_engine_idle_old": "an old car engine idling, a steady low rumble",
 "car_door_slam": "a car door slamming shut",
 "car_wipers": "windscreen wipers swishing in the rain",
 "handbrake_car": "a car handbrake ratchet being pulled",
 "footsteps_wet_asphalt": "footsteps walking on wet asphalt",
 "footsteps_tunnel_echo": "footsteps echoing in a stone tunnel",
 "water_drip_cave_echo": "water dripping with a cave echo",
 "dogs_howling_night": "dogs howling in the distance at night",
 "running_footsteps_gravel": "someone running fast on gravel",
 "heavy_breathing_scared": "a man breathing heavily, scared",
 "cloth_rustle_fabric": "fabric rustling",
 "flashlight_click": "a flashlight switch click",
 "male_laugh": "a young man laughing",
 "wet_breathing_creature": "a creature's wet raspy breathing",
 "car_accelerate_away": "a car accelerating away fast",
 "taiko": "a deep taiko drum hit",
 "bamboo_flute": "a breathy bamboo flute melody",
 "rain_forest": "heavy rain falling on a forest",
 "tunnel_ambience": "the hollow hum of an empty tunnel",
 "birds_rain": "birds singing in the countryside",
 "deep_impact_boom_hit": "a deep cinematic impact boom",
}
out = json.load(open("picks.json")) if os.path.exists("picks.json") else {}
for d, q in Q.items():
    if d in out: continue
    try:
        r = api.rank(f"fs/{d}", q, top=3); b = r["results"][0]; p = b.get("path") or b.get("file")
        f = api.find(p, q, top=1); sg = (f.get("segments") or f.get("results") or [f])[0]
        rl = api.realness(p, start=sg.get("start"), end=sg.get("end"))
        out[d] = dict(file=p, z=b.get("z"), seg=[sg.get("start"), sg.get("end")], p_real=rl.get("p_real"), verdict=rl.get("verdict")); print(d, json.dumps(out[d]), flush=True)
    except Exception as e: print(d, "ERR", e, flush=True)
    json.dump(out, open("picks.json", "w"), indent=1)

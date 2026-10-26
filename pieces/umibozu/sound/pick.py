from earshot import api
import json
Q = {
 "boat_engine_idle": "a ship engine idling, a steady low diesel hum",
 "ship_creaking": "the slow groaning creak of a ship's hull and wood",
 "sonar_ping_underwater": "a single submarine sonar ping with an echo",
 "light_bulb_pop": "a light bulb popping and buzzing out",
 "big_splash": "a huge heavy splash into deep water",
 "deep_underwater_bubbles_rumble": "deep underwater bubbling and a low rumble",
 "water_pouring": "water pouring and splashing in a stream",
 "seagulls": "seagulls calling over a harbour",
}
out = {}
for d, q in Q.items():
    try:
        r = api.rank(f"fs/{d}", q, top=3); best = r["results"][0]; path = best.get("path") or best.get("file")
        f = api.find(path, q, top=1); seg = (f.get("segments") or f.get("results") or [f])[0]
        rl = api.realness(path, start=seg.get("start"), end=seg.get("end"))
        out[d] = dict(file=path, z=best.get("z"), seg=[seg.get("start"), seg.get("end")], p_real=rl.get("p_real"), verdict=rl.get("verdict")); print(d, json.dumps(out[d]))
    except Exception as e: print(d, "ERR", e)
json.dump(out, open("picks.json", "w"), indent=1)

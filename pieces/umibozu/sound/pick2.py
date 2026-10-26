from earshot import api
import json
Q = {"monster_roar_deep": "a huge deep monster roar, slow and resonant", "giant_creature_growl": "a low giant creature growl", "deep_breath_monster": "a huge creature breathing out, a deep rumbling exhale",
     "huge_wave_crash": "a heavy wave crashing", "waterfall_heavy": "heavy water pouring down like a waterfall", "whale_moan": "a long low whale moan", "water_draining_whirlpool": "water draining and swirling down"}
out = json.load(open("picks.json"))
for d, q in Q.items():
    try:
        r = api.rank(f"fs/{d}", q, top=3); b = r["results"][0]; p = b.get("path") or b.get("file"); f = api.find(p, q, top=1); sg = (f.get("segments") or f.get("results") or [f])[0]
        rl = api.realness(p, start=sg.get("start"), end=sg.get("end")); out[d] = dict(file=p, z=b.get("z"), seg=[sg.get("start"), sg.get("end")], p_real=rl.get("p_real"), verdict=rl.get("verdict")); print(d, json.dumps(out[d]))
    except Exception as e: print(d, "ERR", e)
json.dump(out, open("picks.json", "w"), indent=1)

from earshot import api
import json, os, sys
Q = {
 "carro_de_boi": "the long wooden squealing song of an ox cart's axle",
 "ox_cart": "a wooden ox cart rolling and creaking",
 "wooden_wheel_creak": "a wooden cart wheel creaking as it turns",
 "hooves_walking": "cattle hooves walking slowly on a dirt road",
 "cow_walking": "cows walking on dirt",
 "cow_snort": "a cow snorting",
 "cow_moo": "an ox bellowing loudly",
 "cow_breathing": "a cow breathing heavily",
 "crickets_night": "crickets chirping at night",
 "wind_dry_grass": "wind blowing through dry grass",
 "owl_night": "an owl hooting far away at night",
 "nightjar": "a nightjar calling at night",
 "tree_creaking_wood": "an old tree trunk creaking",
 "wood_creak_door_slow": "a slow wooden creak",
 "wood_cracking_splitting": "wood cracking and splitting violently",
 "bone_crack": "a dry crack of bone",
 "fire_crackling_stove": "a small wood fire crackling in a stove",
 "oil_lamp": "a flame fluttering",
 "chair_scrape_floor": "a wooden chair scraping on the floor",
 "leather_belt_whip": "a leather belt whipping through the air",
 "church_bell_single": "a small church bell ringing",
 "leather_creak": "leather creaking",
 "zombie_breathing": "a dry raspy creature breathing",
 "monster_breathing": "a creature's slow raspy breath",
 "metal_clank_chain": "small metal clinking",
 "keys_jingle_rattle": "a metal lantern rattling",
 "metal_lantern_drop": "a metal lantern falling on the ground",
 "glass_clink": "glass clinking",
 "jump_landing_dirt": "someone jumping down and landing on dirt",
 "footsteps_dirt_boots": "footsteps in boots on a dirt road",
 "birds_morning": "birds singing at dawn in the countryside",
 "birds_dawn_countryside": "birds singing at dawn in the countryside",
 "rooster_crow": "a rooster crowing far away",
 "cinematic_impact_boom": "a deep cinematic impact boom",
}
out = json.load(open("picks.json")) if os.path.exists("picks.json") else {}
for d, q in Q.items():
    if d in out or not os.path.isdir(f"fs/{d}") or not os.listdir(f"fs/{d}"): continue
    try:
        r = api.rank(f"fs/{d}", q, top=3); b = r["results"][0]; p = b.get("path") or b.get("file")
        f = api.find(p, q, top=1); sg = (f.get("segments") or f.get("results") or [f])[0]
        rl = api.realness(p, start=sg.get("start"), end=sg.get("end"))
        out[d] = dict(file=p, z=b.get("z"), seg=[sg.get("start"), sg.get("end")], p_real=rl.get("p_real"), verdict=rl.get("verdict"), alt=[(x.get("path") or x.get("file"), x.get("z")) for x in r["results"][1:3]]); print(d, json.dumps(out[d]), flush=True)
    except Exception as e: print(d, "ERR", e, flush=True)
    json.dump(out, open("picks.json", "w"), indent=1)

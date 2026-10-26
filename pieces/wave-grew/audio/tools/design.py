# design.py: writes design/ambience.json and design/sfx.json (mix.py fragments) from the tables below.
# Levels are written as a target loudness (LUFS of the bed / momentary of the effect, pre-master) and converted to
# gain_db with the measured loudness of each recording (work/analyze.json from real-sound analyze.py).
import json, os
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AN = {os.path.basename(d["path"] if "path" in d else d["file"]): d for d in json.load(open(os.path.join(A, "work", "analyze.json")))}

def lufs(f):
    d = AN.get(os.path.basename(f))
    if d is None: raise SystemExit(f"not analysed: {f}")
    return d.get("lufs", d.get("integrated_lufs"))

F = {  # short names -> files (all under audio/)
 "surf": "assets/amb/fs-827530_ocean-coast-04-092025-0659am.ogg",
 "gulls": "assets/amb/fs-59492_20080807-seagulls-wav.ogg",
 "crowd": "assets/people/fs-476099_ambience-crowded-beach.ogg",
 "hiss": "assets/board/fs-512126_sailboat-wake-hissing-light-breeze-wav.ogg",
 "rush": "assets/board/fs-17143_lg-water3-wav.ogg",
 "spill": "assets/board/fs-497695_water-over-damn-spillway-wav.ogg",
 "wind": "assets/wind/fs-146914_strong-wind-blowing-and-howling-in-the-m.ogg",
 "howl": "assets/commons/cm-Howling_wind.wav",
 "crash": "assets/roar/fs-861756_sea-waves-heavily-crashing-on-the-shorel.ogg",
 "rocks": "assets/tube/fs-506443_seawaves-against-rocks.ogg",
 "city": "assets/city/fs-553998_edge-of-city-ambience-wav.ogg",
 "siren": "assets/city/fs-469363_distant-ambulance-siren.ogg",
 "bell": "assets/city/fs-554655_bec-low-bell-solo-wav.ogg",
 "dfall": "assets/drain/fs-348827_distant-waterfall-from-lookout.ogg",
 "gurgle": "assets/drain/fs-184304_emptying-the-bath-gurgle.ogg",
 "boil": "assets/boil/fs-420228_37-17-boiling-water-wav.ogg",
 "steam": "assets/boil/fs-119741_steam-hiss-wav.ogg",
 "ice": "assets/ice/fs-168712_ice-cracks.ogg",
 "xtal": "assets/ice/fs-104762_conxiadora-flac.ogg",
 "glass3": "assets/glass/fs-62053_glass3-wav.ogg",
 "glass4": "assets/glass/fs-62054_glass4-wav.ogg",
 "rumble": "assets/rumble/fs-184313_cinematic-deep-rumble.ogg",
 "quake": "assets/rumble/fs-203281_earthquake-or-distant-space-shuttle-rumb.ogg",
 "under": "assets/tube/fs-366159_underwater-loop-amb-wav.ogg",
 "tunnel": "assets/tube/fs-454353_wind-drone-howl-tunnel-stairwell2-flac.ogg",
 "panic": "assets/people/fs-491405_crowd-in-panic.ogg",
 "whoosh1": "assets/whoosh/fs-351256_deep-whoosh-1.ogg",
 "whoosh2": "assets/whoosh/fs-351259_deep-whoosh-2.ogg",
 "whip": "assets/wind/fs-361487_wind-whipping-by-wav.ogg",
 "jet": "assets/jet/fs-235956_airliner-flyby-wav.ogg",
 "jet2": "assets/jet/fs-431206_airplane-flyby.ogg",
 "jet3": "assets/jet/fs-240573_low-approach-f-wav.ogg",
 "riserA": "assets/riser/fs-826672_first-sunlight-cinematic-riser-sound-abr.ogg",
 "riserB": "assets/riser/fs-493542_tension-building-riser-whoosh-sfx-1-wav.ogg",
 "boom": "assets/impact/fs-377303_deep-cinematic-impact.ogg",
 "boom2": "assets/impact/fs-195790_cinematic-boom-130730-06-wav.ogg",
 "expl": "assets/impact/fs-459973_huge-explosion.ogg",
 "splash": "assets/impact/fs-442773_big-water-splash.ogg",
 "wsplash": "assets/impact/fs-196676_big-wave-splash-mp3.ogg",
 "crack": "assets/ice/fs-268023_breaking-ice-01-wav.ogg",
 "tick": "assets/glass/fs-338302_glass-hammer-on-a-crystal-bell-wav.ogg",
 "bowl": "assets/glass/fs-116315_big-singing-bowl.ogg",
 "spr1": "assets/spray/fs-166984_splash-008-wav.ogg",
 "spr2": "assets/spray/fs-166980_splash-007-wav.ogg",
 "spr3": "assets/spray/fs-166981_splash-006-wav.ogg",
}

def bed(name, key, at, until, target, auto, **kw):
    """target: LUFS of the bed at auto 0 dB (pre-master); auto: [[t, dB]]"""
    d = {"name": "am." + name, "file": F[key], "at": at, "until": until,
         "gain_db": round(target - lufs(F[key]), 2), "auto": auto}
    d.update(kw); return d

amb = [
 # teaser 0-6.2: Earth in a glass ring: a deep rumble swell + the singing glass (pitched C#3 -> C3), silent by 6.2
 bed("teaser_rumble", "rumble", 0.0, 6.2, -30, [[0, -14], [1.0, -8], [3.0, -4], [5.2, 0], [5.9, -3], [6.2, -40]], fade_in=0.05, fade_out=0.3),
 bed("teaser_glass", "glass3", 0.0, 6.2, -32, [[0, -18], [1.5, -8], [5.0, 0], [6.2, -30]], fade_in=0.1, fade_out=0.35, src_start=0.5, eq={"hp": 120}),
 # the beach 7-100
 bed("surf", "surf", 7.0, 104.0, -25, [[7, -6], [10, 0], [40, -1], [60, -3], [80, -6], [92, -10], [104, -30]], src_start=6.0, fade_in=1.6, fade_out=6.0),
 bed("gulls", "gulls", 7.5, 72.0, -33, [[7.5, 0], [35, -1], [52, -5], [72, -20]], fade_in=2.0, fade_out=8.0, eq={"hp": 400}, width=0.8),
 bed("crowd", "crowd", 7.0, 62.0, -37, [[7, 0], [30, -2], [45, -6], [62, -20]], fade_in=2.0, fade_out=8.0, eq={"lp": 4500, "hp": 150}),
 # the board: hiss grows with speed (12 -> 70 km/h on the beach), then the rush; both thin out with the air 240-276
 bed("hiss", "hiss", 7.0, 278.0, -30, [[7, -4], [30, -1], [60, 2], [90, 4], [181, 4], [182.5, -6], [185, -6], [187, 3], [240, 3], [262, -6], [276, -30]],
     fade_in=1.2, fade_out=4.0, eq={"hp": 180}),
 bed("rush", "rush", 24.0, 278.0, -30, [[24, -16], [45, -7], [70, -3], [90, 0], [160, 2], [181, 2], [182.5, -9], [185, -9], [187, 1], [240, 0], [262, -8], [276, -30]],
     fade_in=4.0, fade_out=4.0, eq={"hp": 300, "lp": 9000}),
 # wind in the ears: lowpassed on the beach, open and strong from the town up; gone by 276 ("Space starts here")
 bed("wind_low", "wind", 7.0, 112.0, -32, [[7, -4], [40, 0], [70, 2], [90, 3], [112, -10]], fade_in=2.0, fade_out=12.0, eq={"lp": 2200, "hp": 80}),
 bed("wind", "wind", 88.0, 278.0, -27, [[88, -12], [110, -2], [160, 0], [181.5, 0], [182.5, -8], [185, -8], [187, 3], [240, 3], [255, -2], [268, -10], [276, -30]],
     src_start=20.0, fade_in=8.0, fade_out=4.0, eq={"hp": 60}),
 bed("howl", "howl", 186.0, 274.0, -28, [[186, -12], [200, 0], [240, 0], [258, -6], [274, -24]], fade_in=4.0, fade_out=6.0, eq={"hp": 100}, width=0.0),
 # the wave's breaking roar: grows on the beach, opens up at 70 (26 m), the big roar from the town to the sky
 bed("crash", "crash", 18.0, 280.0, -24, [[18, -16], [40, -8], [60, -4], [69, -3], [71.5, 1], [90, 2], [110, 1], [160, 1], [181.5, 1], [182.5, -12], [185, -12], [187, 0], [235, -1], [255, -6], [268, -14], [280, -30]], fade_in=6.0, fade_out=3.0),
 bed("roar", "rocks", 66.0, 280.0, -23, [[66, -20], [69, -14], [72, -3], [90, 0], [140, 2], [181.5, 2], [182.5, -14], [185, -14], [187, 1], [235, 0], [250, -4], [266, -12], [278, -30]],
     fade_in=3.0, fade_out=3.0, eq={"lowshelf": [200, 3.0]}),
 bed("roar_muffled", "spill", 180.5, 188.0, -24, [[180.5, -20], [182.0, 0], [184.8, 0], [186.5, -20]], src_start=40.0, fade_in=1.0, fade_out=1.2,
     eq={"lp": 420, "lp_order": 4}),
 bed("churn", "spill", 88.0, 262.0, -27, [[88, -16], [100, -2], [160, 0], [181.5, 0], [182.5, -12], [185, -12], [187, 0], [230, -2], [262, -20]],
     fade_in=6.0, fade_out=10.0, eq={"hp": 120}),
 # the town far below: city edge, sirens far away
 bed("city", "city", 86.0, 168.0, -37, [[86, -14], [96, 0], [130, -3], [150, -8], [168, -20]], fade_in=5.0, fade_out=10.0, eq={"hp": 120, "lp": 3500}),
 bed("siren", "siren", 109.0, 133.0, -45, [[109, -10], [113, 0], [128, -2], [133, -20]], fade_in=3.0, fade_out=4.0, eq={"lp": 2400, "hp": 300}, width=0.5),
 # the sea draining ahead: a vast distant rush + far gurgling
 bed("drain_rush", "dfall", 195.0, 217.0, -30, [[195, -14], [200, 0], [210, 0], [217, -16]], fade_in=3.0, fade_out=4.0, eq={"lp": 5000}),
 bed("drain_gurgle", "gurgle", 199.0, 214.0, -40, [[199, -12], [203, 0], [210, 0], [214, -16]], src_start=6.0, fade_in=2.0, fade_out=3.0,
     eq={"lp": 1400, "hp": 80}),
 # the crest boils at the Armstrong limit
 bed("boil", "boil", 232.0, 254.0, -33, [[232, -14], [237, 0], [246, 0], [254, -18]], fade_in=3.0, fade_out=5.0, eq={"hp": 400}),
 bed("steam", "steam", 234.0, 250.0, -40, [[234, -14], [238, 0], [244, 0], [250, -18]], fade_in=2.5, fade_out=4.0, eq={"hp": 1500, "lp": 9000}, width=0.0),
 # the spray freezes: ice crackle 278-292, then faint crystals in space
 bed("ice", "ice", 277.0, 293.0, -40, [[277, -12], [280, 0], [288, 0], [293, -16]], fade_in=2.0, fade_out=3.0, eq={"hp": 2500}, width=0.0),
 bed("crystals", "xtal", 292.0, 458.0, -50, [[292, -10], [300, 0], [450, 0], [458, -14]], fade_in=4.0, fade_out=6.0, eq={"hp": 3000}),
 # the wave ring: singing glass in C (pitched down 1.42 st from C#3) under space
 bed("ring3", "glass3", 288.0, 467.30, -36, [[288, -18], [300, 0], [340, -2], [405, 0], [455, 2], [467.25, 2]], fade_in=6.0, fade_out=0.04,
     eq={"hp": 100}, width=1.0),
 bed("ring4", "glass4", 300.0, 467.30, -40, [[300, -18], [320, 0], [405, 0], [455, 3], [467.25, 3]], fade_in=8.0, fade_out=0.04, eq={"hp": 100}),
 # the oceans draining (deep swell), the Moon growing (low rumble rising), both cut at 467.3
 bed("oceans", "quake", 337.0, 369.0, -28, [[337, -16], [346, -6], [356, 0], [362, -3], [369, -20]], fade_in=4.0, fade_out=5.0),
 bed("moon", "rumble", 405.0, 467.30, -32, [[405, -14], [430, -6], [455, 0], [467.25, 3]], fade_in=6.0, fade_out=0.04),
 # the barrel 470-497.5: hollow tube roar, filtered, awe; silent by 497.5
 bed("tube_under", "under", 469.4, 497.5, -31, [[469.4, -24], [471.5, -4], [476, 0], [488, 0], [494, -10], [497.5, -40]], fade_in=1.5, fade_out=3.0),
 bed("tube_howl", "tunnel", 469.6, 497.5, -33, [[469.6, -24], [472, -4], [478, 0], [488, -1], [494, -12], [497.5, -40]], fade_in=1.5, fade_out=3.0, eq={"hp": 90}),
 bed("tube_roar", "spill", 469.4, 497.5, -33, [[469.4, -24], [471.5, -6], [476, 0], [488, 0], [494, -12], [497.5, -40]], src_start=60.0, fade_in=1.5, fade_out=3.0,
     eq={"lp": 900, "lp_order": 4, "peq": [[350, 1.2, 4.0]]}),
]
# pitch on beds is not a mix.py ambience key: glass is pitched through samples placed on the sfx bus? no -> keep the C# glass
# only where the music is absent (teaser) and use the pitched samples below for the ring under the music.
for b in amb:
    if b["name"] in ("am.ring3", "am.ring4"): b["_pitch_note"] = "replaced by pitched sample placements (sfx.json)"
amb = [b for b in amb if b["name"] not in ("am.ring3", "am.ring4")]

samples, place = {}, []
def S(name, key, **kw):
    d = {"file": F[key]}; d.update(kw); samples["fx." + name] = d
def P(name, at, gain_db=0.0, **kw):
    d = {"sample": "fx." + name, "at": at, "gain_db": gain_db}; d.update(kw); place.append(d)

# the ring under the music: glass3/glass4 pitched -1.42 st (C#3 -> C3), overlapping long notes (each ~20 s)
S("ring3", "glass3", start=0.4, end=27.5, pitch=-1.42, eq={"hp": 100}, fade_in=1.5, fade_out=3.0, norm_peak_db=-30)
S("ring4", "glass4", start=0.3, end=21.5, pitch=-1.42, eq={"hp": 100}, fade_in=1.5, fade_out=3.0, norm_peak_db=-32)
t, k = 290.0, 0
while t < 446.0:
    P("ring3" if k % 2 == 0 else "ring4", t, 0.0 if t < 405 else 2.0, pan=(-0.35 if k % 2 == 0 else 0.35), align="start")
    t += 14.0; k += 1
# spray hits on the beach (small, varied)
for i, (tt, key) in enumerate([(13.2, "spr1"), (24.6, "spr2"), (33.9, "spr3"), (46.1, "spr1"), (55.4, "spr2"), (63.8, "spr3"), (77.3, "spr1"), (86.9, "spr2")]):
    S(f"spray{i}", key, eq={"hp": 500}, norm_peak_db=-22 + min(i, 6) * 0.8, fade_out=0.2)
    P(f"spray{i}", tt, pan=[-0.3, 0.25, -0.15, 0.35, -0.4, 0.2, -0.25, 0.3][i], align="attack")
# swimmers shouting faintly ~38
S("swimmers", "panic", start=4.0, end=11.5, eq={"lp": 2800, "hp": 300}, fade_in=1.2, fade_out=2.5, norm_peak_db=-30)
P("swimmers", 37.4, pan=-0.35, align="start")
# the lighthouse slides under the board ~101
S("lighthouse", "whoosh1", eq={"hp": 60}, norm_peak_db=-14, fade_out=0.3)
P("lighthouse", 101.0, align="peak", pan=0.0)
# a church bell once ~126 (far below)
S("bell", "bell", start=0.35, end=9.5, eq={"lp": 2600, "hp": 150}, fade_out=4.0, norm_peak_db=-30)
P("bell", 126.0, align="attack", pan=-0.4)
# into the cloud 181.5 (wind whips by), out of the cloud ~185.6
S("cloud_in", "whip", start=9.0, end=15.0, eq={"lp": 2500}, fade_in=0.8, fade_out=1.5, norm_peak_db=-14)
P("cloud_in", 181.4, align="start", pan=0.0)
S("cloud_out", "whoosh2", eq={"hp": 80}, norm_peak_db=-14, fade_out=0.3)
P("cloud_out", 185.6, align="peak", pan=-0.2)
# the airliner under the lip 218.5-228.4 (recorded Doppler flyby), peak at 223.4
S("jet", "jet", start=1.2, end=15.6, eq={"hp": 70, "lp": 2500}, fade_in=1.2, fade_out=2.5, norm_peak_db=-11)
P("jet", 223.4 - (6.591 - 1.2), align="start", pan=0.45)
# the bright full-band flyby (aircraft engine, content to 16 kHz) on the same apex + a turbine whine layer
S("jet2", "jet2", start=0.4, end=15.8, eq={"hp": 120}, fade_in=0.8, fade_out=2.5, norm_peak_db=-4)
P("jet2", 223.4 - (5.5 - 0.4), align="start", pan=0.35)
S("jet3", "jet3", start=17.0, end=36.0, eq={"hp": 1200}, fade_in=2.0, fade_out=3.0, norm_peak_db=-13)
P("jet3", 223.6 - (25.0 - 17.0), align="start", pan=0.5)
# the ISS passes ~299: a soft stylised whoosh, low and dark
S("iss", "whoosh1", pitch=-3.0, eq={"lp": 2200, "hp": 60}, norm_peak_db=-22, fade_out=0.4)
P("iss", 299.2, align="peak", pan=0.3)
# the riser into the cut: a real riser with an abrupt stop exactly on 467.30 + a rising whoosh riser under it
S("riserA", "riserA", start=0.0, end=8.085, fade_in=0.05, fade_out=0.006, norm_peak_db=-13)
P("riserA", 467.30 - 8.085, align="start")
S("riserB", "riserB", start=0.0, end=9.62, fade_in=0.5, fade_out=0.008, norm_peak_db=-17, env=[[0, -6], [6, -2], [9.62, 0]])
P("riserB", 467.30 - 9.62, align="start")
# THE HIT 468.0: deep impact + boom + explosion body + water explosion + ice crack (recordings; the synth sub/crack on top)
S("hit_boom", "boom", norm_peak_db=-5, fade_out=0.4)
S("hit_boom2", "boom2", norm_peak_db=-5, fade_out=0.6)
S("hit_expl", "expl", start=8.20, end=16.0, norm_peak_db=3, fade_out=3.0)
S("hit_splash", "splash", norm_peak_db=4, fade_out=0.3)
S("hit_wave", "wsplash", start=0.7, end=5.2, norm_peak_db=-4, fade_out=1.8, eq={"hp": 120})
S("hit_crack", "crack", start=7.82, end=8.60, norm_peak_db=0, fade_out=0.08)
S("hit_crack2", "crack", start=5.50, end=6.10, norm_peak_db=-12, fade_out=0.08)
for n, off, pan in (("hit_boom", 0.0, 0.0), ("hit_boom2", 0.0, 0.0), ("hit_expl", 0.0, 0.0), ("hit_splash", 0.02, -0.2), ("hit_wave", 0.25, 0.2),
                    ("hit_crack", 0.0, 0.15), ("hit_crack2", 0.32, -0.35)):
    P(n, 468.0 + off, align="attack", pan=pan)
# glass fact cards: a very soft glassy tick (G6, the fifth of C), ~24 dB under the music
S("tick", "tick", start=0.1, end=3.0, eq={"hp": 900}, fade_out=1.2, norm_peak_db=-34)
for tt in (70, 145, 172, 195, 236, 275, 299, 405, 422, 445):
    P("tick", tt + 0.25, align="attack", pan=0.55)
# the end card: one soft singing-bowl note (A4 -> G4, the fifth over the music's last C) ringing out
S("endnote", "bowl", start=0.0, end=9.6, pitch=-1.64, eq={"hp": 150}, fade_in=0.01, fade_out=4.5, norm_peak_db=-19)
P("endnote", 498.0, align="attack", pan=0.0)

json.dump({"_doc": "ambience beds (amb bus): targets are pre-master LUFS of each bed at auto 0 dB; see tools/design.py", "ambience": amb},
          open(os.path.join(A, "design", "ambience.json"), "w"), indent=1)
json.dump({"_doc": "point effects (sfx bus), see tools/design.py", "samples": samples, "place": place},
          open(os.path.join(A, "design", "sfx.json"), "w"), indent=1)
print(len(amb), "beds,", len(samples), "samples,", len(place), "placements")

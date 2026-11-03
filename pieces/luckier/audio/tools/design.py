# design.py: writes design/ambience.json and design/sfx.json (real-sound mix.py fragments) for luckier from the tables below.
# Beds: a target loudness (pre-master LUFS of the bed at auto 0 dB) converted to gain_db with the measured loudness of each
# recording (work/analyze.json from real-sound analyze.py). Effects: norm_peak_db (pre-master dBFS) + placements.
# Picture times come from src/scenes.js (BEATS, FACTS) and the set files (see the comment on each cue).
import json, os
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AN = {os.path.basename(d["file"]): d for d in json.load(open(os.path.join(A, "work", "analyze.json")))}

def lufs(f):
    d = AN.get(os.path.basename(f))
    if d is None: raise SystemExit(f"not analysed: {f}")
    return d["lufs"]

F = {
 # street / inside
 "street": "assets/street/fs-639133_220618-1982-fr-calmsuburbanstreet-wav.ogg",
 "birds": "assets/street/fs-511758_early-morning-birds-04-mp3.ogg",
 "room": "assets/office/fs-736848_room-tone-apartment-622-pm-240215-0662.ogg",
 "room2": "assets/office/fs-766589_room-tone-aparment-1054-am-220813-0498.ogg",
 "conv": "assets/extra/fs-505815_car-idle-vintage-mb-convertable-wav.ogg",
 "carin": "assets/extra/fs-152661_car-acceleration-inside-car-wav.ogg",
 "relay": "assets/extra/fs-384698_a-relay-switch-being-activated.ogg",
 "bill": "assets/foley/fs-581844_foley-bills-mono-14-wav.ogg",
 "cafe": "assets/cafe/fs-99632_small-cafe-ambience-wav.ogg",
 "hbell": "assets/cafe/fs-140150_ringing-a-hand-bell-wav.ogg",
 "pop1": "assets/cafe/fs-26349_partypopper-flac.ogg",
 "pop2": "assets/cafe/fs-184131_irtincanpopperinmicmonocleanplus-wav.ogg",
 "cheer_s": "assets/casino/fs-264377_small-crowd-cheering.ogg",
 "espresso": "assets/cafe/fs-333948_coffee-espresso-machine-wave-44100hz-wav.ogg",
 "nostart": "assets/extra/fs-123686_chev-350-start-then-die-wav.ogg",
 "crank": "assets/extra/fs-579213_1970-vw-bug-engine-cranking-2-wav.ogg",
 "steam": "assets/extra/fs-119741_steam-hiss-wav.ogg",
 "office": "assets/office/fs-541117_office-ambience-wav.ogg",
 "shake": "assets/foley/fs-275216_handshake-focusfox-mp3.ogg",
 "clap_s": "assets/office/fs-99634_small-crowd-cheering-and-clapping-wav.ogg",
 "clap_m": "assets/office/fs-100904_small-crowd-cheering-and-clapping-3-aif.ogg",
 "scratch": "assets/extra/fs-445603_lottery-ticket-scratch-wav.ogg",
 "cage": "assets/extra/fs-808131_gamecas-blue-snowball-microphone-mcu-bin.ogg",
 "pong": "assets/extra/fs-149729_balle-ping-pong-1-aif.ogg",
 "flash1": "assets/extra/fs-624923_single-camera-click-with-flash-wav.ogg",
 "flash2": "assets/office/fs-455511_ios-camera-flash.ogg",
 "flash3": "assets/office/fs-353044_camera-shutter-and-flash-combined.ogg",
 "charge": "assets/extra/fs-148267_off-camera-flash-charging.ogg",
 "busstop": "assets/street/fs-213564_at-a-bus-stop.ogg",
 "tear1": "assets/foley/fs-111105_tearing-paper-01-wav.ogg",
 "tear2": "assets/foley/fs-111106_tearing-paper-02-wav.ogg",
 "tear3": "assets/foley/fs-111114_tearing-paper-10-wav.ogg",
 "tear4": "assets/foley/fs-111119_tearing-paper-15-wav.ogg",
 "news": "assets/extra/fs-558059_in-other-news.ogg",
 # casino
 "casino": "assets/casino/fs-118855_casino-ambiance-03-wav.ogg",
 "payout": "assets/casino/fs-361346_slot-machine-payout-wav.ogg",
 "pour": "assets/coin/fs-363089_coins-being-poured.ogg",
 "slotjin": "assets/casino/fs-587380_arp-slot-machine-minor-wav.ogg",
 "marble": "assets/extra2/fs-448165_marbles-rolling-around-33cm-ceramic-bowl.ogg",
 "chip": "assets/casino/fs-201807_poker-chips1-wav.ogg",
 "chips": "assets/casino/fs-707910_throwing-poker-chips-on-a-wooden-table-s.ogg",
 "cheer2": "assets/casino/fs-346689_crowd-cheer-2-wav.ogg",
 "cheer1": "assets/casino/fs-346685_crowd-cheer-wav.ogg",
 "walkie": "assets/extra2/fs-620516_walkiebeep-wav.ogg",
 "squelch": "assets/extra2/fs-524205_radio-sign-off-squelch.ogg",
 "wetcar": "assets/street/fs-462862_passing-car-wet-road.ogg",
 # storm
 "stormwind": "assets/storm/fs-721534_storm-wind-in-trees-1722-160221-0857.ogg",
 "dthun3": "assets/storm/fs-581124_distant-thunder-3.ogg",
 "dthun4": "assets/storm/fs-581125_distant-thunder-4.ogg",
 "rain": "assets/storm/fs-243628_heavy-rain.ogg",
 "thunA": "assets/storm/fs-320050_thunder-very-close-no-rain-a-wav.ogg",
 "thunB": "assets/storm/fs-320049_thunder-very-close-no-rain-b-wav.ogg",
 "clap": "assets/storm/fs-534023_thunderclap.ogg",
 "thunC": "assets/storm/fs-840628_closeup-thunder-strike-01.ogg",
 "branch": "assets/storm/fs-164472_crack-of-branch-3-wav.ogg",
 "sparks": "assets/extra/fs-849772_electric-sparks.ogg",
 "alarm": "assets/storm/fs-185474_car-alarm-flac.ogg",
 # charm act
 "stadium": "assets/crowd/fs-691975_crowd-and-field-noise-before-and-during-.ogg",
 "goal": "assets/extra2/fs-237679_football-crowd-goal-cheer-southampton-vs.ogg",
 "cabin": "assets/crowd/fs-433002_amb-airplane-cabin-passenger-chatter-sea.ogg",
 "chime": "assets/crowd/fs-331680_airplane-seat-belt-chime.ogg",
 "ship": "assets/crowd/fs-91072_on-a-wooden-ship-at-sea-02-wav.ogg",
 "horn": "assets/crowd/fs-420716_ship-horn-very-close.ogg",
 "groan": "assets/crowd/fs-764212_crwdreac-crowd-groan-in-disagreement-sha.ogg",
 # cost act
 "slosh": "assets/crowd/fs-235625_water-sloshing.ogg",
 "bucket": "assets/crowd/fs-165197_water-schwapp-bucket-metal-wav.ogg",
 "pump": "assets/crowd/fs-25023_20061105sumppumpsiphon-wav.ogg",
 "truck": "assets/street/fs-22882_idle-truck-flac.ogg",
 "truckgo": "assets/street/fs-26814_t-start1-mp3.ogg",
 "box": "assets/foley/fs-364740_open-cardboard-box-compartment-wav.ogg",
 "murmur": "assets/street/fs-746444_mumbling-crowd-people-talking-background.ogg",
 "envelope": "assets/extra/fs-444431_sliding-envelope-wav.ogg",
 "gasp": "assets/extra/fs-264376_small-crowd-gasp-shock-surprise.ogg",
 "register": "assets/extra/fs-209578_cash-register-purchase.ogg",
 "cash": "assets/foley/fs-459546_moolah-counting-out-bills-wav.ogg",
 "protest": "assets/extra/fs-71462_protest-crowd-ambience-wav.ogg",
 "dusk": "assets/street/fs-218096_suburban-evening.ogg",
 "wind": "assets/wg/fs-146914_strong-wind-blowing-and-howling-in-the-m.ogg",
 # island / space / end
 "tstorm": "assets/island/fs-376810_long-thunder-rolls-and-heavy-rain-wav.ogg",
 "howl": "assets/wg/cm-Howling_wind.wav",
 "waves": "assets/island/fs-578524_calm-ocean-waves.ogg",
 "wavesg": "assets/island/fs-149488_waves-and-seagulls-wav.ogg",
 "surf": "assets/wg/fs-827530_ocean-coast-04-092025-0659am.ogg",
 "gulls": "assets/wg/fs-59492_20080807-seagulls-wav.ogg",
 "splash": "assets/island/fs-59104_splash-wav.ogg",
 "tsplash": "assets/island/fs-321490_tiny-splash.ogg",
 "eel": "assets/island/fs-7055_eel-fishing-3-wav.ogg",
 "crickets": "assets/street/fs-1053_rbh-crickets-suburb-night1-wav.ogg",
 "quake": "assets/space/fs-203281_earthquake-or-distant-space-shuttle-rumb.ogg",
 "rumble": "assets/wg/fs-184313_cinematic-deep-rumble.ogg",
 "whoosh1": "assets/wg/fs-351256_deep-whoosh-1.ogg",
 "whoosh2": "assets/wg/fs-351259_deep-whoosh-2.ogg",
 "riserA": "assets/wg/fs-826672_first-sunlight-cinematic-riser-sound-abr.ogg",
 # coin + UI
 "flip1": "assets/coin/fs-485724_coin-flip-1.ogg",
 "flip5": "assets/coin/fs-485728_coin-flip-5.ogg",
 "spin4": "assets/extra/fs-485741_coin-spin-4.ogg",
 "spin7": "assets/extra/fs-485744_coin-spin-7.ogg",
 "catch": "assets/coin/fs-180698_st-catchingcoinpurse-wav.ogg",
 "cdrop": "assets/coin/fs-19778_coindrop1-wav.ogg",
 "cfoley": "assets/coin/fs-800068_coin-foley-6-wav.ogg",
 "sand": "assets/island/fs-384082_foot-step-grit-sand-wav.ogg",
 "swoosh": "assets/ui/fs-623709_soft-swoosh-with-noisy-ambience-wav.ogg",
 "sparkle": "assets/ui/fs-562196_snd-fragment-retrieve-wav.ogg",
 "ding": "assets/ui/fs-127149_ding-wav.ogg",
 "boom": "assets/ui/fs-151812_orch-002-boom-wav.ogg",
 "thump": "assets/ui/fs-160739_body-fall-3-wav.ogg",
 "bowl": "assets/wg/fs-116315_big-singing-bowl.ogg",
}

amb = []
def bed(name, key, at, until, target, auto, **kw):
    d = {"name": "am." + name, "file": F[key], "at": at, "until": until, "gain_db": round(target - lufs(F[key]), 2), "auto": auto}
    d.update(kw); amb.append(d)

# ---- teaser 0-6.2: the island in a storm, coins and fish raining down; everything cut at 6.15 (6.2-7.0 black, silent)
bed("t_storm", "tstorm", 0.0, 6.2, -33, [[0, -6], [1.0, 0], [6.0, 0]], src_start=40.0, fade_in=0.3, fade_out=0.05)
bed("t_howl", "howl", 0.0, 6.2, -36, [[0, -4], [6.0, 0]], src_start=1.0, fade_in=0.4, fade_out=0.05, eq={"hp": 120})
# ---- the street by day (flip 7-16, greens 25-34, twenty 34-43, rival 52-61)
for nm, a, b in (("st1", 7.0, 16.0), ("st2", 25.0, 43.0), ("st3", 52.0, 61.0)):
    bed(nm, "street", a, b, -34, [[a, 0], [b, 0]], src_start={"st1": 20.0, "st2": 120.0, "st3": 260.0}[nm], fade_in=0.4 if a > 7 else 1.2, fade_out=0.15, eq={"hp": 80})
    bed(nm + "_birds", "birds", a, b, -37, [[a, 0], [b, 0]], src_start={"st1": 5.0, "st2": 40.0, "st3": 100.0}[nm], fade_in=0.4 if a > 7 else 1.5, fade_out=0.15, eq={"hp": 1500}, width=0.9)
# greens: the little convertible cruising (engine bed, a gentle rev), engine under the street bed
bed("conv", "conv", 25.0, 34.0, -33, [[25, -2], [27.5, 0], [34, 0]], src_start=14.0, fade_in=0.2, fade_out=0.2, eq={"hp": 50, "lp": 6000})
# twenty: just the street + birds (st2 continues)
# ---- inside: the kitchen (toast 16-25), the apartment at night (powerball 79-88), tvwarning at home (336-340)
bed("kitchen", "room", 16.0, 25.0, -42, [[16, 0], [25, 0]], src_start=10.0, fade_in=0.1, fade_out=0.1)
bed("kitchen_birds", "birds", 16.0, 25.0, -45, [[16, 0], [25, 0]], src_start=70.0, fade_in=0.1, fade_out=0.1, eq={"hp": 1500, "lp": 5000})
bed("cafe", "cafe", 43.0, 52.0, -33, [[43, 0], [52, 0]], src_start=8.0, fade_in=0.1, fade_out=0.15)
bed("espresso", "espresso", 46.5, 52.0, -42, [[46.5, 0], [52, 0]], src_start=4.0, fade_in=1.0, fade_out=0.15, eq={"hp": 300})
bed("steam", "steam", 52.0, 61.0, -41, [[52, 0], [61, 0]], src_start=2.0, fade_in=0.3, fade_out=0.15, eq={"hp": 900}, width=0.5)
bed("office1", "office", 61.0, 70.0, -36, [[61, 0], [70, 0]], src_start=10.0, fade_in=0.1, fade_out=0.1)
bed("store", "room2", 70.0, 79.0, -40, [[70, 0], [79, 0]], src_start=20.0, fade_in=0.1, fade_out=0.1)
bed("store_st", "street", 70.0, 79.0, -44, [[70, 0], [79, 0]], src_start=200.0, fade_in=0.1, fade_out=0.1, eq={"lp": 1500})
bed("apt_night", "room", 79.0, 88.0, -42, [[79, 0], [88, 0]], src_start=40.0, fade_in=0.1, fade_out=0.1)
# powerball on TV: the ball machine heard through the TV speaker (band-limited)
bed("tv_cage", "cage", 79.0, 86.6, -36, [[79, -3], [80, 0], [86.0, 0], [86.6, -12]], src_start=14.0, fade_in=0.3, fade_out=0.4, eq={"hp": 350, "lp": 4500}, width=0.3)
# press conferences: a room of reporters (cheque 88, again 106, ginther 115)
for nm, a, b, s in (("press1", 88.0, 97.0, 2.0), ("press2", 106.0, 124.0, 30.0)):
    bed(nm, "murmur", a, b, -40, [[a, 0], [b, 0]], src_start=s, fade_in=0.1, fade_out=0.1, eq={"lp": 3500, "hp": 150})
    bed(nm + "_charge", "charge", a, b, -50, [[a, 0], [b, 0]], src_start=1.0, fade_in=0.3, fade_out=0.1, eq={"hp": 2000})
# losers: the bus stop, overcast
bed("busstop", "busstop", 97.0, 106.0, -22, [[97, 0], [106, 0]], src_start=10.0, fade_in=0.1, fade_out=0.1)
# news studio 124-133 + the warning 331-340: a studio room
bed("studio1", "room2", 124.0, 133.0, -42, [[124, 0], [133, 0]], src_start=50.0, fade_in=0.1, fade_out=0.1)
# ---- casino: outside at night (arrive), the floor (slots .. banned), the security office (photos)
bed("arrive_city", "street", 133.0, 142.0, -40, [[133, 0], [142, 0]], src_start=330.0, fade_in=0.15, fade_out=0.1, eq={"lp": 3000})
bed("arrive_casino", "casino", 133.0, 142.0, -40, [[133, -6], [138, -2], [141.8, 0]], src_start=60.0, fade_in=0.15, fade_out=0.1, eq={"lp": 900})
bed("casino", "casino", 142.0, 196.0, -32, [[142, 0], [160, 0], [160.2, -5], [168.8, -5], [169, 0], [186, 0], [196, -3]], src_start=5.0, fade_in=0.05, fade_out=0.1)
bed("casino_1913", "casino", 160.0, 169.0, -38, [[160, 0], [169, 0]], src_start=90.0, fade_in=0.05, fade_out=0.05, eq={"lp": 2200, "hp": 250}, width=0.4)
bed("photos", "room2", 196.0, 205.0, -40, [[196, 0], [205, 0]], src_start=30.0, fade_in=0.1, fade_out=0.15)
bed("photos_casino", "casino", 196.0, 205.0, -44, [[196, 0], [205, 0]], src_start=40.0, fade_in=0.1, fade_out=0.15, eq={"lp": 500})
# ---- the storm 205-241 (street + the ranger's forest)
bed("storm_wind", "stormwind", 205.0, 241.0, -32, [[205, -12], [209, -5], [213.5, 0], [240, 0]], src_start=10.0, fade_in=1.0, fade_out=0.15)
bed("storm_rain", "rain", 209.0, 241.0, -31, [[209, -24], [212, -12], [214, 0], [240, 0]], src_start=5.0, fade_in=2.0, fade_out=0.15)
bed("storm_street", "street", 205.0, 214.0, -38, [[205, 0], [210, -6], [214, -14]], src_start=400.0, fade_in=0.3, fade_out=0.3, eq={"hp": 100})
# ---- the lucky-charm act: stadium (241, 268), plane (250), ship (259)
bed("stadium", "stadium", 241.0, 250.0, -28, [[241, 0], [250, 0]], src_start=30.0, fade_in=0.05, fade_out=0.1)
bed("cabin", "cabin", 250.0, 259.0, -33, [[250, 0], [259, 0]], src_start=56.7, fade_in=0.05, fade_out=0.1, eq={"lp": 5000})
bed("cabin_rumble", "quake", 250.0, 259.0, -37, [[250, 0], [259, 0]], src_start=4.0, fade_in=0.2, fade_out=0.1, eq={"lp": 160})
bed("ship", "ship", 259.0, 268.0, -33, [[259, 0], [268, 0]], src_start=20.0, fade_in=0.05, fade_out=0.1)
bed("ship_gulls", "gulls", 259.0, 268.0, -40, [[259, 0], [268, 0]], src_start=10.0, fade_in=0.3, fade_out=0.1, eq={"hp": 500})
bed("away", "stadium", 268.0, 277.0, -38, [[268, 0], [277, -3]], src_start=40.0, fade_in=0.05, fade_out=0.1, eq={"lp": 2500})
# ---- the cost act 277-367
bed("flood_street", "street", 277.0, 286.0, -40, [[277, 0], [286, 0]], src_start=60.0, fade_in=0.1, fade_out=0.1, eq={"hp": 120})
bed("flood_pump", "pump", 277.0, 286.0, -39, [[277, 0], [286, 0]], src_start=20.0, fade_in=0.2, fade_out=0.1, eq={"hp": 200})
bed("flood_slosh", "slosh", 277.0, 286.0, -38, [[277, 0], [286, 0]], src_start=0.2, fade_in=0.2, fade_out=0.1)
bed("office2", "office", 286.0, 304.0, -38, [[286, 0], [304, 0]], src_start=60.0, fade_in=0.1, fade_out=0.1)
bed("moving_street", "street", 304.0, 313.0, -38, [[304, 0], [313, 0]], src_start=300.0, fade_in=0.1, fade_out=0.1)
bed("moving_truck", "truck", 304.0, 313.0, -37, [[304, 0], [305.5, 0], [309, -8], [313, -14]], src_start=2.0, fade_in=0.1, fade_out=0.1, eq={"hp": 50})
bed("shelter", "murmur", 313.0, 331.0, -38, [[313, 0], [331, 0]], src_start=40.0, fade_in=0.1, fade_out=0.1, eq={"lp": 4000})
bed("studio2", "room2", 331.0, 336.0, -42, [[331, 0], [336, 0]], src_start=10.0, fade_in=0.1, fade_out=0.1)
bed("tvhome", "room", 336.0, 340.0, -43, [[336, 0], [340, 0]], src_start=60.0, fade_in=0.1, fade_out=0.1)
bed("billion_wind", "wind", 340.0, 349.0, -36, [[340, 0], [349, 0]], src_start=30.0, fade_in=0.2, fade_out=0.1, eq={"hp": 80, "lp": 4000})
bed("billion_town", "street", 340.0, 349.0, -43, [[340, 0], [349, 0]], src_start=150.0, fade_in=0.2, fade_out=0.1, eq={"lp": 1200})
bed("signs", "protest", 349.0, 358.0, -42, [[349, 0], [358, 0]], src_start=10.0, fade_in=0.1, fade_out=0.15, eq={"lp": 2500, "hp": 150})
bed("signs_eve", "dusk", 349.0, 358.0, -42, [[349, 0], [358, 0]], src_start=30.0, fade_in=0.1, fade_out=0.1)
bed("dusk", "dusk", 358.0, 367.0, -37, [[358, 0], [366, 0], [367, -6]], src_start=120.0, fade_in=0.1, fade_out=0.3)
# ---- the island 367-466 (fades to near-silence 466.0), then back after the tick
bed("eye_storm", "tstorm", 367.0, 376.0, -31, [[367, 0], [376, 0]], src_start=120.0, fade_in=0.4, fade_out=0.1)
bed("eye_howl", "howl", 367.0, 376.0, -32, [[367, 0], [376, 0]], src_start=0.0, fade_in=0.4, fade_out=0.1, eq={"hp": 100})
bed("ring_wall", "tstorm", 376.0, 385.0, -38, [[376, 0], [385, 0]], src_start=200.0, fade_in=0.1, fade_out=0.1, eq={"lp": 1200})
bed("waves_day", "waves", 376.0, 403.0, -33, [[376, 0], [403, 0]], src_start=10.0, fade_in=0.1, fade_out=0.15)
bed("strike_rain", "tstorm", 394.0, 403.0, -40, [[394, 0], [403, 0]], src_start=60.0, fade_in=0.2, fade_out=0.15, eq={"lp": 2500})
bed("night_crickets", "crickets", 403.0, 412.0, -38, [[403, 0], [412, 0]], src_start=5.0, fade_in=0.1, fade_out=0.1, eq={"hp": 1500})
bed("night_waves", "waves", 403.0, 412.0, -38, [[403, 0], [412, 0]], src_start=80.0, fade_in=0.1, fade_out=0.1, eq={"lp": 2500})
bed("space_rumble", "quake", 412.0, 430.0, -37, [[412, -2], [420, 0], [424, 3], [426, 3], [430, -6]], src_start=2.0, fade_in=0.2, fade_out=0.1, eq={"lp": 300})
bed("sunset_waves", "surf", 430.0, 466.0, -34, [[430, 0], [457, 0], [462, -6], [465.4, -20], [466.0, -40]], src_start=40.0, fade_in=0.1, fade_out=0.6)
bed("sunset_gulls", "gulls", 432.0, 448.0, -45, [[432, 0], [448, 0]], src_start=40.0, fade_in=3.0, fade_out=3.0, eq={"hp": 600, "lp": 6000}, width=0.8)
# after the coin lands: the sea comes back slowly; the gulls arrive as the sky clears (~480), out by the end card
bed("calm_sea", "waves", 467.6, 500.0, -34, [[467.6, -24], [470, -10], [475, -2], [486, 0], [495, -1], [498, -8], [500, -30]], src_start=100.0, fade_in=1.5, fade_out=2.0)
bed("calm_gulls", "wavesg", 478.0, 499.0, -38, [[478, -14], [482, -3], [488, 0], [495, -2], [499, -20]], src_start=60.0, fade_in=2.5, fade_out=2.0, eq={"hp": 300})

# =================================== effects ===================================
samples, place = {}, []
def S(name, key, **kw):
    d = {"file": F[key]}; d.update(kw); samples["fx." + name] = d
def P(name, at, gain_db=0.0, **kw):
    d = {"sample": "fx." + name, "at": at, "gain_db": gain_db}; d.update(kw); place.append(d)

# ---- HUD: the lucky-break ding (E6, the fifth of A minor) when "LUCKY BREAKS IN A ROW" increments at a beat start
S("ding", "ding", start=0.06, end=1.40, eq={"hp": 600}, fade_out=0.5, norm_peak_db=-21)
S("ding_dark", "ding", start=0.06, end=1.40, eq={"hp": 600, "lp": 3500}, fade_out=0.5, norm_peak_db=-25)
ROW = [16, 25, 34, 43, 52, 61, 70, 79, 106, 115, 124, 142, 151, 160, 169, 205, 214, 223, 241, 250, 268,
       277, 286, 295, 304, 313, 322, 331, 340, 367, 376, 385, 394, 403, 412, 421, 430]
BIGROW = {25, 106, 160, 169, 241, 250, 268}
for t in ROW:
    dark = t >= 277
    P("ding_dark" if dark else "ding", t + 0.03, (1.5 if t in BIGROW else 0.0) - (3.0 if t >= 367 else 0.0), pan=-0.55, align="attack")
# ---- the red counter: a low dull thud when "PEOPLE WHO LOST" starts to climb (t0 + 0.8); big jumps louder + a synth sub
S("thud", "boom", start=0.0, end=1.45, eq={"lp": 420, "hp": 30}, fade_out=0.6, norm_peak_db=-14)
LOST_BIG = [97, 106, 268, 322, 331, 340]
LOST_SMALL = [52, 115, 124, 142, 151, 160, 169, 214, 223, 241, 277, 286, 295, 304]
for t in LOST_BIG: P("thud", t + 0.8, 0.0, pan=-0.45, align="attack")
for t in LOST_SMALL: P("thud", t + 0.8, -8.0, pan=-0.45, align="attack")
# ---- fact cards: a soft glass whoosh as the card slides in (FACTS t0, alpha ramps over 0.5 s)
S("card_sw", "swoosh", start=0.0, end=0.95, eq={"hp": 400}, fade_out=0.3, norm_peak_db=-24)
S("card_gl", "sparkle", start=0.0, end=1.6, eq={"hp": 2500}, fade_out=0.8, norm_peak_db=-34)
for t in (81, 90, 116, 161, 188, 233, 260):   # 233 sits in the storm: +5 dB so it reads over the rain
    P("card_sw", t + 0.28, 5.0 if t == 233 else 0.0, pan=0.5, align="peak"); P("card_gl", t + 0.32, 4.0 if t == 233 else 0.0, pan=0.55, align="attack")
P("card_sw", 467.40, -16.0, pan=0.5, align="peak")      # the edge card: much softer, after the tick

# ---- TEASER 0-6.2: coins and fish raining, bolts, a close strike at 2.9, a riser into the cut at 6.15
S("t_coins", "pour", start=1.2, end=7.4, fade_in=0.3, fade_out=0.6, norm_peak_db=-22)
P("t_coins", 0.15, 0.0, pan=-0.25, align="start")
S("t_pay", "payout", start=0.3, end=3.8, fade_out=0.5, norm_peak_db=-25)
P("t_pay", 2.4, 0.0, pan=0.35, align="start")
S("t_thunder", "thunA", start=0.20, end=6.2, fade_out=1.5, norm_peak_db=-18)
P("t_thunder", 2.9, 0.0, pan=0.15, align="start")
S("dthunder", "dthun3", start=0.0, end=8.2, eq={"lp": 1500}, fade_out=2.0, norm_peak_db=-16)
P("dthunder", 0.95, -4.0, pan=-0.5, align="attack"); P("dthunder", 4.05, -2.0, pan=0.5, align="attack")
S("t_fish", "tsplash", start=0.15, end=1.6, fade_out=0.3, norm_peak_db=-20)
for t, p in ((1.6, -0.3), (3.7, 0.4), (5.1, -0.1)): P("t_fish", t, 0.0, pan=p, align="attack")
S("t_riser", "riserA", start=3.0, end=8.085, fade_in=0.3, fade_out=0.006, norm_peak_db=-17.5)
P("t_riser", 6.15 - (8.085 - 3.0), 0.0, align="start")

# ---- FLIP 7-16: the thumb flick 8.45, the coin rings in slow motion 8.5-13.5, caught heads-up at 13.5
S("flick", "flip5", start=0.10, end=1.05, mono=True, fade_out=0.4, norm_peak_db=-12)
P("flick", 8.45, 0.0, pan=0.1, align="attack")
S("airspin", "spin7", start=1.2, end=7.2, pitch=-7.0, eq={"hp": 400}, fade_in=0.4, fade_out=1.2, norm_peak_db=-24)
P("airspin", 8.6, 0.0, pan=0.0, align="start")
S("catch", "catch", start=0.0, end=0.6, mono=True, fade_out=0.25, norm_peak_db=-13)
P("catch", 13.50, 0.0, pan=0.0, align="attack")

# ---- TOAST 16-25: slips at 17.7, lands butter side up at 18.16
S("toast_sw", "swoosh", start=0.0, end=0.95, pitch=4.0, eq={"hp": 900}, fade_out=0.2, norm_peak_db=-24)
P("toast_sw", 17.95, 0.0, pan=0.2, align="peak")
S("toast_land", "thump", start=0.0, end=0.7, pitch=7.0, mono=True, eq={"hp": 150}, fade_out=0.2, norm_peak_db=-15)
P("toast_land", 18.16, 0.0, pan=0.2, align="attack")

# ---- GREENS 25-34: signals click amber->green (27.5/27.8, 28.4/28.7, 29.3/29.6), a rev as the car pulls away
S("relay", "relay", mono=True, eq={"hp": 400}, fade_out=0.05, norm_peak_db=-24)
for i in range(3): P("relay", 27.8 + 0.9 * i, -2.0 * i, pan=0.3 + 0.15 * i, align="attack")
# ---- TWENTY 34-43: the bill picked up at 39.0
S("bill", "bill", start=0.1, end=1.3, mono=True, fade_out=0.2, norm_peak_db=-18)
P("bill", 39.0, 0.0, pan=0.25, align="attack")
# ---- CAFE 43-52: the barista's bell 43.9-49 (shaking ~4 Hz), confetti pops at 43.9, the room cheers
S("hbell", "hbell", start=0.95, end=4.4, fade_in=0.01, fade_out=0.8, norm_peak_db=-18)
P("hbell", 43.90, 0.0, pan=-0.2, align="attack")
S("pop1", "pop1", mono=True, fade_out=0.2, norm_peak_db=-12)
S("pop2", "pop2", start=0.0, end=1.2, mono=True, fade_out=0.4, norm_peak_db=-14)
P("pop1", 43.95, 0.0, pan=0.35, align="attack"); P("pop2", 44.20, 0.0, pan=-0.4, align="attack")
S("cafe_cheer", "cheer_s", start=0.5, end=7.5, fade_in=0.2, fade_out=2.0, norm_peak_db=-19)
P("cafe_cheer", 44.1, 0.0, pan=0.0, align="start")
# ---- RIVAL 52-61: the car won't start (twice)
S("nostart", "nostart", start=0.35, end=3.95, eq={"hp": 60}, fade_out=0.6, norm_peak_db=-15)
P("nostart", 53.2, 0.0, pan=-0.3, align="start")
S("crank", "crank", start=0.09, end=1.9, eq={"hp": 60}, fade_out=0.3, norm_peak_db=-17)
P("crank", 57.6, 0.0, pan=-0.3, align="start")
# ---- HIRED 61-70: the handshake at 62.1, the office claps
S("shake", "shake", start=0.45, end=1.5, mono=True, fade_out=0.3, norm_peak_db=-17)
P("shake", 62.10, 0.0, pan=0.0, align="attack")
S("office_clap", "clap_s", start=0.0, end=3.7, fade_in=0.05, fade_out=1.0, norm_peak_db=-17)
P("office_clap", 62.3, 0.0, align="start")
S("office_clap2", "clap_m", start=2.0, end=9.0, fade_in=0.4, fade_out=2.5, norm_peak_db=-21)
P("office_clap2", 64.5, 0.0, align="start")
# ---- SCRATCH 70-79: scratching with a coin 70.4-75.3, the win at 75.3 (confetti)
S("scratch", "scratch", start=0.3, end=3.45, mono=True, eq={"hp": 300}, fade_in=0.05, fade_out=0.3, norm_peak_db=-17)
P("scratch", 70.45, 0.0, pan=0.1, align="start"); P("scratch", 72.55, -1.0, pan=0.1, align="start")
P("pop1", 75.35, -2.0, pan=-0.3, align="attack"); P("pop2", 75.55, -3.0, pan=0.3, align="attack")
# ---- POWERBALL 79-88: a ball drops on TV every 1.15 s from 80.0, the last one 85.75; the hero cheers 86.75
S("ball", "pong", start=0.90, end=1.30, mono=True, eq={"hp": 400, "lp": 5000}, fade_out=0.1, norm_peak_db=-21)
for i in range(6): P("ball", 80.0 + 1.15 * i, 0.0, pan=0.35, align="attack")
S("tv_cheer", "cheer1", start=1.0, end=6.0, eq={"hp": 350, "lp": 4500}, fade_in=0.3, fade_out=1.5, norm_peak_db=-22)
P("tv_cheer", 86.0, 0.0, pan=0.35, align="start")
# ---- camera flashes at the press events (cheque 88-97, again 106-115, ginther 115-124), a few, varied
S("flash1", "flash1", mono=True, fade_out=0.1, norm_peak_db=-19)
S("flash2", "flash2", mono=True, fade_out=0.1, norm_peak_db=-21)
S("flash3", "flash3", start=0.80, end=1.6, mono=True, fade_out=0.2, norm_peak_db=-20)
FL = [(88.6, 1, -0.4), (89.5, 2, 0.4), (91.2, 3, -0.2), (92.4, 1, 0.5), (94.0, 2, -0.5), (95.3, 1, 0.3),
      (106.2, 3, 0.4), (107.0, 1, -0.4), (108.1, 2, 0.2), (109.1, 1, -0.3), (109.6, 3, 0.5), (111.0, 2, -0.2),
      (112.1, 1, 0.4), (112.7, 2, -0.5), (114.0, 1, 0.2), (115.4, 3, -0.3), (117.2, 1, 0.4), (119.5, 2, -0.4)]
for t, k, p in FL: P(f"flash{k}", t, -1.0 if t > 106 else 0.0, pan=p, align="attack")
S("applause", "clap_m", start=0.5, end=8.0, fade_in=0.3, fade_out=2.5, norm_peak_db=-20)
P("applause", 88.3, 0.0, align="start"); P("applause", 115.4, -2.0, align="start")
P("pop1", 115.30, -4.0, pan=0.4, align="attack")
# ---- LOSERS 97-106: tickets torn all over the bus stop
for i, (t, k, p) in enumerate([(97.6, 2, -0.3), (98.9, 4, 0.4), (99.8, 3, -0.5), (101.0, 1, 0.2), (102.3, 4, -0.2),
                               (103.1, 2, 0.5), (104.2, 3, -0.4), (105.0, 4, 0.3)]):
    if f"fx.tear{k}" not in samples:
        S(f"tear{k}", f"tear{k}", start={1: 0.25, 2: 0.0, 3: 0.0, 4: 0.0}[k], end={1: 2.4, 2: 1.1, 3: 1.2, 4: 0.85}[k], fade_out=0.15, norm_peak_db=-18)
    P(f"tear{k}", t, -1.5 * (i % 2), pan=p, align="attack")
# ---- NEWS 124-133: the studio sting
S("news", "news", start=0.3, end=8.3, fade_in=0.01, fade_out=2.0, norm_peak_db=-14)
P("news", 124.05, 0.0, align="start")
# ---- ARRIVE 133-142: a car hisses by on the wet street
S("wetcar", "wetcar", eq={"hp": 80}, fade_in=0.3, fade_out=0.8, norm_peak_db=-21)
P("wetcar", 134.0, 0.0, pan=0.5, align="start")
# ---- SLOTS 142-151: three machines pay out at 142.9, 144.0, 145.1; he cheers ~144.7
S("payout", "payout", start=0.30, end=3.8, fade_out=0.6, norm_peak_db=-15)
S("pour", "pour", start=1.3, end=7.0, fade_in=0.05, fade_out=1.5, norm_peak_db=-19)
S("slotjin", "slotjin", start=0.30, end=4.4, eq={"hp": 300}, fade_out=1.2, norm_peak_db=-23)
P("slotjin", 142.85, 0.0, pan=0.4, align="start")
for i, (t, p) in enumerate(((142.9, 0.35), (144.0, 0.0), (145.1, -0.35))):
    P("payout", t, -1.0 * i, pan=p, align="attack")
P("pour", 144.4, 0.0, pan=0.1, align="start")
S("cheer_s", "cheer_s", start=0.5, end=6.0, fade_in=0.2, fade_out=2.0, norm_peak_db=-21)
P("cheer_s", 144.8, 0.0, align="start")
# ---- ROULETTE 151-160: the ball runs the track (a marble in a ceramic bowl), drops into 17 at 154.6, the table roars
S("ball_run", "marble", start=0.30, end=4.0, eq={"hp": 250}, fade_in=0.4, fade_out=0.05, norm_peak_db=-19)
P("ball_run", 154.6 - 3.7, 0.0, pan=-0.15, align="start")
S("pocket", "chip", start=0.0, end=0.55, mono=True, fade_out=0.15, norm_peak_db=-15)
P("pocket", 154.60, 0.0, pan=-0.15, align="attack")
S("roar", "cheer2", start=0.6, end=8.0, fade_in=0.08, fade_out=2.5, norm_peak_db=-14)
P("roar", 154.75, 0.0, align="start")
# ---- MONTECARLO 160-169: 1913, the wheel turns again (thin, old)
S("ball_old", "marble", start=4.6, end=11.0, eq={"hp": 400, "lp": 3500}, fade_in=0.5, fade_out=1.5, norm_peak_db=-24)
P("ball_old", 161.5, 0.0, pan=-0.2, align="start")
# ---- FORTY 169-178: the table erupts, chips and confetti in the air
S("roar40", "cheer1", start=0.3, end=9.0, fade_in=0.05, fade_out=2.0, norm_peak_db=-14)
P("roar40", 169.05, 0.0, align="start")
S("chips", "chips", start=0.4, end=3.0, fade_out=0.4, norm_peak_db=-18)
P("chips", 169.4, 0.0, pan=0.3, align="start"); P("chips", 171.9, -3.0, pan=-0.3, align="start")
P("pop2", 169.2, -2.0, pan=-0.4, align="attack"); P("pop1", 169.6, -2.0, pan=0.45, align="attack")
# ---- PITBOSS / BANNED / PHOTOS: the earpiece and the guards' radios
S("walkie", "walkie", mono=True, eq={"hp": 500, "lp": 5000}, fade_out=0.1, norm_peak_db=-24)
S("squelch", "squelch", mono=True, eq={"hp": 500, "lp": 5000}, fade_out=0.2, norm_peak_db=-24)
for t, k, p in ((179.2, "walkie", 0.4), (183.8, "squelch", 0.4), (188.6, "squelch", -0.3), (192.5, "walkie", 0.3), (199.5, "squelch", -0.2), (202.8, "walkie", 0.2)):
    P(k, t, 0.0, pan=p, align="attack")
# ---- STORM 205-241: distant thunder rolling in, then the strikes (tree 226.65, car 229.6, the ranger 235.6)
P("dthunder", 207.2, -4.0, pan=0.5, align="attack"); P("dthunder", 211.4, -2.0, pan=-0.3, align="attack")
S("dthunder4", "dthun4", start=0.0, end=12.0, eq={"lp": 1200}, fade_out=3.0, norm_peak_db=-15)
P("dthunder4", 216.5, 0.0, pan=0.4, align="attack"); P("dthunder4", 237.5, -3.0, pan=-0.4, align="attack")
S("strikeA", "thunA", start=0.20, end=8.0, fade_out=2.0, norm_peak_db=-12)
S("strikeB", "thunB", start=0.40, end=9.0, fade_out=2.5, norm_peak_db=-13)
S("strikeC", "thunC", start=0.62, end=8.0, fade_out=2.0, norm_peak_db=-13)
S("branch", "branch", mono=True, fade_out=0.1, norm_peak_db=-12)
S("sparks", "sparks", start=0.5, end=3.4, eq={"hp": 1500}, fade_out=0.8, norm_peak_db=-22)
P("strikeA", 226.65, 0.0, pan=0.45, align="start"); P("branch", 226.75, 0.0, pan=0.5, align="attack"); P("sparks", 226.8, 0.0, pan=0.5, align="start")
P("strikeB", 229.60, -1.0, pan=0.25, align="start")
S("alarm", "alarm", start=1.5, end=8.5, eq={"hp": 400, "lp": 6000}, fade_in=0.02, fade_out=1.5, norm_peak_db=-21)
P("alarm", 230.1, 0.0, pan=0.35, align="start")
P("strikeC", 235.60, 0.0, pan=-0.1, align="start"); P("sparks", 235.75, -2.0, pan=0.0, align="start")
# ---- STADIUM 241: the home end erupts at 242.1
S("goal", "goal", start=0.55, end=9.5, fade_in=0.05, fade_out=2.5, norm_peak_db=-14)
P("goal", 242.10, 0.0, align="attack")
# ---- PLANE 250-259: the seat-belt chime, lightning flashing outside (251.7, 253.0, 255.0, 256.3, 258.3) heard through the hull
S("chime", "chime", start=0.45, end=3.0, fade_out=1.0, norm_peak_db=-22)
P("chime", 250.6, 0.0, pan=-0.2, align="attack")
S("hull_thunder", "dthun3", start=0.0, end=6.0, eq={"lp": 380}, fade_out=1.5, norm_peak_db=-14)
P("hull_thunder", 253.2, 0.0, pan=0.4, align="attack"); P("hull_thunder", 256.5, -3.0, pan=0.4, align="attack")
# ---- SHIP 259-268: a far ship horn
S("horn", "horn", start=0.0, end=5.5, eq={"lp": 1800}, fade_out=1.5, norm_peak_db=-22)
P("horn", 259.6, 0.0, pan=-0.4, align="start")
# ---- OTHERTEAM 268-277: the away end groans
S("groan", "groan", start=0.0, end=6.5, fade_in=0.05, fade_out=2.0, norm_peak_db=-17)
P("groan", 268.3, 0.0, align="start")
# ---- FLOOD 277-286: a neighbour bailing with a bucket
S("bucket", "bucket", start=2.0, end=6.5, fade_in=0.05, fade_out=0.8, norm_peak_db=-22)
P("bucket", 278.6, 0.0, pan=0.45, align="start"); P("bucket", 282.4, -2.0, pan=0.45, align="start")
# ---- LAIDOFF 286-295: the friend packs his box; the promotion letter
S("box", "box", mono=True, fade_out=0.2, norm_peak_db=-21)
P("box", 287.3, 0.0, pan=-0.4, align="attack"); P("box", 289.6, -2.0, pan=-0.4, align="attack")
S("letter", "bill", start=0.6, end=1.35, mono=True, fade_out=0.15, norm_peak_db=-21)
P("letter", 290.6, 0.0, pan=0.2, align="attack")
# ---- MOVING 304-313: the truck pulls away from 305.5
S("truckgo", "truckgo", start=2.9, end=12.0, eq={"hp": 50}, fade_in=0.3, fade_out=3.0, norm_peak_db=-19)
P("truckgo", 305.3, 0.0, pan=0.5, align="start")
# ---- GIVEAWAY 313-322: the envelope handed over (~315.2)
S("envelope", "envelope", mono=True, eq={"hp": 200}, fade_out=0.2, norm_peak_db=-31)
P("envelope", 315.0, 0.0, pan=0.1, align="start")
# ---- COMESBACK 322-331: the winning ticket pulled out (322.6), a gasp, the money doubles 325.8-329.6
S("gasp", "gasp", start=0.0, end=3.5, fade_out=1.0, norm_peak_db=-21)
P("gasp", 322.7, 0.0, align="start")
S("register", "register", start=0.0, end=2.0, mono=True, fade_out=0.5, norm_peak_db=-21)
P("register", 325.8, 0.0, pan=0.25, align="attack")
S("cash", "cash", start=0.0, end=4.2, fade_out=0.8, norm_peak_db=-23)
P("cash", 326.3, 0.0, pan=0.2, align="start")
# ---- TVWARNING 331-340: the studio warning (thin news sting, filtered: it is on the panel, not a celebration)
S("news_dark", "news", start=0.3, end=6.0, eq={"lp": 2200, "hp": 200}, fade_in=0.01, fade_out=2.0, norm_peak_db=-20)
P("news_dark", 331.05, 0.0, align="start")
# ---- NIGHT / ISLAND events
S("far_thunder", "dthun4", start=0.0, end=9.0, eq={"lp": 700}, fade_out=2.5, norm_peak_db=-17)
for i, t in enumerate((367.9, 369.4, 371.1, 372.5, 374.2)): P("far_thunder", t, -2.0 * (i % 2), pan=(-0.5, 0.4, -0.2, 0.5, -0.4)[i], align="attack")
for i, t in enumerate((377.5, 380.12, 383.4)): P("far_thunder", t, -3.0 - 2.0 * (i % 2), pan=(0.5, -0.5, 0.3)[i], align="attack")
# fish: coming to him in a stream (385-394), and leaping in the strike beat
S("fish1", "splash", start=0.35, end=1.4, mono=True, fade_out=0.3, norm_peak_db=-19)
S("fish2", "tsplash", start=0.15, end=1.0, mono=True, fade_out=0.2, norm_peak_db=-21)
S("fish3", "eel", start=0.0, end=0.75, mono=True, fade_out=0.2, norm_peak_db=-21)
for i, t in enumerate((385.8, 387.0, 388.1, 389.5, 390.6, 391.9, 393.0)):
    P(("fish1", "fish2", "fish3")[i % 3], t, -1.0 * (i % 2), pan=(-0.3, 0.2, 0.4, -0.1, 0.3, -0.4, 0.1)[i], align="attack")
for i, t in enumerate((396.6, 399.8, 402.2)): P(("fish2", "fish3", "fish2")[i], t, -3.0, pan=(0.4, -0.3, 0.2)[i], align="attack")
# close strikes on the water a few metres away: 395.3, 398.1, 401.3
S("wstrike", "thunB", start=0.40, end=6.5, fade_out=2.0, norm_peak_db=-14)
S("wstrike2", "thunA", start=0.20, end=6.0, fade_out=2.0, norm_peak_db=-15)
S("hiss", "splash", start=0.35, end=2.6, eq={"hp": 1200}, fade_out=1.0, norm_peak_db=-20)
for i, t in enumerate((395.3, 398.1, 401.3)):
    P("wstrike" if i % 2 == 0 else "wstrike2", t, -1.0 * i, pan=(0.35, -0.3, 0.45)[i], align="start"); P("hiss", t + 0.05, 0.0, pan=(0.35, -0.3, 0.45)[i], align="attack")
# night: shooting stars missing (soft, high whooshes)
S("star", "whoosh1", pitch=5.0, eq={"hp": 700}, fade_out=0.3, norm_peak_db=-26)
for t, p in ((405.0, -0.4), (408.2, 0.5), (410.4, -0.1)): P("star", t, 0.0, pan=p, align="peak")
# the asteroid swerves past Earth (closest 425.5)
S("swerve", "whoosh2", pitch=-6.0, eq={"lp": 2500}, fade_out=0.6, norm_peak_db=-14)
P("swerve", 425.5, 0.0, pan=0.0, align="peak")
# pocket 439-448: the old coin comes out of the pocket (~441.5)
S("pocket_coin", "cfoley", start=0.05, end=0.75, mono=True, eq={"hp": 300}, fade_out=0.25, norm_peak_db=-22)
P("pocket_coin", 441.6, 6.0, pan=0.1, align="attack")
# flipagain: the flick at 451.0, then the coin hangs in slow motion (the real spin slowed an octave, glassy)
P("flick", 451.00, -3.0, pan=0.0, align="attack")
S("slowspin", "spin4", start=0.3, end=7.45, pitch=-12.0, eq={"hp": 180}, fade_in=0.8, fade_out=0.3, norm_peak_db=-22,
  env=[[0, -6], [5, 0], [10.5, 0], [14.2, -30]])   # pitched an octave down = twice as long: 451.6 -> 465.9
P("slowspin", 451.6, 0.0, pan=0.0, align="start")
# THE EDGE 466.7: near-silence 466.0-466.7, then one tiny clean tick (the first contact of a real coin drop, high-passed)
S("edge_tick", "cdrop", start=0.035, end=0.115, mono=True, eq={"hp": 900}, fade_in=0.001, fade_out=0.05, norm_peak_db=-25)
P("edge_tick", 466.70, 0.0, pan=0.0, align="attack")
S("edge_sand", "sand", start=0.0, end=0.5, mono=True, eq={"hp": 1500}, fade_out=0.3, norm_peak_db=-36)
P("edge_sand", 466.72, 0.0, pan=0.0, align="start")
# the end card: one soft singing-bowl note (A4, the tonic, tuned +0.38 st) under the music's last note, ringing out to ~507
S("endbowl", "bowl", start=0.85, end=14.4, pitch=0.38, eq={"hp": 150}, fade_in=0.01, fade_out=3.5, norm_peak_db=-22, env=[[0, 0], [6, 0], [10, 3]])
P("endbowl", 496.30, 0.0, pan=0.0, align="attack")
# the end card: on "could it?" (501.0) the faintest coin tick again
P("edge_tick", 501.0, -9.0, pan=0.0, align="attack")

json.dump({"_doc": "ambience beds (amb bus): targets are pre-master LUFS of each bed at auto 0 dB; see tools/design.py", "ambience": amb},
          open(os.path.join(A, "design", "ambience.json"), "w"), indent=1)
json.dump({"_doc": "point effects (sfx bus), see tools/design.py", "samples": samples, "place": place},
          open(os.path.join(A, "design", "sfx.json"), "w"), indent=1)
print(len(amb), "beds,", len(samples), "samples,", len(place), "placements")

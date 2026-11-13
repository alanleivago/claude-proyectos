"""What happens on screen in nvidia-huang (src/shots.js SHOT_LIST + the set files' action times) -> events-all.json
(t on the video clock, what). One clock (STORY_T = identity). Times read from set-stage / set-news / set-hq / set-board /
set-trade (resolved key arrays and constants) and checked on frames of renders/nvidia-huang_silent_v1.mp4 (rev 4 re-checked on _silent_v4.mp4: second edition stops 20.80,
ALLEGED frame 672 = 22.40, doors 23.20, agents peek 23.80 / 24.20, crane to the TV 24.80-24.97, whip to the president 38.03-38.23,
whip up the crawl 44.83-45.03, the meme explosion over the frame from 62.43): glass bay
0.57-0.63, spot 5.12, shine 8.33-8.40, leaf 10.57-10.63, stamp hits on frame 459 (15.30), sign flicker 16.30-16.43,
pin 17.14, flip 26.87-26.93, SEND 32.03 + buzz arcs 32.13, blinds 33.02-33.5, folder frame 1028 (34.27), mug 37.07-37.17,
+1 46.00, ski landing 50.57-50.60, pane 51.17, page in the tray 57.30, FILED 57.80, bucket 60.42, jacket back 62.40."""
import json, re
E = []
def ev(t, what): E.append({'t': round(t, 3), 'what': what})
src = open('../src/shots.js', encoding='utf-8').read()
ROWS = [(float(t), s) for t, s in re.findall(r'\["\w+", ([\d.]+), \'(\w+)\'', src)]
for i, (t, st) in enumerate(ROWS[1:], 1):
    if st != ROWS[i - 1][1]: ev(t - 0.06, 'whoosh: whip')   # place changes: whip pans (11.12 27.28 33.46 35.82 55.58 58.46)
for t in [21.15, 24.88, 37.20, 40.62, 46.68]: ev(t, 'whoosh soft: camera move')   # rev 4 camera: truck to the case, crane to the TV, pull-backs
ev(38.08, 'whoosh: whip high to the TV'); ev(44.92, 'whoosh: whip up the crawl')

# ---- A keynote stage (0-11.12): fly-in through the arena glass, chip on the lift, LED wall modes, spot, sheet, shine, years, OCT leaf
ev(0.02, 'CROWD CHEER: arena swell'); ev(0.60, 'BIG WHOOSH: fly-in through the glass')
ev(0.42, 'hydraulic lifter rise: chip'); ev(0.60, 'magic shimmer: chip glows'); ev(1.24, 'metal clunk: lift top')
ev(0.80, 'cloth swish: arms spread')
ev(1.72, 'led blip: screens to the calendar'); ev(1.73, 'cloth swish: point')
for t in [1.78, 1.95]: ev(t, 'pop small: calendar cell')
ev(3.76, 'cloth swish: jump'); ev(4.00, 'landing thud small: jump')
ev(3.74, 'led blip: screens to AI BOOM'); ev(3.75, 'CROWD CHEER: AI boom')
for t in [3.86, 4.08]: ev(t, 'led beep small: bars grow')
for t in [3.97, 4.20]: ev(t, 'pop small: chip icon')
ev(4.56, 'cloth rustle: hand into the jacket'); ev(4.84, 'paper unfold: resignation sheet'); ev(5.02, 'paper handle: sheet raised')
ev(5.12, 'SPOTLIGHT CLUNK: spot narrows'); ev(5.13, 'screen off: wall dims'); ev(5.22, 'crowd ooh: hush')
ev(5.86, 'led blip: screen 1993'); ev(5.87, 'light switch: lights widen'); ev(5.95, 'pop: 1993 chip')
ev(5.90, 'paper handle: sheet tucked away')
ev(7.32, 'leather rustle: lapel grab')
ev(8.06, 'swish: shine streak'); ev(8.36, 'SPARKLE TING: jacket shine')
ev(8.40, 'crowd clapping: on the beat')
for n in range(0, 8, 2): ev(8.40 + 0.17 * n, 'led blip small: year flick')   # every 2nd flick
ev(9.66, 'led blip: screens to OCT'); ev(9.78, 'cloth swish: point')
ev(10.40, 'cloth swish: shrug'); ev(10.42, 'CALENDAR TEAR: OCT leaf'); ev(10.64, 'paper flutter: leaf flies')

# ---- C newsroom (11.12-27.28): press runs (bed), first edition, the NO RELATION stamp, sign, pin, cash, second edition, TV, flip
ev(11.62, 'metal clunk small: lever grab'); ev(11.86, 'LEVER CLUNK: shoved up')
ev(12.55, 'paper slide: first edition out'); ev(13.17, 'paper handle: lands on the desk')
ev(14.98, 'metal clunk small: stamp lever yanked'); ev(15.22, 'swish: stamp drops')
ev(15.29, 'STAMP SLAM: NO RELATION'); ev(15.30, 'ink splat'); ev(15.31, 'metal clunk: lever slams')
ev(15.58, 'metal clunk small: lever returns')
ev(16.28, 'SIGN FLICKER ON: MEGASPEED')
ev(17.02, 'swish small: pin drops'); ev(17.14, 'PIN TAP: Singapore'); ev(17.19, 'pop small: SINGAPORE tag')
ev(18.25, 'CASH RAIN: bundles fall'); ev(18.33, 'gasp: reporters')
for t in [18.71, 18.84, 18.97, 19.03]: ev(t, 'cash bundle thud')
ev(20.80, 'PRESS DEAD STOP: clunk')   # rev 4: the second edition stops at 20.80
# rev 4 spy vignette (ILLUSTRATION case): ALLEGED stamp on the memo, the ministry doors swing open, the agents peek
ev(22.39, 'ALLEGED STAMP: memo'); ev(23.18, 'DOORS SWING OPEN: ministry'); ev(23.80, 'cloth swish small: agent peeks'); ev(24.20, 'cloth swish small: agent peeks')
ev(24.98, 'TV SWITCH: to the podium'); ev(25.00, 'tv static burst')
ev(25.66, 'card slide: A SMEAR')
ev(26.84, 'flip card clack: 0'); ev(26.90, 'flip card clack: 0')

# ---- B HQ (27.28-33.46): the email typed letter by letter, SEND, every phone buzzes, the floor turns, chair, blinds
for t in [29.592, 29.685, 29.777, 29.869, 29.962, 30.054]: ev(t, 'key press: To field')
BODY = [30.39, 30.45, 30.503, 30.548, 30.593, 30.638, 30.689, 30.747, 30.805, 30.864, 30.922, 30.980, 31.038, 31.096, 31.155, 31.213, 31.271,
        31.32, 31.36, 31.40, 31.44, 31.48, 31.52, 31.566, 31.618, 31.670, 31.722, 31.774]   # letter times (set-hq L147)
for t in BODY: ev(t, 'key press: email')
ev(31.88, 'cloth swish small: finger wind-up'); ev(32.03, 'SEND KEY: enter'); ev(32.06, 'chair creak: sinks back'); ev(32.18, 'swish: email sent')
for t in [32.12, 32.14, 32.16, 32.58, 32.60, 32.62]: ev(t, 'PHONE BUZZ: all phones')
ev(32.22, 'crowd gasp small: staff jolt')
ev(32.30, 'cloth swish small: staff turn')
ev(32.48, 'CHAIR SWIVEL: he turns round'); ev(32.71, 'cloth swish small: reach for the cord'); ev(32.84, 'cord tap: grabs the cord')
ev(33.02, 'BLINDS RATTLE DOWN')

# ---- D boardroom (33.46-35.82): the folder slap
ev(33.96, 'cloth swish: folder raised'); ev(34.14, 'whoosh small: folder swings down')
ev(34.27, 'FOLDER SLAM: investigation'); ev(34.28, 'glasses rattle: jump'); ev(34.29, 'paper flutter: sheets lift')
ev(34.31, 'gasp: board jolts'); ev(34.48, 'cup clink: lands'); ev(34.57, 'glass clink: glasses land'); ev(34.86, 'paper handle: sheets settle')
ev(34.90, 'cloth rustle: arms crossed')

# ---- E trading floor (35.82-55.58)
ev(36.72, 'gasp: Cole'); ev(36.80, 'crowd gasp: traders')
ev(37.15, 'MUG CLATTER: hits the floor'); ev(37.16, 'COFFEE SPLASH')
ev(37.24, 'TICKER ALERT BEEP: five'); ev(37.42, 'ticker beep: alert')
for t in [37.30, 37.62]: ev(t, 'led blip small: crash screens')
ev(37.50, 'cloth rustle: hands on head')
ev(39.06, 'card slide: FBI'); ev(39.10, 'cloth swish: all turn to the TV'); ev(39.40, 'cloth rustle: arms crossed')
ev(40.30, 'ticker beep: crawl WED'); ev(44.70, 'ticker beep: crawl THU')
ev(43.48, 'paper handle: org chart raised'); ev(44.12, 'marker writing: arrow draws'); ev(44.39, 'pop small: arrowhead')
ev(44.95, 'paper handle: card lowered')
for t in [45.10, 45.37, 45.65, 45.92, 46.20, 46.47, 46.75]: ev(t, 'footsteps carpet')
ev(45.92, 'FLIP COUNTER: +1'); ev(46.00, 'flip counter clack'); ev(46.03, 'ticker beep: +1')
ev(50.12, 'ski clack: grabs the skis'); ev(50.14, 'cloth swish: grab'); ev(50.32, 'cloth rustle: squat'); ev(50.38, 'cloth swish: jump')
ev(50.58, 'SKI LANDING: on the chart'); ev(50.60, 'SKI RUN: carving down'); ev(50.62, 'wind rush: the descent')
for t in [50.74, 50.88]: ev(t, 'ski clack small: bump')
ev(51.04, 'whoosh: takeoff from the lip'); ev(51.17, 'GLASS SHATTER: out of the window'); ev(51.22, 'gasp: Gus')
for t in [51.75, 51.98]: ev(t, 'glass tinkle small: shards land')
ev(50.91, 'cart rattle: through the door'); ev(52.02, 'cardboard knock: cutout wobbles'); ev(53.40, 'cardboard knock small: cutout wobbles')
for t in [52.15, 52.57, 52.98, 53.39, 53.80, 54.22, 54.63, 55.04, 55.46]: ev(t, 'footsteps carpet: Omar')


# ---- D boardroom later (55.58-58.46): the filing slides into the tray, FILED
ev(56.40, 'paper slide: the filing'); ev(56.90, 'paper flutter: page swoops'); ev(57.30, 'PAPER LAND: into the tray')
ev(57.40, 'cloth swish: she hops in'); ev(57.58, 'landing thud small: hop'); ev(57.56, 'cloth swish small: stamp raised')
ev(57.74, 'swish: stamp comes down'); ev(57.80, 'FILED STAMP SLAM'); ev(57.98, 'paper handle small: stamp lifts')

# ---- A' empty stage (58.46-62.80): flickers, mop, screens die, the spot finds the jacket, the janitor tries it on
ev(58.53, 'tv static burst: 1993 -> 2026'); ev(58.70, 'tv static small: flicker'); ev(59.47, 'tv static small: flicker')
for t in [58.79, 59.12, 59.44, 59.77, 60.10]: ev(t, 'mop stroke')
ev(60.20, 'cloth swish small: mop lifted'); ev(60.30, 'SCREENS OFF: crt collapse'); ev(60.42, 'BUCKET CLUNK')
ev(60.44, 'SPOTLIGHT CLUNK: finds the jacket'); ev(60.60, 'gasp small: janitor double-take')
for t in [60.66, 60.86]: ev(t, 'footsteps wood')
ev(60.92, 'LEATHER RUSTLE: jacket off the stand'); ev(60.94, 'hanger clack: off the stand')
ev(61.02, 'cloth swish: spin'); ev(61.12, 'LEATHER RUSTLE: jacket on'); ev(61.22, 'sparkle small: smug')
ev(61.30, 'footsteps wood')
ev(61.50, 'leather rustle: shimmy'); ev(61.88, 'SAD TROMBONE: sting')
ev(61.96, 'footsteps wood')
ev(62.02, 'cloth swish: spin out'); ev(62.12, 'leather rustle: jacket off'); ev(62.40, 'HANGER CLACK: jacket hung back')
ev(62.45, 'MEME EXPLOSION: the end')   # rev 4: the composited clip's own audio (boom at 62.50)
E.sort(key=lambda e: e['t']); json.dump(E, open('events-all.json', 'w'), indent=0); print(len(E), 'events')

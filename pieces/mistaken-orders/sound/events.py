"""What happens on screen (shot list in src/shots.js, voice take 13 tightened) -> events-all.json (t, what)."""
import json
E = []
def ev(t, what): E.append({'t': round(t, 3), 'what': what})
# shot cuts (whoosh on every cut, glides too)
for t in [1.94, 3.02, 5.28, 6.26, 8.42, 9.58, 12.96, 15.04, 17.46, 19.56, 23.36, 26.86, 28.82, 31.56, 36.40, 37.64, 40.46, 42.66, 44.76, 47.04, 51.18, 52.22, 54.62, 57.94]:
    ev(t - 0.06, 'whoosh: cut')
# s01 alley: you walk in through the noren
for k in range(6): ev(0.1 + k * 0.3, 'footsteps on stone')
ev(1.75, 'cloth swish: the noren')
# s02-s05: order, pencil, clock, the plate
ev(2.6, 'pop: burger cloud'); ev(2.7, 'pencil scribble'); ev(4.3, 'pencil scribble')
for k in range(5): ev(5.35 + k * 0.18, 'tick: the clock')
ev(6.84, 'plate down on the table')
ev(9.0, 'tap: finger up'); ev(12.42, 'thump: the sign wobbles')
# s08-s10: the coffee guy
ev(14.42, 'pop: coffee cloud'); ev(15.4, 'spoon clink: a straw'); ev(15.62, 'spoon clink: a straw'); ev(16.22, 'spoon clink: the spoon'); ev(16.76, 'pop: red X')
ev(17.6, 'laugh chuckle'); ev(18.6, 'crowd laughter')
# s11: she comes back, sits, asks twice
for k in range(4): ev(19.7 + k * 0.32, 'footsteps on wood floor')
ev(21.06, 'chair: she sits'); ev(22.12, 'pop: speech bubble'); ev(23.0, 'pop: speech bubble')
# s12: facade sign lights up, a couple walks in
ev(24.98, 'shimmer twinkle: the sign lights up')
for k in range(6): ev(23.5 + k * 0.4, 'footsteps on stone')
ev(26.4, 'cloth swish: the noren')
ev(27.6, 'laugh chuckle')
# s14-s17: the care home
for k in range(5): ev(28.9 + k * 0.32, 'footsteps on wood floor')
ev(30.08, 'pop: TV DIRECTOR card'); ev(32.04, 'pop: burger cloud'); ev(32.9, 'plate down on the table')
ev(33.9, 'tap: finger up'); ev(36.9, 'chew: a bite')
for i in range(3): ev(36.98 + i * 0.12, 'pop: heart')
# s18-s20: menu, tickets, the happy board
ev(38.9, 'chalk writing'); ev(39.8, 'shimmer twinkle: FREE')
for t in [41.08, 41.56, 41.9]: ev(t, 'rubber stamp: OOPS')
ev(42.26, 'pop: 37% tag'); ev(42.9, 'chalk writing'); ev(43.82, 'pop: 99%')
for k in range(5): ev(43.95 + k * 0.3, 'footsteps on wood floor')
ev(45.5, 'sliding door')
ev(46.0, 'laugh chuckle')
# s22-s24: apron, tray, thank you
ev(47.6, 'cloth swish: apron'); ev(48.6, 'cloth swish: apron'); ev(50.6, 'shimmer twinkle: proud')
for k in range(4): ev(51.2 + k * 0.28, 'footsteps on wood floor')
ev(51.3, 'spoon clink: the tray')
ev(53.5, 'applause'); [ev(53.96 + i * 0.09, 'pop: thank you bubble') for i in range(6)]
# s25-s26: your bite, the tag
ev(57.4, 'chew: a bite'); ev(57.7, 'pop: love')
for k in range(4): ev(58.0 + k * 0.28, 'footsteps on wood floor')
ev(59.0, 'plate down on the table'); ev(59.3, 'laugh chuckle'); ev(59.4, 'whoosh: shrug'); ev(60.25, 'chew: a bite'); ev(60.6, 'kitchen bell ding')
json.dump(sorted(E, key=lambda e: e['t']), open('events-all.json', 'w'), indent=1)
# ALT_BOOM: the tag is replaced by the facade at dusk and the blast; the film cuts dead at 61.0 s
X = [x for x in E if x['t'] < 57.85] + [{'t': 57.88, 'what': 'whoosh: cut'}]
for k in range(6): X.append({'t': 58.05 + k * 0.33, 'what': 'footsteps on stone'})
X += [{'t': 59.2, 'what': 'kitchen bell ding'}, {'t': 59.97, 'what': 'boom explosion'}, {'t': 59.97, 'what': 'bass impact'}, {'t': 60.08, 'what': 'debris crash'},
      {'t': 60.12, 'what': 'scream a'}, {'t': 60.3, 'what': 'scream b'}, {'t': 60.45, 'what': 'debris crash'}, {'t': 60.55, 'what': 'scream a'}]
json.dump(sorted(X, key=lambda e: e['t']), open('events-boom.json', 'w'), indent=1)
print(len(E))

"""What happens on screen (cheese-bank shot list in src/shots.js, voice take 11 tightened) -> events-all.json (t, what)."""
import json
E = []
def ev(t, what): E.append({'t': round(t, 3), 'what': what})
for t in [2.84, 3.88, 5.16, 7.36, 9.04, 10.30, 12.72, 13.94, 16.72, 18.08, 22.76, 25.26, 29.17, 33.59, 38.55, 40.69, 43.65, 47.23, 51.65, 55.21]:
    ev(t - 0.06, 'whoosh: cut')
for t in [1.42, 2.28, 3.28, 4.74, 6.8, 8.12, 9.84, 10.66, 12.04, 13.54, 15.56, 17.56, 19.36, 21.48, 23.92, 25.72, 27.38, 30.15, 32.59, 35.05, 37.19, 39.61, 43.05, 44.19, 44.83, 47.79, 50.45, 53.57, 57.35, 58.89, 59.6]:
    ev(t - 0.04, 'whoosh soft: snap')
# s01-s02 the hall, the vault, GOLD crossed out, the cheese aisle
for k in range(4): ev(0.2 + k * 0.42, 'footsteps on marble')
ev(1.45, 'metal clunk: vault door'); ev(2.3, 'rubber stamp: NO GOLD'); ev(2.95, 'shimmer twinkle: the cheese')
# s03-s05 you walk to the desk, payslip NOT NEEDED, wheel cloud
for k in range(4): ev(3.95 + k * 0.27, 'footsteps on marble')
ev(4.78, 'paper: LOAN form'); ev(5.05, 'chair: you sit')
ev(6.82, 'pop: payslip'); ev(7.05, 'rubber stamp: NOT NEEDED'); ev(8.14, 'pop: thought cloud')
# s06-s11 the dairy
ev(9.86, 'pop: map card'); ev(10.05, 'tap: the pin'); ev(10.7, 'shimmer twinkle: racks')
ev(13.56, 'pop: NOT READY'); ev(13.62, 'thump: tag')
for k in range(5): ev(14.9 + k * 0.13, 'paper flip: calendar')
for k in range(4): ev(16.2 + k * 0.11, 'paper flip: calendar')
ev(15.58, 'tap: 12'); ev(16.62, 'tap: 24')
for k in range(3): ev(16.82 + k * 0.27, 'footsteps on stone')
ev(17.1, 'money rustle'); ev(17.58, 'pop: NOT YET')
for t in [19.36, 19.98, 20.6]: ev(t, 'paper slap: bill'); ev(t + 0.02, 'pop: bill')
ev(21.5, 'pop: wallet'); ev(21.7, 'sad trombone')
# s12 the truck across the piazza
ev(22.8, 'truck engine')
for k in range(6): ev(22.85 + k * 0.4, 'footsteps on stone')
# s13 knock, listen, APPROVED
for k in range(4): ev(25.74 + k * 0.19, 'knock on wood')
ev(27.4, 'pop: watermelon cloud'); ev(28.75, 'rubber stamp: APPROVED'); ev(28.77, 'thump: kick')
# s14 the guard
for k in range(2): ev(29.95 + k * 0.3, 'footsteps on marble')
ev(30.1, 'cloth swish: lean'); ev(30.6, 'laugh chuckle')
for k in range(3): ev(32.5 + k * 0.28, 'sniff'); ev(32.6 + k * 0.15, 'pop: smell line')
# s15 the facade
for k in range(5): ev(33.7 + k * 0.4, 'footsteps on stone')
ev(35.05, 'neon sign on'); ev(37.2, 'shimmer twinkle: SINCE 1953')
# s16-s19 guarantee, the warehouse, flip + brush, the counter
ev(38.7, 'heavy thud: wheel on desk'); ev(39.63, 'pop: GUARANTEE'); ev(39.7, 'rubber stamp: GUARANTEE')
for k in range(4): ev(41.0 + k * 0.45, 'footsteps on stone')
ev(44.2, 'cloth swish: lift'); ev(44.64, 'heavy thud: wheel flips')
ev(44.85, 'brush scrub')
ev(47.8, 'pop: counter'); ev(47.85, 'cash register'); ev(50.47, 'pop: millions tag'); ev(50.6, 'cash register')
# s20-s21 shrug, SOLD, the guard, the door shuts
ev(52.0, 'whoosh: shrug'); ev(53.6, 'wood scrape: wheel slides'); ev(54.55, 'rubber stamp: SOLD'); ev(54.6, 'pop: SOLD')
for k in range(3): ev(56.9 + k * 0.4, 'footsteps on stone')
ev(58.2, 'sniff'); ev(58.5, 'sniff')
for i in range(5): ev(58.95 + i * 0.12, 'pop: heart')
ev(59.6, 'heavy door creak'); ev(60.1, 'metal door slam'); ev(60.1, 'slam hit')
json.dump(sorted(E, key=lambda e: e['t']), open('events-all.json', 'w'), indent=1)
print(len(E))

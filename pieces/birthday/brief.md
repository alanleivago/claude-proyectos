# The Birthday Paradox — brief (Bitstory #3)

- 9:16, 24fps, 68.1s, style bitpix, F2 one stage voice-led, centred. Voice: Algrow "Mad 3" (one take, 65.5s; the take skipped "Your gut says there's no way. But" → the gut line follows the take). Music: "Documentary Background Music for Videos" from 0:04, shaped (silence after "two hundred fifty-three", back on the hit). SFX synthesized.
- Data computed in `src/sim.js`: exact P(n) = 1 − Π(365−k)/365 (23 → 50.7%, 70 → 99.9%); your birthday 1 − (364/365)^22 = 5.9%; 100,000 seeded rooms of 23 → 50,683 with a shared birthday (50.7%); the room on screen is a real draw where two people share 20 Oct; 23 people = 253 pairs.
- Device: the ring of 23 joins pair by pair (1, 45, 253); the hit lands as the 253-line web completes; the real collision lights up magenta.
- Colours: mint = people and pairs; yellow = days / "you"; magenta = a shared birthday.

## Claims and sources
- 23 people → 50.7%; 70 → 99.9%: https://en.wikipedia.org/wiki/Birthday_problem , https://dcode.fr/birthday-problem
- 22 players + 1 referee = 23 people on the pitch (football rules); "about half of all matches" follows from the 50.7% (assuming birthdays spread evenly).
- 253 pairs = 23 × 22 / 2.

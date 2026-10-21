# How a Machine Learns — brief (Bitstory #2)

- 9:16, 24fps, 131.1s (2:11), style bitpix, F2 one stage voice-led. Voice: Algrow "Mad 3" (one take, `Ref bit y pixels/Voces/`, split by `styles/bitpix/tools/split_voice.py`). Music: "Documentary Background Music for Videos" from 0:04, extended with a 2s crossfade (src 4–112 + 92–133.5 → 147s), shaped by `shape_track.py` (silence on "strangest part", payoff on "never kept"). SFX synthesized (`src/score.js`). Centred frame (SHIFT 0) on the user's request.
- A real network (`src/net.js`): 2-10-10-1, tanh/tanh/sigmoid, 151 weights, full-batch gradient descent on two moons (200 points), 2400 epochs; initial error 1.09 (coin flip 0.69), final 0.001, 100% on 26 unseen points. The landscape is a real slice of the error through two output weights; the ball follows a real descent on it (steps 0.12 → 0.007). The blame is the real first gradient.
- Colours: mint = the network / right answers; yellow = weights; magenta = error and blame; azure = the second class.

## Claims and sources
- Backpropagation described in 1986 — Rumelhart, Hinton & Williams, Nature 323:533–536: https://mlanthology.org/misc/1986/rumelhart1986misc-learning
- "Hundreds of billions" of weights — GPT-3, 175B parameters (2020): https://devopedia.org/llama-llm
- "Trillions of words" — Llama 3 trained on 15T+ tokens (2024): https://www.hpcwire.com/aiwire/2024/06/04/llm-watch-llama-3/
- "This network never kept a single example" — true of this network (it stores only its 151 weights).

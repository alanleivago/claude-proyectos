---
type: doc
status: active
tags: [digger, voz, voicestudio, voice-fx, tts]
relatedTo: [voice-fx, digger-01-fridge]
---
# Voz Digger (androide) en VoiceStudio

Es una voz femenina **original**, diseñada con el voice design de VoiceStudio (OmniVoice): etiquetas de instrucción más una semilla. No se clonó a ninguna persona ni a las cuentas de referencia. La toma de diseño se guardó como perfil para que el timbre se mantenga igual en todas las frases.

## Voz elegida (reutilizable)

| Campo | Valor |
|---|---|
| Perfil VoiceStudio | **`5120fcba`** — "Digger android (original)" |
| Origen | diseño `instruct="female, young adult, very high pitch, american accent"`, `seed=7`, texto neutro (ver `candidates/refs/ref_B_H_vhi_s7.wav`). Ese WAV es la referencia del perfil |
| Generación | REST `POST http://127.0.0.1:3900/generate` con `profile_id=5120fcba`, `num_step=32`, `seed=1`, `language=en`, `effect_preset=raw` (seco), guidance 2.0 por defecto, speed 1.0. Salida WAV de 24 kHz |
| Post | `python pieces/voice-fx/retro_voice.py in.wav out.wav --preset digger` → −14 LUFS, WAV estéreo de 44.1 kHz y 24 bits |
| MCP | `generate_speech(profile_id="5120fcba", steps=32, language="en")` también sirve, pero no deja fijar seed ni `effect_preset`. Para tomas reproducibles conviene el REST |

Para regenerar o añadir líneas: `python -I scripts/gen.py 5120fcba <carpeta> <prefijo> all 1,2,3` (lee `guion.md`, prueba seeds hasta que whisper coincide con el texto). Después aplica `retro_voice.py --preset digger` y corre `scripts/timings.py`.

Nota: en este motor, la misma semilla con otro texto a veces sale rota (un tono de ~560 Hz sin voz). Por eso la voz va por perfil y no por "instruct + seed" en cada frase. Cada toma nueva se verifica con whisper.

## Cómo se eligió

1. **Audición** (`scripts/audition.py`): 5 diseños × 6–12 seeds con la frase de apertura, midiendo F0 con Praat. La mayoría queda en 170–230 Hz. Las seeds 7 y 42 caen cerca del objetivo (230–270 Hz).
2. **Referencias** de 11 s con un texto neutro: se descartaron las que salieron rotas (seeds 3 y 77 con "very high pitch") y las graves (<215 Hz).
3. Con 4 referencias se crearon 4 perfiles. Con cada uno se generaron los párrafos 1–3 del guion (steps 32, wav), y se procesaron con `genre` y `digger`.

### Candidatas (párrafos 1–3, 18.9 s cada una)

| | Perfil | Diseño | F0 crudo med [p5–p95], σ | F0 `digger` | F1/F2/F3 crudo | LUFS crudo | HNR | earshot AudioSet (Speech / Speech synth / Female) | earshot compare `genre` vs 7 voces aisladas |
|---|---|---|---|---|---|---|---|---|---|
| A | `d6f21f4f` | female, teenager, high pitch, seed 7 | 234 [164–345], 4.5 st | 257, σ 4.0 | 538/1703/2746 | −22.4 | 12.6 | 0.72 / 0.45 / 0.25 | cos 0.75, z −3.0 (outlier) |
| **B ✔** | **`5120fcba`** | female, young adult, very high pitch, seed 7 | **230 [162–329], 4.1 st** | **255, σ 3.6** | 567/1724/2870 | −26.3 | 12.7 | 0.74 / **0.19** / 0.18 | **cos 0.83, z −0.8 (encaja)** |
| C | `05b4960f` | female, young adult, high pitch, seed 7 | 235 [170–308], 3.2 st | 255, σ 3.5 | 528/1655/2999 | −25.6 | 13.6 | 0.71 / 0.41 / 0.16 | cos 0.81, z −1.3 |
| D | `c0a61742` | female, teenager, high pitch, seed 42 | 207 [138–305], 4.0 st | 251, σ 3.9 | 503/1642/2828 | −23.7 | 12.8 | 0.72 / 0.38 / 0.12 | cos 0.81, z −1.4 |

Las 4 tienen ritmo de 3.1 palabras/s (con 0.5 s entre párrafos), brillo de 1.3–1.5 kHz crudo y 1.77–1.82 kHz con `genre`, piso de ruido de −67 dBFS y transcripción whisper sin errores.

**Por qué B:** está en el rango de F0 sin subir pitch (230 Hz; `digger` la lleva a 255 con +2 st, lejos de la zona ardilla). Su entonación (σ 4.1 st → 3.6 con `digger`) queda curiosa y algo seca, sin llegar a monótona. Es la que menos suena a sintetizador (Speech synthesizer 0.19, frente a 0.38–0.45 de las demás) y la única que earshot pone dentro del grupo de las referencias (procesado/carácter, no identidad). C es la más "deadpan" (σ 3.2) y limpia (HNR 13.6): es la alternativa si se quiere más robot. A es la más expresiva, pero earshot la marca como outlier. D es demasiado grave.

Archivos: `candidates/<L>/<L>_p0N.wav` (crudos por párrafo), `candidates/<L>_p01-03_{raw,genre,digger}.wav` y `candidates/refs/`.

## Toma final (`final/`)

- `digger01_p01.wav` … `digger01_p15.wav`: un archivo por párrafo del guion, procesado con `digger` y cada uno a −14 LUFS. Así las pausas se editan a mano.
- `raw/`: los mismos sin procesar (24 kHz), más `digger01_gen.json` (seed y transcript de cada uno).
- `digger01_full_preview.wav`: solo de referencia, con los 15 unidos y 0.45 s entre ellos.
- `word_timings.json`: tiempos por palabra (faster-whisper small, CPU int8) relativos a cada archivo, más el offset en el preview.

Medidas del preview (83.1 s): F0 256 Hz [181–353], σ 3.8 st, F1/F2/F3 515/1808/3027, −14.0 LUFS, pico −2.2 dBFS, LRA 3.1 LU, 2.71 palabras/s. earshot: Speech 0.87, "a woman speaking" z 4.2, Speech synthesizer 0.45; los tags de producción incluyen "computer-generated electronic tone", que es el toque androide buscado. Los 15 párrafos coinciden con el guion en whisper sobre el crudo, todos con seed 1.

A revisar al editar: dura **83 s** (el guion estimaba ~70 s), así que se pueden recortar silencios. En p05 casi no hay pausa entre "underneath" y "Cold air sinks", y en p15 "understood" sale rápido. Conviene meter ~0.2 s de silencio en esos puntos.

### Tiempos por palabra (s, relativos a cada archivo; @ = inicio en el preview)

- **p01** (4.52 s, @0.00): Operator 0.48–0.92 · I 1.06 · dug 1.10 · up 1.28 · another 1.46 · human 1.68 · artifact 2.00–2.46 · Humans 2.80 · called 3.00 · it 3.32 · a 3.58 · fridge 3.74–3.96
- **p02** (4.82 s, @4.97): If 0.00 · you 0.64 · dig 0.76 · a 0.96 · hole 1.06 · in 1.26 · the 1.44 · snow 1.56 · and 1.78 · throw 2.12 · your 2.34 · meat 2.52 · in 2.76 · it 2.88–3.02 · you 3.14 · have 3.22 · a 3.42 · refrigerator 3.52–3.88
- **p03** (8.50 s, @10.24): But 0.00 · snow 0.46 · melts 0.68 · in 0.98 · summer 1.14–1.46 · so 1.82 · humans 2.04 · cut 2.30 · giant 2.60 · blocks 2.92 · of 3.16 · ice 3.38 · from 3.54 · frozen 3.74 · lakes 4.02–4.40 · and 4.40 · hid 4.88 · them 5.06 · in 5.22 · a 5.36 · shed 5.46 · full 5.66 · of 5.92 · sawdust 6.02–6.58 · This 7.06 · is 7.36 · an 7.50 · icehouse 7.62–8.00
- **p04** (6.94 s, @19.19): The 0.00 · ice 0.48 · lasted 0.74 · for 1.20 · months 1.40–1.74 · even 2.02 · in 2.22 · summer 2.40–2.68 · But 2.94 · ice 3.02 · still 3.26 · melts 3.50–3.80 · and 3.80 · your 4.20 · meat 4.32 · ends 4.56 · up 4.74 · swimming 4.90 · in 5.14 · water 5.32–5.58 · Gross 5.96–6.26
- **p05** (6.27 s, @26.58): So 0.00 · they 0.46 · put 0.60 · the 0.74 · ice 0.90 · on 1.10 · top 1.28 · of 1.48 · a 1.68 · wooden 1.76 · box 1.94–2.34 · and 2.34 · the 2.90 · food 3.00 · underneath 3.20–3.62 · Cold 3.62 · air 4.24 · sinks 4.42–4.72 · This 4.86 · is 5.06 · an 5.20 · icebox 5.30–5.72
- **p06** (5.67 s, @33.30): Operator 0.00 · Mike 0.68 · asks 0.88–1.22 · Why 1.46 · not 1.64 · just 1.80 · make 1.98 · cold 2.14–2.46 · Mike 2.80–2.86 · you 3.26 · can't 3.36 · make 3.62 · cold 3.72–4.02 · You 4.18 · can 4.22 · only 4.36 · steal 4.56 · heat 4.82–5.16
- **p07** (2.29 s, @39.42): And 0.00 · that's 0.40 · exactly 0.68 · what 1.06 · humans 1.28 · did 1.58–1.90
- **p08** (7.46 s, @42.16): When 0.00 · a 0.60 · liquid 0.74 · evaporates 1.00–1.86 · it 2.26 · steals 2.94 · heat 3.26 · from 3.58 · everything 3.80 · around 4.14 · it 4.44–4.70 · That's 5.04 · why 5.32 · you 5.46 · shiver 5.60 · when 5.90 · you 6.10 · get 6.22 · out 6.36 · of 6.50 · the 6.60 · shower 6.68–6.96
- **p09** (6.66 s, @50.07): So 0.00 · they 0.52 · filled 0.66 · a 0.86 · pipe 0.98 · with 1.22 · a 1.42 · special 1.54 · liquid 1.84–2.28 · that 2.28 · boils 2.98 · at 3.26 · minus 3.56 · twenty-six 3.84–4.34 · degrees 4.34–4.72 · This 5.18 · is 5.46 · a 5.60 · refrigerant 5.70–6.34
- **p10** (3.65 s, @57.18): Inside 0.00 · the 0.62 · box 0.82–1.12 · it 1.32 · boils 1.46 · and 1.76 · steals 2.10 · the 2.34 · heat 2.56 · from 2.72 · your 2.92 · food 3.04–3.28
- **p11** (6.49 s, @61.28): Then 0.00 · a 0.48 · pump 0.62 · squeezes 0.88 · it 1.58 · outside 1.68 · until 1.98 · it 2.38 · gets 2.50 · hot 2.68–3.06 · and 3.06 · dumps 3.64 · that 4.00 · heat 4.12 · out 4.28 · the 4.46 · back 4.58–4.78 · This 5.06 · is 5.34 · a 5.48 · compressor 5.58–5.84
- **p12** (2.97 s, @68.22): That's 0.00 · why 0.58 · the 0.74 · back 0.86 · of 1.12 · your 1.28 · fridge 1.40 · is 1.70 · always 1.86 · warm 2.14–2.50
- **p13** (4.74 s, @71.64): So 0.00 · your 0.48 · fridge 0.60 · doesn't 0.86 · make 1.20 · cold 1.36–1.76 · It's 2.20 · a 2.40 · heat 2.44 · thief 2.66 · running 2.90 · in 3.24 · a 3.44 · loop 3.52–3.74 · forever 3.74–4.22
- **p14** (3.54 s, @76.83): Humans 0.00 · built 0.58 · a 0.94 · machine 1.08–1.44 · just 1.44 · to 1.96 · rob 2.12 · their 2.30 · own 2.48 · leftovers 2.60–2.96
- **p15** (2.32 s, @80.82): Artifact 0.00–0.68 · understood 0.68–0.92 · Logging 0.92 · off 1.48–1.80

(Cada número es el inicio de la palabra; el rango completo está en `word_timings.json`. En los archivos procesados whisper escuchó "fill the pipe" en p09; en el crudo transcribió bien "filled a pipe". Las palabras están corregidas al guion.)

## Scripts (`scripts/`)

`audition.py` (diseños × seeds → F0), `gen.py` (perfil → un WAV por párrafo, verificado con whisper), `meas.py` (F0, formantes, LUFS, crest, HNR, palabras/s), `timings.py` (tiempos por palabra con faster-whisper small CPU int8; el audio se carga con `wave` + numpy, más el preview). Hay que correrlos con `python -I`: en este equipo, numpy falla si el cwd tiene módulos sueltos.

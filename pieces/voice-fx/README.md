---
type: doc
status: active
tags: [voice-fx, retro-voice, low-poly-anime, sinaboto, tts, digger]
relatedTo: [sinaboto-style]
---
# voice-fx — voz "retro" para explainers low poly anime

Filtro reutilizable (`retro_voice.py`) que le da a una voz femenina **original** el carácter sonoro de las cuentas de referencia (sinaboto, yurinasama, kingpinrin, momomakes64, yuimasensei, polygoth8, yuki.science). Solo copia el procesado: EQ, corte de graves, dinámica, loudness, registro. No usa ni clona sus voces.

## 1. Qué se midió y cómo

- 45 videos (`fuentes/tiktok-research/<cuenta>/*.mp4`). `Ref sinaboto/` son los mismos 5 videos que `sinaboto/`.
- **Mezcla completa**: LTAS (espectro promedio) de la voz usando los tiempos de palabra del transcript, comparado con los huecos (cama musical). LUFS, true peak, crest, F0 y formantes con Praat (parselmouth).
- **Voz aislada**: 30 s por cuenta separados con demucs (htdemucs), elegidos en el tramo con más diferencia entre voz y música. Ahí se miden la curva de 1/3 de octava, el corte de graves, la inclinación, el crest, F0, formantes y HNR.
- earshot `describe` / `measure` / `compare` sobre los clips y sobre los resultados.
- Imágenes en `analysis/`: `ltas_por_cuenta.png`, `spec_refs_mezcla.png`, `spec_refs_voz_aislada.png`, `zoom_voz_aislada.png` y `spec_before_after.png`. Los scripts de análisis también están en `analysis/`.

### Hallazgo principal (importante)

**Ninguna cuenta procesa la voz como un videojuego viejo.** En los espectrogramas no hay techo duro de 8, 11 o 16 kHz (la voz llega hasta el corte del códec de TikTok, 15–17 kHz). No hay ruido de cuantización ni bitcrush, tampoco aliasing (armónicos espejados), vocoder, chorus ni reverb. Los formantes son de mujer normal, así que tampoco hay pitch shift tipo ardilla. El aire "retro" viene de la **música chiptune y los SFX**, del registro agudo de la voz y de una cadena de radio/TikTok: corte de graves a ~170 Hz, cuerpo en 200–300 Hz, voz seca y comprimida a −14 LUFS.

Por eso el filtro tiene dos capas:
1. **Presets fieles** por cuenta: reproducen lo medido (EQ, HPF, dinámica, techo de códec, registro). Son "limpios", igual que las referencias.
2. **Capa retro opcional**, usada en `digger`: resample PS1 a 22.05 kHz, 12 bits, un toque de aliasing, comb metálico corto, saturación suave y entonación algo más plana. Las referencias no lo hacen; es para el personaje androide.

### Medidas por cuenta

| Cuenta | Techo (códec) | Corte graves | Inclinación 500–5k | 4–6 kHz vs 300–3k | LUFS mezcla | Crest voz | F0 mediana [p5–p95] | F1/F2/F3 (Hz) | Palabras/s* | Notas |
|---|---|---|---|---|---|---|---|---|---|---|
| sinaboto | 16.7–17.2 k (AAC/MP3) | ~180 Hz, suave | −11.7 dB/oct (oscura) | −27 dB | −14.1 | 12.6 dB | 299 [196–465] | 585/1417/2575 | 2.3–2.9 (3.3–3.5) | La más aguda y cálida, muy expresiva (σ 4.8 st) |
| yurinasama | 16.7 k | ~150 Hz | −8.9 | −21 | −14.1/−14.5 | 13.4 | 234 [168–366] | 541/1739/2890 | 2.7–2.8 (3.3–3.5) | Mucho cuerpo en 200–250 Hz (+15 dB) |
| kingpinrin | 16.5 k | **~175 Hz, muy empinado** (≥24 dB/oct) | −6.2 | −16 | −13.7 / −16.8 | 11.8 | 229 [167–359] | 508/1779/2910 | 2.5–2.7 (2.8–3.7) | Presencia plana 2–4 kHz, la más "radio" |
| momomakes64 | 16–17.2 k | ~170 Hz | −8.5 | −17 | −14.1 | 13.5 | 267 [178–380] | 553/1724/3202 | 3.2–3.6 | Mucho aire 6–12 kHz (voz soplada o exciter) |
| yuimasensei | 16.5–17 k | ~130 Hz | −6.4 | −17 | −9.3 a −15.7 | 12.5 | 227 [162–314] | 448/1697/2940 | 2.3–2.6 | Más graves, ritmo lento |
| polygoth8 | ~13–17 k (AAC 48k) | ~90 Hz | **−1.8 (muy brillante)** | −6 | −14.3 | 11.5 | 205 [187–236] | 468/2005/3201 | 2.9–3.25 | Entonación **plana** (σ 2.9 st): la más "robótica"; +10 dB de presencia en los 4 videos recientes |
| yuki.science | **15.2 k** en todos | **~175 Hz, muy empinado** | −6.3 | −18 | −12.2 a −16.2 | 12.1 | 248 [164–454] | 589/1889/2872 | 2.5–2.8 | Mismo corte de graves que kingpinrin; HNR bajo (algo áspera) |

\* Palabras/s del video completo con pausas; entre paréntesis, solo dentro de las palabras.
Comunes a todas: voz **seca** (sin cola de reverb en el espectrograma), mono y centrada, loudness integrado de la mezcla ≈ −14 LUFS y true peak de −1.5 a −5 dBTP. La voz va 6–20 dB por encima de la cama musical.

### ¿Son TTS?
Probablemente son TTS neuronal moderno, del tipo ElevenLabs (no está confirmado). Las razones: banda completa, timbre y F0 idénticos entre videos de la misma cuenta (±5 %), nada de sala, loudness muy estable (LRA ~2 LU) y prosodia expresiva pero regular. No suenan a TTS concatenativo viejo tipo Zira. polygoth8 es la única con entonación claramente aplanada. Velocidad: 2.3–3.6 palabras/s; momomakes64 y polygoth8 son las más rápidas, yuimasensei la más lenta.

## 2. La cadena (`retro_voice.py`)

```
entrada (cualquier sr, mono/estéreo) → 44.1 kHz mono
 1. pitch/formante (Praat "Change gender", PSOLA): mediana de F0 hacia la de la cuenta, máximo ±4 st; rango de entonación; formantes
 2. HPF Butterworth (frecuencia y orden según la cuenta)
 3. Match-EQ FIR de fase lineal hacia la curva medida de la cuenta (1/3 oct, 315 Hz–12.5 kHz, suavizado ~2/3 oct, +9/−18 dB máx.; nunca realza bandas vacías)
 4. [retro] resample a retro_rate (con mezcla de zero-order-hold = aliasing) + cuantización a N bits
 5. [retro] comb metálico corto (3.2 ms, fb 0.35)
 6. [retro] saturación tanh
 7. compresor RMS (umbral −8 dB respecto al nivel fuerte, 3:1, 3/80 ms, ganancia suavizada sin clicks)
 8. LPF: techo del códec de TikTok (presets fieles) o 10.5 kHz (digger)
 9. normaliza a −14 LUFS medido como estéreo dual-mono + limitador con look-ahead → techo −2 dBFS
salida: WAV estéreo (dual-mono) 44.1 kHz 24 bits
```

### Presets

| Preset | Qué hace |
|---|---|
| `digger` (por defecto) | Curva "genre" (promedio de las 7), HPF 170 Hz/6.º orden, F0 → 255 Hz (máx. +4 st), entonación ×0.8, formantes ×1.03, **22.05 kHz + 12 bits + 12 % aliasing**, comb 18 %, saturación 0.25, LPF 10.5 kHz. Androide, pero claramente humana |
| `genre` | Curva promedio de las 7 cuentas, sin lo-fi y sin cambio de pitch |
| `sinaboto`, `yurinasama`, `kingpinrin`, `momomakes64`, `yuimasensei`, `polygoth8`, `yuki.science` | Curva, HPF, techo de códec y F0 medidos de cada cuenta. polygoth8 además aplana la entonación (×0.6) |

## 3. Uso

```bash
cd "F:/Claude Proyectos/pieces/voice-fx"
python retro_voice.py voz.wav voz_fx.wav                      # digger
python retro_voice.py voz.wav voz_fx.wav --preset kingpinrin
python retro_voice.py voz.wav voz_fx.wav --preset digger --bits 10 --range 0.7   # más robot
python retro_voice.py voz.wav voz_fx.wav --preset digger --f0 0                  # sin tocar el pitch
python retro_voice.py voz.wav voz_fx.wav --pitch-st 2         # +2 semitonos fijos
python retro_voice.py --list                                  # ver todos los parámetros
```
Opciones: `--f0 --pitch-st --range --formant --rate --bits --alias --comb-mix --drive --eq --hpf --lpf --lufs`.
Dependencias: `numpy scipy soundfile pyloudnorm` y, para el paso de pitch, `praat-parselmouth` (si falta, el paso se salta).
Al mezclar: deja la voz a −14 LUFS y la música 8–15 dB por debajo durante el habla, como en las referencias. Después vuelve a medir el master.

## 4. Prueba (`samples/`)

Frase: *"Operator... I dug up another human artifact. Humans called it... a fridge."*
- Bases: `base_kokoro_af_heart.wav` y `base_kokoro_af_bella.wav` (Kokoro local, 24 kHz) y `base_zira.wav` (SAPI Zira, 22 kHz).
- Procesadas: `heart_<preset>.wav` con los 9 presets, más `bella_digger.wav` y `zira_digger.wav`.

| Muestra | Distancia de curva a la cuenta (dB RMS, 315 Hz–12.5 kHz) antes → después | Crest | LUFS | F0 | Whisper |
|---|---|---|---|---|---|
| sinaboto | 14.3 → 6.6 | 15.2 → 12.3 | −25 → −14 | 201 → 251 | 0 errores |
| yurinasama | 11.6 → 4.9 | → 12.7 | −14 | 233 | 0 |
| kingpinrin | 7.8 → 3.1 | → 12.7 | −14 | 226 | 0 |
| momomakes64 | 4.9 → 2.5 | → 12.8 | −14 | 251 | 0 |
| yuimasensei | 7.0 → 3.5 | → 12.4 | −14 | 215 | 0 |
| polygoth8 | 7.1 → 1.9 | → 13.6 | −14 | 210 (σ 1.9 st) | 0 |
| yuki.science | 8.4 → 3.2 | → 13.3 | −14 | 247 | 0 |
| genre | 7.8 → 3.0 (vs promedio) | → 12.7 | −14 | 203 | 0 |
| digger | 7.8 → 5.6 (vs promedio; el lo-fi lo aleja a propósito) | → 12.9 | −14 | 253 (σ 2.4 st) | 0 |

- Crest de las referencias: 11.5–13.5 dB. Las salidas quedan en 12.3–13.6 dB.
- **earshot compare** contra las 7 voces aisladas: la distancia de rasgos medidos baja de 1.20 (base) a 0.34 (`genre`) y 0.48 (`digger`). Loudness, brillo (1.32 kHz frente a 1.47 kHz de mediana) y graves quedan dentro del rango de las referencias. La similitud CLAP se queda en ~0.69, como es de esperar: mide timbre e identidad, y no copiamos la voz. Las únicas diferencias que señala son el largo y el ruido de fondo (las referencias tienen restos de música de la separación).
- **earshot describe** de `heart_digger.wav`: Speech 0.94, "a woman speaking" z 3.6, AudioSet "Speech synthesizer" 0.16. Entre los tags de producción aparecen "computer-generated electronic tone" y "retro video game sound effect": se lee como voz de mujer con un toque sintético retro.
- **Inteligibilidad**: faster-whisper transcribe todas las salidas sin errores.

## 5. Recomendaciones para la voz base (elegir o clonar con consentimiento / VoiceStudio)

- **Tono**: mediana de F0 de **230–270 Hz** (las referencias van de 205 a 300). Mejor elegir una voz que ya esté ahí que subirla: el filtro sube como máximo 4 st y por encima de +3 st PSOLA empieza a sonar a ardilla. Kokoro af_heart (201 Hz) necesita +4 st; una voz de ~240 Hz no necesita nada.
- **Rango**: expresiva, con σ de ~3.5–5 semitonos (p5–p95 de ~170–450 Hz). Para Digger va bien algo menos (el preset ya aplana ×0.8), pero sin llegar a monótona.
- **Edad aparente**: joven adulta, 18–25 años. Sonrisa en la voz y energía media-alta, sin gritar.
- **Acento**: inglés americano neutro, como todas las referencias. Nada de acento marcado ni vocal fry.
- **Timbre**: formantes de mujer normal (F1 ~500–600, F2 ~1.7–1.9 k, F3 ~2.9–3.0 k), poco aire y poca respiración (el preset momomakes64 ya añade aire). Tiene que ser una toma seca, sin sala ni reverb, a 44.1/48 kHz si se puede (Kokoro a 24 kHz corta en 12 kHz; para los presets fieles conviene más banda).
- **Ritmo**: 2.6–3.0 palabras/s contando pausas (~3.3–3.5 dentro de la frase), con pausas cortas en "..." como en el guion.
- En VoiceStudio: clona solo una voz con permiso de su dueña o diseña una nueva. Genera con steps=32 en wav y pásala por `retro_voice.py --preset digger`.

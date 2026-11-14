---
type: spec
status: draft
tags: [zombie-channel, ava-restfield, long-form, farm, brief]
relatedTo: [zombie-channel, ava-rules]
---

# Ep8 LARGO "AVA: The Last Farm — Day 1 (Part 1)" — brief

16:9, objetivo ~8:30 (mínimo 8:00), inglés, segunda persona. Adaptación completa del Stickocalypse "The Last Farm" ep1 (`fuentes/zombie-nicho/part-1-stickocalypse-...md`): todo parafraseado, Ava en lugar de Eli, look PS1/RE, nada de su texto ni su nombre en pantalla.

- **Motor:** copia de `zombie-03-station/largo/engine` (640x360 x3, planos anclados a palabras con `shots.json` + `ctx.at`).
  - Cambios en film.js: tarjeta de capítulo con hora + título rojo + "DAY 1 — THE FARM", placa del HUD "FARM", colores de subtítulos y tramos del HUD.
  - Heroína, caras y teléfono copiados del ep7. La cara `scared` sale de `sets/avaface.js`, copia del pintado del ep7.
- **Decorados:**
  - `sets/farm.js`: todos los exteriores y el atasco del YOU DIED.
  - `sets/house.js`: cocina, baño, sótano, recibidor y dormitorio.
  - `sets/screens8.js`: teléfono, mapas RE, corte del pozo, diagrama, reloj, FILE, ITEM, guardado y tarjeta final.
  - `sets/dog.js`: Ribbon, del ep3.
- **Guion:** `voz/guion.md`. Las tomas están en `voz/takes.py`: 100 tomas y 1351 palabras.
- **Storyboard:** `storyboard_v1.png` (25 planos + fila de props + animales).
- **Props:**
  - Foto aislada de Flow (MCP) → recorte → lowpoly. Herramientas en `objects/tools/`, comparación en `objects/compare/PROPS_ROW.png`, créditos en `objects/CREDITS.md`.
  - La cadena está hecha en código. El balde y el teléfono se reusaron del ep6/ep7.
- **Animales:**
  - Comparación en `assets_dl/animals/COMPARE.png`, licencias en `engine/models/ANIMALS_LICENSE.txt`.
  - Vaca: Quaternius, CC0, animada.
  - Gallina y gallo: Poly by Google, CC-BY 3.0, riggeados aquí.
  - Ribbon: Quaternius German Shepard, CC-BY 3.0.

## Datos verificados

| Dato en el video | Estado | Fuente |
|---|---|---|
| Pozo con bomba eléctrica: sin luz no hay bomba ni agua ("If the power goes out… the pump stops, and so does your water"). | OK | [Chester County: Well Water and Power Outages](https://www.chesco.org/2629/Well-Water-and-Power-Outages), [Portland General: Powering Wells During an Outage](https://portlandgeneral.com/outages-safety/powering-wells-during-a-power-outage), [Private Well Class](https://intercom.help/privatewellclassorg/en/articles/9047456-what-do-i-do-if-there-is-a-power-outage-and-my-well-won-t-work) |
| Generador solo afuera; nunca en casa, garaje, granero ni porche; a 20 ft o más de puertas y ventanas; escape apuntando lejos; el CO no se ve ni se huele. | OK. CPSC: "OUTSIDE ONLY… at least 20 feet from doors, windows, and vents" y "Don't operate a generator on a porch or in a carport". "Not in the barn" sale de la regla de CPSC de no usarlo en garaje o galpón ni cerca de edificios donde entra gente. | [CPSC Safety Alert](https://www.cpsc.gov/s3fs-public/Portable-Generator-Safety-Alert-2017_5123.pdf), [CPSC 2026, winter storm](https://cpsc.gov/Newsroom/News-Releases/2026/Winter-Storm-May-Knock-Out-Power-CPSC-Warns-of-Deadly-Carbon-Monoxide-and-Fire-Risks), [PIRG (cita a CPSC)](https://pirg.org/resources/portable-generators-kill-about-70-people-each-year-heres-how-to-protect-yourself-and-your-loved-ones-2/) |
| 1 galón por persona por día, para beber y lavarse (Ready.gov). | OK. La cifra de Ready.gov es un mínimo; la voz dice "says one gallon per person per day". | [Ready.gov Water](https://www.ready.gov/water), [Ready.gov, archivo](https://webarchive.library.unt.edu/web/20090507175617/http:/www.ready.gov/america/getakit/water.html) |
| Generador común ~70 dB a 23 ft (distancia estándar de prueba); baja ~6 dB al doblar la distancia; a 650 ft queda ~40 dB, como una biblioteca. | OK, con matiz. Los generadores abiertos dan 65–85 dB a 23 ft y los inverter 50–65; uso 70 dB. Al aire libre bajan 6 dB por cada vez que se dobla la distancia. Cuenta: 650/23 ≈ 28, son ~4.8 duplicaciones, o sea −29 dB → ~41 dB. Una biblioteca tiene ~40 dB. Anillos (en pies, aprobado tras el storyboard): 150 ft = 54 dB, 300 ft = 48 dB, 650 ft = 41 dB. Ninguna fuente da una distancia fija a la que se deja de oír, porque depende del ruido de fondo. Por eso la voz dice "plenty to hear" en una granja sin tráfico. | [Generac: decibel ratings](https://support.generac.com/s/article/What-are-the-decibel-ratings-for-my-generator), [RVtravel: noise ratings](https://www.rvtravel.com/generator-noise-raitings-1112b/), [Portable generator noise levels](https://portable-generator-site.pages.dev/posts/portable-generator-noise-levels) |
| De noche, con aire frío y quieto, el sonido llega más lejos ("On a cold, still night, sound carries even farther"). | OK. Es la inversión térmica: el sonido se curva hacia el suelo. | [Britannica: refraction of sound](https://britannica.com/science/sound-physics/Refraction), [COMSOL: Why sounds travel farther at night](https://www.comsol.com/blogs/why-sounds-travel-farther-at-night) |
| Una vaca toma "somewhere around ten to twenty gallons a day"; 12 vacas se toman 110 gal en "about half a day". | OK. Vaca de carne seca ~9 gal/día a 70 °F y lactante ~20; las lecheras, 30–50. 12 × 10–20 = 120–240 gal/día, así que 110 gal dan para medio día o menos. | [Beef Cattle extension.org](https://beef-cattle.extension.org/how-much-water-do-cows-drink-per-day), [Colorado State Extension (PDF)](https://goldenplains.extension.colostate.edu/wp-content/uploads/sites/56/2021/06/PR_CalculatingWaterforCattle.pdf), [Penn State Extension](https://extension.psu.edu/clean-drinking-water-is-essential-to-cows) |
| Freezer lleno: ~2 días frío con la puerta cerrada. | OK. FoodSafety.gov: 48 h lleno y 24 h a medias. | [FoodSafety.gov](https://www.foodsafety.gov/blog/three-ways-keep-food-safe-when-you-lose-power) |
| Un perro oye "some sounds about four times farther away than you can". | MATIZADO, como en el ep3: la cifra es popular y vale sobre todo para sonidos agudos. Por eso dice "some sounds". | [Kinship](https://www.kinship.com/dog-behavior/how-far-can-dogs-hear), [Eileen and Dogs (crítica de la cifra)](https://eileenanddogs.com/blog/tag/audiograms/) |
| Bañera ~40 gal; calentador 40 gal. | OK. Una bañera estándar llena hasta el rebosadero tiene ~40–50 gal. El calentador ya estaba verificado en el ep3. | Calentador: `zombie-03-station/largo/FACTS.md` |
| Los gallos cantan al amanecer ("starts at five in the morning"). | Es el color de la historia, no un dato duro. | — |

**Ajustes por datos:**
- Gallinas: sale ~1 pinta por día cada una, pero no lo digo en la voz.
- Perro: la frase quedó como "some sounds".
- Generador: "about seventy" en vez de una cifra exacta, porque varía por modelo.
- Ninguno de los datos pedidos resultó falso.

**Ficción declarada (no son datos):**
- "el grid dura una hora";
- "7:51 se va la luz";
- los números del inventario de Ava: 34 días de comida, 22 gal de diésel y 26 días de alimento.

## Estado (checkpoint 1: storyboard)

- **Voz:** en generación (VoiceStudio, f2a102da, steps 32, wav, speed 0.85, 4 semillas por toma). Orden: `gen.py` → `pick.py` → `assemble.py` (como el largo del ep3) → `timeline.json` real.
  - El storyboard usa `voz/provisional.py`, así que las horas de la hoja no son las finales.
  - La toma "Oh, fudge" es la del ep1.
- **Pendiente tras la aprobación:**
  - SFX reales (Freesound CC0 + Dino Crisis) verificados con earshot, con todos los eventos mapeados en `mix_largo.py`;
  - música por LUFS a 9–13 LU bajo la voz, gancho 0–10 s con más terror y master a −14 LUFS;
  - render, revisión en partes de ~2:40, `DESCRIPCION.md`, miniatura y Telegram.

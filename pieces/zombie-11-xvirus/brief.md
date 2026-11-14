---
type: spec
status: draft
tags: [zombie-channel, ava-restfield, x-virus, rabies, short, brief]
relatedTo: [zombie-channel, ava-rules, zombie-10-stairs]
---

# Ep11 "AVA: How Not to Turn" — brief

Short 9:16, ~62 s, ingles, segunda persona, how-to. Virus ficticio "the X-virus" que se comporta como la rabia (todo consejo es real; lo ficticio se dice "In this world").

## Datos verificados

| Dato en el video | Estado | Fuente |
|---|---|---|
| Se contagia por saliva: mordida, rasguno o contacto con mucosas (ojos, boca, heridas abiertas) | OK (rabia) | [WHO rabies fact sheet](https://www.who.int/news-room/fact-sheets/detail/rabies), [CDC About Rabies](https://www.cdc.gov/rabies/about/index.html) |
| "In their blood and spit" | Parcial: en la rabia real es la SALIVA (y tejido nervioso), no la sangre. La sangre se dice dentro de "In this world" (regla del X-virus). | WHO (arriba) |
| Lavar la herida con agua y jabon al menos 15 min | OK. WHO: "wash the wound with water and soap for at least 15 minutes"; primeros auxilios WHO: "flushing and washing ... for a minimum of 15 minutes" | [WHO fact sheet](https://www.who.int/news-room/fact-sheets/detail/rabies), [WHO rabies PEP](https://www.who.int/rabies/rabies_post_immunization/en/) |
| "Running water" | OK por interpretacion: WHO dice "flushing" (lavado a chorro). | idem |
| Despues desinfectar | OK. Protocolo WHO: tras el lavado, antiseptico (povidona yodada, alcohol 70 %). Se muestra con el First Aid Spray. | [WHO rabies PEP](https://www.who.int/rabies/rabies_post_immunization/en/) |
| Cubrirse: mangas largas, guantes, antiparras, mascara/bandana contra salpicaduras | OK con ajuste. OSHA/CDC: mascara + proteccion ocular cuando hay salpicaduras de sangre. NIOSH: los anteojos comunes NO cuentan como proteccion ocular, por eso la voz dice solo "goggles" (el pedido decia "goggles or glasses"). La bandana es una barrera improvisada (no es un dato oficial). | [CDC PPE / 29 CFR 1910.1030](https://wwwn.cdc.gov/PPEInfo/Standards/Info/29CFR19101030), [NIOSH eye protection (archivo)](https://webarchive.library.unt.edu/eot2008/20090110095021mp_/http:/www.cdc.gov/niosh/topics/eye/eye-infectious.html) |
| No tocarse la cara; lavarse las manos | OK. CDC: evitar tocarse ojos, nariz y boca con las manos sin lavar. | [CDC handwashing](https://www.cdc.gov/clean-hands/) |
| Diario de sintomas (dia 1 fiebre/dolor de cabeza, dia 2 ojos rojos/mirada fija, dia 3 ???) | FICCION ("In this world"). La rabia real empieza con fiebre y hormigueo, pero tarda semanas o meses. | — |
| Cuarentena de 72 h | FICCION (regla de este mundo). | — |

## Estado
- ENTREGADO v3 (2026-11-08): `renders/share.mp4` = `renders/zombie11_xvirus_v3.mp4`, 62.9 s, -14.0 LUFS, pico -1.5 dBFS. 2 rondas API (`renders/*_revision.md`); v3 arregla los fallos claros de la ronda 2 sin 3a ronda. Sin Telegram.
- Tras la aprobacion del storyboard: 1b/9 con hold_up_object (antebrazo frente al pecho, rasguno en el derecho, cara visible), lavabo con plano medio + espuma, plano 8 reencuadrado, "bare arms" regenerada con punto (s7, F0 baja).
- Checkpoint 1: `storyboard_v1.png` (frames reales del motor con la voz real, 63.0 s; voz termina en 60.4 s). Pendiente de aprobacion.
- Motor: copia del ep10 (`engine/`), `sets/xvirus.js` (casa del ep10 + planos nuevos + equipo en codigo pegado a los huesos) y `sets/screens11.js` (microscopio, spray USE, FILE diario).
- Voz: f2a102da, steps 32, wav, 8 semillas por toma (`voz/pick.txt`); elegidas a mano las de F0 que baja en afirmaciones (01_0 s4 con pausa de coma insertada en el silencio tras "outbreak", 01_1 s6, 03_0 s3, 03_1 s4, 06_0 s1, 09_0 s5, 05_0 s3, 02_0 s7). "Oh, fudge" = toma del ep1.
- Lineas agregadas para llegar a ~62 s: "Blood on a sleeve is just laundry." y "and get real medical help, fast." (WHO: el lavado no reemplaza la atencion medica).
- Audio: `audio/scripts/mix11.py` listo (SFX Freesound CC0 elegidos con earshot rank: 473707 canilla, 348242 golpe, 646399/360942 salpicadura, 674984 spray, 494792 tela, 154795 zoom, 462929 tic-tac). Se corre despues de la aprobacion.

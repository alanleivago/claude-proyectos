---
type: doc
status: complete
tags: [digger, credits, licencias, cc0, cc-by, freesound, poly-pizza]
relatedTo: [digger-01-fridge, digger-channel]
---
# Créditos — Digger 01: the fridge

## Personaje y voz
| qué | origen | licencia |
|---|---|---|
| Personaje `zero_fem` (`engine/models/zero_anim.glb`, caras, 32 acciones) | modelo ZeroVolnutt comprado por el usuario a @dreamsbell (derechos del usuario), feminizado y animado por script en `pieces/zero-fem` | propio |
| Voz (`digger01_megagirl_v2.mp4`) | perfil clonado **megagirl** (`baab32b2`) del usuario en VoiceStudio; v2: voz limpia (`retro_voice.py --preset genre --eq 0`: HPF 170 Hz + compresión + −14 LUFS); la v1 usaba `--preset digger` | propio (voz del usuario) |
| Voz versión B (`digger01_studio.mp4`) | perfil **Digger android (original)** (`5120fcba`), voz diseñada en VoiceStudio, no es clon de nadie | propio |

## Modelos 3D
| archivo | asset | autor | licencia | URL |
|---|---|---|---|---|
| `models/cc_sled.glb` | Winter Sled | **Jakers_H** | **CC BY 3.0 (crédito obligatorio)** | https://poly.pizza/m/cWKeLYaXdef |
| `models/cc_saw.glb` | Hand Saw (sierra de hielo) | CreativeTrio | CC0 1.0 | https://poly.pizza/m/rbZHkFchEk |
| `models/cc_tongs.glb` | Tongs (tenazas de hielo) | MilkAndBanana | CC0 1.0 | https://poly.pizza/m/zQfZF9oMga |
| `models/cc_bathtub.glb` | Bathtub | Quaternius | CC0 1.0 | https://poly.pizza/m/wrOzCX3k48 |
| `models/cc_bucket.glb` | Bucket (cubo de serrín) | Quaternius | CC0 1.0 | https://poly.pizza/m/83obI9bNun |
| `models/shovel.glb` | Shovel | Quaternius | CC0 1.0 | https://poly.pizza/m/oNBQSf87ZJ |
| `models/mailbox.glb` | Mailbox (repintado rojo óxido) | CreativeTrio | CC0 1.0 | https://poly.pizza/m/2olZ0G8iur |
| `models/cup.glb` | Cup (vaso del refrigerante, tintado) | Kenney | CC0 1.0 | https://poly.pizza/m/aSF8ANEIsX |
| `lib/models/red_car.glb`, `trashcan.glb` | relleno de fondo recoloreado (`skyblue`, `green`) de `pieces/lib-mml` | ripeo comunitario de Megaman Legends (Capcom) | sin licencia libre; el usuario decidió usarlo solo como relleno recoloreado (ver `lib-mml/README.md`) | — |

Los GLB de Poly Pizza se bajaron de `static.poly.pizza`, se importaron en el Blender vivo por el MCP (escena `digger_assets`; el addon del MCP es demasiado viejo para `import_asset` de Poly Pizza), se normalizaron a metros y se exportaron. Texturas ≤256 px, filtro Nearest en three.js. El grifo/alcachofa de la ducha, el icebox, la nevera en sección, el serpentín, el compresor, la carne, la carta, la caja de sobras, casas, vallas, farolas y pinos están hechos en código (`engine/shots.js`, `engine/film.js`).

## Texturas y tipografía
- Fuente bitmap 5x7 de los indicadores (`engine/pixfont.js`): dibujada a mano para este proyecto.
- Texturas de nieve, piedra, tablas, tejado, papel pintado, damero, hielo, serrín y frente de la nevera: generaciones propias con Google Flow (`engine/tex/flow`).
- Pixelify Sans (The Pixelify Sans Project Authors), SIL OFL 1.1 (`engine/fonts/OFL.txt`).

## Música
- **v3:** cama **original**, compuesta en código (`audio/scripts/music2.py`): bajo, pizzicato Karplus-Strong, marimba modal, caja de música y pad sintetizados. La batería usa one-shots **CC0** de Freesound: "Fractanimal_Acoustic_Drum_Kit_Kick_8.wav" de johnnydekk (https://freesound.org/s/581457/), "Hat-Bright.wav" de Brandao38 (https://freesound.org/s/504929/), "Shaker (shake2.wav)" de sgossner (https://freesound.org/s/375633/) y "SFX_SIMPLESNAPS_singles_05.wav" de MrFossy (https://freesound.org/s/589137/). Sin melodías de terceros. Libre para uso comercial.
- **v1/v2:** cama chiptune original en código (`music.py` + `chip.py`).

## Efectos de sonido
Grabaciones reales de Freesound, todas **CC0** (sin crédito obligatorio; se dan igual):

| uso | sonido | autor | URL |
|---|---|---|---|
| pala en la nieve | "Shovel - Sand/Gravel/Snow" | Bricklover | https://freesound.org/s/560957/ |
| pasos / nieve lanzada | "Footsteps_Snow_01.wav", "Footsteps_Snow_03.wav" | MarcMatthewsMusic | https://freesound.org/s/420549/ · https://freesound.org/s/420547/ |
| *clang* de la pala | "3 Basic Metal Clangs Free" | AardsReal | https://freesound.org/s/842170/ |
| carne en la nieve | "JM_IMPACT_01b - Snow on cement.wav" | Julien_Matthey | https://freesound.org/s/167081/ |
| sierra en el hielo | "Circular Saw 02 170501_1491.wav" | megashroom | https://freesound.org/s/390712/ |
| hielo que cruje | "Ice Crack 8.wav" | ecfike | https://freesound.org/s/177214/ |
| serrín | "sand pour on glass FF675.aif" | martinimeniscus | https://freesound.org/s/199361/ |
| puerta del cobertizo | "Wooden_Door_Creaking_02" | BlondPanda | https://freesound.org/s/778447/ |
| madera del icebox | "Creaking Wood 5.wav" | Greg_Surr | https://freesound.org/s/590156/ |
| agua / chapoteo | "Water + platsic bottle, sloshing 4" | giddster | https://freesound.org/s/386435/ |
| salpicadura | "water splash- small" | morganveilleux | https://freesound.org/s/390005/ |
| goteo | "Water Drip 01.wav" · "Water Drip" | erkanozan · spanrucker | https://freesound.org/s/51754/ · https://freesound.org/s/466559/ |
| buzón | "Old_Truck_Metal_Squeaks-Creaks-Rattle-Impact_Squeaky_Door_Hinge.wav" | dilsun | https://freesound.org/s/508281/ |
| hervor | "Boiling Water Without Lid.mp3" | emjaydabayou | https://freesound.org/s/539623/ |
| líquido en el tubo | "pouring_water_3.wav" | vibe_crc | https://freesound.org/s/51432/ |
| compresor (pistón) | "Air compressor - End run" | ldezem | https://freesound.org/s/386141/ |
| zumbido de nevera | "Large Refrigerator compressor hum 1" | FOSSarts | https://freesound.org/s/740110/ |
| crepitar cálido | "fire ambience, flames, crackles, pops, burning" | ahriik | https://freesound.org/s/508110/ |
| castañeteo | "bad teeth" | bjelicvuk | https://freesound.org/s/732995/ |
| viento de nieve | "swirling winter wind gusty grains sand.flac" | kyles | https://freesound.org/s/454213/ |
| pájaros de verano | "Ambient Summer Field French Mountain Birds- stereo" | Salomé Lubczanski | https://freesound.org/s/733782/ |
| tono de sala | "Soft Room Tone" | callmethefoo | https://freesound.org/s/744447/ |
| papel de la carta | "Page Turn (2)" | OwlStorm (vía sound-layer kit) | https://freesound.org/people/OwlStorm/sounds/151221 |
| *swish* de la disolvencia | "27.wav" | adcbicycle (vía sound-layer kit) | https://freesound.org/people/adcbicycle/sounds/14175 |
| bloque de hielo apoyado | "Thump; close.wav" | TylerAM (vía sound-layer kit) | https://freesound.org/people/TylerAM/sounds/389665 |

Blips de etiqueta, *stings*, pop del comentario, *ting* del guiño, pizzicato "sneaky", *boing*, "bleh", escaneo, *punch* de los punch-in, apagado CRT y jingle final: síntesis chiptune propia (`audio/scripts/mix.py`, `chip.py`).

## Texto para la descripción de TikTok (créditos obligatorios)
"Winter Sled" by Jakers_H (CC BY 3.0) via Poly Pizza. Music, voice and animation: original. Channel: MECHAYUKI (@mechayuki).

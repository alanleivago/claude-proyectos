---
type: doc
status: complete
tags: [digger, digger-02, credits, licencias, cc0, freesound, poly-pizza]
relatedTo: [digger-02-toilet, digger-01-fridge, digger-channel]
---
# Créditos — Digger 02: the toilet

## Personaje, voz y música
| qué | origen | licencia |
|---|---|---|
| Personaje `zero_fem` con 37 acciones. Las 5 nuevas de este episodio: `squat`, `pinch_nose`, `pull_chain`, `throw_out_window` y `bend_pipe` | modelo ZeroVolnutt comprado por el usuario (@dreamsbell), feminizado y animado por script en `pieces/zero-fem` | propio |
| Voz | perfil clonado **megagirl** (`baab32b2`) del usuario en VoiceStudio (OmniVoice), con la cadena limpia `retro_voice --preset genre --eq 0` | voz del usuario. El modelo OmniVoice es CC-BY-NC; el usuario no va a monetizar |
| Música (`audio/scripts/music3.py`) | composición original en código: Sol mayor, 108 BPM, bajo, pulsado Karplus-Strong, marimba, caja de música, pad y "fagot" del gag. La batería son one-shots CC0 de Freesound (los mismos del ep 01): johnnydekk 581457, Brandao38 504929, sgossner 375633 y MrFossy 589137 | original + CC0 |

## Modelos y relleno
| asset | autor | licencia | URL |
|---|---|---|---|
| Bed Single (cama de hierro), `engine/models/cc_bed.glb` | Quaternius | CC0 1.0 | https://poly.pizza/m/ianC28eMOF |
| Shovel | Quaternius | CC0 1.0 | https://poly.pizza/m/oNBQSf87ZJ |
| Mailbox (repintado rojo óxido) | CreativeTrio | CC0 1.0 | https://poly.pizza/m/2olZ0G8iur |
| Transeúntes `bank_teller` (navy), `homework_girl` (red) y `art_student` (teal); coche y papelera del pueblo | ripeo comunitario de Megaman Legends (`pieces/lib-mml`) | sin licencia libre. El usuario decidió usarlos solo como relleno recoloreado | — |

Hechos en código (`engine/film.js`): la letrina, el orinal, la ventana con postigos, la fachada, el váter de Harington (asiento, cisterna, palanca y cadena), el váter moderno, las tuberías, la cloaca, el sifón en S, el banco del relojero, el reloj y los engranajes. Las texturas son las de Flow del ep 01 más `dirt`, `brick` y `rubble`, y una textura de roble pintada en código. Fuente bitmap propia (`pixfont.js`) y Pixelify Sans (OFL).

## Efectos de sonido (Freesound, todos CC0)
| uso | sonido | autor | URL |
|---|---|---|---|
| cisterna | Old_Toilet_Flush | Pat_99 | https://freesound.org/s/451638/ |
| cadena | Light Metal Chain Shake | loganzsound | https://freesound.org/s/874471/ |
| agua del depósito | Storm Drain | RoofDog | https://freesound.org/s/79873/ |
| puerta de la letrina | Wooden_Door_Creaking_02 | BlondPanda | https://freesound.org/s/778447/ |
| tablas y golpes | Wood impact 1 | (usuario borrado) | https://freesound.org/s/325267/ |
| vuelco del orinal | WD-40 quarter… fall in plastic bucket | Sadiquecat | https://freesound.org/s/739913/ |
| postigos | B5_window-opening | Iamgiorgio | https://freesound.org/s/371296/ |
| porcelana | ceramicCups4 | kikuchiyo | https://freesound.org/s/214190/ |
| pasos en la calle | Walking footsteps on pavement | thomasanthony321 | https://freesound.org/s/682773/ |
| grillos de noche | crickets residential night suburbs6 short | kyles | https://freesound.org/s/451566/ |
| gallo | Rooster crow | jsbarrett | https://freesound.org/s/200339/ |
| borboteo de la cloaca | Bubbling | pillwave | https://freesound.org/s/423959/ |
| gas | Steam | SukritSen | https://freesound.org/s/398077/ |
| tubo que se dobla | Metallic groan long | Crinkem | https://freesound.org/s/481787/ |
| reloj | wristwatch-ticking | hannagreen | https://freesound.org/s/256213/ |
| agua que llena | Cistern Filling | The_Sean_ | https://freesound.org/s/340297/ |
| goteo | Water Drip 01 | erkanozan | https://freesound.org/s/51754/ |
| tono de sala | Soft Room Tone | callmethefoo | https://freesound.org/s/744447/ |
| moscas | Fly_Buzzing_Edited | AmberdeMeillon | https://freesound.org/s/443059/ |
| *splat* | Mud Splat | Breviceps | https://freesound.org/s/445109/ |
| reutilizados del ep 01 | pala 560957 (Bricklover), nieve 420549 (MarcMatthewsMusic), viento 454213 (kyles), buzón 508281 (dilsun), dientes 732995 (bjelicvuk), pájaros 733782 (Salomé Lubczanski) | — | ver `digger-01-fridge/CREDITS.md` |
| kit de sound-layer (CC0) | Page Turn (OwlStorm 151221) y swish (adcbicycle 14175) | — | — |

Blips, *stings*, pop del comentario, *bleh* de asco, *bonk*, contador, silbido de caída, ladrillos y *boing*: síntesis propia (`chip.py` y `mix2.py`).

**Crédito obligatorio en TikTok:** ninguno. Todo es CC0 o propio; este episodio no lleva assets CC-BY.

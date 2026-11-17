---
type: research
status: done
tags: [mechayuki, formato, outliers, tiktok]
relatedTo: [mechayuki-rules, propuesta-nicho, SINTESIS]
---

# Mechayuki: 3 formatos nuevos con datos (2026-11-14)

## Método y límites
- vidIQ: 0 créditos (se renuevan el 2026-11-24), así que no hubo datos de Instagram ni de YouTube Shorts.
- Apify `clockworks/tiktok-scraper`: 10 búsquedas de video en TikTok, ordenadas por MÁS GUSTADOS, de los ÚLTIMOS 3 MESES, 25 por búsqueda, 231 videos en total, unos $1,46. Después de eso la cuenta free de Apify quedó sin saldo en este ciclo, y el scrape de perfiles para sacar las medianas reales falló.
- Búsquedas: ps1 animation, low poly animation story, robot explains humans, android girl animation, ai robot pov, 3d animation part 1, retro 3d short story, guess the object animation, psx horror short, anime robot girl.
- Métricas [dato]: `v/f` = vistas ÷ seguidores, y `lk/avg` = likes del video ÷ likes promedio por video de la cuenta (corazones totales ÷ cantidad de videos). `lk/avg` es el sustituto del outlier ratio contra la media de la cuenta, no contra la mediana.
- Datos crudos: `tiktok_search_raw.json`. Ranking: `python -I rank.py tiktok_search_raw.json 0`.

## Formato 1: "Historia real de supervivencia o tragedia, Parte 1" en 3D
| Cuenta | Video | Vistas | Seguidores | v/f | lk/avg | Duración |
|---|---|---|---|---|---|---|
| @qvnlhl6y | The Boesmansgat tragedy part 1 (2026-10-18) | 13,3M | 47,3K | 281 | 17,5 | 176 s |
| @qvnlhl6y | The Eagle's Nest tragedies part 1 (2026-10-21) | 3,7M | 47,3K | 79 | 5,1 | 160 s |
| @qmzwdxst | Palau drift dive part 1 (2026-10-25) | 1,5M | 14,7K | 100 | 18,6 | 173 s |
| @hai.zhang515 | Two of America's top cave divers… part 1 | 1,9M | 84,2K | 23 | 0,8 | 180 s |
| @mingost3d | If you've become the president's son… (P1 0,8M → P2 0,5M) | 0,8M | 31,7K | 26 | 1,0 | 208 s |

- [dato] Usan el mismo pie de foto (`part 1#realstory #3d #foryou #fyp`), tienen cuentas jóvenes (39 a 47 videos) y duran entre 160 y 180 s. [inferencia] Es un estudio con varias cuentas, igual que los de la investigación de octubre.
- [inferencia] Funciona porque el tema es real y mortal (buceo en cuevas, la muerte de un buzo), con narración en segunda persona, la tensión subiendo y un corte en el clímax, y "Parte 2" en el perfil. La P1 se lleva la mayoría de las vistas, como muestra el caso de mingost.
- Mechayuki: ella encuentra una "caja negra" o la cámara de un buzo entre las ruinas y reproduce el último registro. Gancho: *"Operator… this camera kept recording after its owner stopped breathing."* Episodio: Boesmansgat 2004 (David Shaw), en dos partes.
- Costo: ALTO (×2–3). Lleva humanos, un set submarino o de cueva y 3 min en dos partes. Se podrían reutilizar los humanos zawdog.

## Formato 2: "¿Cómo funciona esto que ves todos los días?", con corte o rayos X en 3D
| Cuenta | Video | Vistas | Seguidores | v/f | lk/avg | Duración |
|---|---|---|---|---|---|---|
| @sherrirobinson65 | How Do You Drive a 50-Ton Steel Pile Into the Ground? | 13,4M | 28,8K (18 videos) | 465 | 15,5 | 114 s |
| @1hidden_by_design | Where Does the Water Go When Your Street Floods? | 9,9M | 54K (10 videos) | 184 | 5,1 | 75 s |
| @insidebodylab12 | What Happens Inside Your Body When You Eat Green Chili? | 7,8M | 76,8K (1 video) | 102 | — | 30 s |

- [dato] Las tres cuentas son nuevas, con 1 a 18 videos, y tienen outliers de más de 100× sus seguidores en octubre de 2026.
- Diferencia con lo que nos falló [inferencia]: es el PRESENTE y un MECANISMO, no la historia. La pregunta del título es la misma frase que el espectador ya se hizo ("¿adónde va el agua?"), y el cuerpo es un proceso visual satisfactorio: corte transversal, paso a paso, sin fechas ni inventores. El problema/solución histórico de cat.explains.it es justo lo contrario.
- Mechayuki: tiene visión de escáner. Hace zoom en un objeto o lugar y lo corta en capas. Gancho: *"You flush… and 6 liters vanish. Let me follow them."* Seguir el agua del inodoro hasta la planta de tratamiento.
- Costo: MEDIO (×1). Son sets mecánicos procedurales en three.js y no hacen falta humanos. Reutiliza el pipeline actual.

## Formato 3: Micro-POV de personaje androide (15–30 s, en serie)
| Cuenta | Video | Vistas | Seguidores | v/f | lk/avg | Duración |
|---|---|---|---|---|---|---|
| @cozy.techdreams | "update installed: two hands 👋👋" #androidgirl #reboot | 5,6M | 120,7K | 46 | **36,2** | 30 s |
| @youagain_sd | POV: she went so quiet you turned into a ghost (pareja animada con IA, en serie) | 7,8M | 477,9K | 16 | 20,8 | 19 s |
| @f1irstedit | AI robot learns about hypergamy | 1,9M | 6,9K | 273 | 131,8 | 17 s |
| @missmedannypsx | Chica anime low poly PSX, romcom por episodios ("He only came for sugar") | 0,4M | 12,4K | 28 | 6,1 | 66 s |

- [dato] Es el lk/avg más alto de la muestra fuera de los videos virales sueltos. "Android girl + update/reboot" aparece como hashtag de nicho.
- [inferencia] Funciona por la emoción del personaje y no por información: un texto en pantalla tipo POV, un beat cómico o tierno, loop corto y serie con el mismo personaje ("update 1, 2, 3…"). El androide que aprende algo humano (manos, llorar, frío) es un gancho emocional universal.
- Mechayuki: serie "Firmware updates". Gancho en texto: *"update installed: TASTE"*. Prueba su primera fresa, se le cuelga el sistema y aparece corazón.exe. Sin locución o con una línea, 20 s.
- Costo: BAJO (×0,3). Es un set, una acción y poca voz, así que se pueden sacar 3 a 5 por semana.
- Riesgo: el canal pasa de "explicar" a "personaje". @ayylmaotv tiene videos de 1M y 0,4M con el ángulo "las cuentas low poly usan IA en secreto", así que conviene mostrar que es hecho a mano (el making-of también rinde, ver @armaanimation, 1,9M con 10 videos).

## Recomendación
1. **Formato 3 (micro-POV con updates):** es el más barato y aprovecha al personaje, que hoy es el mayor activo. Sirve para probar 5 a 8 videos en 2 semanas.
2. **Formato 2 (cómo funciona, con escáner):** tiene los outliers más grandes en cuentas nuevas (100–465×) y el mismo costo que hoy. Hay que alternarlo con el 3.
3. **Formato 1 (historia real en partes):** es el techo más alto, pero cuesta mucho más. Conviene solo después de validar el 3 o el 2.

Pendiente: cuando vidIQ renueve créditos (2026-11-24), confirmar las medianas por perfil y buscar lo mismo en Reels y Shorts.

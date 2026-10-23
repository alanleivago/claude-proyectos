# apple-wayne — "You sold 10% of Apple for $800" (cartoon3d)

9:16, 30 fps, 46.0 s, English. Voz: la del usuario (`Ref 3D cartoon animations/voces/...mp3`), recortada con `styles/cartoon3d/tools/trim_voice.py` → `voice/voice.wav` + `voice/words.json` (164 palabras, 216 wpm, pausas fin de oración ≤ 0.22 s).

Estado: **borrador de tomas** (pendiente: método de assets con Flow del tutorial 07:05–11:38, look check, storyboard check).

## Reglas que aplica (STYLE cartoon3d / tutorial + refs medidas)
- Una cláusula = una toma; cambio de estímulo cada ~1.1 s; 25–30 tomas.
- Transiciones: disolvencia de 6 frames que arranca en la 1.ª palabra de la frase siguiente; casi sin cortes secos; vuelos de cámara continuos.
- Cámara siempre moviéndose (~90 % de frames): creep ~5 %/s, acelera hasta ~3.3 %/frame hacia la transición; arranques en el inicio de palabra; sin temblor.
- Caras: cambio por parpadeo (½ cerrado, cerrado, nueva) 2 frames antes de la palabra; cambio cada ~1.2 s; sin lip-sync; holds totalmente quietos.
- Gestos terminan 3–5 frames antes de su palabra; la cabeza sigue 2–4 frames después de la mano.
- Datos = objetos físicos (contador LED, cheque, calendario, gauge, pila de objetos), aterrizan en su palabra.
- Subtítulo de 1 palabra, blanco con contorno, ~71 % de la altura; caras fuera de la banda 66–76 %.
- Sets densos, nunca vacíos; DOF fuerte, glow en emisivos, viñeta, grano.

## Personajes
- **Tú / Ron Wayne (41, 1976)**: protagonista. Pelo oscuro, bigote, camisa de época (beige/mostaza), corbata ancha. Versión vieja (hoy) al final: pelo blanco.
- **Steve Jobs (21)**: pelo largo, barba rala, jeans. **Steve Wozniak (25)**: barba, lentes grandes.
- Dueño de tienda (Byte Shop) opcional.

## Tomas (tiempos de la voz recortada)
| # | t | cláusula | qué se ve | cámara | cara de Ron | dato-objeto |
|---|---|---|---|---|---|---|
| 1 | 0.00–1.30 | It's April 1976, | calendario de pared "APRIL 1976" en un garaje-taller 70s, lleno (bancos, placas, teléfono naranja) | push-in al calendario, hoja que cae | — | calendario: hoja cae a APRIL 1976 en "1976" |
| 2 | 1.30–3.62 | and you just signed the paper that starts Apple. | Ron en mesa de cocina con los dos Steves, firma con lapicera; papel "PARTNERSHIP AGREEMENT" | pull-back revela la mesa, orbit lento | concentrado → sonrisa en "starts" | firma que se escribe |
| 3 | 3.62–5.00 | You wrote that paper yourself. | máquina de escribir con el contrato saliendo, Ron tecleando | tracking lateral | orgulloso (smug) | — |
| 4 | 5.00–6.44 | You even drew the first logo, | mesa de dibujo con plumín, tintero, lámpara de brazo | top-down push-in | concentrado | — |
| 5 | 6.44–7.18 | Isaac Newton, | el dibujo: Newton sentado | ECU sobre el dibujo | — | — |
| 6 | 7.18–7.92 | under a tree. | el árbol con la manzana brillando, cae la manzana | tilt up | — | manzana con glow |
| 7 | 7.92–9.84 | Your partners are two guys named Steve, | Jobs y Woz entran en cuadro (Woz con placa, Jobs con teléfono) | pan entre los dos | Steves: entusiasmados | — |
| 8 | 9.84–10.62 | and at 41, | Ron con corbata y maletín entre ellos | push-in a Ron | neutral | contador de edad / torta con "41" |
| 9 | 10.62–12.20 | you're the only adult in the room. | Steves jugando (pelota de papel, pies en la mesa), Ron serio | pull-back | unimpressed | — |
| 10 | 12.20–13.22 | You own 10%. | gráfico de torta físico (pizza/torta) con una porción del 10 % que se separa hacia Ron | push-in | sonrisa | porción 10 % |
| 11 | 13.22–15.0 | Then Jobs borrows $15,000 | Jobs en el banco con el cajero, fajos | tracking | Jobs smug | contador LED rueda a $15,000 |
| 12 | 15.0–16.9 | to build computers | banco de trabajo con placas Apple I apiladas, soldador humeando | fly-through | — | pila de placas |
| 13 | 16.9–18.72 | for a store that's known for not paying its bills. | tienda "BYTE SHOP"; cajón de facturas impagas desbordando, dueño silbando | push-in a facturas | — | facturas con sello UNPAID |
| 14 | 18.88–20.16 | If it all goes wrong, | cielo oscurece, tormenta sobre el garaje | tilt | worried | — |
| 15 | 20.16–21.34 | the debt lands on you, | factura gigante cae sobre Ron (aplasta) | low angle | panic | factura gigante "$$$" |
| 16 | 21.34–23.40 | not on the two kids with nothing to lose. | Steves con bolsillos vacíos dados vuelta, polilla sale volando | pan | Steves: shrug | bolsillos vacíos |
| 17 | 23.40–24.88 | So 12 days in, | calendario de escritorio: 12 hojas vuelan | push-in | worried | calendario 1→12 |
| 18 | 24.88–27.00 | you sell your 10% back for $800. | Ron entrega la porción 10 %, recibe cheque | orbit | relieved/happy | cheque "$800" que aterriza en "$800" |
| 19 | 27.00–28.12 | Later, | reloj de pared gira rápido | push-in | — | reloj de agujas barre |
| 20 | 28.12–30.74 | they pay you $1,500 more to walk away for good. | segundo cheque; Ron sale por la puerta con caja de cartón | dolly out | smile | cheque "$1,500" |
| 21 | 30.74–31.20 | Today, | transición: calendario/hojas vuelan a 2026 | whip/vuelo | — | calendario 1976 → 2026 |
| 22 | 31.20–33.00 | Apple is worth about $5 trillion. | edificio-anillo moderno, contador LED gigante rodando | crane up | — | LED a $5,000,000,000,000 en "trillion" |
| 23 | 33.00–33.95 | On paper, | el contrato viejo en una vitrina | push-in | — | — |
| 24 | 33.95–35.89 | your 10% would be half a trillion. | barras apiladas de palés de dinero; el 10 % brilla | pull-back revela altura | — | pila de palés, gauge |
| 25 | 35.89–38.89 | That's like trading a winning lottery ticket for a used bike. | Ron cambia un billete de lotería dorado por una bici oxidada | orbit | happy (inocente) | billete con glow / bici |
| 26 | 38.89–40.07 | And here's the weird part. | Ron viejo (hoy) en mecedora en el porche | push-in lento | neutral | — |
| 27 | 40.07–42.33 | You say you don't regret it, not one bit, | Ron viejo sonríe, toma limonada | push-in | happy → smug "not one bit" | — |
| 28 | 42.33–44.75 | because to you, it was just a paper you signed. | foto vieja / el contrato en sus manos | ECU al papel | content | — |
| 29 | 44.75–46.00 | In April 1976, | zoom al papel → calendario APRIL 1976 (loop con la toma 1) | push-in que empalma con la 1 | — | calendario |

## Fuentes de los datos
- Ronald Wayne: cofundador, 1 abr 1976, 41 años, dibujó el primer logo (Newton bajo el árbol), redactó el contrato; vendió su 10 % por $800 a los 12 días; luego $1,500 para renunciar a reclamos — [Wikipedia](https://en.wikipedia.org/wiki/Ronald_Wayne), [Snopes](https://www.snopes.com/fact-check/third-apple-cofounder/), [Yahoo Finance](https://nz.finance.yahoo.com/news/investment-fail-why-apple-little-145551904.html).
- Apple ≈ $5 billones (trillion) en oct 2026 — [MacRumors](https://www.macrumors.com/2026/10/14/apple-5-trillion-close/), [StockAnalysis](https://stockanalysis.com/stocks/aapl/market-cap/). "Half a trillion" = 10 % sin dilución ("on paper").

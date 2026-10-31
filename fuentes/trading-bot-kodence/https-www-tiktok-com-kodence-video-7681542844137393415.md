# https://www.tiktok.com/@kodence/video/7681542844137393415

- Link: https://www.tiktok.com/@kodence/video/7681542844137393415
- Fecha: 2026-10-29
- Tema: trading-bot-kodence

## De qué trata
Es el primer reporte de un reto en el que el autor le dio 50 USD a un agente de IA (Codex) para que opere BTC en Hyperliquid durante 15 días. Muestra los primeros resultados: dos operaciones ganadoras y varias pérdidas pequeñas, con una cuenta que pasó de 50 a unos 77 USD. Va dirigido a quien siente curiosidad por los bots de trading con IA. Es un avance de serie, no un tutorial: no explica cómo se configura el bot ni la estrategia.

## Pasos / método
1. **[00:00]** Se le entregan 50 USD a Codex para que opere de forma autónoma durante 15 días, y el autor se limita a observar.
2. **[00:16]** Se abre el historial de operaciones (Trade History) en Hyperliquid, par BTC, para revisar qué hizo el agente.
3. **[00:20]** Se revisan las primeras operaciones, que fueron pérdidas pequeñas (centavos y cerca de 1 USD en total).
4. **[00:29]** Se identifican las dos ganadoras (≈19 y ≈10 USD, unos 29 en total) y se descuentan comisiones y pérdidas iniciales para estimar la ganancia neta, unos 27 USD.
5. **[00:41]** Se confirma el saldo en el resumen de la cuenta (Unified Account Summary): cerca de 77 USD.
6. **[00:47]** Se mira la terminal de Codex, que sigue monitoreando el mercado y la gráfica en bucle y reporta cada ciclo.
7. **[00:57]** Se verifica que Codex colocó una nueva orden BTC y espera a que se active, contrastándola con el gráfico de Hyperliquid.
8. **[01:07]** El autor menciona que el agente lleva casi 15 horas trabajando sin parar y que la serie continuará.

## Lo que se ve en pantalla
- **[00:10]** Mensaje de "Heartbeat verificado" de Codex, con BTC ≈ 78.899,50, PnL abierto +12,84 y valor aproximado 60,82. La posición LONG era de 0,01255 BTC, con una parcial en 79.959 y un stop en 77.166. El mensaje dice "Bot sano; posición y órdenes exactas". En el gráfico, el PnL ronda +11,64 (+47,7 % ROE), con precio de liquidación 74.978.
- **[00:22–00:34]** Closed PNL en Trade History: 10,12; 19,49; −0,01; −0,41; −1,78; −0,24; −0,20; 0,28; −0,31 USDC. Las comisiones por operación van de 0,11 a 0,43 USDC.
- **[00:26]** Tamaños de las operaciones: de 0,00023 a 0,01287 BTC, con valores nocionales de unos 17,92 a 1.001,98 USDC.
- **[00:42]** Unified Account Summary: Portfolio Value 77,57 USD, Unrealized PNL 0, Maintenance Margin 0, Leverage 0,00x (sin posición abierta en ese momento). Comisiones mostradas: 0,0432 % / 0,0144 %.
- **[00:48–00:54]** Terminal de Codex con modelo "5.6 Sol Extra High". Los reportes repiten "estable: $77.571896, orden BTC 535570113743 pendiente, sin posición y sin alertas". Dice que verifica parámetros, daemon y correspondencia con Hyperliquid, y corre scripts Python desde `.venv`. Meta activa ("Pursuing goal") con unas 14 h 48 m de ejecución.
- **[00:56–00:58]** Nueva orden BTC verificada: entrada 82.268, tamaño 0,0132 BTC, stop previsto 81.521, objetivo parcial 84.508, saldo 77,571896. Sin posición abierta, daemon estable.
- **[00:48]** En el panel derecho, gráfico BTC-USDC de 5 min en Hyperliquid y una lista de fills del 3/9/2026.
- **[01:16–01:32]** Gráfico de BTC con una línea horizontal de orden pendiente y marcadores de operaciones anteriores; precio cercano a 80.9xx.

## Consejos y advertencias
- **[01:13]** El autor mantiene "bajas expectativas" pese al buen arranque: es solo un día de resultados.
- **[00:20]** Algunas operaciones perdedoras iniciales no se entienden ni el autor sabe qué buscaba el agente, lo que sugiere revisar la lógica del bot.
- **[00:29]** Las comisiones se comen parte del beneficio (29 USD brutos pasan a 27 netos), importante en bots que operan seguido.
- **[00:10]** Se aprecia que el agente usa stop, parcial y liquidación lejana. Aun así, apalancar con una cuenta pequeña implica riesgo.

## Lo que no queda claro
- No se explica cómo se configuró Codex, el prompt o meta, la estrategia, el apalancamiento, ni cómo se conecta a Hyperliquid (API, daemon, claves).
- El autor dice que ganó 27 USD y que ya tiene 77 USD, pero el saldo mostrado es 77,57 y las cifras de PnL suman otros valores. Habría que verificar el cálculo con el historial completo.
- Los textos de Codex mezclan fechas (3/9/2026) y precios (≈78.900 frente a ≈80.900 y entrada en 82.268). No es seguro que todo sea del mismo momento.
- No se aclara si el agente puede perder el capital ni qué límites de riesgo tiene fijados.
- El nombre del tema "kodence" probablemente se refiere a Codex; no se confirma.

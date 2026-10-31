# https://www.tiktok.com/@kodence/video/7683047598973832466

- Link: https://www.tiktok.com/@kodence/video/7683047598973832466
- Fecha: 2026-10-29
- Tema: trading-bot-kodence

## De qué trata
El video muestra una operación de trading en vivo que un agente de IA (Codex, según el autor, con GPT-5.6 visible en la interfaz) abrió y administra por su cuenta en Hyperliquid. Es un short de BTC, con ganancia flotante de unos 11-12 dólares. Forma parte de una serie en la que se sigue durante 15 días qué logra hacer Codex con una cuenta pequeña. Está pensado para quien quiera ver cómo se comporta un bot de trading con IA, sin que se enseñe a replicarlo paso a paso.

## Pasos / método
1. **[00:00]** La IA abre una nueva operación: un short (venta) de BTC en el par BTC-USDC de Hyperliquid, y va ganando.
2. **[00:06]** Se revisa la posición: precio de entrada 79.017, precio de marca ~78.610, PNL de +12,51 USD (+20,6% ROE), liquidación en 79.956 y margen aislado de ~72 USD.
3. **[00:15]** El agente administra la operación y la revisa de forma continua desde su ventana de trabajo (panel izquierdo).
4. **[00:18]** El agente deja la posición correr con el stop protector sin tocarlo y solo vigila. Si no hay novedades, la decisión es esperar.
5. **[00:20]** Define hitos de "ratchet" (78.450, 78.170 y 77.890) para evaluar, si el precio los alcanza, un ajuste del stop basado en evidencia. La vigilancia es solo de lectura.
6. **[00:20]** Un monitor llamado "Hyperliquid BTC short guard" se ejecuta cada 10 minutos para detectar esos hitos o anomalías.
7. **[00:50]** Se muestra un resumen verificado de la operación: short de 0,03074 BTC a 79.017, stop activo y sin otras posiciones u órdenes. Luego el agente vuelve a evaluar el corto con datos actuales.
8. **[00:48]** El autor resalta que la vigilancia automática sigue cada 10 minutos.
9. **[00:59]** Cierre: se verá al día siguiente si la operación se cierra o cómo evoluciona, dentro de la serie de 15 días.

## Lo que se ve en pantalla
- **[00:00]** Plataforma Hyperliquid con el par BTC-USDC, gráfico de velas, libro de órdenes, panel de operación a la derecha y el chat de Codex a la izquierda. Título superpuesto: "¡Nueva operación!".
- **[00:06]** Posición: entrada 79.017, marca 78.610, PNL +12,51 USD (+20,6%), liquidación 79.956, margen 72,09 USD (aislado), tamaño 0,03074 BTC y apalancamiento 40x (visible en [00:18]).
- **[00:10]** PNL ligeramente menor: +12,45 USD (+20,5%) con marca 78.612.
- **[00:18]** El agente indica que sigue estable, sin alarmas, con la protección original, y que el stop sigue como salida automática prevista. Modelo mostrado: "GPT-5.6 Sol Medium", con una meta activa ("Pursuing goal") de más de 59 min.
- **[00:20]** Stop reduce-only en 79.300; la posición abierta en 78.799,5 con +6,67 USD; primer hito de ratchet 78.450 aún sin alcanzar; el monitor corre "Every 10 minutes".
- **[00:22]** Hitos favorables listados: 78.450, 78.170, 77.890.
- **[00:50]** Resumen verificado: precio de ejecución 78.689,5, ganancia flotante +10,05 USD, stop 79.300 reduce-only con OID 538968024681, liquidación 79.955,68, equity 69,63 USD, sin otras posiciones ni órdenes. La operación empezó hacia las 11:38 PM.
- **[00:52]** El agente "planea una inspección autoritativa de la API" para reconfirmar la posición y el stop antes de decidir ajustes.

## Consejos y advertencias
- **[00:33]** El autor aclara que no sabe si ganará o perderá. Es una operación abierta y el resultado final es incierto.
- **[00:37]** Menciona que muchos decían que la IA solo ganaba con el mercado subiendo, y aquí gana con el mercado bajando, con un short.
- **[00:18]** El agente se limita a no sobreoperar y mantener el stop protector. Es buena práctica dejar una orden de protección reduce-only.
- **[00:06]** Con 40x de apalancamiento, el precio de liquidación (79.956) queda muy cerca de la entrada (79.017) y del stop (79.300): el riesgo es alto aunque el margen sea pequeño.

## Lo que no queda claro
- No se explica cómo se configuró Codex (prompts, permisos de API, código del monitor "short guard"), así que no se puede replicar solo con este video.
- No se detalla por qué el agente decidió abrir el short en ese punto ni la lógica de entrada.
- No se aclara el tamaño inicial de la cuenta de la serie ni la regla de 15 días más allá de lo dicho.
- El nombre "Codex" y el modelo "GPT-5.6 Sol" son lo que muestra la pantalla; conviene verificar qué herramienta es exactamente.
- La diferencia entre las ganancias mostradas (+12,51 vs +10,05 vs +6,67) se debe a que se tomaron en momentos distintos del movimiento del precio.

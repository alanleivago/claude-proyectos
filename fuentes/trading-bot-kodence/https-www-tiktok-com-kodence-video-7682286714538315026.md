# https://www.tiktok.com/@kodence/video/7682286714538315026

- Link: https://www.tiktok.com/@kodence/video/7682286714538315026
- Fecha: 2026-10-29
- Tema: trading-bot-kodence

## De qué trata
Es un video de respuestas a preguntas de comentarios sobre un experimento: se le dieron 50 USD a Codex (IA de OpenAI) para que opere de forma autónoma durante 15 días. Codex desarrolló un bot de trading que opera en Hyperliquid vía API, y Codex supervisa al bot. Va dirigido a quienes siguen el experimento y quieren saber cómo es posible que Codex trabaje sin parar, cuánto cuesta y si el autor vende algo. Resultado: la cuenta bajó de unos 77 a 62,87 USD, y el autor aclara que el canal trata de IA, no de trading.

## Pasos / método
1. **[00:00]** Se plantea el experimento: darle 50 USD a Codex para que haga algo con ellos durante 15 días y medir su autonomía operativa.
2. **[00:09]** Estado previo: la cuenta había llegado a ganar unos 27 USD, antes de la pérdida reciente.
3. **[00:18]** Se revisa el balance: Codex perdió más de 12 USD, y la cuenta pasó de 77 (día anterior) a 62 USD.
4. **[00:28]** Para que Codex no pare de trabajar se usa el comando de objetivo (`/goal`): se define una meta y Codex sigue trabajando hasta cumplirla.
5. **[00:46]** Sobre el límite de uso: con el plan Pro (100 o 200 USD/mes) no hay límite de 5 horas, solo uno semanal. El autor usa el de 200 USD.
6. **[01:07]** Funcionamiento: Codex espera que se active una orden colocada, monitorea de forma constante, y gestiona un bot de trading que él mismo programó para operar en Hyperliquid por API. El bot ejecuta las operaciones y Codex lo administra.
7. **[01:27]** Aclaración de propósito: no vende bots ni señales; el experimento es solo para probar la IA.

## Lo que se ve en pantalla
- **[00:00]** Comentarios de TikTok: límite de 5 horas, gasto en tokens, costo de mantenerlo activo y cómo se hace.
- **[00:02]–[00:15]** Plataforma Hyperliquid, gráfico de BTC (~79.500 USD), pestaña "Trade History" con operaciones BTC de Open/Close Long y Short, tamaños de ~0,01 BTC (valores de ~700–900 USDC) y comisiones de ~0,2–0,4 USDC.
- **[00:18]–[00:20]** Columna "Closed PNL": -12,22; -0,36; -1,51; -0,37; 0,14; -0,39; 10,12; 19,49; -0,01; -0,41; -1,78; -0,24; -0,20; 0,28 USDC.
- **[00:22]** "Unified Account Summary": Portfolio Value 62,87 USD, Unrealized PNL 0, leverage 0,00x (sin posiciones abiertas). Comisiones mostradas: 0,0432% / 0,0144%.
- **[00:27]–[00:33]** Interfaz de Codex con el modelo "GPT-5.6 Sol Extra High", mensajes en español tipo "sin cambio material, short pendiente, daemon sano". Se ve un proceso local ("daemon"/guard) y un banner "Pursuing goal" (~20 min). Al escribir `/goal` aparece "Set a goal to keep pursuing".
- **[00:51]–[00:58]** Menú de cuenta de Codex: plan "Pro", Usage "19% left" (restante del límite semanal).
- **[01:12]–[01:16]** Registros de Codex: verificó un intervalo de 10 min sin fills ni halts; mantiene la espera con lectura local sin agregar tráfico de API hasta que haya un evento nuevo.
- **[01:07]–[02:12]** Gráfico con marcadores de entradas/salidas; el precio de BTC baja levemente a ~79.450–79.490.

## Consejos y advertencias
- **[00:46]** No existe límite de 5 horas en el plan Pro; solo el semanal (según el autor).
- **[01:27]** No compres un "bot de trading" ni señales de este canal: el autor dice explícitamente que no los vende.
- **[01:53]** El experimento puede perder los 50 USD; es aceptado, ya que el fin es probar la autonomía de la IA, no ganar dinero. (Implícito: no copiar esto como estrategia de inversión.)
- **[00:12]–[00:18]** Las ganancias previas se pueden revertir rápido (de +27 a pérdida de 12 en poco tiempo).

## Lo que no queda claro
- No explica el costo real en tokens ni cuánto cuesta mantenerlo activo más allá del plan de 200 USD/mes; preguntas de los comentarios que quedan sin respuesta cuantitativa.
- No muestra cómo se crea el bot, qué estrategia usa, ni el prompt/objetivo exacto dado a Codex; tampoco el paso a paso de "cómo se hace".
- Las cifras (de 77 a 62 USD, "más de 12 USD" de pérdida) no cuadran del todo con los 50 USD iniciales y la ganancia de 27; conviene verificarlo.
- El nombre del modelo "GPT-5.6 Sol" y las funciones como `/goal` aparecen solo en pantalla; habría que comprobar su disponibilidad.
- El tema "kodence" del título se interpreta como Codex; no se menciona con ese nombre.

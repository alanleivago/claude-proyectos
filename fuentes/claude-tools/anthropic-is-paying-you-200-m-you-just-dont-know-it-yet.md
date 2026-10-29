# Anthropic is Paying You $200/m You Just Don’t Know It Yet!

- Link: https://www.youtube.com/watch?v=So5aYkdIIVM
- Canal: Charlie Automates
- Fecha: 2026-10-28
- Tema: claude-tools

## De qué trata
El video explica cómo aprovechar los $200 mensuales en créditos de API que, según el autor, incluye el plan Claude Max, y que expiran si no se usan. Presenta tres estrategias por nivel (principiante, intermedio y avanzado) para gastarlos en automatizaciones, agentes y apps propias. Está pensado para quien ya paga Claude Max y quiere sacarle valor a esos créditos sin costo extra.

## Pasos / método
1. **[00:13]** Tener presente que los créditos no se acumulan: si no se usan en el mes, se pierden. Por eso conviene gastarlos antes de que termine.
2. **[00:25]** Saber que usar Claude Code de forma normal no consume estos créditos, porque corre con los límites del plan.
3. **[00:32]** **Estrategia 1 (principiante, n8n):** en la app de Claude, ir a Settings y vincular los créditos gratuitos con la Claude Console.
4. **[00:39]** En la Claude Console, generar una API key y pegarla en las credenciales de Anthropic dentro de n8n.
5. **[00:43]** Construir el workflow (el autor usa Claude Code y el AI builder de n8n). Cada paso del workflow corre con los créditos gratuitos.
6. **[00:48]** Usarlo para tareas que corren 24/7: seguimiento de leads, clasificación de bandeja de entrada o reutilización de contenido.
7. **[00:55]** **Estrategia 2 (intermedia, Managed Agents):** crear agentes administrados dentro de la Claude Console.
8. **[01:02]** Entender la diferencia: el workflow de n8n hace exactamente lo que se le cableó, mientras que el agente lee la situación y decide por su cuenta.
9. **[01:11]** Tomar cualquier skill ya creada y cargarla en un Managed Agent, que corre en la nube 24/7 aunque la computadora esté apagada.
10. **[01:30]** **Estrategia 3 (avanzada, apps propias):** conectar la API directamente en aplicaciones a medida. Según el autor, ahí se va la mayor parte de sus créditos.
11. **[01:41]** Ejemplo: un dashboard para un cliente que automatiza la configuración de campañas y las envía a Meta Ads con un botón.
12. **[01:53]** Agregar un motor que revisa SOPs y KPIs del cliente y da feedback sobre el rendimiento de las campañas frente a datos previos.
13. **[02:09]** Elegir el nivel y empezar a gastar los créditos antes de fin de mes.

## Lo que se ve en pantalla
- **[00:02]** Mensaje de Claude Code: "Your Max plan includes $200 a month in API credits to power your apps and agents".
- **[00:34]** Settings › Billing en la app de Claude: sección "API credits" con la organización individual vinculada ("Linked"), "Monthly credit $200" y "Next credit Nov 5, 2026".
- **[00:39]** Claude Console › Dashboard: "Organization credits $205.47", con botones "Get API key", "Build an agent" y "Add funds".
- **[00:41]** n8n › Credentials: cuenta "Anthropic account" con el campo "API Key".
- **[00:46]** n8n AI builder con el prompt: construir una secuencia de seguimiento de leads para adjuntar a Go High Level usando un nodo AI agent. Aparece una insignia "6x".
- **[00:48]** Workflow "GHL AI Lead Follow-up Sequence": GHL Lead Webhook → Lead Follow-up Agent → Respond to GHL. El agente usa el modelo Claude Sonnet, las herramientas get_contact y create_followup_task, y un Output Parser.
- **[00:53]** Nodo Claude en n8n: credencial "Anthropic account", modelo "Claude Sonnet 5" (elegido desde lista) y máximo de tokens 1500.
- **[00:57]** Claude Console › Agents: lista con Contract tracker (claude-opus-5-5), carousel-pro, Inbound Intel Pro, Proposal Pro, Client Health Pro y Content Opportunit… (la mayoría con claude-sonnet-4-…).
- **[01:16]** Agente "Proposal Pro": genera propuestas a partir de la transcripción de una llamada de descubrimiento. Tiene un campo de system prompt y un botón "Start session". Muestra la etiqueta "runs in the cloud 24/7".
- **[01:02–01:09]** Comparación: el workflow de n8n sigue Trigger → AI step → Action. El Managed Agent lee, decide, actúa y verifica, y puede responder, preguntar o escalar.
- **[01:11]** Archivo SKILL.md que se carga en el Managed Agent.
- **[01:23–01:27]** Gráfico de barras: el agente requiere más setup y tiene más autonomía que n8n. Con las trabas, n8n queda "stuck" y el agente "handled".
- **[01:37]** Código de app.js: `import Anthropic from "@anthropic-ai/sdk"`, `const client = new Anthropic()` y `await client.messages.create({ model: "claude-...", messages: [...] })`.
- **[01:41]** Client dashboard › Onboarding, con el botón "New client invite" y datos de clientes desde ClickUp.
- **[01:46]** Client dashboard › Campaign: "Copy: 5 primary texts and 5 headlines", validados contra una lista de "do-not-say" del SOP 05.01, con botones "send to Meta Ads" y "push to Meta".
- **[01:53]** Engine › Automation level con tres modos: Observe (solo escribe lo que haría, sin enviar nada a Meta), Review (por defecto; cada cambio es una tarjeta que debe aprobar una persona) y Autopilot (pausas y cambios de presupuesto automáticos dentro de límites).
- **[01:55]** Inbox del dashboard: propuesta de pausar una campaña con la regla "runaway" (gasto de 3 días ≥ $225, o 3x un máximo de $75, con 0 llamadas agendadas; real: $772), con botones Approve y Deny.
- **[02:11]** Llamado final: comentar "API" para recibir el playbook de 3 estrategias.

## Consejos y advertencias
- **[00:13]** Los créditos no se transfieren al mes siguiente: usarlos o perderlos.
- **[00:25]** Claude Code normal no gasta los créditos de API; sigue usando los límites del plan. Para gastarlos hay que pasar por la API (n8n, agentes o apps propias).
- **[01:18]** Los workflows de n8n y los Managed Agents siguen corriendo con la computadora apagada.
- **[01:23]** Los agentes requieren más configuración que n8n, pero son más autónomos y resuelven casos donde un workflow rígido se traba.
- **[01:55]** El motor de campañas deja la decisión final en manos de una persona (modo Review con Approve/Deny).
- **[02:04]** En el ejemplo del cliente, el autor dice que no paga nada extra porque usa los créditos de API del plan Max del propio cliente.

## Lo que no queda claro
- No se muestra el paso exacto en Settings para vincular los créditos, ni qué plan o condiciones se requieren. Habría que verificar en la cuenta propia que el beneficio de $200/mes exista y cómo se activa.
- Los nombres de modelos en pantalla (por ejemplo "Claude Sonnet 5", "claude-opus-5-5") no se pueden confirmar con el video; conviene revisar los modelos disponibles en la propia Console.
- No se explica cómo crear un Managed Agent paso a paso, ni cómo cargar la skill, ni cómo construir el dashboard y el motor de SOPs/KPIs. El detalle completo queda en el "playbook" que se obtiene comentando "API".
- Se dice que se usan los créditos del cliente en su propio plan Max, pero no se aclara cómo se gestiona esa cuenta ni la API key del cliente.

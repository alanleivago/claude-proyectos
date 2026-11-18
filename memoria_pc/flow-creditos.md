---
name: flow-creditos
description: Llevar la cuenta de créditos de Flow (Omni Flash) por clip y parar en el límite que diga el usuario
metadata:
  node_type: memory
  type: feedback
  originSessionId: 50c3c1ee-af27-4bdd-ab17-c508335a8f8f
  modified: 2026-11-14T17:16:30.762Z
---

El usuario pide llevar la cuenta de cada clip generado en Flow y de los créditos gastados, y no pasar nunca el límite que fije (2026-11-14: 11.400 créditos, cuenta correoderecuperacion496).

**Cómo está hecho:** `tools/srzGoogleFlowMCP/srzGoogleFlowMCP/src/cli.js` (comando `video`) lee y escribe `pieces/_creditos.json` ({limite, costo 10, gastado, clips, fallidos}). Suma 10 por cada clip que sale; si el siguiente pasaría el límite, imprime "LIMITE DE CREDITOS" y sale con código 3. clips.py (plata-taxco, invernadero-atlixco y las plantillas nuevas) termina con "FIN por limite de creditos" al ver ese texto. Para una tanda nueva: cambiar `limite` y poner `gastado` a 0.

**Why:** se quedaron sin créditos dos cuentas a mitad de tanda; quiere controlar el gasto. Pidió explícitamente que llevar la cuenta NO gaste muchos tokens: "solo lleva la cuenta normal".

**How to apply:** no vigilar el contador clip a clip; solo leerlo al reportar un render o al terminar la tanda (1 línea: gastado/límite). Ver [[flow-mcp-only]], [[flow-generacion-rapida]].


**2026-11-16 — cuenta nueva monetizadotiktok18@gmail.com (ACTIVA, default en chrome.js):** gastar TODOS sus créditos (sin límite; parar cuando Flow diga que no hay). Su cuenta va APARTE en pieces/_creditos_monetizadotiktok18.json (cli.js elige archivo por cuenta). correoderecuperacion496 queda en _creditos.json (11.230/11.400) y NO se usa hasta agotar monetizadotiktok18.

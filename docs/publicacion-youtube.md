---
type: doc
status: active
tags: [youtube, publicacion, adspower, vpn, router, digitel]
relatedTo: [tools/olax.py, CLAUDE.md]
---

# Publicar en los canales de YouTube con Claude

Plan acordado el 2026-11-18 para que Claude publique los videos en los canales sin que ninguna conexión equivocada toque los navegadores donde viven.

## Reglas absolutas (Mac y PC)

1. **Ningún navegador con un canal sale por la VPN** (Surfshark) ni por una IP que no le corresponde. Si eso pasa, el canal puede quedar marcado.
2. **Claude verifica la IP de salida desde el mismo camino que usa el navegador del canal**, antes de abrirlo y cada pocos segundos mientras está abierto. Si no es la esperada, no abre o cierra al instante.
3. La subida se hace **dentro del navegador del canal** (como una persona), nunca con la YouTube Data API desde otro lado: esa saldría por la IP de la máquina.
4. Antes de publicar: título, descripción y miniatura listos; confirmar con el usuario cada publicación.
5. WebRTC en "reemplazar/desactivado" y geolocalización "según la IP" en cada navegador de canal (para que no se filtren IPs reales ni se use el escaneo de wifis cercanos).

## Mac (AdsPower + SIM Digitel)

- Cada perfil de AdsPower = un canal venezolano; cada vez que se entra a un perfil debe tener **una IP de Digitel nueva**, nunca usada por otro perfil. **Jamás la fibra Network Speed dentro de un perfil.** Con la fibra solo se puede abrir el perfil EXPERIMENTOS.
- Red (pendiente del 2º adaptador USB-C → Ethernet):
  - Módem de fibra (ONT, ya da DHCP) → adaptador nuevo → Mac. Es la ruta por defecto: chat, Claude, VPN.
  - Router Olax AX8 Pro → adaptador actual → Mac, **solo con la SIM Digitel** (sin la fibra conectada al Olax: así nunca puede pasarse a la fibra).
  - Proxy local atado a la interfaz del Olax; los perfiles de AdsPower usan ese proxy. Si Digitel se cae, el perfil queda sin internet.
- Router: `tools/olax.py` (API `/hbapi-json` del panel; login challenge + md5). Funciones útiles: `mobile_setbandlock`, `mobile_setnetmode`, `router at_send/at_recv` (comandos AT al módem, p. ej. modo avión `AT+CFUN=0` / `AT+CFUN=1` para IP nueva), `system_getnetoverview`, `system_getdatainfo`. Credenciales en `.env` (`ROUTER_URL`, `ROUTER_USER`, `ROUTER_PASS`).
- AdsPower: API local `local.adspower.net:50325` con `ADSPOWER_API_KEY` del `.env`. **No usar el MCP de AdsPower para abrir perfiles**: solo la API a través del programa con la guardia (`tools/perfiles.py`, por construir):
  1. Pasar el Olax a Digitel, modo avión on/off → IP nueva.
  2. Verificar por el proxy: IP de Digitel (ASN/organización) + nunca usada (registro por perfil).
  3. Abrir el perfil, subir el video vía CDP (Puppeteer/Playwright conectado al navegador del perfil), vigilando la IP; cerrar si cambia.
  4. Cerrar el perfil.
- Ojo: cada subida gasta datos de la SIM (30 GB).

## PC (sin AdsPower ni router)

Los canales están en navegadores normales de la PC y la VPN se usa para hablar con Claude. Objetivo: Claude publica en esos canales **sin que la VPN toque esos navegadores**.

Pasos para la sesión de la PC:
1. Identificar en qué navegador/perfil está cada canal y qué conexión (IP) le corresponde a cada uno; anotarlo (sin datos personales en el repo si es público).
2. Sacar esos navegadores de la VPN:
   - Surfshark tiene **Bypasser** (túnel dividido): agregar el ejecutable del navegador de los canales (p. ej. una instalación de Chrome/Edge aparte, o Chrome con `--user-data-dir` propio) para que vaya **fuera** de la VPN.
   - Mejor aún: usar para los canales un navegador distinto al que se usa para Claude, así la regla de bypass es por programa.
3. Guardia antes de abrir: comprobar la IP de salida **desde ese mismo navegador** (abrir una página de IP en él vía CDP) y compararla con la IP esperada del canal; si sale la de la VPN, no publicar.
4. Abrir el navegador del canal con depuración remota (`--remote-debugging-port`) y subir el video vía CDP dentro de él.
5. Probar primero con un canal de prueba y la VPN encendida, comprobando que la IP vista por el navegador NO es la de Surfshark.

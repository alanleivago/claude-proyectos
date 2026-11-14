---
type: spec
status: draft
tags: [zombie-channel, ava-restfield, radio, short, brief, re-easter-eggs]
relatedTo: [zombie-channel, ava-rules, zombie-11-xvirus]
---

# Ep12 "AVA: The Radio" — brief

Short 9:16, 62.0 s (voz termina 59.2 s), ingles, segunda persona. Plan aprobado: PLAN.md. Base: copia de zombie-11-xvirus (engine, voz, audio/scripts).

## Estado
- ENTREGADO v1 (2026-11-08): `renders/share.mp4` = `renders/zombie12_radio_v1.mp4`, 62.0 s, -14.0 LUFS, TP -1.4 dBTP. 2 rondas API (`renders/zombie12_radio_v1_round1_revision.md`, `renders/zombie12_radio_v1_revision.md`). Sin Telegram (lo envia el coordinador).
- Ronda 1: manivela sin losa negra, cable en curva, hueco pasos 2,4 -> 1,9 s, final sin deriva (unbreathe en sitPose), OTHER EAR fuera de la cara, NEWS antes, brillo del telefono. Ronda 2: menu WHAT DO YOU DO?, silueta negra nitida (vidrio W1 casi transparente en 08b, luna detras de la cabeza), SPEAKER OFF fuera del subtitulo, NEWS ON en caja.
- Motor: `engine/sets/radio.js` (casa del ep10/ep11 de noche + planos nuevos), `sets/radioprops.js` (radio a manivela, maceta de hierba, libreta, silueta del sombrero, maquina de escribir + cinta), `sets/screens12.js` (ITEM radio, diagrama dia/noche, puerta de carga).
- Voz: f2a102da steps 32 wav, 8 semillas por toma (`voz/pick.txt`, elegidas a mano en `voz/pick_manual.json`); radio = b0469a54 con filtro de banda + saturacion en `voz/assemble.py`. "Oh, fudge" = toma del ep1.
- Storyboard APROBADO (2026-11-08) con fixes: silueta cerca de la ventana W1 (agrandada a 1,3 x 1,95 m) contra una luna grande, se detiene de cara a la casa; nevera con encuadre mas abierto y nota mas grande, sello abajo; manivela en el plano sagital vista desde la derecha; puerta de carga clasica 1,75 s; reloj mas grande y camara mas cerca; cable grueso; antena plegada en 08/10; hoja de la maquina entera; SAVE BATTERIES grande.
- Audio: `audio/scripts/mix12.py` (SFX Freesound CC0 elegidos con earshot rank, ver audio/CREDITS.json). -14.0 LUFS, pico -1.5 dBFS; musica 10-12 LU bajo la voz por tramo; radio -3,5 dB.

## Datos
- Radio a pilas o manivela en el kit de emergencia: Ready.gov / FEMA "Build a Kit", NOAA Weather Radio.
- AM de noche por onda de cielo (ionosfera) llega a cientos de millas; de dia mucho menos: FCC "AM Broadcast Station Classes; Clear, Regional, and Local Channels" / "Why AM radio stations must reduce power at night".

- v2 (usuario, 2026-11-08): `renders/zombie12_radio_v2.mp4` = share.mp4. Telefono con la pantalla hacia sus ojos (dorso 3/4 a camara); manivela con IK de dos huesos a 30 fps (circulo exacto, sin temblor); puerta de carga iluminada (luz suave + resplandor en la abertura); hombre del sombrero 3D (ala + copa, hombros, faldon que se abre, brazos/piernas articulados, borde de luna fresnel); maquina de escribir nueva (base con patas, teclado escalonado, teclas redondas) apoyada en la tapa real de la mesita; final: Ava de pie cuerpo entero bajo el menu mirando a la ventana; diagrama sin banda vacia (dial siempre + dato abajo); Ava se inclina hacia la radio en 08. Mismo audio (sin cambio de tiempos).
- v3 (usuario, 2026-11-08): `renders/zombie12_radio_v3.mp4` = share.mp4, 62.0 s, -14.0 LUFS. Puerta de carga: abertura negro puro (sin resplandor, piso solo delante). Figura de la ventana: gigante original sobre el maniqui CC0 de Quaternius (Universal Animation Library, Walk_Loop lento), ensanchado (pecho, cuello, brazos, manos, cabeza chica), gabardina larga + cuello + solapas + fedora pegados a huesos; casi negro, en su propia escena renderizada a 52x92 nearest y pegada en la ventana W1 en espacio de pantalla. Nada de Capcom ni de tyrant-x. Audio igual.

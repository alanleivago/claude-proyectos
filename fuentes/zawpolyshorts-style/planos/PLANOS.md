---
type: doc
status: active
tags: [zawpolyshorts, zawdog, camera, planos, shot-types]
relatedTo: [styles/zawdog/STYLE.md, fuentes/zawpolyshorts-style/escenarios.md]
---
# Planos de Zaw Poly Shorts (21 shorts, 192 fotogramas cada 2 s)

Clasificación hecha por API (analizar_planos.py) sobre `../sets/*/f_*.jpg`. Datos crudos en `*.json` y totales en `PLANOS_raw.md`.

## Números

- **Altura de cámara:**
  - 55%: a la altura del animal, mirándolo de frente (cámara a ~30-40 cm).
  - 20%: picado suave, mirando hacia abajo (la mano o el brazo del humano entran por arriba; el animal mira a cámara hacia arriba).
  - 16%: a la altura de un humano.
  - Solo 6% de contrapicado, y siempre con intención: el humano como "rey/amenaza/juez", con techo visible.
  - 3% cenital, para insertos de objetos (comida, plata, sartén, cuenco).
- **Tamaño:**
  - 54% plano medio, 26% plano entero, 11% general.
  - Los primeros planos son pocos (4%), con 4% de insertos de objetos y 1% de primerísimos.
- **Humanos (60 planos):**
  - Altura: 37% a la altura humana, 30% a la del animal (de cuerpo entero, a distancia), 22% picado y solo 12% contrapicado.
  - Tamaño: casi siempre plano medio, con el torso centrado y a veces la cabeza cortada arriba.
- **Movimiento:** 82% fijo, 11% paneo o travelling corto, 4% push-in lento y 3% temblor de cámara en momentos de susto.
- **Punto de vista:** 87% neutral. El resto se reparte en por encima del hombro (5%), POV del animal (4%) y a través de una ventana o puerta (2%).
- **Composición:**
  - Sujeto centrado y casi siempre mirando a cámara.
  - Objeto en primer plano abajo (plato, mano, control remoto).
  - Simetría frontal en puertas y personas.
  - Mucho piso visible delante del animal.
  - 9 planos por short, de ~2 s cada uno.

## Reglas para Doggo Poly Shorts

1. **Base = perro a su altura, frontal y centrado**, con la cámara a ~40-50 cm y horizontal (no inclinada hacia arriba). Debe ser alrededor de la mitad de los planos.
2. **Humanos a altura humana (1.2-1.5 m) o en picado suave**, en plano medio y centrados. Nunca filmar personas desde el piso mirando hacia arriba salvo un plano "amenaza/rey" por video.
3. **Picado suave (~20%)** cuando el humano interactúa con el perro: la mano entra por arriba y el perro mira a cámara hacia arriba.
4. **Cenital para objetos** (comida, juguete, peluche), 1-2 por video.
5. **Contrapicado como máximo 1 plano por video**, con intención.
6. **CORREGIDO por el usuario:** la cámara se mueve en todas las tomas (push-in o pull-out lento, travelling, paneo, órbita corta), como en los videos 2 y 3. El "fijo" medido arriba no vale: viene de fotogramas sueltos cada 2 s.
7. **Variar el tamaño:** medio > entero > general > primer plano. No encadenar dos planos iguales seguidos.

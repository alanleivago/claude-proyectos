# Biblioteca de animaciones — zero_fem (PS1 / Megaman Legends)

Todo sale de un solo script que se puede volver a correr:

```
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b out/zero_fem.blend --python anim/build_anim.py
node anim/render.mjs --view 3q,front,side      # frames/<accion>_<vista>/ (8 frames por accion)
python anim/sheets.py                          # sheets/<accion>.png + library.png
```

`build_anim.py` abre `out/zero_fem.blend` sin modificarlo. La pose `Render3`, que se había perdido en `zero_fem.blend`, la lee de `assets/.../ZeroVolnutt.blend` en modo solo lectura. Con eso escribe estos archivos:

| archivo | qué es |
|---|---|
| `zero_anim.blend` | 29 acciones con `use_fake_user` y una pista NLA por acción. También están `Render2` y `Render3` |
| `zero_anim.glb` | malla + armature + 29 animaciones glTF con nombre (exportadas en modo NLA_TRACKS y muestreadas, así que el IK de las piernas ya va en Thigh/Calf/Foot). Lleva los materiales `face_eyes` y `face_mouth` |
| `face_tracks.json` | por acción, una lista `[frame, ojos, boca]` (frame 1 = t 0, interpolación constante) |
| `actions.json` | frames, loop, zancada y los chequeos de pies (suela mínima, alcance de la pierna, deslizamiento) |
| `viewer.html` | visor three.js sin luces. `viewer.html?a=walk&v=3q` reproduce a 15 fps. Sirve `pieces/` |
| `sheets/*.png`, `library.png` | hojas de contacto: vista 3/4, frente y lado |

## Modelo y rig (medidos)
- Alto: **13,2 unidades** (suela z = −9,0, punta del pelo z = 4,24). En Blender mira a −Y. En three.js mira a **+Z**, con Y arriba.
- Rig propio (no Rigify), 23 huesos. Las piernas usan IK de 2 huesos (`Calf.L/R` → `FootControl`, con polo `FootPoleTarget`). El pie copia la rotación de `FootRotation`. Los brazos van en FK, así que el script resuelve un IK analítico de brazo para poner los puños en puntos concretos. Con el pie en reposo la pierna está estirada al 100 %, por eso la pose base baja la pelvis 0,2.
- Pose base femenina: el peso cae en la pierna derecha, la cadera se desplaza hacia ese lado y rota, el pecho va en contrapposto, la cabeza ladeada y las muñecas relajadas hacia afuera. La coleta (`Hair`) lleva un muelle con gravedad horneado en cada acción. Desde v2 la coleta cuelga hacia abajo detrás de la cabeza (`feminize.py` gira la malla `PonyTail` y el reposo del hueso `Hair` 64° hacia abajo, ver `out/hair_compare.png`) y el muelle no la deja entrar en la espalda (`BACK_MIN`: componente mínima hacia atrás en el marco del pecho).

## Acciones (30 fps)

| acción | frames | tipo | notas |
|---|---:|---|---|
| `idle` | 50 | loop | respiración: pecho/hombros/cabeza con desfase de 2–6 f, coleta con retraso |
| `walk` | 30 (1,0 s) | loop | contacto/abajo/paso/arriba cada 3,75 f, espejado, en el sitio. **Zancada 7,2 u por ciclo → 7,2 u/s** |
| `point` | 36 | one-shot | brazo L recto hacia la derecha de la cámara (+X), cabeza siguiendo el gesto |
| `wave` | 45 | one-shot | mano R arriba, 3 vaivenes |
| `hands_on_hips` | 36 | one-shot | puños en la cadera, cadera ladeada |
| `cheer` | 42 | one-shot | se agacha, brazos arriba y dos bombeos |
| `think` | 45 | one-shot | puño R bajo la barbilla, brazo L cruzado, cabeza inclinada |
| `shrug` | 36 | one-shot | hombros y palmas arriba, cabeza ladeada |
| `surprised` | 32 | one-shot | salto atrás (aterriza 1 u más atrás), manos al pecho |
| `kneel` | 45 | one-shot | da un paso y apoya la rodilla R; los pies quedan plantados con IK |
| `sit_floor` | 50 | one-shot | se agacha y se sienta con las manos atrás y las piernas al frente |
| `nod` | 30 | one-shot | 2 asentimientos |
| `shake_head` | 36 | one-shot | niega 4 veces |
| `look_around` | 60 | one-shot | mira a la derecha, luego a la izquierda, y vuelve |
| `talk_gesture` | 40 | loop | golpes de mano R al ritmo del habla, cabeza acompañando |
| `hold_up_object` | 40 | one-shot | vaso o jarra en alto con la mano R, mano L en la cadera, cabeza inclinada mirándolo |
| `drink` | 45 | one-shot | vaso a la boca y vuelve a bajar |
| `pour` | 45 | one-shot | dos manos inclinan la jarra o la bolsa hacia delante |
| `carry_heavy` | 40 | one-shot | saco al hombro R, inclinada, brazo L para equilibrar |
| `pump` | 30 | loop | bomba de mano: la mano R sube y baja, el cuerpo acompaña |
| `dig` | 36 (1,2 s) | loop | cavar con pala a dos manos: clava (f1), pisa la hoja con el pie R (f9), palanca (f15), levanta (f22) y tira la tierra a su izquierda (f27). Los puños van sobre la recta del mango (R a 8,6 u de la punta, L a 5,6 u); el script imprime `DIG ... miss` (distancia de cada puño a la pala, < 0,5 u) |
| `scoop_kneel` | 50 | one-shot | empieza en la pose final de `kneel`, recoge agua con un vaso y lo levanta |
| `saw` | 20 | loop | serrucho con la mano R, la mano L apoyada en la tabla |
| `present` | 40 | one-shot | palma abierta hacia un lado ("mira esto") |
| `phone_look` | 40 | one-shot | mira hacia abajo el móvil que sostiene con las dos manos |
| `sick` | 36 | one-shot | mano a la boca, retrocede y se encorva |
| `smug` | 36 | one-shot | manos en la cadera, mentón arriba, ojos cerrados y después un guiño |
| `shiver` | 16 | loop | tiritona (digger-01 #16): brazos cruzados frotando, hombros arriba, temblor alternado cada 2 f (keys lineales, sin lag) |
| `warm_hands` | 40 | loop | agachada calentándose las manos (digger-01 #22): palmas al frente a la altura del pecho, vaivén suave |
| `drop_object` | 45 | one-shot | sostiene un prop con la mano L extendida (f12-f20) y lo suelta en f22 (0,70 s): `scene.attach(prop)` y gravedad (digger-01 #4) |
| `pose_author_a` | 40 | one-shot | pose `Render2` del autor (carrera/salto), mezclada desde la pose base |
| `pose_author_b` | 40 | one-shot | pose `Render3` del autor, mezclada desde la pose base |

Los one-shot siguen el esquema base → anticipación (≈f5) → pose con overshoot (≈f11) → asentarse (≈f17–20) → mantener. Las manos, el antebrazo y la cabeza llegan 1–3 frames tarde (overlap). Todas las acciones empiezan en la pose base, salvo `scoop_kneel`, que empieza en el final de `kneel`. Por eso se encadenan con un `crossFadeTo` corto.

Chequeos (`actions.json`): ninguna suela baja de 0,03 u del suelo. En `walk` el pie apoyado retrocede exactamente 0,24 u/frame (error < 0,0002), así que el pie no resbala si el root avanza 7,2 u/s. En `kneel`, `sit_floor` y `surprised` los pies cambian de sitio a propósito (pasos o salto).

## Props (se cuelgan en three.js)
Hueso tras el saneado de GLTFLoader: `HandR` o `HandL`. El centro del puño está en **`(0, 0.8, 0)`** en espacio local del hueso (el eje Y local va a lo largo de la mano). Lo comprobé con cubos.

| acción | mano | prop |
|---|---|---|
| `hold_up_object`, `drink` | `HandR` | vaso o jarra en `(0, 0.8, 0)`. En `drink` el borde queda en la boca entre f13 y f30 |
| `pour` | `HandR` + `HandL` | jarra o bolsa: colgarla de `HandR` en `(0, 0.8, 0)`. `HandL` la sostiene por abajo |
| `carry_heavy` | `HandR` | saco sobre el hombro: `(0, 0.8, 0)` y el saco desplazado hacia atrás (+Z del armature, la espalda) |
| `pump` | `HandR` | mango de la bomba en `(0, 0.8, 0)`. El mango sube y baja 2 u |
| `dig` | `HandR` + `HandL` | pala: eje = de puño L a puño R (puños en `(0, 0.8, 0)`), punta = puño R − eje·8,6 u (≈ puño L − eje·5,6 u). Pala de 1,15 m con el mango en el puño R. Ejemplo: `shovelOnHands()` en `zero-test/shots.js` |
| `scoop_kneel` | `HandR` | vaso en `(0, 0.8, 0)` |
| `saw` | `HandR` | mango del serrucho en `(0, 0.8, 0)`. La hoja apunta hacia delante |
| `phone_look` | `HandR` | móvil en `(0, 0.8, 0)` con la pantalla hacia la cara |

```js
const hand = char.getObjectByName('HandR');
hand.add(cup); cup.position.set(0, 0.8, 0);      // soltarlo: scene.attach(cup)
```

## three.js

```js
const gltf = await new GLTFLoader().loadAsync('zero_anim.glb');
const char = gltf.scene;                          // 13,2 u de alto: escalar con char.scale.setScalar(h / 13.2)
const mixer = new THREE.AnimationMixer(char);
const clip = (n) => THREE.AnimationClip.findByName(gltf.animations, n);

// one-shot que se queda en la pose final
const a = mixer.clipAction(clip('cheer'));
a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; a.reset().play();
// encadenar: idle -> wave en 6 frames
idleAction.crossFadeTo(mixer.clipAction(clip('wave')).reset().play(), 6 / 30, false);

// loops: el ultimo frame exportado es igual al primero, asi que duration = N/30 y no se repite ningun frame
mixer.clipAction(clip('walk')).play();            // y mover el root: char.position.z += 7.2 * dt (escala 1)

// idle aditivo encima de una pose sostenida (opcional, peso bajo)
const add = THREE.AnimationUtils.makeClipAdditive(clip('idle').clone());
mixer.clipAction(add, undefined, THREE.AdditiveAnimationBlendMode).setEffectiveWeight(0.5).play();

// escalonado PS1 a 15 fps: el mixer solo avanza en saltos de 1/15 s
let shown = 0;
function tick(t) {                                // t = segundos desde el inicio del plano
  const q = Math.floor(t * 15) / 15;
  mixer.update(q - shown); shown = q;
  applyFace(name, Math.floor(q * 30) + 1);
}
```

### Caras (`face_tracks.json`)
Cada clave es `[frame, ojos, boca]`, con el frame en base 1 a 30 fps. Vale la última clave con `frame <= f` (constante). Las celdas están en `face/README.md`, y `setFace` está ahí mismo.

```js
const faces = await (await fetch('face_tracks.json')).json();
function applyFace(name, f) {
  let k = faces[name][0];
  for (const x of faces[name]) if (x[0] <= f) k = x;
  setFace(char, { eyes: k[1], mouth: k[2] });
}
```
Parpadeo: `open → half → blink → half → open` en 4 frames, en `idle` cada 110 f (≈3,7 s). Expresiones por acción: surprised → `surprised`/`surprised` y después `shocked`/`gasp`; cheer y wave → `happy`/`smileOpen`; think → `half` y después `half`/`frown`; shrug → `relaxed`/`cat`; sick → `shocked`/`bigShock`, `dizzy`/`frown`, `sad`/`frown`; carry_heavy → `angry`/`shout` en el esfuerzo y `sad`/`frown`; smug → `relaxed`/`cat` y después `wink`/`cat`; talk_gesture → bocas `talkA`/`talkO`/`neutral`/`smile` cada 3 f.
Correspondencia con las caras de sinaboto: asco → `half` o `angry` + `frown`; risa → `happy` + `smileOpen`; shock → `shocked` + `bigShock`; esfuerzo → `angry` + `shout`; ternura o satisfacción → `relaxed` + `cat`.

### Nombres después del saneado de GLTFLoader
GLTFLoader quita `.`, `:`, `/`, `[` y `]` de los nombres de nodo:

| Blender | three.js |
|---|---|
| `UpperArm.L` / `Forearm.L` / `Hand.L` | `UpperArmL` / `ForearmL` / `HandL` (y lo mismo con R) |
| `Thigh.L` / `Calf.L` / `Foot.L` | `ThighL` / `CalfL` / `FootL` |
| `FootControl.L`, `FootRotation.L`, `FootPoleTarget.L` | `FootControlL`, `FootRotationL`, `FootPoleTargetL` (son controles y no deforman) |
| `Pelvis`, `Chest`, `Neck`, `Head`, `Hair` | igual |
| materiales | `Zero`, `face_eyes`, `face_mouth` (sin cambios) |
| animaciones | los nombres de la tabla, sin cambios |

Ojo: hay una malla `Head` y un hueso `Head`, así que GLTFLoader renombra uno de los dos a `Head_1`. Para el hueso, búscalo dentro del esqueleto con `skinnedMesh.skeleton.getBoneByName('Head')`.

## Origen sinaboto de las acciones nuevas
Vídeos en `Ref sinaboto/`. v1 = 7696200784064695565, v2 = 7697312481340820750, v3 = 7698855026764090638, v4 = 7699665848604052750 y v5 = 7700722373435149582. Los tiempos son aproximados, a ±1 s.

| acción | inspiración |
|---|---|
| `hold_up_object` | v2 0:04–0:06 (alza la jarra de agua turbia), v2 0:16 y 0:26 (examina el vaso con la cabeza ladeada) |
| `drink` | v2 1:22 (bebe el vaso: "yes"), v1 1:08 (vaso a la boca) |
| `pour` | v2 0:20 (vuelca la bolsa con las dos manos) |
| `carry_heavy` | v1 1:16–1:20 (carga el tronco o tubo, inclinada) |
| `pump` | v2 0:08 (bomba de mano) |
| `dig` | v2 0:07–0:08 (cava con pala en el claro de tierra) |
| `scoop_kneel` | v2 0:00 (agachada en el agua recogiendo), v4 1:22 (de rodillas) |
| `saw` | v1 0:20–0:22 (sierra en alto), v4 0:08 (motosierra) |
| `present` | v1 0:24 (brazos abiertos en la ventana), v5 0:46 (palma hacia la pared) |
| `phone_look` | v4 0:00 (móvil en las manos), v3 0:36 (pantalla del móvil) |
| `sick` | v2 1:00–1:02 ("sick": mano a la boca con cara de asco) |
| `smug` | v5 0:28 y v5 0:56–0:58 (manos en la cadera, satisfecha), v2 0:46 ("okay") |
| también | `think` ← v2 0:42 (mano en la barbilla); `surprised` ← v3 0:40–0:42; `cheer` ← v4 0:40; `wave` ← v3 1:44–1:46 (feliz con el pastel); `look_around` ← v4 1:16 |

## Límites conocidos
- Las manos son puños: no hay dedos, así que `present` y `wave` se leen por la muñeca y el giro del antebrazo.
- `sit_floor` deja las piernas casi estiradas. En la vista frontal la silueta queda compacta, y se ve mejor de 3/4 o de lado.
- `pose_author_a` es una pose de carrera en el aire: el pie trasero queda 0,02 u bajo la suela durante la mezcla (no se nota).

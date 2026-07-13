# 001 — Animar swaps e intercambios de formación con FLIP

- **Status**: DONE
- **Commit**: cbb99b9
- **Severity**: HIGH
- **Category**: Interruptibilidad / Oportunidad perdida
- **Estimated scope**: 1 archivo (`js/app.js`), ~40 líneas nuevas; retoque menor en `css/styles.css`

## Problema

Cuando el usuario intercambia dos cartas (arrastrando o con el botón ⇄) o cambia la
formación, `render()` **elimina todas las cartas del DOM y las vuelve a crear** en la
nueva posición. Resultado: las cartas **saltan** instantáneamente a su nuevo sitio, sin
ningún movimiento. Es la interacción más característica de la app (una plantilla estilo
FIFA) y ahora mismo se siente como un corte brusco, no como mover un jugador.

```js
// js/app.js:224-242 — actual
function render() {
  asignarPosiciones();

  pitch.querySelectorAll(".fut-card").forEach((el) => el.remove());   // ← destruye
  once.forEach((id) => {
    const p = porId[id];
    const carta = crearCarta(p);                                       // ← recrea
    carta.style.left = p.coords.x + "%";
    carta.style.top = p.coords.y + "%";
    pitch.appendChild(carta);
  });

  bench.innerHTML = "";                                                // ← banquillo también salta
  banquillo.forEach((id) => bench.appendChild(crearCarta(porId[id])));

  dibujarQuimica();
  aplicarFiltro();
  actualizarMedia();
}
```

Las cartas del campo se posicionan con `left`/`top` en `%` y se centran con
`transform: translate(-50%, -50%)` (`css/styles.css:214`). Como se recrean en cada
render, ninguna transición de posición es posible en el estado actual.

## Target

Usar la técnica **FLIP** (First, Last, Invert, Play) sobre las cartas del **campo**:
medir la posición de cada carta (por `data-id`) ANTES del render, dejar que el render
las coloque en su sitio final, y luego animar cada carta desde su posición vieja hasta
la nueva mediante `transform` (compositor, sin tocar layout).

- Solo se anima `transform` y `opacity` — nunca `left`/`top` (eso dispararía layout).
- Duración **260ms**, curva de movimiento en pantalla `--ease-in-out` (definida en el
  plan 003; si aún no existe, usar el literal `cubic-bezier(0.77, 0, 0.175, 1)`).
- Las cartas que **entran** al campo desde el banquillo (no tenían posición previa)
  hacen fade + scale desde `0.9`, en vez de deslizarse desde un punto arbitrario.
- Las **líneas de química** se redibujan una vez terminado el movimiento y aparecen con
  un fade corto (evita el doble-trazo mientras las cartas viajan).
- Respetar `prefers-reduced-motion`: si está activo, no animar posiciones (el render se
  aplica instantáneo, como ahora).

Comportamiento objetivo (pseudocódigo dentro de `render`):

```js
function render() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // FIRST: medir posiciones actuales de las cartas del campo por id
  const first = new Map();
  if (!reduce) {
    pitch.querySelectorAll(".fut-card").forEach((el) => {
      first.set(el.dataset.id, el.getBoundingClientRect());
    });
  }

  asignarPosiciones();

  // (re)construir campo y banquillo como ahora
  pitch.querySelectorAll(".fut-card").forEach((el) => el.remove());
  once.forEach((id) => {
    const p = porId[id];
    const carta = crearCarta(p);
    carta.style.left = p.coords.x + "%";
    carta.style.top = p.coords.y + "%";
    pitch.appendChild(carta);
  });
  bench.innerHTML = "";
  banquillo.forEach((id) => bench.appendChild(crearCarta(porId[id])));

  // LAST + INVERT + PLAY sobre las cartas del campo
  if (!reduce) {
    pitch.querySelectorAll(".fut-card").forEach((el) => {
      const prev = first.get(el.dataset.id);
      const last = el.getBoundingClientRect();
      if (prev) {
        const dx = prev.left - last.left;
        const dy = prev.top - last.top;
        // la carta ya tiene translate(-50%,-50%); anteponer el delta
        el.style.transition = "none";
        el.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => {
          el.style.transition =
            "transform 260ms var(--ease-in-out, cubic-bezier(0.77,0,0.175,1))";
          el.style.transform = "translate(-50%, -50%)";
        });
      } else {
        // carta que entra desde el banquillo: fade + scale
        el.style.transition = "none";
        el.style.opacity = "0";
        el.style.transform = "translate(-50%, -50%) scale(0.9)";
        requestAnimationFrame(() => {
          el.style.transition =
            "transform 260ms var(--ease-out, cubic-bezier(0.23,1,0.32,1)), opacity 200ms ease";
          el.style.opacity = "";
          el.style.transform = "translate(-50%, -50%)";
        });
      }
    });
  }

  dibujarQuimica();     // ver nota de fade abajo
  aplicarFiltro();
  actualizarMedia();
}
```

Para el fade de las líneas de química, envolver el `<svg id="chemLines">` con una
transición de opacidad: poner `opacity: 0` al inicio de `dibujarQuimica()` y volver a
`0.85`/`1` en el siguiente frame (o dar a cada `<line>` `opacity` vía CSS con
`transition`). Mantenerlo simple: una transición de opacidad de 200ms sobre el `<svg>`.

## Repo conventions to follow

- Todo el JS vive en una IIFE en `js/app.js`; no hay build ni módulos. Añade la lógica
  dentro de `render()`, sin dependencias nuevas.
- Las cartas se identifican por `el.dataset.id` (ver `crearCarta`, `js/app.js:122`). Úsalo
  como clave del FLIP.
- Los tokens de easing los introduce el **plan 003** en `:root` de `css/styles.css`. Si
  ejecutas este plan ANTES del 003, usa los literales cubic-bezier indicados arriba; son
  los mismos valores que el 003 tokeniza, así que no habrá divergencia.
- El centrado `translate(-50%, -50%)` es obligatorio en las cartas del campo
  (`css/styles.css:214`): cualquier transform que apliques debe conservarlo como base.

## Steps

1. En `js/app.js`, reemplaza el cuerpo de `render()` (líneas 224-242) por la versión con
   FLIP mostrada arriba, conservando las llamadas finales a `dibujarQuimica()`,
   `aplicarFiltro()` y `actualizarMedia()`.
2. Limpia los estilos inline residuales: cuando termine la transición (`transitionend`),
   quita `el.style.transition`/`transform`/`opacity` para no dejar transforms fijados que
   estorben al siguiente FLIP. (Alternativa simple: al inicio del bloque FLIP, resetear
   `el.style.transform = "translate(-50%, -50%)"` antes de medir el LAST.)
3. En `dibujarQuimica()` (`js/app.js:253`), añade el fade de opacidad del `<svg>`: pon
   `chemSvg.style.opacity = "0"` al vaciarlo y, en el siguiente `requestAnimationFrame`,
   `chemSvg.style.transition = "opacity 200ms ease"; chemSvg.style.opacity = "1";`.
4. Verifica que el banquillo (que se reconstruye con `innerHTML`) no necesita FLIP: es una
   fila con scroll; un fade breve opcional es aceptable, pero no es obligatorio. No lo
   animes en este plan salvo que sea trivial.

## Boundaries

- NO cambies la lógica de `intercambiar()` ni de `asignarPosiciones()` — solo el *cómo*
  se pinta el resultado, no el *qué*.
- NO animes `left`/`top`: solo `transform`/`opacity`.
- NO conviertas las cartas del campo en elementos persistentes reordenados (refactor
  mayor); mantén el patrón destruir-recrear + FLIP.
- NO añadas librerías (nada de Framer Motion, GSAP, etc.).
- Si el código de `render()` ya no coincide con el excerpt (drift desde `cbb99b9`),
  DETENTE y reporta en vez de improvisar.

## Verification

- **Mecánica**: no hay typecheck/lint. Abre la página con un server local
  (`python -m http.server 8321`) y confirma que la consola del navegador no tiene errores
  tras un swap y un cambio de formación.
- **Feel check**: sirve la página, y en el campo:
  - Intercambia una carta del banquillo con una titular (botón ⇄): la titular saliente y
    la entrante deben **deslizarse/fundirse** a su sitio, no saltar.
  - Cambia de 4-3-3 a 3-5-2: las cartas deben **viajar** a sus nuevos huecos.
  - En DevTools → Animations, pon la velocidad al 10% y confirma que el movimiento es un
    deslizamiento suave con `transform`, sin parpadeo de layout.
  - En DevTools → Rendering, activa "Paint flashing": el movimiento NO debe repintar el
    área completa (señal de que va por compositor).
  - Activa `prefers-reduced-motion: reduce` (Rendering): los swaps y cambios de formación
    deben aplicarse **instantáneos**, sin deslizamiento.
- **Done when**: swaps y cambios de formación animan las cartas del campo a su nueva
  posición vía `transform` en ~260ms; las líneas de química reaparecen con un fade; con
  reduced-motion todo es instantáneo; consola sin errores.

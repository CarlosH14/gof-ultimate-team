# 002 — Animar la entrada y salida del modal de detalle

- **Status**: DONE
- **Commit**: cbb99b9
- **Severity**: MEDIUM
- **Category**: Oportunidad perdida / Cohesión
- **Estimated scope**: 2 archivos (`css/styles.css`, `js/app.js`), ~25 líneas

## Problema

El modal de detalle de cada patrón aparece y desaparece de golpe. No hay ninguna
transición: se pasa de `display:none` a visible en un frame.

```css
/* css/styles.css:412 — actual */
.modal-overlay[hidden] { display: none; }
```

```js
// js/app.js:367-368 — actual (apertura)
  modal.hidden = false;
  document.body.style.overflow = "hidden";

// js/app.js:371-374 — actual (cierre)
function cerrarModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}
```

Para una app juguetona, ese "pop" instantáneo del modal es un cambio de estado brusco.
El overlay debería fundirse y el panel entrar con un leve scale, que además explica de
dónde sale el contenido.

## Target

- **Overlay**: fade de opacidad 0 → 1 en **200ms** `--ease-out`
  (`cubic-bezier(0.23, 1, 0.32, 1)`).
- **Panel** (`.modal`): entra desde `scale(0.96)` + `opacity: 0` hasta `scale(1)` +
  `opacity: 1` en **220ms** `--ease-out`. `transform-origin: center` es correcto aquí
  (es un modal centrado — exención del catálogo, no lo cambies).
- **Salida simétrica pero más corta**: el overlay y el panel se desvanecen en ~160ms; el
  `modal.hidden = true` se aplica al terminar la transición (`transitionend`), no
  inmediatamente, para que la salida se vea.
- **Nada de `scale(0)`**: el panel entra desde `0.96`, nunca desde cero.
- Respeta `prefers-reduced-motion`: con reduce, se mantiene el fade de opacidad pero se
  elimina el `scale` (sin movimiento, solo aparición).

Implementación por clases (robusta, sin depender de `@starting-style`):

```css
/* target — css/styles.css */
.modal-overlay[hidden] { display: none; }

.modal-overlay {
  /* …propiedades existentes… */
  opacity: 0;
  transition: opacity 200ms var(--ease-out, cubic-bezier(0.23,1,0.32,1));
}
.modal-overlay.is-open { opacity: 1; }

.modal {
  /* …propiedades existentes… */
  opacity: 0;
  transform: scale(0.96);
  transition:
    opacity 220ms var(--ease-out, cubic-bezier(0.23,1,0.32,1)),
    transform 220ms var(--ease-out, cubic-bezier(0.23,1,0.32,1));
}
.modal-overlay.is-open .modal { opacity: 1; transform: scale(1); }

@media (prefers-reduced-motion: reduce) {
  .modal { transition: opacity 160ms ease; transform: none; }
  .modal-overlay.is-open .modal { transform: none; }
}
```

```js
// target — js/app.js, apertura (dentro de abrirModal, sustituye modal.hidden = false)
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => modal.classList.add("is-open"));

// target — cerrarModal
function cerrarModal() {
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
  const fin = () => { modal.hidden = true; modal.removeEventListener("transitionend", fin); };
  // fallback por si transitionend no dispara (reduced-motion / display)
  modal.addEventListener("transitionend", (e) => { if (e.target === modal.querySelector(".modal")) fin(); });
  setTimeout(fin, 260);
}
```

## Repo conventions to follow

- El overlay es `#modal.modal-overlay` y el panel interno es `.modal`
  (ver `index.html`, sección del modal, y `css/styles.css:414-436`).
- El cierre se dispara desde tres sitios (botón, clic en overlay, tecla Escape),
  todos vía `cerrarModal()` (`js/app.js:388-397`). Con centralizar la animación en
  `cerrarModal()` basta para los tres.
- Tokens de easing: los añade el **plan 003**. Si ejecutas antes, usa el literal
  `cubic-bezier(0.23, 1, 0.32, 1)` (idéntico al que tokeniza el 003).

## Steps

1. En `css/styles.css`, sobre la regla `.modal-overlay` (línea 414) añade `opacity: 0` y
   la `transition` de opacidad; crea `.modal-overlay.is-open { opacity: 1; }`.
2. Sobre `.modal` (línea 425) añade `opacity: 0`, `transform: scale(0.96)` y las
   transiciones; crea `.modal-overlay.is-open .modal { opacity: 1; transform: scale(1); }`.
3. Añade el bloque `@media (prefers-reduced-motion: reduce)` para el panel.
4. En `js/app.js`, en `abrirModal()` (línea 367) añade el `requestAnimationFrame` que
   pone la clase `is-open`.
5. Reescribe `cerrarModal()` (líneas 371-374) para quitar `is-open`, esperar el
   `transitionend` del panel y entonces poner `modal.hidden = true` (con `setTimeout` de
   respaldo).

## Boundaries

- NO cambies el markup del modal ni la lógica de pestañas/contenido.
- NO uses `transform-origin` distinto de `center` en `.modal` (es correcto para un modal).
- NO animes `width`/`height`/`top`/`left`: solo `opacity` y `transform`.
- NO añadas dependencias.
- Si `cerrarModal()` o las reglas del modal ya no coinciden con los excerpts, DETENTE y
  reporta.

## Verification

- **Mecánica**: abre la página en un server local y confirma consola sin errores al abrir
  y cerrar el modal varias veces seguidas.
- **Feel check**:
  - Haz clic en una carta: el overlay se funde y el panel entra con un leve scale desde
    `0.96` (no salta, no aparece desde cero).
  - Cierra con la X, con clic fuera y con Escape: en los tres casos el modal se desvanece
    antes de desaparecer (no hay corte seco).
  - Abre y cierra rápido varias veces: no debe quedarse "a medias" ni dejar el `body` con
    `overflow: hidden` bloqueado.
  - DevTools → Animations al 10%: confirma scale 0.96 → 1 + fade, origen centrado.
  - `prefers-reduced-motion: reduce`: el modal aparece/desaparece solo con fade, sin
    scale.
- **Done when**: entrada (fade overlay + scale-in panel) y salida (fade-out con
  `hidden` diferido) funcionan desde los tres puntos de cierre; con reduced-motion solo
  hay opacidad; sin errores de consola ni scroll bloqueado.

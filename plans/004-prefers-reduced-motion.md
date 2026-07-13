# 004 — Soporte de `prefers-reduced-motion`

- **Status**: TODO
- **Commit**: cbb99b9
- **Severity**: MEDIUM
- **Category**: Accesibilidad
- **Estimated scope**: 1 archivo (`css/styles.css`), ~12 líneas; verificación cruzada con `js/app.js`

## Problema

No hay ni una sola regla `prefers-reduced-motion` en el proyecto. Los usuarios que piden
menos movimiento en su sistema reciben igualmente el barrido de brillo, los desplazamientos
de hover y (tras los planes 001/002) los deslizamientos de cartas y el scale del modal.

```bash
# grep 'prefers-reduced-motion' css/styles.css  → sin resultados
```

El movimiento problemático hoy es sobre todo el **barrido de brillo** de las cartas
(`css/styles.css:266-275`, un `transform: translateX` de 500ms en hover) y, una vez
implementados, los planes 001 (deslizamiento de cartas) y 002 (scale del modal).

## Target

Un bloque `@media (prefers-reduced-motion: reduce)` que **reduce y suaviza** el
movimiento sin eliminar toda la retroalimentación (el catálogo: menos y más suave, no
cero). Concretamente:

- **Desactivar el barrido de brillo** (es puro desplazamiento decorativo).
- **Mantener** los cambios de opacidad/color/filtro de hover y selección (ayudan a
  comprender el estado) — no los toques.
- Los planes 001 y 002 ya incluyen su propia rama de reduced-motion (FLIP desactivado,
  modal sin scale). Este plan añade la red de seguridad **global** por si algún
  movimiento se escapa.

```css
/* target — añadir al final de css/styles.css, antes o después del bloque responsive */
@media (prefers-reduced-motion: reduce) {
  /* desactivar el barrido de brillo diagonal de las cartas */
  .fut-card:hover .card-face::before,
  .fut-card:focus-visible .card-face::before {
    transition: none;
    transform: translateX(-120%);   /* lo deja fuera de vista, sin barrido */
  }

  /* red de seguridad: nada anima posición/tamaño; opacidad/color sí siguen */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Nota: el `* { animation-* }` neutraliza cualquier `@keyframes` futuro sin matar las
transiciones de opacidad/color (que se gestionan planta por planta en 001/002). No uses
el patrón agresivo `* { transition: none !important }`, porque eliminaría también los
fades que SÍ queremos conservar para comprensión.

## Repo conventions to follow

- El archivo ya tiene un bloque `@media (max-width: 720px)` al final
  (`css/styles.css:555-563`); coloca el bloque de reduced-motion junto a él, en la sección
  responsive, con una cabecera de comentario coherente con el resto
  (`/* ---------- Reduced motion ---------- */`).
- El proyecto ya demuestra sensibilidad al contexto de entrada con
  `@media (hover: none)` (`css/styles.css:371`); sigue ese mismo estilo de media queries.

## Steps

1. Añade la cabecera de sección `/* ---------- Reduced motion ---------- */` cerca del
   final de `css/styles.css`.
2. Añade el bloque `@media (prefers-reduced-motion: reduce)` con: la desactivación del
   barrido de brillo y la red de seguridad `* { animation-* }`.
3. Verifica que NO estás anulando las transiciones de opacidad/color de hover/selección
   (deben seguir funcionando con reduced-motion).

## Boundaries

- NO uses `* { transition: none !important }` ni `* { animation: none !important }` sobre
  todo: eliminaría los fades de comprensión que queremos conservar.
- NO elimines el hover de resaltado (`filter: drop-shadow`) ni el dim de filtro: son
  cambios de estado, no desplazamientos.
- NO dupliques la lógica de reduced-motion que ya traen los planes 001 y 002; este bloque
  es complementario (barrido de brillo + red de seguridad global).
- Si ya existe un bloque `prefers-reduced-motion` (algún plan se adelantó), intégrate en
  él en vez de duplicarlo.

## Verification

- **Mecánica**: `grep 'prefers-reduced-motion' css/styles.css` devuelve el nuevo bloque.
- **Feel check** (DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce"):
  - Pasa el ratón sobre una carta: **no** hay barrido de brillo diagonal, pero el
    resaltado (sombra dorada) **sí** sigue apareciendo.
  - Con los planes 001/002 aplicados: los swaps/formación son instantáneos y el modal
    aparece solo con fade (sin scale ni deslizamiento).
  - Desactiva la emulación: el barrido de brillo vuelve a verse con normalidad.
- **Done when**: con reduced-motion activo desaparecen los desplazamientos (barrido de
  brillo, deslizamiento de cartas, scale del modal) pero se conservan los cambios de
  opacidad/color/filtro; sin reduced-motion todo se ve como antes.

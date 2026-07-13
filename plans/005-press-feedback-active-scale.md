# 005 — Feedback de pulsación (`:active` scale) en cartas y chips

- **Status**: TODO
- **Commit**: cbb99b9
- **Severity**: LOW
- **Category**: Físicalidad
- **Estimated scope**: 1 archivo (`css/styles.css`), ~8 líneas

## Problema

Los elementos pulsables no dan ninguna respuesta táctil al pulsarlos. Al hacer clic en
una carta o en un chip de categoría no hay micro-hundimiento: el clic se siente "muerto"
hasta que ocurre el resultado (abrir modal, filtrar). En una app juguetona, un pequeño
`scale` en `:active` añade tacto sin coste.

Elementos afectados, todos con `cursor: pointer` y sin regla `:active`:
- `.fut-card` (`css/styles.css:209`) — la carta, elemento pulsable principal.
- `.cat-chip` (`css/styles.css:115`) — chips de filtro.
- `.card-swap` (`css/styles.css:348`) — ya tiene `:hover` scale(1.15) pero no `:active`.

## Target

Micro-hundimiento en `:active`, sutil (catálogo: 0.95–0.98) y rápido (160ms `ease-out`).
Debe **componerse** con el transform de centrado de las cartas del campo
(`translate(-50%, -50%)`), no reemplazarlo.

```css
/* target — css/styles.css */

/* cartas del banquillo y del modal (sin translate de centrado) */
.fut-card:active { transform: scale(0.97); }

/* cartas del campo: conservar el centrado al hundir */
.pitch .fut-card:active { transform: translate(-50%, -50%) scale(0.97); }

/* incluir transform en la transición de la carta (hoy solo filter/opacity) */
.fut-card {
  /* … transición existente … */
  transition:
    filter var(--dur-base, 200ms),
    opacity var(--dur-base, 200ms),
    transform 160ms var(--ease-out, cubic-bezier(0.23,1,0.32,1));
}

.cat-chip:active { transform: scale(0.97); }
```

Cuidado con la interacción con el **plan 001** (FLIP): el plan 001 fija `el.style.transition`
y `el.style.transform` inline durante el deslizamiento. El `:active` de CSS convive porque
solo aplica mientras el botón del ratón está pulsado, y el FLIP ocurre después de soltar
(en el `render`). No hay conflicto real, pero si notas un "tirón" al soltar, la limpieza
de estilos inline del paso 2 del plan 001 lo resuelve.

## Repo conventions to follow

- El proyecto ya usa scale en interacción para `.card-swap:hover`
  (`css/styles.css:368`, `transform: scale(1.15)`) — mismo patrón, ahora en `:active`.
- Tokens `--dur-base` / `--ease-out`: los define el **plan 003**. Si ejecutas antes, usa
  los literales (`200ms`, `cubic-bezier(0.23,1,0.32,1)`).
- Las cartas del campo llevan `transform: translate(-50%,-50%)` obligatorio
  (`css/styles.css:214`); cualquier `:active` sobre ellas debe conservarlo.

## Steps

1. En `css/styles.css`, amplía la `transition` de `.fut-card` (línea 219) para incluir
   `transform 160ms var(--ease-out)` además de `filter`/`opacity`.
2. Añade `.fut-card:active { transform: scale(0.97); }` y la variante
   `.pitch .fut-card:active { transform: translate(-50%,-50%) scale(0.97); }`.
3. Añade `.cat-chip:active { transform: scale(0.97); }`.
4. (Opcional) `.card-swap:active { transform: scale(1.05); }` para que el botón también
   responda al pulsarlo.

## Boundaries

- NO cambies el hover existente de las cartas ni de los chips.
- Mantén el scale en el rango 0.95–0.98 (sutil); nada de `scale(0.9)` o menor.
- NO animes propiedades de layout; solo `transform`.
- Verifica que las cartas del campo NO pierden el centrado al pulsarse (no debe "saltar"
  hacia la esquina superior izquierda).
- Si la transición de `.fut-card` ya incluye `transform`, otro plan se adelantó: revisa
  antes de duplicar.

## Verification

- **Feel check**:
  - Mantén pulsada una carta del campo: se hunde levemente (~3%) y **sigue centrada** en
    su hueco; al soltar, vuelve.
  - Mantén pulsada una carta del banquillo y un chip de categoría: mismo micro-hundimiento.
  - Con el plan 001 aplicado: pulsar-soltar para hacer un swap no produce un "tirón" raro
    antes del deslizamiento.
  - DevTools → Animations al 10%: el hundimiento es un `scale` suave de ~160ms.
- **Done when**: cartas (campo, banquillo, modal), chips y botón de swap dan un
  micro-hundimiento de `scale(0.97)` en `:active` sin perder el centrado; el rango es
  sutil; sin regresiones en hover.

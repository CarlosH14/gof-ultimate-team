# 003 — Introducir tokens de motion y eliminar `transition: all`

- **Status**: TODO
- **Commit**: cbb99b9
- **Severity**: MEDIUM
- **Category**: Cohesión / Rendimiento / Easing
- **Estimated scope**: 1 archivo (`css/styles.css`), ~10 líneas netas

## Problema

No existen tokens de easing ni duración; las curvas y tiempos están escritos a mano y
dispersos, y dos reglas usan `transition: all`, que anima propiedades no deseadas fuera
de la GPU.

```css
/* css/styles.css:126 — actual */
.cat-chip { /* … */ transition: all 0.15s; }

/* css/styles.css:450 — actual */
.modal-close { /* … */ transition: all 0.15s; }
```

Además, las duraciones sueltas (`0.15s`, `0.2s`, `0.5s`) y el `ease` implícito no
comparten un vocabulario común, lo que hace que cada componente se sienta ligeramente
distinto y complica los planes 001 y 002.

## Target

Definir tokens de motion en `:root` y consumirlos; sustituir los `transition: all` por
transiciones explícitas por propiedad.

```css
/* target — añadir en :root de css/styles.css (junto a los otros tokens, ~línea 27) */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* entradas/salidas de UI */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* movimiento en pantalla */
  --dur-fast: 150ms;                                  /* hovers, chips */
  --dur-base: 220ms;                                  /* modal, cartas */
```

```css
/* target — css/styles.css:126 */
.cat-chip {
  /* … */
  transition:
    border-color var(--dur-fast) ease,
    background-color var(--dur-fast) ease,
    color var(--dur-fast) ease,
    box-shadow var(--dur-fast) ease;
}

/* target — css/styles.css:450 */
.modal-close {
  /* … */
  transition:
    color var(--dur-fast) ease,
    border-color var(--dur-fast) ease;
}
```

Opcional (cohesión, sin cambiar el look): actualizar las transiciones existentes para
consumir los tokens donde aplique, sin alterar los valores percibidos:
- `.fut-card` (`css:219`) `transition: filter 0.2s, opacity 0.2s` → usar `var(--dur-base)`
  o dejar `200ms` explícito. No cambies el comportamiento, solo la fuente del número.
- El barrido de brillo `.card-face::before` (`css:272`) `transition: transform 0.5s ease`:
  el `0.5s` es un sweep decorativo de hover, aceptable; puedes dejarlo o moverlo a un
  token propio `--dur-shine: 500ms` si quieres centralizarlo. No es obligatorio.

## Repo conventions to follow

- Los tokens del proyecto viven todos en `:root` al inicio de `css/styles.css`
  (líneas 5-29): colores como `--gold-1`, `--panel`, etc. Añade los tokens de motion en
  ese mismo bloque, agrupados con un comentario `/* motion */`.
- El estilo del repo agrupa selectores por secciones con cabeceras `/* ---------- X ---------- */`.
  No reordenes secciones; edita en sitio.

## Steps

1. En `:root` (`css/styles.css`, antes de `font-size: 16px;` en la línea 28) añade los
   cuatro tokens `--ease-out`, `--ease-in-out`, `--dur-fast`, `--dur-base` con el
   comentario `/* motion */`.
2. Sustituye `transition: all 0.15s;` de `.cat-chip` (línea 126) por la transición
   explícita de 4 propiedades usando `var(--dur-fast)`.
3. Sustituye `transition: all 0.15s;` de `.modal-close` (línea 450) por la transición
   explícita de `color` y `border-color` con `var(--dur-fast)`.
4. (Opcional) Repunta `.fut-card` y `.tab`/`.chem-link` a `var(--dur-fast|base)` sin
   cambiar los valores percibidos.

## Boundaries

- NO cambies duraciones percibidas de forma notable: `.cat-chip` y `.modal-close` deben
  seguir sintiéndose igual de rápidas (150ms). El objetivo es corrección y cohesión, no
  rediseñar el timing.
- NO toques `transform-origin`, colores ni layout.
- NO elimines el barrido de brillo ni el hover de las cartas.
- Si las reglas `.cat-chip` o `.modal-close` ya no usan `transition: all`, es que otro
  plan se adelantó: DETENTE y reporta.

## Verification

- **Mecánica**: abre la página; DevTools → Elements → Computed sobre un `.cat-chip` y
  confirma que `transition-property` ya NO es `all` sino la lista explícita.
- **Feel check**:
  - Pasa el ratón sobre los chips de categoría y sobre la X del modal: el resaltado se
    siente igual de ágil que antes (~150ms), sin animar propiedades raras.
  - DevTools → Rendering → "Paint flashing": el hover de un chip no debe repintar de más.
  - Confirma que cartas, modal (plan 002) y swaps (plan 001) que referencian
    `var(--ease-out)` / `var(--ease-in-out)` resuelven el token (no caen al fallback).
- **Done when**: no queda ningún `transition: all` en `css/styles.css`; los cuatro tokens
  existen en `:root` y se consumen al menos en `.cat-chip` y `.modal-close`; el timing
  percibido no cambia.

# Planes de mejora de animación — Gang of Four Ultimate Team

Auditoría de motion realizada con la skill `improve-animations` sobre `index.html`,
`css/styles.css` y `js/app.js`, commit base `cbb99b9`.

Cada plan es autocontenido: incluye rutas exactas, código actual, valores objetivo
(cubic-beziers, duraciones) y un feel-check. Un agente sin contexto de la sesión puede
ejecutarlos tal cual.

## Planes

| # | Título | Severidad | Categoría | Status |
|---|--------|-----------|-----------|--------|
| [001](001-animate-card-swaps-and-formation-with-flip.md) | Animar swaps e intercambios de formación con FLIP | **HIGH** | Interruptibilidad / Oportunidad | DONE |
| [002](002-animate-modal-enter-exit.md) | Animar entrada y salida del modal | MEDIUM | Oportunidad / Cohesión | DONE |
| [003](003-motion-tokens-and-fix-transition-all.md) | Tokens de motion y eliminar `transition: all` | MEDIUM | Cohesión / Rendimiento / Easing | DONE |
| [004](004-prefers-reduced-motion.md) | Soporte de `prefers-reduced-motion` | MEDIUM | Accesibilidad | DONE |
| [005](005-press-feedback-active-scale.md) | Feedback de pulsación (`:active` scale) | LOW | Físicalidad | DONE |

## Orden de ejecución recomendado

1. **003 primero** (fundacional): crea los tokens `--ease-out`, `--ease-in-out`,
   `--dur-fast`, `--dur-base` en `:root`. Los planes 001, 002 y 005 los consumen. Están
   escritos con fallback al literal cubic-bezier, así que también funcionan si se ejecutan
   antes que 003 — pero hacer 003 primero evita divergencias.
2. **001** (mayor impacto): el deslizamiento de cartas en swaps/formación. Es la mejora de
   mayor leverage; hazla en cuanto existan los tokens.
3. **002**: entrada/salida del modal. Independiente de 001.
4. **004**: `prefers-reduced-motion`. Conviene DESPUÉS de 001 y 002 porque su feel-check
   verifica que esos movimientos se desactivan; sus ramas de reduced-motion propias ya
   quedan en 001/002 y este plan añade la red de seguridad global.
5. **005**: feedback de pulsación. Independiente; hazlo al final. Su único cruce es con
   001 (FLIP), ya contemplado en el propio plan.

## Dependencias

- 001, 002, 005 → **usan los tokens de 003** (con fallback literal si 003 aún no corrió).
- 004 → **verifica** el comportamiento de 001 y 002 bajo reduced-motion (no los modifica).
- 001 ↔ 005 → conviven; la limpieza de estilos inline del paso 2 de 001 resuelve cualquier
  tirón al combinar FLIP con el `:active` scale.

## Fuera del alcance de esta auditoría

- El barrido de brillo de las cartas (`transform` de 500ms en hover) se consideró
  aceptable como delight on-brand; solo se re-tokeniza opcionalmente en 003 y se desactiva
  bajo reduced-motion en 004.
- No se auditó el rendimiento del SVG de química más allá de acoplarlo al fade del plan
  001, por ser de bajo volumen.

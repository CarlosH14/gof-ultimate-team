# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An educational single-page site that presents the 23 Gang of Four design patterns as a FIFA Ultimate Team squad: a starting eleven on a pitch (with selectable formations), a bench sorted by rating, chemistry lines between related patterns, and a detail modal per pattern with a runnable Python example. Deployed via GitHub Pages at carlosh14.github.io/gof-ultimate-team.

## Running locally

Pure HTML/CSS/JS — no dependencies, no build step, no tests, no linter:

```bash
python -m http.server 8321
# open http://localhost:8321
```

(`.claude/launch.json` is configured with this same command/port.)

## Architecture

Two script files loaded in order by `index.html` — `js/data.js` must come first because it defines globals that `js/app.js` consumes:

- **`js/data.js`** — content only. Defines two globals:
  - `PATRONES`: array of the 23 pattern objects. Each has `id`, `nombre`, `categoria` (`creacional` | `estructural` | `comportamiento`), `posicion` (FUT position like POR/DFC/MC), `rating`, `quimica` (array of pattern ids it combines well with), `intencion`, `problema`, `solucion`, `analogia`, `stats` (six 0–100 FUT-style attributes), and `codigo` (Python example as a template literal).
  - `CAT_META`: per-category icon/badge/label.
- **`js/app.js`** — all behavior, in one IIFE. Renders cards onto the pitch and bench, draws chemistry lines, handles the detail modal, category filters, card swaps, and formation changes. Mutable UI state lives in closure variables: `once` (starting-eleven ids in formation-slot order), `banquillo` (bench order), `formacionActual`, `filtroActual`, `seleccionado`. Everything re-renders through the single `render()` function after any state change.
- **`css/styles.css`** — all styling (FUT card look, pitch, modal, responsive).

Key mechanics worth knowing before editing:

- **Formations**: `FORMACIONES` in `app.js` maps each formation name to 11 slots (`x`/`y` in % plus a position tag), ordered goalkeeper → defense → midfield → attack. Changing formation reassigns the same `once` ids to the new slots in that order; `asignarPosiciones()` stamps `titular` and `coords` onto pattern objects at render time (it mutates the `PATRONES` objects — `coords`/`titular` in `data.js` are effectively defaults).
- **Chemistry lines**: drawn in an SVG with `viewBox="0 0 100 130"`; card `y` coords are percentages of pitch height, so `dibujarQuimica()` multiplies `y` by 1.3 to map into the viewBox. Green lines mean reciprocal chemistry (both patterns list each other in `quimica`), orange means one-directional.
- **Swaps**: `intercambiar()` handles all three cases (titular↔titular, bench↔bench, bench↔titular) via drag & drop or the ⇄ button + click. Team average rating recalculates on every render.
- **Python syntax highlighting**: `resaltarPython()` in `app.js` is a small hand-rolled regex highlighter (no external library). If you add `codigo` snippets, they must work with it — comments, strings, and a fixed keyword list.

## Conventions

- All content, UI text, code comments, and identifiers are in **Spanish** (e.g. `intercambiar`, `banquillo`, `dibujarQuimica`). Keep new code and content in Spanish to match.
- Card "photos" are emoji, mapped per pattern id in `FOTOS` in `app.js`. A new pattern id needs an entry there too.
- The football metaphor is load-bearing: creational patterns play defense, structural play midfield, behavioral play attack, Singleton is the goalkeeper. Keep analogies consistent with it.
- No frameworks or external dependencies — keep it vanilla JS/CSS.

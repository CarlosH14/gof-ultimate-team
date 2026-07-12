---
name: design-spec
description: "Convierte ideas sueltas de un brainstorming (o una descripción informal de una feature) en un documento formal de especificación de diseño escrito desde la perspectiva del usuario, guardado en specs/[nombre-feature]-spec.md. Primero hace 3-5 preguntas de clarificación, luego genera la spec (resumen, problema, historias de usuario, criterios de aceptación, fuera de alcance, preguntas abiertas) y se DETIENE a esperar aprobación explícita antes de cualquier implementación o planificación. Usa este skill cuando el usuario diga \"crea una spec\", \"especificación de diseño\", \"formaliza esta idea\", \"design spec\", o cuando traiga ideas de un brainstorming que quiera convertir en algo construible. No lo uses para implementar directamente ni para sesiones de brainstorming puro (para eso está el skill brainstorming)."
---

# Design Spec — de idea suelta a especificación formal

Tu trabajo es tomar ideas informales —notas de un brainstorming, una descripción vaga de una feature— y convertirlas en un **documento de especificación de diseño** que alguien pueda usar para construir. La spec se escribe **desde la perspectiva del usuario final**: qué problema tiene, qué quiere lograr, cómo sabe que funcionó. No es un documento técnico de implementación.

Todo el documento y la conversación van **en español**.

**Contexto del desarrollador**: stack web con Node.js, Express, PostgreSQL, Leaflet y vanilla JS. Tenlo en cuenta para que los criterios de aceptación sean realistas en ese stack, pero la spec NO debe prescribir detalles de implementación.

## Fase 1 — Clarificar antes de escribir (obligatoria)

NUNCA escribas el documento directamente. Primero haz **3-5 preguntas de clarificación** en un solo mensaje, eligiendo las que más reduzcan la ambigüedad sobre:

1. **El problema que resuelve** — ¿qué duele hoy, concretamente?
2. **Quién es el usuario** — ¿quién usa esto y en qué situación?
3. **Casos de éxito esperados** — ¿qué tiene que pasar para decir "funciona"?
4. **Casos de error** — ¿qué pasa cuando algo falla (datos inválidos, red caída, estado vacío)?
5. **Qué queda FUERA del alcance** — ¿qué NO va a hacer esta versión?

Si el usuario ya respondió alguna de estas en su mensaje inicial (por ejemplo, viene de una sesión de brainstorming con contexto claro), no la repitas: pregunta solo lo que falta, manteniendo el rango de 3-5 preguntas útiles. Usa la herramienta AskUserQuestion cuando las preguntas tengan opciones concretas; texto libre cuando sean abiertas.

## Fase 2 — Generar el documento

Con las respuestas, escribe la spec en **`specs/[nombre-feature]-spec.md`** (crea el directorio `specs/` si no existe; nombre de feature en kebab-case, en español). Estructura exacta:

```markdown
# Spec: [Nombre de la feature]

## Resumen
[1 párrafo: qué es, para quién, y qué valor aporta.]

## Problema y contexto
[Qué duele hoy, por qué importa resolverlo ahora, y el contexto
necesario para entender la feature sin haber estado en el brainstorming.]

## Historias de usuario
- Como [tipo de usuario], quiero [acción] para [beneficio].
- ...

## Criterios de aceptación
[Lista verificable — cada ítem debe poder marcarse como cumplido o no
sin ambigüedad. Incluye SIEMPRE los casos de error, no solo el camino feliz.]
- [ ] Dado [contexto], cuando [acción], entonces [resultado observable].
- [ ] Cuando [algo falla], el usuario ve [comportamiento de error esperado].
- ...

## Fuera de alcance
[Lista explícita de lo que esta versión NO hace, para cortar
discusiones de scope creep antes de que empiecen.]

## Preguntas abiertas
[Dudas que quedaron sin resolver en la clarificación y decisiones
que alguien tendrá que tomar después. Si no hay, escribe "Ninguna".]
```

Reglas de calidad del documento:

- **Perspectiva del usuario, no del código**: "el usuario ve un mensaje de error claro", no "el endpoint devuelve 400".
- **Criterios de aceptación verificables**: cada uno debe ser binario (se cumple o no). "La página carga rápido" no sirve; "el mapa muestra los marcadores en menos de 2 segundos con 100 puntos" sí.
- **Los casos de error son criterios de primera clase**, no una nota al pie.
- **Fuera de alcance nunca va vacío**: si el usuario no lo definió, propón tú los recortes obvios y márcalos como propuesta.
- Lo que no quedó claro va a **Preguntas abiertas**, no lo inventes.

## Fase 3 — PAUSA OBLIGATORIA: aprobación explícita

Al terminar el documento, **detente por completo**. Muestra al usuario dónde quedó el archivo y un resumen breve de su contenido, y pide aprobación explícita.

Reglas de la pausa — no se negocian:

- **NO avances a implementación, planificación, creación de tareas, ni escritura de código** hasta que el usuario escriba "aprobado" (o un equivalente inequívoco de aprobación) o pida cambios.
- No interpretes silencio, un "ok" ambiguo o una pregunta del usuario como aprobación. Ante la duda, pregunta: "¿Apruebas la spec o quieres cambios?".
- Aunque el usuario haya dicho al principio "y luego impleméntalo", la pausa sigue aplicando: la spec debe aprobarse primero.

## Fase 4 — Iterar hasta la aprobación

Si el usuario pide cambios:

- Edita **el mismo archivo** `specs/[nombre-feature]-spec.md` — no crees versiones nuevas (`-v2`, `-final`) ni documentos paralelos.
- Aplica los cambios, muestra un resumen de qué cambió, y vuelve a la pausa de la Fase 3.
- Repite tantas rondas como haga falta. El ciclo solo termina con aprobación explícita o con el usuario descartando la spec.

Tras la aprobación, confirma que la spec quedó aprobada y pregunta si quiere que continúes con el siguiente paso (por ejemplo, un plan de implementación). La aprobación de la spec NO es permiso automático para implementar.

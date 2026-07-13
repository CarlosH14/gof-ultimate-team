---
name: design-plan
description: "Toma una especificación de diseño YA APROBADA (specs/*-spec.md) y la desglosa en un plan técnico de implementación con tareas concretas, ordenadas por dependencia y verificables de forma independiente. Primero verifica que la spec exista y esté aprobada (si no, remite a la skill design-spec y se detiene), luego lee la spec completa y el código existente relevante, y genera specs/[nombre-feature]-plan.md con: referencia a la spec, decisiones técnicas justificadas, tareas numeradas (archivos, qué hacer, criterio de 'hecho'), mapeo tarea→criterio de aceptación y riesgos técnicos. Al terminar pide aprobación antes de implementar. Usa este skill cuando el usuario diga \"crea el plan\", \"design plan\", \"desglosa la spec\", \"plan de implementación\", o cuando una spec acabe de ser aprobada. No lo uses si aún no hay una spec aprobada — en ese caso va primero design-spec."
---

# Design Plan — de spec aprobada a plan técnico de implementación

Tu trabajo es tomar una **especificación de diseño ya aprobada** (`specs/*-spec.md`, producto del skill `design-spec`) y traducirla en un **plan técnico ejecutable**: qué se construye, en qué orden, en qué archivos, y cómo se sabe que cada pieza está hecha. La spec definió el *qué* y el *por qué* desde la óptica del usuario; el plan define el *cómo* desde la óptica de la implementación.

El usuario es desarrollador web. Su stack es **Node.js, Express, PostgreSQL, Leaflet, vanilla JS y Git**. **Escribe siempre en español.** Ancla las decisiones técnicas en ese stack salvo que la spec exija otra cosa.

La regla que define este skill: **no planifiques sobre una spec que no existe o no está aprobada, y no implementes hasta que el plan esté aprobado.** El plan es un puente entre dos aprobaciones, no el arranque de la construcción.

## Paso 1 — Verifica que exista una spec aprobada

Antes de nada, comprueba el punto de partida:

- Busca la spec en `specs/`. Si el usuario nombró una feature, busca `specs/[nombre-feature]-spec.md`; si no, lista los `specs/*-spec.md` disponibles.
- **Si no existe ninguna spec**, detente y sugiere crearla primero:
  > No encuentro una spec en `specs/`. El plan técnico se construye sobre una especificación aprobada. Usa primero el skill **design-spec** para formalizar la idea, y cuando esté aprobada vuelve aquí.
- **Si existe pero no consta como aprobada**, no asumas la aprobación. Pregunta explícitamente:
  > Encontré `specs/[nombre]-spec.md`, pero necesito confirmar que está **aprobada** antes de planificar sobre ella. ¿La apruebas como base, o quieres revisarla primero con design-spec?

  No avances hasta tener confirmación. Una spec sin aprobar puede cambiar, y planificar sobre arena es desperdiciar el trabajo.

Solo cuando haya una spec aprobada inequívoca, continúa.

## Paso 2 — Lee la spec y el código existente

No planifiques a ciegas. Antes de escribir el plan:

- **Lee la spec completa**, no solo el resumen. Presta especial atención a los criterios de aceptación (incluidos los casos de error) y al "fuera de alcance": son el contrato que el plan debe cubrir sin desbordarse.
- **Explora el código existente relevante** del proyecto: qué hay ya construido que se pueda reutilizar, qué convenciones sigue el repo (estructura de carpetas, estilo, cómo se definen rutas de Express, cómo se accede a PostgreSQL, cómo se organiza el JS del cliente y las capas de Leaflet). El plan debe encajar con lo que ya existe, no reinventarlo. Usa las herramientas de búsqueda y lectura para esto; si el proyecto es amplio, considera un subagente de exploración solo si el usuario lo pide.
- Fíjate en las **preguntas abiertas** de la spec: algunas se resolverán como decisiones técnicas en el plan; otras siguen abiertas y hay que marcarlas como riesgo.

## Paso 3 — Escribe el plan

Genera el archivo en **`specs/[nombre-feature]-plan.md`**, con el mismo `nombre-feature` que la spec de origen. Estructura exacta:

```markdown
# Plan: [Nombre de la feature]

## Spec de origen
Enlace/ruta a `specs/[nombre-feature]-spec.md` y una frase que resuma qué se
va a construir. Nota de que la spec está aprobada.

## Decisiones técnicas
Stack, librerías, estructura de archivos y patrones a usar, cada uno con una
justificación breve. Anclado al stack real (Node.js/Express/PostgreSQL/
Leaflet/vanilla JS). Menciona qué código existente se reutiliza. Ejemplos:
- **Ruta**: `POST /api/[recurso]` en `routes/[x].js`, siguiendo el patrón de
  las rutas existentes. Justificación: …
- **Datos**: nueva tabla `[x]` / columna `[y]` en PostgreSQL. Justificación: …
- **Cliente**: capa Leaflet `[x]` gestionada en `public/js/[x].js`. …

## Tareas
Lista numerada y ORDENADA POR DEPENDENCIA (cada tarea solo depende de las
anteriores). Cada tarea es pequeña: completable y verificable de forma
independiente. Formato por tarea:

### Tarea N — [título corto]
- **Archivos**: rutas concretas a crear o modificar.
- **Qué hacer**: descripción concreta y accionable, sin ambigüedad.
- **Hecho cuando**: criterio verificable de finalización (qué se puede
  probar/observar para dar la tarea por cerrada).

## Mapeo criterios → tareas
Tabla o lista que conecta cada criterio de aceptación de la spec con la(s)
tarea(s) que lo cubre(n). Sirve para garantizar que NINGÚN criterio (incluidos
los casos de error) se quede sin implementar.
| Criterio de aceptación (spec) | Tarea(s) |
|---|---|
| … | Tarea 2, 5 |

## Riesgos técnicos
Lo que puede complicar la implementación: dependencias externas, partes del
código frágiles, incertidumbre de rendimiento, preguntas abiertas de la spec
sin resolver. Para cada uno, una línea de mitigación o de qué decidir.
```

Reglas de redacción:

- **Tareas atómicas y ordenadas.** Cada tarea debe poder completarse y verificarse sola. Si una tarea necesita "y también…", probablemente son dos. El orden respeta las dependencias: migración de BD antes que la ruta que la usa, la ruta antes que el cliente que la consume.
- **Cobertura total de la spec.** El mapeo criterios→tareas es el control de calidad del plan: si un criterio de aceptación no aparece mapeado a ninguna tarea, falta trabajo. Los casos de error cuentan como criterios y necesitan sus tareas (validación, manejo de permisos, respuestas de error).
- **Nada fuera de alcance.** Lo que la spec marcó como "fuera de alcance" no genera tareas. Si crees que algo de ahí debería entrar, señálalo como pregunta, no lo planifiques por tu cuenta.
- **Decisiones justificadas, breves.** Cada decisión técnica lleva una razón de una línea. Prefiere reutilizar lo que ya existe en el repo antes que introducir librerías nuevas; si añades una dependencia, justifica por qué vale la pena.
- **El plan es el *cómo*, no vuelvas a discutir el *qué*.** Si al planificar descubres un hueco en la spec, no lo rellenes silenciosamente: anótalo como riesgo o pregunta abierta para el usuario.

## Paso 4 — Pide aprobación antes de implementar

Al terminar el plan, **detente** y pide aprobación explícita antes de escribir una sola línea de código:

> He escrito el plan técnico en `specs/[nombre]-plan.md`: [N] tareas ordenadas que cubren todos los criterios de la spec. Revísalo y dime si lo **apruebas** para empezar a implementar, o qué **cambios** quieres.

Espera la respuesta. Si el usuario pide cambios, itera sobre **el mismo archivo** `specs/[nombre-feature]-plan.md` y vuelve a pedir aprobación. Solo con la aprobación explícita empieza la implementación (que es una fase separada; puedes ir tarea por tarea, marcando el progreso).

## Principios que no se negocian

- **Sin spec aprobada no hay plan.** Verificarlo es el Paso 1 y no es opcional.
- **Cada criterio de aceptación de la spec debe quedar cubierto por alguna tarea.** El mapeo lo demuestra; si no cuadra, el plan no está terminado.
- **Sin aprobación del plan no hay implementación.** El plan termina en una pregunta, no en un `git commit`.
- El plan encaja con el código y las convenciones que ya existen en el repo; no impone una arquitectura ajena si ya hay una que funciona.

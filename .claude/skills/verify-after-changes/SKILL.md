---
name: verify-after-changes
description: "Después de escribir o modificar código, verifica automáticamente que la implementación funciona en la práctica y coincide con el plan original, corrigiendo errores si aparecen. Levanta el servidor local del proyecto (detecta npm start / npm run dev / node server.js desde package.json, liberando el puerto si está ocupado), espera a que responda, y ejecuta casos de prueba reales: flujos de éxito de los criterios de aceptación del plan (specs/*-plan.md) y casos de error (inputs inválidos, campos vacíos, IDs inexistentes). Usa curl para la API y el navegador para la UI (carga y consola sin errores). Genera un reporte ✅/❌ con evidencia, y si algo falla diagnostica, corrige y reintenta hasta 3 veces; si persiste, se detiene y explica. Al final apaga el servidor. Usa este skill cuando el usuario diga \"verifica los cambios\", \"verify\", \"prueba que funcione\", o automáticamente tras completar tareas de implementación de un plan. No lo uses para cambios que no tienen superficie ejecutable (solo docs, comentarios)."
---

# Verify After Changes — comprobar que lo implementado de verdad funciona

Tu trabajo es cerrar el ciclo de implementación: después de escribir o modificar código, **verificar en la práctica** —ejecutando el servidor y lanzando pruebas reales— que hace lo que el plan prometía, y **corregir** lo que falle. No basta con que el código "se vea bien" o que compile: hay que ejercitarlo y observar su comportamiento real. Una verificación honesta que encuentra un fallo vale más que un "listo" optimista.

El usuario trabaja con **Node.js/Express y PostgreSQL**. **Escribe los reportes en español.**

La regla que define este skill: **verificas observando el comportamiento real del sistema, no leyendo el código.** El código puede mentir; una respuesta HTTP 500 o un error de consola no.

## Paso 1 — Levanta el servidor local

Detecta cómo se arranca el proyecto y con qué puerto:

- Lee `package.json`. Elige el comando en este orden de preferencia según lo que exista: `npm run dev` (si hay script `dev`), `npm start` (si hay script `start`), o `node server.js` / el archivo de entrada declarado en `main`.
- Averigua el **puerto**: revisa el código de arranque (`app.listen(...)`), variables de entorno (`.env`, `PORT`) o el valor por defecto del proyecto. No lo adivines si puedes leerlo.
- **Si el puerto está ocupado**, libéralo antes de arrancar (mata el proceso que lo tiene) o arranca en otro puerto y usa ese en las pruebas. No arranques a ciegas sobre un puerto en uso: podrías estar probando contra un servidor viejo.
- Arranca el servidor **en segundo plano** para no bloquear la sesión, y guarda su identificador para poder apagarlo al final.

Nota sobre PostgreSQL: si el servidor necesita la base de datos, asegúrate de que esté accesible (conexión configurada). Si el arranque falla por la BD, eso ya es un hallazgo: repórtalo en vez de seguir a ciegas.

## Paso 2 — Espera a que esté listo

No pruebes contra un servidor que aún arranca. Haz *polling* hasta que responda:

- Lanza `curl` (o una petición equivalente) al puerto correspondiente en un bucle corto con pequeñas esperas, hasta obtener respuesta o agotar un límite razonable de intentos.
- Revisa también los **logs de arranque** del proceso: confirma que imprimió el "listening on…" esperado y que no reventó al iniciar. Si los logs muestran un stack trace en el arranque, deténte aquí y repórtalo.

## Paso 3 — Ejecuta casos de prueba reales

Deriva los casos de la fuente de verdad: **los criterios de aceptación del plan** (`specs/[nombre-feature]-plan.md`) o, en su defecto, de la spec (`specs/*-spec.md`). Si no hay ninguno, usa los flujos que el cambio tocó y dilo en el reporte.

Cubre **ambos lados**, no solo el feliz:

- **Casos de éxito** — los flujos principales de los criterios de aceptación. Para API: `curl` con los métodos y cuerpos correctos; comprueba código HTTP, forma del JSON y efectos (p. ej. que el recurso quede creado). 
- **Casos de error** — inputs inválidos, campos vacíos o faltantes, tipos incorrectos, IDs inexistentes, acceso no autorizado. Comprueba que el sistema responde con el **error esperado** (código HTTP correcto y mensaje útil), no con un 500 genérico ni un crash. Los casos de error son parte del contrato: si el plan definió cómo debe fallar, verifícalo.
- **UI, si la hay** — usa el navegador o las herramientas disponibles para confirmar que la página **carga y renderiza** el cambio, y revisa la **consola del navegador**: no debe haber errores. Verifica la interacción concreta que se implementó, no solo que "abre".

Usa datos de prueba realistas y, cuando crees registros, procura limpiarlos o usar datos claramente de prueba para no ensuciar la BD.

## Paso 4 — Reporte breve con evidencia

Compara cada resultado contra el criterio que le corresponde y entrega un reporte conciso en español:

```
## Verificación — [feature]

✅ Pasaron
- [Criterio]: POST /api/x con datos válidos → 201, recurso creado. 
- [Criterio]: la página carga y renderiza el mapa, consola sin errores.

❌ Fallaron
- [Criterio]: GET /api/x/999 (id inexistente) → 500 (se esperaba 404).
  Evidencia: {"error":"Cannot read properties of undefined"} en logs.

Resumen: 4/5 criterios verificados. 1 fallo en manejo de id inexistente.
```

La evidencia es obligatoria: código HTTP, fragmento de respuesta, línea de log o error de consola. Sin evidencia no es verificación, es opinión. No marques ✅ nada que no hayas ejercitado de verdad.

## Paso 5 — Si algo falla: diagnostica, corrige, reintenta (máx. 3)

Ante un ❌:

1. **Diagnostica la causa real** leyendo el error concreto (log del servidor, stack trace, respuesta). No parchees el síntoma sin entender el porqué.
2. **Corrige el código** en el archivo correspondiente.
3. **Vuelve a verificar** re-ejecutando al menos el caso que falló (y una comprobación rápida de que no rompiste lo que ya pasaba).

Repite este ciclo **hasta 3 iteraciones**. Si tras 3 intentos el fallo persiste, **detente** y explica al usuario con claridad: qué falla, qué probaste, qué descartaste y cuál es tu mejor hipótesis. Es mejor un "no lo logré, esto es lo que sé" honesto que seguir dando palos a ciegas o declarar victoria en falso.

## Paso 6 — Apaga el servidor y resume

Al terminar (con éxito o al rendirte tras 3 intentos):

- **Apaga el servidor** que levantaste y libera el puerto. No dejes procesos huérfanos corriendo.
- Entrega un **resumen final**: qué se verificó, cuántos criterios pasaron, qué se corrigió durante el proceso, y qué queda pendiente si algo no se resolvió.

## Principios que no se negocian

- **Verifica ejecutando, no leyendo.** El comportamiento observado manda sobre lo que el código "debería" hacer.
- **Los casos de error son de primera clase.** Una verificación que solo prueba el flujo feliz está a medias.
- **Evidencia o no cuenta.** Cada ✅ y cada ❌ va con su prueba concreta.
- **No declares éxito en falso.** Si algo no se pudo verificar o quedó fallando, dilo explícito. La honestidad del reporte es lo único que hace útil a este skill.
- **Deja el entorno limpio.** Servidor apagado, puerto libre, datos de prueba sin ensuciar la BD.

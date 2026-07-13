# Spec: Quiz de patrones de diseño

> **Estado: APROBADA** (2026-07-12). Decisiones sobre las preguntas abiertas: tanda de 10
> preguntas al azar barajadas; banco semilla ~21 (7 por tipo); comparación por percentil
> sobre todos los intentos; explicación por pregunta guardada en el banco; sin repetidas
> dentro de un intento.

## Resumen

Un quiz interactivo para los visitantes de *Gang of Four Ultimate Team* que pone a prueba
su comprensión de los 23 patrones GoF mediante preguntas de varios tipos —elegir el patrón
más adecuado para un caso de uso, verdadero/falso y definiciones—. El visitante responde
una tanda de preguntas, recibe feedback inmediato por pregunta y una puntuación final al
terminar. Las preguntas y sus respuestas correctas viven en una base de datos (Supabase),
y la corrección se hace del lado del servidor para que las respuestas correctas no viajen
al navegador antes de tiempo. Cada intento completado se registra de forma anónima para
poder mostrar estadísticas globales agregadas.

## Problema y contexto

Hoy el sitio explica los 23 patrones con fichas ricas (problema, solución, analogía,
código), pero la experiencia es **pasiva**: el visitante lee, no se autoevalúa. No hay
forma de comprobar si de verdad entendió cuándo aplicar cada patrón, que es justo la parte
difícil (elegir Strategy vs. State, o Factory Method vs. Abstract Factory ante un caso
concreto). Un quiz convierte la lectura en práctica activa y da retroalimentación, que es
donde se consolida el aprendizaje.

Contexto técnico que enmarca la feature: el proyecto es hoy un **sitio estático** (HTML/CSS/JS
puro) desplegado en GitHub Pages, sin backend propio. Los 23 patrones ya están descritos en
`js/data.js`. Introducir un quiz con contenido en base de datos y corrección oculta implica,
por primera vez, un servicio de datos externo (Supabase) consumido desde el navegador.

## Historias de usuario

- Como **visitante**, quiero iniciar un quiz sobre patrones de diseño para poner a prueba lo
  que he aprendido en el sitio.
- Como **visitante**, quiero que me presenten un caso de uso realista y elegir qué patrón GoF
  encaja mejor, para practicar la decisión que de verdad importa.
- Como **visitante**, quiero también preguntas de verdadero/falso y de definición, para
  repasar conceptos de forma variada y no monótona.
- Como **visitante**, quiero saber inmediatamente si acerté o fallé cada pregunta y una breve
  explicación del porqué, para aprender del error en el momento.
- Como **visitante**, quiero ver mi puntuación final y cómo me comparo con el resto (por
  ejemplo, "acertaste 7/10, mejor que el 60% de los intentos"), para tener una referencia.
- Como **visitante**, quiero poder repetir el quiz, para mejorar mi resultado.
- Como **dueño del sitio**, quiero que cada intento terminado quede registrado de forma
  anónima, para conocer cuántas personas lo hacen y qué dificultad tiene en promedio.
- Como **dueño del sitio**, quiero cargar y editar el banco de preguntas directamente en la
  base de datos, sin necesidad de un panel de administración en la web.

## Criterios de aceptación

### Inicio y desarrollo del quiz
- [ ] Dado que el visitante entra a la sección de quiz, cuando la abre, entonces ve una
      pantalla de inicio que explica en qué consiste y un botón para empezar.
- [ ] Dado que el visitante inicia el quiz, cuando comienza, entonces se le presenta una
      tanda de preguntas (una a una) tomadas del banco almacenado en la base de datos.
- [ ] Cada pregunta muestra su enunciado y sus opciones según su tipo: **caso→patrón** y
      **definición** con opción múltiple; **verdadero/falso** con dos opciones.
- [ ] Dado que el visitante está en una pregunta, cuando aún no ha respondido, entonces no
      puede avanzar a la siguiente ni ver la respuesta correcta.
- [ ] Dado que el visitante selecciona una opción y confirma, cuando envía la respuesta,
      entonces el sistema le indica si acertó o falló y muestra una breve explicación.
- [ ] El progreso es visible en todo momento (p. ej. "Pregunta 3 de 10").

### Corrección oculta (no exponer respuestas)
- [ ] Dado que el visitante recibe una pregunta, cuando el navegador la carga, entonces la
      información que llega al cliente **no contiene** cuál es la opción correcta.
- [ ] Dado que el visitante responde, cuando se evalúa la respuesta, entonces la decisión de
      acierto/fallo la determina el servidor, no el navegador.
- [ ] Un visitante que inspeccione el tráfico de red antes de responder **no puede** deducir
      la respuesta correcta a partir de los datos recibidos.

### Resultado final
- [ ] Dado que el visitante responde la última pregunta, cuando termina, entonces ve una
      pantalla de resultado con su puntuación (aciertos sobre total).
- [ ] La pantalla de resultado muestra una comparación agregada frente a otros intentos
      (p. ej. percentil o media global), sin identificar a nadie.
- [ ] Dado que el visitante ve su resultado, cuando lo desea, entonces puede reiniciar y
      hacer el quiz de nuevo.

### Registro anónimo de intentos
- [ ] Dado que el visitante completa el quiz, cuando llega a la pantalla de resultado,
      entonces el intento (puntuación, número de preguntas, fecha/hora) queda registrado
      **sin** ningún dato personal ni identificador del visitante.
- [ ] Un quiz **abandonado a medias** no se registra como intento completado.

### Casos de error
- [ ] Cuando no hay conexión con la base de datos al iniciar, el visitante ve un mensaje
      claro ("No se pudieron cargar las preguntas, inténtalo más tarde") y una opción de
      reintentar, en lugar de una pantalla rota o en blanco.
- [ ] Cuando falla el envío de una respuesta (red caída a mitad), el visitante ve un aviso
      y puede reintentar esa misma respuesta sin perder el progreso del quiz.
- [ ] Cuando falla el registro del intento al final, el visitante **igualmente** ve su
      puntuación local; el fallo de guardado no le bloquea el resultado.
- [ ] Cuando el banco de preguntas tiene menos preguntas de las previstas para una tanda,
      el quiz se ejecuta con las que haya disponibles sin romperse.
- [ ] Cuando el visitante intenta enviar sin haber seleccionado ninguna opción, el sistema
      se lo impide con un aviso, no envía una respuesta vacía.

### Integración con el sitio actual
- [ ] La sección de quiz es accesible desde la página principal (enlace/entrada visible) y
      mantiene la estética FUT del resto del sitio.
- [ ] El quiz funciona en el sitio estático desplegado en GitHub Pages, sin requerir un
      backend propio administrado por nosotros.
- [ ] El quiz es usable en móvil (≤ 375 px) y en escritorio.

## Fuera de alcance

- **Panel de administración en la web**: la gestión de preguntas se hace directamente en la
  base de datos (Supabase), sin CRUD ni login de administrador en el sitio.
- **Cuentas de usuario / autenticación de visitantes**: nadie inicia sesión; todo es anónimo.
- **Leaderboard con alias o nombres**: no se guardan alias ni se muestra un ranking de
  personas; solo estadísticas agregadas anónimas.
- **Historial personal del visitante** entre sesiones o entre dispositivos.
- **Temporizador / preguntas contrarreloj**, dificultad adaptativa, o niveles.
- **Internacionalización**: el quiz va en español, igual que el resto del sitio.
- **Edición del contenido de los 23 patrones** existentes en `js/data.js`.

## Preguntas abiertas

- **Tamaño de la tanda**: ¿cuántas preguntas por quiz (p. ej. 10 fijas, o todas barajadas)?
  ¿Se eligen al azar del banco o son siempre las mismas en el mismo orden?
- **Volumen inicial del banco**: ¿con cuántas preguntas semilla arrancamos y qué reparto
  entre los tres tipos (caso→patrón, V/F, definición)?
- **Contenido de la comparación agregada**: ¿percentil, media de aciertos, o distribución?
  ¿Se calcula sobre todos los intentos históricos o sobre una ventana reciente?
- **Explicación por pregunta**: ¿la explicación del acierto/fallo forma parte del banco
  (un texto por pregunta) o se deriva de las fichas existentes de los patrones?
- **Repetición de preguntas**: en un mismo intento, ¿se garantiza que no se repitan? Entre
  intentos seguidos, ¿se intenta variar la selección?

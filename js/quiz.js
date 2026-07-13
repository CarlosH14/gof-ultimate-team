// ============================================================
// Quiz de patrones de diseño — máquina de estados del lado cliente.
// El navegador nunca conoce la respuesta correcta antes de responder:
// las preguntas llegan sin respuesta (get_quiz) y la corrección la hace
// el servidor (grade_answer). Los intentos se registran con record_attempt.
// ============================================================

(function () {
  const $ = (id) => document.getElementById(id);

  const screens = {
    start: $("screenStart"),
    loading: $("screenLoading"),
    error: $("screenError"),
    question: $("screenQuestion"),
    result: $("screenResult"),
  };

  const TIPO_ETIQUETA = { caso: "Caso de uso", vf: "Verdadero / Falso", definicion: "Definición" };
  const N_PREGUNTAS = 10;

  let preguntas = [];      // preguntas del intento actual
  let indice = 0;          // pregunta actual
  let aciertos = 0;
  let seleccion = null;    // índice de opción elegida
  let respondida = false;  // ¿ya se corrigió la pregunta actual?

  function mostrar(nombre) {
    Object.values(screens).forEach((s) => (s.hidden = true));
    screens[nombre].hidden = false;
  }

  // ---------- inicio del quiz ----------

  async function iniciar() {
    mostrar("loading");
    try {
      const datos = await rpc("get_quiz", { n: N_PREGUNTAS });
      if (!Array.isArray(datos) || datos.length === 0) {
        throw new Error("El banco de preguntas está vacío.");
      }
      preguntas = datos;
      indice = 0;
      aciertos = 0;
      pintarPregunta();
      mostrar("question");
    } catch (e) {
      mostrarError("No se pudieron cargar las preguntas. Revisa tu conexión e inténtalo de nuevo.");
    }
  }

  function mostrarError(msg) {
    $("errorMsg").textContent = msg;
    mostrar("error");
  }

  // ---------- pintar una pregunta ----------

  function pintarPregunta() {
    const q = preguntas[indice];
    seleccion = null;
    respondida = false;

    $("progressLabel").textContent = `Pregunta ${indice + 1} de ${preguntas.length}`;
    $("typeBadge").textContent = TIPO_ETIQUETA[q.type] || q.type;
    $("progressFill").style.width = `${(indice / preguntas.length) * 100}%`;
    $("questionPrompt").textContent = q.prompt;

    const lista = $("optionsList");
    lista.innerHTML = "";
    q.options.forEach((texto, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.type = "button";
      btn.textContent = texto;
      btn.dataset.index = i;
      btn.addEventListener("click", () => elegir(i));
      lista.appendChild(btn);
    });

    $("feedback").hidden = true;
    $("btnAnswer").hidden = false;
    $("btnAnswer").disabled = true;
    $("btnNext").hidden = true;
    $("btnNext").textContent = indice + 1 < preguntas.length ? "Siguiente →" : "Ver resultado →";
  }

  function elegir(i) {
    if (respondida) return;            // no se puede cambiar tras responder
    seleccion = i;
    document.querySelectorAll(".quiz-option").forEach((b) =>
      b.classList.toggle("selected", Number(b.dataset.index) === i)
    );
    $("btnAnswer").disabled = false;
  }

  // ---------- responder (corrección en servidor) ----------

  async function responder() {
    if (seleccion === null || respondida) return;
    const q = preguntas[indice];
    $("btnAnswer").disabled = true;

    let veredicto;
    try {
      veredicto = await rpc("grade_answer", { q_id: q.id, choice: seleccion });
    } catch (e) {
      // fallo de red al corregir: permitir reintentar sin perder progreso
      $("btnAnswer").disabled = false;
      mostrarAvisoTemporal("No se pudo enviar la respuesta. Reintenta.");
      return;
    }
    if (veredicto.error) {
      $("btnAnswer").disabled = false;
      mostrarAvisoTemporal("La pregunta no está disponible. Reintenta.");
      return;
    }

    respondida = true;
    if (veredicto.correct) aciertos++;

    // marcar opciones: correcta en verde, la elegida si fue errónea en rojo
    document.querySelectorAll(".quiz-option").forEach((b) => {
      const i = Number(b.dataset.index);
      b.disabled = true;
      if (i === veredicto.correct_index) b.classList.add("correct");
      else if (i === seleccion) b.classList.add("incorrect");
    });

    $("feedbackVerdict").textContent = veredicto.correct ? "✓ ¡Correcto!" : "✗ Incorrecto";
    $("feedbackVerdict").className = "quiz-feedback-verdict " + (veredicto.correct ? "ok" : "bad");
    $("feedbackExplain").textContent = veredicto.explanation || "";
    $("feedback").hidden = false;

    $("btnAnswer").hidden = true;
    $("btnNext").hidden = false;
  }

  function siguiente() {
    if (!respondida) return;
    if (indice + 1 < preguntas.length) {
      indice++;
      pintarPregunta();
    } else {
      finalizar();
    }
  }

  // ---------- resultado final ----------

  async function finalizar() {
    $("progressFill").style.width = "100%";
    const total = preguntas.length;
    $("scoreBig").textContent = `${aciertos} / ${total}`;
    $("scoreSub").textContent = etiquetaDesempeno(aciertos / total);
    $("compareText").textContent = "Registrando tu intento…";
    mostrar("result");

    // registrar intento anónimo; si falla, el resultado local se muestra igual
    try {
      const stats = await rpc("record_attempt", { p_score: aciertos, p_total: total });
      if (stats && !stats.error && typeof stats.percentile === "number") {
        const media = Math.round((stats.avg_ratio || 0) * total);
        $("compareText").textContent =
          `Mejor que el ${stats.percentile}% de los ${stats.total_attempts} intentos registrados. ` +
          `Media global: ${media}/${total}.`;
      } else {
        $("compareText").textContent = "";
      }
    } catch (e) {
      $("compareText").textContent = "(No se pudo registrar el intento, pero tu resultado es válido.)";
    }
  }

  function etiquetaDesempeno(ratio) {
    if (ratio === 1) return "¡Plantilla perfecta! Dominas los patrones.";
    if (ratio >= 0.8) return "Titular indiscutible.";
    if (ratio >= 0.6) return "Buen nivel, con margen de mejora.";
    if (ratio >= 0.4) return "Vas de suplente: repasa las fichas.";
    return "A la cantera: dale otra vuelta a los patrones.";
  }

  // aviso breve sin bloquear (para fallos de red recuperables)
  let avisoTimer = null;
  function mostrarAvisoTemporal(msg) {
    let aviso = $("quizAviso");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "quizAviso";
      aviso.className = "quiz-aviso";
      document.body.appendChild(aviso);
    }
    aviso.textContent = msg;
    aviso.classList.add("visible");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove("visible"), 2600);
  }

  // ---------- eventos ----------

  $("btnStart").addEventListener("click", iniciar);
  $("btnRetry").addEventListener("click", iniciar);
  $("btnRestart").addEventListener("click", iniciar);
  $("btnAnswer").addEventListener("click", responder);
  $("btnNext").addEventListener("click", siguiente);
})();

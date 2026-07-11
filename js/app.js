// ============================================================
// GoF Ultimate Team — render de cartas, química, modal, filtros,
// intercambios banquillo ↔ titular y cambio de formación
// ============================================================

(function () {
  const pitch = document.getElementById("pitch");
  const chemSvg = document.getElementById("chemLines");
  const bench = document.getElementById("bench");
  const modal = document.getElementById("modal");

  const porId = Object.fromEntries(PATRONES.map((p) => [p.id, p]));

  // "retrato" de cada patrón
  const FOTOS = {
    singleton: "🧤", "factory-method": "🏭", "abstract-factory": "🧰",
    builder: "👷", prototype: "🧬", adapter: "🔌", decorator: "🎁",
    facade: "🎭", observer: "👁️", strategy: "🧠", command: "🎮",
    composite: "🌳", bridge: "🌉", flyweight: "🪶", proxy: "🕴️",
    iterator: "🔁", "template-method": "📋", state: "🚦",
    "chain-of-responsibility": "⛓️", mediator: "🗼", memento: "💾",
    visitor: "🩺", interpreter: "🗣️",
  };

  // Huecos de cada formación, en orden: portero → defensa → medio → ataque.
  // Al cambiar de formación, el once se re-coloca en ese mismo orden.
  const FORMACIONES = {
    "4-3-3": [
      { x: 50, y: 90, pos: "POR" },
      { x: 12, y: 68, pos: "LI" }, { x: 32, y: 72, pos: "DFC" }, { x: 68, y: 72, pos: "DFC" }, { x: 88, y: 68, pos: "LD" },
      { x: 24, y: 45, pos: "MC" }, { x: 50, y: 40, pos: "MCO" }, { x: 76, y: 45, pos: "MC" },
      { x: 20, y: 16, pos: "EI" }, { x: 50, y: 12, pos: "DC" }, { x: 80, y: 16, pos: "ED" },
    ],
    "4-4-2": [
      { x: 50, y: 90, pos: "POR" },
      { x: 12, y: 68, pos: "LI" }, { x: 32, y: 72, pos: "DFC" }, { x: 68, y: 72, pos: "DFC" }, { x: 88, y: 68, pos: "LD" },
      { x: 13, y: 42, pos: "MI" }, { x: 37, y: 46, pos: "MC" }, { x: 63, y: 46, pos: "MC" }, { x: 87, y: 42, pos: "MD" },
      { x: 35, y: 14, pos: "DC" }, { x: 65, y: 14, pos: "DC" },
    ],
    "4-2-3-1": [
      { x: 50, y: 90, pos: "POR" },
      { x: 12, y: 68, pos: "LI" }, { x: 32, y: 72, pos: "DFC" }, { x: 68, y: 72, pos: "DFC" }, { x: 88, y: 68, pos: "LD" },
      { x: 37, y: 54, pos: "MCD" }, { x: 63, y: 54, pos: "MCD" },
      { x: 18, y: 30, pos: "MI" }, { x: 50, y: 32, pos: "MCO" }, { x: 82, y: 30, pos: "MD" },
      { x: 50, y: 10, pos: "DC" },
    ],
    "3-5-2": [
      { x: 50, y: 90, pos: "POR" },
      { x: 25, y: 72, pos: "DFC" }, { x: 50, y: 75, pos: "DFC" }, { x: 75, y: 72, pos: "DFC" },
      { x: 10, y: 44, pos: "MI" }, { x: 30, y: 48, pos: "MC" }, { x: 50, y: 40, pos: "MCO" }, { x: 70, y: 48, pos: "MC" }, { x: 90, y: 44, pos: "MD" },
      { x: 35, y: 13, pos: "DC" }, { x: 65, y: 13, pos: "DC" },
    ],
    "5-3-2": [
      { x: 50, y: 90, pos: "POR" },
      { x: 10, y: 62, pos: "CAI" }, { x: 30, y: 72, pos: "DFC" }, { x: 50, y: 75, pos: "DFC" }, { x: 70, y: 72, pos: "DFC" }, { x: 90, y: 62, pos: "CAD" },
      { x: 30, y: 42, pos: "MC" }, { x: 50, y: 37, pos: "MCO" }, { x: 70, y: 42, pos: "MC" },
      { x: 35, y: 13, pos: "DC" }, { x: 65, y: 13, pos: "DC" },
    ],
  };

  let formacionActual = "4-3-3";

  // once titular en el orden de los huecos de la formación
  let once = [
    "singleton",
    "builder", "factory-method", "abstract-factory", "prototype",
    "adapter", "decorator", "facade",
    "observer", "strategy", "command",
  ];

  // orden del banquillo (mutable con los intercambios)
  let banquillo = PATRONES.filter((p) => !once.includes(p.id))
    .sort((a, b) => b.rating - a.rating)
    .map((p) => p.id);

  let filtroActual = "all";
  let seleccionado = null; // id pendiente de intercambio vía botón ⇄

  // asigna huecos de la formación actual al once
  function asignarPosiciones() {
    PATRONES.forEach((p) => {
      p.titular = false;
      p.coords = null;
    });
    const slots = FORMACIONES[formacionActual];
    once.forEach((id, i) => {
      const p = porId[id];
      p.titular = true;
      p.coords = { ...slots[i] };
    });
  }

  // ---------- carta FUT ----------

  function cardHTML(p) {
    const meta = CAT_META[p.categoria];
    const slotPos = p.titular ? p.coords.pos : p.posicion;
    return `
      <div class="card-inner">
        <div class="card-face">
          <div class="card-top">
            <div class="card-meta">
              <span class="card-rating">${p.rating}</span>
              <span class="card-pos">${p.posicion}</span>
              <span class="card-metaline"></span>
              <span class="card-flag" title="${meta.etiqueta}">${meta.icono}</span>
              <span class="card-club">${meta.escudo}</span>
            </div>
            <div class="card-photo">${FOTOS[p.id] || meta.escudo}</div>
          </div>
          <div class="card-name">${p.nombre}</div>
          <div class="card-catrow"><span class="catdot"></span><span>${meta.etiqueta}</span><span class="catdot"></span></div>
        </div>
        <span class="card-swap" title="Intercambiar con otra carta">⇄</span>
      </div>
      <span class="card-postag">${slotPos}</span>`;
  }

  function crearCarta(p) {
    const el = document.createElement("div");
    el.className = "fut-card" + (p.inform ? " inform" : "");
    el.dataset.id = p.id;
    el.dataset.cat = p.categoria;
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("draggable", "true");
    el.setAttribute("aria-label", `${p.nombre}, ${p.rating}, ${CAT_META[p.categoria].etiqueta}`);
    el.innerHTML = cardHTML(p);

    // clic: intercambiar si hay selección pendiente, si no abrir ficha
    el.addEventListener("click", (e) => {
      if (e.target.closest(".card-swap")) {
        toggleSeleccion(p.id);
        return;
      }
      if (seleccionado && seleccionado !== p.id) {
        intercambiar(seleccionado, p.id);
        return;
      }
      abrirModal(p.id);
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });

    // drag & drop
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", p.id);
      e.dataTransfer.effectAllowed = "move";
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", () => el.classList.remove("dragging"));
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      el.classList.add("drop-target");
    });
    el.addEventListener("dragleave", () => el.classList.remove("drop-target"));
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      el.classList.remove("drop-target");
      const otro = e.dataTransfer.getData("text/plain");
      if (otro && otro !== p.id) intercambiar(otro, p.id);
    });

    return el;
  }

  // ---------- intercambios ----------

  function toggleSeleccion(id) {
    seleccionado = seleccionado === id ? null : id;
    document.querySelectorAll(".fut-card").forEach((c) =>
      c.classList.toggle("selected", c.dataset.id === seleccionado)
    );
  }

  function intercambiar(idA, idB) {
    const i = once.indexOf(idA);
    const j = once.indexOf(idB);

    if (i >= 0 && j >= 0) {
      // dos titulares: se cambian el hueco de la formación
      [once[i], once[j]] = [once[j], once[i]];
    } else if (i < 0 && j < 0) {
      // dos suplentes: se cambian el sitio en el banquillo
      const bi = banquillo.indexOf(idA);
      const bj = banquillo.indexOf(idB);
      [banquillo[bi], banquillo[bj]] = [banquillo[bj], banquillo[bi]];
    } else {
      // suplente ↔ titular
      const idxOnce = i >= 0 ? i : j;
      const idSuplente = i >= 0 ? idB : idA;
      const idTitular = once[idxOnce];
      once[idxOnce] = idSuplente;
      banquillo[banquillo.indexOf(idSuplente)] = idTitular;
    }

    seleccionado = null;
    render();
  }

  // ---------- cambio de formación ----------

  const selFormacion = document.getElementById("selFormacion");
  Object.keys(FORMACIONES).forEach((nombre) => {
    const opt = document.createElement("option");
    opt.value = nombre;
    opt.textContent = nombre;
    selFormacion.appendChild(opt);
  });
  selFormacion.value = formacionActual;
  selFormacion.addEventListener("change", () => {
    formacionActual = selFormacion.value;
    seleccionado = null;
    render();
  });

  // ---------- render de campo y banquillo ----------

  function render() {
    asignarPosiciones();

    pitch.querySelectorAll(".fut-card").forEach((el) => el.remove());
    once.forEach((id) => {
      const p = porId[id];
      const carta = crearCarta(p);
      carta.style.left = p.coords.x + "%";
      carta.style.top = p.coords.y + "%";
      pitch.appendChild(carta);
    });

    bench.innerHTML = "";
    banquillo.forEach((id) => bench.appendChild(crearCarta(porId[id])));

    dibujarQuimica();
    aplicarFiltro();
    actualizarMedia();
  }

  function actualizarMedia() {
    const el = document.getElementById("mediaEquipo");
    if (!el) return;
    const media = Math.round(once.reduce((s, id) => s + porId[id].rating, 0) / once.length);
    el.textContent = media;
  }

  // ---------- líneas de química ----------

  function dibujarQuimica() {
    const pintadas = new Set();
    chemSvg.setAttribute("viewBox", "0 0 100 130");
    chemSvg.setAttribute("preserveAspectRatio", "none");
    chemSvg.innerHTML = "";

    once.forEach((id) => {
      const p = porId[id];
      p.quimica.forEach((otroId) => {
        const otro = porId[otroId];
        if (!otro || !otro.titular) return;
        const clave = [p.id, otroId].sort().join("|");
        if (pintadas.has(clave)) return;
        pintadas.add(clave);

        // química fuerte (verde) si es recíproca, parcial (naranja) si no
        const reciproca = otro.quimica.includes(p.id);
        const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
        linea.setAttribute("x1", p.coords.x);
        linea.setAttribute("y1", p.coords.y * 1.3);
        linea.setAttribute("x2", otro.coords.x);
        linea.setAttribute("y2", otro.coords.y * 1.3);
        linea.setAttribute("stroke", reciproca ? "#7CFC00" : "#ffa726");
        linea.setAttribute("stroke-width", "0.55");
        linea.setAttribute("stroke-linecap", "round");
        linea.setAttribute("opacity", "0.85");
        chemSvg.appendChild(linea);
      });
    });
  }

  // ---------- filtros por categoría ----------

  function aplicarFiltro() {
    document.querySelectorAll(".pitch .fut-card, .bench .fut-card").forEach((carta) => {
      carta.classList.toggle("dimmed", filtroActual !== "all" && carta.dataset.cat !== filtroActual);
    });
  }

  document.querySelectorAll(".cat-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      filtroActual = chip.dataset.cat;
      aplicarFiltro();
    });
  });

  // ---------- resaltado Python simple ----------

  function escaparHTML(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function resaltarPython(codigo) {
    let html = escaparHTML(codigo);
    // comentarios y strings primero (con marcadores para no re-tokenizar dentro)
    const trozos = [];
    html = html.replace(/(#[^\n]*|&quot;.*?&quot;|"[^"\n]*"|'[^'\n]*'|f"[^"\n]*")/g, (m) => {
      const esComentario = m.startsWith("#");
      trozos.push(`<span class="${esComentario ? "tok-com" : "tok-str"}">${m}</span>`);
      return ` ${trozos.length - 1} `;
    });
    html = html
      .replace(/\b(class|def|return|if|else|elif|for|in|while|import|from|None|True|False|self|cls|is|not|and|or|pass|yield|lambda|super|raise)\b/g,
        '<span class="tok-kw">$1</span>')
      .replace(/\b(def|class)\b(<\/span>)?\s+(\w+)/g, (m, kw, cierre, nombre) =>
        m.replace(nombre, `<span class="tok-def">${nombre}</span>`));
    html = html.replace(/ (\d+) /g, (m, i) => trozos[+i]);
    return html;
  }

  // ---------- modal de detalle ----------

  const $ = (id) => document.getElementById(id);

  function abrirModal(id) {
    const p = porId[id];

    const col = $("modalCardCol");
    col.innerHTML = "";
    col.appendChild(crearCarta(p));

    $("modalTitle").textContent = p.nombre;
    $("modalIntent").textContent = p.intencion;
    $("modalProblema").textContent = p.problema;
    $("modalSolucion").textContent = p.solucion;
    $("modalAnalogia").textContent = p.analogia;
    $("modalCodigo").innerHTML = resaltarPython(p.codigo);

    // stats
    const stats = $("modalStats");
    stats.innerHTML = Object.entries(p.stats)
      .map(([nombre, val]) => `
        <div class="stat-row">
          <span class="stat-name">${nombre}</span>
          <span class="stat-bar"><span class="stat-fill" style="width:${val}%"></span></span>
          <span class="stat-val">${val}</span>
        </div>`)
      .join("");

    // química
    const chem = $("modalChem");
    chem.innerHTML =
      "<h5>Buena química con</h5>" +
      p.quimica
        .filter((qid) => porId[qid])
        .map((qid) => `<button class="chem-link" data-id="${qid}">${porId[qid].nombre} · ${porId[qid].rating}</button>`)
        .join("");
    chem.querySelectorAll(".chem-link").forEach((b) =>
      b.addEventListener("click", () => abrirModal(b.dataset.id))
    );

    activarTab("explicacion");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function cerrarModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function activarTab(nombre) {
    document.querySelectorAll(".tab").forEach((t) =>
      t.classList.toggle("active", t.dataset.tab === nombre)
    );
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.hidden = panel.id !== "panel-" + nombre;
    });
  }

  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => activarTab(t.dataset.tab))
  );
  $("modalClose").addEventListener("click", cerrarModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!modal.hidden) cerrarModal();
      else if (seleccionado) toggleSeleccion(seleccionado);
    }
  });

  render();
})();

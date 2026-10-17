(function () {
  "use strict";

  var PI = Math.PI;
  var nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 4 });
  function fmt(x) { return nf.format(x); }

  // Accepts "12,5", "12.5" and "1.234,5"
  function parse(s) {
    s = String(s).trim().replace(/\s/g, "");
    if (!s) return NaN;
    if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");
    return Number(s);
  }

  var SHAPES = {
    kreis_r: {
      formula: "U = 2 · π · r",
      fields: [{ id: "r", label: "Radius r", def: 5 }],
      calc: function (v, u) {
        var U = 2 * PI * v.r;
        return { U: U, steps: [
          "U = 2 · π · " + fmt(v.r) + " " + u,
          "U = " + fmt(U) + " " + u
        ] };
      }
    },
    kreis_d: {
      formula: "U = π · d",
      fields: [{ id: "d", label: "Durchmesser d", def: 10 }],
      calc: function (v, u) {
        var U = PI * v.d;
        return { U: U, steps: [
          "U = π · " + fmt(v.d) + " " + u,
          "U = " + fmt(U) + " " + u
        ] };
      }
    },
    kreis_a: {
      formula: "U = 2 · √(π · A)",
      fields: [{ id: "A", label: "Fläche A", def: 78.54, area: true }],
      calc: function (v, u) {
        var r = Math.sqrt(v.A / PI);
        var U = 2 * PI * r;
        return { U: U, steps: [
          "r = √(A ÷ π) = √(" + fmt(v.A) + " " + u + "² ÷ π) = " + fmt(r) + " " + u,
          "U = 2 · π · " + fmt(r) + " " + u + " = " + fmt(U) + " " + u
        ] };
      }
    },
    rechteck: {
      formula: "U = 2 · (a + b)",
      fields: [
        { id: "a", label: "Seite a", def: 8 },
        { id: "b", label: "Seite b", def: 5 }
      ],
      calc: function (v, u) {
        var U = 2 * (v.a + v.b);
        return { U: U, steps: [
          "U = 2 · (" + fmt(v.a) + " " + u + " + " + fmt(v.b) + " " + u + ")",
          "U = " + fmt(U) + " " + u
        ] };
      }
    },
    quadrat: {
      formula: "U = 4 · a",
      fields: [{ id: "a", label: "Seite a", def: 6 }],
      calc: function (v, u) {
        var U = 4 * v.a;
        return { U: U, steps: [
          "U = 4 · " + fmt(v.a) + " " + u,
          "U = " + fmt(U) + " " + u
        ] };
      }
    },
    dreieck: {
      formula: "U = a + b + c",
      fields: [
        { id: "a", label: "Seite a", def: 3 },
        { id: "b", label: "Seite b", def: 4 },
        { id: "c", label: "Seite c", def: 5 }
      ],
      validate: function (v) {
        var m = Math.max(v.a, v.b, v.c);
        var rest = v.a + v.b + v.c - m;
        return m < rest ? "" : "Mit diesen Seiten entsteht kein Dreieck: Die längste Seite muss kürzer sein als die Summe der beiden anderen.";
      },
      calc: function (v, u) {
        var U = v.a + v.b + v.c;
        return { U: U, steps: [
          "U = " + fmt(v.a) + " " + u + " + " + fmt(v.b) + " " + u + " + " + fmt(v.c) + " " + u,
          "U = " + fmt(U) + " " + u
        ] };
      }
    },
    parallelogramm: {
      formula: "U = 2 · (a + b)",
      fields: [
        { id: "a", label: "Seite a", def: 9 },
        { id: "b", label: "Seite b", def: 5 }
      ],
      calc: function (v, u) {
        var U = 2 * (v.a + v.b);
        return { U: U, steps: [
          "U = 2 · (" + fmt(v.a) + " " + u + " + " + fmt(v.b) + " " + u + ")",
          "U = " + fmt(U) + " " + u
        ] };
      }
    },
    raute: {
      formula: "U = 4 · a",
      fields: [{ id: "a", label: "Seite a", def: 6 }],
      calc: function (v, u) {
        var U = 4 * v.a;
        return { U: U, steps: [
          "U = 4 · " + fmt(v.a) + " " + u,
          "U = " + fmt(U) + " " + u
        ] };
      }
    },
    trapez: {
      formula: "U = a + b + c + d",
      fields: [
        { id: "a", label: "Grundseite a", def: 10 },
        { id: "b", label: "Schenkel b", def: 5 },
        { id: "c", label: "Deckseite c", def: 6 },
        { id: "d", label: "Schenkel d", def: 5 }
      ],
      calc: function (v, u) {
        var U = v.a + v.b + v.c + v.d;
        return { U: U, steps: [
          "U = " + fmt(v.a) + " " + u + " + " + fmt(v.b) + " " + u + " + " + fmt(v.c) + " " + u + " + " + fmt(v.d) + " " + u,
          "U = " + fmt(U) + " " + u
        ] };
      }
    },
    ellipse: {
      formula: "U ≈ π · [3 · (a + b) − √((3a + b) · (a + 3b))]",
      fields: [
        { id: "a", label: "Halbachse a", def: 5 },
        { id: "b", label: "Halbachse b", def: 3 }
      ],
      note: "Für die Ellipse gibt es keine exakte einfache Formel. Der Rechner nutzt die Näherung nach Ramanujan, die sehr genau ist.",
      calc: function (v, u) {
        var s = 3 * (v.a + v.b);
        var w = Math.sqrt((3 * v.a + v.b) * (v.a + 3 * v.b));
        var U = PI * (s - w);
        return { U: U, steps: [
          "3 · (a + b) = 3 · (" + fmt(v.a) + " + " + fmt(v.b) + ") = " + fmt(s),
          "√((3a + b) · (a + 3b)) = " + fmt(w),
          "U ≈ π · (" + fmt(s) + " − " + fmt(w) + ") = " + fmt(U) + " " + u
        ] };
      }
    },
    vieleck: {
      formula: "U = n · a",
      fields: [
        { id: "n", label: "Anzahl der Seiten n", def: 6, noUnit: true, integer: true },
        { id: "a", label: "Seitenlänge a", def: 4 }
      ],
      validate: function (v) {
        return (v.n >= 3 && Math.floor(v.n) === v.n) ? "" : "Die Anzahl der Seiten muss eine ganze Zahl ab 3 sein.";
      },
      calc: function (v, u) {
        var U = v.n * v.a;
        return { U: U, steps: [
          "U = " + fmt(v.n) + " · " + fmt(v.a) + " " + u,
          "U = " + fmt(U) + " " + u
        ] };
      }
    }
  };

  function svg(inner) {
    return '<svg viewBox="0 0 200 160" focusable="false">' + inner + "</svg>";
  }
  function t(x, y, s, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '">' + s + "</text>";
  }
  var DIAGRAMS = {
    kreis_r: svg('<circle class="shape" cx="100" cy="80" r="55"/><line class="guide" x1="100" y1="80" x2="155" y2="80"/><circle cx="100" cy="80" r="2.5" class="dot"/>' + t(128, 72, "r")),
    kreis_d: svg('<circle class="shape" cx="100" cy="80" r="55"/><line class="guide" x1="45" y1="80" x2="155" y2="80"/>' + t(100, 72, "d")),
    kreis_a: svg('<circle class="shape" cx="100" cy="80" r="55"/>' + t(100, 87, "A")),
    rechteck: svg('<rect class="shape" x="30" y="40" width="140" height="80"/>' + t(100, 142, "a") + t(186, 85, "b")),
    quadrat: svg('<rect class="shape" x="55" y="30" width="100" height="100"/>' + t(105, 150, "a")),
    dreieck: svg('<polygon class="shape" points="100,25 30,130 170,130"/>' + t(100, 149, "a") + t(147, 72, "b") + t(53, 72, "c")),
    parallelogramm: svg('<polygon class="shape" points="60,40 180,40 140,125 20,125"/>' + t(80, 144, "a") + t(176, 88, "b")),
    raute: svg('<polygon class="shape" points="100,20 175,80 100,140 25,80"/>' + t(155, 46, "a")),
    trapez: svg('<polygon class="shape" points="60,45 140,45 180,125 20,125"/>' + t(100, 37, "c") + t(100, 144, "a") + t(177, 90, "b") + t(23, 90, "d")),
    ellipse: svg('<ellipse class="shape" cx="100" cy="80" rx="78" ry="48"/><line class="guide" x1="100" y1="80" x2="178" y2="80"/><line class="guide" x1="100" y1="80" x2="100" y2="32"/><circle cx="100" cy="80" r="2.5" class="dot"/>' + t(140, 72, "a") + t(109, 60, "b", "start")),
    vieleck: svg('<polygon class="shape" points="155,80 127.5,127.6 72.5,127.6 45,80 72.5,32.4 127.5,32.4"/>' + t(100, 148, "a") + t(100, 85, "n Seiten"))
  };

  if (typeof module !== "undefined") module.exports = { SHAPES: SHAPES, fmt: fmt, parse: parse };
  if (typeof document === "undefined") return;

  function $(id) { return document.getElementById(id); }

  function init() {
    var shapeSel = $("calc-shape");
    if (!shapeSel) return;
    var unitSel = $("calc-unit");
    var fieldsEl = $("calc-fields");
    var diagEl = $("calc-diagram");
    var valEl = $("calc-value");
    var formulaEl = $("calc-formula");
    var stepsEl = $("calc-steps");
    var noteEl = $("calc-note");
    var msgEl = $("calc-msg");
    var copyBtn = $("calc-copy");
    var lastText = "";
    var inputs = [];

    function suffixFor(f) {
      if (f.noUnit) return "";
      return f.area ? unitSel.value + "²" : unitSel.value;
    }

    function renderFields() {
      var s = SHAPES[shapeSel.value];
      fieldsEl.innerHTML = "";
      inputs = [];
      s.fields.forEach(function (f) {
        var wrap = document.createElement("div");
        var label = document.createElement("label");
        label.setAttribute("for", "calc-f-" + f.id);
        label.textContent = f.label;
        var box = document.createElement("div");
        box.className = "input-wrap";
        var input = document.createElement("input");
        input.type = "text";
        input.id = "calc-f-" + f.id;
        input.setAttribute("inputmode", f.integer ? "numeric" : "decimal");
        input.setAttribute("autocomplete", "off");
        input.value = String(f.def).replace(".", ",");
        input.addEventListener("input", compute);
        var suf = document.createElement("span");
        suf.className = "suffix";
        suf.textContent = suffixFor(f);
        box.appendChild(input);
        box.appendChild(suf);
        wrap.appendChild(label);
        wrap.appendChild(box);
        fieldsEl.appendChild(wrap);
        inputs.push({ f: f, input: input, suf: suf });
      });
      diagEl.innerHTML = DIAGRAMS[shapeSel.value];
      formulaEl.textContent = "Formel: " + s.formula;
      noteEl.textContent = "";
      compute();
    }

    function clearResult(message, isError) {
      valEl.textContent = "–";
      stepsEl.innerHTML = "";
      noteEl.textContent = "";
      copyBtn.hidden = true;
      lastText = "";
      msgEl.textContent = message;
      msgEl.className = "res-msg" + (isError ? " is-error" : "");
    }

    function compute() {
      var s = SHAPES[shapeSel.value];
      var u = unitSel.value;
      var v = {};
      var empty = false, bad = false;
      inputs.forEach(function (x) {
        var raw = x.input.value;
        if (!raw.trim()) { empty = true; return; }
        var n = parse(raw);
        if (!isFinite(n) || n <= 0) bad = true; else v[x.f.id] = n;
      });
      if (empty) return clearResult("Gib alle Maße ein, um den Umfang zu berechnen.", false);
      if (bad) return clearResult("Bitte nur Zahlen größer als null eingeben.", true);
      var err = s.validate ? s.validate(v) : "";
      if (err) return clearResult(err, true);

      var res = s.calc(v, u);
      var text = fmt(res.U) + " " + u;
      valEl.textContent = text;
      msgEl.textContent = "";
      msgEl.className = "res-msg";
      stepsEl.innerHTML = "";
      res.steps.forEach(function (line) {
        var li = document.createElement("li");
        li.textContent = line;
        stepsEl.appendChild(li);
      });
      noteEl.textContent = s.note || "";
      copyBtn.hidden = false;
      lastText = "Umfang: " + text;
    }

    function updateSuffixes() {
      inputs.forEach(function (x) { x.suf.textContent = suffixFor(x.f); });
      compute();
    }

    function copy() {
      if (!lastText) return;
      function done() {
        copyBtn.textContent = "Kopiert";
        setTimeout(function () { copyBtn.textContent = "Ergebnis kopieren"; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastText).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = lastText;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    }

    shapeSel.addEventListener("change", renderFields);
    unitSel.addEventListener("change", updateSuffixes);
    copyBtn.addEventListener("click", copy);
    renderFields();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

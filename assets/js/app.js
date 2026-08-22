/* ==========================================================================
   Formation Claude — moteur du site
   Niveaux (filtrage), progression (localStorage), quiz, copie de code.
   Aucune dépendance.
   ========================================================================== */
(function () {
  "use strict";

  var LEVELS = ["debutant", "intermediaire", "pro"];
  var LEVEL_LABELS = { debutant: "🟢 Débutant", intermediaire: "🟠 Intermédiaire", pro: "🟣 Pro" };
  var LS_LEVEL = "fc-level";
  var LS_DONE = "fc-done";

  /* ---------- utilitaires localStorage (peut être indisponible) ---------- */
  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function getLevel() {
    var l = lsGet(LS_LEVEL);
    return LEVELS.indexOf(l) !== -1 ? l : "debutant";
  }
  function levelRank(l) { return LEVELS.indexOf(l); }

  function getDone() {
    try { return JSON.parse(lsGet(LS_DONE) || "{}") || {}; } catch (e) { return {}; }
  }
  function setDone(map) { lsSet(LS_DONE, JSON.stringify(map)); }

  /* ---------------------- commutateur de niveau -------------------------- */
  function buildSwitcher() {
    var mount = document.querySelector("[data-level-switcher]");
    if (!mount) return;
    var wrap = document.createElement("div");
    wrap.className = "level-switcher";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Choix du niveau");
    LEVELS.forEach(function (l) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = LEVEL_LABELS[l];
      btn.dataset.level = l;
      btn.addEventListener("click", function () { setLevel(l); });
      wrap.appendChild(btn);
    });
    mount.appendChild(wrap);
  }

  function setLevel(l) {
    lsSet(LS_LEVEL, l);
    applyLevel();
  }

  function applyLevel() {
    var current = getLevel();
    var rank = levelRank(current);

    document.querySelectorAll(".level-switcher button").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.level === current);
    });
    document.querySelectorAll(".level-card").forEach(function (card) {
      card.classList.toggle("selected", card.dataset.level === current);
    });

    var hiddenLessons = 0;
    document.querySelectorAll("[data-level]").forEach(function (el) {
      if (!el.dataset.level || el.classList.contains("level-card")) return;
      var show = levelRank(el.dataset.level) <= rank;
      el.hidden = !show;
      // On ne compte que les vraies unités de contenu, pas les titres de section :
      // annoncer « 10 sections masquées » là où il n'y a que 6 leçons induit en erreur.
      if (!show && (el.classList.contains("lesson") || el.classList.contains("exercise"))) {
        hiddenLessons++;
      }
    });
    var hidden = hiddenLessons;

    var notice = document.querySelector("[data-hidden-notice]");
    if (notice) {
      if (hidden > 0 && current !== "pro") {
        notice.hidden = false;
        notice.innerHTML =
          "🔒 " + hidden +
          (hidden > 1 ? " leçons et exercices sont masqués" : " leçon est masquée") +
          " à votre niveau actuel (" + LEVEL_LABELS[current] + "). " +
          '<button type="button" data-unlock>Passer au niveau supérieur</button>';
        notice.querySelector("[data-unlock]").addEventListener("click", function () {
          setLevel(LEVELS[Math.min(rank + 1, LEVELS.length - 1)]);
        });
      } else {
        notice.hidden = true;
      }
    }

    updatePageProgress();
    updateModuleCards();
  }

  /* -------------------------- progression -------------------------------- */
  function buildDoneButtons() {
    document.querySelectorAll(".lesson[data-lesson]").forEach(function (lesson) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mark-done";
      lesson.appendChild(btn);
      btn.addEventListener("click", function () {
        var map = getDone();
        var id = lesson.dataset.lesson;
        if (map[id]) delete map[id]; else map[id] = 1;
        setDone(map);
        refreshDoneStates();
        updatePageProgress();
      });
    });
    refreshDoneStates();
  }

  function refreshDoneStates() {
    var map = getDone();
    document.querySelectorAll(".lesson[data-lesson]").forEach(function (lesson) {
      var done = !!map[lesson.dataset.lesson];
      lesson.classList.toggle("done", done);
      var btn = lesson.querySelector(".mark-done");
      if (btn) {
        btn.classList.toggle("is-done", done);
        btn.textContent = done ? "✓ Terminé — cliquer pour annuler" : "Marquer comme terminé";
      }
    });
  }

  function updatePageProgress() {
    var box = document.querySelector("[data-page-progress]");
    if (!box) return;
    var map = getDone();
    var lessons = Array.prototype.filter.call(
      document.querySelectorAll(".lesson[data-lesson]"),
      function (l) { return !l.hidden; }
    );
    var total = lessons.length;
    var done = lessons.filter(function (l) { return !!map[l.dataset.lesson]; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    box.innerHTML =
      "<strong>Progression du module :</strong> " + done + " / " + total +
      " leçons terminées (" + pct + " %)" +
      '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  }

  /* Cartes de modules sur l'accueil : data-module + data-total */
  function updateModuleCards() {
    var cards = document.querySelectorAll(".module-card[data-module]");
    if (!cards.length) return;
    var map = getDone();
    cards.forEach(function (card) {
      var prefix = card.dataset.module + ":";
      var total = parseInt(card.dataset.total || "0", 10);
      var done = Object.keys(map).filter(function (k) { return k.indexOf(prefix) === 0; }).length;
      if (done > total) done = total;
      var pct = total ? Math.round((done / total) * 100) : 0;
      var meta = card.querySelector(".meta");
      if (meta) meta.textContent = done + " / " + total + " leçons terminées";
      var fill = card.querySelector(".progress-fill");
      if (fill) fill.style.width = pct + "%";
    });
  }

  /* ------------------------------ quiz ----------------------------------- */
  function buildQuizzes() {
    document.querySelectorAll(".quiz").forEach(function (quiz) {
      var questions = quiz.querySelectorAll(".quiz-q");
      var scoreEl = quiz.querySelector(".quiz-score");
      questions.forEach(function (q) {
        q.querySelectorAll(".quiz-opt").forEach(function (opt) {
          opt.addEventListener("click", function () {
            if (q.classList.contains("answered")) return;
            q.classList.add("answered");
            var correct = opt.dataset.correct === "true";
            q.dataset.result = correct ? "1" : "0";
            q.querySelectorAll(".quiz-opt").forEach(function (o) {
              o.disabled = true;
              if (o.dataset.correct === "true") o.classList.add("correct");
            });
            if (!correct) opt.classList.add("wrong");
            updateScore();
          });
        });
      });
      function updateScore() {
        if (!scoreEl) return;
        var answered = quiz.querySelectorAll(".quiz-q.answered").length;
        if (answered < questions.length) return;
        var good = quiz.querySelectorAll('.quiz-q[data-result="1"]').length;
        scoreEl.style.display = "block";
        var msg = good === questions.length ? " Sans faute, bravo ! 🎉"
          : good >= questions.length / 2 ? " Bien joué — relisez les explications des questions manquées."
          : " Relisez le module puis retentez le quiz.";
        scoreEl.textContent = "Score : " + good + " / " + questions.length + "." + msg;
      }
    });
  }

  /* ------------------------ boutons « copier » --------------------------- */
  function buildCopyButtons() {
    if (!navigator.clipboard) return;
    document.querySelectorAll("pre > code").forEach(function (code) {
      var pre = code.parentElement;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copier";
      btn.addEventListener("click", function () {
        navigator.clipboard.writeText(code.innerText).then(function () {
          btn.textContent = "Copié ✓";
          btn.classList.add("copied");
          setTimeout(function () {
            btn.textContent = "Copier";
            btn.classList.remove("copied");
          }, 1800);
        });
      });
      pre.appendChild(btn);
    });
  }

  /* --------------- cartes de choix de niveau (accueil) ------------------- */
  function buildLevelCards() {
    document.querySelectorAll(".level-card[data-level]").forEach(function (card) {
      card.addEventListener("click", function () { setLevel(card.dataset.level); });
    });
  }

  /* ------------------------------- init ---------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildSwitcher();
    buildLevelCards();
    buildDoneButtons();
    buildQuizzes();
    buildCopyButtons();
    applyLevel();
  });
})();

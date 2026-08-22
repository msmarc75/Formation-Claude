/* ==========================================================================
   Formation Claude — version freemium (v2)
   Reprend le moteur de la v1 (niveaux, progression, quiz, copie de code)
   et ajoute la couche commerciale : formule, verrouillage, tunnel simulé.

   AVERTISSEMENT : le verrouillage ci-dessous est une DÉMONSTRATION.
   Le contenu premium est présent dans le HTML servi : n'importe qui peut
   le lire en désactivant JavaScript ou en ouvrant le code source. Une
   protection réelle exige un serveur qui ne renvoie le contenu qu'après
   vérification du droit d'accès.
   ========================================================================== */
(function () {
  "use strict";

  var LEVELS = ["debutant", "intermediaire", "pro"];
  var LEVEL_LABELS = { debutant: "🟢 Débutant", intermediaire: "🟠 Intermédiaire", pro: "🟣 Pro" };
  var FREE_LEVELS = ["debutant"];          // ce que la formule gratuite ouvre
  var LS_LEVEL = "fc2-level";
  var LS_DONE = "fc2-done";
  var LS_PLAN = "fc2-plan";                // "gratuit" | "premium"
  var LS_BAR = "fc2-bar-closed";

  var PRICES = { mensuel: 19, annuel: 15 }; // € HT / mois, annuel facturé en une fois

  /* ---------------------------- stockage --------------------------------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function getLevel() {
    var l = lsGet(LS_LEVEL);
    return LEVELS.indexOf(l) !== -1 ? l : "debutant";
  }
  function levelRank(l) { return LEVELS.indexOf(l); }

  function getPlan() { return lsGet(LS_PLAN) === "premium" ? "premium" : "gratuit"; }
  function isPremium() { return getPlan() === "premium"; }
  function levelIsFree(l) { return FREE_LEVELS.indexOf(l) !== -1; }
  /* Un niveau est accessible si l'abonnement est actif, ou s'il est gratuit. */
  function canAccess(l) { return isPremium() || levelIsFree(l); }

  function setPlan(p) {
    lsSet(LS_PLAN, p === "premium" ? "premium" : "gratuit");
    // Repasser en gratuit alors qu'on lisait un niveau premium : on redescend.
    if (!isPremium() && !canAccess(getLevel())) lsSet(LS_LEVEL, "debutant");
    render();
  }
  window.fcSetPlan = setPlan;   // utilisé par les pages tarifs / compte / tunnel
  window.fcGetPlan = getPlan;
  window.fcPrices = PRICES;

  function getDone() {
    try { return JSON.parse(lsGet(LS_DONE) || "{}") || {}; } catch (e) { return {}; }
  }
  function setDone(m) { lsSet(LS_DONE, JSON.stringify(m)); }

  /* ------------------------ en-tête : formule ---------------------------- */
  function buildPlanPill() {
    var mount = document.querySelector("[data-plan-pill]");
    if (!mount) return;
    mount.innerHTML = "";
    var a = document.createElement("a");
    if (isPremium()) {
      a.className = "plan-pill premium";
      a.href = mount.dataset.base + "compte.html";
      a.textContent = "★ Premium";
    } else {
      a.className = "plan-pill gratuit";
      a.href = mount.dataset.base + "tarifs.html";
      a.textContent = "Passer Premium";
    }
    mount.appendChild(a);
  }

  /* ---------------------- commutateur de niveau -------------------------- */
  function buildSwitcher() {
    var mount = document.querySelector("[data-level-switcher]");
    if (!mount || mount.querySelector(".level-switcher")) return;
    var wrap = document.createElement("div");
    wrap.className = "level-switcher";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Choix du niveau");
    LEVELS.forEach(function (l) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = LEVEL_LABELS[l];
      // data-set-level, et non data-level : le filtrage de contenu masque
      // tout élément [data-level] au-dessus du niveau courant, ce qui ferait
      // disparaître les boutons eux-mêmes.
      btn.dataset.setLevel = l;
      btn.addEventListener("click", function () {
        if (!canAccess(l)) { goUpgrade("niveau-" + l); return; }
        lsSet(LS_LEVEL, l);
        render();
      });
      wrap.appendChild(btn);
    });
    mount.appendChild(wrap);
  }

  function base() {
    var m = document.querySelector("[data-plan-pill]");
    return m ? m.dataset.base : "";
  }
  function goUpgrade(source) {
    window.location.href = base() + "tarifs.html?src=" + encodeURIComponent(source || "");
  }

  /* ------------------- verrouillage des leçons premium ------------------- */
  /* Une leçon premium n'est pas escamotée : elle devient une carte qui montre
     son vrai titre et ses premières lignes. Le contenu masqué se vend ainsi
     lui-même, au lieu de laisser un trou inexpliqué dans la page. */
  function applyLocking() {
    document.querySelectorAll(".lesson[data-level]").forEach(function (el) {
      var locked = !canAccess(el.dataset.level);
      el.classList.toggle("is-locked-source", locked);
    });
    document.querySelectorAll(".lesson-locked[data-level]").forEach(function (card) {
      card.hidden = canAccess(card.dataset.level);
    });
    // Sections de bibliothèque réservées (glossaire, révision, aide-mémoire).
    document.querySelectorAll("[data-premium-block]").forEach(function (b) {
      b.hidden = !isPremium();
    });
    document.querySelectorAll("[data-premium-locked]").forEach(function (b) {
      b.hidden = isPremium();
    });
    // Corrigés d'exercices : réservés aussi.
    document.querySelectorAll("details.solution[data-premium]").forEach(function (d) {
      var locked = !isPremium();
      d.hidden = locked;
      var alt = d.nextElementSibling;
      if (alt && alt.classList.contains("solution-locked")) alt.hidden = !locked;
    });
  }

  /* -------------------- filtrage par niveau (v1) ------------------------- */
  function applyLevel() {
    var current = getLevel();
    if (!canAccess(current)) current = "debutant";
    var rank = levelRank(current);

    document.querySelectorAll(".level-switcher button").forEach(function (btn) {
      var l = btn.dataset.setLevel;
      btn.classList.toggle("active", l === current);
      btn.classList.toggle("locked", !canAccess(l));
      btn.title = canAccess(l) ? "" : "Niveau réservé à la formule Premium";
    });
    document.querySelectorAll(".level-card").forEach(function (c) {
      c.classList.toggle("selected", c.dataset.level === current);
    });

    var hiddenUnits = 0;
    document.querySelectorAll("[data-level]").forEach(function (el) {
      if (!el.dataset.level || el.closest(".level-switcher") ||
          el.classList.contains("level-card")) return;

      var accessible = canAccess(el.dataset.level);
      var withinLevel = levelRank(el.dataset.level) <= rank;

      if (el.classList.contains("lesson-locked")) {
        // Une carte de verrouillage s'affiche dès que le contenu est inaccessible,
        // sans tenir compte du niveau choisi : en formule gratuite le niveau est
        // de toute façon ramené à Débutant, et filtrer les cartes reviendrait à
        // masquer l'offre elle-même. Ces cartes SONT l'argumentaire.
        el.hidden = accessible;
        return;
      }
      if (el.classList.contains("exercise")) {
        // Les énoncés d'exercices sont inclus dans la formule gratuite : seuls
        // les corrigés sont réservés. Comme le niveau est épinglé à Débutant en
        // gratuit, les filtrer par niveau en cacherait 16 sur 24 alors qu'ils
        // sont annoncés comme inclus. Le filtrage par niveau ne s'applique donc
        // qu'aux abonnés, pour qui il garde son sens pédagogique.
        el.hidden = isPremium() ? !withinLevel : false;
        if (el.hidden) hiddenUnits++;
        return;
      }
      var show = accessible && withinLevel;
      el.hidden = !show;
      if (!show && accessible &&
          (el.classList.contains("lesson") || el.classList.contains("exercise"))) {
        hiddenUnits++;
      }
    });

    var notice = document.querySelector("[data-hidden-notice]");
    if (notice) {
      if (hiddenUnits > 0 && current !== "pro") {
        notice.hidden = false;
        notice.innerHTML = "🔒 " + hiddenUnits +
          (hiddenUnits > 1 ? " sections sont masquées" : " section est masquée") +
          " à votre niveau actuel (" + LEVEL_LABELS[current] + "). " +
          '<button type="button" data-unlock>Passer au niveau supérieur</button>';
        notice.querySelector("[data-unlock]").addEventListener("click", function () {
          var next = LEVELS[Math.min(rank + 1, LEVELS.length - 1)];
          if (!canAccess(next)) { goUpgrade("bandeau-niveau"); return; }
          lsSet(LS_LEVEL, next);
          render();
        });
      } else {
        notice.hidden = true;
      }
    }
  }

  /* ------------------- compteur de valeur du module ---------------------- */
  function updateValueTeaser() {
    var box = document.querySelector("[data-value-teaser]");
    if (!box) return;
    if (isPremium()) { box.hidden = true; return; }
    var lessons = document.querySelectorAll(".lesson-locked[data-level]").length;
    var sols = document.querySelectorAll("details.solution[data-premium]").length;
    if (!lessons && !sols) { box.hidden = true; return; }
    box.hidden = false;
    var bits = [];
    if (lessons) bits.push("<strong>" + lessons + " leçon" + (lessons > 1 ? "s" : "") + "</strong>");
    if (sols) bits.push("<strong>" + sols + " corrigé" + (sols > 1 ? "s" : "") + "</strong>");
    box.innerHTML =
      '<span class="vt-text">✦ Ce module contient ' + bits.join(" et ") +
      ' réservés à la formule Premium.</span>' +
      '<a class="btn btn-gold" href="' + base() + 'tarifs.html?src=module">Voir les formules</a>';
  }

  /* ----------------------------- progression ----------------------------- */
  function buildDoneButtons() {
    document.querySelectorAll(".lesson[data-lesson]").forEach(function (lesson) {
      if (lesson.querySelector(".mark-done")) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mark-done";
      lesson.appendChild(btn);
      btn.addEventListener("click", function () {
        var map = getDone(), id = lesson.dataset.lesson;
        if (map[id]) delete map[id]; else map[id] = 1;
        setDone(map);
        refreshDone();
        updatePageProgress();
      });
    });
  }
  function refreshDone() {
    var map = getDone();
    document.querySelectorAll(".lesson[data-lesson]").forEach(function (l) {
      var d = !!map[l.dataset.lesson];
      l.classList.toggle("done", d);
      var b = l.querySelector(".mark-done");
      if (b) {
        b.classList.toggle("is-done", d);
        b.textContent = d ? "✓ Terminé — cliquer pour annuler" : "Marquer comme terminé";
      }
    });
  }
  function updatePageProgress() {
    var box = document.querySelector("[data-page-progress]");
    if (!box) return;
    var map = getDone();
    var lessons = Array.prototype.filter.call(
      document.querySelectorAll(".lesson[data-lesson]"), function (l) { return !l.hidden; });
    var total = lessons.length;
    var done = lessons.filter(function (l) { return !!map[l.dataset.lesson]; }).length;
    var pct = total ? Math.round(done / total * 100) : 0;
    box.innerHTML = "<strong>Progression du module :</strong> " + done + " / " + total +
      " leçons terminées (" + pct + " %)" +
      '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  }
  function updateModuleCards() {
    var cards = document.querySelectorAll(".module-card[data-module]");
    if (!cards.length) return;
    var map = getDone();
    cards.forEach(function (card) {
      var prefix = card.dataset.module + ":";
      var total = parseInt(card.dataset.total || "0", 10);
      var free = parseInt(card.dataset.free || "0", 10);
      var shown = isPremium() ? total : free;
      var done = Object.keys(map).filter(function (k) { return k.indexOf(prefix) === 0; }).length;
      if (done > shown) done = shown;
      var pct = shown ? Math.round(done / shown * 100) : 0;
      var meta = card.querySelector(".meta");
      if (meta) {
        meta.textContent = done + " / " + shown + " leçons terminées" +
          (isPremium() || total === free ? "" : "  ·  +" + (total - free) + " en Premium");
      }
      var fill = card.querySelector(".progress-fill");
      if (fill) fill.style.width = pct + "%";
    });
  }

  /* --------------------------------- quiz -------------------------------- */
  function buildQuizzes() {
    document.querySelectorAll(".quiz").forEach(function (quiz) {
      if (quiz.dataset.wired) return;
      quiz.dataset.wired = "1";
      var questions = quiz.querySelectorAll(".quiz-q");
      var scoreEl = quiz.querySelector(".quiz-score");
      questions.forEach(function (q) {
        q.querySelectorAll(".quiz-opt").forEach(function (opt) {
          opt.addEventListener("click", function () {
            if (q.classList.contains("answered")) return;
            q.classList.add("answered");
            var good = opt.dataset.correct === "true";
            q.dataset.result = good ? "1" : "0";
            q.querySelectorAll(".quiz-opt").forEach(function (o) {
              o.disabled = true;
              if (o.dataset.correct === "true") o.classList.add("correct");
            });
            if (!good) opt.classList.add("wrong");
            score();
          });
        });
      });
      function score() {
        if (!scoreEl) return;
        if (quiz.querySelectorAll(".quiz-q.answered").length < questions.length) return;
        var g = quiz.querySelectorAll('.quiz-q[data-result="1"]').length;
        scoreEl.style.display = "block";
        var msg = g === questions.length ? " Sans faute, bravo ! 🎉"
          : g >= questions.length / 2 ? " Bien joué — relisez les explications des questions manquées."
          : " Relisez le module puis retentez le quiz.";
        scoreEl.textContent = "Score : " + g + " / " + questions.length + "." + msg;
      }
    });
  }

  /* -------------------------- copie de code ------------------------------ */
  function buildCopyButtons() {
    if (!navigator.clipboard) return;
    document.querySelectorAll("pre > code").forEach(function (code) {
      var pre = code.parentElement;
      if (pre.querySelector(".copy-btn")) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "copy-btn"; b.textContent = "Copier";
      b.addEventListener("click", function () {
        navigator.clipboard.writeText(code.innerText).then(function () {
          b.textContent = "Copié ✓"; b.classList.add("copied");
          setTimeout(function () { b.textContent = "Copier"; b.classList.remove("copied"); }, 1800);
        });
      });
      pre.appendChild(b);
    });
  }

  /* --------------------- bandeau d'incitation bas ------------------------ */
  function buildUpsellBar() {
    var bar = document.querySelector("[data-upsell-bar]");
    if (!bar) return;
    if (isPremium() || lsGet(LS_BAR) === "1") { bar.hidden = true; return; }
    if (!document.querySelector(".lesson-locked")) { bar.hidden = true; return; }
    bar.hidden = false;
    if (bar.dataset.wired) return;
    bar.dataset.wired = "1";
    bar.innerHTML =
      '<span class="ub-text">✦ Vous lisez la formule gratuite. Le niveau Débutant des 8 modules vous est ouvert.</span>' +
      '<a class="btn btn-gold" href="' + base() + 'tarifs.html?src=barre">Débloquer les 49 leçons</a>' +
      '<button class="ub-close" type="button" aria-label="Fermer">✕</button>';
    bar.querySelector(".ub-close").addEventListener("click", function () {
      lsSet(LS_BAR, "1"); bar.hidden = true;
    });
  }

  /* ------------------------- cartes de niveau ---------------------------- */
  function buildLevelCards() {
    document.querySelectorAll(".level-card[data-level]").forEach(function (card) {
      if (card.dataset.wired) return;
      card.dataset.wired = "1";
      card.addEventListener("click", function () {
        var l = card.dataset.level;
        if (!canAccess(l)) { goUpgrade("carte-" + l); return; }
        lsSet(LS_LEVEL, l);
        render();
      });
    });
    document.querySelectorAll(".level-card[data-level]").forEach(function (card) {
      var lock = card.querySelector("[data-lock-note]");
      if (lock) lock.hidden = canAccess(card.dataset.level);
    });
  }

  /* --------------------------------- rendu ------------------------------- */
  function render() {
    buildPlanPill();
    applyLocking();
    applyLevel();
    buildLevelCards();
    updateValueTeaser();
    refreshDone();
    updatePageProgress();
    updateModuleCards();
    buildUpsellBar();
    document.querySelectorAll("[data-plan-only]").forEach(function (el) {
      el.hidden = el.dataset.planOnly !== getPlan();
    });
  }
  window.fcRender = render;

  document.addEventListener("DOMContentLoaded", function () {
    buildSwitcher();
    buildDoneButtons();
    buildQuizzes();
    buildCopyButtons();
    render();
  });
})();

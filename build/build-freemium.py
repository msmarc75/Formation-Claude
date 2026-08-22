#!/usr/bin/env python3
"""
Génère la version freemium (v2) à partir des pages de la v1.

Le contenu pédagogique n'existe qu'une seule fois, dans /pages. Ce script le
reconditionne : il injecte la couche commerciale (verrouillage, incitations,
pastille de formule) sans jamais réécrire une leçon. Relancer le script après
toute modification de la v1 pour resynchroniser les deux versions.

Usage : python3 build/build-freemium.py
"""
import os, re, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "pages")
OUT = os.path.join(ROOT, "freemium", "pages")

FREE_LEVELS = {"debutant"}
MODULES = ["fondamentaux", "chat", "prompting", "cowork",
           "claude-code", "api", "integrations", "bonnes-pratiques"]

NAV = [("../index.html", "Accueil"), ("fondamentaux.html", "Fondamentaux"),
       ("chat.html", "Chat"), ("prompting.html", "Prompting"),
       ("cowork.html", "Cowork"), ("claude-code.html", "Claude Code"),
       ("api.html", "API"), ("integrations.html", "Intégrations"),
       ("bonnes-pratiques.html", "Bonnes pratiques"),
       ("ressources.html", "Ressources"), ("../tarifs.html", "Tarifs")]

stats = {"pages": 0, "locked": 0, "free": 0, "solutions": 0, "biblio": 0}


def teaser_from(body: str) -> str:
    """Extrait les deux premiers paragraphes réels d'une leçon.

    Sert d'aperçu sur la carte verrouillée : montrer le vrai début du contenu
    vend mieux qu'un texte générique, et évite d'inventer une promesse que la
    leçon ne tiendrait pas."""
    paras = re.findall(r"<p>(.*?)</p>", body, re.S)
    out = []
    for p in paras[:2]:
        txt = re.sub(r"<[^>]+>", "", p)
        txt = re.sub(r"\s+", " ", txt).strip()
        if len(txt) > 20:
            out.append(txt)
    if not out:
        return "<p>Cette leçon est réservée à la formule Premium.</p>"
    return "".join("<p>%s</p>" % t for t in out)


def lock_card(attrs: str, body: str) -> str:
    """Construit la carte affichée à la place d'une leçon premium."""
    lvl = re.search(r'data-level="([^"]+)"', attrs).group(1)
    slug = re.search(r'data-lesson="([^"]+)"', attrs).group(1)
    head = re.search(r'<div class="lesson-head">(.*?)</div>', body, re.S)
    title = "Leçon Premium"
    if head:
        t = re.search(r"<h3>(.*?)</h3>", head.group(1), re.S)
        if t:
            title = t.group(1).strip()
    label = {"intermediaire": "Intermédiaire", "pro": "Pro"}.get(lvl, lvl)
    return (
        f'<section class="lesson-locked" data-level="{lvl}" data-locked-for="{slug}" hidden>\n'
        f'  <div class="lesson-head">\n'
        f'    <h3>{title}</h3>\n'
        f'    <span class="lvl-badge {lvl}">{label}</span>\n'
        f'    <span class="premium-badge">Premium</span>\n'
        f'  </div>\n'
        f'  <div class="locked-teaser">{teaser_from(body)}</div>\n'
        f'  <div class="locked-cta">\n'
        f'    <span class="lock-icon">🔒</span>\n'
        f'    <span class="lock-text">Cette leçon fait partie des 49 leçons Intermédiaire et Pro '
        f'incluses dans la formule Premium.</span>\n'
        f'    <a class="btn btn-gold" href="../tarifs.html?src={slug}">Débloquer</a>\n'
        f'  </div>\n'
        f'</section>\n'
    )


SOL_LOCKED = (
    '<div class="solution-locked" hidden>\n'
    '  <details class="solution">\n'
    '    <summary>🔒 Corrigé détaillé — formule Premium</summary>\n'
    '    <div class="sol-body">\n'
    '      <p>Le corrigé pas à pas de cet exercice est inclus dans la formule Premium, '
    'avec les 24 corrigés du parcours.</p>\n'
    '      <p><a class="btn btn-gold" href="../tarifs.html?src=corrige">Voir les formules</a></p>\n'
    '    </div>\n'
    '  </details>\n'
    '</div>\n'
)



PREMIUM_SECTIONS = {
    "glossaire": ("Glossaire français de l'IA générative",
                  "24 termes définis en français — token, contexte, RAG, MCP, "
                  "prompt caching, injection de prompt — avec le module où chacun est traité."),
    "revision": ("Plan de révision en 4 semaines",
                 "Un rythme réaliste de deux à trois heures par semaine, avec un objectif "
                 "concret et vérifiable à la fin de chaque semaine."),
    "antiseches": ("Aide-mémoire : les prompts qui marchent",
                   "Six formulations éprouvées, prêtes à copier, qui couvrent la majorité "
                   "des situations professionnelles."),
}


def gate_resources(doc: str) -> str:
    """Réserve les contenus originaux de la bibliothèque, pas les liens officiels.

    Verrouiller des liens vers des pages publiques d'Anthropic serait absurde et
    hostile : le visiteur gratuit garde donc les sections vidéos, documentation et
    dépôts de code. Seuls le glossaire, le plan de révision et l'aide-mémoire —
    le travail de rédaction propre au site — passent en Premium."""
    for sid, (titre, pitch) in PREMIUM_SECTIONS.items():
        m = re.search(r'(<h2 id="%s">.*?)(?=<h2 id="|<nav class="page-nav">)' % sid,
                      doc, re.S)
        if not m:
            print("  ! section introuvable :", sid)
            continue
        bloc = m.group(1)
        remplacement = (
            f'<div data-premium-block hidden>\n{bloc}</div>\n'
            f'<div data-premium-locked>\n'
            f'  <h2>{titre} <span class="premium-badge">Premium</span></h2>\n'
            f'  <div class="lesson-locked" style="margin-top:1rem">\n'
            f'    <div class="locked-cta" style="border-top:none;padding-top:0;margin-top:0">\n'
            f'      <span class="lock-icon">🔒</span>\n'
            f'      <span class="lock-text">{pitch}</span>\n'
            f'      <a class="btn btn-gold" href="../tarifs.html?src={sid}">Débloquer</a>\n'
            f'    </div>\n'
            f'  </div>\n'
            f'</div>\n'
        )
        doc = doc[:m.start(1)] + remplacement + doc[m.end(1):]
        stats["biblio"] += 1
    return doc


def build_nav(current: str) -> str:
    out = ['<nav class="main-nav" aria-label="Navigation principale">']
    for href, label in NAV:
        cur = ' aria-current="page"' if href == current + ".html" else ""
        out.append(f'      <a href="{href}"{cur}>{label}</a>')
    out.append("    </nav>")
    return "\n".join(out)


def transform(path: str, name: str) -> str:
    src = open(path, encoding="utf-8").read()
    doc = src

    # --- chemins d'assets et titre
    doc = doc.replace("../assets/", "../assets/")   # inchangé : même profondeur
    doc = doc.replace("<title>", "<title>", 1)
    doc = re.sub(r"(<title>.*?)( — Formation Claude</title>)",
                 r"\1 — Formation Claude Premium</title>", doc, count=1)

    # --- navigation : on ajoute l'entrée Tarifs
    doc = re.sub(r'<nav class="main-nav".*?</nav>', build_nav(name), doc, flags=re.S)

    # --- pastille de formule dans l'en-tête, avant le commutateur
    doc = doc.replace(
        '<div data-level-switcher></div>',
        '<div data-plan-pill data-base="../"></div>\n    <div data-level-switcher></div>', 1)

    # --- bandeau de démonstration juste après <body>
    doc = doc.replace("<body>\n", '<body>\n\n<div class="demo-banner">\n'
        '  <strong>Démonstration</strong> — modèle freemium simulé : aucun paiement réel, '
        'et le verrouillage n\'est pas une protection.\n</div>\n', 1)

    # --- compteur de valeur, juste après la barre de progression
    doc = doc.replace('<div class="page-progress" data-page-progress></div>',
        '<div class="page-progress" data-page-progress></div>\n\n'
        '  <div class="value-teaser" data-value-teaser hidden></div>', 1)

    # --- leçons : insérer une carte verrouillée devant chaque leçon premium
    def on_lesson(m):
        attrs, body = m.group(1), m.group(2)
        lvl = re.search(r'data-level="([^"]+)"', attrs)
        if not lvl:
            return m.group(0)
        if lvl.group(1) in FREE_LEVELS:
            stats["free"] += 1
            return m.group(0)
        stats["locked"] += 1
        return lock_card(attrs, body) + m.group(0)

    doc = re.sub(r'<section class="lesson"([^>]*)>(.*?)</section>',
                 on_lesson, doc, flags=re.S)

    # --- corrigés : marquer premium et ajouter la variante verrouillée
    def on_solution(m):
        stats["solutions"] += 1
        return m.group(0).replace('<details class="solution">',
                                  '<details class="solution" data-premium hidden>', 1) + SOL_LOCKED

    doc = re.sub(r'<details class="solution">.*?</details>',
                 on_solution, doc, flags=re.S)

    # --- barre d'incitation avant le footer
    doc = doc.replace('<footer class="site-footer">',
                      '<div class="upsell-bar" data-upsell-bar hidden></div>\n\n'
                      '<footer class="site-footer">', 1)

    # --- bibliothèque : réserver les contenus originaux
    if name == "ressources":
        doc = gate_resources(doc)
    return doc


def main():
    if not os.path.isdir(SRC):
        sys.exit("Source introuvable : " + SRC)
    os.makedirs(OUT, exist_ok=True)
    for name in MODULES + ["ressources"]:
        p = os.path.join(SRC, name + ".html")
        if not os.path.exists(p):
            print("  ! page absente :", name)
            continue
        out = transform(p, name)
        open(os.path.join(OUT, name + ".html"), "w", encoding="utf-8").write(out)
        stats["pages"] += 1
        print(f"  ✓ freemium/pages/{name}.html")

    print(f"\n{stats['pages']} pages générées · {stats['free']} leçons gratuites · "
          f"{stats['locked']} leçons verrouillées · {stats['solutions']} corrigés réservés · "
          f"{stats['biblio']} sections de bibliothèque réservées")


if __name__ == "__main__":
    main()

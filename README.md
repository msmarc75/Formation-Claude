# ✳ Formation Claude

Un site de formation complet et gratuit à l'écosystème **Claude** (Anthropic), entièrement en français, avec un parcours adapté à votre niveau : **débutant**, **intermédiaire** ou **pro**.

> Projet pédagogique indépendant, non affilié à Anthropic.

## Ce que couvre la formation

| Module | Sujet | Contenu |
|---|---|---|
| 1 | **Fondamentaux** | Qu'est-ce que Claude, la famille de modèles, les offres, tokens et fenêtre de contexte, raisonnement étendu |
| 2 | **Claude Chat** | claude.ai en profondeur : fichiers, recherche web, Projets, Artéfacts, styles, mémoire, partage |
| 3 | **L'art du prompt** | Anatomie d'un prompt, rôles, few-shot, format de sortie, balises XML, chaîne de raisonnement, méta-prompting |
| 4 | **Cowork & équipe** | Déléguer des tâches longues, Skills, connecteurs, MCP, déploiement en équipe |
| 5 | **Claude Code** | Installation, CLAUDE.md, commandes slash, permissions, git, hooks, MCP, sous-agents, headless et CI |
| 6 | **API & développeurs** | Messages API, tool use, streaming, vision, prompt caching, Batch API, Agent SDK, production |
| 7 | **Intégrations** | Apps mobile et desktop, Claude in Chrome, Slack, connecteurs, MCP, gouvernance |
| 8 | **Bonnes pratiques** | Vérification, données sensibles, hallucinations, biais, RGPD et IA Act, sécurité des agents, evals |
| — | **Ressources** | Vidéos et docs officielles, glossaire français, plan de révision, aide-mémoire de prompts |

Chaque module propose des **cours**, des **exercices corrigés**, un **quiz interactif** et une sélection de **vidéos et ressources officielles**.

## Le principe des niveaux

Un sélecteur de niveau, présent dans l'en-tête de chaque page, filtre le contenu. Les niveaux sont **cumulatifs** :

- 🟢 **Débutant** — les leçons débutant uniquement ;
- 🟠 **Intermédiaire** — débutant + intermédiaire ;
- 🟣 **Pro** — l'intégralité du contenu.

Votre niveau et votre progression (leçons marquées comme terminées) sont enregistrés dans le `localStorage` de votre navigateur. **Rien n'est envoyé sur un serveur** : le site est entièrement statique.

## Utilisation

Aucune installation, aucune dépendance, aucune étape de build.

**En local** — ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

**En ligne** — activez GitHub Pages sur la branche de votre choix, à la racine du dépôt.

## Structure du projet

```
.
├── index.html                 Accueil : choix du niveau, modules, progression
├── pages/
│   ├── fondamentaux.html      Module 1
│   ├── chat.html              Module 2
│   ├── prompting.html         Module 3
│   ├── cowork.html            Module 4
│   ├── claude-code.html       Module 5
│   ├── api.html               Module 6
│   ├── integrations.html      Module 7
│   ├── bonnes-pratiques.html  Module 8
│   └── ressources.html        Bibliothèque et glossaire
├── assets/
│   ├── css/style.css          Design system, thème clair/sombre, responsive
│   └── js/app.js              Niveaux, progression, quiz, copie de code
├── BRIEF.md                   Cahier des charges détaillé
└── PLAN.md                    Plan de réalisation et choix pédagogiques
```

## Contribuer une leçon

Le gabarit de référence est `pages/fondamentaux.html`. Une leçon est une section balisée par son niveau et son identifiant :

```html
<section class="lesson" data-lesson="module:slug-de-la-lecon" data-level="intermediaire">
  <div class="lesson-head">
    <h3>4. Titre de la leçon</h3>
    <span class="lvl-badge intermediaire">Intermédiaire</span>
  </div>
  <p>…</p>
</section>
```

Le JavaScript se charge du reste : filtrage par niveau, bouton « marquer comme terminé », calcul de la progression. Pour un quiz, une seule option porte `data-correct="true"` par question.

Si vous ajoutez ou retirez des leçons dans un module, pensez à mettre à jour l'attribut `data-total` de la carte correspondante dans `index.html`.

## Note sur l'exactitude

L'écosystème Claude évolue rapidement. Ce site décrit les fonctionnalités de façon volontairement générale et ne mentionne **ni tarifs chiffrés ni limites d'usage précises** : ces informations figurent sur les pages officielles, seules à faire foi.

- [claude.ai](https://claude.ai) — l'application
- [docs.claude.com](https://docs.claude.com) — la documentation
- [anthropic.com/learn](https://www.anthropic.com/learn) — Anthropic Academy

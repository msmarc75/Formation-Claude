# Plan de réalisation — Formation Claude

Site statique de formation à l'écosystème Claude, en français, avec parcours par niveau.

## 1. Objectifs

- Couvrir **tout l'écosystème Claude** : chat, prompting, Cowork, Claude Code, API, intégrations, bonnes pratiques.
- Servir **trois publics** avec le même contenu : Débutant (grand public), Intermédiaire (utilisateur régulier / power user), Pro (développeur, administrateur, expert).
- Être **auto-portant** : aucun serveur, aucune dépendance — ouvrable en local ou hébergeable sur GitHub Pages.

## 2. Modèle pédagogique

### Niveaux cumulatifs

| Niveau | Public | Ce qu'il voit |
|---|---|---|
| 🟢 Débutant | Découverte, aucun prérequis | Leçons débutant uniquement |
| 🟠 Intermédiaire | Utilisateur régulier | Débutant + intermédiaire |
| 🟣 Pro | Développeur / expert | Tout le contenu |

Le niveau est choisi sur l'accueil (ou via le commutateur présent dans l'en-tête de chaque page), persisté en `localStorage` (`fc-level`), et appliqué à chaque chargement : les sections `[data-level]` au-dessus du niveau courant sont masquées, avec un bandeau indiquant combien de leçons sont masquées.

### Structure type d'un module

1. **En-tête** : titre, description, objectifs d'apprentissage.
2. **Leçons** par niveau (`<section class="lesson" data-level="…">`) : théorie courte → exemple concret copiable → à retenir.
3. **Exercices** par niveau, avec solution repliée dans `<details class="solution">`.
4. **Quiz** interactif (3 à 6 questions) : correction immédiate, explication affichée après réponse.
5. **Vidéos & ressources** : cartes de liens vers les sources officielles uniquement (docs.claude.com, anthropic.com/learn — Anthropic Academy, chaîne YouTube Anthropic). Aucun identifiant de vidéo inventé.

### Suivi de progression

- Bouton « ✓ Marquer comme terminé » sur chaque leçon (`data-lesson="module:slug"`), état stocké dans `localStorage` (`fc-done`).
- Barre de progression en haut de chaque module (leçons terminées / leçons visibles à ce niveau).
- Sur l'accueil : progression par module.

## 3. Architecture technique

```
/
├── index.html                 Accueil : choix du niveau, parcours, cartes modules + progression
├── pages/
│   ├── fondamentaux.html      Module 1 — Découvrir Claude
│   ├── chat.html              Module 2 — Claude Chat (claude.ai)
│   ├── prompting.html         Module 3 — L'art du prompt
│   ├── cowork.html            Module 4 — Cowork & travail d'équipe
│   ├── claude-code.html       Module 5 — Claude Code
│   ├── api.html               Module 6 — API & développeurs
│   ├── integrations.html      Module 7 — Intégrations
│   ├── bonnes-pratiques.html  Module 8 — Bonnes pratiques & sécurité
│   └── ressources.html        Bibliothèque : vidéos, docs, glossaire
├── assets/
│   ├── css/style.css          Design system (variables, clair/sombre, responsive)
│   └── js/app.js              Niveaux, progression, quiz, copie de code
├── BRIEF.md                   Prompt amélioré
└── PLAN.md                    Ce document
```

- **Zéro dépendance** : pas de CDN, pas de framework, pas d'étape de build.
- **Thème** : variables CSS, bascule automatique clair/sombre via `prefers-color-scheme`.
- **JS** (`app.js`) : injection du commutateur de niveau, filtrage `data-level`, progression, moteur de quiz (`data-correct` sur les options), boutons « copier » sur les blocs de code.

## 4. Découpage des modules (cours → exercices → quiz)

| # | Module | Débutant | Intermédiaire | Pro |
|---|---|---|---|---|
| 1 | Fondamentaux | Qu'est-ce que Claude, créer un compte, premier échange | Modèles et offres, tokens et contexte, choisir le bon modèle | Fonctionnement d'un LLM, raisonnement étendu, limites structurelles |
| 2 | Chat | Interface, conversations, pièces jointes | Projets, Artéfacts, styles, recherche | Mémoire, organisation avancée, données et confidentialité |
| 3 | Prompting | Prompts clairs, contexte, itération | Rôles, exemples, format de sortie, contraintes | Structure XML, chain-of-thought, méta-prompting, évaluation |
| 4 | Cowork | Découvrir Cowork, première tâche | Skills, connecteurs, fichiers | Skills sur mesure, MCP, déploiement en équipe |
| 5 | Claude Code | Installer, première session, demandes simples | CLAUDE.md, slash commands, permissions, git | Hooks, MCP, sous-agents, skills, headless/CI, Agent SDK |
| 6 | API | Première requête, clés API, coûts | Tool use, streaming, vision, system prompts | Caching, batchs, Agent SDK, production et évaluation |
| 7 | Intégrations | Apps mobile/desktop | Claude in Chrome, Slack | MCP avancé, gouvernance des connecteurs |
| 8 | Bonnes pratiques | Vérifier les réponses, données personnelles | Hallucinations, esprit critique, RGPD | Gouvernance d'entreprise, sécurité des agents, red-teaming |

## 5. Étapes de réalisation

1. ✅ Brief amélioré (`BRIEF.md`) et plan (`PLAN.md`).
2. Socle : `style.css`, `app.js`, `index.html`, page exemplaire `fondamentaux.html` (référence de structure pour toutes les autres).
3. Rédaction des 7 autres pages sur le gabarit de la page exemplaire.
4. Passe de cohérence : navigation, compteurs de leçons de l'accueil, niveaux, liens.
5. Vérification (liens relatifs, HTML valide, quiz et progression fonctionnels), commit et push.

## 6. Règles de contenu

- Français soigné, tutoiement pédagogique cohérent (« vous »), typographie française.
- Exemples **copiables et réalistes** (prompts complets, commandes, extraits de code).
- Aucun lien inventé : uniquement docs.claude.com, anthropic.com, claude.ai, github.com/anthropics, youtube.com (chaîne officielle ou recherche explicite).
- Aucune promesse chiffrée invérifiable (prix susceptibles de changer → renvoyer vers la page officielle).

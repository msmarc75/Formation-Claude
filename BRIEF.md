# Brief — Prompt amélioré

> Version retravaillée du prompt initial : « Construis un site de formation à Claude ultra complet avec des cours, des exercices, des vidéos sur toutes les fonctionnalités (chat, cowork, claude code, api etc) mais accessible en fonction du niveau (débutant, moyen, pro) en français. »

## Prompt amélioré

**Rôle** : Tu es à la fois ingénieur front-end et concepteur pédagogique (instructional designer) francophone.

**Mission** : Construire un site statique de formation complète à l'écosystème Claude (Anthropic), 100 % en français, déployable tel quel sur GitHub Pages (HTML/CSS/JS vanilla, aucun build, aucune dépendance externe).

**Périmètre fonctionnel du contenu** — un module par grande brique de l'écosystème :

1. **Fondamentaux** — qu'est-ce que Claude, la famille de modèles (Haiku, Sonnet, Opus…), les offres (Free, Pro, Max, Team, Enterprise), les grands principes (fenêtre de contexte, tokens, limites).
2. **Claude Chat (claude.ai)** — conversations, pièces jointes, Projets, Artéfacts, recherche web, styles, mémoire, partage.
3. **L'art du prompt** — du prompt simple aux techniques avancées (rôle, exemples few-shot, chaîne de raisonnement, XML/structure, itération, méta-prompting).
4. **Claude Cowork & travail d'équipe** — Cowork, les skills, les connecteurs (Google Drive, Gmail, calendriers…), l'usage en entreprise.
5. **Claude Code** — installation, boucle agentique, CLAUDE.md, commandes slash, permissions, git, hooks, MCP, sous-agents, skills, mode headless/CI, Claude Code sur le web.
6. **API & développeurs** — Messages API, SDK, tool use, streaming, vision, prompt caching, batchs, Agent SDK, bonnes pratiques de production.
7. **Intégrations** — Claude in Chrome, Claude dans Slack, MCP côté utilisateur, apps mobiles/desktop.
8. **Bonnes pratiques & sécurité** — données sensibles, hallucinations et vérification, limites du modèle, gouvernance en entreprise, usage responsable.

**Exigences pédagogiques** :

- Chaque module est découpé en leçons balisées par niveau : **Débutant**, **Intermédiaire**, **Pro**. Un sélecteur de niveau global (persisté en `localStorage`) filtre le contenu : Débutant ne voit que le contenu débutant, Intermédiaire voit débutant + intermédiaire, Pro voit tout.
- Chaque module contient : des **cours** (leçons structurées, exemples concrets copiables), des **exercices pratiques** par niveau avec **solutions masquées** (`<details>`), un **quiz interactif** avec correction immédiate et explications, et une section **vidéos & ressources** pointant uniquement vers des sources officielles réelles (docs.claude.com, anthropic.com, Anthropic Academy, chaîne YouTube d'Anthropic) — **aucun lien vidéo inventé**.
- **Suivi de progression** : chaque leçon peut être marquée « terminée » (persisté en `localStorage`), avec barre de progression par page et vue d'ensemble par module sur l'accueil.

**Exigences techniques** :

- Site statique pur : `index.html` + `pages/*.html` + `assets/css` + `assets/js`. Aucun CDN, aucun framework.
- Responsive (mobile → desktop), thème clair/sombre automatique (`prefers-color-scheme`).
- Accessibilité : HTML sémantique, contrastes suffisants, navigation clavier sur les quiz.
- Français soigné (typographie : espaces insécables devant « : ; ! ? », guillemets français quand pertinent).

**Livrables** : le site complet, ce brief, et un plan de réalisation (`PLAN.md`) documentant l'architecture, le modèle pédagogique et le découpage des modules.

# Brief — Version freemium (v2)

> Version retravaillée du prompt initial : « Crée une deuxième version du site mais qui serait cette fois en freemium. »

## Prompt amélioré

**Rôle** : Tu es à la fois ingénieur front-end, concepteur pédagogique et responsable produit d'une offre SaaS de formation.

**Mission** : Produire une **seconde version** du site Formation Claude, packagée selon un modèle économique **freemium**, sans réécrire une ligne du contenu pédagogique existant. La v1 (gratuite et intégrale) reste intacte et publiée ; la v2 vit à côté d'elle et démontre comment le même corpus se monétise.

### 1. Découpage de l'offre

| | Gratuit | Premium |
|---|---|---|
| Leçons | Les 24 leçons de **niveau Débutant**, sur les 8 modules | + les 48 leçons **Intermédiaire et Pro** |
| Exercices | Énoncés visibles | + les **corrigés détaillés** |
| Quiz | Les 40 questions, intégralement | Idem |
| Bibliothèque | Aperçu | Glossaire, plan de révision et aide-mémoire complets |
| Progression | Oui | Oui |

Principe directeur : **le visiteur gratuit doit goûter à chaque module**, jamais être exclu d'un sujet entier. Il rencontre la limite au moment où il veut approfondir — pas au moment où il découvre.

### 2. Mécanique de verrouillage

- Une leçon premium n'est pas escamotée : elle s'affiche comme une **carte verrouillée** portant son vrai titre, son niveau, et un **extrait réel de ses premières lignes**, estompé en dégradé. Le contenu masqué est ainsi son propre argument de vente.
- Un **compteur de valeur** en tête de module annonce ce qui attend l'abonné (« 6 leçons et 2 corrigés supplémentaires »).
- Le sélecteur de niveau reste visible pour un visiteur gratuit, mais les niveaux Intermédiaire et Pro portent un cadenas et déclenchent l'appel à l'abonnement au lieu de filtrer.

### 3. Tunnel d'abonnement simulé

- Une page **Tarifs** présente deux formules (Gratuit / Premium) avec un comparatif ligne à ligne, et une bascule mensuel / annuel.
- Le bouton « S'abonner » ouvre un **tunnel de paiement factice** en trois écrans : récapitulatif, formulaire de démonstration, confirmation. Aucune donnée n'est transmise nulle part, aucun champ de carte réel n'est demandé.
- Une page **Mon compte** affiche la formule en cours, la progression consolidée, et permet de revenir à la formule gratuite pour retester le parcours.
- L'état de l'abonnement est conservé en `localStorage` (`fc2-plan`), comme la progression.

### 4. Honnêteté technique — contrainte non négociable

Un site statique **ne peut pas** protéger un contenu : le HTML premium est présent dans la page, donc lisible en désactivant JavaScript ou en consultant le code source. Cette version est une **maquette de modèle économique**, pas un système de contrôle d'accès.

Cette limite doit être :
- écrite explicitement dans le `README` et dans le brief ;
- rappelée par un bandeau de démonstration visible sur le site lui-même ;
- accompagnée de la description de ce qu'exigerait une vraie mise en production (authentification serveur, contenu servi après vérification du droit d'accès, paiement via un prestataire).

Ne jamais laisser croire que ce verrouillage protège quoi que ce soit.

### 5. Contraintes techniques

- **Génération, pas duplication** : les pages de la v2 sont **produites par un script de build** à partir des pages de la v1. Le contenu pédagogique n'existe qu'en un seul exemplaire ; la v2 se régénère si la v1 évolue. Toute divergence de contenu entre les deux versions est un bug.
- Site statique, zéro dépendance, zéro étape de compilation côté visiteur — comme la v1.
- Publié dans un sous-dossier `/freemium/` du même dépôt, donc accessible à côté de la v1 sur GitHub Pages.
- Thème clair/sombre, responsive, accessibilité clavier : identiques à la v1.
- Français soigné et typographie française.

**Livrables** : le site v2 complet, le script de build reproductible, ce brief, et la mise à jour du README décrivant les deux versions et la limite de sécurité.

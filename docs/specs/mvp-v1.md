# MVP v1 — ÉduQc.IA

**Date cible :** rentrée scolaire septembre 2026
**Auteur :** Gabriel Levesque
**Version :** 1.0
**Statut :** Cible validée — sert de référence pour l'audit de complétude et le plan d'implémentation

---

## Vision

Le MVP v1 d'ÉduQc.IA est une plateforme web qui permet à un enseignant d'histoire du secondaire québécois de :

1. Créer, publier et organiser ses tâches d'apprentissage et d'évaluation (TAÉ)
2. Créer et gérer une banque personnelle de documents historiques
3. Assembler des tâches en épreuves complètes (jusqu'à 23 tâches)
4. Exporter ses épreuves en PDF imprimables avec une qualité professionnelle
5. Découvrir les créations des autres enseignants via une banque collaborative
6. Réutiliser le travail de la communauté en l'épinglant ou en l'intégrant à ses propres épreuves

L'objectif au lancement : un enseignant pilote (Gabriel lui-même en premier, puis d'autres) doit pouvoir préparer une épreuve ministérielle complète de bout en bout dans l'application, l'imprimer, et la distribuer à ses élèves sans avoir besoin d'autres outils.

---

## Critère de succès du MVP v1

Le MVP v1 est considéré comme livré lorsque les 5 parcours utilisateurs ci-dessous fonctionnent de bout en bout sans bug bloquant, et que Gabriel a pu personnellement préparer et imprimer une épreuve réelle utilisable en classe avec ses propres élèves.

---

## Les 5 parcours utilisateurs

### Parcours A — Authentification et compte

L'enseignant doit pouvoir :

- **A1** S'inscrire avec un email institutionnel `@*.gouv.qc.ca`
- **A2** Recevoir un email de confirmation et activer son compte via un lien
- **A3** Se connecter avec son email et son mot de passe
- **A4** Modifier son mot de passe
- **A5** Accéder à son profil personnel
- **A6** Modifier les informations de son profil : nom, prénom, école, centre de services, niveaux enseignés
- **A7** Se déconnecter

### Parcours B — Tableau de bord

L'enseignant doit pouvoir :

- **B1** Accéder à son tableau de bord après connexion
- **B2** Voir un aperçu de ses propres créations (tâches, documents, épreuves)
- **B3** Voir ses tâches épinglées (les tâches d'autres enseignants qu'il a marquées d'intérêt)
- **B4** Naviguer rapidement vers ses brouillons en cours
- **B5** Accéder rapidement aux principales actions de création

### Parcours C — Création de contenu

L'enseignant doit pouvoir créer trois types d'entités, indépendantes mais interconnectées.

**Documents historiques**

- **C1** Créer un document autonome via le wizard document
- **C2** Sauvegarder un document en brouillon et le reprendre plus tard
- **C3** Publier un document
- **C4** Modifier un document publié
- **C5** Supprimer un document qu'il a créé

**Tâches d'apprentissage et d'évaluation (TAÉ)**

- **C6** Créer une tâche via le wizard tâche en 7 étapes
- **C7** Référencer dans une tâche des documents existants de la banque
- **C8** Créer des nouveaux documents directement à l'intérieur du wizard tâche (sans devoir sortir et créer le document séparément)
- **C9** Sauvegarder une tâche en brouillon et la reprendre plus tard
- **C10** Publier une tâche
- **C11** Modifier une tâche publiée
- **C12** Supprimer une tâche qu'il a créée
- **C13** Le wizard tâche doit supporter techniquement **toutes** les opérations intellectuelles (OI) et **tous** les comportements attendus du programme

**Épreuves**

- **C14** Créer une épreuve via le wizard épreuve
- **C15** Sélectionner et ordonner les tâches qui composent l'épreuve (depuis ses propres tâches ou depuis la banque collaborative)
- **C16** Le wizard épreuve doit supporter techniquement jusqu'à au moins 23 tâches dans une seule épreuve (référence : épreuve ministérielle de secondaire 4 histoire), avec un UI utilisable même à cette échelle
- **C17** Configurer les paramètres de l'épreuve (titre, niveau, discipline, etc.)
- **C18** Sauvegarder une épreuve en brouillon et la reprendre plus tard
- **C19** Publier une épreuve
- **C20** Modifier une épreuve publiée
- **C21** Supprimer une épreuve qu'il a créée

### Parcours D — Banque collaborative

L'enseignant doit pouvoir :

- **D1** Accéder à la banque collaborative
- **D2** Voir les trois sections de la banque : documents, tâches, épreuves publiées par tous les enseignants
- **D3** Filtrer la banque pour trouver du contenu pertinent (par niveau, discipline, OI, comportement attendu, aspects de société, etc.)
- **D4** Filtrer la banque par auteur pour voir le travail d'un enseignant spécifique
- **D5** Consulter la fiche détaillée d'une tâche, d'un document ou d'une épreuve trouvée dans la banque
- **D6** Épingler une tâche d'un autre enseignant dans son propre tableau de bord pour la retrouver facilement
- **D7** Ajouter une tâche trouvée dans la banque à une de ses propres épreuves
- **D8** Accéder à la liste des enseignants inscrits sur la plateforme
- **D9** Cliquer sur un enseignant pour voir son profil public et l'ensemble de ses publications

### Parcours E — Export et impression

L'enseignant doit pouvoir, à partir d'une épreuve qu'il a créée :

- **E1** Exporter l'épreuve en PDF
- **E2** Choisir parmi trois modes d'export :
  - **Mode "deux feuillets élève"** — un feuillet "dossier documentaire" avec tous les documents, et un feuillet séparé "questionnaire" avec toutes les consignes
  - **Mode "formatif un feuillet"** — un seul document où chaque consigne est immédiatement précédée du document qui l'accompagne (séquence document → consigne → document → consigne, etc.)
  - **Mode "corrigé enseignant"** — version qui contient les corrigés de chaque tâche pour la correction
- **E3** Le PDF généré doit être identique au pixel près au rendu HTML d'aperçu dans l'application (exigence non négociable de qualité d'impression)
- **E4** Télécharger le PDF localement
- **E5** Imprimer le PDF avec un rendu fidèle au PDF source

---

## Hors scope MVP v1

Les éléments suivants sont **explicitement reportés** en versions ultérieures (v1.1, v2 ou plus tard). Les inclure dans le MVP v1 risquerait de retarder le lancement sans apport de valeur essentielle.

**Sécurité et conformité avancées**

- Système de modération de contenu
- Système de signalement de contenu inapproprié
- Conformité Loi 25 complète (politique de confidentialité, EFVP, consentements granulaires) — à mettre en place avant ouverture publique
- Rate limiting distribué multi-instance (un rate limiting in-memory single-instance suffit)

**Collaboration et communication**

- Notifications en temps réel
- Commentaires sur les tâches ou documents d'autres enseignants
- Système de messagerie entre enseignants
- Partage de tâches via lien public sans authentification
- Intégration LMS (Google Classroom, Moodle, etc.)

**Administration et gestion**

- Tableau de bord administrateur
- Statistiques d'usage par enseignant ou par école
- Gestion d'organisations ou d'équipes pédagogiques
- Import/export en masse de contenu

**Personnalisation et confort**

- Photo de profil
- Bio personnelle sur le profil
- Mode sombre
- Personnalisation de l'interface
- Préférences de notification

**Mobilité**

- Application mobile native
- Mode hors-ligne
- Synchronisation entre appareils

**Intelligence artificielle**

- Génération automatique de tâches par IA
- Suggestions intelligentes de documents pertinents
- Correction automatique des productions élèves

**Monétisation**

- Système de paiement
- Plans d'abonnement
- Facturation
- Codes promo ou offres groupées

**Multi-utilisateur avancé**

- Inscription sur invitation seulement
- Système de rôles complexes au-delà de l'auteur/lecteur

---

## Contraintes et exigences techniques transversales

Ces exigences s'appliquent à l'ensemble des fonctionnalités du MVP v1.

**Qualité du code**

- TypeScript strict respecté, zéro `any` dans le code applicatif
- Architecture serveur-first avec Server Actions (pas de route handlers REST inutiles)
- Conventions de nommage du projet respectées (voir `CLAUDE.md`)
- Tests unitaires sur la logique métier critique
- Tests d'intégration sur les Server Actions critiques (au minimum `publishTacheAction`, `saveWizardDraftAction`, `publishEpreuveAction`)

**UX et accessibilité**

- Tous les écrans doivent avoir un état de chargement (`loading.tsx`) et un état d'erreur (`error.tsx`) gracieux
- Aucun écran blanc lors des navigations
- Skeleton screens pour les listes
- Navigation au clavier complète
- Contrastes WCAG AA respectés
- Messages d'erreur clairs en français
- Toasts de confirmation après chaque action mutative

**Sécurité**

- Sanitisation systématique du HTML utilisateur via le helper `safeHtml()` (config restrictive)
- RLS Supabase exhaustive sur toutes les tables (déjà en place)
- Validation Zod sur toutes les Server Actions
- CSP headers de base
- Aucune information sensible en clair côté client

**Performance**

- Streaming Next.js avec `<Suspense>` boundaries sur les pages à queries multiples
- Images optimisées en AVIF/WebP
- Pas de `select("*")` en production
- Revalidation appropriée après les mutations

**Compatibilité**

- Desktop : Chrome, Firefox, Safari, Edge (deux dernières versions majeures)
- Tablette : iPad et Android tablettes (Safari, Chrome)
- Pas de support mobile prioritaire pour MVP v1, mais aucune régression mobile bloquante

---

## Engagements explicites

**Date cible :** rentrée scolaire septembre 2026 (objectif : tout fonctionnel et utilisable en classe avant le premier jour d'école)

**Périmètre verrouillé :** la liste des fonctionnalités ci-dessus est la cible MVP v1 complète. Aucune nouvelle fonctionnalité ne sera ajoutée à cette liste sans une décision explicite de Gabriel et une mise à jour de ce document.

**Coupes possibles si retard :** si à 4 semaines du lancement le périmètre n'est pas atteint, les coupes prioritaires (par ordre) seront :

1. Mode d'export "formatif un feuillet" reporté en v1.1 (garder seulement deux feuillets et corrigé)
2. Filtre par auteur dans la banque reporté en v1.1
3. Liste publique des enseignants reportée en v1.1
4. Profils publics des enseignants reportés en v1.1
5. Épinglage de tâches reporté en v1.1

Ces coupes ne sont **pas** acceptées d'avance — elles ne s'activent que si la date cible est en danger. L'objectif reste de tout livrer.

**Engagements de qualité non négociables :**

- Pixel-perfect HTML→PDF (Parcours E)
- Toutes les OI et comportements attendus supportés (C13)
- Capacité technique 23+ tâches par épreuve (C16)
- Aucun bug bloquant sur les 5 parcours principaux
- Tests d'intégration sur les 3 Server Actions critiques (publishTache, saveWizardDraft, publishEpreuve)

---

## Prochaine étape : audit de complétude

Ce document définit la **cible**. L'étape suivante est de produire un **audit de complétude** qui compare cette cible au code réel du repo.

L'audit de complétude devra :

1. Pour chaque fonctionnalité (A1 à E5), déterminer son état actuel : ✅ implémentée et fonctionnelle / 🟡 partiellement implémentée / ❌ à construire / ⚠️ implémentée mais avec bugs identifiés
2. Identifier les dépendances entre fonctionnalités (ce qui doit être fait avant quoi)
3. Estimer grossièrement l'effort restant pour atteindre 100% du MVP v1
4. Proposer un ordre d'exécution séquencé qui minimise les blocages et maximise la valeur livrée à chaque étape
5. Identifier les risques techniques majeurs (exemple : pipeline d'export PDF avec Puppeteer qui n'existe pas encore)

L'audit de complétude sera produit par Claude Code dans une session dédiée, en lisant ce document, en explorant le repo, et en produisant un fichier `docs/specs/mvp-v1-audit-completude.md` qui servira ensuite de feuille de route opérationnelle.

---

## Liens vers les autres documents de référence

- `docs/specs/fiche-tache-lecture.md` — spec de la fiche tâche detail view (chantier en cours)
- `docs/specs/fiche-tache-implementation-context.md` — contexte d'implémentation et journal de session
- `docs/audit-code-2026.md` — audit code complet avec feuille de route et chemin critique MVP v1
- `CLAUDE.md` — convention de nommage et instructions pour Claude Code

---

_Fin du document. Cible MVP v1 verrouillée. Prochaine étape : audit de complétude par Claude Code._

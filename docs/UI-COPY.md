# UI-COPY — Registre des textes visibles

Source de vérité pour les **libellés, CTA, messages et textes d’aide** affichés dans l’interface ÉduQc.IA. Les **règles** (code, icônes, impression, mapping SQL) sont dans [DECISIONS.md](./DECISIONS.md). La **terminologie** (formes officielles, acronymes interdits) : [DECISIONS.md](./DECISIONS.md#terminologie-ui--pas-dacronymes-interdits). Le **tableau lexique** (source normative unique) : [DECISIONS.md § Lexique global](./DECISIONS.md#lexique-global). Les **textes publics** (définitions tâche, opération intellectuelle, processus de création d’une tâche rédactionnelle, épreuve — hors écran produit) : [FAQ.md](./FAQ.md).

**Placeholders dynamiques** (reproduire tels quels) : `{{user_name}}`, `{{date}}`, `{{discipline}}`, `{{niveau}}`, `{{oi}}`, `{{comportement}}`.

> Dernière mise à jour : 31 mars 2026

## Table des matières

- [Composants transversaux](#composants-transversaux)
- [État — page introuvable (app connectée)](#état--page-introuvable-app-connectée)
- [Page — Tableau de bord / Profil privé](#page--tableau-de-bord--profil-privé)
- [Page — Mes tâches](#page--mes-tâches)
- [Page — Créer une TAÉ (wizard)](#page--créer-une-taé-wizard)
- [Page — Lire une TAÉ](#page--lire-une-taé)
- [Page — Banque collaborative](#page--banque-collaborative)
- [Page — Créer / modifier une épreuve (composition)](#page--créer--modifier-une-épreuve-composition)
- [Page — Profil enseignant (public)](#page--profil-enseignant-public)
- [Module documents historiques](#module-documents-historiques)
- [Impression — modale et contenu](#impression--modale-et-contenu)
- [Lexique global](#lexique-global)
- [Copy à valider / PROVISOIRE](#copy-à-valider--provisoire)
- [Trous et notes](#trous-et-notes)

---

## Composants transversaux

### Modale

- Fermer
- Annuler
- Confirmer

### Modale — outil d’évaluation (barème ministériel)

- Outil d’évaluation

### Grille d’évaluation — outil sans entrée dans les données

- Grille non disponible pour l’outil {{outil}}. (identifiant technique affiché à la place de `{{outil}}` ; tiret « — » si inconnu)

### Bloc 3 — Documents historiques (create-question)

- Parcourir la banque

### Pagination

- Précédent
- Suivant
- Aucun résultat

### Sidebar (`partials/sidebar.php`)

- Tableau de bord
- Mes tâches
- Mes épreuves
- Créer une tâche
- Créer une épreuve
- Créer un document
- Banque collaborative
- Enseignants collaborateurs
- Profil
- Déconnexion

> **Banque — navigation :** une **seule** entrée dans la barre latérale, libellée au **singulier** « Banque collaborative » (pas « Banques » au pluriel). Les espaces **Tâches**, **Documents historiques** et **Épreuves** vivent **dans** la page `/bank` (onglets ou sélecteur), conformément à [FEATURES.md](./FEATURES.md) §8.7 et §13.

> **Créer un document — navigation :** entrée **Créer un document** dans la section **Création**, glyphe Material Symbols Outlined **`add_notes`** ; **route livrée :** `/documents/new` (wizard 4 étapes — voir [WORKFLOWS.md](./WORKFLOWS.md), [FEATURES.md](./FEATURES.md) §13.1, [ARCHITECTURE.md](./ARCHITECTURE.md)). Voir [Module documents historiques](#module-documents-historiques).

### Actions génériques

- Retour
- Modifier
- Voir
- Supprimer

### États vides génériques

- Aucun élément pour le moment.

### État — page introuvable (app connectée)

Route `app/(app)/not-found.tsx` : affiché lorsque `notFound()` est invoqué (ressource absente, accès refusé sans fuite d’information, identifiant invalide). Constantes `PAGE_APP_NOT_FOUND_*` dans `lib/ui/ui-copy.ts`.

- Page introuvable
- Cette page n'existe pas ou vous n'y avez pas accès.
- Tableau de bord (lien)
- Mes épreuves (lien)

### État — erreur inattendue (app connectée)

Route `app/(app)/error.tsx` : affiché lorsqu'une erreur non gérée survient dans une page de la coquille connectée. Constantes `PAGE_APP_ERROR_*` dans `lib/ui/ui-copy.ts`.

- Une erreur est survenue
- Quelque chose ne s'est pas déroulé comme prévu. Réessayez ou revenez au tableau de bord.
- Réessayer (bouton)
- Tableau de bord (lien)

---

## Page — Tableau de bord / Profil privé

`templates/dashboard.php`

### Profil utilisateur

- admin
- Complétez votre profil
- Modifier mon profil

### Notifications

- Notifications
- Aucune notification pour le moment.

### Mes tâches

- Mes tâches
- Tâches publiées
- Aucune tâche.
- Créer une tâche
- Voir toutes mes tâches

### Mes épreuves récentes

- Mes épreuves récentes
- Aucune épreuve.
- Créer une épreuve
- Voir toutes mes épreuves

### Mes favoris

- Mes favoris
- Tâches
- Documents
- Épreuves
- Aucun favori pour le moment.
- Voir la banque

### Documents à compléter pour la banque

- Titre widget : **Documents à compléter pour la banque** (`DASHBOARD_INCOMPLETE_DOCUMENTS_TITLE`)
- État vide : **Tous vos documents sont visibles dans la banque ou n’ont pas besoin de complément.** (`DASHBOARD_INCOMPLETE_DOCUMENTS_EMPTY`)
- Résumé avec effectif : **`DASHBOARD_INCOMPLETE_DOCUMENTS_COUNT(n)`**
- Texte d’aide : **`DASHBOARD_INCOMPLETE_DOCUMENTS_HINT`**
- Lien : Banque collaborative — documents → `/bank?onglet=documents`

---

## Page — Mes tâches

`templates/my-questions.php`

### Titre / Sous-titre

- Mes tâches
- Tâches que vous avez créées (brouillons et publiées).

### CTA header

- Créer une tâche

> **Implémentation Next.js :** titres, sous-titre, CTA et état vide listés dans `lib/ui/ui-copy.ts` (`PAGE_LISTE_MES_TACHES_TITLE`, `PAGE_LISTE_MES_TACHES_SUBTITLE`, `CTA_CREER_UNE_TACHE`, `LISTE_TACHES_VIDE_CATEGORIE`, modales / toasts `MY_QUESTIONS_*`, etc.).

### Filtres

- Toutes
- Brouillons
- Publiées

### Statuts

- Publié
- Brouillon

### Actions

- Voir
- Modifier
- Supprimer

### État vide

- Aucune tâche dans cette catégorie.
- Créer une tâche

### Modale de suppression

- Supprimer cette tâche ?
- Cette opération est irréversible. La tâche sera définitivement retirée de votre banque de données.
- Annuler
- Supprimer

### Brouillon wizard (formulaire de création, non publié)

- Aperçu sans consigne : « Création en cours — reprendre le formulaire »
- Même badge **Brouillon** ; **Voir** et **Modifier** ouvrent la page **Créer une tâche** (`/questions/new`) pour reprendre le formulaire.
- Tâche enregistrée (ligne `tache`) : **Modifier** ouvre le wizard sur `/questions/[id]/edit` (réhydratation des sept étapes).

### Modale — supprimer le brouillon wizard

- Supprimer ce brouillon ?
- Le contenu enregistré du formulaire de création sera effacé. Cette opération est irréversible.
- Annuler
- Supprimer

### Suppression impossible (tâche liée à une épreuve)

- Impossible de supprimer cette tâche : elle figure dans une ou plusieurs épreuves. Retirez-la des épreuves concernées, puis réessayez.

---

## Page — Mes documents

### Modale de suppression

Route `app/(app)/documents/page.tsx`. Constantes `MY_DOCUMENTS_DELETE_*` dans `lib/ui/ui-copy.ts`.

- Supprimer ce document ?
- Cette opération est irréversible. Le document sera définitivement supprimé.
- Annuler
- Supprimer

### Suppression impossible (document lié à une tâche)

- Impossible de supprimer ce document : il est utilisé dans une ou plusieurs tâches. Retirez-le des tâches concernées, puis réessayez.

---

## Miniature document unifiée

Composant `components/document/miniature/index.tsx`. Surfaces : Mes documents, Profil collègue, Banque collaborative. Constantes `DOC_MINIATURE_*` dans `lib/ui/copy/document.ts`.

- Publié
- Brouillon
- Par {{auteur}}
- 1 utilisation · {{n}} utilisations · Aucune utilisation
- Mis à jour le {{date}}
- Créé le {{date}}
- Actions du document (`aria-label`)

### Actions du menu kebab

- Ouvrir la fiche
- Modifier (propriétaire uniquement)
- Supprimer (propriétaire uniquement)
- Réutiliser dans une tâche (banque uniquement)

---

## Deep-link banque → wizard tâche

Modale affichée lorsque le bouton « Réutiliser dans une tâche » est cliqué et qu'un brouillon de tâche est déjà présent. Constantes `INJECT_DOC_MODAL_*` et `TOAST_INJECT_DOC_*` dans `lib/ui/copy/document.ts`.

### Modale de confirmation

- Titre : « Un brouillon de tâche est déjà en cours »
- Intro : « Vous avez une tâche non publiée en cours de rédaction. Que souhaitez-vous faire de ce document ? »
- État du brouillon : « Brouillon en cours — Tâche sans consigne » ou consigne tronquée. « {{n}} documents renseignés sur {{total}} » ou « Aucun document renseigné ».
- Action 1 : « Remplacer le document A par celui-ci » — hint : « Écrase le contenu actuel du slot A par le document choisi. »
- Action 2 : « Injecter dans le premier slot libre » — hint : « Ajoute le document dans le premier slot encore vide sans toucher aux autres. » (désactivée si aucun slot libre → « Tous les slots sont déjà remplis — choisissez une autre option. »)
- Action 3 : « Repartir de zéro avec ce document » — hint : « Supprime le brouillon en cours et démarre une nouvelle tâche avec ce document en slot A. »
- Bouton fermeture : « Annuler » (+ X en haut à droite)

### Toasts

- Document injecté dans le slot A.
- Document injecté dans le slot {{A|B|C|D}}.
- Nouveau brouillon démarré avec ce document en slot A.
- Document introuvable ou inaccessible.

### Alerte douce — Bloc 2 (nb_documents inférieur au nombre de slots remplis)

- « Ce comportement n'accepte que {{nb}} document(s), mais {{remplis}} slot(s) sont déjà remplis. Videz les slots excédentaires au Bloc 4 avant de changer de comportement. »

---

## Page — Mes épreuves

### Modale de suppression

Route `app/(app)/evaluations/page.tsx`. Constantes `MY_EVALUATIONS_DELETE_*` dans `lib/ui/ui-copy.ts`.

- Supprimer cette épreuve ?
- Cette opération est irréversible. L'épreuve et ses associations seront définitivement supprimées.
- Annuler
- Supprimer

---

### Édition guidée (`/questions/[id]/edit`)

- Titre : « Modifier une tâche »
- Sous-titre : « Reprenez les sept (7) étapes pour mettre à jour votre tâche, alignée sur les prescriptions ministérielles. » (`PAGE_MODIFIER_UNE_TACHE_SUBTITLE`)
- Même wizard que **Créer une tâche** ; le bouton **Sauvegarder le brouillon** est masqué (le brouillon serveur « Créer une tâche » reste distinct, une ligne par enseignant).
- Bouton d’enregistrement final : « Enregistrer les modifications » (à la place de « Publier » en création).

### Modale — confirmation de modification majeure (édition)

- **Titre :** Modification importante détectée (`EDIT_MAJOR_VERSION_MODAL_TITLE`)
- **Corps §1 :** Vous avez modifié des éléments structurants de cette tâche (opération intellectuelle, documents, compétence disciplinaire ou connaissances relatives). Cette modification créera une nouvelle version de la tâche et archivera les votes reçus jusqu'ici. (`EDIT_MAJOR_VERSION_MODAL_BODY_P1`)
- **Corps §2 :** Les enseignants qui utilisent cette tâche dans une épreuve recevront une notification. (`EDIT_MAJOR_VERSION_MODAL_BODY_P2`)
- **CTA confirmer :** Enregistrer la nouvelle version (`EDIT_MAJOR_VERSION_MODAL_CONFIRM`)
- **CTA annuler :** Annuler (`EDIT_MAJOR_VERSION_MODAL_CANCEL`)

### Toasts (Mes tâches)

- La tâche a été supprimée.
- Impossible de supprimer la tâche. Réessayez.
- Le brouillon a été supprimé.
- Impossible de supprimer le brouillon. Réessayez.

---

## Page — Créer une TAÉ (wizard)

`templates/create-question.php`

> **Registre code (30 mars 2026) — étapes 3 et 7 :** `BLOC3_GATE_BLUEPRINT` (accès étape 3 si blueprint non verrouillé) ; `BLOC4_GATE_WIZARD`, `BLOC5_CD_GATE_WIZARD` (messages si prérequis non remplis) ; `BLOC7_GATE` (accès étape 7) ; `BLOC7_CONNAISSANCES_RESET` ; `BLOC7_ASPECTS_*`, `BLOC7_CONNAISSANCES_*` — `lib/ui/ui-copy.ts` ; `PAGE_CREER_UNE_TACHE_SUBTITLE`, `PAGE_MODIFIER_UNE_TACHE_SUBTITLE` (7 étapes). Les sous-sections détaillées ci-dessous peuvent encore mélanger d’anciens numéros d’étapes ; la vérité code = `step-meta.ts` + `TACHE_FORM_STEP_COUNT`.

### Titre principal

- Créer une tâche

### Sous-titre

- Complétez les étapes pour créer une tâche complète. L'aperçu se met à jour à chaque modification. (`PAGE_CREER_UNE_TACHE_SUBTITLE`)

### Bannières — reprise brouillon

- **Titre (brouillon serveur) :** Brouillon enregistré
- **Corps (brouillon serveur) :** Vous avez déjà une tâche en cours enregistrée sur le serveur. Vous pouvez la reprendre ou continuer un nouveau formulaire (le brouillon serveur reste disponible jusqu’à publication ou suppression).
- **Titre (reprise locale) :** Travail non enregistré en ligne
- **Corps (reprise locale) :** Ce navigateur contient une reprise de formulaire qui n’a pas été enregistrée avec « Sauvegarder le brouillon ». Vous pouvez la reprendre ou l’ignorer.
- **CTA :** Reprendre ; Masquer pour cette visite ; Ignorer le brouillon local

### Toast — brouillon obsolète (format antérieur sans `bloc1`)

- **Toast (erreur) :** Ce brouillon provient d’une version antérieure du formulaire et ne peut pas être repris. Reprenez la création de la tâche. (`TOAST_WIZARD_DRAFT_OBSOLETE` — `lib/ui/ui-copy.ts`)

### Stepper (chiffres affichés)

- 1
- 2
- 3
- 4
- 5
- 6
- 7

(Aucun libellé texte dans la rangée du stepper — seulement chiffres et glyphes. Voir [DECISIONS.md](./DECISIONS.md#stepper-visuel-taé).)

### Étape 1 — Auteur(s) de la tâche

#### Titre

- Étape 1 — Auteur(s) de la tâche

#### Sous-titre (deux phrases)

- Indiquez si vous avez conçu cette tâche seul ou avec des collègues.
- Si elle a été réalisée en équipe, ajoutez leurs noms ci-dessous pour les inclure comme collaborateurs.

#### Labels

- Mode de conception \*
- Seul (icône `person`)
- En équipe (icône `groups`)
- Collaborateurs \* (sous-bloc si « En équipe »)
- Rechercher un collaborateur (icône `search`)

#### Sous-textes (cartes « Seul » / « En équipe »)

- **Seul :** Vous êtes l'unique auteur de cette tâche.
- **En équipe :** Vous avez conçu cette tâche avec un ou plusieurs collègues. Ajoutez leurs noms ci-dessous pour les inclure comme collaborateurs.

#### Options par défaut

- Sélectionner
- Nom, courriel ou établissement…

#### Hints

- Les noms de famille seront affichés sur la fiche par ordre alphabétique.
- Seules les personnes inscrites sur la plateforme peuvent être ajoutées.

#### Recherche collaborateurs (liste déroulante)

- Saisissez au moins deux caractères pour lancer la recherche.
- Aucun enseignant ne correspond à votre recherche.
- Recherche en cours…
- Choisissez un collègue dans la liste des résultats.
- Cette personne figure déjà parmi les collaborateurs.

### Étape 2 — Paramètres de la tâche

#### Titre

- Étape 2 — Paramètres de la tâche

#### Intro (infobulle ⓘ à côté du titre h2, plus de paragraphe sous le titre)

- Texte long : `TACHE_BLUEPRINT_STEP_DESCRIPTION` dans `lib/ui/ui-copy.ts` (paramètres pédagogiques ; comportement → outil d’évaluation / grille ; espace de production automatique selon le comportement).

#### Niveau scolaire

- `ListboxField` : Secondaire 1 à 5 ; **Secondaire 5** grisé et non sélectionnable (option `disabled`).
- Placeholder : « Sélectionner un niveau scolaire » (`SELECT_PLACEHOLDER_NIVEAU_SCOLAIRE`).

#### Discipline

- Même ligne que le niveau (`grid` deux colonnes).
- Secondaire 1 et 2 : listbox filtrée par niveau ; aide : « Choisissez la discipline associée au niveau sélectionné. »
- Secondaire 3 et 4 : une seule discipline — affichage lecture seule + pastille « Assignée automatiquement » avec glyphe **`settings`** (`BLOC2_DISCIPLINE_AUTO_ASSIGNED`).

#### Labels

- Niveau scolaire \*
- Discipline \*
- Opération intellectuelle \*
- Comportement attendu \*
- Espace de production (section lecture seule après sélection d’un comportement ; pas d’astérisque requis)

(Glyphes Material par libellé : voir [DECISIONS.md](./DECISIONS.md#mapping-glyphes--bloc-2-libellés-de-champs).)

#### Aides courtes (sous les champs)

- Opération intellectuelle : « Sélectionnez l'opération intellectuelle mobilisée dans la tâche. » (`BLOC2_OI_FIELD_HELP`)
- Comportement attendu : « Le comportement attendu sélectionné détermine l'outil d'évaluation, c'est-à-dire la grille de correction ministérielle affichée sous la tâche. » (`BLOC2_COMPORTEMENT_FIELD_HELP`)
- (Disponible après la sélection de l'opération intellectuelle.) (`BLOC2_COMPORTEMENT_PREREQ_OI`)

#### Espace de production (lecture seule)

- Affiché seulement si un comportement est sélectionné ; `nb_lignes` lu depuis `public/data/oi.json`.
- Si `nb_lignes > 0` : phrase avec le nombre en gras + « … lignes pour la réponse écrite. » (`BLOC2_ESPACE_PRODUCTION_REDACTION_*`)
- Si `nb_lignes === 0` : « … cases à remplir, de lettres (A, B, C ou D) ou d'un champ « Réponse : ». » (`BLOC2_ESPACE_PRODUCTION_COPY_NON_REDACTION`)
- Bloc : fond `bg-panel-alt`, bordure `0.5px` `border-secondary`, glyphe **`settings`** en tête de ligne.

#### Aide longue (icône `info` sur la ligne du label → modale)

- **Opération intellectuelle** — bouton info après le `*` ; modale avec titre « Qu’est-ce qu’une opération intellectuelle ? » et définition (liste dynamique depuis `oi.json` ; pour `coming_soon`, mention « Bientôt disponible » sous le titre dans la liste).
- **Comportement attendu** — modale titre « Comportement attendu » ; corps avec définition ; exemple d’énoncé lorsque applicable ; invite « Choisissez d'abord un comportement dans la liste pour voir un exemple d'énoncé. » si vide.
- Fermeture : icône `close` en haut à droite, clic sur le fond, touche Escape.

#### Modales d'aide — corps (intro fixe)

- **Opération intellectuelle —** « L'opération intellectuelle précise le type d'action cognitive demandée à l'élève. Les libellés ci-dessous reprennent les catégories du référentiel ministériel ; la liste déroulante reprend les entrées disponibles. »
- **Comportement attendu —** « Le comportement attendu décrit une compétence observable, évaluée à l'aide de la grille de correction ministérielle associée à l'opération intellectuelle. Il détermine le nombre de documents historiques et l'outil d'évaluation. »
- _(Modale « Nombre de lignes » retirée du wizard ; texte historique conservé dans `BLOC2_MODAL_NB_LIGNES_BODY` si besoin documentaire.)_

#### Bouton info (accessibilité)

- **`aria-label` :** Ouvrir l'aide sur ce champ

#### Opération intellectuelle — entrée à venir (`coming_soon`)

- Dans la liste déroulante, sous le titre de l'entrée non sélectionnable : « Bientôt disponible »

#### Référentiels (étapes 5 et 6, sommaire) — discipline sans données

- Compétence disciplinaire (ex. géographie) : « Référentiel compétence disciplinaire non disponible pour cette discipline dans les données actuelles. »
- Connaissances relatives (ex. géographie) : « Référentiel connaissances relatives non disponible pour cette discipline dans les données actuelles. »
- Erreur de chargement d'un fichier JSON : « Chargement du référentiel impossible. »
- Aucune ligne après filtrage par niveau / discipline (étape 6) : « Aucune entrée ne correspond au niveau et à la discipline sélectionnés. »

#### Chargement (bloc 2)

- « Chargement des paramètres… »

#### Erreur réseau (bloc 2, `oi.json`)

- « Impossible de charger les opérations intellectuelles. Réessayez. »

#### CTA

- Voir la grille de correction

#### Paramètres verrouillés (aperçu)

- Titre de l’encadré : « Paramètres verrouillés »
- Libellés récapitulatifs : « Niveau scolaire », « Discipline », « Opération intellectuelle », « Comportement attendu », « Nombre de lignes », « Documents prévus » (valeurs affichées ; tiret « — » si vide). _(Variante code liste : libellés avec « : » — `BLOC2*BLUEPRINT_LOCKED_LBL*_`dans`lib/ui/ui-copy.ts`.)\*
- Bouton : « Modifier les paramètres »
- Modale d’avertissement — titre : « Modifier les paramètres » ; en-tête : glyphe Material **`warning`**, bandeau **`bg-warning/10`**, bordures warning (tokens — [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) Modales).
- Modale — corps : « Modifier le niveau, la discipline ou l'opération intellectuelle peut réinitialiser les étapes suivantes (consigne, documents, etc.). Souhaitez-vous déverrouiller ce bloc ? »
- Modale — boutons : « Annuler » ; « Confirmer »

### Étape 3 · Consigne et guidage complémentaire

#### Titre (h2)

- Étape 3 · Consigne et guidage complémentaire (point médian `·`, pas tiret cadratin) — aligné `BLOC3_TITRE` / `step-meta.ts`.

#### Intro (sous le titre)

- **Verbatim code (`BLOC3_DESCRIPTION`) :** Rédigez la consigne destinée à l'élève et, si nécessaire, le guidage complémentaire pour l'élève. _(Les aspects de société et le corrigé sont aux étapes 7 et 5 — wizard 7 étapes.)_

#### Consigne \*

- Avant le champ : « Votre consigne sera automatiquement précédée de l'amorce documentaire suivante, générée selon les documents requis par le comportement attendu choisi à l'étape précédente : »
- Exemple visuel (non dynamique dans l'UI actuelle) : « Consultez les documents A et B. »
- Puis : « Rédigez ensuite votre consigne en commençant par un verbe d'action. »
- **Placeholder :** Rédigez ici la consigne destinée à l'élève.
- Pas de ligne d’aide redondante sous le textarea consigne.
- **Modale info (titre) :** Consigne — **corps** (trois paragraphes, composant `Bloc3ConsigneHelpModalBody`) :
  1. La consigne comprend deux parties : une amorce documentaire générée automatiquement, qui invite l'élève à consulter les documents requis, par exemple : « Consultez les documents A et B. », suivie de la consigne rédigée par l'enseignant.
  2. Utilisez les boutons Doc A et Doc B pour insérer une référence à un document à l'endroit précis souhaité dans le texte. Les références apparaissent sous forme de lettres dans le sommaire et sont automatiquement numérotées à l'impression, selon l'ordre des documents dans le dossier documentaire de l'épreuve. (En UI : **Doc A** et **Doc B** en pastilles.)
  3. L'éditeur prend en charge la mise en forme enrichie : gras, italique, souligné et listes à puces — glyphe Material **`list`** puis point final.

#### Aspects de société \*

- **Cases :** économique, politique, social, culturel, territorial (**pas** « Scientifique et technologique » dans le formulaire ; terme taxonomie possible sur d’anciennes fiches.)
- **Hint :** Sélectionnez les aspects de société liés à la tâche.
- **Modale info (titre) :** Aspects de société — **corps :** Les aspects de société (économique, politique, social, culturel, territorial) servent à indexer et classifier les tâches. Ils n'apparaissent pas dans le questionnaire élève et facilitent la création d'épreuves équilibrées dans la banque collaborative.

#### Guidage complémentaire

- Champ optionnel (pas d’astérisque).
- **Hint sous le textarea :** Ajoutez, au besoin, des indications supplémentaires pour soutenir l'élève dans la compréhension de la tâche.
- **Placeholder :** Ajoutez des indications complémentaires pour orienter l'élève.
- **Modale info (titre) :** Guidage complémentaire — **corps :** (`BLOC3_MODAL_GUIDAGE_BODY` dans `modalCopy.ts`) Le guidage complémentaire aide l'élève à comprendre et planifier la tâche — sans faire le travail à sa place. Il peut prendre la forme de pistes de réflexion, d'étapes suggérées, de définitions ou de rappels de notions. À l'impression, il apparaît automatiquement sur la copie de l'élève en évaluation formative sous la consigne en italique. En évaluation sommative, il est masqué par défaut — vous pourrez choisir de l'afficher ou non au moment de générer le PDF de votre épreuve. Le guidage est enregistré avec la tâche et réutilisable dans toutes vos épreuves.

#### Corrigé (production attendue) \*

- **Hint sous le textarea :** Fournissez un exemple de réponse complète illustrant la production attendue.
- **Placeholder :** Rédigez ici la production attendue.
- **Modale info (titre) :** Corrigé (production attendue) — **corps :** Le corrigé type illustre une réponse conforme aux exigences de la tâche et au comportement attendu sélectionné. Il sert de référence au correcteur et doit refléter les critères de la grille de correction ministérielle.

### Parcours non rédactionnel — ordre chronologique (OI1 · comportement 1.1)

**Registre unique :** constantes **`NR_ORDRE_*`** dans `lib/ui/ui-copy.ts` (spec [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) parcours 1). **Cadre repère / année (OI1, transversal) :** [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) § **Données temporelles — repère et année normalisée**.

- **Étape 3 :** **template de consigne ministérielle inline** (`ConsigneTemplateCard`, `OrdreChronologiqueConsigneTemplate`) — glyphe section consigne **`BLOC3_SECTION_ICON.consigne`** (`short_text`) comme le Bloc 3 rédactionnel ; badge **`NR_ORDRE_CONSIGNE_MINISTERIAL_BADGE`** + **`lock`** ; **`NR_ORDRE_CONSIGNE_HELP`** ; jeton wizard **`NR_ORDRE_WIZARD_DOC_TOKEN_*`** + **`settings`** ; zone thème **`NR_ORDRE_THEME_*`** (max 80 car., pilule **`LimitCounterPill`** sous la carte, alignée à droite, rampe warning à partir de 66 caractères ; plein à 80 sans état danger — `showDangerAtMax={false}`, `NR_ORDRE_THEME_REQUIRED`) ; légende **`NR_ORDRE_TEMPLATE_*`** ; note **`NR_ORDRE_TEMPLATE_RENUMBER_NOTE`** ; **pas** de bloc « APERÇU » dans la carte (aperçu = fiche sommaire). Donnée **`consigne_theme`** ; HTML publié : intro `{{doc_1}}`…`{{doc_4}}` (format numérique depuis Phase 1, 22 avril 2026 ; `NR_ORDRE_PUBLISHED_INTRO_*`). Puis **Guidage complémentaire** — `NR_ORDRE_GUIDAGE_FORM_LEAD`, encadré lecture seule (`buildOrdreChronologiqueGuidageHtml`), modale **`NR_ORDRE_GUIDAGE_INFO_MODAL_BODY`**, titre modale `BLOC3_MODAL_GUIDAGE_TITLE`. Les **aspects de société** se traitent à l’**étape 7** (`Bloc7AspectsConnaissances`). Synchronisation **`SET_GUIDAGE`** avec le HTML fixe dans `Bloc3OrdreChronologique`. **Pas** de générateur d’options A–D à cette étape (voir étape 5).
- **Étape 5 (Bloc 5) :** **`SequenceOptionsGenerator`** — gates `NR_ORDRE_GATE_BLOC5_PRE_CONSIGNE`, `NR_ORDRE_GATE_BLOC5_OPTIONS` ; **séquence correcte** et complétude des années alignées sur **`getAnneePourComparaison`** (`computeOrdreSequenceFromYears` / `ordre-chronologique-years.ts`, `areOrdreChronologiqueDocumentYearsComplete`) ; année absente sans extraction depuis le repère → message `NR_ORDRE_BLOC5_YEARS_MISSING_DETAIL` dans le générateur ; **égalité d’années** : message `NR_ORDRE_BLOC5_YEAR_TIE_WARNING` + PIN manuel ; champs payload `optionsJustification`, `manualTieBreakSequence` ; **Générer** / **Régénérer les distracteurs** (`NR_ORDRE_REGENERATE_*`) ; étape 2 — affichage immédiat si brouillon déjà généré (`syncedFromValue` / `activeResult`), justification, `clearedOrdreOptionsPatch`. Composant `Bloc5OrdreChronologique`. (La constante **`NR_ORDRE_GATE_BLOC5_ANNEES`** reste dans le registre pour compatibilité ; elle n’est plus utilisée comme gate Bloc 5.)
- **Corrigé :** lettre + **justification** (HTML `tache.corrige` via `buildOrdreChronologiqueCorrigeHtml`) ; `NR_ORDRE_CORRECT_*` conservés pour cohérence registre / futures erreurs.
- **Guidage publié (`tache.guidage`) — élève :** texte **fixe** `NR_ORDRE_STUDENT_GUIDAGE`. **Options A–D (enseignant) :** `NR_ORDRE_OPTIONS_HELP`.
- **Étape 4 :** titre et description d’étape dédiés (`NR_ORDRE_STEP4_TITLE`, `NR_ORDRE_STEP4_DESCRIPTION`) ; bannière `NR_ORDRE_BLOC4_INFO` ; **rappel séquence** (`NR_ORDRE_BLOC4_REMINDER_*`, `formatNrOrdreBloc4ReminderLead`, `formatNrOrdreBloc4ReminderDigitDocLine`) lorsque la bonne suite et la lettre du corrigé sont connues ; formulaire par document : type, titre, **contenu (texte) ou image** (et légende le cas échéant), puis **source** et **type de source** ; pas de champ « date ou repère temporel » (repère lu dans le document par l’élève) ; messages de gate `NR_ORDRE_GATE_*`.
- **Feuille élève (publication) :** `tache.consigne` = intro + **ancre** (`ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR`) + grille + réponse ; **`tache.guidage`** = texte élève fixe (`NR_ORDRE_STUDENT_GUIDAGE`). L’impression compose intro → guidage → grille selon `shouldShowGuidageOnStudentSheet`.

**Note :** les anciennes constantes `NR_ORDRE_OPTION_*_PLACEHOLDER` ne décrivent plus une saisie libre ; l’affichage public des suites est `formatOrdreOptionRowDisplay` → `1 - 2 - 3 - 4`.

- **Feuille élève (HTML consigne publiée, impression) :** libellé **Réponse :** — `NR_ORDRE_STUDENT_SHEET_REPONSE_LABEL` ; libellé d’accessibilité du groupe d’options — `NR_ORDRE_STUDENT_SHEET_OPTIONS_GROUP_ARIA` (`lib/tache/non-redaction/ordre-chronologique-payload.ts`, styles sous `[data-ordre-chrono-student="true"]` dans `app/globals.css`).

### Parcours non rédactionnel — ligne du temps (OI1 · comportement 1.2)

**Registre :** constantes **`NR_LIGNE_TEMPS_*`** dans `lib/ui/ui-copy.ts` (spec [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) parcours 2). **Branchement wizard / publication** : slug `ligne-du-temps` — `TACHE_NON_REDACTION_WIZARD_BLOCS`, `buildPublishPayload` / `ligne-du-temps-payload.ts`, `NON_REDACTION_PATCH_LIGNE_TEMPS`.

- **Guidage publié (`tache.guidage`) — élève :** texte **fixe** `NR_LIGNE_TEMPS_STUDENT_GUIDAGE` (validé produit).
- **Bloc 3 — Consigne (en-tête) :** aligné sur l’ordre chronologique — `NR_ORDRE_CONSIGNE_LABEL`, `NR_ORDRE_CONSIGNE_HELP`, modale d’aide titre `NR_ORDRE_CONSIGNE_LABEL`, **`OrdreChronologiqueConsigneMinisterialBadge`** (`NR_ORDRE_CONSIGNE_MINISTERIAL_BADGE`).
- **Bloc 3 — Aperçu frise (sans choix du segment) :** `LigneDuTempsFrisePicker` avec `interactive={false}` — **`NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_LEAD`**, **`NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_HINT`** ; le segment corrigé se définit à l’**étape 5** (`Bloc5LigneDuTemps`).
- **Bloc 3 :** `NR_LIGNE_TEMPS_GUIDAGE_FORM_LEAD` sous **Guidage complémentaire** ; modale info — **`NR_LIGNE_TEMPS_GUIDAGE_INFO_MODAL_BODY`**, titre aligné sur `BLOC3_MODAL_GUIDAGE_TITLE`.
- **Bloc 5 — Corrigé et segment :** `Bloc5LigneDuTemps` — **`NR_LIGNE_TEMPS_BLOC5_TITLE`**, **`NR_LIGNE_TEMPS_BLOC5_INTRO`**, gate **`NR_LIGNE_TEMPS_BLOC5_GATE`**, récapitulatif **`NR_LIGNE_TEMPS_BLOC5_FRISE_RECAP_TITLE`**, radios **`NR_LIGNE_TEMPS_BLOC5_SEGMENTS_LABEL`** + **`NR_LIGNE_TEMPS_BLOC5_SEGMENT_RADIO_ARIA`** / **`NR_LIGNE_TEMPS_BLOC5_SEGMENT_SUMMARY_PREFIX`** ; proposition automatique depuis `getAnneePourComparaison` — **`NR_LIGNE_TEMPS_BLOC5_SEGMENT_AUTO`**, **`NR_LIGNE_TEMPS_BLOC5_NO_YEAR`**, **`NR_LIGNE_TEMPS_BLOC5_YEAR_OUTSIDE`** ; frise interactive — **`NR_LIGNE_TEMPS_SELECT_CORRECT_TITLE`**, **`NR_LIGNE_TEMPS_SELECT_CORRECT_HELP`** (`LigneDuTempsFrisePicker`, `TimeLine` `interactive`).
- **Frise SVG (wizard) :** si moins de deux dates valides — **`NR_LIGNE_TEMPS_TIMELINE_EMPTY`** ; aperçu partiel (frise qui se remplit) — **`NR_LIGNE_TEMPS_TIMELINE_PARTIAL_HINT`** ; accessibilité segment — **`NR_LIGNE_TEMPS_TIMELINE_SEGMENT_ARIA(letter, début, fin)`** (`TimeLine.tsx`).

### Parcours non rédactionnel — avant / après (OI1 · comportement 1.3)

**Registre :** constantes **`NR_AVANT_APRES_*`** et toast **`TOAST_TACHE_NR_AVANT_APRES_HYDRATE_INVALID`** dans `lib/ui/ui-copy.ts` (spec [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) parcours 3). **Branchement :** slug `avant-apres` — `TACHE_NON_REDACTION_WIZARD_BLOCS`, `Bloc3AvantApres`, `Bloc4AvantApres`, `Bloc5AvantApres`, `NON_REDACTION_PATCH_AVANT_APRES`, `avant-apres-payload.ts` / `avant-apres-helpers.ts`, colonne **`tache.non_redaction_data`**.

- **Étape 3 :** consigne ministérielle (jetons `{{doc_*}}`, thème, repère, **année ou période AAAA–AAAA**) — **`NR_AVANT_APRES_*`** (labels repère / année, aide consigne, guidage complémentaire, modale guidage) ; alignement visuel sur l’ordre chronologique (`OrdreChronologiqueConsigneMinisterialBadge`, `NR_ORDRE_CONSIGNE_*` réutilisés où indiqué dans le code).
- **Étape 4 :** quatre documents — **`NR_AVANT_APRES_BLOC4_INFO`**, gates documents / repère.
- **Étape 5 :** tableau 4×3 (AVANT | repère | APRÈS), **Générer** / **Régénérer**, overrides **année pivot ou inclusion dans la période repère**, justification, gate options — clés **`NR_AVANT_APRES_BLOC5_*`** ; accessibilité tableau / radios — **`NR_AVANT_APRES_TABLE_*`**, **`NR_AVANT_APRES_OVERRIDE_*`**.
- **Guidage publié (`tache.guidage`) — élève :** **`NR_AVANT_APRES_STUDENT_GUIDAGE`**.
- **Feuille élève (impression) :** intro publiée **`NR_AVANT_APRES_PUBLISHED_INTRO_*`** ; tableau des options — en-têtes **`NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_AVANT`** / **`NR_AVANT_APRES_STUDENT_SHEET_TABLE_COL_APRES`**, **`NR_AVANT_APRES_STUDENT_SHEET_TABLE_REPERE_TH_SR`** (colonne pivot sans titre visible) ; **`NR_AVANT_APRES_STUDENT_SHEET_*`** ; styles **`[data-avant-apres-student="true"]`** (`app/globals.css`). **Wizard Bloc 5 :** en-têtes explicites **`NR_AVANT_APRES_TABLE_COL_*`** (distincts de la feuille élève).
- **Réhydratation JSON invalide (édition) :** **`TOAST_TACHE_NR_AVANT_APRES_HYDRATE_INVALID`**.

### Parcours non rédactionnel — carte historique (OI2 · comportements 2.1, 2.2, 2.3)

**Registre :** constantes **`NR_CARTE_*`** et toast **`TOAST_TACHE_NR_CARTE_HISTORIQUE_HYDRATE_INVALID`** dans `lib/ui/ui-copy.ts` (spec [specs/spec-oi2-carte-historique.md](./specs/spec-oi2-carte-historique.md)). **Branchement :** slug `carte-historique` — `TACHE_NON_REDACTION_WIZARD_BLOCS`, `Bloc3CarteHistorique`, `Bloc4CarteHistorique`, `Bloc5CarteHistorique`, action `NON_REDACTION_PATCH_CARTE_HISTORIQUE`, `carte-historique-payload.ts` / `carte-historique-helpers.ts`, colonne **`tache.non_redaction_data`**.

- **Mécanique invariante :** la carte porte **toujours** les 4 lettres **A, B, C, D** ; pour le comportement 2.2, elle porte **aussi** les 4 chiffres **1, 2, 3, 4**. L'enseignant ne saisit jamais le nombre de lettres ou de chiffres.
- **Bloc 2 — Pondération (2.1 uniquement) :** `PonderationPicker` — **`BLOC2_PONDERATION_LABEL`**, **`BLOC2_PONDERATION_HELP`**, options **`BLOC2_PONDERATION_OPTION_2_PTS`** / **`BLOC2_PONDERATION_OPTION_1_PT`** ; bascule entre les outils d'évaluation `OI2_SO1` (2 points) et `OI2_SO1_1PT` (1 point) via l'action **`SET_OUTIL_EVALUATION_OVERRIDE`** (sans réinitialisation des blocs en aval). Récap dans `BlueprintLockedView` — **`BLOC2_PONDERATION_BLUEPRINT_LABEL`**.
- **Étape 3 — consigne :** **`CarteHistoriqueConsigneTemplate`** (réutilise `ConsigneTemplateCard`) — 3 sous-templates par comportement, badge **`NR_CARTE_CONSIGNE_MINISTERIAL_BADGE`** + `lock`, jeton document **`NR_CARTE_WIZARD_DOC_TOKEN_*`** + `settings`, légende **`NR_CARTE_TEMPLATE_LEGEND_*`**, note **`NR_CARTE_TEMPLATE_RENUMBER_NOTE`**, footer **`NR_CARTE_TEMPLATE_CARD_FOOTER`**. Aides spécifiques **`NR_CARTE_CONSIGNE_HELP_21`** / **`NR_CARTE_CONSIGNE_HELP_22`** / **`NR_CARTE_CONSIGNE_HELP_23`** ; modale d'aide **`NR_CARTE_CONSIGNE_INFO_MODAL_BODY`**. Zones éditables : `consigneElement1` (toujours), `consigneElement2` (2.2 et 2.3) ; placeholders **`NR_CARTE_ELEMENT_PLACEHOLDER_*`** ; longueurs **`CARTE_ELEMENT_LIMITS`** (2.1 : 120/100, 2.2 : 60/50, 2.3 : 80/65) ; pilule **`LimitCounterPill`** sous la carte. **Guidage complémentaire :** **éditeur TipTap libre, optionnel, non verrouillé** (`RichTextEditor` autosave `eduqcia-tache-guidage-new`) — modale info **`NR_CARTE_GUIDAGE_INFO_MODAL_BODY`**. Aucune injection automatique de guidage.
- **Étape 4 — un seul document :** **`Bloc4CarteHistorique`** réutilise `DocumentSlotsAccordionProvider` / `DocumentSlotPanel` ; bannière info **`NR_CARTE_BLOC4_INFO`**, gate **`NR_CARTE_GATE_PRE_DOCS`**. Le document est iconographique (la carte) ; **repère temporel obligatoire**.
- **Étape 5 — corrigé :** **`Bloc5CarteHistorique`** — gate **`NR_CARTE_GATE_BLOC5`**.
  - **2.1 :** `SegmentedControl` A/B/C/D — **`NR_CARTE_BLOC5_TITLE_21`**, **`NR_CARTE_BLOC5_HELP_21`**, **`NR_CARTE_LETTER_GROUP_ARIA`**, options **`NR_CARTE_LETTER_OPTION_*`**.
  - **2.2 :** deux `ListboxField` (chiffre 1–4) puis bouton **Générer / Re-mélanger** (`NR_CARTE_22_GENERATE_CTA` / `NR_CARTE_22_REGENERATE_CTA`) → tableau A–D. Étape 1 — **`NR_CARTE_22_STEP1_TITLE`**, **`NR_CARTE_22_STEP1_DESCRIPTION`**, **`NR_CARTE_22_CHIFFRE_LABEL_FOR`** ; étape 2 — **`NR_CARTE_22_STEP2_*`**, **`NR_CARTE_22_TABLE_ARIA`**, badge **`NR_CARTE_22_CORRECT_BADGE`**. Erreurs toast — **`NR_CARTE_22_GEN_ERROR_INVALID`**, **`NR_CARTE_22_GEN_ERROR_SAME_DIGITS`**.
  - **2.3 :** deux `SegmentedControl` (un par lieu) — **`NR_CARTE_BLOC5_TITLE_23`**, **`NR_CARTE_23_LETTER_LABEL_FOR`**, **`NR_CARTE_LETTER_GROUP_ARIA_FOR`**.
- **Feuille élève (publication) :** `tache.consigne` = intro avec jeton `{{doc_1}}` (réécrit à l'impression épreuve) + question + (selon comportement) tableau ou liste + zone réponse — **`NR_CARTE_PUBLISHED_INTRO_*`**, **`NR_CARTE_21_QUESTION_*`**, **`NR_CARTE_22_QUESTION`**, **`NR_CARTE_23_QUESTION_LEAD`** / **`NR_CARTE_23_ITEM_*`**, **`NR_CARTE_STUDENT_SHEET_REPONSE_LABEL`** ; styles `[data-carte-historique-student="true"]` (Lot 3 — `app/globals.css`).
- **Corrigé (`tache.corrige`) :** **`NR_CARTE_CORRIGE_REPONSE_PREFIX`** + lettre ; pour 2.2 — justification **`NR_CARTE_22_CORRIGE_JUSTIFICATION`** (chiffre ↔ élément) ; pour 2.3 — **`NR_CARTE_23_CORRIGE_TEMPLATE`** (deux lettres / deux éléments).
- **Réhydratation JSON invalide (édition) :** **`TOAST_TACHE_NR_CARTE_HISTORIQUE_HYDRATE_INVALID`**.

### Parcours perspectives (OI3 · comportements 3.1–3.5)

**Registre :** constantes **`PERSP_*`** dans `lib/ui/ui-copy.ts` (spec [SPEC-TEMPLATES-CONSIGNE.md](./SPEC-TEMPLATES-CONSIGNE.md)). **Branchement :** `WIZARD_BLOC_CONFIGS` dans `lib/tache/wizard-bloc-config.ts` — `Bloc3Resolver`, `Bloc4Resolver`, `Bloc5Resolver`.

#### Étape 3 — Modèle souple (3.1, 3.2)

- **Bouton (barre TipTap) :** Utiliser un modèle de consigne

#### Étape 3 — Template structuré (3.3, 3.4) et template pur (3.5)

- **Label radio structure :** Structure du document
- **Option groupé :** Un seul document (perspectives groupées)
- **Option séparé :** Documents distincts
- **Label radio :** Type de perspectives
- **Options radio :** Acteurs de l'époque / Historiens et historiennes
- **Label contexte :** Contexte
- **Placeholder contexte :** Ex : sur la lutte du Parti patriote en 1834
- **Hint contexte :** Décrivez brièvement l'enjeu historique et la période.

#### Étape 3 — Modale migration structure

- **Titre :** Modifier la structure du document
- **Corps :** Les contenus saisis (extraits, sources, acteurs) seront transférés dans la nouvelle structure.
- **Sous-texte si groupé :** Un seul document physique divisé en perspectives côte à côte.
- **Sous-texte si séparé :** Documents indépendants, réutilisables dans la banque.
- **Confirmer :** Confirmer
- **Annuler :** Annuler

#### Étape 4 — Perspectives (3.3, 3.4 count=2 ; 3.5 count=3)

- **Labels section :** Perspective A / Perspective B / Perspective C
- **Label acteur :** Acteur ou historien
- **Placeholder acteur :** Ex : François de Lévis, général français
- **Label extrait :** Extrait
- **Label source :** Source

#### Étape 5 — Corrigé intrus (3.5)

- **Label intrus :** Quel est l'acteur ou historien dont le point de vue est différent ?
- **Label différence :** Explication de la différence
- **Label commun :** Point commun des deux autres

### Étape 4 · Documents historiques

#### Intro (stepper / carte — implémentation Next.js)

- Associez les documents historiques pertinents.

#### Légende (document iconographique)

- **Champ :** Légende — **optionnel** ; si renseigné : **maximum 50 mots** (validation application).
- **Compteur :** composant **`LimitCounterPill`** (`unit="words"`, `max` / seuil = **`DOCUMENT_LEGEND_MAX_WORDS`** / **`DOCUMENT_LEGEND_WORD_WARNING_AFTER`** dans `lib/schemas/autonomous-document.ts`) — pilule « X / 50 » sur la **même ligne** que le libellé **Légende** et le bouton d’aide (flex, compteur à droite) ; rampe **avertissement** puis **danger** à la limite ; transition douce ; plus de ligne de compteur sous le textarea.
- **Texte d’aide (infobulle / tooltip, verbatim `DOCUMENT_MODULE_LEGEND_HELP_TOOLTIP`) :**  
  La légende est un court texte optionnel qui accompagne une image pour en préciser le contenu, le contexte ou la signification historique. Elle aide l’élève à mieux comprendre ce qu’il observe (ex. : lieu, date, personnage, événement). La légende apparaîtra directement sur l’image, dans le coin de votre choix, sous forme de rectangle en surimpression : fond blanc semi-transparent et filet noir à gauche. Maximum 50 mots.

#### Titre du document — feedback compteur de mots (wizard document + Bloc 4)

- **Composant :** **`WordCountFeedback`** (`components/ui/WordCountFeedback.tsx`), pilule colorée sous le champ + bannière texte si niveau ≠ neutre. Purement informatif — ne bloque ni la saisie ni la publication.
- **Seuils :** **`lib/documents/seuils-avertissement.ts`** — `evaluerTitre()` + `messageTitre()`.
  - **1–8 mots** : pilule grise neutre, aucun message.
  - **9–12 mots** : pilule orange, message verbatim **`DOCUMENT_WARNING_TITRE_ORANGE`** : « Ce titre est un peu long. Envisagez de le raccourcir pour améliorer la lisibilité. »
  - **13+ mots** : pilule rouge, message verbatim **`DOCUMENT_WARNING_TITRE_ROUGE`** : « La longueur du titre pourrait nuire à la mise en page et à la compréhension de l'élève. Raccourcissez-le autant que possible. »

#### Contenu textuel — feedback compteur de mots (wizard document + Bloc 4)

- **Composant :** identique — `WordCountFeedback` sous l'éditeur TipTap (wizard document) ou la textarea (Bloc 4). Comptage sur le texte brut (HTML stripé).
- **Seuils :** `evaluerContenuTextuel()` + `messageContenuTextuel()` — la branche « rouge » couvre deux cas distincts (trop court OU trop long).
  - **< 15 mots** : pilule rouge, message verbatim **`DOCUMENT_WARNING_CONTENU_TROP_COURT`** : « Ce texte semble trop court pour constituer un document exploitable par l'élève. »
  - **15–100 mots** : pilule grise neutre, aucun message.
  - **101–150 mots** : pilule orange, message verbatim **`DOCUMENT_WARNING_CONTENU_ORANGE`** : « Ce texte est un peu long. Envisagez de le raccourcir pour ne pas surcharger l'élève. »
  - **151+ mots** : pilule rouge, message verbatim **`DOCUMENT_WARNING_CONTENU_ROUGE`** : « La longueur du texte risque de dépasser l'espace disponible sur la copie ou de surcharger cognitivement l'élève. Raccourcissez-le autant que possible. »
- **Alignement layout dossier documentaire :** le seuil rouge long (151+ mots) déclenche automatiquement le span 2 à l'impression (`SEUIL_MOTS_SPAN2 = 150` dans `lib/impression/constantes-dossier-documentaire.ts`) — l'enseignant est prévenu en amont que son contenu va forcer la pleine largeur sur la grille bicolonnée.

#### Type de source (primaire / secondaire)

- **Obligatoire :** une valeur parmi primaire / secondaire.
- **Titres modales :** Source primaire / Source secondaire
- **Corps (verbatim = tooltips) :**
  - Source primaire : Une source primaire est un document produit à l'époque étudiée (ex. journal, lettre, artefact), qui provient directement du contexte historique.
  - Source secondaire : Une source secondaire est une analyse ou une interprétation produite après coup par un historien ou un chercheur à partir de sources.

#### Téléversement image (document iconographique, mode création)

- Texte permanent sous la zone de dépôt (verbatim `IMAGE_UPLOAD_FORMATS_INFO`) : formats JPG, PNG, WebP ; 10 Mo max ; image conservée à sa taille originale ; compression automatique si elle dépasse 2 Mo après envoi (plafond stockage).
- Après succès : dimensions finales, poids du fichier final, badge « Compressée automatiquement » si applicable (`lib/images/compress-uploaded-image.ts`, action `uploadTacheDocumentImageAction`).
- **Positionnement de la légende** (si légende non vide) : sous-titre ; modale d’aide avec corps `DOCUMENT_MODULE_LEGEND_POSITION_HELP_MODAL_BODY` (voir `lib/ui/ui-copy.ts`) ; **rangée horizontale** de 4 boutons radio iconiques (`role="radiogroup"` / `role="radio"`, flèches / Home / End) — `52×44px`, `gap` 8px, bordures `border-secondary` / `border-info`, états **info** / **secondary** via variables CSS (pas de `SegmentedControl`) ; `aria-label` par coin (pas de `title` natif sur les boutons). Glyphes : voir [DECISIONS.md](./DECISIONS.md#justifications--position-de-la-légende).

#### Réutilisation depuis la banque (document iconographique)

- Plus de ligne « échelle à l’impression » : la borne d'affichage imprimé est posée par le rendu CSS (`--tache-print-document-figure-max-height = 9.3cm`, alignée sur `PRINT_IMAGE_MAX_HEIGHT_PX = 350` dans `lib/impression/constantes-image.ts`).

### Étape 5 · Compétence disciplinaire

#### Titre et intro (`step-meta.ts`)

- Étape 5 · Compétence disciplinaire
- Sélectionnez la compétence, la composante et le critère dans le référentiel ministériel.

#### Messages (gate, chargement, vide — code)

- « Complétez d'abord les étapes « Paramètres de la tâche », « Consigne et production attendue » et « Documents historiques » pour accéder à la compétence disciplinaire. » (`Bloc6CompetenceDisciplinaire.tsx`)
- « Aucun élément pour le moment. » (liste CD vide)
- _(Messages référentiel indisponible / erreur chargement : même chaînes que § Étape 2 — Référentiels.)_

### Étape 6 · Connaissances relatives

#### Titre et intro (`step-meta.ts`)

- Étape 6 · Connaissances relatives
- Sélectionnez une ou plusieurs connaissances relatives au programme en parcourant les colonnes (réalité sociale ou période, sections, énoncés).

#### Actions (sélections multiples)

- **Réinitialiser** — efface toutes les connaissances sélectionnées ; désactivé s’il n’y en a aucune.
- **Sommaire (aperçu)** — bouton icône par ligne pour retirer une connaissance du sommaire ; glyphe Material `delete` ; **`aria-label` :** Retirer cette connaissance

### Validation (messages)

- Aucun texte de bannière globale « Il manque »
- Erreurs au niveau des champs et de l'étape concernée

### Toasts (wizard / publication)

- Modifications enregistrées (brouillon) — _chaîne actuelle en dur dans `StepperNavFooter.tsx` ; à aligner sur `lib/ui/ui-copy.ts`._
- Tâche publiée avec succès
- Modifications enregistrées avec succès (après édition d’une tâche déjà enregistrée)
- Impossible d'enregistrer les modifications : la tâche figure dans une ou plusieurs épreuves. Retirez-la des épreuves concernées, puis réessayez.
- Impossible de publier la tâche. Réessayez.
- Mise à jour impossible : la fonction SQL update_tache_transaction est absente sur Supabase. Exécutez la migration supabase/migrations/20250325180000_update_tae_transaction.sql (SQL Editor ou supabase db push), puis réessayez.
- Impossible d'enregistrer le brouillon. Réessayez.
- Après publication : message complémentaire si des **documents nouveaux** ont été créés avec la tâche et ne sont **pas encore visibles** dans la banque (`TOAST_TACHE_PUBLISH_UNPUBLISHED_DOCS` — `toast.message` après le succès).

**Autres toasts publication / données** (référence `lib/ui/ui-copy.ts`) : refus validation, image document sans HTTPS, niveau/discipline introuvable, CD/connaissances introuvables (messages `seed:ref`), erreurs RPC enum / clé étrangère, etc. — à considérer comme partie du registre ; détail dans le fichier TypeScript.

### Boutons (CTA footer)

- Sauvegarder le brouillon
- Précédent
- Publier
- Enregistrer les modifications (édition d’une tâche déjà enregistrée)
- Suivant

### Sommaire (colonne de droite)

#### Sections

- Consigne
- [Votre consigne apparaîtra ici]
- [Opération intellectuelle] : [Comportement attendu]
- [Niveau scolaire] [Discipline] [Aspects de société]
- Guidage complémentaire
- Corrigé (production attendue)
- Compétence disciplinaire
- Connaissances relatives
- Documents historiques

#### Métadonnées

- **Auteur(s) :** en mode **équipe**, le pied de fiche / sommaire liste **vous** et les **collaborateurs**, séparés par un **point médian** (`·`) ; ordre **alphabétique par nom de famille**. En mode **seul**, nom du créateur seul.
- [Date de création (autogénéré, non rempli)]
- [Statut du document (autogénéré, non rempli)]

#### Barre d'aperçu (wizard)

- Navigation principale (desktop et mobile) : **Sommaire détaillé** ; **Aperçu de l'imprimé**.
- Raccourcis mobiles (très petits écrans) : **Sommaire** ; **Imprimé**.
- Wizard tâche — variantes d'impression visibles lorsque **Aperçu de l'imprimé** est actif : **Formatif** ; **Sommatif standard** ; **Corrigé**.
- Wizard tâche — pas de toggle de feuillet : les pages Letter US sont empilées verticalement avec scroll dans l'onglet **Aperçu de l'imprimé** (rendu canonique `ApercuImpression` partagé avec Puppeteer).
- Wizard document — pas de variante secondaire (Sommaire détaillé / Aperçu de l'imprimé uniquement).
- Mobile (sous `md`) : bouton options (icône `tune`) ouvrant une feuille basse **Options** pour choisir la variante.
- Accessibilité : `Mode d'aperçu` ; `Variante d'aperçu imprimé` ; `Feuillet d'aperçu imprimé` ; `Afficher les options d'aperçu` ; `Fermer les options d'aperçu`.

---

## Page — Lire une TAÉ

`templates/single-question.php`

### Actions

- Retour
- Modifier
- Menu ⋮ (coin supérieur droit du bloc consigne) — **Imprimer** (icône Material `print`) : ouvre **`/questions/[id]/print`** dans un **nouvel onglet**. Visible pour tout lecteur disposant du menu ; les auteurs voient aussi **Modifier** et **Supprimer**.

### Sections

- Consigne
- Guidage complémentaire
- Corrigé (production attendue)
- Compétence disciplinaire
- Connaissances relatives
- Documents historiques
- Sans documents : deux emplacements squelette (textuel + iconographique), sans message d'absence.

### Pills

- Aspects

### Statuts

- Publiée
- Brouillon

### Métadonnées version

- Version {{version}} — mise à jour majeure le {{date}}
- Brouillon — modifiée le {{date}}

---

## Page — Banque collaborative

`templates/bank.php`

**Titre d’écran et entrée menu :** singulier « Banque collaborative » ; sous-sections **Tâches** / **Documents historiques** / **Épreuves** en interface unifiée (même route `/bank` — [FEATURES.md](./FEATURES.md) §8.7, [DECISIONS.md](./DECISIONS.md#épreuve-composition-enseignant--terminologie-publique)).

### Titres / Sections

- Banque collaborative
- Tâches
- Documents historiques
- Épreuves
- Filtres
- Aucun résultat

### Sous-titres et corps (onglets)

- Parcourez les tâches publiées par d'autres enseignants.
- Onglet **Documents historiques** : liste des documents publiés, filtres (**Niveau scolaire** = `PAGE_BANK_DOCUMENTS_FILTER_NIVEAU`), compteur d’usages, lien fiche, **Charger plus**, CTA création — copy dans `lib/ui/ui-copy.ts` (`PAGE_BANK_DOCUMENTS_*`, `BANK_DOCUMENT_*`, `BANK_TASK_LOAD_MORE`). Exemples :
  - « Aucun document ne correspond aux filtres. Ajustez la recherche ou créez un document. »
  - « Pour créer un document historique structuré, utilisez l’entrée dédiée. » + lien **Créer un document**
  - « Utilisé dans : X tâche(s) » (formulations selon `copyDocumentPublishedTacheUsageCount`)
- Onglet **Tâches** — filtres et tri : constantes `BANK_TASK_FILTER_*`, `BANK_TASK_SORT_*`, `BANK_TASK_LOAD_MORE` ; sous-titre `PAGE_BANK_TASKS_SUBTITLE`. Libellés alignés **étape 2** du wizard : **Niveau scolaire**, **Discipline**, **Opération intellectuelle**, **Comportement attendu** (pas d’acronyme « OI » — [DECISIONS.md](./DECISIONS.md#terminologie-ui--pas-dacronymes-interdits)). **Aspects de société** : `DOCUMENT_MODULE_ASPECTS_LABEL` (fieldset filtres). **Compétence disciplinaire** : `BANK_TASK_FILTER_CD` (libellé champ) + `BANK_TASK_FILTER_CD_HINT` (filtre sur le numéro technique du critère Miller en base, paramètre URL `cd` = `cd.id` ; jamais l’acronyme « CD » à l’écran). **Connaissances relatives** : `BANK_TASK_FILTER_CONNAISSANCES`. **Consigne** : `BANK_TASK_FILTER_SEARCH` (recherche sur texte sans mise en forme, colonne `consigne_search_plain`). Pastille liste : `BANK_TASK_LIST_BADGE_PUBLISHED` (**Publié**).
- Onglet **Épreuves** : sous-titre `PAGE_BANK_EVALUATIONS_SUBTITLE` ; CTA « Pour composer une épreuve… » + **Créer une épreuve** (`PAGE_BANK_EVALUATIONS_CTA_*`) ; recherche `BANK_EVAL_SEARCH_LABEL` ; vide `PAGE_BANK_EVALUATIONS_EMPTY` ; compteur `copyBankEvaluationTaskCount` (forme courte **tâche** / **tâches** — la forme longue et l’acronyme TAÉ sont interdits en UI) ; **Charger plus** = `BANK_TASK_LOAD_MORE` ; épreuve d’un autre auteur : `BANK_EVAL_NO_EDIT_OTHER` (pas de lien **Modifier** — aligné sur `getEvaluationEditBundle`).

### Liste (tâches)

- Voir
- Publié le
- Par
- Filtrer / Réinitialiser / Charger plus (liste paginée)
- Ajouter à une épreuve (tâche **publiée** — modale **Choisir une épreuve brouillon** : **Annuler**, **Continuer** ; vide : « Aucune épreuve brouillon. Créez d’abord une épreuve depuis Mes épreuves. »)

---

## Page — Créer / modifier une épreuve (composition)

Routes Next.js : `/evaluations/new`, `/evaluations/[id]/edit`, `/evaluations/[id]` (vue détaillée). L'aperçu / téléchargement PDF se fait depuis le carrousel modal de la vue détaillée (bouton imprimante de la barre d'actions partagée). Constantes `lib/ui/ui-copy.ts` : `EVAL_COMP_*`, `EVAL_BANK_MODAL_*`, `EVAL_LIST_LINK_EDIT`, `BANK_TASK_ADD_TO_EVALUATION`, `TOAST_EVAL_*` ; libellés carrousel et feuillets dans `components/partagees/carrousel-apercu/copy.ts` (`CARROUSEL_APERCU_COPY`, `FEUILLET_LABELS_COPY`). Détail parcours : [WORKFLOWS.md](./WORKFLOWS.md#création--édition-dépreuve-composition), règles métier : [FEATURES.md](./FEATURES.md) §10.2.1.

### Titres et liste

- Créer une épreuve
- Modifier l’épreuve
- Modifier (lien ligne liste Mes épreuves)

### Champs et zones

- Titre de l'épreuve
- Banque / Mes tâches (onglets picker)
- Composition de l'épreuve
- Fonction `evalCompCartCount` — formulation du compteur dans le titre du panier
- Question (préfixe ligne panier)
- Documents (préfixe + nombre de documents)
- Banque / Ma tâche (pastilles source ligne)

### Actions

- Ajouter
- Déjà ajoutée
- Charger plus
- Enregistrer le brouillon
- Aperçu (panier — sauvegarde brouillon puis ouverture de la vue détaillée pour aperçu / téléchargement PDF via le carrousel modal)
- Publier
- Monter / Descendre / Retirer (panier)

### États vides et aide

- Aucune tâche ajoutée. Parcourez la banque et cliquez sur « Ajouter » pour composer votre épreuve.

### Toasts et erreurs (aperçu)

- Brouillon enregistré.
- Évaluation publiée.
- Connectez-vous pour enregistrer.
- Indiquez un titre d'épreuve.
- Ajoutez au moins une tâche avant de publier.
- Une ou plusieurs tâches ne peuvent pas être ajoutées.
- Évaluation introuvable.
- Enregistrement impossible : la fonction SQL save_evaluation_composition est absente sur Supabase. Appliquez la migration puis réessayez.
- Enregistrement impossible. Réessayez.

---

## Page — Profil enseignant (public)

`templates/teacher-profile.php`

> **PROVISOIRE / à définir** — copy à définir lors de l'implémentation.

### Sections (placeholder)

- Profil enseignant
- Tâches publiées
- Aucune tâche publiée pour le moment

---

## Module documents historiques

[module-dcuments-historiques.md](./module-dcuments-historiques.md) — substance équivalente ; tenir **synchrone** avec ce registre.

**Terminologie (livrable élève) :** en copy **visible** (modales, aides, FAQ, commentaires SQL lisibles produit), utiliser **copie de l’élève** pour ce qui est remis ou affiché côté élève ; **ne pas** afficher « fiche élève » (terme technique interne). Les formulations du type « fiche » / « feuille élève » dans le guidage imprimé (enseignant vs élève) restent telles que listées dans les clés concernées.

### Structure du document (wizard — étape 0)

- **Titre d'étape :** Structure du document
- **Sous-titre :** Choisissez la structure qui correspond à l'usage pédagogique du document.

#### Card — Document simple

- **Titre :** Document simple
- **Description :** Un seul élément, texte ou image. Compatible avec toutes les opérations intellectuelles.
- **Modale (i) — titre :** Document simple
- **Modale (i) — corps :**
  Un document simple contient un seul élément, textuel ou iconographique. C'est la structure la plus courante dans les épreuves ministérielles : un extrait de texte, une carte, une photographie ou un tableau statistique, présenté seul avec son titre et sa source.
  Cette structure est compatible avec toutes les opérations intellectuelles du programme. Elle convient chaque fois que la tâche repose sur l'analyse d'une source unique : établir un fait, identifier une cause ou une conséquence, situer un événement dans le temps, etc.
  Choisissez cette structure quand votre document se suffit à lui-même pour que l'élève réalise l'opération intellectuelle demandée.

#### Card — Document à perspectives

- **Titre :** Document à perspectives
- **Description :** 2 ou 3 points de vue côte à côte.
- **Ligne OI :** icône `text_compare` — Dégager des différences et des similitudes
- **Comportements listés (muted) :**
  - Indiquer le point précis sur lequel des acteurs ou des historiens sont en désaccord (divergence)
  - Indiquer le point précis sur lequel des acteurs ou des historiens sont d'accord (convergence)
  - Montrer des différences et des similitudes par rapport à des points de vue d'acteurs ou à des interprétations d'historiens
- **Modale (i) — titre :** Document à perspectives
- **Modale (i) — corps :**
  Un document à perspectives regroupe 2 ou 3 points de vue sur un même sujet, présentés côte à côte dans un seul cadre. Chaque perspective est un élément distinct (texte ou image) avec son propre auteur et sa propre source.
  Le terme perspective désigne ici le regard porté par un acteur de l'époque ou par un historien sur une réalité sociale. Deux acteurs peuvent observer le même événement et en tirer des conclusions opposées : c'est précisément ce que l'élève doit analyser.
  Cette structure est conçue pour l'opération intellectuelle Dégager des différences et des similitudes. Elle permet de travailler les comportements suivants :
  - Indiquer le point précis sur lequel des acteurs ou des historiens sont en désaccord (2 perspectives)
  - Indiquer le point précis sur lequel des acteurs ou des historiens sont d'accord (2 perspectives)
  - Montrer des différences et des similitudes par rapport à des points de vue d'acteurs ou à des interprétations d'historiens (3 perspectives)
    Les perspectives peuvent être de types différents au sein du même document. Par exemple, une caricature d'époque et un extrait de discours politique peuvent constituer deux perspectives complémentaires sur un même enjeu.

#### Card — Document à deux temps

- **Titre :** Document à deux temps
- **Description :** Un même objet à deux moments distincts.
- **Ligne OI :** icône `alt_route` — Déterminer des changements et des continuités
- **Comportement listé (muted) :**
  - Montrer qu'une réalité historique se transforme ou se maintient
- **Modale (i) — titre :** Document à deux temps
- **Modale (i) — corps :**
  Un document à deux temps présente un même objet ou une même réalité à deux moments distincts, pour que l'élève puisse observer ce qui a changé ou ce qui s'est maintenu entre les deux périodes. Chaque temps est un élément distinct (texte ou image) avec son propre repère temporel et sa propre source.
  Le terme deux temps fait référence à la comparaison diachronique : on place côte à côte deux états d'une même réalité, séparés dans le temps, pour rendre visible le changement ou la continuité.
  Cette structure est conçue pour l'opération intellectuelle Déterminer des changements et des continuités. Elle permet de travailler le comportement suivant :
  - Montrer qu'une réalité historique se transforme ou se maintient
    Les deux temps peuvent être de types différents. Par exemple, une carte de la Nouvelle-France en 1713 et une carte de la même région en 1763 pour observer les changements territoriaux après la Conquête, ou une photographie d'époque et un texte contemporain pour observer une évolution sociale.

#### Sous-choix perspectives (après sélection de la card)

- **2 perspectives** — Pour un point d'accord ou de désaccord entre deux acteurs ou historiens.
- **3 perspectives** — Pour une comparaison plus large avec identification de différences et similitudes entre trois points de vue.

### Création — champs et libellés (`lib/ui/ui-copy.ts`)

- **Page :** Créer un document ; **Modifier le document** (`DOCUMENT_MODULE_PAGE_TITLE_EDIT`) — `/documents/[id]/edit` (auteur) ; toasts `TOAST_DOCUMENT_UPDATE_SUCCESS`, `TOAST_DOCUMENT_EDIT_FORBIDDEN`
- **Titre du document**
- **Type de document** (au-dessus des choix Textuel / Iconographique — `RequiredMark` en UI)
- **Textuel** / **Iconographique**
- **Catégorie iconographique** (`DOCUMENT_TYPE_ICONO_CATEGORY_LABEL`, aide `DOCUMENT_TYPE_ICONO_CATEGORY_HELP`) — optionnel, uniquement si type = iconographique ; slugs `DOCUMENT_TYPE_ICONO_SLUGS`, libellés `DOCUMENT_TYPE_ICONO_LABEL` ; pastilles courtes liste banque `DOCUMENT_TYPE_ICONO_BADGE_SHORT` ; helper `documentTypeIconoLabel()` dans `lib/ui/ui-copy.ts`
- **Contenu (texte)** (si texte)
- **Source** — placeholder : Ex. : Archives nationales du Québec, 1837. — aide sous champ : Mise en forme disponible : gras, italique, souligné, listes à puces.
- **Type de source** — **Primaire** / **Secondaire** — composant **`SegmentedControl`** (Bloc 4 : ligne d’aides **(i)** sous les segments ; wizard autonome : une aide **(i)** sur la ligne du libellé) ; modales : textes identiques à [Étape 4 · Type de source](#étape-4--documents-historiques)
- **Légende** — paragraphes d’aide modale P1/P2 — erreur : La légende ne peut pas dépasser 50 mots. / Choisissez un coin pour la légende lorsque celle-ci est renseignée.
- **Position de la légende sur l'image** ; **Positionnement de la légende** (sous-section impression)
- **Discipline**, **Niveau**, **Connaissances associées**, **Aspects de société** — placeholder liste : Sélectionner
- **Documentation légale** (titre de section, glyphe `gavel`)
- **Corps légal :**
  - En ajoutant ce document, vous confirmez que vous avez le droit de l'utiliser dans un contexte éducatif, conformément à la Loi sur le droit d'auteur et aux ententes applicables (ex. Copibec).
  - Vous vous engagez à respecter les limites de reproduction permises (extraits raisonnables) et à citer adéquatement la source.
  - La plateforme ne vérifie pas les droits d'auteur des contenus ajoutés et décline toute responsabilité en cas d'utilisation non conforme.
- **Checkbox obligatoire :** Je confirme respecter les règles d'utilisation des œuvres en milieu scolaire au Québec (ex. Copibec)
- **Soumission :** Enregistrer le document
- **Repère temporel** (optionnel) : libellé, texte d’aide modale, placeholders, ligne **↳ Année extraite :** (couleur succès), hint saisie manuelle — constantes `REPERE_TEMPOREL_*`, `REPERE_TEMPOREL_EXTRACTED_PREFIX`, `REPERE_TEMPOREL_MANUAL_HINT` dans `lib/ui/ui-copy.ts` ; validation année : **`ERROR_ANNEE_NORMALISEE_RANGE`**
- **Ancrage temporel** (libellé officiel, remplace « Repère temporel » en UI — SPEC-SOMMAIRE-DOCUMENT §2.8) : constantes `ANCRAGE_TEMPOREL_LABEL`, `ANCRAGE_TEMPOREL_TOOLTIP_TITLE`, `ANCRAGE_TEMPOREL_TOOLTIP_BODY`, `ANCRAGE_TEMPOREL_TOOLTIP_EXAMPLES` dans `lib/ui/copy/document.ts` ; tooltip attaché au label du champ dans le wizard (primitive `Tooltip` light card, icône `anchor` accent teal) ; exemples : `1760`, `1760–1867`, `Vers 1800`. Colonne SQL et logique métier conservent `repere_temporel` — seul le libellé UI change.

### Wizard — titres d’étape et textes

- Intro : Complétez les étapes pour créer un document historique structuré. L’aperçu se met à jour à chaque modification.
- Étape 1 — Structure du document (voir [Structure du document](#structure-du-document-wizard--étape-0) ci-dessus)
- Étape 2 — Ajouter un document (ancienne étape 1)
- **Refonte UI étape 1** (`StepDocument.tsx`) : **`SegmentedControl`** (type de document, type de source) ; champs **Fichier**, **Source**, **Catégorie iconographique**, **Contenu**, **Repère** (wizard) : textes d’aide en **modale (i)** — constantes `DOCUMENT_WIZARD_STEP1_PLACEHOLDER_*`, `DOCUMENT_WIZARD_STEP1_HELP_*` (titres + corps) ; `DOCUMENT_WIZARD_STEP1_CONTENU_LABEL` ; `ImageUploadDropzone` prop `hideFormatsHint` ; `RepereTemporelField` : `suppressLabelAndHelp`, `textInputPlaceholder` ; préfixe année extraite `REPERE_TEMPOREL_EXTRACTED_PREFIX` (« ↳ Année extraite : ») en **text-success** ; contenu textuel : **TipTap** (`RichTextEditor`) — aperçu via `sourceCitationDisplayHtml`.
- Étape 3 — Indexer le document (ancienne étape 2)
- Étape 4 — Confirmation — Droits d'auteur (ancienne étape 3) — sous-texte : Lisez le cadre légal et confirmez avant d’enregistrer le document.
- Fichier du document ; Glisser un fichier ici ou choisir ; texte permanent `IMAGE_UPLOAD_FORMATS_INFO` (JPG, PNG, WebP — 10 Mo — image conservée taille originale, compression auto si > 2 Mo).
- Optionnel — cochez une ou plusieurs connaissances. / Sélectionnez d’abord une discipline.
- Aperçu du document
- Toasts / erreurs : Document enregistré. ; Document enregistré. La base Supabase n’a pas toutes les colonnes… ; Impossible d'enregistrer le document… ; Connectez-vous pour enregistrer un document. ; Brouillon du document enregistré dans ce navigateur. ; messages upload image (`TOAST_DOCUMENT_IMAGE_*`, `IMAGE_UPLOAD_ERROR_*`, `TOAST_DOCUMENT_IMAGE_TOO_LARGE_CLIENT`) — voir `lib/ui/ui-copy.ts` ; Une ou plusieurs connaissances sélectionnées ne correspondent pas au référentiel…
- `DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW` : message si une URL héritée pointe encore vers un PDF (téléversements actuels : JPG, PNG, WebP — voir [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md)).

### Fiche lecture (`/documents/[id]`)

- Surtitre : Document historique
- `DOCUMENT_FICHE_PDF_OPEN_NEW_TAB` : lien pour ouvrir un fichier PDF hérité dans un nouvel onglet (plus d’intégration PDF embarquée).
- Retour (vers banque onglet documents)
- **Auteur, document non visible banque (`is_published` faux) :** encadré **Visibilité dans la banque collaborative** — `DOCUMENT_FICHE_BANK_SECTION_TITLE`, `DOCUMENT_FICHE_BANK_SECTION_BODY`, CTA **`DOCUMENT_FICHE_BANK_SAVE_CTA`** ; toasts **`TOAST_DOCUMENT_BANK_UPDATE_*`**
- Lien **Modifier** (`DOCUMENT_FICHE_EDIT`) — auteur uniquement
- Sections / pastilles : Type de document — Textuel / Iconographique ; si iconographique et catégorie renseignée : **Catégorie :** … (`DOCUMENT_FICHE_TYPE_ICONO_LINE` + libellé) ; Type de source — Primaire / Secondaire ; Références et indexation ; Niveau ; Discipline ; Aspects de société ; Connaissances ; Auteur ; Date de création ; Source

### Banque — documents (rappel)

- Voir la fiche ; Filtrer ; Réinitialiser ; Chargement des documents… ; messages liste vide ; etc. (`PAGE_BANK_DOCUMENTS_*`, `BANK_DOCUMENT_*`).
- **Catégorie iconographique** (`BANK_FILTER_ICONO_CATEGORY_LABEL`) — cases à cocher, paramètre URL répété `icat` ; texte d’aide `PAGE_BANK_DOCUMENTS_FILTER_ICONO_ALL` ; **masqué** si le filtre **Type de document** = textuel.

### Intégration création de tâche (libellés fonctionnels)

- Créer un nouveau document (wizard)
- Sélectionner un document existant depuis la banque collaborative

### Texte « Utilisé dans X tâches »

- Indique combien de tâches réutilisent ce document ; calculé à partir des liaisons **`tache_documents`** — **uniquement les TAÉ publiées**, une fois par tâche ([FEATURES.md](./FEATURES.md) §5.4). Formulations : voir `copyDocumentPublishedTacheUsageCount` dans `lib/ui/ui-copy.ts`.

---

## Vue détaillée tâche (`/questions/[id]`)

### Titres de section du flux principal

- **Document** / **Documents** (singulier/pluriel selon le nombre de documents référencés) — `FICHE_SECTION_TITLE_DOCUMENT`, `FICHE_SECTION_TITLE_DOCUMENTS`, helper `ficheDocumentsSectionTitle(count)`
- **Guidage** — `FICHE_SECTION_TITLE_GUIDAGE`
- **Production attendue** — `FICHE_SECTION_TITLE_PRODUCTION_ATTENDUE`
- **Outil d\u2019évaluation** — `FICHE_SECTION_TITLE_GRILLE`

Toutes les constantes vivent dans `lib/ui/ui-copy.ts`.

---

## Impression — modale et contenu

Source de vérité : `components/partagees/carrousel-apercu/copy.ts` (`CARROUSEL_APERCU_COPY`, `FEUILLET_LABELS_COPY`).

### Carrousel modal — `CarrouselApercuModale`

Wrapper d'overlay partagé par les 3 vues détaillées (tâche, document, épreuve), ouvert depuis le bouton imprimante de la barre d'actions.

- Titre dialog : Aperçu avant impression (`modalTitle`)
- Bouton fermer : Fermer (`boutonFermer`)
- Bouton télécharger PDF : Télécharger le PDF (`boutonTelechargerPdf`)
- Skeleton titre : Préparation de l'aperçu… (`skeletonTitre`)
- Skeleton sous-titre : Mise en page et génération des visuels (`skeletonSousTitre`)
- Bannière d'invalidation : L'aperçu ne reflète plus le contenu actuel du formulaire. (`banniereInvalidation`)
- Bouton regénérer : Mettre à jour l'aperçu (`boutonRegenerer`)
- Erreur génération : La génération a échoué (`erreurGeneration`)
- Bouton réessayer : Réessayer (`boutonReessayer`)
- Indicateur de page : Page {n} sur {total} (`indicateurPage(n, total)`)
- Alt text image : Page {n} sur {total} — {nom du feuillet} (`altImage(n, total, nomFeuillet)`)

### Labels onglets feuillets (`FEUILLET_LABELS_COPY`)

- `dossier-documentaire` : Dossier documentaire
- `questionnaire` : Questionnaire
- `cahier-reponses` : Cahier de réponses
- Grille de correction
- Préfixe source imprimée : Source :
- Emplacement vide : —
- Aucun outil d’évaluation associé.

_(Titres de section non affichés visuellement sur la feuille — voir [DECISIONS.md](./DECISIONS.md#impression-aperçu-et-fiche-imprimable).)_

---

## Lexique global

Ne pas dupliquer le tableau ici : source normative **[DECISIONS.md — Lexique global](./DECISIONS.md#lexique-global)** (aligné sur la [terminologie / acronymes interdits](./DECISIONS.md#terminologie-ui--pas-dacronymes-interdits)).

---

## Copy à valider / PROVISOIRE

Les pages suivantes ne disposent pas encore de copy officielle complète dans ce registre :

- Créer une épreuve (`templates/create-evaluation.php`)
- Modifier une épreuve (`templates/edit-evaluation.php`)
- Profil enseignant (`templates/teacher-profile.php`)
- Liste enseignants (`templates/teachers.php`)
- Modifier profil (`templates/edit-profile.php`)

Toute copy temporaire doit être marquée comme **PROVISOIRE** dans le code et référencée ici lorsqu’elle est consignée.

### Impression tâche seule (`IMPRESSION_TACHE_SEULE_*`)

- Titre modale aperçu : Aperçu de la tâche (`IMPRESSION_TACHE_SEULE_MODAL_TITLE`)

### Impression document seul (`IMPRESSION_DOCUMENT_SEUL_*`)

- Titre modale aperçu : Aperçu du document (`IMPRESSION_DOCUMENT_SEUL_MODAL_TITLE`)
- Erreur débordement : Le contenu dépasse la page — réduisez la taille du document. (`IMPRESSION_DOCUMENT_DEBORDEMENT`)

**Modes d’impression** (formatif, sommatif, corrigé, épreuve) : copy définitive à ajouter après validation — [FEATURES.md](./FEATURES.md) §10.5.

---

## Trous et notes

- **Toasts publication étendus :** nombreux messages dans `lib/ui/ui-copy.ts` (lignes ~6–46 et suivantes) ne sont pas tous recopiés mot à mot dans ce fichier ; le TypeScript reste la **référence d’exécution** — toute évolution doit mettre à jour **les deux**.
- **« Modifications enregistrées (brouillon) » :** chaîne en dur dans `components/tache/wizard/StepperNavFooter.tsx` — à externaliser pour éviter la dérive.
- **Titres modales Bloc 2 :** `MODAL_TITRE_COMPORTEMENT` est défini en local dans `Bloc2GrilleAndModals.tsx` — envisager une constante partagée alignée sur ce registre.
- **Libellés Secondaire 1…4 et disciplines** : `components/tache/wizard/bloc2/constants.ts` (`NIVEAUX`, `DISCIPLINE_LABEL`) — non repris exhaustivement ici.
- **Maquettes « UI suggestion »** de l’ancien document unique : non reproduites ; ne constituent pas une source de copy.

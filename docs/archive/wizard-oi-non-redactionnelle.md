# Spécifications — Création de tâches non rédactionnelles (opérations intellectuelles)

## Contexte de l'application

L'application permet à des enseignants d'Histoire du Québec et du Canada (3e et 4e secondaire) de créer des **tâches d'apprentissage et d'évaluation (TAÉ)** liées aux **opérations intellectuelles** du programme. Le wizard existant couvre les parcours dits **rédactionnels** (réponse de l'élève en phrases). Ce document décrit les **six parcours distincts** pour les tâches **non rédactionnelles**, où l'élève répond par **numéros de documents**, **lettres** ou **repères** sur un support visuel, sans rédiger de phrases complètes.

### Règle transversale — Téléversement (documents et cartes)

**Tous les fichiers téléversés pour les documents iconographiques et les cartes sont des images uniquement (JPG, PNG ou WebP). Aucun PDF n'est accepté.** Taille maximale : **10 Mo** ; redimensionnement automatique côté serveur si l’image dépasse **660 × 400 px** (voir `lib/images/resize-image.ts`). Cette règle s'applique à la création de TAÉ, au module documents historiques et au stockage associé (`tache-document-images`).

### Avertissement — Données structurées et saisie (tous les parcours non rédactionnels)

Dès que la valeur métier est **contrainte** (permutation de numéros de documents, partition avant/après, indices de documents dans le dossier, dates d’un axe temporel, etc.), l’implémentation doit utiliser un **type canonique** en mémoire et en JSON (tableau typé, entiers bornés, tuples) et une **UI dédiée** (cases type « code PIN », pickers alignés sur le nombre de documents, contrôles qui **empêchent les doublons** ou les valeurs hors domaine).

**À éviter :** textarea ou champ texte libre pour ces données — cela produit des formats hétérogènes (`1-2-3-4`, `1, 2, 3, 4`, espaces, fautes) et fragilise **Sommaire**, **fiche**, **impression**, **brouillons** et **validation**.

**À appliquer au développement des parcours 2 à 6 :** les colonnes _Placeholder_ ou _ex. :_ dans les tableaux ci-dessous décrivent l’**intention pédagogique** ou l’**affichage normalisé** (ex. `1 - 2 - 3 - 4`), **pas** la spec d’un simple `<input type="text">` sans contrainte.

### Données temporelles — repère et année normalisée (OI1, transversal)

**Persistance :** colonnes SQL **`repere_temporel`** (texte libre) et **`annee_normalisee`** (entier, nullable) sur la table **`documents`** ; mêmes champs dans l’état wizard **`DocumentSlotData`** (Bloc 4 TAÉ et wizard document autonome).

**Rôle métier :** permettre aux **algorithmes** de **comparer** les documents entre eux ou avec un repère donné. Ces champs sont **centraux** pour l’**OI1 — Situer dans le temps** et l’**automatisation** des parcours non rédactionnels qui s’y rattachent.

**FAQ enseignants (texte public, hors jargon technique) :** [FAQ.md](./FAQ.md#faq-repere-temporel-enseignants).

**Saisie — `RepereTemporelField` :** l’enseignant saisit un repère en langage naturel (ex. « vers 1760 », « juin 1834 », « -30 000 av. J.-C. »). Le système tente d’extraire la **première année à 4 chiffres** et la stocke dans **`annee_normalisee`**. Si l’extraction échoue, un **champ numérique** permet la saisie manuelle d’une année (**années négatives** autorisées). Le composant est utilisé **partout** où un document est créé ou édité en formulaire (wizard TAÉ Bloc 4, module Créer un document) — le bloc **affiche** toujours le repère, **quelle que soit l’OI** ; en revanche, l’**obligation** de remplir une année comparable avant de poursuivre dépend du **comportement** (voir ci‑dessous).

**Comparaison côté code — `getAnneePourComparaison` :** fonction dans **`lib/tache/document-annee.ts`** — priorité à **`annee_normalisee`** si présente et finie ; sinon **extraction** depuis **`repere_temporel`** (`extractYearFromString`). Sert de **fallback** dans les helpers si la validation amont est incomplète ; en production, la cible reste une **année persistée** dès que possible.

**Bloc 4 — Documents (wizard TAÉ) :** chaque slot inclut **`RepereTemporelField`** alimenté par le state. Pour les **parcours rédactionnels**, le slot peut être « complété » au sens `computeSlotStatus` **sans** année : le repère reste **optionnel** pour la complétude générale. Pour les **comportements non rédactionnels de l’OI1** concernés, la spec produit exige que **tous** les documents du dossier aient une **année comparable** (non null selon la règle retenue dans l’implémentation) **avant** l’accès au Bloc 5 ou la génération — la contrainte est **déclarative** dans **`lib/tache/behaviours/*.ts`** (`bloc4.requiresRepereTemporel`, et **`completionCriteria.bloc4`** lorsque ce critère est câblé au stepper / garde-fous).

**Bloc 5 — Corrigé / options :** chaque variante non rédactionnelle **consomme** les années (ou segments / repère de l’étape 3 selon le parcours) pour **générer** ou **valider** les options. Les résultats vivent dans **`state.bloc5.nonRedaction`** (union typée + payload JSON par slug). Les **helpers** de génération doivent rester des **fonctions pures**, testables unitairement (`lib/tache/non-redaction/`). Tous les libellés UI passent par **`UI-COPY.md`** / **`lib/ui/ui-copy.ts`**.

**Cibles par comportement (OI1) — référence produit :**

| Comportement | Slug (wizard)         | Usage des années / repère                                                                                                                                                                                                             |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1          | `ordre-chronologique` | Quatre documents : **ordre correct** = tri par **`annee_normalisee`** croissant (indices 1–4 = ordre de saisie) ; distracteurs, mélange, lettre, justification ; **égalités** d’années : résolution manuelle (PIN) si besoin.         |
| 1.2          | `ligne-du-temps`      | Un document cible : comparer **`annee_normalisee`** du document aux **segments** de la frise (étape 3) ; validation de cohérence au Bloc 5 ; options liées aux segments (pas de même logique que 1.1).                                |
| 1.3          | `avant-apres`         | Quatre documents vs **année ou période du repère** (AAAA ou AAAA–AAAA inclusive) à l’étape 3 : AVANT / APRÈS ; génération d’options et **overrides** si l’année d’un document coïncide avec le pivot ou se situe **dans** la période. |

**Fiche et impression :** l’**enseignant** voit corrigé et options selon le payload non rédactionnel ; l’**élève** voit le gabarit prévu (grille, segments, etc.) sans exposer le corrigé enseignant — aligné **`FicheTache`**, **`formStateToTache`**, bundles impression.

> Cette sous-section fixe le **cadre commun** ; les tableaux détaillés par parcours (ci‑dessous) et le code font foi pour l’état d’implémentation au fil des livraisons.

---

## Logique de branchement global

Lorsque l'enseignant sélectionne une **opération intellectuelle** et un **comportement attendu** à l'**étape 2** du wizard, l'interface détecte si le comportement est **non rédactionnel** et active le parcours correspondant (étapes 3 et 4 spécifiques). Les **étapes 1, 2, 5 et 6** sont communes à tous les parcours. Pour **tout** parcours non rédactionnel (`variant_slug` dans les données), l’**étape 2** affiche tout de même la section **Espace de production** en **lecture seule** : la valeur `nb_lignes` lue dans `oi.json` vaut **0**, ce qui déclenche le message **non rédactionnel** (pas de saisie ni de curseur). Les **traits de réponse rédigée** n'apparaissent **pas** au pied de fiche ni à l'aperçu impression — l'élève répond selon le gabarit du parcours (cases, lettre, etc.), pas par phrases sur des lignes. Libellés et détail d’implémentation : [UI-COPY.md](./UI-COPY.md), [WORKFLOWS.md](./WORKFLOWS.md#bloc-2--paramètres-de-la-tâche-étape-2).

---

## Structure commune à tous les wizards

### Étape 1 — Mode de conception

| Élément                      | Copy                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Titre de l'étape             | Conception                                                                      |
| Label — Mode                 | Comment avez-vous conçu cette tâche ?                                           |
| Option 1                     | Seul                                                                            |
| Option 2                     | En équipe                                                                       |
| Label — Collaborateurs       | Ajouter des collaborateurs                                                      |
| Placeholder — Collaborateurs | Rechercher un enseignant...                                                     |
| Message d'aide               | Seuls les enseignants inscrits à la plateforme apparaissent dans les résultats. |

> Le champ Collaborateurs n'apparaît que si « En équipe » est sélectionné.

---

### Étape 2 — Paramètres de la tâche (alignement app)

> **Source de vérité copy / layout :** [UI-COPY.md](./UI-COPY.md#page--créer-une-taé-wizard) (étape 2) et [WORKFLOWS.md](./WORKFLOWS.md#bloc-2--paramètres-de-la-tâche-étape-2). Le tableau ci-dessous résume l’intention pédagogique pour les parcours **non rédactionnels** décrits dans ce document (niveaux ciblés 3e / 4e secondaire, discipline HQC).

| Élément                  | Copy / comportement                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Titre de l'étape         | Paramètres de la tâche (texte d’intro long dans l’infobulle titre, pas sous le `h2`)     |
| Niveau scolaire          | Liste déroulante ; pour ce périmètre : 3e et 4e secondaire                               |
| Discipline               | Histoire du Québec et du Canada (assignée automatiquement en Sec 3–4 dans l’app)         |
| Opération intellectuelle | Sélection parmi les OI actives ; placeholder ministériel                                 |
| Comportement attendu     | Filtre sur les comportements de l’OI ; message d’aide = structure du formulaire + grille |
| Grille de correction     | CTA **Voir la grille** ; données barème alignées sur le comportement                     |
| Espace de production     | Lecture seule ; message non rédactionnel lorsque `nb_lignes === 0` dans `oi.json`        |

---

### Étape 5 — Compétence disciplinaire

| Élément                  | Copy                                    |
| ------------------------ | --------------------------------------- |
| Titre de l'étape         | Compétence disciplinaire                |
| Label — Compétence       | Compétence                              |
| Placeholder — Compétence | Sélectionner une compétence…            |
| Label — Composante       | Composante                              |
| Placeholder — Composante | Sélectionner une composante…            |
| Label — Critère          | Critère d'évaluation                    |
| Valeur fixe — Critère    | Utilisation appropriée de connaissances |

---

### Étape 6 — Connaissances relatives

| Élément                       | Copy                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| Titre de l'étape              | Connaissances relatives                                               |
| Label — Période               | Période historique                                                    |
| Placeholder — Période         | Sélectionner une période…                                             |
| Label — Réalité sociale       | Réalité sociale                                                       |
| Placeholder — Réalité sociale | Sélectionner une réalité sociale…                                     |
| Label — Énoncé PDA            | Énoncé de connaissance (PDA) \*                                       |
| Placeholder — Énoncé PDA      | Sélectionner un énoncé de connaissance…                               |
| Message d'aide — PDA          | Sélectionnez le savoir historique précis mis en jeu dans cette tâche. |

---

## Parcours 1 — Ordonner chronologiquement des faits

**Comportement attendu :** Ordonner chronologiquement des faits en tenant compte de repères de temps (réf. `1.1` — _Situer dans le temps_).  
**Opération intellectuelle :** Situer dans le temps  
**Type de réponse de l'élève :** Choix d'une lettre (A, B, C ou D) correspondant à l'ordre chronologique correct des documents  
**Nombre de documents :** 4 documents textuels ou iconographiques (images JPG/PNG)

> **Généré automatiquement :** numérotation des documents (1, 2, 3, 4) selon l'ordre de saisie à l'étape 4 ; libellés d'options A à D ; mise à jour du **Sommaire** et de la fiche dynamique à droite.

### Étape 3 — Consigne et production attendue

| Élément                             | Copy                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre de l'étape                    | Consigne et production attendue                                                                                                                                                                                                                                                                             |
| Label — Consigne                    | Consigne \*                                                                                                                                                                                                                                                                                                 |
| Badge ministériel                   | Libellé ministériel (`NR_ORDRE_CONSIGNE_MINISTERIAL_BADGE`) — pastille avec cadenas                                                                                                                                                                                                                         |
| Saisie consigne                     | **Template inline** (plus de textarea libre) : phrase fixe + jeton **Doc 1–N** (aperçu wizard) + **une zone éditable** (réalité sociale ou thème, max 80 car.) ; légende trois types de zones ; note renumérotation en épreuve                                                                              |
| Donnée persistée (thème)            | Champ JSON **`consigne_theme`** dans le payload ordre chrono — pas d’extraction depuis un ancien paragraphe                                                                                                                                                                                                 |
| Phrase publiée (stockage)           | Intro reconstruite à la publication : `Les documents {{doc_A}}, {{doc_B}}, {{doc_C}} et {{doc_D}} portent sur [thème]. …` — jetons réécrits à l’impression épreuve (`evaluation-print-doc-map`)                                                                                                             |
| Valeur pré-remplie (ref.)           | _Ancien modèle textarea :_ `NR_ORDRE_CONSIGNE_PREFILL` — conservé pour documentation / brouillons historiques                                                                                                                                                                                               |
| Message d'aide — Consigne           | `NR_ORDRE_CONSIGNE_HELP` (texte sous le label — zone bleue seule modifiable, numéros automatiques)                                                                                                                                                                                                          |
| Guidage élève (`tae.guidage`)       | **Texte fixe** `NR_ORDRE_STUDENT_GUIDAGE` — non modifiable par l’enseignant ; distinct de l’aide **options** (`NR_ORDRE_OPTIONS_HELP`). Sur **feuille élève** (aperçu impression, questionnaire épreuve), masquable via `TacheFicheData.showGuidageOnStudentSheet === false` (ex. passation **sommative**). |
| Guidage complémentaire (enseignant) | Aligné sur les autres parcours : champ optionnel, HTML fixe publié côté enseignant — voir implémentation `Bloc3OrdreChronologique`.                                                                                                                                                                         |

### Étape 4 — Dossier documentaire

| Élément                 | Copy                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre de l'étape        | Dossier documentaire                                                                                                                                                                                     |
| Note d'information      | Cette tâche requiert exactement 4 documents. Les documents sont numérotés automatiquement selon leur ordre de saisie.                                                                                    |
| Label — Titre (par doc) | Titre du document \*                                                                                                                                                                                     |
| Placeholder — Titre     | ex. : Extrait du Traité de Paris, 1763                                                                                                                                                                   |
| Label — Type            | Type de document \*                                                                                                                                                                                      |
| Option — Texte          | Texte                                                                                                                                                                                                    |
| Option — Iconographique | Iconographique (image JPG ou PNG uniquement)                                                                                                                                                             |
| Label — Source          | Source \*                                                                                                                                                                                                |
| Placeholder — Source    | ex. : Archives nationales du Québec                                                                                                                                                                      |
| Label — Contenu         | Contenu / description historique \*                                                                                                                                                                      |
| Placeholder — Contenu   | Décrivez brièvement le contenu historique du document…                                                                                                                                                   |
| Ordre des champs (UI)   | Après le **titre** : contenu texte **ou** image (et légende), puis **source** et **type de source**.                                                                                                     |
| Repère temporel         | **Aucun champ dédié** — l’élève identifie le repère temporel à partir du document (texte ou image).                                                                                                      |
| Rappel enseignant       | Après la note d’information : **Rappel — séquence et dossier** (`NR_ORDRE_BLOC4_REMINDER_*`) : suite correcte, lettre d’option questionnaire, correspondance chiffres 1–4 ↔ documents (ordre de saisie). |

> **Implémentation :** le générateur **Options A–D** (`SequenceOptionsGenerator`) n’est **pas** à l’étape 3 ; il est à l’**étape 5** (Bloc 5), après la consigne (étape 3) et le dossier documentaire (étape 4).

### Étape 5 — Corrigé / options de réponse (wizard : étape 5 · Bloc 5)

| Élément                    | Copy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label — Options            | Options de réponse \*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Message d'aide — Options   | Saisissez la bonne séquence chronologique (étape 1), puis générez les quatre options. Une seule option doit correspondre à l'ordre chronologique exact.                                                                                                                                                                                                                                                                                                                                                           |
| Étape 1 — Titre            | Étape 1 — Saisir la bonne séquence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Étape 1 — Description      | Entrez l'ordre chronologique correct des 4 documents (chiffres 1 à 4, chacun une fois). L'outil génère trois distracteurs, mélange A–D et identifie la lettre du corrigé.                                                                                                                                                                                                                                                                                                                                         |
| Étape 1 — Saisie           | **Quatre cases** (PIN) : auto-focus vers la case suivante sur chiffre valide ; retour arrière sur case vide ; pas de doublon dans la ligne.                                                                                                                                                                                                                                                                                                                                                                       |
| Étape 1 — Exemple          | Exemple : si le document 3 vient en premier, suivi du 1, du 4 puis du 2, entrez 3 – 1 – 4 – 2.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Bouton — Génération        | **Générer les options A B C D** : tire trois permutations incorrectes **sans remise** parmi les 23 restantes, mélange les quatre suites ; **regénération** possible tant que la séquence est valide ; toute modification des cases après génération **masque** l’étape 2 et vide les options wizard.                                                                                                                                                                                                              |
| Bouton — Reset             | **Saisir une nouvelle séquence** : vide la saisie et les options du wizard.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Étape 2 — Titre            | Étape 2 — Options générées                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Étape 2 — Description      | Les quatre options ont été mélangées aléatoirement ; affichage en **quatre lignes PIN** (lecture seule) avec pastille **Réponse correcte** sur la bonne suite ; encadré **Corrigé — lettre exacte** avec la séquence.                                                                                                                                                                                                                                                                                             |
| Affichage normalisé        | Dans la fiche / Sommaire / publication (vue enseignant, listes d’options) : format unique du type `1 - 2 - 3 - 4` (généré à partir du tuple structuré, pas re-saisi).                                                                                                                                                                                                                                                                                                                                             |
| Feuille élève (impression) | Intro (jetons `{{doc_*}}`) ; **guidage élève** fixe sous l’intro, **avant** la grille d’options (rendu depuis **`tae.guidage`** + ancre dans `consigne`) ; options **A)** à **D)** en **grille 2×2** ; chaque option = quatre **cases chiffrées** ; en bas **Réponse :** (`NR_ORDRE_STUDENT_SHEET_REPONSE_LABEL`) + case lettre — **sans** lignes rédigées ; **`tae.guidage`** publié séparément ; `consigne` contient une ancre commentaire entre intro et grille (`ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR`). |
| Validation                 | Quatre permutations **complètes** et **deux à deux distinctes** ; lettre du corrigé **déduite** à la génération. Garde défensive sur l’unicité des quatre suites (voir implémentation).                                                                                                                                                                                                                                                                                                                           |
| Label — Option A           | Option A                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Label — Option B           | Option B                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Label — Option C           | Option C                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Label — Option D           | Option D                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Corrigé (affichage)        | Récapitulatif automatique après génération (plus de choix manuel A–D à l’étape 5 — Bloc 5).                                                                                                                                                                                                                                                                                                                                                                                                                       |

---

## Parcours 2 — Situer des faits sur une ligne du temps

**Comportement attendu :** Situer des faits sur une ligne du temps (réf. `1.2`).  
**Opération intellectuelle :** Situer dans le temps  
**Type de réponse de l'élève :** Choix d'une lettre (A, B, C ou, si quatre segments, D) désignant le segment temporel correct  
**Nombre de documents :** **exactement 1** document cible — saisi **uniquement** à l'**étape 4**. La **ligne du temps** (segments, dates, rendu de la frise) est configurée à l'**étape 3** avec la consigne ; le **segment corrigé** (lettre A–D) est choisi à l'**étape 5** (`Bloc5LigneDuTemps`), avec proposition automatique à partir de l’année comparable du document (`getAnneePourComparaison`, `ligne-du-temps-helpers.ts`).

> **Principe UX — formulaire = ligne du temps :** les **bornes temporelles** ne sont pas un tableau de champs dissocié d'un aperçu : l'enseignant saisit les **N+1 dates** aux **emplacements des séparateurs** sur la représentation de la frise (inputs individualisés alignés sur l'axe, largeurs de segments **proportionnelles** aux intervalles). Même moteur de rendu pour l'édition, le **Sommaire** (fiche à droite, `mode sommaire`) et l'**aperçu impression** ; le Sommaire peut appliquer une **densité réduite** (échelle / typo) pour tenir dans la colonne d'aperçu du wizard, l'**impression** restant **fidèle** à la feuille élève (frise, dates sous les traits, lettres dans les segments, zone **Réponse :** dans la consigne publiée — pas dans le corrigé enseignant).

> **Généré automatiquement :** libellés d'options (lettres des segments) selon le nombre de segments ; axe et segments à partir des dates ; mise à jour du **Sommaire** et de la fiche.

### Étape 3 — Consigne et production attendue (inclut la ligne du temps)

| Élément                           | Copy                                                                                                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre de l'étape                  | Consigne et production attendue                                                                                                                                                                                     |
| Label — Consigne                  | Consigne \*                                                                                                                                                                                                         |
| Valeur pré-remplie                | Sur la ligne du temps ci-dessous, quelle lettre correspond à la période où se situent les faits présentés dans le document cible ? (Lettres **A, B et C** si trois segments ; **A, B, C et D** si quatre segments.) |
| Message d'aide — Consigne         | Le nombre de lettres proposées à l'élève est aligné sur le **nombre de segments** configuré **dans la ligne du temps** ci-dessous. Respectez la formulation ministérielle pour toute variante imposée.              |
| **Sous-section — Ligne du temps** | _(intégrée à l'étape, au-dessous ou autour de la consigne selon l'implémentation — le formulaire matérialise la frise.)_                                                                                            |
| Label — Segments                  | Nombre de segments \*                                                                                                                                                                                               |
| Option — 3 segments               | 3 segments (A, B, C)                                                                                                                                                                                                |
| Option — 4 segments               | 4 segments (A, B, C, D)                                                                                                                                                                                             |
| Message d'aide — Segments         | Le nombre de segments détermine les lettres à l'élève et les options / corrigé de cette étape.                                                                                                                      |
| Label — Dates de l'axe            | Dates de l'axe \*                                                                                                                                                                                                   |
| Message d'aide — Dates            | Pour _N_ segments, saisir _N_+1 dates **aux bornes** (une date par séparateur d'extrémité et entre segments). Chaque date sert de borne entre deux segments et s'affiche sous le trait correspondant sur la frise.  |
| Placeholder — Date (chaque champ) | ex. : 1760                                                                                                                                                                                                          |
| UI — Saisie                       | Champs **individualisés** positionnés **sous les séparateurs** de la frise (pas seulement une liste verticale sans lien visuel).                                                                                    |
| Représentation — Titre            | Ligne du temps                                                                                                                                                                                                      |
| Représentation — Message          | La frise se met à jour à partir des dates ; les segments ont des largeurs **proportionnelles** aux écarts temporels (règles de repli si valeurs identiques ou très proches — à définir à l'implémentation).         |
| Aperçu Bloc 3                     | Frise **sans** sélection du segment (`LigneDuTempsFrisePicker` `interactive={false}`) — copy `NR_LIGNE_TEMPS_BLOC3_FRISE_PREVIEW_*`.                                                                                |
| Note — Corrigé / lettre           | Le segment correct (lettre) n’est **pas** saisi à l’étape 3 — voir **étape 5** ci-dessous.                                                                                                                          |

### Étape 5 — Corrigé et segment sur la frise (Bloc 5)

| Élément        | Description                                                                                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Composant      | `Bloc5LigneDuTemps` — récapitulatif des segments et bornes ; messages **automatique** / **sans année** / **année hors frise** (`NR_LIGNE_TEMPS_BLOC5_*`) ; **radios** par segment + **frise interactive** (`LigneDuTempsFrisePicker`) ; persistance `correctLetter` dans le payload. |
| Automatisation | `determineSegmentIndexFromYear` + `getAnneePourComparaison` sur le document cible ; convention de segments **[borne, borne suivante)** (à la borne interne, segment de droite).                                                                                                      |

### Étape 4 — Dossier documentaire (document cible seul)

| Élément                 | Copy                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre de l'étape        | Dossier documentaire                                                                                                                                                       |
| Note d'information      | Cette tâche requiert **exactement un** document : le **document cible** que l'élève utilise pour repérer la période sur la ligne du temps configurée à l'étape précédente. |
| Label — Titre           | Titre du document \*                                                                                                                                                       |
| Placeholder — Titre     | ex. : Extrait de la Proclamation royale, 1763                                                                                                                              |
| Label — Type            | Type de document \*                                                                                                                                                        |
| Option — Texte          | Texte                                                                                                                                                                      |
| Option — Iconographique | Iconographique (image JPG ou PNG uniquement)                                                                                                                               |
| Label — Source          | Source \*                                                                                                                                                                  |
| Placeholder — Source    | ex. : Archives nationales du Québec                                                                                                                                        |
| Label — Contenu         | Contenu historique \*                                                                                                                                                      |
| Placeholder — Contenu   | Décrivez brièvement le contenu historique du document…                                                                                                                     |
| Ordre des champs (UI)   | Après le **titre** : contenu texte **ou** image (et légende), puis **source** et **type de source**.                                                                       |
| Note de validation      | Le document cible doit contenir un indice temporel (date, événement, acteur) permettant d'identifier le bon segment sur la ligne du temps.                                 |

**Alignement données (`public/data/oi.json`) :** lorsque le comportement **1.2** sera **sélectionnable** dans le Bloc 2, **`nb_documents`** doit être **1** (un seul slot documentaire à l'étape 4), en cohérence avec ce parcours.

---

## Parcours 3 — Classer des faits (antériorité / postériorité)

**Comportement attendu :** Classer des faits selon qu'ils sont antérieurs ou postérieurs à un repère de temps (réf. `1.3`).  
**Opération intellectuelle :** Situer dans le temps  
**Type de réponse de l'élève :** Choix d'une lettre (A, B, C ou D) pour le tableau AVANT / APRÈS correct  
**Nombre de documents :** 4

> **Généré automatiquement :** numérotation des documents ; **Sommaire** et fiche à droite.

**Implémentation (app) :** slug **`avant-apres`** — `Bloc3AvantApres`, `Bloc4AvantApres`, `Bloc5AvantApres` ; état wizard `bloc5.nonRedaction` = `{ type: 'avant-apres'; payload: AvantApresPayload }` ; persistance **`tae.non_redaction_data`** (JSONB, même union à la publication) via `publish_tae_transaction` / `update_tae_transaction` ; builders HTML `avant-apres-payload.ts` + `publish-tache-payload.ts` ; réhydratation édition `parseNonRedactionData`, `non-redaction-edit-hydrate.ts`, `load-tache-for-edit.ts` ; **repère temporel obligatoire** sur les quatre documents (`lib/tache/behaviours/avant-apres.ts`) ; registre copy **`NR_AVANT_APRES_*`**, toast **`TOAST_TACHE_NR_AVANT_APRES_HYDRATE_INVALID`** ; impression / épreuve : `AvantApresPrintableQuestionnaireCore`. Les parcours **1.1** / **1.2** restent sans JSON colonne (NULL) jusqu’à harmonisation — voir [BACKLOG.md](./BACKLOG.md).

### Étape 3 — Consigne et production attendue

| Élément                 | Copy                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre de l'étape        | Consigne et production attendue                                                                                                                                                                                                                                                                                                                                 |
| Label — Thème           | **Thème ou objet d’étude** (`NR_AVANT_APRES_THEME_LABEL`) \* — badge **Consigne structurée** (`NR_AVANT_APRES_CONSIGNE_MINISTERIAL_BADGE`)                                                                                                                                                                                                                      |
| Message d'aide — Thème  | `NR_AVANT_APRES_THEME_HELP` ; modal d’information : `NR_AVANT_APRES_CONSIGNE_INFO_MODAL_BODY`                                                                                                                                                                                                                                                                   |
| Placeholder — Thème     | `NR_AVANT_APRES_THEME_PLACEHOLDER`                                                                                                                                                                                                                                                                                                                              |
| Intro publiée (épreuve) | Assemblée à la publication à partir du **thème**, du **libellé du repère** et de l’**année ou période du repère** (affichage `AAAA` ou `AAAA–AAAA`) : constantes **`NR_AVANT_APRES_PUBLISHED_INTRO_*`** ; sur la feuille élève : tableau **`NR_AVANT_APRES_STUDENT_SHEET_*`** (colonnes Avant / Après, lettres A–D hors quadrillage du repère — voir maquette). |
| Label — Repère          | **Libellé du repère temporel** (`NR_AVANT_APRES_REPERE_LABEL`) \*                                                                                                                                                                                                                                                                                               |
| Placeholder — Repère    | `NR_AVANT_APRES_REPERE_PLACEHOLDER`                                                                                                                                                                                                                                                                                                                             |
| Message d'aide — Repère | `NR_AVANT_APRES_REPERE_HELP`                                                                                                                                                                                                                                                                                                                                    |
| Label — Année / période | **Année ou période du repère** (`NR_AVANT_APRES_ANNEE_LABEL`) \*                                                                                                                                                                                                                                                                                                |
| Message d'aide — Année  | `NR_AVANT_APRES_ANNEE_HELP`                                                                                                                                                                                                                                                                                                                                     |
| Guidage élève (fixe)    | HTML fixe (`buildAvantApresGuidageHtml`, `NR_AVANT_APRES_STUDENT_GUIDAGE`) ; section **Guidage complémentaire** avec `NR_AVANT_APRES_GUIDAGE_FORM_LEAD` et modal `NR_AVANT_APRES_GUIDAGE_INFO_MODAL_BODY` — aligné sur les autres parcours NR pour l’emplacement dans le wizard.                                                                                |

### Étape 4 — Dossier documentaire

| Élément                 | Copy                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Titre de l'étape        | Dossier documentaire                                                                            |
| Note d'information      | Cette tâche requiert exactement 4 documents, numérotés automatiquement selon l'ordre de saisie. |
| Label — Titre (par doc) | Titre du document \*                                                                            |
| Placeholder — Titre     | ex. : Extrait du rapport Durham, 1839                                                           |
| Label — Type            | Type de document \*                                                                             |
| Option — Texte          | Texte                                                                                           |
| Option — Iconographique | Iconographique (image JPG ou PNG uniquement)                                                    |
| Label — Source          | Source \*                                                                                       |
| Placeholder — Source    | ex. : Bibliothèque et Archives Canada                                                           |
| Label — Contenu         | Contenu / description historique \*                                                             |
| Placeholder — Contenu   | Décrivez brièvement le contenu historique du document…                                          |
| Label — Date            | Date précise des faits \*                                                                       |
| Placeholder — Date      | ex. : 1837                                                                                      |
| Message d'aide — Date   | La date précise est requise pour valider le classement par rapport au repère.                   |
| Erreur — Date manquante | Veuillez indiquer la date précise des faits présentés dans ce document.                         |

> **Implémentation :** les **options A–D** (répartition des numéros de documents **avant** / **après** le repère) et le **corrigé lettre** ne sont **pas** saisis à l’étape 3 ; ils sont produits à l’**étape 5** (`Bloc5AvantApres`), avec **Générer les options A à D** / **Régénérer les distracteurs** (`NR_AVANT_APRES_GENERATE_CTA`, `NR_AVANT_APRES_REGENERATE_CTA`) et, si besoin, la section **Repère sur une année ou une période** (`NR_AVANT_APRES_OVERRIDE_*`). Colonnes du tableau enseignant : **`NR_AVANT_APRES_TABLE_COL_*`**. Détail registre : [UI-COPY.md](./UI-COPY.md).

### Étape 5 — Corrigé et options de réponse (wizard : étape 5 · Bloc 5)

| Élément                            | Copy                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre de section                   | **Corrigé et options de réponse (tableau 4 × 3)** (`NR_AVANT_APRES_BLOC5_TITLE`)                                                                                                                                                                                                                                                                                     |
| Message d'aide                     | `NR_AVANT_APRES_BLOC5_HELP`                                                                                                                                                                                                                                                                                                                                          |
| Bouton — Génération                | **Générer les options A à D** — trois distracteurs, mélange des quatre options, lettre du corrigé et justification auto (`NR_AVANT_APRES_JUSTIFICATION_AUTO`) ; erreurs possibles : années manquantes (`NR_AVANT_APRES_GEN_ERROR_MISSING_YEAR`), égalités non tranchées (`NR_AVANT_APRES_GEN_ERROR_TIE`), partition invalide (`NR_AVANT_APRES_GEN_ERROR_PARTITION`). |
| Bouton — Régénération distracteurs | **Régénérer les distracteurs** — conserve la bonne option, retire les trois autres.                                                                                                                                                                                                                                                                                  |
| Égalités / période                 | Section **Repère sur une année ou une période** (`NR_AVANT_APRES_OVERRIDE_SECTION_*`) : pour chaque document en conflit (année pivot ou **inclusion dans la période** début–fin), choisir **Avant le repère** / **Après le repère** (`NR_AVANT_APRES_OVERRIDE_AVANT` / `NR_AVANT_APRES_OVERRIDE_APRES`).                                                             |
| Corrigé (affichage)                | Récapitulatif après génération (pas de choix manuel A–D isolé — la lettre est **dérivée** de la bonne ligne du tableau).                                                                                                                                                                                                                                             |
| Gates                              | Bloc 3 incomplet : `NR_AVANT_APRES_GATE_BLOC3` ; Bloc 5 avant génération : `NR_AVANT_APRES_GATE_BLOC5`.                                                                                                                                                                                                                                                              |

---

## Parcours 4 — Identifier sur une carte

**Comportement attendu :** Identifier sur une carte (variante visée par le référentiel — ex. `2.1` / `2.2` / `2.3`, _Situer dans l'espace_).  
**Opération intellectuelle :** Situer dans l'espace  
**Type de réponse de l'élève :** Choix d'une ou deux lettres (A, B, C, D) selon le nombre d'éléments géographiques à identifier  
**Nombre de documents :** **Une seule ressource** : l'**image de la carte** (JPG ou PNG), plus métadonnées (source, titre optionnel)

> **Généré automatiquement :** intégration de la carte dans la fiche et le **Sommaire** ; pas de numérotation « document 1, 2… » pour la carte seule.

### Étape 3 — Consigne et production attendue

| Élément                    | Copy                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Titre de l'étape           | Consigne et production attendue                                                                                               |
| Label — Consigne           | Consigne \*                                                                                                                   |
| Valeur pré-remplie         | Consultez la carte ci-dessous. Quelle lettre (A, B, C ou D) correspond :                                                      |
| Message d'aide — Consigne  | Complétez la consigne avec les éléments géographiques à identifier (voir ci-dessous). Respectez la formulation ministérielle. |
| Label — Élément 1          | Élément géographique à identifier (1) \*                                                                                      |
| Placeholder — Élément 1    | ex. : au territoire réservé aux Autochtones après l'Acte de Québec                                                            |
| Label — Élément 2          | Élément géographique à identifier (2)                                                                                         |
| Placeholder — Élément 2    | ex. : aux basses-terres du Saint-Laurent                                                                                      |
| Message d'aide — Élément 2 | Optionnel. S'il est renseigné, la question comportera deux identifications et deux corrigés lettre.                           |
| Label — Corrigé 1          | Corrigé — Lettre pour l'élément 1 \*                                                                                          |
| Label — Corrigé 2          | Corrigé — Lettre pour l'élément 2                                                                                             |
| Options corrigé            | A · B · C · D                                                                                                                 |
| Erreur — Corrigé manquant  | Veuillez indiquer la lettre correspondant à la bonne réponse pour cet élément.                                                |
| Label — Aspects            | Aspects de société                                                                                                            |
| Option — Territorial       | Territorial (obligatoire)                                                                                                     |
| Option — Politique         | Politique                                                                                                                     |
| Option — Économique        | Économique                                                                                                                    |
| Option — Social            | Social                                                                                                                        |

### Étape 4 — Carte historique

| Élément                   | Copy                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre de l'étape          | Carte historique                                                                                                                                              |
| Label — Upload            | Image de la carte \*                                                                                                                                          |
| Bouton — Upload           | Téléverser une image                                                                                                                                          |
| Message d'aide — Upload   | Formats acceptés : **JPG, PNG** uniquement. Taille maximale : 10 Mo. La carte doit afficher clairement les lettres **A, B, C et D** pour les zones à repérer. |
| Note                      | Assurez-vous que les lettres soient bien visibles et lisibles (taille et contraste suffisants).                                                               |
| Label — Titre (optionnel) | Titre de la carte                                                                                                                                             |
| Placeholder — Titre       | ex. : Nouvelle-France, limites en 1713                                                                                                                        |
| Label — Source            | Source de la carte \*                                                                                                                                         |
| Placeholder — Source      | ex. : Service de la cartographie du Québec                                                                                                                    |
| Erreur — Upload manquant  | Veuillez téléverser une image de carte (JPG ou PNG).                                                                                                          |
| Erreur — Source manquante | Veuillez indiquer la source de la carte.                                                                                                                      |

---

## Parcours 5 — Associer des faits à des manifestations

**Comportement attendu :** Associer des faits à des manifestations (ex. `5.1` deux faits, `5.2` quatre faits — _Mettre en relation des faits_).  
**Opération intellectuelle :** Mettre en relation des faits  
**Type de réponse de l'élève :** Association par numéros de documents aux manifestations
**Nombre de documents :** Égal au nombre de manifestations défini à l'étape 3 (2 à 4)

> **Généré automatiquement :** mise à jour de l'énoncé de consigne selon les libellés de manifestations ; numérotation des documents ; **Sommaire** et fiche.

### Étape 3 — Consigne et production attendue

| Élément                         | Copy                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Titre de l'étape                | Consigne et production attendue                                                                                                            |
| Label — Consigne                | Consigne \*                                                                                                                                |
| Valeur pré-remplie              | Indiquez le numéro du document qui correspond à : [Manifestation A] et [Manifestation B]. (Le texte s'ajuste au nombre de manifestations.) |
| Message d'aide — Consigne       | Les espaces entre crochets reflètent les manifestations saisies ci-dessous.                                                                |
| Label — Manifestations          | Manifestations à identifier \*                                                                                                             |
| Message d'aide — Manifestations | Deux à quatre manifestations ; chacune doit se rattacher à un seul document du dossier.                                                    |
| Placeholder — Manifestation     | ex. : Droits des censitaires                                                                                                               |
| Bouton — Ajouter                | + Ajouter une manifestation                                                                                                                |
| Erreur — Minimum                | Définissez au moins deux manifestations.                                                                                                   |
| Erreur — Maximum                | Quatre manifestations au maximum.                                                                                                          |
| Label — Corrigé                 | Corrigé \*                                                                                                                                 |
| Message d'aide — Corrigé        | Pour chaque manifestation, indiquez le numéro du document correspondant.                                                                   |
| Placeholder — Numéro doc        | Numéro du document                                                                                                                         |
| Erreur — Corrigé incomplet      | Associez un document à chaque manifestation.                                                                                               |

### Étape 4 — Dossier documentaire

| Élément                 | Copy                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| Titre de l'étape        | Dossier documentaire                                                                                   |
| Note d'information      | Le nombre de documents doit correspondre au nombre de manifestations (ordre de saisie = numérotation). |
| Label — Titre (par doc) | Titre du document \*                                                                                   |
| Placeholder — Titre     | ex. : Extrait des coutumes de Paris, 1664                                                              |
| Label — Type            | Type de document \*                                                                                    |
| Option — Texte          | Texte                                                                                                  |
| Option — Iconographique | Iconographique (image JPG ou PNG uniquement)                                                           |
| Label — Source          | Source \*                                                                                              |
| Placeholder — Source    | ex. : Archives nationales du Québec                                                                    |
| Label — Contenu         | Contenu historique \*                                                                                  |
| Placeholder — Contenu   | Décrivez brièvement le contenu historique du document…                                                 |
| Note de validation      | Chaque document doit illustrer une seule manifestation, sans ambiguïté pour l'élève.                   |

---

## Parcours 6 — Facteur explicatif et conséquence (numéros de documents)

**Comportement attendu :** Déterminer le facteur explicatif et la conséquence — réponse en numéros de documents (réf. `4.4`).  
**Opération intellectuelle :** Déterminer des causes et des conséquences  
**Type de réponse de l'élève :** Saisie des numéros de documents pour l'élément « cause / facteur » et l'élément « conséquence »  
**Nombre de documents :** Au minimum les deux documents cibles (cause et conséquence) ; dossier cohérent avec la consigne

> **Généré automatiquement :** numérotation du dossier ; **Sommaire** et fiche à droite.

### Étape 3 — Consigne et production attendue

| Élément                   | Copy                                                          |
| ------------------------- | ------------------------------------------------------------- |
| Titre de l'étape          | Consigne et production attendue                               |
| Label — Consigne          | Consigne                                                      |
| Valeur fixe               | Indiquez le numéro du document qui fait référence à :         |
| Note — Consigne           | Formulation fixe alignée sur le libellé ministériel officiel. |
| Label — Élément A         | Élément A — Cause ou facteur explicatif \*                    |
| Placeholder — Élément A   | ex. : une cause de la deuxième guerre intercoloniale          |
| Label — Élément B         | Élément B — Conséquence \*                                    |
| Placeholder — Élément B   | ex. : une conséquence de la deuxième guerre intercoloniale    |
| Label — Corrigé A         | Corrigé — Numéro du document pour l'élément A \*              |
| Placeholder — Corrigé A   | ex. : 3                                                       |
| Label — Corrigé B         | Corrigé — Numéro du document pour l'élément B \*              |
| Placeholder — Corrigé B   | ex. : 7                                                       |
| Erreur — Corrigé manquant | Veuillez indiquer le numéro du document pour cet élément.     |
| Label — Aspects           | Aspects de société                                            |
| Option — Culturel         | Culturel                                                      |
| Option — Économique       | Économique                                                    |
| Option — Politique        | Politique                                                     |
| Option — Social           | Social                                                        |
| Option — Territorial      | Territorial                                                   |

### Étape 4 — Dossier documentaire

| Élément                 | Copy                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Titre de l'étape        | Dossier documentaire                                                                                                         |
| Note d'information      | Le dossier doit contenir au minimum un document pour la cause et un pour la conséquence, comme défini à l'étape précédente.  |
| Label — Titre (par doc) | Titre du document \*                                                                                                         |
| Placeholder — Titre     | ex. : Extrait du Traité d'Utrecht, 1713                                                                                      |
| Label — Type            | Type de document \*                                                                                                          |
| Option — Texte          | Texte                                                                                                                        |
| Option — Iconographique | Iconographique (image JPG ou PNG uniquement)                                                                                 |
| Label — Source          | Source \*                                                                                                                    |
| Placeholder — Source    | ex. : Bibliothèque et Archives Canada                                                                                        |
| Label — Contenu         | Contenu historique \*                                                                                                        |
| Placeholder — Contenu   | Décrivez brièvement le contenu historique du document…                                                                       |
| Note de validation      | Chaque document cible illustre soit un facteur explicatif, soit une conséquence — pas les deux à la fois de manière confuse. |

---

## Règles transversales à implémenter

| Règle               | Détail                                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fichiers téléversés | **Images uniquement (JPG, PNG). Aucun PDF** pour les documents iconographiques et les cartes. Taille max. 10 Mo.                                         |
| Libellés fixes      | Les consignes pré-remplies respectent les formulations ministérielles ; l'enseignant ne modifie que les zones entre crochets lorsque la spec le prévoit. |
| Champs obligatoires | Marqués `*` — publication bloquée tant qu'ils sont vides.                                                                                                |
| Nombre de documents | **Imposé par le comportement attendu**, non modifiable par l'enseignant.                                                                                 |
| Numérotation        | Les documents du dossier (hors carte seule, parcours 4) sont numérotés automatiquement selon l'ordre de saisie à l'étape dossier.                        |
| Brouillon           | Sauvegarde possible à tout moment, formulaire incomplet accepté.                                                                                         |
| Sommaire et fiche   | Le **Sommaire** et la fiche type évaluation à droite (grand écran) se mettent à jour en temps réel.                                                      |
| Navigation          | Navigation libre entre les étapes.                                                                                                                       |
| Publication         | Bloquée tant que les champs obligatoires ne sont pas remplis. Message : _Veuillez compléter tous les champs obligatoires avant de publier cette tâche._  |

---

## Référence produit et données

- Référentiel des opérations et comportements : `public/data/oi.json` — les références `1.1`, `4.4`, etc. sont indicatives ; l'implémentation suit les ids réels du fichier.
- Parcours rédactionnel existant : inchangé ; branchement uniquement sur les comportements non rédactionnels lorsqu'ils seront activés côté produit.

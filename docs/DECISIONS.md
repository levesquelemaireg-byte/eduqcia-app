# Décisions produit et techniques

Normes, protocoles, justifications d’icônes et mapping données — complètent [README.md](./README.md).

**Textes visibles (libellés, CTA, messages) :** registre **[UI-COPY.md](./UI-COPY.md)** ; en pratique souvent centralisés dans `lib/ui/ui-copy.ts` et fichiers dédiés (`wizard-print-preview-copy.ts`, etc.). Ne pas inventer de chaînes : suspendre et demander au **développeur** (référent) si une entrée manque.

Anciennement un document unique mêlant règles et copy (`protocol.md`, `UI-COPY-REFERENCE.md`, `ICON-JUSTIFICATIONS.md`, `UI-REDESIGN-PROTOCOL.md`).

## Hiérarchie

En cas de conflit : **métier** — ce fichier et [FEATURES.md](./FEATURES.md) ; **technique** — [ARCHITECTURE.md](./ARCHITECTURE.md) ; **texte affiché** — [UI-COPY.md](./UI-COPY.md).

**Module documents historiques** (navbar, banque, cadre légal Québec) : périmètre produit et mapping ci-dessous ; copy détaillée dans [UI-COPY.md](./UI-COPY.md) § Module ; document de travail [module-dcuments-historiques.md](./module-dcuments-historiques.md) à tenir **synchrone** avec ces deux fichiers. SQL et RPC : [ARCHITECTURE.md](./ARCHITECTURE.md), `supabase/schema.sql`.

## Référentiels `public/data/*.json` (immuables)

Les **fichiers JSON actuels** sous **`public/data/`** sur lesquels **l’application est fondée** sont des **référentiels immuables** : **ne pas les modifier** dans le flux de développement courant, **sauf si c’est absolument nécessaire** (ex. correction bloquante, alignement officiel **tracé** en doc, migration coordonnée schéma + code + données).

**Périmètre indicatif (fondations actuelles) :** `oi.json`, `grilles-evaluation.json`, `hec-cd.json`, `hec-sec1-2.json`, `hqc-cd.json`, `hqc-sec3-4.json`, `css.json`, `css-ecoles.json`.

**Hors ce périmètre immuable** (enrichissement sans impacter l’app tant qu’aucune route ne les charge) : **`import-tae-notebooklm-bundle.json`** — prompts / garde-fous outils externes ; voir [ARCHITECTURE.md](./ARCHITECTURE.md) (`public/data/`).

## Fragments métier (nommage code)

Convention de nommage fragments (`*Fragment` / `*App` / `*Print`) : **dépréciée**, jamais appliquée en production — archivée dans [archive/CONVENTIONS-FRAGMENTS.md](./archive/CONVENTIONS-FRAGMENTS.md). Référentiel actuel pour les composants d'impression : **[specs/print-engine.md](./specs/print-engine.md)** (section 5). Le playground DEV : [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md).

## Terminologie UI — pas d’acronymes interdits

| Interdit                                                       | Officiel                                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| OI                                                             | Opération intellectuelle                                                                                            |
| TAÉ                                                            | Tâche d’apprentissage et d’évaluation                                                                               |
| CD                                                             | Compétence disciplinaire                                                                                            |
| HEC / HQC                                                      | Formes longues (Histoire et éducation à la citoyenneté ; Histoire du Québec et du Canada)                           |
| Preview / Aperçu (UI formulaire)                               | Sommaire                                                                                                            |
| Sous-opération                                                 | Comportement attendu                                                                                                |
| « Nombre de lignes » comme **titre de section** seul au Bloc 2 | **Espace de production** (le nombre de lignes est une **valeur** affichée dans cette section, lue depuis `oi.json`) |
| Bibliothèque / Répertoire                                      | Banque collaborative                                                                                                |
| 5 blocs                                                        | 7 étapes                                                                                                            |

## Terminologie code (types, fichiers, dossiers, tables SQL)

Tout **nouveau** code (types, fichiers, dossiers, variables) doit utiliser `tache` / `Tache` (français). Le préfixe `tae` / `Tae` est **interdit dans les nouveaux fichiers** — il reste un héritage technique de la phase alpha.

Le code existant (`lib/tae/`, `TaeCard`, `TaeFicheData`, tables SQL `tae`, `tae_collaborateurs`, RPCs `publish_tae_transaction`, etc.) est **grandfathered** : il n'est pas renommé sauf migration progressive planifiée (voir backlog technique dans [BACKLOG.md](./BACKLOG.md#backlog-technique-détaillé)).

**Exception print-engine** : la spec `docs/specs/print-engine.md` introduit dès le lot D0 les types `DonneesTache` et `etatWizardVersTache` dans `lib/tache/contrats/` — premier jalon de la migration vocabulaire.

## Genre et accord du label rôle

La colonne `profiles.genre` (`homme`/`femme`, nullable) conditionne **uniquement** l'accord du label rôle affiché sous le nom (profil hero, cartes collaborateurs). Le helper `getRoleLabel(role, genre)` (`lib/utils/role-label.ts`) produit : Enseignant/Enseignante, Conseiller/Conseillère pédagogique, Administrateur/Administratrice. **Masculin par défaut** quand le genre n'est pas renseigné. Pas de féminisation globale de l'app — seul ce label est conditionné. Le genre n'est pas demandé à l'inscription ; il se renseigne via le Side Sheet profil (section Identité).

## Épreuve (composition enseignant) — terminologie publique

En **copy interface** et **textes publics** ([FAQ.md](./FAQ.md)), l’entité qui regroupe plusieurs TAÉ pour une passation en classe s’appelle **épreuve** (« Mes épreuves », « Créer une épreuve », etc.).

- **Tables SQL, RPC et routes Next.js** conservent les noms techniques `evaluations`, `evaluation_tae`, `/evaluations/...`, `save_evaluation_composition` — [ARCHITECTURE.md](./ARCHITECTURE.md).
- **Ne pas confondre avec** (conserver « évaluation » ou la forme longue) : **tâche d’apprentissage et d’évaluation** (TAÉ) ; **outil d’évaluation** / **grille d’évaluation** (barème ministériel) ; **évaluation formative** / **évaluation sommatif** ; **évaluation par les pairs** ; et, en didactique générale, l’**évaluation** des apprentissages lorsqu’il ne s’agit pas de l’entité composition enseignant.

## Règles absolues (code)

- `'use client'` seulement si nécessaire.
- **Grilles ministérielles (barème HTML) :** critères A/B/C et navigateur de référence — [ARCHITECTURE.md](./ARCHITECTURE.md#grilles-dévaluation-ministérielles-barème-en-html) ; pas de paraphrase des textes dans les cellules.
- Pas de couleur en dur — tokens Tailwind / CSS du projet.
- Icônes : Material Symbols Outlined ; pas d’icône devant le **titre d’étape** du wizard — glyphes pour **libellés de champs** (voir [UI-COPY.md](./UI-COPY.md) conventions liées et [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)).
- **Cohérence d’icône doc / tâche (règle absolue)** : toute métadonnée partagée entre un document et une tâche utilise **la même icône partout** (rail, header, sommaire, miniature, etc.). Niveau = `school`, Discipline = `menu_book`, Aspects de société = `deployed_code`, Auteur = `person`, Date création = `calendar_today`, Date mise à jour = `history`, Utilisation = `link`, Connaissances = `lightbulb`, Ancrage temporel = `anchor`. Tableau complet : `docs/specs/SPEC-SOMMAIRE-DOCUMENT.md §5`.
- TypeScript strict — pas de `any`.
- Pas d’appel Supabase depuis un Client Component.

## Structure du wizard création TAÉ (rappel)

Sept étapes, ordre immuable : (1) Auteur(s), (2) Paramètres, (3) Consigne et guidage complémentaire, (4) Documents historiques, (5) Corrigé et options, (6) Compétence disciplinaire, (7) Connaissances relatives. Détail : [WORKFLOWS.md](./WORKFLOWS.md).

## Données JSON (`/data/*.json` et référentiels)

Énoncés pédagogiques officiels : **intouchables** sans validation explicite (pas de reformulation, traduction, correction de ponctuation, etc.). Toute évolution : fichiers source + [UI-COPY.md](./UI-COPY.md) si une chaîne d’interface en dépend.

## Placeholders pour copy dynamique

Reproduire exactement : `{{user_name}}`, `{{date}}`, `{{discipline}}`, `{{niveau}}`, `{{oi}}`, `{{comportement}}`.

## Règles de modification de la copy (agents / outils)

- Unités atomiques : ne pas fusionner, découper ou réécrire partiellement une entrée du registre sans validation.
- Copy non listée dans [UI-COPY.md](./UI-COPY.md) : suspendre, ne pas inventer, demander le texte exact au **développeur**, puis ajouter au registre avant intégration.

## Checklist avant feature

- Spec lue : ce fichier, [FEATURES.md](./FEATURES.md) / [WORKFLOWS.md](./WORKFLOWS.md) selon le cas.
- [BACKLOG.md](./BACKLOG.md) — anti-dette avant gros refactors.
- Textes dans [UI-COPY.md](./UI-COPY.md) ; schéma compatible [ARCHITECTURE.md](./ARCHITECTURE.md) ; Server Actions / queries / composants `ui/` identifiés.

## Checklist avant livraison

- `npm run build`, `npm run format:check`, `npm run lint` (0 erreur) ; idéalement `npm run ci`.
- Pas de `console.log` de debug, pas de `any`, pas de texte/couleur inventés.
- Formulaires : [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md#formulaires).
- Doc de pilotage : [BACKLOG.md](./BACKLOG.md#documentation-et-traçabilité).

## Protocole de maintenance documentaire

| Après quoi ?                    | Mettre à jour                                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Feature utilisateur visible     | [BACKLOG.md](./BACKLOG.md) (produit abouti, §2 / §4) ; [BACKLOG-HISTORY.md](./BACKLOG-HISTORY.md) (ligne en tête si chronologie) |
| Ticket backlog technique        | [BACKLOG.md](./BACKLOG.md) (section backlog)                                                                                     |
| Env, CI, RLS, schéma            | [ARCHITECTURE.md](./ARCHITECTURE.md), [BACKLOG.md](./BACKLOG.md) si besoin                                                       |
| Nouvelle convention dossiers    | [ARCHITECTURE.md](./ARCHITECTURE.md)                                                                                             |
| Copy ou UI documentée           | [UI-COPY.md](./UI-COPY.md) + [WORKFLOWS.md](./WORKFLOWS.md) si écrans wizard                                                     |
| Règle produit / icône / mapping | Ce fichier ([DECISIONS.md](./DECISIONS.md))                                                                                      |

## Protocole bug

Reproduire → isoler la couche → corriger la cause → retirer les logs temporaires → noter dans [BACKLOG.md](./BACKLOG.md) si utile → `npm run build`.

## Priorité features (rappel métier)

Ordre de référence : auth et layout → wizard / fiche → édition → banque → votes / commentaires → épreuves complètes (composition) → export PDF. Nuancer avec [BACKLOG.md](./BACKLOG.md) (paliers techniques A–E).

## Justifications des icônes Material

Textes d’infobulle : `lib/tae/icon-justifications.ts` (`MATERIAL_ICON_TOOLTIP`) — **à synchroniser** avec cette section.

### Labels et champs

- **`quiz`** — Consigne : question posée à l’élève.
- **`deployed_code`** — Aspects de société : perspectives sur une réalité sociale.
- **`task_alt`** — Corrigé : production attendue validée.
- **`list_alt_check`** — Options de réponse (liste de propositions, bonne réponse) — stepper étape 5 avec `task_alt`.
- **`tooltip_2`** — Guidage : aide contextuelle.
- **`license`** — Compétence disciplinaire : validation officielle programme.
- **`lightbulb`** — Connaissances relatives : savoirs à mobiliser.
- **`article`** — Documents historiques : sources.
- **`school`** — Niveau scolaire.
- **`menu_book`** — Discipline.
- **`psychology`** — Opération intellectuelle (label).
- **`format_line_spacing`** — Nombre de lignes (pas `format_list_numbered`).

### Sélecteur OI (Bloc 2)

- **`cognition`** — Générique OI.
- **`document_search`** — Établir des faits.
- **`hourglass`** — Situer dans le temps.
- **`map_search`** — Situer dans l’espace.
- **`text_compare`** — Différences et similitudes.
- **`manufacturing`** — Causes et conséquences.
- **`graph_3`** — Mettre en relation.
- **`alt_route`** — Changements et continuités. **Présentation :** rotation **90°** (flèches vers la droite) — globale via `MaterialSymbolOiGlyph` + `app/globals.css` ; pas de duplication par écran ([DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) §1.4, glyphes OI).
- **`list`** — Liens de causalité.

### Fiche lecture et vignette liste (`TaeCard`)

- **Pastille** avec le libellé d’opération intellectuelle (`MetaPill`) : glyphe **`psychology`** pour **toutes** les OI (repère de **catégorie**).
- **Grand glyphe** en marge de la section consigne sur la fiche, et **icône à gauche** sur la carte miniature : glyphe **spécifique** à l’OI (`tae.oi.icone`, aligné sur `public/data/oi.json` côté serveur lorsque applicable) — **distinct** de la pastille.
- Le **sélecteur OI** (Bloc 2) conserve les glyphes **par entrée** (tableau « Mapping glyphes — Bloc 2 » ci-dessous).

### Autres (stepper et blocs)

- **`table`** — Comportement attendu / grille.
- **`image`** — Document iconographique.
- **`shuffle`** — Wizard TAÉ parcours **ordre chronologique** (1.1) : bouton qui génère trois suites incorrectes et mélange les quatre options A–D (`Bloc3OrdreChronologique`).
- **`reorder`** — Encadré rappel Bloc 4 **ordre chronologique** : suite chronologique retenue et lien chiffres 1–4 ↔ documents du dossier (`OrdreChronologiqueBloc4SequenceReminder`).
- **`settings`** — Valeur **générée automatiquement** par l’application (numérotation des documents, calculs, jetons système). Affichage **décoratif inline** : glyphe `1em`, `text-muted`, à côté de la valeur concernée, avec `title` / infobulle expliquant ce qui est généré. **Ne pas** utiliser pour des paramètres ou réglages utilisateur — réserver strictement aux valeurs auto-générées (ex. jeton « Doc 1–4 » du template de consigne non rédactionnelle).
- **`person` / `groups`** — Bloc 1 conception seul / équipe.

### Navigation — création (documents historiques)

- **`add_notes`** — Entrée barre latérale (section création) et pastille 1 du wizard **`/documents/new`** — libellés dans [UI-COPY.md](./UI-COPY.md).

### Documentation légale

- **`gavel`** — **Seul** glyphe pour toute **documentation légale** en interface (avertissements droit d’auteur, cadre Copibec, confirmations, encadrés cadre légal, etc.). **Ne pas** substituer `license`, `policy`, autre variante de `gavel` ou autre pictogramme sans décision du **développeur**. Présentation : **`material-symbols-outlined`**, **`1em`**, **`.icon-text`** / **`text-accent`**, **`--icon-gap-em`** — composant **`LegalNoticeIcon`**. Chaînes UI : [UI-COPY.md](./UI-COPY.md) Module ; infobulles : `lib/tae/icon-justifications.ts` (`LEGAL_NOTICE_MATERIAL_ICON`, `MATERIAL_ICON_TOOLTIP.gavel`).

### Justifications — position de la légende

- **Coin haut gauche** — Pas de glyphe Material **`position_top_left`** dans Symbols Outlined : afficher **`position_top_right`** en **symétrie horizontale** (ex. `transform: scaleX(-1)` ou utilitaire Tailwind `scale-x-[-1]` sur le nœud du glyphe). **Accessibilité :** libellé / `aria-label` explicite « coin haut gauche » (ou équivalent [UI-COPY.md](./UI-COPY.md)).
- **`position_top_right`** — Coin supérieur droit de l’image (rendu normal, sans miroir).
- **`position_bottom_left`** — Coin inférieur gauche de l’image.
- **`position_bottom_right`** — Coin inférieur droit de l’image.

Tableau visuel condensé : [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md).

## Mapping glyphes — Bloc 2 (libellés de champs)

Référence d’implémentation : nom de glyphe = contenu dans `<span class="material-symbols-outlined">…</span>` ([DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) §1.4). Pas d’autre jeu d’icônes.

| Libellé (champ)          | Glyphe                | Remarque                                                                                                                         |
| ------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Niveau scolaire          | `school`              | Repère « niveau » / formation                                                                                                    |
| Discipline               | `menu_book`           | Livre / programme                                                                                                                |
| Opération intellectuelle | `psychology`          | Repère cognitif (maquette type « cerveau »)                                                                                      |
| Comportement attendu     | `table`               | Grille / comportements                                                                                                           |
| Espace de production     | `format_line_spacing` | Interligne / espace de rédaction — aligné `DESIGN-SYSTEM.md` §1.4 (pas `format_list_numbered`) ; valeur **non** saisie au wizard |

> **Stepper** (pictogrammes sous les pastilles uniquement) : les **mêmes** glyphes que le tableau ci-dessus (`bloc2-stepper-icons.ts`, importé par `step-meta.ts`) — pas de jeu d’icônes parallèle. Voir **[WORKFLOWS.md](./WORKFLOWS.md#tae-stepper)**.
> | Bouton info (ligne de label) | `info` | Même pattern que les autres blocs |
> | CTA « Voir la grille de correction » | `table_eye` | Déjà prévu §CTA |

## Protocole refonte UI (layout uniquement)

**Source visuelle :** maquette validée par le **développeur**. **Objectif :** changer la présentation **sans** modifier comportement, données ni copy non validée.

- [UI-COPY.md](./UI-COPY.md) et le **développeur** priment si la maquette introduit du texte non validé.
- Tokens : [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) ; formulaires : [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md#formulaires).

**Autorisé :** wrappers layout-only, classes Tailwind / tokens, petits ajustements `aria-*` sans changer le comportement.

**Interdit (sans accord du développeur) :** logique, state métier, `data-*` utilisés par le script, copy du registre, styles inline arbitraires, nouvelles icônes hors Material Symbols Outlined.

**Workflow :** préparation maquette → analyse Server vs Client → markup → styling → QA états (hover, focus, erreur, vide, chargement) → non-régression → validation **développeur**.

## Référence historique — routes WordPress

L’application **Next.js** n’expose pas les routes REST `eduqc/v1/*` ni les templates PHP listés dans l’ancien `ROUTES.md`. Pour l’app actuelle : [ARCHITECTURE.md](./ARCHITECTURE.md#routes-app-router).

## Conventions rédactionnelles (pour le registre UI-COPY)

- Pas de point final dans les titres, labels, CTA ; phrases complètes (hints, descriptions) avec point final ; pas de point d’exclamation ni de points de suspension.
- Sentence case partout ; pas de Titre Capitalisé ni majuscules décoratives.
- **Obligation (requis) :** les entrées **copy** des libellés restent **sans** astérisque dans le texte du libellé ; en UI : composant **`RequiredMark`** — glyphe `*` en **rouge** (`text-error` / `--color-error`). Voir [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) §1.1.2 et [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md#formulaires).
- **Wizard Créer une TAÉ :** jamais d’icône Material (ni autre pictogramme) **avant le titre de l’étape** (`<h2>` principal) ; les glyphes du mapping / tableaux s’appliquent aux **libellés de champs** et actions liées — pas au titre d’étape ni au sous-titre d’intro. Le **stepper** (pastilles numérotées + pictogrammes sous le numéro) est distinct. Alignement, taille, espacement : [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) §1.4.

## Validation (wizard TAÉ)

- Pas de bannière globale du type « Il manque ».
- Erreurs au niveau des champs et de l’étape concernée.

## Stepper visuel (TAÉ)

- Pastilles numérotées **1** à **6** ; **aucun** libellé texte dans la rangée du stepper (chiffres et glyphes uniquement). Contexte pédagogique : intro sous le titre d’étape dans la carte.
- Intégration Next.js : stepper en **bandeau** du panneau formulaire, séparé du titre par un filet — [WORKFLOWS.md](./WORKFLOWS.md#tae-stepper).
- **Segments** entre pastilles : **vert** (`success`) si l’étape **à gauche** est complétée ; **gris** sinon.
- **Étape complétée :** cercle **vert** (`bg-success`), **check** blanc ; glyphes du bloc en **vert** (`text-success`).
- **Étape en cours :** cercle **accent**, chiffre blanc, **ring** ; glyphes en **accent**.
- **Étape à venir :** cercle `border-border bg-surface`, numéro **muted** ; glyphes **muted** ; pastille **non cliquable**.
- Cercles **40×40px** ; glyphes **18px**, `gap-1` ; source des noms de glyphes : `bloc1-stepper-icons.ts`, `bloc2-stepper-icons.ts`, `bloc3-stepper-icons.ts`, `tae-future-step-icons.ts`, agrégés dans **`step-meta.ts`**.

## Impression (aperçu et fiche imprimable)

- **`@page`** : format **Letter portrait**, **marges 2 cm** sur chaque côté — `PrintPreviewModal` / `lib/tae/print-page-css.ts` (`TAE_PRINT_PAGE_MARGIN`, aligné sur **`--tae-print-sheet-padding`**, retirées à la fermeture de la modale). En **`@media print`**, **`#tae-wizard-printable-fiche`** : **`padding: 0`**, **`width: 100%`** de la zone utile (`app/globals.css`). **Aperçu écran** : feuille **`.paper`** avec **`padding` 2 cm** via **`--tae-print-sheet-padding`**. Masquer tout l’**`AppShell`** à l’impression pour ne laisser que la feuille.
- **En-têtes et pieds du navigateur** (date, URL, pagination) : réglage de la boîte d’impression ; texte d’aide utilisateur dans [UI-COPY.md](./UI-COPY.md). Route **`/questions/[id]/print`** : même logique (`TaePrintRouteShell`, `TaeFichePrintView`).
- **Pagination :** chaque carte **document** — `break-inside: avoid` / `page-break-inside: avoid` sur `.documentCell` (`printable-fiche-preview.module.css`). Bloc **consigne + guidage + espace de réponse + grille** dans **`.postDocumentsPrintGroup`** : en print, **`break-inside: avoid`** — si l’ensemble ne tient pas dans l’espace restant sous la grille documents, le moteur envoie **tout** le bloc à la **page suivante** lorsque c’est évitable. Si le bloc dépasse une page Letter, fragmentation possible selon le navigateur.
- **Feuillets (aperçu wizard TAÉ et route `/questions/[id]/print`) :** deux **feuillets** distincts — **Dossier documentaire** (documents seuls) et **Questionnaire** (consigne, guidage si champ séparé, espace de réponse, grille). À l’**écran**, bascule par onglets (`TaePrintFeuilletToggle`, copy alignée sur l’épreuve : `EVAL_PRINT_SECTION_COPY`) ; à l’**impression**, les deux feuillets s’enchaînent avec **saut de page** après le dossier (`printable-fiche-preview.module.css`, `PrintableFicheFromTaeData`).
- **Barre d'aperçu wizard (`PreviewPanel`) :** navigation primaire unique en haut (style top-nav) avec **Sommaire détaillé** et **Aperçu de l'imprimé**. Dans le wizard tâche, l’aperçu affiche ensuite les variantes **Formatif / Sommatif standard / Corrigé** ; le sélecteur de feuillet (**Questionnaire / Dossier documentaire**) n'apparaît que pour **Sommatif standard**. Dans le wizard document, aucun sélecteur secondaire.
- **Persistance URL de l'aperçu wizard :** paramètres `vue` (`sommaire` ou `apercu`), `mode` (`formatif`, `sommatif-standard`, `corrige`) et `feuillet` (`questionnaire`, `dossier`) synchronisés en lecture/écriture pour restaurer l'état de navigation au rechargement.
- **Mobile (`< md`) :** les variantes secondaires sont regroupées dans une feuille basse **Options** ouverte/fermée par un bouton `tune` (pas de glisser-déposer requis en V1).
- **Style actif desktop (V1) :** état actif neutre (fond gris clair) sans accent coloré sur le remplissage ; accent réservé au focus clavier.
- **Ordre chronologique (1.1) — feuille élève :** le HTML publié en **`tae.consigne`** contient l’intro, une **ancre** commentaire HTML (`ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR` dans `ordre-chronologique-payload.ts`), puis la grille A–D et la zone **Réponse :** — **sans** le texte de guidage dans la consigne. Le guidage élève fixe est en **`tae.guidage`** (`buildOrdreChronologiqueGuidageHtml`). **FicheTache / sommaire enseignant :** la consigne affichée retire l’ancre et le bloc **Réponse :** réservé à la feuille élève (`prepareOrdreChronologiqueConsigneForTeacherDisplay`) ; **SectionGuidage** affiche `tae.guidage` comme les parcours rédactionnels. **Impression élève** (aperçu TAÉ, `/questions/[id]/print`, épreuve) : composition **intro → guidage (si `shouldShowGuidageOnStudentSheet`) → options → réponse** via `parseOrdreChronologiqueConsigneForStudentPrint` + `OrdreChronologiquePrintableQuestionnaireCore` — base pour masquer le guidage en sommatif sans parser tout le HTML de consigne. **`parseOrdreChronologiqueConsigneForStudentPrint`** renvoie **deux** fragments HTML **complets** (chacun : racine `data-ordre-chrono-student` ouverte puis fermée) pour que chaque injection **`PrintableHtml`** garde un ancêtre **`[data-ordre-chrono-student="true"]`** et que **`app/globals.css`** (grille 2×2, cases chiffres, **Réponse :**) s’applique. Le guidage injecté est enveloppé du même attribut pour **`.ordre-chrono-student-guidage`**.
- **Ordre du contenu imprimé** (sans titres de section visibles pour l’utilisateur ; structure accessibilité via `aria-label` — libellés dans [UI-COPY.md](./UI-COPY.md) / `PRINTABLE_FICHE_SECTION_COPY`) — **par feuillet questionnaire** (après le feuillet dossier) :
  1. **Consigne** (contenu seul ; ordre chrono : intro + options + réponse dans le HTML consigne, le guidage étant injecté au bon rang par le composant d’impression quand il est affiché).
  2. **Guidage complémentaire** — lorsqu’il existe en champ séparé (`tae.guidage`) **et** n’est pas déjà composé dans le flux ordre chrono ci-dessus : après la consigne ; corps en **italique** (sans titre de section visible). Pour l’ordre chronologique, le guidage est géré par le même flux que l’intro (pas de section guidage dupliquée).
  3. **Espace de réponse** — lignes horizontales uniquement lorsque le parcours les prévoit ; pas de libellé visible du nombre de lignes ; `aria-label` inclut le nombre de lignes.
  4. **Grille de correction** — même source que le Bloc 2 ; si absence de données : messages alignés sur la modale **Outil d’évaluation** ([UI-COPY.md](./UI-COPY.md)).
- **Feuillet dossier :** grille **documents** — **2 colonnes** ; **document iconographique** : **`.documentCell`** en **`width: max-content`**, **`max-width: 100%`**, **`justify-self: start`**, **`align-items: flex-start`** — la **bordure extérieure** de la carte épouse la largeur du bloc (image, en-tête, source), pas toute la colonne ; **exclut** **`.documentCellFull`** (heuristique texte dense pleine largeur). **Textuel** : carte occupe la piste grille comme avant. Une ligne : « Document » + lettre + `-` + titre ; saut de ligne ; contenu ; saut de ligne ; **« Source : »** et la **citation sur la même ligne** (retour à la ligne seulement si manque de place — flex + citation TipTap en `inline`) ; **8pt** (couleur atténuée) ; espacements compacts (`printable-fiche-preview.module.css`). **`.documentFigure`** en **`inline-block`** : cadre fin collé au bitmap ; **`--tae-print-document-figure-max-height`** et **`--tae-doc-print-figure-scale`** sur le **`max-height`** de l’`<img>` ; pas de `transform: scale()` comme effet principal. **Légende sur l’image** (`DocumentImageLegendOverlay`) : rectangle, **fond blanc semi-transparent**, **filet noir à gauche**. **Contours** de la **carte document** (**`.documentCell`**, 1 pt) et du **cadre image** (**`.documentFigure`**, 1 px) : **`#000`** (aperçu = impression, aligné barèmes) — [WORKFLOWS.md](./WORKFLOWS.md).
- **Modes d’impression** (formatif, sommatif, corrigé, épreuve) : piste produit — [FEATURES.md](./FEATURES.md) §10.5, [BACKLOG.md](./BACKLOG.md), [WORKFLOWS.md](./WORKFLOWS.md). **Copy UI définitive** : à inscrire dans [UI-COPY.md](./UI-COPY.md) après validation.

## Brouillons wizard « Créer une TAÉ » (comportement)

- **Une ligne serveur par enseignant** (`tae_wizard_drafts.user_id` unique) : un nouvel enregistrement « Sauvegarder le brouillon » remplace le précédent. **Évolution possible** : lever `UNIQUE (user_id)`, identifiant par brouillon, liste dans **Mes tâches** — migration SQL + UI.
- **Ouverture de la page Créer :** formulaire **vide** (pas de rechargement automatique du brouillon serveur ni du `sessionStorage`).
- **Bannières** sous le sous-titre de page : si **brouillon serveur** — reprendre / masquer pour cette visite ; si **navigateur** contient une reprise locale — reprendre / ignorer le brouillon local ; éviter deux bandeaux simultanés. Textes : [UI-COPY.md](./UI-COPY.md).

## Module documents historiques — périmètre, données, intégration

### Objectif

Créer, indexer et réutiliser des **documents historiques structurés** ; intégration aux tâches et évaluations ; accès **navbar** et **banque collaborative**.

### Comportement (hors verbatim UI)

- Champs principaux : titre ; type texte ou image ; contenu selon type ; image + **légende** (optionnelle, max **50 mots**, validation application) + **position** si légende non vide — [FEATURES.md](./FEATURES.md) §5.6.
- **Source :** saisie enrichie (TipTap), persistance **HTML** ; citations historiques sans balises restent valides (affichage échappé).
- **Type de source :** `primaire` ou `secondaire`, obligatoire à la soumission ; défaut SQL `secondaire` pour données historiques tant que le payload n’envoie pas la valeur.
- **Après création réussie (parcours autonome) :** redirection vers la **fiche lecture** du document (décision mars 2026).
- **Compteur d’usages « X tâches » :** [FEATURES.md](./FEATURES.md) §5.4 (`COUNT(DISTINCT tae_id)`, TAÉ publiées).
- **Réutilisation (document iconographique) :** afficher l’échelle d’impression en lecture seule (ligne informative — formulation dans [UI-COPY.md](./UI-COPY.md)).
- **Réglage échelle à l’impression :** variable CSS **`--tae-doc-print-figure-scale`** et `calc()` sur **`--tae-print-document-figure-max-height`** appliqué au **`max-height`** de l’`<img>` (fiche / aperçu) ; éviter `transform: scale()` comme effet principal pour la netteté (légendes, PDF).
- **Indexation :** discipline (filtrée par niveau), niveau, connaissances (colonnes Miller alignées étape 6 TAÉ), aspects de société.
- **Wizard « Créer un document » :** titres d’étape et absence de paragraphe sous certains titres — [UI-COPY.md](./UI-COPY.md) ; détail technique [WORKFLOWS.md](./WORKFLOWS.md).
- **Toast dégradé** si colonnes absentes (`image_legende`, etc.) : constante `TOAST_DOCUMENT_CREATE_DEGRADED` — [UI-COPY.md](./UI-COPY.md) ; migrations [ARCHITECTURE.md](./ARCHITECTURE.md).

### Banque (module)

Centralise tâches, documents historiques, évaluations ; recherche / filtres / aperçu — copy [UI-COPY.md](./UI-COPY.md) § Banque et § Module.

### Icône navbar (création document)

Glyphe **Material Symbols Outlined** **`add_notes`** — [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md).

### Données — mapping ÉduQc.IA (registre)

Le pseudo-code TypeScript de [module-dcuments-historiques.md](./module-dcuments-historiques.md) § 5 **n’est pas normatif** pour les noms SQL ; le tableau ci-dessous l’est pour ce dépôt.

| Concept (module)                                              | Réalisation dans le dépôt                                                                                                                                                                      |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                                                       | `documents.titre`                                                                                                                                                                              |
| `type` (texte / image)                                        | `documents.type` : `textuel` / `iconographique` (`doc_type`)                                                                                                                                   |
| `content`                                                     | `documents.contenu` (textuel) ou média via `documents.image_url` et flux Storage — [ARCHITECTURE.md](./ARCHITECTURE.md)                                                                        |
| `caption` / légende (optionnel, image)                        | `documents.image_legende` ; position : `documents.image_legende_position` (`haut_gauche` \| `haut_droite` \| `bas_gauche` \| `bas_droite`) — [FEATURES.md](./FEATURES.md) §5.6                 |
| `source`                                                      | `documents.source_citation`                                                                                                                                                                    |
| `sourceType` (primaire / secondaire)                          | `documents.source_type` (`document_source_type`) — choix obligatoire en UI ; défaut SQL `secondaire` pour données historiques et inserts RPC tant que le payload wizard n’envoie pas la valeur |
| `disciplineId` / `niveauId`                                   | `documents.disciplines_ids` / `documents.niveaux_ids`                                                                                                                                          |
| Tables jointes « knowledge » / « aspect » du brouillon module | `documents.connaissances_ids` / `documents.aspects_societe`                                                                                                                                    |
| `createdBy` / `createdAt`                                     | `documents.auteur_id` / `documents.created_at`                                                                                                                                                 |
| `DocumentTask` (usage)                                        | Liaisons **`tae_documents`** ; décompte « X tâches » : [FEATURES.md](./FEATURES.md) §5.4 (une fois par TAÉ publiée, `COUNT(DISTINCT tae_id)`).                                                 |

**Trou :** les maquettes filaires « UI suggestion » de l’ancien registre unique **ne sont pas** une source normative de copy ; elles ne sont pas reproduites ici.

## Lexique global

| Terme                                 | Forme officielle                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Tâche d'apprentissage et d'évaluation | Toujours écrit en toutes lettres                                                                                  |
| TAÉ                                   | Abréviation interdite en copy UI ; utiliser la forme longue                                                       |
| Opération intellectuelle              | Jamais "OI"                                                                                                       |
| Compétence disciplinaire              | Jamais "CD"                                                                                                       |
| Comportement attendu                  | —                                                                                                                 |
| Consigne                              | —                                                                                                                 |
| Guidage complémentaire                | —                                                                                                                 |
| Corrigé (production attendue)         | —                                                                                                                 |
| Documents historiques                 | —                                                                                                                 |
| Sommaire                              | Remplace définitivement « preview » et « aperçu » dans l’UI formulaire                                            |
| Brouillon                             | —                                                                                                                 |
| Phrase d'introduction                 | **Amorce documentaire** — phrase générée automatiquement, jamais saisie manuellement par l'enseignant             |
| Épreuve (composition)                 | Libellé UI et [FAQ.md](./FAQ.md) ; tables `evaluations` / `evaluation_tae` — [ARCHITECTURE.md](./ARCHITECTURE.md) |

## Checklist — suivi et tâches ouvertes

- [ ] **Copy officielle manquante** pour : Profil enseignant (`templates/teacher-profile.php`) ; Liste enseignants (`templates/teachers.php`) ; Modifier profil (`templates/edit-profile.php`). **Créer / modifier une épreuve (composition)** : [UI-COPY.md](./UI-COPY.md#page--créer--modifier-une-épreuve-composition). Toute solution temporaire : marquer **PROVISOIRE** dans le code et dans [UI-COPY.md](./UI-COPY.md) lorsque la copy est ajoutée.
- [ ] **Étape 5 — Compétence disciplinaire :** l’ancien registre ne listait pas tous les libellés de l’écran ; compléter [UI-COPY.md](./UI-COPY.md) à partir de `Bloc6CompetenceDisciplinaire` / `BLOC5-CD.md` et des constantes existantes.
- [ ] **Modes d’impression** (formatif / sommatif / corrigé / épreuve) : finaliser la copy dans [UI-COPY.md](./UI-COPY.md) après arbitrage produit ([FEATURES.md](./FEATURES.md) §10.5).
- [ ] **Synchronisation** : [module-dcuments-historiques.md](./module-dcuments-historiques.md) ↔ ce fichier ↔ [UI-COPY.md](./UI-COPY.md).

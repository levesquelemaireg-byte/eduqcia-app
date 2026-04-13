# Audit de complétude — MVP v1 ÉduQc.IA

**Date :** 12 avril 2026
**Référence :** `docs/specs/mvp-v1.md` v1.0
**Méthode :** exploration exhaustive du code source, schéma SQL, actions serveur, composants, routes et tests

---

## Légende des statuts

| Icône | Statut           | Définition                                               |
| ----- | ---------------- | -------------------------------------------------------- |
| ✅    | **Fait**         | Fonctionnel de bout en bout, testé ou testable           |
| 🟡    | **Partiel**      | Code existant mais incomplet ou avec limitations connues |
| 🔴    | **À construire** | Aucune implémentation ou squelette non fonctionnel       |
| 🐛    | **Buggé**        | Implémenté mais dysfonctionnel ou avec régressions       |

---

## Synthèse globale

| Parcours                  | Fait   | Partiel | À construire | Buggé | Total  |
| ------------------------- | ------ | ------- | ------------ | ----- | ------ |
| **A — Auth** (A1–A7)      | 4      | 1       | 2            | 0     | 7      |
| **B — Dashboard** (B1–B5) | 2      | 2       | 1            | 0     | 5      |
| **C — Création** (C1–C21) | 16     | 2       | 3            | 0     | 21     |
| **D — Banque** (D1–D9)    | 5      | 2       | 2            | 0     | 9      |
| **E — Export** (E1–E5)    | 0      | 2       | 3            | 0     | 5      |
| **Total**                 | **27** | **9**   | **11**       | **0** | **47** |

**Taux de complétion :** 27/47 fait (57 %), 36/47 fait+partiel (77 %)

---

## Parcours A — Authentification et compte

### A1 — Inscription email institutionnel ✅ Fait

- **Route :** `app/(auth)/register/page.tsx`
- **Action :** `lib/actions/auth-register.ts` → `registerAction()`
- **Validation :** `lib/schemas/auth.ts` → `registerSchema` (regex `@*.gouv.qc.ca`)
- **Composant :** `components/auth/RegisterForm.tsx` — persistance brouillon en `sessionStorage`, force du mot de passe, champs conditionnels (enseignant vs conseiller)
- **Dépendances :** aucune
- **Effort restant :** 0

### A2 — Confirmation email et activation ✅ Fait

- **Route :** `app/(auth)/activate/page.tsx` + `app/auth/callback/route.ts`
- **Action :** `lib/actions/auth-resend.ts` → `resendActivationAction()`
- **Flux :** inscription → email Supabase → callback `/auth/callback` → mise à jour `profiles.status = 'active'` + `activated_at` → redirection `/activate?activated=1`
- **Composant :** `components/auth/ActivateResendForm.tsx`
- **Dépendances :** A1
- **Effort restant :** 0

### A3 — Connexion email / mot de passe ✅ Fait

- **Route :** `app/(auth)/login/page.tsx`
- **Action :** `lib/actions/auth-login.ts` → `loginAction()` — vérifie `profiles.status = 'active'` après auth Supabase, déconnecte si inactif
- **Guard :** `middleware.ts` redirige vers `/login?next=…` si non authentifié ; `requireActiveAppUser()` dans `app/(app)/layout.tsx`
- **Composant :** `components/auth/LoginForm.tsx`
- **Note technique :** `requireActiveAppUser()` utilise `createServiceClient()` (service_role) — dette v2 documentée dans `AUDIT_CODE_2026.md` (RM4)
- **Dépendances :** A1, A2
- **Effort restant :** 0

### A4 — Modifier son mot de passe 🔴 À construire

- **État actuel :** aucune route, aucune action serveur, aucun composant, aucun schéma Zod
- **Ce qui manque :**
  - Route `/profile/settings` ou modale dédiée
  - `lib/actions/auth-update-password.ts` → `supabase.auth.updateUser({ password })`
  - Schéma Zod : `currentPassword`, `newPassword`, `passwordConfirm`
  - Composant `ChangePasswordForm.tsx`
  - Copy UI à obtenir du développeur
- **Dépendances :** A3 (utilisateur connecté)
- **Effort restant :** 3–4 h

### A5 — Accéder à son profil 🟡 Partiel

- **Route :** `app/(app)/profile/[id]/page.tsx` — **existe mais affiche uniquement un placeholder** (« Vue publique enseignant — à venir »)
- **Données DB :** `profiles` contient `full_name`, `school` (JSON string), `email`, `status`
- **Ce qui manque :**
  - Query `getProfile(userId)` avec sélection explicite
  - Composant de rendu profil (nom, école, CSS, niveaux, publications)
  - Logique d'affichage : profil propre vs profil public d'un autre enseignant
- **Dépendances :** A3 ; mutualisable avec D9
- **Effort restant :** 3–4 h (inclut D9 si faits ensemble)

### A6 — Modifier son profil 🔴 À construire

- **État actuel :** aucune route, aucune action, aucun composant, aucun schéma
- **Complexité additionnelle :** `profiles.school` est un JSON string (`{ css, ecole, niveau }`) — parsing/validation nécessaire ; `full_name` est un champ unique (pas de split first/last)
- **Ce qui manque :**
  - Route `/profile/edit` ou formulaire inline sur la page profil
  - `lib/actions/auth-update-profile.ts`
  - Schéma Zod `profileEditSchema` (miroir partiel de `registerSchema`)
  - Composant `ProfileEditForm.tsx` (mêmes sélecteurs CSS/école/niveaux qu'à l'inscription)
  - Copy UI à obtenir du développeur (`docs/DECISIONS.md` le signale comme manquant)
- **Dépendances :** A5 (page profil fonctionnelle)
- **Effort restant :** 4–5 h

### A7 — Déconnexion ✅ Fait

- **Action :** `lib/actions/auth-logout.ts` → `logoutAction()` → `signOut()` + redirect `/login`
- **UI :** bouton dans `Sidebar.tsx`, formulaire natif avec spinner
- **Dépendances :** A3
- **Effort restant :** 0

---

## Parcours B — Tableau de bord

### B1 — Accéder au tableau de bord ✅ Fait

- **Route :** `app/(app)/dashboard/page.tsx` — Server Component
- **Auth :** vérifie session + redirige si absent ; appelle `getDashboardStats(userId)` avec 6 queries parallèles
- **Layout :** en-tête (nom, école, stats) + grille de 6 widgets
- **Effort restant :** 0

### B2 — Aperçu des créations 🟡 Partiel

- **Ce qui fonctionne :** compteurs TAÉ publiées, épreuves, documents non publiés, indice de confiance (moyenne des votes)
- **Limitation :** les widgets affichent uniquement des compteurs + un message « La liste détaillée arrive prochainement ». Pas de liste inline ; l'utilisateur doit naviguer vers `/questions`, `/documents` ou `/evaluations` pour voir le détail
- **Routes de listes existantes :**
  - `/questions` — filtre all/published/draft ✅
  - `/documents` — liste avec badge brouillon/publié ✅
  - `/evaluations` — liste avec badge ✅
- **Ce qui manque :** affichage inline des dernières créations dans les widgets du tableau de bord (ou lien direct « Voir mes X brouillons »)
- **Dépendances :** B1
- **Effort restant :** 2–3 h (enrichir les widgets avec les dernières créations)

### B3 — Tâches épinglées 🔴 À construire

- **État actuel :**
  - **DB :** table `favoris` existe (`user_id`, `type`, `item_id`, `notes`) avec RLS + index + trigger `sync_usage_on_favori()`
  - **Dashboard :** widget « Mes favoris » affiche le compteur mais aucune liste
  - **Actions :** aucune action serveur pour toggle favori
  - **UI :** aucun bouton d'épinglage fonctionnel (bouton présent dans la fiche tâche mais câblé à `console.log` + toast « Fonctionnalité à venir »)
- **Ce qui manque :**
  - `lib/actions/toggle-favoris.ts`
  - `lib/queries/get-user-favorites.ts` (avec jointure pour récupérer les détails des tâches)
  - Bouton épingler fonctionnel dans la fiche tâche (D5/D6)
  - Widget dashboard avec liste des favoris
- **Note :** explicitement listé comme coupe possible n°5 dans `mvp-v1.md`
- **Dépendances :** D5 (fiche tâche accessible), DB déjà prête
- **Effort restant :** 4–5 h

### B4 — Navigation rapide vers les brouillons 🟡 Partiel

- **Ce qui fonctionne :**
  - `/questions?filtre=draft` → filtre de brouillons TAÉ ✅
  - `/documents` → badge brouillon visible sur chaque carte ✅
  - `/evaluations` → badge brouillon visible ✅
  - Sidebar → liens vers chaque liste ✅
- **Limitation :** pas de vue unifiée « Mes brouillons » cross-entités ; pas de raccourci direct depuis le dashboard. Nécessite 2–3 clics pour atteindre les brouillons
- **Ce qui manque :** widget dashboard « Brouillons en cours » avec liens directs, ou onglet filtré sur chaque liste
- **Dépendances :** B1, B2
- **Effort restant :** 2–3 h (widget + query groupée)

### B5 — Accès rapide aux actions de création ✅ Fait

- **Sidebar :** 3 liens permanents (Créer un document, Créer une tâche, Créer une épreuve) avec icônes
- **Dashboard :** CTA contextuels dans chaque widget vide (« Créer une tâche », « Créer une épreuve »)
- **Listes :** bouton de création dans l'en-tête de chaque page de liste
- **Effort restant :** 0

---

## Parcours C — Création de contenu

### Documents historiques

#### C1 — Créer un document autonome ✅ Fait

- **Route :** `app/(app)/documents/new/page.tsx` → `AutonomousDocumentWizard`
- **Étapes :** éléments textuels/iconographiques, connaissances (Miller), aspects de société, repère temporel, source/citation, image (upload + légende)
- **Action :** `lib/actions/create-autonomous-document.ts`
- **Schéma :** `lib/schemas/autonomous-document.ts`
- **Effort restant :** 0

#### C2 — Sauvegarder un document en brouillon ✅ Fait

- **Mécanisme :** persistance en `sessionStorage` via le wizard (clé dédiée)
- **Limitation connue :** pas de persistance serveur (contrairement aux TAÉ qui ont `tae_wizard_drafts`). Le brouillon est perdu si le navigateur est fermé. Acceptable pour la complexité moindre des documents
- **Effort restant :** 0 (acceptable tel quel pour MVP)

#### C3 — Publier un document ✅ Fait

- **Comportement :** publication immédiate à la soumission (`is_published: true`)
- **Action :** `lib/actions/create-autonomous-document.ts` — résout les IDs de connaissances, insère dans `documents`
- **Effort restant :** 0

#### C4 — Modifier un document publié ✅ Fait

- **Route :** `app/(app)/documents/[id]/edit/page.tsx`
- **Query :** `lib/queries/autonomous-document-edit.ts` — charge le document existant
- **Action :** `lib/actions/update-autonomous-document.ts` — vérifie `auteur_id === user.id`
- **Effort restant :** 0

#### C5 — Supprimer un document 🔴 À construire

- **État actuel :** aucune action de suppression, aucun RPC, aucun bouton dans l'UI
- **Complexité :** doit vérifier les références dans `tae_documents` (FK) — un document utilisé dans une tâche ne peut pas être supprimé sans décision (soft delete ou erreur)
- **Ce qui manque :**
  - `lib/actions/delete-autonomous-document.ts`
  - RPC ou policy DELETE avec guard sur `tae_documents`
  - Bouton supprimer dans la page document + modale de confirmation
- **Dépendances :** C1
- **Effort restant :** 2–3 h

### Tâches d'apprentissage et d'évaluation

#### C6 — Wizard tâche 7 étapes ✅ Fait

- **Route :** `app/(app)/questions/new/page.tsx` → `TaeForm`
- **7 blocs :** Auteurs, Paramètres, Consigne+guidage, Documents, Corrigé, CD, Connaissances
- **State :** reducer `lib/tae/tae-form-reducer.ts`, guards `lib/tae/wizard-publish-guards.ts`
- **Stepper :** `components/tae/TaeForm/Stepper.tsx` + `StepperNavFooter.tsx`
- **Effort restant :** 0

#### C7 — Référencer des documents de la banque ✅ Fait

- **Bloc 4 :** `Bloc4DocumentsHistoriques.tsx` + `BanqueDocumentsStub.tsx`
- **Picker :** recherche + filtres (niveau, discipline, OI, aspects), scroll infini, pagination
- **Slots :** doc_A à doc_D selon `nb_documents` du comportement
- **Effort restant :** 0

#### C8 — Créer des documents dans le wizard ✅ Fait

- **Composant :** `DocumentSlotCreateForm.tsx` — formulaire embarqué (éléments, légende, connaissances, aspects, année)
- **Comportement :** crée le document + assigne au slot sans quitter le wizard
- **Effort restant :** 0

#### C9 — Sauvegarder en brouillon (serveur) ✅ Fait

- **Action :** `lib/actions/tae-draft.ts` → `saveWizardDraftAction()` — upsert dans `tae_wizard_drafts`
- **Auto-save :** sur blur, debounced
- **Reprise :** `lib/queries/tae-draft.ts` → `getWizardDraftForUser()` hydrate le wizard au retour
- **Bannières :** `WizardDraftBanners.tsx`, `WizardDraftObsoleteToast.tsx` (détection schema obsolète)
- **Effort restant :** 0

#### C10 — Publier une tâche ✅ Fait

- **Action :** `lib/actions/tae-publish.ts` → `publishTaeAction()`
- **RPC :** `publish_tae_transaction(p_payload)` — transaction atomique (tae + documents + collaborateurs + CD + connaissances)
- **Payload :** `lib/tae/publish-tae.ts` — construction complète du payload
- **Note :** ⚠️ `revalidatePath` absent après publication (cache stale possible) — à corriger
- **Dépendances :** C6, C7/C8 (documents attachés)
- **Effort restant :** 15 min (ajouter `revalidatePath`)

#### C11 — Modifier une tâche publiée ✅ Fait

- **Route :** `app/(app)/questions/[id]/edit/page.tsx`
- **Hydratation :** `lib/tae/load-tae-for-edit.ts` → `fetchTaeFormStateForEdit()`
- **RPC :** `update_tae_transaction(tae_id, payload)` — gestion version major/minor
- **Guard :** seul l'auteur peut éditer ; vérifie usage dans épreuves
- **Effort restant :** 0

#### C12 — Supprimer une tâche ✅ Fait

- **Action :** `lib/actions/tae-delete.ts` → `deleteTaeAction()` — vérifie propriété + FK `evaluation_tae`
- **UI :** menu ⋮ dans la fiche → « Supprimer » + `window.confirm`
- **Guard :** retourne `code: "in_use"` si la tâche est dans une épreuve
- **Effort restant :** 0

#### C13 — Toutes les OI et comportements ✅ Fait (couverture intentionnelle)

- **OI actives (100 % implémentées) :** OI0.1, OI1.1, OI1.2, OI1.3, OI3.1–3.5, OI4.1, OI4.2, OI6.1–6.3, OI7.1
- **OI non-rédactionnelles (OI1) :** 3 variantes complètes — ordre chronologique, ligne du temps, avant-après (`lib/tae/non-redaction/`)
- **OI marquées `coming_soon` dans `oi.json` :** OI2 (carte historique), OI4.3–4.4 (causes/conséquences avancées), OI5 (manifestations)
- **Configurations :** `lib/tae/wizard-bloc-config.ts` — modèle souple, structure, pur, perspectives, intrus
- **Verdict :** toutes les OI **actives** sont supportées. Les OI `coming_soon` sont des choix de périmètre pédagogique, pas des lacunes techniques. Le wizard refuse proprement ces OI dans le sélecteur Bloc 2
- **Effort restant :** 0 pour le MVP (les OI manquantes sont du contenu pédagogique futur, pas de la dette technique)

### Épreuves

#### C14 — Créer une épreuve via wizard ✅ Fait

- **Route :** `app/(app)/evaluations/new/page.tsx`
- **Composant :** `EvaluationCompositionEditor.tsx` — titre + picker de tâches (banque / mes tâches) + panier
- **Schéma :** `lib/schemas/evaluation-composition.ts`
- **Effort restant :** 0

#### C15 — Sélectionner et ordonner les tâches ✅ Fait

- **Picker :** 2 onglets (banque collaborative, mes tâches), scroll infini, recherche textuelle
- **Panier :** ajout, suppression, réordonnancement haut/bas, guard anti-doublon
- **Query :** `lib/queries/evaluation-tae-picker.ts`
- **Effort restant :** 0

#### C16 — Support 23+ tâches ✅ Fait

- **Aucune limite de taille** dans le code (tableau JS, pas de max dans le schéma Zod)
- **Numérotation :** `lib/evaluations/composition-numbering.ts` calcule les plages cumulatives (« Questions 1-5 (Doc 1) », etc.)
- **UI :** liste scrollable, chaque entrée ~100px — fonctionnel jusqu'à 30+ tâches
- **Effort restant :** 0

#### C17 — Configurer les paramètres de l'épreuve 🟡 Partiel

- **Titre :** ✅ champ texte, requis, max 200 caractères, validé par Zod
- **Niveau / Discipline :** 🔴 absents de l'UI. Les colonnes `niveau_id` et `discipline_id` existent en DB (`evaluations` table) mais sont toujours `null`. Aucun sélecteur dans le wizard épreuve
- **Ce qui manque :**
  - Sélecteurs niveau + discipline dans `EvaluationCompositionEditor`
  - Logique : dériver automatiquement du premier tâche ajoutée, ou forcer la saisie
- **Dépendances :** C14
- **Effort restant :** 2–3 h

#### C18 — Sauvegarder épreuve en brouillon ✅ Fait

- **Action :** `lib/actions/evaluation-save.ts` → `saveEvaluationCompositionAction(body, publish=false)`
- **RPC :** `save_evaluation_composition(p_payload)` avec `p_is_published=false`
- **Reprise :** `app/(app)/evaluations/[id]/edit/page.tsx` → `getEvaluationEditBundle(id)` hydrate le formulaire
- **Effort restant :** 0

#### C19 — Publier une épreuve ✅ Fait

- **Action :** même action avec `publish=true`
- **Validation :** titre non vide, panier ≥ 1 tâche
- **DB :** `is_published=true`, `published_at` positionné
- **Effort restant :** 0

#### C20 — Modifier une épreuve publiée ✅ Fait

- **Route :** `app/(app)/evaluations/[id]/edit/page.tsx` → `mode="edit"`
- **Comportement :** rehydratation du titre + panier, même action de sauvegarde/publication
- **Effort restant :** 0

#### C21 — Supprimer une épreuve 🔴 À construire

- **État actuel :** aucune action de suppression, aucun RPC, aucun bouton dans l'UI
- **Ce qui manque :**
  - `lib/actions/delete-evaluation.ts`
  - RPC ou policy DELETE avec cascade sur `evaluation_tae`
  - Bouton supprimer dans le wizard ou la page de l'épreuve + modale de confirmation
  - `revalidatePath('/evaluations')`
- **Dépendances :** C14
- **Effort restant :** 1–2 h

---

## Parcours D — Banque collaborative

### D1 — Accéder à la banque ✅ Fait

- **Route :** `app/(app)/bank/page.tsx` — protégée par auth middleware
- **Effort restant :** 0

### D2 — Trois sections (tâches, documents, épreuves) ✅ Fait

- **Composant :** `BankOnglets.tsx` — 3 onglets avec panels dédiés
- **Panels :** `BankTasksPanel`, `BankDocumentsPanel`, `BankEvaluationsPanel`
- **Queries :** `bank-tasks.ts`, `bank-documents.ts`, `bank-evaluations.ts` — pagination, tri
- **Effort restant :** 0

### D3 — Filtres de la banque ✅ Fait (tâches complet, documents/épreuves partiels)

- **Tâches :** ✅ niveau, discipline, OI, comportement, aspects de société, recherche textuelle (`consigne_search_plain` pg_trgm), tri récent/populaire, pagination 20/page
- **Documents :** ✅ titre, niveau, discipline, type (textuel/iconographique), catégorie icono
- **Épreuves :** 🟡 recherche par titre uniquement — commentaire dans le code : « Filtres dérivés — PROVISOIRE — à brancher (plan-banque-collaborative.md) »
- **Effort restant :** 1–2 h (filtres épreuves niveau/discipline)

### D4 — Filtrer par auteur 🟡 Partiel

- **Ce qui existe :**
  - Route `/collaborateurs` → `getAllActiveCollaborateurs()` liste tous les enseignants actifs avec nombre de TAÉ
  - Affichage : nom, email, école, compteur publications
- **Ce qui manque :**
  - Aucun filtre « par auteur » dans la banque elle-même (pas de sélecteur auteur dans `BankTaskFilters`)
  - Pas de lien retour depuis `/collaborateurs` vers la banque filtrée
- **Note :** coupe possible n°2 dans `mvp-v1.md`
- **Dépendances :** D1, D8
- **Effort restant :** 2–3 h (ajouter `auteur_id` aux queries bank + UI sélecteur)

### D5 — Fiche détaillée ✅ Fait

- **Tâche :** `/questions/[id]` → `TacheVueDetaillee` — layout 3 zones (barre d'actions sticky, flux principal gauche, rail sticky droite), modale document embarquée, responsive 3 breakpoints, a11y complète. Spec `docs/specs/fiche-tache-lecture.md`, implémentation `docs/specs/fiche-tache-implementation-context.md` (8 phases, spec fermée 12 avril 2026).
- **Document :** `/documents/[id]` → composant de lecture document
- **Épreuve :** 🟡 pas de route de lecture dédiée, seulement `/evaluations/[id]/edit` (mode édition)
- **Effort restant :** 1–2 h (ajouter une page de lecture épreuve read-only, ou lien direct « Voir l'épreuve » depuis la banque)

### D6 — Épingler une tâche 🔴 À construire

- **État actuel :**
  - DB : table `favoris` prête (schema, RLS, index, trigger)
  - UI : bouton présent dans la fiche tâche, mais câblé à `console.log("épingler toggle")` + toast « Fonctionnalité à venir »
  - Actions : aucune
- **Ce qui manque :**
  - `lib/actions/toggle-favoris.ts` (insert/delete toggle)
  - `lib/queries/get-user-favorites.ts` (jointure pour détails)
  - Câblage du bouton existant vers l'action réelle
  - Widget dashboard « Mes favoris » enrichi avec liste
- **Note :** coupe possible n°5 dans `mvp-v1.md`
- **Dépendances :** D5, B3
- **Effort restant :** 4–5 h

### D7 — Ajouter une tâche de la banque à une épreuve ✅ Fait

- **Mécanisme :** picker embarqué dans `EvaluationCompositionEditor` (onglet « Banque »)
- **Query :** `evaluation-tae-picker.ts` — toutes les TAÉ publiées éligibles
- **Workflow :** parcourir → ajouter au panier → sauvegarder épreuve
- **Effort restant :** 0

### D8 — Liste des enseignants inscrits ✅ Fait

- **Route :** `app/(app)/collaborateurs/page.tsx`
- **Query :** `lib/queries/collaborateurs-list.ts` → `getAllActiveCollaborateurs()`
- **Affichage :** nom, email, école, compteur TAÉ publiées, tri alphabétique
- **Effort restant :** 0

### D9 — Profil public enseignant 🔴 À construire

- **Route :** `app/(app)/profile/[id]/page.tsx` — placeholder (« Vue publique enseignant — à venir »)
- **Ce qui manque :**
  - Query pour récupérer le profil enseignant + ses publications
  - Composant de rendu profil
  - Lien depuis `/collaborateurs` vers ce profil
- **Note :** coupe possible n°4 dans `mvp-v1.md`
- **Dépendances :** D8, A5 (mutualisation)
- **Effort restant :** 3–4 h (mutualisé avec A5)

---

## Parcours E — Export et impression

### E1 — Exporter l'épreuve en PDF 🔴 À construire

- **État actuel :** aucun pipeline de génération PDF côté serveur. L'utilisateur peut uniquement faire Ctrl+P → « Enregistrer en PDF » via le navigateur, avec résultats inconsistants
- **Infrastructure existante :**
  - Routes print : `/questions/[id]/print`, `/evaluations/[id]/print`, `/documents/[id]/print`
  - Shell print : `app/(print)/layout.tsx` — shell minimal sans AppShell
  - CSS print : `lib/tae/print-page-css.ts` — `@page { size: letter portrait; margin: 2cm; }`, police Arial 11pt
  - Composants HTML : `PrintableFichePreview.tsx`, `EvaluationPrintableBody.tsx`
- **Ce qui manque :**
  - **Puppeteer / Chromium headless** — non installé (`puppeteer-core` + `@sparticuz/chromium-min` pour Vercel)
  - **Route API** `/api/evaluations/[id]/pdf` pour la génération serveur
  - **Bouton « Télécharger PDF »** dans l'UI épreuve
  - **Sélecteur de mode** (voir E2)
- **Dépendances :** routes print existantes (réutilisables), C14–C19 (épreuve publiée)
- **Effort restant :** 8–12 h (setup Puppeteer + route API + UI + tests cross-browser)

### E2 — Trois modes d'export 🟡 Partiel

- **Mode « deux feuillets élève » :** 🟡 layout HTML existant dans `EvaluationPrintableBody.tsx` (section dossier documentaire + section questionnaire), mais **aucun sélecteur de mode** dans l'UI et pas de génération PDF
- **Mode « formatif un feuillet » :** 🔴 non implémenté, **explicitement listé comme coupe n°1** dans `mvp-v1.md`
- **Mode « corrigé enseignant » :** 🔴 non implémenté. Le champ `corrige` existe en DB et dans le wizard (Bloc 5), mais le rendu print n'inclut pas les corrigés. Nécessite un template print dédié
- **Ce qui manque :**
  - Sélecteur de mode dans l'UI d'export
  - Template print « corrigé » (inclure Bloc 5 corrigé de chaque tâche)
  - Template print « formatif un feuillet » (séquence alternée doc→consigne)
- **Dépendances :** E1 (pipeline PDF)
- **Effort restant :** 6–8 h (2 templates × 3–4 h chacun, le formatif étant plus complexe)

### E3 — PDF pixel-perfect 🟡 Partiel

- **État actuel :** le rendu HTML print est de bonne qualité (CSS `@page`, grilles calibrées, marges 2 cm). Mais le passage par `window.print()` du navigateur produit des résultats variables selon l'OS, le navigateur et les paramètres d'impression
- **Solution :** Puppeteer headless côté serveur garantit un rendu identique pour tous les utilisateurs
- **Dépendances :** E1
- **Effort restant :** inclus dans E1

### E4 — Télécharger le PDF 🔴 À construire

- **État actuel :** l'utilisateur doit manuellement choisir « Enregistrer en PDF » dans la boîte de dialogue d'impression du navigateur
- **Ce qui manque :**
  - Bouton « Télécharger PDF » dans la page épreuve
  - Route API retournant `Content-Disposition: attachment; filename="epreuve-xxx.pdf"`
- **Dépendances :** E1
- **Effort restant :** inclus dans E1

### E5 — Impression fidèle 🔴 À construire

- **État actuel :** dépend entièrement du lecteur PDF de l'utilisateur après téléchargement
- **Solution :** un PDF correctement généré (Puppeteer, `@page` rules) produit un résultat fidèle quand imprimé depuis n'importe quel lecteur PDF
- **Dépendances :** E1
- **Effort restant :** inclus dans E1 (vérification manuelle sur 2–3 imprimantes)

---

## Exigences transversales

### Loading / Error states 🔴 À construire

| Item                    | État                                 | Impact                                         |
| ----------------------- | ------------------------------------ | ---------------------------------------------- |
| `loading.tsx`           | ❌ 0 fichier dans tout le projet     | Pas de fallback UI pendant les navigations     |
| `error.tsx`             | ❌ 0 fichier dans tout le projet     | Les erreurs crashent la route entière          |
| Skeleton components     | ❌ aucun dans `components/ui/`       | Pas de placeholder pour les listes             |
| `<Suspense>` boundaries | ❌ aucun dans les pages `app/(app)/` | Pas de streaming, pas de chargement progressif |

**Effort :** 4–6 h (loading.tsx + error.tsx pour les 5–6 routes principales, 2–3 skeletons, Suspense sur dashboard + banque)

### Sécurité 🔴 À construire (partiellement)

| Item          | État                                    | Impact                                                                                    |
| ------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| `safeHtml()`  | ❌ inexistant                           | **20 `dangerouslySetInnerHTML` non sanitisés** dans les composants document, tâche, print |
| CSP headers   | ❌ non configurés dans `next.config.ts` | Pas de réduction de surface d'attaque                                                     |
| `select("*")` | ⚠️ 5 occurrences en production          | `autonomous-document-edit.ts`, `load-tae-for-edit.ts`, `server-fiche-map.ts` (×3)         |

**Effort :** 3–4 h (créer `safeHtml`, appliquer sur les 20 usages, ajouter CSP de base, corriger les 5 `select("*")`)

### Performance 🟡 Partiel

| Item                             | État                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Images AVIF                      | ❌ `formats` non configuré dans `next.config.ts`                                                                           |
| `revalidatePath` après mutations | ⚠️ présent sur 2/19 actions (`tae-delete`, `evaluation-save`). **Absent** sur `tae-publish`, `tae-draft`, actions document |

**Effort :** 1–2 h (config AVIF + ajouter `revalidatePath` dans les actions critiques)

### Tests d'intégration 🔴 À construire

| Exigence MVP                              | État                                              |
| ----------------------------------------- | ------------------------------------------------- |
| Tests intégration `publishTaeAction`      | ❌ absent                                         |
| Tests intégration `saveWizardDraftAction` | ❌ absent                                         |
| Tests intégration `publishEpreuveAction`  | ❌ absent                                         |
| Tests unitaires lib/                      | ✅ 43 fichiers Vitest                             |
| Tests E2E                                 | ✅ 2 fichiers Playwright (grilles, auth redirect) |

**Effort :** 6–8 h (3 actions × 2–3 h chacune, nécessite seed DB + teardown)

### Accessibilité 🔴 Partiel

| Item                     | État                                             |
| ------------------------ | ------------------------------------------------ |
| `prefers-reduced-motion` | ❌ absent de `globals.css`                       |
| Skip-to-content link     | ❌ absent                                        |
| Navigation clavier       | ✅ fonctionnelle (formulaires, stepper, sidebar) |
| Contrastes WCAG AA       | ✅ tokens calibrés                               |

**Effort :** 1 h

---

## Carte des dépendances

```
A1 ← A2 ← A3 ← A4, A5, A6, A7
                 ↓
                B1 ← B2, B4, B5
                      ↓
                     B3 ←── D6
                 ↓
C1 ← C2, C3, C4, C5
C6 ← C7, C8, C9, C10 ← C11, C12
                         ↓
C14 ← C15, C16, C17, C18, C19 ← C20, C21
                                  ↓
                        E1 ← E2, E3, E4, E5

D1 ← D2, D3, D7
D1 ← D8 ← D4, D9
D5 ← D6
A5 ↔ D9 (mutualisation profil)
B3 ↔ D6 (favoris/épinglage)
```

---

## Estimation d'effort restant

### Résumé par parcours

| Parcours          | Items restants                                         | Effort estimé |
| ----------------- | ------------------------------------------------------ | ------------- |
| **A — Auth**      | A4, A5, A6                                             | 10–13 h       |
| **B — Dashboard** | B2 enrichi, B3, B4                                     | 8–11 h        |
| **C — Création**  | C5, C17, C21, revalidation C10                         | 5–8 h         |
| **D — Banque**    | D4, D5 (épreuve read), D6, D9                          | 10–14 h       |
| **E — Export**    | E1–E5 (pipeline complet)                               | 14–20 h       |
| **Transversal**   | Loading/error, safeHtml, CSP, tests intég., a11y, perf | 15–21 h       |
| **Total**         |                                                        | **62–87 h**   |

### Contexte temporel

À 2 jours/semaine (~16 h/semaine effectives) :

- **Fourchette optimiste :** ~4 semaines
- **Fourchette réaliste :** ~5–6 semaines
- **Fourchette pessimiste (découvertes, debug) :** ~7–8 semaines

À 1 jour/semaine (~8 h/semaine) : doubler les estimations.

---

## Ordre d'exécution recommandé

### Phase 1 — Fondations critiques (semaines 1–2)

Ces items débloquent le plus de dépendances et réduisent le risque technique.

| #   | Item                                                        | Effort | Justification                               |
| --- | ----------------------------------------------------------- | ------ | ------------------------------------------- |
| 1   | **Transversal : `safeHtml()` + application sur 20 usages**  | 2–3 h  | Sécurité — risque XSS actif                 |
| 2   | **Transversal : `loading.tsx` + `error.tsx` + skeletons**   | 4–6 h  | UX minimum pour un produit livrable         |
| 3   | **Transversal : `revalidatePath` sur toutes les mutations** | 1 h    | Bugs de cache visibles par les utilisateurs |
| 4   | **C5 — Supprimer un document**                              | 2–3 h  | Fonctionnalité CRUD de base manquante       |
| 5   | **C21 — Supprimer une épreuve**                             | 1–2 h  | Fonctionnalité CRUD de base manquante       |
| 6   | **C17 — Paramètres épreuve (niveau/discipline)**            | 2–3 h  | Complète le wizard épreuve                  |

### Phase 2 — Pipeline d'export (semaines 2–3)

Risque technique le plus élevé du projet — à attaquer tôt.

| #   | Item                                                | Effort | Justification                          |
| --- | --------------------------------------------------- | ------ | -------------------------------------- |
| 7   | **E1 — Pipeline PDF (Puppeteer + route API)**       | 8–12 h | Bloqueur n°1 du MVP ; dépendance E2–E5 |
| 8   | **E2 — Templates modes (deux feuillets + corrigé)** | 4–6 h  | Deux modes minimum pour le lancement   |
| 9   | **E2 — Template formatif un feuillet**              | 2–3 h  | Coupe possible n°1 si retard           |

### Phase 3 — Parcours complets auth + banque (semaines 3–4)

| #   | Item                                        | Effort | Justification                               |
| --- | ------------------------------------------- | ------ | ------------------------------------------- |
| 10  | **A4 — Modifier mot de passe**              | 3–4 h  | Parcours auth incomplet                     |
| 11  | **A5 + D9 — Page profil (propre + public)** | 3–4 h  | Mutualisés — une seule query + un composant |
| 12  | **A6 — Modifier profil**                    | 4–5 h  | Dépend de A5                                |
| 13  | **D4 — Filtre par auteur dans la banque**   | 2–3 h  | Coupe possible n°2                          |

### Phase 4 — Dashboard et épinglage (semaine 4–5)

| #   | Item                                                              | Effort | Justification                  |
| --- | ----------------------------------------------------------------- | ------ | ------------------------------ |
| 14  | **D6 + B3 — Épinglage complet (action + query + UI + dashboard)** | 4–5 h  | DB prête ; coupe possible n°5  |
| 15  | **B2 — Enrichir widgets dashboard**                               | 2–3 h  | UX polish                      |
| 16  | **B4 — Vue brouillons rapide**                                    | 2–3 h  | UX polish                      |
| 17  | **D5 — Fiche lecture épreuve (read-only)**                        | 1–2 h  | Manque pour la banque épreuves |

### Phase 5 — Qualité et tests (semaine 5–6)

| #   | Item                                                         | Effort | Justification               |
| --- | ------------------------------------------------------------ | ------ | --------------------------- |
| 18  | **Tests intégration : 3 Server Actions critiques**           | 6–8 h  | Exigence non négociable MVP |
| 19  | **Transversal : CSP headers + AVIF + `select("*")` cleanup** | 2–3 h  | Hardening                   |
| 20  | **Transversal : `prefers-reduced-motion` + skip-to-content** | 1 h    | A11y quick wins             |
| 21  | **D3 — Filtres épreuves (niveau/discipline)**                | 1–2 h  | Polish banque               |

---

## Items coupables si retard (par priorité, comme défini dans `mvp-v1.md`)

| Ordre | Item                             | Impact utilisateur                                    | Effort économisé |
| ----- | -------------------------------- | ----------------------------------------------------- | ---------------- |
| 1     | E2 mode « formatif un feuillet » | Mineur — les 2 autres modes suffisent                 | 2–3 h            |
| 2     | D4 filtre par auteur             | Mineur — contournable via `/collaborateurs`           | 2–3 h            |
| 3     | D8 liste enseignants             | Faible — déjà implémenté ✅ (pas de coupe nécessaire) | 0 h              |
| 4     | D9 profils publics               | Moyen — placeholder acceptable pour bêta              | 3–4 h            |
| 5     | D6 + B3 épinglage                | Moyen — fonctionnalité secondaire pour la bêta        | 4–5 h            |

**Économie maximale en cas de retard :** 11–15 h (~1 semaine à 2 j/semaine)

---

## Risques identifiés

| Risque                                                                        | Probabilité | Impact             | Mitigation                                                 |
| ----------------------------------------------------------------------------- | ----------- | ------------------ | ---------------------------------------------------------- |
| **Puppeteer sur Vercel** — limites de taille/timeout des fonctions serverless | Moyenne     | Bloquant E1–E5     | Tester tôt ; plan B = API externe (Browserless, Gotenberg) |
| **20 `dangerouslySetInnerHTML` non sanitisés** — XSS potentiel                | Haute       | Sécurité critique  | Priorité n°1 de la Phase 1                                 |
| **Cache stale après publication** — données affichées obsolètes               | Haute       | Bug visible        | Fix trivial (`revalidatePath`) — Phase 1                   |
| **Tests d'intégration Server Actions** — nécessitent setup DB seeds           | Moyenne     | Effort sous-estimé | Prévoir 1–2 h de setup infra test en plus                  |
| **Copy UI manquante** (A4, A5, A6) — pas de textes officiels                  | Moyenne     | Bloquant soft      | Obtenir les textes du développeur avant de coder           |

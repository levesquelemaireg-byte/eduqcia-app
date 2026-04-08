# TODO — Corrections post-audit du wizard de création de tâche

> **Document vivant.** Contrairement à l'audit (`docs/audits/audit-2026-04-08-task-creation-wizard.md`) qui est figé à sa date de publication, ce fichier est destiné à évoluer librement au fil du travail. Coche les actions au fur et à mesure, ajoute des notes, réordonne, ajoute ou retire des items selon ce que tu apprends en cours de route.
>
> Source des décisions : audit du 8 avril 2026 + plan de phases élaboré en session de design séparée. Les références `E*.*` et `A*.*` renvoient aux codes d'écart de l'audit.

---

## Phase 1 — Le grand ménage (dette technique en bloc)

**Effort estimé** : 1 à 2 jours
**Adresse** : E3.4.4, E3.6.3, E3.7.1, E3.8.3, E3.8.4, E3.8.5, points 1-5 de la section « code mort suspect » de l'audit
**Caractère** : aucun changement fonctionnel — uniquement nettoyage structurel et renommage. À traiter en un seul lot pour éviter les renommages partiels successifs.

> **Note d'estimation** : chaque renommage est une opération multi-fichiers (composant + tous les imports + entrées dans `BLOC_COMPONENTS` de `TaeForm/index.tsx` + références dans `step-meta.ts` + éventuellement la slice du state qui s'appelle encore `bloc6` dans le code alors que le composant devient `Bloc6`). Compte 30 à 60 minutes par renommage plutôt que 5 minutes.

- [ ] Renommer `Bloc5CompetenceDisciplinaire` en `Bloc6CompetenceDisciplinaire` (fichier + import dans `BLOC_COMPONENTS` de `TaeForm/index.tsx`)
- [ ] Renommer `Bloc7Indexation` en `Bloc7AspectsConnaissances` (ou nom plus explicite à finaliser)
- [ ] Déplacer le contenu du dossier `bloc6/` vers `bloc7/` (Miller columns pour l'étape 7) et mettre à jour les imports
- [ ] Déplacer `bloc3/SectionAspects.tsx` vers `bloc7/` (mal rangé, mais utilisé activement par `Bloc7Indexation` — pas mort)
- [ ] Supprimer `bloc3/SectionCorrige.tsx` (mort confirmé par grep, aucun import)
- [ ] Vérifier puis éventuellement supprimer `bloc5/non-redactionnel/Bloc5TestScalability.tsx` et son entrée `test-scalability` dans `BLOC5_DYNAMIC_BY_SLUG`
- [ ] Vérifier puis éventuellement supprimer `bloc5/non-redactionnel/Bloc5Default.tsx` (fallback `BLOC5_COMPORTEMENT_INCONNU` — ne devrait jamais s'afficher si tous les comportements sont mappés)
- [ ] Unifier les deux résolveurs de Bloc 5 : `bloc5/Bloc5.tsx` duplique partiellement `wizardBlocResolver.tsx` — choisir un seul résolveur autoritatif et supprimer l'autre

---

## Phase 2 — Refonte du modèle de références de documents + drag-and-drop

**Effort estimé** : 3 à 5 jours
**Adresse** : E2.1, E3.5.1
**Décisions prises** :

- **Stockage** : Option B — le nœud TipTap `docRef` stocke un `documentId` stable, plus une `letter` figée
- **Références orphelines** : comportement 1 — placeholder d'erreur visible quand un document référencé est retiré (l'enseignant voit immédiatement le problème)
- **Migration** : aucune. La base de test sera wipée — toutes les tâches actuelles sont des fixtures de développement.

- [ ] Modifier `extensionDocRef.ts` : remplacer l'attribut `letter` par `documentId` (UUID)
- [ ] Mettre à jour `DocRefNodeView.tsx` pour résoudre l'affichage à partir du `documentId` (lookup dans `state.bloc4.documents` ou via un context d'aperçu)
- [ ] Implémenter le placeholder d'erreur visible quand `documentId` ne correspond à aucun slot rempli (badge rouge « document retiré » par exemple)
- [ ] Mettre à jour `insertAmorce.ts` pour créer des nœuds avec `documentId` au lieu de `letter`
- [ ] Mettre à jour `consigne-helpers.ts` (`resolveDocRefsForPreview`, `resolveConsigneHtmlForDisplay`, `getMissingDocLetters`) pour la résolution contextuelle local↔épreuve à partir du `documentId`
- [ ] Wiper la base de test (Supabase) — pas de migration, repartir propre
- [ ] Ajouter le drag-and-drop pour réordonner les documents dans `Bloc4DocumentsHistoriques` (probablement via `@dnd-kit` — à valider avant install)
- [ ] Vérifier que le réordonnancement met automatiquement à jour les chips d'affichage dans la consigne (résolution dynamique via `documentId`, le HTML stocké reste inchangé)

---

## Phase 3 — Refonte de l'aperçu en onglets inline + toggle Formatif/Sommatif

**Effort estimé** : 2 à 3 jours
**Adresse** : E4.1, E4.2
**Décisions prises** :

- Passer à un vrai système d'onglets dans la colonne droite du wizard (Aperçu sommaire / Aperçu imprimé), au lieu de garder l'aperçu imprimé enfermé dans une modale
- Conserver optionnellement un bouton « Agrandir » qui ouvre `PrintPreviewModal` en mode plein écran pour validation finale

- [ ] Créer un composant d'onglets inline dans la colonne droite de `TaeForm/index.tsx` : Aperçu sommaire (par défaut) / Aperçu imprimé
- [ ] Brancher l'onglet Sommaire sur `FicheSommaireColumn` existant
- [ ] Brancher l'onglet Imprimé sur `PrintableFichePreview` (rendu inline, pas modal)
- [ ] Conserver `PrintPreviewModal` accessible via un bouton « Agrandir » dans le toolbar de l'onglet Imprimé
- [ ] Ajouter le toggle Formatif/Sommatif dans le sous-onglet Questionnaire de l'aperçu imprimé — la donnée `showGuidageOnStudentSheet` existe déjà dans `TaeFicheData`, il manque juste le contrôle UI qui l'écrit
- [ ] Vérifier que la bascule Formatif → Sommatif masque bien le guidage en temps réel dans l'aperçu

---

## Phase 4 — Pipeline de génération PDF côté serveur

**Effort estimé** : 3 à 5 jours
**Adresse** : E5.1
**Décisions prises** :

- Déploiement sur **Vercel** (pas Hostinger Premium qui est mutualisé et ne peut pas faire tourner Puppeteer)
- Pattern Vercel serverless : `@sparticuz/chromium-min` + `puppeteer-core`

- [ ] Migrer le projet vers Vercel (ou créer un déploiement Vercel parallèle pour valider la chaîne PDF avant de basculer)
- [ ] Installer `@sparticuz/chromium-min` et `puppeteer-core`
- [ ] Créer la route API `/api/tae/[id]/pdf` qui rend `PrintableFicheFromTaeData` côté serveur via Puppeteer headless
- [ ] Verrouiller la version de Chromium côté serveur pour garantir la cohérence avec le rendu client
- [ ] Activer le bouton « Télécharger le PDF » dans `PrintPreviewModal` (actuellement `disabled` ligne 104-115) et le brancher sur la route API
- [ ] Supprimer la dépendance à `window.print()` côté navigateur — l'utilisateur télécharge un PDF, il n'imprime pas directement
- [ ] Tester le rendu PDF avec plusieurs comportements (rédactionnel, perspectives, NR ordre chronologique, etc.) pour valider la cohérence avec l'aperçu écran
- [ ] Configurer les DNS de `eduqc-ia.com` pour pointer vers Vercel (sous-domaine `app.eduqc-ia.com` recommandé, racine `eduqc-ia.com` gardée pour un futur site vitrine sur Hostinger). Non bloquant pour le développement : l'URL Vercel par défaut suffit jusqu'à la mise en démo publique.

---

## Phase 5 — Quick wins UX restants

**Effort estimé** : 2 à 3 jours
**Adresse** : E3.1.2, E3.6.1, E3.5.4, E4.3, E4.5, A3.4.1, A3.3.1, A3.8.1
**Caractère** : actions individuelles indépendantes, peuvent être traitées dans n'importe quel ordre.

- [ ] Indicateur permanent « Brouillon · Sauvegardé il y a X sec. » (E3.1.2) — surcouche de `StepperNavFooter` ou nouveau composant dans le shell
- [ ] Ajouter le champ « Notes au correcteur » distinct du corrigé dans `Bloc5Redactionnel` (E3.6.1) — slice `state.bloc5.notesCorrecteur` à créer
- [ ] Avertissements « est-ce volontaire ? » pour document sans titre ou sans source à la validation Bloc 4 (E3.5.4) — modale groupée non-bloquante
- [ ] Signalement en temps réel du débordement « le dossier dépasse une page » (E4.3) — hook `useFicheOverflow` à créer
- [ ] Correction de la largeur des images iconographiques (E4.5) — `shouldPrintDocumentFullWidth` doit prendre en compte `imagePixelWidth` au lieu de retourner toujours `false` pour les iconographiques (seuil 315 px à confirmer)
- [ ] Mention explicite « Ce guidage s'affichera en italique sous la consigne en mode formatif. Il sera masqué automatiquement en mode sommatif. » sous le champ guidage (A3.4.1) — copy à ajouter dans `lib/ui/ui-copy.ts`
- [ ] Texte d'aide contextuel sur les champs désactivés du Bloc 2 (A3.3.1) — « Choisissez d'abord une opération intellectuelle » etc.
- [ ] Bouton final « Terminer » ou « Enregistrer dans la banque » à la dernière étape (A3.8.1) — soit transformer le bouton « Suivant » à l'index 6, soit décider que le bouton « Publier » permanent est suffisant

---

## Phase 6 — Refonte du picker de banque de documents

**Effort estimé** : 5 à 8 jours
**Adresse** : E3.5.2
**Caractère** : refonte complète d'un composant aujourd'hui à l'état de stub.

- [ ] Renommer `BanqueDocumentsStub` en `BanqueDocumentsPicker`
- [ ] Ajouter un filtre par type (textuel / iconographique)
- [ ] Ajouter un filtre par période historique
- [ ] Ajouter un filtre par source primaire / secondaire
- [ ] Ajouter un filtre par auteur (optionnel — à valider)
- [ ] Ajouter une prévisualisation des documents dans le picker (image ou extrait textuel)
- [ ] Ajouter l'indicateur « Utilisé dans N tâches » pour chaque document (requête comptage côté serveur)
- [ ] Ajouter la pagination si la banque grossit (cursor-based)
- [ ] Mettre à jour `listBankDocumentsPickerAction` pour supporter les filtres et la pagination

---

## Phase 7 — Décisions sur écarts restants et mise à jour finale de la spec

**Effort estimé** : 1 à 2 jours
**Adresse** : E3.3.1, E3.4.1, E3.4.2, E3.4.3, E3.6.4, E4.4
**Décisions prises** : faire remonter dans la spec les innovations à garder.

- [ ] Documenter dans la spec le verrouillage strict du `blueprintLocked` (E3.3.1) comme garde-fou produit
- [ ] Documenter dans la spec les variantes structurées du Bloc 3 (`Bloc3ModeleSouple`, `Bloc3TemplateStructure`, `Bloc3TemplatePur`) — référencer `docs/SPEC-TEMPLATES-CONSIGNE.md` ou intégrer l'essentiel
- [ ] Documenter dans la spec les variantes NR du Bloc 5 (Ordre chronologique, Ligne du temps, Avant/Après)
- [ ] Documenter dans la spec l'heuristique `shouldPrintDocumentFullWidth` pour la largeur des documents textuels (E4.4)
- [ ] **Décider** : le toggle « Référencer explicitement les documents » (E3.4.1) — à garder dans la spec ou à retirer ? Si retiré, supprimer la mention dans §3.4 et §7.1
- [ ] **Décider** : le panneau « Modèles fréquents » (E3.4.2) — abandonné puisque les templates structurés le remplacent avantageusement ? Si oui, retirer §3.4 panneau latéral et §6.3
- [ ] Mettre à jour `docs/specs/task-creation-wizard.md` pour refléter l'état réel et consolidé du build après toutes les phases précédentes
- [ ] Envisager un nouvel audit (`docs/audits/audit-YYYY-MM-DD-task-creation-wizard.md`) après la mise à jour de la spec pour vérifier l'alignement et mesurer la progression depuis le 8 avril 2026

---

## Statut global

**Démarrage** : 8 avril 2026 (date de l'audit fondateur)

| Phase                                                  | Avancement         |
| ------------------------------------------------------ | ------------------ |
| Phase 1 — Le grand ménage                              | 0 / 8 actions      |
| Phase 2 — Refonte modèle références + drag-and-drop    | 0 / 8 actions      |
| Phase 3 — Aperçu en onglets inline + Formatif/Sommatif | 0 / 6 actions      |
| Phase 4 — Pipeline PDF Vercel                          | 0 / 8 actions      |
| Phase 5 — Quick wins UX                                | 0 / 8 actions      |
| Phase 6 — Picker banque documents                      | 0 / 9 actions      |
| Phase 7 — Décisions et spec finale                     | 0 / 8 actions      |
| **Total**                                              | **0 / 55 actions** |

Mets à jour ce tableau au fur et à mesure que tu coches des actions dans les sections ci-dessus.

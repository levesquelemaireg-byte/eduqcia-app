# Checklist MVP v1 — ÉduQc.IA

**Créé le :** 13 avril 2026
**Mis à jour le :** 8 mai 2026
**Source :** `docs/specs/mvp-v1-audit-completude.md` + vérification codebase (lecture seule)
**Usage :** cocher `[x]` au fur et à mesure des livraisons. Un item coché = code mergé + fonctionnel.

### Règles concernant l'implémentation des lots

Avant le lancement de l'implémentation de chaque nouveau lot :

1. Lire `EDUQCIA-APP/CLAUDE.md`
2. Respecter à la lettre les règles qui s'y trouvent pour implémenter le lot

Après chaque lot complété, Claude doit **obligatoirement** :

1. **Commit** les changements avec un message descriptif (`fix(security): ...`, `feat(ux): ...`, etc.)
2. **Push** vers le remote
3. **Documenter** la livraison :
   - Mettre à jour le tableau d'avancement en bas de ce fichier
   - Ajouter une ligne en tête de `docs/BACKLOG-HISTORY.md`
   - Mettre à jour `docs/BACKLOG.md` §2 si un domaine change de statut

Un lot n'est **pas terminé** tant que ces 3 étapes ne sont pas faites.

---

## Lot 1 — Sécurité (bloquant prod)

- [x] **SEC-1** Appliquer `sanitize()` (DOMPurify) sur tous les `dangerouslySetInnerHTML` non couverts + sanitiser `sourceCitationDisplayHtml()` à la source
- [x] **SEC-2** Remplacer les 8 `select("*")` par des sélections explicites (documents ×4, tae ×2, vote_counts ×1, + type `hydrateRendererDocument` resserré)
- [x] **SEC-3** Ajouter les headers CSP + X-Frame-Options + X-Content-Type-Options + Referrer-Policy + Permissions-Policy dans `next.config.ts`

## Lot 2 — Quick wins (< 1h chacun)

- [x] **QW-1** Ajouter `revalidatePath` après `publishTacheAction` (C10)
- [x] **QW-2** Ajouter `revalidatePath` sur les actions manquantes (`tache-draft`, actions document)
- [x] **QW-3** `prefers-reduced-motion` dans `globals.css`
- [x] **QW-4** Skip-to-content link
- [x] **QW-5** Configurer `formats: ['image/avif']` dans `next.config.ts`

## Lot 3 — Loading / Error states

- [x] **LE-1** `loading.tsx` pour les routes principales (`dashboard`, `questions`, `documents`, `evaluations`, `bank`)
- [x] **LE-2** `error.tsx` pour les mêmes routes
- [x] **LE-3** Créer 2-3 composants Skeleton dans `components/ui/`
- [x] **LE-4** Ajouter `<Suspense>` boundaries sur dashboard + banque

## Lot 4 — CRUD manquant

- [x] **CRUD-1** Supprimer un document (C5) — action + guard FK `tae_documents` + bouton + modale
- [x] **CRUD-2** Supprimer une épreuve (C21) — action + cascade `evaluation_tae` + bouton + modale

## Lot 5 — Gestion du compte

- [x] **AUTH-1** Modifier son mot de passe (A4) — section profil collapsible + `updatePasswordAction` + `changePasswordSchema` + `ChangePasswordSection`
- [x] **AUTH-2** Afficher son profil (A5) — `/profile/[id]` Server Component, `fetchProfileOverview`, `ProfileHero`, `ProfileContributions` (3 onglets)
- [x] **AUTH-3** Modifier son profil (A6) — `ProfileEditSheet` (Side Sheet identité + professionnel), actions `profile-update-identity`/`profile-update-professional`, schemas Zod, cascade CSS/école, pivot tables `profile_niveaux`/`profile_disciplines`, `DeleteAccountSection` Loi 25
- [x] **AUTH-4** Profil public enseignant (D9) — même route `/profile/[id]` avec `isOwner` flag, refonte `/collaborateurs` (cards, recherche hybride, scroll infini)

## Lot 6 — Export PDF (livrable classe)

> **Prérequis obligatoire :** lire `docs/specs/print-engine.md` en entier avant d'attaquer PDF-1. Chaque item ci-dessous suppose que la spec v2.1 est le référentiel, pas cette checklist. En cas de doute, la spec gagne.

- [x] **PDF-1** D0 partiel — types `DonneesTache` + mapper `etatWizardVersTache` + tests unitaires
- [x] **PDF-2** D0 complet — wipe alpha (`DELETE FROM tae;`) + migration ~18 fichiers consommateurs
- [x] **PDF-3** D6 — en-tête d'épreuve 80px + `SectionPage` + constantes pagination
- [x] **PDF-4** D3 — transformation `epreuveVersPaginee` + renumérotation + tests unitaires
- [x] **PDF-5** D2 — pager isomorphe greedy first-fit + mesure offscreen
- [x] **PDF-6** D1 — route SSR `/apercu/[token]` + draft-token HMAC + Vercel KV
- [x] **PDF-7** Composants de rendu (`ApercuImpression`, `SectionPage`, sections, blocs)
- [x] **PDF-8** D4 — Puppeteer + preflight + `@sparticuz/chromium-min`
- [x] **PDF-9** Routes API `/api/impression/pdf` + `/api/impression/apercu-png`
- [x] **PDF-10** Tests visuels Playwright (3→8 golden payloads)
- [x] **PDF-11** D5 — carrousel PNG Embla + bannière invalidation empreinte
- [ ] **PDF-12** Validation terrain sur imprimantes réelles (phase de validation, pas de dev)
- [x] **PDF-13** Architecture 3 couches — `RenduImprimable` unifié, builders partagés, entry points tâche seule + document seul + épreuve, dispatch SSR/token-draft par `type`
- [ ] **PDF-14** Exposer le choix de mode d'impression pour l'épreuve (pas seulement formatif) et propager `mode` + `estCorrige` jusqu'au token draft

## Lot 7 — Finitions parcours création

- [ ] **CRE-1** Sélecteurs niveau/discipline dans le wizard épreuve (C17)
- [ ] **CRE-2** Filtres épreuves dans la banque — niveau, discipline (D3)
- [ ] **CRE-3** Filtre par auteur dans la banque (D4)
- [ ] **CRE-4** Banque épreuves : offrir un accès lecture pour non-auteur (pas seulement « Modifier »)

## Lot 8 — Dashboard

- [ ] **DASH-1** Enrichir widgets avec dernières créations (B2)
- [ ] **DASH-2** Widget « Brouillons en cours » avec liens directs (B4)

## Lot 9 — Favoris / Actions fiches détaillées

- [ ] **FAV-1** Action `toggle-favoris.ts` (insert/delete)
- [ ] **FAV-2** Query `get-user-favorites.ts`
- [ ] **FAV-3** Câbler le bouton épingler dans la fiche tâche (D6)
- [ ] **FAV-4** Widget dashboard « Mes favoris » avec liste (B3)
- [ ] **FAV-5** Résorber les `TODO` de la barre d'actions des vues détaillées (supprimer / ajouter à une épreuve / épingler)

## Lot 10 — Tests d'intégration

- [ ] **TEST-1** Tests intégration `publishTacheAction`
- [ ] **TEST-2** Tests intégration `saveWizardDraftAction`
- [ ] **TEST-3** Tests intégration `publishEpreuveAction`

---

## Écart avec l'audit du 12 avril 2026 (constat 8 mai 2026)

### Livré depuis l'audit (à ne plus considérer comme « restant »)

- [x] A4 — Modifier son mot de passe
- [x] A5/A6 — Accès + édition du profil
- [x] C5/C21 — Suppression document + suppression épreuve
- [x] D9 — Profil public enseignant
- [x] E1/E4 — Génération PDF serveur + téléchargement depuis l'UI
- [x] Transversal — loading/error, skeletons, Suspense, CSP, AVIF, `prefers-reduced-motion`, skip-link

### Restant confirmé

- [ ] C17, D3, D4, B2, B3, B4, D6
- [ ] Validation terrain impression (PDF-12)
- [ ] Exposition du mode d'impression côté épreuve (PDF-14)
- [ ] Tests d'intégration des actions critiques

---

## Plan d'exécution recommandé (à partir du 8 mai 2026)

### Phase 1 — Parcours épreuve et impression (priorité haute)

- [ ] **P1-1** `CRE-1` : ajouter niveau/discipline dans la composition épreuve
- [ ] **P1-2** `PDF-14` : brancher le mode d'impression épreuve (formatif / sommatif standard / corrigé)
- [ ] **P1-3** `CRE-4` : permettre la lecture d'une épreuve publiée depuis la banque (non-auteur)

### Phase 2 — Banque collaborative

- [ ] **P2-1** `CRE-2` : filtres niveau/discipline pour la banque épreuves
- [ ] **P2-2** `CRE-3` : filtre auteur dans la banque

### Phase 3 — Favoris et actions de fiches

- [ ] **P3-1** `FAV-1` + `FAV-2` : socle favoris (toggle + query)
- [ ] **P3-2** `FAV-3` + `FAV-4` : épinglage tâche + widget dashboard enrichi
- [ ] **P3-3** `FAV-5` : supprimer les TODO d'actions dans les vues détaillées

### Phase 4 — Dashboard et qualité

- [ ] **P4-1** `DASH-1` + `DASH-2` : dashboard actionnable (dernières créations + brouillons)
- [ ] **P4-2** `TEST-1` à `TEST-3` : tests d'intégration actions serveur
- [ ] **P4-3** `PDF-12` : validation terrain imprimantes réelles

---

## Résumé d'avancement

| Lot                    | Items  | Faits  | %       |
| ---------------------- | ------ | ------ | ------- |
| 1 — Sécurité           | 3      | 3      | 100%    |
| 2 — Quick wins         | 5      | 5      | 100%    |
| 3 — Loading/Error      | 4      | 4      | 100%    |
| 4 — CRUD manquant      | 2      | 2      | 100%    |
| 5 — Compte             | 4      | 4      | 100%    |
| 6 — Export PDF         | 14     | 12     | 86%     |
| 7 — Finitions création | 4      | 0      | 0%      |
| 8 — Dashboard          | 2      | 0      | 0%      |
| 9 — Favoris / fiches   | 5      | 0      | 0%      |
| 10 — Tests             | 3      | 0      | 0%      |
| **Total**              | **46** | **30** | **65%** |

---

## Notes

- Les lots sont ordonnés par priorité recommandée (sécurité d'abord, puis PDF car D0 est un refactor bloquant, puis polish UX)
- Les items marqués « coupe possible » dans `mvp-v1.md` encore pertinents : D4 (filtre auteur), D6/FAV (épinglage), mode impression avancé (PDF-14)
- Référence détaillée par item : `docs/specs/mvp-v1-audit-completude.md`

## Dette technique identifiée (hors lots)

- **DEBT-1** Extraire un helper partagé `isBloc4DataComplete(state)` et `isBloc4DataPublishable(state)` pour centraliser la logique 3-voies (perspectives groupé / moments / documents standard). Aujourd'hui dupliquée dans `cd-step-guards.ts`, `wizard-publish-guards.ts`, et `behaviours/redactionnel.ts` (`completionCriteria.bloc4` — pas encore branché dans le stepper mais incorrecte).

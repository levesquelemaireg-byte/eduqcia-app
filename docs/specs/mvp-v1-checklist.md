# Checklist MVP v1 — ÉduQc.IA

**Créé le :** 13 avril 2026
**Source :** `docs/specs/mvp-v1-audit-completude.md`
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

- [x] **QW-1** Ajouter `revalidatePath` après `publishTaeAction` (C10)
- [x] **QW-2** Ajouter `revalidatePath` sur les actions manquantes (`tae-draft`, actions document)
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
- [ ] **PDF-7** Composants de rendu (`ApercuImpression`, `SectionPage`, sections, blocs)
- [ ] **PDF-8** D4 — Puppeteer + preflight + `@sparticuz/chromium-min`
- [ ] **PDF-9** Routes API `/api/impression/pdf` + `/api/impression/apercu-png`
- [ ] **PDF-10** Tests visuels Playwright (3→8 golden payloads)
- [ ] **PDF-11** D5 — carrousel PNG Embla + bannière invalidation empreinte
- [ ] **PDF-12** Validation terrain sur imprimantes réelles (phase de validation, pas de dev)

## Lot 7 — Finitions parcours création

- [ ] **CRE-1** Sélecteurs niveau/discipline dans le wizard épreuve (C17)
- [ ] **CRE-2** Filtres épreuves dans la banque — niveau, discipline (D3)
- [ ] **CRE-3** Filtre par auteur dans la banque (D4)
- [ ] **CRE-4** Page de lecture épreuve read-only (D5 partiel)

## Lot 8 — Dashboard

- [ ] **DASH-1** Enrichir widgets avec dernières créations (B2)
- [ ] **DASH-2** Widget « Brouillons en cours » avec liens directs (B4)

## Lot 9 — Favoris / Épinglage

- [ ] **FAV-1** Action `toggle-favoris.ts` (insert/delete)
- [ ] **FAV-2** Query `get-user-favorites.ts`
- [ ] **FAV-3** Câbler le bouton épingler dans la fiche tâche (D6)
- [ ] **FAV-4** Widget dashboard « Mes favoris » avec liste (B3)

## Lot 10 — Tests d'intégration

- [ ] **TEST-1** Tests intégration `publishTaeAction`
- [ ] **TEST-2** Tests intégration `saveWizardDraftAction`
- [ ] **TEST-3** Tests intégration `publishEpreuveAction`

---

## Résumé d'avancement

| Lot                    | Items  | Faits  | %       |
| ---------------------- | ------ | ------ | ------- |
| 1 — Sécurité           | 3      | 3      | 100%    |
| 2 — Quick wins         | 5      | 5      | 100%    |
| 3 — Loading/Error      | 4      | 4      | 100%    |
| 4 — CRUD manquant      | 2      | 2      | 100%    |
| 5 — Compte             | 4      | 4      | 100%    |
| 6 — Export PDF         | 12     | 6      | 50%     |
| 7 — Finitions création | 4      | 0      | 0%      |
| 8 — Dashboard          | 2      | 0      | 0%      |
| 9 — Favoris            | 4      | 0      | 0%      |
| 10 — Tests             | 3      | 0      | 0%      |
| **Total**              | **43** | **24** | **56%** |

---

## Notes

- Les lots sont ordonnés par priorité recommandée (sécurité d'abord, puis PDF car D0 est un refactor bloquant, puis polish UX)
- Les items marqués « coupe possible » dans `mvp-v1.md` : PDF-5 (formatif), D4 (filtre auteur), D6/FAV (épinglage), D9/AUTH-4 (profil public)
- Référence détaillée par item : `docs/specs/mvp-v1-audit-completude.md`

## Dette technique identifiée (hors lots)

- **DEBT-1** Extraire un helper partagé `isBloc4DataComplete(state)` et `isBloc4DataPublishable(state)` pour centraliser la logique 3-voies (perspectives groupé / moments / documents standard). Aujourd'hui dupliquée dans `cd-step-guards.ts`, `wizard-publish-guards.ts`, et `behaviours/redactionnel.ts` (`completionCriteria.bloc4` — pas encore branché dans le stepper mais incorrecte).
